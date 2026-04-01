from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import math

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  UNIVERSAL GAME CORE ENGINE
#  The "Brain" — handles XP, Stats, Currency, Loot,
#  and Module registration for all game modules.
#  Any game module plugs into this via standard interface.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Stats System ──
STATS = {
    "wisdom": {"name": "Wisdom", "color": "#A855F7", "description": "Knowledge gained through exploration and discovery", "max_level": 100},
    "vitality": {"name": "Vitality", "color": "#22C55E", "description": "Life force from consistent practice and engagement", "max_level": 100},
    "resonance": {"name": "Resonance", "color": "#3B82F6", "description": "Harmonic alignment with the cosmic frequencies", "max_level": 100},
}

# ── XP Leveling Curve ──
def xp_for_level(level: int) -> int:
    """XP required to reach a given level. Quadratic curve."""
    return int(100 * (level ** 1.5))


def level_from_xp(total_xp: int) -> dict:
    """Compute level, progress, and next threshold from total XP."""
    level = 1
    while xp_for_level(level + 1) <= total_xp:
        level += 1
    current_threshold = xp_for_level(level)
    next_threshold = xp_for_level(level + 1)
    progress = total_xp - current_threshold
    needed = next_threshold - current_threshold
    return {
        "level": level,
        "total_xp": total_xp,
        "progress": progress,
        "needed": needed,
        "percentage": round((progress / needed) * 100, 1) if needed > 0 else 100,
    }


# ── Loot Rarity System ──
RARITY_TIERS = {
    "common": {"weight": 50, "color": "#9CA3AF", "dust_value": 5, "xp_value": 10},
    "uncommon": {"weight": 25, "color": "#22C55E", "dust_value": 15, "xp_value": 25},
    "rare": {"weight": 15, "color": "#3B82F6", "dust_value": 35, "xp_value": 50},
    "epic": {"weight": 7, "color": "#A855F7", "dust_value": 75, "xp_value": 100},
    "legendary": {"weight": 2.5, "color": "#FCD34D", "dust_value": 150, "xp_value": 200},
    "mythic": {"weight": 0.5, "color": "#EF4444", "dust_value": 500, "xp_value": 500},
}

# ── Registered Game Modules ──
GAME_MODULES = {}


def register_module(module_id: str, config: dict):
    """Register a game module with the core engine."""
    GAME_MODULES[module_id] = {
        "id": module_id,
        "name": config.get("name", module_id),
        "description": config.get("description", ""),
        "icon": config.get("icon", "gamepad"),
        "color": config.get("color", "#A855F7"),
        "stat_mapping": config.get("stat_mapping", {}),
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }
    logger.info(f"Game module registered: {module_id}")


# ── Core Service Functions (called by any module) ──

async def award_xp(user_id: str, amount: int, source: str, multipliers: dict = None):
    """Award XP to a user with optional multipliers. Returns updated level info."""
    total_mult = 1.0
    if multipliers:
        for _, val in multipliers.items():
            total_mult *= val

    final_xp = int(amount * total_mult)

    await db.rpg_characters.update_one(
        {"user_id": user_id}, {"$inc": {"xp": final_xp}}, upsert=True,
    )

    # Log transaction
    await db.game_core_transactions.insert_one({
        "user_id": user_id,
        "type": "xp",
        "amount": final_xp,
        "base_amount": amount,
        "multipliers": multipliers or {},
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    char = await db.rpg_characters.find_one({"user_id": user_id}, {"_id": 0, "xp": 1})
    return level_from_xp(char.get("xp", 0))


async def award_currency(user_id: str, currency_type: str, amount: int, source: str):
    """Award currency (cosmic_dust or stardust_shards)."""
    field = currency_type if currency_type in ("cosmic_dust", "stardust_shards") else "cosmic_dust"

    await db.rpg_currencies.update_one(
        {"user_id": user_id}, {"$inc": {field: amount}}, upsert=True,
    )

    await db.game_core_transactions.insert_one({
        "user_id": user_id,
        "type": "currency",
        "currency": field,
        "amount": amount,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    return currencies or {}


async def modify_stat(user_id: str, stat: str, delta: int, source: str):
    """Modify a user stat (wisdom, vitality, resonance)."""
    if stat not in STATS:
        return None

    await db.game_core_stats.update_one(
        {"user_id": user_id},
        {"$inc": {f"stats.{stat}": delta}},
        upsert=True,
    )

    # Log
    await db.game_core_transactions.insert_one({
        "user_id": user_id,
        "type": "stat",
        "stat": stat,
        "delta": delta,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})
    stats = doc.get("stats", {}) if doc else {}
    return {s: stats.get(s, 0) for s in STATS}


async def roll_loot(rarity_modifiers: dict = None, seed: int = None) -> str:
    """Roll a loot rarity based on weighted probabilities with modifiers."""
    import random
    rng = random.Random(seed) if seed else random.Random()

    weights = {}
    for rarity, info in RARITY_TIERS.items():
        w = info["weight"]
        if rarity_modifiers:
            w *= rarity_modifiers.get(rarity, 1.0)
        weights[rarity] = w

    total = sum(weights.values())
    roll = rng.uniform(0, total)
    cumulative = 0
    for rarity, w in weights.items():
        cumulative += w
        if roll <= cumulative:
            return rarity
    return "common"


async def get_user_stats(user_id: str) -> dict:
    """Get full user game stats."""
    char = await db.rpg_characters.find_one({"user_id": user_id}, {"_id": 0, "xp": 1})
    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})

    total_xp = char.get("xp", 0) if char else 0
    stats = stats_doc.get("stats", {}) if stats_doc else {}

    return {
        "level": level_from_xp(total_xp),
        "currencies": {
            "cosmic_dust": (currencies or {}).get("cosmic_dust", 0),
            "stardust_shards": (currencies or {}).get("stardust_shards", 0),
        },
        "stats": {
            sid: {
                "value": stats.get(sid, 0),
                **sdef,
            }
            for sid, sdef in STATS.items()
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/game-core/stats")
async def get_stats(user=Depends(get_current_user)):
    """Get user's global game stats, level, and currencies."""
    return await get_user_stats(user["id"])


@router.get("/game-core/modules")
async def get_modules(user=Depends(get_current_user)):
    """Get registered game modules."""
    return {"modules": list(GAME_MODULES.values())}


@router.get("/game-core/transactions")
async def get_transactions(user=Depends(get_current_user)):
    """Get recent game transactions (XP, currency, stat changes)."""
    txns = await db.game_core_transactions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    return {"transactions": txns}

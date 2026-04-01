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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  5-LAYER UNIVERSE STRUCTURE
#  Entropy scales from Terrestrial (clear) → Void (max distortion)
#  Each layer gates loot quality and visual intensity.
#  User's resonance score determines accessible layers.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNIVERSE_LAYERS = {
    "terrestrial": {
        "id": "terrestrial",
        "name": "Terrestrial",
        "subtitle": "The Grounded World",
        "description": "Physical realm of stability. Clear vision, basic rewards.",
        "color": "#22C55E",
        "order": 0,
        "entropy": 0.0,       # no distortion
        "resonance_required": 0,
        "loot_multiplier": 1.0,
        "xp_multiplier": 1.0,
        "rarity_shift": 0,     # no rarity upgrade
        "tint": "rgba(34,197,94,0.04)",
        "blur": 0,
        "glow_intensity": 0.3,
    },
    "ethereal": {
        "id": "ethereal",
        "name": "Ethereal",
        "subtitle": "The Luminous Veil",
        "description": "Subtle energy realm. Slight shimmer, enhanced rare drops.",
        "color": "#A855F7",
        "order": 1,
        "entropy": 0.15,
        "resonance_required": 5,
        "loot_multiplier": 1.3,
        "xp_multiplier": 1.2,
        "rarity_shift": 1,     # common→uncommon chance
        "tint": "rgba(168,85,247,0.06)",
        "blur": 0.3,
        "glow_intensity": 0.5,
    },
    "astral": {
        "id": "astral",
        "name": "Astral",
        "subtitle": "The Dream Plane",
        "description": "Dream-like realm of vivid color. Strong distortions, epic loot possible.",
        "color": "#3B82F6",
        "order": 2,
        "entropy": 0.4,
        "resonance_required": 15,
        "loot_multiplier": 1.7,
        "xp_multiplier": 1.5,
        "rarity_shift": 2,     # common→rare chance
        "tint": "rgba(59,130,246,0.08)",
        "blur": 1.0,
        "glow_intensity": 0.7,
    },
    "void": {
        "id": "void",
        "name": "Void",
        "subtitle": "The Shadow Expanse",
        "description": "Realm of pure potential. Heavy distortions, legendary drops. Highest entropy.",
        "color": "#EF4444",
        "order": 3,
        "entropy": 0.75,
        "resonance_required": 30,
        "loot_multiplier": 2.5,
        "xp_multiplier": 2.0,
        "rarity_shift": 3,     # common→epic chance
        "tint": "rgba(239,68,68,0.10)",
        "blur": 2.0,
        "glow_intensity": 0.9,
    },
    "nexus": {
        "id": "nexus",
        "name": "Nexus",
        "subtitle": "The Convergence",
        "description": "Where all elements unite. Transcendent clarity beyond entropy. Mythic drops.",
        "color": "#FCD34D",
        "order": 4,
        "entropy": 0.0,       # beyond entropy — transcendent
        "resonance_required": 50,
        "loot_multiplier": 3.0,
        "xp_multiplier": 3.0,
        "rarity_shift": 4,     # massive rarity boost
        "tint": "rgba(252,211,77,0.08)",
        "blur": 0,
        "glow_intensity": 1.0,
    },
}

LAYER_ORDER = ["terrestrial", "ethereal", "astral", "void", "nexus"]


def compute_active_layer(resonance_stat: int) -> dict:
    """Determine which universe layer is active based on resonance stat."""
    active = "terrestrial"
    for lid in LAYER_ORDER:
        layer = UNIVERSE_LAYERS[lid]
        if resonance_stat >= layer["resonance_required"]:
            active = lid
    layer_data = UNIVERSE_LAYERS[active]
    unlocked = [lid for lid in LAYER_ORDER if resonance_stat >= UNIVERSE_LAYERS[lid]["resonance_required"]]
    return {
        "active_layer": active,
        "layer": layer_data,
        "unlocked_layers": unlocked,
        "all_layers": [
            {
                "id": lid,
                "name": UNIVERSE_LAYERS[lid]["name"],
                "subtitle": UNIVERSE_LAYERS[lid]["subtitle"],
                "color": UNIVERSE_LAYERS[lid]["color"],
                "order": UNIVERSE_LAYERS[lid]["order"],
                "resonance_required": UNIVERSE_LAYERS[lid]["resonance_required"],
                "unlocked": lid in unlocked,
                "active": lid == active,
                "entropy": UNIVERSE_LAYERS[lid]["entropy"],
                "loot_multiplier": UNIVERSE_LAYERS[lid]["loot_multiplier"],
            }
            for lid in LAYER_ORDER
        ],
    }


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

    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
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
        "layer": compute_active_layer(stats.get("resonance", 0)),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/game-core/stats")
async def get_stats(user=Depends(get_current_user)):
    """Get user's global game stats, level, currencies, and active universe layer."""
    return await get_user_stats(user["id"])


@router.get("/game-core/layer")
async def get_layer(user=Depends(get_current_user)):
    """Get user's current universe layer based on Resonance stat."""
    stats_doc = await db.game_core_stats.find_one({"user_id": user["id"]}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    return compute_active_layer(resonance)


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


@router.post("/game-core/commit-reward")
async def commit_reward(data: dict = Body(...), user=Depends(get_current_user)):
    """Soul-to-Game Bridge: Commit a reward from any game module to the Core.
    
    This is the universal entry point. Any game module sends:
      { module_id, xp, dust, stat, stat_delta, element }
    The Core handles XP leveling, currency, stat updates, and Nexus feedback.
    Future modules (Elemental Crafting, etc.) call this same endpoint.
    """
    user_id = user["id"]
    module_id = data.get("module_id", "unknown")
    
    if module_id not in GAME_MODULES and module_id != "unknown":
        raise HTTPException(400, f"Unknown game module: {module_id}")
    
    results = {}
    source = f"{module_id}:commit"
    
    # XP award
    xp_amount = data.get("xp", 0)
    if xp_amount > 0:
        results["level"] = await award_xp(user_id, xp_amount, source)
    
    # Currency award
    dust_amount = data.get("dust", 0)
    if dust_amount > 0:
        results["currencies"] = await award_currency(user_id, "cosmic_dust", dust_amount, source)
    
    # Stat modification
    stat = data.get("stat")
    stat_delta = data.get("stat_delta", 0)
    if stat and stat_delta:
        results["stats"] = await modify_stat(user_id, stat, stat_delta, source)
    
    # Nexus element modifier feedback
    element = data.get("element")
    if element:
        await db.nexus_decoded_modifiers.update_one(
            {"user_id": user_id},
            {"$inc": {f"modifiers.{element}": 1}},
            upsert=True,
        )
        results["nexus_modifier"] = f"+1 {element}"
    
    return {"status": "committed", "module": module_id, "results": results}

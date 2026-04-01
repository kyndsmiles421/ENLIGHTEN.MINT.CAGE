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

# ── Nexus Passes — Temporary Layer Upgrades ──
NEXUS_PASSES = {
    "astral_pass": {
        "id": "astral_pass",
        "name": "Astral Pass",
        "description": "1 hour in the Dream Plane. Enhanced rare drops.",
        "target_layer": "astral",
        "duration_minutes": 60,
        "cost_dust": 200,
        "color": "#3B82F6",
        "icon": "sparkles",
    },
    "void_pass": {
        "id": "void_pass",
        "name": "Void Pass",
        "description": "1 hour in the Shadow Expanse. Legendary drops possible.",
        "target_layer": "void",
        "duration_minutes": 60,
        "cost_dust": 500,
        "color": "#EF4444",
        "icon": "flame",
    },
    "nexus_pass": {
        "id": "nexus_pass",
        "name": "Nexus Pass",
        "description": "30 min of Convergence. Mythic drops. Transcendent clarity.",
        "target_layer": "nexus",
        "duration_minutes": 30,
        "cost_dust": 1200,
        "color": "#FCD34D",
        "icon": "crown",
    },
}


async def get_active_pass(user_id: str) -> dict | None:
    """Check if user has an active (non-expired) Nexus Pass."""
    now = datetime.now(timezone.utc).isoformat()
    active = await db.nexus_passes.find_one(
        {"user_id": user_id, "expires_at": {"$gt": now}, "active": True},
        {"_id": 0, "user_id": 0},
    )
    return active


def compute_active_layer(resonance_stat: int, active_pass: dict = None) -> dict:
    """Determine which universe layer is active based on resonance stat + active pass."""
    # Natural layer from resonance
    natural = "terrestrial"
    for lid in LAYER_ORDER:
        layer = UNIVERSE_LAYERS[lid]
        if resonance_stat >= layer["resonance_required"]:
            natural = lid

    # Pass override — if pass grants a higher layer, use it
    active = natural
    pass_info = None
    if active_pass:
        pass_layer = active_pass.get("target_layer", "terrestrial")
        if LAYER_ORDER.index(pass_layer) > LAYER_ORDER.index(natural):
            active = pass_layer
            pass_info = {
                "pass_id": active_pass.get("pass_id"),
                "pass_name": active_pass.get("pass_name"),
                "expires_at": active_pass.get("expires_at"),
                "target_layer": pass_layer,
            }

    layer_data = UNIVERSE_LAYERS[active]
    unlocked = [lid for lid in LAYER_ORDER if resonance_stat >= UNIVERSE_LAYERS[lid]["resonance_required"]]
    # Pass also unlocks its target layer
    if pass_info and active not in unlocked:
        unlocked.append(active)

    return {
        "active_layer": active,
        "natural_layer": natural,
        "layer": layer_data,
        "unlocked_layers": unlocked,
        "active_pass": pass_info,
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
    """Get full user game stats with active pass considered."""
    char = await db.rpg_characters.find_one({"user_id": user_id}, {"_id": 0, "xp": 1})
    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})

    total_xp = char.get("xp", 0) if char else 0
    stats = stats_doc.get("stats", {}) if stats_doc else {}

    # Check for active pass
    active_pass = await get_active_pass(user_id)

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
        "layer": compute_active_layer(stats.get("resonance", 0), active_pass),
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
    """Get user's current universe layer based on Resonance stat + active pass."""
    stats_doc = await db.game_core_stats.find_one({"user_id": user["id"]}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    active_pass = await get_active_pass(user["id"])
    return compute_active_layer(resonance, active_pass)


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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  NEXUS PASSES — Temporary Layer Upgrades
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/game-core/passes")
async def get_passes(user=Depends(get_current_user)):
    """Get available Nexus Passes and active pass status."""
    user_id = user["id"]
    active_pass = await get_active_pass(user_id)

    # Get user's dust balance
    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    dust = (currencies or {}).get("cosmic_dust", 0)

    # Natural layer
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    natural = "terrestrial"
    for lid in LAYER_ORDER:
        if resonance >= UNIVERSE_LAYERS[lid]["resonance_required"]:
            natural = lid

    # Build pass options (only show passes above natural layer)
    available = []
    for pid, pdata in NEXUS_PASSES.items():
        target_order = LAYER_ORDER.index(pdata["target_layer"])
        natural_order = LAYER_ORDER.index(natural)
        if target_order > natural_order:
            available.append({
                **pdata,
                "can_afford": dust >= pdata["cost_dust"],
                "already_unlocked": False,
            })

    # Purchase history
    history = await db.nexus_passes.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    ).sort("purchased_at", -1).to_list(10)

    return {
        "available_passes": available,
        "active_pass": active_pass,
        "cosmic_dust": dust,
        "natural_layer": natural,
        "purchase_history": history,
    }


@router.post("/game-core/passes/purchase")
async def purchase_pass(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a Nexus Pass with Cosmic Dust."""
    user_id = user["id"]
    pass_id = data.get("pass_id")

    if pass_id not in NEXUS_PASSES:
        raise HTTPException(400, f"Unknown pass: {pass_id}")

    pass_def = NEXUS_PASSES[pass_id]

    # Check for existing active pass
    existing = await get_active_pass(user_id)
    if existing:
        raise HTTPException(400, "You already have an active pass. Wait for it to expire.")

    # Check balance
    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    dust = (currencies or {}).get("cosmic_dust", 0)

    if dust < pass_def["cost_dust"]:
        raise HTTPException(400, f"Insufficient Cosmic Dust. Need {pass_def['cost_dust']}, have {dust}.")

    # Check if pass is above natural layer
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    natural = "terrestrial"
    for lid in LAYER_ORDER:
        if resonance >= UNIVERSE_LAYERS[lid]["resonance_required"]:
            natural = lid
    if LAYER_ORDER.index(pass_def["target_layer"]) <= LAYER_ORDER.index(natural):
        raise HTTPException(400, "You already have natural access to this layer.")

    # Deduct dust
    await db.rpg_currencies.update_one(
        {"user_id": user_id}, {"$inc": {"cosmic_dust": -pass_def["cost_dust"]}}
    )

    # Create pass
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=pass_def["duration_minutes"])

    await db.nexus_passes.insert_one({
        "user_id": user_id,
        "pass_id": pass_id,
        "pass_name": pass_def["name"],
        "target_layer": pass_def["target_layer"],
        "cost_paid": pass_def["cost_dust"],
        "duration_minutes": pass_def["duration_minutes"],
        "purchased_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "active": True,
    })

    # Log transaction
    await db.game_core_transactions.insert_one({
        "user_id": user_id,
        "type": "pass_purchase",
        "pass_id": pass_id,
        "cost": pass_def["cost_dust"],
        "target_layer": pass_def["target_layer"],
        "expires_at": expires.isoformat(),
        "timestamp": now.isoformat(),
    })

    layer_info = compute_active_layer(resonance, {
        "pass_id": pass_id,
        "pass_name": pass_def["name"],
        "target_layer": pass_def["target_layer"],
        "expires_at": expires.isoformat(),
    })

    return {
        "purchased": True,
        "pass": {
            "id": pass_id,
            "name": pass_def["name"],
            "target_layer": pass_def["target_layer"],
            "expires_at": expires.isoformat(),
            "duration_minutes": pass_def["duration_minutes"],
        },
        "dust_remaining": dust - pass_def["cost_dust"],
        "layer": layer_info,
    }

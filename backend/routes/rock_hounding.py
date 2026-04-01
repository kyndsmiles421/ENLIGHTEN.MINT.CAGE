from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.game_core import (
    register_module, award_xp, award_currency, modify_stat,
    roll_loot, RARITY_TIERS
)
from routes.nexus import compute_elemental_balance, ELEMENTS, ELEMENT_FREQUENCIES
from datetime import datetime, timezone
import random
import hashlib

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ROCK HOUNDING MODULE — First Game Module
#  Procedural mines tied to Nexus elements.
#  Click-to-mine → discover specimens → feed Core.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Register with Core on import
register_module("rock_hounding", {
    "name": "Rock Hounding",
    "description": "Explore procedural mines and discover rare minerals tied to your elemental balance",
    "icon": "pickaxe",
    "color": "#F59E0B",
    "stat_mapping": {"wisdom": "appraise", "vitality": "mine", "resonance": "attune"},
})

# ── Mine Biomes ──
MINE_BIOMES = {
    "wood": {
        "name": "Verdant Cavern",
        "description": "Living stone walls pulse with bioluminescent moss",
        "color": "#22C55E", "ambient": "#14532D",
        "atmosphere": "humid and alive",
    },
    "fire": {
        "name": "Magma Rift",
        "description": "Molten veins carve through obsidian walls",
        "color": "#EF4444", "ambient": "#7F1D1D",
        "atmosphere": "scorching and volatile",
    },
    "earth": {
        "name": "Ancient Stratum",
        "description": "Layered sediment reveals millions of years of history",
        "color": "#F59E0B", "ambient": "#78350F",
        "atmosphere": "still and weighty",
    },
    "metal": {
        "name": "Crystal Geode",
        "description": "Prismatic formations refract light into rainbow corridors",
        "color": "#94A3B8", "ambient": "#334155",
        "atmosphere": "sharp and resonant",
    },
    "water": {
        "name": "Subterranean Spring",
        "description": "Underground rivers have carved cathedral-sized chambers",
        "color": "#3B82F6", "ambient": "#1E3A5F",
        "atmosphere": "cool and echoing",
    },
}

# ── Specimens: 30+ real geological specimens mapped to elements ──
SPECIMENS = [
    # Wood specimens
    {"id": "peridot", "name": "Peridot", "element": "wood", "rarity_base": "uncommon", "description": "Olive-green gem of growth and renewal", "mohs": 6.5, "stat": "vitality", "stat_value": 2},
    {"id": "emerald", "name": "Emerald", "element": "wood", "rarity_base": "epic", "description": "Deep green beryl radiating life force", "mohs": 7.5, "stat": "wisdom", "stat_value": 5},
    {"id": "jade", "name": "Jade", "element": "wood", "rarity_base": "rare", "description": "Stone of harmony and balance", "mohs": 6, "stat": "resonance", "stat_value": 3},
    {"id": "malachite", "name": "Malachite", "element": "wood", "rarity_base": "uncommon", "description": "Banded green copper mineral of transformation", "mohs": 3.5, "stat": "vitality", "stat_value": 2},
    {"id": "moss_agate", "name": "Moss Agate", "element": "wood", "rarity_base": "common", "description": "Translucent chalcedony with plant-like inclusions", "mohs": 6.5, "stat": "vitality", "stat_value": 1},
    {"id": "green_tourmaline", "name": "Green Tourmaline", "element": "wood", "rarity_base": "rare", "description": "Electric green crystal of the heart", "mohs": 7, "stat": "resonance", "stat_value": 3},
    # Fire specimens
    {"id": "ruby", "name": "Ruby", "element": "fire", "rarity_base": "epic", "description": "Blood-red corundum of passion and power", "mohs": 9, "stat": "vitality", "stat_value": 5},
    {"id": "garnet", "name": "Garnet", "element": "fire", "rarity_base": "uncommon", "description": "Deep crimson stone of regeneration", "mohs": 7, "stat": "vitality", "stat_value": 2},
    {"id": "carnelian", "name": "Carnelian", "element": "fire", "rarity_base": "common", "description": "Orange-red chalcedony of courage", "mohs": 7, "stat": "vitality", "stat_value": 1},
    {"id": "fire_opal", "name": "Fire Opal", "element": "fire", "rarity_base": "rare", "description": "Fiery play of color within transparent opal", "mohs": 5.5, "stat": "wisdom", "stat_value": 3},
    {"id": "sunstone", "name": "Sunstone", "element": "fire", "rarity_base": "uncommon", "description": "Feldspar with aventurescent shimmer", "mohs": 6, "stat": "resonance", "stat_value": 2},
    {"id": "obsidian", "name": "Obsidian", "element": "fire", "rarity_base": "common", "description": "Volcanic glass forged in primordial fire", "mohs": 5, "stat": "wisdom", "stat_value": 1},
    # Earth specimens
    {"id": "amber", "name": "Amber", "element": "earth", "rarity_base": "rare", "description": "Fossilized tree resin preserving ancient life", "mohs": 2, "stat": "wisdom", "stat_value": 4},
    {"id": "tigers_eye", "name": "Tiger's Eye", "element": "earth", "rarity_base": "uncommon", "description": "Chatoyant quartz of grounded focus", "mohs": 7, "stat": "resonance", "stat_value": 2},
    {"id": "jasper", "name": "Red Jasper", "element": "earth", "rarity_base": "common", "description": "Stone of endurance and stability", "mohs": 6.5, "stat": "vitality", "stat_value": 1},
    {"id": "petrified_wood", "name": "Petrified Wood", "element": "earth", "rarity_base": "uncommon", "description": "Ancient wood transformed to stone over millennia", "mohs": 7, "stat": "wisdom", "stat_value": 2},
    {"id": "topaz", "name": "Imperial Topaz", "element": "earth", "rarity_base": "epic", "description": "Golden-orange gem of manifestation", "mohs": 8, "stat": "resonance", "stat_value": 5},
    {"id": "smoky_quartz", "name": "Smoky Quartz", "element": "earth", "rarity_base": "common", "description": "Grounding stone that transmutes negative energy", "mohs": 7, "stat": "vitality", "stat_value": 1},
    # Metal specimens
    {"id": "diamond", "name": "Diamond", "element": "metal", "rarity_base": "legendary", "description": "The ultimate clarity — pure crystallized carbon", "mohs": 10, "stat": "wisdom", "stat_value": 8},
    {"id": "clear_quartz", "name": "Clear Quartz", "element": "metal", "rarity_base": "common", "description": "Master healer and energy amplifier", "mohs": 7, "stat": "resonance", "stat_value": 1},
    {"id": "pyrite", "name": "Pyrite", "element": "metal", "rarity_base": "uncommon", "description": "Iron sulfide with metallic luster — Fool's Gold", "mohs": 6, "stat": "vitality", "stat_value": 2},
    {"id": "hematite", "name": "Hematite", "element": "metal", "rarity_base": "uncommon", "description": "Iron oxide with mirror-like sheen", "mohs": 5.5, "stat": "resonance", "stat_value": 2},
    {"id": "platinum_nugget", "name": "Platinum Nugget", "element": "metal", "rarity_base": "mythic", "description": "Noble metal of the highest order — cosmic conductor", "mohs": 4, "stat": "resonance", "stat_value": 10},
    {"id": "silver_ore", "name": "Native Silver", "element": "metal", "rarity_base": "rare", "description": "Lunar metal of intuition and reflection", "mohs": 2.5, "stat": "wisdom", "stat_value": 3},
    # Water specimens
    {"id": "aquamarine", "name": "Aquamarine", "element": "water", "rarity_base": "rare", "description": "Sea-blue beryl of courage and communication", "mohs": 7.5, "stat": "resonance", "stat_value": 3},
    {"id": "moonstone", "name": "Moonstone", "element": "water", "rarity_base": "uncommon", "description": "Ethereal adularescence reflecting inner truth", "mohs": 6, "stat": "wisdom", "stat_value": 2},
    {"id": "lapis_lazuli", "name": "Lapis Lazuli", "element": "water", "rarity_base": "rare", "description": "Royal blue stone of the ancient sages", "mohs": 5, "stat": "wisdom", "stat_value": 4},
    {"id": "sapphire", "name": "Star Sapphire", "element": "water", "rarity_base": "epic", "description": "Six-rayed star trapped in deep blue corundum", "mohs": 9, "stat": "resonance", "stat_value": 5},
    {"id": "pearl", "name": "Pearl", "element": "water", "rarity_base": "uncommon", "description": "Organic gem born from patience and irritation", "mohs": 2.5, "stat": "wisdom", "stat_value": 2},
    {"id": "larimar", "name": "Larimar", "element": "water", "rarity_base": "legendary", "description": "Caribbean volcanic stone — the Atlantis Stone", "mohs": 4.5, "stat": "resonance", "stat_value": 7},
]

ENERGY_MAX = 20
ENERGY_REGEN_MINUTES = 30  # 1 energy every 30 min
DEPTH_LEVELS = 5


def _mine_seed(user_id: str, date: str) -> int:
    return int(hashlib.sha256(f"{user_id}:mine:{date}".encode()).hexdigest()[:8], 16)


def _compute_energy(mine_doc: dict) -> dict:
    """Compute current energy with time-based regen."""
    if not mine_doc:
        return {"current": ENERGY_MAX, "max": ENERGY_MAX, "regen_at": None}

    energy = mine_doc.get("energy", ENERGY_MAX)
    last_mine = mine_doc.get("last_mine_at")

    if last_mine and energy < ENERGY_MAX:
        try:
            last_dt = datetime.fromisoformat(last_mine)
            if last_dt.tzinfo is None:
                last_dt = last_dt.replace(tzinfo=timezone.utc)
            elapsed = (datetime.now(timezone.utc) - last_dt).total_seconds()
            regen = int(elapsed / (ENERGY_REGEN_MINUTES * 60))
            energy = min(ENERGY_MAX, energy + regen)
        except Exception:
            pass

    next_regen = None
    if energy < ENERGY_MAX:
        next_regen = ENERGY_REGEN_MINUTES

    return {"current": energy, "max": ENERGY_MAX, "regen_minutes": next_regen}


async def _get_or_create_mine(user_id: str, element_bias: str = None) -> dict:
    """Get the user's current mine session or create one."""
    mine = await db.rock_hounding_mines.find_one(
        {"user_id": user_id, "active": True}, {"_id": 0}
    )
    if mine:
        mine["energy_info"] = _compute_energy(mine)
        return mine

    # Determine biome from Nexus state
    balance = await compute_elemental_balance(user_id)
    dominant_el = element_bias
    if not dominant_el:
        max_pct = 0
        for eid, edata in balance["elements"].items():
            pct = edata.get("percentage", 20)
            if pct > max_pct:
                max_pct = pct
                dominant_el = eid
    if not dominant_el:
        dominant_el = "earth"

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    seed = _mine_seed(user_id, today)
    biome = MINE_BIOMES.get(dominant_el, MINE_BIOMES["earth"])
    harmony = balance["harmony_score"]

    # Build depth layers
    rng = random.Random(seed)
    depths = []
    for d in range(1, DEPTH_LEVELS + 1):
        # Deeper = rarer finds, more energy cost
        available_specimens = [s for s in SPECIMENS if s["element"] == dominant_el]
        # Add cross-element specimens at deeper levels
        if d >= 3:
            cross_el = ELEMENTS[dominant_el].get("generates", "water")
            available_specimens += [s for s in SPECIMENS if s["element"] == cross_el]
        if d >= 4:
            available_specimens += [s for s in SPECIMENS if s["element"] not in (dominant_el,)]

        specimen_ids = [s["id"] for s in available_specimens]
        rng.shuffle(specimen_ids)

        depths.append({
            "depth": d,
            "name": f"Depth {d} — {'Surface' if d == 1 else 'Shallow' if d == 2 else 'Mid-Vein' if d == 3 else 'Deep Core' if d == 4 else 'Primordial Layer'}",
            "energy_cost": d,
            "rarity_boost": 1.0 + (d - 1) * 0.3,
            "specimen_pool": specimen_ids[:6],
            "unlocked": d <= 1 + (harmony // 25),
        })

    mine = {
        "user_id": user_id,
        "active": True,
        "biome": {**biome, "element": dominant_el},
        "depths": depths,
        "current_depth": 1,
        "energy": ENERGY_MAX,
        "harmony_at_start": harmony,
        "total_mines": 0,
        "specimens_found": [],
        "seed": seed,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.rock_hounding_mines.insert_one({**mine})
    mine["energy_info"] = _compute_energy(mine)
    del mine["user_id"]
    return mine


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/rock-hounding/mine")
async def get_mine(user=Depends(get_current_user)):
    """Get the user's current mine session with active universe layer."""
    mine = await _get_or_create_mine(user["id"])
    # Attach layer info
    from routes.game_core import compute_active_layer
    stats_doc = await db.game_core_stats.find_one({"user_id": user["id"]}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    mine["layer"] = compute_active_layer(resonance)
    return mine


@router.post("/rock-hounding/mine-action")
async def mine_action(data: dict = Body(...), user=Depends(get_current_user)):
    """Execute a mine action — click-to-mine at a specific depth."""
    user_id = user["id"]
    depth = data.get("depth", 1)

    mine = await db.rock_hounding_mines.find_one(
        {"user_id": user_id, "active": True}, {"_id": 0}
    )
    if not mine:
        raise HTTPException(404, "No active mine session")

    # Check energy
    energy_info = _compute_energy(mine)
    energy = energy_info["current"]

    depths = mine.get("depths", [])
    depth_data = None
    for d in depths:
        if d["depth"] == depth:
            depth_data = d
            break
    if not depth_data:
        raise HTTPException(400, "Invalid depth level")

    if not depth_data.get("unlocked"):
        raise HTTPException(400, "This depth is locked. Raise your Harmony Score.")

    cost = depth_data["energy_cost"]
    if energy < cost:
        raise HTTPException(400, f"Not enough energy. Need {cost}, have {energy}")

    # Roll for specimen
    rarity_boost = depth_data["rarity_boost"]
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]

    # ── Layer multipliers ──
    from routes.game_core import compute_active_layer
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    layer_info = compute_active_layer(resonance)
    active_layer = layer_info["layer"]
    layer_loot_mult = active_layer.get("loot_multiplier", 1.0)
    layer_xp_mult = active_layer.get("xp_multiplier", 1.0)
    layer_rarity_shift = active_layer.get("rarity_shift", 0)

    # Harmony improves quality, layer amplifies further
    harmony_mult = 1.0 + (harmony / 200)
    rarity_mods = {
        "uncommon": harmony_mult * (1 + layer_rarity_shift * 0.2),
        "rare": harmony_mult * rarity_boost * (1 + layer_rarity_shift * 0.3),
        "epic": rarity_boost * 1.5 * (1 + layer_rarity_shift * 0.4),
        "legendary": rarity_boost * 2.0 * (1 + layer_rarity_shift * 0.5),
        "mythic": rarity_boost * 3.0 * (1 + layer_rarity_shift * 0.6),
    }

    rarity = await roll_loot(rarity_mods, seed=mine.get("seed", 0) + mine.get("total_mines", 0))

    # Pick a specimen from the depth's pool at the rolled rarity
    pool = depth_data.get("specimen_pool", [])
    candidates = [s for s in SPECIMENS if s["id"] in pool]

    # Filter by rarity proximity
    rarity_order = ["common", "uncommon", "rare", "epic", "legendary", "mythic"]
    roll_idx = rarity_order.index(rarity)

    # Find closest match
    found = None
    for offset in [0, -1, 1, -2, 2]:
        target_idx = max(0, min(len(rarity_order) - 1, roll_idx + offset))
        target_rarity = rarity_order[target_idx]
        matches = [s for s in candidates if s["rarity_base"] == target_rarity]
        if matches:
            rng = random.Random(mine.get("seed", 0) + mine.get("total_mines", 0) + depth)
            found = rng.choice(matches)
            break

    if not found:
        found = random.choice(candidates) if candidates else SPECIMENS[0]

    # Assign actual rarity (can be upgraded from base)
    actual_rarity = rarity if rarity_order.index(rarity) >= rarity_order.index(found["rarity_base"]) else found["rarity_base"]
    rarity_info = RARITY_TIERS.get(actual_rarity, RARITY_TIERS["common"])

    specimen_result = {
        **found,
        "actual_rarity": actual_rarity,
        "rarity_color": rarity_info["color"],
        "dust_value": rarity_info["dust_value"],
        "xp_value": rarity_info["xp_value"],
        "depth_found": depth,
        "found_at": datetime.now(timezone.utc).isoformat(),
    }

    # Update mine state
    new_energy = energy - cost
    await db.rock_hounding_mines.update_one(
        {"user_id": user_id, "active": True},
        {
            "$set": {"energy": new_energy, "last_mine_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"total_mines": 1},
            "$push": {"specimens_found": specimen_result["id"]},
        },
    )

    # Save to collection
    await db.rock_hounding_collection.update_one(
        {"user_id": user_id, "specimen_id": found["id"]},
        {
            "$set": {
                "user_id": user_id,
                "specimen_id": found["id"],
                "name": found["name"],
                "element": found["element"],
                "best_rarity": actual_rarity,
                "description": found["description"],
                "mohs": found["mohs"],
                "last_found": datetime.now(timezone.utc).isoformat(),
            },
            "$inc": {"count": 1},
        },
        upsert=True,
    )

    # Feed Core Engine (with layer multipliers)
    layer_xp = int(rarity_info["xp_value"] * layer_xp_mult)
    layer_dust = int(rarity_info["dust_value"] * layer_loot_mult)
    xp_result = await award_xp(user_id, layer_xp, f"rock_hounding:depth_{depth}:{found['id']}")
    await award_currency(user_id, "cosmic_dust", layer_dust, f"rock_hounding:{found['id']}")

    stat = found.get("stat", "wisdom")
    stat_val = found.get("stat_value", 1)
    stat_result = await modify_stat(user_id, stat, stat_val, f"rock_hounding:{found['id']}")

    # Feed Nexus decoded modifiers
    element = found["element"]
    await db.nexus_decoded_modifiers.update_one(
        {"user_id": user_id},
        {"$inc": {f"modifiers.{element}": 1}},
        upsert=True,
    )

    return {
        "specimen": specimen_result,
        "energy": {"current": new_energy, "max": ENERGY_MAX, "cost": cost},
        "rewards": {
            "xp": layer_xp,
            "dust": layer_dust,
            "stat": stat,
            "stat_delta": stat_val,
        },
        "layer": {
            "id": active_layer["id"],
            "name": active_layer["name"],
            "loot_multiplier": layer_loot_mult,
            "xp_multiplier": layer_xp_mult,
        },
        "level": xp_result,
        "stats": stat_result,
        "nexus_modifier": f"+1 {element}",
    }


@router.get("/rock-hounding/collection")
async def get_collection(user=Depends(get_current_user)):
    """Get the user's mineral collection."""
    collection = await db.rock_hounding_collection.find(
        {"user_id": user["id"]}, {"_id": 0, "user_id": 0}
    ).sort("last_found", -1).to_list(100)

    total = len(collection)
    total_possible = len(SPECIMENS)

    by_element = {}
    for spec in collection:
        el = spec.get("element", "unknown")
        if el not in by_element:
            by_element[el] = []
        by_element[el].append(spec)

    return {
        "collection": collection,
        "total_discovered": total,
        "total_possible": total_possible,
        "completion": round((total / total_possible) * 100, 1) if total_possible > 0 else 0,
        "by_element": by_element,
    }


@router.post("/rock-hounding/reset-mine")
async def reset_mine(user=Depends(get_current_user)):
    """Close the current mine and start fresh (new biome based on current Nexus state)."""
    user_id = user["id"]
    await db.rock_hounding_mines.update_many(
        {"user_id": user_id, "active": True},
        {"$set": {"active": False, "closed_at": datetime.now(timezone.utc).isoformat()}},
    )
    mine = await _get_or_create_mine(user_id)
    return {"message": "New mine opened", "mine": mine}


@router.get("/rock-hounding/catalog")
async def get_catalog(user=Depends(get_current_user)):
    """Get the full specimen catalog with discovery status."""
    user_id = user["id"]
    collection = await db.rock_hounding_collection.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    ).to_list(100)
    discovered_ids = {c["specimen_id"] for c in collection}

    catalog = []
    for spec in SPECIMENS:
        discovered = spec["id"] in discovered_ids
        entry = {
            "id": spec["id"],
            "name": spec["name"] if discovered else "???",
            "element": spec["element"],
            "rarity_base": spec["rarity_base"],
            "discovered": discovered,
            "mohs": spec["mohs"] if discovered else None,
            "description": spec["description"] if discovered else "Undiscovered specimen",
        }
        catalog.append(entry)

    return {"catalog": catalog, "total": len(SPECIMENS), "discovered": len(discovered_ids)}

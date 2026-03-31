from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid
import random
import math

router = APIRouter(prefix="/rpg")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STATS, LEVELS & XP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAT_NAMES = ["wisdom", "vitality", "resonance", "harmony", "focus"]

def xp_for_level(level):
    """XP required to reach a given level."""
    if level <= 1:
        return 0
    return int(100 * (level ** 1.5))

def level_from_xp(total_xp):
    """Calculate level from total XP."""
    level = 1
    while xp_for_level(level + 1) <= total_xp:
        level += 1
    return level

async def get_or_create_character(user_id: str) -> dict:
    char = await db.rpg_characters.find_one({"user_id": user_id}, {"_id": 0})
    if not char:
        char = {
            "user_id": user_id,
            "xp": 0,
            "level": 1,
            "stat_points": 5,
            "stats": {s: 1 for s in STAT_NAMES},
            "title": "Seeker",
            "class": "wanderer",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "passive_xp_rate": 0,
            "party_id": None,
        }
        await db.rpg_characters.insert_one({**char})
    return char


@router.get("/character")
async def get_character(user=Depends(get_current_user)):
    char = await get_or_create_character(user["id"])
    level = level_from_xp(char["xp"])
    next_lvl_xp = xp_for_level(level + 1)
    equipped = await db.rpg_equipped.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(10)
    equip_map = {e["slot"]: e for e in equipped}

    # Calculate passive XP from equipped items
    passive = sum(e.get("passive_xp", 0) for e in equipped)

    return {
        **char,
        "level": level,
        "xp_current": char["xp"] - xp_for_level(level),
        "xp_next": next_lvl_xp - xp_for_level(level),
        "xp_total": char["xp"],
        "equipped": equip_map,
        "passive_xp_rate": passive,
    }


@router.post("/character/allocate-stat")
async def allocate_stat(data: dict = Body(...), user=Depends(get_current_user)):
    stat = data.get("stat")
    if stat not in STAT_NAMES:
        raise HTTPException(400, f"Invalid stat. Choose from: {STAT_NAMES}")
    char = await get_or_create_character(user["id"])
    if char["stat_points"] < 1:
        raise HTTPException(400, "No stat points available")
    await db.rpg_characters.update_one(
        {"user_id": user["id"]},
        {"$inc": {f"stats.{stat}": 1, "stat_points": -1}}
    )
    return {"stat": stat, "new_value": char["stats"][stat] + 1, "remaining_points": char["stat_points"] - 1}


@router.post("/character/gain-xp")
async def gain_xp(data: dict = Body(...), user=Depends(get_current_user)):
    """Internal: Award XP for wellness activities."""
    amount = data.get("amount", 10)
    source = data.get("source", "activity")
    char = await get_or_create_character(user["id"])
    old_level = level_from_xp(char["xp"])
    new_xp = char["xp"] + amount
    new_level = level_from_xp(new_xp)
    level_ups = new_level - old_level
    points_earned = level_ups * 3

    update = {"$inc": {"xp": amount}}
    if points_earned > 0:
        update["$inc"]["stat_points"] = points_earned

    await db.rpg_characters.update_one({"user_id": user["id"]}, update)

    # Log XP event
    await db.rpg_xp_log.insert_one({
        "user_id": user["id"],
        "amount": amount,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    result = {"xp_gained": amount, "total_xp": new_xp, "level": new_level}
    if level_ups > 0:
        result["level_up"] = True
        result["levels_gained"] = level_ups
        result["stat_points_earned"] = points_earned
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ITEMS & RARITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"]
RARITY_COLORS = {
    "common": "#9CA3AF", "uncommon": "#22C55E", "rare": "#3B82F6",
    "epic": "#A855F7", "legendary": "#F59E0B", "mythic": "#EF4444",
}
RARITY_WEIGHTS = [40, 25, 18, 10, 5, 2]  # Drop chance weights

EQUIPMENT_SLOTS = ["head", "body", "conduit", "trinket"]

ITEM_TEMPLATES = [
    # Conduits (weapons)
    {"name": "Crystal Wand", "slot": "conduit", "base_rarity": "common", "category": "conduit",
     "description": "A quartz-tipped wand that amplifies intention", "base_stats": {"resonance": 2, "focus": 1}},
    {"name": "Singing Bowl of Echoes", "slot": "conduit", "base_rarity": "rare", "category": "conduit",
     "description": "Ancient bronze bowl that reverberates with cosmic frequencies", "base_stats": {"resonance": 4, "harmony": 3}},
    {"name": "Staff of Frequencies", "slot": "conduit", "base_rarity": "epic", "category": "conduit",
     "description": "A crystalline staff attuned to the 7 solfeggio frequencies", "base_stats": {"resonance": 6, "focus": 4, "wisdom": 2}},
    {"name": "Prayer Beads of Serenity", "slot": "conduit", "base_rarity": "uncommon", "category": "conduit",
     "description": "108 sandalwood beads infused with centuries of devotion", "base_stats": {"harmony": 3, "wisdom": 2}},
    {"name": "Divination Mirror", "slot": "conduit", "base_rarity": "epic", "category": "conduit",
     "description": "An obsidian mirror that reveals hidden truths", "base_stats": {"wisdom": 5, "focus": 3}},
    {"name": "Astral Compass", "slot": "conduit", "base_rarity": "rare", "category": "conduit",
     "description": "Points toward your soul's true north", "base_stats": {"focus": 4, "wisdom": 2}},
    {"name": "Incense of Clarity", "slot": "conduit", "base_rarity": "common", "category": "conduit",
     "description": "Sacred resin that clears mental fog", "base_stats": {"focus": 3}},
    {"name": "Ethereal Tuning Fork", "slot": "conduit", "base_rarity": "legendary", "category": "conduit",
     "description": "Vibrates at the frequency of creation itself", "base_stats": {"resonance": 8, "harmony": 5, "focus": 3}},
    # Head
    {"name": "Crown of Awareness", "slot": "head", "base_rarity": "rare", "category": "vestment",
     "description": "A circlet that sharpens the third eye", "base_stats": {"wisdom": 4, "focus": 2}},
    {"name": "Lotus Headband", "slot": "head", "base_rarity": "common", "category": "vestment",
     "description": "Woven from sacred lotus fibers", "base_stats": {"harmony": 2}},
    {"name": "Veil of the Oracle", "slot": "head", "base_rarity": "epic", "category": "vestment",
     "description": "Shimmering veil that grants prophetic visions", "base_stats": {"wisdom": 6, "resonance": 3}},
    {"name": "Monk's Hood", "slot": "head", "base_rarity": "uncommon", "category": "vestment",
     "description": "Worn by wandering monks for inner stillness", "base_stats": {"focus": 3, "vitality": 1}},
    # Body
    {"name": "Robe of Tranquility", "slot": "body", "base_rarity": "uncommon", "category": "vestment",
     "description": "Silk robe that calms the wearer's auric field", "base_stats": {"harmony": 3, "vitality": 2}},
    {"name": "Celestial Mantle", "slot": "body", "base_rarity": "legendary", "category": "vestment",
     "description": "Woven from starlight threads by celestial beings", "base_stats": {"vitality": 7, "harmony": 5, "resonance": 3}},
    {"name": "Earthweave Tunic", "slot": "body", "base_rarity": "common", "category": "vestment",
     "description": "Grounding garment of natural fibers", "base_stats": {"vitality": 2, "harmony": 1}},
    {"name": "Astral Armor", "slot": "body", "base_rarity": "epic", "category": "vestment",
     "description": "Ethereal armor that shields against negative energy", "base_stats": {"vitality": 5, "harmony": 3, "resonance": 2}},
    # Trinkets
    {"name": "Moonstone Pendant", "slot": "trinket", "base_rarity": "uncommon", "category": "trinket",
     "description": "Glows with lunar energy during meditation", "base_stats": {"resonance": 2, "harmony": 2}, "passive_xp": 1},
    {"name": "Phoenix Feather Charm", "slot": "trinket", "base_rarity": "rare", "category": "trinket",
     "description": "Burns away stagnant energy, renewing vitality", "base_stats": {"vitality": 3, "focus": 2}, "passive_xp": 2},
    {"name": "Obsidian Amulet", "slot": "trinket", "base_rarity": "common", "category": "trinket",
     "description": "Absorbs negativity, grounding the wearer", "base_stats": {"vitality": 2}, "passive_xp": 1},
    {"name": "Eye of the Cosmos", "slot": "trinket", "base_rarity": "legendary", "category": "trinket",
     "description": "A gemstone containing a frozen galaxy", "base_stats": {"wisdom": 5, "resonance": 4, "focus": 3}, "passive_xp": 5},
    {"name": "Seed of Yggdrasil", "slot": "trinket", "base_rarity": "mythic", "category": "trinket",
     "description": "A seed from the World Tree — pulses with all creation", "base_stats": {"wisdom": 6, "vitality": 5, "resonance": 5, "harmony": 4, "focus": 4}, "passive_xp": 10},
    # Consumables
    {"name": "Elixir of Focus", "slot": None, "base_rarity": "common", "category": "consumable",
     "description": "Temporarily sharpens concentration", "effect": {"stat": "focus", "bonus": 5, "duration_minutes": 30}},
    {"name": "Cosmic Dust Potion", "slot": None, "base_rarity": "uncommon", "category": "consumable",
     "description": "Grants bonus Cosmic Dust for 1 hour", "effect": {"stat": "cosmic_dust_bonus", "bonus": 2, "duration_minutes": 60}},
    {"name": "Starlight Nectar", "slot": None, "base_rarity": "rare", "category": "consumable",
     "description": "Double XP for 30 minutes", "effect": {"stat": "xp_multiplier", "bonus": 2, "duration_minutes": 30}},
]

def generate_item(template=None, rarity_override=None):
    """Generate a random item instance from templates."""
    if not template:
        template = random.choice(ITEM_TEMPLATES)

    rarity = rarity_override or template.get("base_rarity", "common")
    rarity_idx = RARITIES.index(rarity)

    # Scale stats by rarity
    multiplier = 1 + (rarity_idx * 0.3)
    stats = {}
    for stat, val in template.get("base_stats", {}).items():
        stats[stat] = max(1, int(val * multiplier))

    passive = template.get("passive_xp", 0)
    if passive:
        passive = max(1, int(passive * multiplier))

    return {
        "id": str(uuid.uuid4()),
        "template_name": template["name"],
        "name": template["name"],
        "description": template["description"],
        "slot": template.get("slot"),
        "category": template.get("category", "misc"),
        "rarity": rarity,
        "rarity_color": RARITY_COLORS[rarity],
        "stats": stats,
        "passive_xp": passive,
        "effect": template.get("effect"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

def roll_rarity():
    """Weighted random rarity roll."""
    return random.choices(RARITIES, weights=RARITY_WEIGHTS, k=1)[0]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INVENTORY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/inventory")
async def get_inventory(user=Depends(get_current_user)):
    items = await db.rpg_inventory.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)

    # Get currencies
    char = await get_or_create_character(user["id"])
    currencies = await db.rpg_currencies.find_one({"user_id": user["id"]}, {"_id": 0})
    if not currencies:
        currencies = {"cosmic_dust": 100, "stardust_shards": 0, "soul_fragments": 0}
        await db.rpg_currencies.insert_one({"user_id": user["id"], **currencies})

    return {
        "items": items,
        "currencies": {
            "cosmic_dust": currencies.get("cosmic_dust", 0),
            "stardust_shards": currencies.get("stardust_shards", 0),
            "soul_fragments": currencies.get("soul_fragments", 0),
        },
        "capacity": 50 + (char.get("level", 1) * 5),
        "count": len(items),
    }


@router.post("/inventory/use-consumable")
async def use_consumable(data: dict = Body(...), user=Depends(get_current_user)):
    item_id = data.get("item_id")
    item = await db.rpg_inventory.find_one(
        {"user_id": user["id"], "id": item_id, "category": "consumable"}, {"_id": 0}
    )
    if not item:
        raise HTTPException(404, "Consumable not found")

    effect = item.get("effect", {})
    # Apply effect as active buff
    await db.rpg_buffs.insert_one({
        "user_id": user["id"],
        "item_name": item["name"],
        "effect": effect,
        "activated_at": datetime.now(timezone.utc).isoformat(),
        "expires_minutes": effect.get("duration_minutes", 30),
    })
    # Remove from inventory
    await db.rpg_inventory.delete_one({"user_id": user["id"], "id": item_id})
    return {"used": item["name"], "effect": effect}


@router.post("/equip")
async def equip_item(data: dict = Body(...), user=Depends(get_current_user)):
    item_id = data.get("item_id")
    item = await db.rpg_inventory.find_one(
        {"user_id": user["id"], "id": item_id}, {"_id": 0}
    )
    if not item or not item.get("slot"):
        raise HTTPException(400, "Item cannot be equipped")

    slot = item["slot"]
    # Unequip current item in that slot
    current = await db.rpg_equipped.find_one(
        {"user_id": user["id"], "slot": slot}, {"_id": 0}
    )
    if current:
        # Move back to inventory
        await db.rpg_inventory.insert_one({**current, "user_id": user["id"]})
        await db.rpg_equipped.delete_one({"user_id": user["id"], "slot": slot})

    # Move item to equipped
    await db.rpg_equipped.insert_one({**item, "user_id": user["id"], "slot": slot})
    await db.rpg_inventory.delete_one({"user_id": user["id"], "id": item_id})

    return {"equipped": item["name"], "slot": slot, "stats": item.get("stats", {})}


@router.post("/unequip")
async def unequip_item(data: dict = Body(...), user=Depends(get_current_user)):
    slot = data.get("slot")
    if slot not in EQUIPMENT_SLOTS:
        raise HTTPException(400, "Invalid slot")

    current = await db.rpg_equipped.find_one(
        {"user_id": user["id"], "slot": slot}, {"_id": 0}
    )
    if not current:
        raise HTTPException(404, "Nothing equipped in that slot")

    await db.rpg_inventory.insert_one({**current, "user_id": user["id"]})
    await db.rpg_equipped.delete_one({"user_id": user["id"], "slot": slot})
    return {"unequipped": current["name"], "slot": slot}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CURRENCIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/currency/earn")
async def earn_currency(data: dict = Body(...), user=Depends(get_current_user)):
    currency = data.get("currency", "cosmic_dust")
    amount = data.get("amount", 10)
    if currency not in ["cosmic_dust", "stardust_shards", "soul_fragments"]:
        raise HTTPException(400, "Invalid currency")

    await db.rpg_currencies.update_one(
        {"user_id": user["id"]},
        {"$inc": {currency: amount}},
        upsert=True
    )
    return {"currency": currency, "earned": amount}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WORLD MAP & REGIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORLD_REGIONS = [
    {"id": "sacred_forest", "name": "Sacred Forest", "description": "Ancient woods where trees hum with the earth's frequency",
     "level_req": 1, "color": "#22C55E", "x": 25, "y": 40, "connections": ["crystal_caverns", "moonlit_grove"],
     "loot_table": ["common", "uncommon"], "ambient": "forest"},
    {"id": "crystal_caverns", "name": "Crystal Caverns", "description": "Deep caves lined with resonating crystal formations",
     "level_req": 3, "color": "#818CF8", "x": 45, "y": 55, "connections": ["sacred_forest", "celestial_spire", "obsidian_depths"],
     "loot_table": ["uncommon", "rare"], "ambient": "cave"},
    {"id": "moonlit_grove", "name": "Moonlit Grove", "description": "A clearing where moonlight pools into liquid silver",
     "level_req": 2, "color": "#E2E8F0", "x": 15, "y": 25, "connections": ["sacred_forest", "astral_shore"],
     "loot_table": ["common", "uncommon", "rare"], "ambient": "night"},
    {"id": "celestial_spire", "name": "Celestial Spire", "description": "A tower that pierces the veil between worlds",
     "level_req": 5, "color": "#F59E0B", "x": 55, "y": 20, "connections": ["crystal_caverns", "void_sanctum"],
     "loot_table": ["rare", "epic"], "ambient": "wind"},
    {"id": "astral_shore", "name": "Astral Shore", "description": "Where the ocean of consciousness meets solid reality",
     "level_req": 4, "color": "#06B6D4", "x": 10, "y": 60, "connections": ["moonlit_grove", "sunken_temple"],
     "loot_table": ["uncommon", "rare", "epic"], "ambient": "ocean"},
    {"id": "obsidian_depths", "name": "Obsidian Depths", "description": "The shadow realm beneath the earth — face your fears",
     "level_req": 7, "color": "#6B7280", "x": 60, "y": 70, "connections": ["crystal_caverns", "void_sanctum"],
     "loot_table": ["rare", "epic", "legendary"], "ambient": "cave"},
    {"id": "void_sanctum", "name": "Void Sanctum", "description": "The space between thoughts — pure potential energy",
     "level_req": 10, "color": "#1F2937", "x": 70, "y": 35, "connections": ["celestial_spire", "obsidian_depths", "world_tree"],
     "loot_table": ["epic", "legendary"], "ambient": "void"},
    {"id": "sunken_temple", "name": "Sunken Temple", "description": "An underwater sanctuary of forgotten wisdom",
     "level_req": 6, "color": "#0EA5E9", "x": 20, "y": 75, "connections": ["astral_shore"],
     "loot_table": ["rare", "epic"], "ambient": "water"},
    {"id": "world_tree", "name": "Yggdrasil's Root", "description": "The base of the World Tree — all paths converge here",
     "level_req": 15, "color": "#84CC16", "x": 85, "y": 25, "connections": ["void_sanctum"],
     "loot_table": ["legendary", "mythic"], "ambient": "cosmic"},
]

SECRET_LOCATIONS = [
    {"id": "hidden_spring", "name": "Hidden Spring of Renewal", "parent_region": "sacred_forest",
     "description": "A spring that restores spiritual energy — found only by those who listen",
     "unlock_condition": "Meditate 10 times in Sacred Forest", "unlock_type": "visit_count", "unlock_threshold": 10,
     "reward_item": "Elixir of Focus", "reward_currency": {"cosmic_dust": 200}},
    {"id": "echo_chamber", "name": "The Echo Chamber", "parent_region": "crystal_caverns",
     "description": "A cavern where every frequency is amplified a thousandfold",
     "unlock_condition": "Reach Resonance stat 10", "unlock_type": "stat_check", "unlock_stat": "resonance", "unlock_threshold": 10,
     "reward_item": "Singing Bowl of Echoes", "reward_currency": {"soul_fragments": 5}},
    {"id": "starfall_clearing", "name": "Starfall Clearing", "parent_region": "moonlit_grove",
     "description": "Where shooting stars land — if you catch one, make a wish",
     "unlock_condition": "Reach Level 8", "unlock_type": "level_check", "unlock_threshold": 8,
     "reward_item": "Eye of the Cosmos", "reward_currency": {"stardust_shards": 50}},
    {"id": "forgotten_altar", "name": "The Forgotten Altar", "parent_region": "sunken_temple",
     "description": "An ancient altar inscribed with the first prayer ever spoken",
     "unlock_condition": "Defeat 3 bosses", "unlock_type": "boss_kills", "unlock_threshold": 3,
     "reward_item": "Celestial Mantle", "reward_currency": {"soul_fragments": 15}},
]


@router.get("/world")
async def get_world_map(user=Depends(get_current_user)):
    char = await get_or_create_character(user["id"])
    level = level_from_xp(char["xp"])

    # Get discovered regions
    discovered = await db.rpg_discoveries.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(100)
    discovered_ids = {d["region_id"] for d in discovered}

    # Always discover starting region
    if "sacred_forest" not in discovered_ids:
        await db.rpg_discoveries.insert_one({
            "user_id": user["id"], "region_id": "sacred_forest",
            "discovered_at": datetime.now(timezone.utc).isoformat(),
        })
        discovered_ids.add("sacred_forest")

    regions = []
    for r in WORLD_REGIONS:
        is_discovered = r["id"] in discovered_ids
        is_accessible = level >= r["level_req"] and is_discovered
        regions.append({
            **r,
            "discovered": is_discovered,
            "accessible": is_accessible,
            "locked": not is_discovered,
        })

    # Check secret locations
    secrets = []
    unlocked_secrets = await db.rpg_secrets.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(50)
    unlocked_ids = {s["secret_id"] for s in unlocked_secrets}

    for s in SECRET_LOCATIONS:
        if s["parent_region"] in discovered_ids:
            secrets.append({
                **s,
                "unlocked": s["id"] in unlocked_ids,
                "parent_discovered": True,
            })

    return {"regions": regions, "secrets": secrets, "player_level": level}


@router.post("/world/explore")
async def explore_region(data: dict = Body(...), user=Depends(get_current_user)):
    region_id = data.get("region_id")
    region = next((r for r in WORLD_REGIONS if r["id"] == region_id), None)
    if not region:
        raise HTTPException(404, "Region not found")

    char = await get_or_create_character(user["id"])
    level = level_from_xp(char["xp"])
    if level < region["level_req"]:
        raise HTTPException(403, f"Requires level {region['level_req']}")

    # Record visit
    await db.rpg_visits.insert_one({
        "user_id": user["id"], "region_id": region_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Discover connected regions
    newly_discovered = []
    for conn_id in region.get("connections", []):
        existing = await db.rpg_discoveries.find_one(
            {"user_id": user["id"], "region_id": conn_id}
        )
        if not existing:
            await db.rpg_discoveries.insert_one({
                "user_id": user["id"], "region_id": conn_id,
                "discovered_at": datetime.now(timezone.utc).isoformat(),
            })
            conn_region = next((r for r in WORLD_REGIONS if r["id"] == conn_id), None)
            if conn_region:
                newly_discovered.append(conn_region["name"])

    # Roll for loot
    loot = None
    if random.random() < 0.4:  # 40% chance
        rarity = random.choice(region.get("loot_table", ["common"]))
        eligible = [t for t in ITEM_TEMPLATES if t.get("base_rarity") == rarity or RARITIES.index(t.get("base_rarity", "common")) <= RARITIES.index(rarity)]
        if eligible:
            template = random.choice(eligible)
            item = generate_item(template, rarity)
            item["user_id"] = user["id"]
            await db.rpg_inventory.insert_one(item)
            loot = {"name": item["name"], "rarity": rarity, "rarity_color": RARITY_COLORS[rarity]}

    # Grant XP + Cosmic Dust
    xp_gain = 15 + (RARITIES.index(region.get("loot_table", ["common"])[-1]) * 5)
    dust_gain = 10 + (region["level_req"] * 3)
    await db.rpg_characters.update_one({"user_id": user["id"]}, {"$inc": {"xp": xp_gain}})
    await db.rpg_currencies.update_one(
        {"user_id": user["id"]}, {"$inc": {"cosmic_dust": dust_gain}}, upsert=True
    )

    return {
        "region": region["name"],
        "xp_gained": xp_gain,
        "cosmic_dust_earned": dust_gain,
        "loot": loot,
        "newly_discovered": newly_discovered,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COOPERATIVE BOSS ENCOUNTERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOSSES = [
    {"id": "shadow_of_doubt", "name": "Shadow of Doubt", "level": 3,
     "description": "A dark entity that feeds on uncertainty — only unified focus can dispel it",
     "hp": 5000, "region": "sacred_forest", "color": "#6B7280",
     "phases": [
         {"name": "Whispers", "hp_threshold": 0.75, "requirement": "10 users meditating", "freq": "396"},
         {"name": "Darkness Falls", "hp_threshold": 0.4, "requirement": "25 users at 528Hz", "freq": "528"},
         {"name": "Final Stand", "hp_threshold": 0.1, "requirement": "50 users unified", "freq": "639"},
     ],
     "loot": [
         {"name": "Cloak of Courage", "rarity": "epic", "slot": "body", "stats": {"vitality": 5, "harmony": 4}, "drop_rate": 0.3},
         {"name": "Doubt-Slayer Crystal", "rarity": "legendary", "slot": "trinket", "stats": {"focus": 6, "wisdom": 4}, "drop_rate": 0.1, "passive_xp": 3},
     ]},
    {"id": "storm_of_anxiety", "name": "Storm of Anxiety", "level": 5,
     "description": "A tempest of chaotic energy — only deep breathing and harmony can calm it",
     "hp": 12000, "region": "celestial_spire", "color": "#EF4444",
     "phases": [
         {"name": "Thunder", "hp_threshold": 0.8, "requirement": "15 users breathing", "freq": "432"},
         {"name": "Lightning", "hp_threshold": 0.5, "requirement": "30 users at 432Hz", "freq": "432"},
         {"name": "Eye of the Storm", "hp_threshold": 0.2, "requirement": "40 users with harmony > 5", "freq": "741"},
     ],
     "loot": [
         {"name": "Stormcaller Staff", "rarity": "legendary", "slot": "conduit", "stats": {"resonance": 7, "focus": 5, "harmony": 3}, "drop_rate": 0.15},
         {"name": "Eye of the Hurricane", "rarity": "epic", "slot": "trinket", "stats": {"harmony": 5, "vitality": 3}, "drop_rate": 0.25, "passive_xp": 4},
     ]},
    {"id": "void_leviathan", "name": "Void Leviathan", "level": 10,
     "description": "An ancient cosmic entity from the space between dimensions — requires unprecedented unity",
     "hp": 50000, "region": "void_sanctum", "color": "#1F2937",
     "phases": [
         {"name": "Emergence", "hp_threshold": 0.9, "requirement": "20 users meditating", "freq": "852"},
         {"name": "Cosmic Roar", "hp_threshold": 0.6, "requirement": "40 users at 852Hz", "freq": "852"},
         {"name": "Dimensional Tear", "hp_threshold": 0.3, "requirement": "60 users unified", "freq": "963"},
         {"name": "Final Convergence", "hp_threshold": 0.05, "requirement": "100 users at 963Hz", "freq": "963"},
     ],
     "loot": [
         {"name": "Leviathan's Maw", "rarity": "mythic", "slot": "conduit", "stats": {"resonance": 10, "wisdom": 8, "focus": 6, "harmony": 5, "vitality": 4}, "drop_rate": 0.05},
         {"name": "Void Fragment", "rarity": "legendary", "slot": "trinket", "stats": {"wisdom": 7, "resonance": 6}, "drop_rate": 0.15, "passive_xp": 8},
         {"name": "Cosmic Aegis", "rarity": "legendary", "slot": "body", "stats": {"vitality": 8, "harmony": 6, "resonance": 4}, "drop_rate": 0.12},
     ]},
]


@router.get("/bosses")
async def get_bosses(user=Depends(get_current_user)):
    char = await get_or_create_character(user["id"])
    level = level_from_xp(char["xp"])
    result = []
    for boss in BOSSES:
        # Get active encounter
        encounter = await db.rpg_boss_encounters.find_one(
            {"boss_id": boss["id"], "status": "active"}, {"_id": 0}
        )
        # Get user's kill count
        kills = await db.rpg_boss_kills.count_documents(
            {"user_id": user["id"], "boss_id": boss["id"]}
        )
        result.append({
            **boss,
            "accessible": level >= boss["level"],
            "active_encounter": encounter,
            "user_kills": kills,
        })
    return result


@router.post("/bosses/join")
async def join_boss_encounter(data: dict = Body(...), user=Depends(get_current_user)):
    boss_id = data.get("boss_id")
    boss = next((b for b in BOSSES if b["id"] == boss_id), None)
    if not boss:
        raise HTTPException(404, "Boss not found")

    char = await get_or_create_character(user["id"])
    level = level_from_xp(char["xp"])
    if level < boss["level"]:
        raise HTTPException(403, f"Requires level {boss['level']}")

    # Find or create active encounter
    encounter = await db.rpg_boss_encounters.find_one(
        {"boss_id": boss_id, "status": "active"}, {"_id": 0}
    )
    if not encounter:
        encounter_id = str(uuid.uuid4())
        encounter = {
            "id": encounter_id,
            "boss_id": boss_id,
            "boss_name": boss["name"],
            "max_hp": boss["hp"],
            "current_hp": boss["hp"],
            "status": "active",
            "participants": [],
            "phase": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "damage_log": [],
        }
        await db.rpg_boss_encounters.insert_one(encounter)

    # Add participant
    if user["id"] not in [p.get("user_id") for p in encounter.get("participants", [])]:
        await db.rpg_boss_encounters.update_one(
            {"id": encounter["id"]},
            {"$push": {"participants": {
                "user_id": user["id"],
                "name": user.get("name", "Seeker"),
                "joined_at": datetime.now(timezone.utc).isoformat(),
                "damage_dealt": 0,
            }}}
        )

    return {
        "encounter_id": encounter["id"],
        "boss": boss["name"],
        "current_hp": encounter["current_hp"],
        "max_hp": encounter["max_hp"],
        "participants": len(encounter.get("participants", [])) + 1,
        "phase": encounter.get("phase", 0),
    }


@router.post("/bosses/attack")
async def attack_boss(data: dict = Body(...), user=Depends(get_current_user)):
    encounter_id = data.get("encounter_id")
    attack_type = data.get("attack_type", "meditate")  # meditate, frequency, breathe

    encounter = await db.rpg_boss_encounters.find_one(
        {"id": encounter_id, "status": "active"}, {"_id": 0}
    )
    if not encounter:
        raise HTTPException(404, "No active encounter")

    char = await get_or_create_character(user["id"])
    stats = char.get("stats", {})

    # Calculate damage from stats + equipped bonuses
    equipped = await db.rpg_equipped.find({"user_id": user["id"]}, {"_id": 0}).to_list(10)
    bonus_stats = {}
    for e in equipped:
        for stat, val in e.get("stats", {}).items():
            bonus_stats[stat] = bonus_stats.get(stat, 0) + val

    total_stats = {s: stats.get(s, 1) + bonus_stats.get(s, 0) for s in STAT_NAMES}

    # Damage formula based on attack type
    if attack_type == "meditate":
        damage = (total_stats["focus"] * 3) + (total_stats["wisdom"] * 2) + random.randint(5, 15)
    elif attack_type == "frequency":
        damage = (total_stats["resonance"] * 4) + (total_stats["harmony"] * 2) + random.randint(8, 20)
    else:  # breathe
        damage = (total_stats["harmony"] * 3) + (total_stats["vitality"] * 2) + random.randint(3, 12)

    new_hp = max(0, encounter["current_hp"] - damage)

    # Update encounter
    boss_id = encounter["boss_id"]
    boss = next((b for b in BOSSES if b["id"] == boss_id), None)

    # Check phase transitions
    phase = encounter.get("phase", 0)
    if boss:
        phases = boss.get("phases", [])
        hp_pct = new_hp / encounter["max_hp"]
        for i, p in enumerate(phases):
            if hp_pct <= p["hp_threshold"] and i > phase:
                phase = i

    update = {
        "$set": {"current_hp": new_hp, "phase": phase},
        "$push": {"damage_log": {
            "user_id": user["id"],
            "damage": damage,
            "attack_type": attack_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }},
    }

    # Check for defeat
    defeated = new_hp <= 0
    loot_drop = None
    if defeated:
        update["$set"]["status"] = "defeated"
        update["$set"]["defeated_at"] = datetime.now(timezone.utc).isoformat()

        # Award loot to all participants
        participants = encounter.get("participants", [])
        for p in participants:
            # Record kill
            await db.rpg_boss_kills.insert_one({
                "user_id": p["user_id"],
                "boss_id": boss_id,
                "encounter_id": encounter_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            # XP and soul fragments
            xp_reward = 50 + (boss.get("level", 1) * 20)
            sf_reward = 2 + boss.get("level", 1)
            await db.rpg_characters.update_one({"user_id": p["user_id"]}, {"$inc": {"xp": xp_reward}})
            await db.rpg_currencies.update_one(
                {"user_id": p["user_id"]},
                {"$inc": {"soul_fragments": sf_reward, "cosmic_dust": 50}},
                upsert=True,
            )

        # Roll loot for the attacker who landed the killing blow
        if boss:
            for loot_item in boss.get("loot", []):
                if random.random() < loot_item.get("drop_rate", 0.1):
                    drop = {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "name": loot_item["name"],
                        "rarity": loot_item["rarity"],
                        "rarity_color": RARITY_COLORS[loot_item["rarity"]],
                        "slot": loot_item.get("slot"),
                        "category": "conduit" if loot_item.get("slot") == "conduit" else "vestment" if loot_item.get("slot") in ["head", "body"] else "trinket",
                        "stats": loot_item.get("stats", {}),
                        "passive_xp": loot_item.get("passive_xp", 0),
                        "description": f"Dropped by {boss['name']}",
                        "template_name": loot_item["name"],
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }
                    await db.rpg_inventory.insert_one(drop)
                    loot_drop = {"name": drop["name"], "rarity": drop["rarity"], "rarity_color": drop["rarity_color"]}
                    break  # Only one loot drop per kill

    await db.rpg_boss_encounters.update_one({"id": encounter_id}, update)

    result = {
        "damage": damage,
        "attack_type": attack_type,
        "boss_hp": new_hp,
        "max_hp": encounter["max_hp"],
        "phase": phase,
        "defeated": defeated,
    }
    if loot_drop:
        result["loot_drop"] = loot_drop
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PARTY / CIRCLE SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/party/create")
async def create_party(data: dict = Body(...), user=Depends(get_current_user)):
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(400, "Party name required")

    party_id = str(uuid.uuid4())
    party = {
        "id": party_id,
        "name": name,
        "leader_id": user["id"],
        "members": [{"user_id": user["id"], "name": user.get("name", "Seeker"), "role": "leader", "joined_at": datetime.now(timezone.utc).isoformat()}],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "invite_code": uuid.uuid4().hex[:8],
    }
    await db.rpg_parties.insert_one(party)
    await db.rpg_characters.update_one({"user_id": user["id"]}, {"$set": {"party_id": party_id}})
    return {"id": party_id, "name": name, "invite_code": party["invite_code"]}


@router.post("/party/join")
async def join_party(data: dict = Body(...), user=Depends(get_current_user)):
    code = data.get("invite_code", "").strip()
    party = await db.rpg_parties.find_one({"invite_code": code}, {"_id": 0})
    if not party:
        raise HTTPException(404, "Invalid invite code")
    if len(party.get("members", [])) >= 6:
        raise HTTPException(400, "Party is full (max 6)")
    if any(m["user_id"] == user["id"] for m in party.get("members", [])):
        raise HTTPException(400, "Already in this party")

    await db.rpg_parties.update_one(
        {"id": party["id"]},
        {"$push": {"members": {"user_id": user["id"], "name": user.get("name", "Seeker"), "role": "member", "joined_at": datetime.now(timezone.utc).isoformat()}}}
    )
    await db.rpg_characters.update_one({"user_id": user["id"]}, {"$set": {"party_id": party["id"]}})
    return {"joined": party["name"], "members": len(party["members"]) + 1}


@router.get("/party")
async def get_my_party(user=Depends(get_current_user)):
    char = await get_or_create_character(user["id"])
    if not char.get("party_id"):
        return {"party": None}
    party = await db.rpg_parties.find_one({"id": char["party_id"]}, {"_id": 0})
    return {"party": party}


@router.post("/party/leave")
async def leave_party(user=Depends(get_current_user)):
    char = await get_or_create_character(user["id"])
    if not char.get("party_id"):
        raise HTTPException(400, "Not in a party")

    party = await db.rpg_parties.find_one({"id": char["party_id"]}, {"_id": 0})
    if not party:
        raise HTTPException(404, "Party not found")

    # Remove member
    await db.rpg_parties.update_one(
        {"id": party["id"]},
        {"$pull": {"members": {"user_id": user["id"]}}}
    )
    await db.rpg_characters.update_one({"user_id": user["id"]}, {"$set": {"party_id": None}})

    # If leader left, promote next member or disband
    if party["leader_id"] == user["id"]:
        remaining = [m for m in party.get("members", []) if m["user_id"] != user["id"]]
        if remaining:
            new_leader = remaining[0]["user_id"]
            await db.rpg_parties.update_one(
                {"id": party["id"]},
                {"$set": {"leader_id": new_leader}}
            )
        else:
            await db.rpg_parties.delete_one({"id": party["id"]})

    return {"left": party["name"]}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STARTER KIT — Give new characters initial items
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/character/starter-kit")
async def claim_starter_kit(user=Depends(get_current_user)):
    existing = await db.rpg_inventory.find_one({"user_id": user["id"]})
    if existing:
        raise HTTPException(400, "Starter kit already claimed")

    starter_items = [
        next(t for t in ITEM_TEMPLATES if t["name"] == "Crystal Wand"),
        next(t for t in ITEM_TEMPLATES if t["name"] == "Lotus Headband"),
        next(t for t in ITEM_TEMPLATES if t["name"] == "Earthweave Tunic"),
        next(t for t in ITEM_TEMPLATES if t["name"] == "Obsidian Amulet"),
        next(t for t in ITEM_TEMPLATES if t["name"] == "Elixir of Focus"),
        next(t for t in ITEM_TEMPLATES if t["name"] == "Elixir of Focus"),
    ]
    items = []
    for template in starter_items:
        item = generate_item(template, template["base_rarity"])
        item["user_id"] = user["id"]
        items.append(item)

    await db.rpg_inventory.insert_many(items)
    await db.rpg_currencies.update_one(
        {"user_id": user["id"]},
        {"$set": {"cosmic_dust": 200, "stardust_shards": 10, "soul_fragments": 0}},
        upsert=True,
    )
    return {"items_received": len(items), "items": [{"name": i["name"], "rarity": i["rarity"]} for i in items]}

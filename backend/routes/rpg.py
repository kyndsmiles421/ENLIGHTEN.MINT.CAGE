from fastapi import APIRouter, HTTPException, Depends, Body, Request
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
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
#  V57.0 SOVEREIGN TRADE PASSPORT — The Central Registry
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Skill domains — map XP sources to unified mastery categories
SKILL_DOMAINS = {
    "Trade & Craft": {
        "color": "#FBBF24",
        "sources": ["Masonry_Skill", "masonry_build", "masonry_dive", "masonry_inspect",
                     "Carpentry_Skill", "carpentry_dive", "carpentry_inspect",
                     "Electrical_Skill", "Plumbing_Skill", "Landscaping_Skill",
                     "electrical_inspect", "plumbing_inspect", "landscaping_inspect",
                     "Welding_Skill", "welding_inspect", "Automotive_Skill", "automotive_inspect",
                     "HVAC_Skill", "hvac_inspect"],
    },
    "Healing Arts": {
        "color": "#22C55E",
        "sources": ["herbology", "aromatherapy", "reiki", "acupressure",
                     "healing", "elixirs", "nourishment", "meal_planning",
                     "Nursing_Skill", "nursing_inspect",
                     "Childcare_Skill", "childcare_inspect",
                     "Eldercare_Skill", "eldercare_inspect",
                     "Nutrition_Skill", "nutrition_inspect",
                     "FirstAid_Skill", "first_aid_inspect"],
    },
    "Mind & Spirit": {
        "color": "#A78BFA",
        "sources": ["meditation_session", "breathing_exercise", "sacred_breathing",
                     "yoga_practice", "affirmations", "mantras", "daily_ritual",
                     "oracle_reading", "dream_journal",
                     "Meditation_Skill", "meditation_inspect"],
    },
    "Science & Physics": {
        "color": "#3B82F6",
        "sources": ["quantum", "fractal", "physics", "astronomy",
                     "observatory", "dimensional", "planetary",
                     "Robotics_Skill", "robotics_inspect"],
    },
    "Creative Arts": {
        "color": "#EC4899",
        "sources": ["generator_script", "generator_lesson", "generator_game",
                     "generator_ritual", "creation_stories", "music", "soundscapes"],
    },
    "Exploration": {
        "color": "#F97316",
        "sources": ["exploration", "module_interaction", "vr_sanctuary",
                     "animal_totems", "cosmic_profile", "sage_coach"],
    },
    "Sacred Knowledge": {
        "color": "#D4AF37",
        "sources": ["wisdom_journal", "numerology", "cardology",
                     "astrology", "sacred_texts", "bible", "mayan",
                     "Bible_Study_Skill", "bible_inspect",
                     "Hermetics_Skill", "hermetics_inspect"],
    },
}

# Hybrid titles unlocked when two+ domains cross thresholds
HYBRID_TITLES = [
    {"id": "general_contractor", "title": "General Contractor",
     "requires": {"Trade & Craft": 20, "Science & Physics": 10},
     "color": "#FBBF24", "desc": "Mastery of physical trades meets structural science"},
    {"id": "master_artisan", "title": "Master Artisan",
     "requires": {"Trade & Craft": 50, "Creative Arts": 20},
     "color": "#EC4899", "desc": "Craft excellence fused with creative vision"},
    {"id": "sovereign_healer", "title": "Sovereign Healer",
     "requires": {"Healing Arts": 30, "Sacred Knowledge": 20},
     "color": "#22C55E", "desc": "Ancient wisdom channeled through modern healing"},
    {"id": "quantum_architect", "title": "Quantum Architect",
     "requires": {"Science & Physics": 30, "Trade & Craft": 20},
     "color": "#6366F1", "desc": "Building at the intersection of matter and mathematics"},
    {"id": "renaissance_soul", "title": "Renaissance Soul",
     "requires": {"Trade & Craft": 15, "Healing Arts": 15, "Mind & Spirit": 15, "Creative Arts": 15},
     "color": "#D4AF37", "desc": "Balanced mastery across the four pillars of sovereignty"},
    {"id": "cosmic_navigator", "title": "Cosmic Navigator",
     "requires": {"Exploration": 40, "Science & Physics": 20},
     "color": "#38BDF8", "desc": "Charting the depths of both inner and outer space"},
    {"id": "sage_oracle", "title": "Sage Oracle",
     "requires": {"Sacred Knowledge": 30, "Mind & Spirit": 30},
     "color": "#C084FC", "desc": "Wisdom of the ancients meets depth of practice"},
    {"id": "hardscape_engineer", "title": "Hardscape Engineer",
     "requires": {"Trade & Craft": 40},
     "color": "#94A3B8", "desc": "Stone, wood, and steel — shaped by sovereign hands"},
]


def _rank_for_actions(count):
    """Determine mastery rank from action count."""
    if count >= 100:
        return {"rank": "Master", "tier": 4}
    if count >= 50:
        return {"rank": "Journeyman", "tier": 3}
    if count >= 20:
        return {"rank": "Apprentice", "tier": 2}
    if count >= 5:
        return {"rank": "Novice", "tier": 1}
    return {"rank": "Initiate", "tier": 0}


@router.get("/passport")
async def get_trade_passport(user=Depends(get_current_user)):
    """V57.0 Sovereign Trade Passport — The Central Registry.
    Aggregates ALL module activity into a unified skill lattice.
    Returns domain mastery, hybrid titles, and dive clearance."""
    uid = user["id"]
    char = await get_or_create_character(uid)
    total_xp = char.get("xp", 0)
    level = level_from_xp(total_xp)

    # Aggregate all XP log entries by source
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}, "total_xp": {"$sum": "$amount"}}},
    ]
    source_counts = {}
    source_xp = {}
    async for doc in db.rpg_xp_log.aggregate(pipeline):
        source_counts[doc["_id"]] = doc["count"]
        source_xp[doc["_id"]] = doc["total_xp"]

    # Build domain mastery
    domains = []
    domain_action_totals = {}
    for domain_name, domain_def in SKILL_DOMAINS.items():
        actions = sum(source_counts.get(s, 0) for s in domain_def["sources"])
        xp = sum(source_xp.get(s, 0) for s in domain_def["sources"])
        rank_info = _rank_for_actions(actions)
        domain_action_totals[domain_name] = actions
        domains.append({
            "domain": domain_name,
            "color": domain_def["color"],
            "actions": actions,
            "xp": xp,
            "rank": rank_info["rank"],
            "tier": rank_info["tier"],
            "progress_pct": min(100, int((actions / 100) * 100)),
        })

    # Calculate hybrid titles
    unlocked_titles = []
    locked_titles = []
    for ht in HYBRID_TITLES:
        met = all(
            domain_action_totals.get(dom, 0) >= threshold
            for dom, threshold in ht["requires"].items()
        )
        entry = {
            "id": ht["id"],
            "title": ht["title"],
            "color": ht["color"],
            "desc": ht["desc"],
            "requirements": {
                dom: {"required": threshold, "current": domain_action_totals.get(dom, 0), "met": domain_action_totals.get(dom, 0) >= threshold}
                for dom, threshold in ht["requires"].items()
            },
        }
        if met:
            unlocked_titles.append(entry)
        else:
            locked_titles.append(entry)

    # Dive clearance — deepest dive unlocked based on total activity
    total_actions = sum(domain_action_totals.values())
    if total_actions >= 200:
        dive_clearance = {"level": 5, "label": "Quantum Shell", "desc": "Full 36-bit lattice access"}
    elif total_actions >= 100:
        dive_clearance = {"level": 4, "label": "Molecular Bonds", "desc": "Atomic-scale dive clearance"}
    elif total_actions >= 50:
        dive_clearance = {"level": 3, "label": "Crystal Lattice", "desc": "Structural dive clearance"}
    elif total_actions >= 20:
        dive_clearance = {"level": 2, "label": "Mineral Domains", "desc": "Compositional dive clearance"}
    elif total_actions >= 5:
        dive_clearance = {"level": 1, "label": "Grain Structure", "desc": "Surface dive clearance"}
    else:
        dive_clearance = {"level": 0, "label": "Surface", "desc": "Begin exploring to deepen your dives"}

    return {
        "level": level,
        "total_xp": total_xp,
        "total_actions": total_actions,
        "dive_clearance": dive_clearance,
        "domains": sorted(domains, key=lambda d: d["actions"], reverse=True),
        "unlocked_titles": unlocked_titles,
        "locked_titles": locked_titles,
        "active_title": unlocked_titles[0]["title"] if unlocked_titles else None,
    }



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  V56.0 VITALITY — CROSS-SYSTEM MILESTONES & QUEST TRIGGERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MILESTONE_DEFINITIONS = [
    {"id": "air_temple_quest", "source": "breathing_exercise", "count": 3, "reward_xp": 50, "reward_item": "air_temple_key", "label": "Air Temple Unlocked"},
    {"id": "crystal_skin_001", "source": "meditation_session", "count": 5, "reward_xp": 75, "reward_item": "crystal_skin_luminous", "label": "Crystal Skin Earned"},
    {"id": "mystic_cloak_001", "source": "oracle_reading", "count": 3, "reward_xp": 60, "reward_item": "mystic_cloak", "label": "Mystic Cloak Unlocked"},
    {"id": "dream_realms_access", "source": "dream_journal", "count": 3, "reward_xp": 50, "reward_item": "dream_key", "label": "Dream Realms Opened"},
    {"id": "ritual_master_badge", "source": "daily_ritual", "count": 7, "reward_xp": 100, "reward_item": "ritual_master_badge", "label": "Sovereign Ritual Master"},
    {"id": "mood_cartographer", "source": "mood_log", "count": 10, "reward_xp": 80, "reward_item": "mood_map_badge", "label": "Emotional Cartographer"},
    {"id": "herbalist_badge", "source": "herbology", "count": 5, "reward_xp": 60, "reward_item": "herbalist_badge", "label": "Herbalist Adept"},
    {"id": "sound_weaver", "source": "frequencies", "count": 5, "reward_xp": 60, "reward_item": "sound_weaver_badge", "label": "Sound Weaver"},
]


@router.get("/milestones")
async def get_milestones(user=Depends(get_current_user)):
    """Return all milestones with completion status for this user."""
    uid = user["id"]
    unlocked_doc = await db.rpg_milestones.find_one({"user_id": uid}, {"_id": 0})
    unlocked = set((unlocked_doc or {}).get("unlocked", []))

    # Count activities from XP log
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
    ]
    counts = {}
    async for doc in db.rpg_xp_log.aggregate(pipeline):
        counts[doc["_id"]] = doc["count"]

    milestones = []
    for m in MILESTONE_DEFINITIONS:
        progress = counts.get(m["source"], 0)
        milestones.append({
            "id": m["id"],
            "label": m["label"],
            "source": m["source"],
            "required": m["count"],
            "progress": min(progress, m["count"]),
            "completed": m["id"] in unlocked,
            "reward_item": m["reward_item"],
        })
    return {"milestones": milestones}


@router.post("/milestones/claim")
async def claim_milestone(data: dict = Body(...), user=Depends(get_current_user)):
    """Claim a completed milestone reward."""
    uid = user["id"]
    milestone_id = data.get("milestone_id")
    if not milestone_id:
        raise HTTPException(400, "milestone_id required")

    milestone = next((m for m in MILESTONE_DEFINITIONS if m["id"] == milestone_id), None)
    if not milestone:
        raise HTTPException(404, "Milestone not found")

    # Check if already claimed
    unlocked_doc = await db.rpg_milestones.find_one({"user_id": uid}, {"_id": 0})
    unlocked = set((unlocked_doc or {}).get("unlocked", []))
    if milestone_id in unlocked:
        return {"already_claimed": True}

    # Check progress
    count = await db.rpg_xp_log.count_documents({"user_id": uid, "source": milestone["source"]})
    if count < milestone["count"]:
        raise HTTPException(400, f"Need {milestone['count']} {milestone['source']} activities, have {count}")

    # Award XP
    char = await get_or_create_character(uid)
    old_level = level_from_xp(char["xp"])
    new_xp = char["xp"] + milestone["reward_xp"]
    new_level = level_from_xp(new_xp)
    level_ups = new_level - old_level

    await db.rpg_characters.update_one({"user_id": uid}, {"$inc": {"xp": milestone["reward_xp"]}})

    # Grant reward item
    item_doc = {
        "user_id": uid,
        "id": str(uuid.uuid4()),
        "name": milestone["label"],
        "type": "badge" if "badge" in milestone["reward_item"] else "equipment",
        "slot": "trinket" if "badge" not in milestone["reward_item"] else "badge",
        "rarity": "epic",
        "source": f"milestone_{milestone_id}",
        "granted_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.rpg_inventory.insert_one(item_doc)

    # Mark as claimed
    await db.rpg_milestones.update_one(
        {"user_id": uid},
        {"$addToSet": {"unlocked": milestone_id}, "$set": {"user_id": uid}},
        upsert=True,
    )

    return {
        "claimed": True,
        "milestone": milestone["label"],
        "xp_gained": milestone["reward_xp"],
        "item_granted": milestone["reward_item"],
        "level_up": level_ups > 0,
        "new_level": new_level,
    }


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
EXTRA_EQUIPMENT_SLOTS = ["hands", "feet", "relic", "aura"]

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

    # Check if slot requires unlock
    if slot in EXTRA_EQUIPMENT_SLOTS:
        unlocked = await _get_unlocked_slots(user["id"])
        if slot not in unlocked:
            raise HTTPException(403, f"Slot '{slot}' is locked. Unlock it in the Gem Shop.")

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
    all_slots = EQUIPMENT_SLOTS + EXTRA_EQUIPMENT_SLOTS
    if slot not in all_slots:
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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DAILY QUEST SYSTEM — Wellness-to-RPG Habit Loop
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAILY_QUESTS = [
    {"id": "meditation", "name": "Still Mind", "description": "Complete a meditation session",
     "xp": 50, "currency": "cosmic_dust", "currency_amount": 15, "icon": "brain",
     "pillar": True},
    {"id": "journal", "name": "Inner Scribe", "description": "Write a journal entry",
     "xp": 30, "currency": "cosmic_dust", "currency_amount": 10, "icon": "pen",
     "pillar": True},
    {"id": "mood", "name": "Emotional Compass", "description": "Log your mood",
     "xp": 20, "currency": "cosmic_dust", "currency_amount": 5, "icon": "heart",
     "pillar": True},
    {"id": "breathing", "name": "Breath of Life", "description": "Complete a breathing exercise",
     "xp": 25, "currency": "cosmic_dust", "currency_amount": 8, "icon": "wind",
     "pillar": True},
    {"id": "soundscape", "name": "Harmonic Resonance", "description": "Listen to a soundscape",
     "xp": 20, "currency": "cosmic_dust", "currency_amount": 8, "icon": "music",
     "pillar": True},
    {"id": "breath_reset", "name": "3-Breath Reset", "description": "Take 3 deep breaths to center yourself",
     "xp": 10, "currency": "cosmic_dust", "currency_amount": 3, "icon": "zap",
     "pillar": False},
    # Resonance / Gate / Hotspot quests (integrated loop)
    {"id": "resonance", "name": "Resonance Attunement", "description": "Complete a Resonance Practice session",
     "xp": 40, "currency": "cosmic_dust", "currency_amount": 12, "icon": "target",
     "pillar": True},
    {"id": "hotspot", "name": "Energy Harvester", "description": "Collect from a GPS Hotspot",
     "xp": 35, "currency": "cosmic_dust", "currency_amount": 10, "icon": "map-pin",
     "pillar": False},
    {"id": "trade", "name": "Cosmic Exchange", "description": "Complete or offer a trade in Trade Circle",
     "xp": 30, "currency": "cosmic_dust", "currency_amount": 10, "icon": "handshake",
     "pillar": False},
    {"id": "refine_gem", "name": "Gem Alchemist", "description": "Polish a gem in the Refinement Lab",
     "xp": 35, "currency": "cosmic_dust", "currency_amount": 12, "icon": "gem",
     "pillar": False},
    {"id": "realm_travel", "name": "Realm Walker", "description": "Visit 3 different app realms today",
     "xp": 25, "currency": "cosmic_dust", "currency_amount": 8, "icon": "compass",
     "pillar": False},
]

PERFECT_DAY_BONUS_XP = 100
PERFECT_DAY_BONUS_DUST = 50
STREAK_MULTIPLIERS = {3: 1.5, 7: 2.0, 14: 2.5}
MAX_STREAK_MULTIPLIER = 2.5


def _today_key():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


async def _get_streak(user_id: str) -> dict:
    """Calculate current streak and multiplier."""
    streak_doc = await db.rpg_streaks.find_one({"user_id": user_id}, {"_id": 0})
    if not streak_doc:
        return {"days": 0, "multiplier": 1.0, "last_date": None}

    last_date = streak_doc.get("last_date", "")
    days = streak_doc.get("days", 0)
    today = _today_key()
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")

    if last_date == today:
        pass  # Already counted today
    elif last_date == yesterday:
        pass  # Streak is alive but not yet incremented for today
    else:
        days = 0  # Streak broken

    multiplier = 1.0
    for threshold in sorted(STREAK_MULTIPLIERS.keys()):
        if days >= threshold:
            multiplier = STREAK_MULTIPLIERS[threshold]
    multiplier = min(multiplier, MAX_STREAK_MULTIPLIER)

    return {"days": days, "multiplier": multiplier, "last_date": last_date}


async def award_quest_xp(user_id: str, quest_id: str) -> dict:
    """Called by wellness endpoints to award XP for completing a daily quest.
    Returns the result dict or None if already completed today."""
    today = _today_key()

    # Check if already completed today
    existing = await db.rpg_quest_log.find_one(
        {"user_id": user_id, "quest_id": quest_id, "date": today}
    )
    if existing:
        return None  # Already done today

    quest = next((q for q in DAILY_QUESTS if q["id"] == quest_id), None)
    if not quest:
        return None

    # Get streak multiplier
    streak = await _get_streak(user_id)
    multiplier = streak["multiplier"]
    xp_raw = quest["xp"]
    xp_final = int(xp_raw * multiplier)
    dust_final = int(quest["currency_amount"] * multiplier)

    # Record completion
    await db.rpg_quest_log.insert_one({
        "user_id": user_id,
        "quest_id": quest_id,
        "date": today,
        "xp_awarded": xp_final,
        "multiplier": multiplier,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })

    # Award XP
    char = await get_or_create_character(user_id)
    old_level = level_from_xp(char["xp"])
    new_xp = char["xp"] + xp_final
    new_level = level_from_xp(new_xp)
    level_ups = new_level - old_level
    points_earned = level_ups * 3

    update = {"$inc": {"xp": xp_final}}
    if points_earned > 0:
        update["$inc"]["stat_points"] = points_earned
    await db.rpg_characters.update_one({"user_id": user_id}, update)

    # Award currency
    await db.rpg_currencies.update_one(
        {"user_id": user_id},
        {"$inc": {quest["currency"]: dust_final}},
        upsert=True,
    )

    # Check Perfect Day bonus
    completed_today = await db.rpg_quest_log.find(
        {"user_id": user_id, "date": today}
    ).to_list(20)
    completed_ids = {c["quest_id"] for c in completed_today}
    pillar_ids = {q["id"] for q in DAILY_QUESTS if q["pillar"]}
    perfect_day = pillar_ids.issubset(completed_ids)

    perfect_day_awarded = False
    if perfect_day:
        already_awarded = await db.rpg_quest_log.find_one(
            {"user_id": user_id, "quest_id": "__perfect_day__", "date": today}
        )
        if not already_awarded:
            perfect_xp = int(PERFECT_DAY_BONUS_XP * multiplier)
            perfect_dust = int(PERFECT_DAY_BONUS_DUST * multiplier)
            await db.rpg_quest_log.insert_one({
                "user_id": user_id, "quest_id": "__perfect_day__", "date": today,
                "xp_awarded": perfect_xp, "multiplier": multiplier,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })
            await db.rpg_characters.update_one({"user_id": user_id}, {"$inc": {"xp": perfect_xp}})
            await db.rpg_currencies.update_one(
                {"user_id": user_id}, {"$inc": {"cosmic_dust": perfect_dust}}, upsert=True,
            )
            perfect_day_awarded = True
            new_xp += perfect_xp

    # Update streak
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    streak_days = streak["days"]
    if streak["last_date"] != today:
        if streak["last_date"] == yesterday:
            streak_days += 1
        else:
            streak_days = 1
        await db.rpg_streaks.update_one(
            {"user_id": user_id},
            {"$set": {"last_date": today, "days": streak_days}},
            upsert=True,
        )

    result = {
        "quest": quest["name"],
        "quest_id": quest_id,
        "xp_awarded": xp_final,
        "currency_awarded": dust_final,
        "streak_days": streak_days,
        "multiplier": multiplier,
        "level": level_from_xp(new_xp),
    }
    if level_ups > 0:
        result["level_up"] = True
        result["stat_points_earned"] = points_earned
    if perfect_day_awarded:
        result["perfect_day"] = True
        result["perfect_day_xp"] = int(PERFECT_DAY_BONUS_XP * multiplier)
    return result


@router.get("/quests/daily")
async def get_daily_quests(user=Depends(get_current_user)):
    today = _today_key()
    await get_or_create_character(user["id"])

    # Get today's completions
    completed_today = await db.rpg_quest_log.find(
        {"user_id": user["id"], "date": today}, {"_id": 0}
    ).to_list(20)
    completed_ids = {c["quest_id"] for c in completed_today}
    total_xp_today = sum(c.get("xp_awarded", 0) for c in completed_today)

    # Streak info
    streak = await _get_streak(user["id"])

    # Build quest list
    quests = []
    for q in DAILY_QUESTS:
        quests.append({
            **q,
            "completed": q["id"] in completed_ids,
            "xp_with_multiplier": int(q["xp"] * streak["multiplier"]),
        })

    pillar_ids = {q["id"] for q in DAILY_QUESTS if q["pillar"]}
    pillars_done = len(pillar_ids.intersection(completed_ids))
    perfect_day = "__perfect_day__" in completed_ids

    return {
        "quests": quests,
        "date": today,
        "completed_count": len([c for c in completed_ids if not c.startswith("__")]),
        "total_count": len(DAILY_QUESTS),
        "xp_earned_today": total_xp_today,
        "streak": streak,
        "pillars_done": pillars_done,
        "pillars_total": len(pillar_ids),
        "perfect_day": perfect_day,
        "perfect_day_bonus": int(PERFECT_DAY_BONUS_XP * streak["multiplier"]),
    }


@router.post("/quests/breath-reset")
async def do_breath_reset(user=Depends(get_current_user)):
    """Quick 3-breath reset micro-quest."""
    result = await award_quest_xp(user["id"], "breath_reset")
    if not result:
        raise HTTPException(400, "Already completed today")
    return result


@router.post("/quests/complete")
async def complete_quest(data: dict = Body(...), user=Depends(get_current_user)):
    """Generic quest completion endpoint for activities without built-in hooks."""
    quest_id = data.get("quest_id")
    valid_ids = {q["id"] for q in DAILY_QUESTS}
    if quest_id not in valid_ids:
        raise HTTPException(400, f"Invalid quest. Valid: {sorted(valid_ids)}")
    result = await award_quest_xp(user["id"], quest_id)
    if not result:
        raise HTTPException(400, "Already completed today")

    # Auto-generate Victory Mantra content asset
    try:
        from routes.content_factory import auto_generate_victory_mantra
        quest_name = next((q["name"] for q in DAILY_QUESTS if q["id"] == quest_id), quest_id)
        asset = await auto_generate_victory_mantra(user["id"], quest_name)
        if asset:
            result["generated_asset"] = {"id": asset["id"], "name": asset["name"], "type": "victory_mantra"}
    except Exception as e:
        logger.error(f"Quest auto-gen hook error: {e}")

    return result




@router.get("/quests/streak")
async def get_streak(user=Depends(get_current_user)):
    streak = await _get_streak(user["id"])
    # Get recent history
    history = await db.rpg_quest_log.find(
        {"user_id": user["id"]},
        {"_id": 0, "date": 1, "quest_id": 1, "xp_awarded": 1}
    ).sort("completed_at", -1).to_list(50)

    # Group by date
    by_date = {}
    for h in history:
        d = h["date"]
        if d not in by_date:
            by_date[d] = {"date": d, "quests": 0, "xp": 0}
        if not h["quest_id"].startswith("__"):
            by_date[d]["quests"] += 1
        by_date[d]["xp"] += h.get("xp_awarded", 0)

    return {
        **streak,
        "history": list(by_date.values())[:14],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DUAL CURRENCY ECONOMY & SHOP SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import os
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# ── Currency Config ──
GEMS_TO_DUST_RATE = 10  # 1 gem = 10 dust
MIN_GEM_CONVERSION = 1

GEM_PACKS = [
    {"id": "gems_100", "gems": 100, "price": 0.99, "label": "Pouch of Gems", "bonus": 0},
    {"id": "gems_600", "gems": 600, "price": 4.99, "label": "Chest of Gems", "bonus": 100},
    {"id": "gems_1500", "gems": 1500, "price": 9.99, "label": "Vault of Gems", "bonus": 300},
]

# ── Slot Unlock System (slots 5-8 behind gems) ──
EXTRA_SLOTS = [
    {"id": "hands", "name": "Hands", "gem_cost": 50, "description": "Equip Gloves & Gauntlets"},
    {"id": "feet", "name": "Feet", "gem_cost": 75, "description": "Equip Boots & Sandals"},
    {"id": "relic", "name": "Relic", "gem_cost": 125, "description": "Equip ancient relics of power"},
    {"id": "aura", "name": "Aura", "gem_cost": 200, "description": "Equip aura enchantments"},
]

# ── Shop Inventory ──
DUST_SHOP = [
    {"id": "dust_elixir_focus", "name": "Elixir of Focus", "cost": 80, "currency": "dust",
     "category": "consumable", "rarity": "common",
     "description": "Temporarily sharpens concentration",
     "effect": {"stat": "focus", "bonus": 5, "duration_minutes": 30}},
    {"id": "dust_elixir_vitality", "name": "Elixir of Vitality", "cost": 80, "currency": "dust",
     "category": "consumable", "rarity": "common",
     "description": "Restores spiritual vitality",
     "effect": {"stat": "vitality", "bonus": 5, "duration_minutes": 30}},
    {"id": "dust_cosmic_potion", "name": "Cosmic Dust Potion", "cost": 120, "currency": "dust",
     "category": "consumable", "rarity": "uncommon",
     "description": "Doubles dust earned for 1 hour",
     "effect": {"stat": "cosmic_dust_bonus", "bonus": 2, "duration_minutes": 60}},
    {"id": "dust_xp_scroll", "name": "Scroll of Insight", "cost": 200, "currency": "dust",
     "category": "consumable", "rarity": "rare",
     "description": "Grants 100 bonus XP",
     "effect": {"stat": "xp_grant", "bonus": 100}},
    {"id": "dust_prayer_beads", "name": "Prayer Beads of Serenity", "cost": 350, "currency": "dust",
     "category": "conduit", "rarity": "uncommon", "slot": "conduit",
     "description": "108 sandalwood beads infused with centuries of devotion",
     "stats": {"harmony": 3, "wisdom": 2}},
    {"id": "dust_monks_hood", "name": "Monk's Hood", "cost": 250, "currency": "dust",
     "category": "vestment", "rarity": "uncommon", "slot": "head",
     "description": "Worn by wandering monks for inner stillness",
     "stats": {"focus": 3, "vitality": 1}},
    {"id": "dust_robe", "name": "Robe of Tranquility", "cost": 400, "currency": "dust",
     "category": "vestment", "rarity": "uncommon", "slot": "body",
     "description": "Silk robe that calms the wearer's auric field",
     "stats": {"harmony": 3, "vitality": 2}},
    {"id": "dust_moonstone", "name": "Moonstone Pendant", "cost": 500, "currency": "dust",
     "category": "trinket", "rarity": "uncommon", "slot": "trinket",
     "description": "Glows with lunar energy during meditation",
     "stats": {"resonance": 2, "harmony": 2}, "passive_xp": 1},
]

GEM_SHOP = [
    {"id": "gem_starlight", "name": "Starlight Nectar", "cost": 25, "currency": "gems",
     "category": "consumable", "rarity": "rare",
     "description": "Double XP for 30 minutes",
     "effect": {"stat": "xp_multiplier", "bonus": 2, "duration_minutes": 30}},
    {"id": "gem_astral_compass", "name": "Astral Compass", "cost": 60, "currency": "gems",
     "category": "conduit", "rarity": "rare", "slot": "conduit",
     "description": "Points toward your soul's true north",
     "stats": {"focus": 4, "wisdom": 2}},
    {"id": "gem_crown", "name": "Crown of Awareness", "cost": 80, "currency": "gems",
     "category": "vestment", "rarity": "rare", "slot": "head",
     "description": "A circlet that sharpens the third eye",
     "stats": {"wisdom": 4, "focus": 2}},
    {"id": "gem_oracle_veil", "name": "Veil of the Oracle", "cost": 120, "currency": "gems",
     "category": "vestment", "rarity": "epic", "slot": "head",
     "description": "Shimmering veil that grants prophetic visions",
     "stats": {"wisdom": 6, "resonance": 3}},
    {"id": "gem_astral_armor", "name": "Astral Armor", "cost": 150, "currency": "gems",
     "category": "vestment", "rarity": "epic", "slot": "body",
     "description": "Ethereal armor that shields against negative energy",
     "stats": {"vitality": 5, "harmony": 3, "resonance": 2}},
    {"id": "gem_phoenix", "name": "Phoenix Feather Charm", "cost": 100, "currency": "gems",
     "category": "trinket", "rarity": "rare", "slot": "trinket",
     "description": "Burns away stagnant energy, renewing vitality",
     "stats": {"vitality": 3, "focus": 2}, "passive_xp": 2},
    {"id": "gem_divination", "name": "Divination Mirror", "cost": 180, "currency": "gems",
     "category": "conduit", "rarity": "epic", "slot": "conduit",
     "description": "An obsidian mirror that reveals hidden truths",
     "stats": {"wisdom": 5, "focus": 3}},
    {"id": "gem_tuning_fork", "name": "Ethereal Tuning Fork", "cost": 350, "currency": "gems",
     "category": "conduit", "rarity": "legendary", "slot": "conduit",
     "description": "Vibrates at the frequency of creation itself",
     "stats": {"resonance": 8, "harmony": 5, "focus": 3}},
    {"id": "gem_eye_cosmos", "name": "Eye of the Cosmos", "cost": 500, "currency": "gems",
     "category": "trinket", "rarity": "legendary", "slot": "trinket",
     "description": "A gemstone containing a frozen galaxy",
     "stats": {"wisdom": 5, "resonance": 4, "focus": 3}, "passive_xp": 5},
]


async def _get_currencies(user_id: str) -> dict:
    cur = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    if not cur:
        cur = {"cosmic_dust": 100, "stardust_shards": 0, "soul_fragments": 0}
        await db.rpg_currencies.insert_one({"user_id": user_id, **cur})
    return cur


async def _get_unlocked_slots(user_id: str) -> list:
    doc = await db.rpg_slot_unlocks.find_one({"user_id": user_id}, {"_id": 0})
    return doc.get("slots", []) if doc else []


@router.get("/shop")
async def get_shop(user=Depends(get_current_user)):
    currencies = await _get_currencies(user["id"])
    unlocked = await _get_unlocked_slots(user["id"])
    purchases = await db.rpg_purchases.find(
        {"user_id": user["id"]}, {"_id": 0, "item_id": 1}
    ).to_list(200)
    purchased_ids = {p["item_id"] for p in purchases}

    return {
        "currencies": {
            "gems": currencies.get("stardust_shards", 0),
            "dust": currencies.get("cosmic_dust", 0),
            "soul_fragments": currencies.get("soul_fragments", 0),
        },
        "gem_packs": GEM_PACKS,
        "dust_shop": [{**i, "owned": i["id"] in purchased_ids} for i in DUST_SHOP],
        "gem_shop": [{**i, "owned": i["id"] in purchased_ids} for i in GEM_SHOP],
        "slot_unlocks": [{**s, "unlocked": s["id"] in unlocked} for s in EXTRA_SLOTS],
        "unlocked_slots": unlocked,
        "conversion_rate": GEMS_TO_DUST_RATE,
    }


@router.post("/shop/buy")
async def buy_shop_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase an item from the dust or gem shop."""
    item_id = data.get("item_id")

    # Find item in either shop
    item = next((i for i in DUST_SHOP if i["id"] == item_id), None)
    if not item:
        item = next((i for i in GEM_SHOP if i["id"] == item_id), None)
    if not item:
        raise HTTPException(404, "Item not found in shop")

    # Check for non-consumable duplicates
    if item["category"] != "consumable":
        existing = await db.rpg_purchases.find_one(
            {"user_id": user["id"], "item_id": item_id}
        )
        if existing:
            raise HTTPException(400, "Already purchased this item")

    currencies = await _get_currencies(user["id"])
    cost = item["cost"]

    if item["currency"] == "dust":
        if currencies.get("cosmic_dust", 0) < cost:
            raise HTTPException(402, f"Not enough Cosmic Dust (need {cost})")
        await db.rpg_currencies.update_one(
            {"user_id": user["id"]}, {"$inc": {"cosmic_dust": -cost}}
        )
    else:  # gems
        if currencies.get("stardust_shards", 0) < cost:
            raise HTTPException(402, f"Not enough Celestial Gems (need {cost})")
        await db.rpg_currencies.update_one(
            {"user_id": user["id"]}, {"$inc": {"stardust_shards": -cost}}
        )

    # Record purchase
    await db.rpg_purchases.insert_one({
        "user_id": user["id"],
        "item_id": item_id,
        "item_name": item["name"],
        "cost": cost,
        "currency": item["currency"],
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    })

    # Create inventory item
    inv_item = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": item["name"],
        "description": item["description"],
        "category": item["category"],
        "rarity": item.get("rarity", "common"),
        "rarity_color": RARITY_COLORS.get(item.get("rarity", "common"), "#9CA3AF"),
        "slot": item.get("slot"),
        "stats": item.get("stats", {}),
        "passive_xp": item.get("passive_xp", 0),
        "effect": item.get("effect"),
        "template_name": item["name"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.rpg_inventory.insert_one(inv_item)

    # Handle consumable instant effects (XP scroll)
    bonus_msg = None
    if item.get("effect", {}).get("stat") == "xp_grant":
        xp_amount = item["effect"]["bonus"]
        await db.rpg_characters.update_one(
            {"user_id": user["id"]}, {"$inc": {"xp": xp_amount}}
        )
        bonus_msg = f"+{xp_amount} XP granted!"

    return {
        "purchased": item["name"],
        "cost": cost,
        "currency": item["currency"],
        "item_id": inv_item["id"],
        "bonus": bonus_msg,
    }


@router.post("/shop/convert")
async def convert_gems_to_dust(data: dict = Body(...), user=Depends(get_current_user)):
    """Convert Celestial Gems to Cosmic Dust."""
    gems = data.get("gems", 0)
    if gems < MIN_GEM_CONVERSION:
        raise HTTPException(400, f"Minimum conversion: {MIN_GEM_CONVERSION} gem")

    currencies = await _get_currencies(user["id"])
    if currencies.get("stardust_shards", 0) < gems:
        raise HTTPException(402, "Not enough Celestial Gems")

    dust_gained = gems * GEMS_TO_DUST_RATE

    await db.rpg_currencies.update_one(
        {"user_id": user["id"]},
        {"$inc": {"stardust_shards": -gems, "cosmic_dust": dust_gained}}
    )

    await db.rpg_transactions.insert_one({
        "user_id": user["id"],
        "type": "conversion",
        "gems_spent": gems,
        "dust_gained": dust_gained,
        "rate": GEMS_TO_DUST_RATE,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "gems_spent": gems,
        "dust_gained": dust_gained,
        "new_gems": currencies.get("stardust_shards", 0) - gems,
        "new_dust": currencies.get("cosmic_dust", 0) + dust_gained,
    }


@router.post("/shop/unlock-slot")
async def unlock_equipment_slot(data: dict = Body(...), user=Depends(get_current_user)):
    """Unlock an extra equipment slot with Celestial Gems."""
    slot_id = data.get("slot_id")
    slot = next((s for s in EXTRA_SLOTS if s["id"] == slot_id), None)
    if not slot:
        raise HTTPException(404, "Invalid slot")

    unlocked = await _get_unlocked_slots(user["id"])
    if slot_id in unlocked:
        raise HTTPException(400, "Slot already unlocked")

    currencies = await _get_currencies(user["id"])
    if currencies.get("stardust_shards", 0) < slot["gem_cost"]:
        raise HTTPException(402, f"Need {slot['gem_cost']} Celestial Gems")

    await db.rpg_currencies.update_one(
        {"user_id": user["id"]}, {"$inc": {"stardust_shards": -slot["gem_cost"]}}
    )
    await db.rpg_slot_unlocks.update_one(
        {"user_id": user["id"]},
        {"$addToSet": {"slots": slot_id}},
        upsert=True,
    )
    await db.rpg_transactions.insert_one({
        "user_id": user["id"],
        "type": "slot_unlock",
        "slot_id": slot_id,
        "gems_spent": slot["gem_cost"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"unlocked": slot["name"], "gems_spent": slot["gem_cost"]}


@router.post("/shop/purchase-gems")
async def purchase_gems_checkout(request: Request, data: dict = Body(...), user=Depends(get_current_user)):
    """Create a Stripe checkout session for purchasing Celestial Gems."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    pack_id = data.get("pack_id")
    origin_url = data.get("origin_url", "")

    pack = next((p for p in GEM_PACKS if p["id"] == pack_id), None)
    if not pack:
        raise HTTPException(400, "Invalid gem pack")
    if not origin_url:
        raise HTTPException(400, "Origin URL required")

    success_url = f"{origin_url}/rpg?session_id={{CHECKOUT_SESSION_ID}}&type=gems"
    cancel_url = f"{origin_url}/rpg"

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_req = CheckoutSessionRequest(
        amount=float(pack["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "type": "gems",
            "pack_id": pack_id,
            "gems": str(pack["gems"] + pack["bonus"]),
        },
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "type": "gems",
        "pack_id": pack_id,
        "amount": pack["price"],
        "gems": pack["gems"] + pack["bonus"],
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/shop/checkout-status/{session_id}")
async def gem_checkout_status(session_id: str, request: Request, user=Depends(get_current_user)):
    """Poll gem checkout status and fulfill if paid."""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(404, "Transaction not found")

    if tx.get("payment_status") == "paid":
        return {
            "status": status.status,
            "payment_status": "paid",
            "already_fulfilled": True,
            "gems_added": tx.get("gems", 0),
        }

    if status.payment_status == "paid":
        gems_total = tx.get("gems", 0)
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.rpg_currencies.update_one(
            {"user_id": user["id"]},
            {"$inc": {"stardust_shards": gems_total}},
            upsert=True,
        )
        return {
            "status": status.status,
            "payment_status": "paid",
            "already_fulfilled": False,
            "gems_added": gems_total,
        }

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "already_fulfilled": False,
    }

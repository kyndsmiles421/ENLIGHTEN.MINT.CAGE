import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from deps import db, get_current_user, logger

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC LEDGER — Universal Profile
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACHIEVEMENT_DEFS = [
    # Exploration
    {"id": "first_steps", "name": "First Steps", "desc": "Create your first starseed character.", "icon": "star", "color": "#818CF8", "category": "exploration"},
    {"id": "realm_walker", "name": "Realm Walker", "desc": "Explore all 4 multiverse realms.", "icon": "globe", "color": "#C084FC", "category": "exploration"},
    {"id": "gem_collector_10", "name": "Gem Collector", "desc": "Collect 10 gems across all origins.", "icon": "gem", "color": "#A855F7", "category": "exploration"},
    {"id": "gem_collector_50", "name": "Gem Hoarder", "desc": "Collect 50 gems across all origins.", "icon": "gem", "color": "#FCD34D", "category": "exploration"},
    {"id": "multiverse_master", "name": "Multiverse Master", "desc": "Unlock all 4 portals.", "icon": "orbit", "color": "#34D399", "category": "exploration"},

    # Combat
    {"id": "first_blood", "name": "First Blood", "desc": "Defeat your first cosmic boss.", "icon": "swords", "color": "#EF4444", "category": "combat"},
    {"id": "boss_slayer_5", "name": "Boss Slayer", "desc": "Defeat 5 cosmic bosses.", "icon": "swords", "color": "#DC2626", "category": "combat"},
    {"id": "resonance_striker", "name": "Resonance Striker", "desc": "Deal damage with a resonance multiplier > 1.5x.", "icon": "zap", "color": "#F59E0B", "category": "combat"},
    {"id": "full_set_warrior", "name": "Set Collector", "desc": "Equip a full 4-piece equipment set.", "icon": "shield", "color": "#38BDF8", "category": "combat"},

    # Crafting
    {"id": "first_craft", "name": "First Craft", "desc": "Craft your first item.", "icon": "hammer", "color": "#F59E0B", "category": "crafting"},
    {"id": "legendary_forger", "name": "Legendary Forger", "desc": "Craft a legendary item.", "icon": "crown", "color": "#FCD34D", "category": "crafting"},
    {"id": "enchanter", "name": "Enchanter", "desc": "Apply your first enchantment.", "icon": "sparkles", "color": "#C084FC", "category": "crafting"},

    # Community
    {"id": "gallery_debut", "name": "Gallery Debut", "desc": "Publish your first avatar to the gallery.", "icon": "share", "color": "#EC4899", "category": "community"},
    {"id": "radiant_soul", "name": "Radiant Soul", "desc": "Receive 10 Radiates on your gallery avatar.", "icon": "heart", "color": "#FCD34D", "category": "community"},
    {"id": "cosmic_supporter", "name": "Cosmic Supporter", "desc": "Radiate 20 other players' avatars.", "icon": "zap", "color": "#34D399", "category": "community"},

    # Story
    {"id": "chapter_5", "name": "Ascended", "desc": "Reach Chapter 5 with any character.", "icon": "trophy", "color": "#FCD34D", "category": "story"},
    {"id": "dual_origin", "name": "Dual Origin", "desc": "Create characters of 2 different origins.", "icon": "star", "color": "#818CF8", "category": "story"},
    {"id": "all_origins", "name": "Cosmic Polymath", "desc": "Create characters of all 6 origins.", "icon": "infinity", "color": "#F0ABFC", "category": "story"},
    {"id": "legendary_path", "name": "Legendary Path", "desc": "Unlock a legendary narrative arc.", "icon": "crown", "color": "#FCD34D", "category": "story"},

    # Mastery
    {"id": "level_10", "name": "Cosmic Adept", "desc": "Reach level 10 with any character.", "icon": "flame", "color": "#EF4444", "category": "mastery"},
    {"id": "total_xp_1000", "name": "Stardust Gatherer", "desc": "Earn 1000 total XP across all origins.", "icon": "sparkles", "color": "#C084FC", "category": "mastery"},
]

# Legendary narrative paths requiring full gem sets
LEGENDARY_PATHS = [
    {"id": "abyssal_king", "name": "The Abyssal King", "element": "Water",
     "required_gems": ["tide-pearl", "tide-pearl", "tide-pearl"],
     "color": "#38BDF8", "icon": "droplet",
     "desc": "Three Tide Pearls resonate, opening the path to the Abyssal King's sunken throne.",
     "story_hook": "The waters part before you, revealing a staircase of coral descending into an impossible depth. The Abyssal King awaits."},
    {"id": "shadow_sovereign", "name": "The Shadow Sovereign", "element": "Shadow",
     "required_gems": ["shadow-amber", "shadow-amber", "shadow-amber"],
     "color": "#DC2626", "icon": "moon",
     "desc": "Three Shadow Ambers pulse as one, tearing open the veil to the Shadow Sovereign's domain.",
     "story_hook": "Darkness coalesces into a throne of living shadow. The Sovereign speaks in echoes of every fear you've ever faced."},
    {"id": "crystal_architect", "name": "The Crystal Architect", "element": "Crystal",
     "required_gems": ["crystal-node", "crystal-node", "crystal-node"],
     "color": "#A855F7", "icon": "diamond",
     "desc": "Three Crystal Nodes align, revealing the Crystal Architect's hidden blueprint of reality.",
     "story_hook": "The crystals sing in unison, and the world around you fractures into a lattice of pure information. The Architect's design unfolds."},
    {"id": "solar_phoenix", "name": "The Solar Phoenix", "element": "Fire",
     "required_gems": ["ember-shard", "ember-shard", "ember-shard"],
     "color": "#F59E0B", "icon": "flame",
     "desc": "Three Ember Shards ignite simultaneously, summoning the Solar Phoenix from its stellar cradle.",
     "story_hook": "The shards combust into a pillar of white-hot stellar flame. From the inferno, a phoenix of pure sunlight regards you."},
    {"id": "void_weaver", "name": "The Void Weaver", "element": "Void",
     "required_gems": ["void-glass", "void-glass", "void-glass"],
     "color": "#6366F1", "icon": "eye",
     "desc": "Three Void Glass shards compress into a singularity, summoning the Void Weaver.",
     "story_hook": "Space folds around you like fabric. The Void Weaver exists in the spaces between atoms, and now it speaks directly into your consciousness."},
    {"id": "prismatic_ascendant", "name": "The Prismatic Ascendant", "element": "Light",
     "required_gems": ["prism-dust", "prism-dust", "prism-dust"],
     "color": "#FCD34D", "icon": "sun",
     "desc": "Three Prism Dusts refract into a beam of pure creation, revealing the Prismatic Ascendant.",
     "story_hook": "Light splits into infinite colors, each one a reality. The Ascendant stands at the nexus of all possible worlds."},
    {"id": "cosmic_convergence", "name": "Cosmic Convergence", "element": "All",
     "required_gems": ["singularity-seed", "akashic-shard", "nexus-heart"],
     "color": "#F0ABFC", "icon": "infinity",
     "desc": "The three cosmic gems converge. Reality trembles. The ultimate legendary path opens.",
     "story_hook": "Time, space, and consciousness collapse into a single point. You stand at the origin of everything. The universe remembers you."},
]


def _check_legendary_paths(all_gems):
    """Check which legendary paths are unlocked by user's total gem collection."""
    gem_counts = {}
    for g in all_gems:
        gid = g.get("id", "")
        gem_counts[gid] = gem_counts.get(gid, 0) + 1

    unlocked = []
    for path in LEGENDARY_PATHS:
        req_counts = {}
        for rg in path["required_gems"]:
            req_counts[rg] = req_counts.get(rg, 0) + 1
        if all(gem_counts.get(gid, 0) >= qty for gid, qty in req_counts.items()):
            unlocked.append(path["id"])
    return unlocked


async def _compute_ledger(user_id):
    """Compute the full cosmic ledger for a user."""
    chars = await db.starseed_characters.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(20)

    # Aggregate stats across all origins
    total_gems = 0
    total_equipment = 0
    total_xp = 0
    max_level = 0
    max_chapter = 0
    unique_origins = set()
    all_gems = []
    bosses_defeated = 0
    realms_explored = set()
    full_sets_equipped = False

    for ch in chars:
        gems = ch.get("gem_collection", [])
        equip = ch.get("equipment_collection", [])
        total_gems += len(gems)
        total_equipment += len(equip)
        total_xp += ch.get("xp", 0) + (ch.get("level", 1) - 1) * 100
        max_level = max(max_level, ch.get("level", 1))
        max_chapter = max(max_chapter, ch.get("chapter", 1))
        unique_origins.add(ch.get("origin_id", ""))
        all_gems.extend(gems)

        # Check for full sets
        active_sets = ch.get("active_set_bonuses", [])
        for sb in active_sets:
            if sb.get("pieces", 0) >= 4:
                full_sets_equipped = True

    # Boss defeats
    battles = await db.starseed_battles.count_documents(
        {"participants.user_id": user_id, "boss_defeated": True}
    )
    bosses_defeated = battles

    # Gallery stats
    gallery_entry = await db.avatar_gallery.find_one({"user_id": user_id}, {"_id": 0})
    radiates_received = gallery_entry.get("radiate_count", 0) if gallery_entry else 0
    has_gallery = gallery_entry is not None

    # Radiates given
    radiates_given = await db.avatar_gallery.count_documents({"radiated_by": user_id})

    # Crafted items
    crafted_items = sum(
        1 for ch in chars
        for eq in ch.get("equipment_collection", [])
        if eq.get("crafted")
    )
    crafted_legendary = sum(
        1 for ch in chars
        for eq in ch.get("equipment_collection", [])
        if eq.get("crafted") and eq.get("rarity") == "legendary"
    )
    enchanted = sum(
        1 for ch in chars
        for eq in ch.get("equipment_collection", [])
        if len(eq.get("enchantments", [])) > 0
    )

    # Legendary paths
    legendary_paths_unlocked = _check_legendary_paths(all_gems)

    # Compute achievements
    earned = []
    checks = {
        "first_steps": len(chars) > 0,
        "gem_collector_10": total_gems >= 10,
        "gem_collector_50": total_gems >= 50,
        "first_blood": bosses_defeated >= 1,
        "boss_slayer_5": bosses_defeated >= 5,
        "full_set_warrior": full_sets_equipped,
        "first_craft": crafted_items >= 1,
        "legendary_forger": crafted_legendary >= 1,
        "enchanter": enchanted >= 1,
        "gallery_debut": has_gallery,
        "radiant_soul": radiates_received >= 10,
        "cosmic_supporter": radiates_given >= 20,
        "chapter_5": max_chapter >= 5,
        "dual_origin": len(unique_origins) >= 2,
        "all_origins": len(unique_origins) >= 6,
        "legendary_path": len(legendary_paths_unlocked) > 0,
        "level_10": max_level >= 10,
        "total_xp_1000": total_xp >= 1000,
    }

    for ach in ACHIEVEMENT_DEFS:
        if checks.get(ach["id"], False):
            earned.append(ach["id"])

    return {
        "stats": {
            "total_characters": len(chars),
            "unique_origins": len(unique_origins),
            "origin_ids": list(unique_origins),
            "total_gems": total_gems,
            "total_equipment": total_equipment,
            "total_xp": total_xp,
            "max_level": max_level,
            "max_chapter": max_chapter,
            "bosses_defeated": bosses_defeated,
            "crafted_items": crafted_items,
            "radiates_received": radiates_received,
            "radiates_given": radiates_given,
        },
        "achievements": {
            "earned": earned,
            "total": len(ACHIEVEMENT_DEFS),
            "definitions": ACHIEVEMENT_DEFS,
        },
        "legendary_paths": {
            "unlocked": legendary_paths_unlocked,
            "all_paths": [{k: v for k, v in p.items() if k != "story_hook"} for p in LEGENDARY_PATHS],
        },
    }


# ─── API ENDPOINTS ───

@router.get("/starseed/ledger")
async def get_cosmic_ledger(user=Depends(get_current_user)):
    """Get the universal cosmic ledger for the current user."""
    ledger = await _compute_ledger(user["id"])
    return ledger


@router.get("/starseed/ledger/achievements")
async def get_achievements(user=Depends(get_current_user)):
    """Get achievement definitions and earned status."""
    ledger = await _compute_ledger(user["id"])
    return ledger["achievements"]


@router.get("/starseed/ledger/legendary-paths")
async def get_legendary_paths(user=Depends(get_current_user)):
    """Get legendary narrative paths and unlock status."""
    chars = await db.starseed_characters.find(
        {"user_id": user["id"]}, {"_id": 0, "gem_collection": 1}
    ).to_list(20)

    all_gems = []
    for ch in chars:
        all_gems.extend(ch.get("gem_collection", []))

    unlocked_ids = _check_legendary_paths(all_gems)

    gem_counts = {}
    for g in all_gems:
        gid = g.get("id", "")
        gem_counts[gid] = gem_counts.get(gid, 0) + 1

    paths_out = []
    for path in LEGENDARY_PATHS:
        req_counts = {}
        for rg in path["required_gems"]:
            req_counts[rg] = req_counts.get(rg, 0) + 1

        progress = []
        for gid, qty in req_counts.items():
            progress.append({"gem_id": gid, "required": qty, "has": min(gem_counts.get(gid, 0), qty)})

        paths_out.append({
            **{k: v for k, v in path.items() if k != "story_hook"},
            "unlocked": path["id"] in unlocked_ids,
            "progress": progress,
        })

    return {"paths": paths_out, "unlocked_count": len(unlocked_ids)}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REALM LEADERBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/starseed/leaderboard/realms")
async def get_realm_leaderboard(user=Depends(get_current_user)):
    """Multi-category realm leaderboard."""
    # Exploration depth (level-based across all chars)
    all_chars = await db.starseed_characters.find(
        {}, {"_id": 0, "user_id": 1, "level": 1, "origin_id": 1, "character_name": 1}
    ).sort("level", -1).limit(50).to_list(50)

    # Deduplicate by user (keep highest level)
    seen_users = {}
    exploration_board = []
    for ch in all_chars:
        uid = ch["user_id"]
        if uid not in seen_users:
            seen_users[uid] = True
            user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "name": 1})
            exploration_board.append({
                "user_id": uid,
                "name": user_doc.get("name", "Unknown") if user_doc else "Unknown",
                "level": ch.get("level", 1),
                "origin_id": ch.get("origin_id", ""),
                "character_name": ch.get("character_name", ""),
            })
        if len(exploration_board) >= 10:
            break

    # Brightest Aura (most gallery radiates received)
    aura_entries = await db.avatar_gallery.find(
        {}, {"_id": 0, "user_id": 1, "user_name": 1, "radiate_count": 1, "title": 1}
    ).sort("radiate_count", -1).limit(10).to_list(10)

    brightest_aura = [{
        "user_id": e["user_id"],
        "name": e.get("user_name", "Unknown"),
        "radiates": e.get("radiate_count", 0),
        "avatar_title": e.get("title", ""),
    } for e in aura_entries if e.get("radiate_count", 0) > 0]

    # Most Helpful (most radiates given to others)
    pipeline = [
        {"$unwind": "$radiated_by"},
        {"$group": {"_id": "$radiated_by", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    helpful_cursor = db.avatar_gallery.aggregate(pipeline)
    helpful_raw = await helpful_cursor.to_list(10)

    most_helpful = []
    for h in helpful_raw:
        user_doc = await db.users.find_one({"id": h["_id"]}, {"_id": 0, "name": 1})
        most_helpful.append({
            "user_id": h["_id"],
            "name": user_doc.get("name", "Unknown") if user_doc else "Unknown",
            "radiates_given": h["count"],
        })

    # First to Enter (track portal unlocks)
    first_entries = await db.realm_first_entries.find(
        {}, {"_id": 0}
    ).sort("entered_at", 1).to_list(20)

    return {
        "exploration": exploration_board,
        "brightest_aura": brightest_aura,
        "most_helpful": most_helpful,
        "first_to_enter": first_entries,
    }


@router.post("/starseed/leaderboard/realm-entry")
async def record_realm_entry(data: dict = Body(...), user=Depends(get_current_user)):
    """Record first entry into a realm for 'First to Enter' badge."""
    realm_id = data.get("realm_id")
    if not realm_id:
        raise HTTPException(status_code=400, detail="realm_id required")

    existing = await db.realm_first_entries.find_one({"realm_id": realm_id}, {"_id": 0})
    if existing:
        return {"already_claimed": True, "first_entry": existing}

    entry = {
        "id": str(uuid.uuid4()),
        "realm_id": realm_id,
        "user_id": user["id"],
        "user_name": user.get("name", "Unknown"),
        "entered_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.realm_first_entries.insert_one(entry)
    return {"claimed": True, "first_entry": {k: v for k, v in entry.items() if k != "_id"}}

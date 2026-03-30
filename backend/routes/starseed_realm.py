import asyncio
import uuid
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()

STARSEED_ORIGIN_COLORS = {
    "pleiadian": "#818CF8", "sirian": "#38BDF8", "arcturian": "#A855F7",
    "lyran": "#F59E0B", "andromedan": "#0EA5E9", "orion": "#DC2626",
}

STARSEED_ORIGIN_NAMES = {
    "pleiadian": "Pleiadian", "sirian": "Sirian", "arcturian": "Arcturian",
    "lyran": "Lyran", "andromedan": "Andromedan", "orion": "Orion",
}

WORLD_EVENTS = [
    {
        "id": "great-convergence",
        "title": "The Great Convergence",
        "description": "All star systems align — a pulse of unified energy surges through the cosmic grid. Starseeds of every origin feel the call to gather.",
        "bonus": "All XP gains doubled",
        "atmosphere": "epic",
    },
    {
        "id": "orion-rift",
        "title": "The Orion Rift Opens",
        "description": "A dimensional tear appears near Betelgeuse. Shadow energy leaks into the realm. Orion starseeds feel their power surge while others sense unease.",
        "bonus": "Orion +3 Resilience, all others +1 Courage",
        "atmosphere": "dark",
    },
    {
        "id": "pleiadian-bloom",
        "title": "The Pleiadian Bloom",
        "description": "The Seven Sisters radiate a healing frequency across the galaxy. Light fills every corner of the realm, mending old wounds.",
        "bonus": "Pleiadian +3 Compassion, all others +1 Wisdom",
        "atmosphere": "peaceful",
    },
    {
        "id": "arcturian-gateway",
        "title": "Arcturian Gateway Activation",
        "description": "The great crystalline gateway of Arcturus pulses to life, revealing hidden dimensions and forgotten knowledge.",
        "bonus": "Arcturian +3 Wisdom, all others +1 Intuition",
        "atmosphere": "ethereal",
    },
    {
        "id": "lyran-fire",
        "title": "Lyran Ancestral Fire",
        "description": "The forge of Vega reignites with primordial fire. The first flame of creation burns across the realm, calling all warriors home.",
        "bonus": "Lyran +3 Courage, all others +1 Resilience",
        "atmosphere": "epic",
    },
    {
        "id": "andromedan-signal",
        "title": "The Andromedan Signal",
        "description": "A telepathic wave from the Andromeda Galaxy washes over all starseeds, temporarily unlocking deep psychic channels.",
        "bonus": "Andromedan +3 Intuition, all others +1 Compassion",
        "atmosphere": "mystical",
    },
    {
        "id": "sirian-tide",
        "title": "The Sirian Star Tide",
        "description": "The cosmic oceans of Sirius overflow their banks, sending waves of ancient knowledge cascading through the realm.",
        "bonus": "Sirian +3 Wisdom, all others +1 Resilience",
        "atmosphere": "mystical",
    },
]


# ─── Presence / Active Players ───

@router.post("/starseed/realm/heartbeat")
async def realm_heartbeat(data: dict = Body(...), user=Depends(get_current_user)):
    """Update player presence in the realm."""
    uid = user["id"]
    origin_id = data.get("origin_id")
    chapter = data.get("chapter", 1)
    scene = data.get("scene", 0)

    now = datetime.now(timezone.utc)
    await db.starseed_realm_presence.update_one(
        {"user_id": uid},
        {"$set": {
            "user_id": uid,
            "name": user.get("name", "Traveler"),
            "origin_id": origin_id,
            "chapter": chapter,
            "scene": scene,
            "last_active": now.isoformat(),
            "online": True,
        }},
        upsert=True,
    )
    return {"status": "ok"}


@router.get("/starseed/realm/active-players")
async def get_active_players(user=Depends(get_current_user)):
    """Get all active players in the realm (active in last 5 minutes)."""
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    players = await db.starseed_realm_presence.find(
        {"last_active": {"$gte": cutoff}, "online": True},
        {"_id": 0},
    ).to_list(100)

    # Enrich with character data
    enriched = []
    for p in players:
        char = await db.starseed_characters.find_one(
            {"user_id": p["user_id"], "origin_id": p.get("origin_id")},
            {"_id": 0, "character_name": 1, "level": 1, "origin_id": 1, "chapter": 1, "scene": 1, "stats": 1},
        )
        if char:
            enriched.append({
                "user_id": p["user_id"],
                "player_name": p.get("name", "Traveler"),
                "character_name": char.get("character_name", "Traveler"),
                "origin_id": char.get("origin_id"),
                "level": char.get("level", 1),
                "chapter": char.get("chapter", 1),
                "scene": char.get("scene", 0),
                "color": STARSEED_ORIGIN_COLORS.get(char.get("origin_id"), "#818CF8"),
                "origin_name": STARSEED_ORIGIN_NAMES.get(char.get("origin_id"), "Unknown"),
                "is_self": p["user_id"] == user["id"],
            })

    return {"players": enriched, "total": len(enriched)}


# ─── Leaderboard ───

@router.get("/starseed/realm/leaderboard")
async def get_leaderboard(user=Depends(get_current_user)):
    """Get top adventurers ranked by level and XP."""
    pipeline = [
        {"$sort": {"level": -1, "xp": -1}},
        {"$limit": 30},
        {"$project": {"_id": 0, "user_id": 1, "character_name": 1, "origin_id": 1, "level": 1, "xp": 1, "chapter": 1, "achievements": 1}},
    ]
    chars = await db.starseed_characters.aggregate(pipeline).to_list(30)

    leaderboard = []
    for i, ch in enumerate(chars):
        leaderboard.append({
            "rank": i + 1,
            "character_name": ch.get("character_name", "Traveler"),
            "origin_id": ch.get("origin_id"),
            "origin_name": STARSEED_ORIGIN_NAMES.get(ch.get("origin_id"), "Unknown"),
            "color": STARSEED_ORIGIN_COLORS.get(ch.get("origin_id"), "#818CF8"),
            "level": ch.get("level", 1),
            "xp": ch.get("xp", 0),
            "chapter": ch.get("chapter", 1),
            "achievements": len(ch.get("achievements", [])),
            "is_self": ch.get("user_id") == user["id"],
        })

    return {"leaderboard": leaderboard}


# ─── Cross-Path Encounters ───

@router.post("/starseed/realm/encounter/request")
async def request_encounter(data: dict = Body(...), user=Depends(get_current_user)):
    """Request a cross-path encounter with another player (or auto-match)."""
    uid = user["id"]
    target_user_id = data.get("target_user_id")
    origin_id = data.get("origin_id")

    my_char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if not my_char:
        raise HTTPException(status_code=404, detail="Create a character first")

    # If no target, auto-match with a nearby player
    if not target_user_id:
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
        nearby = await db.starseed_realm_presence.find(
            {
                "last_active": {"$gte": cutoff},
                "online": True,
                "user_id": {"$ne": uid},
            },
            {"_id": 0},
        ).to_list(20)

        if not nearby:
            # Generate NPC encounter instead
            return await _generate_npc_encounter(my_char, origin_id, uid)

        # Pick the closest player by chapter
        import random as rnd
        target = rnd.choice(nearby)
        target_user_id = target["user_id"]

    # Get target character
    target_char = await db.starseed_characters.find_one(
        {"user_id": target_user_id}, {"_id": 0}
    )
    if not target_char:
        return await _generate_npc_encounter(my_char, origin_id, uid)

    # Create encounter
    encounter_id = str(uuid.uuid4())
    encounter = {
        "id": encounter_id,
        "player_1": {
            "user_id": uid,
            "character_name": my_char.get("character_name"),
            "origin_id": my_char.get("origin_id"),
            "level": my_char.get("level", 1),
            "stats": my_char.get("stats", {}),
        },
        "player_2": {
            "user_id": target_user_id,
            "character_name": target_char.get("character_name"),
            "origin_id": target_char.get("origin_id"),
            "level": target_char.get("level", 1),
            "stats": target_char.get("stats", {}),
        },
        "status": "generating",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_encounters.insert_one({**encounter})

    # Generate the shared encounter scene
    scene = await _generate_encounter_scene(encounter)

    await db.starseed_encounters.update_one(
        {"id": encounter_id},
        {"$set": {"scene": scene, "status": "active"}},
    )

    encounter["scene"] = scene
    encounter["status"] = "active"
    return encounter


async def _generate_npc_encounter(my_char, origin_id, uid):
    """Generate encounter with an AI-controlled NPC starseed."""
    import random as rnd

    other_origins = [o for o in STARSEED_ORIGIN_NAMES.keys() if o != origin_id]
    npc_origin = rnd.choice(other_origins)
    npc_names = {
        "pleiadian": "Aelara the Lightweaver",
        "sirian": "Thalok the Tidecaller",
        "arcturian": "Zyn'ari the Gridwalker",
        "lyran": "Kael the Fireborn",
        "andromedan": "Nexia the Mindbreaker",
        "orion": "Vex'thar the Shadowblade",
    }
    npc_name = npc_names.get(npc_origin, "A mysterious traveler")

    encounter = {
        "id": str(uuid.uuid4()),
        "player_1": {
            "user_id": uid,
            "character_name": my_char.get("character_name"),
            "origin_id": my_char.get("origin_id"),
            "level": my_char.get("level", 1),
            "stats": my_char.get("stats", {}),
        },
        "player_2": {
            "user_id": "npc",
            "character_name": npc_name,
            "origin_id": npc_origin,
            "level": max(1, my_char.get("level", 1) + rnd.randint(-2, 2)),
            "stats": {k: max(1, v + rnd.randint(-2, 3)) for k, v in my_char.get("stats", {}).items()},
            "is_npc": True,
        },
        "is_npc_encounter": True,
        "status": "generating",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_encounters.insert_one({**encounter})

    scene = await _generate_encounter_scene(encounter)
    encounter["scene"] = scene
    encounter["status"] = "active"

    await db.starseed_encounters.update_one(
        {"id": encounter["id"]},
        {"$set": {"scene": scene, "status": "active"}},
    )

    return encounter


async def _generate_encounter_scene(encounter):
    """Generate a shared narrative scene where two starseeds meet."""
    p1 = encounter["player_1"]
    p2 = encounter["player_2"]

    p1_origin = STARSEED_ORIGIN_NAMES.get(p1["origin_id"], "Unknown")
    p2_origin = STARSEED_ORIGIN_NAMES.get(p2["origin_id"], "Unknown")

    system_msg = f"""You are a cosmic storyteller narrating a cross-path encounter between two starseeds in an interactive RPG.

PLAYER 1: {p1['character_name']}, a Level {p1['level']} {p1_origin} starseed.
Stats: {json.dumps(p1.get('stats', {}))}

PLAYER 2: {p2['character_name']}, a Level {p2['level']} {p2_origin} starseed.
Stats: {json.dumps(p2.get('stats', {}))}

RULES:
- Write a cinematic 2nd-person narrative (150-200 words) describing their dramatic meeting
- The encounter should feel epic — like two legendary beings crossing paths in the void
- Reference each starseed's unique elemental/cultural traits
- Create exactly 3 choices that involve BOTH characters interacting
- Each choice should have consequences for both players
- Include dramatic tension, cosmic imagery, and emotional depth
- Return ONLY valid JSON

JSON format:
{{
  "narrative": "The encounter narrative...",
  "scene_title": "Title of encounter",
  "atmosphere": "one of: mystical, tense, peaceful, epic, dark, ethereal, triumphant",
  "encounter_type": "one of: alliance, challenge, revelation, trade, trial",
  "choices": [
    {{"text": "Choice text", "stat_effect": {{"courage": 1}}, "outcome_hint": "What happens", "xp": 25}},
    {{"text": "Choice text", "stat_effect": {{"wisdom": 1}}, "outcome_hint": "What happens", "xp": 20}},
    {{"text": "Choice text", "stat_effect": {{"compassion": 1}}, "outcome_hint": "What happens", "xp": 20}}
  ]
}}"""

    prompt = f"Generate an epic cross-path encounter between {p1['character_name']} ({p1_origin}) and {p2['character_name']} ({p2_origin}). Make it feel like a legendary moment where two cosmic beings meet for the first time."

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"encounter-{encounter['id'][:8]}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o")
        raw = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=25)
        raw_text = raw.text if hasattr(raw, "text") else str(raw)
        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Encounter scene gen error: {e}")
        return {
            "narrative": f"Across the cosmic void, two paths converge. {p1['character_name']}, the {p1_origin} traveler, senses a disturbance in the starfield. Turning, they find themselves face to face with {p2['character_name']}, a {p2_origin} starseed whose energy signature burns like a beacon. The space between them crackles with potential — two fragments of the universe's grand design, meeting at the crossroads of fate. Neither expected this encounter, yet both feel the gravity of this moment. The stars themselves seem to pause, waiting to see what unfolds.",
            "scene_title": "Crossroads of Fate",
            "atmosphere": "epic",
            "encounter_type": "revelation",
            "choices": [
                {"text": f"Step forward and extend your hand in alliance with {p2['character_name']}", "stat_effect": {"compassion": 2}, "outcome_hint": "A bond forms across the stars", "xp": 25},
                {"text": f"Challenge {p2['character_name']} to a test of cosmic strength", "stat_effect": {"courage": 2}, "outcome_hint": "Only one can claim dominance", "xp": 20},
                {"text": f"Open your mind and share visions with {p2['character_name']}", "stat_effect": {"wisdom": 2}, "outcome_hint": "Ancient knowledge flows between you", "xp": 20},
            ],
        }


@router.post("/starseed/realm/encounter/resolve")
async def resolve_encounter(data: dict = Body(...), user=Depends(get_current_user)):
    """Resolve an encounter by making a choice."""
    uid = user["id"]
    encounter_id = data.get("encounter_id")
    choice_index = data.get("choice_index", 0)

    enc = await db.starseed_encounters.find_one(
        {"id": encounter_id}, {"_id": 0}
    )
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")

    scene = enc.get("scene", {})
    choices = scene.get("choices", [])
    if not (0 <= choice_index < len(choices)):
        choice_index = 0

    chosen = choices[choice_index]
    stat_effect = chosen.get("stat_effect", {})
    xp_earned = chosen.get("xp", 20)

    # Apply to player's character
    p1 = enc.get("player_1", {})
    origin_id = p1.get("origin_id")
    if p1.get("user_id") == uid:
        origin_id = p1.get("origin_id")
    else:
        origin_id = enc.get("player_2", {}).get("origin_id")

    char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if char:
        stats = char.get("stats", {})
        for stat, delta in stat_effect.items():
            if stat in stats:
                stats[stat] = max(0, min(15, stats[stat] + delta))

        new_xp = char.get("xp", 0) + xp_earned
        new_level = char.get("level", 1)
        xp_to_next = char.get("xp_to_next", 100)
        leveled_up = False
        while new_xp >= xp_to_next:
            new_xp -= xp_to_next
            new_level += 1
            xp_to_next = int(xp_to_next * 1.4)
            leveled_up = True

        achievements = char.get("achievements", [])
        new_achievements = []
        if "first_encounter" not in achievements:
            achievements.append("first_encounter")
            new_achievements.append({"id": "first_encounter", "title": "First Contact", "desc": "Completed your first cross-path encounter"})

        encounters_count = await db.starseed_encounters.count_documents({
            "$or": [{"player_1.user_id": uid}, {"player_2.user_id": uid}],
            "status": "resolved",
        })
        if encounters_count >= 5 and "veteran_traveler" not in achievements:
            achievements.append("veteran_traveler")
            new_achievements.append({"id": "veteran_traveler", "title": "Veteran Traveler", "desc": "Completed 5 cross-path encounters"})

        await db.starseed_characters.update_one(
            {"user_id": uid, "origin_id": origin_id},
            {"$set": {
                "stats": stats,
                "xp": new_xp,
                "level": new_level,
                "xp_to_next": xp_to_next,
                "achievements": achievements,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )

        await db.starseed_encounters.update_one(
            {"id": encounter_id},
            {"$set": {"status": "resolved", "resolved_choice": choice_index}},
        )

        return {
            "result": chosen.get("outcome_hint", "The encounter resolves."),
            "stat_changes": stat_effect,
            "xp_earned": xp_earned,
            "leveled_up": leveled_up,
            "new_level": new_level,
            "new_achievements": new_achievements,
            "encounter_type": scene.get("encounter_type", "revelation"),
        }

    raise HTTPException(status_code=404, detail="Character not found")


# ─── Alliances ───

@router.post("/starseed/realm/alliance/create")
async def create_alliance(data: dict = Body(...), user=Depends(get_current_user)):
    """Create a cosmic alliance."""
    uid = user["id"]
    name = data.get("name", "Unnamed Alliance")

    existing = await db.starseed_alliances.find_one(
        {"members": uid}, {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already in an alliance")

    my_char = await db.starseed_characters.find_one(
        {"user_id": uid}, {"_id": 0, "character_name": 1, "origin_id": 1, "level": 1}
    )

    alliance = {
        "id": str(uuid.uuid4()),
        "name": name,
        "leader_id": uid,
        "members": [uid],
        "member_details": [{
            "user_id": uid,
            "character_name": my_char.get("character_name", "Traveler") if my_char else "Traveler",
            "origin_id": my_char.get("origin_id") if my_char else None,
            "level": my_char.get("level", 1) if my_char else 1,
            "role": "leader",
        }],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_alliances.insert_one({**alliance})
    return alliance


@router.post("/starseed/realm/alliance/join")
async def join_alliance(data: dict = Body(...), user=Depends(get_current_user)):
    """Join an existing alliance."""
    uid = user["id"]
    alliance_id = data.get("alliance_id")

    already = await db.starseed_alliances.find_one({"members": uid}, {"_id": 0})
    if already:
        raise HTTPException(status_code=400, detail="Already in an alliance")

    alliance = await db.starseed_alliances.find_one({"id": alliance_id}, {"_id": 0})
    if not alliance:
        raise HTTPException(status_code=404, detail="Alliance not found")

    if len(alliance.get("members", [])) >= 6:
        raise HTTPException(status_code=400, detail="Alliance is full (max 6)")

    my_char = await db.starseed_characters.find_one(
        {"user_id": uid}, {"_id": 0, "character_name": 1, "origin_id": 1, "level": 1}
    )

    await db.starseed_alliances.update_one(
        {"id": alliance_id},
        {
            "$push": {
                "members": uid,
                "member_details": {
                    "user_id": uid,
                    "character_name": my_char.get("character_name", "Traveler") if my_char else "Traveler",
                    "origin_id": my_char.get("origin_id") if my_char else None,
                    "level": my_char.get("level", 1) if my_char else 1,
                    "role": "member",
                },
            },
        },
    )
    updated = await db.starseed_alliances.find_one({"id": alliance_id}, {"_id": 0})
    return updated


@router.get("/starseed/realm/alliances")
async def list_alliances(user=Depends(get_current_user)):
    """List all alliances."""
    alliances = await db.starseed_alliances.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    return {"alliances": alliances, "my_alliance": None}


@router.get("/starseed/realm/my-alliance")
async def get_my_alliance(user=Depends(get_current_user)):
    """Get user's current alliance."""
    alliance = await db.starseed_alliances.find_one(
        {"members": user["id"]}, {"_id": 0}
    )
    return {"alliance": alliance}


# ─── World Events ───

@router.get("/starseed/realm/world-event")
async def get_current_world_event():
    """Get the current active world event (rotates every 6 hours)."""
    import hashlib
    now = datetime.now(timezone.utc)
    # Rotate event based on 6-hour windows
    event_seed = int(now.timestamp()) // (6 * 3600)
    event_index = event_seed % len(WORLD_EVENTS)
    event = WORLD_EVENTS[event_index]

    # Calculate time remaining
    next_window = (event_seed + 1) * 6 * 3600
    remaining_seconds = next_window - int(now.timestamp())
    hours_left = remaining_seconds // 3600
    minutes_left = (remaining_seconds % 3600) // 60

    return {
        **event,
        "time_remaining": f"{hours_left}h {minutes_left}m",
        "remaining_seconds": remaining_seconds,
    }


@router.get("/starseed/realm/encounter-history")
async def get_encounter_history(user=Depends(get_current_user)):
    """Get user's past encounters."""
    uid = user["id"]
    encounters = await db.starseed_encounters.find(
        {"$or": [{"player_1.user_id": uid}, {"player_2.user_id": uid}]},
        {"_id": 0},
    ).sort("created_at", -1).to_list(20)
    return {"encounters": encounters}

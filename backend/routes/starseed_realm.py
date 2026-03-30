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


# ─── Alliance Chat ───

@router.post("/starseed/realm/chat/send")
async def send_chat_message(data: dict = Body(...), user=Depends(get_current_user)):
    """Send a message in alliance chat."""
    uid = user["id"]
    text = data.get("text", "").strip()
    if not text or len(text) > 500:
        raise HTTPException(status_code=400, detail="Message must be 1-500 chars")

    alliance = await db.starseed_alliances.find_one({"members": uid}, {"_id": 0})
    if not alliance:
        raise HTTPException(status_code=403, detail="Join an alliance to chat")

    char = await db.starseed_characters.find_one(
        {"user_id": uid}, {"_id": 0, "character_name": 1, "origin_id": 1, "level": 1}
    )

    msg_type = data.get("type", "message")  # message, encounter_share, achievement
    msg = {
        "id": str(uuid.uuid4()),
        "alliance_id": alliance["id"],
        "user_id": uid,
        "character_name": char.get("character_name", "Traveler") if char else "Traveler",
        "origin_id": char.get("origin_id") if char else None,
        "level": char.get("level", 1) if char else 1,
        "text": text,
        "type": msg_type,
        "metadata": data.get("metadata", {}),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_chat.insert_one({**msg})
    return msg


@router.get("/starseed/realm/chat/{alliance_id}")
async def get_chat_messages(alliance_id: str, user=Depends(get_current_user)):
    """Get recent chat messages for an alliance."""
    alliance = await db.starseed_alliances.find_one(
        {"id": alliance_id, "members": user["id"]}, {"_id": 0}
    )
    if not alliance:
        raise HTTPException(status_code=403, detail="Not a member of this alliance")

    messages = await db.starseed_chat.find(
        {"alliance_id": alliance_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    messages.reverse()
    return {"messages": messages}


# ─── Cooperative Boss Encounters ───

COSMIC_BOSSES = [
    {
        "id": "void-leviathan",
        "name": "The Void Leviathan",
        "description": "A colossal entity born from the space between galaxies. It feeds on the light of dying stars and leaves only silence in its wake.",
        "element": "Void",
        "color": "#6366F1",
        "difficulty": "epic",
        "hp": 300,
        "phases": 3,
        "weakness": "compassion",
        "resistance": "courage",
        "lore": "When the first stars formed, one was born inverted — a star that consumed light instead of creating it. Over eons, it grew into the Void Leviathan, a being so vast that entire nebulae serve as its scales. It drifts through the cosmos, drawn to concentrations of starseed energy.",
    },
    {
        "id": "entropy-weaver",
        "name": "The Entropy Weaver",
        "description": "A fractal intelligence that unravels the fabric of reality itself. Where it passes, time flows backwards and dimensions fold in on themselves.",
        "element": "Chaos",
        "color": "#DC2626",
        "difficulty": "legendary",
        "hp": 400,
        "phases": 3,
        "weakness": "wisdom",
        "resistance": "resilience",
        "lore": "Born at the moment of the Big Bang, the Entropy Weaver is the universe's memory of its own death. It weaves threads of chaos through the cosmic tapestry, unmaking what was made. Only those who understand the deepest patterns can perceive — and resist — its influence.",
    },
    {
        "id": "fallen-archon",
        "name": "The Fallen Archon",
        "description": "Once a guardian of the Arcturian crystalline grid, this being was corrupted by the Orion Wars. It now seeks to shatter the dimensional barriers.",
        "element": "Crystal-Shadow",
        "color": "#A855F7",
        "difficulty": "epic",
        "hp": 350,
        "phases": 3,
        "weakness": "intuition",
        "resistance": "wisdom",
        "lore": "The Archon once held the highest seat in the Arcturian council — the Keeper of the Grid. But during the Orion Wars, it absorbed too much shadow energy trying to protect the gateway. Now it exists as a being of fractured light, neither fully dark nor light, driven by a corrupted desire to 'protect' reality by destroying it.",
    },
    {
        "id": "dream-parasite",
        "name": "The Dream Parasite",
        "description": "A psychic entity that infiltrates the collective consciousness, trapping starseeds in loops of illusion and false memory.",
        "element": "Psychic",
        "color": "#EC4899",
        "difficulty": "hard",
        "hp": 250,
        "phases": 3,
        "weakness": "courage",
        "resistance": "intuition",
        "lore": "In the Andromedan telepathic networks, whispers spread of an entity that was never born but somehow exists — the Dream Parasite. It slips between thoughts, feeding on fear and doubt. Its victims don't know they're trapped, living out false lives while their true cosmic essence is slowly drained.",
    },
    {
        "id": "star-devourer",
        "name": "Zar'ghul the Star Devourer",
        "description": "An ancient dragon-like entity from before the Lyran civilization. It consumes stars to fuel its impossible existence across multiple dimensions.",
        "element": "Fire-Void",
        "color": "#F59E0B",
        "difficulty": "legendary",
        "hp": 450,
        "phases": 3,
        "weakness": "resilience",
        "resistance": "compassion",
        "lore": "Before the Lyrans built their first cities, Zar'ghul already ancient. A being of primordial fire twisted by the void, it is said to have devoured three star systems during the Lyran Age. Now it stirs again, drawn by the concentrated starseed energy gathering on Earth.",
    },
]


@router.get("/starseed/realm/bosses")
async def get_available_bosses(user=Depends(get_current_user)):
    """Get list of available boss encounters."""
    bosses = [{k: v for k, v in b.items() if k != "lore"} for b in COSMIC_BOSSES]
    return {"bosses": bosses}


@router.get("/starseed/realm/boss/history")
async def get_boss_history(user=Depends(get_current_user)):
    """Get user's boss battle history."""
    uid = user["id"]
    battles = await db.starseed_boss_battles.find(
        {"participants.user_id": uid},
        {"_id": 0, "id": 1, "boss_id": 1, "boss_name": 1, "status": 1, "created_at": 1, "boss_current_hp": 1, "boss_hp": 1},
    ).sort("created_at", -1).to_list(20)
    return {"battles": battles}


@router.get("/starseed/realm/boss/{boss_id}")
async def get_boss_detail(boss_id: str):
    """Get full boss details including lore."""
    boss = next((b for b in COSMIC_BOSSES if b["id"] == boss_id), None)
    if not boss:
        raise HTTPException(status_code=404, detail="Boss not found")
    return boss


@router.post("/starseed/realm/boss/initiate")
async def initiate_boss_encounter(data: dict = Body(...), user=Depends(get_current_user)):
    """Start a boss encounter. Solo or alliance-based."""
    uid = user["id"]
    boss_id = data.get("boss_id")
    origin_id = data.get("origin_id")

    boss = next((b for b in COSMIC_BOSSES if b["id"] == boss_id), None)
    if not boss:
        raise HTTPException(status_code=404, detail="Boss not found")

    char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    # Get alliance members if in alliance
    alliance = await db.starseed_alliances.find_one({"members": uid}, {"_id": 0})
    participants = [{
        "user_id": uid,
        "character_name": char.get("character_name", "Traveler"),
        "origin_id": char.get("origin_id"),
        "level": char.get("level", 1),
        "stats": char.get("stats", {}),
        "is_leader": True,
    }]

    # Add NPC allies for solo or small groups
    import random as rnd
    npc_allies_needed = max(0, 2 - len(participants))
    npc_names_pool = [
        ("Aelara the Lightweaver", "pleiadian"),
        ("Thalok the Tidecaller", "sirian"),
        ("Zyn'ari the Gridwalker", "arcturian"),
        ("Kael the Fireborn", "lyran"),
        ("Nexia the Mindbreaker", "andromedan"),
        ("Vex'thar the Shadowblade", "orion"),
    ]
    available_npcs = [n for n in npc_names_pool if n[1] != origin_id]
    for npc_name, npc_origin in rnd.sample(available_npcs, min(npc_allies_needed, len(available_npcs))):
        participants.append({
            "user_id": "npc",
            "character_name": npc_name,
            "origin_id": npc_origin,
            "level": max(1, char.get("level", 1) + rnd.randint(-1, 2)),
            "stats": {k: max(1, v + rnd.randint(-2, 3)) for k, v in char.get("stats", {}).items()},
            "is_npc": True,
        })

    battle_id = str(uuid.uuid4())
    battle = {
        "id": battle_id,
        "boss_id": boss_id,
        "boss_name": boss["name"],
        "boss_hp": boss["hp"],
        "boss_current_hp": boss["hp"],
        "boss_color": boss["color"],
        "phase": 1,
        "max_phases": boss["phases"],
        "participants": participants,
        "alliance_id": alliance["id"] if alliance else None,
        "rounds": [],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_boss_battles.insert_one({**battle})

    # Generate first phase
    scene = await _generate_boss_phase(battle, boss)

    await db.starseed_boss_battles.update_one(
        {"id": battle_id},
        {"$set": {"current_scene": scene}},
    )

    battle["current_scene"] = scene
    return battle


async def _generate_boss_phase(battle, boss):
    """Generate a boss encounter phase using AI."""
    phase = battle.get("phase", 1)
    participants_desc = ", ".join([
        f"{p['character_name']} (Lvl {p['level']} {STARSEED_ORIGIN_NAMES.get(p['origin_id'], 'Unknown')})"
        for p in battle["participants"]
    ])
    rounds = battle.get("rounds", [])
    prev_summary = ""
    if rounds:
        prev_summary = "PREVIOUS ROUNDS:\n" + "\n".join([
            f"- Phase {r.get('phase')}: {r.get('choice_text', 'N/A')} → {r.get('outcome', 'N/A')[:80]}"
            for r in rounds[-3:]
        ])

    hp_pct = (battle["boss_current_hp"] / battle["boss_hp"]) * 100

    system_msg = f"""You are narrating a cooperative boss encounter in a cosmic starseed RPG.

THE BOSS: {boss['name']} - {boss['description']}
Element: {boss['element']} | HP: {battle['boss_current_hp']}/{battle['boss_hp']} ({hp_pct:.0f}%)
Weakness: {boss['weakness']} | Resistance: {boss['resistance']}
Phase {phase}/{boss['phases']}

HEROES: {participants_desc}

RULES:
- Write a dramatic 2nd-person plural narrative (150-200 words) describing the current battle phase
- Phase 1 = Boss emerges, Phase 2 = Boss enrages, Phase 3 = Final stand
- Create exactly 3 tactical choices that involve the whole party
- Each choice should leverage different stats and have different damage/healing outcomes
- Include a "damage" field (int 50-120) and "team_heal" field (int 0-30) for each choice
- The boss's weakness stat deals bonus damage, resistance stat deals less
- Return ONLY valid JSON

JSON format:
{{
  "narrative": "Battle narrative...",
  "phase_title": "Phase title",
  "atmosphere": "epic/dark/tense/triumphant",
  "boss_action": "What the boss does this round",
  "boss_damage_to_party": 15,
  "choices": [
    {{"text": "Tactical choice", "stat_used": "courage", "damage": 80, "team_heal": 10, "outcome_hint": "Brief hint"}},
    {{"text": "Tactical choice", "stat_used": "wisdom", "damage": 60, "team_heal": 20, "outcome_hint": "Brief hint"}},
    {{"text": "Tactical choice", "stat_used": "compassion", "damage": 70, "team_heal": 15, "outcome_hint": "Brief hint"}}
  ]
}}"""

    prompt = f"""{prev_summary}
Generate Phase {phase} of the boss battle against {boss['name']}. {"The heroes approach the cosmic threat..." if phase == 1 else f"The battle rages — the boss is at {hp_pct:.0f}% HP." if phase == 2 else "This is the FINAL PHASE — everything leads to this moment!"}"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"boss-{battle['id'][:8]}",
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
        logger.error(f"Boss phase gen error: {e}")
        return {
            "narrative": f"The {boss['name']} looms before you, its {boss['element']} energy crackling through the void. Your party stands united — {participants_desc}. The cosmic beast prepares its next assault. You must decide how to face this phase of the battle.",
            "phase_title": f"Phase {phase}: {'The Awakening' if phase == 1 else 'The Fury' if phase == 2 else 'Final Stand'}",
            "atmosphere": "epic" if phase < 3 else "dark",
            "boss_action": f"The {boss['name']} unleashes a wave of {boss['element']} energy",
            "boss_damage_to_party": 15,
            "choices": [
                {"text": "Coordinate a combined assault, channeling all your courage", "stat_used": "courage", "damage": 90, "team_heal": 5, "outcome_hint": "Maximum damage, risky"},
                {"text": "Analyze the boss's weakness pattern and strike precisely", "stat_used": "wisdom", "damage": 70, "team_heal": 15, "outcome_hint": "Balanced approach"},
                {"text": "Shield the party and heal while looking for an opening", "stat_used": "resilience", "damage": 50, "team_heal": 25, "outcome_hint": "Defensive, sustaining"},
            ],
        }


@router.post("/starseed/realm/boss/action")
async def boss_action(data: dict = Body(...), user=Depends(get_current_user)):
    """Make a choice in a boss encounter phase."""
    uid = user["id"]
    battle_id = data.get("battle_id")
    choice_index = data.get("choice_index", 0)

    battle = await db.starseed_boss_battles.find_one({"id": battle_id}, {"_id": 0})
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    if battle.get("status") != "active":
        raise HTTPException(status_code=400, detail="Battle already ended")

    scene = battle.get("current_scene", {})
    choices = scene.get("choices", [])
    if not (0 <= choice_index < len(choices)):
        choice_index = 0

    chosen = choices[choice_index]
    damage = chosen.get("damage", 60)
    team_heal = chosen.get("team_heal", 10)
    stat_used = chosen.get("stat_used", "courage")
    boss_dmg = scene.get("boss_damage_to_party", 15)

    # ─── EQUIPMENT & GEM COMBAT INTEGRATION ───
    origin_id = None
    for p in battle.get("participants", []):
        if p.get("user_id") == uid:
            origin_id = p.get("origin_id")
            break

    equipment_bonus = 0
    resonance_multiplier = 1.0
    active_gem_effects = []

    if origin_id:
        char_data = await db.starseed_characters.find_one(
            {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
        )
        if char_data:
            equipped_gear = char_data.get("equipped_gear", {})
            equipment_coll = char_data.get("equipment_collection", [])
            active_set_bonuses = char_data.get("active_set_bonuses", [])

            # Sum stat bonuses from equipped gear
            for slot, iid in equipped_gear.items():
                eq = next((e for e in equipment_coll if e.get("instance_id") == iid), None)
                if eq:
                    stat_bonus = eq.get("stat_bonus", {})
                    relevant = stat_bonus.get(stat_used, 0)
                    equipment_bonus += relevant * 3  # Each stat point = 3 damage

                    # Socketed gem bonuses
                    for sg in eq.get("socketed_gems", []):
                        socket_bonus = sg.get("socket_bonus", {})
                        gem_relevant = socket_bonus.get(stat_used, 0)
                        equipment_bonus += gem_relevant * 2
                        if sg.get("name"):
                            active_gem_effects.append(sg["name"])

                    # Enchantment effects
                    for ench in eq.get("enchantments", []):
                        if ench["id"] == "fortify":
                            equipment_bonus += 5
                        elif ench["id"] == "awaken":
                            resonance_multiplier += 0.15

            # Set bonus effects
            for sb in active_set_bonuses:
                bonus_stats = sb.get("bonus", {}).get("stats", {})
                set_relevant = bonus_stats.get(stat_used, 0)
                equipment_bonus += set_relevant * 2
                special = sb.get("bonus", {}).get("special")
                if special == "star_strike":
                    resonance_multiplier += 0.2
                elif special == "void_step":
                    boss_dmg = max(5, boss_dmg - 5)
                elif special == "portal_sight":
                    team_heal += 10

            # Gem resonance: if boss weakness matches a carried gem element
            gem_collection = char_data.get("gem_collection", [])
            boss_obj = next((b for b in COSMIC_BOSSES if b["id"] == battle["boss_id"]), None)
            if boss_obj and gem_collection:
                boss_weak_element = {
                    "courage": "Fire", "wisdom": "Crystal", "compassion": "Light",
                    "intuition": "Void", "resilience": "Shadow"
                }.get(boss_obj.get("weakness"), "")
                has_resonance = any(g.get("element") == boss_weak_element for g in gem_collection)
                if has_resonance:
                    resonance_multiplier += 0.25

    # Apply formula: Damage = (Base + Equipment Bonus) × Resonance Multiplier
    damage = int((damage + equipment_bonus) * resonance_multiplier)

    # Get boss weakness/resistance
    boss = next((b for b in COSMIC_BOSSES if b["id"] == battle["boss_id"]), None)
    if boss and stat_used == boss.get("weakness"):
        damage = int(damage * 1.5)
    elif boss and stat_used == boss.get("resistance"):
        damage = int(damage * 0.6)

    new_hp = max(0, battle["boss_current_hp"] - damage)
    current_phase = battle.get("phase", 1)
    max_phases = battle.get("max_phases", 3)

    rounds = battle.get("rounds", [])
    rounds.append({
        "phase": current_phase,
        "choice_text": chosen["text"],
        "stat_used": stat_used,
        "damage_dealt": damage,
        "team_healed": team_heal,
        "boss_damage": boss_dmg,
        "outcome": chosen.get("outcome_hint", ""),
    })

    # Check boss defeated
    boss_defeated = new_hp <= 0
    battle_over = boss_defeated or current_phase >= max_phases

    # Advance phase if not defeated
    next_phase = current_phase + 1 if not boss_defeated else current_phase

    update = {
        "boss_current_hp": new_hp,
        "phase": next_phase,
        "rounds": rounds,
    }

    if battle_over:
        update["status"] = "victory" if boss_defeated else "defeat"

        # Award XP and achievements to player
        origin_id = None
        for p in battle.get("participants", []):
            if p.get("user_id") == uid:
                origin_id = p.get("origin_id")
                break

        if origin_id:
            char = await db.starseed_characters.find_one(
                {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
            )
            if char:
                xp_reward = 100 if boss_defeated else 30
                new_xp = char.get("xp", 0) + xp_reward
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
                if boss_defeated and "boss_slayer" not in achievements:
                    achievements.append("boss_slayer")
                    new_achievements.append({"id": "boss_slayer", "title": "Boss Slayer", "desc": f"Defeated {battle.get('boss_name')}"})

                stats = char.get("stats", {})
                loot_drop = None
                if boss_defeated:
                    for stat in stats:
                        stats[stat] = min(15, stats[stat] + 1)
                    # Roll for loot
                    from routes.starseed_adventure import roll_loot
                    loot_drop = roll_loot(battle.get("boss_id"))
                    if loot_drop:
                        inventory = char.get("inventory", [])
                        # Don't add duplicate
                        if not any(i["id"] == loot_drop["id"] for i in inventory):
                            inventory.append(loot_drop)

                update_fields = {
                    "xp": new_xp, "level": new_level, "xp_to_next": xp_to_next,
                    "stats": stats, "achievements": achievements,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
                if loot_drop:
                    update_fields["inventory"] = char.get("inventory", [])
                    if not any(i["id"] == loot_drop["id"] for i in update_fields["inventory"]):
                        update_fields["inventory"].append(loot_drop)

                await db.starseed_characters.update_one(
                    {"user_id": uid, "origin_id": origin_id},
                    {"$set": update_fields},
                )

                update["reward"] = {
                    "xp_earned": xp_reward,
                    "leveled_up": leveled_up,
                    "new_level": new_level,
                    "new_achievements": new_achievements,
                    "stat_bonus": "+1 all stats" if boss_defeated else None,
                    "loot_drop": loot_drop,
                }

    await db.starseed_boss_battles.update_one({"id": battle_id}, {"$set": update})

    result = {
        "damage_dealt": damage,
        "team_healed": team_heal,
        "boss_damage": boss_dmg,
        "boss_hp": new_hp,
        "boss_max_hp": battle["boss_hp"],
        "stat_used": stat_used,
        "was_weakness": boss and stat_used == boss.get("weakness"),
        "was_resistance": boss and stat_used == boss.get("resistance"),
        "battle_over": battle_over,
        "boss_defeated": boss_defeated,
        "phase": next_phase,
        "choice_text": chosen["text"],
        "equipment_bonus": equipment_bonus,
        "resonance_multiplier": round(resonance_multiplier, 2),
        "active_gem_effects": active_gem_effects[:5],
    }

    if battle_over:
        result["reward"] = update.get("reward", {})
        return result

    # Generate next phase
    battle["boss_current_hp"] = new_hp
    battle["phase"] = next_phase
    battle["rounds"] = rounds
    next_scene = await _generate_boss_phase(battle, boss)

    await db.starseed_boss_battles.update_one(
        {"id": battle_id},
        {"$set": {"current_scene": next_scene}},
    )

    result["next_scene"] = next_scene
    return result

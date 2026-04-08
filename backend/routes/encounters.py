from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from engines.crystal_seal import COMMUNAL_GOALS, secure_hash
import random

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENVIRONMENTAL BOSSES & NPC RIVALS
#  Unstable Veins (timer puzzles), Rival NPCs (Sprinter/Specialist),
#  World Veins (collective frequency bosses)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Rival NPC Archetypes ──
NPC_ARCHETYPES = {
    "sprinter": {
        "id": "sprinter",
        "name": "The Sprinter",
        "title": "Bulk Miner",
        "description": "Competes to grab high volumes of common stones. Creates a race to mine faster.",
        "strategy": "volume",
        "speed": 0.8,
        "target_rarity": ["common", "uncommon"],
        "steal_chance": 0.15,
        "icon": "zap",
        "color": "#F59E0B",
        "dialogue": [
            "You're too slow! Those quartz crystals are mine!",
            "I'll strip this vein clean before you even calibrate your scanner.",
            "Speed beats precision every time, prospector.",
        ],
    },
    "specialist": {
        "id": "specialist",
        "name": "The Specialist",
        "title": "Legendary Hunter",
        "description": "Tracks the single legendary rock you are hunting. Forces you to use stealth or speed buffs.",
        "strategy": "precision",
        "speed": 0.5,
        "target_rarity": ["epic", "legendary", "mythic"],
        "steal_chance": 0.25,
        "icon": "eye",
        "color": "#A855F7",
        "dialogue": [
            "That Larimar has my name on it. Back off.",
            "I've been tracking this specimen for weeks. You're just a tourist.",
            "Only one of us walks away with that diamond. Choose wisely.",
        ],
    },
}

# ── Environmental Boss Types ──
BOSS_TYPES = {
    "unstable_vein": {
        "id": "unstable_vein",
        "name": "Unstable Vein",
        "description": "A rich mineral vein is exposed, but the cave walls are cracking. Shore up the supports before it collapses!",
        "mechanic": "timer_puzzle",
        "time_limit_seconds": 60,
        "required_actions": 5,
        "reward_multiplier": 3.0,
        "xp_bonus": 50,
        "dust_bonus": 30,
        "color": "#EF4444",
        "icon": "alert-triangle",
    },
    "crystal_maze": {
        "id": "crystal_maze",
        "name": "Crystal Maze",
        "description": "A labyrinth of refracting crystals. Navigate by matching frequency patterns to reach the specimen.",
        "mechanic": "pattern_match",
        "time_limit_seconds": 90,
        "required_actions": 4,
        "reward_multiplier": 2.5,
        "xp_bonus": 40,
        "dust_bonus": 25,
        "color": "#3B82F6",
        "icon": "compass",
    },
    "geothermal_surge": {
        "id": "geothermal_surge",
        "name": "Geothermal Surge",
        "description": "Magma is rising! Extract the rare mineral before the heat becomes unbearable.",
        "mechanic": "rapid_extraction",
        "time_limit_seconds": 45,
        "required_actions": 6,
        "reward_multiplier": 4.0,
        "xp_bonus": 75,
        "dust_bonus": 50,
        "color": "#F97316",
        "icon": "flame",
    },
}

# ── World Vein (Collective Boss) ──
WORLD_VEINS = {
    "heart_frequency": {
        "id": "heart_frequency",
        "name": "Heart Frequency Vein",
        "description": "A massive crystalline formation pulsing at 528 Hz. Requires collective frequency meditation to crack.",
        "required_frequency": 528,
        "required_participants": 10,
        "required_duration_minutes": 5,
        "reward_specimen": "moldavite",
        "reward_rarity": "legendary",
        "reward_dust": 200,
        "reward_xp": 100,
        "color": "#22C55E",
    },
    "crown_resonance": {
        "id": "crown_resonance",
        "name": "Crown Resonance Vein",
        "description": "A diamond-encrusted wall resonating at 963 Hz. Only unified crown chakra meditation can unlock it.",
        "required_frequency": 963,
        "required_participants": 25,
        "required_duration_minutes": 10,
        "reward_specimen": "alexandrite",
        "reward_rarity": "mythic",
        "reward_dust": 500,
        "reward_xp": 250,
        "color": "#A855F7",
    },
}


def _seed_boss(user_id: str, date_str: str) -> str:
    """Deterministic boss spawn based on user and date."""
    h = secure_hash(f"{user_id}:boss:{date_str}")
    boss_list = list(BOSS_TYPES.keys())
    return boss_list[int(h[:4], 16) % len(boss_list)]


def _seed_rival(user_id: str, mine_element: str) -> str:
    """Deterministic rival spawn."""
    h = secure_hash(f"{user_id}:rival:{mine_element}")
    return "sprinter" if int(h[:4], 16) % 2 == 0 else "specialist"


@router.get("/encounters/daily-boss")
async def get_daily_boss(user=Depends(get_current_user)):
    """Get today's environmental boss encounter."""
    user_id = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    boss_id = _seed_boss(user_id, today)
    boss = BOSS_TYPES[boss_id]

    # Check if already completed today
    attempt = await db.boss_attempts.find_one(
        {"user_id": user_id, "boss_id": boss_id, "date": today},
        {"_id": 0},
    )

    return {
        **boss,
        "date": today,
        "completed": attempt.get("completed", False) if attempt else False,
        "best_time": attempt.get("best_time") if attempt else None,
        "attempts_today": attempt.get("attempts", 0) if attempt else 0,
    }


@router.post("/encounters/attempt-boss")
async def attempt_boss(data: dict = Body(...), user=Depends(get_current_user)):
    """Attempt an environmental boss encounter. Submit actions within time limit."""
    user_id = user["id"]
    boss_id = data.get("boss_id")
    actions_completed = data.get("actions_completed", 0)
    time_taken_seconds = data.get("time_taken_seconds", 999)

    if boss_id not in BOSS_TYPES:
        raise HTTPException(400, f"Unknown boss: {boss_id}")

    boss = BOSS_TYPES[boss_id]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now = datetime.now(timezone.utc).isoformat()

    # Evaluate success
    within_time = time_taken_seconds <= boss["time_limit_seconds"]
    enough_actions = actions_completed >= boss["required_actions"]
    success = within_time and enough_actions

    # Compute rewards
    rewards = {"xp": 0, "dust": 0, "bonus_loot": False}
    if success:
        rewards["xp"] = boss["xp_bonus"]
        rewards["dust"] = boss["dust_bonus"]
        rewards["bonus_loot"] = True

        from routes.game_core import award_xp, award_currency
        await award_xp(user_id, rewards["xp"], f"boss:{boss_id}")
        await award_currency(user_id, "cosmic_dust", rewards["dust"], f"boss:{boss_id}")

    # Log attempt
    await db.boss_attempts.update_one(
        {"user_id": user_id, "boss_id": boss_id, "date": today},
        {
            "$set": {
                "completed": success or False,
                "last_attempt": now,
                "best_time": min(time_taken_seconds, 999),
            },
            "$inc": {"attempts": 1},
        },
        upsert=True,
    )

    # Contribute to communal goal (using shared COMMUNAL_GOALS - no circular import)
    if success:
        await db.communal_progress.update_one(
            {"goal_id": "rapid_tumbling"},
            {"$inc": {"current": 1}, "$set": {"updated_at": now}},
            upsert=True,
        )

    return {
        "success": success,
        "boss_id": boss_id,
        "within_time": within_time,
        "enough_actions": enough_actions,
        "time_taken": time_taken_seconds,
        "time_limit": boss["time_limit_seconds"],
        "rewards": rewards,
    }


@router.get("/encounters/rival")
async def get_rival(user=Depends(get_current_user)):
    """Get the current rival NPC for the user's active mine."""
    user_id = user["id"]

    # Get active mine element
    mine = await db.rock_hounding_mines.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    element = (mine or {}).get("element", "earth")

    rival_id = _seed_rival(user_id, element)
    rival = NPC_ARCHETYPES[rival_id]

    # Rival state (tracks competition)
    state = await db.rival_state.find_one(
        {"user_id": user_id, "rival_id": rival_id}, {"_id": 0}
    )

    dialogue = random.choice(rival["dialogue"])

    return {
        **rival,
        "active_dialogue": dialogue,
        "rival_score": (state or {}).get("rival_score", 0),
        "user_score": (state or {}).get("user_score", 0),
        "steals_blocked": (state or {}).get("steals_blocked", 0),
        "element": element,
    }


@router.post("/encounters/rival-action")
async def rival_action(data: dict = Body(...), user=Depends(get_current_user)):
    """Interact with a rival NPC. Use buffs (stealth/speed) to compete."""
    user_id = user["id"]
    action = data.get("action", "mine")  # mine, stealth, speed_burst
    rival_id = data.get("rival_id", "sprinter")

    if rival_id not in NPC_ARCHETYPES:
        raise HTTPException(400, "Unknown rival")

    rival = NPC_ARCHETYPES[rival_id]
    now = datetime.now(timezone.utc).isoformat()

    # Simulate competition
    user_roll = random.random()
    rival_roll = random.random() * rival["speed"]

    if action == "stealth":
        user_roll *= 1.5  # Stealth bonus
    elif action == "speed_burst":
        user_roll *= 1.3  # Speed bonus

    user_wins = user_roll > rival_roll
    steal_attempted = random.random() < rival["steal_chance"]
    steal_blocked = steal_attempted and user_wins

    # Update scores
    inc = {"user_score": 1} if user_wins else {"rival_score": 1}
    if steal_blocked:
        inc["steals_blocked"] = 1

    await db.rival_state.update_one(
        {"user_id": user_id, "rival_id": rival_id},
        {"$inc": inc, "$set": {"last_action": now}},
        upsert=True,
    )

    # Award bonus for winning
    rewards = {}
    if user_wins:
        from routes.game_core import award_xp, award_currency
        xp = 5
        dust = 3
        await award_xp(user_id, xp, f"rival:{rival_id}")
        await award_currency(user_id, "cosmic_dust", dust, f"rival:{rival_id}")
        rewards = {"xp": xp, "dust": dust}

    return {
        "user_wins": user_wins,
        "action": action,
        "rival_name": rival["name"],
        "steal_attempted": steal_attempted,
        "steal_blocked": steal_blocked,
        "dialogue": random.choice(rival["dialogue"]),
        "rewards": rewards,
    }


@router.get("/encounters/world-veins")
async def get_world_veins(user=Depends(get_current_user)):
    """Get active World Veins (collective bosses)."""
    veins = []
    now = datetime.now(timezone.utc).isoformat()

    for vid, vdata in WORLD_VEINS.items():
        progress = await db.world_vein_progress.find_one(
            {"vein_id": vid}, {"_id": 0}
        )
        participants = (progress or {}).get("participants", 0)
        current_sessions = (progress or {}).get("sessions", 0)

        # Check if cracked
        cracked = await db.world_vein_cracks.find_one(
            {"vein_id": vid, "expires_at": {"$gt": now}}, {"_id": 0}
        )

        veins.append({
            **vdata,
            "participants": participants,
            "sessions_contributed": current_sessions,
            "cracked": cracked is not None,
            "cracked_at": (cracked or {}).get("cracked_at"),
            "reward_expires": (cracked or {}).get("expires_at"),
        })

    return {"world_veins": veins}


@router.post("/encounters/contribute-vein")
async def contribute_vein(data: dict = Body(...), user=Depends(get_current_user)):
    """Contribute a frequency meditation session to a World Vein."""
    user_id = user["id"]
    vein_id = data.get("vein_id")
    frequency = data.get("frequency", 0)
    duration_minutes = data.get("duration_minutes", 0)

    if vein_id not in WORLD_VEINS:
        raise HTTPException(400, f"Unknown vein: {vein_id}")

    vein = WORLD_VEINS[vein_id]

    # Check frequency match (±10% tolerance)
    required = vein["required_frequency"]
    if abs(frequency - required) > required * 0.1:
        raise HTTPException(400, f"Frequency mismatch. Need ~{required} Hz, got {frequency} Hz.")

    if duration_minutes < vein["required_duration_minutes"]:
        raise HTTPException(400, f"Need at least {vein['required_duration_minutes']} minutes of meditation.")

    now = datetime.now(timezone.utc)

    # Add contribution
    await db.world_vein_progress.update_one(
        {"vein_id": vein_id},
        {
            "$inc": {"sessions": 1},
            "$addToSet": {"participant_ids": user_id},
            "$set": {"updated_at": now.isoformat()},
        },
        upsert=True,
    )

    # Recount participants
    progress = await db.world_vein_progress.find_one({"vein_id": vein_id}, {"_id": 0})
    participants = len((progress or {}).get("participant_ids", []))
    await db.world_vein_progress.update_one(
        {"vein_id": vein_id}, {"$set": {"participants": participants}}
    )

    # Check if cracked
    cracked = False
    if participants >= vein["required_participants"]:
        existing = await db.world_vein_cracks.find_one(
            {"vein_id": vein_id, "expires_at": {"$gt": now.isoformat()}}
        )
        if not existing:
            expires = now + timedelta(hours=72)
            await db.world_vein_cracks.insert_one({
                "vein_id": vein_id,
                "cracked_at": now.isoformat(),
                "expires_at": expires.isoformat(),
                "participants": participants,
            })
            cracked = True

    # Award personal contribution rewards
    from routes.game_core import award_xp, award_currency
    await award_xp(user_id, 15, f"vein_contrib:{vein_id}")
    await award_currency(user_id, "cosmic_dust", 10, f"vein_contrib:{vein_id}")

    # Contribute to communal goal
    await db.communal_progress.update_one(
        {"goal_id": "vein_crack"},
        {"$inc": {"current": 1}, "$set": {"updated_at": now.isoformat()}},
        upsert=True,
    )

    return {
        "contributed": True,
        "vein_id": vein_id,
        "frequency": frequency,
        "duration_minutes": duration_minutes,
        "participants": participants,
        "required_participants": vein["required_participants"],
        "cracked": cracked,
        "rewards": {"xp": 15, "dust": 10},
    }

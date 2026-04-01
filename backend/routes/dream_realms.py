from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger, EMERGENT_LLM_KEY
from datetime import datetime, timezone, timedelta
from routes.nexus import (
    compute_elemental_balance, ELEMENTS, ELEMENT_FREQUENCIES,
    DECAY_HALFLIFE_DAYS, apply_decay, compute_natal_baseline
)
import hashlib
import random
import math
import uuid
import asyncio

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PROCEDURAL LOOP ENGINE — "Dream Realms"
#  Infinite scenario generator seeded by elemental balance,
#  birth resonance, and cosmic weather. No two loops are alike.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Realm Biomes: seeded by dominant/deficient elements + cosmic weather ──
BIOME_TEMPLATES = {
    "fire_excess": {
        "biomes": ["Solar Flare Desert", "Combustion Spire", "Ember Labyrinth", "Pyroclastic Sanctum"],
        "challenge_element": "water",
        "atmosphere": "scorching", "visual_distortion": "heat shimmer",
        "color_primary": "#EF4444", "color_ambient": "#7F1D1D",
    },
    "fire_deficient": {
        "biomes": ["Frozen Hearth", "Ash Wastes", "Eclipsed Altar", "Cinder Hollow"],
        "challenge_element": "fire",
        "atmosphere": "frigid", "visual_distortion": "frost crystallization",
        "color_primary": "#1E3A5F", "color_ambient": "#0C1929",
    },
    "water_excess": {
        "biomes": ["Abyssal Deluge", "Drowning Archive", "Tidal Convergence", "Monsoon Vault"],
        "challenge_element": "fire",
        "atmosphere": "submerged", "visual_distortion": "refraction ripples",
        "color_primary": "#3B82F6", "color_ambient": "#1E3A5F",
    },
    "water_deficient": {
        "biomes": ["Cracked Basin", "Parched Observatory", "Drought Sanctum", "Dust Sea"],
        "challenge_element": "water",
        "atmosphere": "arid", "visual_distortion": "dust haze",
        "color_primary": "#92400E", "color_ambient": "#451A03",
    },
    "wood_excess": {
        "biomes": ["Overgrown Labyrinth", "Tangled Canopy", "Vine Maze", "Feral Garden"],
        "challenge_element": "metal",
        "atmosphere": "suffocating growth", "visual_distortion": "vine tendrils",
        "color_primary": "#22C55E", "color_ambient": "#14532D",
    },
    "wood_deficient": {
        "biomes": ["Petrified Forest", "Barren Glade", "Root Crypt", "Hollow Grove"],
        "challenge_element": "wood",
        "atmosphere": "lifeless", "visual_distortion": "grayscale fade",
        "color_primary": "#6B7280", "color_ambient": "#1F2937",
    },
    "earth_excess": {
        "biomes": ["Stone Prison", "Calcified Cathedral", "Gravity Well", "Fossilized Spire"],
        "challenge_element": "water",
        "atmosphere": "crushing weight", "visual_distortion": "stone fractures",
        "color_primary": "#F59E0B", "color_ambient": "#78350F",
    },
    "earth_deficient": {
        "biomes": ["Floating Fragments", "Void Plateau", "Shattered Foundation", "Sky Ruins"],
        "challenge_element": "earth",
        "atmosphere": "weightless", "visual_distortion": "spatial drift",
        "color_primary": "#C084FC", "color_ambient": "#3B0764",
    },
    "metal_excess": {
        "biomes": ["Chrome Labyrinth", "Blade Sanctum", "Mercury Cascade", "Crystal Cage"],
        "challenge_element": "wood",
        "atmosphere": "cutting precision", "visual_distortion": "metallic reflection",
        "color_primary": "#94A3B8", "color_ambient": "#334155",
    },
    "metal_deficient": {
        "biomes": ["Formless Mist", "Boundary Dissolve", "Fog Archive", "Shapeless Realm"],
        "challenge_element": "metal",
        "atmosphere": "formless", "visual_distortion": "blur dissolution",
        "color_primary": "#D1D5DB", "color_ambient": "#4B5563",
    },
    "balanced": {
        "biomes": ["Harmony Nexus", "Resonance Sanctum", "Unity Plane", "Convergence Point"],
        "challenge_element": None,
        "atmosphere": "transcendent", "visual_distortion": "prismatic shimmer",
        "color_primary": "#A855F7", "color_ambient": "#581C87",
    },
}

# ── Loop challenge tasks mapped to elements ──
LOOP_CHALLENGES = {
    "wood": [
        {"task": "Log a mood entry reflecting on growth in your life", "action": "/mood", "xp": 25, "harmony_boost": 5},
        {"task": "Chant the Wood mantra (Om Mani Padme Hum) for 2 minutes", "action": "/mantras", "xp": 20, "harmony_boost": 4},
        {"task": "Visualize roots extending from your body into the earth", "action": "/meditation", "xp": 20, "harmony_boost": 4},
    ],
    "fire": [
        {"task": "Write a journal entry about your deepest passion", "action": "/journal", "xp": 25, "harmony_boost": 5},
        {"task": "Activate the 396 Hz Liberation frequency for 3 minutes", "action": "/frequencies", "xp": 20, "harmony_boost": 4},
        {"task": "Express gratitude for a transformative experience", "action": "/mood", "xp": 20, "harmony_boost": 4},
    ],
    "water": [
        {"task": "Practice 5 rounds of calming breath at 432 Hz", "action": "/breathing", "xp": 25, "harmony_boost": 5},
        {"task": "Listen to ocean waves while setting an intention", "action": "/soundscapes", "xp": 20, "harmony_boost": 4},
        {"task": "Meditate on the flow of energy through your body", "action": "/meditation", "xp": 20, "harmony_boost": 4},
    ],
    "earth": [
        {"task": "Complete a grounding meditation at 174 Hz", "action": "/meditation", "xp": 25, "harmony_boost": 5},
        {"task": "Recite the Earth mantra (Lam) while feeling your feet", "action": "/mantras", "xp": 20, "harmony_boost": 4},
        {"task": "Journal about what gives you stability", "action": "/journal", "xp": 20, "harmony_boost": 4},
    ],
    "metal": [
        {"task": "Practice 3 rounds of precision breathing at 285 Hz", "action": "/breathing", "xp": 25, "harmony_boost": 5},
        {"task": "Use the crystal chime soundscape for 5 minutes", "action": "/soundscapes", "xp": 20, "harmony_boost": 4},
        {"task": "Reflect on what you need to release today", "action": "/journal", "xp": 20, "harmony_boost": 4},
    ],
}

# ── Legendary Frequency seeds ──
LEGENDARY_BASE_FREQUENCIES = [
    {"hz": 111, "name": "The Cell Regeneration Tone", "rarity": "legendary"},
    {"hz": 222, "name": "The Mirror Frequency", "rarity": "legendary"},
    {"hz": 333, "name": "Christ Consciousness Carrier", "rarity": "legendary"},
    {"hz": 444, "name": "The Angel Bridge", "rarity": "legendary"},
    {"hz": 555, "name": "The Change Accelerator", "rarity": "legendary"},
    {"hz": 639, "name": "The Heart Connection", "rarity": "epic"},
    {"hz": 741, "name": "Intuition Amplifier", "rarity": "epic"},
    {"hz": 852, "name": "Third Eye Activator", "rarity": "epic"},
    {"hz": 963, "name": "Pineal Gland Opener", "rarity": "epic"},
    {"hz": 1111, "name": "The Gateway Harmonic", "rarity": "mythic"},
]

# Harmony thresholds for loop escape
ESCAPE_VELOCITY_BASE = 60
ESCAPE_VELOCITY_PER_LOOP = 3  # Each subsequent loop in same realm needs slightly more


def _seed_hash(user_id: str, natal_sign: str, cosmic_element: str, date_str: str) -> int:
    """Deterministic seed from user state + cosmic weather + date."""
    raw = f"{user_id}:{natal_sign}:{cosmic_element}:{date_str}"
    return int(hashlib.sha256(raw.encode()).hexdigest()[:8], 16)


def _compute_loop_difficulty(harmony_score: int, decay_freshness: dict, loop_iteration: int) -> dict:
    """Tighten/expand logic based on activity and harmony."""
    avg_freshness = sum(decay_freshness.values()) / max(len(decay_freshness), 1)
    # Inactivity tightens: lower freshness = higher difficulty multiplier
    freshness_factor = max(0.3, avg_freshness / 100)
    # Low harmony tightens
    harmony_factor = max(0.5, harmony_score / 100)
    # Loop iteration increases difficulty
    iteration_factor = 1.0 + (loop_iteration * 0.15)

    base_difficulty = 1.0
    difficulty = base_difficulty * iteration_factor / (freshness_factor * harmony_factor)
    difficulty = round(min(5.0, max(0.5, difficulty)), 2)

    # Tighten vs Expand state
    if avg_freshness < 30 or harmony_score < 35:
        state = "tightening"
        description = "The loop constricts. Your inactivity feeds the distortion."
    elif avg_freshness > 70 and harmony_score > 60:
        state = "expanding"
        description = "The realm opens. Your practice illuminates hidden paths."
    else:
        state = "holding"
        description = "The loop holds steady, awaiting your next action."

    return {
        "difficulty": difficulty,
        "state": state,
        "description": description,
        "freshness_factor": round(freshness_factor, 2),
        "harmony_factor": round(harmony_factor, 2),
        "challenge_count": min(3, max(1, round(difficulty))),
    }


def _select_biome(elements: dict, cosmic_element: str, seed: int) -> dict:
    """Select biome based on worst elemental imbalance + cosmic weather."""
    worst_element = None
    worst_deviation = 0
    worst_direction = None

    for eid, edata in elements.items():
        dev = abs(edata.get("deviation", 0))
        if dev > worst_deviation:
            worst_deviation = dev
            worst_element = eid
            worst_direction = "excess" if edata.get("deviation", 0) > 0 else "deficient"

    if worst_deviation < 0.05:
        template_key = "balanced"
    else:
        template_key = f"{worst_element}_{worst_direction}"

    template = BIOME_TEMPLATES.get(template_key, BIOME_TEMPLATES["balanced"])
    rng = random.Random(seed)
    biome_name = rng.choice(template["biomes"])

    # Cosmic weather modifies the biome suffix
    weather_suffix = {
        "Fire": " of Flames", "Water": " of Tides", "Earth": " of Roots", "Air": " of Winds"
    }.get(cosmic_element, "")

    return {
        "name": biome_name + weather_suffix,
        "template_key": template_key,
        "imbalance_element": worst_element,
        "imbalance_direction": worst_direction,
        "challenge_element": template["challenge_element"],
        "atmosphere": template["atmosphere"],
        "visual_distortion": template["visual_distortion"],
        "color_primary": template["color_primary"],
        "color_ambient": template["color_ambient"],
    }


def _generate_challenges(biome: dict, difficulty: dict, seed: int) -> list:
    """Generate wellness challenges for the current loop."""
    challenge_el = biome["challenge_element"]
    if not challenge_el:
        # Balanced — give a mix
        all_challenges = []
        for el_tasks in LOOP_CHALLENGES.values():
            all_challenges.extend(el_tasks)
        rng = random.Random(seed)
        rng.shuffle(all_challenges)
        return all_challenges[:2]

    tasks = LOOP_CHALLENGES.get(challenge_el, LOOP_CHALLENGES["water"])
    rng = random.Random(seed + 1)
    count = difficulty["challenge_count"]
    selected = rng.sample(tasks, min(count, len(tasks)))

    # Apply difficulty scaling to XP/harmony
    for task in selected:
        task = dict(task)
        task["xp"] = round(task["xp"] * difficulty["difficulty"])
        task["frequency"] = ELEMENT_FREQUENCIES.get(challenge_el, {})
    return selected


def _generate_legendary_frequency(seed: int, loop_iteration: int, harmony_score: int) -> dict:
    """Generate a unique legendary frequency discovery on loop break."""
    rng = random.Random(seed + loop_iteration + harmony_score)

    base = rng.choice(LEGENDARY_BASE_FREQUENCIES)
    # Procedural Hz offset makes it unique per user
    offset = rng.randint(-5, 5)
    unique_hz = base["hz"] + offset

    # Mantra combination
    mantras = ["Om", "Ram", "Lam", "Vam", "Ham", "Yam", "Aum", "Hum", "Sat", "Nam"]
    combo = f"{rng.choice(mantras)} {rng.choice(mantras)}"

    return {
        "hz": unique_hz,
        "name": base["name"],
        "rarity": base["rarity"],
        "mantra_combo": combo,
        "label": f"{unique_hz} Hz — {base['name']}",
        "discovery_note": f"Discovered by breaking Loop {loop_iteration + 1}",
    }


# ── Branching Resonance Gates (3 paths) ──
RESONANCE_GATES = {
    "purge": {
        "name": "The Purge",
        "subtitle": "High-intensity rebalancing",
        "icon": "flame",
        "description": "Burn off excess energy through intense, puzzle-heavy challenges",
        "color": "#EF4444",
        "elements": ["fire", "metal"],
        "style": "active",
    },
    "root": {
        "name": "The Root",
        "subtitle": "Grounding restoration",
        "icon": "sprout",
        "description": "Slow-paced, audio-focused meditation to rebuild your foundation",
        "color": "#22C55E",
        "elements": ["earth", "wood"],
        "style": "passive",
    },
    "void": {
        "name": "The Void",
        "subtitle": "Meditative dissolution",
        "icon": "droplets",
        "description": "Abstract, fluid space for deep water alignment and release",
        "color": "#3B82F6",
        "elements": ["water"],
        "style": "meditative",
    },
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/dream-realms/active")
async def get_active_realm(user=Depends(get_current_user)):
    """Get or generate the active Dream Realm loop for the user."""
    user_id = user["id"]
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    # Get elemental balance
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    elements = balance["elements"]
    decay = balance.get("decay_activity", {})

    # Get cosmic weather
    weather = await db.cosmic_weather_cache.find_one({"date": today}, {"_id": 0})
    cosmic_element = weather.get("element", "Fire") if weather else "Fire"
    cosmic_zodiac = weather.get("zodiac", "Aries") if weather else "Aries"

    # Get natal data
    natal_doc = await db.nexus_birth_resonance.find_one({"user_id": user_id}, {"_id": 0})
    natal_sign = natal_doc.get("sign", "Unknown") if natal_doc else "Unknown"

    # Check for existing active realm
    active = await db.dream_realms.find_one(
        {"user_id": user_id, "status": {"$in": ["active", "entering", "choosing"]}},
        {"_id": 0},
    )

    if active:
        if active.get("status") == "choosing":
            # Still in gate selection — return gates + realm shell
            active["current_harmony"] = harmony
            active["elements_snapshot"] = {eid: {"percentage": e.get("percentage", 20), "status": e.get("status")} for eid, e in elements.items()}
            return active

        # Update difficulty based on current state
        diff = _compute_loop_difficulty(harmony, decay, active.get("loop_iteration", 0))
        escape_threshold = ESCAPE_VELOCITY_BASE + (active.get("loop_iteration", 0) * ESCAPE_VELOCITY_PER_LOOP)

        # Check for auto-escape: harmony exceeds threshold
        if harmony >= escape_threshold and active.get("challenges_completed", 0) > 0:
            return await _break_loop(user_id, active, harmony, balance)

        active["difficulty"] = diff
        active["escape_threshold"] = escape_threshold
        active["current_harmony"] = harmony
        active["elements_snapshot"] = {eid: {"percentage": e.get("percentage", 20), "status": e.get("status")} for eid, e in elements.items()}
        return active

    # Generate new realm in "choosing" state with 3 resonance gates
    seed = _seed_hash(user_id, natal_sign, cosmic_element, today)
    rng = random.Random(seed)
    diff = _compute_loop_difficulty(harmony, decay, 0)

    # Build gate previews — each gate gets a biome preview
    gates = {}
    for gate_id, gate in RESONANCE_GATES.items():
        # Pick a biome relevant to this gate's elements
        best_el = None
        best_dev = 0
        for eid in gate["elements"]:
            edata = elements.get(eid, {})
            dev = abs(edata.get("deviation", 0))
            if dev > best_dev:
                best_dev = dev
                best_el = eid
        if not best_el:
            best_el = gate["elements"][0]

        direction = "excess" if elements.get(best_el, {}).get("deviation", 0) > 0 else "deficient"
        template_key = f"{best_el}_{direction}"
        template = BIOME_TEMPLATES.get(template_key, BIOME_TEMPLATES["balanced"])
        biome_name = rng.choice(template["biomes"])

        gates[gate_id] = {
            **gate,
            "biome_preview": biome_name,
            "biome_color": template["color_primary"],
            "target_element": best_el,
            "target_direction": direction,
            "challenge_count": diff["challenge_count"],
        }

    realm = {
        "user_id": user_id,
        "realm_id": uuid.uuid4().hex[:12],
        "status": "choosing",
        "gates": gates,
        "difficulty": diff,
        "challenges": [],
        "challenges_completed": 0,
        "loop_iteration": 0,
        "escape_threshold": ESCAPE_VELOCITY_BASE,
        "current_harmony": harmony,
        "seed": seed,
        "cosmic_context": {
            "zodiac": cosmic_zodiac,
            "element": cosmic_element,
            "natal_sign": natal_sign,
        },
        "elements_snapshot": {eid: {"percentage": e.get("percentage", 20), "status": e.get("status")} for eid, e in elements.items()},
        "rewards_earned": [],
        "legendary_discoveries": [],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    await db.dream_realms.insert_one({**realm})
    del realm["user_id"]
    return realm


@router.post("/dream-realms/choose-gate")
async def choose_gate(data: dict = Body(...), user=Depends(get_current_user)):
    """Choose a Resonance Gate to enter a Dream Realm."""
    user_id = user["id"]
    gate_id = data.get("gate_id")

    if gate_id not in RESONANCE_GATES:
        raise HTTPException(400, "Invalid gate. Choose: purge, root, or void")

    realm = await db.dream_realms.find_one(
        {"user_id": user_id, "status": "choosing"},
        {"_id": 0},
    )
    if not realm:
        raise HTTPException(404, "No realm in gate selection")

    gate = RESONANCE_GATES[gate_id]
    seed = realm.get("seed", 0)
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    elements = balance["elements"]
    decay = balance.get("decay_activity", {})
    diff = _compute_loop_difficulty(harmony, decay, 0)

    # Get cosmic weather
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    weather = await db.cosmic_weather_cache.find_one({"date": today}, {"_id": 0})
    cosmic_element = weather.get("element", "Fire") if weather else "Fire"

    natal_doc = await db.nexus_birth_resonance.find_one({"user_id": user_id}, {"_id": 0})
    natal_sign = natal_doc.get("sign", "Unknown") if natal_doc else "Unknown"

    # Build biome from gate choice
    best_el = gate["elements"][0]
    for eid in gate["elements"]:
        if abs(elements.get(eid, {}).get("deviation", 0)) > abs(elements.get(best_el, {}).get("deviation", 0)):
            best_el = eid

    direction = "excess" if elements.get(best_el, {}).get("deviation", 0) > 0 else "deficient"  # noqa: F841
    biome = _select_biome(
        {k: v for k, v in elements.items()},
        cosmic_element, seed + hash(gate_id)
    )
    biome["gate"] = gate_id
    biome["gate_name"] = gate["name"]
    biome["gate_style"] = gate["style"]

    challenges = _generate_challenges(biome, diff, seed + hash(gate_id))
    narrative = await _generate_narrative(biome, diff, cosmic_element, natal_sign, harmony)

    await db.dream_realms.update_one(
        {"user_id": user_id, "status": "choosing"},
        {"$set": {
            "status": "active",
            "biome": biome,
            "challenges": challenges,
            "difficulty": diff,
            "narrative": narrative,
            "gate_chosen": gate_id,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    return {
        "message": f"Entered {gate['name']}",
        "gate": gate_id,
        "biome": biome,
        "narrative": narrative,
    }


@router.post("/dream-realms/complete-challenge")
async def complete_challenge(data: dict = Body(...), user=Depends(get_current_user)):
    """Complete a challenge within the active Dream Realm loop."""
    user_id = user["id"]
    challenge_index = data.get("challenge_index", 0)

    active = await db.dream_realms.find_one(
        {"user_id": user_id, "status": "active"},
        {"_id": 0},
    )
    if not active:
        raise HTTPException(404, "No active Dream Realm")

    challenges = active.get("challenges", [])
    if challenge_index >= len(challenges):
        raise HTTPException(400, "Invalid challenge index")

    challenge = challenges[challenge_index]
    if challenge.get("completed"):
        raise HTTPException(400, "Challenge already completed")

    # Mark completed
    xp = challenge.get("xp", 20)

    await db.dream_realms.update_one(
        {"user_id": user_id, "status": "active"},
        {
            "$set": {
                f"challenges.{challenge_index}.completed": True,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$inc": {"challenges_completed": 1},
        },
    )

    # Award XP
    await db.rpg_characters.update_one(
        {"user_id": user_id}, {"$inc": {"xp": xp}}, upsert=True,
    )
    # Award dust
    dust = round(xp * 0.5)
    await db.rpg_currencies.update_one(
        {"user_id": user_id}, {"$inc": {"cosmic_dust": dust}}, upsert=True,
    )

    # Check if all challenges completed — triggers harmony check
    completed_count = active.get("challenges_completed", 0) + 1
    total_challenges = len(challenges)

    # Re-check harmony
    balance = await compute_elemental_balance(user_id)
    current_harmony = balance["harmony_score"]
    escape_threshold = active.get("escape_threshold", ESCAPE_VELOCITY_BASE)

    result = {
        "challenge_completed": challenge.get("task"),
        "xp_awarded": xp,
        "dust_awarded": dust,
        "challenges_done": completed_count,
        "total_challenges": total_challenges,
        "current_harmony": current_harmony,
        "escape_threshold": escape_threshold,
    }

    if current_harmony >= escape_threshold and completed_count > 0:
        # Loop broken!
        updated = await db.dream_realms.find_one(
            {"user_id": user_id, "status": "active"}, {"_id": 0}
        )
        loop_result = await _break_loop(user_id, updated, current_harmony, balance)
        result["loop_broken"] = True
        result["loop_result"] = loop_result
    elif completed_count >= total_challenges and current_harmony < escape_threshold:
        # All challenges done but harmony not met — loop tightens
        tighten_result = await _tighten_loop(user_id, active, current_harmony)
        result["loop_tightened"] = True
        result["tighten_result"] = tighten_result
    else:
        result["loop_broken"] = False
        result["loop_tightened"] = False

    return result


@router.post("/dream-realms/abandon")
async def abandon_realm(user=Depends(get_current_user)):
    """Abandon the current Dream Realm (no rewards)."""
    user_id = user["id"]
    result = await db.dream_realms.update_one(
        {"user_id": user_id, "status": {"$in": ["active", "choosing"]}},
        {"$set": {"status": "abandoned", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.modified_count == 0:
        raise HTTPException(404, "No active realm to abandon")
    return {"message": "Dream Realm abandoned. The loop fades..."}


@router.get("/dream-realms/history")
async def get_realm_history(user=Depends(get_current_user)):
    """Get past Dream Realm completions."""
    history = await db.dream_realms.find(
        {"user_id": user["id"], "status": {"$in": ["completed", "abandoned"]}},
        {"_id": 0, "user_id": 0},
    ).sort("updated_at", -1).to_list(20)
    return {"realms": history}


@router.get("/dream-realms/legendary-frequencies")
async def get_legendary_frequencies(user=Depends(get_current_user)):
    """Get all legendary frequencies discovered by the user."""
    discoveries = await db.legendary_frequencies.find(
        {"user_id": user["id"]}, {"_id": 0, "user_id": 0}
    ).sort("discovered_at", -1).to_list(50)
    return {"frequencies": discoveries}


@router.get("/dream-realms/scenario-state")
async def get_scenario_state(user=Depends(get_current_user)):
    """THE BRAIN: Unified scenario state for any game module.
    
    Combines:
    - 5-Layer Universe position (from Resonance stat)
    - Dream Realms loop state (difficulty, biome, distortions)
    - Nexus elemental balance (harmony, elements, decay)
    - Computed visual directives (what the Skin should render)
    
    Any game module can call this to know:
    - What layer the user is in
    - What difficulty level applies
    - What visual distortions to apply
    - What loot modifiers are active
    """
    user_id = user["id"]
    from routes.game_core import compute_active_layer

    # Get elemental balance
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    elements = balance["elements"]
    decay = balance.get("decay_activity", {})

    # Get layer
    stats_doc = await db.game_core_stats.find_one({"user_id": user_id}, {"_id": 0})
    resonance = (stats_doc or {}).get("stats", {}).get("resonance", 0)
    layer_info = compute_active_layer(resonance)
    layer = layer_info["layer"]

    # Get active dream realm (if any)
    active_realm = await db.dream_realms.find_one(
        {"user_id": user_id, "status": {"$in": ["active", "entering", "choosing"]}},
        {"_id": 0, "user_id": 0},
    )

    # Compute difficulty
    loop_iter = active_realm.get("loop_iteration", 0) if active_realm else 0
    difficulty = _compute_loop_difficulty(harmony, decay, loop_iter)

    # Compute visual directives for The Skin
    layer_entropy = layer.get("entropy", 0)
    harmony_blur = max(0, (100 - harmony) / 25)
    layer_blur = layer.get("blur", 0)

    # Composite visual state
    visual_directives = {
        "entropy_level": "critical" if harmony < 20 else "high" if harmony < 40 else "moderate" if harmony < 60 else "low" if harmony < 80 else "clear",
        "blur": max(harmony_blur, layer_blur),
        "grain": max(0.01, (100 - harmony) / 500) + layer_entropy * 0.06,
        "glitch": (30 - harmony) / 30 if harmony < 30 else 0,
        "saturation": 0.7 + (harmony / 200),
        "tint_color": layer.get("color", "#A855F7"),
        "tint_opacity": layer_entropy * 0.08,
        "glow_intensity": layer.get("glow_intensity", 0.3),
        "fractures_active": balance.get("harmony_cycle") == "destructive",
        "layer_name": layer.get("name", "Terrestrial"),
        "layer_id": layer.get("id", "terrestrial"),
    }

    # Biome context from active realm
    biome_context = None
    if active_realm and active_realm.get("biome"):
        biome = active_realm["biome"]
        biome_context = {
            "name": biome.get("name"),
            "atmosphere": biome.get("atmosphere"),
            "visual_distortion": biome.get("visual_distortion"),
            "color_primary": biome.get("color_primary"),
            "color_ambient": biome.get("color_ambient"),
        }

    # Dominant/deficient elements
    dom_el, def_el = "earth", "earth"
    max_pct, min_pct = 0, 100
    for eid, edata in elements.items():
        pct = edata.get("percentage", 20)
        if pct > max_pct:
            max_pct = pct
            dom_el = eid
        if pct < min_pct:
            min_pct = pct
            def_el = eid

    return {
        "layer": {
            "id": layer["id"],
            "name": layer["name"],
            "subtitle": layer["subtitle"],
            "color": layer["color"],
            "entropy": layer_entropy,
            "loot_multiplier": layer["loot_multiplier"],
            "xp_multiplier": layer["xp_multiplier"],
            "rarity_shift": layer["rarity_shift"],
        },
        "difficulty": difficulty,
        "harmony": harmony,
        "harmony_cycle": balance.get("harmony_cycle", "neutral"),
        "dominant_element": dom_el,
        "deficient_element": def_el,
        "visual_directives": visual_directives,
        "biome_context": biome_context,
        "loop_active": active_realm is not None and active_realm.get("status") == "active",
        "loop_iteration": loop_iter,
    }


# ── Internal helpers ──

async def _break_loop(user_id: str, realm: dict, harmony: int, balance: dict) -> dict:
    """Break the loop — award legendary frequency and transition."""
    loop_iteration = realm.get("loop_iteration", 0)
    seed = realm.get("seed", 0)

    legendary = _generate_legendary_frequency(seed, loop_iteration, harmony)

    # Store legendary frequency discovery
    await db.legendary_frequencies.insert_one({
        "user_id": user_id,
        "realm_id": realm.get("realm_id"),
        **legendary,
        "harmony_at_discovery": harmony,
        "loop_iteration": loop_iteration,
        "discovered_at": datetime.now(timezone.utc).isoformat(),
    })

    # Bonus XP for breaking the loop
    bonus_xp = 50 + (loop_iteration * 25)
    await db.rpg_characters.update_one(
        {"user_id": user_id}, {"$inc": {"xp": bonus_xp}}, upsert=True,
    )
    bonus_dust = 25 + (loop_iteration * 10)
    await db.rpg_currencies.update_one(
        {"user_id": user_id}, {"$inc": {"cosmic_dust": bonus_dust}}, upsert=True,
    )

    # Feed decoded modifiers hook (Forgotten Languages prep)
    challenge_el = realm.get("biome", {}).get("challenge_element")
    if challenge_el:
        await db.nexus_decoded_modifiers.update_one(
            {"user_id": user_id},
            {"$inc": {f"modifiers.{challenge_el}": 2}},
            upsert=True,
        )

    # Mark realm completed
    await db.dream_realms.update_one(
        {"user_id": user_id, "status": "active"},
        {"$set": {
            "status": "completed",
            "completion_harmony": harmony,
            "legendary_discovery": legendary,
            "bonus_xp": bonus_xp,
            "bonus_dust": bonus_dust,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    return {
        "loop_broken": True,
        "message": "The loop shatters. A new frequency resonates through the void.",
        "legendary_frequency": legendary,
        "bonus_xp": bonus_xp,
        "bonus_dust": bonus_dust,
        "decoded_modifier_element": challenge_el,
    }


async def _tighten_loop(user_id: str, realm: dict, harmony: int) -> dict:
    """Tighten the loop — increase difficulty, regenerate challenges."""
    new_iteration = realm.get("loop_iteration", 0) + 1
    seed = realm.get("seed", 0) + new_iteration

    biome = realm.get("biome", {})
    balance = await compute_elemental_balance(user_id)
    decay = balance.get("decay_activity", {})
    diff = _compute_loop_difficulty(harmony, decay, new_iteration)
    challenges = _generate_challenges(biome, diff, seed)
    escape_threshold = ESCAPE_VELOCITY_BASE + (new_iteration * ESCAPE_VELOCITY_PER_LOOP)

    # Generate tightened narrative
    narrative = await _generate_tighten_narrative(biome, diff, new_iteration)

    await db.dream_realms.update_one(
        {"user_id": user_id, "status": "active"},
        {"$set": {
            "loop_iteration": new_iteration,
            "challenges": challenges,
            "challenges_completed": 0,
            "difficulty": diff,
            "escape_threshold": escape_threshold,
            "tighten_narrative": narrative,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    return {
        "loop_tightened": True,
        "new_iteration": new_iteration,
        "difficulty": diff,
        "escape_threshold": escape_threshold,
        "narrative": narrative,
        "message": "The loop tightens. The realm distorts further...",
    }


async def _generate_narrative(biome: dict, difficulty: dict, cosmic_element: str, natal_sign: str, harmony: int) -> str:
    """Use AI to generate procedural realm narrative."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"dream-{uuid.uuid4().hex[:8]}",
            system_message=(
                "You are the Dream Weaver for The Cosmic Collective. "
                "Generate immersive, brief realm descriptions for procedurally-generated Dream Realms. "
                "Write in second person, present tense. Be mystical but concise (3-4 sentences max). "
                "Include sensory details matching the atmosphere."
            ),
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        prompt = (
            f"Generate a Dream Realm entry narrative. "
            f"Realm: '{biome['name']}'. Atmosphere: {biome['atmosphere']}. "
            f"Visual distortion: {biome['visual_distortion']}. "
            f"The traveler's natal sign is {natal_sign}, under {cosmic_element} cosmic weather. "
            f"Their harmony is {harmony}/100 (difficulty: {difficulty['state']}). "
            f"Imbalance: {biome.get('imbalance_element', 'none')} is {biome.get('imbalance_direction', 'balanced')}. "
            f"The realm challenges them to restore balance through {biome.get('challenge_element', 'inner harmony')} practices."
        )
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)), timeout=12,
        )
        return result.strip()
    except Exception as e:
        logger.error(f"Dream narrative AI error: {e}")
        return (
            f"You step into the {biome['name']}. "
            f"The air shifts — {biome['atmosphere']} energy surrounds you. "
            f"{biome['visual_distortion'].capitalize()} warps the horizon. "
            f"To break this loop, you must find balance through {biome.get('challenge_element', 'harmony')}."
        )


async def _generate_tighten_narrative(biome: dict, difficulty: dict, iteration: int) -> str:
    """Generate narrative for loop tightening."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"tighten-{uuid.uuid4().hex[:8]}",
            system_message=(
                "You are the Dream Weaver. The traveler failed to break a Dream Realm loop. "
                "Write a brief (2 sentences), ominous description of the loop tightening. "
                "Use second person present tense. Be dramatic but concise."
            ),
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        prompt = (
            f"Loop iteration {iteration + 1} in '{biome['name']}'. "
            f"Difficulty is now {difficulty['difficulty']:.1f}x ({difficulty['state']}). "
            f"The {biome['visual_distortion']} intensifies."
        )
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)), timeout=10,
        )
        return result.strip()
    except Exception as e:
        logger.error(f"Tighten narrative error: {e}")
        return (
            f"The {biome['name']} convulses. Loop {iteration + 1} begins — "
            f"the {biome['visual_distortion']} deepens, and the path narrows."
        )

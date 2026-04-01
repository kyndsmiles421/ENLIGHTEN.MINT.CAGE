from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import math

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  THE ELEMENTAL NEXUS — 5th Realm / Global State Controller
#  Five Elements: Wood, Fire, Earth, Metal, Water
#  Features: Dynamic Decay, Birth Resonance, Frequency Pairing,
#            Decoded Modifier Hooks, Trend Tracking
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Half-life decay constants ──
DECAY_HALFLIFE_DAYS = 3.0  # Elements lose half their activity-based value every 3 days
DECAY_LAMBDA = math.log(2) / DECAY_HALFLIFE_DAYS
DECAY_FLOOR = 1.0  # Minimum raw value after decay

# ── Natal astrology: element weights per zodiac sign ──
ZODIAC_ELEMENTS = {
    "Aries": {"fire": 0.40, "wood": 0.25, "earth": 0.10, "metal": 0.10, "water": 0.15},
    "Taurus": {"earth": 0.40, "wood": 0.20, "fire": 0.10, "metal": 0.15, "water": 0.15},
    "Gemini": {"metal": 0.35, "fire": 0.20, "wood": 0.15, "earth": 0.10, "water": 0.20},
    "Cancer": {"water": 0.40, "earth": 0.20, "wood": 0.20, "fire": 0.05, "metal": 0.15},
    "Leo": {"fire": 0.45, "wood": 0.15, "earth": 0.15, "metal": 0.10, "water": 0.15},
    "Virgo": {"earth": 0.35, "metal": 0.25, "wood": 0.15, "fire": 0.10, "water": 0.15},
    "Libra": {"metal": 0.35, "water": 0.20, "wood": 0.15, "fire": 0.15, "earth": 0.15},
    "Scorpio": {"water": 0.40, "fire": 0.25, "earth": 0.10, "metal": 0.15, "wood": 0.10},
    "Sagittarius": {"fire": 0.40, "wood": 0.20, "water": 0.10, "earth": 0.15, "metal": 0.15},
    "Capricorn": {"earth": 0.40, "metal": 0.25, "fire": 0.10, "wood": 0.10, "water": 0.15},
    "Aquarius": {"metal": 0.35, "water": 0.25, "fire": 0.15, "wood": 0.10, "earth": 0.15},
    "Pisces": {"water": 0.45, "earth": 0.15, "wood": 0.15, "fire": 0.10, "metal": 0.15},
}

ZODIAC_DATES = [
    ("Capricorn", 12, 22, 1, 19), ("Aquarius", 1, 20, 2, 18), ("Pisces", 2, 19, 3, 20),
    ("Aries", 3, 21, 4, 19), ("Taurus", 4, 20, 5, 20), ("Gemini", 5, 21, 6, 20),
    ("Cancer", 6, 21, 7, 22), ("Leo", 7, 23, 8, 22), ("Virgo", 8, 23, 9, 22),
    ("Libra", 9, 23, 10, 22), ("Scorpio", 10, 23, 11, 21), ("Sagittarius", 11, 22, 12, 21),
]

ELEMENTS = {
    "wood": {
        "name": "Wood", "subtitle": "Growth & Expansion",
        "color": "#22C55E", "color_glow": "rgba(34,197,94,0.15)",
        "universe": "terrestrial",
        "description": "The element of new beginnings, vitality, and upward momentum",
        "wellness_sources": ["mood"],
        "icon": "sprout",
        "virtues": ["compassion", "flexibility", "vision"],
        "excess_warning": "Overgrowth — restlessness, scattered energy, inability to rest",
        "deficiency_warning": "Stagnation — lack of motivation, feeling stuck, creative block",
        "generates": "fire", "overcomes": "earth",
    },
    "fire": {
        "name": "Fire", "subtitle": "Transformation & Passion",
        "color": "#EF4444", "color_glow": "rgba(239,68,68,0.15)",
        "universe": "astral",
        "description": "The element of passion, illumination, and radical change",
        "wellness_sources": ["journal", "soundscape"],
        "icon": "flame",
        "virtues": ["joy", "clarity", "inspiration"],
        "excess_warning": "Burnout — overexertion, anxiety, unsustainable intensity",
        "deficiency_warning": "Coldness — loss of passion, disconnection, apathy",
        "generates": "earth", "overcomes": "metal",
    },
    "earth": {
        "name": "Earth", "subtitle": "Stability & Nourishment",
        "color": "#F59E0B", "color_glow": "rgba(245,158,11,0.15)",
        "universe": "ethereal",
        "description": "The element of grounding, consistency, and reliable foundation",
        "wellness_sources": ["meditation"],
        "icon": "mountain",
        "virtues": ["trust", "patience", "nurturing"],
        "excess_warning": "Rigidity — over-attachment, resistance to change, stubbornness",
        "deficiency_warning": "Groundlessness — instability, worry, lack of center",
        "generates": "metal", "overcomes": "water",
    },
    "metal": {
        "name": "Metal", "subtitle": "Precision & Clarity",
        "color": "#94A3B8", "color_glow": "rgba(148,163,184,0.15)",
        "universe": "void",
        "description": "The element of refinement, letting go, and sharp focus",
        "wellness_sources": ["breathing"],
        "icon": "gem",
        "virtues": ["discipline", "discernment", "release"],
        "excess_warning": "Cutting — over-critical, isolated, emotionally distant",
        "deficiency_warning": "Dullness — lack of boundaries, mental fog, indecisiveness",
        "generates": "water", "overcomes": "wood",
    },
    "water": {
        "name": "Water", "subtitle": "Flow & Integration",
        "color": "#3B82F6", "color_glow": "rgba(59,130,246,0.15)",
        "universe": None,
        "description": "The element of adaptability, wisdom, and universal connection",
        "wellness_sources": ["quest_streak", "ripple_activity"],
        "icon": "droplets",
        "virtues": ["wisdom", "courage", "adaptability"],
        "excess_warning": "Flooding — overwhelm, emotional turbulence, fear",
        "deficiency_warning": "Drought — disconnection between practices, fragmented effort",
        "generates": "wood", "overcomes": "fire",
    },
}

# ── Frequency-Task Pairing ──
ELEMENT_FREQUENCIES = {
    "wood": {"hz": 528, "label": "528 Hz — Growth & DNA Repair", "mantra": "Om Mani Padme Hum", "soundscape": "forest_canopy"},
    "fire": {"hz": 396, "label": "396 Hz — Liberation & Transformation", "mantra": "Ram", "soundscape": "volcanic_forge"},
    "earth": {"hz": 174, "label": "174 Hz — Foundation & Grounding", "mantra": "Lam", "soundscape": "cave_resonance"},
    "metal": {"hz": 285, "label": "285 Hz — Cellular Healing & Clarity", "mantra": "Vam", "soundscape": "crystal_chime"},
    "water": {"hz": 432, "label": "432 Hz — Universal Harmony & Flow", "mantra": "Om", "soundscape": "deep_ocean"},
}

BALANCE_IDEAL_RATIO = 0.20
IMBALANCE_THRESHOLD = 0.15
CRITICAL_THRESHOLD = 0.20

ALIGNMENT_TASKS = {
    "wood_excess": {
        "task": "Ground yourself with a 5-minute breathing exercise",
        "action": "/breathing", "element_boost": "earth", "element_reduce": "wood",
        "xp": 20, "description": "Channel excess growth energy into stability",
        "frequency": ELEMENT_FREQUENCIES["earth"],
    },
    "wood_deficient": {
        "task": "Log your mood and reflect on what inspires you",
        "action": "/mood", "element_boost": "wood",
        "xp": 20, "description": "Plant new seeds of intention",
        "frequency": ELEMENT_FREQUENCIES["wood"],
    },
    "fire_excess": {
        "task": "Practice a calming meditation to cool the flames",
        "action": "/meditation", "element_boost": "earth", "element_reduce": "fire",
        "xp": 20, "description": "Transform intensity into grounded warmth",
        "frequency": ELEMENT_FREQUENCIES["earth"],
    },
    "fire_deficient": {
        "task": "Write a journal entry about your deepest aspiration",
        "action": "/journal", "element_boost": "fire",
        "xp": 20, "description": "Reignite your inner flame",
        "frequency": ELEMENT_FREQUENCIES["fire"],
    },
    "earth_excess": {
        "task": "Explore an undiscovered region in the Multiverse",
        "action": "/multiverse-map", "element_boost": "water", "element_reduce": "earth",
        "xp": 20, "description": "Break routine with exploration",
        "frequency": ELEMENT_FREQUENCIES["water"],
    },
    "earth_deficient": {
        "task": "Complete a guided meditation for grounding",
        "action": "/meditation", "element_boost": "earth",
        "xp": 20, "description": "Reconnect with your foundation",
        "frequency": ELEMENT_FREQUENCIES["earth"],
    },
    "metal_excess": {
        "task": "Open your heart with a mood check-in and gratitude note",
        "action": "/mood", "element_boost": "wood", "element_reduce": "metal",
        "xp": 20, "description": "Soften sharp edges with compassion",
        "frequency": ELEMENT_FREQUENCIES["wood"],
    },
    "metal_deficient": {
        "task": "Practice 3 rounds of focused breathing at 285 Hz",
        "action": "/breathing", "element_boost": "metal",
        "xp": 20, "description": "Sharpen your awareness through breath",
        "frequency": ELEMENT_FREQUENCIES["metal"],
    },
    "water_excess": {
        "task": "Journal about what you can release today",
        "action": "/journal", "element_boost": "fire", "element_reduce": "water",
        "xp": 20, "description": "Transform excess emotion into clarity",
        "frequency": ELEMENT_FREQUENCIES["fire"],
    },
    "water_deficient": {
        "task": "Complete all daily quests to restore universal flow",
        "action": "/rpg", "element_boost": "water",
        "xp": 30, "description": "Reconnect the streams between your practices",
        "frequency": ELEMENT_FREQUENCIES["water"],
    },
}


def get_zodiac_sign(month: int, day: int) -> str:
    for sign, sm, sd, em, ed in ZODIAC_DATES:
        if sm > em:
            if (month == sm and day >= sd) or (month == em and day <= ed) or month > sm or month < em:
                return sign
        else:
            if (month == sm and day >= sd) or (month == em and day <= ed) or (sm < month < em):
                return sign
    return "Capricorn"


def compute_natal_baseline(birth_month: int, birth_day: int, birth_year: int) -> dict:
    """Calculate permanent natal element weights from birth data."""
    sign = get_zodiac_sign(birth_month, birth_day)
    weights = ZODIAC_ELEMENTS.get(sign, {"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2})

    # Numerological modifier from birth year
    year_sum = sum(int(d) for d in str(birth_year))
    while year_sum > 9:
        year_sum = sum(int(d) for d in str(year_sum))

    # Life path number subtly shifts one element
    life_path_shifts = {
        1: "fire", 2: "water", 3: "wood", 4: "earth", 5: "metal",
        6: "earth", 7: "water", 8: "metal", 9: "fire",
    }
    boosted = life_path_shifts.get(year_sum, "water")
    adjusted = dict(weights)
    adjusted[boosted] = adjusted.get(boosted, 0.2) + 0.05
    # Renormalize
    total = sum(adjusted.values())
    adjusted = {k: round(v / total, 3) for k, v in adjusted.items()}

    return {
        "sign": sign,
        "life_path": year_sum,
        "boosted_element": boosted,
        "natal_weights": adjusted,
    }


def apply_decay(raw_value: float, days_since_activity: float) -> float:
    """Apply exponential half-life decay to an element's activity-based value."""
    if days_since_activity <= 0:
        return raw_value
    decayed = raw_value * math.exp(-DECAY_LAMBDA * days_since_activity)
    return max(decayed, DECAY_FLOOR)


async def get_latest_activity_age(user_id: str, collection_name: str) -> float:
    """Get days since the most recent document in a collection for this user."""
    coll = db[collection_name]
    latest = await coll.find_one(
        {"user_id": user_id},
        {"_id": 0, "created_at": 1},
        sort=[("created_at", -1)],
    )
    if not latest or not latest.get("created_at"):
        return 14.0  # Default: assume 2 weeks of inactivity
    try:
        ts = latest["created_at"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - ts
        return max(0, delta.total_seconds() / 86400)
    except Exception:
        return 7.0


async def compute_elemental_balance(user_id: str) -> dict:
    """Compute the 5-element balance with decay, natal baseline, and decoded modifiers."""
    now = datetime.now(timezone.utc)

    # ── 1. Universe resonance (persistent) ──
    mv_state = await db.multiverse_state.find_one({"user_id": user_id}, {"_id": 0})
    resonance = mv_state.get("universe_resonance", {}) if mv_state else {}
    ripple_count = len(mv_state.get("ripple_log", [])) if mv_state else 0

    # ── 2. Recent wellness activity counts (7-day window) ──
    week_ago = (now - timedelta(days=7)).isoformat()

    mood_count = await db.moods.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    meditation_count = await db.custom_meditations.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    journal_count = await db.journal.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    breathing_count = await db.custom_breathing_patterns.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})
    soundscape_count = await db.custom_soundscapes.count_documents(
        {"user_id": user_id, "created_at": {"$gte": week_ago}})

    streak_doc = await db.rpg_streaks.find_one({"user_id": user_id}, {"_id": 0})
    streak_days = streak_doc.get("days", 0) if streak_doc else 0

    # ── 3. Dynamic Decay — freshness weighting ──
    mood_age = await get_latest_activity_age(user_id, "moods")
    meditation_age = await get_latest_activity_age(user_id, "custom_meditations")
    journal_age = await get_latest_activity_age(user_id, "journal")
    breathing_age = await get_latest_activity_age(user_id, "custom_breathing_patterns")
    soundscape_age = await get_latest_activity_age(user_id, "custom_soundscapes")

    # Raw values with decay applied
    wood_activity = apply_decay(mood_count * 3, mood_age)
    fire_activity = apply_decay(journal_count * 3 + soundscape_count * 2, max(journal_age, soundscape_age) if journal_count + soundscape_count > 0 else 14)
    earth_activity = apply_decay(meditation_count * 4, meditation_age)
    metal_activity = apply_decay(breathing_count * 3, breathing_age)

    # Streak decay: if streak broke, water decays faster
    streak_age = 0.0 if streak_days > 0 else 7.0
    water_activity = apply_decay(
        (ripple_count * 0.5) + (streak_days * 2),
        streak_age,
    )

    # Combine: resonance (persistent) + activity (decaying)
    wood_raw = resonance.get("terrestrial", 0) + wood_activity
    fire_raw = resonance.get("astral", 0) + fire_activity
    earth_raw = resonance.get("ethereal", 0) + earth_activity
    metal_raw = resonance.get("void", 0) + metal_activity
    water_raw = water_activity + min(wood_raw, fire_raw, earth_raw, metal_raw) * 0.3

    elements_raw = {
        "wood": max(wood_raw, DECAY_FLOOR),
        "fire": max(fire_raw, DECAY_FLOOR),
        "earth": max(earth_raw, DECAY_FLOOR),
        "metal": max(metal_raw, DECAY_FLOOR),
        "water": max(water_raw, DECAY_FLOOR),
    }

    # ── 4. Birth Resonance Calibration ──
    natal_doc = await db.nexus_birth_resonance.find_one({"user_id": user_id}, {"_id": 0})
    natal_weights = None
    natal_info = None
    if natal_doc and natal_doc.get("natal_weights"):
        natal_weights = natal_doc["natal_weights"]
        natal_info = {
            "sign": natal_doc.get("sign"),
            "life_path": natal_doc.get("life_path"),
            "boosted_element": natal_doc.get("boosted_element"),
        }

    # Apply natal offset: shift "ideal" ratio per element
    ideal_ratios = {}
    for eid in ELEMENTS:
        if natal_weights:
            ideal_ratios[eid] = natal_weights.get(eid, BALANCE_IDEAL_RATIO)
        else:
            ideal_ratios[eid] = BALANCE_IDEAL_RATIO

    # ── 5. Decoded Modifiers Hook (Phase 2 — Forgotten Languages) ──
    decoded_doc = await db.nexus_decoded_modifiers.find_one({"user_id": user_id}, {"_id": 0})
    decoded_modifiers = decoded_doc.get("modifiers", {}) if decoded_doc else {}
    # Apply permanent offsets from language mastery
    for eid in ELEMENTS:
        mod = decoded_modifiers.get(eid, 0)
        if mod:
            elements_raw[eid] = elements_raw[eid] + mod

    # ── 6. Compute ratios & balance status ──
    total = sum(elements_raw.values())
    ratios = {k: v / total for k, v in elements_raw.items()}

    balance = {}
    imbalances = []
    for eid, ratio in ratios.items():
        ideal = ideal_ratios.get(eid, BALANCE_IDEAL_RATIO)
        deviation = ratio - ideal
        if abs(deviation) > CRITICAL_THRESHOLD:
            status = "critical_excess" if deviation > 0 else "critical_deficient"
        elif abs(deviation) > IMBALANCE_THRESHOLD:
            status = "excess" if deviation > 0 else "deficient"
        elif abs(deviation) > 0.05:
            status = "slightly_high" if deviation > 0 else "slightly_low"
        else:
            status = "balanced"

        edef = ELEMENTS[eid]
        warning = None
        if "excess" in status:
            warning = edef["excess_warning"]
        elif "deficient" in status:
            warning = edef["deficiency_warning"]

        balance[eid] = {
            "raw": round(elements_raw[eid], 1),
            "ratio": round(ratio, 3),
            "percentage": round(ratio * 100, 1),
            "status": status,
            "deviation": round(deviation, 3),
            "ideal_ratio": round(ideal, 3),
            "warning": warning,
        }

        if status in ("excess", "critical_excess", "deficient", "critical_deficient"):
            direction = "excess" if "excess" in status else "deficient"
            task_key = f"{eid}_{direction}"
            task = ALIGNMENT_TASKS.get(task_key)
            if task:
                imbalances.append({
                    "element": eid,
                    "status": status,
                    "direction": direction,
                    "warning": warning,
                    **task,
                })

    # ── 7. Harmony Score with trend tracking ──
    max_deviation = max(abs(b["deviation"]) for b in balance.values())
    harmony = max(0, round((1 - max_deviation / 0.3) * 100))

    # Store harmony snapshot for trend
    today = now.strftime("%Y-%m-%d")
    await db.nexus_harmony_history.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {"harmony": harmony, "timestamp": now.isoformat()}},
        upsert=True,
    )

    # Get trend (last 7 days)
    week_history = await db.nexus_harmony_history.find(
        {"user_id": user_id},
        {"_id": 0, "harmony": 1, "date": 1},
    ).sort("date", -1).to_list(7)

    trend = "stable"
    trend_values = [h["harmony"] for h in reversed(week_history)]
    if len(trend_values) >= 2:
        recent_avg = sum(trend_values[-2:]) / 2
        older_avg = sum(trend_values[:max(1, len(trend_values) - 2)]) / max(1, len(trend_values) - 2)
        diff = recent_avg - older_avg
        if diff > 3:
            trend = "rising"
        elif diff < -3:
            trend = "falling"

    # Constructive/destructive cycle
    cycle = "constructive" if trend == "rising" or harmony >= 70 else "destructive" if trend == "falling" and harmony < 40 else "neutral"

    # Decay info for UI
    decay_activity = {
        "mood_freshness": round(max(0, 1 - mood_age / 7) * 100),
        "meditation_freshness": round(max(0, 1 - meditation_age / 7) * 100),
        "journal_freshness": round(max(0, 1 - journal_age / 7) * 100),
        "breathing_freshness": round(max(0, 1 - breathing_age / 7) * 100),
        "soundscape_freshness": round(max(0, 1 - soundscape_age / 7) * 100),
    }

    return {
        "elements": balance,
        "total_energy": round(total, 1),
        "harmony_score": harmony,
        "harmony_trend": trend,
        "harmony_cycle": cycle,
        "trend_values": trend_values,
        "imbalances": imbalances,
        "natal": natal_info,
        "decay_activity": decay_activity,
        "sources": {
            "mood_count": mood_count,
            "meditation_count": meditation_count,
            "journal_count": journal_count,
            "breathing_count": breathing_count,
            "soundscape_count": soundscape_count,
            "streak_days": streak_days,
            "ripple_count": ripple_count,
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/nexus/state")
async def get_nexus_state(user=Depends(get_current_user)):
    """Get the Elemental Nexus — full 5-element balance state with decay and natal data."""
    balance = await compute_elemental_balance(user["id"])

    elements_enriched = {}
    for eid, edef in ELEMENTS.items():
        bal = balance["elements"].get(eid, {})
        freq = ELEMENT_FREQUENCIES.get(eid, {})
        elements_enriched[eid] = {
            **edef,
            **bal,
            "universe_label": edef["universe"].title() if edef["universe"] else "Universal",
            "frequency": freq,
        }

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    completed_today = await db.nexus_alignments.find(
        {"user_id": user["id"], "date": today}, {"_id": 0}
    ).to_list(10)
    completed_ids = {c["task_key"] for c in completed_today}

    for imb in balance["imbalances"]:
        task_key = f"{imb['element']}_{imb['direction']}"
        imb["completed_today"] = task_key in completed_ids

    return {
        "elements": elements_enriched,
        "harmony_score": balance["harmony_score"],
        "harmony_trend": balance["harmony_trend"],
        "harmony_cycle": balance["harmony_cycle"],
        "trend_values": balance["trend_values"],
        "total_energy": balance["total_energy"],
        "imbalances": balance["imbalances"],
        "natal": balance["natal"],
        "decay_activity": balance["decay_activity"],
        "sources": balance["sources"],
        "element_frequencies": ELEMENT_FREQUENCIES,
    }


@router.post("/nexus/birth-resonance")
async def set_birth_resonance(data: dict = Body(...), user=Depends(get_current_user)):
    """Set or update birth resonance calibration."""
    birth_month = data.get("birth_month")
    birth_day = data.get("birth_day")
    birth_year = data.get("birth_year")

    if not all([birth_month, birth_day, birth_year]):
        raise HTTPException(400, "birth_month, birth_day, birth_year required")

    try:
        birth_month = int(birth_month)
        birth_day = int(birth_day)
        birth_year = int(birth_year)
    except (ValueError, TypeError):
        raise HTTPException(400, "Invalid date values")

    if not (1 <= birth_month <= 12 and 1 <= birth_day <= 31 and 1900 <= birth_year <= 2025):
        raise HTTPException(400, "Date out of range")

    natal = compute_natal_baseline(birth_month, birth_day, birth_year)

    await db.nexus_birth_resonance.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "user_id": user["id"],
            **natal,
            "birth_month": birth_month,
            "birth_day": birth_day,
            "birth_year": birth_year,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )

    return {
        "message": "Birth resonance calibrated",
        **natal,
    }


@router.get("/nexus/birth-resonance")
async def get_birth_resonance(user=Depends(get_current_user)):
    """Get current birth resonance data."""
    doc = await db.nexus_birth_resonance.find_one({"user_id": user["id"]}, {"_id": 0})
    if not doc:
        return {"calibrated": False}
    return {"calibrated": True, **{k: v for k, v in doc.items() if k != "user_id"}}


@router.post("/nexus/align")
async def complete_alignment(data: dict = Body(...), user=Depends(get_current_user)):
    """Complete an alignment task to restore elemental balance."""
    element = data.get("element")
    direction = data.get("direction")

    if element not in ELEMENTS:
        raise HTTPException(400, "Invalid element")
    if direction not in ("excess", "deficient"):
        raise HTTPException(400, "Invalid direction")

    task_key = f"{element}_{direction}"
    task = ALIGNMENT_TASKS.get(task_key)
    if not task:
        raise HTTPException(400, "No alignment task found")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.nexus_alignments.find_one(
        {"user_id": user["id"], "task_key": task_key, "date": today}
    )
    if existing:
        raise HTTPException(400, "Already completed this alignment today")

    await db.nexus_alignments.insert_one({
        "user_id": user["id"],
        "task_key": task_key,
        "element": element,
        "direction": direction,
        "date": today,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })

    xp = task.get("xp", 20)
    await db.rpg_characters.update_one(
        {"user_id": user["id"]}, {"$inc": {"xp": xp}}, upsert=True,
    )

    boost = task.get("element_boost")
    reduce = task.get("element_reduce")
    if boost and ELEMENTS[boost].get("universe"):
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"universe_resonance.{ELEMENTS[boost]['universe']}": 5}},
            upsert=True,
        )
    if reduce and ELEMENTS[reduce].get("universe"):
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"universe_resonance.{ELEMENTS[reduce]['universe']}": -3}},
        )

    dust = 10
    await db.rpg_currencies.update_one(
        {"user_id": user["id"]}, {"$inc": {"cosmic_dust": dust}}, upsert=True,
    )

    freq = task.get("frequency", {})

    return {
        "completed": task["task"],
        "element": element,
        "xp_awarded": xp,
        "dust_awarded": dust,
        "boost_element": boost,
        "reduce_element": reduce,
        "frequency": freq,
        "flow": {
            "from": element if direction == "excess" else boost,
            "to": boost if direction == "excess" else element,
            "type": "constructive" if direction == "deficient" else "rebalance",
        },
    }


@router.get("/nexus/history")
async def get_nexus_history(user=Depends(get_current_user)):
    """Get alignment history."""
    history = await db.nexus_alignments.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(30)
    return {"alignments": history}


@router.get("/nexus/intent")
async def get_nexus_intent(user=Depends(get_current_user)):
    """Predictive intent — tells the Dashboard what the user needs most right now."""
    balance = await compute_elemental_balance(user["id"])

    # Find the worst imbalance
    worst = None
    worst_dev = 0
    for eid, edata in balance["elements"].items():
        dev = abs(edata.get("deviation", 0))
        if dev > worst_dev:
            worst_dev = dev
            worst = eid

    if not worst or worst_dev < 0.05:
        return {
            "state": "balanced",
            "message": "Your elements are in harmony",
            "action": None,
            "element": None,
            "harmony": balance["harmony_score"],
            "cycle": balance.get("harmony_cycle", "neutral"),
        }

    direction = "excess" if balance["elements"][worst].get("deviation", 0) > 0 else "deficient"
    freq = ELEMENT_FREQUENCIES.get(worst, {})
    edef = ELEMENTS.get(worst, {})

    # Generate prescriptive action
    action_map = {
        "wood_excess": {"label": "Grounding Breath", "path": "/breathing", "icon": "wind"},
        "wood_deficient": {"label": "Mood Reflection", "path": "/mood", "icon": "heart"},
        "fire_excess": {"label": "Cooling Meditation", "path": "/meditation", "icon": "timer"},
        "fire_deficient": {"label": "Passion Journal", "path": "/journal", "icon": "book-open"},
        "earth_excess": {"label": "Multiverse Explore", "path": "/multiverse-map", "icon": "map"},
        "earth_deficient": {"label": "Earth Meditation", "path": "/meditation", "icon": "timer"},
        "metal_excess": {"label": "Heart Opening", "path": "/mood", "icon": "heart"},
        "metal_deficient": {"label": "Precision Breath", "path": "/breathing", "icon": "wind"},
        "water_excess": {"label": "Release Journal", "path": "/journal", "icon": "book-open"},
        "water_deficient": {"label": "Flow Quests", "path": "/rpg", "icon": "zap"},
    }

    action = action_map.get(f"{worst}_{direction}", {"label": "Align", "path": "/nexus", "icon": "star"})

    return {
        "state": "drift",
        "element": worst,
        "direction": direction,
        "element_name": edef.get("name", worst),
        "element_color": edef.get("color", "#A855F7"),
        "deviation": round(worst_dev, 3),
        "message": edef.get(f"{direction}_warning", f"{worst} is {direction}"),
        "warning": edef.get(f"{'excess' if direction == 'excess' else 'deficiency'}_warning", ""),
        "action": action,
        "frequency": freq,
        "harmony": balance["harmony_score"],
        "cycle": balance.get("harmony_cycle", "neutral"),
        "confidence": round(min(1.0, worst_dev / 0.2), 2),
    }

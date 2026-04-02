from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

# ━━━ Vowel Formant Reference Data (used by frontend for detection) ━━━
VOWEL_FORMANTS = {
    "A": {"label": "Ah", "f1": 850, "f2": 1610, "geometry": "seed_of_life", "color": "#EF4444", "desc": "Open throat, root resonance"},
    "E": {"label": "Ee", "f1": 270, "f2": 2290, "geometry": "flower_of_life", "color": "#22C55E", "desc": "Forward tongue, crown activation"},
    "I": {"label": "Ih", "f1": 400, "f2": 1920, "geometry": "vesica_piscis", "color": "#3B82F6", "desc": "Mid resonance, third-eye bridge"},
    "O": {"label": "Oh", "f1": 450, "f2": 800, "geometry": "torus", "color": "#FBBF24", "desc": "Rounded lips, heart center"},
    "U": {"label": "Oo", "f1": 325, "f2": 700, "geometry": "merkaba", "color": "#A78BFA", "desc": "Deep resonance, sacral energy"},
}

# ━━━ Tier Definitions ━━━
MASTERY_TIERS = [
    {
        "tier": 1,
        "name": "Vowel Initiate",
        "color": "#60A5FA",
        "resolution": "medium",
        "requirement": "Master all 5 cardinal vowels (A, E, I, O, U)",
        "unlocks": ["basic_phonetics", "medium_resolution"],
        "vowels_required": 5,
        "frequencies_required": 0,
    },
    {
        "tier": 2,
        "name": "Harmonic Adept",
        "color": "#FBBF24",
        "resolution": "medium",
        "requirement": "Complete Tesla 3-6-9 Harmonics training",
        "unlocks": ["sacred_root_syllables", "culinary_spice_rack"],
        "vowels_required": 5,
        "frequencies_required": 3,
    },
    {
        "tier": 3,
        "name": "Unified Resonance",
        "color": "#A78BFA",
        "resolution": "high",
        "requirement": "Full mastery of phonetics and harmonics",
        "unlocks": ["unified_field", "orchestral_chord_synthesis"],
        "vowels_required": 5,
        "frequencies_required": 6,
    },
]

TESLA_FREQUENCIES = [
    {"hz": 396, "label": "3 — Liberation", "ratio": "3:1"},
    {"hz": 639, "label": "6 — Connection", "ratio": "6:1"},
    {"hz": 963, "label": "9 — Crown", "ratio": "9:1"},
    {"hz": 432, "label": "Harmony", "ratio": "Universal"},
    {"hz": 528, "label": "Miracle", "ratio": "Love"},
    {"hz": 741, "label": "Expression", "ratio": "Intuition"},
]


@router.get("/mastery/vowel-reference")
async def get_vowel_reference(user=Depends(get_current_user)):
    """Return formant frequency reference data for vowel detection."""
    return {
        "vowels": VOWEL_FORMANTS,
        "tiers": MASTERY_TIERS,
        "tesla_frequencies": TESLA_FREQUENCIES,
    }


@router.get("/mastery/tier")
async def get_mastery_tier(user=Depends(get_current_user)):
    """Get user's current mastery tier and progress."""
    progress = await db.mastery_tiers.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    if not progress:
        progress = {
            "user_id": user["id"],
            "current_tier": 0,
            "vowels_mastered": [],
            "frequencies_mastered": [],
            "lessons_completed": [],
            "total_practice_seconds": 0,
            "bloom_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.mastery_tiers.insert_one(progress)
        progress.pop("_id", None)

    # Calculate current tier
    vowel_count = len(progress.get("vowels_mastered", []))
    freq_count = len(progress.get("frequencies_mastered", []))
    tier = 0
    for t in MASTERY_TIERS:
        if vowel_count >= t["vowels_required"] and freq_count >= t["frequencies_required"]:
            tier = t["tier"]

    tier_info = MASTERY_TIERS[tier - 1] if tier > 0 else None
    next_tier = MASTERY_TIERS[tier] if tier < len(MASTERY_TIERS) else None

    return {
        "current_tier": tier,
        "tier_info": tier_info,
        "next_tier": next_tier,
        "vowels_mastered": progress.get("vowels_mastered", []),
        "frequencies_mastered": progress.get("frequencies_mastered", []),
        "lessons_completed": progress.get("lessons_completed", []),
        "total_practice_seconds": progress.get("total_practice_seconds", 0),
        "bloom_count": progress.get("bloom_count", 0),
    }


@router.post("/mastery/progress")
async def record_mastery_progress(data: dict = Body(...), user=Depends(get_current_user)):
    """Record a mastery achievement (vowel mastered, frequency locked, lesson completed)."""
    progress_type = data.get("type")  # "vowel", "frequency", "lesson", "practice_time"

    if progress_type not in ("vowel", "frequency", "lesson", "practice_time"):
        raise HTTPException(status_code=400, detail="Invalid progress type")

    # Ensure user has a mastery_tiers document first (avoid $setOnInsert conflicts with $inc)
    existing = await db.mastery_tiers.find_one({"user_id": user["id"]})
    if not existing:
        await db.mastery_tiers.insert_one({
            "user_id": user["id"],
            "current_tier": 0,
            "vowels_mastered": [],
            "frequencies_mastered": [],
            "lessons_completed": [],
            "total_practice_seconds": 0,
            "bloom_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

    update = {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}

    if progress_type == "vowel":
        vowel = data.get("vowel", "").upper()
        if vowel not in VOWEL_FORMANTS:
            raise HTTPException(status_code=400, detail="Invalid vowel")
        confidence = data.get("confidence", 0)
        duration_ms = data.get("duration_ms", 0)
        update["$addToSet"] = {"vowels_mastered": vowel}
        update["$inc"] = {"bloom_count": 1}
        # Record the bloom event
        await db.mastery_events.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "vowel_bloom",
            "vowel": vowel,
            "confidence": confidence,
            "duration_ms": duration_ms,
            "geometry": VOWEL_FORMANTS[vowel]["geometry"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    elif progress_type == "frequency":
        hz = data.get("hz", 0)
        valid_hz = [f["hz"] for f in TESLA_FREQUENCIES]
        if hz not in valid_hz:
            raise HTTPException(status_code=400, detail="Invalid Tesla frequency")
        accuracy = data.get("accuracy", 0)
        update["$addToSet"] = {"frequencies_mastered": hz}
        await db.mastery_events.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "frequency_lock",
            "hz": hz,
            "accuracy": accuracy,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    elif progress_type == "lesson":
        lesson_id = data.get("lesson_id", "")
        if not lesson_id:
            raise HTTPException(status_code=400, detail="lesson_id required")
        update["$addToSet"] = {"lessons_completed": lesson_id}

    elif progress_type == "practice_time":
        seconds = data.get("seconds", 0)
        if seconds <= 0 or seconds > 3600:
            raise HTTPException(status_code=400, detail="Invalid practice time")
        update["$inc"] = {"total_practice_seconds": seconds}

    await db.mastery_tiers.update_one(
        {"user_id": user["id"]},
        update,
    )

    # Re-fetch to check tier advancement
    updated = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    vowel_count = len(updated.get("vowels_mastered", []))
    freq_count = len(updated.get("frequencies_mastered", []))
    new_tier = 0
    for t in MASTERY_TIERS:
        if vowel_count >= t["vowels_required"] and freq_count >= t["frequencies_required"]:
            new_tier = t["tier"]

    old_tier = updated.get("current_tier", 0)
    tier_advanced = new_tier > old_tier
    if tier_advanced:
        await db.mastery_tiers.update_one(
            {"user_id": user["id"]},
            {"$set": {"current_tier": new_tier}},
        )

    return {
        "success": True,
        "type": progress_type,
        "current_tier": new_tier,
        "tier_advanced": tier_advanced,
        "tier_info": MASTERY_TIERS[new_tier - 1] if new_tier > 0 else None,
        "vowels_mastered": updated.get("vowels_mastered", []),
        "frequencies_mastered": updated.get("frequencies_mastered", []),
        "bloom_count": updated.get("bloom_count", 0),
    }


@router.get("/mastery/lessons")
async def get_lessons(user=Depends(get_current_user)):
    """Get available lessons and completion status."""
    progress = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    completed = progress.get("lessons_completed", []) if progress else []

    lessons = [
        {
            "id": "vowel_mastery",
            "tier": 1,
            "title": "Vowel Mastery",
            "desc": "Master the 5 cardinal vowels to unlock Tier 1",
            "steps": [
                {"vowel": v, "label": VOWEL_FORMANTS[v]["label"], "geometry": VOWEL_FORMANTS[v]["geometry"]}
                for v in ["A", "E", "I", "O", "U"]
            ],
            "completed": "vowel_mastery" in completed,
        },
        {
            "id": "tesla_harmonics",
            "tier": 2,
            "title": "Tesla 3-6-9 Harmonics",
            "desc": "Sing the sacred frequency ratios to unlock Tier 2",
            "steps": [
                {"hz": f["hz"], "label": f["label"], "ratio": f["ratio"]}
                for f in TESLA_FREQUENCIES[:3]
            ],
            "completed": "tesla_harmonics" in completed,
            "locked": not progress or len(progress.get("vowels_mastered", [])) < 5,
        },
        {
            "id": "unified_field",
            "tier": 3,
            "title": "Unified Field Attunement",
            "desc": "Complete all 6 Solfeggio frequencies to unlock the Unified Field",
            "steps": [
                {"hz": f["hz"], "label": f["label"], "ratio": f["ratio"]}
                for f in TESLA_FREQUENCIES
            ],
            "completed": "unified_field" in completed,
            "locked": not progress or len(progress.get("frequencies_mastered", [])) < 3,
        },
    ]

    return {"lessons": lessons, "completed_count": len(completed)}

"""
Sovereign Mastery — 4-Tier Super-User Path with Avenue Certificates.

Tier 1: Novice / Seeker      — Core Orientation complete → Basic Nexus Nebula access
Tier 2: Practitioner          — 10 Mixer Collisions → 8D Binaural sound mixing
Tier 3: Specialist            — Avenue Certification → Proximity Tethering (Gravity)
Tier 4: Sovereign / Super-User — Mastery of all 12 Units → Full NPU Burst & Admin Control

Avenues:
  - Spotless Solutions: "Sanitation Technology & Eco-Acoustic Maintenance"
  - Enlightenment Cafe: "Alternative Chemistry & Harmonic Nutrition"
  - Tech/Dev Path: "Modular UI/UX & Sentient Gravity Engineering"
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

# ━━━ 4-Tier Mastery Scale ━━━
SOVEREIGN_TIERS = [
    {
        "tier": 1, "name": "Novice / Seeker", "codename": "The Awakener",
        "color": "#60A5FA",
        "requirement": "Complete Core Orientation",
        "requirement_key": "core_orientation",
        "requirement_count": 1,
        "reward": "Basic Nexus Nebula access",
        "gravity_multiplier": 1.0,
        "bloom_multiplier": 1.0,
        "phonic_depth": "standard",
    },
    {
        "tier": 2, "name": "Practitioner", "codename": "The Forger",
        "color": "#FBBF24",
        "requirement": "10 Successful Mixer Collisions",
        "requirement_key": "mixer_collisions",
        "requirement_count": 10,
        "reward": "Unlocks 8D Binaural sound mixing",
        "gravity_multiplier": 1.3,
        "bloom_multiplier": 1.4,
        "phonic_depth": "binaural_8d",
    },
    {
        "tier": 3, "name": "Specialist", "codename": "The Artisan",
        "color": "#A78BFA",
        "requirement": "Certification in a Specific Avenue",
        "requirement_key": "avenue_certification",
        "requirement_count": 1,
        "reward": "Unlocks Proximity Tethering (Gravity Enhancement)",
        "gravity_multiplier": 1.8,
        "bloom_multiplier": 2.0,
        "phonic_depth": "proximity_tethered",
    },
    {
        "tier": 4, "name": "Sovereign / Super-User", "codename": "The Nexus",
        "color": "#EAB308",
        "requirement": "Mastery of all 12 Units",
        "requirement_key": "full_mastery",
        "requirement_count": 12,
        "reward": "Full NPU Burst & Admin Control",
        "gravity_multiplier": 2.5,
        "bloom_multiplier": 3.0,
        "phonic_depth": "sovereign_omniscient",
    },
]

# ━━━ Avenue Definitions (3 Paths) ━━━
AVENUES = {
    "spotless_solutions": {
        "id": "spotless_solutions",
        "name": "Spotless Solutions",
        "certificate_title": "Sanitation Technology & Eco-Acoustic Maintenance",
        "color": "#22C55E",
        "icon": "sparkles",
        "description": "Master the science of sanitation technology and eco-acoustic maintenance for pristine environments.",
        "curriculum": [
            {"id": "ss_1", "title": "Eco-Acoustic Fundamentals", "description": "Understanding sound-based cleaning frequency science", "xp": 100},
            {"id": "ss_2", "title": "Sanitation Chemistry", "description": "Non-toxic chemical formulations and their frequency resonance", "xp": 150},
            {"id": "ss_3", "title": "Spatial Purification", "description": "Using phonic frequencies to sanitize spaces acoustically", "xp": 200},
            {"id": "ss_4", "title": "Eco-System Integration", "description": "Full-cycle environmental sustainability through sound", "xp": 250},
            {"id": "ss_5", "title": "Mastery Project", "description": "Design and execute a full eco-acoustic sanitation protocol", "xp": 400},
        ],
        "total_xp": 1100,
    },
    "enlightenment_cafe": {
        "id": "enlightenment_cafe",
        "name": "Enlightenment Cafe",
        "certificate_title": "Alternative Chemistry & Harmonic Nutrition",
        "color": "#FB923C",
        "icon": "coffee",
        "description": "Explore alternative chemistry and harmonic nutrition — where cooking becomes a resonant art.",
        "curriculum": [
            {"id": "ec_1", "title": "Harmonic Ingredient Science", "description": "Vibrational properties of whole foods and herbs", "xp": 100},
            {"id": "ec_2", "title": "Frequency-Aligned Recipes", "description": "Cooking methods that preserve nutritional resonance", "xp": 150},
            {"id": "ec_3", "title": "Alternative Chemistry Lab", "description": "Fermentation, enzymatic reactions, and alkaline balancing", "xp": 200},
            {"id": "ec_4", "title": "Nutritional Alchemy", "description": "Transforming base ingredients into wellness elixirs", "xp": 250},
            {"id": "ec_5", "title": "Mastery Project", "description": "Create a full harmonic nutrition menu with paired frequencies", "xp": 400},
        ],
        "total_xp": 1100,
    },
    "tech_dev": {
        "id": "tech_dev",
        "name": "Tech / Dev Path",
        "certificate_title": "Modular UI/UX & Sentient Gravity Engineering",
        "color": "#818CF8",
        "icon": "code",
        "description": "Master modular UI/UX design and sentient gravity engineering — the architecture of the Nexus Nebula.",
        "curriculum": [
            {"id": "td_1", "title": "Modular Component Design", "description": "Building reusable, physics-aware UI components", "xp": 100},
            {"id": "td_2", "title": "Gravity Mathematics", "description": "Inverse-square laws, orbital mechanics, and spring physics", "xp": 150},
            {"id": "td_3", "title": "Sentient Event Architecture", "description": "EventBus, Priority Queues, and NPU burst management", "xp": 200},
            {"id": "td_4", "title": "Nebula Rendering", "description": "Canvas 2D projection math, golden ratio vertices, bloom effects", "xp": 250},
            {"id": "td_5", "title": "Mastery Project", "description": "Engineer a full orbital navigation system from scratch", "xp": 400},
        ],
        "total_xp": 1100,
    },
}

# ━━━ The 12 Units for Sovereign mastery ━━━
ALL_UNITS = [
    "nexus_nebula", "divine_director", "star_charts", "trade_circle",
    "meditation_core", "wellness_engine", "phonic_resonance", "8d_binaural",
    "sacred_geometry", "gps_radar", "npu_burst", "sovereign_certificates",
]


@router.get("/sovereign-mastery/status")
async def get_mastery_status(user=Depends(get_current_user)):
    """Get user's Sovereign Mastery tier, progress, and all avenue statuses."""
    progress = await db.sovereign_mastery.find_one({"user_id": user["id"]}, {"_id": 0})
    if not progress:
        progress = {
            "user_id": user["id"],
            "current_tier": 0,
            "core_orientation_complete": False,
            "mixer_collisions": 0,
            "avenue_certifications": [],
            "units_mastered": [],
            "total_xp": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.sovereign_mastery.insert_one({**progress})
        progress.pop("_id", None)

    # Calculate actual tier
    tier = 0
    if progress.get("core_orientation_complete"):
        tier = 1
    if progress.get("mixer_collisions", 0) >= 10:
        tier = 2
    if len(progress.get("avenue_certifications", [])) >= 1:
        tier = 3
    if len(progress.get("units_mastered", [])) >= 12:
        tier = 4

    tier_info = SOVEREIGN_TIERS[tier - 1] if tier > 0 else None
    next_tier = SOVEREIGN_TIERS[tier] if tier < len(SOVEREIGN_TIERS) else None

    # Avenue progress
    avenue_progress = {}
    for av_id, av in AVENUES.items():
        av_data = await db.avenue_progress.find_one(
            {"user_id": user["id"], "avenue_id": av_id}, {"_id": 0}
        )
        completed_lessons = av_data.get("completed_lessons", []) if av_data else []
        earned_xp = av_data.get("earned_xp", 0) if av_data else 0
        avenue_progress[av_id] = {
            **av,
            "completed_lessons": completed_lessons,
            "earned_xp": earned_xp,
            "progress_pct": round(len(completed_lessons) / len(av["curriculum"]) * 100),
            "certified": av_id in progress.get("avenue_certifications", []),
        }

    # Certificates
    certs = await db.sovereign_certificates.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(20)

    # Next requirement details
    next_req = None
    if tier == 0:
        next_req = {"action": "Complete Core Orientation", "current": 0, "target": 1}
    elif tier == 1:
        next_req = {"action": "Mixer Collisions", "current": progress.get("mixer_collisions", 0), "target": 10}
    elif tier == 2:
        next_req = {"action": "Avenue Certification", "current": len(progress.get("avenue_certifications", [])), "target": 1}
    elif tier == 3:
        next_req = {"action": "Unit Mastery", "current": len(progress.get("units_mastered", [])), "target": 12}

    return {
        "current_tier": tier,
        "tier_info": tier_info,
        "next_tier": next_tier,
        "next_requirement": next_req,
        "all_tiers": SOVEREIGN_TIERS,
        "mixer_collisions": progress.get("mixer_collisions", 0),
        "core_orientation_complete": progress.get("core_orientation_complete", False),
        "avenue_certifications": progress.get("avenue_certifications", []),
        "units_mastered": progress.get("units_mastered", []),
        "total_xp": progress.get("total_xp", 0),
        "avenues": avenue_progress,
        "certificates": certs,
        "gravity_multiplier": tier_info["gravity_multiplier"] if tier_info else 1.0,
        "bloom_multiplier": tier_info["bloom_multiplier"] if tier_info else 1.0,
        "all_units": ALL_UNITS,
    }


@router.post("/sovereign-mastery/record")
async def record_progress(data: dict = Body(...), user=Depends(get_current_user)):
    """Record mastery progress: core_orientation, mixer_collision, lesson_complete, unit_mastered."""
    action = data.get("action")
    if action not in ("core_orientation", "mixer_collision", "lesson_complete", "unit_mastered"):
        raise HTTPException(400, "Invalid action")

    # Ensure document exists
    existing = await db.sovereign_mastery.find_one({"user_id": user["id"]})
    if not existing:
        await db.sovereign_mastery.insert_one({
            "user_id": user["id"], "current_tier": 0,
            "core_orientation_complete": False, "mixer_collisions": 0,
            "avenue_certifications": [], "units_mastered": [], "total_xp": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

    update = {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    result_detail = ""

    if action == "core_orientation":
        update["$set"]["core_orientation_complete"] = True
        result_detail = "Core Orientation complete — Nexus Nebula unlocked"

    elif action == "mixer_collision":
        update["$inc"] = {"mixer_collisions": 1, "total_xp": 25}
        result_detail = "Mixer Collision recorded (+25 XP)"

    elif action == "lesson_complete":
        avenue_id = data.get("avenue_id")
        lesson_id = data.get("lesson_id")
        if not avenue_id or not lesson_id:
            raise HTTPException(400, "avenue_id and lesson_id required")
        if avenue_id not in AVENUES:
            raise HTTPException(400, "Invalid avenue")

        lesson = next((l for l in AVENUES[avenue_id]["curriculum"] if l["id"] == lesson_id), None)
        if not lesson:
            raise HTTPException(400, "Invalid lesson")

        xp_earned = lesson["xp"]

        # Update avenue progress
        await db.avenue_progress.update_one(
            {"user_id": user["id"], "avenue_id": avenue_id},
            {
                "$addToSet": {"completed_lessons": lesson_id},
                "$inc": {"earned_xp": xp_earned},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
                "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
            },
            upsert=True,
        )

        update["$inc"] = {"total_xp": xp_earned}
        result_detail = f"Lesson '{lesson['title']}' complete (+{xp_earned} XP)"

        # Check if avenue is fully complete → auto-certify
        av_progress = await db.avenue_progress.find_one(
            {"user_id": user["id"], "avenue_id": avenue_id}, {"_id": 0}
        )
        completed = av_progress.get("completed_lessons", []) if av_progress else []
        all_lessons = [l["id"] for l in AVENUES[avenue_id]["curriculum"]]
        if all(lid in completed for lid in all_lessons):
            # Generate certificate
            cert_id = str(uuid.uuid4())[:12]
            cert = {
                "id": cert_id,
                "user_id": user["id"],
                "avenue_id": avenue_id,
                "avenue_name": AVENUES[avenue_id]["name"],
                "certificate_title": AVENUES[avenue_id]["certificate_title"],
                "color": AVENUES[avenue_id]["color"],
                "issued_at": datetime.now(timezone.utc).isoformat(),
                "total_xp": AVENUES[avenue_id]["total_xp"],
                "verification_code": f"SVC-{cert_id.upper()}",
            }
            await db.sovereign_certificates.insert_one({**cert})
            cert.pop("_id", None)

            update.setdefault("$addToSet", {})
            update["$addToSet"]["avenue_certifications"] = avenue_id
            result_detail += f" — Certificate earned: {AVENUES[avenue_id]['certificate_title']}"

    elif action == "unit_mastered":
        unit_id = data.get("unit_id")
        if unit_id not in ALL_UNITS:
            raise HTTPException(400, "Invalid unit")
        update["$addToSet"] = {"units_mastered": unit_id}
        update["$inc"] = {"total_xp": 50}
        result_detail = f"Unit '{unit_id}' mastered (+50 XP)"

    await db.sovereign_mastery.update_one({"user_id": user["id"]}, update)

    # Re-calculate tier
    prog = await db.sovereign_mastery.find_one({"user_id": user["id"]}, {"_id": 0})
    tier = 0
    if prog.get("core_orientation_complete"): tier = 1
    if prog.get("mixer_collisions", 0) >= 10: tier = 2
    if len(prog.get("avenue_certifications", [])) >= 1: tier = 3
    if len(prog.get("units_mastered", [])) >= 12: tier = 4

    old_tier = prog.get("current_tier", 0)
    advanced = tier > old_tier
    if advanced:
        await db.sovereign_mastery.update_one(
            {"user_id": user["id"]}, {"$set": {"current_tier": tier}}
        )

    tier_info = SOVEREIGN_TIERS[tier - 1] if tier > 0 else None

    return {
        "success": True,
        "action": action,
        "detail": result_detail,
        "current_tier": tier,
        "tier_advanced": advanced,
        "tier_info": tier_info,
        "gravity_multiplier": tier_info["gravity_multiplier"] if tier_info else 1.0,
        "bloom_multiplier": tier_info["bloom_multiplier"] if tier_info else 1.0,
    }


@router.get("/sovereign-mastery/certificates")
async def get_certificates(user=Depends(get_current_user)):
    """List all earned certificates."""
    certs = await db.sovereign_certificates.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(20)
    return {"certificates": certs}


@router.get("/sovereign-mastery/certificates/{cert_id}/verify")
async def verify_certificate(cert_id: str):
    """Public verification of a certificate by ID."""
    cert = await db.sovereign_certificates.find_one({"id": cert_id}, {"_id": 0})
    if not cert:
        raise HTTPException(404, "Certificate not found")
    return {"valid": True, "certificate": cert}


@router.get("/sovereign-mastery/avenues")
async def get_avenues(user=Depends(get_current_user)):
    """List all avenue paths with curriculum and user progress."""
    result = []
    for av_id, av in AVENUES.items():
        prog = await db.avenue_progress.find_one(
            {"user_id": user["id"], "avenue_id": av_id}, {"_id": 0}
        )
        completed = prog.get("completed_lessons", []) if prog else []
        result.append({
            **av,
            "completed_lessons": completed,
            "progress_pct": round(len(completed) / len(av["curriculum"]) * 100),
            "earned_xp": prog.get("earned_xp", 0) if prog else 0,
        })
    return {"avenues": result}

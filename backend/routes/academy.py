from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/academy", tags=["Omni-Modality Learning & Accreditation"])

# ─── Learning Modalities ───
MODALITIES = {
    "architect": {
        "id": "architect",
        "name": "The Grand Architect",
        "framework": "Gaming",
        "lesson_label": "Quest Node",
        "test_label": "Boss Encounter",
        "lab_label": "Forge Mini-Game",
        "color": "#FBBF24",
        "icon": "castle",
        "xp_multiplier": 1.2,
    },
    "chef": {
        "id": "chef",
        "name": "The Master Chef",
        "framework": "Applied",
        "lesson_label": "Prep List",
        "test_label": "Final Service",
        "lab_label": "Kitchen Lab",
        "color": "#EF4444",
        "icon": "flame",
        "xp_multiplier": 1.0,
    },
    "researcher": {
        "id": "researcher",
        "name": "The Scientific Researcher",
        "framework": "Analytical",
        "lesson_label": "Whitepaper",
        "test_label": "Peer Review",
        "lab_label": "Code Sandbox",
        "color": "#3B82F6",
        "icon": "microscope",
        "xp_multiplier": 1.1,
    },
    "voyager": {
        "id": "voyager",
        "name": "The Harmonic Voyager",
        "framework": "Sensory",
        "lesson_label": "Frequency Map",
        "test_label": "Resonance Trial",
        "lab_label": "Sound Geometry Lab",
        "color": "#C084FC",
        "icon": "waves",
        "xp_multiplier": 1.15,
    },
}

# ─── Curriculum Programs ───
PROGRAMS = [
    {
        "id": "foundations",
        "name": "Foundations of the Collective",
        "description": "Core platform literacy — wallets, guilds, identities, and the H² matrix.",
        "modules": [
            {"id": "m1", "title": "The Central Bank & Dual Currency", "type": "lesson", "duration_min": 15, "complexity": 0.3},
            {"id": "m2", "title": "Identity Modes & Guild Channels", "type": "lesson", "duration_min": 10, "complexity": 0.2},
            {"id": "m3", "title": "Your First Constellation", "type": "lab", "duration_min": 20, "complexity": 0.4},
            {"id": "m4", "title": "Reading the H² State Matrix", "type": "lesson", "duration_min": 25, "complexity": 0.5},
            {"id": "m5", "title": "Quad-Scan & Trade Circle", "type": "lab", "duration_min": 30, "complexity": 0.6},
            {"id": "m6", "title": "Foundations Assessment", "type": "test", "duration_min": 20, "complexity": 0.5},
        ],
    },
    {
        "id": "transmutation",
        "name": "The Art of Transmutation",
        "description": "Master the Dust→Gem economy, resonance scoring, and the Harmony Surge.",
        "modules": [
            {"id": "t1", "title": "Cosmic Dust Earning Strategies", "type": "lesson", "duration_min": 15, "complexity": 0.4},
            {"id": "t2", "title": "Transmutation Gate: Hexagram Alignment", "type": "lesson", "duration_min": 20, "complexity": 0.6},
            {"id": "t3", "title": "Surge Detection & Economic Timing", "type": "lab", "duration_min": 25, "complexity": 0.7},
            {"id": "t4", "title": "Cross-Cluster Interference Patterns", "type": "lesson", "duration_min": 30, "complexity": 0.8},
            {"id": "t5", "title": "Build a Positive-Determinant Trade", "type": "lab", "duration_min": 35, "complexity": 0.9},
            {"id": "t6", "title": "Transmutation Mastery Exam", "type": "test", "duration_min": 25, "complexity": 0.8},
        ],
    },
    {
        "id": "sentinel_ops",
        "name": "Sentinel Operations",
        "description": "Content moderation, phase-aware scanning, and community governance.",
        "modules": [
            {"id": "s1", "title": "The Adaptive Observer", "type": "lesson", "duration_min": 15, "complexity": 0.5},
            {"id": "s2", "title": "Phase Modes: Harmonic / Fractal / Elemental", "type": "lesson", "duration_min": 20, "complexity": 0.6},
            {"id": "s3", "title": "Shadow-Mute Protocol Simulation", "type": "lab", "duration_min": 25, "complexity": 0.7},
            {"id": "s4", "title": "Sentinel Operations Certification", "type": "test", "duration_min": 30, "complexity": 0.8},
        ],
    },
]


@router.get("/modalities")
async def get_modalities(user=Depends(get_current_user)):
    """Get all available learning modalities."""
    return {"modalities": list(MODALITIES.values())}


@router.get("/modality")
async def get_user_modality(user=Depends(get_current_user)):
    """Get the user's currently selected learning modality."""
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not pref:
        return {"modality": "architect", "modality_data": MODALITIES["architect"]}
    mid = pref.get("modality", "architect")
    return {"modality": mid, "modality_data": MODALITIES.get(mid, MODALITIES["architect"])}


@router.patch("/modality")
async def set_user_modality(body: dict, user=Depends(get_current_user)):
    """Switch the user's active learning modality."""
    modality = body.get("modality", "")
    if modality not in MODALITIES:
        raise HTTPException(400, f"Invalid modality. Valid: {list(MODALITIES.keys())}")

    await db.learning_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], "modality": modality, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"modality": modality, "modality_data": MODALITIES[modality]}


@router.get("/programs")
async def get_programs(user=Depends(get_current_user)):
    """Get all curriculum programs with user progress."""
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    mod_data = MODALITIES.get(modality, MODALITIES["architect"])

    progress = await db.learning_progress.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(200)
    completed_ids = {p["module_id"] for p in progress if p.get("status") == "completed"}

    result = []
    for prog in PROGRAMS:
        modules = []
        for m in prog["modules"]:
            label = mod_data.get(f"{m['type']}_label", m["type"])
            modules.append({
                **m,
                "display_label": label,
                "completed": m["id"] in completed_ids,
            })
        total = len(modules)
        done = sum(1 for m in modules if m["completed"])
        result.append({
            **prog,
            "modules": modules,
            "progress": round(done / max(total, 1), 4),
            "completed": done == total,
            "modality_skin": mod_data,
        })

    return {"programs": result, "modality": modality}


@router.post("/begin")
async def begin_module(body: dict, user=Depends(get_current_user)):
    """Begin a learning module (lesson, lab, or test). Starts active focus timer."""
    module_id = body.get("module_id", "")
    program_id = body.get("program_id", "")

    # Find the module
    module = None
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            for m in prog["modules"]:
                if m["id"] == module_id:
                    module = m
                    break

    if not module:
        raise HTTPException(404, "Module not found")

    # Check if already in progress
    existing = await db.learning_progress.find_one(
        {"user_id": user["id"], "module_id": module_id}, {"_id": 0}
    )
    if existing and existing.get("status") == "completed":
        return {"message": "Already completed", "status": "completed"}

    now = datetime.now(timezone.utc).isoformat()
    await db.learning_progress.update_one(
        {"user_id": user["id"], "module_id": module_id},
        {"$set": {
            "user_id": user["id"],
            "module_id": module_id,
            "program_id": program_id,
            "status": "in_progress",
            "started_at": now,
            "complexity": module.get("complexity", 0.5),
        }},
        upsert=True,
    )

    return {
        "status": "in_progress",
        "module": module,
        "started_at": now,
    }


@router.post("/complete")
async def complete_module(body: dict, user=Depends(get_current_user)):
    """Complete a learning module. For labs: validates H² determinant stayed positive.
    Awards resonance-weighted focus time to the unified accreditation score."""
    module_id = body.get("module_id", "")
    program_id = body.get("program_id", "")
    focus_minutes = body.get("focus_minutes", 0)

    # Find module metadata
    module = None
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            for m in prog["modules"]:
                if m["id"] == module_id:
                    module = m
                    break

    if not module:
        raise HTTPException(404, "Module not found")

    progress = await db.learning_progress.find_one(
        {"user_id": user["id"], "module_id": module_id}, {"_id": 0}
    )
    if not progress:
        raise HTTPException(400, "Module not started. Call /begin first.")
    if progress.get("status") == "completed":
        return {"message": "Already completed", "status": "completed"}

    # For labs and tests: validate H² determinant
    if module["type"] in ("lab", "test"):
        state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
        determinant = state.get("determinant_proxy", 0) if state else 0

        if determinant <= 0:
            return {
                "status": "failed",
                "reason": "H² determinant is negative — you must harmonize your platform state before completing this lab.",
                "determinant": determinant,
                "hint": "Increase your guild activity, resolve your hexagram, and ensure cross-cluster resonance.",
            }

    # Calculate weighted focus time
    complexity = module.get("complexity", 0.5)
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    xp_mult = MODALITIES.get(modality, {}).get("xp_multiplier", 1.0)

    weighted_time = max(focus_minutes, module.get("duration_min", 10)) * complexity * xp_mult
    resonance_points = int(weighted_time * 10)

    now = datetime.now(timezone.utc).isoformat()

    await db.learning_progress.update_one(
        {"user_id": user["id"], "module_id": module_id},
        {"$set": {
            "status": "completed",
            "completed_at": now,
            "focus_minutes": focus_minutes,
            "weighted_focus_time": round(weighted_time, 2),
            "resonance_points": resonance_points,
        }},
    )

    # Update unified accreditation score
    await db.accreditation_scores.update_one(
        {"user_id": user["id"]},
        {
            "$inc": {
                "total_resonance_points": resonance_points,
                "total_focus_minutes": focus_minutes,
                "modules_completed": 1,
            },
            "$set": {"updated_at": now},
            "$setOnInsert": {"user_id": user["id"], "created_at": now},
        },
        upsert=True,
    )

    # Check if program is now complete → trigger certification
    prog_modules = []
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            prog_modules = prog["modules"]
            break

    all_progress = await db.learning_progress.find(
        {"user_id": user["id"], "program_id": program_id}, {"_id": 0}
    ).to_list(50)
    completed_ids = {p["module_id"] for p in all_progress if p.get("status") == "completed"}
    program_complete = all(m["id"] in completed_ids for m in prog_modules)

    cert = None
    if program_complete:
        cert = await _issue_certification(user["id"], program_id)

    # Award dust for completion
    from routes.central_bank import get_or_create_vault_wallet
    await get_or_create_vault_wallet(user["id"])
    dust_reward = int(resonance_points * 0.5)
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"dust": dust_reward, "total_dust_earned": dust_reward}},
    )

    return {
        "status": "completed",
        "resonance_points": resonance_points,
        "weighted_focus_time": round(weighted_time, 2),
        "dust_earned": dust_reward,
        "program_complete": program_complete,
        "certification": cert,
    }


async def _issue_certification(user_id: str, program_id: str):
    """Issue a Fractal Certification — a dynamic credential tied to the user's H² state fingerprint."""
    # Get current H² state
    state = await db.hexagram_states.find_one({"user_id": user_id}, {"_id": 0})
    tensor = await db.h2_tensors.find_one({"user_id": user_id}, {"_id": 0})

    # Get accreditation score
    score = await db.accreditation_scores.find_one({"user_id": user_id}, {"_id": 0})

    # Generate fractal fingerprint from H² matrix
    fingerprint = "COSMIC"
    if state:
        binary = state.get("binary", "000000000000000000000000")
        # Convert binary to hex-like fingerprint
        segments = [binary[i:i+4] for i in range(0, 24, 4)]
        hex_parts = [format(int(s, 2), 'X') for s in segments]
        fingerprint = '-'.join(hex_parts)

    now = datetime.now(timezone.utc).isoformat()
    cert_id = str(uuid.uuid4())

    # Find program name
    program_name = program_id
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            program_name = prog["name"]
            break

    cert = {
        "id": cert_id,
        "user_id": user_id,
        "program_id": program_id,
        "program_name": program_name,
        "type": "fractal_certificate",
        "fractal_fingerprint": fingerprint,
        "h2_binary_at_issue": state.get("binary") if state else None,
        "alignment_at_issue": state.get("alignment_score") if state else None,
        "density_at_issue": tensor.get("density") if tensor else None,
        "total_resonance_points": score.get("total_resonance_points", 0) if score else 0,
        "total_focus_minutes": score.get("total_focus_minutes", 0) if score else 0,
        "issued_at": now,
        "verified": True,
    }

    await db.certifications.insert_one(cert)
    cert.pop("_id", None)

    # Mirror hook for sovereign oversight
    await db.sovereign_mirror.insert_one({
        "id": str(uuid.uuid4()),
        "type": "certification_issued",
        "cert_id": cert_id,
        "user_id": user_id,
        "program_id": program_id,
        "fingerprint": fingerprint,
        "created_at": now,
    })

    return cert


@router.get("/accreditation")
async def get_accreditation(user=Depends(get_current_user)):
    """Get unified accreditation score and all certifications."""
    score = await db.accreditation_scores.find_one({"user_id": user["id"]}, {"_id": 0})
    certs = await db.certifications.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("issued_at", -1).to_list(50)

    total_programs = len(PROGRAMS)
    completed_programs = len(certs)

    return {
        "resonance_score": score.get("total_resonance_points", 0) if score else 0,
        "total_focus_minutes": score.get("total_focus_minutes", 0) if score else 0,
        "modules_completed": score.get("modules_completed", 0) if score else 0,
        "programs_total": total_programs,
        "programs_completed": completed_programs,
        "certifications": certs,
        "mastery_level": _compute_mastery_level(score.get("total_resonance_points", 0) if score else 0),
    }


def _compute_mastery_level(resonance_points: int) -> dict:
    """Map resonance points to mastery tier."""
    tiers = [
        (0, "Initiate", "#6B7280"),
        (500, "Apprentice", "#818CF8"),
        (2000, "Journeyman", "#2DD4BF"),
        (5000, "Master", "#FBBF24"),
        (10000, "Grand Master", "#EF4444"),
        (25000, "Sovereign", "#C084FC"),
    ]
    level = tiers[0]
    for threshold, name, color in tiers:
        if resonance_points >= threshold:
            level = (threshold, name, color)
    return {"tier": level[1], "color": level[2], "threshold": level[0]}


@router.get("/forge/{program_id}/{module_id}")
async def get_forge_lab(program_id: str, module_id: str, user=Depends(get_current_user)):
    """Get the Forge Lab simulation data for a specific module."""
    module = None
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            for m in prog["modules"]:
                if m["id"] == module_id:
                    module = m
                    break

    if not module:
        raise HTTPException(404, "Module not found")
    if module["type"] not in ("lab", "test"):
        raise HTTPException(400, "Only labs and tests have forge simulations")

    # Get user's current H² state for the simulation
    state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})

    # Get modality for skinning
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    mod_data = MODALITIES.get(modality, MODALITIES["architect"])

    return {
        "module": module,
        "modality": mod_data,
        "simulation": {
            "type": module["type"],
            "display_label": mod_data.get(f"{module['type']}_label", module["type"]),
            "complexity": module["complexity"],
            "duration_min": module["duration_min"],
            "h2_state": {
                "alignment": state.get("alignment_score", 0) if state else 0,
                "determinant_positive": state.get("determinant_positive", False) if state else False,
                "phase": state.get("phase_mode", "harmonic") if state else "harmonic",
            },
            "validation_rule": "H² determinant must remain positive throughout the simulation",
        },
    }

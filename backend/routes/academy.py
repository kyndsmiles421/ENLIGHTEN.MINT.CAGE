from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid
import math
import random

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
        "theme": "strategic",
        "descriptions": {
            "lesson": "Absorb knowledge through structured quest nodes. Each concept builds on the last.",
            "lab": "Enter the Forge — construct and test your understanding in a simulated arena.",
            "test": "Face the Boss Encounter — prove mastery under matrix pressure.",
        },
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
        "theme": "practical",
        "descriptions": {
            "lesson": "Follow the prep list — methodical steps toward applied understanding.",
            "lab": "The Kitchen Lab — combine ingredients of knowledge into actionable output.",
            "test": "Final Service — execute under pressure with precision and timing.",
        },
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
        "theme": "analytical",
        "descriptions": {
            "lesson": "Study the whitepaper — rigorous analysis of underlying systems.",
            "lab": "Code Sandbox — experiment, debug, and validate hypotheses.",
            "test": "Peer Review — defend your findings against the matrix.",
        },
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
        "theme": "experiential",
        "descriptions": {
            "lesson": "Navigate the frequency map — discover through sensory exploration.",
            "lab": "Sound Geometry Lab — shape frequencies into harmonic structures.",
            "test": "Resonance Trial — attune to the collective frequency and prove alignment.",
        },
    },
}

# ─── Lesson Content Library ───
LESSON_CONTENT = {
    "m1": {
        "title": "The Central Bank & Dual Currency",
        "sections": [
            {"heading": "The Vault", "body": "Every user holds a Vault Wallet containing two currencies: Cosmic Dust (earned through platform activity) and Celestial Gems (premium currency). The Central Bank manages total supply and monetary policy."},
            {"heading": "Earning Dust", "body": "Cosmic Dust flows from sweat equity — guild contributions, constellation creation, moderation participation, and learning completions. The bank auto-mints Dust for verified platform actions."},
            {"heading": "Transmutation", "body": "The AI Broker handles Dust→Gem conversion at a variable rate (normally 100:1, reduced to 60:1 during Harmony Surge). Your hexagram alignment must exceed 25% to transmute."},
        ],
        "key_concepts": ["Vault Wallet", "Cosmic Dust", "Celestial Gems", "Transmutation Gate"],
    },
    "m2": {
        "title": "Identity Modes & Guild Channels",
        "sections": [
            {"heading": "Three Identity Modes", "body": "Full Identity reveals your name and avatar. Avatar Mode generates a geometric visualization — you're recognizable but pseudonymous. Ghost Mode makes you invisible in feeds."},
            {"heading": "Guild Channels", "body": "Four class-based guilds (Resonance Circle, Wayfinder Lodge, Blueprint Sanctum, Trade Circle) and four widget channels provide community spaces for collaboration."},
            {"heading": "The Sentinel", "body": "All content passes through the Automated Content Sentinel. Three violations trigger a shadow-mute — your posts silently disappear while you remain unaware."},
        ],
        "key_concepts": ["Identity Modes", "Guild System", "Shadow-Mute Protocol", "Content Sentinel"],
    },
    "m4": {
        "title": "Reading the H² State Matrix",
        "sections": [
            {"heading": "The 24-Line Architecture", "body": "Your state is encoded in 24 binary lines across 4 clusters: Security (lines 1-6), Location (7-12), Finance (13-18), and Evolution (19-24). Each line is dynamically resolved from your platform activity."},
            {"heading": "The 576-Cell Tensor", "body": "The H² Engine computes a 24×24 State Matrix (576 intersections) using phase-weighted interference. Cross-cluster resonance receives a +0.25 bonus, creating rich interference patterns."},
            {"heading": "The Determinant", "body": "A positive determinant means your state adds value to the Collective. A negative determinant means extraction — trades are blocked, labs cannot be completed, and your variable tax increases."},
        ],
        "key_concepts": ["State Vector", "Cluster Architecture", "Phase Modes", "Determinant Proxy"],
    },
    "t1": {
        "title": "Cosmic Dust Earning Strategies",
        "sections": [
            {"heading": "Activity Mining", "body": "Every platform action generates Dust: posting in guilds, completing learning modules, creating constellations, and passing sentinel checks. Higher complexity yields more Dust."},
            {"heading": "Resonance Multipliers", "body": "Your learning modality's XP multiplier affects Dust rewards. Architects earn 1.2x, Voyagers 1.15x, Researchers 1.1x, and Chefs 1.0x. Choose strategically."},
            {"heading": "Surge Timing", "body": "During Harmony Surge events, transmutation costs drop 40%. Monitor the Collective Resonance Dashboard for optimal timing windows."},
        ],
        "key_concepts": ["Sweat Equity", "XP Multipliers", "Harmony Surge", "Transmutation Timing"],
    },
    "t2": {
        "title": "Transmutation Gate: Hexagram Alignment",
        "sections": [
            {"heading": "The Gate Mechanism", "body": "Transmutation requires hexagram alignment ≥ 25%. Below this threshold, the gate remains sealed. Alignment is calculated as the ratio of active (1) lines to total lines in your 24-bit state vector."},
            {"heading": "Improving Alignment", "body": "Each cluster contributes independently: verify your identity (Security), engage in community (Location), maintain positive balance (Finance), and complete learning (Evolution)."},
            {"heading": "Variable Rates", "body": "The AI Broker applies a 2% Harmony Commerce Fee. During Surge, this drops to 0.5%. Cross-cluster effects can further modify rates — Security×Finance low resonance increases Dust cost by 50%."},
        ],
        "key_concepts": ["Alignment Threshold", "Cluster Contributions", "Commerce Fee", "Variable Rates"],
    },
    "t4": {
        "title": "Cross-Cluster Interference Patterns",
        "sections": [
            {"heading": "Interference Mechanics", "body": "The 24×24 matrix creates interference at every intersection. Within-cluster interactions strengthen individual scores. Cross-cluster interactions reveal systemic health."},
            {"heading": "Critical Pairs", "body": "Security×Finance: Low resonance restricts transmutation. Location×Evolution: High resonance reduces return tax. Security×Evolution: Low resonance triggers sentinel escalation."},
            {"heading": "Density & Health", "body": "Matrix density measures the ratio of non-zero cells. Above 60% density, return tax drops to 15%. Below 20%, tax rises to 45%. Balanced activity across all clusters is key."},
        ],
        "key_concepts": ["Cross-Cluster Resonance", "Interference Pairs", "Matrix Density", "Economy Health"],
    },
    "s1": {
        "title": "The Adaptive Observer",
        "sections": [
            {"heading": "Phase-Aware Scanning", "body": "The Sentinel operates in three modes matching the H² phase: Harmonic (wellness-focused filtering), Fractal (structural analysis for high traffic), and Elemental (binary hard-lock for security alerts)."},
            {"heading": "Pattern Detection", "body": "Content is scanned against prohibited categories: hate speech, slurs, sexual content, self-harm references, and violence. Zero-tolerance triggers immediate shadow-mute after 3 violations."},
            {"heading": "Community Governance", "body": "Shadow-muted users can be unmuted by the Sovereign Dashboard admin. Violation logs track all incidents for transparency and appeal processes."},
        ],
        "key_concepts": ["Phase Modes", "Pattern Categories", "Shadow-Mute", "Sovereign Oversight"],
    },
    "s2": {
        "title": "Phase Modes: Harmonic / Fractal / Elemental",
        "sections": [
            {"heading": "Harmonic Mode", "body": "Active during low platform activity. Resonance-variance filtering emphasizes wellness atmosphere. Phase weight: 1.0x. Light-touch moderation for organic community growth."},
            {"heading": "Fractal Mode", "body": "Activates during high-traffic events (20+ posts in 15 min). Structural symmetry analysis catches coordinated manipulation. Phase weight: 1.5x. Heightened scrutiny without heavy-handedness."},
            {"heading": "Elemental Mode", "body": "Emergency lockdown when 2+ active mutes or 10+ violations detected. Binary hard-lock grounding for defensive posture. Phase weight: 2.0x. Maximum protection for community safety."},
        ],
        "key_concepts": ["Harmonic Filtering", "Fractal Analysis", "Elemental Lockdown", "Phase Weights"],
    },
}

# ─── Forge Simulation Challenges ───
FORGE_CHALLENGES = {
    "m3": {
        "title": "Your First Constellation",
        "objective": "Construct a 3-module constellation that achieves synergy in the Orbital Mixer.",
        "tasks": [
            {"id": "t1", "desc": "Select 3 compatible modules from the registry", "weight": 0.3},
            {"id": "t2", "desc": "Arrange them to achieve at least 1 synergy bond", "weight": 0.3},
            {"id": "t3", "desc": "Save the constellation with a valid name", "weight": 0.2},
            {"id": "t4", "desc": "Verify H² determinant remains positive", "weight": 0.2},
        ],
    },
    "m5": {
        "title": "Quad-Scan & Trade Circle",
        "objective": "Execute a simulated trade that passes both Broker verification passes.",
        "tasks": [
            {"id": "t1", "desc": "Resolve your current 24-bit state vector", "weight": 0.2},
            {"id": "t2", "desc": "Verify Security cluster ≥ 8/12 and Finance ≥ 4/12", "weight": 0.3},
            {"id": "t3", "desc": "Confirm H² matrix determinant is positive", "weight": 0.3},
            {"id": "t4", "desc": "Submit the trade through escrow validation", "weight": 0.2},
        ],
    },
    "m6": {
        "title": "Foundations Assessment",
        "objective": "Demonstrate comprehensive understanding of platform fundamentals.",
        "tasks": [
            {"id": "t1", "desc": "Identify all 4 cluster domains and their line ranges", "weight": 0.25},
            {"id": "t2", "desc": "Calculate alignment score from a given binary", "weight": 0.25},
            {"id": "t3", "desc": "Predict determinant sign from cluster scores", "weight": 0.25},
            {"id": "t4", "desc": "Explain the Harmony Surge trigger conditions", "weight": 0.25},
        ],
    },
    "t3": {
        "title": "Surge Detection & Economic Timing",
        "objective": "Identify an optimal transmutation window during a Harmony Surge event.",
        "tasks": [
            {"id": "t1", "desc": "Monitor collective density for surge threshold (≥85%)", "weight": 0.3},
            {"id": "t2", "desc": "Calculate savings: standard vs surge transmutation rates", "weight": 0.3},
            {"id": "t3", "desc": "Execute transmutation during active surge window", "weight": 0.2},
            {"id": "t4", "desc": "Verify reduced commerce fee applied correctly", "weight": 0.2},
        ],
    },
    "t5": {
        "title": "Build a Positive-Determinant Trade",
        "objective": "Engineer your platform state to produce a positive H² determinant, then execute a trade.",
        "tasks": [
            {"id": "t1", "desc": "Analyze current cluster weaknesses via H² tensor", "weight": 0.2},
            {"id": "t2", "desc": "Strengthen the weakest cluster through targeted actions", "weight": 0.3},
            {"id": "t3", "desc": "Achieve positive determinant across all cross-cluster pairs", "weight": 0.3},
            {"id": "t4", "desc": "Execute a value-additive trade through the AI Broker", "weight": 0.2},
        ],
    },
    "t6": {
        "title": "Transmutation Mastery Exam",
        "objective": "Complete a full transmutation cycle demonstrating economic mastery.",
        "tasks": [
            {"id": "t1", "desc": "Demonstrate alignment ≥ 25% from platform activity", "weight": 0.25},
            {"id": "t2", "desc": "Calculate variable return tax from matrix density", "weight": 0.25},
            {"id": "t3", "desc": "Execute Dust→Gem transmutation with optimal timing", "weight": 0.25},
            {"id": "t4", "desc": "Verify all cross-cluster effects on the trade", "weight": 0.25},
        ],
    },
    "s3": {
        "title": "Shadow-Mute Protocol Simulation",
        "objective": "Simulate the content moderation pipeline and apply shadow-mute correctly.",
        "tasks": [
            {"id": "t1", "desc": "Scan sample content against prohibited patterns", "weight": 0.3},
            {"id": "t2", "desc": "Track violation count and determine mute threshold", "weight": 0.3},
            {"id": "t3", "desc": "Apply shadow-mute while maintaining user unawareness", "weight": 0.2},
            {"id": "t4", "desc": "Log the violation for sovereign oversight review", "weight": 0.2},
        ],
    },
    "s4": {
        "title": "Sentinel Operations Certification",
        "objective": "Demonstrate mastery of all three phase modes and governance protocols.",
        "tasks": [
            {"id": "t1", "desc": "Identify active phase from platform telemetry signals", "weight": 0.25},
            {"id": "t2", "desc": "Apply correct phase weight to content scoring", "weight": 0.25},
            {"id": "t3", "desc": "Handle a multi-violation escalation across phases", "weight": 0.25},
            {"id": "t4", "desc": "Generate a governance report for sovereign review", "weight": 0.25},
        ],
    },
}

# ─── Curriculum Programs ───
PROGRAMS = [
    {
        "id": "foundations",
        "name": "Foundations of the Collective",
        "description": "Core platform literacy — wallets, guilds, identities, and the H² matrix.",
        "tier": "Initiate",
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
        "tier": "Apprentice",
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
        "tier": "Journeyman",
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
    return {"modalities": list(MODALITIES.values())}


@router.get("/modality")
async def get_user_modality(user=Depends(get_current_user)):
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not pref:
        return {"modality": "architect", "modality_data": MODALITIES["architect"]}
    mid = pref.get("modality", "architect")
    return {"modality": mid, "modality_data": MODALITIES.get(mid, MODALITIES["architect"])}


@router.patch("/modality")
async def set_user_modality(body: dict, user=Depends(get_current_user)):
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
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    mod_data = MODALITIES.get(modality, MODALITIES["architect"])

    progress = await db.learning_progress.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(200)
    completed_ids = {p["module_id"] for p in progress if p.get("status") == "completed"}
    in_progress_ids = {p["module_id"] for p in progress if p.get("status") == "in_progress"}

    result = []
    for prog in PROGRAMS:
        modules = []
        for m in prog["modules"]:
            label = mod_data.get(f"{m['type']}_label", m["type"])
            modules.append({
                **m,
                "display_label": label,
                "completed": m["id"] in completed_ids,
                "in_progress": m["id"] in in_progress_ids,
                "has_content": m["id"] in LESSON_CONTENT,
                "has_forge": m["id"] in FORGE_CHALLENGES,
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


@router.get("/lesson/{module_id}")
async def get_lesson_content(module_id: str, user=Depends(get_current_user)):
    """Get themed lesson content for a specific module."""
    content = LESSON_CONTENT.get(module_id)
    if not content:
        raise HTTPException(404, "No lesson content for this module")

    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    mod_data = MODALITIES.get(modality, MODALITIES["architect"])

    return {
        "content": content,
        "modality": mod_data,
        "display_label": mod_data.get("lesson_label", "Lesson"),
    }


@router.post("/begin")
async def begin_module(body: dict, user=Depends(get_current_user)):
    module_id = body.get("module_id", "")
    program_id = body.get("program_id", "")

    module = None
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            for m in prog["modules"]:
                if m["id"] == module_id:
                    module = m
                    break

    if not module:
        raise HTTPException(404, "Module not found")

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

    return {"status": "in_progress", "module": module, "started_at": now}


@router.post("/complete")
async def complete_module(body: dict, user=Depends(get_current_user)):
    """Complete a learning module. Labs/tests validate H² determinant > 0."""
    module_id = body.get("module_id", "")
    program_id = body.get("program_id", "")
    focus_minutes = body.get("focus_minutes", 0)

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
    determinant = 1.0  # Default positive for lessons
    if module["type"] in ("lab", "test"):
        state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
        determinant = state.get("determinant_proxy", 0) if state else 0

        if determinant <= 0:
            return {
                "status": "failed",
                "reason": "H² determinant is non-positive — harmonize your platform state before completing this lab.",
                "determinant": determinant,
                "hint": "Increase guild activity, resolve your hexagram, and ensure cross-cluster resonance.",
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
    """Issue a Fractal Certification with H² state fingerprint."""
    state = await db.hexagram_states.find_one({"user_id": user_id}, {"_id": 0})
    tensor = await db.h2_tensors.find_one({"user_id": user_id}, {"_id": 0})
    score = await db.accreditation_scores.find_one({"user_id": user_id}, {"_id": 0})

    # Generate fractal fingerprint from H² binary
    fingerprint = "COSMIC"
    binary = "000000000000000000000000"
    if state:
        binary = state.get("binary", binary)
        segments = [binary[i:i + 4] for i in range(0, 24, 4)]
        hex_parts = [format(int(s, 2), 'X') for s in segments]
        fingerprint = '-'.join(hex_parts)

    # Generate fractal seed data for SVG rendering
    fractal_seed = _generate_fractal_seed(binary)

    now = datetime.now(timezone.utc).isoformat()
    cert_id = str(uuid.uuid4())

    program_name = program_id
    program_tier = "Initiate"
    for prog in PROGRAMS:
        if prog["id"] == program_id:
            program_name = prog["name"]
            program_tier = prog.get("tier", "Initiate")
            break

    cert = {
        "id": cert_id,
        "user_id": user_id,
        "program_id": program_id,
        "program_name": program_name,
        "program_tier": program_tier,
        "type": "fractal_certificate",
        "fractal_fingerprint": fingerprint,
        "fractal_seed": fractal_seed,
        "h2_binary_at_issue": binary,
        "alignment_at_issue": state.get("alignment_score") if state else None,
        "density_at_issue": tensor.get("density") if tensor else None,
        "total_resonance_points": score.get("total_resonance_points", 0) if score else 0,
        "total_focus_minutes": score.get("total_focus_minutes", 0) if score else 0,
        "issued_at": now,
        "verified": True,
    }

    await db.certifications.insert_one(cert)
    cert.pop("_id", None)

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


def _generate_fractal_seed(binary: str) -> dict:
    """Generate deterministic fractal parameters from the H² binary state."""
    bits = [int(b) for b in binary]
    # Derive parameters from bit patterns
    seg1 = int(binary[0:6], 2)
    seg2 = int(binary[6:12], 2)
    seg3 = int(binary[12:18], 2)
    seg4 = int(binary[18:24], 2)

    return {
        "arms": max(3, (seg1 % 8) + 3),
        "depth": max(2, (seg2 % 5) + 2),
        "rotation": (seg3 * 5.625) % 360,
        "scale_factor": 0.5 + (seg4 / 63.0) * 0.4,
        "hue_base": (seg1 * 5 + seg3 * 3) % 360,
        "symmetry": "radial" if sum(bits[:12]) > sum(bits[12:]) else "bilateral",
        "complexity": sum(bits) / 24.0,
        "segments": [seg1, seg2, seg3, seg4],
    }


@router.get("/accreditation")
async def get_accreditation(user=Depends(get_current_user)):
    score = await db.accreditation_scores.find_one({"user_id": user["id"]}, {"_id": 0})
    certs = await db.certifications.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("issued_at", -1).to_list(50)

    total_programs = len(PROGRAMS)
    completed_programs = len(certs)
    total_modules = sum(len(p["modules"]) for p in PROGRAMS)

    return {
        "resonance_score": score.get("total_resonance_points", 0) if score else 0,
        "total_focus_minutes": score.get("total_focus_minutes", 0) if score else 0,
        "modules_completed": score.get("modules_completed", 0) if score else 0,
        "modules_total": total_modules,
        "programs_total": total_programs,
        "programs_completed": completed_programs,
        "certifications": certs,
        "mastery_level": _compute_mastery_level(score.get("total_resonance_points", 0) if score else 0),
    }


def _compute_mastery_level(resonance_points: int) -> dict:
    tiers = [
        (0, "Initiate", "#6B7280"),
        (500, "Apprentice", "#818CF8"),
        (2000, "Journeyman", "#2DD4BF"),
        (5000, "Master", "#FBBF24"),
        (10000, "Grand Master", "#EF4444"),
        (25000, "Sovereign", "#C084FC"),
    ]
    level = tiers[0]
    next_tier = tiers[1] if len(tiers) > 1 else None
    for i, (threshold, name, color) in enumerate(tiers):
        if resonance_points >= threshold:
            level = (threshold, name, color)
            next_tier = tiers[i + 1] if i + 1 < len(tiers) else None
    progress_to_next = 0
    if next_tier:
        range_size = next_tier[0] - level[0]
        progress_to_next = min(1.0, (resonance_points - level[0]) / max(range_size, 1))
    return {
        "tier": level[1],
        "color": level[2],
        "threshold": level[0],
        "next_tier": next_tier[1] if next_tier else None,
        "next_threshold": next_tier[0] if next_tier else None,
        "progress_to_next": round(progress_to_next, 4),
    }


@router.get("/forge/{program_id}/{module_id}")
async def get_forge_lab(program_id: str, module_id: str, user=Depends(get_current_user)):
    """Get Forge Lab simulation data including challenges and H² state."""
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

    state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
    tensor = await db.h2_tensors.find_one({"user_id": user["id"]}, {"_id": 0})

    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    modality = pref.get("modality", "architect") if pref else "architect"
    mod_data = MODALITIES.get(modality, MODALITIES["architect"])

    challenge = FORGE_CHALLENGES.get(module_id, {})

    # Build a simplified 4x4 cluster matrix from the tensor for visualization
    cluster_matrix = [[0.5] * 4 for _ in range(4)]
    if tensor and "matrix" in tensor:
        full = tensor["matrix"]
        for ci in range(4):
            for cj in range(4):
                si, sj = ci * 6, cj * 6
                total = 0
                count = 0
                for di in range(6):
                    for dj in range(6):
                        if si + di < len(full) and sj + dj < len(full[0]):
                            total += full[si + di][sj + dj]
                            count += 1
                cluster_matrix[ci][cj] = round(total / max(count, 1), 4)

    cluster_names = ["Security", "Location", "Finance", "Evolution"]
    cluster_scores = []
    if state:
        binary = state.get("binary", "0" * 24)
        for ci in range(4):
            seg = binary[ci * 6:(ci + 1) * 6]
            cluster_scores.append({
                "name": cluster_names[ci],
                "score": sum(int(b) for b in seg),
                "max": 6,
                "binary": seg,
            })
    else:
        for ci in range(4):
            cluster_scores.append({"name": cluster_names[ci], "score": 0, "max": 6, "binary": "000000"})

    return {
        "module": module,
        "modality": mod_data,
        "challenge": challenge,
        "simulation": {
            "type": module["type"],
            "display_label": mod_data.get(f"{module['type']}_label", module["type"]),
            "complexity": module["complexity"],
            "duration_min": module["duration_min"],
            "h2_state": {
                "alignment": state.get("alignment_score", 0) if state else 0,
                "determinant_proxy": state.get("determinant_proxy", 0) if state else 0,
                "determinant_positive": (state.get("determinant_proxy", 0) > 0) if state else False,
                "phase": state.get("phase_mode", "harmonic") if state else "harmonic",
                "density": tensor.get("density", 0) if tensor else 0,
                "binary": state.get("binary", "0" * 24) if state else "0" * 24,
            },
            "cluster_matrix": cluster_matrix,
            "cluster_scores": cluster_scores,
            "validation_rule": "H² determinant must remain positive throughout the simulation",
        },
    }

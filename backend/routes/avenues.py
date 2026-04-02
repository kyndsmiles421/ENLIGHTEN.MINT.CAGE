"""
Mastery Avenues — Three paths of dimensional navigation.

The Avenue of Mathematics (The Architect):
  Sacred Geometry puzzles, frequency-alignment proofs.
  Achievement: Mathematical Equilibrium.

The Avenue of Art (The Visionary):
  Visual Vibe Capsules, Collective Shadow Map contribution.
  Achievement: Vision Mode / Active Imagination.

The Avenue of Thought Theory (The Philosopher):
  Integration Quests with Jungian archetypes.
  Achievement: Total Individuation.

Each avenue provides resonance points that gate sub-layer access
and influence Shadow Sprite collapse thresholds.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user
from datetime import datetime, timezone
import random
import hashlib
import uuid

router = APIRouter(prefix="/avenues")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AVENUE DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVENUES = {
    "mathematics": {
        "id": "mathematics",
        "name": "The Avenue of Mathematics",
        "title": "The Architect",
        "color": "#06B6D4",
        "icon": "compass",
        "description": "Engage with Sacred Geometry puzzles and frequency-alignment proofs to unlock deeper sub-layers.",
        "achievement": "Mathematical Equilibrium",
        "achievement_desc": "Precisely predict Superposition Collapse points at GPS Hotspots.",
        "resonance_per_challenge": 15,
        "max_resonance": 1000,
    },
    "art": {
        "id": "art",
        "name": "The Avenue of Art",
        "title": "The Visionary",
        "color": "#F472B6",
        "icon": "palette",
        "description": "Create visual resonance and contribute to the Collective Shadow Map through aesthetic symmetry.",
        "achievement": "Vision Mode",
        "achievement_desc": "Use Active Imagination AI to stabilize area frequencies through aesthetic symmetry.",
        "resonance_per_challenge": 12,
        "max_resonance": 1000,
    },
    "thought": {
        "id": "thought",
        "name": "The Avenue of Thought Theory",
        "title": "The Philosopher",
        "color": "#FBBF24",
        "icon": "brain",
        "description": "Undertake Integration Quests with Jungian archetypes to achieve internal-external consciousness sync.",
        "achievement": "Total Individuation",
        "achievement_desc": "Internal consciousness in perfect sync with the planetary depth.",
        "resonance_per_challenge": 18,
        "max_resonance": 1000,
    },
    "biometrics": {
        "id": "biometrics",
        "name": "The Avenue of Biometrics",
        "title": "The Sentinel",
        "color": "#10B981",
        "icon": "heart_pulse",
        "description": "Sync real-world movement — walking, cycling, yoga, martial arts, dance — to fuel Quantum Tunneling through Kinetic Dust.",
        "achievement": "Biological Equilibrium",
        "achievement_desc": "Physical resonance in perfect harmony with planetary frequency. Body becomes the instrument.",
        "resonance_per_challenge": 10,
        "max_resonance": 1000,
    },
    "science": {
        "id": "science",
        "name": "The Avenue of Science",
        "title": "The Alchemist",
        "color": "#F59E0B",
        "icon": "flask",
        "description": "Use Botanical Lab widgets and Geology Simulators to master nutritional chemistry and Earth science beneath your feet.",
        "achievement": "Alchemical Mastery",
        "achievement_desc": "Transform raw knowledge into practical creation. The lab becomes the universe.",
        "resonance_per_challenge": 15,
        "max_resonance": 1000,
    },
    "history": {
        "id": "history",
        "name": "The Avenue of History",
        "title": "The Chronicler",
        "color": "#EC4899",
        "icon": "scroll",
        "description": "Compare ancient star charts across civilizations, explore historical reconstructions of your coordinates, and chronicle humanity's journey.",
        "achievement": "Temporal Mastery",
        "achievement_desc": "Past and present converge. Every coordinate tells a story across all ages.",
        "resonance_per_challenge": 15,
        "max_resonance": 1000,
    },
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SACRED GEOMETRY CHALLENGES (Mathematics)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GEOMETRY_CHALLENGES = [
    {
        "id": "phi_ratio",
        "name": "The Golden Ratio",
        "description": "Calculate phi (φ) to align the frequency harmonic.",
        "question": "What is the value of φ (phi) rounded to 3 decimal places?",
        "answer": "1.618",
        "hint": "The ratio where a/b = (a+b)/a",
        "difficulty": 1,
        "resonance": 15,
    },
    {
        "id": "platonic_count",
        "name": "Platonic Solids",
        "description": "Count the faces of the cosmos.",
        "question": "How many Platonic Solids exist in three-dimensional space?",
        "answer": "5",
        "hint": "Tetrahedron, Cube, Octahedron...",
        "difficulty": 1,
        "resonance": 12,
    },
    {
        "id": "fibonacci_8th",
        "name": "Fibonacci Sequence",
        "description": "The spiral of natural growth.",
        "question": "What is the 8th number in the Fibonacci sequence (starting 1, 1, 2...)?",
        "answer": "21",
        "hint": "1, 1, 2, 3, 5, 8, 13...",
        "difficulty": 1,
        "resonance": 15,
    },
    {
        "id": "metatron_vertices",
        "name": "Metatron's Cube",
        "description": "The geometric blueprint of creation.",
        "question": "How many circles compose Metatron's Cube (including center)?",
        "answer": "13",
        "hint": "Fruit of Life",
        "difficulty": 2,
        "resonance": 20,
    },
    {
        "id": "vesica_piscis",
        "name": "Vesica Piscis",
        "description": "The womb of sacred mathematics.",
        "question": "What shape is formed by the intersection of two circles of equal radius, each passing through the center of the other?",
        "answer": "vesica piscis",
        "hint": "Latin: 'bladder of a fish'",
        "difficulty": 2,
        "resonance": 18,
    },
    {
        "id": "flower_petals",
        "name": "Flower of Life",
        "description": "The pattern that contains all forms.",
        "question": "How many overlapping circles form the complete Flower of Life?",
        "answer": "19",
        "hint": "Think of the complete symmetric pattern",
        "difficulty": 2,
        "resonance": 22,
    },
    {
        "id": "pi_sequence",
        "name": "The Circle Constant",
        "description": "The infinite ratio that defines all circles.",
        "question": "What are the first 5 digits of pi after the decimal point?",
        "answer": "14159",
        "hint": "3.?????",
        "difficulty": 1,
        "resonance": 12,
    },
    {
        "id": "euler_identity",
        "name": "Euler's Identity",
        "description": "The most beautiful equation in mathematics.",
        "question": "In Euler's identity e^(iπ) + ? = 0, what is the missing number?",
        "answer": "1",
        "hint": "The additive identity",
        "difficulty": 2,
        "resonance": 25,
    },
    # ── Algebra ──
    {
        "id": "quadratic_discriminant",
        "name": "The Discriminant",
        "description": "The oracle that reveals the nature of roots.",
        "question": "For ax² + bx + c = 0, the discriminant is b² - 4ac. If discriminant = 0, how many real roots?",
        "answer": "1",
        "hint": "Think 'touching' the x-axis",
        "difficulty": 2,
        "resonance": 18,
        "category": "algebra",
    },
    {
        "id": "imaginary_unit",
        "name": "The Imaginary Gateway",
        "description": "Where real numbers end, the imaginary realm begins.",
        "question": "What is i² (where i is the imaginary unit)?",
        "answer": "-1",
        "hint": "i = √(-1)",
        "difficulty": 1,
        "resonance": 15,
        "category": "algebra",
    },
    {
        "id": "binomial_expansion",
        "name": "Pascal's Triangle",
        "description": "The fractal pattern hidden in binomial expansion.",
        "question": "What is the coefficient of x² in (x + 1)⁴?",
        "answer": "6",
        "hint": "Row 4 of Pascal's Triangle: 1, 4, 6, 4, 1",
        "difficulty": 2,
        "resonance": 20,
        "category": "algebra",
    },
    # ── Trigonometry ──
    {
        "id": "unit_circle",
        "name": "The Unit Circle",
        "description": "The wheel of trigonometric truth.",
        "question": "What is sin(90°)?",
        "answer": "1",
        "hint": "Top of the unit circle",
        "difficulty": 1,
        "resonance": 12,
        "category": "trigonometry",
    },
    {
        "id": "pythagorean_identity",
        "name": "Pythagorean Identity",
        "description": "The fundamental trigonometric truth.",
        "question": "Complete: sin²(θ) + cos²(θ) = ?",
        "answer": "1",
        "hint": "Always and forever",
        "difficulty": 1,
        "resonance": 15,
        "category": "trigonometry",
    },
    # ── Calculus ──
    {
        "id": "derivative_x_squared",
        "name": "The First Derivative",
        "description": "The instantaneous rate of change — the pulse of the universe.",
        "question": "What is the derivative of x³ with respect to x?",
        "answer": "3x2",
        "hint": "Power rule: nx^(n-1)",
        "difficulty": 2,
        "resonance": 22,
        "category": "calculus",
    },
    {
        "id": "integral_constant",
        "name": "The Integral Mystery",
        "description": "Reversing differentiation reveals a hidden constant.",
        "question": "What letter represents the constant of integration?",
        "answer": "c",
        "hint": "The arbitrary constant added to every indefinite integral",
        "difficulty": 1,
        "resonance": 15,
        "category": "calculus",
    },
    {
        "id": "e_value",
        "name": "Euler's Number",
        "description": "The base of natural growth and decay.",
        "question": "What is e (Euler's number) rounded to 2 decimal places?",
        "answer": "2.72",
        "hint": "The limit of (1 + 1/n)^n as n → ∞",
        "difficulty": 2,
        "resonance": 20,
        "category": "calculus",
    },
    {
        "id": "limit_sinx_x",
        "name": "The Fundamental Limit",
        "description": "Where trigonometry and calculus converge.",
        "question": "What is lim(x→0) of sin(x)/x?",
        "answer": "1",
        "hint": "L'Hôpital's rule or the squeeze theorem",
        "difficulty": 3,
        "resonance": 30,
        "category": "calculus",
    },
    # ── Number Theory ──
    {
        "id": "prime_infinity",
        "name": "Euclid's Proof",
        "description": "The ancient proof that shattered finite thinking.",
        "question": "Are there finitely or infinitely many prime numbers?",
        "answer": "infinitely",
        "hint": "Euclid proved this around 300 BCE",
        "difficulty": 1,
        "resonance": 15,
        "category": "number_theory",
    },
    {
        "id": "perfect_number",
        "name": "Perfect Numbers",
        "description": "Numbers equal to the sum of their proper divisors.",
        "question": "What is the smallest perfect number?",
        "answer": "6",
        "hint": "Its divisors (1, 2, 3) sum to itself",
        "difficulty": 2,
        "resonance": 18,
        "category": "number_theory",
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INTEGRATION QUESTS (Thought Theory)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTEGRATION_QUESTS = [
    {
        "id": "shadow_recognition",
        "name": "Recognizing the Shadow",
        "archetype": "shadow",
        "layer": "mantle",
        "prompt": "Describe a quality you dislike in others that might exist within yourself.",
        "resonance": 20,
        "depth_insight": "The Shadow contains rejected aspects of the self. Acknowledging them is the first step to integration.",
    },
    {
        "id": "anima_encounter",
        "name": "Meeting the Anima",
        "archetype": "anima",
        "layer": "outer_core",
        "prompt": "What feminine quality do you suppress or undervalue in yourself?",
        "resonance": 25,
        "depth_insight": "The Anima represents the unconscious feminine in males, and the Animus the unconscious masculine in females.",
    },
    {
        "id": "wise_elder_counsel",
        "name": "The Wise Elder's Counsel",
        "archetype": "wise_elder",
        "layer": "mantle",
        "prompt": "If the wisest version of yourself could speak, what would they say about your current path?",
        "resonance": 22,
        "depth_insight": "The Wise Old Man/Woman archetype represents accumulated wisdom and guidance from the collective unconscious.",
    },
    {
        "id": "trickster_lesson",
        "name": "The Trickster's Lesson",
        "archetype": "trickster",
        "layer": "outer_core",
        "prompt": "When did chaos or disruption in your life lead to unexpected growth?",
        "resonance": 18,
        "depth_insight": "The Trickster breaks rules to reveal hidden truths and catalyze transformation.",
    },
    {
        "id": "self_integration",
        "name": "The Self — Total Integration",
        "archetype": "self",
        "layer": "hollow_earth",
        "prompt": "Describe the moment when you felt most completely yourself — all contradictions held at once.",
        "resonance": 35,
        "depth_insight": "The Self is the archetype of wholeness — the union of conscious and unconscious, the center of the total psyche.",
    },
    {
        "id": "persona_dissolution",
        "name": "Dissolving the Persona",
        "archetype": "persona",
        "layer": "crust",
        "prompt": "What mask do you wear most often, and what would happen if you removed it?",
        "resonance": 15,
        "depth_insight": "The Persona is the social mask. Dissolution doesn't mean destruction — it means conscious choice.",
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ART PROMPTS (The Visionary)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ART_PROMPTS = [
    {
        "id": "frequency_mandala",
        "name": "Frequency Mandala",
        "prompt": "Visualize your current emotional frequency as a mandala pattern. Describe its colors, geometry, and movement.",
        "resonance": 15,
        "category": "visualization",
    },
    {
        "id": "shadow_portrait",
        "name": "Shadow Portrait",
        "prompt": "If your Shadow had a visual form, what would it look like? Describe its shape, texture, and the space it inhabits.",
        "resonance": 18,
        "category": "shadow_work",
    },
    {
        "id": "depth_landscape",
        "name": "Depth Landscape",
        "prompt": "Paint with words the landscape you see at your current planetary depth. What grows here? What sounds do you hear?",
        "resonance": 12,
        "category": "worldbuilding",
    },
    {
        "id": "vibe_capsule_design",
        "name": "Vibe Capsule Blueprint",
        "prompt": "Design a Vibe Capsule that captures your current resonance. What frequency does it emit? What color is its aura?",
        "resonance": 20,
        "category": "creation",
    },
    {
        "id": "collective_dream",
        "name": "Collective Dream Entry",
        "prompt": "Contribute to the Collective Dream: describe a scene from a dream that felt more real than waking life.",
        "resonance": 22,
        "category": "dreamwork",
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BIOMETRIC ACTIVITIES (The Sentinel)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVITY_TYPES = [
    {
        "id": "walking",
        "name": "Walking",
        "category": "low_intensity",
        "icon": "footprints",
        "description": "Steady, grounding movement. Ideal for stabilizing Crust and Mantle frequencies.",
        "unit": "steps",
        "kinetic_dust_per_unit": 0.01,
        "resonance_per_session": 8,
        "frequency_affinity": ["crust", "mantle"],
        "target_bpm": {"min": 90, "max": 120},
    },
    {
        "id": "cycling",
        "name": "Cycling",
        "category": "high_intensity",
        "icon": "bike",
        "description": "High-velocity traversal. Generates dense Kinetic Dust for deep descents.",
        "unit": "km",
        "kinetic_dust_per_unit": 5.0,
        "resonance_per_session": 12,
        "frequency_affinity": ["outer_core", "hollow_earth"],
        "target_bpm": {"min": 130, "max": 170},
    },
    {
        "id": "running",
        "name": "Running",
        "category": "high_intensity",
        "icon": "zap",
        "description": "Explosive kinetic energy. Fuels rapid tunneling through sub-layers.",
        "unit": "km",
        "kinetic_dust_per_unit": 8.0,
        "resonance_per_session": 15,
        "frequency_affinity": ["outer_core", "hollow_earth"],
        "target_bpm": {"min": 140, "max": 185},
    },
    {
        "id": "yoga",
        "name": "Yoga",
        "category": "low_intensity",
        "icon": "flower",
        "description": "Slow, deliberate movement. Aligns the body's frequency to the planetary layer.",
        "unit": "minutes",
        "kinetic_dust_per_unit": 0.5,
        "resonance_per_session": 12,
        "frequency_affinity": ["crust", "mantle"],
        "target_bpm": {"min": 60, "max": 80},
    },
    {
        "id": "martial_arts",
        "name": "Martial Arts",
        "category": "high_intensity",
        "icon": "shield",
        "description": "Disciplined combat forms. Channels kinetic energy through precise geometric movement.",
        "unit": "minutes",
        "kinetic_dust_per_unit": 1.0,
        "resonance_per_session": 18,
        "frequency_affinity": ["mantle", "outer_core"],
        "target_bpm": {"min": 120, "max": 160},
    },
    {
        "id": "dance",
        "name": "Dance",
        "category": "medium_intensity",
        "icon": "music",
        "description": "Rhythmic body expression. Resonates with all layers through harmonic movement.",
        "unit": "minutes",
        "kinetic_dust_per_unit": 0.8,
        "resonance_per_session": 14,
        "frequency_affinity": ["crust", "mantle", "outer_core"],
        "target_bpm": {"min": 100, "max": 150},
    },
    {
        "id": "gym",
        "name": "Gym / Strength",
        "category": "high_intensity",
        "icon": "dumbbell",
        "description": "Resistance training. Builds structural resonance for maintaining deep-layer pressure.",
        "unit": "minutes",
        "kinetic_dust_per_unit": 0.6,
        "resonance_per_session": 10,
        "frequency_affinity": ["mantle", "outer_core"],
        "target_bpm": {"min": 110, "max": 155},
    },
    {
        "id": "meditation",
        "name": "Moving Meditation",
        "category": "low_intensity",
        "icon": "brain",
        "description": "Tai Chi, Qigong, walking meditation. The slowest path to the deepest frequencies.",
        "unit": "minutes",
        "kinetic_dust_per_unit": 0.3,
        "resonance_per_session": 15,
        "frequency_affinity": ["hollow_earth"],
        "target_bpm": {"min": 50, "max": 70},
    },
]

ACTIVITY_MAP = {a["id"]: a for a in ACTIVITY_TYPES}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/overview")
async def get_avenues_overview(user=Depends(get_current_user)):
    """Get all three avenues with user's resonance progress."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})

    result = []
    for a_id, avenue in AVENUES.items():
        user_data = (prog or {}).get(a_id, {})
        resonance = user_data.get("resonance", 0)
        completed = user_data.get("completed_challenges", [])

        # Calculate tier (0-4) based on resonance
        tier = min(resonance // 200, 4)
        tier_names = ["Initiate", "Apprentice", "Adept", "Master", "Grandmaster"]

        result.append({
            **avenue,
            "resonance": resonance,
            "tier": tier,
            "tier_name": tier_names[tier],
            "completed_count": len(completed),
            "pct": round(resonance / avenue["max_resonance"] * 100, 1),
            "equilibrium_reached": resonance >= avenue["max_resonance"],
        })

    total_resonance = sum(r["resonance"] for r in result)
    combined_tier = min(total_resonance // 600, 4)

    return {
        "avenues": result,
        "total_resonance": total_resonance,
        "combined_tier": combined_tier,
        "combined_tier_name": ["Seeker", "Wayfinder", "Resonant", "Harmonic", "Transcendent"][combined_tier],
    }


@router.get("/mathematics/challenges")
async def get_math_challenges(user=Depends(get_current_user)):
    """Get available Sacred Geometry challenges."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("mathematics", {}).get("completed_challenges", [])

    challenges = []
    for c in GEOMETRY_CHALLENGES:
        challenges.append({
            "id": c["id"],
            "name": c["name"],
            "description": c["description"],
            "question": c["question"],
            "hint": c["hint"],
            "difficulty": c["difficulty"],
            "resonance": c["resonance"],
            "completed": c["id"] in completed,
        })

    return {"challenges": challenges, "total": len(challenges), "completed": len([c for c in challenges if c["completed"]])}


@router.post("/mathematics/solve")
async def solve_math_challenge(
    challenge_id: str = Body(...),
    answer: str = Body(...),
    user=Depends(get_current_user),
):
    """Submit an answer to a Sacred Geometry challenge."""
    uid = user["id"]

    challenge = None
    for c in GEOMETRY_CHALLENGES:
        if c["id"] == challenge_id:
            challenge = c
            break
    if not challenge:
        raise HTTPException(404, "Challenge not found")

    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("mathematics", {}).get("completed_challenges", [])
    if challenge_id in completed:
        raise HTTPException(400, "Challenge already completed")

    # Check answer (case-insensitive, trimmed)
    correct = answer.strip().lower() == challenge["answer"].strip().lower()

    if not correct:
        return {"correct": False, "message": "Frequency misaligned. The geometry doesn't resolve.", "hint": challenge["hint"]}

    now = datetime.now(timezone.utc).isoformat()
    resonance = challenge["resonance"]

    await db.avenue_progress.update_one(
        {"user_id": uid},
        {
            "$set": {"user_id": uid},
            "$inc": {"mathematics.resonance": resonance},
            "$addToSet": {"mathematics.completed_challenges": challenge_id},
            "$push": {"mathematics.history": {"challenge_id": challenge_id, "timestamp": now, "resonance": resonance}},
        },
        upsert=True,
    )

    # XP
    xp_reward = resonance
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "math_challenge",
                    "xp": xp_reward,
                    "challenge": challenge_id,
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "correct": True,
        "resonance_earned": resonance,
        "xp_earned": xp_reward,
        "message": f"Geometry resolved. +{resonance} resonance to The Architect.",
        "challenge_name": challenge["name"],
    }


@router.get("/thought/quests")
async def get_thought_quests(user=Depends(get_current_user)):
    """Get available Integration Quests."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("thought", {}).get("completed_challenges", [])

    quests = []
    for q in INTEGRATION_QUESTS:
        quests.append({
            "id": q["id"],
            "name": q["name"],
            "archetype": q["archetype"],
            "layer": q["layer"],
            "prompt": q["prompt"],
            "resonance": q["resonance"],
            "depth_insight": q["depth_insight"],
            "completed": q["id"] in completed,
        })

    return {"quests": quests, "total": len(quests), "completed": len([q for q in quests if q["completed"]])}


@router.post("/thought/reflect")
async def submit_reflection(
    quest_id: str = Body(...),
    reflection: str = Body(...),
    user=Depends(get_current_user),
):
    """Submit a reflection for an Integration Quest."""
    uid = user["id"]

    quest = None
    for q in INTEGRATION_QUESTS:
        if q["id"] == quest_id:
            quest = q
            break
    if not quest:
        raise HTTPException(404, "Quest not found")

    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("thought", {}).get("completed_challenges", [])
    if quest_id in completed:
        raise HTTPException(400, "Quest already completed")

    if len(reflection.strip()) < 10:
        raise HTTPException(400, "Reflection must be at least 10 characters")

    now = datetime.now(timezone.utc).isoformat()
    resonance = quest["resonance"]

    await db.avenue_progress.update_one(
        {"user_id": uid},
        {
            "$set": {"user_id": uid},
            "$inc": {"thought.resonance": resonance},
            "$addToSet": {"thought.completed_challenges": quest_id},
            "$push": {"thought.history": {
                "quest_id": quest_id,
                "reflection": reflection[:500],
                "timestamp": now,
                "resonance": resonance,
            }},
        },
        upsert=True,
    )

    xp_reward = resonance
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "integration_quest",
                    "xp": xp_reward,
                    "quest": quest_id,
                    "archetype": quest["archetype"],
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "success": True,
        "resonance_earned": resonance,
        "xp_earned": xp_reward,
        "depth_insight": quest["depth_insight"],
        "message": f"Integration complete. The {quest['archetype'].title()} acknowledges your growth.",
    }


@router.get("/art/prompts")
async def get_art_prompts(user=Depends(get_current_user)):
    """Get available Art creation prompts."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("art", {}).get("completed_challenges", [])

    prompts = []
    for p in ART_PROMPTS:
        prompts.append({
            "id": p["id"],
            "name": p["name"],
            "prompt": p["prompt"],
            "resonance": p["resonance"],
            "category": p["category"],
            "completed": p["id"] in completed,
        })

    return {"prompts": prompts, "total": len(prompts), "completed": len([p for p in prompts if p["completed"]])}


@router.post("/art/create")
async def submit_art_creation(
    prompt_id: str = Body(...),
    creation: str = Body(...),
    user=Depends(get_current_user),
):
    """Submit a creative response to an art prompt."""
    uid = user["id"]

    prompt = None
    for p in ART_PROMPTS:
        if p["id"] == prompt_id:
            prompt = p
            break
    if not prompt:
        raise HTTPException(404, "Prompt not found")

    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("art", {}).get("completed_challenges", [])
    if prompt_id in completed:
        raise HTTPException(400, "Prompt already completed")

    if len(creation.strip()) < 10:
        raise HTTPException(400, "Creation must be at least 10 characters")

    now = datetime.now(timezone.utc).isoformat()
    resonance = prompt["resonance"]

    await db.avenue_progress.update_one(
        {"user_id": uid},
        {
            "$set": {"user_id": uid},
            "$inc": {"art.resonance": resonance},
            "$addToSet": {"art.completed_challenges": prompt_id},
            "$push": {"art.history": {
                "prompt_id": prompt_id,
                "creation": creation[:500],
                "timestamp": now,
                "resonance": resonance,
            }},
        },
        upsert=True,
    )

    xp_reward = resonance
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "art_creation",
                    "xp": xp_reward,
                    "prompt": prompt_id,
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "success": True,
        "resonance_earned": resonance,
        "xp_earned": xp_reward,
        "message": f"Vision captured. +{resonance} resonance to The Visionary.",
    }


@router.get("/resonance-check")
async def check_resonance_threshold(user=Depends(get_current_user)):
    """
    Check if user's combined avenue resonance meets thresholds
    for Quantum Handshake (Shadow Sprite collapse).
    """
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})

    math_res = (prog or {}).get("mathematics", {}).get("resonance", 0)
    art_res = (prog or {}).get("art", {}).get("resonance", 0)
    thought_res = (prog or {}).get("thought", {}).get("resonance", 0)
    bio_res = (prog or {}).get("biometrics", {}).get("resonance", 0)
    sci_res = (prog or {}).get("science", {}).get("resonance", 0)
    hist_res = (prog or {}).get("history", {}).get("resonance", 0)
    total = math_res + art_res + thought_res + bio_res + sci_res + hist_res

    return {
        "mathematics": math_res,
        "art": art_res,
        "thought": thought_res,
        "biometrics": bio_res,
        "science": sci_res,
        "history": hist_res,
        "total": total,
        "thresholds": {
            "common_collapse": {"required": 0, "met": True},
            "uncommon_collapse": {"required": 30, "met": total >= 30},
            "rare_collapse": {"required": 100, "met": total >= 100},
            "legendary_collapse": {"required": 300, "met": total >= 300},
        },
        "equilibrium": {
            "mathematics": math_res >= 1000,
            "art": art_res >= 1000,
            "thought": thought_res >= 1000,
            "biometrics": bio_res >= 1000,
            "science": sci_res >= 1000,
            "history": hist_res >= 1000,
            "total": total >= 6000,
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BIOMETRICS ENDPOINTS (The Sentinel)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/biometrics/activities")
async def get_biometric_activities(user=Depends(get_current_user)):
    """Get all available physical activity types."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    bio_data = (prog or {}).get("biometrics", {})
    history = bio_data.get("activity_log", [])

    # Count sessions per activity type
    session_counts = {}
    for entry in history:
        aid = entry.get("activity_id", "")
        session_counts[aid] = session_counts.get(aid, 0) + 1

    activities = []
    for a in ACTIVITY_TYPES:
        activities.append({
            **a,
            "sessions_completed": session_counts.get(a["id"], 0),
        })

    return {
        "activities": activities,
        "total": len(activities),
        "kinetic_dust_earned": bio_data.get("kinetic_dust_total", 0),
        "total_sessions": len(history),
    }


@router.post("/biometrics/log")
async def log_biometric_activity(
    activity_id: str = Body(...),
    value: float = Body(...),
    heart_rate: int = Body(None),
    duration_minutes: int = Body(None),
    user=Depends(get_current_user),
):
    """
    Log a physical activity session.
    Generates Kinetic Dust and avenue resonance.
    """
    uid = user["id"]
    activity = ACTIVITY_MAP.get(activity_id)
    if not activity:
        raise HTTPException(404, "Unknown activity type")

    if value <= 0:
        raise HTTPException(400, "Value must be positive")

    # Calculate Kinetic Dust
    kinetic_dust = round(value * activity["kinetic_dust_per_unit"], 1)
    resonance = activity["resonance_per_session"]

    # Heart rate bonus: if within target BPM range, +50% dust
    hr_bonus = False
    if heart_rate and activity["target_bpm"]:
        if activity["target_bpm"]["min"] <= heart_rate <= activity["target_bpm"]["max"]:
            kinetic_dust = round(kinetic_dust * 1.5, 1)
            hr_bonus = True

    now = datetime.now(timezone.utc).isoformat()

    log_entry = {
        "id": str(uuid.uuid4())[:8],
        "activity_id": activity_id,
        "activity_name": activity["name"],
        "value": value,
        "unit": activity["unit"],
        "kinetic_dust": kinetic_dust,
        "heart_rate": heart_rate,
        "duration_minutes": duration_minutes,
        "hr_bonus": hr_bonus,
        "timestamp": now,
    }

    await db.avenue_progress.update_one(
        {"user_id": uid},
        {
            "$set": {"user_id": uid},
            "$inc": {
                "biometrics.resonance": resonance,
                "biometrics.kinetic_dust_total": kinetic_dust,
            },
            "$push": {"biometrics.activity_log": log_entry},
        },
        upsert=True,
    )

    # Convert Kinetic Dust to Cosmic Dust (1:1)
    await db.users.update_one(
        {"id": uid},
        {"$inc": {"user_dust_balance": kinetic_dust}},
    )

    # XP for physical activity
    xp_reward = resonance
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "biometric_activity",
                    "xp": xp_reward,
                    "activity": activity_id,
                    "kinetic_dust": kinetic_dust,
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "success": True,
        "activity": activity["name"],
        "value": value,
        "unit": activity["unit"],
        "kinetic_dust_earned": kinetic_dust,
        "cosmic_dust_added": kinetic_dust,
        "resonance_earned": resonance,
        "xp_earned": xp_reward,
        "hr_bonus": hr_bonus,
        "frequency_affinity": activity["frequency_affinity"],
        "message": f"{activity['name']} logged. +{kinetic_dust} Kinetic Dust generated.",
    }


@router.get("/biometrics/stats")
async def get_biometric_stats(user=Depends(get_current_user)):
    """Get detailed biometric statistics and history."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    bio = (prog or {}).get("biometrics", {})
    history = bio.get("activity_log", [])

    by_type = {}
    for entry in history:
        aid = entry.get("activity_id", "unknown")
        if aid not in by_type:
            by_type[aid] = {"sessions": 0, "total_dust": 0, "total_value": 0}
        by_type[aid]["sessions"] += 1
        by_type[aid]["total_dust"] += entry.get("kinetic_dust", 0)
        by_type[aid]["total_value"] += entry.get("value", 0)

    return {
        "resonance": bio.get("resonance", 0),
        "kinetic_dust_total": bio.get("kinetic_dust_total", 0),
        "total_sessions": len(history),
        "by_activity": by_type,
        "recent_history": history[-15:],
    }


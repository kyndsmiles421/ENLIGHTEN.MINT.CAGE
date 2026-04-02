"""
Avenue of Science (The Alchemist) — Botanical Lab & Geology Simulators.
Interactive simulations for nutritional chemistry, plant-based baking,
coffee extraction science, and geology beneath GPS coordinates.

Avenue of History (The Chronicler) — Timelines & Star Charts.
Ancient civilization comparisons, historical coordinate reconstructions,
and the evolution of human knowledge systems.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid
import math
import random

router = APIRouter(prefix="/science-history")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BOTANICAL LAB — Plant-Based Chemistry Simulations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOTANICAL_SIMULATIONS = [
    {
        "id": "aquafaba_meringue",
        "name": "Aquafaba Air Matrix",
        "category": "baking",
        "description": "Simulate how chickpea proteins unfold to create stable air pockets for vegan meringues and cakes.",
        "variables": [
            {"id": "whip_speed", "name": "Whip Speed (RPM)", "min": 100, "max": 1200, "optimal": 800, "unit": "RPM"},
            {"id": "temperature", "name": "Temperature (°C)", "min": 4, "max": 30, "optimal": 18, "unit": "°C"},
            {"id": "acid_drops", "name": "Cream of Tartar (drops)", "min": 0, "max": 10, "optimal": 4, "unit": "drops"},
        ],
        "science_note": "Saponins in aquafaba act as surfactants, lowering surface tension. Cold temperatures increase foam stability. Acid strengthens protein bonds.",
        "resonance": 20,
        "mastery_product": "Artisan Vegan Meringue Kit",
    },
    {
        "id": "monk_fruit_pectin",
        "name": "Monk Fruit & Pectin Gelation",
        "category": "baking",
        "description": "Adjust pH and sugar alternative ratios to achieve perfect fruit pectin set for energy bar fillings.",
        "variables": [
            {"id": "ph_level", "name": "pH Level", "min": 2.0, "max": 7.0, "optimal": 3.2, "unit": "pH"},
            {"id": "monk_fruit_pct", "name": "Monk Fruit (%)", "min": 0, "max": 100, "optimal": 35, "unit": "%"},
            {"id": "pectin_grams", "name": "Pectin (g/L)", "min": 1, "max": 20, "optimal": 8, "unit": "g/L"},
        ],
        "science_note": "Pectin gels at pH 2.8-3.5 with >55% soluble solids. Monk fruit's mogrosides don't interfere with gelation but affect texture perception.",
        "resonance": 22,
        "mastery_product": "Positive Energy Bar Filling Kit",
    },
    {
        "id": "coconut_hemp_emulsion",
        "name": "Coconut-Hemp Milk Emulsion",
        "category": "coffee",
        "description": "Test molecular stability of homemade plant milks at different temperatures for professional coffee brewing.",
        "variables": [
            {"id": "temperature", "name": "Temperature (°C)", "min": 4, "max": 95, "optimal": 65, "unit": "°C"},
            {"id": "coconut_ratio", "name": "Coconut:Hemp Ratio", "min": 10, "max": 90, "optimal": 60, "unit": "%"},
            {"id": "lecithin_mg", "name": "Sunflower Lecithin (mg)", "min": 0, "max": 500, "optimal": 200, "unit": "mg"},
        ],
        "science_note": "Lecithin stabilizes oil-water interfaces. Above 72°C, hemp proteins denature and curdle. The sweet spot for latte art is 60-68°C.",
        "resonance": 18,
        "mastery_product": "Professional Barista Plant Milk Kit",
    },
    {
        "id": "kona_extraction",
        "name": "Kona Brew Extraction Curve",
        "category": "coffee",
        "description": "Simulate water passing through Ka'ū Maragogipe beans. Master Total Dissolved Solids (TDS) and flavor extraction.",
        "variables": [
            {"id": "grind_size", "name": "Grind Size (μm)", "min": 200, "max": 1200, "optimal": 500, "unit": "μm"},
            {"id": "water_temp", "name": "Water Temperature (°C)", "min": 85, "max": 100, "optimal": 93, "unit": "°C"},
            {"id": "brew_time", "name": "Brew Time (sec)", "min": 15, "max": 300, "optimal": 180, "unit": "sec"},
            {"id": "tds_target", "name": "TDS Target (%)", "min": 1.0, "max": 2.5, "optimal": 1.35, "unit": "%"},
        ],
        "science_note": "Optimal extraction: 18-22% of solubles. Under-extraction = sour/salty. Over-extraction = bitter/astringent. TDS 1.15-1.45% is the 'golden cup'.",
        "resonance": 25,
        "mastery_product": "Ka'ū Single Origin Subscription",
    },
    {
        "id": "lychee_crumb",
        "name": "The Perfect Lychee Crumb",
        "category": "baking",
        "description": "Balance moisture, fat, and starch to create the ideal crumble topping with freeze-dried lychee.",
        "variables": [
            {"id": "butter_temp", "name": "Coconut Butter Temp (°C)", "min": -5, "max": 25, "optimal": 5, "unit": "°C"},
            {"id": "flour_ratio", "name": "Flour:Sugar Ratio", "min": 30, "max": 80, "optimal": 55, "unit": "%"},
            {"id": "lychee_pct", "name": "Freeze-Dried Lychee (%)", "min": 5, "max": 40, "optimal": 18, "unit": "%"},
        ],
        "science_note": "Cold fat + flour = steam pockets during baking = crumble texture. Freeze-dried fruit absorbs 3x its weight in moisture — add last.",
        "resonance": 20,
        "mastery_product": "Lychee Crumble Topping Mix",
    },
]

GEOLOGY_SIMULATIONS = [
    {
        "id": "layer_identification",
        "name": "Earth Layer Identification",
        "category": "geology",
        "description": "Identify rock types and geological layers beneath your current GPS coordinates.",
        "questions": [
            {"q": "What is the thinnest layer of the Earth?", "a": "crust", "hint": "5-70 km thick"},
            {"q": "What mineral gives the mantle its green color?", "a": "olivine", "hint": "A silicate mineral"},
            {"q": "At what depth (km) does the outer core begin?", "a": "2900", "hint": "The Gutenberg discontinuity"},
            {"q": "What is the primary composition of Earth's inner core?", "a": "iron", "hint": "Fe-Ni alloy"},
        ],
        "resonance": 15,
    },
    {
        "id": "mineral_hardness",
        "name": "Mohs Hardness Scale",
        "category": "geology",
        "description": "Test your knowledge of mineral hardness from talc to diamond.",
        "questions": [
            {"q": "What mineral is #1 (softest) on the Mohs scale?", "a": "talc", "hint": "Used in baby powder"},
            {"q": "What mineral is #10 (hardest) on the Mohs scale?", "a": "diamond", "hint": "Carbon allotrope"},
            {"q": "Quartz is #7 on the Mohs scale. What is #6?", "a": "feldspar", "hint": "Most abundant mineral family"},
            {"q": "What is the hardness of topaz on the Mohs scale?", "a": "8", "hint": "Between corundum and quartz"},
        ],
        "resonance": 12,
    },
    {
        "id": "rock_cycle",
        "name": "The Rock Cycle",
        "category": "geology",
        "description": "Understand the transformation between igneous, sedimentary, and metamorphic rocks.",
        "questions": [
            {"q": "What type of rock forms from cooled magma?", "a": "igneous", "hint": "From Latin 'ignis' = fire"},
            {"q": "What process turns sedimentary rock into metamorphic?", "a": "heat and pressure", "hint": "Deep within the Earth"},
            {"q": "Limestone is what type of rock?", "a": "sedimentary", "hint": "Formed from marine organisms"},
            {"q": "What metamorphic rock does limestone become under pressure?", "a": "marble", "hint": "Used in sculpture"},
        ],
        "resonance": 15,
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HISTORY MODULES — Timelines & Civilizations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HISTORY_MODULES = [
    {
        "id": "ancient_astronomy",
        "name": "Ancient Star Charts",
        "era": "3000 BCE - 500 CE",
        "civilizations": ["Egyptian", "Mesopotamian", "Greek", "Mayan", "Chinese"],
        "description": "Compare how five ancient civilizations mapped the same night sky with entirely different mythological frameworks.",
        "questions": [
            {"q": "Which civilization created the 365-day solar calendar?", "a": "egyptian", "hint": "Land of the Nile"},
            {"q": "The Mayan 'Long Count' calendar ends a cycle in what year?", "a": "2012", "hint": "December 21st"},
            {"q": "Which Greek astronomer first proposed a heliocentric model?", "a": "aristarchus", "hint": "Of Samos"},
            {"q": "Chinese astronomy organized stars into how many 'mansions'?", "a": "28", "hint": "Lunar mansions"},
        ],
        "resonance": 20,
    },
    {
        "id": "sacred_sites",
        "name": "Sacred Sites & Ley Lines",
        "era": "Neolithic - Present",
        "civilizations": ["Global"],
        "description": "Explore the alignment of ancient sacred sites along hypothesized energy lines across the planet.",
        "questions": [
            {"q": "Stonehenge aligns with which astronomical event?", "a": "summer solstice", "hint": "June 21st"},
            {"q": "The Great Pyramid of Giza originally stood how many meters tall?", "a": "146", "hint": "Originally 146.5m"},
            {"q": "What ancient site in Peru features enormous geoglyphs?", "a": "nazca", "hint": "Lines visible from the air"},
            {"q": "Angkor Wat mirrors the constellation of which zodiac?", "a": "draco", "hint": "The dragon"},
        ],
        "resonance": 18,
    },
    {
        "id": "transport_evolution",
        "name": "The Evolution of Transport",
        "era": "3500 BCE - 2026 CE",
        "civilizations": ["Global"],
        "description": "From the invention of the wheel to dual-motor e-bikes — how sacred geometry shaped mobility.",
        "questions": [
            {"q": "Where was the wheel invented around 3500 BCE?", "a": "mesopotamia", "hint": "Modern-day Iraq"},
            {"q": "Who built the first practical electric vehicle in 1884?", "a": "thomas parker", "hint": "English inventor"},
            {"q": "What year did the first commercially successful e-bike appear?", "a": "1997", "hint": "Late 1990s Japan"},
            {"q": "Fat tire bikes originated for riding on what surface?", "a": "snow", "hint": "Alaska and Minnesota"},
        ],
        "resonance": 15,
    },
    {
        "id": "alchemy_history",
        "name": "The History of Alchemy",
        "era": "300 BCE - 1700 CE",
        "civilizations": ["Egyptian", "Chinese", "Islamic", "European"],
        "description": "Trace the transformation of alchemical practice from ancient Egypt to modern chemistry.",
        "questions": [
            {"q": "What was the primary goal of Western alchemy?", "a": "transmutation", "hint": "Turning base metals to gold"},
            {"q": "The 'Emerald Tablet' is attributed to which mythical figure?", "a": "hermes trismegistus", "hint": "Thrice-great"},
            {"q": "Which alchemist is considered the father of modern chemistry?", "a": "lavoisier", "hint": "Antoine-Laurent"},
            {"q": "What Chinese alchemical pursuit led to the invention of gunpowder?", "a": "immortality", "hint": "The elixir of life"},
        ],
        "resonance": 20,
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SCIENCE ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/botanical-lab")
async def get_botanical_simulations(user=Depends(get_current_user)):
    """Get all Botanical Lab simulations."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("science", {}).get("completed_challenges", [])

    sims = []
    for s in BOTANICAL_SIMULATIONS:
        sims.append({
            **s,
            "completed": s["id"] in completed,
        })
    return {"simulations": sims, "total": len(sims), "completed": len([s for s in sims if s["completed"]])}


@router.post("/botanical-lab/simulate")
async def run_botanical_simulation(
    simulation_id: str = Body(...),
    variables: dict = Body(...),
    user=Depends(get_current_user),
):
    """
    Run a botanical simulation with user-provided variable values.
    Scores based on proximity to optimal values.
    """
    uid = user["id"]
    sim = None
    for s in BOTANICAL_SIMULATIONS:
        if s["id"] == simulation_id:
            sim = s
            break
    if not sim:
        raise HTTPException(404, "Simulation not found")

    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("science", {}).get("completed_challenges", [])
    if simulation_id in completed:
        raise HTTPException(400, "Simulation already mastered")

    # Score each variable (0-100 based on proximity to optimal)
    scores = []
    feedback = []
    for var in sim["variables"]:
        user_val = variables.get(var["id"])
        if user_val is None:
            raise HTTPException(400, f"Missing variable: {var['id']}")

        user_val = float(user_val)
        optimal = var["optimal"]
        var_range = var["max"] - var["min"]
        distance = abs(user_val - optimal) / var_range
        score = max(0, round((1 - distance * 2) * 100))
        scores.append(score)

        if score >= 80:
            feedback.append(f"{var['name']}: Excellent ({user_val} {var['unit']})")
        elif score >= 50:
            feedback.append(f"{var['name']}: Good, but adjust toward {optimal} {var['unit']}")
        else:
            feedback.append(f"{var['name']}: Off target. Optimal: {optimal} {var['unit']}")

    avg_score = round(sum(scores) / len(scores))
    mastered = avg_score >= 70

    now = datetime.now(timezone.utc).isoformat()
    resonance = sim["resonance"] if mastered else round(sim["resonance"] * avg_score / 100)

    if mastered:
        await db.avenue_progress.update_one(
            {"user_id": uid},
            {
                "$set": {"user_id": uid},
                "$inc": {"science.resonance": resonance},
                "$addToSet": {"science.completed_challenges": simulation_id},
                "$push": {"science.history": {
                    "sim_id": simulation_id,
                    "score": avg_score,
                    "mastered": True,
                    "timestamp": now,
                }},
            },
            upsert=True,
        )

        xp = resonance
        await db.users.update_one(
            {"id": uid},
            {
                "$inc": {"consciousness.xp": xp},
                "$push": {"consciousness.activity_log": {
                    "type": "science_sim", "xp": xp,
                    "sim": simulation_id, "timestamp": now,
                }},
            },
        )

    return {
        "score": avg_score,
        "mastered": mastered,
        "resonance_earned": resonance if mastered else 0,
        "feedback": feedback,
        "science_note": sim["science_note"],
        "mastery_product": sim["mastery_product"] if mastered else None,
        "message": f"Score: {avg_score}%. {'Mastered!' if mastered else 'Adjust variables and try again.'}",
    }


@router.get("/geology")
async def get_geology_modules(user=Depends(get_current_user)):
    """Get all geology simulation modules."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("science", {}).get("completed_challenges", [])

    modules = []
    for g in GEOLOGY_SIMULATIONS:
        modules.append({
            "id": g["id"],
            "name": g["name"],
            "category": g["category"],
            "description": g["description"],
            "question_count": len(g["questions"]),
            "resonance": g["resonance"],
            "completed": g["id"] in completed,
        })
    return {"modules": modules, "total": len(modules), "completed": len([m for m in modules if m["completed"]])}


@router.get("/geology/{module_id}/question/{question_index}")
async def get_geology_question(module_id: str, question_index: int, user=Depends(get_current_user)):
    """Get a specific geology question."""
    module = None
    for g in GEOLOGY_SIMULATIONS:
        if g["id"] == module_id:
            module = g
            break
    if not module:
        raise HTTPException(404, "Module not found")
    if question_index < 0 or question_index >= len(module["questions"]):
        raise HTTPException(400, "Invalid question index")
    q = module["questions"][question_index]
    return {"question": q["q"], "hint": q["hint"], "index": question_index, "total": len(module["questions"])}


@router.post("/geology/answer")
async def answer_geology(
    module_id: str = Body(...),
    question_index: int = Body(...),
    answer: str = Body(...),
    user=Depends(get_current_user),
):
    """Answer a geology question."""
    uid = user["id"]
    module = None
    for g in GEOLOGY_SIMULATIONS:
        if g["id"] == module_id:
            module = g
            break
    if not module:
        raise HTTPException(404, "Module not found")

    if question_index < 0 or question_index >= len(module["questions"]):
        raise HTTPException(400, "Invalid question index")

    q = module["questions"][question_index]
    correct = answer.strip().lower() == q["a"].strip().lower()

    if correct:
        now = datetime.now(timezone.utc).isoformat()
        resonance = module["resonance"] // len(module["questions"])

        await db.avenue_progress.update_one(
            {"user_id": uid},
            {
                "$set": {"user_id": uid},
                "$inc": {"science.resonance": resonance},
                "$addToSet": {"science.completed_challenges": f"{module_id}_q{question_index}"},
                "$push": {"science.history": {
                    "module_id": module_id,
                    "question": question_index,
                    "timestamp": now,
                }},
            },
            upsert=True,
        )

        await db.users.update_one(
            {"id": uid},
            {"$inc": {"consciousness.xp": resonance}},
        )

    return {
        "correct": correct,
        "resonance_earned": resonance if correct else 0,
        "hint": q["hint"] if not correct else None,
        "message": "Correct!" if correct else f"Incorrect. Hint: {q['hint']}",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HISTORY ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/history-modules")
async def get_history_modules(user=Depends(get_current_user)):
    """Get all history modules."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("history", {}).get("completed_challenges", [])

    modules = []
    for h in HISTORY_MODULES:
        modules.append({
            "id": h["id"],
            "name": h["name"],
            "era": h["era"],
            "civilizations": h["civilizations"],
            "description": h["description"],
            "question_count": len(h["questions"]),
            "resonance": h["resonance"],
            "completed": h["id"] in completed,
        })
    return {"modules": modules, "total": len(modules), "completed": len([m for m in modules if m["completed"]])}


@router.get("/history/{module_id}/question/{question_index}")
async def get_history_question(module_id: str, question_index: int, user=Depends(get_current_user)):
    """Get a specific history question."""
    module = None
    for h in HISTORY_MODULES:
        if h["id"] == module_id:
            module = h
            break
    if not module:
        raise HTTPException(404, "Module not found")
    if question_index < 0 or question_index >= len(module["questions"]):
        raise HTTPException(400, "Invalid question index")
    q = module["questions"][question_index]
    return {"question": q["q"], "hint": q["hint"], "index": question_index, "total": len(module["questions"])}


@router.post("/history/answer")
async def answer_history(
    module_id: str = Body(...),
    question_index: int = Body(...),
    answer: str = Body(...),
    user=Depends(get_current_user),
):
    """Answer a history module question."""
    uid = user["id"]
    module = None
    for h in HISTORY_MODULES:
        if h["id"] == module_id:
            module = h
            break
    if not module:
        raise HTTPException(404, "Module not found")

    if question_index < 0 or question_index >= len(module["questions"]):
        raise HTTPException(400, "Invalid question index")

    q = module["questions"][question_index]
    correct = answer.strip().lower() == q["a"].strip().lower()

    if correct:
        now = datetime.now(timezone.utc).isoformat()
        resonance = module["resonance"] // len(module["questions"])

        await db.avenue_progress.update_one(
            {"user_id": uid},
            {
                "$set": {"user_id": uid},
                "$inc": {"history.resonance": resonance},
                "$addToSet": {"history.completed_challenges": f"{module_id}_q{question_index}"},
                "$push": {"history.history": {
                    "module_id": module_id,
                    "question": question_index,
                    "timestamp": now,
                }},
            },
            upsert=True,
        )

        await db.users.update_one(
            {"id": uid},
            {"$inc": {"consciousness.xp": resonance}},
        )

    return {
        "correct": correct,
        "resonance_earned": resonance if correct else 0,
        "hint": q["hint"] if not correct else None,
        "message": "Correct!" if correct else f"Incorrect. Hint: {q['hint']}",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  E-BIKE ENGINEERING SIMULATOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EBIKE_SIMS = [
    {
        "id": "torque_range",
        "name": "Dual-Motor Torque vs Range",
        "description": "Toggle power between front and rear hub motors to optimize traction and battery efficiency.",
        "variables": [
            {"id": "front_power", "name": "Front Motor (%)", "min": 0, "max": 100, "optimal": 40, "unit": "%"},
            {"id": "rear_power", "name": "Rear Motor (%)", "min": 0, "max": 100, "optimal": 60, "unit": "%"},
            {"id": "terrain", "name": "Terrain (1=road, 5=snow)", "min": 1, "max": 5, "optimal": 3, "unit": ""},
            {"id": "rider_watts", "name": "Rider Contribution (W)", "min": 0, "max": 400, "optimal": 150, "unit": "W"},
        ],
        "science_note": "AWD distributes torque across both wheels. On snow/sand, 50/50 split prevents wheel spin. On pavement, rear-biased (30/70) is more efficient.",
        "resonance": 20,
    },
    {
        "id": "battery_physics",
        "name": "Battery & Wattage Physics",
        "description": "Calculate range based on motor wattage, battery capacity, and terrain resistance.",
        "variables": [
            {"id": "battery_wh", "name": "Battery (Wh)", "min": 500, "max": 3000, "optimal": 1500, "unit": "Wh"},
            {"id": "motor_watts", "name": "Combined Motors (W)", "min": 500, "max": 4000, "optimal": 2000, "unit": "W"},
            {"id": "speed_mph", "name": "Target Speed (mph)", "min": 10, "max": 35, "optimal": 20, "unit": "mph"},
        ],
        "science_note": "Range ≈ Battery(Wh) / Average-Draw(W) × Speed. Aerodynamic drag increases with v². Fat tires add rolling resistance but improve traction.",
        "resonance": 18,
    },
]


@router.post("/ebike/simulate")
async def run_ebike_simulation(
    simulation_id: str = Body(...),
    variables: dict = Body(...),
    user=Depends(get_current_user),
):
    """Run an e-bike engineering simulation."""
    uid = user["id"]
    sim = None
    for s in EBIKE_SIMS:
        if s["id"] == simulation_id:
            sim = s
            break
    if not sim:
        raise HTTPException(404, "Simulation not found")

    scores = []
    feedback = []
    for var in sim["variables"]:
        user_val = float(variables.get(var["id"], 0))
        optimal = var["optimal"]
        var_range = var["max"] - var["min"]
        distance = abs(user_val - optimal) / max(var_range, 1)
        score = max(0, round((1 - distance * 2) * 100))
        scores.append(score)

        if score >= 80:
            feedback.append(f"{var['name']}: Optimal ({user_val} {var['unit']})")
        else:
            feedback.append(f"{var['name']}: Adjust toward {optimal} {var['unit']}")

    avg_score = round(sum(scores) / len(scores))
    mastered = avg_score >= 70
    resonance = sim["resonance"] if mastered else 0

    if mastered:
        now = datetime.now(timezone.utc).isoformat()
        await db.avenue_progress.update_one(
            {"user_id": uid},
            {
                "$set": {"user_id": uid},
                "$inc": {"science.resonance": resonance},
                "$addToSet": {"science.completed_challenges": simulation_id},
            },
            upsert=True,
        )
        await db.users.update_one({"id": uid}, {"$inc": {"consciousness.xp": resonance}})

    # Calculate simulated range
    battery = float(variables.get("battery_wh", 1500))
    motors = float(variables.get("motor_watts", 2000))
    speed = float(variables.get("speed_mph", 20))
    rider = float(variables.get("rider_watts", 0))
    estimated_range = round(battery / max(motors * 0.6 - rider * 0.3, 100) * speed, 1)

    return {
        "score": avg_score,
        "mastered": mastered,
        "resonance_earned": resonance,
        "feedback": feedback,
        "science_note": sim["science_note"],
        "calculated": {"estimated_range_miles": estimated_range},
        "message": f"Engineering Score: {avg_score}%",
    }


@router.get("/ebike/sims")
async def get_ebike_simulations(user=Depends(get_current_user)):
    """Get e-bike engineering simulations."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    completed = (prog or {}).get("science", {}).get("completed_challenges", [])
    return {
        "simulations": [{**s, "completed": s["id"] in completed} for s in EBIKE_SIMS],
        "total": len(EBIKE_SIMS),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HEART RATE SYNC CHALLENGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPTH_FREQUENCIES = {
    "crust": {"hz": 432, "target_bpm": 72, "label": "Earth Rhythm"},
    "mantle": {"hz": 396, "target_bpm": 66, "label": "Deep Pulse"},
    "outer_core": {"hz": 285, "target_bpm": 57, "label": "Quantum Rhythm"},
    "hollow_earth": {"hz": 174, "target_bpm": 48, "label": "Core Stillness"},
}


@router.post("/heart-sync")
async def heart_rate_sync_challenge(
    heart_rate: int = Body(...),
    current_depth: str = Body("crust"),
    user=Depends(get_current_user),
):
    """
    Heart Rate Sync Challenge — match BPM to planetary Hz.
    The target BPM is derived from the layer's frequency.
    """
    uid = user["id"]
    depth_info = DEPTH_FREQUENCIES.get(current_depth, DEPTH_FREQUENCIES["crust"])
    target = depth_info["target_bpm"]

    # Score: how close is heart_rate to target
    diff = abs(heart_rate - target)
    if diff <= 3:
        sync_level = "perfect"
        resonance = 25
        dust = 15
    elif diff <= 8:
        sync_level = "good"
        resonance = 15
        dust = 8
    elif diff <= 15:
        sync_level = "partial"
        resonance = 8
        dust = 3
    else:
        sync_level = "misaligned"
        resonance = 0
        dust = 0

    now = datetime.now(timezone.utc).isoformat()

    if resonance > 0:
        await db.avenue_progress.update_one(
            {"user_id": uid},
            {
                "$set": {"user_id": uid},
                "$inc": {"biometrics.resonance": resonance},
                "$push": {"biometrics.activity_log": {
                    "id": str(uuid.uuid4())[:8],
                    "activity_id": "heart_sync",
                    "activity_name": "Heart Rate Sync",
                    "value": heart_rate,
                    "unit": "bpm",
                    "kinetic_dust": dust,
                    "timestamp": now,
                    "sync_level": sync_level,
                }},
            },
            upsert=True,
        )
        await db.users.update_one(
            {"id": uid},
            {
                "$inc": {"user_dust_balance": dust, "consciousness.xp": resonance},
                "$push": {"consciousness.activity_log": {
                    "type": "heart_sync", "xp": resonance,
                    "depth": current_depth, "timestamp": now,
                }},
            },
        )

    return {
        "sync_level": sync_level,
        "your_bpm": heart_rate,
        "target_bpm": target,
        "depth": current_depth,
        "depth_hz": depth_info["hz"],
        "depth_label": depth_info["label"],
        "difference": diff,
        "resonance_earned": resonance,
        "dust_earned": dust,
        "message": f"Sync: {sync_level.upper()}. Your {heart_rate} BPM vs target {target} BPM ({depth_info['label']})",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CIRCULAR ECONOMY — Spend Kinetic Dust & Resonance
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHOP_ITEMS = [
    {
        "id": "carbon_fork",
        "name": "Carbon Fiber Fork Upgrade",
        "category": "ebike_parts",
        "description": "Lightweight carbon fork reduces unsprung weight by 40%. Improves handling on technical terrain.",
        "cost_dust": 50,
        "cost_resonance": 0,
        "currency": "kinetic_dust",
        "rarity": "rare",
        "icon": "wrench",
    },
    {
        "id": "fat_tire_set",
        "name": "26x4.8 Fat Tire Set",
        "category": "ebike_parts",
        "description": "Maximum flotation for snow and sand. Kenda Juggernaut compound with reflective sidewalls.",
        "cost_dust": 35,
        "cost_resonance": 0,
        "currency": "kinetic_dust",
        "rarity": "uncommon",
        "icon": "circle",
    },
    {
        "id": "torque_sensor",
        "name": "Dual-Motor Torque Sensor",
        "category": "ebike_parts",
        "description": "Cadence + torque hybrid sensor for seamless AWD power distribution.",
        "cost_dust": 80,
        "cost_resonance": 0,
        "currency": "kinetic_dust",
        "rarity": "legendary",
        "icon": "gauge",
    },
    {
        "id": "yoga_mat",
        "name": "Resonance Yoga Mat",
        "category": "yoga_equipment",
        "description": "Cork and natural rubber mat tuned to 432Hz ground frequency. Anti-slip sacred geometry pattern.",
        "cost_dust": 25,
        "cost_resonance": 0,
        "currency": "kinetic_dust",
        "rarity": "common",
        "icon": "flower",
    },
    {
        "id": "meditation_cushion",
        "name": "Zafu Meditation Cushion",
        "category": "yoga_equipment",
        "description": "Buckwheat hull filling, organic cotton cover. Elevates hips 15cm for optimal spinal alignment.",
        "cost_dust": 20,
        "cost_resonance": 0,
        "currency": "kinetic_dust",
        "rarity": "common",
        "icon": "cloud",
    },
    {
        "id": "alchemist_skin",
        "name": "The Alchemist UI Skin",
        "category": "ui_skin",
        "description": "Amber and emerald interface theme. Animated transmutation particles on all interactions.",
        "cost_dust": 0,
        "cost_resonance": 40,
        "currency": "science_resonance",
        "rarity": "rare",
        "icon": "flask",
    },
    {
        "id": "chronicler_skin",
        "name": "The Chronicler UI Skin",
        "category": "ui_skin",
        "description": "Parchment and ink theme with ancient star chart overlays. Timeline-styled navigation.",
        "cost_dust": 0,
        "cost_resonance": 40,
        "currency": "science_resonance",
        "rarity": "rare",
        "icon": "scroll",
    },
    {
        "id": "sentinel_skin",
        "name": "The Sentinel UI Skin",
        "category": "ui_skin",
        "description": "Biometric-green HUD with real-time heart rate graph watermark. Pulse animations on every tap.",
        "cost_dust": 0,
        "cost_resonance": 50,
        "currency": "science_resonance",
        "rarity": "legendary",
        "icon": "heart_pulse",
    },
]

SHOP_MAP = {item["id"]: item for item in SHOP_ITEMS}


@router.get("/economy/shop")
async def get_shop_items(user=Depends(get_current_user)):
    """Get all Circular Economy shop items with user balances."""
    uid = user["id"]
    user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "user_dust_balance": 1})
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    sci_res = (prog or {}).get("science", {}).get("resonance", 0)
    dust_balance = (user_doc or {}).get("user_dust_balance", 0)

    purchases = await db.economy_purchases.find({"user_id": uid}, {"_id": 0}).to_list(200)
    owned_ids = {p["item_id"] for p in purchases}

    items = []
    for item in SHOP_ITEMS:
        items.append({
            **item,
            "owned": item["id"] in owned_ids,
        })

    return {
        "items": items,
        "balances": {
            "kinetic_dust": round(dust_balance, 1),
            "science_resonance": sci_res,
        },
        "total_items": len(items),
        "owned_count": len(owned_ids),
    }


@router.post("/economy/purchase")
async def purchase_item(
    item_id: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """Purchase a shop item using Kinetic Dust or Science Resonance."""
    uid = user["id"]
    item = SHOP_MAP.get(item_id)
    if not item:
        raise HTTPException(404, "Item not found")

    # Check if already owned
    existing = await db.economy_purchases.find_one({"user_id": uid, "item_id": item_id}, {"_id": 0})
    if existing:
        raise HTTPException(400, "Already owned")

    # Check balance
    if item["currency"] == "kinetic_dust":
        user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "user_dust_balance": 1})
        balance = (user_doc or {}).get("user_dust_balance", 0)
        if balance < item["cost_dust"]:
            raise HTTPException(400, f"Insufficient Kinetic Dust. Need {item['cost_dust']}, have {round(balance, 1)}")

        await db.users.update_one(
            {"id": uid},
            {"$inc": {"user_dust_balance": -item["cost_dust"]}},
        )
        spent = item["cost_dust"]
        currency_label = "Kinetic Dust"
    else:
        prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
        sci_res = (prog or {}).get("science", {}).get("resonance", 0)
        if sci_res < item["cost_resonance"]:
            raise HTTPException(400, f"Insufficient Science Resonance. Need {item['cost_resonance']}, have {sci_res}")

        await db.avenue_progress.update_one(
            {"user_id": uid},
            {"$inc": {"science.resonance": -item["cost_resonance"]}},
        )
        spent = item["cost_resonance"]
        currency_label = "Science Resonance"

    now = datetime.now(timezone.utc).isoformat()
    await db.economy_purchases.insert_one({
        "user_id": uid,
        "item_id": item_id,
        "item_name": item["name"],
        "category": item["category"],
        "currency": item["currency"],
        "amount_spent": spent,
        "purchased_at": now,
    })

    return {
        "success": True,
        "item": item["name"],
        "category": item["category"],
        "spent": spent,
        "currency": currency_label,
        "message": f"Acquired: {item['name']}. -{spent} {currency_label}.",
    }

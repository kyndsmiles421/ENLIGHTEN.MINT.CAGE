"""
V68.3 Phase B — QUEST BRIDGE ENGINE
Cross-domain quests forcing users between workshops and VR zones.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user

router = APIRouter()

QUESTS = [
    {
        "id": "resonant_frequency",
        "name": "The Resonant Frequency",
        "desc": "The Tesseract is silent. To wake it, bring the vibration of Quartz from the Earth.",
        "hint": "Explore the Geology Workshop. Find the crystal that vibrates at 32,768 Hz.",
        "domain_bridge": ["Science & Physics", "Trade & Craft"],
        "steps": [
            {"id": "find_quartz", "action": "Visit Geology Workshop and identify Quartz in Minerals", "target": "/workshop/geology"},
            {"id": "learn_xrd", "action": "Dive to Depth 4 on Minerals — X-Ray Diffraction", "target": "/workshop/geology"},
            {"id": "wake_tesseract", "action": "Return to the Tesseract and apply the vibration", "target": "/tesseract"},
        ],
        "reward_sparks": 1000,
        "reward_card": "tesseract_key",
        "color": "#8B5CF6",
    },
    {
        "id": "fire_triangle",
        "name": "The Fire Triangle",
        "desc": "A wildfire threatens the Dream Realm forest. Only the one who understands fire can save it.",
        "hint": "Heat, fuel, oxygen. The answer is in the Forestry Workshop.",
        "domain_bridge": ["Trade & Craft", "Mind & Spirit"],
        "steps": [
            {"id": "study_fire", "action": "Study Wildfire Science in Forestry Workshop", "target": "/workshop/forestry"},
            {"id": "learn_pyrolysis", "action": "Dive to Depth 3 — Pyrolysis", "target": "/workshop/forestry"},
            {"id": "save_realm", "action": "Return to Dream Realms and extinguish the fire", "target": "/dream-realms"},
        ],
        "reward_sparks": 750,
        "reward_card": None,
        "color": "#EF4444",
    },
    {
        "id": "harmonic_convergence",
        "name": "The Harmonic Convergence",
        "desc": "The Observatory detected a frequency anomaly. Music Theory holds the key.",
        "hint": "The stars sing in fifths. Find the Harmonic Series in Music Theory.",
        "domain_bridge": ["Creative Arts", "Science & Physics"],
        "steps": [
            {"id": "find_harmonics", "action": "Study Scales & Modes in Music Theory", "target": "/workshop/music"},
            {"id": "learn_series", "action": "Dive to Depth 5 — the Harmonic Series", "target": "/workshop/music"},
            {"id": "decode_signal", "action": "Return to Observatory and decode the frequency", "target": "/observatory"},
        ],
        "reward_sparks": 800,
        "reward_card": None,
        "color": "#D4AF37",
    },
]


@router.get("/quests/available")
async def get_available_quests(user=Depends(get_current_user)):
    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    result = []
    for q in QUESTS:
        qp = progress.get("quests", {}).get(q["id"], {})
        done_steps = qp.get("completed_steps", [])
        steps = [{**s, "done": s["id"] in done_steps} for s in q["steps"]]
        result.append({
            "id": q["id"], "name": q["name"], "desc": q["desc"], "hint": q["hint"],
            "color": q["color"], "domain_bridge": q["domain_bridge"],
            "reward_sparks": q["reward_sparks"], "steps": steps,
            "completed": qp.get("completed", False),
            "progress": len(done_steps) / len(q["steps"]) if q["steps"] else 0,
        })
    return {"quests": result}


@router.post("/quests/advance")
async def advance_quest(data: dict = Body(...), user=Depends(get_current_user)):
    quest_id = data.get("quest_id")
    step_id = data.get("step_id")
    quest = next((q for q in QUESTS if q["id"] == quest_id), None)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    step = next((s for s in quest["steps"] if s["id"] == step_id), None)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    if not progress:
        progress = {"user_id": user["id"], "quests": {}}
        await db.quest_progress.insert_one({**progress})

    qp = progress.get("quests", {}).get(quest_id, {"completed_steps": [], "completed": False})
    if step_id in qp.get("completed_steps", []):
        return {"status": "already_completed", "step_id": step_id}

    await db.quest_progress.update_one(
        {"user_id": user["id"]},
        {"$push": {f"quests.{quest_id}.completed_steps": step_id}},
        upsert=True
    )
    done = qp.get("completed_steps", []) + [step_id]
    all_done = len(done) >= len(quest["steps"])
    result = {"status": "step_completed", "step_id": step_id, "quest_complete": all_done, "reward_sparks": 0}

    if all_done and not qp.get("completed", False):
        await db.quest_progress.update_one(
            {"user_id": user["id"]},
            {"$set": {f"quests.{quest_id}.completed": True, f"quests.{quest_id}.completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        sparks = quest["reward_sparks"]
        await db.spark_wallets.update_one({"user_id": user["id"]}, {"$inc": {"sparks": sparks, "total_earned": sparks}}, upsert=True)
        result["reward_sparks"] = sparks
        if quest.get("reward_card"):
            await db.spark_wallets.update_one(
                {"user_id": user["id"]},
                {"$push": {"cards_earned": {"card_id": quest["reward_card"], "earned_at": datetime.now(timezone.utc).isoformat()}}}
            )
            result["reward_card"] = quest["reward_card"]
    return result

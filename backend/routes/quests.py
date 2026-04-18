"""
V68.4 Phase D — QUEST BRIDGE ENGINE (with Sovereign Universe Auto-Detect)
Cross-domain quests forcing users between workshops and VR zones.

Auto-detect: any module can POST a "signal" (e.g. "geology:material:quartz"),
this engine checks every quest step whose `auto_signal` matches and advances it.
"""
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
            {"id": "find_quartz", "action": "Visit Geology Workshop and identify Minerals", "target": "/workshop/geology", "auto_signal": "geology:material:minerals"},
            {"id": "learn_xrd", "action": "Dive to Depth 4 on Minerals — X-Ray Diffraction", "target": "/workshop/geology", "auto_signal": "geology:dive:minerals:4"},
            {"id": "wake_tesseract", "action": "Return to the Tesseract and apply the vibration", "target": "/tesseract", "auto_signal": "tesseract:activate"},
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
            {"id": "study_fire", "action": "Study Wildfire Science in Forestry Workshop", "target": "/workshop/forestry", "auto_signal": "forestry:material:wildfire"},
            {"id": "learn_pyrolysis", "action": "Dive to Depth 3 — Pyrolysis", "target": "/workshop/forestry", "auto_signal": "forestry:dive:wildfire:3"},
            {"id": "save_realm", "action": "Return to Dream Realms and extinguish the fire", "target": "/dream-realms", "auto_signal": "dream_realms:fire_extinguish"},
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
            {"id": "find_harmonics", "action": "Study Scales & Modes in Music Theory", "target": "/workshop/music", "auto_signal": "music:material:scales"},
            {"id": "learn_series", "action": "Dive to Depth 5 — the Harmonic Series", "target": "/workshop/music", "auto_signal": "music:dive:scales:5"},
            {"id": "decode_signal", "action": "Return to Observatory — decode the frequency (or meditate 60s in stillness)", "target": "/observatory", "auto_signal": ["observatory:decode", "scene:immersion:observatory"]},
        ],
        "reward_sparks": 800,
        "reward_card": None,
        "color": "#D4AF37",
    },
]


def _serialize_quest(q: dict, progress: dict) -> dict:
    qp = progress.get("quests", {}).get(q["id"], {})
    done_steps = qp.get("completed_steps", [])
    steps = [{"id": s["id"], "action": s["action"], "target": s.get("target"), "done": s["id"] in done_steps} for s in q["steps"]]
    return {
        "id": q["id"], "name": q["name"], "desc": q["desc"], "hint": q["hint"],
        "color": q["color"], "domain_bridge": q["domain_bridge"],
        "reward_sparks": q["reward_sparks"], "steps": steps,
        "completed": qp.get("completed", False),
        "progress": (len(done_steps) / len(q["steps"])) if q["steps"] else 0,
    }


@router.get("/quests/available")
async def get_available_quests(user=Depends(get_current_user)):
    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    return {"quests": [_serialize_quest(q, progress) for q in QUESTS]}


async def _advance_step(user_id: str, quest: dict, step: dict, progress_doc: dict) -> dict:
    """Idempotent step advancement with reward processing. Returns result dict."""
    qp = progress_doc.get("quests", {}).get(quest["id"], {"completed_steps": [], "completed": False})
    if step["id"] in qp.get("completed_steps", []):
        return {"status": "already_completed"}

    # Ensure parent doc exists
    if not progress_doc:
        await db.quest_progress.insert_one({"user_id": user_id, "quests": {}})

    await db.quest_progress.update_one(
        {"user_id": user_id},
        {"$push": {f"quests.{quest['id']}.completed_steps": step["id"]}},
        upsert=True,
    )
    done = qp.get("completed_steps", []) + [step["id"]]
    all_done = len(done) >= len(quest["steps"])

    result = {
        "status": "advanced",
        "quest_id": quest["id"],
        "quest_name": quest["name"],
        "step_id": step["id"],
        "step_action": step["action"],
        "color": quest["color"],
        "quest_complete": all_done,
        "reward_sparks": 0,
        "reward_card": None,
    }

    if all_done and not qp.get("completed", False):
        now = datetime.now(timezone.utc).isoformat()
        await db.quest_progress.update_one(
            {"user_id": user_id},
            {"$set": {f"quests.{quest['id']}.completed": True, f"quests.{quest['id']}.completed_at": now}},
        )
        sparks = quest["reward_sparks"]
        await db.spark_wallets.update_one(
            {"user_id": user_id},
            {"$inc": {"sparks": sparks, "total_earned": sparks}},
            upsert=True,
        )
        result["reward_sparks"] = sparks
        if quest.get("reward_card"):
            await db.spark_wallets.update_one(
                {"user_id": user_id},
                {"$push": {"cards_earned": {"card_id": quest["reward_card"], "earned_at": now}}},
            )
            result["reward_card"] = quest["reward_card"]
    return result


@router.post("/quests/advance")
async def advance_quest(data: dict = Body(...), user=Depends(get_current_user)):
    """Manual advancement (legacy). Use /quests/auto_detect for signal-driven flow."""
    quest_id = data.get("quest_id")
    step_id = data.get("step_id")
    quest = next((q for q in QUESTS if q["id"] == quest_id), None)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    step = next((s for s in quest["steps"] if s["id"] == step_id), None)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    result = await _advance_step(user["id"], quest, step, progress)
    if result["status"] == "already_completed":
        return {"status": "already_completed", "step_id": step_id}
    return {
        "status": "step_completed",
        "step_id": step_id,
        "quest_complete": result["quest_complete"],
        "reward_sparks": result["reward_sparks"],
        **({"reward_card": result["reward_card"]} if result.get("reward_card") else {}),
    }


@router.post("/quests/auto_detect")
async def auto_detect(data: dict = Body(...), user=Depends(get_current_user)):
    """
    The Sovereign Universe kernel fires signals from every workshop/zone.
    We match each signal against all quest steps' `auto_signal` and advance
    matching steps automatically — all in one idempotent round-trip.
    """
    signal = str(data.get("signal", "")).strip().lower()
    if not signal:
        raise HTTPException(status_code=400, detail="signal required")

    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    advanced = []
    for q in QUESTS:
        for s in q["steps"]:
            # V68.8 — auto_signal can be a single string OR a list of strings
            raw = s.get("auto_signal", "")
            signal_set = [raw] if isinstance(raw, str) else list(raw or [])
            if signal not in (x.lower() for x in signal_set if x):
                continue
            # Enforce ordered completion: only advance if prior steps are done
            idx = q["steps"].index(s)
            qp = progress.get("quests", {}).get(q["id"], {})
            done_steps = qp.get("completed_steps", [])
            prior_ok = all(q["steps"][i]["id"] in done_steps for i in range(idx))
            if not prior_ok:
                continue
            res = await _advance_step(user["id"], q, s, progress)
            if res["status"] == "advanced":
                advanced.append(res)
                # Refresh progress snapshot so chained matches don't re-trigger
                progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0}) or {}
    # Log the signal breadcrumb regardless
    try:
        await db.universe_signals.insert_one({
            "user_id": user["id"],
            "signal": signal,
            "location": str(data.get("location") or "")[:64],
            "ts": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass

    return {"signal": signal, "advanced": advanced, "count": len(advanced)}

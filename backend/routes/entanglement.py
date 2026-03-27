from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

ENTANGLEMENT_MEDITATIONS = [
    {"id": "heart-sync", "name": "Heart Synchronization", "duration": 10, "description": "Synchronize heart rhythms with your partner through focused breathing.", "chakra": "Heart", "color": "#FDA4AF"},
    {"id": "third-eye-link", "name": "Third Eye Connection", "duration": 15, "description": "Open a telepathic bridge through shared third-eye meditation.", "chakra": "Third Eye", "color": "#818CF8"},
    {"id": "root-ground", "name": "Shared Grounding", "duration": 8, "description": "Ground your combined energies into the earth together.", "chakra": "Root", "color": "#EF4444"},
    {"id": "crown-ascend", "name": "Crown Ascension", "duration": 20, "description": "Rise together through the crown chakra to higher consciousness.", "chakra": "Crown", "color": "#C084FC"},
    {"id": "aura-merge", "name": "Aura Merge", "duration": 12, "description": "Blend your auric fields for a shared energetic experience.", "chakra": "All", "color": "#2DD4BF"},
]


@router.get("/entanglement/meditations")
async def get_entanglement_meditations(user=Depends(get_current_user)):
    """Get available paired meditations."""
    return {"meditations": ENTANGLEMENT_MEDITATIONS}


@router.post("/entanglement/invite")
async def create_invite(data: dict = Body(...), user=Depends(get_current_user)):
    """Create an entanglement session invite."""
    meditation_id = data.get("meditation_id", "")
    med = next((m for m in ENTANGLEMENT_MEDITATIONS if m["id"] == meditation_id), None)
    if not med:
        raise HTTPException(status_code=400, detail="Invalid meditation")

    invite = {
        "id": str(uuid.uuid4()),
        "host_id": user["id"],
        "host_name": user.get("name", "Anonymous"),
        "meditation_id": meditation_id,
        "meditation_name": med["name"],
        "meditation_duration": med["duration"],
        "meditation_color": med["color"],
        "status": "waiting",
        "partner_id": None,
        "partner_name": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "started_at": None,
        "completed_at": None,
    }
    await db.entanglement_sessions.insert_one(invite)
    await create_activity(user["id"], "entanglement_invite", f"Created entanglement: {med['name']}")
    invite.pop("_id", None)
    return invite


@router.get("/entanglement/open-sessions")
async def get_open_sessions(user=Depends(get_current_user)):
    """Get all open entanglement invites (not yours)."""
    sessions = await db.entanglement_sessions.find(
        {"status": "waiting", "host_id": {"$ne": user["id"]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    return {"sessions": sessions}


@router.post("/entanglement/join/{session_id}")
async def join_session(session_id: str, user=Depends(get_current_user)):
    """Join an open entanglement session."""
    session = await db.entanglement_sessions.find_one({"id": session_id, "status": "waiting"}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or already started")
    if session["host_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot join your own session")

    await db.entanglement_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "partner_id": user["id"],
            "partner_name": user.get("name", "Anonymous"),
            "status": "active",
            "started_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    await create_activity(user["id"], "entanglement_join", f"Joined entanglement: {session['meditation_name']}")
    return {"status": "joined", "session_id": session_id, "meditation": session["meditation_name"]}


@router.post("/entanglement/complete/{session_id}")
async def complete_session(session_id: str, data: dict = Body(...), user=Depends(get_current_user)):
    """Mark an entanglement session as complete."""
    session = await db.entanglement_sessions.find_one({"id": session_id, "status": "active"}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
    if user["id"] not in [session["host_id"], session.get("partner_id")]:
        raise HTTPException(status_code=403, detail="Not a participant")

    experience_note = data.get("note", "")
    rating = data.get("rating", 5)

    await db.entanglement_sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Log experience for both users
    log = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "user_id": user["id"],
        "partner_id": session["host_id"] if user["id"] == session.get("partner_id") else session.get("partner_id"),
        "meditation_id": session["meditation_id"],
        "meditation_name": session["meditation_name"],
        "note": experience_note[:300],
        "rating": min(max(int(rating), 1), 5),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.entanglement_logs.insert_one(log)
    log.pop("_id", None)

    await create_activity(user["id"], "entanglement_complete", f"Completed entanglement: {session['meditation_name']}")
    return {"status": "completed", "log": log}


@router.get("/entanglement/my-sessions")
async def get_my_sessions(user=Depends(get_current_user)):
    """Get user's entanglement history."""
    sessions = await db.entanglement_sessions.find(
        {"$or": [{"host_id": user["id"]}, {"partner_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)

    stats = {
        "total": len(sessions),
        "completed": len([s for s in sessions if s["status"] == "completed"]),
        "waiting": len([s for s in sessions if s["status"] == "waiting"]),
        "active": len([s for s in sessions if s["status"] == "active"]),
    }
    return {"sessions": sessions, "stats": stats}

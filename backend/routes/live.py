from fastapi import APIRouter, Depends, HTTPException, Body, WebSocket, WebSocketDisconnect
from datetime import datetime, timezone, timedelta
from deps import db, get_current_user
import uuid
import json
import asyncio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

CREATOR_EMAIL = "kyndsmiles@gmail.com"

# ─── In-memory WebSocket connections ───
# { session_id: { user_id: { "ws": WebSocket, "user": dict, "avatar": str } } }
active_connections: dict = {}
# { session_id: [ { message } ] }
session_chat_history: dict = {}

SESSION_TYPES = [
    {"id": "meditation", "label": "Group Meditation", "icon": "timer", "color": "#D8B4FE",
     "description": "Guided group meditation with synchronized breathing"},
    {"id": "yoga", "label": "Yoga Flow", "icon": "flame", "color": "#FB923C",
     "description": "Follow along with gentle yoga sequences"},
    {"id": "breathwork", "label": "Breathwork Circle", "icon": "wind", "color": "#2DD4BF",
     "description": "Synchronized group breathing exercises"},
    {"id": "sound-bath", "label": "Sound Bath", "icon": "music", "color": "#3B82F6",
     "description": "Immersive sound healing with crystal bowls"},
    {"id": "mantra", "label": "Mantra Chanting", "icon": "book-open", "color": "#FCD34D",
     "description": "Group mantra recitation and chanting"},
    {"id": "prayer", "label": "Prayer Circle", "icon": "heart", "color": "#FDA4AF",
     "description": "Interfaith prayer and spiritual communion"},
    {"id": "qigong", "label": "Qigong Practice", "icon": "zap", "color": "#22C55E",
     "description": "Gentle energy cultivation movements"},
    {"id": "open", "label": "Open Circle", "icon": "users", "color": "#C084FC",
     "description": "Free-form spiritual gathering and sharing"},
]

VIRTUAL_SCENES = [
    {"id": "cosmic-temple", "label": "Cosmic Temple", "gradient": "from-indigo-950 via-purple-950 to-slate-950",
     "bg": "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.15), rgba(13,14,26,0.95))",
     "particles": "stars"},
    {"id": "zen-garden", "label": "Zen Garden", "gradient": "from-emerald-950 via-teal-950 to-slate-950",
     "bg": "radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.12), rgba(13,14,26,0.95))",
     "particles": "petals"},
    {"id": "ocean-shore", "label": "Ocean Shore", "gradient": "from-cyan-950 via-blue-950 to-slate-950",
     "bg": "radial-gradient(ellipse at 50% 70%, rgba(6,182,212,0.12), rgba(13,14,26,0.95))",
     "particles": "waves"},
    {"id": "mountain-peak", "label": "Mountain Peak", "gradient": "from-amber-950 via-orange-950 to-slate-950",
     "bg": "radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.1), rgba(13,14,26,0.95))",
     "particles": "mist"},
    {"id": "sacred-fire", "label": "Sacred Fire", "gradient": "from-red-950 via-orange-950 to-slate-950",
     "bg": "radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.1), rgba(13,14,26,0.95))",
     "particles": "embers"},
    {"id": "aurora", "label": "Northern Lights", "gradient": "from-teal-950 via-cyan-950 to-indigo-950",
     "bg": "radial-gradient(ellipse at 50% 20%, rgba(45,212,191,0.12), rgba(13,14,26,0.95))",
     "particles": "aurora"},
]


@router.get("/live/session-types")
async def get_session_types():
    return {"types": SESSION_TYPES, "scenes": VIRTUAL_SCENES}


@router.get("/live/sessions")
async def list_sessions(user=Depends(get_current_user)):
    """List upcoming and active live sessions."""
    now = datetime.now(timezone.utc).isoformat()
    sessions = await db.live_sessions.find(
        {"$or": [
            {"status": "active"},
            {"status": "scheduled", "scheduled_at": {"$gte": now}},
            {"status": "scheduled", "scheduled_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()}},
        ]},
        {"_id": 0}
    ).sort("scheduled_at", 1).to_list(50)

    # Attach live participant count
    for s in sessions:
        s["participant_count"] = len(active_connections.get(s["id"], {}))

    return {"sessions": sessions}


@router.post("/live/sessions")
async def create_session(data: dict = Body(...), user=Depends(get_current_user)):
    """Create a new live session."""
    session = {
        "id": str(uuid.uuid4()),
        "host_id": user["id"],
        "host_name": user.get("name", "Anonymous"),
        "title": data.get("title", "Live Session"),
        "description": data.get("description", ""),
        "session_type": data.get("session_type", "meditation"),
        "scene": data.get("scene", "cosmic-temple"),
        "max_participants": data.get("max_participants", 50),
        "duration_minutes": data.get("duration_minutes", 30),
        "scheduled_at": data.get("scheduled_at", datetime.now(timezone.utc).isoformat()),
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.live_sessions.insert_one({**session})
    session.pop("_id", None)
    return session


@router.get("/live/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    """Get session details."""
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["participant_count"] = len(active_connections.get(session_id, {}))
    session["participants"] = []
    for uid, data in active_connections.get(session_id, {}).items():
        session["participants"].append({
            "user_id": uid,
            "name": data["user"].get("name", "Seeker"),
            "avatar": data.get("avatar"),
        })
    return session


@router.post("/live/sessions/{session_id}/start")
async def start_session(session_id: str, user=Depends(get_current_user)):
    """Start a scheduled session (host only)."""
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["host_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the host can start the session")
    await db.live_sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "active", "started_at": datetime.now(timezone.utc).isoformat()}}
    )
    await broadcast_to_session(session_id, {
        "type": "session_started",
        "message": "The session has begun. Take a deep breath...",
    })
    return {"status": "started"}


@router.post("/live/sessions/{session_id}/end")
async def end_session(session_id: str, user=Depends(get_current_user)):
    """End a live session (host only)."""
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["host_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the host can end the session")
    await db.live_sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "ended", "ended_at": datetime.now(timezone.utc).isoformat()}}
    )
    await broadcast_to_session(session_id, {
        "type": "session_ended",
        "message": "The session has ended. Namaste.",
    })
    # Clean up connections
    active_connections.pop(session_id, None)
    session_chat_history.pop(session_id, None)
    return {"status": "ended"}


# ─── WebSocket ───

async def broadcast_to_session(session_id: str, message: dict):
    """Send a message to all connected users in a session."""
    connections = active_connections.get(session_id, {})
    dead = []
    for uid, data in connections.items():
        try:
            await data["ws"].send_json(message)
        except Exception:
            dead.append(uid)
    for uid in dead:
        connections.pop(uid, None)


@router.websocket("/live/ws/{session_id}")
async def live_session_ws(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time live session communication."""
    await websocket.accept()

    user_id = None
    user_name = "Anonymous"
    user_avatar = None

    try:
        # First message should be auth
        auth_msg = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        token = auth_msg.get("token", "")

        # Verify token
        from deps import decode_token
        payload = decode_token(token)
        if not payload:
            await websocket.send_json({"type": "error", "message": "Invalid token"})
            await websocket.close()
            return

        user_id = payload.get("id") or payload.get("sub")
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user_doc:
            await websocket.send_json({"type": "error", "message": "User not found"})
            await websocket.close()
            return

        user_name = user_doc.get("name", "Seeker")

        # Get avatar
        avatar_doc = await db.avatars.find_one({"user_id": user_id}, {"_id": 0})
        user_avatar = avatar_doc.get("image_b64", "") if avatar_doc else ""

        # Register connection
        if session_id not in active_connections:
            active_connections[session_id] = {}
        if session_id not in session_chat_history:
            session_chat_history[session_id] = []

        active_connections[session_id][user_id] = {
            "ws": websocket,
            "user": user_doc,
            "avatar": user_avatar[:200] if user_avatar else "",  # Truncated for broadcast
        }

        # Build participants list
        participants = []
        for uid, data in active_connections[session_id].items():
            participants.append({
                "user_id": uid,
                "name": data["user"].get("name", "Seeker"),
                "avatar": data.get("avatar", ""),
            })

        # Send welcome + recent chat
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "participants": participants,
            "chat_history": session_chat_history[session_id][-50:],
        })

        # Broadcast join
        await broadcast_to_session(session_id, {
            "type": "user_joined",
            "user_id": user_id,
            "name": user_name,
            "avatar": user_avatar[:200] if user_avatar else "",
            "participant_count": len(active_connections[session_id]),
        })

        # Listen for messages
        while True:
            raw = await websocket.receive_json()
            msg_type = raw.get("type", "")

            if msg_type == "chat":
                chat_msg = {
                    "type": "chat",
                    "user_id": user_id,
                    "name": user_name,
                    "text": raw.get("text", "")[:500],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                session_chat_history[session_id].append(chat_msg)
                if len(session_chat_history[session_id]) > 200:
                    session_chat_history[session_id] = session_chat_history[session_id][-100:]
                await broadcast_to_session(session_id, chat_msg)

            elif msg_type == "reaction":
                await broadcast_to_session(session_id, {
                    "type": "reaction",
                    "user_id": user_id,
                    "name": user_name,
                    "emoji": raw.get("emoji", ""),
                })

            elif msg_type == "host_command":
                # Host-only commands (guided meditation phases, etc.)
                session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
                if session and session["host_id"] == user_id:
                    await broadcast_to_session(session_id, {
                        "type": "host_command",
                        "command": raw.get("command", ""),
                        "data": raw.get("data", {}),
                    })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except asyncio.TimeoutError:
        try:
            await websocket.close()
        except Exception:
            pass
    except Exception as e:
        logger.error(f"Live WS error: {e}")
    finally:
        # Clean up
        if user_id and session_id in active_connections:
            active_connections[session_id].pop(user_id, None)
            await broadcast_to_session(session_id, {
                "type": "user_left",
                "user_id": user_id,
                "name": user_name,
                "participant_count": len(active_connections.get(session_id, {})),
            })
            if not active_connections[session_id]:
                active_connections.pop(session_id, None)

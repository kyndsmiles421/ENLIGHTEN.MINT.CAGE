"""
Ghost Trail Presence System — V55.0
WebSocket-based presence tracking for the 9x9 spatial grid.
Users' translucent paths are visible after 30s stillness threshold.
Ghost trails leave "residue sparks" that persist after the user leaves.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from deps import db, logger
from datetime import datetime, timezone
import asyncio
import json

router = APIRouter()

# In-memory presence store: { room: { user_id: { position, trail, last_seen } } }
_presence = {}
# Residue sparks: { room: [ { position, color, created_at } ] }
_residue_sparks = {}

MAX_TRAIL_LENGTH = 12
SPARK_LIFETIME_S = 300  # 5 minutes
MAX_SPARKS_PER_ROOM = 30


@router.get("/ghost-trails/{room}")
async def get_ghost_trails(room: str):
    """Get current ghost trails and residue sparks for a room."""
    room_presence = _presence.get(room, {})
    now = datetime.now(timezone.utc).timestamp()

    # Clean old sparks
    sparks = _residue_sparks.get(room, [])
    sparks = [s for s in sparks if now - s.get("created_at", 0) < SPARK_LIFETIME_S]
    _residue_sparks[room] = sparks

    trails = []
    for uid, data in room_presence.items():
        # Only include trails from users seen in last 60s
        if now - data.get("last_seen", 0) < 60:
            trails.append({
                "user_id": uid[:8],  # Anonymized
                "trail": data.get("trail", [])[-MAX_TRAIL_LENGTH:],
                "color": data.get("color", "#A78BFA"),
                "realm": data.get("realm", "SURFACE"),
            })

    return {
        "trails": trails,
        "sparks": sparks[-MAX_SPARKS_PER_ROOM:],
        "active_count": len(trails),
    }


@router.post("/ghost-trails/update")
async def update_presence(data: dict):
    """Update a user's position in a room (called periodically from frontend)."""
    room = data.get("room", "default")
    user_id = data.get("user_id", "anon")
    position = data.get("position", {"x": 4, "y": 0})
    color = data.get("color", "#A78BFA")
    realm = data.get("realm", "SURFACE")

    if room not in _presence:
        _presence[room] = {}

    now = datetime.now(timezone.utc).timestamp()
    prev = _presence[room].get(user_id, {})
    prev_trail = prev.get("trail", [])

    # Append position to trail
    prev_trail.append({"x": position.get("x", 4), "y": position.get("y", 0), "t": now})
    if len(prev_trail) > MAX_TRAIL_LENGTH:
        prev_trail = prev_trail[-MAX_TRAIL_LENGTH:]

    _presence[room][user_id] = {
        "position": position,
        "trail": prev_trail,
        "color": color,
        "realm": realm,
        "last_seen": now,
    }

    return {"status": "ok", "active_in_room": len(_presence[room])}


@router.post("/ghost-trails/leave-spark")
async def leave_residue_spark(data: dict):
    """Leave a residue spark when a user departs a room."""
    room = data.get("room", "default")
    position = data.get("position", {"x": 4, "y": 0})
    color = data.get("color", "#A78BFA")

    if room not in _residue_sparks:
        _residue_sparks[room] = []

    now = datetime.now(timezone.utc).timestamp()
    _residue_sparks[room].append({
        "position": position,
        "color": color,
        "created_at": now,
    })

    # Trim old sparks
    _residue_sparks[room] = [
        s for s in _residue_sparks[room]
        if now - s["created_at"] < SPARK_LIFETIME_S
    ][-MAX_SPARKS_PER_ROOM:]

    return {"status": "ok", "sparks_in_room": len(_residue_sparks[room])}

"""
sovereign_live.py — Sovereign Circle Live Sessions
Real-time atmosphere synchronization for shared Light Therapy / meditation.
Privacy-neutral: no user identity in sync payloads.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import json

router = APIRouter(prefix="/sovereign-live", tags=["sovereign-live"])

# ── Rapid City default node ──
DEFAULT_NODE = {"id": "rapid-city", "name": "Rapid City — Black Hills", "lat": 44.0805, "lng": -103.2310}


class SessionCreate(BaseModel):
    name: Optional[str] = None
    node: Optional[str] = "rapid-city"


# ── In-memory room state ──
class SovereignCircleManager:
    def __init__(self):
        self.rooms = {}       # room_id -> { meta, atmosphere, connections }

    def create_room(self, name=None, node=None):
        room_id = f"sc_{uuid.uuid4().hex[:8]}"
        self.rooms[room_id] = {
            "id": room_id,
            "name": name or "Sovereign Circle",
            "node": node or DEFAULT_NODE["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "atmosphere": None,
            "connections": {},
            "host_id": None,
        }
        return self.rooms[room_id]

    def get_room(self, room_id):
        return self.rooms.get(room_id)

    def list_rooms(self):
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "node": r["node"],
                "peer_count": len(r["connections"]),
                "has_atmosphere": r["atmosphere"] is not None,
            }
            for r in self.rooms.values()
        ]

    async def join(self, room_id, peer_id, ws):
        room = self.rooms.get(room_id)
        if not room:
            return False
        room["connections"][peer_id] = ws
        if not room["host_id"]:
            room["host_id"] = peer_id
        # Broadcast peer count update
        await self._broadcast(room_id, {
            "type": "peer_count",
            "count": len(room["connections"]),
        })
        # Send current atmosphere to new joiner
        if room["atmosphere"]:
            await ws.send_json({"type": "atmosphere_sync", "payload": room["atmosphere"]})
        return True

    def leave(self, room_id, peer_id):
        room = self.rooms.get(room_id)
        if not room:
            return
        room["connections"].pop(peer_id, None)
        if room["host_id"] == peer_id:
            room["host_id"] = next(iter(room["connections"]), None)
        if not room["connections"]:
            self.rooms.pop(room_id, None)

    async def sync_atmosphere(self, room_id, peer_id, payload):
        room = self.rooms.get(room_id)
        if not room:
            return
        # Only host can broadcast atmosphere changes
        if room["host_id"] != peer_id:
            return
        room["atmosphere"] = payload
        await self._broadcast(room_id, {
            "type": "atmosphere_sync",
            "payload": payload,
        }, exclude=peer_id)

    async def _broadcast(self, room_id, message, exclude=None):
        room = self.rooms.get(room_id)
        if not room:
            return
        dead = []
        for pid, ws in room["connections"].items():
            if pid == exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(pid)
        for pid in dead:
            self.leave(room_id, pid)


manager = SovereignCircleManager()


@router.post("/create")
async def create_session(data: SessionCreate):
    room = manager.create_room(name=data.name, node=data.node)
    return {"room_id": room["id"], "name": room["name"], "node": room["node"]}


@router.get("/rooms")
async def list_sessions():
    return {"rooms": manager.list_rooms(), "default_node": DEFAULT_NODE}


@router.get("/rooms/{room_id}")
async def get_session(room_id: str):
    room = manager.get_room(room_id)
    if not room:
        return {"error": "Room not found"}
    return {
        "id": room["id"],
        "name": room["name"],
        "node": room["node"],
        "peer_count": len(room["connections"]),
        "has_atmosphere": room["atmosphere"] is not None,
        "atmosphere": room["atmosphere"],
    }

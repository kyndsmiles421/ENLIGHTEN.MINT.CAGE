"""
Synchronicity Events — Coven/Party System & Real-Time Visibility
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WebSocket-based real-time player tracking and party coordination.
"""
import hashlib
import asyncio
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from deps import db, get_current_user, decode_token

router = APIRouter(prefix="/sync", tags=["synchronicity"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONNECTION MANAGER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.connections: dict[str, WebSocket] = {}
        # user_id -> {lat, lng, name, avatar_color, coven_id, last_update}
        self.positions: dict[str, dict] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.connections[user_id] = ws

    def disconnect(self, user_id: str):
        self.connections.pop(user_id, None)
        self.positions.pop(user_id, None)

    def update_position(self, user_id: str, data: dict):
        self.positions[user_id] = {
            **data,
            "user_id": user_id,
            "last_update": datetime.now(timezone.utc).isoformat(),
        }

    def get_coven_members(self, coven_id: str, exclude_uid: str = None):
        """Get positions of all users in a coven."""
        members = []
        for uid, pos in self.positions.items():
            if pos.get("coven_id") == coven_id and uid != exclude_uid:
                members.append(pos)
        return members

    async def broadcast_to_coven(self, coven_id: str, message: dict, exclude_uid: str = None):
        """Send a message to all connected coven members."""
        for uid, pos in list(self.positions.items()):
            if pos.get("coven_id") == coven_id and uid != exclude_uid:
                ws = self.connections.get(uid)
                if ws:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        self.disconnect(uid)

    @property
    def online_count(self):
        return len(self.connections)


manager = ConnectionManager()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COVEN (PARTY) CRUD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CovenCreate(BaseModel):
    name: str
    max_members: Optional[int] = 6


class CovenJoin(BaseModel):
    invite_code: str


@router.post("/covens")
async def create_coven(body: CovenCreate, user=Depends(get_current_user)):
    """Create a new Coven (party)."""
    uid = user["id"]

    # Check if already in a coven
    existing = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    if existing:
        raise HTTPException(400, "You are already in a coven. Leave first.")

    now = datetime.now(timezone.utc).isoformat()
    invite_code = hashlib.md5(f"{uid}_{now}".encode()).hexdigest()[:8].upper()
    coven_id = hashlib.md5(f"coven_{uid}_{now}".encode()).hexdigest()[:12]

    await db.covens.insert_one({
        "id": coven_id,
        "name": body.name,
        "invite_code": invite_code,
        "leader_id": uid,
        "max_members": body.max_members or 6,
        "created_at": now,
    })

    await db.coven_members.insert_one({
        "coven_id": coven_id,
        "user_id": uid,
        "role": "leader",
        "active": True,
        "joined_at": now,
    })

    return {
        "success": True,
        "coven_id": coven_id,
        "name": body.name,
        "invite_code": invite_code,
        "message": f"Coven '{body.name}' created. Share code: {invite_code}",
    }


@router.post("/covens/join")
async def join_coven(body: CovenJoin, user=Depends(get_current_user)):
    """Join a coven using an invite code."""
    uid = user["id"]

    existing = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    if existing:
        raise HTTPException(400, "You are already in a coven. Leave first.")

    coven = await db.covens.find_one({"invite_code": body.invite_code}, {"_id": 0})
    if not coven:
        raise HTTPException(404, "Invalid invite code")

    member_count = await db.coven_members.count_documents({"coven_id": coven["id"], "active": True})
    if member_count >= coven.get("max_members", 6):
        raise HTTPException(400, "Coven is full")

    now = datetime.now(timezone.utc).isoformat()
    await db.coven_members.insert_one({
        "coven_id": coven["id"],
        "user_id": uid,
        "role": "member",
        "active": True,
        "joined_at": now,
    })

    # Notify coven via WebSocket
    user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "name": 1})
    await manager.broadcast_to_coven(coven["id"], {
        "type": "member_joined",
        "user_id": uid,
        "name": user_doc.get("name", "Traveler") if user_doc else "Traveler",
        "coven_id": coven["id"],
    })

    return {
        "success": True,
        "coven_id": coven["id"],
        "coven_name": coven["name"],
        "message": f"Joined coven '{coven['name']}'",
    }


@router.post("/covens/leave")
async def leave_coven(user=Depends(get_current_user)):
    """Leave the current coven."""
    uid = user["id"]
    membership = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    if not membership:
        raise HTTPException(400, "You are not in a coven")

    coven_id = membership["coven_id"]
    await db.coven_members.update_one(
        {"user_id": uid, "coven_id": coven_id, "active": True},
        {"$set": {"active": False, "left_at": datetime.now(timezone.utc).isoformat()}},
    )

    # If leader leaves, disband or transfer
    if membership.get("role") == "leader":
        next_member = await db.coven_members.find_one(
            {"coven_id": coven_id, "active": True, "user_id": {"$ne": uid}}, {"_id": 0}
        )
        if next_member:
            await db.coven_members.update_one(
                {"coven_id": coven_id, "user_id": next_member["user_id"]},
                {"$set": {"role": "leader"}},
            )
        else:
            await db.covens.delete_one({"id": coven_id})

    # Clear from manager
    if uid in manager.positions:
        manager.positions[uid].pop("coven_id", None)

    user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "name": 1})
    await manager.broadcast_to_coven(coven_id, {
        "type": "member_left",
        "user_id": uid,
        "name": user_doc.get("name", "Traveler") if user_doc else "Traveler",
    })

    return {"success": True, "message": "Left the coven"}


@router.get("/covens/my")
async def get_my_coven(user=Depends(get_current_user)):
    """Get the user's current coven details."""
    uid = user["id"]
    membership = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    if not membership:
        return {"in_coven": False}

    coven = await db.covens.find_one({"id": membership["coven_id"]}, {"_id": 0})
    if not coven:
        return {"in_coven": False}

    members_docs = await db.coven_members.find(
        {"coven_id": coven["id"], "active": True}, {"_id": 0}
    ).to_list(20)

    members = []
    for m in members_docs:
        u = await db.users.find_one({"id": m["user_id"]}, {"_id": 0, "name": 1, "id": 1})
        online = m["user_id"] in manager.connections
        members.append({
            "user_id": m["user_id"],
            "name": u.get("name", "Traveler") if u else "Traveler",
            "role": m.get("role", "member"),
            "online": online,
        })

    return {
        "in_coven": True,
        "coven_id": coven["id"],
        "name": coven["name"],
        "invite_code": coven["invite_code"],
        "leader_id": coven["leader_id"],
        "role": membership.get("role", "member"),
        "members": members,
        "member_count": len(members),
        "max_members": coven.get("max_members", 6),
    }


@router.get("/online-count")
async def get_online_count(user=Depends(get_current_user)):
    """Get count of currently connected users."""
    return {"online": manager.online_count}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COVEN LEADERBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/leaderboard")
async def get_coven_leaderboard(user=Depends(get_current_user)):
    """Rank covens by combined forge score + harvest count."""
    covens = await db.covens.find({}, {"_id": 0}).to_list(100)
    if not covens:
        return {"leaderboard": [], "total_covens": 0}

    rankings = []
    for coven in covens:
        cid = coven["id"]
        members = await db.coven_members.find(
            {"coven_id": cid, "active": True}, {"_id": 0}
        ).to_list(20)
        member_ids = [m["user_id"] for m in members]
        if not member_ids:
            continue

        # Aggregate forge scores
        forges = await db.resonance_builds.find(
            {"user_id": {"$in": member_ids}}, {"_id": 0, "forge_score": 1}
        ).to_list(500)
        total_forge_score = sum(f.get("forge_score", 0) for f in forges)
        forge_count = len(forges)

        # Aggregate harvest count
        harvests = await db.user_harvest_log.count_documents(
            {"user_id": {"$in": member_ids}}
        )

        # Combined score: forge_score + (harvests * 2)
        combined = round(total_forge_score + (harvests * 2), 1)

        # Online count
        online = sum(1 for mid in member_ids if mid in manager.connections)

        # Leader name
        leader = await db.users.find_one(
            {"id": coven.get("leader_id")}, {"_id": 0, "name": 1}
        )

        rankings.append({
            "coven_id": cid,
            "name": coven["name"],
            "leader": leader.get("name", "Unknown") if leader else "Unknown",
            "member_count": len(member_ids),
            "online_count": online,
            "forge_score": round(total_forge_score, 1),
            "forge_count": forge_count,
            "harvest_count": harvests,
            "combined_score": combined,
            "created_at": coven.get("created_at"),
        })

    rankings.sort(key=lambda r: r["combined_score"], reverse=True)

    # Add rank
    for i, r in enumerate(rankings):
        r["rank"] = i + 1

    return {"leaderboard": rankings, "total_covens": len(rankings)}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GROUP FORGING — Averaged Accuracy Across Party
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GroupForgeRequest(BaseModel):
    build_id: str
    user_waveform: list[float]
    time_taken_seconds: float


@router.post("/group-forge")
async def group_forge(body: GroupForgeRequest, user=Depends(get_current_user)):
    """
    Group Forge: Average the requesting user's forge accuracy with
    recent forge scores of online coven members. Strong players
    'lift' weaker ones by raising the averaged accuracy.
    """
    uid = user["id"]

    # Must be in a coven
    membership = await db.coven_members.find_one({"user_id": uid, "active": True}, {"_id": 0})
    if not membership:
        raise HTTPException(400, "You must be in a coven to group forge")

    coven_id = membership["coven_id"]

    # Get all active coven member IDs
    members_docs = await db.coven_members.find(
        {"coven_id": coven_id, "active": True}, {"_id": 0}
    ).to_list(20)
    member_ids = [m["user_id"] for m in members_docs]

    # Only count online members (connected to WebSocket)
    online_ids = [mid for mid in member_ids if mid in manager.connections]
    if len(online_ids) < 2:
        raise HTTPException(400, "Need at least 2 online coven members for group forging")

    # Get the requesting user's individual accuracy
    from routes.cosmic_map import FORGE_PATTERNS
    pattern = FORGE_PATTERNS.get(body.build_id)
    if not pattern:
        raise HTTPException(404, "Forge pattern not found")

    target = pattern["waveform"]
    tolerance = pattern["tolerance"]
    if len(body.user_waveform) != len(target):
        raise HTTPException(400, f"Waveform must have exactly {len(target)} points")

    point_scores = []
    for t, u in zip(target, body.user_waveform):
        error = abs(t - u)
        score = max(0, 1.0 - (error / tolerance)) if error <= tolerance else 0
        point_scores.append(round(score, 2))

    user_accuracy = sum(point_scores) / len(point_scores) * 100
    time_ok = body.time_taken_seconds <= pattern["time_limit_seconds"]

    # Gather recent forge scores from online coven members (excluding self)
    other_online = [mid for mid in online_ids if mid != uid]
    member_scores = [user_accuracy]

    for mid in other_online:
        last_forge = await db.resonance_builds.find_one(
            {"user_id": mid},
            {"_id": 0, "forge_accuracy": 1},
            sort=[("crafted_at", -1)],
        )
        if last_forge and "forge_accuracy" in last_forge:
            member_scores.append(last_forge["forge_accuracy"])
        else:
            # No forge history: contribute a base score of 50
            member_scores.append(50.0)

    # Average all scores
    averaged_accuracy = sum(member_scores) / len(member_scores)
    time_bonus = max(0, 1.0 - (body.time_taken_seconds / pattern["time_limit_seconds"])) * 10
    total_score = round(averaged_accuracy + time_bonus, 1)
    forged = averaged_accuracy >= 70 and time_ok

    lift = round(averaged_accuracy - user_accuracy, 1)

    if forged:
        from routes.science_history import RESONANCE_BUILDS
        build_def = None
        for b in RESONANCE_BUILDS:
            if b["id"] == body.build_id:
                build_def = b
                break
        if build_def:
            existing = await db.resonance_builds.find_one(
                {"user_id": uid, "build_id": body.build_id}, {"_id": 0}
            )
            if not existing:
                now = datetime.now(timezone.utc).isoformat()
                await db.resonance_builds.insert_one({
                    "user_id": uid,
                    "build_id": body.build_id,
                    "build_name": build_def["name"],
                    "bonus_type": build_def["bonus_type"],
                    "bonus_value": build_def["bonus_value"],
                    "crafted_at": now,
                    "forge_score": total_score,
                    "forge_accuracy": round(averaged_accuracy, 1),
                    "group_forged": True,
                    "coven_id": coven_id,
                })

    # Notify coven
    await manager.broadcast_to_coven(coven_id, {
        "type": "group_forge_result",
        "user_id": uid,
        "name": user.get("name", "Traveler"),
        "build_id": body.build_id,
        "averaged_accuracy": round(averaged_accuracy, 1),
        "forged": forged,
    })

    return {
        "forged": forged,
        "your_accuracy": round(user_accuracy, 1),
        "averaged_accuracy": round(averaged_accuracy, 1),
        "lift": lift,
        "contributors": len(member_scores),
        "member_scores": [round(s, 1) for s in member_scores],
        "time_bonus": round(time_bonus, 1),
        "total_score": total_score,
        "time_ok": time_ok,
        "message": f"Group Forge {'succeeded' if forged else 'failed'}! Averaged {round(averaged_accuracy, 1)}% across {len(member_scores)} members" + (f" (+{lift}% lift)" if lift > 0 else ""),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WEBSOCKET ENDPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def authenticate_ws(token: str):
    """Validate JWT token for WebSocket connections."""
    try:
        payload = decode_token(token)
        if not payload:
            return None
        user = await db.users.find_one({"id": payload["id"]}, {"_id": 0, "id": 1, "name": 1})
        return user
    except Exception:
        return None

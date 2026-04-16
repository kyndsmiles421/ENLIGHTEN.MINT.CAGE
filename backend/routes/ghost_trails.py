"""
Ghost Trail Presence & Resonance System — V55.0 OmniCore
Tracks user presence in the 9x9 spatial grid.
- Ghost trails visible after 30s stillness
- Resonance Score: collective stillness multiplier (φ-scaled)
- Residue sparks persist as Masonry crafting materials
- Spark gifting between users
"""
from fastapi import APIRouter, Depends
from deps import db, logger
from datetime import datetime, timezone
import math

router = APIRouter()

PHI = 1.618033988749895

# In-memory presence: { room: { user_id: { position, trail, last_seen, is_still, stillness_s } } }
_presence = {}
# Residue sparks: { room: [ { position, color, created_at, user_id } ] }
_residue_sparks = {}
# Resonance history: { room: [ { score, timestamp, still_count } ] }
_resonance_history = {}

MAX_TRAIL_LENGTH = 12
SPARK_LIFETIME_S = 300
MAX_SPARKS_PER_ROOM = 50


def _clean_room(room):
    """Remove stale users and sparks."""
    now = datetime.now(timezone.utc).timestamp()
    if room in _presence:
        stale = [uid for uid, d in _presence[room].items() if now - d.get("last_seen", 0) > 120]
        for uid in stale:
            del _presence[room][uid]
    if room in _residue_sparks:
        _residue_sparks[room] = [s for s in _residue_sparks[room] if now - s.get("created_at", 0) < SPARK_LIFETIME_S]


def _calc_resonance(room):
    """Calculate φ-scaled Resonance Score for a room."""
    _clean_room(room)
    room_data = _presence.get(room, {})
    still_users = [d for d in room_data.values() if d.get("is_still", False)]
    still_count = len(still_users)
    if still_count == 0:
        return {"score": 0, "still_count": 0, "multiplier": 1.0, "level": "silent"}
    # φ-scaled: each additional still user multiplies by φ
    multiplier = math.pow(PHI, still_count - 1)
    score = round(still_count * multiplier * 10, 1)
    level = "radiant" if still_count >= 5 else "harmonic" if still_count >= 3 else "attuned" if still_count >= 2 else "centered"
    return {"score": score, "still_count": still_count, "multiplier": round(multiplier, 3), "level": level}


@router.get("/ghost-trails/{room}")
async def get_ghost_trails(room: str):
    """Get ghost trails, sparks, and resonance score for a room."""
    _clean_room(room)
    room_presence = _presence.get(room, {})
    now = datetime.now(timezone.utc).timestamp()

    trails = []
    for uid, data in room_presence.items():
        if now - data.get("last_seen", 0) < 60:
            trails.append({
                "user_id": uid[:8],
                "trail": data.get("trail", [])[-MAX_TRAIL_LENGTH:],
                "color": data.get("color", "#A78BFA"),
                "realm": data.get("realm", "SURFACE"),
                "is_still": data.get("is_still", False),
            })

    sparks = (_residue_sparks.get(room, []))[-MAX_SPARKS_PER_ROOM:]
    resonance = _calc_resonance(room)

    return {
        "trails": trails,
        "sparks": sparks,
        "active_count": len(trails),
        "resonance": resonance,
    }


@router.post("/ghost-trails/update")
async def update_presence(data: dict):
    """Update user position + stillness state."""
    room = data.get("room", "default")
    user_id = data.get("user_id", "anon")
    position = data.get("position", {"x": 4, "y": 0})
    color = data.get("color", "#A78BFA")
    realm = data.get("realm", "SURFACE")
    is_still = data.get("is_still", False)
    stillness_s = data.get("stillness_s", 0)

    if room not in _presence:
        _presence[room] = {}

    now = datetime.now(timezone.utc).timestamp()
    prev = _presence[room].get(user_id, {})
    prev_trail = prev.get("trail", [])
    prev_trail.append({"x": position.get("x", 4), "y": position.get("y", 0), "t": now})
    if len(prev_trail) > MAX_TRAIL_LENGTH:
        prev_trail = prev_trail[-MAX_TRAIL_LENGTH:]

    _presence[room][user_id] = {
        "position": position,
        "trail": prev_trail,
        "color": color,
        "realm": realm,
        "last_seen": now,
        "is_still": is_still,
        "stillness_s": stillness_s,
    }

    resonance = _calc_resonance(room)
    return {"status": "ok", "active_in_room": len(_presence[room]), "resonance": resonance}


@router.post("/ghost-trails/leave-spark")
async def leave_residue_spark(data: dict):
    """Leave a residue spark (also serves as Masonry crafting material)."""
    room = data.get("room", "default")
    position = data.get("position", {"x": 4, "y": 0})
    color = data.get("color", "#A78BFA")
    user_id = data.get("user_id", "anon")

    if room not in _residue_sparks:
        _residue_sparks[room] = []

    now = datetime.now(timezone.utc).timestamp()
    _residue_sparks[room].append({
        "position": position,
        "color": color,
        "created_at": now,
        "user_id": user_id[:8],
        "craftable": True,
    })

    _clean_room(room)
    return {"status": "ok", "sparks_in_room": len(_residue_sparks.get(room, []))}


@router.get("/resonance/{room}")
async def get_resonance(room: str):
    """Get the current Resonance Score for a room."""
    resonance = _calc_resonance(room)
    history = _resonance_history.get(room, [])[-20:]
    return {"resonance": resonance, "history": history}


@router.post("/resonance/record")
async def record_resonance(data: dict):
    """Record a resonance event (when multiple users achieve stillness)."""
    room = data.get("room", "default")
    resonance = _calc_resonance(room)
    if resonance["still_count"] >= 2:
        now = datetime.now(timezone.utc).timestamp()
        if room not in _resonance_history:
            _resonance_history[room] = []
        _resonance_history[room].append({
            "score": resonance["score"],
            "still_count": resonance["still_count"],
            "timestamp": now,
            "level": resonance["level"],
        })
        _resonance_history[room] = _resonance_history[room][-50:]
    return resonance


@router.get("/masonry/materials/{room}")
async def get_masonry_materials(room: str):
    """Get craftable sparks (Masonry building materials) from a room."""
    _clean_room(room)
    sparks = _residue_sparks.get(room, [])
    craftable = [s for s in sparks if s.get("craftable", False)]
    return {
        "materials": craftable[-MAX_SPARKS_PER_ROOM:],
        "total": len(craftable),
        "resonance": _calc_resonance(room),
    }


@router.post("/masonry/gift-spark")
async def gift_spark(data: dict):
    """Gift a Resonance Spark to bless another user's structure."""
    from_room = data.get("room", "default")
    to_user = data.get("to_user", "")
    color = data.get("color", "#A78BFA")
    position = data.get("position", {"x": 4, "y": 4})

    if not to_user:
        return {"error": "to_user required"}

    # Store as a blessed spark in the target room
    target_room = data.get("target_room", from_room)
    if target_room not in _residue_sparks:
        _residue_sparks[target_room] = []

    now = datetime.now(timezone.utc).timestamp()
    _residue_sparks[target_room].append({
        "position": position,
        "color": color,
        "created_at": now,
        "user_id": to_user[:8],
        "craftable": True,
        "blessed": True,
        "blessed_by": data.get("from_user", "anon")[:8],
    })

    return {"status": "blessed", "sparks_in_target": len(_residue_sparks[target_room])}

"""
time_capsules.py — Session State Archival (V68.59)

Receives ContextBus snapshots dispatched via `navigator.sendBeacon`
when the user closes the tab / backgrounds the app on mobile. The
beacon API is fire-and-forget so this endpoint:

  • Authenticates via a token field IN THE BODY (sendBeacon doesn't
    let us set Authorization headers — Content-Type is constrained
    to a few safe values; we use application/json with the token
    in the payload).
  • Validates payload size (<16 KB) to prevent abuse.
  • Always returns 200 — the client doesn't read the response.
  • Stores in `time_capsules` collection keyed by user + session_id
    so multiple sessions per user co-exist.

This is the "save game" of the Sovereign Engine. Without it, the
ContextBus's localStorage layer is the only persistence — and
mobile browsers can evict localStorage under storage pressure.
The server-side capsule is the durable record.
"""
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from deps import db, decode_token, logger

router = APIRouter()

MAX_PAYLOAD_BYTES = 16 * 1024            # 16 KB hard cap
DEDUP_WINDOW_SECONDS = 5                  # ignore re-fires within 5s


@router.post("/time-capsules/archive")
async def archive_capsule(request: Request):
    """Archive a ContextBus snapshot at session-exit.

    Body shape (all fields optional except `token` and `session_id`):
    {
        "token":         "<JWT>",                 # auth, in body
        "session_id":    "<uuid v4>",             # client-generated
        "snapshot":      { worldMetadata, narrativeContext, ... },
        "gauge_load":    0.0..1.0,
        "gauge_state":   "cold" | "flow" | "overheating",
        "active_module": "STORY_GEN" | ... | null,
        "client_ts":     "<ISO8601>",
    }
    """
    # Read raw body to enforce size cap before JSON parsing
    raw = await request.body()
    if not raw:
        return {"ok": False, "reason": "empty"}
    if len(raw) > MAX_PAYLOAD_BYTES:
        # Beacon is fire-and-forget; respond 200 with reason for log
        return {"ok": False, "reason": "payload-too-large"}

    try:
        import json
        body = json.loads(raw)
    except Exception:
        return {"ok": False, "reason": "malformed-json"}

    token = (body.get("token") or "").strip()
    session_id = (body.get("session_id") or "").strip()
    if not token or not session_id:
        return {"ok": False, "reason": "missing-credentials"}

    user = decode_token(token)
    if not user:
        # Don't 401 (some browsers retry). Just no-op.
        return {"ok": False, "reason": "invalid-token"}

    # Dedup — the beacon may double-fire on visibilitychange + pagehide
    last = await db.time_capsules.find_one(
        {"user_id": user["id"], "session_id": session_id},
        sort=[("archived_at_ts", -1)],
        projection={"_id": 0, "archived_at_ts": 1},
    )
    now = time.time()
    if last and (now - (last.get("archived_at_ts") or 0)) < DEDUP_WINDOW_SECONDS:
        return {"ok": True, "deduped": True}

    snapshot = body.get("snapshot") or {}
    capsule = {
        "user_id":       user["id"],
        "session_id":    session_id,
        "snapshot":      {
            "worldMetadata":    snapshot.get("worldMetadata"),
            "narrativeContext": snapshot.get("narrativeContext"),
            "entityState":      snapshot.get("entityState"),
            "sceneFrame":       snapshot.get("sceneFrame"),
            "history":          (snapshot.get("history") or [])[-16:],
        },
        "gauge_load":    body.get("gauge_load"),
        "gauge_state":   body.get("gauge_state"),
        "active_module": body.get("active_module"),
        "client_ts":     body.get("client_ts"),
        "archived_at":   datetime.now(timezone.utc).isoformat(),
        "archived_at_ts": now,
    }
    try:
        await db.time_capsules.insert_one(capsule)
    except Exception as e:
        logger.error(f"time_capsule insert failed: {e}")
        return {"ok": False, "reason": "insert-failed"}

    return {"ok": True}


@router.get("/time-capsules/recent")
async def recent_capsules(request: Request, limit: int = 10):
    """List the user's most recent time-capsules.

    Authenticates via standard Authorization header (this is a
    normal user-initiated read, not a beacon)."""
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="auth required")
    user = decode_token(auth[7:])
    if not user:
        raise HTTPException(status_code=401, detail="invalid token")

    limit = max(1, min(50, int(limit or 10)))
    cursor = (
        db.time_capsules
        .find({"user_id": user["id"]}, {"_id": 0})
        .sort("archived_at_ts", -1)
        .limit(limit)
    )
    return {"capsules": [c async for c in cursor]}

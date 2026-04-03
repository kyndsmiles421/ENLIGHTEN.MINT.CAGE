from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid
import re

router = APIRouter(prefix="/sentinel", tags=["Content Sentinel"])

# ─── Prohibited Pattern Library ───
PROHIBITED_PATTERNS = [
    r'\b(hate|kill|die|murder|rape|nazi|terrorist)\b',
    r'\b(n[i1]gg|f[a@]g|k[i1]ke|sp[i1]c|ch[i1]nk|wetback)\b',
    r'\b(porn|xxx|nude|naked|sex\s*(?:ual|y)|hentai|nsfw)\b',
    r'\b(suicide|self.?harm|cut\s*(?:ting|myself))\b',
    r'\b(bomb|shoot\s*up|mass\s*(?:murder|shooting))\b',
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in PROHIBITED_PATTERNS]

SEVERITY_MAP = {
    'hate_speech': 'critical',
    'sexual': 'high',
    'violence': 'high',
    'self_harm': 'critical',
    'harassment': 'medium',
    'spam': 'low',
}


def scan_text(text: str) -> dict:
    """Scan text content for prohibited patterns. Returns violation details."""
    if not text or not isinstance(text, str):
        return {"clean": True, "violations": []}

    violations = []
    text_lower = text.lower().strip()

    for i, pattern in enumerate(COMPILED_PATTERNS):
        matches = pattern.findall(text_lower)
        if matches:
            category = ['hate_speech', 'slur', 'sexual', 'self_harm', 'violence'][min(i, 4)]
            violations.append({
                "category": category,
                "severity": SEVERITY_MAP.get(category, 'medium'),
                "matched_count": len(matches),
            })

    return {
        "clean": len(violations) == 0,
        "violations": violations,
        "risk_score": min(1.0, sum(0.3 if v["severity"] == "low" else 0.6 if v["severity"] == "medium" else 0.9 for v in violations)),
    }


@router.post("/scan")
async def scan_content(body: dict, user=Depends(get_current_user)):
    """Scan user-generated content before it enters the ecosystem.
    Returns clean=True if safe, or blocks with violation details."""
    text = body.get("text", "")
    context = body.get("context", "general")

    # Check if user is shadow-muted
    mute = await db.sentinel_mutes.find_one({"user_id": user["id"], "active": True}, {"_id": 0})
    if mute:
        # Shadow-muted users think their content is posted but it's silently dropped
        return {"clean": True, "shadow_blocked": True, "message": "Content accepted"}

    result = scan_text(text)

    if not result["clean"]:
        # Log violation to sovereign ledger
        violation_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "user_name": user.get("name", "Anonymous"),
            "content_preview": text[:200],
            "context": context,
            "violations": result["violations"],
            "risk_score": result["risk_score"],
            "action": "blocked",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.sentinel_log.insert_one(violation_doc)

        # Auto-escalation: 3+ violations = auto shadow-mute
        violation_count = await db.sentinel_log.count_documents({"user_id": user["id"]})
        if violation_count >= 3:
            existing_mute = await db.sentinel_mutes.find_one({"user_id": user["id"]})
            if not existing_mute:
                await db.sentinel_mutes.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "reason": f"Auto-muted after {violation_count} violations",
                    "active": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })

        return {
            "clean": False,
            "blocked": True,
            "risk_score": result["risk_score"],
            "message": "Content blocked by the Collective Sentinel",
        }

    return {"clean": True, "message": "Content accepted"}


@router.get("/log")
async def get_sentinel_log(user=Depends(get_current_user), skip: int = 0, limit: int = 50):
    """Sovereign: View all intercepted content violations."""
    entries = await db.sentinel_log.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.sentinel_log.count_documents({})
    return {"entries": entries, "total": total}


@router.get("/mutes")
async def get_muted_users(user=Depends(get_current_user)):
    """Sovereign: List all shadow-muted users."""
    mutes = await db.sentinel_mutes.find(
        {"active": True}, {"_id": 0}
    ).to_list(100)
    return mutes


@router.post("/mute/{target_user_id}")
async def shadow_mute_user(target_user_id: str, body: dict, user=Depends(get_current_user)):
    """Sovereign: Shadow-mute a user. They can still post but content is silently dropped."""
    reason = body.get("reason", "Manual sovereign mute")
    existing = await db.sentinel_mutes.find_one({"user_id": target_user_id, "active": True})
    if existing:
        return {"already_muted": True}

    await db.sentinel_mutes.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": target_user_id,
        "muted_by": user["id"],
        "reason": reason,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"muted": True, "user_id": target_user_id}


@router.post("/unmute/{target_user_id}")
async def unmute_user(target_user_id: str, user=Depends(get_current_user)):
    """Sovereign: Remove shadow-mute from a user."""
    result = await db.sentinel_mutes.update_many(
        {"user_id": target_user_id, "active": True},
        {"$set": {"active": False, "unmuted_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"unmuted": result.modified_count > 0}


@router.get("/stats")
async def get_sentinel_stats(user=Depends(get_current_user)):
    """Sovereign: Get content sentinel statistics."""
    total_scans = await db.sentinel_log.count_documents({})
    total_blocked = await db.sentinel_log.count_documents({"action": "blocked"})
    active_mutes = await db.sentinel_mutes.count_documents({"active": True})

    # Category breakdown
    pipeline = [
        {"$unwind": "$violations"},
        {"$group": {"_id": "$violations.category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    categories = await db.sentinel_log.aggregate(pipeline).to_list(20)

    return {
        "total_intercepted": total_scans,
        "total_blocked": total_blocked,
        "active_shadow_mutes": active_mutes,
        "categories": {c["_id"]: c["count"] for c in categories},
    }

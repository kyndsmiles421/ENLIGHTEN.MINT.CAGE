from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime, timezone, timedelta
from deps import db, get_current_user

router = APIRouter()

CREATOR_EMAIL = "kyndsmiles@gmail.com"


async def require_creator(user=Depends(get_current_user)):
    """Verify the user is the creator."""
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not user_doc or user_doc.get("email") != CREATOR_EMAIL:
        raise HTTPException(status_code=403, detail="Creator access only")
    return user_doc


@router.get("/creator/overview")
async def creator_overview(user=Depends(require_creator)):
    """Creator dashboard overview stats."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()

    total_users = await db.users.count_documents({})
    total_feedback = await db.feedback.count_documents({})
    total_comments = await db.comments.count_documents({})
    total_installs = await db.app_installs.count_documents({})

    # Active users (logged activity today)
    active_today = len(await db.activity_log.distinct("user_id", {"timestamp": {"$gte": today_start}}))

    # Active this week
    active_week = len(await db.activity_log.distinct("user_id", {"timestamp": {"$gte": week_ago}}))

    # Active this month
    active_month = len(await db.activity_log.distinct("user_id", {"timestamp": {"$gte": month_ago}}))

    # New users this week
    new_users_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})

    # Feedback by status
    new_feedback = await db.feedback.count_documents({"status": "new"})
    in_review = await db.feedback.count_documents({"status": "in_review"})
    resolved_feedback = await db.feedback.count_documents({"status": "resolved"})

    # Sessions / mood logs / journal entries
    total_moods = await db.mood_entries.count_documents({})
    total_journals = await db.journal_entries.count_documents({})
    total_sessions = await db.coach_sessions.count_documents({})

    return {
        "total_users": total_users,
        "active_today": active_today,
        "active_week": active_week,
        "active_month": active_month,
        "new_users_week": new_users_week,
        "total_installs": total_installs,
        "total_feedback": total_feedback,
        "new_feedback": new_feedback,
        "in_review_feedback": in_review,
        "resolved_feedback": resolved_feedback,
        "total_comments": total_comments,
        "total_moods": total_moods,
        "total_journals": total_journals,
        "total_sessions": total_sessions,
    }


@router.get("/creator/popular-features")
async def popular_features(user=Depends(require_creator)):
    """Get the most popular pages/features by activity count."""
    pipeline = [
        {"$group": {"_id": "$page", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    results = await db.activity_log.aggregate(pipeline).to_list(20)
    features = [{"page": r["_id"], "visits": r["count"]} for r in results if r["_id"]]
    return {"features": features}


@router.get("/creator/user-growth")
async def user_growth(user=Depends(require_creator)):
    """Daily user registrations for the last 30 days."""
    now = datetime.now(timezone.utc)
    days = []
    for i in range(29, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        day_end = (day.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
        count = await db.users.count_documents({"created_at": {"$gte": day_start, "$lt": day_end}})
        days.append({"date": day.strftime("%b %d"), "count": count})
    return {"growth": days}


@router.get("/creator/active-trend")
async def active_trend(user=Depends(require_creator)):
    """Daily active users for the last 14 days."""
    now = datetime.now(timezone.utc)
    days = []
    for i in range(13, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        day_end = (day.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
        active = len(await db.activity_log.distinct("user_id", {"timestamp": {"$gte": day_start, "$lt": day_end}}))
        days.append({"date": day.strftime("%b %d"), "active": active})
    return {"trend": days}


@router.get("/creator/feedback")
async def get_all_feedback(user=Depends(require_creator)):
    """Get all feedback with pagination."""
    items = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"feedback": items, "total": len(items)}


@router.put("/creator/feedback/{feedback_id}/status")
async def update_feedback_status(feedback_id: str, data: dict = Body(...), user=Depends(require_creator)):
    """Update feedback status."""
    new_status = data.get("status", "new")
    if new_status not in ("new", "in_review", "resolved", "dismissed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.feedback.update_one(
        {"id": feedback_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"status": "updated"}


@router.get("/creator/comments")
async def get_all_comments(user=Depends(require_creator)):
    """Get all community comments across features."""
    items = await db.comments.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"comments": items, "total": len(items)}


@router.delete("/creator/comments/{comment_id}")
async def delete_comment(comment_id: str, user=Depends(require_creator)):
    """Delete a community comment (moderation)."""
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"status": "deleted"}


@router.get("/creator/recent-users")
async def recent_users(user=Depends(require_creator)):
    """Get recently registered users."""
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(50)
    return {"users": users}


# ─── PWA Install Tracking ───

@router.post("/app-install")
async def track_install(data: dict = Body(...), user=Depends(get_current_user)):
    """Track PWA install event."""
    doc = {
        "user_id": user["id"],
        "user_name": user.get("name", ""),
        "platform": data.get("platform", "unknown"),
        "installed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.app_installs.update_one(
        {"user_id": user["id"]},
        {"$set": doc},
        upsert=True,
    )
    return {"status": "tracked"}


# ─── Interactive Creator Actions ───

@router.post("/creator/broadcast")
async def broadcast_notification(data: dict = Body(...), user=Depends(require_creator)):
    """Send a notification to all users or a subset."""
    import uuid
    title = data.get("title", "")
    body = data.get("body", "")
    target = data.get("target", "all")  # "all", "active", "new"
    if not title or not body:
        raise HTTPException(status_code=400, detail="Title and body required")

    now = datetime.now(timezone.utc)
    query = {}
    if target == "active":
        week_ago = (now - timedelta(days=7)).isoformat()
        active_ids = await db.activity_log.distinct("user_id", {"timestamp": {"$gte": week_ago}})
        query = {"id": {"$in": active_ids}}
    elif target == "new":
        week_ago = (now - timedelta(days=7)).isoformat()
        query = {"created_at": {"$gte": week_ago}}

    users_list = await db.users.find(query, {"_id": 0, "id": 1}).to_list(5000)
    notifications = []
    for u in users_list:
        notifications.append({
            "id": str(uuid.uuid4()),
            "user_id": u["id"],
            "type": "announcement",
            "title": title,
            "body": body,
            "url": data.get("url", "/"),
            "read": False,
            "created_at": now.isoformat(),
        })
    if notifications:
        await db.in_app_notifications.insert_many(notifications)

    # Log the broadcast
    await db.creator_broadcasts.insert_one({
        "id": str(uuid.uuid4()),
        "title": title,
        "body": body,
        "target": target,
        "sent_to": len(notifications),
        "created_at": now.isoformat(),
    })
    return {"status": "sent", "recipients": len(notifications)}


@router.get("/creator/broadcasts")
async def get_broadcasts(user=Depends(require_creator)):
    """Get broadcast history."""
    items = await db.creator_broadcasts.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"broadcasts": items}


@router.get("/creator/user/{user_id}")
async def get_user_detail(user_id: str, user=Depends(require_creator)):
    """Get detailed info about a specific user."""
    target = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    mood_count = await db.mood_entries.count_documents({"user_id": user_id})
    journal_count = await db.journal_entries.count_documents({"user_id": user_id})
    session_count = await db.coach_sessions.count_documents({"user_id": user_id})
    activity_week = await db.activity_log.count_documents({"user_id": user_id, "timestamp": {"$gte": week_ago}})
    last_activity = await db.activity_log.find_one({"user_id": user_id}, {"_id": 0}, sort=[("timestamp", -1)])

    return {
        **target,
        "mood_count": mood_count,
        "journal_count": journal_count,
        "session_count": session_count,
        "activity_this_week": activity_week,
        "last_active": last_activity.get("timestamp") if last_activity else None,
    }


@router.post("/creator/user/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, data: dict = Body(...), user=Depends(require_creator)):
    """Enable or disable a user account."""
    disabled = data.get("disabled", False)
    await db.users.update_one({"id": user_id}, {"$set": {"disabled": disabled, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": "disabled" if disabled else "enabled"}


@router.get("/creator/search-users")
async def search_users(q: str = "", user=Depends(require_creator)):
    """Search users by name or email."""
    if not q or len(q) < 2:
        return {"users": []}
    query = {"$or": [
        {"name": {"$regex": q, "$options": "i"}},
        {"email": {"$regex": q, "$options": "i"}},
    ]}
    results = await db.users.find(query, {"_id": 0, "password": 0}).limit(20).to_list(20)
    return {"users": results}


@router.get("/creator/export/{collection}")
async def export_data(collection: str, user=Depends(require_creator)):
    """Export data as JSON for download."""
    allowed = {"users": db.users, "feedback": db.feedback, "comments": db.comments, "mood_entries": db.mood_entries}
    if collection not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid collection. Allowed: {', '.join(allowed.keys())}")

    coll = allowed[collection]
    projection = {"_id": 0}
    if collection == "users":
        projection["password"] = 0
    items = await coll.find({}, projection).sort("created_at", -1).to_list(5000)

    from fastapi.responses import Response
    import json
    return Response(
        content=json.dumps(items, indent=2, default=str),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{collection}_export.json"'},
    )



# ─── Real-time Live Feed ───

@router.get("/creator/live-feed")
async def creator_live_feed(user=Depends(require_creator)):
    """Get the most recent activity events for real-time dashboard feed."""
    pipeline = [
        {"$sort": {"timestamp": -1}},
        {"$limit": 60},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "user_info",
        }},
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {"$project": {
            "_id": 0,
            "user_id": 1,
            "page": 1,
            "action": 1,
            "label": 1,
            "timestamp": 1,
            "user_name": {"$ifNull": ["$user_info.name", "Anonymous"]},
            "user_email": {"$ifNull": ["$user_info.email", ""]},
        }},
    ]
    events = await db.activity_log.aggregate(pipeline).to_list(60)
    return {"events": events}

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
    # Upsert — one install per user
    await db.app_installs.update_one(
        {"user_id": user["id"]},
        {"$set": doc},
        upsert=True,
    )
    return {"status": "tracked"}

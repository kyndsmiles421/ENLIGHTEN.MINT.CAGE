from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid
import asyncio

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    uid = user["id"]
    mood_count_t, journal_count_t, recent_moods_t, all_moods_t, all_journals_t = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(7),
        db.moods.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
        db.journal.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
    )

    today = datetime.now(timezone.utc).date()
    dates_active = set()
    for m in all_moods_t:
        try:
            dates_active.add(datetime.fromisoformat(m["created_at"]).date())
        except Exception:
            pass
    for j in all_journals_t:
        try:
            dates_active.add(datetime.fromisoformat(j["created_at"]).date())
        except Exception:
            pass

    streak = 0
    check_date = today
    while check_date in dates_active:
        streak += 1
        check_date -= timedelta(days=1)

    # 7-day sparkline data
    sparkline_moods = []
    sparkline_journals = []
    sparkline_activity = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        mood_day = sum(1 for m in all_moods_t if _parse_date(m.get("created_at")) == d)
        journal_day = sum(1 for j in all_journals_t if _parse_date(j.get("created_at")) == d)
        sparkline_moods.append(mood_day)
        sparkline_journals.append(journal_day)
        sparkline_activity.append(1 if d in dates_active else 0)

    return {
        "mood_count": mood_count_t,
        "journal_count": journal_count_t,
        "streak": streak,
        "recent_moods": recent_moods_t,
        "sparkline": {
            "moods": sparkline_moods,
            "journals": sparkline_journals,
            "activity": sparkline_activity,
        },
    }


def _parse_date(iso_str):
    try:
        return datetime.fromisoformat(iso_str).date()
    except Exception:
        return None


# ─── Feedback & Suggestions ───

@router.post("/feedback/submit")
async def submit_feedback(data: dict = Body(...), user=Depends(get_current_user)):
    """Submit a suggestion/feedback to the creator."""
    feedback = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "type": data.get("type", "suggestion"),
        "category": data.get("category", "general"),
        "message": data.get("message", ""),
        "page": data.get("page", ""),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.feedback.insert_one({**feedback})
    return {"status": "submitted", "id": feedback["id"]}


@router.get("/feedback/my")
async def get_my_feedback(user=Depends(get_current_user)):
    """Get user's submitted feedback."""
    items = await db.feedback.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"feedback": items}


@router.get("/feedback/all")
async def get_all_feedback(user=Depends(get_current_user)):
    """Creator-only: get all feedback (checks creator email)."""
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not user_doc or user_doc.get("email") != "kyndsmiles@gmail.com":
        raise HTTPException(status_code=403, detail="Creator access only")
    items = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"feedback": items, "total": len(items)}


# ─── Community Comments ───

@router.post("/comments/add")
async def add_comment(data: dict = Body(...), user=Depends(get_current_user)):
    """Add a comment to any feature/page."""
    comment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "feature": data.get("feature", "general"),
        "text": data.get("text", ""),
        "parent_id": data.get("parent_id", None),
        "likes": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.comments.insert_one({**comment})
    return {"status": "posted", "comment": {k: v for k, v in comment.items() if k != "_id"}}


@router.get("/comments/{feature}")
async def get_comments(feature: str):
    """Get comments for a specific feature/page."""
    comments = await db.comments.find(
        {"feature": feature}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"comments": comments, "count": len(comments)}


@router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: str, user=Depends(get_current_user)):
    """Like a community comment."""
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$inc": {"likes": 1}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"status": "liked"}


# ─── Smart Suggestions ───

@router.get("/dashboard/suggestions")
async def get_smart_suggestions(user=Depends(get_current_user)):
    """Activity-based personalized suggestions for the dashboard."""
    uid = user["id"]
    mood_count, journal_count, session_count, blessing_count = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.meditation_sessions.count_documents({"user_id": uid}),
        db.blessings.count_documents({"from_user_id": uid}),
    )

    suggestions = []

    if mood_count == 0:
        suggestions.append({
            "id": "first-mood",
            "title": "Track Your First Mood",
            "desc": "Understanding your emotions is the first step to transformation.",
            "path": "/mood",
            "icon": "Heart",
            "color": "#FDA4AF",
            "priority": 1,
        })

    if journal_count == 0:
        suggestions.append({
            "id": "first-journal",
            "title": "Write Your First Journal Entry",
            "desc": "A few words can shift your entire perspective.",
            "path": "/journal",
            "icon": "BookOpen",
            "color": "#86EFAC",
            "priority": 1,
        })

    if session_count == 0:
        suggestions.append({
            "id": "first-meditation",
            "title": "Try a Meditation Session",
            "desc": "Even 5 minutes of stillness changes everything.",
            "path": "/meditation",
            "icon": "Sparkles",
            "color": "#C084FC",
            "priority": 2,
        })

    if blessing_count == 0:
        suggestions.append({
            "id": "first-blessing",
            "title": "Send Your First Blessing",
            "desc": "Spread light to someone who needs it today.",
            "path": "/blessings",
            "icon": "Heart",
            "color": "#2DD4BF",
            "priority": 2,
        })

    if mood_count > 0 and journal_count > 0:
        suggestions.append({
            "id": "explore-crystals",
            "title": "Discover Your Crystal Match",
            "desc": "AI-powered crystal pairing based on your mood and intention.",
            "path": "/crystals",
            "icon": "Gem",
            "color": "#8B5CF6",
            "priority": 3,
        })

    if mood_count >= 5:
        suggestions.append({
            "id": "star-journey",
            "title": "Take a Stargazing Journey",
            "desc": "Explore 20 world cultures through their sacred sky stories.",
            "path": "/star-chart",
            "icon": "Star",
            "color": "#FCD34D",
            "priority": 3,
        })

    suggestions.append({
        "id": "explore-myths",
        "title": "Explore World Myths",
        "desc": "120+ creation stories from 20 civilizations with voice narration.",
        "path": "/creation-stories",
        "icon": "Globe",
        "color": "#FB923C",
        "priority": 4,
    })

    suggestions.sort(key=lambda s: s["priority"])
    return {"suggestions": suggestions[:4]}


# ─── Customizable Dashboard Layout ───

DEFAULT_SECTIONS = ["stats", "pinned", "suggestions", "coherence", "challenge", "wisdom", "moods", "recommendations", "actions"]
DEFAULT_PINNED = ["/breathing", "/mood", "/journal", "/meditation", "/oracle", "/star-chart", "/blessings", "/crystals"]


@router.get("/dashboard/layout")
async def get_dashboard_layout(user=Depends(get_current_user)):
    """Get user's customizable dashboard layout."""
    layout = await db.dashboard_layouts.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    if not layout:
        return {
            "sections_order": DEFAULT_SECTIONS,
            "hidden_sections": [],
            "pinned_shortcuts": DEFAULT_PINNED,
        }
    return {
        "sections_order": layout.get("sections_order", DEFAULT_SECTIONS),
        "hidden_sections": layout.get("hidden_sections", []),
        "pinned_shortcuts": layout.get("pinned_shortcuts", DEFAULT_PINNED),
    }


@router.put("/dashboard/layout")
async def save_dashboard_layout(data: dict = Body(...), user=Depends(get_current_user)):
    """Save user's customizable dashboard layout."""
    update = {
        "user_id": user["id"],
        "sections_order": data.get("sections_order", DEFAULT_SECTIONS),
        "hidden_sections": data.get("hidden_sections", []),
        "pinned_shortcuts": data.get("pinned_shortcuts", DEFAULT_PINNED),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.dashboard_layouts.update_one(
        {"user_id": user["id"]},
        {"$set": update},
        upsert=True,
    )
    return {"status": "saved"}

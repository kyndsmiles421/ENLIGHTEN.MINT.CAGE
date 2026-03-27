from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta

router = APIRouter()

ACHIEVEMENTS = [
    {"id": "first_breath", "name": "First Breath", "desc": "Complete your first breathwork session", "icon": "wind", "color": "#2DD4BF", "condition": "breath_sessions >= 1"},
    {"id": "first_meditation", "name": "Inner Stillness", "desc": "Complete your first meditation", "icon": "timer", "color": "#C084FC", "condition": "meditations >= 1"},
    {"id": "mood_tracker", "name": "Mood Tracker", "desc": "Log 7 moods", "icon": "heart", "color": "#FDA4AF", "condition": "mood_logs >= 7"},
    {"id": "journal_keeper", "name": "Journal Keeper", "desc": "Write 5 journal entries", "icon": "book-open", "color": "#86EFAC", "condition": "journals >= 5"},
    {"id": "streak_3", "name": "Three-Day Flow", "desc": "Maintain a 3-day streak", "icon": "flame", "color": "#FCD34D", "condition": "streak >= 3"},
    {"id": "streak_7", "name": "Week Warrior", "desc": "Maintain a 7-day streak", "icon": "flame", "color": "#FB923C", "condition": "streak >= 7"},
    {"id": "streak_30", "name": "Moon Cycle Master", "desc": "Maintain a 30-day streak", "icon": "moon", "color": "#E879F9", "condition": "streak >= 30"},
    {"id": "quantum_observer", "name": "Quantum Observer", "desc": "Reach Partial Alignment coherence (55+)", "icon": "eye", "color": "#00E5FF", "condition": "coherence >= 55"},
    {"id": "wave_rider", "name": "Wave Rider", "desc": "Reach Quantum Coherence (80+)", "icon": "zap", "color": "#76FF03", "condition": "coherence >= 80"},
    {"id": "entangled_soul", "name": "Entangled Soul", "desc": "Maintain coherence 80+ for 7 days", "icon": "sparkles", "color": "#E040FB", "condition": "coherent_days >= 7"},
    {"id": "zero_point_master", "name": "Zero-Point Master", "desc": "Practice all 4 types in one week", "icon": "atom", "color": "#18FFFF", "condition": "variety >= 4"},
    {"id": "oracle_seeker", "name": "Oracle Seeker", "desc": "Receive 10 divination readings", "icon": "star", "color": "#FFD740", "condition": "forecasts >= 10"},
    {"id": "sage_student", "name": "Sage Student", "desc": "Have 5 conversations with Sage", "icon": "message-circle", "color": "#38BDF8", "condition": "coach_sessions >= 5"},
    {"id": "dream_weaver", "name": "Dream Weaver", "desc": "Log 5 dreams", "icon": "moon", "color": "#818CF8", "condition": "dreams >= 5"},
    {"id": "community_light", "name": "Community Light", "desc": "Share 3 posts in the community", "icon": "users", "color": "#FDA4AF", "condition": "community_posts >= 3"},
]


async def compute_user_stats(user_id: str):
    """Compute all stats needed for achievement evaluation."""
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    mood_logs = await db.mood_logs.count_documents({"user_id": user_id})
    journals = await db.journals.count_documents({"user_id": user_id})
    meditations = await db.meditation_sessions.count_documents({"user_id": user_id})
    breath_sessions = await db.breath_sessions.count_documents({"user_id": user_id})
    forecasts = await db.forecasts.count_documents({"user_id": user_id})
    dreams = await db.dreams.count_documents({"user_id": user_id})
    coach_sessions = await db.coach_sessions.count_documents({"user_id": user_id})
    community_posts = await db.community_posts.count_documents({"user_id": user_id})

    streak_doc = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    # Weekly variety
    week_mood = await db.mood_logs.count_documents({"user_id": user_id, "timestamp": {"$gte": week_ago}})
    week_journal = await db.journals.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    week_med = await db.meditation_sessions.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    week_breath = await db.breath_sessions.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    variety = sum(1 for c in [week_mood, week_journal, week_med, week_breath] if c > 0)

    # Coherence score
    variety_score = min(5, variety) * 10
    frequency_score = min(50, (week_mood + week_journal + week_med + week_breath) * 3)
    streak_bonus = min(25, streak * 5)
    coherence = min(100, variety_score + frequency_score + streak_bonus)

    # Coherent days streak from history
    history = await db.coherence_history.find(
        {"user_id": user_id}, {"_id": 0, "score": 1, "date": 1}
    ).sort("date", -1).to_list(30)
    coherent_days = 0
    for h in history:
        if h.get("score", 0) >= 80:
            coherent_days += 1
        else:
            break

    return {
        "mood_logs": mood_logs, "journals": journals, "meditations": meditations,
        "breath_sessions": breath_sessions, "forecasts": forecasts, "dreams": dreams,
        "coach_sessions": coach_sessions, "community_posts": community_posts,
        "streak": streak, "variety": variety, "coherence": coherence,
        "coherent_days": coherent_days,
    }


def evaluate_achievement(condition: str, stats: dict) -> bool:
    """Evaluate achievement condition against user stats."""
    try:
        parts = condition.split()
        if len(parts) == 3:
            key, op, val = parts[0], parts[1], int(parts[2])
            actual = stats.get(key, 0)
            if op == ">=":
                return actual >= val
    except Exception:
        pass
    return False


@router.get("/achievements")
async def get_achievements(user=Depends(get_current_user)):
    """Get all achievements with unlock status for the user."""
    stats = await compute_user_stats(user["id"])

    unlocked_doc = await db.achievements.find_one({"user_id": user["id"]}, {"_id": 0})
    unlocked_ids = set(unlocked_doc.get("unlocked", [])) if unlocked_doc else set()

    result = []
    newly_unlocked = []
    for a in ACHIEVEMENTS:
        earned = a["id"] in unlocked_ids
        can_earn = evaluate_achievement(a["condition"], stats) if not earned else False

        if can_earn:
            newly_unlocked.append(a["id"])
            earned = True

        result.append({
            "id": a["id"], "name": a["name"], "desc": a["desc"],
            "icon": a["icon"], "color": a["color"], "earned": earned,
        })

    # Save newly unlocked
    if newly_unlocked:
        await db.achievements.update_one(
            {"user_id": user["id"]},
            {"$addToSet": {"unlocked": {"$each": newly_unlocked}},
             "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )

    earned_count = sum(1 for r in result if r["earned"])
    return {
        "achievements": result,
        "earned": earned_count,
        "total": len(ACHIEVEMENTS),
        "newly_unlocked": newly_unlocked,
    }


@router.get("/achievements/analytics")
async def get_analytics(user=Depends(get_current_user)):
    """Get practice analytics: trends, coherence history, most-used features."""
    user_id = user["id"]
    now = datetime.now(timezone.utc)

    # Coherence history (last 30 days)
    history = await db.coherence_history.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("date", -1).to_list(30)

    # Daily activity over last 14 days
    daily_activity = []
    for d in range(13, -1, -1):
        day = (now - timedelta(days=d)).strftime("%Y-%m-%d")
        moods = await db.mood_logs.count_documents({"user_id": user_id, "timestamp": {"$regex": f"^{day}"}})
        journals = await db.journals.count_documents({"user_id": user_id, "created_at": {"$regex": f"^{day}"}})
        meds = await db.meditation_sessions.count_documents({"user_id": user_id, "created_at": {"$regex": f"^{day}"}})
        breaths = await db.breath_sessions.count_documents({"user_id": user_id, "created_at": {"$regex": f"^{day}"}})
        daily_activity.append({
            "date": day, "moods": moods, "journals": journals,
            "meditations": meds, "breathwork": breaths,
            "total": moods + journals + meds + breaths,
        })

    # Feature usage totals
    total_moods = await db.mood_logs.count_documents({"user_id": user_id})
    total_journals = await db.journals.count_documents({"user_id": user_id})
    total_meds = await db.meditation_sessions.count_documents({"user_id": user_id})
    total_breaths = await db.breath_sessions.count_documents({"user_id": user_id})
    total_forecasts = await db.forecasts.count_documents({"user_id": user_id})
    total_coach = await db.coach_sessions.count_documents({"user_id": user_id})

    feature_usage = [
        {"name": "Mood Tracking", "count": total_moods, "color": "#FDA4AF", "icon": "heart"},
        {"name": "Journaling", "count": total_journals, "color": "#86EFAC", "icon": "book-open"},
        {"name": "Meditation", "count": total_meds, "color": "#C084FC", "icon": "timer"},
        {"name": "Breathwork", "count": total_breaths, "color": "#2DD4BF", "icon": "wind"},
        {"name": "Divination", "count": total_forecasts, "color": "#E879F9", "icon": "star"},
        {"name": "Sage Coach", "count": total_coach, "color": "#38BDF8", "icon": "message-circle"},
    ]
    feature_usage.sort(key=lambda x: -x["count"])

    # Streak info
    streak_doc = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})

    return {
        "coherence_history": history,
        "daily_activity": daily_activity,
        "feature_usage": feature_usage,
        "streak": {
            "current": streak_doc.get("current_streak", 0) if streak_doc else 0,
            "longest": streak_doc.get("longest_streak", 0) if streak_doc else 0,
            "total_days": streak_doc.get("total_active_days", 0) if streak_doc else 0,
        },
        "totals": {
            "all_sessions": total_moods + total_journals + total_meds + total_breaths,
            "all_divinations": total_forecasts,
            "all_coaching": total_coach,
        },
    }


@router.post("/achievements/record-coherence")
async def record_coherence(user=Depends(get_current_user)):
    """Record today's coherence score for historical tracking."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    stats = await compute_user_stats(user["id"])
    coherence = stats["coherence"]

    await db.coherence_history.update_one(
        {"user_id": user["id"], "date": today},
        {"$set": {
            "user_id": user["id"], "date": today, "score": coherence,
            "breakdown": {"variety": stats["variety"], "streak": stats["streak"]},
        }},
        upsert=True,
    )
    return {"date": today, "score": coherence}

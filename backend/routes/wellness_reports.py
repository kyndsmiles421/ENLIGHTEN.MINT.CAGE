from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()


@router.get("/wellness-reports/weekly")
async def weekly_report(user=Depends(get_current_user)):
    uid = user["id"]
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    moods = await db.moods.find({"user_id": uid, "created_at": {"$gte": week_ago}}, {"_id": 0}).to_list(100)
    journals = await db.journal.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    meditations = await db.custom_meditations.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    yoga_count = await db.yoga_sessions.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    meals = await db.meal_logs.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    dreams = await db.dreams.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    reiki_count = await db.reiki_sessions.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    acupressure_count = await db.acupressure_sessions.count_documents({"user_id": uid, "created_at": {"$gte": week_ago}})
    rituals = await db.daily_rituals.find({"user_id": uid, "completed": True, "created_at": {"$gte": week_ago}}, {"_id": 0}).to_list(50)

    mood_counts = {}
    total_intensity = 0
    for m in moods:
        mood_counts[m.get("mood", "neutral")] = mood_counts.get(m.get("mood", "neutral"), 0) + 1
        total_intensity += m.get("intensity", 5)
    dominant_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"
    avg_intensity = round(total_intensity / len(moods), 1) if moods else 5.0

    streak_doc = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    total_activities = journals + meditations + yoga_count + meals + dreams + reiki_count + acupressure_count + len(rituals)

    return {
        "period": "weekly",
        "start": week_ago,
        "end": now.isoformat(),
        "summary": {
            "total_activities": total_activities,
            "mood_entries": len(moods),
            "dominant_mood": dominant_mood,
            "avg_intensity": avg_intensity,
            "mood_breakdown": mood_counts,
            "current_streak": streak,
        },
        "activities": {
            "journals": journals,
            "meditations": meditations,
            "yoga_sessions": yoga_count,
            "meals_logged": meals,
            "dreams_logged": dreams,
            "reiki_sessions": reiki_count,
            "acupressure_sessions": acupressure_count,
            "rituals_completed": len(rituals),
        },
        "insights": _generate_insights(dominant_mood, total_activities, mood_counts, streak),
    }


@router.get("/wellness-reports/monthly")
async def monthly_report(user=Depends(get_current_user)):
    uid = user["id"]
    now = datetime.now(timezone.utc)
    month_ago = (now - timedelta(days=30)).isoformat()

    moods = await db.moods.find({"user_id": uid, "created_at": {"$gte": month_ago}}, {"_id": 0}).to_list(500)
    journals = await db.journal.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    meditations = await db.custom_meditations.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    yoga_count = await db.yoga_sessions.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    meals = await db.meal_logs.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    dreams = await db.dreams.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    reiki_count = await db.reiki_sessions.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    acupressure_count = await db.acupressure_sessions.count_documents({"user_id": uid, "created_at": {"$gte": month_ago}})
    rituals = await db.daily_rituals.find({"user_id": uid, "completed": True, "created_at": {"$gte": month_ago}}, {"_id": 0}).to_list(100)

    mood_counts = {}
    total_intensity = 0
    for m in moods:
        mood_counts[m.get("mood", "neutral")] = mood_counts.get(m.get("mood", "neutral"), 0) + 1
        total_intensity += m.get("intensity", 5)
    dominant_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"
    avg_intensity = round(total_intensity / len(moods), 1) if moods else 5.0

    streak_doc = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0
    total_activities = journals + meditations + yoga_count + meals + dreams + reiki_count + acupressure_count + len(rituals)

    return {
        "period": "monthly",
        "start": month_ago,
        "end": now.isoformat(),
        "summary": {
            "total_activities": total_activities,
            "mood_entries": len(moods),
            "dominant_mood": dominant_mood,
            "avg_intensity": avg_intensity,
            "mood_breakdown": mood_counts,
            "current_streak": streak,
        },
        "activities": {
            "journals": journals,
            "meditations": meditations,
            "yoga_sessions": yoga_count,
            "meals_logged": meals,
            "dreams_logged": dreams,
            "reiki_sessions": reiki_count,
            "acupressure_sessions": acupressure_count,
            "rituals_completed": len(rituals),
        },
        "insights": _generate_insights(dominant_mood, total_activities, mood_counts, streak),
    }


def _generate_insights(dominant_mood, total_activities, mood_counts, streak):
    insights = []
    if total_activities > 20:
        insights.append({"type": "achievement", "text": "Highly active! You're deeply committed to your practice.", "color": "#22C55E"})
    elif total_activities > 5:
        insights.append({"type": "progress", "text": "Good momentum. Keep building your daily rhythm.", "color": "#3B82F6"})
    else:
        insights.append({"type": "encouragement", "text": "Every small step matters. Try adding one practice daily.", "color": "#FCD34D"})

    if streak >= 7:
        insights.append({"type": "streak", "text": f"Impressive {streak}-day streak! Consistency is the key to transformation.", "color": "#D8B4FE"})

    mood_tips = {
        "stressed": "Consider adding more breathwork and acupressure to your routine.",
        "anxious": "Meditation and reiki can powerfully calm the nervous system.",
        "sad": "Heart-opening yoga and journaling can help process emotions.",
        "happy": "Beautiful energy! Share your light through community posts.",
        "peaceful": "You're in flow. Deepen your practice with longer meditations.",
        "tired": "Focus on nourishing elixirs and restorative yoga this week.",
    }
    if dominant_mood in mood_tips:
        insights.append({"type": "mood_guidance", "text": mood_tips[dominant_mood], "color": "#818CF8"})

    return insights

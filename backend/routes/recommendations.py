from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
import asyncio

# ========== RECOMMENDATION ENGINE ==========

TOOL_CATALOG = [
    {"id": "breathing", "name": "Breathing Exercises", "path": "/breathing", "category": "body", "icon": "wind",
     "color": "#2DD4BF", "desc": "Calm your nervous system with guided breathwork patterns."},
    {"id": "meditation", "name": "Meditation", "path": "/meditation", "category": "mind", "icon": "timer",
     "color": "#D8B4FE", "desc": "Still the mind through guided or silent meditation."},
    {"id": "affirmations", "name": "Affirmations", "path": "/affirmations", "category": "mind", "icon": "sun",
     "color": "#FCD34D", "desc": "Reprogram your mindset with positive affirmations."},
    {"id": "journal", "name": "Journaling", "path": "/journal", "category": "mind", "icon": "book-open",
     "color": "#86EFAC", "desc": "Reflect and process your thoughts through writing."},
    {"id": "mood", "name": "Mood Tracking", "path": "/mood", "category": "awareness", "icon": "heart",
     "color": "#FDA4AF", "desc": "Track your emotional patterns for deeper self-awareness."},
    {"id": "soundscapes", "name": "Soundscapes", "path": "/soundscapes", "category": "senses", "icon": "headphones",
     "color": "#3B82F6", "desc": "Immerse in layered ambient soundscapes for focus or relaxation."},
    {"id": "frequencies", "name": "Frequencies", "path": "/frequencies", "category": "senses", "icon": "radio",
     "color": "#8B5CF6", "desc": "Explore resonant solfeggio and binaural frequencies."},
    {"id": "zen-garden", "name": "Zen Garden", "path": "/zen-garden", "category": "decompression", "icon": "sprout",
     "color": "#22C55E", "desc": "Nurture plants, draw in sand, or release lanterns."},
    {"id": "light-therapy", "name": "Light Resonance", "path": "/light-therapy", "category": "senses", "icon": "lightbulb",
     "color": "#A855F7", "desc": "Attune with chromatic resonance colors aligned to your chakras."},
    {"id": "mudras", "name": "Mudras", "path": "/mudras", "category": "body", "icon": "hand",
     "color": "#FDA4AF", "desc": "Practice sacred hand gestures for energy flow."},
    {"id": "mantras", "name": "Mantras", "path": "/mantras", "category": "spirit", "icon": "music",
     "color": "#FB923C", "desc": "Chant sacred mantras for deep vibrational resonance."},
    {"id": "hooponopono", "name": "Ho'oponopono", "path": "/hooponopono", "category": "spirit", "icon": "heart-handshake",
     "color": "#E879F9", "desc": "Practice the Hawaiian art of forgiveness and reconciliation."},
    {"id": "exercises", "name": "Exercises", "path": "/exercises", "category": "body", "icon": "zap",
     "color": "#FB923C", "desc": "Move your body with Qigong and Tai Chi."},
    {"id": "rituals", "name": "Daily Rituals", "path": "/rituals", "category": "practice", "icon": "sunrise",
     "color": "#FCD34D", "desc": "Build consistent daily wellness routines."},
    {"id": "journey", "name": "Beginner's Journey", "path": "/journey", "category": "learning", "icon": "map",
     "color": "#2DD4BF", "desc": "Follow the guided pathway through all wellness tools."},
    {"id": "learning", "name": "Advanced Learning", "path": "/learn", "category": "learning", "icon": "graduation-cap",
     "color": "#E879F9", "desc": "Deepen your practice with progressive advanced modules."},
]

MOOD_TOOL_MAP = {
    "stressed": ["breathing", "zen-garden", "soundscapes", "meditation"],
    "anxious": ["breathing", "meditation", "hooponopono", "frequencies"],
    "sad": ["affirmations", "light-therapy", "mantras", "journal"],
    "angry": ["breathing", "hooponopono", "zen-garden", "exercises"],
    "happy": ["meditation", "mantras", "journal", "rituals"],
    "peaceful": ["meditation", "frequencies", "mudras", "mantras"],
    "tired": ["exercises", "frequencies", "light-therapy", "breathing"],
    "grateful": ["journal", "mantras", "meditation", "affirmations"],
    "confused": ["journal", "meditation", "mudras", "affirmations"],
    "neutral": ["mood", "breathing", "soundscapes", "journey"],
}

# Map moods to specific resonant frequencies
MOOD_FREQUENCY_MAP = {
    "stressed": {"hz": 396, "label": "396 Hz — Liberation from Stress"},
    "anxious": {"hz": 417, "label": "417 Hz — Dissolving Anxiety"},
    "sad": {"hz": 639, "label": "639 Hz — Heart Connection & Joy"},
    "angry": {"hz": 174, "label": "174 Hz — Foundation & Pain Relief"},
    "happy": {"hz": 528, "label": "528 Hz — Love & Celebration"},
    "peaceful": {"hz": 432, "label": "432 Hz — Universal Harmony"},
    "tired": {"hz": 852, "label": "852 Hz — Spiritual Awakening"},
    "grateful": {"hz": 963, "label": "963 Hz — Divine Connection"},
    "confused": {"hz": 741, "label": "741 Hz — Intuition & Clarity"},
    "neutral": {"hz": 432, "label": "432 Hz — Universal Harmony"},
}

TIME_OF_DAY_TOOLS = {
    "morning": ["breathing", "affirmations", "rituals", "exercises", "meditation"],
    "afternoon": ["frequencies", "light-therapy", "mudras", "soundscapes", "journal"],
    "evening": ["zen-garden", "meditation", "hooponopono", "mantras", "journal"],
    "night": ["soundscapes", "frequencies", "meditation", "zen-garden", "light-therapy"],
}

@router.get("/recommendations")
async def get_recommendations(user=Depends(get_current_user)):
    uid = user["id"]
    now = datetime.now(timezone.utc)
    hour = now.hour

    # Gather user activity data concurrently
    mood_count, journal_count, recent_moods, journey_doc, challenge_parts, ritual_count, plants_count = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(5),
        db.journey_progress.find_one({"user_id": uid}, {"_id": 0}),
        db.challenge_participants.count_documents({"user_id": uid}),
        db.ritual_completions.count_documents({"user_id": uid}),
        db.zen_plants.count_documents({"user_id": uid}),
    )

    recommendations = []
    used_ids = set()

    # Determine time period
    if 5 <= hour < 12:
        time_period = "morning"
    elif 12 <= hour < 17:
        time_period = "afternoon"
    elif 17 <= hour < 21:
        time_period = "evening"
    else:
        time_period = "night"

    # 1. Mood-based recommendations
    latest_mood = None
    if recent_moods:
        latest_mood = recent_moods[0].get("mood", "neutral").lower()
        suggested_tools = MOOD_TOOL_MAP.get(latest_mood, MOOD_TOOL_MAP["neutral"])

        # Add a direct "play frequency" recommendation first
        mood_freq = MOOD_FREQUENCY_MAP.get(latest_mood)
        if mood_freq and "play_frequency" not in used_ids:
            recommendations.append({
                "id": "play_frequency",
                "name": mood_freq["label"],
                "path": "/cosmic-mixer",
                "category": "frequency",
                "icon": "radio",
                "color": "#8B5CF6",
                "desc": f"Tap to instantly play the healing frequency for your {latest_mood} mood",
                "reason": f"Tuned to your {latest_mood} energy",
                "priority": "high",
                "source": "mood_frequency",
                "action": "play_frequency",
                "frequency_hz": mood_freq["hz"],
            })
            used_ids.add("play_frequency")

        for tool_id in suggested_tools[:2]:
            if tool_id not in used_ids:
                tool = next((t for t in TOOL_CATALOG if t["id"] == tool_id), None)
                if tool:
                    rec_entry = {
                        **tool,
                        "reason": f"Based on your recent {latest_mood} mood",
                        "priority": "high",
                        "source": "mood_analysis",
                    }
                    # If it's the frequencies tool, attach the mood frequency for instant play
                    if tool_id == "frequencies" and mood_freq:
                        rec_entry["action"] = "play_frequency"
                        rec_entry["frequency_hz"] = mood_freq["hz"]
                        rec_entry["path"] = "/cosmic-mixer"
                        rec_entry["desc"] = f"Play {mood_freq['label']} for your {latest_mood} mood"
                    recommendations.append(rec_entry)
                    used_ids.add(tool_id)
    else:
        # No mood data — suggest tracking
        tool = next((t for t in TOOL_CATALOG if t["id"] == "mood"), None)
        if tool:
            recommendations.append({
                **tool,
                "reason": "Start tracking your moods for personalized insights",
                "priority": "high",
                "source": "onboarding",
            })
            used_ids.add("mood")

    # 2. Journey-based recommendation
    journey_lessons = journey_doc.get("completed_lessons", []) if journey_doc else []
    if len(journey_lessons) == 0:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journey"), None)
        if tool and "journey" not in used_ids:
            recommendations.append({
                **tool,
                "reason": "Begin your guided wellness pathway",
                "priority": "high",
                "source": "journey",
            })
            used_ids.add("journey")
    elif len(journey_lessons) < 20:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journey"), None)
        if tool and "journey" not in used_ids:
            recommendations.append({
                **tool,
                "reason": f"Continue your journey — {len(journey_lessons)}/20 lessons done",
                "priority": "medium",
                "source": "journey",
            })
            used_ids.add("journey")
    else:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "learning"), None)
        if tool and "learning" not in used_ids:
            recommendations.append({
                **tool,
                "reason": "Journey complete! Take your practice deeper",
                "priority": "medium",
                "source": "journey_complete",
            })
            used_ids.add("learning")

    # 3. Time-of-day recommendations
    time_tools = TIME_OF_DAY_TOOLS.get(time_period, [])
    for tool_id in time_tools:
        if tool_id not in used_ids and len(recommendations) < 5:
            tool = next((t for t in TOOL_CATALOG if t["id"] == tool_id), None)
            if tool:
                time_labels = {"morning": "Perfect for morning practice", "afternoon": "Great for an afternoon reset",
                               "evening": "Wind down this evening", "night": "Ideal for late-night calm"}
                rec_entry = {
                    **tool,
                    "reason": time_labels.get(time_period, "Recommended for now"),
                    "priority": "medium",
                    "source": "time_of_day",
                }
                # Attach frequency action for frequency recommendations
                if tool_id == "frequencies":
                    mood_freq = MOOD_FREQUENCY_MAP.get(latest_mood or "neutral", MOOD_FREQUENCY_MAP["neutral"])
                    rec_entry["action"] = "play_frequency"
                    rec_entry["frequency_hz"] = mood_freq["hz"]
                    rec_entry["path"] = "/cosmic-mixer"
                    rec_entry["desc"] = f"Play {mood_freq['label']} — {time_labels.get(time_period, '')}"
                recommendations.append(rec_entry)
                used_ids.add(tool_id)

    # 4. Engagement nudges
    if journal_count == 0 and "journal" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "journal"), None)
        if tool:
            recommendations.append({**tool, "reason": "Start journaling to deepen your self-awareness", "priority": "medium", "source": "engagement"})
            used_ids.add("journal")

    if plants_count == 0 and "zen-garden" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "zen-garden"), None)
        if tool:
            recommendations.append({**tool, "reason": "Plant your first seed in the Zen Garden", "priority": "low", "source": "engagement"})
            used_ids.add("zen-garden")

    if ritual_count == 0 and "rituals" not in used_ids and len(recommendations) < 6:
        tool = next((t for t in TOOL_CATALOG if t["id"] == "rituals"), None)
        if tool:
            recommendations.append({**tool, "reason": "Build a consistent daily routine", "priority": "low", "source": "engagement"})
            used_ids.add("rituals")

    # Cap at 6 recommendations
    recommendations = recommendations[:6]

    return {
        "recommendations": recommendations,
        "time_period": time_period,
        "mood_count": mood_count,
        "journal_count": journal_count,
        "journey_progress": len(journey_lessons),
        "engagement_score": min(100, mood_count * 5 + journal_count * 5 + len(journey_lessons) * 3 + challenge_parts * 10 + ritual_count * 4 + plants_count * 3),
    }




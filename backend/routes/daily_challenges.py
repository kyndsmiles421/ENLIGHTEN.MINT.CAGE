from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from deps import create_activity
import random

# ========== DAILY CHALLENGES ==========

CHALLENGE_POOL = [
    {"id": "breathe-4-7-8", "category": "breathing", "title": "4-7-8 Breath", "description": "Practice the 4-7-8 breathing technique for 5 minutes. Inhale 4s, hold 7s, exhale 8s.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "morning-meditation", "category": "meditation", "title": "Morning Stillness", "description": "Start your day with a 10-minute silent meditation. Focus only on your breath.", "duration": 10, "xp": 75, "difficulty": "intermediate"},
    {"id": "gratitude-3", "category": "journaling", "title": "Gratitude Triple", "description": "Write down 3 things you're grateful for today in your journal.", "duration": 5, "xp": 40, "difficulty": "beginner"},
    {"id": "body-scan", "category": "meditation", "title": "Full Body Scan", "description": "Do a 15-minute progressive body scan relaxation, from toes to crown.", "duration": 15, "xp": 80, "difficulty": "intermediate"},
    {"id": "cold-splash", "category": "physical", "title": "Cold Water Reset", "description": "Splash cold water on your face 3 times. Notice the sensation and your breath.", "duration": 2, "xp": 30, "difficulty": "beginner"},
    {"id": "mindful-walk", "category": "movement", "title": "Mindful Walking", "description": "Take a 20-minute walk with no phone. Notice 5 things you see, 4 you hear, 3 you feel.", "duration": 20, "xp": 90, "difficulty": "intermediate"},
    {"id": "digital-sunset", "category": "mindfulness", "title": "Digital Sunset", "description": "Put away all screens 1 hour before bed tonight. Read, stretch, or simply sit.", "duration": 60, "xp": 100, "difficulty": "advanced"},
    {"id": "heart-coherence", "category": "breathing", "title": "Heart Coherence", "description": "Breathe at 5 breaths per minute for 5 minutes while focusing on your heart area.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "kind-message", "category": "social", "title": "Cosmic Kindness", "description": "Send an encouraging message to someone on the platform. Spread the light.", "duration": 3, "xp": 60, "difficulty": "beginner"},
    {"id": "sound-bath", "category": "sounds", "title": "Sound Immersion", "description": "Listen to a healing frequency soundscape for 10 minutes with eyes closed.", "duration": 10, "xp": 70, "difficulty": "beginner"},
    {"id": "mantra-108", "category": "spiritual", "title": "Mantra 108", "description": "Chant or silently repeat a mantra 108 times. Use your breath as the anchor.", "duration": 15, "xp": 85, "difficulty": "intermediate"},
    {"id": "stretch-flow", "category": "movement", "title": "Morning Flow", "description": "Do 10 minutes of gentle stretching. Focus on spine, hips, and shoulders.", "duration": 10, "xp": 65, "difficulty": "beginner"},
    {"id": "emotion-journal", "category": "journaling", "title": "Emotion Archaeology", "description": "Write about one emotion you felt strongly today. Where did it live in your body?", "duration": 10, "xp": 55, "difficulty": "intermediate"},
    {"id": "sunset-gaze", "category": "mindfulness", "title": "Sky Gazing", "description": "Spend 5 minutes watching the sky — clouds, light, colors. Just observe.", "duration": 5, "xp": 40, "difficulty": "beginner"},
    {"id": "alternate-nostril", "category": "breathing", "title": "Nadi Shodhana", "description": "Practice alternate nostril breathing for 5 minutes to balance your energy.", "duration": 5, "xp": 55, "difficulty": "intermediate"},
    {"id": "loving-kindness", "category": "meditation", "title": "Loving Kindness", "description": "Send loving-kindness to yourself, a loved one, a stranger, and someone difficult.", "duration": 10, "xp": 75, "difficulty": "intermediate"},
    {"id": "earthing", "category": "physical", "title": "Grounding Touch", "description": "Stand barefoot on natural ground for 5 minutes. Feel the Earth beneath you.", "duration": 5, "xp": 45, "difficulty": "beginner"},
    {"id": "vision-board", "category": "mindfulness", "title": "Micro Vision", "description": "Close your eyes and vividly visualize your ideal tomorrow for 5 minutes.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "water-ritual", "category": "physical", "title": "Hydration Ritual", "description": "Drink a full glass of water slowly and mindfully. Set an intention with each sip.", "duration": 3, "xp": 25, "difficulty": "beginner"},
    {"id": "zen-garden-5", "category": "mindfulness", "title": "Zen Garden Session", "description": "Spend 5 minutes in the Zen Garden. Rake sand, feed koi, or watch lanterns.", "duration": 5, "xp": 45, "difficulty": "beginner"},
    {"id": "deep-listen", "category": "social", "title": "Deep Listening", "description": "Have a conversation where you only listen. Don't plan responses — just receive.", "duration": 10, "xp": 70, "difficulty": "intermediate"},
    {"id": "moonlight-meditation", "category": "meditation", "title": "Lunar Meditation", "description": "Meditate for 10 minutes imagining silver moonlight filling your body.", "duration": 10, "xp": 70, "difficulty": "intermediate"},
    {"id": "affirmation-mirror", "category": "spiritual", "title": "Mirror Affirmations", "description": "Look in the mirror and say 5 affirmations to yourself with conviction.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "chakra-breathe", "category": "breathing", "title": "Chakra Breathing", "description": "Breathe into each of your 7 chakras for 1 minute each, bottom to top.", "duration": 7, "xp": 60, "difficulty": "intermediate"},
    {"id": "news-fast", "category": "mindfulness", "title": "Information Fast", "description": "Avoid all news and social media for the rest of the day. Notice how you feel.", "duration": 0, "xp": 100, "difficulty": "advanced"},
    {"id": "creative-express", "category": "journaling", "title": "Creative Expression", "description": "Draw, doodle, or write a poem. No judgment. Express what's inside you.", "duration": 10, "xp": 55, "difficulty": "beginner"},
    {"id": "eye-palming", "category": "physical", "title": "Eye Palming", "description": "Rub your palms together, then gently cup them over your closed eyes for 3 minutes.", "duration": 3, "xp": 30, "difficulty": "beginner"},
    {"id": "share-wellness", "category": "social", "title": "Wellness Ambassador", "description": "Share a wellness tip or your favorite tool from the app with someone.", "duration": 5, "xp": 55, "difficulty": "beginner"},
    {"id": "box-breathing", "category": "breathing", "title": "Box Breathing", "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat for 5 minutes.", "duration": 5, "xp": 50, "difficulty": "beginner"},
    {"id": "power-nap", "category": "physical", "title": "Conscious Rest", "description": "Lie down for 20 minutes. Don't sleep — just rest with awareness.", "duration": 20, "xp": 80, "difficulty": "intermediate"},
]

CATEGORY_COLORS = {
    "breathing": "#2DD4BF",
    "meditation": "#D8B4FE",
    "journaling": "#FCD34D",
    "physical": "#FB923C",
    "movement": "#22C55E",
    "mindfulness": "#3B82F6",
    "social": "#FDA4AF",
    "spiritual": "#C084FC",
    "sounds": "#06B6D4",
}

def _get_daily_challenge_index():
    """Deterministic daily rotation through the pool."""
    from datetime import date
    day_num = (date.today() - date(2025, 1, 1)).days
    return day_num % len(CHALLENGE_POOL)


@router.get("/daily-challenge")
async def get_daily_challenge(user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idx = _get_daily_challenge_index()
    challenge = {**CHALLENGE_POOL[idx]}
    challenge["color"] = CATEGORY_COLORS.get(challenge["category"], "#D8B4FE")
    challenge["date"] = today

    completion = await db.challenge_completions.find_one(
        {"user_id": user["id"], "challenge_id": challenge["id"], "date": today},
        {"_id": 0}
    )
    challenge["completed"] = bool(completion)
    challenge["completed_at"] = completion.get("completed_at") if completion else None

    stats = await db.challenge_completions.count_documents({"user_id": user["id"]})
    streak_data = await db.streaks.find_one({"user_id": user["id"]}, {"_id": 0})

    return {
        "challenge": challenge,
        "stats": {
            "total_completed": stats,
            "current_streak": streak_data.get("current_streak", 0) if streak_data else 0,
        }
    }


@router.post("/daily-challenge/complete")
async def complete_daily_challenge(user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idx = _get_daily_challenge_index()
    challenge = CHALLENGE_POOL[idx]

    existing = await db.challenge_completions.find_one(
        {"user_id": user["id"], "challenge_id": challenge["id"], "date": today},
        {"_id": 0}
    )
    if existing:
        return {"status": "already_completed", "message": "Challenge already completed today"}

    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "challenge_id": challenge["id"],
        "challenge_title": challenge["title"],
        "category": challenge["category"],
        "xp_earned": challenge["xp"],
        "date": today,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.challenge_completions.insert_one(doc)

    await create_activity(
        user["id"],
        "challenge_complete",
        f"completed the daily challenge: {challenge['title']}",
        {"challenge_id": challenge["id"], "xp": challenge["xp"]}
    )

    total = await db.challenge_completions.count_documents({"user_id": user["id"]})
    return {
        "status": "completed",
        "message": f"Challenge complete! +{challenge['xp']} XP",
        "xp_earned": challenge["xp"],
        "total_completed": total,
    }


@router.get("/daily-challenge/history")
async def get_challenge_history(limit: int = 14, user=Depends(get_current_user)):
    completions = await db.challenge_completions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(limit)
    total_xp = sum(c.get("xp_earned", 0) for c in completions)
    total = await db.challenge_completions.count_documents({"user_id": user["id"]})
    return {"history": completions, "total_xp": total_xp, "total_completed": total}


@router.get("/daily-challenge/leaderboard")
async def get_challenge_leaderboard(user=Depends(get_current_user)):
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "total_xp": {"$sum": "$xp_earned"},
            "total_completed": {"$sum": 1},
        }},
        {"$sort": {"total_xp": -1}},
        {"$limit": 20},
    ]
    leaders = await db.challenge_completions.aggregate(pipeline).to_list(20)
    result = []
    for i, l in enumerate(leaders):
        user_doc = await db.users.find_one({"id": l["_id"]}, {"_id": 0, "password": 0, "email": 0})
        profile = await db.profiles.find_one({"user_id": l["_id"]}, {"_id": 0}) or {}
        result.append({
            "rank": i + 1,
            "user_id": l["_id"],
            "display_name": profile.get("display_name") or (user_doc.get("name", "") if user_doc else ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "total_xp": l["total_xp"],
            "total_completed": l["total_completed"],
            "is_me": l["_id"] == user["id"],
        })
    return {"leaderboard": result}




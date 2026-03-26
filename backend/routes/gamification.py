from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from deps import create_activity
from pydantic import BaseModel
from typing import Optional
import random

# ========== WAITLIST ==========

class WaitlistEntry(BaseModel):
    email: str
    name: Optional[str] = None

@router.post("/waitlist/join")
async def join_waitlist(entry: WaitlistEntry):
    existing = await db.waitlist.find_one({"email": entry.email}, {"_id": 0})
    if existing:
        return {"status": "already_joined", "message": "You're already on the list!"}
    doc = {
        "id": str(uuid.uuid4()),
        "email": entry.email,
        "name": entry.name or "",
        "joined_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.waitlist.insert_one(doc)
    count = await db.waitlist.count_documents({})
    return {"status": "joined", "message": "Welcome to the Founding 100!", "position": count}

@router.get("/waitlist/count")
async def get_waitlist_count():
    count = await db.waitlist.count_documents({})
    return {"count": count}

# ========== QUICK RESET ==========

QUICK_RESET_FLOWS = {
    "happy": {
        "label": "Happy",
        "frequency": {"name": "528 Hz — Love Frequency", "hz": 528, "path": "/frequencies", "desc": "Amplify your joy with the universal frequency of love and harmony"},
        "tool": {"name": "Gratitude Meditation", "path": "/meditation", "desc": "Deepen your happiness through mindful appreciation"},
        "nourishment": {"name": "Cacao Ceremony Drink", "desc": "Raw cacao releases endorphins and amplifies bliss naturally"},
    },
    "curious": {
        "label": "Curious",
        "frequency": {"name": "852 Hz — Spiritual Order", "hz": 852, "path": "/frequencies", "desc": "Open your Third Eye and deepen intuitive insight"},
        "tool": {"name": "Oracle Divination", "path": "/oracle", "desc": "Explore tarot, I Ching, or astrology for cosmic guidance"},
        "nourishment": {"name": "Mushroom Elixir", "desc": "Lion's Mane for cognition, Reishi for grounded exploration"},
    },
    "peaceful": {
        "label": "Peaceful",
        "frequency": {"name": "963 Hz — Divine Connection", "hz": 963, "path": "/frequencies", "desc": "The highest solfeggio tone — connect with universal consciousness"},
        "tool": {"name": "Silent Meditation", "path": "/meditation", "desc": "Ride the wave of calm into deeper stillness"},
        "nourishment": {"name": "Ceremonial Matcha", "desc": "L-theanine sustains your calm with gentle alertness"},
    },
    "energized": {
        "label": "Energized",
        "frequency": {"name": "417 Hz — Change", "hz": 417, "path": "/frequencies", "desc": "Channel your energy into transformation and forward momentum"},
        "tool": {"name": "Qigong Flow", "path": "/exercises", "desc": "Move your energy with ancient body cultivation techniques"},
        "nourishment": {"name": "Prana Smoothie", "desc": "Spirulina + moringa + wheatgrass: concentrated life force"},
    },
    "grateful": {
        "label": "Grateful",
        "frequency": {"name": "639 Hz — Connection", "hz": 639, "path": "/frequencies", "desc": "Harmonize relationships and radiate your gratitude outward"},
        "tool": {"name": "Journaling", "path": "/journal", "desc": "Capture this feeling — your future self will thank you"},
        "nourishment": {"name": "Golden Milk", "desc": "A warm ritual to honor the moment with nourishing intention"},
    },
    "stressed": {
        "label": "Stressed",
        "frequency": {"name": "396 Hz — Liberation", "hz": 396, "path": "/frequencies", "desc": "Release guilt, fear, and tension from your body"},
        "tool": {"name": "4-7-8 Breathing", "path": "/breathing", "desc": "The Navy SEAL technique for instant calm"},
        "nourishment": {"name": "Golden Milk", "desc": "Anti-inflammatory turmeric latte for deep nervous system calm"},
    },
    "anxious": {
        "label": "Anxious",
        "frequency": {"name": "528 Hz — Transformation", "hz": 528, "path": "/frequencies", "desc": "The 'Love frequency' — repairs DNA and calms the mind"},
        "tool": {"name": "Box Breathing", "path": "/breathing", "desc": "4-4-4-4 cadence used by elite performers to reset"},
        "nourishment": {"name": "Ceremonial Matcha", "desc": "L-theanine promotes calm alertness without the jitters"},
    },
    "tired": {
        "label": "Low Energy",
        "frequency": {"name": "417 Hz — Change", "hz": 417, "path": "/frequencies", "desc": "Undoes stagnation and facilitates change in your energy field"},
        "tool": {"name": "Energizing Breath", "path": "/breathing", "desc": "Fast-paced Kapalabhati breathwork to ignite your fire"},
        "nourishment": {"name": "Prana Smoothie", "desc": "Spirulina + moringa + wheatgrass: concentrated life force"},
    },
    "sad": {
        "label": "Down / Sad",
        "frequency": {"name": "639 Hz — Connection", "hz": 639, "path": "/frequencies", "desc": "Harmonize relationships and re-open the heart chakra"},
        "tool": {"name": "Loving Kindness Meditation", "path": "/meditation", "desc": "Metta practice to cultivate warmth and self-compassion"},
        "nourishment": {"name": "Cacao Ceremony Drink", "desc": "Raw cacao opens the heart and releases endorphins"},
    },
    "unfocused": {
        "label": "Unfocused",
        "frequency": {"name": "741 Hz — Intuition", "hz": 741, "path": "/frequencies", "desc": "Awakens intuition and sharpens mental clarity"},
        "tool": {"name": "Breath Awareness Meditation", "path": "/meditation", "desc": "Single-point focus training for laser concentration"},
        "nourishment": {"name": "Mushroom Elixir", "desc": "Lion's Mane for cognition, Reishi for calm focus"},
    },
    "restless": {
        "label": "Restless / Can't Sleep",
        "frequency": {"name": "174 Hz — Foundation", "hz": 174, "path": "/frequencies", "desc": "The lowest solfeggio tone — sedative, pain-reducing, grounding"},
        "tool": {"name": "Body Scan Meditation", "path": "/meditation", "desc": "Progressive relaxation from head to toe for deep rest"},
        "nourishment": {"name": "Golden Milk", "desc": "Turmeric + warm milk = nature's sleep medicine"},
    },
}

@router.get("/quick-reset/{feeling}")
async def get_quick_reset(feeling: str):
    flow = QUICK_RESET_FLOWS.get(feeling)
    if not flow:
        raise HTTPException(status_code=404, detail="Unknown feeling. Try: stressed, anxious, tired, sad, unfocused, restless")
    return flow


# ========== DAILY STREAK ==========

@router.get("/streak")
async def get_streak(user=Depends(get_current_user)):
    uid = user["id"]
    doc = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
    if not doc:
        return {"current_streak": 0, "longest_streak": 0, "last_active": None, "total_active_days": 0}
    return {
        "current_streak": doc.get("current_streak", 0),
        "longest_streak": doc.get("longest_streak", 0),
        "last_active": doc.get("last_active"),
        "total_active_days": doc.get("total_active_days", 0),
    }

@router.post("/streak/checkin")
async def streak_checkin(user=Depends(get_current_user)):
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc = await db.streaks.find_one({"user_id": uid})
    if not doc:
        doc = {"user_id": uid, "current_streak": 1, "longest_streak": 1, "last_active": today, "total_active_days": 1, "active_dates": [today]}
        await db.streaks.insert_one(doc)
        return {"current_streak": 1, "longest_streak": 1, "last_active": today, "total_active_days": 1, "checked_in": True}

    last = doc.get("last_active", "")
    if last == today:
        return {"current_streak": doc["current_streak"], "longest_streak": doc["longest_streak"], "last_active": today, "total_active_days": doc.get("total_active_days", 1), "checked_in": False, "message": "Already checked in today"}

    # Calculate streak
    from datetime import timedelta
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    if last == yesterday:
        new_streak = doc.get("current_streak", 0) + 1
    else:
        new_streak = 1

    longest = max(doc.get("longest_streak", 0), new_streak)
    total = doc.get("total_active_days", 0) + 1
    active_dates = doc.get("active_dates", [])
    if today not in active_dates:
        active_dates.append(today)
        if len(active_dates) > 60:
            active_dates = active_dates[-60:]

    await db.streaks.update_one(
        {"user_id": uid},
        {"$set": {"current_streak": new_streak, "longest_streak": longest, "last_active": today, "total_active_days": total, "active_dates": active_dates}}
    )

    # Activity for milestones
    if new_streak in (3, 7, 14, 30, 60, 100):
        await create_activity(uid, "streak_milestone", f"reached a {new_streak}-day streak!", {"streak": new_streak})

    return {"current_streak": new_streak, "longest_streak": longest, "last_active": today, "total_active_days": total, "checked_in": True}


# ========== GAMES — SCORE TRACKING ==========

@router.post("/games/score")
async def save_game_score(data: dict, user=Depends(get_current_user)):
    game_id = data.get("game_id", "")
    score = data.get("score", 0)
    if not game_id:
        raise HTTPException(status_code=400, detail="game_id required")

    doc = {
        "user_id": user["id"],
        "game_id": game_id,
        "score": score,
        "played_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.game_scores.insert_one(doc)

    # Get best score
    pipeline = [
        {"$match": {"user_id": user["id"], "game_id": game_id}},
        {"$group": {"_id": None, "best": {"$max": "$score"}, "plays": {"$sum": 1}}},
    ]
    agg = await db.game_scores.aggregate(pipeline).to_list(1)
    best = agg[0]["best"] if agg else score
    plays = agg[0]["plays"] if agg else 1

    return {"game_id": game_id, "score": score, "best_score": best, "total_plays": plays}

@router.get("/games/scores")
async def get_game_scores(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {"_id": "$game_id", "best": {"$max": "$score"}, "plays": {"$sum": 1}, "last_played": {"$max": "$played_at"}}},
    ]
    results = await db.game_scores.aggregate(pipeline).to_list(20)
    scores = {}
    for r in results:
        scores[r["_id"]] = {"best_score": r["best"], "total_plays": r["plays"], "last_played": r["last_played"]}
    return {"scores": scores}





# ========== CELESTIAL BADGES ==========

CELESTIAL_BADGES = [
    {"id": "first_light", "name": "First Light", "icon": "star", "element": "universal",
     "description": "Explore your first constellation", "requirement": {"type": "constellations_explored", "count": 1}},
    {"id": "stargazer", "name": "Stargazer", "icon": "telescope", "element": "universal",
     "description": "Explore 5 different constellations", "requirement": {"type": "constellations_explored", "count": 5}},
    {"id": "constellation_collector", "name": "Constellation Collector", "icon": "globe", "element": "universal",
     "description": "Explore all 16 constellations", "requirement": {"type": "constellations_explored", "count": 16}},
    {"id": "story_seeker", "name": "Story Seeker", "icon": "book", "element": "universal",
     "description": "Listen to 3 constellation stories", "requirement": {"type": "stories_listened", "count": 3}},
    {"id": "myth_keeper", "name": "Myth Keeper", "icon": "scroll", "element": "universal",
     "description": "Listen to 10 constellation stories", "requirement": {"type": "stories_listened", "count": 10}},
    {"id": "orions_hunter", "name": "Orion's Hunter", "icon": "flame", "element": "Fire",
     "description": "Explore all Fire constellations", "requirement": {"type": "element_complete", "element": "Fire", "names": ["Aries", "Leo", "Sagittarius", "Orion"]}},
    {"id": "neptunes_child", "name": "Neptune's Child", "icon": "droplet", "element": "Water",
     "description": "Explore all Water constellations", "requirement": {"type": "element_complete", "element": "Water", "names": ["Cancer", "Scorpio", "Pisces", "Cygnus"]}},
    {"id": "gaias_guardian", "name": "Gaia's Guardian", "icon": "leaf", "element": "Earth",
     "description": "Explore all Earth constellations", "requirement": {"type": "element_complete", "element": "Earth", "names": ["Taurus", "Virgo", "Capricorn", "Ursa Major"]}},
    {"id": "zephyrs_voice", "name": "Zephyr's Voice", "icon": "wind", "element": "Air",
     "description": "Explore all Air constellations", "requirement": {"type": "element_complete", "element": "Air", "names": ["Gemini", "Libra", "Aquarius", "Lyra"]}},
    {"id": "lyras_musician", "name": "Lyra's Musician", "icon": "music", "element": "Air",
     "description": "Listen to all 16 constellation stories", "requirement": {"type": "stories_listened", "count": 16}},
    {"id": "cosmic_voyager", "name": "Cosmic Voyager", "icon": "rocket", "element": "universal",
     "description": "Complete a Stargazing Journey", "requirement": {"type": "journey_completed", "count": 1}},
    {"id": "celestial_master", "name": "Celestial Master", "icon": "crown", "element": "universal",
     "description": "Earn all other celestial badges", "requirement": {"type": "all_badges"}},
]

@router.get("/badges/celestial")
async def get_celestial_badges(user=Depends(get_current_user)):
    uid = user["id"]

    # Get user's star chart completions
    completions = []
    async for c in db.challenge_completions.find({"user_id": uid, "category": "star_chart"}, {"_id": 0}):
        completions.append(c)

    # Parse completions into stats
    explored_names = set()
    stories_names = set()
    journeys = 0
    for c in completions:
        cid = c.get("challenge_id", "")
        if "constellation_explored" in cid:
            name = cid.replace("star_constellation_explored_", "")
            if name:
                explored_names.add(name)
        elif "story_listened" in cid:
            name = cid.replace("star_story_listened_", "")
            if name:
                stories_names.add(name)
        elif "journey_completed" in cid:
            journeys += 1

    # Get already earned badges
    earned_docs = []
    async for b in db.celestial_badges.find({"user_id": uid}, {"_id": 0}):
        earned_docs.append(b)
    earned_ids = {b["badge_id"] for b in earned_docs}

    # Check each badge
    badges_result = []
    newly_earned = []
    non_master_ids = [b["id"] for b in CELESTIAL_BADGES if b["id"] != "celestial_master"]

    for badge in CELESTIAL_BADGES:
        req = badge["requirement"]
        earned = badge["id"] in earned_ids
        progress = 0
        target = 1

        if req["type"] == "constellations_explored":
            target = req["count"]
            progress = len(explored_names)
        elif req["type"] == "stories_listened":
            target = req["count"]
            progress = len(stories_names)
        elif req["type"] == "element_complete":
            target = len(req["names"])
            progress = len([n for n in req["names"] if n in explored_names])
        elif req["type"] == "journey_completed":
            target = req["count"]
            progress = journeys
        elif req["type"] == "all_badges":
            target = len(non_master_ids)
            progress = len([bid for bid in non_master_ids if bid in earned_ids])

        # Check if newly earned
        is_complete = progress >= target
        if is_complete and not earned:
            earned = True
            newly_earned.append(badge)
            await db.celestial_badges.insert_one({
                "user_id": uid,
                "badge_id": badge["id"],
                "badge_name": badge["name"],
                "earned_at": datetime.now(timezone.utc).isoformat(),
            })
            await create_activity(uid, "badge_earned", f"earned the '{badge['name']}' celestial badge!", {"badge_id": badge["id"], "badge_name": badge["name"]})

        badges_result.append({
            "id": badge["id"],
            "name": badge["name"],
            "icon": badge["icon"],
            "element": badge["element"],
            "description": badge["description"],
            "earned": earned,
            "progress": min(progress, target),
            "target": target,
            "earned_at": next((b["earned_at"] for b in earned_docs if b["badge_id"] == badge["id"]), None),
        })

    return {
        "badges": badges_result,
        "total_earned": sum(1 for b in badges_result if b["earned"]),
        "total_badges": len(badges_result),
        "newly_earned": [{"id": b["id"], "name": b["name"], "icon": b["icon"], "element": b["element"], "description": b["description"]} for b in newly_earned],
        "stats": {
            "constellations_explored": len(explored_names),
            "stories_listened": len(stories_names),
            "journeys_completed": journeys,
        }
    }

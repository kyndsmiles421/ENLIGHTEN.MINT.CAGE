from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import random
import uuid

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SACRED MANTRAS — Woven into the fabric of the app
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANTRA_LIBRARY = [
    # Universal affirmations
    {"text": "I am aligned with the highest frequency of love and light", "category": "affirmation", "energy": "love"},
    {"text": "My energy is sovereign. I choose where it flows", "category": "affirmation", "energy": "power"},
    {"text": "I release what no longer serves my highest self", "category": "release", "energy": "cleansing"},
    {"text": "The universe conspires in my favor", "category": "affirmation", "energy": "abundance"},
    {"text": "I am the observer of my thoughts, not their prisoner", "category": "mindfulness", "energy": "clarity"},
    {"text": "Every breath draws me closer to cosmic harmony", "category": "breathing", "energy": "peace"},
    {"text": "I honor the sacred within me and all living things", "category": "gratitude", "energy": "reverence"},
    {"text": "My vibration attracts my tribe", "category": "connection", "energy": "community"},
    {"text": "I trust the timing of my journey", "category": "patience", "energy": "trust"},
    {"text": "I am worthy of all the abundance the cosmos offers", "category": "abundance", "energy": "worthiness"},
    # Sacred traditions
    {"text": "Om Mani Padme Hum — The jewel is in the lotus", "category": "sacred", "energy": "compassion"},
    {"text": "Sat Nam — Truth is my identity", "category": "sacred", "energy": "truth"},
    {"text": "So Hum — I am that", "category": "sacred", "energy": "unity"},
    {"text": "Om Namah Shivaya — I bow to the divine within", "category": "sacred", "energy": "devotion"},
    {"text": "Lokah Samastah Sukhino Bhavantu — May all beings be happy and free", "category": "sacred", "energy": "compassion"},
    # Cosmic / Starseed
    {"text": "The stars remember what the mind forgets", "category": "cosmic", "energy": "memory"},
    {"text": "I carry the light of a thousand suns within my cells", "category": "cosmic", "energy": "radiance"},
    {"text": "My soul chose this vessel for a reason", "category": "cosmic", "energy": "purpose"},
    {"text": "I am not lost. I am exploring", "category": "cosmic", "energy": "adventure"},
    {"text": "The void is not empty — it is full of potential", "category": "cosmic", "energy": "creation"},
    # Healing
    {"text": "My body heals with every beat of my heart", "category": "healing", "energy": "restoration"},
    {"text": "I forgive myself for the times I forgot my power", "category": "healing", "energy": "forgiveness"},
    {"text": "Pain is a teacher. I honor its lessons and release it", "category": "healing", "energy": "growth"},
    {"text": "I am grounded in my body, connected to the earth", "category": "grounding", "energy": "stability"},
    # Trade Circle specific
    {"text": "Fair exchange is the currency of trust", "category": "trade", "energy": "integrity"},
    {"text": "What I give with intention returns multiplied", "category": "trade", "energy": "generosity"},
    {"text": "The Cosmic Broker sees all. Trade with honor", "category": "trade", "energy": "honesty"},
    {"text": "My offerings carry the signature of my soul's work", "category": "trade", "energy": "authenticity"},
    # Mixer specific
    {"text": "Sound is the bridge between worlds", "category": "mixer", "energy": "vibration"},
    {"text": "963 Hz connects me to the divine source", "category": "mixer", "energy": "transcendence"},
    {"text": "My frequency is my fingerprint in the cosmos", "category": "mixer", "energy": "identity"},
]


@router.get("/mantras")
async def get_mantras(count: int = 3, category: str = ""):
    """Get rotating mantras. Can be filtered by category."""
    pool = MANTRA_LIBRARY
    if category:
        filtered = [m for m in pool if m["category"] == category]
        pool = filtered if filtered else pool
    selected = random.sample(pool, min(count, len(pool)))
    return {"mantras": selected}


@router.get("/mantras/all")
async def get_all_mantras():
    """Get the complete mantra library."""
    categories = list(set(m["category"] for m in MANTRA_LIBRARY))
    return {"mantras": MANTRA_LIBRARY, "categories": sorted(categories), "total": len(MANTRA_LIBRARY)}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GAME AVATAR — Mood-Resonant Digital Presence
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREE_AVATARS = [
    {"id": "seeker", "name": "The Seeker", "tier": "free", "aura_base": "#818CF8", "style": "ethereal", "description": "A wanderer of the cosmic paths. Default vessel."},
    {"id": "healer", "name": "The Healer", "tier": "free", "aura_base": "#22C55E", "style": "flowing", "description": "Channels restorative energy through gentle motion."},
    {"id": "guardian", "name": "The Guardian", "tier": "free", "aura_base": "#3B82F6", "style": "solid", "description": "A protector of sacred spaces and energies."},
    {"id": "mystic", "name": "The Mystic", "tier": "free", "aura_base": "#C084FC", "style": "pulsing", "description": "Reads the unseen threads between all things."},
]

EARNED_AVATARS = [
    {"id": "alchemist", "name": "The Alchemist", "tier": "earned", "aura_base": "#EAB308", "style": "shimmering", "description": "Transforms base energy into gold.", "unlock_condition": "Complete 10 Mixer sessions"},
    {"id": "starseed", "name": "The Starseed", "tier": "earned", "aura_base": "#2DD4BF", "style": "crystalline", "description": "Born of cosmic dust, guided by constellations.", "unlock_condition": "Mine 50 specimens"},
    {"id": "dreamwalker", "name": "The Dreamwalker", "tier": "earned", "aura_base": "#FB923C", "style": "fluid", "description": "Moves between realms with effortless grace.", "unlock_condition": "Complete 5 Dream Realm journeys"},
]

PREMIUM_AVATARS = [
    {"id": "phoenix", "name": "The Phoenix", "tier": "premium", "aura_base": "#EF4444", "style": "blazing", "price_credits": 25, "description": "Wreathed in sacred flame. Unique resonance animations."},
    {"id": "oracle", "name": "The Oracle", "tier": "premium", "aura_base": "#A78BFA", "style": "cosmic", "price_credits": 35, "description": "Eyes that see all timelines. Premium aura effects."},
    {"id": "sovereign", "name": "The Sovereign", "tier": "premium", "aura_base": "#F59E0B", "style": "regal", "price_credits": 50, "description": "Master of all elements. Full resonance suite."},
]

ALL_AVATARS = FREE_AVATARS + EARNED_AVATARS + PREMIUM_AVATARS


@router.get("/avatar/catalog")
async def avatar_catalog(user=Depends(get_current_user)):
    """Get avatar catalog with unlock status for the user."""
    user_id = user["id"]
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "game_avatar": 1, "unlocked_avatars": 1, "user_credit_balance": 1})
    unlocked = u.get("unlocked_avatars", ["seeker", "healer", "guardian", "mystic"]) if u else ["seeker", "healer", "guardian", "mystic"]
    active = u.get("game_avatar", {}).get("id", "seeker") if u else "seeker"
    credits = u.get("user_credit_balance", 0) if u else 0

    catalog = []
    for av in ALL_AVATARS:
        entry = {**av, "unlocked": av["id"] in unlocked, "active": av["id"] == active}
        catalog.append(entry)

    return {"catalog": catalog, "active_avatar": active, "credits": credits}


@router.post("/avatar/select")
async def select_avatar(data: dict = Body(...), user=Depends(get_current_user)):
    """Select an avatar from unlocked collection."""
    avatar_id = data.get("avatar_id", "")
    av = next((a for a in ALL_AVATARS if a["id"] == avatar_id), None)
    if not av:
        raise HTTPException(status_code=404, detail="Avatar not found")

    user_id = user["id"]
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "unlocked_avatars": 1})
    default_unlocked = ["seeker", "healer", "guardian", "mystic"]
    unlocked = u.get("unlocked_avatars", default_unlocked) if u else default_unlocked

    logger.info(f"Avatar select: user={user_id}, avatar={avatar_id}, unlocked={unlocked}")

    if avatar_id not in unlocked:
        raise HTTPException(status_code=403, detail="Avatar not unlocked")

    await db.users.update_one({"id": user_id}, {"$set": {
        "game_avatar": {"id": avatar_id, "name": av["name"], "aura_base": av["aura_base"], "style": av["style"], "tier": av["tier"]},
    }})

    return {"selected": avatar_id, "name": av["name"]}


@router.post("/avatar/purchase")
async def purchase_avatar(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a premium avatar with credits."""
    avatar_id = data.get("avatar_id", "")
    av = next((a for a in PREMIUM_AVATARS if a["id"] == avatar_id), None)
    if not av:
        raise HTTPException(status_code=404, detail="Premium avatar not found")

    user_id = user["id"]
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1, "unlocked_avatars": 1})
    credits = u.get("user_credit_balance", 0) if u else 0
    default_unlocked = ["seeker", "healer", "guardian", "mystic"]
    unlocked = u.get("unlocked_avatars", default_unlocked) if u else default_unlocked

    if avatar_id in unlocked:
        raise HTTPException(status_code=400, detail="Avatar already unlocked")

    price = av["price_credits"]
    if credits < price:
        raise HTTPException(status_code=400, detail=f"Need {price} Credits. Have {credits}.")

    unlocked.append(avatar_id)
    await db.users.update_one({"id": user_id}, {
        "$inc": {"user_credit_balance": -price},
        "$set": {"unlocked_avatars": unlocked},
    })

    return {"purchased": av["name"], "credits_spent": price, "remaining_credits": credits - price}


@router.get("/avatar/profile")
async def get_avatar_profile(user=Depends(get_current_user)):
    """Get the user's active game avatar with mood-resonant state."""
    user_id = user["id"]
    u = await db.users.find_one({"id": user_id}, {
        "_id": 0, "game_avatar": 1, "mixer_sessions_count": 1,
        "total_mines": 1, "trade_karma": 1, "user_credit_balance": 1
    })

    avatar = u.get("game_avatar", {"id": "seeker", "name": "The Seeker", "aura_base": "#818CF8", "style": "ethereal", "tier": "free"}) if u else {}
    mixer_count = u.get("mixer_sessions_count", 0) if u else 0
    mines = u.get("total_mines", 0) if u else 0
    karma = u.get("trade_karma", 0) if u else 0

    # Compute Resonance Level (0-100) based on activity
    resonance = min(100, mixer_count * 2 + mines + karma * 5)
    # Mood color shift based on resonance
    mood_states = [
        {"min": 0, "max": 20, "mood": "dormant", "shift": "#64748B"},
        {"min": 21, "max": 40, "mood": "awakening", "shift": "#818CF8"},
        {"min": 41, "max": 60, "mood": "flowing", "shift": "#2DD4BF"},
        {"min": 61, "max": 80, "mood": "radiant", "shift": "#EAB308"},
        {"min": 81, "max": 100, "mood": "transcendent", "shift": "#C084FC"},
    ]
    current_mood = next((m for m in mood_states if m["min"] <= resonance <= m["max"]), mood_states[0])

    return {
        "avatar": avatar,
        "resonance_level": resonance,
        "mood": current_mood["mood"],
        "mood_color": current_mood["shift"],
        "stats": {"mixer_sessions": mixer_count, "specimens_mined": mines, "trade_karma": karma},
    }

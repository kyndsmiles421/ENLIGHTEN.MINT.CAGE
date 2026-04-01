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
    {"text": "I am a conduit for healing energy", "category": "affirmation", "energy": "healing"},
    {"text": "My intuition is a compass that never fails", "category": "affirmation", "energy": "intuition"},
    {"text": "I choose peace over perfection", "category": "mindfulness", "energy": "acceptance"},
    {"text": "I am both the question and the answer", "category": "affirmation", "energy": "wisdom"},
    {"text": "Gratitude transforms what I have into more than enough", "category": "gratitude", "energy": "abundance"},
    # Sacred traditions
    {"text": "Om Mani Padme Hum \u2014 The jewel is in the lotus", "category": "sacred", "energy": "compassion"},
    {"text": "Sat Nam \u2014 Truth is my identity", "category": "sacred", "energy": "truth"},
    {"text": "So Hum \u2014 I am that", "category": "sacred", "energy": "unity"},
    {"text": "Om Namah Shivaya \u2014 I bow to the divine within", "category": "sacred", "energy": "devotion"},
    {"text": "Lokah Samastah Sukhino Bhavantu \u2014 May all beings be happy and free", "category": "sacred", "energy": "compassion"},
    {"text": "Gate Gate Paragate Parasamgate Bodhi Svaha \u2014 Gone beyond, altogether beyond", "category": "sacred", "energy": "transcendence"},
    {"text": "Om Shanti Shanti Shanti \u2014 Peace in body, speech, and mind", "category": "sacred", "energy": "peace"},
    {"text": "Aham Brahmasmi \u2014 I am the infinite reality", "category": "sacred", "energy": "unity"},
    {"text": "Ra Ma Da Sa Sa Say So Hung \u2014 Sun, Moon, Earth, Infinity", "category": "sacred", "energy": "healing"},
    # Chinese / Daoist mantras
    {"text": "\u9053\u53ef\u9053\uff0c\u975e\u5e38\u9053 \u2014 The Tao that can be spoken is not the eternal Tao", "category": "chinese", "energy": "wisdom", "lang": "zh"},
    {"text": "\u4e0a\u5584\u82e5\u6c34 \u2014 The highest good is like water", "category": "chinese", "energy": "flow", "lang": "zh"},
    {"text": "\u5929\u4eba\u5408\u4e00 \u2014 Heaven and humanity are one", "category": "chinese", "energy": "unity", "lang": "zh"},
    {"text": "\u6c14\u6c89\u4e39\u7530 \u2014 Sink the qi to the dantian", "category": "chinese", "energy": "grounding", "lang": "zh"},
    {"text": "\u5343\u91cc\u4e4b\u884c\uff0c\u59cb\u4e8e\u8db3\u4e0b \u2014 A journey of a thousand miles begins with a single step", "category": "chinese", "energy": "courage", "lang": "zh"},
    {"text": "\u5fc3\u5982\u6b62\u6c34 \u2014 The heart is like still water", "category": "chinese", "energy": "calm", "lang": "zh"},
    {"text": "\u65e0\u4e3a\u800c\u65e0\u4e0d\u4e3a \u2014 Through non-action, nothing is left undone", "category": "chinese", "energy": "acceptance", "lang": "zh"},
    {"text": "\u660e\u5fc3\u89c1\u6027 \u2014 See your true nature by illuminating the heart", "category": "chinese", "energy": "clarity", "lang": "zh"},
    {"text": "\u5185\u5723\u5916\u738b \u2014 Inner sage, outer king", "category": "chinese", "energy": "balance", "lang": "zh"},
    {"text": "\u5927\u9053\u81f3\u7b80 \u2014 The great Tao is the simplest", "category": "chinese", "energy": "simplicity", "lang": "zh"},
    {"text": "\u5750\u5fd8 \u2014 Sit and forget, release the self", "category": "chinese", "energy": "release", "lang": "zh"},
    {"text": "\u5929\u5730\u4e0e\u6211\u5e76\u751f \u2014 Heaven, earth, and I were born together", "category": "chinese", "energy": "oneness", "lang": "zh"},
    {"text": "\u5b88\u4e2d\u62b1\u4e00 \u2014 Hold to the center, embrace the one", "category": "chinese", "energy": "focus", "lang": "zh"},
    {"text": "\u5f52\u6839\u590d\u547d \u2014 Return to the root, restore your destiny", "category": "chinese", "energy": "restoration", "lang": "zh"},
    {"text": "\u5357\u65e0\u963f\u5f25\u9640\u4f5b \u2014 Namo Amituofo", "category": "chinese", "energy": "devotion", "lang": "zh"},
    # Cosmic / Starseed
    {"text": "The stars remember what the mind forgets", "category": "cosmic", "energy": "memory"},
    {"text": "I carry the light of a thousand suns within my cells", "category": "cosmic", "energy": "radiance"},
    {"text": "My soul chose this vessel for a reason", "category": "cosmic", "energy": "purpose"},
    {"text": "I am not lost. I am exploring", "category": "cosmic", "energy": "adventure"},
    {"text": "The void is not empty \u2014 it is full of potential", "category": "cosmic", "energy": "creation"},
    {"text": "I am stardust learning to dance", "category": "cosmic", "energy": "joy"},
    {"text": "The cosmos flows through me like a river of light", "category": "cosmic", "energy": "flow"},
    {"text": "My frequency is my signature in the fabric of reality", "category": "cosmic", "energy": "identity"},
    {"text": "Every atom in my body was forged in a star", "category": "cosmic", "energy": "connection"},
    {"text": "I vibrate at the frequency of miracles", "category": "cosmic", "energy": "wonder"},
    # Healing
    {"text": "My body heals with every beat of my heart", "category": "healing", "energy": "restoration"},
    {"text": "I forgive myself for the times I forgot my power", "category": "healing", "energy": "forgiveness"},
    {"text": "Pain is a teacher. I honor its lessons and release it", "category": "healing", "energy": "growth"},
    {"text": "I am grounded in my body, connected to the earth", "category": "grounding", "energy": "stability"},
    {"text": "My wounds are becoming my wisdom", "category": "healing", "energy": "transformation"},
    {"text": "I breathe in healing light. I breathe out what hurts", "category": "healing", "energy": "release"},
    {"text": "Every cell in my body vibrates with energy and health", "category": "healing", "energy": "vitality"},
    # Trade Circle specific
    {"text": "Fair exchange is the currency of trust", "category": "trade", "energy": "integrity"},
    {"text": "What I give with intention returns multiplied", "category": "trade", "energy": "generosity"},
    {"text": "The Cosmic Broker sees all. Trade with honor", "category": "trade", "energy": "honesty"},
    {"text": "My offerings carry the signature of my soul's work", "category": "trade", "energy": "authenticity"},
    {"text": "Abundance flows through generosity", "category": "trade", "energy": "flow"},
    # Mixer specific
    {"text": "Sound is the bridge between worlds", "category": "mixer", "energy": "vibration"},
    {"text": "963 Hz connects me to the divine source", "category": "mixer", "energy": "transcendence"},
    {"text": "My frequency is my fingerprint in the cosmos", "category": "mixer", "energy": "identity"},
    {"text": "Every note I play ripples through the universe", "category": "mixer", "energy": "impact"},
    # Energy Gate specific
    {"text": "The gates open for those who have earned the key", "category": "gates", "energy": "achievement"},
    {"text": "Each gate is a mirror reflecting my growth", "category": "gates", "energy": "reflection"},
    {"text": "I transmute base experience into golden wisdom", "category": "gates", "energy": "alchemy"},
    {"text": "The Earth Gate roots me. The Ether Gate frees me", "category": "gates", "energy": "journey"},
    # Explore / Hotspot specific
    {"text": "The earth beneath my feet holds ancient secrets", "category": "explore", "energy": "discovery"},
    {"text": "Sacred sites remember the prayers of every visitor", "category": "explore", "energy": "reverence"},
    {"text": "I walk where energy converges", "category": "explore", "energy": "presence"},
    {"text": "The world is a temple. Every step is a prayer", "category": "explore", "energy": "devotion"},
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

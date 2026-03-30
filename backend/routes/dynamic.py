from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone, date, timedelta
from collections import defaultdict
import asyncio
import hashlib
import uuid

router = APIRouter()

# ════════════════════════════════════════════
# 1. ACTIVITY TRACKING
# ════════════════════════════════════════════

@router.post("/activity/track")
async def track_activity(data: dict = Body(...), user=Depends(get_current_user)):
    """Lightweight activity tracker — called on page visits and interactions."""
    page = data.get("page", "")
    action = data.get("action", "visit")  # visit, interact, complete
    label = data.get("label", "")
    if not page:
        return {"ok": True}

    doc = {
        "user_id": user["id"],
        "page": page,
        "action": action,
        "label": label,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.activity_log.insert_one(doc)

    # Update user's last_active and visit counts
    await db.user_stats.update_one(
        {"user_id": user["id"]},
        {
            "$set": {"last_active": datetime.now(timezone.utc).isoformat()},
            "$inc": {"total_visits": 1},
            "$addToSet": {"visited_pages": page},
        },
        upsert=True,
    )
    return {"ok": True}


# ════════════════════════════════════════════
# 2. PERSONALIZED DASHBOARD
# ════════════════════════════════════════════

ALL_FEATURES = [
    {"page": "/breathing", "name": "Breathing Exercises", "category": "Practice", "color": "#2DD4BF"},
    {"page": "/meditation", "name": "Meditation", "category": "Practice", "color": "#D8B4FE"},
    {"page": "/affirmations", "name": "Affirmations", "category": "Practice", "color": "#FCD34D"},
    {"page": "/oracle", "name": "Oracle", "category": "Divination", "color": "#E879F9"},
    {"page": "/akashic-records", "name": "Akashic Records", "category": "Divination", "color": "#818CF8"},
    {"page": "/star-chart", "name": "Star Chart", "category": "Divination", "color": "#E879F9"},
    {"page": "/encyclopedia", "name": "Sacred Encyclopedia", "category": "Explore", "color": "#FB923C"},
    {"page": "/crystals", "name": "Crystals & Stones", "category": "Explore", "color": "#2DD4BF"},
    {"page": "/zen-garden", "name": "Zen Garden", "category": "Sanctuary", "color": "#22C55E"},
    {"page": "/soundscapes", "name": "Soundscapes", "category": "Sanctuary", "color": "#3B82F6"},
    {"page": "/music-lounge", "name": "Music Lounge", "category": "Sanctuary", "color": "#A855F7"},
    {"page": "/frequencies", "name": "Healing Frequencies", "category": "Sanctuary", "color": "#8B5CF6"},
    {"page": "/journal", "name": "Journal", "category": "Sanctuary", "color": "#86EFAC"},
    {"page": "/yoga", "name": "Yoga", "category": "Practice", "color": "#FB923C"},
    {"page": "/mudras", "name": "Mudras", "category": "Practice", "color": "#FDA4AF"},
    {"page": "/mantras", "name": "Mantras", "category": "Practice", "color": "#FB923C"},
    {"page": "/hooponopono", "name": "Ho'oponopono", "category": "Practice", "color": "#E879F9"},
    {"page": "/tantra", "name": "Tantra", "category": "Practice", "color": "#DC2626"},
    {"page": "/numerology", "name": "Numerology", "category": "Divination", "color": "#818CF8"},
    {"page": "/cardology", "name": "Cardology", "category": "Divination", "color": "#818CF8"},
    {"page": "/dreams", "name": "Dream Journal", "category": "Divination", "color": "#818CF8"},
    {"page": "/nourishment", "name": "Nourishment", "category": "Nourish", "color": "#22C55E"},
    {"page": "/aromatherapy", "name": "Aromatherapy", "category": "Nourish", "color": "#86EFAC"},
    {"page": "/herbology", "name": "Herbology", "category": "Nourish", "color": "#22C55E"},
    {"page": "/reiki", "name": "Reiki & Aura", "category": "Nourish", "color": "#E879F9"},
    {"page": "/creation-stories", "name": "Creation Stories", "category": "Explore", "color": "#FB923C"},
    {"page": "/teachings", "name": "Teachings", "category": "Explore", "color": "#FB923C"},
    {"page": "/entanglement", "name": "Quantum Entanglement", "category": "Explore", "color": "#818CF8"},
    {"page": "/blessings", "name": "Send a Blessing", "category": "Explore", "color": "#FDA4AF"},
    {"page": "/coach", "name": "Spiritual Coach", "category": "Practice", "color": "#D8B4FE"},
    {"page": "/reading-list", "name": "Spiritual Reading List", "category": "Explore", "color": "#FB923C"},
    {"page": "/bible", "name": "Bible & Lost Books", "category": "Explore", "color": "#DC2626"},
]

DAILY_WISDOM = [
    {"text": "The wound is the place where the Light enters you.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "Be still and know that I am God.", "source": "Psalms 46:10", "tradition": "Mystical Christianity", "color": "#3B82F6"},
    {"text": "The Tao that can be told is not the eternal Tao.", "source": "Laozi", "tradition": "Taoism", "color": "#22C55E"},
    {"text": "You are not a drop in the ocean. You are the entire ocean in a drop.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "In the beginner's mind there are many possibilities, in the expert's mind there are few.", "source": "Shunryu Suzuki", "tradition": "Zen", "color": "#78716C"},
    {"text": "The soul always knows what to do to heal itself. The challenge is to silence the mind.", "source": "Caroline Myss", "tradition": "Modern Mysticism", "color": "#D8B4FE"},
    {"text": "When you realize nothing is lacking, the whole world belongs to you.", "source": "Laozi", "tradition": "Taoism", "color": "#22C55E"},
    {"text": "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "The mind is everything. What you think you become.", "source": "Buddha", "tradition": "Buddhism", "color": "#FCD34D"},
    {"text": "Knowing yourself is the beginning of all wisdom.", "source": "Aristotle", "tradition": "Greek Philosophy", "color": "#06B6D4"},
    {"text": "As above, so below; as within, so without.", "source": "Hermes Trismegistus", "tradition": "Egyptian Mysteries", "color": "#EAB308"},
    {"text": "I am because we are.", "source": "Ubuntu Philosophy", "tradition": "African Wisdom", "color": "#F97316"},
    {"text": "The quieter you become, the more you can hear.", "source": "Ram Dass", "tradition": "Vedic Wisdom", "color": "#FB923C"},
    {"text": "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.", "source": "Zen Proverb", "tradition": "Zen", "color": "#78716C"},
    {"text": "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.", "source": "Teilhard de Chardin", "tradition": "Mystical Christianity", "color": "#3B82F6"},
    {"text": "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", "source": "Alan Watts", "tradition": "Zen", "color": "#78716C"},
    {"text": "What you seek is seeking you.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "The privilege of a lifetime is to become who you truly are.", "source": "Carl Jung", "tradition": "Depth Psychology", "color": "#818CF8"},
    {"text": "Tat Tvam Asi — Thou Art That.", "source": "Chandogya Upanishad", "tradition": "Hinduism", "color": "#FB923C"},
    {"text": "No tree has branches so foolish as to fight among themselves.", "source": "Ojibwe Proverb", "tradition": "Indigenous Wisdom", "color": "#DC2626"},
    {"text": "Stars, hide your fires; Let not light see my black and deep desires.", "source": "Shakespeare (Macbeth)", "tradition": "Western Mysticism", "color": "#818CF8"},
    {"text": "Ring the bells that still can ring. Forget your perfect offering. There is a crack in everything. That's how the light gets in.", "source": "Leonard Cohen", "tradition": "Kabbalah-Inspired", "color": "#818CF8"},
    {"text": "To study the Way is to study the self. To study the self is to forget the self.", "source": "Dogen", "tradition": "Zen", "color": "#78716C"},
    {"text": "The universe is not outside of you. Look inside yourself; everything that you want, you already are.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "He who knows others is wise; he who knows himself is enlightened.", "source": "Laozi", "tradition": "Taoism", "color": "#22C55E"},
    {"text": "When the student is ready, the teacher will appear. When the student is truly ready, the teacher will disappear.", "source": "Tao Te Ching", "tradition": "Taoism", "color": "#22C55E"},
    {"text": "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", "source": "Buddha", "tradition": "Buddhism", "color": "#FCD34D"},
    {"text": "The heart has its reasons which reason knows nothing of.", "source": "Blaise Pascal", "tradition": "Mystical Christianity", "color": "#3B82F6"},
    {"text": "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.", "source": "Rumi", "tradition": "Sufism", "color": "#E879F9"},
    {"text": "Where there is love there is life.", "source": "Mahatma Gandhi", "tradition": "Vedic Wisdom", "color": "#FB923C"},
    {"text": "An unexamined life is not worth living.", "source": "Socrates", "tradition": "Greek Philosophy", "color": "#06B6D4"},
]

GREETING_TEMPLATES = {
    "morning": [
        "Good morning, {name}. A new dawn, a new beginning.",
        "Rise and shine, {name}. The universe has been waiting for you.",
        "Morning light greets you, {name}. What will you create today?",
    ],
    "afternoon": [
        "Good afternoon, {name}. Stay centered in your light.",
        "The day unfolds, {name}. You're exactly where you need to be.",
        "Afternoon blessings, {name}. The cosmos aligns in your favor.",
    ],
    "evening": [
        "Good evening, {name}. Time to reflect and restore.",
        "Evening peace, {name}. Let the day's lessons settle.",
        "Welcome to the evening hour, {name}. The stars prepare your wisdom.",
    ],
    "night": [
        "The night whispers, {name}. Listen to your soul.",
        "Quiet hours, {name}. The universe speaks softest now.",
        "Night blessings, {name}. Dream deeply and let spirit guide you.",
    ],
}


def _get_daily_seed():
    """Deterministic seed from today's date — same content all day, changes tomorrow."""
    return int(hashlib.md5(date.today().isoformat().encode()).hexdigest(), 16)


def _pick_by_seed(items, seed, offset=0):
    """Pick an item from a list deterministically."""
    return items[(seed + offset) % len(items)]


@router.get("/dashboard/personalized")
async def get_personalized_dashboard(user=Depends(get_current_user)):
    uid = user["id"]
    seed = _get_daily_seed()
    now = datetime.now(timezone.utc)
    hour = now.hour

    # Determine time of day
    if 5 <= hour < 12:
        tod = "morning"
    elif 12 <= hour < 17:
        tod = "afternoon"
    elif 17 <= hour < 21:
        tod = "evening"
    else:
        tod = "night"

    # Parallel data fetch
    stats_doc, recent_activities, streak_doc, profile_doc, mood_count, journal_count, session_count = await asyncio.gather(
        db.user_stats.find_one({"user_id": uid}, {"_id": 0}),
        db.activity_log.find({"user_id": uid}, {"_id": 0}).sort("timestamp", -1).to_list(20),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.profiles.find_one({"user_id": uid}, {"_id": 0}),
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.coach_sessions.count_documents({"user_id": uid}),
    )

    name = user.get("name", "Seeker").split(" ")[0]
    visited = set(stats_doc.get("visited_pages", [])) if stats_doc else set()
    total_visits = stats_doc.get("total_visits", 0) if stats_doc else 0
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    # 1. Dynamic greeting
    greetings = GREETING_TEMPLATES.get(tod, GREETING_TEMPLATES["morning"])
    greeting = _pick_by_seed(greetings, seed).format(name=name)

    # 2. Daily wisdom (rotates daily)
    wisdom = _pick_by_seed(DAILY_WISDOM, seed)

    # 3. Continue where you left off — deduplicated recent pages
    seen_pages = set()
    continue_items = []
    for act in recent_activities:
        pg = act.get("page", "")
        if pg and pg not in seen_pages and pg != "/":
            seen_pages.add(pg)
            feature = next((f for f in ALL_FEATURES if f["page"] == pg), None)
            label = feature["name"] if feature else pg.strip("/").replace("-", " ").title()
            continue_items.append({
                "page": pg,
                "label": label,
                "category": feature["category"] if feature else "Explore",
                "color": feature["color"] if feature else "#818CF8",
                "timestamp": act.get("timestamp", ""),
            })
            if len(continue_items) >= 4:
                break

    # 4. New for you — features they haven't visited
    new_for_you = []
    for f in ALL_FEATURES:
        if f["page"] not in visited:
            new_for_you.append(f)
    # Shuffle deterministically by seed
    new_for_you.sort(key=lambda x: hashlib.md5((x["page"] + str(seed)).encode()).hexdigest())
    new_for_you = new_for_you[:5]

    # 5. Progress stats
    akashic_count = await db.akashic_sessions.count_documents({"user_id": uid})
    traditions_explored = await db.activity_log.distinct("page", {"user_id": uid, "page": {"$regex": "^/encyclopedia"}})

    progress = {
        "streak_days": streak,
        "total_sessions": total_visits,
        "mood_entries": mood_count,
        "journal_entries": journal_count,
        "ai_sessions": session_count + akashic_count,
        "traditions_explored": len(traditions_explored) if traditions_explored else 0,
        "features_discovered": len(visited),
        "total_features": len(ALL_FEATURES),
    }

    # 6. Featured tradition (rotates daily)
    tradition_ids = ["hinduism", "buddhism", "taoism", "sufism", "kabbalah", "indigenous",
                     "mystical_christianity", "egyptian", "greek_philosophy", "zen", "yoga_tantra", "african"]
    featured_tradition = _pick_by_seed(tradition_ids, seed, offset=7)

    return {
        "greeting": greeting,
        "time_of_day": tod,
        "wisdom": wisdom,
        "continue_items": continue_items,
        "new_for_you": new_for_you,
        "progress": progress,
        "featured_tradition": featured_tradition,
    }


# ════════════════════════════════════════════
# 3. SPIRITUAL READING LIST
# ════════════════════════════════════════════

READING_LIST_DB = [
    {"title": "The Bhagavad Gita", "author": "Vyasa (trans. Eknath Easwaran)", "tradition": "Hinduism", "level": "Essential", "color": "#FB923C",
     "desc": "The supreme scripture of self-realization — a dialogue between the soul and the divine on the battlefield of life."},
    {"title": "The Tao Te Ching", "author": "Laozi (trans. Stephen Mitchell)", "tradition": "Taoism", "level": "Essential", "color": "#22C55E",
     "desc": "Eighty-one verses on the art of living in harmony with the Way. Brief yet inexhaustible."},
    {"title": "The Dhammapada", "author": "Buddha (trans. Eknath Easwaran)", "tradition": "Buddhism", "level": "Essential", "color": "#FCD34D",
     "desc": "The Buddha's core teachings on the path of awakening — practical, direct, and timeless."},
    {"title": "The Essential Rumi", "author": "Rumi (trans. Coleman Barks)", "tradition": "Sufism", "level": "Essential", "color": "#E879F9",
     "desc": "Ecstatic poetry of divine love and mystical union. The bestselling poet in America for good reason."},
    {"title": "The Kybalion", "author": "Three Initiates", "tradition": "Hermeticism", "level": "Intermediate", "color": "#EAB308",
     "desc": "The seven Hermetic Principles that govern the universe: Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause and Effect, Gender."},
    {"title": "Autobiography of a Yogi", "author": "Paramahansa Yogananda", "tradition": "Yoga", "level": "Essential", "color": "#A855F7",
     "desc": "Steve Jobs' only book on his iPad. A miraculous account of spiritual awakening that has transformed millions."},
    {"title": "The Book of the Dead", "author": "Egyptian (trans. E.A. Wallis Budge)", "tradition": "Egyptian Mysteries", "level": "Advanced", "color": "#EAB308",
     "desc": "The ancient Egyptian guide to navigating the afterlife — a manual for the soul's journey beyond death."},
    {"title": "The Zohar", "author": "Moses de Leon / Shimon bar Yochai", "tradition": "Kabbalah", "level": "Advanced", "color": "#818CF8",
     "desc": "The foundational work of Kabbalistic thought — mystical commentary on the Torah revealing hidden layers of creation."},
    {"title": "The Yoga Sutras of Patanjali", "author": "Patanjali (trans. Sri Swami Satchidananda)", "tradition": "Yoga", "level": "Intermediate", "color": "#A855F7",
     "desc": "196 sutras mapping the complete science of consciousness — from ethical living to samadhi."},
    {"title": "Meditations", "author": "Marcus Aurelius", "tradition": "Stoicism", "level": "Essential", "color": "#06B6D4",
     "desc": "A Roman Emperor's private journal of Stoic practice. Timeless wisdom for navigating adversity with grace."},
    {"title": "The Cloud of Unknowing", "author": "Anonymous (14th Century)", "tradition": "Mystical Christianity", "level": "Intermediate", "color": "#3B82F6",
     "desc": "A medieval guide to contemplative prayer — meeting God beyond thought in the darkness of unknowing."},
    {"title": "Black Elk Speaks", "author": "John G. Neihardt", "tradition": "Lakota Spirituality", "level": "Essential", "color": "#DC2626",
     "desc": "The visionary life of a Lakota holy man — one of the most powerful accounts of indigenous spiritual experience."},
    {"title": "The Conference of the Birds", "author": "Farid ud-Din Attar", "tradition": "Sufism", "level": "Intermediate", "color": "#E879F9",
     "desc": "An allegorical poem about the soul's journey to God through seven valleys of spiritual transformation."},
    {"title": "The I Ching (Book of Changes)", "author": "Chinese Classic", "tradition": "Taoism/Confucianism", "level": "Intermediate", "color": "#22C55E",
     "desc": "The world's oldest oracle — 64 hexagrams mapping every possible state of change in the universe."},
    {"title": "Zen Mind, Beginner's Mind", "author": "Shunryu Suzuki", "tradition": "Zen", "level": "Essential", "color": "#78716C",
     "desc": "The definitive introduction to Zen practice. Simple, profound, and endlessly relevant."},
    {"title": "The Power of Now", "author": "Eckhart Tolle", "tradition": "Non-Dual", "level": "Essential", "color": "#D8B4FE",
     "desc": "A modern spiritual classic on the transformative power of present-moment awareness."},
    {"title": "The Emerald Tablet", "author": "Hermes Trismegistus", "tradition": "Hermeticism", "level": "Advanced", "color": "#EAB308",
     "desc": "The mysterious foundational text of Western alchemy and Hermeticism. 'As above, so below.'"},
    {"title": "When Things Fall Apart", "author": "Pema Chodron", "tradition": "Tibetan Buddhism", "level": "Essential", "color": "#FCD34D",
     "desc": "Heart-opening teachings on finding courage and compassion in the midst of life's suffering."},
    {"title": "The Corpus Hermeticum", "author": "Hermes Trismegistus", "tradition": "Egyptian/Hermetic", "level": "Advanced", "color": "#EAB308",
     "desc": "The secret teachings of Thoth — dialogues on the nature of God, cosmos, mind, and the divine human."},
    {"title": "Of Water and the Spirit", "author": "Malidoma Patrice Some", "tradition": "African (Dagara)", "level": "Intermediate", "color": "#F97316",
     "desc": "An extraordinary account of initiation into African indigenous wisdom — bridging two worlds."},
    {"title": "Interior Castle", "author": "Teresa of Avila", "tradition": "Mystical Christianity", "level": "Intermediate", "color": "#3B82F6",
     "desc": "The soul as a crystal castle with seven mansions — a systematic map of the journey to divine union."},
    {"title": "The Upanishads", "author": "Various (trans. Eknath Easwaran)", "tradition": "Hinduism", "level": "Intermediate", "color": "#FB923C",
     "desc": "The philosophical climax of the Vedas — direct investigations into the nature of consciousness and reality."},
    {"title": "Siddhartha", "author": "Hermann Hesse", "tradition": "Buddhism (Fiction)", "level": "Essential", "color": "#FCD34D",
     "desc": "A novel of one soul's journey to enlightenment by way of love, loss, and the river of life."},
    {"title": "The Tibetan Book of Living and Dying", "author": "Sogyal Rinpoche", "tradition": "Tibetan Buddhism", "level": "Intermediate", "color": "#FCD34D",
     "desc": "A modern companion to the Bardo Thodol — teaching how to live fully and die consciously."},
]


@router.get("/reading-list")
async def get_reading_list(user=Depends(get_current_user)):
    """Returns a personalized reading list based on user's exploration history."""
    uid = user["id"]

    # Get user's explored traditions from encyclopedia and activity
    activities = await db.activity_log.find(
        {"user_id": uid},
        {"_id": 0, "page": 1, "label": 1}
    ).to_list(200)

    # Figure out which traditions they've interacted with
    explored_traditions = set()
    for act in activities:
        page = act.get("page", "")
        label = act.get("label", "").lower()
        if "hinduism" in page or "hinduism" in label or "vedic" in label:
            explored_traditions.add("Hinduism")
        if "buddhism" in page or "buddhism" in label or "buddha" in label:
            explored_traditions.add("Buddhism")
        if "taoism" in page or "tao" in label:
            explored_traditions.add("Taoism")
        if "sufism" in page or "sufi" in label or "rumi" in label:
            explored_traditions.add("Sufism")
        if "kabbalah" in page or "kabbalah" in label:
            explored_traditions.add("Kabbalah")
        if "indigenous" in page or "shamanic" in label:
            explored_traditions.add("Indigenous")
        if "christian" in page or "christian" in label:
            explored_traditions.add("Mystical Christianity")
        if "egyptian" in page or "hermetic" in label:
            explored_traditions.add("Egyptian")
        if "greek" in page or "stoic" in label or "philosophy" in label:
            explored_traditions.add("Greek Philosophy")
        if "zen" in page or "zen" in label:
            explored_traditions.add("Zen")
        if "yoga" in page or "tantra" in page or "yoga" in label:
            explored_traditions.add("Yoga")
        if "african" in page or "african" in label:
            explored_traditions.add("African")
        if "akashic" in page:
            explored_traditions.add("Mystical")
        if "oracle" in page or "numerology" in page or "cardology" in page:
            explored_traditions.add("Divination")
        if "meditation" in page or "breathing" in page:
            explored_traditions.add("Meditation")

    # Check saved reading list
    saved_doc = await db.reading_lists.find_one({"user_id": uid}, {"_id": 0})
    saved_ids = saved_doc.get("saved", []) if saved_doc else []
    completed_ids = saved_doc.get("completed", []) if saved_doc else []

    # Score each book — higher if it matches explored traditions
    scored = []
    for i, book in enumerate(READING_LIST_DB):
        score = 0
        tradition = book["tradition"].lower()
        for et in explored_traditions:
            if et.lower() in tradition:
                score += 10
        # Boost essentials
        if book["level"] == "Essential":
            score += 3
        elif book["level"] == "Intermediate":
            score += 1
        scored.append({**book, "id": i, "score": score, "saved": i in saved_ids, "completed": i in completed_ids})

    # Sort: highest score first, then by level
    level_order = {"Essential": 0, "Intermediate": 1, "Advanced": 2}
    scored.sort(key=lambda x: (-x["score"], level_order.get(x["level"], 99)))

    # Separate into personalized and general
    personalized = [b for b in scored if b["score"] >= 10][:8]

    return {
        "personalized": personalized,
        "all_books": scored,
        "explored_traditions": list(explored_traditions),
        "saved_count": len(saved_ids),
        "completed_count": len(completed_ids),
    }


@router.post("/reading-list/save")
async def save_book(data: dict = Body(...), user=Depends(get_current_user)):
    book_id = data.get("book_id")
    action = data.get("action", "save")  # save, unsave, complete, uncomplete
    uid = user["id"]

    if action == "save":
        await db.reading_lists.update_one(
            {"user_id": uid}, {"$addToSet": {"saved": book_id}}, upsert=True)
    elif action == "unsave":
        await db.reading_lists.update_one(
            {"user_id": uid}, {"$pull": {"saved": book_id}})
    elif action == "complete":
        await db.reading_lists.update_one(
            {"user_id": uid},
            {"$addToSet": {"completed": book_id}, "$pull": {"saved": book_id}},
            upsert=True)
    elif action == "uncomplete":
        await db.reading_lists.update_one(
            {"user_id": uid}, {"$pull": {"completed": book_id}})

    return {"ok": True}


@router.post("/reading-list/ai-recommendation")
async def ai_reading_recommendation(data: dict = Body(...), user=Depends(get_current_user)):
    """AI-powered personalized reading recommendation."""
    interests = data.get("interests", "")
    mood = data.get("mood", "")

    prompt = f"""Based on a spiritual seeker's interests in {interests or 'general spirituality'} and their current mood of {mood or 'curious exploration'}, recommend 3 specific books from the world's spiritual traditions.

For each book, provide:
- Title and Author
- Tradition it belongs to
- A compelling 2-sentence reason why this book is perfect for them right now
- Reading level: Essential, Intermediate, or Advanced

Format as a numbered list. Be specific and passionate — you're a devoted librarian of sacred texts."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"reading-{uuid.uuid4().hex[:12]}",
            system_message="You are a wise spiritual librarian with deep knowledge of sacred texts from every tradition. You match seekers with the perfect books for their journey.",
        )
        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)),
            timeout=30
        )
        return {"recommendation": response}
    except Exception as e:
        logger.error(f"Reading list AI error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate recommendation")


# ════════════════════════════════════════════
# 4. SPIRITUAL GROWTH TIMELINE
# ════════════════════════════════════════════

PAGE_TO_CATEGORY = {
    "/breathing": "Practice", "/meditation": "Practice", "/affirmations": "Practice",
    "/yoga": "Practice", "/mudras": "Practice", "/mantras": "Practice",
    "/hooponopono": "Practice", "/tantra": "Practice", "/coach": "Practice",
    "/oracle": "Divination", "/akashic-records": "Divination", "/star-chart": "Divination",
    "/numerology": "Divination", "/cardology": "Divination", "/dreams": "Divination",
    "/mayan": "Divination", "/forecasts": "Divination", "/cosmic-profile": "Divination",
    "/encyclopedia": "Knowledge", "/teachings": "Knowledge", "/creation-stories": "Knowledge",
    "/reading-list": "Knowledge", "/learn": "Knowledge",
    "/zen-garden": "Sanctuary", "/soundscapes": "Sanctuary", "/music-lounge": "Sanctuary",
    "/frequencies": "Sanctuary", "/journal": "Sanctuary", "/reiki": "Sanctuary",
    "/nourishment": "Nourish", "/aromatherapy": "Nourish", "/herbology": "Nourish",
    "/community": "Connection", "/entanglement": "Connection", "/blessings": "Connection",
    "/friends": "Connection", "/trade-circle": "Connection",
    "/crystals": "Explore", "/games": "Explore", "/videos": "Explore",
    "/discover": "Explore", "/challenges": "Explore",
}

CATEGORY_COLORS = {
    "Practice": "#2DD4BF", "Divination": "#E879F9", "Knowledge": "#FB923C",
    "Sanctuary": "#86EFAC", "Nourish": "#22C55E", "Connection": "#818CF8",
    "Explore": "#FCD34D",
}

MILESTONES = [
    {"threshold": 1, "type": "first_visit", "title": "First Step", "desc": "You began your journey", "color": "#D8B4FE"},
    {"threshold": 5, "type": "visits", "title": "Curious Seeker", "desc": "Explored 5 different features", "color": "#2DD4BF"},
    {"threshold": 10, "type": "visits", "title": "Dedicated Explorer", "desc": "Explored 10 different features", "color": "#818CF8"},
    {"threshold": 20, "type": "visits", "title": "Wisdom Collector", "desc": "Explored 20 different features", "color": "#FCD34D"},
    {"threshold": 1, "type": "akashic", "title": "Records Opened", "desc": "First Akashic Records reading", "color": "#D8B4FE"},
    {"threshold": 1, "type": "journal", "title": "Inner Voice", "desc": "First journal entry", "color": "#86EFAC"},
    {"threshold": 1, "type": "mood", "title": "Self Awareness", "desc": "First mood check-in", "color": "#FDA4AF"},
    {"threshold": 1, "type": "blessing", "title": "Light Bearer", "desc": "First blessing sent", "color": "#FDA4AF"},
    {"threshold": 3, "type": "streak", "title": "Rhythm Keeper", "desc": "3-day practice streak", "color": "#FCD34D"},
    {"threshold": 7, "type": "streak", "title": "Week of Devotion", "desc": "7-day practice streak", "color": "#FB923C"},
    {"threshold": 30, "type": "streak", "title": "Moon Cycle Master", "desc": "30-day practice streak", "color": "#E879F9"},
    {"threshold": 5, "type": "ai_sessions", "title": "Sage's Companion", "desc": "5 AI coaching sessions", "color": "#38BDF8"},
    {"threshold": 1, "type": "reading_save", "title": "Book Seeker", "desc": "First book saved to reading list", "color": "#FB923C"},
    {"threshold": 1, "type": "reading_complete", "title": "Sacred Reader", "desc": "First sacred text completed", "color": "#22C55E"},
    {"threshold": 5, "type": "encyclopedia", "title": "Tradition Scholar", "desc": "Explored 5 spiritual traditions", "color": "#FB923C"},
]


@router.get("/timeline")
async def get_growth_timeline(user=Depends(get_current_user)):
    uid = user["id"]

    # Fetch all needed data in parallel
    (
        all_activities,
        mood_count,
        journal_count,
        blessing_count,
        akashic_count,
        coach_count,
        streak_doc,
        reading_doc,
        user_stats_doc,
    ) = await asyncio.gather(
        db.activity_log.find({"user_id": uid}, {"_id": 0}).sort("timestamp", 1).to_list(1000),
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.blessings.count_documents({"sender_id": uid}),
        db.akashic_sessions.count_documents({"user_id": uid}),
        db.coach_sessions.count_documents({"user_id": uid}),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.reading_lists.find_one({"user_id": uid}, {"_id": 0}),
        db.user_stats.find_one({"user_id": uid}, {"_id": 0}),
    )

    streak = streak_doc.get("current_streak", 0) if streak_doc else 0
    max_streak = streak_doc.get("max_streak", streak) if streak_doc else streak
    saved_books = len(reading_doc.get("saved", [])) if reading_doc else 0
    completed_books = len(reading_doc.get("completed", [])) if reading_doc else 0
    visited_pages = set(user_stats_doc.get("visited_pages", [])) if user_stats_doc else set()
    unique_features = len(visited_pages)

    # Build weekly activity heatmap (last 12 weeks)
    now = datetime.now(timezone.utc)
    twelve_weeks_ago = now - timedelta(weeks=12)
    weekly_data = defaultdict(lambda: {"count": 0, "categories": defaultdict(int), "pages": set()})

    for act in all_activities:
        ts = act.get("timestamp", "")
        if not ts:
            continue
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            continue
        if dt < twelve_weeks_ago:
            continue
        week_key = dt.strftime("%Y-W%V")
        page = act.get("page", "")
        cat = PAGE_TO_CATEGORY.get(page, "Explore")
        weekly_data[week_key]["count"] += 1
        weekly_data[week_key]["categories"][cat] += 1
        weekly_data[week_key]["pages"].add(page)

    # Convert to sorted list
    weeks = []
    for i in range(12):
        week_dt = now - timedelta(weeks=11 - i)
        week_key = week_dt.strftime("%Y-W%V")
        week_start = week_dt - timedelta(days=week_dt.weekday())
        wd = weekly_data.get(week_key, {"count": 0, "categories": defaultdict(int), "pages": set()})
        top_cat = max(wd["categories"], key=wd["categories"].get) if wd["categories"] else None
        weeks.append({
            "week": week_key,
            "label": week_start.strftime("%b %d"),
            "count": wd["count"],
            "top_category": top_cat,
            "top_color": CATEGORY_COLORS.get(top_cat, "#818CF8") if top_cat else "#333",
            "unique_pages": len(wd["pages"]),
            "categories": dict(wd["categories"]),
        })

    # Build category breakdown (all-time)
    cat_totals = defaultdict(int)
    for act in all_activities:
        page = act.get("page", "")
        cat = PAGE_TO_CATEGORY.get(page, "Explore")
        cat_totals[cat] += 1
    category_breakdown = [
        {"category": cat, "count": count, "color": CATEGORY_COLORS.get(cat, "#818CF8")}
        for cat, count in sorted(cat_totals.items(), key=lambda x: -x[1])
    ]

    # Compute traditions explored (from encyclopedia deep dives)
    encyclopedia_pages = [a.get("label", "") for a in all_activities if "/encyclopedia" in a.get("page", "")]
    traditions_explored = len(set(encyclopedia_pages)) if encyclopedia_pages else 0

    # Compute milestones earned
    earned_milestones = []
    for m in MILESTONES:
        earned = False
        if m["type"] == "first_visit" and len(all_activities) >= m["threshold"]:
            earned = True
        elif m["type"] == "visits" and unique_features >= m["threshold"]:
            earned = True
        elif m["type"] == "akashic" and akashic_count >= m["threshold"]:
            earned = True
        elif m["type"] == "journal" and journal_count >= m["threshold"]:
            earned = True
        elif m["type"] == "mood" and mood_count >= m["threshold"]:
            earned = True
        elif m["type"] == "blessing" and blessing_count >= m["threshold"]:
            earned = True
        elif m["type"] == "streak" and max_streak >= m["threshold"]:
            earned = True
        elif m["type"] == "ai_sessions" and (coach_count + akashic_count) >= m["threshold"]:
            earned = True
        elif m["type"] == "reading_save" and saved_books >= m["threshold"]:
            earned = True
        elif m["type"] == "reading_complete" and completed_books >= m["threshold"]:
            earned = True
        elif m["type"] == "encyclopedia" and traditions_explored >= m["threshold"]:
            earned = True

        earned_milestones.append({**m, "earned": earned})

    earned_count = sum(1 for m in earned_milestones if m["earned"])

    # Recent highlights — most interesting recent activities
    recent_highlights = []
    seen_highlight_pages = set()
    for act in reversed(all_activities[-30:]):
        page = act.get("page", "")
        if page in seen_highlight_pages or page == "/":
            continue
        seen_highlight_pages.add(page)
        cat = PAGE_TO_CATEGORY.get(page, "Explore")
        feature = next((f for f in ALL_FEATURES if f["page"] == page), None)
        recent_highlights.append({
            "page": page,
            "label": feature["name"] if feature else page.strip("/").replace("-", " ").title(),
            "category": cat,
            "color": CATEGORY_COLORS.get(cat, "#818CF8"),
            "timestamp": act.get("timestamp", ""),
        })
        if len(recent_highlights) >= 8:
            break

    # Journey start date
    first_activity = all_activities[0] if all_activities else None
    journey_start = first_activity.get("timestamp", "")[:10] if first_activity else None

    # Total days active
    active_days = set()
    for act in all_activities:
        ts = act.get("timestamp", "")
        if ts:
            active_days.add(ts[:10])

    return {
        "weeks": weeks,
        "category_breakdown": category_breakdown,
        "milestones": earned_milestones,
        "milestones_earned": earned_count,
        "milestones_total": len(MILESTONES),
        "recent_highlights": recent_highlights,
        "stats": {
            "journey_start": journey_start,
            "days_active": len(active_days),
            "total_activities": len(all_activities),
            "unique_features": unique_features,
            "current_streak": streak,
            "max_streak": max_streak,
            "traditions_explored": traditions_explored,
            "mood_entries": mood_count,
            "journal_entries": journal_count,
            "blessings_sent": blessing_count,
            "ai_sessions": coach_count + akashic_count,
            "books_saved": saved_books,
            "books_completed": completed_books,
        },
    }




# ════════════════════════════════════════════
# 5. MONTHLY SOUL REPORTS
# ════════════════════════════════════════════

@router.get("/soul-reports")
async def get_soul_reports(user=Depends(get_current_user)):
    """List all saved soul reports for the user."""
    reports = await db.soul_reports.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("month", -1).to_list(24)
    return {"reports": reports}


@router.get("/soul-reports/{month}")
async def get_soul_report(month: str, user=Depends(get_current_user)):
    """Get a specific month's report. month format: 2026-03"""
    report = await db.soul_reports.find_one(
        {"user_id": user["id"], "month": month}, {"_id": 0}
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/soul-reports/generate")
async def generate_soul_report(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate an AI soul report for a given month."""
    uid = user["id"]
    month = data.get("month", datetime.now(timezone.utc).strftime("%Y-%m"))

    # Check if already generated
    existing = await db.soul_reports.find_one(
        {"user_id": uid, "month": month}, {"_id": 0}
    )
    if existing:
        return existing

    # Parse month boundaries
    try:
        year, mon = month.split("-")
        start = datetime(int(year), int(mon), 1, tzinfo=timezone.utc)
        if int(mon) == 12:
            end = datetime(int(year) + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(int(year), int(mon) + 1, 1, tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    start_iso = start.isoformat()
    end_iso = end.isoformat()

    # Gather month's data
    activities = await db.activity_log.find(
        {"user_id": uid, "timestamp": {"$gte": start_iso, "$lt": end_iso}},
        {"_id": 0}
    ).to_list(500)

    mood_entries = await db.moods.find(
        {"user_id": uid, "created_at": {"$gte": start_iso, "$lt": end_iso}},
        {"_id": 0, "mood": 1, "energy": 1, "note": 1, "created_at": 1}
    ).to_list(100)

    journal_entries = await db.journal.find(
        {"user_id": uid, "created_at": {"$gte": start_iso, "$lt": end_iso}},
        {"_id": 0, "type": 1, "content": 1, "created_at": 1}
    ).to_list(50)

    akashic_sessions = await db.akashic_sessions.find(
        {"user_id": uid, "created_at": {"$gte": start_iso, "$lt": end_iso}},
        {"_id": 0, "prompt_id": 1, "created_at": 1}
    ).to_list(20)

    # Build category summary
    cat_counts = defaultdict(int)
    page_counts = defaultdict(int)
    for act in activities:
        page = act.get("page", "")
        cat = PAGE_TO_CATEGORY.get(page, "Explore")
        cat_counts[cat] += 1
        feature = next((f for f in ALL_FEATURES if f["page"] == page), None)
        name = feature["name"] if feature else page.strip("/").replace("-", " ").title()
        page_counts[name] += 1

    top_categories = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
    top_features = sorted(page_counts.items(), key=lambda x: -x[1])[:8]
    total_activities = len(activities)
    unique_days = len(set(a.get("timestamp", "")[:10] for a in activities if a.get("timestamp")))

    # Mood summary
    mood_summary = ""
    if mood_entries:
        moods = [m.get("mood", "") for m in mood_entries if m.get("mood")]
        energies = [m.get("energy", 0) for m in mood_entries if m.get("energy")]
        mood_summary = f"Mood check-ins: {len(mood_entries)}. "
        if moods:
            from collections import Counter
            top_moods = Counter(moods).most_common(3)
            mood_summary += f"Most common moods: {', '.join(f'{m} ({c}x)' for m, c in top_moods)}. "
        if energies:
            avg_e = sum(energies) / len(energies)
            mood_summary += f"Average energy level: {avg_e:.1f}/10. "

    # Build the prompt for AI
    month_name = start.strftime("%B %Y")
    profile = await db.users.find_one({"id": uid}, {"_id": 0, "name": 1, "zodiac": 1})
    name = profile.get("name", "Seeker") if profile else "Seeker"
    zodiac = profile.get("zodiac", "") if profile else ""

    data_summary = f"""MONTH: {month_name}
SEEKER: {name}{f' (Zodiac: {zodiac})' if zodiac else ''}
TOTAL ACTIVITIES: {total_activities} across {unique_days} active days

TOP FOCUS AREAS:
{chr(10).join(f'- {cat}: {count} visits' for cat, count in top_categories)}

MOST VISITED FEATURES:
{chr(10).join(f'- {name}: {count} times' for name, count in top_features)}

{mood_summary}

JOURNAL ENTRIES: {len(journal_entries)}
AKASHIC SESSIONS: {len(akashic_sessions)}{' (Topics: ' + ', '.join(set(s.get('prompt_id', '') for s in akashic_sessions)) + ')' if akashic_sessions else ''}
"""

    system = f"""You are the Soul Archivist of The Cosmic Collective — a wise, compassionate presence who reads the patterns of a seeker's spiritual journey and reflects them back with clarity, beauty, and encouragement.

You are writing a Monthly Soul Report for {month_name}. Based on the data provided, create a deeply personal, insightful report.

Your report MUST include these sections (use markdown headers):

## Soul Overview
A 3-4 sentence poetic summary of how this month felt energetically — what themes emerged, what the soul was working on.

## Dominant Energies
Analyze their top focus areas. What does gravitating toward these areas reveal about their inner state? What were they seeking?

## Growth Patterns
What shifts or patterns do you notice? Are they exploring broadly or going deep? Any new areas they ventured into?

## Emotional Landscape
Based on mood data (if available) and activity patterns, reflect on the emotional journey of this month.

## Soul Guidance for Next Month
Specific, actionable spiritual guidance for the upcoming month. Suggest practices, traditions to explore, and inner work based on what you've observed. Be specific — name actual practices.

## Affirmation
End with a powerful, personalized affirmation that captures the essence of their journey this month. Just 1-2 sentences.

TONE: Warm, insightful, slightly poetic. Like a trusted spiritual mentor who truly sees them. Not generic — reference their actual data. Keep the total report between 400-600 words."""

    if total_activities == 0:
        # No data for this month
        report_text = f"# Soul Report — {month_name}\n\nThis month holds space in stillness. No activities were recorded, but silence too is a teacher. Perhaps the soul was integrating, resting, preparing for what comes next. When you're ready, the path awaits."
    else:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"soul-report-{uid}-{month}-{uuid.uuid4().hex[:8]}",
                system_message=system,
            )
            report_text = await asyncio.wait_for(
                chat.send_message(UserMessage(text=data_summary)),
                timeout=60
            )
        except Exception as e:
            logger.error(f"Soul report generation error: {e}")
            raise HTTPException(status_code=500, detail="Could not generate soul report")

    # Save the report
    report_doc = {
        "user_id": uid,
        "month": month,
        "month_name": month_name,
        "report": report_text,
        "stats": {
            "total_activities": total_activities,
            "active_days": unique_days,
            "top_categories": [{"category": c, "count": n} for c, n in top_categories],
            "top_features": [{"name": n, "count": c} for n, c in top_features],
            "mood_entries": len(mood_entries),
            "journal_entries": len(journal_entries),
            "akashic_sessions": len(akashic_sessions),
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.soul_reports.insert_one(report_doc)
    del report_doc["_id"]  # remove ObjectId before returning
    return report_doc



# ════════════════════════════════════════════
# COSMIC MOOD RING
# ════════════════════════════════════════════

MOOD_COLORS = {
    "joyful": {"primary": "#FCD34D", "secondary": "#FB923C", "glow": "#EAB308"},
    "peaceful": {"primary": "#2DD4BF", "secondary": "#22D3EE", "glow": "#14B8A6"},
    "energized": {"primary": "#F97316", "secondary": "#EF4444", "glow": "#EA580C"},
    "reflective": {"primary": "#818CF8", "secondary": "#A78BFA", "glow": "#6366F1"},
    "grateful": {"primary": "#86EFAC", "secondary": "#34D399", "glow": "#10B981"},
    "anxious": {"primary": "#FDA4AF", "secondary": "#FB7185", "glow": "#E11D48"},
    "tired": {"primary": "#94A3B8", "secondary": "#64748B", "glow": "#475569"},
    "inspired": {"primary": "#E879F9", "secondary": "#C084FC", "glow": "#A855F7"},
    "neutral": {"primary": "#D8B4FE", "secondary": "#C4B5FD", "glow": "#8B5CF6"},
}


@router.get("/mood-ring")
async def get_mood_ring(user=Depends(get_current_user)):
    """Return current mood ring state based on recent mood entries and activity patterns."""
    user_id = user["id"]

    # Get recent mood entries (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    moods = await db.mood_logs.find(
        {"user_id": user_id, "timestamp": {"$gte": week_ago}},
        {"_id": 0, "mood": 1, "energy": 1, "timestamp": 1}
    ).sort("timestamp", -1).to_list(30)

    # Get recent activity for pattern detection
    activities = await db.activity_log.find(
        {"user_id": user_id, "timestamp": {"$gte": week_ago}},
        {"_id": 0, "page": 1, "action": 1}
    ).to_list(100)

    # Determine dominant mood
    if moods:
        mood_counts = defaultdict(int)
        for m in moods:
            mood_name = m.get("mood", "neutral")
            mood_counts[mood_name] += 1
        dominant = max(mood_counts, key=mood_counts.get)
        latest_mood = moods[0].get("mood", "neutral") if moods else "neutral"
        latest_energy = moods[0].get("energy", 5) if moods else 5
    else:
        # Infer mood from activity patterns
        page_set = set(a.get("page", "") for a in activities)
        if "/meditation" in page_set or "/breathing" in page_set:
            dominant = "peaceful"
        elif "/yoga" in page_set or "/exercises" in page_set:
            dominant = "energized"
        elif "/journal" in page_set or "/dreams" in page_set:
            dominant = "reflective"
        elif "/star-chart" in page_set or "/oracle" in page_set:
            dominant = "inspired"
        else:
            dominant = "neutral"
        latest_mood = dominant
        latest_energy = 5

    colors = MOOD_COLORS.get(dominant, MOOD_COLORS["neutral"])

    # Build layers for the orb visualization
    layers = []
    recent_moods = list(set(m.get("mood", "neutral") for m in moods[:5]))
    for i, mood in enumerate(recent_moods[:4]):
        mc = MOOD_COLORS.get(mood, MOOD_COLORS["neutral"])
        layers.append({
            "color": mc["primary"],
            "opacity": max(0.15, 0.5 - i * 0.1),
            "speed": 3 + i * 0.8,
        })
    if not layers:
        layers = [{"color": colors["primary"], "opacity": 0.4, "speed": 3}]

    # Mood trend
    if len(moods) >= 3:
        energy_vals = [m.get("energy", 5) for m in moods[:5]]
        avg_recent = sum(energy_vals[:2]) / min(2, len(energy_vals[:2]))
        avg_older = sum(energy_vals[2:]) / max(1, len(energy_vals[2:]))
        trend = "rising" if avg_recent > avg_older + 0.5 else "falling" if avg_recent < avg_older - 0.5 else "stable"
    else:
        trend = "stable"

    return {
        "dominant_mood": dominant,
        "latest_mood": latest_mood,
        "energy_level": latest_energy,
        "colors": colors,
        "layers": layers,
        "trend": trend,
        "mood_count": len(moods),
        "pulse_speed": max(2, min(6, 8 - latest_energy)),  # Higher energy = faster pulse
        "message": _mood_message(dominant, trend),
    }


def _mood_message(mood, trend):
    messages = {
        "joyful": "Your spirit radiates golden light today.",
        "peaceful": "A calm sea of turquoise flows through you.",
        "energized": "Solar fire courses through your being.",
        "reflective": "Deep indigo mirrors the starlit sky within.",
        "grateful": "Emerald gratitude blooms from your heart.",
        "anxious": "Gentle rose quartz soothes your restless waves.",
        "tired": "Silver moonlight invites you to rest.",
        "inspired": "Cosmic violet sparks dance in your aura.",
        "neutral": "Your energy field hums with quiet potential.",
    }
    base = messages.get(mood, messages["neutral"])
    if trend == "rising":
        base += " Your energy is ascending."
    elif trend == "falling":
        base += " Honor your need for gentle restoration."
    return base

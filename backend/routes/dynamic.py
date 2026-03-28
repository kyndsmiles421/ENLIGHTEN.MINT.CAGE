from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone, date
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
            label = act.get("label") or pg.strip("/").replace("-", " ").title()
            seen_pages.add(pg)
            feature = next((f for f in ALL_FEATURES if f["page"] == pg), None)
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
    general = [b for b in scored if b["score"] < 10]

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

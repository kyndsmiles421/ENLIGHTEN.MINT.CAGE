from fastapi import APIRouter, Depends, Query, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid
import hashlib

router = APIRouter()

tts_cache = {}

CRYSTAL_DATABASE = [
    {"id": "clear-quartz", "name": "Clear Quartz", "aka": "Master Healer", "color": "#E2E8F0", "category": "quartz", "chakra": "Crown", "element": "All", "zodiac": "All", "hardness": 7, "rarity": "common",
     "description": "The master healer and energy amplifier. Clear Quartz absorbs, stores, releases, and regulates energy. It draws off negative energy and neutralizes background radiation.",
     "spiritual": "Enhances psychic abilities, attunes you to your spiritual purpose, and amplifies the energy of other crystals.",
     "healing": "Stimulates the immune system, balances the body, and harmonizes all the chakras.",
     "uses": ["Meditation", "Energy amplification", "Clarity of thought", "Manifestation"]},
    {"id": "amethyst", "name": "Amethyst", "aka": "Stone of Spirituality", "color": "#A78BFA", "category": "quartz", "chakra": "Third Eye, Crown", "element": "Air", "zodiac": "Pisces, Virgo, Aquarius", "hardness": 7, "rarity": "common",
     "description": "A powerful protective stone with a high spiritual vibration. It guards against psychic attack and transmutes energy into love.",
     "spiritual": "Enhances higher states of consciousness and meditation. Calms the mind and stimulates the third eye.",
     "healing": "Relieves stress and strain, soothes irritability, balances mood swings, and alleviates sadness and grief.",
     "uses": ["Protection", "Spiritual growth", "Stress relief", "Intuition"]},
    {"id": "rose-quartz", "name": "Rose Quartz", "aka": "Stone of Unconditional Love", "color": "#FDA4AF", "category": "quartz", "chakra": "Heart", "element": "Water", "zodiac": "Taurus, Libra", "hardness": 7, "rarity": "common",
     "description": "The stone of universal love. It restores trust and harmony in relationships, encouraging unconditional love.",
     "spiritual": "Opens the heart at all levels to promote love, self-love, friendship, deep inner healing, and feelings of peace.",
     "healing": "Strengthens the physical heart and circulatory system. Releases unexpressed emotions and heartache.",
     "uses": ["Love", "Self-care", "Emotional healing", "Compassion"]},
    {"id": "obsidian", "name": "Black Obsidian", "aka": "Mirror Stone", "color": "#1E293B", "category": "volcanic", "chakra": "Root", "element": "Earth, Fire", "zodiac": "Scorpio, Sagittarius", "hardness": 5, "rarity": "common",
     "description": "A powerful cleanser of psychic smog created within the aura. A strong protective stone forming a shield against negativity.",
     "spiritual": "Brings clarity to the mind and clears confusion. Helps you to know who you truly are and exposes flaws.",
     "healing": "Aids digestion, detoxifies, and reduces arthritis pain. Warms the extremities.",
     "uses": ["Protection", "Grounding", "Truth seeking", "Shadow work"]},
    {"id": "citrine", "name": "Citrine", "aka": "Merchant's Stone", "color": "#FCD34D", "category": "quartz", "chakra": "Solar Plexus, Sacral", "element": "Fire", "zodiac": "Aries, Gemini, Leo, Libra", "hardness": 7, "rarity": "uncommon",
     "description": "A powerful cleanser and regenerator. Carrying the power of the sun, it is warming, energizing, and highly creative.",
     "spiritual": "Activates the crown chakra and opens the intuition. Cleanses the chakras, especially the solar plexus and navel.",
     "healing": "Energizes every level of life. Helps overcome depression, fears, and phobias. Promotes inner calm.",
     "uses": ["Abundance", "Manifestation", "Confidence", "Joy"]},
    {"id": "lapis-lazuli", "name": "Lapis Lazuli", "aka": "Stone of Wisdom", "color": "#3B82F6", "category": "metamorphic", "chakra": "Throat, Third Eye", "element": "Water", "zodiac": "Sagittarius", "hardness": 5.5, "rarity": "uncommon",
     "description": "A stone of truth and communication. Opens the third eye and balances the throat chakra. Stimulates enlightenment.",
     "spiritual": "A key to spiritual attainment. Quickly releases stress, bringing deep peace. Harmonizes body, emotions, mind, and spirit.",
     "healing": "Alleviates pain, especially migraines. Overcomes depression, benefits the respiratory and nervous systems.",
     "uses": ["Wisdom", "Truth", "Communication", "Spiritual attainment"]},
    {"id": "tigers-eye", "name": "Tiger's Eye", "aka": "Stone of Courage", "color": "#D97706", "category": "quartz", "chakra": "Solar Plexus, Sacral", "element": "Fire, Earth", "zodiac": "Capricorn", "hardness": 7, "rarity": "common",
     "description": "A protective stone traditionally carried as a talisman against ill wishing and curses. Shows the correct use of power.",
     "spiritual": "Grounds scattered energy, brings issues into perspective, and heals issues of self-worth and self-criticism.",
     "healing": "Treats the eyes, aids night vision, heals the throat and reproductive organs. Releases toxins.",
     "uses": ["Courage", "Protection", "Focus", "Grounding"]},
    {"id": "moonstone", "name": "Moonstone", "aka": "Stone of New Beginnings", "color": "#CBD5E1", "category": "feldspar", "chakra": "Third Eye, Solar Plexus", "element": "Water", "zodiac": "Cancer, Libra, Scorpio", "hardness": 6, "rarity": "uncommon",
     "description": "Strongly connected to the moon and to the intuition. Its most powerful effect is that of calming the emotions.",
     "spiritual": "Enhances psychic abilities and develops clairvoyance. Encourages lucid dreaming, especially at the time of the full moon.",
     "healing": "Aids the digestive and reproductive systems. Eliminates toxins and fluid retention. Alleviates degenerative conditions.",
     "uses": ["Intuition", "New beginnings", "Emotional balance", "Lucid dreaming"]},
    {"id": "turquoise", "name": "Turquoise", "aka": "Master Healer Stone", "color": "#2DD4BF", "category": "phosphate", "chakra": "Throat, Third Eye", "element": "Earth, Air, Fire", "zodiac": "Sagittarius, Pisces, Scorpio", "hardness": 6, "rarity": "rare",
     "description": "An efficient healer, providing solace for the spirit and well-being for the body. A protective stone used for amulets since time immemorial.",
     "spiritual": "Promotes spiritual attunement and enhances communication with the physical and spiritual worlds.",
     "healing": "Strengthens the meridians of the body and the subtle energy fields. Enhances the immune system.",
     "uses": ["Communication", "Protection", "Wisdom", "Spiritual grounding"]},
    {"id": "selenite", "name": "Selenite", "aka": "Liquid Light", "color": "#F1F5F9", "category": "gypsum", "chakra": "Crown, Third Eye", "element": "Wind", "zodiac": "Taurus", "hardness": 2, "rarity": "common",
     "description": "Named after Selene, Greek goddess of the moon. A calming stone that instills deep peace and is excellent for meditation.",
     "spiritual": "Opens the crown and higher crown chakras, accesses angelic consciousness and higher guidance.",
     "healing": "Aligns the spinal column, promotes flexibility. Guards against epileptic seizures. Neutralizes mercury poisoning.",
     "uses": ["Cleansing", "Meditation", "Angelic connection", "Peace"]},
    {"id": "labradorite", "name": "Labradorite", "aka": "Stone of Transformation", "color": "#818CF8", "category": "feldspar", "chakra": "Third Eye, Crown", "element": "Water", "zodiac": "Leo, Scorpio, Sagittarius", "hardness": 6.5, "rarity": "uncommon",
     "description": "A stone of transformation and a useful companion through change, imparting strength and perseverance.",
     "spiritual": "Raises consciousness and connects with universal energies. Deflects unwanted energies from the aura.",
     "healing": "Treats eye and brain disorders, relieves stress and regulates metabolism. Treats colds and rheumatism.",
     "uses": ["Transformation", "Intuition", "Protection", "Strength"]},
    {"id": "malachite", "name": "Malachite", "aka": "Stone of Transformation", "color": "#22C55E", "category": "carbonate", "chakra": "Heart, Solar Plexus", "element": "Earth", "zodiac": "Scorpio, Capricorn", "hardness": 4, "rarity": "uncommon",
     "description": "A powerful stone of protection. Absorbs negative energies and pollutants from the atmosphere and the body.",
     "spiritual": "Opens the heart to unconditional love. Encourages risk-taking and change. Breaks unwanted ties and outworn patterns.",
     "healing": "Lowers blood pressure, treats asthma, arthritis, vertigo, and travel sickness. Aids the immune system.",
     "uses": ["Protection", "Transformation", "Heart healing", "Growth"]},
]

CATEGORIES = ["all", "quartz", "volcanic", "metamorphic", "feldspar", "phosphate", "gypsum", "carbonate"]
CHAKRAS = ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"]


@router.get("/crystals")
async def get_crystals(category: str = Query("all"), chakra: str = Query(""), search: str = Query("")):
    """Get all crystals with optional filtering."""
    results = CRYSTAL_DATABASE
    if category and category != "all":
        results = [c for c in results if c["category"] == category]
    if chakra:
        results = [c for c in results if chakra.lower() in c["chakra"].lower()]
    if search:
        s = search.lower()
        results = [c for c in results if s in c["name"].lower() or s in c["aka"].lower() or s in c["description"].lower()]
    return {"crystals": results, "categories": CATEGORIES, "chakras": CHAKRAS, "total": len(results)}


# NOTE: Specific routes MUST come before wildcard routes like /crystals/{crystal_id}
# Moving /crystals/recommend, /crystals/pairing/*, /crystals/collection/*, /crystals/rockhound/* here

@router.get("/crystals/recommend")
async def recommend_crystals(mood: str = Query(""), intention: str = Query(""), user=Depends(get_current_user)):
    """AI-free crystal recommendation based on mood/intention."""
    mood_map = {
        "stressed": ["amethyst", "selenite", "moonstone"],
        "anxious": ["amethyst", "rose-quartz", "moonstone"],
        "sad": ["rose-quartz", "citrine", "turquoise"],
        "tired": ["citrine", "tigers-eye", "clear-quartz"],
        "angry": ["obsidian", "amethyst", "malachite"],
        "confused": ["lapis-lazuli", "clear-quartz", "labradorite"],
        "blocked": ["citrine", "tigers-eye", "malachite"],
        "lonely": ["rose-quartz", "turquoise", "moonstone"],
    }
    intention_map = {
        "love": ["rose-quartz", "moonstone", "malachite"],
        "protection": ["obsidian", "tigers-eye", "turquoise"],
        "wisdom": ["lapis-lazuli", "amethyst", "labradorite"],
        "abundance": ["citrine", "tigers-eye", "malachite"],
        "healing": ["clear-quartz", "turquoise", "selenite"],
        "intuition": ["amethyst", "moonstone", "labradorite"],
        "courage": ["tigers-eye", "obsidian", "citrine"],
        "peace": ["selenite", "amethyst", "moonstone"],
    }

    ids = set()
    if mood and mood.lower() in mood_map:
        ids.update(mood_map[mood.lower()])
    if intention and intention.lower() in intention_map:
        ids.update(intention_map[intention.lower()])
    if not ids:
        ids = {"clear-quartz", "amethyst", "rose-quartz"}

    recs = [c for c in CRYSTAL_DATABASE if c["id"] in ids]
    return {"recommendations": recs, "mood": mood, "intention": intention}


MOODS = ["Stressed", "Anxious", "Sad", "Tired", "Angry", "Confused", "Blocked", "Lonely", "Restless", "Overwhelmed", "Grief", "Fearful"]
INTENTIONS = ["Love", "Protection", "Wisdom", "Abundance", "Healing", "Intuition", "Courage", "Peace", "Grounding", "Creativity", "Clarity", "Transformation"]


@router.get("/crystals/pairing/options")
async def get_pairing_options():
    """Get available moods and intentions for crystal pairing."""
    return {"moods": MOODS, "intentions": INTENTIONS}


@router.get("/crystals/pairing/history")
async def get_pairing_history(user=Depends(get_current_user)):
    """Get user's previous crystal pairings."""
    pairings = await db.crystal_pairings.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    # Attach crystal data
    for p in pairings:
        p["crystals"] = [c for c in CRYSTAL_DATABASE if c["id"] in p.get("crystal_ids", [])]
    return {"pairings": pairings}


@router.get("/crystals/pairing/{pairing_id}/share")
async def get_pairing_share(pairing_id: str):
    """Get a crystal pairing for sharing (public endpoint)."""
    pairing = await db.crystal_pairings.find_one({"id": pairing_id}, {"_id": 0})
    if not pairing:
        raise HTTPException(status_code=404, detail="Pairing not found")
    crystals = [c for c in CRYSTAL_DATABASE if c["id"] in pairing.get("crystal_ids", [])]
    user_doc = await db.users.find_one({"id": pairing["user_id"]}, {"_id": 0, "password": 0})
    return {
        "pairing": pairing,
        "crystals": crystals,
        "user_name": user_doc.get("name", "Cosmic Seeker") if user_doc else "Cosmic Seeker",
    }


@router.post("/crystals/pairing/narrate")
async def narrate_pairing(data: dict, user=Depends(get_current_user)):
    """TTS narration of crystal pairing explanation."""
    text = data.get("text", "")
    if not text or len(text) < 10:
        raise HTTPException(status_code=400, detail="No text to narrate")

    cache_key = hashlib.md5(f"pairing-{text[:200]}".encode()).hexdigest()
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=text[:4096], model="tts-1-hd", voice="sage", speed=0.85, response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"Pairing TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to narrate pairing")


@router.post("/crystals/pairing")
async def crystal_pairing(data: dict, user=Depends(get_current_user)):
    """AI-powered crystal pairing: suggests 3 crystals based on mood + intention with explanation."""
    import asyncio
    mood = data.get("mood", "")
    intention = data.get("intention", "")
    custom = data.get("custom_note", "")

    crystal_info = "\n".join([f"- {c['name']} ({c['aka']}): {c['chakra']} chakra, {c['element']} element. Uses: {', '.join(c['uses'])}" for c in CRYSTAL_DATABASE])

    prompt = (
        f"You are a wise crystal healer. A seeker comes to you feeling '{mood}' with the intention of '{intention}'."
        + (f" They also share: '{custom}'" if custom else "")
        + f"\n\nAvailable crystals:\n{crystal_info}\n\n"
        f"Recommend exactly 3 crystals from the list above. For each, explain WHY it matches their energy in 2 sentences. "
        f"Then give a brief ritual suggestion (1-2 sentences) for using the combination together. "
        f"Format:\n1. [Crystal Name]: [Explanation]\n2. [Crystal Name]: [Explanation]\n3. [Crystal Name]: [Explanation]\n\nRitual: [suggestion]"
    )

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"crystal-pair-{uuid.uuid4().hex[:8]}",
            system_message="You are a wise and compassionate crystal healer with deep knowledge of crystal properties and their spiritual significance."
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)

        # Parse crystal IDs from response
        matched = []
        resp_lower = response.lower()
        for c in CRYSTAL_DATABASE:
            if c["name"].lower() in resp_lower:
                matched.append(c)
        matched = matched[:3]
        if not matched:
            matched = [c for c in CRYSTAL_DATABASE if c["id"] in ["amethyst", "rose-quartz", "clear-quartz"]]

        result = {
            "crystals": matched,
            "explanation": response,
            "mood": mood,
            "intention": intention,
        }

        # Save pairing to DB
        pairing = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "mood": mood,
            "intention": intention,
            "crystal_ids": [c["id"] for c in matched],
            "explanation": response,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.crystal_pairings.insert_one(pairing)

        return result
    except Exception as e:
        logger.error(f"Crystal pairing AI error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate crystal pairing")


@router.post("/crystals/collection/add")
async def add_to_collection(data: dict, user=Depends(get_current_user)):
    """Add a crystal to user's personal collection."""
    crystal_id = data.get("crystal_id", "")
    crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")

    existing = await db.crystal_collections.find_one({"user_id": user["id"], "crystal_id": crystal_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already in your collection")

    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "crystal_id": crystal_id,
        "crystal_name": crystal["name"],
        "found_via": data.get("found_via", "encyclopedia"),
        "notes": data.get("notes", ""),
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.crystal_collections.insert_one(entry)
    entry.pop("_id", None)
    return entry


@router.get("/crystals/collection/mine")
async def get_my_collection(user=Depends(get_current_user)):
    """Get user's crystal collection."""
    entries = await db.crystal_collections.find({"user_id": user["id"]}, {"_id": 0}).sort("added_at", -1).to_list(100)
    crystal_ids = [e["crystal_id"] for e in entries]
    crystals = [c for c in CRYSTAL_DATABASE if c["id"] in crystal_ids]
    return {"collection": entries, "crystals": crystals, "count": len(entries)}


# Wildcard route MUST come AFTER all specific routes
@router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str):
    """Get a single crystal's full details."""
    crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal


@router.post("/crystals/{crystal_id}/narrate")
async def narrate_crystal(crystal_id: str):
    """Generate HD TTS narration for a crystal's properties."""
    crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")

    cache_key = hashlib.md5(f"crystal-{crystal_id}".encode()).hexdigest()
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}

    narration = (
        f"{crystal['name']}, also known as the {crystal['aka']}. "
        f"{crystal['description']} "
        f"Spiritual significance: {crystal['spiritual']} "
        f"Healing properties: {crystal['healing']} "
        f"This crystal is associated with the {crystal['chakra']} chakra and the element of {crystal['element']}. "
        f"Best used for: {', '.join(crystal['uses'])}."
    )

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=narration[:4096], model="tts-1-hd", voice="shimmer", speed=0.85, response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"Crystal TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate crystal narration")



# ─── Rock Hounding Game ─────────────────────────────────────────────────
ENVIRONMENTS = [
    {"id": "riverbed", "name": "Crystal Riverbed", "description": "A serene river with quartz-rich banks", "crystals": ["clear-quartz", "amethyst", "rose-quartz", "citrine"], "difficulty": "easy"},
    {"id": "volcanic", "name": "Volcanic Cavern", "description": "Hot obsidian flows and hidden gems", "crystals": ["obsidian", "tigers-eye", "citrine", "labradorite"], "difficulty": "medium"},
    {"id": "ocean", "name": "Ocean Tide Pools", "description": "Coastal caves with ancient treasures", "crystals": ["turquoise", "moonstone", "selenite", "lapis-lazuli"], "difficulty": "medium"},
    {"id": "mountain", "name": "Sacred Mountain", "description": "High altitude crystal formations", "crystals": ["lapis-lazuli", "labradorite", "malachite", "clear-quartz"], "difficulty": "hard"},
]

import random

@router.get("/crystals/rockhound/environments")
async def get_environments(user=Depends(get_current_user)):
    """Get available rock hounding environments."""
    return {"environments": ENVIRONMENTS}


@router.post("/crystals/rockhound/dig")
async def dig_for_crystal(data: dict, user=Depends(get_current_user)):
    """Dig in an environment — chance-based crystal discovery."""
    env_id = data.get("environment_id", "riverbed")
    env = next((e for e in ENVIRONMENTS if e["id"] == env_id), ENVIRONMENTS[0])

    # Check daily dig limit (3 per day)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    digs_today = await db.rockhound_digs.count_documents({"user_id": user["id"], "date": today})
    if digs_today >= 3:
        from fastapi import HTTPException
        raise HTTPException(status_code=429, detail="You've used all 3 daily digs. Come back tomorrow!")

    # 70% chance to find something
    found = random.random() < 0.7
    crystal_id = None
    crystal = None

    if found:
        crystal_id = random.choice(env["crystals"])
        crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)

        # Auto-add to collection if not already there
        existing = await db.crystal_collections.find_one({"user_id": user["id"], "crystal_id": crystal_id})
        if not existing:
            entry = {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "crystal_id": crystal_id,
                "crystal_name": crystal["name"],
                "found_via": "rockhound",
                "notes": f"Found in {env['name']}",
                "added_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.crystal_collections.insert_one(entry)

    dig = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "environment_id": env_id,
        "found": found,
        "crystal_id": crystal_id,
        "date": today,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.rockhound_digs.insert_one(dig)
    dig.pop("_id", None)

    return {
        "found": found,
        "crystal": crystal,
        "environment": env["name"],
        "digs_remaining": 2 - digs_today,
        "is_new": found and not existing if found else False,
    }

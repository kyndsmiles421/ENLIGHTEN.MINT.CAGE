from fastapi import APIRouter, Depends, Query
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

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


@router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str):
    """Get a single crystal's full details."""
    crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)
    if not crystal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal


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


@router.post("/crystals/collection/add")
async def add_to_collection(data: dict, user=Depends(get_current_user)):
    """Add a crystal to user's personal collection."""
    crystal_id = data.get("crystal_id", "")
    crystal = next((c for c in CRYSTAL_DATABASE if c["id"] == crystal_id), None)
    if not crystal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Crystal not found")

    existing = await db.crystal_collections.find_one({"user_id": user["id"], "crystal_id": crystal_id})
    if existing:
        from fastapi import HTTPException
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

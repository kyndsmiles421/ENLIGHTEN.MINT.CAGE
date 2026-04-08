from fastapi import APIRouter, HTTPException, Request
from deps import db, logger
from engines.crystal_seal import secure_hash_short
import os

router = APIRouter()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

tts_cache = {}

# Sacred text library — seed data
SACRED_TEXTS = [
    {
        "id": "bhagavad-gita",
        "title": "Bhagavad Gita",
        "tradition": "Hindu",
        "region": "India",
        "era": "~500 BCE",
        "color": "#F59E0B",
        "description": "The Song of God — a 700-verse dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra, covering duty, dharma, devotion, and the nature of reality.",
        "chapters": [
            {"id": "bg-1", "title": "The Yoga of Arjuna's Despair", "number": 1},
            {"id": "bg-2", "title": "The Yoga of Knowledge", "number": 2},
            {"id": "bg-3", "title": "The Yoga of Action", "number": 3},
            {"id": "bg-4", "title": "The Yoga of Wisdom", "number": 4},
            {"id": "bg-5", "title": "The Yoga of Renunciation", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "golden_particles",
    },
    {
        "id": "tao-te-ching",
        "title": "Tao Te Ching",
        "tradition": "Taoist",
        "region": "China",
        "era": "~6th century BCE",
        "color": "#10B981",
        "description": "Laozi's foundational text of Taoism — 81 short chapters on the Way (Tao), virtue (Te), and the art of living in harmony with the natural order of the universe.",
        "chapters": [
            {"id": "ttc-1", "title": "The Tao That Can Be Told", "number": 1},
            {"id": "ttc-2", "title": "Under Heaven", "number": 2},
            {"id": "ttc-3", "title": "Not Exalting the Worthy", "number": 3},
            {"id": "ttc-4", "title": "The Tao Is Empty", "number": 4},
            {"id": "ttc-5", "title": "Heaven and Earth", "number": 5},
        ],
        "voice": "shimmer",
        "animation_theme": "water_ink",
    },
    {
        "id": "book-of-the-dead",
        "title": "Egyptian Book of the Dead",
        "tradition": "Ancient Egyptian",
        "region": "Egypt",
        "era": "~1550 BCE",
        "color": "#8B5CF6",
        "description": "A collection of funerary spells and hymns guiding the soul through the Duat (underworld), past the 42 judges, to the weighing of the heart against the feather of Ma'at.",
        "chapters": [
            {"id": "bod-1", "title": "The Hymn to Ra at Sunrise", "number": 1},
            {"id": "bod-2", "title": "The Negative Confessions", "number": 2},
            {"id": "bod-3", "title": "The Weighing of the Heart", "number": 3},
            {"id": "bod-4", "title": "The Fields of Aaru", "number": 4},
            {"id": "bod-5", "title": "Transformation Spells", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "hieroglyph_reveal",
    },
    {
        "id": "popol-vuh",
        "title": "Popol Vuh",
        "tradition": "Mayan",
        "region": "Mesoamerica",
        "era": "~1550 CE (oral tradition much older)",
        "color": "#22C55E",
        "description": "The creation epic of the K'iche' Maya — from the cosmic void through four attempts to create humanity, the Hero Twins' descent to Xibalba, and the dawn of the current age.",
        "chapters": [
            {"id": "pv-1", "title": "The Primordial Sea", "number": 1},
            {"id": "pv-2", "title": "The Wooden People", "number": 2},
            {"id": "pv-3", "title": "The Hero Twins", "number": 3},
            {"id": "pv-4", "title": "The Descent to Xibalba", "number": 4},
            {"id": "pv-5", "title": "The Dawn of Humanity", "number": 5},
        ],
        "voice": "fable",
        "animation_theme": "jungle_mist",
    },
    {
        "id": "upanishads",
        "title": "The Upanishads",
        "tradition": "Hindu / Vedantic",
        "region": "India",
        "era": "~800-200 BCE",
        "color": "#EC4899",
        "description": "Philosophical dialogues forming the foundation of Vedanta — exploring Brahman (ultimate reality), Atman (true self), karma, meditation, and the path to liberation (moksha).",
        "chapters": [
            {"id": "up-1", "title": "Isha Upanishad — The Lord Dwells in All", "number": 1},
            {"id": "up-2", "title": "Kena Upanishad — Who Moves the Mind?", "number": 2},
            {"id": "up-3", "title": "Katha Upanishad — Death as Teacher", "number": 3},
            {"id": "up-4", "title": "Mandukya Upanishad — The Syllable Om", "number": 4},
            {"id": "up-5", "title": "Chandogya — Tat Tvam Asi (Thou Art That)", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "golden_particles",
    },
    {
        "id": "dhammapada",
        "title": "The Dhammapada",
        "tradition": "Buddhist",
        "region": "India / Southeast Asia",
        "era": "~3rd century BCE",
        "color": "#F97316",
        "description": "A collection of 423 verses attributed to the Buddha, organized in 26 chapters. The foundational ethical and philosophical guide of Theravada Buddhism.",
        "chapters": [
            {"id": "dp-1", "title": "Twin Verses — Mind is the Forerunner", "number": 1},
            {"id": "dp-2", "title": "Heedfulness — The Path to the Deathless", "number": 2},
            {"id": "dp-3", "title": "The Mind — Flickering and Restless", "number": 3},
            {"id": "dp-4", "title": "Flowers — Who Shall Overcome This Earth?", "number": 4},
            {"id": "dp-5", "title": "The Fool — Long Is the Night", "number": 5},
        ],
        "voice": "shimmer",
        "animation_theme": "lotus_bloom",
    },
    {
        "id": "rumi-masnavi",
        "title": "Rumi's Masnavi",
        "tradition": "Sufi / Islamic",
        "region": "Persia / Turkey",
        "era": "~1258-1273 CE",
        "color": "#D946EF",
        "description": "The 'Quran in Persian' — Rumi's six-volume mystical epic of 25,000 couplets. Stories within stories exploring divine love, the soul's journey, and union with the Beloved.",
        "chapters": [
            {"id": "rm-1", "title": "The Song of the Reed", "number": 1},
            {"id": "rm-2", "title": "The Merchant and the Parrot", "number": 2},
            {"id": "rm-3", "title": "Moses and the Shepherd", "number": 3},
            {"id": "rm-4", "title": "The Elephant in the Dark", "number": 4},
            {"id": "rm-5", "title": "The Guest House", "number": 5},
        ],
        "voice": "fable",
        "animation_theme": "whirling_stars",
    },
    {
        "id": "norse-edda",
        "title": "The Poetic Edda",
        "tradition": "Norse",
        "region": "Scandinavia / Iceland",
        "era": "~1270 CE (oral tradition much older)",
        "color": "#64748B",
        "description": "The primary source of Norse mythology — from the creation of the world from Ginnungagap, through the gods' adventures, to the prophesied destruction of Ragnarok and the world's rebirth.",
        "chapters": [
            {"id": "ne-1", "title": "Voluspa — The Seeress's Prophecy", "number": 1},
            {"id": "ne-2", "title": "Havamal — The Words of the High One", "number": 2},
            {"id": "ne-3", "title": "Grimnismal — The Lay of Grimnir", "number": 3},
            {"id": "ne-4", "title": "Lokasenna — Loki's Flyting", "number": 4},
            {"id": "ne-5", "title": "Voluspa in skamma — Ragnarok", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "rune_frost",
    },
    {
        "id": "tibetan-book-dead",
        "title": "Bardo Thodol (Tibetan Book of the Dead)",
        "tradition": "Tibetan Buddhist",
        "region": "Tibet / Himalayas",
        "era": "~8th century CE",
        "color": "#EF4444",
        "description": "A guide for the consciousness during the intermediate state (bardo) between death and rebirth. Instructions for navigating visions, wrathful deities, and the clear light of liberation.",
        "chapters": [
            {"id": "tbd-1", "title": "The Luminosity of the Moment of Death", "number": 1},
            {"id": "tbd-2", "title": "The Bardo of Dharmata — Peaceful Deities", "number": 2},
            {"id": "tbd-3", "title": "The Bardo of Dharmata — Wrathful Deities", "number": 3},
            {"id": "tbd-4", "title": "The Bardo of Becoming", "number": 4},
            {"id": "tbd-5", "title": "Instructions for Choosing Rebirth", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "mandala_pulse",
    },
    {
        "id": "i-ching",
        "title": "I Ching (Book of Changes)",
        "tradition": "Chinese / Confucian / Taoist",
        "region": "China",
        "era": "~1000 BCE",
        "color": "#0EA5E9",
        "description": "The oldest of the Chinese classics — a divination system of 64 hexagrams representing all possible states of change. Used for thousands of years as a guide to decision-making and understanding cosmic flow.",
        "chapters": [
            {"id": "ic-1", "title": "Hexagram 1: Qian — The Creative", "number": 1},
            {"id": "ic-2", "title": "Hexagram 2: Kun — The Receptive", "number": 2},
            {"id": "ic-3", "title": "Hexagram 11: Tai — Peace", "number": 3},
            {"id": "ic-4", "title": "Hexagram 29: Kan — The Abysmal Water", "number": 4},
            {"id": "ic-5", "title": "Hexagram 64: Wei Ji — Before Completion", "number": 5},
        ],
        "voice": "shimmer",
        "animation_theme": "water_ink",
    },
    {
        "id": "emerald-tablet",
        "title": "The Emerald Tablet",
        "tradition": "Hermetic / Alchemical",
        "region": "Egypt / Mediterranean",
        "era": "~200-800 CE (attributed to antiquity)",
        "color": "#14B8A6",
        "description": "The foundational text of Western alchemy and Hermeticism, attributed to Hermes Trismegistus. Its cryptic verses encode the secrets of transmutation — 'As above, so below.'",
        "chapters": [
            {"id": "et-1", "title": "As Above, So Below", "number": 1},
            {"id": "et-2", "title": "The Operation of the Sun", "number": 2},
            {"id": "et-3", "title": "The Father and Mother of All", "number": 3},
            {"id": "et-4", "title": "Separation and Conjunction", "number": 4},
            {"id": "et-5", "title": "The Philosopher's Stone", "number": 5},
        ],
        "voice": "fable",
        "animation_theme": "emerald_glow",
    },
    {
        "id": "yoga-sutras",
        "title": "Yoga Sutras of Patanjali",
        "tradition": "Hindu / Yogic",
        "region": "India",
        "era": "~400 CE",
        "color": "#A855F7",
        "description": "196 aphorisms systematizing the philosophy and practice of yoga. The eight limbs of yoga — from ethical conduct to samadhi (absorption) — are the definitive guide to stilling the mind.",
        "chapters": [
            {"id": "ys-1", "title": "Samadhi Pada — On Absorption", "number": 1},
            {"id": "ys-2", "title": "Sadhana Pada — On Practice", "number": 2},
            {"id": "ys-3", "title": "Vibhuti Pada — On Powers", "number": 3},
            {"id": "ys-4", "title": "Kaivalya Pada — On Liberation", "number": 4},
            {"id": "ys-5", "title": "The Eight Limbs Synthesized", "number": 5},
        ],
        "voice": "shimmer",
        "animation_theme": "lotus_bloom",
    },
    {
        "id": "kojiki",
        "title": "Kojiki (Record of Ancient Matters)",
        "tradition": "Shinto / Japanese",
        "region": "Japan",
        "era": "712 CE",
        "color": "#EC4899",
        "description": "Japan's oldest chronicle — the creation of the islands by Izanagi and Izanami, the sun goddess Amaterasu's retreat to the cave, and the divine lineage of the imperial family.",
        "chapters": [
            {"id": "kj-1", "title": "The Primordial Kami", "number": 1},
            {"id": "kj-2", "title": "Izanagi and Izanami Create the Islands", "number": 2},
            {"id": "kj-3", "title": "Amaterasu and the Cave of Heaven", "number": 3},
            {"id": "kj-4", "title": "Susanoo and the Eight-Headed Serpent", "number": 4},
            {"id": "kj-5", "title": "The Descent of Ninigi", "number": 5},
        ],
        "voice": "shimmer",
        "animation_theme": "sakura_drift",
    },
    {
        "id": "odu-ifa",
        "title": "Odu Ifa",
        "tradition": "Yoruba / Ifa",
        "region": "West Africa",
        "era": "~8000+ years oral tradition",
        "color": "#14B8A6",
        "description": "The sacred oral scripture of the Yoruba Ifa divination system — 256 Odu (chapters) encoding the entire knowledge of Orunmila, the Orisha of wisdom and destiny.",
        "chapters": [
            {"id": "oi-1", "title": "Eji Ogbe — The King of All Odu", "number": 1},
            {"id": "oi-2", "title": "Oyeku Meji — The Night and Death", "number": 2},
            {"id": "oi-3", "title": "Iwori Meji — The Inner Vision", "number": 3},
            {"id": "oi-4", "title": "Odi Meji — The Closed and Open", "number": 4},
            {"id": "oi-5", "title": "Irosun Meji — The Bloodline", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "golden_particles",
    },
    {
        "id": "kalevala",
        "title": "The Kalevala",
        "tradition": "Finnish / Nordic",
        "region": "Finland / Karelia",
        "era": "1835 CE (compiled from ancient oral poetry)",
        "color": "#3B82F6",
        "description": "Finland's national epic — a compilation of ancient Karelian oral poetry. The tale of Vainamoinen the eternal singer, Ilmarinen the smith, and the quest for the Sampo, the magical artifact of abundance.",
        "chapters": [
            {"id": "kv-1", "title": "Vainamoinen and the Creation of the World", "number": 1},
            {"id": "kv-2", "title": "The Forging of the Sampo", "number": 2},
            {"id": "kv-3", "title": "Lemminkainen's Journey to Tuonela", "number": 3},
            {"id": "kv-4", "title": "The Theft of the Sampo", "number": 4},
            {"id": "kv-5", "title": "The Departure of Vainamoinen", "number": 5},
        ],
        "voice": "fable",
        "animation_theme": "rune_frost",
    },
]

VOICE_MAP = {
    "sage": "sage",
    "shimmer": "shimmer",
    "fable": "fable",
    "onyx": "onyx",
    "nova": "nova",
}


@router.get("/sacred-texts")
async def get_sacred_texts():
    """Return all sacred texts (metadata only)."""
    texts = []
    for t in SACRED_TEXTS:
        # Check which chapters have been generated
        generated = await db.sacred_text_chapters.count_documents({"text_id": t["id"]})
        texts.append({
            "id": t["id"],
            "title": t["title"],
            "tradition": t["tradition"],
            "region": t["region"],
            "era": t["era"],
            "color": t["color"],
            "description": t["description"],
            "chapter_count": len(t["chapters"]),
            "generated_count": generated,
            "animation_theme": t["animation_theme"],
        })
    return {"texts": texts, "total": len(texts)}


@router.get("/sacred-texts/{text_id}")
async def get_sacred_text(text_id: str):
    """Return a single text with its chapters and generation status."""
    text = next((t for t in SACRED_TEXTS if t["id"] == text_id), None)
    if not text:
        raise HTTPException(status_code=404, detail="Sacred text not found")

    chapters = []
    for ch in text["chapters"]:
        generated = await db.sacred_text_chapters.find_one(
            {"text_id": text_id, "chapter_id": ch["id"]}, {"_id": 0}
        )
        chapters.append({
            **ch,
            "generated": generated is not None,
            "content": generated.get("content") if generated else None,
            "excerpt": generated.get("excerpt") if generated else None,
            "commentary": generated.get("commentary") if generated else None,
        })

    return {
        "id": text["id"],
        "title": text["title"],
        "tradition": text["tradition"],
        "region": text["region"],
        "era": text["era"],
        "color": text["color"],
        "description": text["description"],
        "animation_theme": text["animation_theme"],
        "voice": text.get("voice", "fable"),
        "chapters": chapters,
    }


@router.post("/sacred-texts/{text_id}/chapters/{chapter_id}/generate")
async def generate_chapter(text_id: str, chapter_id: str, request: Request):
    """Generate chapter content using AI — both retelling and curated excerpt with commentary."""
    text = next((t for t in SACRED_TEXTS if t["id"] == text_id), None)
    if not text:
        raise HTTPException(status_code=404, detail="Sacred text not found")

    chapter = next((c for c in text["chapters"] if c["id"] == chapter_id), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    existing = await db.sacred_text_chapters.find_one(
        {"text_id": text_id, "chapter_id": chapter_id}, {"_id": 0}
    )
    if existing:
        return existing

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"sacred-{text_id}-{chapter_id}",
            system_message=f"""You are a sacred text scholar and storyteller. You provide two types of content for each chapter:

1. RETELLING: A rich, immersive AI retelling of the chapter in modern English, preserving the spiritual depth and literary beauty. Write 4-6 paragraphs of flowing, vivid prose.

2. EXCERPT: 2-3 curated key passages/verses from the actual text (as close to traditional translations as possible), formatted as quotes.

3. COMMENTARY: 2-3 paragraphs of scholarly and spiritual commentary explaining the deeper meaning, historical context, and how this teaching applies to modern life.

The text is: {text['title']} from the {text['tradition']} tradition.
Write with reverence, depth, and beauty.""",
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        result = await chat.send_message(
            UserMessage(text=f"""Generate content for Chapter {chapter['number']}: "{chapter['title']}" from {text['title']}.

Return EXACTLY in this format:

RETELLING:
[Your immersive retelling here — 4-6 paragraphs]

EXCERPT:
[2-3 key passages/verses in quote format]

COMMENTARY:
[2-3 paragraphs of deeper meaning and modern application]""")
        )

        response_text = result.strip() if isinstance(result, str) else str(result)

        # Parse sections
        retelling = ""
        excerpt = ""
        commentary = ""

        sections = response_text.split("\n\n")
        current_section = "retelling"

        for section in sections:
            stripped = section.strip()
            if stripped.upper().startswith("RETELLING:"):
                current_section = "retelling"
                stripped = stripped[len("RETELLING:"):].strip()
            elif stripped.upper().startswith("EXCERPT:"):
                current_section = "excerpt"
                stripped = stripped[len("EXCERPT:"):].strip()
            elif stripped.upper().startswith("COMMENTARY:"):
                current_section = "commentary"
                stripped = stripped[len("COMMENTARY:"):].strip()

            if stripped:
                if current_section == "retelling":
                    retelling += stripped + "\n\n"
                elif current_section == "excerpt":
                    excerpt += stripped + "\n\n"
                elif current_section == "commentary":
                    commentary += stripped + "\n\n"

        doc = {
            "text_id": text_id,
            "chapter_id": chapter_id,
            "chapter_title": chapter["title"],
            "chapter_number": chapter["number"],
            "text_title": text["title"],
            "tradition": text["tradition"],
            "content": retelling.strip() or response_text,
            "excerpt": excerpt.strip(),
            "commentary": commentary.strip(),
            "generated": True,
        }

        await db.sacred_text_chapters.insert_one(doc)
        doc.pop("_id", None)
        return doc

    except Exception as e:
        logger.error(f"Sacred text generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate chapter content")


@router.post("/sacred-texts/{text_id}/chapters/{chapter_id}/narrate")
async def narrate_chapter(text_id: str, chapter_id: str):
    """Generate TTS audio for a chapter."""
    text = next((t for t in SACRED_TEXTS if t["id"] == text_id), None)
    if not text:
        raise HTTPException(status_code=404, detail="Text not found")

    chapter_doc = await db.sacred_text_chapters.find_one(
        {"text_id": text_id, "chapter_id": chapter_id}, {"_id": 0}
    )
    if not chapter_doc:
        raise HTTPException(status_code=404, detail="Chapter not generated yet")

    cache_key = secure_hash_short(f"sacred-{text_id}-{chapter_id}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}

    narration_text = (
        f"From the {text['title']}, of the {text['tradition']} tradition. "
        f"Chapter {chapter_doc.get('chapter_number', '')}: {chapter_doc.get('chapter_title', '')}. "
        f"{chapter_doc.get('content', '')[:3500]}"
    )

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        voice = VOICE_MAP.get(text.get("voice", "fable"), "fable")
        audio_b64 = await tts.generate_speech_base64(
            text=narration_text[:4096],
            model="tts-1-hd",
            voice=voice,
            speed=0.85,
            response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"Sacred text TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to narrate chapter")


@router.get("/sacred-texts/progress/{user_id}")
async def get_reading_progress(user_id: str):
    """Get user's reading progress across all texts."""
    progress = await db.sacred_text_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    return {"progress": progress}


@router.post("/sacred-texts/progress")
async def save_reading_progress(request: Request):
    """Save user's reading progress for a text."""
    body = await request.json()
    user_id = body.get("user_id")
    text_id = body.get("text_id")
    chapter_id = body.get("chapter_id")
    scroll_position = body.get("scroll_position", 0)

    if not all([user_id, text_id, chapter_id]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    await db.sacred_text_progress.update_one(
        {"user_id": user_id, "text_id": text_id},
        {"$set": {
            "chapter_id": chapter_id,
            "scroll_position": scroll_position,
            "user_id": user_id,
            "text_id": text_id,
        }},
        upsert=True,
    )
    return {"status": "saved"}

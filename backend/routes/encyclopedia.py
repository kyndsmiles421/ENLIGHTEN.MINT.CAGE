from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from engines.crystal_seal import secure_hash_short
import asyncio
import uuid
import os

router = APIRouter()

tts_cache = {}

# Curated encyclopedia of world spiritual traditions
TRADITIONS = [
    {
        "id": "hinduism",
        "name": "Hinduism & Vedic Wisdom",
        "color": "#FB923C",
        "era": "3000+ BCE — Present",
        "origin": "Indian Subcontinent",
        "overview": "The world's oldest living religion, Hinduism encompasses a vast ocean of philosophy, mythology, and practice. Its core texts — the Vedas, Upanishads, and Bhagavad Gita — explore the nature of consciousness, the soul (Atman), and its unity with the ultimate reality (Brahman).",
        "key_concepts": [
            {"name": "Brahman & Atman", "desc": "The universal consciousness (Brahman) and the individual soul (Atman) are ultimately one. 'Tat Tvam Asi' — Thou Art That."},
            {"name": "Dharma", "desc": "Cosmic order, righteousness, and one's sacred duty. Living in alignment with dharma creates harmony within and without."},
            {"name": "Karma & Samsara", "desc": "The law of cause and effect across lifetimes. Actions create impressions (samskaras) that shape future incarnations in the cycle of rebirth."},
            {"name": "Moksha", "desc": "Liberation from the cycle of birth and death. The ultimate goal — realizing one's true nature as infinite consciousness."},
            {"name": "Yoga", "desc": "Union of individual consciousness with the divine. Four main paths: Bhakti (devotion), Jnana (knowledge), Karma (action), Raja (meditation)."},
            {"name": "Chakras & Kundalini", "desc": "The seven energy centers along the spine, and the dormant serpent energy that awakens spiritual transformation when activated."},
        ],
        "sacred_texts": ["Rigveda", "Upanishads", "Bhagavad Gita", "Yoga Sutras of Patanjali", "Ramayana", "Mahabharata"],
        "notable_figures": ["Krishna", "Shankara", "Ramanujacharya", "Ramana Maharshi", "Paramahansa Yogananda", "Swami Vivekananda"],
        "practices": ["Meditation (Dhyana)", "Mantra chanting", "Pranayama (breathwork)", "Puja (devotional worship)", "Kirtan", "Yoga asanas"],
    },
    {
        "id": "buddhism",
        "name": "Buddhism",
        "color": "#FCD34D",
        "era": "5th Century BCE — Present",
        "origin": "Nepal / India",
        "overview": "Founded by Siddhartha Gautama (the Buddha), Buddhism maps the path from suffering to awakening. It teaches that suffering arises from attachment, and liberation comes through direct insight into the nature of mind and reality.",
        "key_concepts": [
            {"name": "Four Noble Truths", "desc": "Life contains suffering (dukkha); suffering has a cause (craving/attachment); suffering can end; there is a path to its end."},
            {"name": "Eightfold Path", "desc": "Right view, intention, speech, action, livelihood, effort, mindfulness, and concentration — the middle way to awakening."},
            {"name": "Emptiness (Sunyata)", "desc": "All phenomena are empty of inherent, independent existence. This is not nihilism but the recognition of interdependence."},
            {"name": "Impermanence (Anicca)", "desc": "All conditioned things are in constant flux. Clinging to permanence is the root of suffering."},
            {"name": "Compassion (Karuna)", "desc": "The wish for all beings to be free from suffering. In Mahayana Buddhism, the Bodhisattva vows to liberate all beings before entering Nirvana."},
            {"name": "Mindfulness (Sati)", "desc": "Bare, non-judgmental awareness of the present moment — the foundation of all Buddhist meditation."},
        ],
        "sacred_texts": ["Dhammapada", "Heart Sutra", "Lotus Sutra", "Tibetan Book of the Dead", "Pali Canon"],
        "notable_figures": ["Gautama Buddha", "Nagarjuna", "Padmasambhava", "Milarepa", "Thich Nhat Hanh", "Dalai Lama"],
        "practices": ["Vipassana meditation", "Zazen (Zen sitting)", "Loving-kindness (Metta)", "Walking meditation", "Tonglen", "Prostrations"],
    },
    {
        "id": "taoism",
        "name": "Taoism",
        "color": "#22C55E",
        "era": "4th Century BCE — Present",
        "origin": "China",
        "overview": "Taoism teaches harmony with the Tao — the ineffable source and flow of all existence. It values naturalness, simplicity, and wu wei (effortless action). Where other paths seek to transcend nature, Taoism celebrates alignment with it.",
        "key_concepts": [
            {"name": "The Tao", "desc": "The Way — the nameless, formless source of all things. 'The Tao that can be told is not the eternal Tao.'"},
            {"name": "Wu Wei", "desc": "Non-forceful action. Acting in harmony with the natural flow rather than against it. Water is the supreme metaphor — soft yet powerful."},
            {"name": "Yin & Yang", "desc": "The complementary opposites that generate all phenomena. Light/dark, active/passive, masculine/feminine — each contains the seed of the other."},
            {"name": "Qi (Chi)", "desc": "Vital life force energy that flows through all living things. Health and vitality depend on its free circulation."},
            {"name": "The Three Treasures", "desc": "Jing (essence), Qi (energy), Shen (spirit) — the three levels of vital energy that Taoist practice cultivates and refines."},
            {"name": "Naturalness (Ziran)", "desc": "Spontaneous authenticity. Being true to one's original nature without artifice or force."},
        ],
        "sacred_texts": ["Tao Te Ching (Laozi)", "Zhuangzi", "I Ching (Book of Changes)", "Nei Jing (Yellow Emperor's Classic)"],
        "notable_figures": ["Laozi", "Zhuangzi", "Zhang Daoling", "Ge Hong", "Sun Bu'er"],
        "practices": ["Tai Chi", "Qigong", "Taoist meditation", "Internal alchemy (Neidan)", "Feng Shui", "Herbal medicine"],
    },
    {
        "id": "sufism",
        "name": "Sufism",
        "color": "#E879F9",
        "era": "8th Century CE — Present",
        "origin": "Middle East / Persia",
        "overview": "The mystical heart of Islam, Sufism seeks direct, ecstatic experience of the Divine Beloved. Through love, devotion, and the annihilation of the ego, the Sufi dissolves the illusion of separation and merges with God.",
        "key_concepts": [
            {"name": "Fana (Annihilation)", "desc": "The dissolution of the ego-self in the ocean of Divine consciousness. Not destruction, but awakening to one's true identity in God."},
            {"name": "Dhikr", "desc": "Remembrance of God through repetitive chanting of divine names. The practice that polishes the mirror of the heart until it reflects pure light."},
            {"name": "The Beloved", "desc": "God as the ultimate Beloved. Sufi poetry uses romantic love as metaphor for the soul's yearning for union with the Divine."},
            {"name": "The Nafs", "desc": "The ego-self that veils the heart from Truth. Sufism maps stages of purifying the nafs from commanding (ammara) to inspired (mulhama) to serene (mutma'inna)."},
            {"name": "The Heart (Qalb)", "desc": "The spiritual organ of perception. When polished through practice, the heart becomes a mirror reflecting divine reality."},
            {"name": "Unity of Being (Wahdat al-Wujud)", "desc": "Ibn Arabi's teaching that only God truly exists. All of creation is a manifestation of the one Divine reality."},
        ],
        "sacred_texts": ["Masnavi (Rumi)", "The Conference of the Birds (Attar)", "Fusus al-Hikam (Ibn Arabi)", "Diwan-e-Hafez"],
        "notable_figures": ["Rumi", "Hafez", "Ibn Arabi", "Al-Ghazali", "Rabia al-Adawiyya", "Mansur al-Hallaj"],
        "practices": ["Whirling (Sema)", "Dhikr circles", "Sufi poetry recitation", "Muraqaba (meditation)", "Fasting", "Pilgrimage"],
    },
    {
        "id": "kabbalah",
        "name": "Kabbalah",
        "color": "#818CF8",
        "era": "12th Century CE roots, ancient oral tradition",
        "origin": "Jewish Mystical Tradition",
        "overview": "Kabbalah is the mystical dimension of Judaism, mapping the hidden structure of creation through the Tree of Life. It reveals how the infinite (Ein Sof) emanates into finite reality through ten divine attributes (Sefirot).",
        "key_concepts": [
            {"name": "Ein Sof", "desc": "The Infinite — God before and beyond all manifestation. Utterly unknowable, yet the source of everything."},
            {"name": "The Tree of Life", "desc": "Ten Sefirot (divine emanations) arranged in a cosmic map showing how infinity becomes multiplicity. The blueprint of creation itself."},
            {"name": "Tikkun Olam", "desc": "Repairing the world. The Kabbalistic teaching that divine sparks fell into the material realm and human action can gather and elevate them."},
            {"name": "The Four Worlds", "desc": "Atziluth (Emanation), Beriah (Creation), Yetzirah (Formation), Assiah (Action) — layers of reality from purest spirit to physical matter."},
            {"name": "Gematria", "desc": "The mystical numerology of Hebrew letters. Each letter carries numerical and spiritual significance, revealing hidden connections in sacred texts."},
            {"name": "Devekut", "desc": "Cleaving to God — the state of continuous divine communion. The ultimate goal of Kabbalistic practice."},
        ],
        "sacred_texts": ["Zohar", "Sefer Yetzirah (Book of Formation)", "Bahir", "Tikkunei Zohar", "Torah (mystical readings)"],
        "notable_figures": ["Isaac Luria (the Ari)", "Moses de Leon", "Abraham Abulafia", "Moses Cordovero", "Baal Shem Tov"],
        "practices": ["Meditation on the Sefirot", "Hebrew letter contemplation", "Gematria study", "Shabbat observance", "Hitbodedut (solitary prayer)"],
    },
    {
        "id": "indigenous",
        "name": "Indigenous & Shamanic Wisdom",
        "color": "#DC2626",
        "era": "40,000+ Years — Present",
        "origin": "Global",
        "overview": "Indigenous traditions across all continents share core understandings: the Earth is alive and sacred, all beings are relatives, the spirit world is real and accessible, and humans have a responsibility to maintain balance. Shamanism — the oldest spiritual practice — bridges the visible and invisible worlds.",
        "key_concepts": [
            {"name": "Animism", "desc": "All things — stones, rivers, trees, animals, mountains — possess spirit and consciousness. Nature is not a resource but a community of living beings."},
            {"name": "The Medicine Wheel", "desc": "A sacred circle mapping the four directions, seasons, elements, and stages of life. A tool for understanding balance and cycles."},
            {"name": "Ancestral Connection", "desc": "The dead are not gone — they are the closest and most powerful allies. Ancestor veneration is central to most indigenous traditions."},
            {"name": "Shamanic Journeying", "desc": "Entering altered states of consciousness to travel to spirit realms for healing, guidance, and power retrieval."},
            {"name": "Reciprocity (Ayni)", "desc": "Sacred balance of giving and receiving. Every gift from nature must be honored with gratitude and offering."},
            {"name": "Vision Quests", "desc": "Extended periods of fasting and solitude in nature to receive spiritual vision, purpose, and power."},
        ],
        "sacred_texts": ["Oral traditions (all continents)", "Popol Vuh (Maya)", "Black Elk Speaks", "Aboriginal Dreamtime stories"],
        "notable_figures": ["Black Elk (Lakota)", "Don Juan Matus (Yaqui)", "Maria Sabina (Mazatec)", "Credo Mutwa (Zulu)"],
        "practices": ["Sweat lodge", "Vision quest", "Drumming journeys", "Plant medicine ceremonies", "Smudging", "Sun Dance"],
    },
    {
        "id": "mystical_christianity",
        "name": "Mystical Christianity",
        "color": "#3B82F6",
        "era": "1st Century CE — Present",
        "origin": "Middle East / Europe",
        "overview": "Beyond institutional religion, Christian mysticism seeks direct union with God through contemplative prayer, divine love, and the inner Christ. Mystics like Meister Eckhart, Teresa of Avila, and Thomas Merton mapped profound states of consciousness within Christian language.",
        "key_concepts": [
            {"name": "Theosis (Divinization)", "desc": "The Eastern Orthodox teaching that humans are meant to become partakers of the divine nature — not worship God from afar, but be transformed into God's likeness."},
            {"name": "The Cloud of Unknowing", "desc": "God cannot be known through thought or concept, only through love. The mystic enters a 'cloud of unknowing' beyond the intellect."},
            {"name": "Dark Night of the Soul", "desc": "St. John of the Cross's map of the spiritual crisis that precedes union with God. The ego's deepest despair becomes the soul's greatest liberation."},
            {"name": "Interior Castle", "desc": "Teresa of Avila's vision of the soul as a crystal castle with seven mansions, each representing deeper stages of prayer and union with God."},
            {"name": "The Inner Christ", "desc": "The Gnostic and mystical teaching that Christ-consciousness lives within every person — not only in the historical Jesus."},
            {"name": "Contemplative Prayer", "desc": "Silent, wordless prayer that transcends thought. Centering Prayer and Lectio Divina are modern expressions of ancient contemplative traditions."},
        ],
        "sacred_texts": ["Gospel of Thomas", "The Cloud of Unknowing", "Interior Castle (Teresa of Avila)", "Meister Eckhart's Sermons", "Philokalia"],
        "notable_figures": ["Meister Eckhart", "Teresa of Avila", "John of the Cross", "Thomas Merton", "Hildegard of Bingen", "Julian of Norwich"],
        "practices": ["Centering Prayer", "Lectio Divina", "Ignatian Exercises", "Hesychasm (Jesus Prayer)", "Contemplative silence"],
    },
    {
        "id": "egyptian",
        "name": "Ancient Egyptian Mysteries",
        "color": "#EAB308",
        "era": "3100 BCE — 400 CE",
        "origin": "Egypt / Kemet",
        "overview": "Ancient Egypt (Kemet) developed one of the most sophisticated spiritual systems in history. The mystery schools of Heliopolis, Memphis, and Thebes taught the science of consciousness, death, and resurrection. Their influence reaches into Hermeticism, Freemasonry, and Western esotericism.",
        "key_concepts": [
            {"name": "Ma'at", "desc": "Cosmic truth, justice, and balance. The organizing principle of the universe. After death, the heart is weighed against the feather of Ma'at."},
            {"name": "The Ka, Ba, and Akh", "desc": "The Egyptians understood multiple soul-bodies: Ka (vital force), Ba (personality/soul bird), and Akh (the luminous, immortal spirit-body)."},
            {"name": "The Duat", "desc": "The underworld/afterlife realm through which the soul journeys after death, facing trials and transformations before resurrection."},
            {"name": "Sacred Science", "desc": "The Egyptians encoded spiritual knowledge in architecture, mathematics, astronomy, and art. The Great Pyramid embodies cosmic principles."},
            {"name": "Heka (Magic)", "desc": "The original creative force — the power of spoken word and intention to shape reality. Magic was not superstition but sacred technology."},
            {"name": "Hermeticism", "desc": "The teachings attributed to Thoth/Hermes Trismegistus: 'As above, so below.' The seven Hermetic Principles govern all of creation."},
        ],
        "sacred_texts": ["Book of the Dead (Book of Coming Forth by Day)", "Pyramid Texts", "Coffin Texts", "The Emerald Tablet", "Corpus Hermeticum"],
        "notable_figures": ["Thoth / Hermes Trismegistus", "Imhotep", "Akhenaten", "Isis", "Ptahhotep"],
        "practices": ["Temple initiation", "Dream incubation", "Ritual invocation", "Sacred geometry", "Mummification rites", "Sound healing"],
    },
    {
        "id": "greek_philosophy",
        "name": "Greek Philosophy & Mysteries",
        "color": "#06B6D4",
        "era": "7th Century BCE — 5th Century CE",
        "origin": "Greece / Mediterranean",
        "overview": "Greek philosophy and mystery traditions laid the foundations of Western thought. From Pythagoras's sacred mathematics to Plato's Forms to the Eleusinian Mysteries, the Greeks pursued truth through reason, contemplation, and initiatory experience.",
        "key_concepts": [
            {"name": "The Forms (Plato)", "desc": "The material world is a shadow of perfect, eternal archetypes. True knowledge is remembering (anamnesis) what the soul already knows from the realm of Forms."},
            {"name": "Know Thyself", "desc": "The inscription at Delphi's Oracle and Socrates' core teaching. Self-knowledge is the foundation of wisdom and the examined life."},
            {"name": "The Music of the Spheres", "desc": "Pythagoras discovered that mathematical ratios govern musical harmony — and that the same ratios structure the cosmos. The universe is a symphony."},
            {"name": "Stoic Virtue", "desc": "The Stoics taught that virtue (wisdom, courage, justice, temperance) is the only true good. External circumstances are neither good nor bad — only our response matters."},
            {"name": "Eleusinian Mysteries", "desc": "Secret initiatory rites at Eleusis that revealed the nature of death and rebirth. Participants experienced something that permanently removed the fear of death."},
            {"name": "The Logos", "desc": "Heraclitus's concept of the universal rational principle that governs all change. Later adopted by Christianity as the divine Word."},
        ],
        "sacred_texts": ["Plato's Republic & Symposium", "Meditations (Marcus Aurelius)", "Enneads (Plotinus)", "Golden Verses (Pythagoras)"],
        "notable_figures": ["Socrates", "Plato", "Aristotle", "Pythagoras", "Heraclitus", "Plotinus", "Hypatia"],
        "practices": ["Philosophical dialogue", "Contemplation (Theoria)", "Mathematical meditation", "Mystery initiation", "Journaling (Stoic)"],
    },
    {
        "id": "zen",
        "name": "Zen Buddhism",
        "color": "#78716C",
        "era": "6th Century CE — Present",
        "origin": "China / Japan",
        "overview": "Zen strips Buddhism to its essence: direct pointing at the nature of mind. No scripture, no doctrine — only this moment, this breath, this reality. Zen masters use koans, silence, and even shock to shatter conceptual thinking and reveal what was always already here.",
        "key_concepts": [
            {"name": "Satori / Kensho", "desc": "Sudden awakening — a direct glimpse into one's original nature. Not something gained, but the recognition of what was never lost."},
            {"name": "Beginner's Mind (Shoshin)", "desc": "'In the beginner's mind there are many possibilities, in the expert's mind there are few.' Approaching each moment with fresh, open awareness."},
            {"name": "Koans", "desc": "Paradoxical questions that cannot be solved by rational thinking. 'What is the sound of one hand clapping?' They shatter the thinking mind to reveal what lies beneath."},
            {"name": "Just Sitting (Shikantaza)", "desc": "Sitting with no goal, no technique, no object of meditation. Simply being — fully present, fully alive, fully awake."},
            {"name": "Wabi-Sabi", "desc": "The beauty of imperfection, impermanence, and incompleteness. A cracked bowl is more beautiful than a perfect one because it tells the truth."},
            {"name": "Everyday Zen", "desc": "'Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water.' The sacred is in the ordinary."},
        ],
        "sacred_texts": ["Platform Sutra of Hui Neng", "Mumonkan (Gateless Gate)", "Blue Cliff Record", "Shobogenzo (Dogen)"],
        "notable_figures": ["Bodhidharma", "Hui Neng", "Dogen", "Hakuin", "Shunryu Suzuki", "Thich Nhat Hanh"],
        "practices": ["Zazen (sitting meditation)", "Kinhin (walking meditation)", "Koan practice", "Tea ceremony", "Calligraphy", "Archery (Kyudo)"],
    },
    {
        "id": "yoga_tantra",
        "name": "Yoga & Tantra",
        "color": "#A855F7",
        "era": "3000 BCE — Present",
        "origin": "India / Tibet",
        "overview": "Tantra and classical Yoga share the goal of spiritual liberation but through different means. While classical Yoga emphasizes withdrawal and asceticism, Tantra embraces all of life — including the body, desire, and the material world — as pathways to the divine.",
        "key_concepts": [
            {"name": "Shakti & Shiva", "desc": "The divine feminine (Shakti) and masculine (Shiva) principles. Creation arises from their union. Tantra worships both."},
            {"name": "Kundalini", "desc": "The coiled serpent energy at the base of the spine. When awakened through practice, it rises through the chakras, opening each one, until it merges with cosmic consciousness at the crown."},
            {"name": "The Eight Limbs", "desc": "Patanjali's Ashtanga Yoga: Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi — a complete system for Self-realization."},
            {"name": "Non-Duality", "desc": "Tantra teaches that spirit and matter, sacred and profane, are not separate. Everything is Brahman. Nothing need be rejected on the path."},
            {"name": "Mantra & Yantra", "desc": "Sacred sound formulas (mantras) and geometric patterns (yantras) as tools for concentrating consciousness and invoking divine energies."},
            {"name": "Samadhi", "desc": "The state of absorption where the meditator, the meditation, and the object of meditation merge into one. The culmination of yogic practice."},
        ],
        "sacred_texts": ["Yoga Sutras (Patanjali)", "Vijnanabhairava Tantra", "Shiva Sutras", "Hatha Yoga Pradipika", "Kularnava Tantra"],
        "notable_figures": ["Patanjali", "Matsyendranath", "Gorakhnath", "Abhinavagupta", "B.K.S. Iyengar", "Sri Aurobindo"],
        "practices": ["Hatha Yoga", "Kundalini Yoga", "Mantra japa", "Pranayama", "Tantric ritual", "Yoga Nidra"],
    },
    {
        "id": "african",
        "name": "African Spiritual Traditions",
        "color": "#F97316",
        "era": "Ancient — Present",
        "origin": "Africa",
        "overview": "Africa's spiritual traditions are among the oldest and most diverse on Earth. From the Yoruba Orisha system to Kemetic spirituality to Ubuntu philosophy, African traditions understand the universe as alive with spiritual forces, ancestors, and divine energies that intimately connect to daily life.",
        "key_concepts": [
            {"name": "Ubuntu", "desc": "'I am because we are.' The Southern African philosophy that human identity is fundamentally relational. A person is a person through other people."},
            {"name": "Orisha / Lwa / Nkisi", "desc": "Divine forces of nature and consciousness in Yoruba, Vodou, and Kongo traditions. Not distant gods but living energies that interact with human life."},
            {"name": "Ase (Axe)", "desc": "The Yoruba concept of life force, spiritual power, and the authority to make things happen. Similar to chi/prana but with emphasis on creative power."},
            {"name": "Ancestor Veneration", "desc": "The dead remain active members of the community. They guide, protect, and can be consulted through divination and ritual."},
            {"name": "Ifa Divination", "desc": "The ancient Yoruba oracle system using 256 odu (signs) that encode all of creation's wisdom. UNESCO-recognized as Intangible Cultural Heritage."},
            {"name": "Nommo", "desc": "The Dogon concept of the power of the word. Speech has creative force — to name something is to bring it into being."},
        ],
        "sacred_texts": ["Odu Ifa (oral corpus)", "Egyptian Book of the Dead", "Kebra Nagast (Ethiopian)", "Ubuntu philosophy texts"],
        "notable_figures": ["Orunmila (Yoruba)", "Credo Mutwa", "Malidoma Some", "Sobonfu Some", "Queen Nzinga"],
        "practices": ["Ifa divination", "Drum and dance ceremony", "Ancestor altars", "Libation pouring", "Plant medicine", "Naming ceremonies"],
    },
]


@router.get("/encyclopedia/traditions")
async def get_traditions():
    summary = []
    for t in TRADITIONS:
        summary.append({
            "id": t["id"],
            "name": t["name"],
            "color": t["color"],
            "era": t["era"],
            "origin": t["origin"],
            "overview": t["overview"][:150] + "...",
            "concept_count": len(t["key_concepts"]),
            "text_count": len(t["sacred_texts"]),
        })
    return {"traditions": summary}


@router.get("/encyclopedia/traditions/{tradition_id}")
async def get_tradition(tradition_id: str):
    tradition = next((t for t in TRADITIONS if t["id"] == tradition_id), None)
    if not tradition:
        raise HTTPException(status_code=404, detail="Tradition not found")
    return tradition


@router.post("/encyclopedia/explore")
async def explore_deeper(data: dict = Body(...), user=Depends(get_current_user)):
    """AI-powered deep dive into any teaching or concept."""
    tradition_name = data.get("tradition", "")
    concept = data.get("concept", "")
    question = data.get("question", "")

    if not question and not concept:
        raise HTTPException(status_code=400, detail="A concept or question is required")

    prompt_text = question if question else f"Explain the concept of '{concept}' in the {tradition_name} tradition in depth."

    system = f"""You are a deeply knowledgeable scholar of world spiritual traditions, with particular expertise in {tradition_name}.

Your approach:
- Share authentic, accurate teachings with reverence and depth
- Draw connections between traditions when relevant, but honor each path's uniqueness
- Include practical applications — how this wisdom can be lived, not just understood
- Use evocative language that transmits the feeling-tone of the tradition
- Mention specific texts, teachers, or practices when relevant
- Be scholarly yet accessible — imagine speaking to a sincere seeker, not an academic

Keep responses between 200-400 words. Rich, substantive, and inspiring."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"encyclopedia-{uuid.uuid4().hex[:12]}",
            system_message=system,
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt_text)),
            timeout=45
        )
        return {"response": response, "tradition": tradition_name, "concept": concept}
    except Exception as e:
        logger.error(f"Encyclopedia explore error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate exploration")


TRADITION_VOICE_MAP = {
    "hinduism": "sage", "buddhism": "shimmer", "taoism": "shimmer",
    "sufism": "fable", "kabbalah": "sage", "indigenous": "onyx",
    "mystical_christianity": "fable", "egyptian": "onyx",
    "greek_philosophy": "sage", "zen": "shimmer",
    "yoga_tantra": "sage", "african": "onyx",
}


@router.post("/encyclopedia/traditions/{tradition_id}/narrate")
async def narrate_tradition(tradition_id: str):
    """Generate HD TTS narration for a tradition overview."""
    tradition = next((t for t in TRADITIONS if t["id"] == tradition_id), None)
    if not tradition:
        raise HTTPException(status_code=404, detail="Tradition not found")

    cache_key = secure_hash_short(f"enc-{tradition_id}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}

    narration = (
        f"{tradition['name']}. From {tradition['origin']}, dating to {tradition['era']}. "
        f"{tradition['overview']} "
        f"Key teachings include: {', '.join(c['name'] for c in tradition['key_concepts'][:4])}."
    )

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        voice = TRADITION_VOICE_MAP.get(tradition_id, "fable")
        audio_b64 = await tts.generate_speech_base64(
            text=narration[:4096], model="tts-1-hd", voice=voice, speed=0.85, response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"Encyclopedia TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate narration")


@router.post("/encyclopedia/narrate-text")
async def narrate_text(data: dict = Body(...)):
    """Narrate any text block — used for AI exploration results."""
    text = data.get("text", "")
    voice = data.get("voice", "fable")
    if not text or len(text) < 10:
        raise HTTPException(status_code=400, detail="Text too short")

    cache_key = secure_hash_short(f"enc-text-{text[:100]}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key]}

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=text[:4096], model="tts-1-hd", voice=voice, speed=0.85, response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64}
    except Exception as e:
        logger.error(f"Encyclopedia text TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to narrate text")

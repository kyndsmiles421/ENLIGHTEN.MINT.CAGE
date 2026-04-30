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
    # V68.92 — Pali Canon (10) + Polynesian (3) + Indigenous (3) expansion.
    # Adds 16 new generative-ready traditions. Chapter content auto-
    # generates via the existing /api/sacred-texts/.../generate endpoint.
    {
        "id": "sutta-pitaka",
        "title": "Sutta Pitaka — The Basket of Discourses",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~3rd century BCE (compiled)",
        "color": "#FCD34D",
        "description": "The first basket of the Tipitaka — a vast collection of the Buddha's discourses preserved in five Nikayas. Foundational for Theravada Buddhism's understanding of the Middle Way.",
        "chapters": [
            {"id": "sp-1", "title": "Overview of the Five Nikayas", "number": 1},
            {"id": "sp-2", "title": "The Four Noble Truths in the Discourses", "number": 2},
            {"id": "sp-3", "title": "The Noble Eightfold Path Across Suttas", "number": 3},
            {"id": "sp-4", "title": "Dependent Origination (Paticca-samuppada)", "number": 4},
            {"id": "sp-5", "title": "The Three Marks of Existence", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "lotus_unfolding",
    },
    {
        "id": "digha-nikaya",
        "title": "Digha Nikaya — The Long Discourses",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#FCD34D",
        "description": "34 long suttas of the Buddha — including the Mahaparinibbana Sutta (Buddha's final days), Brahmajala Sutta (the Net of Views), and Sigalovada Sutta (lay ethics).",
        "chapters": [
            {"id": "dn-1", "title": "Brahmajala Sutta — The Net of All Views", "number": 1},
            {"id": "dn-2", "title": "Samaññaphala Sutta — Fruits of Contemplation", "number": 2},
            {"id": "dn-3", "title": "Mahaparinibbana Sutta — The Buddha's Final Days", "number": 16},
            {"id": "dn-4", "title": "Sigalovada Sutta — The Layperson's Code", "number": 31},
            {"id": "dn-5", "title": "Mahasatipatthana Sutta — The Great Foundations of Mindfulness", "number": 22},
        ],
        "voice": "sage",
        "animation_theme": "bodhi_leaf",
    },
    {
        "id": "majjhima-nikaya",
        "title": "Majjhima Nikaya — The Middle-Length Discourses",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#F59E0B",
        "description": "152 middle-length suttas — the heart of the Buddha's teaching. Includes the Anapanasati Sutta (mindfulness of breathing) and the Satipatthana Sutta (foundations of mindfulness).",
        "chapters": [
            {"id": "mn-1", "title": "Mulapariyaya Sutta — The Root of All Things", "number": 1},
            {"id": "mn-2", "title": "Sabbasava Sutta — All the Taints", "number": 2},
            {"id": "mn-3", "title": "Satipatthana Sutta — The Foundations of Mindfulness", "number": 10},
            {"id": "mn-4", "title": "Anapanasati Sutta — Mindfulness of Breathing", "number": 118},
            {"id": "mn-5", "title": "Kalama Sutta — Free Inquiry", "number": 60},
        ],
        "voice": "sage",
        "animation_theme": "incense_smoke",
    },
    {
        "id": "samyutta-nikaya",
        "title": "Samyutta Nikaya — The Connected Discourses",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#FBBF24",
        "description": "Thousands of suttas grouped by theme into 56 samyuttas (connected collections). The Dhammacakkappavattana Sutta — the Buddha's first teaching — lives here.",
        "chapters": [
            {"id": "sn-1", "title": "Dhammacakkappavattana — Setting the Wheel of Dharma in Motion", "number": 1},
            {"id": "sn-2", "title": "Anattalakkhana Sutta — The Mark of Non-Self", "number": 2},
            {"id": "sn-3", "title": "Adittapariyaya Sutta — The Fire Sermon", "number": 3},
            {"id": "sn-4", "title": "Bojjhanga Samyutta — The Seven Factors of Awakening", "number": 4},
            {"id": "sn-5", "title": "Khandha Samyutta — The Five Aggregates", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "dharma_wheel",
    },
    {
        "id": "anguttara-nikaya",
        "title": "Anguttara Nikaya — The Numerical Discourses",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#F59E0B",
        "description": "9,557 suttas organized by numerical lists (one to eleven). A treasury of practical teachings on virtue, friendship, mindfulness, and the householder's path.",
        "chapters": [
            {"id": "an-1", "title": "Book of the Ones — The Singular Mind", "number": 1},
            {"id": "an-2", "title": "Book of the Threes — The Three Refuges", "number": 3},
            {"id": "an-3", "title": "Book of the Fours — The Four Sublime States (Brahmaviharas)", "number": 4},
            {"id": "an-4", "title": "Book of the Sevens — The Seven Treasures", "number": 7},
            {"id": "an-5", "title": "Book of the Tens — The Ten Perfections (Paramis)", "number": 10},
        ],
        "voice": "sage",
        "animation_theme": "counting_beads",
    },
    {
        "id": "khuddaka-nikaya",
        "title": "Khuddaka Nikaya — The Minor Collection",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#FCD34D",
        "description": "The most diverse Nikaya — 15 books including the Dhammapada (already catalogued separately), Sutta Nipata, Theragatha & Therigatha (verses of the elder monks and nuns), Jataka tales, and the Udana.",
        "chapters": [
            {"id": "kn-1", "title": "Sutta Nipata — Group of Discourses", "number": 1},
            {"id": "kn-2", "title": "Udana — Inspired Utterances of the Buddha", "number": 2},
            {"id": "kn-3", "title": "Itivuttaka — Thus Was Said", "number": 3},
            {"id": "kn-4", "title": "Theragatha & Therigatha — Verses of Elders", "number": 4},
            {"id": "kn-5", "title": "Jataka Tales — The Buddha's Past Lives", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "prayer_flags",
    },
    {
        "id": "vinaya-pitaka",
        "title": "Vinaya Pitaka — The Basket of Discipline",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~5th century BCE",
        "color": "#D97706",
        "description": "The monastic code — rules and origin-stories for the Sangha (monastic community), preserved in five books. The framework of mindful community life for over 2,500 years.",
        "chapters": [
            {"id": "vp-1", "title": "Suttavibhanga — Origin of the 227 Patimokkha Rules", "number": 1},
            {"id": "vp-2", "title": "Mahavagga — The Great Section (Ordinations & Robes)", "number": 2},
            {"id": "vp-3", "title": "Cullavagga — The Lesser Section (Schisms & Reconciliation)", "number": 3},
            {"id": "vp-4", "title": "Parivara — The Compendium / Summary", "number": 4},
            {"id": "vp-5", "title": "Bhikkhuni Patimokkha — The Nuns' Code", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "monastery_bell",
    },
    {
        "id": "abhidhamma-pitaka",
        "title": "Abhidhamma Pitaka — The Higher Philosophy",
        "tradition": "Buddhist (Theravada)",
        "region": "India / Sri Lanka",
        "era": "~3rd century BCE",
        "color": "#92400E",
        "description": "The most systematic of the three baskets — seven treatises mapping consciousness, mental factors, and ultimate reality (paramattha) into a precise phenomenology of mind.",
        "chapters": [
            {"id": "ap-1", "title": "Dhammasangani — Enumeration of Dharmas", "number": 1},
            {"id": "ap-2", "title": "Vibhanga — The Book of Analysis", "number": 2},
            {"id": "ap-3", "title": "Dhatukatha — Discussion of Elements", "number": 3},
            {"id": "ap-4", "title": "Patthana — Conditional Relations (the climax)", "number": 4},
            {"id": "ap-5", "title": "Yamaka — The Book of Pairs", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "mandala_geometric",
    },
    {
        "id": "visuddhimagga",
        "title": "Visuddhimagga — The Path of Purification",
        "tradition": "Buddhist (Theravada)",
        "region": "Sri Lanka",
        "era": "5th century CE",
        "color": "#FBBF24",
        "description": "Buddhaghosa's monumental commentary — a 23-chapter manual for meditation, virtue, and wisdom. The most influential post-canonical text in Theravada practice.",
        "chapters": [
            {"id": "vm-1", "title": "Sila — The Foundation of Virtue", "number": 1},
            {"id": "vm-2", "title": "Samadhi — Forty Subjects of Concentration", "number": 2},
            {"id": "vm-3", "title": "The Four Brahmaviharas — Loving-Kindness, Compassion, Joy, Equanimity", "number": 9},
            {"id": "vm-4", "title": "Vipassana — The Insight Knowledges", "number": 18},
            {"id": "vm-5", "title": "Nibbana — The Goal Beyond Conditioning", "number": 23},
        ],
        "voice": "sage",
        "animation_theme": "purifying_fire",
    },
    {
        "id": "milindapanha",
        "title": "Milindapanha — Questions of King Milinda",
        "tradition": "Buddhist (Theravada)",
        "region": "Indo-Greek frontier",
        "era": "~1st century BCE",
        "color": "#FCD34D",
        "description": "A philosophical dialogue between the Greek-Bactrian king Menander I (Milinda) and the Buddhist sage Nagasena — exploring rebirth, no-self, time, and the nature of consciousness.",
        "chapters": [
            {"id": "mp-1", "title": "The Chariot Analogy — On No-Self", "number": 1},
            {"id": "mp-2", "title": "Continuity Without Soul — On Rebirth", "number": 2},
            {"id": "mp-3", "title": "The Knot of Doubt — On Memory and Mind", "number": 3},
            {"id": "mp-4", "title": "Wisdom and Compassion as Two Wings", "number": 4},
            {"id": "mp-5", "title": "Nibbana — The Unconditioned", "number": 5},
        ],
        "voice": "sage",
        "animation_theme": "east_meets_west",
    },
    {
        "id": "kumulipo",
        "title": "The Kumulipo — Hawaiian Creation Chant",
        "tradition": "Polynesian (Native Hawaiian)",
        "region": "Hawaiʻi",
        "era": "~1700 CE (recorded; oral tradition far older)",
        "color": "#10B981",
        "description": "A 2,102-line cosmogonic chant in 16 wā (eras) tracing the genealogy of the universe — from the deep darkness (pō) through coral, sea creatures, plants, animals, and finally humanity. The sacred record of the chiefs of Hawaiʻi.",
        "chapters": [
            {"id": "ku-1", "title": "The Pō — Deep Darkness Before Light", "number": 1},
            {"id": "ku-2", "title": "Coral and the First Living Things", "number": 2},
            {"id": "ku-3", "title": "The Birth of Land and Sea Creatures", "number": 3},
            {"id": "ku-4", "title": "The Coming of the Plant Kingdom", "number": 4},
            {"id": "ku-5", "title": "The Dawn of Humankind and the Aliʻi", "number": 16},
        ],
        "voice": "alloy",
        "animation_theme": "ocean_dawn",
    },
    {
        "id": "huna-principles",
        "title": "The Seven Principles of Huna",
        "tradition": "Polynesian (Native Hawaiian)",
        "region": "Hawaiʻi",
        "era": "Pre-contact oral tradition",
        "color": "#34D399",
        "description": "The hidden wisdom (huna means 'secret') of the kahuna — seven luminous principles for sovereignty, mana, and aloha as a practiced power. Honored across Polynesia in many forms.",
        "chapters": [
            {"id": "hu-1", "title": "IKE — The world is what you think it is", "number": 1},
            {"id": "hu-2", "title": "KALA — There are no limits", "number": 2},
            {"id": "hu-3", "title": "MAKIA — Energy flows where attention goes", "number": 3},
            {"id": "hu-4", "title": "MANAWA — Now is the moment of power", "number": 4},
            {"id": "hu-5", "title": "ALOHA — To love is to be happy with", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "sunlit_palm",
    },
    {
        "id": "whakapapa-maori",
        "title": "Whakapapa — Māori Cosmological Genealogy",
        "tradition": "Polynesian (Māori)",
        "region": "Aotearoa (New Zealand)",
        "era": "Pre-contact oral tradition",
        "color": "#059669",
        "description": "The Māori sacred genealogy — Te Kore (the void), Te Pō (the night), Te Ao Mārama (the world of light), Ranginui & Papatūānuku (Sky Father and Earth Mother), and the lineage of all things.",
        "chapters": [
            {"id": "wm-1", "title": "Te Kore — The Void of Potential", "number": 1},
            {"id": "wm-2", "title": "Te Pō — The Long Night of Becoming", "number": 2},
            {"id": "wm-3", "title": "Ranginui and Papatūānuku — The Sacred Embrace", "number": 3},
            {"id": "wm-4", "title": "Tāne Mahuta — Separator of Sky and Earth", "number": 4},
            {"id": "wm-5", "title": "The Atua and the Living Lineage", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "forest_canopy",
    },
    {
        "id": "lakota-seven-rites",
        "title": "The Seven Sacred Rites of the Lakota",
        "tradition": "Indigenous (Lakota / Sioux)",
        "region": "North America (Great Plains)",
        "era": "Pre-contact oral tradition",
        "color": "#FCA5A5",
        "description": "The seven rites brought to the Lakota people by White Buffalo Calf Woman — Inipi (purification lodge), Hanblecheyapi (vision quest), Wiwanyag Wachipi (sun dance), and four others — held as living covenants with the sacred.",
        "chapters": [
            {"id": "ls-1", "title": "Inipi — The Purification Lodge", "number": 1},
            {"id": "ls-2", "title": "Hanblecheyapi — Crying for a Vision", "number": 2},
            {"id": "ls-3", "title": "Wiwanyag Wachipi — The Sun Dance", "number": 3},
            {"id": "ls-4", "title": "Hunkapi — The Making of Relatives", "number": 4},
            {"id": "ls-5", "title": "Wanagi Yuhapi — Keeping of the Soul", "number": 5},
        ],
        "voice": "echo",
        "animation_theme": "prairie_wind",
    },
    {
        "id": "dreamtime-aboriginal",
        "title": "The Dreamtime — Aboriginal Songlines",
        "tradition": "Indigenous (Aboriginal Australian)",
        "region": "Australia",
        "era": "40,000+ years (oldest continuous tradition)",
        "color": "#FB923C",
        "description": "The Dreaming — the timeless, ever-present creative reality where ancestral beings shaped the land, sea, and sky and continue to do so. Recorded in songlines that are simultaneously map, law, and prayer.",
        "chapters": [
            {"id": "dt-1", "title": "The Rainbow Serpent — Shaping the Land", "number": 1},
            {"id": "dt-2", "title": "Songlines — The Living Map of the Continent", "number": 2},
            {"id": "dt-3", "title": "Tjukurpa — The Law That Flows From Country", "number": 3},
            {"id": "dt-4", "title": "The Wandjina — Ancestral Cloud-Spirits", "number": 4},
            {"id": "dt-5", "title": "Caring for Country — The Living Covenant", "number": 5},
        ],
        "voice": "echo",
        "animation_theme": "ochre_painting",
    },
    {
        "id": "hopi-prophecy",
        "title": "The Hopi Prophecy and Teachings",
        "tradition": "Indigenous (Hopi / Pueblo)",
        "region": "North America (Southwest)",
        "era": "Pre-contact oral tradition",
        "color": "#FBBF24",
        "description": "The teachings of the Peaceful People — the Four Worlds, the prophecy of the Pahana (lost white brother), the Blue Star Kachina, and the call to walk in harmony with Maasaw, guardian of this Fourth World.",
        "chapters": [
            {"id": "hp-1", "title": "The Four Worlds — Emergence and Migration", "number": 1},
            {"id": "hp-2", "title": "Maasaw — The Caretaker of the Fourth World", "number": 2},
            {"id": "hp-3", "title": "The Prophecy of the Pahana", "number": 3},
            {"id": "hp-4", "title": "The Blue Star Kachina and the Day of Purification", "number": 4},
            {"id": "hp-5", "title": "Koyaanisqatsi — Life Out of Balance", "number": 5},
        ],
        "voice": "echo",
        "animation_theme": "canyon_light",
    },
    # V68.93 — Hindu (7) + Mahayana (4) + Sikh (1) + LDS (2) + Avesta (1) = 15 entries.
    # Catalog total: 31 → 46. All generative-ready.
    {
        "id": "rig-veda",
        "title": "Rig Veda — The Hymns of Knowledge",
        "tradition": "Hindu (Vedic)",
        "region": "Ancient India",
        "era": "~1500-1200 BCE",
        "color": "#FB923C",
        "description": "The oldest of the four Vedas — 1,028 hymns to Indra, Agni, Varuna, Soma, and the Visvedevas. The fountainhead of Sanskrit literature and the seed of all later Hindu thought.",
        "chapters": [
            {"id": "rv-1", "title": "Book 1 — Hymns to Agni and Indra", "number": 1},
            {"id": "rv-2", "title": "Book 7 — The Vasishtha Hymns", "number": 7},
            {"id": "rv-3", "title": "Book 9 — The Soma Mandala", "number": 9},
            {"id": "rv-4", "title": "Book 10.90 — The Purusha Sukta", "number": 10},
            {"id": "rv-5", "title": "Book 10.129 — The Nasadiya Sukta (Hymn of Creation)", "number": 10},
        ],
        "voice": "onyx",
        "animation_theme": "vedic_fire",
    },
    {
        "id": "sama-veda",
        "title": "Sama Veda — The Veda of Melodies",
        "tradition": "Hindu (Vedic)",
        "region": "Ancient India",
        "era": "~1200-1000 BCE",
        "color": "#F97316",
        "description": "The Veda of melodies — verses from the Rig Veda set to musical chant for use in Soma rituals. The seed of all Indian classical music.",
        "chapters": [
            {"id": "sv-1", "title": "Purvarcika — The First Chants", "number": 1},
            {"id": "sv-2", "title": "Uttararcika — The Later Chants", "number": 2},
            {"id": "sv-3", "title": "The Stobha Syllables — Sacred Sound", "number": 3},
            {"id": "sv-4", "title": "Saman Hymns of Indra", "number": 4},
            {"id": "sv-5", "title": "Saman Hymns of Soma", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "resonant_chant",
    },
    {
        "id": "yajur-veda",
        "title": "Yajur Veda — The Veda of Sacrificial Formulas",
        "tradition": "Hindu (Vedic)",
        "region": "Ancient India",
        "era": "~1200-800 BCE",
        "color": "#EA580C",
        "description": "The Veda of yajna — prose mantras for ritual sacrifice. Two recensions: the Shukla (white) and Krishna (black). Source of the Isha Upanishad and the Shri Rudram.",
        "chapters": [
            {"id": "yv-1", "title": "Shukla Yajurveda — The White Recension", "number": 1},
            {"id": "yv-2", "title": "Krishna Yajurveda — The Black Recension", "number": 2},
            {"id": "yv-3", "title": "Isha Upanishad — Embedded in the Yajur Veda", "number": 3},
            {"id": "yv-4", "title": "Shri Rudram — The Hymn to Rudra", "number": 4},
            {"id": "yv-5", "title": "The Mahanarayana Upanishad", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "ritual_smoke",
    },
    {
        "id": "atharva-veda",
        "title": "Atharva Veda — The Veda of Atharvan",
        "tradition": "Hindu (Vedic)",
        "region": "Ancient India",
        "era": "~1000-800 BCE",
        "color": "#FDBA74",
        "description": "The fourth Veda — hymns of healing, household life, statecraft, and the householder's path. Includes the Mundaka Upanishad ('From the unreal lead me to the real').",
        "chapters": [
            {"id": "av-1", "title": "Healing Hymns and Plants", "number": 1},
            {"id": "av-2", "title": "Hymns to Domestic Life", "number": 2},
            {"id": "av-3", "title": "Mundaka Upanishad — From Unreal to Real", "number": 3},
            {"id": "av-4", "title": "Prashna Upanishad — The Six Questions", "number": 4},
            {"id": "av-5", "title": "Mandukya Upanishad — Aum and the Four States", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "herbal_glow",
    },
    {
        "id": "mahabharata",
        "title": "The Mahabharata — The Great Epic",
        "tradition": "Hindu (Itihasa)",
        "region": "Ancient India",
        "era": "~400 BCE - 400 CE (compiled)",
        "color": "#DC2626",
        "description": "At 100,000 verses (200,000 lines), the longest epic poem ever composed. The Kurukshetra war, the rivalry of the Pandavas and Kauravas, and the Bhagavad Gita itself nestled within Book 6 (Bhishma Parva).",
        "chapters": [
            {"id": "mb-1", "title": "Adi Parva — The Origins of the Bharata Lineage", "number": 1},
            {"id": "mb-2", "title": "Sabha Parva — The Fateful Game of Dice", "number": 2},
            {"id": "mb-3", "title": "Vana Parva — The Twelve Years in the Forest", "number": 3},
            {"id": "mb-4", "title": "Bhishma Parva — The War Begins (and Krishna's Gita)", "number": 6},
            {"id": "mb-5", "title": "Stri Parva — The Lament of the Women After War", "number": 11},
        ],
        "voice": "onyx",
        "animation_theme": "battlefield_dawn",
    },
    {
        "id": "ramayana",
        "title": "The Ramayana — The Journey of Rama",
        "tradition": "Hindu (Itihasa)",
        "region": "Ancient India",
        "era": "~5th-4th century BCE",
        "color": "#FCA5A5",
        "description": "The epic of dharma in 24,000 verses — Rama's exile, the abduction of Sita by Ravana, the alliance with Hanuman and Sugriva, and the great war in Lanka. The archetypal narrative of righteous love.",
        "chapters": [
            {"id": "rm-1", "title": "Bala Kanda — The Boyhood of Rama", "number": 1},
            {"id": "rm-2", "title": "Ayodhya Kanda — The Exile and the Sandals on the Throne", "number": 2},
            {"id": "rm-3", "title": "Aranya Kanda — The Forest and the Abduction of Sita", "number": 3},
            {"id": "rm-4", "title": "Kishkindha Kanda — Alliance with Sugriva and Hanuman", "number": 4},
            {"id": "rm-5", "title": "Yuddha Kanda — The Great War in Lanka", "number": 6},
        ],
        "voice": "onyx",
        "animation_theme": "forest_arrow",
    },
    {
        "id": "brahma-sutras",
        "title": "The Brahma Sutras of Badarayana",
        "tradition": "Hindu (Vedanta)",
        "region": "Ancient India",
        "era": "~200 BCE - 200 CE",
        "color": "#FED7AA",
        "description": "555 aphoristic verses systematizing the teachings of the Upanishads. The third pillar of the prasthanatrayi (with Upanishads and Gita) — foundational for Advaita, Vishishtadvaita, and Dvaita Vedanta.",
        "chapters": [
            {"id": "bs-1", "title": "Samanvaya — Harmony of Texts", "number": 1},
            {"id": "bs-2", "title": "Avirodha — Resolution of Apparent Contradictions", "number": 2},
            {"id": "bs-3", "title": "Sadhana — The Means of Realization", "number": 3},
            {"id": "bs-4", "title": "Phala — The Fruit of Realization", "number": 4},
            {"id": "bs-5", "title": "The Three Schools of Vedanta — Shankara, Ramanuja, Madhva", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "vedanta_lotus",
    },
    {
        "id": "lotus-sutra",
        "title": "The Lotus Sutra — Saddharma Pundarika",
        "tradition": "Buddhist (Mahayana)",
        "region": "India / China / Japan",
        "era": "~1st century BCE - 2nd century CE",
        "color": "#FBBF24",
        "description": "One of the most influential Mahayana sutras — declares that all beings will attain Buddhahood. The Tendai, Nichiren, and other schools center their practice here. The famous Burning House parable lives in Chapter 3.",
        "chapters": [
            {"id": "ls-1", "title": "Chapter 1 — The Introduction at Vulture Peak", "number": 1},
            {"id": "ls-2", "title": "Chapter 2 — Skillful Means (Upaya)", "number": 2},
            {"id": "ls-3", "title": "Chapter 3 — The Parable of the Burning House", "number": 3},
            {"id": "ls-4", "title": "Chapter 16 — The Buddha's Eternal Lifespan", "number": 16},
            {"id": "ls-5", "title": "Chapter 25 — The Universal Gateway of Avalokiteshvara", "number": 25},
        ],
        "voice": "alloy",
        "animation_theme": "lotus_blooming",
    },
    {
        "id": "heart-sutra",
        "title": "The Heart Sutra — Prajnaparamita Hridaya",
        "tradition": "Buddhist (Mahayana)",
        "region": "India / Tibet / East Asia",
        "era": "~350 CE",
        "color": "#F59E0B",
        "description": "The most concise Mahayana scripture — a single page condensing the entire Prajnaparamita corpus. 'Form is emptiness, emptiness is form.' Recited daily across East Asian Buddhism.",
        "chapters": [
            {"id": "hs-1", "title": "Avalokiteshvara's Vision of Emptiness", "number": 1},
            {"id": "hs-2", "title": "Form Is Emptiness, Emptiness Is Form", "number": 2},
            {"id": "hs-3", "title": "No Eye, No Ear, No Nose — The Negation of Aggregates", "number": 3},
            {"id": "hs-4", "title": "The Mantra: Gate Gate Paragate Parasamgate Bodhi Svaha", "number": 4},
            {"id": "hs-5", "title": "Commentary Across Traditions", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "empty_circle",
    },
    {
        "id": "diamond-sutra",
        "title": "The Diamond Sutra — Vajracchedika Prajnaparamita",
        "tradition": "Buddhist (Mahayana)",
        "region": "India / China",
        "era": "~4th century CE",
        "color": "#EAB308",
        "description": "A dialogue between the Buddha and Subhuti on the wisdom that cuts through illusion like a diamond. The world's earliest dated printed book (868 CE Dunhuang scroll).",
        "chapters": [
            {"id": "ds-1", "title": "Subhuti's Question on Bodhisattva Practice", "number": 1},
            {"id": "ds-2", "title": "Liberating All Beings Without Holding the Notion of Beings", "number": 2},
            {"id": "ds-3", "title": "Giving Without Attachment to Form", "number": 3},
            {"id": "ds-4", "title": "The Tathagata Has No Definite Form", "number": 4},
            {"id": "ds-5", "title": "All Conditioned Phenomena Are Like Dreams", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "cutting_diamond",
    },
    {
        "id": "lankavatara-sutra",
        "title": "The Lankavatara Sutra — Discourse on Lanka",
        "tradition": "Buddhist (Mahayana)",
        "region": "India / China",
        "era": "~4th-5th century CE",
        "color": "#FACC15",
        "description": "The Buddha's discourse to the Lord of Lanka — central text of the Yogacara school and a key Zen scripture. Bodhidharma transmitted this to Huike. Source of the 'mind-only' (cittamatra) doctrine.",
        "chapters": [
            {"id": "lk-1", "title": "The Questions of Ravana, Lord of Lanka", "number": 1},
            {"id": "lk-2", "title": "The Storehouse Consciousness (Alaya-vijnana)", "number": 2},
            {"id": "lk-3", "title": "The Three Natures (Trisvabhava)", "number": 3},
            {"id": "lk-4", "title": "The Eight Consciousnesses", "number": 4},
            {"id": "lk-5", "title": "Sudden Awakening and the Tathagatagarbha", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "island_mist",
    },
    {
        "id": "guru-granth-sahib",
        "title": "Guru Granth Sahib — The Eternal Living Guru",
        "tradition": "Sikh",
        "region": "Punjab",
        "era": "1604-1708 CE (final form)",
        "color": "#FB923C",
        "description": "The 1,430-page eternal Guru of Sikhism — compositions of six Sikh Gurus + 15 bhagats (Hindu, Muslim, low-caste poets) in 31 ragas. The only scripture worshipped as a living Guru in any tradition.",
        "chapters": [
            {"id": "gg-1", "title": "Mool Mantar & Japji Sahib — Guru Nanak's Foundation", "number": 1},
            {"id": "gg-2", "title": "Asa di Vaar — Morning Hymns of Praise", "number": 2},
            {"id": "gg-3", "title": "Sukhmani Sahib — The Pearl of Peace (Guru Arjan)", "number": 3},
            {"id": "gg-4", "title": "Anand Sahib — The Hymn of Bliss (Guru Amar Das)", "number": 4},
            {"id": "gg-5", "title": "Multi-Faith Bhagat Bani — Kabir, Ravidas, Sheikh Farid", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "khanda_radiance",
    },
    {
        "id": "book-of-mormon",
        "title": "The Book of Mormon — Another Testament of Jesus Christ",
        "tradition": "Christian (LDS / Restoration)",
        "region": "Americas",
        "era": "Translated 1827-1830 CE",
        "color": "#FCD34D",
        "description": "A 531-page record of ancient peoples in the Americas (Nephites, Lamanites, Jaredites) translated by Joseph Smith. Centers on the post-resurrection visit of Christ to the New World.",
        "chapters": [
            {"id": "bm-1", "title": "1 Nephi — The Lehi Family Leaves Jerusalem", "number": 1},
            {"id": "bm-2", "title": "2 Nephi 2 — Adam Fell That Men Might Be", "number": 2},
            {"id": "bm-3", "title": "Mosiah 18 — King Benjamin's Address", "number": 3},
            {"id": "bm-4", "title": "3 Nephi 11-26 — Christ Appears in the Americas", "number": 4},
            {"id": "bm-5", "title": "Moroni 10 — The Promise to Test the Book", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "ancient_plates",
    },
    {
        "id": "pearl-of-great-price",
        "title": "The Pearl of Great Price",
        "tradition": "Christian (LDS / Restoration)",
        "region": "USA",
        "era": "Compiled 1851 CE",
        "color": "#FBBF24",
        "description": "Selections including the Book of Moses, the Book of Abraham, Joseph Smith's translation of Matthew, his testimony, and the 13 Articles of Faith.",
        "chapters": [
            {"id": "pgp-1", "title": "Book of Moses — The Vision of Moses", "number": 1},
            {"id": "pgp-2", "title": "Book of Abraham — The Plan of Salvation", "number": 2},
            {"id": "pgp-3", "title": "Joseph Smith — Matthew", "number": 3},
            {"id": "pgp-4", "title": "Joseph Smith — History", "number": 4},
            {"id": "pgp-5", "title": "The 13 Articles of Faith", "number": 5},
        ],
        "voice": "alloy",
        "animation_theme": "pearl_radiance",
    },
    {
        "id": "zend-avesta",
        "title": "The Avesta — Sacred Scripture of Zoroastrianism",
        "tradition": "Zoroastrian",
        "region": "Ancient Persia",
        "era": "~1500-300 BCE (composed)",
        "color": "#FB7185",
        "description": "The sacred texts of Zarathustra — including the Gathas (Zarathustra's own hymns), the Yasna (liturgy), the Vendidad (law), and the Yashts (hymns to Yazatas). The dualistic vision of Asha vs Druj — Truth vs Lie.",
        "chapters": [
            {"id": "za-1", "title": "The Gathas — Zarathustra's 17 Hymns", "number": 1},
            {"id": "za-2", "title": "Yasna 28-34 — The First Gatha (Ahunavaiti)", "number": 2},
            {"id": "za-3", "title": "The Vendidad — Laws Against the Lie", "number": 3},
            {"id": "za-4", "title": "Yasht 10 — The Hymn to Mithra", "number": 4},
            {"id": "za-5", "title": "Asha vs Druj — The Cosmic Dualism", "number": 5},
        ],
        "voice": "onyx",
        "animation_theme": "sacred_flame",
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

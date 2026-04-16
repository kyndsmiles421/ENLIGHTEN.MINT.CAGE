"""
OmniCultural Intelligence Bridge — V55.1
The Cross-Cultural Neural Network connecting all pillars.

EACH TRADITION SPEAKS FOR ITSELF. The AI finds genuine common threads.
No forced mapping between unrelated systems.

Traditions represented:
- Lakota Star Knowledge (Wicahpi Oyate) — sourced from Ronald Goodman's research + elder oral tradition
- Lakota Medicine Wheel (Cangleska Wakan) — Four Directions, life stages, elements
- Sacred Geometry (Western esoteric: Fibonacci, Phi, Metatron's Cube, Flower of Life)
- Eastern traditions (Ayurveda, TCM, Yoga, Buddhist philosophy)
- Modern science (physics, biology, neuroscience)

The OmniBridge AI identifies authentic parallels — NOT forced equivalences.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user_optional, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
import asyncio
import uuid

router = APIRouter()

# ═══════════════════════════════════════════════════════════════
# LAKOTA STAR KNOWLEDGE — Wicahpi Oyate (Star Nation)
# Sources: Ronald Goodman "Lakota Star Knowledge", Native Skywatchers,
# Akta Lakota Museum, NASA Sun-Earth Day Lakota resources
# ═══════════════════════════════════════════════════════════════
LAKOTA_SKY = {
    "cansasa_ipusye": {
        "english": "Dried Red Willow (parts of Triangulum & Aries)",
        "lakota": "Cansasa Ipusye",
        "meaning": "A wooden spoon used to carry a coal to light the sacred pipe",
        "teaching": "At spring equinox, the Sun aligns with Cansasa Ipusye and the Big Dipper at sunrise, signaling the time for pipe ceremonies to regenerate the Earth. It is the cosmic lighter — connecting fire on Earth to fire in the sky.",
        "ceremony": "Spring equinox pipe ceremony — cosmic and earthly renewal",
        "season": "Spring equinox marker",
    },
    "gleska_wakan": {
        "english": "Sacred Hoop / The Great Racetrack (Winter Hexagon variant)",
        "lakota": "Gleska Wakan",
        "meaning": "The great racetrack in the sky where birds raced the buffalo",
        "teaching": "Sirius, Procyon, Pollux, Castor, Capella, the Pleiades, and Rigel form this great hoop. It is the site of the Great Race where the winged ones defeated the four-legged, securing the role of humans as caretakers. The red clay ring around the Black Hills mirrors this celestial racetrack — as above, so below.",
        "ceremony": "Storytelling, teaching the Great Race narrative",
        "season": "Winter — visible as the dominant sky feature",
    },
    "nape": {
        "english": "The Hand (southern Orion)",
        "lakota": "Nape",
        "meaning": "A great chief's hand reaching across the sky",
        "teaching": "The belt of Orion is the chief's wrist, the sword is the thumb. The Hand represents harmony between the gods, the people, and the youth. It teaches that leadership extends itself — an open hand, not a closed fist.",
        "ceremony": "Leadership teachings, governance",
        "season": "Winter — prominent in the southern sky",
    },
    "wicincala_sakowin": {
        "english": "Seven Little Girls (Pleiades)",
        "lakota": "Wicincala Sakowin",
        "meaning": "Seven young women who were lifted to the sky",
        "teaching": "Seven girls were chased by a great bear. They prayed and the Earth raised them on a great rock tower (Mato Tipila / Devils Tower). They became the Pleiades. The bear's claw marks remain on the tower. It teaches that the Creator provides escape through elevation — and that sacred sites on Earth are mirrored in the sky.",
        "ceremony": "Coming-of-age rites, spring stories when the Pleiades return",
        "season": "Their disappearance marks planting; their return marks harvest",
    },
    "tayamni": {
        "english": "Bear's Lodge (8 stars of Gemini)",
        "lakota": "Tayamni",
        "meaning": "An irregular rectangle of stars associated with Mato Tipila (Devils Tower)",
        "teaching": "Tayamni marks midsummer and is linked to the Sun Dance (Wi Wachepi). When these stars are prominent, the people gather for the most sacred ceremony of renewal. The geometry of the rectangle in the sky maps to the geometry of the gathering circle on Earth.",
        "ceremony": "Sun Dance (Wi Wachepi) — renewal, sacrifice, prayer",
        "season": "Midsummer / summer solstice",
    },
    "wakinyan": {
        "english": "Thunderbird (13 stars of Draco + Ursa Minor)",
        "lakota": "Wakinyan",
        "meaning": "The Thunder Beings — bringers of rain, cleaners of the Earth",
        "teaching": "Wakinyan appears in spring and summer. The Thunder Beings are both feared and welcomed — their storms bring the rain that feeds the land. They battle the forces of stagnation and evil. Heyoka (sacred clowns) are those struck by Wakinyan's lightning — they see the world backwards to teach truth through contradiction.",
        "ceremony": "Welcoming the Thunderbeings in spring, Heyoka ceremonies",
        "season": "Spring/Summer — storm season",
    },
    "wicahpi_owanjila": {
        "english": "Star That Stands Still (Polaris)",
        "lakota": "Wicahpi Owanjila",
        "meaning": "The one star that does not move — the fixed point all others circle around",
        "teaching": "While all stars travel the sky, Polaris remains. It is wakan (sacred) for its stillness. It teaches that amidst all motion and change, there is a center that holds. The people navigate by this star — physically and spiritually. Stillness is not absence; it is the axis.",
        "ceremony": "Navigation, spiritual centering, vision quest orientation",
        "season": "All seasons — the eternal center",
    },
    "anpo_wicahpi": {
        "english": "Morning Star (Venus)",
        "lakota": "Anpo Wicahpi",
        "meaning": "The star that brings the dawn — herald of new light",
        "teaching": "Anpo Wicahpi appears before the Sun, carrying prayers from the Earth to Wakan Tanka. Seeing it at dawn means your prayers are being received. It is the bridge between night and day, between the seen and unseen. Fallen Star (the hero son of the North Star and a Lakota woman) descended to teach the people — knowledge comes from the stars to the Earth.",
        "ceremony": "Morning prayer, pipe ceremony at dawn, prayers for wisdom",
        "season": "Visible at dawn — the time of prayer and new beginnings",
    },
    "wanagi_tacanku": {
        "english": "Trail of the Spirits (Milky Way)",
        "lakota": "Wanagi Tacanku",
        "meaning": "The path souls travel to the spirit world after death",
        "teaching": "The Milky Way is the road of the dead. Each star is an ancestor. An old woman sits at the fork of the trail — she examines each soul's tattoos (marks of a life well-lived) and sends them either to the spirit world or back to Earth to try again. It teaches that how you live determines where you walk after death.",
        "ceremony": "Wanagi Wicagluha (Keeping of the Soul), honoring the deceased",
        "season": "Best visible in summer — the gathering season when ancestors are closest",
    },
}

# ═══════════════════════════════════════════════════════════════
# LAKOTA MEDICINE WHEEL — Cangleska Wakan
# Four Directions, Four Stages of Life, Four Elements
# Source: Akta Lakota Museum, Hanblechiadesigns, SD Tribal Relations
# ═══════════════════════════════════════════════════════════════
MEDICINE_WHEEL = {
    "east": {
        "direction": "East",
        "color": "Yellow",
        "lakota": "Wiyohiyanpata",
        "season": "Spring",
        "life_stage": "Birth / Infancy",
        "element": "Air / Vision",
        "animal": "Brown Eagle",
        "teaching": "New beginnings, enlightenment, spiritual awakening. The East is where the Sun rises — all journeys begin here. The eagle flies highest and sees farthest. East teaches clarity of vision.",
        "virtue": "Wisdom (receives new knowledge)",
    },
    "south": {
        "direction": "South",
        "color": "White",
        "lakota": "Itokagata",
        "season": "Summer",
        "life_stage": "Youth / Growth",
        "element": "Life / Nourishment",
        "animal": "Crane",
        "teaching": "Warmth, generosity, strength, happiness. The South is abundance — where things grow. The crane migrates vast distances, teaching that growth requires movement and faith.",
        "virtue": "Generosity (gives without expectation)",
    },
    "west": {
        "direction": "West",
        "color": "Black",
        "lakota": "Wiyohpeyata",
        "season": "Autumn",
        "life_stage": "Adulthood / Maturity",
        "element": "Water / Introspection",
        "animal": "Black Eagle / Bear",
        "teaching": "Maturity, healing, reflection. The West is where the Sun sets and the Thunder Beings (Wakinyan) dwell. Rain comes from the West — purification. The bear hibernates in the West, teaching the power of going inward.",
        "virtue": "Bravery (faces the unknown)",
    },
    "north": {
        "direction": "North",
        "color": "Red",
        "lakota": "Waziyata",
        "season": "Winter",
        "life_stage": "Elderhood / Wisdom",
        "element": "Fire / Endurance",
        "animal": "Buffalo",
        "teaching": "Wisdom, endurance, purification through hardship. The North wind is cold and tests the people. Those who survive winter carry the deepest knowledge. The buffalo provided everything — food, shelter, tools — teaching total generosity even in death.",
        "virtue": "Fortitude (endures all things)",
    },
    "center": {
        "direction": "Center",
        "color": "Green (Earth)",
        "lakota": "Mitakuye Oyasin",
        "season": "All Seasons",
        "life_stage": "The Whole Being",
        "element": "Earth / Spirit",
        "animal": "All Relations",
        "teaching": "Mitakuye Oyasin — We Are All Related. The center of the wheel is where all directions meet. It is the heartbeat of the Earth, the place where the physical and spiritual are one. You stand at the center of your own medicine wheel.",
        "virtue": "Balance (harmony of all four directions)",
    },
}

# ═══════════════════════════════════════════════════════════════
# CROSS-CULTURAL KNOWLEDGE MAP
# Each tradition speaks for ITSELF. Bridges are genuine parallels,
# not forced equivalences.
# ═══════════════════════════════════════════════════════════════
CULTURAL_BRIDGES = {
    "geometry": {
        "lakota": "The Sacred Hoop (Cangleska Wakan) is the Lakota's foundational geometry — the circle, not the cube. Gleska Wakan (Sacred Hoop in the sky) mirrors the Black Hills on Earth. Geometry is lived, not abstracted.",
        "western_sacred": "Metatron's Cube (Kabbalistic tradition) contains the 5 Platonic Solids. The Flower of Life (Egyptian/universal). Fibonacci spirals in growth patterns.",
        "eastern": "Yantra and Mandala traditions map consciousness onto geometric forms. The Sri Yantra's 9 interlocking triangles represent the union of Shiva and Shakti.",
        "science": "Fibonacci spirals appear in DNA, galaxies, phyllotaxis, and hurricanes. The same mathematical ratios govern growth at every scale.",
        "genuine_thread": "All traditions recognize that the patterns in nature are not random — they are instructions. Whether you call it Sacred Hoop, Mandala, or Fibonacci, the observation is the same: creation follows geometry.",
    },
    "breathwork": {
        "lakota": "The sacred pipe (Canunpa) ceremony IS breathwork — the breath carries prayers through sacred tobacco to Wakan Tanka. Breath is the vehicle of intention. Anpo Wicahpi (Morning Star) watches over dawn pipe ceremonies.",
        "western_sacred": "Breath modulates the Fibonacci rhythm. The φ-ratio appears in heart rate variability during coherent breathing states.",
        "eastern": "Pranayama (Sanskrit: prana = life force, yama = control). Breath is the bridge between conscious and autonomic nervous systems. Alternate nostril breathing balances the nadis.",
        "science": "Slow breathing (6 breaths/min) activates the vagus nerve, shifting from sympathetic (fight/flight) to parasympathetic (rest/digest). HRV coherence peaks at this rate.",
        "genuine_thread": "Lakota pipe, yogic pranayama, and clinical breathwork all arrive at the same truth: conscious breath is the fastest path to altered states of consciousness.",
    },
    "meditation": {
        "lakota": "Hanblecya (Vision Quest) — 4 days alone on a hilltop, fasting, praying, seeking a vision. Wicahpi Owanjila (Polaris) teaches that stillness is the axis of all movement. The Milky Way (Wanagi Tacanku) connects the living to the ancestors through quiet.",
        "western_sacred": "Contemplative prayer (Christian mysticism), Kabbalistic meditation, Hermetic visualization. The Stillness Reward reveals hidden geometric octants.",
        "eastern": "Zen zazen, Vipassana insight meditation, yogic dhyana. 'Be still and know' appears across all traditions.",
        "science": "After 30 seconds of stillness, brainwaves shift from Beta (13-30Hz) to Alpha (8-13Hz). Extended stillness produces Theta (4-8Hz) — the same state as dreaming while awake.",
        "genuine_thread": "Every tradition discovered independently that if you stop moving and stop talking for long enough, something speaks back. The method differs. The discovery is universal.",
    },
    "crystals": {
        "lakota": "Inyan (Stone/Rock) is the first of the Lakota creation beings — the oldest and most sacred. Stone people carry the memory of the Earth. Inipi (Sweat Lodge) uses heated stones (Tunkasilas — Grandfathers) as the source of purification.",
        "western_sacred": "Crystal grid work, gem elixirs, crystal healing associations with chakras and planetary energies.",
        "eastern": "Ratna Chikitsa (Ayurvedic gem therapy) assigns healing properties based on planetary rulership. Jade in Chinese tradition represents virtue and immortality.",
        "science": "Crystalline structures exhibit piezoelectricity — converting mechanical pressure to electrical charge. Quartz oscillates at precise frequencies, which is why it keeps time in watches.",
        "genuine_thread": "The Lakota honor stones as the oldest living beings. Science confirms they are the oldest solid matter on Earth. Both recognize that stones are not inert — they hold energy and information.",
    },
    "oracle": {
        "lakota": "Star reading was practiced by Keepers of the Stars (Wicahpi Awanyankapi). The positions of Cansasa Ipusye at spring equinox determined when ceremonies could begin. The old woman on the Spirit Trail reads your soul's markings — divination is also judgment.",
        "western_sacred": "Tarot, astrology, I Ching, runes — symbolic systems that mirror the questioner's inner state through external patterns.",
        "eastern": "Jyotish (Vedic astrology), the I Ching's 64 hexagrams, and the Tibetan Mo divination all use structured randomness to bypass the analytical mind.",
        "science": "Pattern recognition is the brain's primary function. Divination systems leverage pareidolia and priming to access subconscious knowledge the conscious mind is blocking.",
        "genuine_thread": "No culture on Earth failed to develop a method of reading the invisible. The sky, the cards, the bones, the coins — the medium changes, but the human need to know is universal.",
    },
    "herbology": {
        "lakota": "Plant medicine is tied to the 13 moons (Hanwi) — each moon governs which plants are ready and which ceremonies require them. Sage (Peji hota), sweetgrass (Wachanga), cedar (Hante), and tobacco (Canli) are the four sacred plants used for smudging and prayer.",
        "western_sacred": "Alchemical herbology, Paracelsus's Doctrine of Signatures — the plant's appearance reveals its medicinal purpose.",
        "eastern": "TCM (Traditional Chinese Medicine) organizes 400+ herbs by temperature, flavor, and meridian affinity. Ayurveda classifies by dosha, rasa (taste), and virya (potency).",
        "science": "Phytochemistry confirms indigenous knowledge: willow bark → salicylic acid (aspirin), echinacea → immune activation, turmeric → anti-inflammatory curcumin.",
        "genuine_thread": "Every tradition on Earth developed a pharmacopeia from local plants, independently arriving at many of the same medicinal applications. The plants taught the people — not the other way around.",
    },
    "economy": {
        "lakota": "The Giveaway ceremony (Wopila) — wealth is measured by what you give away, not what you accumulate. The most generous person is the most honored. The buffalo gave everything — its death sustained the entire nation. Economy is generosity.",
        "western_sacred": "The φ-escrow mirrors the Golden Ratio found in efficient resource distribution in natural ecosystems. Sacred economics proposes money as a medium of gift, not extraction.",
        "eastern": "Dana (Buddhist generosity) — the first of the Six Paramitas. In Jain tradition, Aparigraha (non-possessiveness) is a core vow. Wealth circulates; it is never owned.",
        "science": "Game theory shows that reciprocal altruism is the most stable long-term strategy. Ecosystems with the highest biodiversity practice the most nutrient exchange.",
        "genuine_thread": "The Lakota Giveaway, Buddhist Dana, and ecological nutrient cycling all encode the same law: systems that circulate resources thrive; systems that hoard collapse.",
    },
    "academy": {
        "lakota": "Knowledge was passed from elders to youth through oral tradition, ceremonial instruction, and lived experience on the land. You didn't 'graduate' — you demonstrated knowledge by living it. The Vision Quest was the ultimate test: alone, without food, you proved your readiness by surviving and receiving guidance.",
        "western_sacred": "The mystery schools of Egypt, Greece, and the Kabbalistic tradition all taught through progressive initiation — knowledge was earned through stages of readiness.",
        "eastern": "Guru-Shishya parampara (teacher-student lineage) in Hinduism. The Dharma transmission in Zen Buddhism — mind to mind, beyond words.",
        "science": "Spaced repetition, embodied cognition, and spatial memory (Method of Loci) all confirm that knowledge retained through experience and environment far exceeds knowledge from reading alone.",
        "genuine_thread": "Every tradition agrees: real knowledge is not information. It is transformation through direct experience. The Academy module places learning inside a 3D environment because the Lakota, the Greeks, and neuroscience all confirm: you remember what you walk through.",
    },
    "music": {
        "lakota": "The drum is the heartbeat of the Earth (Unci Maka). Drum circles at 60-80 BPM synchronize participants into a shared trance state. Songs are received in dreams and visions — they are not composed, they are given. Each ceremony has specific songs that cannot be sung outside their context.",
        "western_sacred": "Solfeggio frequencies (396Hz, 528Hz, 741Hz), Pythagorean tuning, the Music of the Spheres — the belief that celestial bodies produce harmonious sound.",
        "eastern": "Nada Yoga (yoga of sound), Tibetan singing bowls, the sacred syllable OM (AUM) as the primordial vibration from which creation emerged.",
        "science": "Cymatics (Ernst Chladni) proves sound creates geometric patterns in matter. Binaural beats entrain brainwave states. Music therapy is now evidence-based for pain, anxiety, and neurological rehabilitation.",
        "genuine_thread": "The Lakota drum, the Tibetan bowl, and the lab oscilloscope all demonstrate the same phenomenon: sound organizes matter. Rhythm synchronizes biology. Music is not decoration — it is architecture.",
    },
    "nourishment": {
        "lakota": "Food is tied to the 13 moons and the migrations of the buffalo (Tatanka). The Lakota practiced seasonal eating by necessity and wisdom — you eat what the Earth provides in that season. Wasna (pemmican) — dried buffalo meat with berries and fat — was the original energy food, sustaining warriors and travelers.",
        "western_sacred": "Alchemical nutrition, the Eucharist (bread and wine as sacred consumption), fasting as spiritual practice.",
        "eastern": "Ayurvedic Ritucharya (seasonal eating), Sattvic diet for meditation, TCM food therapy organizing foods by temperature and organ affinity. Fasting in Ramadan, Ekadashi, Yom Kippur.",
        "science": "Circadian nutrition confirms WHEN you eat matters as much as WHAT. Seasonal eating aligns with available microbiome diversity. Intermittent fasting activates autophagy (cellular cleanup).",
        "genuine_thread": "The Lakota 13-moon eating cycle, Ayurvedic Ritucharya, and circadian nutrition research all point to the same principle: the body is a seasonal instrument. Feed it in rhythm, not on demand.",
    },
}

# ═══════════════════════════════════════════════════════════════
# METATRON'S CUBE NODE MAP — Western Sacred Geometry (NOT Lakota)
# Properly attributed to Kabbalistic/Western esoteric tradition
# ═══════════════════════════════════════════════════════════════
METATRON_NODES = [
    {"name": "Bindu (Center)", "tradition": "Hindu/Western", "platonic": "Ether/Void", "academy": "Sacred Geometry Foundation"},
    {"name": "Fire Tetrahedron", "tradition": "Platonic/Hermetic", "platonic": "Fire", "academy": "Breathwork & Pranayama"},
    {"name": "Earth Hexahedron", "tradition": "Platonic/Hermetic", "platonic": "Earth", "academy": "Movement & Yoga"},
    {"name": "Water Icosahedron", "tradition": "Platonic/Hermetic", "platonic": "Water", "academy": "Herbology & Nourishment"},
    {"name": "Air Octahedron", "tradition": "Platonic/Hermetic", "platonic": "Air", "academy": "Crystal & Earth Medicine"},
    {"name": "Ether Dodecahedron", "tradition": "Platonic/Hermetic", "platonic": "Ether", "academy": "Frequency & Music"},
    {"name": "Seed of Life", "tradition": "Egyptian/Universal", "platonic": "Genesis", "academy": "Meditation & Stillness"},
    {"name": "Flower of Life", "tradition": "Egyptian/Universal", "platonic": "Growth", "academy": "Oracle & Divination"},
    {"name": "Fruit of Life", "tradition": "Kabbalistic", "platonic": "Manifestation", "academy": "Community & Sovereignty"},
    {"name": "Tree of Life", "tradition": "Kabbalistic", "platonic": "Structure", "academy": "Economy & Credits"},
    {"name": "Vesica Piscis", "tradition": "Christian/Pythagorean", "platonic": "Duality", "academy": "Art & Creation"},
    {"name": "Torus", "tradition": "Modern Sacred Geometry", "platonic": "Flow", "academy": "Sacred Texts & History"},
    {"name": "Merkaba", "tradition": "Kabbalistic/Egyptian", "platonic": "Ascension", "academy": "Tantra & Connection"},
]

# ═══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/omni-bridge/insight")
async def cross_cultural_insight(data: dict = Body(...)):
    """
    The Cross-Cultural Neural Network.
    Each tradition speaks for itself. The AI finds genuine common threads.
    """
    module = data.get("module", "general")
    topic = data.get("topic", "")
    user_context = data.get("context", "")

    if not topic:
        raise HTTPException(400, "topic is required")

    bridge = CULTURAL_BRIDGES.get(module, CULTURAL_BRIDGES.get("academy", {}))

    cross_cultural_prompt = f"""You are the OmniCultural Intelligence of ENLIGHTEN.MINT.CAFE.
You represent MULTIPLE traditions — each speaking in its OWN voice. 
You do NOT force equivalences between traditions. You find GENUINE common threads.

The user is in the "{module}" module, exploring: "{topic}"
{f'Context: {user_context}' if user_context else ''}

LAKOTA PERSPECTIVE:
{bridge.get('lakota', 'Mitakuye Oyasin — We Are All Related.')}

WESTERN SACRED GEOMETRY:
{bridge.get('western_sacred', 'The Golden Ratio governs natural growth patterns.')}

EASTERN TRADITION:
{bridge.get('eastern', '')}

MODERN SCIENCE:
{bridge.get('science', '')}

GENUINE COMMON THREAD:
{bridge.get('genuine_thread', '')}

Rules:
1. Let each tradition speak in its OWN voice — do not paraphrase one tradition through another's lens
2. Name the specific Lakota concepts in Lakota language (with translation)
3. Identify what these traditions GENUINELY share — not forced parallels
4. Give the user ONE specific practice from EACH tradition they can try right now
5. Be honest when traditions differ or disagree — that's also valuable
6. Speak with warmth and respect for all lineages

Keep it concise (3-4 paragraphs). End with the genuine thread that connects them."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"omni-bridge-{str(uuid.uuid4())}",
            system_message="You are the OmniCultural Intelligence — a respectful bridge between traditions. Each tradition speaks in its own voice. You find genuine parallels, never forced equivalences.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=cross_cultural_prompt)
        response = await asyncio.wait_for(chat.send_message(msg), timeout=45)

        result = {
            "module": module,
            "topic": topic,
            "insight": response,
            "traditions": {
                "lakota": bridge.get("lakota", ""),
                "western_sacred": bridge.get("western_sacred", ""),
                "eastern": bridge.get("eastern", ""),
                "science": bridge.get("science", ""),
            },
            "genuine_thread": bridge.get("genuine_thread", ""),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

        await db.omni_bridge_cache.update_one(
            {"module": module, "topic": topic},
            {"$set": result},
            upsert=True,
        )
        return result

    except asyncio.TimeoutError:
        raise HTTPException(500, "Cross-cultural insight generation timed out")
    except Exception as e:
        logger.error(f"OmniBridge error: {e}")
        raise HTTPException(500, "Could not generate cross-cultural insight")


@router.get("/omni-bridge/lakota-sky")
async def get_lakota_sky_data():
    """Return the full Lakota Star Knowledge dataset — sourced from elder oral tradition."""
    return {
        "title": "Wicahpi Oyate — The Star Nation",
        "tradition": "Lakota / Oceti Sakowin",
        "core_teaching": "Mitakuye Oyasin — We Are All Related",
        "source_note": "Based on Ronald Goodman's 'Lakota Star Knowledge' and Native Skywatchers research with Lakota elders",
        "constellations": list(LAKOTA_SKY.values()),
        "count": len(LAKOTA_SKY),
    }


@router.get("/omni-bridge/medicine-wheel")
async def get_medicine_wheel():
    """Return the Lakota Medicine Wheel (Cangleska Wakan) — Four Directions."""
    return {
        "title": "Cangleska Wakan — The Sacred Hoop",
        "tradition": "Lakota / Oceti Sakowin",
        "core_teaching": "The circle has no beginning and no end. All life moves in circles.",
        "directions": list(MEDICINE_WHEEL.values()),
        "four_virtues": ["Wisdom (East)", "Generosity (South)", "Bravery (West)", "Fortitude (North)"],
    }


@router.get("/omni-bridge/cultural-map")
async def get_cultural_map():
    """Return the full cross-cultural connection map — genuine threads only."""
    result = {}
    for module, bridges in CULTURAL_BRIDGES.items():
        result[module] = {
            "lakota": bridges.get("lakota", ""),
            "western_sacred": bridges.get("western_sacred", ""),
            "eastern": bridges.get("eastern", ""),
            "science": bridges.get("science", ""),
            "genuine_thread": bridges.get("genuine_thread", ""),
        }
    return {"modules": result, "total_modules": len(result)}


@router.get("/omni-bridge/node-mythology/{node_index}")
async def get_node_mythology(node_index: int):
    """Get the cultural context for a Metatron's Cube node (Western Sacred Geometry tradition)."""
    if node_index < 0 or node_index >= len(METATRON_NODES):
        raise HTTPException(400, f"Node index must be 0-12, got {node_index}")

    node = METATRON_NODES[node_index]
    return {
        "node_index": node_index,
        "node_name": node["name"],
        "tradition": node["tradition"],
        "platonic_element": node["platonic"],
        "academy_module": node["academy"],
        "note": "Metatron's Cube is from the Kabbalistic/Western esoteric tradition. It is not Lakota.",
    }

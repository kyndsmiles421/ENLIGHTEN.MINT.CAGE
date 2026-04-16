"""
OmniCultural Intelligence Bridge — V55.0
The Cross-Cultural Neural Network connecting all pillars.

When a user interacts with ANY module, this bridge pulls contextual
insights from ALL related cultural/mathematical/spiritual systems:
- Lakota Sky Mythology (Wicahpi Oyate — Star Nation)
- Sacred Geometry (Fibonacci, Phi, Metatron's Cube)
- Ayurvedic/Eastern Medicine
- Sovereign Economy (Phi-Escrow)
- Academy/Masonry

Every module talks to every other module through this bridge.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user_optional, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
import asyncio
import uuid

router = APIRouter()

# ═══ LAKOTA SKY MYTHOLOGY — WICAHPI OYATE (Star Nation) ═══
LAKOTA_SKY = {
    "cansasa_ipusoke": {
        "english": "Big Dipper",
        "lakota": "Cansasa Ipusoke",
        "meaning": "Dried Red Willow",
        "teaching": "The seven stars represent the seven sacred rites. As the Dipper circles Polaris, it teaches us that all ceremony returns to the center — the Great Mystery.",
        "geometry_link": "The 7 stars mirror the 7 inner nodes of Metatron's Cube. Each node carries a rite.",
        "season": "Visible year-round — the eternal guardian",
        "ceremony": "Vision Quest alignment",
    },
    "tayamni": {
        "english": "Orion's Belt + Pleiades + Sirius",
        "lakota": "Tayamni",
        "meaning": "The Animal (Buffalo constellation)",
        "teaching": "The spine of the Buffalo stretches across the winter sky. It teaches that the Great Spirit provides through the darkest seasons.",
        "geometry_link": "The 3-star belt maps to the triangular faces of the Tetrahedron within Metatron's Cube.",
        "season": "Winter — the teaching season",
        "ceremony": "Sundance preparation",
    },
    "wicincala_sakowin": {
        "english": "Pleiades",
        "lakota": "Wicincala Sakowin",
        "meaning": "Seven Little Girls",
        "teaching": "Seven girls fled a great bear by climbing a tree that grew into the sky. They became stars. Devils Tower (Bear Lodge) is the stump. It teaches that the Creator provides escape from danger through elevation.",
        "geometry_link": "The 7 sisters correspond to the 7 Chakra levels in the Avatar system. Each star = a Chakra frequency.",
        "season": "Their disappearance marks planting season, return marks harvest",
        "ceremony": "Coming-of-age rites",
    },
    "anpo_wicahpi": {
        "english": "Venus (Morning Star)",
        "lakota": "Anpo Wicahpi",
        "meaning": "The Dawn Star",
        "teaching": "The Morning Star is the herald of new beginnings. In Lakota tradition, it carries prayers from Earth to Wakan Tanka. Seeing it at dawn means your prayers are heard.",
        "geometry_link": "Venus traces a perfect 5-petaled flower (pentagram) across 8 Earth years — a Fibonacci ratio (8/5 = 1.6, approaching φ).",
        "season": "Visible at dawn — the time of prayer",
        "ceremony": "Morning prayer and pipe ceremony",
    },
    "wanagi_tacanku": {
        "english": "Milky Way",
        "lakota": "Wanagi Tacanku",
        "meaning": "The Spirit Trail / Trail of Spirits",
        "teaching": "The Milky Way is the path souls travel to the spirit world. Each star is an ancestor watching over the living. Walking this trail in meditation connects you to all who came before.",
        "geometry_link": "The spiral of the Milky Way IS the Golden Spiral. The ancestors walk the Fibonacci path.",
        "season": "Best visible in summer — the gathering season",
        "ceremony": "Honoring the ancestors, Wanagi Wicagluha",
    },
    "oceti_sakowin": {
        "english": "Seven Council Fires (reflected in stars)",
        "lakota": "Oceti Sakowin",
        "meaning": "The Seven Sacred Campfires of the Lakota Nation",
        "teaching": "As above, so below. The seven fires on Earth mirror seven stars in the sky. Each fire represents a band of the Lakota, and together they form the whole nation — just as seven notes form a scale, seven chakras form a body.",
        "geometry_link": "7 fires = 7 nodes = 7 chakras = 7 Solfeggio tones. The number 7 is the universal bridge between all systems.",
        "season": "All seasons — the eternal council",
        "ceremony": "Council gatherings, collective decision-making",
    },
    "hanwi": {
        "english": "Moon",
        "lakota": "Hanwi",
        "meaning": "Night Sun / Grandmother Moon",
        "teaching": "Hanwi controls the tides of emotion and the cycles of women. She teaches that darkness is not absence — it is a different kind of light. The 13 moons of the year govern planting, harvesting, and ceremony.",
        "geometry_link": "13 moons = 13 nodes of Metatron's Cube. Each moon phase unlocks a different node in the Masonry grid.",
        "season": "13 cycles per year",
        "ceremony": "Moon ceremonies, women's lodges, dream interpretation",
    },
}

# ═══ CROSS-CULTURAL KNOWLEDGE MAP ═══
# Maps every module to its cultural connections
CULTURAL_BRIDGES = {
    "geometry": {
        "lakota": ["cansasa_ipusoke", "tayamni", "wicincala_sakowin"],
        "eastern": "The yantra tradition maps mandalas to the same geometric forms found in Metatron's Cube.",
        "science": "Fibonacci spirals appear in DNA, galaxies, and hurricanes — the same math governs shells and stars.",
    },
    "breathwork": {
        "lakota": ["anpo_wicahpi"],
        "eastern": "Pranayama (Sanskrit) and the Lakota pipe ceremony both use breath as prayer — carrying intention from body to spirit.",
        "science": "The Fibonacci breathing cycle (1,1,2,3,5) mirrors the heart rate variability patterns of deep coherence.",
    },
    "meditation": {
        "lakota": ["wanagi_tacanku", "hanwi"],
        "eastern": "Zen sitting, Vipassana watching, and Lakota Vision Quest all arrive at the same destination — stillness reveals truth.",
        "science": "30 seconds of stillness shifts brainwaves from Beta to Alpha. The Ghost Trail system rewards this biologically optimal state.",
    },
    "crystals": {
        "lakota": ["tayamni"],
        "eastern": "Ayurvedic gem therapy (Ratna Chikitsa) assigns healing properties to stones — matching the Lakota tradition of sacred stone circles.",
        "science": "Crystalline structures exhibit piezoelectricity — they convert pressure to electrical charge, the same principle behind quartz watches.",
    },
    "oracle": {
        "lakota": ["anpo_wicahpi", "wicincala_sakowin", "oceti_sakowin"],
        "eastern": "The I Ching, Tarot, and Lakota star reading all use symbolic systems to mirror the questioner's inner state back to them.",
        "science": "Pattern recognition is the brain's primary function. Divination systems leverage this to bypass analytical mind and access intuition.",
    },
    "herbology": {
        "lakota": ["hanwi"],
        "eastern": "TCM (Traditional Chinese Medicine) and Lakota plant medicine both organize herbs by the four directions and seasonal energy.",
        "science": "Phytochemistry confirms what indigenous peoples knew — willow bark contains salicylic acid (aspirin), echinacea activates immune pathways.",
    },
    "economy": {
        "lakota": ["oceti_sakowin"],
        "eastern": "The Buddhist concept of Dana (generosity) and the Lakota Giveaway ceremony both teach that wealth flows to those who release it.",
        "science": "The φ-escrow (1.618%) mirrors the Golden Ratio found in efficient resource distribution in ecosystems.",
    },
    "academy": {
        "lakota": ["cansasa_ipusoke", "oceti_sakowin"],
        "eastern": "The Guru-Shishya tradition (teacher-student) mirrors the Lakota elder-youth knowledge transfer through oral tradition.",
        "science": "Spaced repetition and spatial memory (Method of Loci) are enhanced by placing knowledge IN a 3D environment — which is exactly what the Spatial Engine does.",
    },
    "music": {
        "lakota": ["wanagi_tacanku"],
        "eastern": "The Solfeggio frequencies (396Hz, 528Hz) correspond to chakra activations. Lakota drum circles use heartbeat rhythm (60-80 BPM) to induce trance states.",
        "science": "Cymatics proves sound creates geometric patterns in matter. The same Fibonacci ratios that govern the grid also govern musical harmony.",
    },
    "nourishment": {
        "lakota": ["hanwi", "tayamni"],
        "eastern": "Ayurvedic nutrition follows seasonal eating (Ritucharya). Lakota tradition aligns food gathering with the 13 moons and buffalo migration.",
        "science": "Circadian nutrition research confirms that WHEN you eat matters as much as WHAT. The 13-moon calendar naturally optimizes meal timing.",
    },
}


@router.post("/omni-bridge/insight")
async def cross_cultural_insight(data: dict = Body(...)):
    """
    The Cross-Cultural Neural Network.
    Given a user's current module + topic, returns contextual insights
    from ALL connected cultural/mathematical/spiritual systems.
    """
    module = data.get("module", "general")
    topic = data.get("topic", "")
    user_context = data.get("context", "")

    if not topic:
        raise HTTPException(400, "topic is required")

    # Get cultural bridge data
    bridge = CULTURAL_BRIDGES.get(module, CULTURAL_BRIDGES.get("academy", {}))
    lakota_keys = bridge.get("lakota", [])
    lakota_stories = [LAKOTA_SKY[k] for k in lakota_keys if k in LAKOTA_SKY]
    eastern = bridge.get("eastern", "")
    science = bridge.get("science", "")

    # Build the cross-cultural context
    lakota_context = "\n".join([
        f"- {s['lakota']} ({s['english']}): {s['teaching']} [Geometry link: {s['geometry_link']}]"
        for s in lakota_stories
    ])

    cross_cultural_prompt = f"""You are the OmniCultural Intelligence of ENLIGHTEN.MINT.CAFE — a living bridge
between Lakota Sky Mythology, Sacred Geometry (Fibonacci/Phi), Eastern traditions, 
and modern science. You speak as ONE unified voice, showing how all traditions converge.

The user is currently in the "{module}" module, exploring: "{topic}"
{f'Additional context: {user_context}' if user_context else ''}

CULTURAL CONNECTIONS for this module:

LAKOTA SKY MYTHOLOGY (Wicahpi Oyate):
{lakota_context if lakota_context else 'General Lakota teaching: Mitakuye Oyasin — We are all related. Every star, stone, and breath is connected.'}

EASTERN TRADITION:
{eastern}

SCIENTIFIC BRIDGE:
{science}

SACRED GEOMETRY:
The Golden Ratio (φ = 1.618) governs both the spiral of galaxies and the growth of shells.
The Fibonacci sequence (1,1,2,3,5,8,13) appears in flower petals, pinecones, and the Lakota 13-moon calendar.
Metatron's Cube contains all 5 Platonic Solids — the building blocks of matter.

Provide a response that:
1. Directly addresses "{topic}" with practical knowledge
2. Shows the THREAD connecting Lakota wisdom, Sacred Geometry, and Eastern practice for this topic
3. Gives the user a specific ACTION they can take right now (a practice, a meditation, an observation)
4. References the mathematical pattern (Fibonacci, φ, or Sacred Geometry) that unites these traditions
5. Speaks with warmth, authority, and reverence — as a unified elder, not a textbook

Keep it concise (3-4 paragraphs). End with a "Bridge Insight" — one sentence connecting all traditions."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"omni-bridge-{str(uuid.uuid4())}",
            system_message="You are the OmniCultural Intelligence — a unified voice of Lakota Star Knowledge, Sacred Geometry, Eastern Wisdom, and Modern Science. All traditions speak through you as one.",
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=cross_cultural_prompt)
        response = await asyncio.wait_for(chat.send_message(msg), timeout=45)

        result = {
            "module": module,
            "topic": topic,
            "insight": response,
            "lakota_connections": [{"lakota": s["lakota"], "english": s["english"], "meaning": s["meaning"]} for s in lakota_stories],
            "geometry_thread": science,
            "eastern_thread": eastern,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

        # Cache for future retrieval
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
    """Return the full Lakota Sky Mythology dataset."""
    return {
        "title": "Wicahpi Oyate — The Star Nation",
        "tradition": "Lakota / Oceti Sakowin",
        "teaching": "Mitakuye Oyasin — We Are All Related",
        "constellations": list(LAKOTA_SKY.values()),
        "count": len(LAKOTA_SKY),
    }


@router.get("/omni-bridge/cultural-map")
async def get_cultural_map():
    """Return the full cross-cultural connection map."""
    result = {}
    for module, bridges in CULTURAL_BRIDGES.items():
        lakota_keys = bridges.get("lakota", [])
        result[module] = {
            "lakota_connections": [
                {"key": k, "name": LAKOTA_SKY[k]["lakota"], "english": LAKOTA_SKY[k]["english"]}
                for k in lakota_keys if k in LAKOTA_SKY
            ],
            "eastern": bridges.get("eastern", ""),
            "science": bridges.get("science", ""),
        }
    return {"modules": result, "total_bridges": sum(len(v.get("lakota", [])) for v in CULTURAL_BRIDGES.values())}


@router.get("/omni-bridge/node-mythology/{node_index}")
async def get_node_mythology(node_index: int):
    """Get the cultural mythology for a specific Metatron's Cube node (0-12)."""
    # Map 13 nodes to cultural associations
    NODE_MAP = [
        {"name": "Bindu (Center)", "lakota": "oceti_sakowin", "chakra": "Crown", "element": "Ether", "academy": "Sacred Geometry Foundation"},
        {"name": "East Gate", "lakota": "anpo_wicahpi", "chakra": "Third Eye", "element": "Light", "academy": "Breathwork & Pranayama"},
        {"name": "South Gate", "lakota": "tayamni", "chakra": "Solar Plexus", "element": "Fire", "academy": "Movement & Yoga"},
        {"name": "West Gate", "lakota": "hanwi", "chakra": "Sacral", "element": "Water", "academy": "Herbology & Nourishment"},
        {"name": "North Gate", "lakota": "wanagi_tacanku", "chakra": "Root", "element": "Earth", "academy": "Crystal & Earth Medicine"},
        {"name": "Upper East", "lakota": "wicincala_sakowin", "chakra": "Throat", "element": "Sound", "academy": "Frequency & Music"},
        {"name": "Upper South", "lakota": "cansasa_ipusoke", "chakra": "Heart", "element": "Air", "academy": "Meditation & Stillness"},
        {"name": "Upper West", "lakota": "anpo_wicahpi", "chakra": "Third Eye", "element": "Vision", "academy": "Oracle & Divination"},
        {"name": "Upper North", "lakota": "oceti_sakowin", "chakra": "Crown", "element": "Spirit", "academy": "Community & Sovereignty"},
        {"name": "Lower East", "lakota": "tayamni", "chakra": "Solar Plexus", "element": "Will", "academy": "Economy & Credits"},
        {"name": "Lower South", "lakota": "hanwi", "chakra": "Sacral", "element": "Creation", "academy": "Art & Creation"},
        {"name": "Lower West", "lakota": "wanagi_tacanku", "chakra": "Root", "element": "Ancestors", "academy": "Sacred Texts & History"},
        {"name": "Lower North", "lakota": "wicincala_sakowin", "chakra": "Heart", "element": "Love", "academy": "Tantra & Connection"},
    ]

    if node_index < 0 or node_index >= len(NODE_MAP):
        raise HTTPException(400, f"Node index must be 0-12, got {node_index}")

    node = NODE_MAP[node_index]
    lakota = LAKOTA_SKY.get(node["lakota"], {})

    return {
        "node_index": node_index,
        "node_name": node["name"],
        "chakra": node["chakra"],
        "element": node["element"],
        "academy_module": node["academy"],
        "lakota_star": lakota.get("lakota", ""),
        "lakota_english": lakota.get("english", ""),
        "lakota_teaching": lakota.get("teaching", ""),
        "geometry_link": lakota.get("geometry_link", ""),
        "ceremony": lakota.get("ceremony", ""),
    }

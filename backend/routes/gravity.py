from fastapi import APIRouter, Depends
from deps import get_current_user, db
from datetime import datetime, timezone

router = APIRouter()

GRAVITY_NODES = [
    {
        "id": "om-vedic",
        "label": "The Sacred Om",
        "type": "teaching",
        "frequency": 136.1,
        "origin_language": "Sanskrit",
        "star_coordinate": {"ra": 18.62, "dec": 38.78, "constellation": "Lyra"},
        "gravity_mass": 92,
        "tier_required": "observer",
        "category": "vedic",
        "description": "The primordial vibration from which all creation emanates",
        "trinity": {
            "origin": "Mandukya Upanishad: 'Om ity etad aksaram idam sarvam' — Om is the imperishable Brahman, and this syllable is the whole universe.",
            "synthesis": "The 136.1Hz frequency aligns with the Earth's orbital year-tone (C#). Vedic seers identified this as the bridge between human consciousness and cosmic orbital mechanics.",
            "frequency_hz": 136.1,
        },
    },
    {
        "id": "gayatri-vedic",
        "label": "Gayatri Mantra",
        "type": "teaching",
        "frequency": 417.0,
        "origin_language": "Sanskrit",
        "star_coordinate": {"ra": 6.75, "dec": -16.72, "constellation": "Canis Major"},
        "gravity_mass": 88,
        "tier_required": "synthesizer",
        "category": "vedic",
        "description": "The mother of all mantras, invoking the solar deity Savitri",
        "trinity": {
            "origin": "Rig Veda 3.62.10: 'Om bhur bhuvah svah tat savitur varenyam bhargo devasya dhimahi dhiyo yo nah prachodayat'",
            "synthesis": "The 24 syllables correspond to 24 vertebrae of the spinal column. The mantra's rhythm aligns with the circadian cycle of cortisol production at sunrise.",
            "frequency_hz": 417.0,
        },
    },
    {
        "id": "emerald-tablet",
        "label": "Emerald Tablet",
        "type": "teaching",
        "frequency": 528.0,
        "origin_language": "Aramaic",
        "star_coordinate": {"ra": 5.24, "dec": 46.0, "constellation": "Auriga"},
        "gravity_mass": 95,
        "tier_required": "archivist",
        "category": "hermetic",
        "description": "The foundational text of Hermeticism — 'As above, so below'",
        "trinity": {
            "origin": "Tabula Smaragdina: 'Quod est superius est sicut quod est inferius, et quod est inferius est sicut quod est superius.'",
            "synthesis": "The principle of correspondence maps directly to fractal geometry. The Mandelbrot set demonstrates infinite self-similarity, mathematically proving 'as above, so below.'",
            "frequency_hz": 528.0,
        },
    },
    {
        "id": "eye-of-horus",
        "label": "Eye of Horus",
        "type": "star_chart",
        "frequency": 852.0,
        "origin_language": "Egyptian Hieroglyphic",
        "star_coordinate": {"ra": 6.40, "dec": -52.70, "constellation": "Columba"},
        "gravity_mass": 80,
        "tier_required": "observer",
        "category": "egyptian",
        "description": "The Wadjet eye — sacred symbol of protection and royal power",
        "trinity": {
            "origin": "The six parts of the Eye represent the six senses, each assigned a fraction summing to 63/64 — the missing 1/64 supplied by Thoth's magic.",
            "synthesis": "The fractional system (1/2, 1/4, 1/8, 1/16, 1/32, 1/64) mirrors binary arithmetic. Each fraction maps to a cranial nerve and a specific frequency band.",
            "frequency_hz": 852.0,
        },
    },
    {
        "id": "spider-grandmother",
        "label": "Spider Grandmother",
        "type": "teaching",
        "frequency": 396.0,
        "origin_language": "Hopi",
        "star_coordinate": {"ra": 3.79, "dec": 24.11, "constellation": "Pleiades"},
        "gravity_mass": 85,
        "tier_required": "observer",
        "category": "hopi",
        "description": "Kokyangwuti — the creator deity who wove the web of existence",
        "trinity": {
            "origin": "In the Hopi emergence narrative, Spider Grandmother sang the Song of Creation while weaving the fabric of space from her web, creating the four worlds through which humanity ascended.",
            "synthesis": "The web geometry aligns with tensegrity structures. The Hopi four-world model parallels the four quantum numbers (n, l, ml, ms) governing electron behavior.",
            "frequency_hz": 396.0,
        },
    },
    {
        "id": "flower-of-life",
        "label": "Flower of Life",
        "type": "frequency",
        "frequency": 639.0,
        "origin_language": "Universal",
        "star_coordinate": {"ra": 12.45, "dec": 12.39, "constellation": "Virgo"},
        "gravity_mass": 90,
        "tier_required": "synthesizer",
        "category": "sacred_geometry",
        "description": "The geometric blueprint containing all five Platonic solids",
        "trinity": {
            "origin": "Found carved in the Temple of Osiris at Abydos (c. 535 BCE), also in Phoenician art, Indian temples, and Chinese forbidden cities.",
            "synthesis": "Contains the Seed of Life (7 circles), Egg of Life (8 spheres mapping to cell division), and Metatron's Cube (all 5 Platonic solids). The 19-circle variant encodes the Tree of Life.",
            "frequency_hz": 639.0,
        },
    },
    {
        "id": "sri-yantra",
        "label": "Sri Yantra",
        "type": "frequency",
        "frequency": 963.0,
        "origin_language": "Sanskrit",
        "star_coordinate": {"ra": 14.26, "dec": 19.18, "constellation": "Bootes"},
        "gravity_mass": 93,
        "tier_required": "navigator",
        "category": "sacred_geometry",
        "description": "Nine interlocking triangles — the geometric form of Om",
        "trinity": {
            "origin": "Saundarya Lahari (8th c.): The 43 triangles formed by 9 interlocking triangles represent the totality of cosmic manifestation.",
            "synthesis": "The Sri Yantra encodes pi to 4 decimal places in its central point (bindu). Cymatics experiments at 963Hz produce patterns resembling the yantra's geometry.",
            "frequency_hz": 963.0,
        },
    },
    {
        "id": "sirius-star",
        "label": "Sirius",
        "type": "star_chart",
        "frequency": 741.0,
        "origin_language": "Egyptian Hieroglyphic",
        "star_coordinate": {"ra": 6.75, "dec": -16.72, "constellation": "Canis Major"},
        "gravity_mass": 88,
        "tier_required": "observer",
        "category": "star_chart",
        "description": "The brightest star — sacred to Egypt, Dogon, and Polynesian navigators",
        "trinity": {
            "origin": "The heliacal rising of Sirius (Sopdet) marked the Egyptian New Year and the Nile flood. The Dogon people described Sirius B's 50-year orbital period centuries before telescopic confirmation.",
            "synthesis": "At 8.6 light-years, Sirius A's surface temperature (9,940K) produces peak emission at 292nm — deep UV that ionizes atmospheric ozone. Its gravitational influence shapes the local interstellar medium.",
            "frequency_hz": 741.0,
        },
    },
    {
        "id": "pleiades-cluster",
        "label": "Pleiades",
        "type": "star_chart",
        "frequency": 285.0,
        "origin_language": "Greek",
        "star_coordinate": {"ra": 3.79, "dec": 24.11, "constellation": "Taurus"},
        "gravity_mass": 82,
        "tier_required": "observer",
        "category": "star_chart",
        "description": "The Seven Sisters — referenced by every known civilization",
        "trinity": {
            "origin": "Mentioned in Job 38:31, the Vedas (Krittika), Greek mythology (daughters of Atlas), and Hopi emergence stories. The oldest known depiction is the Nebra Sky Disc (c. 1600 BCE).",
            "synthesis": "The cluster's 444 light-year distance and ~100 million year age make it a 'young' stellar nursery. Multiple civilizations used its heliacal rising as an agricultural calendar anchor.",
            "frequency_hz": 285.0,
        },
    },
    {
        "id": "schumann-resonance",
        "label": "Schumann Resonance",
        "type": "frequency",
        "frequency": 7.83,
        "origin_language": "German",
        "star_coordinate": {"ra": 0.0, "dec": 0.0, "constellation": "Earth"},
        "gravity_mass": 97,
        "tier_required": "observer",
        "category": "frequency",
        "description": "Earth's electromagnetic heartbeat — the cavity resonance between surface and ionosphere",
        "trinity": {
            "origin": "Predicted by Winfried Otto Schumann (1952). The fundamental mode at 7.83Hz arises from lightning discharges exciting the Earth-ionosphere waveguide.",
            "synthesis": "The 7.83Hz frequency falls in the alpha-theta brainwave transition zone, associated with deep meditation and REM sleep. Disruption of Schumann resonance exposure has been linked to circadian dysregulation.",
            "frequency_hz": 7.83,
        },
    },
    {
        "id": "solfeggio-528",
        "label": "528Hz — Transformation",
        "type": "frequency",
        "frequency": 528.0,
        "origin_language": "Latin",
        "star_coordinate": {"ra": 13.42, "dec": 28.38, "constellation": "Canes Venatici"},
        "gravity_mass": 86,
        "tier_required": "observer",
        "category": "frequency",
        "description": "The 'Miracle Tone' — associated with DNA repair and cellular regeneration",
        "trinity": {
            "origin": "From the Hymn to St. John the Baptist (Ut queant laxis). 528Hz is the third note of the original Solfeggio scale (MI - Mira gestorum).",
            "synthesis": "528nm is the wavelength of green light — the color of chlorophyll and the heart chakra. The frequency ratio 528/396 = 4/3, a perfect fourth interval used in Gregorian chant.",
            "frequency_hz": 528.0,
        },
    },
    {
        "id": "polaris-anchor",
        "label": "Polaris",
        "type": "star_chart",
        "frequency": 174.0,
        "origin_language": "Latin",
        "star_coordinate": {"ra": 2.53, "dec": 89.26, "constellation": "Ursa Minor"},
        "gravity_mass": 78,
        "tier_required": "observer",
        "category": "star_chart",
        "description": "The North Star — the fixed point around which all other stars appear to rotate",
        "trinity": {
            "origin": "Currently 0.74° from the celestial pole. Used by Polynesian wayfinders, Viking navigators, and Underground Railroad conductors. Called Dhruva in Sanskrit ('the immovable').",
            "synthesis": "Polaris is actually a triple star system. Its Cepheid variable pulsation (3.97 days) was key to establishing the cosmic distance ladder. The precession cycle (25,772 years) means different 'pole stars' across epochs.",
            "frequency_hz": 174.0,
        },
    },
]

MASTERY_TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]


@router.get("/gravity/nodes")
async def get_gravity_nodes(user=Depends(get_current_user)):
    tier = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = tier.get("current_tier", "observer") if tier else "observer"
    tier_idx = MASTERY_TIERS.index(current_tier) if current_tier in MASTERY_TIERS else 0

    nodes = []
    for node in GRAVITY_NODES:
        req_idx = MASTERY_TIERS.index(node["tier_required"]) if node["tier_required"] in MASTERY_TIERS else 0
        nodes.append({
            **node,
            "unlocked": tier_idx >= req_idx,
            "locked_reason": f"Requires {node['tier_required'].title()} tier" if tier_idx < req_idx else None,
        })
    return {"nodes": nodes, "current_tier": current_tier, "tier_index": tier_idx}


@router.get("/gravity/field")
async def get_gravity_field(user=Depends(get_current_user)):
    """Returns gravity field parameters for the WebGL mesh."""
    nodes_summary = [
        {"id": n["id"], "mass": n["gravity_mass"], "frequency": n["frequency"], "category": n["category"]}
        for n in GRAVITY_NODES
    ]
    return {"nodes": nodes_summary, "field_resolution": 80, "damping_base": 20, "mass_scale": 0.5}


@router.post("/gravity/interact")
async def interact_with_node(body: dict, user=Depends(get_current_user)):
    node_id = body.get("node_id")
    node = next((n for n in GRAVITY_NODES if n["id"] == node_id), None)
    if not node:
        return {"error": "Node not found"}

    await db.gravity_interactions.update_one(
        {"user_id": user["id"], "node_id": node_id},
        {
            "$inc": {"interaction_count": 1, "dwell_seconds": body.get("dwell_seconds", 0)},
            "$set": {"last_interacted": datetime.now(timezone.utc).isoformat()},
            "$setOnInsert": {"user_id": user["id"], "node_id": node_id},
        },
        upsert=True,
    )

    interactions = await db.gravity_interactions.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    total_dwell = sum(i.get("dwell_seconds", 0) for i in interactions)
    total_count = sum(i.get("interaction_count", 0) for i in interactions)

    new_tier = "observer"
    if total_dwell > 3600 and total_count > 50:
        new_tier = "sovereign"
    elif total_dwell > 1800 and total_count > 30:
        new_tier = "navigator"
    elif total_dwell > 600 and total_count > 15:
        new_tier = "archivist"
    elif total_dwell > 120 and total_count > 5:
        new_tier = "synthesizer"

    await db.mastery_tiers.update_one(
        {"user_id": user["id"]},
        {"$set": {"current_tier": new_tier, "total_dwell": total_dwell, "total_interactions": total_count}},
        upsert=True,
    )

    return {
        "node_id": node_id,
        "interaction_count": total_count,
        "total_dwell_seconds": total_dwell,
        "current_tier": new_tier,
        "trinity": node["trinity"],
    }

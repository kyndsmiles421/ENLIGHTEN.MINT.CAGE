from fastapi import APIRouter, Depends
from deps import get_current_user, db
from datetime import datetime, timezone

router = APIRouter()

MASTERY_TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]

ARCHIVE_ENTRIES = [
    {
        "id": "om-vedic",
        "title": "The Sacred Om",
        "category": "vedic",
        "gravity_mass": 92,
        "tier_required": "observer",
        "scripts": {
            "sanskrit": {
                "original": "\u0950",
                "transliteration": "Om",
                "characters": [
                    {
                        "char": "\u0950",
                        "name": "Om",
                        "meaning": "The primordial vibration of creation",
                        "frequency": 136.1,
                        "strokes": [
                            [{"x":0.3,"y":0.7},{"x":0.35,"y":0.5},{"x":0.5,"y":0.4},{"x":0.65,"y":0.5},{"x":0.6,"y":0.65}],
                            [{"x":0.6,"y":0.65},{"x":0.5,"y":0.75},{"x":0.35,"y":0.7}],
                            [{"x":0.55,"y":0.3},{"x":0.65,"y":0.2},{"x":0.75,"y":0.25}],
                            [{"x":0.72,"y":0.15},{"x":0.78,"y":0.12}],
                        ],
                    }
                ],
            },
            "chinese": {
                "original": "\u5535",
                "oracle_bone": "\u2f44",
                "transliteration": "An",
                "characters": [
                    {
                        "char": "\u5535",
                        "name": "An (Om)",
                        "meaning": "Sacred syllable transliterated from Sanskrit",
                        "frequency": 136.1,
                        "strokes": [
                            [{"x":0.2,"y":0.3},{"x":0.2,"y":0.7}],
                            [{"x":0.2,"y":0.3},{"x":0.4,"y":0.3}],
                            [{"x":0.4,"y":0.3},{"x":0.4,"y":0.7}],
                            [{"x":0.5,"y":0.2},{"x":0.8,"y":0.2}],
                            [{"x":0.65,"y":0.2},{"x":0.65,"y":0.5}],
                            [{"x":0.5,"y":0.5},{"x":0.8,"y":0.5}],
                            [{"x":0.5,"y":0.7},{"x":0.8,"y":0.7}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "Mandukya Upanishad: 'Om ity etad aksaram idam sarvam, tasyopavyakhyanam bhutam bhavad bhavishyad iti sarvam onkara eva.' — Om is the imperishable Brahman, and this syllable is the whole universe. Past, present, and future are all Om.",
                "language": "Sanskrit",
                "script": "Devanagari",
            },
            "synthesis": {
                "text": "The 136.1Hz frequency aligns with the Earth's orbital year-tone (C#). Vedic seers identified this as the bridge between human consciousness and cosmic orbital mechanics. In cymatics, 136.1Hz produces a mandala-like pattern that mirrors the Sri Yantra's geometry. The Pythagoreans called this same principle the 'Music of the Spheres.'",
                "connections": ["sri-yantra", "schumann-resonance", "flower-of-life"],
            },
            "frequency": {
                "hz": 136.1,
                "solfeggio_nearest": "UT (174Hz)",
                "chakra": "Crown / Sahasrara",
                "element": "Akasha (Ether)",
                "color_wavelength_nm": 495,
            },
        },
    },
    {
        "id": "dao-chinese",
        "title": "The Way (Dao)",
        "category": "chinese",
        "gravity_mass": 94,
        "tier_required": "observer",
        "scripts": {
            "chinese": {
                "original": "\u9053",
                "oracle_bone": "\u2f44",
                "transliteration": "Dao",
                "evolution": ["Oracle Bone (Shang Dynasty)", "Bronze Script (Zhou)", "Seal Script (Qin)", "Modern"],
                "characters": [
                    {
                        "char": "\u9053",
                        "name": "Dao",
                        "meaning": "The Way — the fundamental principle underlying all reality",
                        "frequency": 432.0,
                        "strokes": [
                            [{"x":0.3,"y":0.15},{"x":0.5,"y":0.15}],
                            [{"x":0.4,"y":0.15},{"x":0.4,"y":0.35}],
                            [{"x":0.3,"y":0.35},{"x":0.5,"y":0.35}],
                            [{"x":0.3,"y":0.15},{"x":0.3,"y":0.55}],
                            [{"x":0.5,"y":0.15},{"x":0.5,"y":0.55}],
                            [{"x":0.25,"y":0.55},{"x":0.55,"y":0.55}],
                            [{"x":0.15,"y":0.65},{"x":0.6,"y":0.65}],
                            [{"x":0.6,"y":0.3},{"x":0.85,"y":0.3}],
                            [{"x":0.6,"y":0.4},{"x":0.85,"y":0.4},{"x":0.85,"y":0.7}],
                            [{"x":0.6,"y":0.55},{"x":0.85,"y":0.55}],
                            [{"x":0.4,"y":0.7},{"x":0.4,"y":0.9}],
                            [{"x":0.2,"y":0.85},{"x":0.6,"y":0.85}],
                        ],
                    }
                ],
            },
            "sanskrit": {
                "original": "\u0927\u0930\u094d\u092e",
                "transliteration": "Dharma",
                "characters": [
                    {
                        "char": "\u0927",
                        "name": "Dha",
                        "meaning": "To hold, sustain — the cosmic law that upholds existence",
                        "frequency": 432.0,
                        "strokes": [
                            [{"x":0.3,"y":0.2},{"x":0.7,"y":0.2}],
                            [{"x":0.5,"y":0.2},{"x":0.5,"y":0.8}],
                            [{"x":0.3,"y":0.5},{"x":0.7,"y":0.5}],
                            [{"x":0.5,"y":0.5},{"x":0.3,"y":0.8}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "Dao De Jing, Chapter 1: '\u9053\u53ef\u9053\uff0c\u975e\u5e38\u9053\u3002\u540d\u53ef\u540d\uff0c\u975e\u5e38\u540d\u3002' — The Dao that can be told is not the eternal Dao. The name that can be named is not the eternal name.",
                "language": "Classical Chinese",
                "script": "Hanzi",
            },
            "synthesis": {
                "text": "The concept of Dao maps to the Sanskrit 'Dharma' and the Hopi 'Koyaanisqatsi' (life in balance). All three describe a fundamental ordering principle. In physics, this corresponds to the path of least action — the principle that governs all motion from photons to planets.",
                "connections": ["om-vedic", "flower-of-life", "spider-grandmother"],
            },
            "frequency": {
                "hz": 432.0,
                "solfeggio_nearest": "LA (417Hz)",
                "chakra": "Heart / Anahata",
                "element": "Wu Xing (Five Elements)",
                "color_wavelength_nm": 565,
            },
        },
    },
    {
        "id": "qi-chinese",
        "title": "Vital Energy (Qi)",
        "category": "chinese",
        "gravity_mass": 88,
        "tier_required": "synthesizer",
        "scripts": {
            "chinese": {
                "original": "\u6c23",
                "oracle_bone": "\u2f00",
                "transliteration": "Qi",
                "evolution": ["Oracle Bone (breath rising)", "Bronze Script", "Seal Script", "Simplified \u6c14"],
                "characters": [
                    {
                        "char": "\u6c23",
                        "name": "Qi",
                        "meaning": "Vital breath/energy that flows through all living things",
                        "frequency": 528.0,
                        "strokes": [
                            [{"x":0.2,"y":0.15},{"x":0.8,"y":0.15}],
                            [{"x":0.2,"y":0.35},{"x":0.8,"y":0.35}],
                            [{"x":0.2,"y":0.55},{"x":0.8,"y":0.55}],
                            [{"x":0.3,"y":0.55},{"x":0.3,"y":0.85}],
                            [{"x":0.7,"y":0.55},{"x":0.7,"y":0.85}],
                            [{"x":0.4,"y":0.7},{"x":0.6,"y":0.7}],
                            [{"x":0.5,"y":0.7},{"x":0.5,"y":0.9}],
                        ],
                    }
                ],
            },
            "sanskrit": {
                "original": "\u092a\u094d\u0930\u093e\u0923",
                "transliteration": "Prana",
                "characters": [
                    {
                        "char": "\u092a\u094d\u0930",
                        "name": "Pra",
                        "meaning": "Before/forward — the forward-moving breath of life",
                        "frequency": 528.0,
                        "strokes": [
                            [{"x":0.2,"y":0.2},{"x":0.8,"y":0.2}],
                            [{"x":0.5,"y":0.2},{"x":0.5,"y":0.8}],
                            [{"x":0.3,"y":0.5},{"x":0.7,"y":0.8}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "Huangdi Neijing (Yellow Emperor's Classic): '\u6c14\u8005\uff0c\u4eba\u4e4b\u6839\u672c\u4e5f\u3002' — Qi is the root of the human being. Without Qi, there is no life.",
                "language": "Classical Chinese",
                "script": "Hanzi",
            },
            "synthesis": {
                "text": "Qi = Prana (Sanskrit) = Pneuma (Greek) = Ruach (Hebrew) = Ka (Egyptian). All traditions describe an invisible animating force. In biophysics, this maps to bioelectrical fields — the 528Hz frequency corresponds to the C5 note and chlorophyll absorption peaks.",
                "connections": ["om-vedic", "emerald-tablet", "schumann-resonance"],
            },
            "frequency": {
                "hz": 528.0,
                "solfeggio_nearest": "MI (528Hz)",
                "chakra": "Solar Plexus / Manipura",
                "element": "Fire / Agni",
                "color_wavelength_nm": 528,
            },
        },
    },
    {
        "id": "aleph-aramaic",
        "title": "Aleph — The Breath",
        "category": "semitic",
        "gravity_mass": 86,
        "tier_required": "observer",
        "scripts": {
            "aramaic": {
                "original": "\u0710",
                "transliteration": "Aleph",
                "characters": [
                    {
                        "char": "\u0710",
                        "name": "Aleph",
                        "meaning": "The silent breath — the first letter, representing the unmanifest",
                        "frequency": 7.83,
                        "strokes": [
                            [{"x":0.7,"y":0.2},{"x":0.5,"y":0.5}],
                            [{"x":0.5,"y":0.5},{"x":0.3,"y":0.8}],
                            [{"x":0.4,"y":0.3},{"x":0.6,"y":0.7}],
                        ],
                    }
                ],
            },
            "hebrew": {
                "original": "\u05d0",
                "transliteration": "Aleph",
                "characters": [
                    {
                        "char": "\u05d0",
                        "name": "Aleph",
                        "meaning": "Ox/Leader — the first letter, numerically 1, representing unity",
                        "frequency": 7.83,
                        "strokes": [
                            [{"x":0.6,"y":0.2},{"x":0.3,"y":0.5}],
                            [{"x":0.5,"y":0.35},{"x":0.7,"y":0.65}],
                            [{"x":0.4,"y":0.5},{"x":0.7,"y":0.8}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "Sefer Yetzirah 2:2: 'Twenty-two foundation letters: He engraved them, carved them, permuted them, weighed them, transformed them, and with them depicted all that was formed and all that would be formed.' Aleph is the breath before creation.",
                "language": "Hebrew/Aramaic",
                "script": "Syriac / Square Hebrew",
            },
            "synthesis": {
                "text": "Aleph carries the numerical value 1 in gematria. As a silent letter, it represents the void before sound — paralleling the Vedic concept of 'Para Vak' (transcendent speech). Its frequency of 7.83Hz matches the Schumann Resonance, Earth's electromagnetic heartbeat.",
                "connections": ["schumann-resonance", "om-vedic", "spider-grandmother"],
            },
            "frequency": {
                "hz": 7.83,
                "solfeggio_nearest": "Sub-audible (Earth tone)",
                "chakra": "Root / Muladhara",
                "element": "Earth / Prithvi",
                "color_wavelength_nm": 700,
            },
        },
    },
    {
        "id": "ankh-egyptian",
        "title": "The Ankh — Key of Life",
        "category": "egyptian",
        "gravity_mass": 90,
        "tier_required": "synthesizer",
        "scripts": {
            "egyptian": {
                "original": "\u2625",
                "transliteration": "Ankh",
                "characters": [
                    {
                        "char": "\u2625",
                        "name": "Ankh",
                        "meaning": "Eternal life — the union of masculine and feminine principles",
                        "frequency": 639.0,
                        "strokes": [
                            [{"x":0.5,"y":0.1},{"x":0.35,"y":0.25},{"x":0.35,"y":0.4},{"x":0.5,"y":0.45},{"x":0.65,"y":0.4},{"x":0.65,"y":0.25},{"x":0.5,"y":0.1}],
                            [{"x":0.5,"y":0.45},{"x":0.5,"y":0.9}],
                            [{"x":0.3,"y":0.6},{"x":0.7,"y":0.6}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "The Ankh appears in virtually every Egyptian temple scene. Gods hold it by the loop and offer it to the pharaoh's nostrils, conferring the 'breath of life.' It combines the masculine (vertical line) and feminine (oval loop) into a single symbol of eternal generation.",
                "language": "Egyptian Hieroglyphic",
                "script": "Hieroglyphic",
            },
            "synthesis": {
                "text": "The Ankh's shape encodes the golden ratio when properly proportioned. The loop-to-cross ratio approximates Phi (1.618). Early Coptic Christians adopted it as the Crux Ansata, recognizing the shared symbolism of eternal life. Its geometry appears in the Flower of Life pattern.",
                "connections": ["flower-of-life", "eye-of-horus", "emerald-tablet"],
            },
            "frequency": {
                "hz": 639.0,
                "solfeggio_nearest": "FA (639Hz)",
                "chakra": "Heart / Anahata",
                "element": "Water / Apas",
                "color_wavelength_nm": 580,
            },
        },
    },
    {
        "id": "iching-hexagram",
        "title": "I Ching — Binary Logic of Change",
        "category": "chinese",
        "gravity_mass": 91,
        "tier_required": "archivist",
        "scripts": {
            "chinese": {
                "original": "\u6613",
                "oracle_bone": "\u2f44",
                "transliteration": "Yi",
                "characters": [
                    {
                        "char": "\u6613",
                        "name": "Yi (Change)",
                        "meaning": "Transformation — the binary logic underlying all phenomena",
                        "frequency": 396.0,
                        "strokes": [
                            [{"x":0.3,"y":0.15},{"x":0.5,"y":0.15}],
                            [{"x":0.4,"y":0.15},{"x":0.2,"y":0.45}],
                            [{"x":0.4,"y":0.15},{"x":0.6,"y":0.45}],
                            [{"x":0.15,"y":0.45},{"x":0.65,"y":0.45}],
                            [{"x":0.2,"y":0.55},{"x":0.8,"y":0.55}],
                            [{"x":0.5,"y":0.55},{"x":0.5,"y":0.7}],
                            [{"x":0.3,"y":0.7},{"x":0.7,"y":0.7}],
                            [{"x":0.3,"y":0.8},{"x":0.3,"y":0.95}],
                            [{"x":0.7,"y":0.8},{"x":0.7,"y":0.95}],
                        ],
                    }
                ],
            },
        },
        "trinity": {
            "origin": {
                "text": "The I Ching uses 64 hexagrams built from 6 binary lines (yin/yang). Leibniz recognized this as a binary number system in 1703, writing that Fu Xi 'discovered the elements of arithmetic' thousands of years before Western mathematics.",
                "language": "Classical Chinese",
                "script": "Hanzi",
            },
            "synthesis": {
                "text": "The 64 hexagrams map to the 64 codons of DNA. Each hexagram's binary representation (000000 to 111111) corresponds to a specific amino acid sequence. The I Ching is, in essence, a 3,000-year-old molecular biology textbook encoded in symbolic logic.",
                "connections": ["dao-chinese", "flower-of-life", "solfeggio-528"],
            },
            "frequency": {
                "hz": 396.0,
                "solfeggio_nearest": "UT (396Hz)",
                "chakra": "Root / Muladhara",
                "element": "Earth + Metal",
                "color_wavelength_nm": 620,
            },
        },
    },
]

COMPARATIVE_LINGUISTICS = {
    "spirit": {
        "concept": "Spirit / Life Force",
        "languages": {
            "sanskrit": {"word": "\u0906\u0924\u094d\u092e\u0928\u094d", "transliteration": "Atman", "frequency": 136.1},
            "chinese": {"word": "\u795e", "transliteration": "Shen", "frequency": 741.0},
            "aramaic": {"word": "\u0720\u0718\u071a\u0710", "transliteration": "Rukha", "frequency": 285.0},
            "hebrew": {"word": "\u05e8\u05d5\u05d7", "transliteration": "Ruach", "frequency": 285.0},
            "egyptian": {"word": "Ka", "transliteration": "Ka", "frequency": 639.0},
            "greek": {"word": "\u03c0\u03bd\u03b5\u03cd\u03bc\u03b1", "transliteration": "Pneuma", "frequency": 528.0},
            "hopi": {"word": "Himu", "transliteration": "Himu", "frequency": 396.0},
        },
    },
    "energy": {
        "concept": "Energy / Vital Force",
        "languages": {
            "sanskrit": {"word": "\u092a\u094d\u0930\u093e\u0923", "transliteration": "Prana", "frequency": 528.0},
            "chinese": {"word": "\u6c23", "transliteration": "Qi", "frequency": 528.0},
            "hebrew": {"word": "\u05e0\u05e9\u05de\u05d4", "transliteration": "Neshamah", "frequency": 417.0},
            "egyptian": {"word": "Sekhem", "transliteration": "Sekhem", "frequency": 852.0},
            "greek": {"word": "\u03b4\u03cd\u03bd\u03b1\u03bc\u03b9\u03c2", "transliteration": "Dynamis", "frequency": 741.0},
            "latin": {"word": "Spiritus", "transliteration": "Spiritus", "frequency": 639.0},
        },
    },
    "truth": {
        "concept": "Truth / Cosmic Order",
        "languages": {
            "sanskrit": {"word": "\u0938\u0924\u094d\u092f", "transliteration": "Satya", "frequency": 963.0},
            "chinese": {"word": "\u771f", "transliteration": "Zhen", "frequency": 852.0},
            "egyptian": {"word": "Ma'at", "transliteration": "Maat", "frequency": 741.0},
            "hebrew": {"word": "\u05d0\u05de\u05ea", "transliteration": "Emet", "frequency": 852.0},
            "hopi": {"word": "Lavayi", "transliteration": "Lavayi", "frequency": 639.0},
        },
    },
}


@router.get("/archives/entries")
async def get_archive_entries(user=Depends(get_current_user)):
    tier = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = tier.get("current_tier", "observer") if tier else "observer"
    tier_idx = MASTERY_TIERS.index(current_tier) if current_tier in MASTERY_TIERS else 0

    unlocked_chars = await db.unlocked_characters.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(200)
    unlocked_set = {u["character_id"] for u in unlocked_chars}

    entries = []
    for entry in ARCHIVE_ENTRIES:
        req_idx = MASTERY_TIERS.index(entry["tier_required"]) if entry["tier_required"] in MASTERY_TIERS else 0
        unlocked = tier_idx >= req_idx
        entries.append({
            "id": entry["id"],
            "title": entry["title"],
            "category": entry["category"],
            "gravity_mass": entry["gravity_mass"],
            "tier_required": entry["tier_required"],
            "unlocked": unlocked,
            "scripts_preview": {
                lang: {"original": data["original"], "transliteration": data.get("transliteration", "")}
                for lang, data in entry["scripts"].items()
            },
            "frequency": entry["trinity"]["frequency"]["hz"],
        })
    return {"entries": entries, "current_tier": current_tier, "unlocked_characters": list(unlocked_set)}


@router.get("/archives/entry/{entry_id}")
async def get_archive_entry(entry_id: str, user=Depends(get_current_user)):
    entry = next((e for e in ARCHIVE_ENTRIES if e["id"] == entry_id), None)
    if not entry:
        return {"error": "Entry not found"}

    tier = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = tier.get("current_tier", "observer") if tier else "observer"
    tier_idx = MASTERY_TIERS.index(current_tier) if current_tier in MASTERY_TIERS else 0
    req_idx = MASTERY_TIERS.index(entry["tier_required"]) if entry["tier_required"] in MASTERY_TIERS else 0

    if tier_idx < req_idx:
        return {
            "id": entry["id"],
            "title": entry["title"],
            "locked": True,
            "locked_reason": f"Requires {entry['tier_required'].title()} tier (you are {current_tier.title()})",
            "tier_required": entry["tier_required"],
        }

    unlocked_chars = await db.unlocked_characters.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(200)
    unlocked_set = {u["character_id"] for u in unlocked_chars}

    return {**entry, "locked": False, "unlocked_characters": list(unlocked_set)}


@router.post("/archives/trace")
async def trace_character(body: dict, user=Depends(get_current_user)):
    entry_id = body.get("entry_id")
    language = body.get("language")
    char_index = body.get("char_index", 0)
    accuracy = body.get("accuracy", 0)

    char_id = f"{entry_id}:{language}:{char_index}"

    if accuracy >= 70:
        await db.unlocked_characters.update_one(
            {"user_id": user["id"], "character_id": char_id},
            {
                "$set": {
                    "accuracy": accuracy,
                    "unlocked_at": datetime.now(timezone.utc).isoformat(),
                },
                "$inc": {"trace_count": 1},
                "$setOnInsert": {"user_id": user["id"], "character_id": char_id},
            },
            upsert=True,
        )

    entry = next((e for e in ARCHIVE_ENTRIES if e["id"] == entry_id), None)
    freq = 396.0
    if entry and language in entry["scripts"]:
        chars = entry["scripts"][language].get("characters", [])
        if char_index < len(chars):
            freq = chars[char_index].get("frequency", 396.0)

    return {
        "character_id": char_id,
        "accuracy": accuracy,
        "unlocked": accuracy >= 70,
        "frequency": freq,
        "message": "Character mastered!" if accuracy >= 90 else "Character unlocked!" if accuracy >= 70 else "Keep practicing the stroke order",
    }


@router.get("/archives/linguistics/{concept}")
async def get_comparative_linguistics(concept: str, user=Depends(get_current_user)):
    data = COMPARATIVE_LINGUISTICS.get(concept)
    if not data:
        available = list(COMPARATIVE_LINGUISTICS.keys())
        return {"error": f"Concept not found. Available: {available}"}
    return data


@router.get("/archives/linguistics")
async def list_linguistic_concepts(user=Depends(get_current_user)):
    return {
        "concepts": [
            {"id": k, "concept": v["concept"], "language_count": len(v["languages"])}
            for k, v in COMPARATIVE_LINGUISTICS.items()
        ]
    }

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.nexus import compute_elemental_balance, ELEMENTS
from routes.game_core import award_xp, award_currency, modify_stat
from datetime import datetime, timezone
import hashlib
import random

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FORGOTTEN LANGUAGES SYSTEM
#  Daily deciphering of ancient scripts tied to
#  elemental balance. 5-tier progressive reveal.
#  Decoded glyphs permanently modify natal resonance.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Script Families (one per element) ──
SCRIPT_FAMILIES = {
    "wood": {
        "name": "Verdant Runes",
        "origin": "The Living Scripts of the Dryad Codex",
        "description": "Organic spirals and branching glyphs that grow as they are drawn",
        "color": "#22C55E",
        "glyph_style": "organic_spiral",
        "breath_pattern": "inhale-4-hold-2-exhale-6",
        "breath_label": "Growth Breath",
        "sound_hz": 528,
        "mantra": "Om Mani Padme Hum",
    },
    "fire": {
        "name": "Ignis Sigils",
        "origin": "The Flame Tablets of the Solar Forge",
        "description": "Angular, sharp-edged glyphs that pulse with inner heat",
        "color": "#EF4444",
        "glyph_style": "angular_sharp",
        "breath_pattern": "inhale-2-exhale-4-hold-1",
        "breath_label": "Forge Breath",
        "sound_hz": 396,
        "mantra": "Ram",
    },
    "earth": {
        "name": "Petroglyph Marks",
        "origin": "The Stone Archives of the Deep Root",
        "description": "Layered sedimentary symbols etched over millennia",
        "color": "#F59E0B",
        "glyph_style": "layered_geometric",
        "breath_pattern": "inhale-6-hold-4-exhale-8",
        "breath_label": "Foundation Breath",
        "sound_hz": 174,
        "mantra": "Lam",
    },
    "metal": {
        "name": "Crystalline Script",
        "origin": "The Prism Codex of the Void Artisans",
        "description": "Precise geometric constructions with refractive symmetry",
        "color": "#94A3B8",
        "glyph_style": "crystalline_geometric",
        "breath_pattern": "inhale-3-hold-3-exhale-3",
        "breath_label": "Clarity Breath",
        "sound_hz": 285,
        "mantra": "Vam",
    },
    "water": {
        "name": "Tidal Glyphs",
        "origin": "The Coral Manuscripts of the Abyssal Archive",
        "description": "Flowing wave-forms that shift and reform like the tide",
        "color": "#3B82F6",
        "glyph_style": "flowing_wave",
        "breath_pattern": "inhale-4-exhale-8-hold-2",
        "breath_label": "Flow Breath",
        "sound_hz": 432,
        "mantra": "Om",
    },
}

# ── Tier System (5 progressive levels) ──
TIERS = {
    1: {"name": "Novice Scribe", "harmony_required": 0, "glyphs_per_day": 3, "xp_per_glyph": 15, "dust_per_glyph": 5, "modifier_value": 1},
    2: {"name": "Apprentice Linguist", "harmony_required": 25, "glyphs_per_day": 4, "xp_per_glyph": 25, "dust_per_glyph": 10, "modifier_value": 2},
    3: {"name": "Cipher Adept", "harmony_required": 45, "glyphs_per_day": 5, "xp_per_glyph": 40, "dust_per_glyph": 20, "modifier_value": 3},
    4: {"name": "Script Master", "harmony_required": 65, "glyphs_per_day": 6, "xp_per_glyph": 60, "dust_per_glyph": 35, "modifier_value": 5},
    5: {"name": "Archon of Tongues", "harmony_required": 85, "glyphs_per_day": 8, "xp_per_glyph": 100, "dust_per_glyph": 50, "modifier_value": 8},
}

# ── Glyph Pool (procedurally named, element-mapped) ──
GLYPH_ROOTS = {
    "wood": ["Ael", "Brin", "Cae", "Dael", "Eir", "Fae", "Gal", "Hael", "Ith", "Kel", "Lyr", "Mael"],
    "fire": ["Ash", "Byr", "Cyr", "Dra", "Esh", "Fra", "Gyr", "Hek", "Ign", "Kra", "Lar", "Mor"],
    "earth": ["Ard", "Bor", "Cor", "Dun", "Erd", "For", "Gor", "Har", "Ith", "Kor", "Lor", "Mor"],
    "metal": ["Aer", "Bri", "Cry", "Dir", "Eth", "Fir", "Gri", "Hir", "Iri", "Kri", "Lir", "Mir"],
    "water": ["Abb", "Bro", "Cob", "Dew", "Ebb", "Flo", "Gul", "Hyd", "Iss", "Kel", "Lak", "Mar"],
}

GLYPH_SUFFIXES = ["th", "ra", "el", "is", "or", "an", "us", "ia", "on", "yx", "um", "ae"]


def _daily_seed(user_id: str, date: str) -> int:
    return int(hashlib.sha256(f"{user_id}:lang:{date}".encode()).hexdigest()[:8], 16)


def _generate_daily_glyphs(user_id: str, element: str, count: int, date: str) -> list:
    """Generate deterministic daily glyphs for a user."""
    seed = _daily_seed(user_id, date)
    rng = random.Random(seed)
    roots = GLYPH_ROOTS.get(element, GLYPH_ROOTS["earth"])
    glyphs = []
    used = set()
    for i in range(count):
        root = rng.choice(roots)
        suffix = rng.choice(GLYPH_SUFFIXES)
        name = f"{root}{suffix}"
        while name in used:
            suffix = rng.choice(GLYPH_SUFFIXES)
            name = f"{root}{suffix}"
        used.add(name)
        # Difficulty increases with index
        difficulty = min(5, 1 + i)
        # Geometric complexity seed
        geo_seed = rng.randint(1000, 9999)
        glyphs.append({
            "id": f"g_{date}_{i}",
            "name": name,
            "element": element,
            "difficulty": difficulty,
            "geo_seed": geo_seed,
            "meaning": _glyph_meaning(rng, element),
            "phonetic": _glyph_phonetic(rng, name),
        })
    return glyphs


def _glyph_meaning(rng, element):
    meanings = {
        "wood": ["renewal", "growth", "blossom", "root-song", "canopy-light", "seed-memory", "vine-path", "leaf-dream"],
        "fire": ["ignition", "forge-will", "ash-truth", "flame-tongue", "ember-sight", "spark-mind", "blaze-heart", "corona-gate"],
        "earth": ["foundation", "stone-patience", "clay-memory", "deep-root", "layer-wisdom", "grain-truth", "bedrock-calm", "stratum-eye"],
        "metal": ["precision", "crystal-mind", "edge-truth", "mirror-self", "prism-sight", "blade-release", "alloy-bond", "facet-clarity"],
        "water": ["flow-state", "tide-memory", "depth-wisdom", "wave-breath", "current-path", "pearl-patience", "ripple-truth", "abyss-sight"],
    }
    return rng.choice(meanings.get(element, meanings["earth"]))


def _glyph_phonetic(rng, name):
    """Generate a phonetic guide for the glyph name."""
    vowels = "aeiou"
    result = []
    for ch in name.lower():
        if ch in vowels:
            result.append(ch + ("ː" if rng.random() > 0.7 else ""))
        else:
            result.append(ch)
    return "".join(result)


def _compute_tier(harmony: float) -> int:
    for t in sorted(TIERS.keys(), reverse=True):
        if harmony >= TIERS[t]["harmony_required"]:
            return t
    return 1


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/forgotten-languages/daily")
async def get_daily_cipher(user=Depends(get_current_user)):
    """Get today's cipher challenge based on Nexus state."""
    user_id = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Get Nexus state
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    tier = _compute_tier(harmony)
    tier_info = TIERS[tier]

    # Determine which element's script to study (deficient element)
    deficient_el = None
    min_pct = 100
    for eid, edata in balance["elements"].items():
        pct = edata.get("percentage", 20)
        if pct < min_pct:
            min_pct = pct
            deficient_el = eid
    if not deficient_el:
        deficient_el = "earth"

    script = SCRIPT_FAMILIES[deficient_el]

    # Check today's progress
    progress = await db.forgotten_languages_progress.find_one(
        {"user_id": user_id, "date": today}, {"_id": 0}
    )

    glyphs = _generate_daily_glyphs(user_id, deficient_el, tier_info["glyphs_per_day"], today)

    decoded_ids = []
    if progress:
        decoded_ids = progress.get("decoded_glyphs", [])

    for g in glyphs:
        g["decoded"] = g["id"] in decoded_ids

    return {
        "date": today,
        "element": deficient_el,
        "script": {
            "name": script["name"],
            "origin": script["origin"],
            "description": script["description"],
            "color": script["color"],
            "glyph_style": script["glyph_style"],
        },
        "breath": {
            "pattern": script["breath_pattern"],
            "label": script["breath_label"],
            "hz": script["sound_hz"],
            "mantra": script["mantra"],
        },
        "tier": tier,
        "tier_name": tier_info["name"],
        "harmony": harmony,
        "glyphs": glyphs,
        "decoded_count": len(decoded_ids),
        "total_glyphs": len(glyphs),
        "rewards_per_glyph": {
            "xp": tier_info["xp_per_glyph"],
            "dust": tier_info["dust_per_glyph"],
            "modifier": tier_info["modifier_value"],
        },
    }


@router.post("/forgotten-languages/decode")
async def decode_glyph(data: dict = Body(...), user=Depends(get_current_user)):
    """Decode a glyph — complete the breath cycle to unlock it."""
    user_id = user["id"]
    glyph_id = data.get("glyph_id")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if not glyph_id:
        raise HTTPException(400, "Missing glyph_id")

    # Verify glyph belongs to today
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    tier = _compute_tier(harmony)
    tier_info = TIERS[tier]

    # Get deficient element
    deficient_el = None
    min_pct = 100
    for eid, edata in balance["elements"].items():
        pct = edata.get("percentage", 20)
        if pct < min_pct:
            min_pct = pct
            deficient_el = eid
    if not deficient_el:
        deficient_el = "earth"

    glyphs = _generate_daily_glyphs(user_id, deficient_el, tier_info["glyphs_per_day"], today)
    glyph = next((g for g in glyphs if g["id"] == glyph_id), None)
    if not glyph:
        raise HTTPException(400, "Invalid glyph for today")

    # Check if already decoded
    progress = await db.forgotten_languages_progress.find_one(
        {"user_id": user_id, "date": today}, {"_id": 0}
    )
    decoded_ids = progress.get("decoded_glyphs", []) if progress else []
    if glyph_id in decoded_ids:
        raise HTTPException(400, "Glyph already decoded today")

    # Mark decoded
    decoded_ids.append(glyph_id)
    await db.forgotten_languages_progress.update_one(
        {"user_id": user_id, "date": today},
        {
            "$set": {
                "user_id": user_id,
                "date": today,
                "element": deficient_el,
                "decoded_glyphs": decoded_ids,
                "last_decoded_at": datetime.now(timezone.utc).isoformat(),
            },
        },
        upsert=True,
    )

    # Award rewards
    xp_result = await award_xp(user_id, tier_info["xp_per_glyph"], f"forgotten_languages:{glyph['name']}")
    await award_currency(user_id, "cosmic_dust", tier_info["dust_per_glyph"], f"forgotten_languages:{glyph['name']}")
    await modify_stat(user_id, "wisdom", 1, f"forgotten_languages:{glyph['name']}")

    # Apply permanent Nexus decoded modifier
    await db.nexus_decoded_modifiers.update_one(
        {"user_id": user_id},
        {"$inc": {f"modifiers.{deficient_el}": tier_info["modifier_value"]}},
        upsert=True,
    )

    # Track mastery progress
    await db.forgotten_languages_mastery.update_one(
        {"user_id": user_id, "element": deficient_el},
        {
            "$inc": {"total_decoded": 1, "total_xp": tier_info["xp_per_glyph"]},
            "$set": {"last_decoded": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )

    all_decoded = len(decoded_ids) >= len(glyphs)

    return {
        "decoded": True,
        "glyph": glyph,
        "rewards": {
            "xp": tier_info["xp_per_glyph"],
            "dust": tier_info["dust_per_glyph"],
            "modifier": f"+{tier_info['modifier_value']} {deficient_el}",
        },
        "level": xp_result,
        "progress": {
            "decoded_count": len(decoded_ids),
            "total_glyphs": len(glyphs),
            "all_decoded": all_decoded,
        },
    }


@router.get("/forgotten-languages/mastery")
async def get_mastery(user=Depends(get_current_user)):
    """Get the user's language mastery progress across all elements."""
    user_id = user["id"]
    mastery = await db.forgotten_languages_mastery.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    ).to_list(10)

    # Get all-time decoded modifiers
    mods = await db.nexus_decoded_modifiers.find_one(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    )
    modifiers = mods.get("modifiers", {}) if mods else {}

    # Current tier
    balance = await compute_elemental_balance(user_id)
    harmony = balance["harmony_score"]
    current_tier = _compute_tier(harmony)

    # Build per-element mastery
    by_element = {}
    for m in mastery:
        el = m.get("element", "unknown")
        by_element[el] = {
            "total_decoded": m.get("total_decoded", 0),
            "total_xp": m.get("total_xp", 0),
            "modifier_value": modifiers.get(el, 0),
            "script": SCRIPT_FAMILIES.get(el, {}).get("name", "Unknown"),
            "last_decoded": m.get("last_decoded"),
        }

    # Total stats
    total_decoded = sum(m.get("total_decoded", 0) for m in mastery)

    # All tiers with unlock status
    tiers = []
    for tid, tinfo in TIERS.items():
        tiers.append({
            "tier": tid,
            "name": tinfo["name"],
            "harmony_required": tinfo["harmony_required"],
            "unlocked": harmony >= tinfo["harmony_required"],
            "current": tid == current_tier,
            "glyphs_per_day": tinfo["glyphs_per_day"],
            "xp_per_glyph": tinfo["xp_per_glyph"],
        })

    return {
        "current_tier": current_tier,
        "current_tier_name": TIERS[current_tier]["name"],
        "harmony": harmony,
        "total_decoded": total_decoded,
        "by_element": by_element,
        "modifiers": modifiers,
        "tiers": tiers,
        "scripts": {eid: {"name": s["name"], "color": s["color"], "origin": s["origin"]}
                     for eid, s in SCRIPT_FAMILIES.items()},
    }


@router.get("/forgotten-languages/scripts")
async def get_scripts(user=Depends(get_current_user)):
    """Get all script families with their breath patterns."""
    return {
        "scripts": {
            eid: {
                "name": s["name"],
                "origin": s["origin"],
                "description": s["description"],
                "color": s["color"],
                "glyph_style": s["glyph_style"],
                "breath": {
                    "pattern": s["breath_pattern"],
                    "label": s["breath_label"],
                    "hz": s["sound_hz"],
                    "mantra": s["mantra"],
                },
            }
            for eid, s in SCRIPT_FAMILIES.items()
        }
    }

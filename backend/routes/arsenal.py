"""
arsenal.py — Sovereign Arsenal Index (V68.80)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Surfaces EVERY generator and active engine registered in the app as a
single unified index so the owner can fire any of them from inside the
shipped AAB without writing new code.

Owner-gated via `CREATOR_EMAIL` from auth.py so this panel never leaks
to regular users. No new LLM, no new SDK — it's a pure registry view
that calls back into existing generator endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.auth import CREATOR_EMAIL
import uuid

router = APIRouter()


async def _require_owner(user: dict):
    """Gate access to the owner. `get_current_user` returns a minimal dict
    (id, name, role) with no email, so we resolve email from the DB and
    also accept the `is_owner` flag as a fallback."""
    doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "email": 1, "is_owner": 1, "role": 1},
    ) or {}
    email = (doc.get("email") or "").lower()
    if email == CREATOR_EMAIL.lower() or doc.get("is_owner") is True:
        return
    raise HTTPException(status_code=403, detail="Owner-only arsenal")


# ─── Hand-curated manifest of every fire-able unit ────────────
# Pattern per entry: {id, name, category, kind, method, path, body_hint?}
# `method` + `path` are the real API call the frontend uses to "fire" it.
# Every entry below is grep-verified to exist in routes/.

GENERATORS = [
    # ─── Storylines / Narrative ────────────────────────────────
    {"id": "gen-starseed-scene",   "name": "Starseed Scene",        "category": "storyline", "kind": "Narrative",      "method": "POST", "path": "/api/starseed/generate-scene"},
    {"id": "gen-omnis-quest",      "name": "Omnis RPG Quest",       "category": "storyline", "kind": "Quest",          "method": "POST", "path": "/api/omnis/rpg/quest/generate"},
    {"id": "gen-omega-quest",      "name": "Omega Quest",           "category": "storyline", "kind": "Quest",          "method": "POST", "path": "/api/omnis/omega/quest/generate"},
    {"id": "gen-rpg-quest",        "name": "RPG Quest",             "category": "storyline", "kind": "Quest",          "method": "POST", "path": "/api/rpg/quest/generate"},
    {"id": "gen-creation-myth",    "name": "Civilization Myth",     "category": "storyline", "kind": "Narrative",      "method": "POST", "path": "/api/myths/:civ_id/generate", "body_hint": {"civ_id": "egyptian"}},
    {"id": "gen-bible-chapter",    "name": "Bible Chapter",         "category": "storyline", "kind": "Scripture",      "method": "POST", "path": "/api/bible/books/:book_id/chapters/:chapter_num/generate"},
    {"id": "gen-scene",            "name": "Generic Scene",         "category": "storyline", "kind": "Scene",          "method": "POST", "path": "/api/scene/generate"},
    {"id": "gen-creation",         "name": "Free-form Creation",    "category": "storyline", "kind": "Mixed",          "method": "POST", "path": "/api/creations/ai-generate"},
    {"id": "gen-sage-quest",       "name": "Sage Quest",            "category": "storyline", "kind": "Quest",          "method": "POST", "path": "/api/generate-quest/:sage_id"},

    # ─── Items / Tools / Stones / Elements ─────────────────────
    {"id": "gen-forge-tool",       "name": "Forge New Tool",        "category": "item",      "kind": "Tool",           "method": "POST", "path": "/api/tools/create"},
    {"id": "gen-forge-skill",      "name": "Forge Skill",           "category": "item",      "kind": "Skill",          "method": "POST", "path": "/api/skills/generate"},
    {"id": "gen-blueprint",        "name": "Transmuter Blueprint",  "category": "item",      "kind": "Blueprint",      "method": "POST", "path": "/api/generate-blueprint"},
    {"id": "gen-entity-herb",      "name": "OmniBridge Herb Entity","category": "item",      "kind": "Herb",           "method": "POST", "path": "/api/omni/herb/synthesize"},

    # ─── Avatars / Visuals / Media ─────────────────────────────
    {"id": "gen-avatar-build",     "name": "Avatar Config",         "category": "avatar",    "kind": "Avatar",         "method": "POST", "path": "/api/starseed/avatar-builder/generate"},
    {"id": "gen-avatar-visual",    "name": "Avatar Image",          "category": "avatar",    "kind": "Image",          "method": "POST", "path": "/api/ai-visuals/generate-avatar"},
    {"id": "gen-visual-scene",     "name": "Scene Image",           "category": "avatar",    "kind": "Image",          "method": "POST", "path": "/api/ai-visuals/generate-scene"},
    {"id": "gen-video-sora",       "name": "Video (Sora 2)",        "category": "avatar",    "kind": "Video",          "method": "POST", "path": "/api/ai-visuals/generate-video"},
    {"id": "gen-intro-video",      "name": "Intro Video",           "category": "avatar",    "kind": "Video",          "method": "POST", "path": "/api/ai-visuals/intro-video/generate"},

    # ─── Readings / Oracles / Sequences ────────────────────────
    {"id": "gen-forecast",         "name": "Astrological Forecast", "category": "reading",   "kind": "Forecast",       "method": "POST", "path": "/api/forecasts/generate"},
    {"id": "gen-soul-report",      "name": "Soul Report",           "category": "reading",   "kind": "Report",         "method": "POST", "path": "/api/soul-reports/generate"},
    {"id": "gen-daily-ritual",     "name": "Daily Ritual",          "category": "reading",   "kind": "Ritual",         "method": "GET",  "path": "/api/daily-ritual/generate"},
    {"id": "gen-affirmation",      "name": "Affirmation",           "category": "reading",   "kind": "Text",           "method": "POST", "path": "/api/affirmations/generate"},
    {"id": "gen-affirmation-set",  "name": "Affirmation Set",       "category": "reading",   "kind": "Text",           "method": "POST", "path": "/api/affirmations/generate-set"},
    {"id": "gen-meditation",       "name": "Guided Meditation",     "category": "reading",   "kind": "Script",         "method": "POST", "path": "/api/meditation/generate-guided"},
    {"id": "gen-meditation-audio", "name": "Meditation Audio (TTS)","category": "reading",   "kind": "Audio",          "method": "POST", "path": "/api/meditation/generate-audio"},
    {"id": "gen-meditation-const", "name": "Meditation Constellation","category": "reading", "kind": "Constellation",  "method": "POST", "path": "/api/meditation/generate-constellation"},
    {"id": "gen-journal",          "name": "Living Journal Entry",  "category": "reading",   "kind": "Text",           "method": "POST", "path": "/api/journal/generate"},
    {"id": "gen-mixer-ai",         "name": "AI Mixer Composition",  "category": "reading",   "kind": "Audio",          "method": "POST", "path": "/api/mixer/ai/generate-mix"},
    {"id": "gen-phonic-flourish",  "name": "Phonic Flourish",       "category": "reading",   "kind": "Audio",          "method": "POST", "path": "/api/generate-flourish"},
    {"id": "gen-guided-xp",        "name": "Guided Experience",     "category": "reading",   "kind": "Experience",     "method": "POST", "path": "/api/guided-experience/generate"},

    # ─── Economy / Utility Generators ──────────────────────────
    {"id": "gen-merchant-catalog", "name": "Merchant Catalog",      "category": "economy",   "kind": "Catalog",        "method": "GET",  "path": "/api/trade-circle/ai-merchant"},
    {"id": "gen-gen-catalog",      "name": "Generator Catalog",     "category": "economy",   "kind": "Catalog",        "method": "GET",  "path": "/api/trade-circle/generators/catalog"},
    {"id": "gen-vault",            "name": "My Vault Generators",   "category": "economy",   "kind": "Vault",          "method": "GET",  "path": "/api/vault/generators"},
    {"id": "gen-tier-map",         "name": "Gilded Path Tier Map",  "category": "economy",   "kind": "Matrix",         "method": "GET",  "path": "/api/trade-circle/tier-map"},
    {"id": "gen-compliance",       "name": "Compliance Manifest",   "category": "economy",   "kind": "Policy",         "method": "GET",  "path": "/api/trade-circle/compliance"},
]


# ─── Engines (active only — surfaced with descriptive metadata) ─
ACTIVE_ENGINES = [
    # Frontend render-mode engines tied to pull() pillars (27 adapters).
    # Firing an engine from the arsenal simply pull()s its module.
    {"id": "AVATAR_GEN",       "name": "Avatar Generator",      "layer": "frontend", "kind": "render-adapter"},
    {"id": "COSMIC_PORTRAIT",  "name": "Cosmic Portrait",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "FORECASTS",        "name": "Forecasts",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "DREAM_VIZ",        "name": "Dream Visualizer",      "layer": "frontend", "kind": "render-adapter"},
    {"id": "STORY_GEN",        "name": "Story Generator",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "SCENE_GEN",        "name": "Scene Generator",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "STARSEED",         "name": "Starseed RPG",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "ORACLE",           "name": "Oracle & Tarot",        "layer": "frontend", "kind": "render-adapter"},
    {"id": "AKASHIC",          "name": "Akashic Records",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "STAR_CHART",       "name": "Star Chart",            "layer": "frontend", "kind": "render-adapter"},
    {"id": "NUMEROLOGY",       "name": "Numerology",            "layer": "frontend", "kind": "render-adapter"},
    {"id": "MAYAN",            "name": "Mayan Astrology",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "CARDOLOGY",        "name": "Cardology",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "ANIMAL_TOTEMS",    "name": "Animal Totems",         "layer": "frontend", "kind": "render-adapter"},
    {"id": "HEXAGRAM",         "name": "Hexagram Journal",      "layer": "frontend", "kind": "render-adapter"},
    {"id": "COSMIC_INSIGHTS",  "name": "Cosmic Insights",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "SOUL_REPORTS",     "name": "Soul Reports",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "BREATHWORK",       "name": "Breathwork",            "layer": "frontend", "kind": "render-adapter"},
    {"id": "MEDITATION",       "name": "Meditation",            "layer": "frontend", "kind": "render-adapter"},
    {"id": "YOGA",             "name": "Yoga",                  "layer": "frontend", "kind": "render-adapter"},
    {"id": "AFFIRMATIONS",     "name": "Affirmations",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "MOOD_TRACKER",     "name": "Mood Tracker",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "SOUNDSCAPES",      "name": "Soundscapes",           "layer": "frontend", "kind": "render-adapter"},
    {"id": "FREQUENCIES",      "name": "Frequencies",           "layer": "frontend", "kind": "render-adapter"},
    {"id": "JOURNAL",          "name": "Journal",               "layer": "frontend", "kind": "render-adapter"},
    {"id": "HERBOLOGY",        "name": "Herbology",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "CRYSTALS",         "name": "Crystals",              "layer": "frontend", "kind": "render-adapter"},
    # V68.81 — Entertainment/Education pillar batch (+15)
    {"id": "ACUPRESSURE",      "name": "Acupressure",           "layer": "frontend", "kind": "render-adapter"},
    {"id": "AROMATHERAPY",     "name": "Aromatherapy",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "REFLEXOLOGY",      "name": "Reflexology",           "layer": "frontend", "kind": "render-adapter"},
    {"id": "BIBLE",            "name": "Bible",                 "layer": "frontend", "kind": "render-adapter"},
    {"id": "BLESSINGS",        "name": "Blessings",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "DAILY_RITUAL",     "name": "Daily Ritual",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "ELIXIRS",          "name": "Elixirs",               "layer": "frontend", "kind": "render-adapter"},
    {"id": "ENCYCLOPEDIA",     "name": "Encyclopedia",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "COSMIC_CALENDAR",  "name": "Cosmic Calendar",       "layer": "frontend", "kind": "render-adapter"},
    {"id": "SACRED_TEXTS",     "name": "Sacred Texts",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "MANTRAS",          "name": "Mantras",               "layer": "frontend", "kind": "render-adapter"},
    {"id": "MUDRAS",           "name": "Mudras",                "layer": "frontend", "kind": "render-adapter"},
    {"id": "RITUALS",          "name": "Rituals",               "layer": "frontend", "kind": "render-adapter"},
    {"id": "TEACHINGS",        "name": "Teachings",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "ZEN_GARDEN",       "name": "Zen Garden",            "layer": "frontend", "kind": "render-adapter"},
    # V68.82 — Building-Equipment / Workshop pillar batch (+15)
    {"id": "WORKSHOP",         "name": "Workshop",              "layer": "frontend", "kind": "render-adapter"},
    {"id": "TRADE_CIRCLE",     "name": "Trade Circle",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "TRADE_PASSPORT",   "name": "Trade Passport",        "layer": "frontend", "kind": "render-adapter"},
    {"id": "MUSIC_LOUNGE",     "name": "Music Lounge",          "layer": "frontend", "kind": "render-adapter"},
    {"id": "TESSERACT",        "name": "Tesseract",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "MULTIVERSE_MAP",   "name": "Multiverse Map",        "layer": "frontend", "kind": "render-adapter"},
    {"id": "MULTIVERSE_REALMS","name": "Multiverse Realms",     "layer": "frontend", "kind": "render-adapter"},
    {"id": "MASTER_VIEW",      "name": "Master View",           "layer": "frontend", "kind": "render-adapter"},
    {"id": "SMARTDOCK",        "name": "SmartDock",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "SANCTUARY",        "name": "Sanctuary",             "layer": "frontend", "kind": "render-adapter"},
    {"id": "SILENT_SANCTUARY", "name": "Silent Sanctuary",      "layer": "frontend", "kind": "render-adapter"},
    {"id": "REFINEMENT_LAB",   "name": "Refinement Lab",        "layer": "frontend", "kind": "render-adapter"},
    {"id": "RECURSIVE_DIVE",   "name": "Recursive Dive",        "layer": "frontend", "kind": "render-adapter"},
    {"id": "QUANTUM_FIELD",    "name": "Quantum Field",         "layer": "frontend", "kind": "render-adapter"},
    {"id": "QUANTUM_LOOM",     "name": "Quantum Loom",          "layer": "frontend", "kind": "render-adapter"},
    # Backend active engines (surfaced for transparency — most are auto-wired)
    {"id": "compliance_shield",  "name": "Compliance Shield",    "layer": "backend",  "kind": "firewall"},
    {"id": "crystal_seal",       "name": "Crystal Seal",         "layer": "backend",  "kind": "hash"},
    {"id": "sovereign_economy",  "name": "Sovereign Economy",    "layer": "backend",  "kind": "ledger"},
    {"id": "harmonic_core",      "name": "Harmonic Core",        "layer": "backend",  "kind": "resonance"},
    {"id": "autonomous_verifier","name": "Autonomous Verifier",  "layer": "backend",  "kind": "guard"},
    {"id": "detection_generator","name": "Detection Generator",  "layer": "backend",  "kind": "scan"},
    {"id": "aether_fund",        "name": "Aether Fund",          "layer": "backend",  "kind": "treasury"},
    {"id": "central_crystal",    "name": "Central Crystal",      "layer": "backend",  "kind": "core"},
    {"id": "crystalline_vault",  "name": "Crystalline Vault",    "layer": "backend",  "kind": "storage"},
    {"id": "resonance_vault",    "name": "Resonance Vault",      "layer": "backend",  "kind": "storage"},
    {"id": "sovereign_refractor","name": "Sovereign Refractor",  "layer": "backend",  "kind": "optics"},
    {"id": "sovereign_armor",    "name": "Sovereign Armor",      "layer": "backend",  "kind": "shield"},
    {"id": "reciprocity_gate",   "name": "Reciprocity Gate",     "layer": "backend",  "kind": "gate"},
    {"id": "base_module",        "name": "Base Module",          "layer": "backend",  "kind": "root"},
    {"id": "holistic_healing",   "name": "Holistic Healing",     "layer": "backend",  "kind": "synth"},
    {"id": "xr_spatial",         "name": "XR Spatial",           "layer": "backend",  "kind": "spatial"},
    {"id": "sovereign_singularity","name": "Sovereign Singularity","layer": "backend","kind": "unified"},
]


@router.get("/arsenal/index")
async def arsenal_index(user=Depends(get_current_user)):
    """Owner-only unified index of every fire-able generator + active engine."""
    await _require_owner(user)

    # Read fire-history so the UI can show last-used timestamps
    history = {}
    async for row in db.arsenal_history.find({"user_id": user["id"]}, {"_id": 0}):
        history[row["item_id"]] = {
            "last_fired": row.get("last_fired"),
            "fire_count": row.get("fire_count", 0),
            "dwell_seconds": int(row.get("dwell_seconds", 0)),
        }

    def annotate(lst):
        return [{**item, **history.get(item["id"], {"last_fired": None, "fire_count": 0, "dwell_seconds": 0})} for item in lst]

    gens = annotate(GENERATORS)
    engs = annotate(ACTIVE_ENGINES)

    # Top-fired combined list (both generators + engines) sorted by fire_count desc.
    # Used for the "Most-Fired" strip at the top of the Arsenal UI — turns the
    # Workshop into a self-organizing dashboard.
    combined = [{**g, "unit": "generator"} for g in gens] + [{**e, "unit": "engine"} for e in engs]
    top_fired = sorted(
        [c for c in combined if c.get("fire_count", 0) > 0],
        key=lambda c: (c.get("fire_count", 0), c.get("last_fired") or ""),
        reverse=True,
    )[:6]

    # V68.82 — Time-in-Engine. Surfaces the units the owner actually
    # *dwells* in (vs. just clicks). Engines accumulate dwell when
    # pull()'d into the matrix slot; generators don't dwell so they
    # only show here if a user manually paged through their result.
    top_dwell = sorted(
        [c for c in combined if c.get("dwell_seconds", 0) > 0],
        key=lambda c: c.get("dwell_seconds", 0),
        reverse=True,
    )[:6]

    return {
        "generators": gens,
        "engines": engs,
        "categories": sorted({g["category"] for g in GENERATORS}),
        "engine_layers": ["frontend", "backend"],
        "top_fired": top_fired,
        "top_dwell": top_dwell,
        "totals": {
            "generators": len(GENERATORS),
            "engines": len(ACTIVE_ENGINES),
        },
    }


@router.post("/arsenal/fire-log")
async def arsenal_fire_log(data: dict = Body(...), user=Depends(get_current_user)):
    """Record a "fire" event — called client-side after a user clicks Fire.
    The actual API call happens client-side hitting the item's real endpoint;
    this just logs history so the index shows last-fired timestamps."""
    await _require_owner(user)
    item_id = data.get("item_id", "").strip()
    outcome = data.get("outcome", "ok")  # ok | error
    if not item_id:
        raise HTTPException(status_code=400, detail="item_id required")
    now = datetime.now(timezone.utc).isoformat()
    await db.arsenal_history.update_one(
        {"user_id": user["id"], "item_id": item_id},
        {
            "$set": {"last_fired": now, "last_outcome": outcome},
            "$inc": {"fire_count": 1},
            "$setOnInsert": {"id": str(uuid.uuid4()), "created_at": now},
        },
        upsert=True,
    )
    return {"logged": True, "item_id": item_id, "at": now}


@router.post("/arsenal/dwell-log")
async def arsenal_dwell_log(data: dict = Body(...), user=Depends(get_current_user)):
    """V68.82 — Time-in-Engine. Frontend posts elapsed seconds when an
    engine is released or another module is pulled. Server clamps the
    value to a sane window (0..3600s) so a forgotten tab can't inflate
    rankings, then atomically increments dwell_seconds on the history
    row. Used to power the "⏱ Most Time" strip alongside Most Fired."""
    await _require_owner(user)
    item_id = (data.get("item_id") or "").strip()
    seconds = data.get("seconds", 0)
    try:
        seconds = int(seconds)
    except (TypeError, ValueError):
        seconds = 0
    if not item_id:
        raise HTTPException(status_code=400, detail="item_id required")
    if seconds <= 0:
        return {"logged": False, "reason": "non-positive duration"}
    seconds = min(seconds, 3600)  # cap at 1h per session
    now = datetime.now(timezone.utc).isoformat()
    await db.arsenal_history.update_one(
        {"user_id": user["id"], "item_id": item_id},
        {
            "$inc": {"dwell_seconds": seconds},
            "$set": {"last_dwell_at": now},
            "$setOnInsert": {"id": str(uuid.uuid4()), "created_at": now},
        },
        upsert=True,
    )
    return {"logged": True, "item_id": item_id, "added_seconds": seconds}

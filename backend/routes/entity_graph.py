"""
entity_graph.py — The Inlay (Unified Knowledge Graph)
─────────────────────────────────────────────────────────────────────
This is NOT a new database. It is a federated resolver that unifies
the four pre-existing plant/herb/oil silos into a single canonical
graph indexed by canonical id and a fat alias map.

Existing silos (all preserved, none duplicated):
  • routes/herbology.py        → HERBS               (15 entries, Ayurveda + Western)
  • routes/botany.py           → PLANT_CATALOG       (18 entries, TCM-leaning)
  • routes/aromatherapy.py     → ESSENTIAL_OILS      (12 entries, Western/Mediterranean)
  • routes/sovereign_library.py → SOVEREIGN_LIBRARY  (10 traditions, ~50 plant mentions each)

What this module adds:
  • A single in-memory ENTITY_INDEX keyed by canonical id, with
    every silo entry mapped to one node.
  • An ALIAS_MAP that resolves user queries — "mint" → peppermint;
    "tulsi" → holy_basil; "ginseng root" → ginseng.
  • GET /api/entity/index   — flat whitelist for instant client
    autocomplete (no LLM, no DB hit).
  • GET /api/entity/{id}    — full node, federated across silos +
    sovereign_library tradition mentions.
  • POST /api/entity/synthesize  — circuit-breaker LLM gate that
    re-uses the existing knowledge_cache collection (knowledge.py)
    so off-graph queries persist into a single brain.

Cross-pollination: every entity GET also embeds the seed payload
that frontend will commit to ContextBus.entityState — Tarot/Oracle
already absorb this through V68.61.
"""
from fastapi import APIRouter, HTTPException, Body, Depends
from deps import db, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import re
import asyncio
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

# ═══════════════════════════════════════════════════════════════
# Live import of every existing silo. We re-export their lists,
# we do NOT redefine them. If a herb is added to herbology.py, this
# graph picks it up on the next backend reload (hot reload).
# ═══════════════════════════════════════════════════════════════
from routes.herbology import HERBS as _HERBS
from routes.botany import PLANT_CATALOG as _PLANTS
from routes.aromatherapy import ESSENTIAL_OILS as _OILS
from routes.sovereign_library import SOVEREIGN_LIBRARY as _LIBRARY

router = APIRouter()


# ─────────────────────────────────────────────────────────────────
# Canonicalization helpers
# ─────────────────────────────────────────────────────────────────
def _slug(text: str) -> str:
    """Stable id slug. 'Holy Basil (Tulsi)' → 'holy_basil_tulsi'."""
    s = (text or "").lower().strip()
    s = re.sub(r"\([^)]*\)", "", s)         # drop parens content first pass
    s = re.sub(r"[^a-z0-9\s_-]", " ", s)
    s = re.sub(r"\s+", "_", s).strip("_")
    return s or "unknown"


def _aliases_from_name(name: str) -> list:
    """Yield common spelling variants the user might type.

    'Holy Basil (Tulsi)'  →  ['holy basil', 'tulsi', 'holy_basil', 'holy basil tulsi']
    'He Shou Wu'          →  ['he shou wu', 'fo-ti', 'fo ti']
    """
    out = set()
    if not name:
        return []
    raw = name.strip()
    out.add(raw.lower())
    out.add(_slug(raw).replace("_", " "))
    out.add(_slug(raw))
    # Pull anything inside parens as its own alias
    paren = re.findall(r"\(([^)]+)\)", raw)
    for p in paren:
        out.add(p.strip().lower())
        out.add(_slug(p))
    # First word (often the genus/common name)
    first = raw.split(" ")[0].lower()
    out.add(first)
    out.add(_slug(first))
    return [a for a in out if a]


# ─────────────────────────────────────────────────────────────────
# Build the unified graph at module import.
# ─────────────────────────────────────────────────────────────────
ENTITY_INDEX = {}   # canonical_id → unified node
ALIAS_MAP    = {}   # alias-string → canonical_id

# Hand-curated cross-silo aliases. These are the "Mint→Peppermint"
# bridges the user explicitly called out. Lowercased keys.
CROSS_ALIASES = {
    # Western / culinary common names → canonical
    "mint":          "peppermint",
    "spearmint":     "peppermint",
    "garden mint":   "peppermint",
    "fo-ti":         "he_shou_wu",
    "fo ti":         "he_shou_wu",
    "rishi":         "reishi",
    "lingzhi":       "reishi",
    "ling zhi":      "reishi",
    "withania":      "ashwagandha",
    "winter cherry": "ashwagandha",
    "haridra":       "turmeric",
    "curcuma":       "turmeric",
    "tulasi":        "holy_basil",
    "tulsi":         "holy_basil",
    "ocimum":        "holy_basil",
    "matricaria":    "chamomile",
    "manzanilla":    "chamomile",
    "zingiber":      "ginger",
    "echinacea purpurea": "echinacea",
    "purple coneflower":  "echinacea",
    "valeriana":     "valerian",
    "passiflora":    "passionflower",
    "urtica":        "stinging_nettle",
    "nettle":        "stinging_nettle",
    "sambucus":      "elderberry",
    "elder":         "elderberry",
    "hericium":      "lions_mane",
    "lion's mane":   "lions_mane",
    "panax":         "ginseng",
    "korean ginseng":"ginseng",
    "asian ginseng": "ginseng",
    "huang qi":      "astragalus",
    "milk vetch":    "astragalus",
    "shu di huang":  "rehmannia",
    "ju hua":        "chrysanthemum",
    "wu wei zi":     "schisandra",
    "white peony root": "white_peony",
    "bai shao":      "white_peony",
    "dong chong":    "cordyceps",
    "gan cao":       "licorice_root",
    "licorice":      "licorice_root",
    "lavandula":     "lavender",
    "boswellia":     "frankincense",
    "olibanum":      "frankincense",
    "rosa damascena":"rose",
    "santalum":      "sandalwood",
    "melaleuca":     "tea_tree",
    "rosmarinus":    "rosemary",
    "commiphora":    "myrrh",
    "mentha":        "peppermint",
}


def _ingest(node: dict, source: str):
    """Merge a silo entry into the unified index."""
    raw_id = node.get("id") or _slug(node.get("name", ""))
    if not raw_id:
        return
    canonical = raw_id.lower()
    name = node.get("name", canonical.replace("_", " ").title())

    if canonical in ENTITY_INDEX:
        # Merge — a plant in multiple silos enriches the same node.
        existing = ENTITY_INDEX[canonical]
        existing.setdefault("sources", []).append(source)
        existing.setdefault("silo_data", {})[source] = node
        # Promote latin/family if missing
        for key in ("latin", "family", "color"):
            if not existing.get(key) and node.get(key):
                existing[key] = node[key]
        return

    # First sighting — seed the unified node.
    ENTITY_INDEX[canonical] = {
        "id": canonical,
        "name": name,
        "type": (
            "oil"   if source == "aromatherapy"
            else "plant" if source == "botany"
            else "herb"
        ),
        "latin":   node.get("latin", ""),
        "family":  node.get("family", ""),
        "color":   node.get("color", "#A78BFA"),
        "sources": [source],
        "silo_data": {source: node},
        "tradition_views": {},   # filled later from sovereign_library
        "related": [],           # graph edges
    }

    # Register every alias variant we can derive from the name.
    for alias in _aliases_from_name(name):
        ALIAS_MAP.setdefault(alias, canonical)
    ALIAS_MAP.setdefault(canonical, canonical)
    # Also any explicit blends_with from aromatherapy become edges
    for blend in node.get("blends_with", []) or []:
        b = (blend or "").lower()
        if b:
            ENTITY_INDEX[canonical].setdefault("blends_with", []).append(b)


# Seed all four silos (order matters: aromatherapy first so 'mint'
# resolves to peppermint before any later silo claims the slug).
for oil in _OILS:
    _ingest(oil, "aromatherapy")
for herb in _HERBS:
    _ingest(herb, "herbology")
for plant in _PLANTS:
    _ingest(plant, "botany")

# Layer in tradition mentions from sovereign_library. Every plant
# named under tradition.healing.plants gets its tradition_views[T]
# populated (or, if the plant isn't yet in the graph, a stub node
# is created so the user CAN still reach it via search).
def _strip_paren_name(s: str) -> str:
    return re.sub(r"\([^)]*\)", "", s).strip()

for trad_id, trad in _LIBRARY.items():
    plants = (trad.get("healing") or {}).get("plants", []) or []
    trad_name = trad.get("name", trad_id)
    for plant_str in plants:
        # "Tea tree (Melaleuca — antiseptic)" → "tea tree"
        common = _strip_paren_name(plant_str).lower()
        # Try alias resolution first, then slug.
        canonical = ALIAS_MAP.get(common) or ALIAS_MAP.get(_slug(common))
        if not canonical:
            # Brand-new tradition-only plant — register a stub.
            slug = _slug(common) or _slug(plant_str)
            if not slug or slug == "unknown":
                continue
            canonical = slug
            ENTITY_INDEX[canonical] = {
                "id": canonical,
                "name": common.title() or plant_str,
                "type": "tradition_plant",
                "latin": "",
                "family": "",
                "color": "#A78BFA",
                "sources": ["sovereign_library"],
                "silo_data": {},
                "tradition_views": {},
                "related": [],
            }
            for alias in _aliases_from_name(common):
                ALIAS_MAP.setdefault(alias, canonical)
        # Attach the tradition's perspective text on this plant.
        ENTITY_INDEX[canonical]["tradition_views"][trad_id] = {
            "tradition_id": trad_id,
            "tradition_name": trad_name,
            "raw_mention": plant_str,
            "principle": (trad.get("healing") or {}).get("principle", ""),
        }
        ENTITY_INDEX[canonical].setdefault("traditions", []).append(trad_id)


# Apply the hand-curated cross-aliases LAST so they always win.
for alias, target in CROSS_ALIASES.items():
    if target in ENTITY_INDEX:
        ALIAS_MAP[alias] = target
        ALIAS_MAP[_slug(alias)] = target


logger.info(
    f"Entity Graph (Inlay) sealed: {len(ENTITY_INDEX)} nodes, "
    f"{len(ALIAS_MAP)} aliases · sources merged: "
    f"herbology({len(_HERBS)}) + botany({len(_PLANTS)}) + "
    f"aromatherapy({len(_OILS)}) + sovereign_library({len(_LIBRARY)})"
)


# ─────────────────────────────────────────────────────────────────
# Public API — the Pull endpoints
# ─────────────────────────────────────────────────────────────────
def _resolve(query: str) -> str | None:
    """Lower-case alias→canonical lookup. Falls through to slug."""
    if not query:
        return None
    q = query.strip().lower()
    if q in ALIAS_MAP:
        return ALIAS_MAP[q]
    s = _slug(q)
    if s in ALIAS_MAP:
        return ALIAS_MAP[s]
    if s in ENTITY_INDEX:
        return s
    return None


@router.get("/entity/index")
async def entity_index():
    """The whitelist — all canonical ids + aliases for instant
    client-side autocomplete. No LLM, no DB hit, no auth required."""
    nodes = []
    for cid, node in ENTITY_INDEX.items():
        nodes.append({
            "id": cid,
            "name": node["name"],
            "type": node["type"],
            "latin": node.get("latin", ""),
            "color": node.get("color", "#A78BFA"),
            "traditions": node.get("traditions", []),
            "sources": node.get("sources", []),
        })
    nodes.sort(key=lambda n: n["name"])
    # Build a fat name list for fuzzy matching client-side
    aliases = sorted({a for a in ALIAS_MAP.keys() if a})
    return {
        "version": "v68.62",
        "count": len(nodes),
        "alias_count": len(aliases),
        "nodes": nodes,
        "aliases": aliases,
    }


@router.get("/entity/surface-area")
async def entity_surface_area(user=Depends(get_current_user_optional)):
    """V68.65 — Sage Gauge depth feed.

    Returns the total Inlay node count, the count this user has
    illuminated, and a list of unexplored nodes ordered so the
    gauge can pulse the user toward where their graph is thinnest.
    Anonymous → returns total only.

    NOTE: This static route MUST be declared BEFORE the dynamic
    `/entity/{entity_id}` resolver below, otherwise FastAPI tries
    to resolve "surface-area" as an entity id (returning 404).
    """
    total = len(ENTITY_INDEX)
    if not user:
        return {
            "total":     total,
            "viewed":    0,
            "ratio":     0.0,
            "unexplored_sample": [],
        }
    viewed_ids = set()
    try:
        cursor = db.entity_views.find({"user_id": user["id"]}, {"_id": 0, "entity_id": 1})
        async for doc in cursor:
            viewed_ids.add(doc.get("entity_id"))
    except Exception as e:
        logger.warning(f"entity_views read failed: {e}")
    viewed = len(viewed_ids & set(ENTITY_INDEX.keys()))
    ratio = round(viewed / total, 4) if total else 0.0
    unexplored = []
    for cid, node in ENTITY_INDEX.items():
        if cid in viewed_ids:
            continue
        unexplored.append({
            "id":         cid,
            "name":       node["name"],
            "type":       node["type"],
            "richness":   len(node.get("tradition_views") or {}) + len(node.get("sources") or []),
        })
    unexplored.sort(key=lambda n: -n["richness"])
    return {
        "total":              total,
        "viewed":             viewed,
        "ratio":              ratio,
        "unexplored_sample":  unexplored[:6],
    }


@router.get("/entity/{entity_id}")
async def entity_resolve(entity_id: str, user=Depends(get_current_user_optional)):
    """Federated resolver. Pulls the full unified node from the Inlay.
    The frontend reads this once and broadcasts to ContextBus, so the
    whole engine knows what's active.

    V68.65 — Side-effect: logs a view in `entity_views` and credits
    sparks on the user's FIRST encounter with this entity. The
    economy is now part of the graph: discovering a new node
    rewards you. Anonymous viewers (no auth) are tracked by
    session-less view but earn no sparks.
    """
    canonical = _resolve(entity_id)
    if not canonical:
        raise HTTPException(
            status_code=404,
            detail=f"Entity '{entity_id}' not in the Inlay. "
                   f"POST /api/entity/synthesize to forge a new node."
        )
    node = ENTITY_INDEX.get(canonical)
    if not node:
        raise HTTPException(status_code=404, detail="Node missing")

    # V68.65 — Log the view + credit on first-view (server-side, idempotent).
    sparks_credited = 0
    is_first_view = False
    if user:
        try:
            existing = await db.entity_views.find_one({
                "user_id": user["id"], "entity_id": canonical,
            })
            if not existing:
                is_first_view = True
                await db.entity_views.insert_one({
                    "user_id": user["id"],
                    "entity_id": canonical,
                    "first_viewed_at": datetime.now(timezone.utc).isoformat(),
                    "view_count": 1,
                })
                # Credit sparks for graph exploration. 6 sparks per
                # NEW node revealed — matches the chamber-tap economy
                # (≈3 taps' worth) so discovering a node feels like
                # finding a treasure, not a click.
                ENTITY_DISCOVERY_SPARKS = 6
                await db.spark_wallets.update_one(
                    {"user_id": user["id"]},
                    {"$inc": {
                        "sparks": ENTITY_DISCOVERY_SPARKS,
                        "total_earned": ENTITY_DISCOVERY_SPARKS,
                        "entities_discovered": 1,
                    }},
                    upsert=True,
                )
                sparks_credited = ENTITY_DISCOVERY_SPARKS
            else:
                await db.entity_views.update_one(
                    {"user_id": user["id"], "entity_id": canonical},
                    {"$inc": {"view_count": 1},
                     "$set": {"last_viewed_at": datetime.now(timezone.utc).isoformat()}},
                )
        except Exception as e:
            logger.warning(f"entity_views log failed: {e}")

    # Compute graph edges on the fly: same family, shared traditions,
    # any blends_with link from aromatherapy.
    related = set()
    for cid, other in ENTITY_INDEX.items():
        if cid == canonical:
            continue
        if other.get("family") and other["family"] == node.get("family"):
            related.add(cid)
        if set(other.get("traditions", [])) & set(node.get("traditions", [])):
            related.add(cid)
    related |= {b for b in node.get("blends_with", []) if b in ENTITY_INDEX}
    related_list = sorted(list(related))[:12]

    return {
        "id":        node["id"],
        "name":      node["name"],
        "type":      node["type"],
        "latin":     node.get("latin", ""),
        "family":    node.get("family", ""),
        "color":     node.get("color", "#A78BFA"),
        "sources":   node.get("sources", []),
        "silo_data": node.get("silo_data", {}),
        "tradition_views": node.get("tradition_views", {}),
        "traditions":      node.get("traditions", []),
        "related":         related_list,
        # Cross-pollination seed for ContextBus.entityState.
        "context_seed": {
            "activeEntity":     node["id"],
            "name":              node["name"],
            "type":              node["type"],
            "traditions":        node.get("traditions", []),
            "primary_tradition": (node.get("traditions") or [None])[0],
        },
        # V68.65 — Discovery economy.
        "discovery": {
            "is_first_view":    is_first_view,
            "sparks_credited":  sparks_credited,
        },
    }


@router.post("/entity/synthesize")
async def entity_synthesize(
    data: dict = Body(...),
    user=Depends(get_current_user_optional),
):
    """Circuit-breaker LLM gate for off-graph queries.

    The frontend MUST first hit /entity/index, see the term is
    absent, and explicitly ask the user to confirm before calling
    this endpoint. We re-use the existing knowledge_cache collection
    so generated entities persist into the same brain that powers
    /api/knowledge/deep-dive.
    """
    query = (data.get("query") or "").strip()
    if not query or len(query) < 2:
        raise HTTPException(status_code=400, detail="Query too short")
    if len(query) > 80:
        raise HTTPException(status_code=400, detail="Query too long")

    # Already in the Inlay? Just return that.
    canonical = _resolve(query)
    if canonical and canonical in ENTITY_INDEX:
        return {"status": "already_in_inlay", "id": canonical}

    # Already cached as a generated entity?
    cached = await db.entities_generated.find_one({"query_norm": query.lower()}, {"_id": 0})
    if cached:
        return {"status": "cached", "node": cached}

    # Generate via LLM. Schema mirrors the Inlay node.
    prompt = (
        f"You are a master ethnobotanist. The user typed: \"{query}\".\n\n"
        "Treat this as a plant, herb, oil, resin, or fungus name. Return ONLY "
        "valid JSON with these fields:\n"
        '  "name": string,\n'
        '  "latin": string,\n'
        '  "family": string,\n'
        '  "type": "herb" | "oil" | "plant" | "resin" | "fungus",\n'
        '  "properties": [string],\n'
        '  "tradition_views": {\n'
        '     "western":    string,\n'
        '     "ayurveda":   string,\n'
        '     "tcm":        string,\n'
        '     "indigenous": string,\n'
        '     "celtic":     string\n'
        "  },\n"
        '  "caution": string,\n'
        '  "spiritual": string\n'
        "If the term is not a plant/herb/oil, return "
        '{"error": "not a plant"} instead.'
    )
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"entity-synth-{uuid.uuid4()}",
            system_message=(
                "You are a meticulous, multi-tradition ethnobotanist. "
                "You return only valid JSON. You never invent latin names "
                "you are not confident in — leave the field empty instead."
            ),
        )
        chat.with_model("openai", "gpt-5.2")
        raw = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)),
            timeout=35,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Synthesis timed out")
    except Exception as e:
        logger.error(f"entity_synthesize LLM error: {e}")
        raise HTTPException(status_code=502, detail="Synthesis failed")

    import json as _json
    cleaned = (raw or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    try:
        parsed = _json.loads(cleaned)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Synthesis returned non-JSON. Try a different name."
        )
    if parsed.get("error"):
        raise HTTPException(status_code=400, detail=parsed["error"])

    canonical = _slug(parsed.get("name", query))
    node = {
        "id":        canonical,
        "name":      parsed.get("name", query.title()),
        "type":      parsed.get("type", "herb"),
        "latin":     parsed.get("latin", ""),
        "family":    parsed.get("family", ""),
        "color":     "#A78BFA",
        "sources":   ["synthesis"],
        "silo_data": {"synthesis": parsed},
        "tradition_views": {
            tid: {"tradition_id": tid, "tradition_name": tid.title(), "principle": txt}
            for tid, txt in (parsed.get("tradition_views") or {}).items()
            if isinstance(txt, str) and txt.strip()
        },
        "traditions": list((parsed.get("tradition_views") or {}).keys()),
        "related":    [],
        "query_norm": query.lower(),
        "synthesized_at": datetime.now(timezone.utc).isoformat(),
        "synthesized_by": user.get("id") if user else "anon",
    }
    # Persist forever. Next user gets it instant from the cache.
    await db.entities_generated.insert_one({**node})
    node.pop("_id", None)

    # Hot-graft into the live ENTITY_INDEX so subsequent /entity/{id}
    # resolves it without a DB hit. Server restart re-merges from
    # entities_generated below.
    ENTITY_INDEX[canonical] = node
    for alias in _aliases_from_name(node["name"]):
        ALIAS_MAP.setdefault(alias, canonical)

    return {"status": "synthesized", "node": node}


# ─────────────────────────────────────────────────────────────────
# On startup, hot-graft every previously-synthesized entity back
# into the live graph. The Inlay grows over time.
# ─────────────────────────────────────────────────────────────────
async def _rehydrate_synthesized():
    try:
        cursor = db.entities_generated.find({}, {"_id": 0})
        async for node in cursor:
            cid = node.get("id")
            if not cid or cid in ENTITY_INDEX:
                continue
            ENTITY_INDEX[cid] = node
            for alias in _aliases_from_name(node.get("name", "")):
                ALIAS_MAP.setdefault(alias, cid)
        logger.info(
            f"Entity Graph rehydrated synthesized nodes — total: {len(ENTITY_INDEX)}"
        )
    except Exception as e:
        logger.warning(f"entity_graph rehydrate skipped: {e}")


# Schedule the rehydrate on the running event loop. server.py calls
# create_indexes etc. before app start, but our import lands during
# router registration — defer the async work to the next tick.
try:
    loop = asyncio.get_event_loop()
    if loop and loop.is_running():
        loop.create_task(_rehydrate_synthesized())
    else:
        # New loop available; schedule cooperatively.
        asyncio.ensure_future(_rehydrate_synthesized())
except Exception:
    # If no loop yet (cold import), the lifespan startup elsewhere
    # will eventually exercise these collections lazily.
    pass

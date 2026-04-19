"""
pillars.py — V68.13 Seven Classical Pillars API

Maps the user's journey across the 7 Classical Pillars (Wellness, Culinary,
Academy, Oracle, Craft, Community, Sanctuary) to a resonance-state machine:

  • WIREFRAME — the pillar exists in the cosmology but the user hasn't
    visited it (default).
  • BLOOM     — the user has spent *any* immersion time inside a route that
    belongs to this pillar (tracked via lattice_activations / presence_log).
  • OBSIDIAN  — the user has completed at least one Teacher quest whose
    `domain_bridge` matches this pillar (tracked via quest_progress).

This is the single source of truth the frontend consumes to light up the
FractalEngine icosahedrons, the SovereignHUD, and the MiniLattice overlay.
"""
from fastapi import APIRouter, Depends
from deps import db, get_current_user

router = APIRouter()


# ── 7 Classical Pillars ─────────────────────────────────────────────────────
# id  — stable machine key
# label — display name in the cosmos
# color — hex accent used by Fractal Engine icosahedra + HUD tints
# portal — destination SPA route when user "enters" the pillar
# routes — prefix list of routes that count as immersion for BLOOM state
# quest_domains — quest_progress.domain_bridge values that promote OBSIDIAN
CLASSICAL_PILLARS = [
    {
        "id": "wellness",
        "label": "Wellness",
        "tagline": "The Body",
        "color": "#00FFC2",
        "portal": "/breathing",
        "routes": ["/breathing", "/meditation", "/yoga", "/exercises", "/mudras", "/reiki", "/acupressure"],
        "quest_domains": ["wellness", "body", "meditation"],
    },
    {
        "id": "culinary",
        "label": "Culinary",
        "tagline": "Nourishment",
        "color": "#FFD700",
        "portal": "/nourishment",
        "routes": ["/nourishment", "/meal-planning", "/herbology", "/aromatherapy", "/elixirs", "/green-journal"],
        "quest_domains": ["culinary", "nourishment", "nutrition"],
    },
    {
        "id": "academy",
        "label": "Academy",
        "tagline": "Sovereign Software",
        "color": "#A855F7",
        "portal": "/learn",
        "routes": ["/learn", "/classes", "/certifications", "/teachings", "/tutorial", "/fractal-engine"],
        "quest_domains": ["academy", "learning", "software"],
    },
    {
        "id": "oracle",
        "label": "Oracle",
        "tagline": "Ancient Philosophy",
        "color": "#C084FC",
        "portal": "/oracle",
        "routes": ["/oracle", "/cardology", "/numerology", "/akashic-records", "/dreams", "/mayan",
                   "/cosmic-calendar", "/forecasts", "/star-chart", "/cosmic-profile"],
        "quest_domains": ["oracle", "divination", "wisdom"],
    },
    {
        "id": "craft",
        "label": "Craft",
        "tagline": "Sacred Geometry",
        "color": "#FB923C",
        "portal": "/create",
        "routes": ["/create", "/yantra", "/tantra", "/zen-garden", "/avatar", "/media-library",
                   "/creation-stories", "/soundscapes"],
        "quest_domains": ["craft", "creation", "geometry"],
    },
    {
        "id": "community",
        "label": "Community",
        "tagline": "Trade & Circle",
        "color": "#22C55E",
        "portal": "/trade-circle",
        "routes": ["/trade-circle", "/community", "/friends", "/blessings", "/challenges", "/music-lounge"],
        "quest_domains": ["community", "trade", "social"],
    },
    {
        "id": "sanctuary",
        "label": "Sanctuary",
        "tagline": "Digital Sovereignty",
        "color": "#D4AF37",
        "portal": "/vr",
        "routes": ["/vr", "/vr/celestial-dome", "/sovereign-hub", "/daily-ritual", "/rituals",
                   "/profile", "/settings", "/wisdom-journal", "/growth-timeline", "/soul-reports"],
        "quest_domains": ["sanctuary", "ritual", "sovereignty"],
    },
]

PILLAR_BY_ID = {p["id"]: p for p in CLASSICAL_PILLARS}


def _route_to_pillar(path: str) -> str | None:
    """Resolve a route string to the pillar id that owns it (longest prefix wins)."""
    if not path:
        return None
    best = None
    best_len = 0
    for p in CLASSICAL_PILLARS:
        for r in p["routes"]:
            if path == r or path.startswith(r + "/"):
                if len(r) > best_len:
                    best_len = len(r)
                    best = p["id"]
    return best


@router.get("/pillars")
async def list_pillars():
    """Public cosmology — all 7 pillars with their portal metadata."""
    return {
        "pillars": [
            {k: v for k, v in p.items() if k not in ("quest_domains",)}
            for p in CLASSICAL_PILLARS
        ]
    }


@router.get("/pillars/resonance")
async def get_pillar_resonance(user=Depends(get_current_user)):
    """
    Returns the user's resonance state for each of the 7 pillars.
    {
      "pillars": [
        { "id": "wellness", "label": "Wellness", "state": "BLOOM",
          "immersion_minutes": 42, "teacher_quests_completed": 0 }
        ...
      ],
      "aggregate": { "wireframe": 2, "bloom": 4, "obsidian": 1 }
    }
    """
    # Fetch user activations (immersion footprint)
    activations = await db.lattice_activations.find(
        {"user_id": user["id"]},
        {"_id": 0, "path": 1, "activation_count": 1},
    ).to_list(length=500)

    # Fetch completed quests grouped by domain_bridge
    progress = await db.quest_progress.find_one(
        {"user_id": user["id"]},
        {"_id": 0, "quests": 1},
    ) or {}
    completed_domains: dict[str, int] = {}
    for qid, qp in (progress.get("quests") or {}).items():
        if qp.get("completed"):
            try:
                from routes.quests import QUESTS
                q = next((x for x in QUESTS if x["id"] == qid), None)
                if q and q.get("domain_bridge"):
                    # domain_bridge may be a list OR a string — normalize to a set of lowercase tokens
                    bridges = q["domain_bridge"] if isinstance(q["domain_bridge"], (list, tuple)) else [q["domain_bridge"]]
                    for b in bridges:
                        d = str(b).lower()
                        completed_domains[d] = completed_domains.get(d, 0) + 1
            except Exception:
                pass

    # Count immersion per pillar
    immersion_by_pillar: dict[str, int] = {}
    for a in activations:
        pid = _route_to_pillar(a.get("path") or "")
        if pid:
            immersion_by_pillar[pid] = immersion_by_pillar.get(pid, 0) + int(a.get("activation_count") or 1)

    # Build per-pillar resonance state
    out = []
    agg = {"WIREFRAME": 0, "BLOOM": 0, "OBSIDIAN": 0}
    for p in CLASSICAL_PILLARS:
        immersion = immersion_by_pillar.get(p["id"], 0)
        # Substring match so "science & physics" can light up multiple pillars
        quest_domains = [d.lower() for d in p["quest_domains"]]
        teacher_count = 0
        for bridge, count in completed_domains.items():
            if any(tok in bridge for tok in quest_domains):
                teacher_count += count
        if teacher_count > 0:
            state = "OBSIDIAN"
        elif immersion > 0:
            state = "BLOOM"
        else:
            state = "WIREFRAME"
        agg[state] += 1
        out.append({
            "id": p["id"],
            "label": p["label"],
            "tagline": p["tagline"],
            "color": p["color"],
            "portal": p["portal"],
            "state": state,
            "immersion_count": immersion,
            "teacher_quests_completed": teacher_count,
        })

    return {
        "pillars": out,
        "aggregate": {k.lower(): v for k, v in agg.items()},
    }

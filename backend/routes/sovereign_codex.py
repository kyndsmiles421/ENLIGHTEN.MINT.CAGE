from fastapi import APIRouter, Depends, Query
from deps import db, get_current_user

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SOVEREIGN CODEX — Layered Help System
#  Nano-Guides + Master Codex + Progressive Disclosure by Tier
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]

CODEX_ENTRIES = [
    # ── OBSERVER: Navigation Basics ──
    {
        "id": "nav-hub", "section": "navigation", "tier": "observer",
        "title": "The Orbital Hub",
        "summary": "Your spatial command center. Drag to rotate the satellite ring.",
        "body": "The Hub is a living gravity field. Each satellite node represents a system tool. Drag the ring to rotate; tap a satellite to enter its domain. The central Abyss expands to reveal deeper systems when activated.",
        "tags": ["hub", "navigation", "satellites", "abyss"],
    },
    {
        "id": "nav-garden", "section": "botany", "tier": "observer",
        "title": "Your Botanical Garden",
        "summary": "Grow plants to influence your element balance and mastery score.",
        "body": "Add plants from the Codex to your garden (max 24). Each plant has a TCM element (Wood/Fire/Earth/Metal/Water) and nature (Hot/Warm/Neutral/Cool/Cold). Nurture daily to advance growth stages: Seed → Sprout → Sapling → Mature → Ancient → Transcendent. Your garden composition directly affects your Mastery Tier balance score.",
        "tags": ["garden", "plants", "TCM", "elements", "nurture"],
    },
    {
        "id": "nav-elements", "section": "elements", "tier": "observer",
        "title": "The Five Elements",
        "summary": "Wood, Fire, Earth, Metal, Water — the foundation of all energy.",
        "body": "Each element has a Solfeggio frequency: Wood=396Hz (Liberation), Fire=528Hz (Transformation), Earth=639Hz (Connection), Metal=741Hz (Expression), Water=852Hz (Intuition). Elements interact through two cycles: Generating (Sheng) where each creates the next, and Controlling (Ke) where each restrains another.",
        "tags": ["elements", "solfeggio", "frequency", "sheng", "ke"],
    },
    {
        "id": "nav-trade", "section": "trade", "tier": "observer",
        "title": "The Trade Circle",
        "summary": "Exchange botanical goods, frequency recipes, and wellness services.",
        "body": "List items for trade in categories: Botanicals, Frequency Recipes, Readings, Healing, Crafted Items, and more. Each listing has a gravity mass that determines its visual weight in the marketplace grid. Heavier items sink deeper — creating a natural hierarchy of value.",
        "tags": ["trade", "marketplace", "listing", "gravity"],
    },

    # ── SYNTHESIZER: Intermediate Mechanics ──
    {
        "id": "mech-gravity", "section": "mechanics", "tier": "synthesizer",
        "title": "Gravity Mass Formula",
        "summary": "How every object's weight is calculated in the Spatial OS.",
        "body": "Mass = Base(60) + Element Weight + Nature Weight + Meridian Bonus + Rarity Bonus.\nElement weights: Wood=10, Fire=15, Earth=12, Metal=8, Water=14.\nNature weights: Hot=15, Warm=10, Neutral=5, Cool=10, Cold=15.\nMeridian bonus: count × 3. Rarity: common=0, uncommon=5, rare=10, legendary=20.",
        "tags": ["gravity", "mass", "formula", "calculation"],
    },
    {
        "id": "mech-balance", "section": "mastery", "tier": "synthesizer",
        "title": "Balance Score Algorithm",
        "summary": "How your Mastery Tier is calculated from 4 weighted components.",
        "body": "balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%).\nDiversity: How many of the 5 elements you've interacted with.\nEquilibrium: How balanced your garden is (penalty for single-element dominance).\nConsistency: Streak of daily nurture actions.\nExploration: Unique species encountered + archives unlocked.\nTiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100).",
        "tags": ["mastery", "tier", "balance", "score", "algorithm"],
    },
    {
        "id": "mech-derivatives", "section": "mathematics", "tier": "synthesizer",
        "title": "Garden Derivatives (dBalance/dt)",
        "summary": "Real-time rate-of-change analysis for your garden's energy state.",
        "body": "The derivative dE/dt tells you whether each element's energy is rising or falling at this moment. Positive derivatives = growing energy; negative = decaying. The system uses numerical differentiation on the element ODE trajectory to compute instantaneous rates. Monitor stability: 'stable' = total rate < 0.1; 'shifting' = < 0.3; 'volatile' = > 0.3.",
        "tags": ["calculus", "derivative", "rate", "change", "garden"],
    },
    {
        "id": "mech-matrix", "section": "mathematics", "tier": "synthesizer",
        "title": "Matrix Transforms (Star Chart)",
        "summary": "4×4 homogeneous rotation matrices for precise camera movement.",
        "body": "Star Chart navigation uses Rodrigues rotation formula in homogeneous coordinates. Given source and target RA/Dec positions, the system computes the rotation axis (cross product), angle (arc cosine of dot product), and interpolates using smoothstep easing. Each keyframe is a 4×4 matrix applied to the camera's position vector.",
        "tags": ["matrix", "rotation", "star chart", "rodrigues", "linear algebra"],
    },

    # ── ARCHIVIST: Differential Equations ──
    {
        "id": "math-ode", "section": "mathematics", "tier": "archivist",
        "title": "Element Cycle ODEs",
        "summary": "Coupled ordinary differential equations model 24-hour energy flows.",
        "body": "The Five Elements form a coupled ODE system: dE_i/dt = generation - control - decay + circadian + garden_boost.\nGeneration: Energy flows from the Sheng (generating) element.\nControl: Energy is suppressed by the Ke (controlling) element.\nDecay: Natural exponential decay (λ=0.02/hr).\nCircadian: TCM organ clock Gaussian modulation centered on each element's peak hour.\nSolved using 4th-order Runge-Kutta (RK4) integration with dt=0.25hr.",
        "tags": ["ODE", "differential", "equations", "runge-kutta", "RK4", "sheng", "ke"],
    },
    {
        "id": "math-circadian", "section": "mathematics", "tier": "archivist",
        "title": "TCM Organ Clock Model",
        "summary": "Gaussian circadian modulation based on Traditional Chinese Medicine.",
        "body": "Each element's energy peaks at a specific time aligned with TCM organ theory: Wood/Liver (01-03), Metal/Lung (03-05), Earth/Spleen (09-11), Fire/Heart (11-13), Water/Kidney (17-19). The modulation follows f(t) = exp(-(t-peak)²/18), creating smooth 24-hour cycles that affect generation and control rates.",
        "tags": ["circadian", "organ", "clock", "TCM", "gaussian"],
    },

    # ── NAVIGATOR: Advanced Analysis ──
    {
        "id": "adv-resonance", "section": "resonance", "tier": "navigator",
        "title": "Resonance Compatibility Engine",
        "summary": "Predictive synergy calculations between garden plants and elements.",
        "body": "When you select an element on the Five Elements Wheel, the engine calculates synergy scores for each garden plant: harmony (same element, +15), generating (+20), generated_by (+10), controlled (-15), controlling (-10), neutral (+5). Stage multipliers range from Seed(0.5×) to Transcendent(1.5×). The net flow determines the energy forecast: surge/favorable/balanced/strained/depleted.",
        "tags": ["resonance", "synergy", "prediction", "forecast"],
    },

    # ── SOVEREIGN: Chaos Theory & Topology ──
    {
        "id": "chaos-lorenz", "section": "mathematics", "tier": "sovereign",
        "title": "Lorenz Attractor (Chaos Theory)",
        "summary": "Butterfly Effect predictions for frequency recipe sensitivity.",
        "body": "The Lorenz system (σ=10, ρ=28, β=8/3) models chaotic sensitivity in frequency recipes. A frequency value maps to initial conditions (x₀, y₀, z₀) via modular arithmetic with golden ratio and Euler number scaling. A tiny perturbation (ε=0.01) creates a parallel trajectory. The divergence rate yields a Lyapunov exponent estimate: λ > 5 = extreme sensitivity, λ > 2 = high, λ > 0.5 = moderate, else stable.",
        "tags": ["chaos", "lorenz", "butterfly", "lyapunov", "attractor", "sensitivity"],
    },
    {
        "id": "chaos-topology", "section": "mathematics", "tier": "sovereign",
        "title": "Topology-Aware Node Relationships",
        "summary": "Maintaining node connections during map warps and deformations.",
        "body": "During Star Chart warps and gravity field deformations, the topology of node connections must be preserved. The system uses homeomorphic mapping: as the underlying space is continuously deformed, adjacency relationships (which nodes are 'neighbors') remain invariant. This is enforced by maintaining a connectivity graph separate from spatial coordinates.",
        "tags": ["topology", "homeomorphic", "warp", "graph", "invariant"],
    },
    {
        "id": "sovereign-hexagram", "section": "mechanics", "tier": "sovereign",
        "title": "I Ching Logic Gates (Blueprint)",
        "summary": "64 hexagrams as Boolean state-machine transitions for progressive disclosure.",
        "body": "Each hexagram = 6 binary inputs: [garden_balance ≥ threshold, mastery_tier ≥ N, element_X_explored, archive_Y_unlocked, frequency_recipe_created, trade_completed]. The combination maps to one of 64 hexagrams. Changing Lines (Yao): when a condition is about to flip, the corresponding line 'flickers' between yin and yang. Hexagram 1 (乾 Qian) = [1,1,1,1,1,1] → unlocks Sovereign-tier content.",
        "tags": ["hexagram", "iching", "logic", "gate", "boolean", "state-machine"],
    },
]

# ── Nano-Guide Quick Starts ──
NANO_GUIDES = {
    "five-elements-wheel": {
        "title": "Five Elements Wheel",
        "tips": [
            "Click an element node to filter plants and see resonance synergies",
            "Hover near nodes — they pulse larger as your cursor approaches",
            "The garden balance bar shows your element distribution at a glance",
        ],
    },
    "trade-circle": {
        "title": "Trade Circle",
        "tips": [
            "Items have gravity mass — heavier listings sink lower in the grid",
            "Export Suanpan recipes directly with one click (zero manual entry)",
            "Botanical listings auto-derive element and TCM properties from frequency",
        ],
    },
    "mission-control": {
        "title": "Mission Control",
        "tips": [
            "Access Profile, Dashboard, Mastery Tiers, and Analytics",
            "Your mastery tier determines what content and math tools unlock",
            "Spheres pulse independently — they're always alive even during loading",
        ],
    },
    "star-chart": {
        "title": "Star Chart",
        "tips": [
            "Navigate constellations with cinematic Dolly-Zoom transitions",
            "Camera uses 4×4 matrix rotations for precise movement",
            "Coordinates are validated with isFinite() to prevent render freezes",
        ],
    },
    "suanpan-mixer": {
        "title": "Suanpan Mixer",
        "tips": [
            "Slide abacus beads to compose frequencies in real-time",
            "The color shifts based on your frequency's element alignment",
            "Export recipes to the Trade Circle with auto-derived TCM metadata",
        ],
    },
    "botany": {
        "title": "Botanical Codex",
        "tips": [
            "12 plants with full TCM energetic profiles and gravity mass",
            "Add plants to your garden to influence your Mastery Balance Score",
            "AI Identify: describe any plant to get its TCM profile instantly",
        ],
    },
}


@router.get("/codex/entries")
async def get_codex_entries(
    section: str = Query(None),
    search: str = Query(None),
    user=Depends(get_current_user),
):
    """Get Sovereign Codex entries filtered by mastery tier and optional section/search."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    entries = []
    for entry in CODEX_ENTRIES:
        entry_tier_idx = TIERS.index(entry["tier"]) if entry["tier"] in TIERS else 0
        unlocked = tier_idx >= entry_tier_idx

        if section and entry["section"] != section:
            continue

        if search:
            q = search.lower()
            match = (
                q in entry["title"].lower() or
                q in entry["summary"].lower() or
                any(q in t for t in entry["tags"])
            )
            if not match:
                continue

        e = {**entry}
        if not unlocked:
            e["locked"] = True
            e["body"] = f"Unlocks at {entry['tier'].title()} tier"
        else:
            e["locked"] = False

        entries.append(e)

    sections = list(set(e["section"] for e in CODEX_ENTRIES))

    return {
        "entries": entries,
        "total": len(entries),
        "tier": tier_name,
        "sections": sorted(sections),
    }


@router.get("/codex/nano-guide/{guide_id}")
async def get_nano_guide(guide_id: str, user=Depends(get_current_user)):
    """Get a Nano-Guide quick start for a specific section."""
    guide = NANO_GUIDES.get(guide_id)
    if not guide:
        return {"title": "Unknown", "tips": ["Explore the Sovereign Codex for guidance"]}
    return guide

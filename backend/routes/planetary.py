"""
Planetary Stratigraphy — 4-Layer Depth System.
Treats planets as multi-layered instances with distinct physics, frequencies,
and Jungian psychological correspondences per layer.

Layers:
  1. Crust (Surface)   — Standard gameplay, climate-based, 432 Hz
  2. Mantle (Transition) — Heavy pressure, sacred geometry, 396 Hz
  3. Outer Core (Plasma Sea) — Fluid gravity, quantum tunneling zone, 285 Hz
  4. Hollow Earth (Inner Core) — Inverted gravity, central sun, 174 Hz
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.consciousness import level_from_consciousness_xp
import uuid

router = APIRouter(prefix="/planetary")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LAYER DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANETARY_LAYERS = [
    {
        "id": "crust",
        "name": "The Crust",
        "subtitle": "Surface Level",
        "depth_index": 0,
        "frequency_hz": 432,
        "frequency_label": "Verdi's A — Universal Harmony",
        "element": "earth",
        "color": "#D97706",
        "glow": "rgba(217, 119, 6, 0.25)",
        "archetype": "persona",
        "archetype_name": "The Persona",
        "archetype_desc": "The mask we wear. Surface interactions follow familiar patterns.",
        "physics": {
            "gravity": 1.0,
            "pressure": 1.0,
            "visibility": 1.0,
            "haptic_profile": "light_vibration",
        },
        "description": "The standard experience. Interact with the environment based on the planet's primary climate and the current star chart alignment.",
        "biome": "Crystalline plains, mineral veins, open sky",
        "consciousness_required": 1,
        "unlocked_by_default": True,
    },
    {
        "id": "mantle",
        "name": "The Mantle",
        "subtitle": "Transition Zone",
        "depth_index": 1,
        "frequency_hz": 396,
        "frequency_label": "Liberating Guilt & Fear",
        "element": "fire",
        "color": "#EF4444",
        "glow": "rgba(239, 68, 68, 0.25)",
        "archetype": "shadow",
        "archetype_name": "The Shadow",
        "archetype_desc": "The unacknowledged self. Confront what you've hidden to stabilize your descent.",
        "physics": {
            "gravity": 1.8,
            "pressure": 3.5,
            "visibility": 0.6,
            "haptic_profile": "heavy_pulse",
        },
        "description": "A high-pressure zone where reality feels heavy. Use Sacred Geometry to stabilize your path through shifting magma and crystalline structures.",
        "biome": "Molten rivers, obsidian chambers, pressure crystals",
        "consciousness_required": 2,
        "unlocked_by_default": False,
    },
    {
        "id": "outer_core",
        "name": "The Outer Core",
        "subtitle": "Plasma Sea",
        "depth_index": 2,
        "frequency_hz": 285,
        "frequency_label": "Quantum Field Resonance",
        "element": "water",
        "color": "#8B5CF6",
        "glow": "rgba(139, 92, 246, 0.3)",
        "archetype": "anima",
        "archetype_name": "The Anima / Animus",
        "archetype_desc": "The complementary force. Entanglement with another is required to navigate this fluid realm.",
        "physics": {
            "gravity": 0.3,
            "pressure": 8.0,
            "visibility": 0.4,
            "haptic_profile": "erratic_burst",
        },
        "description": "A fluid, energetic layer where gravity is inconsistent. Quantum Tunneling becomes the primary mode of movement.",
        "biome": "Plasma currents, floating islands, energy vortices",
        "consciousness_required": 3,
        "unlocked_by_default": False,
    },
    {
        "id": "hollow_earth",
        "name": "The Hollow Earth",
        "subtitle": "Inner Core / Collective Unconscious",
        "depth_index": 3,
        "frequency_hz": 174,
        "frequency_label": "Foundation of Consciousness",
        "element": "ether",
        "color": "#FBBF24",
        "glow": "rgba(251, 191, 36, 0.35)",
        "archetype": "self",
        "archetype_name": "The Self",
        "archetype_desc": "The integration of all parts. The Central Sun illuminates wholeness.",
        "physics": {
            "gravity": -1.0,
            "pressure": 12.0,
            "visibility": 0.8,
            "haptic_profile": "quantum_erratic",
        },
        "description": "The hidden inverted ecosystem. A miniature singularity — the Central Sun — dictates the rhythm. Walking on the inner shell provides a jarring perspective shift.",
        "biome": "Inverted forests, Central Sun, crystalline caverns, ancient libraries",
        "consciousness_required": 4,
        "unlocked_by_default": False,
    },
]

PSYCHE_STATES = {
    "persona": {"name": "The Persona", "element": "earth", "color": "#D97706", "depth": "crust"},
    "shadow": {"name": "The Shadow", "element": "fire", "color": "#EF4444", "depth": "mantle"},
    "anima": {"name": "The Anima / Animus", "element": "water", "color": "#8B5CF6", "depth": "outer_core"},
    "self": {"name": "The Self", "element": "ether", "color": "#FBBF24", "depth": "hollow_earth"},
}

LAYER_IDS = [l["id"] for l in PLANETARY_LAYERS]


def _layer_by_id(lid):
    for l in PLANETARY_LAYERS:
        return l if l["id"] == lid else None
    return None


def _get_layer(lid):
    for l in PLANETARY_LAYERS:
        if l["id"] == lid:
            return l
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/layers")
async def get_layers(user=Depends(get_current_user)):
    """Return all planetary layers with user's unlock status."""
    uid = user["id"]
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current_layer = (depth_doc or {}).get("current_layer", "crust")
    unlocked = (depth_doc or {}).get("unlocked_layers", ["crust"])
    psyche = (depth_doc or {}).get("psyche_state", "persona")
    total_descents = (depth_doc or {}).get("total_descents", 0)

    layers = []
    for l in PLANETARY_LAYERS:
        accessible = l["id"] in unlocked or l["unlocked_by_default"]
        meets_consciousness = level >= l["consciousness_required"]
        layers.append({
            **l,
            "accessible": accessible and meets_consciousness,
            "unlocked": l["id"] in unlocked,
            "meets_consciousness": meets_consciousness,
            "is_current": l["id"] == current_layer,
        })

    return {
        "layers": layers,
        "current_layer": current_layer,
        "psyche_state": psyche,
        "psyche_info": PSYCHE_STATES.get(psyche, PSYCHE_STATES["persona"]),
        "consciousness_level": level,
        "total_descents": total_descents,
    }


@router.post("/descend")
async def descend_to_layer(
    target_layer: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """Descend (or ascend) to a target planetary layer."""
    uid = user["id"]
    layer = _get_layer(target_layer)
    if not layer:
        raise HTTPException(400, "Unknown layer")

    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    if level < layer["consciousness_required"]:
        raise HTTPException(403, f"Requires consciousness level {layer['consciousness_required']}")

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    unlocked = (depth_doc or {}).get("unlocked_layers", ["crust"])
    current = (depth_doc or {}).get("current_layer", "crust")

    if target_layer not in unlocked and not layer["unlocked_by_default"]:
        # Auto-unlock if consciousness level is met
        unlocked.append(target_layer)

    now = datetime.now(timezone.utc).isoformat()
    new_psyche = layer["archetype"]

    # XP reward for first descent to a new layer
    xp_reward = 0
    descent_history = (depth_doc or {}).get("descent_history", [])
    visited_set = {d["layer"] for d in descent_history}
    if target_layer not in visited_set:
        xp_reward = (layer["depth_index"] + 1) * 50

    descent_entry = {
        "id": str(uuid.uuid4())[:8],
        "from_layer": current,
        "layer": target_layer,
        "timestamp": now,
        "frequency_hz": layer["frequency_hz"],
        "archetype_encountered": layer["archetype"],
    }

    await db.planetary_depth.update_one(
        {"user_id": uid},
        {
            "$set": {
                "user_id": uid,
                "current_layer": target_layer,
                "psyche_state": new_psyche,
                "last_descent": now,
                "unlocked_layers": list(set(unlocked)),
            },
            "$push": {"descent_history": descent_entry},
            "$inc": {"total_descents": 1},
        },
        upsert=True,
    )

    # Grant XP for first visits
    if xp_reward > 0:
        await db.users.update_one(
            {"id": uid},
            {
                "$inc": {"consciousness.xp": xp_reward},
                "$push": {
                    "consciousness.activity_log": {
                        "type": "planetary_descent",
                        "xp": xp_reward,
                        "layer": target_layer,
                        "timestamp": now,
                    }
                },
            },
        )

    return {
        "success": True,
        "current_layer": target_layer,
        "layer_info": layer,
        "psyche_state": new_psyche,
        "psyche_info": PSYCHE_STATES[new_psyche],
        "xp_reward": xp_reward,
        "transition": {
            "from_layer": current,
            "to_layer": target_layer,
            "from_freq": _get_layer(current)["frequency_hz"] if _get_layer(current) else 432,
            "to_freq": layer["frequency_hz"],
            "gravity_shift": layer["physics"]["gravity"],
            "haptic_profile": layer["physics"]["haptic_profile"],
        },
    }


@router.get("/depth-status")
async def get_depth_status(user=Depends(get_current_user)):
    """Get the user's current depth and psyche state."""
    uid = user["id"]
    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})

    if not depth_doc:
        return {
            "current_layer": "crust",
            "psyche_state": "persona",
            "psyche_info": PSYCHE_STATES["persona"],
            "unlocked_layers": ["crust"],
            "total_descents": 0,
            "descent_history": [],
        }

    return {
        "current_layer": depth_doc.get("current_layer", "crust"),
        "psyche_state": depth_doc.get("psyche_state", "persona"),
        "psyche_info": PSYCHE_STATES.get(depth_doc.get("psyche_state", "persona"), PSYCHE_STATES["persona"]),
        "unlocked_layers": depth_doc.get("unlocked_layers", ["crust"]),
        "total_descents": depth_doc.get("total_descents", 0),
        "descent_history": (depth_doc.get("descent_history", []))[-10:],
    }


@router.get("/frequency-map")
async def get_frequency_map():
    """Return the frequency-to-depth mapping for the synthesis engine."""
    return {
        "frequency_map": [
            {
                "layer": l["id"],
                "name": l["name"],
                "frequency_hz": l["frequency_hz"],
                "frequency_label": l["frequency_label"],
                "element": l["element"],
                "color": l["color"],
                "haptic_profile": l["physics"]["haptic_profile"],
                "gravity": l["physics"]["gravity"],
            }
            for l in PLANETARY_LAYERS
        ],
        "schumann_base": 7.83,
        "depth_scaling_note": "Frequency decreases with depth. Surface=432Hz, Inner Core=174Hz. The Schumann Resonance shifts proportionally.",
    }

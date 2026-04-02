from fastapi import APIRouter, HTTPException, Depends, Body, Query
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MIXER SUBSCRIPTION TIERS — Separate from Mastery
#  Discovery (Free) → Resonance (Pro) → Sovereign
#  Controls: layer cap, AI credits, rendering, library
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MIXER_TIERS = {
    "discovery": {
        "name": "Discovery",
        "label": "The Cold Path",
        "price_monthly": 0,
        "layer_cap": 3,
        "ai_credits_monthly": 5,
        "ai_gen_type": "simple",
        "stock_library": "basic_tones",
        "stock_label": "Basic Tones",
        "rendering": "standard_stereo",
        "rendering_label": "Standard Stereo",
        "nested_projects": False,
        "keyframe_automation": False,
        "materialization_delay": 20,
        "shadow_tracks": True,
        "color": "#94A3B8",
    },
    "resonance": {
        "name": "Resonance",
        "label": "The Warm Path",
        "price_monthly": 14.99,
        "layer_cap": 10,
        "ai_credits_monthly": 100,
        "ai_gen_type": "deep",
        "stock_library": "full_effects",
        "stock_label": "3,000+ Sound Effects",
        "rendering": "hd_lossless",
        "rendering_label": "High-Definition Lossless",
        "nested_projects": False,
        "keyframe_automation": True,
        "materialization_delay": 3,
        "shadow_tracks": True,
        "color": "#C084FC",
    },
    "sovereign": {
        "name": "Sovereign",
        "label": "The Hot Path",
        "price_monthly": 49.99,
        "layer_cap": -1,
        "ai_credits_monthly": 200,
        "ai_gen_type": "deep_npu",
        "stock_library": "full_phonic",
        "stock_label": "Full Getty/Shutterstock Phonic",
        "rendering": "ultra_lossless_spatial",
        "rendering_label": "Ultra-Lossless / Atmos Spatial",
        "nested_projects": True,
        "keyframe_automation": True,
        "materialization_delay": 0,
        "shadow_tracks": False,
        "color": "#EAB308",
    },
}

TIER_ORDER = ["discovery", "resonance", "sovereign"]

# Comparison table rows for frontend display
TIER_COMPARISON = [
    {"feature": "Layer Capacity", "discovery": "3 Static Tracks", "resonance": "10 Tracks + Keyframes", "sovereign": "Unlimited + Nested Projects"},
    {"feature": "AI Credits", "discovery": "5 / Month (Simple Gen)", "resonance": "100 / Month (Deep Gen)", "sovereign": "200+ Credits + NPU Priority"},
    {"feature": "Stock Library", "discovery": "Basic Tones", "resonance": "3,000+ Sound Effects", "sovereign": "Full Getty/Shutterstock Phonic"},
    {"feature": "Rendering", "discovery": "Standard Stereo", "resonance": "High-Definition Lossless", "sovereign": "Ultra-Lossless / Atmos Spatial"},
    {"feature": "Materialization", "discovery": "15-30s Sacred Assembly", "resonance": "2-3s Stabilization", "sovereign": "Instant (GPU Edge)"},
    {"feature": "Nested Projects", "discovery": "No", "resonance": "No", "sovereign": "Unlimited"},
    {"feature": "Speed Bonuses", "discovery": "None", "resonance": "Standard", "sovereign": "NPU Priority + Atomic"},
]


@router.get("/mixer/subscription")
async def get_mixer_subscription(user=Depends(get_current_user)):
    """Get user's current mixer subscription status."""
    user_id = user["id"]
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})

    if not sub:
        tier_key = "discovery"
        sub = {
            "user_id": user_id,
            "tier": tier_key,
            "ai_credits_remaining": MIXER_TIERS[tier_key]["ai_credits_monthly"],
            "speed_bonus_pct": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.mixer_subscriptions.insert_one({**sub})
        sub.pop("_id", None)

    tier_key = sub.get("tier", "discovery")
    tier_config = MIXER_TIERS.get(tier_key, MIXER_TIERS["discovery"])

    return {
        "tier": tier_key,
        "tier_config": tier_config,
        "ai_credits_remaining": sub.get("ai_credits_remaining", tier_config["ai_credits_monthly"]),
        "speed_bonus_pct": sub.get("speed_bonus_pct", 0),
        "comparison": TIER_COMPARISON,
        "all_tiers": {k: {"name": v["name"], "label": v["label"], "price_monthly": v["price_monthly"], "color": v["color"]} for k, v in MIXER_TIERS.items()},
    }


@router.post("/mixer/subscription/upgrade")
async def upgrade_mixer_subscription(data: dict = Body(...), user=Depends(get_current_user)):
    """Upgrade mixer subscription tier. Atomic — effects are instant."""
    target_tier = data.get("tier", "")
    user_id = user["id"]

    if target_tier not in MIXER_TIERS:
        raise HTTPException(status_code=400, detail="Invalid tier")

    current = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    current_tier = current.get("tier", "discovery") if current else "discovery"

    current_idx = TIER_ORDER.index(current_tier)
    target_idx = TIER_ORDER.index(target_tier)

    if target_idx <= current_idx:
        raise HTTPException(status_code=400, detail="Can only upgrade to a higher tier")

    new_config = MIXER_TIERS[target_tier]

    await db.mixer_subscriptions.update_one(
        {"user_id": user_id},
        {"$set": {
            "tier": target_tier,
            "ai_credits_remaining": new_config["ai_credits_monthly"],
            "upgraded_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )

    await create_activity(user_id, "mixer_upgrade", f"Upgraded to {new_config['name']} tier")

    return {
        "tier": target_tier,
        "tier_config": new_config,
        "message": f"Atomic upgrade complete. {new_config['name']} tier active — latency throttle lifted.",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MULTI-TRACK PROJECT SYSTEM
#  Save/load/list track configurations
#  Each project = list of tracks with source, volume,
#  mute/solo, start time, duration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRACK_TYPES = ["phonic_tone", "mantra", "ambience", "visual", "suanpan", "generator", "custom"]


@router.post("/mixer/projects")
async def save_project(data: dict = Body(...), user=Depends(get_current_user)):
    """Save a multi-track mixer project."""
    user_id = user["id"]
    name = data.get("name", "").strip()
    tracks = data.get("tracks", [])

    if not name:
        raise HTTPException(status_code=400, detail="Project name required")

    # Enforce layer cap
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    tier_config = MIXER_TIERS.get(tier_key, MIXER_TIERS["discovery"])
    layer_cap = tier_config["layer_cap"]

    if layer_cap > 0 and len(tracks) > layer_cap:
        raise HTTPException(
            status_code=403,
            detail=f"Layer cap reached. {tier_config['name']} tier allows {layer_cap} tracks. Upgrade for more."
        )

    # Check for existing project with same name — update it
    existing = await db.mixer_projects.find_one(
        {"user_id": user_id, "name": name}
    )

    sanitized_tracks = []
    for i, t in enumerate(tracks[:50]):
        sanitized_tracks.append({
            "index": i,
            "type": t.get("type", "custom") if t.get("type") in TRACK_TYPES else "custom",
            "source_id": t.get("source_id", ""),
            "source_label": t.get("source_label", f"Track {i + 1}"),
            "volume": max(0, min(1, t.get("volume", 0.8))),
            "muted": bool(t.get("muted", False)),
            "solo": bool(t.get("solo", False)),
            "start_time": max(0, t.get("start_time", 0)),
            "duration": max(0, t.get("duration", 60)),
            "frequency": t.get("frequency"),
            "color": t.get("color", "#94A3B8"),
            "locked": bool(t.get("locked", False)),
        })

    if existing:
        await db.mixer_projects.update_one(
            {"user_id": user_id, "name": name},
            {"$set": {
                "tracks": sanitized_tracks,
                "track_count": len(sanitized_tracks),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "tier_at_save": tier_key,
            }}
        )
        return {"status": "updated", "project_id": existing.get("id"), "track_count": len(sanitized_tracks)}

    project = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": name,
        "tracks": sanitized_tracks,
        "track_count": len(sanitized_tracks),
        "tier_at_save": tier_key,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.mixer_projects.insert_one(project)
    project.pop("_id", None)
    await create_activity(user_id, "mixer_project", f"Saved project: {name}")

    return {"status": "created", "project_id": project["id"], "track_count": len(sanitized_tracks)}


@router.get("/mixer/projects")
async def list_projects(user=Depends(get_current_user)):
    """List user's mixer projects."""
    projects = await db.mixer_projects.find(
        {"user_id": user["id"]},
        {"_id": 0, "tracks": 0}
    ).sort("updated_at", -1).to_list(50)

    return {"projects": projects}


@router.get("/mixer/projects/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    """Load a specific mixer project with all tracks."""
    project = await db.mixer_projects.find_one(
        {"id": project_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/mixer/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    """Delete a mixer project."""
    result = await db.mixer_projects.delete_one(
        {"id": project_id, "user_id": user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "deleted"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TRACK SOURCE LIBRARY — Available sources for tracks
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STOCK_SOURCES = [
    # Basic tones (Discovery)
    {"id": "tone-om", "label": "OM (136.1Hz)", "type": "phonic_tone", "frequency": 136.1, "tier": "discovery", "color": "#60A5FA"},
    {"id": "tone-ut", "label": "UT (174Hz)", "type": "phonic_tone", "frequency": 174, "tier": "discovery", "color": "#2DD4BF"},
    {"id": "tone-mi", "label": "MI (528Hz)", "type": "phonic_tone", "frequency": 528, "tier": "discovery", "color": "#22C55E"},
    {"id": "tone-schumann", "label": "Schumann (7.83Hz)", "type": "phonic_tone", "frequency": 7.83, "tier": "discovery", "color": "#EAB308"},
    # Resonance tier sources
    {"id": "tone-re", "label": "RE (285Hz)", "type": "phonic_tone", "frequency": 285, "tier": "resonance", "color": "#818CF8"},
    {"id": "tone-fa", "label": "FA (639Hz)", "type": "phonic_tone", "frequency": 639, "tier": "resonance", "color": "#C084FC"},
    {"id": "tone-sol", "label": "SOL (741Hz)", "type": "phonic_tone", "frequency": 741, "tier": "resonance", "color": "#FB923C"},
    {"id": "tone-la", "label": "LA (852Hz)", "type": "phonic_tone", "frequency": 852, "tier": "resonance", "color": "#FDA4AF"},
    {"id": "amb-forest", "label": "Sacred Forest", "type": "ambience", "tier": "resonance", "color": "#22C55E"},
    {"id": "amb-temple", "label": "Temple Bells", "type": "ambience", "tier": "resonance", "color": "#EAB308"},
    {"id": "amb-rain", "label": "Cosmic Rain", "type": "ambience", "tier": "resonance", "color": "#3B82F6"},
    # Sovereign tier sources
    {"id": "tone-si", "label": "SI (963Hz)", "type": "phonic_tone", "frequency": 963, "tier": "sovereign", "color": "#EF4444"},
    {"id": "tone-celestial", "label": "Celestial Gate (1074Hz)", "type": "phonic_tone", "frequency": 1074, "tier": "sovereign", "color": "#EAB308"},
    {"id": "mantra-om-mani", "label": "Om Mani Padme Hum", "type": "mantra", "tier": "sovereign", "color": "#C084FC"},
    {"id": "mantra-gayatri", "label": "Gayatri Mantra", "type": "mantra", "tier": "sovereign", "color": "#FBBF24"},
    {"id": "amb-cosmos", "label": "Deep Space Resonance", "type": "ambience", "tier": "sovereign", "color": "#818CF8"},
    {"id": "vis-geometry", "label": "Sacred Geometry Visual", "type": "visual", "tier": "sovereign", "color": "#A78BFA"},
]


@router.get("/mixer/sources")
async def get_track_sources(user=Depends(get_current_user)):
    """Get available track sources, gated by subscription tier."""
    user_id = user["id"]
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    tier_idx = TIER_ORDER.index(tier_key)

    sources = []
    for s in STOCK_SOURCES:
        s_tier_idx = TIER_ORDER.index(s["tier"]) if s["tier"] in TIER_ORDER else 0
        unlocked = tier_idx >= s_tier_idx
        entry = {**s, "locked": not unlocked}
        if not unlocked:
            entry["label"] = entry["label"][:8] + "..."
        sources.append(entry)

    return {"sources": sources, "tier": tier_key}

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  4-TIER MIXER SUBSCRIPTION SYSTEM
#  Discovery (Free) → Player → Ultra Player → Sovereign
#  Separate from Mastery, controls infrastructure speed
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
        "stock_label": "12 Sources (Tones, Ambience, Mantras, Visual)",
        "rendering": "standard_stereo",
        "rendering_label": "Standard Stereo (44.1kHz)",
        "nested_projects": False,
        "keyframe_automation": False,
        "materialization_delay": 20,
        "shadow_tracks": True,
        "bonus_multiplier": 1.0,
        "early_drops": False,
        "color": "#94A3B8",
    },
    "player": {
        "name": "Player",
        "label": "The Gentle Path",
        "price_monthly": 9.99,
        "layer_cap": 8,
        "ai_credits_monthly": 40,
        "ai_gen_type": "standard",
        "stock_library": "extended_tones",
        "stock_label": "26 Sources + Videos + Fractals",
        "rendering": "hifi_stereo",
        "rendering_label": "Hi-Fi Stereo (48kHz)",
        "nested_projects": False,
        "keyframe_automation": False,
        "materialization_delay": 8,
        "shadow_tracks": True,
        "bonus_multiplier": 1.1,
        "early_drops": False,
        "color": "#2DD4BF",
    },
    "ultra_player": {
        "name": "Ultra Player",
        "label": "The Radiant Path",
        "price_monthly": 24.99,
        "layer_cap": 20,
        "ai_credits_monthly": 150,
        "ai_gen_type": "deep",
        "stock_library": "full_effects",
        "stock_label": "42 Sources + 4K Video + 12 Filters",
        "rendering": "hd_lossless",
        "rendering_label": "HD Lossless (88.2kHz / 24-bit)",
        "nested_projects": False,
        "keyframe_automation": True,
        "materialization_delay": 2,
        "shadow_tracks": True,
        "bonus_multiplier": 1.15,
        "early_drops": False,
        "color": "#C084FC",
    },
    "sovereign": {
        "name": "Sovereign",
        "label": "The Hot Path",
        "price_monthly": 49.99,
        "layer_cap": -1,
        "ai_credits_monthly": 250,
        "ai_gen_type": "deep_npu",
        "stock_library": "full_phonic",
        "stock_label": "60 Sovereign Sources + Full Visual Suite",
        "rendering": "ultra_lossless_spatial",
        "rendering_label": "Ultra-Lossless / Atmos Spatial (96kHz)",
        "nested_projects": True,
        "keyframe_automation": True,
        "materialization_delay": 0,
        "shadow_tracks": False,
        "bonus_multiplier": 1.25,
        "early_drops": True,
        "color": "#EAB308",
    },
}

TIER_ORDER = ["discovery", "player", "ultra_player", "sovereign"]

TIER_COMPARISON = [
    {"feature": "Layer Capacity", "discovery": "3 Static Tracks", "player": "8 Tracks", "ultra_player": "20 Tracks + Keyframes", "sovereign": "Unlimited + Nested"},
    {"feature": "AI Credits / Month", "discovery": "5 (Simple Gen)", "player": "40 (Standard Gen)", "ultra_player": "150 (Deep Gen)", "sovereign": "250+ (NPU Priority)"},
    {"feature": "Sound Sources", "discovery": "12 (6 Tones + 3 Amb + 2 Mantras + 1 Visual)", "player": "26 (+ 14 Extended)", "ultra_player": "42 (+ 16 Deep Sources)", "sovereign": "60 (+ 18 Sovereign Exclusives)"},
    {"feature": "Video Overlays", "discovery": "2 (Ocean, Forest)", "player": "5 (+ Northern Lights, Starfield, Rain)", "ultra_player": "7 (+ Deep Cosmos, 4K Forest)", "sovereign": "8 (+ Aurora 4K)"},
    {"feature": "Light Modes", "discovery": "3 (Sunrise, Calm, Healing)", "player": "7 (+ Aurora, Violet, Golden, Moonrise)", "ultra_player": "10 (+ Cosmic, Rose, Chakra)", "sovereign": "12 (+ Quantum Flux, Void)"},
    {"feature": "Fractals", "discovery": "2 (Mandelbrot, Julia)", "player": "5 (+ Sacred Geo, Fibonacci, Flower)", "ultra_player": "9 (+ Sri Yantra, Metatron, Vesica, Tree)", "sovereign": "12 (+ Hyperbolic, Penrose, Lorenz)"},
    {"feature": "Visual Filters", "discovery": "3 (Bloom, Sepia, Dream)", "player": "7 (+ Grain, Neon, Vintage, Ethereal)", "ultra_player": "12 (+ Chromatic, VHS, Infrared, Cyber, Purple)", "sovereign": "15 (+ Kaleidoscope, Rift, Astral)"},
    {"feature": "Rendering", "discovery": "44.1kHz Stereo", "player": "48kHz Hi-Fi", "ultra_player": "88.2kHz Lossless", "sovereign": "96kHz Atmos Spatial"},
    {"feature": "Materialization", "discovery": "15-30s Sacred Assembly", "player": "5-8s Loading", "ultra_player": "2-3s Stabilization", "sovereign": "Instant (GPU Edge)"},
    {"feature": "Keyframe Automation", "discovery": "No", "player": "No", "ultra_player": "Yes (Volume + Frequency)", "sovereign": "Yes + Pan + Reverb"},
    {"feature": "Nested Projects", "discovery": "No", "player": "No", "ultra_player": "No", "sovereign": "Unlimited"},
    {"feature": "Speed Bonuses", "discovery": "None", "player": "+10%", "ultra_player": "+15%", "sovereign": "+25% + NPU"},
    {"feature": "Early Drops", "discovery": "No", "player": "No", "ultra_player": "No", "sovereign": "Exclusive Access"},
    {"feature": "Bonus Multiplier", "discovery": "1.0x", "player": "1.1x", "ultra_player": "1.15x", "sovereign": "1.25x"},
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
            "bonus_wraps_active": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.mixer_subscriptions.insert_one({**sub})
        sub.pop("_id", None)

    tier_key = sub.get("tier", "discovery")
    if tier_key not in MIXER_TIERS:
        tier_key = "discovery"
    tier_config = MIXER_TIERS[tier_key]

    return {
        "tier": tier_key,
        "tier_config": tier_config,
        "ai_credits_remaining": sub.get("ai_credits_remaining", tier_config["ai_credits_monthly"]),
        "speed_bonus_pct": sub.get("speed_bonus_pct", 0),
        "bonus_wraps_active": sub.get("bonus_wraps_active", []),
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

    if current_tier not in TIER_ORDER:
        current_tier = "discovery"

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
            "speed_bonus_pct": int((new_config["bonus_multiplier"] - 1.0) * 100),
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
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRACK_TYPES = ["phonic_tone", "mantra", "ambience", "visual", "suanpan", "generator", "custom", "bonus_pack"]


@router.post("/mixer/projects")
async def save_project(data: dict = Body(...), user=Depends(get_current_user)):
    """Save a multi-track mixer project."""
    user_id = user["id"]
    name = data.get("name", "").strip()
    tracks = data.get("tracks", [])

    if not name:
        raise HTTPException(status_code=400, detail="Project name required")

    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    if tier_key not in MIXER_TIERS:
        tier_key = "discovery"
    tier_config = MIXER_TIERS[tier_key]
    layer_cap = tier_config["layer_cap"]

    if layer_cap > 0 and len(tracks) > layer_cap:
        raise HTTPException(
            status_code=403,
            detail=f"Layer cap reached. {tier_config['name']} tier allows {layer_cap} tracks. Upgrade for more."
        )

    existing = await db.mixer_projects.find_one({"user_id": user_id, "name": name})

    sanitized_tracks = []
    for i, t in enumerate(tracks[:50]):
        track_data = {
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
            "ripple_locked": bool(t.get("ripple_locked", False)),
        }
        # Keyframe automation (Volume + Frequency curves)
        if t.get("keyframes_volume"):
            track_data["keyframes_volume"] = [
                {"time": max(0, kf.get("time", 0)), "value": max(0, min(1, kf.get("value", 0.8)))}
                for kf in t["keyframes_volume"][:100]
            ]
        if t.get("keyframes_frequency"):
            track_data["keyframes_frequency"] = [
                {"time": max(0, kf.get("time", 0)), "value": max(0, kf.get("value", 0))}
                for kf in t["keyframes_frequency"][:100]
            ]
        sanitized_tracks.append(track_data)

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
    projects = await db.mixer_projects.find(
        {"user_id": user["id"]}, {"_id": 0, "tracks": 0}
    ).sort("updated_at", -1).to_list(50)
    return {"projects": projects}


@router.get("/mixer/projects/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    project = await db.mixer_projects.find_one(
        {"id": project_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/mixer/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    result = await db.mixer_projects.delete_one({"id": project_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "deleted"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TRACK SOURCE LIBRARY — Expanded for 4 tiers
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STOCK_SOURCES = [
    # ━━━━ DISCOVERY TIER ━━━━ (12 sources: 6 tones + 3 ambience + 2 mantras + 1 visual)
    {"id": "tone-om", "label": "OM (136.1Hz)", "type": "phonic_tone", "frequency": 136.1, "tier": "discovery", "color": "#60A5FA"},
    {"id": "tone-ut", "label": "UT (174Hz)", "type": "phonic_tone", "frequency": 174, "tier": "discovery", "color": "#2DD4BF"},
    {"id": "tone-mi", "label": "MI (528Hz)", "type": "phonic_tone", "frequency": 528, "tier": "discovery", "color": "#22C55E"},
    {"id": "tone-schumann", "label": "Schumann (7.83Hz)", "type": "phonic_tone", "frequency": 7.83, "tier": "discovery", "color": "#EAB308"},
    {"id": "tone-earth", "label": "Earth Hum (194Hz)", "type": "phonic_tone", "frequency": 194.18, "tier": "discovery", "color": "#D97706"},
    {"id": "tone-theta", "label": "Theta Wave (6Hz)", "type": "phonic_tone", "frequency": 6, "tier": "discovery", "color": "#818CF8"},
    {"id": "amb-ocean", "label": "Ocean Waves", "type": "ambience", "tier": "discovery", "color": "#3B82F6"},
    {"id": "amb-wind", "label": "Mountain Wind", "type": "ambience", "tier": "discovery", "color": "#94A3B8"},
    {"id": "amb-crickets", "label": "Night Crickets", "type": "ambience", "tier": "discovery", "color": "#22C55E"},
    {"id": "mantra-om", "label": "OM Chant", "type": "mantra", "tier": "discovery", "color": "#FBBF24"},
    {"id": "mantra-peace", "label": "Peace Invocation", "type": "mantra", "tier": "discovery", "color": "#2DD4BF"},
    {"id": "vis-starfield", "label": "Starfield", "type": "visual", "tier": "discovery", "color": "#818CF8"},

    # ━━━━ PLAYER TIER ━━━━ (14 sources: 5 tones + 4 ambience + 3 mantras + 2 visuals)
    {"id": "tone-re", "label": "RE (285Hz)", "type": "phonic_tone", "frequency": 285, "tier": "player", "color": "#818CF8"},
    {"id": "tone-fa", "label": "FA (639Hz)", "type": "phonic_tone", "frequency": 639, "tier": "player", "color": "#C084FC"},
    {"id": "tone-sol", "label": "SOL (741Hz)", "type": "phonic_tone", "frequency": 741, "tier": "player", "color": "#FB923C"},
    {"id": "tone-alpha", "label": "Alpha Wave (10Hz)", "type": "phonic_tone", "frequency": 10, "tier": "player", "color": "#60A5FA"},
    {"id": "tone-beta", "label": "Beta Focus (18Hz)", "type": "phonic_tone", "frequency": 18, "tier": "player", "color": "#34D399"},
    {"id": "amb-forest", "label": "Sacred Forest", "type": "ambience", "tier": "player", "color": "#22C55E"},
    {"id": "amb-rain", "label": "Cosmic Rain", "type": "ambience", "tier": "player", "color": "#3B82F6"},
    {"id": "amb-stream", "label": "Mountain Stream", "type": "ambience", "tier": "player", "color": "#06B6D4"},
    {"id": "amb-thunderstorm", "label": "Distant Thunder", "type": "ambience", "tier": "player", "color": "#64748B"},
    {"id": "mantra-so-ham", "label": "So Ham Breath", "type": "mantra", "tier": "player", "color": "#A78BFA"},
    {"id": "mantra-om-shanti", "label": "Om Shanti Om", "type": "mantra", "tier": "player", "color": "#60A5FA"},
    {"id": "mantra-lokah", "label": "Lokah Samastah", "type": "mantra", "tier": "player", "color": "#2DD4BF"},
    {"id": "vis-aurora", "label": "Aurora Northern Lights", "type": "visual", "tier": "player", "color": "#2DD4BF"},
    {"id": "vis-raindrops", "label": "Rain on Glass", "type": "visual", "tier": "player", "color": "#3B82F6"},

    # ━━━━ ULTRA PLAYER TIER ━━━━ (16 sources: 5 tones + 4 ambience + 4 mantras + 3 visuals)
    {"id": "tone-la", "label": "LA (852Hz)", "type": "phonic_tone", "frequency": 852, "tier": "ultra_player", "color": "#FDA4AF"},
    {"id": "tone-la-sharp", "label": "LA# (396Hz)", "type": "phonic_tone", "frequency": 396, "tier": "ultra_player", "color": "#EF4444"},
    {"id": "tone-deep-delta", "label": "Deep Delta (2Hz)", "type": "phonic_tone", "frequency": 2, "tier": "ultra_player", "color": "#1E40AF"},
    {"id": "tone-gamma", "label": "Gamma Burst (40Hz)", "type": "phonic_tone", "frequency": 40, "tier": "ultra_player", "color": "#FBBF24"},
    {"id": "tone-pineal", "label": "Pineal Activation (936Hz)", "type": "phonic_tone", "frequency": 936, "tier": "ultra_player", "color": "#8B5CF6"},
    {"id": "amb-temple", "label": "Temple Bells", "type": "ambience", "tier": "ultra_player", "color": "#EAB308"},
    {"id": "amb-singing-bowl", "label": "Singing Bowl Cascade", "type": "ambience", "tier": "ultra_player", "color": "#2DD4BF"},
    {"id": "amb-tibetan-horn", "label": "Tibetan Horn Drone", "type": "ambience", "tier": "ultra_player", "color": "#D97706"},
    {"id": "amb-waterfall", "label": "Sacred Waterfall", "type": "ambience", "tier": "ultra_player", "color": "#06B6D4"},
    {"id": "mantra-om-mani", "label": "Om Mani Padme Hum", "type": "mantra", "tier": "ultra_player", "color": "#C084FC"},
    {"id": "mantra-gayatri", "label": "Gayatri Mantra", "type": "mantra", "tier": "ultra_player", "color": "#FBBF24"},
    {"id": "mantra-medicine", "label": "Medicine Buddha", "type": "mantra", "tier": "ultra_player", "color": "#3B82F6"},
    {"id": "mantra-green-tara", "label": "Green Tara Invocation", "type": "mantra", "tier": "ultra_player", "color": "#22C55E"},
    {"id": "vis-geometry", "label": "Sacred Geometry Visual", "type": "visual", "tier": "ultra_player", "color": "#A78BFA"},
    {"id": "vis-mandala", "label": "Living Mandala Pattern", "type": "visual", "tier": "ultra_player", "color": "#F472B6"},
    {"id": "vis-cosmos", "label": "Deep Cosmos Journey", "type": "visual", "tier": "ultra_player", "color": "#818CF8"},

    # ━━━━ SOVEREIGN TIER ━━━━ (18 sources: 6 tones + 5 ambience + 4 mantras + 3 visuals)
    {"id": "tone-si", "label": "SI (963Hz)", "type": "phonic_tone", "frequency": 963, "tier": "sovereign", "color": "#EF4444"},
    {"id": "tone-celestial", "label": "Celestial Gate (1074Hz)", "type": "phonic_tone", "frequency": 1074, "tier": "sovereign", "color": "#EAB308"},
    {"id": "tone-dna-repair", "label": "DNA Repair (528+741Hz)", "type": "phonic_tone", "frequency": 528, "tier": "sovereign", "color": "#22C55E"},
    {"id": "tone-cosmic-om", "label": "Cosmic OM (432Hz)", "type": "phonic_tone", "frequency": 432, "tier": "sovereign", "color": "#FBBF24"},
    {"id": "tone-sun", "label": "Sun Frequency (126.22Hz)", "type": "phonic_tone", "frequency": 126.22, "tier": "sovereign", "color": "#FB923C"},
    {"id": "tone-neptune", "label": "Neptune Resonance (211Hz)", "type": "phonic_tone", "frequency": 211.44, "tier": "sovereign", "color": "#60A5FA"},
    {"id": "amb-cosmos", "label": "Deep Space Resonance", "type": "ambience", "tier": "sovereign", "color": "#818CF8"},
    {"id": "amb-aurora", "label": "Aurora Sonification", "type": "ambience", "tier": "sovereign", "color": "#34D399"},
    {"id": "amb-cave-crystal", "label": "Crystal Cave Echo", "type": "ambience", "tier": "sovereign", "color": "#A78BFA"},
    {"id": "amb-volcanic", "label": "Volcanic Core Hum", "type": "ambience", "tier": "sovereign", "color": "#EF4444"},
    {"id": "amb-whale-song", "label": "Whale Song Deep", "type": "ambience", "tier": "sovereign", "color": "#06B6D4"},
    {"id": "mantra-heart-sutra", "label": "Heart Sutra Chant", "type": "mantra", "tier": "sovereign", "color": "#F472B6"},
    {"id": "mantra-sat-nam", "label": "Sat Nam Kundalini", "type": "mantra", "tier": "sovereign", "color": "#FBBF24"},
    {"id": "mantra-adi", "label": "Adi Shakti Mantra", "type": "mantra", "tier": "sovereign", "color": "#EF4444"},
    {"id": "mantra-mul", "label": "Mul Mantar", "type": "mantra", "tier": "sovereign", "color": "#D97706"},
    {"id": "vis-aurora-4k", "label": "Aurora Borealis 4K", "type": "visual", "tier": "sovereign", "color": "#FBBF24"},
    {"id": "vis-nebula", "label": "Nebula Flythrough", "type": "visual", "tier": "sovereign", "color": "#C084FC"},
    {"id": "vis-dimensional", "label": "Dimensional Portal", "type": "visual", "tier": "sovereign", "color": "#EAB308"},
]


@router.get("/mixer/sources")
async def get_track_sources(user=Depends(get_current_user)):
    """Get available track sources, gated by subscription tier."""
    user_id = user["id"]
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    if tier_key not in TIER_ORDER:
        tier_key = "discovery"
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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BONUS WRAPPED PACKS — Trade Circle Revenue Multipliers
#  Every purchase grants permanent functional bonuses
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BONUS_PACKS = [
    {
        "id": "pack-vedic-vocals",
        "name": "Vedic Vocal Suite",
        "description": "Ancient Vedic chanting tones spanning 7 octaves. Includes Gayatri, Rudram, and Chamakam phonic layers.",
        "type": "mantra",
        "price_credits": 25,
        "tier_required": "player",
        "bonus_wrap": {"type": "speed_boost", "value": 10, "label": "+10% AI Gen Speed"},
        "tracks_included": [
            {"type": "mantra", "source_label": "Gayatri Sunrise Chant", "frequency": 396, "color": "#FBBF24"},
            {"type": "mantra", "source_label": "Rudram Power Hymn", "frequency": 417, "color": "#EF4444"},
            {"type": "phonic_tone", "source_label": "Chamakam Harmonic", "frequency": 528, "color": "#22C55E"},
        ],
        "color": "#FBBF24",
        "snippet_duration": 10,
    },
    {
        "id": "pack-hopi-chants",
        "name": "Hopi Chant Collection",
        "description": "Sacred chants from the Hopi tradition. Rain dance frequencies, corn ceremony tones, and solstice harmonics.",
        "type": "mantra",
        "price_credits": 30,
        "tier_required": "player",
        "bonus_wrap": {"type": "ai_credits", "value": 15, "label": "+15 Monthly AI Credits"},
        "tracks_included": [
            {"type": "mantra", "source_label": "Rain Dance Harmonic", "frequency": 285, "color": "#3B82F6"},
            {"type": "ambience", "source_label": "Mesa Wind Texture", "color": "#FB923C"},
            {"type": "phonic_tone", "source_label": "Solstice Tone", "frequency": 741, "color": "#EAB308"},
        ],
        "color": "#FB923C",
        "snippet_duration": 10,
    },
    {
        "id": "pack-solfeggio-master",
        "name": "Solfeggio Master Scale",
        "description": "Complete 9-frequency solfeggio set (174-963Hz) with harmonic overtone generators and sub-octave drones.",
        "type": "phonic_tone",
        "price_credits": 40,
        "tier_required": "ultra_player",
        "bonus_wrap": {"type": "speed_boost", "value": 15, "label": "+15% Render Speed"},
        "tracks_included": [
            {"type": "phonic_tone", "source_label": "UT Foundation (174Hz)", "frequency": 174, "color": "#2DD4BF"},
            {"type": "phonic_tone", "source_label": "MI Transformation (528Hz)", "frequency": 528, "color": "#22C55E"},
            {"type": "phonic_tone", "source_label": "SI Crown (963Hz)", "frequency": 963, "color": "#A78BFA"},
            {"type": "phonic_tone", "source_label": "Sub-Octave Drone", "frequency": 63, "color": "#60A5FA"},
        ],
        "color": "#A78BFA",
        "snippet_duration": 10,
    },
    {
        "id": "pack-sacred-geometry",
        "name": "Sacred Geometry Visual Pack",
        "description": "Dynamic visual overlays — Flower of Life, Metatron's Cube, Sri Yantra. Reactive to frequency input.",
        "type": "visual",
        "price_credits": 35,
        "tier_required": "ultra_player",
        "bonus_wrap": {"type": "speed_boost", "value": 10, "label": "+10% Export Speed"},
        "tracks_included": [
            {"type": "visual", "source_label": "Flower of Life Overlay", "color": "#EAB308"},
            {"type": "visual", "source_label": "Metatron Cube Grid", "color": "#C084FC"},
            {"type": "visual", "source_label": "Sri Yantra Pulse", "color": "#EF4444"},
        ],
        "color": "#C084FC",
        "snippet_duration": 10,
    },
    {
        "id": "pack-deep-earth",
        "name": "Deep Earth Resonance Suite",
        "description": "Sub-bass frequencies from geological recordings. Crystal cave harmonics, volcanic hum, and tectonic pulses.",
        "type": "ambience",
        "price_credits": 50,
        "tier_required": "sovereign",
        "bonus_wrap": {"type": "speed_boost", "value": 20, "label": "+20% Processing Speed"},
        "tracks_included": [
            {"type": "ambience", "source_label": "Crystal Cave Harmonics", "color": "#2DD4BF"},
            {"type": "ambience", "source_label": "Volcanic Hum (8Hz)", "frequency": 8, "color": "#EF4444"},
            {"type": "phonic_tone", "source_label": "Tectonic Pulse", "frequency": 14.1, "color": "#818CF8"},
            {"type": "ambience", "source_label": "Magnetosphere Drone", "color": "#60A5FA"},
        ],
        "color": "#818CF8",
        "snippet_duration": 10,
    },
]

BONUS_PACK_MAP = {p["id"]: p for p in BONUS_PACKS}


@router.get("/mixer/bonus-packs")
async def get_bonus_packs(user=Depends(get_current_user)):
    """List all Bonus Wrapped packs with ownership status."""
    user_id = user["id"]
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    if tier_key not in TIER_ORDER:
        tier_key = "discovery"
    tier_idx = TIER_ORDER.index(tier_key)

    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    credits = u.get("user_credit_balance", 0) if u else 0

    owned_docs = await db.user_bonus_packs.find({"user_id": user_id}, {"_id": 0}).to_list(50)
    owned_ids = {d["pack_id"] for d in owned_docs}

    packs = []
    for p in BONUS_PACKS:
        req_idx = TIER_ORDER.index(p["tier_required"]) if p["tier_required"] in TIER_ORDER else 0
        packs.append({
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "type": p["type"],
            "price_credits": p["price_credits"],
            "tier_required": p["tier_required"],
            "bonus_wrap": p["bonus_wrap"],
            "tracks_included": len(p["tracks_included"]),
            "color": p["color"],
            "snippet_duration": p["snippet_duration"],
            "owned": p["id"] in owned_ids,
            "tier_locked": tier_idx < req_idx,
            "can_afford": credits >= p["price_credits"],
        })

    return {"packs": packs, "user_credits": credits, "tier": tier_key}


@router.post("/mixer/bonus-packs/purchase")
async def purchase_bonus_pack(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a Bonus Wrapped pack. Atomic — bonuses activate instantly."""
    pack_id = data.get("packId", "")
    user_id = user["id"]

    pack = BONUS_PACK_MAP.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    # Tier gate
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    if tier_key not in TIER_ORDER:
        tier_key = "discovery"
    tier_idx = TIER_ORDER.index(tier_key)
    req_idx = TIER_ORDER.index(pack["tier_required"]) if pack["tier_required"] in TIER_ORDER else 0

    if tier_idx < req_idx:
        raise HTTPException(status_code=403, detail=f"Requires {pack['tier_required'].replace('_',' ').title()} tier")

    # Already owned
    existing = await db.user_bonus_packs.find_one({"user_id": user_id, "pack_id": pack_id})
    if existing:
        raise HTTPException(status_code=400, detail="Pack already owned")

    # Credit check
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    credits = u.get("user_credit_balance", 0) if u else 0
    if credits < pack["price_credits"]:
        raise HTTPException(status_code=400, detail=f"Need {pack['price_credits']} credits, have {credits}")

    # Deduct credits
    await db.users.update_one({"id": user_id}, {"$inc": {"user_credit_balance": -pack["price_credits"]}})

    # Save ownership
    ownership = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "pack_id": pack_id,
        "pack_name": pack["name"],
        "bonus_wrap": pack["bonus_wrap"],
        "tracks": pack["tracks_included"],
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.user_bonus_packs.insert_one(ownership)
    ownership.pop("_id", None)

    # Apply bonus wrap atomically
    bonus = pack["bonus_wrap"]
    if bonus["type"] == "speed_boost":
        await db.mixer_subscriptions.update_one(
            {"user_id": user_id},
            {"$inc": {"speed_bonus_pct": bonus["value"]},
             "$push": {"bonus_wraps_active": {"pack_id": pack_id, "bonus": bonus}}}
        )
    elif bonus["type"] == "ai_credits":
        await db.mixer_subscriptions.update_one(
            {"user_id": user_id},
            {"$inc": {"ai_credits_remaining": bonus["value"]},
             "$push": {"bonus_wraps_active": {"pack_id": pack_id, "bonus": bonus}}}
        )

    await create_activity(user_id, "bonus_pack_purchase", f"Unlocked: {pack['name']} ({bonus['label']})")

    return {
        "purchased": pack["name"],
        "bonus_activated": bonus["label"],
        "tracks_unlocked": len(pack["tracks_included"]),
        "credits_remaining": credits - pack["price_credits"],
    }


@router.get("/mixer/bonus-packs/owned")
async def get_owned_bonus_packs(user=Depends(get_current_user)):
    """Get all owned bonus packs with their tracks for the mixer."""
    owned = await db.user_bonus_packs.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(50)

    return {"owned_packs": owned}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HEXAGRAM-BASED PACK RECOMMENDATIONS
#  Lower Trigram (bits 0-2) → "Soul" (vocal/mantra packs)
#  Upper Trigram (bits 3-5) → "Environment" (visual/ambience)
#  Stagnation detection → active grounding suggestions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 8 trigrams (3 bits each)
TRIGRAM_NAMES = {
    0: ("坤", "Earth", "Receptive"),
    1: ("震", "Thunder", "Arousing"),
    2: ("坎", "Water", "Abysmal"),
    3: ("兑", "Lake", "Joyous"),
    4: ("艮", "Mountain", "Still"),
    5: ("离", "Fire", "Clinging"),
    6: ("巽", "Wind", "Gentle"),
    7: ("乾", "Heaven", "Creative"),
}

# Lower trigram → Soul pack mapping (vocal/mantra recommendations)
LOWER_TRIGRAM_SOUL = {
    0: {"pack_id": "pack-vedic-vocals", "reason": "Earth/Receptive energy calls for grounding Vedic vocal tones to anchor your inner resonance."},
    1: {"pack_id": "pack-hopi-chants", "reason": "Thunder/Arousing energy seeks rhythmic chanting to channel the dynamic power within."},
    2: {"pack_id": "pack-vedic-vocals", "reason": "Water/Abysmal energy flows toward ancient mantric patterns for emotional depth."},
    3: {"pack_id": "pack-hopi-chants", "reason": "Lake/Joyous energy resonates with celebratory chanting traditions."},
    4: {"pack_id": "pack-solfeggio-master", "reason": "Mountain/Still energy benefits from precise solfeggio frequencies for meditative stillness."},
    5: {"pack_id": "pack-solfeggio-master", "reason": "Fire/Clinging energy needs structured frequency scales to direct illumination."},
    6: {"pack_id": "pack-vedic-vocals", "reason": "Wind/Gentle energy harmonizes with soft, flowing Vedic chant patterns."},
    7: {"pack_id": "pack-solfeggio-master", "reason": "Heaven/Creative energy demands the full solfeggio spectrum for transcendent composition."},
}

# Upper trigram → Environment pack mapping (visual/ambience)
UPPER_TRIGRAM_ENV = {
    0: {"pack_id": "pack-deep-earth", "reason": "Earth/Receptive outer state draws you toward deep geological resonance and grounding textures."},
    1: {"pack_id": "pack-sacred-geometry", "reason": "Thunder/Arousing outer state benefits from dynamic sacred geometry visuals to channel creative power."},
    2: {"pack_id": "pack-deep-earth", "reason": "Water/Abysmal outer state seeks deep oceanic and cave resonance for immersive depth."},
    3: {"pack_id": "pack-sacred-geometry", "reason": "Lake/Joyous outer state responds to flowing geometric patterns that mirror inner harmony."},
    4: {"pack_id": "pack-deep-earth", "reason": "Mountain/Still outer state aligns with tectonic stability and earth-frequency grounding."},
    5: {"pack_id": "pack-sacred-geometry", "reason": "Fire/Clinging outer state ignites with radiant sacred geometry and mandala patterns."},
    6: {"pack_id": "pack-sacred-geometry", "reason": "Wind/Gentle outer state flows with dynamic visual overlays and soft geometry."},
    7: {"pack_id": "pack-deep-earth", "reason": "Heaven/Creative outer state seeks cosmic resonance — deep space and magnetosphere drones."},
}

# Stagnation hexagrams — these indicate energetic blocks
STAGNATION_HEXAGRAMS = {
    12: "Standstill", 23: "Splitting Apart", 29: "The Abysmal",
    36: "Darkening of the Light", 39: "Obstruction", 47: "Oppression",
}

from routes.hexagram import HEXAGRAM_NAMES, SOLFEGGIO


@router.get("/mixer/recommendations")
async def get_recommendations(user=Depends(get_current_user)):
    """Hexagram-based pack recommendations with stagnation detection."""
    user_id = user["id"]

    # Get current hexagram
    hex_doc = await db.hexagram_journal.find_one(
        {"user_id": user_id}, {"_id": 0, "hexagram_id": 1}
    )
    hex_number = hex_doc.get("hexagram_id", 1) if hex_doc else 1

    # Extract trigrams from hexagram number (0-indexed internally)
    hex_idx = hex_number - 1
    lower_trigram = hex_idx & 0b111
    upper_trigram = (hex_idx >> 3) & 0b111

    hex_name = HEXAGRAM_NAMES.get(hex_number, ("", "", "Unknown"))
    lower_tri = TRIGRAM_NAMES.get(lower_trigram, ("", "", ""))
    upper_tri = TRIGRAM_NAMES.get(upper_trigram, ("", "", ""))

    # Check ownership
    owned_docs = await db.user_bonus_packs.find({"user_id": user_id}, {"_id": 0}).to_list(50)
    owned_ids = {d["pack_id"] for d in owned_docs}

    # Analyze mixing history for stagnation detection
    projects = await db.mixer_projects.find(
        {"user_id": user_id}, {"_id": 0, "tracks": 1}
    ).sort("updated_at", -1).to_list(5)

    avg_freq = 0
    total_freq_tracks = 0
    for proj in projects:
        for t in proj.get("tracks", []):
            if t.get("frequency"):
                avg_freq += t["frequency"]
                total_freq_tracks += 1
    if total_freq_tracks > 0:
        avg_freq /= total_freq_tracks

    # Stagnation detection
    is_stagnation = hex_number in STAGNATION_HEXAGRAMS
    high_freq_imbalance = avg_freq > 600 and is_stagnation

    # Build recommendations
    recs = []

    # Soul recommendation (Lower Trigram)
    soul = LOWER_TRIGRAM_SOUL.get(lower_trigram)
    if soul:
        pack = BONUS_PACK_MAP.get(soul["pack_id"])
        if pack:
            is_owned = soul["pack_id"] in owned_ids
            recs.append({
                "type": "soul",
                "trigram": f"{lower_tri[1]} ({lower_tri[2]})",
                "pack_id": soul["pack_id"],
                "pack_name": pack["name"],
                "pack_color": pack["color"],
                "bonus_wrap": pack["bonus_wrap"],
                "price_credits": pack["price_credits"],
                "owned": is_owned,
                "reason": soul["reason"],
                "tone": "soft" if is_owned else "active",
                "message": "You already have this in your kit — activate it for this session." if is_owned
                    else f"Your inner {lower_tri[1]} trigram suggests this pack will deepen your resonance.",
            })

    # Environment recommendation (Upper Trigram)
    env = UPPER_TRIGRAM_ENV.get(upper_trigram)
    if env and (not soul or env["pack_id"] != soul["pack_id"]):
        pack = BONUS_PACK_MAP.get(env["pack_id"])
        if pack:
            is_owned = env["pack_id"] in owned_ids
            recs.append({
                "type": "environment",
                "trigram": f"{upper_tri[1]} ({upper_tri[2]})",
                "pack_id": env["pack_id"],
                "pack_name": pack["name"],
                "pack_color": pack["color"],
                "bonus_wrap": pack["bonus_wrap"],
                "price_credits": pack["price_credits"],
                "owned": is_owned,
                "reason": env["reason"],
                "tone": "soft" if is_owned else "active",
                "message": "This pack is already in your arsenal — try layering it into your current mix." if is_owned
                    else f"Your outer {upper_tri[1]} trigram reveals a need for this environmental layer.",
            })

    # Stagnation override — always recommend grounding if detected
    if high_freq_imbalance:
        deep_earth = BONUS_PACK_MAP.get("pack-deep-earth")
        if deep_earth and "pack-deep-earth" not in owned_ids:
            recs.insert(0, {
                "type": "stagnation",
                "trigram": "Stagnation Detected",
                "pack_id": "pack-deep-earth",
                "pack_name": deep_earth["name"],
                "pack_color": deep_earth["color"],
                "bonus_wrap": deep_earth["bonus_wrap"],
                "price_credits": deep_earth["price_credits"],
                "owned": False,
                "reason": f"Your mix averages {avg_freq:.0f}Hz but your hexagram shows '{STAGNATION_HEXAGRAMS[hex_number]}.' Your energetic field needs grounding.",
                "tone": "active",
                "message": f"Your composition is running hot at {avg_freq:.0f}Hz with a {STAGNATION_HEXAGRAMS[hex_number]} hexagram. The Deep Earth Resonance Suite will ground your frequencies and provide +20% processing speed to break the loop.",
            })

    return {
        "hexagram": {
            "number": hex_number,
            "name": hex_name[2] if len(hex_name) > 2 else "",
            "chinese": hex_name[0] if hex_name else "",
            "lower_trigram": {"index": lower_trigram, "name": lower_tri[1], "quality": lower_tri[2]},
            "upper_trigram": {"index": upper_trigram, "name": upper_tri[1], "quality": upper_tri[2]},
        },
        "is_stagnation": is_stagnation,
        "avg_frequency": round(avg_freq, 1),
        "recommendations": recs,
        "solfeggio_resonance": SOLFEGGIO[(hex_number - 1) % len(SOLFEGGIO)],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RIPPLE EDIT ENGINE
#  When a track's duration/start_time changes, shift
#  all subsequent unlocked tracks by the delta.
#  Keyframe points translate with their parent track.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHI = 1.618033988749895


def ripple_edit_tracks(tracks, changed_index, old_duration, new_duration, old_start, new_start):
    """Compute ripple shift for all unlocked tracks after changed_index.
    Returns updated tracks list and a list of shifted indices."""
    # Delta from duration change at the edit point
    duration_delta = new_duration - old_duration
    # Total ripple delta is duration change (start changes don't ripple downstream)
    ripple_delta = duration_delta

    shifted_indices = []
    result = []

    for i, t in enumerate(tracks):
        track = {**t}
        if i == changed_index:
            track["duration"] = max(1, new_duration)
            track["start_time"] = max(0, new_start)
            # Clamp keyframes to new duration
            if track.get("keyframes_volume"):
                track["keyframes_volume"] = [
                    {**kf, "time": min(kf["time"], new_duration)}
                    for kf in track["keyframes_volume"]
                ]
            if track.get("keyframes_frequency"):
                track["keyframes_frequency"] = [
                    {**kf, "time": min(kf["time"], new_duration)}
                    for kf in track["keyframes_frequency"]
                ]
        elif i > changed_index and not track.get("ripple_locked", False):
            # Shift by ripple delta
            track["start_time"] = max(0, track.get("start_time", 0) + ripple_delta)
            # Translate keyframe time points by ripple delta (preserve Phi spacing)
            if track.get("keyframes_volume"):
                track["keyframes_volume"] = [
                    {**kf, "time": max(0, kf["time"])}
                    for kf in track["keyframes_volume"]
                ]
            if track.get("keyframes_frequency"):
                track["keyframes_frequency"] = [
                    {**kf, "time": max(0, kf["time"])}
                    for kf in track["keyframes_frequency"]
                ]
            shifted_indices.append(i)
        result.append(track)

    return result, shifted_indices


@router.post("/mixer/projects/ripple")
async def ripple_edit(data: dict = Body(...), user=Depends(get_current_user)):
    """Apply ripple edit to a project's track timeline.
    Shifts unlocked subsequent tracks when a track's duration changes."""
    user_id = user["id"]
    project_id = data.get("project_id", "")
    changed_index = data.get("changed_index", 0)
    old_duration = data.get("old_duration", 60)
    new_duration = data.get("new_duration", 60)
    old_start = data.get("old_start", 0)
    new_start = data.get("new_start", 0)

    project = await db.mixer_projects.find_one(
        {"id": project_id, "user_id": user_id}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tracks = project.get("tracks", [])
    if changed_index < 0 or changed_index >= len(tracks):
        raise HTTPException(status_code=400, detail="Invalid track index")

    rippled_tracks, shifted = ripple_edit_tracks(
        tracks, changed_index, old_duration, new_duration, old_start, new_start
    )

    # Save back
    await db.mixer_projects.update_one(
        {"id": project_id, "user_id": user_id},
        {"$set": {
            "tracks": rippled_tracks,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    ripple_delta = new_duration - old_duration

    return {
        "tracks": rippled_tracks,
        "shifted_indices": shifted,
        "ripple_delta": ripple_delta,
        "track_count": len(rippled_tracks),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AI MANTRA DJ — AUTO-COMPOSE ENGINE
#  Goal-based intelligent track arrangement with
#  frequency science, cross-fade overlaps, and
#  hexagram-aware resonance matching.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTO_COMPOSE_GOALS = {
    "deep_sleep": {
        "label": "Deep Sleep",
        "description": "Delta & theta wave composition for restorative rest",
        "frequencies": [7.83, 136.1, 174, 285, 2, 6],
        "ambience": ["amb-ocean", "amb-rain", "amb-crickets", "amb-whale-song"],
        "mantras": ["mantra-so-ham", "mantra-peace"],
        "base_duration": 90,
        "crossfade": 8,
        "volume_curve": "descending",
    },
    "focus": {
        "label": "Laser Focus",
        "description": "Alpha-beta entrainment for deep concentration",
        "frequencies": [528, 741, 285, 396, 10, 18, 40],
        "ambience": ["amb-temple", "amb-stream"],
        "mantras": [],
        "base_duration": 60,
        "crossfade": 4,
        "volume_curve": "sustained",
    },
    "energy": {
        "label": "Energy Surge",
        "description": "High-frequency activation and rhythmic power",
        "frequencies": [852, 963, 741, 528, 1074, 40],
        "ambience": ["amb-singing-bowl", "amb-thunderstorm"],
        "mantras": ["mantra-om-shanti", "mantra-gayatri", "mantra-sat-nam"],
        "base_duration": 45,
        "crossfade": 3,
        "volume_curve": "ascending",
    },
    "healing": {
        "label": "Sacred Healing",
        "description": "Full solfeggio cascade for cellular restoration",
        "frequencies": [174, 285, 396, 417, 528, 639, 741, 852, 963],
        "ambience": ["amb-singing-bowl", "amb-temple", "amb-waterfall"],
        "mantras": ["mantra-om-mani", "mantra-medicine", "mantra-green-tara"],
        "base_duration": 75,
        "crossfade": 6,
        "volume_curve": "wave",
    },
    "meditation": {
        "label": "Deep Meditation",
        "description": "Theta-alpha bridge with OM foundation",
        "frequencies": [136.1, 7.83, 528, 174, 6, 432],
        "ambience": ["amb-forest", "amb-rain", "amb-cave-crystal"],
        "mantras": ["mantra-so-ham", "mantra-om-shanti", "mantra-om", "mantra-heart-sutra"],
        "base_duration": 120,
        "crossfade": 10,
        "volume_curve": "arc",
    },
    "grounding": {
        "label": "Earth Grounding",
        "description": "Sub-bass resonance for energetic anchoring",
        "frequencies": [7.83, 136.1, 174, 285, 194.18, 126.22],
        "ambience": ["amb-forest", "amb-wind", "amb-volcanic"],
        "mantras": ["mantra-sat-nam"],
        "base_duration": 60,
        "crossfade": 5,
        "volume_curve": "sustained",
    },
}

VOLUME_CURVES = {
    "descending": lambda i, n: max(0.2, 0.9 - (i / max(1, n - 1)) * 0.6),
    "ascending": lambda i, n: min(0.95, 0.3 + (i / max(1, n - 1)) * 0.6),
    "sustained": lambda i, n: 0.7,
    "wave": lambda i, n: 0.5 + 0.35 * (1 if i % 2 == 0 else -1) * (0.5 + 0.5 * (i / max(1, n))),
    "arc": lambda i, n: 0.4 + 0.5 * (1 - abs(2 * i / max(1, n) - 1)),
}

SOURCE_MAP = {s["id"]: s for s in STOCK_SOURCES}


@router.post("/mixer/auto-compose")
async def auto_compose(data: dict = Body(...), user=Depends(get_current_user)):
    """AI Mantra DJ — auto-compose a track arrangement based on a wellness goal."""
    user_id = user["id"]
    goal_key = data.get("goal", "meditation")

    if goal_key not in AUTO_COMPOSE_GOALS:
        raise HTTPException(status_code=400, detail=f"Unknown goal. Options: {list(AUTO_COMPOSE_GOALS.keys())}")

    goal = AUTO_COMPOSE_GOALS[goal_key]

    # Get subscription tier for track limits
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = sub.get("tier", "discovery") if sub else "discovery"
    if tier_key not in MIXER_TIERS:
        tier_key = "discovery"
    tier_config = MIXER_TIERS[tier_key]
    layer_cap = tier_config["layer_cap"]
    tier_idx = TIER_ORDER.index(tier_key)

    # Get hexagram for resonance tuning
    hex_doc = await db.hexagram_journal.find_one(
        {"user_id": user_id}, {"_id": 0, "hexagram_id": 1}
    )
    hex_number = hex_doc.get("hexagram_id", 1) if hex_doc else 1
    hex_idx = hex_number - 1
    solf_freq = SOLFEGGIO[(hex_idx) % len(SOLFEGGIO)]

    # Build track list from goal blueprint
    composed_tracks = []

    # 1. Core frequency tracks (tier-gated)
    available_freqs = []
    for freq in goal["frequencies"]:
        # Find matching source
        match = next((s for s in STOCK_SOURCES if s.get("frequency") == freq), None)
        if match:
            s_tier_idx = TIER_ORDER.index(match["tier"]) if match["tier"] in TIER_ORDER else 0
            if tier_idx >= s_tier_idx:
                available_freqs.append(match)
        else:
            # Create synthetic source for frequencies not in stock
            available_freqs.append({
                "id": f"auto-{freq}",
                "label": f"Resonance {freq}Hz",
                "type": "phonic_tone",
                "frequency": freq,
                "color": "#60A5FA",
            })

    # 2. Ambience tracks
    available_ambience = []
    for amb_id in goal["ambience"]:
        src = SOURCE_MAP.get(amb_id)
        if src:
            s_tier_idx = TIER_ORDER.index(src["tier"]) if src["tier"] in TIER_ORDER else 0
            if tier_idx >= s_tier_idx:
                available_ambience.append(src)

    # 3. Mantra tracks
    available_mantras = []
    for m_id in goal["mantras"]:
        src = SOURCE_MAP.get(m_id)
        if src:
            s_tier_idx = TIER_ORDER.index(src["tier"]) if src["tier"] in TIER_ORDER else 0
            if tier_idx >= s_tier_idx:
                available_mantras.append(src)

    # Determine max tracks based on tier
    max_tracks = layer_cap if layer_cap > 0 else 20

    # Compose arrangement: frequencies first, then ambience, then mantras
    all_sources = available_freqs + available_ambience + available_mantras
    all_sources = all_sources[:max_tracks]

    vol_fn = VOLUME_CURVES.get(goal["volume_curve"], VOLUME_CURVES["sustained"])
    n_tracks = len(all_sources)
    crossfade = goal["crossfade"]
    base_dur = goal["base_duration"]

    for i, src in enumerate(all_sources):
        # Stagger start times with cross-fade overlap
        start_time = max(0, i * (base_dur - crossfade))
        # Vary duration slightly for organic feel
        duration = base_dur + (i % 3) * 5 - 5

        composed_tracks.append({
            "type": src.get("type", "phonic_tone"),
            "source_id": src.get("id", ""),
            "source_label": src.get("label", f"Track {i+1}"),
            "volume": round(vol_fn(i, n_tracks), 2),
            "muted": False,
            "solo": False,
            "start_time": start_time,
            "duration": max(15, duration),
            "frequency": src.get("frequency"),
            "color": src.get("color", "#94A3B8"),
            "locked": False,
            "ripple_locked": False,
        })

    # Add hexagram resonance tone as a bonus layer if room
    if len(composed_tracks) < max_tracks:
        composed_tracks.append({
            "type": "phonic_tone",
            "source_id": f"hex-{hex_number}",
            "source_label": f"Hexagram #{hex_number} Resonance ({solf_freq}Hz)",
            "volume": 0.35,
            "muted": False,
            "solo": False,
            "start_time": 0,
            "duration": len(composed_tracks) * (base_dur - crossfade) + base_dur,
            "frequency": solf_freq,
            "color": "#C084FC",
            "locked": False,
            "ripple_locked": True,
        })

    # Deduct 1 AI credit
    if sub:
        credits = sub.get("ai_credits_remaining", 0)
        if credits > 0:
            await db.mixer_subscriptions.update_one(
                {"user_id": user_id},
                {"$inc": {"ai_credits_remaining": -1}}
            )

    total_duration = max(t["start_time"] + t["duration"] for t in composed_tracks) if composed_tracks else 0

    return {
        "goal": goal_key,
        "goal_label": goal["label"],
        "goal_description": goal["description"],
        "tracks": composed_tracks,
        "track_count": len(composed_tracks),
        "total_duration_seconds": total_duration,
        "crossfade_seconds": crossfade,
        "volume_curve": goal["volume_curve"],
        "hexagram_resonance": solf_freq,
        "tier": tier_key,
    }


@router.get("/mixer/auto-compose/goals")
async def get_auto_compose_goals():
    """List available auto-compose goals."""
    return {
        "goals": [
            {
                "key": k,
                "label": v["label"],
                "description": v["description"],
                "base_duration": v["base_duration"],
            }
            for k, v in AUTO_COMPOSE_GOALS.items()
        ]
    }


@router.post("/mixer/tracks/toggle-lock")
async def toggle_ripple_lock(data: dict = Body(...), user=Depends(get_current_user)):
    """Toggle ripple lock on a track (locked tracks don't shift during ripple edits)."""
    project_id = data.get("project_id", "")
    track_index = data.get("track_index", 0)
    user_id = user["id"]

    project = await db.mixer_projects.find_one(
        {"id": project_id, "user_id": user_id}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tracks = project.get("tracks", [])
    if track_index < 0 or track_index >= len(tracks):
        raise HTTPException(status_code=400, detail="Invalid track index")

    current_lock = tracks[track_index].get("ripple_locked", False)
    tracks[track_index]["ripple_locked"] = not current_lock

    await db.mixer_projects.update_one(
        {"id": project_id, "user_id": user_id},
        {"$set": {"tracks": tracks, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {
        "track_index": track_index,
        "ripple_locked": not current_lock,
    }

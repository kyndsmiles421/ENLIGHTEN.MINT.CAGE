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
        "stock_label": "Basic Tones (12 Presets)",
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
        "stock_label": "Extended Tones & Ambience (80+)",
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
        "stock_label": "3,000+ Sound Effects & Mantras",
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
        "stock_label": "Full Getty/Shutterstock Phonic",
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
    {"feature": "Stock Library", "discovery": "Basic Tones", "player": "Extended (80+)", "ultra_player": "3,000+ Effects", "sovereign": "Full Phonic Library"},
    {"feature": "Rendering", "discovery": "44.1kHz Stereo", "player": "48kHz Hi-Fi", "ultra_player": "88.2kHz Lossless", "sovereign": "96kHz Atmos Spatial"},
    {"feature": "Materialization", "discovery": "15-30s Sacred Assembly", "player": "5-8s Loading", "ultra_player": "2-3s Stabilization", "sovereign": "Instant (GPU Edge)"},
    {"feature": "Keyframe Automation", "discovery": "No", "player": "No", "ultra_player": "Yes", "sovereign": "Yes"},
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
    # Discovery tier — Basic tones
    {"id": "tone-om", "label": "OM (136.1Hz)", "type": "phonic_tone", "frequency": 136.1, "tier": "discovery", "color": "#60A5FA"},
    {"id": "tone-ut", "label": "UT (174Hz)", "type": "phonic_tone", "frequency": 174, "tier": "discovery", "color": "#2DD4BF"},
    {"id": "tone-mi", "label": "MI (528Hz)", "type": "phonic_tone", "frequency": 528, "tier": "discovery", "color": "#22C55E"},
    {"id": "tone-schumann", "label": "Schumann (7.83Hz)", "type": "phonic_tone", "frequency": 7.83, "tier": "discovery", "color": "#EAB308"},

    # Player tier — Extended tones & ambience
    {"id": "tone-re", "label": "RE (285Hz)", "type": "phonic_tone", "frequency": 285, "tier": "player", "color": "#818CF8"},
    {"id": "tone-fa", "label": "FA (639Hz)", "type": "phonic_tone", "frequency": 639, "tier": "player", "color": "#C084FC"},
    {"id": "tone-sol", "label": "SOL (741Hz)", "type": "phonic_tone", "frequency": 741, "tier": "player", "color": "#FB923C"},
    {"id": "amb-forest", "label": "Sacred Forest", "type": "ambience", "tier": "player", "color": "#22C55E"},
    {"id": "amb-rain", "label": "Cosmic Rain", "type": "ambience", "tier": "player", "color": "#3B82F6"},

    # Ultra Player tier — Full effects & mantras
    {"id": "tone-la", "label": "LA (852Hz)", "type": "phonic_tone", "frequency": 852, "tier": "ultra_player", "color": "#FDA4AF"},
    {"id": "amb-temple", "label": "Temple Bells", "type": "ambience", "tier": "ultra_player", "color": "#EAB308"},
    {"id": "amb-singing-bowl", "label": "Singing Bowl Cascade", "type": "ambience", "tier": "ultra_player", "color": "#2DD4BF"},
    {"id": "mantra-so-ham", "label": "So Ham Breath", "type": "mantra", "tier": "ultra_player", "color": "#A78BFA"},
    {"id": "mantra-om-shanti", "label": "Om Shanti Om", "type": "mantra", "tier": "ultra_player", "color": "#60A5FA"},

    # Sovereign tier — Full phonic library
    {"id": "tone-si", "label": "SI (963Hz)", "type": "phonic_tone", "frequency": 963, "tier": "sovereign", "color": "#EF4444"},
    {"id": "tone-celestial", "label": "Celestial Gate (1074Hz)", "type": "phonic_tone", "frequency": 1074, "tier": "sovereign", "color": "#EAB308"},
    {"id": "mantra-om-mani", "label": "Om Mani Padme Hum", "type": "mantra", "tier": "sovereign", "color": "#C084FC"},
    {"id": "mantra-gayatri", "label": "Gayatri Mantra", "type": "mantra", "tier": "sovereign", "color": "#FBBF24"},
    {"id": "amb-cosmos", "label": "Deep Space Resonance", "type": "ambience", "tier": "sovereign", "color": "#818CF8"},
    {"id": "vis-geometry", "label": "Sacred Geometry Visual", "type": "visual", "tier": "sovereign", "color": "#A78BFA"},
    {"id": "vis-mandala", "label": "Living Mandala Pattern", "type": "visual", "tier": "sovereign", "color": "#F472B6"},
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

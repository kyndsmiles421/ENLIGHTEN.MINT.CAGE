"""
Mixer Media & Templates — The Cosmic Collective
Tiered video/audio recording configs, mix templates,
and AI-powered generation endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid
import os
import aiofiles

router = APIRouter()

TIER_ORDER = ["discovery", "player", "ultra_player", "sovereign"]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TIERED VIDEO RECORDING CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIDEO_TIERS = {
    "discovery": {
        "label": "Standard",
        "max_resolution": {"width": 640, "height": 480},
        "res_label": "480p SD",
        "max_fps": 24,
        "max_duration_sec": 60,
        "codec": "vp8",
        "bitrate": 1_000_000,
        "bitrate_label": "1 Mbps",
    },
    "player": {
        "label": "High Definition",
        "max_resolution": {"width": 1280, "height": 720},
        "res_label": "720p HD",
        "max_fps": 30,
        "max_duration_sec": 180,
        "codec": "vp9",
        "bitrate": 2_500_000,
        "bitrate_label": "2.5 Mbps",
    },
    "ultra_player": {
        "label": "Full HD",
        "max_resolution": {"width": 1920, "height": 1080},
        "res_label": "1080p Full HD",
        "max_fps": 60,
        "max_duration_sec": 600,
        "codec": "vp9",
        "bitrate": 8_000_000,
        "bitrate_label": "8 Mbps",
    },
    "sovereign": {
        "label": "Ultra HD 4K",
        "max_resolution": {"width": 3840, "height": 2160},
        "res_label": "4K Ultra HD",
        "max_fps": 60,
        "max_duration_sec": 1800,
        "codec": "vp9",
        "bitrate": 20_000_000,
        "bitrate_label": "20 Mbps",
    },
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TIERED AUDIO RECORDING CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIO_TIERS = {
    "discovery": {
        "label": "Basic Mono",
        "sample_rate": 44100,
        "sample_label": "44.1kHz",
        "channels": 1,
        "channel_label": "Mono",
        "bit_depth": 16,
        "max_duration_sec": 120,
        "codec": "opus",
        "noise_suppression": False,
        "echo_cancellation": True,
    },
    "player": {
        "label": "Stereo HD",
        "sample_rate": 48000,
        "sample_label": "48kHz",
        "channels": 2,
        "channel_label": "Stereo",
        "bit_depth": 16,
        "max_duration_sec": 300,
        "codec": "opus",
        "noise_suppression": True,
        "echo_cancellation": True,
    },
    "ultra_player": {
        "label": "Studio Quality",
        "sample_rate": 96000,
        "sample_label": "96kHz",
        "channels": 2,
        "channel_label": "Stereo",
        "bit_depth": 24,
        "max_duration_sec": 900,
        "codec": "opus",
        "noise_suppression": True,
        "echo_cancellation": True,
    },
    "sovereign": {
        "label": "Mastering Grade",
        "sample_rate": 192000,
        "sample_label": "192kHz",
        "channels": 2,
        "channel_label": "Spatial Stereo",
        "bit_depth": 32,
        "max_duration_sec": 3600,
        "codec": "flac",
        "noise_suppression": True,
        "echo_cancellation": True,
    },
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TIERED AI GENERATION CAPABILITIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI_TIERS = {
    "discovery": {
        "label": "Basic AI",
        "description": "Simple single-track generation",
        "mix_gen": True,
        "video_gen": False,
        "voice_clone": False,
        "max_tracks_gen": 3,
        "credits_per_mix": 1,
        "credits_per_video": 0,
        "quality": "standard",
    },
    "player": {
        "label": "Advanced AI",
        "description": "Multi-track AI mixes with mood detection",
        "mix_gen": True,
        "video_gen": False,
        "voice_clone": False,
        "max_tracks_gen": 6,
        "credits_per_mix": 2,
        "credits_per_video": 0,
        "quality": "high",
    },
    "ultra_player": {
        "label": "Pro AI Studio",
        "description": "AI video synthesis, advanced mixing, style transfer",
        "mix_gen": True,
        "video_gen": True,
        "voice_clone": False,
        "max_tracks_gen": 12,
        "credits_per_mix": 3,
        "credits_per_video": 10,
        "quality": "professional",
    },
    "sovereign": {
        "label": "Sovereign AI Engine",
        "description": "Full AI suite: video, voice cloning, generative visuals, NPU priority",
        "mix_gen": True,
        "video_gen": True,
        "voice_clone": True,
        "max_tracks_gen": 20,
        "credits_per_mix": 3,
        "credits_per_video": 8,
        "quality": "master",
    },
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MIX TEMPLATES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MIX_TEMPLATES = [
    # Discovery
    {
        "id": "tpl-morning-ritual",
        "name": "Morning Ritual",
        "description": "Gentle sunrise sequence — theta to alpha awakening",
        "tier": "discovery",
        "category": "daily",
        "duration_minutes": 15,
        "color": "#FCD34D",
        "tracks": [
            {"source_id": "tone-schumann", "volume": 0.5, "start_time": 0, "duration": 300, "type": "phonic_tone"},
            {"source_id": "amb-crickets", "volume": 0.3, "start_time": 0, "duration": 180, "type": "ambience"},
            {"source_id": "tone-om", "volume": 0.6, "start_time": 120, "duration": 400, "type": "phonic_tone"},
        ],
    },
    {
        "id": "tpl-quick-calm",
        "name": "Quick Calm (5 min)",
        "description": "Fast-acting anxiety relief — Schumann + ocean",
        "tier": "discovery",
        "category": "wellness",
        "duration_minutes": 5,
        "color": "#3B82F6",
        "tracks": [
            {"source_id": "tone-schumann", "volume": 0.6, "start_time": 0, "duration": 300, "type": "phonic_tone"},
            {"source_id": "amb-ocean", "volume": 0.4, "start_time": 0, "duration": 300, "type": "ambience"},
        ],
    },
    {
        "id": "tpl-basic-meditation",
        "name": "Basic Meditation",
        "description": "OM foundation with nature ambience",
        "tier": "discovery",
        "category": "meditation",
        "duration_minutes": 10,
        "color": "#8B5CF6",
        "tracks": [
            {"source_id": "tone-om", "volume": 0.7, "start_time": 0, "duration": 600, "type": "phonic_tone"},
            {"source_id": "amb-wind", "volume": 0.25, "start_time": 0, "duration": 600, "type": "ambience"},
            {"source_id": "mantra-om", "volume": 0.4, "start_time": 60, "duration": 480, "type": "mantra"},
        ],
    },
    # Player
    {
        "id": "tpl-yoga-flow",
        "name": "Yoga Flow (30 min)",
        "description": "Progressive energy build with mantras and forest ambience",
        "tier": "player",
        "category": "movement",
        "duration_minutes": 30,
        "color": "#22C55E",
        "tracks": [
            {"source_id": "tone-om", "volume": 0.5, "start_time": 0, "duration": 600, "type": "phonic_tone"},
            {"source_id": "amb-forest", "volume": 0.3, "start_time": 0, "duration": 1800, "type": "ambience"},
            {"source_id": "tone-mi", "volume": 0.6, "start_time": 300, "duration": 900, "type": "phonic_tone"},
            {"source_id": "mantra-lokah", "volume": 0.35, "start_time": 600, "duration": 600, "type": "mantra"},
            {"source_id": "tone-fa", "volume": 0.55, "start_time": 1200, "duration": 600, "type": "phonic_tone"},
            {"source_id": "mantra-so-ham", "volume": 0.4, "start_time": 1500, "duration": 300, "type": "mantra"},
        ],
    },
    {
        "id": "tpl-study-session",
        "name": "Study Session (45 min)",
        "description": "Alpha-beta focus enhancement for deep concentration",
        "tier": "player",
        "category": "focus",
        "duration_minutes": 45,
        "color": "#60A5FA",
        "tracks": [
            {"source_id": "tone-alpha", "volume": 0.5, "start_time": 0, "duration": 2700, "type": "phonic_tone"},
            {"source_id": "tone-beta", "volume": 0.3, "start_time": 300, "duration": 2400, "type": "phonic_tone"},
            {"source_id": "amb-rain", "volume": 0.25, "start_time": 0, "duration": 2700, "type": "ambience"},
            {"source_id": "tone-mi", "volume": 0.35, "start_time": 0, "duration": 2700, "type": "phonic_tone"},
        ],
    },
    {
        "id": "tpl-evening-unwind",
        "name": "Evening Unwind",
        "description": "Progressive relaxation from alpha down to deep theta",
        "tier": "player",
        "category": "daily",
        "duration_minutes": 20,
        "color": "#A78BFA",
        "tracks": [
            {"source_id": "tone-alpha", "volume": 0.6, "start_time": 0, "duration": 400, "type": "phonic_tone"},
            {"source_id": "amb-stream", "volume": 0.3, "start_time": 0, "duration": 1200, "type": "ambience"},
            {"source_id": "tone-theta", "volume": 0.5, "start_time": 300, "duration": 900, "type": "phonic_tone"},
            {"source_id": "mantra-om-shanti", "volume": 0.35, "start_time": 600, "duration": 600, "type": "mantra"},
            {"source_id": "tone-schumann", "volume": 0.4, "start_time": 900, "duration": 300, "type": "phonic_tone"},
        ],
    },
    # Ultra Player
    {
        "id": "tpl-lucid-dreaming",
        "name": "Lucid Dream Induction",
        "description": "Full solfeggio descent with delta wave foundation and temple resonance",
        "tier": "ultra_player",
        "category": "sleep",
        "duration_minutes": 60,
        "color": "#C084FC",
        "tracks": [
            {"source_id": "tone-deep-delta", "volume": 0.5, "start_time": 0, "duration": 3600, "type": "phonic_tone"},
            {"source_id": "tone-theta", "volume": 0.4, "start_time": 0, "duration": 1800, "type": "phonic_tone"},
            {"source_id": "tone-ut", "volume": 0.3, "start_time": 300, "duration": 1200, "type": "phonic_tone"},
            {"source_id": "amb-temple", "volume": 0.2, "start_time": 0, "duration": 3600, "type": "ambience"},
            {"source_id": "amb-singing-bowl", "volume": 0.25, "start_time": 600, "duration": 1800, "type": "ambience"},
            {"source_id": "tone-pineal", "volume": 0.35, "start_time": 1200, "duration": 1200, "type": "phonic_tone"},
            {"source_id": "mantra-om-mani", "volume": 0.2, "start_time": 1800, "duration": 1200, "type": "mantra"},
            {"source_id": "tone-schumann", "volume": 0.45, "start_time": 2400, "duration": 1200, "type": "phonic_tone"},
        ],
    },
    {
        "id": "tpl-chakra-journey",
        "name": "Chakra Alignment Journey",
        "description": "Progressive solfeggio sequence through all 7 chakras",
        "tier": "ultra_player",
        "category": "healing",
        "duration_minutes": 35,
        "color": "#EF4444",
        "tracks": [
            {"source_id": "tone-ut", "volume": 0.6, "start_time": 0, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-re", "volume": 0.6, "start_time": 250, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-mi", "volume": 0.6, "start_time": 500, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-fa", "volume": 0.6, "start_time": 750, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-sol", "volume": 0.6, "start_time": 1000, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-la", "volume": 0.6, "start_time": 1250, "duration": 300, "type": "phonic_tone"},
            {"source_id": "tone-si", "volume": 0.6, "start_time": 1500, "duration": 300, "type": "phonic_tone"},
            {"source_id": "amb-singing-bowl", "volume": 0.3, "start_time": 0, "duration": 2100, "type": "ambience"},
            {"source_id": "mantra-gayatri", "volume": 0.25, "start_time": 300, "duration": 1500, "type": "mantra"},
        ],
    },
    {
        "id": "tpl-creative-flow",
        "name": "Creative Flow State",
        "description": "Alpha-gamma oscillation for artistic inspiration and flow",
        "tier": "ultra_player",
        "category": "focus",
        "duration_minutes": 40,
        "color": "#F472B6",
        "tracks": [
            {"source_id": "tone-alpha", "volume": 0.45, "start_time": 0, "duration": 2400, "type": "phonic_tone"},
            {"source_id": "tone-gamma", "volume": 0.3, "start_time": 120, "duration": 2280, "type": "phonic_tone"},
            {"source_id": "tone-mi", "volume": 0.4, "start_time": 0, "duration": 2400, "type": "phonic_tone"},
            {"source_id": "amb-rain", "volume": 0.2, "start_time": 0, "duration": 2400, "type": "ambience"},
            {"source_id": "amb-waterfall", "volume": 0.15, "start_time": 600, "duration": 1800, "type": "ambience"},
            {"source_id": "tone-pineal", "volume": 0.25, "start_time": 1200, "duration": 1200, "type": "phonic_tone"},
        ],
    },
    # Sovereign
    {
        "id": "tpl-cosmic-immersion",
        "name": "Cosmic Immersion (2h)",
        "description": "Full planetary frequency journey with 12+ layers and generative flourishes",
        "tier": "sovereign",
        "category": "meditation",
        "duration_minutes": 120,
        "color": "#FBBF24",
        "tracks": [
            {"source_id": "tone-cosmic-om", "volume": 0.5, "start_time": 0, "duration": 7200, "type": "phonic_tone"},
            {"source_id": "tone-sun", "volume": 0.35, "start_time": 0, "duration": 3600, "type": "phonic_tone"},
            {"source_id": "tone-neptune", "volume": 0.3, "start_time": 1800, "duration": 3600, "type": "phonic_tone"},
            {"source_id": "amb-cosmos", "volume": 0.25, "start_time": 0, "duration": 7200, "type": "ambience"},
            {"source_id": "amb-aurora", "volume": 0.2, "start_time": 900, "duration": 5400, "type": "ambience"},
            {"source_id": "amb-cave-crystal", "volume": 0.2, "start_time": 2700, "duration": 3600, "type": "ambience"},
            {"source_id": "tone-deep-delta", "volume": 0.4, "start_time": 3600, "duration": 3600, "type": "phonic_tone"},
            {"source_id": "tone-theta", "volume": 0.35, "start_time": 0, "duration": 3600, "type": "phonic_tone"},
            {"source_id": "mantra-heart-sutra", "volume": 0.25, "start_time": 1200, "duration": 2400, "type": "mantra"},
            {"source_id": "mantra-sat-nam", "volume": 0.3, "start_time": 4200, "duration": 1800, "type": "mantra"},
            {"source_id": "tone-celestial", "volume": 0.3, "start_time": 5400, "duration": 1800, "type": "phonic_tone"},
            {"source_id": "amb-whale-song", "volume": 0.2, "start_time": 5400, "duration": 1800, "type": "ambience"},
        ],
    },
    {
        "id": "tpl-kundalini-rise",
        "name": "Kundalini Awakening",
        "description": "Root-to-crown progressive frequency ascension with sacred mantras",
        "tier": "sovereign",
        "category": "healing",
        "duration_minutes": 45,
        "color": "#EF4444",
        "tracks": [
            {"source_id": "tone-earth", "volume": 0.6, "start_time": 0, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-ut", "volume": 0.55, "start_time": 350, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-re", "volume": 0.55, "start_time": 700, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-mi", "volume": 0.55, "start_time": 1050, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-fa", "volume": 0.55, "start_time": 1400, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-sol", "volume": 0.55, "start_time": 1750, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-la", "volume": 0.55, "start_time": 2100, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-si", "volume": 0.55, "start_time": 2450, "duration": 400, "type": "phonic_tone"},
            {"source_id": "tone-celestial", "volume": 0.5, "start_time": 2500, "duration": 200, "type": "phonic_tone"},
            {"source_id": "mantra-sat-nam", "volume": 0.4, "start_time": 300, "duration": 2000, "type": "mantra"},
            {"source_id": "mantra-adi", "volume": 0.35, "start_time": 1500, "duration": 1200, "type": "mantra"},
            {"source_id": "amb-volcanic", "volume": 0.2, "start_time": 0, "duration": 1200, "type": "ambience"},
            {"source_id": "amb-singing-bowl", "volume": 0.3, "start_time": 600, "duration": 2100, "type": "ambience"},
        ],
    },
    {
        "id": "tpl-astral-projection",
        "name": "Astral Projection Protocol",
        "description": "Binaural delta descent with void frequencies for out-of-body states",
        "tier": "sovereign",
        "category": "sleep",
        "duration_minutes": 90,
        "color": "#818CF8",
        "tracks": [
            {"source_id": "tone-deep-delta", "volume": 0.6, "start_time": 0, "duration": 5400, "type": "phonic_tone"},
            {"source_id": "tone-theta", "volume": 0.45, "start_time": 0, "duration": 2700, "type": "phonic_tone"},
            {"source_id": "tone-schumann", "volume": 0.4, "start_time": 0, "duration": 5400, "type": "phonic_tone"},
            {"source_id": "tone-pineal", "volume": 0.35, "start_time": 600, "duration": 4800, "type": "phonic_tone"},
            {"source_id": "amb-cosmos", "volume": 0.2, "start_time": 0, "duration": 5400, "type": "ambience"},
            {"source_id": "amb-cave-crystal", "volume": 0.15, "start_time": 1200, "duration": 3600, "type": "ambience"},
            {"source_id": "tone-neptune", "volume": 0.25, "start_time": 2700, "duration": 2700, "type": "phonic_tone"},
            {"source_id": "mantra-heart-sutra", "volume": 0.15, "start_time": 1800, "duration": 1800, "type": "mantra"},
        ],
    },
]

TEMPLATE_CATEGORIES = [
    {"id": "daily", "label": "Daily Rituals", "color": "#FCD34D"},
    {"id": "meditation", "label": "Meditation", "color": "#8B5CF6"},
    {"id": "focus", "label": "Focus & Flow", "color": "#60A5FA"},
    {"id": "wellness", "label": "Wellness", "color": "#22C55E"},
    {"id": "movement", "label": "Movement", "color": "#2DD4BF"},
    {"id": "healing", "label": "Healing", "color": "#EF4444"},
    {"id": "sleep", "label": "Sleep & Dreams", "color": "#C084FC"},
]


async def _get_tier(user_id: str) -> str:
    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    return sub.get("tier", "discovery") if sub else "discovery"


# ━━━ RECORDING CONFIG ENDPOINTS ━━━

@router.get("/mixer/recording/config")
async def get_recording_config(user=Depends(get_current_user)):
    """Get tiered recording configuration for camera + mic."""
    tier = await _get_tier(user["id"])
    tier_idx = TIER_ORDER.index(tier) if tier in TIER_ORDER else 0

    # Build comparison across all tiers
    video_comparison = {}
    audio_comparison = {}
    ai_comparison = {}
    for t in TIER_ORDER:
        v = VIDEO_TIERS[t]
        a = AUDIO_TIERS[t]
        ai = AI_TIERS[t]
        video_comparison[t] = {
            "res_label": v["res_label"],
            "max_fps": v["max_fps"],
            "max_duration": f"{v['max_duration_sec'] // 60} min",
            "bitrate_label": v["bitrate_label"],
        }
        audio_comparison[t] = {
            "sample_label": a["sample_label"],
            "channel_label": a["channel_label"],
            "max_duration": f"{a['max_duration_sec'] // 60} min",
            "bit_depth": f"{a['bit_depth']}-bit",
        }
        ai_comparison[t] = {
            "label": ai["label"],
            "mix_gen": ai["mix_gen"],
            "video_gen": ai["video_gen"],
            "voice_clone": ai["voice_clone"],
            "max_tracks": ai["max_tracks_gen"],
            "quality": ai["quality"],
        }

    return {
        "tier": tier,
        "video": VIDEO_TIERS[tier],
        "audio": AUDIO_TIERS[tier],
        "ai": AI_TIERS[tier],
        "video_comparison": video_comparison,
        "audio_comparison": audio_comparison,
        "ai_comparison": ai_comparison,
        "all_video_tiers": VIDEO_TIERS,
        "all_audio_tiers": AUDIO_TIERS,
        "all_ai_tiers": AI_TIERS,
    }


@router.post("/mixer/recording/upload")
async def upload_recording(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """Upload a recorded video or audio file."""
    user_id = user["id"]
    tier = await _get_tier(user_id)

    ext = file.filename.split(".")[-1] if file.filename else "webm"
    is_video = ext in ("webm", "mp4", "mkv", "mov")
    media_type = "video" if is_video else "audio"

    file_id = str(uuid.uuid4())[:12]
    filename = f"{user_id}_{file_id}.{ext}"
    subdir = "video" if is_video else "audio"
    save_path = f"/app/backend/static/uploads/{subdir}/{filename}"

    size = 0
    max_size = 100 * 1024 * 1024 if tier in ("ultra_player", "sovereign") else 25 * 1024 * 1024

    async with aiofiles.open(save_path, "wb") as f:
        while True:
            chunk = await file.read(1024 * 256)
            if not chunk:
                break
            size += len(chunk)
            if size > max_size:
                os.remove(save_path)
                raise HTTPException(400, f"File too large. Max {max_size // (1024*1024)}MB for {tier}")
            await f.write(chunk)

    record = {
        "id": file_id,
        "user_id": user_id,
        "type": media_type,
        "filename": filename,
        "url": f"/api/static/uploads/{subdir}/{filename}",
        "size_bytes": size,
        "tier_recorded": tier,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.mixer_recordings.insert_one(record)

    return {
        "id": file_id,
        "type": media_type,
        "url": record["url"],
        "size_bytes": size,
    }


@router.get("/mixer/recordings")
async def list_recordings(user=Depends(get_current_user)):
    """List user's recorded media files."""
    cursor = db.mixer_recordings.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50)
    recordings = await cursor.to_list(50)
    return {"recordings": recordings}


# ━━━ TEMPLATE ENDPOINTS ━━━

@router.get("/mixer/templates")
async def list_templates(user=Depends(get_current_user)):
    """List available mix templates, tier-gated."""
    tier = await _get_tier(user["id"])
    tier_idx = TIER_ORDER.index(tier) if tier in TIER_ORDER else 0

    templates = []
    for tpl in MIX_TEMPLATES:
        tpl_tier_idx = TIER_ORDER.index(tpl["tier"]) if tpl["tier"] in TIER_ORDER else 0
        templates.append({
            "id": tpl["id"],
            "name": tpl["name"],
            "description": tpl["description"],
            "tier": tpl["tier"],
            "category": tpl["category"],
            "duration_minutes": tpl["duration_minutes"],
            "track_count": len(tpl["tracks"]),
            "color": tpl["color"],
            "locked": tier_idx < tpl_tier_idx,
        })

    return {
        "templates": templates,
        "categories": TEMPLATE_CATEGORIES,
        "user_tier": tier,
    }


@router.post("/mixer/templates/apply")
async def apply_template(data: dict = Body(...), user=Depends(get_current_user)):
    """Apply a mix template to create tracks."""
    template_id = data.get("template_id")
    tier = await _get_tier(user["id"])
    tier_idx = TIER_ORDER.index(tier) if tier in TIER_ORDER else 0

    tpl = next((t for t in MIX_TEMPLATES if t["id"] == template_id), None)
    if not tpl:
        raise HTTPException(404, "Template not found")

    tpl_tier_idx = TIER_ORDER.index(tpl["tier"]) if tpl["tier"] in TIER_ORDER else 0
    if tier_idx < tpl_tier_idx:
        raise HTTPException(403, f"Template requires {tpl['tier']} tier or higher")

    tracks = []
    for t in tpl["tracks"]:
        tracks.append({
            "type": t["type"],
            "source_id": t["source_id"],
            "source_label": t.get("source_label", t["source_id"].replace("-", " ").replace("_", " ").title()),
            "volume": t["volume"],
            "muted": False,
            "solo": False,
            "start_time": t["start_time"],
            "duration": t["duration"],
            "color": "#94A3B8",
            "locked": False,
            "ripple_locked": False,
        })

    return {
        "template_id": template_id,
        "template_name": tpl["name"],
        "tracks": tracks,
        "track_count": len(tracks),
    }


# ━━━ AI GENERATION ENDPOINTS ━━━

@router.post("/mixer/ai/generate-mix")
async def ai_generate_mix(data: dict = Body(...), user=Depends(get_current_user)):
    """AI-generated mix based on a text prompt."""
    user_id = user["id"]
    tier = await _get_tier(user_id)
    ai_config = AI_TIERS.get(tier, AI_TIERS["discovery"])

    prompt = data.get("prompt", "relaxation")
    duration_minutes = data.get("duration_minutes", 10)

    sub = await db.mixer_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    credits = sub.get("ai_credits_remaining", 0) if sub else 0
    cost = ai_config["credits_per_mix"]

    if credits < cost:
        raise HTTPException(402, f"Insufficient AI credits. Need {cost}, have {credits}")

    max_tracks = ai_config["max_tracks_gen"]

    # Use Gemini to generate a smart mix arrangement
    try:
        from emergentintegrations.llm.gemini import GeminiChat, GeminiConfig
        gemini_key = os.environ.get("EMERGENT_LLM_KEY", "")
        if gemini_key:
            chat = GeminiChat(
                config=GeminiConfig(api_key=gemini_key, model="gemini-2.5-flash"),
            )
            from deps import SOLFEGGIO
            source_list = ", ".join([f"{s['id']}({s['label']})" for s in _get_stock_sources()[:30]])

            system_prompt = f"""You are a wellness sound engineer. Given a user prompt, create a JSON track arrangement.
Available sources: {source_list}
Max tracks: {max_tracks}. Duration: {duration_minutes} minutes ({duration_minutes * 60} seconds).
Return ONLY valid JSON array of objects with keys: source_id, volume (0-1), start_time (seconds), duration (seconds), type (phonic_tone/ambience/mantra/visual).
Layer tracks with overlapping start times for richness. Use volume dynamics."""

            response = await chat.send_message(
                f"Create a {duration_minutes}-minute mix for: {prompt}",
                system_prompt=system_prompt,
            )

            # Parse AI response
            import json, re
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                ai_tracks = json.loads(json_match.group())
                tracks = []
                for t in ai_tracks[:max_tracks]:
                    tracks.append({
                        "type": t.get("type", "phonic_tone"),
                        "source_id": t.get("source_id", "tone-om"),
                        "source_label": t.get("source_id", "").replace("-", " ").replace("_", " ").title(),
                        "volume": min(1, max(0, float(t.get("volume", 0.5)))),
                        "muted": False,
                        "solo": False,
                        "start_time": max(0, int(t.get("start_time", 0))),
                        "duration": max(10, int(t.get("duration", 60))),
                        "color": "#94A3B8",
                        "locked": False,
                        "ripple_locked": False,
                    })

                await db.mixer_subscriptions.update_one(
                    {"user_id": user_id},
                    {"$inc": {"ai_credits_remaining": -cost}}
                )

                return {
                    "tracks": tracks,
                    "track_count": len(tracks),
                    "prompt": prompt,
                    "credits_used": cost,
                    "ai_quality": ai_config["quality"],
                    "generated_by": "gemini",
                }
    except Exception as e:
        logger.error(f"AI mix generation error: {e}")

    # Fallback: algorithmic generation
    from routes.mixer_director import STOCK_SOURCES, TIER_ORDER as MT_ORDER
    import random
    tier_idx = TIER_ORDER.index(tier) if tier in TIER_ORDER else 0
    available = [s for s in STOCK_SOURCES if TIER_ORDER.index(s["tier"]) <= tier_idx]
    selected = random.sample(available, min(max_tracks, len(available)))

    tracks = []
    total_sec = duration_minutes * 60
    for i, s in enumerate(selected):
        tracks.append({
            "type": s["type"],
            "source_id": s["id"],
            "source_label": s["label"],
            "volume": round(0.3 + random.random() * 0.5, 2),
            "muted": False,
            "solo": False,
            "start_time": max(0, i * (total_sec // max_tracks) - random.randint(0, 30)),
            "duration": max(30, total_sec // 2 + random.randint(-60, 60)),
            "color": s.get("color", "#94A3B8"),
            "locked": False,
            "ripple_locked": False,
        })

    await db.mixer_subscriptions.update_one(
        {"user_id": user_id},
        {"$inc": {"ai_credits_remaining": -cost}}
    )

    return {
        "tracks": tracks,
        "track_count": len(tracks),
        "prompt": prompt,
        "credits_used": cost,
        "ai_quality": ai_config["quality"],
        "generated_by": "algorithmic",
    }


@router.get("/mixer/ai/capabilities")
async def ai_capabilities(user=Depends(get_current_user)):
    """Get AI capabilities for user's tier."""
    tier = await _get_tier(user["id"])
    sub = await db.mixer_subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    credits = sub.get("ai_credits_remaining", 0) if sub else 0

    return {
        "tier": tier,
        "capabilities": AI_TIERS.get(tier, AI_TIERS["discovery"]),
        "credits_remaining": credits,
        "all_tiers": AI_TIERS,
    }


def _get_stock_sources():
    from routes.mixer_director import STOCK_SOURCES
    return STOCK_SOURCES

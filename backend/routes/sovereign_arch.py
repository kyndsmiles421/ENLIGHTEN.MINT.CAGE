"""
SOVEREIGN ARCHITECTURE — The Cosmic Collective
Master 4-Tier Subscription Model with Cross-Tier Purchasing,
Glass Box Thinking Feed, Agent Coordination, and Tool Gating.

Standard (The Seed) → Apprentice (The Bloom) →
Artisan (The Architect) → Sovereign (The Super User)
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  THE SOVEREIGN ARCHITECTURE: 4-TIER MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOVEREIGN_TIERS = {
    "standard": {
        "name": "Standard",
        "codename": "The Seed",
        "persona": "Casual Observer / New User",
        "price_monthly": 0,
        "ai_brain": "Single-Node Logic",
        "ai_description": "Standard chatbot interaction (text-only)",
        "experience": {
            "visuals": "1080p",
            "audio": "Standard Stereo (440Hz)",
            "audio_label": "44.1kHz Stereo",
        },
        "tools_count": 3,
        "tools_access": ["daily_transit", "basic_recipe", "mood_tracker"],
        "tool_label": "3 Basic Wellness Tools",
        "thinking_feed": False,
        "asset_generation": False,
        "agent_coordination": False,
        "browser_automation": False,
        "marketplace_discount": 0,
        "credits_monthly": 50,
        "mixer_layer_cap": 3,
        "mixer_ai_credits": 5,
        "video_resolution": {"width": 1920, "height": 1080, "label": "1080p"},
        "video_fps": 30,
        "audio_sample_rate": 44100,
        "audio_channels": 1,
        "audio_bit_depth": 16,
        "cosmic_dust_rewards": False,
        "speed_bridge": False,
        "perks": [
            "1080p visuals, standard stereo audio",
            "3 basic wellness tools",
            "50 AI credits/month",
            "3 mixer tracks",
            "Basic star chart & mood tracking",
            "Community access",
        ],
        # Legacy mapping
        "legacy_sub_id": "free",
        "legacy_mixer_id": "discovery",
    },
    "apprentice": {
        "name": "Apprentice",
        "codename": "The Bloom",
        "persona": "Active Student / Emerging Creator",
        "price_monthly": 9.99,
        "ai_brain": "Multi-Node Logic",
        "ai_description": "Glass Box Thinking Feed — see how AI maps sacred geometry to your queries",
        "experience": {
            "visuals": "1440p Enhanced",
            "audio": "Solfeggio-tuned Spatial Audio",
            "audio_label": "48kHz Spatial",
        },
        "tools_count": 12,
        "tools_access": [
            "daily_transit", "basic_recipe", "mood_tracker",
            "star_chart", "breathing", "journal", "meditation",
            "cosmic_mixer", "trade_circle", "dream_journal",
            "oracle_reading", "hexagram",
        ],
        "tool_label": "12 Integrated Tools + Thinking Feed",
        "thinking_feed": True,
        "asset_generation": False,
        "agent_coordination": False,
        "browser_automation": False,
        "marketplace_discount": 0,
        "credits_monthly": 150,
        "mixer_layer_cap": 8,
        "mixer_ai_credits": 40,
        "video_resolution": {"width": 2560, "height": 1440, "label": "1440p"},
        "video_fps": 30,
        "audio_sample_rate": 48000,
        "audio_channels": 2,
        "audio_bit_depth": 16,
        "cosmic_dust_rewards": True,
        "speed_bridge": False,
        "perks": [
            "Enhanced UI with visible 'logic layers'",
            "Glass Box Thinking Feed (see AI reasoning)",
            "Solfeggio-tuned Spatial Audio",
            "12 integrated tools",
            "Cosmic Dust currency rewards",
            "150 AI credits/month",
            "8 mixer tracks",
            "Extended Oracle Sessions",
            "Ad-free experience",
        ],
        "legacy_sub_id": "plus",
        "legacy_mixer_id": "player",
    },
    "artisan": {
        "name": "Artisan",
        "codename": "The Architect",
        "persona": "Professional User / Business Builder",
        "price_monthly": 24.99,
        "ai_brain": "Collaborative Agents",
        "ai_description": "Alpha/Beta/Gamma agents coordinate to solve complex problems",
        "experience": {
            "visuals": "2K Professional",
            "audio": "Lossless Hi-Fi",
            "audio_label": "96kHz Lossless",
        },
        "tools_count": -1,
        "tools_access": "unlimited",
        "tool_label": "Unlimited Tools + Asset Export",
        "thinking_feed": True,
        "asset_generation": True,
        "agent_coordination": True,
        "browser_automation": False,
        "marketplace_discount": 15,
        "credits_monthly": 500,
        "mixer_layer_cap": 20,
        "mixer_ai_credits": 150,
        "video_resolution": {"width": 2560, "height": 1440, "label": "2K"},
        "video_fps": 60,
        "audio_sample_rate": 96000,
        "audio_channels": 2,
        "audio_bit_depth": 24,
        "cosmic_dust_rewards": True,
        "speed_bridge": False,
        "perks": [
            "Collaborative AI Agents (Alpha/Beta/Gamma)",
            "Asset Export (PDF plans, WAV tracks)",
            "2K visuals, lossless audio",
            "15% Trade Circle marketplace discount",
            "Unlimited tool access",
            "500 AI credits/month (or unlimited)",
            "20 mixer tracks + keyframe automation",
            "High-performance culinary & engineering modules",
            "Cosmic Blueprint Reports",
        ],
        "legacy_sub_id": "premium",
        "legacy_mixer_id": "ultra_player",
    },
    "sovereign": {
        "name": "Sovereign",
        "codename": "The Super User",
        "persona": "The Master / Digital Sovereign",
        "price_monthly": 49.99,
        "ai_brain": "Autonomous Master",
        "ai_description": "Full Browser Automation, GPS Logic, and Zero-Touch Automation",
        "experience": {
            "visuals": "4K Ultra-Cinematic",
            "audio": "Lossless 8D Binaural + NPU Priority",
            "audio_label": "192kHz 8D Binaural",
        },
        "tools_count": -1,
        "tools_access": "unlimited",
        "tool_label": "Full Autonomous Suite + Zero-Touch",
        "thinking_feed": True,
        "asset_generation": True,
        "agent_coordination": True,
        "browser_automation": True,
        "marketplace_discount": 30,
        "credits_monthly": -1,
        "mixer_layer_cap": -1,
        "mixer_ai_credits": 250,
        "video_resolution": {"width": 3840, "height": 2160, "label": "4K"},
        "video_fps": 60,
        "audio_sample_rate": 192000,
        "audio_channels": 2,
        "audio_bit_depth": 32,
        "cosmic_dust_rewards": True,
        "speed_bridge": True,
        "perks": [
            "Autonomous Master AI — acts on your behalf",
            "Zero-Touch Automation (GPS, permits, trades)",
            "4K Ultra-Cinematic visuals",
            "Lossless 8D Binaural audio + NPU Priority",
            "30% Trade Circle marketplace discount",
            "Speed Bridge instant-access features",
            "Unlimited AI usage",
            "Unlimited mixer tracks + nested projects",
            "Voice cloning & generative AI",
            "White-label reports, API access",
            "Priority support, founding member pricing",
        ],
        "legacy_sub_id": "super_user",
        "legacy_mixer_id": "sovereign",
    },
}

SOVEREIGN_TIER_ORDER = ["standard", "apprentice", "artisan", "sovereign"]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CROSS-TIER PURCHASABLE UNITS
#  Lower tiers can buy individual features from higher tiers
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CROSS_TIER_UNITS = [
    # Apprentice features purchasable by Standard
    {
        "id": "unit-thinking-feed",
        "name": "Glass Box Thinking Feed",
        "description": "See how AI maps sacred geometry to your queries — 30-day access",
        "from_tier": "apprentice",
        "price_credits": 25,
        "price_usd": 2.99,
        "duration_days": 30,
        "feature_key": "thinking_feed",
        "available_to": ["standard"],
    },
    {
        "id": "unit-spatial-audio",
        "name": "Solfeggio Spatial Audio Pack",
        "description": "Unlock 48kHz spatial audio for 30 days",
        "from_tier": "apprentice",
        "price_credits": 20,
        "price_usd": 1.99,
        "duration_days": 30,
        "feature_key": "spatial_audio",
        "available_to": ["standard"],
    },
    {
        "id": "unit-extra-tools-6",
        "name": "Tool Expansion (+6 Tools)",
        "description": "Access 6 additional tools for 30 days",
        "from_tier": "apprentice",
        "price_credits": 15,
        "price_usd": 1.49,
        "duration_days": 30,
        "feature_key": "extra_tools_6",
        "available_to": ["standard"],
    },
    {
        "id": "unit-cosmic-dust",
        "name": "Cosmic Dust Rewards",
        "description": "Earn Cosmic Dust currency for 30 days of engagement",
        "from_tier": "apprentice",
        "price_credits": 10,
        "price_usd": 0.99,
        "duration_days": 30,
        "feature_key": "cosmic_dust_rewards",
        "available_to": ["standard"],
    },
    # Artisan features purchasable by Standard + Apprentice
    {
        "id": "unit-agent-session",
        "name": "Agent Coordination Session (x3)",
        "description": "3 collaborative AI agent sessions (Alpha/Beta/Gamma)",
        "from_tier": "artisan",
        "price_credits": 40,
        "price_usd": 4.99,
        "duration_days": 0,
        "uses": 3,
        "feature_key": "agent_session",
        "available_to": ["standard", "apprentice"],
    },
    {
        "id": "unit-asset-export",
        "name": "Asset Export Pack (5 exports)",
        "description": "Generate 5 downloadable assets (PDF plans, WAV tracks)",
        "from_tier": "artisan",
        "price_credits": 30,
        "price_usd": 3.99,
        "duration_days": 0,
        "uses": 5,
        "feature_key": "asset_export",
        "available_to": ["standard", "apprentice"],
    },
    {
        "id": "unit-2k-visuals",
        "name": "2K Visual Upgrade",
        "description": "Enhanced 2K resolution visuals for 30 days",
        "from_tier": "artisan",
        "price_credits": 35,
        "price_usd": 3.49,
        "duration_days": 30,
        "feature_key": "2k_visuals",
        "available_to": ["standard", "apprentice"],
    },
    {
        "id": "unit-marketplace-15",
        "name": "Trade Circle 15% Discount",
        "description": "15% discount on all Trade Circle purchases for 30 days",
        "from_tier": "artisan",
        "price_credits": 20,
        "price_usd": 2.49,
        "duration_days": 30,
        "feature_key": "marketplace_discount_15",
        "available_to": ["standard", "apprentice"],
    },
    # Sovereign features purchasable by all lower tiers
    {
        "id": "unit-4k-session",
        "name": "4K Ultra Session (24h)",
        "description": "Experience 4K Ultra-Cinematic visuals for 24 hours",
        "from_tier": "sovereign",
        "price_credits": 50,
        "price_usd": 5.99,
        "duration_days": 1,
        "feature_key": "4k_session",
        "available_to": ["standard", "apprentice", "artisan"],
    },
    {
        "id": "unit-npu-burst",
        "name": "NPU Priority Burst (1h)",
        "description": "1 hour of NPU priority processing for near-instant results",
        "from_tier": "sovereign",
        "price_credits": 30,
        "price_usd": 3.99,
        "duration_days": 0,
        "duration_hours": 1,
        "feature_key": "npu_burst",
        "available_to": ["standard", "apprentice", "artisan"],
    },
    {
        "id": "unit-8d-binaural",
        "name": "8D Binaural Audio Session",
        "description": "192kHz 8D Binaural audio for a single session",
        "from_tier": "sovereign",
        "price_credits": 25,
        "price_usd": 2.99,
        "duration_days": 0,
        "uses": 1,
        "feature_key": "8d_binaural",
        "available_to": ["standard", "apprentice", "artisan"],
    },
    {
        "id": "unit-zero-touch-trial",
        "name": "Zero-Touch Automation Trial (7 days)",
        "description": "AI acts on your behalf — GPS monitoring, trade automation",
        "from_tier": "sovereign",
        "price_credits": 75,
        "price_usd": 7.99,
        "duration_days": 7,
        "feature_key": "zero_touch",
        "available_to": ["standard", "apprentice", "artisan"],
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GLASS BOX THINKING FEED — AI REASONING CHAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGENT_PERSONAS = {
    "alpha": {
        "name": "Agent Alpha",
        "role": "Geometer",
        "description": "Mapping UI/UX and Sacred Geometry patterns",
        "color": "#8B5CF6",
        "icon": "compass",
    },
    "beta": {
        "name": "Agent Beta",
        "role": "Harmonizer",
        "description": "Aligning Solfeggio Frequencies (Hz) and resonance patterns",
        "color": "#2DD4BF",
        "icon": "music",
    },
    "gamma": {
        "name": "Agent Gamma",
        "role": "Logistics",
        "description": "Calculating GPS, local data, permits, and inventory",
        "color": "#F59E0B",
        "icon": "map-pin",
    },
}


async def _get_sovereign_tier(user_id: str) -> str:
    """Get user's current Sovereign Architecture tier."""
    doc = await db.sovereign_subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    if doc:
        return doc.get("tier", "standard")
    # Check legacy subscriptions
    legacy = await db.user_credits.find_one({"user_id": user_id}, {"_id": 0})
    if legacy:
        legacy_tier = legacy.get("tier", "free")
        mapping = {"free": "standard", "starter": "standard", "plus": "apprentice", "premium": "artisan", "super_user": "sovereign"}
        return mapping.get(legacy_tier, "standard")
    return "standard"


async def _get_active_units(user_id: str) -> list:
    """Get user's purchased cross-tier units that are still active."""
    now = datetime.now(timezone.utc).isoformat()
    cursor = db.cross_tier_purchases.find({
        "user_id": user_id,
        "$or": [
            {"expires_at": {"$gt": now}},
            {"uses_remaining": {"$gt": 0}},
            {"permanent": True},
        ],
    }, {"_id": 0})
    return await cursor.to_list(50)


# ━━━ ENDPOINTS ━━━

@router.get("/sovereign/status")
async def sovereign_status(user=Depends(get_current_user)):
    """Get complete Sovereign Architecture status for current user."""
    user_id = user["id"]
    tier = await _get_sovereign_tier(user_id)
    tier_config = SOVEREIGN_TIERS.get(tier, SOVEREIGN_TIERS["standard"])
    tier_idx = SOVEREIGN_TIER_ORDER.index(tier) if tier in SOVEREIGN_TIER_ORDER else 0

    active_units = await _get_active_units(user_id)
    active_features = {u["feature_key"] for u in active_units}

    # Effective capabilities (tier + purchased units)
    effective = {
        "thinking_feed": tier_config["thinking_feed"] or "thinking_feed" in active_features,
        "asset_generation": tier_config["asset_generation"] or "asset_export" in active_features,
        "agent_coordination": tier_config["agent_coordination"] or "agent_session" in active_features,
        "browser_automation": tier_config["browser_automation"] or "zero_touch" in active_features,
        "cosmic_dust_rewards": tier_config["cosmic_dust_rewards"] or "cosmic_dust_rewards" in active_features,
        "spatial_audio": tier in ("apprentice", "artisan", "sovereign") or "spatial_audio" in active_features,
        "npu_priority": tier == "sovereign" or "npu_burst" in active_features,
        "marketplace_discount": tier_config["marketplace_discount"],
    }
    # Boost discount from purchased units
    if "marketplace_discount_15" in active_features and effective["marketplace_discount"] < 15:
        effective["marketplace_discount"] = 15

    return {
        "tier": tier,
        "tier_name": tier_config["name"],
        "codename": tier_config["codename"],
        "persona": tier_config["persona"],
        "price_monthly": tier_config["price_monthly"],
        "ai_brain": tier_config["ai_brain"],
        "ai_description": tier_config["ai_description"],
        "experience": tier_config["experience"],
        "tools_count": tier_config["tools_count"],
        "tool_label": tier_config["tool_label"],
        "perks": tier_config["perks"],
        "effective_capabilities": effective,
        "active_units": active_units,
        "active_unit_count": len(active_units),
    }


@router.get("/sovereign/tiers")
async def sovereign_tiers():
    """Full Sovereign Architecture tier comparison."""
    tiers = []
    for key in SOVEREIGN_TIER_ORDER:
        t = SOVEREIGN_TIERS[key]
        tiers.append({
            "id": key,
            "name": t["name"],
            "codename": t["codename"],
            "persona": t["persona"],
            "price_monthly": t["price_monthly"],
            "ai_brain": t["ai_brain"],
            "ai_description": t["ai_description"],
            "experience": t["experience"],
            "tools_count": t["tools_count"],
            "tool_label": t["tool_label"],
            "thinking_feed": t["thinking_feed"],
            "asset_generation": t["asset_generation"],
            "agent_coordination": t["agent_coordination"],
            "browser_automation": t["browser_automation"],
            "marketplace_discount": t["marketplace_discount"],
            "credits_monthly": t["credits_monthly"],
            "mixer_layer_cap": t["mixer_layer_cap"],
            "mixer_ai_credits": t["mixer_ai_credits"],
            "speed_bridge": t["speed_bridge"],
            "perks": t["perks"],
        })

    comparison = [
        {"feature": "AI Brain", "standard": "Single-Node Logic", "apprentice": "Multi-Node + Glass Box", "artisan": "Collaborative Agents (α/β/γ)", "sovereign": "Autonomous Master"},
        {"feature": "Visuals", "standard": "1080p", "apprentice": "1440p Enhanced", "artisan": "2K Professional", "sovereign": "4K Ultra-Cinematic"},
        {"feature": "Audio", "standard": "Stereo (440Hz)", "apprentice": "Solfeggio Spatial", "artisan": "Lossless Hi-Fi", "sovereign": "8D Binaural + NPU"},
        {"feature": "Tools", "standard": "3 Basic", "apprentice": "12 Integrated", "artisan": "Unlimited + Export", "sovereign": "Full Autonomous Suite"},
        {"feature": "AI Credits", "standard": "50/mo", "apprentice": "150/mo", "artisan": "500/mo", "sovereign": "Unlimited"},
        {"feature": "Thinking Feed", "standard": "No", "apprentice": "Yes (Glass Box)", "artisan": "Yes + Agents", "sovereign": "Yes + Autonomous"},
        {"feature": "Asset Export", "standard": "No", "apprentice": "No", "artisan": "PDF, WAV, Reports", "sovereign": "Full + White-Label"},
        {"feature": "Marketplace", "standard": "0%", "apprentice": "0%", "artisan": "15% Discount", "sovereign": "30% Discount"},
        {"feature": "Mixer Tracks", "standard": "3", "apprentice": "8", "artisan": "20 + Keyframes", "sovereign": "Unlimited + Nested"},
        {"feature": "Video Recording", "standard": "1080p 30fps", "apprentice": "1440p 30fps", "artisan": "2K 60fps", "sovereign": "4K 60fps"},
        {"feature": "Audio Recording", "standard": "44.1kHz Mono", "apprentice": "48kHz Stereo", "artisan": "96kHz Lossless", "sovereign": "192kHz 8D Binaural"},
        {"feature": "Speed Bridge", "standard": "No", "apprentice": "No", "artisan": "No", "sovereign": "Instant Access"},
        {"feature": "Automation", "standard": "No", "apprentice": "No", "artisan": "No", "sovereign": "Zero-Touch (GPS, Trades)"},
    ]

    return {"tiers": tiers, "comparison": comparison, "agents": AGENT_PERSONAS}


@router.get("/sovereign/units")
async def list_cross_tier_units(user=Depends(get_current_user)):
    """List available cross-tier units for purchase."""
    user_id = user["id"]
    tier = await _get_sovereign_tier(user_id)
    active_units = await _get_active_units(user_id)
    active_keys = {u["feature_key"] for u in active_units}

    available = []
    for unit in CROSS_TIER_UNITS:
        if tier in unit["available_to"]:
            available.append({
                **{k: v for k, v in unit.items() if k != "available_to"},
                "already_active": unit["feature_key"] in active_keys,
            })

    return {
        "units": available,
        "user_tier": tier,
        "active_count": len(active_units),
    }


@router.post("/sovereign/units/purchase")
async def purchase_cross_tier_unit(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a cross-tier unit with credits."""
    user_id = user["id"]
    unit_id = data.get("unit_id")
    tier = await _get_sovereign_tier(user_id)

    unit = next((u for u in CROSS_TIER_UNITS if u["id"] == unit_id), None)
    if not unit:
        raise HTTPException(404, "Unit not found")

    if tier not in unit["available_to"]:
        raise HTTPException(403, f"Already included in your {SOVEREIGN_TIERS[tier]['name']} tier")

    # Check credits
    credits_doc = await db.user_credits.find_one({"user_id": user_id}, {"_id": 0})
    balance = credits_doc.get("balance", 0) if credits_doc else 0
    cost = unit["price_credits"]

    if balance < cost:
        raise HTTPException(402, f"Insufficient credits. Need {cost}, have {balance}")

    # Deduct credits
    await db.user_credits.update_one(
        {"user_id": user_id},
        {"$inc": {"balance": -cost}}
    )

    now = datetime.now(timezone.utc)
    purchase = {
        "id": str(uuid.uuid4())[:12],
        "user_id": user_id,
        "unit_id": unit_id,
        "unit_name": unit["name"],
        "feature_key": unit["feature_key"],
        "from_tier": unit["from_tier"],
        "credits_paid": cost,
        "purchased_at": now.isoformat(),
    }

    if unit.get("duration_days", 0) > 0:
        from datetime import timedelta
        purchase["expires_at"] = (now + timedelta(days=unit["duration_days"])).isoformat()
    elif unit.get("duration_hours", 0) > 0:
        from datetime import timedelta
        purchase["expires_at"] = (now + timedelta(hours=unit["duration_hours"])).isoformat()
    elif unit.get("uses", 0) > 0:
        purchase["uses_remaining"] = unit["uses"]
    else:
        purchase["permanent"] = True

    await db.cross_tier_purchases.insert_one(purchase)

    return {
        "purchase_id": purchase["id"],
        "unit_name": unit["name"],
        "feature_key": unit["feature_key"],
        "credits_paid": cost,
        "remaining_balance": balance - cost,
        "expires_at": purchase.get("expires_at"),
        "uses_remaining": purchase.get("uses_remaining"),
    }


# ━━━ GLASS BOX THINKING FEED ━━━

@router.post("/sovereign/thinking-feed")
async def thinking_feed(data: dict = Body(...), user=Depends(get_current_user)):
    """Glass Box Thinking Feed — shows AI reasoning chain.
    Available to Apprentice+ or Standard with purchased unit."""
    user_id = user["id"]
    tier = await _get_sovereign_tier(user_id)
    tier_config = SOVEREIGN_TIERS.get(tier, SOVEREIGN_TIERS["standard"])

    active_units = await _get_active_units(user_id)
    has_thinking = tier_config["thinking_feed"] or any(u["feature_key"] == "thinking_feed" for u in active_units)
    has_agents = tier_config["agent_coordination"] or any(u["feature_key"] == "agent_session" for u in active_units)

    if not has_thinking:
        raise HTTPException(403, "Glass Box Thinking Feed requires Apprentice tier or purchased unit")

    query = data.get("query", "")
    task_type = data.get("task_type", "general")

    # Build the thinking chain
    chain = []

    # Agent Alpha — Geometer
    chain.append({
        "agent": "alpha",
        "name": "Agent Alpha",
        "role": "Geometer",
        "status": "sync",
        "color": "#8B5CF6",
        "thought": f"Mapping sacred geometry patterns for: '{query[:60]}...'",
        "layers": [
            {"type": "geometry", "label": "Fibonacci Sequence Alignment", "value": "Detected", "confidence": 0.87},
            {"type": "pattern", "label": "Golden Ratio Position", "value": "φ = 1.618", "confidence": 0.92},
            {"type": "visual", "label": "Mandala Resonance", "value": "Tier 3 Complexity", "confidence": 0.78},
        ],
    })

    # Agent Beta — Harmonizer
    chain.append({
        "agent": "beta",
        "name": "Agent Beta",
        "role": "Harmonizer",
        "status": "sync",
        "color": "#2DD4BF",
        "thought": f"Aligning Solfeggio frequencies for resonance matching...",
        "layers": [
            {"type": "frequency", "label": "Primary Resonance", "value": "528Hz (MI — Transformation)", "confidence": 0.95},
            {"type": "harmonic", "label": "Harmonic Overtone", "value": "1056Hz (Octave)", "confidence": 0.88},
            {"type": "chakra", "label": "Chakra Alignment", "value": "Heart (Anahata)", "confidence": 0.82},
        ],
    })

    # Agent Gamma — Logistics (only for Artisan+)
    if has_agents:
        chain.append({
            "agent": "gamma",
            "name": "Agent Gamma",
            "role": "Logistics",
            "status": "sync",
            "color": "#F59E0B",
            "thought": f"Calculating contextual logistics and environmental data...",
            "layers": [
                {"type": "location", "label": "Contextual Environment", "value": "Optimized", "confidence": 0.84},
                {"type": "temporal", "label": "Temporal Alignment", "value": datetime.now(timezone.utc).strftime("%H:%M UTC"), "confidence": 0.99},
                {"type": "resource", "label": "Resource Optimization", "value": "Within Budget", "confidence": 0.91},
            ],
        })

    # Generate AI response using thinking chain
    ai_response = None
    try:
        from emergentintegrations.llm.gemini import GeminiChat, GeminiConfig
        gemini_key = os.environ.get("EMERGENT_LLM_KEY", "")
        if gemini_key and query:
            chat = GeminiChat(
                config=GeminiConfig(api_key=gemini_key, model="gemini-2.5-flash"),
            )
            system = f"""You are the Master Orchestrator for a Sovereign-level digital ecosystem.
You coordinate specialized agents: Alpha (Geometer — sacred geometry), Beta (Harmonizer — frequencies), Gamma (Logistics — practical).
User's tier: {tier_config['name']}. Respond with deep wisdom but practical guidance.
Keep response under 200 words. Include a specific Hz frequency recommendation."""

            ai_response = await chat.send_message(query, system_prompt=system)
    except Exception as e:
        logger.error(f"Thinking feed AI error: {e}")

    # Deduct credit
    await db.user_credits.update_one(
        {"user_id": user_id},
        {"$inc": {"balance": -1}},
        upsert=True,
    )

    return {
        "thinking_chain": chain,
        "agent_count": len(chain),
        "has_gamma": has_agents,
        "tier": tier,
        "ai_response": ai_response,
        "query": query,
    }


@router.get("/sovereign/agents")
async def get_agents(user=Depends(get_current_user)):
    """Get agent personas and their capabilities."""
    tier = await _get_sovereign_tier(user["id"])
    tier_config = SOVEREIGN_TIERS.get(tier, SOVEREIGN_TIERS["standard"])

    return {
        "agents": AGENT_PERSONAS,
        "tier": tier,
        "has_thinking_feed": tier_config["thinking_feed"],
        "has_agent_coordination": tier_config["agent_coordination"],
    }


# ━━━ COMMAND MODE — CONTEXTUAL MASTER ORCHESTRATOR ━━━

COMMAND_CONTEXTS = {
    "mixer": {
        "label": "Divine Director",
        "system": """You are the Master Orchestrator for a wellness audio mixer. Coordinate:
Agent Alpha (Geometer): Analyze track arrangement geometry, golden ratio spacing, sacred pattern alignment.
Agent Beta (Harmonizer): Optimize frequency relationships, solfeggio tuning, binaural beat effectiveness.
Agent Gamma (Logistics): Calculate resource usage, processing requirements, export optimization.
Provide actionable recommendations for the current mix session. Include specific Hz frequencies.""",
    },
    "meditation": {
        "label": "Meditation Guide",
        "system": """You are the Master Orchestrator for meditation guidance. Coordinate:
Agent Alpha (Geometer): Map the sacred geometry of the meditation space and body posture.
Agent Beta (Harmonizer): Select optimal frequencies for the meditation goal and current state.
Agent Gamma (Logistics): Plan timing, environment, and session structure.
Guide the user through their meditation practice with specific techniques.""",
    },
    "trade": {
        "label": "Trade Circle",
        "system": """You are the Master Orchestrator for the Trade Circle marketplace. Coordinate:
Agent Alpha (Geometer): Analyze market patterns and sacred geometry of exchange flows.
Agent Beta (Harmonizer): Balance the energetic exchange value of items.
Agent Gamma (Logistics): Calculate pricing, inventory, delivery logistics.
Advise on marketplace strategy and circular economy optimization.""",
    },
    "wellness": {
        "label": "Wellness Advisor",
        "system": """You are the Master Orchestrator for holistic wellness. Coordinate:
Agent Alpha (Geometer): Map body-energy geometry and chakra alignment patterns.
Agent Beta (Harmonizer): Prescribe specific Hz frequencies for healing goals.
Agent Gamma (Logistics): Plan daily rituals, meal timing, exercise scheduling.
Provide a comprehensive wellness blueprint with actionable steps.""",
    },
    "general": {
        "label": "General",
        "system": """You are the Master Orchestrator for a Sovereign-level digital ecosystem. Coordinate:
Agent Alpha (Geometer): Map UI/UX and Sacred Geometry patterns.
Agent Beta (Harmonizer): Align Solfeggio Frequencies and resonance.
Agent Gamma (Logistics): Calculate GPS, local data, permits, and inventory.
Provide tiered output: Strategic Layer, Technical Layer, Execution Layer.""",
    },
}


@router.post("/sovereign/command")
async def command_mode(data: dict = Body(...), user=Depends(get_current_user)):
    """Command Mode — context-aware Master Orchestrator invocation.
    Any page can call this with a context and command."""
    user_id = user["id"]
    tier = await _get_sovereign_tier(user_id)
    tier_config = SOVEREIGN_TIERS.get(tier, SOVEREIGN_TIERS["standard"])
    active_units = await _get_active_units(user_id)

    has_thinking = tier_config["thinking_feed"] or any(u["feature_key"] == "thinking_feed" for u in active_units)
    has_agents = tier_config["agent_coordination"] or any(u["feature_key"] == "agent_session" for u in active_units)

    if not has_thinking:
        raise HTTPException(403, "Command Mode requires Glass Box access (Apprentice+ or purchased unit)")

    command = data.get("command", "")
    context = data.get("context", "general")
    page_data = data.get("page_data", {})

    ctx = COMMAND_CONTEXTS.get(context, COMMAND_CONTEXTS["general"])

    # Build thinking chain
    chain = []
    chain.append({
        "agent": "alpha", "name": "Agent Alpha", "role": "Geometer",
        "status": "sync", "color": "#8B5CF6",
        "thought": f"Mapping geometry for {ctx['label']}: '{command[:50]}...'",
        "layers": [
            {"type": "geometry", "label": "Pattern Analysis", "value": "Processing", "confidence": 0.88},
            {"type": "sacred", "label": "Golden Ratio Alignment", "value": "φ = 1.618", "confidence": 0.92},
        ],
    })
    chain.append({
        "agent": "beta", "name": "Agent Beta", "role": "Harmonizer",
        "status": "sync", "color": "#2DD4BF",
        "thought": f"Aligning frequencies for resonance optimization...",
        "layers": [
            {"type": "frequency", "label": "Primary Resonance", "value": "528Hz (MI)", "confidence": 0.95},
            {"type": "harmonic", "label": "Overtone Series", "value": "Active", "confidence": 0.87},
        ],
    })
    if has_agents:
        chain.append({
            "agent": "gamma", "name": "Agent Gamma", "role": "Logistics",
            "status": "sync", "color": "#F59E0B",
            "thought": f"Calculating logistics for {ctx['label']}...",
            "layers": [
                {"type": "resource", "label": "Resource Budget", "value": "Optimized", "confidence": 0.91},
                {"type": "temporal", "label": "Timing", "value": "Now", "confidence": 0.99},
            ],
        })

    # AI response
    ai_response = None
    try:
        from emergentintegrations.llm.gemini import GeminiChat, GeminiConfig
        gemini_key = os.environ.get("EMERGENT_LLM_KEY", "")
        if gemini_key and command:
            chat = GeminiChat(config=GeminiConfig(api_key=gemini_key, model="gemini-2.5-flash"))
            full_system = f"""{ctx['system']}
User tier: {tier_config['name']} ({tier_config['codename']}).
Page context: {context}. Page data: {str(page_data)[:200]}.
Keep response under 250 words. Be specific and actionable."""
            ai_response = await chat.send_message(command, system_prompt=full_system)
    except Exception as e:
        logger.error(f"Command Mode AI error: {e}")

    await db.user_credits.update_one({"user_id": user_id}, {"$inc": {"balance": -1}}, upsert=True)

    # Publish event
    await db.sovereign_events.insert_one({
        "user_id": user_id,
        "event": "command_mode",
        "context": context,
        "command": command[:200],
        "tier": tier,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "thinking_chain": chain,
        "ai_response": ai_response,
        "context": context,
        "context_label": ctx["label"],
        "tier": tier,
        "agent_count": len(chain),
    }


# ━━━ PUB/SUB EVENT SYSTEM ━━━

@router.post("/sovereign/events/publish")
async def publish_event(data: dict = Body(...), user=Depends(get_current_user)):
    """Publish an event for the Pub/Sub system."""
    event = {
        "user_id": user["id"],
        "event_type": data.get("event_type", "unknown"),
        "payload": data.get("payload", {}),
        "source_tier": data.get("source_tier", "standard"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.sovereign_events.insert_one(event)
    return {"published": True, "event_type": event["event_type"]}


@router.get("/sovereign/events/recent")
async def recent_events(user=Depends(get_current_user)):
    """Get recent events for the user (subscriber poll)."""
    cursor = db.sovereign_events.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20)
    events = await cursor.to_list(20)
    return {"events": events}

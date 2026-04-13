from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from utils.credits import get_user_credits, modify_credits
from engines.crystal_seal import EconomyCommon
import os
import uuid

router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC MARKETPLACE — Premium Store & Economy
#  Handles: Cosmic Credits, Consumables, Premium Tools,
#  Cosmetics, Time-Savers, Nexus Subscription, Sell-Back
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Cosmic Credit Packages (buy with real money) ──
CREDIT_PACKAGES = {
    "credits_100": {
        "id": "credits_100",
        "name": "100 Cosmic Credits",
        "credits": 100,
        "price_cents": 99,
        "price_display": "$0.99",
        "bonus": 0,
        "icon": "coins",
        "popular": False,
    },
    "credits_500": {
        "id": "credits_500",
        "name": "550 Cosmic Credits",
        "credits": 550,
        "price_cents": 499,
        "price_display": "$4.99",
        "bonus": 50,
        "icon": "coins",
        "popular": True,
    },
    "credits_1200": {
        "id": "credits_1200",
        "name": "1400 Cosmic Credits",
        "credits": 1400,
        "price_cents": 999,
        "price_display": "$9.99",
        "bonus": 200,
        "icon": "coins",
        "popular": False,
    },
    "credits_3000": {
        "id": "credits_3000",
        "name": "3800 Cosmic Credits",
        "credits": 3800,
        "price_cents": 2499,
        "price_display": "$24.99",
        "bonus": 800,
        "icon": "coins",
        "popular": False,
    },
}

# ── Mineral Sell-Back Values (minerals → Cosmic Credits) ──
MINERAL_CREDIT_VALUES = {
    "common": 1,
    "uncommon": 3,
    "rare": 8,
    "epic": 20,
    "legendary": 50,
    "mythic": 150,
}

# ── Consumable Items ──
CONSUMABLES = {
    "clear_vision": {
        "id": "clear_vision",
        "name": "Clear Vision Tincture",
        "description": "Instantly clears all visual distortions for 30 minutes. Hunt in high-conflict zones without the glitch effects.",
        "category": "consumable",
        "price_credits": 50,
        "price_real_cents": 99,
        "quantity_per_purchase": 3,
        "duration_minutes": 30,
        "effect": "disable_distortion",
        "icon": "eye",
        "color": "#22C55E",
        "rarity": "rare",
    },
    "frequency_attuner": {
        "id": "frequency_attuner",
        "name": "963 Hz Frequency Tuner",
        "description": "Premium scanner that ignores common Silica and Quartz. Only pings when rare or higher gems are nearby. Lasts 5 minutes.",
        "category": "consumable",
        "price_credits": 80,
        "price_real_cents": 149,
        "quantity_per_purchase": 1,
        "duration_minutes": 5,
        "effect": "rare_only_scanner",
        "icon": "radio",
        "color": "#A855F7",
        "rarity": "epic",
    },
    "payload_booster": {
        "id": "payload_booster",
        "name": "Payload Booster",
        "description": "Double your inventory space for the entire mining session. Carry more specimens back from the depths.",
        "category": "consumable",
        "price_credits": 40,
        "price_real_cents": 79,
        "quantity_per_purchase": 1,
        "duration_minutes": 60,
        "effect": "double_inventory",
        "icon": "package",
        "color": "#F59E0B",
        "rarity": "uncommon",
    },
    "dual_motor_excavator": {
        "id": "dual_motor_excavator",
        "name": "Dual-Motor Excavator",
        "description": "Speeds up collection animation by 3x. Mine faster, earn faster. Single-session enhancement.",
        "category": "consumable",
        "price_credits": 60,
        "price_real_cents": 129,
        "quantity_per_purchase": 1,
        "duration_minutes": 60,
        "effect": "speed_boost_3x",
        "icon": "zap",
        "color": "#EF4444",
        "rarity": "rare",
    },
    "warp_key": {
        "id": "warp_key",
        "name": "Warp Key",
        "description": "Instant travel to any universe layer for 30 minutes. Bypass resonance gates completely.",
        "category": "consumable",
        "price_credits": 120,
        "price_real_cents": 199,
        "quantity_per_purchase": 1,
        "duration_minutes": 30,
        "effect": "layer_warp",
        "icon": "key",
        "color": "#FCD34D",
        "rarity": "legendary",
    },
    "preservation_salt": {
        "id": "preservation_salt",
        "name": "Preservation Salt",
        "description": "Stops a favorite asset's decay for 30 days without manual renewal. Keeps your treasures alive.",
        "category": "consumable",
        "price_credits": 30,
        "price_real_cents": 49,
        "quantity_per_purchase": 3,
        "duration_minutes": 43200,
        "effect": "preserve_asset",
        "icon": "shield",
        "color": "#22C55E",
        "rarity": "uncommon",
    },
    "digital_luster_polish": {
        "id": "digital_luster_polish",
        "name": "Digital Luster Polish",
        "description": "One-time cosmetic upgrade: adds unique particle effects to a specific gem in your inventory.",
        "category": "consumable",
        "price_credits": 75,
        "price_real_cents": 129,
        "quantity_per_purchase": 1,
        "duration_minutes": -1,
        "effect": "luster_polish",
        "icon": "sparkles",
        "color": "#E2C6A0",
        "rarity": "rare",
    },
}

# ── Cosmetic Items ──
COSMETICS = {
    "aura_violet": {
        "id": "aura_violet",
        "name": "Violet Aura",
        "description": "A pulsing violet glow surrounds your scanner and UI elements.",
        "category": "cosmetic",
        "price_credits": 200,
        "effect": "aura",
        "aura_color": "#A855F7",
        "icon": "sparkles",
        "color": "#A855F7",
        "permanent": True,
    },
    "aura_golden": {
        "id": "aura_golden",
        "name": "Golden Aura",
        "description": "A radiant golden halo effect. The mark of a true cosmic explorer.",
        "category": "cosmetic",
        "price_credits": 350,
        "effect": "aura",
        "aura_color": "#FCD34D",
        "icon": "sun",
        "color": "#FCD34D",
        "permanent": True,
    },
    "aura_crimson": {
        "id": "aura_crimson",
        "name": "Crimson Aura",
        "description": "Fiery crimson energy radiates from your presence. Intimidating and powerful.",
        "category": "cosmetic",
        "price_credits": 300,
        "effect": "aura",
        "aura_color": "#EF4444",
        "icon": "flame",
        "color": "#EF4444",
        "permanent": True,
    },
    "theme_cyber_neon": {
        "id": "theme_cyber_neon",
        "name": "Cyber-Neon Theme",
        "description": "Override the standard visual template with a stunning Cyber-Neon aesthetic. Electric blues and hot pinks.",
        "category": "cosmetic",
        "price_credits": 500,
        "effect": "premium_theme",
        "theme_id": "cyber_neon",
        "theme_colors": {"primary": "#00F5FF", "secondary": "#FF00E5", "accent": "#39FF14", "bg": "rgba(0,10,30,0.95)"},
        "icon": "monitor",
        "color": "#00F5FF",
        "permanent": True,
    },
    "theme_hyper_real": {
        "id": "theme_hyper_real",
        "name": "Hyper-Realistic Theme",
        "description": "An ultra-refined visual experience. Deep contrast, film grain, cinematic color grading.",
        "category": "cosmetic",
        "price_credits": 500,
        "effect": "premium_theme",
        "theme_id": "hyper_real",
        "theme_colors": {"primary": "#E2C6A0", "secondary": "#4A6741", "accent": "#C5A55A", "bg": "rgba(15,12,10,0.95)"},
        "icon": "film",
        "color": "#E2C6A0",
        "permanent": True,
    },
}

# ── Nexus Subscription ──
NEXUS_SUBSCRIPTION = {
    "id": "nexus_subscription",
    "name": "Nexus Pass",
    "description": "Monthly subscription. Permanent high resonance. Bypass all layer gates. Farm Astral, Void, and Nexus freely. Moldavite and Diamond stones are common finds.",
    "price_cents": 999,
    "price_display": "$9.99/month",
    "interval": "month",
    "perks": [
        "Permanent Resonance — no more Conflict states",
        "Bypass all layer gates — warp to any layer anytime",
        "Nexus Layer exclusive access — Mythic drops",
        "Moldavite & Diamond stones appear as common finds",
        "3x XP multiplier on all activities",
        "500 Cosmic Credits monthly bonus",
        "Exclusive Nexus subscriber aura",
    ],
    "resonance_bonus": 60,
    "monthly_credits": 500,
    "color": "#FCD34D",
    "icon": "crown",
}

ALL_STORE_ITEMS = {**CONSUMABLES, **COSMETICS}

# ── Mixer Channel Upgrades (à la carte purchases for Creator Console) ──
MIXER_ITEMS = {
    "mixer_channel_pack_practice": {
        "id": "mixer_channel_pack_practice", "name": "Practice Channel Pack",
        "description": "Unlock all 9 Practice module fader strips in the Creator Console.",
        "category": "mixer", "price_credits": 50, "pillar": "Practice", "color": "#D8B4FE",
    },
    "mixer_channel_pack_divination": {
        "id": "mixer_channel_pack_divination", "name": "Divination Channel Pack",
        "description": "Unlock all 9 Divination module fader strips.",
        "category": "mixer", "price_credits": 50, "pillar": "Divination", "color": "#E879F9",
    },
    "mixer_channel_pack_sanctuary": {
        "id": "mixer_channel_pack_sanctuary", "name": "Sanctuary Channel Pack",
        "description": "Unlock all 8 Sanctuary module fader strips.",
        "category": "mixer", "price_credits": 45, "pillar": "Sanctuary", "color": "#2DD4BF",
    },
    "mixer_channel_pack_nourish": {
        "id": "mixer_channel_pack_nourish", "name": "Nourish & Heal Channel Pack",
        "description": "Unlock all 8 Nourishment module fader strips.",
        "category": "mixer", "price_credits": 45, "pillar": "Nourish", "color": "#22C55E",
    },
    "mixer_channel_pack_explore": {
        "id": "mixer_channel_pack_explore", "name": "Explore Channel Pack",
        "description": "Unlock all 9 Explore module fader strips.",
        "category": "mixer", "price_credits": 50, "pillar": "Explore", "color": "#FB923C",
    },
    "mixer_channel_pack_sage": {
        "id": "mixer_channel_pack_sage", "name": "Sage AI Channel Pack",
        "description": "Unlock all 4 Sage AI Coach module fader strips.",
        "category": "mixer", "price_credits": 60, "pillar": "Sage AI", "color": "#38BDF8",
    },
    "mixer_channel_pack_council": {
        "id": "mixer_channel_pack_council", "name": "Council Channel Pack",
        "description": "Unlock all 11 Sovereign Council module fader strips.",
        "category": "mixer", "price_credits": 75, "pillar": "Council", "color": "#C084FC",
    },
    "mixer_effects_reverb": {
        "id": "mixer_effects_reverb", "name": "Reverb Engine",
        "description": "Add reverb send to your mixer routing chain.",
        "category": "mixer_fx", "price_credits": 30, "fx": "reverb", "color": "#8B5CF6",
    },
    "mixer_effects_delay": {
        "id": "mixer_effects_delay", "name": "Delay Engine",
        "description": "Add delay send to your mixer routing chain.",
        "category": "mixer_fx", "price_credits": 30, "fx": "delay", "color": "#3B82F6",
    },
    "mixer_effects_harmonic": {
        "id": "mixer_effects_harmonic", "name": "Harmonic Resonance",
        "description": "Cross-route modules with harmonic frequency linking.",
        "category": "mixer_fx", "price_credits": 40, "fx": "harmonic", "color": "#EAB308",
    },
    "mixer_effects_sidechain": {
        "id": "mixer_effects_sidechain", "name": "Sidechain Compressor",
        "description": "Dynamic sidechain compression between module channels.",
        "category": "mixer_fx", "price_credits": 35, "fx": "sidechain", "color": "#EF4444",
    },
    "mixer_gpu_shader": {
        "id": "mixer_gpu_shader", "name": "L² Fractal GPU",
        "description": "Unlock the real-time fractal shader visualization in the visual screen.",
        "category": "mixer_visual", "price_credits": 100, "color": "#C084FC",
    },
    "mixer_waveform": {
        "id": "mixer_waveform", "name": "Live Waveform Display",
        "description": "Unlock live waveform visualization across all pillar channels.",
        "category": "mixer_visual", "price_credits": 40, "color": "#2DD4BF",
    },
    "mixer_superstrip": {
        "id": "mixer_superstrip", "name": "SuperStrip Module",
        "description": "Unlock the detailed SuperStrip panel for deep per-channel control.",
        "category": "mixer_visual", "price_credits": 80, "color": "#F59E0B",
    },
    "mixer_full_unlock": {
        "id": "mixer_full_unlock", "name": "Full Mixer Unlock",
        "description": "Unlock ALL mixer features: every channel pack, all effects, GPU, waveform, SuperStrip.",
        "category": "mixer_bundle", "price_credits": 400, "color": "#F59E0B",
    },
}

ALL_STORE_ITEMS = {**CONSUMABLES, **COSMETICS, **MIXER_ITEMS}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HELPER FUNCTIONS
#  Note: get_user_credits and modify_credits are imported from utils.credits
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def get_user_inventory(user_id: str) -> list:
    items = await db.marketplace_inventory.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(200)
    return items


async def get_active_effects(user_id: str) -> list:
    now = datetime.now(timezone.utc).isoformat()
    effects = await db.marketplace_active_effects.find(
        {"user_id": user_id, "expires_at": {"$gt": now}},
        {"_id": 0},
    ).to_list(20)
    return effects


async def get_nexus_sub(user_id: str) -> dict:
    sub = await db.nexus_subscriptions.find_one(
        {"user_id": user_id, "status": "active"},
        {"_id": 0},
    )
    return sub


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@router.get("/marketplace/store")
async def get_store(user=Depends(get_current_user)):
    """Get the full store catalog with user's balance and inventory."""
    user_id = user["id"]
    credits = await get_user_credits(user_id)
    inventory = await get_user_inventory(user_id)
    active_effects = await get_active_effects(user_id)
    nexus_sub = await get_nexus_sub(user_id)

    # Build owned cosmetics set
    owned_ids = set()
    inventory_counts = {}
    for item in inventory:
        owned_ids.add(item["item_id"])
        inventory_counts[item["item_id"]] = inventory_counts.get(item["item_id"], 0) + item.get("quantity", 1)

    consumables_list = []
    for cid, cdata in CONSUMABLES.items():
        consumables_list.append({
            **cdata,
            "owned_quantity": inventory_counts.get(cid, 0),
            "can_afford": credits >= cdata["price_credits"],
        })

    cosmetics_list = []
    for cid, cdata in COSMETICS.items():
        cosmetics_list.append({
            **cdata,
            "owned": cid in owned_ids,
            "can_afford": credits >= cdata["price_credits"],
        })

    # Active effects summary
    effect_map = {}
    for e in active_effects:
        effect_map[e["effect_type"]] = {
            "item_id": e["item_id"],
            "expires_at": e["expires_at"],
            "effect_type": e["effect_type"],
        }

    return {
        "cosmic_credits": credits,
        "credit_packages": list(CREDIT_PACKAGES.values()),
        "consumables": consumables_list,
        "cosmetics": cosmetics_list,
        "nexus_subscription": {
            **NEXUS_SUBSCRIPTION,
            "is_subscribed": nexus_sub is not None,
            "sub_expires": nexus_sub.get("expires_at") if nexus_sub else None,
        },
        "inventory": inventory_counts,
        "active_effects": effect_map,
    }


@router.post("/marketplace/buy-credits")
async def buy_credits(data: dict = Body(...), user=Depends(get_current_user)):
    """Initiate Stripe checkout to purchase Cosmic Credits."""
    user_id = user["id"]
    package_id = data.get("package_id")

    if package_id not in CREDIT_PACKAGES:
        raise HTTPException(400, "Invalid credit package")

    pkg = CREDIT_PACKAGES[package_id]

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=data.get("webhook_url", ""),
        )
        session = await stripe_checkout.create_session(
            line_items=[{
                "name": pkg["name"],
                "description": f"{pkg['credits']} Cosmic Credits" + (f" (includes {pkg['bonus']} bonus!)" if pkg['bonus'] else ""),
                "amount": pkg["price_cents"],
                "quantity": 1,
            }],
            success_url=data.get("success_url", ""),
            cancel_url=data.get("cancel_url", ""),
        )

        # Store pending transaction
        await db.marketplace_transactions.insert_one({
            "user_id": user_id,
            "type": "credit_purchase",
            "package_id": package_id,
            "credits": pkg["credits"],
            "amount_cents": pkg["price_cents"],
            "session_id": session.session_id,
            "payment_status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        return {"checkout_url": session.checkout_url, "session_id": session.session_id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(500, "Payment service unavailable")


@router.post("/marketplace/buy-item")
async def buy_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a store item with Cosmic Credits."""
    user_id = user["id"]
    item_id = data.get("item_id")

    if item_id not in ALL_STORE_ITEMS:
        raise HTTPException(400, f"Unknown item: {item_id}")

    item = ALL_STORE_ITEMS[item_id]
    credits = await get_user_credits(user_id)

    if credits < item["price_credits"]:
        raise HTTPException(400, f"Insufficient Cosmic Credits. Need {item['price_credits']}, have {credits}.")

    # Cosmetics: check if already owned
    if item["category"] == "cosmetic":
        existing = await db.marketplace_inventory.find_one(
            {"user_id": user_id, "item_id": item_id}
        )
        if existing:
            raise HTTPException(400, "You already own this cosmetic.")

    # Deduct credits
    new_balance = await modify_credits(user_id, -item["price_credits"], f"purchase:{item_id}")

    # Add to inventory
    quantity = item.get("quantity_per_purchase", 1)
    if item["category"] == "consumable":
        existing = await db.marketplace_inventory.find_one(
            {"user_id": user_id, "item_id": item_id}
        )
        if existing:
            await db.marketplace_inventory.update_one(
                {"user_id": user_id, "item_id": item_id},
                {"$inc": {"quantity": quantity}},
            )
        else:
            await db.marketplace_inventory.insert_one({
                "user_id": user_id,
                "item_id": item_id,
                "item_name": item["name"],
                "category": item["category"],
                "quantity": quantity,
                "purchased_at": datetime.now(timezone.utc).isoformat(),
            })
    else:
        await db.marketplace_inventory.insert_one({
            "user_id": user_id,
            "item_id": item_id,
            "item_name": item["name"],
            "category": item["category"],
            "quantity": 1,
            "purchased_at": datetime.now(timezone.utc).isoformat(),
        })

    # Log purchase
    await db.marketplace_transactions.insert_one({
        "user_id": user_id,
        "type": "item_purchase",
        "item_id": item_id,
        "item_name": item["name"],
        "credits_spent": item["price_credits"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "purchased": True,
        "item": {"id": item_id, "name": item["name"], "quantity": quantity},
        "credits_remaining": new_balance,
    }


@router.get("/marketplace/mixer-store")
async def get_mixer_store(user=Depends(get_current_user)):
    """Get mixer store catalog with user's unlock status."""
    user_id = user["id"]
    owned = await db.marketplace_inventory.find(
        {"user_id": user_id, "item_id": {"$regex": "^mixer_"}}, {"_id": 0}
    ).to_list(100)
    owned_ids = {item["item_id"] for item in owned}
    credits = await get_user_credits(user_id)

    items = []
    for item_id, item in MIXER_ITEMS.items():
        items.append({
            "id": item_id,
            "name": item["name"],
            "description": item["description"],
            "category": item["category"],
            "price_credits": item["price_credits"],
            "color": item.get("color", "#8B5CF6"),
            "pillar": item.get("pillar"),
            "fx": item.get("fx"),
            "owned": item_id in owned_ids,
        })
    return {"items": items, "credits": credits, "owned_ids": list(owned_ids)}


@router.get("/marketplace/mixer-unlocks")
async def get_mixer_unlocks(user=Depends(get_current_user)):
    """Get user's mixer unlock state for the Creator Console."""
    user_id = user["id"]
    owned = await db.marketplace_inventory.find(
        {"user_id": user_id, "item_id": {"$regex": "^mixer_"}}, {"_id": 0, "item_id": 1}
    ).to_list(100)
    owned_ids = [item["item_id"] for item in owned]
    has_full = "mixer_full_unlock" in owned_ids
    return {
        "unlocked_pillars": [i["item_id"].replace("mixer_channel_pack_", "") for i in owned if i["item_id"].startswith("mixer_channel_pack_")] if not has_full else ["practice", "divination", "sanctuary", "nourish", "explore", "sage", "council"],
        "unlocked_fx": [i["item_id"].replace("mixer_effects_", "") for i in owned if i["item_id"].startswith("mixer_effects_")] if not has_full else ["reverb", "delay", "harmonic", "sidechain"],
        "has_gpu": has_full or "mixer_gpu_shader" in owned_ids,
        "has_waveform": has_full or "mixer_waveform" in owned_ids,
        "has_superstrip": has_full or "mixer_superstrip" in owned_ids,
        "has_full_unlock": has_full,
        "owned_ids": owned_ids,
    }


@router.post("/marketplace/use-item")
async def use_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Activate a consumable item from inventory."""
    user_id = user["id"]
    item_id = data.get("item_id")
    target_layer = data.get("target_layer")  # For warp keys

    if item_id not in CONSUMABLES:
        raise HTTPException(400, f"Not a consumable: {item_id}")

    item_def = CONSUMABLES[item_id]

    # Check inventory
    inv = await db.marketplace_inventory.find_one(
        {"user_id": user_id, "item_id": item_id}
    )
    if not inv or inv.get("quantity", 0) <= 0:
        raise HTTPException(400, "You don't have this item in your inventory.")

    # Check for existing effect of same type
    now = datetime.now(timezone.utc)
    existing_effect = await db.marketplace_active_effects.find_one(
        {"user_id": user_id, "effect_type": item_def["effect"], "expires_at": {"$gt": now.isoformat()}}
    )
    if existing_effect:
        raise HTTPException(400, f"Effect '{item_def['effect']}' is already active. Wait for it to expire.")

    # Decrement inventory
    if inv.get("quantity", 0) <= 1:
        await db.marketplace_inventory.delete_one({"user_id": user_id, "item_id": item_id})
    else:
        await db.marketplace_inventory.update_one(
            {"user_id": user_id, "item_id": item_id},
            {"$inc": {"quantity": -1}},
        )

    # Create active effect
    expires = now + timedelta(minutes=item_def["duration_minutes"])
    effect_data = {
        "user_id": user_id,
        "item_id": item_id,
        "item_name": item_def["name"],
        "effect_type": item_def["effect"],
        "duration_minutes": item_def["duration_minutes"],
        "activated_at": now.isoformat(),
        "expires_at": expires.isoformat(),
    }

    # Warp key: store target layer
    if item_def["effect"] == "layer_warp" and target_layer:
        effect_data["target_layer"] = target_layer

    await db.marketplace_active_effects.insert_one(effect_data)

    # Log
    await db.marketplace_transactions.insert_one({
        "user_id": user_id,
        "type": "item_use",
        "item_id": item_id,
        "effect": item_def["effect"],
        "expires_at": expires.isoformat(),
        "timestamp": now.isoformat(),
    })

    return {
        "activated": True,
        "effect": item_def["effect"],
        "expires_at": expires.isoformat(),
        "item_name": item_def["name"],
    }


@router.get("/marketplace/active-effects")
async def get_active_effects_endpoint(user=Depends(get_current_user)):
    """Get all currently active marketplace effects for this user."""
    user_id = user["id"]
    effects = await get_active_effects(user_id)
    nexus_sub = await get_nexus_sub(user_id)

    # Owned cosmetics
    cosmetics = await db.marketplace_inventory.find(
        {"user_id": user_id, "category": "cosmetic"},
        {"_id": 0},
    ).to_list(50)

    # Active equipped cosmetic
    equipped = await db.marketplace_equipped.find_one(
        {"user_id": user_id}, {"_id": 0}
    )

    return {
        "active_effects": effects,
        "nexus_subscription": {
            "active": nexus_sub is not None,
            "expires_at": nexus_sub.get("expires_at") if nexus_sub else None,
        },
        "owned_cosmetics": cosmetics,
        "equipped": equipped,
    }


@router.post("/marketplace/equip-cosmetic")
async def equip_cosmetic(data: dict = Body(...), user=Depends(get_current_user)):
    """Equip a purchased cosmetic (aura or theme)."""
    user_id = user["id"]
    item_id = data.get("item_id")

    if item_id and item_id not in COSMETICS:
        raise HTTPException(400, "Unknown cosmetic")

    # Check ownership
    if item_id:
        owned = await db.marketplace_inventory.find_one(
            {"user_id": user_id, "item_id": item_id}
        )
        if not owned:
            raise HTTPException(400, "You don't own this cosmetic.")

    cosmetic = COSMETICS.get(item_id, {}) if item_id else {}
    effect = cosmetic.get("effect", "")

    update = {"user_id": user_id, "updated_at": datetime.now(timezone.utc).isoformat()}
    if effect == "aura":
        update["aura"] = {"item_id": item_id, "color": cosmetic.get("aura_color")}
    elif effect == "premium_theme":
        update["theme"] = {"item_id": item_id, "theme_id": cosmetic.get("theme_id"), "colors": cosmetic.get("theme_colors")}
    elif not item_id:
        # Unequip all
        update["aura"] = None
        update["theme"] = None

    await db.marketplace_equipped.update_one(
        {"user_id": user_id}, {"$set": update}, upsert=True
    )

    return {"equipped": True, "item_id": item_id}


@router.post("/marketplace/sell-minerals")
async def sell_minerals(data: dict = Body(...), user=Depends(get_current_user)):
    """Sell collected minerals for Cosmic Credits. 100 Silica = 1 Credit base rate."""
    user_id = user["id"]
    specimens_to_sell = data.get("specimens", [])

    if not specimens_to_sell:
        raise HTTPException(400, "No specimens to sell")

    total_credits = 0
    sold_items = []

    for spec in specimens_to_sell:
        spec_id = spec.get("id")
        quantity = spec.get("quantity", 1)

        # Verify ownership
        owned = await db.rock_hounding_collection.find_one(
            {"user_id": user_id, "specimen_id": spec_id}
        )
        if not owned:
            continue

        rarity = owned.get("rarity", "common")
        credit_value = MINERAL_CREDIT_VALUES.get(rarity, 1) * quantity
        total_credits += credit_value

        sold_items.append({
            "specimen_id": spec_id,
            "name": owned.get("name", "Unknown"),
            "rarity": rarity,
            "quantity": quantity,
            "credits_earned": credit_value,
        })

        # Remove from collection
        await db.rock_hounding_collection.delete_one(
            {"user_id": user_id, "specimen_id": spec_id}
        )

    if total_credits > 0:
        new_balance = await modify_credits(user_id, total_credits, "mineral_sellback")

        await db.marketplace_transactions.insert_one({
            "user_id": user_id,
            "type": "mineral_sell",
            "items_sold": len(sold_items),
            "total_credits": total_credits,
            "details": sold_items,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        return {
            "sold": True,
            "items": sold_items,
            "total_credits_earned": total_credits,
            "new_balance": new_balance,
        }

    return {"sold": False, "message": "No valid specimens to sell", "total_credits_earned": 0}


@router.post("/marketplace/subscribe-nexus")
async def subscribe_nexus(data: dict = Body(...), user=Depends(get_current_user)):
    """Initiate Stripe checkout for Nexus Pass subscription ($9.99/month)."""
    user_id = user["id"]

    # Check if already subscribed
    existing = await get_nexus_sub(user_id)
    if existing:
        raise HTTPException(400, "You already have an active Nexus subscription.")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=data.get("webhook_url", ""),
        )
        session = await stripe_checkout.create_session(
            line_items=[{
                "name": NEXUS_SUBSCRIPTION["name"],
                "description": "Monthly Nexus Pass — Permanent Resonance & All-Layer Access",
                "amount": NEXUS_SUBSCRIPTION["price_cents"],
                "quantity": 1,
            }],
            success_url=data.get("success_url", ""),
            cancel_url=data.get("cancel_url", ""),
        )

        await db.marketplace_transactions.insert_one({
            "user_id": user_id,
            "type": "nexus_subscription",
            "amount_cents": NEXUS_SUBSCRIPTION["price_cents"],
            "session_id": session.session_id,
            "payment_status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        return {"checkout_url": session.checkout_url, "session_id": session.session_id}
    except Exception as e:
        logger.error(f"Nexus sub checkout error: {e}")
        raise HTTPException(500, "Payment service unavailable")


@router.post("/marketplace/activate-nexus-sub")
async def activate_nexus_sub(data: dict = Body(...), user=Depends(get_current_user)):
    """Activate a Nexus subscription after successful payment (or for testing)."""
    user_id = user["id"]
    session_id = data.get("session_id", "test")

    existing = await get_nexus_sub(user_id)
    if existing:
        raise HTTPException(400, "Already subscribed")

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=30)

    await db.nexus_subscriptions.insert_one({
        "user_id": user_id,
        "status": "active",
        "session_id": session_id,
        "subscribed_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "monthly_credits": NEXUS_SUBSCRIPTION["monthly_credits"],
        "resonance_bonus": NEXUS_SUBSCRIPTION["resonance_bonus"],
    })

    # Grant monthly credits
    await modify_credits(user_id, NEXUS_SUBSCRIPTION["monthly_credits"], "nexus_sub_monthly")

    # Boost resonance stat
    from routes.game_core import modify_stat
    await modify_stat(user_id, "resonance", NEXUS_SUBSCRIPTION["resonance_bonus"], "nexus_subscription")

    return {
        "subscribed": True,
        "expires_at": expires.isoformat(),
        "credits_granted": NEXUS_SUBSCRIPTION["monthly_credits"],
        "resonance_boost": NEXUS_SUBSCRIPTION["resonance_bonus"],
    }


@router.get("/marketplace/inventory")
async def get_inventory(user=Depends(get_current_user)):
    """Get user's marketplace inventory."""
    user_id = user["id"]
    items = await get_user_inventory(user_id)
    credits = await get_user_credits(user_id)
    return {"inventory": items, "cosmic_credits": credits}


@router.get("/marketplace/credits")
async def get_credits(user=Depends(get_current_user)):
    """Get user's Cosmic Credits balance."""
    return {"cosmic_credits": await get_user_credits(user["id"])}


@router.post("/marketplace/grant-test-credits")
async def grant_test_credits(data: dict = Body(...), user=Depends(get_current_user)):
    """Dev endpoint: grant test credits for development."""
    amount = min(data.get("amount", 500), 5000)
    new_balance = await modify_credits(user["id"], amount, "dev_grant")
    return {"granted": amount, "new_balance": new_balance}


@router.post("/marketplace/convert-dust")
async def convert_dust_to_credits(data: dict = Body(...), user=Depends(get_current_user)):
    """Convert Cosmic Dust into Cosmic Credits using admin-controlled sliding scale. Redirects to economy endpoint."""
    # Delegate to the economy admin route for centralized rate management
    from routes.economy_admin import convert_dust
    return await convert_dust(data, user)

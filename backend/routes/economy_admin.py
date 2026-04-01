from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import random

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ECONOMY ADMIN — Sweat Equity, Feature Flags, Module Unlocks
#  Admin-controlled exchange rate, feature gating, communal goals
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFAULT_EXCHANGE_RATE = 100  # 100 Dust = 1 Credit (base)

# ── Gated Premium Modules ──
PREMIUM_MODULES = {
    "cosmic_mixer_advanced": {
        "id": "cosmic_mixer_advanced",
        "name": "Cosmic Mixer — Advanced Layers",
        "description": "Unlock multi-layer frequency blending, 963 Hz soundscapes, and custom audio compositions.",
        "unlock_cost_credits": 500,
        "subscription_tier": "plus",
        "icon": "music",
        "color": "#8B5CF6",
    },
    "starseed_workbench": {
        "id": "starseed_workbench",
        "name": "Starseed Workbench",
        "description": "Access the full Starseed crafting system. Combine refined minerals into spacecraft components.",
        "unlock_cost_credits": 800,
        "subscription_tier": "plus",
        "icon": "rocket",
        "color": "#3B82F6",
    },
    "dream_realms_deep": {
        "id": "dream_realms_deep",
        "name": "Dream Realms — Deep Exploration",
        "description": "Access Void and Nexus-tier dream realms with legendary frequency encounters.",
        "unlock_cost_credits": 600,
        "subscription_tier": "plus",
        "icon": "moon",
        "color": "#A855F7",
    },
    "wisdom_branches": {
        "id": "wisdom_branches",
        "name": "Wisdom — Branch Tier",
        "description": "Unlock complex philosophical discourse, alchemy texts, and guided meditation scripts.",
        "unlock_cost_credits": 300,
        "subscription_tier": "plus",
        "icon": "book-open",
        "color": "#22C55E",
    },
    "digital_seeds_rare": {
        "id": "digital_seeds_rare",
        "name": "Digital Seeds — Rare Minerals",
        "description": "Purchase seeds that spawn subscriber-only minerals in your mine (Moldavite, Alexandrite).",
        "unlock_cost_credits": 400,
        "subscription_tier": "plus",
        "icon": "gem",
        "color": "#FCD34D",
    },
}

# ── Communal Goals ──
COMMUNAL_GOALS = {
    "enlightenment": {
        "id": "enlightenment",
        "name": "Global Enlightenment",
        "description": "When the collective reaches this meditation goal, the Dust→Credit exchange rate improves for everyone.",
        "target_meditations": 1000,
        "reward_rate_bonus": 20,
        "reward_duration_hours": 168,
        "icon": "sun",
        "color": "#FCD34D",
    },
    "rapid_tumbling": {
        "id": "rapid_tumbling",
        "name": "Rapid Tumbling Week",
        "description": "Collective mining effort triggers 50% faster tumbling for all users.",
        "target_mines": 5000,
        "reward_type": "tumble_speed",
        "reward_multiplier": 0.5,
        "reward_duration_hours": 168,
        "icon": "zap",
        "color": "#F59E0B",
    },
    "vein_crack": {
        "id": "vein_crack",
        "name": "World Vein Resonance",
        "description": "Coordinate frequency meditation to crack open a World Vein for legendary drops.",
        "target_frequency_sessions": 500,
        "target_frequency_hz": 528,
        "reward_type": "legendary_drop_boost",
        "reward_duration_hours": 72,
        "icon": "radio",
        "color": "#EF4444",
    },
}


async def get_exchange_rate() -> dict:
    """Get the current admin-controlled exchange rate with communal modifiers."""
    config = await db.economy_config.find_one({"key": "exchange_rate"}, {"_id": 0})
    base_rate = (config or {}).get("dust_per_credit", DEFAULT_EXCHANGE_RATE)

    # Check for active communal bonus
    now = datetime.now(timezone.utc).isoformat()
    bonus = await db.communal_bonuses.find_one(
        {"type": "exchange_rate", "expires_at": {"$gt": now}},
        {"_id": 0},
    )
    communal_bonus = (bonus or {}).get("bonus_reduction", 0)
    effective_rate = max(10, base_rate - communal_bonus)

    return {
        "base_rate": base_rate,
        "communal_bonus": communal_bonus,
        "effective_rate": effective_rate,
        "bonus_active": bonus is not None,
        "bonus_expires": (bonus or {}).get("expires_at"),
    }


async def check_module_access(user_id: str, module_id: str) -> dict:
    """Check if a user has access to a gated module (via subscription OR purchase)."""
    if module_id not in PREMIUM_MODULES:
        return {"has_access": True, "reason": "not_gated"}

    module = PREMIUM_MODULES[module_id]

    # Check subscription tier
    sub = await db.subscriptions.find_one(
        {"user_id": user_id, "status": "active"}, {"_id": 0}
    )
    if sub:
        user_tier = sub.get("tier", "free")
        required_tier = module["subscription_tier"]
        tier_order = ["free", "starter", "plus", "premium", "super_user"]
        if tier_order.index(user_tier) >= tier_order.index(required_tier):
            return {"has_access": True, "reason": "subscription", "tier": user_tier}

    # Check Nexus subscription
    nexus_sub = await db.nexus_subscriptions.find_one(
        {"user_id": user_id, "status": "active"}, {"_id": 0}
    )
    if nexus_sub:
        return {"has_access": True, "reason": "nexus_subscription"}

    # Check permanent credit purchase
    purchase = await db.module_unlocks.find_one(
        {"user_id": user_id, "module_id": module_id}, {"_id": 0}
    )
    if purchase:
        return {"has_access": True, "reason": "purchased", "purchased_at": purchase.get("purchased_at")}

    return {
        "has_access": False,
        "reason": "locked",
        "unlock_cost": module["unlock_cost_credits"],
        "required_tier": module["subscription_tier"],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@router.get("/economy/exchange-rate")
async def get_rate(user=Depends(get_current_user)):
    """Get the current Dust→Credit exchange rate."""
    return await get_exchange_rate()


@router.post("/economy/set-exchange-rate")
async def set_exchange_rate(data: dict = Body(...), user=Depends(get_current_user)):
    """Admin: Set the global exchange rate. dust_per_credit = how many dust per 1 credit."""
    rate = data.get("dust_per_credit", DEFAULT_EXCHANGE_RATE)
    if rate < 10 or rate > 10000:
        raise HTTPException(400, "Rate must be between 10 and 10000")

    await db.economy_config.update_one(
        {"key": "exchange_rate"},
        {"$set": {"dust_per_credit": rate, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"updated": True, "dust_per_credit": rate}


@router.post("/economy/convert-dust")
async def convert_dust(data: dict = Body(...), user=Depends(get_current_user)):
    """Convert Cosmic Dust to Credits using the admin-controlled sliding scale."""
    user_id = user["id"]
    dust_amount = data.get("dust_amount", 0)

    rate_info = await get_exchange_rate()
    rate = rate_info["effective_rate"]

    if dust_amount < rate:
        raise HTTPException(400, f"Minimum conversion: {rate} Dust (= 1 Credit at current rate)")

    # Check balance
    currencies = await db.rpg_currencies.find_one({"user_id": user_id}, {"_id": 0})
    current_dust = (currencies or {}).get("cosmic_dust", 0)
    if current_dust < dust_amount:
        raise HTTPException(400, f"Insufficient Dust. Have {current_dust}, need {dust_amount}.")

    credits_earned = dust_amount // rate
    dust_consumed = credits_earned * rate

    # Deduct dust
    await db.rpg_currencies.update_one(
        {"user_id": user_id}, {"$inc": {"cosmic_dust": -dust_consumed}}
    )

    # Add credits
    from routes.marketplace import modify_credits
    new_balance = await modify_credits(user_id, credits_earned, "dust_conversion")

    await db.marketplace_transactions.insert_one({
        "user_id": user_id,
        "type": "dust_conversion",
        "dust_spent": dust_consumed,
        "credits_earned": credits_earned,
        "exchange_rate": rate,
        "communal_bonus_active": rate_info["bonus_active"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "converted": True,
        "dust_spent": dust_consumed,
        "credits_earned": credits_earned,
        "exchange_rate": rate,
        "communal_bonus_active": rate_info["bonus_active"],
        "new_credit_balance": new_balance,
        "remaining_dust": current_dust - dust_consumed,
    }


@router.get("/economy/modules")
async def get_modules(user=Depends(get_current_user)):
    """Get all premium modules with access status for this user."""
    user_id = user["id"]
    modules = []
    for mid, mdata in PREMIUM_MODULES.items():
        access = await check_module_access(user_id, mid)
        modules.append({**mdata, "access": access})
    return {"modules": modules}


@router.post("/economy/unlock-module")
async def unlock_module(data: dict = Body(...), user=Depends(get_current_user)):
    """Permanently unlock a premium module with Cosmic Credits."""
    user_id = user["id"]
    module_id = data.get("module_id")

    if module_id not in PREMIUM_MODULES:
        raise HTTPException(400, f"Unknown module: {module_id}")

    module = PREMIUM_MODULES[module_id]

    # Check if already unlocked
    existing = await db.module_unlocks.find_one(
        {"user_id": user_id, "module_id": module_id}
    )
    if existing:
        raise HTTPException(400, "Module already unlocked.")

    # Check credits
    from routes.marketplace import get_user_credits, modify_credits
    credits = await get_user_credits(user_id)
    cost = module["unlock_cost_credits"]
    if credits < cost:
        raise HTTPException(400, f"Need {cost} Credits. Have {credits}.")

    # Deduct and unlock
    new_balance = await modify_credits(user_id, -cost, f"module_unlock:{module_id}")

    await db.module_unlocks.insert_one({
        "user_id": user_id,
        "module_id": module_id,
        "module_name": module["name"],
        "cost": cost,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "unlocked": True,
        "module_id": module_id,
        "module_name": module["name"],
        "credits_spent": cost,
        "credits_remaining": new_balance,
    }


@router.get("/economy/check-access/{module_id}")
async def check_access(module_id: str, user=Depends(get_current_user)):
    """Check if user has access to a specific module."""
    return await check_module_access(user["id"], module_id)


@router.get("/economy/communal-goals")
async def get_communal_goals(user=Depends(get_current_user)):
    """Get all communal goals with current progress."""
    goals = []
    for gid, gdata in COMMUNAL_GOALS.items():
        progress = await db.communal_progress.find_one(
            {"goal_id": gid}, {"_id": 0}
        )
        current = (progress or {}).get("current", 0)
        target = gdata.get("target_meditations") or gdata.get("target_mines") or gdata.get("target_frequency_sessions", 0)
        completed = current >= target if target > 0 else False

        # Check for active reward
        now = datetime.now(timezone.utc).isoformat()
        active_bonus = await db.communal_bonuses.find_one(
            {"goal_id": gid, "expires_at": {"$gt": now}}, {"_id": 0}
        )

        goals.append({
            **gdata,
            "current": current,
            "target": target,
            "progress_percent": round(min(100, (current / target * 100)) if target > 0 else 0, 1),
            "completed": completed,
            "reward_active": active_bonus is not None,
            "reward_expires": (active_bonus or {}).get("expires_at"),
        })
    return {"goals": goals}


@router.post("/economy/contribute-communal")
async def contribute_communal(data: dict = Body(...), user=Depends(get_current_user)):
    """Contribute to a communal goal (called automatically by wellness/mining activities)."""
    goal_id = data.get("goal_id")
    contribution = data.get("contribution", 1)

    if goal_id not in COMMUNAL_GOALS:
        raise HTTPException(400, f"Unknown goal: {goal_id}")

    goal = COMMUNAL_GOALS[goal_id]
    now = datetime.now(timezone.utc)

    # Update progress
    await db.communal_progress.update_one(
        {"goal_id": goal_id},
        {"$inc": {"current": contribution}, "$set": {"updated_at": now.isoformat()}},
        upsert=True,
    )

    # Check if goal reached
    progress = await db.communal_progress.find_one({"goal_id": goal_id}, {"_id": 0})
    current = (progress or {}).get("current", 0)
    target = goal.get("target_meditations") or goal.get("target_mines") or goal.get("target_frequency_sessions", 0)

    reward_triggered = False
    if current >= target:
        # Check if reward already active
        existing_bonus = await db.communal_bonuses.find_one(
            {"goal_id": goal_id, "expires_at": {"$gt": now.isoformat()}}
        )
        if not existing_bonus:
            # Activate communal reward
            duration = goal.get("reward_duration_hours", 168)
            expires = now + timedelta(hours=duration)

            bonus_doc = {
                "goal_id": goal_id,
                "type": "exchange_rate" if goal_id == "enlightenment" else goal.get("reward_type", "misc"),
                "bonus_reduction": goal.get("reward_rate_bonus", 0),
                "multiplier": goal.get("reward_multiplier", 1.0),
                "activated_at": now.isoformat(),
                "expires_at": expires.isoformat(),
            }
            await db.communal_bonuses.insert_one(bonus_doc)
            reward_triggered = True

            # Reset progress for next cycle
            await db.communal_progress.update_one(
                {"goal_id": goal_id}, {"$set": {"current": 0}}
            )

    return {
        "contributed": True,
        "goal_id": goal_id,
        "contribution": contribution,
        "new_total": current,
        "target": target,
        "reward_triggered": reward_triggered,
    }

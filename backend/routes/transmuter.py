"""
Transmuter Routes — Waste-to-Value Liquidity Controller
Connects Digital Dust to the Marketplace Trader via Phi Cap exchange.
Generates Sacred Blueprints with White Light Encryption.

KERNEL: V30.2
PROTOCOL: Waste-to-Value Loop
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user
from datetime import datetime, timezone
from utils.master_transmuter import (
    TRANSMUTER,
    TIERS,
    TIER_DYNAMICS,
    SUBSCRIPTION_TO_TRANSMUTER,
    SUBSCRIPTION_TO_TIER_NAME,
    DUST_COMPLEXITY_REWARDS,
    BASE_PHI_EXCHANGE,
    PHI,
    TIER_RATIOS,
    SCHOLARSHIP_TAX_RATE,
)
from utils.credits import modify_credits, get_user_credits
import uuid

router = APIRouter(prefix="/transmuter", tags=["Master Transmuter"])


async def get_user_tier(user_id: str) -> int:
    """Resolve user's transmuter tier from their subscription."""
    sub = await db.subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_name = (sub or {}).get("tier", "discovery")
    return SUBSCRIPTION_TO_TRANSMUTER.get(tier_name, 1)


async def get_user_tier_name(user_id: str) -> str:
    """Resolve user's tier NAME from their subscription."""
    sub = await db.subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    tier_name = (sub or {}).get("tier", "discovery")
    return SUBSCRIPTION_TO_TIER_NAME.get(tier_name, "SEED")


async def get_wallet(user_id: str) -> dict:
    """Get or create the user's hub wallet (Dust + Gems)."""
    wallet = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "dust": 500,
            "gems": 0,
            "total_dust_earned": 0,
            "total_dust_spent": 0,
            "total_gems_earned": 0,
            "total_gems_spent": 0,
            "transmutation_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.hub_wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


async def get_market_activity() -> float:
    """Calculate market activity index based on recent transactions."""
    now = datetime.now(timezone.utc)
    one_hour_ago = datetime(
        now.year, now.month, now.day, now.hour, 0, 0, tzinfo=timezone.utc
    ).isoformat()
    count = await db.transmuter_log.count_documents(
        {"created_at": {"$gte": one_hour_ago}}
    )
    return max(0.1, min(10.0, count / 5.0))


@router.get("/status")
async def get_transmuter_status(user=Depends(get_current_user)):
    """Get the full Transmuter status: wallet, tier, exchange rate, and complexity rewards."""
    user_id = user["id"]
    wallet = await get_wallet(user_id)
    tier = await get_user_tier(user_id)
    fans = await get_user_credits(user_id)
    activity = await get_market_activity()
    exchange_rate = TRANSMUTER.calculate_phi_exchange_rate(activity)

    # Recent transmuter transactions
    recent = await db.transmuter_log.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)

    # Total conversions
    total_conversions = await db.transmuter_log.count_documents(
        {"user_id": user_id, "type": "dust_to_fans"}
    )

    return {
        "dust_balance": wallet["dust"],
        "gems_balance": wallet["gems"],
        "fans_balance": fans,
        "tier": tier,
        "tier_name": TIERS.get(tier, "SEED"),
        "tier_dynamics": TRANSMUTER.get_tier_dynamics(TIERS.get(tier, "SEED")),
        "tier_ratios": TIER_RATIOS,
        "all_tier_dynamics": TIER_DYNAMICS,
        "scholarship_tax_rate": SCHOLARSHIP_TAX_RATE,
        "exchange_rate": exchange_rate,
        "base_exchange_rate": BASE_PHI_EXCHANGE,
        "phi_constant": PHI,
        "market_activity": round(activity, 2),
        "total_dust_earned": wallet.get("total_dust_earned", 0),
        "total_conversions": total_conversions,
        "complexity_rewards": DUST_COMPLEXITY_REWARDS,
        "recent_transactions": recent,
    }


@router.post("/trade-dust-to-fans")
async def trade_dust_to_fans(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Convert Digital Dust to Fans via the Phi Cap exchange.
    The Marketplace Trader acts as a Liquidity Controller.
    """
    user_id = user["id"]
    dust_amount = data.get("dust_amount", 0)

    if not isinstance(dust_amount, int) or dust_amount <= 0:
        raise HTTPException(400, "dust_amount must be a positive integer")

    wallet = await get_wallet(user_id)
    if wallet["dust"] < dust_amount:
        raise HTTPException(
            400,
            f"Insufficient Dust. Have {wallet['dust']}, need {dust_amount}.",
        )

    activity = await get_market_activity()
    exchange_rate = TRANSMUTER.calculate_phi_exchange_rate(activity)

    if dust_amount < exchange_rate:
        raise HTTPException(
            400,
            f"Minimum conversion: {exchange_rate} Dust (= 1 Fan at current Phi Cap rate)",
        )

    conversion = TRANSMUTER.calculate_conversion(dust_amount, exchange_rate)
    fans_earned = conversion["fans_earned"]
    dust_consumed = conversion["dust_consumed"]

    if fans_earned <= 0:
        raise HTTPException(400, "Not enough Dust for even 1 Fan at current rate")

    now = datetime.now(timezone.utc).isoformat()

    # Deduct dust from wallet
    await db.hub_wallets.update_one(
        {"user_id": user_id},
        {"$inc": {"dust": -dust_consumed, "total_dust_spent": dust_consumed}},
    )

    # Credit fans
    new_fan_balance = await modify_credits(user_id, fans_earned, "transmuter_dust_to_fans")

    # Log transaction
    tx_id = str(uuid.uuid4())
    await db.transmuter_log.insert_one({
        "id": tx_id,
        "user_id": user_id,
        "type": "dust_to_fans",
        "dust_consumed": dust_consumed,
        "fans_earned": fans_earned,
        "exchange_rate": exchange_rate,
        "market_activity": round(activity, 2),
        "created_at": now,
    })

    updated_wallet = await get_wallet(user_id)
    return {
        "converted": True,
        "dust_consumed": dust_consumed,
        "fans_earned": fans_earned,
        "exchange_rate": exchange_rate,
        "dust_remaining": updated_wallet["dust"],
        "fans_balance": new_fan_balance,
        "transaction_id": tx_id,
    }


@router.post("/accrue-dust")
async def accrue_dust(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Accrue Digital Dust from module interactions.
    Called by modules to log Dust accumulation based on task complexity.
    """
    user_id = user["id"]
    action = data.get("action", "module_interaction")
    complexity = data.get("complexity", 1.0)
    source_module = data.get("source_module", "unknown")

    if not isinstance(complexity, (int, float)) or complexity <= 0:
        complexity = 1.0

    complexity = min(5.0, complexity)
    dust_reward = TRANSMUTER.calculate_dust_reward(action, complexity)

    await get_wallet(user_id)
    await db.hub_wallets.update_one(
        {"user_id": user_id},
        {"$inc": {"dust": dust_reward, "total_dust_earned": dust_reward}},
    )

    now = datetime.now(timezone.utc).isoformat()
    await db.transmuter_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "dust_accrual",
        "action": action,
        "complexity": round(complexity, 2),
        "dust_earned": dust_reward,
        "source_module": source_module,
        "created_at": now,
    })

    updated_wallet = await get_wallet(user_id)
    return {
        "accrued": True,
        "dust_earned": dust_reward,
        "action": action,
        "complexity": round(complexity, 2),
        "dust_balance": updated_wallet["dust"],
    }


@router.post("/generate-blueprint")
async def generate_blueprint(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Generate a Sacred Blueprint with tier-gated math overlays.
    Sovereign tier receives White Light Encryption (Rainbow Refraction).
    """
    user_id = user["id"]
    length = data.get("length", 12)
    width = data.get("width", 12)
    trade_type = data.get("trade_type", "Carpentry")

    if not isinstance(length, (int, float)) or length <= 0:
        raise HTTPException(400, "length must be positive")
    if not isinstance(width, (int, float)) or width <= 0:
        raise HTTPException(400, "width must be positive")

    tier = await get_user_tier(user_id)
    blueprint = TRANSMUTER.master_generator(length, width, trade_type, tier)

    # Award dust for blueprint generation
    dust_reward = TRANSMUTER.calculate_dust_reward("blueprint_generation", 1.5)
    await get_wallet(user_id)
    await db.hub_wallets.update_one(
        {"user_id": user_id},
        {"$inc": {"dust": dust_reward, "total_dust_earned": dust_reward}},
    )

    now = datetime.now(timezone.utc).isoformat()

    # Store blueprint
    blueprint_id = str(uuid.uuid4())
    await db.sacred_blueprints.insert_one({
        "id": blueprint_id,
        "user_id": user_id,
        "blueprint": blueprint,
        "dust_rewarded": dust_reward,
        "created_at": now,
    })

    # Log
    await db.transmuter_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "blueprint_generation",
        "blueprint_id": blueprint_id,
        "tier": tier,
        "dust_earned": dust_reward,
        "created_at": now,
    })

    return {
        "blueprint": blueprint,
        "blueprint_id": blueprint_id,
        "dust_rewarded": dust_reward,
        "tier": tier,
        "tier_name": TIERS.get(tier, "SEED"),
    }


@router.get("/blueprints")
async def get_user_blueprints(user=Depends(get_current_user)):
    """Get all Sacred Blueprints generated by this user."""
    blueprints = await db.sacred_blueprints.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return {"blueprints": blueprints, "total": len(blueprints)}


@router.get("/history")
async def get_transmuter_history(
    user=Depends(get_current_user), skip: int = 0, limit: int = 30
):
    """Get the user's Transmuter transaction history."""
    entries = await db.transmuter_log.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.transmuter_log.count_documents({"user_id": user["id"]})
    return {"entries": entries, "total": total}


@router.get("/exchange-preview")
async def preview_exchange(dust_amount: int = 1618, user=Depends(get_current_user)):
    """Preview a Dust-to-Fans conversion without executing it."""
    activity = await get_market_activity()
    exchange_rate = TRANSMUTER.calculate_phi_exchange_rate(activity)
    conversion = TRANSMUTER.calculate_conversion(dust_amount, exchange_rate)
    return {
        "dust_amount": dust_amount,
        "exchange_rate": exchange_rate,
        "fans_you_would_receive": conversion["fans_earned"],
        "dust_consumed": conversion["dust_consumed"],
        "dust_remainder": conversion["dust_remainder"],
        "market_activity": round(activity, 2),
    }


@router.post("/transmute")
async def execute_transmutation(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Sovereign Engine Alchemy: apply Fibonacci accrual, Phi Cap, and Scholarship Tax.
    Input Dust is transmuted with tier-based ratios.
    """
    user_id = user["id"]
    input_amount = data.get("input_amount", 100)

    if not isinstance(input_amount, (int, float)) or input_amount <= 0:
        raise HTTPException(400, "input_amount must be positive")

    wallet = await get_wallet(user_id)
    if wallet["dust"] < input_amount:
        raise HTTPException(400, f"Insufficient Dust. Have {wallet['dust']}, need {input_amount}.")

    tier = await get_user_tier(user_id)
    result = TRANSMUTER.transmute(input_amount, tier)
    now = datetime.now(timezone.utc).isoformat()

    net_dust = int(result["net_result"])
    tax_dust = int(result["tax_amount"])

    # Deduct input, credit net result (input transforms into output)
    # Net effect: user loses input_amount, gains net_result
    dust_delta = net_dust - int(input_amount)
    await db.hub_wallets.update_one(
        {"user_id": user_id},
        {"$inc": {"dust": dust_delta}},
    )

    # Tax goes to community/master ledger
    if tax_dust > 0:
        await db.hub_wallets.update_one(
            {"user_id": "sovereign_master"},
            {"$inc": {"dust": tax_dust, "total_dust_earned": tax_dust}},
            upsert=True,
        )

    # Log
    tx_id = str(uuid.uuid4())
    await db.transmuter_log.insert_one({
        "id": tx_id,
        "user_id": user_id,
        "type": "alchemy",
        "input_amount": int(input_amount),
        "net_result": net_dust,
        "tax_amount": tax_dust,
        "capped_output": int(result["capped_output"]),
        "tier_ratio": result["tier_ratio"],
        "tax_rate": result["tax_rate"],
        "tier_name": result["tier_name"],
        "phi_cap_applied": result["phi_cap_applied"],
        "created_at": now,
    })

    updated_wallet = await get_wallet(user_id)
    return {
        "transmuted": True,
        "input_amount": int(input_amount),
        "net_result": net_dust,
        "tax_amount": tax_dust,
        "capped_output": int(result["capped_output"]),
        "tier_ratio": result["tier_ratio"],
        "tax_rate": result["tax_rate"],
        "tier_name": result["tier_name"],
        "phi_cap_applied": result["phi_cap_applied"],
        "dust_balance": updated_wallet["dust"],
        "transaction_id": tx_id,
    }


@router.post("/work-submit")
async def work_submit(data: dict = Body(...), user=Depends(get_current_user)):
    """
    V34.0 Unified Work Endpoint — Inverse Exponential Surge.
    All modules call this. Accepts session_duration + resonance_score for exponential math.
    """
    user_id = user["id"]
    module = data.get("module", "unknown")
    interaction_weight = data.get("interaction_weight", 10)
    session_duration = data.get("session_duration", 0)
    resonance_score = data.get("resonance_score", 0.5)

    if not isinstance(interaction_weight, (int, float)) or interaction_weight <= 0:
        interaction_weight = 10
    if not isinstance(session_duration, (int, float)) or session_duration < 0:
        session_duration = 0
    if not isinstance(resonance_score, (int, float)):
        resonance_score = 0.5
    resonance_score = max(0.0, min(1.0, resonance_score))

    interaction_weight = min(1000, interaction_weight)
    tier_name = await get_user_tier_name(user_id)
    result = TRANSMUTER.process_interaction(
        tier_name, module, interaction_weight,
        session_duration=session_duration,
        resonance_score=resonance_score,
    )

    earned = max(1, int(result["earned"]))
    taxed = int(result["taxed_to_master"])
    now = datetime.now(timezone.utc).isoformat()

    # Credit user
    await get_wallet(user_id)
    await db.hub_wallets.update_one(
        {"user_id": user_id},
        {"$inc": {"dust": earned, "total_dust_earned": earned}},
    )

    # Tax to master ledger
    if taxed > 0:
        await db.hub_wallets.update_one(
            {"user_id": "sovereign_master"},
            {"$inc": {"dust": taxed, "total_dust_earned": taxed}},
            upsert=True,
        )

    # Log silently
    await db.transmuter_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "work_submit",
        "module": module,
        "interaction_weight": interaction_weight,
        "session_duration": session_duration,
        "resonance_score": resonance_score,
        "earned": earned,
        "taxed": taxed,
        "tier": tier_name,
        "ratio": result["ratio"],
        "tax_rate": result["tax_rate"],
        "inverse_multiplier": result.get("inverse_multiplier", 1.0),
        "math_version": result.get("math_version", "V34.0"),
        "created_at": now,
    })

    updated_wallet = await get_wallet(user_id)
    return {
        "accrued": True,
        "earned": earned,
        "taxed_to_master": taxed,
        "tier": tier_name,
        "ratio": result["ratio"],
        "tax_rate": result["tax_rate"],
        "dust_balance": updated_wallet["dust"],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━�
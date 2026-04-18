"""
V68.3 — SPARKS ENGINE + GAMING CARDS
Sparks = discovery currency (earned through identification, quests, milestones)
Gaming Cards = functional power-ups dropped at Spark milestones
Immersion Timer = 1 Dust per 60s in VR zones
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user

router = APIRouter()

GAMING_CARDS = [
    {"id": "starseed_initiate", "name": "Starseed Initiate", "tier": "common", "color": "#A78BFA",
     "spark_threshold": 500, "desc": "Your first step into the cosmic lattice. Grants +10% Dust accrual in all VR zones.",
     "effect": {"type": "dust_multiplier", "value": 1.1, "zones": ["celestial_dome", "dream_realms", "starseed_adventure"]}},
    {"id": "celestial_navigator", "name": "Celestial Navigator", "tier": "uncommon", "color": "#3B82F6",
     "spark_threshold": 1500, "desc": "You can read the sky. Unlocks real-time meteor showers and ISS pass tracking.",
     "effect": {"type": "unlock_feature", "value": "live_events_realtime"}},
    {"id": "master_craftsman", "name": "Master Craftsman", "tier": "uncommon", "color": "#FBBF24",
     "spark_threshold": 3000, "desc": "Your hands know every trade. +25% XP in all Workshop modules.",
     "effect": {"type": "xp_multiplier", "value": 1.25, "zones": ["workshop"]}},
    {"id": "oracle_seer", "name": "Oracle Seer", "tier": "rare", "color": "#22C55E",
     "spark_threshold": 5000, "desc": "The Oracle reveals hidden connections. Search results show secret cross-domain bridges.",
     "effect": {"type": "unlock_feature", "value": "oracle_hidden_bridges"}},
    {"id": "tesseract_key", "name": "Tesseract Key", "tier": "rare", "color": "#8B5CF6",
     "spark_threshold": 7500, "desc": "Opens dimensional gates. Unlocks the Tesseract Experience at full depth.",
     "effect": {"type": "unlock_feature", "value": "tesseract_full"}},
    {"id": "sovereign_crown", "name": "Sovereign Crown", "tier": "legendary", "color": "#D4AF37",
     "spark_threshold": 15000, "desc": "You mastered the lattice. Sovereign title and all-access to every depth and tool.",
     "effect": {"type": "full_access", "value": True}},
]

SPARK_REWARDS = {
    "constellation_identify": 25,
    "constellation_complete": 200,
    "deep_sky_discover": 50,
    "workshop_material_dive": 15,
    "workshop_tool_use": 10,
    "quest_complete": 100,
    "starseed_chapter": 30,
    "dream_portal": 20,
    "immersion_minute": 1,
    "first_login_daily": 15,
    "planet_sonify": 10,
    "star_inspect": 8,
}


async def get_spark_wallet(user_id: str, role: str = "user") -> dict:
    wallet = await db.spark_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        starting = 100 if role in ("admin", "creator", "council") else 0
        wallet = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "sparks": starting,
            "total_earned": starting,
            "total_spent": 0,
            "cards_earned": [],
            "discoveries": [],
            "immersion_seconds": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.spark_wallets.insert_one(wallet)
        wallet.pop("_id", None)
    return wallet


@router.get("/sparks/wallet")
async def get_sparks(user=Depends(get_current_user)):
    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    sparks = wallet["sparks"]
    # Threshold-based cards
    earned_ids = {c["id"] for c in GAMING_CARDS if sparks >= c["spark_threshold"]}
    # Add quest-reward cards persisted in wallet.cards_earned (deduped)
    for ce in wallet.get("cards_earned", []):
        cid = ce.get("card_id") if isinstance(ce, dict) else None
        if cid:
            earned_ids.add(cid)
    earned_cards = [c for c in GAMING_CARDS if c["id"] in earned_ids]
    # Next card = lowest-threshold unearned
    next_card = next((c for c in GAMING_CARDS if c["id"] not in earned_ids), None)
    return {
        "sparks": sparks,
        "total_earned": wallet["total_earned"],
        "cards_earned": earned_cards,
        "cards_total": len(GAMING_CARDS),
        "next_card": next_card,
        "sparks_to_next": (next_card["spark_threshold"] - sparks) if next_card else 0,
        "discoveries_count": len(wallet.get("discoveries", [])),
        "immersion_minutes": wallet.get("immersion_seconds", 0) // 60,
    }


@router.post("/sparks/earn")
async def earn_sparks(data: dict = Body(...), user=Depends(get_current_user)):
    action = data.get("action", "")
    context = data.get("context", "")
    reward = SPARK_REWARDS.get(action, 0)
    if reward == 0:
        raise HTTPException(status_code=400, detail=f"Unknown spark action: {action}")

    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    discovery_key = f"{action}:{context}" if context else None
    if discovery_key and discovery_key in wallet.get("discoveries", []):
        return {"sparks": wallet["sparks"], "earned": 0, "reason": "already_discovered"}

    new_total = wallet["sparks"] + reward
    update = {"$inc": {"sparks": reward, "total_earned": reward}}
    if discovery_key:
        update["$push"] = {"discoveries": discovery_key}
    await db.spark_wallets.update_one({"user_id": user["id"]}, update)

    # Check for new card unlocks
    new_cards = []
    for card in GAMING_CARDS:
        if new_total >= card["spark_threshold"] and wallet["sparks"] < card["spark_threshold"]:
            new_cards.append(card)
            await db.spark_wallets.update_one(
                {"user_id": user["id"]},
                {"$push": {"cards_earned": {"card_id": card["id"], "earned_at": datetime.now(timezone.utc).isoformat()}}}
            )

    return {
        "sparks": new_total,
        "earned": reward,
        "action": action,
        "new_cards": new_cards,
    }


@router.post("/sparks/immersion")
async def log_immersion(data: dict = Body(...), user=Depends(get_current_user)):
    seconds = min(data.get("seconds", 0), 300)
    zone = data.get("zone", "unknown")
    if seconds <= 0:
        return {"sparks_earned": 0}

    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    old_seconds = wallet.get("immersion_seconds", 0)
    new_seconds = old_seconds + seconds
    sparks_earned = (new_seconds // 60) - (old_seconds // 60)

    update = {"$inc": {"immersion_seconds": seconds}}
    if sparks_earned > 0:
        update["$inc"]["sparks"] = sparks_earned
        update["$inc"]["total_earned"] = sparks_earned
    await db.spark_wallets.update_one({"user_id": user["id"]}, update)

    return {"sparks_earned": sparks_earned, "total_immersion_minutes": new_seconds // 60, "zone": zone}


@router.get("/sparks/cards")
async def get_all_cards(user=Depends(get_current_user)):
    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    sparks = wallet["sparks"]
    # Union of threshold + quest-reward cards
    quest_reward_ids = {ce.get("card_id") for ce in wallet.get("cards_earned", []) if isinstance(ce, dict)}
    cards = [{
        **c,
        "earned": (sparks >= c["spark_threshold"]) or (c["id"] in quest_reward_ids),
        "progress": round(min(sparks / c["spark_threshold"], 1.0), 3),
    } for c in GAMING_CARDS]
    return {"cards": cards, "sparks": sparks}


@router.get("/sparks/rewards")
async def get_reward_table():
    return {"rewards": SPARK_REWARDS, "cards": GAMING_CARDS}

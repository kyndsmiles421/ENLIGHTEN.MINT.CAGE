"""
cosmetic_bundles.py — Sovereign Cosmetic Store (v1)

Curated, credit-purchasable cosmetic bundles that drop equipped RPG gear
into the user's wardrobe. Because the Metabolic Mirror binds equipped gear
to the 3D CrystallineSilhouette at the center of the Fractal Engine, a
purchase here creates an INSTANT, VISCERAL, VISUAL change in the main 3D
stage — the single highest-conversion surface in the app.

Currency: Credits / Sparks (the unified closed-loop economy).
  - 10 credits/hr earned via presence (free)
  - Acquired credits via Stripe top-up on the web (full revenue → you)

Initial 3 tiers (edit live in Mongo without redeploy):
  • SOVEREIGN_GOLD       — 2,500 credits — Celestial Mantle (legendary body),
                           Crown of Awareness (rare head), Eye of the Cosmos (legendary trinket)
  • ORACLE_VIOLET        — 1,200 credits — Veil of the Oracle (epic head),
                           Robe of Tranquility (uncommon body)
  • ARTISAN_OBSIDIAN     — 450 credits  — Monk's Hood (uncommon head),
                           Obsidian Amulet (common trinket)

API:
  GET  /api/cosmetic-bundles                 → list bundles + owned/price info
  POST /api/cosmetic-bundles/purchase        → spend credits, auto-equip gear,
                                               fire sovereign:gear-change event
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Body

from deps import db, get_current_user

router = APIRouter(prefix="/cosmetic-bundles", tags=["cosmetics"])

# ─── Bundle catalogue (seeded on first GET if Mongo collection is empty) ──
DEFAULT_BUNDLES = [
    {
        "id": "sovereign_gold",
        "name": "Sovereign Gold",
        "tagline": "The vestments of a completed sovereign",
        "price_credits": 2500,
        "accent_color": "#D4AF37",
        "items": [
            {"slot": "body",    "template_name": "Celestial Mantle",     "rarity": "legendary", "rarity_color": "#F59E0B"},
            {"slot": "head",    "template_name": "Crown of Awareness",   "rarity": "rare",      "rarity_color": "#3B82F6"},
            {"slot": "trinket", "template_name": "Eye of the Cosmos",    "rarity": "legendary", "rarity_color": "#F59E0B"},
        ],
        "sort_order": 1,
    },
    {
        "id": "oracle_violet",
        "name": "Oracle Violet",
        "tagline": "For the seer who reads the lattice",
        "price_credits": 1200,
        "accent_color": "#A855F7",
        "items": [
            {"slot": "head", "template_name": "Veil of the Oracle",  "rarity": "epic",     "rarity_color": "#A855F7"},
            {"slot": "body", "template_name": "Robe of Tranquility", "rarity": "uncommon", "rarity_color": "#22C55E"},
        ],
        "sort_order": 2,
    },
    {
        "id": "artisan_obsidian",
        "name": "Artisan Obsidian",
        "tagline": "Quiet focus, deep work",
        "price_credits": 450,
        "accent_color": "#6D28D9",
        "items": [
            {"slot": "head",    "template_name": "Monk's Hood",     "rarity": "uncommon", "rarity_color": "#22C55E"},
            {"slot": "trinket", "template_name": "Obsidian Amulet", "rarity": "common",   "rarity_color": "#9CA3AF"},
        ],
        "sort_order": 3,
    },
]


async def _ensure_seed():
    """Seed the bundle catalog once — idempotent."""
    count = await db.cosmetic_bundles.count_documents({})
    if count == 0:
        for b in DEFAULT_BUNDLES:
            await db.cosmetic_bundles.insert_one({**b, "seeded_at": datetime.now(timezone.utc).isoformat()})


async def _get_credit_balance(user_id: str) -> int:
    """Unified Sparks balance — the closed-loop credit used for all in-app spending."""
    wallet = await db.spark_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if wallet:
        return int(wallet.get("sparks", 0))
    hub = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if hub:
        return int(hub.get("dust", 0))
    return 0


async def _debit_credits(user_id: str, amount: int) -> int:
    """Atomically subtract credits from Sparks wallet; falls back to hub_wallets."""
    res = await db.spark_wallets.find_one_and_update(
        {"user_id": user_id, "sparks": {"$gte": amount}},
        {"$inc": {"sparks": -amount, "total_spent": amount}},
        return_document=True,
        projection={"_id": 0},
    )
    if res is not None:
        return int(res.get("sparks", 0))
    res2 = await db.hub_wallets.find_one_and_update(
        {"user_id": user_id, "dust": {"$gte": amount}},
        {"$inc": {"dust": -amount}},
        return_document=True,
        projection={"_id": 0},
    )
    if res2 is not None:
        return int(res2.get("dust", 0))
    raise HTTPException(402, "Insufficient credits")


@router.get("")
async def list_bundles(user=Depends(get_current_user)):
    await _ensure_seed()
    bundles = await db.cosmetic_bundles.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    owned = await db.owned_cosmetic_bundles.find(
        {"user_id": user["id"]}, {"_id": 0, "bundle_id": 1}
    ).to_list(50)
    owned_ids = {o["bundle_id"] for o in owned}
    balance = await _get_credit_balance(user["id"])
    for b in bundles:
        b["owned"] = b["id"] in owned_ids
        b["can_afford"] = balance >= b.get("price_credits", 0)
    return {"bundles": bundles, "credit_balance": balance}


@router.post("/purchase")
async def purchase_bundle(body: dict = Body(...), user=Depends(get_current_user)):
    bundle_id = body.get("bundle_id")
    if not bundle_id:
        raise HTTPException(400, "bundle_id required")
    bundle = await db.cosmetic_bundles.find_one({"id": bundle_id}, {"_id": 0})
    if not bundle:
        raise HTTPException(404, "Bundle not found")

    already = await db.owned_cosmetic_bundles.find_one(
        {"user_id": user["id"], "bundle_id": bundle_id}, {"_id": 0}
    )
    if already:
        return {"status": "already_owned", "bundle_id": bundle_id}

    price = int(bundle.get("price_credits", 0))
    new_balance = await _debit_credits(user["id"], price)

    now = datetime.now(timezone.utc).isoformat()
    # Auto-equip each item in the bundle, overwriting the current slot.
    # Items are stored in rpg_equipped — the same collection the Fractal
    # Engine's Metabolic Mirror reads from.
    for item in bundle.get("items", []):
        slot = item["slot"]
        await db.rpg_equipped.update_one(
            {"user_id": user["id"], "slot": slot},
            {"$set": {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "slot": slot,
                "template_name": item.get("template_name"),
                "name": item.get("template_name"),
                "rarity": item.get("rarity"),
                "rarity_color": item.get("rarity_color"),
                "source": f"cosmetic_bundle:{bundle_id}",
                "equipped_at": now,
            }},
            upsert=True,
        )

    # Record ownership so the user can re-equip later without re-paying.
    await db.owned_cosmetic_bundles.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "bundle_id": bundle_id,
        "price_paid": price,
        "purchased_at": now,
    })

    return {
        "status": "purchased",
        "bundle_id": bundle_id,
        "items_equipped": bundle.get("items", []),
        "price_paid": price,
        "credit_balance": new_balance,
    }

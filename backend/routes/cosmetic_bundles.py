"""
cosmetic_bundles.py — Sovereign Cosmetic Store (v1)

Curated, **DUST**-purchasable cosmetic bundles that drop equipped RPG gear
into the user's wardrobe. The Fractal Engine's Metabolic Mirror binds
equipped gear to the 3D CrystallineSilhouette at the center of the lattice,
so a purchase here creates an INSTANT, VISCERAL, VISUAL change in the
main 3D stage.

Currency rules (per CREDIT_SYSTEM.md — DO NOT DEVIATE):
  • **Sparks ✨** are RANK / MERIT / XP — earned only, NEVER spent.
    Flying through orbs, completing quests, and logging presence all
    grant Sparks. They display tier, unlock Council Stacking, and pay
    out in bragging rights — never in access.
  • **Dust ✦** is the SPENDABLE currency — acquired via Stripe top-up
    on the web (never inside the Android TWA) OR earned via quests &
    presence rewards. Cosmetic bundles cost Dust.
  • There is NO path to convert either currency back to USD.

Initial 3 bundles (price in Dust, editable live via Mongo):
  • SOVEREIGN_GOLD    — 2,500 ✦  (legendary body + rare head + legendary trinket)
  • ORACLE_VIOLET     — 1,200 ✦  (epic head + uncommon body)
  • ARTISAN_OBSIDIAN  —   450 ✦  (uncommon head + common trinket)

API:
  GET  /api/cosmetic-bundles           → list bundles + owned/price/can_afford
  POST /api/cosmetic-bundles/purchase  → spend Dust, auto-equip gear
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
        "price_dust": 2500,
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
        "price_dust": 1200,
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
        "price_dust": 450,
        "accent_color": "#6D28D9",
        "items": [
            {"slot": "head",    "template_name": "Monk's Hood",     "rarity": "uncommon", "rarity_color": "#22C55E"},
            {"slot": "trinket", "template_name": "Obsidian Amulet", "rarity": "common",   "rarity_color": "#9CA3AF"},
        ],
        "sort_order": 3,
    },
]


async def _ensure_seed():
    """Seed the bundle catalog once — idempotent.

    Also migrates any legacy `price_credits` field to the canonical
    `price_dust` field so older seeded docs show the right currency.
    """
    count = await db.cosmetic_bundles.count_documents({})
    if count == 0:
        for b in DEFAULT_BUNDLES:
            await db.cosmetic_bundles.insert_one({**b, "seeded_at": datetime.now(timezone.utc).isoformat()})
        return
    # One-shot migration: mirror price_credits → price_dust where missing.
    async for legacy in db.cosmetic_bundles.find({"price_credits": {"$exists": True}, "price_dust": {"$exists": False}}, {"_id": 0, "id": 1, "price_credits": 1}):
        await db.cosmetic_bundles.update_one(
            {"id": legacy["id"]},
            {"$set": {"price_dust": int(legacy["price_credits"])}},
        )


async def _get_dust_balance(user_id: str) -> int:
    """Dust is the ONLY spendable currency in the cosmetic store.

    Per CREDIT_SYSTEM.md §2: Sparks are earned-only rank/merit display —
    they are NEVER spent on purchases. Dust is the acquired currency
    (Stripe top-up OR quest/presence rewards) that actually pays for
    learning modules, workshops, crystalline scenes, and cosmetic skins.

    Do NOT fall back to Sparks here — that would conflate the two
    currencies and break the closed-loop model disclosed to Google Play.
    """
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_dust_balance": 1})
    return int((u or {}).get("user_dust_balance", 0))


async def _debit_dust(user_id: str, amount: int) -> int:
    """Atomically subtract Dust from the user document."""
    res = await db.users.find_one_and_update(
        {"id": user_id, "user_dust_balance": {"$gte": amount}},
        {"$inc": {"user_dust_balance": -amount}},
        return_document=True,
        projection={"_id": 0, "user_dust_balance": 1},
    )
    if res is None:
        raise HTTPException(402, "Insufficient Dust — top up on the web (enlighten-mint-cafe.me/economy) or earn more via quests")
    return int(res.get("user_dust_balance", 0))


@router.get("")
async def list_bundles(user=Depends(get_current_user)):
    await _ensure_seed()
    bundles = await db.cosmetic_bundles.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    owned = await db.owned_cosmetic_bundles.find(
        {"user_id": user["id"]}, {"_id": 0, "bundle_id": 1}
    ).to_list(50)
    owned_ids = {o["bundle_id"] for o in owned}
    dust_balance = await _get_dust_balance(user["id"])
    for b in bundles:
        b["owned"] = b["id"] in owned_ids
        b["can_afford"] = dust_balance >= b.get("price_dust", b.get("price_credits", 0))
        # Canonical field is price_dust; keep price_credits alias for older clients.
        b["price_dust"] = b.get("price_dust", b.get("price_credits", 0))
    return {"bundles": bundles, "dust_balance": dust_balance, "currency": "dust"}


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

    price = int(bundle.get("price_dust", bundle.get("price_credits", 0)))
    new_balance = await _debit_dust(user["id"], price)

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
        "price_paid_dust": price,
        "purchased_at": now,
    })

    return {
        "status": "purchased",
        "bundle_id": bundle_id,
        "items_equipped": bundle.get("items", []),
        "price_paid_dust": price,
        "dust_balance": new_balance,
        "currency": "dust",
    }

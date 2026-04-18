"""
V68.5 — SOVEREIGN WALLET: Sparks + Dust firewall endpoint.

The Sovereign Engine enforces a strict firewall:
  • SPARKS = permanent merit (rank). Never spent. Milestone-gated only.
  • DUST   = spendable economy currency. Earned & traded.

This endpoint returns BOTH balances so the Hub UI can render them as
visually distinct pills without accidentally treating Sparks as spendable.

Dust transactions are not yet stream-logged (P1 follow-up); the `transactions`
array returns recent sovereign-ledger entries if present, else an empty list.
"""
from fastapi import APIRouter, Depends
from deps import db, get_current_user
from routes.sparks import get_spark_wallet, GAMING_CARDS

router = APIRouter()


def _rank_label(sparks: int, earned_card_ids: set) -> str:
    """Map total sparks to a human rank label — permanent merit, never spent."""
    if "sovereign_crown" in earned_card_ids or sparks >= 15000:
        return "SOVEREIGN"
    if "tesseract_key" in earned_card_ids or sparks >= 7500:
        return "ARCHITECT"
    if "oracle_seer" in earned_card_ids or sparks >= 5000:
        return "ORACLE"
    if "master_craftsman" in earned_card_ids or sparks >= 3000:
        return "ARTISAN"
    if "celestial_navigator" in earned_card_ids or sparks >= 1500:
        return "NAVIGATOR"
    if "starseed_initiate" in earned_card_ids or sparks >= 500:
        return "SEED"
    return "CITIZEN"


@router.get("/wallet/balance")
async def get_wallet_balance(user=Depends(get_current_user)):
    """Returns both currencies with clear labels so the UI can't conflate them."""
    wallet = await get_spark_wallet(user["id"], user.get("role", "user"))
    sparks = wallet["sparks"]
    earned_ids = {c["id"] for c in GAMING_CARDS if sparks >= c["spark_threshold"]}
    for ce in wallet.get("cards_earned", []):
        if isinstance(ce, dict) and ce.get("card_id"):
            earned_ids.add(ce["card_id"])

    # Dust balance lives on the user document (per V-FINAL Sovereign Ledger)
    user_doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "user_dust_balance": 1, "consciousness": 1},
    ) or {}
    dust = int(user_doc.get("user_dust_balance", 0))
    next_card = next((c for c in GAMING_CARDS if c["id"] not in earned_ids), None)

    return {
        # ── Merit (permanent, non-spendable) ──
        "rank": {
            "sparks": sparks,
            "total_earned": wallet["total_earned"],
            "label": _rank_label(sparks, earned_ids),
            "cards_count": len(earned_ids),
            "cards_total": len(GAMING_CARDS),
            "next_card": next_card,
            "sparks_to_next": (next_card["spark_threshold"] - sparks) if next_card else 0,
            "note": "Sparks are permanent merit. Never spent. Gaming Cards unlock at thresholds.",
        },
        # ── Economy (spendable) ──
        "balance": {
            "dust": dust,
            "note": "Dust is your spendable currency. Convert to Credits via /api/marketplace/convert-dust.",
        },
    }


@router.get("/wallet/dust-ledger")
async def get_dust_ledger(user=Depends(get_current_user), limit: int = 50):
    """Dust transaction history. Best-effort — reads from dust_events collection
    (stream-logged for new transactions). Legacy dust increments are not replayed."""
    user_doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "user_dust_balance": 1},
    ) or {}
    dust = int(user_doc.get("user_dust_balance", 0))

    cursor = db.dust_events.find(
        {"user_id": user["id"]},
        {"_id": 0},
    ).sort("ts", -1).limit(max(1, min(limit, 500)))
    transactions = await cursor.to_list(length=limit)

    return {
        "dust": dust,
        "transactions": transactions,
        "note": "Spendable Dust ledger. Sparks (merit) are tracked separately in /wallet/balance.",
    }

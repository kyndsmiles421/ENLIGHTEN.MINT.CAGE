"""
compliance_shield.py — Google Play Monetary Firewall
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Closed-Loop Declaration (what Google sees):
  • Monetary assets (Credits, Dust, Gems) are server-issued Virtual Goods
    that flow ONLY User → Advisor (the Trade Circle Central Bank). They
    NEVER transfer between users. This keeps us clear of Payments Policy
    § "Money transmission" and § "Real-money trading".

  • Merit assets (Sparks) are gamified experience points — they have zero
    cash value, cannot be purchased with real money, and only accumulate
    through exploration/discovery. Google treats these like achievements,
    so user-to-user gifting and conversion is allowed.

Every backend route that moves balances must call `assert_closed_loop()`
with the asset type and both user IDs. The ADVISOR sentinel represents
the server-side sink (AI Merchant / Cosmic Broker).
"""
from fastapi import HTTPException


# ─── Asset Classification ─────────────────────────────────────
MONETARY_ASSETS = frozenset({"credits", "dust", "gems"})
MERIT_ASSETS = frozenset({"sparks"})

# Server-side sentinel ID representing the Trade Circle Advisor / Central
# Bank. Any monetary transfer where from==ADVISOR or to==ADVISOR is the
# legal closed-loop User↔Advisor flow.
ADVISOR = "__ADVISOR__"


def is_monetary(asset_type: str) -> bool:
    return (asset_type or "").lower() in MONETARY_ASSETS


def is_merit(asset_type: str) -> bool:
    return (asset_type or "").lower() in MERIT_ASSETS


def asset_class(asset_type: str) -> str:
    """Returns 'monetary' | 'merit' | 'unknown' for a given asset type."""
    a = (asset_type or "").lower()
    if a in MONETARY_ASSETS:
        return "monetary"
    if a in MERIT_ASSETS:
        return "merit"
    return "unknown"


def assert_closed_loop(asset_type: str, from_user_id: str, to_user_id: str) -> None:
    """Raise HTTP 403 if a monetary asset is being moved between two users.
    Monetary flows MUST have ADVISOR on one side (User→Advisor or Advisor→User).

    Args:
        asset_type: one of MONETARY_ASSETS or MERIT_ASSETS.
        from_user_id: the payer. Pass ADVISOR if the server is the source.
        to_user_id:   the payee. Pass ADVISOR if the server is the sink.
    """
    if not is_monetary(asset_type):
        return  # merit flows are unrestricted
    if from_user_id == ADVISOR or to_user_id == ADVISOR:
        return  # legal User↔Advisor direction
    if from_user_id == to_user_id:
        return  # self-spend (e.g. spending own dust at own merchant view)
    raise HTTPException(
        status_code=403,
        detail=(
            f"Closed-Loop Asset — '{asset_type}' cannot be transferred between "
            f"users. Monetary assets flow only to the Trade Circle Advisor. "
            f"Use Sparks for merit-based exchange."
        ),
    )


# ─── Policy Manifest (exposed via API for transparency) ───────
def policy_manifest() -> dict:
    return {
        "version": "V68.76",
        "monetary_assets": sorted(MONETARY_ASSETS),
        "merit_assets": sorted(MERIT_ASSETS),
        "rules": [
            "Monetary assets (Credits/Dust/Gems) flow only between User and Advisor.",
            "User-to-user transfer of monetary assets returns HTTP 403.",
            "Merit (Sparks) may be awarded, gifted, or converted between users.",
            "Creators earn Sparks (not Credits) when their content is purchased.",
            "Real-money purchases (Stripe, Play Billing) mint Credits only.",
        ],
        "compliance_reference": "Google Play Payments Policy — Closed-Loop Virtual Goods",
    }

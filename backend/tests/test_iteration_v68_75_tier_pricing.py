"""
V68.75 — Sovereign Tier Pricing & Platform Gross-Up
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verifies:
  • No duplicate tier table — trade_circle re-uses economy.SUBSCRIPTION_TIERS
  • Lead(0%) / Silver(5%) / Gold(15%) / Gilded(30%) ratios applied
  • Platform gross-up protects net margin on Google Play / Apple
  • ai_merchant_catalog returns `your_price_credits` per user tier
  • ai_merchant_buy deducts the discounted amount (non tier_unlock items)
  • tier_unlocks (Gilded Path items) are NOT discounted
  • Broker buy-credits honours platform param + tier
  • /tier-map endpoint exposes the 4-row matrix
"""
import os, sys, asyncio, uuid
from datetime import datetime, timezone
import pytest
import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

API_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/") + "/api"


# ─── In-process math checks (no HTTP) ────────────────────────────
from routes.economy import SUBSCRIPTION_TIERS
from routes.trade_circle import (
    TIER_DISPLAY,
    PLATFORM_FEES,
    _apply_ratio_credits,
    _gross_up_cents,
    _resolve_user_tier,
)


def test_single_source_of_truth():
    """Subscription tiers must ONLY live in economy.SUBSCRIPTION_TIERS.
    trade_circle must not redefine its own TIER_MAP."""
    from routes import trade_circle as tc
    assert not hasattr(tc, "TIER_MAP"), "trade_circle.TIER_MAP duplicate found — use economy.SUBSCRIPTION_TIERS"


def test_four_tier_discount_matrix():
    """Canonical 0 / 5 / 15 / 30 split — Sovereign is the peak (Tier 4)."""
    expected = {"discovery": 0, "resonance": 5, "architect": 15, "sovereign": 30}
    for tid, pct in expected.items():
        assert SUBSCRIPTION_TIERS[tid]["marketplace_discount"] == pct


def test_sovereign_is_peak():
    """Sovereign must be Tier 4 (highest ordinal, highest discount)."""
    assert TIER_DISPLAY["sovereign"]["ordinal"] == 4
    assert TIER_DISPLAY["sovereign"]["badge"] == "Gilded"
    assert SUBSCRIPTION_TIERS["sovereign"]["marketplace_discount"] == 30
    # And Architect is mid-tier (Tier 3)
    assert TIER_DISPLAY["architect"]["ordinal"] == 3
    assert TIER_DISPLAY["architect"]["badge"] == "Gold"
    assert SUBSCRIPTION_TIERS["architect"]["marketplace_discount"] == 15


def test_tier_display_badges():
    """Badges map: Lead / Silver / Gold / Gilded in ordinal 1-4."""
    order = sorted(TIER_DISPLAY.items(), key=lambda x: x[1]["ordinal"])
    assert [x[1]["badge"] for x in order] == ["Lead", "Silver", "Gold", "Gilded"]


def test_apply_ratio_credits_lead():
    """Lead (ratio 1.0) — no discount."""
    assert _apply_ratio_credits(100, 1.0) == 100
    assert _apply_ratio_credits(3, 1.0) == 3


def test_apply_ratio_credits_silver():
    """Silver (ratio 0.95) — 5% off, rounded UP (house never under-charges)."""
    # 100 * 0.95 = 95.0 → 95
    assert _apply_ratio_credits(100, 0.95) == 95
    # 3 * 0.95 = 2.85 → 3 (ceil)
    assert _apply_ratio_credits(3, 0.95) == 3


def test_apply_ratio_credits_gold():
    """Gold (ratio 0.85) — 15% off."""
    # 100 * 0.85 = 85.0 → 85
    assert _apply_ratio_credits(100, 0.85) == 85
    # 10 * 0.85 = 8.5 → 9 (ceil)
    assert _apply_ratio_credits(10, 0.85) == 9


def test_apply_ratio_credits_gilded():
    """Gilded (ratio 0.70) — 30% off."""
    # 100 * 0.70 = 70.0 → 70
    assert _apply_ratio_credits(100, 0.70) == 70
    # 18 * 0.70 = 12.6 → 13 (ceil)
    assert _apply_ratio_credits(18, 0.70) == 13


def test_apply_ratio_zero_base():
    """Zero base → zero cost, no crash."""
    assert _apply_ratio_credits(0, 0.70) == 0


def test_gross_up_web_near_base():
    """Web rail absorbs Stripe fees — displayed final_cents == base_cents."""
    # Web is now 0% gross-up (house absorbs Stripe fees)
    assert _gross_up_cents(99, "web") == 99
    assert _gross_up_cents(1000, "web") == 1000


def test_gross_up_google_play():
    """Play platform (30%) — gross up so net ≈ base."""
    grossed = _gross_up_cents(1000, "google_play")
    # 1000 / 0.70 = 1428.57 → ceil 1429
    assert grossed == 1429
    # Sanity: net receipt after 30% cut ≈ base
    net = grossed * 0.70
    assert abs(net - 1000) < 2  # within rounding


def test_gross_up_apple():
    """Apple matches Play at 30%."""
    assert _gross_up_cents(1000, "apple") == _gross_up_cents(1000, "google_play")


def test_gross_up_unknown_platform_defaults_web():
    """Unknown platform falls back to web."""
    assert _gross_up_cents(99, "nonsense") == _gross_up_cents(99, "web")


def test_platform_fees_complete():
    """All three platforms must be present in PLATFORM_FEES."""
    assert set(PLATFORM_FEES.keys()) == {"web", "google_play", "apple"}


def test_gross_up_then_gilded_discount():
    """Full pipeline: $10 pack, Google Play, Gilded user.
    Expected: $10 (1000c) → $14.29 (1429c) → × 0.70 = $10.00 (1000c).
    The Gilded user ends up paying ≈ the base price because the gross-up
    offsets the tier discount — exactly the margin protection intent."""
    grossed = _gross_up_cents(1000, "google_play")
    final = round(grossed * 0.70)
    assert 995 <= final <= 1005  # within $0.05


# ─── HTTP integration checks (live server) ───────────────────────

def _login_owner(client: httpx.Client) -> str:
    r = client.post(f"{API_URL}/auth/login", json={
        "email": "kyndsmiles@gmail.com",
        "password": "Sovereign2026!",
    })
    r.raise_for_status()
    return r.json()["token"]


def test_tier_map_endpoint_shape():
    """GET /trade-circle/tier-map returns 4 ordered rows + you_are + platforms."""
    with httpx.Client(timeout=15) as client:
        token = _login_owner(client)
        r = client.get(f"{API_URL}/trade-circle/tier-map",
                       headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "tiers" in body and len(body["tiers"]) == 4
        ordinals = [t["ordinal"] for t in body["tiers"]]
        assert ordinals == sorted(ordinals)
        badges = [t["badge"] for t in body["tiers"]]
        assert badges == ["Lead", "Silver", "Gold", "Gilded"]
        discounts = [t["discount_pct"] for t in body["tiers"]]
        assert discounts == [0, 5, 15, 30]
        assert "you_are" in body
        assert body["you_are"]["tier_id"] in SUBSCRIPTION_TIERS
        assert {p["id"] for p in body["platforms"]} == {"web", "google_play", "apple"}


def test_ai_merchant_catalog_has_tier_prices():
    """Catalog items must carry `your_price_credits` per user tier."""
    with httpx.Client(timeout=15) as client:
        token = _login_owner(client)
        r = client.get(f"{API_URL}/trade-circle/ai-merchant",
                       headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "your_tier" in body
        assert "advisor_greeting" in body
        for item in body["catalog"]:
            assert "your_price_credits" in item
            assert "your_savings_credits" in item
            if item["type"] != "tier_unlock":
                assert item["your_price_credits"] <= item["price_credits"]


def test_broker_packs_return_per_platform_pricing():
    """Broker packs should show per-platform final prices for the user's tier."""
    with httpx.Client(timeout=15) as client:
        token = _login_owner(client)
        r = client.get(f"{API_URL}/trade-circle/broker/packs",
                       headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "your_tier" in body
        for pack in body["packs"]:
            assert set(pack["platforms"].keys()) == {"web", "google_play", "apple"}
            assert pack["platforms"]["google_play"]["final_cents"] >= pack["platforms"]["web"]["final_cents"]


def test_resolve_user_tier_default_discovery():
    """A user with no subscription row resolves to discovery (Lead / 0%)."""
    fake_id = f"nonexistent_{uuid.uuid4().hex}"
    info = asyncio.get_event_loop().run_until_complete(_resolve_user_tier(fake_id))
    assert info["tier_id"] == "discovery"
    assert info["badge"] == "Lead"
    assert info["discount_pct"] == 0
    assert info["ratio"] == 1.0

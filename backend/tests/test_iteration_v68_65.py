"""
test_iteration_v68_65.py — Omni-Utility Bridges
─────────────────────────────────────────────────────────────────────
Locks the V68.65 fixes:
  • /entity/{id} credits sparks on first-view + persists view
  • /entity/surface-area returns ratio + thinnest unexplored cells
  • Static route resolves BEFORE the dynamic /entity/{id}
  • Subscription + Marketplace endpoints still respond (no regression)
  • Anonymous calls don't crash and return zeros
"""
import os
import httpx
import uuid

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def _login():
    r = httpx.post(f"{API}/auth/login", json={
        "email": "kyndsmiles@gmail.com",
        "password": "Sovereign2026!",
    }, timeout=15)
    assert r.status_code == 200
    return r.json().get("token") or r.json().get("access_token")


def test_surface_area_resolves_static_route():
    """The static /entity/surface-area must resolve before the
    dynamic /entity/{id}. If it didn't, FastAPI would try to lookup
    'surface-area' as an entity and 404."""
    r = httpx.get(f"{API}/entity/surface-area", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "total" in d and isinstance(d["total"], int) and d["total"] > 0
    assert "viewed" in d and "ratio" in d
    assert "unexplored_sample" in d


def test_first_view_credits_sparks_subsequent_does_not():
    """Open a never-before-seen entity → discovery.is_first_view=True
    + sparks_credited > 0. Same entity again → both flags reset."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    # Use a unique-ish entity that's likely fresh for this user.
    # Pick one of the thinnest unexplored cells so we don't collide.
    surface = httpx.get(f"{API}/entity/surface-area", headers=headers, timeout=15).json()
    unexplored = surface.get("unexplored_sample", [])
    if not unexplored:
        # User has explored everything; mid-test fixture: just test
        # the contract on an existing entity (second-view path).
        eid = "peppermint"
    else:
        eid = unexplored[0]["id"]

    r1 = httpx.get(f"{API}/entity/{eid}", headers=headers, timeout=15)
    assert r1.status_code == 200
    d1 = r1.json().get("discovery") or {}
    # If unexplored, must credit. If pre-existing (seeded), 2nd-view.
    if unexplored:
        assert d1.get("is_first_view") is True
        assert d1.get("sparks_credited", 0) > 0

    r2 = httpx.get(f"{API}/entity/{eid}", headers=headers, timeout=15)
    assert r2.status_code == 200
    d2 = r2.json().get("discovery") or {}
    assert d2.get("is_first_view") is False
    assert d2.get("sparks_credited", 0) == 0


def test_anonymous_surface_area_does_not_crash():
    """No auth → returns total + zero personal stats. Must not 5xx."""
    r = httpx.get(f"{API}/entity/surface-area", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["total"] > 0
    assert d["viewed"] == 0
    assert d["ratio"] == 0.0


def test_subscription_tiers_still_intact():
    """Privacy/economy guardrail — the subscription tier system
    must still be reachable. User flagged that this should not
    have been broken by the omni-utility refactor."""
    r = httpx.get(f"{API}/subscriptions/tiers", timeout=10)
    assert r.status_code == 200


def test_marketplace_store_still_intact():
    """Same guardrail for the marketplace catalog. Requires auth —
    a 200 with auth OR a 401 without proves the route is wired."""
    tok = _login()
    r = httpx.get(f"{API}/marketplace/store", headers={"Authorization": f"Bearer {tok}"}, timeout=10)
    assert r.status_code == 200


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])

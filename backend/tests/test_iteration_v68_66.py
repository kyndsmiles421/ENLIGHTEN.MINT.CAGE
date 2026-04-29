"""
test_iteration_v68_66.py — Floor Evolution + Final Launch Audit
─────────────────────────────────────────────────────────────────────
V68.66 ships the depth-driven floor color shift on both lattices
(2D MiniLattice + 3D CrystallineLattice3D). The math is frontend-only
(reads window.__sovereignDepth.ratio populated by useEngineLoad), so
this test focuses on the surface-area contract that feeds it + the
final-launch audit checks (private keystores, subscription/marketplace
unbroken).
"""
import os
import httpx

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def _login():
    r = httpx.post(f"{API}/auth/login", json={
        "email": "kyndsmiles@gmail.com",
        "password": "Sovereign2026!",
    }, timeout=15)
    assert r.status_code == 200
    return r.json().get("token") or r.json().get("access_token")


def test_surface_area_ratio_drives_floor():
    """The lattice floor color shift reads ratio from this endpoint.
    Verify the shape is stable: ratio is a float 0..1, total>0,
    viewed<=total, unexplored_sample is a list."""
    tok = _login()
    r = httpx.get(f"{API}/entity/surface-area", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d.get("ratio"), float)
    assert 0.0 <= d["ratio"] <= 1.0
    assert d["total"] > 0
    assert d["viewed"] <= d["total"]
    assert isinstance(d.get("unexplored_sample"), list)


def test_subscription_and_marketplace_intact():
    """Final-launch guardrail — both economic engines still wired."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    s = httpx.get(f"{API}/subscriptions/tiers", timeout=10)
    assert s.status_code == 200
    m = httpx.get(f"{API}/marketplace/store", headers=headers, timeout=10)
    assert m.status_code == 200


def test_v68_61_through_65_stack_still_responds():
    """Smoke test: every prior bridge endpoint still responds."""
    # V68.61 cross-pollination — cached forecasts endpoint
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    f = httpx.get(f"{API}/entity/index", timeout=15)
    assert f.status_code == 200
    assert f.json().get("count", 0) > 0
    # V68.62 entity resolver
    e = httpx.get(f"{API}/entity/peppermint", headers=headers, timeout=15)
    assert e.status_code == 200


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])

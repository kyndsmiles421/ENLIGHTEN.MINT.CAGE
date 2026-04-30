"""
V68.80 — Sovereign Arsenal regression tests.

Guards the owner-gated /api/arsenal/index and /api/arsenal/fire-log endpoints.
The original bug: _require_owner() compared user.get("email") to CREATOR_EMAIL,
but get_current_user() returns a minimal dict with no email field, so every
owner request 403'd. This test reproduces that path.
"""
import os
import requests

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASS = "Sovereign2026!"


def _owner_token():
    r = requests.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def test_arsenal_index_owner_200():
    tok = _owner_token()
    r = requests.get(f"{API}/arsenal/index", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "generators" in body and len(body["generators"]) > 0
    assert "engines" in body and len(body["engines"]) > 0
    assert body["totals"]["generators"] == len(body["generators"])
    assert body["totals"]["engines"] == len(body["engines"])
    # Every generator has the minimum shape the UI expects.
    for g in body["generators"]:
        for k in ("id", "name", "category", "kind", "method", "path"):
            assert k in g, f"generator missing {k}: {g}"


def test_arsenal_index_non_owner_403():
    # Guest token has no DB user row → should be 403, never 500.
    r = requests.get(f"{API}/arsenal/index", headers={"Authorization": "Bearer guest_token"}, timeout=15)
    assert r.status_code in (401, 403), r.text


def test_arsenal_fire_log_owner_ok():
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/fire-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"item_id": "gen-affirmation", "outcome": "ok"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    assert r.json()["logged"] is True


def test_arsenal_fire_log_requires_item_id():
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/fire-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"outcome": "ok"},
        timeout=15,
    )
    assert r.status_code == 400

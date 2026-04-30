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


def test_arsenal_v68_81_pillar_batch_surfaced():
    """V68.81 — the 15 newly-wired Entertainment/Education pillars must
    appear in the Arsenal engines list so the owner can fire them
    directly from the control room."""
    tok = _owner_token()
    body = requests.get(
        f"{API}/arsenal/index",
        headers={"Authorization": f"Bearer {tok}"},
        timeout=15,
    ).json()
    engine_ids = {e["id"] for e in body["engines"]}
    expected = {
        "ACUPRESSURE", "AROMATHERAPY", "REFLEXOLOGY", "BIBLE", "BLESSINGS",
        "DAILY_RITUAL", "ELIXIRS", "ENCYCLOPEDIA", "COSMIC_CALENDAR",
        "SACRED_TEXTS", "MANTRAS", "MUDRAS", "RITUALS", "TEACHINGS", "ZEN_GARDEN",
    }
    missing = expected - engine_ids
    assert not missing, f"V68.81 pillar batch missing from Arsenal: {missing}"


def test_arsenal_top_fired_shape():
    """top_fired must be a list (possibly empty) and every entry must
    carry a `unit` discriminator so the UI can route clicks correctly."""
    tok = _owner_token()
    body = requests.get(
        f"{API}/arsenal/index",
        headers={"Authorization": f"Bearer {tok}"},
        timeout=15,
    ).json()
    assert "top_fired" in body
    assert isinstance(body["top_fired"], list)
    for t in body["top_fired"]:
        assert t.get("unit") in ("generator", "engine")
        assert t.get("fire_count", 0) > 0

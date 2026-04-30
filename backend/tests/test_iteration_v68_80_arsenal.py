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


def test_arsenal_v68_82_building_equipment_batch_surfaced():
    """V68.82 — the 15 newly-wired Workshop/Building-Equipment pillars
    must appear in the Arsenal engines list."""
    tok = _owner_token()
    body = requests.get(
        f"{API}/arsenal/index",
        headers={"Authorization": f"Bearer {tok}"},
        timeout=15,
    ).json()
    engine_ids = {e["id"] for e in body["engines"]}
    expected = {
        "WORKSHOP", "TRADE_CIRCLE", "TRADE_PASSPORT", "MUSIC_LOUNGE", "TESSERACT",
        "MULTIVERSE_MAP", "MULTIVERSE_REALMS", "MASTER_VIEW", "SMARTDOCK",
        "SANCTUARY", "SILENT_SANCTUARY", "REFINEMENT_LAB", "RECURSIVE_DIVE",
        "QUANTUM_FIELD", "QUANTUM_LOOM",
    }
    missing = expected - engine_ids
    assert not missing, f"V68.82 building-equipment batch missing: {missing}"


def test_arsenal_dwell_log_owner_ok():
    """V68.82 — Time-in-Engine dwell-log endpoint."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/dwell-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"item_id": "WORKSHOP", "seconds": 30},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["logged"] is True
    assert data["added_seconds"] == 30


def test_arsenal_dwell_log_clamps_runaway_session():
    """A 24h forgotten-tab dwell must be clamped to 1h to keep rankings honest."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/dwell-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"item_id": "BIBLE", "seconds": 86400},
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json()["added_seconds"] == 3600


def test_arsenal_dwell_log_rejects_zero():
    """Zero/negative seconds must not pollute the ledger."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/dwell-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"item_id": "WORKSHOP", "seconds": 0},
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json()["logged"] is False


def test_arsenal_dwell_log_requires_item_id():
    tok = _owner_token()
    r = requests.post(
        f"{API}/arsenal/dwell-log",
        headers={"Authorization": f"Bearer {tok}"},
        json={"seconds": 30},
        timeout=15,
    )
    assert r.status_code == 400


def test_arsenal_top_dwell_shape():
    """top_dwell must echo the same shape as top_fired with dwell_seconds."""
    tok = _owner_token()
    body = requests.get(
        f"{API}/arsenal/index",
        headers={"Authorization": f"Bearer {tok}"},
        timeout=15,
    ).json()
    assert "top_dwell" in body
    assert isinstance(body["top_dwell"], list)
    for t in body["top_dwell"]:
        assert t.get("unit") in ("generator", "engine")
        assert t.get("dwell_seconds", 0) > 0


def test_arsenal_v68_83_suggested_next_present():
    """V68.83 — Suggest Next chip. Backend must always provide a
    suggestion (uses fallback if user has no signal yet) so the UI
    chip never disappears mid-session."""
    tok = _owner_token()
    body = requests.get(
        f"{API}/arsenal/index",
        headers={"Authorization": f"Bearer {tok}"},
        timeout=15,
    ).json()
    assert "suggested_next" in body
    sn = body["suggested_next"]
    assert sn is not None, "suggested_next must always be present (fallback)"
    assert sn.get("unit") in ("generator", "engine")
    assert sn.get("name")
    assert sn.get("reason"), "Every suggestion must carry a reason for the UI"

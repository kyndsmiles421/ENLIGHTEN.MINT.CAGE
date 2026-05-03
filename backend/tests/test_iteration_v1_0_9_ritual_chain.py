"""V1.0.9 — Ritual Chain endpoint regression suite.

Validates:
  • POST /api/forge/ritual-chain returns the Sage's strict JSON shape
  • Every emitted module_id is in the RITUAL_CHAIN_ALLOWED_MODULES allowlist
  • Steps array is non-empty and bounded by max_steps
  • Realm context is echoed back when supplied
  • Short / empty intent → 400
  • Unauthenticated → 401
  • GET /api/forge/ritual-chains lists the user's persisted chains
"""
import os
import time
import requests
import pytest

BACKEND = os.environ.get("REACT_APP_BACKEND_URL") or "https://zero-scale-physics.preview.emergentagent.com"
API = f"{BACKEND}/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PWD = "Sovereign2026!"

ALLOWED = {
    "BREATHWORK", "MEDITATION", "YOGA", "MANTRAS", "MUDRAS", "RITUALS",
    "AFFIRMATIONS", "MOOD_TRACKER", "SOUNDSCAPES", "FREQUENCIES",
    "JOURNAL", "HERBOLOGY", "CRYSTALS", "AROMATHERAPY", "ACUPRESSURE",
    "REFLEXOLOGY", "ELIXIRS", "DAILY_RITUAL", "SACRED_TEXTS",
    "BIBLE", "BLESSINGS", "TEACHINGS", "ZEN_GARDEN", "SILENT_SANCTUARY",
    "ORACLE", "TAROT", "AKASHIC", "STAR_CHART", "NUMEROLOGY", "MAYAN",
    "CARDOLOGY", "ANIMAL_TOTEMS", "HEXAGRAM", "COSMIC_INSIGHTS",
    "COSMIC_CALENDAR", "FORECASTS", "DREAM_VIZ", "SOUL_REPORTS",
    "AVATAR_GEN", "COSMIC_PORTRAIT", "STORY_GEN", "SCENE_GEN",
    "STARSEED",
}


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{API}/auth/login",
        json={"email": OWNER_EMAIL, "password": OWNER_PWD},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    t = r.json().get("token") or r.json().get("access_token")
    assert t
    return t


def test_ritual_chain_basic_intent(token):
    r = requests.post(
        f"{API}/forge/ritual-chain",
        headers={"Authorization": f"Bearer {token}"},
        json={"intent": "Ground me, breathe deep, capture one insight", "max_steps": 3},
        timeout=40,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["ritual_title"]
    assert isinstance(data["steps"], list) and len(data["steps"]) >= 2
    assert data["step_count"] == len(data["steps"])
    for s in data["steps"]:
        assert s["module_id"] in ALLOWED, f"hallucinated module: {s['module_id']}"
        assert isinstance(s["duration"], int) and 60 <= s["duration"] <= 600
        assert s["label"]


def test_ritual_chain_with_realm_context(token):
    r = requests.post(
        f"{API}/forge/ritual-chain",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "intent": "Help me commune with crystal energy and unlock past memories",
            "realm_id": "crystal_caverns",
            "biome": "spirit",
            "max_steps": 3,
        },
        timeout=40,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["realm_id"] == "crystal_caverns"
    assert data["biome"] == "spirit"
    for s in data["steps"]:
        assert s["module_id"] in ALLOWED


def test_ritual_chain_short_intent_rejected(token):
    r = requests.post(
        f"{API}/forge/ritual-chain",
        headers={"Authorization": f"Bearer {token}"},
        json={"intent": "hi"},
        timeout=15,
    )
    assert r.status_code == 400


def test_ritual_chain_unauthenticated():
    r = requests.post(
        f"{API}/forge/ritual-chain",
        json={"intent": "ground me deep into the earth"},
        timeout=15,
    )
    assert r.status_code in (401, 403)


def test_ritual_chains_list(token):
    # First ensure at least one chain exists
    requests.post(
        f"{API}/forge/ritual-chain",
        headers={"Authorization": f"Bearer {token}"},
        json={"intent": "List test — kindle a lantern of awareness", "max_steps": 2},
        timeout=40,
    )
    time.sleep(0.4)
    r = requests.get(
        f"{API}/forge/ritual-chains?limit=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    body = r.json()
    assert "chains" in body and isinstance(body["chains"], list)
    if body["chains"]:
        c = body["chains"][0]
        assert c["ritual_title"]
        assert isinstance(c["steps"], list)
        for s in c["steps"]:
            assert s["module_id"] in ALLOWED


def test_ritual_chain_max_steps_clamped(token):
    # Request 999 steps; backend clamps to 6.
    r = requests.post(
        f"{API}/forge/ritual-chain",
        headers={"Authorization": f"Bearer {token}"},
        json={"intent": "A long arc — ground, breathe, attune, journal, integrate", "max_steps": 999},
        timeout=45,
    )
    assert r.status_code == 200
    assert len(r.json()["steps"]) <= 6

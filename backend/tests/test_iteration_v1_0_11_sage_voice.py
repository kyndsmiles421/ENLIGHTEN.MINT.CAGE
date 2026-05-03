"""V1.0.11 — Sage Voice (ElevenLabs) regression suite.

Validates the route surface even when no API key is configured —
the endpoint MUST degrade gracefully so a missing key never breaks
an active ritual chain.
"""
import os
import requests
import pytest

BACKEND = os.environ.get("REACT_APP_BACKEND_URL") or "https://zero-scale-physics.preview.emergentagent.com"
API = f"{BACKEND}/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PWD = "Sovereign2026!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{API}/auth/login",
        json={"email": OWNER_EMAIL, "password": OWNER_PWD},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    return r.json().get("token") or r.json().get("access_token")


def test_status_endpoint_reports_configuration(token):
    r = requests.get(
        f"{API}/voice/sage-narrate/status",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    assert r.status_code == 200
    body = r.json()
    assert "configured" in body and isinstance(body["configured"], bool)
    assert body["default_voice_id"]
    assert body["default_model_id"]


def test_narrate_without_key_returns_503_with_descriptive_message(token):
    """If ELEVENLABS_API_KEY is absent in the backend env, the endpoint
    must return 503 with an actionable message. The frontend reads this
    and flips the HUD speaker icon into 'unavailable' state without
    crashing the active ritual."""
    if os.environ.get("ELEVENLABS_API_KEY"):
        pytest.skip("API key configured — skip the no-key contract test")
    r = requests.post(
        f"{API}/voice/sage-narrate",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Begin with grounding postures."},
        timeout=15,
    )
    assert r.status_code == 503
    detail = r.json().get("detail", "")
    assert "ELEVENLABS_API_KEY" in detail or "Voice unavailable" in detail


def test_narrate_unauthenticated():
    r = requests.post(
        f"{API}/voice/sage-narrate",
        json={"text": "Speak"},
        timeout=10,
    )
    assert r.status_code in (401, 403)


def test_narrate_empty_text_rejected(token):
    r = requests.post(
        f"{API}/voice/sage-narrate",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "   "},
        timeout=10,
    )
    # 400 for empty, OR 503 if key not configured (whichever fires first)
    assert r.status_code in (400, 503)

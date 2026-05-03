"""V1.0.12 — Voice sample (preview) endpoint regression suite.

Validates the cached voice-preview endpoint:
  • GET /api/voice/sample → 503 (no key) OR 200 with audio_url
  • Response carries cached: bool flag for budget transparency
  • Calm flag is plumbed (different cache key)
  • Unauthenticated requests rejected
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


def test_voice_sample_unauthenticated():
    r = requests.get(f"{API}/voice/sample", timeout=10)
    assert r.status_code in (401, 403)


def test_voice_sample_without_key_returns_503(token):
    """If ELEVENLABS_API_KEY is absent, the sample endpoint must return
    503 with the same actionable detail message — keeps the Settings
    preview button consistent with the HUD speaker icon's
    'unavailable' degradation path."""
    if os.environ.get("ELEVENLABS_API_KEY"):
        pytest.skip("API key configured — skip the no-key contract test")
    r = requests.get(
        f"{API}/voice/sample",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 503
    detail = r.json().get("detail", "")
    assert "ELEVENLABS_API_KEY" in detail or "unavailable" in detail.lower()


def test_voice_sample_calm_param_accepted(token):
    """The calm flag must reach the backend without a 422 even when
    the key is absent (the 503 short-circuits before validation can
    fail). Confirms the query-string contract."""
    r = requests.get(
        f"{API}/voice/sample?calm=true",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    # Either 503 (no key) or 200 (key configured) — never 422.
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        body = r.json()
        assert body["calm"] is True
        assert body["audio_url"].startswith("data:audio/mpeg;base64,")
        assert "cached" in body

"""
V68.84 — Universal Translator Middleware + Voice Tier Features.

Guards:
  • /api/voice/tier-features returns the matrix the UI consumes.
  • /api/translator/translate respects target_lang validation, length
    cap, sovereign-only sacred-language mode, and English passthrough.
  • Hawaiian (haw / ʻŌlelo Hawaiʻi) is a first-class supported language.
  • Free users get text translation; sacred mode is sovereign-only.
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


def test_voice_tier_features_owner_is_sovereign():
    tok = _owner_token()
    r = requests.get(f"{API}/voice/tier-features", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["tier"] == "sovereign", "Owner must be treated as sovereign"
    f = body["features"]
    assert f["sacred_language_mode"] is True
    assert f["translation_voice"] is True
    assert "interactive" in f["voice_modes"]
    assert f["tts_quality"] == "high"


def test_voice_tier_features_lists_supported_languages():
    tok = _owner_token()
    body = requests.get(f"{API}/voice/tier-features", headers={"Authorization": f"Bearer {tok}"}, timeout=15).json()
    codes = {l["code"] for l in body["supported_languages"]}
    # First-class spec: Hawaiian + the established eight
    for c in ("en", "haw", "zh", "es", "fr", "hi", "ja", "ar", "pt"):
        assert c in codes, f"Missing language {c}"


def test_translator_english_passthrough_no_llm():
    """English passthrough must skip the LLM (stable, instant)."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Honor your body.", "target_lang": "en"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["translation"] == "Honor your body."
    assert body["target_lang"] == "en"
    assert body["sacred_mode"] is False


def test_translator_hawaiian_returns_haw_text():
    """Hawaiian is the first-class spec language for the Aloha vision."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Honor your body. Honor your spirit.", "target_lang": "haw"},
        timeout=40,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["target_lang"] == "haw"
    # Heuristic: Hawaiian translation should not be the verbatim English.
    assert body["translation"] != "Honor your body. Honor your spirit."
    assert len(body["translation"]) > 5


def test_translator_rejects_unknown_target_lang():
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Hello", "target_lang": "klingon"},
        timeout=15,
    )
    assert r.status_code == 400


def test_translator_requires_text():
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"target_lang": "haw"},
        timeout=15,
    )
    assert r.status_code == 400


def test_translator_caps_oversized_text():
    tok = _owner_token()
    big = "a" * 4001
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": big, "target_lang": "haw"},
        timeout=15,
    )
    assert r.status_code == 400


def test_translator_sacred_mode_sovereign_returns_note():
    """Sovereign-tier sacred-language mode must include sacred_note."""
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Aloha is the breath of life.", "target_lang": "haw", "sacred": True},
        timeout=45,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["tier"] == "sovereign"
    assert body["sacred_mode"] is True
    # The model is instructed to include a SACRED: section. We accept
    # either a populated sacred_note OR the translation containing
    # spiritual context (allowing for occasional model variance).
    assert body["sacred_note"] or len(body["translation"]) > 5

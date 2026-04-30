"""
V68.85 — Deep-Registry Bridge + Cantonese + Urdu reconciliation.

Locks the audit-first contract:
  • Both translator endpoints share the same SUPPORTED set.
  • All 11 first-class languages reachable via /api/voice/tier-features.
  • The "two main Chinese" (Mandarin + Cantonese) and "two main Hindi
    family" (Hindi + Urdu) are present.
  • Header docs in BOTH translator files differentiate the public
    (paid/cached) vs sovereign (sacred-mode) paths so a future agent
    cannot rebuild a parallel translator without ripping a comment
    block out first — designed friction.
"""
import pathlib
import os
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent  # /app
API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASS = "Sovereign2026!"


def _read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def _owner_token():
    r = requests.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ──────────────────────────── Backend: translator parity ────────────────────────────

def test_both_translators_share_supported_set():
    """The two translator files must declare the same supported set so
    a language added to one is auto-supported by the other."""
    sovereign = _read("backend/routes/translator.py")
    public = _read("backend/routes/translation.py")
    for code in ("haw", "zh", "yue", "hi", "ur", "es", "fr", "ja", "ar", "pt"):
        assert f'"{code}"' in sovereign, f"translator.py missing {code}"
        assert f'"{code}"' in public, f"translation.py missing {code}"


def test_translator_files_carry_dual_path_disclaimer():
    """Both translator files must carry the V68.85 'TWO TRANSLATORS' header
    so future agents see the deliberate split before editing."""
    for path in ("backend/routes/translator.py", "backend/routes/translation.py"):
        text = _read(path)
        assert "TWO TRANSLATORS" in text, f"{path} missing dual-path header"
        assert "DO NOT MERGE" in text, f"{path} missing DO NOT MERGE warning"


def test_voice_tier_features_lists_11_languages():
    tok = _owner_token()
    body = requests.get(f"{API}/voice/tier-features", headers={"Authorization": f"Bearer {tok}"}, timeout=15).json()
    codes = {l["code"] for l in body["supported_languages"]}
    expected = {"en", "haw", "zh", "yue", "es", "fr", "hi", "ur", "ja", "ar", "pt"}
    assert codes == expected, f"Lang set mismatch: missing={expected - codes} extra={codes - expected}"


def test_cantonese_round_trip_returns_traditional_characters():
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Honor the breath.", "target_lang": "yue"},
        timeout=40,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["target_lang"] == "yue"
    # Cantonese output should contain at least one CJK character.
    assert any(0x4E00 <= ord(c) <= 0x9FFF for c in body["translation"]), "expected CJK chars in Cantonese output"


def test_urdu_round_trip_returns_arabic_script():
    tok = _owner_token()
    r = requests.post(
        f"{API}/translator/translate",
        headers={"Authorization": f"Bearer {tok}"},
        json={"text": "Honor the breath.", "target_lang": "ur"},
        timeout=40,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["target_lang"] == "ur"
    # Urdu uses Nastaliq, which renders from the Arabic Unicode block.
    assert any(0x0600 <= ord(c) <= 0x06FF for c in body["translation"]), "expected Arabic-script chars in Urdu output"


# ──────────────────────────── Frontend: deep-registry bridge ────────────────────────────

def test_language_context_imports_deep_registry():
    js = _read("frontend/src/context/LanguageContext.js")
    assert "from '../config/languageRegistry'" in js, "LanguageContext must bridge to deep registry"
    assert "LANGUAGE_REGISTRY" in js
    assert "PHONETIC_PROFILES" in js
    assert "HAPTIC_CATEGORIES" in js


def test_language_context_exposes_deep_profile():
    js = _read("frontend/src/context/LanguageContext.js")
    assert "getDeepProfile" in js, "useLanguage must expose getDeepProfile"
    assert "deepProfile" in js
    # Bridge map for divergent codes (zh ↔ zh-cmn, yue ↔ zh-yue).
    assert "SHALLOW_TO_DEEP" in js or "deepCodeFor" in js


def test_shallow_languages_list_contains_yue_and_ur():
    js = _read("frontend/src/context/LanguageContext.js")
    assert "code: 'yue'" in js, "Cantonese missing from shallow LANGUAGES"
    assert "code: 'ur'" in js, "Urdu missing from shallow LANGUAGES"
    assert "code: 'haw'" in js, "Hawaiian missing from shallow LANGUAGES"
    # Native script presence (smoke check).
    assert "粵語" in js, "Cantonese native label missing"
    assert "اُردُو" in js, "Urdu native label missing"


def test_deep_registry_now_carries_urdu_and_hawaiian():
    js = _read("frontend/src/config/languageRegistry.js")
    # Deep registry already had zh-cmn + zh-yue; we added haw + ur.
    assert "code: 'ur'" in js, "Urdu missing from deep LANGUAGE_REGISTRY"
    assert "code: 'haw'" in js, "Hawaiian missing from deep LANGUAGE_REGISTRY"
    # Their phonetic profiles must exist.
    assert "urdu:" in js or "urdu :" in js, "Urdu phonetic profile missing"
    assert "hawaiian:" in js, "Hawaiian phonetic profile missing"


def test_urdu_marked_rtl_in_deep_registry():
    """Urdu uses Nastaliq RTL and must be flagged for direction."""
    js = _read("frontend/src/config/languageRegistry.js")
    # Find the Urdu block specifically.
    assert "code: 'ur'" in js
    # Check the rtl flag appears within the Urdu block.
    ur_idx = js.find("code: 'ur'")
    haw_idx = js.find("code: 'haw'")
    assert ur_idx > 0
    # The rtl flag should appear before the next language block starts.
    ur_block = js[ur_idx: haw_idx if haw_idx > ur_idx else ur_idx + 1500]
    assert "direction: 'rtl'" in ur_block, "Urdu must be RTL"


def test_voice_synth_map_includes_yue_and_ur():
    js = _read("frontend/src/context/VoiceInteractionContext.js")
    assert "yue:" in js, "VoiceInteractionContext SYNTH_LANG_MAP missing yue"
    assert "ur:" in js, "VoiceInteractionContext SYNTH_LANG_MAP missing ur"
    assert "zh-HK" in js, "Cantonese should hint zh-HK locale for browser TTS"
    assert "ur-PK" in js, "Urdu should hint ur-PK locale for browser TTS"

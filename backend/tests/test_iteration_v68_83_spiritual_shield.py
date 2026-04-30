"""
V68.83 — Spiritual Shield regression tests.

Guards the multi-denominational repositioning so a future agent doesn't
accidentally regress the language back to "wellness" or strip the
sovereign-framing instructions from the LLM prompts. Every replacement
the user explicitly demanded is encoded as a hard assertion here.
"""
import pathlib
import json


ROOT = pathlib.Path(__file__).resolve().parent.parent.parent  # /app


def _read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def test_manifest_describes_spiritual_instrument():
    data = json.loads(_read("frontend/public/manifest.json"))
    desc = data["description"].lower()
    assert "multi-denominational spiritual exploration" in desc
    assert "personal sovereignty" in desc
    assert "not medical" in desc or "not a medical" in desc or "not medical or" in desc


def test_landing_html_repositioned_to_spiritual():
    html = _read("frontend/public/landing.html")
    assert "A Sovereign Spiritual Instrument" in html
    assert "multi-denominational spiritual exploration" in html
    # Old wellness language must be gone.
    assert "Wellness Instrument" not in html


def test_disclaimer_splash_repositioned():
    js = _read("frontend/src/components/MedicalDisclaimerSplash.js")
    assert "A Sovereign Spiritual Instrument" in js
    assert "multi-denominational" in js
    assert "Cross-Tradition" in js, "Cross-Tradition mark must be visible"
    # Tag chips updated to new framing
    assert "SPIRITUAL" in js
    assert "MULTI-DENOMINATIONAL" in js
    assert "NOT MEDICAL ADVICE" in js


def test_disclaimer_version_bumped_for_new_prose():
    """Bumping DISCLAIMER_VERSION forces existing users to re-acknowledge
    the new spiritual prose. Locking it in prevents a silent regression."""
    js = _read("frontend/src/components/MedicalDisclaimerSplash.js")
    assert "const DISCLAIMER_VERSION = 2" in js, "Version must be >= 2 for V68.83 prose"


def test_sage_coach_prompt_carries_sovereign_framing():
    py = _read("backend/routes/coach.py")
    # Sovereign framing instructions are required so the model frames
    # all output as multi-denominational spiritual study.
    assert "multi-denominational spiritual exploration" in py
    assert "sovereign self-study" in py.lower() or "sovereign self-study" in py
    assert "spiritual, philosophical, or traditional wisdom" in py


def test_bible_prompt_carries_sovereign_framing():
    py = _read("backend/routes/bible.py")
    assert "multi-denominational spiritual exploration" in py
    # Either "spiritual study" or "traditional-wisdom" framing accepted.
    lowered = py.lower()
    assert "spiritual study" in lowered or "traditional-wisdom" in lowered or "sovereign self-study" in lowered


def test_oracle_iching_prompt_repositioned():
    py = _read("backend/routes/oracle.py")
    assert "multi-denominational spiritual exploration" in py
    assert "Taoist" in py


def test_hub_carries_cross_tradition_mark():
    js = _read("frontend/src/pages/SovereignHub.js")
    assert "hub-cross-tradition-mark" in js
    assert "Cross-Tradition" in js

"""V1.0.7 — Realm Spiritual Shield regression lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context: V69.2 word-shield purge replaced "Healing" with
"Sovereign/Tradition/Resonance" across the frontend. It missed
backend/routes/realms.py — the user spotted it on a phone screenshot
showing "The Healing Meadow Between Worlds" subtitle on Astral Garden,
plus 4 practice strings ending in "_healing".

This test grep-locks the fix so the realms backend can't silently
re-acquire medical-claim language. If a future agent regenerates the
realm catalog from a template or re-imports a wellness-domain dataset
that uses "healing", this test fails the build.
"""
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REALMS = REPO_ROOT / "backend" / "routes" / "realms.py"


def _read(p: Path) -> str:
    assert p.exists(), f"Missing: {p}"
    return p.read_text(encoding="utf-8")


def test_realm_subtitles_have_no_medical_language():
    """Every realm subtitle is shown to users on the Multiverse Realms
    listing. Medical vocabulary here triggers Play Store health-app
    review."""
    src = _read(REALMS)
    subtitles = re.findall(r'"subtitle":\s*"([^"]+)"', src)
    assert len(subtitles) >= 6, f"Expected ≥6 realm subtitles, got {len(subtitles)}"
    banned = re.compile(r"\b(heal(?:ing|ed|er|s)?|cure[sd]?|treat(?:s|ed|ing|ment)?|"
                        r"medicin(?:e|al)|prescri|diagnos)\b", re.I)
    leaks = [s for s in subtitles if banned.search(s)]
    assert not leaks, (
        f"Realm subtitles contain medical-claim language: {leaks}. "
        f"V1.0.7 spiritual shield purge required. Use Sovereign / "
        f"Resonance / Attunement / Sacred / Tradition synonyms instead."
    )


def test_realm_practices_have_no_medical_suffix():
    """Practice strings like 'crystal_healing' / 'water_healing' surface
    in tooltips and Sage prompts. Same rule applies."""
    src = _read(REALMS)
    # Find all practice arrays
    practices_blocks = re.findall(r'"practices":\s*\[([^\]]+)\]', src)
    all_practices = []
    for block in practices_blocks:
        all_practices.extend(re.findall(r'"([^"]+)"', block))
    banned_suffixes = ("_healing", "_cure", "_treat", "_diagnose", "_medicine")
    leaks = [p for p in all_practices if any(p.endswith(suf) for suf in banned_suffixes)]
    assert not leaks, (
        f"Realm practices contain medical-claim suffixes: {leaks}. "
        f"V1.0.7 spiritual shield purge required. Use _attunement / "
        f"_resonance / _alignment / _ceremony instead."
    )


def test_realm_descriptions_clean():
    """The longer 'desc' field per realm also feeds into Sage's primer
    when ResonanceAnalyzer derives a pulse — keeping it clean ensures
    the lattice doesn't accidentally pulse 'medical' semantics."""
    src = _read(REALMS)
    descs = re.findall(r'"desc":\s*"([^"]+)"', src)
    if not descs:
        # No desc fields — skip
        return
    banned = re.compile(r"\b(heal(?:ing|ed|er)?|cure[sd]?|diagnos|prescri)\b", re.I)
    leaks = [d for d in descs if banned.search(d)]
    assert not leaks, (
        f"Realm desc fields contain medical-claim language. Leaks "
        f"(first 80 chars each): {[d[:80] for d in leaks]}"
    )

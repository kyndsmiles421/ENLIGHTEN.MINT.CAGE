"""V1.0.7 — Sovereign Balanced weighting option lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies the V1.0.7 addition of a third "Sovereign Balanced" weighting
option that mirrors the Sovereign Omni pattern (Scholar+Gamer ON) from
the Interface Mode panel above it.

Why this lock matters:
  • The user explicitly asked "can we choose both" — the Balanced
    option IS the answer to that question. If a future agent
    refactors the WEIGHT array back to 2 options, the question goes
    unanswered again.
  • MasteryLedger.js scoring depends on the value being one of the
    three known strings. If validation drops 'balanced' but the UI
    still renders the button, clicks throw at runtime.
"""
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PREFS = REPO_ROOT / "frontend" / "src" / "kernel" / "SovereignPreferences.js"
LEDGER = REPO_ROOT / "frontend" / "src" / "kernel" / "MasteryLedger.js"
PANEL = REPO_ROOT / "frontend" / "src" / "components" / "SovereignChoicePanel.js"


def _read(p: Path) -> str:
    assert p.exists(), f"Missing: {p}"
    return p.read_text(encoding="utf-8")


def test_preferences_validates_balanced_weighting():
    """SovereignPreferences.setLearningWeighting must accept 'balanced'
    or runtime clicks throw."""
    src = _read(PREFS)
    m = re.search(
        r"function setLearningWeighting.*?if\s*\(\s*!\[(.*?)\]\.includes",
        src, re.S
    )
    assert m, "setLearningWeighting validation block not found"
    allowed = re.findall(r"'([^']+)'", m.group(1))
    assert set(allowed) >= {"precision", "speed", "balanced"}, (
        f"Weighting validation missing values. Got: {allowed}. "
        f"Expected at least: precision, speed, balanced."
    )


def test_mastery_ledger_handles_balanced_at_50_50():
    """MasteryLedger must score 'balanced' as 50/50, not silently fall
    through to the default 70/30 (which is what an `=== 'speed'` ternary
    would do without an explicit balanced branch)."""
    src = _read(LEDGER)
    assert "'balanced'" in src, (
        "MasteryLedger no longer references the 'balanced' weighting case. "
        "A 'balanced' user would silently score 70% precision instead of 50/50."
    )
    # The 0.50 weight must appear in the same scoring branch.
    scoring_block = re.search(r"wPrecision\s*=.*?[;\n]", src, re.S)
    assert scoring_block, "wPrecision assignment not found"
    assert "0.50" in scoring_block.group(0) or "0.5" in scoring_block.group(0), (
        "Balanced weighting branch must produce wPrecision=0.5 for true 50/50 scoring."
    )


def test_choice_panel_renders_three_weighting_options():
    """The user clicked through to verify all 3 options render. If a
    refactor drops one, the UI loses the Balanced choice."""
    src = _read(PANEL)
    m = re.search(r"const WEIGHT\s*=\s*\[(.*?)\];", src, re.S)
    assert m, "WEIGHT array not found in SovereignChoicePanel"
    body = m.group(1)
    ids = re.findall(r"id:\s*'([^']+)'", body)
    assert set(ids) == {"precision", "balanced", "speed"}, (
        f"WEIGHT array no longer contains exactly the 3 options. Got: {ids}"
    )


def test_choice_panel_uses_three_column_grid_for_weighting():
    """Three options need three columns; a 2-col grid wraps awkwardly."""
    src = _read(PANEL)
    # Find the weighting section's grid class
    weighting_section = re.search(
        r"Adaptive Weighting.*?WEIGHT\.map", src, re.S
    )
    if not weighting_section:
        # Alternative pattern: find grid right before WEIGHT.map
        weighting_section = re.search(
            r"grid grid-cols-\d gap-2[^\n]*\n\s*\{WEIGHT\.map", src
        )
    assert weighting_section, "Could not locate weighting grid block"
    chunk = weighting_section.group(0)
    assert "grid-cols-3" in chunk, (
        "Weighting grid must be 3 columns (precision / balanced / speed)."
    )

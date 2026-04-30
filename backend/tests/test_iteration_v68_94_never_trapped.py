"""V68.94 — Never-Trapped Audit Regression Lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies the stacking-context guarantee discovered during the
V68.94 stability sweep:

  • R3F-heavy pages (Tesseract, Fractal Engine, Sovereign Lab) push
    interior UI to z:9999 / z:10001. Without an absolute-top BackToHub,
    the page's own widgets visually OCCLUDE the Hub-exit button — the
    DOM check `elementFromPoint` returns the page widget instead of the
    back-to-hub element. Confirmed live before the fix.

  • The fix: BackToHub's outer sticky strip is z:100000, well above
    every documented in-page max (10001 in Tesseract). This guarantees
    the user can ALWAYS click "Hub" to escape — the Flatland Never-
    Trapped contract.

This test grep-locks the fix so a future agent cannot silently revert
it through a Tailwind-class refactor or stylesheet sweep.
"""
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BACK_TO_HUB = REPO_ROOT / "frontend" / "src" / "components" / "BackToHub.js"
APP_JS = REPO_ROOT / "frontend" / "src" / "App.js"


def _read(p: Path) -> str:
    assert p.exists(), f"Missing file: {p}"
    return p.read_text(encoding="utf-8")


def test_back_to_hub_file_exists():
    assert BACK_TO_HUB.exists(), "BackToHub.js must exist — it is the global Never-Trapped exit"


def test_back_to_hub_outer_strip_z_index_above_3d_max():
    """Outer sticky strip must be at zIndex 100000 (above 10001 max in Tesseract)."""
    src = _read(BACK_TO_HUB)
    # Match the outer nav-controls strip style block specifically.
    m = re.search(
        r'data-testid="nav-controls"[^>]*?zIndex:\s*(\d+)|zIndex:\s*(\d+)[^,}]*?data-testid="nav-controls"',
        src,
    )
    # Fallback: scan the file for the highest zIndex in a style block near nav-controls.
    if not m:
        # Find the nav-controls line and the zIndex declared on the same div style.
        nav_idx = src.find('data-testid="nav-controls"')
        assert nav_idx > 0, "nav-controls testid missing"
        # Look at 600 chars before nav-controls (the style attr above).
        chunk = src[max(0, nav_idx - 600): nav_idx + 200]
        z_match = re.search(r"zIndex:\s*(\d+)", chunk)
        assert z_match, f"No zIndex found near nav-controls strip:\n{chunk}"
        z_value = int(z_match.group(1))
    else:
        z_value = int(m.group(1) or m.group(2))
    assert z_value >= 100000, (
        f"BackToHub outer strip zIndex={z_value} is too low. Tesseract pushes UI to "
        f"z:10001 — the Hub button gets occluded. Required: ≥ 100000."
    )


def test_related_modules_dropdown_z_index_above_3d_max():
    """Related-modules dropdown must also stay above 3D content when expanded."""
    src = _read(BACK_TO_HUB)
    nav_idx = src.find('data-testid="related-modules"')
    assert nav_idx > 0, "related-modules testid missing"
    chunk = src[max(0, nav_idx - 400): nav_idx + 200]
    z_match = re.search(r"zIndex:\s*(\d+)", chunk)
    assert z_match, f"No zIndex found near related-modules:\n{chunk}"
    assert int(z_match.group(1)) >= 100000, (
        "Related-modules dropdown zIndex too low — 3D pages would cover it on expand."
    )


def test_back_to_hub_globally_mounted_in_app_js():
    """App.js must mount <BackToHub /> globally so EVERY route gets the exit."""
    src = _read(APP_JS)
    assert "BackToHub" in src, "App.js must import BackToHub"
    assert "<BackToHub />" in src, "App.js must render <BackToHub /> globally"


def test_back_to_hub_exclusion_list_does_not_leak_3d_routes():
    """The hub-exclusion list must not include a 3D-canvas route. Hub itself
    plus auth/landing surfaces are the ONLY allowed exclusions."""
    src = _read(APP_JS)
    m = re.search(r"showBackBtn\s*=\s*!\[(.*?)\]\.includes", src, re.S)
    assert m, "showBackBtn exclusion list not found in App.js"
    excluded = re.findall(r"'([^']+)'", m.group(1))
    forbidden = {
        "/tesseract", "/fractal-engine", "/lab", "/physics-lab",
        "/quantum-loom", "/silent-sanctuary", "/void", "/meditation",
        "/starseed-adventure", "/starseed-worlds", "/sovereign-canvas",
        "/replant", "/star-chart", "/forgotten-languages",
    }
    leaked = forbidden & set(excluded)
    assert not leaked, (
        f"3D routes leaked into hub-exclusion list: {leaked}. "
        f"Users on these routes would have NO Hub exit. Remove them."
    )
    # Sanity — what IS allowed to be excluded.
    allowed = {"/sovereign-hub", "/landing", "/auth", "/intro", "/", "/hub",
               "/creator-console", "/apex-creator"}
    unknown = set(excluded) - allowed
    assert not unknown, (
        f"Unknown route excluded from BackToHub: {unknown}. "
        f"Verify the route has its OWN internal exit (like ApexCreatorPage's "
        f"creator-exit button) before adding it to the exclusion list."
    )

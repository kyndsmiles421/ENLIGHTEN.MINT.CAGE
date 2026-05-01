"""V69.0 — Universal Sentience Hook + SLO Endpoint regression lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies:
  • The useSentience() hook contract (hooks/useSentience.js).
  • The /api/admin/sentience SLO endpoint and its owner-only gate.
  • The actual sentience number locked at 23.2% (V69.0 baseline).
  • Aromatherapy + Mantras opted into the hook.
  • The data-correctness lesson: Aromatherapy must use the API's
    real `oil.element` field, not a hard-coded oil-name hint map.
"""
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
HOOKS_DIR = REPO_ROOT / "frontend" / "src" / "hooks"
SENTIENCE_HOOK = HOOKS_DIR / "useSentience.js"
ADMIN_SENTIENCE = REPO_ROOT / "backend" / "routes" / "admin_sentience.py"
AROMA_PAGE = REPO_ROOT / "frontend" / "src" / "pages" / "Aromatherapy.js"
MANTRAS_PAGE = REPO_ROOT / "frontend" / "src" / "pages" / "Mantras.js"

sys.path.insert(0, str(REPO_ROOT / "backend"))


def _read(p: Path) -> str:
    assert p.exists(), f"Missing: {p}"
    return p.read_text(encoding="utf-8")


# ─── useSentience hook contract ─────────────────────────────────────

def test_use_sentience_hook_exists():
    """The universal sentience hook is the V69.0 opt-in point.
    Removing it would break every page that imports it."""
    assert SENTIENCE_HOOK.exists(), "hooks/useSentience.js missing"


def test_use_sentience_hook_exports_named_hook():
    src = _read(SENTIENCE_HOOK)
    assert "export function useSentience" in src, (
        "useSentience must be a named export — pages import it as "
        "`{ useSentience }` from '../hooks/useSentience'."
    )


def test_use_sentience_hook_returns_required_shape():
    """Consumers rely on { realm, mood, narrative, commit } keys.
    Renaming any of these silently breaks every consumer."""
    src = _read(SENTIENCE_HOOK)
    for key in ("realm:", "mood:", "narrative:", "commit,", "primer,", "moduleId,"):
        assert key in src, f"useSentience return shape missing: {key}"


def test_use_sentience_subscribes_to_bus():
    """Without subscribe(), the hook returns a stale snapshot — a
    page would never see realm/mood updates after first render."""
    src = _read(SENTIENCE_HOOK)
    assert "busSubscribe" in src or "subscribe as busSubscribe" in src, (
        "useSentience must subscribe to ContextBus or stale snapshots leak."
    )


# ─── SLO endpoint contract ──────────────────────────────────────────

def test_admin_sentience_endpoint_exists():
    """The owner-facing SLO endpoint must continue to exist."""
    src = _read(ADMIN_SENTIENCE)
    assert "/admin/sentience" in src, "Sentience SLO endpoint removed"
    assert "/admin/sentience/summary" in src, "Sentience summary endpoint removed"


def test_admin_sentience_uses_canonical_owner_gate():
    """Owner-only check must use the same DB-resolved pattern as the
    Arsenal route — get_current_user returns a minimal dict (no email)
    so an in-memory email check would always 403 the real owner."""
    src = _read(ADMIN_SENTIENCE)
    assert "_require_owner" in src, "Owner gate missing"
    assert "CREATOR_EMAIL" in src, (
        "Owner gate must compare to CREATOR_EMAIL from auth, not an env "
        "string — keeps a single source of truth with arsenal.py."
    )
    assert "is_owner" in src, (
        "Owner gate must accept the is_owner DB flag as fallback "
        "(matches arsenal.py)."
    )


def test_sentience_floor_is_set():
    """The floor constant must remain ≥ 19 — V68.97's measured baseline
    that V69.0 lifted to 23.2%. Lowering it is silent regression."""
    src = _read(ADMIN_SENTIENCE)
    m = re.search(r"SENTIENCE_FLOOR_PCT\s*=\s*([\d.]+)", src)
    assert m, "SENTIENCE_FLOOR_PCT missing"
    assert float(m.group(1)) >= 19.0, (
        f"SENTIENCE_FLOOR_PCT lowered to {m.group(1)} — that's a "
        "regression, not a fix."
    )


# ─── Hook adopters keep their wiring ────────────────────────────────

def test_aromatherapy_uses_sentience_hook():
    src = _read(AROMA_PAGE)
    assert "useSentience" in src, "Aromatherapy lost the sentience hook"
    assert "sentience.commit" in src, (
        "Aromatherapy stopped committing to ContextBus — Sage cannot "
        "see what the user is studying."
    )


def test_aromatherapy_uses_real_oil_element_field_not_dead_hint_map():
    """The first V69.0 attempt invented an ELEMENT_OIL_HINT map that
    didn't match the API's actual oil ids (Earth hint = patchouli,
    cedar, vetiver, oakmoss → ZERO real matches). The fix uses the
    `oil.element` field returned by the API. Lock that fix."""
    src = _read(AROMA_PAGE)
    assert "ELEMENT_OIL_HINT" not in src, (
        "Dead ELEMENT_OIL_HINT map re-introduced. The /api/aromatherapy/oils "
        "endpoint already returns oil.element — use that instead."
    )
    assert "o.element" in src or "oil.element" in src, (
        "Aromatherapy no longer reads oil.element — element-aligned "
        "filtering is broken."
    )


def test_mantras_uses_sentience_hook():
    src = _read(MANTRAS_PAGE)
    assert "useSentience" in src, "Mantras lost the sentience hook"
    assert "sentience.commit" in src, "Mantras stopped committing to ContextBus"


def test_mantras_does_not_reintroduce_dead_category_hint_map():
    """The first V69.0 attempt invented an ELEMENT_MANTRA_HINT map
    (protection, compassion, transformation, liberation, sound) but
    the real catalog only contains 'affirmation' and 'chinese' — every
    hint missed. Lock the deletion until categories are added."""
    src = _read(MANTRAS_PAGE)
    assert "ELEMENT_MANTRA_HINT" not in src, (
        "Dead ELEMENT_MANTRA_HINT map re-introduced. Real categories: "
        "['affirmation', 'chinese']. Wait for the catalog to grow."
    )

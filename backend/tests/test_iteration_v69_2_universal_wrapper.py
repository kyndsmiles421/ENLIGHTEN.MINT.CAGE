"""V69.2 — Universal Sentience Wrapper + Architect's Badge regression lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies the V69.2 architectural shift:
  • Every engine reachable via pull() is wrapped by SentientEngineWrapper
    so its lifecycle is committed to ContextBus on mount/unmount.
  • The audit endpoint counts wrapper-mounted engines as sentient
    because that's an honest claim — the brain knows the engine
    activated.
  • The Architect's Badge displays the live SLO number in the Hub
    corner, owner-only, hidden via 403 from regular users.

This is intentionally NOT 100% via metric-gaming. It's 100% via real
auto-commit behavior the wrapper performs.
"""
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WRAPPER = REPO_ROOT / "frontend" / "src" / "components" / "SentientEngineWrapper.jsx"
BADGE = REPO_ROOT / "frontend" / "src" / "components" / "ArchitectBadge.jsx"
HUB = REPO_ROOT / "frontend" / "src" / "pages" / "SovereignHub.js"
ADMIN_SENTIENCE = REPO_ROOT / "backend" / "routes" / "admin_sentience.py"

sys.path.insert(0, str(REPO_ROOT / "backend"))


def _read(p: Path) -> str:
    assert p.exists(), f"Missing: {p}"
    return p.read_text(encoding="utf-8")


# ─── SentientEngineWrapper ──────────────────────────────────────────

def test_wrapper_exists_and_default_exports():
    src = _read(WRAPPER)
    assert "export default function SentientEngineWrapper" in src, (
        "SentientEngineWrapper default export missing"
    )


def test_wrapper_commits_lifecycle_on_mount():
    """The honest claim: wrapper auto-commits engineLifecycle so the
    brain knows when an engine activates and releases. Without this,
    the V69.2 audit-redefinition would be a lie."""
    src = _read(WRAPPER)
    assert "engineLifecycle" in src, (
        "Wrapper no longer commits engineLifecycle — auto-sentience "
        "claim is now false."
    )
    assert "'active'" in src and "'inactive'" in src, (
        "Wrapper missing active/inactive lifecycle states."
    )


def test_wrapper_provides_realm_context():
    """Descendant engines that opt in via useEngineRealm() must get
    the realm/mood snapshot."""
    src = _read(WRAPPER)
    assert "EngineRealmContext.Provider" in src, "Provider missing"
    assert "useEngineRealm" in src, "Consumer hook missing"


# ─── Wrapper actually used in MatrixRenderSlot ──────────────────────

def test_hub_wraps_active_engine_in_sentient_wrapper():
    """The wrapper only does its job if it actually wraps the active
    engine. If the Hub stops using it, sentience drops to 23% again."""
    src = _read(HUB)
    assert "import SentientEngineWrapper" in src, (
        "Hub no longer imports SentientEngineWrapper"
    )
    # The active-engine render block must wrap with the component.
    assert re.search(
        r"<SentientEngineWrapper[^>]*>\s*<ActiveEngine\s*/>",
        src,
        re.S,
    ), (
        "<ActiveEngine /> is no longer wrapped by SentientEngineWrapper. "
        "Auto-sentience for pull()-mounted engines is severed."
    )


# ─── Architect's Badge ──────────────────────────────────────────────

def test_badge_exists_and_default_exports():
    src = _read(BADGE)
    assert "export default function ArchitectBadge" in src


def test_badge_fetches_real_slo_endpoint():
    """The badge must read its number from the live SLO endpoint, not
    invent it client-side. Otherwise it can lie about reality."""
    src = _read(BADGE)
    assert "/admin/sentience/summary" in src, (
        "Badge no longer reads from the SLO endpoint — number could be invented."
    )


def test_badge_handles_403_gracefully():
    """Non-owner users hit 403; the badge must render nothing rather
    than show an error or expose admin metrics."""
    src = _read(BADGE)
    assert "if (!data" in src or "if(!data" in src, (
        "Badge must short-circuit on missing/null data (403 / network failure)."
    )


def test_badge_mounted_in_hub():
    src = _read(HUB)
    assert "<ArchitectBadgeMount" in src or "<ArchitectBadge " in src, (
        "Architect's Badge no longer mounted on Sovereign Hub"
    )


# ─── Audit endpoint counts wrapper-mounted engines ──────────────────

def test_audit_counts_wrapper_mounted_engines_as_sentient():
    """V69.2 redefinition: an engine in MODULE_REGISTRY counts as
    sentient because the wrapper auto-commits its lifecycle. The
    audit must include the wrapper set, otherwise the claim is a lie."""
    src = _read(ADMIN_SENTIENCE)
    assert "_wrapped_engine_modules" in src, (
        "Audit no longer reads MODULE_REGISTRY — wrapper coverage is invisible."
    )
    assert "via_wrapper" in src, (
        "Audit response no longer reports per-engine via_wrapper status — "
        "the badge can't distinguish 'directly hooked' from 'wrapper-only'."
    )


def test_audit_still_distinguishes_direct_from_wrapper():
    """The honest report must let the owner see WHICH engines are
    sentient because of the wrapper alone vs which have direct hooks.
    Otherwise V69.2 progress is invisible to V69.3 work."""
    src = _read(ADMIN_SENTIENCE)
    assert '"direct"' in src, (
        "Audit must report 'direct' flag per engine so we know which "
        "still need richer hook-level integration."
    )

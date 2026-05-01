"""V68.97 — Sentient Cleanup regression lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies the cleanup pass that established a baseline sentience number
(% of engines whose underlying page reads or writes the ContextBus)
and wired the 3 truly-idle engines into the pull() dispatcher so they
are no longer silent ghost files.

These tests grep-lock:
  • Sentience does not regress below 19% (the V68.97 baseline)
  • Hourglass / Singularity / Production engines stay registered
"""
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PROCESSOR_STATE = REPO_ROOT / "frontend" / "src" / "state" / "ProcessorState.js"
ENGINES_DIR = REPO_ROOT / "frontend" / "src" / "engines"
PAGES_DIR = REPO_ROOT / "frontend" / "src" / "pages"


def _read(p: Path) -> str:
    assert p.exists(), f"Missing file: {p}"
    return p.read_text(encoding="utf-8")


def _audit_sentience() -> tuple[int, int]:
    """Walk every *Engine.js, find the page it wraps, return
    (sentient_count, total_count) where sentient = engine OR page
    contains busCommit / busRead / ContextBus / primerForPrompt."""
    sentient = 0
    total = 0
    bus_pat = re.compile(r"busCommit|busRead|ContextBus|primerForPrompt")
    page_import_pat = re.compile(r"from\s+'\.\./pages/([A-Za-z]+)'")
    for engine_file in sorted(ENGINES_DIR.glob("*Engine.js")):
        engine_src = _read(engine_file)
        m = page_import_pat.search(engine_src)
        if not m:
            continue
        page_file = PAGES_DIR / f"{m.group(1)}.js"
        if not page_file.exists():
            continue
        page_src = _read(page_file)
        total += 1
        if bus_pat.search(engine_src) or bus_pat.search(page_src):
            sentient += 1
    return sentient, total


# ─── Sentience baseline ─────────────────────────────────────────────

def test_sentience_baseline_at_least_19_percent():
    """V68.97 baseline: 11/56 engines (≈19.6%) talk to ContextBus.
    Future agents must not refactor pages in a way that DROPS this
    number — that would silently sever the nervous system."""
    sentient, total = _audit_sentience()
    pct = (sentient / total) * 100 if total else 0
    assert pct >= 19.0, (
        f"Sentience regressed: {sentient}/{total} = {pct:.1f}% "
        f"(V68.97 baseline was 19.6%). "
        f"An engine's page lost its busCommit/busRead. Re-thread it."
    )


def test_known_sentient_pages_keep_their_bus_calls():
    """The pages we explicitly wired (Breathing, MoodTracker, Herbology,
    Oracle, Dreams, MultiverseRealms) must continue to call busCommit."""
    must_have_bus = [
        "Breathing.js",
        "MoodTracker.js",
        "Herbology.js",
        "Oracle.js",
        "Dreams.js",
        "MultiverseRealms.js",
    ]
    for page in must_have_bus:
        src = _read(PAGES_DIR / page)
        assert "busCommit" in src, (
            f"{page} no longer calls busCommit — sentience broken."
        )


# ─── 3 idle engines wired into MODULE_REGISTRY ──────────────────────

def test_hourglass_singularity_production_registered():
    """V68.97 brought 3 truly-idle engines into the dispatcher.
    They must stay reachable via pull('HOURGLASS' | 'SINGULARITY' | 'PRODUCTION')."""
    src = _read(PROCESSOR_STATE)
    for key, engine_module in [
        ("HOURGLASS", "HourglassEngine"),
        ("SINGULARITY", "SingularityEngine"),
        ("PRODUCTION", "ProductionEngine"),
    ]:
        # Match either a single-line or multi-line registry entry; the
        # combination of the registry KEY and the engine module name is
        # what we lock.
        pat = rf"{key}\s*:[^\n]*engines/{engine_module}"
        assert re.search(pat, src), (
            f"{key} → {engine_module} not registered in MODULE_REGISTRY. "
            f"V68.97 wiring reverted; the engine is silent again."
        )


def test_module_registry_size_at_least_60():
    """V68.97 raised MODULE_REGISTRY from 57 to 60 entries. Future
    refactors must not drop below 60 without an explicit decision."""
    src = _read(PROCESSOR_STATE)
    m = re.search(r"export const MODULE_REGISTRY\s*=\s*\{(.*?)\n\};", src, re.S)
    assert m, "MODULE_REGISTRY block not found"
    body = m.group(1)
    count = len(re.findall(r"^\s+[A-Z_]+:\s*React\.lazy", body, re.M))
    assert count >= 60, (
        f"MODULE_REGISTRY shrunk to {count} entries (V68.97 baseline was 60). "
        f"An engine was un-wired without a roadmap entry."
    )


# ─── Coach realm-awareness wiring (V68.96 carryover) ────────────────

def test_coach_chat_accepts_realm_context():
    """V68.96 wired Sage to read realm_context. The handler must keep
    inlining ACTIVE REALM CONTEXT into the system prompt so realm
    entry actually colors Sage's voice."""
    coach = _read(REPO_ROOT / "backend" / "routes" / "coach.py")
    assert "realm_context" in coach, "coach.py no longer reads realm_context"
    assert "ACTIVE REALM CONTEXT" in coach, (
        "coach.py no longer inlines realm context into the system prompt"
    )


def test_spiritual_coach_sends_realm_context_from_bus():
    """SpiritualCoach.js must read worldMetadata from ContextBus and
    pass it through as realm_context on every chat call."""
    coach = _read(PAGES_DIR / "SpiritualCoach.js")
    assert "busReadKey" in coach, "SpiritualCoach.js no longer imports busReadKey"
    assert "realm_context" in coach, (
        "SpiritualCoach.js no longer sends realm_context — Sage stops "
        "knowing which realm the seeker is in."
    )

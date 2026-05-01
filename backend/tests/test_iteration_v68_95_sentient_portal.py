"""V68.95 — Sentient Portal Batch (Realm wiring) regression lock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codifies the (a)+(d)+(e) wiring that fused the Multiverse Realms
into the rest of the engine:

  (a) Element → Companion concept bridge (frontend constant
      ELEMENT_CONCEPT_MAP) AND backend concept fallback on
      /api/companions/{id}.

  (d) ContextBus.commit('worldMetadata', {biome: realm.element, ...})
      fired on enterRealm — the existing CrystallineLattice3D pulse
      listener takes it from there. No special-casing per element;
      the ResonanceAnalyzer lexicon handles the differentiation.

  (e) Per-element lucide icon (TreeDeciduous / Waves / Flame /
      Sparkles / Wind) replacing the generic <Globe>.

These tests grep-lock the wiring so a future refactor can't silently
revert it.
"""
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REALMS_PAGE = REPO_ROOT / "frontend" / "src" / "pages" / "MultiverseRealms.js"
COMPANIONS_BACKEND = REPO_ROOT / "backend" / "routes" / "companions.py"

sys.path.insert(0, str(REPO_ROOT / "backend"))
from routes import companions as _companions  # noqa: E402
from routes import realms as _realms  # noqa: E402


def _read(p: Path) -> str:
    assert p.exists(), f"Missing file: {p}"
    return p.read_text(encoding="utf-8")


# ─── (a) Element → Companion bridge ─────────────────────────────────

def test_realms_page_imports_companion_chip_and_bus_commit():
    """The realm view must import both the CompanionChip surface and
    the ContextBus commit helper. Without these, (a) and (d) are dead."""
    src = _read(REALMS_PAGE)
    assert "import CompanionChip" in src, "CompanionChip not imported into MultiverseRealms"
    assert "from '../state/ContextBus'" in src, "ContextBus import missing — lattice ripple impossible"
    assert re.search(r"commit\s+as\s+busCommit", src), "busCommit alias missing"


def test_element_concept_map_covers_every_realm_element():
    """Every element used by REALMS in the backend must have a concept
    bridge mapping in the frontend constant. Otherwise some realms
    surface no cross-tradition substrate."""
    backend_elements = {r["element"] for r in _realms.REALMS}
    page_src = _read(REALMS_PAGE)
    m = re.search(r"const ELEMENT_CONCEPT_MAP\s*=\s*\{(.*?)\};", page_src, re.S)
    assert m, "ELEMENT_CONCEPT_MAP not found in MultiverseRealms.js"
    body = m.group(1)
    mapped = set(re.findall(r"(\w+):\s*'([\w_]+)'", body))
    mapped_keys = {k for k, _ in mapped}
    missing = backend_elements - mapped_keys
    assert not missing, f"Realm elements without concept mapping: {missing}"


def test_element_concept_targets_are_real_concept_bridges():
    """Each value in ELEMENT_CONCEPT_MAP must be a real key in the
    backend's COMPANION_BRIDGES — otherwise the chip will fetch and
    silently 404."""
    page_src = _read(REALMS_PAGE)
    m = re.search(r"const ELEMENT_CONCEPT_MAP\s*=\s*\{(.*?)\};", page_src, re.S)
    body = m.group(1)
    targets = {v for _, v in re.findall(r"(\w+):\s*'([\w_]+)'", body)}
    unknown = targets - set(_companions.COMPANION_BRIDGES.keys())
    assert not unknown, (
        f"ELEMENT_CONCEPT_MAP points at concepts that don't exist in "
        f"COMPANION_BRIDGES: {unknown}. Companion chip will silently 404."
    )


def test_companion_endpoint_falls_back_to_concept_lookup():
    """A direct GET to /companions/{concept} must return the concept's
    bridge when text_id matches a concept. Without this, CompanionChip
    cannot surface element substrate without a frontend fetch helper."""
    src = _read(COMPANIONS_BACKEND)
    # The fallback branch must reference COMPANION_BRIDGES inside
    # get_companions, otherwise a concept request returns []
    handler = re.search(
        r"async def get_companions\(text_id: str\):.*?(?=\n\n@|\nasync def |\Z)",
        src, re.S
    )
    assert handler, "get_companions handler missing"
    assert "COMPANION_BRIDGES" in handler.group(0), (
        "get_companions has no concept-fallback branch — V68.95 realm "
        "substrate will return empty for stewardship/emptiness/etc."
    )


# ─── (d) Lattice ripple via ContextBus ──────────────────────────────

def test_enter_realm_commits_world_metadata_to_bus():
    """The enterRealm callback must call busCommit('worldMetadata', ...)
    so the Hub's lattice ripples on entry. The pulse-listener chain
    (CrystallineLattice3D → sovereign:pulse) is pre-existing."""
    src = _read(REALMS_PAGE)
    enter_block = re.search(r"const enterRealm\s*=.*?\}, \[", src, re.S)
    assert enter_block, "enterRealm callback not found"
    body = enter_block.group(0)
    assert "busCommit('worldMetadata'" in body or 'busCommit("worldMetadata"' in body, (
        "enterRealm does not commit worldMetadata to ContextBus — "
        "the lattice will NOT ripple on realm entry."
    )
    # And the payload must include the element so the analyzer's
    # lexicon has lexical signal to differentiate realms.
    assert "biome" in body or "element" in body, (
        "ContextBus payload must include element/biome to drive "
        "realm-specific lattice differentiation."
    )


# ─── (e) Distinct iconography ───────────────────────────────────────

def test_element_icon_map_replaces_generic_globe_in_card_list():
    """Every element must resolve to a distinct lucide icon, and the
    card list must call elementIcon(realm.element) instead of <Globe>
    for the visual identity guarantee."""
    src = _read(REALMS_PAGE)
    m = re.search(r"const ELEMENT_ICON_MAP\s*=\s*\{(.*?)\};", src, re.S)
    assert m, "ELEMENT_ICON_MAP not found"
    body = m.group(1)
    mapped_icons = re.findall(r"(\w+):\s*([A-Z]\w+)", body)
    icon_names = {icon for _, icon in mapped_icons}
    # Must have at least 4 distinct icons (earth/water/fire/ether/air,
    # though ether and air may legitimately overlap with Sparkles/Wind).
    assert len(icon_names) >= 4, (
        f"ELEMENT_ICON_MAP has only {len(icon_names)} distinct icons — "
        f"realms still look like a wall of identical tiles."
    )
    # The card list must call elementIcon(...) with the realm's element.
    assert "elementIcon(realm.element)" in src, (
        "Card list does not use elementIcon(realm.element) — generic "
        "Globe icon is still shown for every realm."
    )


def test_no_globe_icon_in_realm_card_render():
    """The literal `<Globe size={20}` inside the card-list render must
    be gone. Allow Globe in REALM_TO_SCENE / fallback only."""
    src = _read(REALMS_PAGE)
    # Find the realm card render block (between realms.map(...) and the
    # closing of the motion.button render). Look for <Globe size= INSIDE
    # the card render.
    card_block_match = re.search(
        r"realms\.map\(\(realm, i\) =>.*?</motion\.button>", src, re.S
    )
    assert card_block_match, "Realm card render block not found"
    card_block = card_block_match.group(0)
    assert "<Globe" not in card_block, (
        "Card-list render still uses <Globe> — element-distinct "
        "iconography is not actually applied."
    )

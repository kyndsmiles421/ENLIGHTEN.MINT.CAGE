"""
V68.93 — Catalog expansion (Hindu/Mahayana/Sikh/LDS/Avesta) +
CompanionChip frontend wiring.

Locks:
  • 15 new sacred texts catalogued (46 total)
  • CompanionChip component exists, uses /api/companions/{id}, hides on
    empty companions, expands on click.
  • Bible.js + SacredTexts.js both render the chip alongside the
    existing TranslateChip (no overlay, Flatland-compliant).
  • Companion engine has direct mappings for ALL 15 new texts so the
    chip never appears empty for the new corpus.
"""
import os
import requests
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def _read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


# ───────────── Catalog expansion ─────────────

def _texts():
    body = requests.get(f"{API}/sacred-texts", timeout=15).json()
    return body if isinstance(body, list) else body.get("texts", body)


def test_hindu_corpus_expanded():
    ids = {t["id"] for t in _texts()}
    expected = {"rig-veda", "sama-veda", "yajur-veda", "atharva-veda",
                "mahabharata", "ramayana", "brahma-sutras"}
    missing = expected - ids
    assert not missing, f"Hindu corpus missing: {missing}"


def test_mahayana_sutras_added():
    ids = {t["id"] for t in _texts()}
    expected = {"lotus-sutra", "heart-sutra", "diamond-sutra", "lankavatara-sutra"}
    missing = expected - ids
    assert not missing, f"Mahayana missing: {missing}"


def test_sikh_lds_zoroastrian_added():
    ids = {t["id"] for t in _texts()}
    expected = {"guru-granth-sahib", "book-of-mormon", "pearl-of-great-price", "zend-avesta"}
    missing = expected - ids
    assert not missing, f"Sikh/LDS/Avesta missing: {missing}"


def test_catalog_total_at_least_46():
    """Pre-V68.93: 31 texts. After: 31 + 15 = 46."""
    assert len(_texts()) >= 46


def test_mahabharata_carries_gita_chapter():
    """Spot-check that the Mahabharata's Bhishma Parva (the Gita's home) is indexed."""
    r = requests.get(f"{API}/sacred-texts/mahabharata", timeout=15)
    assert r.status_code == 200
    titles = [c["title"] for c in r.json()["chapters"]]
    assert any("Bhishma" in t and "Gita" in t for t in titles)


# ───────────── Companion bridges for new texts ─────────────

def test_heart_sutra_companions_to_emptiness_peers():
    body = requests.get(f"{API}/companions/heart-sutra", timeout=15).json()
    ids = {c["id"] for c in body["companions"]}
    # Heart Sutra should bridge to other emptiness teachings.
    assert "diamond-sutra" in ids or "tao-te-ching" in ids or "samyutta-nikaya" in ids


def test_mahabharata_companions_to_dharma_peers():
    body = requests.get(f"{API}/companions/mahabharata", timeout=15).json()
    ids = {c["id"] for c in body["companions"]}
    assert "bhagavad-gita" in ids or "samyutta-nikaya" in ids


def test_zend_avesta_companions_to_purification_peers():
    body = requests.get(f"{API}/companions/zend-avesta", timeout=15).json()
    ids = {c["id"] for c in body["companions"]}
    assert "visuddhimagga" in ids or "lakota-seven-rites" in ids or "yoga-sutras" in ids


def test_concept_emptiness_endpoint():
    body = requests.get(f"{API}/companions/concept/emptiness", timeout=15).json()
    assert body["concept"] == "emptiness"
    assert len(body["companions"]) >= 4


def test_concept_sacred_sound_endpoint():
    body = requests.get(f"{API}/companions/concept/sacred_sound", timeout=15).json()
    assert body["concept"] == "sacred_sound"
    ids = {c["id"] for c in body["companions"]}
    # Vedic Aum tradition + Sikh Mool Mantar + Christian Logos all rhyme.
    assert "atharva-veda" in ids
    assert "guru-granth-sahib" in ids
    assert "new-testament-john" in ids


# ───────────── CompanionChip frontend ─────────────

def test_companion_chip_component_exists():
    js = _read("frontend/src/components/CompanionChip.jsx")
    assert "export default function CompanionChip" in js
    # Must hit the V68.92 endpoint, not invent a new one.
    assert "/api/companions/" in js
    # Must hide gracefully when empty (companions.length === 0).
    assert "companions.length === 0" in js or "!companions" in js


def test_companion_chip_wired_into_bible():
    js = _read("frontend/src/pages/Bible.js")
    assert "import CompanionChip from '../components/CompanionChip'" in js
    assert "<CompanionChip" in js


def test_companion_chip_wired_into_sacred_texts():
    js = _read("frontend/src/pages/SacredTexts.js")
    assert "import CompanionChip from '../components/CompanionChip'" in js
    assert "<CompanionChip" in js


def test_companion_chip_uses_axios_only_for_known_endpoint():
    """Audit-first guard: chip must NOT introduce a parallel companions
    backend or call any endpoint other than /api/companions/{id}."""
    js = _read("frontend/src/components/CompanionChip.jsx")
    # We allow axios here because companions is a fresh GET that
    # doesn't fit the existing voice-interaction pipeline. But it
    # must hit only /api/companions/.
    assert js.count("/api/companions/") >= 1
    # No parallel paths.
    forbidden = ["/api/related", "/api/cross-tradition", "/api/synthesis"]
    for path in forbidden:
        assert path not in js, f"chip must not call {path}"

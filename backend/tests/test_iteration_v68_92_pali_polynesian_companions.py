"""
V68.92 — Pali Canon + Polynesian + Indigenous expansion + Companion engine.

Locks the catalog at the new totals so future agents can't accidentally
roll back the expansion. Validates the Companion engine returns the
right ordained cross-tradition pairings for the new entries.
"""
import os
import requests
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def test_pali_canon_proper_added():
    """The Pali Canon expansion: 10 entries covering Sutta Pitaka,
    5 Nikayas, Vinaya, Abhidhamma, Visuddhimagga, Milindapanha."""
    r = requests.get(f"{API}/sacred-texts", timeout=15)
    assert r.status_code == 200
    body = r.json()
    texts = body if isinstance(body, list) else body.get("texts", body)
    ids = {t["id"] for t in texts}
    pali = {
        "sutta-pitaka", "digha-nikaya", "majjhima-nikaya", "samyutta-nikaya",
        "anguttara-nikaya", "khuddaka-nikaya", "vinaya-pitaka",
        "abhidhamma-pitaka", "visuddhimagga", "milindapanha",
    }
    missing = pali - ids
    assert not missing, f"Pali Canon missing: {missing}"


def test_polynesian_added():
    """Polynesian wisdom: Kumulipo + Huna Principles + Maori Whakapapa."""
    body = requests.get(f"{API}/sacred-texts", timeout=15).json()
    texts = body if isinstance(body, list) else body.get("texts", body)
    ids = {t["id"] for t in texts}
    poly = {"kumulipo", "huna-principles", "whakapapa-maori"}
    missing = poly - ids
    assert not missing, f"Polynesian missing: {missing}"


def test_indigenous_truly_missing_added():
    """Indigenous wisdom NOT already covered by Odu Ifa or Popol Vuh:
    Lakota Seven Rites, Aboriginal Dreamtime, Hopi Prophecy."""
    body = requests.get(f"{API}/sacred-texts", timeout=15).json()
    texts = body if isinstance(body, list) else body.get("texts", body)
    ids = {t["id"] for t in texts}
    indig = {"lakota-seven-rites", "dreamtime-aboriginal", "hopi-prophecy"}
    missing = indig - ids
    assert not missing, f"Indigenous wisdom missing: {missing}"


def test_sacred_texts_total_count_at_least_31():
    """Pre-V68.92 had 15 traditions. After expansion: 15 + 16 = 31."""
    body = requests.get(f"{API}/sacred-texts", timeout=15).json()
    texts = body if isinstance(body, list) else body.get("texts", body)
    assert len(texts) >= 31, f"Expected >=31 sacred texts, got {len(texts)}"


def test_pali_entries_carry_metadata_shape():
    """Every Pali entry must have title + tradition + chapters with
    real titles so the AI generator has rich prompt seeds."""
    # The list endpoint returns summaries; fetch the detail for chapters.
    r = requests.get(f"{API}/sacred-texts/majjhima-nikaya", timeout=15)
    assert r.status_code == 200, r.text
    mn = r.json()
    assert "Theravada" in mn["tradition"]
    assert len(mn["chapters"]) >= 5
    titles = [c["title"] for c in mn["chapters"]]
    # The two most famous suttas must be in the chapter index.
    assert any("Satipatthana" in t for t in titles), "Satipatthana sutta must be indexed"
    assert any("Anapanasati" in t for t in titles), "Anapanasati sutta must be indexed"


# ───────────────────────── COMPANION ENGINE ─────────────────────────

def test_companion_endpoint_responds():
    r = requests.get(f"{API}/companions/kumulipo", timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["text_id"] == "kumulipo"
    assert isinstance(body["companions"], list)
    assert len(body["companions"]) > 0


def test_kumulipo_links_to_other_creation_traditions():
    """The Kumulipo (Hawaiian creation) must surface companions from
    Hebrew/Mayan/Norse/Maori creation traditions — exactly the
    'cross-cultural references historically spiritually intertwined'
    the user requested."""
    body = requests.get(f"{API}/companions/kumulipo", timeout=15).json()
    companion_ids = {c["id"] for c in body["companions"]}
    # At least 3 of these 4 must be present.
    creation_peers = {
        "old-testament-genesis", "whakapapa-maori",
        "popol-vuh", "norse-edda",
    }
    assert len(companion_ids & creation_peers) >= 3, \
        f"Kumulipo should link to multiple creation peers, got {companion_ids}"


def test_maryam_links_to_christian_and_hindu():
    """Mary/Maryam — the sacred mother across Abrahamic + Indic traditions."""
    body = requests.get(f"{API}/companions/maryam", timeout=15).json()
    ids = {c["id"] for c in body["companions"]}
    assert "new-testament-luke" in ids, "Maryam must companion to Luke 1"
    assert "bhagavad-gita" in ids, "Maryam must companion to Gita avatar discourse"


def test_concept_endpoint_returns_full_bridge():
    """The /concept/{name} endpoint returns ALL traditions sharing a
    concept — used by the Sovereign sacred-mode synthesis view."""
    body = requests.get(f"{API}/companions/concept/creation", timeout=15).json()
    assert body["concept"] == "creation"
    # Should include at least 5 of the 7 creation cosmogonies.
    assert len(body["companions"]) >= 5
    ids = {c["id"] for c in body["companions"]}
    expected_subset = {"old-testament-genesis", "kumulipo", "popol-vuh"}
    assert expected_subset <= ids


def test_companion_unknown_concept_404s():
    r = requests.get(f"{API}/companions/concept/klingon-cosmogony", timeout=15)
    assert r.status_code == 404


def test_companion_unknown_text_returns_empty_companions():
    """A text we don't have a curated bridge for should still respond
    successfully with an empty companions list — graceful degradation."""
    r = requests.get(f"{API}/companions/some-unmapped-text-xyz", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["companions"] == []

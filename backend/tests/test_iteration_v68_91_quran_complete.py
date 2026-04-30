"""
V68.91 — Quran completion regression.

Locks the catalog at full-Quran coverage (114/114 surahs) so a future
agent can't accidentally roll the file back. Also asserts a sample of
key surahs across the chronology — early Mecca, late Mecca, Medina,
final farewell — are all present with proper metadata shape.
"""
import os
import requests

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASS = "Sovereign2026!"


def _owner_token():
    r = requests.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def _quran_books():
    tok = _owner_token()
    r = requests.get(f"{API}/bible/books?category=quran", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    return body if isinstance(body, list) else body.get("books", [])


def test_quran_catalog_is_complete_114():
    books = _quran_books()
    assert len(books) == 114, f"Expected 114 surahs (full Quran), got {len(books)}"


def test_quran_books_carry_required_metadata_shape():
    books = _quran_books()
    sample = books[0]
    for k in ("id", "title", "category", "chapters", "description", "era", "themes"):
        assert k in sample, f"Surah missing required field {k}: {sample}"
    assert sample["category"] == "quran"
    assert isinstance(sample["themes"], list) and len(sample["themes"]) >= 1


def test_quran_includes_full_chronology():
    """Sample across the full chronology: opening, early Meccan,
    middle Meccan, late Meccan, Medinan, and farewell."""
    ids = {b["id"] for b in _quran_books()}
    chronology_samples = {
        "al-fatiha":     "the Opening",
        "al-alaq":       "first revelation",
        "al-muddaththir":"the cloaked / early call",
        "ya-sin":        "Heart of the Quran (mid Meccan)",
        "yusuf":         "the Joseph narrative",
        "al-baqarah":    "the longest surah, Medinan",
        "an-nisa":       "Medinan family law",
        "al-fath":       "Treaty of Hudaybiyyah",
        "an-nasr":       "the farewell surah of victory",
        "al-falaq":      "the protection surah",
        "an-nas":        "the final surah",
    }
    missing = {k: v for k, v in chronology_samples.items() if k not in ids}
    assert not missing, f"Missing chronology surahs: {missing}"


def test_quran_no_duplicate_ids():
    """Defends against accidental re-injection of an entry that's already
    in the legacy catalog."""
    books = _quran_books()
    ids = [b["id"] for b in books]
    dupes = {i for i in ids if ids.count(i) > 1}
    assert not dupes, f"Duplicate surah ids detected: {dupes}"

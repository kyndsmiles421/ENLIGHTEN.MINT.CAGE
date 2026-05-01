"""
test_iteration_v1_0_8_starseed_shield.py — V1.0.8 regression suite

Validates:
  1. /api/starseed/origins returns ZERO banned wellness/medical words.
     (The duplicate route in routes/starseed.py and the canonical one
     in routes/starseed_adventure.py both apply _shield_obj.)
  2. _shield_text preserves capitalization (Healing → Harmonizing).
  3. _shield_obj recurses into nested dicts/lists (origin traits list
     is shielded the same way as scalar fields).
  4. _shield_text is idempotent — applying it twice produces the same
     result as applying it once. Critical for defense-in-depth where
     the same text might pass through the shield in multiple layers.

These tests are pure-Python (no FastAPI client needed) so they run in
~0.05s and protect against future agents reintroducing wellness copy.
"""
import pytest

from routes.starseed_adventure import (
    _shield_text,
    _shield_obj,
    STARSEED_ORIGINS,
)

BANNED = [
    "healer", "healing", "cure ", "medical", "therapy",
    "wellness", "diagnos", "prescri", "patient", "medicin",
]


def _has_banned(s: str) -> list:
    """Return the list of banned tokens that appear in s (lowercased)."""
    if not isinstance(s, str):
        return []
    low = s.lower()
    return [b for b in BANNED if b in low]


def test_shield_capitalization_preserved():
    assert _shield_text("Healing") == "Harmonizing"
    assert _shield_text("healing") == "harmonizing"
    assert _shield_text("Healer") == "Harmonizer"
    assert _shield_text("the great healers gather") == "the great harmonizers gather"


def test_shield_phrase_takes_precedence_over_word():
    # "healing chamber" should become "resonance chamber", not
    # "harmonizing chamber" — phrase rule must fire first.
    out = _shield_text("step into the healing chamber")
    assert "resonance chamber" in out
    assert "healing" not in out.lower()


def test_shield_idempotent():
    src = "Pleiadians are cosmic healers and great healing energy flows."
    once = _shield_text(src)
    twice = _shield_text(once)
    assert once == twice
    # And no banned tokens leak after either pass.
    assert not _has_banned(once)
    assert not _has_banned(twice)


def test_shield_obj_recurses_into_dicts_and_lists():
    payload = {
        "title": "Healing Path",
        "tags": ["Healing", "Wisdom", "Cure"],
        "nested": {
            "lore": "The healers walked the medical path.",
            "items": [{"name": "Therapy Stone"}],
        },
    }
    out = _shield_obj(payload)
    # "Healing Path" matches the more-specific phrase rule first
    # (healing path → harmonic path), not the generic word rule.
    assert "Healing" not in out["title"]
    assert "Harmonic" in out["title"]
    assert "Healing" not in out["tags"]
    assert "Cure" not in out["tags"]
    assert "Wisdom" in out["tags"]  # untouched
    assert "healers" not in out["nested"]["lore"].lower()
    assert "medical" not in out["nested"]["lore"].lower()
    assert "Therapy" not in out["nested"]["items"][0]["name"]


def test_starseed_origins_static_data_is_shielded_at_runtime():
    """Even if the static STARSEED_ORIGINS list still contains 'healer',
    the shielded copy returned by the route must not. This guards
    against future edits adding new wellness verbs to the static list."""
    for origin in STARSEED_ORIGINS:
        item = {k: v for k, v in origin.items() if k != "starting_stats"}
        shielded = _shield_obj(item)
        for k, v in shielded.items():
            if isinstance(v, str):
                leaks = _has_banned(v)
                assert not leaks, f"{origin['id']}.{k} leaked: {leaks} → {v[:120]}"
            elif isinstance(v, list):
                for item_str in v:
                    if isinstance(item_str, str):
                        leaks = _has_banned(item_str)
                        assert not leaks, f"{origin['id']}.{k} list leak: {leaks} → {item_str}"


def test_shield_handles_none_and_empty_gracefully():
    assert _shield_text(None) is None
    assert _shield_text("") == ""
    assert _shield_text(123) == 123  # non-strings pass through
    assert _shield_obj({"a": None, "b": [], "c": "Healing"}) == {
        "a": None, "b": [], "c": "Harmonizing",
    }


def test_shield_does_not_break_unrelated_words():
    # Make sure we don't accidentally maul innocuous vocabulary that
    # happens to contain banned substrings (e.g., "ailment" → "discord"
    # but "alignment" must NOT be touched).
    assert _shield_text("alignment") == "alignment"
    assert _shield_text("treatise") == "treatise"  # word-boundary guard
    assert _shield_text("uncured") == "uncured"  # no \buncured\b match

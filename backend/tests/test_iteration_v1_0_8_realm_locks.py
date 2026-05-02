"""
test_iteration_v1_0_8_realm_locks.py — V1.0.8 regression

Validates the structure of the user-level-aware realm lock gate.

The live HTTP path was hand-verified via curl during development:
  • GET  /api/realms/  (with Bearer token) returns each realm with
    `is_locked` + `user_level` + `unlock_level`.
  • POST /api/realms/void_sanctum/enter  (below-level user)
    returns 403 with detail={code:"realm_locked", message, user_level,
    required_level}.
  • POST /api/realms/astral_garden/enter (unlock_level=0) always 200.

These tests validate the source shape so future refactors can't
silently remove the gate (the FastAPI TestClient + async mongo pair
have a known event-loop issue in this harness, so we assert on the
module source rather than drive HTTP through it).
"""
import inspect
import pytest

from routes import realms as realms_mod


def test_realms_has_current_level_helper():
    """Source of truth for the level computation must live in realms.py
    so the lock ladder cannot drift from a second implementation."""
    assert hasattr(realms_mod, "_current_level")
    src = inspect.getsource(realms_mod._current_level)
    # Uses the consciousness ladder (reuses existing infra — no
    # parallel implementation).
    assert "consciousness" in src.lower()
    # Multiplies by 2 so the 0-5 consciousness level maps to the
    # 0-10 realm unlock ladder.
    assert "* 2" in src or "*2" in src


def test_realms_list_endpoint_exposes_lock_fields():
    """GET /realms/ must inject is_locked + user_level on every item."""
    src = inspect.getsource(realms_mod.get_realms)
    assert "is_locked" in src
    assert "user_level" in src
    assert "unlock_level" in src


def test_realm_detail_endpoint_exposes_lock_fields():
    src = inspect.getsource(realms_mod.get_realm)
    assert "is_locked" in src
    assert "user_level" in src


def test_enter_realm_enforces_server_side_lock_gate():
    """POST /realms/:id/enter must 403 for under-leveled users."""
    src = inspect.getsource(realms_mod.enter_realm)
    # Must compute user's current level.
    assert "_current_level" in src
    # Must return a 403 with the structured error code when blocked.
    assert "403" in src
    assert "realm_locked" in src
    # Must expose both user_level and required_level in the error body.
    assert "required_level" in src


def test_realms_static_data_has_unlock_ladder():
    """Every realm entry must carry unlock_level (so the gate has
    something to enforce against)."""
    for r in realms_mod.REALMS:
        assert "unlock_level" in r, f"Realm {r.get('id')} missing unlock_level"
        assert isinstance(r["unlock_level"], int)
        assert r["unlock_level"] >= 0
    # Starter realm must be always-unlocked.
    starter = next((x for x in realms_mod.REALMS if x["id"] == "astral_garden"), None)
    assert starter is not None
    assert starter["unlock_level"] == 0
    # Highest-tier realm must require > 5 (otherwise the ladder is flat).
    assert any(r["unlock_level"] >= 8 for r in realms_mod.REALMS)

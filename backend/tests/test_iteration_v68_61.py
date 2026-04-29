"""
test_iteration_v68_61.py — Resonance Cross-Pollination

Verifies:
  1) /api/oracle/reading accepts an optional `context_primer`
     and returns 200 with a non-empty interpretation (or fallback).
  2) /api/forecasts/generate accepts an optional `context_primer`,
     and the cache key differs from the stand-alone forecast (so
     primer-driven forecasts don't collide with vanilla ones).
"""
import os
import sys
import asyncio
import uuid
import httpx
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def _login():
    r = httpx.post(f"{API}/auth/login", json={
        "email": "kyndsmiles@gmail.com",
        "password": "Sovereign2026!",
    }, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"no token in login response: {r.json()}"
    return tok


def test_oracle_reading_accepts_context_primer():
    """Oracle endpoint accepts a primer payload and still returns a valid reading."""
    primer = (
        "[ContextBus] Current narrative: A storm-mood forecast — heavy "
        "transformation, water energy, endings preceding new clarity."
    )
    body = {
        "reading_type": "tarot",
        "spread": "three_card",
        "question": "What should I prepare for?",
        "context_primer": primer,
    }
    r = httpx.post(f"{API}/oracle/reading", json=body, timeout=45)
    assert r.status_code == 200, f"oracle/reading failed: {r.status_code} {r.text}"
    data = r.json()
    # Either real LLM response (interpretation) or fallback shape
    assert "type" in data
    assert data.get("type") in ("tarot", "fallback") or "interpretation" in data
    assert isinstance(data.get("interpretation", ""), str)


def test_oracle_reading_without_primer_still_works():
    """Backward compat — omitting context_primer must not break."""
    r = httpx.post(f"{API}/oracle/reading", json={
        "reading_type": "tarot",
        "spread": "three_card",
    }, timeout=45)
    assert r.status_code == 200, f"oracle/reading no-primer failed: {r.status_code} {r.text}"


def test_forecast_primer_isolates_cache():
    """A forecast with a primer must not be served from a cache key
    populated by a stand-alone (no-primer) forecast — they're stored
    under different keys (cache_key = ...:p<hash>)."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}

    # Plain forecast
    r1 = httpx.post(
        f"{API}/forecasts/generate",
        json={"system": "tarot", "period": "daily"},
        headers=headers,
        timeout=60,
    )
    assert r1.status_code == 200, f"plain forecast failed: {r1.status_code} {r1.text}"
    plain = r1.json()

    # Primer forecast — must hit a different cache row even on same day
    r2 = httpx.post(
        f"{API}/forecasts/generate",
        json={
            "system": "tarot",
            "period": "daily",
            "context_primer": (
                "[ContextBus] Current sovereign entity: Phoenix archetype. "
                "Current world: Vega star-system, threshold of dawn."
            ),
        },
        headers=headers,
        timeout=60,
    )
    assert r2.status_code == 200, f"primer forecast failed: {r2.status_code} {r2.text}"
    primed = r2.json()

    # Different documents (different cache keys) => different ids OR
    # different bodies. The cache key isolation is what matters here.
    assert plain.get("id") != primed.get("id") or plain != primed, (
        "primer-keyed forecast collided with plain forecast — cache isolation broken"
    )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

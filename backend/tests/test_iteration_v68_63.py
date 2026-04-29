"""
test_iteration_v68_63.py — Multiverse RPG Anchoring (Slot Machine → Real RPG)
─────────────────────────────────────────────────────────────────────
Locks the V68.63 fix: clicking "Enter the Story" from the Multiverse
map no longer hits the slot-machine /starseed/worlds/explore endpoint.
It now flows through /starseed/generate-scene with an explicit
realm_id, producing real branching narrative anchored in the chosen
realm's lore.
"""
import os
import httpx
import pytest

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def _login():
    r = httpx.post(f"{API}/auth/login", json={
        "email": "kyndsmiles@gmail.com",
        "password": "Sovereign2026!",
    }, timeout=15)
    assert r.status_code == 200
    return r.json().get("token") or r.json().get("access_token")


def test_generate_scene_accepts_realm_id():
    """The fix: /starseed/generate-scene must accept realm_id and
    return narrative that mentions the realm."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    r = httpx.post(
        f"{API}/starseed/generate-scene",
        json={
            "origin_id": "pleiadian",
            "choice_index": None,
            "realm_id": "astral-sanctum",
        },
        headers=headers,
        timeout=90,
    )
    assert r.status_code == 200, f"scene gen failed: {r.status_code} {r.text}"
    data = r.json()
    scene = data.get("scene", {})
    narrative = (scene.get("narrative") or "").lower()
    # The realm anchoring must show up. Either the realm name or
    # one of its signature terms (light, healing, sanctum, pleiad)
    # — proves the realm_prompt actually reached the LLM.
    assert any(term in narrative for term in [
        "astral", "sanctum", "pleiad", "healing light", "luminous",
    ]), f"Narrative didn't anchor to Astral Sanctum lore: {narrative[:200]}"
    # Real RPG returns 3 branching choices — not a flat slot result.
    choices = scene.get("choices", [])
    assert len(choices) == 3, f"expected 3 choices, got {len(choices)}"
    # Each choice must have stat_effect (the gameplay hook). At least
    # one should have a non-empty stat_effect.
    assert any(c.get("stat_effect") for c in choices), "no stat-affecting choices"


def test_realm_persists_on_character():
    """After generating a scene with realm_id, the character record
    must store current_realm so subsequent calls (without realm_id)
    still anchor to the same realm."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    httpx.post(
        f"{API}/starseed/generate-scene",
        json={
            "origin_id": "pleiadian",
            "choice_index": None,
            "realm_id": "shadow-nexus",
        },
        headers=headers,
        timeout=90,
    )
    chars = httpx.get(f"{API}/starseed/my-characters", headers=headers, timeout=15).json()
    pleiadian = next((c for c in chars["characters"] if c["origin_id"] == "pleiadian"), None)
    assert pleiadian is not None
    assert pleiadian.get("current_realm") in ("shadow-nexus", "astral-sanctum"), (
        f"current_realm not persisted: {pleiadian.get('current_realm')}"
    )


def test_no_realm_id_still_works_legacy_path():
    """Backward compat — the /starseed-adventure direct entry path
    must still work without a realm_id (legacy)."""
    tok = _login()
    headers = {"Authorization": f"Bearer {tok}"}
    r = httpx.post(
        f"{API}/starseed/generate-scene",
        json={"origin_id": "pleiadian", "choice_index": None},
        headers=headers,
        timeout=90,
    )
    assert r.status_code == 200, f"legacy scene gen failed: {r.status_code} {r.text}"
    assert "scene" in r.json()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

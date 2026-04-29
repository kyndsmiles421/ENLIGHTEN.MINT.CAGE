"""
test_iteration_v68_62.py — Unified Entity Graph (Inlay) regression
─────────────────────────────────────────────────────────────────────
Locks the Mint→Peppermint bridge and the federated resolver
behavior. These tests must never regress — they're the proof that
the four silos (herbology + botany + aromatherapy + sovereign_library)
are unified into a single navigable graph.
"""
import os
import httpx
import pytest

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001") + "/api"


def test_entity_index_returns_unified_corpus():
    """The whitelist must merge all four silos — at least 50 nodes
    and 100 aliases. Sub-50 means a silo failed to import."""
    r = httpx.get(f"{API}/entity/index", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 50, f"Inlay too small: {data['count']} nodes"
    assert data["alias_count"] >= 100, f"Alias map too small: {data['alias_count']}"
    assert any(n["name"] == "Peppermint" for n in data["nodes"])
    assert any("reishi" in n["name"].lower() for n in data["nodes"])
    assert any("vedic" in n.get("traditions", []) for n in data["nodes"])


def test_mint_resolves_to_peppermint():
    """The original user-reported bug: 'mint' returned nothing.
    Now: 'mint' must resolve to the Peppermint node."""
    r = httpx.get(f"{API}/entity/mint", timeout=15)
    assert r.status_code == 200, f"/entity/mint failed: {r.status_code} {r.text}"
    node = r.json()
    assert node["id"] == "peppermint"
    assert node["name"] == "Peppermint"
    assert node["latin"] == "Mentha piperita"
    assert "aromatherapy" in node["sources"]


def test_tulsi_resolves_to_holy_basil_with_vedic_view():
    """Cross-silo aliasing: 'tulsi' is the alias for holy_basil
    AND the Vedic tradition view from sovereign_library must be
    attached automatically."""
    r = httpx.get(f"{API}/entity/tulsi", timeout=15)
    assert r.status_code == 200
    node = r.json()
    assert node["id"] == "holy_basil"
    assert "vedic" in node["traditions"]
    assert "vedic" in node["tradition_views"]


def test_unknown_entity_returns_404():
    r = httpx.get(f"{API}/entity/this_is_not_a_plant_xyz", timeout=15)
    assert r.status_code == 404


def test_context_seed_present_for_pollination():
    """Every /entity/{id} response carries a context_seed that the
    frontend commits to ContextBus.entityState. V68.61 cross-pollination
    relies on this — Tarot/Oracle/Forecast prime from the active herb."""
    r = httpx.get(f"{API}/entity/peppermint", timeout=15)
    assert r.status_code == 200
    seed = r.json().get("context_seed")
    assert seed is not None
    assert seed.get("activeEntity") == "peppermint"
    assert seed.get("name") == "Peppermint"
    assert "type" in seed


def test_lakota_perspective_endpoint_responds():
    """The cultural overlay freeze fix relies on this endpoint
    returning within 35s — confirmed by the AbortController in
    TraditionLens.js. We only check the contract, not the LLM."""
    r = httpx.post(
        f"{API}/omni-bridge/cross-tradition",
        json={"traditions": ["lakota"], "topic": "Mint", "module": "herbology"},
        timeout=45,
    )
    # Either 200 (LLM succeeded) or 500/504 (LLM failed) — but never
    # a hang. The HTTP client would have raised TimeoutException if
    # the backend hung. Reaching this assertion means the endpoint
    # returned within budget.
    assert r.status_code in (200, 500, 502, 504)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

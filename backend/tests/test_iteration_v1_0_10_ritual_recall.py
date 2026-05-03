"""V1.0.10 — Ritual Chain Recall regression suite.

Validates the recall path:
  • GET /api/forge/ritual-chains returns chains with `steps` payload sufficient
    for the frontend to re-run a chain WITHOUT another POST to /ritual-chain.
  • Chains are ordered most-recent first.
  • Each persisted chain has the fields the Wand recall pills need:
    {id, ritual_title, steps:[{module_id, label, duration, narration}]}.
"""
import os
import time
import requests
import pytest

BACKEND = os.environ.get("REACT_APP_BACKEND_URL") or "https://zero-scale-physics.preview.emergentagent.com"
API = f"{BACKEND}/api"
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PWD = "Sovereign2026!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{API}/auth/login",
        json={"email": OWNER_EMAIL, "password": OWNER_PWD},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    t = r.json().get("token") or r.json().get("access_token")
    assert t
    return t


def test_recent_chains_payload_runnable(token):
    """The Wand recall path skips the LLM. The list endpoint must
    therefore return enough state for the runner to start a chain
    purely from a stored entry."""
    r = requests.get(
        f"{API}/forge/ritual-chains?limit=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    chains = r.json().get("chains") or []
    assert isinstance(chains, list)
    # If the user has any history, every entry must be runnable
    for c in chains:
        assert c.get("id"), "chain.id required for React keying + dedupe"
        assert c.get("ritual_title"), "ritual_title required for the pill label"
        steps = c.get("steps")
        assert isinstance(steps, list) and steps, "steps required to re-run"
        for s in steps:
            assert s.get("module_id")
            assert "label" in s
            assert "duration" in s


def test_recent_chains_ordered_descending(token):
    """Forge two chains in quick succession and ensure the second one
    is returned first (most-recent-first ordering)."""
    headers = {"Authorization": f"Bearer {token}"}
    r1 = requests.post(
        f"{API}/forge/ritual-chain",
        headers=headers,
        json={"intent": "First test chain — ground and breathe", "max_steps": 2},
        timeout=40,
    )
    assert r1.status_code == 200
    first_id = r1.json()["id"]
    time.sleep(0.5)
    r2 = requests.post(
        f"{API}/forge/ritual-chain",
        headers=headers,
        json={"intent": "Second test chain — kindle a lantern of clarity", "max_steps": 2},
        timeout=40,
    )
    assert r2.status_code == 200
    second_id = r2.json()["id"]
    time.sleep(0.4)

    r = requests.get(f"{API}/forge/ritual-chains?limit=5", headers=headers, timeout=15)
    assert r.status_code == 200
    ids = [c["id"] for c in r.json()["chains"]]
    assert second_id in ids and first_id in ids
    assert ids.index(second_id) < ids.index(first_id), "newest chain should appear first"


def test_recent_chains_unauthenticated():
    r = requests.get(f"{API}/forge/ritual-chains?limit=3", timeout=15)
    assert r.status_code in (401, 403)

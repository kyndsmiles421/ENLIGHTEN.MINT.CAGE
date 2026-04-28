"""
test_iteration_v68_59.py — V68.59 ContextBus archival regression.

Verifies:
  1) /api/time-capsules/archive accepts a sendBeacon-style POST with
     token in body and persists the snapshot.
  2) Re-firing within the 5-second dedup window returns deduped=True
     and does NOT create a second document.
  3) After the dedup window, a fresh fire creates a new capsule.
  4) /api/time-capsules/recent returns the user's capsules sorted
     newest-first.
  5) Invalid token is rejected with ok=False (not 401 — beacons may
     retry on auth errors).
  6) Oversized payload (>16 KB) is rejected with payload-too-large.
"""
import os
import json
import time
import urllib.request

API = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://zero-scale-physics.preview.emergentagent.com",
).rstrip("/") + "/api"
EMAIL = "kyndsmiles@gmail.com"
PASSWORD = "Sovereign2026!"


def _request(url, body=None, token=None, method="POST"):
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (sovereign-test-suite)",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def _login():
    r = _request(f"{API}/auth/login", {"email": EMAIL, "password": PASSWORD})
    return r.get("token") or r.get("access_token")


def _payload(token, session_id, gauge_load=0.55, gauge_state="flow"):
    return {
        "token": token,
        "session_id": session_id,
        "snapshot": {
            "worldMetadata": {"origin_name": "Pleiades", "biome": "Crystalline Caverns"},
            "narrativeContext": {"title": "Awakening", "body": "violet shadow"},
            "entityState": {"description": "Crystal sovereign", "spirit_animal": "phoenix"},
            "history": [{"key": "worldMetadata", "t": 1700000000000}],
        },
        "gauge_load": gauge_load,
        "gauge_state": gauge_state,
        "active_module": "STORY_GEN",
        "client_ts": "2026-02-27T12:00:00Z",
    }


def test_archive_basic_write_and_recent_readback():
    token = _login()
    assert token, "login failed"
    sess_id = f"test-basic-{int(time.time())}"

    res = _request(f"{API}/time-capsules/archive", _payload(token, sess_id))
    assert res.get("ok") is True, f"archive failed: {res}"

    # Read back via the authenticated GET — uses Authorization header
    recent = _request(
        f"{API}/time-capsules/recent?limit=10",
        token=token,
        method="GET",
    )
    caps = recent.get("capsules", [])
    mine = [c for c in caps if c.get("session_id") == sess_id]
    assert len(mine) >= 1, f"capsule not found in recent: {caps}"
    snap = mine[0].get("snapshot") or {}
    assert snap.get("worldMetadata", {}).get("origin_name") == "Pleiades"
    assert snap.get("entityState", {}).get("spirit_animal") == "phoenix"


def test_archive_dedup_within_window():
    token = _login()
    sess_id = f"test-dedup-{int(time.time())}"

    r1 = _request(f"{API}/time-capsules/archive", _payload(token, sess_id))
    assert r1.get("ok") is True

    # Immediate re-fire — should dedup
    r2 = _request(f"{API}/time-capsules/archive", _payload(token, sess_id))
    assert r2.get("ok") is True and r2.get("deduped") is True


def test_archive_post_dedup_window_creates_new_doc():
    token = _login()
    sess_id = f"test-post-{int(time.time())}"

    _request(f"{API}/time-capsules/archive", _payload(token, sess_id))
    time.sleep(6)  # past 5-second dedup window
    r2 = _request(f"{API}/time-capsules/archive",
                  _payload(token, sess_id, gauge_load=0.85, gauge_state="overheating"))
    assert r2.get("ok") is True and not r2.get("deduped")

    # Verify both capsules visible in recent
    recent = _request(f"{API}/time-capsules/recent?limit=20", token=token, method="GET")
    mine = [c for c in recent.get("capsules", []) if c.get("session_id") == sess_id]
    assert len(mine) >= 2, f"expected 2+ capsules, got {len(mine)}"
    # Newest-first ordering
    states = [c.get("gauge_state") for c in mine[:2]]
    assert states[0] == "overheating", f"newest should be overheating: {states}"


def test_archive_rejects_invalid_token_gracefully():
    sess_id = f"test-bad-{int(time.time())}"
    payload = {"token": "garbage.invalid.jwt", "session_id": sess_id, "snapshot": {}}
    r = _request(f"{API}/time-capsules/archive", payload)
    assert r.get("ok") is False
    assert r.get("reason") == "invalid-token"


def test_archive_rejects_oversize_payload():
    token = _login()
    sess_id = f"test-huge-{int(time.time())}"
    huge = _payload(token, sess_id)
    huge["snapshot"] = {"junk": "x" * 18_000}
    r = _request(f"{API}/time-capsules/archive", huge)
    assert r.get("ok") is False
    assert r.get("reason") == "payload-too-large"

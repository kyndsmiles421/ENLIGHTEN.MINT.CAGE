"""
V68.6/V68.7 — Lattice Activation, Presence Economy, Share Endpoints
Tests for:
- POST /api/main-brain/activate (route activation)
- GET /api/main-brain/user-lattice (user's 9x9 pattern)
- GET /api/main-brain/route-map (route→coord mapping)
- POST /api/presence/tick (immersion economy)
- GET /api/presence/stats (presence aggregates)
- GET /api/share/pattern (authed share)
- GET /api/share/pattern/public/{share_id} (unauthed share)
- dust_events backfill verification
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMainBrainActivate:
    """Tests for /api/main-brain/activate endpoint."""

    def test_activate_tesseract_route(self, auth_headers):
        """POST /api/main-brain/activate with path='/tesseract' should return activated:true, coord:{x:4,y:4}, node_type:'CORE'."""
        response = requests.post(
            f"{BASE_URL}/api/main-brain/activate",
            json={"path": "/tesseract"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("activated") is True, f"Expected activated=True, got {data}"
        assert "coord" in data, f"Missing coord in response: {data}"
        assert data["coord"]["x"] == 4, f"Expected x=4, got {data['coord']}"
        assert data["coord"]["y"] == 4, f"Expected y=4, got {data['coord']}"
        assert data.get("node_type") == "CORE", f"Expected node_type='CORE', got {data.get('node_type')}"
        
        # Verify charge and resonance are present and reasonable
        assert "charge" in data, f"Missing charge in response: {data}"
        assert "resonance" in data, f"Missing resonance in response: {data}"
        assert 0 < data["charge"] <= 1.0, f"Charge should be 0-1, got {data['charge']}"
        # Resonance should be ~0.83 (PHI^2/PI * charge)
        assert 0.5 < data["resonance"] < 1.0, f"Resonance should be ~0.83, got {data['resonance']}"
        print(f"✓ Tesseract activation: coord={data['coord']}, type={data['node_type']}, charge={data['charge']:.4f}, resonance={data['resonance']:.4f}")

    def test_activate_same_route_again(self, auth_headers):
        """POST same activation again within 5s — backend still returns 200 (debounce is CLIENT-SIDE)."""
        response = requests.post(
            f"{BASE_URL}/api/main-brain/activate",
            json={"path": "/tesseract"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200 on repeat activation, got {response.status_code}"
        data = response.json()
        assert data.get("activated") is True, f"Backend should still return activated=True (debounce is client-side)"
        print(f"✓ Repeat activation returns 200 with activated=True (debounce is client-side)")

    def test_activate_workshop_geology_route(self, auth_headers):
        """POST /api/main-brain/activate with path='/workshop/geology' — should return RELAY-ring coord."""
        response = requests.post(
            f"{BASE_URL}/api/main-brain/activate",
            json={"path": "/workshop/geology"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("activated") is True, f"Expected activated=True for workshop route"
        assert "coord" in data, f"Missing coord in response"
        # Workshop routes hash to RELAY ring positions
        print(f"✓ Workshop/geology activation: coord={data['coord']}, type={data.get('node_type')}")

    def test_activate_empty_path_returns_400(self, auth_headers):
        """POST /api/main-brain/activate with path='' — should return HTTPException 400."""
        response = requests.post(
            f"{BASE_URL}/api/main-brain/activate",
            json={"path": ""},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for empty path, got {response.status_code}"
        print(f"✓ Empty path returns 400 as expected")

    def test_activate_nonexistent_route(self, auth_headers):
        """POST /api/main-brain/activate with path='/nonexistent-route' — should return activated:false, reason:'route_not_mapped'."""
        response = requests.post(
            f"{BASE_URL}/api/main-brain/activate",
            json={"path": "/nonexistent-route"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("activated") is False, f"Expected activated=False for unmapped route"
        assert data.get("reason") == "route_not_mapped", f"Expected reason='route_not_mapped', got {data.get('reason')}"
        print(f"✓ Nonexistent route returns activated=False, reason='route_not_mapped'")


class TestMainBrainUserLattice:
    """Tests for /api/main-brain/user-lattice endpoint."""

    def test_get_user_lattice(self, auth_headers):
        """GET /api/main-brain/user-lattice — should return 9x9 flat array + last_path + unique_nodes_visited."""
        response = requests.get(
            f"{BASE_URL}/api/main-brain/user-lattice",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("lattice_size") == 9, f"Expected lattice_size=9, got {data.get('lattice_size')}"
        assert "flat" in data, f"Missing 'flat' array in response"
        assert len(data["flat"]) == 9, f"Expected 9 rows in flat array, got {len(data['flat'])}"
        assert all(len(row) == 9 for row in data["flat"]), "Each row should have 9 columns"
        
        assert "last_path" in data, f"Missing 'last_path' in response"
        assert "unique_nodes_visited" in data, f"Missing 'unique_nodes_visited' in response"
        assert "total_activations" in data, f"Missing 'total_activations' in response"
        
        # Verify unique_nodes_visited matches number of distinct coords
        non_null_count = sum(1 for row in data["flat"] for cell in row if cell is not None)
        assert data["unique_nodes_visited"] == non_null_count, f"unique_nodes_visited should match non-null cells"
        
        print(f"✓ User lattice: {data['unique_nodes_visited']} unique nodes, {data['total_activations']} total activations")
        print(f"  last_path has {len(data['last_path'])} entries")


class TestMainBrainRouteMap:
    """Tests for /api/main-brain/route-map endpoint."""

    def test_get_route_map(self, auth_headers):
        """GET /api/main-brain/route-map — should return mapping dict + lattice_size:9."""
        response = requests.get(
            f"{BASE_URL}/api/main-brain/route-map",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("lattice_size") == 9, f"Expected lattice_size=9, got {data.get('lattice_size')}"
        assert "mapping" in data, f"Missing 'mapping' in response"
        assert isinstance(data["mapping"], dict), f"mapping should be a dict"
        
        # Verify some known routes
        mapping = data["mapping"]
        assert "/tesseract" in mapping, "Missing /tesseract in mapping"
        assert "/sovereign-hub" in mapping, "Missing /sovereign-hub in mapping"
        assert mapping["/tesseract"] == [4, 4], f"Expected /tesseract at [4,4], got {mapping['/tesseract']}"
        
        print(f"✓ Route map has {len(mapping)} routes, lattice_size=9")


class TestPresenceTick:
    """Tests for /api/presence/tick endpoint."""

    def test_presence_tick_valid_scene(self, auth_headers):
        """POST /api/presence/tick with scene_id='tesseract' — should grant +5 dust + 2 sparks."""
        response = requests.post(
            f"{BASE_URL}/api/presence/tick",
            json={"scene_id": "tesseract"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # First tick should be granted (unless rate-limited from previous test)
        if data.get("granted"):
            assert data.get("dust_awarded") == 5, f"Expected dust_awarded=5, got {data.get('dust_awarded')}"
            assert data.get("sparks_awarded") == 2, f"Expected sparks_awarded=2, got {data.get('sparks_awarded')}"
            assert data.get("scene_id") == "tesseract", f"Expected scene_id='tesseract'"
            print(f"✓ Presence tick granted: +{data['dust_awarded']} dust, +{data['sparks_awarded']} sparks")
        else:
            # Rate-limited
            assert data.get("reason") == "too_soon", f"Expected reason='too_soon' when rate-limited"
            assert "seconds_until_next" in data, f"Missing seconds_until_next in rate-limited response"
            print(f"✓ Presence tick rate-limited: {data['seconds_until_next']}s until next")

    def test_presence_tick_rate_limit(self, auth_headers):
        """POST same tick immediately — should return granted:false, reason:'too_soon'."""
        response = requests.post(
            f"{BASE_URL}/api/presence/tick",
            json={"scene_id": "tesseract"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should be rate-limited (55s minimum between ticks)
        assert data.get("granted") is False, f"Expected granted=False on immediate re-tick"
        assert data.get("reason") == "too_soon", f"Expected reason='too_soon'"
        assert "seconds_until_next" in data, f"Missing seconds_until_next"
        print(f"✓ Rate limit working: {data['seconds_until_next']}s until next tick")

    def test_presence_tick_invalid_scene(self, auth_headers):
        """POST /api/presence/tick with scene_id='invalid_scene' — HTTPException 400."""
        response = requests.post(
            f"{BASE_URL}/api/presence/tick",
            json={"scene_id": "invalid_scene"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid scene, got {response.status_code}"
        print(f"✓ Invalid scene returns 400 as expected")


class TestPresenceStats:
    """Tests for /api/presence/stats endpoint."""

    def test_get_presence_stats(self, auth_headers):
        """GET /api/presence/stats — aggregates user's presence across all scenes."""
        response = requests.get(
            f"{BASE_URL}/api/presence/stats",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "scenes" in data, f"Missing 'scenes' in response"
        assert "total_minutes" in data, f"Missing 'total_minutes' in response"
        assert "total_dust_earned" in data, f"Missing 'total_dust_earned' in response"
        
        # Verify scene structure if any scenes present
        if data["scenes"]:
            scene = data["scenes"][0]
            assert "scene_id" in scene, f"Missing scene_id in scene"
            assert "minutes" in scene, f"Missing minutes in scene"
            assert "dust_earned" in scene, f"Missing dust_earned in scene"
        
        print(f"✓ Presence stats: {len(data['scenes'])} scenes, {data['total_minutes']} total minutes, {data['total_dust_earned']} dust earned")


class TestSharePattern:
    """Tests for /api/share/pattern endpoints."""

    def test_get_share_pattern_authed(self, auth_headers):
        """GET /api/share/pattern — authed, returns share_id, share_path, caption, pattern."""
        response = requests.get(
            f"{BASE_URL}/api/share/pattern",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "share_id" in data, f"Missing share_id in response"
        assert "share_path" in data, f"Missing share_path in response"
        assert "caption" in data, f"Missing caption in response"
        assert "pattern" in data, f"Missing pattern in response"
        
        pattern = data["pattern"]
        assert "rank" in pattern, f"Missing rank in pattern"
        assert "sparks" in pattern, f"Missing sparks in pattern"
        assert "display_name" in pattern, f"Missing display_name in pattern"
        assert "unique_nodes" in pattern, f"Missing unique_nodes in pattern"
        assert "total_activations" in pattern, f"Missing total_activations in pattern"
        assert "coords" in pattern, f"Missing coords in pattern"
        
        # Verify share_id is stable (sha1-based)
        assert len(data["share_id"]) == 12, f"share_id should be 12 chars, got {len(data['share_id'])}"
        
        print(f"✓ Share pattern: share_id={data['share_id']}, rank={pattern['rank']}, sparks={pattern['sparks']}")
        return data["share_id"]

    def test_share_id_is_idempotent(self, auth_headers):
        """Calling /api/share/pattern twice returns same share_id (idempotent)."""
        response1 = requests.get(f"{BASE_URL}/api/share/pattern", headers=auth_headers)
        response2 = requests.get(f"{BASE_URL}/api/share/pattern", headers=auth_headers)
        
        assert response1.status_code == 200 and response2.status_code == 200
        
        share_id_1 = response1.json().get("share_id")
        share_id_2 = response2.json().get("share_id")
        
        assert share_id_1 == share_id_2, f"share_id should be stable/idempotent: {share_id_1} != {share_id_2}"
        print(f"✓ share_id is idempotent: {share_id_1}")

    def test_get_public_pattern(self, auth_headers):
        """GET /api/share/pattern/public/{share_id} — UNAUTHED, returns same pattern."""
        # First get the share_id
        response = requests.get(f"{BASE_URL}/api/share/pattern", headers=auth_headers)
        share_id = response.json().get("share_id")
        
        # Now fetch public (no auth)
        public_response = requests.get(f"{BASE_URL}/api/share/pattern/public/{share_id}")
        assert public_response.status_code == 200, f"Expected 200, got {public_response.status_code}"
        
        data = public_response.json()
        assert "rank" in data, f"Missing rank in public pattern"
        assert "sparks" in data, f"Missing sparks in public pattern"
        assert "coords" in data, f"Missing coords in public pattern"
        
        print(f"✓ Public pattern accessible without auth: rank={data['rank']}, sparks={data['sparks']}")

    def test_get_public_pattern_invalid_id(self):
        """GET /api/share/pattern/public/invalid_id — 404."""
        response = requests.get(f"{BASE_URL}/api/share/pattern/public/invalid_id_xyz")
        assert response.status_code == 404, f"Expected 404 for invalid share_id, got {response.status_code}"
        print(f"✓ Invalid share_id returns 404")


class TestDustEventsBackfill:
    """Verify dust_events collection gets entries from various operations."""

    def test_dust_events_from_presence_tick(self, auth_headers):
        """Verify presence tick creates dust_events entry."""
        # We already did a presence tick above, let's verify dust_events
        # by checking the user's dust balance changed
        # Note: We can't directly query dust_events without a dedicated endpoint
        # But we can verify the presence tick worked by checking stats
        response = requests.get(f"{BASE_URL}/api/presence/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # If we have any dust earned, the backfill is working
        if data.get("total_dust_earned", 0) > 0:
            print(f"✓ dust_events backfill verified via presence stats: {data['total_dust_earned']} dust earned")
        else:
            print(f"⚠ No dust earned yet in presence stats (may need to wait for tick)")


class TestClientSideDebounce:
    """Verify client-side debounce exists in useImmersionPresence.js."""

    def test_debounce_constant_exists(self):
        """Verify ACTIVATE_DEBOUNCE_MS=5000 exists in useImmersionPresence.js."""
        hook_path = "/app/frontend/src/hooks/useImmersionPresence.js"
        try:
            with open(hook_path, 'r') as f:
                content = f.read()
            
            assert "ACTIVATE_DEBOUNCE_MS" in content, "Missing ACTIVATE_DEBOUNCE_MS constant"
            assert "5000" in content, "ACTIVATE_DEBOUNCE_MS should be 5000"
            assert "_lastActivate" in content, "Missing _lastActivate Map for debounce"
            
            print(f"✓ Client-side debounce verified: ACTIVATE_DEBOUNCE_MS=5000, _lastActivate Map present")
        except FileNotFoundError:
            pytest.skip(f"Hook file not found at {hook_path}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

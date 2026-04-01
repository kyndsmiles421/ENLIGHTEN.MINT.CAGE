"""
Test Iteration 176: Starseed Energy Gates
Tests for progression checkpoints requiring polished gems, traded materials, 
consciousness level, time cooldowns, realm travel, and warp (credit-based time skip).
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestEnergyGatesStatus:
    """Tests for GET /api/energy-gates/status endpoint."""

    def test_gates_status_returns_5_gates(self, auth_headers):
        """Verify status endpoint returns all 5 energy gates."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "gates" in data, "Response should contain 'gates' array"
        assert len(data["gates"]) == 5, f"Expected 5 gates, got {len(data['gates'])}"
        
        # Verify gate IDs
        gate_ids = [g["id"] for g in data["gates"]]
        expected_ids = ["gate_earth", "gate_water", "gate_fire", "gate_air", "gate_ether"]
        assert gate_ids == expected_ids, f"Gate IDs mismatch: {gate_ids}"

    def test_gates_status_contains_user_stats(self, auth_headers):
        """Verify status endpoint returns user_stats."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "user_stats" in data, "Response should contain 'user_stats'"
        
        user_stats = data["user_stats"]
        required_fields = ["dust", "polished_gems", "trades_completed", "consciousness_level", "realms_visited", "credits"]
        for field in required_fields:
            assert field in user_stats, f"user_stats should contain '{field}'"

    def test_gates_status_contains_total_unlocked(self, auth_headers):
        """Verify status endpoint returns total_unlocked count."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_unlocked" in data, "Response should contain 'total_unlocked'"
        assert "total_gates" in data, "Response should contain 'total_gates'"
        assert data["total_gates"] == 5, f"Expected 5 total gates, got {data['total_gates']}"
        assert isinstance(data["total_unlocked"], int), "total_unlocked should be an integer"

    def test_gate_earth_progress_structure(self, auth_headers):
        """Verify Gate of Earth has correct progress structure."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        gate_earth = next((g for g in data["gates"] if g["id"] == "gate_earth"), None)
        assert gate_earth is not None, "Gate of Earth not found"
        
        # Check progress structure
        assert "progress" in gate_earth, "Gate should have 'progress' field"
        progress = gate_earth["progress"]
        
        required_progress_fields = ["consciousness", "polished_gems", "dust", "trades", "travel", "time_lock"]
        for field in required_progress_fields:
            assert field in progress, f"Progress should contain '{field}'"
        
        # Each progress field should have current, required, met
        for field in ["consciousness", "polished_gems", "dust", "trades"]:
            assert "current" in progress[field], f"{field} should have 'current'"
            assert "required" in progress[field], f"{field} should have 'required'"
            assert "met" in progress[field], f"{field} should have 'met'"

    def test_gate_earth_consciousness_met_for_level1_user(self, auth_headers):
        """Test user with consciousness_level=1 meets Gate of Earth consciousness requirement."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        gate_earth = next((g for g in data["gates"] if g["id"] == "gate_earth"), None)
        
        # Gate of Earth requires min_consciousness=1
        assert gate_earth["min_consciousness"] == 1, "Gate of Earth should require consciousness level 1"
        
        # User at level 1 should meet consciousness requirement
        consciousness_progress = gate_earth["progress"]["consciousness"]
        assert consciousness_progress["required"] == 1, "Gate of Earth consciousness requirement should be 1"
        # User is at level 1, so should meet requirement
        if data["user_stats"]["consciousness_level"] >= 1:
            assert consciousness_progress["met"] == True, "Consciousness requirement should be met for level 1+ user"

    def test_gate_properties(self, auth_headers):
        """Verify each gate has required properties."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        required_gate_fields = [
            "id", "name", "element", "frequency", "color", "aura_glow",
            "min_consciousness", "requirements", "time_lock_hours", "travel_realms",
            "warp_cost_credits", "rewards", "description", "lore",
            "unlocked", "can_unlock", "prev_unlocked", "progress"
        ]
        
        for gate in data["gates"]:
            for field in required_gate_fields:
                assert field in gate, f"Gate {gate.get('id', 'unknown')} missing field '{field}'"


class TestEnergyGatesUnlock:
    """Tests for POST /api/energy-gates/unlock endpoint."""

    def test_unlock_rejects_insufficient_polished_gems(self, auth_headers):
        """Verify unlock fails when user has 0 polished gems."""
        # First check user's current polished gems
        status_response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert status_response.status_code == 200
        user_stats = status_response.json()["user_stats"]
        
        # If user has 0 polished gems, unlock should fail
        if user_stats["polished_gems"] == 0:
            response = requests.post(
                f"{BASE_URL}/api/energy-gates/unlock",
                json={"gate_id": "gate_earth"},
                headers=auth_headers
            )
            # Should fail with 400 for insufficient resources
            assert response.status_code == 400, f"Expected 400 for insufficient gems, got {response.status_code}"
            assert "polished gem" in response.json().get("detail", "").lower(), "Error should mention polished gems"

    def test_unlock_rejects_unknown_gate(self, auth_headers):
        """Verify unlock fails for unknown gate ID."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/unlock",
            json={"gate_id": "gate_unknown"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for unknown gate, got {response.status_code}"
        assert "unknown gate" in response.json().get("detail", "").lower()

    def test_unlock_requires_previous_gate(self, auth_headers):
        """Verify unlock fails if previous gate not unlocked."""
        # Try to unlock gate_water without gate_earth
        status_response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        gates = status_response.json()["gates"]
        gate_earth = next(g for g in gates if g["id"] == "gate_earth")
        
        if not gate_earth["unlocked"]:
            response = requests.post(
                f"{BASE_URL}/api/energy-gates/unlock",
                json={"gate_id": "gate_water"},
                headers=auth_headers
            )
            assert response.status_code == 403, f"Expected 403 for sequential requirement, got {response.status_code}"
            assert "previous gate" in response.json().get("detail", "").lower()


class TestEnergyGatesWarp:
    """Tests for POST /api/energy-gates/warp endpoint."""

    def test_warp_handles_no_time_lock(self, auth_headers):
        """Verify warp fails when there's no time lock to bypass."""
        # Gate of Earth has no time lock (time_lock_hours=0)
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/warp",
            json={"gate_id": "gate_earth"},
            headers=auth_headers
        )
        # Should fail because gate_earth has no time lock
        assert response.status_code == 400, f"Expected 400 for no time lock, got {response.status_code}"
        detail = response.json().get("detail", "").lower()
        assert "no time lock" in detail or "time lock" in detail, f"Error should mention time lock: {detail}"

    def test_warp_rejects_unknown_gate(self, auth_headers):
        """Verify warp fails for unknown gate ID."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/warp",
            json={"gate_id": "gate_invalid"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for unknown gate, got {response.status_code}"

    def test_warp_requires_credits(self, auth_headers):
        """Verify warp checks credit balance."""
        # Get user's current credits
        status_response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        user_stats = status_response.json()["user_stats"]
        
        # Gate of Water has warp_cost_credits=2
        # If user has insufficient credits and gate_earth is unlocked, warp should fail
        gates = status_response.json()["gates"]
        gate_earth = next(g for g in gates if g["id"] == "gate_earth")
        
        if gate_earth["unlocked"]:
            response = requests.post(
                f"{BASE_URL}/api/energy-gates/warp",
                json={"gate_id": "gate_water"},
                headers=auth_headers
            )
            # Either no time lock or insufficient credits
            assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestEnergyGatesTravel:
    """Tests for POST /api/energy-gates/travel endpoint."""

    def test_travel_records_valid_realm(self, auth_headers):
        """Verify travel records a valid realm visit."""
        valid_realms = ["starseed_journey", "refinement_lab", "cosmic_mixer", "dream_realms", "trade_circle"]
        
        for realm in valid_realms:
            response = requests.post(
                f"{BASE_URL}/api/energy-gates/travel",
                json={"realm": realm},
                headers=auth_headers
            )
            assert response.status_code == 200, f"Expected 200 for realm '{realm}', got {response.status_code}"
            data = response.json()
            assert data.get("recorded") == True, f"Travel to '{realm}' should be recorded"
            assert data.get("realm") == realm, f"Response should echo realm '{realm}'"

    def test_travel_rejects_invalid_realm(self, auth_headers):
        """Verify travel rejects invalid realm names."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "invalid_realm_xyz"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid realm, got {response.status_code}"
        assert "unknown realm" in response.json().get("detail", "").lower()


class TestEnergyGatesTravelLog:
    """Tests for GET /api/energy-gates/travel-log endpoint."""

    def test_travel_log_returns_visited_realms(self, auth_headers):
        """Verify travel-log returns user's visited realms."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/travel-log", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "realms_visited" in data, "Response should contain 'realms_visited'"
        assert "all_realms" in data, "Response should contain 'all_realms'"
        assert "total_visited" in data, "Response should contain 'total_visited'"
        assert "total_realms" in data, "Response should contain 'total_realms'"
        
        # all_realms should contain the 5 valid realms
        assert len(data["all_realms"]) == 5, f"Expected 5 total realms, got {len(data['all_realms'])}"
        
        # total_visited should match length of realms_visited
        assert data["total_visited"] == len(data["realms_visited"])


class TestEnergyGatesHistory:
    """Tests for GET /api/energy-gates/history endpoint."""

    def test_history_returns_unlock_data(self, auth_headers):
        """Verify history returns gate unlock history."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "unlocked" in data, "Response should contain 'unlocked' array"
        assert "history" in data, "Response should contain 'history' array"
        
        # Both should be lists
        assert isinstance(data["unlocked"], list), "'unlocked' should be a list"
        assert isinstance(data["history"], list), "'history' should be a list"


class TestEnergyGatesAuthentication:
    """Tests for authentication requirements."""

    def test_status_requires_auth(self):
        """Verify status endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"

    def test_unlock_requires_auth(self):
        """Verify unlock endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/energy-gates/unlock", json={"gate_id": "gate_earth"})
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"

    def test_travel_requires_auth(self):
        """Verify travel endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/energy-gates/travel", json={"realm": "trade_circle"})
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

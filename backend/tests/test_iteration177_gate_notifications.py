"""
Test Iteration 177: Gate Notifications Enhancement
Tests for travel recording endpoints and gate status with travel data.
- POST /api/energy-gates/travel - records realm visits, rejects invalid realms
- GET /api/energy-gates/travel-log - returns visited realms list
- GET /api/energy-gates/status - returns gate progress including travel data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Valid realms from TRAVEL_REALMS in energy_gates.py
VALID_REALMS = ["starseed_journey", "refinement_lab", "cosmic_mixer", "dream_realms", "trade_circle"]


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


class TestTravelEndpoint:
    """Tests for POST /api/energy-gates/travel endpoint."""

    def test_travel_records_valid_realm_starseed_journey(self, auth_headers):
        """Test recording starseed_journey realm visit."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "starseed_journey"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("recorded") == True, "Response should indicate recorded=True"
        assert data.get("realm") == "starseed_journey", "Response should echo the realm"

    def test_travel_records_valid_realm_refinement_lab(self, auth_headers):
        """Test recording refinement_lab realm visit."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "refinement_lab"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("recorded") == True
        assert data.get("realm") == "refinement_lab"

    def test_travel_records_valid_realm_cosmic_mixer(self, auth_headers):
        """Test recording cosmic_mixer realm visit."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "cosmic_mixer"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("recorded") == True
        assert data.get("realm") == "cosmic_mixer"

    def test_travel_records_valid_realm_dream_realms(self, auth_headers):
        """Test recording dream_realms realm visit."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "dream_realms"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("recorded") == True
        assert data.get("realm") == "dream_realms"

    def test_travel_records_valid_realm_trade_circle(self, auth_headers):
        """Test recording trade_circle realm visit."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "trade_circle"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("recorded") == True
        assert data.get("realm") == "trade_circle"

    def test_travel_rejects_invalid_realm(self, auth_headers):
        """Test that invalid realm names are rejected with 400."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "invalid_realm_xyz"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid realm, got {response.status_code}: {response.text}"

    def test_travel_rejects_empty_realm(self, auth_headers):
        """Test that empty realm is rejected with 400."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": ""},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for empty realm, got {response.status_code}: {response.text}"

    def test_travel_requires_authentication(self):
        """Test that travel endpoint requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "starseed_journey"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestTravelLogEndpoint:
    """Tests for GET /api/energy-gates/travel-log endpoint."""

    def test_travel_log_returns_visited_realms(self, auth_headers):
        """Test travel-log returns list of visited realms."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/travel-log",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "realms_visited" in data, "Response should contain 'realms_visited'"
        assert isinstance(data["realms_visited"], list), "realms_visited should be a list"

    def test_travel_log_returns_all_realms_list(self, auth_headers):
        """Test travel-log returns all_realms list."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/travel-log",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "all_realms" in data, "Response should contain 'all_realms'"
        assert isinstance(data["all_realms"], list), "all_realms should be a list"
        assert len(data["all_realms"]) == 5, f"Expected 5 total realms, got {len(data['all_realms'])}"

    def test_travel_log_returns_counts(self, auth_headers):
        """Test travel-log returns total_visited and total_realms counts."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/travel-log",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "total_visited" in data, "Response should contain 'total_visited'"
        assert "total_realms" in data, "Response should contain 'total_realms'"
        assert data["total_realms"] == 5, f"Expected 5 total realms, got {data['total_realms']}"
        assert isinstance(data["total_visited"], int), "total_visited should be an integer"

    def test_travel_log_reflects_recorded_visits(self, auth_headers):
        """Test that travel-log reflects previously recorded visits."""
        # First record a visit
        requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "starseed_journey"},
            headers=auth_headers
        )
        
        # Then check travel log
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/travel-log",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "starseed_journey" in data["realms_visited"], "starseed_journey should be in visited realms"

    def test_travel_log_requires_authentication(self):
        """Test that travel-log endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/travel-log")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestGateStatusWithTravel:
    """Tests for GET /api/energy-gates/status with travel data."""

    def test_status_includes_realms_visited_in_user_stats(self, auth_headers):
        """Test that status endpoint includes realms_visited in user_stats."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/status",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "user_stats" in data, "Response should contain 'user_stats'"
        assert "realms_visited" in data["user_stats"], "user_stats should contain 'realms_visited'"
        assert isinstance(data["user_stats"]["realms_visited"], list), "realms_visited should be a list"

    def test_status_gate_progress_includes_travel(self, auth_headers):
        """Test that each gate's progress includes travel requirements."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        for gate in data["gates"]:
            assert "progress" in gate, f"Gate {gate['id']} should have 'progress'"
            assert "travel" in gate["progress"], f"Gate {gate['id']} progress should have 'travel'"
            
            travel = gate["progress"]["travel"]
            assert "required" in travel, "travel should have 'required'"
            assert "visited" in travel, "travel should have 'visited'"
            assert "missing" in travel, "travel should have 'missing'"
            assert "met" in travel, "travel should have 'met'"

    def test_gate_earth_has_no_travel_requirements(self, auth_headers):
        """Test that Gate of Earth has no travel requirements."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        gate_earth = next((g for g in data["gates"] if g["id"] == "gate_earth"), None)
        assert gate_earth is not None, "Gate of Earth not found"
        
        travel = gate_earth["progress"]["travel"]
        assert travel["required"] == [], "Gate of Earth should have no travel requirements"
        assert travel["met"] == True, "Gate of Earth travel should be met (no requirements)"

    def test_gate_water_requires_starseed_and_refinement(self, auth_headers):
        """Test that Gate of Water requires starseed_journey and refinement_lab."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        gate_water = next((g for g in data["gates"] if g["id"] == "gate_water"), None)
        assert gate_water is not None, "Gate of Water not found"
        
        travel = gate_water["progress"]["travel"]
        assert "starseed_journey" in travel["required"], "Gate of Water should require starseed_journey"
        assert "refinement_lab" in travel["required"], "Gate of Water should require refinement_lab"

    def test_gate_ether_requires_all_five_realms(self, auth_headers):
        """Test that Gate of Ether requires all 5 realms."""
        response = requests.get(
            f"{BASE_URL}/api/energy-gates/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        gate_ether = next((g for g in data["gates"] if g["id"] == "gate_ether"), None)
        assert gate_ether is not None, "Gate of Ether not found"
        
        travel = gate_ether["progress"]["travel"]
        assert len(travel["required"]) == 5, f"Gate of Ether should require 5 realms, got {len(travel['required'])}"
        for realm in VALID_REALMS:
            assert realm in travel["required"], f"Gate of Ether should require {realm}"


class TestTravelIdempotency:
    """Tests for travel recording idempotency."""

    def test_travel_is_idempotent(self, auth_headers):
        """Test that recording the same realm multiple times is idempotent."""
        # Record same realm twice
        response1 = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "starseed_journey"},
            headers=auth_headers
        )
        assert response1.status_code == 200
        
        response2 = requests.post(
            f"{BASE_URL}/api/energy-gates/travel",
            json={"realm": "starseed_journey"},
            headers=auth_headers
        )
        assert response2.status_code == 200
        
        # Check travel log - should only have one entry for starseed_journey
        log_response = requests.get(
            f"{BASE_URL}/api/energy-gates/travel-log",
            headers=auth_headers
        )
        assert log_response.status_code == 200
        
        data = log_response.json()
        # Count occurrences of starseed_journey
        count = data["realms_visited"].count("starseed_journey")
        assert count == 1, f"starseed_journey should appear exactly once, got {count}"

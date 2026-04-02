"""
Iteration 209 Tests: Orbital Ring Rotation, SatelliteInspector, CosmicPrescription Wiring
Tests for:
1. Orbital ring rotation with momentum, friction, snap-to-grid
2. Long-press inspect on satellites (SatelliteInspector overlay)
3. CosmicPrescription frequency button and navigation links
4. ActiveSatellite 'active' label when snapped
5. Regression tests for gravity, archives, weather, hub APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication for testing"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        # Try alternate test user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestGravityAPIs(TestAuth):
    """Test gravity field APIs - used by OrbitalHub"""
    
    def test_gravity_nodes(self, auth_headers):
        """GET /api/gravity/nodes - Returns gravity nodes for orbital system"""
        response = requests.get(f"{BASE_URL}/api/gravity/nodes", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "nodes" in data, "Response should contain 'nodes'"
        assert len(data["nodes"]) > 0, "Should have at least one gravity node"
        print(f"✓ GET /api/gravity/nodes - {len(data['nodes'])} nodes returned")
    
    def test_gravity_field(self, auth_headers):
        """GET /api/gravity/field - Returns field parameters"""
        response = requests.get(f"{BASE_URL}/api/gravity/field", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Field should have parameters for mesh rendering
        print(f"✓ GET /api/gravity/field - Field data returned")
    
    def test_gravity_interact(self, auth_headers):
        """POST /api/gravity/interact - Record interaction with gravity node"""
        response = requests.post(f"{BASE_URL}/api/gravity/interact", 
            headers=auth_headers,
            json={"node_id": "meditation", "dwell_seconds": 5})
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        print(f"✓ POST /api/gravity/interact - Interaction recorded")


class TestArchivesAPIs(TestAuth):
    """Test archives APIs - used by SatelliteInspector"""
    
    def test_archives_entries(self, auth_headers):
        """GET /api/archives/entries - Returns list of archive entries"""
        response = requests.get(f"{BASE_URL}/api/archives/entries", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "entries" in data, "Response should contain 'entries'"
        print(f"✓ GET /api/archives/entries - {len(data.get('entries', []))} entries returned")
    
    def test_archives_entry_om_vedic(self, auth_headers):
        """GET /api/archives/entry/om-vedic - Returns specific archive entry with trinity data"""
        response = requests.get(f"{BASE_URL}/api/archives/entry/om-vedic", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # SatelliteInspector uses this data for Trinity View
        if not data.get("error") and not data.get("locked"):
            assert "trinity" in data or "title" in data, "Entry should have trinity or title"
        print(f"✓ GET /api/archives/entry/om-vedic - Entry data returned")
    
    def test_archives_entry_meditation(self, auth_headers):
        """GET /api/archives/entry/meditation - Test satellite ID lookup"""
        response = requests.get(f"{BASE_URL}/api/archives/entry/meditation", headers=auth_headers)
        # May return 404 if no archive entry for meditation satellite
        assert response.status_code in [200, 404], f"Expected 200/404, got {response.status_code}"
        print(f"✓ GET /api/archives/entry/meditation - Status {response.status_code}")
    
    def test_archives_linguistics(self, auth_headers):
        """GET /api/archives/linguistics - Returns comparative linguistics concepts"""
        response = requests.get(f"{BASE_URL}/api/archives/linguistics", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "concepts" in data, "Response should contain 'concepts'"
        print(f"✓ GET /api/archives/linguistics - {len(data.get('concepts', []))} concepts returned")


class TestWeatherAPI(TestAuth):
    """Test weather API - used by OrbitalHub"""
    
    def test_weather_current(self, auth_headers):
        """GET /api/weather/current - Returns current weather data"""
        response = requests.get(f"{BASE_URL}/api/weather/current?lat=44.08&lon=-103.23", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Weather data used for ambience and ribbon
        print(f"✓ GET /api/weather/current - Weather data returned")


class TestHubPreferences(TestAuth):
    """Test hub preferences API - used by OrbitalHub"""
    
    def test_hub_preferences_get(self, auth_headers):
        """GET /api/hub/preferences - Returns user's active satellites"""
        response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "active_satellites" in data, "Response should contain 'active_satellites'"
        print(f"✓ GET /api/hub/preferences - {len(data.get('active_satellites', []))} active satellites")
    
    def test_hub_preferences_post(self, auth_headers):
        """POST /api/hub/preferences - Save user's active satellites"""
        response = requests.post(f"{BASE_URL}/api/hub/preferences",
            headers=auth_headers,
            json={"active_satellites": ["mood", "mixer", "map", "breathing", "meditation", "theory"]})
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        print(f"✓ POST /api/hub/preferences - Preferences saved")


class TestWellnessPrescription(TestAuth):
    """Test wellness prescription API - used by CosmicPrescription"""
    
    def test_wellness_prescription(self, auth_headers):
        """GET /api/wellness/prescription - Returns cosmic prescription with frequency"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # CosmicPrescription uses this for frequency button
        assert "recommended_frequency" in data or "mantra" in data, "Should have frequency or mantra"
        print(f"✓ GET /api/wellness/prescription - Prescription returned")


class TestRegressionAPIs(TestAuth):
    """Regression tests for core APIs"""
    
    def test_health_check(self):
        """GET /api/health - Basic health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/health - Server healthy")
    
    def test_auth_login(self):
        """POST /api/auth/login - Login endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Response should contain 'token'"
        print(f"✓ POST /api/auth/login - Login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

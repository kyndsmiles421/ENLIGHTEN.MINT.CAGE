"""
Test Walkthrough & Tutorial Features + Regression Tests
Tests for iteration 50: Walkthrough overlay, Tutorial page, and key API regression
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRegressionAPIs:
    """Regression tests for key backend APIs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    # Regression: GET /api/cosmic-profile returns valid profile data
    def test_cosmic_profile_returns_valid_data(self):
        """GET /api/cosmic-profile returns valid profile data"""
        response = self.session.get(f"{BASE_URL}/api/cosmic-profile")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Verify key fields exist
        assert "total_forecasts" in data or "system_counts" in data, "Missing cosmic profile data"
        print(f"✓ Cosmic profile returned with keys: {list(data.keys())[:5]}...")
    
    # Regression: GET /api/forecasts/systems returns 6 systems
    def test_forecasts_systems_returns_6(self):
        """GET /api/forecasts/systems returns 6 systems"""
        response = self.session.get(f"{BASE_URL}/api/forecasts/systems")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "systems" in data, "Missing 'systems' key"
        assert len(data["systems"]) == 6, f"Expected 6 systems, got {len(data['systems'])}"
        # Systems can be strings or objects
        print(f"✓ Forecasts systems: {data['systems']}")
    
    # Regression: GET /api/avatar/energy-state returns valid data
    def test_avatar_energy_state_returns_valid(self):
        """GET /api/avatar/energy-state returns valid data"""
        response = self.session.get(f"{BASE_URL}/api/avatar/energy-state")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Check for actual keys in the response
        assert "current_energy" in data or "base_energy" in data or "aura_state" in data, f"Missing energy state data. Keys: {list(data.keys())}"
        print(f"✓ Avatar energy state returned with keys: {list(data.keys())}")
    
    # Regression: GET /api/meditation/constellation-themes returns 12 themes
    def test_meditation_constellation_themes_returns_12(self):
        """GET /api/meditation/constellation-themes returns 12 themes"""
        response = self.session.get(f"{BASE_URL}/api/meditation/constellation-themes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "themes" in data, "Missing 'themes' key"
        assert len(data["themes"]) == 12, f"Expected 12 themes, got {len(data['themes'])}"
        print(f"✓ Constellation themes: {len(data['themes'])} themes returned")
    
    # Additional regression: Health check
    def test_health_check(self):
        """GET /api/health returns ok"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Health check passed")
    
    # Additional regression: Auth login works
    def test_auth_login_works(self):
        """POST /api/auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Missing token in login response"
        assert "user" in data, "Missing user in login response"
        print(f"✓ Auth login successful for user: {data['user'].get('email')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

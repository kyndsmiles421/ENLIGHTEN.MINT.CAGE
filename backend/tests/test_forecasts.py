"""
Test suite for Cosmic Forecasts feature
- GET /api/forecasts/systems - returns 6 systems and 4 periods
- POST /api/forecasts/generate - generates forecasts with caching
- GET /api/forecasts/history - returns user's forecast history
- DELETE /api/forecasts/{id} - deletes a forecast
- Regression tests for existing endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestForecastSystems:
    """Tests for GET /api/forecasts/systems endpoint"""
    
    def test_get_forecast_systems_returns_6_systems(self):
        """Verify 6 divination systems are returned"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems")
        assert response.status_code == 200
        
        data = response.json()
        assert "systems" in data
        systems = data["systems"]
        
        # Verify all 6 systems exist
        expected_systems = ["astrology", "tarot", "numerology", "cardology", "chinese", "mayan"]
        for sys in expected_systems:
            assert sys in systems, f"Missing system: {sys}"
        
        assert len(systems) == 6, f"Expected 6 systems, got {len(systems)}"
        
        # Verify system structure
        for key, sys in systems.items():
            assert "name" in sys
            assert "color" in sys
            assert "icon" in sys
            assert "desc" in sys
    
    def test_get_forecast_systems_returns_4_periods(self):
        """Verify 4 periods are returned"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems")
        assert response.status_code == 200
        
        data = response.json()
        assert "periods" in data
        periods = data["periods"]
        
        expected_periods = ["daily", "weekly", "monthly", "yearly"]
        assert periods == expected_periods, f"Expected {expected_periods}, got {periods}"


class TestForecastGeneration:
    """Tests for POST /api/forecasts/generate endpoint"""
    
    def test_generate_astrology_daily_returns_cached(self, auth_headers):
        """Test that astrology daily forecast returns cached version (fast)"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "astrology", "period": "daily"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        # Verify forecast structure
        assert "id" in data
        assert "system" in data
        assert data["system"] == "astrology"
        assert "period" in data
        assert data["period"] == "daily"
        assert "forecast" in data
        
        # Verify forecast content structure
        forecast = data["forecast"]
        assert "title" in forecast
        assert "summary" in forecast
        assert "sections" in forecast
        assert "affirmation" in forecast
    
    def test_generate_tarot_weekly_creates_new_forecast(self, auth_headers):
        """Test generating a new tarot weekly forecast (may take 10-30 seconds)"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "tarot", "period": "weekly"},
            headers=auth_headers,
            timeout=60  # AI generation can take time
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["system"] == "tarot"
        assert data["period"] == "weekly"
        assert "forecast" in data
        
        forecast = data["forecast"]
        # Verify tarot forecast has required fields
        assert "title" in forecast
        assert "summary" in forecast
        assert "sections" in forecast
        assert "lucky" in forecast
        assert "affirmation" in forecast
    
    def test_generate_numerology_monthly_forecast(self, auth_headers):
        """Test generating a numerology monthly forecast"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "numerology", "period": "monthly"},
            headers=auth_headers,
            timeout=60
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["system"] == "numerology"
        assert data["period"] == "monthly"
        assert "forecast" in data
    
    def test_generate_invalid_system_returns_400(self, auth_headers):
        """Test that invalid system returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "invalid_system", "period": "daily"},
            headers=auth_headers
        )
        assert response.status_code == 400
    
    def test_generate_invalid_period_returns_400(self, auth_headers):
        """Test that invalid period returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "astrology", "period": "invalid_period"},
            headers=auth_headers
        )
        assert response.status_code == 400
    
    def test_generate_requires_authentication(self):
        """Test that forecast generation requires auth"""
        response = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "astrology", "period": "daily"}
        )
        assert response.status_code in [401, 403, 422]
    
    def test_caching_returns_same_forecast(self, auth_headers):
        """Test that second call returns cached forecast (same id)"""
        # First call
        response1 = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "astrology", "period": "daily"},
            headers=auth_headers,
            timeout=30
        )
        assert response1.status_code == 200
        forecast1 = response1.json()
        
        # Second call should return cached version
        response2 = requests.post(
            f"{BASE_URL}/api/forecasts/generate",
            json={"system": "astrology", "period": "daily"},
            headers=auth_headers,
            timeout=30
        )
        assert response2.status_code == 200
        forecast2 = response2.json()
        
        # Same forecast ID means it was cached
        assert forecast1["id"] == forecast2["id"], "Caching not working - different IDs returned"


class TestForecastHistory:
    """Tests for GET /api/forecasts/history endpoint"""
    
    def test_get_forecast_history(self, auth_headers):
        """Test getting user's forecast history"""
        response = requests.get(
            f"{BASE_URL}/api/forecasts/history",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are forecasts, verify structure
        if len(data) > 0:
            forecast = data[0]
            assert "id" in forecast
            assert "system" in forecast
            assert "period" in forecast
            assert "forecast" in forecast
            assert "created_at" in forecast
    
    def test_history_requires_authentication(self):
        """Test that history requires auth"""
        response = requests.get(f"{BASE_URL}/api/forecasts/history")
        assert response.status_code in [401, 403, 422]


class TestForecastDeletion:
    """Tests for DELETE /api/forecasts/{id} endpoint"""
    
    def test_delete_forecast(self, auth_headers):
        """Test deleting a forecast"""
        # First, get history to find a forecast to delete
        history_response = requests.get(
            f"{BASE_URL}/api/forecasts/history",
            headers=auth_headers
        )
        assert history_response.status_code == 200
        history = history_response.json()
        
        if len(history) == 0:
            pytest.skip("No forecasts to delete")
        
        # Delete the first forecast
        forecast_id = history[0]["id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/forecasts/{forecast_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        
        data = delete_response.json()
        assert data.get("deleted") == True
    
    def test_delete_nonexistent_forecast_returns_404(self, auth_headers):
        """Test deleting non-existent forecast returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/forecasts/nonexistent-id-12345",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_delete_requires_authentication(self):
        """Test that delete requires auth"""
        response = requests.delete(f"{BASE_URL}/api/forecasts/some-id")
        assert response.status_code in [401, 403, 422]


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_meditation_history_log_returns_plant_growth(self, auth_headers):
        """Test that meditation history log still returns plant_growth field"""
        response = requests.post(
            f"{BASE_URL}/api/meditation-history/log",
            json={
                "meditation_type": "guided",
                "duration_minutes": 5,
                "meditation_name": "Test Meditation"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # plant_growth field should be present
        assert "plant_growth" in data, "plant_growth field missing from meditation log response"
    
    def test_constellation_themes_returns_12_themes(self, auth_headers):
        """Test that constellation themes endpoint returns 12 themes"""
        response = requests.get(
            f"{BASE_URL}/api/meditation/constellation-themes",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "themes" in data
        themes = data["themes"]
        assert len(themes) == 12, f"Expected 12 constellation themes, got {len(themes)}"
    
    def test_avatar_energy_state_works(self, auth_headers):
        """Test that avatar energy state endpoint works"""
        response = requests.get(
            f"{BASE_URL}/api/avatar/energy-state",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "current_energy" in data
        assert "aura_state" in data
    
    def test_zen_garden_plants_works(self, auth_headers):
        """Test that zen garden plants endpoint works"""
        response = requests.get(
            f"{BASE_URL}/api/zen-garden/plants",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)

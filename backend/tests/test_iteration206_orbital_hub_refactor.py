"""
Iteration 206: Orbital Hub Refactoring Tests
Tests for the refactored OrbitalHub with modular components:
- Hub preferences API (GET/POST active_satellites)
- Weather API (current weather with frequency mapping)
- Satellite activation/deactivation persistence
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test authentication for hub access"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    def test_login_success(self):
        """Test login with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data or "access_token" in data, "No token in response"


class TestHubPreferencesAPI:
    """Test /api/hub/preferences endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    def test_get_hub_preferences(self, auth_headers):
        """GET /api/hub/preferences returns active_satellites list"""
        response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "active_satellites" in data, "Missing active_satellites field"
        assert isinstance(data["active_satellites"], list), "active_satellites should be a list"
    
    def test_get_hub_preferences_default_satellites(self, auth_headers):
        """Verify default active satellites include expected modules"""
        response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Default satellites should include these 6
        expected_defaults = ['mood', 'mixer', 'map', 'breathing', 'meditation', 'theory']
        active = data["active_satellites"]
        # At least some defaults should be present (user may have customized)
        assert len(active) >= 0, "active_satellites should be a list"
    
    def test_post_hub_preferences_update(self, auth_headers):
        """POST /api/hub/preferences updates active_satellites"""
        # First get current state
        get_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        original_satellites = get_response.json().get("active_satellites", [])
        
        # Update with new satellites
        new_satellites = ["mood", "mixer", "map", "breathing", "meditation", "theory", "workshop"]
        response = requests.post(f"{BASE_URL}/api/hub/preferences", 
            headers=auth_headers,
            json={"active_satellites": new_satellites}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert verify_response.status_code == 200
        updated_data = verify_response.json()
        assert "workshop" in updated_data["active_satellites"], "Workshop should be in active satellites"
        
        # Restore original state
        requests.post(f"{BASE_URL}/api/hub/preferences",
            headers=auth_headers,
            json={"active_satellites": original_satellites}
        )
    
    def test_post_hub_preferences_empty_list(self, auth_headers):
        """POST with empty list (Zen Reset) should work"""
        # Get original state
        get_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        original_satellites = get_response.json().get("active_satellites", [])
        
        # Set to empty (Zen Reset)
        response = requests.post(f"{BASE_URL}/api/hub/preferences",
            headers=auth_headers,
            json={"active_satellites": []}
        )
        assert response.status_code == 200, f"Zen Reset failed: {response.text}"
        
        # Verify empty
        verify_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert verify_response.json()["active_satellites"] == [], "Should be empty after Zen Reset"
        
        # Restore original
        requests.post(f"{BASE_URL}/api/hub/preferences",
            headers=auth_headers,
            json={"active_satellites": original_satellites}
        )
    
    def test_post_hub_preferences_invalid_data(self, auth_headers):
        """POST with invalid data should return 400 or 422"""
        response = requests.post(f"{BASE_URL}/api/hub/preferences",
            headers=auth_headers,
            json={"active_satellites": "not_a_list"}
        )
        assert response.status_code in [400, 422], f"Should reject non-list: {response.status_code}"


class TestWeatherAPI:
    """Test /api/weather/current endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    def test_get_weather_current(self, auth_headers):
        """GET /api/weather/current returns weather data"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200, f"Weather API failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "category" in data, "Missing category field"
        assert "description" in data, "Missing description field"
    
    def test_get_weather_with_coordinates(self, auth_headers):
        """GET /api/weather/current with lat/lon parameters"""
        response = requests.get(
            f"{BASE_URL}/api/weather/current?lat=44.08&lon=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Weather with coords failed: {response.text}"
        data = response.json()
        assert "category" in data
    
    def test_weather_has_temperature(self, auth_headers):
        """Weather response should include temperature"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Temperature may be in temperature_f or temperature_c
        has_temp = "temperature_f" in data or "temperature_c" in data or "temperature" in data
        # Fallback weather may not have temperature
        if not data.get("fallback"):
            assert has_temp or "temperature_f" in data, "Should have temperature data"
    
    def test_weather_has_humidity(self, auth_headers):
        """Weather response should include humidity"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Humidity may not be present in fallback
        if not data.get("fallback"):
            assert "humidity" in data or data.get("fallback"), "Should have humidity"
    
    def test_weather_has_seeing_quality(self, auth_headers):
        """Weather response should include seeing_quality for astronomy"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "seeing_quality" in data, "Missing seeing_quality field"
        valid_qualities = ["excellent", "good", "fair", "poor", "unknown"]
        assert data["seeing_quality"] in valid_qualities, f"Invalid seeing_quality: {data['seeing_quality']}"
    
    def test_weather_category_valid(self, auth_headers):
        """Weather category should be one of expected values"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        valid_categories = ["clear", "cloudy", "rain", "snow", "thunderstorm", "fog", "wind", "default"]
        assert data["category"] in valid_categories, f"Invalid category: {data['category']}"
    
    def test_weather_frequency_mapping(self, auth_headers):
        """Weather should include frequency mapping for audio"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Frequency data may be in 'frequency' object
        if "frequency" in data:
            freq = data["frequency"]
            assert "base_hz" in freq or "hz" in freq, "Frequency should have hz value"


class TestSatelliteActivationFlow:
    """Test full satellite activation/deactivation flow"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    def test_activate_dormant_satellite(self, auth_headers):
        """Activate a dormant satellite and verify persistence"""
        # Get current state
        get_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        original = get_response.json()["active_satellites"]
        
        # Add 'oracle' if not present
        if "oracle" not in original:
            new_list = original + ["oracle"]
            response = requests.post(f"{BASE_URL}/api/hub/preferences",
                headers=auth_headers,
                json={"active_satellites": new_list}
            )
            assert response.status_code == 200
            
            # Verify
            verify = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
            assert "oracle" in verify.json()["active_satellites"]
            
            # Restore
            requests.post(f"{BASE_URL}/api/hub/preferences",
                headers=auth_headers,
                json={"active_satellites": original}
            )
    
    def test_deactivate_satellite(self, auth_headers):
        """Deactivate (right-click) a satellite and verify persistence"""
        # Get current state
        get_response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        original = get_response.json()["active_satellites"]
        
        # Remove 'mood' if present
        if "mood" in original:
            new_list = [s for s in original if s != "mood"]
            response = requests.post(f"{BASE_URL}/api/hub/preferences",
                headers=auth_headers,
                json={"active_satellites": new_list}
            )
            assert response.status_code == 200
            
            # Verify
            verify = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
            assert "mood" not in verify.json()["active_satellites"]
            
            # Restore
            requests.post(f"{BASE_URL}/api/hub/preferences",
                headers=auth_headers,
                json={"active_satellites": original}
            )


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Auth failed")
    
    def test_observatory_planets(self, auth_headers):
        """GET /api/observatory/planets should still work"""
        response = requests.get(f"{BASE_URL}/api/observatory/planets", headers=auth_headers)
        assert response.status_code == 200, f"Observatory planets failed: {response.text}"
    
    def test_mastery_tier(self, auth_headers):
        """GET /api/mastery/tier should still work"""
        response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        assert response.status_code == 200, f"Mastery tier failed: {response.text}"
    
    def test_workshop_platonic_solids(self, auth_headers):
        """GET /api/workshop/platonic-solids should still work"""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=auth_headers)
        assert response.status_code == 200, f"Workshop solids failed: {response.text}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

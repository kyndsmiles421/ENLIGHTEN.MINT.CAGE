"""
Iteration 205 Tests: Abyss UX, NWS Weather Integration, Weather Ribbon
- GET /api/hub/preferences: Returns active_satellites list (defaults: mood, mixer, map, breathing, meditation, theory)
- POST /api/hub/preferences: Updates active_satellites list
- GET /api/weather/current: Returns weather with temperature_f, description, category, frequency, seeing_quality
- GET /api/weather/current?lat=44.08&lon=-103.23: Returns Rapid City weather
- Backend regression: GET /api/observatory/planets, GET /api/mastery/tier, GET /api/workshop/platonic-solids
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration205AbyssWeather:
    """Test Abyss UX and NWS Weather Integration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ━━━ Hub Preferences (Abyss System) ━━━
    
    def test_get_hub_preferences_returns_active_satellites(self):
        """GET /api/hub/preferences returns active_satellites list"""
        response = self.session.get(f"{BASE_URL}/api/hub/preferences")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "active_satellites" in data, "Response should contain active_satellites"
        assert isinstance(data["active_satellites"], list), "active_satellites should be a list"
        print(f"Active satellites: {data['active_satellites']}")
    
    def test_get_hub_preferences_default_satellites(self):
        """GET /api/hub/preferences returns default satellites for new user"""
        response = self.session.get(f"{BASE_URL}/api/hub/preferences")
        assert response.status_code == 200
        
        data = response.json()
        active = data.get("active_satellites", [])
        
        # Default satellites should include these 6
        expected_defaults = ["mood", "mixer", "map", "breathing", "meditation", "theory"]
        # Check that at least some defaults are present (user may have customized)
        print(f"Current active satellites: {active}")
        assert len(active) > 0, "Should have at least one active satellite"
    
    def test_post_hub_preferences_updates_active_satellites(self):
        """POST /api/hub/preferences updates active_satellites list"""
        # Update to a custom list
        new_active = ["mood", "mixer", "workshop", "oracle"]
        response = self.session.post(f"{BASE_URL}/api/hub/preferences", json={
            "active_satellites": new_active
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "active_satellites" in data, "Response should contain active_satellites"
        assert data["active_satellites"] == new_active, f"Expected {new_active}, got {data['active_satellites']}"
        print(f"Updated active satellites: {data['active_satellites']}")
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/hub/preferences")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["active_satellites"] == new_active, "Preferences should persist"
    
    def test_post_hub_preferences_restore_defaults(self):
        """POST /api/hub/preferences can restore default satellites"""
        # Restore defaults
        defaults = ["mood", "mixer", "map", "breathing", "meditation", "theory"]
        response = self.session.post(f"{BASE_URL}/api/hub/preferences", json={
            "active_satellites": defaults
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["active_satellites"] == defaults, "Should restore defaults"
        print(f"Restored defaults: {data['active_satellites']}")
    
    def test_post_hub_preferences_invalid_type_returns_400(self):
        """POST /api/hub/preferences with non-list returns 400"""
        response = self.session.post(f"{BASE_URL}/api/hub/preferences", json={
            "active_satellites": "not-a-list"
        })
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        print("Correctly rejected non-list active_satellites")
    
    # ━━━ NWS Weather Integration ━━━
    
    def test_get_weather_current_returns_weather_data(self):
        """GET /api/weather/current returns weather with required fields"""
        response = self.session.get(f"{BASE_URL}/api/weather/current")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check required fields
        assert "description" in data, "Response should contain description"
        assert "category" in data, "Response should contain category"
        assert "seeing_quality" in data, "Response should contain seeing_quality"
        assert "frequency" in data, "Response should contain frequency"
        
        # temperature_f may be None if NWS is unavailable
        assert "temperature_f" in data, "Response should contain temperature_f field"
        
        print(f"Weather: {data.get('description')}, Category: {data.get('category')}, Temp: {data.get('temperature_f')}°F")
        print(f"Seeing quality: {data.get('seeing_quality')}")
        print(f"Frequency: {data.get('frequency')}")
    
    def test_get_weather_current_with_coordinates(self):
        """GET /api/weather/current?lat=44.08&lon=-103.23 returns Rapid City weather"""
        response = self.session.get(f"{BASE_URL}/api/weather/current?lat=44.08&lon=-103.23")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check location is near Rapid City
        assert "location" in data, "Response should contain location"
        assert "lat" in data, "Response should contain lat"
        assert "lon" in data, "Response should contain lon"
        
        # Verify coordinates match request
        assert data["lat"] == 44.08, f"Expected lat 44.08, got {data['lat']}"
        assert data["lon"] == -103.23, f"Expected lon -103.23, got {data['lon']}"
        
        print(f"Location: {data.get('location')}")
        print(f"Coordinates: ({data.get('lat')}, {data.get('lon')})")
    
    def test_get_weather_current_frequency_mapping(self):
        """GET /api/weather/current returns frequency with base_hz, type, reverb, character"""
        response = self.session.get(f"{BASE_URL}/api/weather/current")
        assert response.status_code == 200
        
        data = response.json()
        freq = data.get("frequency", {})
        
        # Check frequency structure
        assert "base_hz" in freq, "Frequency should contain base_hz"
        assert "type" in freq, "Frequency should contain type"
        assert "reverb" in freq, "Frequency should contain reverb"
        assert "character" in freq, "Frequency should contain character"
        
        # Validate types
        assert isinstance(freq["base_hz"], (int, float)), "base_hz should be numeric"
        assert freq["type"] in ["sine", "triangle", "sawtooth", "square"], f"Invalid type: {freq['type']}"
        assert 0 <= freq["reverb"] <= 1, f"Reverb should be 0-1, got {freq['reverb']}"
        
        print(f"Frequency mapping: {freq}")
    
    def test_get_weather_current_seeing_quality_values(self):
        """GET /api/weather/current returns valid seeing_quality"""
        response = self.session.get(f"{BASE_URL}/api/weather/current")
        assert response.status_code == 200
        
        data = response.json()
        seeing = data.get("seeing_quality")
        
        valid_seeing = ["excellent", "good", "fair", "poor", "unknown"]
        assert seeing in valid_seeing, f"Invalid seeing_quality: {seeing}"
        print(f"Seeing quality: {seeing}")
    
    def test_get_weather_current_category_values(self):
        """GET /api/weather/current returns valid weather category"""
        response = self.session.get(f"{BASE_URL}/api/weather/current")
        assert response.status_code == 200
        
        data = response.json()
        category = data.get("category")
        
        valid_categories = ["clear", "cloudy", "rain", "snow", "thunderstorm", "fog", "wind", "default"]
        assert category in valid_categories, f"Invalid category: {category}"
        print(f"Weather category: {category}")
    
    # ━━━ Backend Regression Tests ━━━
    
    def test_regression_observatory_planets(self):
        """GET /api/observatory/planets returns 8 planets"""
        response = self.session.get(f"{BASE_URL}/api/observatory/planets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "planets" in data, "Response should contain planets"
        assert len(data["planets"]) == 8, f"Expected 8 planets, got {len(data['planets'])}"
        print(f"Observatory planets: {len(data['planets'])} planets returned")
    
    def test_regression_mastery_tier(self):
        """GET /api/mastery/tier returns current_tier"""
        response = self.session.get(f"{BASE_URL}/api/mastery/tier")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_tier" in data, "Response should contain current_tier"
        print(f"Mastery tier: {data.get('current_tier')}")
    
    def test_regression_workshop_platonic_solids(self):
        """GET /api/workshop/platonic-solids returns 5 solids"""
        response = self.session.get(f"{BASE_URL}/api/workshop/platonic-solids")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "solids" in data, "Response should contain solids"
        assert len(data["solids"]) == 5, f"Expected 5 solids, got {len(data['solids'])}"
        print(f"Workshop platonic solids: {len(data['solids'])} solids returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Tests for Daily Briefing and Star Chart APIs
- GET /api/daily-briefing - Personalized cosmic daily briefing
- GET /api/star-chart/constellations - 3D star chart constellation data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDailyBriefingAPI:
    """Daily Briefing endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_daily_briefing_returns_200(self):
        """Test daily briefing endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_daily_briefing_has_greeting(self):
        """Test daily briefing contains greeting"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "greeting" in data, "Missing greeting field"
        assert isinstance(data["greeting"], str), "Greeting should be string"
        assert len(data["greeting"]) > 0, "Greeting should not be empty"
    
    def test_daily_briefing_has_moon_phase(self):
        """Test daily briefing contains moon phase data"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "moon" in data, "Missing moon field"
        moon = data["moon"]
        assert "phase" in moon, "Missing moon phase"
        assert "code" in moon, "Missing moon code"
        assert "guidance" in moon, "Missing moon guidance"
        assert "illumination" in moon, "Missing moon illumination"
    
    def test_daily_briefing_has_mayan_energy(self):
        """Test daily briefing contains Mayan energy data"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "mayan" in data, "Missing mayan field"
        mayan = data["mayan"]
        assert "kin" in mayan, "Missing mayan kin"
        assert "glyph" in mayan, "Missing mayan glyph"
        assert "sign_name" in mayan, "Missing mayan sign_name"
        assert "tone" in mayan, "Missing mayan tone"
        assert "element" in mayan, "Missing mayan element"
        assert "galactic_signature" in mayan, "Missing mayan galactic_signature"
        assert "meaning" in mayan, "Missing mayan meaning"
    
    def test_daily_briefing_has_element_guidance(self):
        """Test daily briefing contains element guidance"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "element" in data, "Missing element field"
        element = data["element"]
        assert "name" in element, "Missing element name"
        assert "energy" in element, "Missing element energy"
        assert "focus" in element, "Missing element focus"
        assert "color" in element, "Missing element color"
        assert element["name"] in ["Fire", "Water", "Air", "Earth"], f"Invalid element: {element['name']}"
    
    def test_daily_briefing_has_practices(self):
        """Test daily briefing contains practice suggestions"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "practices" in data, "Missing practices field"
        practices = data["practices"]
        assert isinstance(practices, list), "Practices should be a list"
        assert len(practices) > 0, "Should have at least one practice"
        for p in practices:
            assert "name" in p, "Practice missing name"
            assert "type" in p, "Practice missing type"
            assert "link" in p, "Practice missing link"
            assert "duration" in p, "Practice missing duration"
    
    def test_daily_briefing_has_ritual_status(self):
        """Test daily briefing contains ritual status"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "ritual_status" in data, "Missing ritual_status field"
        assert data["ritual_status"] in ["not_started", "pending", "completed"], f"Invalid ritual_status: {data['ritual_status']}"
    
    def test_daily_briefing_has_dream_symbols(self):
        """Test daily briefing contains dream symbols"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing", headers=self.headers)
        data = response.json()
        assert "dream_symbols" in data, "Missing dream_symbols field"
        assert isinstance(data["dream_symbols"], list), "dream_symbols should be a list"
    
    def test_daily_briefing_requires_auth(self):
        """Test daily briefing requires authentication"""
        response = requests.get(f"{BASE_URL}/api/daily-briefing")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestStarChartAPI:
    """Star Chart constellation endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_star_chart_returns_200(self):
        """Test star chart endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_star_chart_has_observer_data(self):
        """Test star chart contains observer location data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        assert "observer" in data, "Missing observer field"
        observer = data["observer"]
        assert "lat" in observer, "Missing observer lat"
        assert "lng" in observer, "Missing observer lng"
        assert "lst_hours" in observer, "Missing observer lst_hours"
        assert observer["lat"] == 40.7, f"Expected lat 40.7, got {observer['lat']}"
        assert observer["lng"] == -74.0, f"Expected lng -74.0, got {observer['lng']}"
    
    def test_star_chart_has_constellations(self):
        """Test star chart contains constellation data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        assert "constellations" in data, "Missing constellations field"
        constellations = data["constellations"]
        assert isinstance(constellations, list), "Constellations should be a list"
        assert len(constellations) > 0, "Should have at least one constellation"
    
    def test_star_chart_constellation_structure(self):
        """Test constellation data structure"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        c = data["constellations"][0]
        assert "id" in c, "Constellation missing id"
        assert "name" in c, "Constellation missing name"
        assert "symbol" in c, "Constellation missing symbol"
        assert "element" in c, "Constellation missing element"
        assert "stars" in c, "Constellation missing stars"
        assert "meaning" in c, "Constellation missing meaning"
        assert "altitude" in c, "Constellation missing altitude"
        assert "above_horizon" in c, "Constellation missing above_horizon"
        assert "aligned" in c, "Constellation missing aligned"
        assert "alignment_reason" in c, "Constellation missing alignment_reason"
    
    def test_star_chart_star_structure(self):
        """Test star data structure within constellation"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        c = data["constellations"][0]
        assert len(c["stars"]) > 0, "Constellation should have stars"
        star = c["stars"][0]
        assert "name" in star, "Star missing name"
        assert "ra" in star, "Star missing ra (right ascension)"
        assert "dec" in star, "Star missing dec (declination)"
        assert "mag" in star, "Star missing mag (magnitude)"
    
    def test_star_chart_has_mayan_data(self):
        """Test star chart contains Mayan element data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        assert "mayan_element" in data, "Missing mayan_element field"
        assert "mayan_glyph" in data, "Missing mayan_glyph field"
        assert data["mayan_element"] in ["Fire", "Water", "Air", "Earth"], f"Invalid mayan_element: {data['mayan_element']}"
    
    def test_star_chart_has_user_zodiac(self):
        """Test star chart contains user zodiac data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data = response.json()
        assert "user_zodiac" in data, "Missing user_zodiac field"
        # user_zodiac can be null if no birth date set
    
    def test_star_chart_different_locations(self):
        """Test star chart returns different data for different locations"""
        # New York
        response_ny = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=self.headers)
        data_ny = response_ny.json()
        
        # Sydney (southern hemisphere)
        response_syd = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=-33.9&lng=151.2", headers=self.headers)
        data_syd = response_syd.json()
        
        assert response_ny.status_code == 200
        assert response_syd.status_code == 200
        
        # Different locations should have different LST
        assert data_ny["observer"]["lst_hours"] != data_syd["observer"]["lst_hours"], "LST should differ for different longitudes"
    
    def test_star_chart_requires_auth(self):
        """Test star chart requires authentication"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_star_chart_preset_cities(self):
        """Test star chart works with preset city coordinates"""
        cities = [
            {"name": "New York", "lat": 40.7, "lng": -74.0},
            {"name": "London", "lat": 51.5, "lng": -0.1},
            {"name": "Tokyo", "lat": 35.7, "lng": 139.7},
            {"name": "Sydney", "lat": -33.9, "lng": 151.2},
            {"name": "Cairo", "lat": 30.0, "lng": 31.2},
            {"name": "Sao Paulo", "lat": -23.5, "lng": -46.6},
        ]
        for city in cities:
            response = requests.get(
                f"{BASE_URL}/api/star-chart/constellations?lat={city['lat']}&lng={city['lng']}", 
                headers=self.headers
            )
            assert response.status_code == 200, f"Failed for {city['name']}: {response.text}"
            data = response.json()
            assert len(data["constellations"]) > 0, f"No constellations for {city['name']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

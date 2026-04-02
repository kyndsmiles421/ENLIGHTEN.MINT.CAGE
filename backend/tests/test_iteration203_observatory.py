"""
Iteration 203 - Observatory Module Tests
Tests for:
- GET /api/observatory/planets - 8 planets with hz, orbital_speed, distance_au, light_time_minutes
- GET /api/observatory/stars - 10 stars with distance_ly, temp_k, sonified_hz, light_departed_year
- GET /api/observatory/events - upcoming events and current moon phase with illumination
- POST /api/observatory/sonify - planet and star sonification
- Backend regression: GET /api/workshop/platonic-solids, GET /api/mastery/tier
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestObservatoryPlanets:
    """Tests for GET /api/observatory/planets endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_planets_returns_8_planets(self):
        """Verify /api/observatory/planets returns exactly 8 planets"""
        resp = requests.get(f"{BASE_URL}/api/observatory/planets", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "planets" in data
        assert len(data["planets"]) == 8, f"Expected 8 planets, got {len(data['planets'])}"
    
    def test_planets_have_required_fields(self):
        """Verify each planet has hz, orbital_speed_km_s, distance_au, light_time_minutes"""
        resp = requests.get(f"{BASE_URL}/api/observatory/planets", headers=self.headers)
        assert resp.status_code == 200
        planets = resp.json()["planets"]
        
        required_fields = ["name", "hz", "orbital_speed_km_s", "distance_au", "light_time_minutes", "color", "desc"]
        for planet in planets:
            for field in required_fields:
                assert field in planet, f"Planet {planet.get('name', 'unknown')} missing field: {field}"
    
    def test_earth_planet_data(self):
        """Verify Earth has correct frequency (194.2Hz)"""
        resp = requests.get(f"{BASE_URL}/api/observatory/planets", headers=self.headers)
        assert resp.status_code == 200
        planets = resp.json()["planets"]
        
        earth = next((p for p in planets if p["name"].lower() == "earth"), None)
        assert earth is not None, "Earth not found in planets"
        assert earth["hz"] == 194.2, f"Earth hz should be 194.2, got {earth['hz']}"
        assert earth["distance_au"] == 1.0, f"Earth distance_au should be 1.0, got {earth['distance_au']}"
    
    def test_planets_requires_auth(self):
        """Verify /api/observatory/planets requires authentication"""
        resp = requests.get(f"{BASE_URL}/api/observatory/planets")
        assert resp.status_code in [401, 403], f"Expected 401/403 without auth, got {resp.status_code}"


class TestObservatoryStars:
    """Tests for GET /api/observatory/stars endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_stars_returns_10_stars(self):
        """Verify /api/observatory/stars returns exactly 10 stars"""
        resp = requests.get(f"{BASE_URL}/api/observatory/stars", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "stars" in data
        assert len(data["stars"]) == 10, f"Expected 10 stars, got {len(data['stars'])}"
    
    def test_stars_have_required_fields(self):
        """Verify each star has distance_ly, temp_k, sonified_hz, light_departed_year"""
        resp = requests.get(f"{BASE_URL}/api/observatory/stars", headers=self.headers)
        assert resp.status_code == 200
        stars = resp.json()["stars"]
        
        required_fields = ["name", "distance_ly", "temp_k", "sonified_hz", "light_departed_year", "color", "constellation", "magnitude"]
        for star in stars:
            for field in required_fields:
                assert field in star, f"Star {star.get('name', 'unknown')} missing field: {field}"
    
    def test_sirius_star_data(self):
        """Verify Sirius has correct data"""
        resp = requests.get(f"{BASE_URL}/api/observatory/stars", headers=self.headers)
        assert resp.status_code == 200
        stars = resp.json()["stars"]
        
        sirius = next((s for s in stars if s["name"].lower() == "sirius"), None)
        assert sirius is not None, "Sirius not found in stars"
        assert sirius["distance_ly"] == 8.6, f"Sirius distance_ly should be 8.6, got {sirius['distance_ly']}"
        assert sirius["temp_k"] == 9940, f"Sirius temp_k should be 9940, got {sirius['temp_k']}"
        # Sonified hz = 200 + (9940/12100) * 800 ≈ 857.2
        assert sirius["sonified_hz"] > 800, f"Sirius sonified_hz should be > 800, got {sirius['sonified_hz']}"
    
    def test_light_departed_year_calculation(self):
        """Verify light_departed_year is calculated correctly (current_year - distance_ly)"""
        resp = requests.get(f"{BASE_URL}/api/observatory/stars", headers=self.headers)
        assert resp.status_code == 200
        stars = resp.json()["stars"]
        
        from datetime import datetime
        current_year = datetime.now().year
        
        for star in stars:
            expected_year = round(current_year - star["distance_ly"])
            assert star["light_departed_year"] == expected_year, \
                f"{star['name']} light_departed_year should be {expected_year}, got {star['light_departed_year']}"
    
    def test_stars_requires_auth(self):
        """Verify /api/observatory/stars requires authentication"""
        resp = requests.get(f"{BASE_URL}/api/observatory/stars")
        assert resp.status_code in [401, 403], f"Expected 401/403 without auth, got {resp.status_code}"


class TestObservatoryEvents:
    """Tests for GET /api/observatory/events endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_events_returns_events_and_moon(self):
        """Verify /api/observatory/events returns events list and moon phase"""
        resp = requests.get(f"{BASE_URL}/api/observatory/events", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "events" in data, "Response missing 'events' field"
        assert "moon" in data, "Response missing 'moon' field"
        assert "timestamp" in data, "Response missing 'timestamp' field"
    
    def test_moon_phase_has_required_fields(self):
        """Verify moon phase has phase, illumination, age_days"""
        resp = requests.get(f"{BASE_URL}/api/observatory/events", headers=self.headers)
        assert resp.status_code == 200
        moon = resp.json()["moon"]
        
        assert "phase" in moon, "Moon missing 'phase' field"
        assert "illumination" in moon, "Moon missing 'illumination' field"
        assert "age_days" in moon, "Moon missing 'age_days' field"
        
        # Illumination should be 0-100
        assert 0 <= moon["illumination"] <= 100, f"Illumination should be 0-100, got {moon['illumination']}"
        # Age should be 0-29.53 (synodic month)
        assert 0 <= moon["age_days"] <= 30, f"Age should be 0-30, got {moon['age_days']}"
    
    def test_events_have_required_fields(self):
        """Verify each event has name, date, days_until, type, color"""
        resp = requests.get(f"{BASE_URL}/api/observatory/events", headers=self.headers)
        assert resp.status_code == 200
        events = resp.json()["events"]
        
        required_fields = ["name", "date", "days_until", "type", "color", "active"]
        for event in events:
            for field in required_fields:
                assert field in event, f"Event {event.get('name', 'unknown')} missing field: {field}"
    
    def test_events_sorted_by_days_until(self):
        """Verify events are sorted by days_until (ascending)"""
        resp = requests.get(f"{BASE_URL}/api/observatory/events", headers=self.headers)
        assert resp.status_code == 200
        events = resp.json()["events"]
        
        days_list = [e["days_until"] for e in events]
        assert days_list == sorted(days_list), "Events should be sorted by days_until ascending"
    
    def test_events_requires_auth(self):
        """Verify /api/observatory/events requires authentication"""
        resp = requests.get(f"{BASE_URL}/api/observatory/events")
        assert resp.status_code in [401, 403], f"Expected 401/403 without auth, got {resp.status_code}"


class TestObservatorySonify:
    """Tests for POST /api/observatory/sonify endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_sonify_planet_earth(self):
        """Verify POST /api/observatory/sonify with type=planet, name=earth returns 194.2Hz, character=mid"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "planet", "name": "earth"},
                            headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        
        assert data["name"] == "Earth", f"Expected name 'Earth', got {data.get('name')}"
        assert data["frequency_hz"] == 194.2, f"Expected frequency_hz 194.2, got {data.get('frequency_hz')}"
        assert data["character"] == "mid", f"Expected character 'mid', got {data.get('character')}"
        assert "harmonics" in data, "Response missing 'harmonics' field"
        assert "orbital_rhythm_bpm" in data, "Response missing 'orbital_rhythm_bpm' field"
    
    def test_sonify_planet_mercury(self):
        """Verify sonification for Mercury (bright character, hz > 220)"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "planet", "name": "mercury"},
                            headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["name"] == "Mercury"
        assert data["frequency_hz"] == 282.4
        assert data["character"] == "bright", f"Mercury should be 'bright', got {data.get('character')}"
    
    def test_sonify_planet_saturn(self):
        """Verify sonification for Saturn (deep character, hz < 180)"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "planet", "name": "saturn"},
                            headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["name"] == "Saturn"
        assert data["frequency_hz"] == 147.9
        assert data["character"] == "deep", f"Saturn should be 'deep', got {data.get('character')}"
    
    def test_sonify_star_sirius(self):
        """Verify POST /api/observatory/sonify with type=star, name=sirius returns correct sonified frequency"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "star", "name": "sirius"},
                            headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        
        assert data["name"] == "Sirius", f"Expected name 'Sirius', got {data.get('name')}"
        # Sirius temp_k = 9940, sonified_hz = 200 + (9940/12100) * 800 ≈ 857.2
        expected_hz = round(200 + (9940 / 12100) * 800, 1)
        assert data["frequency_hz"] == expected_hz, f"Expected frequency_hz {expected_hz}, got {data.get('frequency_hz')}"
        assert data["character"] == "hot", f"Sirius should be 'hot' (temp > 7000K), got {data.get('character')}"
        assert "harmonics" in data
        assert "temperature_k" in data
        assert data["temperature_k"] == 9940
    
    def test_sonify_star_betelgeuse(self):
        """Verify sonification for Betelgeuse (cool character, temp < 4000K)"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "star", "name": "betelgeuse"},
                            headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["name"] == "Betelgeuse"
        assert data["character"] == "cool", f"Betelgeuse should be 'cool' (temp < 4000K), got {data.get('character')}"
    
    def test_sonify_unknown_planet(self):
        """Verify sonify returns error for unknown planet"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "planet", "name": "pluto"},
                            headers=self.headers)
        assert resp.status_code == 200  # Returns 200 with error in body
        data = resp.json()
        assert "error" in data, "Expected error for unknown planet"
    
    def test_sonify_unknown_star(self):
        """Verify sonify returns error for unknown star"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "star", "name": "unknown_star"},
                            headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "error" in data, "Expected error for unknown star"
    
    def test_sonify_invalid_type(self):
        """Verify sonify returns error for invalid type"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "galaxy", "name": "milky_way"},
                            headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "error" in data, "Expected error for invalid type"
    
    def test_sonify_requires_auth(self):
        """Verify /api/observatory/sonify requires authentication"""
        resp = requests.post(f"{BASE_URL}/api/observatory/sonify", 
                            json={"type": "planet", "name": "earth"})
        assert resp.status_code in [401, 403], f"Expected 401/403 without auth, got {resp.status_code}"


class TestBackendRegression:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_workshop_platonic_solids(self):
        """Verify GET /api/workshop/platonic-solids still works"""
        resp = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "solids" in data, "Response missing 'solids' field"
        assert len(data["solids"]) == 5, f"Expected 5 platonic solids, got {len(data['solids'])}"
    
    def test_mastery_tier(self):
        """Verify GET /api/mastery/tier still works"""
        resp = requests.get(f"{BASE_URL}/api/mastery/tier", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "current_tier" in data, "Response missing 'current_tier' field"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

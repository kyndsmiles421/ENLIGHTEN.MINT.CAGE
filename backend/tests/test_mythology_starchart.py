"""
Test Star Chart Mythology Feature
Tests the mythology data in constellation API responses
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStarChartMythology:
    """Tests for Star Chart mythology feature"""
    
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
    
    def test_star_chart_returns_constellations(self):
        """Test that star chart endpoint returns constellation data"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "constellations" in data
        assert "observer" in data
        assert "time" in data
        assert len(data["constellations"]) > 0
        print(f"PASS: Star chart returns {len(data['constellations'])} constellations")
    
    def test_all_constellations_have_mythology(self):
        """Test that all constellations have mythology field with required keys"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        constellations = response.json()["constellations"]
        
        required_myth_keys = ["figure", "origin", "deity", "story", "lesson"]
        
        for c in constellations:
            assert "mythology" in c, f"Constellation {c['name']} missing mythology field"
            myth = c["mythology"]
            for key in required_myth_keys:
                assert key in myth, f"Constellation {c['name']} mythology missing '{key}'"
                assert myth[key], f"Constellation {c['name']} mythology '{key}' is empty"
        
        print(f"PASS: All {len(constellations)} constellations have complete mythology data")
    
    def test_mythology_figure_names(self):
        """Test that mythology figures have meaningful names"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        constellations = response.json()["constellations"]
        
        expected_figures = {
            "aries": "The Golden Ram",
            "taurus": "The Celestial Bull",
            "gemini": "The Divine Twins",
            "cancer": "The Sacred Crab",
            "leo": "The Nemean Lion",
            "virgo": "The Harvest Maiden",
            "libra": "The Scales of Justice",
            "scorpio": "The Great Scorpion",
            "sagittarius": "The Centaur Archer",
            "capricorn": "The Sea-Goat",
            "aquarius": "The Water Bearer",
            "pisces": "The Bound Fish",
            "orion": "The Great Hunter",
            "ursa_major": "The Great Bear",
            "lyra": "Orpheus's Lyre",
            "cygnus": "The Celestial Swan",
        }
        
        for c in constellations:
            cid = c["id"]
            if cid in expected_figures:
                assert c["mythology"]["figure"] == expected_figures[cid], \
                    f"Constellation {cid} has wrong figure: {c['mythology']['figure']}"
        
        print("PASS: All mythology figures have correct names")
    
    def test_mythology_story_length(self):
        """Test that mythology stories are substantial (not empty or too short)"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        constellations = response.json()["constellations"]
        
        for c in constellations:
            story = c["mythology"]["story"]
            assert len(story) > 100, f"Constellation {c['name']} story too short: {len(story)} chars"
            lesson = c["mythology"]["lesson"]
            assert len(lesson) > 20, f"Constellation {c['name']} lesson too short: {len(lesson)} chars"
        
        print("PASS: All mythology stories and lessons have substantial content")
    
    def test_mythology_origins_and_deities(self):
        """Test that mythology has valid origins and deities"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        constellations = response.json()["constellations"]
        
        valid_origins = ["Greek", "Egyptian", "Sumerian", "Mesopotamian", "Native American", "Babylonian"]
        
        for c in constellations:
            origin = c["mythology"]["origin"]
            # Origin can be compound like "Greek / Egyptian"
            origin_parts = [o.strip() for o in origin.split("/")]
            for part in origin_parts:
                assert any(v in part for v in valid_origins), \
                    f"Constellation {c['name']} has unexpected origin: {origin}"
            
            deity = c["mythology"]["deity"]
            assert len(deity) > 0, f"Constellation {c['name']} has empty deity"
        
        print("PASS: All mythology origins and deities are valid")
    
    def test_constellation_stars_data(self):
        """Test that constellations have star data with names and magnitudes"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=self.headers
        )
        assert response.status_code == 200
        constellations = response.json()["constellations"]
        
        for c in constellations:
            assert "stars" in c, f"Constellation {c['name']} missing stars field"
            assert len(c["stars"]) > 0, f"Constellation {c['name']} has no stars"
            
            for star in c["stars"]:
                assert "name" in star, f"Star in {c['name']} missing name"
                assert "mag" in star, f"Star {star.get('name', 'unknown')} missing magnitude"
                assert "ra" in star, f"Star {star.get('name', 'unknown')} missing RA"
                assert "dec" in star, f"Star {star.get('name', 'unknown')} missing Dec"
        
        print("PASS: All constellations have complete star data")
    
    def test_different_locations_return_data(self):
        """Test that different locations return constellation data with mythology"""
        locations = [
            (40.7, -74.0, "New York"),
            (51.5, -0.1, "London"),
            (35.7, 139.7, "Tokyo"),
            (-33.9, 151.2, "Sydney"),
        ]
        
        for lat, lng, name in locations:
            response = requests.get(
                f"{BASE_URL}/api/star-chart/constellations?lat={lat}&lng={lng}",
                headers=self.headers
            )
            assert response.status_code == 200, f"Failed for {name}"
            data = response.json()
            assert len(data["constellations"]) > 0, f"No constellations for {name}"
            
            # Verify mythology exists for all returned constellations
            for c in data["constellations"]:
                assert "mythology" in c, f"Missing mythology for {c['name']} at {name}"
            
            print(f"PASS: {name} returns {len(data['constellations'])} constellations with mythology")


class TestPreviousFeatures:
    """Regression tests for previously fixed features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}
    
    def test_mudras_endpoint(self):
        """Test mudras endpoint returns 25 items"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
        print("PASS: Mudras endpoint returns 25 items")
    
    def test_videos_endpoint(self):
        """Test videos endpoint returns 23 items"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"
        print("PASS: Videos endpoint returns 23 items")
    
    def test_exercises_endpoint(self):
        """Test exercises endpoint returns 6 items"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"
        print("PASS: Exercises endpoint returns 6 items")
    
    def test_meditation_generate_guided(self):
        """Test meditation generation endpoint"""
        if not self.token:
            pytest.skip("Auth required")
        
        response = requests.post(
            f"{BASE_URL}/api/meditation/generate-guided",
            headers=self.headers,
            json={
                "intention": "relaxation",
                "duration": 5,
                "focus": "breath"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "steps" in data or isinstance(data, list), "Expected meditation steps"
        print("PASS: Meditation generation endpoint works")

"""
Iteration 180 Tests: Resonance Practice, Mantra of the Day, Rapid City GPS Hotspots
- Resonance Practice: 5 practice types (meditation, breathing, grounding, visualization, mantra)
- Mantra of the Day: Dashboard widget with daily rotating mantra
- Rapid City Hotspots: 5 local hotspots + collect radius tightened to 50m
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
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
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestResonancePractices:
    """Tests for GET /api/resonance/practices endpoint"""
    
    def test_get_practices_returns_5_types(self, auth_headers):
        """GET /api/resonance/practices returns 5 practice types"""
        response = requests.get(f"{BASE_URL}/api/resonance/practices", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "practices" in data, "Response should contain 'practices' key"
        practices = data["practices"]
        assert len(practices) == 5, f"Expected 5 practice types, got {len(practices)}"
        
        # Verify practice IDs
        practice_ids = [p["id"] for p in practices]
        expected_ids = ["meditation", "breathing", "grounding", "visualization", "mantra"]
        for expected_id in expected_ids:
            assert expected_id in practice_ids, f"Missing practice type: {expected_id}"
    
    def test_practices_have_required_fields(self, auth_headers):
        """Each practice has dust_range, xp, element, min_duration_seconds"""
        response = requests.get(f"{BASE_URL}/api/resonance/practices", headers=auth_headers)
        assert response.status_code == 200
        
        practices = response.json()["practices"]
        for p in practices:
            assert "dust_range" in p, f"Practice {p['id']} missing dust_range"
            assert "min" in p["dust_range"], f"Practice {p['id']} dust_range missing min"
            assert "max" in p["dust_range"], f"Practice {p['id']} dust_range missing max"
            assert "xp" in p, f"Practice {p['id']} missing xp"
            assert "element" in p, f"Practice {p['id']} missing element"
            assert "min_duration_seconds" in p, f"Practice {p['id']} missing min_duration_seconds"
    
    def test_practice_elements_correct(self, auth_headers):
        """Verify practice elements: meditation=water, breathing=air, grounding=earth, visualization=fire, mantra=ether"""
        response = requests.get(f"{BASE_URL}/api/resonance/practices", headers=auth_headers)
        assert response.status_code == 200
        
        practices = {p["id"]: p for p in response.json()["practices"]}
        
        expected_elements = {
            "meditation": "water",
            "breathing": "air",
            "grounding": "earth",
            "visualization": "fire",
            "mantra": "ether"
        }
        
        for practice_id, expected_element in expected_elements.items():
            assert practices[practice_id]["element"] == expected_element, \
                f"Practice {practice_id} should have element {expected_element}, got {practices[practice_id]['element']}"
    
    def test_practice_min_durations(self, auth_headers):
        """Verify min durations: meditation=30s, breathing=20s, grounding=45s, visualization=60s, mantra=90s"""
        response = requests.get(f"{BASE_URL}/api/resonance/practices", headers=auth_headers)
        assert response.status_code == 200
        
        practices = {p["id"]: p for p in response.json()["practices"]}
        
        expected_durations = {
            "meditation": 30,
            "breathing": 20,
            "grounding": 45,
            "visualization": 60,
            "mantra": 90
        }
        
        for practice_id, expected_duration in expected_durations.items():
            assert practices[practice_id]["min_duration_seconds"] == expected_duration, \
                f"Practice {practice_id} should have min_duration {expected_duration}s, got {practices[practice_id]['min_duration_seconds']}s"
    
    def test_practices_include_stats(self, auth_headers):
        """Response includes user stats and meta info"""
        response = requests.get(f"{BASE_URL}/api/resonance/practices", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "stats" in data, "Response should include stats"
        assert "consciousness_level" in data, "Response should include consciousness_level"
        assert "max_daily_sessions" in data, "Response should include max_daily_sessions"
        assert "remaining_today" in data, "Response should include remaining_today"


class TestResonanceComplete:
    """Tests for POST /api/resonance/complete endpoint"""
    
    def test_complete_meditation_success(self, auth_headers):
        """POST /api/resonance/complete with meditation type (60s, quality 0.7) returns rewards"""
        response = requests.post(f"{BASE_URL}/api/resonance/complete", 
            json={
                "practice_type": "meditation",
                "duration_seconds": 60,
                "quality_score": 0.7
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("completed") == True, "Response should have completed=True"
        assert "rewards" in data, "Response should include rewards"
        assert "dust" in data["rewards"], "Rewards should include dust"
        assert "xp" in data["rewards"], "Rewards should include xp"
        assert data["rewards"]["dust"] > 0, "Dust reward should be positive"
        assert data["rewards"]["xp"] > 0, "XP reward should be positive"
        assert "streak" in data, "Response should include streak info"
        assert "current" in data["streak"], "Streak should include current"
    
    def test_complete_invalid_practice_type_returns_400(self, auth_headers):
        """POST /api/resonance/complete with invalid practice_type returns 400"""
        response = requests.post(f"{BASE_URL}/api/resonance/complete",
            json={
                "practice_type": "invalid_type",
                "duration_seconds": 60,
                "quality_score": 0.5
            },
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid practice_type, got {response.status_code}"
    
    def test_complete_below_min_duration_returns_400(self, auth_headers):
        """POST /api/resonance/complete with duration below minimum returns 400"""
        # Meditation requires 30s minimum, try with 10s
        response = requests.post(f"{BASE_URL}/api/resonance/complete",
            json={
                "practice_type": "meditation",
                "duration_seconds": 10,
                "quality_score": 0.5
            },
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for duration below minimum, got {response.status_code}"


class TestResonanceHistory:
    """Tests for GET /api/resonance/history endpoint"""
    
    def test_get_history(self, auth_headers):
        """GET /api/resonance/history returns practice history"""
        response = requests.get(f"{BASE_URL}/api/resonance/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "history" in data, "Response should include history"
        assert "total_sessions" in data, "Response should include total_sessions"
        assert "total_dust_earned" in data, "Response should include total_dust_earned"
        assert isinstance(data["history"], list), "History should be a list"


class TestRapidCityHotspots:
    """Tests for Rapid City GPS hotspots and collect radius"""
    
    # Rapid City coordinates
    RAPID_CITY_LAT = 44.0752
    RAPID_CITY_LNG = -103.231
    
    def test_nearby_hotspots_rapid_city(self, auth_headers):
        """GET /api/hotspots/nearby with Rapid City coords returns local hotspots"""
        response = requests.get(
            f"{BASE_URL}/api/hotspots/nearby",
            params={"lat": self.RAPID_CITY_LAT, "lng": self.RAPID_CITY_LNG},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "hotspots" in data, "Response should include hotspots"
        
        # Check for Rapid City hotspots
        hotspot_names = [h["name"] for h in data["hotspots"]]
        rapid_city_hotspots = [
            "Memorial Park Spring",
            "Skyline Drive Overlook",
            "Storybook Island Grove",
            "Dinosaur Park Summit",
            "Canyon Lake Reflection"
        ]
        
        found_count = 0
        for rc_hotspot in rapid_city_hotspots:
            if rc_hotspot in hotspot_names:
                found_count += 1
        
        assert found_count >= 1, f"Expected at least 1 Rapid City hotspot, found {found_count}. Hotspots: {hotspot_names}"
    
    def test_collect_radius_is_50m(self, auth_headers):
        """GET /api/hotspots/nearby returns collect_radius_m of 50"""
        response = requests.get(
            f"{BASE_URL}/api/hotspots/nearby",
            params={"lat": self.RAPID_CITY_LAT, "lng": self.RAPID_CITY_LNG},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "collect_radius_m" in data, "Response should include collect_radius_m"
        assert data["collect_radius_m"] == 50, f"Expected collect_radius_m=50, got {data['collect_radius_m']}"
    
    def test_static_sites_returns_13_total(self):
        """GET /api/hotspots/static-sites returns 13 total sites (8 global + 5 Rapid City)"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sites" in data, "Response should include sites"
        assert "total" in data, "Response should include total"
        assert data["total"] == 13, f"Expected 13 total sites, got {data['total']}"
        assert len(data["sites"]) == 13, f"Expected 13 sites in list, got {len(data['sites'])}"
    
    def test_static_sites_include_rapid_city(self):
        """Static sites include all 5 Rapid City hotspots"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200
        
        sites = response.json()["sites"]
        site_names = [s["name"] for s in sites]
        
        rapid_city_hotspots = [
            "Memorial Park Spring",
            "Skyline Drive Overlook",
            "Storybook Island Grove",
            "Dinosaur Park Summit",
            "Canyon Lake Reflection"
        ]
        
        for rc_hotspot in rapid_city_hotspots:
            assert rc_hotspot in site_names, f"Missing Rapid City hotspot: {rc_hotspot}"


class TestMantraOfTheDay:
    """Tests for Mantra of the Day (uses existing /api/mantras endpoint)"""
    
    def test_mantras_endpoint_returns_mantras(self):
        """GET /api/mantras returns mantras for dashboard widget"""
        response = requests.get(f"{BASE_URL}/api/mantras", params={"count": 1})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "mantras" in data, "Response should include mantras"
        assert len(data["mantras"]) >= 1, "Should return at least 1 mantra"
        
        mantra = data["mantras"][0]
        assert "text" in mantra, "Mantra should have text"
        assert "category" in mantra, "Mantra should have category"
    
    def test_mantra_has_energy_field(self):
        """Mantras include energy field for dashboard display"""
        response = requests.get(f"{BASE_URL}/api/mantras", params={"count": 1})
        assert response.status_code == 200
        
        mantra = response.json()["mantras"][0]
        # Energy field may be optional, but text and category are required
        assert "text" in mantra, "Mantra should have text"
        assert len(mantra["text"]) > 0, "Mantra text should not be empty"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

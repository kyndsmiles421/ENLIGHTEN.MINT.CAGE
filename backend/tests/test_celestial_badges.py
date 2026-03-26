"""
Test Celestial Badges Feature
- GET /api/badges/celestial returns 12 badges with progress, earned status, stats
- Badges auto-award when criteria met
- Progress tracking for constellations explored, stories listened, journeys completed
- Element badges show correct element constellation counts
- Regression tests for award-xp and mudras endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

class TestCelestialBadges:
    """Celestial Badges endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_get_celestial_badges_returns_12_badges(self):
        """GET /api/badges/celestial returns exactly 12 badges"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "badges" in data, "Response should contain 'badges' array"
        assert len(data["badges"]) == 12, f"Expected 12 badges, got {len(data['badges'])}"
        
        # Verify badge IDs match expected
        expected_ids = [
            "first_light", "stargazer", "constellation_collector",
            "story_seeker", "myth_keeper", "orions_hunter",
            "neptunes_child", "gaias_guardian", "zephyrs_voice",
            "lyras_musician", "cosmic_voyager", "celestial_master"
        ]
        actual_ids = [b["id"] for b in data["badges"]]
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing badge: {expected_id}"
    
    def test_badges_have_required_fields(self):
        """Each badge has required fields: id, name, icon, element, description, earned, progress, target"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "icon", "element", "description", "earned", "progress", "target"]
        
        for badge in data["badges"]:
            for field in required_fields:
                assert field in badge, f"Badge {badge.get('id', 'unknown')} missing field: {field}"
            
            # Verify types
            assert isinstance(badge["earned"], bool), f"Badge {badge['id']} 'earned' should be boolean"
            assert isinstance(badge["progress"], int), f"Badge {badge['id']} 'progress' should be int"
            assert isinstance(badge["target"], int), f"Badge {badge['id']} 'target' should be int"
    
    def test_badges_response_has_stats(self):
        """Response includes stats: constellations_explored, stories_listened, journeys_completed"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "stats" in data, "Response should contain 'stats'"
        stats = data["stats"]
        
        assert "constellations_explored" in stats, "Stats should have constellations_explored"
        assert "stories_listened" in stats, "Stats should have stories_listened"
        assert "journeys_completed" in stats, "Stats should have journeys_completed"
        
        # All should be integers >= 0
        assert isinstance(stats["constellations_explored"], int)
        assert isinstance(stats["stories_listened"], int)
        assert isinstance(stats["journeys_completed"], int)
    
    def test_badges_response_has_totals(self):
        """Response includes total_earned and total_badges"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_earned" in data, "Response should have total_earned"
        assert "total_badges" in data, "Response should have total_badges"
        assert data["total_badges"] == 12, f"total_badges should be 12, got {data['total_badges']}"
        
        # total_earned should match count of earned badges
        earned_count = sum(1 for b in data["badges"] if b["earned"])
        assert data["total_earned"] == earned_count, f"total_earned mismatch: {data['total_earned']} vs {earned_count}"
    
    def test_first_light_badge_progress(self):
        """First Light badge (1 constellation explored) shows correct progress"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        first_light = next((b for b in data["badges"] if b["id"] == "first_light"), None)
        assert first_light is not None, "first_light badge not found"
        
        assert first_light["target"] == 1, f"first_light target should be 1, got {first_light['target']}"
        assert first_light["progress"] == data["stats"]["constellations_explored"] or first_light["progress"] == 1, \
            "first_light progress should match constellations_explored (capped at target)"
    
    def test_stargazer_badge_progress(self):
        """Stargazer badge (5 constellations explored) shows correct progress"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        stargazer = next((b for b in data["badges"] if b["id"] == "stargazer"), None)
        assert stargazer is not None, "stargazer badge not found"
        
        assert stargazer["target"] == 5, f"stargazer target should be 5, got {stargazer['target']}"
        # Progress should be min(explored, target)
        expected_progress = min(data["stats"]["constellations_explored"], 5)
        assert stargazer["progress"] == expected_progress, \
            f"stargazer progress should be {expected_progress}, got {stargazer['progress']}"
    
    def test_cosmic_voyager_badge_progress(self):
        """Cosmic Voyager badge (1 journey completed) shows correct progress"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        cosmic_voyager = next((b for b in data["badges"] if b["id"] == "cosmic_voyager"), None)
        assert cosmic_voyager is not None, "cosmic_voyager badge not found"
        
        assert cosmic_voyager["target"] == 1, f"cosmic_voyager target should be 1, got {cosmic_voyager['target']}"
        # Progress should match journeys_completed (capped at target)
        expected_progress = min(data["stats"]["journeys_completed"], 1)
        assert cosmic_voyager["progress"] == expected_progress, \
            f"cosmic_voyager progress should be {expected_progress}, got {cosmic_voyager['progress']}"
    
    def test_element_badges_have_correct_targets(self):
        """Element badges (Fire, Water, Earth, Air) have target of 4 constellations each"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        element_badges = {
            "orions_hunter": "Fire",
            "neptunes_child": "Water",
            "gaias_guardian": "Earth",
            "zephyrs_voice": "Air"
        }
        
        for badge_id, element in element_badges.items():
            badge = next((b for b in data["badges"] if b["id"] == badge_id), None)
            assert badge is not None, f"{badge_id} badge not found"
            assert badge["element"] == element, f"{badge_id} should have element {element}, got {badge['element']}"
            assert badge["target"] == 4, f"{badge_id} target should be 4, got {badge['target']}"
    
    def test_badges_require_authentication(self):
        """GET /api/badges/celestial requires authentication"""
        # Create new session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.get(f"{BASE_URL}/api/badges/celestial")
        
        # Should return 401 or 403
        assert response.status_code in [401, 403], \
            f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_newly_earned_array_in_response(self):
        """Response includes newly_earned array (may be empty)"""
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "newly_earned" in data, "Response should have newly_earned array"
        assert isinstance(data["newly_earned"], list), "newly_earned should be a list"


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_award_xp_endpoint_works(self):
        """POST /api/star-chart/award-xp still works"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/award-xp", json={
            "action": "constellation_explored",
            "constellation_name": "TEST_Regression_Constellation"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data, "Response should have status"
        assert data["status"] in ["awarded", "already_awarded"], f"Unexpected status: {data['status']}"
    
    def test_mudras_returns_25_items(self):
        """GET /api/mudras returns 25 items"""
        response = self.session.get(f"{BASE_URL}/api/mudras")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"


class TestBadgeAutoAward:
    """Test that badges auto-award when criteria are met"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_first_light_earned_if_explored(self):
        """First Light badge should be earned if user has explored at least 1 constellation"""
        # First, award XP for exploring a constellation (this creates the completion record)
        self.session.post(f"{BASE_URL}/api/star-chart/award-xp", json={
            "action": "constellation_explored",
            "constellation_name": "Aries"
        })
        
        # Now check badges
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        first_light = next((b for b in data["badges"] if b["id"] == "first_light"), None)
        assert first_light is not None
        
        # If stats show at least 1 explored, badge should be earned
        if data["stats"]["constellations_explored"] >= 1:
            assert first_light["earned"] == True, \
                f"first_light should be earned with {data['stats']['constellations_explored']} explored"
    
    def test_cosmic_voyager_earned_if_journey_completed(self):
        """Cosmic Voyager badge should be earned if user has completed at least 1 journey"""
        # Award XP for completing a journey
        self.session.post(f"{BASE_URL}/api/star-chart/award-xp", json={
            "action": "journey_completed",
            "constellation_name": "Journey1"
        })
        
        # Now check badges
        response = self.session.get(f"{BASE_URL}/api/badges/celestial")
        
        assert response.status_code == 200
        data = response.json()
        
        cosmic_voyager = next((b for b in data["badges"] if b["id"] == "cosmic_voyager"), None)
        assert cosmic_voyager is not None
        
        # If stats show at least 1 journey, badge should be earned
        if data["stats"]["journeys_completed"] >= 1:
            assert cosmic_voyager["earned"] == True, \
                f"cosmic_voyager should be earned with {data['stats']['journeys_completed']} journeys"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

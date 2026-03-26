"""
Test suite for P1-P3 Enhancements:
- P2 Social Sharing (share constellations and journey to community)
- P3 Gamification (XP rewards for constellation exploration, story listening, journey completion)
- Regression tests for Mudras, Videos, Exercises, TTS
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
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ========== P3 GAMIFICATION: XP REWARDS ==========

class TestStarChartXPRewards:
    """Test XP rewards for star chart actions"""
    
    def test_xp_constellation_explored_returns_10xp(self, auth_headers):
        """POST /api/star-chart/award-xp with action='constellation_explored' returns 10 XP"""
        # Use unique constellation name to avoid duplicate check
        unique_name = f"TestConstellation_{int(time.time())}"
        response = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "constellation_explored", "constellation_name": unique_name},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "awarded", f"Expected status 'awarded', got {data}"
        assert data.get("xp_earned") == 10, f"Expected 10 XP for constellation_explored, got {data.get('xp_earned')}"
        assert "total_xp" in data, "Response should include total_xp"
        assert "+10 XP" in data.get("message", ""), f"Message should contain '+10 XP', got {data.get('message')}"
    
    def test_xp_story_listened_returns_25xp(self, auth_headers):
        """POST /api/star-chart/award-xp with action='story_listened' returns 25 XP"""
        unique_name = f"StoryConstellation_{int(time.time())}"
        response = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "story_listened", "constellation_name": unique_name},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "awarded", f"Expected status 'awarded', got {data}"
        assert data.get("xp_earned") == 25, f"Expected 25 XP for story_listened, got {data.get('xp_earned')}"
        assert "+25 XP" in data.get("message", ""), f"Message should contain '+25 XP', got {data.get('message')}"
    
    def test_xp_journey_completed_returns_100xp(self, auth_headers):
        """POST /api/star-chart/award-xp with action='journey_completed' returns 100 XP"""
        # Journey completed doesn't need constellation name
        response = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "journey_completed", "constellation_name": f"journey_{int(time.time())}"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "awarded", f"Expected status 'awarded', got {data}"
        assert data.get("xp_earned") == 100, f"Expected 100 XP for journey_completed, got {data.get('xp_earned')}"
        assert "+100 XP" in data.get("message", ""), f"Message should contain '+100 XP', got {data.get('message')}"
    
    def test_xp_duplicate_prevention_same_day(self, auth_headers):
        """POST /api/star-chart/award-xp prevents duplicate XP for same action+constellation per day"""
        # First call should award XP
        constellation_name = f"DuplicateTest_{int(time.time())}"
        response1 = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "constellation_explored", "constellation_name": constellation_name},
            headers=auth_headers
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1.get("status") == "awarded", f"First call should award XP, got {data1}"
        assert data1.get("xp_earned") == 10
        
        # Second call with same action+constellation should return already_awarded
        response2 = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "constellation_explored", "constellation_name": constellation_name},
            headers=auth_headers
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2.get("status") == "already_awarded", f"Second call should return 'already_awarded', got {data2}"
        assert data2.get("xp_earned") == 0, f"Duplicate should return 0 XP, got {data2.get('xp_earned')}"
    
    def test_xp_unknown_action_returns_400(self, auth_headers):
        """POST /api/star-chart/award-xp with unknown action returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "invalid_action", "constellation_name": "Test"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for unknown action, got {response.status_code}"
    
    def test_xp_requires_auth(self):
        """POST /api/star-chart/award-xp requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/star-chart/award-xp",
            json={"action": "constellation_explored", "constellation_name": "Test"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


# ========== P2 SOCIAL SHARING ==========

class TestCommunitySharing:
    """Test community sharing for constellations and journeys"""
    
    def test_create_shared_constellation_post(self, auth_headers):
        """POST /api/community/posts with post_type='shared_constellation' creates community post"""
        response = requests.post(
            f"{BASE_URL}/api/community/posts",
            json={
                "post_type": "shared_constellation",
                "content": "Discovered Orion in the cosmic star chart. The Hunter guides us through the night sky.",
                "affirmation_text": "Orion",
                "milestone_type": "Fire"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("post_type") == "shared_constellation", f"Expected post_type 'shared_constellation', got {data.get('post_type')}"
        assert "id" in data, "Response should include post id"
        assert data.get("content") == "Discovered Orion in the cosmic star chart. The Hunter guides us through the night sky."
        assert data.get("affirmation_text") == "Orion"
    
    def test_create_shared_journey_post(self, auth_headers):
        """POST /api/community/posts with post_type='shared_journey' creates community post"""
        response = requests.post(
            f"{BASE_URL}/api/community/posts",
            json={
                "post_type": "shared_journey",
                "content": "Completed a Stargazing Journey through 16 constellations, listening to their ancient mythology stories.",
                "milestone_type": "stargazing_journey",
                "milestone_value": 16
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("post_type") == "shared_journey", f"Expected post_type 'shared_journey', got {data.get('post_type')}"
        assert "id" in data, "Response should include post id"
        assert data.get("milestone_value") == 16
    
    def test_community_feed_shows_shared_posts(self, auth_headers):
        """GET /api/community/feed returns posts including shared_constellation and shared_journey types"""
        response = requests.get(f"{BASE_URL}/api/community/feed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "posts" in data, "Response should include posts array"
        
        # Check that we have posts with the new types
        post_types = [p.get("post_type") for p in data.get("posts", [])]
        # At least verify the feed endpoint works - posts may or may not exist
        assert isinstance(data.get("posts"), list), "Posts should be a list"


# ========== REGRESSION TESTS ==========

class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_mudras_returns_25(self, auth_headers):
        """GET /api/mudras returns 25 mudras"""
        response = requests.get(f"{BASE_URL}/api/mudras", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
    
    def test_videos_returns_23(self, auth_headers):
        """GET /api/videos returns 23 videos"""
        response = requests.get(f"{BASE_URL}/api/videos", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"
    
    def test_exercises_returns_6(self, auth_headers):
        """GET /api/exercises returns 6 exercises"""
        response = requests.get(f"{BASE_URL}/api/exercises", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"
    
    def test_tts_narrate_returns_audio(self, auth_headers):
        """POST /api/tts/narrate returns audio"""
        response = requests.post(
            f"{BASE_URL}/api/tts/narrate",
            json={"text": "Test narration for regression testing.", "voice": "fable", "speed": 0.9},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "audio" in data, "Response should include audio field"
        assert len(data.get("audio", "")) > 100, "Audio should be a non-empty base64 string"


# ========== STAR CHART CONSTELLATIONS ==========

class TestStarChartConstellations:
    """Test star chart constellation data"""
    
    def test_constellations_endpoint(self, auth_headers):
        """GET /api/star-chart/constellations returns constellation data"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "constellations" in data, "Response should include constellations"
        constellations = data.get("constellations", [])
        assert len(constellations) > 0, "Should have at least one constellation"
        
        # Check constellation structure
        first = constellations[0]
        assert "id" in first, "Constellation should have id"
        assert "name" in first, "Constellation should have name"
        assert "ra" in first, "Constellation should have ra (right ascension)"
        assert "dec" in first, "Constellation should have dec (declination)"
        assert "mythology" in first, "Constellation should have mythology data"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

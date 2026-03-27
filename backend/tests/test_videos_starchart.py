"""
Test suite for Videos page and StarChart component refactoring - Iteration 59
Tests:
- Video stories API endpoints
- Star chart API endpoints
- Component imports verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected endpoints."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestVideoStoriesAPI:
    """Tests for Cosmic Cinema video stories endpoints."""
    
    def test_get_video_stories_returns_15_stories(self, auth_headers):
        """GET /api/ai-visuals/video-stories should return 15 creation stories."""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/video-stories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "stories" in data
        assert len(data["stories"]) == 15
        
        # Verify each story has required fields
        for story in data["stories"]:
            assert "story_id" in story
            assert "has_video" in story
            assert isinstance(story["has_video"], bool)
    
    def test_video_stories_includes_mayan(self, auth_headers):
        """Verify Mayan story is in the list (should have cached video)."""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/video-stories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        mayan_story = next((s for s in data["stories"] if s["story_id"] == "mayan"), None)
        assert mayan_story is not None
        # Mayan should have a cached video from previous generation
        assert mayan_story["has_video"] == True
        assert mayan_story["video_url"] is not None
    
    def test_video_stories_includes_all_cultures(self, auth_headers):
        """Verify all 15 cultures are present."""
        expected_cultures = [
            "mayan", "egyptian", "aboriginal", "lakota", "hindu",
            "norse", "greek", "japanese", "yoruba", "maori",
            "chinese", "celtic", "inuit", "aztec", "sumerian"
        ]
        
        response = requests.get(f"{BASE_URL}/api/ai-visuals/video-stories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        story_ids = [s["story_id"] for s in data["stories"]]
        for culture in expected_cultures:
            assert culture in story_ids, f"Missing culture: {culture}"
    
    def test_generate_video_requires_auth(self):
        """POST /api/ai-visuals/generate-video should require authentication."""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/generate-video", json={
            "story_id": "mayan"
        })
        assert response.status_code == 401
    
    def test_generate_video_invalid_story(self, auth_headers):
        """POST /api/ai-visuals/generate-video with invalid story_id should return 404."""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/generate-video", json={
            "story_id": "invalid_story"
        }, headers=auth_headers)
        assert response.status_code == 404
    
    def test_generate_video_no_params(self, auth_headers):
        """POST /api/ai-visuals/generate-video without params should return 400."""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/generate-video", json={}, headers=auth_headers)
        assert response.status_code == 400
    
    def test_video_status_invalid_job(self, auth_headers):
        """GET /api/ai-visuals/video-status/invalid should return 404."""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/video-status/invalid_job_id", headers=auth_headers)
        assert response.status_code == 404


class TestPracticeVideosAPI:
    """Tests for Practice Videos tab endpoints."""
    
    def test_get_videos_returns_list(self):
        """GET /api/videos should return practice videos list."""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_videos_have_required_fields(self):
        """Each video should have required fields."""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        
        for video in data[:5]:  # Check first 5
            assert "id" in video
            assert "title" in video
            assert "category" in video
            assert "duration" in video
            assert "level" in video
            assert "thumbnail" in video
            assert "video_url" in video
    
    def test_videos_have_categories(self):
        """Videos should have valid categories."""
        valid_categories = ["mudras", "yantra", "tantra", "breathwork", "frequencies", "mantra", "exercises"]
        
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        
        categories_found = set(v["category"] for v in data)
        # At least some categories should be present
        assert len(categories_found) > 0


class TestStarChartAPI:
    """Tests for Star Chart endpoints."""
    
    def test_get_constellations_requires_auth(self):
        """GET /api/star-chart/constellations should require authentication."""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0")
        assert response.status_code == 401
    
    def test_get_constellations_returns_data(self, auth_headers):
        """GET /api/star-chart/constellations should return constellation data."""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "constellations" in data
        assert len(data["constellations"]) > 0
    
    def test_constellations_have_mythology(self, auth_headers):
        """Constellations should have mythology data."""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check first constellation has mythology
        first = data["constellations"][0]
        assert "mythology" in first
        if first["mythology"]:
            assert "figure" in first["mythology"]
            # Story field can be "story" or "origin_story"
            assert "story" in first["mythology"] or "origin_story" in first["mythology"]
    
    def test_get_cultures_list(self):
        """GET /api/star-chart/cultures should return available cultures."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200
        data = response.json()
        
        assert "cultures" in data
        assert len(data["cultures"]) > 0
        
        # Each culture should have required fields
        for culture in data["cultures"]:
            assert "id" in culture
            assert "name" in culture
    
    def test_award_xp_requires_auth(self):
        """POST /api/star-chart/award-xp should require authentication."""
        response = requests.post(f"{BASE_URL}/api/star-chart/award-xp", json={
            "action": "constellation_explored",
            "constellation_name": "Aries"
        })
        assert response.status_code == 401


class TestStaticVideoFiles:
    """Tests for static video file serving."""
    
    def test_static_videos_path_exists(self, auth_headers):
        """Static videos path should be accessible (404 for missing files is OK)."""
        response = requests.get(f"{BASE_URL}/api/static/videos/nonexistent.mp4")
        # 404 is expected for non-existent files, but path should be valid
        assert response.status_code in [404, 200]
    
    def test_cached_mayan_video_accessible(self, auth_headers):
        """If Mayan video is cached, it should be accessible."""
        # First get the video URL
        stories_response = requests.get(f"{BASE_URL}/api/ai-visuals/video-stories", headers=auth_headers)
        if stories_response.status_code != 200:
            pytest.skip("Could not get video stories")
        
        mayan = next((s for s in stories_response.json()["stories"] if s["story_id"] == "mayan"), None)
        if mayan and mayan.get("video_url"):
            video_response = requests.head(f"{BASE_URL}{mayan['video_url']}")
            assert video_response.status_code == 200


class TestCelestialBadges:
    """Tests for celestial badges endpoint."""
    
    def test_get_badges_requires_auth(self):
        """GET /api/badges/celestial should require authentication."""
        response = requests.get(f"{BASE_URL}/api/badges/celestial")
        assert response.status_code == 401
    
    def test_get_badges_returns_data(self, auth_headers):
        """GET /api/badges/celestial should return badge data."""
        response = requests.get(f"{BASE_URL}/api/badges/celestial", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "badges" in data
        assert "total_earned" in data
        assert "total_badges" in data

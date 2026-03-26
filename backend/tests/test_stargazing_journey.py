"""
Test Stargazing Journey Feature - Backend API Tests
Tests for:
- POST /api/tts/narrate - TTS narration for constellation stories
- GET /api/star-chart/constellations - Returns 16 constellations with mythology data
- Regression: Mudras (25), Videos (23), Exercises (6) endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStargazingJourneyAPIs:
    """Tests for Stargazing Journey feature APIs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("token")
        assert token, "No token in login response"
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_star_chart_constellations_returns_16(self):
        """GET /api/star-chart/constellations returns 16 constellations"""
        response = self.session.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0")
        assert response.status_code == 200
        data = response.json()
        assert "constellations" in data
        assert len(data["constellations"]) == 16, f"Expected 16 constellations, got {len(data['constellations'])}"
    
    def test_star_chart_constellations_have_mythology(self):
        """Each constellation has mythology data for journey narration"""
        response = self.session.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0")
        assert response.status_code == 200
        data = response.json()
        
        for constellation in data["constellations"]:
            assert "mythology" in constellation, f"Constellation {constellation.get('name')} missing mythology"
            myth = constellation["mythology"]
            assert "figure" in myth, f"Mythology missing 'figure' for {constellation.get('name')}"
            assert "story" in myth, f"Mythology missing 'story' for {constellation.get('name')}"
            assert "lesson" in myth, f"Mythology missing 'lesson' for {constellation.get('name')}"
    
    def test_star_chart_constellations_have_ra_dec(self):
        """Each constellation has ra/dec coordinates for camera navigation"""
        response = self.session.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0")
        assert response.status_code == 200
        data = response.json()
        
        for constellation in data["constellations"]:
            assert "ra" in constellation, f"Constellation {constellation.get('name')} missing 'ra'"
            assert "dec" in constellation, f"Constellation {constellation.get('name')} missing 'dec'"
    
    def test_tts_narrate_endpoint(self):
        """POST /api/tts/narrate returns audio for constellation story"""
        response = self.session.post(
            f"{BASE_URL}/api/tts/narrate",
            json={
                "text": "The story of Aries. The golden ram that saved Phrixus and Helle.",
                "voice": "fable",
                "speed": 0.9
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio" in data, "TTS response missing 'audio' field"
        assert len(data["audio"]) > 1000, "Audio data too short, likely invalid"
    
    def test_tts_narrate_with_different_voices(self):
        """TTS endpoint accepts different voices"""
        voices = ["alloy", "fable", "nova"]
        for voice in voices:
            response = self.session.post(
                f"{BASE_URL}/api/tts/narrate",
                json={"text": "Testing voice narration.", "voice": voice, "speed": 1.0}
            )
            assert response.status_code == 200, f"Voice {voice} failed"
    
    def test_tts_narrate_rejects_short_text(self):
        """TTS endpoint rejects text shorter than 5 characters"""
        response = self.session.post(
            f"{BASE_URL}/api/tts/narrate",
            json={"text": "Hi", "voice": "fable", "speed": 1.0}
        )
        assert response.status_code == 400, "Should reject short text"


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        assert login_response.status_code == 200
        token = login_response.json().get("token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_mudras_returns_25(self):
        """GET /api/mudras returns 25 mudras"""
        response = self.session.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
    
    def test_videos_returns_23(self):
        """GET /api/videos returns 23 videos"""
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"
    
    def test_exercises_returns_6(self):
        """GET /api/exercises returns 6 exercises"""
        response = self.session.get(f"{BASE_URL}/api/exercises")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"

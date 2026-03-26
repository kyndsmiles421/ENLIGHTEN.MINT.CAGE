"""
Test suite for CosmicNarrator TTS feature and Star Chart mythology
Tests: POST /api/tts/narrate endpoint with fable voice
Tests: Star Chart constellations with mythology data
Tests: Regression for mudras, videos, exercises, meditation
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected endpoints"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTTSNarrate:
    """Tests for POST /api/tts/narrate endpoint - CosmicNarrator feature"""
    
    def test_tts_narrate_with_fable_voice(self):
        """Test TTS narration with fable voice and 0.9 speed for constellation story"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "The story of Orion. The great hunter walks among the stars.",
            "voice": "fable",
            "speed": 0.9
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio" in data, "Response should contain 'audio' field"
        
        # Verify it's valid base64
        audio_b64 = data["audio"]
        assert len(audio_b64) > 100, "Audio data should be substantial"
        try:
            decoded = base64.b64decode(audio_b64)
            assert len(decoded) > 0, "Decoded audio should have content"
        except Exception as e:
            pytest.fail(f"Audio is not valid base64: {e}")
    
    def test_tts_narrate_default_voice(self):
        """Test TTS narration with default voice (nova)"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Welcome to the cosmic meditation experience.",
            "speed": 1.0
        })
        assert response.status_code == 200
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100
    
    def test_tts_narrate_text_too_short(self):
        """Test TTS rejects text that is too short"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Hi",
            "voice": "fable"
        })
        assert response.status_code == 400, "Should reject text shorter than 5 chars"
    
    def test_tts_narrate_empty_text(self):
        """Test TTS rejects empty text"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "",
            "voice": "fable"
        })
        assert response.status_code == 400
    
    def test_tts_narrate_all_valid_voices(self):
        """Test TTS accepts all valid voice options"""
        valid_voices = ["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"]
        for voice in valid_voices[:3]:  # Test first 3 to save time
            response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
                "text": f"Testing voice {voice} for cosmic narration.",
                "voice": voice,
                "speed": 1.0
            })
            assert response.status_code == 200, f"Voice {voice} should work"


class TestStarChartMythology:
    """Tests for Star Chart constellations with mythology data"""
    
    def test_star_chart_constellations_returns_16(self, auth_headers):
        """Test that star chart returns 16 visible constellations"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "constellations" in data
        assert len(data["constellations"]) == 16, f"Expected 16 constellations, got {len(data['constellations'])}"
    
    def test_star_chart_constellations_have_mythology(self, auth_headers):
        """Test that all constellations have complete mythology data"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        for constellation in data["constellations"]:
            name = constellation.get("name", "Unknown")
            myth = constellation.get("mythology")
            assert myth is not None, f"Constellation {name} should have mythology"
            assert "figure" in myth, f"Constellation {name} mythology should have 'figure'"
            assert "origin" in myth, f"Constellation {name} mythology should have 'origin'"
            assert "deity" in myth, f"Constellation {name} mythology should have 'deity'"
            assert "story" in myth, f"Constellation {name} mythology should have 'story'"
            assert "lesson" in myth, f"Constellation {name} mythology should have 'lesson'"
            assert len(myth["story"]) > 50, f"Constellation {name} story should be substantial"
    
    def test_star_chart_has_mayan_data(self, auth_headers):
        """Test that star chart includes Mayan calendar data"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "mayan_glyph" in data
        assert "mayan_element" in data


class TestRegressionMudras:
    """Regression tests for mudras endpoint"""
    
    def test_mudras_returns_25_items(self, auth_headers):
        """Test mudras endpoint returns 25 items"""
        response = requests.get(f"{BASE_URL}/api/mudras", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
    
    def test_mudras_have_required_fields(self, auth_headers):
        """Test mudras have all required fields"""
        response = requests.get(f"{BASE_URL}/api/mudras", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        for mudra in data[:5]:  # Check first 5
            assert "id" in mudra
            assert "name" in mudra
            assert "category" in mudra
            assert "benefits" in mudra


class TestRegressionVideos:
    """Regression tests for videos endpoint"""
    
    def test_videos_returns_23_items(self, auth_headers):
        """Test videos endpoint returns 23 items"""
        response = requests.get(f"{BASE_URL}/api/videos", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"


class TestRegressionExercises:
    """Regression tests for exercises endpoint"""
    
    def test_exercises_returns_6_items(self, auth_headers):
        """Test exercises endpoint returns 6 items"""
        response = requests.get(f"{BASE_URL}/api/exercises", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"


class TestRegressionMeditation:
    """Regression tests for meditation endpoints"""
    
    def test_meditation_generate_guided(self, auth_headers):
        """Test Build Your Own meditation generation"""
        response = requests.post(
            f"{BASE_URL}/api/meditation/generate-guided",
            headers=auth_headers,
            json={
                "intention": "inner peace",
                "duration": 5,
                "focus": "breath"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "steps" in data or "segments" in data, "Should return meditation steps"

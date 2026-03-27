"""
Test suite for Creation Stories feature - Iteration 54
Tests: GET /api/creation-stories, GET /api/creation-stories/{id}, POST /api/creation-stories/{id}/narrate
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCreationStoriesEndpoints:
    """Tests for Creation Stories API endpoints"""
    
    def test_get_all_creation_stories(self):
        """GET /api/creation-stories returns 15 stories with regions map"""
        response = requests.get(f"{BASE_URL}/api/creation-stories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stories" in data, "Response should contain 'stories' key"
        assert "regions" in data, "Response should contain 'regions' key"
        assert "total" in data, "Response should contain 'total' key"
        
        # Verify 15 stories
        assert len(data["stories"]) == 15, f"Expected 15 stories, got {len(data['stories'])}"
        assert data["total"] == 15, f"Expected total=15, got {data['total']}"
        
        # Verify regions map structure
        regions = data["regions"]
        assert isinstance(regions, dict), "Regions should be a dictionary"
        expected_regions = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Arctic & Middle East"]
        for region in expected_regions:
            assert region in regions, f"Missing region: {region}"
        
        # Verify story structure
        story = data["stories"][0]
        required_fields = ["id", "culture", "region", "color", "title", "deity", "era", "symbols", "lesson", "story_preview"]
        for field in required_fields:
            assert field in story, f"Story missing field: {field}"
        
        print(f"PASS: GET /api/creation-stories returns {len(data['stories'])} stories with {len(regions)} regions")
    
    def test_get_mayan_creation_story(self):
        """GET /api/creation-stories/mayan returns full Mayan creation story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/mayan")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "mayan", f"Expected id='mayan', got {data.get('id')}"
        assert data["culture"] == "Mayan", f"Expected culture='Mayan', got {data.get('culture')}"
        
        # Verify full story content
        assert "story" in data, "Response should contain full 'story'"
        assert len(data["story"]) > 500, "Full story should be longer than preview"
        assert "lesson" in data, "Response should contain 'lesson'"
        assert "symbols" in data, "Response should contain 'symbols'"
        assert isinstance(data["symbols"], list), "Symbols should be a list"
        
        print(f"PASS: GET /api/creation-stories/mayan returns full story ({len(data['story'])} chars)")
    
    def test_get_egyptian_creation_story(self):
        """GET /api/creation-stories/egyptian returns full Egyptian story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/egyptian")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "egyptian", f"Expected id='egyptian', got {data.get('id')}"
        assert data["culture"] == "Egyptian", f"Expected culture='Egyptian', got {data.get('culture')}"
        assert "Atum" in data.get("deity", ""), "Egyptian story should mention Atum"
        assert "story" in data and len(data["story"]) > 500
        assert "lesson" in data
        assert "symbols" in data
        
        print(f"PASS: GET /api/creation-stories/egyptian returns full story")
    
    def test_get_norse_creation_story(self):
        """GET /api/creation-stories/norse returns full Norse story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/norse")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "norse", f"Expected id='norse', got {data.get('id')}"
        assert data["culture"] == "Norse", f"Expected culture='Norse', got {data.get('culture')}"
        assert "Odin" in data.get("deity", ""), "Norse story should mention Odin"
        assert "story" in data and len(data["story"]) > 500
        
        print(f"PASS: GET /api/creation-stories/norse returns full story")
    
    def test_get_hindu_creation_story(self):
        """GET /api/creation-stories/hindu returns full Hindu story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/hindu")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "hindu", f"Expected id='hindu', got {data.get('id')}"
        assert data["culture"] == "Hindu", f"Expected culture='Hindu', got {data.get('culture')}"
        assert "Brahma" in data.get("deity", ""), "Hindu story should mention Brahma"
        assert "story" in data and len(data["story"]) > 500
        
        print(f"PASS: GET /api/creation-stories/hindu returns full story")
    
    def test_get_yoruba_creation_story(self):
        """GET /api/creation-stories/yoruba returns full Yoruba story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/yoruba")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "yoruba", f"Expected id='yoruba', got {data.get('id')}"
        assert data["culture"] == "Yoruba", f"Expected culture='Yoruba', got {data.get('culture')}"
        assert "Olodumare" in data.get("deity", ""), "Yoruba story should mention Olodumare"
        assert "story" in data and len(data["story"]) > 500
        
        print(f"PASS: GET /api/creation-stories/yoruba returns full story")
    
    def test_get_invalid_story_returns_404(self):
        """GET /api/creation-stories/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"PASS: GET /api/creation-stories/invalid returns 404")
    
    def test_narrate_creation_story(self):
        """POST /api/creation-stories/norse/narrate returns audio base64"""
        response = requests.post(f"{BASE_URL}/api/creation-stories/norse/narrate")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "audio" in data, "Response should contain 'audio' key"
        assert "story_id" in data, "Response should contain 'story_id' key"
        assert data["story_id"] == "norse", f"Expected story_id='norse', got {data.get('story_id')}"
        
        # Verify audio is base64 encoded
        audio = data["audio"]
        assert isinstance(audio, str), "Audio should be a string"
        assert len(audio) > 1000, "Audio base64 should be substantial"
        
        print(f"PASS: POST /api/creation-stories/norse/narrate returns audio ({len(audio)} chars)")
    
    def test_narrate_invalid_story_returns_404(self):
        """POST /api/creation-stories/invalid/narrate returns 404"""
        response = requests.post(f"{BASE_URL}/api/creation-stories/invalid/narrate")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"PASS: POST /api/creation-stories/invalid/narrate returns 404")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_star_chart_cultures_returns_4(self):
        """GET /api/star-chart/cultures returns 4 cultures"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cultures" in data, "Response should contain 'cultures' key"
        assert len(data["cultures"]) == 4, f"Expected 4 cultures, got {len(data['cultures'])}"
        
        print(f"PASS: GET /api/star-chart/cultures returns {len(data['cultures'])} cultures")
    
    def test_coach_chat_works(self):
        """POST /api/coach/chat still works"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Login failed - skipping authenticated test")
        
        token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a session first
        session_response = requests.post(f"{BASE_URL}/api/coach/sessions", 
            json={"mode": "spiritual"},
            headers=headers
        )
        
        if session_response.status_code != 200:
            pytest.skip("Session creation failed - skipping chat test")
        
        session_id = session_response.json().get("session_id")
        
        # Test chat
        chat_response = requests.post(f"{BASE_URL}/api/coach/chat",
            json={
                "session_id": session_id,
                "message": "Hello, test message"
            },
            headers=headers
        )
        
        assert chat_response.status_code == 200, f"Expected 200, got {chat_response.status_code}"
        data = chat_response.json()
        assert "reply" in data, "Chat response should contain 'reply' key"
        
        print(f"PASS: POST /api/coach/chat works")
    
    def test_login_with_test_credentials(self):
        """Login with test@test.com/password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Login response should contain 'token'"
        assert "user" in data, "Login response should contain 'user'"
        
        print(f"PASS: Login with test@test.com/password works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

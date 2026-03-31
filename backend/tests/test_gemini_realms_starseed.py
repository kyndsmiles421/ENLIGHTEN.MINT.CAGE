"""
Test suite for Gemini Chat, Translation, Realms, and Starseed features.
Iteration 145: Testing new Gemini AI integration and MultiverseRealms routing.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestRealmsAPI:
    """Test /api/realms endpoints - returns 6 realms."""
    
    def test_get_all_realms(self):
        """GET /api/realms/ should return 6 realms."""
        response = requests.get(f"{BASE_URL}/api/realms/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        realms = response.json()
        assert isinstance(realms, list), "Response should be a list"
        assert len(realms) == 6, f"Expected 6 realms, got {len(realms)}"
        
        # Verify realm structure
        expected_realm_ids = ["astral_garden", "crystal_caverns", "celestial_ocean", 
                             "solar_temple", "void_sanctum", "aurora_bridge"]
        actual_ids = [r["id"] for r in realms]
        for realm_id in expected_realm_ids:
            assert realm_id in actual_ids, f"Missing realm: {realm_id}"
        
        # Verify realm has required fields
        for realm in realms:
            assert "id" in realm
            assert "name" in realm
            assert "frequency" in realm
            assert "color" in realm
            assert "gradient" in realm
            assert "ambient" in realm
            assert "drone" in realm
        print(f"PASS: GET /api/realms/ returns {len(realms)} realms")
    
    def test_get_single_realm(self):
        """GET /api/realms/{realm_id} should return realm details."""
        response = requests.get(f"{BASE_URL}/api/realms/astral_garden")
        assert response.status_code == 200
        
        realm = response.json()
        assert realm["id"] == "astral_garden"
        assert realm["name"] == "Astral Garden"
        assert realm["frequency"] == 528
        print("PASS: GET /api/realms/astral_garden returns correct realm")
    
    def test_get_nonexistent_realm(self):
        """GET /api/realms/{invalid_id} should return 404."""
        response = requests.get(f"{BASE_URL}/api/realms/nonexistent_realm")
        assert response.status_code == 404
        print("PASS: GET /api/realms/nonexistent returns 404")
    
    def test_enter_realm_authenticated(self, auth_headers):
        """POST /api/realms/{realm_id}/enter should log visit."""
        response = requests.post(
            f"{BASE_URL}/api/realms/astral_garden/enter",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "realm" in data
        assert "total_visits" in data
        assert "realm_visits" in data
        assert data["realm"]["id"] == "astral_garden"
        print(f"PASS: POST /api/realms/astral_garden/enter - visits: {data['realm_visits']}")
    
    def test_enter_realm_unauthenticated(self):
        """POST /api/realms/{realm_id}/enter without auth should fail."""
        response = requests.post(f"{BASE_URL}/api/realms/astral_garden/enter")
        assert response.status_code in [401, 403]
        print("PASS: POST /api/realms/enter without auth returns 401/403")
    
    def test_get_visit_stats(self, auth_headers):
        """GET /api/realms/visits/stats should return user's visit stats."""
        response = requests.get(
            f"{BASE_URL}/api/realms/visits/stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        stats = response.json()
        assert isinstance(stats, list)
        print(f"PASS: GET /api/realms/visits/stats returns {len(stats)} realm stats")


class TestStarseedAPI:
    """Test /api/starseed endpoints - returns 8 origins."""
    
    def test_get_all_origins(self):
        """GET /api/starseed/origins should return 8 origins."""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200
        
        origins = response.json()
        assert isinstance(origins, list)
        assert len(origins) == 8, f"Expected 8 origins, got {len(origins)}"
        
        expected_origins = ["pleiadian", "sirian", "arcturian", "andromedan", 
                          "lyran", "orion", "mintakan", "venusian"]
        actual_ids = [o["id"] for o in origins]
        for origin_id in expected_origins:
            assert origin_id in actual_ids, f"Missing origin: {origin_id}"
        
        # Verify origin structure
        for origin in origins:
            assert "id" in origin
            assert "name" in origin
            assert "color" in origin
            assert "desc" in origin
            assert "traits" in origin
        print(f"PASS: GET /api/starseed/origins returns {len(origins)} origins")
    
    def test_get_awakening_chapter(self):
        """GET /api/starseed/chapter/awakening should return first chapter."""
        response = requests.get(f"{BASE_URL}/api/starseed/chapter/awakening")
        assert response.status_code == 200
        
        chapter = response.json()
        assert chapter["id"] == "awakening"
        assert "title" in chapter
        assert "narration" in chapter
        assert "choices" in chapter
        assert len(chapter["choices"]) == 4, "Awakening should have 4 choices"
        print("PASS: GET /api/starseed/chapter/awakening returns chapter with 4 choices")
    
    def test_get_ending_chapter(self):
        """GET /api/starseed/chapter/{ending} should return origin result."""
        response = requests.get(f"{BASE_URL}/api/starseed/chapter/healing_chamber")
        assert response.status_code == 200
        
        chapter = response.json()
        assert chapter["ending"] == True
        assert chapter["origin_result"] == "pleiadian"
        assert "origin" in chapter
        assert chapter["origin"]["id"] == "pleiadian"
        assert "gift" in chapter
        assert "frequency" in chapter
        print("PASS: GET /api/starseed/chapter/healing_chamber returns ending with origin")
    
    def test_get_nonexistent_chapter(self):
        """GET /api/starseed/chapter/{invalid} should return 404."""
        response = requests.get(f"{BASE_URL}/api/starseed/chapter/nonexistent")
        assert response.status_code == 404
        print("PASS: GET /api/starseed/chapter/nonexistent returns 404")
    
    def test_get_my_origin_authenticated(self, auth_headers):
        """GET /api/starseed/my-origin should return user's origin."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/my-origin",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "origin" in data
        assert "gift" in data
        print(f"PASS: GET /api/starseed/my-origin returns origin data")
    
    def test_get_my_journeys_authenticated(self, auth_headers):
        """GET /api/starseed/my-journeys should return user's journeys."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/my-journeys",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        journeys = response.json()
        assert isinstance(journeys, list)
        print(f"PASS: GET /api/starseed/my-journeys returns {len(journeys)} journeys")
    
    def test_save_journey_authenticated(self, auth_headers):
        """POST /api/starseed/save-journey should save journey."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/save-journey",
            json={
                "origin_id": "pleiadian",
                "origin_name": "Pleiadian",
                "gift": "Empathic Healing Touch",
                "path": ["awakening", "temple_of_light", "healing_chamber"],
                "frequency": 528
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["origin_id"] == "pleiadian"
        print("PASS: POST /api/starseed/save-journey saves journey successfully")


class TestGeminiChatAPI:
    """Test /api/gemini chat endpoints."""
    
    def test_gemini_chat_new_session(self, auth_headers):
        """POST /api/gemini/chat should create new session and return AI reply."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "Hello Cosmos, what is meditation?"},
            headers=auth_headers,
            timeout=30  # Gemini may take time
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reply" in data, "Response should contain 'reply'"
        assert "session_id" in data, "Response should contain 'session_id'"
        assert len(data["reply"]) > 0, "Reply should not be empty"
        assert len(data["session_id"]) > 0, "Session ID should not be empty"
        print(f"PASS: POST /api/gemini/chat returns reply (length: {len(data['reply'])})")
        return data["session_id"]
    
    def test_gemini_chat_existing_session(self, auth_headers):
        """POST /api/gemini/chat with session_id should continue conversation."""
        # First create a session
        response1 = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "What is yoga?"},
            headers=auth_headers,
            timeout=30
        )
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Continue the session
        response2 = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "Tell me more about breathing techniques", "session_id": session_id},
            headers=auth_headers,
            timeout=30
        )
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["session_id"] == session_id, "Session ID should be preserved"
        assert len(data["reply"]) > 0
        print("PASS: POST /api/gemini/chat continues existing session")
    
    def test_gemini_chat_empty_message(self, auth_headers):
        """POST /api/gemini/chat with empty message should return 400."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": ""},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("PASS: POST /api/gemini/chat with empty message returns 400")
    
    def test_gemini_chat_unauthenticated(self):
        """POST /api/gemini/chat without auth should fail."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "Hello"}
        )
        assert response.status_code in [401, 403]
        print("PASS: POST /api/gemini/chat without auth returns 401/403")
    
    def test_get_gemini_sessions(self, auth_headers):
        """GET /api/gemini/sessions should return user's sessions."""
        response = requests.get(
            f"{BASE_URL}/api/gemini/sessions",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        sessions = response.json()
        assert isinstance(sessions, list)
        if len(sessions) > 0:
            assert "id" in sessions[0]
            assert "created_at" in sessions[0]
        print(f"PASS: GET /api/gemini/sessions returns {len(sessions)} sessions")
    
    def test_get_gemini_session_detail(self, auth_headers):
        """GET /api/gemini/sessions/{session_id} should return full history."""
        # First create a session
        response1 = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "Test message for session detail"},
            headers=auth_headers,
            timeout=30
        )
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Get session detail
        response2 = requests.get(
            f"{BASE_URL}/api/gemini/sessions/{session_id}",
            headers=auth_headers
        )
        assert response2.status_code == 200
        
        session = response2.json()
        assert session["id"] == session_id
        assert "messages" in session
        assert len(session["messages"]) >= 2  # User message + AI reply
        print(f"PASS: GET /api/gemini/sessions/{session_id} returns {len(session['messages'])} messages")
    
    def test_get_nonexistent_session(self, auth_headers):
        """GET /api/gemini/sessions/{invalid} should return 404."""
        response = requests.get(
            f"{BASE_URL}/api/gemini/sessions/nonexistent-session-id",
            headers=auth_headers
        )
        assert response.status_code == 404
        print("PASS: GET /api/gemini/sessions/nonexistent returns 404")
    
    def test_delete_gemini_session(self, auth_headers):
        """DELETE /api/gemini/sessions/{session_id} should delete session."""
        # First create a session
        response1 = requests.post(
            f"{BASE_URL}/api/gemini/chat",
            json={"message": "Session to be deleted"},
            headers=auth_headers,
            timeout=30
        )
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Delete the session
        response2 = requests.delete(
            f"{BASE_URL}/api/gemini/sessions/{session_id}",
            headers=auth_headers
        )
        assert response2.status_code == 200
        
        # Verify deletion
        response3 = requests.get(
            f"{BASE_URL}/api/gemini/sessions/{session_id}",
            headers=auth_headers
        )
        assert response3.status_code == 404
        print("PASS: DELETE /api/gemini/sessions/{session_id} deletes session")


class TestGeminiTranslateAPI:
    """Test /api/gemini/translate endpoint."""
    
    def test_translate_text(self, auth_headers):
        """POST /api/gemini/translate should translate text."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/translate",
            json={
                "text": "Hello, how are you?",
                "target_lang": "es"
            },
            headers=auth_headers,
            timeout=25
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "translated" in data
        assert "target_lang" in data
        assert data["target_lang"] == "es"
        assert len(data["translated"]) > 0
        print(f"PASS: POST /api/gemini/translate returns: {data['translated']}")
    
    def test_translate_empty_text(self, auth_headers):
        """POST /api/gemini/translate with empty text should return 400."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/translate",
            json={"text": "", "target_lang": "es"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("PASS: POST /api/gemini/translate with empty text returns 400")
    
    def test_translate_caching(self, auth_headers):
        """POST /api/gemini/translate should cache results."""
        # First request
        response1 = requests.post(
            f"{BASE_URL}/api/gemini/translate",
            json={"text": "Good morning", "target_lang": "fr"},
            headers=auth_headers,
            timeout=25
        )
        assert response1.status_code == 200
        
        # Second request (should be cached)
        response2 = requests.post(
            f"{BASE_URL}/api/gemini/translate",
            json={"text": "Good morning", "target_lang": "fr"},
            headers=auth_headers,
            timeout=5  # Should be fast if cached
        )
        assert response2.status_code == 200
        
        data = response2.json()
        assert data.get("cached") == True, "Second request should be cached"
        print("PASS: POST /api/gemini/translate caches results")
    
    def test_translate_without_auth(self):
        """POST /api/gemini/translate without auth should still work (optional auth)."""
        response = requests.post(
            f"{BASE_URL}/api/gemini/translate",
            json={"text": "Peace", "target_lang": "ja"},
            timeout=25
        )
        # This endpoint uses get_current_user_optional, so it should work
        assert response.status_code == 200
        print("PASS: POST /api/gemini/translate works without auth (optional)")


class TestHealthCheck:
    """Basic health check tests."""
    
    def test_backend_health(self):
        """Backend should be reachable."""
        response = requests.get(f"{BASE_URL}/api/realms/")
        assert response.status_code == 200
        print("PASS: Backend is healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 145: Context-Aware Gemini Chat Tests
Tests the new page_context feature in the Gemini chat endpoint
and verifies realms/starseed endpoints work correctly.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGeminiContextAwareChat:
    """Tests for the context-aware Gemini chat feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test credentials and auth"""
        self.email = "kyndsmiles@gmail.com"
        self.password = "password"
        self.auth_headers = None
        
        # Login to get auth token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.email,
            "password": self.password
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.auth_headers = {"Authorization": f"Bearer {token}"}
        else:
            pytest.skip("Could not authenticate - skipping authenticated tests")
    
    def test_gemini_chat_with_page_context_dashboard(self):
        """Test Gemini chat with Dashboard page context"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "What can I do here?",
            "page_context": {
                "area": "Dashboard",
                "hint": "their personal wellness overview with shortcuts, mood history, and daily challenges",
                "path": "/dashboard"
            }
        }, headers=self.auth_headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "reply" in data, "Response should contain 'reply' field"
        assert "session_id" in data, "Response should contain 'session_id' field"
        assert len(data["reply"]) > 10, "Reply should be meaningful"
        print(f"Dashboard context reply: {data['reply'][:200]}...")
    
    def test_gemini_chat_with_page_context_frequencies(self):
        """Test Gemini chat with Frequencies page context"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "Which frequency should I use?",
            "page_context": {
                "area": "Frequencies",
                "hint": "the sacred healing frequency generator with solfeggio tones",
                "path": "/frequencies"
            }
        }, headers=self.auth_headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "reply" in data
        assert len(data["reply"]) > 10
        print(f"Frequencies context reply: {data['reply'][:200]}...")
    
    def test_gemini_chat_with_page_context_multiverse_realms(self):
        """Test Gemini chat with Multiverse Realms page context"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "Tell me about this place",
            "page_context": {
                "area": "Multiverse Realms",
                "hint": "dimensional travel through 6 consciousness realms with immersive soundscapes",
                "path": "/multiverse-realms"
            }
        }, headers=self.auth_headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "reply" in data
        assert len(data["reply"]) > 10
        print(f"Multiverse Realms context reply: {data['reply'][:200]}...")
    
    def test_gemini_chat_without_page_context(self):
        """Test Gemini chat without page context - should work as generic assistant"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "Hello, how are you?",
            "page_context": None
        }, headers=self.auth_headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "reply" in data
        assert "session_id" in data
        print(f"Generic reply: {data['reply'][:200]}...")
    
    def test_gemini_chat_empty_message_rejected(self):
        """Test that empty messages are rejected"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "",
            "page_context": None
        }, headers=self.auth_headers, timeout=10)
        
        assert response.status_code == 400, f"Expected 400 for empty message, got {response.status_code}"
    
    def test_gemini_chat_requires_auth(self):
        """Test that Gemini chat requires authentication"""
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "Hello",
            "page_context": None
        }, timeout=10)
        
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestGeminiSessions:
    """Tests for Gemini session management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test credentials and auth"""
        self.email = "kyndsmiles@gmail.com"
        self.password = "password"
        self.auth_headers = None
        
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.email,
            "password": self.password
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.auth_headers = {"Authorization": f"Bearer {token}"}
        else:
            pytest.skip("Could not authenticate")
    
    def test_get_sessions_list(self):
        """Test getting list of Gemini sessions"""
        response = requests.get(f"{BASE_URL}/api/gemini/sessions", headers=self.auth_headers, timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Sessions should be a list"
        print(f"Found {len(data)} sessions")
    
    def test_session_persistence(self):
        """Test that sessions persist messages"""
        # Create a new session with first message
        response1 = requests.post(f"{BASE_URL}/api/gemini/chat", json={
            "message": "Remember the word: COSMIC_TEST_145",
            "page_context": None
        }, headers=self.auth_headers, timeout=30)
        
        assert response1.status_code == 200
        session_id = response1.json().get("session_id")
        assert session_id, "Should return session_id"
        
        # Get the session to verify it was saved
        response2 = requests.get(f"{BASE_URL}/api/gemini/sessions/{session_id}", headers=self.auth_headers, timeout=10)
        
        assert response2.status_code == 200, f"Expected 200, got {response2.status_code}"
        session_data = response2.json()
        assert "messages" in session_data
        assert len(session_data["messages"]) >= 2, "Should have at least user message and assistant reply"
        
        # Verify the message content
        user_messages = [m for m in session_data["messages"] if m["role"] == "user"]
        assert any("COSMIC_TEST_145" in m["text"] for m in user_messages), "User message should be saved"
        print(f"Session {session_id} has {len(session_data['messages'])} messages")


class TestMultiverseRealms:
    """Tests for Multiverse Realms endpoints"""
    
    def test_get_all_realms(self):
        """Test getting all realms - should return 6 realms"""
        response = requests.get(f"{BASE_URL}/api/realms/", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Realms should be a list"
        assert len(data) == 6, f"Expected 6 realms, got {len(data)}"
        
        # Verify realm structure
        for realm in data:
            assert "id" in realm
            assert "name" in realm
            assert "frequency" in realm
            assert "gradient" in realm
            assert "element" in realm
        
        realm_names = [r["name"] for r in data]
        print(f"Realms: {realm_names}")
    
    def test_realm_has_required_fields(self):
        """Test that each realm has all required fields"""
        response = requests.get(f"{BASE_URL}/api/realms/", timeout=10)
        assert response.status_code == 200
        
        required_fields = ["id", "name", "subtitle", "desc", "color", "gradient", "element", "frequency", "practices", "ambient", "drone"]
        
        for realm in response.json():
            for field in required_fields:
                assert field in realm, f"Realm {realm.get('id')} missing field: {field}"


class TestStarseedOrigins:
    """Tests for Starseed origins endpoints"""
    
    def test_get_all_origins(self):
        """Test getting all starseed origins - should return 8 origins"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Origins should be a list"
        assert len(data) == 8, f"Expected 8 origins, got {len(data)}"
        
        # Verify origin structure
        for origin in data:
            assert "id" in origin
            assert "name" in origin
            assert "color" in origin
            assert "desc" in origin
            assert "traits" in origin
        
        origin_names = [o["name"] for o in data]
        print(f"Origins: {origin_names}")
    
    def test_origin_has_required_fields(self):
        """Test that each origin has all required fields"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins", timeout=10)
        assert response.status_code == 200
        
        required_fields = ["id", "name", "color", "desc", "traits", "element"]
        
        for origin in response.json():
            for field in required_fields:
                assert field in origin, f"Origin {origin.get('id')} missing field: {field}"


class TestBackendHealth:
    """Tests to verify backend is running correctly after route migration"""
    
    def test_backend_health(self):
        """Test that backend responds"""
        response = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
        # Should return 401 without auth, but not 500
        assert response.status_code in [200, 401, 403], f"Backend error: {response.status_code}"
    
    def test_gemini_router_registered(self):
        """Test that gemini router is properly registered"""
        # Try to access gemini endpoint without auth - should get 401, not 404
        response = requests.post(f"{BASE_URL}/api/gemini/chat", json={"message": "test"}, timeout=10)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code} - router may not be registered"
    
    def test_realms_router_registered(self):
        """Test that realms router is properly registered"""
        response = requests.get(f"{BASE_URL}/api/realms/", timeout=10)
        assert response.status_code == 200, f"Realms router not working: {response.status_code}"
    
    def test_starseed_router_registered(self):
        """Test that starseed router is properly registered"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins", timeout=10)
        assert response.status_code == 200, f"Starseed router not working: {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

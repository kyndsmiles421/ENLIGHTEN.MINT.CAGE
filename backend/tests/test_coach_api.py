"""
Phase 32: AI Spiritual Coach (Sage) API Tests
Tests for coach modes, sessions, chat, and multi-turn conversations
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCoachModes:
    """Test GET /api/coach/modes - returns 5 coaching modes"""
    
    def test_get_modes_returns_5_modes(self):
        response = requests.get(f"{BASE_URL}/api/coach/modes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "modes" in data, "Response should have 'modes' key"
        modes = data["modes"]
        assert len(modes) == 5, f"Expected 5 modes, got {len(modes)}"
        
        # Verify all expected modes are present
        mode_ids = [m["id"] for m in modes]
        expected_ids = ["spiritual", "life", "shadow", "manifestation", "healing"]
        for expected_id in expected_ids:
            assert expected_id in mode_ids, f"Missing mode: {expected_id}"
        
        # Verify mode structure
        for mode in modes:
            assert "id" in mode, "Mode should have 'id'"
            assert "name" in mode, "Mode should have 'name'"
            assert "color" in mode, "Mode should have 'color'"
            assert "desc" in mode, "Mode should have 'desc'"


class TestCoachSessions:
    """Test coach session CRUD operations"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_create_session_spiritual_mode(self, auth_headers):
        """POST /api/coach/sessions creates a new session"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "spiritual"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "session_id" in data, "Response should have 'session_id'"
        assert "mode" in data, "Response should have 'mode'"
        assert data["mode"] == "spiritual", f"Expected mode 'spiritual', got {data['mode']}"
        assert len(data["session_id"]) > 0, "session_id should not be empty"
    
    def test_create_session_life_mode(self, auth_headers):
        """POST /api/coach/sessions with life mode"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "life"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "life"
    
    def test_get_sessions_list(self, auth_headers):
        """GET /api/coach/sessions returns sessions list with preview"""
        response = requests.get(
            f"{BASE_URL}/api/coach/sessions",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sessions" in data, "Response should have 'sessions' key"
        assert isinstance(data["sessions"], list), "sessions should be a list"
        
        # If there are sessions, verify structure
        if len(data["sessions"]) > 0:
            session = data["sessions"][0]
            assert "id" in session, "Session should have 'id'"
            assert "mode" in session, "Session should have 'mode'"
            assert "message_count" in session, "Session should have 'message_count'"
            assert "preview" in session, "Session should have 'preview'"
    
    def test_get_session_by_id(self, auth_headers):
        """GET /api/coach/sessions/{id} returns session with messages array"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "shadow"},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Then get it by ID
        response = requests.get(
            f"{BASE_URL}/api/coach/sessions/{session_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "id" in data, "Session should have 'id'"
        assert "mode" in data, "Session should have 'mode'"
        assert "messages" in data, "Session should have 'messages' array"
        assert isinstance(data["messages"], list), "messages should be a list"
        assert data["mode"] == "shadow", f"Expected mode 'shadow', got {data['mode']}"
    
    def test_delete_session(self, auth_headers):
        """DELETE /api/coach/sessions/{id} deletes session"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "manifestation"},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/coach/sessions/{session_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        data = delete_response.json()
        assert data.get("status") == "deleted", "Should return status: deleted"
        
        # Verify it's gone
        get_response = requests.get(
            f"{BASE_URL}/api/coach/sessions/{session_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404, "Deleted session should return 404"


class TestCoachChat:
    """Test coach chat functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    @pytest.fixture
    def session_id(self, auth_headers):
        """Create a session for chat tests"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "healing"},
            headers=auth_headers
        )
        return response.json()["session_id"]
    
    def test_send_message_returns_reply(self, auth_headers, session_id):
        """POST /api/coach/chat returns AI reply"""
        response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": session_id, "message": "Hello Sage, I need guidance"},
            headers=auth_headers,
            timeout=60  # AI may take 10-30 seconds
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reply" in data, "Response should have 'reply'"
        assert "session_id" in data, "Response should have 'session_id'"
        assert len(data["reply"]) > 0, "Reply should not be empty"
        assert data["session_id"] == session_id, "session_id should match"
    
    def test_chat_empty_message_rejected(self, auth_headers, session_id):
        """POST /api/coach/chat with empty message returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": session_id, "message": ""},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for empty message, got {response.status_code}"
    
    def test_chat_invalid_session_returns_404(self, auth_headers):
        """POST /api/coach/chat with invalid session returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": "invalid-session-id", "message": "Hello"},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for invalid session, got {response.status_code}"


class TestMultiTurnConversation:
    """Test multi-turn conversation persistence"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_multi_turn_messages_stored(self, auth_headers):
        """Send 2 messages to same session and verify both stored"""
        # Create session
        create_response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "spiritual"},
            headers=auth_headers
        )
        session_id = create_response.json()["session_id"]
        
        # Send first message
        msg1_response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": session_id, "message": "TEST_MSG_1: What is my purpose?"},
            headers=auth_headers,
            timeout=60
        )
        assert msg1_response.status_code == 200, f"First message failed: {msg1_response.text}"
        
        # Send second message
        msg2_response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": session_id, "message": "TEST_MSG_2: How can I find peace?"},
            headers=auth_headers,
            timeout=60
        )
        assert msg2_response.status_code == 200, f"Second message failed: {msg2_response.text}"
        
        # Verify both messages are stored
        get_response = requests.get(
            f"{BASE_URL}/api/coach/sessions/{session_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        
        session_data = get_response.json()
        messages = session_data.get("messages", [])
        
        # Should have 4 messages: 2 user + 2 assistant
        assert len(messages) >= 4, f"Expected at least 4 messages, got {len(messages)}"
        
        # Verify user messages are stored
        user_messages = [m for m in messages if m["role"] == "user"]
        assert len(user_messages) >= 2, f"Expected at least 2 user messages, got {len(user_messages)}"
        
        # Verify assistant messages are stored
        assistant_messages = [m for m in messages if m["role"] == "assistant"]
        assert len(assistant_messages) >= 2, f"Expected at least 2 assistant messages, got {len(assistant_messages)}"
        
        # Verify message content
        user_texts = [m["text"] for m in user_messages]
        assert any("TEST_MSG_1" in t for t in user_texts), "First user message not found"
        assert any("TEST_MSG_2" in t for t in user_texts), "Second user message not found"


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_health_endpoint(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
    
    def test_cosmic_calendar_today(self):
        """GET /api/cosmic-calendar/today returns data"""
        response = requests.get(
            f"{BASE_URL}/api/cosmic-calendar/today",
            params={"birth_month": 3, "birth_day": 15, "birth_year": 1990}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "date" in data, "Should have 'date'"
        assert "numerology" in data, "Should have 'numerology'"
        assert "moon" in data, "Should have 'moon'"
    
    def test_acupressure_points(self):
        """GET /api/acupressure/points returns 10 points"""
        response = requests.get(f"{BASE_URL}/api/acupressure/points")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "points" in data, "Should have 'points'"
        assert len(data["points"]) == 10, f"Expected 10 points, got {len(data['points'])}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

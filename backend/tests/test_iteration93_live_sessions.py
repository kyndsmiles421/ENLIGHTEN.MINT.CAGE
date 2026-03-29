"""
Iteration 93: Live Sessions Feature Tests
- GET /api/live/session-types - returns 8 session types and 6 virtual scenes
- POST /api/live/sessions - creates a new session
- GET /api/live/sessions - returns list of scheduled/active sessions
- GET /api/live/sessions/{id} - returns session details with participant list
- POST /api/live/sessions/{id}/start - marks session as active (host only)
- POST /api/live/sessions/{id}/end - marks session as ended (host only)
- Non-host user gets 403 when trying to start/end a session
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestLiveSessionTypes:
    """Test session types and scenes endpoint"""

    def test_get_session_types_returns_8_types(self):
        """GET /api/live/session-types returns 8 session types"""
        response = requests.get(f"{BASE_URL}/api/live/session-types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "types" in data, "Response should contain 'types'"
        assert len(data["types"]) == 8, f"Expected 8 session types, got {len(data['types'])}"
        
        # Verify type structure
        for t in data["types"]:
            assert "id" in t, "Each type should have 'id'"
            assert "label" in t, "Each type should have 'label'"
            assert "icon" in t, "Each type should have 'icon'"
            assert "color" in t, "Each type should have 'color'"
            assert "description" in t, "Each type should have 'description'"

    def test_get_session_types_returns_6_scenes(self):
        """GET /api/live/session-types returns 6 virtual scenes"""
        response = requests.get(f"{BASE_URL}/api/live/session-types")
        assert response.status_code == 200
        
        data = response.json()
        assert "scenes" in data, "Response should contain 'scenes'"
        assert len(data["scenes"]) == 6, f"Expected 6 scenes, got {len(data['scenes'])}"
        
        # Verify scene structure
        for s in data["scenes"]:
            assert "id" in s, "Each scene should have 'id'"
            assert "label" in s, "Each scene should have 'label'"
            assert "gradient" in s, "Each scene should have 'gradient'"
            assert "bg" in s, "Each scene should have 'bg'"


class TestLiveSessionCRUD:
    """Test session CRUD operations"""

    @pytest.fixture
    def auth_token_creator(self):
        """Get auth token for creator user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Creator authentication failed")

    @pytest.fixture
    def auth_token_test_user(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user authentication failed")

    @pytest.fixture
    def auth_headers_creator(self, auth_token_creator):
        return {"Authorization": f"Bearer {auth_token_creator}"}

    @pytest.fixture
    def auth_headers_test_user(self, auth_token_test_user):
        return {"Authorization": f"Bearer {auth_token_test_user}"}

    def test_create_session(self, auth_headers_creator):
        """POST /api/live/sessions creates a new session"""
        session_data = {
            "title": f"TEST_Session_{uuid.uuid4().hex[:8]}",
            "description": "Test meditation session",
            "session_type": "meditation",
            "scene": "cosmic-temple",
            "duration_minutes": 20
        }
        
        response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain session 'id'"
        assert data["title"] == session_data["title"], "Title should match"
        assert data["session_type"] == session_data["session_type"], "Session type should match"
        assert data["scene"] == session_data["scene"], "Scene should match"
        assert data["duration_minutes"] == session_data["duration_minutes"], "Duration should match"
        assert data["status"] == "scheduled", "New session should be 'scheduled'"
        assert "host_id" in data, "Response should contain 'host_id'"
        assert "host_name" in data, "Response should contain 'host_name'"
        
        return data["id"]

    def test_list_sessions(self, auth_headers_creator):
        """GET /api/live/sessions returns list of sessions"""
        response = requests.get(
            f"{BASE_URL}/api/live/sessions",
            headers=auth_headers_creator
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sessions" in data, "Response should contain 'sessions'"
        assert isinstance(data["sessions"], list), "Sessions should be a list"
        
        # Verify session structure if any exist
        if len(data["sessions"]) > 0:
            session = data["sessions"][0]
            assert "id" in session, "Session should have 'id'"
            assert "title" in session, "Session should have 'title'"
            assert "status" in session, "Session should have 'status'"
            assert "participant_count" in session, "Session should have 'participant_count'"

    def test_get_session_details(self, auth_headers_creator):
        """GET /api/live/sessions/{id} returns session details"""
        # First create a session
        session_data = {
            "title": f"TEST_Detail_Session_{uuid.uuid4().hex[:8]}",
            "session_type": "breathwork",
            "scene": "zen-garden",
            "duration_minutes": 15
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Get session details
        response = requests.get(
            f"{BASE_URL}/api/live/sessions/{session_id}",
            headers=auth_headers_creator
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == session_id, "Session ID should match"
        assert data["title"] == session_data["title"], "Title should match"
        assert "participants" in data, "Response should contain 'participants'"
        assert "participant_count" in data, "Response should contain 'participant_count'"

    def test_get_nonexistent_session_returns_404(self, auth_headers_creator):
        """GET /api/live/sessions/{id} returns 404 for nonexistent session"""
        fake_id = str(uuid.uuid4())
        response = requests.get(
            f"{BASE_URL}/api/live/sessions/{fake_id}",
            headers=auth_headers_creator
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestLiveSessionHostControls:
    """Test host-only controls (start/end session)"""

    @pytest.fixture
    def auth_token_creator(self):
        """Get auth token for creator user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Creator authentication failed")

    @pytest.fixture
    def auth_token_test_user(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user authentication failed")

    @pytest.fixture
    def auth_headers_creator(self, auth_token_creator):
        return {"Authorization": f"Bearer {auth_token_creator}"}

    @pytest.fixture
    def auth_headers_test_user(self, auth_token_test_user):
        return {"Authorization": f"Bearer {auth_token_test_user}"}

    def test_host_can_start_session(self, auth_headers_creator):
        """POST /api/live/sessions/{id}/start - host can start their session"""
        # Create a session
        session_data = {
            "title": f"TEST_Start_Session_{uuid.uuid4().hex[:8]}",
            "session_type": "yoga",
            "scene": "mountain-peak",
            "duration_minutes": 30
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Start the session
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/start",
            headers=auth_headers_creator
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "started", "Response should indicate session started"
        
        # Verify session is now active
        get_response = requests.get(
            f"{BASE_URL}/api/live/sessions/{session_id}",
            headers=auth_headers_creator
        )
        assert get_response.status_code == 200
        assert get_response.json()["status"] == "active", "Session should be 'active' after start"

    def test_host_can_end_session(self, auth_headers_creator):
        """POST /api/live/sessions/{id}/end - host can end their session"""
        # Create and start a session
        session_data = {
            "title": f"TEST_End_Session_{uuid.uuid4().hex[:8]}",
            "session_type": "sound-bath",
            "scene": "aurora",
            "duration_minutes": 45
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Start the session first
        start_response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/start",
            headers=auth_headers_creator
        )
        assert start_response.status_code == 200
        
        # End the session
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/end",
            headers=auth_headers_creator
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "ended", "Response should indicate session ended"
        
        # Verify session is now ended
        get_response = requests.get(
            f"{BASE_URL}/api/live/sessions/{session_id}",
            headers=auth_headers_creator
        )
        assert get_response.status_code == 200
        assert get_response.json()["status"] == "ended", "Session should be 'ended' after end"

    def test_non_host_cannot_start_session(self, auth_headers_creator, auth_headers_test_user):
        """POST /api/live/sessions/{id}/start - non-host gets 403"""
        # Create a session as creator
        session_data = {
            "title": f"TEST_NonHost_Start_{uuid.uuid4().hex[:8]}",
            "session_type": "mantra",
            "scene": "sacred-fire",
            "duration_minutes": 20
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Try to start as test user (non-host)
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/start",
            headers=auth_headers_test_user
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"

    def test_non_host_cannot_end_session(self, auth_headers_creator, auth_headers_test_user):
        """POST /api/live/sessions/{id}/end - non-host gets 403"""
        # Create and start a session as creator
        session_data = {
            "title": f"TEST_NonHost_End_{uuid.uuid4().hex[:8]}",
            "session_type": "qigong",
            "scene": "ocean-shore",
            "duration_minutes": 25
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers_creator
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Start as creator
        start_response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/start",
            headers=auth_headers_creator
        )
        assert start_response.status_code == 200
        
        # Try to end as test user (non-host)
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/end",
            headers=auth_headers_test_user
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"

    def test_start_nonexistent_session_returns_404(self, auth_headers_creator):
        """POST /api/live/sessions/{id}/start returns 404 for nonexistent session"""
        fake_id = str(uuid.uuid4())
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{fake_id}/start",
            headers=auth_headers_creator
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

    def test_end_nonexistent_session_returns_404(self, auth_headers_creator):
        """POST /api/live/sessions/{id}/end returns 404 for nonexistent session"""
        fake_id = str(uuid.uuid4())
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/{fake_id}/end",
            headers=auth_headers_creator
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestLiveSessionAuth:
    """Test authentication requirements"""

    def test_list_sessions_requires_auth(self):
        """GET /api/live/sessions requires authentication"""
        response = requests.get(f"{BASE_URL}/api/live/sessions")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_create_session_requires_auth(self):
        """POST /api/live/sessions requires authentication"""
        response = requests.post(f"{BASE_URL}/api/live/sessions", json={
            "title": "Unauthorized Session",
            "session_type": "meditation"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_session_types_is_public(self):
        """GET /api/live/session-types is public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/live/session-types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

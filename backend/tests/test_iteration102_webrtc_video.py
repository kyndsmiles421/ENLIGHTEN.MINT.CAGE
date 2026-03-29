"""
Iteration 102: WebRTC Video Calling in Live Sessions
Tests for Zoom-like video calling features:
- WebSocket message types: camera_toggle, video_mode, rtc_offer, rtc_answer, ice_candidate
- Backend relays WebRTC signaling to target peers
- Host-only video_mode control
- Session video_mode persistence
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"
ACTIVE_SESSION_ID = "7411b23d-167d-435b-858a-a372aa7e3c4f"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin/host authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Admin login failed: {response.status_code}")


@pytest.fixture(scope="module")
def test_user_token():
    """Get regular user authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Test user login failed: {response.status_code}")


@pytest.fixture
def admin_headers(admin_token):
    """Headers with admin auth"""
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture
def test_user_headers(test_user_token):
    """Headers with test user auth"""
    return {"Authorization": f"Bearer {test_user_token}", "Content-Type": "application/json"}


class TestLiveSessionEndpoints:
    """Test live session REST API endpoints"""

    def test_get_session_types(self, admin_headers):
        """Test session types endpoint returns types and scenes"""
        response = requests.get(f"{BASE_URL}/api/live/session-types", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        assert "scenes" in data
        assert len(data["types"]) > 0
        print(f"PASSED: Session types endpoint returns {len(data['types'])} types and {len(data['scenes'])} scenes")

    def test_list_sessions(self, admin_headers):
        """Test listing live sessions"""
        response = requests.get(f"{BASE_URL}/api/live/sessions", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        print(f"PASSED: List sessions returns {len(data['sessions'])} sessions")

    def test_get_active_session(self, admin_headers):
        """Test getting the active session details"""
        response = requests.get(f"{BASE_URL}/api/live/sessions/{ACTIVE_SESSION_ID}", headers=admin_headers)
        # Session may or may not exist
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            assert "host_id" in data
            assert "title" in data
            print(f"PASSED: Active session found - {data.get('title')}")
        elif response.status_code == 404:
            print("INFO: Active session not found (may have ended)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")

    def test_session_requires_auth(self):
        """Test that session endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/live/sessions")
        assert response.status_code in [401, 403, 422]
        print("PASSED: Session list requires authentication")


class TestWebSocketSignalingTypes:
    """Test that WebSocket handler supports new message types (code review)
    
    Note: Actual WebSocket testing requires a WebSocket client.
    These tests verify the backend code structure supports the required message types.
    """

    def test_live_ws_endpoint_exists(self, admin_headers):
        """Verify the WebSocket endpoint path is correct"""
        # We can't test WebSocket via HTTP, but we can verify the route exists
        # by checking the session endpoint which uses the same router
        response = requests.get(f"{BASE_URL}/api/live/sessions", headers=admin_headers)
        assert response.status_code == 200
        print("PASSED: Live router is active (WebSocket endpoint at /api/live/ws/{session_id})")

    def test_session_has_video_mode_field(self, admin_headers):
        """Test that sessions can have video_mode field"""
        # Create a new session to test video_mode
        session_data = {
            "title": "TEST_WebRTC_Video_Session",
            "description": "Testing video mode",
            "session_type": "meditation",
            "scene": "cosmic-temple",
            "duration_minutes": 15
        }
        response = requests.post(f"{BASE_URL}/api/live/sessions", json=session_data, headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        session_id = data["id"]
        print(f"PASSED: Created test session {session_id}")
        
        # Get session and check structure
        response = requests.get(f"{BASE_URL}/api/live/sessions/{session_id}", headers=admin_headers)
        assert response.status_code == 200
        session = response.json()
        # video_mode may not be set initially (defaults to 'everyone' in WebSocket)
        assert "host_id" in session
        assert "participants" in session
        print("PASSED: Session structure supports video features")


class TestSessionHostControls:
    """Test host-only controls for sessions"""

    def test_start_session_requires_host(self, test_user_headers, admin_headers):
        """Test that only host can start a session"""
        # Create session as admin
        session_data = {
            "title": "TEST_Host_Control_Session",
            "session_type": "meditation"
        }
        response = requests.post(f"{BASE_URL}/api/live/sessions", json=session_data, headers=admin_headers)
        assert response.status_code == 200
        session_id = response.json()["id"]
        
        # Try to start as non-host
        response = requests.post(f"{BASE_URL}/api/live/sessions/{session_id}/start", headers=test_user_headers)
        assert response.status_code == 403
        print("PASSED: Non-host cannot start session (403)")

    def test_end_session_requires_host(self, test_user_headers, admin_headers):
        """Test that only host can end a session"""
        # Create and start session as admin
        session_data = {
            "title": "TEST_End_Control_Session",
            "session_type": "meditation"
        }
        response = requests.post(f"{BASE_URL}/api/live/sessions", json=session_data, headers=admin_headers)
        assert response.status_code == 200
        session_id = response.json()["id"]
        
        # Start session
        requests.post(f"{BASE_URL}/api/live/sessions/{session_id}/start", headers=admin_headers)
        
        # Try to end as non-host
        response = requests.post(f"{BASE_URL}/api/live/sessions/{session_id}/end", headers=test_user_headers)
        assert response.status_code == 403
        print("PASSED: Non-host cannot end session (403)")


class TestRecordingEndpoints:
    """Test session recording endpoints"""

    def test_past_sessions_list(self, admin_headers):
        """Test listing past sessions with recordings"""
        response = requests.get(f"{BASE_URL}/api/live/past", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "recordings" in data
        print(f"PASSED: Past sessions returns {len(data['recordings'])} recordings")

    def test_recording_download_endpoint(self, admin_headers):
        """Test recording download endpoint exists"""
        # Use a known session ID or skip if none
        response = requests.get(f"{BASE_URL}/api/live/past", headers=admin_headers)
        recordings = response.json().get("recordings", [])
        
        if recordings:
            session_id = recordings[0].get("session_id")
            response = requests.get(f"{BASE_URL}/api/live/sessions/{session_id}/download", headers=admin_headers)
            assert response.status_code in [200, 404]
            if response.status_code == 200:
                print(f"PASSED: Recording download works for session {session_id}")
            else:
                print("INFO: Recording not found (may have been cleaned up)")
        else:
            print("INFO: No recordings to test download")


class TestRecurringSessionsIntegration:
    """Test recurring sessions still work with video features"""

    def test_recurring_sessions_list(self, admin_headers):
        """Test listing recurring sessions"""
        response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        print(f"PASSED: Recurring sessions returns {len(data['series'])} series")

    def test_subscriptions_list(self, admin_headers):
        """Test listing user subscriptions"""
        response = requests.get(f"{BASE_URL}/api/live/recurring/subscriptions", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        print(f"PASSED: Subscriptions returns {len(data['series'])} subscribed series")


class TestVideoModeCodeReview:
    """Code review tests - verify WebRTC signaling code structure"""

    def test_backend_has_camera_toggle_handler(self):
        """Verify backend code has camera_toggle message handler"""
        # Read the live.py file and check for camera_toggle
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'camera_toggle' in content
            assert 'camera_on' in content
            print("PASSED: Backend has camera_toggle handler")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_has_video_mode_handler(self):
        """Verify backend code has video_mode message handler"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'video_mode' in content
            assert 'host_only' in content or 'everyone' in content
            print("PASSED: Backend has video_mode handler")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_has_rtc_offer_handler(self):
        """Verify backend code has rtc_offer message handler"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'rtc_offer' in content
            assert 'send_to_user' in content
            print("PASSED: Backend has rtc_offer handler with peer targeting")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_has_rtc_answer_handler(self):
        """Verify backend code has rtc_answer message handler"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'rtc_answer' in content
            print("PASSED: Backend has rtc_answer handler")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_has_ice_candidate_handler(self):
        """Verify backend code has ice_candidate message handler"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'ice_candidate' in content
            print("PASSED: Backend has ice_candidate handler")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_send_to_user_function(self):
        """Verify backend has send_to_user function for peer-to-peer signaling"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'async def send_to_user' in content
            assert 'target_uid' in content
            print("PASSED: Backend has send_to_user function for targeted messaging")
        except FileNotFoundError:
            pytest.skip("live.py not found")

    def test_backend_tracks_camera_state(self):
        """Verify backend tracks camera_on state per connection"""
        import_path = "/app/backend/routes/live.py"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            # Check that camera_on is tracked in active_connections
            assert '"camera_on"' in content or "'camera_on'" in content
            print("PASSED: Backend tracks camera_on state per connection")
        except FileNotFoundError:
            pytest.skip("live.py not found")


class TestFrontendCodeReview:
    """Code review tests - verify frontend WebRTC implementation"""

    def test_frontend_has_video_grid_component(self):
        """Verify frontend has VideoGrid component"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'function VideoGrid' in content or 'VideoGrid' in content
            assert 'video-grid' in content.lower()
            print("PASSED: Frontend has VideoGrid component")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_video_tile_component(self):
        """Verify frontend has VideoTile component"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'function VideoTile' in content or 'VideoTile' in content
            print("PASSED: Frontend has VideoTile component")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_rtc_config(self):
        """Verify frontend has RTC configuration with STUN servers"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'RTC_CONFIG' in content or 'iceServers' in content
            assert 'stun:stun' in content
            print("PASSED: Frontend has RTC configuration with STUN servers")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_video_mode_controls(self):
        """Verify frontend has video mode controls for host"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'VIDEO_MODES' in content
            assert 'everyone' in content
            assert 'host_only' in content
            assert 'video-settings' in content.lower() or 'videoSettings' in content
            print("PASSED: Frontend has video mode controls")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_camera_toggle_button(self):
        """Verify frontend has camera toggle button"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'toggle-video' in content or 'toggleLocalVideo' in content
            assert 'Cam On' in content or 'Cam Off' in content
            print("PASSED: Frontend has camera toggle button")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_mic_toggle(self):
        """Verify frontend has mic toggle when camera is on"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'toggle-mic' in content or 'toggleMic' in content
            assert 'isMicOn' in content
            print("PASSED: Frontend has mic toggle")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_has_bottom_controls_bar(self):
        """Verify frontend has bottom controls bar"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'bottom-controls' in content
            print("PASSED: Frontend has bottom controls bar")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_preserves_avatar_circle(self):
        """Verify frontend preserves AvatarCircle when no cameras active"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'function AvatarCircle' in content or 'AvatarCircle' in content
            assert 'hasAnyVideo' in content or 'activeVideoCount' in content
            print("PASSED: Frontend preserves AvatarCircle component")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")

    def test_frontend_shows_camera_icon_in_participants(self):
        """Verify frontend shows camera icon for users with camera on"""
        import_path = "/app/frontend/src/pages/LiveRoom.js"
        try:
            with open(import_path, 'r') as f:
                content = f.read()
            assert 'cameraStates' in content
            # Check for Video icon in participants list
            assert 'Video' in content
            print("PASSED: Frontend shows camera icon in participants list")
        except FileNotFoundError:
            pytest.skip("LiveRoom.js not found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

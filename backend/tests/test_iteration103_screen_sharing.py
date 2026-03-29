"""
Iteration 103: Screen Sharing Tests
Tests for WebRTC screen sharing feature in live sessions.
Features: screen_share WebSocket message, screen_sharing state tracking, UI controls
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
TEST_USER_EMAIL = "test@test.com"
TEST_USER_PASSWORD = "password"
ACTIVE_SESSION_ID = "7411b23d-167d-435b-858a-a372aa7e3c4f"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin login failed")


@pytest.fixture(scope="module")
def test_user_token():
    """Get test user auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Test user login failed")


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture
def user_headers(test_user_token):
    return {"Authorization": f"Bearer {test_user_token}", "Content-Type": "application/json"}


# ─── Backend API Tests ───

class TestLiveSessionAPIs:
    """Test existing live session APIs still work"""
    
    def test_health_check(self):
        """API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        assert response.json().get("status") == "ok"
        print("PASSED: Health check")
    
    def test_get_session_types(self, admin_headers):
        """Get session types endpoint"""
        response = requests.get(f"{BASE_URL}/api/live/session-types", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "types" in data
        assert "scenes" in data
        print("PASSED: Session types endpoint")
    
    def test_list_sessions(self, admin_headers):
        """List live sessions"""
        response = requests.get(f"{BASE_URL}/api/live/sessions", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        print(f"PASSED: List sessions - found {len(data['sessions'])} sessions")
    
    def test_get_active_session(self, admin_headers):
        """Get the active test session"""
        response = requests.get(f"{BASE_URL}/api/live/sessions/{ACTIVE_SESSION_ID}", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("id") == ACTIVE_SESSION_ID
        print(f"PASSED: Get active session - title: {data.get('title')}")
    
    def test_session_requires_auth(self):
        """Session endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/live/sessions")
        assert response.status_code in [401, 403, 422]
        print("PASSED: Session requires auth")


class TestWebSocketScreenShareSignaling:
    """Test backend code has screen_share message handler"""
    
    def test_backend_has_screen_share_handler(self):
        """Verify backend has screen_share message type handler"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        # Check for screen_share message handler
        assert 'elif msg_type == "screen_share":' in content or "elif msg_type == 'screen_share':" in content
        print("PASSED: Backend has screen_share message handler")
    
    def test_backend_tracks_screen_sharing_state(self):
        """Verify backend tracks screen_sharing state per connection"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        # Check that screen_sharing is tracked in active_connections
        assert '"screen_sharing"' in content or "'screen_sharing'" in content
        assert 'active_connections[session_id][user_id]["screen_sharing"]' in content
        print("PASSED: Backend tracks screen_sharing state")
    
    def test_backend_broadcasts_screen_share(self):
        """Verify backend broadcasts screen_share to all participants"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        # Check for broadcast of screen_share message
        assert 'await broadcast_to_session(session_id, {' in content
        assert '"type": "screen_share"' in content or "'type': 'screen_share'" in content
        print("PASSED: Backend broadcasts screen_share")
    
    def test_backend_includes_screen_sharing_in_participant_data(self):
        """Verify screen_sharing is included in participant data on connect"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        # Check that participants list includes screen_sharing
        assert '"screen_sharing": data.get("screen_sharing"' in content or "'screen_sharing': data.get('screen_sharing'" in content
        print("PASSED: Backend includes screen_sharing in participant data")
    
    def test_backend_has_camera_toggle_handler(self):
        """Verify camera_toggle handler exists"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        assert 'elif msg_type == "camera_toggle":' in content or "elif msg_type == 'camera_toggle':" in content
        print("PASSED: Backend has camera_toggle handler")
    
    def test_backend_has_video_mode_handler(self):
        """Verify video_mode handler exists (host-only)"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        assert 'elif msg_type == "video_mode":' in content or "elif msg_type == 'video_mode':" in content
        print("PASSED: Backend has video_mode handler")
    
    def test_backend_has_rtc_signaling_handlers(self):
        """Verify RTC signaling handlers exist"""
        with open("/app/backend/routes/live.py", "r") as f:
            content = f.read()
        
        assert 'elif msg_type == "rtc_offer":' in content
        assert 'elif msg_type == "rtc_answer":' in content
        assert 'elif msg_type == "ice_candidate":' in content
        print("PASSED: Backend has RTC signaling handlers")


class TestFrontendScreenShareCode:
    """Test frontend code has screen sharing implementation"""
    
    def test_frontend_has_screen_share_button(self):
        """Verify Share Screen button exists in LiveRoom"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="toggle-screen-share"' in content
        assert 'Share Screen' in content
        print("PASSED: Frontend has Share Screen button")
    
    def test_frontend_has_screen_share_state(self):
        """Verify screen sharing state management"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'isScreenSharing' in content
        assert 'setIsScreenSharing' in content
        assert 'screenSharer' in content
        assert 'setScreenSharer' in content
        print("PASSED: Frontend has screen sharing state")
    
    def test_frontend_has_start_screen_share_function(self):
        """Verify startScreenShare function exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'const startScreenShare' in content
        assert 'getDisplayMedia' in content
        print("PASSED: Frontend has startScreenShare function")
    
    def test_frontend_has_stop_screen_share_function(self):
        """Verify stopScreenShare function exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'const stopScreenShare' in content
        print("PASSED: Frontend has stopScreenShare function")
    
    def test_frontend_has_screen_share_tile_component(self):
        """Verify ScreenShareTile component exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'function ScreenShareTile' in content
        assert 'data-testid="screen-share-tile"' in content
        assert 'SCREEN SHARE' in content
        print("PASSED: Frontend has ScreenShareTile component")
    
    def test_frontend_handles_screen_share_websocket_message(self):
        """Verify frontend handles screen_share WebSocket message"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert "case 'screen_share':" in content
        assert 'setScreenSharer' in content
        print("PASSED: Frontend handles screen_share WebSocket message")
    
    def test_frontend_sends_screen_share_message(self):
        """Verify frontend sends screen_share message via WebSocket"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert "type: 'screen_share'" in content
        assert "sharing: true" in content
        assert "sharing: false" in content
        print("PASSED: Frontend sends screen_share WebSocket message")


class TestFrontendBottomControls:
    """Test bottom controls bar has all required buttons"""
    
    def test_frontend_has_bottom_controls_bar(self):
        """Verify bottom controls bar exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="bottom-controls"' in content
        print("PASSED: Frontend has bottom controls bar")
    
    def test_frontend_has_camera_toggle(self):
        """Verify camera toggle button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="toggle-video"' in content
        assert 'Cam On' in content
        assert 'Cam Off' in content
        print("PASSED: Frontend has camera toggle")
    
    def test_frontend_has_mic_toggle(self):
        """Verify mic toggle button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="toggle-mic"' in content
        print("PASSED: Frontend has mic toggle")
    
    def test_frontend_has_all_host_commands(self):
        """Verify all host command buttons exist"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check that host commands are rendered with data-testid using template literal
        assert 'data-testid={`host-cmd-${cmd.id}`}' in content
        
        # Check all host command IDs are defined
        host_commands = ['begin', 'breathe_in', 'breathe_out', 'hold', 'focus', 'release', 'om', 'end_practice']
        for cmd in host_commands:
            assert f"id: '{cmd}'" in content, f"Missing host command: {cmd}"
        print("PASSED: Frontend has all host commands")
    
    def test_frontend_has_recording_button(self):
        """Verify recording button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="toggle-recording"' in content
        assert 'Record' in content
        print("PASSED: Frontend has recording button")
    
    def test_frontend_has_end_session_button(self):
        """Verify end session button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="end-session-btn"' in content
        print("PASSED: Frontend has end session button")


class TestFrontendVideoSettings:
    """Test video settings dropdown with 3 modes"""
    
    def test_frontend_has_video_settings_button(self):
        """Verify video settings button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="video-settings-btn"' in content
        print("PASSED: Frontend has video settings button")
    
    def test_frontend_has_video_settings_dropdown(self):
        """Verify video settings dropdown exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="video-settings-dropdown"' in content
        print("PASSED: Frontend has video settings dropdown")
    
    def test_frontend_has_three_video_modes(self):
        """Verify all three video modes exist"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check that video modes are rendered with data-testid using template literal
        assert 'data-testid={`video-mode-${key}`}' in content
        
        # Check all video mode keys are defined
        assert "everyone:" in content
        assert "host_only:" in content
        assert "off:" in content
        print("PASSED: Frontend has three video modes")
    
    def test_frontend_video_modes_have_descriptions(self):
        """Verify video modes have descriptions"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'All participants can share video' in content
        assert 'Only host can share video' in content
        assert 'No video in this session' in content
        print("PASSED: Frontend video modes have descriptions")


class TestFrontendParticipantsPanel:
    """Test participants panel shows camera and screen share icons"""
    
    def test_frontend_shows_camera_icon_for_participants(self):
        """Verify camera icon shows for participants with camera on"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check that Video icon is shown when cameraStates[p.user_id] is true
        assert 'cameraStates[p.user_id]' in content
        assert '<Video size=' in content
        print("PASSED: Frontend shows camera icon for participants")
    
    def test_frontend_shows_screen_share_icon_for_participants(self):
        """Verify screen share icon shows for participant sharing screen"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check that Monitor icon is shown when screenSharer === p.user_id
        assert 'screenSharer === p.user_id' in content
        assert '<Monitor size=' in content
        print("PASSED: Frontend shows screen share icon for participants")


class TestFrontendVideoModeRestrictions:
    """Test video mode restrictions are enforced"""
    
    def test_frontend_respects_video_off_mode(self):
        """Verify video controls are hidden when mode is 'off'"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check that canShareVideo is false when mode is 'off'
        assert "videoMode === 'everyone'" in content
        assert "videoMode === 'host_only'" in content
        assert 'canShareVideo' in content
        print("PASSED: Frontend respects video off mode")
    
    def test_frontend_respects_host_only_mode(self):
        """Verify non-host cannot share video in host_only mode"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check canShareVideo logic
        assert "const canShareVideo = videoMode === 'everyone' || (videoMode === 'host_only' && isHost)" in content
        print("PASSED: Frontend respects host_only mode")


class TestFrontendChatAndReactions:
    """Test chat and reactions still work"""
    
    def test_frontend_has_chat_input(self):
        """Verify chat input exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="chat-input"' in content
        print("PASSED: Frontend has chat input")
    
    def test_frontend_has_chat_send_button(self):
        """Verify chat send button exists"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'data-testid="chat-send"' in content
        print("PASSED: Frontend has chat send button")
    
    def test_frontend_has_reactions(self):
        """Verify reactions exist"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        assert 'REACTIONS' in content
        assert 'sendReaction' in content
        print("PASSED: Frontend has reactions")


class TestFrontendVideoModeBadge:
    """Test video mode badge in top bar"""
    
    def test_frontend_shows_video_mode_badge(self):
        """Verify video mode badge is shown in top bar"""
        with open("/app/frontend/src/pages/LiveRoom.js", "r") as f:
            content = f.read()
        
        # Check for video mode indicator in top bar
        assert 'VIDEO_MODES[videoMode]?.label' in content
        print("PASSED: Frontend shows video mode badge")


class TestRecordingAndPastSessions:
    """Test recording and past sessions APIs"""
    
    def test_past_sessions_list(self, admin_headers):
        """List past sessions with recordings"""
        response = requests.get(f"{BASE_URL}/api/live/past", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "recordings" in data
        print(f"PASSED: Past sessions list - found {len(data['recordings'])} recordings")
    
    def test_recurring_sessions_list(self, admin_headers):
        """List recurring sessions"""
        response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        print(f"PASSED: Recurring sessions list - found {len(data['series'])} series")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

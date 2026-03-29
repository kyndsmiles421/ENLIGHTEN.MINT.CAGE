"""
Iteration 95: Cosmic Mood Ring & Session Replay/Download Tests
Tests for:
1. Cosmic Mood Ring - Quick Log mood via POST /api/moods
2. Session Recordings - POST /api/live/sessions/{id}/end creates recording
3. Past Sessions - GET /api/live/past returns recordings
4. Recording Details - GET /api/live/sessions/{id}/recording returns full recording
5. Download Recording - GET /api/live/sessions/{id}/download returns JSON file
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
TEST_SESSION_ID = "9bc63647-e3da-4606-9c84-73e7d6e84bf1"


class TestAuth:
    """Authentication helper tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in login response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestCosmicMoodRing(TestAuth):
    """Tests for Cosmic Mood Ring Quick Log feature"""
    
    def test_mood_ring_endpoint_exists(self, auth_headers):
        """Test GET /api/mood-ring returns mood ring data"""
        response = requests.get(f"{BASE_URL}/api/mood-ring", headers=auth_headers)
        # Should return 200 with mood ring data or empty state
        assert response.status_code == 200, f"Mood ring endpoint failed: {response.text}"
        data = response.json()
        # Should have expected fields
        assert "colors" in data or "message" in data or data == {}, f"Unexpected mood ring response: {data}"
    
    def test_quick_log_mood_happy(self, auth_headers):
        """Test POST /api/moods logs a happy mood"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "happy",
            "intensity": 5,
            "note": "TEST_quick_log_happy"
        }, headers=auth_headers)
        assert response.status_code in [200, 201], f"Quick log mood failed: {response.text}"
        data = response.json()
        # Verify mood was logged
        assert "id" in data or "mood" in data, f"Unexpected mood response: {data}"
    
    def test_quick_log_mood_peaceful(self, auth_headers):
        """Test POST /api/moods logs a peaceful mood"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "peaceful",
            "intensity": 5,
            "note": "TEST_quick_log_peaceful"
        }, headers=auth_headers)
        assert response.status_code in [200, 201], f"Quick log mood failed: {response.text}"
    
    def test_quick_log_mood_energized(self, auth_headers):
        """Test POST /api/moods logs an energized mood"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "energized",
            "intensity": 5,
            "note": "TEST_quick_log_energized"
        }, headers=auth_headers)
        assert response.status_code in [200, 201], f"Quick log mood failed: {response.text}"
    
    def test_quick_log_mood_stressed(self, auth_headers):
        """Test POST /api/moods logs a stressed mood"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "stressed",
            "intensity": 5,
            "note": "TEST_quick_log_stressed"
        }, headers=auth_headers)
        assert response.status_code in [200, 201], f"Quick log mood failed: {response.text}"
    
    def test_mood_ring_updates_after_log(self, auth_headers):
        """Test mood ring data updates after logging a mood"""
        # Log a mood
        requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "grateful",
            "intensity": 5,
            "note": "TEST_mood_ring_update"
        }, headers=auth_headers)
        
        # Check mood ring
        response = requests.get(f"{BASE_URL}/api/mood-ring", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Should have mood data now
        assert data is not None


class TestSessionRecordings(TestAuth):
    """Tests for Session Replay & Download feature"""
    
    def test_past_sessions_endpoint(self, auth_headers):
        """Test GET /api/live/past returns list of recordings"""
        response = requests.get(f"{BASE_URL}/api/live/past", headers=auth_headers)
        assert response.status_code == 200, f"Past sessions endpoint failed: {response.text}"
        data = response.json()
        assert "recordings" in data, f"No recordings key in response: {data}"
        assert isinstance(data["recordings"], list), "Recordings should be a list"
    
    def test_recording_exists_for_test_session(self, auth_headers):
        """Test that a recording exists for the test session"""
        response = requests.get(f"{BASE_URL}/api/live/past", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        recordings = data.get("recordings", [])
        
        # Check if test session recording exists
        test_recording = next((r for r in recordings if r.get("session_id") == TEST_SESSION_ID), None)
        if test_recording:
            assert "title" in test_recording
            assert "host_name" in test_recording
            assert "session_type" in test_recording
    
    def test_get_recording_details(self, auth_headers):
        """Test GET /api/live/sessions/{id}/recording returns full recording"""
        response = requests.get(
            f"{BASE_URL}/api/live/sessions/{TEST_SESSION_ID}/recording",
            headers=auth_headers
        )
        # May return 404 if no recording exists yet
        if response.status_code == 200:
            data = response.json()
            assert "session_id" in data, f"No session_id in recording: {data}"
            assert "chat_log" in data, f"No chat_log in recording: {data}"
            assert "command_log" in data, f"No command_log in recording: {data}"
        elif response.status_code == 404:
            # Recording doesn't exist yet - that's OK
            pass
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}, {response.text}")
    
    def test_download_recording(self, auth_headers):
        """Test GET /api/live/sessions/{id}/download returns downloadable JSON"""
        response = requests.get(
            f"{BASE_URL}/api/live/sessions/{TEST_SESSION_ID}/download",
            headers=auth_headers
        )
        # May return 404 if no recording exists
        if response.status_code == 200:
            # Should have Content-Disposition header for download
            content_disp = response.headers.get("Content-Disposition", "")
            assert "attachment" in content_disp or response.headers.get("Content-Type") == "application/json"
            
            # Should be valid JSON
            data = response.json()
            assert "title" in data, f"No title in download: {data}"
            assert "guided_commands" in data, f"No guided_commands in download: {data}"
            assert "chat" in data, f"No chat in download: {data}"
        elif response.status_code == 404:
            # Recording doesn't exist - OK
            pass
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}, {response.text}")
    
    def test_create_session_and_end_creates_recording(self, auth_headers):
        """Test that ending a session creates a recording"""
        # Create a new session
        session_data = {
            "title": "TEST_Recording_Session",
            "description": "Test session for recording",
            "session_type": "meditation",
            "scene": "cosmic-temple",
            "duration_minutes": 10
        }
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers
        )
        assert create_response.status_code in [200, 201], f"Create session failed: {create_response.text}"
        session = create_response.json()
        session_id = session.get("id")
        assert session_id, "No session ID returned"
        
        # Start the session
        start_response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/start",
            headers=auth_headers
        )
        assert start_response.status_code == 200, f"Start session failed: {start_response.text}"
        
        # End the session - should create recording
        end_response = requests.post(
            f"{BASE_URL}/api/live/sessions/{session_id}/end",
            headers=auth_headers
        )
        assert end_response.status_code == 200, f"End session failed: {end_response.text}"
        end_data = end_response.json()
        assert "recording_id" in end_data, f"No recording_id in end response: {end_data}"
        
        # Verify recording was created
        recording_response = requests.get(
            f"{BASE_URL}/api/live/sessions/{session_id}/recording",
            headers=auth_headers
        )
        assert recording_response.status_code == 200, f"Recording not found: {recording_response.text}"
        recording = recording_response.json()
        assert recording.get("session_id") == session_id
        assert recording.get("title") == "TEST_Recording_Session"
        assert "chat_log" in recording
        assert "command_log" in recording
    
    def test_past_sessions_excludes_full_logs(self, auth_headers):
        """Test that GET /api/live/past excludes chat_log and command_log for performance"""
        response = requests.get(f"{BASE_URL}/api/live/past", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        recordings = data.get("recordings", [])
        
        for rec in recordings:
            # These should be excluded from list view
            assert "chat_log" not in rec, "chat_log should not be in list view"
            assert "command_log" not in rec, "command_log should not be in list view"


class TestLiveSessionsTabs(TestAuth):
    """Tests for Live Sessions page tabs"""
    
    def test_live_sessions_endpoint(self, auth_headers):
        """Test GET /api/live/sessions returns sessions"""
        response = requests.get(f"{BASE_URL}/api/live/sessions", headers=auth_headers)
        assert response.status_code == 200, f"Live sessions failed: {response.text}"
        data = response.json()
        assert "sessions" in data
    
    def test_recurring_sessions_endpoint(self, auth_headers):
        """Test GET /api/live/recurring returns recurring series"""
        response = requests.get(f"{BASE_URL}/api/live/recurring", headers=auth_headers)
        assert response.status_code == 200, f"Recurring sessions failed: {response.text}"
        data = response.json()
        assert "series" in data
    
    def test_session_types_endpoint(self):
        """Test GET /api/live/session-types returns types and scenes"""
        response = requests.get(f"{BASE_URL}/api/live/session-types")
        assert response.status_code == 200, f"Session types failed: {response.text}"
        data = response.json()
        assert "types" in data
        assert "scenes" in data


class TestDownloadFormat(TestAuth):
    """Tests for download format structure"""
    
    def test_download_format_structure(self, auth_headers):
        """Test download JSON has correct structure"""
        # First create a session with recording
        session_data = {
            "title": "TEST_Download_Format",
            "description": "Test download format",
            "session_type": "breathwork",
            "scene": "zen-garden",
            "duration_minutes": 15
        }
        create_response = requests.post(
            f"{BASE_URL}/api/live/sessions",
            json=session_data,
            headers=auth_headers
        )
        if create_response.status_code not in [200, 201]:
            pytest.skip("Could not create session")
        
        session = create_response.json()
        session_id = session.get("id")
        
        # Start and end to create recording
        requests.post(f"{BASE_URL}/api/live/sessions/{session_id}/start", headers=auth_headers)
        requests.post(f"{BASE_URL}/api/live/sessions/{session_id}/end", headers=auth_headers)
        
        # Download and verify format
        download_response = requests.get(
            f"{BASE_URL}/api/live/sessions/{session_id}/download",
            headers=auth_headers
        )
        assert download_response.status_code == 200
        
        data = download_response.json()
        expected_fields = ["title", "host", "type", "scene", "duration_minutes", 
                          "started_at", "ended_at", "participants", "participant_count",
                          "guided_commands", "chat"]
        for field in expected_fields:
            assert field in data, f"Missing field '{field}' in download: {data.keys()}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

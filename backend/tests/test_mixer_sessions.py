"""
Test Mixer Session Recording Endpoints (Soundscapes)
- POST /api/mixer-presets/sessions — Save a soundscape with snapshot
- GET /api/mixer-presets/sessions — List user's saved soundscapes
- GET /api/mixer-presets/sessions/community — List public soundscapes
- DELETE /api/mixer-presets/sessions/{id} — Delete a soundscape
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMixerSessionsEndpoints:
    """Test the new mixer session recording (soundscapes) endpoints"""
    
    created_session_id = None
    
    def test_01_save_session_private(self, auth_headers):
        """POST /api/mixer-presets/sessions — Save a private soundscape"""
        test_snapshot = {
            "activeFreqs": [528, 432],
            "activeSounds": ["rain", "ocean"],
            "activeDrones": ["sitar-drone"],
            "activeMantra": None,
            "channelVols": {"freq-528": 75, "freq-432": 60, "sound-rain": 80},
            "masterVol": 70,
            "voiceMorph": {"pitch": 0, "reverb": 20}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/mixer-presets/sessions",
            json={
                "name": f"TEST_Private_Soundscape_{uuid.uuid4().hex[:8]}",
                "description": "Test private soundscape",
                "snapshot": test_snapshot,
                "is_public": False
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response should contain 'id'"
        assert "name" in data, "Response should contain 'name'"
        assert "snapshot" in data, "Response should contain 'snapshot'"
        assert "creator_id" in data, "Response should contain 'creator_id'"
        assert data["is_public"] == False, "Should be private"
        
        # Verify snapshot was saved correctly
        assert data["snapshot"]["activeFreqs"] == [528, 432]
        assert data["snapshot"]["activeSounds"] == ["rain", "ocean"]
        
        # Store for later tests
        TestMixerSessionsEndpoints.created_session_id = data["id"]
        print(f"Created private session: {data['id']}")
    
    def test_02_save_session_public(self, auth_headers):
        """POST /api/mixer-presets/sessions — Save a public soundscape"""
        test_snapshot = {
            "activeFreqs": [963],
            "activeSounds": ["singing-bowl"],
            "activeDrones": [],
            "activeMantra": "om",
            "channelVols": {"freq-963": 65},
            "masterVol": 75,
            "voiceMorph": {"pitch": 0, "reverb": 30}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/mixer-presets/sessions",
            json={
                "name": f"TEST_Public_Soundscape_{uuid.uuid4().hex[:8]}",
                "description": "Test public soundscape for community",
                "snapshot": test_snapshot,
                "is_public": True
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["is_public"] == True, "Should be public"
        assert "creator_name" in data, "Should have creator_name"
        print(f"Created public session: {data['id']}")
    
    def test_03_get_my_sessions(self, auth_headers):
        """GET /api/mixer-presets/sessions — List user's saved soundscapes"""
        response = requests.get(
            f"{BASE_URL}/api/mixer-presets/sessions",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should return an array
        assert isinstance(data, list), "Response should be a list"
        
        # Should contain our created session
        if TestMixerSessionsEndpoints.created_session_id:
            session_ids = [s["id"] for s in data]
            assert TestMixerSessionsEndpoints.created_session_id in session_ids, \
                "Created session should be in user's sessions list"
        
        # Verify structure of returned sessions
        if len(data) > 0:
            session = data[0]
            assert "id" in session
            assert "name" in session
            assert "snapshot" in session
            assert "created_at" in session
        
        print(f"User has {len(data)} saved soundscapes")
    
    def test_04_get_community_sessions(self):
        """GET /api/mixer-presets/sessions/community — List public soundscapes (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/sessions/community")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should return an array
        assert isinstance(data, list), "Response should be a list"
        
        # All returned sessions should be public
        for session in data:
            assert session.get("is_public") == True, "Community sessions should all be public"
        
        print(f"Community has {len(data)} public soundscapes")
    
    def test_05_get_single_session(self, auth_headers):
        """GET /api/mixer-presets/sessions/{id} — Get a specific session"""
        if not TestMixerSessionsEndpoints.created_session_id:
            pytest.skip("No session created to fetch")
        
        response = requests.get(
            f"{BASE_URL}/api/mixer-presets/sessions/{TestMixerSessionsEndpoints.created_session_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["id"] == TestMixerSessionsEndpoints.created_session_id
        assert "snapshot" in data
        print(f"Fetched session: {data['name']}")
    
    def test_06_like_session(self, auth_headers):
        """POST /api/mixer-presets/sessions/{id}/like — Toggle like on a session"""
        if not TestMixerSessionsEndpoints.created_session_id:
            pytest.skip("No session created to like")
        
        response = requests.post(
            f"{BASE_URL}/api/mixer-presets/sessions/{TestMixerSessionsEndpoints.created_session_id}/like",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "liked" in data, "Response should contain 'liked' boolean"
        assert "like_count" in data, "Response should contain 'like_count'"
        print(f"Like toggled: liked={data['liked']}, count={data['like_count']}")
    
    def test_07_delete_session(self, auth_headers):
        """DELETE /api/mixer-presets/sessions/{id} — Delete a soundscape"""
        if not TestMixerSessionsEndpoints.created_session_id:
            pytest.skip("No session created to delete")
        
        response = requests.delete(
            f"{BASE_URL}/api/mixer-presets/sessions/{TestMixerSessionsEndpoints.created_session_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("deleted") == True, "Response should confirm deletion"
        print(f"Deleted session: {TestMixerSessionsEndpoints.created_session_id}")
    
    def test_08_verify_deletion(self, auth_headers):
        """Verify the deleted session is no longer in user's list"""
        if not TestMixerSessionsEndpoints.created_session_id:
            pytest.skip("No session was created/deleted")
        
        response = requests.get(
            f"{BASE_URL}/api/mixer-presets/sessions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        session_ids = [s["id"] for s in data]
        assert TestMixerSessionsEndpoints.created_session_id not in session_ids, \
            "Deleted session should not be in user's sessions list"
        print("Verified session was deleted")
    
    def test_09_delete_nonexistent_session(self, auth_headers):
        """DELETE /api/mixer-presets/sessions/{id} — Should return 404 for non-existent session"""
        fake_id = f"nonexistent-{uuid.uuid4().hex}"
        
        response = requests.delete(
            f"{BASE_URL}/api/mixer-presets/sessions/{fake_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returned 404 for non-existent session")


class TestMixerSessionsAuth:
    """Test authentication requirements for session endpoints"""
    
    def test_save_session_requires_auth(self):
        """POST /api/mixer-presets/sessions — Should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/mixer-presets/sessions",
            json={"name": "Test", "snapshot": {}}
        )
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], \
            f"Expected auth error, got {response.status_code}"
        print("Save session correctly requires auth")
    
    def test_get_my_sessions_requires_auth(self):
        """GET /api/mixer-presets/sessions — Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/sessions")
        
        assert response.status_code in [401, 403, 422], \
            f"Expected auth error, got {response.status_code}"
        print("Get my sessions correctly requires auth")
    
    def test_community_sessions_no_auth_required(self):
        """GET /api/mixer-presets/sessions/community — Should NOT require authentication"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/sessions/community")
        
        assert response.status_code == 200, \
            f"Community endpoint should be public, got {response.status_code}"
        print("Community sessions correctly accessible without auth")
    
    def test_delete_session_requires_auth(self):
        """DELETE /api/mixer-presets/sessions/{id} — Should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/mixer-presets/sessions/some-id")
        
        assert response.status_code in [401, 403, 422], \
            f"Expected auth error, got {response.status_code}"
        print("Delete session correctly requires auth")


# Cleanup test data
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_sessions(auth_headers):
    """Clean up any TEST_ prefixed sessions after tests complete"""
    yield
    # Cleanup after all tests
    try:
        response = requests.get(
            f"{BASE_URL}/api/mixer-presets/sessions",
            headers=auth_headers
        )
        if response.status_code == 200:
            sessions = response.json()
            for session in sessions:
                if session.get("name", "").startswith("TEST_"):
                    requests.delete(
                        f"{BASE_URL}/api/mixer-presets/sessions/{session['id']}",
                        headers=auth_headers
                    )
                    print(f"Cleaned up test session: {session['name']}")
    except Exception as e:
        print(f"Cleanup error: {e}")

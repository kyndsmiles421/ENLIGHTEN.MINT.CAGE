"""
Iteration 105: Dance & Music Studio Backend Tests
Tests for:
- Custom background upload/delete endpoints
- Music recording CRUD endpoints
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"


class TestAuth:
    """Authentication for testing"""
    
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


class TestCustomBackgrounds(TestAuth):
    """Test custom background upload/delete endpoints"""
    
    def test_upload_background_success(self, auth_headers):
        """POST /api/backgrounds/upload - Upload a custom background image"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'image': ('test_bg.png', io.BytesIO(png_data), 'image/png')}
        response = requests.post(
            f"{BASE_URL}/api/backgrounds/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "No id in upload response"
        assert "url" in data, "No url in upload response"
        assert "name" in data, "No name in upload response"
        assert data["url"].startswith("/api/uploads/file/"), f"Invalid URL format: {data['url']}"
        
        # Store for cleanup
        TestCustomBackgrounds.uploaded_bg_id = data["id"]
        print(f"Uploaded background: {data}")
    
    def test_get_my_backgrounds(self, auth_headers):
        """GET /api/backgrounds/my - Get user's uploaded backgrounds"""
        response = requests.get(
            f"{BASE_URL}/api/backgrounds/my",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Get backgrounds failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "backgrounds" in data, "No backgrounds key in response"
        assert isinstance(data["backgrounds"], list), "backgrounds should be a list"
        
        # Verify our uploaded background is in the list
        if hasattr(TestCustomBackgrounds, 'uploaded_bg_id'):
            bg_ids = [bg["id"] for bg in data["backgrounds"]]
            assert TestCustomBackgrounds.uploaded_bg_id in bg_ids, "Uploaded background not found in list"
        
        print(f"Found {len(data['backgrounds'])} backgrounds")
    
    def test_delete_background_success(self, auth_headers):
        """DELETE /api/backgrounds/{id} - Delete a custom background"""
        if not hasattr(TestCustomBackgrounds, 'uploaded_bg_id'):
            pytest.skip("No background to delete")
        
        bg_id = TestCustomBackgrounds.uploaded_bg_id
        response = requests.delete(
            f"{BASE_URL}/api/backgrounds/{bg_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Delete failed: {response.text}"
        data = response.json()
        assert data.get("deleted") == True, "Delete response should confirm deletion"
        
        # Verify it's gone
        response = requests.get(
            f"{BASE_URL}/api/backgrounds/my",
            headers=auth_headers
        )
        data = response.json()
        bg_ids = [bg["id"] for bg in data.get("backgrounds", [])]
        assert bg_id not in bg_ids, "Background should be deleted"
        
        print(f"Successfully deleted background {bg_id}")
    
    def test_delete_nonexistent_background(self, auth_headers):
        """DELETE /api/backgrounds/{id} - Should return 404 for non-existent background"""
        response = requests.delete(
            f"{BASE_URL}/api/backgrounds/nonexistent-id-12345",
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_upload_requires_auth(self):
        """POST /api/backgrounds/upload - Should require authentication"""
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'image': ('test_bg.png', io.BytesIO(png_data), 'image/png')}
        response = requests.post(
            f"{BASE_URL}/api/backgrounds/upload",
            files=files
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestMusicRecordings(TestAuth):
    """Test music recording CRUD endpoints"""
    
    def test_save_recording_success(self, auth_headers):
        """POST /api/music/recordings - Save a music recording"""
        recording_data = {
            "title": "TEST_Sitar Session",
            "instrument": "sitar",
            "duration": 15.5,
            "notes": [
                {"noteIndex": 60, "freq": 261.63, "time": 0.0},
                {"noteIndex": 62, "freq": 293.66, "time": 0.5},
                {"noteIndex": 64, "freq": 329.63, "time": 1.0},
                {"noteIndex": 65, "freq": 349.23, "time": 1.5},
                {"noteIndex": 67, "freq": 392.00, "time": 2.0}
            ],
            "bpm": 120
        }
        
        response = requests.post(
            f"{BASE_URL}/api/music/recordings",
            headers=auth_headers,
            json=recording_data
        )
        
        assert response.status_code == 200, f"Save recording failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "No id in save response"
        assert "title" in data, "No title in save response"
        assert data["title"] == "TEST_Sitar Session", "Title mismatch"
        
        # Store for later tests
        TestMusicRecordings.created_recording_id = data["id"]
        print(f"Created recording: {data}")
    
    def test_get_my_recordings(self, auth_headers):
        """GET /api/music/recordings - Get user's recordings"""
        response = requests.get(
            f"{BASE_URL}/api/music/recordings",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Get recordings failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "recordings" in data, "No recordings key in response"
        assert isinstance(data["recordings"], list), "recordings should be a list"
        
        # Verify our created recording is in the list
        if hasattr(TestMusicRecordings, 'created_recording_id'):
            rec_ids = [rec["id"] for rec in data["recordings"]]
            assert TestMusicRecordings.created_recording_id in rec_ids, "Created recording not found in list"
        
        print(f"Found {len(data['recordings'])} recordings")
    
    def test_get_single_recording(self, auth_headers):
        """GET /api/music/recordings/{id} - Get a specific recording"""
        if not hasattr(TestMusicRecordings, 'created_recording_id'):
            pytest.skip("No recording to get")
        
        rec_id = TestMusicRecordings.created_recording_id
        response = requests.get(
            f"{BASE_URL}/api/music/recordings/{rec_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Get recording failed: {response.text}"
        data = response.json()
        
        # Verify recording data
        assert data.get("id") == rec_id, "Recording ID mismatch"
        assert data.get("title") == "TEST_Sitar Session", "Title mismatch"
        assert data.get("instrument") == "sitar", "Instrument mismatch"
        assert "notes" in data, "No notes in recording"
        assert len(data["notes"]) == 5, f"Expected 5 notes, got {len(data['notes'])}"
        
        print(f"Retrieved recording: {data['title']}")
    
    def test_get_nonexistent_recording(self, auth_headers):
        """GET /api/music/recordings/{id} - Should return 404 for non-existent recording"""
        response = requests.get(
            f"{BASE_URL}/api/music/recordings/nonexistent-id-12345",
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_delete_recording_success(self, auth_headers):
        """DELETE /api/music/recordings/{id} - Delete a recording"""
        if not hasattr(TestMusicRecordings, 'created_recording_id'):
            pytest.skip("No recording to delete")
        
        rec_id = TestMusicRecordings.created_recording_id
        response = requests.delete(
            f"{BASE_URL}/api/music/recordings/{rec_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Delete failed: {response.text}"
        data = response.json()
        assert data.get("deleted") == True, "Delete response should confirm deletion"
        
        # Verify it's gone
        response = requests.get(
            f"{BASE_URL}/api/music/recordings/{rec_id}",
            headers=auth_headers
        )
        assert response.status_code == 404, "Recording should be deleted"
        
        print(f"Successfully deleted recording {rec_id}")
    
    def test_delete_nonexistent_recording(self, auth_headers):
        """DELETE /api/music/recordings/{id} - Should return 404 for non-existent recording"""
        response = requests.delete(
            f"{BASE_URL}/api/music/recordings/nonexistent-id-12345",
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_save_recording_requires_auth(self):
        """POST /api/music/recordings - Should require authentication"""
        recording_data = {
            "title": "Unauthorized Recording",
            "instrument": "tabla",
            "duration": 5.0,
            "notes": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/music/recordings",
            json=recording_data
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestDanceMusicStudioPage:
    """Test that the Dance Music Studio page route exists"""
    
    def test_dance_music_page_loads(self):
        """GET /dance-music - Page should load"""
        response = requests.get(f"{BASE_URL}/dance-music")
        assert response.status_code == 200, f"Page failed to load: {response.status_code}"
        
        # Check for React app content
        assert "root" in response.text or "React" in response.text or "<!DOCTYPE html>" in response.text.lower()
        print("Dance Music Studio page loads successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

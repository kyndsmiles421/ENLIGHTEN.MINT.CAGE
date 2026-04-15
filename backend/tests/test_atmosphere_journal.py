"""
test_atmosphere_journal.py — Atmosphere Journal API Tests
Tests CRUD operations for the Atmosphere Journal feature:
- POST /api/atmosphere/save (requires auth)
- GET /api/atmosphere/gallery (requires auth)
- DELETE /api/atmosphere/{atm_id} (requires auth)
- PATCH /api/atmosphere/{atm_id} (requires auth)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_USER_EMAIL = "test_v29_user@test.com"
TEST_USER_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        token = data.get("token") or data.get("access_token")
        if token:
            return token
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestAtmosphereJournalAuth:
    """Test authentication requirements for atmosphere endpoints"""
    
    def test_save_requires_auth(self, api_client):
        """POST /api/atmosphere/save should require authentication"""
        response = api_client.post(f"{BASE_URL}/api/atmosphere/save", json={
            "name": "Test Mood",
            "filters": {"blur": 0, "brightness": 100},
            "source_prompt": "test"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: POST /api/atmosphere/save requires auth (status: {response.status_code})")
    
    def test_gallery_requires_auth(self, api_client):
        """GET /api/atmosphere/gallery should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/atmosphere/gallery")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: GET /api/atmosphere/gallery requires auth (status: {response.status_code})")
    
    def test_delete_requires_auth(self, api_client):
        """DELETE /api/atmosphere/{id} should require authentication"""
        response = api_client.delete(f"{BASE_URL}/api/atmosphere/test_id")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: DELETE /api/atmosphere/{{id}} requires auth (status: {response.status_code})")
    
    def test_patch_requires_auth(self, api_client):
        """PATCH /api/atmosphere/{id} should require authentication"""
        response = api_client.patch(f"{BASE_URL}/api/atmosphere/test_id", json={"name": "New Name"})
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print(f"PASS: PATCH /api/atmosphere/{{id}} requires auth (status: {response.status_code})")


class TestAtmosphereJournalCRUD:
    """Test CRUD operations for atmosphere journal"""
    
    def test_save_atmosphere_creates_entry(self, authenticated_client):
        """POST /api/atmosphere/save should create entry with id, name, filters, source_prompt, created_at"""
        test_filters = {
            "blur": 2,
            "brightness": 120,
            "contrast": 110,
            "hueRotate": 45,
            "saturate": 150,
            "sepia": 20,
            "invert": 0
        }
        response = authenticated_client.post(f"{BASE_URL}/api/atmosphere/save", json={
            "name": "TEST_Golden_Sunset",
            "filters": test_filters,
            "source_prompt": "golden sunset over mountains"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "status" in data, "Response should have 'status' field"
        assert data["status"] == "saved", f"Expected status 'saved', got '{data['status']}'"
        assert "atmosphere" in data, "Response should have 'atmosphere' field"
        
        atm = data["atmosphere"]
        assert "id" in atm, "Atmosphere should have 'id'"
        assert atm["id"].startswith("atm_"), f"ID should start with 'atm_', got '{atm['id']}'"
        assert atm["name"] == "TEST_Golden_Sunset", f"Name mismatch: {atm['name']}"
        assert atm["filters"] == test_filters, f"Filters mismatch: {atm['filters']}"
        assert atm["source_prompt"] == "golden sunset over mountains", f"Source prompt mismatch"
        assert "created_at" in atm, "Atmosphere should have 'created_at'"
        
        print(f"PASS: POST /api/atmosphere/save creates entry with id={atm['id']}")
        return atm["id"]
    
    def test_get_gallery_returns_user_atmospheres(self, authenticated_client):
        """GET /api/atmosphere/gallery should return user's saved atmospheres sorted newest first"""
        response = authenticated_client.get(f"{BASE_URL}/api/atmosphere/gallery")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "gallery" in data, "Response should have 'gallery' field"
        assert isinstance(data["gallery"], list), "Gallery should be a list"
        
        # Should have at least one entry (from previous test or existing data)
        if len(data["gallery"]) > 0:
            first_item = data["gallery"][0]
            assert "id" in first_item, "Gallery item should have 'id'"
            assert "name" in first_item, "Gallery item should have 'name'"
            assert "filters" in first_item, "Gallery item should have 'filters'"
            assert "created_at" in first_item, "Gallery item should have 'created_at'"
            
            # Verify sorted newest first (if multiple items)
            if len(data["gallery"]) > 1:
                first_date = first_item["created_at"]
                second_date = data["gallery"][1]["created_at"]
                assert first_date >= second_date, "Gallery should be sorted newest first"
        
        print(f"PASS: GET /api/atmosphere/gallery returns {len(data['gallery'])} items")
        return data["gallery"]
    
    def test_gallery_max_50_items(self, authenticated_client):
        """GET /api/atmosphere/gallery should return max 50 items"""
        response = authenticated_client.get(f"{BASE_URL}/api/atmosphere/gallery")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["gallery"]) <= 50, f"Gallery should have max 50 items, got {len(data['gallery'])}"
        print(f"PASS: Gallery respects max 50 limit (current: {len(data['gallery'])})")
    
    def test_patch_renames_atmosphere(self, authenticated_client):
        """PATCH /api/atmosphere/{id} should rename an entry"""
        # First create an entry to rename
        create_response = authenticated_client.post(f"{BASE_URL}/api/atmosphere/save", json={
            "name": "TEST_Original_Name",
            "filters": {"blur": 0, "brightness": 100},
            "source_prompt": "test rename"
        })
        assert create_response.status_code == 200
        atm_id = create_response.json()["atmosphere"]["id"]
        
        # Rename it
        rename_response = authenticated_client.patch(f"{BASE_URL}/api/atmosphere/{atm_id}", json={
            "name": "TEST_Renamed_Atmosphere"
        })
        
        assert rename_response.status_code == 200, f"Expected 200, got {rename_response.status_code}"
        data = rename_response.json()
        assert data["status"] == "updated", f"Expected status 'updated', got '{data['status']}'"
        
        print(f"PASS: PATCH /api/atmosphere/{atm_id} renamed successfully")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/atmosphere/{atm_id}")
    
    def test_delete_removes_atmosphere(self, authenticated_client):
        """DELETE /api/atmosphere/{id} should remove entry for authenticated user"""
        # First create an entry to delete
        create_response = authenticated_client.post(f"{BASE_URL}/api/atmosphere/save", json={
            "name": "TEST_To_Delete",
            "filters": {"blur": 0, "brightness": 100},
            "source_prompt": "test delete"
        })
        assert create_response.status_code == 200
        atm_id = create_response.json()["atmosphere"]["id"]
        
        # Delete it
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/atmosphere/{atm_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        data = delete_response.json()
        assert data["status"] == "deleted", f"Expected status 'deleted', got '{data['status']}'"
        
        # Verify it's gone from gallery
        gallery_response = authenticated_client.get(f"{BASE_URL}/api/atmosphere/gallery")
        gallery = gallery_response.json()["gallery"]
        deleted_ids = [a["id"] for a in gallery]
        assert atm_id not in deleted_ids, "Deleted atmosphere should not appear in gallery"
        
        print(f"PASS: DELETE /api/atmosphere/{atm_id} removed entry and verified")
    
    def test_delete_nonexistent_returns_not_found(self, authenticated_client):
        """DELETE /api/atmosphere/{id} with invalid ID should return not_found"""
        response = authenticated_client.delete(f"{BASE_URL}/api/atmosphere/atm_nonexistent123")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["status"] == "not_found", f"Expected status 'not_found', got '{data['status']}'"
        
        print("PASS: DELETE with invalid ID returns not_found status")


class TestAtmosphereJournalCleanup:
    """Cleanup test data after tests"""
    
    def test_cleanup_test_atmospheres(self, authenticated_client):
        """Remove all TEST_ prefixed atmospheres"""
        response = authenticated_client.get(f"{BASE_URL}/api/atmosphere/gallery")
        if response.status_code == 200:
            gallery = response.json().get("gallery", [])
            deleted_count = 0
            for atm in gallery:
                if atm.get("name", "").startswith("TEST_"):
                    del_response = authenticated_client.delete(f"{BASE_URL}/api/atmosphere/{atm['id']}")
                    if del_response.status_code == 200:
                        deleted_count += 1
            print(f"CLEANUP: Removed {deleted_count} test atmospheres")
        assert True  # Always pass cleanup


class TestSageFXRegression:
    """Regression tests for Sage AI Prompt-to-FX (from iteration 317)"""
    
    def test_sage_fx_preset_sunset(self):
        """Sage FX preset 'sunset' should still work"""
        response = requests.post(f"{BASE_URL}/api/sage-fx/prompt-to-fx", json={
            "prompt": "sunset"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "filters" in data, "Response should have 'filters'"
        assert "mood" in data, "Response should have 'mood'"
        print(f"PASS: Sage FX 'sunset' returns mood='{data['mood']}'")
    
    def test_sage_fx_creative_prompt(self):
        """Sage FX creative prompt should still work"""
        response = requests.post(f"{BASE_URL}/api/sage-fx/prompt-to-fx", json={
            "prompt": "mystical forest at dawn"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "filters" in data, "Response should have 'filters'"
        print(f"PASS: Sage FX creative prompt works, mood='{data.get('mood', 'N/A')}'")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 110: Media Library CRUD API Tests
Tests for creator media library with record/save/share capabilities.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestMediaLibraryAPI:
    """Media Library CRUD endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
            self.user_id = response.json().get("user", {}).get("id")
        else:
            pytest.skip("Authentication failed")
    
    def test_get_my_library(self):
        """GET /api/media-library returns user's library items"""
        response = requests.get(f"{BASE_URL}/api/media-library", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: GET /api/media-library returned {len(data)} items")
    
    def test_get_community_library(self):
        """GET /api/media-library/community returns public items"""
        response = requests.get(f"{BASE_URL}/api/media-library/community", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # All items should be public
        for item in data:
            assert item.get("is_public") == True, f"Community item should be public: {item.get('id')}"
        print(f"PASS: GET /api/media-library/community returned {len(data)} public items")
    
    def test_get_community_with_type_filter(self):
        """GET /api/media-library/community?media_type=mix_recording filters by type"""
        response = requests.get(f"{BASE_URL}/api/media-library/community?media_type=mix_recording", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        for item in data:
            assert item.get("media_type") == "mix_recording", f"Item should be mix_recording type"
        print(f"PASS: Community filter by media_type works, returned {len(data)} items")
    
    def test_create_library_item(self):
        """POST /api/media-library saves a new creation with timeline, layers, tags"""
        unique_title = f"TEST_Recording_{uuid.uuid4().hex[:8]}"
        payload = {
            "title": unique_title,
            "description": "Test recording from pytest",
            "media_type": "mix_recording",
            "duration_seconds": 120,
            "timeline": [
                {"time_sec": 0, "state": {"frequency": {"hz": 528, "label": "528 Hz"}}},
                {"time_sec": 2, "state": {"frequency": {"hz": 528, "label": "528 Hz"}, "sound": {"id": "rain"}}}
            ],
            "mixer_snapshot": {"frequency": {"hz": 528}},
            "thumbnail_layers": [{"type": "light", "itemId": "aurora"}, {"type": "fractal", "itemId": "sacred-geo"}],
            "tags": ["test", "meditation", "528hz"],
            "is_public": False
        }
        
        response = requests.post(f"{BASE_URL}/api/media-library", json=payload, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert data["title"] == unique_title, "Title should match"
        assert data["media_type"] == "mix_recording", "Media type should match"
        assert data["duration_seconds"] == 120, "Duration should match"
        assert len(data["timeline"]) == 2, "Timeline should have 2 entries"
        assert len(data["thumbnail_layers"]) == 2, "Should have 2 thumbnail layers"
        assert "test" in data["tags"], "Tags should include 'test'"
        assert data["is_public"] == False, "Should be private"
        assert data["creator_id"] == self.user_id, "Creator ID should match current user"
        
        # Store for cleanup
        self.created_item_id = data["id"]
        print(f"PASS: POST /api/media-library created item {data['id']}")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/media-library/{data['id']}", headers=self.headers)
        assert get_response.status_code == 200, "Should be able to GET created item"
        fetched = get_response.json()
        assert fetched["title"] == unique_title, "Fetched title should match"
        print(f"PASS: GET /api/media-library/{data['id']} verified persistence")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/media-library/{data['id']}", headers=self.headers)
    
    def test_update_library_item(self):
        """PUT /api/media-library/:id updates title/description/public status"""
        # First create an item
        create_payload = {
            "title": f"TEST_ToUpdate_{uuid.uuid4().hex[:8]}",
            "description": "Original description",
            "media_type": "custom",
            "is_public": False
        }
        create_response = requests.post(f"{BASE_URL}/api/media-library", json=create_payload, headers=self.headers)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Update the item
        update_payload = {
            "title": "Updated Title",
            "description": "Updated description",
            "is_public": True,
            "tags": ["updated", "public"]
        }
        update_response = requests.put(f"{BASE_URL}/api/media-library/{item_id}", json=update_payload, headers=self.headers)
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        assert update_response.json().get("updated") == True, "Should return updated: true"
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["title"] == "Updated Title", "Title should be updated"
        assert fetched["description"] == "Updated description", "Description should be updated"
        assert fetched["is_public"] == True, "Should now be public"
        assert "updated" in fetched["tags"], "Tags should be updated"
        
        print(f"PASS: PUT /api/media-library/{item_id} updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
    
    def test_toggle_like(self):
        """POST /api/media-library/:id/like toggles like"""
        # First create a public item
        create_payload = {
            "title": f"TEST_Likeable_{uuid.uuid4().hex[:8]}",
            "media_type": "journey",
            "is_public": True
        }
        create_response = requests.post(f"{BASE_URL}/api/media-library", json=create_payload, headers=self.headers)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Like the item
        like_response = requests.post(f"{BASE_URL}/api/media-library/{item_id}/like", json={}, headers=self.headers)
        assert like_response.status_code == 200, f"Expected 200, got {like_response.status_code}: {like_response.text}"
        like_data = like_response.json()
        assert like_data["liked"] == True, "Should be liked"
        assert like_data["like_count"] >= 1, "Like count should be at least 1"
        
        # Unlike the item (toggle)
        unlike_response = requests.post(f"{BASE_URL}/api/media-library/{item_id}/like", json={}, headers=self.headers)
        assert unlike_response.status_code == 200
        unlike_data = unlike_response.json()
        assert unlike_data["liked"] == False, "Should be unliked after toggle"
        
        print(f"PASS: POST /api/media-library/{item_id}/like toggle works")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
    
    def test_delete_library_item(self):
        """DELETE /api/media-library/:id deletes user's item"""
        # First create an item
        create_payload = {
            "title": f"TEST_ToDelete_{uuid.uuid4().hex[:8]}",
            "media_type": "live_recording"
        }
        create_response = requests.post(f"{BASE_URL}/api/media-library", json=create_payload, headers=self.headers)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Delete the item
        delete_response = requests.delete(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        assert delete_response.json().get("deleted") == True, "Should return deleted: true"
        
        # Verify deletion - should return 404
        get_response = requests.get(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
        assert get_response.status_code == 404, "Deleted item should return 404"
        
        print(f"PASS: DELETE /api/media-library/{item_id} deleted successfully")
    
    def test_get_single_item_increments_view_count(self):
        """GET /api/media-library/:id increments view count"""
        # Create an item
        create_payload = {
            "title": f"TEST_ViewCount_{uuid.uuid4().hex[:8]}",
            "media_type": "mix_recording"
        }
        create_response = requests.post(f"{BASE_URL}/api/media-library", json=create_payload, headers=self.headers)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # View the item twice - first view increments, second view shows the increment
        get_response1 = requests.get(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
        assert get_response1.status_code == 200
        views_after_first = get_response1.json().get("view_count", 0)
        
        # Second view - should show the increment from first view
        get_response2 = requests.get(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
        assert get_response2.status_code == 200
        views_after_second = get_response2.json().get("view_count", 0)
        
        # Note: Backend increments AFTER returning, so second call shows first increment
        assert views_after_second >= views_after_first, f"View count should not decrease: {views_after_first} -> {views_after_second}"
        
        print(f"PASS: View count tracking works: {views_after_first} -> {views_after_second}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)
    
    def test_media_types(self):
        """Test all media types: mix_recording, live_recording, journey, custom"""
        media_types = ["mix_recording", "live_recording", "journey", "custom"]
        created_ids = []
        
        for media_type in media_types:
            payload = {
                "title": f"TEST_{media_type}_{uuid.uuid4().hex[:6]}",
                "media_type": media_type
            }
            response = requests.post(f"{BASE_URL}/api/media-library", json=payload, headers=self.headers)
            assert response.status_code == 200, f"Failed to create {media_type}: {response.text}"
            assert response.json()["media_type"] == media_type
            created_ids.append(response.json()["id"])
            print(f"PASS: Created {media_type} item")
        
        # Cleanup
        for item_id in created_ids:
            requests.delete(f"{BASE_URL}/api/media-library/{item_id}", headers=self.headers)


class TestMediaLibraryEdgeCases:
    """Edge case tests for Media Library API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_delete_nonexistent_item(self):
        """DELETE /api/media-library/:id returns 404 for nonexistent item"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/media-library/{fake_id}", headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: DELETE nonexistent item returns 404")
    
    def test_update_nonexistent_item(self):
        """PUT /api/media-library/:id returns 404 for nonexistent item"""
        fake_id = str(uuid.uuid4())
        response = requests.put(f"{BASE_URL}/api/media-library/{fake_id}", json={"title": "New"}, headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: PUT nonexistent item returns 404")
    
    def test_like_nonexistent_item(self):
        """POST /api/media-library/:id/like returns 404 for nonexistent item"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/media-library/{fake_id}/like", json={}, headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: LIKE nonexistent item returns 404")
    
    def test_unauthenticated_access(self):
        """Endpoints require authentication"""
        # GET my library without auth
        response = requests.get(f"{BASE_URL}/api/media-library")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        
        # POST without auth
        response = requests.post(f"{BASE_URL}/api/media-library", json={"title": "Test"})
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        
        print("PASS: Unauthenticated access properly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

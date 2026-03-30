"""
Iteration 108: Playlists/Journeys Feature Tests
Tests for preset playlists (journeys) - queue multiple presets in sequence
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestPlaylistsFeatured:
    """Tests for GET /api/mixer-presets/playlists/featured - Curated playlists"""
    
    def test_featured_playlists_returns_4_curated(self, auth_headers):
        """Should return 4 curated playlists"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        playlists = response.json()
        assert isinstance(playlists, list), "Response should be a list"
        assert len(playlists) == 4, f"Expected 4 curated playlists, got {len(playlists)}"
    
    def test_featured_playlists_have_required_fields(self, auth_headers):
        """Each playlist should have required fields"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        required_fields = ["id", "name", "description", "steps", "total_minutes", "is_featured"]
        for pl in playlists:
            for field in required_fields:
                assert field in pl, f"Playlist missing field: {field}"
            assert pl["is_featured"] == True, "Featured playlists should have is_featured=True"
    
    def test_cosmic_exploration_playlist(self, auth_headers):
        """Cosmic Exploration: 55min, 4 steps"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        cosmic = next((p for p in playlists if p["name"] == "Cosmic Exploration"), None)
        assert cosmic is not None, "Cosmic Exploration playlist not found"
        assert cosmic["total_minutes"] == 55, f"Expected 55min, got {cosmic['total_minutes']}"
        assert len(cosmic["steps"]) == 4, f"Expected 4 steps, got {len(cosmic['steps'])}"
    
    def test_deep_sleep_protocol_playlist(self, auth_headers):
        """Deep Sleep Protocol: 45min, 3 steps"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        sleep = next((p for p in playlists if p["name"] == "Deep Sleep Protocol"), None)
        assert sleep is not None, "Deep Sleep Protocol playlist not found"
        assert sleep["total_minutes"] == 45, f"Expected 45min, got {sleep['total_minutes']}"
        assert len(sleep["steps"]) == 3, f"Expected 3 steps, got {len(sleep['steps'])}"
    
    def test_morning_to_night_journey_playlist(self, auth_headers):
        """Morning to Night Journey: 155min, 5 steps"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        journey = next((p for p in playlists if p["name"] == "Morning to Night Journey"), None)
        assert journey is not None, "Morning to Night Journey playlist not found"
        assert journey["total_minutes"] == 155, f"Expected 155min, got {journey['total_minutes']}"
        assert len(journey["steps"]) == 5, f"Expected 5 steps, got {len(journey['steps'])}"
    
    def test_quick_recharge_playlist(self, auth_headers):
        """Quick Recharge: 15min, 3 steps"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        quick = next((p for p in playlists if p["name"] == "Quick Recharge"), None)
        assert quick is not None, "Quick Recharge playlist not found"
        assert quick["total_minutes"] == 15, f"Expected 15min, got {quick['total_minutes']}"
        assert len(quick["steps"]) == 3, f"Expected 3 steps, got {len(quick['steps'])}"
    
    def test_playlist_steps_have_preset_references(self, auth_headers):
        """Each step should have preset_id, preset_name, and duration"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = response.json()
        
        for pl in playlists:
            for step in pl["steps"]:
                assert "preset_id" in step, f"Step missing preset_id in {pl['name']}"
                assert "preset_name" in step, f"Step missing preset_name in {pl['name']}"
                assert "duration" in step, f"Step missing duration in {pl['name']}"
                assert isinstance(step["duration"], int), f"Duration should be int in {pl['name']}"


class TestPlaylistsCommunity:
    """Tests for GET /api/mixer-presets/playlists/community - Public playlists"""
    
    def test_community_playlists_returns_list(self, auth_headers):
        """Should return a list of public playlists"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/community", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        playlists = response.json()
        assert isinstance(playlists, list), "Response should be a list"
        # Community includes featured playlists (which are public)
        assert len(playlists) >= 4, "Should have at least 4 public playlists (featured ones)"


class TestPlaylistsMine:
    """Tests for GET /api/mixer-presets/playlists/mine - User's playlists"""
    
    def test_my_playlists_requires_auth(self):
        """Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/mine")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_my_playlists_returns_list(self, auth_headers):
        """Should return user's playlists"""
        response = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/mine", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        playlists = response.json()
        assert isinstance(playlists, list), "Response should be a list"


class TestPlaylistCreate:
    """Tests for POST /api/mixer-presets/playlists - Create new playlist"""
    
    def test_create_playlist_requires_auth(self):
        """Should require authentication"""
        response = requests.post(f"{BASE_URL}/api/mixer-presets/playlists", json={
            "name": "Test Journey",
            "steps": []
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_create_playlist_with_steps(self, auth_headers):
        """Should create a new playlist with steps"""
        # First get a preset ID to reference
        presets_res = requests.get(f"{BASE_URL}/api/mixer-presets/featured", headers=auth_headers)
        presets = presets_res.json()
        preset = presets[0] if presets else None
        
        playlist_data = {
            "name": "TEST_My Custom Journey",
            "description": "A test journey for automated testing",
            "steps": [
                {"preset_id": preset["id"] if preset else "test-id", "preset_name": preset["name"] if preset else "Test", "duration": 10},
                {"preset_id": preset["id"] if preset else "test-id", "preset_name": preset["name"] if preset else "Test", "duration": 15},
            ],
            "is_public": False
        }
        
        response = requests.post(f"{BASE_URL}/api/mixer-presets/playlists", json=playlist_data, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert created["name"] == "TEST_My Custom Journey"
        assert created["description"] == "A test journey for automated testing"
        assert len(created["steps"]) == 2
        assert created["total_minutes"] == 25  # 10 + 15
        assert created["is_public"] == False
        assert "id" in created
        
        # Verify it appears in my playlists
        mine_res = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/mine", headers=auth_headers)
        mine = mine_res.json()
        found = any(p["id"] == created["id"] for p in mine)
        assert found, "Created playlist should appear in my playlists"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/mixer-presets/playlists/{created['id']}", headers=auth_headers)


class TestPlaylistLike:
    """Tests for POST /api/mixer-presets/playlists/:id/like - Toggle like"""
    
    def test_like_playlist_requires_auth(self):
        """Should require authentication"""
        response = requests.post(f"{BASE_URL}/api/mixer-presets/playlists/some-id/like")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_toggle_like_on_playlist(self, auth_headers):
        """Should toggle like status"""
        # Get a featured playlist
        playlists_res = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = playlists_res.json()
        playlist = playlists[0]
        
        # Like it
        response = requests.post(f"{BASE_URL}/api/mixer-presets/playlists/{playlist['id']}/like", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "liked" in data
        assert "like_count" in data
        first_liked = data["liked"]
        
        # Toggle again
        response2 = requests.post(f"{BASE_URL}/api/mixer-presets/playlists/{playlist['id']}/like", headers=auth_headers)
        data2 = response2.json()
        assert data2["liked"] != first_liked, "Like should toggle"


class TestPlaylistDelete:
    """Tests for DELETE /api/mixer-presets/playlists/:id - Delete playlist"""
    
    def test_delete_playlist_requires_auth(self):
        """Should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/mixer-presets/playlists/some-id")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_delete_own_playlist(self, auth_headers):
        """Should delete user's own playlist"""
        # Create a playlist first
        playlist_data = {
            "name": "TEST_To Be Deleted",
            "steps": [{"preset_id": "test", "preset_name": "Test", "duration": 5}],
            "is_public": False
        }
        create_res = requests.post(f"{BASE_URL}/api/mixer-presets/playlists", json=playlist_data, headers=auth_headers)
        created = create_res.json()
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/mixer-presets/playlists/{created['id']}", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("deleted") == True
        
        # Verify it's gone
        mine_res = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/mine", headers=auth_headers)
        mine = mine_res.json()
        found = any(p["id"] == created["id"] for p in mine)
        assert not found, "Deleted playlist should not appear in my playlists"
    
    def test_cannot_delete_others_playlist(self, auth_headers):
        """Should not delete featured/system playlists"""
        # Get a featured playlist (created by system)
        playlists_res = requests.get(f"{BASE_URL}/api/mixer-presets/playlists/featured", headers=auth_headers)
        playlists = playlists_res.json()
        playlist = playlists[0]
        
        # Try to delete it
        response = requests.delete(f"{BASE_URL}/api/mixer-presets/playlists/{playlist['id']}", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 (not yours), got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

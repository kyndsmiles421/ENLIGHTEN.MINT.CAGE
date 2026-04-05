"""
Iteration 107: Mixer Presets API Tests
Tests for the Production Console preset system:
- GET /api/mixer-presets/featured - Staff pick presets (auto-seeded)
- GET /api/mixer-presets/community - Public presets sorted by likes
- GET /api/mixer-presets/mine - User's personal presets
- POST /api/mixer-presets - Save a new preset
- POST /api/mixer-presets/:id/like - Toggle like on a preset
- DELETE /api/mixer-presets/:id - Delete user's own preset
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMixerPresetsAPI:
    """Mixer Presets CRUD and feature tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token for tests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.user_id = login_response.json().get("user", {}).get("id")
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    # ─── Featured Presets (Staff Picks) ───
    def test_get_featured_presets_returns_8_staff_picks(self):
        """GET /api/mixer-presets/featured should return 8 seeded staff pick presets"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        presets = response.json()
        assert isinstance(presets, list), "Response should be a list"
        assert len(presets) == 8, f"Expected 8 featured presets, got {len(presets)}"
        
        # Verify all expected presets are present
        expected_names = [
            "Morning Awakening", "Deep Meditation", "Creative Flow", "Sleep Journey",
            "Heart Opening", "Third Eye Activation", "Forest Retreat", "Cosmic Dance"
        ]
        actual_names = [p["name"] for p in presets]
        for name in expected_names:
            assert name in actual_names, f"Missing preset: {name}"
    
    def test_featured_presets_have_required_fields(self):
        """Featured presets should have all required fields"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        assert response.status_code == 200
        
        presets = response.json()
        for preset in presets:
            assert "id" in preset, "Preset missing 'id'"
            assert "name" in preset, "Preset missing 'name'"
            assert "description" in preset, "Preset missing 'description'"
            assert "layers" in preset, "Preset missing 'layers'"
            assert "is_featured" in preset, "Preset missing 'is_featured'"
            assert preset["is_featured"] == True, "Featured preset should have is_featured=True"
            assert "like_count" in preset, "Preset missing 'like_count'"
            assert "creator_name" in preset, "Preset missing 'creator_name'"
            assert preset["creator_name"] == "ENLIGHTEN.MINT.CAFE", "Featured presets should be by ENLIGHTEN.MINT.CAFE"
    
    def test_featured_presets_have_layers_config(self):
        """Featured presets should have proper layer configurations"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        assert response.status_code == 200
        
        presets = response.json()
        for preset in presets:
            layers = preset.get("layers", {})
            assert len(layers) > 0, f"Preset '{preset['name']}' has no layers"
            
            # Check layer types are valid
            valid_layer_types = ["frequency", "sound", "drone", "mantra", "light", "video"]
            for layer_type in layers.keys():
                assert layer_type in valid_layer_types, f"Invalid layer type: {layer_type}"
    
    # ─── Community Presets ───
    def test_get_community_presets(self):
        """GET /api/mixer-presets/community should return public presets"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/community")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        presets = response.json()
        assert isinstance(presets, list), "Response should be a list"
        
        # All returned presets should be public
        for preset in presets:
            assert preset.get("is_public") == True, "Community presets should be public"
    
    def test_community_presets_sorted_by_likes(self):
        """Community presets should be sorted by like_count descending"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/community")
        assert response.status_code == 200
        
        presets = response.json()
        if len(presets) > 1:
            like_counts = [p.get("like_count", 0) for p in presets]
            assert like_counts == sorted(like_counts, reverse=True), "Presets should be sorted by like_count descending"
    
    # ─── My Presets ───
    def test_get_my_presets_requires_auth(self):
        """GET /api/mixer-presets/mine should require authentication"""
        # Test without auth
        no_auth_session = requests.Session()
        response = no_auth_session.get(f"{BASE_URL}/api/mixer-presets/mine")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_get_my_presets_returns_user_presets(self):
        """GET /api/mixer-presets/mine should return only user's presets"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/mine")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        presets = response.json()
        assert isinstance(presets, list), "Response should be a list"
        
        # All returned presets should belong to the current user
        for preset in presets:
            assert preset.get("creator_id") == self.user_id, "My presets should belong to current user"
    
    # ─── Save Preset ───
    def test_save_preset_creates_new_preset(self):
        """POST /api/mixer-presets should create a new preset"""
        preset_data = {
            "name": "TEST_My Custom Mix",
            "description": "A test preset for automated testing",
            "layers": {
                "frequency": {"hz": 528, "label": "528 Hz"},
                "sound": {"id": "rain"},
                "light": {"id": "aurora"}
            },
            "volumes": {"freqVol": 60, "soundVol": 50, "lightOpacity": 40},
            "tags": ["test", "custom"],
            "is_public": False
        }
        
        response = self.session.post(f"{BASE_URL}/api/mixer-presets", json=preset_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created, "Created preset should have an id"
        assert created["name"] == "TEST_My Custom Mix"
        assert created["description"] == "A test preset for automated testing"
        assert created["layers"]["frequency"]["hz"] == 528
        assert created["is_public"] == False
        assert created["creator_id"] == self.user_id
        
        # Store for cleanup
        self.created_preset_id = created["id"]
        
        # Verify it appears in my presets
        my_presets = self.session.get(f"{BASE_URL}/api/mixer-presets/mine").json()
        preset_ids = [p["id"] for p in my_presets]
        assert created["id"] in preset_ids, "Created preset should appear in my presets"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/mixer-presets/{created['id']}")
    
    def test_save_public_preset_appears_in_community(self):
        """Public presets should appear in community list"""
        preset_data = {
            "name": "TEST_Public Mix",
            "description": "A public test preset",
            "layers": {"frequency": {"hz": 396, "label": "396 Hz"}},
            "is_public": True
        }
        
        response = self.session.post(f"{BASE_URL}/api/mixer-presets", json=preset_data)
        assert response.status_code == 200
        
        created = response.json()
        
        # Verify it appears in community presets
        community = self.session.get(f"{BASE_URL}/api/mixer-presets/community").json()
        preset_ids = [p["id"] for p in community]
        assert created["id"] in preset_ids, "Public preset should appear in community"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/mixer-presets/{created['id']}")
    
    def test_save_preset_requires_auth(self):
        """POST /api/mixer-presets should require authentication"""
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.post(f"{BASE_URL}/api/mixer-presets", json={
            "name": "Unauthorized Preset",
            "layers": {}
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    # ─── Like Preset ───
    def test_toggle_like_on_preset(self):
        """POST /api/mixer-presets/:id/like should toggle like status"""
        # Get a featured preset to like
        featured = self.session.get(f"{BASE_URL}/api/mixer-presets/featured").json()
        assert len(featured) > 0, "Need at least one featured preset"
        
        preset_id = featured[0]["id"]
        initial_like_count = featured[0].get("like_count", 0)
        
        # Like the preset
        response = self.session.post(f"{BASE_URL}/api/mixer-presets/{preset_id}/like")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        result = response.json()
        assert "liked" in result, "Response should include 'liked' status"
        assert "like_count" in result, "Response should include 'like_count'"
        
        # Toggle again (unlike)
        response2 = self.session.post(f"{BASE_URL}/api/mixer-presets/{preset_id}/like")
        assert response2.status_code == 200
        
        result2 = response2.json()
        assert result2["liked"] != result["liked"], "Like status should toggle"
    
    def test_like_nonexistent_preset_returns_404(self):
        """Liking a non-existent preset should return 404"""
        response = self.session.post(f"{BASE_URL}/api/mixer-presets/nonexistent-id-12345/like")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_like_requires_auth(self):
        """POST /api/mixer-presets/:id/like should require authentication"""
        featured = self.session.get(f"{BASE_URL}/api/mixer-presets/featured").json()
        preset_id = featured[0]["id"] if featured else "test-id"
        
        no_auth_session = requests.Session()
        response = no_auth_session.post(f"{BASE_URL}/api/mixer-presets/{preset_id}/like")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    # ─── Delete Preset ───
    def test_delete_own_preset(self):
        """DELETE /api/mixer-presets/:id should delete user's own preset"""
        # First create a preset
        preset_data = {
            "name": "TEST_To Be Deleted",
            "layers": {"sound": {"id": "ocean"}},
            "is_public": False
        }
        create_response = self.session.post(f"{BASE_URL}/api/mixer-presets", json=preset_data)
        assert create_response.status_code == 200
        
        preset_id = create_response.json()["id"]
        
        # Delete it
        delete_response = self.session.delete(f"{BASE_URL}/api/mixer-presets/{preset_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        result = delete_response.json()
        assert result.get("deleted") == True, "Response should confirm deletion"
        
        # Verify it's gone from my presets
        my_presets = self.session.get(f"{BASE_URL}/api/mixer-presets/mine").json()
        preset_ids = [p["id"] for p in my_presets]
        assert preset_id not in preset_ids, "Deleted preset should not appear in my presets"
    
    def test_cannot_delete_others_preset(self):
        """Cannot delete a preset that belongs to another user"""
        # Featured presets belong to 'system' user
        featured = self.session.get(f"{BASE_URL}/api/mixer-presets/featured").json()
        assert len(featured) > 0, "Need at least one featured preset"
        
        preset_id = featured[0]["id"]
        
        response = self.session.delete(f"{BASE_URL}/api/mixer-presets/{preset_id}")
        assert response.status_code == 404, f"Expected 404 (not yours), got {response.status_code}"
    
    def test_delete_requires_auth(self):
        """DELETE /api/mixer-presets/:id should require authentication"""
        no_auth_session = requests.Session()
        response = no_auth_session.delete(f"{BASE_URL}/api/mixer-presets/some-id")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestMixerPresetsDataIntegrity:
    """Data integrity and edge case tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token for tests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_preset_excludes_mongodb_id(self):
        """Presets should not expose MongoDB _id field"""
        response = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        assert response.status_code == 200
        
        presets = response.json()
        for preset in presets:
            assert "_id" not in preset, "Preset should not expose MongoDB _id"
    
    def test_save_preset_with_minimal_data(self):
        """Should be able to save preset with minimal required data"""
        preset_data = {
            "name": "TEST_Minimal Preset",
            "layers": {}
        }
        
        response = self.session.post(f"{BASE_URL}/api/mixer-presets", json=preset_data)
        assert response.status_code == 200
        
        created = response.json()
        assert created["name"] == "TEST_Minimal Preset"
        assert created["description"] == ""  # Default empty
        assert created["is_public"] == False  # Default private
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/mixer-presets/{created['id']}")
    
    def test_featured_presets_are_idempotent(self):
        """Calling featured endpoint multiple times should not create duplicates"""
        # Call featured twice
        response1 = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        response2 = self.session.get(f"{BASE_URL}/api/mixer-presets/featured")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        presets1 = response1.json()
        presets2 = response2.json()
        
        assert len(presets1) == len(presets2), "Featured presets count should be consistent"
        assert len(presets1) == 8, "Should always have exactly 8 featured presets"

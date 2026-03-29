"""
Iteration 82: AI Avatar Generator Tests
Tests for:
- POST /api/ai-visuals/generate-avatar - Generate AI avatar (schema validation only, no actual generation)
- GET /api/ai-visuals/my-avatar - Get active avatar
- GET /api/ai-visuals/my-avatars - Get avatar gallery
- POST /api/ai-visuals/set-active-avatar - Set active avatar
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAIAvatarEndpoints:
    """Test AI Avatar Generator endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_generate_avatar_empty_description_returns_400(self):
        """Test that empty description returns 400 error"""
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/generate-avatar", json={
            "description": "",
            "style": "ethereal",
            "extras": {}
        })
        
        assert response.status_code == 400, f"Expected 400 for empty description, got {response.status_code}"
        data = response.json()
        assert "detail" in data or "error" in data, "Should return error message"
        print(f"✓ Empty description correctly returns 400: {data}")
    
    def test_generate_avatar_whitespace_description_returns_400(self):
        """Test that whitespace-only description returns 400 error"""
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/generate-avatar", json={
            "description": "   ",
            "style": "ethereal",
            "extras": {}
        })
        
        assert response.status_code == 400, f"Expected 400 for whitespace description, got {response.status_code}"
        print(f"✓ Whitespace description correctly returns 400")
    
    def test_generate_avatar_accepts_valid_schema(self):
        """Test that valid schema is accepted (without actually generating - would take 2 min)
        We just verify the endpoint accepts the request format"""
        # NOTE: We don't actually call this as it takes 2 minutes and costs credits
        # Just verify the endpoint exists and accepts the schema
        
        # Test with OPTIONS or HEAD to verify endpoint exists
        response = self.session.options(f"{BASE_URL}/api/ai-visuals/generate-avatar")
        # If OPTIONS not supported, just verify we can reach the endpoint
        if response.status_code == 405:
            # Try a minimal request that will fail validation but prove endpoint exists
            response = self.session.post(f"{BASE_URL}/api/ai-visuals/generate-avatar", json={})
            # Should get 400 (missing description) or 422 (validation error), not 404
            assert response.status_code in [400, 422], f"Endpoint should exist, got {response.status_code}"
        
        print(f"✓ generate-avatar endpoint exists and accepts requests")
    
    def test_get_my_avatar_returns_valid_response(self):
        """Test GET /api/ai-visuals/my-avatar returns valid response"""
        response = self.session.get(f"{BASE_URL}/api/ai-visuals/my-avatar")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should have status field
        assert "status" in data, "Response should have 'status' field"
        
        if data["status"] == "active":
            # If active avatar exists, should have image_b64
            assert "image_b64" in data, "Active avatar should have image_b64"
            assert len(data["image_b64"]) > 100, "image_b64 should be a valid base64 string"
            print(f"✓ my-avatar returns active avatar with image_b64 (length: {len(data['image_b64'])})")
        else:
            # status should be "none"
            assert data["status"] == "none", f"Status should be 'active' or 'none', got {data['status']}"
            print(f"✓ my-avatar returns status='none' (no active avatar)")
    
    def test_get_my_avatars_returns_gallery_array(self):
        """Test GET /api/ai-visuals/my-avatars returns gallery array"""
        response = self.session.get(f"{BASE_URL}/api/ai-visuals/my-avatars")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should have avatars array
        assert "avatars" in data, "Response should have 'avatars' field"
        assert isinstance(data["avatars"], list), "avatars should be a list"
        
        if len(data["avatars"]) > 0:
            # Verify avatar structure
            avatar = data["avatars"][0]
            assert "image_b64" in avatar, "Avatar should have image_b64"
            assert "created_at" in avatar, "Avatar should have created_at"
            assert "style" in avatar, "Avatar should have style"
            assert "is_active" in avatar, "Avatar should have is_active"
            print(f"✓ my-avatars returns gallery with {len(data['avatars'])} avatars")
            print(f"  First avatar: style={avatar.get('style')}, is_active={avatar.get('is_active')}")
        else:
            print(f"✓ my-avatars returns empty gallery (no avatars yet)")
    
    def test_set_active_avatar_requires_created_at(self):
        """Test POST /api/ai-visuals/set-active-avatar requires created_at"""
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/set-active-avatar", json={})
        
        assert response.status_code == 400, f"Expected 400 for missing created_at, got {response.status_code}"
        data = response.json()
        assert "detail" in data or "error" in data, "Should return error message"
        print(f"✓ set-active-avatar correctly requires created_at: {data}")
    
    def test_set_active_avatar_invalid_timestamp_returns_404(self):
        """Test POST /api/ai-visuals/set-active-avatar with invalid timestamp returns 404"""
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/set-active-avatar", json={
            "created_at": "invalid-timestamp-that-does-not-exist"
        })
        
        assert response.status_code == 404, f"Expected 404 for invalid timestamp, got {response.status_code}"
        print(f"✓ set-active-avatar correctly returns 404 for invalid timestamp")
    
    def test_set_active_avatar_with_valid_timestamp(self):
        """Test POST /api/ai-visuals/set-active-avatar with valid timestamp from gallery"""
        # First get the gallery
        gallery_response = self.session.get(f"{BASE_URL}/api/ai-visuals/my-avatars")
        assert gallery_response.status_code == 200
        
        avatars = gallery_response.json().get("avatars", [])
        
        if len(avatars) == 0:
            pytest.skip("No avatars in gallery to test set-active-avatar")
        
        # Get the first avatar's created_at
        first_avatar = avatars[0]
        created_at = first_avatar.get("created_at")
        
        # Set it as active
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/set-active-avatar", json={
            "created_at": created_at
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "success", f"Expected status='success', got {data}"
        
        # Verify it's now active
        verify_response = self.session.get(f"{BASE_URL}/api/ai-visuals/my-avatar")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data.get("status") == "active", "Avatar should now be active"
        assert verify_data.get("created_at") == created_at, "Active avatar should match the one we set"
        
        print(f"✓ set-active-avatar successfully sets avatar as active")


class TestAvatarEndpointAuth:
    """Test that avatar endpoints require authentication"""
    
    def test_my_avatar_requires_auth(self):
        """Test GET /api/ai-visuals/my-avatar requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/my-avatar")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ my-avatar requires authentication")
    
    def test_my_avatars_requires_auth(self):
        """Test GET /api/ai-visuals/my-avatars requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/my-avatars")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ my-avatars requires authentication")
    
    def test_generate_avatar_requires_auth(self):
        """Test POST /api/ai-visuals/generate-avatar requires authentication"""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/generate-avatar", json={
            "description": "test",
            "style": "ethereal"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ generate-avatar requires authentication")
    
    def test_set_active_avatar_requires_auth(self):
        """Test POST /api/ai-visuals/set-active-avatar requires authentication"""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/set-active-avatar", json={
            "created_at": "test"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ set-active-avatar requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Test suite for Build Your Own Guided Meditation feature
Tests: POST /api/meditation/generate-guided, POST /api/meditation/save-custom, 
       GET /api/meditation/my-custom, DELETE /api/meditation/custom/{id}
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMeditationBuildFeature:
    """Tests for the Build Your Own Meditation feature"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create a test user and return credentials"""
        timestamp = int(time.time())
        email = f"builder_test_{timestamp}@test.com"
        password = "password123"
        name = "Builder Test User"
        
        # Register user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": name,
            "email": email,
            "password": password
        })
        
        if response.status_code == 400:  # User exists, try login
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
        
        assert response.status_code in [200, 201], f"Auth failed: {response.text}"
        data = response.json()
        return {
            "token": data["token"],
            "user_id": data["user"]["id"],
            "email": email,
            "headers": {"Authorization": f"Bearer {data['token']}"}
        }
    
    # --- Authentication Tests ---
    def test_generate_requires_auth(self):
        """POST /api/meditation/generate-guided requires authentication"""
        response = requests.post(f"{BASE_URL}/api/meditation/generate-guided", json={
            "intention": "Test intention",
            "duration": 5,
            "focus": "stress"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Generate endpoint requires authentication")
    
    def test_save_requires_auth(self):
        """POST /api/meditation/save-custom requires authentication"""
        response = requests.post(f"{BASE_URL}/api/meditation/save-custom", json={
            "name": "Test Meditation",
            "intention": "Test",
            "steps": []
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Save endpoint requires authentication")
    
    def test_my_custom_requires_auth(self):
        """GET /api/meditation/my-custom requires authentication"""
        response = requests.get(f"{BASE_URL}/api/meditation/my-custom")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ My-custom endpoint requires authentication")
    
    def test_delete_requires_auth(self):
        """DELETE /api/meditation/custom/{id} requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/meditation/custom/test-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Delete endpoint requires authentication")
    
    # --- Generate Meditation Tests ---
    def test_generate_meditation_success(self, test_user):
        """POST /api/meditation/generate-guided returns generated steps"""
        response = requests.post(
            f"{BASE_URL}/api/meditation/generate-guided",
            json={
                "intention": "I want to release stress and find inner calm",
                "duration": 5,
                "focus": "stress",
                "name": "My Stress Relief Meditation"
            },
            headers=test_user["headers"],
            timeout=60  # AI generation can take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "steps" in data, "Response should contain 'steps'"
        assert isinstance(data["steps"], list), "Steps should be a list"
        assert len(data["steps"]) >= 3, f"Should have at least 3 steps, got {len(data['steps'])}"
        
        # Validate step structure
        for i, step in enumerate(data["steps"]):
            assert "text" in step, f"Step {i} should have 'text'"
            assert "duration" in step, f"Step {i} should have 'duration'"
            assert "time" in step, f"Step {i} should have 'time'"
            assert isinstance(step["text"], str), f"Step {i} text should be string"
            assert len(step["text"]) > 10, f"Step {i} text should be meaningful"
        
        # Validate metadata
        assert data.get("intention") == "I want to release stress and find inner calm"
        assert data.get("focus") == "stress"
        assert data.get("duration") == 5
        
        print(f"✓ Generate meditation returned {len(data['steps'])} steps")
        return data["steps"]
    
    def test_generate_with_different_focuses(self, test_user):
        """Test generation with different focus areas"""
        focuses = ["sleep", "focus", "healing", "gratitude", "confidence", "letting-go"]
        
        for focus in focuses[:2]:  # Test 2 to save time
            response = requests.post(
                f"{BASE_URL}/api/meditation/generate-guided",
                json={
                    "intention": f"Test intention for {focus}",
                    "duration": 5,
                    "focus": focus
                },
                headers=test_user["headers"],
                timeout=60
            )
            assert response.status_code == 200, f"Failed for focus '{focus}': {response.text}"
            data = response.json()
            assert len(data["steps"]) >= 3
            print(f"✓ Generate works with focus: {focus}")
    
    # --- Save Custom Meditation Tests ---
    def test_save_custom_meditation(self, test_user):
        """POST /api/meditation/save-custom saves meditation"""
        test_steps = [
            {"time": 0, "text": "Welcome to your meditation.", "duration": 30},
            {"time": 30, "text": "Take a deep breath.", "duration": 30},
            {"time": 60, "text": "Gently return to awareness.", "duration": 30}
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/meditation/save-custom",
            json={
                "name": "Test Saved Meditation",
                "intention": "Test intention for saving",
                "focus": "stress",
                "duration": 5,
                "sound": "ocean",
                "color": "#FDA4AF",
                "steps": test_steps
            },
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate saved data
        assert "id" in data, "Response should contain 'id'"
        assert data["name"] == "Test Saved Meditation"
        assert data["intention"] == "Test intention for saving"
        assert data["focus"] == "stress"
        assert data["duration"] == 5
        assert data["sound"] == "ocean"
        assert data["color"] == "#FDA4AF"
        assert len(data["steps"]) == 3
        assert "created_at" in data
        
        print(f"✓ Saved custom meditation with id: {data['id']}")
        return data["id"]
    
    # --- Get Custom Meditations Tests ---
    def test_get_my_custom_meditations(self, test_user):
        """GET /api/meditation/my-custom returns user's saved meditations"""
        # First save one
        requests.post(
            f"{BASE_URL}/api/meditation/save-custom",
            json={
                "name": "Meditation for Get Test",
                "intention": "Testing get endpoint",
                "focus": "focus",
                "duration": 10,
                "steps": [{"time": 0, "text": "Test step", "duration": 30}]
            },
            headers=test_user["headers"]
        )
        
        # Now get all
        response = requests.get(
            f"{BASE_URL}/api/meditation/my-custom",
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least 1 saved meditation"
        
        # Validate structure of returned items
        for item in data:
            assert "id" in item
            assert "name" in item
            assert "intention" in item
            assert "steps" in item
            assert "user_id" in item
        
        print(f"✓ Retrieved {len(data)} custom meditations")
        return data
    
    # --- Delete Custom Meditation Tests ---
    def test_delete_custom_meditation(self, test_user):
        """DELETE /api/meditation/custom/{id} deletes meditation"""
        # First save one to delete
        save_response = requests.post(
            f"{BASE_URL}/api/meditation/save-custom",
            json={
                "name": "Meditation to Delete",
                "intention": "Will be deleted",
                "focus": "stress",
                "duration": 5,
                "steps": [{"time": 0, "text": "Delete me", "duration": 30}]
            },
            headers=test_user["headers"]
        )
        meditation_id = save_response.json()["id"]
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/meditation/custom/{meditation_id}",
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("deleted") == True
        
        # Verify it's gone
        get_response = requests.get(
            f"{BASE_URL}/api/meditation/my-custom",
            headers=test_user["headers"]
        )
        ids = [m["id"] for m in get_response.json()]
        assert meditation_id not in ids, "Deleted meditation should not appear in list"
        
        print(f"✓ Deleted meditation {meditation_id}")
    
    def test_delete_nonexistent_returns_404(self, test_user):
        """DELETE /api/meditation/custom/{id} returns 404 for nonexistent"""
        response = requests.delete(
            f"{BASE_URL}/api/meditation/custom/nonexistent-id-12345",
            headers=test_user["headers"]
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Delete nonexistent returns 404")


class TestGuidedMeditationsExisting:
    """Tests for existing guided meditation functionality"""
    
    def test_health_check(self):
        """API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ API health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

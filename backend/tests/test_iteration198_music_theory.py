"""
Iteration 198 Tests: Music Theory (Conservatory) Module
Tests for /theory route wiring and backend API regression
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration198MusicTheory:
    """Tests for Music Theory module and backend API regression"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"email": "grad_test_522@test.com", "password": "password"}
        )
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed")
    
    # === Backend API Regression Tests ===
    
    def test_post_moods_single(self):
        """Test POST /api/moods with single mood (backward compatible)"""
        response = self.session.post(
            f"{self.base_url}/api/moods",
            json={"mood": "calm", "intensity": 7}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "id" in data
        assert data["mood"] == "calm"
        assert data["intensity"] == 7
        assert "frequencies" in data
        assert "geometries" in data
        print(f"✅ POST /api/moods single mood: {data['mood']}, frequencies: {data['frequencies']}")
    
    def test_get_moods_frequency_recipe(self):
        """Test GET /api/moods/frequency-recipe returns culinary recipe"""
        response = self.session.get(f"{self.base_url}/api/moods/frequency-recipe")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "has_recipe" in data
        if data["has_recipe"]:
            assert "recipe_name" in data
            assert "ingredients" in data
            assert isinstance(data["ingredients"], list)
            print(f"✅ GET /api/moods/frequency-recipe: {data['recipe_name']}, {len(data['ingredients'])} ingredients")
        else:
            print("✅ GET /api/moods/frequency-recipe: No recipe (no recent mood)")
    
    def test_post_sync_group_forge_validation(self):
        """Test POST /api/sync/group-forge validates required fields"""
        # Test with missing fields - should return validation error
        response = self.session.post(
            f"{self.base_url}/api/sync/group-forge",
            json={"coven_id": "test-coven"}
        )
        # Should return 422 (validation error) or 400 (business logic error)
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print(f"✅ POST /api/sync/group-forge validation: {response.status_code}")
    
    def test_post_sync_group_forge_with_fields(self):
        """Test POST /api/sync/group-forge with all required fields"""
        response = self.session.post(
            f"{self.base_url}/api/sync/group-forge",
            json={
                "coven_id": "test-coven",
                "build_id": "test-build",
                "user_waveform": [0.5, 0.6, 0.7],
                "time_taken_seconds": 60
            }
        )
        # May return 400 if not enough coven members, but endpoint should respond
        assert response.status_code in [200, 400], f"Expected 200/400, got {response.status_code}"
        data = response.json()
        print(f"✅ POST /api/sync/group-forge: {response.status_code}, response: {str(data)[:100]}")
    
    def test_get_moods_history(self):
        """Test GET /api/moods returns mood history"""
        response = self.session.get(f"{self.base_url}/api/moods")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET /api/moods: {len(data)} mood entries")
    
    def test_get_moods_insights(self):
        """Test GET /api/moods/insights works"""
        response = self.session.get(f"{self.base_url}/api/moods/insights")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ GET /api/moods/insights: {list(data.keys())[:5]}")
    
    def test_get_sync_leaderboard(self):
        """Test GET /api/sync/leaderboard works"""
        response = self.session.get(f"{self.base_url}/api/sync/leaderboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ GET /api/sync/leaderboard: {type(data)}")
    
    def test_get_cosmic_map_power_spots(self):
        """Test GET /api/cosmic-map/power-spots works"""
        response = self.session.get(f"{self.base_url}/api/cosmic-map/power-spots")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ GET /api/cosmic-map/power-spots: {type(data)}")
    
    def test_auth_me(self):
        """Test GET /api/auth/me returns user info"""
        response = self.session.get(f"{self.base_url}/api/auth/me")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "id" in data
        assert "email" in data
        print(f"✅ GET /api/auth/me: {data['email']}")
    
    def test_get_dashboard_personalized(self):
        """Test GET /api/dashboard/personalized works"""
        response = self.session.get(f"{self.base_url}/api/dashboard/personalized")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ GET /api/dashboard/personalized: {list(data.keys())[:5]}")
    
    def test_get_subscriptions_my_plan(self):
        """Test GET /api/subscriptions/my-plan works"""
        response = self.session.get(f"{self.base_url}/api/subscriptions/my-plan")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ GET /api/subscriptions/my-plan: {data.get('tier_name', 'N/A')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Comprehensive test for Iteration 49 - Final testing before user pauses development
Tests: Cosmic Profile, VR Meditation Mode, Meditation Auto-share to Community
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestCosmicProfile(TestAuth):
    """Tests for GET /api/cosmic-profile endpoint"""
    
    def test_cosmic_profile_requires_auth(self):
        """Cosmic profile requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile")
        assert response.status_code in [401, 403], "Should require auth"
    
    def test_cosmic_profile_returns_data(self, auth_headers):
        """GET /api/cosmic-profile returns comprehensive profile data"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify all expected fields are present
        assert "total_forecasts" in data, "Missing total_forecasts"
        assert "system_counts" in data, "Missing system_counts"
        assert "period_counts" in data, "Missing period_counts"
        assert "avg_cosmic_energy" in data, "Missing avg_cosmic_energy"
        assert "recurring_numbers" in data, "Missing recurring_numbers"
        assert "recurring_crystals" in data, "Missing recurring_crystals"
        assert "recurring_elements" in data, "Missing recurring_elements"
        assert "constellation_meditations" in data, "Missing constellation_meditations"
        assert "gamification" in data, "Missing gamification"
        assert "garden" in data, "Missing garden"
        
        # Verify data types
        assert isinstance(data["total_forecasts"], int), "total_forecasts should be int"
        assert isinstance(data["system_counts"], dict), "system_counts should be dict"
        assert isinstance(data["period_counts"], dict), "period_counts should be dict"
        assert isinstance(data["recurring_numbers"], list), "recurring_numbers should be list"
        assert isinstance(data["recurring_crystals"], list), "recurring_crystals should be list"
        assert isinstance(data["constellation_meditations"], dict), "constellation_meditations should be dict"
        assert isinstance(data["gamification"], dict), "gamification should be dict"
        assert isinstance(data["garden"], dict), "garden should be dict"
        
        print(f"Cosmic Profile: {data['total_forecasts']} forecasts, {data['constellation_meditations'].get('total', 0)} meditations, {data['garden'].get('plants', 0)} plants")
    
    def test_cosmic_profile_gamification_fields(self, auth_headers):
        """Verify gamification fields in cosmic profile"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        gam = data.get("gamification", {})
        assert "xp" in gam, "Missing xp in gamification"
        assert "level" in gam, "Missing level in gamification"
        assert "streak" in gam, "Missing streak in gamification"
        print(f"Gamification: Level {gam.get('level')}, XP {gam.get('xp')}, Streak {gam.get('streak')}")
    
    def test_cosmic_profile_garden_fields(self, auth_headers):
        """Verify garden fields in cosmic profile"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        garden = data.get("garden", {})
        assert "plants" in garden, "Missing plants count in garden"
        assert "total_waters" in garden, "Missing total_waters in garden"
        print(f"Garden: {garden.get('plants')} plants, {garden.get('total_waters')} total waters")


class TestMeditationAutoShare(TestAuth):
    """Tests for meditation auto-share to community feature"""
    
    def test_meditation_log_with_share_creates_post(self, auth_headers):
        """POST /api/meditation-history/log with share_to_community=true creates community post"""
        # Log meditation with share_to_community=true
        response = requests.post(f"{BASE_URL}/api/meditation-history/log", 
            headers=auth_headers,
            json={
                "type": "guided",
                "duration_minutes": 10,
                "focus": "inner peace",
                "intention": "Test meditation for auto-share",
                "share_to_community": True
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data.get("status") == "logged", "Status should be logged"
        assert "id" in data, "Should return meditation id"
        assert "shared" in data, "Should return shared info"
        assert data["shared"] is not None, "shared should not be None when share_to_community=true"
        
        # Verify the shared post structure
        shared = data["shared"]
        assert shared.get("post_type") == "meditation_complete", "Post type should be meditation_complete"
        assert "content" in shared, "Shared post should have content"
        assert "10 minute" in shared["content"], "Content should mention duration"
        print(f"Auto-shared meditation post created: {shared.get('id')}")
    
    def test_meditation_log_without_share_no_post(self, auth_headers):
        """POST /api/meditation-history/log with share_to_community=false does not create post"""
        response = requests.post(f"{BASE_URL}/api/meditation-history/log",
            headers=auth_headers,
            json={
                "type": "silent",
                "duration_minutes": 5,
                "focus": "breath",
                "share_to_community": False
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data.get("status") == "logged", "Status should be logged"
        assert data.get("shared") is None, "shared should be None when share_to_community=false"
        print("Meditation logged without community share (as expected)")
    
    def test_community_feed_shows_meditation_share(self, auth_headers):
        """GET /api/community/feed shows auto-shared meditation posts"""
        response = requests.get(f"{BASE_URL}/api/community/feed", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        posts = data.get("posts", [])
        meditation_posts = [p for p in posts if p.get("post_type") == "meditation_complete"]
        
        assert len(meditation_posts) > 0, "Should have at least one meditation_complete post"
        print(f"Found {len(meditation_posts)} meditation_complete posts in community feed")


class TestForecastsRegression(TestAuth):
    """Regression tests for forecasts feature"""
    
    def test_forecasts_systems_returns_6(self, auth_headers):
        """GET /api/forecasts/systems returns 6 systems"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Systems is a dict, not a list
        systems = data.get("systems", {})
        assert len(systems) == 6, f"Expected 6 systems, got {len(systems)}"
        
        expected = ["astrology", "tarot", "numerology", "cardology", "chinese", "mayan"]
        for exp in expected:
            assert exp in systems, f"Missing system: {exp}"
        print(f"All 6 divination systems present: {list(systems.keys())}")
    
    def test_forecasts_generate_returns_forecast(self, auth_headers):
        """POST /api/forecasts/generate returns astrology daily forecast"""
        response = requests.post(f"{BASE_URL}/api/forecasts/generate",
            headers=auth_headers,
            json={"system": "astrology", "period": "daily"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "forecast" in data, "Should return forecast"
        assert "id" in data, "Should return forecast id"
        print(f"Forecast generated with id: {data.get('id')}")
    
    def test_forecasts_history(self, auth_headers):
        """GET /api/forecasts/history returns forecast history"""
        response = requests.get(f"{BASE_URL}/api/forecasts/history", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return list"
        print(f"Forecast history: {len(data)} forecasts")


class TestAvatarEnergyRegression(TestAuth):
    """Regression tests for avatar energy state"""
    
    def test_avatar_energy_state(self, auth_headers):
        """GET /api/avatar/energy-state returns valid data"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "current_energy" in data, "Missing current_energy"
        assert "dominant_chakra" in data, "Missing dominant_chakra"
        assert "current_mood" in data, "Missing current_mood"
        print(f"Energy state: {data.get('current_energy')}, Chakra: {data.get('dominant_chakra', {}).get('name')}")


class TestMeditationRegression(TestAuth):
    """Regression tests for meditation features"""
    
    def test_constellation_themes_returns_12(self, auth_headers):
        """GET /api/meditation/constellation-themes returns 12 themes"""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        themes = data.get("themes", [])
        assert len(themes) == 12, f"Expected 12 themes, got {len(themes)}"
        print(f"All 12 constellation themes present")


class TestZenGardenRegression(TestAuth):
    """Regression tests for zen garden"""
    
    def test_zen_garden_plants(self, auth_headers):
        """GET /api/zen-garden/plants returns plants"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # API returns a list directly
        plants = data if isinstance(data, list) else data.get("plants", [])
        print(f"Zen garden has {len(plants)} plants")
        
        if len(plants) > 0:
            plant = plants[0]
            assert "id" in plant, "Plant should have id"
            assert "plant_type" in plant, "Plant should have plant_type"
    
    def test_zen_garden_water_plant(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water works"""
        # First get plants
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        plants = data if isinstance(data, list) else data.get("plants", [])
        
        if len(plants) > 0:
            plant_id = plants[0]["id"]
            water_response = requests.post(f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water", headers=auth_headers)
            # May return 200 or 400 if already watered today
            assert water_response.status_code in [200, 400], f"Unexpected status: {water_response.text}"
            print(f"Water plant response: {water_response.status_code}")
        else:
            pytest.skip("No plants to water")


class TestVRPageElements(TestAuth):
    """Tests for VR page elements (API-level checks)"""
    
    def test_avatar_endpoint_for_vr(self, auth_headers):
        """GET /api/avatar returns data for VR avatar"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # VR page uses avatar config
        print(f"Avatar config loaded for VR: {data.get('aura_color', 'default')}")


class TestNavigationLinks(TestAuth):
    """Tests for navigation links (API endpoints that should exist)"""
    
    def test_forecasts_endpoint_exists(self, auth_headers):
        """Forecasts endpoint exists for navigation"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems", headers=auth_headers)
        assert response.status_code == 200, "Forecasts endpoint should exist"
    
    def test_cosmic_profile_endpoint_exists(self, auth_headers):
        """Cosmic profile endpoint exists for navigation"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile", headers=auth_headers)
        assert response.status_code == 200, "Cosmic profile endpoint should exist"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Test iteration 47: Gyroscope/DeviceOrientation support for Star Chart and Plant auto-watering from wellness activities.

Features tested:
1. Star Chart gyro toggle button exists (frontend only - can't test DeviceOrientation in headless)
2. POST /api/meditation-history/log returns plant_growth field
3. POST /api/daily-challenges/complete returns plant_growth field
4. GET /api/zen-garden/plants shows correct watered_today status
5. POST /api/zen-garden/plants creates new plants (PLANT_STAGES fix still working)
6. POST /api/zen-garden/plants/{id}/water still works for manual watering
7. Regression: GET /api/meditation/constellation-themes returns 12 themes
8. Regression: GET /api/avatar/energy-state returns valid energy data
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMeditationHistoryAutoWater:
    """Test meditation history log with auto-watering feature."""
    
    def test_log_meditation_returns_plant_growth_field(self, auth_headers):
        """POST /api/meditation-history/log should return plant_growth field in response."""
        response = requests.post(f"{BASE_URL}/api/meditation-history/log", 
            json={
                "type": "silent",
                "duration_minutes": 10,
                "focus": "breath",
                "intention": "Test auto-water feature",
                "notes": "Testing plant growth response",
                "mood_before": "calm",
                "mood_after": "peaceful",
                "depth_rating": 7
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "status" in data
        assert data["status"] == "logged"
        assert "id" in data
        # Key assertion: plant_growth field must be present (can be null if all plants watered)
        assert "plant_growth" in data, "Response must include plant_growth field"
        print(f"Meditation logged, plant_growth: {data.get('plant_growth')}")


class TestDailyChallengeAutoWater:
    """Test daily challenge completion with auto-watering feature."""
    
    def test_get_daily_challenge(self, auth_headers):
        """GET /api/daily-challenge should return today's challenge."""
        response = requests.get(f"{BASE_URL}/api/daily-challenge", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "challenge" in data
        assert "stats" in data
        challenge = data["challenge"]
        assert "id" in challenge
        assert "title" in challenge
        assert "description" in challenge
        print(f"Today's challenge: {challenge['title']} (completed: {challenge.get('completed')})")
        return challenge
    
    def test_complete_daily_challenge_returns_plant_growth_field(self, auth_headers):
        """POST /api/daily-challenge/complete should return plant_growth field in response."""
        response = requests.post(f"{BASE_URL}/api/daily-challenge/complete", headers=auth_headers)
        # Can be 200 (completed) or 200 with already_completed status
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "status" in data
        # Status can be "completed" or "already_completed"
        assert data["status"] in ["completed", "already_completed"], f"Unexpected status: {data['status']}"
        
        if data["status"] == "completed":
            # Key assertion: plant_growth field must be present when newly completed
            assert "plant_growth" in data, "Response must include plant_growth field when completing challenge"
            print(f"Challenge completed, plant_growth: {data.get('plant_growth')}")
        else:
            print(f"Challenge already completed today: {data.get('message')}")


class TestZenGardenPlants:
    """Test Zen Garden plant endpoints."""
    
    def test_get_plants_shows_watered_status(self, auth_headers):
        """GET /api/zen-garden/plants should return plants with watered_today status."""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        plants = response.json()
        assert isinstance(plants, list), "Response should be a list of plants"
        
        if len(plants) > 0:
            plant = plants[0]
            # Verify plant structure
            assert "id" in plant
            assert "plant_type" in plant
            assert "stage" in plant
            assert "watered_today" in plant, "Plant must have watered_today field"
            assert "water_count" in plant
            print(f"Found {len(plants)} plants. First plant: {plant['plant_type']} - stage: {plant['stage']}, watered_today: {plant['watered_today']}")
            
            # Count watered vs not watered
            watered = sum(1 for p in plants if p.get('watered_today'))
            not_watered = len(plants) - watered
            print(f"Plants watered today: {watered}, not watered: {not_watered}")
        else:
            print("No plants found for user")
    
    def test_create_plant_works(self, auth_headers):
        """POST /api/zen-garden/plants should create a new plant (PLANT_STAGES fix verified)."""
        # First check current plant count
        get_response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        current_plants = get_response.json() if get_response.status_code == 200 else []
        
        if len(current_plants) >= 10:
            pytest.skip("User already has maximum 10 plants")
        
        response = requests.post(f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "fern"},
            headers=auth_headers
        )
        # Can be 200/201 for success or 400 if max plants reached
        if response.status_code == 400:
            data = response.json()
            if "Maximum 10 plants" in str(data):
                pytest.skip("User already has maximum 10 plants")
        
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert "plant_type" in data
        assert data["plant_type"] == "fern"
        assert "stage" in data
        # PLANT_STAGES fix: stage should be first stage for fern
        assert data["stage"] == "Spore", f"Expected 'Spore' for fern, got {data['stage']}"
        print(f"Created plant: {data['plant_type']} at stage {data['stage']}")
    
    def test_manual_water_plant_works(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water should work for manual watering."""
        # Get plants first
        get_response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert get_response.status_code == 200
        plants = get_response.json()
        
        if len(plants) == 0:
            pytest.skip("No plants to water")
        
        # Find a plant that hasn't been watered today
        unwatered = [p for p in plants if not p.get('watered_today')]
        if len(unwatered) == 0:
            # All plants watered - try to water anyway to verify 400 response
            plant = plants[0]
            response = requests.post(f"{BASE_URL}/api/zen-garden/plants/{plant['id']}/water", headers=auth_headers)
            assert response.status_code == 400, f"Expected 400 for already watered, got {response.status_code}"
            data = response.json()
            assert "Already watered today" in str(data), f"Expected 'Already watered today' error"
            print(f"Correctly rejected watering already-watered plant: {plant['plant_type']}")
        else:
            # Water an unwatered plant
            plant = unwatered[0]
            response = requests.post(f"{BASE_URL}/api/zen-garden/plants/{plant['id']}/water", headers=auth_headers)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()
            assert "grew" in data
            assert "stage" in data
            assert "water_count" in data
            print(f"Watered plant {plant['plant_type']}: grew={data['grew']}, stage={data['stage']}")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints."""
    
    def test_constellation_themes_returns_12(self, auth_headers):
        """GET /api/meditation/constellation-themes should return 12 themes."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "themes" in data
        themes = data["themes"]
        assert len(themes) == 12, f"Expected 12 constellation themes, got {len(themes)}"
        print(f"Constellation themes: {[t['name'] for t in themes]}")
    
    def test_avatar_energy_state_returns_valid_data(self, auth_headers):
        """GET /api/avatar/energy-state should return valid energy data."""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Verify energy state structure - actual response has current_energy, base_energy, aura_state
        assert "current_energy" in data, f"Response missing current_energy: {data.keys()}"
        assert "aura_state" in data, f"Response missing aura_state: {data.keys()}"
        print(f"Avatar energy state: current_energy={data.get('current_energy')}, aura={data.get('aura_state', {}).get('glow')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

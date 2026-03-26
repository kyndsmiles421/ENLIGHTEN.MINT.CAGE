"""
Test Suite for Iteration 46:
1. Zen Garden Bug Fix - PLANT_STAGES and PLANT_WATERS_PER_STAGE constants restored
2. Star Chart Constellation-Meditation Integration - Meditate button in constellation detail
3. Meditation page constellation query param - auto-switches to Cosmic Meditations mode
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestZenGardenPlants(TestAuth):
    """Zen Garden Plant API tests - Bug fix verification"""
    
    def test_get_plants_returns_200(self, auth_headers):
        """GET /api/zen-garden/plants returns 200"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} plants")
    
    def test_get_plants_has_correct_fields(self, auth_headers):
        """Plants have stage, watered_today, water_count fields"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            plant = data[0]
            assert "stage" in plant, "Missing 'stage' field"
            assert "watered_today" in plant, "Missing 'watered_today' field"
            assert "water_count" in plant, "Missing 'water_count' field"
            assert "plant_type" in plant, "Missing 'plant_type' field"
            print(f"Plant fields verified: {list(plant.keys())}")
    
    def test_create_plant_lotus_works(self, auth_headers):
        """POST /api/zen-garden/plants with plant_type=lotus creates a plant (bug fix test)"""
        # This was the bug - PLANT_STAGES was missing causing NameError
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            headers=auth_headers,
            json={"plant_type": "lotus"}
        )
        # May return 400 if max plants reached, but should NOT return 500 (NameError)
        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}, {response.text}"
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["plant_type"] == "lotus"
            assert data["stage"] == "Seed"  # First stage for lotus
            print(f"Created lotus plant: {data['id']}")
        else:
            # 400 means max plants reached - that's OK
            print(f"Max plants reached: {response.json()}")
    
    def test_create_plant_sage_works(self, auth_headers):
        """POST /api/zen-garden/plants with plant_type=sage creates a plant"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            headers=auth_headers,
            json={"plant_type": "sage"}
        )
        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}, {response.text}"
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["plant_type"] == "sage"
            assert data["stage"] == "Seed"  # First stage for sage
            print(f"Created sage plant: {data['id']}")
    
    def test_create_plant_invalid_type_returns_400(self, auth_headers):
        """POST /api/zen-garden/plants with invalid plant_type returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            headers=auth_headers,
            json={"plant_type": "invalid_plant"}
        )
        assert response.status_code == 400
        assert "Invalid plant type" in response.json().get("detail", "")
    
    def test_water_plant_success(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water waters a plant successfully"""
        # First get plants to find one that hasn't been watered today
        plants_response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert plants_response.status_code == 200
        plants = plants_response.json()
        
        # Find a plant not watered today
        unwatered = [p for p in plants if not p.get("watered_today", False)]
        if not unwatered:
            pytest.skip("All plants already watered today")
        
        plant_id = unwatered[0]["id"]
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "grew" in data
        assert "stage" in data
        assert "water_count" in data
        print(f"Watered plant {plant_id}: grew={data['grew']}, stage={data['stage']}")
    
    def test_water_plant_already_watered_returns_400(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water a second time returns 400"""
        # Get plants to find one that was watered today
        plants_response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert plants_response.status_code == 200
        plants = plants_response.json()
        
        # Find a plant watered today
        watered = [p for p in plants if p.get("watered_today", False)]
        if not watered:
            pytest.skip("No plants watered today to test")
        
        plant_id = watered[0]["id"]
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water",
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "Already watered today" in response.json().get("detail", "")
        print(f"Correctly rejected second watering for plant {plant_id}")
    
    def test_water_nonexistent_plant_returns_404(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water for non-existent plant returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/nonexistent-id/water",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestConstellationThemes(TestAuth):
    """Constellation Meditation Themes API tests"""
    
    def test_constellation_themes_returns_200(self, auth_headers):
        """GET /api/meditation/constellation-themes returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/meditation/constellation-themes",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "themes" in data
        print(f"Constellation themes endpoint working")
    
    def test_constellation_themes_returns_12_themes(self, auth_headers):
        """GET /api/meditation/constellation-themes returns 12 zodiac themes"""
        response = requests.get(
            f"{BASE_URL}/api/meditation/constellation-themes",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        themes = data.get("themes", [])
        assert len(themes) == 12, f"Expected 12 themes, got {len(themes)}"
        
        # Verify all zodiac signs present
        expected_ids = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                       'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
        actual_ids = [t["id"] for t in themes]
        for expected in expected_ids:
            assert expected in actual_ids, f"Missing zodiac sign: {expected}"
        print(f"All 12 zodiac themes present: {actual_ids}")
    
    def test_constellation_themes_structure(self, auth_headers):
        """Each theme has required fields"""
        response = requests.get(
            f"{BASE_URL}/api/meditation/constellation-themes",
            headers=auth_headers
        )
        assert response.status_code == 200
        themes = response.json().get("themes", [])
        
        required_fields = ["id", "name", "symbol", "element", "color", "deity", 
                         "figure", "theme", "lesson"]
        for theme in themes:
            for field in required_fields:
                assert field in theme, f"Theme {theme.get('id')} missing field: {field}"
        print(f"All themes have required fields")


class TestGuidedMeditations(TestAuth):
    """Guided Meditations regression tests"""
    
    def test_guided_meditations_still_work(self, auth_headers):
        """GET /api/meditation/my-custom still returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/meditation/my-custom",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Guided meditations working, found {len(data)} custom meditations")


class TestAvatarEnergyState(TestAuth):
    """Avatar Energy State regression tests"""
    
    def test_avatar_energy_state_still_works(self, auth_headers):
        """GET /api/avatar/energy-state still returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/avatar/energy-state",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "energy_level" in data or "level" in data or isinstance(data, dict)
        print(f"Avatar energy state working: {list(data.keys())[:5]}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

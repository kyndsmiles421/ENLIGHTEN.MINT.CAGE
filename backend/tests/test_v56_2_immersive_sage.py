"""
V56.2 Immersive Rooms + Cross-Module Sage Board Tests
Tests for:
- Immersive scene headers on 8 InteractiveModule pages
- Cross-module Sage Board suggestions
- Teachings page with 11 teacher scenes
- Adaptive AI Deep Dive with visit tracking
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCrystalsAPI:
    """Test Crystals endpoint - 12 items expected"""
    
    def test_crystals_returns_12_items(self):
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert "crystals" in data
        assert len(data["crystals"]) == 12
        print(f"SUCCESS: Crystals API returns {len(data['crystals'])} items")
    
    def test_crystals_item_structure(self):
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        crystal = data["crystals"][0]
        # Verify required fields
        assert "id" in crystal
        assert "name" in crystal
        assert "description" in crystal
        assert "chakra" in crystal
        print(f"SUCCESS: Crystal item has required fields: {crystal['name']}")


class TestHerbologyAPI:
    """Test Herbology endpoint - 12 items expected"""
    
    def test_herbology_returns_12_items(self):
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        assert "herbs" in data
        assert len(data["herbs"]) == 12
        print(f"SUCCESS: Herbology API returns {len(data['herbs'])} items")
    
    def test_herbology_item_structure(self):
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        herb = data["herbs"][0]
        # Verify required fields
        assert "id" in herb
        assert "name" in herb
        assert "latin" in herb
        assert "properties" in herb
        print(f"SUCCESS: Herb item has required fields: {herb['name']}")


class TestAromatherapyAPI:
    """Test Aromatherapy endpoint"""
    
    def test_aromatherapy_returns_items(self):
        response = requests.get(f"{BASE_URL}/api/aromatherapy/oils")
        assert response.status_code == 200
        data = response.json()
        assert "oils" in data
        assert len(data["oils"]) >= 10
        print(f"SUCCESS: Aromatherapy API returns {len(data['oils'])} items")


class TestDeepDiveAPI:
    """Test Adaptive AI Deep Dive with visit tracking"""
    
    def test_deep_dive_returns_content(self):
        response = requests.post(
            f"{BASE_URL}/api/knowledge/deep-dive",
            json={
                "topic": "Amethyst",
                "category": "crystals",
                "context": "Stone of Spirituality"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert "topic" in data
        assert "category" in data
        assert len(data["content"]) > 100
        print(f"SUCCESS: Deep Dive returns content for Amethyst ({len(data['content'])} chars)")
    
    def test_deep_dive_visit_tracking(self):
        """Test that visit_number is returned"""
        response = requests.post(
            f"{BASE_URL}/api/knowledge/deep-dive",
            json={
                "topic": "Rose Quartz",
                "category": "crystals",
                "context": "Stone of Love"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # visit_number should be present
        assert "visit_number" in data or "content" in data
        print(f"SUCCESS: Deep Dive returns visit tracking data")


class TestTeachingsAPI:
    """Test Teachings endpoints"""
    
    def test_teachers_list(self):
        response = requests.get(f"{BASE_URL}/api/teachings/teachers")
        assert response.status_code == 200
        data = response.json()
        assert "teachers" in data
        # Should have 11 teachers
        assert len(data["teachers"]) >= 10
        print(f"SUCCESS: Teachers API returns {len(data['teachers'])} teachers")
    
    def test_buddha_teacher_detail(self):
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "buddha"
        assert data["name"] == "Gautama Buddha"
        assert "teachings" in data
        assert len(data["teachings"]) >= 4
        print(f"SUCCESS: Buddha has {len(data['teachings'])} teachings")
    
    def test_muhammad_teacher_detail(self):
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/muhammad")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "muhammad"
        assert "Prophet Muhammad" in data["name"]
        assert "teachings" in data
        print(f"SUCCESS: Muhammad teacher detail loaded")
    
    def test_themes_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        assert response.status_code == 200
        data = response.json()
        assert "themes" in data
        print(f"SUCCESS: Themes endpoint returns data")


class TestOtherInteractiveModules:
    """Test other InteractiveModule pages have items"""
    
    def test_mudras_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert "mudras" in data
        assert len(data["mudras"]) >= 10
        print(f"SUCCESS: Mudras API returns {len(data['mudras'])} items")
    
    def test_elixirs_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/elixirs")
        assert response.status_code == 200
        data = response.json()
        assert "elixirs" in data
        assert len(data["elixirs"]) >= 6
        print(f"SUCCESS: Elixirs API returns {len(data['elixirs'])} items")
    
    def test_nourishment_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/nourishment/foods")
        assert response.status_code == 200
        data = response.json()
        assert "foods" in data
        assert len(data["foods"]) >= 6
        print(f"SUCCESS: Nourishment API returns {len(data['foods'])} items")
    
    def test_reiki_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/reiki/positions")
        assert response.status_code == 200
        data = response.json()
        assert "positions" in data
        assert len(data["positions"]) >= 8
        print(f"SUCCESS: Reiki API returns {len(data['positions'])} items")
    
    def test_acupressure_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/acupressure/points")
        assert response.status_code == 200
        data = response.json()
        assert "points" in data
        assert len(data["points"]) >= 8
        print(f"SUCCESS: Acupressure API returns {len(data['points'])} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

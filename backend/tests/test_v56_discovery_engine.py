"""
V56.0 Discovery Exploration Engine Backend Tests
Tests: milestones API, gain-xp endpoint, crystals/herbology data endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMilestonesAPI:
    """V56.0 Cross-system milestones API tests"""
    
    def test_get_milestones_returns_list(self, auth_headers):
        """GET /api/rpg/milestones returns milestone list with progress"""
        response = requests.get(f"{BASE_URL}/api/rpg/milestones", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "milestones" in data, "Response should contain 'milestones' key"
        assert isinstance(data["milestones"], list), "Milestones should be a list"
        
        # Check milestone structure
        if len(data["milestones"]) > 0:
            milestone = data["milestones"][0]
            assert "id" in milestone, "Milestone should have 'id'"
            assert "label" in milestone, "Milestone should have 'label'"
            assert "source" in milestone, "Milestone should have 'source'"
            assert "required" in milestone, "Milestone should have 'required'"
            assert "progress" in milestone, "Milestone should have 'progress'"
            assert "completed" in milestone, "Milestone should have 'completed'"
            print(f"✓ Found {len(data['milestones'])} milestones")
    
    def test_milestones_contains_expected_definitions(self, auth_headers):
        """Verify expected milestone definitions are present"""
        response = requests.get(f"{BASE_URL}/api/rpg/milestones", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        milestone_ids = {m["id"] for m in data["milestones"]}
        
        # Check for expected milestones from MILESTONE_DEFINITIONS
        expected_ids = ["air_temple_quest", "crystal_skin_001", "mystic_cloak_001", "herbalist_badge"]
        for expected_id in expected_ids:
            assert expected_id in milestone_ids, f"Expected milestone '{expected_id}' not found"
        print(f"✓ All expected milestone definitions present")


class TestGainXPAPI:
    """V56.0 XP gain endpoint tests"""
    
    def test_gain_xp_returns_correct_structure(self, auth_headers):
        """POST /api/rpg/character/gain-xp returns xp_gained, total_xp, level"""
        response = requests.post(
            f"{BASE_URL}/api/rpg/character/gain-xp",
            headers=auth_headers,
            json={"amount": 5, "source": "test_discovery"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp_gained" in data, "Response should contain 'xp_gained'"
        assert "total_xp" in data, "Response should contain 'total_xp'"
        assert "level" in data, "Response should contain 'level'"
        assert data["xp_gained"] == 5, f"Expected xp_gained=5, got {data['xp_gained']}"
        print(f"✓ XP gain working: +{data['xp_gained']} XP, total: {data['total_xp']}, level: {data['level']}")
    
    def test_gain_xp_with_different_sources(self, auth_headers):
        """Test XP gain with various activity sources"""
        sources = ["crystals", "herbology", "meditation_session", "oracle_reading"]
        
        for source in sources:
            response = requests.post(
                f"{BASE_URL}/api/rpg/character/gain-xp",
                headers=auth_headers,
                json={"amount": 8, "source": source}
            )
            assert response.status_code == 200, f"XP gain failed for source '{source}': {response.text}"
            data = response.json()
            assert data["xp_gained"] == 8
            print(f"✓ XP gain for '{source}': +8 XP")


class TestCharacterAPI:
    """Character endpoint tests"""
    
    def test_get_character_returns_full_data(self, auth_headers):
        """GET /api/rpg/character returns level, xp_current, xp_next, xp_total"""
        response = requests.get(f"{BASE_URL}/api/rpg/character", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "level" in data, "Response should contain 'level'"
        assert "xp_current" in data, "Response should contain 'xp_current'"
        assert "xp_next" in data, "Response should contain 'xp_next'"
        assert "xp_total" in data, "Response should contain 'xp_total'"
        assert isinstance(data["level"], int), "Level should be an integer"
        print(f"✓ Character data: Level {data['level']}, XP {data['xp_current']}/{data['xp_next']}")


class TestCrystalsAPI:
    """Crystals data endpoint tests"""
    
    def test_get_crystals_returns_list(self):
        """GET /api/crystals returns crystal list for discovery grid"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "crystals" in data, "Response should contain 'crystals' key"
        assert isinstance(data["crystals"], list), "Crystals should be a list"
        assert len(data["crystals"]) > 0, "Should have at least one crystal"
        
        # Check crystal structure for discovery grid
        crystal = data["crystals"][0]
        assert "name" in crystal, "Crystal should have 'name'"
        print(f"✓ Found {len(data['crystals'])} crystals for discovery grid")
    
    def test_crystals_have_required_fields_for_discovery(self):
        """Crystals should have fields needed for DiscoveryNode component"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        
        data = response.json()
        crystal = data["crystals"][0]
        
        # Fields used by DiscoveryNode
        required_fields = ["name"]  # name is required, others are optional
        for field in required_fields:
            assert field in crystal, f"Crystal missing required field '{field}'"
        print(f"✓ Crystal has required fields for DiscoveryNode")


class TestHerbologyAPI:
    """Herbology data endpoint tests"""
    
    def test_get_herbs_returns_list(self):
        """GET /api/herbology/herbs returns herb list for discovery grid"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "herbs" in data, "Response should contain 'herbs' key"
        assert isinstance(data["herbs"], list), "Herbs should be a list"
        assert len(data["herbs"]) > 0, "Should have at least one herb"
        
        herb = data["herbs"][0]
        assert "name" in herb, "Herb should have 'name'"
        print(f"✓ Found {len(data['herbs'])} herbs for discovery grid")


class TestOracleAPI:
    """Oracle endpoints for atmospheric room testing"""
    
    def test_get_zodiac_signs(self):
        """GET /api/oracle/zodiac returns zodiac data"""
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return list of zodiac signs"
        print(f"✓ Found {len(data)} zodiac signs")
    
    def test_get_sacred_geometry(self):
        """GET /api/oracle/sacred-geometry returns geometry patterns"""
        response = requests.get(f"{BASE_URL}/api/oracle/sacred-geometry")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return list of geometry patterns"
        print(f"✓ Found {len(data)} sacred geometry patterns")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

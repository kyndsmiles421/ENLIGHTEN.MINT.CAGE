"""
V56.0 Vitality Overlay Backend Tests
Tests for:
- GET /api/rpg/milestones - milestone list with progress tracking
- POST /api/rpg/milestones/claim - claim completed milestone
- POST /api/rpg/character/gain-xp - XP gain with level-up data
- POST /api/transmuter/work-submit - dust earning
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


class TestV56VitalityOverlay:
    """V56.0 Vitality Overlay API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.auth_token = token
        else:
            pytest.skip(f"Login failed: {login_res.status_code}")
    
    # ═══════════════════════════════════════════════════════════════
    # RPG MILESTONES TESTS
    # ═══════════════════════════════════════════════════════════════
    
    def test_get_milestones_returns_list(self):
        """GET /api/rpg/milestones returns milestone list with progress tracking"""
        response = self.session.get(f"{BASE_URL}/api/rpg/milestones")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "milestones" in data, "Response should contain 'milestones' key"
        assert isinstance(data["milestones"], list), "Milestones should be a list"
        
        # Verify milestone structure
        if len(data["milestones"]) > 0:
            milestone = data["milestones"][0]
            assert "id" in milestone, "Milestone should have 'id'"
            assert "label" in milestone, "Milestone should have 'label'"
            assert "source" in milestone, "Milestone should have 'source'"
            assert "required" in milestone, "Milestone should have 'required'"
            assert "progress" in milestone, "Milestone should have 'progress'"
            assert "completed" in milestone, "Milestone should have 'completed'"
            assert "reward_item" in milestone, "Milestone should have 'reward_item'"
            
            print(f"✓ Found {len(data['milestones'])} milestones")
            print(f"  First milestone: {milestone['label']} ({milestone['progress']}/{milestone['required']})")
    
    def test_milestones_have_expected_definitions(self):
        """Verify expected milestone definitions exist"""
        response = self.session.get(f"{BASE_URL}/api/rpg/milestones")
        assert response.status_code == 200
        
        data = response.json()
        milestone_ids = {m["id"] for m in data["milestones"]}
        
        # Check for expected milestones from MILESTONE_DEFINITIONS
        expected_ids = [
            "air_temple_quest",
            "crystal_skin_001",
            "mystic_cloak_001",
            "dream_realms_access",
            "ritual_master_badge",
            "mood_cartographer",
        ]
        
        for expected_id in expected_ids:
            assert expected_id in milestone_ids, f"Expected milestone '{expected_id}' not found"
        
        print(f"✓ All expected milestone definitions present")
    
    def test_claim_milestone_requires_milestone_id(self):
        """POST /api/rpg/milestones/claim requires milestone_id"""
        response = self.session.post(f"{BASE_URL}/api/rpg/milestones/claim", json={})
        
        assert response.status_code == 400, f"Expected 400 for missing milestone_id, got {response.status_code}"
        print("✓ Claim endpoint validates milestone_id requirement")
    
    def test_claim_milestone_invalid_id(self):
        """POST /api/rpg/milestones/claim returns 404 for invalid milestone"""
        response = self.session.post(f"{BASE_URL}/api/rpg/milestones/claim", json={
            "milestone_id": "nonexistent_milestone_xyz"
        })
        
        assert response.status_code == 404, f"Expected 404 for invalid milestone, got {response.status_code}"
        print("✓ Claim endpoint returns 404 for invalid milestone")
    
    # ═══════════════════════════════════════════════════════════════
    # RPG CHARACTER GAIN-XP TESTS
    # ═══════════════════════════════════════════════════════════════
    
    def test_gain_xp_returns_correct_structure(self):
        """POST /api/rpg/character/gain-xp returns XP gain data"""
        response = self.session.post(f"{BASE_URL}/api/rpg/character/gain-xp", json={
            "amount": 10,
            "source": "test_activity"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp_gained" in data, "Response should contain 'xp_gained'"
        assert "total_xp" in data, "Response should contain 'total_xp'"
        assert "level" in data, "Response should contain 'level'"
        
        assert data["xp_gained"] == 10, f"Expected xp_gained=10, got {data['xp_gained']}"
        assert isinstance(data["total_xp"], int), "total_xp should be an integer"
        assert isinstance(data["level"], int), "level should be an integer"
        
        print(f"✓ XP gain successful: +{data['xp_gained']} XP, Total: {data['total_xp']}, Level: {data['level']}")
    
    def test_gain_xp_with_source(self):
        """POST /api/rpg/character/gain-xp records source correctly"""
        response = self.session.post(f"{BASE_URL}/api/rpg/character/gain-xp", json={
            "amount": 5,
            "source": "breathing_exercise"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["xp_gained"] == 5
        print(f"✓ XP gain with source 'breathing_exercise' recorded")
    
    def test_gain_xp_level_up_structure(self):
        """POST /api/rpg/character/gain-xp returns level-up data when applicable"""
        # First get current character state
        char_res = self.session.get(f"{BASE_URL}/api/rpg/character")
        assert char_res.status_code == 200
        
        # The response structure should support level_up, levels_gained, stat_points_earned
        # We can't guarantee a level-up, but we verify the endpoint works
        response = self.session.post(f"{BASE_URL}/api/rpg/character/gain-xp", json={
            "amount": 1,
            "source": "test_level_check"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # These fields should exist if level_up occurred
        if data.get("level_up"):
            assert "levels_gained" in data, "Level-up should include 'levels_gained'"
            assert "stat_points_earned" in data, "Level-up should include 'stat_points_earned'"
            print(f"✓ Level-up detected: +{data['levels_gained']} levels, +{data['stat_points_earned']} stat points")
        else:
            print(f"✓ XP gain without level-up (expected behavior)")
    
    # ═══════════════════════════════════════════════════════════════
    # TRANSMUTER WORK-SUBMIT TESTS
    # ═══════════════════════════════════════════════════════════════
    
    def test_work_submit_returns_dust(self):
        """POST /api/transmuter/work-submit returns earned dust and dust_balance"""
        response = self.session.post(f"{BASE_URL}/api/transmuter/work-submit", json={
            "module": "breathing_exercise",
            "interaction_weight": 50,
            "session_duration": 120,
            "resonance_score": 0.75
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "earned" in data, "Response should contain 'earned'"
        assert "dust_balance" in data, "Response should contain 'dust_balance'"
        
        assert isinstance(data["earned"], (int, float)), "earned should be numeric"
        assert isinstance(data["dust_balance"], (int, float)), "dust_balance should be numeric"
        
        print(f"✓ Work submit successful: +{data['earned']} dust, Balance: {data['dust_balance']}")
    
    def test_work_submit_with_different_modules(self):
        """POST /api/transmuter/work-submit works with various module types"""
        modules = ["meditation_session", "oracle_reading", "sacred_breathing"]
        
        for module in modules:
            response = self.session.post(f"{BASE_URL}/api/transmuter/work-submit", json={
                "module": module,
                "interaction_weight": 25,
                "session_duration": 60,
                "resonance_score": 0.5
            })
            
            assert response.status_code == 200, f"Failed for module '{module}': {response.status_code}"
            data = response.json()
            assert "earned" in data
            print(f"  ✓ Module '{module}': +{data['earned']} dust")
        
        print(f"✓ All {len(modules)} module types work correctly")
    
    # ═══════════════════════════════════════════════════════════════
    # RPG CHARACTER ENDPOINT TESTS
    # ═══════════════════════════════════════════════════════════════
    
    def test_get_character_returns_full_data(self):
        """GET /api/rpg/character returns complete character data"""
        response = self.session.get(f"{BASE_URL}/api/rpg/character")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Required fields for VitalityBar component
        assert "level" in data, "Character should have 'level'"
        assert "xp_current" in data, "Character should have 'xp_current'"
        assert "xp_next" in data, "Character should have 'xp_next'"
        assert "xp_total" in data, "Character should have 'xp_total'"
        
        # Additional character fields
        assert "stats" in data, "Character should have 'stats'"
        assert "stat_points" in data, "Character should have 'stat_points'"
        
        print(f"✓ Character data: Level {data['level']}, XP: {data['xp_current']}/{data['xp_next']}")


class TestV56HealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """GET /api/health returns OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health endpoint OK")
    
    def test_auth_login(self):
        """POST /api/auth/login works with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        assert "token" in data, "Login should return token"
        print("✓ Auth login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

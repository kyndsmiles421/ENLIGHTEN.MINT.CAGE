"""
Iteration 229 - ConsciousnessPanel Interactive Widget Tests
Tests for the consciousness endpoints that power the interactive ConsciousnessPanel widget:
- GET /api/consciousness/status - Returns level, XP, all_levels, recent_activity
- POST /api/consciousness/progress - Awards XP for valid activities
- POST /api/consciousness/display-mode - Changes display mode (rank/aura/hybrid)
- GET /api/consciousness/gate-check/{feature} - Returns unlock status for features
- GET /api/consciousness/levels - Returns all level definitions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestConsciousnessEndpoints:
    """Tests for consciousness system endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("zen_token") or data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Login failed with status {login_response.status_code}")
    
    def test_consciousness_status_returns_required_fields(self):
        """GET /api/consciousness/status should return level, xp_total, all_levels, recent_activity"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields exist
        assert "level" in data, "Response missing 'level' field"
        assert "xp_total" in data, "Response missing 'xp_total' field"
        assert "all_levels" in data, "Response missing 'all_levels' field"
        assert "recent_activity" in data, "Response missing 'recent_activity' field"
        
        # Verify data types
        assert isinstance(data["level"], int), "level should be an integer"
        assert isinstance(data["xp_total"], int), "xp_total should be an integer"
        assert isinstance(data["all_levels"], list), "all_levels should be a list"
        assert isinstance(data["recent_activity"], list), "recent_activity should be a list"
        
        # Verify level is between 1-5
        assert 1 <= data["level"] <= 5, f"Level should be 1-5, got {data['level']}"
        
        print(f"PASS: Consciousness status - Level {data['level']}, XP {data['xp_total']}")
    
    def test_consciousness_status_has_level_info(self):
        """GET /api/consciousness/status should include level_info with name, color, element"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "level_info" in data, "Response missing 'level_info' field"
        level_info = data["level_info"]
        
        # Verify level_info structure
        assert "name" in level_info, "level_info missing 'name'"
        assert "color" in level_info, "level_info missing 'color'"
        assert "element" in level_info, "level_info missing 'element'"
        assert "subtitle" in level_info, "level_info missing 'subtitle'"
        
        print(f"PASS: Level info - {level_info['name']} ({level_info['element']})")
    
    def test_consciousness_status_has_progress_info(self):
        """GET /api/consciousness/status should include XP progress info"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/status")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify progress fields
        assert "xp_into_level" in data, "Response missing 'xp_into_level'"
        assert "xp_for_next" in data, "Response missing 'xp_for_next'"
        assert "progress_pct" in data, "Response missing 'progress_pct'"
        assert "display_mode" in data, "Response missing 'display_mode'"
        assert "is_max_level" in data, "Response missing 'is_max_level'"
        
        # Verify progress_pct is 0-100
        assert 0 <= data["progress_pct"] <= 100, f"progress_pct should be 0-100, got {data['progress_pct']}"
        
        # Verify display_mode is valid
        assert data["display_mode"] in ["rank", "aura", "hybrid"], f"Invalid display_mode: {data['display_mode']}"
        
        print(f"PASS: Progress - {data['progress_pct']}% ({data['xp_into_level']}/{data['xp_for_next']} XP)")
    
    def test_consciousness_status_all_levels_structure(self):
        """GET /api/consciousness/status all_levels should have 5 levels with proper structure"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/status")
        
        assert response.status_code == 200
        data = response.json()
        
        all_levels = data["all_levels"]
        assert len(all_levels) == 5, f"Expected 5 levels, got {len(all_levels)}"
        
        # Verify each level has required fields
        for lvl in all_levels:
            assert "level" in lvl, "Level missing 'level' field"
            assert "name" in lvl, "Level missing 'name' field"
            assert "color" in lvl, "Level missing 'color' field"
            assert "xp_required" in lvl, "Level missing 'xp_required' field"
            assert "gate_label" in lvl, "Level missing 'gate_label' field"
        
        # Verify level order
        levels = [lvl["level"] for lvl in all_levels]
        assert levels == [1, 2, 3, 4, 5], f"Levels should be [1,2,3,4,5], got {levels}"
        
        print(f"PASS: All 5 levels present with proper structure")
    
    def test_consciousness_progress_valid_activity(self):
        """POST /api/consciousness/progress should award XP for valid activities"""
        # Test with breathing_session activity (10 XP)
        response = self.session.post(f"{BASE_URL}/api/consciousness/progress", json={
            "activity": "breathing_session",
            "context": "test"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "xp_gained" in data, "Response missing 'xp_gained'"
        assert "total_xp" in data, "Response missing 'total_xp'"
        assert "level" in data, "Response missing 'level'"
        assert "activity" in data, "Response missing 'activity'"
        
        # Verify XP was awarded
        assert data["xp_gained"] == 10, f"breathing_session should award 10 XP, got {data['xp_gained']}"
        assert data["activity"] == "breathing_session"
        
        print(f"PASS: Progress - Awarded {data['xp_gained']} XP, total now {data['total_xp']}")
    
    def test_consciousness_progress_invalid_activity(self):
        """POST /api/consciousness/progress should return 400 for unknown activities"""
        response = self.session.post(f"{BASE_URL}/api/consciousness/progress", json={
            "activity": "invalid_activity_xyz",
            "context": "test"
        })
        
        assert response.status_code == 400, f"Expected 400 for invalid activity, got {response.status_code}"
        
        print(f"PASS: Invalid activity correctly returns 400")
    
    def test_consciousness_display_mode_change(self):
        """POST /api/consciousness/display-mode should change display mode"""
        # Test changing to 'rank' mode
        response = self.session.post(f"{BASE_URL}/api/consciousness/display-mode", json={
            "mode": "rank"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["display_mode"] == "rank", f"Expected 'rank', got {data['display_mode']}"
        
        # Verify it persisted by checking status
        status_response = self.session.get(f"{BASE_URL}/api/consciousness/status")
        status_data = status_response.json()
        assert status_data["display_mode"] == "rank", "Display mode not persisted"
        
        # Change back to hybrid
        self.session.post(f"{BASE_URL}/api/consciousness/display-mode", json={"mode": "hybrid"})
        
        print(f"PASS: Display mode changed to 'rank' and persisted")
    
    def test_consciousness_display_mode_invalid(self):
        """POST /api/consciousness/display-mode should return 400 for invalid modes"""
        response = self.session.post(f"{BASE_URL}/api/consciousness/display-mode", json={
            "mode": "invalid_mode"
        })
        
        assert response.status_code == 400, f"Expected 400 for invalid mode, got {response.status_code}"
        
        print(f"PASS: Invalid display mode correctly returns 400")
    
    def test_consciousness_gate_check_unlocked_feature(self):
        """GET /api/consciousness/gate-check/{feature} should return unlocked for accessible features"""
        # rpg_basic is unlocked at level 1
        response = self.session.get(f"{BASE_URL}/api/consciousness/gate-check/rpg_basic")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "feature" in data, "Response missing 'feature'"
        assert "unlocked" in data, "Response missing 'unlocked'"
        assert data["feature"] == "rpg_basic"
        assert data["unlocked"] == True, "rpg_basic should be unlocked at level 1+"
        
        print(f"PASS: Gate check - rpg_basic is unlocked")
    
    def test_consciousness_gate_check_locked_feature(self):
        """GET /api/consciousness/gate-check/{feature} should return locked for inaccessible features"""
        # god_mode is unlocked at level 5 (7000 XP)
        response = self.session.get(f"{BASE_URL}/api/consciousness/gate-check/god_mode")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "feature" in data
        assert "unlocked" in data
        assert "required_level" in data
        assert data["feature"] == "god_mode"
        assert data["required_level"] == 5, "god_mode requires level 5"
        
        # Check if locked based on user's level
        status = self.session.get(f"{BASE_URL}/api/consciousness/status").json()
        if status["level"] < 5:
            assert data["unlocked"] == False, "god_mode should be locked below level 5"
            print(f"PASS: Gate check - god_mode is locked (user at level {status['level']})")
        else:
            assert data["unlocked"] == True, "god_mode should be unlocked at level 5"
            print(f"PASS: Gate check - god_mode is unlocked (user at level {status['level']})")
    
    def test_consciousness_gate_check_ungated_feature(self):
        """GET /api/consciousness/gate-check/{feature} should return unlocked for ungated features"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/gate-check/some_random_feature")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["unlocked"] == True, "Ungated features should return unlocked"
        assert "message" in data, "Ungated features should have a message"
        
        print(f"PASS: Gate check - ungated feature returns unlocked")
    
    def test_consciousness_levels_endpoint(self):
        """GET /api/consciousness/levels should return all level definitions"""
        response = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "levels" in data, "Response missing 'levels'"
        
        levels = data["levels"]
        assert len(levels) == 5, f"Expected 5 levels, got {len(levels)}"
        
        # Verify level names
        level_names = [lvl["name"] for lvl in levels]
        expected_names = ["Physical", "Emotional", "Mental", "Intuitive", "Pure Consciousness"]
        assert level_names == expected_names, f"Level names mismatch: {level_names}"
        
        print(f"PASS: Levels endpoint returns all 5 levels")


class TestRegressionEndpoints:
    """Regression tests for previously working endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("zen_token") or data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Login failed with status {login_response.status_code}")
    
    def test_auth_me_endpoint(self):
        """GET /api/auth/me should return user info"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "email" in data or "id" in data, "Response should contain user info"
        
        print(f"PASS: /api/auth/me returns user info")
    
    def test_dashboard_stats_endpoint(self):
        """GET /api/dashboard/stats should return dashboard statistics"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        print(f"PASS: /api/dashboard/stats returns 200")
    
    def test_mixer_auto_compose_goals(self):
        """GET /api/mixer/auto-compose/goals should return wellness goals (regression from iteration 228)"""
        response = self.session.get(f"{BASE_URL}/api/mixer/auto-compose/goals")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "goals" in data, "Response missing 'goals'"
        assert len(data["goals"]) == 6, f"Expected 6 goals, got {len(data['goals'])}"
        
        print(f"PASS: Auto-compose goals endpoint still working (6 goals)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

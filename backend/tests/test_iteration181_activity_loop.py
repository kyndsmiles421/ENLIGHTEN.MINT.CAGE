"""
Iteration 181: Activity Loop & Streak Heatmap Backend Tests
Tests the Activity Loop progress and heatmap endpoints for the unified engagement loop system.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "grad_test_522@test.com",
        "password": "password"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["token"]

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestActivityLoopProgress:
    """Tests for GET /api/activity-loop/progress endpoint"""
    
    def test_progress_returns_200(self, auth_headers):
        """Progress endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        assert response.status_code == 200
    
    def test_progress_has_overview(self, auth_headers):
        """Progress response contains overview object with all required fields"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        data = response.json()
        
        assert "overview" in data
        overview = data["overview"]
        
        # Check all required overview fields
        required_fields = [
            "consciousness_level", "xp", "dust", "polished_gems", "raw_gems",
            "trades", "gates_unlocked", "resonance_sessions", "resonance_streak",
            "hotspot_collections", "realms_visited", "quests_done_today"
        ]
        for field in required_fields:
            assert field in overview, f"Missing field: {field}"
    
    def test_progress_has_loops_array(self, auth_headers):
        """Progress response contains loops array with 7 engagement loop items"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        data = response.json()
        
        assert "loops" in data
        assert isinstance(data["loops"], list)
        assert len(data["loops"]) == 7, f"Expected 7 loops, got {len(data['loops'])}"
    
    def test_progress_loop_structure(self, auth_headers):
        """Each loop item has required fields: id, from_system, to_system, metric, label, color, active"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        data = response.json()
        
        required_loop_fields = ["id", "from_system", "to_system", "metric", "label", "color", "active"]
        
        for loop in data["loops"]:
            for field in required_loop_fields:
                assert field in loop, f"Loop {loop.get('id', 'unknown')} missing field: {field}"
    
    def test_progress_loop_ids(self, auth_headers):
        """Loops have correct IDs for all 7 engagement loops"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        data = response.json()
        
        expected_ids = [
            "practice_to_dust", "hotspot_to_gems", "gems_to_refinement",
            "polish_to_gates", "trades_to_gates", "all_to_consciousness", "travel_to_gates"
        ]
        actual_ids = [loop["id"] for loop in data["loops"]]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing loop ID: {expected_id}"
    
    def test_progress_has_active_loops_count(self, auth_headers):
        """Progress response contains active_loops and total_loops counts"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress", headers=auth_headers)
        data = response.json()
        
        assert "active_loops" in data
        assert "total_loops" in data
        assert data["total_loops"] == 7
        assert 0 <= data["active_loops"] <= 7


class TestActivityLoopHeatmap:
    """Tests for GET /api/activity-loop/heatmap endpoint"""
    
    def test_heatmap_returns_200(self, auth_headers):
        """Heatmap endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        assert response.status_code == 200
    
    def test_heatmap_returns_91_days(self, auth_headers):
        """Heatmap returns exactly 91 day objects when days=91"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        data = response.json()
        
        assert "heatmap" in data
        assert isinstance(data["heatmap"], list)
        assert len(data["heatmap"]) == 91, f"Expected 91 days, got {len(data['heatmap'])}"
    
    def test_heatmap_day_structure(self, auth_headers):
        """Each heatmap day has required fields: date, total_activities, resonance, hotspot, xp_events, dust_earned, dominant_element"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        data = response.json()
        
        required_fields = ["date", "total_activities", "resonance", "hotspot", "xp_events", "dust_earned", "dominant_element"]
        
        for day in data["heatmap"][:5]:  # Check first 5 days
            for field in required_fields:
                assert field in day, f"Day {day.get('date', 'unknown')} missing field: {field}"
    
    def test_heatmap_has_active_days_count(self, auth_headers):
        """Heatmap response contains active_days count"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        data = response.json()
        
        assert "active_days" in data
        assert isinstance(data["active_days"], int)
        assert data["active_days"] >= 0
    
    def test_heatmap_has_current_streak(self, auth_headers):
        """Heatmap response contains current_streak"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        data = response.json()
        
        assert "current_streak" in data
        assert isinstance(data["current_streak"], int)
        assert data["current_streak"] >= 0
    
    def test_heatmap_days_param(self, auth_headers):
        """Heatmap respects days parameter"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=30", headers=auth_headers)
        data = response.json()
        
        assert data["days"] == 30
        assert len(data["heatmap"]) == 30
    
    def test_heatmap_date_format(self, auth_headers):
        """Heatmap dates are in YYYY-MM-DD format"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91", headers=auth_headers)
        data = response.json()
        
        import re
        date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        
        for day in data["heatmap"][:5]:
            assert date_pattern.match(day["date"]), f"Invalid date format: {day['date']}"


class TestActivityLoopAuth:
    """Tests for authentication requirements"""
    
    def test_progress_requires_auth(self):
        """Progress endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/progress")
        assert response.status_code in [401, 403, 422]
    
    def test_heatmap_requires_auth(self):
        """Heatmap endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/activity-loop/heatmap?days=91")
        assert response.status_code in [401, 403, 422]

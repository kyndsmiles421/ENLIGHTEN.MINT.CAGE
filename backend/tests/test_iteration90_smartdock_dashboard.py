"""
Iteration 90: SmartDock + Customizable Dashboard Tests
Tests:
- GET /api/dashboard/layout - returns default layout for new users
- PUT /api/dashboard/layout - saves custom layout
- Dashboard stats and suggestions still work
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDashboardLayout:
    """Dashboard layout customization endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed")
    
    def test_get_dashboard_layout_returns_defaults(self):
        """GET /api/dashboard/layout returns default layout for users"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/layout")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify structure
        assert "sections_order" in data, "Missing sections_order"
        assert "hidden_sections" in data, "Missing hidden_sections"
        assert "pinned_shortcuts" in data, "Missing pinned_shortcuts"
        
        # Verify sections_order contains expected sections
        expected_sections = ["stats", "pinned", "suggestions", "coherence", "challenge", "wisdom", "moods", "recommendations", "actions"]
        assert isinstance(data["sections_order"], list), "sections_order should be a list"
        for section in expected_sections:
            assert section in data["sections_order"], f"Missing section: {section}"
        
        # Verify pinned_shortcuts contains default shortcuts
        expected_pinned = ["/breathing", "/mood", "/journal", "/meditation", "/oracle", "/star-chart", "/blessings", "/crystals"]
        assert isinstance(data["pinned_shortcuts"], list), "pinned_shortcuts should be a list"
        for shortcut in expected_pinned:
            assert shortcut in data["pinned_shortcuts"], f"Missing default shortcut: {shortcut}"
        
        print(f"GET /api/dashboard/layout: sections={len(data['sections_order'])}, pinned={len(data['pinned_shortcuts'])}")
    
    def test_put_dashboard_layout_saves_custom_order(self):
        """PUT /api/dashboard/layout saves custom section order"""
        custom_layout = {
            "sections_order": ["pinned", "stats", "actions", "suggestions", "coherence", "challenge", "wisdom", "moods", "recommendations"],
            "hidden_sections": ["moods", "wisdom"],
            "pinned_shortcuts": ["/breathing", "/meditation", "/oracle"]
        }
        
        # Save custom layout
        response = self.session.put(f"{BASE_URL}/api/dashboard/layout", json=custom_layout)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "saved", f"Expected status 'saved', got {data}"
        
        # Verify it was saved by fetching again
        get_response = self.session.get(f"{BASE_URL}/api/dashboard/layout")
        assert get_response.status_code == 200
        
        saved_data = get_response.json()
        assert saved_data["sections_order"] == custom_layout["sections_order"], "sections_order not saved correctly"
        assert saved_data["hidden_sections"] == custom_layout["hidden_sections"], "hidden_sections not saved correctly"
        assert saved_data["pinned_shortcuts"] == custom_layout["pinned_shortcuts"], "pinned_shortcuts not saved correctly"
        
        print(f"PUT /api/dashboard/layout: Custom layout saved and verified")
    
    def test_put_dashboard_layout_restore_defaults(self):
        """PUT /api/dashboard/layout can restore default layout"""
        default_layout = {
            "sections_order": ["stats", "pinned", "suggestions", "coherence", "challenge", "wisdom", "moods", "recommendations", "actions"],
            "hidden_sections": [],
            "pinned_shortcuts": ["/breathing", "/mood", "/journal", "/meditation", "/oracle", "/star-chart", "/blessings", "/crystals"]
        }
        
        response = self.session.put(f"{BASE_URL}/api/dashboard/layout", json=default_layout)
        assert response.status_code == 200
        
        # Verify
        get_response = self.session.get(f"{BASE_URL}/api/dashboard/layout")
        saved_data = get_response.json()
        assert len(saved_data["hidden_sections"]) == 0, "hidden_sections should be empty after restore"
        assert len(saved_data["pinned_shortcuts"]) == 8, "Should have 8 default pinned shortcuts"
        
        print("PUT /api/dashboard/layout: Defaults restored successfully")


class TestDashboardStats:
    """Dashboard stats endpoint tests (regression)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_dashboard_stats_returns_sparklines(self):
        """GET /api/dashboard/stats returns sparkline data"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sparkline" in data, "Missing sparkline data"
        assert "moods" in data["sparkline"], "Missing sparkline.moods"
        assert "journals" in data["sparkline"], "Missing sparkline.journals"
        assert "activity" in data["sparkline"], "Missing sparkline.activity"
        
        # Each sparkline should be a 7-day array
        assert len(data["sparkline"]["moods"]) == 7, "sparkline.moods should have 7 elements"
        assert len(data["sparkline"]["journals"]) == 7, "sparkline.journals should have 7 elements"
        assert len(data["sparkline"]["activity"]) == 7, "sparkline.activity should have 7 elements"
        
        print(f"GET /api/dashboard/stats: sparklines OK, mood_count={data.get('mood_count')}, journal_count={data.get('journal_count')}")
    
    def test_dashboard_suggestions_returns_personalized(self):
        """GET /api/dashboard/suggestions returns personalized suggestions"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "suggestions" in data, "Missing suggestions"
        assert isinstance(data["suggestions"], list), "suggestions should be a list"
        
        # Each suggestion should have required fields
        for suggestion in data["suggestions"]:
            assert "id" in suggestion, "Suggestion missing id"
            assert "title" in suggestion, "Suggestion missing title"
            assert "path" in suggestion, "Suggestion missing path"
            assert "color" in suggestion, "Suggestion missing color"
        
        print(f"GET /api/dashboard/suggestions: {len(data['suggestions'])} suggestions returned")


class TestCosmicMixerRoute:
    """Test that /cosmic-mixer route is accessible"""
    
    def test_cosmic_mixer_page_loads(self):
        """Frontend /cosmic-mixer route should be accessible"""
        # Just verify the backend doesn't have a conflicting route
        # The actual page is frontend-only
        session = requests.Session()
        
        # Try to access the frontend route (should return HTML, not 404)
        response = session.get(f"{BASE_URL}/cosmic-mixer", allow_redirects=True)
        # Frontend routes return 200 with HTML
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("GET /cosmic-mixer: Frontend route accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

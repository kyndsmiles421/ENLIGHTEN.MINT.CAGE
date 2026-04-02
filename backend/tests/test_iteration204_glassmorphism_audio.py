"""
Iteration 204 Backend Regression Tests
- Tests for: GET /api/observatory/planets, GET /api/mastery/tier, GET /api/workshop/platonic-solids
- These are regression tests to ensure backend still works after frontend-only changes
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration204BackendRegression:
    """Backend regression tests for Iteration 204"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.auth_success = True
        else:
            self.auth_success = False
    
    def test_auth_login(self):
        """Test authentication works"""
        assert self.auth_success, "Authentication should succeed"
    
    def test_observatory_planets(self):
        """Test GET /api/observatory/planets returns planets data"""
        if not self.auth_success:
            pytest.skip("Auth failed")
        
        response = self.session.get(f"{BASE_URL}/api/observatory/planets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "planets" in data, "Response should contain 'planets' key"
        assert len(data["planets"]) >= 8, "Should have at least 8 planets"
        
        # Verify planet structure
        planet = data["planets"][0]
        assert "name" in planet, "Planet should have name"
        assert "hz" in planet, "Planet should have hz frequency"
        assert "color" in planet, "Planet should have color"
    
    def test_mastery_tier(self):
        """Test GET /api/mastery/tier returns tier data"""
        if not self.auth_success:
            pytest.skip("Auth failed")
        
        response = self.session.get(f"{BASE_URL}/api/mastery/tier")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_tier" in data, "Response should contain 'current_tier'"
    
    def test_workshop_platonic_solids(self):
        """Test GET /api/workshop/platonic-solids returns solids data"""
        if not self.auth_success:
            pytest.skip("Auth failed")
        
        response = self.session.get(f"{BASE_URL}/api/workshop/platonic-solids")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "solids" in data, "Response should contain 'solids' key"
        assert len(data["solids"]) == 5, "Should have exactly 5 platonic solids"
    
    def test_observatory_stars(self):
        """Test GET /api/observatory/stars returns stars data"""
        if not self.auth_success:
            pytest.skip("Auth failed")
        
        response = self.session.get(f"{BASE_URL}/api/observatory/stars")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stars" in data, "Response should contain 'stars' key"
        assert len(data["stars"]) >= 5, "Should have at least 5 stars"
    
    def test_observatory_events(self):
        """Test GET /api/observatory/events returns events and moon data"""
        if not self.auth_success:
            pytest.skip("Auth failed")
        
        response = self.session.get(f"{BASE_URL}/api/observatory/events")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "events" in data, "Response should contain 'events' key"
        assert "moon" in data, "Response should contain 'moon' key"

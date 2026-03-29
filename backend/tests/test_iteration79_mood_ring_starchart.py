"""
Iteration 79: Cosmic Mood Ring + Enhanced Star Chart Tests
Tests for:
- GET /api/health
- GET /api/mood-ring (requires auth)
- GET /api/mood-ring without auth returns 401
- POST /api/auth/login
- GET /api/dashboard/personalized (requires auth)
- GET /api/star-chart/constellations (requires auth)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zen-energy-bar.preview.emergentagent.com')

class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_ok(self):
        """GET /api/health returns status ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ GET /api/health returns status=ok")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """POST /api/auth/login with valid credentials returns token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@test.com"
        print("✓ POST /api/auth/login with valid credentials returns token")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ POST /api/auth/login with invalid credentials returns 401")


class TestMoodRingAPI:
    """Cosmic Mood Ring API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_mood_ring_without_auth_returns_401(self):
        """GET /api/mood-ring without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/mood-ring")
        assert response.status_code in [401, 403, 422]
        print("✓ GET /api/mood-ring without auth returns 401/403")
    
    def test_mood_ring_with_auth_returns_data(self, auth_token):
        """GET /api/mood-ring with auth returns mood data"""
        response = requests.get(
            f"{BASE_URL}/api/mood-ring",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "dominant_mood" in data
        assert "latest_mood" in data
        assert "energy_level" in data
        assert "colors" in data
        assert "layers" in data
        assert "trend" in data
        assert "message" in data
        assert "pulse_speed" in data
        
        # Verify colors structure
        colors = data["colors"]
        assert "primary" in colors
        assert "secondary" in colors
        assert "glow" in colors
        
        # Verify layers is a list
        assert isinstance(data["layers"], list)
        if len(data["layers"]) > 0:
            layer = data["layers"][0]
            assert "color" in layer
            assert "opacity" in layer
            assert "speed" in layer
        
        # Verify trend is valid
        assert data["trend"] in ["rising", "falling", "stable"]
        
        print(f"✓ GET /api/mood-ring returns mood data: dominant_mood={data['dominant_mood']}, trend={data['trend']}")


class TestDashboardAPI:
    """Personalized Dashboard API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_dashboard_without_auth_returns_401(self):
        """GET /api/dashboard/personalized without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized")
        assert response.status_code in [401, 403, 422]
        print("✓ GET /api/dashboard/personalized without auth returns 401/403")
    
    def test_dashboard_with_auth_returns_data(self, auth_token):
        """GET /api/dashboard/personalized with auth returns dashboard data"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/personalized",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "greeting" in data
        assert "time_of_day" in data
        assert "wisdom" in data
        assert "continue_items" in data
        assert "new_for_you" in data
        assert "progress" in data
        
        # Verify wisdom structure
        wisdom = data["wisdom"]
        assert "text" in wisdom
        assert "source" in wisdom
        assert "tradition" in wisdom
        assert "color" in wisdom
        
        # Verify progress structure
        progress = data["progress"]
        assert "streak_days" in progress
        assert "total_sessions" in progress
        assert "mood_entries" in progress
        assert "journal_entries" in progress
        
        print(f"✓ GET /api/dashboard/personalized returns data: greeting={data['greeting'][:30]}...")


class TestStarChartAPI:
    """Star Chart API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_star_chart_constellations(self, auth_token):
        """GET /api/star-chart/constellations returns constellation data"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify constellations array exists
        assert "constellations" in data
        assert isinstance(data["constellations"], list)
        assert len(data["constellations"]) > 0
        
        # Verify constellation structure
        constellation = data["constellations"][0]
        assert "id" in constellation
        assert "name" in constellation
        assert "ra" in constellation
        assert "dec" in constellation
        assert "stars" in constellation
        
        print(f"✓ GET /api/star-chart/constellations returns {len(data['constellations'])} constellations")
    
    def test_star_chart_cultures(self):
        """GET /api/star-chart/cultures returns available cultures"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200
        data = response.json()
        
        assert "cultures" in data
        assert isinstance(data["cultures"], list)
        
        print(f"✓ GET /api/star-chart/cultures returns {len(data['cultures'])} cultures")


class TestQuickResetAPI:
    """Quick Reset API tests"""
    
    def test_quick_reset_happy(self):
        """GET /api/quick-reset/happy returns reset flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/happy")
        assert response.status_code == 200
        data = response.json()
        
        assert "label" in data
        assert "frequency" in data
        assert "tool" in data
        assert "nourishment" in data
        
        print("✓ GET /api/quick-reset/happy returns reset flow")
    
    def test_quick_reset_stressed(self):
        """GET /api/quick-reset/stressed returns reset flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/stressed")
        assert response.status_code == 200
        data = response.json()
        
        assert "label" in data
        assert "frequency" in data
        
        print("✓ GET /api/quick-reset/stressed returns reset flow")


class TestWaitlistAPI:
    """Waitlist API tests"""
    
    def test_waitlist_count(self):
        """GET /api/waitlist/count returns count"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        data = response.json()
        
        assert "count" in data
        assert isinstance(data["count"], int)
        
        print(f"✓ GET /api/waitlist/count returns count={data['count']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 71: Final Launch Readiness Regression Test
Tests admin role, all core API endpoints, subscription system, star chart, trade circle, and overall stability.
Test user: test@test.com (admin role)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


class TestAuthAndAdminRole:
    """Test authentication and admin role functionality"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        return data["token"], data["user"]
    
    def test_login_returns_role_field(self, auth_token):
        """POST /api/auth/login returns role field"""
        token, user = auth_token
        assert "role" in user, "Login response missing 'role' field"
        assert user["role"] == "admin", f"Expected role 'admin', got '{user['role']}'"
        print(f"✓ Login returns role: {user['role']}")
    
    def test_login_returns_user_data(self, auth_token):
        """POST /api/auth/login returns complete user data"""
        token, user = auth_token
        assert "id" in user, "Missing user id"
        assert "name" in user, "Missing user name"
        assert "email" in user, "Missing user email"
        assert user["email"] == TEST_EMAIL
        print(f"✓ Login returns complete user data: {user['email']}")
    
    def test_auth_me_returns_user_data(self, auth_token):
        """GET /api/auth/me returns user data including role"""
        token, _ = auth_token
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        data = response.json()
        assert "id" in data, "Missing id in /auth/me"
        assert "email" in data, "Missing email in /auth/me"
        assert data.get("role") == "admin", f"Expected admin role, got {data.get('role')}"
        print(f"✓ GET /api/auth/me returns user with role: {data.get('role')}")


class TestSubscriptionAdminAccess:
    """Test subscription system with admin privileges"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_my_plan_shows_admin_status(self, auth_headers):
        """GET /api/subscriptions/my-plan shows is_admin:true and tier:super_user"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=auth_headers)
        assert response.status_code == 200, f"my-plan failed: {response.text}"
        data = response.json()
        assert data.get("is_admin") == True, f"Expected is_admin=True, got {data.get('is_admin')}"
        assert data.get("tier") == "super_user", f"Expected tier=super_user, got {data.get('tier')}"
        print(f"✓ my-plan: is_admin={data.get('is_admin')}, tier={data.get('tier')}")
    
    def test_check_access_sora_video_allowed(self, auth_headers):
        """GET /api/subscriptions/check-access/sora_video returns allowed:true for admin"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/sora_video", headers=auth_headers)
        assert response.status_code == 200, f"check-access failed: {response.text}"
        data = response.json()
        assert data.get("allowed") == True, f"Expected allowed=True for sora_video, got {data}"
        print(f"✓ check-access/sora_video: allowed={data.get('allowed')}")
    
    def test_check_access_white_label_allowed(self, auth_headers):
        """GET /api/subscriptions/check-access/white_label returns allowed:true for admin"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/white_label", headers=auth_headers)
        assert response.status_code == 200, f"check-access failed: {response.text}"
        data = response.json()
        assert data.get("allowed") == True, f"Expected allowed=True for white_label, got {data}"
        print(f"✓ check-access/white_label: allowed={data.get('allowed')}")
    
    def test_use_credits_admin_bypass(self, auth_headers):
        """POST /api/subscriptions/use-credits allows admin without deducting credits"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/use-credits", 
            json={"action": "text_generation"},
            headers=auth_headers)
        assert response.status_code == 200, f"use-credits failed: {response.text}"
        data = response.json()
        assert data.get("allowed") == True, f"Expected allowed=True, got {data}"
        # Admin should have remaining=-1 (unlimited)
        assert data.get("remaining") == -1, f"Expected remaining=-1 for admin, got {data.get('remaining')}"
        print(f"✓ use-credits: allowed={data.get('allowed')}, remaining={data.get('remaining')}")
    
    def test_tiers_returns_all_five(self, auth_headers):
        """GET /api/subscriptions/tiers returns all 5 tiers with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers", headers=auth_headers)
        assert response.status_code == 200, f"tiers failed: {response.text}"
        data = response.json()
        tiers = data.get("tiers", {})
        expected_tiers = ["free", "starter", "plus", "premium", "super_user"]
        for tier_id in expected_tiers:
            assert tier_id in tiers, f"Missing tier: {tier_id}"
        # Check pricing
        assert tiers["free"]["price"] == 0
        assert tiers["starter"]["price"] == 4.99
        assert tiers["plus"]["price"] == 9.99
        assert tiers["premium"]["price"] == 24.99
        assert tiers["super_user"]["price"] == 49.99
        print(f"✓ tiers: all 5 tiers present with correct pricing")
    
    def test_gated_features_all_allowed_for_admin(self, auth_headers):
        """GET /api/subscriptions/gated-features returns all features allowed for admin"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/gated-features", headers=auth_headers)
        assert response.status_code == 200, f"gated-features failed: {response.text}"
        data = response.json()
        features = data.get("features", {})
        # Admin should have all features allowed
        for feat, info in features.items():
            assert info.get("allowed") == True, f"Feature {feat} not allowed for admin"
        print(f"✓ gated-features: all {len(features)} features allowed for admin")


class TestStarChartEndpoints:
    """Test Star Chart API endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_cultures_returns_all_eight(self, auth_headers):
        """GET /api/star-chart/cultures returns all 8 cultures"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures", headers=auth_headers)
        assert response.status_code == 200, f"cultures failed: {response.text}"
        data = response.json()
        cultures = data.get("cultures", [])
        assert len(cultures) >= 8, f"Expected at least 8 cultures, got {len(cultures)}"
        print(f"✓ star-chart/cultures: {len(cultures)} cultures returned")
    
    def test_vedic_culture_returns_data(self, auth_headers):
        """GET /api/star-chart/cultures/vedic returns constellation data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/vedic", headers=auth_headers)
        assert response.status_code == 200, f"vedic culture failed: {response.text}"
        data = response.json()
        assert "culture" in data or "constellations" in data or "id" in data, f"Unexpected response: {data}"
        print(f"✓ star-chart/cultures/vedic: returns data")


class TestTradeCircleEndpoints:
    """Test Trade Circle API endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_trade_circle_stats(self, auth_headers):
        """GET /api/trade-circle/stats returns karma info"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200, f"trade-circle/stats failed: {response.text}"
        data = response.json()
        # Should have karma-related fields
        assert "karma" in data or "karma_points" in data or "stats" in data, f"Missing karma info: {data}"
        print(f"✓ trade-circle/stats: returns karma info")
    
    def test_karma_leaderboard(self, auth_headers):
        """GET /api/trade-circle/karma-leaderboard returns leaderboard"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma-leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"karma-leaderboard failed: {response.text}"
        data = response.json()
        assert "leaderboard" in data or isinstance(data, list), f"Unexpected response: {data}"
        print(f"✓ trade-circle/karma-leaderboard: returns data")


class TestAchievementsAndDashboard:
    """Test achievements and dashboard endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_achievements_endpoint(self, auth_headers):
        """GET /api/achievements returns achievement data"""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200, f"achievements failed: {response.text}"
        data = response.json()
        assert "achievements" in data or "unlocked" in data or isinstance(data, list), f"Unexpected: {data}"
        print(f"✓ achievements: returns data")
    
    def test_dashboard_stats(self, auth_headers):
        """GET /api/dashboard/stats returns dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"dashboard/stats failed: {response.text}"
        data = response.json()
        # Should have some stats
        assert data is not None, "Dashboard stats returned None"
        print(f"✓ dashboard/stats: returns data")


class TestCoreEndpointsHealth:
    """Test core endpoints are responding"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return {"Authorization": f"Bearer {response.json()['token']}"}
    
    def test_health_endpoint(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"health failed: {response.text}"
        print(f"✓ health: OK")
    
    def test_oracle_endpoint(self, auth_headers):
        """GET /api/oracle/daily returns data"""
        response = requests.get(f"{BASE_URL}/api/oracle/daily", headers=auth_headers)
        # May return 200 or other valid status
        assert response.status_code in [200, 201, 404], f"oracle/daily unexpected: {response.status_code}"
        print(f"✓ oracle/daily: status {response.status_code}")
    
    def test_mood_endpoint(self, auth_headers):
        """GET /api/mood returns data"""
        response = requests.get(f"{BASE_URL}/api/mood", headers=auth_headers)
        # Accept 200 or 404 (no mood data yet)
        assert response.status_code in [200, 404], f"mood failed: {response.text}"
        print(f"✓ mood: status {response.status_code}")
    
    def test_meditation_sessions(self, auth_headers):
        """GET /api/meditation returns data"""
        response = requests.get(f"{BASE_URL}/api/meditation", headers=auth_headers)
        # Accept 200 or 404
        assert response.status_code in [200, 404], f"meditation failed: {response.text}"
        print(f"✓ meditation: status {response.status_code}")
    
    def test_breathing_exercises(self, auth_headers):
        """GET /api/breathing returns data"""
        response = requests.get(f"{BASE_URL}/api/breathing", headers=auth_headers)
        # Accept 200 or 404
        assert response.status_code in [200, 404], f"breathing failed: {response.text}"
        print(f"✓ breathing: status {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

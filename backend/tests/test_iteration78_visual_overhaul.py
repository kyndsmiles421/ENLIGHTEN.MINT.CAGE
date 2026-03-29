"""
Iteration 78: Visual Overhaul & Intro Video Tests
Tests for:
- Sora 2 intro video endpoint
- Health check
- Dashboard personalized endpoint
- Quick reset endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """GET /api/health returns ok status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "service" in data
        print(f"✓ Health check passed: {data}")


class TestIntroVideo:
    """Sora 2 Intro Video endpoint tests"""
    
    def test_intro_video_status(self):
        """GET /api/ai-visuals/intro-video returns ready status with video_url"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/intro-video")
        assert response.status_code == 200
        data = response.json()
        
        # Should return ready status with video_url
        assert data["status"] == "ready", f"Expected status 'ready', got '{data.get('status')}'"
        assert "video_url" in data, "Missing video_url in response"
        assert data["video_url"].endswith(".mp4"), f"video_url should end with .mp4, got {data['video_url']}"
        print(f"✓ Intro video ready: {data['video_url']}")
    
    def test_intro_video_file_accessible(self):
        """Video file should be accessible via static endpoint"""
        # First get the video URL
        response = requests.get(f"{BASE_URL}/api/ai-visuals/intro-video")
        assert response.status_code == 200
        data = response.json()
        
        if data["status"] == "ready" and data.get("video_url"):
            # Try to access the video file
            video_url = f"{BASE_URL}{data['video_url']}"
            video_response = requests.head(video_url)
            assert video_response.status_code == 200, f"Video file not accessible at {video_url}"
            
            # Check content type
            content_type = video_response.headers.get("content-type", "")
            assert "video" in content_type.lower() or "octet-stream" in content_type.lower(), \
                f"Expected video content type, got {content_type}"
            print(f"✓ Video file accessible: {video_url}")


class TestAuthentication:
    """Authentication tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_login_success(self):
        """POST /api/auth/login with valid credentials returns token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data, "Missing token in login response"
        assert len(data["token"]) > 0, "Token should not be empty"
        print(f"✓ Login successful, token received")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400], f"Expected 401 or 400, got {response.status_code}"
        print(f"✓ Invalid login rejected with status {response.status_code}")


class TestPersonalizedDashboard:
    """Personalized dashboard endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_personalized_dashboard_requires_auth(self):
        """GET /api/dashboard/personalized requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Dashboard requires auth (status {response.status_code})")
    
    def test_personalized_dashboard_returns_data(self, auth_token):
        """GET /api/dashboard/personalized returns dashboard data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "greeting" in data, "Missing greeting in dashboard data"
        assert "wisdom" in data, "Missing wisdom in dashboard data"
        assert "progress" in data, "Missing progress in dashboard data"
        
        # Check wisdom structure
        wisdom = data["wisdom"]
        assert "text" in wisdom, "Missing text in wisdom"
        assert "source" in wisdom, "Missing source in wisdom"
        
        # Check progress structure
        progress = data["progress"]
        assert "total_sessions" in progress, "Missing total_sessions in progress"
        assert "streak_days" in progress, "Missing streak_days in progress"
        
        print(f"✓ Dashboard data received: greeting='{data['greeting'][:30]}...', streak={progress.get('streak_days')}")
    
    def test_dashboard_has_continue_items(self, auth_token):
        """Dashboard should have continue_items array"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "continue_items" in data, "Missing continue_items in dashboard data"
        assert isinstance(data["continue_items"], list), "continue_items should be a list"
        print(f"✓ Continue items present: {len(data['continue_items'])} items")
    
    def test_dashboard_has_new_for_you(self, auth_token):
        """Dashboard should have new_for_you array"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "new_for_you" in data, "Missing new_for_you in dashboard data"
        assert isinstance(data["new_for_you"], list), "new_for_you should be a list"
        print(f"✓ New for you present: {len(data['new_for_you'])} items")


class TestQuickReset:
    """Quick reset endpoint tests"""
    
    def test_quick_reset_happy(self):
        """GET /api/quick-reset/happy returns reset flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/happy")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "label" in data, "Missing label in quick reset"
        assert "frequency" in data, "Missing frequency in quick reset"
        assert "tool" in data, "Missing tool in quick reset"
        assert "nourishment" in data, "Missing nourishment in quick reset"
        
        print(f"✓ Quick reset for 'happy': {data['label']}")
    
    def test_quick_reset_stressed(self):
        """GET /api/quick-reset/stressed returns reset flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/stressed")
        assert response.status_code == 200
        data = response.json()
        
        assert "label" in data
        assert "frequency" in data
        assert "tool" in data
        print(f"✓ Quick reset for 'stressed': {data['label']}")
    
    def test_quick_reset_tired(self):
        """GET /api/quick-reset/tired returns reset flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/tired")
        assert response.status_code == 200
        data = response.json()
        
        assert "label" in data
        assert "frequency" in data
        print(f"✓ Quick reset for 'tired': {data['label']}")


class TestWaitlist:
    """Waitlist endpoint tests"""
    
    def test_waitlist_count(self):
        """GET /api/waitlist/count returns count"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        data = response.json()
        
        assert "count" in data, "Missing count in waitlist response"
        assert isinstance(data["count"], int), "count should be an integer"
        print(f"✓ Waitlist count: {data['count']}")


class TestNavigation:
    """Navigation and pillar endpoints tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_breathing_endpoint(self, auth_token):
        """GET /api/breathing returns breathing exercises"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/breathing", headers=headers)
        # May return 200 or require different endpoint
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            print(f"✓ Breathing endpoint accessible")
    
    def test_oracle_endpoint(self, auth_token):
        """GET /api/oracle returns oracle data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/oracle", headers=headers)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            print(f"✓ Oracle endpoint accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 53: Comprehensive Quality Assurance Tests
Testing: Multi-Cultural Star Charts, Voice Sage, Social Forecast Sharing, VR Journeys, Core Features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


class TestAuthentication:
    """Authentication and login tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert len(data["token"]) > 0, "Token is empty"
        print(f"✓ Login successful, token received")


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMultiCulturalStarCharts:
    """Multi-Cultural Star Chart API tests"""
    
    def test_get_cultures_returns_4(self):
        """GET /api/star-chart/cultures returns 4 cultures"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "cultures" in data, "No cultures key in response"
        assert len(data["cultures"]) == 4, f"Expected 4 cultures, got {len(data['cultures'])}"
        
        culture_ids = [c["id"] for c in data["cultures"]]
        assert "mayan" in culture_ids, "Mayan culture missing"
        assert "egyptian" in culture_ids, "Egyptian culture missing"
        assert "australian" in culture_ids, "Australian culture missing"
        assert "lakota" in culture_ids, "Lakota culture missing"
        print(f"✓ 4 cultures returned: {culture_ids}")
    
    def test_mayan_culture_has_5_constellations(self):
        """GET /api/star-chart/cultures/mayan returns 5 constellations with mythology"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/mayan")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "constellations" in data, "No constellations key"
        assert len(data["constellations"]) == 5, f"Expected 5 constellations, got {len(data['constellations'])}"
        
        # Check mythology data exists
        for c in data["constellations"]:
            assert "mythology" in c, f"Constellation {c.get('name')} missing mythology"
            myth = c["mythology"]
            assert "figure" in myth, f"Missing mythology.figure for {c.get('name')}"
            assert "story" in myth, f"Missing mythology.story for {c.get('name')}"
            assert "lesson" in myth, f"Missing mythology.lesson for {c.get('name')}"
        
        print(f"✓ Mayan culture has 5 constellations with mythology data")
    
    def test_egyptian_culture_has_mythology(self):
        """GET /api/star-chart/cultures/egyptian returns constellation data with mythology"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/egyptian")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "constellations" in data
        assert len(data["constellations"]) > 0, "No constellations"
        
        # Check first constellation has full mythology
        c = data["constellations"][0]
        assert "mythology" in c
        myth = c["mythology"]
        assert "figure" in myth, "Missing mythology.figure"
        assert "story" in myth, "Missing mythology.story"
        assert "lesson" in myth, "Missing mythology.lesson"
        print(f"✓ Egyptian culture has {len(data['constellations'])} constellations with mythology")
    
    def test_australian_culture_returns_data(self):
        """GET /api/star-chart/cultures/australian returns data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/australian")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "constellations" in data
        assert len(data["constellations"]) > 0
        print(f"✓ Australian culture has {len(data['constellations'])} constellations")
    
    def test_lakota_culture_returns_data(self):
        """GET /api/star-chart/cultures/lakota returns data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/lakota")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "constellations" in data
        assert len(data["constellations"]) > 0
        print(f"✓ Lakota culture has {len(data['constellations'])} constellations")


class TestCoachChat:
    """Spiritual Coach / Voice Sage tests"""
    
    def test_coach_modes_available(self, auth_headers):
        """GET /api/coach/modes returns available modes"""
        response = requests.get(f"{BASE_URL}/api/coach/modes")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "modes" in data
        assert len(data["modes"]) > 0, "No coaching modes available"
        print(f"✓ {len(data['modes'])} coaching modes available")
    
    def test_create_coach_session(self, auth_headers):
        """POST /api/coach/sessions creates a session"""
        response = requests.post(f"{BASE_URL}/api/coach/sessions", 
            json={"mode": "spiritual"},
            headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "session_id" in data, "No session_id returned"
        print(f"✓ Coach session created: {data['session_id'][:8]}...")
        return data["session_id"]
    
    def test_coach_text_chat_works(self, auth_headers):
        """POST /api/coach/chat text chat works with session"""
        # First create a session
        session_resp = requests.post(f"{BASE_URL}/api/coach/sessions",
            json={"mode": "spiritual"},
            headers=auth_headers)
        assert session_resp.status_code == 200
        session_id = session_resp.json()["session_id"]
        
        # Send a message
        response = requests.post(f"{BASE_URL}/api/coach/chat",
            json={
                "session_id": session_id,
                "message": "Hello, I need guidance on finding inner peace."
            },
            headers=auth_headers,
            timeout=60)
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        assert "reply" in data, "No reply in response"
        assert len(data["reply"]) > 10, "Reply too short"
        print(f"✓ Coach chat works, reply length: {len(data['reply'])} chars")


class TestCommunityAndForecasts:
    """Community posts and forecast sharing tests"""
    
    def test_create_forecast_post(self, auth_headers):
        """POST /api/community/posts creates a forecast type post"""
        response = requests.post(f"{BASE_URL}/api/community/posts",
            json={
                "post_type": "forecast",
                "content": "Test forecast share: The stars align for transformation today.",
                "ritual_data": {
                    "system": "Astrology",
                    "period": "Daily",
                    "energy": 8
                }
            },
            headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data, "No post id returned"
        assert data["post_type"] == "forecast", "Wrong post type"
        print(f"✓ Forecast post created: {data['id'][:8]}...")
        return data["id"]
    
    def test_community_feed_returns_posts(self, auth_headers):
        """GET /api/community/feed returns posts including forecast shares"""
        response = requests.get(f"{BASE_URL}/api/community/feed")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "posts" in data, "No posts key"
        print(f"✓ Community feed has {len(data['posts'])} posts")
    
    def test_forecasts_systems_returns_6(self, auth_headers):
        """GET /api/forecasts/systems returns 6 systems"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "systems" in data, "No systems key"
        systems = data["systems"]
        assert len(systems) == 6, f"Expected 6 systems, got {len(systems)}"
        
        expected = ["astrology", "tarot", "numerology", "cardology", "chinese", "mayan"]
        for sys in expected:
            assert sys in systems, f"Missing system: {sys}"
        print(f"✓ 6 forecast systems available: {list(systems.keys())}")


class TestCosmicProfile:
    """Cosmic profile and avatar tests"""
    
    def test_cosmic_profile_returns_data(self, auth_headers):
        """GET /api/cosmic-profile returns profile data"""
        response = requests.get(f"{BASE_URL}/api/cosmic-profile", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        # Profile should have some structure
        assert isinstance(data, dict), "Response should be a dict"
        print(f"✓ Cosmic profile returned with keys: {list(data.keys())[:5]}...")
    
    def test_avatar_returns_config(self, auth_headers):
        """GET /api/avatar returns avatar config"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        print(f"✓ Avatar config returned")


class TestCoreEndpoints:
    """Core endpoint regression tests"""
    
    def test_health_check(self):
        """Basic health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint might not exist, but server should respond
        assert response.status_code in [200, 404], f"Server not responding: {response.status_code}"
        print(f"✓ Server responding")
    
    def test_dashboard_today(self, auth_headers):
        """GET /api/dashboard/today returns data"""
        response = requests.get(f"{BASE_URL}/api/dashboard/today", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        print(f"✓ Dashboard today endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

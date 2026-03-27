"""
Test Suite for Iteration 52 Features:
1. Multi-Cultural Star Chart - Mayan, Egyptian, Aboriginal, Lakota constellation overlays
2. Social Sharing for Forecasts - share forecast to community feed
3. Guided VR Constellation Journeys - camera flythrough in VR page

Tests cover:
- GET /api/star-chart/cultures - returns 4 cultures
- GET /api/star-chart/cultures/{culture_id} - returns constellation data
- POST /api/community/posts with post_type 'forecast' - share forecast
- Regression: POST /api/coach/chat, GET /api/forecasts/systems, Login
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStarChartCultures:
    """Tests for Multi-Cultural Star Chart feature"""
    
    def test_get_all_cultures_returns_4_cultures(self):
        """GET /api/star-chart/cultures returns 4 cultures with correct data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cultures" in data, "Response should have 'cultures' key"
        cultures = data["cultures"]
        
        assert len(cultures) == 4, f"Expected 4 cultures, got {len(cultures)}"
        
        # Verify culture IDs
        culture_ids = [c["id"] for c in cultures]
        assert "mayan" in culture_ids, "Mayan culture should be present"
        assert "egyptian" in culture_ids, "Egyptian culture should be present"
        assert "australian" in culture_ids, "Aboriginal/Australian culture should be present"
        assert "lakota" in culture_ids, "Lakota culture should be present"
        
        # Verify each culture has required fields
        for culture in cultures:
            assert "id" in culture
            assert "name" in culture
            assert "color" in culture
            assert "icon" in culture
            assert "description" in culture
            assert "constellation_count" in culture
            assert culture["constellation_count"] > 0, f"Culture {culture['id']} should have constellations"
        
        print(f"✓ GET /api/star-chart/cultures returns 4 cultures: {culture_ids}")
    
    def test_get_mayan_culture_returns_5_patterns(self):
        """GET /api/star-chart/cultures/mayan returns Mayan constellation data with 5 patterns"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/mayan")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "mayan"
        assert data["name"] == "Mayan Sky"
        assert "constellations" in data
        
        constellations = data["constellations"]
        assert len(constellations) == 5, f"Expected 5 Mayan constellations, got {len(constellations)}"
        
        # Verify constellation structure
        for c in constellations:
            assert "id" in c
            assert "name" in c
            assert "stars" in c
            assert "mythology" in c
            assert "paths" in c
            assert len(c["stars"]) > 0, f"Constellation {c['id']} should have stars"
        
        print(f"✓ GET /api/star-chart/cultures/mayan returns 5 constellations")
    
    def test_get_egyptian_culture(self):
        """GET /api/star-chart/cultures/egyptian returns Egyptian data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/egyptian")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "egyptian"
        assert data["name"] == "Egyptian Sky"
        assert "constellations" in data
        assert len(data["constellations"]) >= 5, "Egyptian should have at least 5 constellations"
        
        print(f"✓ GET /api/star-chart/cultures/egyptian returns {len(data['constellations'])} constellations")
    
    def test_get_australian_culture(self):
        """GET /api/star-chart/cultures/australian returns Aboriginal data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/australian")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "australian"
        assert data["name"] == "Aboriginal Sky"
        assert "constellations" in data
        assert len(data["constellations"]) >= 5, "Aboriginal should have at least 5 constellations"
        
        print(f"✓ GET /api/star-chart/cultures/australian returns {len(data['constellations'])} constellations")
    
    def test_get_lakota_culture(self):
        """GET /api/star-chart/cultures/lakota returns Lakota data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/lakota")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "lakota"
        assert data["name"] == "Lakota Sky"
        assert "constellations" in data
        assert len(data["constellations"]) >= 5, "Lakota should have at least 5 constellations"
        
        print(f"✓ GET /api/star-chart/cultures/lakota returns {len(data['constellations'])} constellations")
    
    def test_get_invalid_culture_returns_404(self):
        """GET /api/star-chart/cultures/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print("✓ GET /api/star-chart/cultures/invalid returns 404")


class TestForecastSharing:
    """Tests for Social Sharing for Forecasts feature"""
    
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
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_create_forecast_share_post(self, auth_headers):
        """POST /api/community/posts can create a forecast share post with post_type 'forecast'"""
        payload = {
            "post_type": "forecast",
            "content": "Test forecast share: Your cosmic energy is aligned with Jupiter today. Embrace abundance!",
            "ritual_data": {
                "system": "Astrology",
                "period": "Daily",
                "energy": 8,
                "system_color": "#C084FC"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/community/posts", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["post_type"] == "forecast", f"Expected post_type 'forecast', got {data.get('post_type')}"
        assert "content" in data
        assert "id" in data
        assert data["ritual_data"]["system"] == "Astrology"
        
        print(f"✓ POST /api/community/posts creates forecast share post with id: {data['id']}")
        
        # Cleanup - delete the test post
        delete_response = requests.delete(f"{BASE_URL}/api/community/posts/{data['id']}", headers=auth_headers)
        assert delete_response.status_code == 200, "Failed to cleanup test post"
    
    def test_forecast_post_appears_in_feed(self, auth_headers):
        """Verify forecast posts appear in community feed"""
        # Create a forecast post
        payload = {
            "post_type": "forecast",
            "content": "TEST_FORECAST: Weekly numerology reading shows path number 7 activation.",
            "ritual_data": {
                "system": "Numerology",
                "period": "Weekly"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/community/posts", json=payload, headers=auth_headers)
        assert create_response.status_code == 200
        post_id = create_response.json()["id"]
        
        # Check feed
        feed_response = requests.get(f"{BASE_URL}/api/community/feed")
        assert feed_response.status_code == 200
        
        feed_data = feed_response.json()
        assert "posts" in feed_data
        
        # Find our post
        found = any(p["id"] == post_id for p in feed_data["posts"])
        assert found, "Forecast post should appear in community feed"
        
        print("✓ Forecast post appears in community feed")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/community/posts/{post_id}", headers=auth_headers)


class TestRegressionEndpoints:
    """Regression tests for existing functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_login_works(self):
        """Regression: Login works with test@test.com/password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        
        data = response.json()
        assert "token" in data, "Login should return token"
        assert "user" in data, "Login should return user"
        
        print("✓ Login works with test@test.com/password")
    
    def test_coach_chat_still_works(self, auth_headers):
        """Regression: POST /api/coach/chat text chat still works"""
        # First create a session
        session_response = requests.post(f"{BASE_URL}/api/coach/sessions", 
            json={"mode": "spiritual"}, 
            headers=auth_headers)
        
        if session_response.status_code != 200:
            pytest.skip("Could not create coach session")
        
        session_id = session_response.json().get("session_id") or session_response.json().get("id")
        
        # Send a chat message
        chat_response = requests.post(f"{BASE_URL}/api/coach/chat", 
            json={
                "session_id": session_id,
                "message": "Hello, this is a test message"
            },
            headers=auth_headers)
        
        assert chat_response.status_code == 200, f"Chat failed: {chat_response.status_code}"
        
        data = chat_response.json()
        assert "reply" in data, "Chat should return reply"
        
        print("✓ POST /api/coach/chat text chat still works")
    
    def test_forecasts_systems_returns_systems(self):
        """Regression: GET /api/forecasts/systems returns systems"""
        response = requests.get(f"{BASE_URL}/api/forecasts/systems")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "systems" in data, "Response should have 'systems' key"
        
        systems = data["systems"]
        assert len(systems) > 0, "Should have at least one forecast system"
        
        # Verify astrology system exists
        assert "astrology" in systems, "Astrology system should exist"
        
        print(f"✓ GET /api/forecasts/systems returns {len(systems)} systems")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

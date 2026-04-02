"""
Iteration 210 - LlmChat API Bugfix Tests
Tests for the 'Dimensional Rift' fix - 7 backend files updated to use new LlmChat API signature:
- LlmChat(api_key, session_id, system_message) + send_message(UserMessage(text=...))

Files fixed:
- content_factory.py: _ai_mantra()
- revenue.py: _generate_ai_mantra()
- forge.py: _ai_forge_name(), _ai_skill_description()
- nature.py: dream interpretation
- teachings.py: contemplation generation
- voice_command.py: voice intent parsing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthAndBasics:
    """Test authentication and basic API access"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in login response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_login_success(self):
        """Test login with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print(f"Login successful, token received")


class TestWellnessPrescription:
    """Test /api/wellness/prescription - uses _ai_mantra from content_factory.py"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_wellness_prescription_returns_200(self, auth_headers):
        """GET /api/wellness/prescription should return 200, not 500"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"Wellness prescription returned 200")
    
    def test_wellness_prescription_has_mantra(self, auth_headers):
        """Prescription should have a non-empty mantra field"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "mantra" in data, "No mantra field in response"
        assert data["mantra"], "Mantra is empty"
        assert len(data["mantra"]) > 5, f"Mantra too short: {data['mantra']}"
        print(f"Mantra received: {data['mantra'][:50]}...")
    
    def test_wellness_prescription_has_frequency(self, auth_headers):
        """Prescription should have recommended_frequency"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "recommended_frequency" in data
        assert isinstance(data["recommended_frequency"], int)
        print(f"Recommended frequency: {data['recommended_frequency']}Hz")
    
    def test_wellness_prescription_has_time_of_day(self, auth_headers):
        """Prescription should have time_of_day"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "time_of_day" in data
        assert data["time_of_day"] in ["morning", "afternoon", "evening", "night"]
        print(f"Time of day: {data['time_of_day']}")


class TestGravityEndpoints:
    """Regression tests for gravity endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_gravity_nodes(self, auth_headers):
        """GET /api/gravity/nodes should return 200"""
        response = requests.get(f"{BASE_URL}/api/gravity/nodes", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "nodes" in data
        print(f"Gravity nodes: {len(data['nodes'])} nodes returned")
    
    def test_gravity_field(self, auth_headers):
        """GET /api/gravity/field should return 200"""
        response = requests.get(f"{BASE_URL}/api/gravity/field", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("Gravity field returned 200")
    
    def test_gravity_interact(self, auth_headers):
        """POST /api/gravity/interact should return 200"""
        response = requests.post(f"{BASE_URL}/api/gravity/interact", 
            headers=auth_headers,
            json={"node_id": "om-vedic", "dwell_seconds": 5}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("Gravity interact returned 200")


class TestArchivesEndpoints:
    """Regression tests for archives endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_archives_entries(self, auth_headers):
        """GET /api/archives/entries should return 200"""
        response = requests.get(f"{BASE_URL}/api/archives/entries", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "entries" in data
        print(f"Archives entries: {len(data['entries'])} entries returned")
    
    def test_archives_linguistics(self, auth_headers):
        """GET /api/archives/linguistics should return 200"""
        response = requests.get(f"{BASE_URL}/api/archives/linguistics", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("Archives linguistics returned 200")


class TestWeatherEndpoint:
    """Regression test for weather endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_weather_current(self, auth_headers):
        """GET /api/weather/current should return 200"""
        response = requests.get(f"{BASE_URL}/api/weather/current", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("Weather current returned 200")


class TestHubPreferences:
    """Regression test for hub preferences"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_hub_preferences(self, auth_headers):
        """GET /api/hub/preferences should return 200"""
        response = requests.get(f"{BASE_URL}/api/hub/preferences", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("Hub preferences returned 200")


class TestDreamInterpretation:
    """Test dream interpretation - uses LlmChat in nature.py"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_dream_interpret_returns_200(self, auth_headers):
        """POST /api/dreams/interpret should return 200, not 500"""
        response = requests.post(f"{BASE_URL}/api/dreams/interpret",
            headers=auth_headers,
            json={"content": "I was flying over a vast ocean under a full moon"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "interpretation" in data
        print(f"Dream interpretation received: {data['interpretation'][:100]}...")


class TestTeachingsContemplation:
    """Test contemplation generation - uses LlmChat in teachings.py"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_contemplation_returns_200(self, auth_headers):
        """POST /api/teachings/contemplate should return 200, not 500"""
        response = requests.post(f"{BASE_URL}/api/teachings/contemplate",
            headers=auth_headers,
            json={"teacher_id": "buddha", "teaching_id": "four-noble-truths"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "contemplation" in data
        print(f"Contemplation received: {data['contemplation'][:100]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

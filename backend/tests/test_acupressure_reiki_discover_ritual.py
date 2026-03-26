"""
Test suite for iteration 30 - New features:
1. Acupressure & Massage Techniques
2. Reiki & Aura Energy Readings/Healing
3. Try Something New discovery section
4. Personalized Daily Wellness Ritual Builder

Also includes regression tests for existing endpoints.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected endpoints"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


# ============== ACUPRESSURE MODULE TESTS ==============

class TestAcupressurePoints:
    """Tests for acupressure pressure points endpoints"""
    
    def test_get_all_points_returns_10(self):
        """GET /api/acupressure/points should return 10 pressure points"""
        response = requests.get(f"{BASE_URL}/api/acupressure/points")
        assert response.status_code == 200
        data = response.json()
        assert "points" in data
        assert len(data["points"]) == 10
        # Verify structure of first point
        point = data["points"][0]
        assert "id" in point
        assert "name" in point
        assert "location" in point
        assert "meridian" in point
        assert "benefits" in point
        assert "technique" in point
        print(f"✓ GET /api/acupressure/points: 200 OK - {len(data['points'])} points")
    
    def test_get_point_li4_detail(self):
        """GET /api/acupressure/point/li4 should return He Gu point detail"""
        response = requests.get(f"{BASE_URL}/api/acupressure/point/li4")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "li4"
        assert "He Gu" in data["name"]
        assert data["meridian"] == "Large Intestine"
        assert "benefits" in data
        assert "technique" in data
        assert "caution" in data
        print(f"✓ GET /api/acupressure/point/li4: 200 OK - {data['name']}")
    
    def test_get_point_not_found(self):
        """GET /api/acupressure/point/invalid should return 404"""
        response = requests.get(f"{BASE_URL}/api/acupressure/point/invalid_point")
        assert response.status_code == 404
        print("✓ GET /api/acupressure/point/invalid: 404 Not Found")


class TestAcupressureRoutines:
    """Tests for acupressure massage routines endpoints"""
    
    def test_get_all_routines_returns_6(self):
        """GET /api/acupressure/routines should return 6 routines"""
        response = requests.get(f"{BASE_URL}/api/acupressure/routines")
        assert response.status_code == 200
        data = response.json()
        assert "routines" in data
        assert len(data["routines"]) == 6
        # Verify structure
        routine = data["routines"][0]
        assert "id" in routine
        assert "name" in routine
        assert "duration" in routine
        assert "points" in routine
        assert "instructions" in routine
        print(f"✓ GET /api/acupressure/routines: 200 OK - {len(data['routines'])} routines")
    
    def test_get_routine_stress_relief_with_points_detail(self):
        """GET /api/acupressure/routine/stress_relief should return routine with points_detail array"""
        response = requests.get(f"{BASE_URL}/api/acupressure/routine/stress_relief")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "stress_relief"
        assert "Stress Relief" in data["name"]
        assert "points_detail" in data
        assert isinstance(data["points_detail"], list)
        assert len(data["points_detail"]) > 0
        # Verify points_detail contains full point objects
        point = data["points_detail"][0]
        assert "id" in point
        assert "name" in point
        assert "technique" in point
        print(f"✓ GET /api/acupressure/routine/stress_relief: 200 OK - {len(data['points_detail'])} points in detail")
    
    def test_get_routine_not_found(self):
        """GET /api/acupressure/routine/invalid should return 404"""
        response = requests.get(f"{BASE_URL}/api/acupressure/routine/invalid_routine")
        assert response.status_code == 404
        print("✓ GET /api/acupressure/routine/invalid: 404 Not Found")


class TestAcupressureSessions:
    """Tests for acupressure session logging (authenticated)"""
    
    def test_log_session(self, auth_headers):
        """POST /api/acupressure/sessions should log a session"""
        response = requests.post(f"{BASE_URL}/api/acupressure/sessions", 
            json={
                "routine_id": "stress_relief",
                "points_used": ["li4", "pc6"],
                "duration_minutes": 10,
                "notes": "TEST_session",
                "relief_level": 8
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"
        assert "id" in data
        print(f"✓ POST /api/acupressure/sessions: 200 OK - session logged")
    
    def test_get_sessions(self, auth_headers):
        """GET /api/acupressure/sessions should return user's sessions"""
        response = requests.get(f"{BASE_URL}/api/acupressure/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        print(f"✓ GET /api/acupressure/sessions: 200 OK - {len(data['sessions'])} sessions")


# ============== REIKI MODULE TESTS ==============

class TestReikiChakras:
    """Tests for reiki chakra endpoints"""
    
    def test_get_chakras_returns_7(self):
        """GET /api/reiki/chakras should return 7 chakras"""
        response = requests.get(f"{BASE_URL}/api/reiki/chakras")
        assert response.status_code == 200
        data = response.json()
        assert "chakras" in data
        assert len(data["chakras"]) == 7
        # Verify structure
        chakra = data["chakras"][0]
        assert "id" in chakra
        assert "name" in chakra
        assert "color" in chakra
        assert "location" in chakra
        assert "frequency" in chakra
        assert "qualities" in chakra
        print(f"✓ GET /api/reiki/chakras: 200 OK - {len(data['chakras'])} chakras")


class TestReikiPositions:
    """Tests for reiki hand positions endpoints"""
    
    def test_get_positions_returns_10(self):
        """GET /api/reiki/positions should return 10 positions"""
        response = requests.get(f"{BASE_URL}/api/reiki/positions")
        assert response.status_code == 200
        data = response.json()
        assert "positions" in data
        assert len(data["positions"]) == 10
        # Verify structure
        pos = data["positions"][0]
        assert "id" in pos
        assert "name" in pos
        assert "placement" in pos
        assert "chakra" in pos
        assert "intention" in pos
        print(f"✓ GET /api/reiki/positions: 200 OK - {len(data['positions'])} positions")


class TestAuraReading:
    """Tests for aura reading endpoints (authenticated)"""
    
    def test_aura_reading_with_birth_date(self, auth_headers):
        """POST /api/reiki/aura-reading should return aura reading"""
        response = requests.post(f"{BASE_URL}/api/reiki/aura-reading",
            json={"birth_month": 3, "birth_day": 15},
            headers=auth_headers,
            timeout=45  # AI may take up to 30 seconds
        )
        assert response.status_code == 200
        data = response.json()
        assert "aura_color" in data
        assert "aura" in data
        assert "chakra" in data
        assert "reading" in data
        assert "id" in data
        # Verify aura structure
        assert "name" in data["aura"]
        assert "meaning" in data["aura"]
        assert "strengths" in data["aura"]
        print(f"✓ POST /api/reiki/aura-reading: 200 OK - {data['aura']['name']}")
    
    def test_get_readings(self, auth_headers):
        """GET /api/reiki/readings should return user's readings array"""
        response = requests.get(f"{BASE_URL}/api/reiki/readings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "readings" in data
        assert isinstance(data["readings"], list)
        print(f"✓ GET /api/reiki/readings: 200 OK - {len(data['readings'])} readings")


class TestReikiHealingSession:
    """Tests for reiki healing session logging (authenticated)"""
    
    def test_log_healing_session(self, auth_headers):
        """POST /api/reiki/healing-session should log a session"""
        response = requests.post(f"{BASE_URL}/api/reiki/healing-session",
            json={
                "session_type": "self_reiki",
                "positions_used": ["head_crown", "heart"],
                "duration_minutes": 20,
                "chakras_focused": ["crown", "heart"],
                "intention": "TEST_healing intention",
                "sensations": "warmth, tingling",
                "notes": "TEST_session"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"
        assert "id" in data
        print(f"✓ POST /api/reiki/healing-session: 200 OK - session logged")
    
    def test_get_healing_sessions(self, auth_headers):
        """GET /api/reiki/sessions should return user's healing sessions"""
        response = requests.get(f"{BASE_URL}/api/reiki/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        print(f"✓ GET /api/reiki/sessions: 200 OK - {len(data['sessions'])} sessions")


# ============== DISCOVER MODULE TESTS ==============

class TestDiscoverSuggestions:
    """Tests for Try Something New discovery endpoints"""
    
    def test_get_suggestions(self, auth_headers):
        """GET /api/discover/suggestions should return suggestions with counts"""
        response = requests.get(f"{BASE_URL}/api/discover/suggestions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert "total_features" in data
        assert "explored" in data
        assert "unexplored" in data
        assert "exploration_percent" in data
        assert isinstance(data["suggestions"], list)
        assert isinstance(data["explored"], int)
        assert isinstance(data["unexplored"], int)
        print(f"✓ GET /api/discover/suggestions: 200 OK - explored: {data['explored']}, unexplored: {data['unexplored']}")
    
    def test_get_personalized(self, auth_headers):
        """GET /api/discover/personalized should return mood-based recommendations"""
        response = requests.get(f"{BASE_URL}/api/discover/personalized", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "mood" in data
        assert "recommended" in data
        assert "reason" in data
        assert isinstance(data["recommended"], list)
        print(f"✓ GET /api/discover/personalized: 200 OK - mood: {data['mood']}, {len(data['recommended'])} recommendations")


# ============== DAILY RITUAL MODULE TESTS ==============

class TestDailyRitualGenerate:
    """Tests for daily ritual generation endpoints"""
    
    def test_generate_morning_ritual(self, auth_headers):
        """GET /api/daily-ritual/generate?time_of_day=morning should return morning ritual"""
        response = requests.get(f"{BASE_URL}/api/daily-ritual/generate?time_of_day=morning", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "time_of_day" in data
        assert data["time_of_day"] == "morning"
        assert "ritual" in data
        assert "steps" in data["ritual"]
        assert isinstance(data["ritual"]["steps"], list)
        assert len(data["ritual"]["steps"]) > 0
        # Verify step structure
        step = data["ritual"]["steps"][0]
        assert "type" in step
        assert "name" in step
        assert "duration" in step
        assert "instruction" in step
        print(f"✓ GET /api/daily-ritual/generate?time_of_day=morning: 200 OK - {len(data['ritual']['steps'])} steps")
        return data["id"]
    
    def test_generate_evening_ritual(self, auth_headers):
        """GET /api/daily-ritual/generate?time_of_day=evening should return evening ritual"""
        response = requests.get(f"{BASE_URL}/api/daily-ritual/generate?time_of_day=evening", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "time_of_day" in data
        assert data["time_of_day"] == "evening"
        assert "ritual" in data
        assert "steps" in data["ritual"]
        assert len(data["ritual"]["steps"]) > 0
        print(f"✓ GET /api/daily-ritual/generate?time_of_day=evening: 200 OK - {len(data['ritual']['steps'])} steps")


class TestDailyRitualCompleteStep:
    """Tests for completing ritual steps"""
    
    def test_complete_step(self, auth_headers):
        """POST /api/daily-ritual/complete-step should mark step complete"""
        # First get a ritual
        ritual_response = requests.get(f"{BASE_URL}/api/daily-ritual/generate?time_of_day=morning", headers=auth_headers)
        assert ritual_response.status_code == 200
        ritual_id = ritual_response.json()["id"]
        
        # Complete step 0
        response = requests.post(f"{BASE_URL}/api/daily-ritual/complete-step",
            json={"ritual_id": ritual_id, "step_index": 0},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "completed_steps" in data
        assert "is_complete" in data
        assert "total_steps" in data
        assert 0 in data["completed_steps"]
        print(f"✓ POST /api/daily-ritual/complete-step: 200 OK - step 0 completed")


class TestDailyRitualProfile:
    """Tests for wellness profile endpoint"""
    
    def test_get_profile(self, auth_headers):
        """GET /api/daily-ritual/profile should return profile and personalization_level"""
        response = requests.get(f"{BASE_URL}/api/daily-ritual/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "profile" in data
        assert "personalization_level" in data
        assert data["personalization_level"] in ["New", "Growing", "Deep"]
        # Verify profile structure
        profile = data["profile"]
        assert "dominant_mood" in profile
        assert "experience_level" in profile
        print(f"✓ GET /api/daily-ritual/profile: 200 OK - level: {data['personalization_level']}")


# ============== REGRESSION TESTS ==============

class TestRegressionHealth:
    """Regression test for health endpoint"""
    
    def test_health_endpoint(self):
        """GET /api/health should still work"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ REGRESSION: GET /api/health: 200 OK")


class TestRegressionAuth:
    """Regression test for authentication"""
    
    def test_login(self):
        """POST /api/auth/login should work with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print("✓ REGRESSION: POST /api/auth/login: 200 OK")


class TestRegressionAromatherapy:
    """Regression test for aromatherapy (from iteration 29)"""
    
    def test_get_oils_returns_12(self):
        """GET /api/aromatherapy/oils should still return 12 oils"""
        response = requests.get(f"{BASE_URL}/api/aromatherapy/oils")
        assert response.status_code == 200
        data = response.json()
        assert "oils" in data
        assert len(data["oils"]) == 12
        print(f"✓ REGRESSION: GET /api/aromatherapy/oils: 200 OK - {len(data['oils'])} oils")


class TestRegressionHerbology:
    """Regression test for herbology (from iteration 29)"""
    
    def test_get_herbs_returns_12(self):
        """GET /api/herbology/herbs should still return 12 herbs"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        assert "herbs" in data
        assert len(data["herbs"]) == 12
        print(f"✓ REGRESSION: GET /api/herbology/herbs: 200 OK - {len(data['herbs'])} herbs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

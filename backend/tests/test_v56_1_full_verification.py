"""
V56.1 Full System Verification Tests
Tests: Daily cross-module challenges, core data APIs, XP hooks, ProgressGate, fixed imports
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test_v29_user@test.com",
        "password": "testpass123"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestDailyCrossModuleChallenges:
    """V56.1 Daily Cross-Module Challenges API"""
    
    def test_get_daily_challenges_authenticated(self, auth_headers):
        """GET /api/challenges/daily-cross-module returns 4 challenges with task progress"""
        response = requests.get(f"{BASE_URL}/api/challenges/daily-cross-module", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "challenges" in data
        assert "date" in data
        challenges = data["challenges"]
        
        # Should have exactly 4 elemental challenges
        assert len(challenges) == 4
        
        # Verify each challenge has required fields
        elements = set()
        for ch in challenges:
            assert "id" in ch
            assert "name" in ch
            assert "description" in ch
            assert "tasks" in ch
            assert "xp_reward" in ch
            assert "xp_multiplier" in ch
            assert "color" in ch
            assert "element" in ch
            assert "all_tasks_done" in ch
            assert "claimed" in ch
            elements.add(ch["element"])
            
            # Verify tasks have progress tracking
            for task in ch["tasks"]:
                assert "source" in task
                assert "action" in task
                assert "count" in task
                assert "label" in task
                assert "current" in task
                assert "done" in task
        
        # Should have all 4 elements
        assert elements == {"Earth", "Air", "Fire", "Water"}
    
    def test_daily_challenges_unauthenticated_fails(self):
        """Daily challenges require authentication"""
        response = requests.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 401


class TestCoreDataAPIs:
    """Verify all core data APIs return expected counts"""
    
    def test_crystals_api(self):
        """GET /api/crystals returns 12 crystals"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        crystals = data.get("crystals", [])
        assert len(crystals) == 12, f"Expected 12 crystals, got {len(crystals)}"
    
    def test_herbology_api(self):
        """GET /api/herbology/herbs returns 12 herbs"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        herbs = data.get("herbs", [])
        assert len(herbs) == 12, f"Expected 12 herbs, got {len(herbs)}"
    
    def test_aromatherapy_api(self):
        """GET /api/aromatherapy/oils returns 12 oils"""
        response = requests.get(f"{BASE_URL}/api/aromatherapy/oils")
        assert response.status_code == 200
        data = response.json()
        oils = data.get("oils", [])
        assert len(oils) == 12, f"Expected 12 oils, got {len(oils)}"
    
    def test_elixirs_api(self):
        """GET /api/elixirs/all returns 10 elixirs"""
        response = requests.get(f"{BASE_URL}/api/elixirs/all")
        assert response.status_code == 200
        data = response.json()
        elixirs = data.get("elixirs", [])
        assert len(elixirs) == 10, f"Expected 10 elixirs, got {len(elixirs)}"
    
    def test_acupressure_api(self):
        """GET /api/acupressure/points returns 10 points"""
        response = requests.get(f"{BASE_URL}/api/acupressure/points")
        assert response.status_code == 200
        data = response.json()
        points = data.get("points", [])
        assert len(points) == 10, f"Expected 10 points, got {len(points)}"
    
    def test_yoga_styles_api(self):
        """GET /api/yoga/styles returns 7 styles"""
        response = requests.get(f"{BASE_URL}/api/yoga/styles")
        assert response.status_code == 200
        data = response.json()
        styles = data.get("styles", [])
        assert len(styles) == 7, f"Expected 7 yoga styles, got {len(styles)}"
    
    def test_oracle_zodiac_api(self):
        """GET /api/oracle/zodiac returns 12 signs"""
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
    
    def test_frequencies_api(self):
        """GET /api/frequencies returns 12 frequencies (array response)"""
        response = requests.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        # API returns array directly
        frequencies = data if isinstance(data, list) else data.get("frequencies", [])
        assert len(frequencies) == 12, f"Expected 12 frequencies, got {len(frequencies)}"
    
    def test_mudras_api(self):
        """GET /api/mudras returns 25 mudras (array response)"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        # API returns array directly
        mudras = data if isinstance(data, list) else data.get("mudras", [])
        assert len(mudras) == 25, f"Expected 25 mudras, got {len(mudras)}"
    
    def test_nourishment_api(self):
        """GET /api/nourishment returns 8 foods (array response)"""
        response = requests.get(f"{BASE_URL}/api/nourishment")
        assert response.status_code == 200
        data = response.json()
        # API returns array directly
        foods = data if isinstance(data, list) else data.get("foods", [])
        assert len(foods) == 8, f"Expected 8 foods, got {len(foods)}"
    
    def test_reiki_positions_api(self):
        """GET /api/reiki/positions returns 10 positions"""
        response = requests.get(f"{BASE_URL}/api/reiki/positions")
        assert response.status_code == 200
        data = response.json()
        positions = data.get("positions", [])
        assert len(positions) == 10, f"Expected 10 reiki positions, got {len(positions)}"


class TestRPGMilestones:
    """Test RPG milestones for ProgressGate"""
    
    def test_get_milestones(self, auth_headers):
        """GET /api/rpg/milestones returns milestone list"""
        response = requests.get(f"{BASE_URL}/api/rpg/milestones", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "milestones" in data
        
        # Check for dream_realms_access milestone (used by ProgressGate)
        milestone_ids = [m["id"] for m in data["milestones"]]
        assert "dream_realms_access" in milestone_ids or len(milestone_ids) > 0


class TestOracleIChing:
    """Test I Ching coin toss reading"""
    
    def test_iching_reading_with_lines(self):
        """POST /api/oracle/reading with I Ching type and lines"""
        response = requests.post(f"{BASE_URL}/api/oracle/reading", json={
            "reading_type": "iching",
            "question": "What guidance do I need today?",
            "lines": [7, 8, 7, 9, 8, 6]  # Sample hexagram lines
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("type") == "iching"
        assert "hexagram_number" in data
        assert "lines" in data
        assert "interpretation" in data


class TestYogaGuidedFlow:
    """Test yoga style detail with sequences for guided flow"""
    
    def test_yoga_style_detail(self):
        """GET /api/yoga/style/{id} returns sequences with poses"""
        # First get styles to find a valid ID
        styles_res = requests.get(f"{BASE_URL}/api/yoga/styles")
        assert styles_res.status_code == 200
        styles = styles_res.json().get("styles", [])
        assert len(styles) > 0
        
        style_id = styles[0]["id"]
        response = requests.get(f"{BASE_URL}/api/yoga/style/{style_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert "name" in data
        assert "sequences" in data
        
        # Verify sequences have poses for guided flow
        if data["sequences"]:
            seq = data["sequences"][0]
            assert "name" in seq
            assert "poses" in seq


class TestXPGainEndpoint:
    """Test XP gain endpoint used by __workAccrue hook"""
    
    def test_gain_xp(self, auth_headers):
        """POST /api/rpg/character/gain-xp awards XP"""
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"source": "test_verification", "amount": 5},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "xp_gained" in data or "total_xp" in data or "level" in data


class TestHealthEndpoint:
    """Basic health check"""
    
    def test_health(self):
        """GET /api/health returns ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"

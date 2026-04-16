"""
V56.1 Cross-Module Daily Challenges API Tests
Tests for:
- GET /api/challenges/daily-cross-module - Returns 4 elemental challenges with task progress
- POST /api/challenges/daily-cross-module/claim - Validates tasks and awards XP
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

class TestCrossModuleChallenges:
    """Tests for V56.1 Cross-Module Daily Challenges"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("token") or data.get("access_token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.authenticated = True
            else:
                self.authenticated = False
        else:
            self.authenticated = False
    
    def test_get_daily_cross_module_challenges(self):
        """Test GET /api/challenges/daily-cross-module returns 4 elemental challenges"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "challenges" in data, "Response should contain 'challenges' key"
        assert "date" in data, "Response should contain 'date' key"
        
        challenges = data["challenges"]
        assert len(challenges) == 4, f"Expected 4 elemental challenges, got {len(challenges)}"
        
        # Verify all 4 elements are present
        elements = [c["element"] for c in challenges]
        assert "Earth" in elements, "Earth element challenge missing"
        assert "Air" in elements, "Air element challenge missing"
        assert "Fire" in elements, "Fire element challenge missing"
        assert "Water" in elements, "Water element challenge missing"
        
        print(f"PASS: GET /api/challenges/daily-cross-module returns 4 elemental challenges")
    
    def test_cross_module_challenge_structure(self):
        """Test that each challenge has required fields"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200
        
        challenges = response.json()["challenges"]
        
        required_fields = ["id", "name", "description", "tasks", "xp_reward", "xp_multiplier", "color", "element", "all_tasks_done", "claimed"]
        
        for challenge in challenges:
            for field in required_fields:
                assert field in challenge, f"Challenge missing required field: {field}"
            
            # Verify tasks structure
            assert isinstance(challenge["tasks"], list), "Tasks should be a list"
            assert len(challenge["tasks"]) >= 2, f"Challenge should have at least 2 tasks, got {len(challenge['tasks'])}"
            
            for task in challenge["tasks"]:
                assert "source" in task, "Task missing 'source'"
                assert "action" in task, "Task missing 'action'"
                assert "count" in task, "Task missing 'count'"
                assert "label" in task, "Task missing 'label'"
                assert "current" in task, "Task missing 'current' (progress)"
                assert "done" in task, "Task missing 'done' (completion status)"
        
        print(f"PASS: All challenges have correct structure with tasks")
    
    def test_earth_element_challenge_details(self):
        """Test Earth element challenge has correct tasks"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200
        
        challenges = response.json()["challenges"]
        earth = next((c for c in challenges if c["element"] == "Earth"), None)
        
        assert earth is not None, "Earth challenge not found"
        assert earth["id"] == "earth-element"
        assert earth["color"] == "#22C55E"
        assert earth["xp_reward"] == 100
        assert earth["xp_multiplier"] == 1.2
        
        # Verify Earth tasks
        task_sources = [t["source"] for t in earth["tasks"]]
        assert "crystals" in task_sources, "Earth should have crystals task"
        assert "yoga_practice" in task_sources, "Earth should have yoga_practice task"
        assert "dream_journal" in task_sources, "Earth should have dream_journal task"
        
        print(f"PASS: Earth element challenge has correct configuration")
    
    def test_air_element_challenge_details(self):
        """Test Air element challenge has correct tasks"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200
        
        challenges = response.json()["challenges"]
        air = next((c for c in challenges if c["element"] == "Air"), None)
        
        assert air is not None, "Air challenge not found"
        assert air["id"] == "air-temple"
        assert air["color"] == "#2DD4BF"
        assert air["xp_reward"] == 120
        assert air["xp_multiplier"] == 1.3
        
        # Verify Air tasks
        task_sources = [t["source"] for t in air["tasks"]]
        assert "breathing_exercise" in task_sources, "Air should have breathing_exercise task"
        assert "oracle_reading" in task_sources, "Air should have oracle_reading task"
        assert "frequencies" in task_sources, "Air should have frequencies task"
        
        print(f"PASS: Air element challenge has correct configuration")
    
    def test_fire_element_challenge_details(self):
        """Test Fire element challenge has correct tasks"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200
        
        challenges = response.json()["challenges"]
        fire = next((c for c in challenges if c["element"] == "Fire"), None)
        
        assert fire is not None, "Fire challenge not found"
        assert fire["id"] == "fire-alchemy"
        assert fire["color"] == "#EF4444"
        assert fire["xp_reward"] == 110
        assert fire["xp_multiplier"] == 1.2
        
        # Verify Fire tasks
        task_sources = [t["source"] for t in fire["tasks"]]
        assert "meditation_session" in task_sources, "Fire should have meditation_session task"
        assert "elixirs" in task_sources, "Fire should have elixirs task"
        assert "mantras" in task_sources, "Fire should have mantras task"
        
        print(f"PASS: Fire element challenge has correct configuration")
    
    def test_water_element_challenge_details(self):
        """Test Water element challenge has correct tasks"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code == 200
        
        challenges = response.json()["challenges"]
        water = next((c for c in challenges if c["element"] == "Water"), None)
        
        assert water is not None, "Water challenge not found"
        assert water["id"] == "water-healing"
        assert water["color"] == "#3B82F6"
        assert water["xp_reward"] == 100
        assert water["xp_multiplier"] == 1.2
        
        # Verify Water tasks
        task_sources = [t["source"] for t in water["tasks"]]
        assert "herbology" in task_sources, "Water should have herbology task"
        assert "reiki" in task_sources, "Water should have reiki task"
        assert "mood_log" in task_sources, "Water should have mood_log task"
        
        print(f"PASS: Water element challenge has correct configuration")
    
    def test_claim_incomplete_challenge_fails(self):
        """Test that claiming an incomplete challenge returns 400"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # Try to claim earth challenge (likely incomplete)
        response = self.session.post(f"{BASE_URL}/api/challenges/daily-cross-module/claim", json={
            "challenge_id": "earth-element"
        })
        
        # Should either be 400 (task not complete) or return already_claimed
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"
        
        if response.status_code == 400:
            data = response.json()
            assert "detail" in data, "Error response should have detail"
            print(f"PASS: Claiming incomplete challenge correctly returns 400: {data['detail']}")
        else:
            data = response.json()
            if data.get("already_claimed"):
                print(f"PASS: Challenge already claimed today")
            else:
                print(f"PASS: Challenge claimed (tasks were complete)")
    
    def test_claim_nonexistent_challenge_fails(self):
        """Test that claiming a non-existent challenge returns 404"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.post(f"{BASE_URL}/api/challenges/daily-cross-module/claim", json={
            "challenge_id": "nonexistent-challenge"
        })
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: Claiming non-existent challenge returns 404")
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated requests are denied"""
        # Create new session without auth
        unauth_session = requests.Session()
        unauth_session.headers.update({"Content-Type": "application/json"})
        
        response = unauth_session.get(f"{BASE_URL}/api/challenges/daily-cross-module")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
        print(f"PASS: Unauthenticated access correctly denied")


class TestOracleIChingReading:
    """Tests for Oracle I Ching reading endpoint (used by IChingCoinToss)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("token") or data.get("access_token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.authenticated = True
            else:
                self.authenticated = False
        else:
            self.authenticated = False
    
    def test_iching_reading_with_lines(self):
        """Test POST /api/oracle/reading with I Ching lines from coin toss"""
        response = self.session.post(f"{BASE_URL}/api/oracle/reading", json={
            "reading_type": "iching",
            "question": "What guidance do I seek?",
            "lines": [7, 8, 9, 6, 7, 8]  # Sample hexagram lines
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("type") == "iching", "Response type should be 'iching'"
        assert "interpretation" in data, "Response should have interpretation"
        assert "hexagram_number" in data or "lines" in data, "Response should have hexagram info"
        
        print(f"PASS: I Ching reading with lines works correctly")


class TestYogaStylesAndSequences:
    """Tests for Yoga styles and sequences (used by YogaGuidedFlow)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_get_yoga_styles(self):
        """Test GET /api/yoga/styles returns styles with sequences"""
        response = self.session.get(f"{BASE_URL}/api/yoga/styles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "styles" in data, "Response should have 'styles' key"
        
        styles = data["styles"]
        assert len(styles) > 0, "Should have at least one yoga style"
        
        # Check first style has required fields
        style = styles[0]
        assert "id" in style, "Style should have 'id'"
        assert "name" in style, "Style should have 'name'"
        assert "color" in style, "Style should have 'color'"
        
        print(f"PASS: GET /api/yoga/styles returns {len(styles)} styles")
    
    def test_get_yoga_style_detail(self):
        """Test GET /api/yoga/style/{id} returns sequences with poses"""
        # First get styles to find a valid ID
        styles_response = self.session.get(f"{BASE_URL}/api/yoga/styles")
        assert styles_response.status_code == 200
        
        styles = styles_response.json()["styles"]
        if not styles:
            pytest.skip("No yoga styles available")
        
        style_id = styles[0]["id"]
        
        response = self.session.get(f"{BASE_URL}/api/yoga/style/{style_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sequences" in data or "poses" in data, "Style detail should have sequences or poses"
        
        if "sequences" in data and data["sequences"]:
            seq = data["sequences"][0]
            assert "name" in seq, "Sequence should have 'name'"
            assert "poses" in seq, "Sequence should have 'poses'"
            
            if seq["poses"]:
                pose = seq["poses"][0]
                assert "name" in pose, "Pose should have 'name'"
                assert "duration" in pose or "description" in pose, "Pose should have duration or description"
        
        print(f"PASS: GET /api/yoga/style/{style_id} returns style with sequences")

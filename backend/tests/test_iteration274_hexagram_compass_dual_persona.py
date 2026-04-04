"""
Test Iteration 274 - Hexagram Compass, UtilityDock, EmergencyShutOff, and Dual-Persona Sage System

Features tested:
- Sage chat with layer_mode parameter (hollow/core/matrix/void)
- Dual-persona responses based on gravity layer
- Hexagram state in chat requests
- VOID state blocking Sage communication
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSageDualPersonaSystem:
    """Test the Dual-Persona Sage system with layer_mode parameter"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
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
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SAGE LIST AND INFO TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_get_sage_list(self):
        """Test GET /api/sages/list returns all 5 sages"""
        response = self.session.get(f"{BASE_URL}/api/sages/list")
        assert response.status_code == 200
        
        data = response.json()
        assert "sages" in data
        assert len(data["sages"]) == 5
        
        sage_ids = [s["id"] for s in data["sages"]]
        assert "kaelen" in sage_ids
        assert "sora" in sage_ids
        assert "elara" in sage_ids
        assert "finn" in sage_ids
        assert "vesper" in sage_ids
        print("PASS: GET /api/sages/list returns all 5 sages")
    
    def test_get_individual_sage(self):
        """Test GET /api/sages/{sage_id} returns sage info"""
        response = self.session.get(f"{BASE_URL}/api/sages/kaelen")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "kaelen"
        assert data["name"] == "Kaelen the Smith"
        assert data["zone"] == "practice_room"
        assert data["archetype"] == "The Disciplined Master"
        assert data["avatar_color"] == "#F97316"
        print("PASS: GET /api/sages/kaelen returns correct sage info")
    
    def test_sage_not_found(self):
        """Test GET /api/sages/{invalid_id} returns 404"""
        response = self.session.get(f"{BASE_URL}/api/sages/invalid_sage")
        assert response.status_code == 404
        print("PASS: GET /api/sages/invalid_sage returns 404")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # DUAL-PERSONA CHAT TESTS (layer_mode parameter)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_sage_chat_hollow_mode(self):
        """Test POST /api/sages/chat with layer_mode='hollow' (grounded persona)"""
        response = self.session.post(f"{BASE_URL}/api/sages/chat", json={
            "sage_id": "kaelen",
            "message": "Hello, I need guidance",
            "layer_mode": "hollow",
            "gravity": 0.15,
            "hexagram": 7,
            "layer_name": "hollow"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert "sage" in data
        assert data["layer_mode"] == "hollow"
        assert data["gravity"] == 0.15
        assert data["hexagram"] == 7
        assert len(data["response"]) > 0
        print(f"PASS: Sage chat in HOLLOW mode - Response: {data['response'][:100]}...")
    
    def test_sage_chat_matrix_mode(self):
        """Test POST /api/sages/chat with layer_mode='matrix' (celestial persona)"""
        response = self.session.post(f"{BASE_URL}/api/sages/chat", json={
            "sage_id": "sora",
            "message": "What do you see in my future?",
            "layer_mode": "matrix",
            "gravity": 0.85,
            "hexagram": 56,
            "layer_name": "matrix"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["layer_mode"] == "matrix"
        assert data["gravity"] == 0.85
        assert data["hexagram"] == 56
        assert len(data["response"]) > 0
        print(f"PASS: Sage chat in MATRIX mode - Response: {data['response'][:100]}...")
    
    def test_sage_chat_core_mode(self):
        """Test POST /api/sages/chat with layer_mode='core' (balanced persona)"""
        response = self.session.post(f"{BASE_URL}/api/sages/chat", json={
            "sage_id": "elara",
            "message": "I need healing",
            "layer_mode": "core",
            "gravity": 0.5,
            "hexagram": 30,
            "layer_name": "core"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["layer_mode"] == "core"
        assert data["gravity"] == 0.5
        assert len(data["response"]) > 0
        print(f"PASS: Sage chat in CORE mode - Response: {data['response'][:100]}...")
    
    def test_sage_chat_void_mode_blocked(self):
        """Test POST /api/sages/chat with layer_mode='void' returns silent response"""
        response = self.session.post(f"{BASE_URL}/api/sages/chat", json={
            "sage_id": "finn",
            "message": "Can you hear me?",
            "layer_mode": "void",
            "gravity": 0,
            "hexagram": 0,
            "layer_name": "void"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert data["layer_mode"] == "void"
        # In VOID mode, response should be minimal/silent
        assert data["response"] == "..."
        print("PASS: Sage chat in VOID mode returns silent '...' response")
    
    def test_sage_chat_with_hexagram_state(self):
        """Test that hexagram state is passed correctly to backend"""
        # Test with Peace hexagram (7 = 0b000111)
        response = self.session.post(f"{BASE_URL}/api/sages/chat", json={
            "sage_id": "vesper",
            "message": "What does my hexagram mean?",
            "layer_mode": "core",
            "gravity": 0.5,
            "hexagram": 7,  # Peace hexagram
            "layer_name": "core"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["hexagram"] == 7
        print("PASS: Hexagram state (7 = Peace) passed correctly to backend")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SAGE GREETING TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_sage_greeting(self):
        """Test POST /api/sages/greet/{sage_id} returns greeting"""
        response = self.session.post(f"{BASE_URL}/api/sages/greet/elara")
        assert response.status_code == 200
        
        data = response.json()
        assert "greeting" in data
        assert "sage" in data
        assert data["sage"] == "Elara the Harmonist"
        assert data["sage_id"] == "elara"
        assert data["avatar_color"] == "#2DD4BF"
        assert len(data["greeting"]) > 0
        print(f"PASS: Sage greeting - {data['greeting'][:80]}...")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # USER PROGRESS TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_get_user_progress(self):
        """Test GET /api/sages/progress returns user progress"""
        response = self.session.get(f"{BASE_URL}/api/sages/progress")
        assert response.status_code == 200
        
        data = response.json()
        assert "lumens" in data
        assert "level" in data
        assert "stardust" in data
        assert "_id" not in data  # MongoDB _id should be excluded
        print(f"PASS: User progress - Level: {data['level']}, Lumens: {data['lumens']}, Stardust: {data['stardust']}")
    
    def test_get_active_quests(self):
        """Test GET /api/sages/quests/active returns active quests"""
        response = self.session.get(f"{BASE_URL}/api/sages/quests/active")
        assert response.status_code == 200
        
        data = response.json()
        assert "quests" in data
        assert isinstance(data["quests"], list)
        print(f"PASS: Active quests - {len(data['quests'])} quests found")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # QUEST GENERATION TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_generate_quest(self):
        """Test POST /api/sages/generate-quest/{sage_id} creates a quest"""
        response = self.session.post(f"{BASE_URL}/api/sages/generate-quest/kaelen")
        assert response.status_code == 200
        
        data = response.json()
        assert "quest" in data
        assert "sage" in data
        
        quest = data["quest"]
        assert "id" in quest
        assert "title" in quest
        assert "description" in quest
        assert "objective" in quest
        assert "rewards" in quest
        assert "status" in quest
        assert quest["status"] == "active"
        assert "_id" not in quest  # MongoDB _id should be excluded
        
        # Store quest ID for completion test
        self.generated_quest_id = quest["id"]
        print(f"PASS: Quest generated - '{quest['title']}' with rewards: {quest['rewards']}")
        return quest["id"]
    
    def test_complete_quest(self):
        """Test POST /api/sages/quests/complete marks quest complete"""
        # First generate a quest
        gen_response = self.session.post(f"{BASE_URL}/api/sages/generate-quest/finn")
        assert gen_response.status_code == 200
        quest_id = gen_response.json()["quest"]["id"]
        
        # Complete the quest
        response = self.session.post(f"{BASE_URL}/api/sages/quests/complete", json={
            "quest_id": quest_id
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "rewards" in data
        assert "message" in data
        print(f"PASS: Quest completed - {data['message']}")
    
    def test_complete_invalid_quest(self):
        """Test POST /api/sages/quests/complete with invalid ID returns 400/404"""
        response = self.session.post(f"{BASE_URL}/api/sages/quests/complete", json={
            "quest_id": "invalid_quest_id"
        })
        assert response.status_code in [400, 404]
        print("PASS: Invalid quest ID returns 400/404")


class TestHealthAndBasicEndpoints:
    """Test basic health and API endpoints"""
    
    def test_health_endpoint(self):
        """Test GET /api/health returns ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        print("PASS: Health endpoint returns ok")
    
    def test_auth_login(self):
        """Test POST /api/auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        print("PASS: Login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

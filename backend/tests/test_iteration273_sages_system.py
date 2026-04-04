"""
Test Suite for Iteration 273 - The Five Sages Expert Advisor System

Tests:
- GET /api/sages/list - Returns all 5 Sages with correct info
- GET /api/sages/progress - Returns user progress (lumens, level, stardust)
- POST /api/sages/greet/{sage_id} - Returns AI-generated greeting
- POST /api/sages/chat - Chat with Sage returns AI response
- POST /api/sages/generate-quest/{sage_id} - Creates a new quest
- GET /api/sages/quests/active - Returns user's active quests
- POST /api/sages/quests/complete - Marks quest complete and awards rewards
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# The 5 Sages
SAGE_IDS = ["kaelen", "sora", "elara", "finn", "vesper"]


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests."""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data, "No token in login response"
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestSagesList:
    """Tests for GET /api/sages/list endpoint."""
    
    def test_list_sages_returns_all_five(self):
        """Verify all 5 Sages are returned with correct structure."""
        response = requests.get(f"{BASE_URL}/api/sages/list")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "sages" in data, "Response missing 'sages' key"
        
        sages = data["sages"]
        assert len(sages) == 5, f"Expected 5 sages, got {len(sages)}"
        
        # Verify all sage IDs are present
        sage_ids = [s["id"] for s in sages]
        for expected_id in SAGE_IDS:
            assert expected_id in sage_ids, f"Missing sage: {expected_id}"
    
    def test_sage_has_required_fields(self):
        """Verify each Sage has all required fields."""
        response = requests.get(f"{BASE_URL}/api/sages/list")
        assert response.status_code == 200
        
        required_fields = ["id", "name", "zone", "archetype", "tone", "domain", "avatar_color"]
        
        for sage in response.json()["sages"]:
            for field in required_fields:
                assert field in sage, f"Sage {sage.get('id', 'unknown')} missing field: {field}"
    
    def test_kaelen_sage_info(self):
        """Verify Kaelen the Smith has correct info."""
        response = requests.get(f"{BASE_URL}/api/sages/list")
        assert response.status_code == 200
        
        sages = {s["id"]: s for s in response.json()["sages"]}
        kaelen = sages.get("kaelen")
        
        assert kaelen is not None, "Kaelen not found"
        assert kaelen["name"] == "Kaelen the Smith"
        assert kaelen["zone"] == "practice_room"
        assert kaelen["archetype"] == "The Disciplined Master"
        assert kaelen["tone"] == "disciplined_direct"
        assert kaelen["avatar_color"] == "#F97316"  # Orange
    
    def test_sora_sage_info(self):
        """Verify Sora the Seer has correct info."""
        response = requests.get(f"{BASE_URL}/api/sages/list")
        assert response.status_code == 200
        
        sages = {s["id"]: s for s in response.json()["sages"]}
        sora = sages.get("sora")
        
        assert sora is not None, "Sora not found"
        assert sora["name"] == "Sora the Seer"
        assert sora["zone"] == "oracle_chamber"
        assert sora["archetype"] == "The Mystic Oracle"
        assert sora["avatar_color"] == "#8B5CF6"  # Purple


class TestSageProgress:
    """Tests for GET /api/sages/progress endpoint."""
    
    def test_progress_requires_auth(self):
        """Verify progress endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/sages/progress")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_get_user_progress(self, auth_headers):
        """Verify user progress is returned with correct structure."""
        response = requests.get(
            f"{BASE_URL}/api/sages/progress",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "lumens" in data, "Missing 'lumens' field"
        assert "level" in data, "Missing 'level' field"
        assert "stardust" in data, "Missing 'stardust' field"
        
        # Verify types
        assert isinstance(data["lumens"], (int, float)), "lumens should be numeric"
        assert isinstance(data["level"], int), "level should be integer"
        assert isinstance(data["stardust"], (int, float)), "stardust should be numeric"
        
        # Verify reasonable values
        assert data["level"] >= 1, "Level should be at least 1"
        assert data["lumens"] >= 0, "Lumens should be non-negative"
        assert data["stardust"] >= 0, "Stardust should be non-negative"


class TestSageGreeting:
    """Tests for POST /api/sages/greet/{sage_id} endpoint."""
    
    def test_greeting_requires_auth(self):
        """Verify greeting endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/sages/greet/kaelen")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_greeting_invalid_sage(self, auth_headers):
        """Verify 404 for invalid sage ID."""
        response = requests.post(
            f"{BASE_URL}/api/sages/greet/invalid_sage",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_kaelen_greeting(self, auth_headers):
        """Test greeting from Kaelen the Smith."""
        response = requests.post(
            f"{BASE_URL}/api/sages/greet/kaelen",
            headers=auth_headers,
            timeout=30  # AI generation may take time
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "sage" in data, "Missing 'sage' field"
        assert "greeting" in data, "Missing 'greeting' field"
        assert "sage_id" in data, "Missing 'sage_id' field"
        
        assert data["sage"] == "Kaelen the Smith"
        assert data["sage_id"] == "kaelen"
        assert len(data["greeting"]) > 10, "Greeting too short"
        print(f"Kaelen greeting: {data['greeting'][:100]}...")
    
    def test_sora_greeting(self, auth_headers):
        """Test greeting from Sora the Seer."""
        response = requests.post(
            f"{BASE_URL}/api/sages/greet/sora",
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["sage"] == "Sora the Seer"
        assert data["sage_id"] == "sora"
        assert len(data["greeting"]) > 10
        print(f"Sora greeting: {data['greeting'][:100]}...")


class TestSageChat:
    """Tests for POST /api/sages/chat endpoint."""
    
    def test_chat_requires_auth(self):
        """Verify chat endpoint requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/sages/chat",
            json={"sage_id": "kaelen", "message": "Hello"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_chat_invalid_sage(self, auth_headers):
        """Verify 404 for invalid sage ID."""
        response = requests.post(
            f"{BASE_URL}/api/sages/chat",
            headers=auth_headers,
            json={"sage_id": "invalid_sage", "message": "Hello"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_chat_with_kaelen(self, auth_headers):
        """Test chat with Kaelen the Smith."""
        response = requests.post(
            f"{BASE_URL}/api/sages/chat",
            headers=auth_headers,
            json={
                "sage_id": "kaelen",
                "message": "What skill should I practice today?"
            },
            timeout=30
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "sage" in data, "Missing 'sage' field"
        assert "response" in data, "Missing 'response' field"
        assert "sage_id" in data, "Missing 'sage_id' field"
        
        assert data["sage"] == "Kaelen the Smith"
        assert data["sage_id"] == "kaelen"
        assert len(data["response"]) > 20, "Response too short"
        print(f"Kaelen response: {data['response'][:150]}...")
    
    def test_chat_with_elara(self, auth_headers):
        """Test chat with Elara the Harmonist."""
        response = requests.post(
            f"{BASE_URL}/api/sages/chat",
            headers=auth_headers,
            json={
                "sage_id": "elara",
                "message": "I'm feeling stressed today"
            },
            timeout=30
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["sage"] == "Elara the Harmonist"
        assert data["sage_id"] == "elara"
        assert len(data["response"]) > 20
        print(f"Elara response: {data['response'][:150]}...")


class TestQuestGeneration:
    """Tests for POST /api/sages/generate-quest/{sage_id} endpoint."""
    
    def test_quest_generation_requires_auth(self):
        """Verify quest generation requires authentication."""
        response = requests.post(f"{BASE_URL}/api/sages/generate-quest/kaelen")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_quest_generation_invalid_sage(self, auth_headers):
        """Verify 404 for invalid sage ID."""
        response = requests.post(
            f"{BASE_URL}/api/sages/generate-quest/invalid_sage",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_generate_quest_from_finn(self, auth_headers):
        """Test quest generation from Finn the Voyager."""
        response = requests.post(
            f"{BASE_URL}/api/sages/generate-quest/finn",
            headers=auth_headers,
            timeout=45  # Quest generation may take longer
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "sage" in data, "Missing 'sage' field"
        assert "quest" in data, "Missing 'quest' field"
        
        quest = data["quest"]
        assert "id" in quest, "Quest missing 'id'"
        assert "title" in quest, "Quest missing 'title'"
        assert "description" in quest, "Quest missing 'description'"
        assert "objective" in quest, "Quest missing 'objective'"
        assert "rewards" in quest, "Quest missing 'rewards'"
        assert "status" in quest, "Quest missing 'status'"
        
        assert quest["status"] == "active"
        assert quest["sage_id"] == "finn"
        
        # Verify rewards structure
        rewards = quest["rewards"]
        assert "lumens" in rewards, "Rewards missing 'lumens'"
        assert "stardust" in rewards, "Rewards missing 'stardust'"
        assert rewards["lumens"] > 0, "Lumens reward should be positive"
        
        print(f"Generated quest: {quest['title']}")
        print(f"Rewards: {rewards['lumens']} Lumens, {rewards['stardust']} Stardust")
        
        return quest["id"]


class TestActiveQuests:
    """Tests for GET /api/sages/quests/active endpoint."""
    
    def test_active_quests_requires_auth(self):
        """Verify active quests endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/sages/quests/active")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_get_active_quests(self, auth_headers):
        """Verify active quests are returned."""
        response = requests.get(
            f"{BASE_URL}/api/sages/quests/active",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "quests" in data, "Missing 'quests' field"
        assert isinstance(data["quests"], list), "quests should be a list"
        
        # If there are quests, verify structure
        if len(data["quests"]) > 0:
            quest = data["quests"][0]
            assert "id" in quest, "Quest missing 'id'"
            assert "title" in quest, "Quest missing 'title'"
            assert "sage_id" in quest, "Quest missing 'sage_id'"
            assert "status" in quest, "Quest missing 'status'"
            assert quest["status"] == "active"
            print(f"Found {len(data['quests'])} active quest(s)")


class TestQuestCompletion:
    """Tests for POST /api/sages/quests/complete endpoint."""
    
    def test_quest_completion_requires_auth(self):
        """Verify quest completion requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/sages/quests/complete",
            json={"quest_id": "some_id"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_quest_completion_invalid_id(self, auth_headers):
        """Verify 400/404 for invalid quest ID."""
        response = requests.post(
            f"{BASE_URL}/api/sages/quests/complete",
            headers=auth_headers,
            json={"quest_id": "invalid_quest_id"}
        )
        assert response.status_code in [400, 404], f"Expected 400/404, got {response.status_code}"
    
    def test_complete_quest_flow(self, auth_headers):
        """Test full quest flow: generate -> complete -> verify rewards."""
        # Step 1: Get initial progress
        progress_before = requests.get(
            f"{BASE_URL}/api/sages/progress",
            headers=auth_headers
        ).json()
        initial_lumens = progress_before.get("lumens", 0)
        initial_stardust = progress_before.get("stardust", 0)
        
        # Step 2: Generate a quest
        quest_response = requests.post(
            f"{BASE_URL}/api/sages/generate-quest/vesper",
            headers=auth_headers,
            timeout=45
        )
        assert quest_response.status_code == 200, f"Quest generation failed: {quest_response.text}"
        
        quest = quest_response.json()["quest"]
        quest_id = quest["id"]
        expected_lumens = quest["rewards"].get("lumens", 0)
        expected_stardust = quest["rewards"].get("stardust", 0)
        
        print(f"Generated quest: {quest['title']} (ID: {quest_id})")
        print(f"Expected rewards: {expected_lumens} Lumens, {expected_stardust} Stardust")
        
        # Step 3: Complete the quest
        complete_response = requests.post(
            f"{BASE_URL}/api/sages/quests/complete",
            headers=auth_headers,
            json={"quest_id": quest_id}
        )
        assert complete_response.status_code == 200, f"Quest completion failed: {complete_response.text}"
        
        complete_data = complete_response.json()
        assert complete_data.get("success") == True, "Quest completion should return success=True"
        assert "rewards" in complete_data, "Missing rewards in completion response"
        assert "message" in complete_data, "Missing message in completion response"
        
        print(f"Completion message: {complete_data['message']}")
        
        # Step 4: Verify progress was updated
        progress_after = requests.get(
            f"{BASE_URL}/api/sages/progress",
            headers=auth_headers
        ).json()
        
        new_lumens = progress_after.get("lumens", 0)
        new_stardust = progress_after.get("stardust", 0)
        
        assert new_lumens >= initial_lumens + expected_lumens, \
            f"Lumens not awarded correctly. Before: {initial_lumens}, After: {new_lumens}, Expected +{expected_lumens}"
        
        print(f"Progress updated: Lumens {initial_lumens} -> {new_lumens}, Stardust {initial_stardust} -> {new_stardust}")
        
        # Step 5: Verify quest is no longer active
        active_response = requests.get(
            f"{BASE_URL}/api/sages/quests/active",
            headers=auth_headers
        )
        active_quests = active_response.json().get("quests", [])
        active_ids = [q["id"] for q in active_quests]
        
        assert quest_id not in active_ids, "Completed quest should not be in active quests"
        print("Quest successfully removed from active quests")


class TestSagePersonas:
    """Tests to verify each Sage responds in character."""
    
    def test_all_sages_respond(self, auth_headers):
        """Verify all 5 Sages can respond to greetings."""
        for sage_id in SAGE_IDS:
            response = requests.post(
                f"{BASE_URL}/api/sages/greet/{sage_id}",
                headers=auth_headers,
                timeout=30
            )
            assert response.status_code == 200, f"Sage {sage_id} greeting failed: {response.text}"
            
            data = response.json()
            assert "greeting" in data, f"Sage {sage_id} missing greeting"
            assert len(data["greeting"]) > 5, f"Sage {sage_id} greeting too short"
            
            print(f"{data['sage']}: {data['greeting'][:80]}...")
            
            # Small delay between requests to avoid rate limiting
            time.sleep(0.5)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

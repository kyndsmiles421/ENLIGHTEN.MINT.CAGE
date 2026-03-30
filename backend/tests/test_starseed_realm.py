"""
Test suite for Starseed Realm Multiplayer System (Iteration 115)
Tests: World events, heartbeat, active players, leaderboard, encounters, alliances
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
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
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestWorldEvent:
    """World event endpoint tests - rotates every 6 hours"""
    
    def test_get_world_event_returns_200(self):
        """GET /api/starseed/realm/world-event returns current world event"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/world-event")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
    def test_world_event_has_required_fields(self):
        """World event has title, description, bonus, time_remaining"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/world-event")
        data = response.json()
        
        assert "title" in data, "Missing 'title' field"
        assert "description" in data, "Missing 'description' field"
        assert "bonus" in data, "Missing 'bonus' field"
        assert "time_remaining" in data, "Missing 'time_remaining' field"
        assert "remaining_seconds" in data, "Missing 'remaining_seconds' field"
        
        # Validate types
        assert isinstance(data["title"], str), "title should be string"
        assert isinstance(data["description"], str), "description should be string"
        assert isinstance(data["bonus"], str), "bonus should be string"
        assert isinstance(data["time_remaining"], str), "time_remaining should be string"
        assert isinstance(data["remaining_seconds"], int), "remaining_seconds should be int"
        
        print(f"Current world event: {data['title']}")
        print(f"Time remaining: {data['time_remaining']}")


class TestHeartbeat:
    """Heartbeat endpoint tests - updates player presence"""
    
    def test_heartbeat_requires_auth(self):
        """POST /api/starseed/realm/heartbeat requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/heartbeat", json={
            "origin_id": "pleiadian",
            "chapter": 1,
            "scene": 0
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_heartbeat_success(self, auth_headers):
        """POST /api/starseed/realm/heartbeat updates player presence"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/heartbeat", json={
            "origin_id": "pleiadian",
            "chapter": 1,
            "scene": 0
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", f"Expected status 'ok', got {data}"
        print("Heartbeat sent successfully")


class TestActivePlayers:
    """Active players endpoint tests"""
    
    def test_active_players_requires_auth(self):
        """GET /api/starseed/realm/active-players requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/active-players")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_active_players_returns_list(self, auth_headers):
        """GET /api/starseed/realm/active-players returns list of active players"""
        # First send heartbeat to ensure we're active
        requests.post(f"{BASE_URL}/api/starseed/realm/heartbeat", json={
            "origin_id": "pleiadian",
            "chapter": 1,
            "scene": 0
        }, headers=auth_headers)
        
        response = requests.get(f"{BASE_URL}/api/starseed/realm/active-players", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "players" in data, "Missing 'players' field"
        assert "total" in data, "Missing 'total' field"
        assert isinstance(data["players"], list), "players should be a list"
        
        print(f"Active players: {data['total']}")
        
        # If there are players, verify structure
        if len(data["players"]) > 0:
            player = data["players"][0]
            expected_fields = ["user_id", "character_name", "origin_id", "level", "color", "origin_name"]
            for field in expected_fields:
                assert field in player, f"Player missing '{field}' field"
            print(f"First player: {player['character_name']} ({player['origin_name']})")


class TestLeaderboard:
    """Leaderboard endpoint tests"""
    
    def test_leaderboard_requires_auth(self):
        """GET /api/starseed/realm/leaderboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_leaderboard_returns_ranked_players(self, auth_headers):
        """GET /api/starseed/realm/leaderboard returns top players sorted by level"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "leaderboard" in data, "Missing 'leaderboard' field"
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        
        print(f"Leaderboard entries: {len(data['leaderboard'])}")
        
        # Verify structure and ranking
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            expected_fields = ["rank", "character_name", "origin_id", "origin_name", "color", "level", "xp", "achievements"]
            for field in expected_fields:
                assert field in entry, f"Leaderboard entry missing '{field}' field"
            
            # Verify ranking is correct (rank 1 should be first)
            assert entry["rank"] == 1, f"First entry should have rank 1, got {entry['rank']}"
            
            # Verify sorted by level (descending)
            if len(data["leaderboard"]) > 1:
                for i in range(len(data["leaderboard"]) - 1):
                    assert data["leaderboard"][i]["level"] >= data["leaderboard"][i+1]["level"], \
                        "Leaderboard should be sorted by level descending"
            
            print(f"Top player: {entry['character_name']} (Lvl {entry['level']})")


class TestEncounterRequest:
    """Encounter request endpoint tests - NPC encounters when no other players"""
    
    def test_encounter_request_requires_auth(self):
        """POST /api/starseed/realm/encounter/request requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/encounter/request", json={
            "origin_id": "pleiadian"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_encounter_request_generates_npc_encounter(self, auth_headers):
        """POST /api/starseed/realm/encounter/request with no target generates NPC encounter"""
        # This test may take 15-20 seconds due to AI generation
        response = requests.post(f"{BASE_URL}/api/starseed/realm/encounter/request", json={
            "origin_id": "pleiadian",
            "target_user_id": None
        }, headers=auth_headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify encounter structure
        assert "id" in data, "Missing 'id' field"
        assert "player_1" in data, "Missing 'player_1' field"
        assert "player_2" in data, "Missing 'player_2' field"
        assert "scene" in data, "Missing 'scene' field"
        assert "status" in data, "Missing 'status' field"
        
        # Verify scene has narrative and choices
        scene = data["scene"]
        assert "narrative" in scene, "Scene missing 'narrative'"
        assert "choices" in scene, "Scene missing 'choices'"
        assert len(scene["choices"]) == 3, f"Expected 3 choices, got {len(scene['choices'])}"
        
        # Verify each choice has required fields
        for i, choice in enumerate(scene["choices"]):
            assert "text" in choice, f"Choice {i} missing 'text'"
            assert "stat_effect" in choice, f"Choice {i} missing 'stat_effect'"
            assert "xp" in choice, f"Choice {i} missing 'xp'"
        
        # Check if NPC encounter
        if data.get("is_npc_encounter"):
            assert data["player_2"].get("is_npc") == True, "NPC player should have is_npc=True"
            print(f"NPC Encounter with: {data['player_2']['character_name']}")
        else:
            print(f"Player Encounter with: {data['player_2']['character_name']}")
        
        print(f"Scene title: {scene.get('scene_title', 'N/A')}")
        print(f"Encounter ID: {data['id']}")
        
        # Store encounter ID for resolve test
        return data["id"]


class TestEncounterResolve:
    """Encounter resolve endpoint tests"""
    
    def test_encounter_resolve_requires_auth(self):
        """POST /api/starseed/realm/encounter/resolve requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/encounter/resolve", json={
            "encounter_id": "test-id",
            "choice_index": 0
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_encounter_resolve_applies_changes(self, auth_headers):
        """POST /api/starseed/realm/encounter/resolve applies stat changes and XP"""
        # First create an encounter
        enc_response = requests.post(f"{BASE_URL}/api/starseed/realm/encounter/request", json={
            "origin_id": "pleiadian",
            "target_user_id": None
        }, headers=auth_headers, timeout=30)
        
        if enc_response.status_code != 200:
            pytest.skip("Could not create encounter for resolve test")
        
        encounter = enc_response.json()
        encounter_id = encounter["id"]
        
        # Resolve the encounter with choice 0
        response = requests.post(f"{BASE_URL}/api/starseed/realm/encounter/resolve", json={
            "encounter_id": encounter_id,
            "choice_index": 0
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify result structure
        assert "result" in data, "Missing 'result' field"
        assert "stat_changes" in data, "Missing 'stat_changes' field"
        assert "xp_earned" in data, "Missing 'xp_earned' field"
        assert "leveled_up" in data, "Missing 'leveled_up' field"
        assert "new_level" in data, "Missing 'new_level' field"
        assert "new_achievements" in data, "Missing 'new_achievements' field"
        
        # Verify types
        assert isinstance(data["stat_changes"], dict), "stat_changes should be dict"
        assert isinstance(data["xp_earned"], int), "xp_earned should be int"
        assert isinstance(data["leveled_up"], bool), "leveled_up should be bool"
        assert isinstance(data["new_achievements"], list), "new_achievements should be list"
        
        print(f"Encounter resolved: {data['result']}")
        print(f"XP earned: {data['xp_earned']}")
        print(f"Stat changes: {data['stat_changes']}")
        
        # Check for achievements
        if data["new_achievements"]:
            for ach in data["new_achievements"]:
                print(f"Achievement unlocked: {ach['title']}")


class TestAllianceCreate:
    """Alliance creation endpoint tests"""
    
    def test_alliance_create_requires_auth(self):
        """POST /api/starseed/realm/alliance/create requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/alliance/create", json={
            "name": "Test Alliance"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_alliance_create_success(self, auth_headers):
        """POST /api/starseed/realm/alliance/create creates alliance and assigns leader"""
        # First check if user is already in an alliance
        my_alliance = requests.get(f"{BASE_URL}/api/starseed/realm/my-alliance", headers=auth_headers)
        if my_alliance.status_code == 200 and my_alliance.json().get("alliance"):
            print("User already in alliance, skipping create test")
            pytest.skip("User already in an alliance")
        
        alliance_name = f"TEST_Cosmic_Alliance_{int(time.time())}"
        response = requests.post(f"{BASE_URL}/api/starseed/realm/alliance/create", json={
            "name": alliance_name
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify alliance structure
        assert "id" in data, "Missing 'id' field"
        assert "name" in data, "Missing 'name' field"
        assert "leader_id" in data, "Missing 'leader_id' field"
        assert "members" in data, "Missing 'members' field"
        assert "member_details" in data, "Missing 'member_details' field"
        
        assert data["name"] == alliance_name, f"Alliance name mismatch"
        assert len(data["members"]) == 1, "New alliance should have 1 member"
        assert data["member_details"][0]["role"] == "leader", "Creator should be leader"
        
        print(f"Alliance created: {data['name']} (ID: {data['id']})")


class TestAllianceJoin:
    """Alliance join endpoint tests"""
    
    def test_alliance_join_requires_auth(self):
        """POST /api/starseed/realm/alliance/join requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/alliance/join", json={
            "alliance_id": "test-id"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestAlliancesList:
    """Alliances list endpoint tests"""
    
    def test_alliances_list_requires_auth(self):
        """GET /api/starseed/realm/alliances requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/alliances")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_alliances_list_returns_all(self, auth_headers):
        """GET /api/starseed/realm/alliances returns all alliances"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/alliances", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "alliances" in data, "Missing 'alliances' field"
        assert isinstance(data["alliances"], list), "alliances should be a list"
        
        print(f"Total alliances: {len(data['alliances'])}")
        
        if len(data["alliances"]) > 0:
            alliance = data["alliances"][0]
            expected_fields = ["id", "name", "leader_id", "members"]
            for field in expected_fields:
                assert field in alliance, f"Alliance missing '{field}' field"
            print(f"First alliance: {alliance['name']} ({len(alliance['members'])} members)")


class TestMyAlliance:
    """My alliance endpoint tests"""
    
    def test_my_alliance_requires_auth(self):
        """GET /api/starseed/realm/my-alliance requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/my-alliance")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_my_alliance_returns_current(self, auth_headers):
        """GET /api/starseed/realm/my-alliance returns user's current alliance"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/my-alliance", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "alliance" in data, "Missing 'alliance' field"
        
        if data["alliance"]:
            alliance = data["alliance"]
            print(f"User's alliance: {alliance['name']}")
            assert "id" in alliance, "Alliance missing 'id'"
            assert "name" in alliance, "Alliance missing 'name'"
            assert "members" in alliance, "Alliance missing 'members'"
        else:
            print("User is not in any alliance")


class TestEncounterHistory:
    """Encounter history endpoint tests"""
    
    def test_encounter_history_requires_auth(self):
        """GET /api/starseed/realm/encounter-history requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/encounter-history")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        
    def test_encounter_history_returns_list(self, auth_headers):
        """GET /api/starseed/realm/encounter-history returns user's past encounters"""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/encounter-history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "encounters" in data, "Missing 'encounters' field"
        assert isinstance(data["encounters"], list), "encounters should be a list"
        
        print(f"Total encounters in history: {len(data['encounters'])}")
        
        if len(data["encounters"]) > 0:
            enc = data["encounters"][0]
            assert "id" in enc, "Encounter missing 'id'"
            assert "player_1" in enc, "Encounter missing 'player_1'"
            assert "player_2" in enc, "Encounter missing 'player_2'"
            print(f"Latest encounter: {enc['player_1'].get('character_name')} vs {enc['player_2'].get('character_name')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

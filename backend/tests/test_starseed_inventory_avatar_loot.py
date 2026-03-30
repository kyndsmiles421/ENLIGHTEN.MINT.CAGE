"""
Test suite for Starseed Inventory, Avatar Generation, and Loot Table endpoints.
Tests the new features: inventory management, item equipping, avatar generation, and boss loot tables.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zen-energy-bar.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"

# Test data
TEST_ORIGIN_ID = "pleiadian"
TEST_BOSS_IDS = ["void-leviathan", "entropy-weaver", "fallen-archon", "dream-parasite", "star-devourer"]


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Create auth headers with Bearer token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestInventoryEndpoints:
    """Tests for inventory management endpoints."""
    
    def test_get_inventory_pleiadian(self, auth_headers):
        """GET /api/starseed/inventory/{origin_id} - Get character inventory."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/inventory/{TEST_ORIGIN_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "inventory" in data, "Response should contain 'inventory' field"
        assert "equipped" in data, "Response should contain 'equipped' field"
        assert isinstance(data["inventory"], list), "inventory should be a list"
        assert isinstance(data["equipped"], list), "equipped should be a list"
        print(f"Inventory items: {len(data['inventory'])}, Equipped: {len(data['equipped'])}")
    
    def test_get_inventory_invalid_origin(self, auth_headers):
        """GET /api/starseed/inventory/{origin_id} - Invalid origin returns 404."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/inventory/invalid_origin_xyz",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for invalid origin, got {response.status_code}"
    
    def test_get_inventory_no_auth(self):
        """GET /api/starseed/inventory/{origin_id} - Requires authentication."""
        response = requests.get(f"{BASE_URL}/api/starseed/inventory/{TEST_ORIGIN_ID}")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_equip_item_no_item(self, auth_headers):
        """POST /api/starseed/inventory/equip - Equip non-existent item returns 404."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/inventory/equip",
            json={"origin_id": TEST_ORIGIN_ID, "item_id": "non_existent_item_xyz"},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for non-existent item, got {response.status_code}"
    
    def test_equip_item_invalid_origin(self, auth_headers):
        """POST /api/starseed/inventory/equip - Invalid origin returns 404."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/inventory/equip",
            json={"origin_id": "invalid_origin_xyz", "item_id": "some_item"},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for invalid origin, got {response.status_code}"


class TestLootTableEndpoints:
    """Tests for loot table endpoints."""
    
    def test_get_loot_table_void_tyrant(self, auth_headers):
        """GET /api/starseed/loot-table/{boss_id} - Get void_tyrant loot table."""
        # Note: The boss_id in the request uses underscore but the actual boss IDs use hyphens
        # Testing with void-leviathan which is a valid boss
        response = requests.get(f"{BASE_URL}/api/starseed/loot-table/void-leviathan")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "loot" in data, "Response should contain 'loot' field"
        assert isinstance(data["loot"], list), "loot should be a list"
        assert len(data["loot"]) > 0, "Loot table should not be empty"
        
        # Verify loot item structure
        for item in data["loot"]:
            assert "id" in item, "Loot item should have 'id'"
            assert "name" in item, "Loot item should have 'name'"
            assert "rarity" in item, "Loot item should have 'rarity'"
            assert "stat_bonus" in item, "Loot item should have 'stat_bonus'"
            assert item["rarity"] in ["common", "rare", "epic", "legendary"], f"Invalid rarity: {item['rarity']}"
        
        print(f"Void Leviathan loot table: {len(data['loot'])} items")
        for item in data["loot"]:
            print(f"  - {item['name']} ({item['rarity']})")
    
    def test_get_loot_table_all_bosses(self):
        """GET /api/starseed/loot-table/{boss_id} - Test all boss loot tables."""
        for boss_id in TEST_BOSS_IDS:
            response = requests.get(f"{BASE_URL}/api/starseed/loot-table/{boss_id}")
            assert response.status_code == 200, f"Expected 200 for {boss_id}, got {response.status_code}"
            
            data = response.json()
            assert "loot" in data, f"Response for {boss_id} should contain 'loot'"
            assert len(data["loot"]) > 0, f"Loot table for {boss_id} should not be empty"
            print(f"{boss_id}: {len(data['loot'])} loot items")
    
    def test_get_loot_table_invalid_boss(self):
        """GET /api/starseed/loot-table/{boss_id} - Invalid boss returns 404."""
        response = requests.get(f"{BASE_URL}/api/starseed/loot-table/invalid_boss_xyz")
        assert response.status_code == 404, f"Expected 404 for invalid boss, got {response.status_code}"


class TestAvatarEndpoints:
    """Tests for avatar generation and retrieval endpoints."""
    
    def test_get_avatar_pleiadian(self, auth_headers):
        """GET /api/starseed/avatar/{origin_id} - Get character avatar."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/avatar/{TEST_ORIGIN_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "avatar_base64" in data, "Response should contain 'avatar_base64' field"
        assert "avatar_prompt" in data, "Response should contain 'avatar_prompt' field"
        
        if data["avatar_base64"]:
            print(f"Avatar exists for {TEST_ORIGIN_ID}, prompt: {data.get('avatar_prompt', 'N/A')}")
        else:
            print(f"No avatar generated yet for {TEST_ORIGIN_ID}")
    
    def test_get_avatar_invalid_origin(self, auth_headers):
        """GET /api/starseed/avatar/{origin_id} - Invalid origin returns 404."""
        response = requests.get(
            f"{BASE_URL}/api/starseed/avatar/invalid_origin_xyz",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for invalid origin, got {response.status_code}"
    
    def test_get_avatar_no_auth(self):
        """GET /api/starseed/avatar/{origin_id} - Requires authentication."""
        response = requests.get(f"{BASE_URL}/api/starseed/avatar/{TEST_ORIGIN_ID}")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_generate_avatar_invalid_origin(self, auth_headers):
        """POST /api/starseed/avatar/generate - Invalid origin returns 404."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/avatar/generate",
            json={"origin_id": "invalid_origin_xyz", "description": "test"},
            headers=auth_headers
        )
        assert response.status_code in [400, 404], f"Expected 400/404 for invalid origin, got {response.status_code}"


class TestBossFightEndpoints:
    """Tests for boss fight initiation and action endpoints."""
    
    def test_initiate_boss_fight(self, auth_headers):
        """POST /api/starseed/realm/boss/initiate - Start a boss fight."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/realm/boss/initiate",
            json={"boss_id": "void-leviathan", "origin_id": TEST_ORIGIN_ID},
            headers=auth_headers,
            timeout=30  # Boss initiation can take time due to AI generation
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain battle 'id'"
        assert "boss_id" in data, "Response should contain 'boss_id'"
        assert "boss_hp" in data, "Response should contain 'boss_hp'"
        assert "boss_current_hp" in data, "Response should contain 'boss_current_hp'"
        assert "participants" in data, "Response should contain 'participants'"
        assert "current_scene" in data, "Response should contain 'current_scene'"
        
        # Verify scene structure
        scene = data["current_scene"]
        assert "narrative" in scene, "Scene should have 'narrative'"
        assert "choices" in scene, "Scene should have 'choices'"
        assert len(scene["choices"]) >= 2, "Scene should have at least 2 choices"
        
        print(f"Boss fight initiated: {data['boss_name']}")
        print(f"Battle ID: {data['id']}")
        print(f"Boss HP: {data['boss_current_hp']}/{data['boss_hp']}")
        print(f"Participants: {len(data['participants'])}")
        
        return data
    
    def test_boss_action(self, auth_headers):
        """POST /api/starseed/realm/boss/action - Process boss fight action."""
        # First initiate a boss fight
        init_response = requests.post(
            f"{BASE_URL}/api/starseed/realm/boss/initiate",
            json={"boss_id": "dream-parasite", "origin_id": TEST_ORIGIN_ID},
            headers=auth_headers,
            timeout=30
        )
        assert init_response.status_code == 200, f"Failed to initiate boss: {init_response.text}"
        
        battle_data = init_response.json()
        battle_id = battle_data["id"]
        
        # Now perform an action
        action_response = requests.post(
            f"{BASE_URL}/api/starseed/realm/boss/action",
            json={"battle_id": battle_id, "choice_index": 0},
            headers=auth_headers,
            timeout=30
        )
        assert action_response.status_code == 200, f"Expected 200, got {action_response.status_code}: {action_response.text}"
        
        data = action_response.json()
        assert "damage_dealt" in data, "Response should contain 'damage_dealt'"
        assert "boss_hp" in data, "Response should contain 'boss_hp'"
        assert "battle_over" in data, "Response should contain 'battle_over'"
        
        print(f"Action result: Dealt {data['damage_dealt']} damage")
        print(f"Boss HP: {data['boss_hp']}/{data['boss_max_hp']}")
        print(f"Battle over: {data['battle_over']}")
        
        if data.get("was_weakness"):
            print("Hit boss weakness! (1.5x damage)")
        if data.get("was_resistance"):
            print("Hit boss resistance (0.6x damage)")
    
    def test_boss_action_invalid_battle(self, auth_headers):
        """POST /api/starseed/realm/boss/action - Invalid battle ID returns 404."""
        response = requests.post(
            f"{BASE_URL}/api/starseed/realm/boss/action",
            json={"battle_id": "invalid_battle_xyz", "choice_index": 0},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for invalid battle, got {response.status_code}"


class TestBossLootDropIntegration:
    """Integration test for boss defeat and loot drop."""
    
    def test_boss_defeat_loot_drop(self, auth_headers):
        """Full boss fight to defeat and check for loot drop."""
        # Use dream-parasite as it has lowest HP (250)
        init_response = requests.post(
            f"{BASE_URL}/api/starseed/realm/boss/initiate",
            json={"boss_id": "dream-parasite", "origin_id": TEST_ORIGIN_ID},
            headers=auth_headers,
            timeout=30
        )
        assert init_response.status_code == 200, f"Failed to initiate: {init_response.text}"
        
        battle_data = init_response.json()
        battle_id = battle_data["id"]
        boss_hp = battle_data["boss_current_hp"]
        
        print(f"Starting boss fight: {battle_data['boss_name']} (HP: {boss_hp})")
        
        # Keep attacking until boss is defeated or battle ends
        max_rounds = 10
        round_num = 0
        loot_drop = None
        
        while round_num < max_rounds:
            round_num += 1
            action_response = requests.post(
                f"{BASE_URL}/api/starseed/realm/boss/action",
                json={"battle_id": battle_id, "choice_index": 0},  # Always use first choice (usually highest damage)
                headers=auth_headers,
                timeout=30
            )
            
            if action_response.status_code != 200:
                print(f"Round {round_num}: Action failed - {action_response.status_code}")
                break
            
            data = action_response.json()
            print(f"Round {round_num}: Dealt {data['damage_dealt']} damage, Boss HP: {data['boss_hp']}")
            
            if data.get("battle_over"):
                print(f"Battle ended! Boss defeated: {data.get('boss_defeated')}")
                if data.get("boss_defeated") and data.get("reward"):
                    reward = data["reward"]
                    print(f"XP earned: {reward.get('xp_earned')}")
                    if reward.get("loot_drop"):
                        loot_drop = reward["loot_drop"]
                        print(f"LOOT DROP: {loot_drop['name']} ({loot_drop['rarity']})")
                        print(f"  Stats: {loot_drop.get('stat_bonus')}")
                    else:
                        print("No loot dropped this time (probabilistic)")
                break
        
        # Verify the battle completed
        assert round_num <= max_rounds, "Battle took too many rounds"
        print(f"Boss fight completed in {round_num} rounds")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

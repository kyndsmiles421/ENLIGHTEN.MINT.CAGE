"""
Test Suite: Universal Game Core + Rock Hounding Module
Tests the Soul-to-Game Bridge architecture for The ENLIGHTEN.MINT.CAFE wellness RPG.

Endpoints tested:
- GET /api/game-core/stats - User's global game stats, level, currencies
- GET /api/game-core/modules - Registered game modules
- POST /api/game-core/commit-reward - Soul-to-Game Bridge for rewards
- GET /api/game-core/transactions - Transaction history
- GET /api/rock-hounding/mine - Current mine session
- POST /api/rock-hounding/mine-action - Execute mining action
- GET /api/rock-hounding/collection - User's mineral collection
- GET /api/rock-hounding/catalog - Full specimen catalog
- POST /api/rock-hounding/reset-mine - Reset mine session
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # Try to register if login fails
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "RPG Test User"
    })
    if reg_response.status_code in [200, 201]:
        return reg_response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def headers(auth_token):
    """Auth headers for API requests."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestGameCoreStats:
    """Tests for GET /api/game-core/stats endpoint."""
    
    def test_get_stats_returns_200(self, headers):
        """Stats endpoint returns 200 with valid auth."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/game-core/stats returns 200")
    
    def test_stats_contains_level_info(self, headers):
        """Stats response contains level information."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        data = response.json()
        
        assert "level" in data, "Response missing 'level' field"
        level = data["level"]
        assert "level" in level, "Level object missing 'level' field"
        assert "total_xp" in level, "Level object missing 'total_xp' field"
        assert "percentage" in level, "Level object missing 'percentage' field"
        assert isinstance(level["level"], int), "Level should be an integer"
        print(f"PASS: Stats contains level info - Level {level['level']}, XP {level['total_xp']}")
    
    def test_stats_contains_currencies(self, headers):
        """Stats response contains currency information."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        data = response.json()
        
        assert "currencies" in data, "Response missing 'currencies' field"
        currencies = data["currencies"]
        assert "cosmic_dust" in currencies, "Currencies missing 'cosmic_dust'"
        assert "stardust_shards" in currencies, "Currencies missing 'stardust_shards'"
        print(f"PASS: Stats contains currencies - Dust: {currencies['cosmic_dust']}, Shards: {currencies['stardust_shards']}")
    
    def test_stats_contains_stats(self, headers):
        """Stats response contains wisdom/vitality/resonance stats."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        data = response.json()
        
        assert "stats" in data, "Response missing 'stats' field"
        stats = data["stats"]
        assert "wisdom" in stats, "Stats missing 'wisdom'"
        assert "vitality" in stats, "Stats missing 'vitality'"
        assert "resonance" in stats, "Stats missing 'resonance'"
        
        # Each stat should have value, name, color, description
        for stat_name in ["wisdom", "vitality", "resonance"]:
            stat = stats[stat_name]
            assert "value" in stat, f"{stat_name} missing 'value'"
            assert "name" in stat, f"{stat_name} missing 'name'"
            assert "color" in stat, f"{stat_name} missing 'color'"
        print(f"PASS: Stats contains wisdom/vitality/resonance - W:{stats['wisdom']['value']}, V:{stats['vitality']['value']}, R:{stats['resonance']['value']}")
    
    def test_stats_requires_auth(self):
        """Stats endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print("PASS: GET /api/game-core/stats requires authentication")


class TestGameCoreModules:
    """Tests for GET /api/game-core/modules endpoint."""
    
    def test_get_modules_returns_200(self, headers):
        """Modules endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/game-core/modules", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/game-core/modules returns 200")
    
    def test_modules_contains_rock_hounding(self, headers):
        """Modules list includes rock_hounding module."""
        response = requests.get(f"{BASE_URL}/api/game-core/modules", headers=headers)
        data = response.json()
        
        assert "modules" in data, "Response missing 'modules' field"
        modules = data["modules"]
        assert isinstance(modules, list), "Modules should be a list"
        
        rock_hounding = next((m for m in modules if m.get("id") == "rock_hounding"), None)
        assert rock_hounding is not None, "rock_hounding module not found in modules list"
        assert rock_hounding.get("name") == "Rock Hounding", f"Expected name 'Rock Hounding', got {rock_hounding.get('name')}"
        assert "description" in rock_hounding, "rock_hounding missing description"
        assert "color" in rock_hounding, "rock_hounding missing color"
        print(f"PASS: Modules contains rock_hounding - {rock_hounding['name']}")


class TestGameCoreCommitReward:
    """Tests for POST /api/game-core/commit-reward - Soul-to-Game Bridge."""
    
    def test_commit_reward_xp(self, headers):
        """Commit reward with XP awards XP correctly."""
        # Get initial stats
        initial = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        initial_xp = initial["level"]["total_xp"]
        
        # Commit XP reward
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", headers=headers, json={
            "module_id": "rock_hounding",
            "xp": 10
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "committed", f"Expected status 'committed', got {data.get('status')}"
        assert "level" in data.get("results", {}), "Results missing 'level' after XP award"
        
        # Verify XP increased
        final = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        final_xp = final["level"]["total_xp"]
        assert final_xp >= initial_xp + 10, f"XP should have increased by at least 10, was {initial_xp}, now {final_xp}"
        print(f"PASS: Commit reward XP works - XP went from {initial_xp} to {final_xp}")
    
    def test_commit_reward_dust(self, headers):
        """Commit reward with dust awards cosmic dust correctly."""
        # Get initial currencies
        initial = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        initial_dust = initial["currencies"]["cosmic_dust"]
        
        # Commit dust reward
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", headers=headers, json={
            "module_id": "rock_hounding",
            "dust": 5
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "currencies" in data.get("results", {}), "Results missing 'currencies' after dust award"
        
        # Verify dust increased
        final = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        final_dust = final["currencies"]["cosmic_dust"]
        assert final_dust >= initial_dust + 5, f"Dust should have increased by at least 5, was {initial_dust}, now {final_dust}"
        print(f"PASS: Commit reward dust works - Dust went from {initial_dust} to {final_dust}")
    
    def test_commit_reward_stat(self, headers):
        """Commit reward with stat modification works."""
        # Get initial stats
        initial = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        initial_wisdom = initial["stats"]["wisdom"]["value"]
        
        # Commit stat reward
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", headers=headers, json={
            "module_id": "rock_hounding",
            "stat": "wisdom",
            "stat_delta": 1
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "stats" in data.get("results", {}), "Results missing 'stats' after stat modification"
        
        # Verify stat increased
        final = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers).json()
        final_wisdom = final["stats"]["wisdom"]["value"]
        assert final_wisdom >= initial_wisdom + 1, f"Wisdom should have increased by at least 1, was {initial_wisdom}, now {final_wisdom}"
        print(f"PASS: Commit reward stat works - Wisdom went from {initial_wisdom} to {final_wisdom}")
    
    def test_commit_reward_nexus_modifier(self, headers):
        """Commit reward with element feeds Nexus modifier."""
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", headers=headers, json={
            "module_id": "rock_hounding",
            "element": "earth"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "nexus_modifier" in data.get("results", {}), "Results missing 'nexus_modifier' after element feed"
        assert "+1 earth" in data["results"]["nexus_modifier"], f"Expected '+1 earth', got {data['results']['nexus_modifier']}"
        print(f"PASS: Commit reward nexus modifier works - {data['results']['nexus_modifier']}")
    
    def test_commit_reward_full_payload(self, headers):
        """Commit reward with full payload (XP, dust, stat, element)."""
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", headers=headers, json={
            "module_id": "rock_hounding",
            "xp": 25,
            "dust": 15,
            "stat": "resonance",
            "stat_delta": 2,
            "element": "water"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        results = data.get("results", {})
        assert "level" in results, "Full payload should return level"
        assert "currencies" in results, "Full payload should return currencies"
        assert "stats" in results, "Full payload should return stats"
        assert "nexus_modifier" in results, "Full payload should return nexus_modifier"
        print(f"PASS: Commit reward full payload works - All fields returned")


class TestGameCoreTransactions:
    """Tests for GET /api/game-core/transactions endpoint."""
    
    def test_get_transactions_returns_200(self, headers):
        """Transactions endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/game-core/transactions", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/game-core/transactions returns 200")
    
    def test_transactions_contains_list(self, headers):
        """Transactions response contains transactions list."""
        response = requests.get(f"{BASE_URL}/api/game-core/transactions", headers=headers)
        data = response.json()
        
        assert "transactions" in data, "Response missing 'transactions' field"
        assert isinstance(data["transactions"], list), "Transactions should be a list"
        
        # Should have transactions from previous tests
        if len(data["transactions"]) > 0:
            txn = data["transactions"][0]
            assert "type" in txn, "Transaction missing 'type'"
            assert "timestamp" in txn, "Transaction missing 'timestamp'"
            assert "source" in txn, "Transaction missing 'source'"
        print(f"PASS: Transactions contains list - {len(data['transactions'])} transactions")


class TestRockHoundingMine:
    """Tests for GET /api/rock-hounding/mine endpoint."""
    
    def test_get_mine_returns_200(self, headers):
        """Mine endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/rock-hounding/mine returns 200")
    
    def test_mine_contains_biome(self, headers):
        """Mine response contains biome information."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        data = response.json()
        
        assert "biome" in data, "Response missing 'biome' field"
        biome = data["biome"]
        assert "name" in biome, "Biome missing 'name'"
        assert "element" in biome, "Biome missing 'element'"
        assert "color" in biome, "Biome missing 'color'"
        assert "description" in biome, "Biome missing 'description'"
        print(f"PASS: Mine contains biome - {biome['name']} ({biome['element']})")
    
    def test_mine_contains_depths(self, headers):
        """Mine response contains depth layers."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        data = response.json()
        
        assert "depths" in data, "Response missing 'depths' field"
        depths = data["depths"]
        assert isinstance(depths, list), "Depths should be a list"
        assert len(depths) >= 1, "Should have at least 1 depth layer"
        
        depth1 = depths[0]
        assert depth1["depth"] == 1, "First depth should be depth 1"
        assert "name" in depth1, "Depth missing 'name'"
        assert "energy_cost" in depth1, "Depth missing 'energy_cost'"
        assert "unlocked" in depth1, "Depth missing 'unlocked'"
        assert depth1["unlocked"] == True, "Depth 1 should always be unlocked"
        print(f"PASS: Mine contains {len(depths)} depth layers, Depth 1 unlocked: {depth1['unlocked']}")
    
    def test_mine_contains_energy_info(self, headers):
        """Mine response contains energy information."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        data = response.json()
        
        assert "energy_info" in data, "Response missing 'energy_info' field"
        energy = data["energy_info"]
        assert "current" in energy, "Energy missing 'current'"
        assert "max" in energy, "Energy missing 'max'"
        assert energy["max"] == 20, f"Max energy should be 20, got {energy['max']}"
        print(f"PASS: Mine contains energy info - {energy['current']}/{energy['max']}")


class TestRockHoundingMineAction:
    """Tests for POST /api/rock-hounding/mine-action endpoint."""
    
    def test_mine_action_depth_1(self, headers):
        """Mining at depth 1 returns specimen with rewards."""
        # First ensure we have energy
        mine = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers).json()
        energy = mine.get("energy_info", {}).get("current", 0)
        
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", headers=headers, json={
            "depth": 1
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "specimen" in data, "Response missing 'specimen'"
        specimen = data["specimen"]
        assert "name" in specimen, "Specimen missing 'name'"
        assert "element" in specimen, "Specimen missing 'element'"
        assert "actual_rarity" in specimen, "Specimen missing 'actual_rarity'"
        
        assert "rewards" in data, "Response missing 'rewards'"
        rewards = data["rewards"]
        assert "xp" in rewards, "Rewards missing 'xp'"
        assert "dust" in rewards, "Rewards missing 'dust'"
        assert "stat" in rewards, "Rewards missing 'stat'"
        assert "stat_delta" in rewards, "Rewards missing 'stat_delta'"
        
        assert "energy" in data, "Response missing 'energy'"
        assert "level" in data, "Response missing 'level'"
        print(f"PASS: Mine action at depth 1 - Found {specimen['name']} ({specimen['actual_rarity']}), +{rewards['xp']} XP, +{rewards['dust']} dust")
    
    def test_mine_action_insufficient_energy(self, headers):
        """Mining with insufficient energy returns 400."""
        # Drain energy by mining repeatedly
        for _ in range(25):  # More than max energy
            response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", headers=headers, json={"depth": 1})
            if response.status_code == 400:
                data = response.json()
                assert "energy" in data.get("detail", "").lower() or "not enough" in data.get("detail", "").lower(), \
                    f"Expected energy error, got: {data.get('detail')}"
                print(f"PASS: Mine action with insufficient energy returns 400 - {data.get('detail')}")
                return
        
        # If we got here, we never ran out of energy (unlikely but possible)
        pytest.skip("Could not drain energy to test insufficient energy error")
    
    def test_mine_action_locked_depth(self, headers):
        """Mining at locked depth returns 400."""
        # Get mine to find a locked depth
        mine = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers).json()
        depths = mine.get("depths", [])
        
        locked_depth = next((d for d in depths if not d.get("unlocked")), None)
        if not locked_depth:
            pytest.skip("No locked depths available to test")
        
        response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", headers=headers, json={
            "depth": locked_depth["depth"]
        })
        assert response.status_code == 400, f"Expected 400 for locked depth, got {response.status_code}"
        data = response.json()
        assert "locked" in data.get("detail", "").lower() or "harmony" in data.get("detail", "").lower(), \
            f"Expected locked/harmony error, got: {data.get('detail')}"
        print(f"PASS: Mine action at locked depth {locked_depth['depth']} returns 400")


class TestRockHoundingCollection:
    """Tests for GET /api/rock-hounding/collection endpoint."""
    
    def test_get_collection_returns_200(self, headers):
        """Collection endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/rock-hounding/collection returns 200")
    
    def test_collection_structure(self, headers):
        """Collection response has correct structure."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=headers)
        data = response.json()
        
        assert "collection" in data, "Response missing 'collection'"
        assert "total_discovered" in data, "Response missing 'total_discovered'"
        assert "total_possible" in data, "Response missing 'total_possible'"
        assert "completion" in data, "Response missing 'completion'"
        assert "by_element" in data, "Response missing 'by_element'"
        
        assert isinstance(data["collection"], list), "Collection should be a list"
        assert isinstance(data["by_element"], dict), "by_element should be a dict"
        print(f"PASS: Collection structure correct - {data['total_discovered']}/{data['total_possible']} discovered ({data['completion']}%)")
    
    def test_collection_grouped_by_element(self, headers):
        """Collection is grouped by element."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=headers)
        data = response.json()
        
        by_element = data.get("by_element", {})
        valid_elements = ["wood", "fire", "earth", "metal", "water"]
        
        for element, specimens in by_element.items():
            assert element in valid_elements, f"Invalid element: {element}"
            assert isinstance(specimens, list), f"Specimens for {element} should be a list"
            for spec in specimens:
                assert spec.get("element") == element, f"Specimen {spec.get('name')} has wrong element"
        print(f"PASS: Collection grouped by element - Elements with specimens: {list(by_element.keys())}")


class TestRockHoundingCatalog:
    """Tests for GET /api/rock-hounding/catalog endpoint."""
    
    def test_get_catalog_returns_200(self, headers):
        """Catalog endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/catalog", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/rock-hounding/catalog returns 200")
    
    def test_catalog_structure(self, headers):
        """Catalog response has correct structure."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/catalog", headers=headers)
        data = response.json()
        
        assert "catalog" in data, "Response missing 'catalog'"
        assert "total" in data, "Response missing 'total'"
        assert "discovered" in data, "Response missing 'discovered'"
        
        catalog = data["catalog"]
        assert isinstance(catalog, list), "Catalog should be a list"
        assert len(catalog) >= 30, f"Catalog should have 30+ specimens, got {len(catalog)}"
        print(f"PASS: Catalog structure correct - {data['discovered']}/{data['total']} discovered")
    
    def test_catalog_discovery_status(self, headers):
        """Catalog shows discovered/undiscovered status."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/catalog", headers=headers)
        data = response.json()
        
        catalog = data["catalog"]
        discovered_count = sum(1 for s in catalog if s.get("discovered"))
        undiscovered_count = sum(1 for s in catalog if not s.get("discovered"))
        
        # Check undiscovered specimens have hidden info
        for spec in catalog:
            if not spec.get("discovered"):
                assert spec.get("name") == "???", f"Undiscovered specimen should have name '???', got {spec.get('name')}"
                assert spec.get("mohs") is None, "Undiscovered specimen should have null mohs"
        
        print(f"PASS: Catalog discovery status - {discovered_count} discovered, {undiscovered_count} undiscovered")


class TestRockHoundingResetMine:
    """Tests for POST /api/rock-hounding/reset-mine endpoint."""
    
    def test_reset_mine_returns_200(self, headers):
        """Reset mine endpoint returns 200."""
        response = requests.post(f"{BASE_URL}/api/rock-hounding/reset-mine", headers=headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: POST /api/rock-hounding/reset-mine returns 200")
    
    def test_reset_mine_creates_new_mine(self, headers):
        """Reset mine creates a new mine session."""
        # Get current mine
        old_mine = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers).json()
        old_seed = old_mine.get("seed")
        
        # Reset
        response = requests.post(f"{BASE_URL}/api/rock-hounding/reset-mine", headers=headers, json={})
        data = response.json()
        
        assert "mine" in data, "Response missing 'mine'"
        assert "message" in data, "Response missing 'message'"
        
        new_mine = data["mine"]
        assert "biome" in new_mine, "New mine missing 'biome'"
        assert "depths" in new_mine, "New mine missing 'depths'"
        assert "energy_info" in new_mine, "New mine missing 'energy_info'"
        
        # Energy should be reset to max
        assert new_mine["energy_info"]["current"] == new_mine["energy_info"]["max"], \
            "New mine should have full energy"
        print(f"PASS: Reset mine creates new mine - {new_mine['biome']['name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Test suite for Latency Pulse features and Encounter endpoints
Tests: World Veins, NPC Rivals, Daily Boss, and related encounter APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_headers():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    pytest.skip("Authentication failed - skipping tests")


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("API health check passed")
    
    def test_auth_login(self, auth_headers):
        """Test authentication works"""
        assert auth_headers is not None
        assert "Authorization" in auth_headers
        print("Auth login passed")


class TestEncounterEndpoints:
    """Test encounter-related endpoints: World Veins, Rivals, Daily Boss"""
    
    def test_get_daily_boss(self, auth_headers):
        """Test /encounters/daily-boss returns today's boss"""
        response = requests.get(f"{BASE_URL}/api/encounters/daily-boss", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Verify boss structure
        assert "id" in data
        assert "name" in data
        assert "description" in data
        assert "mechanic" in data
        assert "time_limit_seconds" in data
        assert "required_actions" in data
        assert "date" in data
        print(f"Daily boss: {data['name']} ({data['mechanic']})")
    
    def test_get_world_veins(self, auth_headers):
        """Test /encounters/world-veins returns collective bosses"""
        response = requests.get(f"{BASE_URL}/api/encounters/world-veins", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # May return empty active_veins if none spawned
        assert "world_veins" in data
        veins = data["world_veins"]
        assert isinstance(veins, list)
        print(f"World veins count: {len(veins)}")
        # If veins exist, verify structure
        if veins:
            vein = veins[0]
            assert "id" in vein
            assert "name" in vein
            assert "required_frequency" in vein
            assert "required_participants" in vein
            print(f"First vein: {vein['name']} ({vein['required_frequency']} Hz)")
    
    def test_get_rival(self, auth_headers):
        """Test /encounters/rival returns NPC rival"""
        response = requests.get(f"{BASE_URL}/api/encounters/rival", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Verify rival structure
        assert "id" in data
        assert "name" in data
        assert "description" in data
        assert "strategy" in data
        assert "speed" in data
        assert "target_rarity" in data
        assert "steal_chance" in data
        assert "active_dialogue" in data
        print(f"Rival: {data['name']} - Strategy: {data['strategy']}")
    
    def test_rival_action_compete(self, auth_headers):
        """Test /encounters/rival-action with compete action"""
        response = requests.post(f"{BASE_URL}/api/encounters/rival-action", 
            json={"action": "compete", "rival_id": "sprinter"},
            headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_wins" in data
        assert "action" in data
        assert "rival_name" in data
        assert "dialogue" in data
        print(f"Rival action result: user_wins={data['user_wins']}")
    
    def test_rival_action_evade(self, auth_headers):
        """Test /encounters/rival-action with evade action"""
        response = requests.post(f"{BASE_URL}/api/encounters/rival-action", 
            json={"action": "evade", "rival_id": "specialist"},
            headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_wins" in data
        assert "action" in data
        assert data["action"] == "evade"
        print(f"Evade action result: user_wins={data['user_wins']}")


class TestRPGEndpoints:
    """Test RPG endpoints that have latency tracking"""
    
    def test_rpg_character(self, auth_headers):
        """Test /rpg/character returns character data"""
        response = requests.get(f"{BASE_URL}/api/rpg/character", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "level" in data
        assert "xp_current" in data
        assert "stats" in data
        print(f"Character level: {data['level']}")
    
    def test_rpg_bosses(self, auth_headers):
        """Test /rpg/bosses returns boss list"""
        response = requests.get(f"{BASE_URL}/api/rpg/bosses", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # API returns list directly or wrapped in "bosses" key
        bosses = data if isinstance(data, list) else data.get("bosses", [])
        assert isinstance(bosses, list)
        assert len(bosses) > 0
        # Verify boss structure
        boss = bosses[0]
        assert "name" in boss
        assert "description" in boss
        assert "color" in boss
        print(f"Found {len(bosses)} bosses, first: {boss['name']}")
    
    def test_rpg_shop(self, auth_headers):
        """Test /rpg/shop returns shop data"""
        response = requests.get(f"{BASE_URL}/api/rpg/shop", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "currencies" in data
        assert "dust_shop" in data
        assert "gem_shop" in data
        assert "conversion_rate" in data
        print(f"Shop currencies: dust={data['currencies'].get('dust', 0)}, gems={data['currencies'].get('gems', 0)}")
    
    def test_rpg_quests_daily(self, auth_headers):
        """Test /rpg/quests/daily returns daily quests"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "quests" in data
        assert "completed_count" in data
        assert "total_count" in data
        print(f"Daily quests: {data['completed_count']}/{data['total_count']} completed")
    
    def test_rpg_inventory(self, auth_headers):
        """Test /rpg/inventory returns inventory with specimens"""
        response = requests.get(f"{BASE_URL}/api/rpg/inventory", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "count" in data
        assert "capacity" in data
        # Check for specimens with state
        items = data["items"]
        specimens = [i for i in items if i.get("category") == "specimen"]
        if specimens:
            spec = specimens[0]
            assert "state" in spec or "rarity" in spec
            print(f"Found {len(specimens)} specimens in inventory")
        print(f"Inventory: {data['count']}/{data['capacity']} items")


class TestRockHoundingEndpoints:
    """Test Rock Hounding endpoints with latency tracking"""
    
    def test_rock_hounding_mine(self, auth_headers):
        """Test /rock-hounding/mine returns mine data"""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "biome" in data
        assert "depths" in data
        assert "energy_info" in data
        print(f"Mine biome: {data['biome'].get('name', 'Unknown')}")
    
    def test_rock_hounding_collection(self, auth_headers):
        """Test /rock-hounding/collection returns collection"""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_discovered" in data
        assert "total_possible" in data
        assert "completion" in data
        print(f"Collection: {data['total_discovered']}/{data['total_possible']} ({data['completion']}%)")


class TestMarketplaceEndpoints:
    """Test Marketplace/Store endpoints with latency tracking"""
    
    def test_marketplace_store(self, auth_headers):
        """Test /marketplace/store returns store data"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "cosmic_credits" in data
        assert "consumables" in data
        assert "cosmetics" in data
        print(f"Cosmic credits: {data['cosmic_credits']}")
    
    def test_marketplace_convert_dust_validation(self, auth_headers):
        """Test /marketplace/convert-dust validates dust amount"""
        # Test with very small amount (should fail or succeed based on balance)
        response = requests.post(f"{BASE_URL}/api/marketplace/convert-dust",
            json={"dust_amount": 150},
            headers=auth_headers)
        # Either succeeds or fails with validation error
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "dust_spent" in data
            assert "credits_earned" in data
            print(f"Converted {data['dust_spent']} dust to {data['credits_earned']} credits")
        else:
            print("Conversion failed (expected if insufficient dust)")


class TestSmartDockEndpoints:
    """Test SmartDock endpoints with latency tracking"""
    
    def test_smartdock_state(self, auth_headers):
        """Test /smartdock/state returns dock state"""
        response = requests.get(f"{BASE_URL}/api/smartdock/state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # May or may not have slotted stone
        assert "slotted" in data or data == {} or "specimen" in data
        print(f"SmartDock state: slotted={data.get('slotted', False)}")
    
    def test_smartdock_eligible(self, auth_headers):
        """Test /smartdock/eligible returns eligible stones"""
        response = requests.get(f"{BASE_URL}/api/smartdock/eligible", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "stones" in data
        print(f"Eligible stones for SmartDock: {len(data['stones'])}")


class TestEvolutionEndpoints:
    """Test Evolution Lab endpoints with latency tracking"""
    
    def test_evolution_collection(self, auth_headers):
        """Test /evolution/collection returns evolution data"""
        response = requests.get(f"{BASE_URL}/api/evolution/collection", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "collection" in data
        assert "stage_counts" in data
        assert "total_vc" in data
        print(f"Evolution collection: {len(data['collection'])} specimens, total VC: {data['total_vc']}")


class TestRefinementEndpoints:
    """Test Refinement Lab endpoints with latency tracking"""
    
    def test_refinement_tools(self, auth_headers):
        """Test /refinement/tools returns available tools"""
        response = requests.get(f"{BASE_URL}/api/refinement/tools", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        tools = data["tools"]
        assert len(tools) > 0
        print(f"Refinement tools: {[t['name'] for t in tools]}")
    
    def test_refinement_tumbler(self, auth_headers):
        """Test /refinement/tumbler returns tumbler state"""
        response = requests.get(f"{BASE_URL}/api/refinement/tumbler", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "slots_used" in data
        assert "slots_max" in data
        print(f"Tumbler: {data['slots_used']}/{data['slots_max']} slots used")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

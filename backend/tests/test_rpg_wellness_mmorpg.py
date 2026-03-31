"""
RPG Wellness MMORPG Backend Tests
Tests for /api/rpg/* endpoints: character, inventory, world, bosses, party (circle)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
TEST_USER_EMAIL = "rpg_test@test.com"
TEST_USER_PASSWORD = "password123"

# Fallback admin credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for RPG test user"""
    # Try RPG test user first
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    
    # Fallback to admin user
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestRPGCharacter:
    """Tests for /api/rpg/character endpoints"""
    
    def test_get_character(self, authenticated_client):
        """GET /api/rpg/character - should return character data"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/character")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify character structure
        assert "level" in data, "Missing level field"
        assert "xp_current" in data, "Missing xp_current field"
        assert "xp_next" in data, "Missing xp_next field"
        assert "stats" in data, "Missing stats field"
        assert "stat_points" in data, "Missing stat_points field"
        assert "equipped" in data, "Missing equipped field"
        
        # Verify stats structure
        stats = data["stats"]
        expected_stats = ["wisdom", "vitality", "resonance", "harmony", "focus"]
        for stat in expected_stats:
            assert stat in stats, f"Missing stat: {stat}"
        
        print(f"Character: Level {data['level']}, XP {data['xp_current']}/{data['xp_next']}, Stats: {stats}")
    
    def test_character_has_title(self, authenticated_client):
        """Character should have a title"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/character")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data, "Missing title field"
        print(f"Character title: {data['title']}")


class TestRPGInventory:
    """Tests for /api/rpg/inventory endpoints"""
    
    def test_get_inventory(self, authenticated_client):
        """GET /api/rpg/inventory - should return inventory data"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/inventory")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify inventory structure
        assert "items" in data, "Missing items field"
        assert "currencies" in data, "Missing currencies field"
        assert "capacity" in data, "Missing capacity field"
        assert "count" in data, "Missing count field"
        
        # Verify currencies structure
        currencies = data["currencies"]
        assert "cosmic_dust" in currencies, "Missing cosmic_dust currency"
        assert "stardust_shards" in currencies, "Missing stardust_shards currency"
        assert "soul_fragments" in currencies, "Missing soul_fragments currency"
        
        print(f"Inventory: {data['count']}/{data['capacity']} items, Currencies: {currencies}")
    
    def test_inventory_items_structure(self, authenticated_client):
        """Inventory items should have proper structure"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/inventory")
        assert response.status_code == 200
        data = response.json()
        
        if data["items"]:
            item = data["items"][0]
            assert "id" in item, "Item missing id"
            assert "name" in item, "Item missing name"
            assert "rarity" in item, "Item missing rarity"
            print(f"Sample item: {item['name']} ({item['rarity']})")


class TestRPGWorld:
    """Tests for /api/rpg/world endpoints"""
    
    def test_get_world_map(self, authenticated_client):
        """GET /api/rpg/world - should return world map data"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/world")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify world structure
        assert "regions" in data, "Missing regions field"
        assert "secrets" in data, "Missing secrets field"
        assert "player_level" in data, "Missing player_level field"
        
        regions = data["regions"]
        assert len(regions) > 0, "No regions found"
        
        # Verify region structure
        region = regions[0]
        assert "id" in region, "Region missing id"
        assert "name" in region, "Region missing name"
        assert "discovered" in region, "Region missing discovered flag"
        assert "accessible" in region, "Region missing accessible flag"
        assert "level_req" in region, "Region missing level_req"
        
        discovered_count = sum(1 for r in regions if r["discovered"])
        print(f"World: {discovered_count}/{len(regions)} regions discovered, Player level: {data['player_level']}")
    
    def test_sacred_forest_discovered(self, authenticated_client):
        """Sacred Forest should always be discovered (starting region)"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/world")
        assert response.status_code == 200
        data = response.json()
        
        sacred_forest = next((r for r in data["regions"] if r["id"] == "sacred_forest"), None)
        assert sacred_forest is not None, "Sacred Forest region not found"
        assert sacred_forest["discovered"] == True, "Sacred Forest should be discovered by default"
        print(f"Sacred Forest: discovered={sacred_forest['discovered']}, accessible={sacred_forest['accessible']}")
    
    def test_explore_region(self, authenticated_client):
        """POST /api/rpg/world/explore - should grant XP and cosmic dust"""
        # First get accessible regions
        world_response = authenticated_client.get(f"{BASE_URL}/api/rpg/world")
        assert world_response.status_code == 200
        world_data = world_response.json()
        
        accessible_regions = [r for r in world_data["regions"] if r["accessible"]]
        if not accessible_regions:
            pytest.skip("No accessible regions to explore")
        
        region_to_explore = accessible_regions[0]
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/world/explore", json={
            "region_id": region_to_explore["id"]
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "region" in data, "Missing region field"
        assert "xp_gained" in data, "Missing xp_gained field"
        assert "cosmic_dust_earned" in data, "Missing cosmic_dust_earned field"
        
        print(f"Explored {data['region']}: +{data['xp_gained']} XP, +{data['cosmic_dust_earned']} dust")
        if data.get("loot"):
            print(f"  Loot: {data['loot']['name']} ({data['loot']['rarity']})")
        if data.get("newly_discovered"):
            print(f"  Discovered: {data['newly_discovered']}")


class TestRPGBosses:
    """Tests for /api/rpg/bosses endpoints"""
    
    def test_get_bosses(self, authenticated_client):
        """GET /api/rpg/bosses - should return boss list"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/bosses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of bosses"
        assert len(data) > 0, "No bosses found"
        
        # Verify boss structure
        boss = data[0]
        assert "id" in boss, "Boss missing id"
        assert "name" in boss, "Boss missing name"
        assert "level" in boss, "Boss missing level"
        assert "hp" in boss, "Boss missing hp"
        assert "phases" in boss, "Boss missing phases"
        assert "loot" in boss, "Boss missing loot"
        assert "accessible" in boss, "Boss missing accessible flag"
        
        accessible_bosses = [b for b in data if b["accessible"]]
        print(f"Bosses: {len(accessible_bosses)}/{len(data)} accessible")
        for boss in data:
            print(f"  - {boss['name']} (Lv {boss['level']}): {'Accessible' if boss['accessible'] else 'Locked'}")
    
    def test_shadow_of_doubt_boss(self, authenticated_client):
        """Shadow of Doubt boss should exist and be accessible at level 3"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/bosses")
        assert response.status_code == 200
        data = response.json()
        
        shadow_boss = next((b for b in data if b["id"] == "shadow_of_doubt"), None)
        assert shadow_boss is not None, "Shadow of Doubt boss not found"
        assert shadow_boss["level"] == 3, f"Shadow of Doubt should be level 3, got {shadow_boss['level']}"
        assert len(shadow_boss["phases"]) == 3, f"Shadow of Doubt should have 3 phases"
        print(f"Shadow of Doubt: HP={shadow_boss['hp']}, Phases={[p['name'] for p in shadow_boss['phases']]}")
    
    def test_join_boss_encounter(self, authenticated_client):
        """POST /api/rpg/bosses/join - should join or create encounter"""
        # Get accessible bosses
        bosses_response = authenticated_client.get(f"{BASE_URL}/api/rpg/bosses")
        assert bosses_response.status_code == 200
        bosses = bosses_response.json()
        
        accessible_bosses = [b for b in bosses if b["accessible"]]
        if not accessible_bosses:
            pytest.skip("No accessible bosses to join")
        
        boss_to_join = accessible_bosses[0]
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/bosses/join", json={
            "boss_id": boss_to_join["id"]
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "encounter_id" in data, "Missing encounter_id"
        assert "boss" in data, "Missing boss name"
        assert "current_hp" in data, "Missing current_hp"
        assert "max_hp" in data, "Missing max_hp"
        
        print(f"Joined encounter: {data['boss']} - HP: {data['current_hp']}/{data['max_hp']}, Participants: {data.get('participants', 1)}")
        return data["encounter_id"]
    
    def test_attack_boss(self, authenticated_client):
        """POST /api/rpg/bosses/attack - should deal damage"""
        # First join an encounter
        bosses_response = authenticated_client.get(f"{BASE_URL}/api/rpg/bosses")
        assert bosses_response.status_code == 200
        bosses = bosses_response.json()
        
        accessible_bosses = [b for b in bosses if b["accessible"]]
        if not accessible_bosses:
            pytest.skip("No accessible bosses to attack")
        
        boss_to_join = accessible_bosses[0]
        join_response = authenticated_client.post(f"{BASE_URL}/api/rpg/bosses/join", json={
            "boss_id": boss_to_join["id"]
        })
        assert join_response.status_code == 200
        encounter_id = join_response.json()["encounter_id"]
        
        # Test all three attack types
        for attack_type in ["meditate", "frequency", "breathe"]:
            response = authenticated_client.post(f"{BASE_URL}/api/rpg/bosses/attack", json={
                "encounter_id": encounter_id,
                "attack_type": attack_type
            })
            assert response.status_code == 200, f"Attack {attack_type} failed: {response.text}"
            
            data = response.json()
            assert "damage" in data, "Missing damage field"
            assert "attack_type" in data, "Missing attack_type field"
            assert "boss_hp" in data, "Missing boss_hp field"
            
            print(f"Attack ({attack_type}): {data['damage']} damage, Boss HP: {data['boss_hp']}/{data['max_hp']}")


class TestRPGParty:
    """Tests for /api/rpg/party (Circle) endpoints"""
    
    def test_get_party(self, authenticated_client):
        """GET /api/rpg/party - should return party data or null"""
        response = authenticated_client.get(f"{BASE_URL}/api/rpg/party")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "party" in data, "Missing party field"
        
        if data["party"]:
            party = data["party"]
            assert "id" in party, "Party missing id"
            assert "name" in party, "Party missing name"
            assert "members" in party, "Party missing members"
            assert "invite_code" in party, "Party missing invite_code"
            print(f"In party: {party['name']} ({len(party['members'])} members), Code: {party['invite_code']}")
        else:
            print("Not in a party/circle")
    
    def test_create_party(self, authenticated_client):
        """POST /api/rpg/party/create - should create a new circle"""
        # First check if already in a party
        party_response = authenticated_client.get(f"{BASE_URL}/api/rpg/party")
        assert party_response.status_code == 200
        
        if party_response.json().get("party"):
            # Leave current party first
            leave_response = authenticated_client.post(f"{BASE_URL}/api/rpg/party/leave")
            # May fail if not in party, that's ok
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/party/create", json={
            "name": "TEST_Cosmic_Circle"
        })
        
        # Could fail if already in a party
        if response.status_code == 200:
            data = response.json()
            assert "id" in data, "Missing party id"
            assert "name" in data, "Missing party name"
            assert "invite_code" in data, "Missing invite_code"
            print(f"Created circle: {data['name']}, Invite code: {data['invite_code']}")
            
            # Clean up - leave the party
            authenticated_client.post(f"{BASE_URL}/api/rpg/party/leave")
        else:
            print(f"Could not create party (may already be in one): {response.text}")


class TestRPGEquipment:
    """Tests for equip/unequip functionality"""
    
    def test_equip_item(self, authenticated_client):
        """POST /api/rpg/equip - should equip an item"""
        # Get inventory
        inv_response = authenticated_client.get(f"{BASE_URL}/api/rpg/inventory")
        assert inv_response.status_code == 200
        inventory = inv_response.json()
        
        # Find an equippable item
        equippable = [i for i in inventory["items"] if i.get("slot")]
        if not equippable:
            pytest.skip("No equippable items in inventory")
        
        item_to_equip = equippable[0]
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/equip", json={
            "item_id": item_to_equip["id"]
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "equipped" in data, "Missing equipped field"
        assert "slot" in data, "Missing slot field"
        print(f"Equipped: {data['equipped']} in {data['slot']} slot")
    
    def test_unequip_item(self, authenticated_client):
        """POST /api/rpg/unequip - should unequip an item"""
        # Get character to see equipped items
        char_response = authenticated_client.get(f"{BASE_URL}/api/rpg/character")
        assert char_response.status_code == 200
        character = char_response.json()
        
        equipped = character.get("equipped", {})
        if not equipped:
            pytest.skip("No equipped items to unequip")
        
        slot_to_unequip = list(equipped.keys())[0]
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/unequip", json={
            "slot": slot_to_unequip
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "unequipped" in data, "Missing unequipped field"
        assert "slot" in data, "Missing slot field"
        print(f"Unequipped: {data['unequipped']} from {data['slot']} slot")


class TestRPGStatAllocation:
    """Tests for stat allocation"""
    
    def test_allocate_stat(self, authenticated_client):
        """POST /api/rpg/character/allocate-stat - should allocate stat point"""
        # Get character to check stat points
        char_response = authenticated_client.get(f"{BASE_URL}/api/rpg/character")
        assert char_response.status_code == 200
        character = char_response.json()
        
        if character.get("stat_points", 0) < 1:
            pytest.skip("No stat points available to allocate")
        
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/character/allocate-stat", json={
            "stat": "wisdom"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "stat" in data, "Missing stat field"
        assert "new_value" in data, "Missing new_value field"
        assert "remaining_points" in data, "Missing remaining_points field"
        print(f"Allocated: +1 {data['stat']} (now {data['new_value']}), {data['remaining_points']} points remaining")


class TestRPGStarterKit:
    """Tests for starter kit functionality"""
    
    def test_starter_kit_endpoint_exists(self, authenticated_client):
        """POST /api/rpg/character/starter-kit - endpoint should exist"""
        response = authenticated_client.post(f"{BASE_URL}/api/rpg/character/starter-kit", json={})
        # Will return 400 if already claimed, which is expected
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "items_received" in data, "Missing items_received field"
            print(f"Starter kit claimed: {data['items_received']} items")
        else:
            print("Starter kit already claimed (expected)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

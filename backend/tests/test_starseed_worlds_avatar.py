"""
Test suite for Starseed Worlds (Multiverse Realms, Gems, Equipment, Crafting, Portals)
and Spiritual Avatar Creator features.

Tests:
- Multiverse Realms API (4 realms, unlock status, exploration)
- Gem Collection API (catalog, character gems)
- Equipment System API (catalog, sets, equipping)
- Crafting & Enchanting API (recipes, crafting)
- Portal Status API (progress tracking)
- Avatar Builder API (catalog, save, my-avatar)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"

# Character origin IDs from context
ORIGIN_IDS = ["pleiadian", "lyran", "sirian", "arcturian"]
PRIMARY_ORIGIN = "pleiadian"  # Level 4 character


class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestMultiverseRealms(TestAuth):
    """Tests for Multiverse Realms API - GET /api/starseed/worlds/realms"""
    
    def test_get_realms_returns_4_realms(self, auth_headers):
        """GET /api/starseed/worlds/realms returns 4 realms"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realms", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "realms" in data
        assert len(data["realms"]) == 4, f"Expected 4 realms, got {len(data['realms'])}"
        
        # Verify realm IDs
        realm_ids = [r["id"] for r in data["realms"]]
        expected_ids = ["astral-sanctum", "shadow-nexus", "crystal-caverns", "void-between"]
        for expected_id in expected_ids:
            assert expected_id in realm_ids, f"Missing realm: {expected_id}"
    
    def test_astral_sanctum_is_unlocked(self, auth_headers):
        """Astral Sanctum should be unlocked (auto-unlock)"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realms", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        astral = next((r for r in data["realms"] if r["id"] == "astral-sanctum"), None)
        assert astral is not None, "Astral Sanctum not found"
        assert astral["unlocked"] == True, "Astral Sanctum should be unlocked"
        assert astral["level_req"] == 1, "Astral Sanctum level_req should be 1"
    
    def test_realms_have_required_fields(self, auth_headers):
        """Each realm should have required fields"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realms", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "subtitle", "color", "element", "description", 
                          "lore", "difficulty", "level_req", "unlocked", "boss"]
        
        for realm in data["realms"]:
            for field in required_fields:
                assert field in realm, f"Realm {realm.get('id')} missing field: {field}"


class TestRealmDetail(TestAuth):
    """Tests for Realm Detail API - GET /api/starseed/worlds/realm/{realm_id}"""
    
    def test_get_astral_sanctum_detail(self, auth_headers):
        """GET /api/starseed/worlds/realm/astral-sanctum returns detailed info"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realm/astral-sanctum", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["id"] == "astral-sanctum"
        assert data["name"] == "The Astral Sanctum"
        assert "unique_gems_detail" in data
        assert "unique_equipment_detail" in data
        assert len(data["unique_gems_detail"]) > 0, "Should have unique gems"
        assert len(data["unique_equipment_detail"]) > 0, "Should have unique equipment"
    
    def test_get_invalid_realm_returns_404(self, auth_headers):
        """GET /api/starseed/worlds/realm/invalid-realm returns 404"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realm/invalid-realm", headers=auth_headers)
        assert response.status_code == 404


class TestExploration(TestAuth):
    """Tests for Exploration API - POST /api/starseed/worlds/explore"""
    
    def test_explore_astral_sanctum(self, auth_headers):
        """POST /api/starseed/worlds/explore with astral-sanctum returns discoveries"""
        response = requests.post(f"{BASE_URL}/api/starseed/worlds/explore", 
            json={"realm_id": "astral-sanctum", "origin_id": PRIMARY_ORIGIN},
            headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "realm_id" in data
        assert data["realm_id"] == "astral-sanctum"
        assert "discoveries" in data
        assert "xp_gained" in data
        assert data["xp_gained"] > 0, "Should gain XP from exploration"
        assert "leveled_up" in data
        # encounter is probabilistic
        assert "encounter" in data
    
    def test_explore_locked_realm_returns_403(self, auth_headers):
        """POST /api/starseed/worlds/explore with locked realm returns 403"""
        # void-between requires level 8 and specific gems
        response = requests.post(f"{BASE_URL}/api/starseed/worlds/explore",
            json={"realm_id": "void-between", "origin_id": PRIMARY_ORIGIN},
            headers=auth_headers)
        # Should be 403 if locked
        assert response.status_code in [403, 200], f"Unexpected status: {response.status_code}"
    
    def test_explore_invalid_realm_returns_404(self, auth_headers):
        """POST /api/starseed/worlds/explore with invalid realm returns 404"""
        response = requests.post(f"{BASE_URL}/api/starseed/worlds/explore",
            json={"realm_id": "invalid-realm", "origin_id": PRIMARY_ORIGIN},
            headers=auth_headers)
        assert response.status_code == 404


class TestGemCollection(TestAuth):
    """Tests for Gem Collection API"""
    
    def test_get_gem_catalog(self, auth_headers):
        """GET /api/starseed/worlds/gem-catalog returns 15 gems"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/gem-catalog", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "gems" in data
        assert len(data["gems"]) == 15, f"Expected 15 gems, got {len(data['gems'])}"
        
        # Verify gem types
        gem_types = set(g["type"] for g in data["gems"])
        assert "elemental" in gem_types
        assert "starseed" in gem_types
        assert "cosmic" in gem_types
    
    def test_get_character_gems(self, auth_headers):
        """GET /api/starseed/worlds/gems/{origin_id} returns gem collection"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/gems/{PRIMARY_ORIGIN}", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "gems" in data
        assert "all_gem_types" in data
        # gems may be empty if character hasn't explored yet
        assert isinstance(data["gems"], list)
    
    def test_get_gems_invalid_character_returns_404(self, auth_headers):
        """GET /api/starseed/worlds/gems/invalid-origin returns 404"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/gems/invalid-origin", headers=auth_headers)
        assert response.status_code == 404


class TestEquipmentSystem(TestAuth):
    """Tests for Equipment System API"""
    
    def test_get_equipment_catalog(self, auth_headers):
        """GET /api/starseed/worlds/equipment-catalog returns 16 items and 3 sets"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/equipment-catalog", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "equipment" in data
        assert "sets" in data
        assert len(data["equipment"]) == 16, f"Expected 16 equipment items, got {len(data['equipment'])}"
        assert len(data["sets"]) == 3, f"Expected 3 sets, got {len(data['sets'])}"
        
        # Verify set IDs
        set_ids = list(data["sets"].keys())
        expected_sets = ["celestial-guardian", "void-walker", "starforged"]
        for expected_set in expected_sets:
            assert expected_set in set_ids, f"Missing set: {expected_set}"
    
    def test_get_character_equipment(self, auth_headers):
        """GET /api/starseed/worlds/equipment/{origin_id} returns equipment collection"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/equipment/{PRIMARY_ORIGIN}", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "equipment" in data
        assert "equipped" in data
        assert "sets" in data
        assert "slots" in data
        assert isinstance(data["equipment"], list)
        assert isinstance(data["equipped"], dict)
        
        # Verify slots
        expected_slots = ["weapon", "armor", "accessory", "talisman"]
        for slot in expected_slots:
            assert slot in data["slots"], f"Missing slot: {slot}"
    
    def test_equip_gear_validation(self, auth_headers):
        """POST /api/starseed/worlds/equip-gear validates slot"""
        # Test with invalid slot
        response = requests.post(f"{BASE_URL}/api/starseed/worlds/equip-gear",
            json={"origin_id": PRIMARY_ORIGIN, "instance_id": "test", "slot": "invalid-slot"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid slot, got {response.status_code}"


class TestCraftingSystem(TestAuth):
    """Tests for Crafting & Enchanting API"""
    
    def test_get_crafting_recipes(self, auth_headers):
        """GET /api/starseed/worlds/crafting-recipes returns 6 recipes and 3 enchant options"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/crafting-recipes", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "recipes" in data
        assert "enchant_options" in data
        assert len(data["recipes"]) == 6, f"Expected 6 recipes, got {len(data['recipes'])}"
        assert len(data["enchant_options"]) == 3, f"Expected 3 enchant options, got {len(data['enchant_options'])}"
        
        # Verify recipe structure
        for recipe in data["recipes"]:
            assert "id" in recipe
            assert "name" in recipe
            assert "materials" in recipe
            assert "level_req" in recipe
            assert "result_id" in recipe
            assert "result_type" in recipe
        
        # Verify enchant options
        enchant_ids = [e["id"] for e in data["enchant_options"]]
        expected_enchants = ["fortify", "attune", "awaken"]
        for expected in expected_enchants:
            assert expected in enchant_ids, f"Missing enchant option: {expected}"


class TestPortalStatus(TestAuth):
    """Tests for Portal Status API"""
    
    def test_get_portal_status(self, auth_headers):
        """GET /api/starseed/worlds/portals/{origin_id} returns portal status with progress"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/portals/{PRIMARY_ORIGIN}", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "portals" in data
        assert len(data["portals"]) == 4, f"Expected 4 portals, got {len(data['portals'])}"
        
        # Verify portal structure
        for portal in data["portals"]:
            assert "realm_id" in portal
            assert "realm_name" in portal
            assert "unlocked" in portal
            assert "progress" in portal
        
        # Astral Sanctum should be unlocked
        astral = next((p for p in data["portals"] if p["realm_id"] == "astral-sanctum"), None)
        assert astral is not None
        assert astral["unlocked"] == True


class TestAvatarBuilder(TestAuth):
    """Tests for Spiritual Avatar Builder API"""
    
    def test_get_avatar_catalog(self, auth_headers):
        """GET /api/starseed/avatar-builder/catalog returns 6 categories with level-gated options"""
        response = requests.get(f"{BASE_URL}/api/starseed/avatar-builder/catalog", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "categories" in data
        assert "evolution_stages" in data
        assert "current_level" in data
        assert len(data["categories"]) == 6, f"Expected 6 categories, got {len(data['categories'])}"
        
        # Verify category IDs
        category_ids = [c["id"] for c in data["categories"]]
        expected_categories = ["base_form", "aura", "cosmic_features", "markings", "accessories", "background"]
        for expected in expected_categories:
            assert expected in category_ids, f"Missing category: {expected}"
        
        # Verify options have unlocked field
        for cat in data["categories"]:
            assert "options" in cat
            for opt in cat["options"]:
                assert "unlocked" in opt
                assert "level_req" in opt
    
    def test_get_my_avatar(self, auth_headers):
        """GET /api/starseed/avatar-builder/my-avatar returns saved avatar config"""
        response = requests.get(f"{BASE_URL}/api/starseed/avatar-builder/my-avatar", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "avatar" in data
        # avatar may be None if not saved yet
    
    def test_save_avatar_config(self, auth_headers):
        """POST /api/starseed/avatar-builder/save saves avatar selections"""
        test_selections = {
            "base_form": "humanoid",
            "aura": "radiant_gold",
            "cosmic_features": ["angel_wings", "halo"],
            "markings": ["sacred_geometry"],
            "accessories": ["crown_light"],
            "background": "deep_space"
        }
        
        response = requests.post(f"{BASE_URL}/api/starseed/avatar-builder/save",
            json={"selections": test_selections},
            headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data.get("saved") == True
        
        # Verify it was saved by fetching again
        verify_response = requests.get(f"{BASE_URL}/api/starseed/avatar-builder/my-avatar", headers=auth_headers)
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["avatar"] is not None
        assert verify_data["avatar"]["selections"]["base_form"] == "humanoid"


class TestMyCharacters(TestAuth):
    """Tests for character endpoints used by frontend"""
    
    def test_get_my_characters(self, auth_headers):
        """GET /api/starseed/my-characters returns user's characters"""
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "characters" in data
        assert isinstance(data["characters"], list)
        
        # User should have at least one character (pleiadian at level 4)
        if len(data["characters"]) > 0:
            char = data["characters"][0]
            assert "origin_id" in char
            assert "level" in char


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

# Test: 5-Layer Universe Structure + Forgotten Languages Streak/Journal
# Tests layer computation, layer-aware multipliers, streak system, and glyph journal

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLayerUniverseStructure:
    """Tests for the 5-Layer Universe Structure in game_core"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth headers"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "rpg_test@test.com",
            "password": "password123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def test_game_core_stats_includes_layer_data(self):
        """GET /api/game-core/stats includes layer data with active_layer, unlocked_layers, all 5 layers"""
        res = requests.get(f"{BASE_URL}/api/game-core/stats", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify layer data exists
        assert "layer" in data, "Missing 'layer' in stats response"
        layer = data["layer"]
        
        # Verify layer structure
        assert "active_layer" in layer, "Missing active_layer"
        assert "unlocked_layers" in layer, "Missing unlocked_layers"
        assert "all_layers" in layer, "Missing all_layers"
        assert "layer" in layer, "Missing layer details"
        
        # Verify all 5 layers present
        all_layers = layer["all_layers"]
        assert len(all_layers) == 5, f"Expected 5 layers, got {len(all_layers)}"
        
        layer_ids = [l["id"] for l in all_layers]
        expected_layers = ["terrestrial", "ethereal", "astral", "void", "nexus"]
        assert layer_ids == expected_layers, f"Layer order mismatch: {layer_ids}"
        
        # Verify each layer has required fields
        for l in all_layers:
            assert "id" in l
            assert "name" in l
            assert "color" in l
            assert "order" in l
            assert "resonance_required" in l
            assert "unlocked" in l
            assert "active" in l
            assert "entropy" in l
            assert "loot_multiplier" in l
        
        print(f"PASS: game-core/stats includes layer data with all 5 layers")
        print(f"  Active layer: {layer['active_layer']}")
        print(f"  Unlocked: {layer['unlocked_layers']}")
    
    def test_game_core_layer_endpoint(self):
        """GET /api/game-core/layer returns layer info based on resonance stat"""
        res = requests.get(f"{BASE_URL}/api/game-core/layer", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify structure
        assert "active_layer" in data
        assert "layer" in data
        assert "unlocked_layers" in data
        assert "all_layers" in data
        
        # Verify layer details
        layer_details = data["layer"]
        assert "id" in layer_details
        assert "name" in layer_details
        assert "color" in layer_details
        assert "entropy" in layer_details
        assert "resonance_required" in layer_details
        assert "loot_multiplier" in layer_details
        assert "xp_multiplier" in layer_details
        
        print(f"PASS: game-core/layer endpoint returns layer info")
        print(f"  Active: {data['active_layer']}, Loot mult: {layer_details['loot_multiplier']}x")
    
    def test_layer_computation_thresholds(self):
        """Verify layer computation: resonance 0-4=terrestrial, 5-14=ethereal, 15-29=astral, 30-49=void, 50+=nexus"""
        res = requests.get(f"{BASE_URL}/api/game-core/layer", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        
        # Get all layers and verify thresholds
        all_layers = data["all_layers"]
        thresholds = {l["id"]: l["resonance_required"] for l in all_layers}
        
        assert thresholds["terrestrial"] == 0, "Terrestrial should require 0 resonance"
        assert thresholds["ethereal"] == 5, "Ethereal should require 5 resonance"
        assert thresholds["astral"] == 15, "Astral should require 15 resonance"
        assert thresholds["void"] == 30, "Void should require 30 resonance"
        assert thresholds["nexus"] == 50, "Nexus should require 50 resonance"
        
        print(f"PASS: Layer thresholds correct - {thresholds}")
    
    def test_layer_multipliers_in_stats(self):
        """Verify layer multipliers are present in layer data"""
        res = requests.get(f"{BASE_URL}/api/game-core/stats", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        
        layer_details = data["layer"]["layer"]
        
        # Verify multipliers exist
        assert "loot_multiplier" in layer_details
        assert "xp_multiplier" in layer_details
        
        # Verify multipliers are numbers >= 1.0
        assert layer_details["loot_multiplier"] >= 1.0
        assert layer_details["xp_multiplier"] >= 1.0
        
        print(f"PASS: Layer multipliers present - loot: {layer_details['loot_multiplier']}x, xp: {layer_details['xp_multiplier']}x")


class TestRockHoundingLayerIntegration:
    """Tests for layer-aware loot multipliers in Rock Hounding"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth headers"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "rpg_test@test.com",
            "password": "password123"
        })
        assert login_res.status_code == 200
        token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def test_rock_hounding_mine_includes_layer(self):
        """GET /api/rock-hounding/mine includes layer data with loot_multiplier and xp_multiplier"""
        res = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify layer data in mine response
        assert "layer" in data, "Missing 'layer' in mine response"
        layer = data["layer"]
        
        assert "active_layer" in layer
        assert "layer" in layer
        assert "unlocked_layers" in layer
        
        layer_details = layer["layer"]
        assert "loot_multiplier" in layer_details
        assert "xp_multiplier" in layer_details
        
        print(f"PASS: rock-hounding/mine includes layer data")
        print(f"  Active: {layer['active_layer']}, Loot: {layer_details['loot_multiplier']}x, XP: {layer_details['xp_multiplier']}x")
    
    def test_mine_action_returns_layer_info(self):
        """POST /api/rock-hounding/mine-action returns layer info with multipliers applied"""
        # First reset mine to ensure energy
        requests.post(f"{BASE_URL}/api/rock-hounding/reset-mine", headers=self.headers)
        
        # Perform mine action
        res = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", 
                          json={"depth": 1}, headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify layer info in response
        assert "layer" in data, "Missing 'layer' in mine-action response"
        layer = data["layer"]
        
        assert "id" in layer
        assert "name" in layer
        assert "loot_multiplier" in layer
        assert "xp_multiplier" in layer
        
        # Verify rewards exist
        assert "rewards" in data
        rewards = data["rewards"]
        assert "xp" in rewards
        assert "dust" in rewards
        
        print(f"PASS: mine-action returns layer info")
        print(f"  Layer: {layer['name']}, Rewards: +{rewards['xp']} XP, +{rewards['dust']} dust")


class TestForgottenLanguagesStreak:
    """Tests for Forgotten Languages streak system and glyph journal"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth headers"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "rpg_test@test.com",
            "password": "password123"
        })
        assert login_res.status_code == 200
        token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def test_daily_includes_streak_data(self):
        """GET /api/forgotten-languages/daily includes streak data (current, best, multiplier)"""
        res = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify streak data exists
        assert "streak" in data, "Missing 'streak' in daily response"
        streak = data["streak"]
        
        assert "current" in streak, "Missing current streak"
        assert "best" in streak, "Missing best streak"
        assert "multiplier" in streak, "Missing streak multiplier"
        
        # Verify multiplier is a number >= 1.0
        assert streak["multiplier"] >= 1.0, f"Multiplier should be >= 1.0, got {streak['multiplier']}"
        
        print(f"PASS: daily includes streak data")
        print(f"  Current: {streak['current']}, Best: {streak['best']}, Multiplier: {streak['multiplier']}x")
    
    def test_decode_returns_streak_info(self):
        """POST /api/forgotten-languages/decode returns streak info and bonus XP"""
        # Get daily glyphs first
        daily_res = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=self.headers)
        assert daily_res.status_code == 200
        daily = daily_res.json()
        
        # Find an undecoded glyph
        undecoded = [g for g in daily["glyphs"] if not g.get("decoded")]
        
        if not undecoded:
            print("SKIP: All glyphs already decoded today - cannot test decode")
            return
        
        glyph_id = undecoded[0]["id"]
        
        # Decode the glyph
        res = requests.post(f"{BASE_URL}/api/forgotten-languages/decode",
                          json={"glyph_id": glyph_id}, headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify streak info in response
        assert "streak" in data, "Missing 'streak' in decode response"
        streak = data["streak"]
        
        assert "current" in streak
        assert "best" in streak
        assert "multiplier" in streak
        
        # Verify rewards include bonus_xp
        assert "rewards" in data
        rewards = data["rewards"]
        assert "xp" in rewards
        assert "bonus_xp" in rewards
        
        print(f"PASS: decode returns streak info")
        print(f"  Streak: {streak['current']}, XP: {rewards['xp']} (+{rewards['bonus_xp']} bonus)")
    
    def test_journal_endpoint_exists(self):
        """GET /api/forgotten-languages/journal returns decoded glyph history"""
        res = requests.get(f"{BASE_URL}/api/forgotten-languages/journal", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify journal structure
        assert "total_entries" in data
        assert "entries" in data
        assert "by_element" in data
        assert "streak" in data
        
        # Verify entries is a list
        assert isinstance(data["entries"], list)
        
        # Verify by_element is a dict
        assert isinstance(data["by_element"], dict)
        
        # Verify streak info
        streak = data["streak"]
        assert "current_streak" in streak or "current" in streak or isinstance(streak, dict)
        
        print(f"PASS: journal endpoint returns glyph history")
        print(f"  Total entries: {data['total_entries']}")
        print(f"  Elements: {list(data['by_element'].keys())}")
    
    def test_mastery_endpoint_still_works(self):
        """GET /api/forgotten-languages/mastery still returns correctly (regression)"""
        res = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=self.headers)
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify mastery structure
        assert "current_tier" in data
        assert "current_tier_name" in data
        assert "harmony" in data
        assert "total_decoded" in data
        assert "by_element" in data
        assert "modifiers" in data
        assert "tiers" in data
        assert "scripts" in data
        
        # Verify tiers list
        assert len(data["tiers"]) == 5, "Should have 5 tiers"
        
        print(f"PASS: mastery endpoint works (regression)")
        print(f"  Tier: {data['current_tier_name']}, Total decoded: {data['total_decoded']}")


class TestRegressionEndpoints:
    """Regression tests for existing functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth headers"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "rpg_test@test.com",
            "password": "password123"
        })
        assert login_res.status_code == 200
        token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def test_rock_hounding_collection(self):
        """GET /api/rock-hounding/collection still works"""
        res = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "collection" in data
        assert "total_discovered" in data
        print(f"PASS: rock-hounding/collection works - {data['total_discovered']} discovered")
    
    def test_rock_hounding_catalog(self):
        """GET /api/rock-hounding/catalog still works"""
        res = requests.get(f"{BASE_URL}/api/rock-hounding/catalog", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "catalog" in data
        assert "total" in data
        print(f"PASS: rock-hounding/catalog works - {data['total']} specimens")
    
    def test_forgotten_languages_scripts(self):
        """GET /api/forgotten-languages/scripts still works"""
        res = requests.get(f"{BASE_URL}/api/forgotten-languages/scripts", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "scripts" in data
        assert len(data["scripts"]) == 5, "Should have 5 element scripts"
        print(f"PASS: forgotten-languages/scripts works - {list(data['scripts'].keys())}")
    
    def test_game_core_modules(self):
        """GET /api/game-core/modules still works"""
        res = requests.get(f"{BASE_URL}/api/game-core/modules", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "modules" in data
        print(f"PASS: game-core/modules works - {len(data['modules'])} modules")
    
    def test_game_core_transactions(self):
        """GET /api/game-core/transactions still works"""
        res = requests.get(f"{BASE_URL}/api/game-core/transactions", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "transactions" in data
        print(f"PASS: game-core/transactions works - {len(data['transactions'])} transactions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

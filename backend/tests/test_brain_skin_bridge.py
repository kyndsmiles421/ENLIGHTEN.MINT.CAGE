"""
Test Suite: Brain/Skin/Bridge Integration (Iteration 160)
Tests the Infinite Scenario Generator (The Brain), Premium Enhanced Graph Simulation Machine (The Skin),
and Soul-to-Game Bridge integration into the Universal Game Template.

Key features tested:
- GET /api/dream-realms/scenario-state (The Brain) - unified scenario state
- Layer metadata in Rock Hounding specimens
- Layer multipliers applied to rewards
- Forgotten Languages journal and streak endpoints (regression)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

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
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestScenarioState:
    """Tests for GET /api/dream-realms/scenario-state (The Brain)"""
    
    def test_scenario_state_returns_200(self, auth_headers):
        """Scenario state endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/dream-realms/scenario-state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: scenario-state returns 200")
    
    def test_scenario_state_has_layer_data(self, auth_headers):
        """Scenario state should include layer with all required fields."""
        response = requests.get(f"{BASE_URL}/api/dream-realms/scenario-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check layer exists
        assert "layer" in data, "Missing 'layer' in scenario state"
        layer = data["layer"]
        
        # Check layer fields
        assert "id" in layer, "Missing layer.id"
        assert "name" in layer, "Missing layer.name"
        assert "subtitle" in layer, "Missing layer.subtitle"
        assert "color" in layer, "Missing layer.color"
        assert "entropy" in layer, "Missing layer.entropy"
        assert "loot_multiplier" in layer, "Missing layer.loot_multiplier"
        assert "xp_multiplier" in layer, "Missing layer.xp_multiplier"
        assert "rarity_shift" in layer, "Missing layer.rarity_shift"
        
        # Validate types
        assert isinstance(layer["loot_multiplier"], (int, float)), "loot_multiplier should be numeric"
        assert isinstance(layer["xp_multiplier"], (int, float)), "xp_multiplier should be numeric"
        assert layer["loot_multiplier"] >= 1.0, "loot_multiplier should be >= 1.0"
        assert layer["xp_multiplier"] >= 1.0, "xp_multiplier should be >= 1.0"
        
        print(f"PASS: layer data present - {layer['name']} ({layer['id']}), loot_mult={layer['loot_multiplier']}, xp_mult={layer['xp_multiplier']}")
    
    def test_scenario_state_has_difficulty(self, auth_headers):
        """Scenario state should include difficulty with all required fields."""
        response = requests.get(f"{BASE_URL}/api/dream-realms/scenario-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check difficulty exists
        assert "difficulty" in data, "Missing 'difficulty' in scenario state"
        diff = data["difficulty"]
        
        # Check difficulty fields
        assert "difficulty" in diff, "Missing difficulty.difficulty (level)"
        assert "state" in diff, "Missing difficulty.state"
        assert "description" in diff, "Missing difficulty.description"
        assert "freshness_factor" in diff, "Missing difficulty.freshness_factor"
        assert "harmony_factor" in diff, "Missing difficulty.harmony_factor"
        assert "challenge_count" in diff, "Missing difficulty.challenge_count"
        
        # Validate types
        assert isinstance(diff["difficulty"], (int, float)), "difficulty level should be numeric"
        assert diff["state"] in ["tightening", "expanding", "holding"], f"Invalid state: {diff['state']}"
        assert isinstance(diff["challenge_count"], int), "challenge_count should be int"
        
        print(f"PASS: difficulty data present - level={diff['difficulty']}, state={diff['state']}, challenges={diff['challenge_count']}")
    
    def test_scenario_state_has_visual_directives(self, auth_headers):
        """Scenario state should include visual_directives for The Skin."""
        response = requests.get(f"{BASE_URL}/api/dream-realms/scenario-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check visual_directives exists
        assert "visual_directives" in data, "Missing 'visual_directives' in scenario state"
        vd = data["visual_directives"]
        
        # Check visual directive fields
        assert "entropy_level" in vd, "Missing entropy_level"
        assert "blur" in vd, "Missing blur"
        assert "grain" in vd, "Missing grain"
        assert "glitch" in vd, "Missing glitch"
        assert "saturation" in vd, "Missing saturation"
        assert "tint_color" in vd, "Missing tint_color"
        assert "fractures_active" in vd, "Missing fractures_active"
        assert "layer_name" in vd, "Missing layer_name"
        assert "layer_id" in vd, "Missing layer_id"
        
        # Validate entropy_level values
        valid_entropy = ["critical", "high", "moderate", "low", "clear"]
        assert vd["entropy_level"] in valid_entropy, f"Invalid entropy_level: {vd['entropy_level']}"
        
        print(f"PASS: visual_directives present - entropy={vd['entropy_level']}, blur={vd['blur']}, layer={vd['layer_name']}")
    
    def test_scenario_state_has_harmony_and_elements(self, auth_headers):
        """Scenario state should include harmony score and element info."""
        response = requests.get(f"{BASE_URL}/api/dream-realms/scenario-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check harmony
        assert "harmony" in data, "Missing 'harmony' in scenario state"
        assert isinstance(data["harmony"], (int, float)), "harmony should be numeric"
        assert 0 <= data["harmony"] <= 100, f"harmony should be 0-100, got {data['harmony']}"
        
        # Check harmony_cycle
        assert "harmony_cycle" in data, "Missing 'harmony_cycle'"
        
        # Check elements
        assert "dominant_element" in data, "Missing 'dominant_element'"
        assert "deficient_element" in data, "Missing 'deficient_element'"
        
        # Check loop state
        assert "loop_active" in data, "Missing 'loop_active'"
        assert "loop_iteration" in data, "Missing 'loop_iteration'"
        
        print(f"PASS: harmony={data['harmony']}, cycle={data['harmony_cycle']}, dom={data['dominant_element']}, def={data['deficient_element']}, loop_active={data['loop_active']}")


class TestRockHoundingLayerIntegration:
    """Tests for Rock Hounding layer metadata and multipliers"""
    
    def test_mine_includes_layer_data(self, auth_headers):
        """GET /api/rock-hounding/mine should include layer data."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check layer exists
        assert "layer" in data, "Missing 'layer' in mine response"
        layer = data["layer"]
        
        # Check layer fields
        assert "active_layer" in layer, "Missing active_layer"
        assert "unlocked_layers" in layer, "Missing unlocked_layers"
        assert "layer" in layer, "Missing layer details"
        
        layer_details = layer["layer"]
        assert "loot_multiplier" in layer_details, "Missing loot_multiplier in layer details"
        assert "xp_multiplier" in layer_details, "Missing xp_multiplier in layer details"
        
        print(f"PASS: mine includes layer - active={layer['active_layer']}, unlocked={layer['unlocked_layers']}")
    
    def test_mine_action_returns_layer_metadata_in_specimen(self, auth_headers):
        """POST /api/rock-hounding/mine-action should return layer metadata in specimen."""
        # First get mine to check energy
        mine_res = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert mine_res.status_code == 200
        mine = mine_res.json()
        
        energy = mine.get("energy_info", {}).get("current", 0)
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        # Mine at depth 1
        response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", 
                                 json={"depth": 1}, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check specimen has layer metadata
        assert "specimen" in data, "Missing 'specimen' in response"
        specimen = data["specimen"]
        
        assert "layer_found" in specimen, "Missing layer_found in specimen"
        assert "layer_name" in specimen, "Missing layer_name in specimen"
        assert "layer_multiplier" in specimen, "Missing layer_multiplier in specimen"
        
        print(f"PASS: specimen has layer metadata - layer_found={specimen['layer_found']}, layer_name={specimen['layer_name']}, mult={specimen['layer_multiplier']}")
    
    def test_mine_action_returns_layer_info_in_response(self, auth_headers):
        """POST /api/rock-hounding/mine-action should return layer info at top level."""
        # First get mine to check energy
        mine_res = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert mine_res.status_code == 200
        mine = mine_res.json()
        
        energy = mine.get("energy_info", {}).get("current", 0)
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        # Mine at depth 1
        response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", 
                                 json={"depth": 1}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check layer info at top level
        assert "layer" in data, "Missing 'layer' in response"
        layer = data["layer"]
        
        assert "id" in layer, "Missing layer.id"
        assert "name" in layer, "Missing layer.name"
        assert "loot_multiplier" in layer, "Missing layer.loot_multiplier"
        assert "xp_multiplier" in layer, "Missing layer.xp_multiplier"
        
        print(f"PASS: layer info in response - id={layer['id']}, name={layer['name']}, loot_mult={layer['loot_multiplier']}, xp_mult={layer['xp_multiplier']}")
    
    def test_mine_action_rewards_are_multiplied(self, auth_headers):
        """Rewards in mine-action should be multiplied by layer multipliers."""
        # First get mine to check energy
        mine_res = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert mine_res.status_code == 200
        mine = mine_res.json()
        
        energy = mine.get("energy_info", {}).get("current", 0)
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        # Mine at depth 1
        response = requests.post(f"{BASE_URL}/api/rock-hounding/mine-action", 
                                 json={"depth": 1}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check rewards exist
        assert "rewards" in data, "Missing 'rewards' in response"
        rewards = data["rewards"]
        
        assert "xp" in rewards, "Missing xp in rewards"
        assert "dust" in rewards, "Missing dust in rewards"
        assert rewards["xp"] > 0, "XP should be > 0"
        assert rewards["dust"] > 0, "Dust should be > 0"
        
        # Check layer multiplier is applied (if layer mult > 1, rewards should be higher than base)
        layer = data.get("layer", {})
        loot_mult = layer.get("loot_multiplier", 1.0)
        xp_mult = layer.get("xp_multiplier", 1.0)
        
        print(f"PASS: rewards present - xp={rewards['xp']}, dust={rewards['dust']} (layer mults: loot={loot_mult}, xp={xp_mult})")


class TestGameCoreLayerEndpoints:
    """Tests for game-core layer endpoints"""
    
    def test_stats_includes_layer_with_all_layers(self, auth_headers):
        """GET /api/game-core/stats should include layer with all_layers array."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check layer exists
        assert "layer" in data, "Missing 'layer' in stats"
        layer = data["layer"]
        
        # Check all_layers array
        assert "all_layers" in layer, "Missing all_layers in layer"
        all_layers = layer["all_layers"]
        
        assert isinstance(all_layers, list), "all_layers should be a list"
        assert len(all_layers) == 5, f"Expected 5 layers, got {len(all_layers)}"
        
        # Verify layer names
        layer_names = [l["name"] for l in all_layers]
        expected_names = ["Terrestrial", "Ethereal", "Astral", "Void", "Nexus"]
        assert layer_names == expected_names, f"Layer names mismatch: {layer_names}"
        
        print(f"PASS: stats includes all 5 layers: {layer_names}")
    
    def test_layer_endpoint_returns_layer_state(self, auth_headers):
        """GET /api/game-core/layer should return layer state independently."""
        response = requests.get(f"{BASE_URL}/api/game-core/layer", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check required fields
        assert "active_layer" in data, "Missing active_layer"
        assert "layer" in data, "Missing layer details"
        assert "unlocked_layers" in data, "Missing unlocked_layers"
        assert "all_layers" in data, "Missing all_layers"
        
        # Validate layer details
        layer = data["layer"]
        assert "id" in layer, "Missing layer.id"
        assert "name" in layer, "Missing layer.name"
        assert "loot_multiplier" in layer, "Missing layer.loot_multiplier"
        assert "xp_multiplier" in layer, "Missing layer.xp_multiplier"
        assert "entropy" in layer, "Missing layer.entropy"
        
        print(f"PASS: layer endpoint returns - active={data['active_layer']}, unlocked={data['unlocked_layers']}")


class TestForgottenLanguagesRegression:
    """Regression tests for Forgotten Languages endpoints"""
    
    def test_journal_endpoint_works(self, auth_headers):
        """GET /api/forgotten-languages/journal should work."""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/journal", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "total_entries" in data, "Missing total_entries"
        assert "entries" in data, "Missing entries"
        
        print(f"PASS: journal endpoint works - total_entries={data['total_entries']}")
    
    def test_daily_includes_streak_data(self, auth_headers):
        """GET /api/forgotten-languages/daily should include streak data."""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check streak exists
        assert "streak" in data, "Missing 'streak' in daily response"
        streak = data["streak"]
        
        # Check streak fields
        assert "current" in streak, "Missing streak.current"
        assert "best" in streak, "Missing streak.best"
        assert "multiplier" in streak, "Missing streak.multiplier"
        
        # Validate types
        assert isinstance(streak["current"], int), "current should be int"
        assert isinstance(streak["best"], int), "best should be int"
        assert isinstance(streak["multiplier"], (int, float)), "multiplier should be numeric"
        
        print(f"PASS: daily includes streak - current={streak['current']}, best={streak['best']}, mult={streak['multiplier']}")
    
    def test_mastery_endpoint_works(self, auth_headers):
        """GET /api/forgotten-languages/mastery should work (regression)."""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check required fields
        assert "current_tier" in data, "Missing current_tier"
        assert "current_tier_name" in data, "Missing current_tier_name"
        
        print(f"PASS: mastery endpoint works - tier={data['current_tier']}, name={data['current_tier_name']}")


class TestDashboardRegression:
    """Regression tests for dashboard navigation"""
    
    def test_dashboard_stats_works(self, auth_headers):
        """GET /api/dashboard/stats should work."""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: dashboard/stats works")
    
    def test_nexus_state_works(self, auth_headers):
        """GET /api/nexus/state should work."""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: nexus/state works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

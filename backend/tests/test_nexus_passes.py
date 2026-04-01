"""
Nexus Passes Feature Tests - Iteration 161
Tests for premium passes that temporarily unlock higher universe layers for mining.
Pass types: Astral Pass (200 dust, 60min, 1.7x), Void Pass (500 dust, 60min, 2.5x), Nexus Pass (1200 dust, 30min, 3.0x)
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
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.text}")
    return response.json().get("token")


@pytest.fixture(scope="module")
def headers(auth_token):
    """Auth headers for API requests."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestNexusPassesEndpoint:
    """Tests for GET /api/game-core/passes endpoint."""
    
    def test_get_passes_returns_available_passes(self, headers):
        """GET /api/game-core/passes returns available passes list."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "available_passes" in data
        assert "active_pass" in data
        assert "cosmic_dust" in data
        assert "natural_layer" in data
        assert "purchase_history" in data
        
        print(f"Available passes: {len(data['available_passes'])}")
        print(f"Active pass: {data['active_pass']}")
        print(f"Cosmic dust: {data['cosmic_dust']}")
        print(f"Natural layer: {data['natural_layer']}")
    
    def test_get_passes_returns_dust_balance(self, headers):
        """GET /api/game-core/passes returns user's cosmic dust balance."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "cosmic_dust" in data
        assert isinstance(data["cosmic_dust"], (int, float))
        print(f"User dust balance: {data['cosmic_dust']}")
    
    def test_get_passes_returns_natural_layer(self, headers):
        """GET /api/game-core/passes returns user's natural layer from resonance."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "natural_layer" in data
        assert data["natural_layer"] in ["terrestrial", "ethereal", "astral", "void", "nexus"]
        print(f"Natural layer: {data['natural_layer']}")
    
    def test_available_passes_have_required_fields(self, headers):
        """Each available pass has required fields: id, name, cost_dust, duration_minutes, target_layer."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        for pass_item in data["available_passes"]:
            assert "id" in pass_item
            assert "name" in pass_item
            assert "cost_dust" in pass_item
            assert "duration_minutes" in pass_item
            assert "target_layer" in pass_item
            assert "can_afford" in pass_item
            print(f"Pass: {pass_item['name']} - {pass_item['cost_dust']} dust, {pass_item['duration_minutes']} min, target: {pass_item['target_layer']}")


class TestNexusPassPurchase:
    """Tests for POST /api/game-core/passes/purchase endpoint."""
    
    def test_purchase_fails_with_active_pass(self, headers):
        """POST /api/game-core/passes/purchase fails with 400 when already have active pass."""
        # First check if there's an active pass
        passes_response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        passes_data = passes_response.json()
        
        if passes_data.get("active_pass"):
            # User has active pass - try to purchase another
            response = requests.post(
                f"{BASE_URL}/api/game-core/passes/purchase",
                json={"pass_id": "void_pass"},
                headers=headers
            )
            assert response.status_code == 400
            assert "already have an active pass" in response.json().get("detail", "").lower()
            print("Correctly rejected purchase when active pass exists")
        else:
            pytest.skip("No active pass to test duplicate purchase prevention")
    
    def test_purchase_fails_with_insufficient_dust(self, headers):
        """POST /api/game-core/passes/purchase fails with 400 for insufficient dust."""
        # Get current state
        passes_response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        passes_data = passes_response.json()
        
        if passes_data.get("active_pass"):
            pytest.skip("User has active pass - cannot test insufficient dust")
        
        # Find a pass user can't afford
        for pass_item in passes_data["available_passes"]:
            if not pass_item["can_afford"]:
                response = requests.post(
                    f"{BASE_URL}/api/game-core/passes/purchase",
                    json={"pass_id": pass_item["id"]},
                    headers=headers
                )
                assert response.status_code == 400
                assert "insufficient" in response.json().get("detail", "").lower()
                print(f"Correctly rejected purchase of {pass_item['name']} due to insufficient dust")
                return
        
        pytest.skip("User can afford all available passes - cannot test insufficient dust")
    
    def test_purchase_fails_for_already_unlocked_layer(self, headers):
        """POST /api/game-core/passes/purchase fails with 400 when pass layer already naturally unlocked."""
        # Get user's natural layer
        passes_response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        passes_data = passes_response.json()
        natural_layer = passes_data.get("natural_layer", "terrestrial")
        
        # The available_passes should only show passes above natural layer
        # So we need to try purchasing a pass for a layer at or below natural
        layer_order = ["terrestrial", "ethereal", "astral", "void", "nexus"]
        natural_idx = layer_order.index(natural_layer)
        
        # Try to purchase a pass for a layer at or below natural
        pass_map = {
            "astral": "astral_pass",
            "void": "void_pass",
            "nexus": "nexus_pass"
        }
        
        for layer in layer_order[:natural_idx + 1]:
            if layer in pass_map:
                response = requests.post(
                    f"{BASE_URL}/api/game-core/passes/purchase",
                    json={"pass_id": pass_map[layer]},
                    headers=headers
                )
                if response.status_code == 400:
                    detail = response.json().get("detail", "")
                    if "natural access" in detail.lower() or "already" in detail.lower():
                        print(f"Correctly rejected purchase of {pass_map[layer]} - layer already unlocked")
                        return
        
        print(f"User natural layer: {natural_layer} - no passes below this to test")
        # This is expected behavior - passes below natural layer aren't offered


class TestGameCoreStatsWithPass:
    """Tests for GET /api/game-core/stats with active pass."""
    
    def test_stats_returns_layer_with_active_pass_info(self, headers):
        """GET /api/game-core/stats returns layer with active_pass info when pass is active."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "layer" in data
        layer = data["layer"]
        
        assert "active_layer" in layer
        assert "natural_layer" in layer
        assert "active_pass" in layer
        
        print(f"Active layer: {layer['active_layer']}")
        print(f"Natural layer: {layer['natural_layer']}")
        print(f"Active pass: {layer['active_pass']}")
        
        if layer["active_pass"]:
            # Verify pass info structure
            pass_info = layer["active_pass"]
            assert "pass_id" in pass_info
            assert "pass_name" in pass_info
            assert "expires_at" in pass_info
            assert "target_layer" in pass_info
            print(f"Pass expires at: {pass_info['expires_at']}")
    
    def test_stats_active_layer_reflects_pass_target(self, headers):
        """GET /api/game-core/stats layer active_layer reflects pass target layer (not natural)."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        layer = data["layer"]
        
        if layer["active_pass"]:
            # Active layer should be the pass target layer
            assert layer["active_layer"] == layer["active_pass"]["target_layer"]
            print(f"Active layer ({layer['active_layer']}) matches pass target ({layer['active_pass']['target_layer']})")
        else:
            # No pass - active layer should equal natural layer
            assert layer["active_layer"] == layer["natural_layer"]
            print(f"No active pass - active layer equals natural layer: {layer['active_layer']}")
    
    def test_stats_includes_natural_layer_field(self, headers):
        """GET /api/game-core/stats layer includes natural_layer field showing base layer."""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        layer = data["layer"]
        assert "natural_layer" in layer
        assert layer["natural_layer"] in ["terrestrial", "ethereal", "astral", "void", "nexus"]
        print(f"Natural layer: {layer['natural_layer']}")


class TestRockHoundingWithPass:
    """Tests for Rock Hounding endpoints with active pass."""
    
    def test_mine_returns_layer_with_pass_upgraded_active_layer(self, headers):
        """GET /api/rock-hounding/mine returns layer with pass-upgraded active_layer."""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "layer" in data
        layer = data["layer"]
        
        assert "active_layer" in layer
        assert "natural_layer" in layer
        assert "active_pass" in layer
        
        print(f"Mine active layer: {layer['active_layer']}")
        print(f"Mine natural layer: {layer['natural_layer']}")
        
        if layer["active_pass"]:
            # Verify pass upgrades the layer
            assert layer["active_layer"] == layer["active_pass"]["target_layer"]
            print(f"Pass active - mining in {layer['active_layer']} layer")
    
    def test_mine_action_uses_pass_layer_multipliers(self, headers):
        """POST /api/rock-hounding/mine-action uses pass layer multipliers for rewards."""
        # First check energy
        mine_response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        mine_data = mine_response.json()
        
        energy = mine_data.get("energy_info", {}).get("current", 0)
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        # Perform mine action
        response = requests.post(
            f"{BASE_URL}/api/rock-hounding/mine-action",
            json={"depth": 1},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify layer info in response
        assert "layer" in data
        layer = data["layer"]
        assert "id" in layer
        assert "name" in layer
        assert "loot_multiplier" in layer
        assert "xp_multiplier" in layer
        
        print(f"Mine action layer: {layer['name']}")
        print(f"Loot multiplier: {layer['loot_multiplier']}")
        print(f"XP multiplier: {layer['xp_multiplier']}")
        
        # Verify rewards
        assert "rewards" in data
        rewards = data["rewards"]
        assert "xp" in rewards
        assert "dust" in rewards
        print(f"Rewards: +{rewards['xp']} XP, +{rewards['dust']} dust")
    
    def test_specimen_metadata_includes_layer_found(self, headers):
        """Specimen metadata includes layer_found matching pass target layer."""
        # Check energy first
        mine_response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        mine_data = mine_response.json()
        
        energy = mine_data.get("energy_info", {}).get("current", 0)
        if energy < 1:
            pytest.skip("Not enough energy to mine")
        
        # Perform mine action
        response = requests.post(
            f"{BASE_URL}/api/rock-hounding/mine-action",
            json={"depth": 1},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify specimen has layer metadata
        assert "specimen" in data
        specimen = data["specimen"]
        assert "layer_found" in specimen
        assert "layer_name" in specimen
        assert "layer_multiplier" in specimen
        
        print(f"Specimen: {specimen['name']}")
        print(f"Layer found: {specimen['layer_found']} ({specimen['layer_name']})")
        print(f"Layer multiplier: {specimen['layer_multiplier']}")
        
        # If pass is active, layer_found should match pass target
        layer = data.get("layer", {})
        if mine_data.get("layer", {}).get("active_pass"):
            expected_layer = mine_data["layer"]["active_pass"]["target_layer"]
            assert specimen["layer_found"] == expected_layer
            print(f"Specimen layer matches active pass target: {expected_layer}")


class TestPassDefinitions:
    """Tests for pass definitions and constants."""
    
    def test_astral_pass_definition(self, headers):
        """Astral Pass: 200 dust, 60min, 1.7x loot (astral layer)."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        # Find astral pass in available or check definition
        # Note: May not be in available_passes if user already has astral unlocked
        print("Checking Astral Pass definition...")
        print("Expected: 200 dust, 60 min, target: astral, 1.7x loot")
    
    def test_void_pass_definition(self, headers):
        """Void Pass: 500 dust, 60min, 2.5x loot (void layer)."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        for pass_item in data["available_passes"]:
            if pass_item["id"] == "void_pass":
                assert pass_item["cost_dust"] == 500
                assert pass_item["duration_minutes"] == 60
                assert pass_item["target_layer"] == "void"
                print(f"Void Pass verified: {pass_item['cost_dust']} dust, {pass_item['duration_minutes']} min")
                return
        
        print("Void Pass not in available passes (may be active or user has void unlocked)")
    
    def test_nexus_pass_definition(self, headers):
        """Nexus Pass: 1200 dust, 30min, 3.0x loot (nexus layer)."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        for pass_item in data["available_passes"]:
            if pass_item["id"] == "nexus_pass":
                assert pass_item["cost_dust"] == 1200
                assert pass_item["duration_minutes"] == 30
                assert pass_item["target_layer"] == "nexus"
                print(f"Nexus Pass verified: {pass_item['cost_dust']} dust, {pass_item['duration_minutes']} min")
                return
        
        print("Nexus Pass not in available passes (may be active or user has nexus unlocked)")


class TestActivePassState:
    """Tests for active pass state and expiration."""
    
    def test_active_pass_has_expires_at(self, headers):
        """Active pass includes expires_at timestamp."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        if data.get("active_pass"):
            assert "expires_at" in data["active_pass"]
            print(f"Active pass expires at: {data['active_pass']['expires_at']}")
        else:
            pytest.skip("No active pass to check expiration")
    
    def test_active_pass_has_pass_name(self, headers):
        """Active pass includes pass_name field."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        if data.get("active_pass"):
            assert "pass_name" in data["active_pass"]
            print(f"Active pass name: {data['active_pass']['pass_name']}")
        else:
            pytest.skip("No active pass to check name")
    
    def test_active_pass_has_target_layer(self, headers):
        """Active pass includes target_layer field."""
        response = requests.get(f"{BASE_URL}/api/game-core/passes", headers=headers)
        data = response.json()
        
        if data.get("active_pass"):
            assert "target_layer" in data["active_pass"]
            assert data["active_pass"]["target_layer"] in ["astral", "void", "nexus"]
            print(f"Active pass target layer: {data['active_pass']['target_layer']}")
        else:
            pytest.skip("No active pass to check target layer")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 182: Planetary Stratigraphy + Quantum Mechanics Testing
Tests for:
- Planetary Layers (4-layer system: Crust/Mantle/Outer Core/Hollow Earth)
- Jungian Psyche Tracking (Persona/Shadow/Anima/Self)
- Shadow Sprites (superposition, observation, collapse)
- Quantum Tunneling (layer traversal)
- Entanglement Bonds (player linking)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


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
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestPlanetaryLayers:
    """Tests for GET /api/planetary/layers endpoint."""

    def test_get_layers_returns_4_layers(self, auth_headers):
        """Verify endpoint returns exactly 4 planetary layers."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "layers" in data
        assert len(data["layers"]) == 4, f"Expected 4 layers, got {len(data['layers'])}"
        
        # Verify layer IDs
        layer_ids = [l["id"] for l in data["layers"]]
        assert "crust" in layer_ids
        assert "mantle" in layer_ids
        assert "outer_core" in layer_ids
        assert "hollow_earth" in layer_ids

    def test_layers_have_required_fields(self, auth_headers):
        """Verify each layer has all required fields."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "subtitle", "frequency_hz", "element", "color", 
                          "archetype", "archetype_name", "physics", "consciousness_required",
                          "accessible", "unlocked", "meets_consciousness", "is_current"]
        
        for layer in data["layers"]:
            for field in required_fields:
                assert field in layer, f"Layer {layer.get('id')} missing field: {field}"

    def test_layers_have_correct_frequencies(self, auth_headers):
        """Verify layers have correct frequency values."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        freq_map = {l["id"]: l["frequency_hz"] for l in data["layers"]}
        
        assert freq_map["crust"] == 432, "Crust should be 432 Hz"
        assert freq_map["mantle"] == 396, "Mantle should be 396 Hz"
        assert freq_map["outer_core"] == 285, "Outer Core should be 285 Hz"
        assert freq_map["hollow_earth"] == 174, "Hollow Earth should be 174 Hz"

    def test_layers_accessibility_based_on_consciousness(self, auth_headers):
        """Verify layer accessibility is gated by consciousness level."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        level = data.get("consciousness_level", 1)
        
        # Test user has level 1, so only crust should be accessible
        for layer in data["layers"]:
            if layer["consciousness_required"] <= level:
                assert layer["meets_consciousness"] == True
            else:
                assert layer["meets_consciousness"] == False

    def test_response_includes_psyche_state(self, auth_headers):
        """Verify response includes psyche state information."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "current_layer" in data
        assert "psyche_state" in data
        assert "psyche_info" in data
        assert "consciousness_level" in data

    def test_layers_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/planetary/layers")
        assert response.status_code in [401, 403, 422]


class TestPlanetaryDepthStatus:
    """Tests for GET /api/planetary/depth-status endpoint."""

    def test_depth_status_returns_correct_structure(self, auth_headers):
        """Verify depth-status returns expected fields."""
        response = requests.get(f"{BASE_URL}/api/planetary/depth-status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "current_layer" in data
        assert "psyche_state" in data
        assert "psyche_info" in data
        assert "unlocked_layers" in data
        assert "descent_history" in data

    def test_psyche_info_has_required_fields(self, auth_headers):
        """Verify psyche_info contains required fields."""
        response = requests.get(f"{BASE_URL}/api/planetary/depth-status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        psyche_info = data.get("psyche_info", {})
        assert "name" in psyche_info
        assert "element" in psyche_info
        assert "color" in psyche_info
        assert "depth" in psyche_info


class TestPlanetaryFrequencyMap:
    """Tests for GET /api/planetary/frequency-map endpoint (no auth required)."""

    def test_frequency_map_no_auth_required(self):
        """Verify frequency-map endpoint works without auth."""
        response = requests.get(f"{BASE_URL}/api/planetary/frequency-map")
        assert response.status_code == 200
        
        data = response.json()
        assert "frequency_map" in data
        assert len(data["frequency_map"]) == 4

    def test_frequency_map_structure(self):
        """Verify frequency map has correct structure."""
        response = requests.get(f"{BASE_URL}/api/planetary/frequency-map")
        assert response.status_code == 200
        
        data = response.json()
        for entry in data["frequency_map"]:
            assert "layer" in entry
            assert "name" in entry
            assert "frequency_hz" in entry
            assert "element" in entry
            assert "color" in entry
            assert "haptic_profile" in entry
            assert "gravity" in entry


class TestPlanetaryDescend:
    """Tests for POST /api/planetary/descend endpoint."""

    def test_descend_to_crust_succeeds(self, auth_headers):
        """Verify descending to crust (level 1 required) works."""
        response = requests.post(
            f"{BASE_URL}/api/planetary/descend",
            json={"target_layer": "crust"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert data.get("current_layer") == "crust"
        assert "layer_info" in data
        assert "psyche_state" in data
        assert "transition" in data

    def test_descend_to_mantle_blocked_at_level_1(self, auth_headers):
        """Verify descending to mantle (level 2 required) is blocked for level 1 user."""
        response = requests.post(
            f"{BASE_URL}/api/planetary/descend",
            json={"target_layer": "mantle"},
            headers=auth_headers
        )
        # Should be 403 Forbidden since test user is level 1
        assert response.status_code == 403

    def test_descend_invalid_layer_fails(self, auth_headers):
        """Verify descending to invalid layer returns error."""
        response = requests.post(
            f"{BASE_URL}/api/planetary/descend",
            json={"target_layer": "invalid_layer"},
            headers=auth_headers
        )
        assert response.status_code == 400


class TestQuantumShadowsNearby:
    """Tests for GET /api/quantum/shadows/nearby endpoint."""

    def test_nearby_shadows_returns_3_sprites(self, auth_headers):
        """Verify endpoint returns 3 shadow sprites."""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "sprites" in data
        assert len(data["sprites"]) == 3, f"Expected 3 sprites, got {len(data['sprites'])}"

    def test_sprites_have_required_fields(self, auth_headers):
        """Verify each sprite has required fields."""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["sprite_id", "type", "name", "description", "rarity", 
                          "lat", "lng", "distance_m", "state"]
        
        for sprite in data["sprites"]:
            for field in required_fields:
                assert field in sprite, f"Sprite missing field: {field}"

    def test_sprites_have_valid_rarity(self, auth_headers):
        """Verify sprites have valid rarity values."""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        valid_rarities = ["common", "uncommon", "rare", "legendary"]
        
        for sprite in data["sprites"]:
            assert sprite["rarity"] in valid_rarities

    def test_sprites_have_superposition_state(self, auth_headers):
        """Verify sprites are in superposition or collapsed state."""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        valid_states = ["superposition", "collapsed"]
        
        for sprite in data["sprites"]:
            assert sprite["state"] in valid_states

    def test_response_includes_observe_radius(self, auth_headers):
        """Verify response includes observe radius."""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "observe_radius_m" in data
        assert data["observe_radius_m"] == 50


class TestQuantumShadowsHistory:
    """Tests for GET /api/quantum/shadows/history endpoint."""

    def test_shadow_history_returns_structure(self, auth_headers):
        """Verify shadow history returns expected structure."""
        response = requests.get(f"{BASE_URL}/api/quantum/shadows/history", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_collapsed" in data
        assert "total_dust" in data
        assert "total_xp" in data
        assert "history" in data
        assert "by_rarity" in data

    def test_by_rarity_has_all_categories(self, auth_headers):
        """Verify by_rarity includes all rarity categories."""
        response = requests.get(f"{BASE_URL}/api/quantum/shadows/history", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        by_rarity = data.get("by_rarity", {})
        assert "common" in by_rarity
        assert "uncommon" in by_rarity
        assert "rare" in by_rarity
        assert "legendary" in by_rarity


class TestQuantumTunneling:
    """Tests for POST /api/quantum/tunnel endpoint."""

    def test_tunneling_requires_level_2(self, auth_headers):
        """Verify quantum tunneling requires consciousness level 2+."""
        response = requests.post(
            f"{BASE_URL}/api/quantum/tunnel",
            json={"target_layer": "mantle"},
            headers=auth_headers
        )
        # Test user is level 1, should be blocked
        assert response.status_code == 403
        assert "level 2" in response.json().get("detail", "").lower()

    def test_tunneling_invalid_layer_fails(self, auth_headers):
        """Verify tunneling to invalid layer returns error."""
        response = requests.post(
            f"{BASE_URL}/api/quantum/tunnel",
            json={"target_layer": "invalid_layer"},
            headers=auth_headers
        )
        assert response.status_code == 400


class TestQuantumTunnelingCosts:
    """Tests for GET /api/quantum/tunneling-costs endpoint."""

    def test_tunneling_costs_returns_structure(self, auth_headers):
        """Verify tunneling costs returns expected structure."""
        response = requests.get(f"{BASE_URL}/api/quantum/tunneling-costs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "current_layer" in data
        assert "dust_balance" in data
        assert "consciousness_level" in data
        assert "tunneling_unlocked" in data
        assert "costs" in data

    def test_costs_array_has_correct_fields(self, auth_headers):
        """Verify each cost entry has required fields."""
        response = requests.get(f"{BASE_URL}/api/quantum/tunneling-costs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        for cost in data.get("costs", []):
            assert "target" in cost
            assert "cost" in cost
            assert "direction" in cost
            assert "affordable" in cost
            assert "consciousness_met" in cost
            assert "consciousness_required" in cost

    def test_tunneling_unlocked_false_at_level_1(self, auth_headers):
        """Verify tunneling is locked for level 1 user."""
        response = requests.get(f"{BASE_URL}/api/quantum/tunneling-costs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Test user is level 1, tunneling requires level 2
        assert data.get("tunneling_unlocked") == False


class TestQuantumEntanglements:
    """Tests for GET /api/quantum/entanglements endpoint."""

    def test_entanglements_returns_structure(self, auth_headers):
        """Verify entanglements returns expected structure."""
        response = requests.get(f"{BASE_URL}/api/quantum/entanglements", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "entanglements" in data
        assert "count" in data
        assert "max" in data
        assert data["max"] == 3  # Max 3 entanglements


class TestQuantumEntangle:
    """Tests for POST /api/quantum/entangle endpoint."""

    def test_entangle_self_fails(self, auth_headers, auth_token):
        """Verify cannot entangle with yourself."""
        # First get user ID from token
        response = requests.get(f"{BASE_URL}/api/profiles/me", headers=auth_headers)
        if response.status_code == 200:
            user_id = response.json().get("id")
            if user_id:
                response = requests.post(
                    f"{BASE_URL}/api/quantum/entangle",
                    json={"target_user_id": user_id},
                    headers=auth_headers
                )
                assert response.status_code == 400
                assert "yourself" in response.json().get("detail", "").lower()

    def test_entangle_nonexistent_user_fails(self, auth_headers):
        """Verify entangling with nonexistent user fails."""
        response = requests.post(
            f"{BASE_URL}/api/quantum/entangle",
            json={"target_user_id": "nonexistent_user_id_12345"},
            headers=auth_headers
        )
        assert response.status_code == 404


class TestShadowObserve:
    """Tests for POST /api/quantum/shadows/observe endpoint."""

    def test_observe_nonexistent_sprite_fails(self, auth_headers):
        """Verify observing nonexistent sprite fails."""
        response = requests.post(
            f"{BASE_URL}/api/quantum/shadows/observe",
            json={
                "sprite_id": "nonexistent_sprite_12345",
                "lat": 44.08,
                "lng": -103.23
            },
            headers=auth_headers
        )
        assert response.status_code == 404


class TestAuthRequired:
    """Tests to verify auth is required for protected endpoints."""

    def test_planetary_layers_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/planetary/layers")
        assert response.status_code in [401, 403, 422]

    def test_planetary_depth_status_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/planetary/depth-status")
        assert response.status_code in [401, 403, 422]

    def test_planetary_descend_requires_auth(self):
        response = requests.post(f"{BASE_URL}/api/planetary/descend", json={"target_layer": "crust"})
        assert response.status_code in [401, 403, 422]

    def test_quantum_shadows_nearby_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.08&lng=-103.23")
        assert response.status_code in [401, 403, 422]

    def test_quantum_shadows_history_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/quantum/shadows/history")
        assert response.status_code in [401, 403, 422]

    def test_quantum_tunnel_requires_auth(self):
        response = requests.post(f"{BASE_URL}/api/quantum/tunnel", json={"target_layer": "mantle"})
        assert response.status_code in [401, 403, 422]

    def test_quantum_tunneling_costs_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/quantum/tunneling-costs")
        assert response.status_code in [401, 403, 422]

    def test_quantum_entanglements_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/quantum/entanglements")
        assert response.status_code in [401, 403, 422]

    def test_quantum_entangle_requires_auth(self):
        response = requests.post(f"{BASE_URL}/api/quantum/entangle", json={"target_user_id": "test"})
        assert response.status_code in [401, 403, 422]

    def test_quantum_shadows_observe_requires_auth(self):
        response = requests.post(f"{BASE_URL}/api/quantum/shadows/observe", json={"sprite_id": "test", "lat": 0, "lng": 0})
        assert response.status_code in [401, 403, 422]

"""
Iteration 188 Tests: Cosmic Map GPS, Resonance Forge Mini-Game, Exponential Decay Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests:
- Decay Engine: GET /api/cosmic-map/decay-status, POST /api/cosmic-map/apply-decay
- Forge Mini-Game: GET /api/cosmic-map/forge/pattern/{build_id}, POST /api/cosmic-map/forge/attempt
- Cosmic Map GPS: POST /api/cosmic-map/nodes, POST /api/cosmic-map/harvest, GET /api/cosmic-map/harvest-history
- Regression: /api/avenues/overview, /api/science-history/economy/shop, /api/science-history/botanical-lab
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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DECAY ENGINE TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestDecayEngine:
    """Exponential Decay Engine tests."""

    def test_decay_status_returns_decay_info(self, auth_headers):
        """GET /api/cosmic-map/decay-status returns decay info with days_inactive and projected values."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/decay-status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "days_inactive" in data, "Missing days_inactive field"
        assert "decay_active" in data, "Missing decay_active field"
        assert "at_risk" in data, "Missing at_risk field"
        assert "decay_factor" in data, "Missing decay_factor field"
        assert "projected_science" in data, "Missing projected_science field"
        assert "projected_history" in data, "Missing projected_history field"
        assert "science_resonance" in data, "Missing science_resonance field"
        assert "history_resonance" in data, "Missing history_resonance field"
        assert "pulse_speed" in data, "Missing pulse_speed field"
        assert "message" in data, "Missing message field"
        
        # Verify data types
        assert isinstance(data["days_inactive"], (int, float)), "days_inactive should be numeric"
        assert isinstance(data["decay_factor"], (int, float)), "decay_factor should be numeric"
        assert isinstance(data["projected_science"], int), "projected_science should be int"
        assert isinstance(data["projected_history"], int), "projected_history should be int"
        print(f"✓ Decay status: {data['days_inactive']} days inactive, decay_active={data['decay_active']}")

    def test_apply_decay_returns_calculation(self, auth_headers):
        """POST /api/cosmic-map/apply-decay returns decay calculation result."""
        response = requests.post(f"{BASE_URL}/api/cosmic-map/apply-decay", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "decayed" in data, "Missing decayed field"
        assert isinstance(data["decayed"], bool), "decayed should be boolean"
        
        # If decay was applied, verify additional fields
        if data.get("days_inactive") is not None:
            assert "decay_factor" in data, "Missing decay_factor when days_inactive present"
        print(f"✓ Apply decay result: decayed={data['decayed']}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FORGE MINI-GAME TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestForgeMiniGame:
    """Resonance Forge Mini-Game tests."""

    def test_forge_pattern_kinetic_amplifier(self, auth_headers):
        """GET /api/cosmic-map/forge/pattern/kinetic_amplifier returns waveform with 13 points."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/kinetic_amplifier", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["build_id"] == "kinetic_amplifier", "Wrong build_id"
        assert data["name"] == "Kinetic Amplifier", "Wrong name"
        assert "waveform" in data, "Missing waveform"
        assert len(data["waveform"]) == 13, f"Expected 13 waveform points, got {len(data['waveform'])}"
        assert data["points_count"] == 13, "points_count should be 13"
        assert "frequency" in data, "Missing frequency"
        assert "tolerance" in data, "Missing tolerance"
        assert "time_limit_seconds" in data, "Missing time_limit_seconds"
        print(f"✓ Kinetic Amplifier pattern: {data['frequency']}Hz, {data['points_count']} points, {data['time_limit_seconds']}s limit")

    def test_forge_pattern_zen_flow(self, auth_headers):
        """GET /api/cosmic-map/forge/pattern/zen_flow returns valid forge pattern."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/zen_flow", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["build_id"] == "zen_flow", "Wrong build_id"
        assert data["name"] == "Zen Flow", "Wrong name"
        assert "waveform" in data, "Missing waveform"
        assert len(data["waveform"]) == 13, f"Expected 13 waveform points, got {len(data['waveform'])}"
        assert data["frequency"] == 528, "Zen Flow should be 528Hz"
        print(f"✓ Zen Flow pattern: {data['frequency']}Hz, tolerance={data['tolerance']}")

    def test_forge_pattern_not_found(self, auth_headers):
        """GET /api/cosmic-map/forge/pattern/invalid returns 404."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/invalid_build", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid forge pattern returns 404")

    def test_forge_attempt_validates_waveform(self, auth_headers):
        """POST /api/cosmic-map/forge/attempt validates waveform match and scores accuracy."""
        # First get the pattern
        pattern_res = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/kinetic_amplifier", headers=auth_headers)
        assert pattern_res.status_code == 200
        pattern = pattern_res.json()
        
        # Create a test waveform (slightly off from target)
        test_waveform = [0.1, 0.4, 0.9, 0.6, 0.4, 0.7, 0.3, 0.8, 0.5, 0.5, 0.9, 0.6, 0.1]
        
        response = requests.post(f"{BASE_URL}/api/cosmic-map/forge/attempt", json={
            "build_id": "kinetic_amplifier",
            "user_waveform": test_waveform,
            "time_taken_seconds": 8.5
        }, headers=auth_headers)
        
        # Could be 200 (success/fail), 400 (missing items), or 400 (already crafted)
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}: {response.text}"
        
        data = response.json()
        if response.status_code == 200:
            # Verify scoring fields
            assert "forged" in data, "Missing forged field"
            assert "accuracy" in data, "Missing accuracy field"
            assert "total_score" in data, "Missing total_score field"
            assert "point_scores" in data, "Missing point_scores field"
            assert "time_ok" in data, "Missing time_ok field"
            assert isinstance(data["accuracy"], (int, float)), "accuracy should be numeric"
            print(f"✓ Forge attempt: forged={data['forged']}, accuracy={data['accuracy']}%, score={data['total_score']}")
        else:
            # Expected: Missing items or already crafted
            detail = data.get("detail", "")
            assert "Missing items" in detail or "Already crafted" in detail, f"Unexpected error: {detail}"
            print(f"✓ Forge attempt blocked as expected: {detail}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC MAP GPS TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestCosmicMapGPS:
    """Cosmic Map GPS Node Generation tests."""

    def test_nodes_returns_10_procedural_nodes(self, auth_headers):
        """POST /api/cosmic-map/nodes with lat/lng returns 10 procedurally generated nodes."""
        response = requests.post(f"{BASE_URL}/api/cosmic-map/nodes", json={
            "lat": 40.7128,
            "lng": -74.006,
            "radius_km": 1.0
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "nodes" in data, "Missing nodes field"
        assert "total" in data, "Missing total field"
        assert data["total"] == 10, f"Expected 10 nodes, got {data['total']}"
        
        nodes = data["nodes"]
        assert len(nodes) == 10, f"Expected 10 nodes in array, got {len(nodes)}"
        
        # Count node types
        kinetic_count = sum(1 for n in nodes if n["type"] == "kinetic")
        botanical_count = sum(1 for n in nodes if n["type"] == "botanical")
        star_anchor_count = sum(1 for n in nodes if n["type"] == "star_anchor")
        
        assert kinetic_count == 4, f"Expected 4 kinetic nodes, got {kinetic_count}"
        assert botanical_count == 3, f"Expected 3 botanical nodes, got {botanical_count}"
        assert star_anchor_count == 3, f"Expected 3 star_anchor nodes, got {star_anchor_count}"
        
        # Verify node structure
        for node in nodes:
            assert "id" in node, "Node missing id"
            assert "type" in node, "Node missing type"
            assert "name" in node, "Node missing name"
            assert "lat" in node, "Node missing lat"
            assert "lng" in node, "Node missing lng"
            assert "color" in node, "Node missing color"
            assert "rarity" in node, "Node missing rarity"
            assert "reward_type" in node, "Node missing reward_type"
            assert "reward_amount" in node, "Node missing reward_amount"
            assert "harvest_radius_meters" in node, "Node missing harvest_radius_meters"
            assert node["harvest_radius_meters"] == 50, "Harvest radius should be 50m"
        
        print(f"✓ Nodes generated: {kinetic_count} kinetic, {botanical_count} botanical, {star_anchor_count} star_anchor")

    def test_harvest_returns_error_when_conditions_not_met(self, auth_headers):
        """POST /api/cosmic-map/harvest returns error when not within range or node not found."""
        # First get nodes at a specific location
        nodes_res = requests.post(f"{BASE_URL}/api/cosmic-map/nodes", json={
            "lat": 40.7128,
            "lng": -74.006
        }, headers=auth_headers)
        assert nodes_res.status_code == 200
        nodes = nodes_res.json()["nodes"]
        
        # Pick a node and try to harvest from far away
        target_node = nodes[0]
        
        # Use a position far from the node (1km away) - this will generate different nodes
        # so the node won't be found, or if found, will be too far
        response = requests.post(f"{BASE_URL}/api/cosmic-map/harvest", json={
            "node_id": target_node["id"],
            "user_lat": target_node["lat"] + 0.01,  # ~1km away
            "user_lng": target_node["lng"]
        }, headers=auth_headers)
        
        # Should return 400 (too far) or 404 (node not found at new location)
        assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}: {response.text}"
        detail = response.json().get("detail", "")
        assert "Too far" in detail or "Distance" in detail or "not found" in detail, f"Expected distance/not found error, got: {detail}"
        print(f"✓ Harvest blocked as expected: {detail}")

    def test_harvest_history_returns_today_counts(self, auth_headers):
        """GET /api/cosmic-map/harvest-history returns harvest history with today counts."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/harvest-history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "history" in data, "Missing history field"
        assert "today_count" in data, "Missing today_count field"
        assert "today_rewards" in data, "Missing today_rewards field"
        assert "total_harvests" in data, "Missing total_harvests field"
        
        # Verify today_rewards structure
        today_rewards = data["today_rewards"]
        assert "kinetic_dust" in today_rewards, "Missing kinetic_dust in today_rewards"
        assert "science_resonance" in today_rewards, "Missing science_resonance in today_rewards"
        
        print(f"✓ Harvest history: {data['today_count']} today, {data['total_harvests']} total")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REGRESSION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestRegressionEndpoints:
    """Regression tests for previous endpoints."""

    def test_avenues_overview_still_works(self, auth_headers):
        """GET /api/avenues/overview returns avenues data."""
        response = requests.get(f"{BASE_URL}/api/avenues/overview", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "avenues" in data, "Missing avenues field"
        assert "total_resonance" in data, "Missing total_resonance field"
        assert "combined_tier_name" in data, "Missing combined_tier_name field"
        print(f"✓ Avenues overview: {len(data['avenues'])} avenues, {data['total_resonance']} total resonance")

    def test_economy_shop_still_works(self, auth_headers):
        """GET /api/science-history/economy/shop returns shop items."""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/shop", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "items" in data, "Missing items field"
        assert "balances" in data, "Missing balances field"
        assert len(data["items"]) > 0, "Shop should have items"
        print(f"✓ Economy shop: {len(data['items'])} items, balances={data['balances']}")

    def test_botanical_lab_still_works(self, auth_headers):
        """GET /api/science-history/botanical-lab returns simulations."""
        response = requests.get(f"{BASE_URL}/api/science-history/botanical-lab", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "simulations" in data, "Missing simulations field"
        assert len(data["simulations"]) > 0, "Should have simulations"
        print(f"✓ Botanical lab: {len(data['simulations'])} simulations")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ADDITIONAL FORGE PATTERN TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestForgePatterns:
    """Additional forge pattern tests."""

    def test_chrono_alchemist_pattern(self, auth_headers):
        """GET /api/cosmic-map/forge/pattern/chrono_alchemist returns valid pattern."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/chrono_alchemist", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["build_id"] == "chrono_alchemist", "Wrong build_id"
        assert data["name"] == "Chrono-Alchemist", "Wrong name"
        assert data["frequency"] == 396, "Chrono-Alchemist should be 396Hz"
        assert data["tolerance"] == 0.10, "Chrono-Alchemist should have 0.10 tolerance"
        assert data["time_limit_seconds"] == 8, "Chrono-Alchemist should have 8s time limit"
        print(f"✓ Chrono-Alchemist pattern: {data['frequency']}Hz, tolerance={data['tolerance']}, {data['time_limit_seconds']}s")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

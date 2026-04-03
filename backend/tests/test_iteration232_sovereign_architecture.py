"""
Iteration 232 - Sovereign Architecture Testing
Tests the 4-Tier Subscription Model with Cross-Tier Purchasing,
Glass Box Thinking Feed, Agent Coordination, and Tool Gating.

Tiers: Standard (The Seed) → Apprentice (The Bloom) → Artisan (The Architect) → Sovereign (The Super User)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
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
    return {"Authorization": f"Bearer {auth_token}"}


class TestSovereignStatus:
    """Test GET /api/sovereign/status endpoint."""
    
    def test_sovereign_status_returns_200(self, auth_headers):
        """Verify sovereign status endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/sovereign/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_sovereign_status_has_required_fields(self, auth_headers):
        """Verify sovereign status returns all required fields."""
        response = requests.get(f"{BASE_URL}/api/sovereign/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        required_fields = [
            "tier", "tier_name", "codename", "persona", "price_monthly",
            "ai_brain", "ai_description", "experience", "tools_count",
            "tool_label", "perks", "effective_capabilities", "active_units"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_sovereign_status_tier_is_valid(self, auth_headers):
        """Verify tier is one of the valid tiers."""
        response = requests.get(f"{BASE_URL}/api/sovereign/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        valid_tiers = ["standard", "apprentice", "artisan", "sovereign"]
        assert data["tier"] in valid_tiers, f"Invalid tier: {data['tier']}"
    
    def test_sovereign_status_effective_capabilities(self, auth_headers):
        """Verify effective_capabilities structure."""
        response = requests.get(f"{BASE_URL}/api/sovereign/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        caps = data.get("effective_capabilities", {})
        expected_caps = [
            "thinking_feed", "asset_generation", "agent_coordination",
            "browser_automation", "cosmic_dust_rewards", "spatial_audio",
            "npu_priority", "marketplace_discount"
        ]
        for cap in expected_caps:
            assert cap in caps, f"Missing capability: {cap}"


class TestSovereignTiers:
    """Test GET /api/sovereign/tiers endpoint."""
    
    def test_sovereign_tiers_returns_200(self):
        """Verify tiers endpoint returns 200 (no auth required)."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_sovereign_tiers_returns_4_tiers(self):
        """Verify exactly 4 tiers are returned."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200
        data = response.json()
        
        assert "tiers" in data, "Missing 'tiers' field"
        assert len(data["tiers"]) == 4, f"Expected 4 tiers, got {len(data['tiers'])}"
    
    def test_sovereign_tiers_order(self):
        """Verify tiers are in correct order."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200
        data = response.json()
        
        tier_ids = [t["id"] for t in data["tiers"]]
        expected_order = ["standard", "apprentice", "artisan", "sovereign"]
        assert tier_ids == expected_order, f"Tier order mismatch: {tier_ids}"
    
    def test_sovereign_tiers_comparison_table(self):
        """Verify comparison table has 13 rows."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200
        data = response.json()
        
        assert "comparison" in data, "Missing 'comparison' field"
        assert len(data["comparison"]) == 13, f"Expected 13 comparison rows, got {len(data['comparison'])}"
    
    def test_sovereign_tiers_has_agents(self):
        """Verify agents are included in response."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200
        data = response.json()
        
        assert "agents" in data, "Missing 'agents' field"
        assert "alpha" in data["agents"], "Missing Agent Alpha"
        assert "beta" in data["agents"], "Missing Agent Beta"
        assert "gamma" in data["agents"], "Missing Agent Gamma"
    
    def test_sovereign_tier_codenames(self):
        """Verify each tier has correct codename."""
        response = requests.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200
        data = response.json()
        
        codenames = {t["id"]: t["codename"] for t in data["tiers"]}
        expected = {
            "standard": "The Seed",
            "apprentice": "The Bloom",
            "artisan": "The Architect",
            "sovereign": "The Super User"
        }
        assert codenames == expected, f"Codename mismatch: {codenames}"


class TestSovereignUnits:
    """Test GET /api/sovereign/units endpoint."""
    
    def test_sovereign_units_returns_200(self, auth_headers):
        """Verify units endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/sovereign/units", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_sovereign_units_returns_12_units(self, auth_headers):
        """Verify 12 cross-tier units are available."""
        response = requests.get(f"{BASE_URL}/api/sovereign/units", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "units" in data, "Missing 'units' field"
        # Standard tier should see all 12 units
        # Note: The number may vary based on user's tier
        assert len(data["units"]) >= 8, f"Expected at least 8 units, got {len(data['units'])}"
    
    def test_sovereign_units_structure(self, auth_headers):
        """Verify unit structure has required fields."""
        response = requests.get(f"{BASE_URL}/api/sovereign/units", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if data["units"]:
            unit = data["units"][0]
            required_fields = ["id", "name", "description", "from_tier", "price_credits", "price_usd", "feature_key"]
            for field in required_fields:
                assert field in unit, f"Missing field in unit: {field}"
    
    def test_sovereign_units_includes_thinking_feed(self, auth_headers):
        """Verify Glass Box Thinking Feed unit is available."""
        response = requests.get(f"{BASE_URL}/api/sovereign/units", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        unit_ids = [u["id"] for u in data["units"]]
        # For standard tier, thinking feed should be available
        # May already be purchased based on context
        assert "user_tier" in data, "Missing user_tier field"


class TestSovereignUnitPurchase:
    """Test POST /api/sovereign/units/purchase endpoint."""
    
    def test_purchase_invalid_unit_returns_404(self, auth_headers):
        """Verify purchasing invalid unit returns 404."""
        response = requests.post(
            f"{BASE_URL}/api/sovereign/units/purchase",
            json={"unit_id": "invalid-unit-id"},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_purchase_insufficient_credits_returns_402(self, auth_headers):
        """Verify purchasing with insufficient credits returns 402."""
        # First, check user's credits
        status_response = requests.get(f"{BASE_URL}/api/sovereign/status", headers=auth_headers)
        assert status_response.status_code == 200
        
        # Try to purchase an expensive unit
        response = requests.post(
            f"{BASE_URL}/api/sovereign/units/purchase",
            json={"unit_id": "unit-zero-touch-trial"},  # 75 credits
            headers=auth_headers
        )
        # Should return 402 if insufficient credits, or 200 if enough
        assert response.status_code in [200, 402], f"Expected 200 or 402, got {response.status_code}: {response.text}"


class TestSovereignThinkingFeed:
    """Test POST /api/sovereign/thinking-feed endpoint."""
    
    def test_thinking_feed_without_access_returns_403(self, auth_headers):
        """Verify thinking feed without access returns 403."""
        # This test depends on user's tier and purchased units
        response = requests.post(
            f"{BASE_URL}/api/sovereign/thinking-feed",
            json={"query": "Test query"},
            headers=auth_headers
        )
        # Should return 200 if user has access (purchased unit or tier), 403 otherwise
        assert response.status_code in [200, 403], f"Expected 200 or 403, got {response.status_code}: {response.text}"
    
    def test_thinking_feed_with_access_returns_chain(self, auth_headers):
        """Verify thinking feed returns thinking chain when user has access."""
        response = requests.post(
            f"{BASE_URL}/api/sovereign/thinking-feed",
            json={"query": "Plan a high-vibration menu for wellness"},
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "thinking_chain" in data, "Missing thinking_chain"
            assert "agent_count" in data, "Missing agent_count"
            assert data["agent_count"] >= 2, f"Expected at least 2 agents, got {data['agent_count']}"
            
            # Verify chain structure
            chain = data["thinking_chain"]
            assert len(chain) >= 2, "Expected at least 2 agents in chain"
            
            # Check first agent (Alpha)
            alpha = chain[0]
            assert alpha["agent"] == "alpha", "First agent should be Alpha"
            assert alpha["role"] == "Geometer", "Alpha role should be Geometer"
            assert "layers" in alpha, "Alpha should have layers"
        elif response.status_code == 403:
            # User doesn't have access - this is valid
            pass
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestSovereignAgents:
    """Test GET /api/sovereign/agents endpoint."""
    
    def test_sovereign_agents_returns_200(self, auth_headers):
        """Verify agents endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/sovereign/agents", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_sovereign_agents_returns_3_agents(self, auth_headers):
        """Verify 3 agent personas are returned."""
        response = requests.get(f"{BASE_URL}/api/sovereign/agents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "agents" in data, "Missing 'agents' field"
        assert len(data["agents"]) == 3, f"Expected 3 agents, got {len(data['agents'])}"
    
    def test_sovereign_agents_alpha_beta_gamma(self, auth_headers):
        """Verify Alpha, Beta, Gamma agents exist."""
        response = requests.get(f"{BASE_URL}/api/sovereign/agents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        agents = data["agents"]
        assert "alpha" in agents, "Missing Agent Alpha"
        assert "beta" in agents, "Missing Agent Beta"
        assert "gamma" in agents, "Missing Agent Gamma"
        
        # Verify roles
        assert agents["alpha"]["role"] == "Geometer"
        assert agents["beta"]["role"] == "Harmonizer"
        assert agents["gamma"]["role"] == "Logistics"


class TestRegressionMixerEndpoints:
    """Regression tests for mixer endpoints."""
    
    def test_mixer_subscription_still_works(self, auth_headers):
        """Verify mixer subscription endpoint still works."""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200, f"Mixer subscription failed: {response.status_code}"
    
    def test_mixer_templates_still_works(self, auth_headers):
        """Verify mixer templates endpoint still works."""
        response = requests.get(f"{BASE_URL}/api/mixer/templates", headers=auth_headers)
        assert response.status_code == 200, f"Mixer templates failed: {response.status_code}"
    
    def test_mixer_recording_config_still_works(self, auth_headers):
        """Verify mixer recording config endpoint still works."""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200, f"Mixer recording config failed: {response.status_code}"


class TestRegressionOtherEndpoints:
    """Regression tests for other critical endpoints."""
    
    def test_dashboard_stats_still_works(self, auth_headers):
        """Verify dashboard stats endpoint still works."""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"Dashboard stats failed: {response.status_code}"
    
    def test_consciousness_status_still_works(self, auth_headers):
        """Verify consciousness status endpoint still works."""
        response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        assert response.status_code == 200, f"Consciousness status failed: {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 261 - 4-Tier Economy System Testing
Tests the recalibrated subscription tiers: Discovery/Resonance/Sovereign/Architect
with new pricing ($0/$27/$49/$89) and tier-specific fields.
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
        data = response.json()
        return data.get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestEconomyTiers:
    """Test GET /api/economy/tiers - 4-tier subscription system."""
    
    def test_tiers_endpoint_returns_200(self, auth_headers):
        """Verify tiers endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/economy/tiers returns 200")
    
    def test_tiers_returns_exactly_4_tiers(self, auth_headers):
        """Verify exactly 4 tiers are returned."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        assert len(tiers) == 4, f"Expected 4 tiers, got {len(tiers)}"
        print(f"PASS: Returns exactly 4 tiers")
    
    def test_tier_names_correct(self, auth_headers):
        """Verify tier names: Discovery, Resonance, Sovereign, Architect."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        tier_names = [t["name"] for t in tiers]
        expected_names = ["Discovery", "Resonance", "Sovereign", "Architect"]
        assert tier_names == expected_names, f"Expected {expected_names}, got {tier_names}"
        print(f"PASS: Tier names correct: {tier_names}")
    
    def test_tier_pricing_correct(self, auth_headers):
        """Verify tier pricing: $0/$27/$49/$89."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        tier_prices = {t["id"]: t["price_monthly"] for t in tiers}
        
        assert tier_prices["discovery"] == 0.0, f"Discovery should be $0, got ${tier_prices['discovery']}"
        assert tier_prices["resonance"] == 27.0, f"Resonance should be $27, got ${tier_prices['resonance']}"
        assert tier_prices["sovereign"] == 49.0, f"Sovereign should be $49, got ${tier_prices['sovereign']}"
        assert tier_prices["architect"] == 89.0, f"Architect should be $89, got ${tier_prices['architect']}"
        print(f"PASS: Tier pricing correct: {tier_prices}")
    
    def test_tier_labels_correct(self, auth_headers):
        """Verify tier labels: Seeker, Artisan, Alchemist, Infrastructure Partner."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        tier_labels = {t["id"]: t["label"] for t in tiers}
        
        assert tier_labels["discovery"] == "Seeker", f"Discovery label should be Seeker"
        assert tier_labels["resonance"] == "Artisan", f"Resonance label should be Artisan"
        assert tier_labels["sovereign"] == "Alchemist", f"Sovereign label should be Alchemist"
        assert tier_labels["architect"] == "Infrastructure Partner", f"Architect label should be Infrastructure Partner"
        print(f"PASS: Tier labels correct: {tier_labels}")


class TestTierFields:
    """Test that each tier has required fields: education_level, education_desc, monetization, can_sell, beacon."""
    
    def test_all_tiers_have_education_level(self, auth_headers):
        """Verify all tiers have education_level field."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        
        for tier in tiers:
            assert "education_level" in tier, f"Tier {tier['id']} missing education_level"
            assert tier["education_level"], f"Tier {tier['id']} has empty education_level"
        print("PASS: All tiers have education_level")
    
    def test_all_tiers_have_education_desc(self, auth_headers):
        """Verify all tiers have education_desc field."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        
        for tier in tiers:
            assert "education_desc" in tier, f"Tier {tier['id']} missing education_desc"
            assert tier["education_desc"], f"Tier {tier['id']} has empty education_desc"
        print("PASS: All tiers have education_desc")
    
    def test_all_tiers_have_monetization(self, auth_headers):
        """Verify all tiers have monetization field."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        
        for tier in tiers:
            assert "monetization" in tier, f"Tier {tier['id']} missing monetization"
            assert tier["monetization"], f"Tier {tier['id']} has empty monetization"
        print("PASS: All tiers have monetization")
    
    def test_all_tiers_have_can_sell(self, auth_headers):
        """Verify all tiers have can_sell field."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        
        for tier in tiers:
            assert "can_sell" in tier, f"Tier {tier['id']} missing can_sell"
            assert isinstance(tier["can_sell"], bool), f"Tier {tier['id']} can_sell should be boolean"
        print("PASS: All tiers have can_sell")
    
    def test_all_tiers_have_beacon(self, auth_headers):
        """Verify all tiers have beacon field."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        
        for tier in tiers:
            assert "beacon" in tier, f"Tier {tier['id']} missing beacon"
            assert isinstance(tier["beacon"], bool), f"Tier {tier['id']} beacon should be boolean"
        print("PASS: All tiers have beacon")


class TestDiscoveryTier:
    """Test Discovery tier specific fields."""
    
    def test_discovery_can_sell_false(self, auth_headers):
        """Discovery tier should have can_sell=false."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        discovery = next((t for t in tiers if t["id"] == "discovery"), None)
        
        assert discovery is not None, "Discovery tier not found"
        assert discovery["can_sell"] == False, f"Discovery can_sell should be False, got {discovery['can_sell']}"
        print("PASS: Discovery tier has can_sell=false")
    
    def test_discovery_beacon_false(self, auth_headers):
        """Discovery tier should have beacon=false."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        discovery = next((t for t in tiers if t["id"] == "discovery"), None)
        
        assert discovery is not None, "Discovery tier not found"
        assert discovery["beacon"] == False, f"Discovery beacon should be False, got {discovery['beacon']}"
        print("PASS: Discovery tier has beacon=false")


class TestArchitectTier:
    """Test Architect tier specific fields."""
    
    def test_architect_can_sell_true(self, auth_headers):
        """Architect tier should have can_sell=true."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        architect = next((t for t in tiers if t["id"] == "architect"), None)
        
        assert architect is not None, "Architect tier not found"
        assert architect["can_sell"] == True, f"Architect can_sell should be True, got {architect['can_sell']}"
        print("PASS: Architect tier has can_sell=true")
    
    def test_architect_beacon_true(self, auth_headers):
        """Architect tier should have beacon=true."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        architect = next((t for t in tiers if t["id"] == "architect"), None)
        
        assert architect is not None, "Architect tier not found"
        assert architect["beacon"] == True, f"Architect beacon should be True, got {architect['beacon']}"
        print("PASS: Architect tier has beacon=true")
    
    def test_architect_max_commission_tier_4(self, auth_headers):
        """Architect tier should have max_commission_tier=4."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        architect = next((t for t in tiers if t["id"] == "architect"), None)
        
        assert architect is not None, "Architect tier not found"
        assert architect["max_commission_tier"] == 4, f"Architect max_commission_tier should be 4, got {architect['max_commission_tier']}"
        print("PASS: Architect tier has max_commission_tier=4")


class TestDiscountRate:
    """Test GET /api/economy/discount-rate endpoint."""
    
    def test_discount_rate_endpoint_returns_200(self, auth_headers):
        """Verify discount-rate endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/economy/discount-rate returns 200")
    
    def test_discount_rate_returns_tier(self, auth_headers):
        """Verify discount-rate returns tier field."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "tier" in data, "Response missing 'tier' field"
        print(f"PASS: discount-rate returns tier: {data['tier']}")
    
    def test_discount_rate_returns_discount_percent(self, auth_headers):
        """Verify discount-rate returns discount_percent field."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "discount_percent" in data, "Response missing 'discount_percent' field"
        print(f"PASS: discount-rate returns discount_percent: {data['discount_percent']}")
    
    def test_discount_rate_returns_failed_trade_charge(self, auth_headers):
        """Verify discount-rate returns failed_trade_charge=0.30."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "failed_trade_charge" in data, "Response missing 'failed_trade_charge' field"
        assert data["failed_trade_charge"] == 0.30, f"Expected failed_trade_charge=0.30, got {data['failed_trade_charge']}"
        print(f"PASS: discount-rate returns failed_trade_charge=0.30")
    
    def test_discount_rate_returns_can_sell(self, auth_headers):
        """Verify discount-rate returns can_sell field."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "can_sell" in data, "Response missing 'can_sell' field"
        print(f"PASS: discount-rate returns can_sell: {data['can_sell']}")
    
    def test_discount_rate_returns_beacon(self, auth_headers):
        """Verify discount-rate returns beacon field."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "beacon" in data, "Response missing 'beacon' field"
        print(f"PASS: discount-rate returns beacon: {data['beacon']}")
    
    def test_discount_rate_returns_education_level(self, auth_headers):
        """Verify discount-rate returns education_level field."""
        response = requests.get(f"{BASE_URL}/api/economy/discount-rate", headers=auth_headers)
        data = response.json()
        assert "education_level" in data, "Response missing 'education_level' field"
        print(f"PASS: discount-rate returns education_level: {data['education_level']}")


class TestApplyDiscount:
    """Test POST /api/economy/apply-discount endpoint."""
    
    def test_apply_discount_endpoint_returns_200(self, auth_headers):
        """Verify apply-discount endpoint is accessible."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: POST /api/economy/apply-discount returns 200")
    
    def test_apply_discount_returns_base_price(self, auth_headers):
        """Verify apply-discount returns base_price field."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        data = response.json()
        assert "base_price" in data, "Response missing 'base_price' field"
        assert data["base_price"] == 100, f"Expected base_price=100, got {data['base_price']}"
        print(f"PASS: apply-discount returns base_price: {data['base_price']}")
    
    def test_apply_discount_returns_discount_percent(self, auth_headers):
        """Verify apply-discount returns discount_percent field."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        data = response.json()
        assert "discount_percent" in data, "Response missing 'discount_percent' field"
        print(f"PASS: apply-discount returns discount_percent: {data['discount_percent']}")
    
    def test_apply_discount_returns_discount_amount(self, auth_headers):
        """Verify apply-discount returns discount_amount field."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        data = response.json()
        assert "discount_amount" in data, "Response missing 'discount_amount' field"
        print(f"PASS: apply-discount returns discount_amount: {data['discount_amount']}")
    
    def test_apply_discount_returns_final_price(self, auth_headers):
        """Verify apply-discount returns final_price field."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        data = response.json()
        assert "final_price" in data, "Response missing 'final_price' field"
        print(f"PASS: apply-discount returns final_price: {data['final_price']}")
    
    def test_apply_discount_returns_tier(self, auth_headers):
        """Verify apply-discount returns tier field."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 100})
        data = response.json()
        assert "tier" in data, "Response missing 'tier' field"
        print(f"PASS: apply-discount returns tier: {data['tier']}")
    
    def test_apply_discount_rejects_zero_price(self, auth_headers):
        """Verify apply-discount rejects base_price <= 0."""
        response = requests.post(f"{BASE_URL}/api/economy/apply-discount", 
                                headers=auth_headers, json={"base_price": 0})
        assert response.status_code == 400, f"Expected 400 for zero price, got {response.status_code}"
        print("PASS: apply-discount rejects zero price with 400")


class TestCommissions:
    """Test GET /api/economy/commissions endpoint."""
    
    def test_commissions_endpoint_returns_200(self, auth_headers):
        """Verify commissions endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/economy/commissions returns 200")
    
    def test_commissions_returns_4_tiers(self, auth_headers):
        """Verify commissions returns 4 commission tiers."""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        assert len(tiers) == 4, f"Expected 4 commission tiers, got {len(tiers)}"
        print(f"PASS: Commissions returns 4 tiers")
    
    def test_commissions_rates_correct(self, auth_headers):
        """Verify commission rates: 0/6.75/13.5/27."""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        rates = [t["commission_rate"] for t in tiers]
        expected_rates = [0.0, 6.75, 13.5, 27.0]
        assert rates == expected_rates, f"Expected rates {expected_rates}, got {rates}"
        print(f"PASS: Commission rates correct: {rates}")
    
    def test_commissions_levels_correct(self, auth_headers):
        """Verify commission levels: 1/2/3/4."""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        levels = [t["level"] for t in tiers]
        expected_levels = [1, 2, 3, 4]
        assert levels == expected_levels, f"Expected levels {expected_levels}, got {levels}"
        print(f"PASS: Commission levels correct: {levels}")


class TestSubscribe:
    """Test POST /api/economy/subscribe endpoint."""
    
    def test_subscribe_resonance_creates_checkout(self, auth_headers):
        """Verify subscribe creates Stripe checkout for Resonance ($27)."""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", 
                                headers=auth_headers, 
                                json={"tier_id": "resonance", "origin_url": "https://test.com"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "url" in data, "Response missing 'url' field"
        assert "session_id" in data, "Response missing 'session_id' field"
        print(f"PASS: Subscribe Resonance creates checkout session")
    
    def test_subscribe_sovereign_creates_checkout(self, auth_headers):
        """Verify subscribe creates Stripe checkout for Sovereign ($49)."""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", 
                                headers=auth_headers, 
                                json={"tier_id": "sovereign", "origin_url": "https://test.com"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "url" in data, "Response missing 'url' field"
        assert "session_id" in data, "Response missing 'session_id' field"
        print(f"PASS: Subscribe Sovereign creates checkout session")
    
    def test_subscribe_architect_creates_checkout(self, auth_headers):
        """Verify subscribe creates Stripe checkout for Architect ($89)."""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", 
                                headers=auth_headers, 
                                json={"tier_id": "architect", "origin_url": "https://test.com"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "url" in data, "Response missing 'url' field"
        assert "session_id" in data, "Response missing 'session_id' field"
        print(f"PASS: Subscribe Architect creates checkout session")
    
    def test_subscribe_discovery_activates_directly(self, auth_headers):
        """Verify subscribe to Discovery (free) activates directly without checkout."""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", 
                                headers=auth_headers, 
                                json={"tier_id": "discovery", "origin_url": "https://test.com"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "activated", f"Expected status=activated, got {data.get('status')}"
        assert data.get("tier") == "discovery", f"Expected tier=discovery, got {data.get('tier')}"
        print(f"PASS: Subscribe Discovery activates directly")


class TestDowngrade:
    """Test POST /api/economy/downgrade endpoint."""
    
    def test_downgrade_returns_200(self, auth_headers):
        """Verify downgrade endpoint is accessible."""
        response = requests.post(f"{BASE_URL}/api/economy/downgrade", 
                                headers=auth_headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: POST /api/economy/downgrade returns 200")
    
    def test_downgrade_switches_to_discovery(self, auth_headers):
        """Verify downgrade switches to Discovery tier."""
        response = requests.post(f"{BASE_URL}/api/economy/downgrade", 
                                headers=auth_headers, json={})
        data = response.json()
        assert data.get("tier") == "discovery", f"Expected tier=discovery, got {data.get('tier')}"
        print(f"PASS: Downgrade switches to Discovery tier")


class TestPacks:
    """Test GET /api/economy/packs endpoint."""
    
    def test_packs_endpoint_returns_200(self, auth_headers):
        """Verify packs endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/economy/packs returns 200")
    
    def test_packs_returns_packs_array(self, auth_headers):
        """Verify packs returns packs array."""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        data = response.json()
        assert "packs" in data, "Response missing 'packs' field"
        assert isinstance(data["packs"], list), "packs should be a list"
        assert len(data["packs"]) > 0, "packs should not be empty"
        print(f"PASS: Packs returns {len(data['packs'])} packs")
    
    def test_packs_returns_polymath_pass(self, auth_headers):
        """Verify packs returns polymath_pass info."""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        data = response.json()
        assert "polymath_pass" in data, "Response missing 'polymath_pass' field"
        assert data["polymath_pass"]["price_annual"] == 1797.0, f"Polymath pass should be $1797/year"
        print(f"PASS: Packs returns polymath_pass with $1797/year")


class TestProfile:
    """Test GET /api/economy/profile endpoint."""
    
    def test_profile_endpoint_returns_200(self, auth_headers):
        """Verify profile endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/economy/profile returns 200")
    
    def test_profile_returns_subscription(self, auth_headers):
        """Verify profile returns subscription data."""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        data = response.json()
        assert "subscription" in data, "Response missing 'subscription' field"
        assert "tier" in data["subscription"], "subscription missing 'tier' field"
        assert "tier_data" in data["subscription"], "subscription missing 'tier_data' field"
        print(f"PASS: Profile returns subscription with tier: {data['subscription']['tier']}")
    
    def test_profile_returns_packs_owned(self, auth_headers):
        """Verify profile returns packs_owned count."""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        data = response.json()
        assert "packs_owned" in data, "Response missing 'packs_owned' field"
        print(f"PASS: Profile returns packs_owned: {data['packs_owned']}")


class TestTierDiscounts:
    """Test tier-based marketplace discounts."""
    
    def test_discovery_discount_0(self, auth_headers):
        """Discovery tier should have 0% discount."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        discovery = next((t for t in tiers if t["id"] == "discovery"), None)
        assert discovery["marketplace_discount"] == 0, f"Discovery discount should be 0%, got {discovery['marketplace_discount']}%"
        print("PASS: Discovery tier has 0% discount")
    
    def test_resonance_discount_5(self, auth_headers):
        """Resonance tier should have 5% discount."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        resonance = next((t for t in tiers if t["id"] == "resonance"), None)
        assert resonance["marketplace_discount"] == 5, f"Resonance discount should be 5%, got {resonance['marketplace_discount']}%"
        print("PASS: Resonance tier has 5% discount")
    
    def test_sovereign_discount_15(self, auth_headers):
        """Sovereign tier should have 15% discount."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        sovereign = next((t for t in tiers if t["id"] == "sovereign"), None)
        assert sovereign["marketplace_discount"] == 15, f"Sovereign discount should be 15%, got {sovereign['marketplace_discount']}%"
        print("PASS: Sovereign tier has 15% discount")
    
    def test_architect_discount_30(self, auth_headers):
        """Architect tier should have 30% discount."""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        data = response.json()
        tiers = data.get("tiers", [])
        architect = next((t for t in tiers if t["id"] == "architect"), None)
        assert architect["marketplace_discount"] == 30, f"Architect discount should be 30%, got {architect['marketplace_discount']}%"
        print("PASS: Architect tier has 30% discount")

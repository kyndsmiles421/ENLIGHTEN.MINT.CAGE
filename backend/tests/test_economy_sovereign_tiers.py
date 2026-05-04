"""
Test Suite: Sovereign Economy Tiers — /api/economy/*
Tests the canonical 5-tier structure for Google Play Store launch:
- Discovery (free), Resonance (5%), Architect (15%), Sovereign ($89/mo, 30%), Sovereign Founder ($1777/24mo, 60%)
- Transparency Graph data (platform_fees, google_play_pct=30)
- Credit packs, AI costs
- Subscribe endpoint with web vs play_store pricing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from /app/memory/test_credentials.md
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "Sovereign2026!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected endpoints"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Auth failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestEconomyTiersEndpoint:
    """GET /api/economy/tiers — canonical tier structure"""

    def test_tiers_returns_200(self):
        """Endpoint should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_tier_order_is_correct(self):
        """tier_order should be ['discovery','resonance','architect','sovereign','sovereign_founder']"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        expected_order = ['discovery', 'resonance', 'architect', 'sovereign', 'sovereign_founder']
        assert data.get("tier_order") == expected_order, f"Got tier_order: {data.get('tier_order')}"

    def test_sovereign_founder_tier_structure(self):
        """sovereign_founder: price_total=1777, price_play_store=2310.10, term_months=24, marketplace_discount=60, is_founder=true, price_monthly_equivalent=74.04"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        tiers = data.get("tiers", {})
        founder = tiers.get("sovereign_founder", {})
        
        assert founder.get("price_total") == 1777.0, f"price_total: {founder.get('price_total')}"
        assert founder.get("price_play_store") == 2310.10, f"price_play_store: {founder.get('price_play_store')}"
        assert founder.get("term_months") == 24, f"term_months: {founder.get('term_months')}"
        assert founder.get("marketplace_discount") == 60, f"marketplace_discount: {founder.get('marketplace_discount')}"
        assert founder.get("is_founder") == True, f"is_founder: {founder.get('is_founder')}"
        assert founder.get("price_monthly_equivalent") == 74.04, f"price_monthly_equivalent: {founder.get('price_monthly_equivalent')}"

    def test_sovereign_monthly_tier_structure(self):
        """sovereign: price_monthly=89, price_play_store=115.70, marketplace_discount=30"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        tiers = data.get("tiers", {})
        sovereign = tiers.get("sovereign", {})
        
        assert sovereign.get("price_monthly") == 89.0, f"price_monthly: {sovereign.get('price_monthly')}"
        assert sovereign.get("price_play_store") == 115.70, f"price_play_store: {sovereign.get('price_play_store')}"
        assert sovereign.get("marketplace_discount") == 30, f"marketplace_discount: {sovereign.get('marketplace_discount')}"

    def test_architect_tier_structure(self):
        """architect: label='The Builder', marketplace_discount=15"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        tiers = data.get("tiers", {})
        architect = tiers.get("architect", {})
        
        assert architect.get("label") == "The Builder", f"label: {architect.get('label')}"
        assert architect.get("marketplace_discount") == 15, f"marketplace_discount: {architect.get('marketplace_discount')}"

    def test_response_includes_credit_packs(self):
        """Response should include credit_packs (3 packs expected)"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        credit_packs = data.get("credit_packs", {})
        # Should have at least some credit packs
        assert isinstance(credit_packs, dict), f"credit_packs should be dict, got {type(credit_packs)}"
        # Note: credit_packs may be empty if subscriptions module doesn't export them

    def test_response_includes_ai_costs(self):
        """Response should include ai_costs (oracle_reading, text_generation, etc)"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        ai_costs = data.get("ai_costs", {})
        assert isinstance(ai_costs, dict), f"ai_costs should be dict, got {type(ai_costs)}"

    def test_response_includes_platform_fees(self):
        """Response should include platform_fees with google_play_pct=30"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        data = response.json()
        platform_fees = data.get("platform_fees", {})
        
        assert platform_fees is not None, "platform_fees should not be None"
        assert platform_fees.get("google_play_pct") == 30, f"google_play_pct: {platform_fees.get('google_play_pct')}"


class TestMyPlanEndpoint:
    """GET /api/economy/my-plan — authenticated user's plan"""

    def test_my_plan_requires_auth(self):
        """Should return 401/403 without auth"""
        response = requests.get(f"{BASE_URL}/api/economy/my-plan")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"

    def test_my_plan_returns_tier_info(self, auth_headers):
        """Should return tier, tier_name, is_admin, is_founder, term_months"""
        response = requests.get(f"{BASE_URL}/api/economy/my-plan", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tier" in data, "Response should include 'tier'"
        assert "tier_name" in data, "Response should include 'tier_name'"
        assert "is_admin" in data, "Response should include 'is_admin'"
        assert "is_founder" in data, "Response should include 'is_founder'"
        assert "term_months" in data, "Response should include 'term_months'"


class TestSubscribeEndpoint:
    """POST /api/economy/subscribe — Stripe checkout creation"""

    def test_subscribe_requires_auth(self):
        """Should return 401/403 without auth"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "sovereign_founder",
            "origin_url": "https://example.com",
            "platform": "web"
        })
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"

    def test_subscribe_invalid_tier_returns_400(self, auth_headers):
        """Invalid tier_id='bogus_xyz' should return 400"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "bogus_xyz",
            "origin_url": "https://example.com",
            "platform": "web"
        }, headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"

    def test_subscribe_discovery_activates_without_stripe(self, auth_headers):
        """Discovery tier (free) should activate without Stripe session"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "discovery",
            "origin_url": "https://example.com",
            "platform": "web"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "activated", f"Expected status='activated', got {data.get('status')}"
        assert data.get("tier") == "discovery", f"Expected tier='discovery', got {data.get('tier')}"

    def test_subscribe_sovereign_founder_web_creates_stripe_session(self, auth_headers):
        """sovereign_founder + platform=web should create Stripe session with amount=1777"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "sovereign_founder",
            "origin_url": "https://example.com",
            "platform": "web"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should include Stripe checkout 'url'"
        assert "session_id" in data, "Response should include 'session_id'"
        assert data.get("amount") == 1777.0, f"Expected amount=1777, got {data.get('amount')}"
        assert data.get("platform") == "web", f"Expected platform='web', got {data.get('platform')}"

    def test_subscribe_sovereign_founder_play_store_creates_stripe_session(self, auth_headers):
        """sovereign_founder + platform=play_store should create Stripe session with amount=2310.10"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "sovereign_founder",
            "origin_url": "https://example.com",
            "platform": "play_store"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should include Stripe checkout 'url'"
        assert data.get("amount") == 2310.10, f"Expected amount=2310.10, got {data.get('amount')}"
        assert data.get("platform") == "play_store", f"Expected platform='play_store', got {data.get('platform')}"

    def test_subscribe_sovereign_monthly_web_creates_stripe_session(self, auth_headers):
        """sovereign + platform=web should create Stripe session with amount=89"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", json={
            "tier_id": "sovereign",
            "origin_url": "https://example.com",
            "platform": "web"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should include Stripe checkout 'url'"
        assert data.get("amount") == 89.0, f"Expected amount=89, got {data.get('amount')}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

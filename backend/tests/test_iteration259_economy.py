"""
Iteration 259 - Dual-Track Economy System Tests
Tests for:
- GET /api/economy/tiers - Subscription tiers (Discovery/Resonance/Sovereign)
- GET /api/economy/packs - Learning packs (Mini/Mastery/Business categories)
- GET /api/economy/commissions - Brokerage commission tiers
- GET /api/economy/profile - Unified economy profile
- POST /api/economy/subscribe - Stripe checkout for paid tiers / free tier activation
- POST /api/economy/purchase-pack - Stripe checkout for pack purchase
- POST /api/economy/purchase-polymath - Stripe checkout for Polymath pass
- POST /api/economy/downgrade - Downgrade to free Discovery tier
- GET /api/economy/checkout-status/{session_id} - Poll payment status
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
    """Get authentication token for test user"""
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
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestEconomyTiers:
    """Tests for GET /api/economy/tiers - Subscription tiers"""
    
    def test_get_tiers_returns_3_tiers(self, auth_headers):
        """GET /api/economy/tiers returns 3 subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tiers" in data, "Response should contain 'tiers' array"
        assert len(data["tiers"]) == 3, f"Expected 3 tiers, got {len(data['tiers'])}"
        
        tier_ids = [t["id"] for t in data["tiers"]]
        assert "discovery" in tier_ids, "Should have discovery tier"
        assert "resonance" in tier_ids, "Should have resonance tier"
        assert "sovereign" in tier_ids, "Should have sovereign tier"
        print(f"✓ GET /api/economy/tiers returns 3 tiers: {tier_ids}")
    
    def test_tiers_have_correct_pricing(self, auth_headers):
        """Tiers have correct pricing: Discovery=Free, Resonance=$44.99, Sovereign=$89.99"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        tiers_by_id = {t["id"]: t for t in data["tiers"]}
        
        assert tiers_by_id["discovery"]["price_monthly"] == 0.0, "Discovery should be free"
        assert tiers_by_id["resonance"]["price_monthly"] == 44.99, "Resonance should be $44.99/mo"
        assert tiers_by_id["sovereign"]["price_monthly"] == 89.99, "Sovereign should be $89.99/mo"
        print("✓ Tier pricing correct: Discovery=Free, Resonance=$44.99, Sovereign=$89.99")
    
    def test_tiers_have_features(self, auth_headers):
        """Each tier has features array"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        for tier in data["tiers"]:
            assert "features" in tier, f"Tier {tier['id']} should have features"
            assert isinstance(tier["features"], list), f"Features should be a list"
            assert len(tier["features"]) > 0, f"Tier {tier['id']} should have at least one feature"
        print("✓ All tiers have features arrays")
    
    def test_tiers_response_includes_current_tier(self, auth_headers):
        """Response includes current_tier and current_tier_data"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "current_tier" in data, "Response should include current_tier"
        assert "current_tier_data" in data, "Response should include current_tier_data"
        assert data["current_tier"] in ["discovery", "resonance", "sovereign"], "current_tier should be valid"
        print(f"✓ Current tier: {data['current_tier']}")


class TestEconomyPacks:
    """Tests for GET /api/economy/packs - Learning packs"""
    
    def test_get_packs_returns_7_packs(self, auth_headers):
        """GET /api/economy/packs returns 7 learning packs"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "packs" in data, "Response should contain 'packs' array"
        assert len(data["packs"]) == 7, f"Expected 7 packs, got {len(data['packs'])}"
        print(f"✓ GET /api/economy/packs returns 7 packs")
    
    def test_packs_have_categories(self, auth_headers):
        """Packs have 3 categories: mini, mastery, business"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        categories = set(p["category"] for p in data["packs"])
        assert "mini" in categories, "Should have mini category"
        assert "mastery" in categories, "Should have mastery category"
        assert "business" in categories, "Should have business category"
        print(f"✓ Packs have categories: {categories}")
    
    def test_packs_have_purchase_status(self, auth_headers):
        """Each pack has purchased status"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        for pack in data["packs"]:
            assert "purchased" in pack, f"Pack {pack['id']} should have purchased status"
            assert isinstance(pack["purchased"], bool), "purchased should be boolean"
        print("✓ All packs have purchased status")
    
    def test_packs_response_includes_polymath(self, auth_headers):
        """Response includes polymath_pass and has_polymath"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "polymath_pass" in data, "Response should include polymath_pass"
        assert "has_polymath" in data, "Response should include has_polymath"
        assert data["polymath_pass"]["price_annual"] == 1797.00, "Polymath pass should be $1,797/year"
        print(f"✓ Polymath pass: ${data['polymath_pass']['price_annual']}/year")
    
    def test_packs_have_category_data(self, auth_headers):
        """Each pack has category_data with name, range, color"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        for pack in data["packs"]:
            assert "category_data" in pack, f"Pack {pack['id']} should have category_data"
            cat_data = pack["category_data"]
            assert "name" in cat_data, "category_data should have name"
            assert "range" in cat_data, "category_data should have range"
            assert "color" in cat_data, "category_data should have color"
        print("✓ All packs have category_data")


class TestEconomyCommissions:
    """Tests for GET /api/economy/commissions - Brokerage commission tiers"""
    
    def test_get_commissions_returns_4_tiers(self, auth_headers):
        """GET /api/economy/commissions returns 4 commission tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tiers" in data, "Response should contain 'tiers' array"
        assert len(data["tiers"]) == 4, f"Expected 4 commission tiers, got {len(data['tiers'])}"
        print(f"✓ GET /api/economy/commissions returns 4 tiers")
    
    def test_commission_rates_correct(self, auth_headers):
        """Commission rates: Observer=0%, Practitioner=6.75%, Professional=13.5%, Sovereign=27%"""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        tiers_by_level = {t["level"]: t for t in data["tiers"]}
        
        assert tiers_by_level[1]["commission_rate"] == 0.0, "Observer (L1) should be 0%"
        assert tiers_by_level[2]["commission_rate"] == 6.75, "Practitioner (L2) should be 6.75%"
        assert tiers_by_level[3]["commission_rate"] == 13.5, "Professional (L3) should be 13.5%"
        assert tiers_by_level[4]["commission_rate"] == 27.0, "Sovereign (L4) should be 27%"
        print("✓ Commission rates correct: 0%, 6.75%, 13.5%, 27%")
    
    def test_commissions_include_max_allowed_level(self, auth_headers):
        """Response includes max_allowed_level based on subscription tier"""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "max_allowed_level" in data, "Response should include max_allowed_level"
        assert data["max_allowed_level"] in [2, 3, 4], "max_allowed_level should be 2, 3, or 4"
        print(f"✓ Max allowed commission level: {data['max_allowed_level']}")
    
    def test_commissions_include_earnings(self, auth_headers):
        """Response includes total_earned and recent_earnings"""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_earned" in data, "Response should include total_earned"
        assert "recent_earnings" in data, "Response should include recent_earnings"
        assert isinstance(data["total_earned"], (int, float)), "total_earned should be numeric"
        assert isinstance(data["recent_earnings"], list), "recent_earnings should be a list"
        print(f"✓ Total earned: ${data['total_earned']}")


class TestEconomyProfile:
    """Tests for GET /api/economy/profile - Unified economy profile"""
    
    def test_get_profile_returns_unified_data(self, auth_headers):
        """GET /api/economy/profile returns unified economy profile"""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "subscription" in data, "Response should include subscription"
        assert "packs_owned" in data, "Response should include packs_owned"
        assert "total_packs" in data, "Response should include total_packs"
        assert "commission_domains" in data, "Response should include commission_domains"
        assert "total_commission_earned" in data, "Response should include total_commission_earned"
        print(f"✓ GET /api/economy/profile returns unified data")
    
    def test_profile_subscription_data(self, auth_headers):
        """Profile includes subscription tier and tier_data"""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        sub = data["subscription"]
        assert "tier" in sub, "subscription should include tier"
        assert "tier_data" in sub, "subscription should include tier_data"
        assert "polymath" in sub, "subscription should include polymath status"
        print(f"✓ Profile subscription tier: {sub['tier']}")


class TestEconomySubscribe:
    """Tests for POST /api/economy/subscribe - Subscription checkout"""
    
    def test_subscribe_discovery_activates_directly(self, auth_headers):
        """POST /api/economy/subscribe with discovery tier activates free tier directly"""
        response = requests.post(
            f"{BASE_URL}/api/economy/subscribe",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"tier_id": "discovery", "origin_url": "https://test.com"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "activated", "Free tier should be activated directly"
        assert data.get("tier") == "discovery", "Should return discovery tier"
        print("✓ Discovery tier activates directly without Stripe")
    
    def test_subscribe_paid_tier_returns_stripe_url(self, auth_headers):
        """POST /api/economy/subscribe with paid tier returns Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/economy/subscribe",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"tier_id": "resonance", "origin_url": "https://test.com"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should include Stripe checkout URL"
        assert "session_id" in data, "Response should include session_id"
        assert "stripe.com" in data["url"] or "checkout" in data["url"], "URL should be Stripe checkout"
        print(f"✓ Resonance tier returns Stripe checkout URL")
    
    def test_subscribe_invalid_tier_returns_400(self, auth_headers):
        """POST /api/economy/subscribe with invalid tier returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/economy/subscribe",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"tier_id": "invalid_tier", "origin_url": "https://test.com"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid tier returns 400")
    
    def test_subscribe_paid_tier_requires_origin_url(self, auth_headers):
        """POST /api/economy/subscribe with paid tier requires origin_url"""
        response = requests.post(
            f"{BASE_URL}/api/economy/subscribe",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"tier_id": "resonance"}  # Missing origin_url
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Paid tier requires origin_url")


class TestEconomyPurchasePack:
    """Tests for POST /api/economy/purchase-pack - Pack purchase checkout"""
    
    def test_purchase_pack_returns_stripe_url(self, auth_headers):
        """POST /api/economy/purchase-pack returns Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/economy/purchase-pack",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"pack_id": "coffee_chemistry", "origin_url": "https://test.com"}
        )
        # Could be 200 (checkout created) or 400 (already purchased)
        if response.status_code == 200:
            data = response.json()
            assert "url" in data, "Response should include Stripe checkout URL"
            assert "session_id" in data, "Response should include session_id"
            print(f"✓ Pack purchase returns Stripe checkout URL")
        elif response.status_code == 400:
            data = response.json()
            assert "already purchased" in data.get("detail", "").lower() or "already" in str(data).lower(), \
                "400 should indicate pack already purchased"
            print("✓ Pack already purchased (expected behavior)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_purchase_invalid_pack_returns_400(self, auth_headers):
        """POST /api/economy/purchase-pack with invalid pack returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/economy/purchase-pack",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"pack_id": "invalid_pack", "origin_url": "https://test.com"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid pack returns 400")


class TestEconomyPurchasePolymath:
    """Tests for POST /api/economy/purchase-polymath - Polymath pass checkout"""
    
    def test_purchase_polymath_returns_stripe_url(self, auth_headers):
        """POST /api/economy/purchase-polymath returns Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/economy/purchase-polymath",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"origin_url": "https://test.com"}
        )
        # Could be 200 (checkout created) or 400 (already a polymath)
        if response.status_code == 200:
            data = response.json()
            assert "url" in data, "Response should include Stripe checkout URL"
            assert "session_id" in data, "Response should include session_id"
            print(f"✓ Polymath purchase returns Stripe checkout URL")
        elif response.status_code == 400:
            data = response.json()
            assert "already" in str(data).lower(), "400 should indicate already a polymath"
            print("✓ Already a Polymath member (expected behavior)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_purchase_polymath_requires_origin_url(self, auth_headers):
        """POST /api/economy/purchase-polymath requires origin_url"""
        response = requests.post(
            f"{BASE_URL}/api/economy/purchase-polymath",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={}  # Missing origin_url
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Polymath purchase requires origin_url")


class TestEconomyDowngrade:
    """Tests for POST /api/economy/downgrade - Downgrade to free tier"""
    
    def test_downgrade_to_discovery(self, auth_headers):
        """POST /api/economy/downgrade switches to free Discovery tier"""
        response = requests.post(
            f"{BASE_URL}/api/economy/downgrade",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("tier") == "discovery", "Should return discovery tier"
        assert "message" in data, "Should include message"
        print("✓ Downgrade to Discovery tier works")
    
    def test_downgrade_persists(self, auth_headers):
        """Downgrade persists - verify via GET /api/economy/tiers"""
        # First downgrade
        requests.post(
            f"{BASE_URL}/api/economy/downgrade",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={}
        )
        
        # Verify via tiers endpoint
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["current_tier"] == "discovery", "Current tier should be discovery after downgrade"
        print("✓ Downgrade persists correctly")


class TestEconomyCheckoutStatus:
    """Tests for GET /api/economy/checkout-status/{session_id} - Payment status polling"""
    
    def test_checkout_status_invalid_session(self, auth_headers):
        """GET /api/economy/checkout-status with invalid session returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/economy/checkout-status/invalid_session_id",
            headers=auth_headers
        )
        # Should return 404 (transaction not found) or error from Stripe
        assert response.status_code in [404, 400, 500], f"Expected error status, got {response.status_code}"
        print("✓ Invalid session returns error status")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

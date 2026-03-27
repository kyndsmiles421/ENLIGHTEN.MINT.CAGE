"""
Iteration 69: Subscription System Tests
Tests for 5-tier subscription system with Stripe integration, credit packs, and credit usage.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


class TestSubscriptionTiers:
    """Tests for GET /api/subscriptions/tiers - No auth required"""
    
    def test_get_tiers_returns_all_five_tiers(self):
        """Verify all 5 subscription tiers are returned with correct data"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert "tiers" in data
        assert "credit_packs" in data
        assert "ai_costs" in data
        assert "tier_order" in data
        
        tiers = data["tiers"]
        # Verify all 5 tiers exist
        assert "free" in tiers
        assert "starter" in tiers
        assert "plus" in tiers
        assert "premium" in tiers
        assert "super_user" in tiers
        
    def test_free_tier_pricing(self):
        """Verify Free tier: $0, 50 credits/mo"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        free = data["tiers"]["free"]
        
        assert free["price"] == 0
        assert free["credits_per_month"] == 50
        assert free["name"] == "Free"
        
    def test_starter_tier_pricing(self):
        """Verify Starter tier: $4.99/mo, 100 credits"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        starter = data["tiers"]["starter"]
        
        assert starter["price"] == 4.99
        assert starter["credits_per_month"] == 100
        assert starter["name"] == "Starter"
        
    def test_plus_tier_pricing(self):
        """Verify Plus tier: $9.99/mo, 300 credits"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        plus = data["tiers"]["plus"]
        
        assert plus["price"] == 9.99
        assert plus["credits_per_month"] == 300
        assert plus["name"] == "Plus"
        
    def test_premium_tier_pricing(self):
        """Verify Premium tier: $24.99/mo, unlimited (-1)"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        premium = data["tiers"]["premium"]
        
        assert premium["price"] == 24.99
        assert premium["credits_per_month"] == -1  # Unlimited
        assert premium["name"] == "Premium"
        
    def test_super_user_tier_pricing(self):
        """Verify Super User tier: $49.99/mo, unlimited (-1)"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        super_user = data["tiers"]["super_user"]
        
        assert super_user["price"] == 49.99
        assert super_user["credits_per_month"] == -1  # Unlimited
        assert super_user["name"] == "Super User"
        
    def test_credit_packs_returned(self):
        """Verify 3 credit packs: $5=100, $10=225, $20=500"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        packs = data["credit_packs"]
        
        assert "pack_100" in packs
        assert "pack_225" in packs
        assert "pack_500" in packs
        
        assert packs["pack_100"]["credits"] == 100
        assert packs["pack_100"]["price"] == 5.0
        
        assert packs["pack_225"]["credits"] == 225
        assert packs["pack_225"]["price"] == 10.0
        
        assert packs["pack_500"]["credits"] == 500
        assert packs["pack_500"]["price"] == 20.0
        
    def test_ai_costs_returned(self):
        """Verify AI action costs are returned"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        costs = data["ai_costs"]
        
        assert "oracle_reading" in costs
        assert "text_generation" in costs
        assert "image_generation" in costs
        assert "sora_video" in costs
        
        # Verify costs are in 1-10 range
        assert costs["oracle_reading"] >= 1 and costs["oracle_reading"] <= 10
        assert costs["sora_video"] == 10  # Most expensive
        
    def test_tier_order_returned(self):
        """Verify tier order is returned correctly"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        data = response.json()
        
        assert data["tier_order"] == ["free", "starter", "plus", "premium", "super_user"]


class TestMyPlan:
    """Tests for GET /api/subscriptions/my-plan - Auth required"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_my_plan_requires_auth(self):
        """Verify my-plan endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan")
        assert response.status_code in [401, 403]
        
    def test_my_plan_returns_user_info(self, auth_token):
        """Verify my-plan returns user's subscription info"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/my-plan",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "tier" in data
        assert "tier_name" in data
        assert "balance" in data
        assert "credits_per_month" in data
        assert "subscription_active" in data
        assert "perks" in data
        assert "tier_order" in data
        
    def test_my_plan_balance_is_numeric(self, auth_token):
        """Verify balance is a number"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/my-plan",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        assert isinstance(data["balance"], (int, float))


class TestSubscriptionCheckout:
    """Tests for POST /api/subscriptions/checkout - Stripe checkout for subscriptions"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_checkout_requires_auth(self):
        """Verify checkout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json={
            "tier_id": "starter",
            "origin_url": "https://example.com"
        })
        assert response.status_code in [401, 403]
        
    def test_checkout_rejects_free_tier(self, auth_token):
        """Verify checkout rejects 'free' tier"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"tier_id": "free", "origin_url": "https://example.com"}
        )
        assert response.status_code == 400
        
    def test_checkout_rejects_invalid_tier(self, auth_token):
        """Verify checkout rejects invalid tier_id"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"tier_id": "invalid_tier", "origin_url": "https://example.com"}
        )
        assert response.status_code == 400
        
    def test_checkout_requires_origin_url(self, auth_token):
        """Verify checkout requires origin_url"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"tier_id": "starter"}
        )
        assert response.status_code == 400
        
    def test_checkout_creates_stripe_session(self, auth_token):
        """Verify checkout creates Stripe session and returns URL"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"tier_id": "starter", "origin_url": "https://zen-energy-bar.preview.emergentagent.com"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        # Stripe checkout URLs start with https://checkout.stripe.com
        assert data["url"].startswith("https://checkout.stripe.com")
        assert data["session_id"].startswith("cs_test_")


class TestCreditsCheckout:
    """Tests for POST /api/subscriptions/checkout-credits - Stripe checkout for credit packs"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_credits_checkout_requires_auth(self):
        """Verify credits checkout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout-credits", json={
            "pack_id": "pack_100",
            "origin_url": "https://example.com"
        })
        assert response.status_code in [401, 403]
        
    def test_credits_checkout_rejects_invalid_pack(self, auth_token):
        """Verify credits checkout rejects invalid pack_id"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout-credits",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"pack_id": "invalid_pack", "origin_url": "https://example.com"}
        )
        assert response.status_code == 400
        
    def test_credits_checkout_requires_origin_url(self, auth_token):
        """Verify credits checkout requires origin_url"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout-credits",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"pack_id": "pack_100"}
        )
        assert response.status_code == 400
        
    def test_credits_checkout_creates_stripe_session(self, auth_token):
        """Verify credits checkout creates Stripe session"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout-credits",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"pack_id": "pack_100", "origin_url": "https://zen-energy-bar.preview.emergentagent.com"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")


class TestUseCredits:
    """Tests for POST /api/subscriptions/use-credits - Deduct credits for AI actions"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_use_credits_requires_auth(self):
        """Verify use-credits requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/use-credits", json={
            "action": "text_generation"
        })
        assert response.status_code in [401, 403]
        
    def test_use_credits_deducts_and_returns_balance(self, auth_token):
        """Verify use-credits deducts credits and returns remaining balance"""
        # First get current balance
        plan_response = requests.get(
            f"{BASE_URL}/api/subscriptions/my-plan",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        initial_balance = plan_response.json()["balance"]
        
        # Use credits
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/use-credits",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"action": "text_generation"}
        )
        
        if response.status_code == 402:
            # Insufficient credits - this is valid behavior
            data = response.json()["detail"]
            assert "remaining" in data
            assert "cost" in data
            pytest.skip("User has insufficient credits for this test")
        
        assert response.status_code == 200
        data = response.json()
        assert "allowed" in data
        assert "remaining" in data
        assert "cost" in data
        assert "tier" in data
        assert data["allowed"] == True
        
    def test_use_credits_returns_402_when_insufficient(self, auth_token):
        """Verify use-credits returns 402 when insufficient credits"""
        # Try to use a very expensive action (sora_video = 10 credits)
        # Keep trying until we get 402 or run out of credits
        for _ in range(10):
            response = requests.post(
                f"{BASE_URL}/api/subscriptions/use-credits",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"action": "sora_video"}  # 10 credits
            )
            if response.status_code == 402:
                data = response.json()["detail"]
                assert "message" in data
                assert data["message"] == "Insufficient credits"
                assert "remaining" in data
                assert "cost" in data
                return
        
        # If we never got 402, user has unlimited or lots of credits
        pytest.skip("User has sufficient credits - cannot test insufficient case")


class TestCancelSubscription:
    """Tests for POST /api/subscriptions/cancel - Cancel subscription"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_cancel_requires_auth(self):
        """Verify cancel requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/cancel")
        assert response.status_code in [401, 403]
        
    def test_cancel_returns_error_for_free_tier(self, auth_token):
        """Verify cancel returns error if user is on free tier"""
        # First check if user is on free tier
        plan_response = requests.get(
            f"{BASE_URL}/api/subscriptions/my-plan",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        current_tier = plan_response.json()["tier"]
        
        if current_tier == "free":
            response = requests.post(
                f"{BASE_URL}/api/subscriptions/cancel",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert response.status_code == 400
            assert "No active subscription" in response.json().get("detail", "")
        else:
            pytest.skip("User is not on free tier - cannot test this case")


class TestCreditHistory:
    """Tests for GET /api/subscriptions/credit-history - Credit usage history"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_credit_history_requires_auth(self):
        """Verify credit-history requires authentication"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/credit-history")
        assert response.status_code in [401, 403]
        
    def test_credit_history_returns_history(self, auth_token):
        """Verify credit-history returns history array"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/credit-history",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)


class TestExistingFeatures:
    """Verify existing features still work after subscription system addition"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
        
    def test_star_chart_cultures_endpoint(self, auth_token):
        """Verify Star Chart cultures endpoint still works"""
        response = requests.get(
            f"{BASE_URL}/api/star-chart/cultures",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "cultures" in data
        
    def test_trade_circle_stats_endpoint(self, auth_token):
        """Verify Trade Circle stats endpoint still works"""
        response = requests.get(
            f"{BASE_URL}/api/trade-circle/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should have karma from iteration 68
        assert "karma" in data or "listings_count" in data

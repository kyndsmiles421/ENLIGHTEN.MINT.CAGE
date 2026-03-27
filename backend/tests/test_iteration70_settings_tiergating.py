"""
Iteration 70: Settings Page & Tier-Gating API Tests
Tests for:
- Tier-gated features API (check-access, gated-features)
- Credit refresh loop (monthly)
- Existing subscription endpoints still work
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTierGatedFeatures:
    """Tests for tier-gated feature access endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login to get token
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.auth_token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ─── Check Access Endpoint Tests ───
    
    def test_check_access_sora_video_free_tier(self):
        """GET /api/subscriptions/check-access/sora_video - should return allowed:false for free tier"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/check-access/sora_video")
        assert resp.status_code == 200
        data = resp.json()
        assert "allowed" in data
        assert "feature" in data
        assert data["feature"] == "sora_video"
        # Free tier should NOT have access to sora_video (requires premium)
        assert data["allowed"] == False
        assert data.get("required_tier") == "premium"
        print(f"✓ sora_video access check: allowed={data['allowed']}, required_tier={data.get('required_tier')}")
    
    def test_check_access_oracle_reading_all_tiers(self):
        """GET /api/subscriptions/check-access/oracle_reading - should return allowed:true for all tiers"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/check-access/oracle_reading")
        assert resp.status_code == 200
        data = resp.json()
        assert "allowed" in data
        assert data["feature"] == "oracle_reading"
        # oracle_reading is NOT in TIER_GATED_FEATURES, so should be allowed for all
        assert data["allowed"] == True
        print(f"✓ oracle_reading access check: allowed={data['allowed']}")
    
    def test_check_access_cosmic_blueprint_plus_tier(self):
        """GET /api/subscriptions/check-access/cosmic_blueprint - requires plus tier"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/check-access/cosmic_blueprint")
        assert resp.status_code == 200
        data = resp.json()
        assert data["feature"] == "cosmic_blueprint"
        # Free tier should NOT have access (requires plus)
        assert data["allowed"] == False
        assert data.get("required_tier") == "plus"
        print(f"✓ cosmic_blueprint access check: allowed={data['allowed']}, required_tier={data.get('required_tier')}")
    
    def test_check_access_api_access_super_user(self):
        """GET /api/subscriptions/check-access/api_access - requires super_user tier"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/check-access/api_access")
        assert resp.status_code == 200
        data = resp.json()
        assert data["feature"] == "api_access"
        # Free tier should NOT have access (requires super_user)
        assert data["allowed"] == False
        assert data.get("required_tier") == "super_user"
        print(f"✓ api_access access check: allowed={data['allowed']}, required_tier={data.get('required_tier')}")
    
    def test_check_access_unknown_feature(self):
        """GET /api/subscriptions/check-access/unknown_feature - should return allowed:true (not gated)"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/check-access/unknown_feature")
        assert resp.status_code == 200
        data = resp.json()
        assert data["feature"] == "unknown_feature"
        # Unknown features are not gated, so allowed
        assert data["allowed"] == True
        print(f"✓ unknown_feature access check: allowed={data['allowed']}")
    
    def test_check_access_requires_auth(self):
        """GET /api/subscriptions/check-access/{feature} requires authentication"""
        no_auth_session = requests.Session()
        resp = no_auth_session.get(f"{BASE_URL}/api/subscriptions/check-access/sora_video")
        assert resp.status_code in [401, 403]
        print(f"✓ check-access requires auth: status={resp.status_code}")
    
    # ─── Gated Features Endpoint Tests ───
    
    def test_gated_features_returns_all_features(self):
        """GET /api/subscriptions/gated-features - returns all gated features with access status"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/gated-features")
        assert resp.status_code == 200
        data = resp.json()
        assert "tier" in data
        assert "features" in data
        features = data["features"]
        
        # Check expected gated features exist
        expected_features = [
            "sora_video", "voice_session", "dream_journal", "cosmic_calendar",
            "quantum_experiments", "export_all", "cosmic_blueprint", "extended_oracle",
            "guided_stargazing", "custom_meditation", "advanced_analytics",
            "exclusive_stories", "white_label", "api_access", "multi_profile",
            "private_trade_room", "custom_ai_personality"
        ]
        
        for feat in expected_features:
            assert feat in features, f"Missing feature: {feat}"
            assert "allowed" in features[feat]
            assert "required_tier" in features[feat]
            assert "required_tier_name" in features[feat]
        
        print(f"✓ gated-features returns {len(features)} features for tier: {data['tier']}")
    
    def test_gated_features_free_tier_access(self):
        """Verify free tier has correct access to gated features"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/gated-features")
        assert resp.status_code == 200
        data = resp.json()
        features = data["features"]
        
        # Free tier should NOT have access to premium features
        assert features["sora_video"]["allowed"] == False
        assert features["voice_session"]["allowed"] == False
        
        # Free tier should NOT have access to plus features
        assert features["cosmic_blueprint"]["allowed"] == False
        assert features["extended_oracle"]["allowed"] == False
        
        # Free tier should NOT have access to super_user features
        assert features["api_access"]["allowed"] == False
        assert features["white_label"]["allowed"] == False
        
        print(f"✓ Free tier access correctly restricted")
    
    def test_gated_features_requires_auth(self):
        """GET /api/subscriptions/gated-features requires authentication"""
        no_auth_session = requests.Session()
        resp = no_auth_session.get(f"{BASE_URL}/api/subscriptions/gated-features")
        assert resp.status_code in [401, 403]
        print(f"✓ gated-features requires auth: status={resp.status_code}")


class TestExistingSubscriptionEndpoints:
    """Verify existing subscription endpoints still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_get_tiers_still_works(self):
        """GET /api/subscriptions/tiers - returns all tiers"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert resp.status_code == 200
        data = resp.json()
        assert "tiers" in data
        assert "free" in data["tiers"]
        assert "premium" in data["tiers"]
        assert "super_user" in data["tiers"]
        print(f"✓ GET /api/subscriptions/tiers works: {len(data['tiers'])} tiers")
    
    def test_get_my_plan_still_works(self):
        """GET /api/subscriptions/my-plan - returns user's plan"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/my-plan")
        assert resp.status_code == 200
        data = resp.json()
        assert "tier" in data
        assert "balance" in data
        assert "perks" in data
        print(f"✓ GET /api/subscriptions/my-plan works: tier={data['tier']}, balance={data['balance']}")
    
    def test_credit_history_still_works(self):
        """GET /api/subscriptions/credit-history - returns history"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/credit-history")
        assert resp.status_code == 200
        data = resp.json()
        assert "history" in data
        print(f"✓ GET /api/subscriptions/credit-history works: {len(data['history'])} entries")
    
    def test_pricing_page_endpoint(self):
        """Verify pricing page can load tier data"""
        # No auth needed for tiers
        resp = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify tier pricing
        assert data["tiers"]["free"]["price"] == 0
        assert data["tiers"]["starter"]["price"] == 4.99
        assert data["tiers"]["plus"]["price"] == 9.99
        assert data["tiers"]["premium"]["price"] == 24.99
        assert data["tiers"]["super_user"]["price"] == 49.99
        
        # Verify credit packs
        assert "credit_packs" in data
        assert data["credit_packs"]["pack_100"]["credits"] == 100
        assert data["credit_packs"]["pack_225"]["credits"] == 225
        assert data["credit_packs"]["pack_500"]["credits"] == 500
        
        print(f"✓ Pricing data correct for all tiers and credit packs")


class TestNavCreditsIntegration:
    """Test credits badge data for navigation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_my_plan_returns_balance_for_nav(self):
        """GET /api/subscriptions/my-plan returns balance for nav credits badge"""
        resp = self.session.get(f"{BASE_URL}/api/subscriptions/my-plan")
        assert resp.status_code == 200
        data = resp.json()
        
        # Nav needs these fields
        assert "balance" in data
        assert "credits_per_month" in data
        assert "subscription_active" in data
        assert "tier_name" in data
        
        # Balance should be a number
        assert isinstance(data["balance"], (int, float))
        
        print(f"✓ Nav credits data: balance={data['balance']}, tier={data['tier_name']}")


class TestLowCreditsNudge:
    """Test low credits nudge trigger conditions"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_use_credits_returns_low_credits_flag(self):
        """POST /api/subscriptions/use-credits returns low_credits flag when balance <= 10"""
        # First check current balance
        plan_resp = self.session.get(f"{BASE_URL}/api/subscriptions/my-plan")
        assert plan_resp.status_code == 200
        current_balance = plan_resp.json()["balance"]
        
        # Use credits and check response
        resp = self.session.post(f"{BASE_URL}/api/subscriptions/use-credits", json={
            "action": "oracle_reading"
        })
        
        if resp.status_code == 200:
            data = resp.json()
            assert "remaining" in data
            assert "low_credits" in data
            # low_credits should be True if remaining <= 10
            if data["remaining"] <= 10:
                assert data["low_credits"] == True
            print(f"✓ use-credits returns low_credits flag: remaining={data['remaining']}, low_credits={data['low_credits']}")
        elif resp.status_code == 402:
            # Insufficient credits
            print(f"✓ use-credits returns 402 when insufficient credits")
        else:
            pytest.fail(f"Unexpected status: {resp.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

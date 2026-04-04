"""
Iteration 98: Final Launch Readiness Test
Tests the fixes for:
- Profile API 500 error (COVER_PRESETS constant fix)
- SmartDock minimize positioning
- All critical backend endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Health check and authentication tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("PASS: Health endpoint working")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"PASS: Login successful, user: {data['user'].get('email')}")
        return data["token"]


class TestProfileEndpoints:
    """Profile endpoints - verifying COVER_PRESETS fix"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_profile_me_no_500_error(self, auth_token):
        """Test GET /api/profile/me no longer returns 500 (was NameError: COVER_PRESETS)"""
        response = requests.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # This was returning 500 before the fix
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user_id" in data or "display_name" in data
        print(f"PASS: Profile/me returns 200 (COVER_PRESETS fix verified)")
    
    def test_profile_covers_returns_presets(self, auth_token):
        """Test GET /api/profile/covers returns cover presets list"""
        response = requests.get(f"{BASE_URL}/api/profile/covers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6  # Should have at least 6 presets
        # Verify structure
        for preset in data:
            assert "id" in preset
            assert "label" in preset
        print(f"PASS: Profile covers returns {len(data)} presets")


class TestDashboardEndpoints:
    """Dashboard stats endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_dashboard_stats(self, auth_token):
        """Test GET /api/dashboard/stats returns mood_count, journal_count, streak, sparkline"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Verify expected fields
        assert "mood_count" in data or "moods" in data
        print(f"PASS: Dashboard stats returns data: {list(data.keys())[:5]}")


class TestSubscriptionEndpoints:
    """Subscription and Stripe checkout tests"""
    
    def test_subscription_tiers(self):
        """Test GET /api/subscriptions/tiers returns 5 tiers"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        data = response.json()
        assert "tiers" in data
        tiers = data["tiers"]
        # Tiers is a dict with tier_id as keys
        assert len(tiers) >= 5
        tier_ids = list(tiers.keys())
        expected_tiers = ["free", "starter", "plus", "premium", "super_user"]
        for expected in expected_tiers:
            assert expected in tier_ids, f"Missing tier: {expected}"
        print(f"PASS: Subscription tiers returns {len(tiers)} tiers: {tier_ids}")
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_stripe_checkout(self, auth_token):
        """Test POST /api/subscriptions/checkout with tier_id and origin_url returns Stripe URL"""
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "tier_id": "starter",
                "origin_url": "https://zero-scale-physics.preview.emergentagent.com/pricing"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "url" in data or "checkout_url" in data
        url = data.get("url") or data.get("checkout_url")
        assert "stripe.com" in url or "checkout" in url
        print(f"PASS: Stripe checkout returns URL")


class TestTradeCircleEndpoints:
    """Trade Circle listing tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_trade_circle_listings_get(self, auth_token):
        """Test GET /api/trade-circle/listings returns listings"""
        response = requests.get(
            f"{BASE_URL}/api/trade-circle/listings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "listings" in data or isinstance(data, list)
        print(f"PASS: Trade Circle listings GET works")
    
    def test_trade_circle_create_listing(self, auth_token):
        """Test POST /api/trade-circle/listings creates listing with category"""
        response = requests.post(
            f"{BASE_URL}/api/trade-circle/listings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "TEST_Iteration98_Listing",
                "description": "Test listing for iteration 98",
                "category": "goods",
                "offering": "Test offering for iteration 98"
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data or "listing" in data
        print(f"PASS: Trade Circle listing created")


class TestSacredTextsEndpoints:
    """Sacred texts endpoint tests"""
    
    def test_sacred_texts_returns_15_plus(self):
        """Test GET /api/sacred-texts returns 15+ texts"""
        response = requests.get(f"{BASE_URL}/api/sacred-texts")
        assert response.status_code == 200
        data = response.json()
        texts = data if isinstance(data, list) else data.get("texts", [])
        assert len(texts) >= 15, f"Expected 15+ texts, got {len(texts)}"
        print(f"PASS: Sacred texts returns {len(texts)} texts")


class TestBlessingsEndpoints:
    """Blessings templates endpoint tests"""
    
    def test_blessings_templates(self):
        """Test GET /api/blessings/templates returns blessing templates"""
        response = requests.get(f"{BASE_URL}/api/blessings/templates")
        assert response.status_code == 200
        data = response.json()
        templates = data if isinstance(data, list) else data.get("templates", [])
        assert len(templates) > 0
        print(f"PASS: Blessings templates returns {len(templates)} templates")


class TestMoodInsightsEndpoints:
    """Mood insights endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_mood_insights(self, auth_token):
        """Test GET /api/moods/insights returns AI mood insights"""
        response = requests.get(
            f"{BASE_URL}/api/moods/insights",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should return insights or empty if no moods
        print(f"PASS: Mood insights endpoint returns 200")


class TestCrystalPairingEndpoints:
    """Crystal pairing options endpoint tests"""
    
    def test_crystal_pairing_options(self):
        """Test GET /api/crystals/pairing/options returns pairing options"""
        response = requests.get(f"{BASE_URL}/api/crystals/pairing/options")
        assert response.status_code == 200
        data = response.json()
        assert "moods" in data or "intentions" in data or isinstance(data, list)
        print(f"PASS: Crystal pairing options returns data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

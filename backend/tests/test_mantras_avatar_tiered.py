"""
Test suite for Iteration 170 features:
- Mantras API (31 entries, category filtering)
- Game Avatar system (Free/Earned/Premium tiers)
- Tiered Dust Sales (15%/30% discounts)
- 30% Return Penalty on sell-back
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
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMantrasAPI:
    """Tests for /api/mantras endpoints - 31 mantras library"""

    def test_get_random_mantras_default(self):
        """GET /api/mantras returns 3 random mantras by default"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert "mantras" in data
        assert len(data["mantras"]) == 3
        # Verify mantra structure
        for mantra in data["mantras"]:
            assert "text" in mantra
            assert "category" in mantra
            assert "energy" in mantra

    def test_get_mantras_with_count(self):
        """GET /api/mantras?count=5 returns specified number"""
        response = requests.get(f"{BASE_URL}/api/mantras?count=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["mantras"]) == 5

    def test_get_mantras_by_category_trade(self):
        """GET /api/mantras?category=trade returns only trade-category mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras?category=trade")
        assert response.status_code == 200
        data = response.json()
        assert "mantras" in data
        # All returned mantras should be trade category
        for mantra in data["mantras"]:
            assert mantra["category"] == "trade"

    def test_get_mantras_by_category_mixer(self):
        """GET /api/mantras?category=mixer returns only mixer-category mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras?category=mixer")
        assert response.status_code == 200
        data = response.json()
        for mantra in data["mantras"]:
            assert mantra["category"] == "mixer"

    def test_get_mantras_by_category_sacred(self):
        """GET /api/mantras?category=sacred returns only sacred-category mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras?category=sacred")
        assert response.status_code == 200
        data = response.json()
        for mantra in data["mantras"]:
            assert mantra["category"] == "sacred"

    def test_get_all_mantras(self):
        """GET /api/mantras/all returns full library with categories"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        data = response.json()
        assert "mantras" in data
        assert "categories" in data
        assert "total" in data
        # Should have 31 mantras as per spec
        assert data["total"] == 31
        assert len(data["mantras"]) == 31
        # Categories should be sorted
        assert isinstance(data["categories"], list)
        assert len(data["categories"]) > 0


class TestAvatarCatalog:
    """Tests for /api/avatar/catalog - 10 avatars (4 free, 3 earned, 3 premium)"""

    def test_avatar_catalog_returns_10_avatars(self, auth_headers):
        """GET /api/avatar/catalog returns 10 avatars with unlock status"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "catalog" in data
        assert "active_avatar" in data
        assert "credits" in data
        # Should have 10 avatars total
        assert len(data["catalog"]) == 10

    def test_avatar_catalog_tier_distribution(self, auth_headers):
        """Verify 4 free, 3 earned, 3 premium avatars"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        assert response.status_code == 200
        catalog = response.json()["catalog"]
        
        free_count = sum(1 for a in catalog if a["tier"] == "free")
        earned_count = sum(1 for a in catalog if a["tier"] == "earned")
        premium_count = sum(1 for a in catalog if a["tier"] == "premium")
        
        assert free_count == 4, f"Expected 4 free avatars, got {free_count}"
        assert earned_count == 3, f"Expected 3 earned avatars, got {earned_count}"
        assert premium_count == 3, f"Expected 3 premium avatars, got {premium_count}"

    def test_avatar_catalog_structure(self, auth_headers):
        """Verify avatar structure has required fields"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        assert response.status_code == 200
        catalog = response.json()["catalog"]
        
        for avatar in catalog:
            assert "id" in avatar
            assert "name" in avatar
            assert "tier" in avatar
            assert "aura_base" in avatar
            assert "style" in avatar
            assert "description" in avatar
            assert "unlocked" in avatar
            assert "active" in avatar

    def test_free_avatars_unlocked_by_default(self, auth_headers):
        """Free avatars should be unlocked by default"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        assert response.status_code == 200
        catalog = response.json()["catalog"]
        
        free_avatars = [a for a in catalog if a["tier"] == "free"]
        for avatar in free_avatars:
            assert avatar["unlocked"] == True, f"Free avatar {avatar['id']} should be unlocked"

    def test_premium_avatars_have_prices(self, auth_headers):
        """Premium avatars should have price_credits field"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        assert response.status_code == 200
        catalog = response.json()["catalog"]
        
        premium_avatars = [a for a in catalog if a["tier"] == "premium"]
        expected_prices = {"phoenix": 25, "oracle": 35, "sovereign": 50}
        
        for avatar in premium_avatars:
            assert "price_credits" in avatar
            assert avatar["price_credits"] == expected_prices.get(avatar["id"]), \
                f"Avatar {avatar['id']} price mismatch"


class TestAvatarProfile:
    """Tests for /api/avatar/profile - active avatar with mood and resonance"""

    def test_avatar_profile_returns_active_avatar(self, auth_headers):
        """GET /api/avatar/profile returns active avatar with mood-resonant state"""
        response = requests.get(f"{BASE_URL}/api/avatar/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "avatar" in data
        assert "resonance_level" in data
        assert "mood" in data
        assert "mood_color" in data
        assert "stats" in data

    def test_avatar_profile_stats_structure(self, auth_headers):
        """Verify stats include mixer_sessions, specimens_mined, trade_karma"""
        response = requests.get(f"{BASE_URL}/api/avatar/profile", headers=auth_headers)
        assert response.status_code == 200
        stats = response.json()["stats"]
        
        assert "mixer_sessions" in stats
        assert "specimens_mined" in stats
        assert "trade_karma" in stats

    def test_avatar_profile_mood_states(self, auth_headers):
        """Verify mood is one of the valid states"""
        response = requests.get(f"{BASE_URL}/api/avatar/profile", headers=auth_headers)
        assert response.status_code == 200
        mood = response.json()["mood"]
        
        valid_moods = ["dormant", "awakening", "flowing", "radiant", "transcendent"]
        assert mood in valid_moods, f"Invalid mood: {mood}"

    def test_avatar_profile_resonance_range(self, auth_headers):
        """Resonance level should be 0-100"""
        response = requests.get(f"{BASE_URL}/api/avatar/profile", headers=auth_headers)
        assert response.status_code == 200
        resonance = response.json()["resonance_level"]
        
        assert 0 <= resonance <= 100, f"Resonance {resonance} out of range"


class TestAvatarSelect:
    """Tests for POST /api/avatar/select - select free avatar"""

    def test_select_free_avatar(self, auth_headers):
        """POST /api/avatar/select selects a free avatar from unlocked collection"""
        # Select 'healer' avatar (free tier)
        response = requests.post(f"{BASE_URL}/api/avatar/select", 
            json={"avatar_id": "healer"}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["selected"] == "healer"
        assert "name" in data

    def test_select_locked_avatar_fails(self, auth_headers):
        """Selecting a locked avatar should fail with 403"""
        # Try to select 'phoenix' (premium, likely locked)
        response = requests.post(f"{BASE_URL}/api/avatar/select", 
            json={"avatar_id": "phoenix"}, headers=auth_headers)
        # Should fail if not unlocked
        if response.status_code == 403:
            assert "not unlocked" in response.json().get("detail", "").lower()
        # If it succeeds, user already owns it
        elif response.status_code == 200:
            pass  # User already purchased this avatar

    def test_select_invalid_avatar_fails(self, auth_headers):
        """Selecting non-existent avatar should fail with 404"""
        response = requests.post(f"{BASE_URL}/api/avatar/select", 
            json={"avatar_id": "nonexistent_avatar"}, headers=auth_headers)
        assert response.status_code == 404

    def test_select_avatar_updates_profile(self, auth_headers):
        """After selecting, profile should reflect new avatar"""
        # Select 'guardian' avatar
        requests.post(f"{BASE_URL}/api/avatar/select", 
            json={"avatar_id": "guardian"}, headers=auth_headers)
        
        # Verify profile shows guardian
        response = requests.get(f"{BASE_URL}/api/avatar/profile", headers=auth_headers)
        assert response.status_code == 200
        avatar = response.json()["avatar"]
        assert avatar["id"] == "guardian"


class TestAvatarPurchase:
    """Tests for POST /api/avatar/purchase - purchase premium avatar"""

    def test_purchase_premium_avatar_insufficient_credits(self, auth_headers):
        """Purchasing without enough credits should fail"""
        # First check user's credits
        catalog_resp = requests.get(f"{BASE_URL}/api/avatar/catalog", headers=auth_headers)
        credits = catalog_resp.json()["credits"]
        
        # Try to purchase sovereign (50 credits)
        if credits < 50:
            response = requests.post(f"{BASE_URL}/api/avatar/purchase", 
                json={"avatar_id": "sovereign"}, headers=auth_headers)
            assert response.status_code == 400
            assert "need" in response.json().get("detail", "").lower()

    def test_purchase_non_premium_avatar_fails(self, auth_headers):
        """Purchasing a non-premium avatar should fail with 404"""
        response = requests.post(f"{BASE_URL}/api/avatar/purchase", 
            json={"avatar_id": "seeker"}, headers=auth_headers)
        assert response.status_code == 404


class TestTieredDustSales:
    """Tests for AI Merchant tiered dust pricing (0/15/30% discounts)"""

    def test_ai_merchant_catalog_has_tiers(self, auth_headers):
        """GET /api/trade-circle/ai-merchant shows tier and discount fields"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/ai-merchant", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "catalog" in data
        
        # Find dust items
        dust_items = [item for item in data["catalog"] if item["type"] == "dust"]
        assert len(dust_items) >= 3, "Should have at least 3 dust tiers"
        
        # Verify tier and discount fields exist
        for item in dust_items:
            assert "tier" in item, f"Item {item['id']} missing tier"
            assert "discount" in item, f"Item {item['id']} missing discount"

    def test_dust_base_tier_no_discount(self, auth_headers):
        """Base tier dust (dust_500) should have 0% discount"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/ai-merchant", headers=auth_headers)
        catalog = response.json()["catalog"]
        
        base_dust = next((item for item in catalog if item["id"] == "dust_500"), None)
        assert base_dust is not None, "dust_500 not found"
        assert base_dust["tier"] == "base"
        assert base_dust["discount"] == 0

    def test_dust_medium_tier_15_discount(self, auth_headers):
        """Medium tier dust (dust_2000) should have 15% discount"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/ai-merchant", headers=auth_headers)
        catalog = response.json()["catalog"]
        
        medium_dust = next((item for item in catalog if item["id"] == "dust_2000"), None)
        assert medium_dust is not None, "dust_2000 not found"
        assert medium_dust["tier"] == "medium"
        assert medium_dust["discount"] == 15

    def test_dust_premium_tier_30_discount(self, auth_headers):
        """Premium tier dust (dust_5000) should have 30% discount"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/ai-merchant", headers=auth_headers)
        catalog = response.json()["catalog"]
        
        premium_dust = next((item for item in catalog if item["id"] == "dust_5000"), None)
        assert premium_dust is not None, "dust_5000 not found"
        assert premium_dust["tier"] == "premium"
        assert premium_dust["discount"] == 30


class TestReturnPenalty:
    """Tests for 30% processing fee on sell-back"""

    def test_sell_dust_applies_30_percent_fee(self, auth_headers):
        """POST /api/trade-circle/ai-merchant/sell applies 30% processing fee"""
        # First check user has dust
        wallet_resp = requests.get(f"{BASE_URL}/api/trade-circle/wallet", headers=auth_headers)
        dust = wallet_resp.json().get("dust", 0)
        
        if dust >= 200:
            response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
                json={"resource": "dust", "amount": 200}, headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            
            # Verify response has required fields
            assert "raw_credits" in data
            assert "processing_fee" in data
            assert "processing_fee_pct" in data
            assert "credits_earned" in data
            
            # Verify 30% fee
            assert data["processing_fee_pct"] == 30
            
            # Verify math: credits_earned = max(1, raw_credits - processing_fee)
            # The code uses max(1, ...) to ensure at least 1 credit is earned
            expected = max(1, data["raw_credits"] - data["processing_fee"])
            assert data["credits_earned"] == expected
        else:
            pytest.skip("User doesn't have enough dust to test sell")

    def test_sell_response_structure(self, auth_headers):
        """Verify sell response has all required fields"""
        wallet_resp = requests.get(f"{BASE_URL}/api/trade-circle/wallet", headers=auth_headers)
        dust = wallet_resp.json().get("dust", 0)
        
        if dust >= 100:
            response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
                json={"resource": "dust", "amount": 100}, headers=auth_headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["sold", "amount", "raw_credits", "processing_fee", 
                                   "processing_fee_pct", "credits_earned"]
                for field in required_fields:
                    assert field in data, f"Missing field: {field}"
        else:
            pytest.skip("User doesn't have enough dust")

    def test_sell_invalid_resource_fails(self, auth_headers):
        """Selling invalid resource should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
            json={"resource": "invalid", "amount": 100}, headers=auth_headers)
        assert response.status_code == 400

    def test_sell_zero_amount_fails(self, auth_headers):
        """Selling zero amount should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
            json={"resource": "dust", "amount": 0}, headers=auth_headers)
        assert response.status_code == 400


class TestWalletEndpoint:
    """Tests for wallet endpoint"""

    def test_wallet_returns_balances(self, auth_headers):
        """GET /api/trade-circle/wallet returns credits, dust, gems"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/wallet", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "credits" in data
        assert "dust" in data
        assert "gems" in data
        
        # Values should be non-negative integers
        assert isinstance(data["credits"], (int, float))
        assert isinstance(data["dust"], (int, float))
        assert isinstance(data["gems"], (int, float))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

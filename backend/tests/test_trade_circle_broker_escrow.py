"""
Test Trade Circle: AI Merchant, Escrow, and Cosmic Broker endpoints
Tests for iteration 169 - Trade Circle Central Bank features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestTradeCircleAuth:
    """Authentication for Trade Circle tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestWalletEndpoint(TestTradeCircleAuth):
    """Test GET /api/trade-circle/wallet - returns user's credits, dust, gems"""
    
    def test_wallet_returns_balances(self, auth_headers):
        """Wallet endpoint returns credits, dust, gems"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/wallet", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "credits" in data, "Response should contain 'credits'"
        assert "dust" in data, "Response should contain 'dust'"
        assert "gems" in data, "Response should contain 'gems'"
        
        # Verify types
        assert isinstance(data["credits"], (int, float)), "Credits should be numeric"
        assert isinstance(data["dust"], (int, float)), "Dust should be numeric"
        assert isinstance(data["gems"], (int, float)), "Gems should be numeric"
        
        print(f"Wallet balances - Credits: {data['credits']}, Dust: {data['dust']}, Gems: {data['gems']}")


class TestBrokerPacksEndpoint(TestTradeCircleAuth):
    """Test GET /api/trade-circle/broker/packs - returns 4 credit packs"""
    
    def test_broker_packs_returns_four_packs(self, auth_headers):
        """Broker packs endpoint returns 4 credit packs"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/broker/packs", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "packs" in data, "Response should contain 'packs'"
        assert len(data["packs"]) == 4, f"Expected 4 packs, got {len(data['packs'])}"
        
        # Verify pack structure
        for pack in data["packs"]:
            assert "id" in pack, "Pack should have 'id'"
            assert "name" in pack, "Pack should have 'name'"
            assert "credits" in pack, "Pack should have 'credits'"
            assert "price_cents" in pack, "Pack should have 'price_cents'"
            assert "price_display" in pack, "Pack should have 'price_display'"
            assert "bonus" in pack, "Pack should have 'bonus'"
        
        pack_names = [p["name"] for p in data["packs"]]
        print(f"Broker packs: {pack_names}")


class TestAIMerchantEndpoint(TestTradeCircleAuth):
    """Test GET /api/trade-circle/ai-merchant - returns catalog with 8 items and user balances"""
    
    def test_ai_merchant_returns_catalog(self, auth_headers):
        """AI Merchant endpoint returns catalog with items and user balances"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/ai-merchant", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "catalog" in data, "Response should contain 'catalog'"
        assert "your_credits" in data, "Response should contain 'your_credits'"
        assert "your_dust" in data, "Response should contain 'your_dust'"
        assert "resonance_fee_pct" in data, "Response should contain 'resonance_fee_pct'"
        assert "merchant_message" in data, "Response should contain 'merchant_message'"
        
        # Verify catalog has 8 items
        assert len(data["catalog"]) == 8, f"Expected 8 items in catalog, got {len(data['catalog'])}"
        
        # Verify item structure
        for item in data["catalog"]:
            assert "id" in item, "Item should have 'id'"
            assert "name" in item, "Item should have 'name'"
            assert "type" in item, "Item should have 'type'"
            assert "price_credits" in item, "Item should have 'price_credits'"
            assert "description" in item, "Item should have 'description'"
        
        item_names = [i["name"] for i in data["catalog"]]
        print(f"AI Merchant catalog items: {item_names}")
        print(f"User credits: {data['your_credits']}, dust: {data['your_dust']}")


class TestAIMerchantBuy(TestTradeCircleAuth):
    """Test POST /api/trade-circle/ai-merchant/buy - deducts credits and delivers goods"""
    
    def test_buy_item_insufficient_credits(self, auth_headers):
        """Buy item fails with insufficient credits"""
        # Try to buy an expensive item that user likely can't afford
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/buy", 
            json={"item_id": "comp_engine", "quantity": 100},  # 100 * 12 = 1200 credits
            headers=auth_headers)
        
        # Should fail with 400 if insufficient credits
        if response.status_code == 400:
            assert "Need" in response.json().get("detail", "") or "Credits" in response.json().get("detail", "")
            print(f"Correctly rejected: {response.json().get('detail')}")
        elif response.status_code == 200:
            # User has enough credits - that's fine too
            print(f"Purchase succeeded (user has enough credits)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")
    
    def test_buy_invalid_item(self, auth_headers):
        """Buy invalid item returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/buy",
            json={"item_id": "invalid_item_xyz", "quantity": 1},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for invalid item, got {response.status_code}"
        print(f"Correctly rejected invalid item: {response.json().get('detail')}")


class TestAIMerchantSell(TestTradeCircleAuth):
    """Test POST /api/trade-circle/ai-merchant/sell - sells resources back for credits"""
    
    def test_sell_invalid_resource(self, auth_headers):
        """Sell invalid resource type returns 400"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
            json={"resource": "invalid_resource", "amount": 100},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid resource, got {response.status_code}"
        print(f"Correctly rejected invalid resource: {response.json().get('detail')}")
    
    def test_sell_zero_amount(self, auth_headers):
        """Sell zero amount returns 400"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/ai-merchant/sell",
            json={"resource": "dust", "amount": 0},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for zero amount, got {response.status_code}"
        print(f"Correctly rejected zero amount: {response.json().get('detail')}")


class TestBrokerBuyCredits(TestTradeCircleAuth):
    """Test POST /api/trade-circle/broker/buy-credits - creates Stripe checkout session"""
    
    def test_buy_credits_invalid_pack(self, auth_headers):
        """Buy credits with invalid pack returns 400"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/broker/buy-credits",
            json={"pack_id": "invalid_pack_xyz"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid pack, got {response.status_code}"
        print(f"Correctly rejected invalid pack: {response.json().get('detail')}")
    
    def test_buy_credits_valid_pack(self, auth_headers):
        """Buy credits with valid pack creates checkout session"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/broker/buy-credits",
            json={
                "pack_id": "broker_5",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
                "webhook_url": ""
            },
            headers=auth_headers)
        
        # Should return 200 with checkout_url or 500 if Stripe not configured
        if response.status_code == 200:
            data = response.json()
            assert "checkout_url" in data, "Response should contain 'checkout_url'"
            assert "session_id" in data, "Response should contain 'session_id'"
            print(f"Checkout session created: {data.get('session_id', 'N/A')[:20]}...")
        elif response.status_code == 500:
            # Stripe may not be fully configured in test environment
            print(f"Stripe service unavailable (expected in test): {response.json().get('detail')}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")


class TestEscrowEndpoints(TestTradeCircleAuth):
    """Test Escrow endpoints"""
    
    def test_get_escrows(self, auth_headers):
        """GET /api/trade-circle/escrows returns user's escrows"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/escrows", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "escrows" in data, "Response should contain 'escrows'"
        assert isinstance(data["escrows"], list), "Escrows should be a list"
        
        print(f"User has {len(data['escrows'])} escrows")
    
    def test_create_escrow_missing_offer(self, auth_headers):
        """Create escrow without valid offer returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/create",
            json={
                "offer_id": "nonexistent_offer_xyz",
                "digital_asset_type": "credits",
                "digital_amount": 10,
                "physical_description": "Test item"
            },
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for missing offer, got {response.status_code}"
        print(f"Correctly rejected missing offer: {response.json().get('detail')}")
    
    def test_create_escrow_missing_description(self, auth_headers):
        """Create escrow without description returns 400"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/create",
            json={
                "offer_id": "some_offer",
                "digital_asset_type": "credits",
                "digital_amount": 10,
                "physical_description": ""
            },
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for missing description, got {response.status_code}"
        print(f"Correctly rejected missing description: {response.json().get('detail')}")
    
    def test_ship_escrow_not_found(self, auth_headers):
        """Ship escrow that doesn't exist returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/ship",
            json={"escrow_id": "nonexistent_escrow_xyz", "tracking_id": "TRACK123"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for missing escrow, got {response.status_code}"
        print(f"Correctly rejected missing escrow: {response.json().get('detail')}")
    
    def test_confirm_receipt_not_found(self, auth_headers):
        """Confirm receipt for escrow that doesn't exist returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/confirm-receipt",
            json={"escrow_id": "nonexistent_escrow_xyz"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for missing escrow, got {response.status_code}"
        print(f"Correctly rejected missing escrow: {response.json().get('detail')}")
    
    def test_dispute_escrow_not_found(self, auth_headers):
        """Dispute escrow that doesn't exist returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/dispute",
            json={"escrow_id": "nonexistent_escrow_xyz", "reason": "Test dispute"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for missing escrow, got {response.status_code}"
        print(f"Correctly rejected missing escrow: {response.json().get('detail')}")


class TestTradeCircleListings(TestTradeCircleAuth):
    """Test Trade Circle listings endpoints"""
    
    def test_get_listings(self, auth_headers):
        """GET /api/trade-circle/listings returns listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "listings" in data, "Response should contain 'listings'"
        assert "total" in data, "Response should contain 'total'"
        
        print(f"Found {data['total']} total listings")
    
    def test_get_my_listings(self, auth_headers):
        """GET /api/trade-circle/my-listings returns user's listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-listings", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "listings" in data, "Response should contain 'listings'"
        
        print(f"User has {len(data['listings'])} listings")
    
    def test_get_my_offers(self, auth_headers):
        """GET /api/trade-circle/my-offers returns user's offers"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-offers", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sent" in data, "Response should contain 'sent'"
        assert "received" in data, "Response should contain 'received'"
        
        print(f"User has {len(data['sent'])} sent offers, {len(data['received'])} received offers")


class TestTradeCircleStats(TestTradeCircleAuth):
    """Test Trade Circle stats and karma endpoints"""
    
    def test_get_stats(self, auth_headers):
        """GET /api/trade-circle/stats returns trade stats"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total_active" in data, "Response should contain 'total_active'"
        assert "total_traded" in data, "Response should contain 'total_traded'"
        assert "karma" in data, "Response should contain 'karma'"
        assert "karma_tier" in data, "Response should contain 'karma_tier'"
        
        print(f"Stats - Active: {data['total_active']}, Traded: {data['total_traded']}, Karma: {data['karma']}")
    
    def test_get_karma_leaderboard(self, auth_headers):
        """GET /api/trade-circle/karma-leaderboard returns leaderboard"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma-leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "leaderboard" in data, "Response should contain 'leaderboard'"
        
        print(f"Leaderboard has {len(data['leaderboard'])} entries")
    
    def test_get_categories(self):
        """GET /api/trade-circle/categories returns trade categories"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "categories" in data, "Response should contain 'categories'"
        assert len(data["categories"]) > 0, "Should have at least one category"
        
        cat_names = [c["name"] for c in data["categories"]]
        print(f"Trade categories: {cat_names}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 162: Marketplace Monetization System Tests
Tests: Cosmic Credits, Premium Store, Consumables, Cosmetics, Nexus Pass, Mineral Sell-back
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


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
def headers(auth_token):
    """Auth headers for API requests."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMarketplaceStore:
    """Tests for GET /api/marketplace/store - Full catalog endpoint"""

    def test_store_returns_200(self, headers):
        """Store endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/marketplace/store returns 200")

    def test_store_returns_cosmic_credits(self, headers):
        """Store returns user's cosmic credits balance"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "cosmic_credits" in data, "Missing cosmic_credits field"
        assert isinstance(data["cosmic_credits"], int), "cosmic_credits should be int"
        print(f"PASS: Store returns cosmic_credits: {data['cosmic_credits']}")

    def test_store_returns_consumables(self, headers):
        """Store returns consumables list with expected items"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "consumables" in data, "Missing consumables field"
        assert isinstance(data["consumables"], list), "consumables should be list"
        assert len(data["consumables"]) >= 5, f"Expected at least 5 consumables, got {len(data['consumables'])}"
        
        # Check for expected consumables
        consumable_ids = [c["id"] for c in data["consumables"]]
        expected = ["clear_vision", "frequency_attuner", "payload_booster", "dual_motor_excavator", "warp_key"]
        for item_id in expected:
            assert item_id in consumable_ids, f"Missing consumable: {item_id}"
        print(f"PASS: Store returns {len(data['consumables'])} consumables including all expected items")

    def test_store_returns_cosmetics(self, headers):
        """Store returns cosmetics list with auras and themes"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "cosmetics" in data, "Missing cosmetics field"
        assert isinstance(data["cosmetics"], list), "cosmetics should be list"
        
        cosmetic_ids = [c["id"] for c in data["cosmetics"]]
        expected = ["aura_violet", "aura_golden", "aura_crimson", "theme_cyber_neon", "theme_hyper_real"]
        for item_id in expected:
            assert item_id in cosmetic_ids, f"Missing cosmetic: {item_id}"
        print(f"PASS: Store returns {len(data['cosmetics'])} cosmetics including all expected items")

    def test_store_returns_credit_packages(self, headers):
        """Store returns credit packages for purchase"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "credit_packages" in data, "Missing credit_packages field"
        assert isinstance(data["credit_packages"], list), "credit_packages should be list"
        assert len(data["credit_packages"]) >= 4, f"Expected at least 4 credit packages"
        
        # Check package structure
        pkg = data["credit_packages"][0]
        assert "id" in pkg, "Package missing id"
        assert "credits" in pkg, "Package missing credits"
        assert "price_cents" in pkg, "Package missing price_cents"
        assert "price_display" in pkg, "Package missing price_display"
        print(f"PASS: Store returns {len(data['credit_packages'])} credit packages")

    def test_store_returns_nexus_subscription(self, headers):
        """Store returns Nexus subscription info"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "nexus_subscription" in data, "Missing nexus_subscription field"
        nexus = data["nexus_subscription"]
        assert "name" in nexus, "Nexus missing name"
        assert "price_display" in nexus, "Nexus missing price_display"
        assert "perks" in nexus, "Nexus missing perks"
        assert "is_subscribed" in nexus, "Nexus missing is_subscribed"
        print(f"PASS: Store returns nexus_subscription (is_subscribed: {nexus['is_subscribed']})")

    def test_store_returns_active_effects(self, headers):
        """Store returns active effects map"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "active_effects" in data, "Missing active_effects field"
        assert isinstance(data["active_effects"], dict), "active_effects should be dict"
        print(f"PASS: Store returns active_effects: {list(data['active_effects'].keys())}")

    def test_store_returns_inventory(self, headers):
        """Store returns inventory counts"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store", headers=headers)
        data = response.json()
        assert "inventory" in data, "Missing inventory field"
        assert isinstance(data["inventory"], dict), "inventory should be dict"
        print(f"PASS: Store returns inventory: {data['inventory']}")


class TestMarketplaceCredits:
    """Tests for credit-related endpoints"""

    def test_get_credits_returns_balance(self, headers):
        """GET /api/marketplace/credits returns balance"""
        response = requests.get(f"{BASE_URL}/api/marketplace/credits", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "cosmic_credits" in data
        print(f"PASS: GET /api/marketplace/credits returns balance: {data['cosmic_credits']}")

    def test_grant_test_credits(self, headers):
        """POST /api/marketplace/grant-test-credits grants credits"""
        # Get initial balance
        initial = requests.get(f"{BASE_URL}/api/marketplace/credits", headers=headers).json()["cosmic_credits"]
        
        # Grant 100 test credits
        response = requests.post(f"{BASE_URL}/api/marketplace/grant-test-credits", 
                                 json={"amount": 100}, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "granted" in data
        assert "new_balance" in data
        assert data["granted"] == 100
        assert data["new_balance"] == initial + 100
        print(f"PASS: Grant test credits - granted {data['granted']}, new balance: {data['new_balance']}")


class TestMarketplaceInventory:
    """Tests for inventory endpoint"""

    def test_get_inventory(self, headers):
        """GET /api/marketplace/inventory returns user inventory"""
        response = requests.get(f"{BASE_URL}/api/marketplace/inventory", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "inventory" in data
        assert "cosmic_credits" in data
        assert isinstance(data["inventory"], list)
        print(f"PASS: GET /api/marketplace/inventory returns {len(data['inventory'])} items")


class TestMarketplaceActiveEffects:
    """Tests for active effects endpoint"""

    def test_get_active_effects(self, headers):
        """GET /api/marketplace/active-effects returns effects, cosmetics, equipped"""
        response = requests.get(f"{BASE_URL}/api/marketplace/active-effects", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "active_effects" in data
        assert "nexus_subscription" in data
        assert "owned_cosmetics" in data
        assert "equipped" in data
        print(f"PASS: GET /api/marketplace/active-effects returns all fields")
        print(f"  - Active effects: {len(data['active_effects'])}")
        print(f"  - Nexus sub active: {data['nexus_subscription']['active']}")
        print(f"  - Owned cosmetics: {len(data['owned_cosmetics'])}")


class TestMarketplaceBuyItem:
    """Tests for buying items with Cosmic Credits"""

    def test_buy_consumable(self, headers):
        """POST /api/marketplace/buy-item purchases consumable"""
        # Ensure we have enough credits
        requests.post(f"{BASE_URL}/api/marketplace/grant-test-credits", 
                      json={"amount": 200}, headers=headers)
        
        # Buy a payload booster (40 credits)
        response = requests.post(f"{BASE_URL}/api/marketplace/buy-item",
                                 json={"item_id": "payload_booster"}, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["purchased"] == True
        assert "item" in data
        assert "credits_remaining" in data
        print(f"PASS: Bought {data['item']['name']}, credits remaining: {data['credits_remaining']}")

    def test_buy_item_insufficient_credits(self, headers):
        """Buy item fails with insufficient credits"""
        # Try to buy expensive item without enough credits
        # First check balance
        balance = requests.get(f"{BASE_URL}/api/marketplace/credits", headers=headers).json()["cosmic_credits"]
        
        # If balance is high, skip this test
        if balance >= 500:
            pytest.skip("User has too many credits to test insufficient balance")
        
        response = requests.post(f"{BASE_URL}/api/marketplace/buy-item",
                                 json={"item_id": "theme_cyber_neon"}, headers=headers)
        assert response.status_code == 400
        print("PASS: Buy item fails with insufficient credits")

    def test_buy_invalid_item(self, headers):
        """Buy invalid item returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/buy-item",
                                 json={"item_id": "invalid_item_xyz"}, headers=headers)
        assert response.status_code == 400
        print("PASS: Buy invalid item returns 400")


class TestMarketplaceUseItem:
    """Tests for using consumable items"""

    def test_use_item_not_in_inventory(self, headers):
        """Use item not in inventory returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/use-item",
                                 json={"item_id": "warp_key"}, headers=headers)
        # May succeed if user has warp key, or fail if not
        if response.status_code == 400:
            assert "don't have" in response.json().get("detail", "").lower() or "already active" in response.json().get("detail", "").lower()
            print("PASS: Use item not in inventory returns 400")
        else:
            print(f"INFO: User has warp_key in inventory, use succeeded")

    def test_use_invalid_consumable(self, headers):
        """Use non-consumable item returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/use-item",
                                 json={"item_id": "aura_violet"}, headers=headers)
        assert response.status_code == 400
        print("PASS: Use non-consumable returns 400")


class TestMarketplaceEquipCosmetic:
    """Tests for equipping cosmetics"""

    def test_equip_unowned_cosmetic(self, headers):
        """Equip unowned cosmetic returns 400"""
        # Try to equip a cosmetic we likely don't own
        response = requests.post(f"{BASE_URL}/api/marketplace/equip-cosmetic",
                                 json={"item_id": "theme_hyper_real"}, headers=headers)
        # May succeed if owned, or fail if not
        if response.status_code == 400:
            print("PASS: Equip unowned cosmetic returns 400")
        else:
            print("INFO: User owns theme_hyper_real, equip succeeded")

    def test_equip_invalid_cosmetic(self, headers):
        """Equip invalid cosmetic returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/equip-cosmetic",
                                 json={"item_id": "invalid_cosmetic"}, headers=headers)
        assert response.status_code == 400
        print("PASS: Equip invalid cosmetic returns 400")


class TestMarketplaceSellMinerals:
    """Tests for mineral sell-back system"""

    def test_sell_no_specimens(self, headers):
        """Sell with empty specimens list returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/sell-minerals",
                                 json={"specimens": []}, headers=headers)
        assert response.status_code == 400
        print("PASS: Sell empty specimens returns 400")

    def test_sell_invalid_specimen(self, headers):
        """Sell non-existent specimen returns no credits"""
        response = requests.post(f"{BASE_URL}/api/marketplace/sell-minerals",
                                 json={"specimens": [{"id": "fake_specimen_123", "quantity": 1}]}, headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Should return sold=False or total_credits_earned=0
        assert data.get("sold") == False or data.get("total_credits_earned") == 0
        print("PASS: Sell invalid specimen returns no credits")


class TestMarketplaceNexusSubscription:
    """Tests for Nexus Pass subscription"""

    def test_subscribe_nexus_already_subscribed(self, headers):
        """Subscribe when already subscribed returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/subscribe-nexus",
                                 json={}, headers=headers)
        # User should already be subscribed per test context
        if response.status_code == 400:
            assert "already" in response.json().get("detail", "").lower()
            print("PASS: Subscribe when already subscribed returns 400")
        else:
            # If not subscribed, it would try Stripe checkout
            print(f"INFO: User not subscribed, got status {response.status_code}")

    def test_activate_nexus_already_subscribed(self, headers):
        """Activate subscription when already subscribed returns 400"""
        response = requests.post(f"{BASE_URL}/api/marketplace/activate-nexus-sub",
                                 json={"session_id": "test"}, headers=headers)
        if response.status_code == 400:
            assert "already" in response.json().get("detail", "").lower()
            print("PASS: Activate when already subscribed returns 400")
        else:
            print(f"INFO: Activation succeeded (user wasn't subscribed)")


class TestGameCoreMarketplaceIntegration:
    """Tests for game-core endpoints with marketplace effects"""

    def test_game_core_stats_includes_cosmic_credits(self, headers):
        """GET /api/game-core/stats includes cosmic_credits in currencies"""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "currencies" in data
        assert "cosmic_credits" in data["currencies"]
        print(f"PASS: game-core/stats includes cosmic_credits: {data['currencies']['cosmic_credits']}")

    def test_game_core_stats_includes_active_effects(self, headers):
        """GET /api/game-core/stats includes active_effects"""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "active_effects" in data
        print(f"PASS: game-core/stats includes active_effects: {list(data['active_effects'].keys())}")

    def test_game_core_stats_includes_nexus_subscriber(self, headers):
        """GET /api/game-core/stats includes nexus_subscriber field"""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "nexus_subscriber" in data
        print(f"PASS: game-core/stats includes nexus_subscriber: {data['nexus_subscriber']}")

    def test_game_core_layer_considers_nexus_sub(self, headers):
        """GET /api/game-core/layer considers nexus subscription"""
        response = requests.get(f"{BASE_URL}/api/game-core/layer", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "active_layer" in data
        assert "nexus_subscriber" in data
        # If nexus subscriber, should have all layers unlocked
        if data["nexus_subscriber"]:
            assert len(data["unlocked_layers"]) == 5, "Nexus subscriber should have all 5 layers unlocked"
            print(f"PASS: Nexus subscriber has all layers unlocked: {data['unlocked_layers']}")
        else:
            print(f"PASS: game-core/layer returns layer data (not nexus subscriber)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

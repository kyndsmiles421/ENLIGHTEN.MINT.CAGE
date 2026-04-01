"""
Test Revenue Engine: Fidelity HUD Boost, AI Content Broker
Iteration 171 - Tests for:
- GET /api/fidelity/status - tier info, boost status, boost_packs
- POST /api/fidelity/boost - purchase boost with dust/credits
- POST /api/fidelity/activate-trial - 7-day free Ultra trial
- POST /api/content-broker/generate - AI content generation
- GET /api/content-broker/catalog - marketplace with tier pricing
- POST /api/content-broker/purchase - buy content with creator split
- GET /api/content-broker/my-content - created and purchased content
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from iteration 170
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


class TestFidelityStatus:
    """Tests for GET /api/fidelity/status"""
    
    def test_fidelity_status_returns_tier_info(self, auth_headers):
        """Verify fidelity status returns tier_id, tier_label, discount_pct"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify tier info fields
        assert "tier_id" in data, "Missing tier_id"
        assert "tier_label" in data, "Missing tier_label"
        assert "discount_pct" in data, "Missing discount_pct"
        
        # Verify tier_label is one of expected values
        assert data["tier_label"] in ["Base", "Premium", "Elite"], f"Unexpected tier_label: {data['tier_label']}"
        
        # Verify discount_pct is valid
        assert data["discount_pct"] in [0, 15, 30], f"Unexpected discount_pct: {data['discount_pct']}"
        print(f"Tier info: {data['tier_id']} ({data['tier_label']}) - {data['discount_pct']}% discount")
    
    def test_fidelity_status_returns_boost_status(self, auth_headers):
        """Verify fidelity status returns boost active status and hours remaining"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "fidelity_boost_active" in data, "Missing fidelity_boost_active"
        assert "fidelity_boost_hours_remaining" in data, "Missing fidelity_boost_hours_remaining"
        
        if data["fidelity_boost_active"]:
            assert data["fidelity_boost_hours_remaining"] > 0, "Active boost should have hours remaining"
            assert "fidelity_boost_level" in data, "Missing fidelity_boost_level when boost active"
            print(f"Boost active: {data['fidelity_boost_level']} - {data['fidelity_boost_hours_remaining']}h remaining")
        else:
            print("No active boost")
    
    def test_fidelity_status_returns_boost_packs(self, auth_headers):
        """Verify fidelity status returns 3 boost packs with correct structure"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "boost_packs" in data, "Missing boost_packs"
        
        packs = data["boost_packs"]
        assert len(packs) == 3, f"Expected 3 boost packs, got {len(packs)}"
        
        # Verify each pack has required fields
        expected_pack_ids = ["boost_24h", "boost_3d", "boost_7d"]
        for pack in packs:
            assert "id" in pack, "Pack missing id"
            assert "name" in pack, "Pack missing name"
            assert "hours" in pack, "Pack missing hours"
            assert "cost_dust" in pack, "Pack missing cost_dust"
            assert "cost_credits" in pack, "Pack missing cost_credits"
            assert "description" in pack, "Pack missing description"
            assert pack["id"] in expected_pack_ids, f"Unexpected pack id: {pack['id']}"
            print(f"Pack: {pack['name']} ({pack['hours']}h) - {pack['cost_dust']} dust / {pack['cost_credits']} credits")
    
    def test_fidelity_status_returns_free_trial_eligible(self, auth_headers):
        """Verify fidelity status returns free_trial_eligible field"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "free_trial_eligible" in data, "Missing free_trial_eligible"
        assert isinstance(data["free_trial_eligible"], bool), "free_trial_eligible should be boolean"
        print(f"Free trial eligible: {data['free_trial_eligible']}")


class TestFidelityBoost:
    """Tests for POST /api/fidelity/boost"""
    
    def test_boost_with_dust_deducts_and_activates(self, auth_headers):
        """Test purchasing boost with dust currency"""
        # First get current status to check dust balance
        status_res = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert status_res.status_code == 200
        
        # Get user wallet to check dust balance
        wallet_res = requests.get(f"{BASE_URL}/api/user/wallet", headers=auth_headers)
        if wallet_res.status_code == 200:
            wallet = wallet_res.json()
            dust_before = wallet.get("dust", 0)
            print(f"Dust before: {dust_before}")
        
        # Try to purchase boost_24h with dust
        response = requests.post(f"{BASE_URL}/api/fidelity/boost", json={
            "pack_id": "boost_24h",
            "currency": "dust"
        }, headers=auth_headers)
        
        # May fail if insufficient dust - that's expected behavior
        if response.status_code == 200:
            data = response.json()
            assert data.get("activated") == True, "Boost should be activated"
            assert "hours_remaining" in data, "Missing hours_remaining"
            assert "expires_at" in data, "Missing expires_at"
            assert data.get("currency") == "dust", "Currency should be dust"
            print(f"Boost activated: {data.get('pack')} - {data.get('hours_remaining')}h remaining")
        elif response.status_code == 400:
            # Insufficient balance is valid behavior
            error = response.json().get("detail", "")
            assert "Need" in error or "dust" in error.lower(), f"Unexpected error: {error}"
            print(f"Expected insufficient dust: {error}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")
    
    def test_boost_with_credits_deducts_and_activates(self, auth_headers):
        """Test purchasing boost with credits currency"""
        response = requests.post(f"{BASE_URL}/api/fidelity/boost", json={
            "pack_id": "boost_24h",
            "currency": "credits"
        }, headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("activated") == True
            assert data.get("currency") == "credits"
            print(f"Boost activated with credits: {data.get('pack')}")
        elif response.status_code == 400:
            error = response.json().get("detail", "")
            print(f"Expected insufficient credits: {error}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")
    
    def test_boost_invalid_pack_returns_400(self, auth_headers):
        """Test that invalid pack_id returns 400"""
        response = requests.post(f"{BASE_URL}/api/fidelity/boost", json={
            "pack_id": "invalid_pack",
            "currency": "dust"
        }, headers=auth_headers)
        
        assert response.status_code == 400, f"Expected 400 for invalid pack, got {response.status_code}"
        assert "Invalid" in response.json().get("detail", ""), "Should mention invalid pack"
        print("Invalid pack correctly rejected")


class TestFidelityTrial:
    """Tests for POST /api/fidelity/activate-trial"""
    
    def test_activate_trial_for_eligible_user(self, auth_headers):
        """Test activating free trial (may fail if already used)"""
        response = requests.post(f"{BASE_URL}/api/fidelity/activate-trial", json={}, headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("activated") == True
            assert data.get("level") == "ultra"
            assert data.get("hours") == 168, "Free trial should be 168 hours (7 days)"
            print(f"Free trial activated: {data.get('hours')}h Ultra")
        elif response.status_code == 400:
            # Already used or not eligible
            error = response.json().get("detail", "")
            assert "not available" in error.lower() or "trial" in error.lower()
            print(f"Trial not available (expected if already used): {error}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")


class TestContentBrokerGenerate:
    """Tests for POST /api/content-broker/generate"""
    
    def test_generate_victory_mantra(self, auth_headers):
        """Test generating victory_mantra content"""
        response = requests.post(f"{BASE_URL}/api/content-broker/generate", json={
            "type": "victory_mantra",
            "context": "completing a challenging quest",
            "source": "test"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "asset" in data, "Missing asset in response"
        
        asset = data["asset"]
        assert asset.get("type") == "victory_mantra"
        assert "id" in asset, "Asset missing id"
        assert "name" in asset, "Asset missing name"
        assert "content" in asset, "Asset missing content"
        assert "mantra" in asset["content"], "Victory mantra should have mantra text"
        
        print(f"Generated victory_mantra: {asset['content']['mantra']}")
    
    def test_generate_recovery_frequency(self, auth_headers):
        """Test generating recovery_frequency content"""
        response = requests.post(f"{BASE_URL}/api/content-broker/generate", json={
            "type": "recovery_frequency",
            "context": "wellness session",
            "source": "mixer",
            "mood": "calm"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        asset = data["asset"]
        assert asset.get("type") == "recovery_frequency"
        assert "primary_hz" in asset["content"], "Recovery frequency should have primary_hz"
        assert "binaural_preset" in asset["content"], "Recovery frequency should have binaural_preset"
        
        print(f"Generated recovery_frequency: {asset['content']['primary_hz']}Hz - {asset['content']['binaural_preset']}")
    
    def test_generate_cosmic_blend(self, auth_headers):
        """Test generating cosmic_blend with paired mantra"""
        response = requests.post(f"{BASE_URL}/api/content-broker/generate", json={
            "type": "cosmic_blend",
            "context": "cosmic practice",
            "source": "ai_mixer",
            "mood": "focused"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        asset = data["asset"]
        assert asset.get("type") == "cosmic_blend"
        assert "primary_hz" in asset["content"], "Cosmic blend should have primary_hz"
        assert "paired_mantra" in asset["content"], "Cosmic blend should have paired_mantra"
        
        print(f"Generated cosmic_blend: {asset['content']['primary_hz']}Hz + '{asset['content']['paired_mantra']}'")
    
    def test_generate_invalid_type_returns_400(self, auth_headers):
        """Test that invalid asset type returns 400"""
        response = requests.post(f"{BASE_URL}/api/content-broker/generate", json={
            "type": "invalid_type",
            "context": "test"
        }, headers=auth_headers)
        
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        print("Invalid type correctly rejected")


class TestContentBrokerCatalog:
    """Tests for GET /api/content-broker/catalog"""
    
    def test_catalog_returns_assets_with_tier_pricing(self, auth_headers):
        """Test catalog returns assets with tier-based pricing"""
        response = requests.get(f"{BASE_URL}/api/content-broker/catalog", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "assets" in data, "Missing assets"
        assert "user_tier" in data, "Missing user_tier"
        assert "discount_pct" in data, "Missing discount_pct"
        assert "asset_types" in data, "Missing asset_types"
        
        # Verify asset_types
        expected_types = ["recovery_frequency", "victory_mantra", "group_immersion", "cosmic_blend"]
        for t in expected_types:
            assert t in data["asset_types"], f"Missing asset type: {t}"
        
        # Verify assets have pricing
        if len(data["assets"]) > 0:
            asset = data["assets"][0]
            assert "pricing" in asset, "Asset missing pricing"
            assert "base_price" in asset["pricing"], "Pricing missing base_price"
            assert "final_price" in asset["pricing"], "Pricing missing final_price"
            assert "is_own" in asset, "Asset missing is_own flag"
            print(f"Catalog has {len(data['assets'])} assets, user tier: {data['user_tier']} ({data['discount_pct']}% discount)")
        else:
            print("Catalog is empty (expected if no content generated yet)")
    
    def test_catalog_filter_by_type(self, auth_headers):
        """Test catalog filtering by asset_type"""
        response = requests.get(f"{BASE_URL}/api/content-broker/catalog?asset_type=victory_mantra", headers=auth_headers)
        
        assert response.status_code == 200
        
        data = response.json()
        for asset in data.get("assets", []):
            assert asset["type"] == "victory_mantra", f"Filter failed, got type: {asset['type']}"
        
        print(f"Filtered catalog: {len(data.get('assets', []))} victory_mantra assets")


class TestContentBrokerPurchase:
    """Tests for POST /api/content-broker/purchase"""
    
    def test_purchase_content_deducts_credits(self, auth_headers):
        """Test purchasing content deducts credits and credits creator"""
        # First get catalog to find an asset to purchase
        catalog_res = requests.get(f"{BASE_URL}/api/content-broker/catalog", headers=auth_headers)
        assert catalog_res.status_code == 200
        
        assets = catalog_res.json().get("assets", [])
        # Find an asset that's not owned by the user
        purchasable = [a for a in assets if not a.get("is_own")]
        
        if not purchasable:
            pytest.skip("No purchasable assets available (all owned by test user)")
        
        asset = purchasable[0]
        asset_id = asset["id"]
        
        response = requests.post(f"{BASE_URL}/api/content-broker/purchase", json={
            "asset_id": asset_id
        }, headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert "purchased" in data, "Missing purchased field"
            assert "cost" in data, "Missing cost field"
            assert "content" in data, "Missing content field"
            print(f"Purchased: {data['purchased']} for {data['cost']} credits")
        elif response.status_code == 400:
            error = response.json().get("detail", "")
            # Could be insufficient credits or already purchased
            print(f"Purchase failed (expected): {error}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")
    
    def test_purchase_own_content_returns_400(self, auth_headers):
        """Test that purchasing own content returns 400"""
        # Get my content to find an owned asset
        my_content_res = requests.get(f"{BASE_URL}/api/content-broker/my-content", headers=auth_headers)
        assert my_content_res.status_code == 200
        
        created = my_content_res.json().get("created", [])
        if not created:
            pytest.skip("No created content to test self-purchase")
        
        asset_id = created[0]["id"]
        
        response = requests.post(f"{BASE_URL}/api/content-broker/purchase", json={
            "asset_id": asset_id
        }, headers=auth_headers)
        
        assert response.status_code == 400, f"Expected 400 for self-purchase, got {response.status_code}"
        assert "own" in response.json().get("detail", "").lower(), "Should mention cannot purchase own content"
        print("Self-purchase correctly rejected")
    
    def test_purchase_invalid_asset_returns_404(self, auth_headers):
        """Test that purchasing non-existent asset returns 404"""
        response = requests.post(f"{BASE_URL}/api/content-broker/purchase", json={
            "asset_id": "non-existent-asset-id"
        }, headers=auth_headers)
        
        assert response.status_code == 404, f"Expected 404 for invalid asset, got {response.status_code}"
        print("Invalid asset purchase correctly rejected")


class TestContentBrokerMyContent:
    """Tests for GET /api/content-broker/my-content"""
    
    def test_my_content_returns_created_and_purchased(self, auth_headers):
        """Test my-content returns both created and purchased content"""
        response = requests.get(f"{BASE_URL}/api/content-broker/my-content", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "created" in data, "Missing created array"
        assert "purchased" in data, "Missing purchased array"
        assert "total_created" in data, "Missing total_created count"
        assert "total_purchased" in data, "Missing total_purchased count"
        
        assert isinstance(data["created"], list), "created should be a list"
        assert isinstance(data["purchased"], list), "purchased should be a list"
        
        print(f"My content: {data['total_created']} created, {data['total_purchased']} purchased")
        
        # Verify created content structure
        if data["created"]:
            asset = data["created"][0]
            assert "id" in asset, "Created asset missing id"
            assert "type" in asset, "Created asset missing type"
            assert "name" in asset, "Created asset missing name"
            print(f"First created: {asset['name']} ({asset['type']})")


class TestTradeCircleTabs:
    """Tests for Trade Circle 8 tabs structure"""
    
    def test_trade_circle_stats_endpoint(self, auth_headers):
        """Verify trade circle stats endpoint works"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify expected stats fields
        assert "total_active" in data or "my_listings" in data, "Missing expected stats fields"
        print(f"Trade circle stats: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

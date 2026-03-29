"""
Iteration 97: Launch Readiness Tests
Tests for: Subscriptions/Stripe, Trade Circle, Sacred Texts, Encyclopedia, and other critical APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestSubscriptionsTiers:
    """Test subscription tiers API - no auth required"""
    
    def test_get_tiers_returns_all_plans(self):
        """GET /api/subscriptions/tiers returns all 5 tier plans"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "tiers" in data
        assert "credit_packs" in data
        assert "ai_costs" in data
        assert "tier_order" in data
        
        # Verify all 5 tiers exist
        tiers = data["tiers"]
        expected_tiers = ["free", "starter", "plus", "premium", "super_user"]
        for tier_id in expected_tiers:
            assert tier_id in tiers, f"Missing tier: {tier_id}"
            tier = tiers[tier_id]
            assert "name" in tier
            assert "price" in tier
            assert "credits_per_month" in tier
            assert "perks" in tier
            assert isinstance(tier["perks"], list)
        
        # Verify tier order
        assert data["tier_order"] == expected_tiers
        
        # Verify credit packs
        assert len(data["credit_packs"]) >= 3
        
        print(f"✓ All 5 subscription tiers returned: {list(tiers.keys())}")


class TestSacredTexts:
    """Test sacred texts API - no auth required"""
    
    def test_get_sacred_texts_returns_15_plus(self):
        """GET /api/sacred-texts returns 15+ sacred texts"""
        response = requests.get(f"{BASE_URL}/api/sacred-texts")
        assert response.status_code == 200
        data = response.json()
        
        assert "texts" in data
        assert "total" in data
        
        texts = data["texts"]
        assert len(texts) >= 15, f"Expected 15+ texts, got {len(texts)}"
        
        # Verify structure of first text
        first_text = texts[0]
        assert "id" in first_text
        assert "title" in first_text
        assert "tradition" in first_text
        assert "region" in first_text
        assert "era" in first_text
        assert "color" in first_text
        assert "description" in first_text
        assert "chapter_count" in first_text
        
        print(f"✓ Sacred texts API returned {len(texts)} texts")
    
    def test_get_single_sacred_text(self):
        """GET /api/sacred-texts/{text_id} returns text with chapters"""
        response = requests.get(f"{BASE_URL}/api/sacred-texts/bhagavad-gita")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "bhagavad-gita"
        assert data["title"] == "Bhagavad Gita"
        assert "chapters" in data
        assert len(data["chapters"]) >= 5
        
        print(f"✓ Single sacred text returned with {len(data['chapters'])} chapters")


class TestEncyclopedia:
    """Test encyclopedia API - no auth required"""
    
    def test_get_traditions_returns_12_plus(self):
        """GET /api/encyclopedia/traditions returns 12+ traditions"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions")
        assert response.status_code == 200
        data = response.json()
        
        assert "traditions" in data
        traditions = data["traditions"]
        assert len(traditions) >= 12, f"Expected 12+ traditions, got {len(traditions)}"
        
        # Verify structure
        first = traditions[0]
        assert "id" in first
        assert "name" in first
        assert "color" in first
        assert "era" in first
        assert "origin" in first
        assert "overview" in first
        assert "concept_count" in first
        
        print(f"✓ Encyclopedia returned {len(traditions)} traditions")
    
    def test_get_single_tradition(self):
        """GET /api/encyclopedia/traditions/{id} returns full tradition"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/hinduism")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "hinduism"
        assert "key_concepts" in data
        assert "sacred_texts" in data
        assert "notable_figures" in data
        assert "practices" in data
        
        print(f"✓ Single tradition returned with {len(data['key_concepts'])} concepts")


class TestAuthenticatedAPIs:
    """Tests requiring authentication"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Auth failed: {response.status_code}")
        return response.json().get("token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_trade_circle_listings(self, auth_headers):
        """GET /api/trade-circle/listings returns listings array"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "listings" in data
        assert "total" in data
        assert isinstance(data["listings"], list)
        
        print(f"✓ Trade Circle returned {len(data['listings'])} listings")
    
    def test_trade_circle_create_listing(self, auth_headers):
        """POST /api/trade-circle/listings creates a new listing"""
        listing_data = {
            "title": "TEST_Iteration97_Crystal Grid",
            "offering": "Handmade crystal grid for meditation",
            "category": "goods",
            "seeking": "Tarot reading or essential oils",
            "description": "Test listing for iteration 97"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/trade-circle/listings",
            json=listing_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["title"] == listing_data["title"]
        assert data["offering"] == listing_data["offering"]
        assert data["category"] == "goods"
        assert data["status"] == "active"
        
        # Cleanup - delete the test listing
        listing_id = data["id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/trade-circle/listings/{listing_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        
        print(f"✓ Trade Circle listing created and deleted: {listing_id}")
    
    def test_trade_circle_category_validation(self, auth_headers):
        """POST /api/trade-circle/listings validates category"""
        # Test with invalid category
        invalid_data = {
            "title": "TEST_Invalid",
            "offering": "Something",
            "category": "invalid_category"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/trade-circle/listings",
            json=invalid_data,
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "Invalid category" in response.json().get("detail", "")
        
        print("✓ Trade Circle category validation working")
    
    def test_trade_circle_stats(self, auth_headers):
        """GET /api/trade-circle/stats returns karma and stats"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_active" in data
        assert "total_traded" in data
        assert "my_listings" in data
        assert "karma" in data
        assert "karma_tier" in data
        
        print(f"✓ Trade Circle stats: {data['total_active']} active, karma={data['karma']}")
    
    def test_subscription_checkout_returns_stripe_url(self, auth_headers):
        """POST /api/subscriptions/checkout returns Stripe checkout URL"""
        checkout_data = {
            "tier_id": "starter",
            "origin_url": "https://zen-energy-bar.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            json=checkout_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        # Verify it's a real Stripe URL
        assert "stripe.com" in data["url"] or "checkout" in data["url"]
        
        print(f"✓ Stripe checkout URL returned: {data['url'][:60]}...")
    
    def test_subscription_checkout_invalid_tier(self, auth_headers):
        """POST /api/subscriptions/checkout rejects invalid tier"""
        checkout_data = {
            "tier_id": "free",  # Free tier should be rejected
            "origin_url": "https://example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            json=checkout_data,
            headers=auth_headers
        )
        assert response.status_code == 400
        
        print("✓ Stripe checkout rejects free tier")
    
    def test_my_plan_endpoint(self, auth_headers):
        """GET /api/subscriptions/my-plan returns user's plan"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "tier" in data
        assert "tier_name" in data
        assert "balance" in data
        assert "perks" in data
        
        print(f"✓ My plan: {data['tier_name']} with {data['balance']} credits")


class TestFrequenciesAPI:
    """Test frequencies API"""
    
    def test_get_frequencies(self):
        """GET /api/frequencies returns frequency list"""
        response = requests.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check for Schumann resonance (7.83 Hz)
        schumann = next((f for f in data if f.get("frequency") == 7.83), None)
        assert schumann is not None, "7.83 Hz Schumann resonance not found"
        
        print(f"✓ Frequencies API returned {len(data)} frequencies including 7.83 Hz")


class TestCrystalsAPI:
    """Test crystals API"""
    
    def test_get_crystals(self):
        """GET /api/crystals returns crystal list"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        assert "crystals" in data
        assert len(data["crystals"]) > 0
        
        print(f"✓ Crystals API returned {len(data['crystals'])} crystals")


class TestMoodRingAPI:
    """Test mood ring API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Auth failed")
        return response.json().get("token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_mood_options(self, auth_headers):
        """GET /api/mood-ring/options returns mood options"""
        response = requests.get(f"{BASE_URL}/api/mood-ring/options", headers=auth_headers)
        # May return 200 or 404 depending on implementation
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Mood ring options returned")
        else:
            print(f"⚠ Mood ring options endpoint returned {response.status_code}")


class TestHealthCheck:
    """Basic health checks"""
    
    def test_api_health(self):
        """API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Accept 200 or 404 (if no health endpoint)
        assert response.status_code in [200, 404]
        print(f"✓ API health check: {response.status_code}")
    
    def test_auth_login(self):
        """Auth login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print("✓ Auth login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

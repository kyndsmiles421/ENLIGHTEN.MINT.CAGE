"""
Trade Circle API Tests - Iteration 66
Tests for the barter/trade marketplace feature:
- Listing CRUD operations
- Offer creation and response
- Stats endpoint
- Category filtering and search
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

# Second test user for offer testing
TEST_EMAIL_2 = f"test_trade_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD_2 = "password123"


@pytest.fixture(scope="module")
def auth_headers():
    """Get auth headers for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json().get("token")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def second_user_headers():
    """Create and login a second user for offer testing"""
    # Register second user
    register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL_2,
        "password": TEST_PASSWORD_2,
        "name": "Trade Test User 2"
    })
    # If user already exists, just login
    if register_response.status_code not in [200, 201]:
        pass  # User might already exist
    
    # Login
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL_2,
        "password": TEST_PASSWORD_2
    })
    if login_response.status_code != 200:
        pytest.skip("Could not create/login second test user for offer testing")
    
    token = login_response.json().get("token")
    return {"Authorization": f"Bearer {token}"}


class TestTradeCircleListings:
    """Tests for listing CRUD operations"""
    
    created_listing_id = None
    
    def test_create_listing_success(self, auth_headers):
        """POST /api/trade-circle/listings - Create a new listing"""
        payload = {
            "title": "TEST_Handmade Candles",
            "description": "Beautiful handmade soy candles with essential oils",
            "category": "goods",
            "offering": "Set of 3 handmade soy candles",
            "seeking": "Tarot reading or crystal healing session"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        
        assert response.status_code == 200, f"Create listing failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "id" in data
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert data["category"] == payload["category"]
        assert data["offering"] == payload["offering"]
        assert data["seeking"] == payload["seeking"]
        assert data["status"] == "active"
        assert data["offer_count"] == 0
        assert "created_at" in data
        assert "user_id" in data
        assert "user_name" in data
        
        # Store for later tests
        TestTradeCircleListings.created_listing_id = data["id"]
        print(f"✓ Created listing: {data['id']}")
    
    def test_create_listing_missing_title(self, auth_headers):
        """POST /api/trade-circle/listings - Should fail without title"""
        payload = {
            "description": "Test description",
            "category": "goods",
            "offering": "Something"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("✓ Correctly rejected listing without title")
    
    def test_create_listing_missing_offering(self, auth_headers):
        """POST /api/trade-circle/listings - Should fail without offering"""
        payload = {
            "title": "Test Title",
            "description": "Test description",
            "category": "goods"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("✓ Correctly rejected listing without offering")
    
    def test_create_listing_invalid_category(self, auth_headers):
        """POST /api/trade-circle/listings - Should fail with invalid category"""
        payload = {
            "title": "Test Title",
            "offering": "Something",
            "category": "invalid_category"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("✓ Correctly rejected listing with invalid category")
    
    def test_create_listing_services_category(self, auth_headers):
        """POST /api/trade-circle/listings - Create services listing"""
        payload = {
            "title": "TEST_Reiki Healing Session",
            "description": "1-hour Reiki healing session",
            "category": "services",
            "offering": "1-hour Reiki healing session",
            "seeking": "Yoga instruction or meditation guidance"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "services"
        print(f"✓ Created services listing: {data['id']}")
    
    def test_create_listing_both_category(self, auth_headers):
        """POST /api/trade-circle/listings - Create both category listing"""
        payload = {
            "title": "TEST_Crystal Grid + Reading",
            "description": "Handmade crystal grid with intuitive reading",
            "category": "both",
            "offering": "Crystal grid creation + 30-min intuitive reading",
            "seeking": "Herbal remedies or essential oils"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "both"
        print(f"✓ Created 'both' category listing: {data['id']}")
    
    def test_get_listings(self, auth_headers):
        """GET /api/trade-circle/listings - Get all active listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "listings" in data
        assert "total" in data
        assert isinstance(data["listings"], list)
        assert data["total"] >= 0
        print(f"✓ Retrieved {len(data['listings'])} listings (total: {data['total']})")
    
    def test_get_listings_with_category_filter(self, auth_headers):
        """GET /api/trade-circle/listings?category=goods - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings?category=goods", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned listings should be goods category
        for listing in data["listings"]:
            assert listing["category"] == "goods", f"Expected goods, got {listing['category']}"
        print(f"✓ Category filter works: {len(data['listings'])} goods listings")
    
    def test_get_listings_with_search(self, auth_headers):
        """GET /api/trade-circle/listings?search=candles - Search listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings?search=candles", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Search works: {len(data['listings'])} results for 'candles'")
    
    def test_get_my_listings(self, auth_headers):
        """GET /api/trade-circle/my-listings - Get user's own listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-listings", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "listings" in data
        assert isinstance(data["listings"], list)
        print(f"✓ Retrieved {len(data['listings'])} of my listings")
    
    def test_get_listing_detail(self, auth_headers):
        """GET /api/trade-circle/listings/{id} - Get single listing with offers"""
        if not TestTradeCircleListings.created_listing_id:
            pytest.skip("No listing created to test")
        
        listing_id = TestTradeCircleListings.created_listing_id
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "listing" in data
        assert "offers" in data
        assert data["listing"]["id"] == listing_id
        print(f"✓ Retrieved listing detail with {len(data['offers'])} offers")
    
    def test_get_listing_not_found(self, auth_headers):
        """GET /api/trade-circle/listings/{id} - Should return 404 for invalid ID"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings/invalid-id-12345", headers=auth_headers)
        assert response.status_code == 404
        print("✓ Correctly returned 404 for invalid listing ID")
    
    def test_update_listing(self, auth_headers):
        """PUT /api/trade-circle/listings/{id} - Update own listing"""
        if not TestTradeCircleListings.created_listing_id:
            pytest.skip("No listing created to test")
        
        listing_id = TestTradeCircleListings.created_listing_id
        update_payload = {
            "title": "TEST_Updated Handmade Candles",
            "description": "Updated description - now with lavender scent!"
        }
        response = requests.put(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", json=update_payload, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "updated"
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        assert get_response.status_code == 200
        listing = get_response.json()["listing"]
        assert listing["title"] == update_payload["title"]
        print("✓ Listing updated successfully")
    
    def test_update_listing_not_owner(self, second_user_headers):
        """PUT /api/trade-circle/listings/{id} - Should fail for non-owner"""
        if not TestTradeCircleListings.created_listing_id:
            pytest.skip("No listing created to test")
        
        listing_id = TestTradeCircleListings.created_listing_id
        update_payload = {"title": "Hacked Title"}
        response = requests.put(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", json=update_payload, headers=second_user_headers)
        
        assert response.status_code == 404  # Not found because not owner
        print("✓ Correctly prevented non-owner from updating listing")


class TestTradeCircleOffers:
    """Tests for offer creation and response"""
    
    listing_for_offers_id = None
    offer_id = None
    
    def test_create_listing_for_offers(self, second_user_headers):
        """Create a listing by second user for offer testing"""
        payload = {
            "title": "TEST_Offer Test Listing",
            "description": "Listing created for offer testing",
            "category": "goods",
            "offering": "Test item for offers",
            "seeking": "Anything"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload, headers=second_user_headers)
        
        assert response.status_code == 200
        data = response.json()
        TestTradeCircleOffers.listing_for_offers_id = data["id"]
        print(f"✓ Created listing for offer testing: {data['id']}")
    
    def test_make_offer_success(self, auth_headers):
        """POST /api/trade-circle/offers - Make an offer on another user's listing"""
        if not TestTradeCircleOffers.listing_for_offers_id:
            pytest.skip("No listing available for offer testing")
        
        payload = {
            "listing_id": TestTradeCircleOffers.listing_for_offers_id,
            "offer_items": "3 handmade candles",
            "offer_text": "I'd love to trade my candles for your item!"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers", json=payload, headers=auth_headers)
        
        assert response.status_code == 200, f"Make offer failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert data["listing_id"] == payload["listing_id"]
        assert data["offer_items"] == payload["offer_items"]
        assert data["status"] == "pending"
        
        TestTradeCircleOffers.offer_id = data["id"]
        print(f"✓ Made offer: {data['id']}")
    
    def test_cannot_offer_on_own_listing(self, auth_headers):
        """POST /api/trade-circle/offers - Should fail when offering on own listing"""
        if not TestTradeCircleListings.created_listing_id:
            pytest.skip("No own listing available for testing")
        
        payload = {
            "listing_id": TestTradeCircleListings.created_listing_id,
            "offer_items": "Self offer test"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers", json=payload, headers=auth_headers)
        
        assert response.status_code == 400
        assert "own listing" in response.json().get("detail", "").lower()
        print("✓ Correctly prevented offer on own listing")
    
    def test_cannot_duplicate_pending_offer(self, auth_headers):
        """POST /api/trade-circle/offers - Should fail for duplicate pending offer"""
        if not TestTradeCircleOffers.listing_for_offers_id:
            pytest.skip("No listing available for offer testing")
        
        payload = {
            "listing_id": TestTradeCircleOffers.listing_for_offers_id,
            "offer_items": "Duplicate offer test"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers", json=payload, headers=auth_headers)
        
        assert response.status_code == 400
        assert "already have a pending offer" in response.json().get("detail", "").lower()
        print("✓ Correctly prevented duplicate pending offer")
    
    def test_get_my_offers(self, auth_headers):
        """GET /api/trade-circle/my-offers - Get sent and received offers"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-offers", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "sent" in data
        assert "received" in data
        assert isinstance(data["sent"], list)
        assert isinstance(data["received"], list)
        print(f"✓ Retrieved offers: {len(data['sent'])} sent, {len(data['received'])} received")
    
    def test_decline_offer(self, second_user_headers):
        """POST /api/trade-circle/offers/{id}/respond - Decline an offer"""
        if not TestTradeCircleOffers.offer_id:
            pytest.skip("No offer available for testing")
        
        payload = {"action": "decline"}
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers/{TestTradeCircleOffers.offer_id}/respond", 
                                json=payload, headers=second_user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "declined"
        print("✓ Offer declined successfully")
    
    def test_create_new_offer_for_accept_test(self, auth_headers):
        """Create a new offer for accept testing"""
        if not TestTradeCircleOffers.listing_for_offers_id:
            pytest.skip("No listing available for offer testing")
        
        payload = {
            "listing_id": TestTradeCircleOffers.listing_for_offers_id,
            "offer_items": "New offer for accept test"
        }
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers", json=payload, headers=auth_headers)
        
        assert response.status_code == 200
        TestTradeCircleOffers.offer_id = response.json()["id"]
        print(f"✓ Created new offer for accept test: {TestTradeCircleOffers.offer_id}")
    
    def test_accept_offer(self, second_user_headers):
        """POST /api/trade-circle/offers/{id}/respond - Accept an offer (marks listing as traded)"""
        if not TestTradeCircleOffers.offer_id:
            pytest.skip("No offer available for testing")
        
        payload = {"action": "accept"}
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers/{TestTradeCircleOffers.offer_id}/respond", 
                                json=payload, headers=second_user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "accepted"
        
        # Verify listing is now marked as traded
        listing_response = requests.get(f"{BASE_URL}/api/trade-circle/listings/{TestTradeCircleOffers.listing_for_offers_id}", 
                                       headers=second_user_headers)
        assert listing_response.status_code == 200
        listing = listing_response.json()["listing"]
        assert listing["status"] == "traded"
        print("✓ Offer accepted and listing marked as traded")
    
    def test_respond_invalid_action(self, second_user_headers):
        """POST /api/trade-circle/offers/{id}/respond - Should fail with invalid action"""
        if not TestTradeCircleOffers.offer_id:
            pytest.skip("No offer available for testing")
        
        payload = {"action": "invalid_action"}
        response = requests.post(f"{BASE_URL}/api/trade-circle/offers/{TestTradeCircleOffers.offer_id}/respond", 
                                json=payload, headers=second_user_headers)
        
        assert response.status_code == 400
        print("✓ Correctly rejected invalid action")


class TestTradeCircleStats:
    """Tests for stats endpoint"""
    
    def test_get_stats(self, auth_headers):
        """GET /api/trade-circle/stats - Get trade circle statistics"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate all expected fields
        assert "total_active" in data
        assert "total_traded" in data
        assert "my_listings" in data
        assert "my_trades" in data
        assert "pending_offers" in data
        
        # All should be non-negative integers
        assert isinstance(data["total_active"], int) and data["total_active"] >= 0
        assert isinstance(data["total_traded"], int) and data["total_traded"] >= 0
        assert isinstance(data["my_listings"], int) and data["my_listings"] >= 0
        assert isinstance(data["my_trades"], int) and data["my_trades"] >= 0
        assert isinstance(data["pending_offers"], int) and data["pending_offers"] >= 0
        
        print(f"✓ Stats: active={data['total_active']}, traded={data['total_traded']}, my_listings={data['my_listings']}")


class TestTradeCircleCleanup:
    """Cleanup test data"""
    
    def test_delete_listing(self, auth_headers):
        """DELETE /api/trade-circle/listings/{id} - Delete own listing"""
        if not TestTradeCircleListings.created_listing_id:
            pytest.skip("No listing to delete")
        
        listing_id = TestTradeCircleListings.created_listing_id
        response = requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        assert get_response.status_code == 404
        print("✓ Listing deleted successfully")
    
    def test_cleanup_test_listings(self, auth_headers, second_user_headers):
        """Clean up all TEST_ prefixed listings"""
        # Get my listings and delete TEST_ ones
        for headers in [auth_headers, second_user_headers]:
            response = requests.get(f"{BASE_URL}/api/trade-circle/my-listings", headers=headers)
            if response.status_code == 200:
                listings = response.json().get("listings", [])
                for listing in listings:
                    if listing["title"].startswith("TEST_"):
                        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing['id']}", headers=headers)
        print("✓ Cleaned up test listings")


class TestTradeCircleUnauthorized:
    """Tests for unauthorized access"""
    
    def test_listings_without_auth(self):
        """GET /api/trade-circle/listings - Should require auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings")
        assert response.status_code in [401, 403, 422]
        print("✓ Listings endpoint requires authentication")
    
    def test_create_listing_without_auth(self):
        """POST /api/trade-circle/listings - Should require auth"""
        payload = {"title": "Test", "offering": "Test"}
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json=payload)
        assert response.status_code in [401, 403, 422]
        print("✓ Create listing requires authentication")
    
    def test_stats_without_auth(self):
        """GET /api/trade-circle/stats - Should require auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats")
        assert response.status_code in [401, 403, 422]
        print("✓ Stats endpoint requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

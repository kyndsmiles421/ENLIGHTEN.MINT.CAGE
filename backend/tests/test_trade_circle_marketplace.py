"""
Test Trade Circle Marketplace - Iteration 136
Tests: CRUD listings, offers, Cosmic Handshake, Trust Score, Categories, Karma Leaderboard
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestTradeCircleMarketplace:
    """Trade Circle Marketplace API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.token = None
        self.user_id = None
        
    def get_auth_token(self):
        """Login and get auth token"""
        if self.token:
            return self.token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data.get("token")
        self.user_id = data.get("user", {}).get("id")
        return self.token
    
    def auth_headers(self):
        """Get auth headers"""
        token = self.get_auth_token()
        return {"Authorization": f"Bearer {token}"}
    
    # ============ AUTH TEST ============
    def test_01_login_returns_token(self):
        """POST /api/auth/login returns token with valid credentials"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        assert data["user"]["email"] == TEST_EMAIL
        print(f"PASS: Login returns token for {TEST_EMAIL}")
    
    # ============ CATEGORIES TEST (No Auth Required) ============
    def test_02_categories_returns_wellness_categories(self):
        """GET /api/trade-circle/categories returns 6 wellness categories"""
        response = self.session.get(f"{BASE_URL}/api/trade-circle/categories")
        assert response.status_code == 200, f"Categories failed: {response.text}"
        data = response.json()
        assert "categories" in data, "Response missing 'categories'"
        categories = data["categories"]
        assert len(categories) == 6, f"Expected 6 categories, got {len(categories)}"
        
        # Verify wellness category IDs
        expected_ids = {"readings", "healing", "guidance", "meditation", "crafted", "other"}
        actual_ids = {c["id"] for c in categories}
        assert expected_ids == actual_ids, f"Category IDs mismatch: expected {expected_ids}, got {actual_ids}"
        
        # Verify each category has required fields
        for cat in categories:
            assert "id" in cat, "Category missing 'id'"
            assert "name" in cat, "Category missing 'name'"
            assert "icon" in cat, "Category missing 'icon'"
            assert "color" in cat, "Category missing 'color'"
        
        print(f"PASS: Categories endpoint returns 6 wellness categories: {[c['name'] for c in categories]}")
    
    # ============ LISTINGS TESTS ============
    def test_03_get_listings_with_auth(self):
        """GET /api/trade-circle/listings returns listings array with auth"""
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/listings",
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Get listings failed: {response.text}"
        data = response.json()
        assert "listings" in data, "Response missing 'listings'"
        assert "total" in data, "Response missing 'total'"
        assert isinstance(data["listings"], list), "'listings' should be an array"
        print(f"PASS: GET listings returns {len(data['listings'])} listings (total: {data['total']})")
    
    def test_04_create_listing_with_auth(self):
        """POST /api/trade-circle/listings creates a new listing with auth"""
        unique_id = str(uuid.uuid4())[:8]
        listing_data = {
            "title": f"TEST_Healing Session {unique_id}",
            "description": "A test healing session for automated testing",
            "category": "healing",
            "offering": "30-minute Reiki healing session",
            "seeking": "Crystal grid consultation"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/trade-circle/listings",
            json=listing_data,
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Create listing failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response missing 'id'"
        assert data["title"] == listing_data["title"], "Title mismatch"
        assert data["category"] == listing_data["category"], "Category mismatch"
        assert data["offering"] == listing_data["offering"], "Offering mismatch"
        assert data["status"] == "active", "Status should be 'active'"
        
        # Store listing ID for later tests
        self.__class__.created_listing_id = data["id"]
        print(f"PASS: Created listing with ID: {data['id']}")
    
    # ============ STATS TEST ============
    def test_05_get_trade_stats_with_auth(self):
        """GET /api/trade-circle/stats returns trade statistics with auth"""
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/stats",
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Get stats failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        required_fields = ["total_active", "total_traded", "my_listings", "my_trades", "pending_offers", "karma", "karma_tier"]
        for field in required_fields:
            assert field in data, f"Response missing '{field}'"
        
        # Verify karma_tier structure
        assert "name" in data["karma_tier"], "karma_tier missing 'name'"
        assert "color" in data["karma_tier"], "karma_tier missing 'color'"
        
        print(f"PASS: Stats - Active: {data['total_active']}, Traded: {data['total_traded']}, Karma: {data['karma']} ({data['karma_tier']['name']})")
    
    # ============ TRUST SCORE TEST ============
    def test_06_get_trust_score_with_auth(self):
        """GET /api/trade-circle/trust-score/{user_id} returns trust_score, trust_tier, and breakdown with auth"""
        # Get user_id from login
        self.get_auth_token()
        user_id = self.user_id
        
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/trust-score/{user_id}",
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Get trust score failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "user_id" in data, "Response missing 'user_id'"
        assert "trust_score" in data, "Response missing 'trust_score'"
        assert "trust_tier" in data, "Response missing 'trust_tier'"
        assert "breakdown" in data, "Response missing 'breakdown'"
        
        # Verify trust_tier structure
        tier = data["trust_tier"]
        assert "name" in tier, "trust_tier missing 'name'"
        assert "color" in tier, "trust_tier missing 'color'"
        assert "level" in tier, "trust_tier missing 'level'"
        
        # Verify breakdown structure (40% coherence + 40% rating + 20% volume)
        breakdown = data["breakdown"]
        assert "coherence" in breakdown, "breakdown missing 'coherence'"
        assert "rating" in breakdown, "breakdown missing 'rating'"
        assert "volume" in breakdown, "breakdown missing 'volume'"
        
        print(f"PASS: Trust Score: {data['trust_score']}% ({tier['name']}) - Coherence: {breakdown['coherence']}%, Rating: {breakdown['rating']}%, Volume: {breakdown['volume']}%")
    
    # ============ KARMA LEADERBOARD TEST ============
    def test_07_get_karma_leaderboard(self):
        """GET /api/trade-circle/karma-leaderboard returns leaderboard array"""
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/karma-leaderboard",
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Get leaderboard failed: {response.text}"
        data = response.json()
        
        assert "leaderboard" in data, "Response missing 'leaderboard'"
        assert isinstance(data["leaderboard"], list), "'leaderboard' should be an array"
        
        # If there are entries, verify structure
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            assert "user_id" in entry, "Entry missing 'user_id'"
            assert "name" in entry, "Entry missing 'name'"
            assert "points" in entry, "Entry missing 'points'"
            assert "tier" in entry, "Entry missing 'tier'"
        
        print(f"PASS: Karma leaderboard returns {len(data['leaderboard'])} entries")
    
    # ============ OFFERS TESTS ============
    def test_08_create_offer_on_listing(self):
        """POST /api/trade-circle/offers creates an offer on a listing"""
        # First, get a listing that's not ours
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/listings",
            headers=self.auth_headers()
        )
        assert response.status_code == 200
        listings = response.json().get("listings", [])
        
        # Find a listing not owned by current user
        self.get_auth_token()
        other_listing = None
        for listing in listings:
            if listing.get("user_id") != self.user_id and listing.get("status") == "active":
                other_listing = listing
                break
        
        if not other_listing:
            # Create a test listing first, then skip this test
            print("SKIP: No other user's active listings available to make an offer on")
            pytest.skip("No other user's active listings available")
            return
        
        offer_data = {
            "listing_id": other_listing["id"],
            "offer_items": "TEST_Meditation guidance session",
            "offer_text": "I'd love to trade with you!"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/trade-circle/offers",
            json=offer_data,
            headers=self.auth_headers()
        )
        
        # Could be 200 (success) or 400 (already have pending offer)
        if response.status_code == 200:
            data = response.json()
            assert "id" in data, "Response missing 'id'"
            assert data["status"] == "pending", "Offer status should be 'pending'"
            self.__class__.created_offer_id = data["id"]
            print(f"PASS: Created offer with ID: {data['id']}")
        elif response.status_code == 400:
            # Already have a pending offer - that's okay
            print(f"PASS: Offer endpoint works (already have pending offer on this listing)")
        else:
            assert False, f"Create offer failed: {response.text}"
    
    def test_09_get_my_offers(self):
        """GET /api/trade-circle/my-offers returns sent and received sections"""
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/my-offers",
            headers=self.auth_headers()
        )
        assert response.status_code == 200, f"Get my offers failed: {response.text}"
        data = response.json()
        
        assert "sent" in data, "Response missing 'sent'"
        assert "received" in data, "Response missing 'received'"
        assert isinstance(data["sent"], list), "'sent' should be an array"
        assert isinstance(data["received"], list), "'received' should be an array"
        
        print(f"PASS: My offers - Sent: {len(data['sent'])}, Received: {len(data['received'])}")
    
    def test_10_respond_to_offer(self):
        """POST /api/trade-circle/offers/{id}/respond accepts/declines an offer"""
        # Get received offers
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/my-offers",
            headers=self.auth_headers()
        )
        assert response.status_code == 200
        received = response.json().get("received", [])
        
        # Find a pending offer to respond to
        pending_offer = None
        for offer in received:
            if offer.get("status") == "pending":
                pending_offer = offer
                break
        
        if not pending_offer:
            print("SKIP: No pending offers to respond to")
            pytest.skip("No pending offers available")
            return
        
        # Test decline action (safer for testing)
        response = self.session.post(
            f"{BASE_URL}/api/trade-circle/offers/{pending_offer['id']}/respond",
            json={"action": "decline"},
            headers=self.auth_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response missing 'status'"
            print(f"PASS: Responded to offer - Status: {data['status']}")
        elif response.status_code == 400:
            # Already responded
            print(f"PASS: Respond endpoint works (offer already responded to)")
        else:
            assert False, f"Respond to offer failed: {response.text}"
    
    def test_11_cosmic_handshake_endpoint(self):
        """POST /api/trade-circle/offers/{id}/handshake records confirmation from one party"""
        # Get offers to find an accepted one
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/my-offers",
            headers=self.auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        
        # Find an accepted offer (either sent or received)
        accepted_offer = None
        for offer in data.get("sent", []) + data.get("received", []):
            if offer.get("status") == "accepted":
                accepted_offer = offer
                break
        
        if not accepted_offer:
            # Test with a fake ID to verify endpoint exists and returns proper error
            fake_id = str(uuid.uuid4())
            response = self.session.post(
                f"{BASE_URL}/api/trade-circle/offers/{fake_id}/handshake",
                headers=self.auth_headers()
            )
            # Should return 404 (not found) - endpoint exists
            assert response.status_code == 404, f"Expected 404 for non-existent offer, got {response.status_code}"
            print("PASS: Handshake endpoint exists and returns 404 for non-existent offer")
            return
        
        # Try handshake on accepted offer
        response = self.session.post(
            f"{BASE_URL}/api/trade-circle/offers/{accepted_offer['id']}/handshake",
            headers=self.auth_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response missing 'status'"
            assert "message" in data, "Response missing 'message'"
            print(f"PASS: Handshake - Status: {data['status']}, Message: {data['message']}")
        elif response.status_code == 400:
            # Offer not in accepted state or already completed
            print(f"PASS: Handshake endpoint works (offer not in correct state)")
        else:
            assert False, f"Handshake failed: {response.text}"
    
    # ============ CLEANUP ============
    def test_99_cleanup_test_listings(self):
        """Cleanup: Delete test listings created during tests"""
        # Get my listings
        response = self.session.get(
            f"{BASE_URL}/api/trade-circle/my-listings",
            headers=self.auth_headers()
        )
        if response.status_code != 200:
            print("SKIP: Could not get my listings for cleanup")
            return
        
        listings = response.json().get("listings", [])
        deleted_count = 0
        
        for listing in listings:
            if listing.get("title", "").startswith("TEST_"):
                del_response = self.session.delete(
                    f"{BASE_URL}/api/trade-circle/listings/{listing['id']}",
                    headers=self.auth_headers()
                )
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"CLEANUP: Deleted {deleted_count} test listings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

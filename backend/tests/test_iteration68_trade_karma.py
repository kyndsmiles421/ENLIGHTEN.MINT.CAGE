"""
Iteration 68: Trade Karma Reputation System Tests
Tests for karma points, tiers, reviews, and leaderboard functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"
TEST_USER_ID = "09830633-c471-4431-9478-30175f8d41e4"


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


class TestTradeCircleStatsWithKarma:
    """Test GET /api/trade-circle/stats returns karma fields"""
    
    def test_stats_returns_karma_fields(self, auth_headers):
        """Stats endpoint should return karma, karma_tier, review_count, avg_rating"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify karma fields exist
        assert "karma" in data, "Missing 'karma' field in stats"
        assert "karma_tier" in data, "Missing 'karma_tier' field in stats"
        assert "review_count" in data, "Missing 'review_count' field in stats"
        assert "avg_rating" in data, "Missing 'avg_rating' field in stats"
        
        # Verify karma_tier structure
        tier = data["karma_tier"]
        assert "name" in tier, "karma_tier missing 'name'"
        assert "color" in tier, "karma_tier missing 'color'"
        assert "min" in tier, "karma_tier missing 'min'"
        
        # Verify existing stats fields still present
        assert "total_active" in data
        assert "total_traded" in data
        assert "my_listings" in data
        assert "pending_offers" in data
        
        print(f"✓ Stats returned karma={data['karma']}, tier={tier['name']}, reviews={data['review_count']}, avg_rating={data['avg_rating']}")


class TestKarmaProfile:
    """Test GET /api/trade-circle/karma/{user_id}"""
    
    def test_get_karma_profile(self, auth_headers):
        """Get karma profile for test user"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma/{TEST_USER_ID}", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "user_id" in data
        assert "points" in data
        assert "tier" in data
        assert "reviews" in data
        assert "completed_trades" in data
        assert "avg_rating" in data
        assert "review_count" in data
        
        # Verify tier structure
        tier = data["tier"]
        assert "name" in tier
        assert "color" in tier
        
        print(f"✓ Karma profile: points={data['points']}, tier={tier['name']}, trades={data['completed_trades']}")
    
    def test_karma_profile_nonexistent_user(self, auth_headers):
        """Karma profile for non-existent user should return 0 points"""
        fake_user_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma/{fake_user_id}", headers=auth_headers)
        # Should return 200 with 0 points (not 404)
        assert response.status_code == 200
        data = response.json()
        assert data["points"] == 0
        assert data["tier"]["name"] == "Seedling"
        print(f"✓ Non-existent user returns 0 karma with Seedling tier")


class TestReviewEndpoint:
    """Test POST /api/trade-circle/reviews"""
    
    def test_review_requires_offer_id(self, auth_headers):
        """Review without offer_id should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/reviews", 
            json={"rating": 5, "comment": "Great trade!"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Review without offer_id returns 400")
    
    def test_review_rating_validation_too_low(self, auth_headers):
        """Rating below 1 should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/reviews",
            json={"offer_id": "fake-offer-id", "rating": 0, "comment": "Test"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Rating 0 returns 400")
    
    def test_review_rating_validation_too_high(self, auth_headers):
        """Rating above 5 should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/reviews",
            json={"offer_id": "fake-offer-id", "rating": 6, "comment": "Test"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Rating 6 returns 400")
    
    def test_review_nonexistent_offer(self, auth_headers):
        """Review for non-existent offer should fail"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/reviews",
            json={"offer_id": "nonexistent-offer-id", "rating": 5, "comment": "Test"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Review for non-existent offer returns 404")


class TestKarmaLeaderboard:
    """Test GET /api/trade-circle/karma-leaderboard"""
    
    def test_leaderboard_returns_list(self, auth_headers):
        """Leaderboard should return list of top karma holders"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma-leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "leaderboard" in data
        assert isinstance(data["leaderboard"], list)
        
        # If there are entries, verify structure
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            assert "user_id" in entry
            assert "name" in entry
            assert "points" in entry
            assert "tier" in entry
            assert "name" in entry["tier"]
            assert "color" in entry["tier"]
            print(f"✓ Leaderboard has {len(data['leaderboard'])} entries, top: {entry['name']} with {entry['points']} pts")
        else:
            print("✓ Leaderboard is empty (no karma earned yet)")


class TestKarmaAwardOnListing:
    """Test that creating a listing awards +1 karma"""
    
    def test_create_listing_awards_karma(self, auth_headers):
        """Creating a listing should award +1 karma"""
        # Get current karma
        stats_before = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers).json()
        karma_before = stats_before.get("karma", 0)
        
        # Create a test listing
        listing_data = {
            "title": f"TEST_Karma_Listing_{uuid.uuid4().hex[:8]}",
            "offering": "Test item for karma testing",
            "seeking": "Anything",
            "category": "goods",
            "description": "Testing karma award on listing creation"
        }
        create_response = requests.post(f"{BASE_URL}/api/trade-circle/listings", 
            json=listing_data, headers=auth_headers)
        assert create_response.status_code == 200, f"Failed to create listing: {create_response.text}"
        listing_id = create_response.json().get("id")
        
        # Get karma after
        stats_after = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers).json()
        karma_after = stats_after.get("karma", 0)
        
        # Verify karma increased by 1
        assert karma_after == karma_before + 1, f"Expected karma to increase by 1: before={karma_before}, after={karma_after}"
        
        # Cleanup - delete the test listing
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        
        print(f"✓ Creating listing awarded +1 karma: {karma_before} -> {karma_after}")


class TestExistingTradeCircleFeatures:
    """Verify existing trade circle features still work"""
    
    def test_browse_listings(self, auth_headers):
        """Browse listings endpoint works"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "listings" in data
        assert "total" in data
        print(f"✓ Browse listings: {data['total']} total listings")
    
    def test_my_listings(self, auth_headers):
        """My listings endpoint works"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-listings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "listings" in data
        print(f"✓ My listings: {len(data['listings'])} listings")
    
    def test_my_offers(self, auth_headers):
        """My offers endpoint works"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/my-offers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sent" in data
        assert "received" in data
        print(f"✓ My offers: {len(data['sent'])} sent, {len(data['received'])} received")
    
    def test_create_and_delete_listing(self, auth_headers):
        """Create and delete listing flow works"""
        # Create
        listing_data = {
            "title": f"TEST_CRUD_{uuid.uuid4().hex[:8]}",
            "offering": "Test offering",
            "category": "services"
        }
        create_res = requests.post(f"{BASE_URL}/api/trade-circle/listings", 
            json=listing_data, headers=auth_headers)
        assert create_res.status_code == 200
        listing_id = create_res.json()["id"]
        
        # Get
        get_res = requests.get(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        assert get_res.status_code == 200
        
        # Delete
        del_res = requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        assert del_res.status_code == 200
        
        print("✓ Create/Get/Delete listing flow works")


class TestKarmaTiers:
    """Test karma tier calculation"""
    
    def test_tier_names_in_stats(self, auth_headers):
        """Verify tier names are valid"""
        valid_tiers = ["Seedling", "Sprout", "Bloom", "Guardian", "Elder", "Luminary"]
        
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        
        tier_name = response.json()["karma_tier"]["name"]
        assert tier_name in valid_tiers, f"Invalid tier name: {tier_name}"
        print(f"✓ Current tier '{tier_name}' is valid")


class TestAuthRequired:
    """Test that karma endpoints require authentication"""
    
    def test_stats_requires_auth(self):
        """Stats endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Stats requires auth")
    
    def test_karma_profile_requires_auth(self):
        """Karma profile requires auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma/{TEST_USER_ID}")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Karma profile requires auth")
    
    def test_leaderboard_requires_auth(self):
        """Leaderboard requires auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/karma-leaderboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Leaderboard requires auth")
    
    def test_reviews_requires_auth(self):
        """Reviews endpoint requires auth"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/reviews", 
            json={"offer_id": "test", "rating": 5})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Reviews requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

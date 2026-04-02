"""
Iteration 200 — Linguistic & Phonics Integration Tests
Tests for:
1. Mastery tier system (GET/POST /api/mastery/*)
2. Escrow system for linguistic assets (POST /api/trade-circle/escrow/create, verify)
3. Linguistic listings (POST /api/trade-circle/listings/linguistic)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # Try to register if login fails
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Grad Test 522"
    })
    if reg_response.status_code in [200, 201]:
        return reg_response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMasteryVowelReference:
    """Test GET /api/mastery/vowel-reference endpoint."""

    def test_vowel_reference_returns_vowels(self, auth_headers):
        """Test that vowel reference returns vowel formant data."""
        response = requests.get(f"{BASE_URL}/api/mastery/vowel-reference", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "vowels" in data, "Response should contain 'vowels'"
        assert "tiers" in data, "Response should contain 'tiers'"
        assert "tesla_frequencies" in data, "Response should contain 'tesla_frequencies'"
        
        # Verify all 5 vowels are present
        vowels = data["vowels"]
        for v in ["A", "E", "I", "O", "U"]:
            assert v in vowels, f"Vowel {v} should be in response"
            assert "f1" in vowels[v], f"Vowel {v} should have f1 formant"
            assert "f2" in vowels[v], f"Vowel {v} should have f2 formant"
            assert "geometry" in vowels[v], f"Vowel {v} should have geometry"
        
        print(f"PASS: GET /api/mastery/vowel-reference returns 5 vowels with formant data")

    def test_vowel_reference_returns_tiers(self, auth_headers):
        """Test that vowel reference returns tier definitions."""
        response = requests.get(f"{BASE_URL}/api/mastery/vowel-reference", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        tiers = data["tiers"]
        assert len(tiers) == 3, "Should have 3 mastery tiers"
        
        # Verify tier structure
        for tier in tiers:
            assert "tier" in tier
            assert "name" in tier
            assert "vowels_required" in tier
            assert "frequencies_required" in tier
        
        # Verify tier 1 requires 5 vowels
        tier1 = next(t for t in tiers if t["tier"] == 1)
        assert tier1["vowels_required"] == 5, "Tier 1 should require 5 vowels"
        
        print(f"PASS: GET /api/mastery/vowel-reference returns 3 tier definitions")


class TestMasteryTier:
    """Test GET /api/mastery/tier endpoint."""

    def test_get_mastery_tier(self, auth_headers):
        """Test getting user's mastery tier."""
        response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "current_tier" in data, "Response should contain 'current_tier'"
        assert "vowels_mastered" in data, "Response should contain 'vowels_mastered'"
        assert "frequencies_mastered" in data, "Response should contain 'frequencies_mastered'"
        assert "bloom_count" in data, "Response should contain 'bloom_count'"
        
        print(f"PASS: GET /api/mastery/tier returns user mastery progress (tier={data['current_tier']})")


class TestMasteryProgress:
    """Test POST /api/mastery/progress endpoint."""

    def test_record_vowel_mastery(self, auth_headers):
        """Test recording vowel mastery progress."""
        response = requests.post(f"{BASE_URL}/api/mastery/progress", 
            headers=auth_headers,
            json={
                "type": "vowel",
                "vowel": "A",
                "confidence": 95,
                "duration_ms": 2000
            })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, "Response should indicate success"
        assert data["type"] == "vowel", "Response type should be 'vowel'"
        assert "A" in data["vowels_mastered"], "Vowel A should be in mastered list"
        
        print(f"PASS: POST /api/mastery/progress (type=vowel, vowel=A) records mastery")

    def test_record_all_vowels_for_tier1(self, auth_headers):
        """Test recording all 5 vowels to achieve Tier 1."""
        vowels_to_master = ["A", "E", "I", "O", "U"]
        
        for vowel in vowels_to_master:
            response = requests.post(f"{BASE_URL}/api/mastery/progress",
                headers=auth_headers,
                json={
                    "type": "vowel",
                    "vowel": vowel,
                    "confidence": 92,
                    "duration_ms": 1800
                })
            assert response.status_code == 200, f"Failed to record vowel {vowel}: {response.text}"
        
        # Verify tier advancement
        tier_response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        assert tier_response.status_code == 200
        
        tier_data = tier_response.json()
        assert len(tier_data["vowels_mastered"]) >= 5, "Should have 5 vowels mastered"
        assert tier_data["current_tier"] >= 1, "Should be at least Tier 1 after mastering all vowels"
        
        print(f"PASS: All 5 vowels mastered, user is now Tier {tier_data['current_tier']}")

    def test_record_frequency_mastery(self, auth_headers):
        """Test recording frequency mastery progress."""
        response = requests.post(f"{BASE_URL}/api/mastery/progress",
            headers=auth_headers,
            json={
                "type": "frequency",
                "hz": 396,
                "accuracy": 88
            })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert 396 in data["frequencies_mastered"], "Frequency 396 should be in mastered list"
        
        print(f"PASS: POST /api/mastery/progress (type=frequency, hz=396) records mastery")

    def test_record_practice_time(self, auth_headers):
        """Test recording practice time."""
        response = requests.post(f"{BASE_URL}/api/mastery/progress",
            headers=auth_headers,
            json={
                "type": "practice_time",
                "seconds": 60
            })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        
        print(f"PASS: POST /api/mastery/progress (type=practice_time, seconds=60) records time")

    def test_invalid_progress_type_rejected(self, auth_headers):
        """Test that invalid progress type is rejected."""
        response = requests.post(f"{BASE_URL}/api/mastery/progress",
            headers=auth_headers,
            json={
                "type": "invalid_type"
            })
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        
        print(f"PASS: Invalid progress type correctly rejected with 400")

    def test_invalid_vowel_rejected(self, auth_headers):
        """Test that invalid vowel is rejected."""
        response = requests.post(f"{BASE_URL}/api/mastery/progress",
            headers=auth_headers,
            json={
                "type": "vowel",
                "vowel": "X"
            })
        assert response.status_code == 400, f"Expected 400 for invalid vowel, got {response.status_code}"
        
        print(f"PASS: Invalid vowel correctly rejected with 400")


class TestMasteryLessons:
    """Test GET /api/mastery/lessons endpoint."""

    def test_get_lessons(self, auth_headers):
        """Test getting lesson list with completion status."""
        response = requests.get(f"{BASE_URL}/api/mastery/lessons", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "lessons" in data, "Response should contain 'lessons'"
        assert "completed_count" in data, "Response should contain 'completed_count'"
        
        lessons = data["lessons"]
        assert len(lessons) >= 3, "Should have at least 3 lessons"
        
        # Verify lesson structure
        for lesson in lessons:
            assert "id" in lesson
            assert "tier" in lesson
            assert "title" in lesson
            assert "completed" in lesson
        
        print(f"PASS: GET /api/mastery/lessons returns {len(lessons)} lessons")


class TestLinguisticEscrow:
    """Test escrow system for linguistic assets."""

    @pytest.fixture
    def other_user_listing_id(self, auth_headers):
        """Find an existing listing from another user to use for escrow testing."""
        # Get listings and find one not owned by the test user
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings?limit=50", headers=auth_headers)
        if response.status_code != 200:
            pytest.skip(f"Failed to get listings: {response.text}")
        
        listings = response.json().get("listings", [])
        
        # Get current user ID
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        if me_response.status_code != 200:
            pytest.skip("Failed to get current user")
        my_user_id = me_response.json().get("id")
        
        # Find a listing from another user
        for listing in listings:
            if listing.get("user_id") != my_user_id and listing.get("status") == "active":
                return listing.get("id")
        
        # If no other user's listing found, skip the test
        pytest.skip("No listings from other users available for escrow testing")

    def test_escrow_create_requires_tier1(self, auth_headers, other_user_listing_id):
        """Test that escrow creation for linguistic assets requires Tier 1 mastery."""
        # First ensure user has Tier 1 (from previous tests)
        tier_response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        tier_data = tier_response.json()
        
        if tier_data["current_tier"] < 1:
            pytest.skip("User needs Tier 1 mastery for this test")
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/linguistic/create",
            headers=auth_headers,
            json={
                "asset_type": "phonetic_mantra",
                "listing_id": other_user_listing_id,
                "verification_data": {"test": True}
            })
        
        # Should succeed if user has Tier 1
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Escrow should have an ID"
        assert data["asset_type"] == "phonetic_mantra"
        assert data["status"] == "pending_verification"
        
        print(f"PASS: POST /api/trade-circle/escrow/linguistic/create creates escrow for linguistic asset")
        return data["id"]

    def test_escrow_verify_with_high_accuracy(self, auth_headers, other_user_listing_id):
        """Test escrow verification with accuracy >= 85 completes trade."""
        # Create escrow first
        create_response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/linguistic/create",
            headers=auth_headers,
            json={
                "asset_type": "vocal_signature",
                "listing_id": other_user_listing_id,
                "verification_data": {}
            })
        
        if create_response.status_code not in [200, 201]:
            pytest.skip(f"Failed to create escrow: {create_response.text}")
        
        escrow_id = create_response.json()["id"]
        
        # Verify with high accuracy
        verify_response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/{escrow_id}/verify",
            headers=auth_headers,
            json={
                "frequency_match": 432,
                "vowel_match": "A",
                "accuracy": 90
            })
        
        assert verify_response.status_code == 200, f"Expected 200, got {verify_response.status_code}: {verify_response.text}"
        
        data = verify_response.json()
        assert data["verified"] == True, "Should be verified with accuracy >= 85"
        assert data["status"] == "completed", "Status should be completed"
        
        print(f"PASS: POST /api/trade-circle/escrow/{escrow_id}/verify completes trade with accuracy=90")

    def test_escrow_verify_with_low_accuracy_fails(self, auth_headers, other_user_listing_id):
        """Test escrow verification with accuracy < 85 fails."""
        # Create escrow first
        create_response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/linguistic/create",
            headers=auth_headers,
            json={
                "asset_type": "phonetic_mantra",
                "listing_id": other_user_listing_id,
                "verification_data": {}
            })
        
        if create_response.status_code not in [200, 201]:
            pytest.skip(f"Failed to create escrow: {create_response.text}")
        
        escrow_id = create_response.json()["id"]
        
        # Verify with low accuracy
        verify_response = requests.post(f"{BASE_URL}/api/trade-circle/escrow/{escrow_id}/verify",
            headers=auth_headers,
            json={
                "frequency_match": 432,
                "vowel_match": "A",
                "accuracy": 70
            })
        
        assert verify_response.status_code == 200
        
        data = verify_response.json()
        assert data["verified"] == False, "Should not be verified with accuracy < 85"
        assert data["status"] == "verification_failed"
        
        print(f"PASS: Escrow verification fails with accuracy=70 (< 85 threshold)")


class TestUserEscrows:
    """Test GET /api/trade-circle/escrows endpoint."""

    def test_get_user_escrows(self, auth_headers):
        """Test getting user's escrow history."""
        response = requests.get(f"{BASE_URL}/api/trade-circle/escrows", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "escrows" in data, "Response should contain 'escrows'"
        
        print(f"PASS: GET /api/trade-circle/escrows returns user's escrow history ({len(data['escrows'])} escrows)")


class TestLinguisticListings:
    """Test POST /api/trade-circle/listings/linguistic endpoint."""

    def test_linguistic_listing_requires_tier1(self, auth_headers):
        """Test that linguistic listing creation requires Tier 1 mastery."""
        # First check user's tier
        tier_response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        tier_data = tier_response.json()
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings/linguistic",
            headers=auth_headers,
            json={
                "asset_type": "phonetic_mantra",
                "title": f"Test Phonetic Mantra {uuid.uuid4().hex[:8]}",
                "description": "A sacred phonetic mantra for testing",
                "frequency_signature": {"base_hz": 432, "vowels": ["A", "O", "U"]},
                "seeking": "Resonance exchange"
            })
        
        if tier_data["current_tier"] >= 1:
            assert response.status_code in [200, 201], f"Expected 200/201 for Tier 1+ user, got {response.status_code}: {response.text}"
            data = response.json()
            assert "id" in data
            assert data["asset_type"] == "phonetic_mantra"
            assert data["requires_escrow"] == True
            print(f"PASS: POST /api/trade-circle/listings/linguistic creates listing for Tier 1+ user")
        else:
            assert response.status_code == 403, f"Expected 403 for non-Tier 1 user, got {response.status_code}"
            print(f"PASS: POST /api/trade-circle/listings/linguistic correctly requires Tier 1")

    def test_invalid_asset_type_rejected(self, auth_headers):
        """Test that invalid asset type is rejected."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings/linguistic",
            headers=auth_headers,
            json={
                "asset_type": "invalid_type",
                "title": "Test Invalid",
                "description": "Test"
            })
        assert response.status_code == 400, f"Expected 400 for invalid asset type, got {response.status_code}"
        
        print(f"PASS: Invalid asset type correctly rejected with 400")


class TestRegressionMasteryEndpoints:
    """Regression tests for existing endpoints that should still work."""

    def test_trade_circle_listings_still_works(self, auth_headers):
        """Test that regular trade circle listings still work."""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
        
        print(f"PASS: GET /api/trade-circle/listings still works (regression)")

    def test_trade_circle_stats_still_works(self, auth_headers):
        """Test that trade circle stats still work."""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "karma" in data
        assert "karma_tier" in data
        
        print(f"PASS: GET /api/trade-circle/stats still works (regression)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

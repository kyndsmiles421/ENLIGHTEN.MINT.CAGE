"""
Test iteration 124 features:
1. Founder Badge API: POST /api/starseed/realm/claim-founder, GET /api/starseed/realm/founder-status
2. Enhanced Leaderboard API: GET /api/starseed/realm/leaderboard (4 categories)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
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
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestFounderBadgeAPI:
    """Test Founder Badge endpoints."""

    def test_founder_status_returns_is_founder(self, auth_headers):
        """GET /api/starseed/realm/founder-status should return founder status."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/founder-status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "is_founder" in data, "Response should contain 'is_founder' field"
        assert isinstance(data["is_founder"], bool), "is_founder should be boolean"
        
        # Per agent context, user already has founder badge
        if data["is_founder"]:
            assert "badge" in data, "Founder should have badge data"
            assert "exclusive_frequency" in data, "Founder should have exclusive_frequency"
            assert data["exclusive_frequency"]["hz"] == 432.11, "Founder frequency should be 432.11Hz"
            assert data["exclusive_frequency"]["label"] == "Founder's Harmonic", "Founder frequency label mismatch"
            print(f"PASS: Founder status confirmed - is_founder={data['is_founder']}, frequency={data['exclusive_frequency']['hz']}Hz")
        else:
            print(f"INFO: User is not a founder yet")

    def test_claim_founder_already_claimed(self, auth_headers):
        """POST /api/starseed/realm/claim-founder should return 'already_claimed' for existing founder."""
        response = requests.post(f"{BASE_URL}/api/starseed/realm/claim-founder", headers=auth_headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data, "Response should contain 'status' field"
        
        # Per agent context, user already claimed founder badge
        if data["status"] == "already_claimed":
            assert "badge" in data, "Already claimed response should include badge"
            print(f"PASS: Founder badge already claimed - badge type: {data['badge'].get('type')}")
        elif data["status"] == "claimed":
            assert "badge" in data, "Claimed response should include badge"
            assert "exclusive_frequency" in data, "Claimed response should include exclusive_frequency"
            print(f"PASS: Founder badge newly claimed - badge: {data['badge'].get('title')}")
        elif data["status"] == "not_eligible":
            print(f"INFO: User not eligible - {data.get('reason')}")
        else:
            pytest.fail(f"Unexpected status: {data['status']}")


class TestEnhancedLeaderboardAPI:
    """Test Enhanced Leaderboard with 4 categories."""

    def test_leaderboard_returns_all_categories(self, auth_headers):
        """GET /api/starseed/realm/leaderboard should return 4 category arrays."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify all 4 categories exist
        assert "leaderboard" in data, "Response should contain 'leaderboard' (Shining Brightest)"
        assert "brightest_aura" in data, "Response should contain 'brightest_aura'"
        assert "most_helpful" in data, "Response should contain 'most_helpful'"
        assert "founders" in data, "Response should contain 'founders'"
        
        # All should be arrays
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        assert isinstance(data["brightest_aura"], list), "brightest_aura should be a list"
        assert isinstance(data["most_helpful"], list), "most_helpful should be a list"
        assert isinstance(data["founders"], list), "founders should be a list"
        
        print(f"PASS: Leaderboard categories - shining={len(data['leaderboard'])}, aura={len(data['brightest_aura'])}, helpful={len(data['most_helpful'])}, founders={len(data['founders'])}")

    def test_leaderboard_shining_brightest_structure(self, auth_headers):
        """Verify Shining Brightest leaderboard entry structure."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        leaderboard = data.get("leaderboard", [])
        
        if len(leaderboard) > 0:
            entry = leaderboard[0]
            required_fields = ["rank", "character_name", "origin_id", "origin_name", "color", "level", "xp", "chapter", "achievements", "is_self", "is_founder"]
            for field in required_fields:
                assert field in entry, f"Shining Brightest entry missing '{field}'"
            print(f"PASS: Shining Brightest entry structure valid - top: {entry['character_name']} (Lvl {entry['level']})")
        else:
            print("INFO: No entries in Shining Brightest leaderboard")

    def test_leaderboard_founders_structure(self, auth_headers):
        """Verify Founders leaderboard entry structure."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        founders = data.get("founders", [])
        
        if len(founders) > 0:
            entry = founders[0]
            required_fields = ["rank", "character_name", "origin_id", "origin_name", "color", "aura_color", "granted_at", "is_self", "is_founder"]
            for field in required_fields:
                assert field in entry, f"Founders entry missing '{field}'"
            assert entry["is_founder"] == True, "Founders entry should have is_founder=True"
            print(f"PASS: Founders entry structure valid - first founder: {entry['character_name']}")
        else:
            print("INFO: No entries in Founders leaderboard")

    def test_leaderboard_brightest_aura_structure(self, auth_headers):
        """Verify Brightest Aura leaderboard entry structure."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        brightest_aura = data.get("brightest_aura", [])
        
        if len(brightest_aura) > 0:
            entry = brightest_aura[0]
            required_fields = ["rank", "character_name", "origin_id", "origin_name", "color", "radiates", "level", "is_self", "is_founder"]
            for field in required_fields:
                assert field in entry, f"Brightest Aura entry missing '{field}'"
            print(f"PASS: Brightest Aura entry structure valid - top: {entry['character_name']} ({entry['radiates']} radiates)")
        else:
            print("INFO: No entries in Brightest Aura leaderboard")

    def test_leaderboard_most_helpful_structure(self, auth_headers):
        """Verify Most Helpful leaderboard entry structure."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        most_helpful = data.get("most_helpful", [])
        
        if len(most_helpful) > 0:
            entry = most_helpful[0]
            required_fields = ["rank", "character_name", "origin_id", "origin_name", "color", "contributions", "level", "is_self", "is_founder"]
            for field in required_fields:
                assert field in entry, f"Most Helpful entry missing '{field}'"
            print(f"PASS: Most Helpful entry structure valid - top: {entry['character_name']} ({entry['contributions']} contributions)")
        else:
            print("INFO: No entries in Most Helpful leaderboard")


class TestExistingRealmEndpoints:
    """Verify existing realm endpoints still work after changes."""

    def test_active_players(self, auth_headers):
        """GET /api/starseed/realm/active-players should work."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/active-players", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "players" in data, "Response should contain 'players'"
        assert "total" in data, "Response should contain 'total'"
        print(f"PASS: Active players endpoint works - {data['total']} players online")

    def test_world_event(self, auth_headers):
        """GET /api/starseed/realm/world-event should work."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/world-event")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert "title" in data, "Response should contain 'title'"
        assert "time_remaining" in data, "Response should contain 'time_remaining'"
        print(f"PASS: World event endpoint works - current event: {data['title']}")

    def test_my_characters(self, auth_headers):
        """GET /api/starseed/my-characters should work."""
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "characters" in data, "Response should contain 'characters'"
        print(f"PASS: My characters endpoint works - {len(data['characters'])} characters found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

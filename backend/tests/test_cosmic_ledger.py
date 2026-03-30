"""
Test Cosmic Ledger APIs - iteration 119
Tests:
- GET /api/starseed/ledger - Universal profile with stats and achievements
- GET /api/starseed/ledger/legendary-paths - Legendary narrative paths
- GET /api/starseed/leaderboard/realms - Multi-category realm leaderboard
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


class TestCosmicLedgerAPIs:
    """Test Cosmic Ledger backend APIs"""

    def test_get_cosmic_ledger(self, auth_headers):
        """Test GET /api/starseed/ledger - Universal profile"""
        response = requests.get(f"{BASE_URL}/api/starseed/ledger", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify stats structure
        assert "stats" in data, "Response should contain 'stats'"
        stats = data["stats"]
        assert "total_characters" in stats
        assert "unique_origins" in stats
        assert "total_gems" in stats
        assert "total_equipment" in stats
        assert "total_xp" in stats
        assert "max_level" in stats
        assert "bosses_defeated" in stats
        assert "crafted_items" in stats
        assert "radiates_received" in stats
        assert "radiates_given" in stats
        
        # Verify achievements structure
        assert "achievements" in data, "Response should contain 'achievements'"
        achievements = data["achievements"]
        assert "earned" in achievements
        assert "total" in achievements
        assert "definitions" in achievements
        assert isinstance(achievements["earned"], list)
        assert isinstance(achievements["definitions"], list)
        
        # Verify legendary_paths structure
        assert "legendary_paths" in data, "Response should contain 'legendary_paths'"
        
        print(f"✓ Cosmic Ledger loaded: {stats['total_characters']} characters, {len(achievements['earned'])} achievements earned")

    def test_get_legendary_paths(self, auth_headers):
        """Test GET /api/starseed/ledger/legendary-paths"""
        response = requests.get(f"{BASE_URL}/api/starseed/ledger/legendary-paths", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify structure
        assert "paths" in data, "Response should contain 'paths'"
        assert "unlocked_count" in data, "Response should contain 'unlocked_count'"
        
        paths = data["paths"]
        assert isinstance(paths, list)
        assert len(paths) > 0, "Should have at least one legendary path defined"
        
        # Verify path structure
        first_path = paths[0]
        assert "id" in first_path
        assert "name" in first_path
        assert "element" in first_path
        assert "required_gems" in first_path
        assert "color" in first_path
        assert "desc" in first_path
        assert "unlocked" in first_path
        assert "progress" in first_path
        
        # Verify progress structure
        progress = first_path["progress"]
        assert isinstance(progress, list)
        if len(progress) > 0:
            assert "gem_id" in progress[0]
            assert "required" in progress[0]
            assert "has" in progress[0]
        
        print(f"✓ Legendary Paths: {len(paths)} paths, {data['unlocked_count']} unlocked")

    def test_get_realm_leaderboard(self, auth_headers):
        """Test GET /api/starseed/leaderboard/realms"""
        response = requests.get(f"{BASE_URL}/api/starseed/leaderboard/realms", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify all leaderboard categories exist
        assert "exploration" in data, "Response should contain 'exploration' leaderboard"
        assert "brightest_aura" in data, "Response should contain 'brightest_aura' leaderboard"
        assert "most_helpful" in data, "Response should contain 'most_helpful' leaderboard"
        assert "first_to_enter" in data, "Response should contain 'first_to_enter' leaderboard"
        
        # Verify exploration structure if entries exist
        exploration = data["exploration"]
        assert isinstance(exploration, list)
        if len(exploration) > 0:
            entry = exploration[0]
            assert "user_id" in entry
            assert "name" in entry
            assert "level" in entry
            assert "origin_id" in entry
            assert "character_name" in entry
        
        # Verify brightest_aura structure if entries exist
        brightest = data["brightest_aura"]
        assert isinstance(brightest, list)
        if len(brightest) > 0:
            entry = brightest[0]
            assert "user_id" in entry
            assert "name" in entry
            assert "radiates" in entry
        
        # Verify most_helpful structure if entries exist
        helpful = data["most_helpful"]
        assert isinstance(helpful, list)
        if len(helpful) > 0:
            entry = helpful[0]
            assert "user_id" in entry
            assert "name" in entry
            assert "radiates_given" in entry
        
        print(f"✓ Realm Leaderboard: {len(exploration)} explorers, {len(brightest)} aura entries, {len(helpful)} helpers")

    def test_ledger_requires_auth(self):
        """Test that ledger endpoints require authentication"""
        # Test without auth header
        response = requests.get(f"{BASE_URL}/api/starseed/ledger")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/starseed/ledger/legendary-paths")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/api/starseed/leaderboard/realms")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
        print("✓ All ledger endpoints properly require authentication")


class TestAchievementDefinitions:
    """Test achievement definitions are complete"""

    def test_achievement_categories(self, auth_headers):
        """Verify all achievement categories are present"""
        response = requests.get(f"{BASE_URL}/api/starseed/ledger", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        definitions = data["achievements"]["definitions"]
        
        # Check categories
        categories = set(ach["category"] for ach in definitions)
        expected_categories = {"exploration", "combat", "crafting", "community", "story", "mastery"}
        
        assert categories == expected_categories, f"Missing categories: {expected_categories - categories}"
        
        # Verify each achievement has required fields
        for ach in definitions:
            assert "id" in ach, f"Achievement missing 'id'"
            assert "name" in ach, f"Achievement missing 'name'"
            assert "desc" in ach, f"Achievement missing 'desc'"
            assert "icon" in ach, f"Achievement missing 'icon'"
            assert "color" in ach, f"Achievement missing 'color'"
            assert "category" in ach, f"Achievement missing 'category'"
        
        print(f"✓ All {len(definitions)} achievements have complete definitions across {len(categories)} categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

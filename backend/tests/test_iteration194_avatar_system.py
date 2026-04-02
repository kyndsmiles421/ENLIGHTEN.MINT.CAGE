"""
Iteration 194: Avatar Customization System Tests
Tests for:
- GET /api/auth/avatar - returns current avatar with available_symbols and available_colors
- PUT /api/auth/avatar - updates avatar color, symbol, and display_name
- PUT /api/auth/avatar - validates color against AVATAR_COLORS list
- PUT /api/auth/avatar - caps display_name at 20 characters
- Avatar persists across requests (GET after PUT returns updated data)
- Regression: GET /api/sync/leaderboard, POST /api/sync/covens, GET /api/cosmic-map/power-spots
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Expected avatar constants from auth.py
EXPECTED_SYMBOLS = [
    "lotus", "star", "moon", "sun", "flame", "leaf",
    "crystal", "feather", "spiral", "eye", "wave", "mountain",
]

EXPECTED_COLORS = [
    "#FBBF24", "#2DD4BF", "#A78BFA", "#F472B6", "#60A5FA",
    "#34D399", "#FB923C", "#818CF8", "#F87171", "#22D3EE",
]


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    return response.json().get("token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAvatarGetEndpoint:
    """Tests for GET /api/auth/avatar"""
    
    def test_get_avatar_returns_200(self, auth_headers):
        """GET /api/auth/avatar returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/auth/avatar returns 200")
    
    def test_get_avatar_has_avatar_object(self, auth_headers):
        """GET /api/auth/avatar returns avatar object"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        data = response.json()
        assert "avatar" in data, "Response missing 'avatar' field"
        assert isinstance(data["avatar"], dict), "avatar should be a dict"
        print(f"PASS: avatar object returned: {data['avatar']}")
    
    def test_get_avatar_has_available_symbols(self, auth_headers):
        """GET /api/auth/avatar returns available_symbols list with 12 symbols"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        data = response.json()
        assert "available_symbols" in data, "Response missing 'available_symbols'"
        assert isinstance(data["available_symbols"], list), "available_symbols should be a list"
        assert len(data["available_symbols"]) == 12, f"Expected 12 symbols, got {len(data['available_symbols'])}"
        assert set(data["available_symbols"]) == set(EXPECTED_SYMBOLS), "Symbols don't match expected"
        print(f"PASS: available_symbols has 12 symbols: {data['available_symbols']}")
    
    def test_get_avatar_has_available_colors(self, auth_headers):
        """GET /api/auth/avatar returns available_colors list with 10 colors"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        data = response.json()
        assert "available_colors" in data, "Response missing 'available_colors'"
        assert isinstance(data["available_colors"], list), "available_colors should be a list"
        assert len(data["available_colors"]) == 10, f"Expected 10 colors, got {len(data['available_colors'])}"
        assert set(data["available_colors"]) == set(EXPECTED_COLORS), "Colors don't match expected"
        print(f"PASS: available_colors has 10 colors: {data['available_colors']}")
    
    def test_get_avatar_object_has_required_fields(self, auth_headers):
        """Avatar object has color, symbol, display_name fields"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        data = response.json()
        avatar = data["avatar"]
        assert "color" in avatar, "avatar missing 'color'"
        assert "symbol" in avatar, "avatar missing 'symbol'"
        assert "display_name" in avatar, "avatar missing 'display_name'"
        print(f"PASS: avatar has all required fields: color={avatar['color']}, symbol={avatar['symbol']}, display_name={avatar['display_name']}")


class TestAvatarPutEndpoint:
    """Tests for PUT /api/auth/avatar"""
    
    def test_put_avatar_updates_successfully(self, auth_headers):
        """PUT /api/auth/avatar updates avatar and returns success"""
        test_avatar = {
            "color": "#2DD4BF",
            "symbol": "moon",
            "display_name": "TestTraveler"
        }
        response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "avatar" in data, "Response missing 'avatar'"
        print(f"PASS: PUT /api/auth/avatar returns success with avatar: {data['avatar']}")
    
    def test_put_avatar_returns_updated_values(self, auth_headers):
        """PUT /api/auth/avatar returns the updated avatar values"""
        test_avatar = {
            "color": "#A78BFA",
            "symbol": "crystal",
            "display_name": "CrystalMaster"
        }
        response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        data = response.json()
        avatar = data["avatar"]
        assert avatar["color"] == "#A78BFA", f"Expected color #A78BFA, got {avatar['color']}"
        assert avatar["symbol"] == "crystal", f"Expected symbol crystal, got {avatar['symbol']}"
        assert avatar["display_name"] == "CrystalMaster", f"Expected display_name CrystalMaster, got {avatar['display_name']}"
        print("PASS: PUT returns correct updated values")
    
    def test_put_avatar_validates_invalid_color(self, auth_headers):
        """PUT /api/auth/avatar with invalid color falls back to default"""
        test_avatar = {
            "color": "#INVALID",
            "symbol": "star",
            "display_name": "TestUser"
        }
        response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Invalid color should fall back to default #FBBF24
        assert data["avatar"]["color"] == "#FBBF24", f"Invalid color should default to #FBBF24, got {data['avatar']['color']}"
        print("PASS: Invalid color falls back to default #FBBF24")
    
    def test_put_avatar_validates_invalid_symbol(self, auth_headers):
        """PUT /api/auth/avatar with invalid symbol falls back to default"""
        test_avatar = {
            "color": "#FBBF24",
            "symbol": "invalid_symbol",
            "display_name": "TestUser"
        }
        response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Invalid symbol should fall back to default 'star'
        assert data["avatar"]["symbol"] == "star", f"Invalid symbol should default to 'star', got {data['avatar']['symbol']}"
        print("PASS: Invalid symbol falls back to default 'star'")
    
    def test_put_avatar_caps_display_name_at_20_chars(self, auth_headers):
        """PUT /api/auth/avatar caps display_name at 20 characters"""
        long_name = "ThisIsAVeryLongDisplayNameThatExceeds20Characters"
        test_avatar = {
            "color": "#FBBF24",
            "symbol": "star",
            "display_name": long_name
        }
        response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data["avatar"]["display_name"]) <= 20, f"display_name should be capped at 20 chars, got {len(data['avatar']['display_name'])}"
        assert data["avatar"]["display_name"] == long_name[:20], f"Expected truncated name, got {data['avatar']['display_name']}"
        print(f"PASS: display_name capped at 20 chars: '{data['avatar']['display_name']}'")


class TestAvatarPersistence:
    """Tests for avatar data persistence"""
    
    def test_avatar_persists_after_update(self, auth_headers):
        """Avatar data persists: GET after PUT returns updated data"""
        # First, update avatar
        unique_name = f"Persist{str(uuid.uuid4())[:6]}"
        test_avatar = {
            "color": "#F472B6",
            "symbol": "flame",
            "display_name": unique_name
        }
        put_response = requests.put(f"{BASE_URL}/api/auth/avatar", json=test_avatar, headers=auth_headers)
        assert put_response.status_code == 200, f"PUT failed: {put_response.status_code}"
        
        # Then, GET and verify persistence
        get_response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        assert get_response.status_code == 200, f"GET failed: {get_response.status_code}"
        data = get_response.json()
        avatar = data["avatar"]
        
        assert avatar["color"] == "#F472B6", f"Color not persisted: expected #F472B6, got {avatar['color']}"
        assert avatar["symbol"] == "flame", f"Symbol not persisted: expected flame, got {avatar['symbol']}"
        assert avatar["display_name"] == unique_name, f"display_name not persisted: expected {unique_name}, got {avatar['display_name']}"
        print(f"PASS: Avatar persists across requests: {avatar}")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_leaderboard_returns_200(self, auth_headers):
        """Regression: GET /api/sync/leaderboard returns 200"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "leaderboard" in data, "Response missing 'leaderboard'"
        print(f"PASS: GET /api/sync/leaderboard returns 200 with {len(data['leaderboard'])} entries")
    
    def test_power_spots_returns_200(self, auth_headers):
        """Regression: GET /api/cosmic-map/power-spots returns 200"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "power_spots" in data, "Response missing 'power_spots'"
        print(f"PASS: GET /api/cosmic-map/power-spots returns 200 with {len(data['power_spots'])} spots")
    
    def test_create_coven_returns_success(self, auth_headers):
        """Regression: POST /api/sync/covens creates coven"""
        # First leave any existing coven
        requests.post(f"{BASE_URL}/api/sync/covens/leave", json={}, headers=auth_headers)
        
        # Create new coven
        coven_name = f"TEST_Avatar_{str(uuid.uuid4())[:6]}"
        response = requests.post(f"{BASE_URL}/api/sync/covens", json={"name": coven_name}, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "invite_code" in data, "Response missing 'invite_code'"
        assert len(data["invite_code"]) == 8, f"invite_code should be 8 chars, got {len(data['invite_code'])}"
        print(f"PASS: POST /api/sync/covens creates coven with invite_code: {data['invite_code']}")
        
        # Cleanup - leave the coven
        requests.post(f"{BASE_URL}/api/sync/covens/leave", json={}, headers=auth_headers)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

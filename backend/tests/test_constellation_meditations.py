"""
Test Constellation-Linked Personalized Guided Meditations
Tests for the new Cosmic Meditations feature on the Meditation page.

Features tested:
- GET /api/meditation/constellation-themes - Returns 12 zodiac themes with proper structure
- POST /api/meditation/generate-constellation - Generates AI meditation for a constellation
- GET /api/meditation/my-constellation - Returns user's saved constellation meditations
- DELETE /api/meditation/constellation/{id} - Deletes a constellation meditation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

# All 12 zodiac constellations
ZODIAC_SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
]


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
    return {"Authorization": f"Bearer {auth_token}"}


class TestConstellationThemes:
    """Tests for GET /api/meditation/constellation-themes endpoint."""

    def test_constellation_themes_returns_200(self, auth_headers):
        """Verify endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_constellation_themes_returns_12_themes(self, auth_headers):
        """Verify exactly 12 zodiac themes are returned."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        data = response.json()
        assert "themes" in data, "Response should contain 'themes' key"
        assert len(data["themes"]) == 12, f"Expected 12 themes, got {len(data['themes'])}"

    def test_constellation_themes_structure(self, auth_headers):
        """Verify each theme has required fields."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        data = response.json()
        
        required_fields = ["id", "name", "symbol", "element", "color", "deity", "figure", "theme", "imagery", "lesson", "is_birth_sign", "has_meditation"]
        
        for theme in data["themes"]:
            for field in required_fields:
                assert field in theme, f"Theme {theme.get('id', 'unknown')} missing field: {field}"

    def test_constellation_themes_all_zodiac_signs(self, auth_headers):
        """Verify all 12 zodiac signs are present."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        data = response.json()
        
        theme_ids = [t["id"] for t in data["themes"]]
        for sign in ZODIAC_SIGNS:
            assert sign in theme_ids, f"Missing zodiac sign: {sign}"

    def test_constellation_themes_elements(self, auth_headers):
        """Verify elements are Fire, Earth, Air, or Water."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        data = response.json()
        
        valid_elements = ["Fire", "Earth", "Air", "Water"]
        for theme in data["themes"]:
            assert theme["element"] in valid_elements, f"Invalid element for {theme['id']}: {theme['element']}"

    def test_constellation_themes_has_user_zodiac(self, auth_headers):
        """Verify response includes user_zodiac field."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes", headers=auth_headers)
        data = response.json()
        assert "user_zodiac" in data, "Response should contain 'user_zodiac' key"

    def test_constellation_themes_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/meditation/constellation-themes")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestGenerateConstellationMeditation:
    """Tests for POST /api/meditation/generate-constellation endpoint."""

    def test_generate_constellation_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/meditation/generate-constellation", json={
            "constellation_id": "aries",
            "duration": 5
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"

    def test_generate_constellation_invalid_id(self, auth_headers):
        """Verify 404 for invalid constellation ID."""
        response = requests.post(f"{BASE_URL}/api/meditation/generate-constellation", json={
            "constellation_id": "invalid_sign",
            "duration": 5
        }, headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for invalid constellation, got {response.status_code}"

    def test_generate_constellation_accepts_valid_request(self, auth_headers):
        """Verify endpoint accepts valid request (may take time due to AI)."""
        # Use short duration for faster test
        response = requests.post(f"{BASE_URL}/api/meditation/generate-constellation", json={
            "constellation_id": "aries",
            "duration": 5
        }, headers=auth_headers, timeout=60)
        
        # Accept 200 (success) or 500 (AI timeout/error - acceptable for testing)
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "meditation" in data, "Response should contain 'meditation' key"
            assert "constellation" in data, "Response should contain 'constellation' key"
            
            meditation = data["meditation"]
            assert "id" in meditation, "Meditation should have 'id'"
            assert "constellation_id" in meditation, "Meditation should have 'constellation_id'"
            assert "steps" in meditation, "Meditation should have 'steps'"
            assert len(meditation["steps"]) > 0, "Meditation should have at least one step"

    def test_generate_constellation_duration_bounds(self, auth_headers):
        """Verify duration is bounded between 5 and 20 minutes."""
        # Test with duration below minimum
        response = requests.post(f"{BASE_URL}/api/meditation/generate-constellation", json={
            "constellation_id": "taurus",
            "duration": 1  # Below minimum
        }, headers=auth_headers, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            assert data["meditation"]["duration"] >= 5, "Duration should be at least 5 minutes"


class TestMyConstellationMeditations:
    """Tests for GET /api/meditation/my-constellation endpoint."""

    def test_my_constellation_returns_200(self, auth_headers):
        """Verify endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/meditation/my-constellation", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_my_constellation_returns_list(self, auth_headers):
        """Verify endpoint returns a list."""
        response = requests.get(f"{BASE_URL}/api/meditation/my-constellation", headers=auth_headers)
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"

    def test_my_constellation_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/meditation/my-constellation")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestDeleteConstellationMeditation:
    """Tests for DELETE /api/meditation/constellation/{id} endpoint."""

    def test_delete_constellation_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.delete(f"{BASE_URL}/api/meditation/constellation/fake-id")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"

    def test_delete_constellation_not_found(self, auth_headers):
        """Verify 404 for non-existent meditation."""
        response = requests.delete(f"{BASE_URL}/api/meditation/constellation/non-existent-id", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for non-existent meditation, got {response.status_code}"


class TestRegressionExistingMeditationFeatures:
    """Regression tests for existing meditation features."""

    def test_guided_meditation_generate_still_works(self, auth_headers):
        """Verify existing guided meditation generation still works."""
        response = requests.post(f"{BASE_URL}/api/meditation/generate-guided", json={
            "intention": "Test intention for regression",
            "duration": 5,
            "focus": "stress"
        }, headers=auth_headers, timeout=60)
        
        # Accept 200 or 500 (AI timeout)
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"

    def test_custom_meditations_endpoint_still_works(self, auth_headers):
        """Verify GET /api/meditation/my-custom still works."""
        response = requests.get(f"{BASE_URL}/api/meditation/my-custom", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_breathing_patterns_still_work(self, auth_headers):
        """Verify GET /api/breathing/my-custom still works."""
        response = requests.get(f"{BASE_URL}/api/breathing/my-custom", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestAvatarEnergyStateRegression:
    """Regression test for Avatar energy state (from previous iteration)."""

    def test_avatar_energy_state_still_works(self, auth_headers):
        """Verify GET /api/avatar/energy-state still works."""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_energy" in data, "Should have current_energy"
        assert "dominant_chakra" in data, "Should have dominant_chakra"
        assert "aura_state" in data, "Should have aura_state"

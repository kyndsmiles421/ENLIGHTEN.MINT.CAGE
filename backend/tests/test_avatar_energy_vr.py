"""
Test Avatar Energy State and VR Features
Tests for:
- GET /api/avatar/energy-state - Returns energy data with mood, chakra, aura, recommendations
- GET /api/avatar - Returns saved avatar config
- POST /api/avatar - Saves avatar config
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
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
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestAvatarEnergyState:
    """Tests for GET /api/avatar/energy-state endpoint"""

    def test_energy_state_returns_200(self, auth_headers):
        """Energy state endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_energy_state_has_current_energy(self, auth_headers):
        """Energy state has current_energy field (0-1 float)"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "current_energy" in data, "Missing current_energy field"
        assert isinstance(data["current_energy"], (int, float)), "current_energy should be numeric"
        assert 0 <= data["current_energy"] <= 1, f"current_energy should be 0-1, got {data['current_energy']}"

    def test_energy_state_has_base_energy(self, auth_headers):
        """Energy state has base_energy field"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "base_energy" in data, "Missing base_energy field"
        assert isinstance(data["base_energy"], (int, float)), "base_energy should be numeric"

    def test_energy_state_has_energy_shift(self, auth_headers):
        """Energy state has energy_shift field"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "energy_shift" in data, "Missing energy_shift field"
        assert isinstance(data["energy_shift"], (int, float)), "energy_shift should be numeric"

    def test_energy_state_has_current_mood(self, auth_headers):
        """Energy state has current_mood field"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "current_mood" in data, "Missing current_mood field"
        assert isinstance(data["current_mood"], str), "current_mood should be string"

    def test_energy_state_has_dominant_chakra(self, auth_headers):
        """Energy state has dominant_chakra with index, name, color, message"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "dominant_chakra" in data, "Missing dominant_chakra field"
        chakra = data["dominant_chakra"]
        assert "index" in chakra, "dominant_chakra missing index"
        assert "name" in chakra, "dominant_chakra missing name"
        assert "color" in chakra, "dominant_chakra missing color"
        assert "message" in chakra, "dominant_chakra missing message"

    def test_energy_state_has_aura_state(self, auth_headers):
        """Energy state has aura_state with intensity, glow, particles, description"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "aura_state" in data, "Missing aura_state field"
        aura = data["aura_state"]
        assert "intensity" in aura, "aura_state missing intensity"
        assert "glow" in aura, "aura_state missing glow"
        assert "particles" in aura, "aura_state missing particles"
        assert "description" in aura, "aura_state missing description"

    def test_energy_state_has_activity_boosts(self, auth_headers):
        """Energy state has activity_boosts array"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "activity_boosts" in data, "Missing activity_boosts field"
        assert isinstance(data["activity_boosts"], list), "activity_boosts should be array"

    def test_energy_state_has_trend(self, auth_headers):
        """Energy state has trend array"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "trend" in data, "Missing trend field"
        assert isinstance(data["trend"], list), "trend should be array"

    def test_energy_state_has_recommendation(self, auth_headers):
        """Energy state has recommendation with action, message, urgency"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state", headers=auth_headers)
        data = response.json()
        assert "recommendation" in data, "Missing recommendation field"
        rec = data["recommendation"]
        assert "action" in rec, "recommendation missing action"
        assert "message" in rec, "recommendation missing message"
        assert "urgency" in rec, "recommendation missing urgency"

    def test_energy_state_requires_auth(self):
        """Energy state endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/avatar/energy-state")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestAvatarCRUD:
    """Tests for GET/POST /api/avatar endpoints"""

    def test_get_avatar_returns_200(self, auth_headers):
        """GET /api/avatar returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_get_avatar_has_body_type(self, auth_headers):
        """GET /api/avatar returns body_type field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "body_type" in data, "Missing body_type field"

    def test_get_avatar_has_aura_color(self, auth_headers):
        """GET /api/avatar returns aura_color field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "aura_color" in data, "Missing aura_color field"

    def test_get_avatar_has_aura_intensity(self, auth_headers):
        """GET /api/avatar returns aura_intensity field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "aura_intensity" in data, "Missing aura_intensity field"

    def test_get_avatar_has_silhouette(self, auth_headers):
        """GET /api/avatar returns silhouette field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "silhouette" in data, "Missing silhouette field"

    def test_get_avatar_has_robe_style(self, auth_headers):
        """GET /api/avatar returns robe_style field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "robe_style" in data, "Missing robe_style field"

    def test_get_avatar_has_particle_density(self, auth_headers):
        """GET /api/avatar returns particle_density field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "particle_density" in data, "Missing particle_density field"

    def test_get_avatar_has_glow_style(self, auth_headers):
        """GET /api/avatar returns glow_style field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "glow_style" in data, "Missing glow_style field"

    def test_get_avatar_has_energy_trails(self, auth_headers):
        """GET /api/avatar returns energy_trails field"""
        response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        data = response.json()
        assert "energy_trails" in data, "Missing energy_trails field"

    def test_post_avatar_saves_config(self, auth_headers):
        """POST /api/avatar saves avatar config and returns saved data"""
        test_config = {
            "body_type": "broad",
            "aura_color": "#2DD4BF",
            "aura_intensity": 0.8,
            "silhouette": "warrior",
            "robe_style": "ceremonial",
            "robe_color": "#4C1D95",
            "chakra_emphasis": "3",
            "particle_density": "dense",
            "glow_style": "radiant",
            "energy_trails": True
        }
        response = requests.post(f"{BASE_URL}/api/avatar", json=test_config, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "saved", "Expected status: saved"
        assert "avatar" in data, "Missing avatar in response"

    def test_post_avatar_persists_data(self, auth_headers):
        """POST /api/avatar persists data - verify with GET"""
        test_config = {
            "body_type": "slender",
            "aura_color": "#FCD34D",
            "aura_intensity": 0.7,
            "silhouette": "lotus",
            "robe_style": "flowing",
            "robe_color": "#1E1B4B",
            "chakra_emphasis": "all",
            "particle_density": "medium",
            "glow_style": "soft",
            "energy_trails": False
        }
        # Save
        save_response = requests.post(f"{BASE_URL}/api/avatar", json=test_config, headers=auth_headers)
        assert save_response.status_code == 200

        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/avatar", headers=auth_headers)
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["body_type"] == "slender", f"body_type not persisted: {data.get('body_type')}"
        assert data["aura_color"] == "#FCD34D", f"aura_color not persisted: {data.get('aura_color')}"
        assert data["silhouette"] == "lotus", f"silhouette not persisted: {data.get('silhouette')}"

    def test_get_avatar_requires_auth(self):
        """GET /api/avatar requires authentication"""
        response = requests.get(f"{BASE_URL}/api/avatar")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"

    def test_post_avatar_requires_auth(self):
        """POST /api/avatar requires authentication"""
        response = requests.post(f"{BASE_URL}/api/avatar", json={"body_type": "balanced"})
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestRegressionChecks:
    """Regression tests to ensure existing features still work"""

    def test_yoga_styles_endpoint(self, auth_headers):
        """GET /api/yoga/styles still works"""
        response = requests.get(f"{BASE_URL}/api/yoga/styles", headers=auth_headers)
        assert response.status_code == 200, f"Yoga styles failed: {response.status_code}"
        data = response.json()
        assert "styles" in data, "Missing styles in response"
        assert len(data["styles"]) > 0, "No yoga styles returned"

    def test_mudras_endpoint(self, auth_headers):
        """GET /api/mudras still works"""
        response = requests.get(f"{BASE_URL}/api/mudras", headers=auth_headers)
        assert response.status_code == 200, f"Mudras failed: {response.status_code}"

    def test_star_chart_endpoint(self, auth_headers):
        """GET /api/star-chart/constellations still works"""
        response = requests.get(f"{BASE_URL}/api/star-chart/constellations", headers=auth_headers)
        assert response.status_code == 200, f"Star chart constellations failed: {response.status_code}"

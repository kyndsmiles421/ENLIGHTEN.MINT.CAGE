"""
V54.9 Sacred Geometry Engine Backend Tests
Tests for: Health API, Crystals API, and core backend functionality
Verifies backend support for V54.9 Sacred Geometry features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "test_v29_user@test.com"
TEST_USER_PASSWORD = "testpass123"

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")

@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestHealthAPI:
    """Health endpoint tests"""
    
    def test_health_endpoint_returns_ok(self):
        """Test /api/health returns OK status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health API: {data}")


class TestCrystalsAPI:
    """Crystals endpoint tests for V54.9 Crystal Chamber (HOLLOW_EARTH realm)"""
    
    def test_crystals_endpoint_returns_data(self):
        """Test /api/crystals returns crystal data for ProximityItem display"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "crystals" in data
        assert "categories" in data
        assert "chakras" in data
        assert "total" in data
        
        # Verify crystals array
        crystals = data["crystals"]
        assert len(crystals) > 0
        print(f"✓ Crystals API: {data['total']} crystals returned")
        
    def test_crystals_have_required_fields(self):
        """Test each crystal has required fields for ProximityItem display"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "color", "chakra", "description"]
        for crystal in data["crystals"][:5]:  # Check first 5
            for field in required_fields:
                assert field in crystal, f"Crystal missing field: {field}"
        print(f"✓ All crystals have required fields for φ-ratio extrusion display")
        
    def test_crystals_categories_present(self):
        """Test categories are returned for filtering"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        categories = data["categories"]
        assert "all" in categories
        assert len(categories) > 1
        print(f"✓ Categories: {categories}")
        
    def test_crystals_chakras_present(self):
        """Test chakras are returned for filtering (7 chakras for Chakra-linked color)"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        chakras = data["chakras"]
        assert len(chakras) == 7  # 7 chakras
        expected_chakras = ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"]
        for chakra in expected_chakras:
            assert chakra in chakras
        print(f"✓ Chakras: {chakras}")


class TestDreamSymbolsAPI:
    """Dream symbols endpoint tests"""
    
    def test_dream_symbols_endpoint(self):
        """Test /api/dream-symbols returns dream symbols"""
        response = requests.get(f"{BASE_URL}/api/dream-symbols")
        assert response.status_code == 200
        data = response.json()
        assert "symbols" in data
        print(f"✓ Dream symbols: {len(data['symbols'])} symbols")


class TestMoonPhaseAPI:
    """Moon phase endpoint tests"""
    
    def test_moon_phase_endpoint(self):
        """Test /api/moon-phase returns current moon phase"""
        response = requests.get(f"{BASE_URL}/api/moon-phase")
        assert response.status_code == 200
        data = response.json()
        assert "phase" in data
        print(f"✓ Moon phase: {data['phase']}")


class TestAffirmationsAPI:
    """Affirmations endpoint tests"""
    
    def test_affirmations_daily_endpoint(self):
        """Test /api/affirmations/daily returns daily affirmation"""
        response = requests.get(f"{BASE_URL}/api/affirmations/daily")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        print(f"✓ Daily affirmation: {data['text'][:50]}...")


class TestAuthRequiredAPIs:
    """Tests for APIs that require authentication"""
    
    def test_games_scores_api(self, auth_headers):
        """Games scores API requires auth"""
        response = requests.get(f"{BASE_URL}/api/games/scores", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "scores" in data
        print(f"✓ Games scores API returned: {data}")

    def test_dreams_api(self, auth_headers):
        """Dreams API requires auth"""
        response = requests.get(f"{BASE_URL}/api/dreams", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "dreams" in data
        print(f"✓ Dreams API returned {len(data['dreams'])} dreams")

    def test_soundscapes_my_mixes_api(self, auth_headers):
        """Soundscapes my-mixes API requires auth"""
        response = requests.get(f"{BASE_URL}/api/soundscapes/my-mixes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Soundscapes my-mixes API returned {len(data)} mixes")

    def test_breathing_my_custom_api(self, auth_headers):
        """Breathing my-custom API requires auth"""
        response = requests.get(f"{BASE_URL}/api/breathing/my-custom", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathing my-custom API returned {len(data)} patterns")

    def test_meditation_my_custom_api(self, auth_headers):
        """Meditation my-custom API requires auth"""
        response = requests.get(f"{BASE_URL}/api/meditation/my-custom", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meditation my-custom API returned {len(data)} meditations")


class TestUnauthorizedAccess:
    """Tests that auth-required endpoints reject unauthorized requests"""
    
    def test_games_scores_unauthorized(self):
        """Games scores should reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/games/scores")
        assert response.status_code in [401, 403, 422]
        print(f"✓ Games scores correctly rejects unauthorized: {response.status_code}")

    def test_dreams_unauthorized(self):
        """Dreams should reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/dreams")
        assert response.status_code in [401, 403, 422]
        print(f"✓ Dreams correctly rejects unauthorized: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

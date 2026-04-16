"""
V54.8 Avatar Presence System - Backend API Tests
Tests for spatial pages, auth-required endpoints, and crystal/games/dreams/soundscapes APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

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


class TestHealthAndBasicAPIs:
    """Basic health and public API tests"""
    
    def test_health_endpoint(self):
        """Health check should return OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health check passed: {data}")

    def test_crystals_api(self):
        """Crystals API should return crystal data"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert "crystals" in data or isinstance(data, list)
        crystals = data.get("crystals", data)
        assert len(crystals) > 0
        print(f"✓ Crystals API returned {len(crystals)} crystals")

    def test_dream_symbols_api(self):
        """Dream symbols API should return symbols"""
        response = requests.get(f"{BASE_URL}/api/dream-symbols")
        assert response.status_code == 200
        data = response.json()
        assert "symbols" in data
        print(f"✓ Dream symbols API returned {len(data['symbols'])} symbols")

    def test_moon_phase_api(self):
        """Moon phase API should return current phase"""
        response = requests.get(f"{BASE_URL}/api/moon-phase")
        assert response.status_code == 200
        data = response.json()
        assert "phase" in data
        print(f"✓ Moon phase API returned: {data['phase']}")


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
        # Should return a list of mixes (could be empty)
        assert isinstance(data, list)
        print(f"✓ Soundscapes my-mixes API returned {len(data)} mixes")

    def test_affirmations_my_sets_api(self, auth_headers):
        """Affirmations my-sets API requires auth"""
        response = requests.get(f"{BASE_URL}/api/affirmations/my-sets", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Affirmations my-sets API returned {len(data)} sets")

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


class TestAcademyAPIs:
    """Tests for Academy page APIs"""
    
    def test_academy_programs_api(self, auth_headers):
        """Academy programs API requires auth"""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "programs" in data
        print(f"✓ Academy programs API returned {len(data['programs'])} programs")

    def test_academy_accreditation_api(self, auth_headers):
        """Academy accreditation API requires auth"""
        response = requests.get(f"{BASE_URL}/api/academy/accreditation", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Should have resonance_score or similar fields
        print(f"✓ Academy accreditation API returned: {list(data.keys())}")


class TestDreamsPatterns:
    """Tests for Dreams patterns API"""
    
    def test_dreams_patterns_api(self, auth_headers):
        """Dreams patterns API requires auth"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Should have total, symbol_frequency, etc.
        print(f"✓ Dreams patterns API returned: {list(data.keys())}")


class TestAffirmationsDaily:
    """Tests for Affirmations daily API"""
    
    def test_affirmations_daily_api(self):
        """Affirmations daily API is public"""
        response = requests.get(f"{BASE_URL}/api/affirmations/daily")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        print(f"✓ Affirmations daily API returned: {data['text'][:50]}...")


class TestUnauthorizedAccess:
    """Tests that auth-required endpoints reject unauthorized requests"""
    
    def test_games_scores_unauthorized(self):
        """Games scores should reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/games/scores")
        # Should return 401 or 403
        assert response.status_code in [401, 403, 422]
        print(f"✓ Games scores correctly rejects unauthorized: {response.status_code}")

    def test_dreams_unauthorized(self):
        """Dreams should reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/dreams")
        assert response.status_code in [401, 403, 422]
        print(f"✓ Dreams correctly rejects unauthorized: {response.status_code}")

    def test_soundscapes_mixes_unauthorized(self):
        """Soundscapes my-mixes should reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/soundscapes/my-mixes")
        assert response.status_code in [401, 403, 422]
        print(f"✓ Soundscapes my-mixes correctly rejects unauthorized: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

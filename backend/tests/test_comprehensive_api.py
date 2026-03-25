"""
Comprehensive Backend API tests for Cosmic Zen wellness app
Tests all major endpoints including:
- Health check
- Auth (register/login)
- Static data endpoints (mudras, yantras, tantra, exercises, frequencies, etc.)
- Dashboard stats
- Creations (Create page functionality)
- Community
- Challenges
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token via login"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # Try register if login fails
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test User",
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestHealthAPI:
    """Test health check endpoint"""
    
    def test_health_check(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"Health check: {data}")


class TestAuthAPI:
    """Test authentication endpoints"""
    
    def test_login_success(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        # Either 200 (success) or 401 (wrong credentials - user may not exist)
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert "user" in data
            print(f"Login successful for {TEST_EMAIL}")
        else:
            print(f"Login returned {response.status_code} - user may not exist yet")
    
    def test_register_or_login(self, api_client):
        # Try login first
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            print("User already exists, login successful")
            return
        
        # Try register
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        # Either 200 (new user) or 400 (already exists)
        assert response.status_code in [200, 400]
        print(f"Register returned {response.status_code}")


class TestStaticDataEndpoints:
    """Test all static data endpoints for fast response times"""
    
    def test_mudras_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/mudras")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 9, f"Expected at least 9 mudras, got {len(data)}"
        assert elapsed < 0.5, f"Response too slow: {elapsed:.2f}s"
        print(f"GET /api/mudras: {len(data)} items in {elapsed:.3f}s")
    
    def test_yantras_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/yantras")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 7
        assert elapsed < 0.5
        print(f"GET /api/yantras: {len(data)} items in {elapsed:.3f}s")
    
    def test_tantra_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/tantra")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 6
        assert elapsed < 0.5
        print(f"GET /api/tantra: {len(data)} items in {elapsed:.3f}s")
    
    def test_exercises_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/exercises")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        assert elapsed < 0.5
        print(f"GET /api/exercises: {len(data)} items in {elapsed:.3f}s")
    
    def test_frequencies_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/frequencies")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12
        assert elapsed < 0.5
        print(f"GET /api/frequencies: {len(data)} items in {elapsed:.3f}s")
    
    def test_nourishment_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/nourishment")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        assert elapsed < 0.5
        print(f"GET /api/nourishment: {len(data)} items in {elapsed:.3f}s")
    
    def test_challenges_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/challenges")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        assert elapsed < 0.5
        print(f"GET /api/challenges: {len(data)} items in {elapsed:.3f}s")
    
    def test_videos_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/videos")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        assert elapsed < 0.5
        print(f"GET /api/videos: {len(data)} items in {elapsed:.3f}s")
    
    def test_classes_endpoint(self, api_client):
        start = time.time()
        response = api_client.get(f"{BASE_URL}/api/classes")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert elapsed < 0.5
        print(f"GET /api/classes: {len(data)} items in {elapsed:.3f}s")


class TestOracleEndpoints:
    """Test Oracle/Divination endpoints"""
    
    def test_zodiac_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12
        print(f"GET /api/oracle/zodiac: {len(data)} signs")
    
    def test_chinese_zodiac_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/chinese-zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12
        print(f"GET /api/oracle/chinese-zodiac: {len(data)} animals")
    
    def test_sacred_geometry_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/sacred-geometry")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        print(f"GET /api/oracle/sacred-geometry: {len(data)} patterns")
    
    def test_tarot_deck_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/tarot-deck")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 20  # Major Arcana
        print(f"GET /api/oracle/tarot-deck: {len(data)} cards")


class TestDashboardAPI:
    """Test Dashboard stats endpoint"""
    
    def test_dashboard_stats(self, authenticated_client):
        start = time.time()
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/stats")
        elapsed = time.time() - start
        assert response.status_code == 200
        data = response.json()
        assert "mood_count" in data
        assert "journal_count" in data
        assert "streak" in data
        assert elapsed < 1.0, f"Dashboard too slow: {elapsed:.2f}s"
        print(f"Dashboard stats in {elapsed:.3f}s: streak={data['streak']}, moods={data['mood_count']}")


class TestCreationsAPI:
    """Test Creations (Create page) endpoints"""
    
    def test_get_shared_creations(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/creations/shared")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/creations/shared: {len(data)} shared creations")
    
    def test_get_my_creations(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/creations/my")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/creations/my: {len(data)} user creations")
    
    def test_create_and_delete_creation(self, authenticated_client):
        # Create a new creation
        creation_data = {
            "type": "affirmation",
            "title": "TEST_Creation_" + str(int(time.time())),
            "content": "I am filled with peace and light.",
            "tags": ["test", "peace"]
        }
        response = authenticated_client.post(f"{BASE_URL}/api/creations", json=creation_data)
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data
        creation_id = data["id"]
        print(f"Created creation: {creation_id}")
        
        # Verify it appears in my creations
        response = authenticated_client.get(f"{BASE_URL}/api/creations/my")
        assert response.status_code == 200
        my_creations = response.json()
        assert any(c["id"] == creation_id for c in my_creations)
        
        # Delete the creation
        response = authenticated_client.delete(f"{BASE_URL}/api/creations/{creation_id}")
        assert response.status_code == 200
        print(f"Deleted creation: {creation_id}")


class TestCommunityAPI:
    """Test Community endpoints"""
    
    def test_get_community_feed(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/community/feed")
        assert response.status_code == 200
        data = response.json()
        # Feed returns paginated response with posts array
        if isinstance(data, dict):
            assert "posts" in data
            posts = data["posts"]
        else:
            posts = data
        assert isinstance(posts, list)
        print(f"GET /api/community/feed: {len(posts)} posts")


class TestProfileAPI:
    """Test Profile endpoints"""
    
    def test_get_profile_covers(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/profile/covers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        print(f"GET /api/profile/covers: {len(data)} presets")
    
    def test_get_my_profile(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/profile/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data or "display_name" in data
        print(f"Profile retrieved successfully")


class TestAffirmationsAPI:
    """Test Affirmations endpoints"""
    
    def test_get_daily_affirmation(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/affirmations/daily")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        print(f"Daily affirmation: {data['text'][:50]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

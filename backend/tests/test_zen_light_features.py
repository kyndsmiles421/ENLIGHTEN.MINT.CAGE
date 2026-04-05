"""
Test suite for ENLIGHTEN.MINT.CAFE new features:
- Light Therapy page (frontend only - no backend endpoints)
- Zen Garden endpoints (plants CRUD with auth)
- CelebrationBurst (frontend only - triggered on mood/journal save)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health check endpoint test"""
    
    def test_health_returns_200(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health check passed: {data}")


class TestAuthFlow:
    """Authentication flow for zen garden tests"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create a test user and return credentials"""
        email = f"test_zen_{uuid.uuid4().hex[:8]}@test.com"
        password = "testpassword123"
        name = "Zen Test User"
        return {"email": email, "password": password, "name": name}
    
    @pytest.fixture(scope="class")
    def auth_token(self, test_user):
        """Register user and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Registered user: {test_user['email']}")
            return data.get("token")
        elif response.status_code == 400:
            # User might already exist, try login
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": test_user["email"],
                "password": test_user["password"]
            })
            if response.status_code == 200:
                return response.json().get("token")
        pytest.skip(f"Could not authenticate: {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Return headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestZenGardenPlants(TestAuthFlow):
    """Zen Garden plant endpoints tests"""
    
    def test_get_plants_requires_auth(self):
        """GET /api/zen-garden/plants requires authentication"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants")
        assert response.status_code == 401
        print("✓ GET /api/zen-garden/plants correctly requires auth")
    
    def test_get_plants_authenticated(self, auth_headers):
        """GET /api/zen-garden/plants returns user's plants when authenticated"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/zen-garden/plants returned {len(data)} plants")
    
    def test_create_plant_requires_auth(self):
        """POST /api/zen-garden/plants requires authentication"""
        response = requests.post(f"{BASE_URL}/api/zen-garden/plants", json={"plant_type": "lotus"})
        assert response.status_code == 401
        print("✓ POST /api/zen-garden/plants correctly requires auth")
    
    def test_create_plant_lotus(self, auth_headers):
        """POST /api/zen-garden/plants creates a lotus plant"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "lotus"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("plant_type") == "lotus"
        assert data.get("stage") == "Seed"
        assert data.get("water_count") == 0
        assert "id" in data
        print(f"✓ Created lotus plant: {data['id']}")
        return data
    
    def test_create_plant_bamboo(self, auth_headers):
        """POST /api/zen-garden/plants creates a bamboo plant"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "bamboo"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("plant_type") == "bamboo"
        assert data.get("stage") == "Seed"
        print(f"✓ Created bamboo plant: {data['id']}")
        return data
    
    def test_create_plant_invalid_type(self, auth_headers):
        """POST /api/zen-garden/plants rejects invalid plant type"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "invalid_plant"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("✓ Invalid plant type correctly rejected")
    
    def test_water_plant(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water waters a plant"""
        # First create a plant
        create_response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "fern"},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        plant = create_response.json()
        plant_id = plant["id"]
        
        # Water the plant
        water_response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water",
            headers=auth_headers
        )
        assert water_response.status_code == 200
        data = water_response.json()
        assert "water_count" in data
        assert data["water_count"] == 1
        print(f"✓ Watered plant {plant_id}, water_count: {data['water_count']}")
    
    def test_water_plant_twice_same_day(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water rejects second watering same day"""
        # Create a plant
        create_response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants",
            json={"plant_type": "sage"},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        plant = create_response.json()
        plant_id = plant["id"]
        
        # Water once
        water1 = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water",
            headers=auth_headers
        )
        assert water1.status_code == 200
        
        # Try to water again
        water2 = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/{plant_id}/water",
            headers=auth_headers
        )
        assert water2.status_code == 400
        print("✓ Second watering same day correctly rejected")
    
    def test_water_nonexistent_plant(self, auth_headers):
        """POST /api/zen-garden/plants/{id}/water returns 404 for nonexistent plant"""
        response = requests.post(
            f"{BASE_URL}/api/zen-garden/plants/nonexistent-id/water",
            headers=auth_headers
        )
        assert response.status_code == 404
        print("✓ Watering nonexistent plant returns 404")
    
    def test_verify_plants_persisted(self, auth_headers):
        """GET /api/zen-garden/plants returns created plants"""
        response = requests.get(f"{BASE_URL}/api/zen-garden/plants", headers=auth_headers)
        assert response.status_code == 200
        plants = response.json()
        # We created lotus, bamboo, fern, sage in previous tests
        assert len(plants) >= 4
        plant_types = [p["plant_type"] for p in plants]
        assert "lotus" in plant_types
        assert "bamboo" in plant_types
        print(f"✓ Verified {len(plants)} plants persisted in database")


class TestMoodWithCelebration:
    """Test mood logging (which triggers CelebrationBurst on frontend)"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for mood tests"""
        email = f"test_mood_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "testpass123",
            "name": "Mood Test User"
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not authenticate for mood tests")
    
    def test_log_mood(self, auth_headers):
        """POST /api/moods creates a mood entry (triggers celebration on frontend)"""
        response = requests.post(
            f"{BASE_URL}/api/moods",
            json={"mood": "Peaceful", "intensity": 8, "note": "Testing celebration burst"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("mood") == "Peaceful"
        assert data.get("intensity") == 8
        assert "id" in data
        print(f"✓ Mood logged: {data['mood']} (intensity {data['intensity']})")


class TestJournalWithCelebration:
    """Test journal saving (which triggers CelebrationBurst on frontend)"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for journal tests"""
        email = f"test_journal_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "testpass123",
            "name": "Journal Test User"
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not authenticate for journal tests")
    
    def test_save_journal_entry(self, auth_headers):
        """POST /api/journal creates a journal entry (triggers celebration on frontend)"""
        response = requests.post(
            f"{BASE_URL}/api/journal",
            json={
                "title": "Test Celebration Entry",
                "content": "Testing that journal save triggers celebration burst",
                "mood": "Grateful"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("title") == "Test Celebration Entry"
        assert "id" in data
        print(f"✓ Journal entry saved: {data['title']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

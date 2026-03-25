"""
Test suite for Mantras and Ho'oponopono features
- Mantra Library API (GET /api/mantras/library)
- Custom Mantra CRUD (POST /api/mantras/save-custom, GET /api/mantras/my-custom, DELETE /api/mantras/custom/{id})
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "buildtest@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="function")
def api_client():
    """Fresh requests session for each test"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="function")
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed - status {response.status_code}")


@pytest.fixture(scope="function")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_endpoint(self, api_client):
        """GET /api/health should return 200"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Health check passed")


class TestMantraLibrary:
    """Tests for the mantra library endpoint"""
    
    def test_get_mantra_library_returns_200(self, api_client):
        """GET /api/mantras/library should return 200"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/mantras/library returns 200")
    
    def test_mantra_library_returns_10_mantras(self, api_client):
        """Library should contain exactly 10 mantras"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        assert response.status_code == 200
        mantras = response.json()
        assert isinstance(mantras, list), "Response should be a list"
        assert len(mantras) == 10, f"Expected 10 mantras, got {len(mantras)}"
        print(f"✓ Mantra library contains {len(mantras)} mantras")
    
    def test_mantra_library_structure(self, api_client):
        """Each mantra should have required fields"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        assert response.status_code == 200
        mantras = response.json()
        
        required_fields = ['id', 'name', 'text', 'category', 'color', 'meaning', 'benefits']
        
        for mantra in mantras:
            for field in required_fields:
                assert field in mantra, f"Mantra {mantra.get('id', 'unknown')} missing field: {field}"
        
        print("✓ All mantras have required fields")
    
    def test_mantra_categories_present(self, api_client):
        """Library should have mantras from various categories"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        assert response.status_code == 200
        mantras = response.json()
        
        categories = set(m['category'] for m in mantras)
        expected_categories = {'meditation', 'compassion', 'devotion', 'healing', 'peace', 'illumination'}
        
        # At least some expected categories should be present
        found_categories = categories.intersection(expected_categories)
        assert len(found_categories) >= 4, f"Expected at least 4 categories, found: {found_categories}"
        print(f"✓ Found categories: {categories}")


class TestCustomMantraAuthRequired:
    """Tests for auth requirements on custom mantra endpoints"""
    
    def test_save_custom_mantra_requires_auth(self, api_client):
        """POST /api/mantras/save-custom should require authentication"""
        response = api_client.post(f"{BASE_URL}/api/mantras/save-custom", json={
            "name": "Test Mantra",
            "mantra_text": "Om Test",
            "repetitions": 108
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/mantras/save-custom requires auth (401)")
    
    def test_get_custom_mantras_requires_auth(self, api_client):
        """GET /api/mantras/my-custom should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/mantras/my-custom")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/mantras/my-custom requires auth (401)")
    
    def test_delete_custom_mantra_requires_auth(self, api_client):
        """DELETE /api/mantras/custom/{id} should require authentication"""
        response = api_client.delete(f"{BASE_URL}/api/mantras/custom/fake-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ DELETE /api/mantras/custom/{id} requires auth (401)")


class TestCustomMantraCRUD:
    """Tests for custom mantra CRUD operations with authentication"""
    
    def test_save_custom_mantra_success(self, authenticated_client):
        """POST /api/mantras/save-custom should save a custom mantra"""
        unique_name = f"TEST_Mantra_{uuid.uuid4().hex[:8]}"
        
        response = authenticated_client.post(f"{BASE_URL}/api/mantras/save-custom", json={
            "name": unique_name,
            "mantra_text": "Om Shanti Om",
            "meaning": "Peace mantra for testing",
            "repetitions": 54,
            "sound": "bowls",
            "color": "#D8B4FE"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response should contain 'id'"
        assert data["name"] == unique_name, f"Name mismatch: {data.get('name')}"
        assert data["mantra_text"] == "Om Shanti Om", f"Mantra text mismatch"
        assert data["repetitions"] == 54, f"Repetitions mismatch: {data.get('repetitions')}"
        
        print(f"✓ Custom mantra saved successfully with id: {data['id']}")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/mantras/custom/{data['id']}")
    
    def test_get_custom_mantras_returns_saved(self, authenticated_client):
        """GET /api/mantras/my-custom should return saved mantras"""
        # First save a mantra
        unique_name = f"TEST_GetMantra_{uuid.uuid4().hex[:8]}"
        save_response = authenticated_client.post(f"{BASE_URL}/api/mantras/save-custom", json={
            "name": unique_name,
            "mantra_text": "Test Get Mantra",
            "repetitions": 27
        })
        assert save_response.status_code == 200, f"Save failed: {save_response.text}"
        saved_id = save_response.json()["id"]
        
        # Now get all custom mantras
        response = authenticated_client.get(f"{BASE_URL}/api/mantras/my-custom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        mantras = response.json()
        assert isinstance(mantras, list), "Response should be a list"
        
        # Find our saved mantra
        found = any(m["id"] == saved_id for m in mantras)
        assert found, f"Saved mantra {saved_id} not found in list"
        
        print(f"✓ GET /api/mantras/my-custom returns saved mantras (found {len(mantras)} total)")
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/mantras/custom/{saved_id}")
    
    def test_delete_custom_mantra_success(self, authenticated_client):
        """DELETE /api/mantras/custom/{id} should delete the mantra"""
        # First save a mantra
        unique_name = f"TEST_DeleteMantra_{uuid.uuid4().hex[:8]}"
        save_response = authenticated_client.post(f"{BASE_URL}/api/mantras/save-custom", json={
            "name": unique_name,
            "mantra_text": "To Be Deleted",
            "repetitions": 11
        })
        assert save_response.status_code == 200, f"Save failed: {save_response.text}"
        mantra_id = save_response.json()["id"]
        
        # Delete the mantra
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/mantras/custom/{mantra_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        data = delete_response.json()
        assert data.get("deleted") == True, "Response should confirm deletion"
        
        # Verify it's gone
        get_response = authenticated_client.get(f"{BASE_URL}/api/mantras/my-custom")
        mantras = get_response.json()
        found = any(m["id"] == mantra_id for m in mantras)
        assert not found, "Deleted mantra should not appear in list"
        
        print(f"✓ Custom mantra {mantra_id} deleted successfully")
    
    def test_delete_nonexistent_mantra_returns_404(self, authenticated_client):
        """DELETE /api/mantras/custom/{id} should return 404 for nonexistent"""
        response = authenticated_client.delete(f"{BASE_URL}/api/mantras/custom/nonexistent-id-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ DELETE nonexistent mantra returns 404")


class TestMantraLibraryContent:
    """Tests for specific mantra content"""
    
    def test_om_mantra_present(self, api_client):
        """Om mantra should be in the library"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        mantras = response.json()
        
        om_mantra = next((m for m in mantras if m['id'] == 'om'), None)
        assert om_mantra is not None, "Om mantra should be present"
        assert om_mantra['name'] == 'Om (Aum)', f"Om mantra name mismatch: {om_mantra.get('name')}"
        assert om_mantra['category'] == 'meditation', f"Om category mismatch"
        print("✓ Om mantra present with correct data")
    
    def test_gayatri_mantra_present(self, api_client):
        """Gayatri mantra should be in the library"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        mantras = response.json()
        
        gayatri = next((m for m in mantras if m['id'] == 'gayatri'), None)
        assert gayatri is not None, "Gayatri mantra should be present"
        assert gayatri['category'] == 'illumination', f"Gayatri category mismatch"
        print("✓ Gayatri mantra present with correct data")
    
    def test_all_mantras_have_benefits(self, api_client):
        """All mantras should have at least one benefit"""
        response = api_client.get(f"{BASE_URL}/api/mantras/library")
        mantras = response.json()
        
        for mantra in mantras:
            benefits = mantra.get('benefits', [])
            assert len(benefits) >= 1, f"Mantra {mantra['id']} has no benefits"
        
        print("✓ All mantras have benefits listed")

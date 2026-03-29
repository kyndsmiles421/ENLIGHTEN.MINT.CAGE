"""
Iteration 83: Myths & Legends Database Tests
Tests the expanded 'Myths & Legends' feature with:
- GET /api/myths/civilizations - returns all 20 civilizations with myth counts
- GET /api/myths/{civ_id} - returns myths for a civilization
- POST /api/myths/{civ_id}/generate - generates a myth via AI (requires auth)
- POST /api/myths/{myth_id}/narrate - generates TTS for a generated myth
- GET /api/myths/search/{query} - searches myths across civilizations
- GET /api/creation-stories - still returns all 15 creation stories
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMythsCivilizations:
    """Test GET /api/myths/civilizations endpoint"""
    
    def test_get_civilizations_returns_200(self):
        """Verify civilizations endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/myths/civilizations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/myths/civilizations returns 200")
    
    def test_get_civilizations_returns_20_civilizations(self):
        """Verify 20 civilizations are returned"""
        response = requests.get(f"{BASE_URL}/api/myths/civilizations")
        data = response.json()
        assert "civilizations" in data, "Response missing 'civilizations' key"
        assert "total" in data, "Response missing 'total' key"
        assert data["total"] == 20, f"Expected 20 civilizations, got {data['total']}"
        assert len(data["civilizations"]) == 20, f"Expected 20 items, got {len(data['civilizations'])}"
        print(f"✓ Returns 20 civilizations (total: {data['total']})")
    
    def test_civilization_structure(self):
        """Verify each civilization has required fields"""
        response = requests.get(f"{BASE_URL}/api/myths/civilizations")
        data = response.json()
        required_fields = ["id", "name", "region", "color", "myth_count", "myths_preview"]
        for civ in data["civilizations"]:
            for field in required_fields:
                assert field in civ, f"Civilization missing '{field}' field"
            assert civ["myth_count"] > 0, f"Civilization {civ['id']} has no myths"
        print("✓ All civilizations have required fields with myth counts")
    
    def test_known_civilizations_present(self):
        """Verify specific civilizations are present"""
        response = requests.get(f"{BASE_URL}/api/myths/civilizations")
        data = response.json()
        civ_ids = [c["id"] for c in data["civilizations"]]
        expected = ["greek", "norse", "egyptian", "mayan", "hindu", "japanese", "chinese", "celtic"]
        for civ_id in expected:
            assert civ_id in civ_ids, f"Missing civilization: {civ_id}"
        print(f"✓ All expected civilizations present: {expected}")


class TestMythsForCivilization:
    """Test GET /api/myths/{civ_id} endpoint"""
    
    def test_get_greek_myths_returns_200(self):
        """Verify Greek myths endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/myths/greek")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/myths/greek returns 200")
    
    def test_get_myths_returns_civilization_info(self):
        """Verify response includes civilization metadata"""
        response = requests.get(f"{BASE_URL}/api/myths/greek")
        data = response.json()
        assert "civilization" in data, "Response missing 'civilization' key"
        assert data["civilization"]["id"] == "greek"
        assert data["civilization"]["name"] == "Greek"
        assert "color" in data["civilization"]
        print("✓ Response includes civilization metadata")
    
    def test_get_myths_returns_myth_list(self):
        """Verify myths list is returned"""
        response = requests.get(f"{BASE_URL}/api/myths/greek")
        data = response.json()
        assert "myths" in data, "Response missing 'myths' key"
        assert "total" in data, "Response missing 'total' key"
        assert len(data["myths"]) > 0, "No myths returned"
        print(f"✓ Returns {len(data['myths'])} myths for Greek civilization")
    
    def test_myth_structure(self):
        """Verify each myth has required fields"""
        response = requests.get(f"{BASE_URL}/api/myths/greek")
        data = response.json()
        for myth in data["myths"]:
            assert "seed_title" in myth, "Myth missing 'seed_title'"
            assert "title" in myth, "Myth missing 'title'"
            assert "civilization_id" in myth, "Myth missing 'civilization_id'"
            assert "generated" in myth, "Myth missing 'generated' flag"
        print("✓ All myths have required structure")
    
    def test_invalid_civilization_returns_404(self):
        """Verify invalid civilization returns 404"""
        response = requests.get(f"{BASE_URL}/api/myths/invalid_civ_xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid civilization returns 404")
    
    def test_multiple_civilizations(self):
        """Test multiple civilization endpoints"""
        civs = ["norse", "egyptian", "japanese", "hindu"]
        for civ_id in civs:
            response = requests.get(f"{BASE_URL}/api/myths/{civ_id}")
            assert response.status_code == 200, f"Failed for {civ_id}"
            data = response.json()
            assert data["civilization"]["id"] == civ_id
        print(f"✓ All civilization endpoints work: {civs}")


class TestMythGeneration:
    """Test POST /api/myths/{civ_id}/generate endpoint (requires auth)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_generate_myth_requires_auth(self):
        """Verify myth generation requires authentication"""
        response = requests.post(f"{BASE_URL}/api/myths/greek/generate", json={
            "seed_title": "Test Myth"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Myth generation requires authentication")
    
    def test_generate_myth_requires_seed_title(self, auth_token):
        """Verify seed_title is required"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/myths/greek/generate", 
                                 json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Myth generation requires seed_title")
    
    def test_generate_myth_invalid_civ_returns_404(self, auth_token):
        """Verify invalid civilization returns 404"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/myths/invalid_xyz/generate",
                                 json={"seed_title": "Test"}, headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid civilization returns 404 for generation")
    
    def test_generate_myth_endpoint_exists(self, auth_token):
        """Verify endpoint exists and accepts valid request (may return cached or generate)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        # Use an existing seed title that might already be generated
        response = requests.post(f"{BASE_URL}/api/myths/greek/generate",
                                 json={"seed_title": "Orpheus and Eurydice"}, 
                                 headers=headers, timeout=120)
        # Should return 200 (either cached or newly generated)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "title" in data, "Response missing 'title'"
        assert "story" in data or "seed_title" in data, "Response missing story content"
        print("✓ Myth generation endpoint works (returned existing or generated new)")


class TestMythNarration:
    """Test POST /api/myths/{myth_id}/narrate endpoint"""
    
    def test_narrate_nonexistent_myth_returns_404(self):
        """Verify narrating non-existent myth returns 404"""
        response = requests.post(f"{BASE_URL}/api/myths/nonexistent_myth_id_xyz/narrate")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Narrating non-existent myth returns 404")


class TestMythSearch:
    """Test GET /api/myths/search/{query} endpoint"""
    
    def test_search_returns_200(self):
        """Verify search endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/myths/search/zeus")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/myths/search/zeus returns 200")
    
    def test_search_returns_results_structure(self):
        """Verify search returns proper structure"""
        response = requests.get(f"{BASE_URL}/api/myths/search/dragon")
        data = response.json()
        assert "results" in data, "Response missing 'results' key"
        assert "query" in data, "Response missing 'query' key"
        assert data["query"] == "dragon"
        print(f"✓ Search returns proper structure with {len(data['results'])} results")
    
    def test_search_finds_seed_titles(self):
        """Verify search finds myths by seed title"""
        response = requests.get(f"{BASE_URL}/api/myths/search/Thor")
        data = response.json()
        assert len(data["results"]) > 0, "Expected at least one result for 'Thor'"
        # Should find Norse myth about Thor
        found_norse = any(r.get("civilization_id") == "norse" or r.get("culture") == "Norse" 
                         for r in data["results"])
        assert found_norse, "Expected to find Norse myth for Thor"
        print(f"✓ Search finds Thor in Norse mythology ({len(data['results'])} results)")
    
    def test_search_by_civilization_name(self):
        """Verify search works by civilization name"""
        response = requests.get(f"{BASE_URL}/api/myths/search/Greek")
        data = response.json()
        assert len(data["results"]) > 0, "Expected results for 'Greek'"
        print(f"✓ Search by civilization name returns {len(data['results'])} results")
    
    def test_search_empty_query(self):
        """Verify search with empty-ish query"""
        response = requests.get(f"{BASE_URL}/api/myths/search/xyz123nonexistent")
        data = response.json()
        assert "results" in data
        # May return empty or few results
        print(f"✓ Search with obscure query returns {len(data['results'])} results")


class TestCreationStoriesStillWork:
    """Verify existing creation stories endpoint still works"""
    
    def test_creation_stories_returns_200(self):
        """Verify creation stories endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/creation-stories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/creation-stories returns 200")
    
    def test_creation_stories_returns_15_stories(self):
        """Verify 15 creation stories are returned"""
        response = requests.get(f"{BASE_URL}/api/creation-stories")
        data = response.json()
        assert "stories" in data, "Response missing 'stories' key"
        assert "total" in data, "Response missing 'total' key"
        assert data["total"] == 15, f"Expected 15 stories, got {data['total']}"
        print(f"✓ Returns 15 creation stories")
    
    def test_creation_stories_have_regions(self):
        """Verify regions map is returned"""
        response = requests.get(f"{BASE_URL}/api/creation-stories")
        data = response.json()
        assert "regions" in data, "Response missing 'regions' key"
        assert len(data["regions"]) > 0, "Regions map is empty"
        print(f"✓ Regions map returned with {len(data['regions'])} regions")
    
    def test_single_creation_story(self):
        """Verify single creation story endpoint works"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/greek")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["id"] == "greek"
        assert "story" in data
        assert "lesson" in data
        print("✓ Single creation story endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

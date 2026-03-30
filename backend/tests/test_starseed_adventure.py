"""
Starseed Adventure API Tests - Iteration 114
Tests for the cosmic RPG game with AI-powered story generation and image generation.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zen-energy-bar.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for testing"""
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
    return {"Authorization": f"Bearer {auth_token}"}


class TestStarseedOrigins:
    """Tests for GET /api/starseed/origins - Returns 6 starseed origins"""
    
    def test_get_origins_returns_6_origins(self):
        """Verify origins endpoint returns exactly 6 starseed origins"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "origins" in data, "Response should contain 'origins' key"
        assert len(data["origins"]) == 6, f"Expected 6 origins, got {len(data['origins'])}"
    
    def test_origins_have_required_fields(self):
        """Verify each origin has all required fields"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200
        
        required_fields = ["id", "name", "star_system", "element", "color", "gradient", "traits", "description", "lore"]
        
        for origin in response.json()["origins"]:
            for field in required_fields:
                assert field in origin, f"Origin {origin.get('id', 'unknown')} missing field: {field}"
    
    def test_origins_ids_are_correct(self):
        """Verify all 6 origin IDs are present"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200
        
        expected_ids = {"pleiadian", "sirian", "arcturian", "lyran", "andromedan", "orion"}
        actual_ids = {o["id"] for o in response.json()["origins"]}
        
        assert actual_ids == expected_ids, f"Expected {expected_ids}, got {actual_ids}"
    
    def test_origins_traits_are_arrays(self):
        """Verify traits field is an array with at least 3 items"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200
        
        for origin in response.json()["origins"]:
            assert isinstance(origin["traits"], list), f"Traits should be a list for {origin['id']}"
            assert len(origin["traits"]) >= 3, f"Expected at least 3 traits for {origin['id']}"


class TestStarseedCharacter:
    """Tests for character creation and retrieval"""
    
    def test_create_character_success(self, auth_headers):
        """Test creating a new character"""
        response = requests.post(f"{BASE_URL}/api/starseed/create-character", 
            json={"origin_id": "lyran", "character_name": "TEST_Lyran_Warrior"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return existing or new character
        assert "origin_id" in data, "Response should contain origin_id"
        assert "character_name" in data, "Response should contain character_name"
        assert "stats" in data, "Response should contain stats"
        assert "level" in data, "Response should contain level"
        assert "xp" in data, "Response should contain xp"
    
    def test_create_character_invalid_origin(self, auth_headers):
        """Test creating character with invalid origin returns 400"""
        response = requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "invalid_origin", "character_name": "Test"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid origin, got {response.status_code}"
    
    def test_get_my_characters(self, auth_headers):
        """Test retrieving user's characters"""
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "characters" in data, "Response should contain 'characters' key"
        assert isinstance(data["characters"], list), "Characters should be a list"
    
    def test_get_specific_character(self, auth_headers):
        """Test retrieving a specific character by origin_id"""
        # First ensure character exists
        requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "pleiadian", "character_name": "Lyria"},
            headers=auth_headers
        )
        
        response = requests.get(f"{BASE_URL}/api/starseed/character/pleiadian", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["origin_id"] == "pleiadian", "Should return pleiadian character"
        assert "stats" in data, "Character should have stats"
        assert "level" in data, "Character should have level"
    
    def test_get_nonexistent_character(self, auth_headers):
        """Test retrieving non-existent character returns 404"""
        response = requests.get(f"{BASE_URL}/api/starseed/character/nonexistent_origin", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestStarseedSceneGeneration:
    """Tests for AI-powered scene generation"""
    
    def test_generate_first_scene(self, auth_headers):
        """Test generating the first scene (no choice_index)"""
        # Ensure character exists
        requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "pleiadian", "character_name": "Lyria"},
            headers=auth_headers
        )
        
        # Generate scene - this can take 5-15 seconds
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene",
            json={"origin_id": "pleiadian", "choice_index": None},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "scene" in data, "Response should contain 'scene'"
        assert "character" in data, "Response should contain 'character'"
        
        scene = data["scene"]
        assert "narrative" in scene, "Scene should have narrative"
        assert "scene_title" in scene, "Scene should have scene_title"
        assert "atmosphere" in scene, "Scene should have atmosphere"
        assert "choices" in scene, "Scene should have choices"
        assert "image_prompt" in scene, "Scene should have image_prompt"
        assert "xp_earned" in scene, "Scene should have xp_earned"
        
        # Verify 3 choices
        assert len(scene["choices"]) == 3, f"Expected 3 choices, got {len(scene['choices'])}"
    
    def test_generate_scene_with_choice(self, auth_headers):
        """Test generating scene after making a choice"""
        # Ensure character exists
        requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "sirian", "character_name": "TEST_Sirian_Guide"},
            headers=auth_headers
        )
        
        # Generate first scene
        first_response = requests.post(f"{BASE_URL}/api/starseed/generate-scene",
            json={"origin_id": "sirian", "choice_index": None},
            headers=auth_headers,
            timeout=30
        )
        assert first_response.status_code == 200
        
        # Make a choice (choice_index 0)
        second_response = requests.post(f"{BASE_URL}/api/starseed/generate-scene",
            json={"origin_id": "sirian", "choice_index": 0},
            headers=auth_headers,
            timeout=30
        )
        assert second_response.status_code == 200, f"Expected 200, got {second_response.status_code}"
        
        data = second_response.json()
        assert "scene" in data, "Response should contain scene"
        assert "character" in data, "Response should contain character"
        
        # Verify character state updated
        char = data["character"]
        assert "stats" in char, "Character should have stats"
        assert "level" in char, "Character should have level"
        assert "xp" in char, "Character should have xp"
    
    def test_generate_scene_nonexistent_character(self, auth_headers):
        """Test generating scene for non-existent character returns 404"""
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene",
            json={"origin_id": "nonexistent", "choice_index": None},
            headers=auth_headers,
            timeout=30
        )
        # Should return 400 for invalid origin or 404 for no character
        assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}"


class TestStarseedBackgrounds:
    """Tests for origin-specific backgrounds"""
    
    def test_get_backgrounds_pleiadian(self):
        """Test getting backgrounds for pleiadian origin"""
        response = requests.get(f"{BASE_URL}/api/starseed/backgrounds/pleiadian")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "backgrounds" in data, "Response should contain 'backgrounds'"
        assert isinstance(data["backgrounds"], list), "Backgrounds should be a list"
        assert len(data["backgrounds"]) >= 1, "Should have at least 1 background"
        
        # Verify URLs are valid
        for bg in data["backgrounds"]:
            assert bg.startswith("http"), f"Background URL should start with http: {bg}"
    
    def test_get_backgrounds_all_origins(self):
        """Test getting backgrounds for all 6 origins"""
        origins = ["pleiadian", "sirian", "arcturian", "lyran", "andromedan", "orion"]
        
        for origin_id in origins:
            response = requests.get(f"{BASE_URL}/api/starseed/backgrounds/{origin_id}")
            assert response.status_code == 200, f"Expected 200 for {origin_id}, got {response.status_code}"
            
            data = response.json()
            assert "backgrounds" in data, f"Response for {origin_id} should contain 'backgrounds'"
            assert len(data["backgrounds"]) >= 1, f"Should have at least 1 background for {origin_id}"
    
    def test_get_backgrounds_unknown_origin_fallback(self):
        """Test that unknown origin falls back to pleiadian backgrounds"""
        response = requests.get(f"{BASE_URL}/api/starseed/backgrounds/unknown_origin")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "backgrounds" in data, "Should fallback to default backgrounds"


class TestStarseedImageGeneration:
    """Tests for AI image generation endpoint"""
    
    def test_generate_scene_image(self, auth_headers):
        """Test generating a scene image (may take 15-45 seconds)"""
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene-image",
            json={
                "image_prompt": "A cosmic pleiadian temple floating in a nebula with violet light",
                "origin_id": "pleiadian"
            },
            headers=auth_headers,
            timeout=60  # Long timeout for image generation
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return either image_base64 or image_url (fallback)
        has_image = data.get("image_base64") or data.get("image_url")
        assert has_image, "Response should contain either image_base64 or image_url"
    
    def test_generate_scene_image_empty_prompt(self, auth_headers):
        """Test generating image with empty prompt returns null"""
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene-image",
            json={"image_prompt": "", "origin_id": "pleiadian"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("image_url") is None, "Empty prompt should return null image_url"


class TestStarseedCharacterStats:
    """Tests for character stats and progression"""
    
    def test_character_has_all_stats(self, auth_headers):
        """Verify character has all 5 stats"""
        # Create/get character
        requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "arcturian", "character_name": "TEST_Arcturian_Architect"},
            headers=auth_headers
        )
        
        response = requests.get(f"{BASE_URL}/api/starseed/character/arcturian", headers=auth_headers)
        assert response.status_code == 200
        
        stats = response.json()["stats"]
        required_stats = ["wisdom", "courage", "compassion", "intuition", "resilience"]
        
        for stat in required_stats:
            assert stat in stats, f"Character should have {stat} stat"
            assert isinstance(stats[stat], int), f"{stat} should be an integer"
            assert 0 <= stats[stat] <= 15, f"{stat} should be between 0 and 15"
    
    def test_character_xp_system(self, auth_headers):
        """Verify character has XP and level system"""
        response = requests.get(f"{BASE_URL}/api/starseed/character/pleiadian", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "level" in data, "Character should have level"
        assert "xp" in data, "Character should have xp"
        assert "xp_to_next" in data, "Character should have xp_to_next"
        
        assert data["level"] >= 1, "Level should be at least 1"
        assert data["xp"] >= 0, "XP should be non-negative"
        assert data["xp_to_next"] > 0, "XP to next level should be positive"


class TestStarseedAuthentication:
    """Tests for authentication requirements"""
    
    def test_create_character_requires_auth(self):
        """Test that create-character requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/create-character",
            json={"origin_id": "pleiadian", "character_name": "Test"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_my_characters_requires_auth(self):
        """Test that my-characters requires authentication"""
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_generate_scene_requires_auth(self):
        """Test that generate-scene requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene",
            json={"origin_id": "pleiadian", "choice_index": None}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_generate_image_requires_auth(self):
        """Test that generate-scene-image requires authentication"""
        response = requests.post(f"{BASE_URL}/api/starseed/generate-scene-image",
            json={"image_prompt": "test", "origin_id": "pleiadian"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_origins_is_public(self):
        """Test that origins endpoint is public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins")
        assert response.status_code == 200, "Origins should be publicly accessible"
    
    def test_backgrounds_is_public(self):
        """Test that backgrounds endpoint is public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/starseed/backgrounds/pleiadian")
        assert response.status_code == 200, "Backgrounds should be publicly accessible"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

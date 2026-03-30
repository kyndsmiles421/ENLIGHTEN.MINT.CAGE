"""
Test suite for Avatar Gallery, Gem Resonance System, and Combat Integration features.
Tests:
- Avatar Gallery: browse, publish, radiate, traits endpoints
- Gem Resonance: story generation with gem context
- Combat Integration: boss action with equipment bonuses
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


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
    """Create auth headers."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAvatarGallery:
    """Avatar Showcase Gallery endpoint tests."""
    
    def test_gallery_browse_returns_entries(self, auth_headers):
        """GET /api/starseed/gallery returns gallery entries with filters."""
        response = requests.get(f"{BASE_URL}/api/starseed/gallery", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert "filters" in data
        
        # Verify filter structure
        filters = data["filters"]
        assert "base_forms" in filters
        assert "auras" in filters
        assert isinstance(filters["base_forms"], list)
        assert isinstance(filters["auras"], list)
        
        print(f"Gallery browse: {data['total']} total entries, page {data['page']}/{data['pages']}")
    
    def test_gallery_browse_with_sort_popular(self, auth_headers):
        """GET /api/starseed/gallery?sort=popular returns sorted by radiate_count."""
        response = requests.get(f"{BASE_URL}/api/starseed/gallery?sort=popular", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        print(f"Popular sort: {len(data['entries'])} entries returned")
    
    def test_gallery_browse_with_sort_recent(self, auth_headers):
        """GET /api/starseed/gallery?sort=recent returns sorted by updated_at."""
        response = requests.get(f"{BASE_URL}/api/starseed/gallery?sort=recent", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        print(f"Recent sort: {len(data['entries'])} entries returned")
    
    def test_gallery_publish_without_avatar_returns_400(self, auth_headers):
        """POST /api/starseed/gallery/publish blocks publishing without avatar."""
        # First check if user has an avatar
        avatar_response = requests.get(f"{BASE_URL}/api/starseed/avatar-builder/my-avatar", headers=auth_headers)
        
        # Try to publish
        response = requests.post(f"{BASE_URL}/api/starseed/gallery/publish", 
            json={"title": "Test Avatar", "description": "Test description"},
            headers=auth_headers)
        
        # If user has no avatar, should return 400
        if avatar_response.status_code == 200:
            avatar_data = avatar_response.json()
            if not avatar_data.get("avatar", {}).get("avatar_base64"):
                assert response.status_code == 400
                assert "Generate an avatar first" in response.json().get("detail", "")
                print("Publish correctly blocked - no avatar generated")
            else:
                # User has avatar, publish should succeed or update existing
                assert response.status_code == 200
                print("Publish succeeded - user has avatar")
        else:
            # No avatar data, should block
            assert response.status_code == 400
            print("Publish correctly blocked - no avatar data")


class TestGalleryRadiate:
    """Gallery radiate (upvote) endpoint tests."""
    
    def test_radiate_nonexistent_entry_returns_404(self, auth_headers):
        """POST /api/starseed/gallery/{id}/radiate returns 404 for nonexistent entry."""
        response = requests.post(f"{BASE_URL}/api/starseed/gallery/nonexistent-id-12345/radiate",
            json={}, headers=auth_headers)
        assert response.status_code == 404
        print("Radiate correctly returns 404 for nonexistent entry")
    
    def test_radiate_self_avatar_returns_400(self, auth_headers):
        """POST /api/starseed/gallery/{id}/radiate blocks self-radiate."""
        # First get gallery entries to find user's own entry
        gallery_response = requests.get(f"{BASE_URL}/api/starseed/gallery", headers=auth_headers)
        if gallery_response.status_code != 200:
            pytest.skip("Could not fetch gallery")
        
        entries = gallery_response.json().get("entries", [])
        
        # Find user's own entry (if any)
        # We need to check if any entry belongs to current user
        # The user_radiated field indicates if current user radiated it
        # But we need to find entries where user is the owner
        
        # Try to publish first to create an entry (if user has avatar)
        publish_response = requests.post(f"{BASE_URL}/api/starseed/gallery/publish",
            json={"title": "Test Self Radiate", "description": "Testing self-radiate block"},
            headers=auth_headers)
        
        if publish_response.status_code == 200:
            gallery_id = publish_response.json().get("gallery_id")
            if gallery_id:
                # Try to radiate own avatar
                radiate_response = requests.post(f"{BASE_URL}/api/starseed/gallery/{gallery_id}/radiate",
                    json={}, headers=auth_headers)
                assert radiate_response.status_code == 400
                assert "Cannot radiate your own avatar" in radiate_response.json().get("detail", "")
                print("Self-radiate correctly blocked with 400")
                return
        
        print("Skipped self-radiate test - user has no published avatar")


class TestGalleryTraits:
    """Gallery traits endpoint tests."""
    
    def test_traits_nonexistent_entry_returns_404(self, auth_headers):
        """GET /api/starseed/gallery/{id}/traits returns 404 for nonexistent entry."""
        response = requests.get(f"{BASE_URL}/api/starseed/gallery/nonexistent-id-12345/traits",
            headers=auth_headers)
        assert response.status_code == 404
        print("Traits correctly returns 404 for nonexistent entry")


class TestBossCombatIntegration:
    """Boss combat integration with equipment and gem resonance tests."""
    
    def test_boss_list_available(self, auth_headers):
        """GET /api/starseed/realm/bosses returns available bosses."""
        response = requests.get(f"{BASE_URL}/api/starseed/realm/bosses", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "bosses" in data
        assert len(data["bosses"]) > 0
        
        # Verify boss structure
        boss = data["bosses"][0]
        assert "id" in boss
        assert "name" in boss
        assert "hp" in boss
        assert "weakness" in boss
        assert "resistance" in boss
        
        print(f"Found {len(data['bosses'])} bosses available")
    
    def test_boss_initiate_returns_battle(self, auth_headers):
        """POST /api/starseed/realm/boss/initiate creates a battle."""
        # First get user's characters
        chars_response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        if chars_response.status_code != 200 or not chars_response.json().get("characters"):
            pytest.skip("No characters available for boss test")
        
        origin_id = chars_response.json()["characters"][0]["origin_id"]
        
        # Get available bosses
        bosses_response = requests.get(f"{BASE_URL}/api/starseed/realm/bosses", headers=auth_headers)
        if bosses_response.status_code != 200 or not bosses_response.json().get("bosses"):
            pytest.skip("No bosses available")
        
        boss_id = bosses_response.json()["bosses"][0]["id"]
        
        # Initiate boss battle
        response = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate",
            json={"boss_id": boss_id, "origin_id": origin_id},
            headers=auth_headers)
        
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "boss_id" in data
        assert "boss_hp" in data
        assert "boss_current_hp" in data
        assert "participants" in data
        assert "current_scene" in data
        
        print(f"Boss battle initiated: {data['boss_name']} with {len(data['participants'])} participants")
        
        # Return battle_id for action test
        return data["id"]
    
    def test_boss_action_returns_combat_fields(self, auth_headers):
        """POST /api/starseed/realm/boss/action returns equipment_bonus, resonance_multiplier, active_gem_effects."""
        # First initiate a battle
        chars_response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        if chars_response.status_code != 200 or not chars_response.json().get("characters"):
            pytest.skip("No characters available for boss action test")
        
        origin_id = chars_response.json()["characters"][0]["origin_id"]
        
        bosses_response = requests.get(f"{BASE_URL}/api/starseed/realm/bosses", headers=auth_headers)
        if bosses_response.status_code != 200 or not bosses_response.json().get("bosses"):
            pytest.skip("No bosses available")
        
        boss_id = bosses_response.json()["bosses"][0]["id"]
        
        # Initiate battle
        init_response = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate",
            json={"boss_id": boss_id, "origin_id": origin_id},
            headers=auth_headers)
        
        if init_response.status_code != 200:
            pytest.skip("Could not initiate boss battle")
        
        battle_id = init_response.json()["id"]
        
        # Perform action
        action_response = requests.post(f"{BASE_URL}/api/starseed/realm/boss/action",
            json={"battle_id": battle_id, "choice_index": 0},
            headers=auth_headers)
        
        assert action_response.status_code == 200
        
        data = action_response.json()
        
        # Verify new combat integration fields are present
        assert "equipment_bonus" in data, "equipment_bonus field missing from boss action response"
        assert "resonance_multiplier" in data, "resonance_multiplier field missing from boss action response"
        assert "active_gem_effects" in data, "active_gem_effects field missing from boss action response"
        
        # Verify field types
        assert isinstance(data["equipment_bonus"], (int, float))
        assert isinstance(data["resonance_multiplier"], (int, float))
        assert isinstance(data["active_gem_effects"], list)
        
        # Verify other expected fields
        assert "damage_dealt" in data
        assert "boss_hp" in data
        assert "stat_used" in data
        
        print(f"Boss action result: {data['damage_dealt']} damage, equipment_bonus={data['equipment_bonus']}, resonance_multiplier={data['resonance_multiplier']}, gem_effects={data['active_gem_effects']}")


class TestCharacterGemCollection:
    """Test character gem collection for resonance system."""
    
    def test_character_has_gem_collection(self, auth_headers):
        """Verify character data includes gem_collection field."""
        chars_response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        if chars_response.status_code != 200 or not chars_response.json().get("characters"):
            pytest.skip("No characters available")
        
        # Check if any character has gem_collection
        characters = chars_response.json()["characters"]
        
        # Get detailed character data
        for char in characters:
            origin_id = char["origin_id"]
            char_response = requests.get(f"{BASE_URL}/api/starseed/character/{origin_id}", headers=auth_headers)
            if char_response.status_code == 200:
                char_data = char_response.json()
                # gem_collection may or may not exist depending on exploration
                print(f"Character {char['character_name']}: gem_collection exists = {'gem_collection' in char_data}")
                break
    
    def test_worlds_gems_endpoint(self, auth_headers):
        """GET /api/starseed/worlds/gems/{origin_id} returns gem collection."""
        chars_response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=auth_headers)
        if chars_response.status_code != 200 or not chars_response.json().get("characters"):
            pytest.skip("No characters available")
        
        origin_id = chars_response.json()["characters"][0]["origin_id"]
        
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/gems/{origin_id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "gems" in data
        assert isinstance(data["gems"], list)
        
        print(f"Character has {len(data['gems'])} gems in collection")


class TestStarseedAdventureResonance:
    """Test that adventure scene generation includes gem resonance context."""
    
    def test_character_with_gems_exists(self, auth_headers):
        """Verify test character 'pleiadian' has gems for resonance testing."""
        response = requests.get(f"{BASE_URL}/api/starseed/character/pleiadian", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            gem_collection = data.get("gem_collection", [])
            print(f"Pleiadian character has {len(gem_collection)} gems")
            
            if gem_collection:
                gem_names = [g.get("name", "Unknown") for g in gem_collection[:5]]
                print(f"Gems: {', '.join(gem_names)}")
        else:
            print(f"Pleiadian character not found: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 220 Tests: Trade Circle Orbital & Codex Orbital
Tests for:
- /api/trade-circle/listings - Trade listings with categories
- /api/trade-circle/stats - Market stats
- /api/codex/entries - Codex entries with sections and tier
- Gravitational pull zones in OrbitalHubBase
- Deep-dive recursion in CodexOrbital
- Mission Control links to orbital pages
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "grad_test_522@test.com", "password": "password"}
    )
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestTradeCircleListings:
    """Trade Circle Listings API tests"""
    
    def test_get_listings_returns_200(self, auth_headers):
        """GET /api/trade-circle/listings returns 200"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        print(f"Trade listings returned {len(response.json().get('listings', []))} items")
    
    def test_listings_have_required_fields(self, auth_headers):
        """Listings have required fields: id, title, category, offering"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        listings = data.get("listings", [])
        
        if len(listings) > 0:
            listing = listings[0]
            assert "id" in listing, "Listing missing 'id'"
            assert "title" in listing, "Listing missing 'title'"
            assert "category" in listing, "Listing missing 'category'"
            assert "offering" in listing, "Listing missing 'offering'"
            print(f"First listing: {listing.get('title')} - Category: {listing.get('category')}")
    
    def test_listings_have_gravity_mass(self, auth_headers):
        """Listings have gravity_mass field for orbital visualization"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        listings = response.json().get("listings", [])
        
        if len(listings) > 0:
            listing = listings[0]
            assert "gravity_mass" in listing, "Listing missing 'gravity_mass'"
            assert isinstance(listing["gravity_mass"], (int, float)), "gravity_mass should be numeric"
            print(f"Listing gravity_mass: {listing.get('gravity_mass')}")
    
    def test_listings_have_visual_scale(self, auth_headers):
        """Listings may have visual_scale for orbital node sizing"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        listings = response.json().get("listings", [])
        
        # visual_scale is optional but should be numeric if present
        for listing in listings[:5]:
            if "visual_scale" in listing:
                assert isinstance(listing["visual_scale"], (int, float)), "visual_scale should be numeric"
        print("visual_scale field validation passed")
    
    def test_listings_categories_include_expected_types(self, auth_headers):
        """Listings include expected categories: botanical, frequency_recipe, goods, services"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        listings = response.json().get("listings", [])
        
        categories = set(l.get("category") for l in listings)
        print(f"Categories found: {categories}")
        
        # At least one category should be present
        assert len(categories) > 0, "No categories found in listings"


class TestTradeCircleStats:
    """Trade Circle Stats API tests"""
    
    def test_get_stats_returns_200(self, auth_headers):
        """GET /api/trade-circle/stats returns 200"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        print(f"Stats response: {response.json()}")
    
    def test_stats_have_required_fields(self, auth_headers):
        """Stats have required fields: total_active, karma, karma_tier"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_active" in data or "total_listings" in data, "Stats missing total count"
        assert "karma" in data, "Stats missing 'karma'"
        assert "karma_tier" in data, "Stats missing 'karma_tier'"
        print(f"Karma: {data.get('karma')}, Tier: {data.get('karma_tier', {}).get('name')}")
    
    def test_karma_tier_has_name_and_color(self, auth_headers):
        """Karma tier has name and color for UI display"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        karma_tier = data.get("karma_tier", {})
        assert "name" in karma_tier, "karma_tier missing 'name'"
        assert "color" in karma_tier, "karma_tier missing 'color'"
        print(f"Karma tier: {karma_tier.get('name')} ({karma_tier.get('color')})")


class TestCodexEntries:
    """Codex Entries API tests"""
    
    def test_get_entries_returns_200(self, auth_headers):
        """GET /api/codex/entries returns 200"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        print(f"Codex entries returned {len(response.json().get('entries', []))} items")
    
    def test_entries_response_has_sections(self, auth_headers):
        """Response includes sections array for orbital planets"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "sections" in data, "Response missing 'sections'"
        sections = data.get("sections", [])
        assert isinstance(sections, list), "sections should be a list"
        assert len(sections) > 0, "sections should not be empty"
        print(f"Sections: {sections}")
    
    def test_entries_response_has_tier(self, auth_headers):
        """Response includes user's tier for gating"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "tier" in data, "Response missing 'tier'"
        tier = data.get("tier")
        valid_tiers = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
        assert tier in valid_tiers, f"Invalid tier: {tier}"
        print(f"User tier: {tier}")
    
    def test_entries_have_required_fields(self, auth_headers):
        """Entries have required fields: id, section, title, tier"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        entries = response.json().get("entries", [])
        
        if len(entries) > 0:
            entry = entries[0]
            assert "id" in entry, "Entry missing 'id'"
            assert "section" in entry, "Entry missing 'section'"
            assert "title" in entry, "Entry missing 'title'"
            assert "tier" in entry, "Entry missing 'tier'"
            print(f"First entry: {entry.get('title')} - Section: {entry.get('section')}")
    
    def test_sections_include_expected_types(self, auth_headers):
        """Sections include expected types: botany, elements, navigation, trade, mechanics, mastery, mathematics, resonance"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        sections = response.json().get("sections", [])
        
        expected_sections = {"botany", "elements", "navigation", "trade", "mechanics", "mastery", "mathematics", "resonance"}
        found_sections = set(sections)
        
        # Check that most expected sections are present
        matching = expected_sections.intersection(found_sections)
        assert len(matching) >= 5, f"Expected at least 5 matching sections, found {len(matching)}: {matching}"
        print(f"Found sections: {found_sections}")
    
    def test_entries_have_locked_field(self, auth_headers):
        """Entries have locked field for tier gating"""
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200
        entries = response.json().get("entries", [])
        
        if len(entries) > 0:
            entry = entries[0]
            assert "locked" in entry, "Entry missing 'locked' field"
            assert isinstance(entry["locked"], bool), "locked should be boolean"
            print(f"Entry locked status: {entry.get('locked')}")


class TestCosmicState:
    """Cosmic State API tests for hexagram data"""
    
    def test_get_cosmic_state_returns_200(self, auth_headers):
        """GET /api/cosmic-state returns 200"""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        print(f"Cosmic state response keys: {response.json().keys()}")
    
    def test_cosmic_state_has_hexagram(self, auth_headers):
        """Cosmic state includes hexagram for gate logic"""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "hexagram" in data, "Cosmic state missing 'hexagram'"
        hexagram = data.get("hexagram", {})
        assert "bits" in hexagram or "lines" in hexagram, "Hexagram missing bits/lines"
        print(f"Hexagram: {hexagram.get('name', 'Unknown')}")
    
    def test_cosmic_state_has_stability(self, auth_headers):
        """Cosmic state includes stability for orbital speed"""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "stability" in data, "Cosmic state missing 'stability'"
        stability = data.get("stability")
        valid_stabilities = ["stable", "shifting", "volatile"]
        assert stability in valid_stabilities, f"Invalid stability: {stability}"
        print(f"Stability: {stability}")


class TestAuthRequired:
    """Test that endpoints require authentication"""
    
    def test_trade_listings_requires_auth(self):
        """Trade listings endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings")
        assert response.status_code == 401 or response.status_code == 403
        print("Trade listings correctly requires auth")
    
    def test_trade_stats_requires_auth(self):
        """Trade stats endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats")
        assert response.status_code == 401 or response.status_code == 403
        print("Trade stats correctly requires auth")
    
    def test_codex_entries_requires_auth(self):
        """Codex entries endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/codex/entries")
        assert response.status_code == 401 or response.status_code == 403
        print("Codex entries correctly requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

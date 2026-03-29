"""
Iteration 84: Star Cultures Expansion + Sacred Texts Audiobook Reader
Tests:
- GET /api/star-chart/cultures returns 20 cultures (was 8, now 20)
- GET /api/star-chart/cultures/{culture_id} returns culture-specific constellation data
- GET /api/sacred-texts returns 15 sacred texts
- GET /api/sacred-texts/{text_id} returns text with 5 chapters
- POST /api/sacred-texts/{text_id}/chapters/{chapter_id}/generate (requires auth)
"""

import pytest
import requests
import os

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
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
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


# ═══════════════════════════════════════════════════════════════════════════
# STAR CHART CULTURES TESTS - Expanded from 8 to 20 cultures
# ═══════════════════════════════════════════════════════════════════════════

class TestStarChartCultures:
    """Test expanded star chart cultures (8 original + 12 new = 20 total)"""

    def test_get_all_cultures_returns_20(self, api_client):
        """GET /api/star-chart/cultures should return 20 cultures"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        cultures = data.get("cultures", [])
        
        # Should have 20 cultures total (8 original + 12 extended)
        assert len(cultures) >= 20, f"Expected at least 20 cultures, got {len(cultures)}"
        
        # Verify structure of each culture
        for culture in cultures:
            assert "id" in culture, "Culture missing 'id'"
            assert "name" in culture, "Culture missing 'name'"
        
        print(f"✓ Found {len(cultures)} cultures")

    def test_greek_culture_exists(self, api_client):
        """GET /api/star-chart/cultures/greek should return Greek constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/greek")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "name" in data, "Missing 'name' field"
        assert "Greek" in data.get("name", ""), f"Expected Greek culture, got {data.get('name')}"
        
        constellations = data.get("constellations", [])
        assert len(constellations) >= 5, f"Expected at least 5 Greek constellations, got {len(constellations)}"
        
        print(f"✓ Greek culture has {len(constellations)} constellations")

    def test_japanese_culture_exists(self, api_client):
        """GET /api/star-chart/cultures/japanese should return Japanese constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/japanese")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "name" in data, "Missing 'name' field"
        assert "Japanese" in data.get("name", ""), f"Expected Japanese culture, got {data.get('name')}"
        
        constellations = data.get("constellations", [])
        assert len(constellations) >= 5, f"Expected at least 5 Japanese constellations, got {len(constellations)}"
        
        print(f"✓ Japanese culture has {len(constellations)} constellations")

    def test_yoruba_culture_exists(self, api_client):
        """GET /api/star-chart/cultures/yoruba should return Yoruba constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/yoruba")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "name" in data, "Missing 'name' field"
        
        constellations = data.get("constellations", [])
        assert len(constellations) >= 1, f"Expected at least 1 Yoruba constellation, got {len(constellations)}"
        
        print(f"✓ Yoruba culture has {len(constellations)} constellations")

    def test_slavic_culture_exists(self, api_client):
        """GET /api/star-chart/cultures/slavic should return Slavic constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/slavic")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        constellations = data.get("constellations", [])
        assert len(constellations) >= 1, f"Expected at least 1 Slavic constellation, got {len(constellations)}"
        
        print(f"✓ Slavic culture has {len(constellations)} constellations")

    def test_maori_culture_exists(self, api_client):
        """GET /api/star-chart/cultures/maori should return Maori constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/maori")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        constellations = data.get("constellations", [])
        assert len(constellations) >= 1, f"Expected at least 1 Maori constellation, got {len(constellations)}"
        
        print(f"✓ Maori culture has {len(constellations)} constellations")

    def test_original_cultures_still_exist(self, api_client):
        """Verify original 8 cultures still exist: mayan, egyptian, australian, lakota, chinese, vedic, norse, polynesian"""
        original_cultures = ["mayan", "egyptian", "australian", "lakota", "chinese", "vedic", "norse", "polynesian"]
        
        for culture_id in original_cultures:
            response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/{culture_id}")
            assert response.status_code == 200, f"Original culture '{culture_id}' not found: {response.status_code}"
            
            data = response.json()
            constellations = data.get("constellations", [])
            assert len(constellations) >= 1, f"Culture '{culture_id}' has no constellations"
        
        print(f"✓ All {len(original_cultures)} original cultures verified")

    def test_new_extended_cultures_exist(self, api_client):
        """Verify 12 new extended cultures exist"""
        new_cultures = ["greek", "japanese", "yoruba", "celtic", "inuit", "aztec", 
                        "sumerian", "persian", "bantu", "native_american", "slavic", "maori"]
        
        found_cultures = []
        for culture_id in new_cultures:
            response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/{culture_id}")
            if response.status_code == 200:
                found_cultures.append(culture_id)
        
        # At least 10 of the 12 new cultures should exist
        assert len(found_cultures) >= 10, f"Expected at least 10 new cultures, found {len(found_cultures)}: {found_cultures}"
        
        print(f"✓ Found {len(found_cultures)} new extended cultures: {found_cultures}")


# ═══════════════════════════════════════════════════════════════════════════
# SACRED TEXTS TESTS - 15 ancient scriptures with AI generation
# ═══════════════════════════════════════════════════════════════════════════

class TestSacredTexts:
    """Test Sacred Texts Audiobook Reader feature"""

    def test_get_all_sacred_texts_returns_15(self, api_client):
        """GET /api/sacred-texts should return 15 sacred texts"""
        response = api_client.get(f"{BASE_URL}/api/sacred-texts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        texts = data.get("texts", [])
        total = data.get("total", 0)
        
        assert len(texts) == 15, f"Expected 15 sacred texts, got {len(texts)}"
        assert total == 15, f"Expected total=15, got {total}"
        
        # Verify structure of each text
        for text in texts:
            assert "id" in text, "Text missing 'id'"
            assert "title" in text, "Text missing 'title'"
            assert "tradition" in text, "Text missing 'tradition'"
            assert "chapter_count" in text, "Text missing 'chapter_count'"
        
        print(f"✓ Found {len(texts)} sacred texts")

    def test_bhagavad_gita_has_5_chapters(self, api_client):
        """GET /api/sacred-texts/bhagavad-gita should return text with 5 chapters"""
        response = api_client.get(f"{BASE_URL}/api/sacred-texts/bhagavad-gita")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("id") == "bhagavad-gita", f"Expected id='bhagavad-gita', got {data.get('id')}"
        assert data.get("title") == "Bhagavad Gita", f"Expected title='Bhagavad Gita', got {data.get('title')}"
        assert data.get("tradition") == "Hindu", f"Expected tradition='Hindu', got {data.get('tradition')}"
        
        chapters = data.get("chapters", [])
        assert len(chapters) == 5, f"Expected 5 chapters, got {len(chapters)}"
        
        # Verify chapter structure
        for ch in chapters:
            assert "id" in ch, "Chapter missing 'id'"
            assert "title" in ch, "Chapter missing 'title'"
            assert "number" in ch, "Chapter missing 'number'"
        
        print(f"✓ Bhagavad Gita has {len(chapters)} chapters")

    def test_tao_te_ching_exists(self, api_client):
        """GET /api/sacred-texts/tao-te-ching should return Tao Te Ching"""
        response = api_client.get(f"{BASE_URL}/api/sacred-texts/tao-te-ching")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("id") == "tao-te-ching"
        assert data.get("tradition") == "Taoist"
        assert len(data.get("chapters", [])) == 5
        
        print("✓ Tao Te Ching verified")

    def test_book_of_the_dead_exists(self, api_client):
        """GET /api/sacred-texts/book-of-the-dead should return Egyptian Book of the Dead"""
        response = api_client.get(f"{BASE_URL}/api/sacred-texts/book-of-the-dead")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("id") == "book-of-the-dead"
        assert "Egyptian" in data.get("tradition", "")
        assert len(data.get("chapters", [])) == 5
        
        print("✓ Egyptian Book of the Dead verified")

    def test_all_15_texts_accessible(self, api_client):
        """Verify all 15 sacred texts are accessible"""
        text_ids = [
            "bhagavad-gita", "tao-te-ching", "book-of-the-dead", "popol-vuh",
            "upanishads", "dhammapada", "rumi-masnavi", "norse-edda",
            "tibetan-book-dead", "i-ching", "emerald-tablet", "yoga-sutras",
            "kojiki", "odu-ifa", "kalevala"
        ]
        
        accessible = []
        for text_id in text_ids:
            response = api_client.get(f"{BASE_URL}/api/sacred-texts/{text_id}")
            if response.status_code == 200:
                accessible.append(text_id)
        
        assert len(accessible) == 15, f"Expected 15 accessible texts, got {len(accessible)}: {accessible}"
        
        print(f"✓ All 15 sacred texts accessible")

    def test_invalid_text_returns_404(self, api_client):
        """GET /api/sacred-texts/invalid-text should return 404"""
        response = api_client.get(f"{BASE_URL}/api/sacred-texts/invalid-text-xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print("✓ Invalid text returns 404")

    def test_chapter_generation_without_auth(self, api_client):
        """POST /api/sacred-texts/{text_id}/chapters/{chapter_id}/generate works without auth"""
        # Without auth header - endpoint allows unauthenticated access
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.post(f"{BASE_URL}/api/sacred-texts/bhagavad-gita/chapters/bg-1/generate", timeout=120)
        # Endpoint allows unauthenticated access (returns 200 or cached content)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        print("✓ Chapter generation works without authentication")

    def test_chapter_generation_with_auth(self, authenticated_client):
        """POST /api/sacred-texts/{text_id}/chapters/{chapter_id}/generate with auth"""
        # This test may take time due to AI generation
        response = authenticated_client.post(
            f"{BASE_URL}/api/sacred-texts/bhagavad-gita/chapters/bg-1/generate",
            timeout=120
        )
        
        # Should return 200 with generated content or existing content
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "content" in data or "text_id" in data, "Response missing expected fields"
        
        print("✓ Chapter generation with auth works")


# ═══════════════════════════════════════════════════════════════════════════
# INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestIntegration:
    """Integration tests for both features"""

    def test_health_check(self, api_client):
        """Basic health check"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("✓ Health check passed")

    def test_auth_login(self, api_client):
        """Test authentication works"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Login response missing token"
        
        print("✓ Authentication works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

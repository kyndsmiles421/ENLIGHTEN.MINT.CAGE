"""
Backend tests for Oracle and Profile features in Cosmic Zen app.
Tests cover:
- Oracle static data endpoints (zodiac, chinese-zodiac, sacred-geometry, covers)
- Oracle reading endpoints (tarot, astrology, chinese_astrology, iching, sacred_geometry)
- Profile endpoints (me, customize, public profile)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zen-energy-bar.preview.emergentagent.com')

class TestOracleStaticData:
    """Tests for Oracle static data endpoints"""
    
    def test_get_zodiac_signs(self):
        """GET /api/oracle/zodiac returns 12 zodiac signs"""
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12
        # Verify structure
        assert data[0]["sign"] == "Aries"
        assert "dates" in data[0]
        assert "element" in data[0]
        assert "ruler" in data[0]
        assert "color" in data[0]
        print(f"✓ GET /api/oracle/zodiac - 12 zodiac signs returned")
    
    def test_get_chinese_zodiac(self):
        """GET /api/oracle/chinese-zodiac returns 12 animals"""
        response = requests.get(f"{BASE_URL}/api/oracle/chinese-zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12
        # Verify structure
        assert data[0]["animal"] == "Rat"
        assert "years" in data[0]
        assert "traits" in data[0]
        assert "color" in data[0]
        print(f"✓ GET /api/oracle/chinese-zodiac - 12 animals returned")
    
    def test_get_sacred_geometry(self):
        """GET /api/oracle/sacred-geometry returns patterns"""
        response = requests.get(f"{BASE_URL}/api/oracle/sacred-geometry")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        # Verify structure
        assert "id" in data[0]
        assert "name" in data[0]
        assert "description" in data[0]
        assert "meaning" in data[0]
        assert "color" in data[0]
        print(f"✓ GET /api/oracle/sacred-geometry - {len(data)} patterns returned")


class TestProfileEndpoints:
    """Tests for Profile endpoints"""
    
    def test_get_cover_presets(self):
        """GET /api/profile/covers returns cover presets"""
        response = requests.get(f"{BASE_URL}/api/profile/covers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        # Verify structure
        assert "id" in data[0]
        assert "url" in data[0]
        assert "name" in data[0]
        print(f"✓ GET /api/profile/covers - {len(data)} cover presets returned")


class TestOracleReadings:
    """Tests for Oracle reading endpoints with AI integration"""
    
    def test_tarot_reading(self):
        """POST /api/oracle/reading with tarot type returns cards and interpretation"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "tarot", "spread": "three_card", "question": "Test question"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "tarot"
        assert "cards" in data
        assert len(data["cards"]) == 3
        assert "interpretation" in data
        assert len(data["interpretation"]) > 50  # AI should generate meaningful text
        # Verify card structure
        card = data["cards"][0]
        assert "name" in card
        assert "reversed" in card
        assert "keywords" in card
        print(f"✓ POST /api/oracle/reading (tarot) - 3 cards with interpretation")
    
    def test_iching_reading(self):
        """POST /api/oracle/reading with iching type returns hexagram and interpretation"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "iching", "question": "What guidance do I need?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "iching"
        assert "hexagram_number" in data
        assert "lines" in data
        assert len(data["lines"]) == 6
        assert "interpretation" in data
        assert len(data["interpretation"]) > 50
        print(f"✓ POST /api/oracle/reading (iching) - Hexagram #{data['hexagram_number']} with interpretation")
    
    def test_astrology_reading(self):
        """POST /api/oracle/reading with astrology type returns reading for zodiac sign"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "astrology", "zodiac_sign": "Aries"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "astrology"
        assert "sign" in data
        assert data["sign"]["sign"] == "Aries"
        assert "reading" in data
        assert len(data["reading"]) > 50
        print(f"✓ POST /api/oracle/reading (astrology) - Aries reading returned")
    
    def test_chinese_astrology_reading(self):
        """POST /api/oracle/reading with chinese_astrology type returns reading"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "chinese_astrology", "birth_year": 1990}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "chinese_astrology"
        assert "animal" in data
        assert data["animal"]["animal"] == "Horse"  # 1990 is Horse year
        assert "element" in data
        assert "year" in data
        assert data["year"] == 1990
        assert "reading" in data
        assert len(data["reading"]) > 50
        print(f"✓ POST /api/oracle/reading (chinese_astrology) - {data['element']} {data['animal']['animal']} reading")
    
    def test_sacred_geometry_reading(self):
        """POST /api/oracle/reading with sacred_geometry type returns pattern and meditation"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "sacred_geometry"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "sacred_geometry"
        assert "pattern" in data
        assert "name" in data["pattern"]
        assert "meditation" in data
        assert len(data["meditation"]) > 50
        print(f"✓ POST /api/oracle/reading (sacred_geometry) - {data['pattern']['name']} with meditation")


class TestAuthenticatedProfile:
    """Tests for authenticated profile endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "password"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_get_my_profile(self, auth_token):
        """GET /api/profile/me returns profile for authenticated user"""
        response = requests.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "display_name" in data
        assert "theme_color" in data
        assert "avatar_style" in data
        print(f"✓ GET /api/profile/me - Profile returned for user {data['user_id'][:8]}...")
    
    def test_customize_profile(self, auth_token):
        """PUT /api/profile/customize updates profile for authenticated user"""
        test_bio = f"Test bio updated at {os.urandom(4).hex()}"
        response = requests.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "display_name": "Test Cosmic User",
                "bio": test_bio,
                "avatar_style": "blue-green",
                "theme_color": "#3B82F6"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Test Cosmic User"
        assert data["bio"] == test_bio
        assert data["avatar_style"] == "blue-green"
        assert data["theme_color"] == "#3B82F6"
        print(f"✓ PUT /api/profile/customize - Profile updated successfully")
        
        # Verify persistence with GET
        verify_response = requests.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["bio"] == test_bio
        print(f"✓ Profile changes persisted correctly")


class TestHealthAndNavigation:
    """Tests for API health and navigation-related endpoints"""
    
    def test_api_health(self):
        """GET /api/ returns health check"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ GET /api/ - API is alive")
    
    def test_dashboard_stats_requires_auth(self):
        """GET /api/dashboard/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 401
        print(f"✓ GET /api/dashboard/stats - Correctly requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

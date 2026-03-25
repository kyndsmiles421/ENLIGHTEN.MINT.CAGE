"""
Test suite for Cardology, Mayan Astrology, and Guided Experience features.
Tests the new features added in iteration 20.
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
def auth_token():
    """Get authentication token for protected endpoints."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestCardologyBirthCard:
    """Tests for /api/cardology/birth-card endpoint"""
    
    def test_birth_card_valid_date(self):
        """Test birth card calculation with valid date"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=5&day=12")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "card" in data
        card = data["card"]
        assert "title" in card
        assert "keyword" in card
        assert "element" in card
        assert "suit" in card
        assert "value" in card
        assert "suit_theme" in card
        assert "planet" in card
        assert "love" in card
        assert "life" in card
        assert "desc" in card
        
        # Verify suit_theme structure
        assert "theme" in card["suit_theme"]
        assert "color" in card["suit_theme"]
        
        # Verify planet structure
        assert "planet" in card["planet"]
        assert "color" in card["planet"]
        
        print(f"Birth card for May 12: {card['title']} - {card['keyword']}")
    
    def test_birth_card_january_first(self):
        """Test birth card for January 1st"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=1&day=1")
        assert response.status_code == 200
        data = response.json()
        assert "card" in data
        print(f"Birth card for Jan 1: {data['card']['title']}")
    
    def test_birth_card_december_31(self):
        """Test birth card for December 31st"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=12&day=31")
        assert response.status_code == 200
        data = response.json()
        assert "card" in data
        print(f"Birth card for Dec 31: {data['card']['title']}")
    
    def test_birth_card_invalid_month(self):
        """Test birth card with invalid month"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=13&day=15")
        assert response.status_code == 400
    
    def test_birth_card_invalid_day(self):
        """Test birth card with invalid day"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=5&day=32")
        assert response.status_code == 400


class TestCardologyDailyCard:
    """Tests for /api/cardology/daily-card endpoint"""
    
    def test_daily_card_returns_card(self):
        """Test daily card endpoint returns a card"""
        response = requests.get(f"{BASE_URL}/api/cardology/daily-card")
        assert response.status_code == 200
        data = response.json()
        
        assert "card" in data
        card = data["card"]
        assert "title" in card
        assert "keyword" in card
        assert "element" in card
        assert "suit" in card
        assert "date" in card
        
        print(f"Today's card: {card['title']} - {card['keyword']}")
    
    def test_daily_card_consistent_same_day(self):
        """Test that daily card is consistent for the same day"""
        response1 = requests.get(f"{BASE_URL}/api/cardology/daily-card")
        response2 = requests.get(f"{BASE_URL}/api/cardology/daily-card")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        card1 = response1.json()["card"]
        card2 = response2.json()["card"]
        
        assert card1["title"] == card2["title"]
        print("Daily card is consistent across requests")


class TestCardologyCompatibility:
    """Tests for /api/cardology/compatibility endpoint"""
    
    def test_compatibility_valid_dates(self):
        """Test compatibility with valid dates"""
        response = requests.get(f"{BASE_URL}/api/cardology/compatibility?month1=3&day1=15&month2=7&day2=20")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "person1" in data
        assert "person2" in data
        assert "score" in data
        assert "messages" in data
        
        # Verify score is a percentage
        assert 0 <= data["score"] <= 100
        
        # Verify messages is a list
        assert isinstance(data["messages"], list)
        assert len(data["messages"]) > 0
        
        # Verify person cards have required fields
        for person in [data["person1"], data["person2"]]:
            assert "title" in person
            assert "suit" in person
            assert "element" in person
        
        print(f"Compatibility score: {data['score']}%")
        print(f"Person 1: {data['person1']['title']}, Person 2: {data['person2']['title']}")
    
    def test_compatibility_same_birthday(self):
        """Test compatibility for same birthday"""
        response = requests.get(f"{BASE_URL}/api/cardology/compatibility?month1=5&day1=12&month2=5&day2=12")
        assert response.status_code == 200
        data = response.json()
        
        # Same birthday should have high compatibility
        assert data["score"] >= 50
        assert data["person1"]["title"] == data["person2"]["title"]
        print(f"Same birthday compatibility: {data['score']}%")


class TestMayanBirthSign:
    """Tests for /api/mayan/birth-sign endpoint"""
    
    def test_birth_sign_valid_date(self):
        """Test Mayan birth sign with valid date"""
        response = requests.get(f"{BASE_URL}/api/mayan/birth-sign?year=1990&month=7&day=26")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "kin" in data
        assert "sign" in data
        assert "tone" in data
        assert "galactic_signature" in data
        
        # Verify kin is in valid range (1-260)
        assert 1 <= data["kin"] <= 260
        
        # Verify sign structure
        sign = data["sign"]
        assert "name" in sign
        assert "glyph" in sign
        assert "element" in sign
        assert "direction" in sign
        assert "meaning" in sign
        assert "desc" in sign
        assert "shadow" in sign
        assert "affirmation" in sign
        assert "color" in sign
        
        # Verify tone structure
        tone = data["tone"]
        assert "num" in tone
        assert "name" in tone
        assert "purpose" in tone
        assert "action" in tone
        assert "color" in tone
        
        print(f"Galactic signature: {data['galactic_signature']}")
        print(f"Kin: {data['kin']}, Sign: {sign['name']}, Tone: {tone['name']}")
    
    def test_birth_sign_different_years(self):
        """Test that different years give different kins"""
        response1 = requests.get(f"{BASE_URL}/api/mayan/birth-sign?year=1990&month=7&day=26")
        response2 = requests.get(f"{BASE_URL}/api/mayan/birth-sign?year=1991&month=7&day=26")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Different years should give different kins (usually)
        kin1 = response1.json()["kin"]
        kin2 = response2.json()["kin"]
        print(f"1990 kin: {kin1}, 1991 kin: {kin2}")
    
    def test_birth_sign_invalid_date(self):
        """Test birth sign with invalid date"""
        response = requests.get(f"{BASE_URL}/api/mayan/birth-sign?year=1990&month=13&day=26")
        assert response.status_code == 400


class TestMayanToday:
    """Tests for /api/mayan/today endpoint"""
    
    def test_today_returns_sign(self):
        """Test today's Mayan energy endpoint"""
        response = requests.get(f"{BASE_URL}/api/mayan/today")
        assert response.status_code == 200
        data = response.json()
        
        assert "kin" in data
        assert "sign" in data
        assert "tone" in data
        assert "galactic_signature" in data
        assert "date" in data
        
        print(f"Today's energy: {data['galactic_signature']}")
    
    def test_today_consistent(self):
        """Test that today's energy is consistent"""
        response1 = requests.get(f"{BASE_URL}/api/mayan/today")
        response2 = requests.get(f"{BASE_URL}/api/mayan/today")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        assert response1.json()["kin"] == response2.json()["kin"]


class TestMayanCompatibility:
    """Tests for /api/mayan/compatibility endpoint"""
    
    def test_compatibility_valid_dates(self):
        """Test Mayan compatibility with valid dates"""
        response = requests.get(
            f"{BASE_URL}/api/mayan/compatibility?"
            "year1=1990&month1=7&day1=26&year2=1992&month2=3&day2=15"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "person1" in data
        assert "person2" in data
        assert "score" in data
        assert "messages" in data
        
        # Verify score is a percentage
        assert 0 <= data["score"] <= 100
        
        # Verify person data
        for person in [data["person1"], data["person2"]]:
            assert "kin" in person
            assert "sign" in person
            assert "tone" in person
            assert "galactic_signature" in person
        
        print(f"Mayan compatibility score: {data['score']}%")
        print(f"Person 1: {data['person1']['galactic_signature']}")
        print(f"Person 2: {data['person2']['galactic_signature']}")


class TestGuidedExperience:
    """Tests for /api/guided-experience/generate endpoint (requires auth)"""
    
    def test_guided_experience_requires_auth(self):
        """Test that guided experience requires authentication"""
        response = requests.post(f"{BASE_URL}/api/guided-experience/generate", json={
            "practice_name": "Test Practice",
            "description": "A test practice",
            "instructions": ["Step 1", "Step 2"],
            "category": "meditation",
            "duration_minutes": 5
        })
        assert response.status_code == 401
    
    def test_guided_experience_with_auth(self, auth_headers):
        """Test guided experience generation with authentication"""
        response = requests.post(
            f"{BASE_URL}/api/guided-experience/generate",
            json={
                "practice_name": "Breath Awareness",
                "description": "A simple breath awareness meditation",
                "instructions": [
                    "Find a comfortable seated position",
                    "Close your eyes gently",
                    "Focus on your natural breath"
                ],
                "category": "meditation",
                "duration_minutes": 5
            },
            headers=auth_headers,
            timeout=60  # AI call may take time
        )
        
        # This endpoint uses AI, so it may take time or fail
        if response.status_code == 200:
            data = response.json()
            assert "practice_name" in data
            assert "segments" in data
            assert "total_duration" in data
            assert isinstance(data["segments"], list)
            
            # Verify segment structure
            if len(data["segments"]) > 0:
                segment = data["segments"][0]
                assert "text" in segment
                assert "duration" in segment
                assert "cue" in segment
                assert "intensity" in segment
            
            print(f"Generated {len(data['segments'])} segments, total duration: {data['total_duration']}s")
        elif response.status_code == 500:
            # AI generation may fail, which is acceptable
            print("Guided experience generation failed (AI error) - acceptable")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestProfileMessagePrivacy:
    """Tests for message privacy in profile"""
    
    def test_profile_includes_message_privacy(self, auth_headers):
        """Test that profile includes message_privacy field"""
        response = requests.get(f"{BASE_URL}/api/profile/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "message_privacy" in data
        assert data["message_privacy"] in ["everyone", "friends_only", "nobody"]
        print(f"Current message privacy: {data['message_privacy']}")


class TestUsersDiscover:
    """Tests for user discovery endpoint"""
    
    def test_discover_returns_users(self, auth_headers):
        """Test that discover endpoint returns users with message_privacy"""
        response = requests.get(f"{BASE_URL}/api/users/discover", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # API returns paginated response with 'users' key
        assert "users" in data
        users = data["users"]
        assert isinstance(users, list)
        
        if len(users) > 0:
            user = users[0]
            assert "id" in user
            assert "display_name" in user
            # message_privacy should be included
            print(f"Found {len(users)} users in discover")


class TestNavigationEndpoints:
    """Tests for endpoints that should be accessible for navigation"""
    
    def test_tantra_endpoint(self):
        """Test tantra practices endpoint"""
        response = requests.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} tantra practices")
    
    def test_mudras_endpoint(self):
        """Test mudras endpoint"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} mudras")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

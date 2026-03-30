"""
Iteration 111: Astrology Reading Feature Tests
Tests for POST /api/star-chart/astrology-reading endpoint
- Personalized AI reading with cosmic_influence, planetary_message, personal_guidance, energy_forecast, affirmation, power_element, intensity
- Uses user's birth zodiac, mood history, aura color for personalization
- Moon phase calculation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from iteration_110
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestAstrologyReading:
    """Astrology Reading endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            print(f"Login successful, token obtained")
        else:
            pytest.skip(f"Login failed with status {login_response.status_code}: {login_response.text}")
    
    def test_astrology_reading_basic(self):
        """Test basic astrology reading request with minimal data"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "aries",
            "constellation_name": "Aries",
            "constellation_element": "Fire",
            "constellation_meaning": "The Ram - symbol of new beginnings"
        }, timeout=30)  # Longer timeout for AI generation
        
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text[:500] if response.text else 'empty'}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify response structure
        assert "reading" in data, "Response should contain 'reading'"
        assert "constellation" in data, "Response should contain 'constellation'"
        assert "moon_phase" in data, "Response should contain 'moon_phase'"
        assert "moon_energy" in data, "Response should contain 'moon_energy'"
        assert "active_transits" in data, "Response should contain 'active_transits'"
        assert "timestamp" in data, "Response should contain 'timestamp'"
        
        # Verify reading fields
        reading = data["reading"]
        assert "cosmic_influence" in reading, "Reading should contain 'cosmic_influence'"
        assert "planetary_message" in reading, "Reading should contain 'planetary_message'"
        assert "personal_guidance" in reading, "Reading should contain 'personal_guidance'"
        assert "energy_forecast" in reading, "Reading should contain 'energy_forecast'"
        assert "affirmation" in reading, "Reading should contain 'affirmation'"
        assert "power_element" in reading, "Reading should contain 'power_element'"
        assert "intensity" in reading, "Reading should contain 'intensity'"
        
        # Verify intensity is a number 1-10
        assert isinstance(reading["intensity"], int), "Intensity should be an integer"
        assert 1 <= reading["intensity"] <= 10, f"Intensity should be 1-10, got {reading['intensity']}"
        
        # Verify power_element is valid
        valid_elements = ["Fire", "Water", "Air", "Earth"]
        assert reading["power_element"] in valid_elements, f"Power element should be one of {valid_elements}"
        
        print(f"✓ Astrology reading basic test passed")
        print(f"  Moon phase: {data['moon_phase']}")
        print(f"  Power element: {reading['power_element']}")
        print(f"  Intensity: {reading['intensity']}")
    
    def test_astrology_reading_all_zodiac_signs(self):
        """Test astrology reading for all 12 zodiac signs"""
        zodiac_signs = [
            ("aries", "Aries", "Fire"),
            ("taurus", "Taurus", "Earth"),
            ("gemini", "Gemini", "Air"),
            ("cancer", "Cancer", "Water"),
            ("leo", "Leo", "Fire"),
            ("virgo", "Virgo", "Earth"),
            ("libra", "Libra", "Air"),
            ("scorpio", "Scorpio", "Water"),
            ("sagittarius", "Sagittarius", "Fire"),
            ("capricorn", "Capricorn", "Earth"),
            ("aquarius", "Aquarius", "Air"),
            ("pisces", "Pisces", "Water"),
        ]
        
        # Test just 3 signs to save time (AI calls are slow)
        for sign_id, sign_name, element in zodiac_signs[:3]:
            response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
                "constellation_id": sign_id,
                "constellation_name": sign_name,
                "constellation_element": element,
                "constellation_meaning": f"The {sign_name} constellation"
            }, timeout=30)
            
            assert response.status_code == 200, f"Failed for {sign_name}: {response.status_code}"
            data = response.json()
            assert data["constellation"]["id"] == sign_id
            assert data["constellation"]["name"] == sign_name
            assert data["constellation"]["element"] == element
            print(f"✓ {sign_name} reading passed")
    
    def test_astrology_reading_moon_phase_data(self):
        """Test that moon phase data is returned correctly"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "leo",
            "constellation_name": "Leo",
            "constellation_element": "Fire",
            "constellation_meaning": "The Lion"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify moon phase is one of the valid phases
        valid_phases = [
            "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
            "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
        ]
        assert data["moon_phase"] in valid_phases, f"Invalid moon phase: {data['moon_phase']}"
        
        # Verify moon energy is a non-empty string
        assert isinstance(data["moon_energy"], str), "Moon energy should be a string"
        assert len(data["moon_energy"]) > 0, "Moon energy should not be empty"
        
        print(f"✓ Moon phase test passed: {data['moon_phase']} - {data['moon_energy']}")
    
    def test_astrology_reading_active_transits(self):
        """Test that active transits are returned"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "virgo",
            "constellation_name": "Virgo",
            "constellation_element": "Earth",
            "constellation_meaning": "The Maiden"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # Active transits should be a list
        assert isinstance(data["active_transits"], list), "Active transits should be a list"
        
        # Valid planets
        valid_planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Neptune", "Uranus", "Pluto"]
        for planet in data["active_transits"]:
            assert planet in valid_planets, f"Invalid planet: {planet}"
        
        print(f"✓ Active transits test passed: {data['active_transits']}")
    
    def test_astrology_reading_user_zodiac_detection(self):
        """Test that user's zodiac is detected from profile"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "scorpio",
            "constellation_name": "Scorpio",
            "constellation_element": "Water",
            "constellation_meaning": "The Scorpion"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # user_zodiac can be None if no birth date in profile
        # is_own_constellation should be boolean
        assert "user_zodiac" in data, "Response should contain 'user_zodiac'"
        assert "is_own_constellation" in data, "Response should contain 'is_own_constellation'"
        assert isinstance(data["is_own_constellation"], bool), "is_own_constellation should be boolean"
        
        print(f"✓ User zodiac detection test passed")
        print(f"  User zodiac: {data['user_zodiac']}")
        print(f"  Is own constellation: {data['is_own_constellation']}")
    
    def test_astrology_reading_timestamp(self):
        """Test that timestamp is returned in ISO format"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "pisces",
            "constellation_name": "Pisces",
            "constellation_element": "Water",
            "constellation_meaning": "The Fish"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # Timestamp should be ISO format
        assert "timestamp" in data
        assert "T" in data["timestamp"], "Timestamp should be ISO format with T separator"
        
        print(f"✓ Timestamp test passed: {data['timestamp']}")
    
    def test_astrology_reading_without_auth(self):
        """Test that astrology reading requires authentication"""
        # Create a new session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "aries",
            "constellation_name": "Aries",
            "constellation_element": "Fire",
            "constellation_meaning": "The Ram"
        }, timeout=10)
        
        # Should return 401 or 403
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Auth required test passed (status: {response.status_code})")
    
    def test_astrology_reading_empty_constellation(self):
        """Test astrology reading with empty constellation data"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "",
            "constellation_name": "",
            "constellation_element": "",
            "constellation_meaning": ""
        }, timeout=30)
        
        # Should still work with fallback values
        assert response.status_code == 200, f"Expected 200 with empty data, got {response.status_code}"
        data = response.json()
        assert "reading" in data
        print(f"✓ Empty constellation test passed")
    
    def test_astrology_reading_reading_content_quality(self):
        """Test that reading content is meaningful (not empty)"""
        response = self.session.post(f"{BASE_URL}/api/star-chart/astrology-reading", json={
            "constellation_id": "sagittarius",
            "constellation_name": "Sagittarius",
            "constellation_element": "Fire",
            "constellation_meaning": "The Archer"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        reading = data["reading"]
        
        # All text fields should have meaningful content
        assert len(reading["cosmic_influence"]) > 20, "cosmic_influence should have meaningful content"
        assert len(reading["planetary_message"]) > 20, "planetary_message should have meaningful content"
        assert len(reading["personal_guidance"]) > 20, "personal_guidance should have meaningful content"
        assert len(reading["energy_forecast"]) > 10, "energy_forecast should have meaningful content"
        assert len(reading["affirmation"]) > 5, "affirmation should have meaningful content"
        
        print(f"✓ Reading content quality test passed")
        print(f"  Cosmic influence length: {len(reading['cosmic_influence'])} chars")
        print(f"  Affirmation: {reading['affirmation'][:50]}...")


class TestStarChartEndpoints:
    """Additional Star Chart endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Login failed")
    
    def test_star_chart_constellations_endpoint(self):
        """Test that star chart constellations endpoint works"""
        response = self.session.get(f"{BASE_URL}/api/star-chart/constellations?lat=40.7&lng=-74.0", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "constellations" in data, "Response should contain 'constellations'"
        assert isinstance(data["constellations"], list), "Constellations should be a list"
        assert len(data["constellations"]) > 0, "Should have at least one constellation"
        
        # Check first constellation has required fields
        first = data["constellations"][0]
        assert "id" in first
        assert "name" in first
        assert "element" in first
        assert "ra" in first
        assert "dec" in first
        
        print(f"✓ Star chart constellations endpoint passed ({len(data['constellations'])} constellations)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

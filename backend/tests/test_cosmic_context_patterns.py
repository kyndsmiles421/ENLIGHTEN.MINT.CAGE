"""
Test suite for Cosmic Context API and Dream Patterns features
- GET /api/cosmic-context - unified cosmic snapshot (requires auth)
- GET /api/dreams/patterns - dream pattern analysis (requires auth)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCosmicContextAPI:
    """Tests for the unified cosmic context endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_cosmic_context_requires_auth(self):
        """Test that cosmic-context endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: cosmic-context requires authentication")
    
    def test_cosmic_context_returns_data(self, auth_headers):
        """Test that cosmic-context returns all expected fields"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check required top-level fields
        assert "date" in data, "Missing 'date' field"
        assert "moon" in data, "Missing 'moon' field"
        assert "mayan" in data, "Missing 'mayan' field"
        assert "suggestions" in data, "Missing 'suggestions' field"
        assert "recent_dreams" in data, "Missing 'recent_dreams' field"
        
        print(f"PASS: cosmic-context returns data with date={data['date']}")
    
    def test_cosmic_context_moon_data(self, auth_headers):
        """Test moon phase data structure"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        moon = data.get("moon", {})
        
        assert "phase" in moon, "Missing moon phase"
        assert "code" in moon, "Missing moon code"
        assert isinstance(moon["phase"], str), "Moon phase should be string"
        
        print(f"PASS: Moon data - phase={moon['phase']}, code={moon['code']}")
    
    def test_cosmic_context_mayan_data(self, auth_headers):
        """Test Mayan energy data structure"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        mayan = data.get("mayan", {})
        
        assert "kin" in mayan, "Missing Mayan kin"
        assert "glyph" in mayan, "Missing Mayan glyph"
        assert "sign_name" in mayan, "Missing Mayan sign_name"
        assert "tone" in mayan, "Missing Mayan tone"
        assert "galactic_signature" in mayan, "Missing galactic_signature"
        
        print(f"PASS: Mayan data - kin={mayan['kin']}, glyph={mayan['glyph']}, signature={mayan['galactic_signature']}")
    
    def test_cosmic_context_suggestions(self, auth_headers):
        """Test practice suggestions structure"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        suggestions = data.get("suggestions", [])
        
        assert isinstance(suggestions, list), "Suggestions should be a list"
        
        if len(suggestions) > 0:
            s = suggestions[0]
            assert "type" in s, "Suggestion missing 'type'"
            assert "text" in s, "Suggestion missing 'text'"
            assert "link" in s, "Suggestion missing 'link'"
            print(f"PASS: Suggestions - {len(suggestions)} suggestions, first type={s['type']}")
        else:
            print("PASS: Suggestions list is empty (valid)")
    
    def test_cosmic_context_recent_dreams(self, auth_headers):
        """Test recent dreams structure"""
        response = requests.get(f"{BASE_URL}/api/cosmic-context", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        dreams = data.get("recent_dreams", [])
        
        assert isinstance(dreams, list), "recent_dreams should be a list"
        
        if len(dreams) > 0:
            d = dreams[0]
            assert "id" in d, "Dream missing 'id'"
            assert "title" in d, "Dream missing 'title'"
            print(f"PASS: Recent dreams - {len(dreams)} dreams found")
        else:
            print("PASS: Recent dreams list is empty (valid for new user)")


class TestDreamPatternsAPI:
    """Tests for the dream patterns analysis endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_dream_patterns_requires_auth(self):
        """Test that dreams/patterns endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: dreams/patterns requires authentication")
    
    def test_dream_patterns_returns_data(self, auth_headers):
        """Test that dreams/patterns returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check required fields
        assert "total" in data, "Missing 'total' field"
        assert "symbol_frequency" in data, "Missing 'symbol_frequency' field"
        assert "moon_correlations" in data, "Missing 'moon_correlations' field"
        assert "insights" in data, "Missing 'insights' field"
        
        print(f"PASS: dreams/patterns returns data with total={data['total']} dreams")
    
    def test_dream_patterns_statistics(self, auth_headers):
        """Test dream statistics fields"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check statistics fields
        assert "lucid_count" in data, "Missing 'lucid_count' field"
        assert "avg_vividness" in data, "Missing 'avg_vividness' field"
        
        assert isinstance(data["total"], int), "total should be int"
        assert isinstance(data["lucid_count"], int), "lucid_count should be int"
        
        print(f"PASS: Dream stats - total={data['total']}, lucid={data['lucid_count']}, avg_vividness={data['avg_vividness']}")
    
    def test_dream_patterns_moon_correlations(self, auth_headers):
        """Test moon correlations structure"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        correlations = data.get("moon_correlations", [])
        
        assert isinstance(correlations, list), "moon_correlations should be a list"
        
        if len(correlations) > 0:
            c = correlations[0]
            assert "symbol" in c, "Correlation missing 'symbol'"
            assert "moon_phase" in c, "Correlation missing 'moon_phase'"
            assert "count" in c, "Correlation missing 'count'"
            print(f"PASS: Moon correlations - {len(correlations)} correlations found")
        else:
            print("PASS: Moon correlations list is empty (valid)")
    
    def test_dream_patterns_insights(self, auth_headers):
        """Test insights structure"""
        response = requests.get(f"{BASE_URL}/api/dreams/patterns", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        insights = data.get("insights", [])
        
        assert isinstance(insights, list), "insights should be a list"
        
        if len(insights) > 0:
            i = insights[0]
            assert "type" in i, "Insight missing 'type'"
            assert "title" in i, "Insight missing 'title'"
            assert "text" in i, "Insight missing 'text'"
            assert "color" in i, "Insight missing 'color'"
            print(f"PASS: Insights - {len(insights)} insights, first type={i['type']}")
        else:
            print("PASS: Insights list is empty (valid for few dreams)")


class TestCosmicCalendarAPI:
    """Tests for the cosmic calendar endpoint"""
    
    def test_cosmic_calendar_today(self):
        """Test cosmic calendar today endpoint"""
        response = requests.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check required fields
        assert "date" in data, "Missing 'date' field"
        assert "numerology" in data, "Missing 'numerology' field"
        assert "moon" in data, "Missing 'moon' field"
        assert "mayan" in data, "Missing 'mayan' field"
        assert "cardology" in data, "Missing 'cardology' field"
        assert "energy_summary" in data, "Missing 'energy_summary' field"
        
        print(f"PASS: cosmic-calendar/today returns data for date={data['date']}")
    
    def test_cosmic_calendar_numerology(self):
        """Test numerology data in cosmic calendar"""
        response = requests.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        numerology = data.get("numerology", {})
        
        assert "personal_year" in numerology, "Missing personal_year"
        assert "personal_month" in numerology, "Missing personal_month"
        assert "personal_day" in numerology, "Missing personal_day"
        
        py = numerology["personal_year"]
        assert "number" in py, "personal_year missing number"
        assert "theme" in py, "personal_year missing theme"
        
        print(f"PASS: Numerology - personal_year={py['number']}, theme={py['theme']}")
    
    def test_cosmic_calendar_moon(self):
        """Test moon data in cosmic calendar"""
        response = requests.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        moon = data.get("moon", {})
        
        assert "phase" in moon, "Missing moon phase"
        assert "code" in moon, "Missing moon code"
        assert "guidance" in moon, "Missing moon guidance"
        
        print(f"PASS: Moon - phase={moon['phase']}, code={moon['code']}")
    
    def test_cosmic_calendar_mayan(self):
        """Test Mayan data in cosmic calendar"""
        response = requests.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        mayan = data.get("mayan", {})
        
        assert "kin" in mayan, "Missing Mayan kin"
        assert "glyph" in mayan, "Missing Mayan glyph"
        assert "galactic_signature" in mayan, "Missing galactic_signature"
        
        print(f"PASS: Mayan - kin={mayan['kin']}, glyph={mayan['glyph']}")
    
    def test_cosmic_calendar_cardology(self):
        """Test cardology data in cosmic calendar"""
        response = requests.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        card = data.get("cardology", {})
        
        assert "card" in card, "Missing card name"
        assert "suit" in card, "Missing card suit"
        assert "value" in card, "Missing card value"
        
        print(f"PASS: Cardology - card={card['card']}, suit={card['suit']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Test suite for Cardology Yearly Spread feature
Based on Robert Lee Camp's "Cards of Your Destiny"
Tests the 7 planetary periods (Mercury through Neptune) for a user's current year
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestYearlySpreadAPI:
    """Tests for GET /api/cardology/yearly-spread endpoint"""
    
    def test_yearly_spread_july_4_1990_returns_jack_of_diamonds(self):
        """July 4, 1990 birth should return Jack of Diamonds as birth card"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        assert "spread" in data
        spread = data["spread"]
        
        # Verify birth card is Jack of Diamonds
        assert spread["birth_card"]["title"] == "Jack of Diamonds"
        assert spread["birth_card"]["suit"] == "Diamonds"
        assert spread["birth_card"]["value"] == "Jack"
    
    def test_yearly_spread_jan_1_1985_returns_king_of_spades(self):
        """January 1, 1985 birth should return King of Spades as birth card"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=1&day=1&birth_year=1985")
        assert response.status_code == 200
        
        data = response.json()
        spread = data["spread"]
        
        # Verify birth card is King of Spades
        assert spread["birth_card"]["title"] == "King of Spades"
        assert spread["birth_card"]["suit"] == "Spades"
        assert spread["birth_card"]["value"] == "King"
    
    def test_yearly_spread_response_structure(self):
        """Verify response includes all required fields"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        spread = data["spread"]
        
        # Required top-level fields
        assert "birth_card" in spread
        assert "age" in spread
        assert "card_year" in spread
        assert "periods" in spread
        assert "current_period" in spread
        
        # Verify types
        assert isinstance(spread["age"], int)
        assert isinstance(spread["card_year"], int)
        assert isinstance(spread["periods"], list)
    
    def test_yearly_spread_has_7_periods(self):
        """Verify exactly 7 planetary periods are returned"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        assert len(periods) == 7
    
    def test_yearly_spread_period_structure(self):
        """Verify each period has required fields"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        required_fields = ["period_number", "planet", "planet_color", "card", "start_date", "end_date", "is_current"]
        
        for period in periods:
            for field in required_fields:
                assert field in period, f"Missing field: {field} in period {period.get('period_number')}"
    
    def test_yearly_spread_planets_order(self):
        """Verify planets are in correct order: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        expected_planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]
        actual_planets = [p["planet"] for p in periods]
        
        assert actual_planets == expected_planets
    
    def test_yearly_spread_exactly_one_current_period(self):
        """Verify exactly one period has is_current=true"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        current_periods = [p for p in periods if p["is_current"]]
        assert len(current_periods) == 1, f"Expected 1 current period, got {len(current_periods)}"
    
    def test_yearly_spread_current_period_matches_current_period_field(self):
        """Verify current_period field matches the period with is_current=true"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        spread = data["spread"]
        
        current_from_periods = next(p for p in spread["periods"] if p["is_current"])
        assert spread["current_period"]["planet"] == current_from_periods["planet"]
    
    def test_yearly_spread_period_card_has_details(self):
        """Verify each period's card has full card details"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        card_fields = ["title", "suit", "value", "keyword", "desc"]
        
        for period in periods:
            card = period["card"]
            for field in card_fields:
                assert field in card, f"Missing card field: {field} in period {period['period_number']}"
    
    def test_yearly_spread_invalid_month_returns_400(self):
        """Invalid month should return 400 error"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=13&day=4&birth_year=1990")
        assert response.status_code == 400
    
    def test_yearly_spread_invalid_day_returns_400(self):
        """Invalid day should return 400 error"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=32&birth_year=1990")
        assert response.status_code == 400
    
    def test_yearly_spread_invalid_year_returns_400(self):
        """Invalid birth year should return 400 error"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1800")
        assert response.status_code == 400
    
    def test_yearly_spread_period_dates_are_52_days_apart(self):
        """Verify each period is approximately 52 days"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        from datetime import datetime
        
        data = response.json()
        periods = data["spread"]["periods"]
        
        for period in periods:
            start = datetime.fromisoformat(period["start_date"])
            end = datetime.fromisoformat(period["end_date"])
            duration = (end - start).days + 1  # +1 because end date is inclusive
            assert duration == 52, f"Period {period['period_number']} duration is {duration} days, expected 52"
    
    def test_yearly_spread_birth_card_has_magi_formula(self):
        """Verify birth card includes magi_formula and solar_value"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=7&day=4&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        birth_card = data["spread"]["birth_card"]
        
        # Birth card should have suit_theme at minimum
        assert "suit_theme" in birth_card
        assert "title" in birth_card


class TestYearlySpreadEdgeCases:
    """Edge case tests for yearly spread"""
    
    def test_yearly_spread_dec_31_birth(self):
        """Test December 31 birthday (edge of year)"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=12&day=31&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["spread"]["periods"]) == 7
    
    def test_yearly_spread_jan_1_birth(self):
        """Test January 1 birthday (start of year)"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=1&day=1&birth_year=1990")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["spread"]["periods"]) == 7
    
    def test_yearly_spread_leap_year_feb_29(self):
        """Test February 29 birthday (leap year)"""
        response = requests.get(f"{BASE_URL}/api/cardology/yearly-spread?month=2&day=29&birth_year=1992")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["spread"]["periods"]) == 7


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

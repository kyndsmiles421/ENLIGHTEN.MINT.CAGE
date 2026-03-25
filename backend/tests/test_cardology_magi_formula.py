"""
Test Cardology Birth Card - Magi Formula Implementation
Tests the Robert Lee Camp Magi Formula: Solar Value = 55 - (2 * month + day)
SV 0 = Joker, SV 1-13 = Hearts, SV 14-26 = Clubs, SV 27-39 = Diamonds, SV 40-52 = Spades
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCardologyMagiFormula:
    """Test the Magi Formula birth card calculations"""
    
    # Test case: Jan 1 -> SV = 55 - (2*1 + 1) = 55 - 3 = 52 -> King of Spades
    def test_jan_1_king_of_spades(self):
        """Jan 1: SV=52 should return King of Spades"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=1&day=1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 52, f"Expected SV=52, got {card.get('solar_value')}"
        
        # Verify card is King of Spades
        assert card.get("value") == "King", f"Expected King, got {card.get('value')}"
        assert card.get("suit") == "Spades", f"Expected Spades, got {card.get('suit')}"
        
        # Verify magi_formula field exists
        assert "magi_formula" in card, "magi_formula field missing"
        assert "55 - (2 x 1 + 1) = 52" in card.get("magi_formula", ""), f"Unexpected formula: {card.get('magi_formula')}"
        
        print(f"✓ Jan 1: King of Spades (SV=52) - PASS")
    
    # Test case: Jul 4 -> SV = 55 - (2*7 + 4) = 55 - 18 = 37 -> Jack of Diamonds (SV 27-39 = Diamonds, 37-27+1=11=Jack)
    def test_jul_4_jack_of_diamonds(self):
        """Jul 4: SV=37 should return Jack of Diamonds"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=7&day=4")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 37, f"Expected SV=37, got {card.get('solar_value')}"
        
        # Verify card is Jack of Diamonds
        assert card.get("value") == "Jack", f"Expected Jack, got {card.get('value')}"
        assert card.get("suit") == "Diamonds", f"Expected Diamonds, got {card.get('suit')}"
        
        print(f"✓ Jul 4: Jack of Diamonds (SV=37) - PASS")
    
    # Test case: Nov 7 -> SV = 55 - (2*11 + 7) = 55 - 29 = 26 -> King of Clubs (SV 14-26 = Clubs, 26-14+1=13=King)
    def test_nov_7_king_of_clubs(self):
        """Nov 7: SV=26 should return King of Clubs"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=11&day=7")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 26, f"Expected SV=26, got {card.get('solar_value')}"
        
        # Verify card is King of Clubs
        assert card.get("value") == "King", f"Expected King, got {card.get('value')}"
        assert card.get("suit") == "Clubs", f"Expected Clubs, got {card.get('suit')}"
        
        print(f"✓ Nov 7: King of Clubs (SV=26) - PASS")
    
    # Test case: Dec 31 -> SV = 55 - (2*12 + 31) = 55 - 55 = 0 -> Joker
    def test_dec_31_joker(self):
        """Dec 31: SV=0 should return The Joker"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=12&day=31")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 0, f"Expected SV=0, got {card.get('solar_value')}"
        
        # Verify card is Joker
        assert card.get("value") == "Joker", f"Expected Joker, got {card.get('value')}"
        
        print(f"✓ Dec 31: The Joker (SV=0) - PASS")
    
    # Test case: Jan 13 -> SV = 55 - (2*1 + 13) = 55 - 15 = 40 -> Ace of Spades (SV 40-52 = Spades, 40-40+1=1=Ace)
    def test_jan_13_ace_of_spades(self):
        """Jan 13: SV=40 should return Ace of Spades"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=1&day=13")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 40, f"Expected SV=40, got {card.get('solar_value')}"
        
        # Verify card is Ace of Spades
        assert card.get("value") == "Ace", f"Expected Ace, got {card.get('value')}"
        assert card.get("suit") == "Spades", f"Expected Spades, got {card.get('suit')}"
        
        print(f"✓ Jan 13: Ace of Spades (SV=40) - PASS")
    
    # Test case: Dec 30 -> SV = 55 - (2*12 + 30) = 55 - 54 = 1 -> Ace of Hearts (SV 1-13 = Hearts, 1-1+1=1=Ace)
    def test_dec_30_ace_of_hearts(self):
        """Dec 30: SV=1 should return Ace of Hearts"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=12&day=30")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify solar value
        assert card.get("solar_value") == 1, f"Expected SV=1, got {card.get('solar_value')}"
        
        # Verify card is Ace of Hearts
        assert card.get("value") == "Ace", f"Expected Ace, got {card.get('value')}"
        assert card.get("suit") == "Hearts", f"Expected Hearts, got {card.get('suit')}"
        
        print(f"✓ Dec 30: Ace of Hearts (SV=1) - PASS")
    
    def test_response_includes_magi_formula_fields(self):
        """Verify response includes solar_value and magi_formula fields"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=6&day=15")
        assert response.status_code == 200
        data = response.json()
        card = data.get("card", {})
        
        # Check required fields exist
        assert "solar_value" in card, "solar_value field missing"
        assert "magi_formula" in card, "magi_formula field missing"
        
        # Verify formula format
        expected_sv = 55 - (2 * 6 + 15)  # = 55 - 27 = 28
        assert card.get("solar_value") == expected_sv, f"Expected SV={expected_sv}, got {card.get('solar_value')}"
        
        print(f"✓ Response includes solar_value and magi_formula fields - PASS")


class TestCardologyDailyCard:
    """Test the daily card endpoint"""
    
    def test_daily_card_returns_valid_card(self):
        """Daily card should return a valid card with date"""
        response = requests.get(f"{BASE_URL}/api/cardology/daily-card")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        card = data.get("card", {})
        
        # Verify card has required fields
        assert "suit" in card, "suit field missing"
        assert "value" in card, "value field missing"
        assert "date" in card, "date field missing"
        
        # Verify suit is valid
        valid_suits = ["Hearts", "Clubs", "Diamonds", "Spades", "Joker"]
        assert card.get("suit") in valid_suits or card.get("value") == "Joker", f"Invalid suit: {card.get('suit')}"
        
        print(f"✓ Daily card returns valid card with date - PASS")


class TestCardologyCompatibility:
    """Test the compatibility endpoint"""
    
    def test_compatibility_returns_score_and_cards(self):
        """Compatibility should return score and card details for two dates"""
        response = requests.get(f"{BASE_URL}/api/cardology/compatibility?month1=1&day1=1&month2=7&day2=4")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify required fields
        assert "score" in data, "score field missing"
        assert "person1" in data, "person1 field missing"
        assert "person2" in data, "person2 field missing"
        assert "messages" in data, "messages field missing"
        
        # Verify score is a number between 0-100
        score = data.get("score")
        assert isinstance(score, int), f"Score should be int, got {type(score)}"
        assert 0 <= score <= 100, f"Score should be 0-100, got {score}"
        
        # Verify person1 is King of Spades (Jan 1)
        p1 = data.get("person1", {})
        assert p1.get("value") == "King", f"Person1 expected King, got {p1.get('value')}"
        assert p1.get("suit") == "Spades", f"Person1 expected Spades, got {p1.get('suit')}"
        
        # Verify person2 is Jack of Diamonds (Jul 4)
        p2 = data.get("person2", {})
        assert p2.get("value") == "Jack", f"Person2 expected Jack, got {p2.get('value')}"
        assert p2.get("suit") == "Diamonds", f"Person2 expected Diamonds, got {p2.get('suit')}"
        
        print(f"✓ Compatibility returns score={score} and card details - PASS")
    
    def test_compatibility_same_suit_bonus(self):
        """Same suit should give higher compatibility score"""
        # Two dates that should give same suit (both Spades)
        # Jan 1 = K♠ (SV=52), Jan 2 = Q♠ (SV=51)
        response = requests.get(f"{BASE_URL}/api/cardology/compatibility?month1=1&day1=1&month2=1&day2=2")
        assert response.status_code == 200
        data = response.json()
        
        # Both should be Spades
        p1 = data.get("person1", {})
        p2 = data.get("person2", {})
        assert p1.get("suit") == "Spades", f"Person1 expected Spades, got {p1.get('suit')}"
        assert p2.get("suit") == "Spades", f"Person2 expected Spades, got {p2.get('suit')}"
        
        # Score should be higher due to same suit bonus
        score = data.get("score")
        assert score >= 70, f"Same suit should give score >= 70, got {score}"
        
        print(f"✓ Same suit compatibility bonus verified (score={score}) - PASS")


class TestCardologyEdgeCases:
    """Test edge cases and validation"""
    
    def test_invalid_month(self):
        """Invalid month should return 400"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=13&day=1")
        assert response.status_code == 400, f"Expected 400 for invalid month, got {response.status_code}"
        print(f"✓ Invalid month returns 400 - PASS")
    
    def test_invalid_day(self):
        """Invalid day should return 400"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=1&day=32")
        assert response.status_code == 400, f"Expected 400 for invalid day, got {response.status_code}"
        print(f"✓ Invalid day returns 400 - PASS")
    
    def test_negative_solar_value_gives_joker(self):
        """Dates that produce negative SV should return Joker"""
        # Dec 28 -> SV = 55 - (2*12 + 28) = 55 - 52 = 3 (Hearts)
        # Dec 29 -> SV = 55 - (2*12 + 29) = 55 - 53 = 2 (Hearts)
        # Dec 30 -> SV = 55 - (2*12 + 30) = 55 - 54 = 1 (Hearts)
        # Dec 31 -> SV = 55 - (2*12 + 31) = 55 - 55 = 0 (Joker)
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=12&day=31")
        assert response.status_code == 200
        data = response.json()
        card = data.get("card", {})
        assert card.get("solar_value") == 0, f"Expected SV=0, got {card.get('solar_value')}"
        assert card.get("value") == "Joker", f"Expected Joker for SV=0, got {card.get('value')}"
        print(f"✓ SV=0 returns Joker - PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

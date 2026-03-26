"""
Tests for Animal Totems, Dreams, and Green Journal features
- Animal Totems: 12 birth totems + 8 spirit animals, birth totem calculator
- Dreams: CRUD operations, AI interpretation, moon phase tagging
- Green Journal: Nature connection diary with plants, animals, weather, season
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAnimalTotems:
    """Animal Totems endpoint tests - 12 birth totems + 8 spirit animals"""
    
    def test_get_all_totems(self):
        """GET /api/animal-totems/all - returns 12 birth totems + 8 spirit animals"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "birth_totems" in data, "Response should have birth_totems"
        assert "spirit_animals" in data, "Response should have spirit_animals"
        
        # Verify 12 birth totems
        assert len(data["birth_totems"]) == 12, f"Expected 12 birth totems, got {len(data['birth_totems'])}"
        
        # Verify 8 spirit animals
        assert len(data["spirit_animals"]) == 8, f"Expected 8 spirit animals, got {len(data['spirit_animals'])}"
        
        # Verify totem structure
        totem = data["birth_totems"][0]
        assert "id" in totem
        assert "name" in totem
        assert "dates" in totem
        assert "element" in totem
        assert "power" in totem
        assert "shadow" in totem
        assert "medicine" in totem
        print(f"✓ All totems returned: 12 birth totems, 8 spirit animals")
    
    def test_birth_totem_wolf_march(self):
        """GET /api/animal-totems/birth?month=3&day=15 - returns Wolf (Feb 19 - Mar 20)"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/birth?month=3&day=15")
        assert response.status_code == 200
        
        data = response.json()
        assert "totem" in data
        assert data["totem"]["id"] == "wolf", f"Expected wolf, got {data['totem']['id']}"
        assert data["totem"]["name"] == "Wolf"
        assert "Feb 19" in data["totem"]["dates"] or "Mar 20" in data["totem"]["dates"]
        
        # Verify complementary and challenging totems
        assert "complementary" in data
        assert "challenging" in data
        print(f"✓ March 15 birth totem: Wolf (correct)")
    
    def test_birth_totem_woodpecker_july(self):
        """GET /api/animal-totems/birth?month=7&day=4 - returns Woodpecker (Jun 21 - Jul 21)"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/birth?month=7&day=4")
        assert response.status_code == 200
        
        data = response.json()
        assert data["totem"]["id"] == "woodpecker", f"Expected woodpecker, got {data['totem']['id']}"
        assert data["totem"]["name"] == "Woodpecker"
        print(f"✓ July 4 birth totem: Woodpecker (correct)")
    
    def test_birth_totem_goose_december(self):
        """Test Dec 25 returns Snow Goose (Dec 22 - Jan 19)"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/birth?month=12&day=25")
        assert response.status_code == 200
        
        data = response.json()
        assert data["totem"]["id"] == "goose", f"Expected goose, got {data['totem']['id']}"
        print(f"✓ December 25 birth totem: Snow Goose (correct)")
    
    def test_birth_totem_otter_january(self):
        """Test Jan 25 returns Otter (Jan 20 - Feb 18)"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/birth?month=1&day=25")
        assert response.status_code == 200
        
        data = response.json()
        assert data["totem"]["id"] == "otter", f"Expected otter, got {data['totem']['id']}"
        print(f"✓ January 25 birth totem: Otter (correct)")
    
    def test_birth_totem_invalid_date(self):
        """Test invalid date returns 400"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/birth?month=13&day=1")
        assert response.status_code == 400
        print(f"✓ Invalid date returns 400 (correct)")
    
    def test_spirit_animal_eagle(self):
        """GET /api/animal-totems/spirit/eagle - returns eagle spirit animal details"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/spirit/eagle")
        assert response.status_code == 200
        
        data = response.json()
        assert "animal" in data
        assert data["animal"]["id"] == "eagle"
        assert data["animal"]["name"] == "Eagle"
        assert "power" in data["animal"]
        assert "medicine" in data["animal"]
        assert "when_appears" in data["animal"]
        assert "dream_meaning" in data["animal"]
        print(f"✓ Eagle spirit animal details returned correctly")
    
    def test_spirit_animal_not_found(self):
        """Test non-existent spirit animal returns 404"""
        response = requests.get(f"{BASE_URL}/api/animal-totems/spirit/unicorn")
        assert response.status_code == 404
        print(f"✓ Non-existent animal returns 404 (correct)")


class TestDreamSymbols:
    """Dream symbols endpoint tests - 41 dream symbols"""
    
    def test_get_dream_symbols(self):
        """GET /api/dream-symbols - returns 41 dream symbols"""
        response = requests.get(f"{BASE_URL}/api/dream-symbols")
        assert response.status_code == 200
        
        data = response.json()
        assert "symbols" in data
        
        symbols = data["symbols"]
        assert len(symbols) >= 41, f"Expected at least 41 symbols, got {len(symbols)}"
        
        # Verify some key symbols exist
        expected_symbols = ["water", "flying", "falling", "teeth", "death", "snake", "house", "forest", "fire", "moon"]
        for sym in expected_symbols:
            assert sym in symbols, f"Missing symbol: {sym}"
            assert "meaning" in symbols[sym]
            assert "category" in symbols[sym]
        
        print(f"✓ Dream symbols returned: {len(symbols)} symbols")


class TestMoonPhase:
    """Moon phase endpoint tests"""
    
    def test_get_moon_phase(self):
        """GET /api/moon-phase - returns current moon phase"""
        response = requests.get(f"{BASE_URL}/api/moon-phase")
        assert response.status_code == 200
        
        data = response.json()
        assert "phase" in data
        
        phase = data["phase"]
        assert "name" in phase
        assert "meaning" in phase
        assert "energy" in phase
        
        valid_phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
                       "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
        assert phase["name"] in valid_phases, f"Invalid phase: {phase['name']}"
        
        print(f"✓ Current moon phase: {phase['name']}")


class TestDreamsAuth:
    """Dreams CRUD tests - requires authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
        
        self.token = login_response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_save_dream(self):
        """POST /api/dreams - saves dream with moon phase"""
        dream_data = {
            "title": "TEST_Flying Dream",
            "content": "I was flying over mountains and saw a wolf below",
            "mood": "peaceful",
            "vividness": 8,
            "lucid": True,
            "symbols": ["flying", "wolf_dream", "mountain"],
            "interpretation": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/dreams", json=dream_data, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "dream" in data
        dream = data["dream"]
        
        assert dream["title"] == "TEST_Flying Dream"
        assert dream["content"] == dream_data["content"]
        assert dream["mood"] == "peaceful"
        assert dream["vividness"] == 8
        assert dream["lucid"] == True
        assert "moon_phase" in dream, "Dream should have moon_phase"
        assert "id" in dream
        assert "created_at" in dream
        
        self.dream_id = dream["id"]
        print(f"✓ Dream saved with moon phase: {dream['moon_phase']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/dreams/{dream['id']}", headers=self.headers)
    
    def test_get_dreams(self):
        """GET /api/dreams - returns user dreams"""
        response = requests.get(f"{BASE_URL}/api/dreams", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "dreams" in data
        assert isinstance(data["dreams"], list)
        print(f"✓ Dreams retrieved: {len(data['dreams'])} dreams")
    
    def test_delete_dream(self):
        """DELETE /api/dreams/{id} - deletes dream"""
        # First create a dream
        dream_data = {
            "title": "TEST_Dream to Delete",
            "content": "This dream will be deleted",
            "mood": "neutral"
        }
        create_response = requests.post(f"{BASE_URL}/api/dreams", json=dream_data, headers=self.headers)
        assert create_response.status_code == 200
        dream_id = create_response.json()["dream"]["id"]
        
        # Delete the dream
        delete_response = requests.delete(f"{BASE_URL}/api/dreams/{dream_id}", headers=self.headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/dreams", headers=self.headers)
        dreams = get_response.json()["dreams"]
        dream_ids = [d["id"] for d in dreams]
        assert dream_id not in dream_ids, "Dream should be deleted"
        
        print(f"✓ Dream deleted successfully")
    
    def test_interpret_dream(self):
        """POST /api/dreams/interpret - AI dream interpretation"""
        interpret_data = {
            "content": "I was swimming in a deep ocean with dolphins, then I saw a bright light"
        }
        
        response = requests.post(f"{BASE_URL}/api/dreams/interpret", json=interpret_data, headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "interpretation" in data
        assert len(data["interpretation"]) > 50, "Interpretation should be substantial"
        
        print(f"✓ Dream interpretation received ({len(data['interpretation'])} chars)")
    
    def test_interpret_dream_empty_content(self):
        """Test empty dream content returns 400"""
        response = requests.post(f"{BASE_URL}/api/dreams/interpret", json={"content": ""}, headers=self.headers)
        assert response.status_code == 400
        print(f"✓ Empty dream content returns 400 (correct)")


class TestGreenJournalAuth:
    """Green Journal CRUD tests - requires authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
        
        self.token = login_response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_save_green_entry(self):
        """POST /api/green-journal - saves nature entry with moon phase"""
        entry_data = {
            "entry_type": "observation",
            "title": "TEST_Morning Walk",
            "content": "Saw beautiful wildflowers and heard birds singing",
            "plants": ["wildflowers", "oak tree", "fern"],
            "animals_seen": ["robin", "squirrel", "butterfly"],
            "weather": "sunny",
            "season": "spring",
            "gratitude": "Grateful for the warm sunshine"
        }
        
        response = requests.post(f"{BASE_URL}/api/green-journal", json=entry_data, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entry" in data
        entry = data["entry"]
        
        assert entry["title"] == "TEST_Morning Walk"
        assert entry["content"] == entry_data["content"]
        assert entry["entry_type"] == "observation"
        assert entry["weather"] == "sunny"
        assert entry["season"] == "spring"
        assert entry["plants"] == ["wildflowers", "oak tree", "fern"]
        assert entry["animals_seen"] == ["robin", "squirrel", "butterfly"]
        assert "moon_phase" in entry, "Entry should have moon_phase"
        assert "id" in entry
        assert "created_at" in entry
        
        print(f"✓ Green journal entry saved with moon phase: {entry['moon_phase']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/green-journal/{entry['id']}", headers=self.headers)
    
    def test_get_green_entries(self):
        """GET /api/green-journal - returns user entries"""
        response = requests.get(f"{BASE_URL}/api/green-journal", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        assert isinstance(data["entries"], list)
        print(f"✓ Green journal entries retrieved: {len(data['entries'])} entries")
    
    def test_delete_green_entry(self):
        """DELETE /api/green-journal/{id} - deletes entry"""
        # First create an entry
        entry_data = {
            "entry_type": "gratitude",
            "title": "TEST_Entry to Delete",
            "content": "This entry will be deleted",
            "weather": "cloudy"
        }
        create_response = requests.post(f"{BASE_URL}/api/green-journal", json=entry_data, headers=self.headers)
        assert create_response.status_code == 200
        entry_id = create_response.json()["entry"]["id"]
        
        # Delete the entry
        delete_response = requests.delete(f"{BASE_URL}/api/green-journal/{entry_id}", headers=self.headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/green-journal", headers=self.headers)
        entries = get_response.json()["entries"]
        entry_ids = [e["id"] for e in entries]
        assert entry_id not in entry_ids, "Entry should be deleted"
        
        print(f"✓ Green journal entry deleted successfully")
    
    def test_green_entry_types(self):
        """Test different entry types"""
        entry_types = ["observation", "plant spirit", "animal encounter", "weather", "gratitude", "seasonal reflection"]
        
        for entry_type in entry_types[:2]:  # Test first 2 to save time
            entry_data = {
                "entry_type": entry_type,
                "title": f"TEST_{entry_type} entry",
                "content": f"Testing {entry_type} entry type"
            }
            response = requests.post(f"{BASE_URL}/api/green-journal", json=entry_data, headers=self.headers)
            assert response.status_code == 200
            assert response.json()["entry"]["entry_type"] == entry_type
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/green-journal/{response.json()['entry']['id']}", headers=self.headers)
        
        print(f"✓ Different entry types work correctly")


class TestDreamsUnauthenticated:
    """Test dreams endpoints without authentication"""
    
    def test_dreams_requires_auth(self):
        """Dreams endpoints should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dreams")
        assert response.status_code == 401
        
        response = requests.post(f"{BASE_URL}/api/dreams", json={"content": "test"})
        assert response.status_code == 401
        
        response = requests.delete(f"{BASE_URL}/api/dreams/some-id")
        assert response.status_code == 401
        
        response = requests.post(f"{BASE_URL}/api/dreams/interpret", json={"content": "test"})
        assert response.status_code == 401
        
        print(f"✓ Dreams endpoints require authentication")


class TestGreenJournalUnauthenticated:
    """Test green journal endpoints without authentication"""
    
    def test_green_journal_requires_auth(self):
        """Green journal endpoints should require authentication"""
        response = requests.get(f"{BASE_URL}/api/green-journal")
        assert response.status_code == 401
        
        response = requests.post(f"{BASE_URL}/api/green-journal", json={"content": "test"})
        assert response.status_code == 401
        
        response = requests.delete(f"{BASE_URL}/api/green-journal/some-id")
        assert response.status_code == 401
        
        print(f"✓ Green journal endpoints require authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Iteration 219 - OrbitalHubBase, BotanyOrbital, HexagramJournal Tests
Tests:
- POST /api/hexagram/journal/record - records hexagram transition
- GET /api/hexagram/journal - returns journal entries with limit param
- Botany catalog and garden endpoints for orbital data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHexagramJournal:
    """Hexagram Journal (Book of Changes) endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        # Use test credentials from iteration 218
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_hexagram_journal_record_success(self):
        """POST /api/hexagram/journal/record - records hexagram transition"""
        response = requests.post(
            f"{BASE_URL}/api/hexagram/journal/record",
            headers=self.headers,
            json={}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return either recorded:true with entry or recorded:false with reason
        assert "recorded" in data, "Response should have 'recorded' field"
        
        if data["recorded"]:
            # If recorded, should have entry data
            assert "entry" in data, "Recorded response should have 'entry'"
            entry = data["entry"]
            assert "hexagram_number" in entry
            assert "chinese" in entry
            assert "pinyin" in entry
            assert "name" in entry
            assert "bits" in entry
            assert "trigrams" in entry
            assert "stability" in entry
            assert "timestamp" in entry
            print(f"Recorded new hexagram: #{entry['hexagram_number']} {entry['chinese']} {entry['name']}")
        else:
            # If not recorded, should have reason
            assert "reason" in data, "Non-recorded response should have 'reason'"
            assert data["reason"] == "no_change", f"Expected reason 'no_change', got {data['reason']}"
            assert "hexagram_number" in data
            print(f"No change - current hexagram: #{data['hexagram_number']}")
    
    def test_hexagram_journal_record_no_change(self):
        """POST /api/hexagram/journal/record returns recorded:false when hexagram hasn't changed"""
        # First call to ensure we have a record
        requests.post(f"{BASE_URL}/api/hexagram/journal/record", headers=self.headers, json={})
        
        # Second call should return no_change (unless conditions changed)
        response = requests.post(
            f"{BASE_URL}/api/hexagram/journal/record",
            headers=self.headers,
            json={}
        )
        assert response.status_code == 200
        data = response.json()
        assert "recorded" in data
        # Either recorded:true (if conditions changed) or recorded:false with reason
        if not data["recorded"]:
            assert data.get("reason") == "no_change"
            print("Correctly returned no_change for duplicate hexagram")
        else:
            print("Hexagram changed between calls - recorded new entry")
    
    def test_hexagram_journal_get_entries(self):
        """GET /api/hexagram/journal returns list of journal entries sorted by timestamp desc"""
        response = requests.get(
            f"{BASE_URL}/api/hexagram/journal",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entries" in data, "Response should have 'entries' field"
        assert "total" in data, "Response should have 'total' field"
        assert isinstance(data["entries"], list)
        
        entries = data["entries"]
        print(f"Found {len(entries)} journal entries (total: {data['total']})")
        
        if len(entries) > 0:
            # Verify entry structure
            entry = entries[0]
            assert "hexagram_number" in entry
            assert "chinese" in entry
            assert "name" in entry
            assert "timestamp" in entry
            assert "stability" in entry
            assert "bits" in entry
            assert "trigrams" in entry
            print(f"Latest entry: #{entry['hexagram_number']} {entry['chinese']} {entry['name']} - {entry['stability']}")
            
            # Verify sorted by timestamp desc (latest first)
            if len(entries) > 1:
                for i in range(len(entries) - 1):
                    assert entries[i]["timestamp"] >= entries[i+1]["timestamp"], \
                        "Entries should be sorted by timestamp descending"
    
    def test_hexagram_journal_limit_param(self):
        """GET /api/hexagram/journal?limit=5 respects limit parameter"""
        response = requests.get(
            f"{BASE_URL}/api/hexagram/journal?limit=5",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        entries = data.get("entries", [])
        assert len(entries) <= 5, f"Expected max 5 entries, got {len(entries)}"
        print(f"Limit=5 returned {len(entries)} entries")


class TestBotanyOrbitalData:
    """Botany endpoints for orbital data"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_botany_catalog_for_orbital(self):
        """GET /api/botany/catalog returns plants for orbital element nodes"""
        response = requests.get(
            f"{BASE_URL}/api/botany/catalog",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plants" in data
        plants = data["plants"]
        print(f"Catalog has {len(plants)} plants")
        
        if len(plants) > 0:
            # Verify plant structure for orbital nodes
            plant = plants[0]
            assert "id" in plant or "plant_id" in plant
            assert "name" in plant
            assert "element" in plant
            print(f"Sample plant: {plant['name']} ({plant['element']})")
            
            # Check element distribution for orbital nodes
            elements = {}
            for p in plants:
                elem = p.get("element", "Unknown")
                elements[elem] = elements.get(elem, 0) + 1
            print(f"Element distribution: {elements}")
    
    def test_botany_garden_for_orbital(self):
        """GET /api/botany/garden returns garden data for orbital garden node"""
        response = requests.get(
            f"{BASE_URL}/api/botany/garden",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "garden" in data
        garden = data["garden"]
        print(f"Garden has {len(garden)} plants")
        
        # Check for summary data (used by balance node)
        if "summary" in data:
            summary = data["summary"]
            print(f"Garden summary: balance_score={summary.get('balance_score')}, tier={summary.get('balance_tier')}")


class TestCosmicStateForOrbital:
    """Cosmic state endpoint for orbital hexagram integration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_cosmic_state_hexagram_for_gate_logic(self):
        """GET /api/cosmic-state returns hexagram with bits for gate logic"""
        response = requests.get(
            f"{BASE_URL}/api/cosmic-state",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "hexagram" in data, "cosmic-state should include hexagram"
        
        hexagram = data["hexagram"]
        assert "number" in hexagram or "hexagram_number" in hexagram
        assert "bits" in hexagram, "hexagram should have bits array for gate logic"
        
        bits = hexagram["bits"]
        assert isinstance(bits, list), "bits should be a list"
        assert len(bits) == 6, f"bits should have 6 elements, got {len(bits)}"
        
        print(f"Hexagram bits for gate logic: {bits}")
        print(f"Bit 2 (Alchemy gate): {bits[2] if len(bits) > 2 else 'N/A'}")
    
    def test_cosmic_state_stability_for_orbital_speed(self):
        """GET /api/cosmic-state returns stability for orbital animation speed"""
        response = requests.get(
            f"{BASE_URL}/api/cosmic-state",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "stability" in data, "cosmic-state should include stability"
        
        stability = data["stability"]
        assert stability in ["stable", "shifting", "volatile"], \
            f"stability should be stable/shifting/volatile, got {stability}"
        print(f"Stability for orbital speed: {stability}")


class TestMissionControlLinks:
    """Mission Control action items for new pages"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_hexagram_current_endpoint(self):
        """GET /api/hexagram/current - verify hexagram endpoint works"""
        response = requests.get(
            f"{BASE_URL}/api/hexagram/current",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Hexagram data is nested under 'hexagram' key
        assert "hexagram" in data, "Response should have 'hexagram' key"
        hexagram = data["hexagram"]
        assert "number" in hexagram, "hexagram should have 'number'"
        print(f"Current hexagram: #{hexagram['number']} {hexagram.get('chinese', '')} {hexagram.get('name', '')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

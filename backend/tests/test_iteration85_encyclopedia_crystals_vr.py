"""
Iteration 85: Encyclopedia & Crystals VR Mode + HD Narration Tests
Tests:
- Encyclopedia traditions list (12 traditions)
- Encyclopedia tradition detail
- Encyclopedia tradition narration (TTS)
- Encyclopedia text narration
- Crystals list (12 crystals with categories)
- Crystal detail
- Crystal narration (TTS)
- Category filtering
- Search functionality
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEncyclopediaTraditions:
    """Encyclopedia traditions API tests"""
    
    def test_get_traditions_list(self):
        """GET /api/encyclopedia/traditions returns 12 traditions"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "traditions" in data
        traditions = data["traditions"]
        assert len(traditions) == 12, f"Expected 12 traditions, got {len(traditions)}"
        
        # Verify tradition structure
        for t in traditions:
            assert "id" in t
            assert "name" in t
            assert "color" in t
            assert "era" in t
            assert "origin" in t
            assert "overview" in t
            assert "concept_count" in t
            assert "text_count" in t
        
        # Verify expected traditions exist
        tradition_ids = [t["id"] for t in traditions]
        expected_ids = ["hinduism", "buddhism", "taoism", "sufism", "kabbalah", 
                       "indigenous", "mystical_christianity", "egyptian", 
                       "greek_philosophy", "zen", "yoga_tantra", "african"]
        for eid in expected_ids:
            assert eid in tradition_ids, f"Missing tradition: {eid}"
        
        print(f"✓ GET /api/encyclopedia/traditions: 12 traditions returned")
    
    def test_get_tradition_detail_hinduism(self):
        """GET /api/encyclopedia/traditions/hinduism returns full detail"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/hinduism")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "hinduism"
        assert data["name"] == "Hinduism & Vedic Wisdom"
        assert "key_concepts" in data
        assert len(data["key_concepts"]) >= 6
        assert "sacred_texts" in data
        assert "notable_figures" in data
        assert "practices" in data
        
        # Verify key concept structure
        for concept in data["key_concepts"]:
            assert "name" in concept
            assert "desc" in concept
        
        print(f"✓ GET /api/encyclopedia/traditions/hinduism: Full detail returned")
    
    def test_get_tradition_detail_buddhism(self):
        """GET /api/encyclopedia/traditions/buddhism returns full detail"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/buddhism")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "buddhism"
        assert "Four Noble Truths" in [c["name"] for c in data["key_concepts"]]
        
        print(f"✓ GET /api/encyclopedia/traditions/buddhism: Full detail returned")
    
    def test_get_tradition_not_found(self):
        """GET /api/encyclopedia/traditions/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/invalid-tradition")
        assert response.status_code == 404
        
        print(f"✓ GET /api/encyclopedia/traditions/invalid: 404 returned")


class TestEncyclopediaNarration:
    """Encyclopedia TTS narration tests"""
    
    def test_narrate_tradition_hinduism(self):
        """POST /api/encyclopedia/traditions/hinduism/narrate generates TTS"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/traditions/hinduism/narrate",
            timeout=90
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100, "Audio base64 should be substantial"
        
        print(f"✓ POST /api/encyclopedia/traditions/hinduism/narrate: TTS audio generated ({len(data['audio'])} chars)")
    
    def test_narrate_tradition_buddhism(self):
        """POST /api/encyclopedia/traditions/buddhism/narrate generates TTS"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/traditions/buddhism/narrate",
            timeout=90
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100
        
        print(f"✓ POST /api/encyclopedia/traditions/buddhism/narrate: TTS audio generated")
    
    def test_narrate_tradition_not_found(self):
        """POST /api/encyclopedia/traditions/invalid/narrate returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/traditions/invalid-tradition/narrate",
            timeout=30
        )
        assert response.status_code == 404
        
        print(f"✓ POST /api/encyclopedia/traditions/invalid/narrate: 404 returned")
    
    def test_narrate_text(self):
        """POST /api/encyclopedia/narrate-text generates TTS for custom text"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/narrate-text",
            json={"text": "This is a test of the encyclopedia text narration feature.", "voice": "fable"},
            timeout=90
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100
        
        print(f"✓ POST /api/encyclopedia/narrate-text: TTS audio generated")
    
    def test_narrate_text_too_short(self):
        """POST /api/encyclopedia/narrate-text with short text returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/narrate-text",
            json={"text": "Hi", "voice": "fable"},
            timeout=30
        )
        assert response.status_code == 400
        
        print(f"✓ POST /api/encyclopedia/narrate-text (short): 400 returned")


class TestCrystals:
    """Crystals API tests"""
    
    def test_get_crystals_list(self):
        """GET /api/crystals returns 12 crystals with categories"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        
        data = response.json()
        assert "crystals" in data
        assert "categories" in data
        assert "chakras" in data
        assert "total" in data
        
        crystals = data["crystals"]
        assert len(crystals) == 12, f"Expected 12 crystals, got {len(crystals)}"
        
        # Verify crystal structure
        for c in crystals:
            assert "id" in c
            assert "name" in c
            assert "aka" in c
            assert "color" in c
            assert "category" in c
            assert "chakra" in c
            assert "element" in c
            assert "description" in c
            assert "spiritual" in c
            assert "healing" in c
            assert "uses" in c
        
        # Verify expected crystals
        crystal_ids = [c["id"] for c in crystals]
        expected_ids = ["clear-quartz", "amethyst", "rose-quartz", "obsidian", 
                       "citrine", "lapis-lazuli", "tigers-eye", "moonstone",
                       "turquoise", "selenite", "labradorite", "malachite"]
        for eid in expected_ids:
            assert eid in crystal_ids, f"Missing crystal: {eid}"
        
        # Verify categories
        categories = data["categories"]
        assert "all" in categories
        assert "quartz" in categories
        assert "volcanic" in categories
        
        print(f"✓ GET /api/crystals: 12 crystals returned with {len(categories)} categories")
    
    def test_get_crystal_detail_amethyst(self):
        """GET /api/crystals/amethyst returns full detail"""
        response = requests.get(f"{BASE_URL}/api/crystals/amethyst")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "amethyst"
        assert data["name"] == "Amethyst"
        assert data["aka"] == "Stone of Spirituality"
        assert data["category"] == "quartz"
        assert "Third Eye" in data["chakra"]
        assert "Protection" in data["uses"]
        
        print(f"✓ GET /api/crystals/amethyst: Full detail returned")
    
    def test_get_crystal_detail_clear_quartz(self):
        """GET /api/crystals/clear-quartz returns full detail"""
        response = requests.get(f"{BASE_URL}/api/crystals/clear-quartz")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "clear-quartz"
        assert data["name"] == "Clear Quartz"
        assert data["aka"] == "Master Healer"
        
        print(f"✓ GET /api/crystals/clear-quartz: Full detail returned")
    
    def test_get_crystal_not_found(self):
        """GET /api/crystals/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/crystals/invalid-crystal")
        assert response.status_code == 404
        
        print(f"✓ GET /api/crystals/invalid: 404 returned")
    
    def test_filter_crystals_by_category_quartz(self):
        """GET /api/crystals?category=quartz filters correctly"""
        response = requests.get(f"{BASE_URL}/api/crystals?category=quartz")
        assert response.status_code == 200
        
        data = response.json()
        crystals = data["crystals"]
        assert len(crystals) > 0
        
        for c in crystals:
            assert c["category"] == "quartz", f"Crystal {c['id']} has category {c['category']}, expected quartz"
        
        print(f"✓ GET /api/crystals?category=quartz: {len(crystals)} quartz crystals returned")
    
    def test_filter_crystals_by_category_volcanic(self):
        """GET /api/crystals?category=volcanic filters correctly"""
        response = requests.get(f"{BASE_URL}/api/crystals?category=volcanic")
        assert response.status_code == 200
        
        data = response.json()
        crystals = data["crystals"]
        assert len(crystals) > 0
        
        for c in crystals:
            assert c["category"] == "volcanic"
        
        print(f"✓ GET /api/crystals?category=volcanic: {len(crystals)} volcanic crystals returned")
    
    def test_search_crystals(self):
        """GET /api/crystals?search=love finds rose quartz"""
        response = requests.get(f"{BASE_URL}/api/crystals?search=love")
        assert response.status_code == 200
        
        data = response.json()
        crystals = data["crystals"]
        assert len(crystals) > 0
        
        crystal_ids = [c["id"] for c in crystals]
        assert "rose-quartz" in crystal_ids, "Rose quartz should appear in 'love' search"
        
        print(f"✓ GET /api/crystals?search=love: {len(crystals)} crystals found")


class TestCrystalNarration:
    """Crystal TTS narration tests"""
    
    def test_narrate_crystal_clear_quartz(self):
        """POST /api/crystals/clear-quartz/narrate generates TTS"""
        response = requests.post(
            f"{BASE_URL}/api/crystals/clear-quartz/narrate",
            timeout=90
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100
        
        print(f"✓ POST /api/crystals/clear-quartz/narrate: TTS audio generated ({len(data['audio'])} chars)")
    
    def test_narrate_crystal_amethyst(self):
        """POST /api/crystals/amethyst/narrate generates TTS"""
        response = requests.post(
            f"{BASE_URL}/api/crystals/amethyst/narrate",
            timeout=90
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "audio" in data
        assert len(data["audio"]) > 100
        
        print(f"✓ POST /api/crystals/amethyst/narrate: TTS audio generated")
    
    def test_narrate_crystal_not_found(self):
        """POST /api/crystals/invalid/narrate returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/crystals/invalid-crystal/narrate",
            timeout=30
        )
        assert response.status_code == 404
        
        print(f"✓ POST /api/crystals/invalid/narrate: 404 returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

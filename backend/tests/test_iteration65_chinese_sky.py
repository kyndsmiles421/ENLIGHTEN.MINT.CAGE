"""
Iteration 65: Chinese Sky Culture Addition Tests
Tests the addition of Chinese astronomy/culture to the Star Chart feature.
- GET /api/star-chart/cultures returns 5 cultures (was 4), including 'chinese: Chinese Sky'
- GET /api/star-chart/cultures/chinese returns 5 constellations
- Each Chinese constellation has correct Five Elements: Wood, Metal, Fire, Water, Earth
- Each Chinese constellation has mythology with figure, origin, deity, story, lesson
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChineseSkyBackend:
    """Tests for Chinese Sky culture addition to Star Chart"""
    
    def test_cultures_endpoint_returns_five_cultures(self):
        """GET /api/star-chart/cultures should return 5 cultures including Chinese"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cultures" in data, "Response should have 'cultures' key"
        
        cultures = data["cultures"]
        assert len(cultures) == 5, f"Expected 5 cultures, got {len(cultures)}"
        
        # Check culture IDs
        culture_ids = [c["id"] for c in cultures]
        expected_ids = ["mayan", "egyptian", "australian", "lakota", "chinese"]
        for expected_id in expected_ids:
            assert expected_id in culture_ids, f"Missing culture: {expected_id}"
        
        print(f"✓ GET /api/star-chart/cultures returns 5 cultures: {culture_ids}")
    
    def test_chinese_culture_metadata(self):
        """Chinese culture should have correct metadata"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200
        
        data = response.json()
        chinese = next((c for c in data["cultures"] if c["id"] == "chinese"), None)
        
        assert chinese is not None, "Chinese culture not found"
        assert chinese["name"] == "Chinese Sky", f"Expected 'Chinese Sky', got {chinese['name']}"
        assert chinese["color"] == "#EF4444", f"Expected '#EF4444' (red), got {chinese['color']}"
        assert chinese["constellation_count"] == 5, f"Expected 5 constellations, got {chinese['constellation_count']}"
        
        print(f"✓ Chinese culture metadata: name={chinese['name']}, color={chinese['color']}, count={chinese['constellation_count']}")
    
    def test_chinese_constellations_endpoint(self):
        """GET /api/star-chart/cultures/chinese should return 5 constellations"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "chinese"
        assert data["name"] == "Chinese Sky"
        assert data["color"] == "#EF4444"
        
        constellations = data["constellations"]
        assert len(constellations) == 5, f"Expected 5 constellations, got {len(constellations)}"
        
        # Check constellation IDs
        constellation_ids = [c["id"] for c in constellations]
        expected_ids = ["qing_long", "bai_hu", "zhu_que", "xuan_wu", "zi_wei"]
        for expected_id in expected_ids:
            assert expected_id in constellation_ids, f"Missing constellation: {expected_id}"
        
        print(f"✓ GET /api/star-chart/cultures/chinese returns 5 constellations: {constellation_ids}")
    
    def test_chinese_constellation_names(self):
        """Each Chinese constellation should have correct name"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        
        data = response.json()
        constellations = {c["id"]: c for c in data["constellations"]}
        
        expected_names = {
            "qing_long": "Qing Long (Azure Dragon)",
            "bai_hu": "Bai Hu (White Tiger)",
            "zhu_que": "Zhu Que (Vermilion Bird)",
            "xuan_wu": "Xuan Wu (Black Tortoise)",
            "zi_wei": "Zi Wei Yuan (Purple Forbidden Enclosure)"
        }
        
        for cid, expected_name in expected_names.items():
            assert constellations[cid]["name"] == expected_name, \
                f"Expected '{expected_name}', got '{constellations[cid]['name']}'"
        
        print(f"✓ All 5 Chinese constellation names correct")
    
    def test_chinese_five_elements(self):
        """Each Chinese constellation should use Five Elements (Wood, Metal, Fire, Water, Earth)"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        
        data = response.json()
        constellations = {c["id"]: c for c in data["constellations"]}
        
        expected_elements = {
            "qing_long": "Wood",   # Azure Dragon - East - Spring
            "bai_hu": "Metal",     # White Tiger - West - Autumn
            "zhu_que": "Fire",     # Vermilion Bird - South - Summer
            "xuan_wu": "Water",    # Black Tortoise - North - Winter
            "zi_wei": "Earth"      # Purple Forbidden Enclosure - Center
        }
        
        for cid, expected_element in expected_elements.items():
            actual_element = constellations[cid]["element"]
            assert actual_element == expected_element, \
                f"Constellation {cid}: expected element '{expected_element}', got '{actual_element}'"
        
        # Verify all Five Elements are used
        elements_used = set(c["element"] for c in data["constellations"])
        expected_five_elements = {"Wood", "Metal", "Fire", "Water", "Earth"}
        assert elements_used == expected_five_elements, \
            f"Expected Five Elements {expected_five_elements}, got {elements_used}"
        
        print(f"✓ All Chinese constellations use correct Five Elements: {elements_used}")
    
    def test_chinese_mythology_structure(self):
        """Each Chinese constellation should have mythology with figure, origin, deity, story, lesson"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        
        data = response.json()
        required_mythology_fields = ["figure", "origin", "deity", "story", "lesson"]
        
        for constellation in data["constellations"]:
            cid = constellation["id"]
            assert "mythology" in constellation, f"Constellation {cid} missing mythology"
            
            mythology = constellation["mythology"]
            for field in required_mythology_fields:
                assert field in mythology, f"Constellation {cid} mythology missing '{field}'"
                assert mythology[field], f"Constellation {cid} mythology '{field}' is empty"
            
            # Verify origin is Chinese
            assert mythology["origin"] == "Chinese", \
                f"Constellation {cid} origin should be 'Chinese', got '{mythology['origin']}'"
        
        print(f"✓ All Chinese constellations have complete mythology (figure, origin, deity, story, lesson)")
    
    def test_chinese_constellation_stars(self):
        """Each Chinese constellation should have stars with ra, dec, mag"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        
        data = response.json()
        
        for constellation in data["constellations"]:
            cid = constellation["id"]
            assert "stars" in constellation, f"Constellation {cid} missing stars"
            assert len(constellation["stars"]) >= 2, f"Constellation {cid} should have at least 2 stars"
            
            for star in constellation["stars"]:
                assert "name" in star, f"Star in {cid} missing name"
                assert "ra" in star, f"Star in {cid} missing ra"
                assert "dec" in star, f"Star in {cid} missing dec"
                assert "mag" in star, f"Star in {cid} missing mag"
        
        print(f"✓ All Chinese constellations have valid star data")
    
    def test_chinese_constellation_paths(self):
        """Each Chinese constellation should have drawing paths"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        
        data = response.json()
        
        for constellation in data["constellations"]:
            cid = constellation["id"]
            assert "paths" in constellation, f"Constellation {cid} missing paths"
            assert len(constellation["paths"]) >= 1, f"Constellation {cid} should have at least 1 path"
        
        print(f"✓ All Chinese constellations have drawing paths")
    
    def test_invalid_culture_returns_404(self):
        """GET /api/star-chart/cultures/invalid should return 404"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/invalid_culture")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"✓ Invalid culture returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

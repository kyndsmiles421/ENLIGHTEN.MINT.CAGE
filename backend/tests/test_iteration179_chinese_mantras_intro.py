"""
Iteration 179 Tests: Chinese Language, Expanded Mantras (73+), Cinematic Intro Updates
- GET /api/mantras/all - returns 73+ mantras with categories including 'chinese', 'gates', 'explore'
- GET /api/mantras?category=chinese&count=5 - returns Chinese mantras with lang:zh field
- GET /api/mantras?category=gates&count=3 - returns gate-specific mantras
- GET /api/mantras?category=explore&count=3 - returns explore/hotspot mantras
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMantrasExpanded:
    """Test expanded mantra library (73+ mantras, new categories)"""
    
    def test_get_all_mantras_returns_73_plus(self):
        """GET /api/mantras/all should return 73+ mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "mantras" in data, "Response should have 'mantras' key"
        assert "categories" in data, "Response should have 'categories' key"
        assert "total" in data, "Response should have 'total' key"
        
        # Verify 73+ mantras
        total = data["total"]
        assert total >= 73, f"Expected 73+ mantras, got {total}"
        assert len(data["mantras"]) >= 73, f"Expected 73+ mantras in list, got {len(data['mantras'])}"
        print(f"✓ Total mantras: {total}")
    
    def test_categories_include_chinese_gates_explore(self):
        """GET /api/mantras/all should include chinese, gates, explore categories"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        
        data = response.json()
        categories = data["categories"]
        
        # Check for new categories
        assert "chinese" in categories, f"'chinese' category missing. Categories: {categories}"
        assert "gates" in categories, f"'gates' category missing. Categories: {categories}"
        assert "explore" in categories, f"'explore' category missing. Categories: {categories}"
        print(f"✓ Categories include chinese, gates, explore: {categories}")
    
    def test_chinese_mantras_have_lang_zh(self):
        """GET /api/mantras?category=chinese should return mantras with lang:zh"""
        response = requests.get(f"{BASE_URL}/api/mantras", params={"category": "chinese", "count": 5})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "mantras" in data, "Response should have 'mantras' key"
        mantras = data["mantras"]
        
        assert len(mantras) > 0, "Should return at least 1 Chinese mantra"
        
        # Verify all returned mantras have lang:zh
        for m in mantras:
            assert m.get("category") == "chinese", f"Mantra category should be 'chinese': {m}"
            assert m.get("lang") == "zh", f"Chinese mantra should have lang='zh': {m}"
        
        print(f"✓ Chinese mantras ({len(mantras)}) all have lang:zh")
    
    def test_chinese_mantras_count_at_least_15(self):
        """Chinese category should have at least 15 mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        
        data = response.json()
        chinese_mantras = [m for m in data["mantras"] if m.get("category") == "chinese"]
        
        assert len(chinese_mantras) >= 15, f"Expected 15+ Chinese mantras, got {len(chinese_mantras)}"
        print(f"✓ Chinese mantras count: {len(chinese_mantras)}")
    
    def test_gates_mantras_returned(self):
        """GET /api/mantras?category=gates should return gate-specific mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras", params={"category": "gates", "count": 3})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        mantras = data["mantras"]
        
        assert len(mantras) > 0, "Should return at least 1 gates mantra"
        
        for m in mantras:
            assert m.get("category") == "gates", f"Mantra category should be 'gates': {m}"
        
        print(f"✓ Gates mantras returned: {len(mantras)}")
    
    def test_gates_mantras_count_at_least_4(self):
        """Gates category should have at least 4 mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        
        data = response.json()
        gates_mantras = [m for m in data["mantras"] if m.get("category") == "gates"]
        
        assert len(gates_mantras) >= 4, f"Expected 4+ gates mantras, got {len(gates_mantras)}"
        print(f"✓ Gates mantras count: {len(gates_mantras)}")
    
    def test_explore_mantras_returned(self):
        """GET /api/mantras?category=explore should return explore/hotspot mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras", params={"category": "explore", "count": 3})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        mantras = data["mantras"]
        
        assert len(mantras) > 0, "Should return at least 1 explore mantra"
        
        for m in mantras:
            assert m.get("category") == "explore", f"Mantra category should be 'explore': {m}"
        
        print(f"✓ Explore mantras returned: {len(mantras)}")
    
    def test_explore_mantras_count_at_least_4(self):
        """Explore category should have at least 4 mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        
        data = response.json()
        explore_mantras = [m for m in data["mantras"] if m.get("category") == "explore"]
        
        assert len(explore_mantras) >= 4, f"Expected 4+ explore mantras, got {len(explore_mantras)}"
        print(f"✓ Explore mantras count: {len(explore_mantras)}")
    
    def test_mantra_structure_valid(self):
        """All mantras should have text, category, energy fields"""
        response = requests.get(f"{BASE_URL}/api/mantras/all")
        assert response.status_code == 200
        
        data = response.json()
        for m in data["mantras"]:
            assert "text" in m, f"Mantra missing 'text': {m}"
            assert "category" in m, f"Mantra missing 'category': {m}"
            assert "energy" in m, f"Mantra missing 'energy': {m}"
        
        print(f"✓ All {len(data['mantras'])} mantras have valid structure")
    
    def test_default_mantras_endpoint(self):
        """GET /api/mantras (no params) should return 3 random mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        assert "mantras" in data
        assert len(data["mantras"]) == 3, f"Default should return 3 mantras, got {len(data['mantras'])}"
        print(f"✓ Default mantras endpoint returns 3 mantras")


class TestExistingRoutes:
    """Verify existing routes still work"""
    
    def test_health_endpoint(self):
        """Health check should work"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health endpoint working")
    
    def test_hotspots_static_sites(self):
        """Hotspots static sites should still work"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200
        data = response.json()
        assert "sites" in data
        print(f"✓ Hotspots static sites: {len(data['sites'])} sites")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

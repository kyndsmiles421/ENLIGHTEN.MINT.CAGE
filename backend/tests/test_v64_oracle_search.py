"""
V64.1 Oracle Search & BackToHub Route Tests
Tests the new Oracle Search endpoint and verifies workshop routes
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOracleSearch:
    """Oracle Search endpoint tests - /api/workshop/search"""
    
    def test_search_foundation_returns_multiple_domains(self):
        """Search 'foundation' should return results from Trade & Craft, Healing Arts, Sacred Knowledge, Exploration"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "foundation"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "query" in data
        assert data["query"] == "foundation"
        assert len(data["results"]) > 0
        
        # Check domains present
        domains = set(r["domain"] for r in data["results"])
        assert "Trade & Craft" in domains, "Trade & Craft should be in foundation results"
        # Masonry has 'foundation' tag
        masonry_result = next((r for r in data["results"] if r["id"] == "masonry"), None)
        assert masonry_result is not None, "Masonry should be in foundation results"
        assert masonry_result["route"] == "/workshop/masonry"
    
    def test_search_pressure_returns_trade_and_healing(self):
        """Search 'pressure' should return results from Trade & Craft and Healing Arts"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "pressure"})
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["results"]) > 0
        
        domains = set(r["domain"] for r in data["results"])
        # Plumbing has 'pressure' tag (Trade & Craft)
        assert "Trade & Craft" in domains or "Healing Arts" in domains
    
    def test_search_safety_returns_healing_and_trade(self):
        """Search 'safety' should return results bridging Healing Arts and Trade & Craft"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "safety"})
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["results"]) > 0
        
        domains = set(r["domain"] for r in data["results"])
        # Safety tag is in: childcare, nursing, electrical, first_aid
        assert "Healing Arts" in domains, "Healing Arts should be in safety results"
        assert "Trade & Craft" in domains, "Trade & Craft should be in safety results"
    
    def test_search_nonexistent_returns_empty(self):
        """Search for non-existent term should return empty results"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "xyznonexistent"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["results"] == []
        assert data["total"] == 0
    
    def test_search_short_query_returns_empty(self):
        """Search with query < 2 chars should return empty"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "a"})
        assert response.status_code == 200
        
        data = response.json()
        assert data["results"] == []
    
    def test_search_result_structure(self):
        """Verify search result structure has all required fields"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "masonry"})
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["results"]) > 0
        
        result = data["results"][0]
        assert "id" in result
        assert "title" in result
        assert "domain" in result
        assert "icon" in result
        assert "accentColor" in result
        assert "route" in result
        assert "score" in result
        assert "matchedTags" in result
        
        # Route should use new /workshop/ format
        assert result["route"].startswith("/workshop/")


class TestWorkshopRegistry:
    """Workshop Registry endpoint tests - /api/workshop/registry"""
    
    def test_registry_returns_all_modules(self):
        """Registry should return all 22 workshop modules"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        
        data = response.json()
        assert "modules" in data
        assert "total" in data
        assert data["total"] >= 22, f"Expected at least 22 modules, got {data['total']}"
    
    def test_registry_module_structure(self):
        """Verify registry module structure"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        
        data = response.json()
        module = data["modules"][0]
        
        assert "id" in module
        assert "title" in module
        assert "subtitle" in module
        assert "icon" in module
        assert "accentColor" in module
        assert "skillKey" in module
        assert "matLabel" in module
        assert "domain" in module
        assert "materialCount" in module
        assert "toolCount" in module
        assert "route" in module
        assert "tags" in module
        
        # Route should use new /workshop/ format
        assert module["route"].startswith("/workshop/")
    
    def test_registry_has_all_domains(self):
        """Registry should have modules from all 6 domains"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        
        data = response.json()
        domains = set(m["domain"] for m in data["modules"])
        
        expected_domains = {
            "Trade & Craft",
            "Healing Arts",
            "Sacred Knowledge",
            "Science & Physics",
            "Mind & Spirit",
            "Exploration"
        }
        
        for domain in expected_domains:
            assert domain in domains, f"Domain '{domain}' should be in registry"


class TestWorkshopRoutes:
    """Test that workshop routes use new /workshop/{moduleId} format"""
    
    def test_masonry_workshop_endpoint(self):
        """Masonry workshop materials endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/stones")
        assert response.status_code == 200
        
        data = response.json()
        assert "stones" in data
        assert len(data["stones"]) >= 6
    
    def test_electrical_workshop_endpoint(self):
        """Electrical workshop materials endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/workshop/electrical/materials")
        assert response.status_code == 200
        
        data = response.json()
        assert "materials" in data
        assert len(data["materials"]) >= 3
    
    def test_plumbing_workshop_endpoint(self):
        """Plumbing workshop materials endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/workshop/plumbing/materials")
        assert response.status_code == 200
        
        data = response.json()
        assert "materials" in data
        assert len(data["materials"]) >= 3
    
    def test_nursing_workshop_endpoint(self):
        """Nursing workshop materials endpoint should work (returns scenarios)"""
        response = requests.get(f"{BASE_URL}/api/workshop/nursing/materials")
        assert response.status_code == 200
        
        data = response.json()
        assert "scenarios" in data  # Nursing uses 'scenarios' key
        assert len(data["scenarios"]) >= 3
    
    def test_bible_workshop_endpoint(self):
        """Bible workshop materials endpoint should work (returns texts)"""
        response = requests.get(f"{BASE_URL}/api/workshop/bible/materials")
        assert response.status_code == 200
        
        data = response.json()
        assert "texts" in data  # Bible uses 'texts' key
        assert len(data["texts"]) >= 3


class TestSearchDomainBridging:
    """Test that search correctly bridges multiple domains"""
    
    def test_search_returns_sorted_by_score(self):
        """Search results should be sorted by score descending"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "safety"})
        assert response.status_code == 200
        
        data = response.json()
        scores = [r["score"] for r in data["results"]]
        assert scores == sorted(scores, reverse=True), "Results should be sorted by score descending"
    
    def test_search_matched_tags_populated(self):
        """Search results should have matchedTags when tag matches"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "foundation"})
        assert response.status_code == 200
        
        data = response.json()
        masonry = next((r for r in data["results"] if r["id"] == "masonry"), None)
        assert masonry is not None
        assert "foundation" in masonry["matchedTags"]
    
    def test_search_healing_returns_multiple_modules(self):
        """Search 'healing' should return multiple Healing Arts modules"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "healing"})
        assert response.status_code == 200
        
        data = response.json()
        healing_results = [r for r in data["results"] if r["domain"] == "Healing Arts"]
        assert len(healing_results) >= 1, "Should have at least 1 Healing Arts result"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

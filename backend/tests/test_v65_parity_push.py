"""
V65.0 Parity Push & XP Wiring Tests
Tests:
1. Workshop registry returns 22 modules with correct material counts
2. Expanded modules (Machining, Anatomy, Pedagogy, Welding, Nutrition) have 6 materials each
3. New materials have full 6-depth dive_layers
4. XP wiring for 5 new skill sources
5. Passport returns 13 hybrid titles (7 original + 6 new)
6. Oracle Search finds new materials
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWorkshopRegistry:
    """Test workshop registry returns correct module counts"""
    
    def test_registry_returns_22_modules(self):
        """Registry should return 22 modules"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200, f"Registry failed: {response.text}"
        data = response.json()
        modules = data.get("modules", [])
        assert len(modules) == 22, f"Expected 22 modules, got {len(modules)}"
        print(f"PASS: Registry returns {len(modules)} modules")
    
    def test_registry_module_material_counts(self):
        """Check material counts: 18 modules at 6, 4 at 3"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        # Modules that should have 3 materials (not expanded)
        three_material_modules = ["automotive", "meditation", "speaking", "philosophy"]
        
        six_count = 0
        three_count = 0
        
        for mod in modules:
            mod_id = mod.get("id", "")
            mat_count = mod.get("materialCount", 0)
            
            if mod_id in three_material_modules:
                assert mat_count == 3, f"{mod_id} should have 3 materials, got {mat_count}"
                three_count += 1
            else:
                assert mat_count == 6, f"{mod_id} should have 6 materials, got {mat_count}"
                six_count += 1
        
        assert six_count == 18, f"Expected 18 modules with 6 materials, got {six_count}"
        assert three_count == 4, f"Expected 4 modules with 3 materials, got {three_count}"
        print(f"PASS: 18 modules at 6 materials, 4 modules at 3 materials")


class TestExpandedModules:
    """Test the 5 expanded modules have correct materials"""
    
    def test_machining_has_6_materials(self):
        """Machining should have 6 materials including Surface Grinding, EDM, Threading"""
        response = requests.get(f"{BASE_URL}/api/workshop/machining/materials")
        assert response.status_code == 200, f"Machining materials failed: {response.text}"
        data = response.json()
        materials = data.get("operations", data.get("materials", []))
        assert len(materials) == 6, f"Machining should have 6 materials, got {len(materials)}"
        
        # Check for new materials
        material_ids = [m.get("id") for m in materials]
        assert "surface_grinding" in material_ids, "Missing Surface Grinding"
        assert "edm" in material_ids, "Missing EDM"
        assert "threading" in material_ids, "Missing Threading"
        print(f"PASS: Machining has 6 materials including Surface Grinding, EDM, Threading")
    
    def test_anatomy_has_6_materials(self):
        """Anatomy should have 6 materials including Endocrine, Lymphatic, Integumentary"""
        response = requests.get(f"{BASE_URL}/api/workshop/anatomy/materials")
        assert response.status_code == 200, f"Anatomy materials failed: {response.text}"
        data = response.json()
        materials = data.get("systems", data.get("materials", []))
        assert len(materials) == 6, f"Anatomy should have 6 materials, got {len(materials)}"
        
        material_ids = [m.get("id") for m in materials]
        assert "endocrine" in material_ids, "Missing Endocrine"
        assert "lymphatic" in material_ids, "Missing Lymphatic"
        assert "integumentary" in material_ids, "Missing Integumentary"
        print(f"PASS: Anatomy has 6 materials including Endocrine, Lymphatic, Integumentary")
    
    def test_pedagogy_has_6_materials(self):
        """Pedagogy should have 6 materials including Curriculum Mapping, Differentiation, Behavioral Psych"""
        response = requests.get(f"{BASE_URL}/api/workshop/pedagogy/materials")
        assert response.status_code == 200, f"Pedagogy materials failed: {response.text}"
        data = response.json()
        materials = data.get("domains", data.get("materials", []))
        assert len(materials) == 6, f"Pedagogy should have 6 materials, got {len(materials)}"
        
        material_ids = [m.get("id") for m in materials]
        assert "curriculum_mapping" in material_ids, "Missing Curriculum Mapping"
        assert "differentiation" in material_ids, "Missing Differentiated Instruction"
        assert "behavioral_psych" in material_ids, "Missing Behavioral Psychology"
        print(f"PASS: Pedagogy has 6 materials including Curriculum Mapping, Differentiation, Behavioral Psych")
    
    def test_welding_has_6_materials(self):
        """Welding should have 6 materials including Flux-Core, Plasma Cutting, Underwater"""
        response = requests.get(f"{BASE_URL}/api/workshop/welding/materials")
        assert response.status_code == 200, f"Welding materials failed: {response.text}"
        data = response.json()
        materials = data.get("materials", [])
        assert len(materials) == 6, f"Welding should have 6 materials, got {len(materials)}"
        
        material_ids = [m.get("id") for m in materials]
        assert "flux_core" in material_ids, "Missing Flux-Core"
        assert "plasma_cutting" in material_ids, "Missing Plasma Cutting"
        assert "underwater" in material_ids, "Missing Underwater"
        print(f"PASS: Welding has 6 materials including Flux-Core, Plasma Cutting, Underwater")
    
    def test_nutrition_has_6_materials(self):
        """Nutrition should have 6 materials including Micronutrient Density, Gut Microbiome, Metabolic Flexibility"""
        response = requests.get(f"{BASE_URL}/api/workshop/nutrition/materials")
        assert response.status_code == 200, f"Nutrition materials failed: {response.text}"
        data = response.json()
        materials = data.get("foods", data.get("materials", []))
        assert len(materials) == 6, f"Nutrition should have 6 materials, got {len(materials)}"
        
        material_ids = [m.get("id") for m in materials]
        assert "micronutrient" in material_ids, "Missing Micronutrient Density"
        assert "gut_microbiome" in material_ids, "Missing Gut Microbiome"
        assert "metabolic_flex" in material_ids, "Missing Metabolic Flexibility"
        print(f"PASS: Nutrition has 6 materials including Micronutrient Density, Gut Microbiome, Metabolic Flexibility")


class TestDiveLayers:
    """Test new materials have full 6-depth dive_layers"""
    
    def test_surface_grinding_dive_layers(self):
        """Surface Grinding should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/machining/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("operations", data.get("materials", []))
        
        surface_grinding = next((m for m in materials if m.get("id") == "surface_grinding"), None)
        assert surface_grinding is not None, "Surface Grinding not found"
        
        dive_layers = surface_grinding.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        
        depths = [layer.get("depth") for layer in dive_layers]
        assert depths == [0, 1, 2, 3, 4, 5], f"Dive layers should be depth 0-5, got {depths}"
        print(f"PASS: Surface Grinding has 6 dive layers (depth 0-5)")
    
    def test_endocrine_dive_layers(self):
        """Endocrine should have 6 dive layers"""
        response = requests.get(f"{BASE_URL}/api/workshop/anatomy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", data.get("materials", []))
        
        endocrine = next((m for m in materials if m.get("id") == "endocrine"), None)
        assert endocrine is not None, "Endocrine not found"
        
        dive_layers = endocrine.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Endocrine has 6 dive layers")
    
    def test_flux_core_dive_layers(self):
        """Flux-Core should have 6 dive layers"""
        response = requests.get(f"{BASE_URL}/api/workshop/welding/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("materials", [])
        
        flux_core = next((m for m in materials if m.get("id") == "flux_core"), None)
        assert flux_core is not None, "Flux-Core not found"
        
        dive_layers = flux_core.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Flux-Core has 6 dive layers")


class TestXPWiring:
    """Test XP wiring for new skill sources (requires auth)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Auth failed - skipping XP wiring tests")
    
    def test_machining_skill_xp_wiring(self, auth_token):
        """Machining_Skill should map to Trade & Craft domain"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Gain XP with Machining_Skill source
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"amount": 10, "source": "Machining_Skill"},
            headers=headers)
        assert response.status_code == 200, f"Gain XP failed: {response.text}"
        
        # Check passport shows in Trade & Craft
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        domains = data.get("domains", [])
        trade_craft = next((d for d in domains if d.get("domain") == "Trade & Craft"), None)
        assert trade_craft is not None, "Trade & Craft domain not found"
        assert trade_craft.get("actions", 0) > 0, "Machining_Skill XP not showing in Trade & Craft"
        print(f"PASS: Machining_Skill XP shows in Trade & Craft domain")
    
    def test_anatomy_skill_xp_wiring(self, auth_token):
        """Anatomy_Skill should map to Science & Physics domain"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"amount": 10, "source": "Anatomy_Skill"},
            headers=headers)
        assert response.status_code == 200
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        domains = data.get("domains", [])
        science = next((d for d in domains if d.get("domain") == "Science & Physics"), None)
        assert science is not None, "Science & Physics domain not found"
        assert science.get("actions", 0) > 0, "Anatomy_Skill XP not showing in Science & Physics"
        print(f"PASS: Anatomy_Skill XP shows in Science & Physics domain")
    
    def test_philosophy_skill_xp_wiring(self, auth_token):
        """Philosophy_Skill should map to Sacred Knowledge domain"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"amount": 10, "source": "Philosophy_Skill"},
            headers=headers)
        assert response.status_code == 200
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        domains = data.get("domains", [])
        sacred = next((d for d in domains if d.get("domain") == "Sacred Knowledge"), None)
        assert sacred is not None, "Sacred Knowledge domain not found"
        assert sacred.get("actions", 0) > 0, "Philosophy_Skill XP not showing in Sacred Knowledge"
        print(f"PASS: Philosophy_Skill XP shows in Sacred Knowledge domain")
    
    def test_speaking_skill_xp_wiring(self, auth_token):
        """Speaking_Skill should map to Exploration domain"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"amount": 10, "source": "Speaking_Skill"},
            headers=headers)
        assert response.status_code == 200
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        domains = data.get("domains", [])
        exploration = next((d for d in domains if d.get("domain") == "Exploration"), None)
        assert exploration is not None, "Exploration domain not found"
        assert exploration.get("actions", 0) > 0, "Speaking_Skill XP not showing in Exploration"
        print(f"PASS: Speaking_Skill XP shows in Exploration domain")
    
    def test_pedagogy_skill_xp_wiring(self, auth_token):
        """Pedagogy_Skill should map to Exploration domain"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/rpg/character/gain-xp", 
            json={"amount": 10, "source": "Pedagogy_Skill"},
            headers=headers)
        assert response.status_code == 200
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        domains = data.get("domains", [])
        exploration = next((d for d in domains if d.get("domain") == "Exploration"), None)
        assert exploration is not None, "Exploration domain not found"
        assert exploration.get("actions", 0) > 0, "Pedagogy_Skill XP not showing in Exploration"
        print(f"PASS: Pedagogy_Skill XP shows in Exploration domain")


class TestHybridTitles:
    """Test passport returns 13 hybrid titles"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Auth failed - skipping hybrid title tests")
    
    def test_passport_returns_13_hybrid_titles(self, auth_token):
        """Passport should return 13 total hybrid titles (7 original + 6 new)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200, f"Passport failed: {response.text}"
        data = response.json()
        
        unlocked = data.get("unlocked_titles", [])
        locked = data.get("locked_titles", [])
        total_titles = len(unlocked) + len(locked)
        
        assert total_titles == 13, f"Expected 13 hybrid titles, got {total_titles}"
        print(f"PASS: Passport returns 13 hybrid titles ({len(unlocked)} unlocked, {len(locked)} locked)")
    
    def test_new_hybrid_titles_present(self, auth_token):
        """Check new hybrid titles are present"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        all_titles = data.get("unlocked_titles", []) + data.get("locked_titles", [])
        title_ids = [t.get("id") for t in all_titles]
        
        new_titles = ["biomechanical_engineer", "climate_architect", "sovereign_medic", 
                      "philosopher_king", "sacred_engineer"]
        
        for title_id in new_titles:
            assert title_id in title_ids, f"Missing new hybrid title: {title_id}"
        
        print(f"PASS: All 5 new hybrid titles present (Biomechanical Engineer, Climate Architect, Sovereign Medic, Philosopher King, Sacred Engineer)")


class TestOracleSearch:
    """Test Oracle Search finds new materials"""
    
    def test_search_grinding_finds_machining(self):
        """Search 'grinding' should find Machining workshop"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "grinding"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        machining_result = next((r for r in results if r.get("id") == "machining"), None)
        assert machining_result is not None, "Search 'grinding' should find Machining"
        print(f"PASS: Search 'grinding' finds Machining workshop")
    
    def test_search_microbiome_finds_nutrition(self):
        """Search 'microbiome' should find Nutrition workshop"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "microbiome"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        nutrition_result = next((r for r in results if r.get("id") == "nutrition"), None)
        assert nutrition_result is not None, "Search 'microbiome' should find Nutrition"
        print(f"PASS: Search 'microbiome' finds Nutrition workshop")
    
    def test_search_plasma_finds_welding(self):
        """Search 'plasma' should find Welding in Trade & Craft"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "plasma"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        welding_result = next((r for r in results if r.get("id") == "welding"), None)
        assert welding_result is not None, "Search 'plasma' should find Welding"
        assert welding_result.get("domain") == "Trade & Craft", "Welding should be in Trade & Craft domain"
        print(f"PASS: Search 'plasma' finds Welding in Trade & Craft domain")
    
    def test_search_endocrine_finds_anatomy(self):
        """Search 'endocrine' should find Anatomy workshop"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "endocrine"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        anatomy_result = next((r for r in results if r.get("id") == "anatomy"), None)
        assert anatomy_result is not None, "Search 'endocrine' should find Anatomy"
        print(f"PASS: Search 'endocrine' finds Anatomy workshop")
    
    def test_search_curriculum_finds_pedagogy(self):
        """Search 'curriculum' should find Pedagogy workshop"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "curriculum"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        results = data.get("results", [])
        pedagogy_result = next((r for r in results if r.get("id") == "pedagogy"), None)
        assert pedagogy_result is not None, "Search 'curriculum' should find Pedagogy"
        print(f"PASS: Search 'curriculum' finds Pedagogy workshop")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

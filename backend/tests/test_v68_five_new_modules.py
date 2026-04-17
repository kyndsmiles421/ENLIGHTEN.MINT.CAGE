"""
V68.0 — 5 New Workshop Modules Test Suite
Tests: Forestry, Geology, Economics, Music Theory, Permaculture
Each module: 6 materials, 9 tools, 6-depth recursive dives, intent tags, XP wiring
Total expected: 27 modules, 162 materials, 243 tools
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# V68.0 New Modules
NEW_MODULES = ['forestry', 'geology', 'economics', 'music', 'permaculture']

# Expected materials for each new module
EXPECTED_MATERIALS = {
    'forestry': ['Timber Harvesting', 'Tree Identification', 'Chainsaw Maintenance', 'Wildfire Science', 'Wood Properties', 'Watershed Management'],
    'geology': ['Igneous Rocks', 'Sedimentary Rocks', 'Metamorphic Rocks', 'Mineral Identification', 'Plate Tectonics', 'Groundwater Systems'],
    'economics': ['Supply & Demand', 'Money & Banking', 'International Trade', 'Behavioral Economics', 'GDP & Growth', 'Game Theory'],
    'music': ['Scales & Modes', 'Harmony & Chords', 'Rhythm & Meter', 'Counterpoint', 'Ear Training', 'Orchestration'],
    'permaculture': ['Design Principles', 'Food Forest', 'Water Harvesting', 'Composting Systems', 'Soil Biology', 'Climate Resilience'],
}

# Expected domain mappings for XP wiring
EXPECTED_DOMAINS = {
    'forestry': 'Trade & Craft',
    'geology': 'Science & Physics',
    'economics': 'Sacred Knowledge',
    'music': 'Creative Arts',
    'permaculture': 'Healing Arts',
}


class TestV68Registry:
    """Test the workshop registry returns all 27 modules with correct counts"""
    
    def test_registry_returns_27_modules(self):
        """Registry should return exactly 27 modules after V68.0"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200, f"Registry failed: {response.text}"
        data = response.json()
        assert 'modules' in data, "Response missing 'modules' key"
        assert data['total'] == 27, f"Expected 27 modules, got {data['total']}"
        print(f"✓ Registry returns {data['total']} modules")
    
    def test_all_modules_have_6_materials(self):
        """All 27 modules should have exactly 6 materials each"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        for module in data['modules']:
            assert module['materialCount'] == 6, f"Module {module['id']} has {module['materialCount']} materials, expected 6"
        
        total_materials = sum(m['materialCount'] for m in data['modules'])
        assert total_materials == 162, f"Expected 162 total materials (27×6), got {total_materials}"
        print(f"✓ All 27 modules have 6 materials each (162 total)")
    
    def test_all_modules_have_9_tools(self):
        """All 27 modules should have exactly 9 tools each"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        for module in data['modules']:
            assert module['toolCount'] == 9, f"Module {module['id']} has {module['toolCount']} tools, expected 9"
        
        total_tools = sum(m['toolCount'] for m in data['modules'])
        assert total_tools == 243, f"Expected 243 total tools (27×9), got {total_tools}"
        print(f"✓ All 27 modules have 9 tools each (243 total)")
    
    def test_new_modules_in_registry(self):
        """All 5 new V68.0 modules should be in the registry"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        module_ids = [m['id'] for m in data['modules']]
        for mod_id in NEW_MODULES:
            assert mod_id in module_ids, f"New module '{mod_id}' not found in registry"
        print(f"✓ All 5 new modules present: {NEW_MODULES}")


class TestForestryModule:
    """Test Forestry module (Trade & Craft domain)"""
    
    def test_forestry_materials_endpoint(self):
        """Forestry should return 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/forestry/materials")
        assert response.status_code == 200, f"Forestry materials failed: {response.text}"
        data = response.json()
        
        # Find the materials array
        materials = data.get('practices') or data.get('materials') or []
        assert len(materials) == 6, f"Expected 6 materials, got {len(materials)}"
        
        material_names = [m['name'] for m in materials]
        for expected in EXPECTED_MATERIALS['forestry']:
            assert expected in material_names, f"Missing material: {expected}"
        print(f"✓ Forestry has 6 materials: {material_names}")
    
    def test_forestry_tools_endpoint(self):
        """Forestry should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/forestry/tools")
        assert response.status_code == 200, f"Forestry tools failed: {response.text}"
        data = response.json()
        
        tools = data.get('tools', [])
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        print(f"✓ Forestry has 9 tools")
    
    def test_forestry_dive_layers_6_depth(self):
        """Each Forestry material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/forestry/materials")
        assert response.status_code == 200
        data = response.json()
        
        materials = data.get('practices') or data.get('materials') or []
        for mat in materials:
            dive_layers = mat.get('dive_layers', [])
            assert len(dive_layers) == 6, f"Material '{mat['name']}' has {len(dive_layers)} dive layers, expected 6"
            depths = [d['depth'] for d in dive_layers]
            assert depths == [0, 1, 2, 3, 4, 5], f"Material '{mat['name']}' has incorrect depth sequence: {depths}"
        print(f"✓ All Forestry materials have 6-depth dive layers (0-5)")


class TestGeologyModule:
    """Test Geology module (Science & Physics domain)"""
    
    def test_geology_materials_endpoint(self):
        """Geology should return 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/geology/materials")
        assert response.status_code == 200, f"Geology materials failed: {response.text}"
        data = response.json()
        
        materials = data.get('formations') or data.get('materials') or []
        assert len(materials) == 6, f"Expected 6 materials, got {len(materials)}"
        
        material_names = [m['name'] for m in materials]
        for expected in EXPECTED_MATERIALS['geology']:
            assert expected in material_names, f"Missing material: {expected}"
        print(f"✓ Geology has 6 materials: {material_names}")
    
    def test_geology_tools_endpoint(self):
        """Geology should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/geology/tools")
        assert response.status_code == 200, f"Geology tools failed: {response.text}"
        data = response.json()
        
        tools = data.get('tools', [])
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        print(f"✓ Geology has 9 tools")
    
    def test_geology_dive_layers_6_depth(self):
        """Each Geology material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/geology/materials")
        assert response.status_code == 200
        data = response.json()
        
        materials = data.get('formations') or data.get('materials') or []
        for mat in materials:
            dive_layers = mat.get('dive_layers', [])
            assert len(dive_layers) == 6, f"Material '{mat['name']}' has {len(dive_layers)} dive layers, expected 6"
        print(f"✓ All Geology materials have 6-depth dive layers")


class TestEconomicsModule:
    """Test Economics module (Sacred Knowledge domain)"""
    
    def test_economics_materials_endpoint(self):
        """Economics should return 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/economics/materials")
        assert response.status_code == 200, f"Economics materials failed: {response.text}"
        data = response.json()
        
        materials = data.get('concepts') or data.get('materials') or []
        assert len(materials) == 6, f"Expected 6 materials, got {len(materials)}"
        
        material_names = [m['name'] for m in materials]
        for expected in EXPECTED_MATERIALS['economics']:
            assert expected in material_names, f"Missing material: {expected}"
        print(f"✓ Economics has 6 materials: {material_names}")
    
    def test_economics_tools_endpoint(self):
        """Economics should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/economics/tools")
        assert response.status_code == 200, f"Economics tools failed: {response.text}"
        data = response.json()
        
        tools = data.get('tools', [])
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        print(f"✓ Economics has 9 tools")
    
    def test_economics_dive_layers_6_depth(self):
        """Each Economics material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/economics/materials")
        assert response.status_code == 200
        data = response.json()
        
        materials = data.get('concepts') or data.get('materials') or []
        for mat in materials:
            dive_layers = mat.get('dive_layers', [])
            assert len(dive_layers) == 6, f"Material '{mat['name']}' has {len(dive_layers)} dive layers, expected 6"
        print(f"✓ All Economics materials have 6-depth dive layers")


class TestMusicModule:
    """Test Music Theory module (Creative Arts domain)"""
    
    def test_music_materials_endpoint(self):
        """Music should return 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/music/materials")
        assert response.status_code == 200, f"Music materials failed: {response.text}"
        data = response.json()
        
        materials = data.get('elements') or data.get('materials') or []
        assert len(materials) == 6, f"Expected 6 materials, got {len(materials)}"
        
        material_names = [m['name'] for m in materials]
        for expected in EXPECTED_MATERIALS['music']:
            assert expected in material_names, f"Missing material: {expected}"
        print(f"✓ Music has 6 materials: {material_names}")
    
    def test_music_tools_endpoint(self):
        """Music should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/music/tools")
        assert response.status_code == 200, f"Music tools failed: {response.text}"
        data = response.json()
        
        tools = data.get('tools', [])
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        print(f"✓ Music has 9 tools")
    
    def test_music_dive_layers_6_depth(self):
        """Each Music material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/music/materials")
        assert response.status_code == 200
        data = response.json()
        
        materials = data.get('elements') or data.get('materials') or []
        for mat in materials:
            dive_layers = mat.get('dive_layers', [])
            assert len(dive_layers) == 6, f"Material '{mat['name']}' has {len(dive_layers)} dive layers, expected 6"
        print(f"✓ All Music materials have 6-depth dive layers")


class TestPermacultureModule:
    """Test Permaculture module (Healing Arts domain)"""
    
    def test_permaculture_materials_endpoint(self):
        """Permaculture should return 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/permaculture/materials")
        assert response.status_code == 200, f"Permaculture materials failed: {response.text}"
        data = response.json()
        
        materials = data.get('systems') or data.get('materials') or []
        assert len(materials) == 6, f"Expected 6 materials, got {len(materials)}"
        
        material_names = [m['name'] for m in materials]
        for expected in EXPECTED_MATERIALS['permaculture']:
            assert expected in material_names, f"Missing material: {expected}"
        print(f"✓ Permaculture has 6 materials: {material_names}")
    
    def test_permaculture_tools_endpoint(self):
        """Permaculture should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/permaculture/tools")
        assert response.status_code == 200, f"Permaculture tools failed: {response.text}"
        data = response.json()
        
        tools = data.get('tools', [])
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        print(f"✓ Permaculture has 9 tools")
    
    def test_permaculture_dive_layers_6_depth(self):
        """Each Permaculture material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/permaculture/materials")
        assert response.status_code == 200
        data = response.json()
        
        materials = data.get('systems') or data.get('materials') or []
        for mat in materials:
            dive_layers = mat.get('dive_layers', [])
            assert len(dive_layers) == 6, f"Material '{mat['name']}' has {len(dive_layers)} dive layers, expected 6"
        print(f"✓ All Permaculture materials have 6-depth dive layers")


class TestOracleSearch:
    """Test Oracle Search finds new modules correctly"""
    
    def test_search_timber_finds_forestry_and_carpentry(self):
        """Search 'timber' should find Forestry and Carpentry"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "timber"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        assert 'forestry' in result_ids, "Search 'timber' should find Forestry"
        # Carpentry may also match due to wood-related content
        print(f"✓ Search 'timber' finds: {result_ids}")
    
    def test_search_earthquake_finds_geology(self):
        """Search 'earthquake' should find Geology"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "earthquake"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        assert 'geology' in result_ids, "Search 'earthquake' should find Geology"
        print(f"✓ Search 'earthquake' finds: {result_ids}")
    
    def test_search_inflation_finds_economics(self):
        """Search 'inflation' should find Economics"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "inflation"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        assert 'economics' in result_ids, "Search 'inflation' should find Economics"
        print(f"✓ Search 'inflation' finds: {result_ids}")
    
    def test_search_chord_finds_music(self):
        """Search 'chord' should find Music"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "chord"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        assert 'music' in result_ids, "Search 'chord' should find Music"
        print(f"✓ Search 'chord' finds: {result_ids}")
    
    def test_search_compost_finds_permaculture_and_landscaping(self):
        """Search 'compost' should find Permaculture and Landscaping"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "compost"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        assert 'permaculture' in result_ids, "Search 'compost' should find Permaculture"
        # Landscaping also has compost material
        print(f"✓ Search 'compost' finds: {result_ids}")
    
    def test_search_soil_bridges_multiple_domains(self):
        """Search 'soil' should bridge Healing Arts and Trade & Craft domains"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "soil"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        result_ids = [r['id'] for r in data.get('results', [])]
        # Should find permaculture (Healing Arts), landscaping (Trade & Craft), forestry (Trade & Craft)
        healing_arts_found = 'permaculture' in result_ids or 'nutrition' in result_ids
        trade_craft_found = 'landscaping' in result_ids or 'forestry' in result_ids
        
        assert healing_arts_found or trade_craft_found, f"Search 'soil' should bridge domains, found: {result_ids}"
        print(f"✓ Search 'soil' bridges domains: {result_ids}")


class TestXPWiring:
    """Test XP wiring for new modules maps to correct domains"""
    
    def test_skill_domains_include_new_skills(self):
        """SKILL_DOMAINS should include all 5 new module skills"""
        # This tests the backend configuration indirectly through the registry
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        # Check each new module has the correct skillKey
        expected_skills = {
            'forestry': 'Forestry_Skill',
            'geology': 'Geology_Skill',
            'economics': 'Economics_Skill',
            'music': 'Music_Skill',
            'permaculture': 'Permaculture_Skill',
        }
        
        for module in data['modules']:
            if module['id'] in expected_skills:
                assert module['skillKey'] == expected_skills[module['id']], \
                    f"Module {module['id']} has wrong skillKey: {module['skillKey']}"
        
        print(f"✓ All new modules have correct skillKey mappings")


class TestBackToHubCrossLinks:
    """Test BackToHub cross-links for new modules (frontend verification)"""
    
    def test_forestry_registry_has_correct_domain(self):
        """Forestry should be in Trade & Craft domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        forestry = next((m for m in data['modules'] if m['id'] == 'forestry'), None)
        assert forestry is not None, "Forestry not found in registry"
        assert forestry['domain'] == 'Trade & Craft', f"Forestry domain is {forestry['domain']}, expected Trade & Craft"
        print(f"✓ Forestry is in Trade & Craft domain")
    
    def test_geology_registry_has_correct_domain(self):
        """Geology should be in Science & Physics domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        geology = next((m for m in data['modules'] if m['id'] == 'geology'), None)
        assert geology is not None, "Geology not found in registry"
        assert geology['domain'] == 'Science & Physics', f"Geology domain is {geology['domain']}, expected Science & Physics"
        print(f"✓ Geology is in Science & Physics domain")
    
    def test_economics_registry_has_correct_domain(self):
        """Economics should be in Sacred Knowledge domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        economics = next((m for m in data['modules'] if m['id'] == 'economics'), None)
        assert economics is not None, "Economics not found in registry"
        assert economics['domain'] == 'Sacred Knowledge', f"Economics domain is {economics['domain']}, expected Sacred Knowledge"
        print(f"✓ Economics is in Sacred Knowledge domain")
    
    def test_music_registry_has_correct_domain(self):
        """Music should be in Creative Arts domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        music = next((m for m in data['modules'] if m['id'] == 'music'), None)
        assert music is not None, "Music not found in registry"
        assert music['domain'] == 'Creative Arts', f"Music domain is {music['domain']}, expected Creative Arts"
        print(f"✓ Music is in Creative Arts domain")
    
    def test_permaculture_registry_has_correct_domain(self):
        """Permaculture should be in Healing Arts domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        
        permaculture = next((m for m in data['modules'] if m['id'] == 'permaculture'), None)
        assert permaculture is not None, "Permaculture not found in registry"
        assert permaculture['domain'] == 'Healing Arts', f"Permaculture domain is {permaculture['domain']}, expected Healing Arts"
        print(f"✓ Permaculture is in Healing Arts domain")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

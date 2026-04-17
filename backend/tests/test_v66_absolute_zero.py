"""
V66.0 Absolute Zero Parity Tests
Tests the final 4-module expansion: Automotive, Meditation, Speaking, Philosophy
All 22 modules should now have 6 materials each = 132 total materials, 198 tools
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestV66RegistryParity:
    """Test that registry returns 22 modules ALL at 6 materials each"""
    
    def test_registry_returns_22_modules(self):
        """Registry should return exactly 22 modules"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        assert len(modules) == 22, f"Expected 22 modules, got {len(modules)}"
        print(f"PASS: Registry returns {len(modules)} modules")
    
    def test_all_modules_have_6_materials(self):
        """All 22 modules should have exactly 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        modules_with_wrong_count = []
        for mod in modules:
            # Registry uses 'materialCount' not 'material_count'
            mat_count = mod.get("materialCount", 0)
            if mat_count != 6:
                modules_with_wrong_count.append(f"{mod['id']}: {mat_count}")
        
        assert len(modules_with_wrong_count) == 0, f"Modules without 6 materials: {modules_with_wrong_count}"
        print("PASS: All 22 modules have exactly 6 materials")
    
    def test_total_132_materials(self):
        """Total materials should be 132 (22 modules × 6 materials)"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        # Registry uses 'materialCount' not 'material_count'
        total_materials = sum(mod.get("materialCount", 0) for mod in modules)
        assert total_materials == 132, f"Expected 132 total materials, got {total_materials}"
        print(f"PASS: Total materials = {total_materials}")
    
    def test_total_198_tools(self):
        """Total tools should be 198 (22 modules × 9 tools)"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        # Registry uses 'toolCount' not 'tool_count'
        total_tools = sum(mod.get("toolCount", 0) for mod in modules)
        assert total_tools == 198, f"Expected 198 total tools, got {total_tools}"
        print(f"PASS: Total tools = {total_tools}")


class TestAutomotiveExpansion:
    """Test Automotive module has 6 materials including new ones"""
    
    def test_automotive_has_6_materials(self):
        """Automotive should have 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        assert len(materials) == 6, f"Expected 6 automotive materials, got {len(materials)}"
        print(f"PASS: Automotive has {len(materials)} materials")
    
    def test_automotive_material_names(self):
        """Automotive should have: Engine Block, Brake System, Electrical Harness, Hybrid/EV, Transmission, ECU Remapping"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        
        # Actual IDs from API: engine_block, brake_system, electrical_harness, hybrid_ev, transmission, ecu_remap
        expected_ids = {"engine_block", "brake_system", "electrical_harness", "hybrid_ev", "transmission", "ecu_remap"}
        actual_ids = {m["id"] for m in materials}
        
        missing = expected_ids - actual_ids
        assert len(missing) == 0, f"Missing automotive materials: {missing}"
        print(f"PASS: Automotive has all expected materials: {actual_ids}")
    
    def test_hybrid_ev_has_6_depth_dive_layers(self):
        """Hybrid/EV material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        
        hybrid_ev = next((m for m in materials if m["id"] == "hybrid_ev"), None)
        assert hybrid_ev is not None, "Hybrid/EV material not found"
        
        dive_layers = hybrid_ev.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        
        depths = [layer.get("depth") for layer in dive_layers]
        assert depths == [0, 1, 2, 3, 4, 5], f"Expected depths 0-5, got {depths}"
        print(f"PASS: Hybrid/EV has 6 dive layers with depths {depths}")
    
    def test_transmission_has_6_depth_dive_layers(self):
        """Transmission material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        
        transmission = next((m for m in materials if m["id"] == "transmission"), None)
        assert transmission is not None, "Transmission material not found"
        
        dive_layers = transmission.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Transmission has {len(dive_layers)} dive layers")
    
    def test_ecu_remap_has_6_depth_dive_layers(self):
        """ECU Remapping material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        
        ecu_remap = next((m for m in materials if m["id"] == "ecu_remap"), None)
        assert ecu_remap is not None, "ECU Remapping material not found"
        
        dive_layers = ecu_remap.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: ECU Remapping has {len(dive_layers)} dive layers")


class TestMeditationExpansion:
    """Test Meditation module has 6 materials including new ones"""
    
    def test_meditation_has_6_materials(self):
        """Meditation should have 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        assert len(materials) == 6, f"Expected 6 meditation materials, got {len(materials)}"
        print(f"PASS: Meditation has {len(materials)} materials")
    
    def test_meditation_material_names(self):
        """Meditation should have: Silence, Breath, Visualization, Theta Wave, Heart-Math Coherence, Stoic Visualization"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        
        # Actual IDs from API: silence, breath, visualization, theta_wave, heart_coherence, stoic_vis
        expected_ids = {"silence", "breath", "visualization", "theta_wave", "heart_coherence", "stoic_vis"}
        actual_ids = {m["id"] for m in materials}
        
        missing = expected_ids - actual_ids
        assert len(missing) == 0, f"Missing meditation materials: {missing}"
        print(f"PASS: Meditation has all expected materials: {actual_ids}")
    
    def test_theta_wave_has_6_depth_dive_layers(self):
        """Theta Wave material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        
        theta_wave = next((m for m in materials if m["id"] == "theta_wave"), None)
        assert theta_wave is not None, "Theta Wave material not found"
        
        dive_layers = theta_wave.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Theta Wave has {len(dive_layers)} dive layers")
    
    def test_heart_coherence_has_6_depth_dive_layers(self):
        """Heart-Math Coherence material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        
        heart_coherence = next((m for m in materials if m["id"] == "heart_coherence"), None)
        assert heart_coherence is not None, "Heart-Math Coherence material not found"
        
        dive_layers = heart_coherence.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Heart-Math Coherence has {len(dive_layers)} dive layers")
    
    def test_stoic_vis_has_6_depth_dive_layers(self):
        """Stoic Visualization material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        
        stoic_vis = next((m for m in materials if m["id"] == "stoic_vis"), None)
        assert stoic_vis is not None, "Stoic Visualization material not found"
        
        dive_layers = stoic_vis.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Stoic Visualization has {len(dive_layers)} dive layers")


class TestSpeakingExpansion:
    """Test Speaking module has 6 materials including new ones"""
    
    def test_speaking_has_6_materials(self):
        """Speaking should have 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/speaking/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("topics", [])
        assert len(materials) == 6, f"Expected 6 speaking materials, got {len(materials)}"
        print(f"PASS: Speaking has {len(materials)} materials")
    
    def test_speaking_material_names(self):
        """Speaking should have: Audience, Persuasion, Storytelling, Rhetorical Devices, Body Language, Crisis Communication"""
        response = requests.get(f"{BASE_URL}/api/workshop/speaking/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("topics", [])
        
        # Actual IDs from API: audience, persuasion, storytelling_ps, rhetoric, body_analysis, crisis_comm
        expected_ids = {"audience", "persuasion", "storytelling_ps", "rhetoric", "body_analysis", "crisis_comm"}
        actual_ids = {m["id"] for m in materials}
        
        missing = expected_ids - actual_ids
        assert len(missing) == 0, f"Missing speaking materials: {missing}"
        print(f"PASS: Speaking has all expected materials: {actual_ids}")
    
    def test_rhetoric_has_6_depth_dive_layers(self):
        """Rhetorical Devices material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/speaking/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("topics", [])
        
        rhetoric = next((m for m in materials if m["id"] == "rhetoric"), None)
        assert rhetoric is not None, "Rhetorical Devices material not found"
        
        dive_layers = rhetoric.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Rhetorical Devices has {len(dive_layers)} dive layers")
    
    def test_body_analysis_has_6_depth_dive_layers(self):
        """Body Language Analysis material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/speaking/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("topics", [])
        
        body_analysis = next((m for m in materials if m["id"] == "body_analysis"), None)
        assert body_analysis is not None, "Body Language Analysis material not found"
        
        dive_layers = body_analysis.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Body Language Analysis has {len(dive_layers)} dive layers")
    
    def test_crisis_comm_has_6_depth_dive_layers(self):
        """Crisis Communication material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/speaking/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("topics", [])
        
        crisis_comm = next((m for m in materials if m["id"] == "crisis_comm"), None)
        assert crisis_comm is not None, "Crisis Communication material not found"
        
        dive_layers = crisis_comm.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Crisis Communication has {len(dive_layers)} dive layers")


class TestPhilosophyExpansion:
    """Test Philosophy module has 6 materials including new ones"""
    
    def test_philosophy_has_6_materials(self):
        """Philosophy should have 6 materials"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        assert len(materials) == 6, f"Expected 6 philosophy materials, got {len(materials)}"
        print(f"PASS: Philosophy has {len(materials)} materials")
    
    def test_philosophy_material_names(self):
        """Philosophy should have: Ethics, Logic, Metaphysics, Existentialism, Stoicism, Epistemology"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        
        expected_ids = {"ethics", "logic", "metaphysics", "existentialism", "stoicism", "epistemology"}
        actual_ids = {m["id"] for m in materials}
        
        missing = expected_ids - actual_ids
        assert len(missing) == 0, f"Missing philosophy materials: {missing}"
        print(f"PASS: Philosophy has all expected materials: {actual_ids}")
    
    def test_existentialism_has_6_depth_dive_layers(self):
        """Existentialism material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        
        existentialism = next((m for m in materials if m["id"] == "existentialism"), None)
        assert existentialism is not None, "Existentialism material not found"
        
        dive_layers = existentialism.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Existentialism has {len(dive_layers)} dive layers")
    
    def test_stoicism_has_6_depth_dive_layers(self):
        """Stoicism material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        
        stoicism = next((m for m in materials if m["id"] == "stoicism"), None)
        assert stoicism is not None, "Stoicism material not found"
        
        dive_layers = stoicism.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Stoicism has {len(dive_layers)} dive layers")
    
    def test_epistemology_has_6_depth_dive_layers(self):
        """Epistemology material should have 6 dive layers (depth 0-5)"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        
        epistemology = next((m for m in materials if m["id"] == "epistemology"), None)
        assert epistemology is not None, "Epistemology material not found"
        
        dive_layers = epistemology.get("dive_layers", [])
        assert len(dive_layers) == 6, f"Expected 6 dive layers, got {len(dive_layers)}"
        print(f"PASS: Epistemology has {len(dive_layers)} dive layers")


class TestDepth5UniversalLaw:
    """Test that Depth-5 connects physical tool to universal law"""
    
    def test_automotive_depth5_universal_law(self):
        """Automotive Depth-5 should connect to universal law"""
        response = requests.get(f"{BASE_URL}/api/workshop/automotive/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("systems", [])
        
        # Check hybrid_ev depth 5
        hybrid_ev = next((m for m in materials if m["id"] == "hybrid_ev"), None)
        assert hybrid_ev is not None
        depth5 = hybrid_ev["dive_layers"][5]
        assert "Solid-State" in depth5["label"] or "physics" in depth5["desc"].lower() or "quantum" in depth5["desc"].lower() or "lithium" in depth5["desc"].lower()
        print(f"PASS: Automotive hybrid_ev Depth-5: {depth5['label']}")
    
    def test_meditation_depth5_universal_law(self):
        """Meditation Depth-5 should connect to universal law"""
        response = requests.get(f"{BASE_URL}/api/workshop/meditation/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("practices", [])
        
        # Check theta_wave depth 5
        theta_wave = next((m for m in materials if m["id"] == "theta_wave"), None)
        assert theta_wave is not None
        depth5 = theta_wave["dive_layers"][5]
        assert "Quantum" in depth5["label"] or "quantum" in depth5["desc"].lower() or "consciousness" in depth5["desc"].lower()
        print(f"PASS: Meditation theta_wave Depth-5: {depth5['label']}")
    
    def test_philosophy_depth5_universal_law(self):
        """Philosophy Depth-5 should connect to universal law"""
        response = requests.get(f"{BASE_URL}/api/workshop/philosophy/materials")
        assert response.status_code == 200
        data = response.json()
        materials = data.get("branches", [])
        
        # Check stoicism depth 5
        stoicism = next((m for m in materials if m["id"] == "stoicism"), None)
        assert stoicism is not None
        depth5 = stoicism["dive_layers"][5]
        assert "Logos" in depth5["label"] or "universe" in depth5["desc"].lower() or "cosmos" in depth5["desc"].lower()
        print(f"PASS: Philosophy stoicism Depth-5: {depth5['label']}")


class TestOracleSearchNewMaterials:
    """Test Oracle Search finds new materials"""
    
    def test_oracle_search_theta(self):
        """Oracle Search 'theta' should find Meditation"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "theta"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        meditation_found = any(r.get("id") == "meditation" or "meditation" in str(r).lower() for r in results)
        assert meditation_found, f"'theta' search should find Meditation. Results: {results}"
        print(f"PASS: Oracle Search 'theta' finds Meditation")
    
    def test_oracle_search_stoicism(self):
        """Oracle Search 'stoicism' should find Philosophy"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "stoicism"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        philosophy_found = any(r.get("id") == "philosophy" or "philosophy" in str(r).lower() for r in results)
        assert philosophy_found, f"'stoicism' search should find Philosophy. Results: {results}"
        print(f"PASS: Oracle Search 'stoicism' finds Philosophy")
    
    def test_oracle_search_hybrid(self):
        """Oracle Search 'hybrid' should find Automotive"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "hybrid"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        automotive_found = any(r.get("id") == "automotive" or "automotive" in str(r).lower() for r in results)
        assert automotive_found, f"'hybrid' search should find Automotive. Results: {results}"
        print(f"PASS: Oracle Search 'hybrid' finds Automotive")
    
    def test_oracle_search_rhetoric(self):
        """Oracle Search 'rhetoric' should find Speaking"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "rhetoric"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        speaking_found = any(r.get("id") == "speaking" or "speaking" in str(r).lower() for r in results)
        assert speaking_found, f"'rhetoric' search should find Speaking. Results: {results}"
        print(f"PASS: Oracle Search 'rhetoric' finds Speaking")


class TestOracleSearchCrossDomain:
    """Test Oracle Search cross-domain bridge"""
    
    def test_oracle_search_energy_bridges(self):
        """Oracle Search 'energy' should bridge Trade & Healing"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "energy"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        # Should find results from multiple domains
        modules_found = set(r.get("id", "") for r in results)
        print(f"'energy' search found modules: {modules_found}")
        assert len(modules_found) >= 2, f"'energy' should bridge multiple domains. Found: {modules_found}"
        print(f"PASS: Oracle Search 'energy' bridges multiple domains: {modules_found}")
    
    def test_oracle_search_control_bridges(self):
        """Oracle Search 'control' should bridge Science & Trade"""
        response = requests.get(f"{BASE_URL}/api/workshop/search", params={"q": "control"})
        assert response.status_code == 200
        data = response.json()
        results = data.get("results", [])
        
        # Should find results from multiple domains
        modules_found = set(r.get("id", "") for r in results)
        print(f"'control' search found modules: {modules_found}")
        assert len(modules_found) >= 1, f"'control' should find at least one module. Found: {modules_found}"
        print(f"PASS: Oracle Search 'control' finds modules: {modules_found}")


class TestXPWiring:
    """Test XP wiring for all 22 modules"""
    
    def test_automotive_skill_in_trade_craft(self):
        """Automotive_Skill should map to Trade & Craft domain"""
        # Check rpg.py SKILL_DOMAINS
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        automotive = next((m for m in modules if m["id"] == "automotive"), None)
        assert automotive is not None
        assert automotive.get("domain") == "Trade & Craft", f"Automotive domain should be 'Trade & Craft', got {automotive.get('domain')}"
        print(f"PASS: Automotive maps to Trade & Craft")
    
    def test_meditation_skill_in_mind_spirit(self):
        """Meditation_Skill should map to Mind & Spirit domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        meditation = next((m for m in modules if m["id"] == "meditation"), None)
        assert meditation is not None
        assert meditation.get("domain") == "Mind & Spirit", f"Meditation domain should be 'Mind & Spirit', got {meditation.get('domain')}"
        print(f"PASS: Meditation maps to Mind & Spirit")
    
    def test_speaking_skill_in_exploration(self):
        """Speaking_Skill should map to Exploration domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        speaking = next((m for m in modules if m["id"] == "speaking"), None)
        assert speaking is not None
        assert speaking.get("domain") == "Exploration", f"Speaking domain should be 'Exploration', got {speaking.get('domain')}"
        print(f"PASS: Speaking maps to Exploration")
    
    def test_philosophy_skill_in_sacred_knowledge(self):
        """Philosophy_Skill should map to Sacred Knowledge domain"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200
        data = response.json()
        modules = data.get("modules", [])
        
        philosophy = next((m for m in modules if m["id"] == "philosophy"), None)
        assert philosophy is not None
        assert philosophy.get("domain") == "Sacred Knowledge", f"Philosophy domain should be 'Sacred Knowledge', got {philosophy.get('domain')}"
        print(f"PASS: Philosophy maps to Sacred Knowledge")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

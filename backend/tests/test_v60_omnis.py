"""
V60.0 Sovereign Omnis-Encrypted Core Backend Tests
Tests for: deep-sync, xfinity-state, cultural-intelligence, linguistic-bridge, sovereign-print
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestV60DeepSync:
    """V60.0 Deep Sync endpoint tests - enhanced resonance, fractal depth, knowledge equity"""
    
    def test_deep_sync_default_lakota(self):
        """Test deep-sync returns V60.0 data with Lakota as default"""
        response = requests.get(f"{BASE_URL}/api/omnis/deep-sync")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # V60.0 version check
        assert data.get("version") == "V60.0-Sovereign", f"Expected V60.0-Sovereign, got {data.get('version')}"
        assert data.get("integrity") == "Deep-Synced"
        
        # Mathematical state checks
        math_state = data.get("mathematical_state", {})
        assert math_state.get("base_resonance") == 8.6059, "Base resonance should be 8.6059"
        assert "enhanced_resonance" in math_state
        assert "fractal_depth" in math_state
        assert math_state.get("phi") == 1.618033
        
        # Knowledge equity checks
        equity = data.get("knowledge_equity", {})
        assert "nodes_unlocked" in equity
        assert "mythology_depth" in equity
        assert "base_rate" in equity
        assert "$15" in equity.get("base_rate", "")  # Format may vary: $15.0/hr or $15.00/hr
        assert "knowledge_equity" in equity
        assert "growth_formula" in equity
        
        # Cultural intelligence check
        cultural = data.get("cultural_intelligence", {})
        assert cultural.get("language") is not None
        assert "terms" in cultural
        assert "tools" in cultural
        assert "inventions" in cultural
        
        print(f"✓ Deep Sync V60.0 working - resonance: {math_state.get('enhanced_resonance')}, equity: {equity.get('knowledge_equity')}")
    
    def test_deep_sync_with_xfinity_params(self):
        """Test deep-sync with nodes and depth parameters for Xfinity calculation"""
        # Test with depth 0.85 and 10 nodes - should give ~10x multiplier
        response = requests.get(f"{BASE_URL}/api/omnis/deep-sync?nodes_unlocked=10&mythology_depth=0.85")
        assert response.status_code == 200
        
        data = response.json()
        equity = data.get("knowledge_equity", {})
        
        # At depth 0.85 with 10 nodes, knowledge equity should be significantly multiplied
        assert "knowledge_equity" in equity
        assert equity.get("status") == "Xfinity-Active", f"Expected Xfinity-Active at depth 0.85, got {equity.get('status')}"
        
        # Verify exponential multiplier is present
        assert "exponential_multiplier" in equity
        
        print(f"✓ Deep Sync Xfinity params working - status: {equity.get('status')}, multiplier: {equity.get('exponential_multiplier')}")


class TestV57XfinityState:
    """V57.0 Xfinity Engine State tests - exponential growth calculations"""
    
    def test_xfinity_state_basic(self):
        """Test xfinity-state returns correct exponential growth data"""
        response = requests.get(f"{BASE_URL}/api/omnis/xfinity-state?nodes=1&depth=0.1")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V57.0-Xfinity"
        assert "nodes_unlocked" in data
        assert "mythology_depth" in data
        assert "base_rate" in data
        assert "$15" in data.get("base_rate", "")  # Format may vary: $15.0/hr or $15.00/hr
        assert "knowledge_equity" in data
        assert "growth_formula" in data
        assert data.get("growth_formula") == "E = (R × Φ) ^ (N / (1-D))"
        
        print(f"✓ Xfinity State basic working - equity: {data.get('knowledge_equity')}")
    
    def test_xfinity_state_high_depth(self):
        """Test xfinity-state at depth 0.85 gives ~10x multiplier"""
        response = requests.get(f"{BASE_URL}/api/omnis/xfinity-state?nodes=10&depth=0.85")
        assert response.status_code == 200
        
        data = response.json()
        
        # At depth 0.85, status should be Xfinity-Active
        assert data.get("status") == "Xfinity-Active", f"Expected Xfinity-Active, got {data.get('status')}"
        
        # Knowledge equity should be significantly higher than base
        # Base: 10 nodes * $15 = $150
        # With 10x multiplier: ~$1650
        equity_str = data.get("knowledge_equity", "$0.00")
        equity_value = float(equity_str.replace("$", "").replace(",", ""))
        assert equity_value > 150, f"Expected equity > $150 with multiplier, got {equity_str}"
        
        # Check next threshold
        assert "next_threshold" in data
        
        print(f"✓ Xfinity State high depth working - equity: {equity_str}, status: {data.get('status')}")
    
    def test_xfinity_state_growing_status(self):
        """Test xfinity-state at low depth shows Growing status"""
        response = requests.get(f"{BASE_URL}/api/omnis/xfinity-state?nodes=5&depth=0.5")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "Growing", f"Expected Growing at depth 0.5, got {data.get('status')}"
        
        print(f"✓ Xfinity State growing status working")


class TestV55CulturalIntelligence:
    """V55.1 Cultural Intelligence tests - Lakȟótiyapi terms, tools, inventions"""
    
    def test_cultural_intelligence_lakota(self):
        """Test cultural-intelligence returns Lakota language data"""
        response = requests.get(f"{BASE_URL}/api/omnis/cultural-intelligence/lakota")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V55.1"
        assert data.get("culture_id") == "lakota"
        assert data.get("language") == "Lakȟótiyapi"
        
        # Check terms
        terms = data.get("terms", {})
        assert "star" in terms, "Should have 'star' term"
        assert terms.get("star") == "Wičháȟpi", f"Star should be Wičháȟpi, got {terms.get('star')}"
        assert "earth" in terms
        assert terms.get("earth") == "Makhóčhe"
        assert "sacred_hoop" in terms
        assert terms.get("sacred_hoop") == "Čhaŋgléška Wakȟáŋ"
        assert "buffalo" in terms
        assert terms.get("buffalo") == "Tȟatȟáŋka"
        
        # Check tools
        tools = data.get("tools", [])
        assert "Stone Hammer" in tools
        assert "Bow & Arrow" in tools
        assert "Travois" in tools
        assert "Tipi Poles" in tools
        assert "Medicine Wheel" in tools
        
        # Check inventions
        inventions = data.get("inventions", [])
        assert "Astronomical Alignment Sites" in inventions
        assert "Star Maps on Buffalo Hides" in inventions
        assert "Lunar Calendars" in inventions
        
        # Check geometry
        assert data.get("geometry") == "Sacred Hoop (Circular)"
        
        print(f"✓ Cultural Intelligence Lakota working - language: {data.get('language')}, tools: {len(tools)}, inventions: {len(inventions)}")
    
    def test_cultural_intelligence_masonry(self):
        """Test cultural-intelligence returns Masonry data"""
        response = requests.get(f"{BASE_URL}/api/omnis/cultural-intelligence/masonry")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("language") == "Symbolic"
        
        tools = data.get("tools", [])
        assert "Plumb Rule" in tools
        assert "Level" in tools
        assert "Square" in tools
        assert "Compasses" in tools
        
        print(f"✓ Cultural Intelligence Masonry working - tools: {len(tools)}")
    
    def test_cultural_intelligence_not_found(self):
        """Test cultural-intelligence returns 404 for unknown culture"""
        response = requests.get(f"{BASE_URL}/api/omnis/cultural-intelligence/unknown_culture")
        assert response.status_code == 404
        
        print(f"✓ Cultural Intelligence 404 for unknown culture working")


class TestLinguisticBridge:
    """Linguistic Bridge tests - connects cultures with geometric resonance"""
    
    def test_linguistic_bridge_lakota_masonry(self):
        """Test linguistic-bridge connects lakota to masonry"""
        response = requests.get(f"{BASE_URL}/api/omnis/linguistic-bridge/lakota/masonry")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V55.1"
        assert data.get("from_culture") == "lakota"
        assert data.get("to_culture") == "masonry"
        
        # Check linguistic bridge
        ling_bridge = data.get("linguistic_bridge", {})
        assert ling_bridge.get("from_language") == "Lakȟótiyapi"
        assert ling_bridge.get("to_language") == "Symbolic"
        
        # Check tool bridge with geometric resonance
        tool_bridge = data.get("tool_bridge", [])
        assert len(tool_bridge) > 0, "Should have tool bridge connections"
        
        # Check for geometric resonance connection
        has_geometric = any("Geometric Resonance" in tb.get("connection", "") for tb in tool_bridge)
        assert has_geometric, "Should have Geometric Resonance connection"
        
        # Check growth vector
        assert data.get("growth_vector") == "Infinite"
        assert data.get("shared_purpose") == "Cross-Nodule Application Active"
        
        print(f"✓ Linguistic Bridge lakota->masonry working - tool bridges: {len(tool_bridge)}")
    
    def test_linguistic_bridge_lakota_horticulture(self):
        """Test linguistic-bridge connects lakota to horticulture"""
        response = requests.get(f"{BASE_URL}/api/omnis/linguistic-bridge/lakota/horticulture")
        assert response.status_code == 200
        
        data = response.json()
        ling_bridge = data.get("linguistic_bridge", {})
        assert ling_bridge.get("from_language") == "Lakȟótiyapi"
        assert ling_bridge.get("to_language") == "Botanical Latin"
        
        print(f"✓ Linguistic Bridge lakota->horticulture working")


class TestV60SovereignPrint:
    """V60.0 Sovereign Print tests - 9×9^math encrypted payload"""
    
    def test_sovereign_print_default(self):
        """Test sovereign-print returns encrypted payload"""
        response = requests.get(f"{BASE_URL}/api/omnis/sovereign-print")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V60.0-Sovereign"
        assert data.get("integrity") == "Encrypted-Synced"
        assert data.get("encryption") == "9×9^math Geometric Wrap"
        
        # Check encrypted payload exists
        assert "encrypted_payload" in data
        encrypted = data.get("encrypted_payload", "")
        assert len(encrypted) > 0, "Encrypted payload should not be empty"
        
        # Check Lakota core is active
        assert data.get("lakota_core") == "ACTIVE"
        assert data.get("system_status") == "REVOLVING"
        
        print(f"✓ Sovereign Print working - encryption: {data.get('encryption')}, payload length: {len(encrypted)}")
    
    def test_sovereign_print_with_culture(self):
        """Test sovereign-print with different culture parameter"""
        response = requests.get(f"{BASE_URL}/api/omnis/sovereign-print?culture=mayan")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V60.0-Sovereign"
        assert "encrypted_payload" in data
        
        print(f"✓ Sovereign Print with culture param working")


class TestOmnisCultures:
    """Tests for cultures endpoint - 21 cultures, 103 constellations"""
    
    def test_cultures_count(self):
        """Test cultures endpoint returns 21 cultures with 103 total constellations"""
        response = requests.get(f"{BASE_URL}/api/omnis/cultures")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("total_cultures") == 21, f"Expected 21 cultures, got {data.get('total_cultures')}"
        assert data.get("total_constellations") == 103, f"Expected 103 constellations, got {data.get('total_constellations')}"
        assert data.get("foundational_culture") == "lakota"
        
        cultures = data.get("cultures", [])
        assert len(cultures) == 21
        
        # Check Lakota is first and marked as foundational
        lakota = cultures[0]
        assert lakota.get("id") == "lakota"
        assert lakota.get("is_foundational") == True
        
        print(f"✓ Cultures endpoint working - {data.get('total_cultures')} cultures, {data.get('total_constellations')} constellations")
    
    def test_foundational_culture(self):
        """Test foundational-culture endpoint returns Lakota with orbitals"""
        response = requests.get(f"{BASE_URL}/api/omnis/foundational-culture")
        assert response.status_code == 200
        
        data = response.json()
        foundational = data.get("foundational", {})
        assert foundational.get("id") == "lakota"
        assert foundational.get("is_foundational") == True
        assert "local_resonance" in foundational
        
        local = foundational.get("local_resonance", {})
        assert local.get("region") == "Black Hills (He Sapa)"
        assert local.get("city") == "Rapid City"
        
        orbitals = data.get("orbitals", [])
        assert len(orbitals) > 0, "Should have orbital cultures"
        
        print(f"✓ Foundational Culture working - Lakota with {len(orbitals)} orbitals")


class TestUIOptimizer:
    """V56.0 UI Optimizer tests"""
    
    def test_ui_optimizer(self):
        """Test ui-optimizer returns fractal scaling config"""
        response = requests.get(f"{BASE_URL}/api/omnis/ui-optimizer?nodes=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("version") == "V56.0"
        assert data.get("view_box") == "Dynamic Fractal"
        assert data.get("background") == "Pure Obsidian (#000000)"
        assert "fractal_depth" in data
        assert "elements" in data
        
        print(f"✓ UI Optimizer working - fractal depth: {data.get('fractal_depth')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

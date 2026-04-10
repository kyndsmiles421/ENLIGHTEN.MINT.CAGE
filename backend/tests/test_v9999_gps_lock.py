"""
V9999.3 GPS Phygital Lock & Sovereign Hub Backend Tests
Tests the GPS lock endpoints and related Sovereign Hub APIs
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')


class TestGPSPhygitalLock:
    """V9999.3 GPS Phygital Lock endpoint tests"""
    
    def test_gps_phygital_lock_manifest(self):
        """Test GET /api/omnis/gps-phygital-lock returns anchor manifest"""
        response = requests.get(f"{BASE_URL}/api/omnis/gps-phygital-lock")
        assert response.status_code == 200
        
        data = response.json()
        # Verify version
        assert data["version"] == "V9999.3 Harvest Grounding"
        
        # Verify primary anchor
        assert "primary_anchor" in data
        assert data["primary_anchor"]["lat"] == 43.8
        assert data["primary_anchor"]["lng"] == -103.5
        assert data["primary_anchor"]["name"] == "Black Hills Centroid (He Sapa)"
        
        # Verify resonance parameters
        assert data["resonance_radius_km"] == 0.9
        assert data["helix_boundary"] == "9×9 (0.9km)"
        assert data["trust_entity"] == "Enlighten.Mint.Sovereign.Trust"
        assert data["equity_locked"] == "$49,018.24"
        assert data["formula"] == "9999 × z^(πr³)"
        assert data["seg_harmonic"] == "144Hz LOCKED"
        
        # Verify cultural significance
        assert "cultural_significance" in data
        assert data["cultural_significance"]["lakota_name"] == "He Sapa"
        
        # Verify secondary anchors
        assert "secondary_anchors" in data
        assert len(data["secondary_anchors"]) >= 3
        print(f"✅ GPS Phygital Lock manifest: {data['version']}")
    
    def test_gps_phygital_lock_demo(self):
        """Test GET /api/omnis/gps-phygital-lock/demo returns verified presence"""
        response = requests.get(f"{BASE_URL}/api/omnis/gps-phygital-lock/demo")
        assert response.status_code == 200
        
        data = response.json()
        # Verify demo mode
        assert data["demo_mode"] == True
        assert data["is_locked"] == True
        assert data["status"] == "VERIFIED-PRESENCE"
        
        # Verify distance is 0 (at exact anchor point)
        assert data["distance_km"] == 0.0
        assert data["resonance_strength"] == 1.0
        
        # Verify equity accessible
        assert data["equity_accessible"] == 49018.24
        
        # Verify badge color (green for verified)
        assert data["badge_color"] == "#22C55E"
        assert data["badge_pulse"] == True
        
        # Verify formula active
        assert data["formula_active"] == "9999 × z^(πr³)"
        assert data["seg_hz"] == "144Hz"
        
        print(f"✅ GPS Demo Lock: {data['status']} - Equity: ${data['equity_accessible']}")
    
    def test_gps_phygital_lock_verify_at_anchor(self):
        """Test POST /api/omnis/gps-phygital-lock/verify at exact anchor point"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/gps-phygital-lock/verify",
            params={"lat": 43.8, "lng": -103.5}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_locked"] == True
        assert data["status"] == "VERIFIED-PRESENCE"
        assert data["distance_km"] == 0.0
        assert data["resonance_strength"] == 1.0
        assert data["equity_accessible"] == 49018.24
        assert data["verification_type"] == "GPS Phygital Lock"
        assert data["calculation"] == "Haversine Distance Formula"
        
        print(f"✅ GPS Verify at anchor: {data['status']}")
    
    def test_gps_phygital_lock_verify_outside_radius(self):
        """Test POST /api/omnis/gps-phygital-lock/verify outside resonance radius"""
        # Test with coordinates far from Black Hills (e.g., New York)
        response = requests.post(
            f"{BASE_URL}/api/omnis/gps-phygital-lock/verify",
            params={"lat": 40.7128, "lng": -74.0060}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_locked"] == False
        assert data["status"] == "OUTSIDE-HELIX"
        assert data["resonance_strength"] == 0
        assert data["equity_accessible"] == 0
        assert data["badge_color"] == "#EF4444"  # Red for outside
        assert data["formula_active"] == "INACTIVE"
        
        print(f"✅ GPS Verify outside radius: {data['status']} - Distance: {data['distance_km']}km")
    
    def test_gps_phygital_lock_verify_near_boundary(self):
        """Test POST /api/omnis/gps-phygital-lock/verify near the 0.9km boundary"""
        # Test with coordinates slightly inside the 0.9km radius
        # 0.5km offset from anchor (should be inside)
        response = requests.post(
            f"{BASE_URL}/api/omnis/gps-phygital-lock/verify",
            params={"lat": 43.8045, "lng": -103.5}  # ~0.5km north
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should be inside the 0.9km radius
        assert data["distance_km"] < 0.9
        assert data["is_locked"] == True
        assert data["resonance_strength"] > 0
        
        print(f"✅ GPS Verify near boundary: {data['status']} - Distance: {data['distance_km']}km")


class TestSovereignHubAPIs:
    """Tests for Sovereign Hub related APIs"""
    
    def test_the_one_print(self):
        """Test GET /api/omnis/the-one-print returns unified print data"""
        response = requests.get(f"{BASE_URL}/api/omnis/the-one-print")
        assert response.status_code == 200
        
        data = response.json()
        assert "unified_version" in data
        assert "crystal_layer" in data
        assert "spectral_layer" in data
        assert "sovereign_trust" in data
        assert "gaia_matrix" in data
        
        # Verify crystal layer
        assert "identifier" in data["crystal_layer"]
        assert "resonance_frequency" in data["crystal_layer"]
        
        # Verify sovereign trust
        assert data["sovereign_trust"]["equity_locked"] == "$49,018.24"
        assert data["sovereign_trust"]["firewall"] == "ACTIVE"
        
        print(f"✅ The One Print: {data['unified_version']}")
    
    def test_spectral_singularity_bands(self):
        """Test GET /api/omnis/spectral-singularity/bands returns spectral bands"""
        response = requests.get(f"{BASE_URL}/api/omnis/spectral-singularity/bands")
        assert response.status_code == 200
        
        data = response.json()
        assert "bands" in data
        assert "base_frequency" in data
        
        # Verify all 7 spectral colors
        expected_colors = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "INDIGO", "VIOLET"]
        for color in expected_colors:
            assert color in data["bands"]
            assert "frequency" in data["bands"][color]
            assert "nodule" in data["bands"][color]
            assert "meaning" in data["bands"][color]
        
        print(f"✅ Spectral Bands: {len(data['bands'])} colors at {data['base_frequency']}")
    
    def test_trust_endpoint(self):
        """Test GET /api/omnis/trust returns trust data"""
        response = requests.get(f"{BASE_URL}/api/omnis/trust")
        assert response.status_code == 200
        
        data = response.json()
        assert data["trust_name"] == "Enlighten.Mint.Sovereign.Trust"
        assert "roles" in data
        assert "trustee" in data["roles"]
        assert data["roles"]["trustee"]["name"] == "Steven Michael"
        
        print(f"✅ Trust: {data['trust_name']}")
    
    def test_trust_purpose_statement(self):
        """Test GET /api/omnis/trust/purpose-statement returns purpose statement"""
        response = requests.get(f"{BASE_URL}/api/omnis/trust/purpose-statement")
        assert response.status_code == 200
        
        data = response.json()
        assert "content" in data
        assert "ENLIGHTEN.MINT SOVEREIGN TRUST" in data["content"]
        assert "PURPOSE STATEMENT" in data["content"]
        assert "Steven Michael" in data["content"]
        
        print(f"✅ Purpose Statement: {data['document_type']}")
    
    def test_crystal_indent_gaia_anchors(self):
        """Test GET /api/omnis/crystal-indent/gaia-anchors returns gaia anchors"""
        response = requests.get(f"{BASE_URL}/api/omnis/crystal-indent/gaia-anchors")
        assert response.status_code == 200
        
        data = response.json()
        assert "primary_anchor" in data
        assert "secondary_anchors" in data
        assert "global_sync" in data
        
        # Verify primary anchor
        assert data["primary_anchor"]["name"] == "Makhóčhe Alpha (Heart Node)"
        
        print(f"✅ Gaia Anchors: Primary - {data['primary_anchor']['name']}")


class TestMixerPresets:
    """Tests for Creator Control Mixer presets"""
    
    def test_mixer_presets(self):
        """Test GET /api/omnis/mixer/presets returns available presets"""
        response = requests.get(f"{BASE_URL}/api/omnis/mixer/presets")
        assert response.status_code == 200
        
        data = response.json()
        assert "presets" in data
        assert len(data["presets"]) >= 3
        
        # Verify preset structure
        for preset in data["presets"]:
            assert "id" in preset
            assert "name" in preset
            assert "input_a" in preset
            assert "input_b" in preset
            assert "output" in preset
        
        print(f"✅ Mixer Presets: {len(data['presets'])} presets available")
    
    def test_mixer_blend_sovereign_alignment(self):
        """Test POST /api/omnis/mixer/blend with sovereign_alignment preset"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/mixer/blend",
            params={"preset": "sovereign_alignment", "depth": 0.5}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["preset"] == "sovereign_alignment"
        assert data["preset_name"] == "Sovereign Alignment"
        assert "output_resonance" in data
        assert "trade_impact" in data
        assert "blend_geometry" in data
        
        print(f"✅ Mixer Blend: {data['preset_name']} - Resonance: {data['output_resonance']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

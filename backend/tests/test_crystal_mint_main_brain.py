"""
Crystal-QR Synthesis and Main Brain API Tests
Tests for:
- Crystal Mint eligibility, stats, languages APIs
- Main Brain status, shader-params, lattice APIs
- L² Fractal GPU Shader integration
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestCrystalMintPublicAPIs:
    """Crystal Mint public endpoints (no auth required)"""
    
    def test_crystal_mint_stats(self):
        """GET /api/crystal-mint/stats - Returns mint statistics"""
        response = requests.get(f"{BASE_URL}/api/crystal-mint/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "statistics" in data
        
        stats = data["statistics"]
        # Verify PHI constant (1.618033988749895)
        assert abs(stats["phi_constant"] - 1.618033988749895) < 0.0001
        # Verify resonance constant (PHI^2 / PI = 0.833346)
        assert abs(stats["resonance_constant"] - 0.833346) < 0.001
        # Verify protocol
        assert stats["protocol"] == "METAPLEX_CORE_V1"
        assert stats["blockchain"] == "SOLANA_CORE"
        # Verify mint thresholds
        assert stats["mint_threshold_credits"] == 10000
        assert abs(stats["mint_threshold_hours"] - 666.67) < 0.1
        # Verify supported languages
        assert set(stats["supported_languages"]) == {"EN", "ES", "FR", "DE", "JA"}
        print("PASS: Crystal mint stats returns PHI, resonance, and protocol info")
    
    def test_crystal_mint_languages(self):
        """GET /api/crystal-mint/languages - Returns pentagonal language facets"""
        response = requests.get(f"{BASE_URL}/api/crystal-mint/languages")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "languages" in data
        
        languages = data["languages"]
        # Verify 5 languages with pentagonal symmetry (72° each)
        assert len(languages) == 5
        assert data["pentagonal_division"] == 72
        
        # Verify each language has correct refraction angle
        expected_angles = {"EN": 0, "ES": 72, "FR": 144, "DE": 216, "JA": 288}
        for lang, info in languages.items():
            assert info["angle"] == expected_angles[lang], f"{lang} angle mismatch"
        
        # Verify labels
        assert languages["EN"]["label"] == "Sovereign Mastery"
        assert languages["ES"]["label"] == "Maestria Soberana"
        assert languages["FR"]["label"] == "Maitrise Souveraine"
        assert languages["DE"]["label"] == "Souverane Meisterschaft"
        print("PASS: Crystal mint languages returns 5 facets with 72° pentagonal symmetry")


class TestMainBrainPublicAPIs:
    """Main Brain public endpoints (no auth required)"""
    
    def test_main_brain_status(self):
        """GET /api/main-brain/status - Returns brain telemetry"""
        response = requests.get(f"{BASE_URL}/api/main-brain/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "main_brain" in data
        
        brain = data["main_brain"]
        # Verify engine info
        assert brain["engine"] == "SOVEREIGN_SINGULARITY_ENGINE"
        assert brain["version"] == "V-FINAL_MAIN_BRAIN"
        assert brain["status"] == "SUPERCONDUCTING"
        
        # Verify 9x9 lattice
        assert brain["lattice"]["size"] == "9x9"
        assert brain["lattice"]["total_nodes"] == 81
        
        # Verify sacred constants
        constants = brain["constants"]
        assert abs(constants["phi"] - 1.618033988749895) < 0.0001
        assert abs(constants["resonance"] - 0.833346) < 0.001
        assert constants["vocal_auth_hz"] == 432.0
        assert constants["lox_temp_c"] == -183.0
        
        # Verify shader params are included
        assert "shader_params" in brain
        print("PASS: Main brain status returns SUPERCONDUCTING with 9x9 lattice")
    
    def test_main_brain_shader_params(self):
        """GET /api/main-brain/shader-params - Returns GPU shader uniforms"""
        response = requests.get(f"{BASE_URL}/api/main-brain/shader-params")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert data["target_fps"] == 120
        assert data["shader_type"] == "L2_FRACTAL_GLSL"
        assert data["render_mode"] == "DYNAMIC_PRISMATIC_LIQUID"
        
        uniforms = data["shader_uniforms"]
        # Verify PHI uniform
        assert abs(uniforms["u_phi"] - 1.618033988749895) < 0.0001
        # Verify resonance uniform
        assert abs(uniforms["u_resonance"] - 0.833346) < 0.001
        # Verify LOx cooling (|-183| / 200 = 0.915)
        assert abs(uniforms["u_lox_cooling"] - 0.915) < 0.01
        # Verify pentagonal facets
        assert uniforms["u_crystal_facets"] == 5
        # Verify refraction angle (72°)
        assert uniforms["u_refraction_angle"] == 72.0
        # Verify vocal frequency
        assert uniforms["u_vocal_frequency"] == 432.0
        print("PASS: Shader params returns L2_FRACTAL_GLSL uniforms for 120 FPS rendering")
    
    def test_main_brain_lattice(self):
        """GET /api/main-brain/lattice - Returns 9x9 Crystalline Lattice state"""
        response = requests.get(f"{BASE_URL}/api/main-brain/lattice")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "lattice" in data
        
        lattice = data["lattice"]
        # Verify 9x9 grid
        assert lattice["lattice_size"] == 9
        assert lattice["total_nodes"] == 81
        assert lattice["center_node"] == [4, 4]
        
        # Verify all 81 nodes present
        assert len(lattice["nodes"]) == 81
        
        # Verify node distribution
        dist = lattice["node_distribution"]
        assert dist["CORE"] == 1  # Center node
        assert dist["MIXER"] == 4
        assert dist["GENERATOR"] == 4
        assert dist["LEDGER"] == 4
        assert dist["ORACLE"] == 4  # Corners
        
        # Verify center node is CORE with highest charge
        center_node = next(n for n in lattice["nodes"] if n["id"] == "node_4_4")
        assert center_node["type"] == "CORE"
        assert center_node["charge"] == 1.0
        
        # Verify PHI and resonance constants
        assert abs(lattice["phi_constant"] - 1.618033988749895) < 0.0001
        assert abs(lattice["resonance_constant"] - 0.833346) < 0.001
        print("PASS: Lattice returns 81 nodes with CORE at center (4,4)")


class TestCrystalMintAuthenticatedAPIs:
    """Crystal Mint authenticated endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_crystal_mint_eligibility(self):
        """GET /api/crystal-mint/eligibility - Returns user eligibility status"""
        response = requests.get(
            f"{BASE_URL}/api/crystal-mint/eligibility",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "eligibility" in data
        
        elig = data["eligibility"]
        # Verify eligibility structure
        assert "eligible" in elig
        assert "volunteer_credits" in elig
        assert "volunteer_hours" in elig
        assert "credits_threshold" in elig
        assert "progress_percentage" in elig
        assert "has_math_license" in elig
        
        # Verify threshold is 10,000 credits
        assert elig["credits_threshold"] == 10000
        
        # Verify reasons are provided if not eligible
        if not elig["eligible"]:
            assert "reasons" in elig
            assert len(elig["reasons"]) > 0
        
        print(f"PASS: Eligibility check returns {elig['progress_percentage']}% progress")
    
    def test_crystal_mint_nfts(self):
        """GET /api/crystal-mint/nfts - Returns user's minted NFTs"""
        response = requests.get(
            f"{BASE_URL}/api/crystal-mint/nfts",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "nfts" in data
        assert "count" in data
        assert isinstance(data["nfts"], list)
        print(f"PASS: NFTs endpoint returns {data['count']} minted NFTs")


class TestMainBrainAdvancedAPIs:
    """Main Brain advanced endpoints"""
    
    def test_main_brain_pulse(self):
        """POST /api/main-brain/pulse - Pulses the lattice"""
        response = requests.post(f"{BASE_URL}/api/main-brain/pulse")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "Lattice pulsed successfully"
        assert "telemetry" in data
        
        telemetry = data["telemetry"]
        assert "brain_status" in telemetry
        assert "lattice_load" in telemetry
        assert "commands_processed" in telemetry
        print("PASS: Lattice pulse returns updated telemetry")
    
    def test_main_brain_sync(self):
        """GET /api/main-brain/sync - Synchronizes all modules"""
        response = requests.get(f"{BASE_URL}/api/main-brain/sync")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "sync" in data
        
        sync = data["sync"]
        assert "sync_timestamp" in sync
        assert "sync_health" in sync
        assert "modules" in sync
        
        # Verify module sync status
        modules = sync["modules"]
        assert "brain" in modules
        assert "omega_sentinel" in modules
        assert "omni_generator" in modules
        assert "sovereign_ledger" in modules
        print(f"PASS: Module sync returns {sync['sync_health']}")
    
    def test_main_brain_constants(self):
        """GET /api/main-brain/constants - Returns sacred mathematical constants"""
        response = requests.get(f"{BASE_URL}/api/main-brain/constants")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "constants" in data
        assert "formulas" in data
        
        constants = data["constants"]
        # Verify PHI
        assert abs(constants["phi"] - 1.618033988749895) < 0.0001
        # Verify resonance
        assert abs(constants["resonance"] - 0.833346) < 0.001
        # Verify lattice size
        assert constants["lattice_size"] == 9
        assert constants["center_node"] == [4, 4]
        # Verify pentagonal division
        assert constants["pentagonal_division"] == 72.0
        assert constants["crystal_facets"] == 5
        
        # Verify formulas
        formulas = data["formulas"]
        assert "phi" in formulas
        assert "resonance" in formulas
        print("PASS: Sacred constants returns PHI, resonance, and formulas")


class TestIntegration:
    """Integration tests for Crystal-QR Synthesis and Main Brain"""
    
    def test_shader_params_match_lattice(self):
        """Verify shader params are derived from lattice state"""
        # Get lattice state
        lattice_res = requests.get(f"{BASE_URL}/api/main-brain/lattice")
        lattice = lattice_res.json()["lattice"]
        
        # Get shader params
        shader_res = requests.get(f"{BASE_URL}/api/main-brain/shader-params")
        uniforms = shader_res.json()["shader_uniforms"]
        
        # Verify u_lattice_charge matches average_charge
        assert abs(uniforms["u_lattice_charge"] - lattice["average_charge"]) < 0.01
        
        # Verify PHI constants match
        assert abs(uniforms["u_phi"] - lattice["phi_constant"]) < 0.0001
        print("PASS: Shader params are derived from lattice state")
    
    def test_crystal_mint_uses_phi_resonance(self):
        """Verify Crystal Mint uses same PHI/resonance as Main Brain"""
        # Get crystal mint stats
        mint_res = requests.get(f"{BASE_URL}/api/crystal-mint/stats")
        mint_stats = mint_res.json()["statistics"]
        
        # Get main brain constants
        brain_res = requests.get(f"{BASE_URL}/api/main-brain/constants")
        brain_constants = brain_res.json()["constants"]
        
        # Verify PHI matches
        assert abs(mint_stats["phi_constant"] - brain_constants["phi"]) < 0.0001
        # Verify resonance matches
        assert abs(mint_stats["resonance_constant"] - brain_constants["resonance"]) < 0.001
        print("PASS: Crystal Mint and Main Brain share PHI/resonance constants")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

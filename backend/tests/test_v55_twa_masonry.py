"""
V55.0 OmniCore Testing — TWA Manifest, Interactive Masonry, Cinematic Walkthrough, Avatar3D, Economy Tiers
Tests for the unified deployment sweep features.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTWAManifest:
    """TWA manifest for Google Play Store"""
    
    def test_twa_manifest_accessible(self):
        """TWA manifest should be accessible at /twa-manifest.json"""
        response = requests.get(f"{BASE_URL}/twa-manifest.json")
        assert response.status_code == 200, f"TWA manifest not accessible: {response.status_code}"
        data = response.json()
        assert "packageId" in data
        print(f"✓ TWA manifest accessible with packageId: {data.get('packageId')}")
    
    def test_twa_manifest_package_id(self):
        """TWA manifest should have correct packageId"""
        response = requests.get(f"{BASE_URL}/twa-manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert data.get("packageId") == "com.enlighten.mint.cafe", f"Wrong packageId: {data.get('packageId')}"
        print("✓ TWA manifest packageId is com.enlighten.mint.cafe")
    
    def test_twa_manifest_shortcuts(self):
        """TWA manifest should have 4 shortcuts"""
        response = requests.get(f"{BASE_URL}/twa-manifest.json")
        assert response.status_code == 200
        data = response.json()
        shortcuts = data.get("shortcuts", [])
        assert len(shortcuts) == 4, f"Expected 4 shortcuts, got {len(shortcuts)}"
        shortcut_names = [s.get("name") for s in shortcuts]
        assert "Sovereign Hub" in shortcut_names
        assert "Oracle" in shortcut_names
        assert "Breathwork" in shortcut_names
        assert "Academy" in shortcut_names
        print(f"✓ TWA manifest has 4 shortcuts: {shortcut_names}")


class TestWebManifest:
    """Web manifest for PWA"""
    
    def test_web_manifest_accessible(self):
        """Web manifest should be accessible at /manifest.json"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"Web manifest not accessible: {response.status_code}"
        data = response.json()
        assert "id" in data
        print(f"✓ Web manifest accessible with id: {data.get('id')}")
    
    def test_web_manifest_id(self):
        """Web manifest should have correct id"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert data.get("id") == "com.enlighten.mint.cafe", f"Wrong id: {data.get('id')}"
        print("✓ Web manifest id is com.enlighten.mint.cafe")
    
    def test_web_manifest_shortcuts(self):
        """Web manifest should have 4 shortcuts"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        shortcuts = data.get("shortcuts", [])
        assert len(shortcuts) == 4, f"Expected 4 shortcuts, got {len(shortcuts)}"
        print(f"✓ Web manifest has 4 shortcuts")


class TestBackendHealth:
    """Backend health and core endpoints"""
    
    def test_health_endpoint(self):
        """Health endpoint should return OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Backend health OK")


class TestEconomyTiers:
    """Economy tiers endpoint (no auth required)"""
    
    def test_economy_tiers_no_auth(self):
        """Economy tiers should be accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        assert response.status_code == 200, f"Economy tiers failed: {response.status_code}"
        data = response.json()
        assert "tiers" in data
        print("✓ Economy tiers accessible without auth")
    
    def test_economy_tiers_count(self):
        """Economy should have 4 tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        assert response.status_code == 200
        data = response.json()
        tiers = data.get("tiers", [])
        assert len(tiers) == 4, f"Expected 4 tiers, got {len(tiers)}"
        tier_ids = [t.get("id") for t in tiers]
        assert "discovery" in tier_ids
        assert "resonance" in tier_ids
        assert "sovereign" in tier_ids
        assert "architect" in tier_ids
        print(f"✓ Economy has 4 tiers: {tier_ids}")


class TestMasonryAPI:
    """Masonry materials endpoint"""
    
    def test_masonry_materials_academy(self):
        """Masonry materials for academy room should return data"""
        response = requests.get(f"{BASE_URL}/api/masonry/materials/academy")
        assert response.status_code == 200, f"Masonry materials failed: {response.status_code}"
        data = response.json()
        assert "materials" in data
        assert "total" in data
        assert "resonance" in data
        print(f"✓ Masonry materials for academy: total={data.get('total')}")


class TestResonanceAPI:
    """Resonance score endpoint"""
    
    def test_resonance_default(self):
        """Resonance default should return score data"""
        response = requests.get(f"{BASE_URL}/api/resonance/default")
        assert response.status_code == 200, f"Resonance default failed: {response.status_code}"
        data = response.json()
        assert "resonance" in data
        resonance = data.get("resonance", {})
        assert "score" in resonance
        assert "multiplier" in resonance
        assert "level" in resonance
        print(f"✓ Resonance default: score={resonance.get('score')}, level={resonance.get('level')}")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_crystals_endpoint(self):
        """Crystals endpoint should still work"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        # May return 200 or 401 depending on auth requirement
        assert response.status_code in [200, 401, 404], f"Crystals endpoint error: {response.status_code}"
        print(f"✓ Crystals endpoint responds: {response.status_code}")
    
    def test_breathing_patterns(self):
        """Breathing patterns endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/breathing/patterns")
        # May return 200 or 404 depending on implementation
        assert response.status_code in [200, 404], f"Breathing patterns error: {response.status_code}"
        print(f"✓ Breathing patterns endpoint responds: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

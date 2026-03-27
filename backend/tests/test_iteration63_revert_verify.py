"""
Iteration 63: Verify quantum overreach was reverted while quantum features remain as additive
Tests:
- Coach modes have ORIGINAL names (not quantum)
- Quantum principles API still works (8 principles, 5 meditations)
- Notifications API still works
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCoachModes:
    """Verify coach modes have ORIGINAL names (not quantum)"""
    
    def test_coach_modes_original_names(self):
        """Coach modes should have original names without quantum language"""
        response = requests.get(f"{BASE_URL}/api/coach/modes")
        assert response.status_code == 200
        
        data = response.json()
        modes = data.get('modes', [])
        assert len(modes) == 6, f"Expected 6 coach modes, got {len(modes)}"
        
        # Expected ORIGINAL mode names (NOT quantum)
        expected_modes = {
            'spiritual': 'Spiritual Guidance',
            'life': 'Life Coaching',
            'shadow': 'Shadow Work',
            'manifestation': 'Manifestation',  # NOT 'Quantum Manifestation'
            'healing': 'Healing Guide',  # NOT 'Quantum Healing'
            'dream_oracle': 'Dream Oracle'
        }
        
        for mode in modes:
            mode_id = mode.get('id')
            mode_name = mode.get('name')
            
            if mode_id in expected_modes:
                assert mode_name == expected_modes[mode_id], \
                    f"Mode {mode_id} should be '{expected_modes[mode_id]}', got '{mode_name}'"
                
                # Verify NO quantum language in mode names
                assert 'quantum' not in mode_name.lower(), \
                    f"Mode {mode_id} should NOT have quantum in name: {mode_name}"
        
        print("✓ All coach modes have ORIGINAL names (no quantum language)")


class TestQuantumFeaturesStillWork:
    """Verify quantum features still work as additive avenue"""
    
    def test_quantum_principles_api(self):
        """GET /api/ai-visuals/quantum-principles should return 8 principles and 5 meditations"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        
        data = response.json()
        principles = data.get('principles', [])
        meditations = data.get('meditations', [])
        
        assert len(principles) == 8, f"Expected 8 quantum principles, got {len(principles)}"
        assert len(meditations) == 5, f"Expected 5 quantum meditations, got {len(meditations)}"
        
        # Verify principle IDs
        expected_principle_ids = [
            'superposition', 'entanglement', 'wave_particle_duality', 
            'observer_effect', 'quantum_tunneling', 'uncertainty_principle',
            'quantum_coherence', 'zero_point_field'
        ]
        actual_ids = [p.get('id') for p in principles]
        for pid in expected_principle_ids:
            assert pid in actual_ids, f"Missing quantum principle: {pid}"
        
        print("✓ Quantum principles API returns 8 principles and 5 meditations")


class TestNotificationsStillWork:
    """Verify push notifications still work"""
    
    def test_vapid_public_key(self):
        """GET /api/notifications/vapid-public-key should return a key"""
        response = requests.get(f"{BASE_URL}/api/notifications/vapid-public-key")
        assert response.status_code == 200
        
        data = response.json()
        assert 'public_key' in data, "Response should contain public_key"
        assert len(data['public_key']) > 0, "Public key should not be empty"
        
        print("✓ VAPID public key endpoint works")
    
    def test_notification_status_unauthenticated(self):
        """GET /api/notifications/status should require auth"""
        response = requests.get(f"{BASE_URL}/api/notifications/status")
        # Should return 401 or 403 for unauthenticated request
        assert response.status_code in [401, 403, 422], \
            f"Expected auth error, got {response.status_code}"
        
        print("✓ Notification status endpoint requires authentication")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """API should be healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('status') == 'ok'
        
        print("✓ API health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Iteration 217 - Cosmic State, Sovereign Math, Sovereign Codex API Tests
Tests for:
- GET /api/cosmic-state (tier-gated unified math endpoint)
- GET /api/math/element-ode (25-point ODE trajectory for Archivist tier)
- GET /api/math/garden-derivative (stability and derivatives)
- POST /api/math/matrix-transform (Rodrigues rotation keyframes)
- POST /api/math/chaos-predict (403 for non-Sovereign users)
- GET /api/codex/entries (tier-filtered entries with locked/unlocked state)
- GET /api/codex/entries?section=mathematics (filters by section)
- GET /api/codex/entries?search=ODE (searches entries)
- GET /api/codex/nano-guide/five-elements-wheel (returns 3 tips)
- GET /api/codex/nano-guide/trade-circle (returns 3 tips)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCosmicStateEndpoints:
    """Tests for the unified cosmic state and sovereign math endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        # Test user: grad_test_522@test.com / password (Archivist tier)
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            self.token = login_res.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate test user")
    
    def test_cosmic_state_returns_tier_gated_data(self):
        """GET /api/cosmic-state returns tier-gated data bundle"""
        res = requests.get(f"{BASE_URL}/api/cosmic-state", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        # Basic fields for all tiers
        assert "tier" in data
        assert "tier_index" in data
        assert "energies" in data
        assert "stability" in data
        assert "total_rate_of_change" in data
        assert "garden_masses" in data
        
        # Energies should have all 5 elements
        energies = data["energies"]
        assert "Wood" in energies
        assert "Fire" in energies
        assert "Earth" in energies
        assert "Metal" in energies
        assert "Water" in energies
        
        # Stability should be one of: stable, shifting, volatile
        assert data["stability"] in ["stable", "shifting", "volatile"]
        
        print(f"Cosmic state tier: {data['tier']} (index {data['tier_index']})")
        print(f"Stability: {data['stability']}, Total rate of change: {data['total_rate_of_change']}")
    
    def test_cosmic_state_archivist_has_trajectory(self):
        """Archivist tier should have trajectory and analysis in cosmic-state"""
        res = requests.get(f"{BASE_URL}/api/cosmic-state", headers=self.headers)
        assert res.status_code == 200
        
        data = res.json()
        tier_idx = data.get("tier_index", 0)
        
        # Archivist is tier_index 2
        if tier_idx >= 2:
            assert "trajectory" in data, "Archivist should have trajectory"
            assert "analysis" in data, "Archivist should have analysis"
            assert "ode_params" in data, "Archivist should have ode_params"
            
            # Trajectory should have 25 points (24 hours + initial)
            trajectory = data["trajectory"]
            assert len(trajectory) == 25, f"Expected 25 trajectory points, got {len(trajectory)}"
            
            # Each trajectory point should have hour and state
            assert "hour" in trajectory[0]
            assert "state" in trajectory[0]
            
            print(f"Trajectory has {len(trajectory)} points")
            print(f"ODE params: {data['ode_params']}")
        else:
            print(f"User tier {data['tier']} (idx {tier_idx}) - trajectory not expected")
    
    def test_cosmic_state_synthesizer_has_derivatives(self):
        """Synthesizer+ tier should have derivatives and deviations"""
        res = requests.get(f"{BASE_URL}/api/cosmic-state", headers=self.headers)
        assert res.status_code == 200
        
        data = res.json()
        tier_idx = data.get("tier_index", 0)
        
        # Synthesizer is tier_index 1+
        if tier_idx >= 1:
            assert "derivatives" in data, "Synthesizer+ should have derivatives"
            assert "deviations" in data, "Synthesizer+ should have deviations"
            
            derivatives = data["derivatives"]
            assert "Wood" in derivatives
            assert "Fire" in derivatives
            
            print(f"Derivatives: {derivatives}")
        else:
            print(f"User tier {data['tier']} (idx {tier_idx}) - derivatives not expected")
    
    def test_element_ode_returns_trajectory(self):
        """GET /api/math/element-ode returns 25-point ODE trajectory for Archivist"""
        res = requests.get(f"{BASE_URL}/api/math/element-ode", headers=self.headers)
        
        # Should return 200 for Archivist tier or 403 for lower tiers
        if res.status_code == 403:
            print(f"User tier too low for element-ode: {res.json().get('detail')}")
            pytest.skip("User tier below Archivist")
        
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "trajectory" in data
        assert "analysis" in data
        assert "garden_masses" in data
        assert "tier" in data
        assert "model" in data
        assert "parameters" in data
        
        # Trajectory should have 25 points
        trajectory = data["trajectory"]
        assert len(trajectory) == 25, f"Expected 25 trajectory points, got {len(trajectory)}"
        
        # Analysis should have all 5 elements
        analysis = data["analysis"]
        for elem in ["Wood", "Fire", "Earth", "Metal", "Water"]:
            assert elem in analysis
            assert "peak_hour" in analysis[elem]
            assert "peak_value" in analysis[elem]
            assert "trough_hour" in analysis[elem]
            assert "trough_value" in analysis[elem]
            assert "amplitude" in analysis[elem]
        
        print(f"Element ODE model: {data['model']}")
        print(f"Parameters: {data['parameters']}")
    
    def test_garden_derivative_returns_stability(self):
        """GET /api/math/garden-derivative returns stability and derivatives"""
        res = requests.get(f"{BASE_URL}/api/math/garden-derivative", headers=self.headers)
        
        # Should return 200 for Synthesizer+ or 403 for Observer
        if res.status_code == 403:
            print(f"User tier too low for garden-derivative: {res.json().get('detail')}")
            pytest.skip("User tier below Synthesizer")
        
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "current_hour" in data
        assert "element_energies" in data
        assert "derivatives" in data
        assert "deviations_from_mean" in data
        assert "total_rate_of_change" in data
        assert "stability" in data
        assert "tier" in data
        
        # Stability should be one of: stable, shifting, volatile
        assert data["stability"] in ["stable", "shifting", "volatile"]
        
        # Derivatives should have all 5 elements
        derivatives = data["derivatives"]
        for elem in ["Wood", "Fire", "Earth", "Metal", "Water"]:
            assert elem in derivatives
        
        print(f"Garden derivative stability: {data['stability']}")
        print(f"Total rate of change: {data['total_rate_of_change']}")
    
    def test_matrix_transform_returns_keyframes(self):
        """POST /api/math/matrix-transform returns Rodrigues rotation keyframes"""
        payload = {
            "source_ra": 0.0,
            "source_dec": 0.0,
            "target_ra": 6.0,
            "target_dec": 45.0,
            "radius": 50.0,
            "steps": 20
        }
        res = requests.post(f"{BASE_URL}/api/math/matrix-transform", json=payload, headers=self.headers)
        
        # Should return 200 for Synthesizer+ or 403 for Observer
        if res.status_code == 403:
            print(f"User tier too low for matrix-transform: {res.json().get('detail')}")
            pytest.skip("User tier below Synthesizer")
        
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "source" in data
        assert "target" in data
        assert "rotation_axis" in data
        assert "total_angle_degrees" in data
        assert "keyframes" in data
        assert "model" in data
        assert "tier" in data
        
        # Keyframes should have steps+1 entries
        keyframes = data["keyframes"]
        assert len(keyframes) == 21, f"Expected 21 keyframes (20 steps + 1), got {len(keyframes)}"
        
        # Each keyframe should have t, t_eased, position, angle
        for kf in keyframes:
            assert "t" in kf
            assert "t_eased" in kf
            assert "position" in kf
            assert "angle" in kf
            assert len(kf["position"]) == 3  # x, y, z
        
        print(f"Matrix transform model: {data['model']}")
        print(f"Total angle: {data['total_angle_degrees']} degrees")
        print(f"Rotation axis: {data['rotation_axis']}")
    
    def test_chaos_predict_returns_403_for_non_sovereign(self):
        """POST /api/math/chaos-predict returns 403 for non-Sovereign users"""
        payload = {
            "frequency": 528.0,
            "perturbation": 0.01
        }
        res = requests.post(f"{BASE_URL}/api/math/chaos-predict", json=payload, headers=self.headers)
        
        # Archivist tier (index 2) should get 403 - Sovereign is tier 4
        if res.status_code == 200:
            # User is Sovereign tier - verify response structure
            data = res.json()
            assert "frequency" in data
            assert "lyapunov_estimate" in data
            assert "sensitivity" in data
            assert "prediction" in data
            print(f"User is Sovereign tier - chaos predict returned: {data['sensitivity']}")
        else:
            assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
            detail = res.json().get("detail", "")
            assert "Sovereign" in detail, f"Error should mention Sovereign tier: {detail}"
            print(f"Correctly returned 403: {detail}")


class TestSovereignCodexEndpoints:
    """Tests for the Sovereign Codex help system endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            self.token = login_res.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate test user")
    
    def test_codex_entries_returns_tier_filtered_entries(self):
        """GET /api/codex/entries returns tier-filtered entries with locked/unlocked state"""
        res = requests.get(f"{BASE_URL}/api/codex/entries", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "entries" in data
        assert "total" in data
        assert "tier" in data
        assert "sections" in data
        
        entries = data["entries"]
        assert len(entries) > 0, "Should have at least some entries"
        
        # Each entry should have locked field
        for entry in entries:
            assert "id" in entry
            assert "title" in entry
            assert "summary" in entry
            assert "tier" in entry
            assert "locked" in entry
            assert isinstance(entry["locked"], bool)
        
        # Count locked vs unlocked
        locked_count = sum(1 for e in entries if e["locked"])
        unlocked_count = sum(1 for e in entries if not e["locked"])
        
        print(f"User tier: {data['tier']}")
        print(f"Total entries: {data['total']}, Locked: {locked_count}, Unlocked: {unlocked_count}")
        print(f"Sections: {data['sections']}")
    
    def test_codex_entries_filter_by_section(self):
        """GET /api/codex/entries?section=mathematics filters by section"""
        res = requests.get(f"{BASE_URL}/api/codex/entries?section=mathematics", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        entries = data["entries"]
        
        # All entries should be in mathematics section
        for entry in entries:
            assert entry["section"] == "mathematics", f"Entry {entry['id']} has section {entry['section']}, expected mathematics"
        
        print(f"Mathematics section entries: {len(entries)}")
        for e in entries:
            print(f"  - {e['title']} ({e['tier']}) {'[LOCKED]' if e['locked'] else ''}")
    
    def test_codex_entries_search(self):
        """GET /api/codex/entries?search=ODE searches entries"""
        res = requests.get(f"{BASE_URL}/api/codex/entries?search=ODE", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        entries = data["entries"]
        
        # Should find at least one entry with ODE in title/summary/tags
        assert len(entries) > 0, "Should find at least one ODE-related entry"
        
        print(f"Search 'ODE' found {len(entries)} entries:")
        for e in entries:
            print(f"  - {e['title']}")
    
    def test_nano_guide_five_elements_wheel(self):
        """GET /api/codex/nano-guide/five-elements-wheel returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/five-elements-wheel", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
        for i, tip in enumerate(data["tips"], 1):
            print(f"  {i}. {tip}")
    
    def test_nano_guide_trade_circle(self):
        """GET /api/codex/nano-guide/trade-circle returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/trade-circle", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
        for i, tip in enumerate(data["tips"], 1):
            print(f"  {i}. {tip}")
    
    def test_nano_guide_mission_control(self):
        """GET /api/codex/nano-guide/mission-control returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/mission-control", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
    
    def test_nano_guide_star_chart(self):
        """GET /api/codex/nano-guide/star-chart returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/star-chart", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
    
    def test_nano_guide_suanpan_mixer(self):
        """GET /api/codex/nano-guide/suanpan-mixer returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/suanpan-mixer", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
    
    def test_nano_guide_botany(self):
        """GET /api/codex/nano-guide/botany returns 3 tips"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/botany", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        assert len(data["tips"]) == 3, f"Expected 3 tips, got {len(data['tips'])}"
        
        print(f"Nano-guide: {data['title']}")
    
    def test_nano_guide_unknown_returns_fallback(self):
        """GET /api/codex/nano-guide/unknown-id returns fallback"""
        res = requests.get(f"{BASE_URL}/api/codex/nano-guide/unknown-id", headers=self.headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "title" in data
        assert "tips" in data
        # Fallback should have at least 1 tip
        assert len(data["tips"]) >= 1
        
        print(f"Unknown guide fallback: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

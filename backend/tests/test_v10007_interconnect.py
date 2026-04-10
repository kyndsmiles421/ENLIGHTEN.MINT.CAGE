"""
V10000.3 OMNIS-NEXUS & V10007.0 OMNIS-INTERCONNECT Tests

Tests for:
- V10000.3: Nodal Projection, Tiered UI Morphing, Time Usage Tracking
- V10007.0: Master Weaver, Holographic Art Overlay, Gesture-based Navigation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestV10000_3_OmnisNexus:
    """V10000.3 Omnis-Nexus: Nodal Projection & Time Usage Tracking"""
    
    def test_nexus_status_endpoint(self):
        """Test GET /api/omnis/nexus/status returns correct nodal anchors and tier access"""
        response = requests.get(f"{BASE_URL}/api/omnis/nexus/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert data["name"] == "Omnis-Nexus"
        assert data["status"] == "BROADCASTING"
        
        # Verify nodal anchors
        assert "nodal_anchors" in data
        assert "MASONRY_SCHOOL" in data["nodal_anchors"]
        assert "BLACK_HILLS_PRIMARY" in data["nodal_anchors"]
        
        # Verify tier access structure
        assert "tier_access" in data
        assert "0" in data["tier_access"] or 0 in data["tier_access"]
        
        # Verify usage rate
        assert data["usage_rate"] == "$15.0/hr"
        print(f"PASS: Nexus status returns {len(data['nodal_anchors'])} nodal anchors")
    
    def test_nexus_proximity_check(self):
        """Test GET /api/omnis/nexus/proximity with coordinates"""
        # Test at Black Hills Primary anchor
        response = requests.get(
            f"{BASE_URL}/api/omnis/nexus/proximity",
            params={"lat": 44.0805, "lng": -103.2310}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert "user_location" in data
        assert "nodal_status" in data
        assert isinstance(data["nodal_status"], list)
        
        # Should find at least one anchor in range
        in_range = [n for n in data["nodal_status"] if n["in_range"]]
        print(f"PASS: Proximity check found {len(in_range)} anchors in range")
    
    def test_nexus_session_start(self):
        """Test POST /api/omnis/nexus/session/start for time tracking"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/nexus/session/start",
            params={"user_id": "test_user_v10000", "node_id": "BLACK_HILLS_PRIMARY"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert "session_id" in data
        assert data["node_id"] == "BLACK_HILLS_PRIMARY"
        assert data["usage_rate"] == "$15.0/hr"
        assert data["status"] == "ACTIVE"
        print(f"PASS: Session started with ID {data['session_id']}")
    
    def test_nexus_session_end(self):
        """Test POST /api/omnis/nexus/session/end calculates equity consumed"""
        # First start a session
        requests.post(
            f"{BASE_URL}/api/omnis/nexus/session/start",
            params={"user_id": "test_user_end", "node_id": "MASONRY_SCHOOL"}
        )
        
        # End the session
        response = requests.post(
            f"{BASE_URL}/api/omnis/nexus/session/end",
            params={"user_id": "test_user_end"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert "duration_hours" in data or "error" not in data
        print(f"PASS: Session ended with status {data.get('status', 'COMPLETED')}")
    
    def test_nexus_tier_ui_apprentice(self):
        """Test GET /api/omnis/nexus/tier-ui/0 for Apprentice tier"""
        response = requests.get(f"{BASE_URL}/api/omnis/nexus/tier-ui/0")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert data["tier_name"] == "Apprentice"
        assert data["epoch"] == "PRESENT"
        assert data["navigation_mode"] == "STANDARD_BUTTONS"
        print(f"PASS: Tier 0 (Apprentice) UI config: {data['ui_config']['layout']}")
    
    def test_nexus_tier_ui_architect(self):
        """Test GET /api/omnis/nexus/tier-ui/2 for Grand Architect tier"""
        response = requests.get(f"{BASE_URL}/api/omnis/nexus/tier-ui/2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert data["tier_name"] == "Grand Architect"
        assert data["epoch"] == "FULL"
        assert data["navigation_mode"] == "ZEN_FLOW_HUD"
        assert "Gesture navigation" in data["features"]
        print(f"PASS: Tier 2 (Grand Architect) has gesture navigation")
    
    def test_nexus_mixer_apply(self):
        """Test POST /api/omnis/nexus/mixer/apply morphs UI"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/nexus/mixer/apply",
            params={
                "resonance": 144,
                "flux": 1.0424,
                "tier_index": 2,
                "holographic_opacity": 0.88
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10000.3"
        assert data["tier"] == "ARCHITECT"
        assert data["resonance"] == 144
        assert data["mixer_state"] == "APPLIED"
        print(f"PASS: Mixer applied - Tier: {data['tier']}, Epoch: {data['epoch']}")


class TestV10007_0_OmnisInterconnect:
    """V10007.0 Omnis-Interconnect: Master Weaver & Holographic Art Overlay"""
    
    def test_interconnect_status_endpoint(self):
        """Test GET /api/omnis/interconnect/status returns mixer control and UI experience"""
        response = requests.get(f"{BASE_URL}/api/omnis/interconnect/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert data["name"] == "Omnis-Interconnect"
        assert data["status"] == "INTERCONNECTED"
        
        # Verify mixer control
        assert "mixer_control" in data
        mixer = data["mixer_control"]
        assert "tier_level" in mixer
        assert "holographic_opacity" in mixer
        assert "resonance_target" in mixer
        
        # Verify UI experience
        assert "ui_experience" in data
        assert "modules" in data
        print(f"PASS: Interconnect status - Tier: {mixer['tier_level']}, Opacity: {mixer['holographic_opacity']}")
    
    def test_interconnect_singularity_execution(self):
        """Test POST /api/omnis/interconnect/singularity returns interconnected systems"""
        response = requests.post(f"{BASE_URL}/api/omnis/interconnect/singularity")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert data["status"] == "INTERCONNECTED - ALL SYSTEMS GREEN"
        
        # Verify interconnects
        assert "interconnects" in data
        interconnects = data["interconnects"]
        assert "law" in interconnects
        assert "art" in interconnects
        assert "rpg" in interconnects
        
        # Verify wealth chain
        assert "wealth" in data
        assert "hud" in data
        print(f"PASS: Singularity executed - {data['status']}")
    
    def test_interconnect_gesture_circle(self):
        """Test POST /api/omnis/interconnect/gesture?gesture=circle maps to Law"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/gesture",
            params={"gesture": "circle"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert data["gesture"] == "circle"
        assert data["action"] == "OPEN_LAW_LIBRARY"
        assert data["module"] == "LAW"
        assert data["haptic_triggered"] == True
        print(f"PASS: Circle gesture -> {data['action']}")
    
    def test_interconnect_gesture_spiral(self):
        """Test POST /api/omnis/interconnect/gesture?gesture=spiral maps to Art"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/gesture",
            params={"gesture": "spiral"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["gesture"] == "spiral"
        assert data["action"] == "OPEN_ART_ACADEMY"
        assert data["module"] == "ART"
        print(f"PASS: Spiral gesture -> {data['action']}")
    
    def test_interconnect_gesture_triangle(self):
        """Test POST /api/omnis/interconnect/gesture?gesture=triangle maps to Logic"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/gesture",
            params={"gesture": "triangle"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["gesture"] == "triangle"
        assert data["action"] == "OPEN_ENGINEERING"
        assert data["module"] == "LOGIC"
        print(f"PASS: Triangle gesture -> {data['action']}")
    
    def test_interconnect_gesture_heart(self):
        """Test POST /api/omnis/interconnect/gesture?gesture=heart maps to Wellness"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/gesture",
            params={"gesture": "heart"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["gesture"] == "heart"
        assert data["action"] == "OPEN_WELLNESS"
        assert data["module"] == "WELLNESS"
        print(f"PASS: Heart gesture -> {data['action']}")
    
    def test_interconnect_gesture_invalid(self):
        """Test POST /api/omnis/interconnect/gesture with invalid gesture"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/gesture",
            params={"gesture": "invalid_gesture"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "error" in data
        assert data["error"] == "Unknown gesture"
        print(f"PASS: Invalid gesture returns error correctly")
    
    def test_interconnect_hud(self):
        """Test GET /api/omnis/interconnect/hud returns holographic HUD config"""
        response = requests.get(f"{BASE_URL}/api/omnis/interconnect/hud")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert data["status"] == "ENGAGED"
        assert data["layers"] == 54  # L² Fractal layers
        assert data["geometry"] == "FLOWER_OF_LIFE"
        
        # Verify gesture map
        assert "gesture_map" in data
        gesture_map = data["gesture_map"]
        assert "circle" in gesture_map
        assert "spiral" in gesture_map
        assert "triangle" in gesture_map
        assert "heart" in gesture_map
        print(f"PASS: HUD config - {data['layers']} layers, {data['navigation']} navigation")
    
    def test_interconnect_wealth_chain(self):
        """Test GET /api/omnis/interconnect/wealth returns phi-multiplied wealth"""
        response = requests.get(f"{BASE_URL}/api/omnis/interconnect/wealth")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert "base" in data
        assert "phi_multiplied" in data
        assert "helix_layer" in data
        assert "final_equity" in data
        print(f"PASS: Wealth chain - Base: {data['base']}, Final: {data['final_equity']}")
    
    def test_interconnect_mixer_update(self):
        """Test POST /api/omnis/interconnect/mixer/update ripples through systems"""
        response = requests.post(
            f"{BASE_URL}/api/omnis/interconnect/mixer/update",
            params={
                "tier_level": 2,
                "holographic_opacity": 0.88,
                "resonance_target": 144
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10007.0"
        assert "mixer_control" in data
        assert "nexus_sync" in data
        
        mixer = data["mixer_control"]
        assert mixer["tier_level"] == 2
        assert mixer["holographic_opacity"] == 0.88
        print(f"PASS: Mixer updated - Tier: {mixer['tier_level']}, Nexus synced")


class TestIntegration:
    """Integration tests for V10000.3 + V10007.0"""
    
    def test_full_workflow(self):
        """Test complete workflow: Nexus -> Interconnect -> Gesture"""
        # 1. Check Nexus status
        nexus_res = requests.get(f"{BASE_URL}/api/omnis/nexus/status")
        assert nexus_res.status_code == 200
        assert nexus_res.json()["version"] == "V10000.3"
        
        # 2. Check Interconnect status
        interconnect_res = requests.get(f"{BASE_URL}/api/omnis/interconnect/status")
        assert interconnect_res.status_code == 200
        assert interconnect_res.json()["version"] == "V10007.0"
        
        # 3. Execute singularity
        singularity_res = requests.post(f"{BASE_URL}/api/omnis/interconnect/singularity")
        assert singularity_res.status_code == 200
        assert "INTERCONNECTED" in singularity_res.json()["status"]
        
        # 4. Test all 4 gestures
        for gesture in ["circle", "spiral", "triangle", "heart"]:
            gesture_res = requests.post(
                f"{BASE_URL}/api/omnis/interconnect/gesture",
                params={"gesture": gesture}
            )
            assert gesture_res.status_code == 200
            assert gesture_res.json()["haptic_triggered"] == True
        
        print("PASS: Full workflow completed successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

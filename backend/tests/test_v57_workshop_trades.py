"""
V57.0 Workshop Trade Tests — Masonry & Carpentry Workbenches
Tests the new 3D Circular Workshop endpoints for both trade pillars.
All endpoints are open to guests (no auth required).
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMasonryWorkshop:
    """Masonry Workshop endpoint tests — 6 stones, 9 tools, tool-action"""
    
    def test_get_masonry_stones_returns_6_stones(self):
        """GET /api/workshop/masonry/stones returns 6 stones with dive_layers"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/stones")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stones" in data, "Response should contain 'stones' key"
        stones = data["stones"]
        assert len(stones) == 6, f"Expected 6 stones, got {len(stones)}"
        
        # Verify expected stone IDs
        stone_ids = [s["id"] for s in stones]
        expected_ids = ["granite", "marble", "limestone", "slate", "sandstone", "basalt"]
        for expected_id in expected_ids:
            assert expected_id in stone_ids, f"Missing stone: {expected_id}"
        
        # Verify dive_layers structure (6 depth levels L0-L5)
        for stone in stones:
            assert "dive_layers" in stone, f"Stone {stone['id']} missing dive_layers"
            assert len(stone["dive_layers"]) == 6, f"Stone {stone['id']} should have 6 dive layers"
            assert "color" in stone, f"Stone {stone['id']} missing color"
            assert "mohs_hardness" in stone, f"Stone {stone['id']} missing mohs_hardness"
            assert "density_kg_m3" in stone, f"Stone {stone['id']} missing density_kg_m3"
            assert "compressive_mpa" in stone, f"Stone {stone['id']} missing compressive_mpa"
    
    def test_get_masonry_tools_returns_9_tools(self):
        """GET /api/workshop/masonry/tools returns 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/tools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tools" in data, "Response should contain 'tools' key"
        tools = data["tools"]
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        
        # Verify expected tool IDs
        tool_ids = [t["id"] for t in tools]
        expected_ids = ["trowel", "mash_hammer", "chisel", "square", "level", 
                       "plumb_bob", "jointer", "bolster", "pitching_tool"]
        for expected_id in expected_ids:
            assert expected_id in tool_ids, f"Missing tool: {expected_id}"
        
        # Verify tool structure
        for tool in tools:
            assert "name" in tool, f"Tool {tool['id']} missing name"
            assert "action_verb" in tool, f"Tool {tool['id']} missing action_verb"
            assert "description" in tool, f"Tool {tool['id']} missing description"
            assert "technique" in tool, f"Tool {tool['id']} missing technique"
            assert "color" in tool, f"Tool {tool['id']} missing color"
            assert "xp_per_action" in tool, f"Tool {tool['id']} missing xp_per_action"
            assert "icon_symbol" in tool, f"Tool {tool['id']} missing icon_symbol"
    
    def test_masonry_tool_action_returns_tutorial_context(self):
        """POST /api/workshop/masonry/tool-action returns action + tutorial_context"""
        payload = {
            "tool_id": "chisel",
            "stone_id": "granite"
        }
        response = requests.post(f"{BASE_URL}/api/workshop/masonry/tool-action", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "action" in data, "Response should contain 'action'"
        assert "tool" in data, "Response should contain 'tool'"
        assert "stone" in data, "Response should contain 'stone'"
        assert "xp_awarded" in data, "Response should contain 'xp_awarded'"
        assert "tutorial_context" in data, "Response should contain 'tutorial_context'"
        
        # Verify values
        assert data["tool"] == "Point Chisel", f"Expected 'Point Chisel', got {data['tool']}"
        assert data["stone"] == "Granite", f"Expected 'Granite', got {data['stone']}"
        assert data["xp_awarded"] == 12, f"Expected 12 XP, got {data['xp_awarded']}"
        assert "Carve" in data["action"], f"Action should contain 'Carve'"
        assert len(data["tutorial_context"]) > 50, "tutorial_context should be substantial"
    
    def test_masonry_tool_action_invalid_tool(self):
        """POST /api/workshop/masonry/tool-action with invalid tool returns error"""
        payload = {
            "tool_id": "invalid_tool",
            "stone_id": "granite"
        }
        response = requests.post(f"{BASE_URL}/api/workshop/masonry/tool-action", json=payload)
        assert response.status_code == 200  # Returns 200 with error in body
        
        data = response.json()
        assert "error" in data, "Should return error for invalid tool"
    
    def test_masonry_stone_detail(self):
        """GET /api/workshop/masonry/stone/{stone_id} returns detailed stone data"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/stone/marble")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stone" in data, "Response should contain 'stone'"
        stone = data["stone"]
        assert stone["id"] == "marble"
        assert stone["name"] == "Marble"
        assert len(stone["dive_layers"]) == 6


class TestCarpentryWorkshop:
    """Carpentry Workshop endpoint tests — 6 woods, 9 tools, tool-action"""
    
    def test_get_carpentry_woods_returns_6_woods(self):
        """GET /api/workshop/carpentry/woods returns 6 woods with dive_layers"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/woods")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "woods" in data, "Response should contain 'woods' key"
        woods = data["woods"]
        assert len(woods) == 6, f"Expected 6 woods, got {len(woods)}"
        
        # Verify expected wood IDs
        wood_ids = [w["id"] for w in woods]
        expected_ids = ["oak", "walnut", "pine", "cherry", "maple", "cedar"]
        for expected_id in expected_ids:
            assert expected_id in wood_ids, f"Missing wood: {expected_id}"
        
        # Verify dive_layers structure (6 depth levels L0-L5)
        for wood in woods:
            assert "dive_layers" in wood, f"Wood {wood['id']} missing dive_layers"
            assert len(wood["dive_layers"]) == 6, f"Wood {wood['id']} should have 6 dive layers"
            assert "color" in wood, f"Wood {wood['id']} missing color"
            assert "janka_hardness" in wood, f"Wood {wood['id']} missing janka_hardness"
            assert "density_kg_m3" in wood, f"Wood {wood['id']} missing density_kg_m3"
            assert "bending_mpa" in wood, f"Wood {wood['id']} missing bending_mpa"
    
    def test_get_carpentry_tools_returns_9_tools(self):
        """GET /api/workshop/carpentry/tools returns 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/tools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tools" in data, "Response should contain 'tools' key"
        tools = data["tools"]
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        
        # Verify expected tool IDs
        tool_ids = [t["id"] for t in tools]
        expected_ids = ["hand_saw", "hand_plane", "wood_chisel", "mallet", 
                       "marking_gauge", "spokeshave", "coping_saw", "brace_bit", "try_square"]
        for expected_id in expected_ids:
            assert expected_id in tool_ids, f"Missing tool: {expected_id}"
        
        # Verify tool structure
        for tool in tools:
            assert "name" in tool, f"Tool {tool['id']} missing name"
            assert "action_verb" in tool, f"Tool {tool['id']} missing action_verb"
            assert "description" in tool, f"Tool {tool['id']} missing description"
            assert "technique" in tool, f"Tool {tool['id']} missing technique"
            assert "color" in tool, f"Tool {tool['id']} missing color"
            assert "xp_per_action" in tool, f"Tool {tool['id']} missing xp_per_action"
            assert "icon_symbol" in tool, f"Tool {tool['id']} missing icon_symbol"
    
    def test_carpentry_tool_action_returns_tutorial_context(self):
        """POST /api/workshop/carpentry/tool-action returns action + tutorial_context"""
        payload = {
            "tool_id": "hand_plane",
            "wood_id": "oak"
        }
        response = requests.post(f"{BASE_URL}/api/workshop/carpentry/tool-action", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "action" in data, "Response should contain 'action'"
        assert "tool" in data, "Response should contain 'tool'"
        assert "wood" in data, "Response should contain 'wood'"
        assert "xp_awarded" in data, "Response should contain 'xp_awarded'"
        assert "tutorial_context" in data, "Response should contain 'tutorial_context'"
        
        # Verify values
        assert data["tool"] == "Smoothing Plane", f"Expected 'Smoothing Plane', got {data['tool']}"
        assert data["wood"] == "White Oak", f"Expected 'White Oak', got {data['wood']}"
        assert data["xp_awarded"] == 12, f"Expected 12 XP, got {data['xp_awarded']}"
        assert "Plane" in data["action"], f"Action should contain 'Plane'"
        assert len(data["tutorial_context"]) > 50, "tutorial_context should be substantial"
    
    def test_carpentry_tool_action_invalid_wood(self):
        """POST /api/workshop/carpentry/tool-action with invalid wood returns error"""
        payload = {
            "tool_id": "hand_saw",
            "wood_id": "invalid_wood"
        }
        response = requests.post(f"{BASE_URL}/api/workshop/carpentry/tool-action", json=payload)
        assert response.status_code == 200  # Returns 200 with error in body
        
        data = response.json()
        assert "error" in data, "Should return error for invalid wood"


class TestWorkshopNoAuth:
    """Verify all workshop endpoints work without authentication (guest mode)"""
    
    def test_masonry_stones_no_auth(self):
        """Masonry stones endpoint accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/stones")
        assert response.status_code == 200
        assert "stones" in response.json()
    
    def test_masonry_tools_no_auth(self):
        """Masonry tools endpoint accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/tools")
        assert response.status_code == 200
        assert "tools" in response.json()
    
    def test_masonry_tool_action_no_auth(self):
        """Masonry tool-action endpoint accessible without auth"""
        response = requests.post(f"{BASE_URL}/api/workshop/masonry/tool-action", 
                                json={"tool_id": "trowel", "stone_id": "limestone"})
        assert response.status_code == 200
        assert "tutorial_context" in response.json()
    
    def test_carpentry_woods_no_auth(self):
        """Carpentry woods endpoint accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/woods")
        assert response.status_code == 200
        assert "woods" in response.json()
    
    def test_carpentry_tools_no_auth(self):
        """Carpentry tools endpoint accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/tools")
        assert response.status_code == 200
        assert "tools" in response.json()
    
    def test_carpentry_tool_action_no_auth(self):
        """Carpentry tool-action endpoint accessible without auth"""
        response = requests.post(f"{BASE_URL}/api/workshop/carpentry/tool-action",
                                json={"tool_id": "mallet", "wood_id": "cherry"})
        assert response.status_code == 200
        assert "tutorial_context" in response.json()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

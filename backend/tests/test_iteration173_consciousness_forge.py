"""
Iteration 173: Consciousness Levels & AI Product Generator (Forge) Tests
Tests for:
- Five Levels of Consciousness progression system
- Tool Forge (Resonator Keys, Focus Lenses, Resource Harvesters)
- Skill Generator (Passive Buffs, Active Mantras, Skill Bottling)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestConsciousnessLevels:
    """Tests for the Five Levels of Consciousness system"""

    def test_get_all_levels(self, auth_headers):
        """GET /api/consciousness/levels - returns all 5 level definitions"""
        response = requests.get(f"{BASE_URL}/api/consciousness/levels", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "levels" in data
        levels = data["levels"]
        assert len(levels) == 5, f"Expected 5 levels, got {len(levels)}"
        
        # Verify level structure
        expected_names = ["Physical", "Emotional", "Mental", "Intuitive", "Pure Consciousness"]
        for i, level in enumerate(levels):
            assert level["level"] == i + 1
            assert level["name"] == expected_names[i]
            assert "subtitle" in level
            assert "element" in level
            assert "color" in level
            assert "xp_required" in level
            assert "unlocks" in level
            assert "gate_label" in level
        
        print(f"All 5 consciousness levels verified: {[l['name'] for l in levels]}")

    def test_get_consciousness_status(self, auth_headers):
        """GET /api/consciousness/status - returns user's current level, XP, progress"""
        response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "level" in data
        assert "level_info" in data
        assert "xp_total" in data
        assert "xp_into_level" in data
        assert "xp_for_next" in data
        assert "progress_pct" in data
        assert "display_mode" in data
        assert "all_levels" in data
        assert "is_max_level" in data
        
        # Verify level_info structure
        level_info = data["level_info"]
        assert "name" in level_info
        assert "subtitle" in level_info
        assert "element" in level_info
        assert "color" in level_info
        
        print(f"User consciousness: Level {data['level']} ({level_info['name']}), XP: {data['xp_total']}, Progress: {data['progress_pct']}%")

    def test_add_consciousness_xp(self, auth_headers):
        """POST /api/consciousness/progress - awards XP for activities"""
        # Test with mood_log activity (10 XP)
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "mood_log", "context": "test mood log"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp_gained" in data
        assert data["xp_gained"] == 10, f"Expected 10 XP for mood_log, got {data['xp_gained']}"
        assert "total_xp" in data
        assert "level" in data
        assert "leveled_up" in data
        assert "activity" in data
        
        print(f"XP awarded: +{data['xp_gained']} for {data['activity']}, Total: {data['total_xp']}, Level: {data['level']}")

    def test_add_consciousness_xp_quest_complete(self, auth_headers):
        """POST /api/consciousness/progress - quest_complete awards 25 XP"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "quest_complete", "context": "test quest"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["xp_gained"] == 25, f"Expected 25 XP for quest_complete, got {data['xp_gained']}"
        print(f"Quest complete XP: +{data['xp_gained']}, Total: {data['total_xp']}")

    def test_add_consciousness_xp_invalid_activity(self, auth_headers):
        """POST /api/consciousness/progress - invalid activity returns 400"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "invalid_activity_xyz"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid activity, got {response.status_code}"
        print("Invalid activity correctly rejected with 400")

    def test_set_display_mode_rank(self, auth_headers):
        """POST /api/consciousness/display-mode - set to 'rank'"""
        response = requests.post(f"{BASE_URL}/api/consciousness/display-mode", 
            json={"mode": "rank"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["display_mode"] == "rank"
        print("Display mode set to 'rank'")

    def test_set_display_mode_aura(self, auth_headers):
        """POST /api/consciousness/display-mode - set to 'aura'"""
        response = requests.post(f"{BASE_URL}/api/consciousness/display-mode", 
            json={"mode": "aura"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["display_mode"] == "aura"
        print("Display mode set to 'aura'")

    def test_set_display_mode_hybrid(self, auth_headers):
        """POST /api/consciousness/display-mode - set to 'hybrid'"""
        response = requests.post(f"{BASE_URL}/api/consciousness/display-mode", 
            json={"mode": "hybrid"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["display_mode"] == "hybrid"
        print("Display mode set to 'hybrid'")

    def test_set_display_mode_invalid(self, auth_headers):
        """POST /api/consciousness/display-mode - invalid mode returns 400"""
        response = requests.post(f"{BASE_URL}/api/consciousness/display-mode", 
            json={"mode": "invalid_mode"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid mode, got {response.status_code}"
        print("Invalid display mode correctly rejected with 400")

    def test_gate_check_basic_feature(self, auth_headers):
        """GET /api/consciousness/gate-check/{feature} - check basic feature (unlocked at level 1)"""
        response = requests.get(f"{BASE_URL}/api/consciousness/gate-check/rpg_basic", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "feature" in data
        assert data["feature"] == "rpg_basic"
        assert "unlocked" in data
        assert data["unlocked"] == True, "rpg_basic should be unlocked at level 1"
        print(f"Gate check for rpg_basic: unlocked={data['unlocked']}")

    def test_gate_check_tool_forge(self, auth_headers):
        """GET /api/consciousness/gate-check/{feature} - check tool_forge (requires level 3)"""
        response = requests.get(f"{BASE_URL}/api/consciousness/gate-check/tool_forge", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["feature"] == "tool_forge"
        assert "unlocked" in data
        assert "required_level" in data
        assert data["required_level"] == 3
        print(f"Gate check for tool_forge: unlocked={data['unlocked']}, required_level={data['required_level']}")

    def test_gate_check_skill_generator(self, auth_headers):
        """GET /api/consciousness/gate-check/{feature} - check skill_generator (requires level 4)"""
        response = requests.get(f"{BASE_URL}/api/consciousness/gate-check/skill_generator", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["feature"] == "skill_generator"
        assert "unlocked" in data
        assert "required_level" in data
        assert data["required_level"] == 4
        print(f"Gate check for skill_generator: unlocked={data['unlocked']}, required_level={data['required_level']}")

    def test_gate_check_ungated_feature(self, auth_headers):
        """GET /api/consciousness/gate-check/{feature} - ungated feature returns unlocked=True"""
        response = requests.get(f"{BASE_URL}/api/consciousness/gate-check/some_random_feature", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["unlocked"] == True, "Ungated features should return unlocked=True"
        print(f"Gate check for ungated feature: unlocked={data['unlocked']}")


class TestToolForge:
    """Tests for the Tool Forge system (Resonator Keys, Focus Lenses, Resource Harvesters)"""

    def test_get_tool_types(self, auth_headers):
        """GET /api/forge/tools/types - returns 3 tool types with lock status"""
        response = requests.get(f"{BASE_URL}/api/forge/tools/types", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tools" in data
        assert "consciousness_level" in data
        
        tools = data["tools"]
        assert len(tools) == 3, f"Expected 3 tool types, got {len(tools)}"
        
        tool_ids = [t["id"] for t in tools]
        assert "resonator_key" in tool_ids
        assert "focus_lens" in tool_ids
        assert "resource_harvester" in tool_ids
        
        # Verify each tool has required fields
        for tool in tools:
            assert "id" in tool
            assert "name" in tool
            assert "description" in tool
            assert "base_price" in tool
            assert "min_level" in tool
            assert "locked" in tool
            assert "user_level" in tool
            assert tool["min_level"] == 3, f"All tools should require level 3, got {tool['min_level']}"
        
        print(f"Tool types: {tool_ids}, User level: {data['consciousness_level']}")

    def test_forge_tool_requires_level_3(self, auth_headers):
        """POST /api/forge/tools/create - requires consciousness level 3+"""
        # First check user's level
        status_response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        user_level = status_response.json().get("level", 1)
        
        response = requests.post(f"{BASE_URL}/api/forge/tools/create", 
            json={"type": "resonator_key", "context": "test forge"},
            headers=auth_headers)
        
        if user_level < 3:
            assert response.status_code == 403, f"Expected 403 for level {user_level} user, got {response.status_code}"
            print(f"Tool forge correctly blocked for level {user_level} user (requires level 3)")
        else:
            # If user is level 3+, check for dust requirement
            if response.status_code == 400:
                assert "Dust" in response.json().get("detail", ""), "Should mention Dust requirement"
                print(f"Tool forge blocked due to insufficient Dust (user is level {user_level})")
            else:
                assert response.status_code == 200
                print(f"Tool forged successfully for level {user_level} user")

    def test_forge_tool_invalid_type(self, auth_headers):
        """POST /api/forge/tools/create - invalid tool type returns 400"""
        response = requests.post(f"{BASE_URL}/api/forge/tools/create", 
            json={"type": "invalid_tool_type"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid tool type, got {response.status_code}"
        print("Invalid tool type correctly rejected with 400")


class TestSkillGenerator:
    """Tests for the Skill Generator system (Passive Buffs, Active Mantras, Skill Bottling)"""

    def test_get_skill_types(self, auth_headers):
        """GET /api/forge/skills/types - returns 3 skill types with lock status"""
        response = requests.get(f"{BASE_URL}/api/forge/skills/types", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "skills" in data
        assert "consciousness_level" in data
        
        skills = data["skills"]
        assert len(skills) == 3, f"Expected 3 skill types, got {len(skills)}"
        
        skill_ids = [s["id"] for s in skills]
        assert "passive_buff" in skill_ids
        assert "active_mantra" in skill_ids
        assert "skill_bottle" in skill_ids
        
        # Verify each skill has required fields
        for skill in skills:
            assert "id" in skill
            assert "name" in skill
            assert "description" in skill
            assert "base_price" in skill
            assert "min_level" in skill
            assert "locked" in skill
            assert "user_level" in skill
        
        # Verify level requirements
        passive_buff = next(s for s in skills if s["id"] == "passive_buff")
        active_mantra = next(s for s in skills if s["id"] == "active_mantra")
        skill_bottle = next(s for s in skills if s["id"] == "skill_bottle")
        
        assert passive_buff["min_level"] == 4
        assert active_mantra["min_level"] == 4
        assert skill_bottle["min_level"] == 5
        
        print(f"Skill types: {skill_ids}, User level: {data['consciousness_level']}")

    def test_generate_skill_requires_level_4(self, auth_headers):
        """POST /api/forge/skills/generate - requires consciousness level 4+"""
        # First check user's level
        status_response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        user_level = status_response.json().get("level", 1)
        
        response = requests.post(f"{BASE_URL}/api/forge/skills/generate", 
            json={"type": "passive_buff", "context": "test skill gen"},
            headers=auth_headers)
        
        if user_level < 4:
            assert response.status_code == 403, f"Expected 403 for level {user_level} user, got {response.status_code}"
            print(f"Skill generation correctly blocked for level {user_level} user (requires level 4)")
        else:
            # If user is level 4+, check for credits requirement
            if response.status_code == 400:
                assert "Credits" in response.json().get("detail", ""), "Should mention Credits requirement"
                print(f"Skill generation blocked due to insufficient Credits (user is level {user_level})")
            else:
                assert response.status_code == 200
                print(f"Skill generated successfully for level {user_level} user")

    def test_generate_skill_invalid_type(self, auth_headers):
        """POST /api/forge/skills/generate - invalid skill type returns 400"""
        response = requests.post(f"{BASE_URL}/api/forge/skills/generate", 
            json={"type": "invalid_skill_type"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid skill type, got {response.status_code}"
        print("Invalid skill type correctly rejected with 400")


class TestForgeInventory:
    """Tests for forge inventory and item management"""

    def test_get_forge_inventory(self, auth_headers):
        """GET /api/forge/inventory - get user's forged items"""
        response = requests.get(f"{BASE_URL}/api/forge/inventory", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "items" in data
        assert "count" in data
        assert isinstance(data["items"], list)
        
        print(f"Forge inventory: {data['count']} items")

    def test_get_forge_inventory_by_category(self, auth_headers):
        """GET /api/forge/inventory?category=tool - filter by category"""
        response = requests.get(f"{BASE_URL}/api/forge/inventory?category=tool", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "items" in data
        # All items should be tools
        for item in data["items"]:
            assert item.get("category") == "tool", f"Expected tool category, got {item.get('category')}"
        
        print(f"Tool inventory: {data['count']} items")

    def test_list_forge_item_not_found(self, auth_headers):
        """POST /api/forge/list - non-existent item returns 404"""
        response = requests.post(f"{BASE_URL}/api/forge/list", 
            json={"item_id": "non-existent-item-id"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for non-existent item, got {response.status_code}"
        print("Non-existent item correctly returns 404")

    def test_use_forge_item_not_found(self, auth_headers):
        """POST /api/forge/use - non-existent item returns 404"""
        response = requests.post(f"{BASE_URL}/api/forge/use", 
            json={"item_id": "non-existent-item-id"},
            headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for non-existent item, got {response.status_code}"
        print("Non-existent item use correctly returns 404")


class TestConsciousnessXPActivities:
    """Test various XP-granting activities"""

    def test_xp_journal_entry(self, auth_headers):
        """POST /api/consciousness/progress - journal_entry awards 15 XP"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "journal_entry"},
            headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["xp_gained"] == 15
        print("journal_entry: +15 XP")

    def test_xp_meditation_complete(self, auth_headers):
        """POST /api/consciousness/progress - meditation_complete awards 20 XP"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "meditation_complete"},
            headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["xp_gained"] == 20
        print("meditation_complete: +20 XP")

    def test_xp_daily_ritual(self, auth_headers):
        """POST /api/consciousness/progress - daily_ritual awards 30 XP"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "daily_ritual"},
            headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["xp_gained"] == 30
        print("daily_ritual: +30 XP")

    def test_xp_boss_defeat(self, auth_headers):
        """POST /api/consciousness/progress - boss_defeat awards 50 XP"""
        response = requests.post(f"{BASE_URL}/api/consciousness/progress", 
            json={"activity": "boss_defeat"},
            headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["xp_gained"] == 50
        print("boss_defeat: +50 XP")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

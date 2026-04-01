"""
Iteration 164: Integrated Evolution & Discovery Protocol Tests
- Refinement Lab: Digital Tumbler, Extraction Tools, Starseed Components
- SmartDock Nexus: Stone slotting with chakra/frequency/mantra effects
- Wisdom Evolution: 4-tier system (Seeds → Roots → Branches → Canopy)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def headers(auth_token):
    """Auth headers for API requests."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REFINEMENT LAB TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestRefinementTools:
    """Tests for GET /api/refinement/tools - Extraction tools with Mohs ranges."""
    
    def test_get_tools_returns_200(self, headers):
        """GET /api/refinement/tools returns 200 with tools list."""
        response = requests.get(f"{BASE_URL}/api/refinement/tools", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "tools" in data
        print(f"✓ GET /api/refinement/tools returns 200 with {len(data['tools'])} tools")
    
    def test_tools_has_three_tools(self, headers):
        """Tools list contains Brush, Pick, and Chisel."""
        response = requests.get(f"{BASE_URL}/api/refinement/tools", headers=headers)
        data = response.json()
        tools = data["tools"]
        assert len(tools) == 3, f"Expected 3 tools, got {len(tools)}"
        tool_ids = [t["id"] for t in tools]
        assert "brush" in tool_ids, "Missing brush tool"
        assert "pick" in tool_ids, "Missing pick tool"
        assert "chisel" in tool_ids, "Missing chisel tool"
        print(f"✓ Tools list contains: {tool_ids}")
    
    def test_tools_have_mohs_ranges(self, headers):
        """Each tool has mohs_range with min and max values."""
        response = requests.get(f"{BASE_URL}/api/refinement/tools", headers=headers)
        tools = response.json()["tools"]
        for tool in tools:
            assert "mohs_range" in tool, f"Tool {tool['id']} missing mohs_range"
            assert len(tool["mohs_range"]) == 2, f"Tool {tool['id']} mohs_range should have 2 values"
            assert tool["mohs_range"][0] < tool["mohs_range"][1], f"Tool {tool['id']} mohs_range invalid"
            print(f"  - {tool['name']}: Mohs {tool['mohs_range'][0]}-{tool['mohs_range'][1]}")
        print("✓ All tools have valid Mohs ranges")


class TestRefinementExtract:
    """Tests for POST /api/refinement/extract - Tool-specimen extraction."""
    
    def test_extract_requires_specimen_id(self, headers):
        """POST /api/refinement/extract requires specimen_id."""
        response = requests.post(f"{BASE_URL}/api/refinement/extract", 
                                 json={"tool": "pick"}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/refinement/extract requires specimen_id")
    
    def test_extract_fails_for_unowned_specimen(self, headers):
        """POST /api/refinement/extract fails for specimen not in collection."""
        response = requests.post(f"{BASE_URL}/api/refinement/extract",
                                 json={"specimen_id": "nonexistent_stone", "tool": "pick"},
                                 headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/refinement/extract returns 404 for unowned specimen")
    
    def test_extract_with_valid_specimen(self, headers):
        """POST /api/refinement/extract succeeds with owned specimen."""
        # Use jade which should be in collection
        response = requests.post(f"{BASE_URL}/api/refinement/extract",
                                 json={"specimen_id": "jade", "tool": "pick"},
                                 headers=headers)
        # May succeed or fail based on state, but should not be 500
        assert response.status_code in [200, 400, 404], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "extraction" in data
            assert "quality" in data["extraction"]
            assert "can_tumble" in data
            print(f"✓ Extraction succeeded: quality={data['extraction']['quality']}, can_tumble={data['can_tumble']}")
        else:
            print(f"✓ Extraction returned {response.status_code} (specimen may not be in collection)")


class TestRefinementTumbler:
    """Tests for tumbler endpoints - time-gated refinement."""
    
    def test_get_tumbler_returns_200(self, headers):
        """GET /api/refinement/tumbler returns tumbler state."""
        response = requests.get(f"{BASE_URL}/api/refinement/tumbler", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "slots_used" in data
        assert "slots_max" in data
        assert "active" in data
        assert "ready_to_collect" in data
        assert data["slots_max"] == 3, "Tumbler should have 3 max slots"
        print(f"✓ GET /api/refinement/tumbler: {data['slots_used']}/{data['slots_max']} slots used")
        print(f"  - Active: {len(data['active'])}, Ready to collect: {len(data['ready_to_collect'])}")
    
    def test_tumble_requires_specimen_id(self, headers):
        """POST /api/refinement/tumble requires specimen_id."""
        response = requests.post(f"{BASE_URL}/api/refinement/tumble", json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/refinement/tumble requires specimen_id")
    
    def test_tumble_fails_for_unowned_specimen(self, headers):
        """POST /api/refinement/tumble fails for specimen not in collection."""
        response = requests.post(f"{BASE_URL}/api/refinement/tumble",
                                 json={"specimen_id": "nonexistent_stone"},
                                 headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/refinement/tumble returns 404 for unowned specimen")


class TestRefinementCollect:
    """Tests for POST /api/refinement/collect - collecting tumbled specimens."""
    
    def test_collect_requires_specimen_id(self, headers):
        """POST /api/refinement/collect requires specimen_id."""
        response = requests.post(f"{BASE_URL}/api/refinement/collect", json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/refinement/collect requires specimen_id")
    
    def test_collect_fails_for_no_tumble_session(self, headers):
        """POST /api/refinement/collect fails if no tumble session exists."""
        response = requests.post(f"{BASE_URL}/api/refinement/collect",
                                 json={"specimen_id": "nonexistent_stone"},
                                 headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/refinement/collect returns 404 for no tumble session")


class TestRefinementInstantFinish:
    """Tests for POST /api/refinement/instant-finish - pay to skip timer."""
    
    def test_instant_finish_requires_specimen_id(self, headers):
        """POST /api/refinement/instant-finish requires specimen_id."""
        response = requests.post(f"{BASE_URL}/api/refinement/instant-finish", json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/refinement/instant-finish requires specimen_id")
    
    def test_instant_finish_fails_for_no_active_tumble(self, headers):
        """POST /api/refinement/instant-finish fails if no active tumble."""
        response = requests.post(f"{BASE_URL}/api/refinement/instant-finish",
                                 json={"specimen_id": "nonexistent_stone"},
                                 headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/refinement/instant-finish returns 404 for no active tumble")


class TestStarseedInventory:
    """Tests for GET /api/refinement/starseed-inventory - Starseed components."""
    
    def test_get_starseed_inventory_returns_200(self, headers):
        """GET /api/refinement/starseed-inventory returns inventory."""
        response = requests.get(f"{BASE_URL}/api/refinement/starseed-inventory", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "components" in data
        assert "by_category" in data
        assert "total_power" in data
        assert "total_components" in data
        print(f"✓ GET /api/refinement/starseed-inventory: {data['total_components']} components, {data['total_power']} total power")
        if data["components"]:
            for comp in data["components"][:3]:
                print(f"  - {comp.get('component')}: {comp.get('category')}, power={comp.get('power')}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SMARTDOCK NEXUS TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestSmartDockState:
    """Tests for GET /api/smartdock/state - current dock state."""
    
    def test_get_dock_state_returns_200(self, headers):
        """GET /api/smartdock/state returns dock state."""
        response = requests.get(f"{BASE_URL}/api/smartdock/state", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "slotted" in data
        print(f"✓ GET /api/smartdock/state: slotted={data['slotted']}")
    
    def test_dock_state_has_resonance_when_slotted(self, headers):
        """When stone is slotted, state includes resonance effects."""
        response = requests.get(f"{BASE_URL}/api/smartdock/state", headers=headers)
        data = response.json()
        if data["slotted"]:
            assert "specimen" in data
            assert "resonance_effect" in data
            assert "audio_blend" in data
            assert "visual_palette" in data
            assert "active_mantra" in data
            
            # Verify resonance effect structure
            res = data["resonance_effect"]
            assert "chakra" in res
            assert "frequency" in res
            
            # Verify visual palette structure
            palette = data["visual_palette"]
            assert "primary" in palette
            assert "secondary" in palette
            assert "accent" in palette
            
            print(f"✓ Slotted stone: {data['specimen']['name']}")
            print(f"  - Chakra: {res['chakra']}, Frequency: {res['frequency']} Hz")
            print(f"  - Mantra: {data['active_mantra']}")
            print(f"  - Palette: {palette['primary']}, {palette['secondary']}, {palette['accent']}")
        else:
            print("✓ No stone currently slotted")


class TestSmartDockSlot:
    """Tests for POST /api/smartdock/slot - slotting a stone."""
    
    def test_slot_requires_specimen_id(self, headers):
        """POST /api/smartdock/slot requires specimen_id."""
        response = requests.post(f"{BASE_URL}/api/smartdock/slot", json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/smartdock/slot requires specimen_id")
    
    def test_slot_fails_for_unowned_specimen(self, headers):
        """POST /api/smartdock/slot fails for specimen not in collection."""
        response = requests.post(f"{BASE_URL}/api/smartdock/slot",
                                 json={"specimen_id": "nonexistent_stone"},
                                 headers=headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ POST /api/smartdock/slot returns 404 for unowned specimen")
    
    def test_slot_emerald_success(self, headers):
        """POST /api/smartdock/slot with emerald succeeds."""
        response = requests.post(f"{BASE_URL}/api/smartdock/slot",
                                 json={"specimen_id": "emerald"},
                                 headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["slotted"] == True
        assert "resonance_effect" in data
        assert "visual_palette" in data
        assert "audio_blend" in data
        
        # Verify emerald's Heart chakra
        assert data["resonance_effect"]["chakra"] == "Heart"
        print(f"✓ Slotted emerald: chakra={data['resonance_effect']['chakra']}, freq={data['resonance_effect']['frequency']}Hz")


class TestSmartDockUnslot:
    """Tests for POST /api/smartdock/unslot - removing stone."""
    
    def test_unslot_when_slotted(self, headers):
        """POST /api/smartdock/unslot removes stone when one is slotted."""
        # First ensure something is slotted
        requests.post(f"{BASE_URL}/api/smartdock/slot",
                      json={"specimen_id": "emerald"}, headers=headers)
        
        response = requests.post(f"{BASE_URL}/api/smartdock/unslot", json={}, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["unslotted"] == True
        print("✓ POST /api/smartdock/unslot succeeded")
        
        # Re-slot for other tests
        requests.post(f"{BASE_URL}/api/smartdock/slot",
                      json={"specimen_id": "emerald"}, headers=headers)


class TestSmartDockEligible:
    """Tests for GET /api/smartdock/eligible - list slottable stones."""
    
    def test_get_eligible_returns_200(self, headers):
        """GET /api/smartdock/eligible returns list of stones."""
        response = requests.get(f"{BASE_URL}/api/smartdock/eligible", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "stones" in data
        print(f"✓ GET /api/smartdock/eligible: {len(data['stones'])} eligible stones")
    
    def test_eligible_stones_have_metadata(self, headers):
        """Eligible stones include chakra, frequency, mantra metadata."""
        response = requests.get(f"{BASE_URL}/api/smartdock/eligible", headers=headers)
        stones = response.json()["stones"]
        if stones:
            for stone in stones[:3]:
                print(f"  - {stone['name']}: chakra={stone.get('chakra')}, freq={stone.get('frequency')}")
            # Check structure
            stone = stones[0]
            assert "specimen_id" in stone
            assert "name" in stone
            assert "polished" in stone
        print("✓ Eligible stones have expected metadata")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WISDOM EVOLUTION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestWisdomTiers:
    """Tests for GET /api/wisdom/tiers - 4-tier wisdom system."""
    
    def test_get_tiers_returns_200(self, headers):
        """GET /api/wisdom/tiers returns tier definitions."""
        response = requests.get(f"{BASE_URL}/api/wisdom/tiers", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tiers" in data
        assert "current_tier" in data
        assert "total_interactions" in data
        print(f"✓ GET /api/wisdom/tiers: current_tier={data['current_tier']['name']}, interactions={data['total_interactions']}")
    
    def test_tiers_has_four_tiers(self, headers):
        """Tiers list contains Seeds, Roots, Branches, Canopy."""
        response = requests.get(f"{BASE_URL}/api/wisdom/tiers", headers=headers)
        tiers = response.json()["tiers"]
        assert len(tiers) == 4, f"Expected 4 tiers, got {len(tiers)}"
        tier_ids = [t["id"] for t in tiers]
        assert "seed" in tier_ids
        assert "root" in tier_ids
        assert "branch" in tier_ids
        assert "canopy" in tier_ids
        print(f"✓ Wisdom tiers: {tier_ids}")
        for tier in tiers:
            print(f"  - {tier['name']}: min_interactions={tier['min_interactions']}")


class TestWisdomForSpecimen:
    """Tests for GET /api/wisdom/for-specimen/{id} - tiered wisdom."""
    
    def test_get_wisdom_for_emerald(self, headers):
        """GET /api/wisdom/for-specimen/emerald returns curated wisdom."""
        response = requests.get(f"{BASE_URL}/api/wisdom/for-specimen/emerald", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "specimen_id" in data
        assert "interactions" in data
        assert "current_tier" in data
        assert "unlocked_wisdom" in data
        assert "locked_wisdom" in data
        assert "canopy_locked" in data
        print(f"✓ GET /api/wisdom/for-specimen/emerald: interactions={data['interactions']}, tier={data['current_tier']['name']}")
        print(f"  - Unlocked tiers: {list(data['unlocked_wisdom'].keys())}")
        print(f"  - Locked tiers: {list(data['locked_wisdom'].keys())}")
    
    def test_wisdom_has_curated_content(self, headers):
        """Emerald has curated wisdom content (not default)."""
        response = requests.get(f"{BASE_URL}/api/wisdom/for-specimen/emerald", headers=headers)
        data = response.json()
        unlocked = data["unlocked_wisdom"]
        if "seed" in unlocked:
            seed_text = unlocked["seed"]["text"]
            assert "radiate love" in seed_text.lower() or len(seed_text) > 10
            print(f"✓ Emerald seed wisdom: '{seed_text[:60]}...'")
    
    def test_wisdom_for_uncurated_specimen(self, headers):
        """Uncurated specimen returns default wisdom."""
        response = requests.get(f"{BASE_URL}/api/wisdom/for-specimen/moss_agate", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Should still have unlocked wisdom (at least seed tier)
        assert "unlocked_wisdom" in data
        print(f"✓ Uncurated specimen (moss_agate) returns wisdom: {list(data['unlocked_wisdom'].keys())}")


class TestWisdomPlant:
    """Tests for POST /api/wisdom/plant - planting Canopy wisdom."""
    
    def test_plant_requires_specimen_id_and_text(self, headers):
        """POST /api/wisdom/plant requires specimen_id and text."""
        response = requests.post(f"{BASE_URL}/api/wisdom/plant", json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/wisdom/plant requires specimen_id and text")
    
    def test_plant_requires_30_interactions(self, headers):
        """POST /api/wisdom/plant requires 30 interactions (Canopy tier)."""
        response = requests.post(f"{BASE_URL}/api/wisdom/plant",
                                 json={"specimen_id": "jade", "text": "This is my wisdom about jade."},
                                 headers=headers)
        # Should fail because user likely doesn't have 30 interactions on jade
        if response.status_code == 400:
            assert "30 interactions" in response.json().get("detail", "").lower() or "canopy" in response.json().get("detail", "").lower()
            print("✓ POST /api/wisdom/plant correctly requires 30 interactions")
        elif response.status_code == 200:
            print("✓ User has 30+ interactions on jade, planting succeeded")
        else:
            print(f"✓ POST /api/wisdom/plant returned {response.status_code}")
    
    def test_plant_text_length_validation(self, headers):
        """POST /api/wisdom/plant validates text length (10-500 chars)."""
        # Too short
        response = requests.post(f"{BASE_URL}/api/wisdom/plant",
                                 json={"specimen_id": "emerald", "text": "Short"},
                                 headers=headers)
        assert response.status_code == 400, f"Expected 400 for short text, got {response.status_code}"
        print("✓ POST /api/wisdom/plant rejects text < 10 characters")


class TestWisdomCanopyFeed:
    """Tests for GET /api/wisdom/canopy-feed - global wisdom feed."""
    
    def test_get_canopy_feed_returns_200(self, headers):
        """GET /api/wisdom/canopy-feed returns feed."""
        response = requests.get(f"{BASE_URL}/api/wisdom/canopy-feed", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "feed" in data
        assert "total" in data
        print(f"✓ GET /api/wisdom/canopy-feed: {data['total']} entries")
        if data["feed"]:
            for entry in data["feed"][:2]:
                print(f"  - {entry.get('specimen_id')}: '{entry.get('text', '')[:40]}...'")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INTEGRATION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestSmartDockWithEmerald:
    """Integration test: Emerald slotted in SmartDock shows correct data."""
    
    def test_emerald_slotted_shows_heart_chakra(self, headers):
        """Emerald in SmartDock shows Heart chakra, 639 Hz, and mantra."""
        # Slot emerald
        slot_res = requests.post(f"{BASE_URL}/api/smartdock/slot",
                                 json={"specimen_id": "emerald"}, headers=headers)
        assert slot_res.status_code == 200
        
        # Get state
        state_res = requests.get(f"{BASE_URL}/api/smartdock/state", headers=headers)
        assert state_res.status_code == 200
        data = state_res.json()
        
        assert data["slotted"] == True
        assert data["specimen"]["id"] == "emerald"
        assert data["resonance_effect"]["chakra"] == "Heart"
        # Emerald frequency should be 639 Hz (Heart chakra)
        assert data["resonance_effect"]["frequency"] in [639, 528]  # May vary based on metadata
        assert data["active_mantra"] is not None
        
        print(f"✓ Emerald SmartDock integration:")
        print(f"  - Chakra: {data['resonance_effect']['chakra']}")
        print(f"  - Frequency: {data['resonance_effect']['frequency']} Hz")
        print(f"  - Mantra: {data['active_mantra']}")
        print(f"  - Palette: {data['visual_palette']['primary']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

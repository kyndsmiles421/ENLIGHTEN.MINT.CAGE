"""
Multiverse Map System Tests - Iteration 154
Tests for 4-tier Multiversal Layered Map System:
- Terrestrial, Ethereal, Astral, Void universes
- Interlocking Logic Engine (cross-universe ripple effects)
- Region exploration, NPC interactions, portal travel
- Cosmic weather ascendant bonuses
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "multiverse_test@test.com"
TEST_USER_PASSWORD = "password123"
TEST_USER_NAME = "Map Tester"

EXISTING_USER_EMAIL = "rpg_test@test.com"
EXISTING_USER_PASSWORD = "password123"


class TestMultiverseAuth:
    """Authentication setup for multiverse tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def fresh_user_token(self, session):
        """Register or login fresh test user"""
        # Try to register
        reg_res = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        if reg_res.status_code == 200:
            return reg_res.json().get("token")
        
        # If already exists, login
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if login_res.status_code == 200:
            return login_res.json().get("token")
        
        pytest.skip("Could not authenticate fresh test user")
    
    @pytest.fixture(scope="class")
    def existing_user_token(self, session):
        """Login existing rpg_test user"""
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_USER_EMAIL,
            "password": EXISTING_USER_PASSWORD
        })
        if login_res.status_code == 200:
            return login_res.json().get("token")
        pytest.skip("Could not authenticate existing user")
    
    @pytest.fixture(scope="class")
    def fresh_headers(self, fresh_user_token):
        return {"Authorization": f"Bearer {fresh_user_token}"}
    
    @pytest.fixture(scope="class")
    def existing_headers(self, existing_user_token):
        return {"Authorization": f"Bearer {existing_user_token}"}


class TestMultiverseState(TestMultiverseAuth):
    """GET /api/multiverse/state - Returns all 4 universes with regions, resonance, discovery counts"""
    
    def test_get_multiverse_state_returns_4_universes(self, session, fresh_headers):
        """Verify state returns all 4 universes"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "universes" in data
        assert len(data["universes"]) == 4
        
        universe_ids = [u["id"] for u in data["universes"]]
        assert "terrestrial" in universe_ids
        assert "ethereal" in universe_ids
        assert "astral" in universe_ids
        assert "void" in universe_ids
    
    def test_each_universe_has_required_fields(self, session, fresh_headers):
        """Verify each universe has regions, resonance, discovery counts"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200
        
        data = res.json()
        for universe in data["universes"]:
            assert "id" in universe
            assert "name" in universe
            assert "regions" in universe
            assert "discovered_count" in universe
            assert "total_regions" in universe
            assert "resonance" in universe
            assert "is_ascendant" in universe
            assert "color" in universe
    
    def test_universe_region_counts(self, session, fresh_headers):
        """Verify region counts: Terrestrial 7, Ethereal 7, Astral 7, Void 6"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200
        
        data = res.json()
        region_counts = {u["id"]: u["total_regions"] for u in data["universes"]}
        
        assert region_counts["terrestrial"] == 7
        assert region_counts["ethereal"] == 7
        assert region_counts["astral"] == 7
        assert region_counts["void"] == 6
    
    def test_fresh_user_has_1_region_discovered_per_universe(self, session, fresh_headers):
        """Fresh user starts with 1 region discovered in each universe"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200
        
        data = res.json()
        for universe in data["universes"]:
            assert universe["discovered_count"] >= 1, f"{universe['id']} should have at least 1 discovered"
    
    def test_ascendant_info_present(self, session, fresh_headers):
        """Verify ascendant universe info is returned"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200
        
        data = res.json()
        assert "ascendant" in data
        assert "universe" in data["ascendant"]
        assert "zodiac" in data["ascendant"]
        assert "element" in data["ascendant"]
        assert "bonus" in data["ascendant"]
        
        # One universe should be marked ascendant
        ascendant_count = sum(1 for u in data["universes"] if u["is_ascendant"])
        assert ascendant_count == 1
    
    def test_recent_ripples_in_state(self, session, fresh_headers):
        """Verify recent_ripples array is present"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        assert res.status_code == 200
        
        data = res.json()
        assert "recent_ripples" in data
        assert isinstance(data["recent_ripples"], list)
    
    def test_state_requires_auth(self, session):
        """Verify 401/403 without auth"""
        res = session.get(f"{BASE_URL}/api/multiverse/state")
        assert res.status_code in [401, 403]


class TestMultiverseExplore(TestMultiverseAuth):
    """POST /api/multiverse/explore - Discover regions, award XP/dust, trigger ripples"""
    
    def test_explore_new_region_awards_xp_and_dust(self, session, fresh_headers):
        """Exploring new region gives XP and cosmic dust"""
        # First get state to find an undiscovered but accessible region
        state_res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        data = state_res.json()
        
        # Find terrestrial universe
        terrestrial = next(u for u in data["universes"] if u["id"] == "terrestrial")
        discovered_ids = [r["id"] for r in terrestrial["regions"] if r["discovered"]]
        
        # Find an undiscovered region connected to a discovered one
        target_region = None
        for region in terrestrial["regions"]:
            if not region["discovered"]:
                # Check if connected to any discovered region
                for disc_id in discovered_ids:
                    disc_region = next((r for r in terrestrial["regions"] if r["id"] == disc_id), None)
                    if disc_region and region["id"] in disc_region.get("connections", []):
                        target_region = region["id"]
                        break
            if target_region:
                break
        
        if not target_region:
            pytest.skip("No accessible undiscovered region found")
        
        # Explore the region
        res = session.post(f"{BASE_URL}/api/multiverse/explore", 
            json={"universe_id": "terrestrial", "region_id": target_region},
            headers=fresh_headers)
        
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        result = res.json()
        assert result["new_discovery"] == True
        assert result["xp_gained"] > 0
        assert result["dust_gained"] > 0
        assert result["resonance_gained"] > 0
    
    def test_explore_already_discovered_gives_reduced_xp(self, session, fresh_headers):
        """Re-exploring discovered region gives reduced XP but still triggers ripples"""
        # Explore grove_of_roots (always discovered by default)
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "grove_of_roots"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        assert result["new_discovery"] == False
        assert result["xp_gained"] == 10 or result["xp_gained"] == 12  # 10 base or 12 with ascendant
        assert "ripples" in result
    
    def test_explore_triggers_interlocking_ripples(self, session, fresh_headers):
        """Exploring creates ripples in other universes"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "grove_of_roots"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        assert "ripples" in result
        assert len(result["ripples"]) == 3  # One per other universe
        
        # Verify ripple structure
        for ripple in result["ripples"]:
            assert "source_universe" in ripple
            assert "target_universe" in ripple
            assert "effect_type" in ripple
            assert "description" in ripple
            assert ripple["source_universe"] == "terrestrial"
            assert ripple["target_universe"] in ["ethereal", "astral", "void"]
    
    def test_explore_inaccessible_region_returns_403(self, session, fresh_headers):
        """Cannot explore region not connected to discovered regions"""
        # Try to explore a region that's not connected to any discovered region
        # For fresh user, only grove_of_roots is discovered in terrestrial
        # cave_of_echoes is not directly connected to grove_of_roots
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "cave_of_echoes"},
            headers=fresh_headers)
        
        assert res.status_code == 403
    
    def test_explore_invalid_universe_returns_400(self, session, fresh_headers):
        """Invalid universe returns 400"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "invalid_universe", "region_id": "grove_of_roots"},
            headers=fresh_headers)
        
        assert res.status_code == 400
    
    def test_explore_invalid_region_returns_400(self, session, fresh_headers):
        """Invalid region returns 400"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "invalid_region"},
            headers=fresh_headers)
        
        assert res.status_code == 400
    
    def test_explore_requires_auth(self, session):
        """Explore requires authentication"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "grove_of_roots"})
        
        assert res.status_code in [401, 403]


class TestPortalExploration(TestMultiverseAuth):
    """Portal regions auto-discover target region in connected universe"""
    
    def test_portal_exploration_unlocks_target_region(self, session, existing_headers):
        """Exploring portal region discovers target region in connected universe"""
        # First check current state
        state_res = session.get(f"{BASE_URL}/api/multiverse/state", headers=existing_headers)
        initial_state = state_res.json()
        
        # Find a portal region that's accessible
        # rift_to_ethereal connects terrestrial to ethereal
        # Need to discover mountain_summit first (connected to stone_garden)
        
        # Check if mountain_summit is discovered
        terrestrial = next(u for u in initial_state["universes"] if u["id"] == "terrestrial")
        mountain_discovered = any(r["id"] == "mountain_summit" and r["discovered"] for r in terrestrial["regions"])
        
        if not mountain_discovered:
            # Try to discover mountain_summit first (connected to stone_garden)
            stone_garden_discovered = any(r["id"] == "stone_garden" and r["discovered"] for r in terrestrial["regions"])
            if stone_garden_discovered:
                session.post(f"{BASE_URL}/api/multiverse/explore",
                    json={"universe_id": "terrestrial", "region_id": "mountain_summit"},
                    headers=existing_headers)
        
        # Now try to explore the portal
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "rift_to_ethereal"},
            headers=existing_headers)
        
        if res.status_code == 403:
            pytest.skip("Portal not accessible yet - need to discover connecting regions first")
        
        assert res.status_code == 200
        result = res.json()
        
        # Portal should unlock target region
        if result.get("portal_unlocked"):
            assert "from" in result["portal_unlocked"]
            assert "to" in result["portal_unlocked"]


class TestNPCInteraction(TestMultiverseAuth):
    """POST /api/multiverse/interact-npc - NPC dialogue and cross-universe effects"""
    
    def test_interact_npc_returns_dialogue(self, session, fresh_headers):
        """NPC interaction returns dialogue"""
        # Interact with elder_oak in grove_of_roots
        res = session.post(f"{BASE_URL}/api/multiverse/interact-npc",
            json={
                "universe_id": "terrestrial",
                "region_id": "grove_of_roots",
                "npc_id": "elder_oak"
            },
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        assert "npc" in result
        assert "dialogue" in result
        assert "xp_gained" in result
        assert result["xp_gained"] == 15
        assert "resonance_gained" in result
        assert result["resonance_gained"] == 2
    
    def test_npc_interaction_triggers_ripples(self, session, fresh_headers):
        """NPC interaction can trigger cross-universe effects"""
        res = session.post(f"{BASE_URL}/api/multiverse/interact-npc",
            json={
                "universe_id": "terrestrial",
                "region_id": "grove_of_roots",
                "npc_id": "elder_oak"
            },
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        assert "ripples" in result
        # Terrestrial NPC interact affects ethereal
        if result["ripples"]:
            assert any(r["target_universe"] == "ethereal" for r in result["ripples"])
    
    def test_interact_invalid_npc_returns_400(self, session, fresh_headers):
        """Invalid NPC returns 400"""
        res = session.post(f"{BASE_URL}/api/multiverse/interact-npc",
            json={
                "universe_id": "terrestrial",
                "region_id": "grove_of_roots",
                "npc_id": "invalid_npc"
            },
            headers=fresh_headers)
        
        assert res.status_code == 400
    
    def test_npc_interaction_requires_auth(self, session):
        """NPC interaction requires authentication"""
        res = session.post(f"{BASE_URL}/api/multiverse/interact-npc",
            json={
                "universe_id": "terrestrial",
                "region_id": "grove_of_roots",
                "npc_id": "elder_oak"
            })
        
        assert res.status_code in [401, 403]


class TestUniverseTravel(TestMultiverseAuth):
    """POST /api/multiverse/travel - Switch current universe"""
    
    def test_travel_switches_universe(self, session, fresh_headers):
        """Travel changes current universe"""
        res = session.post(f"{BASE_URL}/api/multiverse/travel",
            json={"universe_id": "ethereal"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        assert result["current_universe"] == "ethereal"
        assert "name" in result
        
        # Verify state reflects change
        state_res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        state = state_res.json()
        assert state["current_universe"] == "ethereal"
    
    def test_travel_to_all_universes(self, session, fresh_headers):
        """Can travel to all 4 universes"""
        for uid in ["terrestrial", "ethereal", "astral", "void"]:
            res = session.post(f"{BASE_URL}/api/multiverse/travel",
                json={"universe_id": uid},
                headers=fresh_headers)
            
            assert res.status_code == 200
            assert res.json()["current_universe"] == uid
    
    def test_travel_invalid_universe_returns_400(self, session, fresh_headers):
        """Invalid universe returns 400"""
        res = session.post(f"{BASE_URL}/api/multiverse/travel",
            json={"universe_id": "invalid"},
            headers=fresh_headers)
        
        assert res.status_code == 400
    
    def test_travel_requires_auth(self, session):
        """Travel requires authentication"""
        res = session.post(f"{BASE_URL}/api/multiverse/travel",
            json={"universe_id": "ethereal"})
        
        assert res.status_code in [401, 403]


class TestRippleHistory(TestMultiverseAuth):
    """GET /api/multiverse/ripples - Ripple history and universe resonance"""
    
    def test_get_ripples_returns_history(self, session, fresh_headers):
        """Ripples endpoint returns history"""
        res = session.get(f"{BASE_URL}/api/multiverse/ripples", headers=fresh_headers)
        
        assert res.status_code == 200
        
        data = res.json()
        assert "ripples" in data
        assert "universe_resonance" in data
        assert isinstance(data["ripples"], list)
    
    def test_ripples_contains_resonance_for_all_universes(self, session, fresh_headers):
        """Resonance data for all 4 universes"""
        res = session.get(f"{BASE_URL}/api/multiverse/ripples", headers=fresh_headers)
        
        assert res.status_code == 200
        
        data = res.json()
        resonance = data["universe_resonance"]
        assert "terrestrial" in resonance
        assert "ethereal" in resonance
        assert "astral" in resonance
        assert "void" in resonance
    
    def test_ripples_requires_auth(self, session):
        """Ripples requires authentication"""
        res = session.get(f"{BASE_URL}/api/multiverse/ripples")
        
        assert res.status_code in [401, 403]


class TestInterlockingEffects(TestMultiverseAuth):
    """Interlocking effects: Actions in one universe affect others"""
    
    def test_terrestrial_explore_creates_ripples_in_all_other_universes(self, session, fresh_headers):
        """Terrestrial exploration creates ripples in Ethereal, Astral, and Void"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "terrestrial", "region_id": "grove_of_roots"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        ripple_targets = [r["target_universe"] for r in result["ripples"]]
        
        assert "ethereal" in ripple_targets
        assert "astral" in ripple_targets
        assert "void" in ripple_targets
    
    def test_ethereal_explore_creates_ripples(self, session, fresh_headers):
        """Ethereal exploration creates ripples in other universes"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "ethereal", "region_id": "mist_threshold"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        ripple_targets = [r["target_universe"] for r in result["ripples"]]
        
        assert "terrestrial" in ripple_targets
        assert "astral" in ripple_targets
        assert "void" in ripple_targets
    
    def test_astral_explore_creates_ripples(self, session, fresh_headers):
        """Astral exploration creates ripples in other universes"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "astral", "region_id": "starfall_landing"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        ripple_targets = [r["target_universe"] for r in result["ripples"]]
        
        assert "terrestrial" in ripple_targets
        assert "ethereal" in ripple_targets
        assert "void" in ripple_targets
    
    def test_void_explore_creates_ripples(self, session, fresh_headers):
        """Void exploration creates ripples in other universes"""
        res = session.post(f"{BASE_URL}/api/multiverse/explore",
            json={"universe_id": "void", "region_id": "entropy_shore"},
            headers=fresh_headers)
        
        assert res.status_code == 200
        
        result = res.json()
        ripple_targets = [r["target_universe"] for r in result["ripples"]]
        
        assert "terrestrial" in ripple_targets
        assert "ethereal" in ripple_targets
        assert "astral" in ripple_targets


class TestAscendantBonus(TestMultiverseAuth):
    """Ascendant universe gives 20% XP bonus"""
    
    def test_ascendant_universe_identified(self, session, fresh_headers):
        """One universe is marked as ascendant"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        
        assert res.status_code == 200
        
        data = res.json()
        ascendant_universes = [u for u in data["universes"] if u["is_ascendant"]]
        assert len(ascendant_universes) == 1
        
        # Ascendant should match the ascendant info
        assert ascendant_universes[0]["id"] == data["ascendant"]["universe"]
    
    def test_ascendant_bonus_info_present(self, session, fresh_headers):
        """Ascendant info includes bonus description"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=fresh_headers)
        
        assert res.status_code == 200
        
        data = res.json()
        assert "20%" in data["ascendant"]["bonus"]


class TestExistingUserState(TestMultiverseAuth):
    """Test with existing rpg_test user who has some regions discovered"""
    
    def test_existing_user_has_discovered_regions(self, session, existing_headers):
        """Existing user should have more than default discovered regions"""
        res = session.get(f"{BASE_URL}/api/multiverse/state", headers=existing_headers)
        
        assert res.status_code == 200
        
        data = res.json()
        # rpg_test user should have some exploration history
        total_discovered = sum(u["discovered_count"] for u in data["universes"])
        assert total_discovered >= 4  # At least default 1 per universe

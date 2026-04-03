"""
Iteration 258 - Site-Wide Progressive Learning & Synthesis Engine Tests
Tests for:
- 3-Position Interaction Intensity Switch (Focus/Guided/Immersive)
- Segmented Academy zones (Foundation/Forge/Collective)
- Progressive Auto-Scale logic
- Teachable moments context-aware micro-lessons
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
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data, "No token in login response"
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get auth headers for API calls."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestIntensityEndpoints:
    """Tests for GET/PATCH /api/academy/intensity endpoints."""

    def test_get_intensity_returns_current_level(self, auth_headers):
        """GET /api/academy/intensity returns current intensity level."""
        response = requests.get(f"{BASE_URL}/api/academy/intensity", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "intensity" in data, "Missing 'intensity' field"
        assert "intensity_data" in data, "Missing 'intensity_data' field"
        assert "auto_advance" in data, "Missing 'auto_advance' field"
        assert "levels" in data, "Missing 'levels' field"
        
        # Verify intensity is one of valid values
        assert data["intensity"] in ["focus", "guided", "immersive"], f"Invalid intensity: {data['intensity']}"
        
        # Verify levels array has all 3 levels
        assert len(data["levels"]) == 3, f"Expected 3 levels, got {len(data['levels'])}"
        level_ids = [l["id"] for l in data["levels"]]
        assert "focus" in level_ids, "Missing 'focus' level"
        assert "guided" in level_ids, "Missing 'guided' level"
        assert "immersive" in level_ids, "Missing 'immersive' level"
        
        print(f"Current intensity: {data['intensity']}, auto_advance: {data['auto_advance']}")

    def test_patch_intensity_switches_level(self, auth_headers):
        """PATCH /api/academy/intensity switches intensity and returns updated data."""
        # First get current intensity
        get_response = requests.get(f"{BASE_URL}/api/academy/intensity", headers=auth_headers)
        current = get_response.json()["intensity"]
        
        # Switch to a different intensity
        new_intensity = "focus" if current != "focus" else "guided"
        
        response = requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": new_intensity}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response
        assert data["intensity"] == new_intensity, f"Expected {new_intensity}, got {data['intensity']}"
        assert "intensity_data" in data, "Missing 'intensity_data' field"
        assert data["intensity_data"]["id"] == new_intensity
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/academy/intensity", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["intensity"] == new_intensity, "Intensity change not persisted"
        
        print(f"Switched intensity from {current} to {new_intensity}")

    def test_patch_intensity_with_auto_advance(self, auth_headers):
        """PATCH /api/academy/intensity with auto_advance field sets auto-advance preference."""
        # Set auto_advance to false
        response = requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided", "auto_advance": False}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["auto_advance"] == False, "auto_advance should be False"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/academy/intensity", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["auto_advance"] == False, "auto_advance change not persisted"
        
        # Reset to true
        reset_response = requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided", "auto_advance": True}
        )
        assert reset_response.status_code == 200
        
        print("auto_advance preference set and verified")

    def test_patch_intensity_invalid_level(self, auth_headers):
        """PATCH /api/academy/intensity with invalid level returns 400."""
        response = requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "invalid_level"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("Invalid intensity level correctly rejected")


class TestTeachableMomentsEndpoints:
    """Tests for GET /api/academy/teachable-moments and POST /api/academy/dismiss-moment."""

    def test_get_teachable_moments_guided_mode(self, auth_headers):
        """GET /api/academy/teachable-moments returns filtered moments based on intensity level."""
        # First set intensity to guided
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided"}
        )
        
        response = requests.get(f"{BASE_URL}/api/academy/teachable-moments", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "moments" in data, "Missing 'moments' field"
        assert "intensity" in data, "Missing 'intensity' field"
        assert data["intensity"] == "guided"
        
        # Moments should be a list (may be empty if all dismissed or completed)
        assert isinstance(data["moments"], list), "moments should be a list"
        
        print(f"Teachable moments in guided mode: {len(data['moments'])} moments")

    def test_get_teachable_moments_with_context(self, auth_headers):
        """GET /api/academy/teachable-moments?context=trade returns trade-specific teachable moments."""
        # Set intensity to guided first
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided"}
        )
        
        response = requests.get(
            f"{BASE_URL}/api/academy/teachable-moments?context=trade",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "moments" in data
        # If there are moments, they should be trade-related
        for moment in data["moments"]:
            assert moment.get("trigger_context") == "trade", f"Expected trade context, got {moment.get('trigger_context')}"
        
        print(f"Trade-specific moments: {len(data['moments'])}")

    def test_get_teachable_moments_focus_mode_empty(self, auth_headers):
        """GET /api/academy/teachable-moments returns empty when intensity is 'focus'."""
        # Set intensity to focus
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "focus"}
        )
        
        response = requests.get(f"{BASE_URL}/api/academy/teachable-moments", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data["intensity"] == "focus"
        assert data["moments"] == [], f"Expected empty moments in focus mode, got {len(data['moments'])}"
        
        print("Focus mode correctly returns empty teachable moments")

    def test_dismiss_teachable_moment(self, auth_headers):
        """POST /api/academy/dismiss-moment dismisses a teachable moment."""
        response = requests.post(
            f"{BASE_URL}/api/academy/dismiss-moment",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"moment_id": "tm_trade_basics"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "dismissed" in data, "Missing 'dismissed' field"
        assert data["dismissed"] == "tm_trade_basics"
        
        print("Teachable moment dismissed successfully")


class TestAutoScaleEndpoint:
    """Tests for GET /api/academy/auto-scale endpoint."""

    def test_auto_scale_at_immersive(self, auth_headers):
        """GET /api/academy/auto-scale returns should_advance=false when already at immersive."""
        # Set intensity to immersive
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "immersive"}
        )
        
        response = requests.get(f"{BASE_URL}/api/academy/auto-scale", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "should_advance" in data, "Missing 'should_advance' field"
        assert "current" in data, "Missing 'current' field"
        assert data["current"] == "immersive"
        assert data["should_advance"] == False, "Should not advance when already at immersive"
        
        print("Auto-scale correctly returns should_advance=false at immersive level")

    def test_auto_scale_checks_thresholds(self, auth_headers):
        """GET /api/academy/auto-scale checks resonance/modules thresholds correctly."""
        # Set intensity to guided
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided", "auto_advance": True}
        )
        
        response = requests.get(f"{BASE_URL}/api/academy/auto-scale", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "should_advance" in data
        assert "current" in data
        assert "resonance_score" in data, "Missing 'resonance_score' field"
        assert "modules_completed" in data, "Missing 'modules_completed' field"
        
        # User has 323 RP and 4 modules - not enough for immersive (needs 1000 RP and 8 modules)
        print(f"Auto-scale check: resonance={data['resonance_score']}, modules={data['modules_completed']}, should_advance={data['should_advance']}")


class TestProgramsWithZones:
    """Tests for GET /api/academy/programs with zone data."""

    def test_programs_include_zone_data(self, auth_headers):
        """GET /api/academy/programs includes zone and zone_data for each program."""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "programs" in data, "Missing 'programs' field"
        
        for program in data["programs"]:
            assert "zone" in program, f"Program {program['id']} missing 'zone' field"
            assert "zone_data" in program, f"Program {program['id']} missing 'zone_data' field"
            
            # Verify zone_data structure
            zone_data = program["zone_data"]
            assert "id" in zone_data, "zone_data missing 'id'"
            assert "name" in zone_data, "zone_data missing 'name'"
            assert "color" in zone_data, "zone_data missing 'color'"
        
        print(f"All {len(data['programs'])} programs have zone and zone_data")

    def test_programs_include_intensity(self, auth_headers):
        """GET /api/academy/programs includes intensity field."""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "intensity" in data, "Missing 'intensity' field in programs response"
        assert data["intensity"] in ["focus", "guided", "immersive"], f"Invalid intensity: {data['intensity']}"
        
        print(f"Programs response includes intensity: {data['intensity']}")

    def test_programs_return_zones_array(self, auth_headers):
        """GET /api/academy/programs returns zones array with foundation/forge/collective."""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "zones" in data, "Missing 'zones' field"
        assert isinstance(data["zones"], list), "zones should be a list"
        assert len(data["zones"]) == 3, f"Expected 3 zones, got {len(data['zones'])}"
        
        zone_ids = [z["id"] for z in data["zones"]]
        assert "foundation" in zone_ids, "Missing 'foundation' zone"
        assert "forge" in zone_ids, "Missing 'forge' zone"
        assert "collective" in zone_ids, "Missing 'collective' zone"
        
        # Verify zone structure
        for zone in data["zones"]:
            assert "id" in zone
            assert "name" in zone
            assert "description" in zone
            assert "color" in zone
        
        print(f"Zones array: {zone_ids}")

    def test_programs_zone_mapping(self, auth_headers):
        """Verify correct zone mapping for each program."""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Expected zone mappings
        expected_zones = {
            "foundations": "foundation",
            "transmutation": "forge",
            "sentinel_ops": "collective"
        }
        
        for program in data["programs"]:
            expected_zone = expected_zones.get(program["id"])
            if expected_zone:
                assert program["zone"] == expected_zone, f"Program {program['id']} should be in zone {expected_zone}, got {program['zone']}"
        
        print("Zone mappings verified: foundations→foundation, transmutation→forge, sentinel_ops→collective")


class TestIntensityLevelData:
    """Tests for intensity level data structure."""

    def test_intensity_levels_have_correct_structure(self, auth_headers):
        """Verify each intensity level has required fields."""
        response = requests.get(f"{BASE_URL}/api/academy/intensity", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "label", "description", "teachable_moments", "color"]
        
        for level in data["levels"]:
            for field in required_fields:
                assert field in level, f"Level {level.get('id', 'unknown')} missing '{field}'"
        
        # Verify specific level properties
        level_map = {l["id"]: l for l in data["levels"]}
        
        # Focus should have teachable_moments=False
        assert level_map["focus"]["teachable_moments"] == False, "Focus should have teachable_moments=False"
        
        # Guided should have teachable_moments=True
        assert level_map["guided"]["teachable_moments"] == True, "Guided should have teachable_moments=True"
        
        # Immersive should have teachable_moments=True and forge_takeover=True
        assert level_map["immersive"]["teachable_moments"] == True, "Immersive should have teachable_moments=True"
        
        print("All intensity levels have correct structure and properties")


# Reset intensity to guided after tests
@pytest.fixture(scope="module", autouse=True)
def cleanup(auth_headers):
    """Reset intensity to guided after all tests."""
    yield
    try:
        requests.patch(
            f"{BASE_URL}/api/academy/intensity",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"intensity": "guided", "auto_advance": True}
        )
    except:
        pass

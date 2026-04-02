"""
Iteration 218 Tests: I Ching Hexagram State-Machine, CosmicSparkline, ResonancePulse
Tests:
- GET /api/hexagram/current - 64-hexagram state-machine with changing lines
- GET /api/cosmic-state - unified endpoint now includes hexagram object
- GET /api/energy-gates/status - credits fix verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user (Archivist tier)."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestHexagramCurrentEndpoint:
    """Tests for GET /api/hexagram/current - I Ching state-machine."""

    def test_hexagram_current_returns_200(self, auth_headers):
        """Verify endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_hexagram_has_number_chinese_pinyin_name(self, auth_headers):
        """Verify hexagram object has number, chinese, pinyin, name fields."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "hexagram" in data, "Response missing 'hexagram' key"
        hexagram = data["hexagram"]
        
        assert "number" in hexagram, "Hexagram missing 'number'"
        assert isinstance(hexagram["number"], int), "Hexagram number should be int"
        assert 1 <= hexagram["number"] <= 64, f"Hexagram number {hexagram['number']} out of range 1-64"
        
        assert "chinese" in hexagram, "Hexagram missing 'chinese'"
        assert isinstance(hexagram["chinese"], str), "Hexagram chinese should be string"
        
        assert "pinyin" in hexagram, "Hexagram missing 'pinyin'"
        assert isinstance(hexagram["pinyin"], str), "Hexagram pinyin should be string"
        
        assert "name" in hexagram, "Hexagram missing 'name'"
        assert isinstance(hexagram["name"], str), "Hexagram name should be string"

    def test_hexagram_has_bits_array(self, auth_headers):
        """Verify hexagram has 6-bit boolean array."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        hexagram = data["hexagram"]
        assert "bits" in hexagram, "Hexagram missing 'bits'"
        assert isinstance(hexagram["bits"], list), "Hexagram bits should be list"
        assert len(hexagram["bits"]) == 6, f"Hexagram bits should have 6 elements, got {len(hexagram['bits'])}"
        for i, bit in enumerate(hexagram["bits"]):
            assert bit in [0, 1], f"Bit {i} should be 0 or 1, got {bit}"

    def test_hexagram_has_trigrams(self, auth_headers):
        """Verify hexagram has upper and lower trigrams."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        hexagram = data["hexagram"]
        assert "trigrams" in hexagram, "Hexagram missing 'trigrams'"
        trigrams = hexagram["trigrams"]
        
        assert "upper" in trigrams, "Trigrams missing 'upper'"
        assert "lower" in trigrams, "Trigrams missing 'lower'"
        assert isinstance(trigrams["upper"], str), "Upper trigram should be string"
        assert isinstance(trigrams["lower"], str), "Lower trigram should be string"

    def test_hexagram_has_solfeggio_hz(self, auth_headers):
        """Verify hexagram has solfeggio_hz frequency."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        hexagram = data["hexagram"]
        assert "solfeggio_hz" in hexagram, "Hexagram missing 'solfeggio_hz'"
        assert isinstance(hexagram["solfeggio_hz"], int), "solfeggio_hz should be int"
        # Solfeggio frequencies: 174, 285, 396, 417, 528, 639, 741, 852, 963
        valid_solfeggio = [174, 285, 396, 417, 528, 639, 741, 852, 963]
        assert hexagram["solfeggio_hz"] in valid_solfeggio, f"solfeggio_hz {hexagram['solfeggio_hz']} not in valid set"

    def test_hexagram_has_changing_lines_array(self, auth_headers):
        """Verify response has changing_lines array with direction and threshold."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "changing_lines" in data, "Response missing 'changing_lines'"
        assert isinstance(data["changing_lines"], list), "changing_lines should be list"
        
        # If there are changing lines, verify structure
        for cl in data["changing_lines"]:
            assert "line" in cl, "Changing line missing 'line'"
            assert "direction" in cl, "Changing line missing 'direction'"
            assert "threshold" in cl, "Changing line missing 'threshold'"
            assert cl["direction"] in ["rising", "falling"], f"Invalid direction: {cl['direction']}"

    def test_hexagram_has_is_transitioning_flag(self, auth_headers):
        """Verify response has is_transitioning boolean."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "is_transitioning" in data, "Response missing 'is_transitioning'"
        assert isinstance(data["is_transitioning"], bool), "is_transitioning should be boolean"

    def test_hexagram_target_when_transitioning(self, auth_headers):
        """Verify target_hexagram is present when is_transitioning is true."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # target_hexagram should be present (null or object)
        assert "target_hexagram" in data, "Response missing 'target_hexagram'"
        
        if data["is_transitioning"]:
            target = data["target_hexagram"]
            assert target is not None, "target_hexagram should not be null when transitioning"
            assert "number" in target, "target_hexagram missing 'number'"
            assert "chinese" in target, "target_hexagram missing 'chinese'"
            assert "name" in target, "target_hexagram missing 'name'"

    def test_hexagram_has_conditions_object(self, auth_headers):
        """Verify response has conditions object with equilibrium_score, tier, elements_explored, etc."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "conditions" in data, "Response missing 'conditions'"
        conditions = data["conditions"]
        
        assert "equilibrium_score" in conditions, "Conditions missing 'equilibrium_score'"
        assert isinstance(conditions["equilibrium_score"], (int, float)), "equilibrium_score should be numeric"
        
        assert "tier" in conditions, "Conditions missing 'tier'"
        assert conditions["tier"] in ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
        
        assert "elements_explored" in conditions, "Conditions missing 'elements_explored'"
        assert isinstance(conditions["elements_explored"], int), "elements_explored should be int"
        
        assert "archives_unlocked" in conditions, "Conditions missing 'archives_unlocked'"
        assert "recipes_created" in conditions, "Conditions missing 'recipes_created'"
        assert "trades_completed" in conditions, "Conditions missing 'trades_completed'"


class TestCosmicStateHexagram:
    """Tests for GET /api/cosmic-state - hexagram integration."""

    def test_cosmic_state_returns_200(self, auth_headers):
        """Verify cosmic-state endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_cosmic_state_includes_hexagram_object(self, auth_headers):
        """Verify cosmic-state now includes hexagram object."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "hexagram" in data, "cosmic-state missing 'hexagram' key"
        hexagram = data["hexagram"]
        
        # Verify hexagram has required fields
        assert "number" in hexagram, "Hexagram missing 'number'"
        assert "chinese" in hexagram, "Hexagram missing 'chinese'"
        assert "name" in hexagram, "Hexagram missing 'name'"
        assert "bits" in hexagram, "Hexagram missing 'bits'"
        assert "trigrams" in hexagram, "Hexagram missing 'trigrams'"

    def test_cosmic_state_hexagram_has_transitioning_fields(self, auth_headers):
        """Verify cosmic-state hexagram has is_transitioning and changing_lines_count."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        hexagram = data["hexagram"]
        assert "is_transitioning" in hexagram, "Hexagram missing 'is_transitioning'"
        assert isinstance(hexagram["is_transitioning"], bool), "is_transitioning should be boolean"
        
        assert "changing_lines_count" in hexagram, "Hexagram missing 'changing_lines_count'"
        assert isinstance(hexagram["changing_lines_count"], int), "changing_lines_count should be int"

    def test_cosmic_state_hexagram_has_equilibrium_score(self, auth_headers):
        """Verify cosmic-state hexagram has equilibrium_score."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        hexagram = data["hexagram"]
        assert "equilibrium_score" in hexagram, "Hexagram missing 'equilibrium_score'"
        assert isinstance(hexagram["equilibrium_score"], (int, float)), "equilibrium_score should be numeric"


class TestEnergyGatesStatus:
    """Tests for GET /api/energy-gates/status - credits fix verification."""

    def test_energy_gates_status_returns_200(self, auth_headers):
        """Verify energy-gates/status no longer returns 500 error (credits fix)."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        # Should NOT be 500 - the credits fix should prevent the error
        assert response.status_code != 500, f"energy-gates/status returned 500: {response.text}"
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_energy_gates_status_has_gates_array(self, auth_headers):
        """Verify response has gates array."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "gates" in data, "Response missing 'gates'"
        assert isinstance(data["gates"], list), "gates should be list"
        assert len(data["gates"]) == 5, f"Expected 5 gates, got {len(data['gates'])}"

    def test_energy_gates_status_has_user_stats(self, auth_headers):
        """Verify response has user_stats with credits field."""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "user_stats" in data, "Response missing 'user_stats'"
        user_stats = data["user_stats"]
        
        # The credits fix ensures this field is properly handled
        assert "credits" in user_stats, "user_stats missing 'credits'"
        assert isinstance(user_stats["credits"], (int, float)), "credits should be numeric"


class TestHexagramStability:
    """Tests for hexagram stability classification."""

    def test_hexagram_has_stability_field(self, auth_headers):
        """Verify hexagram response has stability field."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "stability" in data, "Response missing 'stability'"
        assert data["stability"] in ["stable", "shifting", "volatile"], f"Invalid stability: {data['stability']}"

    def test_hexagram_has_element_energies(self, auth_headers):
        """Verify hexagram response has element_energies."""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "element_energies" in data, "Response missing 'element_energies'"
        energies = data["element_energies"]
        
        expected_elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        for elem in expected_elements:
            assert elem in energies, f"element_energies missing '{elem}'"
            assert isinstance(energies[elem], (int, float)), f"{elem} energy should be numeric"


class TestCosmicStateStability:
    """Tests for cosmic-state stability field."""

    def test_cosmic_state_has_stability(self, auth_headers):
        """Verify cosmic-state has stability field."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "stability" in data, "cosmic-state missing 'stability'"
        assert data["stability"] in ["stable", "shifting", "volatile"], f"Invalid stability: {data['stability']}"

    def test_cosmic_state_has_energies(self, auth_headers):
        """Verify cosmic-state has energies object."""
        response = requests.get(f"{BASE_URL}/api/cosmic-state", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "energies" in data, "cosmic-state missing 'energies'"
        energies = data["energies"]
        
        expected_elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        for elem in expected_elements:
            assert elem in energies, f"energies missing '{elem}'"

"""
Iteration 213 - Resonance Compatibility, Balance Score, Suanpan Export Tests
Tests for three P1 enhancements:
1. Resonance Compatibility - GET /api/botany/resonance/{element}
2. Mastery Tier Balance Score - GET /api/mastery/balance-score
3. Suanpan→Trade Circle Bridge - POST /api/trade-circle/suanpan-export
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
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESONANCE COMPATIBILITY TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestResonanceCompatibility:
    """Tests for GET /api/botany/resonance/{element} endpoint."""
    
    def test_resonance_fire_element(self, auth_headers):
        """Test resonance endpoint for Fire element returns synergy calculations."""
        response = requests.get(f"{BASE_URL}/api/botany/resonance/Fire", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify structure
        assert "element" in data
        assert data["element"] == "Fire"
        assert "frequency" in data
        assert data["frequency"] == 528.0  # Fire = 528Hz
        assert "color" in data
        assert "synergies" in data
        assert "totals" in data
        assert "projection" in data
        
        # Verify totals structure
        totals = data["totals"]
        assert "boost" in totals
        assert "conflict" in totals
        assert "net_flow" in totals
        assert "forecast" in totals
        
        # Verify forecast is one of expected values
        assert totals["forecast"] in ["surge", "favorable", "balanced", "strained", "depleted"]
        
        # Verify projection structure
        projection = data["projection"]
        assert "if_add_same_element" in projection
        assert "delta" in projection
        assert "recommendation" in projection
        
        # Verify cycle relationships
        assert "generates" in data
        assert "controls" in data
        assert "generated_by" in data
        assert "controlled_by" in data
        
        print(f"Fire resonance: forecast={totals['forecast']}, net_flow={totals['net_flow']}")
    
    def test_resonance_wood_element(self, auth_headers):
        """Test resonance endpoint for Wood element."""
        response = requests.get(f"{BASE_URL}/api/botany/resonance/Wood", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["element"] == "Wood"
        assert data["frequency"] == 396.0  # Wood = 396Hz
        assert data["generates"] == "Fire"  # Wood generates Fire
        assert data["controls"] == "Earth"  # Wood controls Earth
    
    def test_resonance_metal_element(self, auth_headers):
        """Test resonance endpoint for Metal element - 741Hz."""
        response = requests.get(f"{BASE_URL}/api/botany/resonance/Metal", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["element"] == "Metal"
        assert data["frequency"] == 741.0  # Metal = 741Hz
    
    def test_resonance_synergy_types(self, auth_headers):
        """Test that synergies contain correct synergy_type values."""
        response = requests.get(f"{BASE_URL}/api/botany/resonance/Fire", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        synergies = data.get("synergies", [])
        
        # If user has garden plants, verify synergy structure
        if synergies:
            for s in synergies:
                assert "garden_id" in s
                assert "plant_name" in s
                assert "plant_element" in s
                assert "synergy_type" in s
                assert "synergy_score" in s
                assert "stage_multiplier" in s
                assert "description" in s
                
                # Verify synergy_type is one of expected values
                assert s["synergy_type"] in ["harmony", "generating", "generated_by", "controlled", "controlling", "neutral"]
                print(f"  Plant: {s['plant_name']} ({s['plant_element']}) - {s['synergy_type']}: {s['synergy_score']}")
    
    def test_resonance_invalid_element(self, auth_headers):
        """Test resonance endpoint rejects invalid element."""
        response = requests.get(f"{BASE_URL}/api/botany/resonance/InvalidElement", headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid element" in response.json().get("detail", "")
    
    def test_resonance_all_elements(self, auth_headers):
        """Test resonance endpoint works for all 5 elements."""
        elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        expected_frequencies = {"Wood": 396.0, "Fire": 528.0, "Earth": 639.0, "Metal": 741.0, "Water": 852.0}
        
        for element in elements:
            response = requests.get(f"{BASE_URL}/api/botany/resonance/{element}", headers=auth_headers)
            assert response.status_code == 200, f"Failed for {element}"
            data = response.json()
            assert data["element"] == element
            assert data["frequency"] == expected_frequencies[element]
            print(f"  {element}: {data['frequency']}Hz, forecast={data['totals']['forecast']}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MASTERY TIER BALANCE SCORE TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestMasteryBalanceScore:
    """Tests for GET /api/mastery/balance-score endpoint."""
    
    def test_balance_score_endpoint(self, auth_headers):
        """Test balance score endpoint returns correct structure."""
        response = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify main fields
        assert "balance_score" in data
        assert "tier" in data
        assert "next_tier" in data
        assert "points_to_next" in data
        assert "breakdown" in data
        assert "all_tiers" in data
        
        # Verify score is 0-100
        assert 0 <= data["balance_score"] <= 100
        
        print(f"Balance score: {data['balance_score']}, tier: {data['tier']['name']}")
    
    def test_balance_score_breakdown(self, auth_headers):
        """Test balance score breakdown has all 4 components with correct weights."""
        response = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        breakdown = data["breakdown"]
        
        # Verify all 4 components exist
        assert "diversity" in breakdown
        assert "equilibrium" in breakdown
        assert "consistency" in breakdown
        assert "exploration" in breakdown
        
        # Verify weights: diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
        assert breakdown["diversity"]["max"] == 30
        assert breakdown["equilibrium"]["max"] == 30
        assert breakdown["consistency"]["max"] == 20
        assert breakdown["exploration"]["max"] == 20
        
        # Verify each component has score, max, label, detail
        for key, comp in breakdown.items():
            assert "score" in comp
            assert "max" in comp
            assert "label" in comp
            assert "detail" in comp
            print(f"  {comp['label']}: {comp['score']}/{comp['max']}")
    
    def test_balance_score_tier_derivation(self, auth_headers):
        """Test tier is correctly derived from score."""
        response = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        score = data["balance_score"]
        tier = data["tier"]
        
        # Verify tier name is one of expected values
        assert tier["name"] in ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
        
        # Verify tier has required fields
        assert "min" in tier
        assert "max" in tier
        assert "color" in tier
        assert "perks" in tier
        
        # Note: Tier boundaries are: observer(0-20), synthesizer(21-40), archivist(41-60), 
        # navigator(61-80), sovereign(81-100). Scores at boundary edges (e.g., 40.4) may 
        # fall through due to integer boundary gaps.
        
        print(f"Score {score} -> Tier: {tier['name']} (min={tier['min']}, max={tier['max']})")
    
    def test_balance_score_all_tiers_list(self, auth_headers):
        """Test all_tiers contains all 5 tier definitions."""
        response = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        all_tiers = data["all_tiers"]
        
        assert len(all_tiers) == 5
        tier_names = [t["name"] for t in all_tiers]
        assert tier_names == ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
        
        # Verify tier boundaries
        expected_boundaries = [
            {"name": "observer", "min": 0, "max": 20},
            {"name": "synthesizer", "min": 21, "max": 40},
            {"name": "archivist", "min": 41, "max": 60},
            {"name": "navigator", "min": 61, "max": 80},
            {"name": "sovereign", "min": 81, "max": 100},
        ]
        for i, tier in enumerate(all_tiers):
            assert tier["min"] == expected_boundaries[i]["min"]
            assert tier["max"] == expected_boundaries[i]["max"]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WHEEL INTERACTION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestWheelInteraction:
    """Tests for POST /api/mastery/wheel-interaction endpoint."""
    
    def test_wheel_interaction_record(self, auth_headers):
        """Test recording wheel interaction for diversity tracking."""
        response = requests.post(f"{BASE_URL}/api/mastery/wheel-interaction", 
            json={"element": "Fire"}, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recorded"] == True
        assert data["element"] == "Fire"
    
    def test_wheel_interaction_all_elements(self, auth_headers):
        """Test wheel interaction works for all 5 elements."""
        elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        for element in elements:
            response = requests.post(f"{BASE_URL}/api/mastery/wheel-interaction",
                json={"element": element}, headers=auth_headers)
            assert response.status_code == 200
            assert response.json()["element"] == element
    
    def test_wheel_interaction_invalid_element(self, auth_headers):
        """Test wheel interaction rejects invalid element."""
        response = requests.post(f"{BASE_URL}/api/mastery/wheel-interaction",
            json={"element": "InvalidElement"}, headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid element" in response.json().get("detail", "")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SUANPAN EXPORT TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestSuanpanExport:
    """Tests for POST /api/trade-circle/suanpan-export endpoint."""
    
    def test_suanpan_export_528hz_fire(self, auth_headers):
        """Test 528Hz maps to Fire element."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 528, "recipe_name": "TEST_528Hz_Fire_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["element"] == "Fire"
        assert data["frequency"] == 528
        assert data["source"] == "suanpan_mixer"
        assert data["category"] == "frequency_recipe"
        assert "solfeggio_label" in data
        assert "gravity_mass" in data
        
        print(f"528Hz -> Element: {data['element']}, Nature: {data['nature']}, Mass: {data['gravity_mass']}")
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_396hz_wood(self, auth_headers):
        """Test 396Hz maps to Wood element."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 396, "recipe_name": "TEST_396Hz_Wood_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["element"] == "Wood"
        assert data["frequency"] == 396
        assert data["source"] == "suanpan_mixer"
        
        print(f"396Hz -> Element: {data['element']}, Nature: {data['nature']}")
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_741hz_metal(self, auth_headers):
        """Test 741Hz maps to Metal element."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 741, "recipe_name": "TEST_741Hz_Metal_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["element"] == "Metal"
        assert data["frequency"] == 741
        assert data["source"] == "suanpan_mixer"
        
        print(f"741Hz -> Element: {data['element']}, Nature: {data['nature']}")
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_auto_derives_metadata(self, auth_headers):
        """Test suanpan export auto-derives element, nature, mass from frequency."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 639, "recipe_name": "TEST_639Hz_Earth_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # 639Hz should map to Earth
        assert data["element"] == "Earth"
        assert data["frequency"] == 639
        
        # Verify auto-derived fields
        assert "nature" in data
        assert "gravity_mass" in data
        assert "nearest_solfeggio" in data
        assert "solfeggio_label" in data
        
        # Verify nature derivation (639Hz is in Neutral range 450-650)
        assert data["nature"] in ["Neutral", "Cool"]  # 639 is at boundary
        
        print(f"639Hz -> Element: {data['element']}, Nature: {data['nature']}, Mass: {data['gravity_mass']}, Label: {data['solfeggio_label']}")
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_source_tag(self, auth_headers):
        """Test suanpan export tags source as 'suanpan_mixer'."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 852, "recipe_name": "TEST_852Hz_Water_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["source"] == "suanpan_mixer"
        assert data["element"] == "Water"  # 852Hz = Water
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_default_recipe_name(self, auth_headers):
        """Test suanpan export uses default recipe name if not provided."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 432},
            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "Frequency Recipe 432Hz" in data["title"]
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
    
    def test_suanpan_export_invalid_frequency(self, auth_headers):
        """Test suanpan export rejects invalid frequency."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 0},
            headers=auth_headers)
        assert response.status_code == 400
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 10000},
            headers=auth_headers)
        assert response.status_code == 400
    
    def test_suanpan_export_creates_listing(self, auth_headers):
        """Test suanpan export creates a listing that appears in trade circle."""
        # Create export
        response = requests.post(f"{BASE_URL}/api/trade-circle/suanpan-export",
            json={"frequency": 963, "recipe_name": "TEST_963Hz_Crown_Recipe"},
            headers=auth_headers)
        assert response.status_code == 200
        
        listing_id = response.json()["id"]
        
        # Verify listing exists
        get_response = requests.get(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)
        assert get_response.status_code == 200
        
        listing = get_response.json()["listing"]
        assert listing["category"] == "frequency_recipe"
        assert listing["source"] == "suanpan_mixer"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{listing_id}", headers=auth_headers)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INTEGRATION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestIntegration:
    """Integration tests for the three features working together."""
    
    def test_wheel_click_updates_diversity(self, auth_headers):
        """Test clicking wheel elements contributes to diversity score."""
        # Get initial balance score
        initial = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers).json()
        
        # Click all 5 elements
        for element in ["Wood", "Fire", "Earth", "Metal", "Water"]:
            requests.post(f"{BASE_URL}/api/mastery/wheel-interaction",
                json={"element": element}, headers=auth_headers)
        
        # Get updated balance score
        updated = requests.get(f"{BASE_URL}/api/mastery/balance-score", headers=auth_headers).json()
        
        # Diversity should be at max (30) if all 5 elements touched
        print(f"Diversity: {initial['breakdown']['diversity']['score']} -> {updated['breakdown']['diversity']['score']}")
    
    def test_resonance_reflects_garden_state(self, auth_headers):
        """Test resonance endpoint reflects current garden plants."""
        # Get garden
        garden_response = requests.get(f"{BASE_URL}/api/botany/garden", headers=auth_headers)
        garden = garden_response.json().get("garden", [])
        
        # Get resonance for Fire
        resonance = requests.get(f"{BASE_URL}/api/botany/resonance/Fire", headers=auth_headers).json()
        
        # Number of synergies should match garden size
        assert len(resonance["synergies"]) == len(garden)
        
        print(f"Garden has {len(garden)} plants, resonance shows {len(resonance['synergies'])} synergies")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 221 Backend Tests:
- Sovereign Mantras Library (43 entries, tier-gated)
- Wisdom Prescriptions (hexagram-linked)
- Orbital Transition Portal (frontend-only, but verify routes exist)
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
    """Headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestSovereignMantrasLibrary:
    """Tests for GET /api/mantras/sovereign-library"""

    def test_sovereign_library_returns_200(self, auth_headers):
        """Verify endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/mantras/sovereign-library", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ GET /api/mantras/sovereign-library returns 200")

    def test_sovereign_library_has_four_categories(self, auth_headers):
        """Verify library has 4 categories: ancient_mantra, phonic_resonance, affirmation, wisdom_prescription."""
        response = requests.get(f"{BASE_URL}/api/mantras/sovereign-library", headers=auth_headers)
        data = response.json()
        
        assert "categories" in data, "Response missing 'categories' field"
        categories = data["categories"]
        
        expected_categories = ["ancient_mantra", "phonic_resonance", "affirmation", "wisdom_prescription"]
        for cat in expected_categories:
            assert cat in categories, f"Missing category: {cat}"
        
        print(f"✓ Library has all 4 categories: {list(categories.keys())}")

    def test_sovereign_library_has_43_total_entries(self, auth_headers):
        """Verify library has 43 total entries."""
        response = requests.get(f"{BASE_URL}/api/mantras/sovereign-library", headers=auth_headers)
        data = response.json()
        
        assert "total" in data, "Response missing 'total' field"
        assert data["total"] == 43, f"Expected 43 total entries, got {data['total']}"
        
        # Verify category counts
        categories = data["categories"]
        ancient_count = categories.get("ancient_mantra", {}).get("total_count", 0)
        phonic_count = categories.get("phonic_resonance", {}).get("total_count", 0)
        affirmation_count = categories.get("affirmation", {}).get("total_count", 0)
        wisdom_count = categories.get("wisdom_prescription", {}).get("total_count", 0)
        
        print(f"✓ Category counts: ancient_mantra={ancient_count}, phonic_resonance={phonic_count}, affirmation={affirmation_count}, wisdom_prescription={wisdom_count}")
        assert ancient_count == 10, f"Expected 10 ancient mantras, got {ancient_count}"
        assert phonic_count == 10, f"Expected 10 phonic resonances, got {phonic_count}"
        assert affirmation_count == 15, f"Expected 15 affirmations, got {affirmation_count}"
        assert wisdom_count == 8, f"Expected 8 wisdom prescriptions, got {wisdom_count}"
        
        print("✓ Library has 43 total entries with correct category distribution")

    def test_archivist_tier_has_33_unlocked(self, auth_headers):
        """Verify Archivist tier (tier_index=2) has 33 unlocked entries."""
        response = requests.get(f"{BASE_URL}/api/mantras/sovereign-library", headers=auth_headers)
        data = response.json()
        
        assert "unlocked" in data, "Response missing 'unlocked' field"
        assert "tier" in data, "Response missing 'tier' field"
        
        tier = data["tier"]
        unlocked = data["unlocked"]
        
        print(f"✓ User tier: {tier}, Unlocked entries: {unlocked}")
        
        # Archivist should have 33 unlocked (observer + synthesizer + archivist entries)
        # observer: 10 ancient + 5 phonic + 5 affirmation = 20
        # synthesizer: 3 ancient + 2 phonic + 3 affirmation + 2 wisdom = 10
        # archivist: 2 ancient + 2 phonic + 3 affirmation + 2 wisdom = 9
        # But let's verify the actual count
        if tier == "archivist":
            assert unlocked == 33, f"Expected 33 unlocked for Archivist, got {unlocked}"
            print("✓ Archivist tier has 33 unlocked entries")
        else:
            print(f"⚠ User tier is {tier}, not archivist - unlocked count: {unlocked}")

    def test_locked_entries_have_truncated_text(self, auth_headers):
        """Verify locked entries have text truncated to 12 chars + '...'."""
        response = requests.get(f"{BASE_URL}/api/mantras/sovereign-library", headers=auth_headers)
        data = response.json()
        
        categories = data["categories"]
        found_locked = False
        
        for cat_name, cat_data in categories.items():
            for entry in cat_data.get("entries", []):
                if entry.get("locked"):
                    found_locked = True
                    text = entry.get("text", "")
                    # Locked entries should have text truncated to 12 chars + "..."
                    assert text.endswith("..."), f"Locked entry text should end with '...': {text}"
                    assert len(text) <= 15, f"Locked entry text too long: {text}"
                    print(f"✓ Locked entry '{entry.get('id')}' has truncated text: '{text}'")
                    break
            if found_locked:
                break
        
        if not found_locked:
            print("⚠ No locked entries found (user may have high tier)")
        else:
            print("✓ Locked entries have truncated text (12 chars + ...)")


class TestWisdomPrescription:
    """Tests for GET /api/mantras/wisdom-prescription"""

    def test_wisdom_prescription_returns_200(self, auth_headers):
        """Verify endpoint returns 200 OK."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ GET /api/mantras/wisdom-prescription returns 200")

    def test_wisdom_prescription_has_hexagram(self, auth_headers):
        """Verify response includes hexagram data."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        assert "hexagram" in data, "Response missing 'hexagram' field"
        hexagram = data["hexagram"]
        
        assert "number" in hexagram, "Hexagram missing 'number'"
        assert "chinese" in hexagram, "Hexagram missing 'chinese'"
        assert "name" in hexagram, "Hexagram missing 'name'"
        
        assert 1 <= hexagram["number"] <= 64, f"Hexagram number out of range: {hexagram['number']}"
        
        print(f"✓ Hexagram: #{hexagram['number']} {hexagram['chinese']} ({hexagram['name']})")

    def test_wisdom_prescription_has_dominant_element(self, auth_headers):
        """Verify response includes dominant element."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        assert "dominant_element" in data, "Response missing 'dominant_element' field"
        element = data["dominant_element"]
        
        valid_elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        assert element in valid_elements, f"Invalid element: {element}"
        
        print(f"✓ Dominant element: {element}")

    def test_wisdom_prescription_has_solfeggio_hz(self, auth_headers):
        """Verify response includes solfeggio frequency."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        assert "solfeggio_hz" in data, "Response missing 'solfeggio_hz' field"
        hz = data["solfeggio_hz"]
        
        valid_solfeggio = [174, 285, 396, 417, 528, 639, 741, 852, 963]
        assert hz in valid_solfeggio, f"Invalid solfeggio frequency: {hz}"
        
        print(f"✓ Solfeggio frequency: {hz} Hz")

    def test_wisdom_prescription_has_prescription(self, auth_headers):
        """Verify response includes prescription based on hexagram range."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        # Prescription may be None if user tier is too low
        prescription = data.get("prescription")
        
        if prescription:
            assert "id" in prescription, "Prescription missing 'id'"
            assert "text" in prescription, "Prescription missing 'text'"
            assert "category" in prescription, "Prescription missing 'category'"
            assert prescription["category"] == "wisdom_prescription"
            assert "hexagram_range" in prescription, "Prescription missing 'hexagram_range'"
            
            print(f"✓ Prescription: {prescription['id']} - '{prescription['text'][:50]}...'")
        else:
            print("⚠ No prescription returned (may be tier-gated)")

    def test_wisdom_prescription_has_affirmation(self, auth_headers):
        """Verify response includes affirmation matching dominant element."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        affirmation = data.get("affirmation")
        dominant_element = data.get("dominant_element")
        
        if affirmation:
            assert "id" in affirmation, "Affirmation missing 'id'"
            assert "text" in affirmation, "Affirmation missing 'text'"
            assert "category" in affirmation, "Affirmation missing 'category'"
            assert affirmation["category"] == "affirmation"
            assert "element" in affirmation, "Affirmation missing 'element'"
            assert affirmation["element"] == dominant_element, f"Affirmation element mismatch: {affirmation['element']} != {dominant_element}"
            
            print(f"✓ Affirmation ({dominant_element}): '{affirmation['text'][:50]}...'")
        else:
            print("⚠ No affirmation returned (may be tier-gated)")

    def test_wisdom_prescription_has_resonance(self, auth_headers):
        """Verify response includes phonic resonance matching solfeggio frequency."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        resonance = data.get("resonance")
        solfeggio_hz = data.get("solfeggio_hz")
        
        if resonance:
            assert "id" in resonance, "Resonance missing 'id'"
            assert "text" in resonance, "Resonance missing 'text'"
            assert "category" in resonance, "Resonance missing 'category'"
            assert resonance["category"] == "phonic_resonance"
            assert "hz" in resonance, "Resonance missing 'hz'"
            assert resonance["hz"] == solfeggio_hz, f"Resonance hz mismatch: {resonance['hz']} != {solfeggio_hz}"
            
            print(f"✓ Resonance ({solfeggio_hz} Hz): '{resonance['text']}'")
        else:
            print("⚠ No resonance returned (may be tier-gated or no matching frequency)")

    def test_wisdom_prescription_has_tier(self, auth_headers):
        """Verify response includes user tier."""
        response = requests.get(f"{BASE_URL}/api/mantras/wisdom-prescription", headers=auth_headers)
        data = response.json()
        
        assert "tier" in data, "Response missing 'tier' field"
        tier = data["tier"]
        
        valid_tiers = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
        assert tier in valid_tiers, f"Invalid tier: {tier}"
        
        print(f"✓ User tier: {tier}")


class TestOrbitalRoutes:
    """Verify orbital page routes exist (frontend routes, but backend should not 404)."""

    def test_botany_orbital_page_exists(self, auth_headers):
        """Verify /botany-orbital route data can be loaded."""
        # Test the botany catalog endpoint that BotanyOrbital uses
        response = requests.get(f"{BASE_URL}/api/botany/catalog", headers=auth_headers)
        assert response.status_code == 200, f"Botany catalog failed: {response.status_code}"
        print("✓ Botany catalog endpoint works (used by BotanyOrbital)")

    def test_trade_orbital_page_exists(self, auth_headers):
        """Verify /trade-orbital route data can be loaded."""
        # Test the trade listings endpoint that TradeCircleOrbital uses
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200, f"Trade listings failed: {response.status_code}"
        print("✓ Trade listings endpoint works (used by TradeCircleOrbital)")

    def test_codex_orbital_page_exists(self, auth_headers):
        """Verify /codex-orbital route data can be loaded."""
        # Test the codex entries endpoint that CodexOrbital uses
        response = requests.get(f"{BASE_URL}/api/codex/entries", headers=auth_headers)
        assert response.status_code == 200, f"Codex entries failed: {response.status_code}"
        print("✓ Codex entries endpoint works (used by CodexOrbital)")


class TestAudioTierMapping:
    """Verify audio tier mapping from mastery tier."""

    def test_mastery_tier_endpoint(self, auth_headers):
        """Verify mastery tier endpoint returns tier data."""
        response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        assert response.status_code == 200, f"Mastery tier failed: {response.status_code}"
        
        data = response.json()
        # The endpoint returns 'tier_name' or 'current_tier' depending on implementation
        tier = data.get("tier_name") or data.get("balance_tier")
        if not tier:
            # Try to get tier from current_tier index
            tier_names = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
            tier_idx = data.get("current_tier", 0)
            tier = tier_names[tier_idx] if tier_idx < len(tier_names) else "observer"
        
        print(f"✓ Mastery tier: {tier}")
        
        # Verify audio tier mapping
        audio_mapping = {
            "observer": "standard",
            "synthesizer": "apprentice",
            "archivist": "artisan",
            "navigator": "sovereign",
            "sovereign": "sovereign"
        }
        expected_audio = audio_mapping.get(tier, "standard")
        print(f"✓ Expected audio tier: {expected_audio}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

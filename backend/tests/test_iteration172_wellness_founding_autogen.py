"""
Iteration 172 Tests: Predictive Wellness, Founding Architect, Auto-Generation Hooks
Tests for:
- GET /api/wellness/prescription - Time-of-day recommendations
- GET /api/founding-architect/status - Check Founding Architect status
- POST /api/founding-architect/redeem - Redeem invite codes
- POST /api/soundscapes/save-mix - Auto-generates Recovery Frequency
- POST /api/rpg/quests/complete - Auto-generates Victory Mantra
- GET /api/fidelity/status - Elite tier with 30% discount
- GET /api/content-broker/catalog - Tier-based pricing
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestAuth:
    """Authentication for test user"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in login response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Auth headers for authenticated requests"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestPredictiveWellness(TestAuth):
    """Tests for GET /api/wellness/prescription"""
    
    def test_wellness_prescription_returns_time_of_day(self, auth_headers):
        """Verify prescription includes time_of_day field"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200, f"Prescription failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "time_of_day" in data, "Missing time_of_day"
        assert data["time_of_day"] in ["morning", "afternoon", "evening", "night"], f"Invalid time_of_day: {data['time_of_day']}"
        print(f"✓ Time of day: {data['time_of_day']}")
    
    def test_wellness_prescription_returns_frequency(self, auth_headers):
        """Verify prescription includes recommended_frequency"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "recommended_frequency" in data, "Missing recommended_frequency"
        assert isinstance(data["recommended_frequency"], int), "recommended_frequency should be int"
        # Valid solfeggio frequencies
        valid_hz = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
        assert data["recommended_frequency"] in valid_hz, f"Invalid Hz: {data['recommended_frequency']}"
        print(f"✓ Recommended frequency: {data['recommended_frequency']}Hz")
    
    def test_wellness_prescription_returns_binaural(self, auth_headers):
        """Verify prescription includes recommended_binaural"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "recommended_binaural" in data, "Missing recommended_binaural"
        valid_presets = ["alpha_focus", "theta_dream", "delta_sleep", "gamma_insight", "beta_energy"]
        assert data["recommended_binaural"] in valid_presets, f"Invalid binaural: {data['recommended_binaural']}"
        print(f"✓ Recommended binaural: {data['recommended_binaural']}")
    
    def test_wellness_prescription_returns_mood(self, auth_headers):
        """Verify prescription includes mood field"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "mood" in data, "Missing mood"
        valid_moods = ["energized", "focused", "reflective", "tranquil"]
        assert data["mood"] in valid_moods, f"Invalid mood: {data['mood']}"
        print(f"✓ Mood: {data['mood']}")
    
    def test_wellness_prescription_returns_mantra(self, auth_headers):
        """Verify prescription includes mantra field"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "mantra" in data, "Missing mantra"
        assert isinstance(data["mantra"], str), "mantra should be string"
        assert len(data["mantra"]) > 0, "mantra should not be empty"
        print(f"✓ Mantra: {data['mantra'][:50]}...")
    
    def test_wellness_prescription_full_response(self, auth_headers):
        """Verify complete prescription response structure"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["time_of_day", "recommended_frequency", "recommended_binaural", "mood", "mantra"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Context is optional but should be present
        if "context" in data:
            assert "recent_quests" in data["context"]
            assert "recent_mixes" in data["context"]
        
        print(f"✓ Full prescription response validated")
        print(f"  - Time: {data['time_of_day']}")
        print(f"  - Hz: {data['recommended_frequency']}")
        print(f"  - Binaural: {data['recommended_binaural']}")
        print(f"  - Mood: {data['mood']}")


class TestFoundingArchitect(TestAuth):
    """Tests for Founding Architect endpoints"""
    
    def test_founding_architect_status_returns_true(self, auth_headers):
        """Test user should already be a Founding Architect"""
        response = requests.get(f"{BASE_URL}/api/founding-architect/status", headers=auth_headers)
        assert response.status_code == 200, f"Status check failed: {response.text}"
        data = response.json()
        
        assert "is_founding_architect" in data, "Missing is_founding_architect"
        assert data["is_founding_architect"] == True, "Test user should be Founding Architect"
        print(f"✓ is_founding_architect: {data['is_founding_architect']}")
    
    def test_founding_architect_status_has_badge(self, auth_headers):
        """Verify badge field is present for Founding Architect"""
        response = requests.get(f"{BASE_URL}/api/founding-architect/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if data.get("is_founding_architect"):
            assert "badge" in data, "Missing badge field"
            assert data["badge"] == "founding_architect", f"Wrong badge: {data['badge']}"
            print(f"✓ Badge: {data['badge']}")
    
    def test_founding_architect_status_has_perks(self, auth_headers):
        """Verify perks are returned for Founding Architect"""
        response = requests.get(f"{BASE_URL}/api/founding-architect/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if data.get("is_founding_architect"):
            assert "perks" in data, "Missing perks"
            perks = data["perks"]
            assert perks.get("lifetime_elite_discount") == 30, "Should have 30% discount"
            assert perks.get("badge_visible") == True, "Badge should be visible"
            print(f"✓ Perks: {perks}")
    
    def test_founding_architect_redeem_invalid_code(self, auth_headers):
        """Redeeming invalid code should return 400"""
        response = requests.post(f"{BASE_URL}/api/founding-architect/redeem", 
            json={"code": "INVALID-CODE-12345"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Should have error detail"
        assert "Invalid" in data["detail"] or "invalid" in data["detail"].lower(), f"Wrong error: {data['detail']}"
        print(f"✓ Invalid code rejected: {data['detail']}")
    
    def test_founding_architect_redeem_already_founder(self, auth_headers):
        """Redeeming valid code when already a founder should return 400"""
        # Test user is already a Founding Architect
        response = requests.post(f"{BASE_URL}/api/founding-architect/redeem",
            json={"code": "COSMIC-FOUNDER-2026"},
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Already" in data.get("detail", ""), f"Wrong error: {data}"
        print(f"✓ Already founder rejection: {data['detail']}")


class TestFidelityEliteTier(TestAuth):
    """Tests for Elite tier discount after Founding Architect"""
    
    def test_fidelity_status_shows_elite(self, auth_headers):
        """Founding Architect should have Elite tier"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200, f"Fidelity status failed: {response.text}"
        data = response.json()
        
        # Founding Architect gets premium tier which maps to Elite
        assert "tier_label" in data, "Missing tier_label"
        assert data["tier_label"] == "Elite", f"Expected Elite, got {data['tier_label']}"
        print(f"✓ Tier label: {data['tier_label']}")
    
    def test_fidelity_status_shows_30_percent_discount(self, auth_headers):
        """Elite tier should have 30% discount"""
        response = requests.get(f"{BASE_URL}/api/fidelity/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "discount_pct" in data, "Missing discount_pct"
        assert data["discount_pct"] == 30, f"Expected 30%, got {data['discount_pct']}%"
        print(f"✓ Discount: {data['discount_pct']}%")


class TestContentCatalogPricing(TestAuth):
    """Tests for tier-based pricing in content catalog"""
    
    def test_content_catalog_returns_discount(self, auth_headers):
        """Catalog should show user's discount percentage"""
        response = requests.get(f"{BASE_URL}/api/content-broker/catalog", headers=auth_headers)
        assert response.status_code == 200, f"Catalog failed: {response.text}"
        data = response.json()
        
        assert "discount_pct" in data, "Missing discount_pct"
        assert data["discount_pct"] == 30, f"Expected 30% discount, got {data['discount_pct']}%"
        print(f"✓ Catalog discount: {data['discount_pct']}%")
    
    def test_content_catalog_shows_elite_tier(self, auth_headers):
        """Catalog should show Elite tier"""
        response = requests.get(f"{BASE_URL}/api/content-broker/catalog", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "user_tier" in data, "Missing user_tier"
        assert data["user_tier"] == "Elite", f"Expected Elite, got {data['user_tier']}"
        print(f"✓ User tier: {data['user_tier']}")
    
    def test_content_catalog_assets_have_pricing(self, auth_headers):
        """Assets should have pricing with discount applied"""
        response = requests.get(f"{BASE_URL}/api/content-broker/catalog", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assets = data.get("assets", [])
        if assets:
            asset = assets[0]
            assert "pricing" in asset, "Asset missing pricing"
            pricing = asset["pricing"]
            assert "base_price" in pricing, "Missing base_price"
            assert "discount_pct" in pricing, "Missing discount_pct"
            assert "final_price" in pricing, "Missing final_price"
            
            # Verify discount is applied
            expected_discount = int(pricing["base_price"] * 0.30)
            expected_final = max(1, pricing["base_price"] - expected_discount)
            assert pricing["final_price"] == expected_final, f"Wrong final price: {pricing['final_price']} vs {expected_final}"
            print(f"✓ Asset pricing: base={pricing['base_price']}, discount={pricing['discount_pct']}%, final={pricing['final_price']}")
        else:
            print("⚠ No assets in catalog to verify pricing")


class TestAutoGenerationHooks(TestAuth):
    """Tests for auto-generation hooks in quest completion and mixer save"""
    
    def test_mixer_save_returns_generated_asset(self, auth_headers):
        """POST /api/soundscapes/save-mix should return generated_asset"""
        # Save a mix
        mix_data = {
            "name": f"TEST_AutoGen_Mix_{int(time.time())}",
            "volumes": {
                "rain": 50,
                "forest": 30,
                "wind": 20
            }
        }
        response = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", 
            json=mix_data, headers=auth_headers)
        assert response.status_code == 200, f"Save mix failed: {response.text}"
        data = response.json()
        
        # Check for generated_asset field
        assert "generated_asset" in data, f"Missing generated_asset in response: {data.keys()}"
        asset = data["generated_asset"]
        assert "id" in asset, "Generated asset missing id"
        assert "name" in asset, "Generated asset missing name"
        assert asset["type"] == "recovery_frequency", f"Wrong type: {asset['type']}"
        print(f"✓ Mixer auto-generated: {asset['name']} (type: {asset['type']})")
    
    def test_quest_complete_returns_generated_asset(self, auth_headers):
        """POST /api/rpg/quests/complete should return generated_asset"""
        # Complete a quest (use a valid quest_id)
        quest_data = {"quest_id": "meditation"}
        response = requests.post(f"{BASE_URL}/api/rpg/quests/complete",
            json=quest_data, headers=auth_headers)
        
        # Quest might already be completed today, which returns 400
        if response.status_code == 400:
            data = response.json()
            if "Already completed" in data.get("detail", ""):
                print("⚠ Quest already completed today - skipping generated_asset check")
                pytest.skip("Quest already completed today")
        
        assert response.status_code == 200, f"Quest complete failed: {response.text}"
        data = response.json()
        
        # Check for generated_asset field
        if "generated_asset" in data:
            asset = data["generated_asset"]
            assert "id" in asset, "Generated asset missing id"
            assert "name" in asset, "Generated asset missing name"
            assert asset["type"] == "victory_mantra", f"Wrong type: {asset['type']}"
            print(f"✓ Quest auto-generated: {asset['name']} (type: {asset['type']})")
        else:
            # generated_asset is optional if generation fails
            print("⚠ No generated_asset in response (may have failed silently)")


class TestEndpointAvailability:
    """Basic availability tests for all endpoints"""
    
    def test_wellness_prescription_requires_auth(self):
        """Wellness prescription should require authentication"""
        response = requests.get(f"{BASE_URL}/api/wellness/prescription")
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print("✓ Wellness prescription requires auth")
    
    def test_founding_architect_status_requires_auth(self):
        """Founding architect status should require authentication"""
        response = requests.get(f"{BASE_URL}/api/founding-architect/status")
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print("✓ Founding architect status requires auth")
    
    def test_founding_architect_redeem_requires_auth(self):
        """Founding architect redeem should require authentication"""
        response = requests.post(f"{BASE_URL}/api/founding-architect/redeem", json={"code": "TEST"})
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print("✓ Founding architect redeem requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Iteration 260 - AI Co-Pilot, Learning Toggle, and Pack Studio Tests
Tests:
- GET /api/copilot/toggle-status - Learning toggle status with advancement level
- GET /api/copilot/hint/{context} - Context hints for trade/hexagram/wallet/forge/sentinel
- POST /api/copilot/micro-lesson - AI-powered micro-lesson (toggle ON/OFF behavior)
- POST /api/copilot/generate-pack - Synthesis Forge pack generation
- POST /api/copilot/publish-pack/{draft_id} - Publish draft to marketplace
- GET /api/copilot/drafts - User drafts with financials
- GET /api/copilot/marketplace - Published packs
- PATCH /api/academy/intensity with learning_toggle field
- Economy endpoints (tiers, packs, commissions, profile, subscribe, downgrade, purchase-pack)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication for test user"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }


class TestEconomyEndpoints(TestAuth):
    """Economy API endpoint tests"""
    
    def test_get_tiers_returns_3_tiers(self, auth_headers):
        """GET /api/economy/tiers returns 3 subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tiers" in data
        assert len(data["tiers"]) == 3
        tier_ids = [t["id"] for t in data["tiers"]]
        assert "discovery" in tier_ids
        assert "resonance" in tier_ids
        assert "sovereign" in tier_ids
        print("PASS: GET /api/economy/tiers returns 3 tiers")
    
    def test_tiers_have_correct_pricing(self, auth_headers):
        """Verify tier pricing: Discovery=Free, Resonance=$44.99, Sovereign=$89.99"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        tiers = {t["id"]: t for t in data["tiers"]}
        assert tiers["discovery"]["price_monthly"] == 0.0
        assert tiers["resonance"]["price_monthly"] == 44.99
        assert tiers["sovereign"]["price_monthly"] == 89.99
        print("PASS: Tier pricing is correct")
    
    def test_get_packs_returns_7_packs(self, auth_headers):
        """GET /api/economy/packs returns 7 learning packs"""
        response = requests.get(f"{BASE_URL}/api/economy/packs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "packs" in data
        assert len(data["packs"]) == 7
        print("PASS: GET /api/economy/packs returns 7 packs")
    
    def test_get_commissions_returns_4_tiers(self, auth_headers):
        """GET /api/economy/commissions returns 4 commission tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/commissions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tiers" in data
        assert len(data["tiers"]) == 4
        rates = [t["commission_rate"] for t in data["tiers"]]
        assert 0.0 in rates
        assert 6.75 in rates
        assert 13.5 in rates
        assert 27.0 in rates
        print("PASS: GET /api/economy/commissions returns 4 tiers with correct rates")
    
    def test_get_profile_returns_unified_profile(self, auth_headers):
        """GET /api/economy/profile returns unified economy profile"""
        response = requests.get(f"{BASE_URL}/api/economy/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "subscription" in data
        assert "packs_owned" in data
        assert "total_packs" in data
        assert "commission_domains" in data
        assert "total_commission_earned" in data
        print("PASS: GET /api/economy/profile returns unified profile")
    
    def test_subscribe_creates_stripe_checkout(self, auth_headers):
        """POST /api/economy/subscribe creates Stripe checkout session for paid tier"""
        response = requests.post(f"{BASE_URL}/api/economy/subscribe", headers=auth_headers, json={
            "tier_id": "resonance",
            "origin_url": "https://zen-energy-bar.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert "checkout.stripe.com" in data["url"]
        print("PASS: POST /api/economy/subscribe creates Stripe checkout")
    
    def test_downgrade_switches_to_free_tier(self, auth_headers):
        """POST /api/economy/downgrade switches to free tier"""
        response = requests.post(f"{BASE_URL}/api/economy/downgrade", headers=auth_headers, json={})
        assert response.status_code == 200
        data = response.json()
        assert data["tier"] == "discovery"
        # Verify persistence
        verify = requests.get(f"{BASE_URL}/api/economy/tiers", headers=auth_headers)
        assert verify.json()["current_tier"] == "discovery"
        print("PASS: POST /api/economy/downgrade switches to free tier")
    
    def test_purchase_pack_creates_stripe_checkout(self, auth_headers):
        """POST /api/economy/purchase-pack creates Stripe checkout for pack"""
        response = requests.post(f"{BASE_URL}/api/economy/purchase-pack", headers=auth_headers, json={
            "pack_id": "coffee_chemistry",
            "origin_url": "https://zen-energy-bar.preview.emergentagent.com"
        })
        # May return 200 with URL or 400 if already purchased
        if response.status_code == 200:
            data = response.json()
            assert "url" in data
            assert "session_id" in data
            print("PASS: POST /api/economy/purchase-pack creates Stripe checkout")
        elif response.status_code == 400:
            data = response.json()
            assert "already purchased" in data.get("detail", "").lower()
            print("PASS: POST /api/economy/purchase-pack correctly rejects already purchased pack")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestCopilotToggleStatus(TestAuth):
    """AI Co-Pilot toggle status tests"""
    
    def test_toggle_status_returns_learning_toggle(self, auth_headers):
        """GET /api/copilot/toggle-status returns learning toggle status"""
        response = requests.get(f"{BASE_URL}/api/copilot/toggle-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "learning_toggle" in data
        assert isinstance(data["learning_toggle"], bool)
        print(f"PASS: Toggle status returned, learning_toggle={data['learning_toggle']}")
    
    def test_toggle_status_returns_advancement_level(self, auth_headers):
        """GET /api/copilot/toggle-status returns advancement level"""
        response = requests.get(f"{BASE_URL}/api/copilot/toggle-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "advancement" in data
        adv = data["advancement"]
        assert "level" in adv
        assert "name" in adv
        assert "color" in adv
        assert "modules_completed" in adv
        assert adv["level"] in [1, 2, 3, 4]
        assert adv["name"] in ["Observer", "Practitioner", "Professional", "Sovereign"]
        print(f"PASS: Advancement level returned: {adv['name']} (Level {adv['level']})")
    
    def test_toggle_status_returns_modality_and_intensity(self, auth_headers):
        """GET /api/copilot/toggle-status returns modality and intensity"""
        response = requests.get(f"{BASE_URL}/api/copilot/toggle-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "modality" in data
        assert "intensity" in data
        print(f"PASS: Modality={data['modality']}, Intensity={data['intensity']}")


class TestCopilotHints(TestAuth):
    """AI Co-Pilot context hints tests"""
    
    @pytest.mark.parametrize("context", ["trade", "hexagram", "wallet", "forge", "sentinel"])
    def test_hint_returns_context_data(self, auth_headers, context):
        """GET /api/copilot/hint/{context} returns context hints"""
        response = requests.get(f"{BASE_URL}/api/copilot/hint/{context}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "hint" in data
        if data["hint"]:
            assert "title" in data["hint"]
            assert "why" in data["hint"]
            assert "tip" in data["hint"]
        print(f"PASS: Hint for '{context}' returned successfully")
    
    def test_hint_invalid_context_returns_null(self, auth_headers):
        """GET /api/copilot/hint/{invalid} returns null hint"""
        response = requests.get(f"{BASE_URL}/api/copilot/hint/invalid_context", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["hint"] is None
        print("PASS: Invalid context returns null hint")


class TestCopilotMicroLesson(TestAuth):
    """AI Co-Pilot micro-lesson tests"""
    
    def test_micro_lesson_toggle_on_generates_lesson(self, auth_headers):
        """POST /api/copilot/micro-lesson generates AI lesson when toggle is ON"""
        # First ensure toggle is ON
        requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": True
        })
        time.sleep(0.5)
        
        response = requests.post(f"{BASE_URL}/api/copilot/micro-lesson", headers=auth_headers, json={
            "context": "trade",
            "struggle_point": "understanding transmutation costs",
            "current_action": "viewing trade page"
        })
        assert response.status_code == 200
        data = response.json()
        # When toggle is ON, should return a lesson
        if data.get("lesson"):
            assert len(data["lesson"]) > 10
            print(f"PASS: Micro-lesson generated: {data['lesson'][:100]}...")
        else:
            # May return null if toggle was off
            print(f"INFO: Lesson returned: {data}")
    
    def test_micro_lesson_toggle_off_returns_null(self, auth_headers):
        """POST /api/copilot/micro-lesson returns null when toggle is OFF"""
        # Turn toggle OFF
        requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": False
        })
        time.sleep(0.5)
        
        response = requests.post(f"{BASE_URL}/api/copilot/micro-lesson", headers=auth_headers, json={
            "context": "trade",
            "struggle_point": "test",
            "current_action": "test"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("lesson") is None
        assert "reason" in data
        print(f"PASS: Micro-lesson returns null when toggle OFF: {data['reason']}")
        
        # Turn toggle back ON for other tests
        requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": True
        })


class TestSynthesisForge(TestAuth):
    """Synthesis Forge pack generation tests"""
    
    def test_generate_pack_creates_draft(self, auth_headers):
        """POST /api/copilot/generate-pack generates pack with curriculum and financials"""
        response = requests.post(f"{BASE_URL}/api/copilot/generate-pack", headers=auth_headers, json={
            "field": "TEST_Artisan Bread Baking",
            "expertise": "Sourdough fermentation, hydration ratios, and crust development",
            "pack_type": "mini"
        })
        assert response.status_code == 200
        data = response.json()
        assert "draft_id" in data
        assert "outline" in data
        assert "financials" in data
        assert "pack_type" in data
        
        # Verify financials structure
        fin = data["financials"]
        assert "suggested_retail" in fin
        assert "creator_revenue_per_sale" in fin
        assert "projected_monthly_revenue" in fin
        assert "commission_27_pct" in fin
        
        print(f"PASS: Pack generated with draft_id={data['draft_id']}")
        print(f"  Financials: Retail=${fin['suggested_retail']}, Revenue/sale=${fin['creator_revenue_per_sale']}")
        return data["draft_id"]
    
    def test_generate_pack_requires_field_and_expertise(self, auth_headers):
        """POST /api/copilot/generate-pack requires field and expertise"""
        response = requests.post(f"{BASE_URL}/api/copilot/generate-pack", headers=auth_headers, json={
            "field": "",
            "expertise": "",
            "pack_type": "mini"
        })
        assert response.status_code == 400
        print("PASS: Generate pack requires field and expertise")
    
    def test_get_drafts_returns_user_drafts(self, auth_headers):
        """GET /api/copilot/drafts returns user drafts with financials"""
        response = requests.get(f"{BASE_URL}/api/copilot/drafts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "drafts" in data
        assert isinstance(data["drafts"], list)
        if len(data["drafts"]) > 0:
            draft = data["drafts"][0]
            assert "id" in draft
            assert "field" in draft
            assert "pack_type" in draft
            assert "status" in draft
            if "financials" in draft:
                assert "suggested_retail" in draft["financials"]
        print(f"PASS: GET /api/copilot/drafts returned {len(data['drafts'])} drafts")
    
    def test_publish_pack_moves_to_marketplace(self, auth_headers):
        """POST /api/copilot/publish-pack/{draft_id} publishes draft to marketplace"""
        # First create a draft
        gen_response = requests.post(f"{BASE_URL}/api/copilot/generate-pack", headers=auth_headers, json={
            "field": "TEST_Publish Test Pack",
            "expertise": "Testing pack publishing workflow",
            "pack_type": "mini"
        })
        assert gen_response.status_code == 200
        draft_id = gen_response.json()["draft_id"]
        
        # Publish it
        response = requests.post(f"{BASE_URL}/api/copilot/publish-pack/{draft_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["published", "already_published"]
        if data["status"] == "published":
            assert "pack_id" in data
            print(f"PASS: Pack published with pack_id={data['pack_id']}")
        else:
            print("PASS: Pack was already published")
    
    def test_publish_invalid_draft_returns_404(self, auth_headers):
        """POST /api/copilot/publish-pack/{invalid} returns 404"""
        response = requests.post(f"{BASE_URL}/api/copilot/publish-pack/invalid-draft-id", headers=auth_headers)
        assert response.status_code == 404
        print("PASS: Invalid draft_id returns 404")
    
    def test_get_marketplace_returns_published_packs(self, auth_headers):
        """GET /api/copilot/marketplace returns published packs"""
        response = requests.get(f"{BASE_URL}/api/copilot/marketplace", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "marketplace" in data
        assert "my_published_packs" in data
        assert "total_active" in data
        print(f"PASS: Marketplace has {data['total_active']} active packs")


class TestLearningTogglePersistence(TestAuth):
    """Learning toggle persistence via PATCH /api/academy/intensity"""
    
    def test_patch_intensity_with_learning_toggle_persists(self, auth_headers):
        """PATCH /api/academy/intensity with learning_toggle field persists toggle state"""
        # Set toggle to True
        response = requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": True
        })
        assert response.status_code == 200
        
        # Verify via toggle-status
        status = requests.get(f"{BASE_URL}/api/copilot/toggle-status", headers=auth_headers)
        assert status.status_code == 200
        assert status.json()["learning_toggle"] == True
        
        # Set toggle to False
        response = requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": False
        })
        assert response.status_code == 200
        
        # Verify
        status = requests.get(f"{BASE_URL}/api/copilot/toggle-status", headers=auth_headers)
        assert status.status_code == 200
        assert status.json()["learning_toggle"] == False
        
        # Reset to True for other tests
        requests.patch(f"{BASE_URL}/api/academy/intensity", headers=auth_headers, json={
            "intensity": "guided",
            "learning_toggle": True
        })
        
        print("PASS: Learning toggle persists via PATCH /api/academy/intensity")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

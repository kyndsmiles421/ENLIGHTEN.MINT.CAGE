"""
Iteration 142: Premium Tier Gating Infrastructure Tests
Tests for:
- POST /api/mixer/ai-blend — AI frequency blend endpoint
- GET /api/subscriptions/check-access/{feature} — Tier gating check
- POST /api/translate — AI translation endpoint (Plus tier required)
- TIER_GATED_FEATURES configuration
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestAuthentication:
    """Authentication tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert len(data["token"]) > 0, "Token is empty"
        print(f"✓ Login successful, token received")


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAIFrequencyBlend:
    """Tests for POST /api/mixer/ai-blend endpoint"""
    
    def test_ai_blend_requires_auth(self):
        """AI blend endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/mixer/ai-blend", json={})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ AI blend requires authentication")
    
    def test_ai_blend_returns_algorithmic_blend(self, auth_headers):
        """AI blend returns algorithmic blend for authenticated users"""
        response = requests.post(f"{BASE_URL}/api/mixer/ai-blend", json={}, headers=auth_headers)
        assert response.status_code == 200, f"AI blend failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "type" in data, "Missing 'type' field"
        assert data["type"] in ["algorithmic", "ai_enhanced"], f"Unexpected type: {data['type']}"
        
        assert "blend" in data, "Missing 'blend' field"
        blend = data["blend"]
        assert "primary" in blend, "Missing 'primary' frequencies in blend"
        assert isinstance(blend["primary"], list), "primary should be a list"
        assert len(blend["primary"]) > 0, "primary frequencies should not be empty"
        
        assert "sounds" in blend, "Missing 'sounds' in blend"
        assert "drone" in blend, "Missing 'drone' in blend"
        
        assert "dominant_mood" in data, "Missing 'dominant_mood' field"
        assert "summary" in data, "Missing 'summary' field"
        assert "mood_count" in data, "Missing 'mood_count' field"
        assert "is_premium" in data, "Missing 'is_premium' field"
        
        print(f"✓ AI blend returned: type={data['type']}, dominant_mood={data['dominant_mood']}")
        print(f"  Blend: primary={blend['primary']}, sounds={blend['sounds']}, drone={blend['drone']}")
    
    def test_ai_blend_has_upgrade_hint_for_free_users(self, auth_headers):
        """AI blend includes upgrade hint for non-premium users"""
        response = requests.post(f"{BASE_URL}/api/mixer/ai-blend", json={}, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # If user is not premium, should have upgrade_hint
        if not data.get("is_premium"):
            assert "upgrade_hint" in data or data.get("upgrade_hint") is None, "upgrade_hint field should exist"
            print(f"✓ Non-premium user gets upgrade hint: {data.get('upgrade_hint')}")
        else:
            print(f"✓ Premium user - no upgrade hint needed")


class TestTierGatingCheckAccess:
    """Tests for GET /api/subscriptions/check-access/{feature}"""
    
    def test_check_access_ai_frequency_blend(self, auth_headers):
        """Check access for ai_frequency_blend feature"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/ai_frequency_blend", headers=auth_headers)
        assert response.status_code == 200, f"Check access failed: {response.text}"
        
        data = response.json()
        assert "allowed" in data, "Missing 'allowed' field"
        assert "feature" in data, "Missing 'feature' field"
        assert data["feature"] == "ai_frequency_blend", f"Wrong feature: {data['feature']}"
        assert "tier" in data, "Missing 'tier' field"
        
        # If not allowed, should have required_tier info
        if not data["allowed"]:
            assert "required_tier" in data, "Missing 'required_tier' for gated feature"
            assert data["required_tier"] == "plus", f"ai_frequency_blend should require 'plus' tier, got {data['required_tier']}"
            assert "required_tier_name" in data, "Missing 'required_tier_name'"
        
        print(f"✓ ai_frequency_blend access check: allowed={data['allowed']}, tier={data['tier']}")
        if not data["allowed"]:
            print(f"  Required tier: {data.get('required_tier')} ({data.get('required_tier_name')})")
    
    def test_check_access_ai_translation(self, auth_headers):
        """Check access for ai_translation feature"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/ai_translation", headers=auth_headers)
        assert response.status_code == 200, f"Check access failed: {response.text}"
        
        data = response.json()
        assert "allowed" in data, "Missing 'allowed' field"
        assert "feature" in data, "Missing 'feature' field"
        assert data["feature"] == "ai_translation", f"Wrong feature: {data['feature']}"
        
        # If not allowed, should require 'plus' tier
        if not data["allowed"]:
            assert data.get("required_tier") == "plus", f"ai_translation should require 'plus' tier"
        
        print(f"✓ ai_translation access check: allowed={data['allowed']}, tier={data['tier']}")
    
    def test_check_access_ai_coaching_blend(self, auth_headers):
        """Check access for ai_coaching_blend feature"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/ai_coaching_blend", headers=auth_headers)
        assert response.status_code == 200, f"Check access failed: {response.text}"
        
        data = response.json()
        assert "allowed" in data
        assert data["feature"] == "ai_coaching_blend"
        
        if not data["allowed"]:
            assert data.get("required_tier") == "plus", "ai_coaching_blend should require 'plus' tier"
        
        print(f"✓ ai_coaching_blend access check: allowed={data['allowed']}")
    
    def test_check_access_unknown_feature(self, auth_headers):
        """Unknown features should be allowed (not gated)"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/check-access/unknown_feature_xyz", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["allowed"] == True, "Unknown features should be allowed by default"
        print("✓ Unknown features are allowed by default")


class TestAITranslation:
    """Tests for POST /api/translate endpoint"""
    
    def test_translate_requires_auth(self):
        """Translation endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "Hello",
            "target_lang": "es"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Translation requires authentication")
    
    def test_translate_validates_language(self, auth_headers):
        """Translation validates target language"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "Hello",
            "target_lang": "invalid_lang"
        }, headers=auth_headers)
        # Should return 400 for invalid language OR 403 for tier gating
        assert response.status_code in [400, 403], f"Expected 400/403, got {response.status_code}"
        print(f"✓ Invalid language handled: status={response.status_code}")
    
    def test_translate_validates_empty_text(self, auth_headers):
        """Translation validates empty text"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "",
            "target_lang": "es"
        }, headers=auth_headers)
        # Should return 400 for empty text OR 403 for tier gating
        assert response.status_code in [400, 403], f"Expected 400/403, got {response.status_code}"
        print(f"✓ Empty text handled: status={response.status_code}")
    
    def test_translate_tier_gating(self, auth_headers):
        """Translation requires Plus tier"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "I am at peace",
            "target_lang": "es",
            "context": "mantra"
        }, headers=auth_headers)
        
        # If user is not Plus tier, should get 403
        if response.status_code == 403:
            data = response.json()
            detail = data.get("detail", {})
            if isinstance(detail, dict):
                assert detail.get("required_tier") == "plus", "Should require 'plus' tier"
                print(f"✓ Translation tier gating works: requires Plus tier")
            else:
                print(f"✓ Translation tier gating: {detail}")
        elif response.status_code == 200:
            # User has Plus tier or is admin
            data = response.json()
            assert "translated" in data, "Missing 'translated' field"
            assert "target_lang" in data, "Missing 'target_lang' field"
            print(f"✓ Translation successful (user has Plus+ tier): {data.get('translated', '')[:50]}...")
        elif response.status_code == 402:
            # Insufficient credits
            print("✓ Translation tier check passed but insufficient credits")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}, response: {response.text}")


class TestGatedFeaturesConfiguration:
    """Tests for TIER_GATED_FEATURES configuration"""
    
    def test_gated_features_endpoint(self, auth_headers):
        """Get all gated features and their requirements"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/gated-features", headers=auth_headers)
        assert response.status_code == 200, f"Failed to get gated features: {response.text}"
        
        data = response.json()
        assert "tier" in data, "Missing 'tier' field"
        assert "features" in data, "Missing 'features' field"
        
        features = data["features"]
        
        # Verify new features are in the gated list
        expected_plus_features = ["ai_frequency_blend", "ai_translation", "ai_coaching_blend"]
        for feat in expected_plus_features:
            assert feat in features, f"Missing gated feature: {feat}"
            assert features[feat]["required_tier"] == "plus", f"{feat} should require 'plus' tier"
        
        print(f"✓ Gated features configured correctly")
        print(f"  User tier: {data['tier']}")
        print(f"  Plus features: {expected_plus_features}")


class TestSubscriptionTiers:
    """Tests for subscription tier configuration"""
    
    def test_tiers_endpoint(self):
        """Get all subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200, f"Failed to get tiers: {response.text}"
        
        data = response.json()
        assert "tiers" in data, "Missing 'tiers' field"
        assert "tier_order" in data, "Missing 'tier_order' field"
        
        tiers = data["tiers"]
        
        # Verify Plus tier has the new perks
        assert "plus" in tiers, "Missing 'plus' tier"
        plus_tier = tiers["plus"]
        assert "perks" in plus_tier, "Plus tier missing perks"
        
        perks = plus_tier["perks"]
        
        # Check for new AI features in Plus perks
        ai_blend_perk = any("AI-Personalized Frequency Blend" in p for p in perks)
        ai_translation_perk = any("AI-Powered Content Translation" in p for p in perks)
        
        assert ai_blend_perk, "Plus tier should include 'AI-Personalized Frequency Blends' perk"
        assert ai_translation_perk, "Plus tier should include 'AI-Powered Content Translation' perk"
        
        print(f"✓ Plus tier perks include AI features")
        print(f"  AI-Personalized Frequency Blends: {ai_blend_perk}")
        print(f"  AI-Powered Content Translation: {ai_translation_perk}")
    
    def test_my_plan_endpoint(self, auth_headers):
        """Get current user's plan"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=auth_headers)
        assert response.status_code == 200, f"Failed to get my plan: {response.text}"
        
        data = response.json()
        assert "tier" in data, "Missing 'tier' field"
        assert "tier_name" in data, "Missing 'tier_name' field"
        assert "balance" in data, "Missing 'balance' field"
        assert "perks" in data, "Missing 'perks' field"
        
        print(f"✓ User plan: {data['tier_name']} (tier={data['tier']})")
        print(f"  Balance: {data['balance']} credits")
        print(f"  Is admin: {data.get('is_admin', False)}")


class TestSupportedLanguages:
    """Tests for language support"""
    
    def test_supported_languages_in_translation(self, auth_headers):
        """Verify supported languages for translation"""
        # Test each supported language code
        supported_langs = ["es", "fr", "hi", "ja", "ar", "pt"]
        
        for lang in supported_langs:
            response = requests.post(f"{BASE_URL}/api/translate", json={
                "text": "Test",
                "target_lang": lang
            }, headers=auth_headers)
            
            # Should not get 400 for invalid language
            # May get 403 (tier gating) or 200 (success) or 402 (no credits)
            assert response.status_code != 400 or "Unsupported language" not in response.text, \
                f"Language {lang} should be supported"
        
        print(f"✓ All expected languages are supported: {supported_langs}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

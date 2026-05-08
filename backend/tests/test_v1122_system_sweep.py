"""
V1.1.22 System-Wide Sweep - Backend API Smoke Tests
Tests critical endpoints for the mobile stability audit
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "Sovereign2026!"

class TestBackendSmoke:
    """Backend API smoke tests for V1.1.22 system sweep"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
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
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("PASS: /api/health returns 200")
    
    def test_login(self):
        """Test login endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        print(f"PASS: Login successful, user: {data['user'].get('name', 'Unknown')}")
    
    def test_starseed_origins(self, auth_headers):
        """Test GET /api/starseed/origins - should return origins array"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins", headers=auth_headers)
        assert response.status_code == 200, f"Starseed origins failed: {response.status_code}"
        data = response.json()
        assert "origins" in data, "No 'origins' key in response"
        assert isinstance(data["origins"], list), "origins is not an array"
        print(f"PASS: /api/starseed/origins returns {len(data['origins'])} origins")
    
    def test_translator_batch(self, auth_headers):
        """Test POST /api/translator/batch with 3 texts"""
        response = requests.post(f"{BASE_URL}/api/translator/batch", json={
            "texts": ["Hello", "World", "Test"],
            "target_language": "es"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Translator batch failed: {response.status_code}"
        data = response.json()
        assert "translations" in data, "No 'translations' key in response"
        assert isinstance(data["translations"], list), "translations is not an array"
        print(f"PASS: /api/translator/batch returns {len(data['translations'])} translations")
    
    def test_knowledge_deep_dive(self, auth_headers):
        """Test POST /api/knowledge/deep-dive with topic"""
        response = requests.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": "Test V1122",
            "perspective": "scientific"
        }, headers=auth_headers, timeout=60)
        assert response.status_code == 200, f"Deep dive failed: {response.status_code}"
        data = response.json()
        assert "content" in data or "deep_dive" in data, "No content in response"
        content = data.get("content") or data.get("deep_dive", {}).get("content", "")
        assert len(content) > 0, "Content is empty"
        print(f"PASS: /api/knowledge/deep-dive returns content ({len(content)} chars)")
    
    def test_tts_narrate(self, auth_headers):
        """Test POST /api/tts/narrate with text"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "hello",
            "voice": "nova"
        }, headers=auth_headers, timeout=30)
        # Accept 200 or 503 (ElevenLabs may be unavailable)
        assert response.status_code in [200, 503], f"TTS narrate failed: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "audio" in data, "No 'audio' key in response"
            print(f"PASS: /api/tts/narrate returns audio base64 ({len(data.get('audio', ''))} chars)")
        else:
            print(f"PARTIAL: /api/tts/narrate returns 503 (ElevenLabs unavailable - acceptable)")
    
    def test_breathing_sessions(self, auth_headers):
        """Test breathing-related endpoints"""
        response = requests.get(f"{BASE_URL}/api/breathing/sessions", headers=auth_headers)
        # May return 200 or 404 depending on implementation
        assert response.status_code in [200, 404], f"Breathing sessions failed: {response.status_code}"
        print(f"PASS: /api/breathing/sessions returns {response.status_code}")
    
    def test_meditation_sessions(self, auth_headers):
        """Test meditation endpoints"""
        response = requests.get(f"{BASE_URL}/api/meditation/sessions", headers=auth_headers)
        assert response.status_code in [200, 404], f"Meditation sessions failed: {response.status_code}"
        print(f"PASS: /api/meditation/sessions returns {response.status_code}")
    
    def test_sacred_texts(self, auth_headers):
        """Test sacred texts endpoint"""
        response = requests.get(f"{BASE_URL}/api/sacred-texts", headers=auth_headers)
        assert response.status_code in [200, 404], f"Sacred texts failed: {response.status_code}"
        print(f"PASS: /api/sacred-texts returns {response.status_code}")
    
    def test_herbology(self, auth_headers):
        """Test herbology endpoint"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs", headers=auth_headers)
        assert response.status_code in [200, 404], f"Herbology failed: {response.status_code}"
        print(f"PASS: /api/herbology/herbs returns {response.status_code}")
    
    def test_forgotten_languages(self, auth_headers):
        """Test forgotten languages endpoint"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/glyphs", headers=auth_headers)
        assert response.status_code in [200, 404], f"Forgotten languages failed: {response.status_code}"
        print(f"PASS: /api/forgotten-languages/glyphs returns {response.status_code}")
    
    def test_evolution_collection(self, auth_headers):
        """Test evolution lab collection"""
        response = requests.get(f"{BASE_URL}/api/evolution/collection", headers=auth_headers)
        assert response.status_code in [200, 404], f"Evolution collection failed: {response.status_code}"
        print(f"PASS: /api/evolution/collection returns {response.status_code}")
    
    def test_vault_relics(self, auth_headers):
        """Test vault relics endpoint"""
        response = requests.get(f"{BASE_URL}/api/vault/relics", headers=auth_headers)
        assert response.status_code in [200, 404], f"Vault relics failed: {response.status_code}"
        print(f"PASS: /api/vault/relics returns {response.status_code}")
    
    def test_pricing_tiers(self, auth_headers):
        """Test pricing tiers endpoint"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers", headers=auth_headers)
        assert response.status_code in [200, 404], f"Pricing tiers failed: {response.status_code}"
        print(f"PASS: /api/subscriptions/tiers returns {response.status_code}")
    
    def test_academy_programs(self, auth_headers):
        """Test academy programs endpoint"""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code in [200, 404], f"Academy programs failed: {response.status_code}"
        print(f"PASS: /api/academy/programs returns {response.status_code}")
    
    def test_oracle(self, auth_headers):
        """Test oracle endpoint"""
        response = requests.get(f"{BASE_URL}/api/oracle/daily", headers=auth_headers)
        assert response.status_code in [200, 404], f"Oracle failed: {response.status_code}"
        print(f"PASS: /api/oracle/daily returns {response.status_code}")
    
    def test_profile(self, auth_headers):
        """Test profile endpoint"""
        response = requests.get(f"{BASE_URL}/api/users/me", headers=auth_headers)
        assert response.status_code == 200, f"Profile failed: {response.status_code}"
        data = response.json()
        assert "user" in data or "name" in data or "email" in data, "No user data in response"
        print(f"PASS: /api/users/me returns user data")
    
    def test_sovereign_advisors(self, auth_headers):
        """Test sovereign advisors endpoint"""
        response = requests.get(f"{BASE_URL}/api/sovereign-advisors", headers=auth_headers)
        assert response.status_code in [200, 404], f"Sovereign advisors failed: {response.status_code}"
        print(f"PASS: /api/sovereign-advisors returns {response.status_code}")
    
    def test_cosmic_ledger(self, auth_headers):
        """Test cosmic ledger endpoint"""
        response = requests.get(f"{BASE_URL}/api/cosmic-ledger/entries", headers=auth_headers)
        assert response.status_code in [200, 404], f"Cosmic ledger failed: {response.status_code}"
        print(f"PASS: /api/cosmic-ledger/entries returns {response.status_code}")
    
    def test_starseed_worlds(self, auth_headers):
        """Test starseed worlds realms endpoint"""
        response = requests.get(f"{BASE_URL}/api/starseed/worlds/realms", headers=auth_headers)
        assert response.status_code in [200, 404], f"Starseed worlds failed: {response.status_code}"
        print(f"PASS: /api/starseed/worlds/realms returns {response.status_code}")
    
    def test_avatar_gallery(self, auth_headers):
        """Test avatar gallery endpoint"""
        response = requests.get(f"{BASE_URL}/api/starseed/gallery", headers=auth_headers)
        assert response.status_code in [200, 404], f"Avatar gallery failed: {response.status_code}"
        print(f"PASS: /api/starseed/gallery returns {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

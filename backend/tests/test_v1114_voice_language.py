"""
V1.1.14 Voice API Tests — Language Field Routing
Tests that POST /api/voice/sage-narrate accepts optional `language` field
and auto-routes to eleven_multilingual_v2 for non-English languages.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from /app/memory/test_credentials.md
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "Sovereign2026!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for Sovereign tier account."""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Auth failed: {response.status_code} - {response.text[:200]}")
    data = response.json()
    token = data.get("token") or data.get("access_token")
    if not token:
        pytest.skip("No token in auth response")
    return token


class TestVoiceLanguageRouting:
    """V1.1.14 — Test language field acceptance and model routing."""

    def test_sage_narrate_accepts_language_field_english(self, auth_token):
        """POST /api/voice/sage-narrate with language='en' should NOT return 422."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hello", "language": "en"}
        )
        # Should NOT be 422 (validation error) — language field is accepted
        assert response.status_code != 422, f"422 Validation Error - language field not accepted: {response.text}"
        # 200 = success, 503 = ElevenLabs key not configured (acceptable)
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code} - {response.text[:200]}"
        print(f"✓ language='en' accepted, status={response.status_code}")

    def test_sage_narrate_accepts_language_field_spanish(self, auth_token):
        """POST /api/voice/sage-narrate with language='es' should NOT return 422."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hola", "language": "es"}
        )
        assert response.status_code != 422, f"422 Validation Error - language field not accepted: {response.text}"
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code} - {response.text[:200]}"
        print(f"✓ language='es' accepted, status={response.status_code}")

    def test_sage_narrate_accepts_language_field_japanese(self, auth_token):
        """POST /api/voice/sage-narrate with language='ja' should NOT return 422."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "こんにちは", "language": "ja"}
        )
        assert response.status_code != 422, f"422 Validation Error - language field not accepted: {response.text}"
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code} - {response.text[:200]}"
        print(f"✓ language='ja' accepted, status={response.status_code}")

    def test_sage_narrate_without_language_field(self, auth_token):
        """POST /api/voice/sage-narrate without language field should still work."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hello world"}
        )
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code} - {response.text[:200]}"
        print(f"✓ No language field accepted, status={response.status_code}")

    def test_sage_narrate_model_routing_english_default(self, auth_token):
        """When language='en', model_id should default to eleven_flash_v2_5."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hello", "language": "en"}
        )
        if response.status_code == 200:
            data = response.json()
            model_id = data.get("model_id", "")
            # For English, should use default flash model
            assert model_id == "eleven_flash_v2_5", f"Expected eleven_flash_v2_5 for English, got {model_id}"
            print(f"✓ English routes to eleven_flash_v2_5")
        elif response.status_code == 503:
            print("⚠ ElevenLabs key not configured - model routing cannot be verified (acceptable)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")

    def test_sage_narrate_model_routing_non_english(self, auth_token):
        """When language='es' (non-English), model_id should auto-route to eleven_multilingual_v2."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hola mundo", "language": "es"}
        )
        if response.status_code == 200:
            data = response.json()
            model_id = data.get("model_id", "")
            # For non-English, should auto-route to multilingual model
            assert model_id == "eleven_multilingual_v2", f"Expected eleven_multilingual_v2 for Spanish, got {model_id}"
            print(f"✓ Spanish routes to eleven_multilingual_v2")
        elif response.status_code == 503:
            print("⚠ ElevenLabs key not configured - model routing cannot be verified (acceptable)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")

    def test_sage_narrate_explicit_model_overrides_language_routing(self, auth_token):
        """When explicit model_id is passed, it should override language-based routing."""
        response = requests.post(
            f"{BASE_URL}/api/voice/sage-narrate",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"text": "hola", "language": "es", "model_id": "eleven_flash_v2_5"}
        )
        if response.status_code == 200:
            data = response.json()
            model_id = data.get("model_id", "")
            # Explicit model_id should be respected even for non-English
            assert model_id == "eleven_flash_v2_5", f"Explicit model_id should be respected, got {model_id}"
            print(f"✓ Explicit model_id overrides language routing")
        elif response.status_code == 503:
            print("⚠ ElevenLabs key not configured - model override cannot be verified (acceptable)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")


class TestVoiceStatusEndpoint:
    """Test /api/voice/sage-narrate/status endpoint."""

    def test_voice_status_returns_defaults(self, auth_token):
        """GET /api/voice/sage-narrate/status should return configured status and defaults."""
        response = requests.get(
            f"{BASE_URL}/api/voice/sage-narrate/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Status endpoint failed: {response.status_code}"
        data = response.json()
        assert "configured" in data, "Missing 'configured' field"
        assert "default_voice_id" in data, "Missing 'default_voice_id' field"
        assert "default_model_id" in data, "Missing 'default_model_id' field"
        print(f"✓ Voice status: configured={data['configured']}, model={data['default_model_id']}")


class TestHealthAndAuth:
    """Basic health and auth tests."""

    def test_health_endpoint(self):
        """GET /api/health should return 200."""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("✓ Health endpoint OK")

    def test_auth_login(self):
        """POST /api/auth/login with valid credentials should return token."""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.status_code} - {response.text[:200]}"
        data = response.json()
        assert data.get("token") or data.get("access_token"), "No token in response"
        print("✓ Auth login OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

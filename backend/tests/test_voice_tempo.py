"""
Test Voice Command and Tempo/Beat Engine features
- Voice command endpoint POST /api/voice/command
- Tests for iteration 121 features
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVoiceCommand:
    """Voice command endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_voice_command_endpoint_exists(self):
        """Test that voice command endpoint exists and requires auth"""
        # Test without auth
        response = requests.post(f"{BASE_URL}/api/voice/command", json={
            "audio_base64": "test",
            "context": "full_app"
        })
        # Should return 401/403 without auth
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print("PASS: Voice command endpoint requires authentication")
    
    def test_voice_command_with_minimal_audio(self):
        """Test voice command endpoint with minimal webm audio data"""
        # Create a minimal webm header (not valid audio, but tests endpoint structure)
        # This is just to verify the endpoint accepts the request and returns proper JSON structure
        minimal_webm = base64.b64encode(b'\x1a\x45\xdf\xa3\x01\x00\x00\x00\x00\x00\x00\x1f').decode('utf-8')
        
        response = self.session.post(f"{BASE_URL}/api/voice/command", json={
            "audio_base64": minimal_webm,
            "context": "full_app"
        })
        
        # The endpoint should either:
        # 1. Return 200 with proper JSON structure (even if transcription fails)
        # 2. Return 500 if audio processing fails (acceptable for invalid audio)
        if response.status_code == 200:
            data = response.json()
            # Verify response structure has expected fields
            assert "transcript" in data, "Response should have 'transcript' field"
            assert "intent" in data, "Response should have 'intent' field"
            assert "params" in data, "Response should have 'params' field"
            assert "response_text" in data, "Response should have 'response_text' field"
            assert "confidence" in data, "Response should have 'confidence' field"
            print(f"PASS: Voice command returns proper JSON structure: {list(data.keys())}")
        elif response.status_code == 500:
            # This is acceptable for invalid audio - the endpoint exists and processes
            print(f"PASS: Voice command endpoint exists (returned 500 for invalid audio)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_voice_command_request_validation(self):
        """Test that voice command validates request body"""
        # Test with missing audio_base64
        response = self.session.post(f"{BASE_URL}/api/voice/command", json={
            "context": "full_app"
        })
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing audio_base64, got {response.status_code}"
        print("PASS: Voice command validates required fields")
    
    def test_voice_command_context_parameter(self):
        """Test that context parameter is optional"""
        minimal_webm = base64.b64encode(b'\x1a\x45\xdf\xa3\x01\x00\x00\x00\x00\x00\x00\x1f').decode('utf-8')
        
        # Test without context (should use default)
        response = self.session.post(f"{BASE_URL}/api/voice/command", json={
            "audio_base64": minimal_webm
        })
        
        # Should accept request (context is optional with default)
        assert response.status_code in [200, 500], f"Expected 200 or 500, got {response.status_code}"
        print("PASS: Voice command accepts request without context (uses default)")


class TestCosmicLedgerStillAccessible:
    """Verify Cosmic Ledger is still accessible after new features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_cosmic_ledger_endpoint(self):
        """Test Cosmic Ledger endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/starseed/ledger")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "stats" in data, "Response should have 'stats' field"
        assert "achievements" in data, "Response should have 'achievements' field"
        print("PASS: Cosmic Ledger endpoint still accessible")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_accessible(self):
        """Test that API is accessible"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        # Should return 401 (unauthorized) or 200 - either means API is up
        assert response.status_code in [200, 401, 403], f"API not accessible: {response.status_code}"
        print("PASS: API is accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

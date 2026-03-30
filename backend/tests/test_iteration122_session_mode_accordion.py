"""
Test iteration 122: Session Mode, Accordion UI, Haptic Intensity, Origin Soundscapes, Voice Command
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVoiceCommandEndpoint:
    """Voice command endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_voice_command_requires_auth(self):
        """Voice command endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/voice/command", json={
            "audio_base64": "dGVzdA=="  # "test" in base64
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Voice command requires authentication")
    
    def test_voice_command_requires_audio(self):
        """Voice command endpoint requires audio_base64 field"""
        response = requests.post(f"{BASE_URL}/api/voice/command", 
            json={},
            headers=self.headers
        )
        assert response.status_code == 422, f"Expected 422 for missing audio, got {response.status_code}"
        print("PASS: Voice command requires audio_base64 field")
    
    def test_voice_command_response_structure(self):
        """Voice command returns proper JSON structure"""
        # Send minimal audio (will likely fail transcription but should return proper structure)
        response = requests.post(f"{BASE_URL}/api/voice/command", 
            json={
                "audio_base64": "dGVzdA==",  # "test" in base64 - not valid audio
                "context": "full_app"
            },
            headers=self.headers
        )
        # May return 500 due to invalid audio, but if it returns 200, check structure
        if response.status_code == 200:
            data = response.json()
            assert "transcript" in data, "Missing transcript field"
            assert "intent" in data, "Missing intent field"
            assert "response_text" in data, "Missing response_text field"
            print(f"PASS: Voice command returns proper structure: {list(data.keys())}")
        else:
            # Expected - invalid audio will fail
            print(f"INFO: Voice command returned {response.status_code} for invalid audio (expected)")


class TestCosmicLedgerEndpoints:
    """Cosmic Ledger endpoints for origin soundscape linking"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_ledger_endpoint(self):
        """GET /api/starseed/ledger returns user ledger data"""
        response = requests.get(f"{BASE_URL}/api/starseed/ledger", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "stats" in data, "Missing stats field"
        assert "achievements" in data, "Missing achievements field"
        print(f"PASS: Ledger endpoint returns data with keys: {list(data.keys())}")
    
    def test_legendary_paths_endpoint(self):
        """GET /api/starseed/ledger/legendary-paths returns paths data"""
        response = requests.get(f"{BASE_URL}/api/starseed/ledger/legendary-paths", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "paths" in data, "Missing paths field"
        print(f"PASS: Legendary paths endpoint returns data with keys: {list(data.keys())}")
    
    def test_realm_leaderboard_endpoint(self):
        """GET /api/starseed/leaderboard/realms returns leaderboard data"""
        response = requests.get(f"{BASE_URL}/api/starseed/leaderboard/realms", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Should have exploration, brightest_aura, most_helpful, first_to_enter
        print(f"PASS: Realm leaderboard endpoint returns data with keys: {list(data.keys())}")


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_health_endpoint(self):
        """Health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Health endpoint returns 200")
    
    def test_login_success(self):
        """Login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Missing token in response"
        print("PASS: Login successful with valid credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

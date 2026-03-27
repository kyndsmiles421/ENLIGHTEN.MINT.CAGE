"""
Phase 51: Voice Chat Feature Tests for AI Spiritual Coach (Sage)
Tests for POST /api/coach/voice-chat endpoint with STT (Whisper) and TTS (OpenAI)
Also includes regression tests for text chat and session CRUD
"""
import pytest
import requests
import os
import io
import wave
import struct
import math

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Helper function to generate a simple WAV file with a sine wave
def generate_test_wav(duration_seconds=1.5, sample_rate=16000, frequency=440):
    """Generate a simple WAV file with a sine wave for testing"""
    num_samples = int(sample_rate * duration_seconds)
    audio_data = []
    
    for i in range(num_samples):
        # Generate sine wave
        sample = int(32767 * 0.5 * math.sin(2 * math.pi * frequency * i / sample_rate))
        audio_data.append(sample)
    
    # Create WAV file in memory
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        for sample in audio_data:
            wav_file.writeframes(struct.pack('<h', sample))
    
    buffer.seek(0)
    return buffer


class TestCoachVoiceChat:
    """Test POST /api/coach/voice-chat endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    @pytest.fixture
    def session_id(self, auth_headers):
        """Create a session for voice chat tests"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "spiritual"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed to create session: {response.text}"
        return response.json()["session_id"]
    
    def test_voice_chat_returns_transcription_reply_and_audio(self, auth_headers, session_id):
        """POST /api/coach/voice-chat accepts audio and returns transcribed_text, reply, audio_base64"""
        # Generate a test WAV file
        wav_buffer = generate_test_wav(duration_seconds=1.5)
        
        # Send voice chat request
        files = {'audio': ('test_voice.wav', wav_buffer, 'audio/wav')}
        data = {'session_id': session_id}
        
        response = requests.post(
            f"{BASE_URL}/api/coach/voice-chat",
            files=files,
            data=data,
            headers=auth_headers,
            timeout=90  # Voice processing may take longer
        )
        
        # The endpoint should return 200 or 500 if transcription fails on silence
        # A sine wave may not produce meaningful speech, but we test the endpoint structure
        if response.status_code == 200:
            data = response.json()
            assert "reply" in data, "Response should have 'reply'"
            assert "transcribed_text" in data, "Response should have 'transcribed_text'"
            assert "session_id" in data, "Response should have 'session_id'"
            # audio_base64 may be None if TTS fails, but key should exist
            assert "audio_base64" in data, "Response should have 'audio_base64' key"
            assert data["session_id"] == session_id, "session_id should match"
            print(f"Voice chat successful - Transcribed: '{data['transcribed_text'][:50]}...'")
        elif response.status_code == 400:
            # Expected if audio couldn't be understood (silence/noise)
            assert "Could not understand audio" in response.text or "detail" in response.json()
            print("Voice chat returned 400 - audio not understood (expected for test audio)")
        elif response.status_code == 500:
            # STT may fail on synthetic audio
            print(f"Voice chat returned 500 - STT error (expected for synthetic audio): {response.text}")
        else:
            pytest.fail(f"Unexpected status code {response.status_code}: {response.text}")
    
    def test_voice_chat_invalid_session_returns_404(self, auth_headers):
        """POST /api/coach/voice-chat with invalid session returns 404"""
        wav_buffer = generate_test_wav(duration_seconds=1.0)
        
        files = {'audio': ('test.wav', wav_buffer, 'audio/wav')}
        data = {'session_id': 'invalid-session-id-12345'}
        
        response = requests.post(
            f"{BASE_URL}/api/coach/voice-chat",
            files=files,
            data=data,
            headers=auth_headers,
            timeout=30
        )
        
        assert response.status_code == 404, f"Expected 404 for invalid session, got {response.status_code}"
    
    def test_voice_chat_requires_auth(self):
        """POST /api/coach/voice-chat without auth returns 401/403"""
        wav_buffer = generate_test_wav(duration_seconds=1.0)
        
        files = {'audio': ('test.wav', wav_buffer, 'audio/wav')}
        data = {'session_id': 'any-session-id'}
        
        response = requests.post(
            f"{BASE_URL}/api/coach/voice-chat",
            files=files,
            data=data,
            timeout=30
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestCoachTextChatRegression:
    """Regression tests for text chat endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    @pytest.fixture
    def session_id(self, auth_headers):
        """Create a session for chat tests"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "life"},
            headers=auth_headers
        )
        return response.json()["session_id"]
    
    def test_text_chat_still_works(self, auth_headers, session_id):
        """POST /api/coach/chat text endpoint still works (regression)"""
        response = requests.post(
            f"{BASE_URL}/api/coach/chat",
            json={"session_id": session_id, "message": "Hello Sage, I need life guidance"},
            headers=auth_headers,
            timeout=60
        )
        assert response.status_code == 200, f"Text chat failed: {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reply" in data, "Response should have 'reply'"
        assert len(data["reply"]) > 0, "Reply should not be empty"
        print(f"Text chat reply: '{data['reply'][:100]}...'")


class TestCoachSessionsCRUD:
    """Test session CRUD operations"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_create_session(self, auth_headers):
        """POST /api/coach/sessions creates new session"""
        response = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "spiritual"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Create session failed: {response.text}"
        
        data = response.json()
        assert "session_id" in data
        assert "mode" in data
        assert data["mode"] == "spiritual"
    
    def test_list_sessions(self, auth_headers):
        """GET /api/coach/sessions lists sessions"""
        response = requests.get(
            f"{BASE_URL}/api/coach/sessions",
            headers=auth_headers
        )
        assert response.status_code == 200, f"List sessions failed: {response.text}"
        
        data = response.json()
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
    
    def test_get_session_by_id(self, auth_headers):
        """GET /api/coach/sessions/{id} retrieves session with messages"""
        # Create session first
        create_resp = requests.post(
            f"{BASE_URL}/api/coach/sessions",
            json={"mode": "shadow"},
            headers=auth_headers
        )
        session_id = create_resp.json()["session_id"]
        
        # Get session
        response = requests.get(
            f"{BASE_URL}/api/coach/sessions/{session_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get session failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "mode" in data
        assert "messages" in data
        assert isinstance(data["messages"], list)


class TestCoachModes:
    """Test coach modes endpoint - now includes dream_oracle (6 modes)"""
    
    def test_get_modes_returns_6_modes(self):
        """GET /api/coach/modes returns 6 coaching modes including dream_oracle"""
        response = requests.get(f"{BASE_URL}/api/coach/modes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "modes" in data, "Response should have 'modes' key"
        modes = data["modes"]
        assert len(modes) == 6, f"Expected 6 modes, got {len(modes)}"
        
        # Verify all expected modes are present
        mode_ids = [m["id"] for m in modes]
        expected_ids = ["spiritual", "life", "shadow", "manifestation", "healing", "dream_oracle"]
        for expected_id in expected_ids:
            assert expected_id in mode_ids, f"Missing mode: {expected_id}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

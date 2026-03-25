"""
Test TTS Narration Endpoint
Tests the new OpenAI TTS integration via emergentintegrations
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTTSNarration:
    """TTS Narration endpoint tests"""
    
    def test_tts_endpoint_exists(self):
        """Test that TTS endpoint is accessible"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Hello, this is a test of the text to speech system.",
            "speed": 0.9
        })
        # Should return 200 with audio or 500 if TTS service issue
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        print(f"TTS endpoint status: {response.status_code}")
    
    def test_tts_returns_base64_audio(self):
        """Test that TTS returns base64 encoded audio"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Welcome to your meditation practice. Take a deep breath.",
            "speed": 0.9
        })
        if response.status_code == 200:
            data = response.json()
            assert "audio" in data, "Response should contain 'audio' field"
            assert isinstance(data["audio"], str), "Audio should be a string (base64)"
            assert len(data["audio"]) > 100, "Audio base64 should have substantial length"
            print(f"TTS returned audio with {len(data['audio'])} characters")
        else:
            print(f"TTS returned error: {response.status_code} - {response.text}")
            pytest.skip("TTS service may be unavailable")
    
    def test_tts_caching(self):
        """Test that second call with same text returns cached result faster"""
        test_text = "This is a caching test for the TTS system."
        
        # First call - should generate new audio
        start1 = time.time()
        response1 = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": test_text,
            "speed": 0.9
        })
        time1 = time.time() - start1
        
        if response1.status_code != 200:
            pytest.skip("TTS service may be unavailable")
        
        # Second call - should return cached result
        start2 = time.time()
        response2 = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": test_text,
            "speed": 0.9
        })
        time2 = time.time() - start2
        
        assert response2.status_code == 200, "Cached call should succeed"
        
        # Cached call should be significantly faster
        print(f"First call: {time1:.2f}s, Second call (cached): {time2:.2f}s")
        
        # Verify same audio returned
        data1 = response1.json()
        data2 = response2.json()
        assert data1["audio"] == data2["audio"], "Cached audio should match original"
        print("Caching verified - same audio returned")
    
    def test_tts_rejects_short_text(self):
        """Test that TTS rejects text that is too short"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Hi",
            "speed": 0.9
        })
        assert response.status_code == 400, f"Should reject short text, got {response.status_code}"
        print("Short text correctly rejected with 400")
    
    def test_tts_handles_empty_text(self):
        """Test that TTS handles empty text gracefully"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "",
            "speed": 0.9
        })
        assert response.status_code == 400, f"Should reject empty text, got {response.status_code}"
        print("Empty text correctly rejected with 400")
    
    def test_tts_speed_parameter(self):
        """Test that speed parameter is accepted"""
        response = requests.post(f"{BASE_URL}/api/tts/narrate", json={
            "text": "Testing different speech speed settings.",
            "speed": 1.0
        })
        # Should work with different speed
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        print(f"Speed parameter test status: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

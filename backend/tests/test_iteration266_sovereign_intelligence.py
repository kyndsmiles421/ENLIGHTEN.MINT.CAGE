"""
Iteration 266 - Sovereign LLM Intelligence Layer Tests
Tests for the 10-step premium intelligence features:
1. Expert-Domain Fine-Tuning (EXPERT_VECTORS)
2. 8-Language Cultural DNA (LANGUAGE_DNA)
3. Cross-Sovereign Memory Persistence (unified_state)
4. Sovereign Voice TTS (SOVEREIGN_VOICES)
5. Symbolic Math Verification (SymPy - verify_solfeggio, verify_geometry, verify_molecular)
6. SmartDock Pre-Warm endpoint
7. Adaptive Tone Calibration (detect_user_tone)
8. Usage Yield Economic Logic (get_usage_yield)
10. Void & Fade-Away (voice toggle)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMathVerificationSolfeggio:
    """Step 5: Symbolic Math Verification - Solfeggio frequencies"""

    def test_verify_solfeggio_528_valid(self, auth_headers):
        """Test that 528Hz is recognized as a valid primary Solfeggio frequency."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "solfeggio", "value": 528}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("valid") is True, f"Expected valid=True, got {data}"
        assert data.get("type") == "primary_solfeggio", f"Expected type=primary_solfeggio, got {data}"
        print(f"PASS: 528Hz verified as primary_solfeggio with digit_root={data.get('digit_root')}")

    def test_verify_solfeggio_396_valid(self, auth_headers):
        """Test that 396Hz is recognized as a valid primary Solfeggio frequency."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "solfeggio", "value": 396}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        assert data.get("type") == "primary_solfeggio"
        print(f"PASS: 396Hz verified as primary_solfeggio")

    def test_verify_solfeggio_999_invalid(self, auth_headers):
        """Test that 999Hz is NOT a valid Solfeggio frequency and returns closest suggestion."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "solfeggio", "value": 999}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is False, f"Expected valid=False for 999Hz, got {data}"
        assert "closest" in data, f"Expected 'closest' field in response, got {data}"
        # 963 is the closest Solfeggio to 999
        assert data.get("closest") == 963, f"Expected closest=963, got {data.get('closest')}"
        print(f"PASS: 999Hz invalid, closest suggestion: {data.get('closest')}")

    def test_verify_solfeggio_harmonic(self, auth_headers):
        """Test that harmonics of Solfeggio frequencies are recognized."""
        # 1056 = 528 * 2 (harmonic)
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "solfeggio", "value": 1056}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        assert data.get("type") == "harmonic"
        assert data.get("base") == 528
        assert data.get("multiplier") == 2
        print(f"PASS: 1056Hz verified as harmonic of 528Hz (multiplier=2)")


class TestMathVerificationGeometry:
    """Step 5: Symbolic Math Verification - Sacred Geometry ratios"""

    def test_verify_geometry_phi(self, auth_headers):
        """Test that phi (Golden Ratio) returns correct value."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "geometry", "value": "phi"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        # Phi should be approximately 1.618033988749895
        value = data.get("value")
        assert value is not None
        assert abs(value - 1.618033988749895) < 0.0001, f"Expected phi ~1.618, got {value}"
        print(f"PASS: phi = {value}")

    def test_verify_geometry_pi(self, auth_headers):
        """Test that pi returns correct value."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "geometry", "value": "pi"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        value = data.get("value")
        assert abs(value - 3.14159265) < 0.0001
        print(f"PASS: pi = {value}")

    def test_verify_geometry_sqrt2(self, auth_headers):
        """Test that sqrt2 returns correct value."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "geometry", "value": "sqrt2"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        value = data.get("value")
        assert abs(value - 1.41421356) < 0.0001
        print(f"PASS: sqrt2 = {value}")

    def test_verify_geometry_invalid(self, auth_headers):
        """Test that invalid geometry name returns available options."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "geometry", "value": "invalid_ratio"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is False
        assert "available" in data
        assert "phi" in data.get("available", [])
        print(f"PASS: Invalid geometry returns available options: {data.get('available')}")


class TestMathVerificationMolecular:
    """Step 5: Symbolic Math Verification - Molecular chemistry"""

    def test_verify_molecular_monk_fruit_mw(self, auth_headers):
        """Test monk fruit mogroside V molecular weight."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={
                "type": "molecular",
                "compound": "monk_fruit_mogroside_v",
                "property": "mw"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        assert data.get("value") == 1287.43, f"Expected MW=1287.43, got {data.get('value')}"
        print(f"PASS: monk_fruit_mogroside_v MW = {data.get('value')}")

    def test_verify_molecular_stevioside(self, auth_headers):
        """Test stevioside molecular weight."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={
                "type": "molecular",
                "compound": "stevioside",
                "property": "mw"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True
        assert data.get("value") == 804.87
        print(f"PASS: stevioside MW = {data.get('value')}")

    def test_verify_molecular_invalid_compound(self, auth_headers):
        """Test invalid compound returns available compounds."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={
                "type": "molecular",
                "compound": "unknown_compound",
                "property": "mw"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is False
        assert "available_compounds" in data
        print(f"PASS: Invalid compound returns available: {data.get('available_compounds')}")


class TestPreWarmEndpoint:
    """Step 6: SmartDock Pre-Warm endpoint"""

    def test_prewarm_economy(self, auth_headers):
        """Test pre-warm for economy page returns principal_economist."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/pre-warm/economy",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("sovereign_id") == "principal_economist"
        assert data.get("voice") == "sage"
        assert data.get("pre_warmed") is True
        print(f"PASS: economy pre-warm returns principal_economist with voice=sage")

    def test_prewarm_meditation(self, auth_headers):
        """Test pre-warm for meditation page returns zenith."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/pre-warm/meditation",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("sovereign_id") == "zenith"
        assert data.get("voice") == "fable"
        assert data.get("pre_warmed") is True
        print(f"PASS: meditation pre-warm returns zenith with voice=fable")

    def test_prewarm_academy(self, auth_headers):
        """Test pre-warm for academy page returns aurelius."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/pre-warm/academy",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("sovereign_id") == "aurelius"
        assert data.get("voice") == "ash"
        assert data.get("pre_warmed") is True
        print(f"PASS: academy pre-warm returns aurelius with voice=ash")

    def test_prewarm_star_chart(self, auth_headers):
        """Test pre-warm for star-chart page returns astraeus."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/pre-warm/star-chart",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("sovereign_id") == "astraeus"
        assert data.get("voice") == "echo"
        print(f"PASS: star-chart pre-warm returns astraeus with voice=echo")

    def test_prewarm_botany(self, auth_headers):
        """Test pre-warm for botany page returns gaea."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/pre-warm/botany",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("sovereign_id") == "gaea"
        assert data.get("voice") == "coral"
        print(f"PASS: botany pre-warm returns gaea with voice=coral")


class TestSovereignChat:
    """Test chat endpoint with intelligence layer features"""

    def test_chat_returns_knowledge_tier(self, auth_headers):
        """Test that chat response includes knowledge_tier field."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "Hello, what is your role?",
                "language": "en",
                "voice_enabled": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "knowledge_tier" in data, f"Expected knowledge_tier in response, got {data.keys()}"
        assert "user_tone" in data, f"Expected user_tone in response, got {data.keys()}"
        assert "voice" in data, f"Expected voice in response, got {data.keys()}"
        print(f"PASS: Chat returns knowledge_tier={data.get('knowledge_tier')}, user_tone={data.get('user_tone')}, voice={data.get('voice')}")

    def test_chat_voice_disabled_no_audio(self, auth_headers):
        """Test that voice_enabled=false returns audio_base64=null."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "Brief test message",
                "language": "en",
                "voice_enabled": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("audio_base64") is None, f"Expected audio_base64=null when voice disabled, got {data.get('audio_base64')}"
        print(f"PASS: voice_enabled=false returns audio_base64=null")

    def test_chat_response_has_voice_field(self, auth_headers):
        """Test that chat response includes voice field for the sovereign."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "grand_architect",
                "message": "What is your expertise?",
                "language": "en",
                "voice_enabled": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("voice") == "onyx", f"Expected voice=onyx for grand_architect, got {data.get('voice')}"
        print(f"PASS: grand_architect chat returns voice=onyx")


class TestSovereignList:
    """Test list endpoint returns voice field"""

    def test_list_returns_voice_for_each_member(self, auth_headers):
        """Test that /api/sovereigns/list returns voice field for each council member."""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/list",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        council = data.get("council", [])
        assert len(council) == 10, f"Expected 10 council members, got {len(council)}"

        # Expected voice mappings
        expected_voices = {
            "grand_architect": "onyx",
            "master_harmonic": "shimmer",
            "principal_economist": "sage",
            "chief_logistics": "coral",
            "sovereign_ethicist": "nova",
            "astraeus": "echo",
            "zenith": "fable",
            "aurelius": "ash",
            "gaea": "coral",
            "vesta": "nova",
        }

        for member in council:
            member_id = member.get("id")
            voice = member.get("voice")
            assert voice is not None, f"Expected voice field for {member_id}, got None"
            if member_id in expected_voices:
                assert voice == expected_voices[member_id], f"Expected voice={expected_voices[member_id]} for {member_id}, got {voice}"
        
        print(f"PASS: All 10 council members have correct voice fields")


class TestAdaptiveToneDetection:
    """Step 7: Adaptive Tone Calibration"""

    def test_tone_detection_in_chat_response(self, auth_headers):
        """Test that chat response includes detected user_tone."""
        # Use sovereign_ethicist which is accessible to discovery tier
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "Can you explain the community protocols?",
                "language": "en",
                "voice_enabled": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        user_tone = data.get("user_tone")
        assert user_tone is not None, "Expected user_tone in response"
        # Valid tones: technical, concise, visionary, exploratory, urgent
        valid_tones = ["technical", "concise", "visionary", "exploratory", "urgent"]
        assert user_tone in valid_tones, f"Expected user_tone in {valid_tones}, got {user_tone}"
        print(f"PASS: Adaptive tone detected: {user_tone}")


class TestInvalidVerificationType:
    """Test error handling for invalid verification type"""

    def test_invalid_verification_type(self, auth_headers):
        """Test that invalid verification type returns 400 error."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "invalid_type", "value": 123}
        )
        assert response.status_code == 400
        print(f"PASS: Invalid verification type returns 400")


class TestAllSolfeggioFrequencies:
    """Test all 9 primary Solfeggio frequencies"""

    @pytest.mark.parametrize("freq", [174, 285, 396, 417, 528, 639, 741, 852, 963])
    def test_all_solfeggio_frequencies(self, auth_headers, freq):
        """Test that all 9 Solfeggio frequencies are valid."""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/verify-math",
            headers=auth_headers,
            json={"type": "solfeggio", "value": freq}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") is True, f"Expected {freq}Hz to be valid"
        assert data.get("type") == "primary_solfeggio"
        print(f"PASS: {freq}Hz is a valid primary Solfeggio frequency")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

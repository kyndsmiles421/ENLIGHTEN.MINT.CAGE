"""
Iteration 62 Tests: Quantum Coherence Dashboard, Expanded Meditations, Scheduled Reminders
Tests:
- GET /api/notifications/quantum-coherence (coherence score, state, phase, breakdown, signals)
- GET /api/ai-visuals/quantum-principles (5 meditations now)
- POST /api/notifications/preferences (reminder_hour, evening_hour fields)
- POST /api/notifications/send-scheduled (batch push for morning/evening)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestQuantumCoherenceEndpoint:
    """Tests for GET /api/notifications/quantum-coherence"""
    
    def test_quantum_coherence_requires_auth(self):
        """Quantum coherence endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Quantum coherence requires auth")
    
    def test_quantum_coherence_returns_score(self, auth_headers):
        """Quantum coherence returns coherence_score"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "coherence_score" in data, "Missing coherence_score"
        assert isinstance(data["coherence_score"], (int, float)), "coherence_score should be numeric"
        assert 0 <= data["coherence_score"] <= 100, "coherence_score should be 0-100"
        print(f"PASS: Quantum coherence returns score: {data['coherence_score']}")
    
    def test_quantum_coherence_returns_state(self, auth_headers):
        """Quantum coherence returns state label"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "state" in data, "Missing state"
        assert isinstance(data["state"], str), "state should be string"
        valid_states = ["Quantum Coherence", "Partial Alignment", "Decoherence", "Zero-Point"]
        assert data["state"] in valid_states, f"Invalid state: {data['state']}"
        print(f"PASS: Quantum coherence returns state: {data['state']}")
    
    def test_quantum_coherence_returns_phase(self, auth_headers):
        """Quantum coherence returns phase"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "phase" in data, "Missing phase"
        valid_phases = ["coherent", "aligning", "decoherent", "zeropoint"]
        assert data["phase"] in valid_phases, f"Invalid phase: {data['phase']}"
        print(f"PASS: Quantum coherence returns phase: {data['phase']}")
    
    def test_quantum_coherence_returns_breakdown(self, auth_headers):
        """Quantum coherence returns breakdown with variety, frequency, streak_bonus"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "breakdown" in data, "Missing breakdown"
        breakdown = data["breakdown"]
        assert "variety" in breakdown, "Missing breakdown.variety"
        assert "frequency" in breakdown, "Missing breakdown.frequency"
        assert "streak_bonus" in breakdown, "Missing breakdown.streak_bonus"
        print(f"PASS: Quantum coherence returns breakdown: {breakdown}")
    
    def test_quantum_coherence_returns_signals(self, auth_headers):
        """Quantum coherence returns signals with practice counts"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "signals" in data, "Missing signals"
        signals = data["signals"]
        expected_keys = ["mood_logs", "journal_entries", "meditations", "breathwork", "streak"]
        for key in expected_keys:
            assert key in signals, f"Missing signals.{key}"
        print(f"PASS: Quantum coherence returns signals: {signals}")
    
    def test_quantum_coherence_returns_description(self, auth_headers):
        """Quantum coherence returns description"""
        response = requests.get(f"{BASE_URL}/api/notifications/quantum-coherence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "description" in data, "Missing description"
        assert isinstance(data["description"], str), "description should be string"
        assert len(data["description"]) > 10, "description should be meaningful"
        print(f"PASS: Quantum coherence returns description: {data['description'][:50]}...")


class TestExpandedQuantumMeditations:
    """Tests for GET /api/ai-visuals/quantum-principles - now 5 meditations"""
    
    def test_quantum_principles_returns_5_meditations(self):
        """Quantum principles endpoint returns 5 meditations (expanded from 3)"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "meditations" in data, "Missing meditations"
        meditations = data["meditations"]
        assert len(meditations) == 5, f"Expected 5 meditations, got {len(meditations)}"
        print(f"PASS: Quantum principles returns 5 meditations")
    
    def test_quantum_meditations_names(self):
        """Verify all 5 meditation names"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        data = response.json()
        meditations = data["meditations"]
        names = [m["name"] for m in meditations]
        expected_names = [
            "Superposition Stillness",
            "Quantum Entanglement",
            "Quantum Tunneling",
            "Wave-Particle Duality",
            "Observer Effect Awakening"
        ]
        for expected in expected_names:
            assert expected in names, f"Missing meditation: {expected}"
        print(f"PASS: All 5 meditation names present: {names}")
    
    def test_quantum_meditations_structure(self):
        """Each meditation has required fields"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        data = response.json()
        meditations = data["meditations"]
        for med in meditations:
            assert "id" in med, f"Missing id in meditation"
            assert "name" in med, f"Missing name in meditation"
            assert "principle" in med, f"Missing principle in meditation"
            assert "steps" in med, f"Missing steps in meditation"
            assert isinstance(med["steps"], list), "steps should be list"
            assert len(med["steps"]) > 0, "steps should not be empty"
        print(f"PASS: All meditations have correct structure")
    
    def test_quantum_meditations_have_total_duration(self):
        """Each meditation has total_duration"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        data = response.json()
        meditations = data["meditations"]
        for med in meditations:
            assert "total_duration" in med, f"Missing total_duration in {med.get('name')}"
            assert isinstance(med["total_duration"], (int, float)), "total_duration should be numeric"
            assert med["total_duration"] > 0, "total_duration should be positive"
        print(f"PASS: All meditations have total_duration")


class TestNotificationPreferencesWithTimes:
    """Tests for POST /api/notifications/preferences with reminder_hour and evening_hour"""
    
    def test_preferences_accepts_reminder_hour(self, auth_headers):
        """Preferences endpoint accepts reminder_hour field"""
        response = requests.post(f"{BASE_URL}/api/notifications/preferences", 
            json={"reminder_hour": 7},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "preferences" in data or "status" in data, "Missing response data"
        print(f"PASS: Preferences accepts reminder_hour")
    
    def test_preferences_accepts_evening_hour(self, auth_headers):
        """Preferences endpoint accepts evening_hour field"""
        response = requests.post(f"{BASE_URL}/api/notifications/preferences", 
            json={"evening_hour": 21},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"PASS: Preferences accepts evening_hour")
    
    def test_preferences_returns_both_hours(self, auth_headers):
        """Preferences returns both reminder_hour and evening_hour"""
        # First set both
        requests.post(f"{BASE_URL}/api/notifications/preferences", 
            json={"reminder_hour": 8, "evening_hour": 20},
            headers=auth_headers)
        
        # Then check status
        response = requests.get(f"{BASE_URL}/api/notifications/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        prefs = data.get("preferences", {})
        assert "reminder_hour" in prefs, "Missing reminder_hour in preferences"
        assert "evening_hour" in prefs, "Missing evening_hour in preferences"
        print(f"PASS: Status returns both hours: reminder={prefs.get('reminder_hour')}, evening={prefs.get('evening_hour')}")
    
    def test_preferences_hour_range_validation(self, auth_headers):
        """Preferences accepts valid hour range (0-23)"""
        # Test morning hour
        response = requests.post(f"{BASE_URL}/api/notifications/preferences", 
            json={"reminder_hour": 6},
            headers=auth_headers)
        assert response.status_code == 200
        
        # Test evening hour
        response = requests.post(f"{BASE_URL}/api/notifications/preferences", 
            json={"evening_hour": 22},
            headers=auth_headers)
        assert response.status_code == 200
        print(f"PASS: Preferences accepts valid hour range")


class TestScheduledReminders:
    """Tests for POST /api/notifications/send-scheduled"""
    
    def test_send_scheduled_endpoint_exists(self):
        """Send-scheduled endpoint exists and accepts POST"""
        response = requests.post(f"{BASE_URL}/api/notifications/send-scheduled", 
            json={"slot": "morning"})
        # Should not be 404 or 405
        assert response.status_code not in [404, 405], f"Endpoint not found: {response.status_code}"
        print(f"PASS: Send-scheduled endpoint exists, status: {response.status_code}")
    
    def test_send_scheduled_morning_slot(self):
        """Send-scheduled accepts morning slot"""
        response = requests.post(f"{BASE_URL}/api/notifications/send-scheduled", 
            json={"slot": "morning"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "slot" in data, "Missing slot in response"
        assert data["slot"] == "morning", f"Expected morning slot, got {data['slot']}"
        print(f"PASS: Send-scheduled morning slot works")
    
    def test_send_scheduled_evening_slot(self):
        """Send-scheduled accepts evening slot"""
        response = requests.post(f"{BASE_URL}/api/notifications/send-scheduled", 
            json={"slot": "evening"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "slot" in data, "Missing slot in response"
        assert data["slot"] == "evening", f"Expected evening slot, got {data['slot']}"
        print(f"PASS: Send-scheduled evening slot works")
    
    def test_send_scheduled_returns_counts(self):
        """Send-scheduled returns users_targeted and notifications_sent"""
        response = requests.post(f"{BASE_URL}/api/notifications/send-scheduled", 
            json={"slot": "morning"})
        assert response.status_code == 200
        data = response.json()
        assert "users_targeted" in data, "Missing users_targeted"
        assert "notifications_sent" in data, "Missing notifications_sent"
        assert isinstance(data["users_targeted"], int), "users_targeted should be int"
        assert isinstance(data["notifications_sent"], int), "notifications_sent should be int"
        print(f"PASS: Send-scheduled returns counts: users={data['users_targeted']}, sent={data['notifications_sent']}")
    
    def test_send_scheduled_no_auth_required(self):
        """Send-scheduled does NOT require auth (for internal scheduler)"""
        response = requests.post(f"{BASE_URL}/api/notifications/send-scheduled", 
            json={"slot": "morning"})
        # Should succeed without auth
        assert response.status_code == 200, f"Expected 200 without auth, got {response.status_code}"
        print(f"PASS: Send-scheduled works without auth (for scheduler)")


class TestQuantumLanguageInPages:
    """Tests to verify quantum language is present in API responses"""
    
    def test_quantum_principles_have_spiritual_descriptions(self):
        """Quantum principles have spiritual descriptions"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        data = response.json()
        principles = data.get("principles", [])
        assert len(principles) > 0, "No principles returned"
        for p in principles:
            assert "spiritual" in p, f"Missing spiritual in principle {p.get('id')}"
            assert len(p["spiritual"]) > 20, "spiritual description too short"
        print(f"PASS: All {len(principles)} principles have spiritual descriptions")
    
    def test_quantum_principles_have_practice_descriptions(self):
        """Quantum principles have practice descriptions"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/quantum-principles")
        assert response.status_code == 200
        data = response.json()
        principles = data.get("principles", [])
        for p in principles:
            assert "practice" in p, f"Missing practice in principle {p.get('id')}"
        print(f"PASS: All principles have practice descriptions")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

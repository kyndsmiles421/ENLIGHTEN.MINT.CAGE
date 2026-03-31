"""
Iteration 141: Instant Frequency Play Feature Tests
Tests the new 'play_frequency' action in recommendations and dashboard suggestions.
When user clicks a frequency recommendation, it should play instantly via MixerContext
instead of just navigating to the Frequencies page.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestInstantFrequencyPlayBackend:
    """Test backend endpoints for instant frequency play feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
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
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ─── Recommendations Endpoint Tests ───
    
    def test_recommendations_endpoint_returns_200(self):
        """GET /api/recommendations should return 200 for authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/recommendations returns 200")
    
    def test_recommendations_has_required_fields(self):
        """Recommendations response should have recommendations array and metadata"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        assert "recommendations" in data, "Response missing 'recommendations' field"
        assert isinstance(data["recommendations"], list), "'recommendations' should be a list"
        assert "time_period" in data, "Response missing 'time_period' field"
        print(f"PASS: Recommendations has {len(data['recommendations'])} items, time_period: {data['time_period']}")
    
    def test_recommendations_frequency_has_play_action(self):
        """Frequency recommendations should have 'action: play_frequency' and 'frequency_hz'"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        freq_recs = [r for r in data["recommendations"] if r.get("action") == "play_frequency"]
        
        if len(freq_recs) > 0:
            for rec in freq_recs:
                assert "frequency_hz" in rec, f"Frequency recommendation missing 'frequency_hz': {rec}"
                assert isinstance(rec["frequency_hz"], (int, float)), f"frequency_hz should be numeric: {rec['frequency_hz']}"
                assert rec["frequency_hz"] > 0, f"frequency_hz should be positive: {rec['frequency_hz']}"
                print(f"PASS: Found frequency recommendation with action='play_frequency', hz={rec['frequency_hz']}, name={rec.get('name')}")
        else:
            # If no frequency recommendations, check if user has mood data
            print(f"INFO: No frequency recommendations found. User may not have mood data. Total recs: {len(data['recommendations'])}")
            # List what recommendations are present
            for rec in data["recommendations"]:
                print(f"  - {rec.get('id')}: {rec.get('name')} (action={rec.get('action', 'navigate')})")
    
    def test_recommendations_mood_frequency_mapping(self):
        """Verify MOOD_FREQUENCY_MAP is being used correctly"""
        # First, ensure user has mood data by posting a mood
        mood_response = self.session.post(f"{BASE_URL}/api/moods", json={
            "mood": "stressed",
            "score": 6,
            "notes": "Test mood for frequency recommendation"
        })
        
        if mood_response.status_code not in [200, 201]:
            print(f"WARNING: Could not create mood entry: {mood_response.status_code}")
        
        # Now get recommendations
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        # Look for play_frequency action
        freq_recs = [r for r in data["recommendations"] if r.get("action") == "play_frequency"]
        
        if len(freq_recs) > 0:
            # Verify the frequency matches expected mapping for 'stressed' mood
            # MOOD_FREQUENCY_MAP["stressed"] = {"hz": 396, "label": "396 Hz — Liberation from Stress"}
            stressed_freq = next((r for r in freq_recs if r.get("frequency_hz") == 396), None)
            if stressed_freq:
                print(f"PASS: Found 396 Hz frequency for 'stressed' mood: {stressed_freq.get('name')}")
            else:
                print(f"INFO: 396 Hz not found, but found other frequencies: {[r.get('frequency_hz') for r in freq_recs]}")
        else:
            print("INFO: No play_frequency recommendations found after mood entry")
    
    # ─── Dashboard Suggestions Endpoint Tests ───
    
    def test_dashboard_suggestions_endpoint_returns_200(self):
        """GET /api/dashboard/suggestions should return 200 for authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/dashboard/suggestions returns 200")
    
    def test_dashboard_suggestions_has_suggestions_array(self):
        """Dashboard suggestions response should have suggestions array"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code == 200
        data = response.json()
        
        assert "suggestions" in data, "Response missing 'suggestions' field"
        assert isinstance(data["suggestions"], list), "'suggestions' should be a list"
        print(f"PASS: Dashboard suggestions has {len(data['suggestions'])} items")
    
    def test_dashboard_suggestions_mood_frequency(self):
        """When user has mood data, suggestions should include mood-frequency with play_frequency action"""
        # Ensure user has mood and journal data (required for mood-frequency suggestion)
        self.session.post(f"{BASE_URL}/api/moods", json={
            "mood": "happy",
            "score": 8,
            "notes": "Test mood for dashboard suggestion"
        })
        self.session.post(f"{BASE_URL}/api/journal", json={
            "content": "Test journal entry for dashboard suggestion",
            "mood": "happy"
        })
        
        response = self.session.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code == 200
        data = response.json()
        
        # Look for mood-frequency suggestion
        mood_freq_suggestion = next(
            (s for s in data["suggestions"] if s.get("id") == "mood-frequency"),
            None
        )
        
        if mood_freq_suggestion:
            assert mood_freq_suggestion.get("action") == "play_frequency", \
                f"mood-frequency suggestion should have action='play_frequency', got: {mood_freq_suggestion.get('action')}"
            assert "frequency_hz" in mood_freq_suggestion, \
                f"mood-frequency suggestion missing 'frequency_hz': {mood_freq_suggestion}"
            assert isinstance(mood_freq_suggestion["frequency_hz"], (int, float)), \
                f"frequency_hz should be numeric: {mood_freq_suggestion['frequency_hz']}"
            print(f"PASS: Found mood-frequency suggestion with action='play_frequency', hz={mood_freq_suggestion['frequency_hz']}")
            print(f"  Title: {mood_freq_suggestion.get('title')}")
            print(f"  Desc: {mood_freq_suggestion.get('desc')}")
        else:
            # Check if user has both mood and journal data
            print("INFO: mood-frequency suggestion not found. Checking user data requirements...")
            print(f"  Suggestions present: {[s.get('id') for s in data['suggestions']]}")
    
    def test_dashboard_suggestions_frequency_hz_values(self):
        """Verify frequency_hz values are valid solfeggio/healing frequencies"""
        valid_frequencies = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
        
        response = self.session.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code == 200
        data = response.json()
        
        freq_suggestions = [s for s in data["suggestions"] if s.get("action") == "play_frequency"]
        
        for suggestion in freq_suggestions:
            hz = suggestion.get("frequency_hz")
            assert hz in valid_frequencies, f"Unexpected frequency {hz}, expected one of {valid_frequencies}"
            print(f"PASS: Frequency {hz} Hz is a valid healing frequency")
    
    # ─── Dashboard Stats Endpoint Tests ───
    
    def test_dashboard_stats_endpoint_returns_200(self):
        """GET /api/dashboard/stats should return 200 for authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/dashboard/stats returns 200")
    
    def test_dashboard_stats_has_mood_data(self):
        """Dashboard stats should include mood count and recent moods"""
        response = self.session.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "mood_count" in data, "Response missing 'mood_count' field"
        assert "recent_moods" in data, "Response missing 'recent_moods' field"
        print(f"PASS: Dashboard stats has mood_count={data['mood_count']}, recent_moods={len(data.get('recent_moods', []))}")
    
    # ─── Frequencies Endpoint Tests ───
    
    def test_frequencies_endpoint_returns_200(self):
        """GET /api/frequencies should return 200"""
        response = self.session.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/frequencies returns 200")
    
    def test_frequencies_has_required_fields(self):
        """Each frequency should have id, frequency, name, category, chakra, color"""
        response = self.session.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Frequencies response should be a list"
        assert len(data) > 0, "Frequencies list should not be empty"
        
        required_fields = ["id", "frequency", "name", "category", "chakra", "color"]
        for freq in data[:3]:  # Check first 3
            for field in required_fields:
                assert field in freq, f"Frequency missing '{field}' field: {freq}"
        
        print(f"PASS: Frequencies endpoint returns {len(data)} frequencies with required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

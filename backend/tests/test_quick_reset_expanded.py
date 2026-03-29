"""
Test Quick Reset expanded emotions (33 feelings)
Tests the GET /api/quick-reset/{feeling} endpoint for all 33 feelings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# All 33 feelings from the FEELINGS array in Landing.js
ALL_FEELINGS = [
    # Positive (10)
    "happy", "peaceful", "energized", "grateful", "curious", 
    "inspired", "hopeful", "creative", "connected", "brave",
    # Challenged (19)
    "stressed", "anxious", "tired", "sad", "unfocused", "restless",
    "angry", "lonely", "overwhelmed", "grief", "numb", "fearful",
    "frustrated", "burnout", "disconnected", "jealous", "impatient", "bored", "nostalgic",
    # Spiritual (4)
    "awakening", "seeking", "grounding", "expansive"
]

# New feelings added in this update (22 new ones)
NEW_FEELINGS = [
    "inspired", "hopeful", "creative", "connected", "brave",
    "angry", "lonely", "overwhelmed", "grief", "numb", "fearful",
    "frustrated", "burnout", "disconnected", "jealous", "impatient", "bored", "nostalgic",
    "awakening", "seeking", "grounding", "expansive"
]


class TestQuickResetEndpoints:
    """Test all Quick Reset endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    @pytest.mark.parametrize("feeling", ALL_FEELINGS)
    def test_quick_reset_feeling(self, feeling):
        """Test each feeling returns valid reset flow"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/{feeling}")
        
        # Status code assertion
        assert response.status_code == 200, f"Failed for feeling '{feeling}': {response.status_code} - {response.text}"
        
        # Data structure assertions
        data = response.json()
        assert "label" in data, f"Missing 'label' for feeling '{feeling}'"
        assert "frequency" in data, f"Missing 'frequency' for feeling '{feeling}'"
        assert "tool" in data, f"Missing 'tool' for feeling '{feeling}'"
        assert "nourishment" in data, f"Missing 'nourishment' for feeling '{feeling}'"
        assert "mantra" in data, f"Missing 'mantra' for feeling '{feeling}'"
        
        # Frequency structure
        freq = data["frequency"]
        assert "name" in freq, f"Missing frequency.name for '{feeling}'"
        assert "hz" in freq, f"Missing frequency.hz for '{feeling}'"
        assert "path" in freq, f"Missing frequency.path for '{feeling}'"
        assert "desc" in freq, f"Missing frequency.desc for '{feeling}'"
        
        # Tool structure
        tool = data["tool"]
        assert "name" in tool, f"Missing tool.name for '{feeling}'"
        assert "path" in tool, f"Missing tool.path for '{feeling}'"
        assert "desc" in tool, f"Missing tool.desc for '{feeling}'"
        
        # Nourishment structure
        nourish = data["nourishment"]
        assert "name" in nourish, f"Missing nourishment.name for '{feeling}'"
        assert "desc" in nourish, f"Missing nourishment.desc for '{feeling}'"
        
        # Mantra structure
        mantra = data["mantra"]
        assert "text" in mantra, f"Missing mantra.text for '{feeling}'"
        assert "type" in mantra, f"Missing mantra.type for '{feeling}'"
        assert mantra["type"] in ["uplifting", "protective"], f"Invalid mantra.type for '{feeling}'"
        assert "tradition" in mantra, f"Missing mantra.tradition for '{feeling}'"
    
    def test_quick_reset_invalid_feeling(self):
        """Test invalid feeling returns 404"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/invalid_feeling_xyz")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_quick_reset_angry(self):
        """Test specific new feeling: angry"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/angry")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Angry"
        assert "396 Hz" in data["frequency"]["name"]
        assert data["tool"]["name"] == "4-7-8 Breathing"
    
    def test_quick_reset_grief(self):
        """Test specific new feeling: grief"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/grief")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Grieving"
        assert "528 Hz" in data["frequency"]["name"]
    
    def test_quick_reset_overwhelmed(self):
        """Test specific new feeling: overwhelmed"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/overwhelmed")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Overwhelmed"
        assert "174 Hz" in data["frequency"]["name"]
    
    def test_quick_reset_awakening(self):
        """Test specific new feeling: awakening (spiritual)"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/awakening")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Spiritually Awakening"
        assert "963 Hz" in data["frequency"]["name"]
    
    def test_quick_reset_creative(self):
        """Test specific new feeling: creative"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/creative")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Creative"
        assert "741 Hz" in data["frequency"]["name"]
    
    def test_quick_reset_burnout(self):
        """Test specific new feeling: burnout"""
        response = self.session.get(f"{BASE_URL}/api/quick-reset/burnout")
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Burned Out"
        assert "174 Hz" in data["frequency"]["name"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

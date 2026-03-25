"""
Test Quick Reset and Waitlist APIs - Iteration 17
Tests for:
- GET /api/quick-reset/{feeling} - 6 feelings + invalid
- POST /api/waitlist/join - new entry + duplicate
- GET /api/waitlist/count
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestQuickResetAPI:
    """Quick Reset endpoint tests - 6 feelings + invalid"""
    
    def test_quick_reset_stressed(self):
        """GET /api/quick-reset/stressed returns correct recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/stressed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "label" in data
        assert data["label"] == "Stressed"
        
        # Verify frequency recommendation
        assert "frequency" in data
        assert "name" in data["frequency"]
        assert "hz" in data["frequency"]
        assert "path" in data["frequency"]
        assert "desc" in data["frequency"]
        assert data["frequency"]["hz"] == 396
        
        # Verify tool recommendation
        assert "tool" in data
        assert "name" in data["tool"]
        assert "path" in data["tool"]
        assert "desc" in data["tool"]
        
        # Verify nourishment recommendation
        assert "nourishment" in data
        assert "name" in data["nourishment"]
        assert "desc" in data["nourishment"]
        
        print(f"✓ Stressed flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_anxious(self):
        """GET /api/quick-reset/anxious returns anxiety-specific recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/anxious")
        assert response.status_code == 200
        
        data = response.json()
        assert data["label"] == "Anxious"
        assert data["frequency"]["hz"] == 528
        assert "Box Breathing" in data["tool"]["name"]
        assert "Matcha" in data["nourishment"]["name"]
        
        print(f"✓ Anxious flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_tired(self):
        """GET /api/quick-reset/tired returns energy-boosting recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/tired")
        assert response.status_code == 200
        
        data = response.json()
        assert data["label"] == "Low Energy"
        assert data["frequency"]["hz"] == 417
        assert "Energizing" in data["tool"]["name"]
        assert "Prana" in data["nourishment"]["name"]
        
        print(f"✓ Tired flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_sad(self):
        """GET /api/quick-reset/sad returns mood-lifting recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/sad")
        assert response.status_code == 200
        
        data = response.json()
        assert data["label"] == "Down / Sad"
        assert data["frequency"]["hz"] == 639
        assert "Loving Kindness" in data["tool"]["name"]
        assert "Cacao" in data["nourishment"]["name"]
        
        print(f"✓ Sad flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_unfocused(self):
        """GET /api/quick-reset/unfocused returns focus recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/unfocused")
        assert response.status_code == 200
        
        data = response.json()
        assert data["label"] == "Unfocused"
        assert data["frequency"]["hz"] == 741
        assert "Breath Awareness" in data["tool"]["name"] or "Meditation" in data["tool"]["name"]
        assert "Mushroom" in data["nourishment"]["name"]
        
        print(f"✓ Unfocused flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_restless(self):
        """GET /api/quick-reset/restless returns sleep recommendations"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/restless")
        assert response.status_code == 200
        
        data = response.json()
        assert data["label"] == "Restless / Can't Sleep"
        assert data["frequency"]["hz"] == 174
        assert "Body Scan" in data["tool"]["name"]
        assert "Golden Milk" in data["nourishment"]["name"]
        
        print(f"✓ Restless flow: {data['frequency']['name']}, {data['tool']['name']}, {data['nourishment']['name']}")
    
    def test_quick_reset_invalid_feeling(self):
        """GET /api/quick-reset/invalid returns 404 error"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid feeling returns 404: {data['detail']}")


class TestWaitlistAPI:
    """Waitlist endpoint tests - join + duplicate + count"""
    
    def test_waitlist_count(self):
        """GET /api/waitlist/count returns correct count"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
        
        print(f"✓ Waitlist count: {data['count']}")
    
    def test_waitlist_join_new_entry(self):
        """POST /api/waitlist/join creates new entry and returns position"""
        # Use unique email to avoid conflicts
        unique_email = f"test_{uuid.uuid4().hex[:8]}@cosmic.com"
        
        response = requests.post(f"{BASE_URL}/api/waitlist/join", json={
            "email": unique_email,
            "name": "Test User"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "joined"
        assert "message" in data
        assert "position" in data
        assert isinstance(data["position"], int)
        assert data["position"] > 0
        
        print(f"✓ New waitlist entry: position {data['position']}, message: {data['message']}")
    
    def test_waitlist_join_duplicate_email(self):
        """POST /api/waitlist/join with duplicate email returns 'already_joined'"""
        # First, join with a unique email
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@cosmic.com"
        
        # First join
        response1 = requests.post(f"{BASE_URL}/api/waitlist/join", json={
            "email": unique_email,
            "name": "First Join"
        })
        assert response1.status_code == 200
        assert response1.json()["status"] == "joined"
        
        # Second join with same email
        response2 = requests.post(f"{BASE_URL}/api/waitlist/join", json={
            "email": unique_email,
            "name": "Second Join"
        })
        assert response2.status_code == 200
        
        data = response2.json()
        assert data["status"] == "already_joined"
        assert "message" in data
        
        print(f"✓ Duplicate email returns already_joined: {data['message']}")
    
    def test_waitlist_count_increases_after_join(self):
        """Verify count increases after new join"""
        # Get initial count
        count_before = requests.get(f"{BASE_URL}/api/waitlist/count").json()["count"]
        
        # Join with unique email
        unique_email = f"count_{uuid.uuid4().hex[:8]}@cosmic.com"
        requests.post(f"{BASE_URL}/api/waitlist/join", json={
            "email": unique_email,
            "name": "Count Test"
        })
        
        # Get new count
        count_after = requests.get(f"{BASE_URL}/api/waitlist/count").json()["count"]
        
        assert count_after == count_before + 1, f"Expected count to increase by 1, got {count_before} -> {count_after}"
        
        print(f"✓ Count increased: {count_before} -> {count_after}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

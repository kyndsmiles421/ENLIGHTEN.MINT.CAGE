"""
Iteration 75: Akashic Records & Sacred Encyclopedia API Tests
Tests for the two new features:
1. Akashic Records - guided meditative AI conversation with session history
2. Sacred Encyclopedia - 12 world spiritual traditions with AI exploration
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAkashicRecordsPublic:
    """Akashic Records public endpoints (no auth required)"""
    
    def test_get_akashic_prompts_returns_6_prompts(self):
        """GET /api/akashic/prompts should return 6 guided prompts"""
        response = requests.get(f"{BASE_URL}/api/akashic/prompts")
        assert response.status_code == 200
        
        data = response.json()
        assert "prompts" in data
        prompts = data["prompts"]
        assert len(prompts) == 6
        
        # Verify prompt structure
        expected_ids = ["soul_purpose", "past_lives", "karmic_patterns", "soul_relationships", "healing", "gifts"]
        actual_ids = [p["id"] for p in prompts]
        assert set(actual_ids) == set(expected_ids)
        
        # Verify each prompt has required fields
        for prompt in prompts:
            assert "id" in prompt
            assert "label" in prompt
            assert "icon" in prompt
            assert "color" in prompt
            assert "prompt" in prompt
            assert "desc" in prompt
            assert len(prompt["prompt"]) > 20  # Meaningful prompt text


class TestEncyclopediaPublic:
    """Encyclopedia public endpoints (no auth required)"""
    
    def test_get_traditions_returns_12_traditions(self):
        """GET /api/encyclopedia/traditions should return 12 traditions"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions")
        assert response.status_code == 200
        
        data = response.json()
        assert "traditions" in data
        traditions = data["traditions"]
        assert len(traditions) == 12
        
        # Verify expected traditions
        expected_ids = [
            "hinduism", "buddhism", "taoism", "sufism", "kabbalah", "indigenous",
            "mystical_christianity", "egyptian", "greek_philosophy", "zen", "yoga_tantra", "african"
        ]
        actual_ids = [t["id"] for t in traditions]
        assert set(actual_ids) == set(expected_ids)
        
        # Verify summary structure
        for tradition in traditions:
            assert "id" in tradition
            assert "name" in tradition
            assert "color" in tradition
            assert "era" in tradition
            assert "origin" in tradition
            assert "overview" in tradition
            assert "concept_count" in tradition
            assert "text_count" in tradition
            assert tradition["concept_count"] == 6  # Each has 6 key concepts
    
    def test_get_tradition_detail_hinduism(self):
        """GET /api/encyclopedia/traditions/hinduism should return full detail"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/hinduism")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "hinduism"
        assert data["name"] == "Hinduism & Vedic Wisdom"
        assert "key_concepts" in data
        assert len(data["key_concepts"]) == 6
        assert "sacred_texts" in data
        assert len(data["sacred_texts"]) == 6
        assert "notable_figures" in data
        assert len(data["notable_figures"]) == 6
        assert "practices" in data
        assert len(data["practices"]) == 6
        
        # Verify key concept structure
        for concept in data["key_concepts"]:
            assert "name" in concept
            assert "desc" in concept
    
    def test_get_tradition_detail_buddhism(self):
        """GET /api/encyclopedia/traditions/buddhism should return full detail"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/buddhism")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "buddhism"
        assert "Four Noble Truths" in [c["name"] for c in data["key_concepts"]]
    
    def test_get_tradition_not_found(self):
        """GET /api/encyclopedia/traditions/invalid should return 404"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/invalid_tradition")
        assert response.status_code == 404


class TestAkashicRecordsAuthenticated:
    """Akashic Records authenticated endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_create_akashic_session(self, auth_headers):
        """POST /api/akashic/sessions should create a new session"""
        response = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "soul_purpose"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert data["prompt_id"] == "soul_purpose"
        
        # Cleanup
        session_id = data["session_id"]
        requests.delete(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
    
    def test_list_akashic_sessions(self, auth_headers):
        """GET /api/akashic/sessions should list user sessions"""
        # Create a session first
        create_resp = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "past_lives"},
            headers=auth_headers
        )
        session_id = create_resp.json()["session_id"]
        
        # List sessions
        response = requests.get(f"{BASE_URL}/api/akashic/sessions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        
        # Verify session is in list
        session_ids = [s["id"] for s in data["sessions"]]
        assert session_id in session_ids
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
    
    def test_get_specific_session(self, auth_headers):
        """GET /api/akashic/sessions/{id} should return session details"""
        # Create a session
        create_resp = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "karmic_patterns"},
            headers=auth_headers
        )
        session_id = create_resp.json()["session_id"]
        
        # Get session
        response = requests.get(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == session_id
        assert data["prompt_id"] == "karmic_patterns"
        assert "messages" in data
        assert isinstance(data["messages"], list)
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
    
    def test_delete_akashic_session(self, auth_headers):
        """DELETE /api/akashic/sessions/{id} should delete session"""
        # Create a session
        create_resp = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "healing"},
            headers=auth_headers
        )
        session_id = create_resp.json()["session_id"]
        
        # Delete session
        response = requests.delete(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "deleted"
        
        # Verify deleted
        get_resp = requests.get(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)
        assert get_resp.status_code == 404
    
    def test_akashic_session_not_found(self, auth_headers):
        """GET /api/akashic/sessions/{invalid_id} should return 404"""
        response = requests.get(
            f"{BASE_URL}/api/akashic/sessions/nonexistent-session-id",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_akashic_chat_requires_message(self, auth_headers):
        """POST /api/akashic/chat should require message"""
        # Create a session
        create_resp = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "gifts"},
            headers=auth_headers
        )
        session_id = create_resp.json()["session_id"]
        
        # Try chat without message
        response = requests.post(
            f"{BASE_URL}/api/akashic/chat",
            json={"session_id": session_id, "message": ""},
            headers=auth_headers
        )
        assert response.status_code == 400
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/akashic/sessions/{session_id}", headers=auth_headers)


class TestEncyclopediaAuthenticated:
    """Encyclopedia authenticated endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_explore_requires_auth(self):
        """POST /api/encyclopedia/explore should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/explore",
            json={"tradition": "Hinduism", "concept": "Karma"}
        )
        assert response.status_code in [401, 403]
    
    def test_explore_requires_concept_or_question(self, auth_headers):
        """POST /api/encyclopedia/explore should require concept or question"""
        response = requests.post(
            f"{BASE_URL}/api/encyclopedia/explore",
            json={"tradition": "Buddhism"},
            headers=auth_headers
        )
        assert response.status_code == 400


class TestAuthRequirements:
    """Test that auth-required endpoints properly reject unauthenticated requests"""
    
    def test_akashic_sessions_requires_auth(self):
        """GET /api/akashic/sessions should require auth"""
        response = requests.get(f"{BASE_URL}/api/akashic/sessions")
        assert response.status_code in [401, 403]
    
    def test_create_akashic_session_requires_auth(self):
        """POST /api/akashic/sessions should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/akashic/sessions",
            json={"prompt_id": "soul_purpose"}
        )
        assert response.status_code in [401, 403]
    
    def test_akashic_chat_requires_auth(self):
        """POST /api/akashic/chat should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/akashic/chat",
            json={"session_id": "test", "message": "Hello"}
        )
        assert response.status_code in [401, 403]


class TestAllTraditionDetails:
    """Test that all 12 traditions return proper detail"""
    
    @pytest.mark.parametrize("tradition_id", [
        "hinduism", "buddhism", "taoism", "sufism", "kabbalah", "indigenous",
        "mystical_christianity", "egyptian", "greek_philosophy", "zen", "yoga_tantra", "african"
    ])
    def test_tradition_detail_structure(self, tradition_id):
        """Each tradition should have complete detail structure"""
        response = requests.get(f"{BASE_URL}/api/encyclopedia/traditions/{tradition_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == tradition_id
        assert "name" in data
        assert "color" in data
        assert "era" in data
        assert "origin" in data
        assert "overview" in data
        assert "key_concepts" in data
        assert "sacred_texts" in data
        assert "notable_figures" in data
        assert "practices" in data
        
        # Verify arrays have content
        assert len(data["key_concepts"]) >= 4
        assert len(data["sacred_texts"]) >= 3
        assert len(data["notable_figures"]) >= 3
        assert len(data["practices"]) >= 3

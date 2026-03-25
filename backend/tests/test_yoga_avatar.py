"""
Test suite for Yoga and Avatar features
- Yoga styles, sequences, session completion, history
- Avatar configuration get/save
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestYogaPublicEndpoints:
    """Test public yoga endpoints (no auth required)"""

    def test_get_yoga_styles_returns_7_styles(self, api_client):
        """GET /api/yoga/styles should return 7 yoga styles"""
        response = api_client.get(f"{BASE_URL}/api/yoga/styles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "styles" in data, "Response should contain 'styles' key"
        styles = data["styles"]
        assert len(styles) == 7, f"Expected 7 yoga styles, got {len(styles)}"
        
        # Verify expected style IDs
        style_ids = [s["id"] for s in styles]
        expected_ids = ["hatha", "vinyasa", "kundalini", "yin", "restorative", "pranayama", "nidra"]
        for expected_id in expected_ids:
            assert expected_id in style_ids, f"Missing yoga style: {expected_id}"
        
        # Verify each style has required fields
        for style in styles:
            assert "id" in style
            assert "name" in style
            assert "subtitle" in style
            assert "desc" in style
            assert "color" in style
            assert "difficulty" in style
            assert "duration_range" in style
            assert "benefits" in style
            print(f"✓ Style: {style['name']} ({style['id']})")

    def test_get_hatha_style_with_sequences(self, api_client):
        """GET /api/yoga/style/hatha should return style with sequences and poses"""
        response = api_client.get(f"{BASE_URL}/api/yoga/style/hatha")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "hatha"
        assert data["name"] == "Hatha Yoga"
        assert "sequences" in data, "Hatha style should have sequences"
        
        sequences = data["sequences"]
        assert len(sequences) >= 1, "Hatha should have at least 1 sequence"
        
        # Verify sequence structure
        for seq in sequences:
            assert "id" in seq
            assert "name" in seq
            assert "duration" in seq
            assert "level" in seq
            assert "poses" in seq
            assert len(seq["poses"]) > 0, f"Sequence {seq['name']} should have poses"
            
            # Verify pose structure
            for pose in seq["poses"]:
                assert "name" in pose
                assert "duration" in pose
                assert "instruction" in pose
                assert "breath" in pose
                assert "focus" in pose
            
            print(f"✓ Sequence: {seq['name']} with {len(seq['poses'])} poses")

    def test_get_vinyasa_style_with_sequences(self, api_client):
        """GET /api/yoga/style/vinyasa should return style with sequences and poses"""
        response = api_client.get(f"{BASE_URL}/api/yoga/style/vinyasa")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "vinyasa"
        assert data["name"] == "Vinyasa Flow"
        assert "sequences" in data
        
        sequences = data["sequences"]
        assert len(sequences) >= 1, "Vinyasa should have at least 1 sequence"
        
        for seq in sequences:
            assert "poses" in seq
            assert len(seq["poses"]) > 0
            print(f"✓ Vinyasa sequence: {seq['name']} with {len(seq['poses'])} poses")

    def test_get_all_yoga_styles_have_sequences(self, api_client):
        """Verify all 7 yoga styles have sequences with poses"""
        style_ids = ["hatha", "vinyasa", "kundalini", "yin", "restorative", "pranayama", "nidra"]
        
        for style_id in style_ids:
            response = api_client.get(f"{BASE_URL}/api/yoga/style/{style_id}")
            assert response.status_code == 200, f"Failed to get style {style_id}"
            
            data = response.json()
            assert "sequences" in data, f"Style {style_id} missing sequences"
            assert len(data["sequences"]) >= 1, f"Style {style_id} has no sequences"
            
            for seq in data["sequences"]:
                assert len(seq["poses"]) > 0, f"Sequence {seq['id']} has no poses"
            
            print(f"✓ {style_id}: {len(data['sequences'])} sequences")

    def test_get_nonexistent_yoga_style_returns_404(self, api_client):
        """GET /api/yoga/style/invalid should return 404"""
        response = api_client.get(f"{BASE_URL}/api/yoga/style/invalid_style")
        assert response.status_code == 404


class TestYogaAuthenticatedEndpoints:
    """Test yoga endpoints requiring authentication"""

    def test_complete_yoga_session(self, authenticated_client):
        """POST /api/yoga/complete should record a completed session"""
        payload = {
            "style_id": "hatha",
            "sequence_id": "hatha-sunrise",
            "duration": 20
        }
        response = authenticated_client.post(f"{BASE_URL}/api/yoga/complete", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "completed"
        assert "total_sessions" in data
        assert isinstance(data["total_sessions"], int)
        print(f"✓ Session completed. Total sessions: {data['total_sessions']}")

    def test_get_yoga_history(self, authenticated_client):
        """GET /api/yoga/history should return session history"""
        response = authenticated_client.get(f"{BASE_URL}/api/yoga/history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sessions" in data
        assert "total" in data
        assert isinstance(data["sessions"], list)
        assert isinstance(data["total"], int)
        
        # Verify session structure if any exist
        if len(data["sessions"]) > 0:
            session = data["sessions"][0]
            assert "id" in session
            assert "user_id" in session
            assert "style_id" in session
            assert "completed_at" in session
        
        print(f"✓ History retrieved: {data['total']} total sessions")

    def test_yoga_complete_requires_auth(self, api_client):
        """POST /api/yoga/complete without auth should return 401"""
        # Use a fresh client without auth
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        
        response = fresh_client.post(f"{BASE_URL}/api/yoga/complete", json={
            "style_id": "hatha",
            "sequence_id": "hatha-sunrise",
            "duration": 20
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_yoga_history_requires_auth(self, api_client):
        """GET /api/yoga/history without auth should return 401"""
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        
        response = fresh_client.get(f"{BASE_URL}/api/yoga/history")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestAvatarEndpoints:
    """Test avatar configuration endpoints"""

    def test_get_avatar_config(self, authenticated_client):
        """GET /api/avatar should return avatar config"""
        response = authenticated_client.get(f"{BASE_URL}/api/avatar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify default or saved config fields
        assert "body_type" in data
        assert "aura_color" in data
        assert "aura_intensity" in data
        assert "silhouette" in data
        assert "robe_style" in data
        assert "robe_color" in data
        assert "chakra_emphasis" in data
        assert "particle_density" in data
        assert "glow_style" in data
        assert "energy_trails" in data
        
        print(f"✓ Avatar config retrieved: body_type={data['body_type']}, aura_color={data['aura_color']}")

    def test_save_avatar_config(self, authenticated_client):
        """POST /api/avatar should save avatar config"""
        payload = {
            "body_type": "slender",
            "aura_color": "#FDA4AF",
            "aura_intensity": 0.8,
            "silhouette": "lotus",
            "robe_style": "ceremonial",
            "robe_color": "#4C1D95",
            "chakra_emphasis": "3",
            "particle_density": "dense",
            "glow_style": "radiant",
            "energy_trails": True
        }
        response = authenticated_client.post(f"{BASE_URL}/api/avatar", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "saved"
        assert "avatar" in data
        
        avatar = data["avatar"]
        assert avatar["body_type"] == "slender"
        assert avatar["aura_color"] == "#FDA4AF"
        assert avatar["silhouette"] == "lotus"
        print(f"✓ Avatar saved: {avatar['body_type']}, {avatar['aura_color']}")

    def test_get_avatar_after_save(self, authenticated_client):
        """GET /api/avatar should return previously saved config"""
        response = authenticated_client.get(f"{BASE_URL}/api/avatar")
        assert response.status_code == 200
        
        data = response.json()
        # Should reflect the saved values from previous test
        assert data["body_type"] == "slender"
        assert data["aura_color"] == "#FDA4AF"
        print(f"✓ Avatar persistence verified")

    def test_avatar_requires_auth(self, api_client):
        """Avatar endpoints should require authentication"""
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        
        # GET should require auth
        response = fresh_client.get(f"{BASE_URL}/api/avatar")
        assert response.status_code == 401, f"GET /api/avatar expected 401, got {response.status_code}"
        
        # POST should require auth
        response = fresh_client.post(f"{BASE_URL}/api/avatar", json={"body_type": "balanced"})
        assert response.status_code == 401, f"POST /api/avatar expected 401, got {response.status_code}"


class TestYogaSequenceEndpoint:
    """Test specific sequence endpoint"""

    def test_get_specific_sequence(self, api_client):
        """GET /api/yoga/sequence/{style_id}/{sequence_id} should return sequence details"""
        response = api_client.get(f"{BASE_URL}/api/yoga/sequence/hatha/hatha-sunrise")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "style" in data
        assert "sequence" in data
        
        style = data["style"]
        assert style["id"] == "hatha"
        
        sequence = data["sequence"]
        assert sequence["id"] == "hatha-sunrise"
        assert "poses" in sequence
        assert len(sequence["poses"]) > 0
        print(f"✓ Sequence endpoint works: {sequence['name']} with {len(sequence['poses'])} poses")

    def test_get_nonexistent_sequence_returns_404(self, api_client):
        """GET /api/yoga/sequence with invalid IDs should return 404"""
        # Invalid style
        response = api_client.get(f"{BASE_URL}/api/yoga/sequence/invalid/hatha-sunrise")
        assert response.status_code == 404
        
        # Invalid sequence
        response = api_client.get(f"{BASE_URL}/api/yoga/sequence/hatha/invalid-sequence")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

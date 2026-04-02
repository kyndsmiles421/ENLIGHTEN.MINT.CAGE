"""
Iteration 223 - Divine Director Multi-Track Mixer Tests
Tests: Subscription system, Projects CRUD, Sources tier-gating, Layer cap enforcement
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers with Bearer token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMixerSubscription:
    """Tests for mixer subscription endpoints"""
    
    def test_get_subscription_returns_tier_and_config(self, auth_headers):
        """GET /api/mixer/subscription returns user's tier, config, comparison, all_tiers"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "tier" in data, "Response missing 'tier'"
        assert "tier_config" in data, "Response missing 'tier_config'"
        assert "comparison" in data, "Response missing 'comparison'"
        assert "all_tiers" in data, "Response missing 'all_tiers'"
        
        # Verify tier is valid
        assert data["tier"] in ["discovery", "resonance", "sovereign"], f"Invalid tier: {data['tier']}"
        
        # Verify tier_config has expected fields
        config = data["tier_config"]
        assert "layer_cap" in config, "tier_config missing 'layer_cap'"
        assert "ai_credits_monthly" in config, "tier_config missing 'ai_credits_monthly'"
        assert "name" in config, "tier_config missing 'name'"
        
        # Verify all_tiers has 3 tiers
        assert len(data["all_tiers"]) == 3, f"Expected 3 tiers, got {len(data['all_tiers'])}"
        assert "discovery" in data["all_tiers"]
        assert "resonance" in data["all_tiers"]
        assert "sovereign" in data["all_tiers"]
        
        print(f"✓ User tier: {data['tier']}, layer_cap: {config['layer_cap']}")
    
    def test_subscription_has_ai_credits(self, auth_headers):
        """Subscription response includes AI credits remaining"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "ai_credits_remaining" in data, "Response missing 'ai_credits_remaining'"
        assert isinstance(data["ai_credits_remaining"], (int, float)), "ai_credits_remaining should be numeric"
        print(f"✓ AI credits remaining: {data['ai_credits_remaining']}")
    
    def test_subscription_comparison_table(self, auth_headers):
        """Comparison table has feature rows for frontend display"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        comparison = data["comparison"]
        assert isinstance(comparison, list), "comparison should be a list"
        assert len(comparison) > 0, "comparison should have rows"
        
        # Each row should have feature, discovery, resonance, sovereign
        for row in comparison:
            assert "feature" in row, "comparison row missing 'feature'"
            assert "discovery" in row, "comparison row missing 'discovery'"
            assert "resonance" in row, "comparison row missing 'resonance'"
            assert "sovereign" in row, "comparison row missing 'sovereign'"
        
        print(f"✓ Comparison table has {len(comparison)} feature rows")


class TestMixerUpgrade:
    """Tests for mixer subscription upgrade"""
    
    def test_upgrade_invalid_tier_returns_400(self, auth_headers):
        """POST /api/mixer/subscription/upgrade with invalid tier returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/subscription/upgrade",
            json={"tier": "invalid_tier"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid tier upgrade rejected with 400")
    
    def test_upgrade_to_lower_tier_returns_400(self, auth_headers):
        """Cannot downgrade tier - returns 400"""
        # First get current tier
        sub_response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        current_tier = sub_response.json().get("tier", "discovery")
        
        # Try to downgrade (if not already discovery)
        if current_tier != "discovery":
            response = requests.post(
                f"{BASE_URL}/api/mixer/subscription/upgrade",
                json={"tier": "discovery"},
                headers=auth_headers
            )
            assert response.status_code == 400, f"Expected 400 for downgrade, got {response.status_code}"
            print(f"✓ Downgrade from {current_tier} to discovery rejected")
        else:
            print("✓ User is at discovery tier, skipping downgrade test")


class TestMixerSources:
    """Tests for track sources endpoint"""
    
    def test_get_sources_returns_list(self, auth_headers):
        """GET /api/mixer/sources returns sources list with tier info"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sources" in data, "Response missing 'sources'"
        assert "tier" in data, "Response missing 'tier'"
        assert isinstance(data["sources"], list), "sources should be a list"
        
        print(f"✓ Got {len(data['sources'])} sources for tier: {data['tier']}")
    
    def test_sources_have_required_fields(self, auth_headers):
        """Each source has id, label, type, locked fields"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        sources = response.json()["sources"]
        for source in sources:
            assert "id" in source, f"Source missing 'id': {source}"
            assert "label" in source, f"Source missing 'label': {source}"
            assert "type" in source, f"Source missing 'type': {source}"
            assert "locked" in source, f"Source missing 'locked': {source}"
        
        print(f"✓ All {len(sources)} sources have required fields")
    
    def test_sources_tier_gating(self, auth_headers):
        """Sources are gated by tier - locked sources exist for lower tiers"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        sources = data["sources"]
        tier = data["tier"]
        
        locked_count = sum(1 for s in sources if s["locked"])
        unlocked_count = sum(1 for s in sources if not s["locked"])
        
        print(f"✓ Tier '{tier}': {unlocked_count} unlocked, {locked_count} locked sources")
        
        # Discovery should have some locked, Sovereign should have none locked
        if tier == "sovereign":
            assert locked_count == 0, "Sovereign tier should have no locked sources"
        elif tier == "discovery":
            assert locked_count > 0, "Discovery tier should have some locked sources"


class TestMixerProjects:
    """Tests for mixer projects CRUD"""
    
    def test_list_projects(self, auth_headers):
        """GET /api/mixer/projects returns list of user's projects"""
        response = requests.get(f"{BASE_URL}/api/mixer/projects", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "projects" in data, "Response missing 'projects'"
        assert isinstance(data["projects"], list), "projects should be a list"
        
        print(f"✓ User has {len(data['projects'])} saved projects")
    
    def test_save_project_creates_new(self, auth_headers):
        """POST /api/mixer/projects creates a new project"""
        project_name = f"TEST_Project_{uuid.uuid4().hex[:8]}"
        tracks = [
            {"type": "phonic_tone", "source_label": "Test Tone 1", "volume": 0.8, "frequency": 528},
            {"type": "suanpan", "source_label": "Suanpan 432 Hz", "volume": 0.7, "frequency": 432},
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": tracks},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") in ["created", "updated"], f"Unexpected status: {data.get('status')}"
        assert "project_id" in data, "Response missing 'project_id'"
        assert data.get("track_count") == 2, f"Expected 2 tracks, got {data.get('track_count')}"
        
        print(f"✓ Created project '{project_name}' with ID: {data['project_id']}")
        return data["project_id"]
    
    def test_save_project_requires_name(self, auth_headers):
        """POST /api/mixer/projects without name returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": "", "tracks": []},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Empty project name rejected with 400")
    
    def test_get_project_by_id(self, auth_headers):
        """GET /api/mixer/projects/{id} returns project with tracks"""
        # First create a project
        project_name = f"TEST_GetById_{uuid.uuid4().hex[:8]}"
        tracks = [{"type": "phonic_tone", "source_label": "Test", "volume": 0.5, "frequency": 174}]
        
        create_response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": tracks},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        project_id = create_response.json()["project_id"]
        
        # Now get it
        response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("name") == project_name, f"Expected name '{project_name}', got '{data.get('name')}'"
        assert "tracks" in data, "Response missing 'tracks'"
        assert len(data["tracks"]) == 1, f"Expected 1 track, got {len(data['tracks'])}"
        
        print(f"✓ Retrieved project '{project_name}' with {len(data['tracks'])} tracks")
    
    def test_get_nonexistent_project_returns_404(self, auth_headers):
        """GET /api/mixer/projects/{invalid_id} returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/mixer/projects/{fake_id}", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Nonexistent project returns 404")
    
    def test_delete_project(self, auth_headers):
        """DELETE /api/mixer/projects/{id} removes project"""
        # First create a project
        project_name = f"TEST_Delete_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": []},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        project_id = create_response.json()["project_id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/mixer/projects/{project_id}", headers=auth_headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", headers=auth_headers)
        assert get_response.status_code == 404, "Deleted project should return 404"
        
        print(f"✓ Deleted project '{project_name}'")
    
    def test_delete_nonexistent_project_returns_404(self, auth_headers):
        """DELETE /api/mixer/projects/{invalid_id} returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/mixer/projects/{fake_id}", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Delete nonexistent project returns 404")


class TestLayerCapEnforcement:
    """Tests for layer cap enforcement based on subscription tier"""
    
    def test_layer_cap_enforced_on_save(self, auth_headers):
        """Saving project with too many tracks returns 403 for capped tiers"""
        # Get current tier and layer cap
        sub_response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        sub_data = sub_response.json()
        tier = sub_data["tier"]
        layer_cap = sub_data["tier_config"]["layer_cap"]
        
        print(f"Testing layer cap for tier '{tier}' with cap: {layer_cap}")
        
        if layer_cap <= 0:
            # Sovereign tier - unlimited, skip this test
            print("✓ Sovereign tier has unlimited layers, skipping cap test")
            return
        
        # Create tracks exceeding the cap
        tracks = [
            {"type": "phonic_tone", "source_label": f"Track {i}", "volume": 0.8, "frequency": 100 + i}
            for i in range(layer_cap + 1)
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": f"TEST_CapTest_{uuid.uuid4().hex[:8]}", "tracks": tracks},
            headers=auth_headers
        )
        
        assert response.status_code == 403, f"Expected 403 for exceeding layer cap, got {response.status_code}"
        assert "Layer cap" in response.json().get("detail", ""), "Error should mention layer cap"
        
        print(f"✓ Layer cap enforced: {layer_cap + 1} tracks rejected for {tier} tier (cap: {layer_cap})")
    
    def test_save_at_layer_cap_succeeds(self, auth_headers):
        """Saving project at exactly the layer cap succeeds"""
        # Get current tier and layer cap
        sub_response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        sub_data = sub_response.json()
        tier = sub_data["tier"]
        layer_cap = sub_data["tier_config"]["layer_cap"]
        
        if layer_cap <= 0:
            print("✓ Sovereign tier has unlimited layers, skipping exact cap test")
            return
        
        # Create tracks at exactly the cap
        tracks = [
            {"type": "phonic_tone", "source_label": f"Track {i}", "volume": 0.8, "frequency": 100 + i}
            for i in range(layer_cap)
        ]
        
        project_name = f"TEST_AtCap_{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": tracks},
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200 at layer cap, got {response.status_code}: {response.text}"
        assert response.json().get("track_count") == layer_cap
        
        print(f"✓ Saved project at layer cap ({layer_cap} tracks) for {tier} tier")


class TestProjectUpdate:
    """Tests for project update functionality"""
    
    def test_update_existing_project(self, auth_headers):
        """Saving project with same name updates it"""
        project_name = f"TEST_Update_{uuid.uuid4().hex[:8]}"
        
        # Create initial project
        create_response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": [{"type": "phonic_tone", "source_label": "Initial", "volume": 0.5}]},
            headers=auth_headers
        )
        assert create_response.status_code == 200
        assert create_response.json()["status"] == "created"
        
        # Update with same name
        update_response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            json={"name": project_name, "tracks": [
                {"type": "phonic_tone", "source_label": "Updated 1", "volume": 0.6},
                {"type": "suanpan", "source_label": "Updated 2", "volume": 0.7}
            ]},
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "updated"
        assert update_response.json()["track_count"] == 2
        
        print(f"✓ Project '{project_name}' updated from 1 to 2 tracks")


# Cleanup fixture to remove test projects
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_projects(auth_headers):
    """Cleanup TEST_ prefixed projects after tests"""
    yield
    # Get all projects
    response = requests.get(f"{BASE_URL}/api/mixer/projects", headers=auth_headers)
    if response.status_code == 200:
        projects = response.json().get("projects", [])
        for p in projects:
            if p.get("name", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/mixer/projects/{p['id']}", headers=auth_headers)
        print(f"Cleaned up {sum(1 for p in projects if p.get('name', '').startswith('TEST_'))} test projects")

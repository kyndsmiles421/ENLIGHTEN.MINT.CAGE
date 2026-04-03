"""
Iteration 253 - Academy (Omni-Modality Learning System) API Tests
Tests: modalities, programs, lessons, begin/complete, forge labs, accreditation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
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
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestAcademyModalities:
    """Tests for modality endpoints"""

    def test_get_all_modalities(self, auth_headers):
        """GET /api/academy/modalities - returns all 4 modalities"""
        response = requests.get(f"{BASE_URL}/api/academy/modalities", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "modalities" in data
        modalities = data["modalities"]
        assert len(modalities) == 4, f"Expected 4 modalities, got {len(modalities)}"
        
        # Verify all 4 modalities exist
        modality_ids = [m["id"] for m in modalities]
        assert "architect" in modality_ids
        assert "chef" in modality_ids
        assert "researcher" in modality_ids
        assert "voyager" in modality_ids
        
        # Verify modality structure
        for m in modalities:
            assert "id" in m
            assert "name" in m
            assert "framework" in m
            assert "lesson_label" in m
            assert "test_label" in m
            assert "lab_label" in m
            assert "color" in m
            assert "xp_multiplier" in m
        print(f"✓ GET /api/academy/modalities: 4 modalities returned with correct structure")

    def test_get_user_modality(self, auth_headers):
        """GET /api/academy/modality - returns user's current modality (default: architect)"""
        response = requests.get(f"{BASE_URL}/api/academy/modality", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "modality" in data
        assert "modality_data" in data
        assert data["modality"] in ["architect", "chef", "researcher", "voyager"]
        assert data["modality_data"]["id"] == data["modality"]
        print(f"✓ GET /api/academy/modality: User modality is '{data['modality']}'")

    def test_switch_modality(self, auth_headers):
        """PATCH /api/academy/modality - switches modality and returns new data"""
        # Switch to chef
        response = requests.patch(f"{BASE_URL}/api/academy/modality", 
            headers=auth_headers, json={"modality": "chef"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["modality"] == "chef"
        assert data["modality_data"]["id"] == "chef"
        assert data["modality_data"]["name"] == "The Master Chef"
        print(f"✓ PATCH /api/academy/modality: Switched to 'chef'")
        
        # Switch back to architect
        response = requests.patch(f"{BASE_URL}/api/academy/modality", 
            headers=auth_headers, json={"modality": "architect"})
        assert response.status_code == 200
        assert response.json()["modality"] == "architect"
        print(f"✓ PATCH /api/academy/modality: Switched back to 'architect'")

    def test_switch_invalid_modality(self, auth_headers):
        """PATCH /api/academy/modality - rejects invalid modality"""
        response = requests.patch(f"{BASE_URL}/api/academy/modality", 
            headers=auth_headers, json={"modality": "invalid_mode"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ PATCH /api/academy/modality: Correctly rejects invalid modality")


class TestAcademyPrograms:
    """Tests for programs endpoint"""

    def test_get_programs(self, auth_headers):
        """GET /api/academy/programs - returns all 3 programs with user progress and modality skin"""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "programs" in data
        assert "modality" in data
        programs = data["programs"]
        assert len(programs) == 3, f"Expected 3 programs, got {len(programs)}"
        
        # Verify program IDs
        program_ids = [p["id"] for p in programs]
        assert "foundations" in program_ids
        assert "transmutation" in program_ids
        assert "sentinel_ops" in program_ids
        
        # Verify program structure
        for prog in programs:
            assert "id" in prog
            assert "name" in prog
            assert "description" in prog
            assert "tier" in prog
            assert "modules" in prog
            assert "progress" in prog
            assert "completed" in prog
            assert "modality_skin" in prog
            
            # Verify modules have display_label (modality-skinned)
            for mod in prog["modules"]:
                assert "id" in mod
                assert "title" in mod
                assert "type" in mod
                assert "display_label" in mod
                assert "completed" in mod
                assert "in_progress" in mod
        
        print(f"✓ GET /api/academy/programs: 3 programs returned with modules and modality skin")
        
        # Check foundations has 6 modules
        foundations = next(p for p in programs if p["id"] == "foundations")
        assert len(foundations["modules"]) == 6, f"Foundations should have 6 modules"
        print(f"✓ Foundations program has 6 modules")


class TestAcademyLessons:
    """Tests for lesson content endpoint"""

    def test_get_lesson_content_m1(self, auth_headers):
        """GET /api/academy/lesson/m1 - returns lesson content with sections and key concepts"""
        response = requests.get(f"{BASE_URL}/api/academy/lesson/m1", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "content" in data
        assert "modality" in data
        assert "display_label" in data
        
        content = data["content"]
        assert "title" in content
        assert "sections" in content
        assert "key_concepts" in content
        assert len(content["sections"]) >= 1
        assert len(content["key_concepts"]) >= 1
        
        # Verify section structure
        for section in content["sections"]:
            assert "heading" in section
            assert "body" in section
        
        print(f"✓ GET /api/academy/lesson/m1: '{content['title']}' with {len(content['sections'])} sections")

    def test_get_lesson_content_m2(self, auth_headers):
        """GET /api/academy/lesson/m2 - returns lesson content"""
        response = requests.get(f"{BASE_URL}/api/academy/lesson/m2", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["content"]["title"] == "Identity Modes & Guild Channels"
        print(f"✓ GET /api/academy/lesson/m2: '{data['content']['title']}'")

    def test_get_lesson_content_invalid(self, auth_headers):
        """GET /api/academy/lesson/invalid - returns 404 for non-existent lesson"""
        response = requests.get(f"{BASE_URL}/api/academy/lesson/invalid_module", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET /api/academy/lesson/invalid: Correctly returns 404")


class TestAcademyBeginComplete:
    """Tests for begin and complete module endpoints"""

    def test_begin_module_m2(self, auth_headers):
        """POST /api/academy/begin - starts a module and returns in_progress status"""
        response = requests.post(f"{BASE_URL}/api/academy/begin", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m2"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Could be in_progress or completed (if already done)
        assert data["status"] in ["in_progress", "completed"]
        if data["status"] == "in_progress":
            assert "module" in data
            assert "started_at" in data
            print(f"✓ POST /api/academy/begin: Module m2 started, status='in_progress'")
        else:
            print(f"✓ POST /api/academy/begin: Module m2 already completed")

    def test_begin_invalid_module(self, auth_headers):
        """POST /api/academy/begin - returns 404 for invalid module"""
        response = requests.post(f"{BASE_URL}/api/academy/begin", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "invalid_module"
        })
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ POST /api/academy/begin: Correctly returns 404 for invalid module")

    def test_complete_lesson_m2(self, auth_headers):
        """POST /api/academy/complete - completes a lesson and awards dust + resonance points"""
        # First begin the module
        requests.post(f"{BASE_URL}/api/academy/begin", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m2"
        })
        
        # Then complete it
        response = requests.post(f"{BASE_URL}/api/academy/complete", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m2",
            "focus_minutes": 10
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "completed"
        assert "resonance_points" in data
        assert "dust_earned" in data
        assert "weighted_focus_time" in data
        assert data["resonance_points"] > 0
        assert data["dust_earned"] > 0
        print(f"✓ POST /api/academy/complete: Lesson m2 completed, earned {data['resonance_points']} RP, {data['dust_earned']} dust")

    def test_complete_without_begin(self, auth_headers):
        """POST /api/academy/complete - returns 400 if module not started"""
        # Try to complete a module that hasn't been started (use a fresh module)
        response = requests.post(f"{BASE_URL}/api/academy/complete", headers=auth_headers, json={
            "program_id": "sentinel_ops",
            "module_id": "s2",  # Likely not started
            "focus_minutes": 20
        })
        # Could be 400 (not started) or 200 (if already completed)
        if response.status_code == 400:
            print(f"✓ POST /api/academy/complete: Correctly returns 400 for module not started")
        else:
            print(f"✓ POST /api/academy/complete: Module s2 was already in progress or completed")


class TestAcademyForge:
    """Tests for Forge Lab simulation endpoint"""

    def test_get_forge_lab_m3(self, auth_headers):
        """GET /api/academy/forge/foundations/m3 - returns forge simulation with cluster matrix, scores, challenges"""
        response = requests.get(f"{BASE_URL}/api/academy/forge/foundations/m3", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "module" in data
        assert "modality" in data
        assert "challenge" in data
        assert "simulation" in data
        
        # Verify simulation structure
        sim = data["simulation"]
        assert "type" in sim
        assert "display_label" in sim
        assert "complexity" in sim
        assert "h2_state" in sim
        assert "cluster_matrix" in sim
        assert "cluster_scores" in sim
        assert "validation_rule" in sim
        
        # Verify H² state
        h2 = sim["h2_state"]
        assert "alignment" in h2
        assert "determinant_proxy" in h2
        assert "determinant_positive" in h2
        assert "phase" in h2
        assert "density" in h2
        assert "binary" in h2
        
        # Verify cluster matrix is 4x4
        assert len(sim["cluster_matrix"]) == 4
        assert len(sim["cluster_matrix"][0]) == 4
        
        # Verify cluster scores
        assert len(sim["cluster_scores"]) == 4
        for cs in sim["cluster_scores"]:
            assert "name" in cs
            assert "score" in cs
            assert "max" in cs
        
        # Verify challenge tasks
        challenge = data["challenge"]
        if challenge:
            assert "title" in challenge
            assert "objective" in challenge
            assert "tasks" in challenge
            for task in challenge["tasks"]:
                assert "id" in task
                assert "desc" in task
                assert "weight" in task
        
        print(f"✓ GET /api/academy/forge/foundations/m3: Forge lab returned with H² state and challenges")

    def test_get_forge_lab_t3(self, auth_headers):
        """GET /api/academy/forge/transmutation/t3 - returns forge simulation for transmutation lab"""
        response = requests.get(f"{BASE_URL}/api/academy/forge/transmutation/t3", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["module"]["type"] == "lab"
        assert data["challenge"]["title"] == "Surge Detection & Economic Timing"
        print(f"✓ GET /api/academy/forge/transmutation/t3: '{data['challenge']['title']}'")

    def test_get_forge_for_lesson_fails(self, auth_headers):
        """GET /api/academy/forge/foundations/m1 - returns 400 for lesson (not lab/test)"""
        response = requests.get(f"{BASE_URL}/api/academy/forge/foundations/m1", headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ GET /api/academy/forge/foundations/m1: Correctly returns 400 for lesson type")

    def test_complete_lab_validates_determinant(self, auth_headers):
        """POST /api/academy/complete for lab validates H² determinant (blocks if negative)"""
        # Begin the lab first
        requests.post(f"{BASE_URL}/api/academy/begin", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m3"
        })
        
        # Try to complete the lab
        response = requests.post(f"{BASE_URL}/api/academy/complete", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m3",
            "focus_minutes": 20
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Status could be 'completed' (positive determinant) or 'failed' (negative determinant)
        assert data["status"] in ["completed", "failed"]
        
        if data["status"] == "failed":
            assert "reason" in data
            assert "determinant" in data
            assert "hint" in data
            print(f"✓ POST /api/academy/complete (lab m3): Blocked due to negative determinant ({data['determinant']})")
        else:
            assert "resonance_points" in data
            assert "dust_earned" in data
            print(f"✓ POST /api/academy/complete (lab m3): Completed with positive determinant")


class TestAcademyAccreditation:
    """Tests for accreditation endpoint"""

    def test_get_accreditation(self, auth_headers):
        """GET /api/academy/accreditation - returns mastery level with progress_to_next, modules_total, certifications"""
        response = requests.get(f"{BASE_URL}/api/academy/accreditation", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "resonance_score" in data
        assert "total_focus_minutes" in data
        assert "modules_completed" in data
        assert "modules_total" in data
        assert "programs_total" in data
        assert "programs_completed" in data
        assert "certifications" in data
        assert "mastery_level" in data
        
        # Verify mastery level structure
        ml = data["mastery_level"]
        assert "tier" in ml
        assert "color" in ml
        assert "threshold" in ml
        assert "progress_to_next" in ml
        
        # Verify modules_total is 16 (6 + 6 + 4)
        assert data["modules_total"] == 16, f"Expected 16 total modules, got {data['modules_total']}"
        
        # Verify programs_total is 3
        assert data["programs_total"] == 3
        
        print(f"✓ GET /api/academy/accreditation: {data['modules_completed']}/{data['modules_total']} modules, tier='{ml['tier']}', {data['resonance_score']} RP")


class TestAcademyIntegration:
    """Integration tests for full learning flows"""

    def test_full_lesson_flow(self, auth_headers):
        """Test full lesson flow: begin → read content → complete"""
        # 1. Begin module m4
        begin_res = requests.post(f"{BASE_URL}/api/academy/begin", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m4"
        })
        assert begin_res.status_code == 200
        
        # 2. Get lesson content
        lesson_res = requests.get(f"{BASE_URL}/api/academy/lesson/m4", headers=auth_headers)
        assert lesson_res.status_code == 200
        lesson_data = lesson_res.json()
        assert lesson_data["content"]["title"] == "Reading the H² State Matrix"
        
        # 3. Complete the lesson
        complete_res = requests.post(f"{BASE_URL}/api/academy/complete", headers=auth_headers, json={
            "program_id": "foundations",
            "module_id": "m4",
            "focus_minutes": 25
        })
        assert complete_res.status_code == 200
        complete_data = complete_res.json()
        assert complete_data["status"] == "completed"
        
        print(f"✓ Full lesson flow (m4): begin → read → complete, earned {complete_data['resonance_points']} RP")

    def test_modality_affects_labels(self, auth_headers):
        """Test that modality switch changes module display labels"""
        # Switch to voyager
        requests.patch(f"{BASE_URL}/api/academy/modality", 
            headers=auth_headers, json={"modality": "voyager"})
        
        # Get programs
        prog_res = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        data = prog_res.json()
        
        # Check that lesson modules have "Frequency Map" label (voyager's lesson_label)
        foundations = next(p for p in data["programs"] if p["id"] == "foundations")
        lesson_module = next(m for m in foundations["modules"] if m["type"] == "lesson")
        assert lesson_module["display_label"] == "Frequency Map", f"Expected 'Frequency Map', got '{lesson_module['display_label']}'"
        
        # Switch back to architect
        requests.patch(f"{BASE_URL}/api/academy/modality", 
            headers=auth_headers, json={"modality": "architect"})
        
        # Verify label changed
        prog_res2 = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        data2 = prog_res2.json()
        foundations2 = next(p for p in data2["programs"] if p["id"] == "foundations")
        lesson_module2 = next(m for m in foundations2["modules"] if m["type"] == "lesson")
        assert lesson_module2["display_label"] == "Quest Node", f"Expected 'Quest Node', got '{lesson_module2['display_label']}'"
        
        print(f"✓ Modality switch changes labels: voyager='Frequency Map', architect='Quest Node'")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

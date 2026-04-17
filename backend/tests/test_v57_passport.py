"""
V57.0 Sovereign Trade Passport Tests
Tests the passport endpoint that aggregates rpg_xp_log data into 7 skill domains.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


class TestPassportEndpoint:
    """Tests for GET /api/rpg/passport endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_passport_requires_auth(self):
        """Passport endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Passport endpoint requires authentication")
    
    def test_passport_returns_data(self, auth_headers):
        """Passport endpoint should return passport data for authenticated user"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"PASS: Passport endpoint returns data: {list(data.keys())}")
        return data
    
    def test_passport_has_level(self, auth_headers):
        """Passport should include level"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "level" in data, "Missing 'level' field"
        assert isinstance(data["level"], int), "Level should be an integer"
        print(f"PASS: Passport has level: {data['level']}")
    
    def test_passport_has_total_xp(self, auth_headers):
        """Passport should include total_xp"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_xp" in data, "Missing 'total_xp' field"
        assert isinstance(data["total_xp"], int), "total_xp should be an integer"
        print(f"PASS: Passport has total_xp: {data['total_xp']}")
    
    def test_passport_has_total_actions(self, auth_headers):
        """Passport should include total_actions"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_actions" in data, "Missing 'total_actions' field"
        assert isinstance(data["total_actions"], int), "total_actions should be an integer"
        print(f"PASS: Passport has total_actions: {data['total_actions']}")
    
    def test_passport_has_dive_clearance(self, auth_headers):
        """Passport should include dive_clearance with level, label, desc"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "dive_clearance" in data, "Missing 'dive_clearance' field"
        dc = data["dive_clearance"]
        assert "level" in dc, "dive_clearance missing 'level'"
        assert "label" in dc, "dive_clearance missing 'label'"
        assert "desc" in dc, "dive_clearance missing 'desc'"
        assert dc["level"] >= 0 and dc["level"] <= 5, f"Dive clearance level should be 0-5, got {dc['level']}"
        print(f"PASS: Passport has dive_clearance: L{dc['level']} - {dc['label']}")
    
    def test_passport_has_7_domains(self, auth_headers):
        """Passport should include exactly 7 domains"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "domains" in data, "Missing 'domains' field"
        domains = data["domains"]
        assert len(domains) == 7, f"Expected 7 domains, got {len(domains)}"
        
        expected_domains = [
            "Trade & Craft", "Healing Arts", "Mind & Spirit", 
            "Science & Physics", "Creative Arts", "Exploration", "Sacred Knowledge"
        ]
        domain_names = [d["domain"] for d in domains]
        for expected in expected_domains:
            assert expected in domain_names, f"Missing domain: {expected}"
        print(f"PASS: Passport has 7 domains: {domain_names}")
    
    def test_domain_structure(self, auth_headers):
        """Each domain should have: domain, color, actions, xp, rank, tier, progress_pct"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        domains = data["domains"]
        
        required_fields = ["domain", "color", "actions", "xp", "rank", "tier", "progress_pct"]
        for domain in domains:
            for field in required_fields:
                assert field in domain, f"Domain '{domain.get('domain', 'unknown')}' missing '{field}'"
        print(f"PASS: All domains have required fields: {required_fields}")
    
    def test_passport_has_unlocked_titles(self, auth_headers):
        """Passport should include unlocked_titles list"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "unlocked_titles" in data, "Missing 'unlocked_titles' field"
        assert isinstance(data["unlocked_titles"], list), "unlocked_titles should be a list"
        print(f"PASS: Passport has unlocked_titles: {len(data['unlocked_titles'])} titles")
    
    def test_passport_has_locked_titles(self, auth_headers):
        """Passport should include locked_titles list"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "locked_titles" in data, "Missing 'locked_titles' field"
        assert isinstance(data["locked_titles"], list), "locked_titles should be a list"
        print(f"PASS: Passport has locked_titles: {len(data['locked_titles'])} titles")
    
    def test_8_hybrid_titles_total(self, auth_headers):
        """Should have 8 hybrid titles total (unlocked + locked)"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        total_titles = len(data["unlocked_titles"]) + len(data["locked_titles"])
        assert total_titles == 8, f"Expected 8 total titles, got {total_titles}"
        
        expected_title_ids = [
            "general_contractor", "master_artisan", "sovereign_healer", 
            "quantum_architect", "renaissance_soul", "cosmic_navigator", 
            "sage_oracle", "hardscape_engineer"
        ]
        all_titles = data["unlocked_titles"] + data["locked_titles"]
        title_ids = [t["id"] for t in all_titles]
        for expected in expected_title_ids:
            assert expected in title_ids, f"Missing title: {expected}"
        print(f"PASS: All 8 hybrid titles present: {title_ids}")
    
    def test_title_structure(self, auth_headers):
        """Each title should have: id, title, color, desc, requirements"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        all_titles = data["unlocked_titles"] + data["locked_titles"]
        
        required_fields = ["id", "title", "color", "desc", "requirements"]
        for title in all_titles:
            for field in required_fields:
                assert field in title, f"Title '{title.get('id', 'unknown')}' missing '{field}'"
            # Check requirements structure
            for dom, req in title["requirements"].items():
                assert "required" in req, f"Title {title['id']} requirement for {dom} missing 'required'"
                assert "current" in req, f"Title {title['id']} requirement for {dom} missing 'current'"
                assert "met" in req, f"Title {title['id']} requirement for {dom} missing 'met'"
        print(f"PASS: All titles have required fields with proper requirements structure")
    
    def test_dive_clearance_levels(self, auth_headers):
        """Verify dive clearance level labels"""
        response = requests.get(f"{BASE_URL}/api/rpg/passport", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        dc = data["dive_clearance"]
        
        # Valid labels based on backend code
        valid_labels = ["Surface", "Grain Structure", "Mineral Domains", 
                        "Crystal Lattice", "Molecular Bonds", "Quantum Shell"]
        assert dc["label"] in valid_labels, f"Invalid dive clearance label: {dc['label']}"
        print(f"PASS: Dive clearance label is valid: {dc['label']}")


class TestWorkbenchesStillWork:
    """Verify Masonry and Carpentry workbenches still work (regression)"""
    
    def test_masonry_stones_endpoint(self):
        """GET /api/workshop/masonry/stones should return 6 stones"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/stones")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "stones" in data, "Missing 'stones' field"
        assert len(data["stones"]) == 6, f"Expected 6 stones, got {len(data['stones'])}"
        print(f"PASS: Masonry stones endpoint returns 6 stones")
    
    def test_masonry_tools_endpoint(self):
        """GET /api/workshop/masonry/tools should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/masonry/tools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tools" in data, "Missing 'tools' field"
        assert len(data["tools"]) == 9, f"Expected 9 tools, got {len(data['tools'])}"
        print(f"PASS: Masonry tools endpoint returns 9 tools")
    
    def test_carpentry_woods_endpoint(self):
        """GET /api/workshop/carpentry/woods should return 6 woods"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/woods")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "woods" in data, "Missing 'woods' field"
        assert len(data["woods"]) == 6, f"Expected 6 woods, got {len(data['woods'])}"
        print(f"PASS: Carpentry woods endpoint returns 6 woods")
    
    def test_carpentry_tools_endpoint(self):
        """GET /api/workshop/carpentry/tools should return 9 tools"""
        response = requests.get(f"{BASE_URL}/api/workshop/carpentry/tools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tools" in data, "Missing 'tools' field"
        assert len(data["tools"]) == 9, f"Expected 9 tools, got {len(data['tools'])}"
        print(f"PASS: Carpentry tools endpoint returns 9 tools")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

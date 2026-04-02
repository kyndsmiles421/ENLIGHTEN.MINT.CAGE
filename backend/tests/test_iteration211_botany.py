"""
Iteration 211 - Botany Module Tests
Tests for the new TCM Botany & Gardening Module with Five Elements integration.

Endpoints tested:
- GET /api/botany/catalog - Plant catalog with gravity_mass, frequency, element, nature
- GET /api/botany/plant/{plant_id} - Full plant detail
- POST /api/botany/garden/add - Add plant to user's garden (max 24)
- GET /api/botany/garden - User's garden with energetics summary
- POST /api/botany/garden/nurture - Daily nurture action with growth stages
- DELETE /api/botany/garden/{garden_id} - Remove from garden
- POST /api/botany/identify - AI plant identification with TCM profile (Gemini)
- GET /api/botany/element-map - Five Elements relationship map
- GET /api/botany/gravity-nodes - Plant catalog as gravity nodes for Spatial OS
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBotanyModule:
    """Tests for the new Botany module endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        # Login with test credentials
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.user_id = login_response.json().get("user", {}).get("id")
    
    # ========== CATALOG TESTS ==========
    
    def test_get_plant_catalog(self):
        """GET /api/botany/catalog - Returns 12 plants with TCM properties"""
        response = requests.get(f"{BASE_URL}/api/botany/catalog", headers=self.headers)
        assert response.status_code == 200, f"Catalog failed: {response.text}"
        
        data = response.json()
        assert "plants" in data, "Response should have 'plants' key"
        assert "current_tier" in data, "Response should have 'current_tier' key"
        assert "element_frequencies" in data, "Response should have 'element_frequencies' key"
        assert "element_colors" in data, "Response should have 'element_colors' key"
        
        plants = data["plants"]
        assert len(plants) == 12, f"Expected 12 plants, got {len(plants)}"
        
        # Verify plant structure
        for plant in plants:
            assert "id" in plant
            assert "name" in plant
            assert "element" in plant
            assert "nature" in plant
            assert "gravity_mass" in plant
            assert "frequency" in plant
            assert "rarity" in plant
            assert "locked" in plant
            
            # Verify element is one of Five Elements
            assert plant["element"] in ["Wood", "Fire", "Earth", "Metal", "Water"]
            
            # Verify nature is valid TCM nature
            assert plant["nature"] in ["Hot", "Warm", "Neutral", "Cool", "Cold"]
            
            # Verify gravity_mass is reasonable
            assert 60 <= plant["gravity_mass"] <= 100
            
            # Verify frequency is a Solfeggio frequency
            assert plant["frequency"] in [396.0, 528.0, 639.0, 741.0, 852.0]
        
        print(f"PASS: Catalog returns {len(plants)} plants with valid TCM properties")
    
    def test_catalog_tier_locking(self):
        """Verify plants are locked/unlocked based on mastery tier"""
        response = requests.get(f"{BASE_URL}/api/botany/catalog", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        current_tier = data["current_tier"]
        plants = data["plants"]
        
        # Count locked vs unlocked
        locked_count = sum(1 for p in plants if p.get("locked"))
        unlocked_count = sum(1 for p in plants if not p.get("locked"))
        
        print(f"Current tier: {current_tier}")
        print(f"Unlocked plants: {unlocked_count}, Locked plants: {locked_count}")
        
        # Observer tier should have common plants unlocked
        common_plants = [p for p in plants if p["rarity"] == "common"]
        for p in common_plants:
            assert not p.get("locked"), f"Common plant {p['name']} should be unlocked for observer tier"
        
        print(f"PASS: Tier-based locking works correctly for {current_tier} tier")
    
    # ========== PLANT DETAIL TESTS ==========
    
    def test_get_plant_detail(self):
        """GET /api/botany/plant/{plant_id} - Returns full plant detail"""
        # Test with chrysanthemum (common, should be unlocked)
        response = requests.get(f"{BASE_URL}/api/botany/plant/chrysanthemum", headers=self.headers)
        assert response.status_code == 200, f"Plant detail failed: {response.text}"
        
        data = response.json()
        assert data["id"] == "chrysanthemum"
        assert data["name"] == "Chrysanthemum"
        assert data["element"] == "Metal"
        assert data["nature"] == "Cool"
        assert "tcm_actions" in data
        assert "traditional_use" in data
        assert "spiritual" in data
        assert "energetic_profile" in data
        assert "in_garden" in data
        
        print(f"PASS: Plant detail returns full data for chrysanthemum")
    
    def test_get_plant_detail_not_found(self):
        """GET /api/botany/plant/{plant_id} - Returns 404 for invalid plant"""
        response = requests.get(f"{BASE_URL}/api/botany/plant/invalid_plant_xyz", headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid plant returns 404")
    
    # ========== GARDEN TESTS ==========
    
    def test_get_garden(self):
        """GET /api/botany/garden - Returns user's garden with summary"""
        response = requests.get(f"{BASE_URL}/api/botany/garden", headers=self.headers)
        assert response.status_code == 200, f"Garden failed: {response.text}"
        
        data = response.json()
        assert "garden" in data
        assert "summary" in data
        
        summary = data["summary"]
        assert "total_plants" in summary
        assert "dominant_element" in summary
        assert "dominant_nature" in summary
        assert "element_distribution" in summary
        assert "nature_distribution" in summary
        assert "total_gravity_mass" in summary
        assert "garden_frequency" in summary
        
        print(f"PASS: Garden returns {summary['total_plants']} plants with energetics summary")
    
    def test_add_plant_to_garden(self):
        """POST /api/botany/garden/add - Adds plant to garden"""
        # First check if mugwort is already in garden
        garden_response = requests.get(f"{BASE_URL}/api/botany/garden", headers=self.headers)
        garden = garden_response.json().get("garden", [])
        mugwort_entry = next((g for g in garden if g["plant_id"] == "mugwort"), None)
        
        if mugwort_entry:
            # Remove it first so we can test adding
            requests.delete(f"{BASE_URL}/api/botany/garden/{mugwort_entry['id']}", headers=self.headers)
        
        # Add mugwort (common, Fire element)
        response = requests.post(f"{BASE_URL}/api/botany/garden/add", 
            json={"plant_id": "mugwort"}, headers=self.headers)
        assert response.status_code == 200, f"Add to garden failed: {response.text}"
        
        data = response.json()
        assert data["plant_id"] == "mugwort"
        assert data["plant_name"] == "Mugwort"
        assert data["element"] == "Fire"
        assert data["nature"] == "Warm"
        assert data["stage"] == "Seed"
        assert data["nurture_count"] == 0
        assert "id" in data  # Garden entry ID
        
        self.mugwort_garden_id = data["id"]
        print(f"PASS: Added mugwort to garden with ID {self.mugwort_garden_id}")
    
    def test_add_duplicate_plant_to_garden(self):
        """POST /api/botany/garden/add - Returns 400 for duplicate plant"""
        # First ensure chrysanthemum is in garden
        garden_response = requests.get(f"{BASE_URL}/api/botany/garden", headers=self.headers)
        garden = garden_response.json().get("garden", [])
        
        if not any(g["plant_id"] == "chrysanthemum" for g in garden):
            # Add it first
            requests.post(f"{BASE_URL}/api/botany/garden/add", 
                json={"plant_id": "chrysanthemum"}, headers=self.headers)
        
        # Try to add again - should fail
        response = requests.post(f"{BASE_URL}/api/botany/garden/add", 
            json={"plant_id": "chrysanthemum"}, headers=self.headers)
        assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
        assert "already in your garden" in response.json().get("detail", "").lower()
        
        print("PASS: Duplicate plant add returns 400")
    
    def test_add_invalid_plant_to_garden(self):
        """POST /api/botany/garden/add - Returns 404 for invalid plant"""
        response = requests.post(f"{BASE_URL}/api/botany/garden/add", 
            json={"plant_id": "invalid_plant_xyz"}, headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid plant add returns 404")
    
    # ========== NURTURE TESTS ==========
    
    def test_nurture_plant(self):
        """POST /api/botany/garden/nurture - Nurtures a plant"""
        # Get garden to find a plant to nurture
        garden_response = requests.get(f"{BASE_URL}/api/botany/garden", headers=self.headers)
        garden = garden_response.json().get("garden", [])
        
        if not garden:
            # Add a plant first
            add_response = requests.post(f"{BASE_URL}/api/botany/garden/add", 
                json={"plant_id": "licorice"}, headers=self.headers)
            garden_id = add_response.json()["id"]
        else:
            # Find one that hasn't been nurtured today
            today = time.strftime("%Y-%m-%d")
            entry = next((g for g in garden if g.get("last_nurtured") != today), None)
            if entry:
                garden_id = entry["id"]
            else:
                # All nurtured today, test duplicate nurture
                garden_id = garden[0]["id"]
                response = requests.post(f"{BASE_URL}/api/botany/garden/nurture", 
                    json={"garden_id": garden_id}, headers=self.headers)
                assert response.status_code == 400, f"Expected 400 for already nurtured, got {response.status_code}"
                print("PASS: Duplicate nurture returns 400")
                return
        
        response = requests.post(f"{BASE_URL}/api/botany/garden/nurture", 
            json={"garden_id": garden_id}, headers=self.headers)
        assert response.status_code == 200, f"Nurture failed: {response.text}"
        
        data = response.json()
        assert "grew" in data
        assert "stage" in data
        assert "nurture_count" in data
        assert "next_stage_in" in data
        
        print(f"PASS: Nurtured plant - stage: {data['stage']}, grew: {data['grew']}")
    
    def test_nurture_invalid_garden_entry(self):
        """POST /api/botany/garden/nurture - Returns 404 for invalid garden entry"""
        response = requests.post(f"{BASE_URL}/api/botany/garden/nurture", 
            json={"garden_id": "invalid-uuid-xyz"}, headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid garden entry nurture returns 404")
    
    # ========== DELETE TESTS ==========
    
    def test_remove_from_garden(self):
        """DELETE /api/botany/garden/{garden_id} - Removes plant from garden"""
        # First add a plant to remove
        add_response = requests.post(f"{BASE_URL}/api/botany/garden/add", 
            json={"plant_id": "white_peony"}, headers=self.headers)
        
        if add_response.status_code == 400:
            # Already in garden, get its ID
            garden_response = requests.get(f"{BASE_URL}/api/botany/garden", headers=self.headers)
            garden = garden_response.json().get("garden", [])
            entry = next((g for g in garden if g["plant_id"] == "white_peony"), None)
            if entry:
                garden_id = entry["id"]
            else:
                pytest.skip("Could not find white_peony in garden")
        else:
            garden_id = add_response.json()["id"]
        
        # Remove it
        response = requests.delete(f"{BASE_URL}/api/botany/garden/{garden_id}", headers=self.headers)
        assert response.status_code == 200, f"Remove failed: {response.text}"
        assert response.json().get("status") == "removed"
        
        print("PASS: Removed plant from garden")
    
    def test_remove_invalid_garden_entry(self):
        """DELETE /api/botany/garden/{garden_id} - Returns 404 for invalid entry"""
        response = requests.delete(f"{BASE_URL}/api/botany/garden/invalid-uuid-xyz", headers=self.headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid garden entry delete returns 404")
    
    # ========== AI IDENTIFY TESTS ==========
    
    def test_identify_plant(self):
        """POST /api/botany/identify - AI plant identification with TCM profile"""
        response = requests.post(f"{BASE_URL}/api/botany/identify", 
            json={"description": "A plant with yellow flowers used for liver health"}, 
            headers=self.headers)
        assert response.status_code == 200, f"Identify failed: {response.text}"
        
        data = response.json()
        assert "identification" in data
        assert "source" in data
        
        identification = data["identification"]
        # Should have TCM properties
        assert "element" in identification
        assert "nature" in identification
        assert "frequency" in identification
        assert "gravity_mass" in identification
        
        print(f"PASS: AI identified plant as {identification.get('name', 'Unknown')} ({data['source']})")
    
    def test_identify_plant_short_description(self):
        """POST /api/botany/identify - Returns 400 for too short description"""
        response = requests.post(f"{BASE_URL}/api/botany/identify", 
            json={"description": "hi"}, headers=self.headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Short description returns 400")
    
    # ========== ELEMENT MAP TESTS ==========
    
    def test_get_element_map(self):
        """GET /api/botany/element-map - Five Elements relationship map"""
        response = requests.get(f"{BASE_URL}/api/botany/element-map", headers=self.headers)
        assert response.status_code == 200, f"Element map failed: {response.text}"
        
        data = response.json()
        assert "elements" in data
        
        elements = data["elements"]
        assert len(elements) == 5, f"Expected 5 elements, got {len(elements)}"
        
        for elem_name in ["Wood", "Fire", "Earth", "Metal", "Water"]:
            assert elem_name in elements, f"Missing element: {elem_name}"
            elem = elements[elem_name]
            assert "frequency" in elem
            assert "color" in elem
            assert "plants" in elem
            assert "generating" in elem  # Generating cycle
            assert "controlling" in elem  # Controlling cycle
        
        # Verify generating cycle (Wood -> Fire -> Earth -> Metal -> Water -> Wood)
        assert elements["Wood"]["generating"] == "Fire"
        assert elements["Fire"]["generating"] == "Earth"
        assert elements["Earth"]["generating"] == "Metal"
        assert elements["Metal"]["generating"] == "Water"
        assert elements["Water"]["generating"] == "Wood"
        
        # Verify controlling cycle (Wood -> Earth, Fire -> Metal, etc.)
        assert elements["Wood"]["controlling"] == "Earth"
        assert elements["Fire"]["controlling"] == "Metal"
        
        print("PASS: Element map returns Five Elements with generating/controlling cycles")
    
    # ========== GRAVITY NODES TESTS ==========
    
    def test_get_gravity_nodes(self):
        """GET /api/botany/gravity-nodes - Plant catalog as gravity nodes"""
        response = requests.get(f"{BASE_URL}/api/botany/gravity-nodes", headers=self.headers)
        assert response.status_code == 200, f"Gravity nodes failed: {response.text}"
        
        data = response.json()
        assert "nodes" in data
        
        nodes = data["nodes"]
        assert len(nodes) == 12, f"Expected 12 nodes, got {len(nodes)}"
        
        for node in nodes:
            assert node["id"].startswith("plant-"), f"Node ID should start with 'plant-': {node['id']}"
            assert "label" in node
            assert node["type"] == "botanical"
            assert "frequency" in node
            assert "gravity_mass" in node
            assert "category" in node  # Element in lowercase
            assert "nature" in node
            assert "rarity" in node
            assert "element_color" in node
        
        print(f"PASS: Gravity nodes returns {len(nodes)} botanical nodes for Spatial OS")


class TestArchivesAuthTiming:
    """Test the Archives page auth timing fix"""
    
    def test_archives_entries_requires_auth(self):
        """GET /api/archives/entries - Requires authentication"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/archives/entries")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
        # With auth
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/archives/entries", headers=headers)
        assert response.status_code == 200, f"Archives entries failed with auth: {response.text}"
        
        print("PASS: Archives entries requires auth and works with valid token")
    
    def test_archives_linguistics_requires_auth(self):
        """GET /api/archives/linguistics - Requires authentication"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/archives/linguistics")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
        print("PASS: Archives linguistics requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

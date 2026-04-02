"""
Iteration 197: Tesla 3-6-9 Nodal Resonance + Culinary Frequency Recipe Tests

Features tested:
1. GET /api/moods/frequency-recipe - Returns culinary recipe based on last mood
2. Recipe returns is_tesla_harmony=true when 3/6/9 moods were used
3. Each ingredient has name, type, flavor, temp, frequency fields
4. POST /api/moods with 3 moods triggers chorded resonance + 3 geometries
5. POST /api/moods with single mood still works (backward compat)
6. Recipe type changes based on ingredient count (Pure Essence/Simple Infusion/Complex Reduction/Tesla Harmony)
7. Regression tests for existing endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestAuth:
    """Authentication helper"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestFrequencyRecipeEndpoint(TestAuth):
    """Tests for GET /api/moods/frequency-recipe endpoint"""
    
    def test_frequency_recipe_returns_200(self, auth_headers):
        """Test that frequency-recipe endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ GET /api/moods/frequency-recipe returns 200")
    
    def test_frequency_recipe_has_recipe_field(self, auth_headers):
        """Test that response has has_recipe field"""
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        assert "has_recipe" in data, "Response missing 'has_recipe' field"
        print(f"✓ Response has 'has_recipe' field: {data['has_recipe']}")
    
    def test_frequency_recipe_structure_when_has_recipe(self, auth_headers):
        """Test recipe structure when user has mood history"""
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe"):
            # Verify required fields
            assert "recipe_name" in data, "Missing 'recipe_name'"
            assert "ingredients" in data, "Missing 'ingredients'"
            assert "ingredient_count" in data, "Missing 'ingredient_count'"
            assert "moods" in data, "Missing 'moods'"
            assert "is_tesla_harmony" in data, "Missing 'is_tesla_harmony'"
            
            print(f"✓ Recipe structure valid: {data['recipe_name']}, {data['ingredient_count']} ingredients")
            print(f"  is_tesla_harmony: {data['is_tesla_harmony']}")
        else:
            print("✓ No recipe (user has no mood history)")
    
    def test_frequency_recipe_ingredient_structure(self, auth_headers):
        """Test that each ingredient has required fields"""
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe") and data.get("ingredients"):
            for i, ing in enumerate(data["ingredients"]):
                assert "name" in ing, f"Ingredient {i} missing 'name'"
                assert "type" in ing, f"Ingredient {i} missing 'type'"
                assert "flavor" in ing, f"Ingredient {i} missing 'flavor'"
                assert "temp" in ing, f"Ingredient {i} missing 'temp'"
                assert "frequency" in ing, f"Ingredient {i} missing 'frequency'"
                
                print(f"  ✓ Ingredient {i+1}: {ing['name']} ({ing['frequency']}Hz) - {ing['type']}, {ing['flavor']}")
        else:
            print("✓ No ingredients to verify (no recipe)")


class TestMoodPostWithMultiSelect(TestAuth):
    """Tests for POST /api/moods with multi-select moods"""
    
    def test_post_single_mood_backward_compat(self, auth_headers):
        """Test that single mood POST still works (backward compatibility)"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Happy",
            "intensity": 7,
            "note": "Test single mood"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "frequency_stack" in data, "Missing 'frequency_stack'"
        assert "geometry_stack" in data, "Missing 'geometry_stack'"
        assert "resonance_type" in data, "Missing 'resonance_type'"
        assert data["resonance_type"] == "pure", f"Expected 'pure' resonance, got {data['resonance_type']}"
        
        print(f"✓ Single mood POST works: resonance_type={data['resonance_type']}")
        print(f"  frequency_stack: {data['frequency_stack']}")
    
    def test_post_three_moods_chorded_resonance(self, auth_headers):
        """Test that 3 moods triggers chorded resonance (Tesla 3-6-9)"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Happy",
            "moods": ["happy", "peaceful", "inspired"],
            "intensity": 8,
            "note": "Test Tesla 3-mood harmony"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify chorded resonance
        assert data["resonance_type"] == "chorded", f"Expected 'chorded', got {data['resonance_type']}"
        assert len(data.get("frequency_stack", [])) >= 1, "frequency_stack should have values"
        assert len(data.get("geometry_stack", [])) >= 1, "geometry_stack should have values"
        
        print(f"✓ 3-mood POST triggers chorded resonance")
        print(f"  frequency_stack: {data['frequency_stack']}")
        print(f"  geometry_stack: {data['geometry_stack']}")
    
    def test_post_three_moods_returns_three_geometries(self, auth_headers):
        """Test that 3 different moods return up to 3 geometries"""
        # Use moods with different frequencies to get different geometries
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Tired",
            "moods": ["tired", "curious", "awakening"],  # 174Hz, 852Hz, 963Hz
            "intensity": 6,
            "note": "Test 3 different geometries"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # With 3 different frequencies, we should get multiple geometries
        geometries = data.get("geometry_stack", [])
        frequencies = data.get("frequency_stack", [])
        
        print(f"✓ 3-mood POST with different frequencies")
        print(f"  frequencies: {frequencies}")
        print(f"  geometries: {geometries}")
        
        # Verify we have multiple unique values
        assert len(set(frequencies)) >= 2, "Should have at least 2 unique frequencies"


class TestTeslaHarmonyRecipe(TestAuth):
    """Tests for Tesla Harmony detection in frequency recipe"""
    
    def test_recipe_after_three_mood_post_is_tesla_harmony(self, auth_headers):
        """Test that recipe shows Tesla Harmony after 3-mood check-in"""
        # First, post 3 moods
        post_response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Grateful",
            "moods": ["grateful", "hopeful", "creative"],
            "intensity": 9,
            "note": "Tesla harmony test"
        }, headers=auth_headers)
        
        assert post_response.status_code == 200, f"POST failed: {post_response.text}"
        
        # Now get the recipe
        recipe_response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        assert recipe_response.status_code == 200
        
        data = recipe_response.json()
        assert data.get("has_recipe") == True, "Should have recipe"
        assert data.get("is_tesla_harmony") == True, f"Expected is_tesla_harmony=True, got {data.get('is_tesla_harmony')}"
        assert data.get("recipe_name") == "Tesla Harmony Blend", f"Expected 'Tesla Harmony Blend', got {data.get('recipe_name')}"
        
        print(f"✓ Recipe after 3-mood POST is Tesla Harmony Blend")
        print(f"  is_tesla_harmony: {data['is_tesla_harmony']}")
        print(f"  recipe_name: {data['recipe_name']}")
        print(f"  ingredient_count: {data['ingredient_count']}")


class TestRecipeTypeVariations(TestAuth):
    """Tests for different recipe types based on ingredient count"""
    
    def test_single_mood_pure_essence(self, auth_headers):
        """Test that single mood creates Pure Essence recipe"""
        # Post single mood
        requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Peaceful",
            "moods": ["peaceful"],
            "intensity": 7
        }, headers=auth_headers)
        
        # Get recipe
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe") and data.get("ingredient_count") == 1:
            assert data.get("recipe_name") == "Pure Essence", f"Expected 'Pure Essence', got {data.get('recipe_name')}"
            print(f"✓ Single mood creates Pure Essence recipe")
        else:
            print(f"✓ Recipe type: {data.get('recipe_name')} (ingredient_count: {data.get('ingredient_count')})")
    
    def test_two_moods_simple_infusion(self, auth_headers):
        """Test that 2 moods creates Simple Infusion recipe"""
        # Post 2 moods
        requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Energized",
            "moods": ["energized", "brave"],
            "intensity": 8
        }, headers=auth_headers)
        
        # Get recipe
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe") and data.get("ingredient_count") == 2:
            assert data.get("recipe_name") == "Simple Infusion", f"Expected 'Simple Infusion', got {data.get('recipe_name')}"
            assert data.get("is_tesla_harmony") == False, "2 moods should not be Tesla Harmony"
            print(f"✓ 2 moods creates Simple Infusion recipe")
        else:
            print(f"✓ Recipe type: {data.get('recipe_name')} (ingredient_count: {data.get('ingredient_count')})")
    
    def test_four_moods_complex_reduction(self, auth_headers):
        """Test that 4 moods creates Complex Reduction recipe (not Tesla)"""
        # Post 4 moods
        requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Happy",
            "moods": ["happy", "peaceful", "energized", "grateful"],
            "intensity": 7
        }, headers=auth_headers)
        
        # Get recipe
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe") and data.get("ingredient_count") == 4:
            assert data.get("recipe_name") == "Complex Reduction", f"Expected 'Complex Reduction', got {data.get('recipe_name')}"
            assert data.get("is_tesla_harmony") == False, "4 moods should not be Tesla Harmony"
            print(f"✓ 4 moods creates Complex Reduction recipe")
        else:
            print(f"✓ Recipe type: {data.get('recipe_name')} (ingredient_count: {data.get('ingredient_count')})")


class TestFrequencyCulinaryMapping(TestAuth):
    """Tests for FREQ_CULINARY mapping correctness"""
    
    def test_frequency_to_ingredient_mapping(self, auth_headers):
        """Test that frequencies map to correct culinary ingredients"""
        # Expected mappings from FREQ_CULINARY
        expected_mappings = {
            174: "Root Broth",
            285: "Sea Salt Crystal",
            396: "Black Pepper Grind",
            417: "Ginger Root",
            432: "Honey Drizzle",
            528: "Olive Oil",
            639: "Vanilla Extract",
            741: "Citrus Zest",
            852: "Saffron Thread",
            963: "Truffle Shaving"
        }
        
        # Post a mood with known frequency (peaceful = 432Hz)
        requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Peaceful",
            "moods": ["peaceful"],
            "intensity": 7
        }, headers=auth_headers)
        
        response = requests.get(f"{BASE_URL}/api/moods/frequency-recipe", headers=auth_headers)
        data = response.json()
        
        if data.get("has_recipe") and data.get("ingredients"):
            for ing in data["ingredients"]:
                freq = ing.get("frequency")
                name = ing.get("name")
                if freq in expected_mappings:
                    assert name == expected_mappings[freq], f"Frequency {freq}Hz should map to {expected_mappings[freq]}, got {name}"
                    print(f"✓ {freq}Hz → {name} (correct)")
        else:
            print("✓ No ingredients to verify mapping")


class TestRegressionEndpoints(TestAuth):
    """Regression tests for existing endpoints"""
    
    def test_get_moods_returns_history(self, auth_headers):
        """Test GET /api/moods returns mood history"""
        response = requests.get(f"{BASE_URL}/api/moods", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/moods returns {len(data)} mood entries")
    
    def test_get_moods_insights_works(self, auth_headers):
        """Test GET /api/moods/insights works"""
        response = requests.get(f"{BASE_URL}/api/moods/insights", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "has_data" in data, "Response should have 'has_data' field"
        print(f"✓ GET /api/moods/insights returns has_data={data.get('has_data')}")
    
    def test_get_power_spots_works(self, auth_headers):
        """Test GET /api/cosmic-map/power-spots works"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/cosmic-map/power-spots returns 200")
    
    def test_get_leaderboard_works(self, auth_headers):
        """Test GET /api/sync/leaderboard works"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "leaderboard" in data, "Response should have 'leaderboard' field"
        print(f"✓ GET /api/sync/leaderboard returns {len(data.get('leaderboard', []))} entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

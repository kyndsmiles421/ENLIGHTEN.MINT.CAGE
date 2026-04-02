"""
Iteration 212 - Five Elements Wheel & Botanical Trade Tests
Tests for:
1. Five Elements Wheel on Botany page (frontend component)
2. POST /api/trade-circle/botanical-listing - creates listing with gravity_mass from TCM properties
3. POST /api/trade-circle/botanical-listing with listing_type=frequency_recipe
4. GET /api/trade-circle/gravity-weighted - returns listings sorted by gravity_mass
5. GET /api/trade-circle/categories - includes botanical and frequency_recipe
"""

import pytest
import requests
import os

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
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTradeCircleCategories:
    """Test that categories include botanical and frequency_recipe"""
    
    def test_categories_include_botanical(self, auth_headers):
        """GET /api/trade-circle/categories should include botanical category"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/categories", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "categories" in data
        
        category_ids = [c["id"] for c in data["categories"]]
        assert "botanical" in category_ids, "botanical category should be present"
        
        # Find botanical category and verify properties
        botanical = next((c for c in data["categories"] if c["id"] == "botanical"), None)
        assert botanical is not None
        assert botanical["name"] == "Botanicals"
        assert botanical["icon"] == "leaf"
        assert botanical["color"] == "#22C55E"
        print(f"PASS: botanical category found with correct properties")
    
    def test_categories_include_frequency_recipe(self, auth_headers):
        """GET /api/trade-circle/categories should include frequency_recipe category"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/categories", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        category_ids = [c["id"] for c in data["categories"]]
        assert "frequency_recipe" in category_ids, "frequency_recipe category should be present"
        
        # Find frequency_recipe category and verify properties
        recipe = next((c for c in data["categories"] if c["id"] == "frequency_recipe"), None)
        assert recipe is not None
        assert recipe["name"] == "Frequency Recipes"
        assert recipe["icon"] == "zap"
        assert recipe["color"] == "#EAB308"
        print(f"PASS: frequency_recipe category found with correct properties")


class TestBotanicalListing:
    """Test botanical listing creation with gravity mass calculation"""
    
    def test_create_botanical_listing_wood_element(self, auth_headers):
        """POST /api/trade-circle/botanical-listing with Wood element"""
        payload = {
            "title": "TEST_Wood Element Seeds",
            "description": "Organic seeds for Wood element plants",
            "element": "Wood",
            "nature": "Warm",
            "listing_type": "botanical",
            "offering": "10 organic seeds",
            "seeking": "Earth element cuttings"
        }
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["category"] == "botanical"
        assert data["element"] == "Wood"
        assert data["nature"] == "Warm"
        
        # Verify gravity mass calculation: 60 (base) + 10 (Wood) + 10 (Warm) = 80
        expected_mass = 60 + 10 + 10  # base + Wood weight + Warm weight
        assert data["gravity_mass"] == expected_mass, f"Expected mass {expected_mass}, got {data['gravity_mass']}"
        
        # Verify frequency is Wood's Solfeggio frequency
        assert data["frequency"] == 396.0, f"Expected 396.0Hz for Wood, got {data['frequency']}"
        
        print(f"PASS: Botanical listing created with gravity_mass={data['gravity_mass']}, frequency={data['frequency']}Hz")
        
        # Cleanup - delete the test listing
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
    
    def test_create_botanical_listing_fire_element(self, auth_headers):
        """POST /api/trade-circle/botanical-listing with Fire element (highest element weight)"""
        payload = {
            "title": "TEST_Fire Element Herbs",
            "description": "Hot nature fire element herbs",
            "element": "Fire",
            "nature": "Hot",
            "listing_type": "botanical",
            "offering": "Dried fire herbs",
            "seeking": "Water element plants"
        }
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Verify gravity mass: 60 (base) + 15 (Fire) + 15 (Hot) = 90
        expected_mass = 60 + 15 + 15
        assert data["gravity_mass"] == expected_mass, f"Expected mass {expected_mass}, got {data['gravity_mass']}"
        assert data["frequency"] == 528.0, f"Expected 528.0Hz for Fire, got {data['frequency']}"
        
        print(f"PASS: Fire/Hot botanical listing has gravity_mass={data['gravity_mass']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
    
    def test_create_botanical_listing_neutral_nature(self, auth_headers):
        """POST /api/trade-circle/botanical-listing with Neutral nature (lowest nature weight)"""
        payload = {
            "title": "TEST_Earth Neutral Seeds",
            "description": "Neutral nature earth element",
            "element": "Earth",
            "nature": "Neutral",
            "listing_type": "botanical",
            "offering": "Balanced seeds",
            "seeking": "Any exchange"
        }
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Verify gravity mass: 60 (base) + 12 (Earth) + 5 (Neutral) = 77
        expected_mass = 60 + 12 + 5
        assert data["gravity_mass"] == expected_mass, f"Expected mass {expected_mass}, got {data['gravity_mass']}"
        assert data["frequency"] == 639.0, f"Expected 639.0Hz for Earth, got {data['frequency']}"
        
        print(f"PASS: Earth/Neutral botanical listing has gravity_mass={data['gravity_mass']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)


class TestFrequencyRecipeListing:
    """Test frequency recipe listing creation"""
    
    def test_create_frequency_recipe_listing(self, auth_headers):
        """POST /api/trade-circle/botanical-listing with listing_type=frequency_recipe"""
        payload = {
            "title": "TEST_Healing Frequency Recipe",
            "description": "A recipe combining Fire and Water frequencies",
            "element": "Fire",
            "nature": "Warm",
            "listing_type": "frequency_recipe",
            "offering": "528Hz + 852Hz healing blend recipe",
            "seeking": "Other frequency recipes"
        }
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["category"] == "frequency_recipe", f"Expected category 'frequency_recipe', got {data['category']}"
        assert data["element"] == "Fire"
        assert data["nature"] == "Warm"
        
        # Verify gravity mass calculation for frequency_recipe
        expected_mass = 60 + 15 + 10  # base + Fire + Warm = 85
        assert data["gravity_mass"] == expected_mass, f"Expected mass {expected_mass}, got {data['gravity_mass']}"
        
        print(f"PASS: Frequency recipe listing created with category={data['category']}, gravity_mass={data['gravity_mass']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
    
    def test_frequency_recipe_water_cold(self, auth_headers):
        """Test frequency recipe with Water/Cold (high weights)"""
        payload = {
            "title": "TEST_Water Cold Recipe",
            "description": "Deep meditation frequency recipe",
            "element": "Water",
            "nature": "Cold",
            "listing_type": "frequency_recipe",
            "offering": "852Hz deep meditation recipe",
            "seeking": "Fire recipes"
        }
        
        response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Verify: 60 + 14 (Water) + 15 (Cold) = 89
        expected_mass = 60 + 14 + 15
        assert data["gravity_mass"] == expected_mass, f"Expected mass {expected_mass}, got {data['gravity_mass']}"
        assert data["frequency"] == 852.0
        
        print(f"PASS: Water/Cold frequency recipe has gravity_mass={data['gravity_mass']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)


class TestGravityWeightedListings:
    """Test gravity-weighted listing retrieval"""
    
    def test_gravity_weighted_endpoint_exists(self, auth_headers):
        """GET /api/trade-circle/gravity-weighted should return listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/gravity-weighted", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "listings" in data
        print(f"PASS: gravity-weighted endpoint returns {len(data['listings'])} listings")
    
    def test_gravity_weighted_has_visual_properties(self, auth_headers):
        """Listings should have visual_scale and visual_depth properties"""
        # First create a test listing
        payload = {
            "title": "TEST_Visual Properties Test",
            "description": "Testing visual properties",
            "element": "Metal",
            "nature": "Cool",
            "listing_type": "botanical",
            "offering": "Test item",
            "seeking": "Test exchange"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                       json=payload, headers=auth_headers)
        assert create_response.status_code == 200
        created_listing = create_response.json()
        
        # Now get gravity-weighted listings
        response = requests.get(f"{BASE_URL}/api/trade-circle/gravity-weighted", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        listings = data["listings"]
        
        # Find our test listing
        test_listing = next((l for l in listings if l["id"] == created_listing["id"]), None)
        
        if test_listing:
            # Verify visual properties exist
            assert "visual_scale" in test_listing, "visual_scale should be present"
            assert "visual_depth" in test_listing, "visual_depth should be present"
            assert "element_color" in test_listing, "element_color should be present"
            
            # Verify visual_scale is in expected range (0.8 to 1.2)
            assert 0.8 <= test_listing["visual_scale"] <= 1.2, f"visual_scale {test_listing['visual_scale']} out of range"
            
            # Verify visual_depth is in expected range (0.0 to 1.0)
            assert 0.0 <= test_listing["visual_depth"] <= 1.0, f"visual_depth {test_listing['visual_depth']} out of range"
            
            # Verify element_color for Metal
            assert test_listing["element_color"] == "#94A3B8", f"Expected Metal color #94A3B8, got {test_listing['element_color']}"
            
            print(f"PASS: Listing has visual_scale={test_listing['visual_scale']}, visual_depth={test_listing['visual_depth']}, element_color={test_listing['element_color']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/trade-circle/listings/{created_listing['id']}", headers=auth_headers)
    
    def test_gravity_weighted_sorted_by_mass(self, auth_headers):
        """Listings should be sorted by gravity_mass descending"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/gravity-weighted", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        listings = data["listings"]
        
        if len(listings) >= 2:
            # Check that listings are sorted by gravity_mass descending
            masses = [l.get("gravity_mass", 0) for l in listings]
            assert masses == sorted(masses, reverse=True), "Listings should be sorted by gravity_mass descending"
            print(f"PASS: Listings sorted by gravity_mass descending: {masses[:5]}...")
        else:
            print(f"PASS: Only {len(listings)} listings, sorting check skipped")


class TestBotanyPageElements:
    """Test that Botany page has Five Elements Wheel data"""
    
    def test_botany_catalog_has_element_data(self, auth_headers):
        """GET /api/botany/catalog should return plants with element data for wheel"""
        response = requests.get(f"{BASE_URL}/api/botany/catalog", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plants" in data
        assert "element_colors" in data
        
        # Verify element_colors has all 5 elements
        element_colors = data["element_colors"]
        expected_elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        for elem in expected_elements:
            assert elem in element_colors, f"Element {elem} should be in element_colors"
        
        print(f"PASS: Botany catalog has element_colors for all 5 elements: {list(element_colors.keys())}")
    
    def test_botany_plants_have_element_property(self, auth_headers):
        """Plants should have element property for wheel filtering"""
        response = requests.get(f"{BASE_URL}/api/botany/catalog", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        plants = data["plants"]
        
        if plants:
            # Check first few plants have element property
            for plant in plants[:5]:
                assert "element" in plant, f"Plant {plant.get('name')} should have element property"
                assert plant["element"] in ["Wood", "Fire", "Earth", "Metal", "Water"], f"Invalid element: {plant['element']}"
            
            # Count plants by element
            element_counts = {}
            for plant in plants:
                elem = plant.get("element", "Unknown")
                element_counts[elem] = element_counts.get(elem, 0) + 1
            
            print(f"PASS: Plants have element property. Distribution: {element_counts}")
    
    def test_botany_garden_has_summary_for_wheel(self, auth_headers):
        """GET /api/botany/garden should return summary for Garden Balance bar"""
        response = requests.get(f"{BASE_URL}/api/botany/garden", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "garden" in data
        
        # Summary may be null if garden is empty
        if data.get("summary"):
            summary = data["summary"]
            # Check for element_distribution which is used by Garden Balance bar
            if "element_distribution" in summary:
                print(f"PASS: Garden summary has element_distribution: {summary['element_distribution']}")
            else:
                print(f"PASS: Garden summary exists but no element_distribution (garden may be empty)")
        else:
            print(f"PASS: Garden is empty, no summary (expected)")


class TestElementFrequencyMapping:
    """Test that element frequencies match Solfeggio frequencies"""
    
    def test_element_frequency_mapping(self, auth_headers):
        """Verify each element maps to correct Solfeggio frequency"""
        expected_frequencies = {
            "Wood": 396.0,
            "Fire": 528.0,
            "Earth": 639.0,
            "Metal": 741.0,
            "Water": 852.0
        }
        
        for element, expected_freq in expected_frequencies.items():
            payload = {
                "title": f"TEST_Freq_{element}",
                "description": "Frequency test",
                "element": element,
                "nature": "Neutral",
                "listing_type": "botanical",
                "offering": "Test",
                "seeking": "Test"
            }
            
            response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                    json=payload, headers=auth_headers)
            assert response.status_code == 200
            
            data = response.json()
            assert data["frequency"] == expected_freq, f"Element {element} should have frequency {expected_freq}, got {data['frequency']}"
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
        
        print(f"PASS: All element frequencies match Solfeggio frequencies: {expected_frequencies}")


class TestGravityMassFormula:
    """Test gravity mass formula: Mass = 60 (base) + element_weight + nature_weight"""
    
    def test_all_element_weights(self, auth_headers):
        """Test gravity mass calculation for all elements"""
        element_weights = {
            "Wood": 10,
            "Fire": 15,
            "Earth": 12,
            "Metal": 8,
            "Water": 14
        }
        
        for element, weight in element_weights.items():
            payload = {
                "title": f"TEST_Weight_{element}",
                "description": "Weight test",
                "element": element,
                "nature": "Neutral",  # Neutral = 5
                "listing_type": "botanical",
                "offering": "Test",
                "seeking": "Test"
            }
            
            response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                    json=payload, headers=auth_headers)
            assert response.status_code == 200
            
            data = response.json()
            expected_mass = 60 + weight + 5  # base + element + Neutral
            assert data["gravity_mass"] == expected_mass, f"Element {element} should have mass {expected_mass}, got {data['gravity_mass']}"
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
        
        print(f"PASS: All element weights verified: {element_weights}")
    
    def test_all_nature_weights(self, auth_headers):
        """Test gravity mass calculation for all natures"""
        nature_weights = {
            "Hot": 15,
            "Warm": 10,
            "Neutral": 5,
            "Cool": 10,
            "Cold": 15
        }
        
        for nature, weight in nature_weights.items():
            payload = {
                "title": f"TEST_Nature_{nature}",
                "description": "Nature test",
                "element": "Earth",  # Earth = 12
                "nature": nature,
                "listing_type": "botanical",
                "offering": "Test",
                "seeking": "Test"
            }
            
            response = requests.post(f"{BASE_URL}/api/trade-circle/botanical-listing", 
                                    json=payload, headers=auth_headers)
            assert response.status_code == 200
            
            data = response.json()
            expected_mass = 60 + 12 + weight  # base + Earth + nature
            assert data["gravity_mass"] == expected_mass, f"Nature {nature} should have mass {expected_mass}, got {data['gravity_mass']}"
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/trade-circle/listings/{data['id']}", headers=auth_headers)
        
        print(f"PASS: All nature weights verified: {nature_weights}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

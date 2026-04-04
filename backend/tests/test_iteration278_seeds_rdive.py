"""
Test Suite for Iteration 278 - Crystalline Seeds API & RDive-36 Features

Tests:
- POST /api/seeds/mint - Mint new Crystalline Seeds with rarity calculation
- GET /api/seeds/gallery - Paginated gallery with filters
- GET /api/seeds/{seed_id} - Get specific seed
- GET /api/seeds/stats/overview - Stats overview
- GET /api/seeds/user/{user_id} - User's seeds
- PUT /api/seeds/{seed_id}/visibility - Toggle visibility
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSeedsAPI:
    """Crystalline Seeds API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_seed_id = None
        self.test_minter_id = f"TEST_user_{int(time.time())}"
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Health check passed")
    
    def test_mint_seed_common(self):
        """Test minting a COMMON tier seed (shallow depth, English)"""
        payload = {
            "address_36bit": "000001|0000|000010|0001",
            "path": [
                {
                    "depth": 0,
                    "hexagram_number": 5,
                    "language_code": "en",
                    "row": 0,
                    "col": 5,
                    "dwell_time_ms": 1000
                }
            ],
            "linguistic_state": "en",
            "dwell_history": [],
            "minter_id": self.test_minter_id,
            "constellation_name": "TEST_Common Seed"
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "seed_id" in data
        assert data["rarity_tier"] in ["COMMON", "UNCOMMON"]  # L1 depth gives 5 points + 5 for English = 10 (COMMON)
        assert data["depth"] == 1
        assert data["linguistic_state"] == "en"
        assert data["constellation_name"] == "TEST_Common Seed"
        
        self.test_seed_id = data["seed_id"]
        print(f"✓ Minted COMMON seed: {data['seed_id']} (rarity: {data['rarity_score']}, tier: {data['rarity_tier']})")
        return data["seed_id"]
    
    def test_mint_seed_rare_sanskrit(self):
        """Test minting a RARE tier seed (deeper depth, Sanskrit language)"""
        payload = {
            "address_36bit": "101010|0101|001100|0101|111000|1000",
            "path": [
                {
                    "depth": 0,
                    "hexagram_number": 1,  # Sacred hexagram
                    "language_code": "sa",
                    "row": 0,
                    "col": 5,
                    "dwell_time_ms": 5000
                },
                {
                    "depth": 1,
                    "hexagram_number": 2,  # Sacred hexagram
                    "language_code": "sa",
                    "row": 1,
                    "col": 5,
                    "dwell_time_ms": 8000
                },
                {
                    "depth": 2,
                    "hexagram_number": 63,  # Sacred hexagram
                    "language_code": "sa",
                    "row": 7,
                    "col": 5,
                    "dwell_time_ms": 10000
                }
            ],
            "linguistic_state": "sa",
            "dwell_history": [
                {
                    "coordinate": "0-5",
                    "visits": 10,
                    "total_dwell_ms": 30000,
                    "stability": "CRYSTALLIZED"
                }
            ],
            "minter_id": self.test_minter_id,
            "constellation_name": "TEST_Sanskrit Deep Dive"
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "seed_id" in data
        # L3 depth (15) + Sanskrit (20) + 3 sacred hexagrams (15) + crystallized (5) = 55 (RARE)
        assert data["rarity_tier"] in ["RARE", "EPIC"], f"Expected RARE or EPIC, got {data['rarity_tier']}"
        assert data["depth"] == 3
        assert data["linguistic_state"] == "sa"
        
        print(f"✓ Minted RARE Sanskrit seed: {data['seed_id']} (rarity: {data['rarity_score']}, tier: {data['rarity_tier']})")
        return data["seed_id"]
    
    def test_mint_seed_lakota_ancient(self):
        """Test minting with Lakota (ancient language bonus)"""
        payload = {
            "address_36bit": "110011|0111|010101|0111",
            "path": [
                {
                    "depth": 0,
                    "hexagram_number": 11,  # Sacred hexagram
                    "language_code": "lkt",
                    "row": 1,
                    "col": 7,
                    "dwell_time_ms": 2000
                },
                {
                    "depth": 1,
                    "hexagram_number": 12,  # Sacred hexagram
                    "language_code": "lkt",
                    "row": 2,
                    "col": 7,
                    "dwell_time_ms": 3000
                }
            ],
            "linguistic_state": "lkt",
            "dwell_history": [],
            "minter_id": self.test_minter_id,
            "constellation_name": "TEST_Lakota Wisdom"
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        # L2 depth (10) + Lakota (20) + 2 sacred hexagrams (10) = 40 (UNCOMMON)
        assert data["rarity_tier"] in ["UNCOMMON", "RARE"]
        assert data["linguistic_state"] == "lkt"
        
        print(f"✓ Minted Lakota seed: {data['seed_id']} (rarity: {data['rarity_score']}, tier: {data['rarity_tier']})")
        return data["seed_id"]
    
    def test_gallery_returns_seeds(self):
        """Test gallery endpoint returns seeds"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery")
        assert response.status_code == 200
        
        data = response.json()
        assert "seeds" in data
        assert "total_count" in data
        assert "page" in data
        assert "page_size" in data
        assert isinstance(data["seeds"], list)
        
        print(f"✓ Gallery returned {len(data['seeds'])} seeds (total: {data['total_count']})")
    
    def test_gallery_filter_by_rarity(self):
        """Test gallery filtering by rarity tier"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery?rarity_tier=RARE")
        assert response.status_code == 200
        
        data = response.json()
        for seed in data["seeds"]:
            assert seed["rarity_tier"] == "RARE", f"Expected RARE, got {seed['rarity_tier']}"
        
        print(f"✓ Gallery filter by RARE returned {len(data['seeds'])} seeds")
    
    def test_gallery_filter_by_language(self):
        """Test gallery filtering by linguistic state"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery?linguistic_state=sa")
        assert response.status_code == 200
        
        data = response.json()
        for seed in data["seeds"]:
            assert seed["linguistic_state"] == "sa", f"Expected 'sa', got {seed['linguistic_state']}"
        
        print(f"✓ Gallery filter by Sanskrit returned {len(data['seeds'])} seeds")
    
    def test_gallery_filter_by_min_depth(self):
        """Test gallery filtering by minimum depth"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery?min_depth=2")
        assert response.status_code == 200
        
        data = response.json()
        for seed in data["seeds"]:
            assert seed["depth"] >= 2, f"Expected depth >= 2, got {seed['depth']}"
        
        print(f"✓ Gallery filter by min_depth=2 returned {len(data['seeds'])} seeds")
    
    def test_gallery_sort_by_rarity(self):
        """Test gallery sorting by rarity score"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery?sort_by=rarity_score&sort_order=desc")
        assert response.status_code == 200
        
        data = response.json()
        if len(data["seeds"]) > 1:
            for i in range(len(data["seeds"]) - 1):
                assert data["seeds"][i]["rarity_score"] >= data["seeds"][i+1]["rarity_score"]
        
        print(f"✓ Gallery sorted by rarity_score desc")
    
    def test_gallery_pagination(self):
        """Test gallery pagination"""
        response = requests.get(f"{BASE_URL}/api/seeds/gallery?page=1&page_size=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5
        assert len(data["seeds"]) <= 5
        
        print(f"✓ Gallery pagination works (page 1, size 5)")
    
    def test_stats_overview(self):
        """Test stats overview endpoint"""
        response = requests.get(f"{BASE_URL}/api/seeds/stats/overview")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_seeds" in data
        assert "public_seeds" in data
        assert "tier_distribution" in data
        assert "depth_distribution" in data
        assert "language_distribution" in data
        
        # Verify tier distribution has all tiers
        for tier in ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]:
            assert tier in data["tier_distribution"]
        
        # Verify depth distribution has L0-L5
        for depth in ["L0", "L1", "L2", "L3", "L4", "L5"]:
            assert depth in data["depth_distribution"]
        
        print(f"✓ Stats overview: {data['total_seeds']} total seeds, {data['public_seeds']} public")
        print(f"  Tier distribution: {data['tier_distribution']}")
    
    def test_get_specific_seed(self):
        """Test getting a specific seed by ID"""
        # First get a seed from gallery
        gallery_response = requests.get(f"{BASE_URL}/api/seeds/gallery")
        assert gallery_response.status_code == 200
        
        seeds = gallery_response.json()["seeds"]
        if len(seeds) > 0:
            seed_id = seeds[0]["seed_id"]
            
            response = requests.get(f"{BASE_URL}/api/seeds/{seed_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["seed_id"] == seed_id
            assert "address_36bit" in data
            assert "path" in data
            assert "rarity_score" in data
            
            print(f"✓ Got specific seed: {seed_id}")
        else:
            print("⚠ No seeds in gallery to test specific seed retrieval")
    
    def test_get_nonexistent_seed(self):
        """Test getting a non-existent seed returns 404"""
        response = requests.get(f"{BASE_URL}/api/seeds/nonexistent_seed_id_12345")
        assert response.status_code == 404
        
        print("✓ Non-existent seed returns 404")
    
    def test_user_seeds(self):
        """Test getting seeds by user ID"""
        # First mint a seed with known user ID
        test_user = f"TEST_user_seeds_{int(time.time())}"
        payload = {
            "address_36bit": "111111|0000",
            "path": [
                {
                    "depth": 0,
                    "hexagram_number": 7,
                    "language_code": "en",
                    "row": 0,
                    "col": 7,
                    "dwell_time_ms": 1000
                }
            ],
            "linguistic_state": "en",
            "dwell_history": [],
            "minter_id": test_user,
            "constellation_name": "TEST_User Seed"
        }
        
        mint_response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert mint_response.status_code == 200
        
        # Now get user's seeds
        response = requests.get(f"{BASE_URL}/api/seeds/user/{test_user}")
        assert response.status_code == 200
        
        data = response.json()
        assert "seeds" in data
        assert len(data["seeds"]) >= 1
        assert all(s["minter_id"] == test_user for s in data["seeds"])
        
        print(f"✓ User seeds endpoint works for {test_user}")
    
    def test_toggle_visibility(self):
        """Test toggling seed visibility"""
        # First mint a seed
        test_user = f"TEST_visibility_{int(time.time())}"
        payload = {
            "address_36bit": "010101|0001",
            "path": [
                {
                    "depth": 0,
                    "hexagram_number": 3,
                    "language_code": "es",
                    "row": 0,
                    "col": 3,
                    "dwell_time_ms": 1000
                }
            ],
            "linguistic_state": "es",
            "dwell_history": [],
            "minter_id": test_user,
            "constellation_name": "TEST_Visibility Seed"
        }
        
        mint_response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert mint_response.status_code == 200
        seed_id = mint_response.json()["seed_id"]
        
        # Toggle to private
        response = requests.put(f"{BASE_URL}/api/seeds/{seed_id}/visibility?is_public=false")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["is_public"] == False
        
        # Verify it's not in public gallery
        gallery_response = requests.get(f"{BASE_URL}/api/seeds/gallery")
        gallery_seeds = gallery_response.json()["seeds"]
        seed_ids = [s["seed_id"] for s in gallery_seeds]
        assert seed_id not in seed_ids, "Private seed should not appear in public gallery"
        
        # Toggle back to public
        response = requests.put(f"{BASE_URL}/api/seeds/{seed_id}/visibility?is_public=true")
        assert response.status_code == 200
        assert response.json()["is_public"] == True
        
        print(f"✓ Visibility toggle works for seed {seed_id}")
    
    def test_rarity_calculation_depth_bonus(self):
        """Test that deeper depths give higher rarity scores"""
        # Mint L1 seed
        payload_l1 = {
            "address_36bit": "000000|0000",
            "path": [{"depth": 0, "hexagram_number": 0, "language_code": "en", "row": 0, "col": 0, "dwell_time_ms": 0}],
            "linguistic_state": "en",
            "minter_id": f"TEST_depth_{int(time.time())}",
        }
        
        response_l1 = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload_l1)
        assert response_l1.status_code == 200
        score_l1 = response_l1.json()["rarity_score"]
        
        # Mint L3 seed (same language, no sacred hexagrams)
        payload_l3 = {
            "address_36bit": "000000|0000|000000|0000|000000|0000",
            "path": [
                {"depth": 0, "hexagram_number": 0, "language_code": "en", "row": 0, "col": 0, "dwell_time_ms": 0},
                {"depth": 1, "hexagram_number": 0, "language_code": "en", "row": 0, "col": 0, "dwell_time_ms": 0},
                {"depth": 2, "hexagram_number": 0, "language_code": "en", "row": 0, "col": 0, "dwell_time_ms": 0},
            ],
            "linguistic_state": "en",
            "minter_id": f"TEST_depth_{int(time.time())}",
        }
        
        response_l3 = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload_l3)
        assert response_l3.status_code == 200
        score_l3 = response_l3.json()["rarity_score"]
        
        assert score_l3 > score_l1, f"L3 ({score_l3}) should have higher rarity than L1 ({score_l1})"
        
        print(f"✓ Depth bonus verified: L1={score_l1}, L3={score_l3}")
    
    def test_rarity_calculation_language_bonus(self):
        """Test that ancient languages give higher rarity scores"""
        base_path = [{"depth": 0, "hexagram_number": 5, "language_code": "en", "row": 0, "col": 5, "dwell_time_ms": 0}]
        
        # English seed
        payload_en = {
            "address_36bit": "000101|0000",
            "path": base_path,
            "linguistic_state": "en",
            "minter_id": f"TEST_lang_{int(time.time())}",
        }
        response_en = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload_en)
        score_en = response_en.json()["rarity_score"]
        
        # Sanskrit seed (ancient language)
        payload_sa = {
            "address_36bit": "000101|0101",
            "path": [{"depth": 0, "hexagram_number": 5, "language_code": "sa", "row": 0, "col": 5, "dwell_time_ms": 0}],
            "linguistic_state": "sa",
            "minter_id": f"TEST_lang_{int(time.time())}",
        }
        response_sa = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload_sa)
        score_sa = response_sa.json()["rarity_score"]
        
        assert score_sa > score_en, f"Sanskrit ({score_sa}) should have higher rarity than English ({score_en})"
        
        print(f"✓ Language bonus verified: English={score_en}, Sanskrit={score_sa}")


class TestSeedsValidation:
    """Test input validation for seeds API"""
    
    def test_mint_missing_address(self):
        """Test minting without address fails"""
        payload = {
            "path": [],
            "linguistic_state": "en",
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 422  # Validation error
        
        print("✓ Missing address validation works")
    
    def test_mint_missing_path(self):
        """Test minting without path fails"""
        payload = {
            "address_36bit": "000000|0000",
            "linguistic_state": "en",
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 422  # Validation error
        
        print("✓ Missing path validation works")
    
    def test_mint_invalid_depth_in_path(self):
        """Test minting with invalid depth in path fails"""
        payload = {
            "address_36bit": "000000|0000",
            "path": [
                {"depth": 10, "hexagram_number": 0, "language_code": "en", "row": 0, "col": 0}  # depth > 5
            ],
            "linguistic_state": "en",
        }
        
        response = requests.post(f"{BASE_URL}/api/seeds/mint", json=payload)
        assert response.status_code == 422  # Validation error
        
        print("✓ Invalid depth validation works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

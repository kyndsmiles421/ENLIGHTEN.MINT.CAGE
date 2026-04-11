"""
Comprehensive API Audit Test Suite
Tests all critical endpoints for the ENLIGHTEN.MINT.CAFE wellness platform
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestObservatoryAPIs:
    """Observatory - Celestial Mechanics, Orrery, Stars, Events"""
    
    def test_observatory_planets_returns_8_planets(self):
        """GET /api/observatory/planets - Should return 8 planets"""
        response = requests.get(f"{BASE_URL}/api/observatory/planets")
        assert response.status_code == 200
        data = response.json()
        assert "planets" in data
        assert len(data["planets"]) == 8
        
        # Verify planet structure
        planet_names = [p["name"] for p in data["planets"]]
        expected_planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]
        for expected in expected_planets:
            assert expected in planet_names, f"Missing planet: {expected}"
        
        # Verify planet data structure
        earth = next(p for p in data["planets"] if p["name"] == "Earth")
        assert "hz" in earth
        assert "color" in earth
        assert "orbital_speed_km_s" in earth
        assert "distance_au" in earth
        assert "light_time_minutes" in earth
        print(f"SUCCESS: Observatory planets API returns {len(data['planets'])} planets")
    
    def test_observatory_stars_returns_notable_stars(self):
        """GET /api/observatory/stars - Should return notable stars"""
        response = requests.get(f"{BASE_URL}/api/observatory/stars")
        assert response.status_code == 200
        data = response.json()
        assert "stars" in data
        assert len(data["stars"]) >= 10
        
        # Verify star structure
        star = data["stars"][0]
        assert "name" in star
        assert "distance_ly" in star
        assert "sonified_hz" in star
        assert "light_departed_year" in star
        print(f"SUCCESS: Observatory stars API returns {len(data['stars'])} stars")
    
    def test_observatory_events_returns_celestial_events(self):
        """GET /api/observatory/events - Should return celestial events and moon phase"""
        response = requests.get(f"{BASE_URL}/api/observatory/events")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert "moon" in data
        
        # Verify moon phase data
        moon = data["moon"]
        assert "phase" in moon
        assert "illumination" in moon
        assert "age_days" in moon
        
        # Verify events structure
        assert len(data["events"]) > 0
        event = data["events"][0]
        assert "name" in event
        assert "days_until" in event
        print(f"SUCCESS: Observatory events API returns {len(data['events'])} events, moon phase: {moon['phase']}")


class TestMainBrainAPIs:
    """Main Brain - Sovereign Singularity Engine"""
    
    def test_main_brain_status_returns_superconducting(self):
        """GET /api/main-brain/status - Should return SUPERCONDUCTING status"""
        response = requests.get(f"{BASE_URL}/api/main-brain/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "main_brain" in data
        
        brain = data["main_brain"]
        assert brain["status"] == "SUPERCONDUCTING"
        assert brain["engine"] == "SOVEREIGN_SINGULARITY_ENGINE"
        
        # Verify lattice
        assert "lattice" in brain
        assert brain["lattice"]["size"] == "9x9"
        assert brain["lattice"]["total_nodes"] == 81
        print(f"SUCCESS: Main Brain status is {brain['status']} with {brain['lattice']['total_nodes']} nodes")
    
    def test_main_brain_shader_params(self):
        """GET /api/main-brain/shader-params - Should return L2 Fractal GLSL uniforms"""
        response = requests.get(f"{BASE_URL}/api/main-brain/shader-params")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "shader_uniforms" in data
        
        uniforms = data["shader_uniforms"]
        assert "u_phi" in uniforms
        assert "u_resonance" in uniforms
        assert data["render_mode"] == "DYNAMIC_PRISMATIC_LIQUID"
        assert data["shader_type"] == "L2_FRACTAL_GLSL"
        print(f"SUCCESS: Main Brain shader params returned with render mode: {data['render_mode']}")


class TestWellnessZonesAPI:
    """Wellness Zones - GPS-based wellness locations"""
    
    def test_wellness_zones_returns_3_zones(self):
        """GET /api/wellness-zones - Should return 3 wellness zones"""
        response = requests.get(f"{BASE_URL}/api/wellness-zones")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        assert data["data"]["total_zones"] == 3
        
        zones = data["data"]["zones"]
        assert len(zones) == 3
        
        # Verify zone structure
        zone = zones[0]
        assert "zone_id" in zone
        assert "name" in zone
        assert "coordinates" in zone
        assert "resonance_frequency" in zone
        print(f"SUCCESS: Wellness zones API returns {len(zones)} zones")


class TestCrystalMintAPIs:
    """Crystal Mint - NFT Minting System"""
    
    def test_crystal_mint_stats(self):
        """GET /api/crystal-mint/stats - Should return PHI and resonance constants"""
        response = requests.get(f"{BASE_URL}/api/crystal-mint/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        stats = data["statistics"]
        assert "phi_constant" in stats
        assert abs(stats["phi_constant"] - 1.618033988749895) < 0.0001
        assert "resonance_constant" in stats
        assert "protocol" in stats
        assert stats["protocol"] == "METAPLEX_CORE_V1"
        print(f"SUCCESS: Crystal Mint stats - PHI={stats['phi_constant']}, protocol={stats['protocol']}")
    
    def test_crystal_mint_languages(self):
        """GET /api/crystal-mint/languages - Should return 5 language facets"""
        response = requests.get(f"{BASE_URL}/api/crystal-mint/languages")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        languages = data["languages"]
        assert len(languages) == 5
        
        # Verify pentagonal symmetry (72° each)
        angles = [languages[lang]["angle"] for lang in languages]
        expected_angles = [0, 72, 144, 216, 288]
        assert sorted(angles) == sorted(expected_angles)
        assert data["pentagonal_division"] == 72
        print(f"SUCCESS: Crystal Mint languages - {len(languages)} facets with pentagonal symmetry")


class TestHealthAndCoreAPIs:
    """Health checks and core API endpoints"""
    
    def test_api_health(self):
        """GET /api/health - Basic health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "ok", "success"]
        print("SUCCESS: API health check passed")
    
    def test_harmonics_celestial(self):
        """GET /api/harmonics/celestial - Celestial harmonics data"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        assert response.status_code == 200
        data = response.json()
        
        # Should have moon, zodiac, solar, atmosphere, guidance
        assert "moon" in data
        assert "zodiac" in data
        assert "solar" in data
        assert "guidance" in data
        print(f"SUCCESS: Harmonics celestial - Moon phase: {data['moon']['phase']}, Zodiac: {data['zodiac']['sign']}")


class TestTradeCircleAPIs:
    """Trade Circle - Marketplace APIs"""
    
    def test_trade_circle_listings(self):
        """GET /api/trade-circle/listings - Should return listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings")
        # May return 200 with empty list or 401 if auth required
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            assert "listings" in data or "data" in data
            print("SUCCESS: Trade Circle listings API accessible")
        else:
            print("INFO: Trade Circle listings requires authentication")


class TestOracleAPIs:
    """Oracle - Divination System"""
    
    def test_oracle_tarot_deck(self):
        """GET /api/oracle/tarot-deck - Should return tarot deck"""
        response = requests.get(f"{BASE_URL}/api/oracle/tarot-deck")
        assert response.status_code == 200
        data = response.json()
        # API returns array of cards directly
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify card structure
        card = data[0]
        assert "name" in card
        assert "element" in card
        print(f"SUCCESS: Oracle tarot deck API returns {len(data)} cards")
    
    def test_oracle_zodiac(self):
        """GET /api/oracle/zodiac - Should return zodiac data"""
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        # API returns array of zodiac signs directly
        assert isinstance(data, list)
        assert len(data) == 12  # 12 zodiac signs
        # Verify sign structure
        sign = data[0]
        assert "element" in sign
        assert "dates" in sign
        print(f"SUCCESS: Oracle zodiac API returns {len(data)} signs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

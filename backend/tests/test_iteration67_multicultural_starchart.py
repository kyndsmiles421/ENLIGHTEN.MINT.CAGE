"""
Iteration 67: Multi-Cultural Star Chart Tests
Tests for Vedic, Norse, and Polynesian cultures added to Star Chart
alongside existing Mayan, Egyptian, Aboriginal, Lakota, and Chinese cultures.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestStarChartCultures:
    """Test all 8 star chart cultures are available and return correct data."""

    def test_get_all_cultures_returns_8(self):
        """GET /api/star-chart/cultures returns all 8 cultures."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200
        data = response.json()
        
        assert "cultures" in data
        cultures = data["cultures"]
        assert len(cultures) == 8, f"Expected 8 cultures, got {len(cultures)}"
        
        # Verify all culture IDs are present
        culture_ids = [c["id"] for c in cultures]
        expected_ids = ["mayan", "egyptian", "australian", "lakota", "chinese", "vedic", "norse", "polynesian"]
        for expected_id in expected_ids:
            assert expected_id in culture_ids, f"Missing culture: {expected_id}"
        
        print(f"✓ All 8 cultures returned: {culture_ids}")

    def test_each_culture_has_required_fields(self):
        """Each culture has id, name, color, icon, description, constellation_count."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200
        cultures = response.json()["cultures"]
        
        required_fields = ["id", "name", "color", "icon", "description", "constellation_count"]
        for culture in cultures:
            for field in required_fields:
                assert field in culture, f"Culture {culture.get('id', 'unknown')} missing field: {field}"
            assert culture["constellation_count"] == 5, f"Culture {culture['id']} should have 5 constellations"
        
        print("✓ All cultures have required fields and 5 constellations each")


class TestVedicCulture:
    """Test Vedic (Hindu) sky culture."""

    def test_vedic_culture_endpoint(self):
        """GET /api/star-chart/cultures/vedic returns Vedic constellation data."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/vedic")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "vedic"
        assert data["name"] == "Vedic Sky"
        assert data["color"] == "#FF9800"
        assert "constellations" in data
        assert len(data["constellations"]) == 5
        
        print(f"✓ Vedic culture: {data['name']} with {len(data['constellations'])} constellations")

    def test_vedic_constellation_names(self):
        """Vedic has correct constellation names."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/vedic")
        data = response.json()
        
        constellation_ids = [c["id"] for c in data["constellations"]]
        expected_ids = ["sapta_rishi", "rohini", "trishul", "magha", "swati"]
        
        for expected_id in expected_ids:
            assert expected_id in constellation_ids, f"Missing Vedic constellation: {expected_id}"
        
        # Check specific names
        names = [c["name"] for c in data["constellations"]]
        assert any("Sapta Rishi" in n for n in names), "Missing Sapta Rishi (Seven Sages)"
        assert any("Rohini" in n for n in names), "Missing Rohini"
        
        print(f"✓ Vedic constellations: {constellation_ids}")

    def test_vedic_constellation_structure(self):
        """Each Vedic constellation has required fields."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/vedic")
        data = response.json()
        
        for c in data["constellations"]:
            assert "id" in c
            assert "name" in c
            assert "culture_name" in c and c["culture_name"] == "Vedic"
            assert "ra" in c and isinstance(c["ra"], (int, float))
            assert "dec" in c and isinstance(c["dec"], (int, float))
            assert "stars" in c and len(c["stars"]) >= 2
            assert "lines" in c
            assert "element" in c
            assert "mythology" in c
            
            # Check mythology structure
            myth = c["mythology"]
            assert "figure" in myth
            assert "origin" in myth
            assert "deity" in myth
            assert "story" in myth
            assert "lesson" in myth
        
        print("✓ All Vedic constellations have complete structure")


class TestNorseCulture:
    """Test Norse sky culture."""

    def test_norse_culture_endpoint(self):
        """GET /api/star-chart/cultures/norse returns Norse constellation data."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/norse")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "norse"
        assert data["name"] == "Norse Sky"
        assert data["color"] == "#90CAF9"
        assert "constellations" in data
        assert len(data["constellations"]) == 5
        
        print(f"✓ Norse culture: {data['name']} with {len(data['constellations'])} constellations")

    def test_norse_constellation_names(self):
        """Norse has correct constellation names."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/norse")
        data = response.json()
        
        constellation_ids = [c["id"] for c in data["constellations"]]
        expected_ids = ["thors_wagon", "odins_eye", "freyjas_distaff", "fenrir", "bifrost"]
        
        for expected_id in expected_ids:
            assert expected_id in constellation_ids, f"Missing Norse constellation: {expected_id}"
        
        # Check specific names
        names = [c["name"] for c in data["constellations"]]
        assert any("Thor" in n for n in names), "Missing Thor's Wagon"
        assert any("Odin" in n for n in names), "Missing Odin's Eye"
        assert any("Bifrost" in n for n in names), "Missing Bifrost"
        
        print(f"✓ Norse constellations: {constellation_ids}")

    def test_norse_constellation_structure(self):
        """Each Norse constellation has required fields."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/norse")
        data = response.json()
        
        for c in data["constellations"]:
            assert "id" in c
            assert "name" in c
            assert "culture_name" in c and c["culture_name"] == "Norse"
            assert "ra" in c and isinstance(c["ra"], (int, float))
            assert "dec" in c and isinstance(c["dec"], (int, float))
            assert "stars" in c and len(c["stars"]) >= 2
            assert "lines" in c
            assert "element" in c
            assert "mythology" in c
            
            # Check mythology structure
            myth = c["mythology"]
            assert "figure" in myth
            assert "origin" in myth
            assert "deity" in myth
            assert "story" in myth
            assert "lesson" in myth
        
        print("✓ All Norse constellations have complete structure")


class TestPolynesianCulture:
    """Test Polynesian sky culture."""

    def test_polynesian_culture_endpoint(self):
        """GET /api/star-chart/cultures/polynesian returns Polynesian constellation data."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/polynesian")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "polynesian"
        assert data["name"] == "Polynesian Sky"
        assert data["color"] == "#26C6DA"
        assert "constellations" in data
        assert len(data["constellations"]) == 5
        
        print(f"✓ Polynesian culture: {data['name']} with {len(data['constellations'])} constellations")

    def test_polynesian_constellation_names(self):
        """Polynesian has correct constellation names."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/polynesian")
        data = response.json()
        
        constellation_ids = [c["id"] for c in data["constellations"]]
        expected_ids = ["hokulea", "matariki", "newe", "manaiakalani", "ka_iwikuamoo"]
        
        for expected_id in expected_ids:
            assert expected_id in constellation_ids, f"Missing Polynesian constellation: {expected_id}"
        
        # Check specific names
        names = [c["name"] for c in data["constellations"]]
        assert any("Hokule'a" in n for n in names), "Missing Hokule'a (Star of Joy)"
        assert any("Matariki" in n for n in names), "Missing Matariki (Pleiades)"
        assert any("Manaiakalani" in n for n in names), "Missing Manaiakalani (Maui's Fishhook)"
        
        print(f"✓ Polynesian constellations: {constellation_ids}")

    def test_polynesian_constellation_structure(self):
        """Each Polynesian constellation has required fields."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/polynesian")
        data = response.json()
        
        for c in data["constellations"]:
            assert "id" in c
            assert "name" in c
            assert "culture_name" in c and c["culture_name"] == "Polynesian"
            assert "ra" in c and isinstance(c["ra"], (int, float))
            assert "dec" in c and isinstance(c["dec"], (int, float))
            assert "stars" in c and len(c["stars"]) >= 2
            assert "lines" in c
            assert "element" in c
            assert "mythology" in c
            
            # Check mythology structure
            myth = c["mythology"]
            assert "figure" in myth
            assert "origin" in myth
            assert "deity" in myth
            assert "story" in myth
            assert "lesson" in myth
        
        print("✓ All Polynesian constellations have complete structure")


class TestExistingCultures:
    """Verify existing cultures still work correctly."""

    def test_chinese_culture_still_works(self):
        """GET /api/star-chart/cultures/chinese returns 5 constellations."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/chinese")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "chinese"
        assert len(data["constellations"]) == 5
        print(f"✓ Chinese culture: {len(data['constellations'])} constellations")

    def test_mayan_culture_still_works(self):
        """GET /api/star-chart/cultures/mayan returns 5 constellations."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/mayan")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "mayan"
        assert len(data["constellations"]) == 5
        print(f"✓ Mayan culture: {len(data['constellations'])} constellations")

    def test_egyptian_culture_still_works(self):
        """GET /api/star-chart/cultures/egyptian returns 5 constellations."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/egyptian")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "egyptian"
        assert len(data["constellations"]) == 5
        print(f"✓ Egyptian culture: {len(data['constellations'])} constellations")

    def test_australian_culture_still_works(self):
        """GET /api/star-chart/cultures/australian returns 5 constellations."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/australian")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "australian"
        assert len(data["constellations"]) == 5
        print(f"✓ Aboriginal culture: {len(data['constellations'])} constellations")

    def test_lakota_culture_still_works(self):
        """GET /api/star-chart/cultures/lakota returns 5 constellations."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/lakota")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "lakota"
        assert len(data["constellations"]) == 5
        print(f"✓ Lakota culture: {len(data['constellations'])} constellations")


class TestErrorHandling:
    """Test error handling for invalid culture requests."""

    def test_nonexistent_culture_returns_404(self):
        """GET /api/star-chart/cultures/nonexistent returns 404."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/nonexistent")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print("✓ Nonexistent culture returns 404")

    def test_invalid_culture_id_returns_404(self):
        """GET /api/star-chart/cultures/invalid123 returns 404."""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/invalid123")
        assert response.status_code == 404
        print("✓ Invalid culture ID returns 404")


class TestTradeCircleAuth:
    """Test Trade Circle requires authentication."""

    def test_trade_circle_listings_requires_auth(self):
        """POST /api/trade-circle/listings requires authentication."""
        response = requests.post(f"{BASE_URL}/api/trade-circle/listings", json={
            "title": "Test",
            "offering": "Test item"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Trade Circle listings requires auth")

    def test_trade_circle_stats_requires_auth(self):
        """GET /api/trade-circle/stats requires authentication."""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Trade Circle stats requires auth")


class TestAchievementsAuth:
    """Test Achievements requires authentication."""

    def test_achievements_requires_auth(self):
        """GET /api/achievements requires authentication."""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Achievements requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

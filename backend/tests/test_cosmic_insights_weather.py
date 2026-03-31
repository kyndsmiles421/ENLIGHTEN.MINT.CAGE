"""
Test Suite for Cosmic Insights & Weather System (Iteration 153)
Tests: cosmic-weather, insights, deep-dive, scholar-bonus, elemental-affinities
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for rpg_test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestCosmicWeather:
    """Tests for GET /api/reports/cosmic-weather endpoint"""
    
    def test_cosmic_weather_returns_200(self, auth_headers):
        """Cosmic weather endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ Cosmic weather returns 200")
    
    def test_cosmic_weather_has_zodiac(self, auth_headers):
        """Cosmic weather includes zodiac season info"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        
        assert "zodiac" in data, "Missing zodiac field"
        assert "sign" in data["zodiac"], "Missing zodiac.sign"
        assert "element" in data["zodiac"], "Missing zodiac.element"
        assert data["zodiac"]["sign"] in ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", 
                                          "Gemini", "Cancer", "Leo", "Virgo", "Libra", 
                                          "Scorpio", "Sagittarius"], f"Invalid zodiac sign: {data['zodiac']['sign']}"
        print(f"✓ Zodiac: {data['zodiac']['sign']} ({data['zodiac']['element']})")
    
    def test_cosmic_weather_has_lunar_phase(self, auth_headers):
        """Cosmic weather includes lunar phase info"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        
        assert "lunar" in data, "Missing lunar field"
        assert "phase" in data["lunar"], "Missing lunar.phase"
        assert "energy" in data["lunar"], "Missing lunar.energy"
        assert "xp_bonus" in data["lunar"], "Missing lunar.xp_bonus"
        print(f"✓ Lunar phase: {data['lunar']['phase']} (energy: {data['lunar']['energy']}, XP bonus: {data['lunar']['xp_bonus']})")
    
    def test_cosmic_weather_has_ai_forecast(self, auth_headers):
        """Cosmic weather includes AI-generated forecast"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        
        assert "forecast" in data, "Missing forecast field"
        assert isinstance(data["forecast"], str), "Forecast should be a string"
        assert len(data["forecast"]) > 20, f"Forecast too short: {len(data['forecast'])} chars"
        print(f"✓ AI forecast: {data['forecast'][:100]}...")
    
    def test_cosmic_weather_has_tool_recommendations(self, auth_headers):
        """Cosmic weather includes tool recommendations (mixer, sacred text)"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        
        assert "tool_recommendations" in data, "Missing tool_recommendations"
        recs = data["tool_recommendations"]
        
        assert "mixer" in recs, "Missing mixer recommendation"
        assert "freq" in recs["mixer"], "Missing mixer.freq"
        assert "sound" in recs["mixer"], "Missing mixer.sound"
        
        assert "sacred_text" in recs, "Missing sacred_text recommendation"
        assert isinstance(recs["sacred_text"], str), "sacred_text should be string"
        
        print(f"✓ Mixer: {recs['mixer']['freq']} - {recs['mixer']['sound']}")
        print(f"✓ Sacred text: {recs['sacred_text'][:50]}...")
    
    def test_cosmic_weather_has_rpg_bonuses(self, auth_headers):
        """Cosmic weather includes RPG stat bonuses"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        
        assert "rpg_bonuses" in data, "Missing rpg_bonuses"
        bonuses = data["rpg_bonuses"]
        
        assert "element" in bonuses, "Missing rpg_bonuses.element"
        assert "stat_boosts" in bonuses, "Missing rpg_bonuses.stat_boosts"
        assert "lunar_xp_bonus" in bonuses, "Missing rpg_bonuses.lunar_xp_bonus"
        assert "description" in bonuses, "Missing rpg_bonuses.description"
        
        assert bonuses["element"] in ["Fire", "Water", "Earth", "Air"], f"Invalid element: {bonuses['element']}"
        print(f"✓ RPG bonuses: {bonuses['stat_boosts']} (lunar XP: +{bonuses['lunar_xp_bonus']})")


class TestCosmicInsights:
    """Tests for GET /api/reports/insights endpoint"""
    
    def test_insights_returns_200(self, auth_headers):
        """Insights endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ Insights returns 200")
    
    def test_insights_has_highlights_reel(self, auth_headers):
        """Insights includes highlights reel (Stories-style)"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "highlights" in data, "Missing highlights field"
        assert isinstance(data["highlights"], list), "highlights should be a list"
        
        # rpg_test user should have some data
        if len(data["highlights"]) > 0:
            h = data["highlights"][0]
            assert "type" in h, "Highlight missing type"
            assert "title" in h, "Highlight missing title"
            assert "action" in h, "Highlight missing action"
            assert "color" in h, "Highlight missing color"
            print(f"✓ Highlights: {len(data['highlights'])} cards")
            for hl in data["highlights"]:
                print(f"  - {hl['type']}: {hl['title']}")
        else:
            print(f"✓ Highlights: 0 cards (user may have no recent activity)")
    
    def test_insights_has_mood_report(self, auth_headers):
        """Insights includes mood report"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "mood_report" in data, "Missing mood_report"
        mood = data["mood_report"]
        
        assert "total_checkins" in mood, "Missing total_checkins"
        assert "distribution" in mood, "Missing distribution"
        assert "top_mood" in mood, "Missing top_mood"
        assert "peak_hours" in mood, "Missing peak_hours"
        
        print(f"✓ Mood report: {mood['total_checkins']} check-ins, top mood: {mood['top_mood']}")
    
    def test_insights_has_meditation_report(self, auth_headers):
        """Insights includes meditation report"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "meditation_report" in data, "Missing meditation_report"
        med = data["meditation_report"]
        
        assert "total_minutes" in med, "Missing total_minutes"
        assert "session_count" in med, "Missing session_count"
        assert "avg_duration" in med, "Missing avg_duration"
        
        print(f"✓ Meditation report: {med['session_count']} sessions, {med['total_minutes']} min total")
    
    def test_insights_has_soundscape_report(self, auth_headers):
        """Insights includes soundscape report"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "soundscape_report" in data, "Missing soundscape_report"
        sound = data["soundscape_report"]
        
        assert "mixes_created" in sound, "Missing mixes_created"
        assert "top_sounds" in sound, "Missing top_sounds"
        
        print(f"✓ Soundscape report: {sound['mixes_created']} mixes")
    
    def test_insights_has_journal_report(self, auth_headers):
        """Insights includes journal report"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "journal_report" in data, "Missing journal_report"
        journal = data["journal_report"]
        
        assert "entries" in journal, "Missing entries"
        assert "mood_themes" in journal, "Missing mood_themes"
        
        print(f"✓ Journal report: {journal['entries']} entries")
    
    def test_insights_has_rpg_summary(self, auth_headers):
        """Insights includes RPG summary"""
        response = requests.get(f"{BASE_URL}/api/reports/insights", headers=auth_headers)
        data = response.json()
        
        assert "rpg_summary" in data, "Missing rpg_summary"
        rpg = data["rpg_summary"]
        
        assert "level" in rpg, "Missing level"
        assert "streak_days" in rpg, "Missing streak_days"
        
        print(f"✓ RPG summary: Level {rpg['level']}, {rpg['streak_days']}-day streak")


class TestDeepDive:
    """Tests for GET/POST /api/reports/deep-dive endpoints"""
    
    def test_deep_dive_returns_200(self, auth_headers):
        """Deep-dive endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/reports/deep-dive", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ Deep-dive returns 200")
    
    def test_deep_dive_locked_for_non_premium(self, auth_headers):
        """Deep-dive shows locked state with cost=50 gems for non-premium users"""
        response = requests.get(f"{BASE_URL}/api/reports/deep-dive", headers=auth_headers)
        data = response.json()
        
        # rpg_test user is not premium, so should be locked
        if data.get("locked"):
            assert data["cost"] == 50, f"Expected cost 50, got {data.get('cost')}"
            assert data["currency"] == "gems", f"Expected currency gems, got {data.get('currency')}"
            assert "preview" in data, "Missing preview for locked state"
            assert "features" in data["preview"], "Missing preview.features"
            assert len(data["preview"]["features"]) > 0, "Preview features should not be empty"
            print(f"✓ Deep-dive locked: {data['cost']} {data['currency']}")
            print(f"  Preview features: {data['preview']['features']}")
        else:
            # User may have unlocked or be premium
            assert "mood_trends" in data or "ai_predictions" in data, "Unlocked report should have content"
            print(f"✓ Deep-dive unlocked (user has access)")
    
    def test_unlock_deep_dive_insufficient_gems(self, auth_headers):
        """Unlock deep-dive returns 402 when insufficient gems"""
        # First check current gems
        shop_response = requests.get(f"{BASE_URL}/api/rpg/shop", headers=auth_headers)
        if shop_response.status_code == 200:
            gems = shop_response.json().get("currencies", {}).get("gems", 0)
            if gems < 50:
                response = requests.post(f"{BASE_URL}/api/reports/unlock-deep-dive", headers=auth_headers)
                assert response.status_code == 402, f"Expected 402, got {response.status_code}"
                print(f"✓ Unlock deep-dive returns 402 (insufficient gems: {gems})")
            else:
                print(f"⚠ User has {gems} gems, skipping insufficient gems test")
        else:
            print(f"⚠ Could not check gems, skipping test")


class TestScholarBonus:
    """Tests for POST /api/reports/scholar-bonus endpoint"""
    
    def test_scholar_bonus_returns_200_or_400(self, auth_headers):
        """Scholar bonus returns 200 (first claim) or 400 (already claimed)"""
        response = requests.post(f"{BASE_URL}/api/reports/scholar-bonus", headers=auth_headers)
        
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert data["xp_awarded"] == 25, f"Expected 25 XP, got {data.get('xp_awarded')}"
            assert data["bonus"] == "Scholar's Bonus", f"Expected Scholar's Bonus, got {data.get('bonus')}"
            print(f"✓ Scholar bonus claimed: +{data['xp_awarded']} XP")
        else:
            # Already claimed this week
            assert "already claimed" in response.json().get("detail", "").lower(), "Expected 'already claimed' message"
            print(f"✓ Scholar bonus already claimed this week (400)")
    
    def test_scholar_bonus_duplicate_returns_400(self, auth_headers):
        """Scholar bonus returns 400 when claimed twice in same week"""
        # First claim (may succeed or fail if already claimed)
        requests.post(f"{BASE_URL}/api/reports/scholar-bonus", headers=auth_headers)
        
        # Second claim should always fail
        response = requests.post(f"{BASE_URL}/api/reports/scholar-bonus", headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for duplicate claim, got {response.status_code}"
        print(f"✓ Duplicate scholar bonus returns 400")


class TestElementalAffinities:
    """Tests for GET /api/reports/elemental-affinities endpoint"""
    
    def test_elemental_affinities_returns_200(self, auth_headers):
        """Elemental affinities endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ Elemental affinities returns 200")
    
    def test_elemental_affinities_has_zodiac_element(self, auth_headers):
        """Elemental affinities includes current zodiac element"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities", headers=auth_headers)
        data = response.json()
        
        assert "current_season" in data, "Missing current_season"
        assert "element" in data, "Missing element"
        assert data["element"] in ["Fire", "Water", "Earth", "Air"], f"Invalid element: {data['element']}"
        
        print(f"✓ Current season: {data['current_season']} ({data['element']})")
    
    def test_elemental_affinities_has_stat_boosts(self, auth_headers):
        """Elemental affinities includes stat boosts"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities", headers=auth_headers)
        data = response.json()
        
        assert "stat_boosts" in data, "Missing stat_boosts"
        assert isinstance(data["stat_boosts"], dict), "stat_boosts should be a dict"
        
        # Each element should have specific stat boosts
        element = data["element"]
        expected_stats = {
            "Fire": ["resonance", "focus"],
            "Water": ["harmony", "wisdom"],
            "Earth": ["vitality", "harmony"],
            "Air": ["wisdom", "focus"],
        }
        
        for stat in expected_stats.get(element, []):
            assert stat in data["stat_boosts"], f"Missing {stat} boost for {element}"
        
        print(f"✓ Stat boosts: {data['stat_boosts']}")
    
    def test_elemental_affinities_has_lunar(self, auth_headers):
        """Elemental affinities includes lunar phase"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities", headers=auth_headers)
        data = response.json()
        
        assert "lunar" in data, "Missing lunar"
        assert "phase" in data["lunar"], "Missing lunar.phase"
        
        print(f"✓ Lunar phase: {data['lunar']['phase']}")
    
    def test_elemental_affinities_has_description(self, auth_headers):
        """Elemental affinities includes description"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities", headers=auth_headers)
        data = response.json()
        
        assert "description" in data, "Missing description"
        assert isinstance(data["description"], str), "description should be string"
        assert len(data["description"]) > 10, "description too short"
        
        print(f"✓ Description: {data['description']}")


class TestUnauthorizedAccess:
    """Tests for unauthorized access to reports endpoints"""
    
    def test_cosmic_weather_requires_auth(self):
        """Cosmic weather requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Cosmic weather requires auth")
    
    def test_insights_requires_auth(self):
        """Insights requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/insights")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Insights requires auth")
    
    def test_deep_dive_requires_auth(self):
        """Deep-dive requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/deep-dive")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Deep-dive requires auth")
    
    def test_scholar_bonus_requires_auth(self):
        """Scholar bonus requires authentication"""
        response = requests.post(f"{BASE_URL}/api/reports/scholar-bonus")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Scholar bonus requires auth")
    
    def test_elemental_affinities_requires_auth(self):
        """Elemental affinities requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/elemental-affinities")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Elemental affinities requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

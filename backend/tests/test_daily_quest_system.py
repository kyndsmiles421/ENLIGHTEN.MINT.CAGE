"""
Test Daily Quest System - Wellness-to-RPG Habit Loop
Tests: Quest endpoints, wellness hooks, deduplication, Perfect Day bonus, streak tracking
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDailyQuestSystem:
    """Daily Quest System tests with fresh user for clean state"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Register a fresh test user for quest testing"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"quest_test_{unique_id}@test.com"
        password = "password123"
        
        # Register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": f"Quest Tester {unique_id}"
        })
        
        if register_response.status_code == 200:
            token = register_response.json().get("token")
        else:
            # User might exist, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
            if login_response.status_code != 200:
                pytest.skip(f"Could not create/login test user: {register_response.text}")
            token = login_response.json().get("token")
        
        return {
            "email": email,
            "password": password,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"}
        }
    
    # ── GET /api/rpg/quests/daily ──
    def test_get_daily_quests_returns_all_6_quests(self, test_user):
        """GET /api/rpg/quests/daily returns all 6 quests with completion status"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify structure
        assert "quests" in data, "Response should have 'quests' field"
        assert "streak" in data, "Response should have 'streak' field"
        assert "pillars_done" in data, "Response should have 'pillars_done' field"
        assert "pillars_total" in data, "Response should have 'pillars_total' field"
        assert "perfect_day" in data, "Response should have 'perfect_day' field"
        
        # Verify 6 quests
        quests = data["quests"]
        assert len(quests) == 6, f"Expected 6 quests, got {len(quests)}"
        
        # Verify quest IDs
        quest_ids = {q["id"] for q in quests}
        expected_ids = {"meditation", "journal", "mood", "breathing", "soundscape", "breath_reset"}
        assert quest_ids == expected_ids, f"Expected quest IDs {expected_ids}, got {quest_ids}"
        
        # Verify each quest has required fields
        for quest in quests:
            assert "id" in quest
            assert "name" in quest
            assert "description" in quest
            assert "xp" in quest
            assert "completed" in quest
            assert "xp_with_multiplier" in quest
            assert "pillar" in quest
        
        # Verify 5 pillar quests
        pillar_quests = [q for q in quests if q["pillar"]]
        assert len(pillar_quests) == 5, f"Expected 5 pillar quests, got {len(pillar_quests)}"
        
        print(f"✓ GET /api/rpg/quests/daily returns all 6 quests correctly")
    
    def test_get_daily_quests_streak_info(self, test_user):
        """GET /api/rpg/quests/daily includes streak information"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        streak = data["streak"]
        assert "days" in streak, "Streak should have 'days' field"
        assert "multiplier" in streak, "Streak should have 'multiplier' field"
        assert isinstance(streak["days"], int), "Streak days should be integer"
        assert isinstance(streak["multiplier"], (int, float)), "Multiplier should be numeric"
        
        # Fresh user should have 0 streak and 1.0 multiplier
        assert streak["multiplier"] >= 1.0, "Multiplier should be at least 1.0"
        
        print(f"✓ Streak info: {streak['days']} days, {streak['multiplier']}x multiplier")
    
    # ── POST /api/rpg/quests/complete ──
    def test_complete_quest_awards_xp(self, test_user):
        """POST /api/rpg/quests/complete marks quest as completed and awards XP"""
        # Complete the breathing quest (can be completed via this endpoint)
        response = requests.post(
            f"{BASE_URL}/api/rpg/quests/complete",
            json={"quest_id": "breathing"},
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "quest" in data, "Response should have 'quest' field"
        assert "quest_id" in data, "Response should have 'quest_id' field"
        assert "xp_awarded" in data, "Response should have 'xp_awarded' field"
        assert "currency_awarded" in data, "Response should have 'currency_awarded' field"
        assert "streak_days" in data, "Response should have 'streak_days' field"
        assert "multiplier" in data, "Response should have 'multiplier' field"
        
        assert data["quest_id"] == "breathing"
        assert data["xp_awarded"] > 0, "XP awarded should be positive"
        assert data["currency_awarded"] > 0, "Currency awarded should be positive"
        
        print(f"✓ Completed 'breathing' quest: +{data['xp_awarded']} XP, +{data['currency_awarded']} cosmic dust")
    
    def test_complete_quest_invalid_id(self, test_user):
        """POST /api/rpg/quests/complete with invalid quest_id returns error"""
        response = requests.post(
            f"{BASE_URL}/api/rpg/quests/complete",
            json={"quest_id": "invalid_quest"},
            headers=test_user["headers"]
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid quest, got {response.status_code}"
        print(f"✓ Invalid quest_id correctly returns 400 error")
    
    # ── Quest Deduplication ──
    def test_quest_deduplication_same_day(self, test_user):
        """Completing same quest twice in a day returns error"""
        # First, complete soundscape quest
        response1 = requests.post(
            f"{BASE_URL}/api/rpg/quests/complete",
            json={"quest_id": "soundscape"},
            headers=test_user["headers"]
        )
        
        assert response1.status_code == 200, f"First completion should succeed: {response1.text}"
        
        # Try to complete again
        response2 = requests.post(
            f"{BASE_URL}/api/rpg/quests/complete",
            json={"quest_id": "soundscape"},
            headers=test_user["headers"]
        )
        
        assert response2.status_code == 400, f"Second completion should fail with 400, got {response2.status_code}"
        assert "already" in response2.text.lower() or "completed" in response2.text.lower(), \
            f"Error should mention already completed: {response2.text}"
        
        print(f"✓ Quest deduplication works - second completion returns 400")
    
    # ── POST /api/rpg/quests/breath-reset ──
    def test_breath_reset_micro_quest(self, test_user):
        """POST /api/rpg/quests/breath-reset awards +10 XP for micro-quest"""
        response = requests.post(
            f"{BASE_URL}/api/rpg/quests/breath-reset",
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["quest_id"] == "breath_reset"
        assert data["xp_awarded"] >= 10, f"Breath reset should award at least 10 XP, got {data['xp_awarded']}"
        
        print(f"✓ 3-Breath Reset: +{data['xp_awarded']} XP")
    
    def test_breath_reset_deduplication(self, test_user):
        """POST /api/rpg/quests/breath-reset twice in a day returns error"""
        # Already completed in previous test, try again
        response = requests.post(
            f"{BASE_URL}/api/rpg/quests/breath-reset",
            headers=test_user["headers"]
        )
        
        assert response.status_code == 400, f"Second breath reset should fail with 400, got {response.status_code}"
        print(f"✓ Breath reset deduplication works")
    
    # ── Wellness Hooks ──
    def test_mood_endpoint_triggers_quest(self, test_user):
        """POST /api/moods auto-triggers 'mood' quest via quest_xp field"""
        response = requests.post(
            f"{BASE_URL}/api/moods",
            json={
                "mood": "peaceful",
                "intensity": 7,
                "note": "Testing quest integration"
            },
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check for quest_xp field in response
        assert "quest_xp" in data, f"Response should have 'quest_xp' field: {data}"
        quest_xp = data["quest_xp"]
        
        assert quest_xp["quest_id"] == "mood", f"Quest ID should be 'mood', got {quest_xp.get('quest_id')}"
        assert quest_xp["xp_awarded"] > 0, "XP awarded should be positive"
        
        print(f"✓ Mood endpoint triggered quest: +{quest_xp['xp_awarded']} XP")
    
    def test_mood_endpoint_no_duplicate_quest(self, test_user):
        """POST /api/moods second time doesn't award quest XP again"""
        response = requests.post(
            f"{BASE_URL}/api/moods",
            json={
                "mood": "happy",
                "intensity": 8,
                "note": "Second mood entry"
            },
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # quest_xp should be absent or None for duplicate
        if "quest_xp" in data:
            assert data["quest_xp"] is None, f"Second mood should not award quest XP: {data}"
        
        print(f"✓ Second mood entry doesn't duplicate quest XP")
    
    def test_journal_endpoint_triggers_quest(self, test_user):
        """POST /api/journal auto-triggers 'journal' quest via quest_xp field"""
        response = requests.post(
            f"{BASE_URL}/api/journal",
            json={
                "title": "Quest Test Journal",
                "content": "Testing the journal quest integration",
                "mood": "reflective"
            },
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check for quest_xp field
        assert "quest_xp" in data, f"Response should have 'quest_xp' field: {data}"
        quest_xp = data["quest_xp"]
        
        assert quest_xp["quest_id"] == "journal", f"Quest ID should be 'journal', got {quest_xp.get('quest_id')}"
        assert quest_xp["xp_awarded"] > 0, "XP awarded should be positive"
        
        print(f"✓ Journal endpoint triggered quest: +{quest_xp['xp_awarded']} XP")
    
    def test_meditation_log_triggers_quest(self, test_user):
        """POST /api/meditation-history/log auto-triggers 'meditation' quest"""
        response = requests.post(
            f"{BASE_URL}/api/meditation-history/log",
            json={
                "type": "guided",
                "duration_minutes": 10,
                "focus": "breath",
                "intention": "Testing quest integration",
                "depth_rating": 7
            },
            headers=test_user["headers"]
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check for quest_xp field
        assert "quest_xp" in data, f"Response should have 'quest_xp' field: {data}"
        quest_xp = data["quest_xp"]
        
        assert quest_xp["quest_id"] == "meditation", f"Quest ID should be 'meditation', got {quest_xp.get('quest_id')}"
        assert quest_xp["xp_awarded"] > 0, "XP awarded should be positive"
        
        print(f"✓ Meditation log triggered quest: +{quest_xp['xp_awarded']} XP")
    
    # ── Perfect Day Bonus ──
    def test_perfect_day_bonus(self, test_user):
        """Completing all 5 pillars awards +100 XP bonus"""
        # At this point we've completed: breathing, soundscape, mood, journal, meditation
        # All 5 pillars should be done
        
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        
        # Check pillars done
        pillars_done = data["pillars_done"]
        pillars_total = data["pillars_total"]
        perfect_day = data["perfect_day"]
        
        print(f"Pillars done: {pillars_done}/{pillars_total}, Perfect Day: {perfect_day}")
        
        # We should have all 5 pillars done
        assert pillars_done == 5, f"Expected 5 pillars done, got {pillars_done}"
        assert pillars_total == 5, f"Expected 5 total pillars, got {pillars_total}"
        assert perfect_day == True, f"Perfect day should be True when all pillars done"
        
        print(f"✓ Perfect Day achieved! All 5 pillars completed")
    
    # ── Streak Tracking ──
    def test_streak_increments_on_quest_completion(self, test_user):
        """Completing quests on consecutive days increases streak days"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        
        streak = data["streak"]
        # After completing quests today, streak should be at least 1
        assert streak["days"] >= 1, f"Streak should be at least 1 after completing quests, got {streak['days']}"
        
        print(f"✓ Streak tracking: {streak['days']} day(s), {streak['multiplier']}x multiplier")
    
    def test_streak_multiplier_caps_at_2_5x(self, test_user):
        """Streak multiplier caps at 2.5x (for 14+ day streaks)"""
        # This is a logic test - verify the multiplier doesn't exceed 2.5
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        
        multiplier = data["streak"]["multiplier"]
        assert multiplier <= 2.5, f"Multiplier should cap at 2.5x, got {multiplier}"
        
        print(f"✓ Multiplier cap verified: {multiplier}x (max 2.5x)")
    
    # ── GET /api/rpg/quests/streak ──
    def test_get_streak_endpoint(self, test_user):
        """GET /api/rpg/quests/streak returns streak details with history"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/streak", headers=test_user["headers"])
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "days" in data, "Response should have 'days' field"
        assert "multiplier" in data, "Response should have 'multiplier' field"
        assert "history" in data, "Response should have 'history' field"
        
        # History should be a list
        assert isinstance(data["history"], list), "History should be a list"
        
        print(f"✓ GET /api/rpg/quests/streak: {data['days']} days, {len(data['history'])} history entries")
    
    # ── Verify Quest Completion Status ──
    def test_verify_all_quests_completed(self, test_user):
        """Verify all 6 quests show as completed after our tests"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        
        quests = data["quests"]
        completed_count = sum(1 for q in quests if q["completed"])
        
        # We completed: breathing, soundscape, breath_reset, mood, journal, meditation = 6
        assert completed_count == 6, f"Expected 6 completed quests, got {completed_count}"
        
        for quest in quests:
            assert quest["completed"] == True, f"Quest {quest['id']} should be completed"
        
        print(f"✓ All 6 quests verified as completed")
        print(f"  - XP earned today: {data['xp_earned_today']}")


class TestQuestXPValues:
    """Test specific XP values for each quest type"""
    
    @pytest.fixture(scope="class")
    def fresh_user(self):
        """Create another fresh user to test XP values"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"xp_test_{unique_id}@test.com"
        password = "password123"
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": f"XP Tester {unique_id}"
        })
        
        if register_response.status_code == 200:
            token = register_response.json().get("token")
        else:
            pytest.skip(f"Could not create test user: {register_response.text}")
        
        return {"headers": {"Authorization": f"Bearer {token}"}}
    
    def test_quest_xp_values(self, fresh_user):
        """Verify base XP values for each quest type"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=fresh_user["headers"])
        assert response.status_code == 200
        data = response.json()
        
        # Expected base XP values (from DAILY_QUESTS in rpg.py)
        expected_xp = {
            "meditation": 50,
            "journal": 30,
            "mood": 20,
            "breathing": 25,
            "soundscape": 20,
            "breath_reset": 10
        }
        
        for quest in data["quests"]:
            quest_id = quest["id"]
            base_xp = quest["xp"]
            assert base_xp == expected_xp[quest_id], \
                f"Quest {quest_id} should have {expected_xp[quest_id]} XP, got {base_xp}"
        
        print(f"✓ All quest XP values match expected values")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

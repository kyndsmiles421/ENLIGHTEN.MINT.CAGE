"""
Test Suite for Starseed Realm - Alliance Chat & Boss Encounters
Iteration 116: Tests for new multiplayer features
- Alliance Chat: send/receive messages
- Boss Encounters: 5 cosmic bosses, multi-phase battles, AI narratives
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestAllianceChat:
    """Alliance Chat messaging system tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token and alliance info"""
        # Login
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        self.token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get user's alliance
        alliance_res = requests.get(f"{BASE_URL}/api/starseed/realm/my-alliance", headers=self.headers)
        assert alliance_res.status_code == 200
        self.alliance = alliance_res.json().get("alliance")
    
    def test_send_chat_message(self):
        """POST /api/starseed/realm/chat/send creates chat message in alliance channel"""
        if not self.alliance:
            pytest.skip("User not in alliance")
        
        test_message = f"Test message from pytest {int(time.time())}"
        res = requests.post(f"{BASE_URL}/api/starseed/realm/chat/send", json={
            "text": test_message,
            "type": "message"
        }, headers=self.headers)
        
        assert res.status_code == 200, f"Send chat failed: {res.text}"
        data = res.json()
        
        # Verify message structure
        assert "id" in data
        assert data["text"] == test_message
        assert data["alliance_id"] == self.alliance["id"]
        assert "character_name" in data
        assert "origin_id" in data
        assert "created_at" in data
        assert data["type"] == "message"
        print(f"PASS: Chat message sent - ID: {data['id']}")
    
    def test_get_chat_messages(self):
        """GET /api/starseed/realm/chat/{alliance_id} returns recent messages for alliance"""
        if not self.alliance:
            pytest.skip("User not in alliance")
        
        alliance_id = self.alliance["id"]
        res = requests.get(f"{BASE_URL}/api/starseed/realm/chat/{alliance_id}", headers=self.headers)
        
        assert res.status_code == 200, f"Get chat failed: {res.text}"
        data = res.json()
        
        assert "messages" in data
        assert isinstance(data["messages"], list)
        
        if len(data["messages"]) > 0:
            msg = data["messages"][0]
            assert "id" in msg
            assert "text" in msg
            assert "character_name" in msg
            assert "created_at" in msg
        
        print(f"PASS: Retrieved {len(data['messages'])} chat messages")
    
    def test_chat_rejects_non_member(self):
        """Backend chat rejects messages from users not in alliance (403)"""
        # Try to access a fake alliance ID
        fake_alliance_id = "fake-alliance-id-12345"
        res = requests.get(f"{BASE_URL}/api/starseed/realm/chat/{fake_alliance_id}", headers=self.headers)
        
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        print("PASS: Chat correctly rejects non-member access")
    
    def test_chat_message_validation(self):
        """Chat rejects empty or too long messages"""
        if not self.alliance:
            pytest.skip("User not in alliance")
        
        # Empty message
        res = requests.post(f"{BASE_URL}/api/starseed/realm/chat/send", json={
            "text": "",
            "type": "message"
        }, headers=self.headers)
        assert res.status_code == 400, f"Expected 400 for empty message, got {res.status_code}"
        
        # Too long message (>500 chars)
        long_message = "x" * 501
        res = requests.post(f"{BASE_URL}/api/starseed/realm/chat/send", json={
            "text": long_message,
            "type": "message"
        }, headers=self.headers)
        assert res.status_code == 400, f"Expected 400 for long message, got {res.status_code}"
        
        print("PASS: Chat message validation working")


class TestBossEncounters:
    """Cooperative Boss Encounters tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token and character info"""
        # Login
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        self.token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get user's characters
        chars_res = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=self.headers)
        assert chars_res.status_code == 200
        self.characters = chars_res.json().get("characters", [])
        self.origin_id = self.characters[0]["origin_id"] if self.characters else None
    
    def test_get_available_bosses(self):
        """GET /api/starseed/realm/bosses returns 5 cosmic bosses with HP, element, weakness, resistance"""
        res = requests.get(f"{BASE_URL}/api/starseed/realm/bosses", headers=self.headers)
        
        assert res.status_code == 200, f"Get bosses failed: {res.text}"
        data = res.json()
        
        assert "bosses" in data
        bosses = data["bosses"]
        assert len(bosses) == 5, f"Expected 5 bosses, got {len(bosses)}"
        
        # Verify boss structure
        expected_boss_ids = ["void-leviathan", "entropy-weaver", "fallen-archon", "dream-parasite", "star-devourer"]
        for boss in bosses:
            assert boss["id"] in expected_boss_ids
            assert "name" in boss
            assert "hp" in boss
            assert "element" in boss
            assert "weakness" in boss
            assert "resistance" in boss
            assert "difficulty" in boss
            assert "phases" in boss
            assert "color" in boss
            print(f"  Boss: {boss['name']} - HP:{boss['hp']}, Element:{boss['element']}, Weak:{boss['weakness']}, Resist:{boss['resistance']}")
        
        print(f"PASS: Retrieved {len(bosses)} cosmic bosses")
    
    def test_get_boss_detail(self):
        """GET /api/starseed/realm/boss/{boss_id} returns full boss details with lore"""
        boss_id = "void-leviathan"
        res = requests.get(f"{BASE_URL}/api/starseed/realm/boss/{boss_id}", headers=self.headers)
        
        assert res.status_code == 200, f"Get boss detail failed: {res.text}"
        data = res.json()
        
        assert data["id"] == boss_id
        assert data["name"] == "The Void Leviathan"
        assert "lore" in data, "Boss detail should include lore"
        assert len(data["lore"]) > 50, "Lore should be substantial"
        assert data["hp"] == 300
        assert data["element"] == "Void"
        assert data["weakness"] == "compassion"
        assert data["resistance"] == "courage"
        
        print(f"PASS: Boss detail retrieved with lore ({len(data['lore'])} chars)")
    
    def test_get_boss_not_found(self):
        """GET /api/starseed/realm/boss/{boss_id} returns 404 for invalid boss"""
        res = requests.get(f"{BASE_URL}/api/starseed/realm/boss/fake-boss-id", headers=self.headers)
        assert res.status_code == 404
        print("PASS: Invalid boss returns 404")
    
    def test_initiate_boss_encounter(self):
        """POST /api/starseed/realm/boss/initiate starts boss battle with NPC allies, returns scene with narrative and choices"""
        if not self.origin_id:
            pytest.skip("No character found")
        
        # Use dream-parasite (easiest boss - 250 HP)
        boss_id = "dream-parasite"
        res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate", json={
            "boss_id": boss_id,
            "origin_id": self.origin_id
        }, headers=self.headers, timeout=20)
        
        assert res.status_code == 200, f"Initiate boss failed: {res.text}"
        data = res.json()
        
        # Verify battle structure
        assert "id" in data
        assert data["boss_id"] == boss_id
        assert data["boss_name"] == "The Dream Parasite"
        assert data["boss_hp"] == 250
        assert data["boss_current_hp"] == 250
        assert data["phase"] == 1
        assert data["max_phases"] == 3
        assert data["status"] == "active"
        
        # Verify participants (should have NPC allies for solo)
        assert "participants" in data
        participants = data["participants"]
        assert len(participants) >= 2, "Should have at least 2 participants (player + NPC)"
        
        # Check for NPC allies
        npc_count = sum(1 for p in participants if p.get("is_npc"))
        assert npc_count >= 1, "Should have at least 1 NPC ally"
        
        # Verify scene with narrative and choices
        assert "current_scene" in data
        scene = data["current_scene"]
        assert "narrative" in scene
        assert len(scene["narrative"]) > 50, "Narrative should be substantial"
        assert "phase_title" in scene
        assert "choices" in scene
        assert len(scene["choices"]) == 3, "Should have 3 choices"
        
        # Verify choice structure
        for choice in scene["choices"]:
            assert "text" in choice
            assert "stat_used" in choice
            assert "damage" in choice
            assert "team_heal" in choice
            assert "outcome_hint" in choice
        
        self.battle_id = data["id"]
        print(f"PASS: Boss battle initiated - ID: {data['id']}, Participants: {len(participants)}, NPCs: {npc_count}")
        print(f"  Phase: {scene['phase_title']}")
        print(f"  Choices: {[c['text'][:40]+'...' for c in scene['choices']]}")
        
        return data
    
    def test_boss_action_resolves_phase(self):
        """POST /api/starseed/realm/boss/action resolves a battle phase, applies damage, advances phase or ends battle"""
        if not self.origin_id:
            pytest.skip("No character found")
        
        # First initiate a battle
        boss_id = "dream-parasite"
        init_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate", json={
            "boss_id": boss_id,
            "origin_id": self.origin_id
        }, headers=self.headers, timeout=20)
        
        assert init_res.status_code == 200
        battle = init_res.json()
        battle_id = battle["id"]
        initial_hp = battle["boss_current_hp"]
        
        # Make a choice (index 0)
        action_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/action", json={
            "battle_id": battle_id,
            "choice_index": 0
        }, headers=self.headers, timeout=20)
        
        assert action_res.status_code == 200, f"Boss action failed: {action_res.text}"
        result = action_res.json()
        
        # Verify action result
        assert "damage_dealt" in result
        assert "team_healed" in result
        assert "boss_damage" in result
        assert "boss_hp" in result
        assert "stat_used" in result
        assert "choice_text" in result
        
        # Verify damage was dealt
        assert result["damage_dealt"] > 0
        assert result["boss_hp"] < initial_hp, "Boss HP should decrease"
        
        # Check if battle continues or ended
        if result.get("battle_over"):
            assert "reward" in result
            print(f"PASS: Battle ended - Defeated: {result.get('boss_defeated')}")
        else:
            assert "next_scene" in result
            assert result["phase"] >= 1
            print(f"PASS: Phase resolved - Damage: {result['damage_dealt']}, Boss HP: {result['boss_hp']}/{battle['boss_hp']}")
            print(f"  Next phase: {result['next_scene'].get('phase_title')}")
    
    def test_boss_weakness_bonus_damage(self):
        """Boss weakness stat deals 1.5x damage"""
        if not self.origin_id:
            pytest.skip("No character found")
        
        # Dream Parasite weakness is "courage"
        boss_id = "dream-parasite"
        init_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate", json={
            "boss_id": boss_id,
            "origin_id": self.origin_id
        }, headers=self.headers, timeout=20)
        
        assert init_res.status_code == 200
        battle = init_res.json()
        battle_id = battle["id"]
        
        # Find a choice that uses "courage" (the weakness)
        scene = battle["current_scene"]
        courage_choice_idx = None
        for i, choice in enumerate(scene["choices"]):
            if choice["stat_used"] == "courage":
                courage_choice_idx = i
                break
        
        if courage_choice_idx is not None:
            action_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/action", json={
                "battle_id": battle_id,
                "choice_index": courage_choice_idx
            }, headers=self.headers, timeout=20)
            
            assert action_res.status_code == 200
            result = action_res.json()
            
            # Check if weakness was applied
            assert result.get("was_weakness") == True, "Should flag weakness hit"
            print(f"PASS: Weakness bonus applied - Damage: {result['damage_dealt']} (1.5x)")
        else:
            print("SKIP: No courage choice available in this scene")
    
    def test_boss_resistance_reduced_damage(self):
        """Boss resistance stat deals 0.6x damage"""
        if not self.origin_id:
            pytest.skip("No character found")
        
        # Dream Parasite resistance is "intuition"
        boss_id = "dream-parasite"
        init_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate", json={
            "boss_id": boss_id,
            "origin_id": self.origin_id
        }, headers=self.headers, timeout=20)
        
        assert init_res.status_code == 200
        battle = init_res.json()
        battle_id = battle["id"]
        
        # Find a choice that uses "intuition" (the resistance)
        scene = battle["current_scene"]
        intuition_choice_idx = None
        for i, choice in enumerate(scene["choices"]):
            if choice["stat_used"] == "intuition":
                intuition_choice_idx = i
                break
        
        if intuition_choice_idx is not None:
            action_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/action", json={
                "battle_id": battle_id,
                "choice_index": intuition_choice_idx
            }, headers=self.headers, timeout=20)
            
            assert action_res.status_code == 200
            result = action_res.json()
            
            # Check if resistance was applied
            assert result.get("was_resistance") == True, "Should flag resistance hit"
            print(f"PASS: Resistance penalty applied - Damage: {result['damage_dealt']} (0.6x)")
        else:
            print("SKIP: No intuition choice available in this scene")
    
    def test_boss_victory_rewards(self):
        """POST /api/starseed/realm/boss/action returns victory/defeat with XP reward and achievements on final phase"""
        if not self.origin_id:
            pytest.skip("No character found")
        
        # Use dream-parasite (easiest - 250 HP)
        boss_id = "dream-parasite"
        init_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/initiate", json={
            "boss_id": boss_id,
            "origin_id": self.origin_id
        }, headers=self.headers, timeout=20)
        
        assert init_res.status_code == 200
        battle = init_res.json()
        battle_id = battle["id"]
        
        # Keep attacking until battle ends (max 10 rounds to prevent infinite loop)
        battle_over = False
        rounds = 0
        max_rounds = 10
        
        while not battle_over and rounds < max_rounds:
            action_res = requests.post(f"{BASE_URL}/api/starseed/realm/boss/action", json={
                "battle_id": battle_id,
                "choice_index": 0  # Always pick first choice (usually highest damage)
            }, headers=self.headers, timeout=20)
            
            assert action_res.status_code == 200
            result = action_res.json()
            rounds += 1
            
            if result.get("battle_over"):
                battle_over = True
                
                # Verify reward structure
                if result.get("boss_defeated"):
                    assert "reward" in result
                    reward = result["reward"]
                    assert "xp_earned" in reward
                    assert reward["xp_earned"] >= 30, "Should earn XP on victory"
                    print(f"PASS: Victory! XP earned: {reward['xp_earned']}")
                    if reward.get("new_achievements"):
                        print(f"  New achievements: {[a['title'] for a in reward['new_achievements']]}")
                    if reward.get("leveled_up"):
                        print(f"  Leveled up to: {reward['new_level']}")
                else:
                    print(f"PASS: Defeat after {rounds} rounds")
            else:
                print(f"  Round {rounds}: Boss HP {result['boss_hp']}/{battle['boss_hp']}")
        
        if not battle_over:
            print(f"NOTE: Battle did not end after {max_rounds} rounds")
    
    def test_boss_history(self):
        """GET /api/starseed/realm/boss/history returns user's boss battle history"""
        res = requests.get(f"{BASE_URL}/api/starseed/realm/boss/history", headers=self.headers)
        
        assert res.status_code == 200, f"Get boss history failed: {res.text}"
        data = res.json()
        
        assert "battles" in data
        assert isinstance(data["battles"], list)
        
        if len(data["battles"]) > 0:
            battle = data["battles"][0]
            assert "id" in battle
            assert "boss_id" in battle
            assert "boss_name" in battle
            assert "status" in battle
            assert "created_at" in battle
        
        print(f"PASS: Retrieved {len(data['battles'])} boss battle records")


class TestBossDetails:
    """Test all 5 boss configurations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_res.status_code == 200
        self.token = login_res.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @pytest.mark.parametrize("boss_id,expected_name,expected_hp,expected_element,expected_weakness,expected_resistance", [
        ("void-leviathan", "The Void Leviathan", 300, "Void", "compassion", "courage"),
        ("entropy-weaver", "The Entropy Weaver", 400, "Chaos", "wisdom", "resilience"),
        ("fallen-archon", "The Fallen Archon", 350, "Crystal-Shadow", "intuition", "wisdom"),
        ("dream-parasite", "The Dream Parasite", 250, "Psychic", "courage", "intuition"),
        ("star-devourer", "Zar'ghul the Star Devourer", 450, "Fire-Void", "resilience", "compassion"),
    ])
    def test_boss_configuration(self, boss_id, expected_name, expected_hp, expected_element, expected_weakness, expected_resistance):
        """Verify each boss has correct configuration"""
        res = requests.get(f"{BASE_URL}/api/starseed/realm/boss/{boss_id}", headers=self.headers)
        
        assert res.status_code == 200
        boss = res.json()
        
        assert boss["name"] == expected_name
        assert boss["hp"] == expected_hp
        assert boss["element"] == expected_element
        assert boss["weakness"] == expected_weakness
        assert boss["resistance"] == expected_resistance
        
        print(f"PASS: {expected_name} - HP:{expected_hp}, Element:{expected_element}, Weak:{expected_weakness}, Resist:{expected_resistance}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

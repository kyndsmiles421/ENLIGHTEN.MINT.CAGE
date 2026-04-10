"""
V10010.0 Director's Cut + V10011.0 Omega Architect Backend Tests

Tests for:
- Director Status endpoint (timeline tracks, temporal index)
- Timeline Scrub endpoint (position to epoch/layer mapping)
- Keyframe system (add and retrieve)
- Render Meter ($15/hr tracking)
- Movie Render (54-layer Sovereign Movie)
- Omega Status endpoint (interface, phygital config)
- Final Print (all 10 moves)
- Deep Dive Search (multi-epoch synthesis)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestV10010DirectorsCut:
    """V10010.0 Director's Cut endpoint tests"""
    
    def test_director_status_returns_timeline_tracks(self):
        """Director Status should return timeline tracks and temporal index"""
        response = requests.get(f"{BASE_URL}/api/omnis/director/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10010.0"
        assert data["name"] == "Director's Cut"
        assert "timeline_tracks" in data
        assert len(data["timeline_tracks"]) == 4  # LAW, ART, LOGIC, WELLNESS
        assert "temporal_index" in data
        assert "PAST" in data["temporal_index"]
        assert "PRESENT" in data["temporal_index"]
        assert "FUTURE" in data["temporal_index"]
        assert "render_meter" in data
        assert "equity" in data
        assert "render_rate" in data
        print(f"PASS: Director Status returns {len(data['timeline_tracks'])} tracks and temporal index")
    
    def test_timeline_scrub_past_epoch(self):
        """Timeline scrub at position 0.1 should return PAST epoch"""
        response = requests.post(f"{BASE_URL}/api/omnis/director/timeline/scrub?position=0.1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10010.0"
        assert data["epoch"] == "PAST"
        assert data["current_layer"] >= 1 and data["current_layer"] <= 18
        assert "epoch_color" in data
        assert "haptic_frequency" in data
        print(f"PASS: Scrub at 0.1 returns PAST epoch, layer {data['current_layer']}")
    
    def test_timeline_scrub_present_epoch(self):
        """Timeline scrub at position 0.5 should return PRESENT epoch"""
        response = requests.post(f"{BASE_URL}/api/omnis/director/timeline/scrub?position=0.5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["epoch"] == "PRESENT"
        assert data["current_layer"] >= 19 and data["current_layer"] <= 36
        print(f"PASS: Scrub at 0.5 returns PRESENT epoch, layer {data['current_layer']}")
    
    def test_timeline_scrub_future_epoch(self):
        """Timeline scrub at position 0.9 should return FUTURE epoch"""
        response = requests.post(f"{BASE_URL}/api/omnis/director/timeline/scrub?position=0.9")
        assert response.status_code == 200
        
        data = response.json()
        assert data["epoch"] == "FUTURE"
        assert data["current_layer"] >= 37 and data["current_layer"] <= 54
        print(f"PASS: Scrub at 0.9 returns FUTURE epoch, layer {data['current_layer']}")
    
    def test_keyframe_add_and_retrieve(self):
        """Keyframe system should add and retrieve keyframes"""
        # Add a keyframe
        add_response = requests.post(
            f"{BASE_URL}/api/omnis/director/keyframe/add?position=0.5&action_type=MARKER&action_data={{}}"
        )
        assert add_response.status_code == 200
        
        add_data = add_response.json()
        assert "id" in add_data
        assert add_data["position"] == 0.5
        assert add_data["action_type"] == "MARKER"
        print(f"PASS: Keyframe added with ID {add_data['id']}")
        
        # Retrieve keyframes
        get_response = requests.get(f"{BASE_URL}/api/omnis/director/keyframes")
        assert get_response.status_code == 200
        
        get_data = get_response.json()
        assert "keyframes" in get_data
        assert len(get_data["keyframes"]) > 0
        print(f"PASS: Retrieved {len(get_data['keyframes'])} keyframes")
    
    def test_render_meter_start_stop(self):
        """Render Meter should track $15/hr usage"""
        # Start meter
        start_response = requests.post(f"{BASE_URL}/api/omnis/director/render-meter/start")
        assert start_response.status_code == 200
        
        start_data = start_response.json()
        assert start_data["status"] == "ACTIVE"
        assert "$15" in start_data["rate"]
        print(f"PASS: Render meter started at {start_data['rate']}")
        
        # Check status
        status_response = requests.get(f"{BASE_URL}/api/omnis/director/render-meter/status")
        assert status_response.status_code == 200
        
        status_data = status_response.json()
        assert status_data["is_active"] == True
        print(f"PASS: Render meter status shows active")
        
        # Stop meter
        stop_response = requests.post(f"{BASE_URL}/api/omnis/director/render-meter/stop")
        assert stop_response.status_code == 200
        
        stop_data = stop_response.json()
        assert stop_data["status"] == "STOPPED"
        assert "session_cost" in stop_data
        print(f"PASS: Render meter stopped, session cost: ${stop_data['session_cost']}")
    
    def test_movie_render_54_layers(self):
        """Movie Render should produce 54-layer Sovereign Movie"""
        response = requests.post(f"{BASE_URL}/api/omnis/director/movie/render")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10010.0"
        assert data["total_layers"] == 54
        assert "title" in data
        assert "visual" in data
        assert "audio" in data
        assert "wealth" in data
        assert "layers" in data
        assert len(data["layers"]) == 54
        
        # Verify layer structure
        first_layer = data["layers"][0]
        assert first_layer["layer"] == 1
        assert first_layer["epoch"] == "PAST"
        
        last_layer = data["layers"][-1]
        assert last_layer["layer"] == 54
        assert last_layer["epoch"] == "FUTURE"
        
        print(f"PASS: Movie rendered with {data['total_layers']} layers, title: {data['title']}")


class TestV10011OmegaArchitect:
    """V10011.0 Omega Architect endpoint tests"""
    
    def test_omega_status_returns_interface_and_phygital(self):
        """Omega Status should return interface and phygital config"""
        response = requests.get(f"{BASE_URL}/api/omnis/omega/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10011.0"
        assert data["name"] == "Omega Architect"
        assert "interface" in data
        assert "phygital" in data
        assert "current_quest" in data  # Game engine quest
        assert "current_ui" in data  # Game engine UI
        
        # Verify interface config
        interface = data["interface"]
        assert "hud" in interface
        assert "timeline" in interface
        assert "mixer" in interface
        assert "render_meter" in interface
        
        # Verify phygital config
        phygital = data["phygital"]
        assert "primary_anchor" in phygital
        assert "secondary_anchor" in phygital
        assert "handshake" in phygital
        
        print(f"PASS: Omega Status returns interface with {len(interface)} components and phygital config")
    
    def test_omega_execute_single_move(self):
        """Omega should execute individual moves (1-10)"""
        for move_num in [1, 5, 10]:
            response = requests.post(f"{BASE_URL}/api/omnis/omega/move/{move_num}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["version"] == "V10011.0"
            assert data["move_number"] == move_num
            assert "name" in data
            assert "result" in data
            print(f"PASS: Move {move_num} executed: {data['name']} - {data['result']}")
    
    def test_omega_final_print_executes_all_10_moves(self):
        """Final Print should execute all 10 moves and seal"""
        response = requests.post(f"{BASE_URL}/api/omnis/omega/final-print")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10011.0"
        assert data["name"] == "Omega Architect"
        assert data["status"] == "IT IS FINISHED."
        assert "moves" in data
        # Moves accumulate across calls, so we check that at least 10 moves exist
        assert len(data["moves"]) >= 10
        assert "wealth" in data
        assert "jurisdiction" in data
        assert "academy" in data
        assert "timeline" in data
        
        # Verify all 10 move numbers are present (may have duplicates from previous calls)
        move_numbers = set(m["number"] for m in data["moves"])
        for i in range(1, 11):
            assert i in move_numbers, f"Move {i} not found in moves"
        
        print(f"PASS: Final Print executed all 10 moves, status: {data['status']}")
    
    def test_omega_quest_generation(self):
        """Omega should generate quests at different tiers"""
        response = requests.post(f"{BASE_URL}/api/omnis/omega/quest/generate?tier=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10011.0"
        assert "task" in data
        assert "difficulty" in data
        assert "reward" in data
        assert "xp" in data
        print(f"PASS: Quest generated: {data['task']} with {data['xp']} XP")
    
    def test_omega_ui_evolution(self):
        """Omega UI should evolve based on resonance"""
        # Test different resonance levels
        test_cases = [
            (50, "OBSIDIAN_VOID"),
            (120, "REFINED_MASONRY"),
            (150, "CRYSTALLINE_VOID"),
            (250, "OMEGA_TRANSCENDENCE"),
        ]
        
        for resonance, expected_theme in test_cases:
            response = requests.get(f"{BASE_URL}/api/omnis/omega/ui/{resonance}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["theme"] == expected_theme
            print(f"PASS: Resonance {resonance} -> {data['theme']}")


class TestDeepDiveSearch:
    """V10010.0 Deep Dive Search endpoint tests"""
    
    def test_deep_dive_search_synthesizes_multi_epoch(self):
        """Deep Dive Search should synthesize answers from multiple epochs"""
        response = requests.post(f"{BASE_URL}/api/omnis/search/deep-dive?query=Trust%20Equity%20synthesis")
        assert response.status_code == 200
        
        data = response.json()
        assert data["version"] == "V10010.0"
        assert "query" in data
        assert "answer" in data
        assert "sources" in data
        assert "thread_count" in data
        assert data["thread_count"] >= 1
        
        # Verify sources have GPS anchors
        for source in data["sources"]:
            assert "epoch" in source
            assert "layers" in source
            assert "gps" in source
            assert "anchor" in source
        
        print(f"PASS: Deep Dive synthesized {data['thread_count']} epoch threads for query")
    
    def test_deep_dive_search_past_keywords(self):
        """Deep Dive with past keywords should return PAST epoch"""
        response = requests.post(f"{BASE_URL}/api/omnis/search/deep-dive?query=Lakota%20ancient%20law")
        assert response.status_code == 200
        
        data = response.json()
        epochs = [s["epoch"] for s in data["sources"]]
        assert "PAST" in epochs
        print(f"PASS: Past keywords returned epochs: {epochs}")
    
    def test_deep_dive_search_future_keywords(self):
        """Deep Dive with future keywords should return FUTURE epoch"""
        response = requests.post(f"{BASE_URL}/api/omnis/search/deep-dive?query=omega%20singularity%20future")
        assert response.status_code == 200
        
        data = response.json()
        epochs = [s["epoch"] for s in data["sources"]]
        assert "FUTURE" in epochs
        print(f"PASS: Future keywords returned epochs: {epochs}")
    
    def test_deep_dive_search_generic_query(self):
        """Deep Dive with generic query should return all epochs"""
        response = requests.post(f"{BASE_URL}/api/omnis/search/deep-dive?query=knowledge")
        assert response.status_code == 200
        
        data = response.json()
        epochs = [s["epoch"] for s in data["sources"]]
        assert len(epochs) == 3  # PAST, PRESENT, FUTURE
        print(f"PASS: Generic query returned all {len(epochs)} epochs")


class TestIntegration:
    """Integration tests for Director + Omega + Deep Dive"""
    
    def test_full_director_workflow(self):
        """Test complete Director workflow: status -> scrub -> keyframe -> render"""
        # 1. Get status
        status_res = requests.get(f"{BASE_URL}/api/omnis/director/status")
        assert status_res.status_code == 200
        
        # 2. Scrub timeline
        scrub_res = requests.post(f"{BASE_URL}/api/omnis/director/timeline/scrub?position=0.75")
        assert scrub_res.status_code == 200
        assert scrub_res.json()["epoch"] == "FUTURE"
        
        # 3. Add keyframe
        kf_res = requests.post(
            f"{BASE_URL}/api/omnis/director/keyframe/add?position=0.75&action_type=EPOCH_SHIFT&action_data={{}}"
        )
        assert kf_res.status_code == 200
        
        # 4. Render movie
        movie_res = requests.post(f"{BASE_URL}/api/omnis/director/movie/render")
        assert movie_res.status_code == 200
        assert movie_res.json()["total_layers"] == 54
        
        print("PASS: Full Director workflow completed successfully")
    
    def test_omega_to_director_integration(self):
        """Test Omega status references Director timeline"""
        omega_res = requests.get(f"{BASE_URL}/api/omnis/omega/status")
        assert omega_res.status_code == 200
        
        omega_data = omega_res.json()
        assert "timeline" in omega_data["interface"]
        assert "PowerDirector" in omega_data["interface"]["timeline"]
        
        print("PASS: Omega references Director timeline in interface config")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

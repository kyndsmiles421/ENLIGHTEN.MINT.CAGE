"""
Iteration 112: Sacred Scriptures & Lost Books Feature Tests
Tests for /api/bible/* endpoints - 136 texts across 7 categories
Categories: Old Testament (39), New Testament (27), Deuterocanonical (7), 
Lost & Apocryphal (17), Torah & Talmud (12), Kabbalah (10), Quran (24)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected endpoints"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestBibleCategories:
    """Tests for GET /api/bible/categories"""
    
    def test_get_categories_returns_7_categories(self):
        """Verify 7 categories are returned"""
        response = requests.get(f"{BASE_URL}/api/bible/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) == 7
        print(f"PASS: 7 categories returned")
    
    def test_get_categories_total_books_136(self):
        """Verify total_books equals 136"""
        response = requests.get(f"{BASE_URL}/api/bible/categories")
        assert response.status_code == 200
        data = response.json()
        assert data["total_books"] == 136
        print(f"PASS: total_books = 136")
    
    def test_categories_have_correct_book_counts(self):
        """Verify each category has correct book_count"""
        response = requests.get(f"{BASE_URL}/api/bible/categories")
        assert response.status_code == 200
        data = response.json()
        
        expected_counts = {
            "old-testament": 39,
            "new-testament": 27,
            "deuterocanonical": 7,
            "lost-apocryphal": 17,
            "torah-talmud": 12,
            "kabbalah": 10,
            "quran": 24,
        }
        
        for cat in data["categories"]:
            cat_id = cat["id"]
            assert cat_id in expected_counts, f"Unknown category: {cat_id}"
            assert cat["book_count"] == expected_counts[cat_id], f"Category {cat_id}: expected {expected_counts[cat_id]}, got {cat['book_count']}"
            print(f"PASS: {cat_id} has {cat['book_count']} books")
        
        # Verify sum equals 136
        total = sum(cat["book_count"] for cat in data["categories"])
        assert total == 136, f"Sum of book_counts ({total}) != 136"
        print(f"PASS: Sum of all book_counts = 136")
    
    def test_categories_have_required_fields(self):
        """Verify each category has id, name, color, description, icon"""
        response = requests.get(f"{BASE_URL}/api/bible/categories")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "color", "description", "icon", "book_count"]
        for cat in data["categories"]:
            for field in required_fields:
                assert field in cat, f"Category {cat.get('id', 'unknown')} missing field: {field}"
        print(f"PASS: All categories have required fields")


class TestBibleBooks:
    """Tests for GET /api/bible/books"""
    
    def test_get_all_books_returns_136(self):
        """Verify all 136 books are returned without filter"""
        response = requests.get(f"{BASE_URL}/api/bible/books")
        assert response.status_code == 200
        data = response.json()
        assert "books" in data
        assert data["total"] == 136
        assert len(data["books"]) == 136
        print(f"PASS: 136 books returned")
    
    def test_filter_old_testament_39_books(self):
        """Verify Old Testament filter returns 39 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=old-testament")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 39
        assert len(data["books"]) == 39
        for book in data["books"]:
            assert book["category"] == "old-testament"
        print(f"PASS: Old Testament = 39 books")
    
    def test_filter_new_testament_27_books(self):
        """Verify New Testament filter returns 27 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=new-testament")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 27
        assert len(data["books"]) == 27
        for book in data["books"]:
            assert book["category"] == "new-testament"
        print(f"PASS: New Testament = 27 books")
    
    def test_filter_deuterocanonical_7_books(self):
        """Verify Deuterocanonical filter returns 7 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=deuterocanonical")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 7
        assert len(data["books"]) == 7
        for book in data["books"]:
            assert book["category"] == "deuterocanonical"
        print(f"PASS: Deuterocanonical = 7 books")
    
    def test_filter_lost_apocryphal_17_books(self):
        """Verify Lost & Apocryphal filter returns 17 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=lost-apocryphal")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 17
        assert len(data["books"]) == 17
        for book in data["books"]:
            assert book["category"] == "lost-apocryphal"
        print(f"PASS: Lost & Apocryphal = 17 books")
    
    def test_filter_torah_talmud_12_books(self):
        """Verify Torah & Talmud filter returns 12 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=torah-talmud")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 12
        assert len(data["books"]) == 12
        for book in data["books"]:
            assert book["category"] == "torah-talmud"
        print(f"PASS: Torah & Talmud = 12 books")
    
    def test_filter_kabbalah_10_books(self):
        """Verify Kabbalah filter returns 10 books"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=kabbalah")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 10
        assert len(data["books"]) == 10
        for book in data["books"]:
            assert book["category"] == "kabbalah"
        print(f"PASS: Kabbalah = 10 books")
    
    def test_filter_quran_24_books(self):
        """Verify Quran filter returns 24 books (surahs)"""
        response = requests.get(f"{BASE_URL}/api/bible/books?category=quran")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 24
        assert len(data["books"]) == 24
        for book in data["books"]:
            assert book["category"] == "quran"
        print(f"PASS: Quran = 24 surahs")
    
    def test_books_have_required_fields(self):
        """Verify each book has required fields"""
        response = requests.get(f"{BASE_URL}/api/bible/books")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "title", "category", "chapters", "description", "era", "themes"]
        for book in data["books"][:10]:  # Check first 10 for speed
            for field in required_fields:
                assert field in book, f"Book {book.get('id', 'unknown')} missing field: {field}"
        print(f"PASS: Books have required fields")


class TestBibleBookDetail:
    """Tests for GET /api/bible/books/{book_id}"""
    
    def test_get_zohar_25_chapters(self):
        """Verify Zohar (Kabbalah) has 25 chapters"""
        response = requests.get(f"{BASE_URL}/api/bible/books/zohar")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "zohar"
        assert data["title"] == "The Zohar"
        assert data["category"] == "kabbalah"
        assert data["chapters"] == 25
        assert "chapter_list" in data
        assert len(data["chapter_list"]) == 25
        print(f"PASS: Zohar has 25 chapters")
    
    def test_get_al_kahf_12_chapters(self):
        """Verify Al-Kahf (Quran surah) has 12 chapters"""
        response = requests.get(f"{BASE_URL}/api/bible/books/al-kahf")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "al-kahf"
        assert data["title"] == "Al-Kahf (The Cave)"
        assert data["category"] == "quran"
        assert data["chapters"] == 12
        assert "chapter_list" in data
        assert len(data["chapter_list"]) == 12
        print(f"PASS: Al-Kahf has 12 chapters")
    
    def test_get_genesis_50_chapters(self):
        """Verify Genesis (Old Testament) has 50 chapters"""
        response = requests.get(f"{BASE_URL}/api/bible/books/genesis")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "genesis"
        assert data["title"] == "Genesis"
        assert data["category"] == "old-testament"
        assert data["chapters"] == 50
        print(f"PASS: Genesis has 50 chapters")
    
    def test_get_pirke_avot_6_chapters(self):
        """Verify Pirke Avot (Torah & Talmud) has 6 chapters"""
        response = requests.get(f"{BASE_URL}/api/bible/books/pirke-avot")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "pirke-avot"
        assert data["title"] == "Pirke Avot (Ethics of the Fathers)"
        assert data["category"] == "torah-talmud"
        assert data["chapters"] == 6
        print(f"PASS: Pirke Avot has 6 chapters")
    
    def test_book_not_found_404(self):
        """Verify 404 for non-existent book"""
        response = requests.get(f"{BASE_URL}/api/bible/books/nonexistent-book")
        assert response.status_code == 404
        print(f"PASS: 404 for non-existent book")
    
    def test_chapter_list_structure(self):
        """Verify chapter_list has correct structure"""
        response = requests.get(f"{BASE_URL}/api/bible/books/ruth")
        assert response.status_code == 200
        data = response.json()
        assert data["chapters"] == 4
        assert len(data["chapter_list"]) == 4
        
        for i, ch in enumerate(data["chapter_list"], 1):
            assert ch["number"] == i
            assert "id" in ch
            assert "generated" in ch
            assert isinstance(ch["generated"], bool)
        print(f"PASS: chapter_list has correct structure")


class TestBibleChapterGeneration:
    """Tests for POST /api/bible/books/{book_id}/chapters/{chapter_num}/generate"""
    
    def test_generate_chapter_requires_auth(self):
        """Verify chapter generation requires authentication"""
        response = requests.post(f"{BASE_URL}/api/bible/books/ruth/chapters/1/generate")
        assert response.status_code in [401, 403]
        print(f"PASS: Chapter generation requires auth")
    
    def test_generate_chapter_returns_content(self, auth_headers):
        """Verify chapter generation returns retelling, key_verses, commentary"""
        # Use a short book chapter for faster test (chapter 4 to avoid cached data)
        response = requests.post(
            f"{BASE_URL}/api/bible/books/ruth/chapters/4/generate",
            headers=auth_headers,
            timeout=35  # AI generation can take 15-30s
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "book_id" in data
        assert "chapter_num" in data
        assert "title" in data
        assert "retelling" in data
        assert "key_verses" in data
        assert "commentary" in data
        
        # Verify content is not empty
        assert len(data["retelling"]) > 50, "Retelling too short"
        assert len(data["key_verses"]) > 20, "Key verses too short"
        assert len(data["commentary"]) > 50, "Commentary too short"
        
        print(f"PASS: Chapter generation returns content")
        print(f"  - retelling: {len(data['retelling'])} chars")
        print(f"  - key_verses: {len(data['key_verses'])} chars")
        print(f"  - commentary: {len(data['commentary'])} chars")
    
    def test_generate_invalid_chapter_400(self, auth_headers):
        """Verify 400 for invalid chapter number"""
        response = requests.post(
            f"{BASE_URL}/api/bible/books/ruth/chapters/999/generate",
            headers=auth_headers
        )
        assert response.status_code == 400
        print(f"PASS: 400 for invalid chapter number")
    
    def test_generate_nonexistent_book_404(self, auth_headers):
        """Verify 404 for non-existent book"""
        response = requests.post(
            f"{BASE_URL}/api/bible/books/fake-book/chapters/1/generate",
            headers=auth_headers
        )
        assert response.status_code == 404
        print(f"PASS: 404 for non-existent book")


class TestBibleAIQuestion:
    """Tests for POST /api/bible/ask"""
    
    def test_ask_requires_auth(self):
        """Verify AI question requires authentication"""
        response = requests.post(f"{BASE_URL}/api/bible/ask", json={
            "question": "What is the meaning of the Zohar?"
        })
        assert response.status_code in [401, 403]
        print(f"PASS: AI question requires auth")
    
    def test_ask_returns_answer(self, auth_headers):
        """Verify AI question returns answer"""
        response = requests.post(
            f"{BASE_URL}/api/bible/ask",
            json={
                "question": "What is the significance of the Tree of Life in Kabbalah?",
                "book_title": "The Zohar",
                "chapter_num": 1
            },
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "answer" in data
        assert "question" in data
        assert len(data["answer"]) > 50, "Answer too short"
        
        print(f"PASS: AI question returns answer ({len(data['answer'])} chars)")
    
    def test_ask_requires_question(self, auth_headers):
        """Verify question field is required"""
        response = requests.post(
            f"{BASE_URL}/api/bible/ask",
            json={"book_title": "Genesis"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print(f"PASS: Question field is required")


class TestBibleBookmarks:
    """Tests for /api/bible/bookmarks endpoints"""
    
    def test_bookmarks_require_auth(self):
        """Verify bookmarks require authentication"""
        response = requests.get(f"{BASE_URL}/api/bible/bookmarks")
        assert response.status_code in [401, 403]
        print(f"PASS: Bookmarks require auth")
    
    def test_add_and_get_bookmark(self, auth_headers):
        """Verify adding and retrieving bookmarks"""
        # Add bookmark
        add_response = requests.post(
            f"{BASE_URL}/api/bible/bookmarks",
            json={
                "book_id": "zohar",
                "book_title": "The Zohar",
                "chapter_num": 5,
                "note": "Test bookmark"
            },
            headers=auth_headers
        )
        assert add_response.status_code == 200
        bookmark = add_response.json()
        assert bookmark["book_id"] == "zohar"
        assert bookmark["chapter_num"] == 5
        print(f"PASS: Bookmark added")
        
        # Get bookmarks
        get_response = requests.get(
            f"{BASE_URL}/api/bible/bookmarks",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert "bookmarks" in data
        
        # Find our bookmark
        found = any(
            b["book_id"] == "zohar" and b["chapter_num"] == 5
            for b in data["bookmarks"]
        )
        assert found, "Bookmark not found in list"
        print(f"PASS: Bookmark retrieved")
    
    def test_delete_bookmark(self, auth_headers):
        """Verify deleting bookmarks"""
        # First add a bookmark to delete
        requests.post(
            f"{BASE_URL}/api/bible/bookmarks",
            json={
                "book_id": "genesis",
                "book_title": "Genesis",
                "chapter_num": 1,
                "note": "To be deleted"
            },
            headers=auth_headers
        )
        
        # Delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/bible/bookmarks/genesis/1",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["deleted"] == True
        print(f"PASS: Bookmark deleted")
        
        # Verify it's gone
        get_response = requests.get(
            f"{BASE_URL}/api/bible/bookmarks",
            headers=auth_headers
        )
        bookmarks = get_response.json()["bookmarks"]
        found = any(
            b["book_id"] == "genesis" and b["chapter_num"] == 1
            for b in bookmarks
        )
        assert not found, "Bookmark still exists after deletion"
        print(f"PASS: Bookmark verified deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

#!/usr/bin/env python3
"""
Comprehensive backend API test for FailureSays
Tests all endpoints according to the review request specification
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Load environment variables
BASE_URL = "https://business-lessons.preview.emergentagent.com/api"
ADMIN_PASSWORD = "Fs-8Kx!Qp2vR9nZ7wBmT4jY"

# Test state
auth_token: Optional[str] = None
test_post_id: Optional[str] = None
test_post_slug: Optional[str] = None
second_post_id: Optional[str] = None
contact_message_id: Optional[str] = None

# Test results tracking
tests_passed = 0
tests_failed = 0
test_details = []


def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    global tests_passed, tests_failed
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"  Details: {details}")
    test_details.append({"name": name, "passed": passed, "details": details})
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1


def test_health_check():
    """Test 1: GET /api/ should return health check"""
    try:
        resp = requests.get(f"{BASE_URL}/", timeout=10)
        data = resp.json()
        passed = (
            resp.status_code == 200
            and data.get("ok") is True
            and data.get("service") == "failuresays"
        )
        log_test(
            "Health check (GET /api/)",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        return passed
    except Exception as e:
        log_test("Health check (GET /api/)", False, f"Exception: {str(e)}")
        return False


def test_admin_login_wrong_password():
    """Test 2a: POST /api/admin/login with wrong password should return 401"""
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": "wrong"},
            timeout=10,
        )
        data = resp.json()
        passed = resp.status_code == 401 and "error" in data
        log_test(
            "Admin login with wrong password",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        return passed
    except Exception as e:
        log_test("Admin login with wrong password", False, f"Exception: {str(e)}")
        return False


def test_admin_login_correct_password():
    """Test 2b: POST /api/admin/login with correct password should return token"""
    global auth_token
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10,
        )
        data = resp.json()
        passed = resp.status_code == 200 and "token" in data
        if passed:
            auth_token = data["token"]
        log_test(
            "Admin login with correct password",
            passed,
            f"Status: {resp.status_code}, Token received: {bool(auth_token)}",
        )
        return passed
    except Exception as e:
        log_test("Admin login with correct password", False, f"Exception: {str(e)}")
        return False


def test_admin_verify_without_token():
    """Test 3a: GET /api/admin/verify without token should return ok:false or 401"""
    try:
        resp = requests.get(f"{BASE_URL}/admin/verify", timeout=10)
        data = resp.json()
        passed = data.get("ok") is False or resp.status_code == 401
        log_test(
            "Admin verify without token",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        return passed
    except Exception as e:
        log_test("Admin verify without token", False, f"Exception: {str(e)}")
        return False


def test_admin_verify_with_token():
    """Test 3b: GET /api/admin/verify with Bearer token should return ok:true"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.get(f"{BASE_URL}/admin/verify", headers=headers, timeout=10)
        data = resp.json()
        passed = resp.status_code == 200 and data.get("ok") is True
        log_test(
            "Admin verify with token",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        return passed
    except Exception as e:
        log_test("Admin verify with token", False, f"Exception: {str(e)}")
        return False


def test_create_post_without_auth():
    """Test 4: POST /api/admin/posts without auth should return 401"""
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/posts",
            json={"title": "Test", "category": "blog"},
            timeout=10,
        )
        passed = resp.status_code == 401
        log_test(
            "Create post without auth",
            passed,
            f"Status: {resp.status_code}",
        )
        return passed
    except Exception as e:
        log_test("Create post without auth", False, f"Exception: {str(e)}")
        return False


def test_create_draft_post():
    """Test 5: POST /api/admin/posts with auth should create draft post"""
    global test_post_id, test_post_slug
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        post_data = {
            "title": "The Anatomy of a Great Pivot",
            "category": "case-studies",
            "excerpt": "Why some pivots reroute a company to greatness.",
            "content": "# Intro\n\nEvery **great** company pivots at least once.\n\n- Slack\n- Twitter\n- Instagram",
            "tags": ["strategy", "pivots"],
            "coverImage": "https://images.unsplash.com/photo-1",
            "published": False,
            "featured": False,
        }
        resp = requests.post(
            f"{BASE_URL}/admin/posts",
            json=post_data,
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        # Check all required fields
        passed = (
            resp.status_code == 200
            and "post" in data
            and post.get("id")
            and post.get("slug")
            and post.get("readingTime", 0) >= 1
            and post.get("publishedAt") is None
            and "_id" not in post  # No ObjectId leak
        )
        
        if passed:
            test_post_id = post["id"]
            test_post_slug = post["slug"]
        
        log_test(
            "Create draft post",
            passed,
            f"Status: {resp.status_code}, ID: {test_post_id}, Slug: {test_post_slug}, ReadingTime: {post.get('readingTime')}, PublishedAt: {post.get('publishedAt')}",
        )
        return passed
    except Exception as e:
        log_test("Create draft post", False, f"Exception: {str(e)}")
        return False


def test_draft_not_in_public_articles():
    """Test 6: GET /api/articles should not include draft posts"""
    try:
        resp = requests.get(f"{BASE_URL}/articles", timeout=10)
        data = resp.json()
        articles = data.get("articles", [])
        
        # Check that our draft post is not in the list
        draft_found = any(a.get("id") == test_post_id for a in articles)
        passed = resp.status_code == 200 and not draft_found
        
        log_test(
            "Draft not in public articles",
            passed,
            f"Status: {resp.status_code}, Draft found: {draft_found}, Total articles: {len(articles)}",
        )
        return passed
    except Exception as e:
        log_test("Draft not in public articles", False, f"Exception: {str(e)}")
        return False


def test_publish_post():
    """Test 7: PUT /api/admin/posts/:id with published:true should set publishedAt"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.put(
            f"{BASE_URL}/admin/posts/{test_post_id}",
            json={"published": True},
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        passed = (
            resp.status_code == 200
            and post.get("published") is True
            and post.get("publishedAt") is not None
        )
        
        log_test(
            "Publish post",
            passed,
            f"Status: {resp.status_code}, Published: {post.get('published')}, PublishedAt: {post.get('publishedAt')}",
        )
        return passed
    except Exception as e:
        log_test("Publish post", False, f"Exception: {str(e)}")
        return False


def test_published_in_articles():
    """Test 8: GET /api/articles should now include the published post"""
    try:
        resp = requests.get(f"{BASE_URL}/articles", timeout=10)
        data = resp.json()
        articles = data.get("articles", [])
        
        # Check that our post is now in the list
        post_found = any(a.get("id") == test_post_id for a in articles)
        
        # Also check that content field is not included in list
        has_content = any("content" in a for a in articles)
        
        passed = resp.status_code == 200 and post_found and not has_content
        
        log_test(
            "Published post in articles list",
            passed,
            f"Status: {resp.status_code}, Post found: {post_found}, Has content field: {has_content}",
        )
        return passed
    except Exception as e:
        log_test("Published post in articles list", False, f"Exception: {str(e)}")
        return False


def test_category_filter():
    """Test 9: GET /api/articles?category=case-studies should include the post"""
    try:
        resp = requests.get(f"{BASE_URL}/articles?category=case-studies", timeout=10)
        data = resp.json()
        articles = data.get("articles", [])
        
        post_found = any(a.get("id") == test_post_id for a in articles)
        
        log_test(
            "Category filter (case-studies)",
            post_found,
            f"Status: {resp.status_code}, Post found: {post_found}",
        )
        
        # Test wrong category
        resp2 = requests.get(f"{BASE_URL}/articles?category=startup-ideas", timeout=10)
        data2 = resp2.json()
        articles2 = data2.get("articles", [])
        post_not_found = not any(a.get("id") == test_post_id for a in articles2)
        
        log_test(
            "Category filter (startup-ideas) - should not contain post",
            post_not_found,
            f"Status: {resp2.status_code}, Post not found: {post_not_found}",
        )
        
        return post_found and post_not_found
    except Exception as e:
        log_test("Category filter", False, f"Exception: {str(e)}")
        return False


def test_get_single_article():
    """Test 10: GET /api/articles/:slug should return full article with content"""
    try:
        resp = requests.get(f"{BASE_URL}/articles/{test_post_slug}", timeout=10)
        data = resp.json()
        article = data.get("article", {})
        
        passed = (
            resp.status_code == 200
            and article.get("id") == test_post_id
            and "content" in article
            and "_id" not in article  # No ObjectId leak
        )
        
        log_test(
            "Get single article by slug",
            passed,
            f"Status: {resp.status_code}, Has content: {'content' in article}",
        )
        return passed
    except Exception as e:
        log_test("Get single article by slug", False, f"Exception: {str(e)}")
        return False


def test_slug_not_found():
    """Test 10b: GET /api/articles/nonexistent should return 404"""
    try:
        resp = requests.get(f"{BASE_URL}/articles/nonexistent-slug-xyz", timeout=10)
        passed = resp.status_code == 404
        
        log_test(
            "Get article with nonexistent slug returns 404",
            passed,
            f"Status: {resp.status_code}",
        )
        return passed
    except Exception as e:
        log_test("Get article with nonexistent slug", False, f"Exception: {str(e)}")
        return False


def test_slug_change():
    """Test 11: PUT /api/admin/posts/:id with slug change"""
    global test_post_slug
    old_slug = test_post_slug
    new_slug = "the-great-pivot"
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.put(
            f"{BASE_URL}/admin/posts/{test_post_id}",
            json={"slug": new_slug},
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        passed = resp.status_code == 200 and post.get("slug") == new_slug
        
        if passed:
            test_post_slug = new_slug
        
        log_test(
            "Change post slug",
            passed,
            f"Status: {resp.status_code}, New slug: {post.get('slug')}",
        )
        
        # Test that new slug works
        resp2 = requests.get(f"{BASE_URL}/articles/{new_slug}", timeout=10)
        new_slug_works = resp2.status_code == 200
        
        log_test(
            "New slug accessible",
            new_slug_works,
            f"Status: {resp2.status_code}",
        )
        
        # Test that old slug returns 404
        resp3 = requests.get(f"{BASE_URL}/articles/{old_slug}", timeout=10)
        old_slug_404 = resp3.status_code == 404
        
        log_test(
            "Old slug returns 404",
            old_slug_404,
            f"Status: {resp3.status_code}",
        )
        
        return passed and new_slug_works and old_slug_404
    except Exception as e:
        log_test("Slug change", False, f"Exception: {str(e)}")
        return False


def test_slug_uniqueness():
    """Test 12: Create second post with same title should get unique slug"""
    global second_post_id
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        post_data = {
            "title": "The Anatomy of a Great Pivot",  # Same title as first post
            "category": "case-studies",
            "excerpt": "Another pivot story.",
            "content": "Different content.",
            "published": True,
        }
        resp = requests.post(
            f"{BASE_URL}/admin/posts",
            json=post_data,
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        # Slug should be different (with suffix like -1)
        passed = (
            resp.status_code == 200
            and post.get("slug") != test_post_slug
            and "anatomy" in post.get("slug", "")
        )
        
        if passed:
            second_post_id = post["id"]
        
        log_test(
            "Slug uniqueness (duplicate title gets suffix)",
            passed,
            f"Status: {resp.status_code}, First slug: {test_post_slug}, Second slug: {post.get('slug')}",
        )
        return passed
    except Exception as e:
        log_test("Slug uniqueness", False, f"Exception: {str(e)}")
        return False


def test_reading_time_recompute():
    """Test 13: PUT /api/admin/posts/:id with short content should recompute readingTime"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.put(
            f"{BASE_URL}/admin/posts/{test_post_id}",
            json={"content": "Short"},
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        passed = resp.status_code == 200 and post.get("readingTime") == 1
        
        log_test(
            "ReadingTime recomputation",
            passed,
            f"Status: {resp.status_code}, ReadingTime: {post.get('readingTime')}",
        )
        return passed
    except Exception as e:
        log_test("ReadingTime recomputation", False, f"Exception: {str(e)}")
        return False


def test_unpublish_post():
    """Test 14: PUT /api/admin/posts/:id with published:false should clear publishedAt"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.put(
            f"{BASE_URL}/admin/posts/{test_post_id}",
            json={"published": False},
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        post = data.get("post", {})
        
        passed = (
            resp.status_code == 200
            and post.get("published") is False
            and post.get("publishedAt") is None
        )
        
        log_test(
            "Unpublish post (publishedAt cleared)",
            passed,
            f"Status: {resp.status_code}, Published: {post.get('published')}, PublishedAt: {post.get('publishedAt')}",
        )
        
        # Verify it's not in public articles anymore
        resp2 = requests.get(f"{BASE_URL}/articles", timeout=10)
        data2 = resp2.json()
        articles = data2.get("articles", [])
        not_in_list = not any(a.get("id") == test_post_id for a in articles)
        
        log_test(
            "Unpublished post not in articles list",
            not_in_list,
            f"Post found in list: {not not_in_list}",
        )
        
        return passed and not_in_list
    except Exception as e:
        log_test("Unpublish post", False, f"Exception: {str(e)}")
        return False


def test_search():
    """Test 15: GET /api/search?q=pivot should return results"""
    try:
        # Re-publish the second post for search testing
        headers = {"Authorization": f"Bearer {auth_token}"}
        requests.put(
            f"{BASE_URL}/admin/posts/{second_post_id}",
            json={"published": True},
            headers=headers,
            timeout=10,
        )
        
        # Search for "pivot"
        resp = requests.get(f"{BASE_URL}/search?q=pivot", timeout=10)
        data = resp.json()
        results = data.get("results", [])
        
        # Should find the second post (which has "pivot" in title)
        found = any(r.get("id") == second_post_id for r in results)
        
        # Check that categoryLabel is present
        has_category_label = all("categoryLabel" in r for r in results) if results else True
        
        # Check that content is not in results
        has_content = any("content" in r for r in results)
        
        passed = (
            resp.status_code == 200
            and found
            and has_category_label
            and not has_content
        )
        
        log_test(
            "Search with query 'pivot'",
            passed,
            f"Status: {resp.status_code}, Results found: {len(results)}, Has categoryLabel: {has_category_label}",
        )
        
        # Test empty search
        resp2 = requests.get(f"{BASE_URL}/search?q=", timeout=10)
        data2 = resp2.json()
        empty_results = data2.get("results", [])
        
        log_test(
            "Search with empty query returns empty results",
            len(empty_results) == 0,
            f"Status: {resp2.status_code}, Results: {len(empty_results)}",
        )
        
        # Test nonsense search
        resp3 = requests.get(f"{BASE_URL}/search?q=xyzzynonsense", timeout=10)
        data3 = resp3.json()
        no_results = data3.get("results", [])
        
        log_test(
            "Search with nonsense query returns no results",
            len(no_results) == 0,
            f"Status: {resp3.status_code}, Results: {len(no_results)}",
        )
        
        return passed and len(empty_results) == 0 and len(no_results) == 0
    except Exception as e:
        log_test("Search", False, f"Exception: {str(e)}")
        return False


def test_featured_filter():
    """Test 16: GET /api/articles?featured=1 should return only featured posts"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a featured post
        post_data = {
            "title": "Featured Post Test",
            "category": "blog",
            "excerpt": "This is featured.",
            "content": "Featured content.",
            "published": True,
            "featured": True,
        }
        resp = requests.post(
            f"{BASE_URL}/admin/posts",
            json=post_data,
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        featured_post_id = data.get("post", {}).get("id")
        
        # Get featured articles
        resp2 = requests.get(f"{BASE_URL}/articles?featured=1", timeout=10)
        data2 = resp2.json()
        articles = data2.get("articles", [])
        
        # All articles should be featured
        all_featured = all(a.get("featured") is True for a in articles)
        featured_found = any(a.get("id") == featured_post_id for a in articles)
        
        passed = resp2.status_code == 200 and all_featured and featured_found
        
        log_test(
            "Featured filter",
            passed,
            f"Status: {resp2.status_code}, All featured: {all_featured}, Featured post found: {featured_found}",
        )
        return passed
    except Exception as e:
        log_test("Featured filter", False, f"Exception: {str(e)}")
        return False


def test_contact_form():
    """Test 17: POST /api/contact should save message"""
    try:
        contact_data = {
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "subject": "Partnership Inquiry",
            "message": "I'd like to discuss a potential partnership opportunity.",
        }
        resp = requests.post(
            f"{BASE_URL}/contact",
            json=contact_data,
            timeout=10,
        )
        data = resp.json()
        
        passed = resp.status_code == 200 and data.get("ok") is True
        
        log_test(
            "Contact form submission",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        
        # Test missing message field
        resp2 = requests.post(
            f"{BASE_URL}/contact",
            json={"name": "Bob", "email": "bob@example.com"},
            timeout=10,
        )
        
        missing_field_rejected = resp2.status_code == 400
        
        log_test(
            "Contact form rejects missing message",
            missing_field_rejected,
            f"Status: {resp2.status_code}",
        )
        
        return passed and missing_field_rejected
    except Exception as e:
        log_test("Contact form", False, f"Exception: {str(e)}")
        return False


def test_admin_messages():
    """Test 18: GET /api/admin/messages should return submitted messages"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.get(f"{BASE_URL}/admin/messages", headers=headers, timeout=10)
        data = resp.json()
        messages = data.get("messages", [])
        
        # Should have at least one message (from contact form test)
        has_messages = len(messages) > 0
        
        # Check that messages have uuid id (not ObjectId)
        has_uuid = all(
            isinstance(m.get("id"), str) and len(m.get("id", "")) > 20
            for m in messages
        )
        
        # Check no _id field
        no_object_id = all("_id" not in m for m in messages)
        
        passed = (
            resp.status_code == 200
            and has_messages
            and has_uuid
            and no_object_id
        )
        
        log_test(
            "Admin messages list",
            passed,
            f"Status: {resp.status_code}, Messages: {len(messages)}, Has UUID: {has_uuid}, No ObjectId: {no_object_id}",
        )
        return passed
    except Exception as e:
        log_test("Admin messages list", False, f"Exception: {str(e)}")
        return False


def test_delete_post():
    """Test 19: DELETE /api/admin/posts/:id should delete post"""
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.delete(
            f"{BASE_URL}/admin/posts/{test_post_id}",
            headers=headers,
            timeout=10,
        )
        data = resp.json()
        
        passed = resp.status_code == 200 and data.get("ok") is True
        
        log_test(
            "Delete post",
            passed,
            f"Status: {resp.status_code}, Response: {data}",
        )
        
        # Verify it's gone - try to get by slug
        resp2 = requests.get(f"{BASE_URL}/articles/{test_post_slug}", timeout=10)
        not_found = resp2.status_code == 404
        
        log_test(
            "Deleted post returns 404",
            not_found,
            f"Status: {resp2.status_code}",
        )
        
        return passed and not_found
    except Exception as e:
        log_test("Delete post", False, f"Exception: {str(e)}")
        return False


def run_all_tests():
    """Run all backend tests in sequence"""
    print("=" * 80)
    print("FAILURESAYS BACKEND API COMPREHENSIVE TEST")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("=" * 80)
    print()
    
    # Run tests in order
    test_health_check()
    test_admin_login_wrong_password()
    test_admin_login_correct_password()
    test_admin_verify_without_token()
    test_admin_verify_with_token()
    test_create_post_without_auth()
    test_create_draft_post()
    test_draft_not_in_public_articles()
    test_publish_post()
    test_published_in_articles()
    test_category_filter()
    test_get_single_article()
    test_slug_not_found()
    test_slug_change()
    test_slug_uniqueness()
    test_reading_time_recompute()
    test_unpublish_post()
    test_search()
    test_featured_filter()
    test_contact_form()
    test_admin_messages()
    test_delete_post()
    
    # Print summary
    print()
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {tests_passed + tests_failed}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print("=" * 80)
    
    if tests_failed > 0:
        print("\nFailed tests:")
        for test in test_details:
            if not test["passed"]:
                print(f"  - {test['name']}")
                if test["details"]:
                    print(f"    {test['details']}")
    
    return tests_failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

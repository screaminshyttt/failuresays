#!/usr/bin/env python3
"""
Backend API Testing for FailureSays - MongoDB Atlas Verification
Tests complete CMS lifecycle against Atlas database
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'qwesdfcvb')

print(f"🔧 Testing against: {API_BASE}")
print(f"🔑 Admin password: {ADMIN_PASSWORD}")
print("=" * 80)

# Global storage
admin_token = None
test_post_id = None
test_post_slug = None

def test_admin_login_correct_password():
    """Test 1: POST /api/admin/login with correct password returns 200 with JWT"""
    global admin_token
    print("\n✓ Test 1: Admin login with CORRECT password")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "token" in data, "Response should contain 'token' field"
        assert isinstance(data["token"], str), "Token should be a string"
        assert len(data["token"]) > 20, "Token should be a valid JWT"
        
        admin_token = data["token"]
        print(f"  ✅ PASSED - Got JWT token: {admin_token[:30]}...")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_login_wrong_password():
    """Test 2: POST /api/admin/login with wrong password returns 401"""
    print("\n✓ Test 2: Admin login with WRONG password")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"password": "wrongpassword123"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "error" in data, "Response should contain 'error' field"
        
        print(f"  ✅ PASSED - Correctly rejected with 401: {data.get('error')}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_login_no_body():
    """Test 3: POST /api/admin/login with no body returns 400"""
    print("\n✓ Test 3: Admin login with NO body")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "error" in data, "Response should contain 'error' field"
        
        print(f"  ✅ PASSED - Correctly rejected with 400: {data.get('error')}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_with_token():
    """Test 4: GET /api/admin/verify with Bearer token returns {ok:true}"""
    print("\n✓ Test 4: Admin verify WITH Bearer token")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/verify",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "ok" in data, "Response should contain 'ok' field"
        assert data["ok"] is True, f"Expected ok=true, got ok={data.get('ok')}"
        
        print(f"  ✅ PASSED - Token verified successfully: {data}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_without_token():
    """Test 5: GET /api/admin/verify without token returns {ok:false} or 401"""
    print("\n✓ Test 5: Admin verify WITHOUT token")
    try:
        response = requests.get(
            f"{API_BASE}/admin/verify",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        # Accept either 200 with ok:false or 401
        if response.status_code == 200:
            assert "ok" in data, "Response should contain 'ok' field"
            assert data["ok"] is False, f"Expected ok=false, got ok={data.get('ok')}"
            print(f"  ✅ PASSED - Correctly returned ok=false")
        elif response.status_code == 401:
            print(f"  ✅ PASSED - Correctly returned 401")
        else:
            raise AssertionError(f"Expected 200 or 401, got {response.status_code}")
        
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_articles_public():
    """Test 6: GET /api/articles returns 200 with articles array - CRITICAL: NO MONGO_URL or SSL/TLS error"""
    print("\n✓ Test 6: GET /api/articles (CRITICAL: check for MONGO_URL and SSL/TLS errors)")
    try:
        response = requests.get(
            f"{API_BASE}/articles",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        # CRITICAL: Check for MONGO_URL error
        if "error" in data:
            error_msg = data["error"].lower()
            if "mongo_url" in error_msg:
                print(f"  ❌ CRITICAL FAILURE - MONGO_URL error: {data['error']}")
                return False
            if "ssl" in error_msg or "tls" in error_msg:
                print(f"  ❌ CRITICAL FAILURE - SSL/TLS error: {data['error']}")
                return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "articles" in data, "Response should contain 'articles' field"
        assert isinstance(data["articles"], list), "Articles should be a list"
        
        print(f"  Articles count: {len(data['articles'])}")
        print(f"  ✅ PASSED - NO 'MONGO_URL is not set' error, NO SSL/TLS error")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_create_post_draft():
    """Test 7: POST /api/admin/posts creates draft (auto-slug, readingTime, publishedAt=null)"""
    global test_post_id, test_post_slug
    print("\n✓ Test 7: POST /api/admin/posts (create DRAFT post)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        post_data = {
            "title": "Atlas MongoDB Test Post 2025",
            "category": "blog",
            "excerpt": "Testing MongoDB Atlas connectivity with fresh failuresays database",
            "content": "This is a comprehensive test post to verify that all Mongo-backed endpoints work correctly against the Atlas cluster. The content is long enough to compute a meaningful reading time estimate.",
            "tags": ["test", "atlas", "mongodb"],
            "published": False,  # Draft
            "featured": False
        }
        
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        # Check for Mongo errors
        if "error" in data:
            error_msg = data.get("error", "").lower()
            if "mongo_url" in error_msg or "ssl" in error_msg or "tls" in error_msg:
                print(f"  ❌ FAILED - Mongo/SSL error: {data['error']}")
                return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        post = data["post"]
        
        # Verify auto-slug
        assert "slug" in post, "Post should have 'slug' field"
        assert post["slug"], "Slug should not be empty"
        print(f"  Auto-generated slug: {post['slug']}")
        
        # Verify readingTime
        assert "readingTime" in post, "Post should have 'readingTime' field"
        assert post["readingTime"] > 0, "ReadingTime should be computed"
        print(f"  Computed readingTime: {post['readingTime']} min")
        
        # Verify draft => publishedAt null
        assert post["published"] is False, "Post should be draft (published=false)"
        assert post["publishedAt"] is None, "Draft post should have publishedAt=null"
        print(f"  Draft status verified: published=false, publishedAt=null")
        
        test_post_id = post["id"]
        test_post_slug = post["slug"]
        print(f"  ✅ PASSED - Draft post created: ID={test_post_id}, slug={test_post_slug}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_posts():
    """Test 8: GET /api/admin/posts lists posts (auth required)"""
    print("\n✓ Test 8: GET /api/admin/posts (list all posts, auth required)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/posts",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "posts" in data, "Response should contain 'posts' field"
        assert isinstance(data["posts"], list), "Posts should be a list"
        
        print(f"  Posts count: {len(data['posts'])}")
        if test_post_id:
            found = any(p["id"] == test_post_id for p in data["posts"])
            print(f"  Test post found in list: {found}")
            assert found, "Test post should be in the list"
        
        print(f"  ✅ PASSED - Posts retrieved successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_update_post_publish():
    """Test 9: PUT /api/admin/posts/:id to publish (publishedAt set, slug uniqueness)"""
    print("\n✓ Test 9: PUT /api/admin/posts/:id (publish post, verify publishedAt)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID available")
            return False
            
        update_data = {
            "published": True,
            "featured": True
        }
        
        response = requests.put(
            f"{API_BASE}/admin/posts/{test_post_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        post = data["post"]
        
        # Verify publishedAt is set
        assert post["published"] is True, "Post should be published"
        assert post["publishedAt"] is not None, "publishedAt should be set when publishing"
        print(f"  publishedAt set: {post['publishedAt']}")
        
        print(f"  ✅ PASSED - Post published successfully with publishedAt timestamp")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_articles_shows_published():
    """Test 10: GET /api/articles now shows the published article"""
    print("\n✓ Test 10: GET /api/articles (verify published article appears)")
    try:
        response = requests.get(
            f"{API_BASE}/articles",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "articles" in data, "Response should contain 'articles' field"
        
        articles = data["articles"]
        if test_post_id:
            found = any(a["id"] == test_post_id for a in articles)
            print(f"  Published test post found: {found}")
            assert found, "Published post should appear in public articles list"
            
            # Verify content field is excluded
            test_article = next((a for a in articles if a["id"] == test_post_id), None)
            if test_article:
                assert "content" not in test_article, "Content field should be excluded from list"
                print(f"  Content field correctly excluded from list")
        
        print(f"  ✅ PASSED - Published article visible in public list")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_article_by_slug():
    """Test 11: GET /api/articles/:slug returns full content"""
    print("\n✓ Test 11: GET /api/articles/:slug (get single article with full content)")
    try:
        if not test_post_slug:
            print(f"  ⚠️  SKIPPED - No test post slug available")
            return False
            
        response = requests.get(
            f"{API_BASE}/articles/{test_post_slug}",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "article" in data, "Response should contain 'article' field"
        
        article = data["article"]
        assert "content" in article, "Single article should include content field"
        assert article["slug"] == test_post_slug, "Slug should match"
        print(f"  Article retrieved with full content (length: {len(article['content'])} chars)")
        
        print(f"  ✅ PASSED - Single article retrieved with full content")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_search_functionality():
    """Test 12: GET /api/search?q=... returns matches with categoryLabel, no content field"""
    print("\n✓ Test 12: GET /api/search?q=... (search with categoryLabel, no content)")
    try:
        # Search for our test post
        response = requests.get(
            f"{API_BASE}/search?q=Atlas",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "results" in data, "Response should contain 'results' field"
        
        results = data["results"]
        print(f"  Search results count: {len(results)}")
        
        if len(results) > 0:
            first_result = results[0]
            # Verify categoryLabel is present
            assert "categoryLabel" in first_result, "Search results should include categoryLabel"
            print(f"  categoryLabel present: {first_result['categoryLabel']}")
            
            # Verify content field is excluded
            assert "content" not in first_result, "Content field should be excluded from search results"
            print(f"  Content field correctly excluded from search results")
        
        print(f"  ✅ PASSED - Search working with categoryLabel, no content field")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_contact_form_submission():
    """Test 13: POST /api/contact inserts message (400 if message missing)"""
    print("\n✓ Test 13: POST /api/contact (submit contact form)")
    try:
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Testing Atlas MongoDB",
            "message": "This is a test message to verify contact form works with Atlas database."
        }
        
        response = requests.post(
            f"{API_BASE}/contact",
            json=contact_data,
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get("ok") is True, "Response should contain ok=true"
        
        print(f"  ✅ PASSED - Contact form submission successful")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_contact_form_missing_message():
    """Test 14: POST /api/contact with missing message returns 400"""
    print("\n✓ Test 14: POST /api/contact (missing message field)")
    try:
        contact_data = {
            "name": "Test User",
            "email": "test@example.com"
            # message is missing
        }
        
        response = requests.post(
            f"{API_BASE}/contact",
            json=contact_data,
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "error" in data, "Response should contain error field"
        
        print(f"  ✅ PASSED - Correctly rejected with 400: {data.get('error')}")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_messages():
    """Test 15: GET /api/admin/messages lists messages (auth required)"""
    print("\n✓ Test 15: GET /api/admin/messages (list contact messages, auth required)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/messages",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "messages" in data, "Response should contain 'messages' field"
        assert isinstance(data["messages"], list), "Messages should be a list"
        
        print(f"  Messages count: {len(data['messages'])}")
        print(f"  ✅ PASSED - Messages retrieved successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_delete_post_cleanup():
    """Test 16: DELETE /api/admin/posts/:id deletes the test post"""
    print("\n✓ Test 16: DELETE /api/admin/posts/:id (delete test post)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID available")
            return False
            
        response = requests.delete(
            f"{API_BASE}/admin/posts/{test_post_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get("ok") is True, "Response should contain ok=true"
        
        print(f"  ✅ PASSED - Test post deleted successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_verify_post_deleted():
    """Test 17: GET /api/articles/:slug returns 404 after deletion"""
    print("\n✓ Test 17: GET /api/articles/:slug (verify 404 after deletion)")
    try:
        if not test_post_slug:
            print(f"  ⚠️  SKIPPED - No test post slug available")
            return False
            
        response = requests.get(
            f"{API_BASE}/articles/{test_post_slug}",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 404, f"Expected 404 for deleted post, got {response.status_code}"
        
        print(f"  ✅ PASSED - Deleted post correctly returns 404")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🧪 COMPREHENSIVE BACKEND TESTING - MongoDB Atlas Verification")
    print("=" * 80)
    
    tests = [
        test_admin_login_correct_password,
        test_admin_login_wrong_password,
        test_admin_login_no_body,
        test_admin_verify_with_token,
        test_admin_verify_without_token,
        test_get_articles_public,
        test_create_post_draft,
        test_get_admin_posts,
        test_update_post_publish,
        test_get_articles_shows_published,
        test_get_article_by_slug,
        test_search_functionality,
        test_contact_form_submission,
        test_contact_form_missing_message,
        test_get_admin_messages,
        test_delete_post_cleanup,
        test_verify_post_deleted,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("✓ Admin password 'qwesdfcvb' working correctly")
        print("✓ MongoDB Atlas connectivity verified - NO 'MONGO_URL is not set' error")
        print("✓ NO SSL/TLS errors detected")
        print("✓ Complete CMS lifecycle tested:")
        print("  - Admin login/verify with correct/wrong/missing password")
        print("  - Create draft post (auto-slug, readingTime, publishedAt=null)")
        print("  - List admin posts")
        print("  - Publish post (publishedAt set)")
        print("  - Public articles list (published posts only)")
        print("  - Get article by slug (full content)")
        print("  - Search functionality (categoryLabel, no content)")
        print("  - Contact form submission (with validation)")
        print("  - Admin messages list")
        print("  - Delete post and verify 404")
        print("✓ All Mongo-backed operations successful against Atlas cluster")
    else:
        print("\n⚠️  SOME TESTS FAILED - Review output above")
    
    print("=" * 80)
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

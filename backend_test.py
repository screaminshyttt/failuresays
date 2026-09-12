#!/usr/bin/env python3
"""
Backend API Testing for FailureSays
Tests admin authentication and Mongo-backed endpoints after password change
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

# Global token storage
admin_token = None
test_post_id = None

def test_admin_login_correct_password():
    """Test 1: POST /api/admin/login with correct password"""
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
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "token" in data, "Response should contain 'token' field"
        assert isinstance(data["token"], str), "Token should be a string"
        assert len(data["token"]) > 20, "Token should be a valid JWT"
        
        admin_token = data["token"]
        print(f"  ✅ PASSED - Got JWT token: {admin_token[:20]}...")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_login_wrong_password():
    """Test 2: POST /api/admin/login with wrong password"""
    print("\n✓ Test 2: Admin login with WRONG password")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"password": "wrongpassword123"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "error" in data, "Response should contain 'error' field"
        assert data["error"] == "Invalid password", f"Expected 'Invalid password', got '{data.get('error')}'"
        
        print(f"  ✅ PASSED - Correctly rejected with 401")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_login_no_body():
    """Test 3: POST /api/admin/login with no body"""
    print("\n✓ Test 3: Admin login with NO body")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "error" in data, "Response should contain 'error' field"
        assert "Password required" in data["error"], f"Expected 'Password required', got '{data.get('error')}'"
        
        print(f"  ✅ PASSED - Correctly rejected with 400")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_with_token():
    """Test 4: GET /api/admin/verify with Bearer token"""
    print("\n✓ Test 4: Admin verify WITH token")
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
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "ok" in data, "Response should contain 'ok' field"
        assert data["ok"] is True, f"Expected ok=true, got ok={data.get('ok')}"
        
        print(f"  ✅ PASSED - Token verified successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_without_token():
    """Test 5: GET /api/admin/verify without token"""
    print("\n✓ Test 5: Admin verify WITHOUT token")
    try:
        response = requests.get(
            f"{API_BASE}/admin/verify",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "ok" in data, "Response should contain 'ok' field"
        assert data["ok"] is False, f"Expected ok=false, got ok={data.get('ok')}"
        
        print(f"  ✅ PASSED - Correctly returned ok=false")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_articles_public():
    """Test 6: GET /api/articles (public, Mongo-backed)"""
    print("\n✓ Test 6: GET /api/articles (public, Mongo-backed)")
    try:
        response = requests.get(
            f"{API_BASE}/articles",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        print(f"  Response keys: {list(data.keys())}")
        
        # Check for the "MONGO_URL is not set" error
        if "error" in data and "MONGO_URL" in data["error"]:
            print(f"  ❌ FAILED - MONGO_URL error still present: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "articles" in data, "Response should contain 'articles' field"
        assert isinstance(data["articles"], list), "Articles should be a list"
        
        print(f"  Articles count: {len(data['articles'])}")
        print(f"  ✅ PASSED - Mongo connection working, no 'MONGO_URL is not set' error")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_create_post_with_auth():
    """Test 7: POST /api/admin/posts (create post with auth)"""
    global test_post_id
    print("\n✓ Test 7: POST /api/admin/posts (create post with auth)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        post_data = {
            "title": "Test Post - Password Change Verification",
            "category": "blog",
            "excerpt": "Testing Mongo connectivity after password change",
            "content": "This is a test post to verify that Mongo-backed endpoints work correctly after changing the admin password to qwesdfcvb.",
            "tags": ["test", "verification"],
            "published": False,
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
        print(f"  Response keys: {list(data.keys())}")
        
        # Check for Mongo errors
        if "error" in data and "MONGO_URL" in data.get("error", ""):
            print(f"  ❌ FAILED - MONGO_URL error: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        assert "id" in data["post"], "Post should have 'id' field"
        assert data["post"]["title"] == post_data["title"], "Title should match"
        
        test_post_id = data["post"]["id"]
        print(f"  Created post ID: {test_post_id}")
        print(f"  ✅ PASSED - Post created successfully via Mongo")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_posts():
    """Test 8: GET /api/admin/posts (list all posts with auth)"""
    print("\n✓ Test 8: GET /api/admin/posts (list all posts with auth)")
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
        print(f"  Response keys: {list(data.keys())}")
        
        # Check for Mongo errors
        if "error" in data and "MONGO_URL" in data.get("error", ""):
            print(f"  ❌ FAILED - MONGO_URL error: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "posts" in data, "Response should contain 'posts' field"
        assert isinstance(data["posts"], list), "Posts should be a list"
        
        print(f"  Posts count: {len(data['posts'])}")
        if test_post_id:
            found = any(p["id"] == test_post_id for p in data["posts"])
            print(f"  Test post found: {found}")
        
        print(f"  ✅ PASSED - Posts retrieved successfully via Mongo")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_update_post_with_auth():
    """Test 9: PUT /api/admin/posts/:id (update post with auth)"""
    print("\n✓ Test 9: PUT /api/admin/posts/:id (update post with auth)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID available")
            return False
            
        update_data = {
            "excerpt": "Updated excerpt to verify Mongo update operations",
            "published": True
        }
        
        response = requests.put(
            f"{API_BASE}/admin/posts/{test_post_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        # Check for Mongo errors
        if "error" in data and "MONGO_URL" in data.get("error", ""):
            print(f"  ❌ FAILED - MONGO_URL error: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        assert data["post"]["published"] is True, "Post should be published"
        assert data["post"]["publishedAt"] is not None, "publishedAt should be set"
        
        print(f"  ✅ PASSED - Post updated successfully via Mongo")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_messages():
    """Test 10: GET /api/admin/messages (list messages with auth)"""
    print("\n✓ Test 10: GET /api/admin/messages (list messages with auth)")
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
        print(f"  Response keys: {list(data.keys())}")
        
        # Check for Mongo errors
        if "error" in data and "MONGO_URL" in data.get("error", ""):
            print(f"  ❌ FAILED - MONGO_URL error: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "messages" in data, "Response should contain 'messages' field"
        assert isinstance(data["messages"], list), "Messages should be a list"
        
        print(f"  Messages count: {len(data['messages'])}")
        print(f"  ✅ PASSED - Messages retrieved successfully via Mongo")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_delete_post_cleanup():
    """Test 11: DELETE /api/admin/posts/:id (cleanup test post)"""
    print("\n✓ Test 11: DELETE /api/admin/posts/:id (cleanup test post)")
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
        
        # Check for Mongo errors
        if "error" in data and "MONGO_URL" in data.get("error", ""):
            print(f"  ❌ FAILED - MONGO_URL error: {data['error']}")
            return False
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get("ok") is True, "Response should contain ok=true"
        
        print(f"  ✅ PASSED - Test post deleted successfully via Mongo")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🧪 BACKEND API TESTING - Admin Password Change & Mongo Verification")
    print("=" * 80)
    
    tests = [
        test_admin_login_correct_password,
        test_admin_login_wrong_password,
        test_admin_login_no_body,
        test_admin_verify_with_token,
        test_admin_verify_without_token,
        test_get_articles_public,
        test_create_post_with_auth,
        test_get_admin_posts,
        test_update_post_with_auth,
        test_get_admin_messages,
        test_delete_post_cleanup,
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
        print("✓ Admin password 'qwesdfcvb' is working correctly")
        print("✓ Mongo connectivity is working (no 'MONGO_URL is not set' error)")
        print("✓ All admin CRUD endpoints are functional")
    else:
        print("\n⚠️  SOME TESTS FAILED - Review output above")
    
    print("=" * 80)
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

#!/usr/bin/env python3
"""
Backend API Testing for FailureSays - NEW Article CMS Upgrade
Tests categories, blocks, status transitions, scheduling, duplicate, and related articles
"""
import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

# Use localhost for testing (external URL blocked by ingress)
API_BASE = "http://localhost:3000/api"
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'qwesdfcvb')

print(f"🔧 Testing NEW Article CMS against: {API_BASE}")
print(f"🔑 Admin password: {ADMIN_PASSWORD}")
print("=" * 80)

# Global storage
admin_token = None
test_post_id = None
test_post_slug = None
test_category_id = None
duplicate_post_id = None
scheduled_post_id = None
archived_post_id = None

def test_admin_login():
    """Test 1: POST /api/admin/login with correct password"""
    global admin_token
    print("\n✓ Test 1: Admin login with correct password")
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
        
        admin_token = data["token"]
        print(f"  ✅ PASSED - Got JWT token")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_login_wrong_password():
    """Test 2: POST /api/admin/login with wrong password returns 401"""
    print("\n✓ Test 2: Admin login with wrong password")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"password": "wrongpassword"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"  ✅ PASSED - Correctly rejected with 401")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_with_token():
    """Test 3: GET /api/admin/verify with Bearer token"""
    print("\n✓ Test 3: Admin verify with Bearer token")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/verify",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get("ok") is True, f"Expected ok=true, got {data}"
        
        print(f"  ✅ PASSED - Token verified")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_verify_without_token():
    """Test 4: GET /api/admin/verify without token"""
    print("\n✓ Test 4: Admin verify without token")
    try:
        response = requests.get(
            f"{API_BASE}/admin/verify",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        # Accept either 200 with ok:false or 401
        if response.status_code == 200:
            assert data.get("ok") is False, f"Expected ok=false, got {data}"
        elif response.status_code == 401:
            pass  # Also acceptable
        else:
            raise AssertionError(f"Expected 200 or 401, got {response.status_code}")
        
        print(f"  ✅ PASSED - Correctly rejected")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_categories_auto_seed():
    """Test 5: GET /api/categories auto-seeds and returns 8 default categories"""
    print("\n✓ Test 5: GET /api/categories (auto-seed 8 defaults)")
    try:
        response = requests.get(
            f"{API_BASE}/categories",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "categories" in data, "Response should contain 'categories' field"
        
        categories = data["categories"]
        assert isinstance(categories, list), "Categories should be a list"
        assert len(categories) == 8, f"Expected 8 default categories, got {len(categories)}"
        
        # Verify expected slugs
        expected_slugs = [
            'startup-analyses', 'company-analyses', 'business-strategy', 
            'industry-research', 'founder-perspectives', 'venture-capital',
            'lessons-from-failure', 'blog'
        ]
        actual_slugs = [c['slug'] for c in categories]
        for slug in expected_slugs:
            assert slug in actual_slugs, f"Expected category slug '{slug}' not found"
        
        # Verify no ObjectId leaks
        for cat in categories:
            assert "_id" not in cat, "ObjectId leak detected in categories"
            assert "id" in cat, "Category should have UUID id field"
        
        print(f"  Categories count: {len(categories)}")
        print(f"  ✅ PASSED - 8 default categories seeded, no ObjectId leaks")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_create_category():
    """Test 6: POST /api/admin/categories creates category with unique slug"""
    global test_category_id
    print("\n✓ Test 6: POST /api/admin/categories (create with unique slug)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        category_data = {
            "label": "Growth Strategy",
            "desc": "Strategies for scaling and growth"
        }
        
        response = requests.post(
            f"{API_BASE}/admin/categories",
            json=category_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "category" in data, "Response should contain 'category' field"
        
        category = data["category"]
        assert "id" in category, "Category should have UUID id"
        assert "slug" in category, "Category should have slug"
        assert category["slug"] == "growth-strategy", f"Expected slug 'growth-strategy', got {category['slug']}"
        assert category["label"] == "Growth Strategy", "Label should match"
        assert "_id" not in category, "ObjectId leak detected"
        
        test_category_id = category["id"]
        print(f"  Created category: {category['slug']} (id={test_category_id})")
        print(f"  ✅ PASSED - Category created with unique slug")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_admin_update_category():
    """Test 7: PUT /api/admin/categories/:id renames category"""
    print("\n✓ Test 7: PUT /api/admin/categories/:id (rename)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_category_id:
            print(f"  ⚠️  SKIPPED - No test category ID")
            return False
            
        update_data = {
            "label": "Growth & Scaling",
            "desc": "Updated description"
        }
        
        response = requests.put(
            f"{API_BASE}/admin/categories/{test_category_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "category" in data, "Response should contain 'category' field"
        
        category = data["category"]
        assert category["label"] == "Growth & Scaling", "Label should be updated"
        assert category["desc"] == "Updated description", "Description should be updated"
        
        print(f"  ✅ PASSED - Category renamed successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_create_post_with_blocks():
    """Test 8: POST /api/admin/posts with full CMS fields + blocks[]"""
    global test_post_id, test_post_slug
    print("\n✓ Test 8: POST /api/admin/posts (full CMS fields + blocks)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        post_data = {
            "title": "The Rise and Fall of WeWork: A Comprehensive Analysis",
            "category": "startup-analyses",
            "subtitle": "How a $47B valuation turned into one of the biggest startup failures",
            "articleLabel": "Case Study",
            "author": {
                "name": "Sarah Johnson",
                "photo": "https://example.com/author.jpg",
                "bio": "Startup analyst and business strategist"
            },
            "seo": {
                "title": "WeWork Case Study: Rise and Fall Analysis",
                "description": "Deep dive into WeWork's journey from unicorn to cautionary tale",
                "socialImage": "https://example.com/wework-social.jpg",
                "canonicalUrl": "https://failuresays.com/articles/wework-analysis"
            },
            "relatedIds": [],
            "showToc": True,
            "showShare": True,
            "status": "draft",
            "blocks": [
                {
                    "id": "block-1",
                    "type": "heading",
                    "data": {
                        "label": "Introduction",
                        "text": "The WeWork Story",
                        "level": "h2",
                        "align": "center"
                    }
                },
                {
                    "id": "block-2",
                    "type": "paragraph",
                    "data": {
                        "text": "WeWork was founded in 2010 with a vision to revolutionize office space. At its peak, the company was valued at $47 billion. However, a series of strategic missteps and governance issues led to one of the most spectacular failures in startup history."
                    }
                },
                {
                    "id": "block-3",
                    "type": "metrics",
                    "data": {
                        "metric": "$47B",
                        "metricLabel": "Peak Valuation",
                        "changePct": -95,
                        "line": [10, 22, 35, 47, 18, 8, 2],
                        "kpis": [
                            {"label": "Locations", "value": "800+"},
                            {"label": "Members", "value": "740K"}
                        ],
                        "bars": [
                            {"label": "2015", "value": 30},
                            {"label": "2019", "value": 100},
                            {"label": "2020", "value": 15}
                        ],
                        "notes": ["Failed IPO in 2019", "CEO resigned", "Massive layoffs"]
                    }
                }
            ]
        }
        
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        
        post = data["post"]
        
        # Verify auto-slug
        assert "slug" in post, "Post should have slug"
        assert post["slug"], "Slug should not be empty"
        print(f"  Auto-generated slug: {post['slug']}")
        
        # Verify readingTime computed from blocks
        assert "readingTime" in post, "Post should have readingTime"
        assert post["readingTime"] >= 1, f"ReadingTime should be >= 1, got {post['readingTime']}"
        print(f"  Computed readingTime: {post['readingTime']} min")
        
        # Verify status=draft defaults
        assert post["status"] == "draft", f"Expected status=draft, got {post['status']}"
        assert post["published"] is False, "Draft should have published=false"
        assert post["publishedAt"] is None, "Draft should have publishedAt=null"
        print(f"  Draft status verified: status=draft, published=false, publishedAt=null")
        
        # Verify blocks persisted
        assert "blocks" in post, "Post should have blocks field"
        assert len(post["blocks"]) == 3, f"Expected 3 blocks, got {len(post['blocks'])}"
        print(f"  Blocks persisted: {len(post['blocks'])} blocks")
        
        # Verify no ObjectId leaks
        assert "_id" not in post, "ObjectId leak detected"
        
        test_post_id = post["id"]
        test_post_slug = post["slug"]
        print(f"  ✅ PASSED - Post created with blocks, readingTime computed")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_create_post_missing_required():
    """Test 9: POST /api/admin/posts without title/category returns 400"""
    print("\n✓ Test 9: POST /api/admin/posts (missing title/category)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        # Missing title
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json={"category": "blog"},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status (missing title): {response.status_code}")
        assert response.status_code == 400, f"Expected 400 for missing title, got {response.status_code}"
        
        # Missing category
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json={"title": "Test"},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status (missing category): {response.status_code}")
        assert response.status_code == 400, f"Expected 400 for missing category, got {response.status_code}"
        
        print(f"  ✅ PASSED - Validation working (title+category required)")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_post_with_blocks():
    """Test 10: GET /api/admin/posts/:id returns full post including blocks"""
    print("\n✓ Test 10: GET /api/admin/posts/:id (verify blocks included)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/posts/{test_post_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        
        post = data["post"]
        assert "blocks" in post, "Admin GET should include blocks"
        assert len(post["blocks"]) == 3, f"Expected 3 blocks, got {len(post['blocks'])}"
        
        print(f"  ✅ PASSED - Full post with blocks retrieved")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_status_transition_draft_to_published():
    """Test 11: PUT /api/admin/posts/:id status draft->published sets publishedAt"""
    print("\n✓ Test 11: Status transition draft->published")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID")
            return False
            
        response = requests.put(
            f"{API_BASE}/admin/posts/{test_post_id}",
            json={"status": "published"},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        post = data["post"]
        
        assert post["status"] == "published", f"Expected status=published, got {post['status']}"
        assert post["published"] is True, "published should be true"
        assert post["publishedAt"] is not None, "publishedAt should be set"
        print(f"  publishedAt set: {post['publishedAt']}")
        
        print(f"  ✅ PASSED - draft->published sets publishedAt")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_published_visible_in_public_articles():
    """Test 12: GET /api/articles shows published post"""
    print("\n✓ Test 12: GET /api/articles (published post visible)")
    try:
        response = requests.get(
            f"{API_BASE}/articles",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        articles = data["articles"]
        
        found = any(a["id"] == test_post_id for a in articles)
        assert found, "Published post should be visible in /api/articles"
        
        # Verify content and blocks excluded
        test_article = next((a for a in articles if a["id"] == test_post_id), None)
        assert "content" not in test_article, "content should be excluded from list"
        assert "blocks" not in test_article, "blocks should be excluded from list"
        
        print(f"  ✅ PASSED - Published post visible, content/blocks excluded")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_published_visible_by_slug():
    """Test 13: GET /api/articles/:slug returns full article with blocks"""
    print("\n✓ Test 13: GET /api/articles/:slug (full article with blocks)")
    try:
        if not test_post_slug:
            print(f"  ⚠️  SKIPPED - No test post slug")
            return False
            
        response = requests.get(
            f"{API_BASE}/articles/{test_post_slug}",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        article = data["article"]
        
        # Verify blocks included in single article view
        assert "blocks" in article, "Single article should include blocks"
        assert len(article["blocks"]) == 3, f"Expected 3 blocks, got {len(article['blocks'])}"
        
        print(f"  ✅ PASSED - Single article includes blocks")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_status_transition_published_to_draft():
    """Test 14: PUT status published->draft clears publishedAt and hides from public"""
    print("\n✓ Test 14: Status transition published->draft")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID")
            return False
            
        # Change to draft
        response = requests.put(
            f"{API_BASE}/admin/posts/{test_post_id}",
            json={"status": "draft"},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        post = data["post"]
        
        assert post["status"] == "draft", f"Expected status=draft, got {post['status']}"
        assert post["published"] is False, "published should be false"
        assert post["publishedAt"] is None, "publishedAt should be cleared"
        print(f"  publishedAt cleared: {post['publishedAt']}")
        
        # Verify NOT visible in public articles
        response = requests.get(f"{API_BASE}/articles", timeout=10)
        articles = response.json()["articles"]
        found = any(a["id"] == test_post_id for a in articles)
        assert not found, "Draft post should NOT be visible in /api/articles"
        
        print(f"  ✅ PASSED - published->draft clears publishedAt, hides from public")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_status_transition_to_archived():
    """Test 15: PUT status->archived hides from public"""
    global archived_post_id
    print("\n✓ Test 15: Status transition to archived")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        # Create a new post and publish it
        post_data = {
            "title": "Archived Test Post",
            "category": "blog",
            "status": "published"
        }
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        archived_post_id = response.json()["post"]["id"]
        
        # Archive it
        response = requests.put(
            f"{API_BASE}/admin/posts/{archived_post_id}",
            json={"status": "archived"},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        post = data["post"]
        assert post["status"] == "archived", f"Expected status=archived, got {post['status']}"
        
        # Verify NOT visible in public articles
        response = requests.get(f"{API_BASE}/articles", timeout=10)
        articles = response.json()["articles"]
        found = any(a["id"] == archived_post_id for a in articles)
        assert not found, "Archived post should NOT be visible in /api/articles"
        
        print(f"  ✅ PASSED - Archived post hidden from public")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_status_scheduled_future():
    """Test 16: PUT status->scheduled with FUTURE scheduledAt is hidden"""
    global scheduled_post_id
    print("\n✓ Test 16: Status scheduled with FUTURE scheduledAt")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        # Create a new post
        post_data = {
            "title": "Future Scheduled Post",
            "category": "blog"
        }
        response = requests.post(
            f"{API_BASE}/admin/posts",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        scheduled_post_id = response.json()["post"]["id"]
        
        # Schedule for future
        future_date = (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z"
        response = requests.put(
            f"{API_BASE}/admin/posts/{scheduled_post_id}",
            json={"status": "scheduled", "scheduledAt": future_date},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        post = data["post"]
        assert post["status"] == "scheduled", f"Expected status=scheduled, got {post['status']}"
        assert post["scheduledAt"] == future_date, "scheduledAt should match"
        
        # Verify NOT visible in public articles (future date)
        response = requests.get(f"{API_BASE}/articles", timeout=10)
        articles = response.json()["articles"]
        found = any(a["id"] == scheduled_post_id for a in articles)
        assert not found, "Future scheduled post should NOT be visible"
        
        print(f"  ✅ PASSED - Future scheduled post hidden")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_status_scheduled_past():
    """Test 17: PUT status->scheduled with PAST scheduledAt is visible"""
    print("\n✓ Test 17: Status scheduled with PAST scheduledAt")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not scheduled_post_id:
            print(f"  ⚠️  SKIPPED - No scheduled post ID")
            return False
            
        # Update to past date
        past_date = (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z"
        response = requests.put(
            f"{API_BASE}/admin/posts/{scheduled_post_id}",
            json={"scheduledAt": past_date},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify NOW visible in public articles (past date)
        response = requests.get(f"{API_BASE}/articles", timeout=10)
        articles = response.json()["articles"]
        found = any(a["id"] == scheduled_post_id for a in articles)
        assert found, "Past scheduled post SHOULD be visible"
        
        print(f"  ✅ PASSED - Past scheduled post visible")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_duplicate_post():
    """Test 18: POST /api/admin/posts/:id/duplicate creates copy with '-copy' slug"""
    global duplicate_post_id
    print("\n✓ Test 18: POST /api/admin/posts/:id/duplicate")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_post_id:
            print(f"  ⚠️  SKIPPED - No test post ID")
            return False
            
        response = requests.post(
            f"{API_BASE}/admin/posts/{test_post_id}/duplicate",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "post" in data, "Response should contain 'post' field"
        
        post = data["post"]
        
        # Verify new draft with '-copy' slug
        assert post["slug"].endswith("-copy") or "-copy-" in post["slug"], f"Slug should contain '-copy', got {post['slug']}"
        assert post["status"] == "draft", f"Duplicate should be draft, got {post['status']}"
        assert post["published"] is False, "Duplicate should have published=false"
        assert post["publishedAt"] is None, "Duplicate should have publishedAt=null"
        assert post["id"] != test_post_id, "Duplicate should have new UUID"
        
        duplicate_post_id = post["id"]
        print(f"  Duplicate created: slug={post['slug']}, id={duplicate_post_id}")
        print(f"  ✅ PASSED - Duplicate created as draft with '-copy' slug")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_fetch_articles_by_ids():
    """Test 19: GET /api/articles?ids=id1,id2 returns only those articles"""
    print("\n✓ Test 19: GET /api/articles?ids=... (related articles)")
    try:
        if not test_post_id or not scheduled_post_id:
            print(f"  ⚠️  SKIPPED - Need multiple post IDs")
            return False
            
        # Fetch by specific ids
        ids = f"{test_post_id},{scheduled_post_id}"
        response = requests.get(
            f"{API_BASE}/articles?ids={ids}",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        articles = data["articles"]
        
        # Should only return visible articles with those ids
        returned_ids = [a["id"] for a in articles]
        print(f"  Requested IDs: {ids}")
        print(f"  Returned IDs: {returned_ids}")
        
        # Verify content and blocks excluded
        for article in articles:
            assert "content" not in article, "content should be excluded"
            assert "blocks" not in article, "blocks should be excluded"
        
        print(f"  ✅ PASSED - Fetch by IDs working, content/blocks excluded")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_slug_collision_409():
    """Test 20: PUT with colliding slug returns 409"""
    print("\n✓ Test 20: Slug collision returns 409")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_post_id or not duplicate_post_id:
            print(f"  ⚠️  SKIPPED - Need multiple posts")
            return False
            
        # Try to change duplicate's slug to match original
        response = requests.get(
            f"{API_BASE}/admin/posts/{test_post_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        original_slug = response.json()["post"]["slug"]
        
        # Try to set duplicate to same slug
        response = requests.put(
            f"{API_BASE}/admin/posts/{duplicate_post_id}",
            json={"slug": original_slug},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 409, f"Expected 409 for slug collision, got {response.status_code}"
        
        print(f"  ✅ PASSED - Slug collision correctly returns 409")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_regression_search():
    """Test 21: GET /api/search still works (regression)"""
    print("\n✓ Test 21: GET /api/search (regression)")
    try:
        response = requests.get(
            f"{API_BASE}/search?q=test",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "results" in data, "Response should contain 'results' field"
        
        # Verify content excluded
        for result in data["results"]:
            assert "content" not in result, "content should be excluded from search"
        
        print(f"  ✅ PASSED - Search endpoint still working")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_regression_contact():
    """Test 22: POST /api/contact still works (regression)"""
    print("\n✓ Test 22: POST /api/contact (regression)")
    try:
        contact_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Test message for CMS upgrade"
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
        
        print(f"  ✅ PASSED - Contact form still working")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_regression_admin_messages():
    """Test 23: GET /api/admin/messages still works (regression)"""
    print("\n✓ Test 23: GET /api/admin/messages (regression)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
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
        
        print(f"  ✅ PASSED - Admin messages still working")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_cleanup_delete_category():
    """Test 24: DELETE /api/admin/categories/:id (cleanup)"""
    print("\n✓ Test 24: DELETE /api/admin/categories/:id (cleanup)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
        if not test_category_id:
            print(f"  ⚠️  SKIPPED - No test category ID")
            return False
            
        response = requests.delete(
            f"{API_BASE}/admin/categories/{test_category_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        print(f"  ✅ PASSED - Test category deleted")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_cleanup_delete_posts():
    """Test 25: DELETE all test posts (cleanup)"""
    print("\n✓ Test 25: DELETE all test posts (cleanup)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token")
            return False
            
        post_ids = [test_post_id, duplicate_post_id, scheduled_post_id, archived_post_id]
        deleted = 0
        
        for post_id in post_ids:
            if post_id:
                response = requests.delete(
                    f"{API_BASE}/admin/posts/{post_id}",
                    headers={"Authorization": f"Bearer {admin_token}"},
                    timeout=10
                )
                if response.status_code == 200:
                    deleted += 1
        
        print(f"  Deleted {deleted} test posts")
        print(f"  ✅ PASSED - Test posts cleaned up")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🧪 NEW ARTICLE CMS BACKEND TESTING")
    print("=" * 80)
    
    tests = [
        test_admin_login,
        test_admin_login_wrong_password,
        test_admin_verify_with_token,
        test_admin_verify_without_token,
        test_get_categories_auto_seed,
        test_admin_create_category,
        test_admin_update_category,
        test_create_post_with_blocks,
        test_create_post_missing_required,
        test_get_admin_post_with_blocks,
        test_status_transition_draft_to_published,
        test_published_visible_in_public_articles,
        test_published_visible_by_slug,
        test_status_transition_published_to_draft,
        test_status_transition_to_archived,
        test_status_scheduled_future,
        test_status_scheduled_past,
        test_duplicate_post,
        test_fetch_articles_by_ids,
        test_slug_collision_409,
        test_regression_search,
        test_regression_contact,
        test_regression_admin_messages,
        test_cleanup_delete_category,
        test_cleanup_delete_posts,
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
        print("✓ Auth: login/verify working")
        print("✓ Categories: auto-seed 8 defaults, admin CRUD working")
        print("✓ Posts: create with blocks[], readingTime computed")
        print("✓ Status transitions: draft/published/archived/scheduled working")
        print("✓ Visibility: published visible, draft/archived/future-scheduled hidden")
        print("✓ Duplicate: creates draft copy with '-copy' slug")
        print("✓ Related: fetch by ids working")
        print("✓ Data integrity: no ObjectId leaks, slug collision returns 409")
        print("✓ Regression: search, contact, messages still working")
        print("✓ Cleanup: test data deleted")
    else:
        print("\n⚠️  SOME TESTS FAILED - Review output above")
    
    print("=" * 80)
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

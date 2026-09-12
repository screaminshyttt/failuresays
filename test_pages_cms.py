#!/usr/bin/env python3
"""
Page Content CMS Testing for FailureSays
Tests the NEW page content CMS endpoints (about & contact pages)
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

# Use localhost for testing since external URL returns 403
BASE_URL = 'http://localhost:3000'
API_BASE = f"{BASE_URL}/api"
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'qwesdfcvb')

print(f"🔧 Testing Page CMS against: {API_BASE}")
print(f"🔑 Admin password: {ADMIN_PASSWORD}")
print("=" * 80)

# Global storage
admin_token = None
original_about_page = None
original_contact_page = None

# Original default values for restoration
DEFAULT_ABOUT = {
    "subtitle": "An independent editorial publication on startups, strategy, and the lessons hidden inside failure.",
    "blocks": [
        {"id": "ab1", "type": "paragraph", "data": {"text": "Failure Says is an independent editorial publication dedicated to startups, entrepreneurship, venture capital, technology, innovation, and modern business."}},
        {"id": "ab2", "type": "paragraph", "data": {"text": "We produce original reporting, editorial analysis, long-form features, company case studies, founder profiles, market intelligence, and data-driven insights that help readers understand the forces shaping the global startup ecosystem."}},
        {"id": "ab3", "type": "heading", "data": {"label": "01 — Philosophy", "text": "Understanding a company requires more than following its milestones.", "level": "h2", "align": "center"}},
        {"id": "ab4", "type": "paragraph", "data": {"text": "Behind every product launch, funding round, acquisition, or breakthrough lies a series of decisions, assumptions, and moments of uncertainty that rarely receive the attention they deserve. Those are the stories we choose to examine."}},
        {"id": "ab5", "type": "paragraph", "data": {"text": "Every article is developed through research, verification, and analysis with an emphasis on accuracy, clarity, and context — connecting individual developments to the larger patterns that shape industries."}},
        {"id": "ab6", "type": "pullquote", "data": {"text": "The future of business is written not only by the companies that succeed, but by the ideas, decisions, and lessons that shape them.", "cite": ""}},
    ]
}

DEFAULT_CONTACT = {
    "email": "founder@failuresays.com",
    "showForm": True,
    "socials": [
        {"label": "Twitter", "href": "#"},
        {"label": "LinkedIn", "href": "#"},
        {"label": "GitHub", "href": "#"}
    ]
}

def get_admin_token():
    """Get admin JWT token"""
    global admin_token
    print("\n🔑 Getting admin token...")
    try:
        response = requests.post(
            f"{API_BASE}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("token")
            print(f"  ✅ Got admin token: {admin_token[:30]}...")
            return True
        else:
            print(f"  ❌ Failed to get token: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Error getting token: {str(e)}")
        return False

def test_get_about_page_public():
    """Test 1: GET /api/pages/about -> 200 with page {title:'ABOUT.', blocks:[...>=1], eyebrow, subtitle}"""
    global original_about_page
    print("\n✓ Test 1: GET /api/pages/about (public)")
    try:
        response = requests.get(
            f"{API_BASE}/pages/about",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "page" in data, "Response should contain 'page' field"
        
        page = data["page"]
        
        # Store original for restoration
        original_about_page = page
        
        # Verify required fields
        assert "title" in page, "Page should have 'title' field"
        assert page["title"] == "ABOUT.", f"Expected title 'ABOUT.', got '{page.get('title')}'"
        print(f"  ✅ Title: {page['title']}")
        
        assert "eyebrow" in page, "Page should have 'eyebrow' field"
        print(f"  ✅ Eyebrow: {page['eyebrow']}")
        
        assert "subtitle" in page, "Page should have 'subtitle' field"
        print(f"  ✅ Subtitle: {page['subtitle'][:50]}...")
        
        assert "blocks" in page, "Page should have 'blocks' field"
        assert isinstance(page["blocks"], list), "Blocks should be a list"
        assert len(page["blocks"]) >= 1, f"Expected at least 1 block, got {len(page['blocks'])}"
        print(f"  ✅ Blocks count: {len(page['blocks'])}")
        
        # Verify no _id leak
        assert "_id" not in page, "Page should not contain MongoDB _id field"
        print(f"  ✅ No _id leak detected")
        
        print(f"  ✅ PASSED - About page retrieved successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_contact_page_public():
    """Test 2: GET /api/pages/contact -> 200 with page {title:'CONTACT.', email, socials:[...>=1], showForm:true}"""
    global original_contact_page
    print("\n✓ Test 2: GET /api/pages/contact (public)")
    try:
        response = requests.get(
            f"{API_BASE}/pages/contact",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "page" in data, "Response should contain 'page' field"
        
        page = data["page"]
        
        # Store original for restoration
        original_contact_page = page
        
        # Verify required fields
        assert "title" in page, "Page should have 'title' field"
        assert page["title"] == "CONTACT.", f"Expected title 'CONTACT.', got '{page.get('title')}'"
        print(f"  ✅ Title: {page['title']}")
        
        assert "email" in page, "Page should have 'email' field"
        print(f"  ✅ Email: {page['email']}")
        
        assert "socials" in page, "Page should have 'socials' field"
        assert isinstance(page["socials"], list), "Socials should be a list"
        assert len(page["socials"]) >= 1, f"Expected at least 1 social, got {len(page['socials'])}"
        print(f"  ✅ Socials count: {len(page['socials'])}")
        
        assert "showForm" in page, "Page should have 'showForm' field"
        assert page["showForm"] is True, f"Expected showForm=true, got {page.get('showForm')}"
        print(f"  ✅ showForm: {page['showForm']}")
        
        # Verify no _id leak
        assert "_id" not in page, "Page should not contain MongoDB _id field"
        print(f"  ✅ No _id leak detected")
        
        print(f"  ✅ PASSED - Contact page retrieved successfully")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_about_without_token():
    """Test 3a: GET /api/admin/pages/about WITHOUT Bearer token -> 401"""
    print("\n✓ Test 3a: GET /api/admin/pages/about (WITHOUT token)")
    try:
        response = requests.get(
            f"{API_BASE}/admin/pages/about",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"  ✅ PASSED - Correctly rejected with 401")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_get_admin_about_with_token():
    """Test 3b: GET /api/admin/pages/about WITH valid token -> 200 returns page"""
    print("\n✓ Test 3b: GET /api/admin/pages/about (WITH token)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        response = requests.get(
            f"{API_BASE}/admin/pages/about",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "page" in data, "Response should contain 'page' field"
        
        page = data["page"]
        assert "title" in page, "Page should have 'title' field"
        assert page["title"] == "ABOUT.", f"Expected title 'ABOUT.', got '{page.get('title')}'"
        
        print(f"  ✅ PASSED - Admin endpoint returns page with auth")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_update_about_page():
    """Test 4: PUT /api/admin/pages/about (auth) updates subtitle and blocks, verify persistence"""
    print("\n✓ Test 4: PUT /api/admin/pages/about (update subtitle and blocks)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        # Update with new subtitle and single block
        update_data = {
            "subtitle": "TEST SUB",
            "blocks": [
                {"id": "t1", "type": "paragraph", "data": {"text": "hello world"}}
            ]
        }
        
        response = requests.put(
            f"{API_BASE}/admin/pages/about",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "page" in data, "Response should contain 'page' field"
        
        page = data["page"]
        assert page["subtitle"] == "TEST SUB", f"Expected subtitle 'TEST SUB', got '{page.get('subtitle')}'"
        print(f"  ✅ Subtitle updated: {page['subtitle']}")
        
        assert len(page["blocks"]) == 1, f"Expected 1 block, got {len(page['blocks'])}"
        assert page["blocks"][0]["id"] == "t1", "Block id should be 't1'"
        assert page["blocks"][0]["type"] == "paragraph", "Block type should be 'paragraph'"
        assert page["blocks"][0]["data"]["text"] == "hello world", "Block text should be 'hello world'"
        print(f"  ✅ Blocks updated: {len(page['blocks'])} block(s)")
        
        # Verify persistence by fetching again
        print("  🔄 Verifying persistence...")
        verify_response = requests.get(
            f"{API_BASE}/pages/about",
            timeout=10
        )
        verify_data = verify_response.json()
        verify_page = verify_data["page"]
        
        assert verify_page["subtitle"] == "TEST SUB", f"Persisted subtitle mismatch: '{verify_page.get('subtitle')}'"
        assert len(verify_page["blocks"]) == 1, f"Persisted blocks count mismatch: {len(verify_page['blocks'])}"
        assert verify_page["blocks"][0]["data"]["text"] == "hello world", "Persisted block text mismatch"
        print(f"  ✅ Persistence verified: subtitle and blocks persisted correctly")
        
        print(f"  ✅ PASSED - About page updated and persisted")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_update_contact_page():
    """Test 5: PUT /api/admin/pages/contact (auth) updates email, socials, showForm, verify persistence"""
    print("\n✓ Test 5: PUT /api/admin/pages/contact (update email, socials, showForm)")
    try:
        if not admin_token:
            print(f"  ⚠️  SKIPPED - No admin token available")
            return False
            
        # Update with new email, socials, and showForm
        update_data = {
            "email": "hi@x.com",
            "socials": [
                {"label": "X", "href": "#"}
            ],
            "showForm": False
        }
        
        response = requests.put(
            f"{API_BASE}/admin/pages/contact",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "page" in data, "Response should contain 'page' field"
        
        page = data["page"]
        assert page["email"] == "hi@x.com", f"Expected email 'hi@x.com', got '{page.get('email')}'"
        print(f"  ✅ Email updated: {page['email']}")
        
        assert len(page["socials"]) == 1, f"Expected 1 social, got {len(page['socials'])}"
        assert page["socials"][0]["label"] == "X", "Social label should be 'X'"
        print(f"  ✅ Socials updated: {len(page['socials'])} social(s)")
        
        assert page["showForm"] is False, f"Expected showForm=false, got {page.get('showForm')}"
        print(f"  ✅ showForm updated: {page['showForm']}")
        
        # Verify persistence by fetching again
        print("  🔄 Verifying persistence...")
        verify_response = requests.get(
            f"{API_BASE}/pages/contact",
            timeout=10
        )
        verify_data = verify_response.json()
        verify_page = verify_data["page"]
        
        assert verify_page["email"] == "hi@x.com", f"Persisted email mismatch: '{verify_page.get('email')}'"
        assert len(verify_page["socials"]) == 1, f"Persisted socials count mismatch: {len(verify_page['socials'])}"
        assert verify_page["showForm"] is False, f"Persisted showForm mismatch: {verify_page.get('showForm')}"
        print(f"  ✅ Persistence verified: email, socials, and showForm persisted correctly")
        
        print(f"  ✅ PASSED - Contact page updated and persisted")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_unknown_page_404():
    """Test 6: GET /api/pages/nope -> 404"""
    print("\n✓ Test 6: GET /api/pages/nope (unknown slug)")
    try:
        response = requests.get(
            f"{API_BASE}/pages/nope",
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"  ✅ PASSED - Unknown page correctly returns 404")
        return True
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def restore_about_page():
    """CRITICAL: Restore about page to original defaults"""
    print("\n🔄 RESTORING About page to original defaults...")
    try:
        if not admin_token:
            print(f"  ⚠️  Cannot restore - No admin token available")
            return False
            
        restore_data = {
            "subtitle": DEFAULT_ABOUT["subtitle"],
            "blocks": DEFAULT_ABOUT["blocks"]
        }
        
        response = requests.put(
            f"{API_BASE}/admin/pages/about",
            json=restore_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            page = data["page"]
            
            # Verify restoration
            verify_response = requests.get(f"{API_BASE}/pages/about", timeout=10)
            verify_page = verify_response.json()["page"]
            
            subtitle_match = verify_page["subtitle"] == DEFAULT_ABOUT["subtitle"]
            blocks_count_match = len(verify_page["blocks"]) == 6
            
            print(f"  ✅ Subtitle restored: {subtitle_match}")
            print(f"  ✅ Blocks count restored (6 blocks): {blocks_count_match}")
            
            if subtitle_match and blocks_count_match:
                print(f"  ✅ About page FULLY RESTORED to original defaults")
                return True
            else:
                print(f"  ⚠️  About page PARTIALLY restored (check manually)")
                return False
        else:
            print(f"  ❌ Failed to restore: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Error restoring: {str(e)}")
        return False

def restore_contact_page():
    """CRITICAL: Restore contact page to original defaults"""
    print("\n🔄 RESTORING Contact page to original defaults...")
    try:
        if not admin_token:
            print(f"  ⚠️  Cannot restore - No admin token available")
            return False
            
        restore_data = {
            "email": DEFAULT_CONTACT["email"],
            "showForm": DEFAULT_CONTACT["showForm"],
            "socials": DEFAULT_CONTACT["socials"]
        }
        
        response = requests.put(
            f"{API_BASE}/admin/pages/contact",
            json=restore_data,
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            page = data["page"]
            
            # Verify restoration
            verify_response = requests.get(f"{API_BASE}/pages/contact", timeout=10)
            verify_page = verify_response.json()["page"]
            
            email_match = verify_page["email"] == DEFAULT_CONTACT["email"]
            showForm_match = verify_page["showForm"] == DEFAULT_CONTACT["showForm"]
            socials_count_match = len(verify_page["socials"]) == 3
            
            print(f"  ✅ Email restored: {email_match} ({verify_page['email']})")
            print(f"  ✅ showForm restored: {showForm_match} ({verify_page['showForm']})")
            print(f"  ✅ Socials count restored (3 socials): {socials_count_match}")
            
            if email_match and showForm_match and socials_count_match:
                print(f"  ✅ Contact page FULLY RESTORED to original defaults")
                return True
            else:
                print(f"  ⚠️  Contact page PARTIALLY restored (check manually)")
                return False
        else:
            print(f"  ❌ Failed to restore: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Error restoring: {str(e)}")
        return False

def main():
    """Run all page CMS tests"""
    print("\n" + "=" * 80)
    print("🧪 PAGE CONTENT CMS TESTING - About & Contact Pages")
    print("=" * 80)
    
    # Get admin token first
    if not get_admin_token():
        print("\n❌ CRITICAL: Failed to get admin token. Cannot proceed with tests.")
        return False
    
    tests = [
        test_get_about_page_public,
        test_get_contact_page_public,
        test_get_admin_about_without_token,
        test_get_admin_about_with_token,
        test_update_about_page,
        test_update_contact_page,
        test_unknown_page_404,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    # CRITICAL: Always restore pages after testing
    print("\n" + "=" * 80)
    print("🔄 CRITICAL CLEANUP - Restoring pages to original state")
    print("=" * 80)
    
    about_restored = restore_about_page()
    contact_restored = restore_contact_page()
    
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"✅ Tests Passed: {passed}/{total}")
    print(f"❌ Tests Failed: {total - passed}/{total}")
    
    print("\n📋 RESTORATION STATUS:")
    print(f"  About page: {'✅ RESTORED' if about_restored else '❌ NOT RESTORED'}")
    print(f"  Contact page: {'✅ RESTORED' if contact_restored else '❌ NOT RESTORED'}")
    
    if passed == total:
        print("\n🎉 ALL PAGE CMS TESTS PASSED!")
        print("✓ GET /api/pages/about returns page with title, eyebrow, subtitle, blocks")
        print("✓ GET /api/pages/contact returns page with email, socials, showForm")
        print("✓ GET /api/admin/pages/about requires auth (401 without, 200 with)")
        print("✓ PUT /api/admin/pages/about updates and persists subtitle and blocks")
        print("✓ PUT /api/admin/pages/contact updates and persists email, socials, showForm")
        print("✓ Unknown page slug returns 404")
        print("✓ No MongoDB _id leaks detected")
    else:
        print("\n⚠️  SOME TESTS FAILED - Review output above")
    
    if not (about_restored and contact_restored):
        print("\n⚠️  WARNING: Pages were NOT fully restored to original state!")
        print("    Manual restoration may be required.")
    
    print("=" * 80)
    return passed == total and about_restored and contact_restored

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

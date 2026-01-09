#!/usr/bin/env python3
"""
Test script for profile photo upload functionality
"""
import requests
import io
import os

API_BASE_URL = "http://localhost:3000/api"
TEST_USER_EMAIL = "demo@writenow.com"
TEST_USER_PASSWORD = "Demo123!"

def create_test_image():
    """Create a simple test image in memory"""
    # Create a simple colored square using base64
    # This is a 1x1 red pixel PNG
    import base64
    png_data = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    )
    return io.BytesIO(png_data)

def login():
    """Login and get auth token"""
    print("Logging in...")
    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )

    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return None

    data = response.json()
    token = data.get("token")
    user_id = data.get("user", {}).get("id")

    print(f"SUCCESS: Logged in as {TEST_USER_EMAIL} (ID: {user_id})")
    return token, user_id

def get_current_profile(token):
    """Get current profile to see existing photo"""
    print("\nFetching current profile...")
    response = requests.get(
        f"{API_BASE_URL}/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code != 200:
        print(f"❌ Failed to get profile: {response.text}")
        return None

    profile = response.json()
    current_photo = profile.get("profile", {}).get("profilePhotoUrl")
    print(f"Current photo URL: {current_photo or 'None'}")
    return profile

def upload_photo(token):
    """Upload a test photo"""
    print("\nUploading test photo...")

    # Create test image
    image_file = create_test_image()

    # Prepare multipart form data
    files = {
        'photo': ('test_photo.png', image_file, 'image/png')
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.post(
        f"{API_BASE_URL}/profile/photo",
        headers=headers,
        files=files
    )

    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")

    if response.status_code != 200:
        print(f"❌ Upload failed: {response.text}")
        return None

    data = response.json()
    photo_url = data.get("photoUrl")
    print(f"SUCCESS: Photo uploaded successfully!")
    print(f"New photo URL: {photo_url}")
    return photo_url

def verify_photo_in_profile(token, expected_url):
    """Verify the photo URL is stored in the profile"""
    print("\nVerifying photo in profile...")
    profile = get_current_profile(token)

    if profile:
        actual_url = profile.get("profile", {}).get("profilePhotoUrl")
        if actual_url == expected_url:
            print(f"SUCCESS: Photo URL matches in profile!")
            return True
        else:
            print(f"ERROR: Photo URL mismatch!")
            print(f"   Expected: {expected_url}")
            print(f"   Actual: {actual_url}")
            return False
    return False

def test_photo_accessibility(photo_url):
    """Test if the photo URL is accessible"""
    print(f"\nTesting photo accessibility...")
    print(f"   URL: {photo_url}")

    try:
        response = requests.head(photo_url, timeout=5)
        if response.status_code == 200:
            print(f"SUCCESS: Photo is accessible (Status: {response.status_code})")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            return True
        else:
            print(f"WARNING: Photo returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: Failed to access photo: {e}")
        return False

def main():
    print("=" * 60)
    print("PROFILE PHOTO UPLOAD TEST")
    print("=" * 60)

    # Step 1: Login
    result = login()
    if not result:
        return

    token, user_id = result

    # Step 2: Check current profile
    get_current_profile(token)

    # Step 3: Upload photo
    photo_url = upload_photo(token)
    if not photo_url:
        return

    # Step 4: Verify photo in profile
    verify_photo_in_profile(token, photo_url)

    # Step 5: Test photo accessibility
    test_photo_accessibility(photo_url)

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()

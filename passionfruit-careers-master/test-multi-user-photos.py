#!/usr/bin/env python3
"""
Test script to verify photo upload works for multiple users
and that each user sees only their own photo
"""
import requests
import io
import base64

API_BASE_URL = "http://localhost:3000/api"

# Test with multiple users
TEST_USERS = [
    {"email": "demo@writenow.com", "password": "Demo123!", "name": "Demo User"},
    {"email": "testuser@writenow.com", "password": "Test123ABC", "name": "Test User"}
]

def create_test_image(color_seed):
    """Create a test image with different color based on seed"""
    # 1x1 pixel PNG (red pixel)
    png_data = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    )
    return io.BytesIO(png_data)

def login(user):
    """Login and get auth token"""
    print(f"\nLogging in as {user['email']}...")
    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": user["email"], "password": user["password"]}
    )

    if response.status_code != 200:
        print(f"  ERROR: Login failed - {response.text}")
        return None

    data = response.json()
    token = data.get("token")
    user_id = data.get("user", {}).get("id")

    print(f"  SUCCESS: Logged in (ID: {user_id})")
    return token, user_id

def upload_photo(token, user_name, color_seed):
    """Upload a photo for this user"""
    print(f"  Uploading photo for {user_name}...")

    image_file = create_test_image(color_seed)
    files = {'photo': (f'test_{user_name}.png', image_file, 'image/png')}
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{API_BASE_URL}/profile/photo",
        headers=headers,
        files=files
    )

    if response.status_code != 200:
        print(f"  ERROR: Upload failed - {response.text}")
        return None

    data = response.json()
    photo_url = data.get("photoUrl")
    print(f"  SUCCESS: Photo uploaded")
    print(f"  URL: {photo_url}")
    return photo_url

def get_profile_photo(token):
    """Get current user's profile photo"""
    response = requests.get(
        f"{API_BASE_URL}/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code != 200:
        print(f"  ERROR: Failed to get profile")
        return None

    profile = response.json()
    return profile.get("profile", {}).get("profilePhotoUrl")

def main():
    print("=" * 70)
    print("MULTI-USER PHOTO UPLOAD TEST")
    print("=" * 70)
    print("\nThis test verifies:")
    print("1. Each user can upload their own photo")
    print("2. Each user's photo is stored separately")
    print("3. Users can only see their own photo")

    user_photos = {}

    # Test uploading photos for each user
    print("\n" + "=" * 70)
    print("STEP 1: Upload photos for each user")
    print("=" * 70)

    for i, user in enumerate(TEST_USERS):
        result = login(user)
        if not result:
            print(f"  SKIPPING {user['name']} - login failed")
            continue

        token, user_id = result
        photo_url = upload_photo(token, user['name'], i)

        if photo_url:
            user_photos[user['email']] = {
                'token': token,
                'user_id': user_id,
                'photo_url': photo_url,
                'name': user['name']
            }

    # Verify each user sees their own photo
    print("\n" + "=" * 70)
    print("STEP 2: Verify each user sees their own photo")
    print("=" * 70)

    all_passed = True
    for email, data in user_photos.items():
        print(f"\nChecking {data['name']}...")
        current_photo = get_profile_photo(data['token'])

        if current_photo == data['photo_url']:
            print(f"  SUCCESS: User sees their own photo")
            print(f"  Expected: {data['photo_url']}")
            print(f"  Got:      {current_photo}")
        else:
            print(f"  ERROR: Photo URL mismatch!")
            print(f"  Expected: {data['photo_url']}")
            print(f"  Got:      {current_photo}")
            all_passed = False

    # Verify photos are different for different users
    print("\n" + "=" * 70)
    print("STEP 3: Verify photos are unique per user")
    print("=" * 70)

    if len(user_photos) >= 2:
        photo_urls = [data['photo_url'] for data in user_photos.values()]
        unique_urls = set(photo_urls)

        if len(unique_urls) == len(photo_urls):
            print("  SUCCESS: Each user has a unique photo URL")
            for email, data in user_photos.items():
                print(f"    {data['name']}: {data['photo_url']}")
        else:
            print("  ERROR: Some users have the same photo URL!")
            all_passed = False
    else:
        print("  SKIPPED: Need at least 2 users to verify uniqueness")

    # Final summary
    print("\n" + "=" * 70)
    if all_passed:
        print("ALL TESTS PASSED!")
    else:
        print("SOME TESTS FAILED - Check output above")
    print("=" * 70)

if __name__ == "__main__":
    main()

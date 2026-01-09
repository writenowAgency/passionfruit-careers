# How to Upload Your Profile Photo - Step by Step

## Current Status
✅ Test images have been cleared from your profile
✅ Upload functionality is fixed and ready to use
✅ Browser console logging is enabled for debugging

---

## Step-by-Step Upload Instructions

### 1. Open the Application
Navigate to: **http://localhost:8081**

### 2. Login
- Email: `demo@writenow.com`
- Password: `Demo123!`

### 3. Navigate to Edit Profile
1. Click on your profile or menu
2. Select **"Edit Profile"** or **"Profile"**
3. Make sure you're on the **"Personal"** tab

### 4. Upload Your Photo

**Option A: Add New Photo**
1. Click the **"Add Photo"** button
2. Select an image file from your computer
3. Supported formats: JPEG, PNG, WebP
4. Maximum size: 5MB
5. Wait for upload to complete (you'll see a loading indicator)
6. Success message will appear: "Profile photo uploaded successfully!"

**Option B: Change Existing Photo**
1. Click the **"Change"** button (if you already have a photo)
2. Select a new image
3. The old photo will be automatically replaced

### 5. Verify Upload

After upload, you should:
- ✅ See your photo displayed immediately in the circular frame
- ✅ See a success alert
- ✅ Be able to click "Change" or "Delete" buttons

---

## Troubleshooting

### If you don't see the photo after upload:

#### 1. Check Browser Console (IMPORTANT!)
Press **F12** (or **Cmd+Option+I** on Mac) to open Developer Tools

Look for these console messages:
```
[PhotoUpload] Upload successful, new photo URL: https://...
[PhotoUpload] currentPhotoUrl changed: https://...
[PhotoUpload] Image loaded successfully: https://...
```

If you see errors instead, copy them and let me know.

#### 2. Check Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Upload a photo
4. Look for the request to `/api/profile/photo`
5. Check:
   - Status should be **200 OK**
   - Response should contain `"photoUrl": "https://..."`

#### 3. Hard Refresh
After upload, try:
- **Chrome/Edge:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
- **Firefox:** Ctrl+F5 (Cmd+Shift+R on Mac)

#### 4. Clear Browser Cache
If hard refresh doesn't work:
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload the page

---

## What Happens During Upload

### Frontend Process:
1. ✅ You select an image file
2. ✅ File is validated (type and size)
3. ✅ Preview shown using `URL.createObjectURL()`
4. ✅ File sent to backend via FormData
5. ✅ Backend uploads to Cloudflare R2
6. ✅ Backend returns public URL
7. ✅ Frontend updates display with new URL

### Backend Process:
1. ✅ Receives multipart form data
2. ✅ Validates file type (JPEG, PNG, WebP only)
3. ✅ Validates file size (max 5MB)
4. ✅ Generates unique filename: `profile-photos/{userId}-{timestamp}.{ext}`
5. ✅ Uploads to Cloudflare R2 bucket
6. ✅ Saves URL in database: `job_seeker_profiles.profile_photo_url`
7. ✅ Deletes old photo from R2 (if exists)
8. ✅ Returns public URL to frontend

---

## Expected Console Output

When everything works correctly, you should see:

```
[PhotoUpload] currentPhotoUrl changed: null
[PhotoUpload] Upload successful, new photo URL: https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev/profile-photos/1-1765361234567.png
[PhotoUpload] currentPhotoUrl changed: https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev/profile-photos/1-1765361234567.png
[PhotoUpload] Image loaded successfully: https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev/profile-photos/1-1765361234567.png
```

---

## Common Issues & Solutions

### Issue 1: "No file uploaded" error
**Cause:** File input not properly configured
**Solution:** Make sure you're clicking the "Add Photo" or "Change" button, not trying to drag-and-drop

### Issue 2: "Invalid file type" error
**Cause:** Trying to upload unsupported format
**Solution:** Only use JPEG (.jpg, .jpeg), PNG (.png), or WebP (.webp) files

### Issue 3: "File too large" error
**Cause:** Image exceeds 5MB limit
**Solution:**
- Resize your image before upload
- Use an online tool like TinyPNG to compress it
- Or use a photo editor to reduce quality/dimensions

### Issue 4: Photo uploads but doesn't display
**Cause:** Cached old state or image loading issue
**Solution:**
1. Check browser console for errors
2. Hard refresh (Ctrl+Shift+R)
3. Check Network tab to verify photo URL is correct
4. Try opening the photo URL directly in a new tab

### Issue 5: Upload succeeds but shows red pixel
**Cause:** This was from our automated tests
**Solution:** The red pixel has been cleared. Upload a new real photo and it will display correctly.

---

## Testing Your Upload Right Now

Let's verify it works:

### Step 1: Prepare an Image
Find any image file on your computer:
- Portrait photo works best
- Recommended: 400x400 pixels or larger
- Format: JPEG or PNG
- Size: Under 5MB

### Step 2: Upload
1. Go to Edit Profile → Personal tab
2. Click "Add Photo"
3. Select your image
4. Wait for success message

### Step 3: Verify
1. Photo should appear immediately in the circular frame
2. Check browser console (F12) - should see success logs
3. Refresh page - photo should persist

### Step 4: Report Results
If it works: Great! ✅

If it doesn't work, check:
- [ ] Browser console errors (F12 → Console tab)
- [ ] Network request status (F12 → Network tab → look for `/api/profile/photo`)
- [ ] Photo URL in response
- [ ] Any error alerts shown

---

## Technical Details (For Debugging)

### Current Backend Configuration:
- **Endpoint:** `POST http://localhost:3000/api/profile/photo`
- **Storage:** Cloudflare R2 bucket: `passionfruit-careers`
- **Public URL:** `https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev`
- **Upload folder:** `profile-photos/`

### Current Frontend Configuration:
- **Component:** `PhotoUpload.tsx`
- **API URL:** `http://localhost:3000/api`
- **Image rendering:** Native `<img>` tag on web, expo-image on mobile

### Your Current Profile State:
- **User ID:** 1
- **Email:** demo@writenow.com
- **Current Photo URL:** `null` (cleared from tests)
- **Ready for upload:** ✅ Yes

---

## Need Help?

If you're still having issues after following this guide:

1. **Capture console output:**
   - Open browser console (F12)
   - Upload a photo
   - Copy all console messages

2. **Capture network request:**
   - Open Network tab (F12)
   - Upload a photo
   - Find the `/api/profile/photo` request
   - Copy the response

3. **Share:**
   - Console output
   - Network response
   - Any error messages you see
   - Screenshot if possible

I'll help debug the specific issue!

---

## Summary

✅ **Ready to use** - Upload functionality is fully working
✅ **Test data cleared** - No more red pixel test images
✅ **Debugging enabled** - Console logs will help track any issues
✅ **Platform optimized** - Uses native `<img>` tag for better web compatibility

**Go ahead and upload your real profile photo now!** 📸

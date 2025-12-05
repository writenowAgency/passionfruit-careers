# Create R2 API Tokens - Step by Step

## ⚠️ IMPORTANT: You Need to Create API Tokens

Your R2 bucket is configured, but you need API credentials to upload files.

---

## Step 1: Navigate to R2 API Tokens

1. Go to: https://dash.cloudflare.com/
2. Click on **R2** in the left sidebar
3. Click **Manage R2 API Tokens** (in the top right)

   OR go directly to:
   https://dash.cloudflare.com/?to=/:account/r2/api-tokens

---

## Step 2: Create New API Token

Click the **"Create API Token"** button

### Configure Token Settings:

**Token Name:**
```
passionfruit-careers-upload
```

**Permissions:**
- ✅ Select: **"Object Read & Write"**
  (Allows uploading and reading files)

**Apply to specific buckets only:**
- ✅ Select: **"Apply to specific buckets only"**
- ✅ Choose: **"passionfruit-careers"**

**TTL (Time to Live):**
- Select: **"Forever"** (or your preference)
  (Token won't expire unless you delete it)

**IP Address Filtering (Optional):**
- Leave empty for now (can restrict to specific IPs later)

---

## Step 3: Create and Save Credentials

1. Click **"Create API Token"**

2. **CRITICAL:** You'll see a screen with these values:
   ```
   Access Key ID:     [20+ characters]
   Secret Access Key: [40+ characters]
   ```

3. **⚠️ COPY BOTH VALUES NOW!**
   - They will only be shown ONCE
   - You cannot view the Secret Access Key again
   - If you lose it, you'll need to create a new token

4. **Save them securely:**
   - Password manager (recommended)
   - Secure notes
   - DO NOT commit to git
   - DO NOT share publicly

---

## Step 4: Update Backend Configuration

Once you have your credentials, update `backend/.env`:

### Option A: Manual Update

Open `backend/.env` and add/update these lines:

```bash
# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<paste_your_access_key_id_here>
R2_SECRET_ACCESS_KEY=<paste_your_secret_access_key_here>
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev
```

### Option B: Use the Configure Script

Run the provided script:

```bash
# Make executable
chmod +x configure-r2.sh

# Run script
./configure-r2.sh
```

When prompted, paste your credentials.

---

## Step 5: Restart Backend Server

After updating `.env`, restart the backend:

```bash
cd backend
npm run dev
```

You should see in the terminal that R2 is being used (not local storage).

---

## Step 6: Test Upload

### Get Auth Token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### Create Test Image:
```bash
# Create a simple test image (1x1 pixel red PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" | base64 -d > test-image.png
```

### Upload Test Image:
```bash
curl -X POST http://localhost:3000/api/profile/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-image.png"
```

### Expected Success Response:
```json
{
  "message": "Profile photo uploaded successfully",
  "photoUrl": "https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev/profile-photos/1-1733394567890.png"
}
```

### Verify Upload:
1. Copy the `photoUrl` from response
2. Open it in your browser
3. You should see the uploaded image!

---

## Step 7: Verify in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/?to=/:account/r2/default/buckets/passionfruit-careers/objects
2. You should see a folder: **profile-photos/**
3. Click into it to see your uploaded file!

---

## Troubleshooting

### "Access Denied" Error
**Problem:** Invalid credentials or insufficient permissions

**Solution:**
1. Double-check Access Key ID and Secret Access Key in `backend/.env`
2. Verify token has "Object Read & Write" permission
3. Verify token is applied to "passionfruit-careers" bucket
4. Try creating a new token

### "Network Error" or "Connection Refused"
**Problem:** R2 endpoint incorrect or network issues

**Solution:**
1. Verify R2_ENDPOINT is exactly:
   `https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com`
2. Check internet connection
3. Try from different network (in case of firewall)

### Upload succeeds but image doesn't load
**Problem:** Public access not enabled

**Solution:**
1. Go to R2 dashboard → passionfruit-careers
2. Settings → Public Development URL
3. Verify it shows: **Enabled**
4. Dev URL should be: `https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev`

### Still using local storage
**Problem:** R2 credentials not loaded

**Solution:**
1. Check `backend/.env` has all R2 variables
2. Restart backend server: `npm run dev`
3. Check terminal output - should mention R2, not local storage
4. Verify no typos in environment variable names

---

## Security Best Practices

### ✅ DO:
- Store credentials in `.env` (not committed to git)
- Use separate tokens for dev/staging/production
- Rotate credentials periodically
- Delete unused tokens
- Use IP filtering in production (restrict to your server IPs)
- Set appropriate CORS policies

### ❌ DON'T:
- Commit `.env` files to git
- Share credentials publicly
- Use same credentials across environments
- Give broader permissions than needed
- Leave unused tokens active

---

## Token Management

### View Existing Tokens:
https://dash.cloudflare.com/?to=/:account/r2/api-tokens

### Rotate Token (recommended every 90 days):
1. Create new token with same permissions
2. Update `backend/.env` with new credentials
3. Test that uploads work
4. Delete old token

### Revoke Compromised Token:
1. Go to R2 API Tokens
2. Find the token
3. Click "Delete"
4. Create new token immediately
5. Update all environments

---

## Quick Checklist

- [ ] Created R2 API token with "Object Read & Write" permission
- [ ] Saved Access Key ID securely
- [ ] Saved Secret Access Key securely
- [ ] Updated `backend/.env` with R2_ACCESS_KEY_ID
- [ ] Updated `backend/.env` with R2_SECRET_ACCESS_KEY
- [ ] Verified all 5 R2 environment variables are set
- [ ] Restarted backend server
- [ ] Tested image upload (curl command)
- [ ] Verified image URL opens in browser
- [ ] Checked R2 dashboard shows uploaded file
- [ ] Tested from React Native app (optional)

---

## Next Steps After Token Creation

Once your token is created and backend is configured:

1. **Test Uploads:**
   - Profile photos
   - Resume documents
   - Verify files appear in R2 dashboard

2. **Configure CORS** (if not done):
   - R2 → Settings → CORS Policy
   - Add allowed origins for your frontend

3. **Test Frontend:**
   - Start React Native app
   - Upload profile photo
   - Verify image displays

4. **Monitor Usage:**
   - R2 → Metrics
   - Check storage size
   - Check operation counts
   - Review costs (should be near $0)

5. **Production Setup** (when ready):
   - Create separate production token
   - Set up custom domain (cdn.passionfruit.careers)
   - Update R2_PUBLIC_URL to custom domain
   - Configure production CORS origins
   - Set up monitoring/alerts

---

## Your Current Configuration

```
Account ID:     0f1cd411ceee2e9302b63a87ae4f36be
Bucket:         passionfruit-careers
Region:         Western Europe (WEUR)
S3 Endpoint:    https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
Public URL:     https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev
```

**Required in backend/.env:**
```bash
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<create_in_cloudflare>
R2_SECRET_ACCESS_KEY=<create_in_cloudflare>
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev
```

---

## Ready to Create Your Token?

1. Go to: https://dash.cloudflare.com/?to=/:account/r2/api-tokens
2. Click: **"Create API Token"**
3. Follow the steps above
4. Save your credentials
5. Update `backend/.env`
6. Test uploads!

**Once done, your app will have unlimited image and file storage at near-zero cost!** 🚀

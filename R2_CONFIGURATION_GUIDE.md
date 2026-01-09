# Cloudflare R2 Configuration Guide

## Current R2 Bucket Status
- **Bucket Name:** `passionfruit-careers`
- **Location:** Western Europe (WEUR)
- **S3 API Endpoint:** `https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com/passionfruit-careers`
- **Public Access:** Currently Disabled
- **Custom Domain:** Not configured
- **CORS Policy:** Not configured

---

## Step 1: Create R2 API Tokens

### In Cloudflare Dashboard:
1. Go to **R2** → **Overview**
2. Click **Manage R2 API Tokens** (right sidebar)
3. Click **Create API Token**
4. Configure token:
   - **Token Name:** `passionfruit-careers-api`
   - **Permissions:**
     - ✅ Object Read & Write
   - **Buckets:** Select `passionfruit-careers`
   - **TTL:** No expiry (or your preference)
5. Click **Create API Token**
6. **SAVE THESE VALUES** (shown only once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (should match your bucket's S3 API)

---

## Step 2: Configure Public Access

You have **two options** for public access:

### Option A: Custom Domain (Recommended for Production)
1. In Cloudflare Dashboard → R2 → `passionfruit-careers`
2. Go to **Settings** → **Custom Domains**
3. Click **Connect Domain**
4. Enter your domain: `cdn.passionfruit.careers` (or similar)
5. Add the CNAME record to your DNS:
   ```
   Type: CNAME
   Name: cdn (or your subdomain)
   Target: [Cloudflare provides this]
   ```
6. Click **Allow Access** to enable public access

**Your R2_PUBLIC_URL will be:** `https://cdn.passionfruit.careers`

### Option B: Public Development URL (Quick Start)
1. In Cloudflare Dashboard → R2 → `passionfruit-careers`
2. Go to **Settings** → **Public Development URL**
3. Click **Enable Public Development URL**
4. Copy the generated URL (e.g., `https://pub-xxxxx.r2.dev`)

**Your R2_PUBLIC_URL will be:** The generated dev URL

⚠️ **Note:** Dev URLs are fine for testing but custom domains are recommended for production.

---

## Step 3: Configure CORS Policy

This is **critical** for React Native/web apps to access R2 files.

1. In Cloudflare Dashboard → R2 → `passionfruit-careers`
2. Go to **Settings** → **CORS Policy**
3. Click **Add CORS Policy**
4. Use this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:8081",
      "https://yourapp.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

5. Click **Save**

**Update allowed origins** with your actual domains once deployed.

---

## Step 4: Update Backend Environment Variables

### Edit `backend/.env`:

Replace the commented R2 section with your actual values:

```bash
# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_from_step_1
R2_SECRET_ACCESS_KEY=your_secret_key_from_step_1
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=https://cdn.passionfruit.careers

# Or use dev URL if not using custom domain:
# R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

---

## Step 5: Update Frontend Environment Variables

### Edit `.env.example` (and create `.env.local`):

```bash
# Cloudflare R2 Configuration
EXPO_PUBLIC_R2_ACCOUNT_ID=0f1cd411ceee2e9302b63a87ae4f36be
EXPO_PUBLIC_R2_BUCKET_NAME=passionfruit-careers
EXPO_PUBLIC_R2_PUBLIC_URL=https://cdn.passionfruit.careers
```

---

## Step 6: Test Upload & Access

### Start Backend:
```bash
cd backend
npm run dev
```

### Test Image Upload:
```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}' \
  | jq -r '.token')

# Upload profile photo (replace with actual image path)
curl -X POST http://localhost:3000/api/profile/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/test-image.jpg"
```

### Expected Response:
```json
{
  "message": "Profile photo uploaded successfully",
  "photoUrl": "https://cdn.passionfruit.careers/profile-photos/1-1733393456789.jpg"
}
```

### Verify Access:
Open the `photoUrl` in a browser. You should see the uploaded image.

---

## How It Works

### Upload Flow:
1. Client sends image/document via FormData
2. Backend multer middleware processes the file
3. File is uploaded to R2 using S3 SDK
4. Public URL is generated and saved to database
5. URL is returned to client

### Access Flow:
1. Client requests profile data
2. Backend returns profile with R2 URLs
3. Client displays images using public URLs
4. R2 serves files directly (no backend involved)

### Folder Structure in R2:
```
passionfruit-careers/
├── profile-photos/
│   ├── 1-1733393456789.jpg
│   └── 2-1733393457890.png
└── documents/
    ├── 1-1733393458901.pdf
    └── 2-1733393459012.docx
```

---

## Security Considerations

### ✅ Safe:
- R2 URLs are public but unpredictable (contain timestamps/IDs)
- Files are organized by user ID and folder
- Upload endpoints require authentication
- File type validation prevents malicious uploads
- File size limits prevent abuse

### 🔒 Additional Security (Optional):
1. **Pre-signed URLs** - Generate temporary URLs instead of public URLs
2. **Image Processing** - Resize/compress images before storage
3. **Virus Scanning** - Scan uploaded files for malware
4. **Rate Limiting** - Limit upload frequency per user

---

## Cost Estimation

Cloudflare R2 Pricing (as of 2024):
- **Storage:** $0.015 per GB/month
- **Class A Operations** (PUT, POST): $4.50 per million
- **Class B Operations** (GET): Free
- **Egress:** Free (no bandwidth charges!)

### Example for 1000 users:
- Average 2MB profile photo + 500KB resume per user
- Storage: 2.5GB × $0.015 = **$0.0375/month**
- Uploads: 2000 × $4.50/1M = **$0.009/month**
- Downloads: Unlimited for **$0/month**

**Total: ~$0.05/month** 🎉

---

## Troubleshooting

### "Access Denied" Error:
- ✅ Check R2 API token has correct permissions
- ✅ Verify endpoint URL is correct
- ✅ Ensure bucket name matches

### "CORS Error" in Browser:
- ✅ Configure CORS policy in R2 settings
- ✅ Add your frontend domain to AllowedOrigins
- ✅ Restart backend after environment changes

### Images Not Loading:
- ✅ Enable Public Development URL or configure custom domain
- ✅ Check R2_PUBLIC_URL is set correctly
- ✅ Verify file was actually uploaded to R2 (check Objects tab)

### Still Using Local Storage:
- ✅ Set `NODE_ENV=production` in backend/.env
- ✅ Or ensure R2_ENDPOINT is set (overrides local storage)
- ✅ Restart backend server

---

## Migration Checklist

- [ ] Step 1: Create R2 API tokens
- [ ] Step 2: Enable public access (custom domain or dev URL)
- [ ] Step 3: Configure CORS policy
- [ ] Step 4: Update backend `.env` with R2 credentials
- [ ] Step 5: Update frontend `.env.local` with public URL
- [ ] Step 6: Restart backend server
- [ ] Step 7: Test image upload via API
- [ ] Step 8: Test image access in browser
- [ ] Step 9: Test document upload
- [ ] Step 10: Test from React Native app

---

## Quick Start Script

Save this as `configure-r2.sh`:

```bash
#!/bin/bash
echo "🚀 Configuring Cloudflare R2..."

# Prompt for credentials
read -p "Enter R2 Access Key ID: " ACCESS_KEY
read -sp "Enter R2 Secret Access Key: " SECRET_KEY
echo
read -p "Enter R2 Public URL (e.g., https://cdn.passionfruit.careers): " PUBLIC_URL

# Update backend .env
cat > backend/.env.r2 << EOF
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=$ACCESS_KEY
R2_SECRET_ACCESS_KEY=$SECRET_KEY
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=$PUBLIC_URL
EOF

echo "✅ R2 configuration saved to backend/.env.r2"
echo "📝 Append this to your backend/.env file"
echo ""
echo "Next steps:"
echo "1. Copy content from backend/.env.r2 to backend/.env"
echo "2. Configure CORS policy in Cloudflare dashboard"
echo "3. Restart backend: cd backend && npm run dev"
echo "4. Test upload: npm run test:upload"
```

---

## Ready to Go!

Once configured, your app will:
- ✅ Upload profile photos to R2
- ✅ Upload resumes/documents to R2
- ✅ Serve images via public CDN
- ✅ Handle automatic file deletion
- ✅ Scale to millions of users
- ✅ Pay almost nothing for storage

For production deployment, make sure to:
1. Use a custom domain (not dev URL)
2. Enable environment-specific CORS origins
3. Set up monitoring/alerts
4. Consider object lifecycle rules for cleanup

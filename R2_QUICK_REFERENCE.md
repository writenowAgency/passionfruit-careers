# Cloudflare R2 - Quick Reference Card

## Your R2 Bucket Info
```
Bucket Name:    passionfruit-careers
Location:       Western Europe (WEUR)
Account ID:     0f1cd411ceee2e9302b63a87ae4f36be
S3 Endpoint:    https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
```

---

## 🚀 Quick Setup (5 Steps)

### 1️⃣ Create API Tokens
**Cloudflare Dashboard** → R2 → Manage R2 API Tokens → Create API Token
- Name: `passionfruit-careers-api`
- Permission: Object Read & Write
- Bucket: `passionfruit-careers`
- **SAVE:** Access Key ID + Secret Access Key

### 2️⃣ Enable Public Access
**Choose ONE:**

**Option A: Custom Domain** (Production)
- R2 → passionfruit-careers → Settings → Custom Domains
- Add: `cdn.passionfruit.careers`
- Add CNAME to DNS
- ✅ Public URL: `https://cdn.passionfruit.careers`

**Option B: Dev URL** (Testing)
- R2 → passionfruit-careers → Settings → Public Development URL
- Click: Enable Public Development URL
- ✅ Public URL: Copy the generated URL

### 3️⃣ Configure CORS
R2 → passionfruit-careers → Settings → CORS Policy → Add CORS Policy
```json
[{
  "AllowedOrigins": ["http://localhost:3000", "http://localhost:8081", "https://yourapp.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}]
```

### 4️⃣ Update Backend Config
Edit `backend/.env`:
```bash
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your_access_key>
R2_SECRET_ACCESS_KEY=<your_secret_key>
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=<your_public_url>
```

### 5️⃣ Update Frontend Config
Create `.env.local`:
```bash
EXPO_PUBLIC_R2_ACCOUNT_ID=0f1cd411ceee2e9302b63a87ae4f36be
EXPO_PUBLIC_R2_BUCKET_NAME=passionfruit-careers
EXPO_PUBLIC_R2_PUBLIC_URL=<your_public_url>
```

---

## 🧪 Testing Commands

### Login & Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}' \
  | jq -r '.token')
```

### Upload Profile Photo
```bash
curl -X POST http://localhost:3000/api/profile/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-image.jpg"
```

### Upload Resume/Document
```bash
curl -X POST http://localhost:3000/api/profile/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@resume.pdf"
```

### Get Profile (Check URLs)
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.profile.profilePhotoUrl, .profile.resumeUrl'
```

---

## 📁 R2 Folder Structure

```
passionfruit-careers/
├── profile-photos/
│   ├── 1-1733393456789.jpg
│   ├── 1-1733393567890.jpg
│   └── 2-1733393678901.png
├── documents/
│   ├── 1-1733393789012.pdf
│   ├── 1-1733393890123.docx
│   └── 2-1733393901234.pdf
```

Files are automatically organized by:
- **Folder:** Type of file (profile-photos, documents)
- **User ID:** First number in filename
- **Timestamp:** Ensures uniqueness
- **Extension:** Original file extension

---

## 🔧 Useful Cloudflare R2 URLs

| Action | URL |
|--------|-----|
| R2 Dashboard | https://dash.cloudflare.com/?to=/:account/r2 |
| Bucket Settings | https://dash.cloudflare.com/?to=/:account/r2/default/buckets/passionfruit-careers |
| API Tokens | https://dash.cloudflare.com/?to=/:account/r2/api-tokens |
| View Objects | https://dash.cloudflare.com/?to=/:account/r2/default/buckets/passionfruit-careers/objects |

---

## 💰 Cost Calculator

| Users | Storage | Monthly Cost |
|-------|---------|--------------|
| 100 | 250MB | $0.004 |
| 1,000 | 2.5GB | $0.038 |
| 10,000 | 25GB | $0.375 |
| 100,000 | 250GB | $3.750 |

**Calculations:**
- Storage: 2.5MB avg per user (2MB photo + 500KB resume)
- Storage cost: $0.015 per GB/month
- Egress: FREE (no bandwidth charges!)
- Operations: Minimal (~$0.01/month for 10K users)

---

## ⚠️ Troubleshooting

### Images not uploading?
```bash
# Check if R2 credentials are set
cd backend && grep R2_ .env

# Should see:
# R2_ENDPOINT=https://...
# R2_ACCESS_KEY_ID=...
# R2_SECRET_ACCESS_KEY=...
# R2_BUCKET_NAME=passionfruit-careers
# R2_PUBLIC_URL=https://...
```

### Images upload but don't load?
1. ✅ Check public access is enabled (custom domain or dev URL)
2. ✅ Verify R2_PUBLIC_URL matches your public access URL
3. ✅ Test URL directly in browser
4. ✅ Check CORS policy is configured

### CORS errors in React Native?
```json
// In R2 CORS policy, add:
{
  "AllowedOrigins": ["*"],  // Or specific domains
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

### Still using local storage?
```bash
# Backend defaults to local storage if R2_ENDPOINT not set
# Verify in terminal when starting backend:
cd backend && npm run dev

# Should NOT see: "Using local storage for uploads"
# Should see R2 endpoint URL logged
```

---

## 📊 Monitoring

### Check Upload Status
```bash
# View recent uploads in R2 dashboard
# R2 → passionfruit-careers → Objects → Sort by "Last Modified"
```

### View Bucket Metrics
```bash
# R2 → passionfruit-careers → Metrics
# Shows:
# - Total objects
# - Bucket size
# - Class A operations (uploads)
# - Class B operations (downloads)
```

### Database Verification
```bash
# Check stored URLs in database
psql -U postgres -d passionfruit_careers -c \
  "SELECT profile_photo_url, resume_url FROM job_seeker_profiles LIMIT 5;"

# Should show R2 URLs like:
# https://cdn.passionfruit.careers/profile-photos/...
```

---

## 🎯 Production Checklist

Before going live:
- [ ] Use custom domain (not dev URL)
- [ ] Update CORS origins to production domains only
- [ ] Set up R2 bucket lifecycle rules (optional cleanup)
- [ ] Configure monitoring/alerts
- [ ] Test image uploads from production app
- [ ] Test image loading on actual devices
- [ ] Verify HTTPS works correctly
- [ ] Check file deletion works (when updating photos)
- [ ] Monitor first week for issues
- [ ] Review R2 costs in billing dashboard

---

## 🔗 Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/)
- [Custom Domains Guide](https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains)
- [CORS Configuration](https://developers.cloudflare.com/r2/buckets/cors/)

---

## 🎉 Success Indicators

Your R2 is working correctly if:
- ✅ Profile photo uploads return R2 URL
- ✅ Opening R2 URL in browser shows the image
- ✅ React Native app displays profile photos
- ✅ Documents upload and can be downloaded
- ✅ Old files are deleted when updating
- ✅ R2 dashboard shows uploaded objects
- ✅ No CORS errors in console
- ✅ Monthly costs are near zero

---

**Need Help?** Check `R2_CONFIGURATION_GUIDE.md` for detailed instructions!

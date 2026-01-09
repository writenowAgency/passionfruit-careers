# Cloudflare R2 Storage Setup Guide

## 🎯 Overview

This guide will help you set up Cloudflare R2 storage for the Passionfruit Careers app. R2 is used to store:
- CVs/Resumes (PDF, DOCX)
- Profile images
- Company logos
- Certificates
- Application documents

**Why R2?**
- ✅ Zero egress fees (unlimited bandwidth)
- ✅ 10x cheaper than AWS S3
- ✅ S3-compatible API
- ✅ Global CDN included
- ✅ FREE tier: 10GB storage/month

---

## 📋 Prerequisites

1. Cloudflare account (free tier available)
2. Payment method added to Cloudflare (required even for free tier)
3. Node.js and npm installed
4. This project cloned and dependencies installed

---

## 🚀 Step 1: Create Cloudflare R2 Bucket

### 1.1 Log in to Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Log in with your Cloudflare account

### 1.2 Navigate to R2
1. In the left sidebar, click **R2**
2. Click **Create bucket**

### 1.3 Create Your Bucket
1. **Bucket name:** `passionfruit-careers` (or your preferred name)
2. **Location:** Choose closest to your users (or Auto)
3. Click **Create bucket**

### 1.4 Configure Bucket Settings (Optional but Recommended)
1. Go to **Settings** tab in your bucket
2. Enable **Public access** if you want direct URLs (recommended for images/logos)
3. Configure **CORS** if needed:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

---

## 🔑 Step 2: Create API Tokens

### 2.1 Navigate to API Tokens
1. In your R2 dashboard, click **Manage R2 API Tokens**
2. Or go directly to: https://dash.cloudflare.com/?to=/:account/r2/api-tokens

### 2.2 Create New API Token
1. Click **Create API token**
2. **Token name:** `Passionfruit Careers Production`
3. **Permissions:**
   - ✅ Object Read & Write
   - Choose your bucket or select "All buckets"
4. Click **Create API token**

### 2.3 Save Your Credentials
You'll see three important values:
```
Access Key ID: 1234567890abcdef...
Secret Access Key: abcdefghijklmnop...
```

⚠️ **IMPORTANT:** Save these credentials immediately! The Secret Access Key is only shown once.

### 2.4 Find Your Account ID
1. In the R2 dashboard, your **Account ID** is displayed at the top
2. Or check the URL: `https://dash.cloudflare.com/:account_id/r2`

---

## ⚙️ Step 3: Configure Your App

### 3.1 Create Environment File
```bash
cd passionfruit-careers
cp .env.example .env.local
```

### 3.2 Fill in Your Credentials
Open `.env.local` and add your values:

```env
# Your Cloudflare Account ID
EXPO_PUBLIC_R2_ACCOUNT_ID=your_account_id_here

# R2 Access Key ID
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your_access_key_id_here

# R2 Secret Access Key
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your_secret_access_key_here

# R2 Bucket Name (must match the bucket you created)
EXPO_PUBLIC_R2_BUCKET_NAME=passionfruit-careers

# Optional: Public URL (if using custom domain)
EXPO_PUBLIC_R2_PUBLIC_URL=
```

### 3.3 Verify Installation
The required packages are already installed:
- ✅ `@aws-sdk/client-s3`
- ✅ `@aws-sdk/s3-request-presigner`

If not, run:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 🎨 Step 4: Using the Storage Service

### 4.1 Import the Service
```typescript
import { StorageService } from '@/services/storage';
```

### 4.2 Upload a File
```typescript
const result = await StorageService.uploadFile({
  file: yourFile,
  fileName: 'resume.pdf',
  category: 'cvs', // 'cvs' | 'images' | 'certificates' | 'logos' | 'documents'
  userId: 'user123',
  contentType: 'application/pdf',
});

if (result.success) {
  console.log('File URL:', result.fileUrl);
  console.log('File Key:', result.key);
}
```

### 4.3 Use the FileUploader Component
```typescript
<FileUploader
  category="cvs"
  label="Upload your CV"
  onUploadComplete={(fileUrl, key) => {
    console.log('Uploaded:', fileUrl);
    // Save fileUrl to your database
  }}
  onError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

### 4.4 Get a File URL
```typescript
// For public files
const url = await StorageService.getFileUrl(fileKey);

// For private files with expiration
const url = await StorageService.getFileUrl(fileKey, 3600); // 1 hour
```

### 4.5 Delete a File
```typescript
const success = await StorageService.deleteFile(fileKey);
```

---

## 🌐 Step 5: Custom Domain (Optional)

### Why Use a Custom Domain?
- Branded URLs (cdn.passionfruit.careers)
- Better caching
- No pre-signed URL expiration

### 5.1 Connect Custom Domain
1. In your R2 bucket, go to **Settings**
2. Click **Connect Domain**
3. Enter your domain: `cdn.passionfruit.careers`
4. Add the CNAME record to your DNS:
   ```
   cdn.passionfruit.careers CNAME your-bucket.r2.cloudflarestorage.com
   ```

### 5.2 Update Environment Variable
```env
EXPO_PUBLIC_R2_PUBLIC_URL=https://cdn.passionfruit.careers
```

---

## 📊 Storage Organization

Files are automatically organized by category and user:

```
passionfruit-careers/
├── cvs/
│   ├── user123/
│   │   ├── 1638360000000-resume.pdf
│   │   └── 1638370000000-portfolio.pdf
├── images/
│   ├── user456/
│   │   └── 1638380000000-avatar.jpg
├── certificates/
│   └── user789/
│       └── 1638390000000-degree.pdf
├── logos/
│   └── company123/
│       └── 1638400000000-logo.png
└── documents/
    └── user111/
        └── 1638410000000-cover-letter.pdf
```

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files
✅ Already configured in `.gitignore`
```
.env*.local
```

### 2. Use Different Tokens for Each Environment
- **Development:** Limited permissions
- **Production:** Read & Write on specific bucket only

### 3. Rotate API Tokens Regularly
- Create new tokens every 90 days
- Delete old tokens after rotation

### 4. Validate Files Before Upload
✅ Already implemented in `FileUploader`:
- File size limits
- File type validation
- Content type checking

---

## 💰 Cost Estimates

### Free Tier (First 10GB)
- Storage: FREE
- Class A operations: 1M requests/month
- Class B operations: 10M requests/month
- Egress: Unlimited FREE

### Paid Tier (After 10GB)
Based on 1000 active users:

| Item | Usage | Cost/Month |
|------|-------|------------|
| Storage (7GB) | $0.015/GB | $0.11 |
| PUT requests (10k) | $4.50/M | $0.05 |
| GET requests (100k) | $0.36/M | $0.04 |
| **Egress (Unlimited)** | **FREE** | **$0** |
| **Total** | | **$0.20** |

Compare to AWS S3:
- Storage: $0.16
- Requests: $0.10
- **Egress (10GB): $0.90** 💸
- **Total: $1.16**

**You save 83% with R2!** 🎉

---

## 🧪 Testing Your Setup

### 1. Test File Upload
```bash
npm start
```

1. Open http://localhost:8081
2. Log in as job seeker
3. Go to Profile → Documents
4. Click "Upload CV"
5. Select a PDF file
6. Verify upload completes successfully

### 2. Verify in R2 Dashboard
1. Go to your R2 bucket
2. Navigate to `cvs/guest/`
3. You should see your uploaded file

### 3. Test File Access
1. Copy the file URL from upload response
2. Open in browser
3. Verify file downloads correctly

---

## 🐛 Troubleshooting

### Error: "Access Denied"
**Solution:** Check your API token permissions
- Ensure "Object Read & Write" is enabled
- Verify token is for the correct bucket

### Error: "Bucket not found"
**Solution:** Check bucket name matches
- Verify `EXPO_PUBLIC_R2_BUCKET_NAME` in `.env.local`
- Ensure bucket exists in R2 dashboard

### Error: "CORS policy"
**Solution:** Configure CORS in R2 bucket settings
- Add allowed origins
- Enable required methods (GET, PUT, POST)

### Files Upload but Can't Download
**Solution:** Check public access settings
- Enable public access in bucket settings
- Or use pre-signed URLs (already implemented)

### "Module not found: @aws-sdk"
**Solution:** Reinstall dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)

---

## ✅ Verification Checklist

Before going to production:

- [ ] R2 bucket created
- [ ] API tokens generated and saved securely
- [ ] `.env.local` configured with correct credentials
- [ ] Test upload works in development
- [ ] Test file access/download works
- [ ] Bucket CORS configured (if needed)
- [ ] Public access enabled (if using direct URLs)
- [ ] Custom domain connected (optional)
- [ ] Monitoring/alerts set up in Cloudflare
- [ ] Backup strategy defined

---

## 🎉 You're Ready!

Your Cloudflare R2 storage is now configured and ready to use. The app will automatically:
- ✅ Upload files with validation
- ✅ Generate accessible URLs
- ✅ Organize files by category
- ✅ Track uploads per user
- ✅ Handle errors gracefully

**Next Steps:**
1. Test uploading different file types
2. Monitor usage in R2 dashboard
3. Set up alerts for quota limits
4. Consider lifecycle policies for old files

---

**Need Help?**
- Check the [troubleshooting section](#-troubleshooting) above
- Review the [Cloudflare R2 docs](https://developers.cloudflare.com/r2/)
- Check browser console for detailed error messages

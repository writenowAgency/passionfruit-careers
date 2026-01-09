#!/bin/bash

echo "🚀 Cloudflare R2 Configuration Setup"
echo "====================================="
echo ""
echo "This script will help you configure R2 storage for Passionfruit Careers"
echo ""
echo "Prerequisites:"
echo "1. R2 bucket 'passionfruit-careers' already created ✅"
echo "2. R2 API tokens created in Cloudflare dashboard"
echo "3. Public access enabled (custom domain or dev URL)"
echo "4. CORS policy configured"
echo ""
read -p "Have you completed all prerequisites? (y/n): " ready

if [ "$ready" != "y" ]; then
    echo ""
    echo "📖 Please follow the R2_CONFIGURATION_GUIDE.md first!"
    echo "   Steps needed:"
    echo "   1. Create R2 API tokens"
    echo "   2. Enable public access (custom domain or dev URL)"
    echo "   3. Configure CORS policy"
    echo ""
    exit 1
fi

echo ""
echo "📝 Enter your R2 credentials:"
echo ""

# Collect credentials
read -p "R2 Access Key ID: " ACCESS_KEY
echo ""
read -sp "R2 Secret Access Key: " SECRET_KEY
echo ""
echo ""
read -p "R2 Public URL (e.g., https://cdn.passionfruit.careers): " PUBLIC_URL
echo ""

# Validate inputs
if [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ] || [ -z "$PUBLIC_URL" ]; then
    echo "❌ Error: All fields are required!"
    exit 1
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Backup existing .env
cp backend/.env backend/.env.backup
echo "📦 Backed up existing backend/.env to backend/.env.backup"

# Check if R2 config already exists
if grep -q "R2_ENDPOINT" backend/.env; then
    # Update existing R2 configuration
    sed -i.bak "s|^R2_ENDPOINT=.*|R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com|" backend/.env
    sed -i.bak "s|^R2_ACCESS_KEY_ID=.*|R2_ACCESS_KEY_ID=$ACCESS_KEY|" backend/.env
    sed -i.bak "s|^R2_SECRET_ACCESS_KEY=.*|R2_SECRET_ACCESS_KEY=$SECRET_KEY|" backend/.env
    sed -i.bak "s|^R2_BUCKET_NAME=.*|R2_BUCKET_NAME=passionfruit-careers|" backend/.env
    sed -i.bak "s|^R2_PUBLIC_URL=.*|R2_PUBLIC_URL=$PUBLIC_URL|" backend/.env
    rm backend/.env.bak 2>/dev/null
    echo "✅ Updated existing R2 configuration in backend/.env"
else
    # Append R2 configuration
    cat >> backend/.env << EOF

# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=$ACCESS_KEY
R2_SECRET_ACCESS_KEY=$SECRET_KEY
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=$PUBLIC_URL
EOF
    echo "✅ Added R2 configuration to backend/.env"
fi

# Create/update frontend .env.local
cat > .env.local << EOF
# Cloudflare R2 Configuration
EXPO_PUBLIC_R2_ACCOUNT_ID=0f1cd411ceee2e9302b63a87ae4f36be
EXPO_PUBLIC_R2_BUCKET_NAME=passionfruit-careers
EXPO_PUBLIC_R2_PUBLIC_URL=$PUBLIC_URL
EOF
echo "✅ Created frontend .env.local"

echo ""
echo "✨ Configuration Complete!"
echo ""
echo "🔍 Configuration Summary:"
echo "   Backend Endpoint: https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com"
echo "   Bucket Name: passionfruit-careers"
echo "   Public URL: $PUBLIC_URL"
echo "   Access Key: ${ACCESS_KEY:0:10}..."
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Restart backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Test image upload:"
echo "   curl -X POST http://localhost:3000/api/profile/photo \\"
echo "     -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "     -F \"photo=@/path/to/image.jpg\""
echo ""
echo "3. Verify uploaded image:"
echo "   - Check response for photoUrl"
echo "   - Open photoUrl in browser"
echo "   - Image should load from: $PUBLIC_URL"
echo ""
echo "4. Check R2 bucket in Cloudflare:"
echo "   - Go to R2 → passionfruit-careers → Objects"
echo "   - Should see uploaded files in profile-photos/ folder"
echo ""
echo "📖 See R2_CONFIGURATION_GUIDE.md for detailed instructions"
echo ""
echo "✅ R2 is ready to use!"

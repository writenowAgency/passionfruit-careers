#!/bin/bash

echo "🚀 Passionfruit Careers - Railway Deployment Helper"
echo "=================================================="
echo ""

# Check if Railway CLI is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "Please run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway as: $(railway whoami)"
echo ""

echo "📋 Deployment Steps:"
echo ""
echo "STEP 1: Create Project on Railway Dashboard"
echo "-------------------------------------------"
echo "1. Open: https://railway.app/dashboard"
echo "2. Click 'New Project'"
echo "3. Select 'Empty Project'"
echo "4. Name it: 'passionfruit-careers-api'"
echo ""
read -p "Press ENTER when project is created..."

echo ""
echo "STEP 2: Add PostgreSQL Database"
echo "--------------------------------"
echo "1. In your project, click '+ New'"
echo "2. Select 'Database' → 'PostgreSQL'"
echo "3. Wait for provisioning to complete"
echo ""
read -p "Press ENTER when PostgreSQL is ready..."

echo ""
echo "STEP 3: Add Backend Service"
echo "---------------------------"
echo "1. Click '+ New' again"
echo "2. Select 'GitHub Repo'"
echo "3. Connect GitHub account if needed"
echo "4. Select: 'Mokgadi-Julius/passionfruit-careers'"
echo "5. Configure:"
echo "   - Root Directory: backend"
echo "   - Builder: Dockerfile"
echo ""
read -p "Press ENTER when service is created..."

echo ""
echo "STEP 4: Configure Environment Variables"
echo "---------------------------------------"
echo "In the backend service, go to 'Variables' and add:"
echo ""
echo "PORT=3000"
echo "DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "JWT_EXPIRES_IN=24h"
echo "R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com"
echo "R2_ACCESS_KEY_ID=8085ed1a4f07a374f6f803cf6b860242"
echo "R2_SECRET_ACCESS_KEY=686e9dc32e145bfbdfa2e7a64de3ea7cd72b0d0dc56fe3750d054bec5141e529"
echo "R2_BUCKET_NAME=passionfruit-careers"
echo "R2_PUBLIC_URL=https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev"
echo "API_URL=\${{RAILWAY_PUBLIC_DOMAIN}}"
echo "GEMINI_API_KEY=AIzaSyDy_HNPd4g1pEjQkWgbjGHZYgQ67Akl2Lw"
echo "GEMINI_MODEL=gemini-2.5-flash"
echo ""
read -p "Press ENTER when variables are set..."

echo ""
echo "STEP 5: Generate Public Domain"
echo "------------------------------"
echo "1. Go to backend service 'Settings'"
echo "2. Click 'Generate Domain' under 'Networking'"
echo "3. Note the public URL"
echo ""
read -p "Press ENTER when domain is generated..."

echo ""
echo "STEP 6: Import Database Dump"
echo "----------------------------"
echo "Attempting to connect to Railway PostgreSQL..."
echo ""

# Try to import database dump
if [ -f "writenow_db_dump.sql" ]; then
    echo "Found database dump file"
    echo "You can import it using:"
    echo "  railway connect postgres"
    echo "  Then in psql: \\i $(pwd)/writenow_db_dump.sql"
    echo ""
    read -p "Do you want to attempt import now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Connecting to PostgreSQL..."
        railway connect postgres
    fi
else
    echo "⚠️  Database dump not found at: writenow_db_dump.sql"
    echo "Please import manually"
fi

echo ""
echo "✅ Deployment Complete!"
echo "====================="
echo ""
echo "Next Steps:"
echo "1. Verify deployment in Railway dashboard"
echo "2. Check logs for any errors"
echo "3. Test health endpoint: curl https://your-domain.up.railway.app/health"
echo "4. Test authentication endpoint"
echo ""
echo "📚 See RAILWAY_DEPLOYMENT.md for detailed instructions"

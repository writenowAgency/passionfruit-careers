#!/bin/bash

echo "🎨 Passionfruit Careers - Frontend Deployment Helper"
echo "==================================================="
echo ""
echo "This script guides you through deploying the Web Frontend to Railway."
echo "Ensure you have already deployed the Backend!"
echo ""

# Check Railway CLI
if ! railway whoami &> /dev/null; then
    echo "⚠️  Railway CLI not logged in (optional but recommended)"
    echo "   You can continue manually via the dashboard."
else
    echo "✅ Logged in as: $(railway whoami)"
fi

echo ""
echo "STEP 1: Open Railway Project"
echo "----------------------------"
echo "1. Go to: https://railway.app/dashboard"
echo "2. Open your existing 'passionfruit-careers' project."
echo ""
read -p "Press ENTER when ready..."

echo ""
echo "STEP 2: Create Frontend Service"
echo "-------------------------------"
echo "1. Click '+ New' -> 'GitHub Repo'"
echo "2. Select this repository again."
echo "3. A new service will appear."
echo ""
read -p "Press ENTER when service is added..."

echo ""
echo "STEP 3: Configure Build & Start"
echo "-------------------------------"
echo "1. Click the new service -> 'Settings'."
echo "2. Set 'Root Directory' to: / (or leave empty)"
echo "3. Verify 'Build Command': npm run build"
echo "4. Verify 'Start Command': npm start"
echo ""
read -p "Press ENTER when configured..."

echo ""
echo "STEP 4: Link to Backend"
echo "-----------------------"
echo "You need the Backend URL for the frontend to work."
echo "Example: https://your-backend.up.railway.app/api"
echo ""
read -p "Enter your Backend URL (include /api): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  No URL entered. You must set EXPO_PUBLIC_API_URL manually later."
else
    echo ""
    echo "1. Go to 'Variables' tab."
    echo "2. Add Variable:"
    echo "   Key:   EXPO_PUBLIC_API_URL"
    echo "   Value: $BACKEND_URL"
fi
echo ""
read -p "Press ENTER when variable is set..."

echo ""
echo "STEP 5: Go Live"
echo "----------------"
echo "1. Go to 'Settings' -> 'Networking'."
echo "2. Click 'Generate Domain'."
echo "3. Wait for the deployment to finish."
echo ""
echo "🎉 Once deployed, click the generated domain to view your App!"
echo ""

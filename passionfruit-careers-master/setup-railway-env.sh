#!/bin/bash

echo "🔧 Setting up Railway environment variables..."
echo ""

# Set all environment variables
railway variables -s adequate-rejoicing \
  --set "DATABASE_URL=\${{Postgres.DATABASE_URL}}" \
  --set "PORT=8080" \
  --set "JWT_SECRET=fee5f305c1e52ca7d7630987a604d318c5925a1cfab2f0121297247eefc98774" \
  --set "JWT_EXPIRES_IN=24h" \
  --set "R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com" \
  --set "R2_ACCESS_KEY_ID=8085ed1a4f07a374f6f803cf6b860242" \
  --set "R2_SECRET_ACCESS_KEY=686e9dc32e145bfbdfa2e7a64de3ea7cd72b0d0dc56fe3750d054bec5141e529" \
  --set "R2_BUCKET_NAME=passionfruit-careers" \
  --set "R2_PUBLIC_URL=https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev" \
  --set "API_URL=\${{RAILWAY_PUBLIC_DOMAIN}}" \
  --set "GEMINI_API_KEY=AIzaSyDy_HNPd4g1pEjQkWgbjGHZYgQ67Akl2Lw" \
  --set "GEMINI_MODEL=gemini-2.5-flash"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Railway will automatically redeploy with the new variables"
echo "2. Check the deployment logs to verify database connection"
echo "3. Import the database dump using: railway connect postgres"

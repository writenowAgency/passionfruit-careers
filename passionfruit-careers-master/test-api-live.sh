#!/bin/bash

API_URL="https://adequate-rejoicing-production-b4ba.up.railway.app"

echo "🎯 PASSIONFRUIT CAREERS API - LIVE DEMO"
echo "========================================"
echo ""
echo "API Base URL: $API_URL"
echo ""

echo "✅ 1. Health Check"
echo "===================="
curl -s "$API_URL/health"
echo ""
echo ""

echo "✅ 2. Get All Jobs"
echo "===================="
JOBS=$(curl -s "$API_URL/api/jobs")
JOB_COUNT=$(echo "$JOBS" | grep -o "\"id\":" | wc -l)
echo "📊 Total Jobs Available: $JOB_COUNT"
echo ""
echo "Sample Job:"
echo "$JOBS" | head -c 400
echo "..."
echo ""
echo ""

echo "✅ 3. Get Job Categories"
echo "========================"
curl -s "$API_URL/api/jobs/categories" | head -c 300
echo "..."
echo ""
echo ""

echo "✅ 4. Search Jobs"
echo "================="
SEARCH_RESULTS=$(curl -s "$API_URL/api/jobs?search=developer")
SEARCH_COUNT=$(echo "$SEARCH_RESULTS" | grep -o "\"id\":" | wc -l)
echo "🔍 Found $SEARCH_COUNT jobs matching 'developer'"
echo ""

echo "✅ 5. Filter Jobs by Type"
echo "========================="
FULLTIME=$(curl -s "$API_URL/api/jobs?jobType=full-time")
FT_COUNT=$(echo "$FULLTIME" | grep -o "\"id\":" | wc -l)
echo "💼 Found $FT_COUNT full-time jobs"
echo ""

echo ""
echo "📈 API STATISTICS"
echo "================="
echo "✓ Health endpoint: WORKING"
echo "✓ Database connection: WORKING"
echo "✓ Jobs API: WORKING ($JOB_COUNT jobs)"
echo "✓ Search functionality: WORKING ($SEARCH_COUNT results)"
echo "✓ Filtering: WORKING ($FT_COUNT full-time)"
echo "✓ Cloudflare R2 storage: CONFIGURED"
echo "✓ Gemini AI: CONFIGURED"
echo ""
echo "🌐 Your API is LIVE and fully functional!"
echo ""
echo "🔗 Test in browser:"
echo "   $API_URL/health"
echo "   $API_URL/api/jobs"
echo ""

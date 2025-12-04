#!/bin/bash

echo "Testing WriteNow Authentication System"
echo "======================================"
echo ""

API_URL="http://localhost:3000/api"

# Test 1: Login with valid credentials
echo "Test 1: Login with valid credentials"
echo "POST $API_URL/auth/login"
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ FAILED: No token received"
  echo "Response: $RESPONSE"
else
  echo "✓ PASSED: Login successful"
  echo "Token: ${TOKEN:0:50}..."
fi
echo ""

# Test 2: Access protected endpoint with token
echo "Test 2: Access protected endpoint"
echo "GET $API_URL/auth/me"
USER_RESPONSE=$(curl -s $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q "demo@writenow.com"; then
  echo "✓ PASSED: Protected endpoint accessible with valid token"
  echo "User: $USER_RESPONSE"
else
  echo "❌ FAILED: Protected endpoint not accessible"
  echo "Response: $USER_RESPONSE"
fi
echo ""

# Test 3: Login with invalid credentials
echo "Test 3: Login with invalid credentials"
echo "POST $API_URL/auth/login (with wrong password)"
INVALID_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"WrongPassword"}')

if echo "$INVALID_RESPONSE" | grep -q "Invalid"; then
  echo "✓ PASSED: Invalid credentials rejected"
  echo "Response: $INVALID_RESPONSE"
else
  echo "❌ FAILED: Should reject invalid credentials"
  echo "Response: $INVALID_RESPONSE"
fi
echo ""

# Test 4: Access protected endpoint without token
echo "Test 4: Access protected endpoint without token"
echo "GET $API_URL/auth/me (no token)"
NO_TOKEN_RESPONSE=$(curl -s $API_URL/auth/me)

if echo "$NO_TOKEN_RESPONSE" | grep -q "required\|401"; then
  echo "✓ PASSED: Protected endpoint requires authentication"
  echo "Response: $NO_TOKEN_RESPONSE"
else
  echo "❌ FAILED: Should require authentication"
  echo "Response: $NO_TOKEN_RESPONSE"
fi
echo ""

echo "======================================"
echo "All tests completed!"

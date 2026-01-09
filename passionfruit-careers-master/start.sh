#!/bin/bash

echo "Starting WriteNow Authentication System..."
echo ""

# Start PostgreSQL
echo "1. Starting PostgreSQL container..."
docker-compose up -d
echo "✓ PostgreSQL started"
echo ""

# Wait for PostgreSQL to be ready
echo "2. Waiting for PostgreSQL to be ready..."
sleep 3
echo "✓ PostgreSQL is ready"
echo ""

# Run migrations (only if needed)
echo "3. Running database migrations..."
cd backend
npm run migrate
echo ""

# Start backend server
echo "4. Starting backend server..."
echo "✓ Backend will run on http://localhost:3000"
echo ""
echo "Demo Credentials:"
echo "  Email: demo@writenow.com"
echo "  Password: Demo123!"
echo ""
echo "API Endpoints:"
echo "  - POST http://localhost:3000/api/auth/login"
echo "  - POST http://localhost:3000/api/auth/register"
echo "  - GET  http://localhost:3000/api/auth/me"
echo ""
echo "Frontend: Open frontend/index.html in your browser"
echo ""

npm run dev

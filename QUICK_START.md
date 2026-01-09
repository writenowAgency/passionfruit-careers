# WriteNow - Quick Start Guide

## What's Been Created

A complete authentication system with:
- PostgreSQL database running in Docker
- Node.js/Express backend API with TypeScript
- JWT-based authentication
- HTML/CSS/JavaScript login page
- Demo user credentials pre-configured

## Current Status

✓ PostgreSQL container is running
✓ Backend server is running on http://localhost:3000
✓ Database schema created
✓ Demo user credentials added
✓ All authentication tests passing

## Demo Credentials

```
Email: demo@writenow.com
Password: Demo123!
```

## How to Use

### Option 1: Use the Login Page (Recommended)

1. Open `frontend/index.html` in your web browser
2. Use the demo credentials shown on the page
3. Click "Sign In"

### Option 2: Use the API Directly

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}'

# The response will include a JWT token
# Use it to access protected endpoints:

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
passionfruit-careers/
├── backend/                    # Backend API microservice
│   ├── src/
│   │   ├── database/
│   │   │   ├── config.ts      # Database connection
│   │   │   └── migrate.ts     # Database schema & seed data
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT authentication middleware
│   │   ├── routes/
│   │   │   └── auth.ts        # Authentication routes
│   │   ├── services/
│   │   │   └── authService.ts # Authentication business logic
│   │   └── index.ts           # Express server setup
│   ├── .env                   # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── index.html             # Login page
├── docker-compose.yml         # PostgreSQL container configuration
├── .env.postgres              # Database credentials
├── AUTH_README.md             # Full authentication documentation
├── test-auth.sh              # Automated test suite
└── start.sh                  # Quick start script

```

## Available API Endpoints

### POST /api/auth/login
Login with email and password

**Request:**
```json
{
  "email": "demo@writenow.com",
  "password": "Demo123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "demo@writenow.com",
    "first_name": "Demo",
    "last_name": "User"
  }
}
```

### POST /api/auth/register
Create a new user account

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### GET /api/auth/me
Get current user info (requires authentication)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### users table
```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### sessions table
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (references users)
- token_hash: VARCHAR(255) NOT NULL
- expires_at: TIMESTAMP NOT NULL
- created_at: TIMESTAMP
```

## Managing the System

### Check if services are running

```bash
# Check PostgreSQL
docker ps

# Check backend server
# If started with npm run dev, check the terminal
```

### Stop services

```bash
# Stop backend: Ctrl+C in the terminal where it's running

# Stop PostgreSQL
docker-compose down
```

### Restart everything

```bash
# Start PostgreSQL
docker-compose up -d

# Start backend
cd backend
npm run dev
```

### View database

```bash
# Connect to PostgreSQL
docker exec -it writenow-postgres psql -U writenow -d writenow_db

# View users
SELECT * FROM users;

# Exit
\q
```

### Run tests

```bash
bash test-auth.sh
```

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Token expiration (24 hours)
- Session tracking in database
- Input validation using express-validator
- CORS enabled for cross-origin requests
- SQL injection prevention with parameterized queries

## Next Steps

1. Add more API endpoints for your application
2. Implement password reset functionality
3. Add email verification
4. Create more pages (dashboard, profile, etc.)
5. Add refresh token mechanism
6. Implement role-based access control (RBAC)
7. Add rate limiting to prevent brute force attacks
8. Set up logging and monitoring

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Ensure PostgreSQL is running: `docker ps`
- Check environment variables in `backend/.env`

### Can't login
- Verify PostgreSQL is running
- Check backend logs for errors
- Ensure migrations ran successfully: `npm run migrate`
- Verify demo user exists in database

### Database connection error
- Ensure Docker is running
- Check PostgreSQL container: `docker-compose ps`
- Verify credentials in `.env` file match `docker-compose.yml`

## Support

For detailed documentation, see `README.md`

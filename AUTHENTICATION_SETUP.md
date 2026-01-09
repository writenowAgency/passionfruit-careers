# Authentication System Setup - Complete

## Overview

A complete authentication system has been integrated into the passionfruit-careers project with:
- PostgreSQL database running in Docker
- Node.js/Express backend API with TypeScript
- JWT-based authentication
- Secure password hashing with bcrypt
- Frontend login page
- Demo user credentials pre-configured

## Current Status

✅ PostgreSQL container running (port 5432)
✅ Backend API running on http://localhost:3000
✅ Database schema created (users and sessions tables)
✅ Demo user credentials added
✅ All authentication tests passing
✅ All files organized in passionfruit-careers folder

## Demo Credentials

```
Email: demo@writenow.com
Password: Demo123!
```

## Project Structure

```
passionfruit-careers/
├── backend/                    # Backend API microservice
│   ├── src/
│   │   ├── database/
│   │   │   ├── config.ts      # PostgreSQL connection pool
│   │   │   └── migrate.ts     # Database migrations & seed data
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT authentication middleware
│   │   ├── routes/
│   │   │   └── auth.ts        # Auth API routes (login, register, me)
│   │   ├── services/
│   │   │   └── authService.ts # Authentication business logic
│   │   └── index.ts           # Express server setup
│   ├── .env                   # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── index.html             # Beautiful login page with demo credentials
├── docker-compose.yml         # PostgreSQL container configuration
├── .env.postgres              # Database connection details
├── start.sh                   # Quick start script
├── test-auth.sh              # Automated test suite
├── AUTH_README.md            # Detailed authentication documentation
└── QUICK_START.md            # Quick reference guide
```

## Quick Start

### Starting the System

1. **PostgreSQL is already running** from the root `docker-compose.yml`
   ```bash
   cd passionfruit-careers
   docker-compose ps  # Verify it's running
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

   Or use the helper script:
   ```bash
   bash start.sh
   ```

3. **Open the login page**
   - Navigate to `passionfruit-careers/frontend/index.html`
   - Open it in your browser
   - Use demo credentials to test

### Running Tests

```bash
cd passionfruit-careers
bash test-auth.sh
```

All 4 tests should pass:
- ✓ Login with valid credentials
- ✓ Access protected endpoint with token
- ✓ Invalid credentials rejected
- ✓ Protected endpoint requires authentication

## API Endpoints

### POST /api/auth/login
Authenticate user and receive JWT token

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
Get current authenticated user info

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### users table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### sessions table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration Files

### backend/.env
```env
PORT=3000
DATABASE_URL=postgresql://writenow:writenow_dev_password@localhost:5432/writenow_db
JWT_SECRET=your-secret-key-change-in-production-abc123xyz789
JWT_EXPIRES_IN=24h
```

### docker-compose.yml
PostgreSQL 16 with:
- User: `writenow`
- Password: `writenow_dev_password`
- Database: `writenow_db`
- Port: `5432`

## Security Features

- ✓ Passwords hashed with bcrypt (10 rounds)
- ✓ JWT tokens for stateless authentication
- ✓ Token expiration (24 hours by default)
- ✓ Session tracking in database
- ✓ Input validation using express-validator
- ✓ CORS enabled for cross-origin requests
- ✓ SQL injection prevention (parameterized queries)
- ✓ Environment variables for sensitive data

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}'

# Save the token from the response, then:
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Integration with Existing App

The authentication system is ready to be integrated with your existing passionfruit-careers React Native app:

1. **Use the API endpoints** from your mobile app
2. **Store JWT tokens** in secure storage (AsyncStorage or Keychain)
3. **Add Authorization headers** to protected API calls
4. **Handle token expiration** and refresh logic

Example React Native integration:
```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, user } = await response.json();

// Store token
await AsyncStorage.setItem('authToken', token);

// Use in subsequent requests
const protectedResponse = await fetch('http://localhost:3000/api/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Maintenance Commands

### Database

```bash
# Connect to database
docker exec -it writenow-postgres psql -U writenow -d writenow_db

# View users
SELECT * FROM users;

# View sessions
SELECT * FROM sessions;

# Exit
\q
```

### Reset Database

```bash
cd passionfruit-careers/backend
npm run migrate  # Re-runs migrations
```

### Stop Services

```bash
# Stop backend: Ctrl+C in the terminal

# Stop PostgreSQL
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

## Next Steps

1. Integrate authentication with your React Native app
2. Add password reset functionality
3. Implement email verification
4. Add role-based access control (RBAC)
5. Set up refresh tokens for better security
6. Add rate limiting to prevent brute force attacks
7. Implement OAuth2 providers (Google, Facebook, etc.)
8. Add two-factor authentication (2FA)
9. Set up logging and monitoring
10. Prepare for production deployment

## Troubleshooting

### Backend won't start
- Check if port 3000 is available: `netstat -ano | findstr :3000`
- Verify PostgreSQL is running: `docker ps`
- Check logs for errors

### Database connection failed
- Ensure Docker is running
- Verify PostgreSQL container: `docker-compose ps`
- Check credentials in `.env` files match

### Can't login
- Verify migrations ran: `npm run migrate`
- Check demo user exists in database
- Verify password is correct: `Demo123!`

## Documentation

- **AUTH_README.md** - Comprehensive authentication system documentation
- **QUICK_START.md** - Quick reference guide
- **test-auth.sh** - Run this to verify everything works

## Support

If you encounter any issues:
1. Check the logs in the backend terminal
2. Run the test suite: `bash test-auth.sh`
3. Verify database connection
4. Check environment variables

---

**Authentication system successfully set up and tested!** 🎉

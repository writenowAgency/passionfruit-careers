# API Integration - Real-Time Database Authentication

## Overview

The React Native app has been successfully connected to the backend PostgreSQL database for real-time authentication. Users can now sign in and register using actual database credentials.

## What Was Changed

### 1. API Configuration
**File**: `src/config/api.ts`
- Created API configuration with base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.passionfruit.careers`

### 2. Authentication API Service
**File**: `src/services/authApi.ts`
- Created `authApi` service with methods:
  - `login(email, password)` - Authenticate user
  - `register(email, password, firstName, lastName)` - Create new user
  - `getCurrentUser(token)` - Get current user info

### 3. Updated LoginScreen
**File**: `src/screens/auth/LoginScreen.tsx`
- ✅ Now calls real API endpoint: `POST /api/auth/login`
- ✅ Stores real JWT token in Redux
- ✅ Shows error alerts for failed login
- ✅ Updated demo credentials to match database
- ✅ Tracks analytics for login attempts and success

### 4. Updated RegisterScreen
**File**: `src/screens/auth/RegisterScreen.tsx`
- ✅ Now calls real API endpoint: `POST /api/auth/register`
- ✅ Stores real JWT token in Redux
- ✅ Shows success/error alerts
- ✅ Splits full name into first and last name
- ✅ Creates actual user in database

## Demo Credentials

The app now displays the correct demo credentials:

```
Email: demo@writenow.com
Password: Demo123!
```

These credentials are stored in the PostgreSQL database and authenticate against the real backend.

## How It Works

### Login Flow:
1. User enters email and password
2. App calls `authApi.login()` → `POST http://localhost:3000/api/auth/login`
3. Backend validates credentials against PostgreSQL database
4. If valid, backend returns JWT token and user data
5. App stores token in Redux store
6. User is authenticated and navigates to main app

### Registration Flow:
1. User enters full name, email, and password
2. App splits name into first/last name
3. App calls `authApi.register()` → `POST http://localhost:3000/api/auth/register`
4. Backend creates new user in PostgreSQL database
5. Backend returns JWT token and user data
6. App stores token in Redux store
7. User is automatically logged in

## Testing

### Test Login:
1. Open the app (web or mobile)
2. Use demo credentials: `demo@writenow.com` / `Demo123!`
3. Click "Sign In"
4. Should successfully authenticate and navigate to main app

### Test Registration:
1. Click "Create a Free Account"
2. Enter:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "SecurePass123!"
3. Click "Create Account"
4. Should create new user and log in automatically

### Verify in Database:
```bash
cd passionfruit-careers
docker exec -it writenow-postgres psql -U writenow -d writenow_db

# View all users
SELECT id, email, first_name, last_name, created_at FROM users;

# Exit
\q
```

## Important Notes

### For Physical Device Testing:
If testing on a physical device, you need to update the API base URL to use your computer's local IP address instead of `localhost`.

**Find your IP:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

**Update** `src/config/api.ts`:
```typescript
BASE_URL: __DEV__
  ? 'http://192.168.1.100:3000/api'  // Replace with your actual IP
  : 'https://api.passionfruit.careers'
```

### Backend Must Be Running:
Ensure the backend API is running on port 3000:
```bash
cd passionfruit-careers/backend
npm run dev
```

### Database Must Be Running:
Ensure PostgreSQL is running:
```bash
docker ps  # Should show writenow-postgres container
```

## API Endpoints

### POST /api/auth/login
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
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### GET /api/auth/me
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "demo@writenow.com",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

## Error Handling

Both screens now have proper error handling:

### Login Errors:
- Invalid credentials → Alert: "Invalid email or password"
- Network error → Alert: "An unexpected error occurred"
- Server error → Alert with specific error message

### Registration Errors:
- Email already exists → Alert: "User already exists"
- Validation error → Alert with specific validation message
- Network error → Alert: "An unexpected error occurred"

## Redux State

The authentication token is stored in Redux:
```typescript
// Redux state structure
{
  auth: {
    token: "eyJhbGciOiJIUzI1NiIs...",
    userRole: "jobSeeker" | "employer",
    isAuthenticated: true
  }
}
```

## Security Features

✅ Passwords hashed with bcrypt in database
✅ JWT tokens for stateless authentication
✅ Tokens expire after 24 hours
✅ HTTPS in production
✅ SQL injection prevention (parameterized queries)
✅ Input validation on both client and server

## Next Steps

1. **Token Refresh**: Implement token refresh mechanism
2. **Persistent Auth**: Store token in AsyncStorage/SecureStore
3. **Auto-Login**: Check for stored token on app launch
4. **Profile Screen**: Show user data from JWT token
5. **Logout**: Clear token from Redux and storage
6. **Password Reset**: Implement forgot password flow
7. **Email Verification**: Add email verification step
8. **Social Login**: Add Google/Facebook OAuth

## Troubleshooting

### "Network request failed"
- Check if backend is running on port 3000
- For physical devices, use computer's IP instead of localhost
- Check firewall settings

### "Invalid email or password"
- Verify demo credentials: `demo@writenow.com` / `Demo123!`
- Check database has demo user: `npm run migrate`

### App doesn't update
- Press 'r' in Metro bundler to reload
- Clear Metro cache: `npx expo start -c`

## Files Changed

```
passionfruit-careers/
├── src/
│   ├── config/
│   │   └── api.ts                    [NEW] API configuration
│   ├── services/
│   │   └── authApi.ts                [NEW] Authentication API service
│   └── screens/
│       └── auth/
│           ├── LoginScreen.tsx       [MODIFIED] Connected to real API
│           └── RegisterScreen.tsx    [MODIFIED] Connected to real API
└── API_INTEGRATION.md                [NEW] This document
```

---

**Status**: ✅ Complete - Authentication fully integrated with PostgreSQL database
**Last Updated**: December 4, 2025

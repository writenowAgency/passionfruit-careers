# WriteNow - Authentication System

A complete authentication system with PostgreSQL database, Node.js backend API, and frontend login page.

## Project Structure

```
passionfruit-careers/
├── backend/                 # Backend API microservice
│   ├── src/
│   │   ├── database/       # Database configuration and migrations
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Login page
│   └── index.html
├── docker-compose.yml      # PostgreSQL container
└── .env.postgres           # Database configuration
```

## Demo Credentials

- **Email**: `demo@writenow.com`
- **Password**: `Demo123!`

## Setup Instructions

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts a PostgreSQL container with the following credentials:
- User: `writenow`
- Password: `writenow_dev_password`
- Database: `writenow_db`
- Port: `5432`

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Run Database Migrations

```bash
npm run migrate
```

This will:
- Create the `users` table
- Create the `sessions` table
- Insert the demo user credentials

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Open the Login Page

Open `frontend/index.html` in your browser, or use a local server:

```bash
cd frontend
npx serve .
```

Then navigate to the provided URL (usually `http://localhost:3000` or `http://localhost:5000`)

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

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
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "demo@writenow.com",
    "first_name": "Demo",
    "last_name": "User"
  }
}
```

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

## Testing the System

### Using the Frontend

1. Open `frontend/index.html` in your browser
2. Use the demo credentials:
   - Email: `demo@writenow.com`
   - Password: `Demo123!`
3. Click "Sign In"
4. You should see a welcome message with user details

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@writenow.com","password":"Demo123!"}'

# Get user info (replace TOKEN with the token from login response)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

### Backend (.env)

```
PORT=3000
DATABASE_URL=postgresql://writenow:writenow_dev_password@localhost:5432/writenow_db
JWT_SECRET=your-secret-key-change-in-production-abc123xyz789
JWT_EXPIRES_IN=24h
```

## Database Schema

### Users Table

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

### Sessions Table

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Database Connection Issues

1. Make sure Docker is running
2. Check if PostgreSQL container is up: `docker ps`
3. Verify database credentials in `.env` file

### Backend Server Issues

1. Ensure all dependencies are installed: `npm install`
2. Check if port 3000 is available
3. Verify database connection by checking server logs

### Login Issues

1. Make sure backend server is running
2. Check browser console for errors
3. Verify demo credentials are correct
4. Ensure CORS is enabled (already configured)

## Security Notes

- The JWT secret should be changed in production
- Passwords are hashed using bcrypt
- Tokens expire after 24 hours
- All API requests use HTTPS in production
- Input validation is implemented using express-validator

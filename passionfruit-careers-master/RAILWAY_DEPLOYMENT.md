# Railway Deployment Guide for Passionfruit Careers

## Prerequisites
✅ Railway CLI installed and logged in
✅ Dockerfile created for backend
✅ Database dump ready (writenow_db_dump.sql)

## Deployment Steps

### Option 1: Using Railway Web Dashboard (Recommended)

#### Step 1: Create New Project
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Empty Project"
4. Name it: `passionfruit-careers-api`

#### Step 2: Add PostgreSQL Database
1. In your new project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning to complete
4. Note the connection details from "Variables" tab

#### Step 3: Add Backend Service
1. Click "+ New" again
2. Select "GitHub Repo"
3. Connect your GitHub account if not already connected
4. Select: `Mokgadi-Julius/passionfruit-careers`
5. Configure service:
   - **Root Directory**: `backend`
   - **Build Command**: Auto-detected from Dockerfile
   - **Start Command**: `node dist/index.js`

#### Step 4: Configure Environment Variables
In the backend service, add these variables:

```
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-production-jwt-secret-change-this
JWT_EXPIRES_IN=24h
R2_ENDPOINT=https://0f1cd411ceee2e9302b63a87ae4f36be.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=8085ed1a4f07a374f6f803cf6b860242
R2_SECRET_ACCESS_KEY=686e9dc32e145bfbdfa2e7a64de3ea7cd72b0d0dc56fe3750d054bec5141e529
R2_BUCKET_NAME=passionfruit-careers
R2_PUBLIC_URL=https://pub-11cc6506f166460fa4f853b712b0b8b2.r2.dev
API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
GEMINI_API_KEY=AIzaSyDy_HNPd4g1pEjQkWgbjGHZYgQ67Akl2Lw
GEMINI_MODEL=gemini-2.5-flash
```

**Important**: The `${{Postgres.DATABASE_URL}}` will auto-reference your PostgreSQL service.

#### Step 5: Import Database Dump
Once PostgreSQL is running:

```bash
# Get the database connection string
railway variables -s postgres

# Connect and import the dump
railway run -s postgres psql < writenow_db_dump.sql
```

OR use the Railway Connect feature:
```bash
# Connect to PostgreSQL
railway connect postgres

# Then in psql:
\i /path/to/writenow_db_dump.sql
```

#### Step 6: Generate Public Domain
1. Go to your backend service settings
2. Click "Generate Domain" or "Settings" → "Networking"
3. Railway will provide a public URL like: `your-service.up.railway.app`

#### Step 7: Deploy
1. Push any code changes to GitHub
2. Railway will automatically deploy
3. Monitor logs in Railway dashboard

### Option 2: Using Railway CLI

#### Step 1: Initialize Project (Manual - requires interaction)
```bash
cd backend
railway init
# Follow prompts to create new project
```

#### Step 2: Add PostgreSQL
```bash
railway add --plugin postgresql
```

#### Step 3: Set Environment Variables
Create a `.env.railway` file with production values, then:
```bash
railway variables set PORT=3000
railway variables set JWT_SECRET=your-production-secret
# ... set all other variables
```

#### Step 4: Deploy
```bash
railway up
```

## Post-Deployment

### 1. Verify Deployment
```bash
# Check service status
railway status

# View logs
railway logs
```

### 2. Test Health Endpoint
```bash
curl https://your-service.up.railway.app/health
```

### 3. Test Authentication
```bash
curl -X POST https://your-service.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Database Import Methods

### Method 1: Railway CLI
```bash
railway connect postgres
\i /absolute/path/to/writenow_db_dump.sql
\q
```

### Method 2: Direct psql
```bash
# Get DATABASE_URL from Railway
railway variables | grep DATABASE_URL

# Import dump
psql "postgresql://user:pass@host:port/db" < writenow_db_dump.sql
```

### Method 3: pgAdmin or TablePlus
1. Get connection details from Railway dashboard
2. Connect using your preferred GUI tool
3. Import SQL dump file

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Railway build logs

### Database Connection Fails
- Verify DATABASE_URL is set correctly
- Check if PostgreSQL service is running
- Ensure services are in same project

### Health Check Fails
- Verify `/health` endpoint exists
- Check if app is binding to correct PORT
- Review application logs

## Important Notes

1. **JWT_SECRET**: Change the default JWT secret to a strong, random value for production
2. **Database Backup**: Railway provides automatic backups, but consider additional backup strategy
3. **Monitoring**: Set up Railway's monitoring and alerts
4. **Scaling**: Configure autoscaling if needed in service settings
5. **Custom Domain**: Add custom domain in service settings for production

## Current Configuration

- **Backend Port**: 3000
- **Database**: PostgreSQL 16
- **Storage**: Cloudflare R2 (already configured)
- **AI Service**: Google Gemini
- **Health Check**: `/health` endpoint

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/Mokgadi-Julius/passionfruit-careers/issues

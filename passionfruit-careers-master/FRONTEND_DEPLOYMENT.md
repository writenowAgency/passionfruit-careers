# Frontend Deployment Guide (Railway)

This guide explains how to deploy the **Frontend** (React Native Web App) to Railway.
This should be done **after** you have deployed the Backend.

## Prerequisites
✅ Backend deployed and running (you need its URL)
✅ Railway account
✅ GitHub repository connected

## Deployment Steps

### Step 1: Add Frontend Service
1. Open your project in the [Railway Dashboard](https://railway.app/dashboard).
2. Click the `+ New` button.
3. Select **GitHub Repo**.
4. Select the same repository: `Mokgadi-Julius/passionfruit-careers`.
5. This creates a new service. Click on it to configure settings.

### Step 2: Configure Service Settings
Go to the **Settings** tab of the new service:

1. **Root Directory**: Leave empty (it defaults to root `/`) or type `/`.
2. **Build Command**: `npm run build`
   *(This runs `expo export --platform web`)*
3. **Start Command**: `npm start`
   *(This runs `npx serve dist --single --listen ${PORT:-3000}`)*
4. **Watch Paths**: `*` (default)

### Step 3: Configure Environment Variables
Go to the **Variables** tab:

1. Add `EXPO_PUBLIC_API_URL`
2. Value: Your **Backend Public URL** (e.g., `https://passionfruit-careers-api-production.up.railway.app/api`)
   *Note: Make sure to include `/api` at the end if your backend expects it.*

### Step 4: Generate Public Domain
Go to the **Settings** tab:

1. Scroll to **Networking**.
2. Click **Generate Domain** (or set a custom one).
3. This is your **Frontend URL**.

### Step 5: Verify
1. Wait for the deployment to finish (green checkmark).
2. Click the generated Frontend URL.
3. You should see the login screen.
4. Try logging in. It should talk to your backend.

## Troubleshooting

- **"Invalid Host header"**: If you see this, make sure `EXPO_PUBLIC_API_URL` is set correctly.
- **404 Not Found**: Ensure the Start Command is correct (`npm start`).
- **CORS Errors**: If the browser blocks requests, check your Backend's CORS settings. (You might need to add the Frontend Domain to the Backend's allowed origins).


# Secure Deployment with Backend API

## Architecture Overview

This React app uses the **backend API** at `ponce-patient-backend.vercel.app` for all Airtable operations. This ensures:

- ✅ **API keys never exposed to client** - Keys stay on the backend
- ✅ **Consistent with other frontends** - Same backend as your other projects
- ✅ **Centralized key management** - Update keys in one place
- ✅ **Secure by default** - No risk of exposing secrets

## How It Works

```
React App (Vercel)
    ↓
API calls to: https://ponce-patient-backend.vercel.app/api/dashboard/*
    ↓
Backend (Vercel) - Has AIRTABLE_API_KEY securely stored
    ↓
Airtable API
```

## Backend Endpoints Used

The React app uses these backend endpoints:

1. **GET `/api/dashboard/leads?tableName=Photos`** - Fetch cases/photos
   - Supports pagination with `offset` parameter
   - Returns: `{ success: true, records: [...], offset: "..." }`

2. **POST `/api/dashboard/leads`** - Create lead
   - Body: `{ fields: {...} }`
   - Returns: `{ success: true, record: {...} }`

3. **PATCH `/api/dashboard/leads/:recordId`** - Update lead
   - Body: `{ fields: {...} }`
   - Returns: `{ success: true, record: {...} }`

## Vercel Deployment Setup

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your Git repository
3. Configure:
   - **Root Directory**: `skin-type-react`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Production Branch**: `staging` (for staging) or `main` (for production)

### Step 2: Set Environment Variables

**In your React app's Vercel project**, set:

```
VITE_PRACTICE_NAME=unique  # or 'lakeshore'
VITE_BACKEND_API_URL=https://ponce-patient-backend.vercel.app  # Optional, this is default
VITE_USE_BACKEND_API=true  # Optional, defaults to true
VITE_POSTHOG_KEY=your_posthog_key  # Optional, for analytics
```

**⚠️ DO NOT SET:**
- ❌ `VITE_AIRTABLE_API_KEY` - Would expose key to client!
- ❌ `VITE_AIRTABLE_BASE_ID` - Not needed
- ❌ `AIRTABLE_API_KEY` - Not needed (backend has it)
- ❌ `AIRTABLE_BASE_ID` - Not needed (backend has it)

### Step 3: Configure Backend CORS

**In your backend's Vercel project** (`ponce-patient-backend`):

1. Go to Settings → Environment Variables
2. Update `FRONTEND_URL` to include your new deployment URL:
   ```
   https://patients.ponce.ai,https://your-staging-app.vercel.app,http://localhost:5173
   ```
3. **Redeploy backend** after updating FRONTEND_URL

### Step 4: Deploy

1. Push your code to the branch (staging or main)
2. Vercel will auto-deploy
3. Your app will use the backend API automatically

## Environment Variables Reference

### React App Vercel Project

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PRACTICE_NAME` | ✅ Yes | `unique` or `lakeshore` |
| `VITE_BACKEND_API_URL` | ❌ No | Backend URL (defaults to `https://ponce-patient-backend.vercel.app`) |
| `VITE_USE_BACKEND_API` | ❌ No | Use backend API (defaults to `true`) |
| `VITE_POSTHOG_KEY` | ❌ No | PostHog analytics key |

### Backend Vercel Project

| Variable | Required | Description |
|----------|----------|-------------|
| `AIRTABLE_API_KEY` | ✅ Yes | Airtable API key (already set) |
| `AIRTABLE_BASE_ID` | ✅ Yes | Airtable Base ID (already set) |
| `FRONTEND_URL` | ✅ Yes | Comma-separated list of allowed frontend URLs |

## Local Development

For local development, the app will:
- ✅ Use backend API by default (`VITE_USE_BACKEND_API=true`)
- ✅ Call `https://ponce-patient-backend.vercel.app` for all API requests
- ✅ Never expose API keys locally

**No `.env` file needed** - the app uses the backend API!

If you want to test with local API routes (not recommended):
```env
VITE_USE_BACKEND_API=false
```

## Security Benefits

### ✅ What This Architecture Provides

1. **No client-side API keys** - Keys never in React code or environment variables
2. **Backend handles authentication** - All Airtable calls go through backend
3. **CORS protection** - Backend only accepts requests from allowed domains
4. **Centralized management** - Update API keys in one place (backend)
5. **Consistent architecture** - Same pattern as your other frontend projects

### ❌ What We Avoided

- No `VITE_AIRTABLE_API_KEY` - Would be exposed in client bundle
- No direct Airtable API calls - Would require client-side keys
- No duplicate key management - Backend is single source of truth

## Troubleshooting

### "Failed to fetch" or CORS errors

1. **Check backend FRONTEND_URL**:
   - Go to backend Vercel project
   - Verify your deployment URL is in `FRONTEND_URL`
   - Format: `https://your-app.vercel.app,https://patients.ponce.ai`

2. **Redeploy backend** after updating FRONTEND_URL

3. **Check backend is accessible**:
   ```bash
   curl https://ponce-patient-backend.vercel.app/api/dashboard/leads?tableName=Photos
   ```

### "404 Not Found" for API endpoints

1. Verify backend has the dashboard endpoints deployed
2. Check backend logs in Vercel dashboard
3. Test backend directly (see curl command above)

### Cases not loading

1. Check browser console for errors
2. Verify backend is returning data:
   ```bash
   curl "https://ponce-patient-backend.vercel.app/api/dashboard/leads?tableName=Photos" | jq '.records | length'
   ```
3. Check that `tableName=Photos` is correct (case-sensitive)

## Summary

- ✅ React app uses backend API (no API keys needed)
- ✅ Backend has API keys securely stored
- ✅ CORS configured in backend's FRONTEND_URL
- ✅ Safe to deploy - no secrets exposed

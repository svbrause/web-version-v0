# How to Deploy Changes to Vercel

## Option 1: Automatic Deployment (Recommended)

Vercel automatically deploys when you push to your connected Git repository.

### Step 1: Stage and Commit Changes

```bash
# Add all the security fix files
git add api/
git add skin-type-react/src/utils/airtableLeads.ts
git add skin-type-react/src/utils/airtableSync.ts
git add skin-type-react/src/App.tsx
git add vercel.json
git add SECURITY_FIX_MIGRATION_GUIDE.md
git add ENVIRONMENT_VARIABLES_SETUP.md

# Or add all changes at once
git add .

# Commit the changes
git commit -m "Security fix: Move Airtable API calls to secure serverless functions"
```

### Step 2: Push to Repository

```bash
git push origin main
```

### Step 3: Vercel Auto-Deploys

- Vercel will automatically detect the push
- It will start a new deployment
- You can watch it in the Vercel Dashboard → Deployments

## Option 2: Manual Deployment via Vercel CLI

If you prefer to deploy manually or want to test first:

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to preview environment
vercel

# Or deploy directly to production
vercel --prod
```

## Option 3: Manual Deployment via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** tab
4. Click **"Redeploy"** on the latest deployment
5. Or click **"Create Deployment"** → **"Deploy from Git"**

## Important: Set Environment Variables First!

**Before deploying**, make sure you've set the environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `AIRTABLE_API_KEY` = (your API key - **without** `VITE_` prefix)
   - `AIRTABLE_BASE_ID` = `appXblSpAMBQskgzB`
3. Select all environments: **Production**, **Preview**, **Development**
4. Click **Save**

**Then deploy** - the environment variables will be available to your serverless functions.

## Verify Deployment

After deployment:

1. Visit your site: `https://cases.ponce.ai`
2. Open browser DevTools (F12) → **Network** tab
3. Look for requests to `/api/airtable-*` (not direct Airtable calls)
4. Check **Sources** tab - your API key should NOT appear

## Troubleshooting

### "API route not found" Error

**Problem**: Vercel isn't finding the `/api` routes

**Solution**:
1. Verify the `api/` folder is in the project root (same level as `vercel.json`)
2. Check that `vercel.json` has the API route rewrite
3. Make sure you committed and pushed the `api/` folder

### "Function execution failed" Error

**Problem**: Serverless function can't find environment variables

**Solution**:
1. Verify `AIRTABLE_API_KEY` is set in Vercel (without `VITE_` prefix)
2. Make sure you selected all environments when adding the variable
3. Redeploy after adding variables

### Changes Not Appearing

**Problem**: Deployment succeeded but changes aren't visible

**Solution**:
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check Vercel deployment logs for errors
4. Verify the deployment actually completed successfully

## Quick Deploy Command

If you want to commit and push everything at once:

```bash
git add .
git commit -m "Security fix: Move Airtable API calls to secure serverless functions"
git push origin main
```

Then wait for Vercel to auto-deploy (usually takes 1-2 minutes).

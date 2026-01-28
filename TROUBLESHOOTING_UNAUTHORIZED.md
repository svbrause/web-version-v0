# Troubleshooting: Unauthorized Error After API Key Update

If you're getting an "unauthorized" error after updating your API key in Vercel, follow these steps:

## Common Causes

### 1. Environment Variable Not Available to Deployment

**Problem**: You added the environment variable, but the current deployment was created BEFORE you added it.

**Solution**: **Redeploy** after adding environment variables.

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Find the latest deployment
3. Click the **three dots (⋯)** → **Redeploy**
4. Or trigger a new deployment by pushing a commit

### 2. Environment Variable Not Set for Production

**Problem**: The variable is set for Preview/Development but not Production.

**Solution**: Make sure Production is selected.

1. Go to Vercel Dashboard → Settings → **Environment Variables**
2. Find `AIRTABLE_API_KEY`
3. Click **Edit**
4. Make sure **Production** is checked (along with Preview and Development)
5. Click **Save**
6. **Redeploy** your production deployment

### 3. Wrong Variable Name

**Problem**: Typo in variable name (e.g., `AIRTABLE_API_KEY` vs `AIRTABLE_APIKEY`)

**Solution**: Verify the exact name.

1. Check Vercel Dashboard → Settings → Environment Variables
2. Variable name must be exactly: `AIRTABLE_API_KEY` (with underscores)
3. Not `VITE_AIRTABLE_API_KEY` (no VITE_ prefix for server-side)

### 4. API Key Format Issue

**Problem**: Extra spaces, quotes, or formatting issues when pasting.

**Solution**: Copy the key carefully.

1. In Airtable, copy the API key (starts with `pat...`)
2. In Vercel, paste it directly without quotes or extra spaces
3. Make sure there are no leading/trailing spaces

### 5. Old Deployment Still Running

**Problem**: Browser is caching or you're looking at an old deployment.

**Solution**: Clear cache and check the right deployment.

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check Vercel Dashboard → Deployments to see which deployment is live
3. Make sure it's the one deployed AFTER you added the environment variable

## Step-by-Step Fix

### Step 1: Verify Environment Variable is Set

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Your Project → **Settings** → **Environment Variables**
3. Verify `AIRTABLE_API_KEY` exists
4. Click on it to see the value (should start with `pat...`)
5. Verify it's selected for **Production**, **Preview**, and **Development**

### Step 2: Check Function Logs

1. Go to Vercel Dashboard → Your Project → **Functions**
2. Click on one of the API routes (e.g., `airtable-cases`)
3. Click **View Logs**
4. Look for error messages or the debug output
5. Check if it says "AIRTABLE_API_KEY not configured"

### Step 3: Redeploy

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click **three dots (⋯)** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Via Git Push**
```bash
# Make a small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with new API key"
git push origin main
```

### Step 4: Test Again

1. Visit `https://cases.ponce.ai`
2. Open browser DevTools (F12) → **Network** tab
3. Look for requests to `/api/airtable-cases`
4. Check the response - should not be "unauthorized"

## Verify API Key is Correct

1. Test the API key directly with Airtable:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        "https://api.airtable.com/v0/appXblSpAMBQskgzB/Photos?maxRecords=1"
   ```
   
   Replace `YOUR_API_KEY` with your actual key. This should return data, not an error.

2. If this works, the key is valid - the issue is with Vercel configuration.
3. If this fails, the key might be wrong or revoked.

## Check Vercel Function Logs

The updated API routes now include debug logging. To see it:

1. Go to Vercel Dashboard → Your Project → **Functions**
2. Click on `api/airtable-cases`
3. Click **View Logs**
4. Look for the debug output that shows:
   - `hasApiKey: true/false`
   - `apiKeyLength: X`
   - `apiKeyPrefix: "pat..."`

If `hasApiKey: false`, the environment variable isn't being read.

## Still Not Working?

If you've tried all the above:

1. **Double-check the API key in Airtable** - Make sure it's still active
2. **Check Airtable base permissions** - The API key needs access to the base
3. **Verify the base ID** - Make sure `AIRTABLE_BASE_ID` is correct (`appXblSpAMBQskgzB`)
4. **Check Vercel function logs** - Look for specific error messages
5. **Try creating a new API key** - Sometimes keys get corrupted

## Quick Checklist

- [ ] Environment variable `AIRTABLE_API_KEY` is set in Vercel
- [ ] Variable is selected for **Production** environment
- [ ] Variable value is correct (starts with `pat...`)
- [ ] Deployment was created **AFTER** adding the variable
- [ ] You've redeployed after adding/updating the variable
- [ ] API key is still active in Airtable
- [ ] Base ID is correct (`appXblSpAMBQskgzB`)

## Need More Help?

Check the Vercel function logs for detailed error messages. The updated API routes now include better error logging to help diagnose the issue.

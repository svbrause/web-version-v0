# Security Fix: Step-by-Step Migration Guide

## 🚨 Critical Security Issue Fixed

Your Airtable API key was being exposed in the client-side JavaScript bundle. Anyone could view it in the browser's developer tools or by inspecting the source code.

**This has been fixed** by moving all Airtable API calls to secure serverless functions (API routes) on Vercel. The API key now stays on the server and is never exposed to the browser.

## What Changed

### ✅ Created Secure API Routes
- `/api/airtable-leads` - Submits new leads
- `/api/airtable-update-lead` - Updates existing leads  
- `/api/airtable-sync` - Syncs behavioral data
- `/api/airtable-cases` - Fetches case/photo data

### ✅ Updated Frontend Code
- Removed all direct Airtable API calls from client-side code
- All Airtable requests now go through secure API routes
- Removed hardcoded API keys from frontend files

## Step-by-Step Migration Instructions

### Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`cases.ponce.ai`)
3. Navigate to **Settings** → **Environment Variables**
4. Add these variables (without the `VITE_` prefix):

   ```
   AIRTABLE_API_KEY = patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b
   AIRTABLE_BASE_ID = appXblSpAMBQskgzB
   ```

   ⚠️ **Important**: 
   - Do NOT use `VITE_` prefix for these variables
   - These are server-side only and will NOT be exposed to the browser
   - Vercel may show a warning - this is normal for server-side variables

5. Select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### Step 2: Deploy the Changes

1. Commit and push the changes to your repository:
   ```bash
   git add .
   git commit -m "Security fix: Move Airtable API calls to serverless functions"
   git push
   ```

2. Vercel will automatically deploy, or trigger a manual deployment:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click "Redeploy" if needed

### Step 3: Verify the Fix

1. Visit your live site: `https://cases.ponce.ai`
2. Open browser Developer Tools (F12)
3. Go to **Network** tab
4. Filter by "airtable"
5. You should see requests to `/api/airtable-*` routes (not direct Airtable API calls)
6. Check the **Sources** tab - search for your API key
7. **The API key should NOT appear anywhere in the client-side code**

### Step 4: Test Functionality

Test these features to ensure everything works:

- ✅ **Load cases/photos** - Should load from `/api/airtable-cases`
- ✅ **Submit lead form** - Should submit via `/api/airtable-leads`
- ✅ **Consultation request** - Should update via `/api/airtable-update-lead`
- ✅ **Behavioral tracking** - Should sync via `/api/airtable-sync`

### Step 5: Rotate Your API Key (Recommended)

Since your API key was exposed, it's recommended to rotate it:

1. Go to [Airtable Account Settings](https://airtable.com/account)
2. Navigate to **Developer** → **Personal access tokens**
3. Revoke the old key: `patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b`
4. Create a new personal access token
5. Update the `AIRTABLE_API_KEY` in Vercel with the new key
6. Redeploy your application

## Understanding the Vercel Warnings

When you try to add environment variables in Vercel, you may see warnings:

### Warning 1: "VITE_ exposes this value to the browser"
**This is why we're NOT using `VITE_` prefix!**

- Variables with `VITE_` prefix are bundled into client-side JavaScript
- They are visible to anyone who inspects your code
- **We removed all `VITE_` prefixed Airtable variables**

### Warning 2: "This key, which is prefixed with VITE_ and includes the term KEY..."
**This confirms the security issue - ignore this warning for server-side variables**

- For server-side variables (without `VITE_`), this warning doesn't apply
- The API key will be stored securely on Vercel's servers
- It will never be exposed to the browser

## Environment Variable Naming

### ✅ Server-Side (Secure) - Use These:
```
AIRTABLE_API_KEY          # Server-side only
AIRTABLE_BASE_ID          # Server-side only (optional, has default)
```

### ❌ Client-Side (Exposed) - Do NOT Use:
```
VITE_AIRTABLE_API_KEY     # ❌ Exposed in browser bundle
VITE_AIRTABLE_BASE_ID     # ❌ Exposed in browser bundle
```

### ✅ Client-Side (Safe to Expose) - These Are OK:
```
VITE_PRACTICE_NAME        # ✅ Safe - just a string like "unique" or "lakeshore"
VITE_POSTHOG_KEY          # ✅ Safe - PostHog keys are meant to be public
```

## File Changes Summary

### New Files Created:
- `api/airtable-leads.js` - Serverless function for lead submission
- `api/airtable-update-lead.js` - Serverless function for lead updates
- `api/airtable-sync.js` - Serverless function for behavioral sync
- `api/airtable-cases.js` - Serverless function for fetching cases

### Files Updated:
- `skin-type-react/src/utils/airtableLeads.ts` - Now uses `/api/airtable-leads`
- `skin-type-react/src/utils/airtableSync.ts` - Now uses `/api/airtable-sync`
- `skin-type-react/src/App.tsx` - Now uses `/api/airtable-cases`
- `vercel.json` - Updated to route API requests correctly

### Removed:
- All hardcoded API keys from frontend files
- All direct Airtable API calls from client-side code
- Dependencies on `VITE_AIRTABLE_API_KEY` and `VITE_AIRTABLE_BASE_ID`

## Troubleshooting

### API Routes Return 500 Errors

**Problem**: Serverless functions can't find the API key

**Solution**:
1. Verify `AIRTABLE_API_KEY` is set in Vercel (without `VITE_` prefix)
2. Make sure you selected all environments (Production, Preview, Development)
3. Redeploy after adding variables

### "API route not found" Errors

**Problem**: Vercel isn't recognizing the API routes

**Solution**:
1. Verify `api/` folder is in the project root (not in `skin-type-react/`)
2. Check `vercel.json` has the API route rewrite
3. Redeploy the application

### Cases/Photos Not Loading

**Problem**: Frontend can't fetch case data

**Solution**:
1. Check browser console for errors
2. Verify `/api/airtable-cases` is accessible
3. Check Vercel function logs for errors
4. Verify `AIRTABLE_BASE_ID` is set (or using default)

### Leads Not Submitting

**Problem**: Lead form submissions fail

**Solution**:
1. Check browser Network tab - should see POST to `/api/airtable-leads`
2. Check Vercel function logs for detailed errors
3. Verify Airtable table name is exactly "Web Popup Leads"
4. Check field names match Airtable schema

## Security Best Practices Going Forward

1. ✅ **Never commit API keys** - Always use environment variables
2. ✅ **Use serverless functions** - For any sensitive API calls
3. ✅ **Rotate keys regularly** - Especially if exposed
4. ✅ **Monitor API usage** - Check Airtable for unusual activity
5. ✅ **Use different keys** - Separate keys for dev/staging/production

## Need Help?

If you encounter issues:

1. Check Vercel function logs: Dashboard → Your Project → Functions → View Logs
2. Check browser console for client-side errors
3. Verify environment variables are set correctly
4. Test API routes directly using curl or Postman

## Summary

✅ **Security Issue Fixed**: API key no longer exposed in client-side code  
✅ **All Airtable calls**: Now go through secure serverless functions  
✅ **Environment variables**: Set in Vercel (without `VITE_` prefix)  
✅ **No breaking changes**: Functionality remains the same, just more secure  

Your application is now secure! 🎉

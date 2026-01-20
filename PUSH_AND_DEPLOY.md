# Push and Deploy Instructions

## The Problem

Your deployed site is still using the old code that calls Airtable directly. The frontend changes weren't included in the previous commit.

## Solution: Push the Latest Commits

I've committed the missing frontend changes. Now you need to push them:

```bash
git push origin main
```

This will:
1. Push the updated `App.tsx` that uses `/api/airtable-cases`
2. Push the updated API routes with debug logging
3. Trigger Vercel to automatically redeploy

## After Pushing

1. **Wait for Vercel to deploy** (1-2 minutes)
   - Go to Vercel Dashboard → Deployments
   - Watch for the new deployment to complete

2. **Verify the deployment**
   - Visit `https://cases.ponce.ai`
   - Open DevTools (F12) → Network tab
   - Look for requests to `/api/airtable-cases` (not `api.airtable.com`)
   - Should see successful responses (200 status)

3. **Check function logs if still having issues**
   - Vercel Dashboard → Functions → `api/airtable-cases`
   - View Logs to see the debug output
   - Should show `hasApiKey: true` if environment variable is set correctly

## Important: Environment Variables Must Be Set

Before the deployment will work, make sure in Vercel:

1. **Settings** → **Environment Variables**
2. `AIRTABLE_API_KEY` is set (your rotated key)
3. `AIRTABLE_BASE_ID` is set to `appXblSpAMBQskgzB`
4. Both are selected for **Production**, **Preview**, and **Development**
5. **Redeploy** after setting variables (or wait for the new deployment from git push)

## Quick Command

```bash
git push origin main
```

Then wait for Vercel to deploy and test your site!

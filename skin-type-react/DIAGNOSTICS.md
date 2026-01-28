# Setup Diagnostics Guide

This guide helps you verify that PostHog and Airtable are configured correctly.

## Quick Check

Open your browser's developer console (F12) and look for these messages:

### PostHog Setup
- ✅ **Success**: `📊 PostHog initialized for analytics and session recording`
- ⚠️ **Not configured**: `📊 PostHog API key not found. Analytics disabled.`
- 🔍 **Debug info**: Look for `📊 PostHog initialization check:` to see what's configured

### Airtable Setup
- ✅ **Success**: `✓ Loaded X cases from window.caseData` or `✓ Successfully fetched X total records from Airtable API`
- ⚠️ **Not configured**: `❌ AIRTABLE_API_KEY not configured` (in browser console or Vercel logs)
- 🔍 **Debug info**: Check browser console for case loading messages

### Areas Filtering
- ✅ **Working**: Console shows `📊 AreasScreen: Filtered areas based on concerns` with correct counts
- ⚠️ **Issue**: Console shows `⚠️ AreasScreen: caseData not loaded yet` - means data hasn't loaded
- 🔍 **Debug info**: Look for `getAvailableAreasForConcerns` logs showing concern-to-area mapping

## Detailed Setup Verification

### 1. PostHog Configuration

**Check Environment Variables:**
```bash
# In your .env file (skin-type-react/.env)
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com  # Optional
```

**Or in index.html:**
```html
<script>
  window.POSTHOG_KEY = "phc_your_key_here";
  window.POSTHOG_HOST = "https://us.i.posthog.com";
</script>
```

**For Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `VITE_POSTHOG_KEY` with your PostHog API key
3. Redeploy your app

**Verify it's working:**
1. Open browser console
2. Look for: `📊 PostHog initialized for analytics and session recording`
3. Perform actions in the app
4. Check PostHog dashboard (events appear within minutes)

### 2. Airtable Configuration

**Server-side (Vercel API routes):**
The API routes in `/api/` need these environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `AIRTABLE_API_KEY` = your Airtable API key (starts with `pat...`)
   - `AIRTABLE_BASE_ID` = your Airtable Base ID (from URL, e.g., `appXblSpAMBQskgzB`)
3. Redeploy your app

**Verify it's working:**
1. Check browser console for case loading messages
2. Check Vercel function logs (Vercel Dashboard → Functions → View Logs)
3. Look for: `✓ Successfully fetched X total records from Airtable API`

**Common Issues:**
- ❌ `AIRTABLE_API_KEY not configured` → Set in Vercel environment variables
- ❌ `Airtable API error` → Check API key permissions and Base ID
- ❌ `caseData.length === 0` → Cases aren't loading, check API route logs

### 3. Areas Filtering Issue

**Symptoms:**
- All areas show regardless of selected concerns
- Areas don't filter when you select concerns

**Diagnosis:**
1. Open browser console
2. Select a concern
3. Navigate to areas screen
4. Look for these console messages:
   - `📊 AreasScreen: Filtered areas based on concerns` - Should show filtered count
   - `⚠️ AreasScreen: caseData not loaded yet` - Means data hasn't loaded
   - `getAvailableAreasForConcerns` logs - Shows concern-to-area mapping

**Common Causes:**
1. **caseData not loaded**: Check that Airtable API is working (see above)
2. **No matching cases**: The selected concern might not have cases in Airtable
3. **Case data structure**: Cases might not have proper area mappings in Airtable

**Fix:**
- Ensure Airtable is configured (see above)
- Check that cases in Airtable have proper "Areas" or "Area Names" fields populated
- Verify cases match the selected concerns (check case matching logic)

## Testing Checklist

- [ ] PostHog shows initialization message in console
- [ ] PostHog events appear in PostHog dashboard
- [ ] Airtable cases load (check console for case count)
- [ ] Areas screen filters based on selected concerns
- [ ] Console shows debug logs for area filtering
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs

## Getting Help

If issues persist:
1. Check browser console for error messages
2. Check Vercel function logs for API errors
3. Verify environment variables are set correctly
4. Ensure you've redeployed after setting environment variables
5. Check that Airtable API key has proper permissions

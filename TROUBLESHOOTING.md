# Troubleshooting Airtable Photo Loading

## Common Issues

### 1. Images Not Showing / Placeholder Images Appearing

**Most Likely Cause: Airtable URL Expiration**

Airtable attachment URLs expire after 2-4 hours. This is a security feature by Airtable. Even if the code correctly fetches the URLs, they will stop working after a few hours.

**Solutions:**

#### Option A: Use Public Airtable View (Recommended for Development)
1. In Airtable, create a public view of your Photos table
2. Share the view publicly
3. The public view URLs don't expire as quickly (but may still expire)

#### Option B: Host Images Externally (Recommended for Production)
1. Upload images to a permanent hosting service (Cloudinary, AWS S3, Google Cloud Storage, etc.)
2. Store the permanent URLs in Airtable
3. Update the code to use these permanent URLs

#### Option C: Proxy Through Your Server
1. Create a server endpoint that fetches images from Airtable
2. Your server refreshes the URLs periodically
3. Serve images through your server

### 2. Airtable Library Not Loading

**Check Browser Console:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for errors about Airtable

**Common Issues:**
- CDN blocked by ad blocker
- Network issues
- Wrong library version

**Solution:** The app will fall back to sample data if Airtable fails to load.

### 3. Field Names Don't Match

**Check Console Logs:**
The app now logs all available fields from your Airtable records. Check the browser console for:
```
=== AIRTABLE DEBUG INFO ===
First record fields: [...]
```

**Solution:** Update the field names in `app.js` to match your Airtable schema.

### 4. No Records Returned

**Possible Causes:**
- Wrong table name (case-sensitive)
- Wrong view name
- API key doesn't have access
- View is empty

**Check:**
- Verify table name is exactly "Photos" (case-sensitive)
- Verify view name is exactly "Grid view"
- Check API key permissions in Airtable

## Debugging Steps

1. **Open Browser Console** (F12 → Console tab)

2. **Look for these log messages:**
   - `App initializing...`
   - `Airtable library available: true/false`
   - `Airtable initialized successfully`
   - `Fetching records from Airtable...`
   - `Successfully fetched X records from Airtable`
   - `=== AIRTABLE DEBUG INFO ===`

3. **Check for errors:**
   - Red error messages indicate problems
   - Common errors:
     - `Airtable library not found` - CDN issue
     - `Airtable API Error` - Authentication or access issue
     - `Failed to load Airtable` - Network issue

4. **Verify Field Names:**
   - Look for: `Found attachment field: "FieldName"`
   - If you see `MISSING` for URLs, check field names match

5. **Test Image URLs:**
   - Copy a URL from console logs
   - Paste in browser address bar
   - If it says "expired" or doesn't load, URLs have expired

## Quick Fix: Refresh Airtable Data

If URLs have expired, you need to:
1. Reload the page (this will fetch fresh URLs from Airtable)
2. URLs will work for 2-4 hours, then expire again

## Production Solution

For a production app, you should:
1. Set up image hosting (Cloudinary, AWS S3, etc.)
2. Store permanent URLs in Airtable
3. Or implement a server-side proxy that refreshes URLs

## Need Help?

Check the browser console for detailed debug information. All Airtable operations are logged with `console.log` statements.















# Update Rotated API Key in Vercel

Since you've rotated your Airtable API key, you need to update it in Vercel.

## Steps to Update the API Key

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (`cases.ponce.ai`)

2. **Navigate to Environment Variables**
   - Go to **Settings** → **Environment Variables**

3. **Update AIRTABLE_API_KEY**
   - Find `AIRTABLE_API_KEY` in the list
   - Click the **three dots (⋯)** next to it
   - Select **Edit**
   - Replace the old key with your new rotated API key
   - Make sure it's selected for all environments (Production, Preview, Development)
   - Click **Save**

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or wait for the next automatic deployment

## Important Notes

- ✅ The new key should **NOT** have the `VITE_` prefix
- ✅ Make sure `AIRTABLE_BASE_ID` is still set to `appXblSpAMBQskgzB`
- ✅ After redeploying, test that your application still works correctly

## Verify It's Working

After redeploying:

1. Visit your site: `https://cases.ponce.ai`
2. Test that cases/photos load correctly
3. Test that lead submission works
4. Check browser console for any errors

## If You Need to Revoke the Old Key

If you haven't already revoked the old key in Airtable:

1. Go to [Airtable Account Settings](https://airtable.com/account)
2. Navigate to **Developer** → **Personal access tokens**
3. Find the old key: `patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b`
4. Click **Revoke** to disable it

This ensures the old exposed key can no longer be used.

# Quick Start: Environment Variables

## 🚨 Immediate Action Required

Your API keys were exposed in the deployed version. Follow these steps immediately:

### Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables
2. Add these variables:
   ```
   AIRTABLE_API_KEY = patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b
   AIRTABLE_BASE_ID = appXblSpAMBQskgzB
   ```
3. **IMPORTANT**: After adding, click "Redeploy" or trigger a new deployment

### Step 2: For React App (skin-type-react)

If you're using the React app, also set:
```
VITE_AIRTABLE_API_KEY = (same as above)
VITE_AIRTABLE_BASE_ID = (same as above)
VITE_PRACTICE_NAME = unique  # or 'lakeshore'
```

### Step 3: Update Build Command (Optional but Recommended)

If you're deploying the HTML files (dashboard-unique.html, etc.), update `vercel.json`:

```json
{
  "buildCommand": "node build-inject-env.js && cd skin-type-react && npm install && npm run build"
}
```

### Step 4: Rotate Your API Keys (Recommended)

Since the keys were exposed, consider rotating them:

1. Go to [Airtable Account Settings](https://airtable.com/account)
2. Generate a new API key
3. Update the environment variables in Vercel with the new key

## Local Development

Create a `.env` file in the project root:

```bash
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appXblSpAMBQskgzB
```

For Node.js scripts:
```bash
export AIRTABLE_API_KEY="your-key"
node your-script.js
```

For HTML files, run:
```bash
node build-inject-env.js
```

## What Was Fixed

✅ Removed hardcoded API keys from:
- `app.js`
- `dashboard.js`
- `dashboard-unique.js`
- `dashboard-lakeshore.js`
- All Node.js scripts (12 files)

✅ Added environment variable support
✅ Added validation and error messages
✅ Created build script for HTML files

## Need More Help?

See `ENVIRONMENT_VARIABLES_SETUP.md` for detailed documentation.

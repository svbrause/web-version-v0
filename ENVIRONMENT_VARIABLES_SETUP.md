# Environment Variables Setup Guide

This guide explains how to securely configure API keys and other sensitive information using environment variables instead of hardcoded values.

## ⚠️ Security Issue Fixed

Previously, API keys were hardcoded in multiple files, which exposed them in the deployed version. All hardcoded keys have been removed and replaced with environment variable references.

## Files Updated

### Frontend JavaScript Files
- `app.js`
- `dashboard.js`
- `dashboard-unique.js`
- `dashboard-lakeshore.js`

These files now read from `window.AIRTABLE_API_KEY` and `window.AIRTABLE_BASE_ID` (set in HTML files).

### Node.js Scripts
- `estimate-demographics-from-photos.js`
- `generate-case-area-mapping.js`
- `list-all-suggestions.js`
- `check-suggestion-names.js`
- `check-airtable-fields.js`
- `analyze-case-categories.js`
- `generate-stories.js`
- `generate-markdown-from-airtable.js`
- `estimate-demographics.js`
- `generate-treatment-details.js`
- `upload-stories-to-airtable.js`
- `verify-stories-loaded.js`

These scripts now read from `process.env.AIRTABLE_API_KEY` and `process.env.AIRTABLE_BASE_ID`.

## Setting Up Environment Variables

### For Local Development

1. **Create a `.env` file** in the project root:
   ```bash
   AIRTABLE_API_KEY=your_airtable_api_key_here
   AIRTABLE_BASE_ID=appXblSpAMBQskgzB
   OPENAI_API_KEY=your_openai_api_key_here  # Optional, for photo analysis
   ```

2. **For Node.js scripts**, load the environment variables:
   ```bash
   # Using dotenv (recommended)
   npm install dotenv
   # Then add to your scripts: require('dotenv').config();
   
   # Or export manually:
   export AIRTABLE_API_KEY="your-api-key"
   export AIRTABLE_BASE_ID="appXblSpAMBQskgzB"
   ```

3. **For HTML/JavaScript files**, you have two options:

   **Option A: Manual injection (for local testing)**
   Edit the HTML files and replace the placeholders:
   ```html
   <script>
     window.AIRTABLE_API_KEY = 'your-actual-api-key';
     window.AIRTABLE_BASE_ID = 'appXblSpAMBQskgzB';
   </script>
   ```

   **Option B: Use the build script**
   ```bash
   # Set environment variables
   export AIRTABLE_API_KEY="your-api-key"
   export AIRTABLE_BASE_ID="appXblSpAMBQskgzB"
   
   # Run the build script
   node build-inject-env.js
   ```

### For Vercel Deployment

#### Method 1: Using Vercel Dashboard (Recommended)

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `AIRTABLE_API_KEY` = your Airtable API key
   - `AIRTABLE_BASE_ID` = `appXblSpAMBQskgzB` (or your base ID)
   - `OPENAI_API_KEY` = your OpenAI API key (optional)

4. **Update your build command** in `vercel.json` to inject variables:
   ```json
   {
     "buildCommand": "node build-inject-env.js && cd skin-type-react && npm install && npm run build"
   }
   ```

5. **Redeploy** your project for changes to take effect.

#### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variables
vercel env add AIRTABLE_API_KEY
vercel env add AIRTABLE_BASE_ID

# Redeploy
vercel --prod
```

#### Method 3: For React App (skin-type-react)

The React app already uses Vite environment variables. Set these in Vercel:

- `VITE_AIRTABLE_API_KEY` = your Airtable API key
- `VITE_AIRTABLE_BASE_ID` = your Airtable Base ID
- `VITE_POSTHOG_KEY` = your PostHog key (optional)
- `VITE_PRACTICE_NAME` = `unique` or `lakeshore`

See `skin-type-react/ENV_SETUP.md` for more details.

## Getting Your API Keys

### Airtable API Key

1. Go to [https://airtable.com/api](https://airtable.com/api)
2. Select your base
3. Copy your **API key** (starts with `pat...`)
4. Copy your **Base ID** from the URL (the part after `/app/`, e.g., `appXblSpAMBQskgzB`)

### OpenAI API Key (for photo analysis scripts)

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)

## Security Best Practices

1. ✅ **Never commit `.env` files** - They're already in `.gitignore`
2. ✅ **Never commit API keys** - Always use environment variables
3. ✅ **Rotate keys regularly** - If a key is exposed, regenerate it immediately
4. ✅ **Use different keys for dev/prod** - Set different values in Vercel for each environment
5. ⚠️ **Note**: For client-side code, environment variables are still exposed in the browser bundle. This is normal for frontend apps. For maximum security, consider using a backend API proxy.

## Troubleshooting

### "AIRTABLE_API_KEY is not set" Error

**For Node.js scripts:**
- Make sure you've exported the variable: `export AIRTABLE_API_KEY="your-key"`
- Or use a `.env` file with `dotenv`

**For HTML/JavaScript files:**
- Check that the build script ran: `node build-inject-env.js`
- Verify the HTML file has the script tag that sets `window.AIRTABLE_API_KEY`
- Check browser console for errors

### Variables Not Working in Vercel

1. Verify variables are set in Vercel dashboard
2. Make sure you **redeployed** after adding variables
3. Check that your build command includes the injection script
4. Verify variable names match exactly (case-sensitive)

### React App Not Loading Variables

- Variables must start with `VITE_` prefix
- Restart dev server after changing `.env` file
- Check `skin-type-react/ENV_SETUP.md` for React-specific setup

## Next Steps

1. **Set environment variables in Vercel** (see above)
2. **Update `vercel.json`** to include the build script
3. **Redeploy** your application
4. **Verify** the application works without hardcoded keys
5. **Rotate your API keys** if they were previously exposed

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Airtable API Documentation](https://airtable.com/api)
- React app setup: `skin-type-react/ENV_SETUP.md`

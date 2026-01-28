# Environment Variables Setup

This app uses environment variables to securely store API keys and configuration. Never commit your `.env` file to version control.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your configuration:**
   ```env
   VITE_PRACTICE_NAME=unique  # or 'lakeshore' for Lakeshore
   VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
   VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here
   VITE_POSTHOG_KEY=your_posthog_api_key_here  # Optional
   ```

3. **Restart your dev server** (if running) for changes to take effect.

## Getting Your API Keys

### Airtable

1. Go to [https://airtable.com/api](https://airtable.com/api)
2. Select your base
3. Copy your **API key** (starts with `pat...`)
4. Copy your **Base ID** from the URL (the part after `/app/`, e.g., `appXblSpAMBQskgzB`)

### PostHog (Optional - for analytics)

1. Sign up at [https://posthog.com](https://posthog.com)
2. Create a project
3. Go to Settings → Project → API Key
4. Copy your **Project API Key** (starts with `phc_...`)

## Production Deployment (Vercel)

When deploying to Vercel, you need to set environment variables in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `VITE_PRACTICE_NAME` = `unique` or `lakeshore` (determines which brand/provider)
   - `VITE_AIRTABLE_API_KEY` = your Airtable API key
   - `VITE_AIRTABLE_BASE_ID` = your Airtable Base ID
   - `VITE_POSTHOG_KEY` = your PostHog API key (optional)

4. **Important**: After adding variables, you need to **redeploy** for them to take effect.

### Multiple Providers

**Recommended**: Create separate Vercel projects for each provider:
- **Unique Aesthetics**: Set `VITE_PRACTICE_NAME=unique`
- **Lakeshore**: Set `VITE_PRACTICE_NAME=lakeshore`

This ensures each provider has their own URL and configuration. See [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) for detailed instructions.

## Security Notes

⚠️ **Important**: 
- The `.env` file is in `.gitignore` and will NOT be committed to git
- Environment variables in Vite are exposed in the client bundle (this is normal for client-side apps)
- For maximum security, consider using a backend API to proxy requests to Airtable
- Never share your API keys publicly or commit them to version control

## Troubleshooting

**Environment variables not working?**
- Make sure the file is named `.env` (not `.env.txt` or similar)
- Restart your dev server after creating/modifying `.env`
- Check that variable names start with `VITE_` (required for Vite)
- In production, verify variables are set in Vercel dashboard and redeploy

**Getting "undefined" values?**
- Check browser console for errors
- Verify `.env` file is in the `skin-type-react` directory (same level as `package.json`)
- Ensure no typos in variable names

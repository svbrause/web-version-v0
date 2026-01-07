# Deploying Dashboard to Vercel

This guide will help you deploy the Lead Hub dashboard to Vercel so it's accessible online and connected to your Airtable data.

## Prerequisites

1. A Vercel account (free tier works great)
2. Your Airtable base with the "Web Popup Leads" table set up
3. Git repository (optional but recommended)

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to your project directory**:
   ```bash
   cd /Users/sambrause/Downloads/Photos-1-001/test7
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (first time)
   - Project name? (e.g., `lead-hub-dashboard`)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository OR drag and drop your project folder
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty - it's static)
   - **Output Directory**: `./`
5. Click **"Deploy"**

## Configuration

### Environment Variables (Optional)

If you want to keep your Airtable API key secure, you can use environment variables:

1. In Vercel dashboard, go to your project → **Settings** → **Environment Variables**
2. Add:
   - `AIRTABLE_API_KEY`: Your Airtable API key
   - `AIRTABLE_BASE_ID`: Your Airtable base ID

3. Update `dashboard.js` to use environment variables:
   ```javascript
   const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "your-fallback-key";
   ```

   **Note**: Since this is a client-side app, environment variables won't work directly. For production, you'd need a backend API. For now, the API key in the code works for demo purposes.

## Post-Deployment

### 1. Test the Dashboard

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app/dashboard.html`)
2. Verify it loads and shows leads from Airtable
3. Test the theme toggle
4. Test dragging leads between columns

### 2. Set Up Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 3. Enable Auto-Deployments

If using Git:
- Push to your repository
- Vercel will automatically deploy on every push

## Connecting to Real Data

The dashboard is already configured to fetch from Airtable. Make sure:

1. **Airtable Table Exists**: "Web Popup Leads" table in your base
2. **Required Fields**:
   - Name (Single line text)
   - Email Address (Email)
   - Phone Number (Phone)
   - Age (Number)
   - Goals (Multiple select)
   - Concerns (Long text)
   - Aesthetic Goals (Long text)
   - Liked Photos (Link to Photos)
   - Viewed Photos (Link to Photos)
   - Source (Single select)
   - Status (Single select) - Optional but recommended
   - Contacted (Checkbox) - Optional
   - Contact Notes (Long text) - Optional

3. **Test Connection**:
   - Submit a lead through `index.html`
   - Check that it appears in the dashboard
   - Verify all fields display correctly

## Demo Mode

To use mock data instead of Airtable (for demos):

1. Open `dashboard.js`
2. Change `USE_MOCK_DATA` to `true`:
   ```javascript
   const USE_MOCK_DATA = true;
   ```

This will show the compelling demo storyline with mock leads.

## Troubleshooting

### Dashboard shows "Loading..." forever

- Check browser console for errors
- Verify Airtable API key is correct
- Ensure "Web Popup Leads" table exists
- Check network tab for API errors

### Leads not appearing

- Verify leads are being saved to Airtable from `index.html`
- Check field names match exactly (case-sensitive)
- Ensure API key has read permissions

### CORS Errors

- Airtable API should work from any domain
- If issues persist, check Airtable base permissions

### Theme toggle not working

- Clear browser cache
- Check that CSS file is loading
- Verify localStorage is enabled

## Security Notes

⚠️ **Important**: The dashboard currently includes the Airtable API key in the JavaScript file. 

**For production use, consider:**
1. Creating a backend API endpoint to proxy Airtable requests
2. Using Vercel serverless functions
3. Implementing authentication for the dashboard

**For demo/internal use**, the current setup is acceptable.

## Updating the Dashboard

After making changes:

1. **If using CLI**:
   ```bash
   vercel --prod
   ```

2. **If using Git**:
   ```bash
   git add .
   git commit -m "Update dashboard"
   git push
   ```
   (Vercel will auto-deploy)

## Access URLs

After deployment, you'll have:
- **Preview URL**: `https://your-project-*.vercel.app/dashboard.html`
- **Production URL**: `https://your-project.vercel.app/dashboard.html`

Share the production URL with your team!






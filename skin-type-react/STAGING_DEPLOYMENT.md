# Staging Deployment Guide

This guide helps you create a separate staging/testing deployment on Vercel before pushing changes to production.

## Why a Staging Deployment?

- **Test new features** before they go live
- **Share with testing team** without affecting production
- **Iron out bugs** before customers see them
- **Safe experimentation** without risk to production

## Important: How Staging & Production Work Together

**Key Point**: Both projects can be linked to the same GitHub repo, but they deploy from **different branches**:

- **Production Project**: Deploys from `main` branch (or your production branch)
- **Staging Project**: Deploys from `staging` branch (or any branch you choose)

This way:
- ✅ You can test new features in staging without affecting production
- ✅ Production stays stable on `main` branch
- ✅ When staging is ready, you merge `staging` → `main` to update production
- ✅ Both projects use the same codebase, just different branches

## Step-by-Step: Create Staging Deployment

### Option 1: Branch-Based Deployment (Recommended)

This is the best approach - staging and production deploy from different branches.

#### Step 1: Create Staging Branch

First, create a staging branch in your repository:

```bash
# Make sure you're on main and have latest changes
git checkout main
git pull origin main

# Create and switch to staging branch
git checkout -b staging

# Push staging branch to GitHub
git push -u origin staging
```

#### Step 2: Create New Project in Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** → **"Project"**
3. **Import your Git repository** (same repo as production)
4. **Configure the project**:
   - **Project Name**: `your-app-name-staging` (e.g., `unique-consultation-staging`)
   - **Root Directory**: `skin-type-react` ⚠️ **Important!**
   - **Framework Preset**: Vite (or leave as auto-detected)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)
   - **Production Branch**: `staging` ⚠️ **Critical!** Change this from `main` to `staging`

#### Step 2: Set Environment Variables

**Critical**: Set these in the Vercel dashboard for your staging project:

1. Go to **Settings** → **Environment Variables**
2. Add each variable (make sure to select **Production**, **Preview**, and **Development**):

```
VITE_PRACTICE_NAME=unique  # or 'lakeshore' - same as production
VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here
VITE_POSTHOG_KEY=your_posthog_api_key_here  # Optional
```

**For API Routes** (also needed):
```
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
```

**Note**: You can use the same Airtable base as production, or create a separate test base. Using the same base means test leads will appear in your production Airtable (which might be fine for testing).

#### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your staging URL will be: `https://your-app-name-staging.vercel.app`

#### Step 4: Test Your Staging Deployment

1. Visit your staging URL
2. Test all the new features:
   - Onboarding screens
   - Offer card on screen 3
   - Updated messaging
   - Zip code field
   - Areas filtering
3. Share the URL with your testing team

### Option 2: Use Vercel Preview Deployments (Alternative)

If you want automatic preview deployments for branches:

1. **Create a new branch**:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Vercel automatically creates a preview deployment** for the `staging` branch
3. **URL format**: `https://your-app-git-staging-your-team.vercel.app`
4. **Environment variables**: Uses the same as production by default (you can override in Vercel settings)

**Pros**: Automatic, no manual setup
**Cons**: URL changes with each commit, less permanent

**Note**: This is different from Option 1 - preview deployments are temporary and change URLs. Option 1 gives you a permanent staging URL.

## Managing Both Deployments

### How Branch-Based Deployment Works

**Both projects are linked to the same Git repository, but watch different branches:**

- **Production project**: 
  - **Production Branch**: `main`
  - Deploys automatically when you push to `main`
  - URL: `https://your-app.vercel.app` (your production URL)
  
- **Staging project**: 
  - **Production Branch**: `staging` (configured in project settings)
  - Deploys automatically when you push to `staging`
  - URL: `https://your-app-staging.vercel.app` (your staging URL)

**Workflow:**
1. **Make changes** → Commit to `staging` branch
2. **Staging auto-deploys** → Test at staging URL
3. **When ready** → Merge `staging` → `main`
4. **Production auto-deploys** → Changes go live

**Each project uses its own environment variables** (set separately in each project's settings)

### Manual Deployments

If you want to manually control when staging updates:

1. **Disable auto-deploy** for staging project in Vercel settings
2. **Deploy manually** when ready:
   ```bash
   # Deploy staging
   vercel --prod --project your-staging-project-name
   
   # Deploy production (when ready)
   vercel --prod --project your-production-project-name
   ```

## Environment Variables Setup

### Staging Environment Variables

You have two options:

#### Option A: Same as Production (Easier)
- Use the same Airtable base
- Use the same API keys
- Test leads will appear in production Airtable
- **Good for**: Quick testing, same data source

#### Option B: Separate Test Environment (Safer)
- Create a separate Airtable base for testing
- Use separate API keys (or same keys, different base)
- Test leads stay separate from production
- **Good for**: Thorough testing, data isolation

### Setting Environment Variables

1. Go to your **staging project** in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_PRACTICE_NAME`
   - **Value**: `unique` or `lakeshore`
   - **Environment**: Select all (Production, Preview, Development)
4. Repeat for all variables
5. **Redeploy** after adding variables (Vercel will prompt you)

## Testing Checklist

Before sharing with your team, test:

- [ ] Onboarding screens appear correctly
- [ ] Offer card shows on screen 3 with gift icon
- [ ] Messaging says "$50 OFF Any New Treatments"
- [ ] Zip code field works in lead capture
- [ ] Areas filter based on selected concerns
- [ ] Lead submission works (check Airtable)
- [ ] Consultation modal shows offer card (Lakeshore)
- [ ] All messaging is consistent
- [ ] No console errors
- [ ] Mobile responsive

## Promoting to Production

When staging is tested and ready:

### Option 1: Merge to Main Branch
```bash
git checkout main
git merge staging
git push origin main
```
Production will auto-deploy if auto-deploy is enabled.

### Option 2: Manual Deploy
1. Make sure your code is in the production branch
2. Go to production Vercel project
3. Click **"Redeploy"** → **"Redeploy"**

### Option 3: Copy Environment Variables
If you made changes to environment variables in staging:
1. Copy them from staging project settings
2. Update production project settings
3. Redeploy production

## Quick Reference

| Deployment | URL | Branch | Auto-Deploy | Purpose |
|------------|-----|--------|-------------|---------|
| **Staging** | `https://your-app-staging.vercel.app` | `staging` | ✅ Yes | Testing, QA |
| **Production** | `https://your-app.vercel.app` | `main` | ✅ Yes | Live, customers |

## Setting Production Branch in Vercel

After creating your staging project:

1. Go to your **staging project** in Vercel dashboard
2. Navigate to **Settings** → **Git**
3. Find **"Production Branch"** setting
4. Change from `main` to `staging`
5. Save

Now:
- **Staging project** watches `staging` branch
- **Production project** watches `main` branch
- They deploy independently!

## Troubleshooting

### Staging shows old version
- Check that you pushed to the correct branch
- Verify Vercel is connected to the right branch
- Check build logs in Vercel dashboard

### Environment variables not working
- Make sure variables are set for **all environments** (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### API routes not working
- Make sure `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are set (not just `VITE_*` versions)
- Check that API routes are in the `/api` folder
- Verify the routes are being deployed (check Vercel function logs)

## Next Steps

1. ✅ Create staging Vercel project
2. ✅ Set environment variables
3. ✅ Deploy and test
4. ✅ Share URL with testing team
5. ✅ Fix any bugs found
6. ✅ Promote to production when ready

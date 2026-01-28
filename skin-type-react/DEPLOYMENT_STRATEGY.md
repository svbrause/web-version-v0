# Deployment Strategy for Multiple Providers

This app supports multiple providers (Unique Aesthetics & Wellness and Lakeshore Skin + Body). Here's how to deploy them separately to avoid confusion.

## Recommended Approach: Separate Deployments

**Best Practice**: Deploy separate instances for each provider with their own URLs and configurations.

### Why Separate Deployments?

1. **No Confusion**: Each provider has their own dedicated URL
2. **Independent Updates**: Update one without affecting the other
3. **Separate Analytics**: Track each provider independently
4. **Different Airtable Bases**: Each can use their own Airtable base if needed
5. **Custom Domains**: Each can have their own custom domain

## Deployment Options

### Option 1: Separate Vercel Projects (Recommended)

Create two separate Vercel projects:

#### For Unique Aesthetics:
1. **Project Name**: `unique-aesthetics-consultation` (or similar)
2. **Environment Variables**:
   ```
   VITE_PRACTICE_NAME=unique
   VITE_AIRTABLE_API_KEY=your_unique_airtable_key
   VITE_AIRTABLE_BASE_ID=your_unique_base_id
   VITE_POSTHOG_KEY=your_posthog_key (optional)
   ```
3. **Custom Domain**: `consultation.myuniqueaesthetics.com` (optional)
4. **URL**: `https://unique-aesthetics-consultation.vercel.app`

#### For Lakeshore:
1. **Project Name**: `lakeshore-consultation` (or similar)
2. **Environment Variables**:
   ```
   VITE_PRACTICE_NAME=lakeshore
   VITE_AIRTABLE_API_KEY=your_lakeshore_airtable_key
   VITE_AIRTABLE_BASE_ID=your_lakeshore_base_id
   VITE_POSTHOG_KEY=your_posthog_key (optional)
   ```
3. **Custom Domain**: `consultation.lakeshoreshinandbody.com` (optional)
4. **URL**: `https://lakeshore-consultation.vercel.app`

### Option 2: Single Deployment with Subdomains

If you want to use a single Vercel project:

1. **Deploy once** to Vercel
2. **Set up two custom domains**:
   - `unique.consultation.yourdomain.com`
   - `lakeshore.consultation.yourdomain.com`
3. **Use URL parameters** or **rewrite rules** to set practice:
   - `unique.consultation.yourdomain.com?practice=unique`
   - `lakeshore.consultation.yourdomain.com?practice=lakeshore`

### Option 3: Path-Based Routing

Use a single deployment with different paths:

1. **Deploy once** to Vercel
2. **Set up rewrites** in `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/unique", "destination": "/index.html?practice=unique" },
       { "source": "/lakeshore", "destination": "/index.html?practice=lakeshore" }
     ]
   }
   ```
3. **URLs**:
   - `https://your-app.vercel.app/unique`
   - `https://your-app.vercel.app/lakeshore`

## Step-by-Step: Separate Deployments (Recommended)

### Step 1: Deploy Unique Aesthetics

1. Go to [vercel.com](https://vercel.com) and create a new project
2. **Import your Git repository** (important: link to your repo for auto-deployments)
3. **Configure**:
   - **Root Directory**: `skin-type-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Auto Deploy**: ✅ Enabled (default)
4. **Add Environment Variables**:
   - `VITE_PRACTICE_NAME` = `unique`
   - `VITE_AIRTABLE_API_KEY` = (Unique Aesthetics Airtable key)
   - `VITE_AIRTABLE_BASE_ID` = (Unique Aesthetics Base ID)
   - `VITE_POSTHOG_KEY` = (Optional)
5. **Deploy**
6. **Set Custom Domain** (optional): `consultation.myuniqueaesthetics.com`

### Step 2: Deploy Lakeshore

1. Create a **new** Vercel project
2. **Import the SAME Git repository** (this enables auto-deployments for both)
3. **Configure**:
   - **Root Directory**: `skin-type-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Auto Deploy**: ✅ Enabled (default)
4. **Add Environment Variables** (different from Unique Aesthetics):
   - `VITE_PRACTICE_NAME` = `lakeshore`
   - `VITE_AIRTABLE_API_KEY` = (Lakeshore Airtable key - can be same or different)
   - `VITE_AIRTABLE_BASE_ID` = (Lakeshore Base ID - can be same or different)
   - `VITE_POSTHOG_KEY` = (Optional)
5. **Deploy**
6. **Set Custom Domain** (optional): `consultation.lakeshoreshinandbody.com`

### ✅ Result

Now both projects are linked to the same repository. When you push code:
- Both projects automatically deploy with the new code
- Each uses its own environment variables (so they stay separate)
- **You only need to push once!**

## Practice Detection Priority

The app determines which practice to use in this order:

1. **Environment Variable** `VITE_PRACTICE_NAME` (highest priority for production)
2. **URL Parameter** `?practice=unique` or `?practice=lakeshore` (for testing/flexibility)
3. **Window Variable** `window.PRACTICE_NAME` (legacy support)
4. **Default**: `unique` (fallback)

## Airtable Configuration

### Option A: Shared Airtable Base (Same Base, Different Provider Records)

- Both deployments use the same Airtable base
- The `Providers` field automatically links to the correct provider record:
  - Unique Aesthetics: `recN9Q4W02xtroD6g`
  - Lakeshore: `rec3oXyrb1t6YUvoe`
- **Pros**: Single source of truth, easier management
- **Cons**: Shared data, need to filter by provider

### Option B: Separate Airtable Bases (Recommended for Complete Separation)

- Each deployment uses its own Airtable base
- Completely separate data
- **Pros**: Complete isolation, independent management
- **Cons**: Need to manage two bases

## Testing Before Launch

1. **Test Unique Aesthetics deployment**:
   - Verify logo shows correctly
   - Verify colors match brand (pink theme)
   - Submit a test lead and verify it goes to correct Airtable
   - Check that provider record is correct

2. **Test Lakeshore deployment**:
   - Verify logo shows correctly
   - Verify colors match brand (teal theme)
   - Submit a test lead and verify it goes to correct Airtable
   - Check that provider record is correct

3. **Test URL parameters** (for flexibility):
   - `https://your-app.vercel.app?practice=unique`
   - `https://your-app.vercel.app?practice=lakeshore`

## Maintenance

### Code Updates (Automatic)

**Good News**: If both Vercel projects are linked to the same Git repository, code changes automatically deploy to both!

1. **Make your code change** in your repository
2. **Push to Git** (e.g., `git push origin main`)
3. **Both Vercel projects auto-deploy** with the new code
4. **Each deployment uses its own environment variables** (so Unique stays `unique`, Lakeshore stays `lakeshore`)

**You only need to deploy once** - Vercel handles both deployments automatically!

### Setting Up Auto-Deployments

When creating your Vercel projects:

1. **Link both projects to the same Git repository**
2. **Set the Root Directory** to `skin-type-react` for both
3. **Enable "Auto Deploy"** (enabled by default)
4. **Set different environment variables** in each project

Now, every time you push code:
- ✅ Unique Aesthetics project auto-deploys with `VITE_PRACTICE_NAME=unique`
- ✅ Lakeshore project auto-deploys with `VITE_PRACTICE_NAME=lakeshore`
- ✅ Both get the same code, but different configurations

### Manual Deployments

If you need to deploy manually (or if auto-deploy is disabled):

1. **Deploy Unique Aesthetics**:
   ```bash
   vercel --prod --scope your-vercel-team --project unique-aesthetics-consultation
   ```

2. **Deploy Lakeshore**:
   ```bash
   vercel --prod --scope your-vercel-team --project lakeshore-consultation
   ```

### Environment Variables

- **Manage separately** in each Vercel project's settings
- **Changes require redeploy** (but code changes auto-deploy)
- **Can be different** between projects (e.g., different Airtable bases)

### Analytics

- Track separately if using PostHog (use different projects or filter by practice)
- Each deployment has its own URL, so analytics are naturally separated

## Quick Reference

| Provider | Vercel Project | Environment Variable | Airtable Provider ID | Custom Domain |
|----------|---------------|---------------------|---------------------|---------------|
| Unique Aesthetics | `unique-aesthetics-consultation` | `VITE_PRACTICE_NAME=unique` | `recN9Q4W02xtroD6g` | `consultation.myuniqueaesthetics.com` |
| Lakeshore | `lakeshore-consultation` | `VITE_PRACTICE_NAME=lakeshore` | `rec3oXyrb1t6YUvoe` | `consultation.lakeshoreshinandbody.com` |

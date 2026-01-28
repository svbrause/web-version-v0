# Fixing Staging (cases.ponce.ai)

## What likely happened

1. **Staging was working** – cases.ponce.ai was on the staging branch and fine.
2. **Recent changes** – The "Fix deployment" commit (a9e70c1) pulled in the full `skin-type-react` from **main** and re-applied UI changes. Main’s code may differ (e.g. data loading, API usage).
3. **Result** – Staging may now be broken (e.g. cases not loading, wrong API, build/runtime errors).

## Recommended order of actions

### Step 1: Pinpoint what’s broken (required)

We need the exact symptom so we can fix the right thing:

- **Build failing on Vercel?** (e.g. TS error, missing file) → we fix the build.
- **Site loads but “Loading cases…” forever / blank results?** → likely case data not loading (e.g. `/api/airtable-cases` 404 or CORS). Fix: use backend API for case loading when deployed.
- **Console errors?** (e.g. 404, CORS, or JS error) → share the message and we fix that path.
- **Wrong data or wrong practice?** → env vars or API config.

**How to check:** Open cases.ponce.ai → F12 (DevTools) → Console and Network. Note any red errors or failed requests (e.g. to `/api/airtable-cases`).

### Step 2: Fix based on symptom

To fix forward we need to know:

- **Build failure?** (e.g. Vercel build error)
- **Blank page / “Loading cases…” forever?** (often API or CORS)
- **Console errors?** (e.g. 404 on `/api/airtable-cases`, or CORS)
- **Wrong data or wrong practice?** (e.g. wrong Airtable/base)

Once you have that, we can target the right place (e.g. `App.tsx` data loading, backend config, env vars).

### Step 3: Possible cause – case data loading

Current `App.tsx` loads cases from:

1. `window.caseData` (if set by a parent app), or
2. **`/api/airtable-cases`** (relative URL on the same host).

If cases.ponce.ai is deployed with **root = `skin-type-react`** only, there is no `api/` folder in the build, so `/api/airtable-cases` returns 404 and cases never load.

- **If that’s the case:** we should change case loading to use the **backend API** when `VITE_USE_BACKEND_API` is true (same pattern as in `config/backend.ts` for leads), so production uses `ponce-patient-backend.vercel.app` for cases too.

### Step 4: Nuclear option – restore from a known-good commit

If you have another clone or branch from when staging was definitely working:

- Create a branch from that commit.
- Compare that branch to current staging (e.g. `git diff`) to see what changed.
- Either restore specific files from the good branch or merge the good branch into staging and resolve conflicts.

---

## Why not revert the last commit (01f59da)?

Reverting 01f59da would bring back the unused variables (`practice`, `relevanceScore`) and **re-introduce the TypeScript build errors** (TS6133). The build would fail again on Vercel. So we fix forward instead of reverting that commit.

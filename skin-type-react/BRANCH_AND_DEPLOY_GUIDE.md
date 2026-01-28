# Branch & Deploy Guide – web-version-v0

## Current state

| Branch                      | What it has                                                                                                                                                                                                    | Deploys to                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **main**                    | Older version; recent work (vercel.json, “secrets removed”, lakeshore link). Has full `skin-type-react` but **not** the new UI (offer card, Request Consult, hide relevance, “seen” badge, dark footer, etc.). | **cases.ponce.ai** (production)                      |
| **staging**                 | New version with all the UI changes: offer card redesign, “Request Consult”, hidden relevance score, “seen” badge, dark CTA footer, PostHog logging, TS fixes. Full `skin-type-react` with `package.json`.     | Staging URL (e.g. web-version-v0-staging.vercel.app) |
| **clean-dashboard** (local) | Same content as **staging**. Your local branch.                                                                                                                                                                | Not deployed                                         |

So: **production = main (old)** and **staging = new**. To get the new version on cases.ponce.ai, main needs to get staging’s changes.

---

## Goal: New version on cases.ponce.ai

You want production (cases.ponce.ai) to run the same app that’s on staging (with all the UI changes).  
That means: **main** should include everything that’s currently on **staging**.

---

## Option A: Merge staging into main (recommended)

This is the normal way to “promote” staging to production. No force push.

### 1. On GitHub

1. Open: `https://github.com/svbrause/web-version-v0`
2. **Pull request**: base = **main**, compare = **staging**
3. Title e.g.: “Promote staging to production – UI updates”
4. Review the diff (should be your UI changes in `skin-type-react/`)
5. Merge the PR (Create merge commit or Squash, your choice)

After the merge, **main** will contain staging’s commits, so main will have the new UI.

### 2. Deploy production

- If Vercel is connected to GitHub and deploys **main** to cases.ponce.ai, it will auto-deploy after the merge.
- If you deploy manually, trigger a deploy from the **main** branch for the project that serves cases.ponce.ai.

Result: cases.ponce.ai = new version, same as staging.

---

## Option B: Merge in the terminal (no PR)

If you prefer to merge locally and push:

```bash
cd /path/to/test7
git fetch origin
git checkout main
git pull origin main
git merge origin/staging -m "Merge staging into main: UI updates for production"
# Fix any conflicts if Git reports them, then:
git push origin main
```

Again: no force push. After this, main has staging’s changes and production (cases.ponce.ai) will update on the next deploy from main.

---

## If you see merge conflicts

- They’ll be in files that changed on **both** main and staging (e.g. under `skin-type-react/`).
- For **skin-type-react** UI (offer card, results screen, CTA, etc.): keep **staging’s** version (the new UI).
- For repo-level files (e.g. `vercel.json`): keep **main’s** version unless you intentionally changed them on staging.

After resolving:

```bash
git add .
git commit -m "Resolve merge: keep staging UI, main config"
git push origin main
```

---

## Summary

- **main** = what cases.ponce.ai runs (old version right now).
- **staging** = new version with all your UI changes.
- **clean-dashboard** = local copy of staging; no separate deploy.

To proceed: **merge staging into main** (Option A or B), then let production deploy from main. No force push required.

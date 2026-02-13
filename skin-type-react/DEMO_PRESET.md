# Demo preset: best concerns + areas for demos

Use a **pre-selected** set of concerns and areas so that **all or almost all** results stay **within** the selected concerns and areas (no Full Face, so no “Skin All” spillover).

## Recommended preset (best without Full Face)

- **Concerns:** **Skin Laxity**, **Volume Loss**
- **Areas:** **Cheeks**, **Eyes**, **Jawline**

We **avoid Nose** (most nose cases are rhinoplasty → filtered out) and **Full Face**. This gives many **non-surgical** cases, and every case is in at least one of these concerns and one of these areas. We do **not** include Full Face so the app doesn’t show eyes/forehead cases when you didn’t select them.

## How to use the preset in the app

1. **URL preset (easiest)**  
   Open the app with `?demo=1` in the URL, e.g.  
   `https://yoursite.com/?demo=1`  
   On a fresh load (no existing session), the app will pre-fill:
   - **2 concerns:** Skin Laxity, Volume Loss  
   - **3 areas:** Cheeks, Eyes, Jawline  

   You can then click Get Started → go through the flow; the Concerns and Areas steps will already have these selected.

2. **Manual selection**  
   If you don’t use the URL, select the same options by hand on the Concerns and Areas screens.

## Other strong presets (all without Full Face)

From `node scripts/demo-preset-analysis.js` (see “Best demo WITHOUT Full Face”):

| Concerns | Areas | Approx. cases |
|----------|--------|----------------|
| **Skin Laxity, Volume Loss** | **Cheeks, Eyes, Jawline** | **Recommended** |
| Skin Laxity, Volume Loss | Eyes, Jawline, Lips | Good |
| Skin Texture, Volume Loss | Jawline, Lips, Cheeks | Good |
| Facial Structure, Skin Laxity | Eyes, Jawline, Nose | Poor for demo (Nose mostly surgical) |

## Why Nose disappears in the app

The app **excludes surgical cases** when loading data. Most **Nose + Facial Structure** cases in the CSV are rhinoplasty (and many Eyes cases are blepharoplasty), so they never appear. The analysis script counts from the CSV (which includes surgical cases). For demos we therefore recommend presets that have many **non-surgical** cases (e.g. Skin Laxity + Volume Loss, Cheeks/Eyes/Jawline).

## Config and analysis

- **Preset config:** `src/config/demoPreset.ts` — defines the default demo concern/area IDs and URL handling.
- **Analysis script:** `scripts/demo-preset-analysis.js` (project root) — reads `case-concern-area-combined.csv` and prints case counts per concern/area and top preset combinations. Re-run after updating the CSV.

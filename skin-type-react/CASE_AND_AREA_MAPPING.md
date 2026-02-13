# Case-to-Concern and Case-to-Area Mapping

This document describes how cases are mapped to **concerns** and to **areas** in the skin-type-react app (and where CSVs or other data come from).

**For a more robust approach using database fields:** see **[DATABASE_MAPPING_DESIGN.md](./DATABASE_MAPPING_DESIGN.md)** — add a `Case Concerns` multi-select on the Photos table and backfill; the app already uses `concernIds` when present and falls back to keywords otherwise.

---

## Quick check: combined CSV (Concern + Area)

**File:** `case-concern-area-combined.csv` (project root)

Columns: **Case ID**, **Case Name**, **Areas**, **Concerns**.

**Concerns use the same names as in the app** (the options users see when selecting concerns):

- Facial Asymmetry  
- Facial Structure  
- Skin Texture  
- Fine Lines & Wrinkles  
- **Skin Laxity**  
- Volume Loss  
- Pigmentation  
- Excess Fat  

*(If you see "Unwanted Hair", that comes from legacy data; it is not a separate selectable concern in the app—those cases may still match under Skin Texture via keywords.)*

Use this to see which cases would show for a given concern and area **without going through the app**:

1. Open the CSV in Excel or Google Sheets.
2. Turn on filters (e.g. Data → Filter).
3. Filter **Concerns** by text contains (e.g. `Skin Laxity` or `Facial Structure`).
4. Filter **Areas** by text contains (e.g. `Lips` or `Jawline`).
5. The visible rows are the cases that would appear when a user selects that concern and that area.

Regenerate the file after changing source data:  
`node scripts/merge-case-concern-area-csv.js`

---

## 1. Case-to-Concern Mapping

### How it works

1. **Explicit mapping (CSV / `CASE_CATEGORY_MAPPING`)**  
   If a case ID exists in `CASE_CATEGORY_MAPPING` and one of its category IDs matches the selected concern ID, the case is considered to match that concern (and then area filtering is still applied).

2. **Keyword fallback**  
   If there is no explicit mapping (or it doesn’t match), the app matches on case text using the concern’s keywords:
   - **Source fields:** case `name`, `matchingCriteria`, `solved`
   - **Keywords:** from `HIGH_LEVEL_CONCERNS[].mapsToPhotos` and `mapsToSpecificIssues` in `src/constants/data.ts`

### Where the mapping comes from

- **Main app (app.js)**  
  Uses an in-memory object `CASE_CATEGORY_MAPPING` in `app.js` (around line 11180):
  - **Format:** `Record<caseId, categoryId[]>`  
  - **Example:** `rec0TpqaffljCfzOt: ["facial-balancing"]`
  - **Category IDs** in that object are the **legacy slugs** used by the main app (e.g. `facial-balancing`, `restore-volume-definition`, `improve-skin-texture-tone`, `smooth-wrinkles-lines`, `eyelid-eye-area-concerns`, `reduce-dark-spots-discoloration`, `unwanted-hair-removal`, `wellness-longevity`).

- **React app (skin-type-react)**  
  - Reads `CASE_CATEGORY_MAPPING` from `window` when it’s set by the main app (see `App.tsx`).
  - **Concern IDs** in React are **different** from the legacy category slugs: e.g. `facial-structure`, `skin-texture`, `fine-lines-wrinkles`, `facial-asymmetry`, etc. (see `HIGH_LEVEL_CONCERNS` in `src/constants/data.ts`).
  - So for a case to match via the mapping in React, the stored category IDs would need to be **React concern IDs**, or you need a translation layer from legacy slugs to React concern IDs. Otherwise, React relies on the **keyword fallback** for that concern.

### CSV used for the main app’s mapping

The main app’s `CASE_CATEGORY_MAPPING` is conceptually built from the same analysis as:

**File:** `case-category-analysis.csv` (project root)

| Column               | Description |
|----------------------|-------------|
| Case ID              | Airtable record ID (e.g. `rec08elFBXXtIfXZi`) |
| Case Name            | Case title |
| Matched Categories   | Display names, semicolon-separated (e.g. `Facial Balancing`, `Restore Volume & Definition`) |
| Matching Criteria    | From Airtable |
| Solved Issues        | From Airtable |
| Direct Matching Issues | From Airtable |

- The **React app does not read this CSV at runtime.**  
- The **main app** uses an object derived from this analysis, with **slug IDs** (e.g. `facial-balancing`) instead of display names.  
- To drive React’s explicit mapping, you’d need either:
  - A CSV or object that maps **Case ID → React concern IDs** (e.g. `facial-structure`, `skin-texture`), or  
  - A mapping from legacy category slugs to React concern IDs and then use the existing `CASE_CATEGORY_MAPPING` (case ID → legacy slugs) plus that translation.

### React concern IDs (for your own CSV)

If you create a CSV to map cases to concerns for React, use these **concern IDs** (from `src/constants/data.ts`):

- `facial-asymmetry`
- `facial-structure`
- `skin-texture`
- `fine-lines-wrinkles`
- `pigmentation`
- `unwanted-hair`
- `wellness-longevity`

**Example CSV format for React** (one or more concern IDs per case, e.g. semicolon-separated):

```csv
Case ID,Concern IDs
rec08elFBXXtIfXZi,facial-structure
rec0TpqaffljCfzOt,facial-structure
rec1atkwdW9rEqA33,fine-lines-wrinkles
rec2734jRXc52jRHd,fine-lines-wrinkles;skin-texture
```

The app does not load a CSV by default; it uses `window.CASE_CATEGORY_MAPPING` from the main app (which uses legacy slugs). To use a CSV with React concern IDs, the app would need to be updated to load it and pass React IDs into the matching logic.

---

## 2. Case-to-Area Mapping

There is **no CSV read at runtime** for areas. Mapping is done in two ways:

### A. Airtable (primary when present)

- **Fields:** `Area Names` or `Areas` on the Photos table.
- **In React:** Exposed as `areaNames` on each case (see `App.tsx` where records are transformed).
- **Values:** e.g. `"Jawline"`, `"Mouth & Lips"`, `"Eyes"`, `"Skin All"`, or an array of such strings.
- **Usage:**  
  - In `getRelevantAreasForCase()` and in the area-filter logic in `getMatchingCasesForConcern()`, if `areaNames` is set, it is used (with normalization like "Mouth & Lips" → "Lips") and can override or complement keyword matching.

### B. Keyword matching in code

When `areaNames` is missing or we need to infer areas from text, areas are derived from a **hardcoded** list in `src/utils/caseMatching.ts` inside `getRelevantAreasForCase()` (and the same list is used for area filtering):

**File:** `skin-type-react/src/utils/caseMatching.ts` (around lines 691–706 and 611–624)

| Area     | Keywords (examples) |
|---------|----------------------|
| Forehead | forehead, temple, glabella, 11s, temporal, brow ptosis, brow lift, … |
| Eyes    | eye, eyes, eyelid, under eye, brow, eyebrows, ptosis, … |
| Cheeks  | cheek, cheeks, cheekbone, mid cheek |
| Nose    | nose, nasal, nasal tip, dorsal hump |
| Lips    | lip, lips, mouth, philtral, gummy smile |
| Jawline | jawline, jaw, jowl, jowls, wide jawline, define jawline |
| Chin    | chin, retruded chin, labiomental |
| Neck    | neck, neckline |
| Chest   | chest, decolletage, cleavage |
| Hands   | hand, hands |
| Arms    | arm, arms |
| Body    | body |

- **Source text:** case `name` + `matchingCriteria` + `solved` concatenated.
- **Logic:** If any keyword appears in that text, the corresponding area is added. If Airtable `areaNames` is present, it is also used (see `getRelevantAreasForCase()` and the filter block in `getMatchingCasesForConcern()`).

### Analysis-only CSV (not used at runtime)

**File:** `case-area-mapping.csv` (project root)

- **Purpose:** Output of the script `generate-case-area-mapping.js` (or `extract-case-area-mapping.js`). It summarizes for each case:
  - Keyword-matched areas
  - Airtable areas
  - Whether they align
- The app **does not load this CSV**. It is for analysis and debugging only.

---

## Summary

| What              | CSV / source | Used at runtime? |
|-------------------|--------------|-------------------|
| Case → concerns   | `case-category-analysis.csv` (analysis); main app’s `CASE_CATEGORY_MAPPING` (case ID → legacy category slugs) | React uses `window.CASE_CATEGORY_MAPPING` if set; React concern IDs differ from legacy slugs, so keyword fallback is often what matches. |
| Case → areas      | No CSV. **Airtable** `Area Names` / `Areas` + **keyword list** in `caseMatching.ts` | Yes. Airtable fields and the same keyword list in code. |
| Area analysis     | `case-area-mapping.csv` from `generate-case-area-mapping.js` | No; analysis only. |

To change which cases map to which **concerns**, you can:
- Adjust the main app’s `CASE_CATEGORY_MAPPING` (and/or add a CSV → object build step) and, if needed, map legacy category IDs to React concern IDs, or  
- Rely on keyword matching and edit `HIGH_LEVEL_CONCERNS[].mapsToPhotos` and `mapsToSpecificIssues` in `src/constants/data.ts`.

To change which cases map to which **areas**, you can:
- Edit **Airtable** `Area Names` / `Areas` for each case, and/or  
- Edit the **area keyword list** in `src/utils/caseMatching.ts` in `getRelevantAreasForCase()` and in the area-filter section of `getMatchingCasesForConcern()`.

# Database-Backed Case Mapping (Design)

Using **explicit fields in the database** (Airtable Photos table) for case→concern and case→area mapping is more robust than keyword matching and avoids depending on `CASE_CATEGORY_MAPPING` from the main app.

---

## 1. Recommended Airtable fields (Photos table)

### Case Concerns (new)

- **Field name:** `Case Concerns` (or `App Concerns`)
- **Type:** Multi-select
- **Options:** Use the **exact concern IDs** from the app so the frontend can match without a lookup table:

  | Option (value)      | Display label (optional)   |
  |---------------------|----------------------------|
  | `facial-asymmetry`  | Facial Asymmetry           |
  | `facial-structure`  | Facial Structure           |
  | `skin-texture`      | Skin Texture               |
  | `fine-lines-wrinkles` | Fine Lines & Wrinkles   |
  | `skin-laxity`       | Skin Laxity                |
  | `volume-loss`       | Volume Loss                |
  | `pigmentation`      | Pigmentation              |
  | `excess-fat`        | Excess Fat                 |

- **Usage:** For each Photo/case record, select every app concern this case is relevant for. The app will use this list first; if empty or missing, it falls back to keyword matching.

### Areas (existing; ensure consistency)

- You likely already have **Areas** or **Area Names** on Photos.
- **Ideal:** Multi-select with values that match app area **names**: `Full Face`, `Forehead`, `Eyes`, `Cheeks`, `Nose`, `Lips`, `Jawline`, `Chin`, `Neck`, `Chest`, `Hands`, `Arms`, `Body`.
- If Airtable uses different labels (e.g. `Mouth & Lips`), the app already normalizes `Mouth & Lips` → `Lips` in area matching. For maximum robustness, align Airtable options with app names.

---

## 2. Backend

- **No API change required.** The backend (e.g. `GET /api/dashboard/leads?tableName=Photos`) already returns whatever fields exist on each Airtable record.
- **Action:** Ensure the Photos table in Airtable includes the new `Case Concerns` field (and that Areas/Area Names are present). The API will automatically return them in `record.fields`.

If you ever add **field filtering** to the Photos endpoint, include at least:  
`Name`, `Area Names` or `Areas`, `Case Concerns`, `Surgical`, and any other fields the frontend currently uses (e.g. Matching Criteria, Solved, Treatment, etc.).

---

## 3. Frontend (skin-type-react)

### 3.1 Map the new field when loading cases

In `App.tsx`, when building each case from `record.fields`, add:

- **Case Concerns:**  
  `concernIds: fields["Case Concerns"] || fields["App Concerns"] || null`  
  Normalize to an array of strings (Airtable multi-select returns an array).

### 3.2 Use DB concern list in matching (caseMatching.ts)

In `getMatchingCasesForConcern`:

1. **If** the case has `concernIds` (array) and `concernIds.includes(concernId)` → treat as matching that concern (then apply area filter as today).
2. **Else** → keep current behavior: `CASE_CATEGORY_MAPPING` (if present) and keyword matching.

Same for areas: if the case has a normalized list of area names (from `areaNames` / `Areas`), the existing area logic already uses it; keyword fallback remains for records with missing or generic area data.

### 3.3 Type (CaseItem)

Add optional:

- `concernIds?: string[]`  
  so the type reflects the new field and the matching logic can use it safely.

---

## 4. Backfill

Populate `Case Concerns` for existing Photos using your existing CSVs:

- **Source:** `case-concern-area-combined.csv` (columns: Case ID, Concerns).  
  Or `case-category-analysis.csv` if you have case ID → category there; then map category names to the app concern IDs above.

- **Mapping from CSV concern names to app IDs:**

  | CSV / label              | App ID                 |
  |--------------------------|------------------------|
  | Facial Asymmetry         | `facial-asymmetry`     |
  | Facial Structure        | `facial-structure`     |
  | Skin Texture            | `skin-texture`         |
  | Fine Lines & Wrinkles   | `fine-lines-wrinkles`  |
  | Skin Laxity             | `skin-laxity`          |
  | Volume Loss             | `volume-loss`          |
  | Pigmentation            | `pigmentation`         |
  | Excess Fat              | `excess-fat`           |

- **Process:** For each row, take Case ID and Concerns (semicolon-separated). Split concerns, map each to an app ID, then update the Airtable Photo record (e.g. via Airtable UI bulk edit, or a small script using Airtable API) to set `Case Concerns` to that array of IDs.

A small Node script that reads `case-concern-area-combined.csv` and outputs a JSON or CSV of `recordId` → `["concernId1", "concernId2"]` can be used to drive the backfill (e.g. with Airtable’s update API or a CSV import if supported).

---

## 5. Benefits

- **Single source of truth:** Mapping lives on the case record; no dependency on `window.CASE_CATEGORY_MAPPING` or static CSVs in the React app.
- **Same behavior everywhere:** Standalone skin-type-react and embedded flows both use the same logic.
- **Easier fixes:** Change a case’s concerns/areas in Airtable instead of editing code or regenerating CSVs.
- **Fallback:** If `Case Concerns` is empty or missing, the app still uses keyword (and optional CSV) matching so existing records keep working during and after backfill.

---

## 6. Summary checklist

| Step | Owner | Action |
|------|--------|--------|
| 1 | Airtable | Add multi-select field `Case Concerns` to Photos with options = app concern IDs. |
| 2 | Backend | No change (or add `Case Concerns` to field list if you use field filtering). |
| 3 | Frontend | Map `fields["Case Concerns"]` → `caseItem.concernIds`; in matching, prefer `concernIds.includes(concernId)` over keywords when present. |
| 4 | Data | Backfill `Case Concerns` from `case-concern-area-combined.csv` (or equivalent). |

Once this is in place, you can keep keyword matching as a fallback and optionally phase out reliance on `CASE_CATEGORY_MAPPING` for the React app.

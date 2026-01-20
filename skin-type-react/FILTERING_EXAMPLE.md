# Case Matching Filtering Logic - Example Walkthrough

## Example User Inputs

Let's say a user enters:
- **Concern**: "Fine Lines & Wrinkles" (id: `fine-lines-wrinkles`)
- **Area**: "Eyes" (id: `eyes`)
- **Age**: "30-39" (midpoint: 35)
- **Skin Type**: "Combination"
- **Skin Tone**: "Light"
- **Ethnic Background**: "Caucasian"

## Example Cases in Airtable

Let's say we have these 6 cases in the database:

### Case 1: "Under Eye Wrinkles with Botox"
- **Name**: "Under Eye Wrinkles with Botox"
- **Matching Criteria**: ["wrinkles", "fine-lines", "under-eye"]
- **Solved**: ["under-eye-wrinkles", "crow's-feet"]
- **Patient Age**: 38
- **Skin Type**: "Combination"
- **Area keywords in text**: "eye", "under eye"
- **Surgical**: "Non-surgical"

### Case 2: "Forehead Lines Treatment"
- **Name**: "Forehead Lines Treatment"
- **Matching Criteria**: ["wrinkles", "forehead-lines"]
- **Solved**: ["forehead-wrinkles"]
- **Patient Age**: 42
- **Skin Type**: "Oily"
- **Area keywords in text**: "forehead"
- **Surgical**: "Non-surgical"

### Case 3: "Crow's Feet Reduction with RF"
- **Name**: "Crow's Feet Reduction with RF"
- **Matching Criteria**: ["fine-lines", "crow's-feet"]
- **Solved**: ["crow's-feet", "eye-wrinkles"]
- **Patient Age**: 35
- **Skin Type**: "Combination"
- **Area keywords in text**: "crow's-feet", "eye"
- **Surgical**: "Non-surgical"

### Case 4: "Acne Scar Treatment"
- **Name**: "Acne Scar Treatment"
- **Matching Criteria**: ["acne-scars", "scarring"]
- **Solved**: ["acne-scars"]
- **Patient Age**: 28
- **Skin Type**: "Oily"
- **Area keywords in text**: "cheek" (acne scars on cheeks)
- **Surgical**: "Non-surgical"

### Case 5: "Rhinoplasty for Nasal Tip"
- **Name**: "Rhinoplasty for Nasal Tip"
- **Matching Criteria**: ["facial-balancing", "nose"]
- **Solved**: ["droopy-tip"]
- **Patient Age**: 32
- **Skin Type**: "Combination"
- **Area keywords in text**: "nose", "nasal"
- **Surgical**: "Surgical"

### Case 6: "Pigmentation Treatment for Dark Spots"
- **Name**: "Pigmentation Treatment for Dark Spots"
- **Matching Criteria**: ["pigmentation", "dark-spots"]
- **Solved**: ["dark-spots", "sun-spots"]
- **Patient Age**: 40
- **Skin Type**: "Combination"
- **Area keywords in text**: "cheek" (spots on cheeks)
- **Surgical**: "Non-surgical"

---

## Step-by-Step Filtering Process

### Step 1: Concern Matching

**Concern**: "Fine Lines & Wrinkles"
- **mapsToPhotos**: `["wrinkles", "fine-lines", "aging", "lines"]`
- **mapsToSpecificIssues**: `["wrinkles", "fine-lines", "crow's-feet", "forehead-lines", "nasolabial-folds"]`

For each case, we check if it matches the concern:

#### Case 1: "Under Eye Wrinkles with Botox"
- **Name match**: ✅ "wrinkles" is in `mapsToPhotos` AND "under eye wrinkles" contains "wrinkles"
- **Criteria match**: ✅ "wrinkles" is in `mapsToPhotos` AND "wrinkles" is in Matching Criteria
- **Issue match**: ✅ "under-eye-wrinkles" and "crow's-feet" are in `mapsToSpecificIssues`
- **Result**: ✅ PASSES (nameMatch OR criteriaMatch OR issueMatch = true)

#### Case 2: "Forehead Lines Treatment"
- **Name match**: ✅ "lines" is in `mapsToPhotos` AND "forehead lines" contains "lines"
- **Criteria match**: ✅ "wrinkles" is in `mapsToPhotos` AND "wrinkles" is in Matching Criteria
- **Issue match**: ✅ "forehead-wrinkles" is in `mapsToSpecificIssues`
- **Result**: ✅ PASSES

#### Case 3: "Crow's Feet Reduction with RF"
- **Name match**: ✅ "fine-lines" is in `mapsToPhotos` AND "crow's feet" relates to fine lines
- **Criteria match**: ✅ "fine-lines" is in `mapsToPhotos` AND "fine-lines" is in Matching Criteria
- **Issue match**: ✅ "crow's-feet" is in `mapsToSpecificIssues`
- **Result**: ✅ PASSES

#### Case 4: "Acne Scar Treatment"
- **Name match**: ❌ No keywords from `mapsToPhotos` in name
- **Criteria match**: ❌ "acne-scars" not in `mapsToPhotos`
- **Issue match**: ❌ "acne-scars" not in `mapsToSpecificIssues`
- **Result**: ❌ FAILS (no match)

#### Case 5: "Rhinoplasty for Nasal Tip"
- **Name match**: ❌ No keywords from `mapsToPhotos` in name
- **Criteria match**: ❌ "facial-balancing" not in `mapsToPhotos` for this concern
- **Issue match**: ❌ "droopy-tip" not in `mapsToSpecificIssues`
- **Result**: ❌ FAILS

#### Case 6: "Pigmentation Treatment for Dark Spots"
- **Name match**: ❌ No keywords from `mapsToPhotos` in name
- **Criteria match**: ❌ "pigmentation" not in `mapsToPhotos` for this concern
- **Issue match**: ❌ "dark-spots" not in `mapsToSpecificIssues`
- **Result**: ❌ FAILS

**After Step 1**: Cases 1, 2, 3 pass → **3 cases remaining**

---

### Step 2: Area Matching

**Selected Area**: "Eyes"
- **Area keywords**: `["under eye", "under-eye", "eyelid", "eyelids", "upper eyelid", "lower eyelid", "brow", "brows", "eyebrow", "eyebrows", "eye", "eyes", "ptosis"]`

For each remaining case, we check if it matches the "Eyes" area:

#### Case 1: "Under Eye Wrinkles with Botox"
- **Text to search**: "under eye wrinkles with botox" + "wrinkles" + "fine-lines" + "under-eye" + "under-eye-wrinkles" + "crow's-feet"
- **Keyword match**: ✅ "under eye" found in text
- **Result**: ✅ PASSES

#### Case 2: "Forehead Lines Treatment"
- **Text to search**: "forehead lines treatment" + "wrinkles" + "forehead-lines" + "forehead-wrinkles"
- **Keyword match**: ❌ No "eye", "brow", "eyelid" keywords found
- **Result**: ❌ FAILS (doesn't match "Eyes" area)

#### Case 3: "Crow's Feet Reduction with RF"
- **Text to search**: "crow's feet reduction with rf" + "fine-lines" + "crow's-feet" + "eye-wrinkles"
- **Keyword match**: ✅ "eye" found in "eye-wrinkles" (from Solved field)
- **Result**: ✅ PASSES

**After Step 2**: Cases 1, 3 pass → **2 cases remaining**

---

### Step 3: Surgical Filter

#### Case 1: "Under Eye Wrinkles with Botox"
- **Surgical field**: "Non-surgical"
- **Result**: ✅ PASSES (not surgical)

#### Case 3: "Crow's Feet Reduction with RF"
- **Surgical field**: "Non-surgical"
- **Result**: ✅ PASSES (not surgical)

**After Step 3**: Cases 1, 3 pass → **2 cases remaining**

---

### Step 4: Matching Score Calculation

For each remaining case, calculate matching score (0-100):

#### Case 1: "Under Eye Wrinkles with Botox"
- **Age match** (30 points max):
  - User age: 35, Case age: 38
  - Age difference: |38 - 35| = 3
  - Score: 25 points (within 2-5 years)
- **Category match** (50 points max):
  - Concern matches: ✅ (nameMatch + criteriaMatch + issueMatch)
  - Score: 50 points (perfect match)
- **Skin type match** (20 points max):
  - User: "Combination", Case: "Combination"
  - Score: 20 points (exact match)
- **Total**: 25 + 50 + 20 = **95 points**

#### Case 3: "Crow's Feet Reduction with RF"
- **Age match** (30 points max):
  - User age: 35, Case age: 35
  - Age difference: |35 - 35| = 0
  - Score: 30 points (exact match)
- **Category match** (50 points max):
  - Concern matches: ✅ (nameMatch + criteriaMatch + issueMatch)
  - Score: 50 points (perfect match)
- **Skin type match** (20 points max):
  - User: "Combination", Case: "Combination"
  - Score: 20 points (exact match)
- **Total**: 30 + 50 + 20 = **100 points**

**After Step 4**: Cases sorted by score → **Case 3 (100), Case 1 (95)**

---

## Final Results

### Expected Output:
1. **2 matching cases** found for "Fine Lines & Wrinkles" concern
2. **Sorted by matching score** (highest first):
   - Case 3: "Crow's Feet Reduction with RF" (100 points)
   - Case 1: "Under Eye Wrinkles with Botox" (95 points)

### Why Cases Were Filtered Out:

- **Case 2** ("Forehead Lines Treatment"): ❌ Filtered by **area matching** - doesn't match "Eyes" area
- **Case 4** ("Acne Scar Treatment"): ❌ Filtered by **concern matching** - doesn't match "Fine Lines & Wrinkles"
- **Case 5** ("Rhinoplasty for Nasal Tip"): ❌ Filtered by **concern matching** AND **surgical filter** - doesn't match concern and is surgical
- **Case 6** ("Pigmentation Treatment"): ❌ Filtered by **concern matching** - doesn't match "Fine Lines & Wrinkles"

---

## Key Takeaways

1. **Concern matching is strict**: Cases must have keywords in name/criteria/solved that match the concern's `mapsToPhotos` or `mapsToSpecificIssues`

2. **Area matching is strict**: If user selects areas, cases must contain area-specific keywords in their name, criteria, or solved fields

3. **Surgical cases are always filtered out**: Even if they match concern and area

4. **Matching score determines order**: Higher scores (better age/skin type matches) appear first

5. **Multiple filters work together**: A case must pass ALL filters (concern AND area AND not surgical) to be shown

---

## Testing This Example

To test this in your app:
1. Select "Fine Lines & Wrinkles" as concern
2. Select "Eyes" as area
3. Enter age "30-39"
4. Select "Combination" skin type
5. Complete the rest of the form
6. Check the console logs to see the filtering process
7. You should see cases matching "Fine Lines & Wrinkles" + "Eyes" area

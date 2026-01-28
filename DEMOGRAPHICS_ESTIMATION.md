# Demographics Estimation Guide

This guide explains how to estimate and add demographic information to your Photos table in Airtable for better patient matching.

## Overview

The `estimate-demographics.js` script analyzes your existing Photos table records and estimates the following demographic fields:

- **Age** (Number) - Patient age in years
- **Skin Type** (Single select) - Options: `dry`, `oily`, `balanced`, `combination`
- **Sun Response** (Single select) - Options: `always burns`, `usually burns`, `sometimes tans`, `usually tans`, `always tans`, `rarely burns`
- **Skin Tone** (Single select) - Options: `light`, `fair`, `medium`, `tan`, `brown`, `deep`
- **Ethnic Background** (Single select) - Options: `asian`, `black`, `hispanic/latino`, `middle eastern`, `white`, `mixed`, `other`

## Setup: Create Fields in Airtable

Before running the script, you need to add these fields to your Photos table:

### 1. Age (Number)
- Field type: **Number**
- Field name: `Age` (or `Patient Age` - the script checks both)

### 2. Skin Type (Single select)
- Field type: **Single select**
- Field name: `Skin Type`
- Options (create these exact options):
  - `dry`
  - `oily`
  - `balanced`
  - `combination`

### 3. Sun Response (Single select)
- Field type: **Single select**
- Field name: `Sun Response`
- Options (create these exact options):
  - `always burns`
  - `usually burns`
  - `sometimes tans`
  - `usually tans`
  - `always tans`
  - `rarely burns`

### 4. Skin Tone (Single select)
- Field type: **Single select**
- Field name: `Skin Tone`
- Options (create these exact options):
  - `light`
  - `fair`
  - `medium`
  - `tan`
  - `brown`
  - `deep`

### 5. Ethnic Background (Single select)
- Field type: **Single select**
- Field name: `Ethnic Background`
- Options (create these exact options):
  - `asian`
  - `black`
  - `hispanic/latino`
  - `middle eastern`
  - `white`
  - `mixed`
  - `other`

## How the Estimation Works

### Age Estimation
The script looks for age mentions in:
- The `Name` field (e.g., "Sarah, 42 years old")
- The `Story` or `Story Detailed` field (e.g., "This 35-year-old patient...")
- The `Patient Name` field
- Patterns like "42 years old", "in her 40s", "35-year-old"

If no age is found, the field is left empty.

### Ethnic Background Estimation
The script analyzes:
- Patient names (using common surname patterns)
- Story text for ethnic/cultural references
- Patterns like "Chinese", "Hispanic", "African American", etc.

If no pattern matches, it defaults to `white` (most common in US demographics).

### Skin Tone Estimation
Based on estimated ethnic background:
- `asian` → `medium`
- `black` → `deep`
- `hispanic/latino` → `tan`
- `middle eastern` → `medium`
- `white` → `fair`
- `mixed` → `medium`

### Sun Response Estimation
Based on skin tone and ethnic background:
- Deep skin tones → `rarely burns`
- Fair/light skin → `usually burns` or `always burns`
- Medium/tan skin → `usually tans` or `sometimes tans`
- Brown skin → `usually tans` or `rarely burns`

### Skin Type Estimation
Since skin type is difficult to determine from text alone, the script uses a weighted random distribution:
- `combination`: 40% (most common)
- `balanced`: 30%
- `dry`: 20%
- `oily`: 10%

## Running the Script

### Step 1: Review the Script
Open `estimate-demographics.js` and verify:
- The API key and base ID are correct
- `DRY_RUN` is set to `true` (for safety)

### Step 2: Run in Dry Run Mode (Recommended First)
```bash
node estimate-demographics.js
```

This will:
- Fetch all records from your Photos table
- Estimate demographics for records that don't already have them
- Show you a preview of what will be updated
- **NOT actually update any records** (safe to run)

### Step 3: Review the Preview
The script will show you:
- How many records will be updated
- A preview of the first 5 updates
- What fields will be added to each record

### Step 4: Run for Real
If the preview looks good:
1. Open `estimate-demographics.js`
2. Change `const DRY_RUN = true;` to `const DRY_RUN = false;`
3. Run the script again:
   ```bash
   node estimate-demographics.js
   ```

The script will:
- Update each record with estimated demographics
- Show progress as it updates
- Rate limit requests (200ms between updates) to avoid API limits

## Important Notes

### Accuracy
- **These are estimates** based on text analysis and heuristics
- They may not be 100% accurate
- You should review and manually correct any incorrect estimates

### Manual Review Recommended
After running the script:
1. Review a sample of updated records
2. Check if estimates seem reasonable
3. Manually correct any that seem wrong
4. For records with photos, you can visually verify skin tone

### Records Already with Demographics
The script **skips** records that already have all demographic fields filled in. This means:
- You can run it multiple times safely
- You can manually update some records and re-run for others
- It won't overwrite existing data

### Rate Limiting
The script includes a 200ms delay between updates to respect Airtable's API rate limits. For large tables, this may take some time.

## Troubleshooting

### Error: "Field doesn't exist"
- Make sure you've created all 5 fields in Airtable
- Check that field names match exactly (case-sensitive)

### Error: "Invalid option"
- Make sure all single select options are created exactly as listed above
- Check for typos or extra spaces

### No records updated
- Check if records already have demographics
- Verify the script found records to update (check the preview)

### API Rate Limit Errors
- The script includes rate limiting, but if you still hit limits:
  - Increase the delay in the `setTimeout` call
  - Run the script in smaller batches

## Next Steps

After estimating demographics:
1. Review and manually correct estimates where needed
2. Update your app's matching algorithm to use these fields
3. Consider collecting actual demographics from new patients going forward

## Integration with Matching Algorithm

Once demographics are added, you can update your matching algorithm in `app.js` to use these fields:

```javascript
// In calculateMatchingScore function
if (caseItem['Skin Tone'] && userSelections.skinTone) {
  if (caseItem['Skin Tone'] === userSelections.skinTone) {
    score += 10; // Bonus for matching skin tone
  }
}

if (caseItem['Ethnic Background'] && userSelections.ethnicBackground) {
  if (caseItem['Ethnic Background'] === userSelections.ethnicBackground) {
    score += 10; // Bonus for matching ethnic background
  }
}
```

This will help match users with cases that have similar demographics for a more personalized experience.





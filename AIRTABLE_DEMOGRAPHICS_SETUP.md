# Airtable Demographics Setup Guide

This guide explains how to set up the demographic fields in your Photos table so the script can populate them and your app can use them for matching.

## Step 1: Create Fields in Airtable Photos Table

Add these 5 fields to your **Photos** table with the exact names and types shown below:

### 1. Age

- **Field Name**: `Age` (exact match, case-sensitive)
- **Field Type**: Number
- **Description**: Patient age in years

### 2. Skin Tone

- **Field Name**: `Skin Tone` (exact match, case-sensitive)
- **Field Type**: Single select
- **Options** (create these exact options):
  - `light`
  - `fair`
  - `medium`
  - `tan`
  - `brown`
  - `deep`

### 3. Ethnic Background

- **Field Name**: `Ethnic Background` (exact match, case-sensitive)
- **Field Type**: Single select
- **Options** (create these exact options):
  - `asian`
  - `black`
  - `hispanic/latino`
  - `middle eastern`
  - `white`
  - `mixed`
  - `other`

### 4. Skin Type

- **Field Name**: `Skin Type` (exact match, case-sensitive)
- **Field Type**: Single select
- **Options** (create these exact options):
  - `dry`
  - `oily`
  - `balanced`
  - `combination`

### 5. Sun Response

- **Field Name**: `Sun Response` (exact match, case-sensitive)
- **Field Type**: Single select
- **Options** (create these exact options):
  - `always burns`
  - `usually burns`
  - `sometimes tans`
  - `usually tans`
  - `always tans`
  - `rarely burns`

## Step 2: Run the Script to Populate Fields

Once the fields are created:

1. **Test with a few records first** (set `DRY_RUN = true` to preview)
2. **Run the script**:
   ```bash
   node estimate-demographics-from-photos.js
   ```
3. **Review results** in Airtable to verify accuracy
4. **Set `DRY_RUN = false`** and run again to actually update records

## Step 3: Verify Field Names Match

The script uses these exact field names (case-sensitive):

- `Age`
- `Skin Tone`
- `Ethnic Background`
- `Skin Type`
- `Sun Response`

If your Airtable fields have different names, the script won't be able to update them. Make sure they match exactly!

## Step 4: Integration with Matching Algorithm

After the fields are populated, you can update your matching algorithm in `app.js` to use these demographics. See the next section for code examples.

## Troubleshooting

### Script says "No demographics extracted"

- Check that field names match exactly (case-sensitive)
- Verify the fields exist in your Photos table
- Check that single select options match exactly

### Some fields are null

- This is normal - the AI can't always determine all demographics from photos
- Review and manually correct obvious errors
- The script will skip records that already have all fields filled

### Field update errors

- Make sure single select options match exactly (including capitalization)
- Check that Age field is set to Number type
- Verify you have write permissions to the Photos table




# Airtable "Matching" Column Guide

The "Matching" column in your Photos table should contain comma-separated issue names that each case should match to. This makes matching much more reliable than the automatic fuzzy matching.

## How to Use

1. **Column Type**: Single-line text
2. **Format**: Comma-separated issue names (case-insensitive)
3. **Example**: `Unwanted Hair` or `Stubborn Fat, Weight Loss`

## Values for Your Problem Cases

Here are the exact values to add to the "Matching" column for the cases you're having trouble with:

### For Laser Hair Removal:
- **Case Name**: `Motus AZ+ Laser Hair Removal`
- **Matching Value**: `Unwanted Hair`

### For Body Contouring Cases:
- **Case Name**: `Burn Off Stubborn Fat with PHYSIQ 360 Body Contouring`
- **Matching Value**: `Stubborn Fat`

- **Case Name**: `Burn Off Stubborn Fat with Everesse RF Body Contouring`
- **Matching Value**: `Stubborn Fat`

## Issue Name Reference

Use these exact issue names in the "Matching" column (case doesn't matter, but spelling does):

### Face Issues:
- `Forehead Wrinkles`
- `Brow Asymmetry`
- `Flat Forehead`
- `Brow Ptosis`
- `Temporal Hollow`
- `Under Eye Wrinkles`
- `Under Eye Dark Circles`
- `Excess Upper Eyelid Skin`
- `Lower Eyelid - Excess Skin`
- `Upper Eyelid Droop`
- `Lower Eyelid Sag`
- `Lower Eyelid Bags`
- `Under Eye Hollow`
- `Upper Eye Hollow`
- `Mid Cheek Flattening`
- `Lower Cheeks - Volume Depletion`
- `Droopy Tip`
- `Dorsal Hump`
- `Tip Droop When Smiling`
- `Thin Lips`
- `Lacking Philtral Column`
- `Long Philtral Column`
- `Gummy Smile`
- `Asymmetric Lips`
- `Dry Lips`
- `Lip Thinning When Smiling`
- `Retruded Chin`
- `Over-Projected Chin`
- `Jowls`
- `Ill-Defined Jawline`
- `Prejowl Sulcus`
- `Neck Lines`
- `Loose Neck Skin`
- `Platysmal Bands`
- `Dark Spots`
- `Red Spots`
- `Scars`
- `Blackheads`
- `Nasolabial Folds`

### Body Issues:
- `Unwanted Hair`
- `Stubborn Fat`
- `Weight Loss`

## Multiple Issues

If a case matches multiple issues, separate them with commas:
- Example: `Under Eye Dark Circles, Under Eye Wrinkles`

## Benefits

1. **Reliable Matching**: Cases will match exactly to the issues you specify
2. **No False Positives**: Won't match cases to unrelated issues
3. **Easy to Update**: Just change the "Matching" field in Airtable
4. **Future-Proof**: Can easily add new cases and specify exactly which issues they match

## How It Works

The app will:
1. First check the "Matching" field for direct matches
2. If found, use those matches (no fuzzy logic needed)
3. If not found, fall back to the old automatic matching logic

This means you can gradually add "Matching" values to your cases, and the app will use them when available.












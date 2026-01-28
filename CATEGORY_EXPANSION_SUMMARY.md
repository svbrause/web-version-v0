# Category Expansion Summary

## Problem
135 out of 212 cases (64%) were unmatched to any concern category. Analysis revealed patterns in unmatched cases that could be addressed by expanding existing categories and adding one new category.

## Solution: Expand Existing Categories + Add One New Category

### 1. **Expanded "Smooth Wrinkles & Lines"**
**Added Keywords:**
- `wrinkles`, `lines`, `smooth`

**Added Specific Issues:**
- `under-eye-wrinkles`
- `neck-lines`
- `smile-lines`
- `nasolabial-lines`
- `marionette-lines`
- `bunny-lines`
- `perioral-wrinkles`

**Impact:** Should match ~12 additional wrinkle-related cases

### 2. **Expanded "Restore Volume & Definition"**
**Added Keywords:**
- `volume`, `hollow`, `flatten`, `depletion`, `thin`, `narrow`, `sulcus`, `prejowl`

**Added Specific Issues:**
- `mid-cheek-flattening`
- `lower-cheek-volume-depletion`
- `under-eye-hollow`
- `upper-eye-hollow`
- `temporal-hollow`
- `flat-forehead`
- `lacking-philtral-column`
- `prejowl-sulcus`
- `narrow-jawline`
- `retruded-chin`

**Impact:** Should match ~16 additional volume-related cases

### 3. **Expanded "Facial Balancing"**
**Added Keywords:**
- `droopy-tip`, `dorsal-hump`, `nasal-tip`, `rhinoplasty`, `over-projected`, `gummy-smile`, `long-philtral-column`, `philtral`

**Added Specific Issues:**
- `droopy-tip`
- `dorsal-hump`
- `nasal-tip-too-narrow`
- `over-projected-chin`
- `gummy-smile`
- `long-philtral-column`

**Impact:** Should match ~26 additional nose/chin/lip asymmetry cases

### 4. **Expanded "Improve Skin Texture & Tone"**
**Added Keywords:**
- `skin-laxity`, `tighten-skin`, `scars`, `blackheads`, `oily-skin`, `dry-skin`, `neck`, `submental`, `platysmal`, `neck-lines`

**Added Specific Issues:**
- `skin-laxity`
- `loose-skin`
- `scars`
- `blackheads`
- `oily-skin`
- `dry-skin`
- `excess-skin`
- `neck-excess-skin`
- `loose-neck-skin`
- `platysmal-bands`
- `excess-submental-fullness`
- `jowls`

**Impact:** Should match ~27 additional skin/neck-related cases

### 5. **NEW: "Eyelid & Eye Area Concerns"**
**New Category Added:**
- **ID:** `eyelid-eye-area-concerns`
- **Name:** "Eyelid & Eye Area Concerns"
- **Description:** "Address drooping eyelids, excess skin, bags, and dark circles"
- **Group:** Face
- **Icon:** eyes

**Keywords:**
- `eyelid`, `eyelids`, `upper-eyelid`, `lower-eyelid`, `blepharoplasty`, `eye-droop`, `eye-bags`, `under-eye`, `dark-circles`, `canthal-tilt`

**Specific Issues:**
- `upper-eyelid-droop`
- `lower-eyelid-excess-skin`
- `excess-upper-eyelid-skin`
- `lower-eyelid-bags`
- `under-eye-dark-circles`
- `negative-canthal-tilt`
- `lower-eyelid-sag`

**Impact:** Should match ~28 eye-related cases

## Expected Results

After these changes, we expect:
- **Facial Balancing:** ~43 cases (was 17, +26)
- **Smooth Wrinkles & Lines:** ~30 cases (was 18, +12)
- **Restore Volume & Definition:** ~33 cases (was 17, +16)
- **Improve Skin Texture & Tone:** ~55 cases (was 28, +27)
- **Eyelid & Eye Area Concerns:** ~28 cases (new category)
- **Unmatched:** ~19 cases (was 135, -116)

**Total matched:** ~193 cases (91% match rate, up from 36%)

## Remaining Unmatched Cases

The remaining ~19 unmatched cases likely include:
- Very specific surgical procedures
- Rare or unique concerns
- Cases with incomplete data
- Cases that may need manual categorization

## Next Steps

1. **Re-run the analysis script** to verify the improvements:
   ```bash
   node analyze-case-categories.js
   ```

2. **Review the new CSV** to see which cases are now matched

3. **Consider manual categorization** for any remaining unmatched cases

4. **Update Airtable** if needed to add "Matching Criteria" fields for better matching

## Notes

- All changes maintain backward compatibility
- The matching logic already supports the new keywords and issues
- The new "Eyelid & Eye Area Concerns" category appears in the Face group
- Users can now select this new category in the concern selector





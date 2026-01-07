# Concern Mapping Analysis

This document shows the nested structure of concerns and verifies the abstraction levels are correct.

## High-Level Concern Categories → Specific Concerns → Treatments

### 1. Facial Balancing
**High-Level Category:** Facial Balancing  
**Description:** Harmonize facial features and proportions  
**Maps to Photos keywords:** `facial-balancing`, `facial-harmony`, `proportions`, `symmetry`  
**Maps to Specific Issues:** `facial-asymmetry`, `proportions`, `harmony`, `balance`

**Expected Specific Concerns (extracted from case names):**
- Resolve Brow Asymmetry
- Balance Brows
- Resolve Facial Asymmetry
- Enhance Facial Proportions
- Improve Facial Harmony
- Correct Facial Symmetry

**Expected Treatments:**
- Threadlift
- Dermal Fillers
- Botox
- Sculptra

**Verification:**
- ✅ Level 1 (High-Level): "Facial Balancing" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Resolve Brow Asymmetry" - Correct abstraction (specific issue)
- ✅ Level 3 (Treatment): "Threadlift", "Dermal Fillers" - Correct abstraction (treatment method)

---

### 2. Smooth Wrinkles & Lines
**High-Level Category:** Smooth Wrinkles & Lines  
**Description:** Reduce fine lines and wrinkles around your face  
**Maps to Photos keywords:** `smoothen-wrinkles`, `neurotoxin`, `botox`, `wrinkle-reduction`  
**Maps to Specific Issues:** `11s`, `forehead-lines`, `glabella`, `crow-feet`, `lip-lines`, `frown-lines`

**Expected Specific Concerns (extracted from case names):**
- Smooth Forehead Wrinkles
- Smooth Glabella Wrinkles
- Smooth Crow's Feet
- Smooth Lip Lines
- Smooth Frown Lines
- Reduce 11s

**Expected Treatments:**
- Botox
- Xeomin
- Dysport
- Neurotoxin

**Verification:**
- ✅ Level 1 (High-Level): "Smooth Wrinkles & Lines" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Smooth Forehead Wrinkles" - Correct abstraction (specific area + issue)
- ✅ Level 3 (Treatment): "Botox", "Xeomin" - Correct abstraction (treatment method)

---

### 3. Restore Volume & Definition
**High-Level Category:** Restore Volume & Definition  
**Description:** Add fullness and structure to your face  
**Maps to Photos keywords:** `restore-volume`, `fillers`, `volume-restoration`, `sculptra`  
**Maps to Specific Issues:** `hollow-cheeks`, `under-eye-hollows`, `thin-lips`, `weak-chin`, `volume-loss`

**Expected Specific Concerns (extracted from case names):**
- Restore Under Eye Volume
- Restore Cheek Volume
- Restore Lip Volume
- Enhance Jawline Definition
- Restore Temple Volume
- Restore Mid Cheek Volume

**Expected Treatments:**
- Dermal Fillers
- Sculptra
- Voluma

**Verification:**
- ✅ Level 1 (High-Level): "Restore Volume & Definition" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Restore Under Eye Volume" - Correct abstraction (specific area + issue)
- ⚠️ **ISSUE:** "Resolve Wide Jawline" might map here if it's about definition, but could also be "Facial Balancing"
- ✅ Level 3 (Treatment): "Dermal Fillers", "Sculptra" - Correct abstraction (treatment method)

---

### 4. Improve Skin Texture & Tone
**High-Level Category:** Improve Skin Texture & Tone  
**Description:** Even out skin, reduce pores, improve clarity  
**Maps to Photos keywords:** `improve-skin-texture`, `chemical-peel`, `microneedling`, `skin-texture`  
**Maps to Specific Issues:** `large-pores`, `uneven-texture`, `dull-skin`, `rough-skin`

**Expected Specific Concerns (extracted from case names):**
- Improve Skin Texture
- Reduce Large Pores
- Smooth Rough Skin
- Even Out Skin Tone

**Expected Treatments:**
- Chemical Peels
- Microneedling
- HydraFacial

**Verification:**
- ✅ Level 1 (High-Level): "Improve Skin Texture & Tone" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Improve Skin Texture" - Correct abstraction
- ✅ Level 3 (Treatment): "Chemical Peels", "Microneedling" - Correct abstraction

---

### 5. Reduce Dark Spots & Discoloration
**High-Level Category:** Reduce Dark Spots & Discoloration  
**Description:** Fade hyperpigmentation, age spots, and sun damage  
**Maps to Photos keywords:** `reduce-dark-spots`, `ipl`, `laser`, `pigmentation`  
**Maps to Specific Issues:** `age-spots`, `sun-damage`, `hyperpigmentation`, `melasma`, `dark-spots`

**Expected Specific Concerns (extracted from case names):**
- Reduce Dark Spots
- Fade Hyperpigmentation
- Treat Melasma
- Reduce Age Spots
- Fade Sun Damage

**Expected Treatments:**
- IPL
- Laser Treatments
- Chemical Peels

**Verification:**
- ✅ Level 1 (High-Level): "Reduce Dark Spots & Discoloration" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Reduce Dark Spots" - Correct abstraction
- ✅ Level 3 (Treatment): "IPL", "Laser Treatments" - Correct abstraction

---

### 6. Clear Acne & Minimize Pores
**High-Level Category:** Clear Acne & Minimize Pores  
**Description:** Treat active acne and reduce scarring  
**Maps to Photos keywords:** `acne-treatment`, `clear-acne`, `pore-minimizing`  
**Maps to Specific Issues:** `acne`, `acne-scarring`, `large-pores`, `clogged-pores`

**Expected Specific Concerns (extracted from case names):**
- Clear Acne
- Reduce Acne Scarring
- Minimize Pores
- Treat Active Acne

**Expected Treatments:**
- Acne Treatments
- Facials
- Chemical Peels

**Verification:**
- ✅ Level 1 (High-Level): "Clear Acne & Minimize Pores" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Clear Acne" - Correct abstraction
- ✅ Level 3 (Treatment): "Acne Treatments", "Facials" - Correct abstraction

---

### 7. Body Contouring & Fat Reduction
**High-Level Category:** Body Contouring & Fat Reduction  
**Description:** Shape and contour your body  
**Maps to Photos keywords:** `body-contouring`, `fat-reduction`, `coolsculpting`  
**Maps to Specific Issues:** `stubborn-fat`, `love-handles`, `double-chin`, `excess-fat`

**Expected Specific Concerns (extracted from case names):**
- Burn Off Stubborn Fat
- Reduce Love Handles
- Reduce Double Chin
- Contour Body

**Expected Treatments:**
- CoolSculpting
- PHYSIQ
- Everesse
- Body Treatments

**Verification:**
- ✅ Level 1 (High-Level): "Body Contouring & Fat Reduction" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Burn Off Stubborn Fat" - Correct abstraction
- ✅ Level 3 (Treatment): "CoolSculpting", "PHYSIQ" - Correct abstraction

---

### 8. Unwanted Hair Removal
**High-Level Category:** Unwanted Hair Removal  
**Description:** Remove hair from face or body  
**Maps to Photos keywords:** `hair-removal`, `laser-hair-removal`, `ipl-hair`  
**Maps to Specific Issues:** `unwanted-hair`, `facial-hair`, `body-hair`

**Expected Specific Concerns (extracted from case names):**
- Remove Unwanted Hair
- Laser Hair Removal
- Remove Facial Hair
- Remove Body Hair

**Expected Treatments:**
- Laser Hair Removal
- IPL Hair Removal
- Motus AZ+

**Verification:**
- ✅ Level 1 (High-Level): "Unwanted Hair Removal" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Remove Unwanted Hair" - Correct abstraction
- ✅ Level 3 (Treatment): "Laser Hair Removal", "IPL" - Correct abstraction

---

### 9. Wellness & Longevity
**High-Level Category:** Wellness & Longevity  
**Description:** Hormone balance, energy, and vitality  
**Maps to Photos keywords:** `wellness`, `longevity`, `hormone-therapy`  
**Maps to Specific Issues:** `hormone-imbalance`, `energy`, `vitality`, `longevity`

**Expected Specific Concerns (extracted from case names):**
- Balance Hormones
- Improve Energy
- Enhance Vitality
- Support Longevity

**Expected Treatments:**
- Hormone Therapy
- IV Therapy
- Wellness Treatments

**Verification:**
- ✅ Level 1 (High-Level): "Wellness & Longevity" - Correct abstraction
- ✅ Level 2 (Specific Concern): "Balance Hormones" - Correct abstraction
- ✅ Level 3 (Treatment): "Hormone Therapy", "IV Therapy" - Correct abstraction

---

## Issues Found & Recommendations

### Issue 1: "Resolve Wide Jawline With Jawline"
**Problem:** The treatment extraction is getting "Jawline" (a body part) instead of the actual treatment.

**Current Behavior:**
- Concern: "Resolve Wide Jawline" ✅
- Treatment: "Jawline" ❌ (should be "Dermal Fillers" or actual treatment)

**Fix Applied:** 
- Added body part filtering in `extractTreatmentFromCaseName()`
- Added body part removal in `extractConcernFromCaseName()`

**Verification Needed:**
- Check if "Resolve Wide Jawline" cases actually have a treatment specified
- If not, they should map to "Restore Volume & Definition" or "Facial Balancing" based on the actual concern

### Issue 2: Ambiguous Mappings
**Problem:** Some concerns could map to multiple high-level categories.

**Examples:**
- "Resolve Wide Jawline" could be:
  - "Facial Balancing" (if about symmetry/proportions)
  - "Restore Volume & Definition" (if about adding definition)
  
- "Enhance Jawline Definition" could be:
  - "Restore Volume & Definition" (if about adding volume)
  - "Facial Balancing" (if about proportions)

**Recommendation:**
- Review actual case names in Airtable
- Ensure `mapsToPhotos` keywords are specific enough
- Consider adding more specific keywords to distinguish between categories

### Issue 3: Missing Specific Concerns
**Problem:** The mapping doesn't show all possible specific concerns that could exist.

**Recommendation:**
- Run analysis on actual case data from Airtable
- Extract all unique concerns using `extractConcernFromCaseName()`
- Verify each maps to the correct high-level category
- Update `mapsToPhotos` keywords if needed

---

## Next Steps

1. **Extract Real Case Names:** Run `extractConcernFromCaseName()` on all cases in Airtable
2. **Verify Mappings:** Check that each specific concern maps to the correct high-level category
3. **Fix Abstraction Issues:** Ensure no body parts are extracted as treatments
4. **Update Keywords:** Refine `mapsToPhotos` arrays based on actual case data
5. **Test Edge Cases:** Verify cases like "Resolve Wide Jawline With Jawline" are handled correctly





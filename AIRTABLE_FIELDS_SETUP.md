# Airtable Fields Setup Guide

This document provides **exact field names, types, and options** for configuring your "Web Popup Leads" table in Airtable to prevent 422 errors.

## Required Fields (Always Sent)

| Field Name | Airtable Type | Format | Example | Notes |
|------------|---------------|--------|---------|-------|
| `Name` | Single line text | String | "John Doe" | Required |
| `Email Address` | Email | String | "john@example.com" | Required |
| `Phone Number` | Phone number | String | "(555) 123-4567" | Optional |
| `Source` | **Single select** | String | "Lead Capture Form" | **Options:** "Lead Capture Form", "Consultation Form" |
| `Providers` | Linked record | Array of record IDs | `["recN9Q4W02xtroD6g"]` | Links to Providers table |

## Single Select Fields

### Age Range
- **Field Name:** `Age Range`
- **Type:** Single select
- **Options (exact):**
  - `18-29`
  - `30-39`
  - `40-49`
  - `50-59`
  - `60+`

### Skin Type
- **Field Name:** `Skin Type`
- **Type:** Single select
- **Options (exact):**
  - `dry`
  - `balanced`
  - `oily`
  - `combination`
  - `not-sure`

### Skin Tone
- **Field Name:** `Skin Tone`
- **Type:** Single select
- **Options (exact):**
  - `light`
  - `fair`
  - `medium`
  - `tan`
  - `brown`
  - `deep`

### Ethnic Background
- **Field Name:** `Ethnic Background`
- **Type:** Single select
- **Options (exact):**
  - `asian`
  - `black`
  - `hispanic/latino`
  - `middle eastern`
  - `white`
  - `mixed`
  - `other`
  - `prefer-not-to-say`

### Engagement Level
- **Field Name:** `Engagement Level`
- **Type:** Single select
- **Options (exact):**
  - `Low`
  - `Medium`
  - `High`

## Multiple Select Fields

### Concerns
- **Field Name:** `Concerns`
- **Type:** Multiple select
- **Options (exact - case-sensitive, must match exactly):**
  1. `Facial Asymmetry`
  2. `Facial Structure`
  3. `Skin Texture`
  4. `Fine Lines & Wrinkles` (note: includes ampersand `&`)
  5. `Skin Laxity`
  6. `Volume Loss`
  7. `Pigmentation`
  8. `Excess Fat`

**Important:** These exact strings (with exact capitalization and punctuation) must be added as options in your Airtable multiple select field.

### Areas
- **Field Name:** `Areas`
- **Type:** Multiple select
- **Options (exact - case-sensitive, must match exactly):**
  1. `Forehead`
  2. `Eyes`
  3. `Cheeks`
  4. `Nose`
  5. `Lips`
  6. `Jawline`
  7. `Chin`
  8. `Neck`
  9. `Chest`
  10. `Hands`
  11. `Arms`
  12. `Body`

**Important:** These exact strings (with exact capitalization and punctuation) must be added as options in your Airtable multiple select field.

### Concerns Explored
- **Field Name:** `Concerns Explored`
- **Type:** Multiple select
- **Options (exact - same as Concerns):**
  - `Facial Asymmetry`
  - `Facial Structure`
  - `Skin Texture`
  - `Fine Lines & Wrinkles`
  - `Skin Laxity`
  - `Volume Loss`
  - `Pigmentation`
  - `Excess Fat`

## Linked Record Fields

### Viewed Photos
- **Field Name:** `Viewed Photos`
- **Type:** Linked record (multiple)
- **Links to:** Photos table
- **Format:** Array of record IDs from the Photos table
- **Example:** `["recABC123", "recDEF456"]`

### Providers
- **Field Name:** `Providers`
- **Type:** Linked record (multiple)
- **Links to:** Providers table
- **Record IDs:**
  - Unique Aesthetics: `recN9Q4W02xtroD6g`
  - Lakeshore: `rec3oXyrb1t6YUvoe`

## Text Fields

| Field Name | Type | Format | Notes |
|------------|------|--------|-------|
| `Aesthetic Goals` | Long text | String | Free-form text from consultation form |
| `Cases Viewed` | Long text | Comma-separated string | Legacy field - kept for backwards compatibility (deprecated in favor of Viewed Photos) |

## Number Fields

| Field Name | Type | Format | Notes |
|------------|------|--------|-------|
| `Cases Viewed Count` | Number | Integer | Count of photos viewed |
| `Total Cases Available` | Number | Integer | Total matching cases available |

## Complete Field List Summary

### Text Fields
- `Name` (Single line text)
- `Email Address` (Email)
- `Phone Number` (Phone number)
- `Aesthetic Goals` (Long text)
- `Cases Viewed` (Long text - deprecated)

### Single Select Fields
- `Age Range` (options: 18-29, 30-39, 40-49, 50-59, 60+)
- `Skin Type` (options: dry, balanced, oily, combination, not-sure)
- `Skin Tone` (options: light, fair, medium, tan, brown, deep)
- `Ethnic Background` (options: asian, black, hispanic/latino, middle eastern, white, mixed, other, prefer-not-to-say)
- `Source` (options: Lead Capture Form, Consultation Form)
- `Engagement Level` (options: Low, Medium, High)

### Multiple Select Fields
- `Concerns` (8 options - see list above)
- `Areas` (12 options - see list above)
- `Concerns Explored` (8 options - same as Concerns)

### Linked Record Fields
- `Viewed Photos` (links to Photos table - multiple)
- `Providers` (links to Providers table - multiple)

### Number Fields
- `Cases Viewed Count` (Integer)
- `Total Cases Available` (Integer)

## Important Notes

1. **Field names are case-sensitive** - must match exactly including spaces and punctuation
2. **Select field options must match exactly** - including capitalization and special characters
3. **Viewed Photos** uses record IDs from your Photos table - these are automatically extracted from the case data
4. **Providers** record IDs are hardcoded - make sure these exist in your Providers table

## Example Payload

```json
{
  "fields": {
    "Name": "John Doe",
    "Email Address": "john@example.com",
    "Phone Number": "(555) 123-4567",
    "Source": "Lead Capture Form",
    "Providers": ["recN9Q4W02xtroD6g"],
    "Age Range": "30-39",
    "Skin Type": "oily",
    "Skin Tone": "medium",
    "Ethnic Background": "white",
    "Concerns": ["Volume Loss", "Fine Lines & Wrinkles", "Skin Laxity"],
    "Areas": ["Face", "Neck"],
    "Viewed Photos": ["recABC123", "recDEF456", "recGHI789"],
    "Cases Viewed Count": 3,
    "Concerns Explored": ["Volume Loss", "Skin Laxity"],
    "Engagement Level": "Low",
    "Total Cases Available": 25
  }
}
```

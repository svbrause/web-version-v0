# Airtable Fields Reference

This document lists all fields being sent to the "Web Popup Leads" table in Airtable, along with their expected types and formats.

## Required Fields (Always Sent)

| Field Name | Type | Format | Example | Notes |
|------------|------|--------|---------|-------|
| `Name` | Single line text | String | "John Doe" | Required - from lead capture form |
| `Email Address` | Email | String | "john@example.com" | Required - from lead capture form |
| `Phone Number` | Phone number | String | "(555) 123-4567" | Optional - from lead capture form (formatted) |
| `Source` | Single select | String | "Lead Capture Form" or "Consultation Form" | Always included | **Single select** (options: "Lead Capture Form", "Consultation Form") |
| `Providers` | Linked record | Array of record IDs | `["recN9Q4W02xtroD6g"]` | Always included - Unique Aesthetics: `["recN9Q4W02xtroD6g"]`, Lakeshore: `["rec3oXyrb1t6YUvoe"]` |

## Conditional Fields (Sent if Available)

### Demographics

| Field Name | Type | Format | Example | When Sent | Recommended Airtable Type |
|------------|------|--------|---------|-----------|---------------------------|
| `Age Range` | Single select | String | "30-39", "60+" | If user selected an age range | **Single select** (options: "18-29", "30-39", "40-49", "50-59", "60+") |
| `Skin Type` | Single select | String | "oily", "dry", "balanced", "combination", "not-sure" | If user selected a skin type | **Single select** (options: "dry", "balanced", "oily", "combination", "not-sure") |
| `Skin Tone` | Single select | String | "light", "fair", "medium", "tan", "brown", "deep" | If user selected a skin tone | **Single select** (options: "light", "fair", "medium", "tan", "brown", "deep") |
| `Ethnic Background` | Single select | String | "asian", "black", "hispanic/latino", etc. | If user selected an ethnic background | **Single select** (options: "asian", "black", "hispanic/latino", "middle eastern", "white", "mixed", "other", "prefer-not-to-say") |

### Selections

| Field Name | Type | Format | Example | When Sent |
|------------|------|--------|---------|-----------|
| `Concerns` | **Multiple select** | Array of strings | `["Volume Loss", "Fine Lines & Wrinkles", "Skin Laxity"]` | If user selected any concerns (up to 3) - **Send as array** |
| `Areas` | **Multiple select** | Array of strings | `["Forehead", "Neck", "Eyes"]` | If user selected any areas (up to 3) - **Send as array** |
| `Aesthetic Goals` | Long text | String | "I want to reduce fine lines..." | If user provided a message (consultation form only) |

### Behavioral Data

| Field Name | Type | Format | Example | When Sent |
|------------|------|--------|---------|-----------|
| `Cases Viewed` | Long text | Comma-separated list of case names | "Case 1, Case 2, Case 3" | If user viewed any cases |
| `Cases Viewed Count` | Number | Integer | `5` | If user viewed any cases |
| `Concerns Explored` | Single line text | Comma-separated list | "Volume Loss, Skin Laxity" | If user clicked into any concern pages |
| `Engagement Level` | Single select | String | "Low", "Medium", "High" | If user viewed any cases (calculated: <5=Low, 5-9=Medium, 10+=High) | **Single select** (options: "Low", "Medium", "High") |
| `Total Cases Available` | Number | Integer | `25` | If user selected concerns and case data is available (counts unique matching cases) |

## Field Type Requirements in Airtable

### Text Fields (Single line text / Long text)
- **Name**: Single line text
- **Email Address**: Email field type (or single line text)
- **Phone Number**: Phone number field type (or single line text)
- **Concerns**: Single line text (comma-separated values) - *Could be converted to Multiple select*
- **Areas**: Single line text (comma-separated values) - *Could be converted to Multiple select*
- **Concerns Explored**: Single line text (comma-separated values) - *Could be converted to Multiple select*
- **Aesthetic Goals**: Long text
- **Cases Viewed**: Long text (comma-separated values)

### Number Fields
- **Cases Viewed Count**: Number (integer)
- **Total Cases Available**: Number (integer)

### Single Select Fields (Recommended)
- **Age Range**: Single select with options: "18-29", "30-39", "40-49", "50-59", "60+"
- **Skin Type**: Single select with options: "dry", "balanced", "oily", "combination", "not-sure"
- **Skin Tone**: Single select with options: "light", "fair", "medium", "tan", "brown", "deep"
- **Ethnic Background**: Single select with options: "asian", "black", "hispanic/latino", "middle eastern", "white", "mixed", "other", "prefer-not-to-say"
- **Source**: Single select with options: "Lead Capture Form", "Consultation Form"
- **Engagement Level**: Single select with options: "Low", "Medium", "High"

### Linked Record Fields
- **Providers**: Linked record field that links to a "Providers" table
  - Unique Aesthetics record ID: `recN9Q4W02xtroD6g`
  - Lakeshore record ID: `rec3oXyrb1t6YUvoe`

## Important Notes

1. **Field Names Must Match Exactly**: Field names are case-sensitive and must match exactly, including spaces and punctuation.

2. **Providers Field**: This is a linked record field. The record IDs are hardcoded:
   - Unique Aesthetics: `recN9Q4W02xtroD6g`
   - Lakeshore: `rec3oXyrb1t6YUvoe`
   - Make sure these record IDs exist in your Providers table

3. **Comma-Separated Lists**: Fields like `Concerns`, `Areas`, `Cases Viewed`, and `Concerns Explored` are sent as comma-separated strings. If you want to use Airtable's multiple select or linked records instead, the code would need to be modified.

4. **Optional Fields**: All fields except `Name`, `Email Address`, `Source`, and `Providers` are optional and will only be included if the user has provided that data.

5. **Phone Number Format**: Phone numbers are formatted as `(XXX) XXX-XXXX` before being sent.

## Example Payload

Here's an example of what gets sent to Airtable:

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
    "Concerns": "Volume Loss, Fine Lines & Wrinkles, Skin Laxity",
    "Areas": "Face, Neck",
    "Cases Viewed": "Case 1, Case 2, Case 3",
    "Cases Viewed Count": 3,
    "Concerns Explored": "Volume Loss, Skin Laxity",
    "Engagement Level": "Low",
    "Total Cases Available": 25
  }
}
```

## Troubleshooting

If fields are not appearing in Airtable:

1. **Check Field Names**: Open browser console and look for "📤 Submitting lead to Airtable:" - verify field names match exactly
2. **Check Field Types**: Ensure field types in Airtable match the types listed above
3. **Check Providers Table**: Verify the Provider record IDs exist in your Providers table
4. **Check Console Errors**: Look for "❌ Airtable API Error Response" - this will show specific field errors

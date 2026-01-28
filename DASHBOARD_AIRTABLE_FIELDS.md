# Dashboard Airtable Fields Reference

This document lists all fields that the dashboard **writes to** in Airtable, with exact field types, options, and spelling.

## Fields Updated by Dashboard Actions

The dashboard currently **only writes to Airtable** when updating lead status. All other edits (name, email, phone, etc.) are stored locally only and do not sync to Airtable.

---

## 1. Status Field

**Field Name:** `Status` (exact spelling, case-sensitive)

**Field Type:** Single select

**Selectable Options (exact spelling and capitalization):**
- `New`
- `Contacted`
- `Scheduled`
- `Converted`

**When Updated:**
- When user changes status via dropdown in table view
- When user changes status via dropdown in lead detail modal
- When user drags a lead card to a different column in kanban view

**Code Reference:**
```javascript
fields["Status"] = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
// Converts: "new" → "New", "contacted" → "Contacted", etc.
```

**Important:** The dashboard sends capitalized values. Make sure your Airtable single select options match exactly:
- ✅ `New` (correct)
- ❌ `new` (wrong - lowercase)
- ❌ `NEW` (wrong - all caps)
- ❌ `New Lead` (wrong - extra text)

---

## 2. Contacted Field

**Field Name:** `Contacted` (exact spelling, case-sensitive)

**Field Type:** Checkbox

**Values:**
- `true` (checked) - when status is "Contacted", "Scheduled", or "Converted"
- `false` (unchecked) - when status is "New"

**When Updated:**
- Automatically updated whenever Status is changed
- Used for backward compatibility with older records

**Code Reference:**
```javascript
if (newStatus === "contacted" || newStatus === "scheduled" || newStatus === "converted") {
  fields["Contacted"] = true;
} else {
  fields["Contacted"] = false;
}
```

**Important:** This is a checkbox field, not a single select. It should be a boolean (true/false) field type in Airtable.

---

## Fields Read (Not Written) by Dashboard

The dashboard **reads** these fields but does **not write** to them. They should exist in your Airtable tables for the dashboard to display data correctly:

### Required for Display

| Field Name | Type | Notes |
|------------|------|-------|
| `Name` | Single line text | Required - used for lead name |
| `Email Address` | Email or Single line text | Used for contact info |
| `Phone Number` | Phone number or Single line text | Used for contact info |
| `Providers` | Linked record | Used for filtering by provider |

### Optional for Display

| Field Name | Type | Notes |
|------------|------|-------|
| `Age` | Number | Patient age |
| `Goals` | Multiple select or Array | Aesthetic goals |
| `Concerns` | Single line text or Multiple select | Patient concerns |
| `Aesthetic Goals` | Long text | Patient's stated goals |
| `Liked Photos` | Multiple select or Array | Counted for engagement |
| `Viewed Photos` | Multiple select or Array | Counted for engagement |
| `Source` | Single select | Lead source |
| `Contact Notes` | Long text | Internal notes |
| `Appointment Date` | Date | Scheduled appointment |
| `Treatment Received` | Single line text | For converted leads |
| `Revenue` | Number | For converted leads |
| `Last Contact` | Date | Last contact date |

---

## Airtable Table Setup

### For "Web Popup Leads" Table

**Required Fields:**
1. **Status** - Single select
   - Options: `New`, `Contacted`, `Scheduled`, `Converted`
2. **Contacted** - Checkbox
   - Default: unchecked

**Recommended Fields (for full functionality):**
- `Name` (Single line text)
- `Email Address` (Email)
- `Phone Number` (Phone number)
- `Providers` (Linked record to Providers table)
- `Age` (Number)
- `Goals` (Multiple select)
- `Concerns` (Single line text or Multiple select)
- `Aesthetic Goals` (Long text)
- `Source` (Single select)
- `Contact Notes` (Long text)

### For "Patients" Table

**Required Fields:**
1. **Status** - Single select
   - Options: `New`, `Contacted`, `Scheduled`, `Converted`
2. **Contacted** - Checkbox
   - Default: unchecked

**Note:** The dashboard also reads from the "Patients" table. Field names may differ:
- `Name` or `Patient Name`
- `Email Address` or `Email`
- `Phone Number` or `Phone`

---

## Field Name Variations

The dashboard handles different field names between tables:

### Web Popup Leads Table
- `Email Address`
- `Phone Number`
- `Name`

### Patients Table
- `Email` or `Email Address`
- `Phone` or `Phone Number`
- `Patient Name` or `Name`

---

## Testing Checklist

To verify your Airtable setup is correct:

1. **Status Field:**
   - [ ] Field name is exactly `Status` (case-sensitive)
   - [ ] Field type is Single select
   - [ ] Options are exactly: `New`, `Contacted`, `Scheduled`, `Converted` (capitalized)
   - [ ] Test: Change status in dashboard → Check Airtable updates

2. **Contacted Field:**
   - [ ] Field name is exactly `Contacted` (case-sensitive)
   - [ ] Field type is Checkbox
   - [ ] Test: Change status to "Contacted" → Checkbox should be checked
   - [ ] Test: Change status to "New" → Checkbox should be unchecked

3. **Provider Filtering:**
   - [ ] `Providers` field exists (Linked record)
   - [ ] Provider record IDs exist:
     - Lakeshore: `rec3oXyrb1t6YUvoe`
     - Unique Aesthetics: `recN9Q4W02xtroD6g`
   - [ ] Test: Only leads with correct provider appear in dashboard

---

## Common Issues

### Status Updates Not Working

**Problem:** Status changes in dashboard don't appear in Airtable

**Solutions:**
1. Check field name is exactly `Status` (not `status` or `STATUS`)
2. Verify field type is Single select (not text)
3. Verify options match exactly: `New`, `Contacted`, `Scheduled`, `Converted`
4. Check browser console for API errors
5. Verify API key has write permissions

### Wrong Status Values

**Problem:** Status shows as text instead of select option

**Solution:** Make sure Status field is Single select type, not Single line text

### Contacted Checkbox Not Updating

**Problem:** Contacted checkbox doesn't change when status changes

**Solutions:**
1. Check field name is exactly `Contacted` (case-sensitive)
2. Verify field type is Checkbox (not Single select)
3. Check browser console for errors

---

## Summary

**Fields Written by Dashboard:**
- ✅ `Status` (Single select: `New`, `Contacted`, `Scheduled`, `Converted`)
- ✅ `Contacted` (Checkbox: true/false)

**Fields Read by Dashboard (not written):**
- `Name`, `Email Address`, `Phone Number`, `Providers`, `Age`, `Goals`, `Concerns`, `Aesthetic Goals`, `Source`, `Contact Notes`, `Appointment Date`, `Treatment Received`, `Revenue`, `Last Contact`, `Liked Photos`, `Viewed Photos`

**Important Notes:**
- Field names are **case-sensitive** - must match exactly
- Status options must be **capitalized** exactly as shown
- Contacted must be a **Checkbox** field type
- Dashboard works with both "Web Popup Leads" and "Patients" tables

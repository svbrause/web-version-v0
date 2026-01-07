# Web Popup Leads - Airtable Setup Guide

This guide explains how to configure the "Web Popup Leads" table in Airtable to capture user data from the app.

## Required Fields

| Field Name          | Field Type                      | Description                                                  |
| ------------------- | ------------------------------- | ------------------------------------------------------------ |
| **Name**            | Single line text                | User's full name from the form                               |
| **Email Address**   | Email                           | User's email address                                         |
| **Phone Number**    | Phone number                    | User's phone number                                          |
| **Age**             | Number                          | User's age from the onboarding flow                          |
| **Goals**           | Multiple select                 | User's selected aesthetic goals                              |
| **Concerns**        | Long text                       | Comma-separated list of concerns the user showed interest in |
| **Aesthetic Goals** | Long text                       | Free-form text from the consultation form                    |
| **Liked Photos**    | Link to another record (Photos) | Cases the user added to their goals                          |
| **Viewed Photos**   | Link to another record (Photos) | Cases the user viewed (optional)                             |
| **Source**          | Single select                   | Where the lead came from                                     |

## Field Configuration Details

### Goals (Multiple Select)

Create these options (must match exactly):

- Facial Balancing
- Anti-Aging
- Skin Rejuvenation
- Natural Look

The app sends all selected goals as an array to this Multiple Select field.

### Source (Single Select)

Create these options:

- Consultation Form
- Info Request Form

### Liked Photos (Link to Photos)

1. Click "Add field" → "Link to another record"
2. Select the "Photos" table
3. Name it "Liked Photos"
4. Choose "Allow linking to multiple records"

### Viewed Photos (Link to Photos) - Optional

Same setup as Liked Photos, but named "Viewed Photos"

## Data Being Captured

When a user submits a consultation or info request form, the app sends:

1. **From the form:**

   - Name
   - Email Address
   - Phone Number
   - Message (stored in "Aesthetic Goals")

2. **From the user's session:**

   - Age (from onboarding)
   - Goals (from onboarding - e.g., "Anti-Aging", "Facial Balancing")
   - Concerns (issues they selected or added to goals)
   - Liked Photos (case record IDs they added to goals)
   - Viewed Photos (case record IDs they viewed)

3. **Automatically:**
   - Source (which form they used)

## Example Record

```
Name: Jane Smith
Email Address: jane@example.com
Phone Number: (555) 123-4567
Age: 42
Goals: Anti-Aging, Skin Rejuvenation
Concerns: Under Eye Wrinkles, Forehead Wrinkles, Dark Spots
Aesthetic Goals: I'm interested in reducing fine lines around my eyes and improving my skin texture.
Liked Photos: [rec123, rec456] (linked to Photos records)
Viewed Photos: [rec789, rec012] (linked to Photos records)
Source: Consultation Form
```

## Troubleshooting

### 422 Error when submitting form

A 422 error means Airtable is rejecting the data. Common causes:

1. **Field doesn't exist** - Check that all these fields exist in your table:

   - `Name` (Single line text)
   - `Email Address` (Email)
   - `Phone Number` (Phone)
   - `Age` (Number)
   - `Goals` (Multiple select - see below)
   - `Aesthetic Goals` (Long text)
   - `Concerns` (Long text)
   - `Liked Photos` (Link to Photos table)

2. **Goals field options don't match** - The Goals multiple select must have these EXACT options:

   - Facial Balancing
   - Anti-Aging
   - Skin Rejuvenation
   - Natural Look

3. **Linked Photos field not configured** - "Liked Photos" must be:
   - Type: "Link to another record"
   - Linked to: "Photos" table
   - Allow linking to multiple records: Yes

### Quick Fix for 422 Errors

If you're getting 422 errors and want to quickly fix it:

1. Open `app.js` and find the `submitLeadToAirtable` function
2. Comment out any fields that don't exist in your Airtable table:
   ```javascript
   // Comment out these lines if the field doesn't exist:
   // fields["Goals"] = goalsForAirtable;
   // fields["Concerns"] = allConcerns.join(", ");
   // fields["Liked Photos"] = goalCases;
   ```

### "Field not found" errors

If you see errors in the browser console about fields not being found:

1. Make sure field names match exactly (case-sensitive)
2. Check that linked fields are properly configured to link to "Photos" table

### Linked records not working

Make sure:

1. The "Liked Photos" field is a "Link to another record" type
2. It's linked to the "Photos" table
3. "Allow linking to multiple records" is enabled

### Goals not saving

If Goals appear as text instead of selections:

1. Verify the field is "Multiple select" type
2. Add all four options exactly as shown: Facial Balancing, Anti-Aging, Skin Rejuvenation, Natural Look










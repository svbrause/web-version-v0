# Contact History Table Setup Guide

## Overview

Contact history is now stored in a separate **"Contact History"** table in Airtable, which provides better querying, scalability, and reporting capabilities compared to storing JSON in a field.

## Airtable Table Setup

### Create "Contact History" Table

Create a new table called **"Contact History"** with the following fields:

#### Primary Field (First Field - Auto-Generated Name):

**Name** (Formula Field)
- Field Type: Formula
- Formula:
  ```
  IF(
    {Web Popup Lead},
    {Web Popup Lead} & " - " & {Contact Type} & " (" & DATETIME_FORMAT({Date}, "M/D/YY h:mm A") & ")",
    IF(
      {Patient},
      {Patient} & " - " & {Contact Type} & " (" & DATETIME_FORMAT({Date}, "M/D/YY h:mm A") & ")",
      "Contact Entry"
    )
  )
  ```
- Description: Auto-generates a descriptive name like "Sarah Mitchell - Phone Call (1/15/25 2:30 PM)"

**Alternative Simpler Formula** (if the above is too complex):
```
IF(
  {Web Popup Lead},
  {Web Popup Lead} & " - " & {Contact Type},
  IF({Patient}, {Patient} & " - " & {Contact Type}, "Contact Entry")
) & " - " & DATETIME_FORMAT({Date}, "M/D/YY")
```

#### Required Fields:

1. **Web Popup Lead** (Linked Record)
   - Field Type: Linked record
   - Table: "Web Popup Leads"
   - Options: Allow linking to multiple records: **No**
   - Description: Links to a lead from the Web Popup Leads table

2. **Patient** (Linked Record)
   - Field Type: Linked record
   - Table: "Patients"
   - Options: Allow linking to multiple records: **No**
   - Description: Links to a patient from the Patients table

   **Note:** Each contact history entry will link to EITHER a Web Popup Lead OR a Patient, not both.

3. **Contact Type** (Single Select)
   - Field Type: Single select
   - Options:
     - `Phone Call`
     - `Email`
     - `Text Message`
     - `In-Person`

4. **Outcome** (Single Select)
   - Field Type: Single select
   - Options:
     - `Reached`
     - `Left Voicemail`
     - `No Answer`
     - `Scheduled Appointment`

5. **Notes** (Long Text)
   - Field Type: Long text
   - Description: Free-form notes about the contact

6. **Date** (Date)
   - Field Type: Date
   - Options: Include time: **Yes**
   - Description: When the contact occurred

### Optional Fields (for future enhancements):

- **Contacted By** (Single Select) - Who made the contact
- **Duration** (Number) - Length of call/meeting in minutes
- **Follow-up Date** (Date) - When to follow up next
- **Tags** (Multiple Selects) - Custom tags for categorization

## How It Works

### Loading Contact History

1. When leads are loaded from "Web Popup Leads" or "Patients" tables, the dashboard automatically fetches all related contact history entries
2. Contact history is fetched in parallel for all leads for optimal performance
3. History entries are sorted by date (most recent first)

### Saving Contact History

1. When a user adds a contact log entry, a new record is created in the "Contact History" table
2. The record links to the appropriate lead/patient using either:
   - "Web Popup Lead" field (if from Web Popup Leads table)
   - "Patient" field (if from Patients table)
3. The main lead/patient record is also updated with:
   - "Last Contact" date
   - "Status" (if changed to "Contacted" or "Scheduled")
   - "Contacted" checkbox (if applicable)

## Benefits of This Approach

✅ **Queryable**: Can filter, sort, and search individual contact entries  
✅ **Scalable**: No JSON size limits  
✅ **Reportable**: Easy to create analytics on contact patterns  
✅ **Extensible**: Can add more fields per entry (who contacted, duration, etc.)  
✅ **Relational**: Proper one-to-many database design  
✅ **Performance**: Parallel fetching for fast loading

## Migration from JSON Field

If you previously had contact history stored as JSON in a "Contact History" field:

1. The old JSON field is no longer used
2. You can safely remove it from your tables (or keep it for historical reference)
3. New contact entries will only be created in the separate table
4. Existing JSON data will not be automatically migrated (would require a one-time script if needed)

## Testing

After setting up the table:

1. Open a lead/patient in the dashboard
2. Click "+ Add Entry" in the Contact History section
3. Fill in the contact details and save
4. Verify the entry appears in both:
   - The dashboard's contact history display
   - The Airtable "Contact History" table
5. Refresh the page to ensure it loads from Airtable correctly

# Consultation Form Airtable Integration

## Overview

The consultation form (`ConsultationModal.tsx`) submits user data to Airtable's **"Web Popup Leads"** table. This document explains how the integration works and what data is sent.

## Data Flow

### 1. Form Submission
When a user submits the consultation form:
- Form fields are validated (name, email, phone are required)
- User data is saved to `localStorage` via `saveUserData()`
- Analytics event is tracked via `trackEvent('consultation_submitted')`
- Data is submitted to Airtable via `submitLeadToAirtable()`

### 2. Airtable Submission
The `submitLeadToAirtable()` function (in `src/utils/airtableLeads.ts`) performs the following:

#### A. Collects Form Data
- **Name**: Full name from form
- **Email Address**: Email from form
- **Phone Number**: Phone from form (formatted as (XXX) XXX-XXXX)
- **Aesthetic Goals**: Optional message/notes from form
- **Source**: Set to `"Consultation Form"` to identify where the lead came from

#### B. Collects User State Data
From the app's global state (`AppState`), it includes:
- **Age Range**: User's selected age range (e.g., "30-39", "60+")
- **Concerns**: Array of selected high-level concerns (e.g., ["Fine Lines & Wrinkles", "Acne"])
- **Areas**: Array of selected body areas (e.g., ["Face", "Neck"])
- **Skin Type**: User's selected skin type
- **Skin Tone**: User's selected skin tone
- **Ethnic Background**: User's selected ethnic background

#### C. Collects Behavioral Data
From `localStorage`:
- **Viewed Photos**: Array of Airtable record IDs for cases the user viewed
- **Cases Viewed Count**: Number of cases viewed
- **Concerns Explored**: Array of concerns the user clicked into (different from selected concerns)
- **Engagement Level**: Calculated as "High" (10+ cases), "Medium" (5-9 cases), or "Low" (<5 cases)
- **Total Cases Available**: Count of unique cases matching their selections

#### D. Links to Provider
Automatically links the lead to the appropriate provider:
- **Lakeshore**: Links to record ID `rec3oXyrb1t6YUvoe`
- **Unique Aesthetics**: Links to record ID `recN9Q4W02xtroD6g`

The provider is determined by the `practice` value from `getPracticeFromConfig()`, which checks:
1. URL parameter (`?practice=lakeshore`)
2. Environment variable (`VITE_PRACTICE_NAME`)
3. Window variable
4. Defaults to 'unique'

### 3. Airtable API Call
- **Endpoint**: `https://api.airtable.com/v0/{BASE_ID}/Web Popup Leads`
- **Method**: POST
- **Headers**: 
  - `Authorization: Bearer {API_KEY}`
  - `Content-Type: application/json`
- **Body**: Single record with all fields

### 4. Response Handling
- If successful: Stores the Airtable record ID in `localStorage` for future behavioral data syncs
- If failed: Logs error but continues (doesn't block user experience)
- Shows confirmation screen to user regardless of Airtable success/failure

## Airtable Table Structure

### Table Name
**"Web Popup Leads"**

### Field Types
- **Name**: Single line text
- **Email Address**: Email
- **Phone Number**: Phone number
- **Aesthetic Goals**: Long text
- **Source**: Single select
- **Age Range**: Single select
- **Concerns**: Multiple select
- **Areas**: Multiple select
- **Skin Type**: Single select
- **Skin Tone**: Single select
- **Ethnic Background**: Single select
- **Viewed Photos**: Linked records (to Cases table)
- **Cases Viewed Count**: Number
- **Concerns Explored**: Multiple select
- **Engagement Level**: Single select ("High", "Medium", "Low")
- **Total Cases Available**: Number
- **Providers**: Linked records (to Providers table)

## Behavioral Data Sync

After the initial lead submission, additional behavioral data (viewed photos, explored concerns) can be synced to the same Airtable record using the stored record ID. This is handled by `airtableSync.ts`:

- Uses debouncing to batch updates efficiently
- Syncs on page visibility change and before unload
- Updates the same record via PATCH request

## Configuration

### Environment Variables
The integration uses these environment variables (or window variables as fallback):
- `VITE_AIRTABLE_API_KEY`: Your Airtable API key
- `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID

### Setup
1. Get API key from: https://airtable.com/api
2. Get Base ID from your Airtable base URL (the `appXXXXXXXXXXXXXX` part)
3. Set in `.env` file or `index.html` (see `ENV_SETUP.md` for details)

## Error Handling

- **Missing Configuration**: Logs helpful error messages to console
- **API Failure**: Logs error but doesn't block user (shows confirmation anyway)
- **Network Issues**: Handled gracefully, user still sees success message

## Testing

To test the integration:
1. Fill out the consultation form
2. Submit and check browser console for logs
3. Verify record appears in Airtable "Web Popup Leads" table
4. Check that all fields are populated correctly
5. Verify provider link is correct based on practice setting

## Notes

- The form submission is **non-blocking** - users always see a success message even if Airtable submission fails
- The confirmation screen shows the practice name (Lakeshore or Unique Aesthetics)
- All form fields are validated client-side before submission
- Phone numbers are automatically formatted as (XXX) XXX-XXXX

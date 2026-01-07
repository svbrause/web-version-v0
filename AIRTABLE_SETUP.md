# Airtable Setup Guide

This app connects to your Airtable "Photos" table to fetch case data. The app will automatically map Airtable fields to the case structure.

## Required Airtable Fields

The app looks for the following fields in your "Photos" table (it will try multiple field name variations):

### Essential Fields:
- **Name** - The treatment/case name (required)
- **Before After** or **Image** or **Before/After** - Attachment field with before/after photos
- **Thumbnail** (optional) - Separate thumbnail image, falls back to main image

### Patient Information:
- **Age** or **Patient Age** - Patient's age (used for age-based filtering)
- **Patient Name** (optional) - Patient name, falls back to Name field

### Content Fields:
- **Headline** or **Title** - Case headline
- **Story** or **Description** - Patient story/description
- **Treatment** or **Treatment Details** - Treatment information
- **Solved** or **Issues Solved** - Comma-separated list of issues solved
- **Matching Criteria** or **Criteria** or **Tags** - Comma-separated list of matching criteria (should match form values like "anti-aging", "under-eye-rejuvenation", etc.)

## Field Name Examples

The app will try these field names in order:

- Images: `Before After`, `Image`, `Before/After`
- Age: `Age`, `Patient Age`
- Headline: `Headline`, `Title`
- Story: `Story`, `Description`
- Treatment: `Treatment`, `Treatment Details`, `Description`
- Solved: `Solved`, `Issues Solved`
- Criteria: `Matching Criteria`, `Criteria`, `Tags`

## Matching Criteria Format

The matching criteria should use lowercase with hyphens to match form values:
- `anti-aging`
- `facial-balancing`
- `skin-rejuvenation`
- `natural-look`
- `under-eye-rejuvenation`
- `crow-feet`
- `eyelid-lift`
- `improve-definition`
- `reduce-sagging`
- `forehead-wrinkles`
- `brow-lift`
- `even-skin-tone`
- `reduce-spots`
- `smooth-texture`

## Age-Based Filtering

The app filters cases based on the user's age:
- Cases within ±15 years of the user's age are prioritized
- The "Common for your age" percentage is calculated based on age difference:
  - Same age: 85%
  - Within 2 years: 82%
  - Within 5 years: 78%
  - Within 10 years: 72%
  - Within 15 years: 68%
  - Beyond 15 years: 65%

## Current Configuration

- **API Key**: Configured in `app.js`
- **Base ID**: `appXblSpAMBQskgzB`
- **Table Name**: `Photos`
- **View**: `Grid view`

## Troubleshooting

If cases aren't loading from Airtable:
1. Check browser console for errors
2. Verify API key has access to the base
3. Verify table name is "Photos" (case-sensitive)
4. Verify view name is "Grid view"
5. The app will fall back to sample data if Airtable fails















# Collaborative Story Generation Guide

This guide explains how to use the story generation tool to create "Story Title" and "Story Detailed" content for cases in Airtable.

## Overview

The `generate-stories.js` script helps you:
1. **Fetch all cases** from your Airtable "Photos" table
2. **Generate story content** for cases that don't have it yet
3. **Output results** in multiple formats for easy review and import

## How It Works

The script:
- Connects to your Airtable base using the API
- Fetches all records (with pagination)
- For each case, checks if "Story Title" and "Story Detailed" already exist
- Generates content based on:
  - Case name
  - Treatment type
  - Issues addressed
  - Solved concerns
- Outputs results in CSV, JSON, and Markdown formats

## Usage

### Step 1: Run the Script

```bash
node generate-stories.js
```

### Step 2: Review Generated Content

The script creates two files:
- **`generated-stories.json`** - Machine-readable format with all data
- **`generated-stories.md`** - Human-readable format for easy review

### Step 3: Review and Refine

1. Open `generated-stories.md` to review all generated stories
2. Edit any stories that need refinement
3. Make them more specific, personal, or compelling

### Step 4: Import to Airtable

You have two options:

#### Option A: Manual Copy-Paste (Recommended for Review)
1. Open `generated-stories.md`
2. For each case, copy the "Story Title" and "Story Detailed"
3. Paste into Airtable manually
4. Review and refine as you go

#### Option B: Bulk Import (After Review)
1. Use the CSV format from the console output
2. Or use Airtable's import feature with the JSON file
3. Map "Story Title" and "Story Detailed" columns

## Generated Content Format

### Story Title
- Based on case name pattern (e.g., "Resolve [Issue] with [Treatment]")
- Or generated as: "Transform [Issue] with [Treatment]"
- Should be compelling and specific

### Story Detailed
A 3-4 sentence story that includes:
1. **Patient concern** - What they came in for
2. **Treatment approach** - What was recommended
3. **Results** - What was achieved
4. **Outcome** - Patient satisfaction

Example:
> This patient came to us seeking to address under eye dark circles. After a thorough consultation, we recommended dermal fillers as the ideal treatment approach. The treatment was performed with precision and care, resulting in significant improvement in under eye dark circles. The patient was thrilled with their results, which exceeded expectations and achieved their aesthetic goals.

## Customization

You can customize the generation logic in `generate-stories.js`:

- **`generateStoryTitle()`** - Modify how titles are generated
- **`generateDetailedStory()`** - Modify the story structure and content

## Collaborative Workflow

1. **Initial Generation**: Run the script to generate initial drafts
2. **Review**: Review all generated content in the markdown file
3. **Refine**: Edit stories to be more specific, personal, or compelling
4. **Import**: Copy refined content to Airtable
5. **Iterate**: Re-run the script to check for new cases or updates

## Tips for Better Stories

- **Be specific**: Mention the actual treatment and concern
- **Use patient language**: Write from the patient's perspective
- **Highlight results**: Emphasize the improvement achieved
- **Keep it concise**: 3-4 sentences is ideal
- **Make it personal**: Use "this patient" or similar phrasing

## Troubleshooting

### Script fails to connect
- Check that your API key is correct in the script
- Verify your Airtable base ID and table name

### No stories generated
- Check if cases already have "Story Title" and "Story Detailed" filled
- Verify the field names match your Airtable schema

### Generated stories are too generic
- Customize the `generateDetailedStory()` function
- Add more specific logic based on treatment types
- Include more details from case data

## Next Steps

After generating and importing stories:
1. Test in the app to see how they display
2. Refine any that don't read well
3. Add more specific details where possible
4. Consider adding patient quotes or specific results












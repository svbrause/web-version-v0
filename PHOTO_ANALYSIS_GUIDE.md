# Photo Analysis for Demographics Estimation

This guide explains how to use image analysis to estimate patient demographics from photos in your Airtable Photos table.

## Overview

The `estimate-demographics-from-photos.js` script analyzes actual images from your Airtable records using computer vision APIs to estimate:

- **Age** - Estimated from facial features
- **Skin Tone** - Analyzed from image color properties
- **Ethnic Background** - Estimated from facial features
- **Skin Type** - Estimated from skin appearance (dry, oily, etc.)
- **Sun Response** - Inferred from skin tone

## Why Image Analysis?

Unlike text-based estimation, analyzing photos directly provides:
- More accurate age estimation
- Visual skin tone assessment
- Better ethnic background detection
- Ability to assess skin type from appearance

## API Options

The script supports multiple vision APIs. Choose one based on your needs:

### Option 1: OpenAI GPT-4 Vision (Recommended) ⭐

**Pros:**
- Excellent at understanding context and providing structured output
- Easy to set up (just need API key)
- Good at extracting multiple demographics from one image
- Handles before/after photos well

**Cons:**
- Costs ~$0.01-0.03 per image
- Requires OpenAI API access

**Setup:**
1. Get an API key from https://platform.openai.com/api-keys
2. Set environment variable: `export OPENAI_API_KEY="your-key-here"`
3. Or update `OPENAI_API_KEY` in the script
4. Set `USE_OPENAI_VISION = true` in the script

### Option 2: Google Cloud Vision API

**Pros:**
- Good face detection
- Reliable and fast
- Free tier available

**Cons:**
- Doesn't directly provide age/ethnicity (requires additional processing)
- More complex setup
- May need additional ML models for full demographics

**Setup:**
1. Create a Google Cloud project
2. Enable Vision API
3. Create API key
4. Set `USE_GOOGLE_VISION = true` and add your API key

### Option 3: Azure Computer Vision

**Pros:**
- Good face detection
- Age estimation available
- Enterprise-grade

**Cons:**
- More complex setup
- Requires Azure account

**Setup:**
1. Create Azure account
2. Create Computer Vision resource
3. Get API key and endpoint
4. Set `USE_AZURE_VISION = true` and add credentials

### Option 4: AWS Rekognition

**Pros:**
- Good face analysis
- Age and ethnicity detection
- Scales well

**Cons:**
- Requires AWS SDK installation
- More complex setup
- AWS account needed

**Setup:**
1. Install AWS SDK: `npm install aws-sdk`
2. Configure AWS credentials
3. Set `USE_AWS_REKOGNITION = true`

## Recommended: OpenAI GPT-4 Vision Setup

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### Step 2: Configure the Script

Open `estimate-demographics-from-photos.js` and:

1. Set your API key:
   ```javascript
   const OPENAI_API_KEY = "sk-your-key-here";
   ```
   
   Or use environment variable:
   ```bash
   export OPENAI_API_KEY="sk-your-key-here"
   ```

2. Ensure OpenAI Vision is enabled:
   ```javascript
   const USE_OPENAI_VISION = true;
   ```

3. Set `DRY_RUN = true` for first run (to preview)

### Step 3: Create Airtable Fields

Before running, create these fields in your Photos table:

- **Age** (Number)
- **Skin Type** (Single select: `dry`, `oily`, `balanced`, `combination`)
- **Sun Response** (Single select: `always burns`, `usually burns`, `sometimes tans`, `usually tans`, `always tans`, `rarely burns`)
- **Skin Tone** (Single select: `light`, `fair`, `medium`, `tan`, `brown`, `deep`)
- **Ethnic Background** (Single select: `asian`, `black`, `hispanic/latino`, `middle eastern`, `white`, `mixed`, `other`)

### Step 4: Run the Script

```bash
node estimate-demographics-from-photos.js
```

The script will:
1. Fetch all records from Airtable
2. Download images from attachment fields
3. Analyze each image using the vision API
4. Extract demographics
5. Show a preview of updates
6. Update records (if `DRY_RUN = false`)

## How It Works

### Image Processing Flow

1. **Fetch Records**: Gets all records from Photos table
2. **Find Images**: Looks for images in attachment fields (Before After, Photo, etc.)
3. **Download**: Temporarily downloads images to analyze
4. **Analyze**: Sends image to vision API with specific prompts
5. **Extract**: Parses API response for demographics
6. **Update**: Updates Airtable record with estimated values
7. **Cleanup**: Deletes temporary image files

### OpenAI Vision Prompt

The script uses a carefully crafted prompt that asks GPT-4 Vision to:
- Analyze the before/after photo
- Estimate age from facial features
- Assess skin tone from visible skin
- Estimate ethnic background from facial features
- Assess skin type from appearance
- Infer sun response from skin tone

The API returns structured JSON with all demographics.

## Cost Estimation

### OpenAI GPT-4 Vision
- **Per image**: ~$0.01-0.03
- **100 images**: ~$1-3
- **1000 images**: ~$10-30

### Google Cloud Vision
- **First 1,000 requests/month**: Free
- **After that**: ~$1.50 per 1,000 images

### Azure Computer Vision
- **Free tier**: 20 calls/minute, 5,000/month
- **Paid**: ~$1 per 1,000 images

## Best Practices

### 1. Start Small
- Run on a few records first to test
- Review results for accuracy
- Adjust prompts if needed

### 2. Review Results
- Check a sample of estimates
- Manually correct obvious errors
- Note patterns in inaccuracies

### 3. Handle Edge Cases
- Some photos may not show faces clearly
- Before/after photos may have different lighting
- Multiple people in photo (script uses first detected face)

### 4. Rate Limiting
- Script includes delays between requests
- Respects API rate limits
- May take time for large datasets

### 5. Error Handling
- Script continues if one image fails
- Logs errors for review
- Skips records without images

## Troubleshooting

### "No image found"
- Check that attachment fields exist in Airtable
- Verify field names match (Before After, Photo, etc.)
- Ensure images are actually uploaded

### "API key not configured"
- Set environment variable: `export OPENAI_API_KEY="your-key"`
- Or update the key in the script directly

### "Analysis failed"
- Check API key is valid
- Verify you have API credits/quota
- Check image format is supported (JPG, PNG)

### "Rate limit exceeded"
- Increase delay between requests
- Run script in smaller batches
- Check your API tier/limits

### Inaccurate Results
- Review the prompt in the script
- Adjust the prompt for your specific use case
- Consider using a different API
- Manually review and correct estimates

## Example Output

```
[1/50] Processing: Resolve Brow Asymmetry with Filler
  → Found image: https://dl.airtable.com/...
  → Downloading image...
  → Image downloaded
  → Analyzing image...
  → Analysis complete: {
    Age: 42,
    Skin Tone: 'fair',
    Ethnic Background: 'white',
    Skin Type: 'combination',
    Sun Response: 'usually burns'
  }
```

## Next Steps

After running the script:

1. **Review Results**: Check a sample of estimates for accuracy
2. **Manual Corrections**: Fix any obvious errors
3. **Update Matching**: Use demographics in your matching algorithm
4. **Monitor**: Track how demographics improve matching quality

## Integration with Matching

Once demographics are added, update your matching algorithm in `app.js`:

```javascript
// In calculateMatchingScore function
if (caseItem['Skin Tone'] && userSelections.skinTone) {
  if (caseItem['Skin Tone'] === userSelections.skinTone) {
    score += 15; // Higher weight for visual match
  }
}

if (caseItem['Age'] && userSelections.age) {
  const ageDiff = Math.abs(caseItem['Age'] - userSelections.age);
  if (ageDiff <= 5) {
    score += 20; // Very close age match
  } else if (ageDiff <= 10) {
    score += 10; // Close age match
  }
}
```

This will provide much better personalized matching based on visual similarities!





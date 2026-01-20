/**
 * Script to estimate demographics from photos in Airtable
 * 
 * This script:
 * 1. Fetches all records from the Photos table
 * 2. Downloads images from attachment fields
 * 3. Analyzes images using a vision API to estimate demographics
 * 4. Updates records with estimated demographics
 * 
 * Usage: node estimate-demographics-from-photos.js
 * 
 * Requirements:
 * - Node.js with https, fs, and path modules
 * - A vision API key (Google Cloud Vision, AWS Rekognition, or Azure Computer Vision)
 * 
 * Note: Set DRY_RUN=false to actually update records (default is true for safety)
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appXblSpAMBQskgzB";

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Set to false to actually update records (default is true for safety)
const DRY_RUN = false; // Changed to false to actually update Airtable

// Vision API Configuration
// Choose one of the following options:

// Option 1: Google Cloud Vision API
const USE_GOOGLE_VISION = false;
const GOOGLE_VISION_API_KEY = "YOUR_GOOGLE_VISION_API_KEY";
const GOOGLE_VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

// Option 2: Azure Computer Vision
const USE_AZURE_VISION = false;
const AZURE_VISION_KEY = "YOUR_AZURE_VISION_KEY";
const AZURE_VISION_ENDPOINT = "https://YOUR_REGION.api.cognitive.microsoft.com/vision/v3.2/analyze";

// Option 3: AWS Rekognition (requires AWS SDK)
// const USE_AWS_REKOGNITION = false;
// const AWS_REGION = "us-east-1";
// const AWS_ACCESS_KEY_ID = "YOUR_AWS_ACCESS_KEY";
// const AWS_SECRET_ACCESS_KEY = "YOUR_AWS_SECRET_KEY";

// Option 4: OpenAI GPT-4 Vision (recommended for better results)
const USE_OPENAI_VISION = true;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Temporary directory for downloaded images
const TEMP_DIR = path.join(__dirname, "temp_images");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper function to make HTTPS requests
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              ok: true,
              status: res.statusCode,
              json: async () => jsonData,
              text: async () => data,
            });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          resolve({
            ok: true,
            status: res.statusCode,
            json: async () => ({ raw: data }),
            text: async () => data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Download image from URL
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? https : http;
    
    const file = fs.createWriteStream(filePath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on("finish", () => {
        file.close();
        resolve(filePath);
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

// Analyze image using OpenAI GPT-4 Vision
async function analyzeImageWithOpenAI(imagePath) {
  try {
    const base64Image = imageToBase64(imagePath);
    const imageExtension = path.extname(imagePath).slice(1) || "jpg";
    const mimeType = `image/${imageExtension === "jpg" ? "jpeg" : imageExtension}`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: {
        // Try "gpt-4o" (current), "gpt-4-turbo", or "gpt-4o-2024-08-06" if available
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert medical image analyst specializing in demographic assessment from aesthetic treatment photos. You are highly skilled at making accurate estimates from visual features. Make your best estimates based on what you can see - be confident in your analysis."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this medical aesthetic treatment photo and provide demographic estimates. This is a legitimate medical use case for patient matching.

ANALYSIS GUIDELINES:
- AGE: Estimate from facial features, skin texture, and visible signs of aging. Look at wrinkles, skin elasticity, and overall appearance. Make your best estimate even if uncertain (±5 years is acceptable).
- SKIN TONE: Assess from visible skin areas. Categories: light (very pale), fair (pale with some color), medium (olive/tan), tan (darker tan), brown (medium brown), deep (dark brown/black).
- ETHNIC BACKGROUND: Analyze facial features, bone structure, and skin characteristics. Be confident in your assessment.
- SKIN TYPE: Look for visible signs: dry (flaky, tight appearance), oily (shiny, visible pores), balanced (smooth, even), combination (mixed areas).
- SUN RESPONSE: Infer from skin tone - lighter tones typically burn more, darker tones tan more. Fair/light = usually/always burns, medium/tan = usually tans, brown/deep = rarely burns/always tans.

IMPORTANT: Make confident estimates. Only use null if the image truly shows no person or the feature is completely obscured. For partial visibility, make your best estimate.

REQUIRED JSON (include ALL 5 fields):
{
  "age": <number or null>,
  "skinTone": "<light|fair|medium|tan|brown|deep|null>",
  "ethnicBackground": "<asian|black|hispanic/latino|middle eastern|white|mixed|other|null>",
  "skinType": "<dry|oily|balanced|combination|null>",
  "sunResponse": "<always burns|usually burns|sometimes tans|usually tans|always tans|rarely burns|null>"
}

EXAMPLES:
- Clear face: {"age": 42, "skinTone": "fair", "ethnicBackground": "white", "skinType": "combination", "sunResponse": "usually burns"}
- Partial face: {"age": 35, "skinTone": "medium", "ethnicBackground": "hispanic/latino", "skinType": null, "sunResponse": "usually tans"}
- No person: {"age": null, "skinTone": null, "ethnicBackground": null, "skinType": null, "sunResponse": null}

Respond with ONLY valid JSON, no other text.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: "high" // Request high detail image analysis
                }
              }
            ]
          }
        ],
        max_tokens: 500, // Increased to allow more detailed analysis
        temperature: 0.5, // Slightly higher for more confident estimates
        response_format: { type: "json_object" }
      }
    });
    
    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error(`  → OpenAI API error: ${data.error.message}`);
      return null;
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`  → Unexpected OpenAI response format`);
      return null;
    }
    
    const content = data.choices[0].message.content.trim();
    
    // Check if response is an error message (starts with "I'm" or "I cannot")
    if (content.startsWith("I'm") || content.startsWith("I cannot") || 
        content.startsWith("I'm sorry") || content.startsWith("I'm unable")) {
      console.error(`  → OpenAI declined to analyze: ${content.substring(0, 100)}`);
      // Return null values instead of failing
      return {
        age: null,
        skinTone: null,
        ethnicBackground: null,
        skinType: null,
        sunResponse: null
      };
    }
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    let parsed = null;
    
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error(`  → Failed to parse JSON: ${parseError.message}`);
        console.error(`  → Content: ${content.substring(0, 200)}`);
        return null;
      }
    } else {
      // Try parsing the whole content
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error(`  → Failed to parse response as JSON: ${parseError.message}`);
        console.error(`  → Content: ${content.substring(0, 200)}`);
        return null;
      }
    }
    
    // Normalize to ensure all fields are present (even if null)
    return {
      age: parsed.age ?? null,
      skinTone: parsed.skinTone ?? null,
      ethnicBackground: parsed.ethnicBackground ?? null,
      skinType: parsed.skinType ?? null,
      sunResponse: parsed.sunResponse ?? null
    };
  } catch (error) {
    console.error(`  → Error analyzing image with OpenAI: ${error.message}`);
    return null;
  }
}

// Analyze image using Google Cloud Vision API
async function analyzeImageWithGoogleVision(imagePath) {
  try {
    const base64Image = imageToBase64(imagePath);
    
    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      body: {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              { type: "FACE_DETECTION", maxResults: 10 },
              { type: "IMAGE_PROPERTIES", maxResults: 1 }
            ]
          }
        ]
      }
    });
    
    const data = await response.json();
    
    if (data.responses && data.responses[0] && data.responses[0].faceAnnotations) {
      const faces = data.responses[0].faceAnnotations;
      if (faces.length > 0) {
        const face = faces[0];
        // Extract demographics from face detection
        // Note: Google Vision doesn't directly provide all these fields
        // You'd need to map face properties to demographics
        return {
          age: estimateAgeFromFace(face),
          skinTone: estimateSkinToneFromImage(data.responses[0].imagePropertiesAnnotation),
          // Other fields would need additional processing
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error analyzing image with Google Vision: ${error.message}`);
    return null;
  }
}

// Helper to estimate age from face detection data
function estimateAgeFromFace(face) {
  // Google Vision provides joyLikelihood, sorrowLikelihood, etc.
  // Age estimation would require additional ML models
  // For now, return null - would need specialized age estimation model
  return null;
}

// Helper to estimate skin tone from image properties
function estimateSkinToneFromImage(imageProperties) {
  if (!imageProperties || !imageProperties.dominantColors) {
    return null;
  }
  
  // Analyze dominant colors to estimate skin tone
  // This is a simplified approach - would need more sophisticated analysis
  const colors = imageProperties.dominantColors.colors;
  // Map color analysis to skin tone categories
  // Implementation would depend on color space analysis
  
  return null;
}

// Map API results to Airtable field format
function mapToAirtableFields(analysis) {
  if (!analysis) {
    // Return all fields as null if no analysis
    return {
      "Age": null,
      "Skin Tone": null,
      "Ethnic Background": null,
      "Skin Type": null,
      "Sun Response": null
    };
  }
  
  const fields = {};
  
  // Always include all fields, even if null
  // Only add to Airtable if value is not null (Airtable doesn't like null values)
  if (analysis.age !== null && analysis.age !== undefined) {
    fields["Age"] = analysis.age;
  }
  if (analysis.skinTone !== null && analysis.skinTone !== undefined) {
    fields["Skin Tone"] = analysis.skinTone;
  }
  if (analysis.ethnicBackground !== null && analysis.ethnicBackground !== undefined) {
    fields["Ethnic Background"] = analysis.ethnicBackground;
  }
  if (analysis.skinType !== null && analysis.skinType !== undefined) {
    fields["Skin Type"] = analysis.skinType;
  }
  if (analysis.sunResponse !== null && analysis.sunResponse !== undefined) {
    fields["Sun Response"] = analysis.sunResponse;
  }
  
  return fields;
}

// Fetch all records from Airtable
async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_URL}?offset=${offset}`
      : AIRTABLE_API_URL;
    
    try {
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        }
      });
      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset || null;
      
      console.log(`Fetched ${allRecords.length} records so far...`);
    } catch (error) {
      throw new Error(`Airtable API error: ${error.message}`);
    }
  } while (offset);
  
  return allRecords;
}

// Get image URL from Airtable record
function getImageUrl(record) {
  const fields = record.fields || {};
  
  // Only look for "Photo" field
  const field = fields["Photo"];
  if (field && Array.isArray(field) && field.length > 0) {
    // Airtable attachment fields return array of objects with 'url' property
    const attachment = field[0];
    if (attachment.url) {
      return attachment.url;
    }
  }
  
  return null;
}

// Update a record with estimated demographics
async function updateRecord(recordId, demographics) {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/${recordId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      },
      body: {
        fields: demographics
      }
    });
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update record ${recordId}: ${error.message}`);
  }
}

// Main function
async function estimateDemographicsFromPhotos() {
  console.log('Starting demographic estimation from photos...\n');
  
  // Check API configuration
  if (USE_OPENAI_VISION && (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY")) {
    console.error("ERROR: OpenAI API key not configured!");
    console.error("Set OPENAI_API_KEY environment variable or update the script.");
    process.exit(1);
  }
  
  try {
    // Fetch all records
    console.log('Fetching records from Airtable...');
    const records = await fetchAllRecords();
    console.log(`Found ${records.length} records\n`);
    
    // Process each record
    const updates = [];
    let skipped = 0;
    let noImage = 0;
    let updateErrors = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const fields = record.fields || {};
      const recordId = record.id;
      const name = fields["Name"] || recordId;
      
      console.log(`\n[${i + 1}/${records.length}] Processing: ${name}`);
      
      // Skip if demographics already exist
      if (fields['Age'] && fields['Skin Type'] && fields['Sun Response'] && 
          fields['Skin Tone'] && fields['Ethnic Background']) {
        console.log(`  → Skipping - already has demographics`);
        skipped++;
        continue;
      }
      
      // Get image URL
      const imageUrl = getImageUrl(record);
      if (!imageUrl) {
        console.log(`  → No image found`);
        noImage++;
        continue;
      }
      
      console.log(`  → Found image`);
      
      // Download image
      const imageExtension = path.extname(new URL(imageUrl).pathname) || ".jpg";
      const tempImagePath = path.join(TEMP_DIR, `${recordId}${imageExtension}`);
      
      try {
        console.log(`  → Downloading image...`);
        await downloadImage(imageUrl, tempImagePath);
        console.log(`  → Image downloaded`);
        
        // Analyze image
        console.log(`  → Analyzing image...`);
        let analysis = null;
        
        if (USE_OPENAI_VISION) {
          analysis = await analyzeImageWithOpenAI(tempImagePath);
        } else if (USE_GOOGLE_VISION) {
          analysis = await analyzeImageWithGoogleVision(tempImagePath);
        } else if (USE_AZURE_VISION) {
          // Add Azure Vision implementation
          console.log(`  → Azure Vision not yet implemented`);
        }
        
        // Clean up temp file
        fs.unlinkSync(tempImagePath);
        
        if (analysis) {
          // Show full analysis with all fields (including nulls)
          const fullAnalysis = {
            age: analysis.age ?? null,
            skinTone: analysis.skinTone ?? null,
            ethnicBackground: analysis.ethnicBackground ?? null,
            skinType: analysis.skinType ?? null,
            sunResponse: analysis.sunResponse ?? null
          };
          
          console.log(`  → Full analysis:`, fullAnalysis);
          
          const updateFields = mapToAirtableFields(analysis);
          if (Object.keys(updateFields).length > 0) {
            console.log(`  → Fields to update:`, updateFields);
            
            // Update immediately instead of collecting
            if (!DRY_RUN) {
              try {
                await updateRecord(recordId, updateFields);
                console.log(`  ✓ Successfully updated record in Airtable`);
                updates.push({
                  recordId,
                  name,
                  fields: updateFields,
                  analysis
                });
                // Small delay after update to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (updateError) {
                console.error(`  ✗ Failed to update record: ${updateError.message}`);
                updateErrors++;
              }
            } else {
              // In dry run mode, just collect
              updates.push({
                recordId,
                name,
                fields: updateFields,
                analysis
              });
            }
          } else {
            console.log(`  → No demographics extracted (all null)`);
          }
        } else {
          console.log(`  → Analysis failed`);
        }
        
        // Rate limiting - wait between requests
        if (i < records.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
        
      } catch (error) {
        console.error(`  → Error processing image: ${error.message}`);
        // Clean up temp file if it exists
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
    }
    
    console.log(`\n\n=== Summary ===`);
    console.log(`Total records: ${records.length}`);
    console.log(`Already have demographics: ${skipped}`);
    console.log(`No image found: ${noImage}`);
    console.log(`Successfully updated: ${updates.length}`);
    if (updateErrors > 0) {
      console.log(`Update errors: ${updateErrors}`);
    }
    
    if (DRY_RUN) {
      console.log(`\n[DRY RUN MODE] No records were actually updated.`);
      console.log(`To perform the updates, set DRY_RUN=false at the top of the script.`);
    } else {
      if (updates.length > 0) {
        console.log(`\n✓ Successfully updated ${updates.length} records in Airtable!`);
        console.log(`\nSample of updated records:`);
        updates.slice(0, 5).forEach((update, i) => {
          console.log(`  ${i + 1}. ${update.name}`);
          console.log(`     Fields:`, update.fields);
        });
        if (updates.length > 5) {
          console.log(`  ... and ${updates.length - 5} more`);
        }
      } else {
        console.log(`\n⚠ No records were updated. This could mean:`);
        console.log(`  - All records already have demographics`);
        console.log(`  - No images were found`);
        console.log(`  - All analyses failed`);
      }
    }
    
    // Clean up temp directory
    try {
      const files = fs.readdirSync(TEMP_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      });
    } catch (error) {
      // Ignore cleanup errors
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  estimateDemographicsFromPhotos();
}

module.exports = { estimateDemographicsFromPhotos };


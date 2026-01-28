// Script to generate markdown file from Airtable data
const fs = require('fs');
const path = require('path');

// Airtable configuration (from app.js)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_BASE_ID = "appXblSpAMBQskgzB";
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Areas and Issues structure (from app.js)
const areasAndIssues = {
  Forehead: [
    "Forehead Wrinkles",
    "Glabella Wrinkles",
    "Brow Asymmetry",
    "Flat Forehead",
    "Brow Ptosis",
    "Temporal Hollow",
  ],
  Eyes: [
    "Crow's Feet Wrinkles",
    "Under Eye Wrinkles",
    "Under Eye Dark Circles",
    "Excess Upper Eyelid Skin",
    "Lower Eyelid - Excess Skin",
    "Upper Eyelid Droop",
    "Lower Eyelid Sag",
    "Lower Eyelid Bags",
    "Under Eye Hollow",
    "Upper Eye Hollow",
  ],
  Cheeks: [
    "Mid Cheek Flattening",
    "Cheekbone - Not Prominent",
    "Heavy Lateral Cheek",
    "Lower Cheeks - Volume Depletion",
  ],
  Nose: ["Crooked Nose", "Droopy Tip", "Dorsal Hump", "Tip Droop When Smiling"],
  Lips: [
    "Thin Lips",
    "Lacking Philtral Column",
    "Long Philtral Column",
    "Gummy Smile",
    "Asymmetric Lips",
    "Dry Lips",
    "Lip Thinning When Smiling",
  ],
  "Chin/Jaw": [
    "Retruded Chin",
    "Over-Projected Chin",
    "Asymmetric Chin",
    "Jowls",
    "Ill-Defined Jawline",
    "Asymmetric Jawline",
    "Masseter Hypertrophy",
    "Prejowl Sulcus",
  ],
  Neck: [
    "Neck Lines",
    "Loose Neck Skin",
    "Platysmal Bands",
    "Excess/Submental Fullness",
  ],
  Skin: [
    "Dark Spots",
    "Red Spots",
    "Scars",
    "Dry Skin",
    "Whiteheads",
    "Blackheads",
    "Crepey Skin",
    "Nasolabial Folds",
    "Marionette Lines",
    "Bunny Lines",
    "Perioral Wrinkles",
  ],
  Body: ["Weight Loss"],
};

// Issue name mappings for matching
const issueNameMappings = {
  "excess upper eyelid skin": [
    "excess skin - upper eyelid",
    "excess skin upper eyelid",
    "upper eyelid excess skin",
    "excess upper eyelid",
    "eyelid excess skin",
  ],
  "lower eyelid - excess skin": [
    "excess skin - lower eyelid",
    "excess skin lower eyelid",
    "lower eyelid excess skin",
    "excess lower eyelid",
  ],
  "under eye dark circles": [
    "dark circles under eye",
    "under eye circles",
    "dark circles",
  ],
  "under eye wrinkles": ["under eye lines", "under eye fine lines"],
  "crow's feet wrinkles": ["crow's feet", "crows feet", "crow feet"],
  "forehead wrinkles": ["forehead lines", "forehead fine lines"],
  "glabella wrinkles": ["glabella lines", "frown lines", "11 lines"],
  "nasolabial folds": ["nasolabial lines", "smile lines"],
  "marionette lines": ["marionette folds", "mouth lines"],
  "ill-defined jawline": [
    "jawline definition",
    "jaw definition",
    "undefined jawline",
  ],
  "masseter hypertrophy": [
    "masseter enlargement",
    "jaw muscle enlargement",
    "square jaw",
  ],
  "mid cheek flattening": [
    "mid cheek",
    "mid-cheek",
    "midcheek",
    "cheek flattening",
    "cheek volume",
    "mid cheek volume",
    "mid-cheek volume",
    "cheek hollow",
    "mid cheek hollow",
    "cheek depletion",
    "mid cheek depletion",
  ],
  "lower cheeks - volume depletion": [
    "lower cheek",
    "lower-cheek",
    "lower cheek volume",
    "lower-cheek volume",
    "lower cheek depletion",
  ],
  "weight loss": [
    "weight management",
    "weight reduction",
    "body weight",
    "lose weight",
    "weight loss program",
    "weight-loss",
    "weight-management",
  ],
};

// Fetch from Airtable
async function fetchAirtableRecords() {
  const https = require('https');
  const url = require('url');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(AIRTABLE_API_URL);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Simple matching function (simplified version of getLenientMatchingCasesForIssue)
function matchesIssue(caseItem, issueName) {
  const issueLower = issueName.toLowerCase();
  const allText = [
    caseItem.name || '',
    ...(caseItem.solved || []),
    ...(caseItem.matchingCriteria || []),
    caseItem.story || '',
    caseItem.treatment || '',
  ]
    .join(' ')
    .toLowerCase();

  // Direct match
  if (allText.includes(issueLower)) return true;

  // Get mapped variations
  const mappedVariations = issueNameMappings[issueLower] || [];
  const searchTerms = [
    issueLower,
    issueLower.replace(/\s+/g, '-'),
    ...mappedVariations.map((v) => v.toLowerCase()),
  ];

  // Check if any search term appears
  const hasMatch = searchTerms.some((term) => allText.includes(term));
  if (hasMatch) return true;

  // Partial word matches
  const issueWords = issueLower.split(/\s+/).filter((w) => w.length > 2);
  if (issueWords.length > 0) {
    const matches = issueWords.filter((word) => allText.includes(word));
    if (matches.length >= Math.min(2, issueWords.length)) return true;
  }

  // Specific mappings
  if (issueLower.includes('forehead') && caseItem.solved?.some((s) => s.toLowerCase().includes('forehead'))) return true;
  if (issueLower.includes('jawline') && caseItem.solved?.some((s) => s.toLowerCase().includes('jawline') || s.toLowerCase().includes('definition'))) return true;
  if (issueLower.includes('dark spots') && caseItem.solved?.some((s) => s.toLowerCase().includes('spot'))) return true;
  if (issueLower.includes('under eye') && caseItem.solved?.some((s) => s.toLowerCase().includes('under-eye') || s.toLowerCase().includes('eye'))) return true;
  if (issueLower.includes('nasolabial') && caseItem.solved?.some((s) => s.toLowerCase().includes('anti-aging'))) return true;

  return false;
}

// Process Airtable records into case format
function processAirtableRecord(record) {
  const fields = record.fields || {};
  
  // Get images - try multiple field name variations
  const possibleImageFields = [
    "Before After",
    "Before/After",
    "Before After Image",
    "Image",
    "Photo",
    "Photos",
    "Before After Photo",
    "Attachment",
    "Attachments",
    "Picture",
    "Pictures",
  ];

  let beforeAfter = null;
  let thumbnail = null;

  for (const fieldName of possibleImageFields) {
    const fieldValue = fields[fieldName];
    if (Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue[0]?.url) {
      beforeAfter = fieldValue[0].url;
      thumbnail = fieldValue[0].thumbnails?.large?.url || fieldValue[0].url;
      break;
    }
  }

  // If no image found, check all fields for arrays with URL property
  if (!beforeAfter) {
    Object.keys(fields).forEach((fieldName) => {
      const fieldValue = fields[fieldName];
      if (
        Array.isArray(fieldValue) &&
        fieldValue.length > 0 &&
        fieldValue[0]?.url
      ) {
        beforeAfter = fieldValue[0].url;
        thumbnail = fieldValue[0].thumbnails?.large?.url || fieldValue[0].url;
      }
    });
  }

  // Get other fields
  const name = fields["Name"] || `Treatment ${record.id}`;
  const headline = fields["Headline"] || fields["Title"] || fields["Case Title"] || name;
  const patientAge = fields["Age"] || fields["Patient Age"] || null;
  const patientName = fields["Patient Name"] || fields["Patient"] || "Patient";
  const patient = patientAge ? `${patientName}, ${patientAge} years old` : patientName;
  
  const story = fields["Story"] || fields["Description"] || fields["Patient Story"] || "";
  
  let solved = [];
  const solvedField = fields["Solved"] || fields["Issues Solved"] || "";
  if (Array.isArray(solvedField)) {
    solved = solvedField;
  } else if (typeof solvedField === "string" && solvedField.trim()) {
    solved = solvedField.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  }
  
  const treatment = fields["Treatment"] || fields["Treatment Details"] || "";
  
  let matchingCriteria = [];
  const criteriaField = fields["Matching Criteria"] || fields["Criteria"] || fields["Tags"] || "";
  if (Array.isArray(criteriaField)) {
    matchingCriteria = criteriaField.map((c) => String(c).trim().toLowerCase().replace(/\s+/g, "-"));
  } else if (typeof criteriaField === "string" && criteriaField.trim()) {
    matchingCriteria = criteriaField.split(",").map((c) => c.trim().toLowerCase().replace(/\s+/g, "-")).filter((c) => c.length > 0);
  }

  return {
    id: record.id,
    name,
    headline,
    patient,
    patientAge,
    story,
    solved,
    treatment,
    matchingCriteria,
    thumbnail,
    beforeAfter,
  };
}

// Generate markdown
function generateMarkdown(cases) {
  let markdown = `# Aesthetic Cases Catalog\n\n`;
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += `Total Cases: ${cases.length}\n\n`;
  markdown += `---\n\n`;

  const includedCaseIds = new Set();

  // Organize by Area > Issue > Cases
  for (const [area, issues] of Object.entries(areasAndIssues)) {
    markdown += `## ${area}\n\n`;

    for (const issue of issues) {
      const matchingCases = cases.filter((c) => matchesIssue(c, issue) && !includedCaseIds.has(c.id));

      if (matchingCases.length > 0) {
        markdown += `### ${issue}\n\n`;

        for (const caseItem of matchingCases) {
          includedCaseIds.add(caseItem.id);

          markdown += `#### ${caseItem.headline || caseItem.name}\n\n`;

          if (caseItem.patient) {
            markdown += `**Patient:** ${caseItem.patient}\n\n`;
          }

          // Include images - use actual URLs from Airtable
          if (caseItem.beforeAfter) {
            if (caseItem.beforeAfter.startsWith("http://") || caseItem.beforeAfter.startsWith("https://")) {
              markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
            }
          } else if (caseItem.thumbnail) {
            if (caseItem.thumbnail.startsWith("http://") || caseItem.thumbnail.startsWith("https://")) {
              markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
            }
          }

          if (caseItem.story) {
            markdown += `**Story:**\n\n${caseItem.story}\n\n`;
          }

          if (caseItem.solved && caseItem.solved.length > 0) {
            markdown += `**This Solved:**\n\n`;
            caseItem.solved.forEach((issue) => {
              markdown += `- ${issue}\n`;
            });
            markdown += `\n`;
          }

          if (caseItem.treatment) {
            markdown += `**Treatment Details:**\n\n${caseItem.treatment}\n\n`;
          }

          if (caseItem.name) {
            markdown += `**Treatment:** ${caseItem.name}\n\n`;
          }

          if (caseItem.matchingCriteria && caseItem.matchingCriteria.length > 0) {
            markdown += `**Matching Criteria:** ${caseItem.matchingCriteria.join(", ")}\n\n`;
          }

          markdown += `---\n\n`;
        }
      } else {
        markdown += `### ${issue}\n\n`;
        markdown += `*No cases yet - cases will appear here when they match this issue*\n\n`;
      }
    }
  }

  // Add unmatched cases
  const unmatchedCases = cases.filter((c) => !includedCaseIds.has(c.id));
  if (unmatchedCases.length > 0) {
    markdown += `## Other Cases\n\n`;
    markdown += `*Cases that don't match specific issues*\n\n`;

    for (const caseItem of unmatchedCases) {
      markdown += `### ${caseItem.headline || caseItem.name}\n\n`;

      if (caseItem.patient) {
        markdown += `**Patient:** ${caseItem.patient}\n\n`;
      }

      if (caseItem.beforeAfter) {
        if (caseItem.beforeAfter.startsWith("http://") || caseItem.beforeAfter.startsWith("https://")) {
          markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
        }
      } else if (caseItem.thumbnail) {
        if (caseItem.thumbnail.startsWith("http://") || caseItem.thumbnail.startsWith("https://")) {
          markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
        }
      }

      if (caseItem.story) {
        markdown += `**Story:**\n\n${caseItem.story}\n\n`;
      }

      if (caseItem.solved && caseItem.solved.length > 0) {
        markdown += `**This Solved:**\n\n`;
        caseItem.solved.forEach((issue) => {
          markdown += `- ${issue}\n`;
        });
        markdown += `\n`;
      }

      if (caseItem.treatment) {
        markdown += `**Treatment Details:**\n\n${caseItem.treatment}\n\n`;
      }

      if (caseItem.name) {
        markdown += `**Treatment:** ${caseItem.name}\n\n`;
      }

      markdown += `---\n\n`;
    }
  }

  return markdown;
}

// Main execution
async function main() {
  try {
    console.log('Fetching cases from Airtable...');
    const data = await fetchAirtableRecords();
    const records = data.records || [];
    
    console.log(`Found ${records.length} records in Airtable`);
    
    if (records.length === 0) {
      console.log('No records found. Using sample data instead.');
      // Fallback to sample data if no Airtable records
      return;
    }

    // Process records
    const cases = records.map(processAirtableRecord);
    console.log(`Processed ${cases.length} cases`);
    
    // Count cases with images
    const casesWithImages = cases.filter(c => c.beforeAfter || c.thumbnail);
    console.log(`Cases with images: ${casesWithImages.length}`);

    // Generate markdown
    const markdown = generateMarkdown(cases);
    
    // Write to file
    const outputPath = path.join(__dirname, 'aesthetic-cases-export.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`✅ Markdown file generated: ${outputPath}`);
    console.log(`📄 Total cases: ${cases.length}`);
    console.log(`🖼️  Cases with images: ${casesWithImages.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();














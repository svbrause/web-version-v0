// Script to check which suggestion names still contain "with [treatment]"
// Fetches data from Airtable and checks the extracted concern names

const https = require('https');
const fs = require('fs');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appXblSpAMBQskgzB";

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_TABLE_NAME = "Photos";

// Copy the extractConcernFromCaseName function from app.js
function extractConcernFromCaseName(caseName) {
  if (!caseName) return "General Concern";

  const name = caseName.toLowerCase();

  // Remove common treatment method suffixes
  const patterns = [
    // Remove "with [treatment]" patterns - comprehensive list of all treatments
    // This pattern matches "with [any treatment]" and removes everything after "with"
    {
      pattern:
        /\s+with\s+.*$/i,
      replacement: "",
    },
    // Remove standalone treatment terms at the end (e.g., "Heat/energy", "RF", "Laser")
    {
      pattern:
        /\s+(heat\/energy|heat\s*\/\s*energy|rf|radiofrequency|radio\s+frequency|thermage|ultherapy|morpheus|microneedling|hydrafacial|ipl|laser|botox|filler|threadlift)$/i,
      replacement: "",
    },
    // Remove "using X" patterns
    { pattern: /\s+using\s+.*$/i, replacement: "" },
    // Remove "via X" patterns
    { pattern: /\s+via\s+.*$/i, replacement: "" },
  ];

  let concern = caseName;
  patterns.forEach(({ pattern, replacement }) => {
    concern = concern.replace(pattern, replacement).trim();
  });

  // Capitalize first letter of each word
  concern = concern
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return concern || "General Concern";
}

function fetchAirtableRecords(offset = null) {
  return new Promise((resolve, reject) => {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const params = new URLSearchParams();
    params.append("pageSize", "100");
    if (offset) {
      params.append("offset", offset);
    }
    url += "?" + params.toString();

    const options = {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;

  do {
    const data = await fetchAirtableRecords(offset);
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset || null;
    console.log(`Fetched ${allRecords.length} records so far...`);
  } while (offset);

  return allRecords;
}

async function main() {
  console.log("Fetching case data from Airtable...");
  const records = await fetchAllRecords();
  console.log(`Loaded ${records.length} records\n`);

  const suggestionsWithTreatment = [];
  const allSuggestions = new Set();

  records.forEach(record => {
    const caseName = record.fields["Name"] || "";
    if (!caseName) return;

    const extractedConcern = extractConcernFromCaseName(caseName);
    allSuggestions.add(extractedConcern);

    // Check if the extracted concern still contains "with"
    if (extractedConcern.toLowerCase().includes(" with ")) {
      suggestionsWithTreatment.push({
        originalName: caseName,
        extractedConcern: extractedConcern
      });
    }
  });

  console.log(`Found ${suggestionsWithTreatment.length} suggestion names that still contain "with [treatment]":\n`);
  
  if (suggestionsWithTreatment.length > 0) {
    suggestionsWithTreatment.forEach((item, index) => {
      console.log(`${index + 1}. "${item.extractedConcern}"`);
      console.log(`   Original: "${item.originalName}"\n`);
    });

    // Generate CSV
    const csvHeader = 'Original Case Name,Extracted Suggestion Name\n';
    const csvRows = suggestionsWithTreatment.map(item => {
      const escapeCSV = (str) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      return `${escapeCSV(item.originalName)},${escapeCSV(item.extractedConcern)}`;
    }).join('\n');
    
    const csv = csvHeader + csvRows;
    fs.writeFileSync('suggestions-with-treatment.csv', csv);
    console.log(`\n✅ Saved to suggestions-with-treatment.csv`);
  } else {
    console.log("✅ All suggestion names are clean - no 'with [treatment]' found!");
  }

  console.log(`\nTotal unique suggestions: ${allSuggestions.size}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


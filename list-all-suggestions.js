// Script to list ALL suggestion names (extracted concerns) to verify they're correct
const https = require('https');
const fs = require('fs');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_BASE_ID = "appXblSpAMBQskgzB";
const AIRTABLE_TABLE_NAME = "Photos";

function extractConcernFromCaseName(caseName) {
  if (!caseName) return "General Concern";

  const patterns = [
    { pattern: /\s+with\s+.*$/i, replacement: "" },
    { pattern: /\s+(heat\/energy|heat\s*\/\s*energy|rf|radiofrequency|radio\s+frequency|thermage|ultherapy|morpheus|microneedling|hydrafacial|ipl|laser|botox|filler|threadlift)$/i, replacement: "" },
    { pattern: /\s+using\s+.*$/i, replacement: "" },
    { pattern: /\s+via\s+.*$/i, replacement: "" },
  ];

  let concern = caseName;
  patterns.forEach(({ pattern, replacement }) => {
    concern = concern.replace(pattern, replacement).trim();
  });

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
  } while (offset);

  return allRecords;
}

async function main() {
  const records = await fetchAllRecords();
  
  const allSuggestions = new Map(); // Map suggestion name -> array of original case names
  
  records.forEach(record => {
    const caseName = record.fields["Name"] || "";
    if (!caseName) return;

    const extractedConcern = extractConcernFromCaseName(caseName);
    
    if (!allSuggestions.has(extractedConcern)) {
      allSuggestions.set(extractedConcern, []);
    }
    allSuggestions.get(extractedConcern).push(caseName);
  });

  // Generate CSV with all suggestions
  const csvHeader = 'Extracted Suggestion Name,Example Original Case Names\n';
  const csvRows = Array.from(allSuggestions.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([suggestion, originalNames]) => {
      const escapeCSV = (str) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      // Show first 3 examples
      const examples = originalNames.slice(0, 3).join('; ');
      return `${escapeCSV(suggestion)},${escapeCSV(examples)}`;
    }).join('\n');
  
  const csv = csvHeader + csvRows;
  fs.writeFileSync('all-suggestions.csv', csv);
  
  console.log(`✅ Generated all-suggestions.csv with ${allSuggestions.size} unique suggestions`);
  console.log(`\nFirst 20 suggestions:`);
  Array.from(allSuggestions.keys()).slice(0, 20).forEach((suggestion, i) => {
    console.log(`${i + 1}. ${suggestion}`);
  });
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


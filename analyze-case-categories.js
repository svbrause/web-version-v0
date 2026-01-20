/**
 * Script to analyze which cases fall into which concern categories
 * Outputs a CSV file with case categorization
 * 
 * Usage: node analyze-case-categories.js
 */

const https = require("https");
const fs = require("fs");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_BASE_ID = "appXblSpAMBQskgzB";
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// High-level concern categories (updated to match app.js expansions)
const HIGH_LEVEL_CONCERNS = [
  {
    id: "facial-balancing",
    name: "Facial Balancing",
    mapsToPhotos: [
      "facial-balancing", "facial-harmony", "proportions", "symmetry", 
      "brow-asymmetry", "asymmetry", "resolve-brow", "brow-balance", "facial-symmetry",
      "balance-brow", "balance-brows", "balance-chin", "balance-jawline", "balance-lip", "balance-lips",
      "asymmetric-brow", "asymmetric-brows", "asymmetric-chin", "asymmetric-jawline", "asymmetric-lip", "asymmetric-lips",
      "resolve-asymmetry", "correct-asymmetry", "brow-ptosis", "crooked-nose", "straighten-nose",
      "balance", "balanced", "balancing", "asymmetric", "asymmetrical",
      "droopy-tip", "dorsal-hump", "nasal-tip", "rhinoplasty", "over-projected", "gummy-smile",
      "long-philtral-column", "philtral", "wide-chin", "under-rotated", "nose-rotation",
      "over-filled", "overfill"
    ],
    mapsToSpecificIssues: [
      "facial-asymmetry", "proportions", "harmony", "balance", "brow-asymmetry", 
      "asymmetric-lips", "asymmetric-chin", "asymmetric-jawline", "crooked-nose", "brow-ptosis",
      "droopy-tip", "dorsal-hump", "nasal-tip-too-narrow", "over-projected-chin",
      "gummy-smile", "long-philtral-column", "wide-chin", "under-rotated",
      "lower-cheeks-over-filled"
    ]
  },
  {
    id: "smooth-wrinkles-lines",
    name: "Smooth Wrinkles & Lines",
    mapsToPhotos: ["smoothen-wrinkles", "neurotoxin", "botox", "wrinkle-reduction", "wrinkles", "lines", "smooth"],
    mapsToSpecificIssues: [
      "11s", "forehead-lines", "glabella", "crow-feet", "lip-lines", "frown-lines",
      "under-eye-wrinkles", "neck-lines", "smile-lines", "nasolabial-lines", "marionette-lines",
      "bunny-lines", "perioral-wrinkles"
    ]
  },
  {
    id: "restore-volume-definition",
    name: "Restore Volume & Definition",
    mapsToPhotos: [
      "restore-volume", "fillers", "volume-restoration", "sculptra", 
      "define-jawline", "enhance-jawline", "jawline-definition", "jawline-contour", "wide-jawline",
      "volume", "hollow", "flatten", "depletion", "thin", "narrow", "sulcus", "prejowl",
      "cheekbone", "cheekbone-fullness", "labiomental", "labiomental-groove"
    ],
    mapsToSpecificIssues: [
      "hollow-cheeks", "under-eye-hollows", "thin-lips", "weak-chin", "volume-loss", 
      "ill-defined-jawline", "asymmetric-jawline", "mid-cheek-flattening", 
      "lower-cheek-volume-depletion", "under-eye-hollow", "upper-eye-hollow",
      "temporal-hollow", "flat-forehead", "lacking-philtral-column", "prejowl-sulcus",
      "narrow-jawline", "retruded-chin", "cheekbone-not-prominent",
      "deep-labiomental-groove", "shallow-labiomental-groove"
    ]
  },
  {
    id: "improve-skin-texture-tone",
    name: "Improve Skin Texture & Tone",
    mapsToPhotos: [
      "improve-skin-texture", "chemical-peel", "microneedling", "skin-texture",
      "skin-laxity", "tighten-skin", "scars", "blackheads", "oily-skin", "dry-skin",
      "neck", "submental", "platysmal", "neck-lines",
      "red-spots", "cheilosis", "dry-lips"
    ],
    mapsToSpecificIssues: [
      "large-pores", "uneven-texture", "dull-skin", "rough-skin",
      "skin-laxity", "loose-skin", "scars", "blackheads", "oily-skin", "dry-skin",
      "excess-skin", "neck-excess-skin", "loose-neck-skin", "platysmal-bands",
      "excess-submental-fullness", "jowls", "red-spots", "dry-lips"
    ]
  },
  {
    id: "eyelid-eye-area-concerns",
    name: "Eyelid & Eye Area Concerns",
    mapsToPhotos: [
      "eyelid", "eyelids", "upper-eyelid", "lower-eyelid", "blepharoplasty",
      "eye-droop", "eye-bags", "under-eye", "dark-circles", "canthal-tilt"
    ],
    mapsToSpecificIssues: [
      "upper-eyelid-droop", "lower-eyelid-excess-skin", "excess-upper-eyelid-skin",
      "lower-eyelid-bags", "under-eye-dark-circles", "negative-canthal-tilt",
      "upper-eyelid-droop", "lower-eyelid-sag"
    ]
  },
  {
    id: "reduce-dark-spots-discoloration",
    name: "Reduce Dark Spots & Discoloration",
    mapsToPhotos: ["reduce-dark-spots", "ipl", "laser", "pigmentation"],
    mapsToSpecificIssues: ["age-spots", "sun-damage", "hyperpigmentation", "melasma", "dark-spots"]
  },
  {
    id: "clear-acne-minimize-pores",
    name: "Clear Acne & Minimize Pores",
    mapsToPhotos: ["acne-treatment", "clear-acne", "pore-minimizing"],
    mapsToSpecificIssues: ["acne", "acne-scarring", "large-pores", "clogged-pores"]
  },
  {
    id: "body-contouring-fat-reduction",
    name: "Body Contouring & Fat Reduction",
    mapsToPhotos: ["body-contouring", "fat-reduction", "coolsculpting"],
    mapsToSpecificIssues: ["stubborn-fat", "love-handles", "double-chin", "excess-fat"]
  },
  {
    id: "unwanted-hair-removal",
    name: "Unwanted Hair Removal",
    mapsToPhotos: ["hair-removal", "laser-hair-removal", "ipl-hair"],
    mapsToSpecificIssues: ["unwanted-hair", "facial-hair", "body-hair"]
  },
  {
    id: "wellness-longevity",
    name: "Wellness & Longevity",
    mapsToPhotos: ["wellness", "longevity", "hormone-therapy"],
    mapsToSpecificIssues: ["hormone-imbalance", "low-energy", "longevity"]
  }
];

// Helper function to make HTTPS requests
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Normalize keyword for matching (handles hyphens and spaces)
function normalizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[-_\s]+/g, '[-\\s_]*');
}

// Check if a case matches a category
function caseMatchesCategory(caseItem, category) {
  const caseNameLower = (caseItem.name || "").toLowerCase();
  const matchingCriteriaLower = (caseItem.matchingCriteria || []).map(c => 
    typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
  );
  
  // Check name match
  const nameMatch = category.mapsToPhotos.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (caseNameLower.includes(keywordLower)) return true;
    const normalized = normalizeKeyword(keyword);
    const regex = new RegExp(normalized, 'i');
    return regex.test(caseNameLower);
  });
  
  // Check criteria match
  const criteriaMatch = category.mapsToPhotos.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    return matchingCriteriaLower.some(criteria => {
      if (criteria.includes(keywordLower)) return true;
      const normalized = normalizeKeyword(keyword);
      const regex = new RegExp(normalized, 'i');
      return regex.test(criteria);
    });
  });
  
  // Check issue match
  let issueMatch = false;
  if (category.mapsToSpecificIssues && category.mapsToSpecificIssues.length > 0) {
    const solvedIssuesLower = (caseItem.solved || []).map(issue => 
      typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
    );
    const directMatchingIssuesLower = (caseItem.directMatchingIssues || []).map(issue => 
      typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
    );
    const allCaseIssuesLower = [...solvedIssuesLower, ...directMatchingIssuesLower, ...matchingCriteriaLower];
    
    issueMatch = category.mapsToSpecificIssues.some(issueKeyword => {
      const issueKeywordLower = issueKeyword.toLowerCase();
      return allCaseIssuesLower.some(caseIssue => {
        if (caseIssue.includes(issueKeywordLower) || issueKeywordLower.includes(caseIssue)) return true;
        const normalized = normalizeKeyword(issueKeyword);
        const regex = new RegExp(normalized, 'i');
        return regex.test(caseIssue);
      });
    });
  }
  
  return nameMatch || criteriaMatch || issueMatch;
}

// Escape CSV values
function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Main function
async function analyzeCases() {
  console.log("Fetching cases from Airtable...");
  
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_URL}?offset=${offset}`
      : AIRTABLE_API_URL;
    
    const response = await fetch(url);
    allRecords = allRecords.concat(response.records);
    offset = response.offset;
    
    console.log(`Fetched ${allRecords.length} records so far...`);
  } while (offset);
  
  console.log(`\nTotal records: ${allRecords.length}`);
  console.log("\nAnalyzing case categories...\n");
  
  // Analyze each case
  const results = [];
  
  for (const record of allRecords) {
    const caseName = record.fields.Name || record.fields["Case Name"] || "Unnamed Case";
    const caseId = record.id;
    
    // Extract case data
    const caseItem = {
      id: caseId,
      name: caseName,
      matchingCriteria: record.fields.Matching ? 
        (Array.isArray(record.fields.Matching) ? record.fields.Matching : [record.fields.Matching]) : [],
      solved: record.fields.Solved ? 
        (Array.isArray(record.fields.Solved) ? record.fields.Solved : [record.fields.Solved]) : [],
      directMatchingIssues: record.fields["Direct Matching Issues"] ?
        (Array.isArray(record.fields["Direct Matching Issues"]) ? record.fields["Direct Matching Issues"] : [record.fields["Direct Matching Issues"]]) : []
    };
    
    // Check which categories this case matches
    const matchedCategories = [];
    
    for (const category of HIGH_LEVEL_CONCERNS) {
      if (caseMatchesCategory(caseItem, category)) {
        matchedCategories.push(category.name);
      }
    }
    
    results.push({
      caseId: caseId,
      caseName: caseName,
      matchedCategories: matchedCategories,
      matchingCriteria: (caseItem.matchingCriteria || []).join("; "),
      solved: (caseItem.solved || []).join("; "),
      directMatchingIssues: (caseItem.directMatchingIssues || []).join("; ")
    });
  }
  
  // Generate CSV
  const csvLines = [];
  
  // Header
  csvLines.push("Case ID,Case Name,Matched Categories,Matching Criteria,Solved Issues,Direct Matching Issues");
  
  // Data rows
  for (const result of results) {
    csvLines.push([
      escapeCsv(result.caseId),
      escapeCsv(result.caseName),
      escapeCsv(result.matchedCategories.join("; ")),
      escapeCsv(result.matchingCriteria),
      escapeCsv(result.solved),
      escapeCsv(result.directMatchingIssues)
    ].join(","));
  }
  
  // Write to file
  const csvContent = csvLines.join("\n");
  const filename = "case-category-analysis.csv";
  fs.writeFileSync(filename, csvContent, "utf8");
  
  console.log(`\n✅ Analysis complete! Results saved to ${filename}`);
  
  // Print summary
  console.log("\n=== Summary ===");
  const categoryCounts = {};
  for (const result of results) {
    for (const category of result.matchedCategories) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }
  
  console.log("\nCases per category:");
  for (const category of HIGH_LEVEL_CONCERNS) {
    const count = categoryCounts[category.name] || 0;
    console.log(`  ${category.name}: ${count} cases`);
  }
  
  const unmatchedCount = results.filter(r => r.matchedCategories.length === 0).length;
  console.log(`\n  Unmatched cases: ${unmatchedCount}`);
  
  console.log(`\nTotal cases analyzed: ${results.length}`);
}

// Run the analysis
analyzeCases().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});


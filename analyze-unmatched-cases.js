/**
 * Script to analyze unmatched cases and suggest improvements
 */

const fs = require("fs");

// Read the CSV
const csvContent = fs.readFileSync("case-category-analysis.csv", "utf8");
const lines = csvContent.split("\n").slice(1); // Skip header

const unmatched = [];
const matched = [];

for (const line of lines) {
  if (!line.trim()) continue;
  
  const [caseId, caseName, matchedCategories, matchingCriteria, solved, directMatching] = line.split(",");
  
  if (!matchedCategories || matchedCategories.trim() === "") {
    unmatched.push({
      caseName: caseName,
      matchingCriteria: matchingCriteria,
      solved: solved,
      directMatching: directMatching
    });
  } else {
    matched.push({
      caseName: caseName,
      categories: matchedCategories
    });
  }
}

console.log(`\n=== UNMATCHED CASES ANALYSIS ===\n`);
console.log(`Total unmatched: ${unmatched.length}\n`);

// Analyze patterns in unmatched cases
const issuePatterns = {};
const keywordPatterns = {};

for (const case_ of unmatched) {
  const name = case_.caseName.toLowerCase();
  const criteria = (case_.matchingCriteria || "").toLowerCase();
  const solved = (case_.solved || "").toLowerCase();
  
  // Extract key terms
  const allText = `${name} ${criteria} ${solved}`;
  
  // Common issue patterns
  const patterns = [
    { pattern: /eye|eyelid|under.?eye/i, category: "Eye Issues" },
    { pattern: /cheek|mid.?cheek|lower.?cheek/i, category: "Cheek Issues" },
    { pattern: /lip|lips|philtral|gummy/i, category: "Lip Issues" },
    { pattern: /chin|jawline|jowl|prejowl|submentum/i, category: "Jaw/Chin Issues" },
    { pattern: /nose|nasal|dorsal|rhinoplasty|tip/i, category: "Nose Issues" },
    { pattern: /neck|submental|platysmal/i, category: "Neck Issues" },
    { pattern: /forehead|brow|glabella|temple/i, category: "Forehead/Brow Issues" },
    { pattern: /volume|hollow|flatten|depletion|thin/i, category: "Volume Issues" },
    { pattern: /wrinkle|line|smooth/i, category: "Wrinkle Issues" },
    { pattern: /skin|texture|scar|spot|dark|red/i, category: "Skin Issues" },
    { pattern: /excess|droop|sag|ptosis|loose/i, category: "Sagging/Skin Issues" },
    { pattern: /asymmetr|balance|crooked/i, category: "Symmetry Issues" }
  ];
  
  for (const { pattern, category } of patterns) {
    if (pattern.test(allText)) {
      issuePatterns[category] = (issuePatterns[category] || 0) + 1;
    }
  }
  
  // Extract specific issues from matching criteria
  if (criteria) {
    const issues = criteria.split(";").map(i => i.trim()).filter(i => i);
    for (const issue of issues) {
      keywordPatterns[issue] = (keywordPatterns[issue] || 0) + 1;
    }
  }
}

console.log("Issue Categories in Unmatched Cases:");
console.log("=====================================");
const sortedPatterns = Object.entries(issuePatterns)
  .sort((a, b) => b[1] - a[1]);
for (const [category, count] of sortedPatterns) {
  console.log(`  ${category}: ${count} cases`);
}

console.log("\n\nTop Matching Criteria in Unmatched Cases:");
console.log("==========================================");
const sortedKeywords = Object.entries(keywordPatterns)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);
for (const [keyword, count] of sortedKeywords) {
  console.log(`  ${keyword}: ${count} cases`);
}

console.log("\n\nSample Unmatched Cases by Category:");
console.log("=====================================");

// Define patterns again for grouping
const groupingPatterns = [
  { pattern: /eye|eyelid|under.?eye/i, category: "Eye Issues" },
  { pattern: /cheek|mid.?cheek|lower.?cheek/i, category: "Cheek Issues" },
  { pattern: /lip|lips|philtral|gummy/i, category: "Lip Issues" },
  { pattern: /chin|jawline|jowl|prejowl|submentum/i, category: "Jaw/Chin Issues" },
  { pattern: /nose|nasal|dorsal|rhinoplasty|tip/i, category: "Nose Issues" },
  { pattern: /neck|submental|platysmal/i, category: "Neck Issues" },
  { pattern: /forehead|brow|glabella|temple/i, category: "Forehead/Brow Issues" },
  { pattern: /volume|hollow|flatten|depletion|thin/i, category: "Volume Issues" },
  { pattern: /wrinkle|line|smooth/i, category: "Wrinkle Issues" },
  { pattern: /skin|texture|scar|spot|dark|red/i, category: "Skin Issues" },
  { pattern: /excess|droop|sag|ptosis|loose/i, category: "Sagging/Skin Issues" },
  { pattern: /asymmetr|balance|crooked/i, category: "Symmetry Issues" }
];

// Group by pattern
const grouped = {};
for (const case_ of unmatched) {
  const name = case_.caseName.toLowerCase();
  const criteria = (case_.matchingCriteria || "").toLowerCase();
  const allText = `${name} ${criteria}`;
  
  let categorized = false;
  for (const { pattern, category } of groupingPatterns) {
    if (pattern.test(allText)) {
      if (!grouped[category]) grouped[category] = [];
      if (grouped[category].length < 5) {
        grouped[category].push(case_.caseName);
      }
      categorized = true;
      break;
    }
  }
  
  if (!categorized) {
    if (!grouped["Other"]) grouped["Other"] = [];
    if (grouped["Other"].length < 5) {
      grouped["Other"].push(case_.caseName);
    }
  }
}

for (const [category, cases] of Object.entries(grouped)) {
  console.log(`\n${category}:`);
  for (const caseName of cases) {
    console.log(`  - ${caseName}`);
  }
}

// Recommendations
console.log("\n\n=== RECOMMENDATIONS ===");
console.log("\n1. EXPAND EXISTING CATEGORIES:");
console.log("   - 'Restore Volume & Definition' should include:");
console.log("     * Mid Cheek Flattening");
console.log("     * Lower Cheek Volume Depletion");
console.log("     * Under Eye Hollow");
console.log("     * Thin Lips");
console.log("     * Lacking Philtral Column");
console.log("     * Prejowl Sulcus");
console.log("     * Narrow Jawline");
console.log("");
console.log("   - 'Smooth Wrinkles & Lines' should include:");
console.log("     * Under Eye Wrinkles");
console.log("     * Neck Lines");
console.log("     * Smile Lines");
console.log("");
console.log("   - 'Facial Balancing' should include:");
console.log("     * Droopy Tip (nose asymmetry)");
console.log("     * Dorsal Hump (nose asymmetry)");
console.log("     * Over-Projected Chin");
console.log("     * Long Philtral Column");
console.log("     * Gummy Smile");
console.log("");
console.log("2. POTENTIAL NEW CATEGORY:");
console.log("   - 'Eyelid & Eye Area Concerns'");
console.log("     * Upper Eyelid Droop");
console.log("     * Lower Eyelid - Excess Skin");
console.log("     * Lower Eyelid Bags");
console.log("     * Excess Upper Eyelid Skin");
console.log("     * Under Eye Dark Circles");
console.log("     * Negative Canthal Tilt");
console.log("");
console.log("3. IMPROVE KEYWORD MATCHING:");
console.log("   - Add more specific issue names to mapsToSpecificIssues");
console.log("   - Use the 'Matching Criteria' field more effectively");
console.log("   - Consider fuzzy matching for similar terms");


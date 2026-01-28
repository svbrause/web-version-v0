/**
 * Analyze the remaining 19 unmatched cases
 */

const fs = require("fs");

const csvContent = fs.readFileSync("case-category-analysis.csv", "utf8");
const lines = csvContent.split("\n").slice(1);

const unmatched = [];

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
  }
}

console.log(`\n=== REMAINING ${unmatched.length} UNMATCHED CASES ===\n`);

// Group by pattern
const groups = {
  "Dry Lips": [],
  "Cheekbone Issues": [],
  "Labiomental Groove": [],
  "Wide Chin": [],
  "Nose Rotation": [],
  "Cheilosis": [],
  "Red Spots": [],
  "Over-Filled": [],
  "Other": []
};

for (const case_ of unmatched) {
  const name = case_.caseName.toLowerCase();
  const criteria = (case_.matchingCriteria || "").toLowerCase();
  
  if (name.includes("dry lips") || criteria.includes("dry lips")) {
    groups["Dry Lips"].push(case_);
  } else if (name.includes("cheekbone") || criteria.includes("cheekbone")) {
    groups["Cheekbone Issues"].push(case_);
  } else if (name.includes("labiomental")) {
    groups["Labiomental Groove"].push(case_);
  } else if (name.includes("wide chin")) {
    groups["Wide Chin"].push(case_);
  } else if (name.includes("under-rotated") || criteria.includes("under-rotated")) {
    groups["Nose Rotation"].push(case_);
  } else if (name.includes("cheilosis")) {
    groups["Cheilosis"].push(case_);
  } else if (name.includes("red spots") || criteria.includes("red spots")) {
    groups["Red Spots"].push(case_);
  } else if (name.includes("over-fill") || name.includes("over fill")) {
    groups["Over-Filled"].push(case_);
  } else {
    groups["Other"].push(case_);
  }
}

console.log("Grouped Analysis:\n");
for (const [group, cases] of Object.entries(groups)) {
  if (cases.length > 0) {
    console.log(`${group} (${cases.length} cases):`);
    cases.forEach(c => {
      console.log(`  - ${c.caseName}`);
      if (c.matchingCriteria) console.log(`    Criteria: ${c.matchingCriteria}`);
    });
    console.log("");
  }
}

console.log("\n=== RECOMMENDATIONS ===\n");

console.log("1. DRY LIPS (2 cases) → 'Improve Skin Texture & Tone'");
console.log("   Add: 'dry-lips' to mapsToSpecificIssues");
console.log("   Reason: Dry lips is a skin condition, not volume-related\n");

console.log("2. CHEEKBONE - NOT PROMINENT (5 cases) → 'Restore Volume & Definition'");
console.log("   Add: 'cheekbone', 'cheekbone-fullness' to mapsToPhotos");
console.log("   Add: 'cheekbone-not-prominent' to mapsToSpecificIssues");
console.log("   Reason: Enhancing cheekbone prominence is volume/definition\n");

console.log("3. LABIOMENTAL GROOVE (5 cases) → 'Restore Volume & Definition'");
console.log("   Add: 'labiomental', 'labiomental-groove' to mapsToPhotos");
console.log("   Add: 'deep-labiomental-groove', 'shallow-labiomental-groove' to mapsToSpecificIssues");
console.log("   Reason: Groove depth is about chin/volume definition\n");

console.log("4. WIDE CHIN (2 cases) → 'Facial Balancing'");
console.log("   Add: 'wide-chin' to mapsToPhotos");
console.log("   Add: 'wide-chin' to mapsToSpecificIssues");
console.log("   Reason: Chin width is about facial proportions/balancing\n");

console.log("5. UNDER-ROTATED NOSE (1 case) → 'Facial Balancing'");
console.log("   Add: 'under-rotated', 'nose-rotation' to mapsToPhotos");
console.log("   Add: 'under-rotated' to mapsToSpecificIssues");
console.log("   Reason: Nose rotation is about facial symmetry/balance\n");

console.log("6. CHEILOSIS (2 cases) → 'Improve Skin Texture & Tone'");
console.log("   Add: 'cheilosis' to mapsToPhotos");
console.log("   Reason: Cheilosis is a lip skin condition\n");

console.log("7. RED SPOTS (1 case) → 'Improve Skin Texture & Tone'");
console.log("   Already has 'red-spots' in mapsToSpecificIssues - check matching logic");
console.log("   May need to add 'red-spots' to mapsToPhotos as well\n");

console.log("8. LOWER CHEEK OVER-FILLED (1 case) → 'Facial Balancing'");
console.log("   Add: 'over-filled', 'overfill' to mapsToPhotos");
console.log("   Reason: Correcting over-filling is about restoring balance\n");

console.log("\n=== SUMMARY ===");
console.log(`Total unmatched: ${unmatched.length}`);
console.log("All can be matched to existing categories with keyword additions.");
console.log("No new categories needed.");





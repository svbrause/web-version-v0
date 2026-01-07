/**
 * Convert prevalence CSV data to JavaScript object
 *
 * This script reads the CSV files and creates a JavaScript module
 * that can be used in the app to display prevalence statistics.
 */

const fs = require("fs");
const path = require("path");

// Read the CSV files
const overallPath = path.join(
  __dirname,
  "../test2/issue_prevalence_overall.csv"
);
const ageRangePath = path.join(
  __dirname,
  "../test2/issue_prevalence_by_age_range.csv"
);

const overallData = fs.readFileSync(overallPath, "utf8");
const ageRangeData = fs.readFileSync(ageRangePath, "utf8");

// Parse overall prevalence
const overallLines = overallData.trim().split("\n");
const overallPrevalence = {};

for (let i = 1; i < overallLines.length; i++) {
  const line = overallLines[i];
  const [issue, count, percentage, ageCorrelation] = line.split(",");
  if (issue && percentage) {
    overallPrevalence[issue.trim()] = {
      percentage: parseFloat(percentage),
      count: parseInt(count),
      ageCorrelation: ageCorrelation ? parseFloat(ageCorrelation) : null,
    };
  }
}

// Parse age range prevalence
const ageRangeLines = ageRangeData.trim().split("\n");
const ageRangePrevalence = {};

for (let i = 1; i < ageRangeLines.length; i++) {
  const line = ageRangeLines[i];
  const [ageRange, issue, count, totalInRange, percentage] = line.split(",");
  if (issue && ageRange && percentage) {
    const issueName = issue.trim();
    const range = ageRange.trim();

    if (!ageRangePrevalence[issueName]) {
      ageRangePrevalence[issueName] = {};
    }

    ageRangePrevalence[issueName][range] = {
      percentage: parseFloat(percentage),
      count: parseInt(count),
      totalInRange: parseInt(totalInRange),
    };
  }
}

// Create JavaScript module
const jsContent = `/**
 * Issue Prevalence Data
 * 
 * Generated from analysis of 869 patient records
 * Data source: /Users/sambrause/Downloads/Photos-1-001/test2/
 * 
 * Usage:
 *   const prevalence = getIssuePrevalence('Under Eye Hollow');
 *   const agePrevalence = getIssuePrevalenceForAge('Under Eye Hollow', 35);
 */

// Overall prevalence (percentage of all 869 records)
export const overallPrevalence = ${JSON.stringify(overallPrevalence, null, 2)};

// Prevalence by age range
export const ageRangePrevalence = ${JSON.stringify(
  ageRangePrevalence,
  null,
  2
)};

// Get prevalence for an issue
export function getIssuePrevalence(issueName) {
  return overallPrevalence[issueName] || null;
}

// Get prevalence for an issue at a specific age
export function getIssuePrevalenceForAge(issueName, age) {
  if (!ageRangePrevalence[issueName]) return null;
  
  // Determine age range
  let range;
  if (age < 20) range = '10-19';
  else if (age < 30) range = '20-29';
  else if (age < 40) range = '30-39';
  else if (age < 50) range = '40-49';
  else if (age < 60) range = '50-59';
  else if (age < 70) range = '60-69';
  else range = '70-79';
  
  return ageRangePrevalence[issueName][range] || null;
}

// Get prevalence category (common, uncommon, rare)
export function getPrevalenceCategory(percentage) {
  if (percentage >= 50) return 'very-common';
  if (percentage >= 30) return 'common';
  if (percentage >= 15) return 'moderate';
  if (percentage >= 5) return 'uncommon';
  return 'rare';
}

// Get human-readable prevalence description
export function getPrevalenceDescription(percentage, agePercentage = null) {
  if (agePercentage !== null) {
    // Use age-specific percentage
    if (agePercentage >= 70) return 'Very common for your age';
    if (agePercentage >= 50) return 'Common for your age';
    if (agePercentage >= 30) return 'Moderately common for your age';
    if (agePercentage >= 15) return 'Somewhat uncommon for your age';
    return 'Uncommon for your age';
  }
  
  // Use overall percentage
  if (percentage >= 70) return 'Very common';
  if (percentage >= 50) return 'Common';
  if (percentage >= 30) return 'Moderately common';
  if (percentage >= 15) return 'Somewhat uncommon';
  return 'Uncommon';
}
`;

// Write to file
const outputPath = path.join(__dirname, "issue-prevalence-data.js");
fs.writeFileSync(outputPath, jsContent);

console.log("✓ Generated issue-prevalence-data.js");
console.log(
  `  - ${Object.keys(overallPrevalence).length} issues with overall prevalence`
);
console.log(
  `  - ${Object.keys(ageRangePrevalence).length} issues with age range data`
);

// Also create a JSON version for easier loading
const jsonData = {
  overall: overallPrevalence,
  byAgeRange: ageRangePrevalence,
  generatedAt: new Date().toISOString(),
};

const jsonPath = path.join(__dirname, "issue-prevalence-data.json");
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

console.log("✓ Generated issue-prevalence-data.json");










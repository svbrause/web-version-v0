/**
 * Collaborative Story Generation Tool
 * 
 * This script helps generate "Story Title" and "Story Detailed" content
 * for cases in Airtable. It can:
 * 1. Fetch cases from Airtable
 * 2. Generate story content based on case data
 * 3. Output in a format easy to copy to Airtable
 * 4. Support manual review and refinement
 * 
 * Usage: node generate-stories.js
 */

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
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Helper function to make HTTPS requests (Node.js compatible)
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => jsonData,
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => ({ error: 'Invalid JSON', data }),
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Fetch all records from Airtable
async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;
  let pageCount = 0;

  do {
    pageCount++;
    let url = AIRTABLE_API_URL;
    const params = new URLSearchParams();
    params.append("pageSize", "100");
    if (offset) {
      params.append("offset", offset);
    }
    url += "?" + params.toString();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    const pageRecords = data.records || [];
    allRecords = allRecords.concat(pageRecords);
    offset = data.offset || null;

    console.log(`Fetched page ${pageCount}: ${pageRecords.length} records (total: ${allRecords.length})`);
  } while (offset !== null);

  return allRecords;
}

// Generate a story title based on case data
function generateStoryTitle(fields) {
  const name = fields.Name || "";
  const treatment = fields["Name (from Treatments)"] || fields.Treatments || "";
  const issue = fields["Name (from Issues)"] || fields.Issues || "";
  
  // Extract key treatment name
  let treatmentName = "";
  if (Array.isArray(treatment)) {
    treatmentName = treatment[0] || "";
  } else if (typeof treatment === "string") {
    treatmentName = treatment;
  }
  
  // Extract key issue
  let issueName = "";
  if (Array.isArray(issue)) {
    issueName = issue[0] || "";
  } else if (typeof issue === "string") {
    issueName = issue;
  }
  
  // Generate title based on case name pattern
  // Most cases follow: "Resolve [Issue] with [Treatment]"
  if (name.includes("Resolve")) {
    return name; // Use existing name as title
  }
  
  // Otherwise create a compelling title
  if (issueName && treatmentName) {
    return `Transform ${issueName} with ${treatmentName}`;
  } else if (issueName) {
    return `Achieve Beautiful Results for ${issueName}`;
  } else if (treatmentName) {
    return `Exceptional Results with ${treatmentName}`;
  }
  
  return name || "Patient Success Story";
}

// Generate detailed story based on case data
function generateDetailedStory(fields) {
  const name = fields.Name || "";
  const treatment = fields["Name (from Treatments)"] || fields.Treatments || "";
  const issue = fields["Name (from Issues)"] || fields.Issues || "";
  const solved = fields.Solved || fields["Issues Solved"] || "";
  
  // Extract values
  let treatmentName = "";
  if (Array.isArray(treatment)) {
    treatmentName = treatment[0] || "";
  } else if (typeof treatment === "string") {
    treatmentName = treatment;
  }
  
  let issueName = "";
  if (Array.isArray(issue)) {
    issueName = issue[0] || "";
  } else if (typeof issue === "string") {
    issueName = issue;
  }
  
  let solvedIssues = [];
  if (Array.isArray(solved)) {
    solvedIssues = solved;
  } else if (typeof solved === "string" && solved.trim()) {
    solvedIssues = solved.split(",").map(s => s.trim()).filter(s => s);
  }
  
  // Build story
  let story = "";
  
  // Opening - patient concern
  if (issueName) {
    story += `This patient came to us seeking to address ${issueName.toLowerCase()}. `;
  } else {
    story += `This patient came to us with specific aesthetic goals in mind. `;
  }
  
  // Treatment approach
  if (treatmentName) {
    story += `After a thorough consultation, we recommended ${treatmentName} as the ideal treatment approach. `;
  } else {
    story += `Through a comprehensive consultation, we developed a personalized treatment plan tailored to their unique needs. `;
  }
  
  // Results
  if (solvedIssues.length > 0) {
    const issuesList = solvedIssues.length === 1 
      ? solvedIssues[0].toLowerCase()
      : solvedIssues.slice(0, -1).join(", ").toLowerCase() + ", and " + solvedIssues[solvedIssues.length - 1].toLowerCase();
    story += `The treatment was performed with precision and care, resulting in significant improvement in ${issuesList}. `;
  } else if (issueName) {
    story += `The treatment was performed with precision and care, resulting in beautiful, natural-looking improvement. `;
  } else {
    story += `The treatment was performed with precision and care, resulting in beautiful, natural-looking results. `;
  }
  
  // Closing
  story += `The patient was thrilled with their results, which exceeded expectations and achieved their aesthetic goals.`;
  
  return story;
}

// Main function
async function main() {
  console.log("Fetching cases from Airtable...\n");
  
  const records = await fetchAllRecords();
  console.log(`\nFound ${records.length} total cases\n`);
  
  // Process each case
  const results = [];
  
  for (const record of records) {
    const fields = record.fields;
    const name = fields.Name || "Unnamed Case";
    const existingTitle = fields["Story Title"] || "";
    const existingStory = fields["Story Detailed"] || "";
    
    // Skip if both already exist
    if (existingTitle && existingStory) {
      console.log(`✓ ${name} - Already has story content`);
      continue;
    }
    
    // Generate content
    const storyTitle = existingTitle || generateStoryTitle(fields);
    const storyDetailed = existingStory || generateDetailedStory(fields);
    
    results.push({
      recordId: record.id,
      name: name,
      storyTitle: storyTitle,
      storyDetailed: storyDetailed,
      hasExistingTitle: !!existingTitle,
      hasExistingStory: !!existingStory,
    });
    
    console.log(`\n📝 ${name}`);
    console.log(`   Title: ${storyTitle}`);
    console.log(`   Story: ${storyDetailed.substring(0, 100)}...`);
  }
  
  // Output results in multiple formats
  console.log("\n\n" + "=".repeat(80));
  console.log("GENERATION RESULTS");
  console.log("=".repeat(80) + "\n");
  
  // Format 1: CSV for easy import
  console.log("CSV Format (copy to spreadsheet, then to Airtable):");
  console.log("Record ID,Name,Story Title,Story Detailed\n");
  results.forEach(r => {
    console.log(`"${r.recordId}","${r.name}","${r.storyTitle}","${r.storyDetailed}"`);
  });
  
  console.log("\n\n" + "=".repeat(80));
  console.log("JSON Format (for programmatic updates):");
  console.log("=".repeat(80) + "\n");
  console.log(JSON.stringify(results, null, 2));
  
  console.log("\n\n" + "=".repeat(80));
  console.log("AIRTABLE UPDATE COMMANDS");
  console.log("=".repeat(80) + "\n");
  console.log("To update Airtable, you can use the Airtable API or manually copy the values.");
  console.log("\nFor each case, update:");
  console.log("  - Story Title: [generated title]");
  console.log("  - Story Detailed: [generated story]");
  
  // Save to file
  const output = {
    generatedAt: new Date().toISOString(),
    totalCases: records.length,
    casesNeedingContent: results.length,
    results: results
  };
  
  fs.writeFileSync('generated-stories.json', JSON.stringify(output, null, 2));
  console.log("\n✓ Results saved to generated-stories.json");
  
  // Also create a markdown file for easy review
  let markdown = "# Generated Story Content\n\n";
  markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total cases: ${records.length}\n`;
  markdown += `Cases needing content: ${results.length}\n\n`;
  markdown += "---\n\n";
  
  results.forEach((r, index) => {
    markdown += `## ${index + 1}. ${r.name}\n\n`;
    markdown += `**Record ID:** \`${r.recordId}\`\n\n`;
    markdown += `**Story Title:**\n${r.storyTitle}\n\n`;
    markdown += `**Story Detailed:**\n${r.storyDetailed}\n\n`;
    markdown += "---\n\n";
  });
  
  fs.writeFileSync('generated-stories.md', markdown);
  console.log("✓ Results also saved to generated-stories.md for easy review");
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateStoryTitle, generateDetailedStory, fetchAllRecords };


/**
 * Upload Generated Stories to Airtable
 *
 * This script reads generated-stories.json and uploads the Story Title
 * and Story Detailed content to the Airtable Photos table.
 *
 * Usage: node upload-stories-to-airtable.js
 */

const https = require("https");
const fs = require("fs");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appXblSpAMBQskgzB";

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Helper function to make HTTPS requests
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
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
            json: async () => ({ error: "Invalid JSON", data }),
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Update records in batches (Airtable allows up to 10 records per request)
async function updateRecordsBatch(records) {
  const updates = records.map((record) => ({
    id: record.recordId,
    fields: {
      "Story Title": record.storyTitle,
      "Story Detailed": record.storyDetailed,
    },
  }));

  const body = JSON.stringify({ records: updates });

  const response = await fetch(AIRTABLE_API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Airtable API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return await response.json();
}

// Main function
async function main() {
  console.log("Reading generated stories...\n");

  // Read the generated stories
  const storiesData = JSON.parse(
    fs.readFileSync("generated-stories.json", "utf8")
  );
  const records = storiesData.results || [];

  console.log(`Found ${records.length} records to update\n`);

  if (records.length === 0) {
    console.log("No records to update. Exiting.");
    return;
  }

  // Confirm before proceeding
  console.log("This will update the following fields in Airtable:");
  console.log("  - Story Title");
  console.log("  - Story Detailed");
  console.log(`\nReady to update ${records.length} records.`);
  console.log("Starting upload...\n");

  // Process in batches of 10 (Airtable limit)
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNum = i + 1;
    const totalBatches = batches.length;

    try {
      console.log(
        `Processing batch ${batchNum}/${totalBatches} (${batch.length} records)...`
      );

      const result = await updateRecordsBatch(batch);

      // Count successful updates
      const updated = result.records ? result.records.length : batch.length;
      successCount += updated;

      console.log(`  ✓ Successfully updated ${updated} records`);

      // Rate limiting: Airtable allows 5 requests per second
      // Wait 200ms between batches to stay under limit
      if (i < batches.length - 1) {
        await sleep(200);
      }
    } catch (error) {
      errorCount += batch.length;
      errors.push({
        batch: batchNum,
        records: batch.map((r) => r.name),
        error: error.message,
      });

      console.log(`  ✗ Error updating batch ${batchNum}: ${error.message}`);

      // Continue with next batch even if this one fails
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("UPLOAD SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total records: ${records.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. Batch ${err.batch}:`);
      console.log(`   Records: ${err.records.join(", ")}`);
      console.log(`   Error: ${err.error}`);
    });
  }

  if (successCount > 0) {
    console.log(
      "\n✓ Upload complete! Check your Airtable base to verify the updates."
    );
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("\n✗ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { updateRecordsBatch, fetch };










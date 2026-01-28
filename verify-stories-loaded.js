/**
 * Verification Script: Check if Story Title and Story Detailed are loading from Airtable
 *
 * This script fetches a few records from Airtable and verifies that
 * the Story Title and Story Detailed fields are present and being loaded correctly.
 *
 * Usage: node verify-stories-loaded.js
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

async function verifyStories() {
  console.log(
    "Verifying Story Title and Story Detailed fields in Airtable...\n"
  );

  try {
    // Fetch first 10 records
    const url = `${AIRTABLE_API_URL}?pageSize=10`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    const records = data.records || [];

    console.log(`Fetched ${records.length} records for verification\n`);

    let withStoryTitle = 0;
    let withStoryDetailed = 0;
    let withBoth = 0;
    let withNeither = 0;

    console.log("=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80) + "\n");

    records.forEach((record, index) => {
      const fields = record.fields || {};
      const name = fields.Name || `Record ${index + 1}`;
      const hasStoryTitle = !!fields["Story Title"];
      const hasStoryDetailed = !!fields["Story Detailed"];

      if (hasStoryTitle) withStoryTitle++;
      if (hasStoryDetailed) withStoryDetailed++;
      if (hasStoryTitle && hasStoryDetailed) withBoth++;
      if (!hasStoryTitle && !hasStoryDetailed) withNeither++;

      console.log(`${index + 1}. "${name}"`);
      console.log(
        `   Story Title: ${hasStoryTitle ? "✓" : "✗"} ${
          hasStoryTitle
            ? `"${fields["Story Title"]?.substring(0, 60)}..."`
            : "MISSING"
        }`
      );
      console.log(
        `   Story Detailed: ${hasStoryDetailed ? "✓" : "✗"} ${
          hasStoryDetailed
            ? `"${fields["Story Detailed"]?.substring(0, 60)}..."`
            : "MISSING"
        }`
      );
      console.log("");
    });

    console.log("=".repeat(80));
    console.log("SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total records checked: ${records.length}`);
    console.log(
      `Records with Story Title: ${withStoryTitle} (${Math.round(
        (withStoryTitle / records.length) * 100
      )}%)`
    );
    console.log(
      `Records with Story Detailed: ${withStoryDetailed} (${Math.round(
        (withStoryDetailed / records.length) * 100
      )}%)`
    );
    console.log(
      `Records with both: ${withBoth} (${Math.round(
        (withBoth / records.length) * 100
      )}%)`
    );
    console.log(
      `Records with neither: ${withNeither} (${Math.round(
        (withNeither / records.length) * 100
      )}%)`
    );

    if (withBoth === records.length) {
      console.log(
        "\n✓ SUCCESS: All records have both Story Title and Story Detailed!"
      );
    } else if (withBoth > 0) {
      console.log(
        `\n⚠ PARTIAL: ${withBoth} records have both fields, ${
          records.length - withBoth
        } are missing one or both.`
      );
    } else {
      console.log(
        "\n✗ WARNING: No records have both Story Title and Story Detailed fields."
      );
    }

    // Check field names
    if (records.length > 0) {
      const firstRecordFields = Object.keys(records[0].fields || {});
      console.log("\n" + "=".repeat(80));
      console.log("AVAILABLE FIELDS IN FIRST RECORD");
      console.log("=".repeat(80));
      console.log("Field names:", firstRecordFields.join(", "));

      const storyFields = firstRecordFields.filter(
        (f) =>
          f.toLowerCase().includes("story") ||
          f.toLowerCase().includes("title") ||
          f.toLowerCase().includes("headline")
      );
      if (storyFields.length > 0) {
        console.log("\nStory-related fields found:", storyFields.join(", "));
      }
    }
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyStories().catch((error) => {
    console.error("\n✗ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { verifyStories };










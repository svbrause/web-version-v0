/**
 * Script to check if demographic fields exist in Airtable Photos table
 * and verify they're configured correctly
 * 
 * Usage: node check-airtable-fields.js
 */

const https = require("https");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_BASE_ID = "appXblSpAMBQskgzB";
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Expected demographic fields
const EXPECTED_FIELDS = {
  "Age": {
    type: "number",
    description: "Patient age in years"
  },
  "Skin Tone": {
    type: "singleSelect",
    options: ["light", "fair", "medium", "tan", "brown", "deep"],
    description: "Skin tone category"
  },
  "Ethnic Background": {
    type: "singleSelect",
    options: ["asian", "black", "hispanic/latino", "middle eastern", "white", "mixed", "other"],
    description: "Ethnic background"
  },
  "Skin Type": {
    type: "singleSelect",
    options: ["dry", "oily", "balanced", "combination"],
    description: "Skin type"
  },
  "Sun Response": {
    type: "singleSelect",
    options: ["always burns", "usually burns", "sometimes tans", "usually tans", "always tans", "rarely burns"],
    description: "How skin responds to sun"
  }
};

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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              ok: true,
              status: res.statusCode,
              json: async () => jsonData,
              text: async () => data,
            });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          resolve({
            ok: true,
            status: res.statusCode,
            json: async () => ({ raw: data }),
            text: async () => data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Get table schema from Airtable (requires metadata API or we can infer from records)
async function checkFields() {
  console.log("Checking Airtable Photos table for demographic fields...\n");
  
  try {
    // Fetch more records to see what fields exist (including empty ones)
    console.log("Fetching records to analyze field structure...");
    console.log("Note: Fetching up to 50 records to catch fields that might be empty in first few records...\n");
    const response = await fetch(`${AIRTABLE_API_URL}?maxRecords=50`);
    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
      console.error("No records found in Photos table");
      return;
    }
    
    // Get all unique field names from records
    const allFields = new Set();
    data.records.forEach(record => {
      Object.keys(record.fields || {}).forEach(field => allFields.add(field));
    });
    
    console.log(`Found ${allFields.size} fields in Photos table\n`);
    console.log("All fields found:");
    const sortedFields = Array.from(allFields).sort();
    sortedFields.forEach(field => {
      console.log(`  - "${field}"`);
    });
    
    // Check for similar field names (case-insensitive, partial matches)
    console.log("\n" + "=".repeat(60));
    console.log("Checking for similar field names (case-insensitive):\n");
    
    const fieldNamesLower = sortedFields.map(f => f.toLowerCase());
    const expectedFieldsLower = Object.keys(EXPECTED_FIELDS).map(f => f.toLowerCase());
    
    expectedFieldsLower.forEach(expectedLower => {
      const exactMatch = sortedFields.find(f => f.toLowerCase() === expectedLower);
      if (exactMatch && exactMatch !== Object.keys(EXPECTED_FIELDS).find(k => k.toLowerCase() === expectedLower)) {
        console.log(`⚠ Found similar field: "${exactMatch}" (expected: "${Object.keys(EXPECTED_FIELDS).find(k => k.toLowerCase() === expectedLower)}")`);
      }
      
      // Check for partial matches
      const partialMatches = sortedFields.filter(f => 
        f.toLowerCase().includes(expectedLower) || expectedLower.includes(f.toLowerCase())
      );
      if (partialMatches.length > 0 && !exactMatch) {
        console.log(`⚠ Possible matches for "${Object.keys(EXPECTED_FIELDS).find(k => k.toLowerCase() === expectedLower)}":`);
        partialMatches.forEach(match => console.log(`   - "${match}"`));
      }
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("Checking expected demographic fields:\n");
    
    let allCorrect = true;
    const results = {};
    
    // Check each expected field
    for (const [fieldName, expected] of Object.entries(EXPECTED_FIELDS)) {
      const exists = allFields.has(fieldName);
      results[fieldName] = { exists, found: false, correct: false, issues: [] };
      
      if (!exists) {
        console.log(`❌ "${fieldName}" - NOT FOUND`);
        console.log(`   Expected: ${expected.type} field`);
        allCorrect = false;
        results[fieldName].issues.push("Field does not exist");
        continue;
      }
      
      // Field exists, check a sample value to infer type
      const sampleRecord = data.records.find(r => r.fields[fieldName] !== undefined && r.fields[fieldName] !== null);
      if (sampleRecord) {
        const sampleValue = sampleRecord.fields[fieldName];
        const actualType = typeof sampleValue;
        
        console.log(`✓ "${fieldName}" - EXISTS`);
        results[fieldName].found = true;
        
        // Check type
        if (expected.type === "number") {
          if (actualType === "number") {
            console.log(`   ✓ Type: Number (correct)`);
            results[fieldName].correct = true;
          } else {
            console.log(`   ❌ Type: ${actualType} (expected: number)`);
            results[fieldName].issues.push(`Expected number, got ${actualType}`);
            allCorrect = false;
          }
        } else if (expected.type === "singleSelect") {
          // For single select, check if value is one of the expected options
          if (typeof sampleValue === "string") {
            const normalizedValue = sampleValue.toLowerCase().trim();
            const normalizedOptions = expected.options.map(opt => opt.toLowerCase().trim());
            
            if (normalizedOptions.includes(normalizedValue)) {
              console.log(`   ✓ Type: Single select (correct)`);
              console.log(`   ✓ Value "${sampleValue}" is a valid option`);
              results[fieldName].correct = true;
            } else {
              console.log(`   ⚠ Type: Single select`);
              console.log(`   ⚠ Value "${sampleValue}" is not in expected options`);
              console.log(`   Expected options: ${expected.options.join(", ")}`);
              results[fieldName].issues.push(`Value "${sampleValue}" not in expected options`);
              // Don't mark as incorrect, might just be a different option
            }
          } else {
            console.log(`   ❌ Type: ${actualType} (expected: string for single select)`);
            results[fieldName].issues.push(`Expected string, got ${actualType}`);
            allCorrect = false;
          }
        }
      } else {
        console.log(`✓ "${fieldName}" - EXISTS (no sample value to check)`);
        results[fieldName].found = true;
        console.log(`   ⚠ Cannot verify type/options (field is empty in sample records)`);
      }
      
      console.log("");
    }
    
    console.log("=".repeat(60));
    console.log("\nSummary:\n");
    
    let foundCount = 0;
    let correctCount = 0;
    
    for (const [fieldName, result] of Object.entries(results)) {
      if (result.exists) foundCount++;
      if (result.correct) correctCount++;
      
      if (!result.exists) {
        console.log(`❌ ${fieldName}: Missing`);
      } else if (result.issues.length > 0) {
        console.log(`⚠ ${fieldName}: Exists but has issues`);
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log(`✓ ${fieldName}: Correct`);
      }
    }
    
    console.log(`\nFields found: ${foundCount}/${Object.keys(EXPECTED_FIELDS).length}`);
    console.log(`Fields correct: ${correctCount}/${Object.keys(EXPECTED_FIELDS).length}`);
    
    if (allCorrect && foundCount === Object.keys(EXPECTED_FIELDS).length) {
      console.log("\n✅ All demographic fields are correctly configured!");
    } else {
      console.log("\n⚠ Some fields need attention. See details above.");
      console.log("\nTo fix:");
      console.log("1. Create missing fields in Airtable");
      console.log("2. Check field types match expected types");
      console.log("3. Verify single select options match exactly");
      console.log("\nSee AIRTABLE_DEMOGRAPHICS_SETUP.md for detailed setup instructions.");
    }
    
    // Show sample values if available
    console.log("\n" + "=".repeat(60));
    console.log("Sample values from records:\n");
    
    data.records.slice(0, 3).forEach((record, index) => {
      const name = record.fields["Name"] || `Record ${index + 1}`;
      console.log(`Record: ${name}`);
      for (const fieldName of Object.keys(EXPECTED_FIELDS)) {
        const value = record.fields[fieldName];
        if (value !== undefined && value !== null) {
          console.log(`  ${fieldName}: ${value}`);
        }
      }
      console.log("");
    });
    
    // Try to test if fields exist by attempting a test update (dry run)
    console.log("=".repeat(60));
    console.log("\nTesting field existence by attempting a test update...\n");
    console.log("(This will try to update the first record with test values)\n");
    
    if (data.records.length > 0) {
      const testRecord = data.records[0];
      const testRecordId = testRecord.id;
      
      // Try to update with test values for each expected field
      const testFields = {};
      let hasTestFields = false;
      
      for (const fieldName of Object.keys(EXPECTED_FIELDS)) {
        // Only test if field wasn't found in the records
        if (!allFields.has(fieldName)) {
          const expected = EXPECTED_FIELDS[fieldName];
          if (expected.type === "number") {
            testFields[fieldName] = 35; // Test age value
            hasTestFields = true;
          } else if (expected.type === "singleSelect" && expected.options.length > 0) {
            testFields[fieldName] = expected.options[0]; // Test with first option
            hasTestFields = true;
          }
        }
      }
      
      if (hasTestFields) {
        console.log("Attempting test update to verify fields exist...");
        console.log("Test fields to update:", Object.keys(testFields));
        
        try {
          // Try a PATCH request to see if fields exist
          const testResponse = await fetch(`${AIRTABLE_API_URL}/${testRecordId}`, {
            method: "PATCH",
            body: {
              fields: testFields
            }
          });
          
          const testData = await testResponse.json();
          console.log("✅ Test update succeeded! Fields exist and are writable.");
          console.log("   (Test values were written - you may want to clear them in Airtable)");
          
          // Now check which fields actually got written
          console.log("\nFields that were successfully written:");
          for (const fieldName of Object.keys(testFields)) {
            if (testData.fields && testData.fields[fieldName] !== undefined) {
              console.log(`  ✓ ${fieldName}: ${testData.fields[fieldName]}`);
              // Update our results
              if (!results[fieldName]) results[fieldName] = { exists: false };
              results[fieldName].exists = true;
              results[fieldName].found = true;
            }
          }
          
        } catch (error) {
          if (error.message.includes("422") || error.message.includes("UNKNOWN_FIELD_NAME")) {
            console.log("❌ Test update failed - fields do not exist or have wrong names");
            console.log(`   Error: ${error.message}`);
            console.log("\n   This means the fields need to be created in Airtable.");
            console.log("   Check that field names match exactly (case-sensitive).");
          } else {
            console.log(`⚠ Test update error: ${error.message}`);
            console.log("   This might indicate a permissions issue or field configuration problem.");
          }
        }
      } else {
        console.log("All expected fields were found in the records, no test update needed.");
      }
    }
    
  } catch (error) {
    console.error("Error checking fields:", error.message);
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error("\n⚠ Authentication error. Check your API key.");
    } else if (error.message.includes("404")) {
      console.error("\n⚠ Table not found. Check table name and base ID.");
    }
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  checkFields();
}

module.exports = { checkFields };


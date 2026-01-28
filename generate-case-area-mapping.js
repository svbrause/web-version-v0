// Script to generate case-to-area mapping CSV
// Fetches data from Airtable and applies the same keyword matching logic as app.js

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

// Area keywords mapping (from app.js)
const areaKeywords = {
  forehead: "Forehead",
  brow: "Eyes", // Note: This maps to Eyes, but user wants to check if brow ptosis should be Forehead
  brows: "Eyes",
  eyebrow: "Eyes",
  eyebrows: "Eyes",
  "brow ptosis": "Eyes", // Currently mapped to Eyes - user wants to check this
  ptosis: "Eyes",
  eye: "Eyes",
  eyes: "Eyes",
  "under eye": "Eyes",
  "under-eye": "Eyes",
  eyelid: "Eyes",
  eyelids: "Eyes",
  cheek: "Cheeks",
  cheeks: "Cheeks",
  nose: "Nose",
  lip: "Mouth & Lips",
  lips: "Mouth & Lips",
  mouth: "Mouth & Lips",
  jawline: "Jawline",
  jaw: "Jawline",
  chin: "Chin",
  neck: "Neck",
  temple: "Forehead",
  temples: "Forehead",
};

const areaKeywordsExtended = {
  "Forehead": ["forehead", "brow", "glabella", "temporal"],
  "Eyes": ["eye", "eyelid", "under-eye", "crow"],
  "Cheeks": ["cheek", "cheekbone"],
  "Nose": ["nose", "nasal", "rhino"],
  "Lips": ["lip", "philtral", "gummy"],
  "Chin/Jaw": ["chin", "jaw", "jawline", "jowl", "masseter"],
  "Neck": ["neck", "platysmal", "submental"],
  "Skin": ["skin", "spot", "scar", "wrinkle", "peel", "laser"],
};

function extractAreasFromCase(caseItem) {
  const matchedAreas = new Set();
  
  const caseNameLower = (caseItem.name || "").toLowerCase();
  const matchingCriteria = (caseItem.matchingCriteria || []).map((c) =>
    typeof c === "string" ? c.toLowerCase() : String(c || "").toLowerCase()
  );
  const solvedLower = (caseItem.solved || []).map((s) => s.toLowerCase()).join(" ");
  
  // Combine all text to search
  const allText = [caseNameLower, ...matchingCriteria, solvedLower].join(" ");
  
  // Check against area keywords
  for (const [keyword, areaName] of Object.entries(areaKeywords)) {
    if (allText.includes(keyword.toLowerCase())) {
      matchedAreas.add(areaName);
    }
  }
  
  // Also check extended keywords
  for (const [areaName, keywords] of Object.entries(areaKeywordsExtended)) {
    for (const keyword of keywords) {
      if (allText.includes(keyword.toLowerCase())) {
        matchedAreas.add(areaName);
      }
    }
  }
  
  return Array.from(matchedAreas);
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

function mapRecordToCase(record) {
  const fields = record.fields;
  
  // Extract matching criteria
  const matchingCriteria = fields["Matching Criteria"] || [];
  const matchingCriteriaArray = Array.isArray(matchingCriteria) 
    ? matchingCriteria 
    : (matchingCriteria ? [matchingCriteria] : []);
  
  // Extract solved issues
  const solved = fields["Solved"] || [];
  const solvedArray = Array.isArray(solved) ? solved : (solved ? [solved] : []);
  
  // Extract Areas field from Airtable - check multiple possible field names
  let airtableAreas = fields["Area Names"] || fields["Areas"] || fields["Area"] || 
                      fields["Treatment Areas"] || fields["Areas of Concern"] || 
                      fields["Concern Areas"] || [];
  const airtableAreasArray = Array.isArray(airtableAreas) 
    ? airtableAreas 
    : (airtableAreas ? [airtableAreas] : []);
  
  return {
    id: record.id,
    name: fields["Name"] || "",
    matchingCriteria: matchingCriteriaArray,
    solved: solvedArray,
    airtableAreas: airtableAreasArray,
  };
}

async function main() {
  console.log("Fetching case data from Airtable...");
  const records = await fetchAllRecords();
  console.log(`Loaded ${records.length} records`);
  
  // Check what fields exist in Airtable (especially area-related fields)
  if (records.length > 0) {
    console.log('\n📋 Checking available fields in Airtable...');
    const firstRecordFields = Object.keys(records[0].fields);
    const areaRelatedFields = firstRecordFields.filter(k => 
      k.toLowerCase().includes('area') || 
      k.toLowerCase().includes('concern') ||
      k.toLowerCase().includes('treatment')
    );
    console.log('Area/Concern/Treatment related fields found:');
    if (areaRelatedFields.length > 0) {
      areaRelatedFields.forEach(f => console.log(`  - "${f}"`));
    } else {
      console.log('  (none found)');
    }
    console.log('');
  }
  
  const cases = records.map(mapRecordToCase);
  
  console.log("Extracting area mappings...");
  const mapping = cases.map(caseItem => {
    const keywordMatchedAreas = extractAreasFromCase(caseItem);
    const airtableAreas = caseItem.airtableAreas || [];
    
    // Normalize Airtable areas to match our area names
    const normalizedAirtableAreas = airtableAreas.map(area => {
      // Map common variations
      const areaLower = String(area).toLowerCase();
      if (areaLower.includes('forehead')) return 'Forehead';
      if (areaLower.includes('eye') || areaLower.includes('brow')) return 'Eyes';
      if (areaLower.includes('cheek')) return 'Cheeks';
      if (areaLower.includes('nose')) return 'Nose';
      if (areaLower.includes('lip') || areaLower.includes('mouth')) return 'Mouth & Lips';
      if (areaLower.includes('jaw')) return 'Jawline';
      if (areaLower.includes('chin')) return 'Chin';
      if (areaLower.includes('neck')) return 'Neck';
      return String(area); // Return as-is if no match
    });
    
    // Check if keyword matching matches Airtable areas
    const keywordSet = new Set(keywordMatchedAreas);
    const airtableSet = new Set(normalizedAirtableAreas);
    const matches = keywordMatchedAreas.filter(a => airtableSet.has(a));
    const keywordOnly = keywordMatchedAreas.filter(a => !airtableSet.has(a));
    const airtableOnly = normalizedAirtableAreas.filter(a => !keywordSet.has(a));
    
    return {
      caseId: caseItem.id || '',
      caseName: caseItem.name || '',
      keywordMatchedAreas: keywordMatchedAreas.join('; '),
      keywordAreaCount: keywordMatchedAreas.length,
      airtableAreas: normalizedAirtableAreas.join('; '),
      airtableAreaCount: normalizedAirtableAreas.length,
      matchingAreas: matches.join('; '),
      keywordOnlyAreas: keywordOnly.join('; '),
      airtableOnlyAreas: airtableOnly.join('; '),
      matchingCriteria: (caseItem.matchingCriteria || []).join('; '),
      solved: (caseItem.solved || []).join('; ')
    };
  });
  
  // Generate CSV with comparison
  const csvHeader = 'Case ID,Case Name,Keyword Matched Areas,Keyword Count,Airtable Areas,Airtable Count,Matching Areas,Keyword Only,Airtable Only,Matching Criteria,Solved\n';
  const csvRows = mapping.map(row => {
    const escapeCSV = (str) => {
      if (!str) return '';
      return `"${String(str).replace(/"/g, '""')}"`;
    };
    return [
      escapeCSV(row.caseId),
      escapeCSV(row.caseName),
      escapeCSV(row.keywordMatchedAreas),
      row.keywordAreaCount,
      escapeCSV(row.airtableAreas),
      row.airtableAreaCount,
      escapeCSV(row.matchingAreas),
      escapeCSV(row.keywordOnlyAreas),
      escapeCSV(row.airtableOnlyAreas),
      escapeCSV(row.matchingCriteria),
      escapeCSV(row.solved)
    ].join(',');
  }).join('\n');
  
  const csv = csvHeader + csvRows;
  const filename = 'case-area-mapping.csv';
  fs.writeFileSync(filename, csv);
  
  console.log(`\n✅ Generated ${filename} with ${mapping.length} cases`);
  console.log(`   Cases with keyword-matched areas: ${mapping.filter(r => r.keywordAreaCount > 0).length}`);
  console.log(`   Cases with Airtable areas: ${mapping.filter(r => r.airtableAreaCount > 0).length}`);
  console.log(`   Cases with matching areas: ${mapping.filter(r => r.matchingAreas).length}`);
  console.log(`   Cases with keyword-only areas: ${mapping.filter(r => r.keywordOnlyAreas).length}`);
  console.log(`   Cases with Airtable-only areas: ${mapping.filter(r => r.airtableOnlyAreas).length}`);
  
  // Show cases with "brow ptosis" for user to check
  console.log(`\n📋 Cases containing "brow ptosis":`);
  const browPtosisCases = mapping.filter(m => 
    m.caseName.toLowerCase().includes('brow ptosis') || 
    m.matchingCriteria.toLowerCase().includes('brow ptosis') ||
    m.solved.toLowerCase().includes('brow ptosis')
  );
  browPtosisCases.forEach(m => {
    console.log(`   "${m.caseName}"`);
    console.log(`      Keyword: ${m.keywordMatchedAreas || '(none)'}`);
    console.log(`      Airtable: ${m.airtableAreas || '(none)'}`);
    console.log(`      Match: ${m.matchingAreas || 'NO MATCH'}`);
    if (m.keywordOnlyAreas) console.log(`      Keyword Only: ${m.keywordOnlyAreas}`);
    if (m.airtableOnlyAreas) console.log(`      Airtable Only: ${m.airtableOnlyAreas}`);
  });
  
  return filename;
}

main().then(filename => {
  console.log(`\n✅ CSV file created: ${filename}`);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


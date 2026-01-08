// Script to extract case-to-area mapping based on keyword matching
// This matches the logic in app.js

const fs = require('fs');

// Area keywords mapping (from app.js lines 4837-4863)
const areaKeywords = {
  forehead: "Forehead",
  brow: "Eyes", // Brow relates to Eyes area
  brows: "Eyes",
  eyebrow: "Eyes",
  eyebrows: "Eyes",
  "brow ptosis": "Eyes",
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

// Additional area keywords from organizeCasesByArea function (lines 11904-11913)
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

// Read case data from Airtable (we'll need to load it)
// For now, let's create a script that can be run with the case data

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

// This script needs to be run in the context of the app where caseData is loaded
// Let's create a standalone version that can read from a JSON export

console.log(`
To generate the case-to-area mapping CSV, you need to:

1. Export your case data from Airtable as JSON
2. Save it as 'case-data.json' in this directory
3. Run: node extract-case-area-mapping.js

Or, if you want me to create a version that works with the live app,
I can create a browser-based script that extracts the mapping from the loaded caseData.
`);

// If case-data.json exists, process it
if (fs.existsSync('./case-data.json')) {
  const caseData = JSON.parse(fs.readFileSync('./case-data.json', 'utf8'));
  
  const mapping = [];
  
  caseData.forEach(caseItem => {
    const areas = extractAreasFromCase(caseItem);
    mapping.push({
      caseId: caseItem.id || '',
      caseName: caseItem.name || '',
      areas: areas.join('; '),
      areaCount: areas.length
    });
  });
  
  // Generate CSV
  const csvHeader = 'Case ID,Case Name,Areas,Area Count\n';
  const csvRows = mapping.map(row => {
    return `"${row.caseId}","${row.caseName.replace(/"/g, '""')}","${row.areas}","${row.areaCount}"`;
  }).join('\n');
  
  const csv = csvHeader + csvRows;
  fs.writeFileSync('./case-area-mapping.csv', csv);
  
  console.log(`Generated case-area-mapping.csv with ${mapping.length} cases`);
  console.log(`Cases with areas: ${mapping.filter(r => r.areaCount > 0).length}`);
  console.log(`Cases without areas: ${mapping.filter(r => r.areaCount === 0).length}`);
} else {
  console.log('case-data.json not found. Creating a browser-based extractor instead...');
  
  // Create a browser console script instead
  const browserScript = `
// Run this in the browser console on your app page
// It will extract the case-to-area mapping from the loaded caseData

(function() {
  if (typeof caseData === 'undefined') {
    console.error('caseData is not loaded. Make sure you are on a page where caseData is available.');
    return;
  }
  
  const areaKeywords = {
    forehead: "Forehead",
    brow: "Eyes",
    brows: "Eyes",
    eyebrow: "Eyes",
    eyebrows: "Eyes",
    "brow ptosis": "Eyes",
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
    
    const allText = [caseNameLower, ...matchingCriteria, solvedLower].join(" ");
    
    for (const [keyword, areaName] of Object.entries(areaKeywords)) {
      if (allText.includes(keyword.toLowerCase())) {
        matchedAreas.add(areaName);
      }
    }
    
    for (const [areaName, keywords] of Object.entries(areaKeywordsExtended)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword.toLowerCase())) {
          matchedAreas.add(areaName);
        }
      }
    }
    
    return Array.from(matchedAreas);
  }
  
  const mapping = caseData.map(caseItem => {
    const areas = extractAreasFromCase(caseItem);
    return {
      caseId: caseItem.id || '',
      caseName: caseItem.name || '',
      areas: areas.join('; '),
      areaCount: areas.length
    };
  });
  
  // Generate CSV
  const csvHeader = 'Case ID,Case Name,Areas,Area Count\\n';
  const csvRows = mapping.map(row => {
    return \`"\${row.caseId}","\${row.caseName.replace(/"/g, '""')}","\${row.areas}","\${row.areaCount}"\`;
  }).join('\\n');
  
  const csv = csvHeader + csvRows;
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'case-area-mapping.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  console.log(\`Generated case-area-mapping.csv with \${mapping.length} cases\`);
  console.log(\`Cases with areas: \${mapping.filter(r => r.areaCount > 0).length}\`);
  console.log(\`Cases without areas: \${mapping.filter(r => r.areaCount === 0).length}\`);
  
  return mapping;
})();
`;
  
  fs.writeFileSync('./extract-case-area-mapping-browser.js', browserScript);
  console.log('Created extract-case-area-mapping-browser.js');
  console.log('Copy and paste the contents into your browser console on the app page to generate the CSV');
}


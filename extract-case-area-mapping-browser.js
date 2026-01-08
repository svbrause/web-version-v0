// Run this script in the browser console on your app page (http://localhost:8000)
// It will extract the case-to-area mapping from the loaded caseData and download a CSV

(function() {
  if (typeof caseData === 'undefined' || !caseData || caseData.length === 0) {
    console.error('caseData is not loaded. Make sure you are on a page where caseData is available.');
    console.log('Try navigating to the results page or any page that loads cases.');
    return;
  }
  
  // Area keywords mapping (from app.js)
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
  
  console.log(`Processing ${caseData.length} cases...`);
  
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
  const csvHeader = 'Case ID,Case Name,Areas,Area Count\n';
  const csvRows = mapping.map(row => {
    const escapedName = (row.caseName || '').replace(/"/g, '""');
    return `"${row.caseId}","${escapedName}","${row.areas}","${row.areaCount}"`;
  }).join('\n');
  
  const csv = csvHeader + csvRows;
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'case-area-mapping.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  console.log(`✅ Generated case-area-mapping.csv with ${mapping.length} cases`);
  console.log(`   Cases with areas: ${mapping.filter(r => r.areaCount > 0).length}`);
  console.log(`   Cases without areas: ${mapping.filter(r => r.areaCount === 0).length}`);
  
  // Show sample of mapping
  console.log('\nSample mappings:');
  mapping.slice(0, 10).forEach(m => {
    if (m.areaCount > 0) {
      console.log(`  ${m.caseName}: ${m.areas}`);
    }
  });
  
  return mapping;
})();


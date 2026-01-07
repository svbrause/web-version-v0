/**
 * Concern Mapping Analysis Script
 * 
 * This script analyzes the actual case data and generates a nested list
 * showing how specific concerns map to high-level categories.
 * 
 * Run this in the browser console after cases are loaded to see the actual mapping.
 */

function analyzeConcernMapping() {
  console.log("=== CONCERN MAPPING ANALYSIS ===\n");
  
  if (!caseData || caseData.length === 0) {
    console.warn("No case data available. Make sure cases are loaded from Airtable.");
    return;
  }
  
  // Extract all unique concerns from case names
  const concernMap = new Map(); // concern -> { cases: [], treatments: Set, categories: Set }
  
  caseData.forEach(caseItem => {
    const concern = extractConcernFromCaseName(caseItem.name);
    const treatment = extractTreatmentFromCaseName(caseItem.name);
    
    if (!concernMap.has(concern)) {
      concernMap.set(concern, {
        cases: [],
        treatments: new Set(),
        categories: new Set()
      });
    }
    
    const concernData = concernMap.get(concern);
    concernData.cases.push(caseItem);
    concernData.treatments.add(treatment);
    
    // Find which high-level categories this concern maps to
    HIGH_LEVEL_CONCERNS.forEach(category => {
      const caseNameLower = (caseItem.name || "").toLowerCase();
      const matchingCriteriaLower = (caseItem.matchingCriteria || []).map(c => c.toLowerCase());
      
      const nameMatch = category.mapsToPhotos.some(keyword => 
        caseNameLower.includes(keyword.toLowerCase())
      );
      const criteriaMatch = category.mapsToPhotos.some(keyword =>
        matchingCriteriaLower.some(criteria => criteria.includes(keyword.toLowerCase()))
      );
      
      if (nameMatch || criteriaMatch) {
        concernData.categories.add(category.name);
      }
    });
  });
  
  // Group concerns by high-level category
  const categoryMap = new Map();
  
  HIGH_LEVEL_CONCERNS.forEach(category => {
    categoryMap.set(category.name, {
      category: category,
      concerns: []
    });
  });
  
  concernMap.forEach((data, concern) => {
    // If concern maps to multiple categories, add to all of them
    if (data.categories.size === 0) {
      // Unmapped concern - add to "Uncategorized"
      if (!categoryMap.has("Uncategorized")) {
        categoryMap.set("Uncategorized", {
          category: { name: "Uncategorized", id: "uncategorized" },
          concerns: []
        });
      }
      categoryMap.get("Uncategorized").concerns.push({
        concern: concern,
        caseCount: data.cases.length,
        treatments: Array.from(data.treatments).sort()
      });
    } else {
      data.categories.forEach(categoryName => {
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).concerns.push({
            concern: concern,
            caseCount: data.cases.length,
            treatments: Array.from(data.treatments).sort()
          });
        }
      });
    }
  });
  
  // Generate nested list output
  console.log("NESTED CONCERN MAPPING:\n");
  console.log("=".repeat(60));
  
  categoryMap.forEach((categoryData, categoryName) => {
    if (categoryData.concerns.length === 0) return;
    
    console.log(`\n📁 ${categoryName}`);
    console.log(`   Description: ${categoryData.category.description || "N/A"}`);
    console.log(`   Maps to Photos: ${categoryData.category.mapsToPhotos?.join(", ") || "N/A"}`);
    console.log(`   Total Concerns: ${categoryData.concerns.length}`);
    console.log("");
    
    // Sort concerns by case count (descending)
    const sortedConcerns = categoryData.concerns.sort((a, b) => b.caseCount - a.caseCount);
    
    sortedConcerns.forEach(({ concern, caseCount, treatments }) => {
      console.log(`   ├─ ${concern}`);
      console.log(`   │  Cases: ${caseCount}`);
      console.log(`   │  Treatments: ${treatments.join(", ") || "None"}`);
      
      // Show sample case names
      const sampleCases = concernMap.get(concern).cases.slice(0, 3).map(c => c.name);
      if (sampleCases.length > 0) {
        console.log(`   │  Sample cases:`);
        sampleCases.forEach(caseName => {
          console.log(`   │    • ${caseName}`);
        });
      }
      console.log("");
    });
  });
  
  // Summary statistics
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY STATISTICS:\n");
  console.log(`Total Cases Analyzed: ${caseData.length}`);
  console.log(`Unique Concerns Found: ${concernMap.size}`);
  console.log(`High-Level Categories: ${HIGH_LEVEL_CONCERNS.length}`);
  
  // Find concerns that map to multiple categories
  const multiMapped = Array.from(concernMap.entries())
    .filter(([_, data]) => data.categories.size > 1)
    .map(([concern, data]) => ({
      concern,
      categories: Array.from(data.categories),
      caseCount: data.cases.length
    }));
  
  if (multiMapped.length > 0) {
    console.log(`\n⚠️  Concerns Mapping to Multiple Categories (${multiMapped.length}):`);
    multiMapped.forEach(({ concern, categories, caseCount }) => {
      console.log(`   • ${concern} (${caseCount} cases) → ${categories.join(", ")}`);
    });
  }
  
  // Find unmapped concerns
  const unmapped = Array.from(concernMap.entries())
    .filter(([_, data]) => data.categories.size === 0)
    .map(([concern, data]) => ({
      concern,
      caseCount: data.cases.length
    }));
  
  if (unmapped.length > 0) {
    console.log(`\n⚠️  Unmapped Concerns (${unmapped.length}):`);
    unmapped.forEach(({ concern, caseCount }) => {
      console.log(`   • ${concern} (${caseCount} cases)`);
    });
  }
  
  // Find concerns with body parts as treatments
  const bodyPartIssues = Array.from(concernMap.entries())
    .filter(([_, data]) => {
      return Array.from(data.treatments).some(t => 
        BODY_PARTS.has(t.toLowerCase()) || t === "General Treatment"
      );
    })
    .map(([concern, data]) => ({
      concern,
      problematicTreatments: Array.from(data.treatments).filter(t => 
        BODY_PARTS.has(t.toLowerCase()) || t === "General Treatment"
      ),
      caseCount: data.cases.length
    }));
  
  if (bodyPartIssues.length > 0) {
    console.log(`\n⚠️  Concerns with Problematic Treatments (${bodyPartIssues.length}):`);
    bodyPartIssues.forEach(({ concern, problematicTreatments, caseCount }) => {
      console.log(`   • ${concern} (${caseCount} cases)`);
      console.log(`     Problematic: ${problematicTreatments.join(", ")}`);
    });
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\nTo run this analysis, call: analyzeConcernMapping()");
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.analyzeConcernMapping = analyzeConcernMapping;
}





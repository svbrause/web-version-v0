import type { CaseItem, AppState } from '../types';
import { HIGH_LEVEL_CONCERNS, AREAS_OF_CONCERN } from '../constants/data';

// Get CASE_CATEGORY_MAPPING from window if available
let CASE_CATEGORY_MAPPING: Record<string, string[]> = {};
if (typeof window !== 'undefined' && (window as any).CASE_CATEGORY_MAPPING) {
  CASE_CATEGORY_MAPPING = (window as any).CASE_CATEGORY_MAPPING;
  console.log('Loaded CASE_CATEGORY_MAPPING from window');
}

// Helper function to normalize keywords (handle hyphens and spaces)
export function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().replace(/[-_\s]+/g, "[-\\s_]*");
}

// Check if a case is surgical
export function isSurgicalCase(caseItem: CaseItem): boolean {
  if (!caseItem) return false;
  
  // Check the "Surgical" field from Airtable
  if ((caseItem as any).surgical !== undefined) {
    const surgicalValue = String((caseItem as any).surgical || "").toLowerCase().trim();
    if (surgicalValue === "surgical") {
      return true;
    }
    if (surgicalValue === "non-surgical" || surgicalValue === "nonsurgical") {
      return false;
    }
  }
  
  // Fallback to keyword-based detection
  const caseName = (caseItem.name || "").toLowerCase();
  const headline = ((caseItem as any).headline || "").toLowerCase();
  const treatment = ((caseItem as any).treatment || "").toLowerCase();
  const allText = [caseName, headline, treatment].join(" ");
  
  const surgicalKeywords = [
    "surgical", 
    "surgery", 
    "rhinoplasty", 
    "blepharoplasty", 
    "facelift", 
    "neck lift",
    "browlift",
    "brow lift",
    "brow-lift",
    "browplasty",
    "forehead lift",
    "otoplasty",
    "liposuction",
    "liposculpture",
    "abdominoplasty",
    "tummy tuck",
    "breast augmentation",
    "breast lift",
    "mastopexy",
    "augmentation",
    "implant"
  ];
  
  for (const keyword of surgicalKeywords) {
    if (allText.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

// Calculate matching score for a case
export function calculateMatchingScore(caseItem: CaseItem, userSelections: Partial<AppState>): number {
  let score = 0;
  const maxScore = 95; // Cap at 95% to feel more realistic

  // Base score for any case that passes filtering (shows it's relevant)
  score += 15;

  // Age match (30 points max) - more generous
  if (userSelections.ageRange && (caseItem as any).patientAge) {
    const userAgeRange = userSelections.ageRange;
    const patientAge = (caseItem as any).patientAge;
    const rangeMid = userAgeRange === '60+' ? 65 : 
                     parseInt(userAgeRange.split('-')[0]) + 5;
    const ageDiff = Math.abs(patientAge - rangeMid);
    
    if (ageDiff === 0) {
      score += 30;
    } else if (ageDiff <= 2) {
      score += 27;
    } else if (ageDiff <= 5) {
      score += 24;
    } else if (ageDiff <= 10) {
      score += 20;
    } else if (ageDiff <= 15) {
      score += 16;
    } else {
      score += 12;
    }
  } else if (userSelections.ageRange) {
    score += 15; // Partial credit if age not available
  }


  // Category match (40 points max) - with minimum guarantee
  if (userSelections.selectedConcerns && userSelections.selectedConcerns.length > 0) {
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
      typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
    );
    
    let categoryMatches = 0;
    userSelections.selectedConcerns.forEach(concernId => {
      const category = HIGH_LEVEL_CONCERNS.find(c => c.id === concernId);
      if (category) {
        const nameMatch = category.mapsToPhotos?.some(keyword => 
          caseNameLower.includes(keyword.toLowerCase())
        );
        const criteriaMatch = category.mapsToPhotos?.some(keyword =>
          matchingCriteriaLower.some(criteria => criteria.includes(keyword.toLowerCase()))
        );
        if (nameMatch || criteriaMatch) {
          categoryMatches++;
        }
      }
    });
    
    if (categoryMatches > 0) {
      const matchRatio = categoryMatches / userSelections.selectedConcerns.length;
      // Minimum 25 points if at least one concern matches, scales up to 40
      const basePoints = 25;
      const additionalPoints = Math.round(matchRatio * 15);
      score += basePoints + additionalPoints;
    }
  }

  // Skin type match (15 points max) - with partial credit
  if (userSelections.skinType && (caseItem as any).skinType) {
    if (userSelections.skinType === (caseItem as any).skinType) {
      score += 15;
    } else {
      // Give partial credit (8 points) even if skin type doesn't match exactly
      score += 8;
    }
  } else {
    // Give partial credit if skin type not available
    score += 8;
  }

  // Skin tone match (10 points max) - with partial credit
  if (userSelections.skinTone && (caseItem as any).skinTone) {
    if (userSelections.skinTone === (caseItem as any).skinTone) {
      score += 10;
    } else {
      // Give partial credit (5 points) for similar skin tones
      // Map similar tones for partial matching
      const toneGroups: Record<string, string[]> = {
        'light': ['light', 'fair'],
        'fair': ['light', 'fair', 'medium'],
        'medium': ['fair', 'medium', 'tan'],
        'tan': ['medium', 'tan', 'brown'],
        'brown': ['tan', 'brown', 'deep'],
        'deep': ['brown', 'deep']
      };
      const userToneGroup = toneGroups[userSelections.skinTone] || [];
      if (userToneGroup.includes((caseItem as any).skinTone)) {
        score += 7; // Similar tone gets more credit
      } else {
        score += 5; // Different tone gets minimal credit
      }
    }
  } else {
    // Give partial credit if skin tone not available
    score += 5;
  }

  return Math.min(score, maxScore);
}

// Generate detailed category-based explanation of why a case is relevant
export function getCaseRelevanceBreakdown(caseItem: CaseItem, userSelections: Partial<AppState>, _currentConcernId?: string | null): Array<{category: string; explanation: string}> {
  const breakdown: Array<{category: string; explanation: string}> = [];
  
  // Age comparison
  if (userSelections.ageRange && (caseItem as any).patientAge) {
    const userAgeRange = userSelections.ageRange;
    const patientAge = (caseItem as any).patientAge;
    const rangeMid = userAgeRange === '60+' ? 65 : 
                     parseInt(userAgeRange.split('-')[0]) + 5;
    const ageDiff = Math.abs(patientAge - rangeMid);
    
    if (ageDiff === 0) {
      breakdown.push({ category: 'Age', explanation: `Exact match - case patient was ${patientAge} years old, same as you` });
    } else if (ageDiff <= 2) {
      breakdown.push({ category: 'Age', explanation: `Similar - case patient was ${patientAge} years old, only ${ageDiff} year${ageDiff > 1 ? 's' : ''} difference` });
    } else if (ageDiff <= 5) {
      breakdown.push({ category: 'Age', explanation: `Close - case patient was ${patientAge} years old, ${ageDiff} years apart` });
    } else if (ageDiff <= 10) {
      breakdown.push({ category: 'Age', explanation: `Somewhat different - case patient was ${patientAge} years old, ${ageDiff} years apart` });
    } else {
      breakdown.push({ category: 'Age', explanation: `Different age range - case patient was ${patientAge} years old` });
    }
  } else if ((caseItem as any).patientAge) {
    // Show case patient age even if user didn't provide age
    const patientAge = (caseItem as any).patientAge;
    breakdown.push({ category: 'Age', explanation: `Case patient was ${patientAge} years old` });
  } else if (userSelections.ageRange) {
    breakdown.push({ category: 'Age', explanation: `Age not available for this case` });
  }
  
  // Skin type comparison
  if (userSelections.skinType && (caseItem as any).skinType) {
    const userSkinType = userSelections.skinType;
    const caseSkinType = (caseItem as any).skinType;
    const skinTypeLabels: Record<string, string> = {
      'dry': 'dry',
      'oily': 'oily',
      'balanced': 'balanced',
      'combination': 'combination',
      'not-sure': 'similar'
    };
    
    if (userSkinType === caseSkinType) {
      breakdown.push({ category: 'Skin Type', explanation: `Exact match - both ${skinTypeLabels[userSkinType] || userSkinType} skin` });
    } else {
      breakdown.push({ category: 'Skin Type', explanation: `Different - you have ${skinTypeLabels[userSkinType] || userSkinType} skin, case has ${skinTypeLabels[caseSkinType] || caseSkinType} skin` });
    }
  } else if (userSelections.skinType) {
    breakdown.push({ category: 'Skin Type', explanation: `Skin type not available for this case` });
  }
  
  // Skin tone comparison
  if (userSelections.skinTone && (caseItem as any).skinTone) {
    const userTone = userSelections.skinTone;
    const caseTone = (caseItem as any).skinTone;
    const toneLabels: Record<string, string> = {
      'light': 'light',
      'fair': 'fair',
      'medium': 'medium',
      'tan': 'tan',
      'brown': 'brown',
      'deep': 'deep'
    };
    
    if (userTone === caseTone) {
      breakdown.push({ category: 'Skin Tone', explanation: `Exact match - both ${toneLabels[userTone] || userTone} skin tone` });
    } else {
      // Check for similar tones
      const toneGroups: Record<string, string[]> = {
        'light': ['light', 'fair'],
        'fair': ['light', 'fair', 'medium'],
        'medium': ['fair', 'medium', 'tan'],
        'tan': ['medium', 'tan', 'brown'],
        'brown': ['tan', 'brown', 'deep'],
        'deep': ['brown', 'deep']
      };
      const userToneGroup = toneGroups[userTone] || [];
      if (userToneGroup.includes(caseTone)) {
        breakdown.push({ category: 'Skin Tone', explanation: `Similar - you have ${toneLabels[userTone] || userTone} skin tone, case has ${toneLabels[caseTone] || caseTone} skin tone` });
      } else {
        breakdown.push({ category: 'Skin Tone', explanation: `Different - you have ${toneLabels[userTone] || userTone} skin tone, case has ${toneLabels[caseTone] || caseTone} skin tone` });
      }
    }
  } else if (userSelections.skinTone) {
    breakdown.push({ category: 'Skin Tone', explanation: `Skin tone not available for this case` });
  }
  
  // Concerns match - show that both patients had similar concerns/goals
  if (userSelections.selectedConcerns && userSelections.selectedConcerns.length > 0) {
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
      typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
    );
    const solvedIssuesLower = ((caseItem.solved || []) as string[]).map(issue =>
      typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
    );
    
    const matchingConcerns: string[] = [];
    userSelections.selectedConcerns.forEach(concernId => {
      const category = HIGH_LEVEL_CONCERNS.find(c => c.id === concernId);
      if (category) {
        // Check case name
        const nameMatch = category.mapsToPhotos?.some(keyword => 
          caseNameLower.includes(keyword.toLowerCase())
        );
        // Check matching criteria
        const criteriaMatch = category.mapsToPhotos?.some(keyword =>
          matchingCriteriaLower.some(criteria => criteria.includes(keyword.toLowerCase()))
        );
        // Check solved issues (this shows what the case patient was interested in)
        const solvedMatch = category.mapsToPhotos?.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          return solvedIssuesLower.some(issue => issue.includes(keywordLower));
        });
        // Check specific issues mapping
        const specificIssuesMatch = category.mapsToSpecificIssues?.some(issue => {
          const issueLower = issue.toLowerCase();
          return caseNameLower.includes(issueLower) ||
                 matchingCriteriaLower.some(c => c.includes(issueLower)) ||
                 solvedIssuesLower.some(s => s.includes(issueLower));
        });
        
        if (nameMatch || criteriaMatch || solvedMatch || specificIssuesMatch) {
          matchingConcerns.push(category.name);
        }
      }
    });
    
    if (matchingConcerns.length > 0) {
      if (matchingConcerns.length === 1) {
        breakdown.push({ category: 'Concerns', explanation: `You both share an interest in addressing ${matchingConcerns[0].toLowerCase()}` });
      } else if (matchingConcerns.length === 2) {
        breakdown.push({ category: 'Concerns', explanation: `You both share interests in addressing ${matchingConcerns[0].toLowerCase()} and ${matchingConcerns[1].toLowerCase()}` });
      } else {
        breakdown.push({ category: 'Concerns', explanation: `You both share interests in addressing ${matchingConcerns.length} concerns: ${matchingConcerns.slice(0, -1).map(c => c.toLowerCase()).join(', ')}, and ${matchingConcerns[matchingConcerns.length - 1].toLowerCase()}` });
      }
    }
  }
  
  // Areas match
  if (userSelections.selectedAreas && userSelections.selectedAreas.length > 0) {
    const caseAreas = (caseItem as any).areas || [];
    const matchingAreas = userSelections.selectedAreas
      .map(areaId => {
        const area = AREAS_OF_CONCERN.find(a => a.id === areaId);
        return area ? area.name : null;
      })
      .filter(name => name !== null && caseAreas.includes(name)) as string[];
    
    if (matchingAreas.length > 0) {
      if (matchingAreas.length === 1) {
        breakdown.push({ category: 'Areas', explanation: `Treats your ${matchingAreas[0]} area` });
      } else if (matchingAreas.length === 2) {
        breakdown.push({ category: 'Areas', explanation: `Treats your ${matchingAreas[0]} and ${matchingAreas[1]} areas` });
      } else {
        breakdown.push({ category: 'Areas', explanation: `Treats ${matchingAreas.length} of your selected areas` });
      }
    }
  }
  
  return breakdown;
}

// Generate explanation of why a case is relevant to the user
export function getCaseRelevanceExplanation(caseItem: CaseItem, userSelections: Partial<AppState>): string {
  const reasons: string[] = [];
  
  // Check concern matches
  if (userSelections.selectedConcerns && userSelections.selectedConcerns.length > 0) {
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
      typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
    );
    
    const matchingConcerns: string[] = [];
    userSelections.selectedConcerns.forEach(concernId => {
      const category = HIGH_LEVEL_CONCERNS.find(c => c.id === concernId);
      if (category) {
        const nameMatch = category.mapsToPhotos?.some(keyword => 
          caseNameLower.includes(keyword.toLowerCase())
        );
        const criteriaMatch = category.mapsToPhotos?.some(keyword =>
          matchingCriteriaLower.some(criteria => criteria.includes(keyword.toLowerCase()))
        );
        if (nameMatch || criteriaMatch) {
          matchingConcerns.push(category.name);
        }
      }
    });
    
    if (matchingConcerns.length > 0) {
      if (matchingConcerns.length === 1) {
        reasons.push(`addresses your ${matchingConcerns[0]} concern`);
      } else if (matchingConcerns.length === 2) {
        reasons.push(`addresses your ${matchingConcerns[0]} and ${matchingConcerns[1]} concerns`);
      } else {
        reasons.push(`addresses your ${matchingConcerns.slice(0, -1).join(', ')}, and ${matchingConcerns[matchingConcerns.length - 1]} concerns`);
      }
    }
  }
  
  // Check age match
  if (userSelections.ageRange && (caseItem as any).patientAge) {
    const userAgeRange = userSelections.ageRange;
    const patientAge = (caseItem as any).patientAge;
    const rangeMid = userAgeRange === '60+' ? 65 : 
                     parseInt(userAgeRange.split('-')[0]) + 5;
    const ageDiff = Math.abs(patientAge - rangeMid);
    
    if (ageDiff <= 2) {
      reasons.push(`similar age (${patientAge})`);
    } else if (ageDiff <= 5) {
      reasons.push(`similar age range`);
    }
  }
  
  // Check skin type match
  if (userSelections.skinType && (caseItem as any).skinType) {
    if (userSelections.skinType === (caseItem as any).skinType) {
      const skinTypeLabels: Record<string, string> = {
        'dry': 'dry skin',
        'oily': 'oily skin',
        'balanced': 'balanced skin',
        'combination': 'combination skin',
        'not-sure': 'similar skin type'
      };
      reasons.push(skinTypeLabels[userSelections.skinType] || 'similar skin type');
    }
  }
  
  // Check skin tone match
  if (userSelections.skinTone && (caseItem as any).skinTone) {
    if (userSelections.skinTone === (caseItem as any).skinTone) {
      const toneLabels: Record<string, string> = {
        'light': 'light skin tone',
        'fair': 'fair skin tone',
        'medium': 'medium skin tone',
        'tan': 'tan skin tone',
        'brown': 'brown skin tone',
        'deep': 'deep skin tone'
      };
      reasons.push(toneLabels[userSelections.skinTone] || 'similar skin tone');
    } else {
      // Check for similar tones
      const toneGroups: Record<string, string[]> = {
        'light': ['light', 'fair'],
        'fair': ['light', 'fair', 'medium'],
        'medium': ['fair', 'medium', 'tan'],
        'tan': ['medium', 'tan', 'brown'],
        'brown': ['tan', 'brown', 'deep'],
        'deep': ['brown', 'deep']
      };
      const userToneGroup = toneGroups[userSelections.skinTone] || [];
      if (userToneGroup.includes((caseItem as any).skinTone)) {
        reasons.push('similar skin tone');
      }
    }
  }
  
  // Check area matches
  if (userSelections.selectedAreas && userSelections.selectedAreas.length > 0) {
    const caseAreas = (caseItem as any).areas || [];
    const matchingAreas = userSelections.selectedAreas
      .map(areaId => {
        const area = AREAS_OF_CONCERN.find(a => a.id === areaId);
        return area ? area.name : null;
      })
      .filter(name => name !== null && caseAreas.includes(name)) as string[];
    
    if (matchingAreas.length > 0) {
      if (matchingAreas.length === 1) {
        reasons.push(`treats your ${matchingAreas[0]} area`);
      } else if (matchingAreas.length === 2) {
        reasons.push(`treats your ${matchingAreas[0]} and ${matchingAreas[1]} areas`);
      } else {
        reasons.push(`treats your selected areas`);
      }
    }
  }
  
  // If no specific reasons found, provide a generic explanation
  if (reasons.length === 0) {
    return 'Relevant based on your selections';
  }
  
  // Combine reasons into a natural sentence
  if (reasons.length === 1) {
    return `This case is relevant because it ${reasons[0]}.`;
  } else if (reasons.length === 2) {
    return `This case is relevant because it ${reasons[0]} and has ${reasons[1]}.`;
  } else {
    const lastReason = reasons.pop();
    return `This case is relevant because it ${reasons.join(', ')}, and has ${lastReason}.`;
  }
}

// Get matching cases for a concern
export function getMatchingCasesForConcern(
  concernId: string,
  caseData: CaseItem[],
  userSelections: Partial<AppState>
): CaseItem[] {
  if (!caseData || caseData.length === 0) {
    return [];
  }

  const concern = HIGH_LEVEL_CONCERNS.find(c => c.id === concernId);
  if (!concern) return [];

  const casesWithScores = caseData.map(caseItem => {
    const score = calculateMatchingScore(caseItem, userSelections);
    return { ...caseItem, matchingScore: score };
  });

const filtered = casesWithScores.filter(caseItem => {
    // FIRST: Check if case has explicit category mapping from CSV
    const caseCategories = CASE_CATEGORY_MAPPING[caseItem.id];
    if (caseCategories && caseCategories.includes(concernId)) {
      return true; // Direct match from CSV mapping
    }

    // SECOND: Fall back to keyword matching if no CSV mapping
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
      typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
    );
    
    // Check name match with normalized keywords
    const nameMatch = concern.mapsToPhotos?.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      // Direct match
      if (caseNameLower.includes(keywordLower)) return true;
      // Match with normalized keyword (handles hyphens/spaces)
      const normalized = normalizeKeyword(keyword);
      const regex = new RegExp(normalized, "i");
      return regex.test(caseNameLower);
    }) || false;
    
    // Check criteria match with normalized keywords
    const criteriaMatch = concern.mapsToPhotos?.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      const normalized = normalizeKeyword(keyword);
      const regex = new RegExp(normalized, "i");
      return matchingCriteriaLower.some(criteria => {
        if (criteria.includes(keywordLower)) return true;
        return regex.test(criteria);
      });
    }) || false;

    // Check solved issues match
    const solvedIssuesLower = ((caseItem.solved || []) as string[]).map(issue =>
      typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
    );
    const solvedMatch = concern.mapsToPhotos?.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      const normalized = normalizeKeyword(keyword);
      const regex = new RegExp(normalized, "i");
      return solvedIssuesLower.some(issue => {
        if (issue.includes(keywordLower)) return true;
        return regex.test(issue);
      });
    }) || false;

    // Also check specific issues if available
    const specificIssuesMatch = concern.mapsToSpecificIssues?.some(issue => {
      const issueLower = issue.toLowerCase();
      const normalized = normalizeKeyword(issue);
      const regex = new RegExp(normalized, "i");
      return caseNameLower.includes(issueLower) ||
             matchingCriteriaLower.some(c => regex.test(c)) ||
             solvedIssuesLower.some(s => regex.test(s));
    }) || false;

    if (nameMatch || criteriaMatch || solvedMatch || specificIssuesMatch) {
      // Now check area filtering if areas are selected
      if (userSelections.selectedAreas && userSelections.selectedAreas.length > 0) {
        const userSelectedAreaNames = userSelections.selectedAreas.map(areaId => {
          const area = AREAS_OF_CONCERN.find(a => a.id === areaId);
          return area ? area.name : null;
        }).filter(name => name !== null) as string[];
        
        // Check if user selected "Full Face"
        const userSelectedFullFace = userSelectedAreaNames.includes('Full Face');
        
        // First check if case has explicit area names from Airtable (e.g., "Skin All")
        const areaNames = (caseItem as any).areaNames;
        if (areaNames) {
          const areaNamesStr = typeof areaNames === 'string' ? areaNames : (Array.isArray(areaNames) ? areaNames.join(' ') : '');
          // If it's a full-face treatment ("Skin All" or similar)
          if (areaNamesStr.toLowerCase().includes('all') || areaNamesStr.toLowerCase() === 'skin') {
            // Full-face treatment matches "Full Face" selection or any individual facial area
            if (userSelectedFullFace) {
              return true;
            }
            const facialAreas = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Jawline', 'Chin', 'Neck'];
            if (userSelectedAreaNames.some(area => facialAreas.includes(area))) {
              return true; // Full-face treatment matches any facial area
            }
          }
          // Check if explicit area names match selected areas
          const caseAreaNames = Array.isArray(areaNames) ? areaNames : [areaNames];
          if (caseAreaNames.some(caseArea => userSelectedAreaNames.includes(caseArea))) {
            return true;
          }
        }
        
        // Check if case is a full-face treatment (only if explicitly set in Airtable)
        const caseRelevantAreas = getRelevantAreasForCase(caseItem);
        if (caseRelevantAreas.includes('Full Face')) {
          // If case is full-face (explicitly set in Airtable), it matches "Full Face" selection or any individual facial area
          if (userSelectedFullFace) {
            return true;
          }
          const facialAreas = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Jawline', 'Chin', 'Neck'];
          if (userSelectedAreaNames.some(area => facialAreas.includes(area))) {
            return true;
          }
        }
        
        // Fall back to keyword matching
        const solvedIssuesLower = ((caseItem.solved || []) as string[]).map(issue =>
          typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
        );
        const allCaseText = [
          caseNameLower,
          ...matchingCriteriaLower,
          ...solvedIssuesLower
        ].join(' ');
        
        // Comprehensive area keyword matching
        const areaKeywords = [
          { keywords: ["brow ptosis", "brow asymmetry", "brow lift", "brow balance", "brow droop"], area: "Forehead" },
          { keywords: ["forehead", "temple", "temples", "glabella", "11s", "temporal"], area: "Forehead" },
          { keywords: ["under eye", "under-eye", "eyelid", "eyelids", "upper eyelid", "lower eyelid"], area: "Eyes" },
          { keywords: ["brow", "brows", "eyebrow", "eyebrows", "eye", "eyes", "ptosis"], area: "Eyes" },
          { keywords: ["cheek", "cheeks", "cheekbone", "mid cheek"], area: "Cheeks" },
          { keywords: ["nose", "nasal", "nasal tip", "dorsal hump"], area: "Nose" },
          { keywords: ["lip", "lips", "mouth", "philtral", "gummy smile"], area: "Lips" },
          { keywords: ["jawline", "jaw", "wide jawline", "define jawline", "jowl", "jowls"], area: "Jawline" },
          { keywords: ["chin", "retruded chin", "labiomental"], area: "Chin" },
          { keywords: ["neck", "neckline"], area: "Neck" },
          { keywords: ["chest", "decolletage", "cleavage"], area: "Chest" },
          { keywords: ["hand", "hands"], area: "Hands" },
          { keywords: ["arm", "arms"], area: "Arms" },
          { keywords: ["body"], area: "Body" }
        ];
        
        const matchedAreas = new Set<string>();
        const facialAreas = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Jawline', 'Chin', 'Neck'];
        areaKeywords.forEach(({ keywords, area }) => {
          if (userSelectedAreaNames.includes(area) || (userSelectedFullFace && facialAreas.includes(area))) {
            keywords.forEach(keyword => {
              if (allCaseText.includes(keyword.toLowerCase())) {
                matchedAreas.add(area);
              }
            });
          }
        });

        // If user selected "Full Face", check if case is explicitly marked as full-face in Airtable
        // Don't automatically treat 4+ areas as full-face - only use explicit "Full Face" from Airtable
        if (userSelectedFullFace) {
          const caseRelevantAreas = getRelevantAreasForCase(caseItem);
          if (caseRelevantAreas.includes('Full Face')) {
            return true;
          }
        }

        // Case must match at least one selected area
        return matchedAreas.size > 0;
      }
      
      return true; // No area filtering, or area match found
    }
    
    return false;
  });

  const nonSurgical = filtered.filter((caseItem) => !isSurgicalCase(caseItem));
  
  console.log(`getMatchingCasesForConcern("${concernId}"): ${caseData.length} total cases, ${filtered.length} after keyword/area filter, ${nonSurgical.length} after surgical filter`);
  
  // Debug: Log cases that didn't match for skin-texture concern
  if (concernId === 'skin-texture' && filtered.length === 0) {
    console.log(`⚠️ No cases matched "Skin Texture". Checking first 10 cases:`);
    caseData.slice(0, 10).forEach((caseItem, idx) => {
      const caseNameLower = (caseItem.name || "").toLowerCase();
      const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
        typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
      );
      const solvedIssuesLower = ((caseItem.solved || []) as string[]).map(issue => 
        typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
      );
      const allText = [caseNameLower, ...matchingCriteriaLower, ...solvedIssuesLower].join(' ');
      console.log(`  ${idx + 1}. "${caseItem.name}"`);
      console.log(`     Text: "${allText.substring(0, 100)}..."`);
      console.log(`     Looking for: ${concern.mapsToPhotos?.join(', ') || 'none'}`);
      const hasKeyword = concern.mapsToPhotos?.some(kw => allText.includes(kw.toLowerCase()));
      const matchedKeywords = concern.mapsToPhotos?.filter(kw => allText.includes(kw.toLowerCase())) || [];
      console.log(`     Has keyword: ${hasKeyword}${matchedKeywords.length > 0 ? ` (matched: ${matchedKeywords.join(', ')})` : ''}`);
    });
  }
  
  return nonSurgical.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
}

// Get relevant areas for a case
export function getRelevantAreasForCase(caseItem: CaseItem): string[] {
  // First, try keyword matching to find specific areas
  const caseNameLower = (caseItem.name || "").toLowerCase();
  const matchingCriteriaLower = ((caseItem.matchingCriteria || []) as string[]).map(c => 
    typeof c === 'string' ? c.toLowerCase() : String(c || '').toLowerCase()
  );
  const solvedIssuesLower = ((caseItem.solved || []) as string[]).map(issue =>
    typeof issue === 'string' ? issue.toLowerCase() : String(issue || '').toLowerCase()
  );
  const allCaseText = [caseNameLower, ...matchingCriteriaLower, ...solvedIssuesLower].join(' ');

  const areaKeywords = [
    { keywords: ["brow ptosis", "brow asymmetry", "brow lift", "brow balance", "brow droop"], area: "Forehead" },
    { keywords: ["forehead", "temple", "temples", "glabella", "11s", "temporal"], area: "Forehead" },
    { keywords: ["under eye", "under-eye", "eyelid", "eyelids", "upper eyelid", "lower eyelid"], area: "Eyes" },
    { keywords: ["brow", "brows", "eyebrow", "eyebrows", "eye", "eyes", "ptosis"], area: "Eyes" },
    { keywords: ["cheek", "cheeks", "cheekbone", "mid cheek"], area: "Cheeks" },
    { keywords: ["nose", "nasal", "nasal tip", "dorsal hump"], area: "Nose" },
    { keywords: ["lip", "lips", "mouth", "philtral", "gummy smile"], area: "Lips" },
    { keywords: ["jawline", "jaw", "wide jawline", "define jawline", "jowl", "jowls"], area: "Jawline" },
    { keywords: ["chin", "retruded chin", "labiomental"], area: "Chin" },
    { keywords: ["neck", "neckline"], area: "Neck" },
    { keywords: ["chest", "decolletage", "cleavage"], area: "Chest" },
    { keywords: ["hand", "hands"], area: "Hands" },
    { keywords: ["arm", "arms"], area: "Arms" },
    { keywords: ["body"], area: "Body" }
  ];

  const matchedAreas = new Set<string>();
  areaKeywords.forEach(({ keywords, area }) => {
    keywords.forEach(keyword => {
      if (allCaseText.includes(keyword.toLowerCase())) {
        matchedAreas.add(area);
      }
    });
  });

  // If keyword matching found specific areas, use those (prefer specific over "Full Face")
  if (matchedAreas.size > 0) {
    return Array.from(matchedAreas);
  }

  // If no specific areas found via keywords, check Airtable areaNames
  const areaNames = (caseItem as any).areaNames;
  if (areaNames) {
    // Handle "Skin All" or similar full-face treatments
    if (typeof areaNames === 'string') {
      if (areaNames.toLowerCase().includes('all') || areaNames.toLowerCase() === 'skin') {
        // Only return "Full Face" if no specific areas were found via keywords
        return ['Full Face'];
      }
      // Single area name - handle "Lips" vs "Mouth & Lips" mapping
      let areaNameToFind = areaNames;
      if (areaNames === 'Lips' || areaNames === 'Mouth & Lips') {
        areaNameToFind = 'Lips'; // AREAS_OF_CONCERN uses "Lips"
      }
      const area = AREAS_OF_CONCERN.find(a => a.name === areaNameToFind || a.name === areaNames);
      if (area) return [area.name];
    }
    // Array of area names
    if (Array.isArray(areaNames)) {
      const matchedAreasFromAirtable: string[] = [];
      let hasFullFace = false;
      areaNames.forEach(areaName => {
        if (typeof areaName === 'string') {
          if (areaName.toLowerCase().includes('all') || areaName.toLowerCase() === 'skin') {
            // Full-face treatment - mark as full face
            hasFullFace = true;
          } else {
            // Handle "Lips" vs "Mouth & Lips" mapping
            let areaNameToFind = areaName;
            if (areaName === 'Mouth & Lips') {
              areaNameToFind = 'Lips'; // AREAS_OF_CONCERN uses "Lips"
            }
            const area = AREAS_OF_CONCERN.find(a => a.name === areaNameToFind || a.name === areaName);
            if (area && !matchedAreasFromAirtable.includes(area.name)) {
              matchedAreasFromAirtable.push(area.name);
            }
          }
        }
      });
      // Prefer specific areas over "Full Face"
      if (matchedAreasFromAirtable.length > 0) {
        return matchedAreasFromAirtable;
      }
      // Only return "Full Face" if no specific areas found
      if (hasFullFace) {
        return ['Full Face'];
      }
    }
  }

  // No areas found
  return [];
}

// Get available areas that have at least one case for at least one selected concern
// This only considers concerns, not selected areas, so the list doesn't change when areas are selected
export function getAvailableAreasForConcerns(
  selectedConcerns: string[],
  caseData: CaseItem[],
  userSelections: Partial<AppState>
): string[] {
  if (selectedConcerns.length === 0) {
    // If no concerns selected, show all areas
    return AREAS_OF_CONCERN.map(a => a.id);
  }

  const availableAreaIds = new Set<string>();

  // For each concern, find all matching cases (without area filtering)
  // Then determine which areas those cases match
  selectedConcerns.forEach(concernId => {
    // Test without area filtering to get all cases for this concern
    const testSelections = {
      ...userSelections,
      selectedConcerns: [concernId],
      selectedAreas: [] // Don't filter by area when determining available areas
    };
    
    const matchingCases = getMatchingCasesForConcern(concernId, caseData, testSelections);
    
    // Track if we have any full-face cases
    let hasFullFaceCase = false;
    const facialAreas = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Jawline', 'Chin', 'Neck'];
    
    // For each matching case, determine which areas it matches
    matchingCases.forEach(caseItem => {
      const caseAreas = getRelevantAreasForCase(caseItem);
      if (caseAreas.includes('Full Face')) {
        hasFullFaceCase = true;
        // Full-face cases match all facial areas, so add all facial areas to available list
        facialAreas.forEach(areaName => {
          const area = AREAS_OF_CONCERN.find(a => a.name === areaName);
          if (area) {
            availableAreaIds.add(area.id);
          }
        });
      } else {
        // For non-full-face cases, add their specific areas
        caseAreas.forEach(areaName => {
          const area = AREAS_OF_CONCERN.find(a => a.name === areaName);
          if (area) {
            availableAreaIds.add(area.id);
          }
        });
      }
    });
    
    // If we have full-face cases, add "Full Face" as an available area option
    if (hasFullFaceCase) {
      const fullFaceArea = AREAS_OF_CONCERN.find(a => a.id === 'full-face');
      if (fullFaceArea) {
        availableAreaIds.add('full-face');
      }
    }
  });

  // If no areas found, return all areas (fallback)
  if (availableAreaIds.size === 0) {
    return AREAS_OF_CONCERN.map(a => a.id);
  }

  return Array.from(availableAreaIds);
}

// Extract concern from case name (removes treatment info)
export function extractConcernFromCaseName(caseName: string | undefined): string {
  if (!caseName) return "General Concern";
  
  // Remove common treatment prefixes/suffixes
  const treatmentPatterns = [
    /^resolve\s+/i,
    /^treat\s+/i,
    /^fix\s+/i,
    /\s+with\s+.*$/i,
    /\s+using\s+.*$/i,
    /\s+via\s+.*$/i,
  ];
  
  let cleaned = caseName;
  treatmentPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  return cleaned.trim() || caseName;
}

// Extract treatment from case name
export function extractTreatmentFromCaseName(caseName: string | undefined): string {
  if (!caseName) return "Treatment";
  
  // Look for "with" or "using" or "via" to extract treatment
  const treatmentMatch = caseName.match(/(?:with|using|via)\s+(.+)$/i);
  if (treatmentMatch && treatmentMatch[1]) {
    return treatmentMatch[1].trim();
  }
  
  return caseName;
}

// Group cases by treatment suggestion
export function groupCasesByTreatmentSuggestion(
  cases: CaseItem[],
  userSelections: Partial<AppState>
): Array<{ suggestion: string; cases: CaseItem[] }> {
  const concernGroups: Record<string, { concern: string; treatments: Record<string, CaseItem[]> }> = {};

  // Calculate matching scores for all cases before grouping
  const casesWithScores = cases.map((caseItem) => {
    if (!caseItem.matchingScore) {
      caseItem.matchingScore = calculateMatchingScore(caseItem, userSelections);
    }
    return caseItem;
  });

  casesWithScores.forEach((caseItem) => {
    const concern = extractConcernFromCaseName(caseItem.name);
    const treatment = extractTreatmentFromCaseName(caseItem.name);

    if (!concernGroups[concern]) {
      concernGroups[concern] = {
        concern: concern,
        treatments: {},
      };
    }

    if (!concernGroups[concern].treatments[treatment]) {
      concernGroups[concern].treatments[treatment] = [];
    }

    concernGroups[concern].treatments[treatment].push(caseItem);
  });

  // Convert to array format for rendering
  const groups = Object.values(concernGroups).map((concernGroup) => {
    const treatments = Object.keys(concernGroup.treatments);
    const allCases = Object.values(concernGroup.treatments).flat();

    // Sort cases by matching score (most similar first)
    const sortedCases = allCases.sort((a, b) => {
      const scoreA = a.matchingScore || 0;
      const scoreB = b.matchingScore || 0;
      return scoreB - scoreA;
    });

    return {
      suggestion: concernGroup.concern,
      cases: sortedCases,
      treatments: treatments.sort(),
      treatmentsByCase: concernGroup.treatments,
    };
  });

  return groups.sort((a, b) => b.cases.length - a.cases.length);
}

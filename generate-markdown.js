// Script to generate markdown file from case data
const fs = require('fs');
const path = require('path');

// Sample cases from app.js (with actual image URLs)
const sampleCases = [
  {
    id: 1,
    name: "Laser Skin Rejuvenation",
    headline: "How I used laser to freshen and protect my skin",
    patient: "Julie, 53 years old",
    patientAge: 53,
    story: "This patient's life is full of outdoor activities and adventures, but she has noticed stubborn spots on her face that get more noticeable after long days in the sun. She was aiming to fade these spots and reduce skin cancer risks.",
    solved: ["even skin tone", "reduce spots"],
    treatment: "Fractional laser treatment targeting sun damage and age spots. The procedure uses advanced laser technology to break down pigmentation while stimulating collagen production for smoother, more even-toned skin.",
    matchingCriteria: ["skin-rejuvenation", "even-skin-tone", "reduce-spots"],
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
    beforeAfter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
  },
  {
    id: 2,
    name: "Anti-Aging Facial Treatment",
    headline: "Achieving a youthful appearance while maintaining a natural look",
    patient: "Sarah, 48 years old",
    patientAge: 48,
    story: "Looking into the mirror each morning, this patient started noticing signs of aging and grew frustrated by minimal results from skincare options. Her goal was achieving a youthful appearance while maintaining a natural look.",
    solved: ["forehead wrinkles", "anti-aging", "natural-look"],
    treatment: "Combination treatment including Botox for forehead lines and dermal fillers for volume restoration. The approach focuses on natural-looking results that enhance rather than alter facial features.",
    matchingCriteria: ["anti-aging", "forehead-wrinkles", "natural-look"],
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23E5F6FE'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
    beforeAfter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23E5F6FE'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
  },
  {
    id: 3,
    name: "Jawline Definition",
    headline: "Restoring jawline definition for a more sculpted look",
    patient: "Michael, 45 years old",
    patientAge: 45,
    story: "This patient noticed his jawline becoming less defined over time, affecting his profile and overall facial structure. He wanted to restore definition without looking overdone.",
    solved: ["improve-definition", "facial-balancing"],
    treatment: "Jawline contouring using dermal fillers strategically placed along the jawline and chin. This creates a more defined, sculpted appearance that enhances the natural bone structure.",
    matchingCriteria: ["improve-definition", "facial-balancing"],
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FAD7A2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
    beforeAfter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FAD7A2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
  },
  {
    id: 4,
    name: "Under Eye Rejuvenation",
    headline: "Brightening tired eyes for a refreshed appearance",
    patient: "Emma, 42 years old",
    patientAge: 42,
    story: "This patient was concerned about dark circles and under-eye bags that made her look tired even after a good night's sleep. She wanted a refreshed, well-rested appearance.",
    solved: ["under-eye-rejuvenation", "anti-aging"],
    treatment: "Under-eye filler treatment using hyaluronic acid fillers to smooth hollows and reduce the appearance of dark circles. The treatment provides immediate results with minimal downtime.",
    matchingCriteria: ["under-eye-rejuvenation", "anti-aging"],
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23E8F5E9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
    beforeAfter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23E8F5E9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
  },
];

// Areas and Issues structure
const areasAndIssues = {
  Forehead: [
    "Forehead Wrinkles",
    "Glabella Wrinkles",
    "Brow Asymmetry",
    "Flat Forehead",
    "Brow Ptosis",
    "Temporal Hollow",
  ],
  Eyes: [
    "Crow's Feet Wrinkles",
    "Under Eye Wrinkles",
    "Under Eye Dark Circles",
    "Excess Upper Eyelid Skin",
    "Lower Eyelid - Excess Skin",
    "Upper Eyelid Droop",
    "Lower Eyelid Sag",
    "Lower Eyelid Bags",
    "Under Eye Hollow",
    "Upper Eye Hollow",
  ],
  Cheeks: [
    "Mid Cheek Flattening",
    "Cheekbone - Not Prominent",
    "Heavy Lateral Cheek",
    "Lower Cheeks - Volume Depletion",
  ],
  Nose: ["Crooked Nose", "Droopy Tip", "Dorsal Hump", "Tip Droop When Smiling"],
  Lips: [
    "Thin Lips",
    "Lacking Philtral Column",
    "Long Philtral Column",
    "Gummy Smile",
    "Asymmetric Lips",
    "Dry Lips",
    "Lip Thinning When Smiling",
  ],
  "Chin/Jaw": [
    "Retruded Chin",
    "Over-Projected Chin",
    "Asymmetric Chin",
    "Jowls",
    "Ill-Defined Jawline",
    "Asymmetric Jawline",
    "Masseter Hypertrophy",
    "Prejowl Sulcus",
  ],
  Neck: [
    "Neck Lines",
    "Loose Neck Skin",
    "Platysmal Bands",
    "Excess/Submental Fullness",
  ],
  Skin: [
    "Dark Spots",
    "Red Spots",
    "Scars",
    "Dry Skin",
    "Whiteheads",
    "Blackheads",
    "Crepey Skin",
    "Nasolabial Folds",
    "Marionette Lines",
    "Bunny Lines",
    "Perioral Wrinkles",
  ],
  Body: ["Weight Loss"],
};

// Simple matching function
function matchesIssue(caseItem, issueName) {
  const issueLower = issueName.toLowerCase();
  const allText = [
    caseItem.name,
    ...caseItem.solved,
    ...caseItem.matchingCriteria,
    caseItem.story,
    caseItem.treatment,
  ]
    .join(" ")
    .toLowerCase();

  // Direct match
  if (allText.includes(issueLower)) return true;

  // Partial matches for common patterns
  const issueWords = issueLower.split(/\s+/).filter((w) => w.length > 2);
  if (issueWords.length > 0) {
    const matches = issueWords.filter((word) => allText.includes(word));
    if (matches.length >= Math.min(2, issueWords.length)) return true;
  }

  // Specific mappings
  if (issueLower.includes("forehead") && caseItem.solved.some((s) => s.includes("forehead"))) return true;
  if (issueLower.includes("jawline") && caseItem.solved.some((s) => s.includes("jawline") || s.includes("definition"))) return true;
  if (issueLower.includes("dark spots") && caseItem.solved.some((s) => s.includes("spot"))) return true;
  if (issueLower.includes("under eye") && caseItem.solved.some((s) => s.includes("under-eye") || s.includes("eye"))) return true;
  if (issueLower.includes("nasolabial") && caseItem.solved.some((s) => s.includes("anti-aging"))) return true;

  return false;
}

// Generate markdown
function generateMarkdown() {
  let markdown = `# Aesthetic Cases Catalog\n\n`;
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += `Total Cases: ${sampleCases.length}\n\n`;
  markdown += `---\n\n`;

  const includedCaseIds = new Set();

  // Organize by Area > Issue > Cases
  for (const [area, issues] of Object.entries(areasAndIssues)) {
    markdown += `## ${area}\n\n`;

    for (const issue of issues) {
      const matchingCases = sampleCases.filter((c) => matchesIssue(c, issue) && !includedCaseIds.has(c.id));

      if (matchingCases.length > 0) {
        markdown += `### ${issue}\n\n`;

        for (const caseItem of matchingCases) {
          includedCaseIds.add(caseItem.id);

          markdown += `#### ${caseItem.headline || caseItem.name}\n\n`;

          if (caseItem.patient) {
            markdown += `**Patient:** ${caseItem.patient}\n\n`;
          }

          // Include images - even SVG placeholders will show in some markdown viewers
          // For Notion, real image URLs from Airtable will work perfectly
          if (caseItem.beforeAfter) {
            if (caseItem.beforeAfter.startsWith("http://") || caseItem.beforeAfter.startsWith("https://")) {
              // Real image URL from Airtable
              markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
            } else if (caseItem.beforeAfter.startsWith("data:image")) {
              // Data URI - include it (works in some viewers, Notion may not support)
              markdown += `<img src="${caseItem.beforeAfter}" alt="Before and After" width="600" />\n\n`;
            }
          } else if (caseItem.thumbnail) {
            if (caseItem.thumbnail.startsWith("http://") || caseItem.thumbnail.startsWith("https://")) {
              // Real image URL from Airtable
              markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
            } else if (caseItem.thumbnail.startsWith("data:image")) {
              // Data URI - include it
              markdown += `<img src="${caseItem.thumbnail}" alt="Case Image" width="400" />\n\n`;
            }
          }

          if (caseItem.story) {
            markdown += `**Story:**\n\n${caseItem.story}\n\n`;
          }

          if (caseItem.solved && caseItem.solved.length > 0) {
            markdown += `**This Solved:**\n\n`;
            caseItem.solved.forEach((issue) => {
              markdown += `- ${issue}\n`;
            });
            markdown += `\n`;
          }

          if (caseItem.treatment) {
            markdown += `**Treatment Details:**\n\n${caseItem.treatment}\n\n`;
          }

          if (caseItem.name) {
            markdown += `**Treatment:** ${caseItem.name}\n\n`;
          }

          if (caseItem.matchingCriteria && caseItem.matchingCriteria.length > 0) {
            markdown += `**Matching Criteria:** ${caseItem.matchingCriteria.join(", ")}\n\n`;
          }

          markdown += `---\n\n`;
        }
      } else {
        // Show placeholder for issues without cases
        markdown += `### ${issue}\n\n`;
        markdown += `*No cases yet - cases will appear here when they match this issue*\n\n`;
      }
    }
  }

  // Add unmatched cases
  const unmatchedCases = sampleCases.filter((c) => !includedCaseIds.has(c.id));
  if (unmatchedCases.length > 0) {
    markdown += `## Other Cases\n\n`;
    markdown += `*Cases that don't match specific issues*\n\n`;

    for (const caseItem of unmatchedCases) {
      markdown += `### ${caseItem.headline || caseItem.name}\n\n`;

      if (caseItem.patient) {
        markdown += `**Patient:** ${caseItem.patient}\n\n`;
      }

      // Include images for unmatched cases too
      if (caseItem.beforeAfter) {
        if (caseItem.beforeAfter.startsWith("http://") || caseItem.beforeAfter.startsWith("https://")) {
          markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
        } else if (caseItem.beforeAfter.startsWith("data:image")) {
          markdown += `<img src="${caseItem.beforeAfter}" alt="Before and After" width="600" />\n\n`;
        }
      } else if (caseItem.thumbnail) {
        if (caseItem.thumbnail.startsWith("http://") || caseItem.thumbnail.startsWith("https://")) {
          markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
        } else if (caseItem.thumbnail.startsWith("data:image")) {
          markdown += `<img src="${caseItem.thumbnail}" alt="Case Image" width="400" />\n\n`;
        }
      }

      if (caseItem.story) {
        markdown += `**Story:**\n\n${caseItem.story}\n\n`;
      }

      if (caseItem.solved && caseItem.solved.length > 0) {
        markdown += `**This Solved:**\n\n`;
        caseItem.solved.forEach((issue) => {
          markdown += `- ${issue}\n`;
        });
        markdown += `\n`;
      }

      if (caseItem.treatment) {
        markdown += `**Treatment Details:**\n\n${caseItem.treatment}\n\n`;
      }

      if (caseItem.name) {
        markdown += `**Treatment:** ${caseItem.name}\n\n`;
      }

      markdown += `---\n\n`;
    }
  }

  return markdown;
}

// Write to file
const markdown = generateMarkdown();
const outputPath = path.join(__dirname, 'aesthetic-cases-export.md');
fs.writeFileSync(outputPath, markdown, 'utf8');
console.log(`✅ Markdown file generated: ${outputPath}`);
console.log(`📄 Total cases: ${sampleCases.length}`);


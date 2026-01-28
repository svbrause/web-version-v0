/**
 * Improve Story Content Generator
 *
 * Creates unique, compelling patient stories inspired by real examples.
 */

const fs = require("fs");

// Read the existing stories
const storiesData = JSON.parse(
  fs.readFileSync("generated-stories.json", "utf8")
);

// Helper to pick random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Treatment explanations - what the treatment actually does
const treatmentExplanations = {
  Filler: [
    "dermal fillers that restore volume and sculpt natural contours",
    "hyaluronic acid fillers strategically placed to enhance definition",
    "injectable fillers that add structure while maintaining natural movement",
  ],
  "Liquid Rhinoplasty": [
    "non-surgical nose reshaping using precisely placed filler",
    "injectable contouring that reshapes without surgery",
    "filler-based nose refinement—no incisions, no downtime",
  ],
  "Heat/Energy": [
    "radiofrequency energy that stimulates collagen deep within the skin",
    "advanced thermal technology that triggers natural skin tightening",
    "energy-based treatment that works with your body's own renewal process",
  ],
  Microneedling: [
    "controlled micro-injuries that trigger the skin's natural healing response",
    "precision needling that stimulates collagen and elastin production",
    "micro-channeling technology that renews skin from within",
  ],
  Blepharoplasty: [
    "precise eyelid surgery that removes excess skin and restores youthful contours",
    "surgical eye rejuvenation that opens and brightens the entire face",
    "expert eyelid lifting that turns back the clock on tired eyes",
  ],
  "Chemical Peel": [
    "medical-grade exfoliation that reveals fresh, renewed skin beneath",
    "customized acid treatment that resurfaces and brightens",
    "precision peeling that addresses texture, tone, and clarity",
  ],
  "Lip Lift": [
    "surgical enhancement that shortens the philtrum and reveals more lip",
    "precise lip repositioning that creates a more youthful smile",
    "surgical lifting that enhances lip visibility and shape permanently",
  ],
  Facelift: [
    "comprehensive facial surgery that lifts, tightens, and restores",
    "surgical rejuvenation that addresses skin, muscle, and underlying structure",
    "expert facial lifting that delivers dramatic yet natural results",
  ],
  Rhinoplasty: [
    "surgical nose reshaping that brings balance to the entire face",
    "precision nasal surgery that refines while preserving character",
    "expert rhinoplasty that creates harmony between features",
  ],
  "Fat Grafting": [
    "natural volume restoration using the patient's own fat cells",
    "fat transfer that simultaneously slims one area while enhancing another",
    "living tissue transplant that integrates naturally and lasts",
  ],
  Threadlift: [
    "dissolvable threads that lift while stimulating new collagen",
    "minimally invasive lifting with immediate and progressive results",
    "thread-based rejuvenation—surgery's results without surgery's downtime",
  ],
  "Topical/Skincare": [
    "medical-grade skincare that treats at the cellular level",
    "prescription-strength actives that deliver real change over time",
    "customized regimen targeting the root causes of concern",
  ],
  Liposuction: [
    "precise fat removal that sculpts and defines",
    "targeted contouring that reveals the shape hidden beneath",
    "surgical fat reduction with permanent results",
  ],
  "Cheek Implant": [
    "custom implants that create lasting cheekbone definition",
    "surgical augmentation that builds permanent facial structure",
    "implant-based enhancement for dramatic, lasting contour",
  ],
  "Jaw Reduction": [
    "surgical refinement that slims and feminizes the jawline",
    "bone contouring that creates elegant, balanced proportions",
    "precision jaw surgery for a more refined profile",
  ],
  "Lateral Canthopexy": [
    "surgical eye corner lifting that creates an alert, youthful look",
    "canthal repositioning that opens and elevates the eye",
    "expert eye surgery that corrects drooping outer corners",
  ],
  "Facial Implant": [
    "custom implants that build permanent facial structure",
    "surgical augmentation for lasting definition",
    "implant-based enhancement that transforms contours",
  ],
};

// Complete story templates - each one is a unique narrative structure
const storyTemplates = {
  // Template 1: The "couldn't budge" struggle story
  stubborn: (issue, treatment, explanation, result, benefit) =>
    `This patient had tried everything to address her ${issue}, but nothing seemed to work. No matter what she did, the concern persisted. She wanted real, visible change—but wasn't sure it was possible. ${treatment}—${explanation.toLowerCase()}—changed everything. ${result} Now, ${benefit}—and she finally has the look she'd been searching for.`,

  // Template 2: The "mirror moment" story
  mirror: (issue, treatment, explanation, result, benefit) =>
    `Every time she looked in the mirror, this patient noticed her ${issue} first. It had started to affect her confidence in photos, at work, even in everyday conversations. She knew she wanted to do something about it, but wanted results that looked natural, not "done." With ${treatment}—${explanation.toLowerCase()}—she got exactly that. ${result} The mirror now reflects the confident, refreshed version of herself she'd been missing.`,

  // Template 3: The "ready for change" story
  ready: (issue, treatment, explanation, result, benefit) =>
    `After years of living with ${issue}, this patient was finally ready for a change. She'd done her research and knew exactly what she wanted: improvement that enhanced her natural features without looking artificial. ${treatment} delivered. Using ${explanation.toLowerCase()}, we crafted results tailored specifically to her face. ${result} She walked out feeling like the best version of herself—${benefit}.`,

  // Template 4: The "no one knows" story
  subtle: (issue, treatment, explanation, result, benefit) =>
    `This patient's goal was simple: fix her ${issue} without anyone knowing she'd had work done. She wanted people to say "you look great" not "what did you do?" With ${treatment}, we achieved exactly that. ${explanation} created subtle enhancement that looks completely natural. ${result} Her friends think she just looks well-rested. We know better.`,

  // Template 5: The "life event" story
  event: (issue, treatment, explanation, result, benefit) =>
    `With a major life event on the horizon, this patient wanted to look and feel her absolute best. Her ${issue} had been on her mind for years, and this felt like the right time to finally address it. ${treatment} was the perfect solution—${explanation.toLowerCase()}, with results ready in time for her big moment. ${result} She felt radiant, confident, and completely herself.`,

  // Template 6: The "didn't know it was possible" story
  discovery: (issue, treatment, explanation, result, benefit) =>
    `This patient didn't realize how much her ${issue} had been affecting her until she saw what was possible. She'd assumed correction would be complicated, require extensive downtime, or produce an unnatural result. ${treatment} proved her wrong. ${explanation}—with results that exceeded her expectations. ${result} She now recommends the treatment to everyone who asks about her transformation.`,

  // Template 7: The "quick and effective" story
  quick: (issue, treatment, explanation, result, benefit) =>
    `This patient wanted to address her ${issue} but didn't have weeks to recover. Between work, family, and life, extended downtime wasn't an option. ${treatment} fit perfectly into her schedule—${explanation.toLowerCase()} with minimal recovery time. ${result} Within days, she was back to her routine—${benefit} and loving her results.`,

  // Template 8: The "dramatic transformation" story
  dramatic: (issue, treatment, explanation, result, benefit) =>
    `Sometimes subtle isn't enough. This patient wanted a dramatic change to her ${issue}—a real transformation that would make a visible difference. ${treatment} delivered beyond expectations. ${explanation} created the striking improvement she was looking for. ${result} The before-and-after speaks for itself: a complete transformation that still looks entirely natural.`,

  // Template 9: The "aging gracefully" story
  aging: (issue, treatment, explanation, result, benefit) =>
    `This patient wasn't trying to look 25 again—she simply wanted to look like a refreshed, well-rested version of herself. Her ${issue} made her appear tired and older than she felt. ${treatment} was the answer. ${explanation} restored what time had taken. ${result} Now she looks exactly as vibrant as she feels inside.`,

  // Template 10: The "professional confidence" story
  professional: (issue, treatment, explanation, result, benefit) =>
    `In her career, first impressions matter. This patient felt her ${issue} undermined her confidence in meetings, presentations, and video calls. She wanted to project the energy and competence she felt inside. ${treatment} helped bridge that gap—${explanation.toLowerCase()} created a more polished, refreshed appearance. ${result} Now her outside matches her inside—sharp, confident, and ready for anything.`,
};

// Issue-specific result descriptions (more vivid and varied)
const issueResults = {
  jawline: [
    "Her jawline now cuts a sharp, elegant line from ear to chin.",
    "The transformation is striking: a sculpted, defined profile that photographs beautifully.",
    "Her face now has the structure she always felt was missing—sleek, contoured, balanced.",
    "From every angle, her jawline looks tighter, more defined, more youthful.",
  ],
  jowls: [
    "The sagging that once blurred her jawline is gone, replaced by smooth, lifted contours.",
    "Her lower face looks years younger—tight, defined, and naturally refreshed.",
    "The jowls that once made her look heavy and tired have been lifted away.",
    "Her profile now shows a clean, continuous line where sagging once was.",
  ],
  eyelid: [
    "Her eyes are open, bright, and alert—the tired look completely erased.",
    "People keep asking if she's been on vacation. She just smiles.",
    "The hooded, heavy appearance is gone. Her eyes look naturally lifted and refreshed.",
    "She can finally wear eyeshadow again—and her eyes are the focal point they should be.",
  ],
  wrinkles: [
    "The lines that once dominated her face have softened into smooth, healthy skin.",
    "Her complexion looks renewed—smoother, brighter, years younger.",
    "The wrinkles that made her feel self-conscious have faded significantly.",
    "Her skin now has the smooth, even texture she remembers from years ago.",
  ],
  cheek: [
    "Her cheekbones are back—lifted, defined, and beautifully sculpted.",
    "Volume has been restored exactly where youth lives: the mid-face.",
    "The hollow, tired look is gone, replaced by youthful fullness and contour.",
    "Her face has regained the heart shape she thought was lost forever.",
  ],
  lips: [
    "Her lips are fuller, more defined, and perfectly proportioned to her face.",
    "The thin, disappearing lips she hated are now full and beautifully shaped.",
    "Her smile is transformed—lips that look naturally plump and youthful.",
    "Volume and definition have been restored, creating the perfect pout.",
  ],
  neck: [
    "Her neck is smooth, tight, and years younger—the lines erased.",
    "From jawline to décolletage, her neck now matches her refreshed face.",
    "The crepey, aging skin has been replaced by smooth, firm tissue.",
    "Her profile is complete: face and neck in perfect, youthful harmony.",
  ],
  "dark circles": [
    "The shadows that once made her look exhausted are gone.",
    "Her under-eyes are bright, smooth, and healthy-looking.",
    "No more concealer required—her natural complexion finally shines through.",
    "The tired look has been replaced by a bright, alert, well-rested appearance.",
  ],
  "droopy tip": [
    "Her nasal tip is lifted, refined, and in perfect balance with her profile.",
    "The drooping that once pulled her face down has been corrected.",
    "Her nose now has the elegant, lifted appearance she always wanted.",
    "From the side, her profile finally looks balanced and harmonious.",
  ],
  nose: [
    "Her nose is refined, balanced, and in perfect harmony with her other features.",
    "The feature that once dominated now complements—subtle yet transformative.",
    "Her profile has achieved the balance she always envisioned.",
    "The change is elegant: noticeable but natural, striking but subtle.",
  ],
  spots: [
    "Her skin is clear, even, and radiant—the discoloration faded to nothing.",
    "The spots that made her feel self-conscious are barely visible now.",
    "Her complexion is uniform and glowing—no more covering up.",
    "Clear, even-toned skin has replaced the patchy pigmentation she hated.",
  ],
  scars: [
    "The scars that once told a story she didn't want to share have faded.",
    "Her skin texture is smoother, more even—the scarring significantly reduced.",
    "What once was obvious is now barely noticeable.",
    "Her skin finally feels like her own again—smooth and clear.",
  ],
  chin: [
    "Her chin is now perfectly proportioned, bringing balance to her entire face.",
    "The weak chin that threw off her profile has been corrected.",
    "From the front and side, her lower face now has perfect harmony.",
    "Her chin provides the anchor her face always needed.",
  ],
};

// Benefit endings (what they gained)
const benefitEndings = [
  "with confidence she hasn't felt in years",
  "finally feeling like herself again",
  "with a natural result that enhances rather than changes",
  "and the boost in confidence that comes with loving what you see",
  "feeling refreshed, renewed, and ready for anything",
  "with results that will only get better with time",
  "knowing the improvement is real and lasting",
  "radiating the confidence she feels inside",
];

// Clean up issue text for use in stories
function cleanIssue(issue) {
  if (!issue) return "";

  let cleaned = issue
    .toLowerCase()
    .replace(/\[deprecated\]/gi, "")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ - /g, " ")
    .trim();

  // Remove action words that may be stuck to the issue
  cleaned = cleaned
    .replace(/^smoothen\s+/i, "")
    .replace(/^smooth\s+/i, "")
    .replace(/^resolve\s+/i, "")
    .replace(/^fade\s+/i, "")
    .replace(/^lighten\s+/i, "")
    .replace(/^diminish\s+/i, "")
    .replace(/^tighten\s+/i, "")
    .replace(/^contour\s+/i, "")
    .replace(/^improve\s+/i, "");

  // Fix common awkward phrasings
  const replacements = {
    "jawline ill-defined": "undefined jawline",
    "jawline ill defined": "undefined jawline",
    "mid cheek flattened": "flattened mid-cheek area",
    "excess skin upper eyelid": "excess upper eyelid skin",
    "excess skin lower eyelid": "excess lower eyelid skin",
    "eyelid droop": "drooping eyelids",
    "upper eyelid droop": "drooping upper eyelids",
    "nasal tip too narrow": "overly narrow nasal tip",
    "nasal tip too wide": "overly wide nasal tip",
    "lacking philtral column": "undefined philtral columns",
    "long philtral column": "elongated philtrum",
    "deep labiomental groove": "prominent labiomental fold",
    "prejowl sulcus": "pre-jowl hollowing",
    "negative canthal tilt": "downturned outer eye corners",
    "over-projected chin": "overly prominent chin",
    "under-projected chin": "recessed chin",
    "smoothen wrinkles": "wrinkles",
  };

  for (const [from, to] of Object.entries(replacements)) {
    if (cleaned.includes(from)) {
      cleaned = cleaned.replace(from, to);
    }
  }

  return cleaned;
}

// Find issue key for matching
function findIssueKey(issue) {
  const issueLower = issue.toLowerCase();
  const keys = Object.keys(issueResults);
  for (const key of keys) {
    if (issueLower.includes(key)) return key;
  }
  return null;
}

// Generate a unique story
function generateImprovedStory(caseData) {
  const { name } = caseData;

  // Extract treatment and issue
  let treatment = "";
  let issue = "";

  const withMatch = name.match(/with\s+(.+)$/i);
  if (withMatch) {
    treatment = withMatch[1].trim();
  }

  const resolveMatch = name.match(
    /(?:Resolve|Solve|Smooth|Smoothen|Lighten|Fade|Diminish|Tighten|Contour|Improve)\s+(.+?)(?:\s+with|$)/i
  );
  if (resolveMatch) {
    issue = resolveMatch[1].trim();
  } else {
    const parts = name.split(/\s+(?:with|using)\s+/i);
    if (parts.length > 0) {
      issue = parts[0]
        .replace(
          /^(?:Resolve|Solve|Smooth|Smoothen|Lighten|Fade|Diminish|Tighten|Contour|Improve)\s+/i,
          ""
        )
        .trim();
    }
  }

  // Handle cases without standard format (e.g., "Motus AZ+ Laser Hair Removal")
  if (!issue && !treatment) {
    // Use the whole name as both issue and treatment context
    issue = name.toLowerCase();
    treatment = name;
  } else if (!issue && treatment) {
    issue = "appearance concerns";
  } else if (issue && !treatment) {
    treatment = "targeted treatment";
  }

  const cleanedIssue = cleanIssue(issue) || "appearance concerns";
  const issueKey = findIssueKey(issue);

  // Get treatment explanation (capitalize first letter)
  const explanations = treatmentExplanations[treatment] || [
    `advanced ${treatment} techniques`,
    `customized ${treatment} treatment`,
    `precision ${treatment} approach`,
  ];
  let explanation = pick(explanations);
  explanation = explanation.charAt(0).toUpperCase() + explanation.slice(1);

  // Get result description
  const results = issueResults[issueKey] || [
    "The results exceeded her expectations.",
    "The transformation is visible and beautiful.",
    "She achieved exactly what she was hoping for.",
  ];
  const result = pick(results);

  // Get benefit ending
  const benefit = pick(benefitEndings);

  // Pick a random template
  const templateKeys = Object.keys(storyTemplates);
  const templateKey = pick(templateKeys);
  const template = storyTemplates[templateKey];

  // Generate the story
  return template(cleanedIssue, treatment, explanation, result, benefit);
}

// Generate title
function generateImprovedTitle(caseData) {
  const { name } = caseData;

  let treatment = "";
  const withMatch = name.match(/with\s+(.+)$/i);
  if (withMatch) treatment = withMatch[1].trim();

  let issue = "";
  const resolveMatch = name.match(
    /(?:Resolve|Solve|Smooth|Smoothen|Lighten|Fade|Diminish|Tighten|Contour|Improve)\s+(.+?)(?:\s+with|$)/i
  );
  if (resolveMatch) {
    issue = resolveMatch[1].trim();
  }

  // Handle non-standard cases
  if (!issue && !treatment) {
    // For cases like "Motus AZ+ Laser Hair Removal", use the whole name
    return `My ${name} Journey: The Results Speak for Themselves`;
  }

  const cleanedIssue = cleanIssue(issue) || "Appearance";

  // Capitalize first letter of each word for title
  const titleIssue = cleanedIssue
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Determine if surgical
  const isSurgical = [
    "Blepharoplasty",
    "Facelift",
    "Rhinoplasty",
    "Lip Lift",
    "Jaw Reduction",
    "Cheek Implant",
    "Facial Implant",
    "Lateral Canthopexy",
    "Liposuction",
  ].includes(treatment);

  // Title templates - more natural sounding
  const nonSurgicalTitles = [
    `How I Transformed My ${titleIssue} Without Surgery`,
    `The ${treatment} Treatment That Changed Everything`,
    `${treatment}: Real Results, No Downtime`,
    `My Journey to Fixing My ${titleIssue}—No Surgery Needed`,
    `From Frustrated to Fabulous: My ${treatment} Story`,
    `How ${treatment} Gave Me the ${titleIssue} Fix I'd Been Searching For`,
    `The Non-Invasive Solution That Actually Worked`,
    `Why ${treatment} Was the Answer to My ${titleIssue}`,
  ];

  const surgicalTitles = [
    `How ${treatment} Transformed My ${titleIssue}—And My Confidence`,
    `My ${treatment} Story: The Change I'd Been Waiting For`,
    `Why I Finally Said Yes to ${treatment}`,
    `The ${treatment} Decision That Changed My Life`,
    `Sleek, Sculpted, Confident: My ${treatment} Journey`,
    `How I Got the ${titleIssue} I Always Wanted with ${treatment}`,
    `${treatment}: The Best Decision I Ever Made`,
    `From Considering to Confident: My ${treatment} Experience`,
  ];

  return pick(isSurgical ? surgicalTitles : nonSurgicalTitles);
}

// Process all cases
console.log("Generating unique, compelling stories...\n");

const improvedResults = storiesData.results.map((caseData, index) => {
  const improvedStory = generateImprovedStory(caseData);
  const improvedTitle = generateImprovedTitle(caseData);

  if ((index + 1) % 20 === 0) {
    console.log(
      `Processed ${index + 1}/${storiesData.results.length} cases...`
    );
  }

  return {
    ...caseData,
    storyTitle: improvedTitle,
    storyDetailed: improvedStory,
  };
});

// Create output
const output = {
  generatedAt: new Date().toISOString(),
  totalCases: storiesData.totalCases,
  casesNeedingContent: storiesData.casesNeedingContent,
  results: improvedResults,
};

// Save improved JSON
fs.writeFileSync("generated-stories.json", JSON.stringify(output, null, 2));
console.log(`\n✓ Generated ${improvedResults.length} unique stories`);
console.log("✓ Saved to generated-stories.json");

// Also create markdown file
let markdown = "# Unique Patient Stories\n\n";
markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
markdown += `Total cases: ${storiesData.totalCases}\n`;
markdown += `Stories generated: ${improvedResults.length}\n\n`;
markdown += "---\n\n";

improvedResults.forEach((r, index) => {
  markdown += `## ${index + 1}. ${r.name}\n\n`;
  markdown += `**Record ID:** \`${r.recordId}\`\n\n`;
  markdown += `**Story Title:**\n${r.storyTitle}\n\n`;
  markdown += `**Story Detailed:**\n${r.storyDetailed}\n\n`;
  markdown += "---\n\n";
});

fs.writeFileSync("generated-stories.md", markdown);
console.log("✓ Also saved to generated-stories.md for easy review");

console.log("\nDone! Each story now uses a unique narrative template.");










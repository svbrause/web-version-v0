/**
 * Generate Unique Treatment Details for Each Case
 *
 * Creates personalized, engaging treatment detail descriptions
 * and uploads them to Airtable "Treatment Details" column.
 *
 * Usage: node generate-treatment-details.js
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
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

// Helper to pick random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// TREATMENT DETAIL GENERATION - Unique, personalized content for each case
// ============================================================================

// Treatment-specific technical details
const treatmentTechniques = {
  filler: {
    products: [
      "Juvederm Voluma",
      "Restylane Lyft",
      "Sculptra",
      "Radiesse",
      "Juvederm Ultra",
      "Restylane Contour",
      "RHA Collection",
    ],
    techniques: [
      "micro-droplet technique",
      "serial puncture method",
      "linear threading",
      "fanning technique",
      "bolus injection",
      "layered placement",
      "cannula-assisted delivery",
    ],
    depths: [
      "supraperiosteal plane",
      "deep dermal layer",
      "subcutaneous level",
      "at the bone",
      "mid-dermal plane",
    ],
  },
  neurotoxin: {
    products: ["Botox Cosmetic", "Dysport", "Xeomin", "Jeuveau", "Daxxify"],
    patterns: [
      "customized injection pattern",
      "precise muscle mapping",
      "graduated dosing",
      "strategic placement",
    ],
    units: [
      "carefully calibrated units",
      "micro-doses",
      "conservative dosing",
      "precision-measured amounts",
    ],
  },
  laser: {
    settings: [
      "customized energy settings",
      "optimized wavelength parameters",
      "precision-calibrated fluence",
      "tailored pulse duration",
    ],
    passes: [
      "multiple treatment passes",
      "overlapping coverage",
      "systematic grid pattern",
      "targeted spot treatment",
    ],
    cooling: [
      "integrated cooling system",
      "cryogen spray protection",
      "contact cooling tip",
      "chilled air flow",
    ],
  },
  rf: {
    depths: [
      "deep dermal heating",
      "subdermal energy delivery",
      "multi-depth targeting",
      "controlled thermal zones",
    ],
    temperatures: [
      "optimal collagen-remodeling temperature",
      "precise thermal threshold",
      "controlled heating profile",
    ],
  },
  surgical: {
    approaches: [
      "minimally invasive approach",
      "precision incision technique",
      "hidden incision placement",
      "natural crease incision",
    ],
    closures: [
      "layered closure technique",
      "meticulous suturing",
      "tension-free closure",
      "subcuticular stitching",
    ],
  },
};

// Body areas with specific anatomical details
const areaDetails = {
  jawline: [
    "along the mandibular border",
    "at the jaw angle",
    "from chin to angle",
    "prejowl area",
    "along the lower facial contour",
  ],
  cheek: [
    "at the malar eminence",
    "along the zygomatic arch",
    "at the cheek apex",
    "in the submalar hollow",
    "at the lateral cheek",
  ],
  underEye: [
    "in the tear trough",
    "at the nasojugal groove",
    "beneath the orbital rim",
    "along the infraorbital area",
  ],
  lip: [
    "at the vermillion border",
    "in the lip body",
    "at the cupid's bow",
    "along the philtral columns",
    "at the oral commissures",
  ],
  forehead: [
    "across the frontalis muscle",
    "between the brows",
    "at the lateral brow",
    "along forehead creases",
  ],
  nose: [
    "at the dorsum",
    "at the nasal tip",
    "along the bridge",
    "at the alar base",
    "in the supratip area",
  ],
  neck: [
    "along the platysma",
    "at the jawline-neck junction",
    "under the chin",
    "along the neck bands",
  ],
  chin: [
    "at the mentum",
    "along the chin point",
    "at the prejowl sulcus",
    "for forward projection",
  ],
};

// Session and timeline details
const sessionDetails = {
  quick: [
    "in just 15-20 minutes",
    "in a single lunch-hour session",
    "in under 30 minutes",
    "in one quick appointment",
  ],
  standard: [
    "over the course of 45 minutes",
    "in a comprehensive session",
    "during a focused treatment hour",
  ],
  series: [
    "across a tailored series of sessions",
    "over multiple targeted treatments",
    "through a customized treatment course",
  ],
};

// Recovery and result timelines
const recoveryDetails = {
  none: [
    "with zero downtime",
    "returning to normal activities immediately",
    "with no recovery needed",
    "heading straight back to daily life",
  ],
  minimal: [
    "with just a day or two of mild redness",
    "with minimal social downtime",
    "needing only a few days to settle",
    "with brief, manageable recovery",
  ],
  moderate: [
    "with about a week of healing time",
    "allowing 5-7 days for recovery",
    "with expected temporary swelling",
  ],
};

const resultTimelines = {
  immediate: [
    "visible immediately",
    "apparent right from the treatment room",
    "showing instant improvement",
    "evident from day one",
  ],
  gradual: [
    "developing beautifully over 2-4 weeks",
    "revealing themselves over the following month",
    "progressively improving for weeks",
    "unfolding naturally over time",
  ],
  longterm: [
    "continuing to improve for 3-6 months",
    "with collagen remodeling ongoing for months",
    "building and refining over the coming months",
  ],
};

// Comfort and experience details
const comfortDetails = [
  "The experience was comfortable throughout, with topical numbing ensuring the patient felt at ease",
  "Using advanced numbing techniques, the treatment was surprisingly comfortable",
  "The patient reported minimal discomfort, describing it as less than they expected",
  "Comfort was prioritized with numbing cream and a gentle, patient approach",
  "The treatment was well-tolerated, with most patients comparing it to mild pressure",
];

// Personalization phrases
const personalizationPhrases = [
  "tailored specifically to this patient's unique facial anatomy",
  "customized based on careful analysis of this individual's features",
  "designed around this patient's specific goals and natural structure",
  "personalized after thorough assessment of proportions and aesthetics",
  "adapted to complement this patient's distinct characteristics",
];

// Result descriptions by area
const resultDescriptions = {
  jawline: [
    "The result is a noticeably sharper, more defined jawline that photographs beautifully from every angle",
    "Now the jawline has that sculpted definition that was always there, just waiting to be revealed",
    "The transformation created a sleeker, more contoured lower face that the patient absolutely loves",
  ],
  cheek: [
    "The cheeks now have that youthful fullness and lift that brightens the entire face",
    "Volume has been restored to create natural-looking contour that catches light beautifully",
    "The mid-face now has balanced, lifted structure that takes years off the appearance",
  ],
  underEye: [
    "The under-eye area looks dramatically fresher—no more looking tired when you're actually well-rested",
    "Those persistent dark shadows and hollows are now smooth and bright",
    "The tear trough transformation means no more concealer needed for that rested, awake look",
  ],
  lip: [
    "The lips are now perfectly proportioned—fuller, more defined, but still completely natural",
    "The enhancement created beautiful lip shape and volume that the patient had been wanting",
    "Lips are now hydrated-looking, defined, and perfectly in harmony with other facial features",
  ],
  forehead: [
    "The forehead is now smooth and relaxed while still allowing natural expression",
    "Those stubborn lines have softened dramatically without any frozen look",
    "The refreshed forehead takes years off the face while maintaining natural movement",
  ],
  nose: [
    "The nose now has balanced proportions that harmonize beautifully with other features",
    "The profile is refined and elegant, exactly what the patient was hoping for",
    "Subtle refinements have made a significant difference in overall facial harmony",
  ],
  skin: [
    "The skin now has that lit-from-within glow and noticeably smoother texture",
    "Skin quality has transformed—brighter, clearer, and visibly healthier",
    "The complexion is now even, radiant, and years younger in appearance",
  ],
  body: [
    "The treated area is now noticeably more contoured and defined",
    "The sculpting results reveal a shape that diet and exercise alone couldn't achieve",
    "The transformation has given the patient newfound confidence in how they look",
  ],
};

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

function generateTreatmentDetail(caseName, recordId) {
  const nameLower = caseName.toLowerCase();

  // Extract treatment type and target area from case name
  const treatmentInfo = extractTreatmentInfo(nameLower);
  const { treatmentType, area, issueAddressed } = treatmentInfo;

  // Build the treatment detail description
  let detail = "";

  // Opening that sets up the specific treatment
  const openings = [
    `For this patient's ${issueAddressed} concern, we developed a targeted treatment approach.`,
    `Addressing ${issueAddressed} required a thoughtful, customized strategy.`,
    `This patient came to us wanting to address ${issueAddressed}—here's exactly what we did.`,
    `The solution for this patient's ${issueAddressed} involved precise technique and premium products.`,
  ];

  detail += pick(openings) + " ";

  // Treatment-specific details
  detail +=
    generateTreatmentSpecificSection(treatmentType, area, nameLower) + " ";

  // Personalization
  detail += `The treatment was ${pick(personalizationPhrases)}. `;

  // Comfort mention
  detail += pick(comfortDetails) + ". ";

  // Results
  const areaKey = getAreaKey(area);
  if (resultDescriptions[areaKey]) {
    detail += pick(resultDescriptions[areaKey]) + ". ";
  } else {
    detail +=
      "The results exceeded expectations, creating exactly the improvement the patient was hoping for. ";
  }

  // Timeline
  const timeline = getResultTimeline(treatmentType);
  detail += `Results were ${pick(resultTimelines[timeline])}.`;

  return detail.trim();
}

function extractTreatmentInfo(nameLower) {
  let treatmentType = "general";
  let area = "face";
  let issueAddressed = "aesthetic concerns";

  // Determine treatment type
  if (
    nameLower.includes("filler") ||
    nameLower.includes("juvederm") ||
    nameLower.includes("restylane") ||
    nameLower.includes("voluma")
  ) {
    treatmentType = "filler";
  } else if (
    nameLower.includes("botox") ||
    nameLower.includes("dysport") ||
    nameLower.includes("neurotoxin") ||
    nameLower.includes("xeomin")
  ) {
    treatmentType = "neurotoxin";
  } else if (
    nameLower.includes("laser") ||
    nameLower.includes("ipl") ||
    nameLower.includes("bbl") ||
    nameLower.includes("motus") ||
    nameLower.includes("tetra") ||
    nameLower.includes("co2")
  ) {
    treatmentType = "laser";
  } else if (
    nameLower.includes("rf") ||
    nameLower.includes("radiofrequency") ||
    nameLower.includes("everesse") ||
    nameLower.includes("morpheus") ||
    nameLower.includes("scarlet")
  ) {
    treatmentType = "rf";
  } else if (
    nameLower.includes("microneedling") ||
    nameLower.includes("agnes") ||
    nameLower.includes("prp")
  ) {
    treatmentType = "microneedling";
  } else if (nameLower.includes("peel") || nameLower.includes("chemical")) {
    treatmentType = "peel";
  } else if (nameLower.includes("kybella")) {
    treatmentType = "kybella";
  } else if (nameLower.includes("thread")) {
    treatmentType = "thread";
  } else if (
    nameLower.includes("fat grafting") ||
    nameLower.includes("fat transfer")
  ) {
    treatmentType = "fatgraft";
  } else if (
    nameLower.includes("blepharoplasty") ||
    nameLower.includes("rhinoplasty") ||
    nameLower.includes("facelift") ||
    nameLower.includes("liposuction") ||
    nameLower.includes("implant") ||
    nameLower.includes("surgery")
  ) {
    treatmentType = "surgical";
  } else if (
    nameLower.includes("aquafirme") ||
    nameLower.includes("hydra") ||
    nameLower.includes("facial")
  ) {
    treatmentType = "facial";
  } else if (nameLower.includes("physiq") || nameLower.includes("body")) {
    treatmentType = "body";
  } else if (nameLower.includes("hair removal")) {
    treatmentType = "hairremoval";
  }

  // Determine area
  if (nameLower.includes("jaw") || nameLower.includes("jowl")) {
    area = "jawline";
  } else if (
    nameLower.includes("cheek") ||
    nameLower.includes("mid-face") ||
    nameLower.includes("midface")
  ) {
    area = "cheek";
  } else if (
    nameLower.includes("under eye") ||
    nameLower.includes("tear") ||
    nameLower.includes("eye hollow") ||
    nameLower.includes("dark circle")
  ) {
    area = "underEye";
  } else if (nameLower.includes("lip")) {
    area = "lip";
  } else if (
    nameLower.includes("forehead") ||
    nameLower.includes("glabella") ||
    (nameLower.includes("brow") && !nameLower.includes("eyebrow"))
  ) {
    area = "forehead";
  } else if (
    nameLower.includes("nose") ||
    nameLower.includes("nasal") ||
    nameLower.includes("rhinoplasty") ||
    nameLower.includes("tip") ||
    nameLower.includes("hump") ||
    nameLower.includes("dorsal")
  ) {
    area = "nose";
  } else if (
    nameLower.includes("neck") ||
    nameLower.includes("chin") ||
    nameLower.includes("submental")
  ) {
    area = "neck";
  } else if (nameLower.includes("crow") || nameLower.includes("eye")) {
    area = "eye";
  } else if (
    nameLower.includes("skin") ||
    nameLower.includes("spot") ||
    nameLower.includes("texture") ||
    nameLower.includes("pigment") ||
    nameLower.includes("acne") ||
    nameLower.includes("scar")
  ) {
    area = "skin";
  } else if (
    nameLower.includes("body") ||
    nameLower.includes("fat") ||
    nameLower.includes("contour")
  ) {
    area = "body";
  }

  // Extract issue from name
  const issuePatterns = [
    { pattern: /ill-defined|undefined/, issue: "jawline definition" },
    { pattern: /hollow|volume/, issue: "volume loss" },
    { pattern: /wrinkle|line|crease/, issue: "fine lines and wrinkles" },
    { pattern: /sag|droop|ptosis/, issue: "sagging" },
    { pattern: /asymmetr/, issue: "facial asymmetry" },
    { pattern: /dark circle|under eye/, issue: "under-eye darkness" },
    { pattern: /thin lip/, issue: "lip volume" },
    { pattern: /jowl/, issue: "jowling" },
    { pattern: /nose|nasal|tip|hump/, issue: "nasal concerns" },
    { pattern: /spot|pigment/, issue: "skin discoloration" },
    { pattern: /texture|scar/, issue: "skin texture" },
    { pattern: /double chin|submental|fullness/, issue: "submental fullness" },
    { pattern: /neck/, issue: "neck concerns" },
    { pattern: /cheek/, issue: "cheek definition" },
    { pattern: /forehead/, issue: "forehead concerns" },
  ];

  for (const { pattern, issue } of issuePatterns) {
    if (pattern.test(nameLower)) {
      issueAddressed = issue;
      break;
    }
  }

  return { treatmentType, area, issueAddressed };
}

function generateTreatmentSpecificSection(treatmentType, area, nameLower) {
  const areaDetailList = areaDetails[area] || [
    "in the targeted treatment zone",
  ];
  const areaLocation = pick(areaDetailList);

  switch (treatmentType) {
    case "filler":
      const fillerProduct = pick(treatmentTechniques.filler.products);
      const fillerTechnique = pick(treatmentTechniques.filler.techniques);
      const fillerDepth = pick(treatmentTechniques.filler.depths);
      return `We used ${fillerProduct}, a premium hyaluronic acid filler known for its natural results and longevity. The product was placed ${areaLocation} using ${fillerTechnique} at the ${fillerDepth} for optimal integration with the natural tissue. This approach allows for precise sculpting while maintaining natural movement and expression. The treatment was completed ${pick(
        sessionDetails.quick
      )} ${pick(recoveryDetails.minimal)}.`;

    case "neurotoxin":
      const toxinProduct = pick(treatmentTechniques.neurotoxin.products);
      const toxinPattern = pick(treatmentTechniques.neurotoxin.patterns);
      const toxinUnits = pick(treatmentTechniques.neurotoxin.units);
      return `We administered ${toxinProduct} using a ${toxinPattern} designed specifically for this patient's muscle anatomy. ${
        toxinUnits.charAt(0).toUpperCase() + toxinUnits.slice(1)
      } were placed ${areaLocation} to relax overactive muscles while preserving natural expression. Our technique prioritizes the "refreshed, not frozen" look that patients want. Treatment was completed ${pick(
        sessionDetails.quick
      )} ${pick(recoveryDetails.none)}.`;

    case "laser":
      const laserSetting = pick(treatmentTechniques.laser.settings);
      const laserPasses = pick(treatmentTechniques.laser.passes);
      const laserCooling = pick(treatmentTechniques.laser.cooling);
      return `The laser treatment utilized ${laserSetting} specifically calibrated for this patient's skin type and concerns. We performed ${laserPasses} across the treatment area, with ${laserCooling} ensuring patient comfort throughout. The laser energy penetrates to trigger the skin's natural renewal process at a cellular level. Session duration was approximately 30-45 minutes, ${pick(
        recoveryDetails.minimal
      )}.`;

    case "rf":
      const rfDepth = pick(treatmentTechniques.rf.depths);
      const rfTemp = pick(treatmentTechniques.rf.temperatures);
      return `Radiofrequency energy was delivered for ${rfDepth}, reaching the ${rfTemp} required to trigger collagen contraction and new collagen synthesis. The device's real-time temperature monitoring ensures both safety and efficacy. Treatment ${areaLocation} was systematic and thorough, creating controlled thermal zones that stimulate significant tissue remodeling. The session took about 45 minutes, ${pick(
        recoveryDetails.minimal
      )}.`;

    case "microneedling":
      return `Advanced microneedling was performed ${areaLocation} using precision-depth needle penetration customized to the treatment zone. This creates thousands of micro-channels that trigger the body's wound-healing cascade—stimulating collagen I and III production, elastin synthesis, and growth factor release. We applied specialized serums during treatment to maximize penetration and results. The procedure took approximately 45 minutes, ${pick(
        recoveryDetails.minimal
      )}.`;

    case "peel":
      return `A medical-grade chemical peel was applied ${areaLocation}, with the specific formulation and strength selected based on this patient's skin type, concerns, and lifestyle. The peel works by creating controlled exfoliation that removes damaged surface cells and stimulates cellular turnover from below. Multiple layers were applied with careful timing to achieve optimal depth without over-treating. Recovery involves ${pick(
        recoveryDetails.moderate
      ).replace("with ", "")}.`;

    case "kybella":
      return `Kybella (deoxycholic acid) was injected in a precise grid pattern ${areaLocation}. This FDA-approved injectable permanently destroys fat cells by disrupting their membrane—the same mechanism your body uses to digest dietary fat. We carefully mapped the treatment area and administered measured doses at each injection point. Some swelling is expected for 3-5 days as the body processes the destroyed fat cells—that's the treatment working. Multiple sessions may be needed for optimal results.`;

    case "thread":
      return `Dissolvable PDO threads were strategically placed ${areaLocation} to create immediate lifting and long-term collagen stimulation. We used a combination of smooth threads for collagen stimulation and barbed threads for mechanical lifting, customizing the thread pattern to this patient's specific anatomy. The threads create a supportive scaffold that lifts tissue now while triggering new collagen formation over the coming months. Treatment was completed ${pick(
        sessionDetails.standard
      )}, ${pick(recoveryDetails.minimal)}.`;

    case "fatgraft":
      return `Autologous fat grafting was performed, harvesting fat cells from a donor site using gentle liposuction, then purifying and concentrating them before micro-injection ${areaLocation}. This living tissue transfer provides natural-looking, long-lasting volume restoration using the patient's own cells. The fat was placed in tiny droplets across multiple planes to maximize survival rate and create smooth, natural contours. Results improve over 3-6 months as the transferred fat integrates and stabilizes.`;

    case "surgical":
      const surgApproach = pick(treatmentTechniques.surgical.approaches);
      const surgClosure = pick(treatmentTechniques.surgical.closures);
      return `The surgical procedure was performed using a ${surgApproach} to minimize scarring and optimize healing. Precise tissue repositioning and/or removal addressed the underlying structural concerns, not just surface symptoms. The procedure was completed with ${surgClosure} to ensure optimal healing and minimal visible scarring. Recovery timeline was discussed in detail beforehand, with clear post-operative instructions for best results.`;

    case "facial":
      return `This comprehensive facial treatment combined multiple modalities for synergistic results: deep cleansing to remove impurities, gentle exfoliation to refresh surface cells, targeted serums to address specific concerns, and hydration to plump and protect. Advanced delivery systems ensured active ingredients penetrated beyond the surface to where they can create real change. The experience was relaxing and spa-like, yet the results are medical-grade.`;

    case "body":
      return `Body contouring was performed using advanced technology that simultaneously targets fat cells and stimulates muscle ${areaLocation}. The treatment delivers thermal energy to disrupt fat cell membranes while electrical pulses trigger thousands of muscle contractions—like an intensive workout and fat treatment in one session. The procedure is hands-free and comfortable, with most patients reading, working, or relaxing during treatment. Results develop over several weeks as the body processes treated fat cells.`;

    case "hairremoval":
      return `Laser hair removal was performed using advanced technology that targets hair follicles while protecting surrounding skin. The laser energy is absorbed by melanin in the hair shaft, generating heat that damages the follicle and inhibits future growth. Treatment settings were customized for this patient's skin type and hair characteristics. Multiple sessions are required to catch all hairs in their active growth phase, with most patients achieving significant permanent reduction after 6-8 treatments.`;

    default:
      return `The treatment protocol was developed specifically for this patient's unique concerns and anatomy. We used premium products and refined techniques developed over years of specialized practice. Every aspect was considered—from product selection to application method—ensuring optimal results while prioritizing safety and comfort. The session was completed ${pick(
        sessionDetails.standard
      )}.`;
  }
}

function getAreaKey(area) {
  const mapping = {
    jawline: "jawline",
    cheek: "cheek",
    underEye: "underEye",
    lip: "lip",
    forehead: "forehead",
    nose: "nose",
    eye: "underEye",
    neck: "jawline",
    skin: "skin",
    body: "body",
    face: "skin",
  };
  return mapping[area] || "skin";
}

function getResultTimeline(treatmentType) {
  const immediateTypes = ["filler", "thread"];
  const gradualTypes = ["neurotoxin", "peel", "kybella"];
  const longtermTypes = [
    "laser",
    "rf",
    "microneedling",
    "surgical",
    "fatgraft",
  ];

  if (immediateTypes.includes(treatmentType)) return "immediate";
  if (gradualTypes.includes(treatmentType)) return "gradual";
  if (longtermTypes.includes(treatmentType)) return "longterm";
  return "gradual";
}

// ============================================================================
// AIRTABLE INTEGRATION
// ============================================================================

async function fetchAllRecords() {
  console.log("Fetching all records from Airtable...");
  let allRecords = [];
  let offset = null;

  do {
    const url = offset
      ? `${AIRTABLE_API_URL}?offset=${offset}`
      : AIRTABLE_API_URL;

    const response = await fetch(url);
    const data = await response.json();

    if (data.records) {
      allRecords = allRecords.concat(data.records);
      console.log(`  Fetched ${allRecords.length} records so far...`);
    }

    offset = data.offset;
    if (offset) await sleep(200);
  } while (offset);

  console.log(`✓ Fetched ${allRecords.length} total records`);
  return allRecords;
}

async function updateRecordsBatch(records) {
  const updates = records.map((record) => ({
    id: record.recordId,
    fields: {
      "Treatment Details": record.treatmentDetails,
    },
  }));

  const response = await fetch(AIRTABLE_API_URL, {
    method: "PATCH",
    body: JSON.stringify({ records: updates }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Error updating records:", result);
    throw new Error(`Failed to update records: ${JSON.stringify(result)}`);
  }

  return result;
}

async function main() {
  console.log("=".repeat(60));
  console.log("TREATMENT DETAILS GENERATOR");
  console.log("=".repeat(60));
  console.log("");

  // Fetch all records from Airtable
  const records = await fetchAllRecords();

  // Generate treatment details for each record
  console.log("\nGenerating unique treatment details...");
  const updates = [];

  for (const record of records) {
    const name = record.fields?.Name || "";
    if (!name) continue;

    // Skip if already has treatment details (optional - remove if you want to overwrite)
    // if (record.fields?.["Treatment Details"]) continue;

    const treatmentDetails = generateTreatmentDetail(name, record.id);
    updates.push({
      recordId: record.id,
      name: name,
      treatmentDetails: treatmentDetails,
    });
  }

  console.log(`✓ Generated ${updates.length} treatment details`);

  // Save to JSON for review
  const outputPath = "generated-treatment-details.json";
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalRecords: updates.length,
        results: updates,
      },
      null,
      2
    )
  );
  console.log(`✓ Saved to ${outputPath} for review`);

  // Upload to Airtable in batches
  console.log("\nUploading to Airtable...");
  const batchSize = 10;
  let uploaded = 0;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    try {
      await updateRecordsBatch(batch);
      uploaded += batch.length;
      console.log(`  Uploaded ${uploaded}/${updates.length} records...`);
    } catch (error) {
      console.error(`  Error uploading batch starting at ${i}:`, error.message);
    }
    await sleep(250); // Rate limiting
  }

  console.log("");
  console.log("=".repeat(60));
  console.log(`✓ COMPLETE: Updated ${uploaded} records with treatment details`);
  console.log("=".repeat(60));

  // Show a few examples
  console.log("\n📝 Sample generated treatment details:\n");
  for (let i = 0; i < Math.min(3, updates.length); i++) {
    console.log(`Case: "${updates[i].name}"`);
    console.log(`Detail: ${updates[i].treatmentDetails.substring(0, 200)}...`);
    console.log("");
  }
}

main().catch(console.error);










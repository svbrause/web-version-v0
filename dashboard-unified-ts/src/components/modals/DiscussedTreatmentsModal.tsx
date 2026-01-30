// Discussed Treatments Modal – treatments/products discussed with patient in clinic, linked to treatment interests

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Client, DiscussedItem } from "../../types";
import { updateLeadRecord } from "../../services/api";
import { showToast, showError } from "../../utils/toast";
import { groupIssuesByArea } from "../../utils/issueMapping";
import "./DiscussedTreatmentsModal.css";

/** Hook: true when viewport is narrow (e.g. mobile). Use for native select fallbacks. */
function useIsNarrowScreen(maxWidthPx = 768): boolean {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${maxWidthPx}px)`).matches
      : false
  );
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const onChange = () => setIsNarrow(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, [maxWidthPx]);
  return isNarrow;
}

const AIRTABLE_FIELD = "Treatments Discussed";
const OTHER_LABEL = "Other";
/** Placeholder treatment when user adds only a goal (no specific treatments). */
const TREATMENT_GOAL_ONLY = "Goal only";

/** Add-entry mode: start by patient goal, assessment finding, or treatment */
export type AddByMode = "goal" | "finding" | "treatment";

/** Assessment findings (e.g. from facial analysis) – user can add by finding first */
const ASSESSMENT_FINDINGS = [
  "Thin Lips",
  "Dry Lips",
  "Asymmetric Lips",
  "Under Eye Hollows",
  "Under Eye Wrinkles",
  "Excess Upper Eyelid Skin",
  "Forehead Wrinkles",
  "Bunny Lines",
  "Crow's feet",
  "Mid Cheek Flattening",
  "Cheekbone - Not Prominent",
  "Nasolabial Folds",
  "Marionette Lines",
  "Prejowl Sulcus",
  "Retruded Chin",
  "Ill-Defined Jawline",
  "Jowls",
  "Excess/Submental Fullness",
  "Over-Projected Chin",
  "Temporal Hollow",
  "Platysmal Bands",
  "Loose Neck Skin",
  "Dark Spots",
  "Red Spots",
  "Gummy Smile",
  "Dorsal Hump",
  "Crooked Nose",
  "Droopy Tip",
  "Eyelid Bags",
  "Scars",
  "Fine Lines",
  "Masseter Hypertrophy",
  "Sagging Skin",
];
const OTHER_FINDING_LABEL = "Other finding";

/** Assessment findings grouped by area (for "by treatment" flow and organization) */
const ASSESSMENT_FINDINGS_BY_AREA: { area: string; findings: string[] }[] = [
  {
    area: "Lips",
    findings: ["Thin Lips", "Dry Lips", "Asymmetric Lips", "Gummy Smile"],
  },
  {
    area: "Eyes",
    findings: [
      "Under Eye Hollows",
      "Under Eye Wrinkles",
      "Excess Upper Eyelid Skin",
      "Eyelid Bags",
      "Crow's feet",
    ],
  },
  {
    area: "Forehead",
    findings: ["Forehead Wrinkles", "Bunny Lines", "Temporal Hollow"],
  },
  {
    area: "Cheeks",
    findings: ["Mid Cheek Flattening", "Cheekbone - Not Prominent"],
  },
  { area: "Nasolabial", findings: ["Nasolabial Folds", "Marionette Lines"] },
  {
    area: "Jawline",
    findings: [
      "Prejowl Sulcus",
      "Retruded Chin",
      "Ill-Defined Jawline",
      "Jowls",
      "Excess/Submental Fullness",
      "Over-Projected Chin",
      "Masseter Hypertrophy",
    ],
  },
  { area: "Neck", findings: ["Platysmal Bands", "Loose Neck Skin"] },
  {
    area: "Skin",
    findings: [
      "Dark Spots",
      "Red Spots",
      "Scars",
      "Fine Lines",
      "Sagging Skin",
    ],
  },
  { area: "Nose", findings: ["Dorsal Hump", "Crooked Nose", "Droopy Tip"] },
];

/** Skincare: specific products (brand + product) for carousel */
const SKINCARE_PRODUCTS = [
  "Skinceuticals Retinol 0.3",
  "Skinceuticals Retinol 0.5",
  "Skinceuticals Retinol 1.0",
  "SkinMedica Retinol 0.25",
  "SkinMedica Retinol 0.5",
  "SkinMedica Retinol 1.0",
  "CeraVe Resurfacing Retinol Serum",
  "Paula's Choice 1% Retinol",
  "Skinceuticals C E Ferulic",
  "Skinceuticals Phloretin CF",
  "SkinMedica Vitamin C+ E Complex",
  "Drunk Elephant C-Firma",
  "Skinceuticals Hyaluronic Acid",
  "SkinMedica HA5 Rejuvenating Hydrator",
  "CeraVe Moisturizing Cream",
  "Skinceuticals Blemish + Age Defense",
  "Paula's Choice 2% BHA",
  "SkinMedica Lytic Treatment",
  "Skinceuticals Discoloration Defense",
  "SkinMedica Even Correct",
  "Skinceuticals Metacell Renewal B3",
  "SkinMedica TNS Advanced+",
  "Neostrata Glycolic Renewal",
  "Skinceuticals LHA Toner",
  "EltaMD UV Clear",
  "Skinceuticals Triple Lipid Restore",
  "Other",
];
/** Laser: specific devices for carousel */
const LASER_DEVICES = [
  "Moxi",
  "Halo",
  "BBL (BroadBand Light)",
  "Moxi + BBL",
  "PicoSure",
  "PicoWay",
  "Fraxel",
  "Clear + Brilliant",
  "IPL (Intense Pulsed Light)",
  "Sciton ProFractional",
  "Laser Genesis",
  "VBeam (Pulsed Dye)",
  "Excel V",
  "AcuPulse",
  "Other",
];
const OTHER_PRODUCT_LABEL = "Other";
const SEE_ALL_OPTIONS_LABEL = "See all options";

/** Recommended product subsets by goal/finding context (keyword match). Curated list for most cases; user can "See all" for the rest. */
const RECOMMENDED_PRODUCTS_BY_CONTEXT: {
  treatment: string;
  keywords: string[];
  products: string[];
}[] = [
  /* Skincare – hydration / dry */
  {
    treatment: "Skincare",
    keywords: ["hydrate", "dry", "moisturize", "barrier", "laxity"],
    products: [
      "Skinceuticals Hyaluronic Acid",
      "SkinMedica HA5 Rejuvenating Hydrator",
      "CeraVe Moisturizing Cream",
      "Skinceuticals Triple Lipid Restore",
    ],
  },
  /* Skincare – acne / red spots / oil */
  {
    treatment: "Skincare",
    keywords: [
      "acne",
      "red spot",
      "oil",
      "breakout",
      "pore",
      "salicylic",
      "benzoyl",
    ],
    products: [
      "Skinceuticals Blemish + Age Defense",
      "Paula's Choice 2% BHA",
      "SkinMedica Lytic Treatment",
    ],
  },
  /* Skincare – dark spots / pigmentation */
  {
    treatment: "Skincare",
    keywords: [
      "dark spot",
      "pigment",
      "even skin",
      "tone",
      "hyperpigmentation",
      "melasma",
    ],
    products: [
      "Skinceuticals C E Ferulic",
      "Skinceuticals Phloretin CF",
      "SkinMedica Vitamin C+ E Complex",
      "Skinceuticals Discoloration Defense",
      "SkinMedica Even Correct",
      "EltaMD UV Clear",
    ],
  },
  /* Skincare – fine lines / anti-aging */
  {
    treatment: "Skincare",
    keywords: [
      "fine line",
      "smoothen",
      "wrinkle",
      "anti-aging",
      "exfoliate",
      "scar",
    ],
    products: [
      "Skinceuticals Retinol 0.3",
      "Skinceuticals Retinol 0.5",
      "SkinMedica Retinol 0.25",
      "SkinMedica Retinol 0.5",
      "Skinceuticals C E Ferulic",
      "SkinMedica TNS Advanced+",
      "Skinceuticals Metacell Renewal B3",
      "Neostrata Glycolic Renewal",
    ],
  },
  /* Skincare – sensitivity / barrier */
  {
    treatment: "Skincare",
    keywords: ["sensitive", "redness", "irritat", "licorice", "centella"],
    products: [
      "CeraVe Moisturizing Cream",
      "Skinceuticals Triple Lipid Restore",
      "EltaMD UV Clear",
    ],
  },
  /* Laser – pigment / dark spots */
  {
    treatment: "Laser",
    keywords: [
      "dark spot",
      "pigment",
      "even skin",
      "tone",
      "red spot",
      "vascular",
    ],
    products: [
      "BBL (BroadBand Light)",
      "IPL (Intense Pulsed Light)",
      "PicoSure",
      "PicoWay",
      "VBeam (Pulsed Dye)",
      "Excel V",
    ],
  },
  /* Laser – resurfacing / lines */
  {
    treatment: "Laser",
    keywords: [
      "fine line",
      "smoothen",
      "wrinkle",
      "resurfacing",
      "scar",
      "exfoliate",
    ],
    products: [
      "Moxi",
      "Halo",
      "Moxi + BBL",
      "Fraxel",
      "Clear + Brilliant",
      "Sciton ProFractional",
      "AcuPulse",
    ],
  },
  /* Chemical peel – acne / oil */
  {
    treatment: "Chemical Peel",
    keywords: ["acne", "oil", "red spot", "exfoliate"],
    products: ["Salicylic", "Glycolic", "Jessner", "Mandelic"],
  },
  /* Chemical peel – pigmentation */
  {
    treatment: "Chemical Peel",
    keywords: ["dark spot", "pigment", "even skin", "tone"],
    products: ["Glycolic", "TCA", "Mandelic", "VI Peel", "Lactic acid"],
  },
  /* Chemical peel – anti-aging */
  {
    treatment: "Chemical Peel",
    keywords: ["fine line", "smoothen", "wrinkle", "exfoliate"],
    products: ["Glycolic", "TCA", "Lactic acid", "Jessner"],
  },
  /* Filler – lips */
  {
    treatment: "Filler",
    keywords: ["lip", "lips", "balance lips", "thin lips", "dry lips"],
    products: ["Hyaluronic acid (HA) – lip"],
  },
  /* Filler – cheeks / volume */
  {
    treatment: "Filler",
    keywords: ["cheek", "volume", "mid cheek", "cheekbone", "hollow"],
    products: [
      "Hyaluronic acid (HA) – cheek",
      "PLLA / Sculptra",
      "Calcium hydroxyapatite (e.g. Radiesse)",
    ],
  },
  /* Filler – nasolabial / marionette */
  {
    treatment: "Filler",
    keywords: ["nasolabial", "marionette", "shadow", "smile line"],
    products: [
      "Hyaluronic acid (HA) – nasolabial",
      "Hyaluronic acid (HA) – other",
    ],
  },
  /* Filler – tear trough / under eye */
  {
    treatment: "Filler",
    keywords: ["under eye", "tear trough", "hollow", "eyelid"],
    products: [
      "Hyaluronic acid (HA) – tear trough",
      "Hyaluronic acid (HA) – other",
    ],
  },
  /* Neurotoxin – lines */
  {
    treatment: "Neurotoxin",
    keywords: [
      "fine line",
      "smoothen",
      "wrinkle",
      "forehead",
      "crow",
      "bunny",
      "gummy smile",
    ],
    products: [
      "OnabotulinumtoxinA (Botox)",
      "AbobotulinumtoxinA (Dysport)",
      "IncobotulinumtoxinA (Xeomin)",
      "PrabotulinumtoxinA (Jeuveau)",
      "DaxibotulinumtoxinA (Daxxify)",
    ],
  },
  /* Microneedling – general */
  {
    treatment: "Microneedling",
    keywords: ["scar", "fine line", "texture", "pore", "laxity", "tighten"],
    products: [
      "Standard microneedling",
      "RF microneedling",
      "With growth factors / PRP",
      "Nanoneedling",
    ],
  },
];

function getRecommendedProducts(
  treatment: string,
  contextString: string
): string[] {
  if (!contextString.trim()) return [];
  const lower = contextString.toLowerCase();
  const allOptions = TREATMENT_PRODUCT_OPTIONS[treatment];
  if (!allOptions) return [];
  const baseList = allOptions.filter((p) => p !== OTHER_PRODUCT_LABEL);
  const recommended = new Set<string>();
  for (const row of RECOMMENDED_PRODUCTS_BY_CONTEXT) {
    if (row.treatment !== treatment) continue;
    if (row.keywords.some((k) => lower.includes(k))) {
      row.products
        .filter((p) => baseList.includes(p))
        .forEach((p) => recommended.add(p));
    }
  }
  return Array.from(recommended);
}

/** Treatment type / product options per treatment (for product selector when that treatment is selected) */
const TREATMENT_PRODUCT_OPTIONS: Record<string, string[]> = {
  Skincare: [...SKINCARE_PRODUCTS],
  Laser: [...LASER_DEVICES],
  Radiofrequency: [
    "Microneedling RF (e.g. Morpheus8, Secret RF)",
    "Monopolar (e.g. Thermage)",
    "Bipolar",
    "Tripolar (e.g. Tripollar)",
    "Fractional RF",
    "Sublative RF",
    "Multipolar",
    "RF microneedling",
    OTHER_PRODUCT_LABEL,
  ],
  Filler: [
    "Hyaluronic acid (HA) – lip",
    "Hyaluronic acid (HA) – cheek",
    "Hyaluronic acid (HA) – nasolabial",
    "Hyaluronic acid (HA) – tear trough",
    "Hyaluronic acid (HA) – other",
    "Calcium hydroxyapatite (e.g. Radiesse)",
    "PLLA / Sculptra",
    "Polycaprolactone (e.g. Ellansé)",
    OTHER_PRODUCT_LABEL,
  ],
  Neurotoxin: [
    "OnabotulinumtoxinA (Botox)",
    "AbobotulinumtoxinA (Dysport)",
    "IncobotulinumtoxinA (Xeomin)",
    "PrabotulinumtoxinA (Jeuveau)",
    "DaxibotulinumtoxinA (Daxxify)",
    "LetibotulinumtoxinA (Letybo)",
    "RimabotulinumtoxinB (Myobloc)",
    OTHER_PRODUCT_LABEL,
  ],
  "Chemical Peel": [
    "Glycolic",
    "Salicylic",
    "TCA",
    "Jessner",
    "Lactic acid",
    "Mandelic",
    "Phenol (deep)",
    "VI Peel",
    "Blue peel",
    "Enzyme peel",
    OTHER_PRODUCT_LABEL,
  ],
  Microneedling: [
    "Standard microneedling",
    "RF microneedling",
    "Nanoneedling",
    "Dermaroller",
    "Dermapen",
    "With growth factors / PRP",
    OTHER_PRODUCT_LABEL,
  ],
  Kybella: [
    "Kybella (deoxycholic acid)",
    "Other injectable",
    OTHER_PRODUCT_LABEL,
  ],
  Threadlift: [
    "PDO threads",
    "PCL threads",
    "Suspension threads",
    "Barbed",
    "Smooth",
    OTHER_PRODUCT_LABEL,
  ],
};

/** Findings that map to a given treatment (via getGoalRegionTreatmentsForFinding) */
function getFindingsForTreatment(treatment: string): string[] {
  const lower = (treatment || "").toLowerCase();
  const found: string[] = [];
  for (const areaRow of ASSESSMENT_FINDINGS_BY_AREA) {
    for (const f of areaRow.findings) {
      const mapped = getGoalRegionTreatmentsForFinding(f);
      if (mapped?.treatments.some((t) => t.toLowerCase() === lower))
        found.push(f);
    }
  }
  return found;
}

/** Findings for treatment grouped by area (only areas that have at least one finding for this treatment) */
function getFindingsByAreaForTreatment(
  treatment: string
): { area: string; findings: string[] }[] {
  const findingsForTx = new Set(getFindingsForTreatment(treatment));
  return ASSESSMENT_FINDINGS_BY_AREA.map(({ area, findings }) => ({
    area,
    findings: findings.filter((f) => findingsForTx.has(f)),
  })).filter((g) => g.findings.length > 0);
}

/** Map goal (interest) → suggested region(s) so region dropdown can be filtered/pre-filled */
const GOAL_TO_REGIONS: { keywords: string[]; regions: string[] }[] = [
  { keywords: ["lip", "lips"], regions: ["Lips"] },
  {
    keywords: ["eye", "eyelid", "under eye", "shadow", "tear trough"],
    regions: ["Under eyes", "Forehead", "Crow's feet"],
  },
  {
    keywords: ["brow", "forehead"],
    regions: ["Forehead", "Glabella", "Crow's feet"],
  },
  { keywords: ["cheek"], regions: ["Cheeks", "Nasolabial"] },
  {
    keywords: ["jaw", "jawline", "prejowl", "jowl", "chin", "submentum"],
    regions: ["Jawline"],
  },
  { keywords: ["neck", "platysmal"], regions: ["Jawline"] },
  { keywords: ["nose"], regions: ["Other"] },
  {
    keywords: [
      "skin",
      "tone",
      "scar",
      "line",
      "exfoliate",
      "hydrate skin",
      "laxity",
      "tighten",
    ],
    regions: [
      "Nasolabial",
      "Forehead",
      "Glabella",
      "Crow's feet",
      "Cheeks",
      "Jawline",
      "Under eyes",
      "Other",
    ],
  },
];

/** Map assessment finding → suggested goal, region, and treatments (from catalog logic) */
const FINDING_TO_GOAL_REGION_TREATMENTS: {
  keywords: string[];
  goal: string;
  region: string;
  treatments: string[];
}[] = [
  {
    keywords: ["thin lips", "asymmetric lips"],
    goal: "Balance Lips",
    region: "Lips",
    treatments: ["Filler", "Neurotoxin"],
  },
  {
    keywords: ["dry lips"],
    goal: "Hydrate Lips",
    region: "Lips",
    treatments: ["Filler", "Skincare"],
  },
  {
    keywords: ["under eye hollow", "eyelid bag", "tear trough"],
    goal: "Rejuvenate Lower Eyelids",
    region: "Under eyes",
    treatments: ["Filler"],
  },
  {
    keywords: ["under eye wrinkle"],
    goal: "Smoothen Fine Lines",
    region: "Under eyes",
    treatments: ["Neurotoxin", "Filler", "Microneedling", "Laser"],
  },
  {
    keywords: ["excess upper eyelid", "excess skin"],
    goal: "Rejuvenate Upper Eyelids",
    region: "Other",
    treatments: ["Laser", "Radiofrequency", "Chemical Peel"],
  },
  {
    keywords: ["forehead wrinkle", "bunny line", "crow's feet"],
    goal: "Smoothen Fine Lines",
    region: "Forehead",
    treatments: ["Neurotoxin", "Filler", "Laser"],
  },
  {
    keywords: ["mid cheek", "cheek flatten", "cheekbone"],
    goal: "Improve Cheek Definition",
    region: "Cheeks",
    treatments: ["Filler"],
  },
  {
    keywords: ["nasolabial", "marionette", "smile line"],
    goal: "Shadow Correction",
    region: "Nasolabial",
    treatments: ["Filler", "Laser", "Chemical Peel", "Microneedling"],
  },
  {
    keywords: ["prejowl", "retruded chin", "chin"],
    goal: "Balance Jawline",
    region: "Jawline",
    treatments: ["Filler"],
  },
  {
    keywords: ["jowl", "ill-defined jaw", "submental", "over-project"],
    goal: "Contour Jawline",
    region: "Jawline",
    treatments: ["Filler", "Kybella", "Radiofrequency"],
  },
  {
    keywords: ["temporal hollow"],
    goal: "Balance Forehead",
    region: "Forehead",
    treatments: ["Filler"],
  },
  {
    keywords: ["platysmal", "loose neck", "neck"],
    goal: "Contour Neck",
    region: "Jawline",
    treatments: ["Neurotoxin", "Kybella", "Radiofrequency"],
  },
  {
    keywords: ["dark spot", "red spot"],
    goal: "Even Skin Tone",
    region: "Other",
    treatments: ["Laser", "Chemical Peel", "Skincare"],
  },
  {
    keywords: ["gummy smile"],
    goal: "Balance Lips",
    region: "Lips",
    treatments: ["Neurotoxin"],
  },
  {
    keywords: ["dorsal hump", "crooked nose", "droopy tip"],
    goal: "Balance Nose",
    region: "Other",
    treatments: ["Filler"],
  },
  {
    keywords: ["scar", "fine line"],
    goal: "Smoothen Fine Lines",
    region: "Other",
    treatments: [
      "Laser",
      "Chemical Peel",
      "Microneedling",
      "Filler",
      "Neurotoxin",
    ],
  },
  {
    keywords: ["masseter", "hypertrophy"],
    goal: "Contour Jawline",
    region: "Jawline",
    treatments: ["Neurotoxin"],
  },
  {
    keywords: ["sagging", "laxity"],
    goal: "Tighten Skin Laxity",
    region: "Other",
    treatments: ["Radiofrequency", "Threadlift", "Laser"],
  },
];

function getGoalRegionTreatmentsForFinding(
  finding: string
): { goal: string; region: string; treatments: string[] } | null {
  if (!finding || finding === OTHER_FINDING_LABEL) return null;
  const lower = finding.toLowerCase();
  for (const row of FINDING_TO_GOAL_REGION_TREATMENTS) {
    if (row.keywords.some((k) => lower.includes(k)))
      return { goal: row.goal, region: row.region, treatments: row.treatments };
  }
  return null;
}

/** Map treatment → suggested goals and regions (for "add by treatment" flow) */
function getGoalsAndRegionsForTreatment(treatment: string): {
  goals: string[];
  regions: string[];
} {
  const lower = (treatment || "").toLowerCase();
  const goals = new Set<string>();
  const regions = new Set<string>();
  for (const { keywords, treatments } of INTEREST_TO_TREATMENTS) {
    if (treatments.some((t) => t.toLowerCase() === lower)) {
      for (const g of ALL_INTEREST_OPTIONS) {
        if (keywords.some((k) => g.toLowerCase().includes(k))) goals.add(g);
      }
    }
  }
  for (const { keywords, regions: regs } of GOAL_TO_REGIONS) {
    for (const g of goals) {
      if (keywords.some((k) => g.toLowerCase().includes(k)))
        regs.forEach((r) => regions.add(r));
    }
  }
  if (goals.size === 0)
    return { goals: [...ALL_INTEREST_OPTIONS], regions: [...REGION_OPTIONS] };
  if (regions.size === 0)
    return { goals: Array.from(goals), regions: [...REGION_OPTIONS] };
  return { goals: Array.from(goals), regions: Array.from(regions) };
}

/** All treatment interest options (full list – users can select any or Other) */
const ALL_INTEREST_OPTIONS = [
  "Contour Cheeks",
  "Improve Cheek Definition",
  "Rejuvenate Upper Eyelids",
  "Rejuvenate Lower Eyelids",
  "Balance Brows",
  "Balance Forehead",
  "Contour Jawline",
  "Contour Neck",
  "Balance Jawline",
  "Hydrate Lips",
  "Balance Lips",
  "Balance Nose",
  "Hydrate Skin",
  "Tighten Skin Laxity",
  "Shadow Correction",
  "Exfoliate Skin",
  "Smoothen Fine Lines",
  "Even Skin Tone",
  "Fade Scars",
];

/** All treatment/procedure options (non-surgical only: Skincare, laser, injectable, etc.) */
const ALL_TREATMENTS = [
  "Skincare",
  "Laser",
  "Radiofrequency",
  "Chemical Peel",
  "Microneedling",
  "Filler",
  "Neurotoxin",
  "Kybella",
  "Threadlift",
];
const OTHER_TREATMENT_LABEL = "Other";

/** Map each interest (by keyword match) to suggested treatments (non-surgical only) */
const INTEREST_TO_TREATMENTS: { keywords: string[]; treatments: string[] }[] = [
  {
    keywords: ["cheek", "contour", "definition"],
    treatments: ["Skincare", "Filler"],
  },
  {
    keywords: ["eyelid", "upper eyelid", "lower eyelid", "rejuvenate"],
    treatments: ["Skincare", "Laser", "Radiofrequency"],
  },
  {
    keywords: ["brow", "brows"],
    treatments: ["Skincare", "Neurotoxin", "Filler"],
  },
  { keywords: ["forehead"], treatments: ["Skincare", "Neurotoxin", "Filler", "Laser"] },
  {
    keywords: ["jawline", "jaw"],
    treatments: ["Skincare", "Filler", "Kybella"],
  },
  {
    keywords: ["neck"],
    treatments: ["Skincare", "Kybella", "Radiofrequency"],
  },
  {
    keywords: ["lip", "lips", "hydrate", "balance lips"],
    treatments: ["Skincare", "Filler"],
  },
  { keywords: ["nose", "balance nose"], treatments: ["Skincare", "Filler"] },
  {
    keywords: ["hydrate skin", "exfoliate", "skin tone", "even skin"],
    treatments: ["Skincare", "Chemical Peel", "Microneedling", "Laser"],
  },
  {
    keywords: ["laxity", "tighten", "sag"],
    treatments: ["Skincare", "Radiofrequency", "Threadlift"],
  },
  {
    keywords: ["shadow", "tear trough", "under eye"],
    treatments: ["Skincare", "Filler"],
  },
  {
    keywords: ["scar", "fade", "line", "fine line", "smoothen"],
    treatments: [
      "Skincare",
      "Laser",
      "Chemical Peel",
      "Microneedling",
      "Filler",
      "Neurotoxin",
    ],
  },
];

function getTreatmentsForInterest(interest: string): string[] {
  if (!interest || interest === OTHER_LABEL) return [...ALL_TREATMENTS];
  const lower = interest.toLowerCase();
  const matched = new Set<string>();
  for (const { keywords, treatments } of INTEREST_TO_TREATMENTS) {
    if (keywords.some((k) => lower.includes(k))) {
      treatments.forEach((t) => matched.add(t));
    }
  }
  return matched.size > 0 ? Array.from(matched) : [...ALL_TREATMENTS];
}

const REGION_OPTIONS = [
  "Forehead",
  "Glabella",
  "Crow's feet",
  "Lips",
  "Cheeks",
  "Nasolabial",
  "Jawline",
  "Under eyes",
  "Multiple",
  "Other",
];
const TIMELINE_OPTIONS = ["Now", "Discuss next visit", "Save for later"];

interface DiscussedTreatmentsModalProps {
  client: Client;
  onClose: () => void;
  /** Call after data changes; may return a Promise (e.g. silent refresh). Await before closing so panel shows fresh data. */
  onUpdate: () => void | Promise<void>;
}

function parseInterestedIssues(client: Client): string[] {
  const raw = client.interestedIssues;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((i) => i && String(i).trim());
  return String(raw)
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
}

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `disc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DiscussedTreatmentsModal({
  client,
  onClose,
  onUpdate,
}: DiscussedTreatmentsModalProps) {
  const [items, setItems] = useState<DiscussedItem[]>(
    client.discussedItems?.length ? [...client.discussedItems] : []
  );
  const interestOptions = useMemo(() => {
    const fromIssues = parseInterestedIssues(client);
    const rawGoals: string[] | string = client.goals as string[] | string;
    const fromGoals: string[] =
      Array.isArray(rawGoals) && rawGoals.length
        ? rawGoals.filter((g: string) => g && String(g).trim())
        : typeof rawGoals === "string" && rawGoals
        ? rawGoals
            .split(",")
            .map((g: string) => g.trim())
            .filter(Boolean)
        : [];
    const set = new Set<string>([...fromIssues, ...fromGoals]);
    return Array.from(set).sort();
  }, [client.interestedIssues, client.goals]);

  /** Full list: all interest options + Other. Patient's interests are still available via interestOptions for highlighting. */
  const topicOptions = useMemo(
    () => [...ALL_INTEREST_OPTIONS, OTHER_LABEL],
    []
  );

  const [addMode, setAddMode] = useState<AddByMode>("goal");
  /** By assessment finding: multi-select (one or more findings) */
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [selectedTreatmentFirst, setSelectedTreatmentFirst] = useState("");
  /** When adding by treatment: selected assessment findings (multi-select, sets goal + region) */
  const [selectedFindingByTreatment, setSelectedFindingByTreatment] = useState<
    string[]
  >([]);
  /** By assessment finding: which areas are expanded (collapsed by default) */
  const [expandedFindingAreas, setExpandedFindingAreas] = useState<Set<string>>(
    new Set()
  );
  const [showOtherFindingPicker, setShowOtherFindingPicker] = useState(false);
  const [
    showOtherFindingPickerByTreatment,
    setShowOtherFindingPickerByTreatment,
  ] = useState(false);
  const [otherFindingSearch, setOtherFindingSearch] = useState("");
  const [otherFindingSearchByTreatment, setOtherFindingSearchByTreatment] =
    useState("");
  const [interestSearch, setInterestSearch] = useState("");
  const [showFullInterestList, setShowFullInterestList] = useState(false);
  /** Which treatment's "See all options" picker is open (null = none). */
  const [openProductSearchFor, setOpenProductSearchFor] = useState<
    string | null
  >(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const isNarrowScreen = useIsNarrowScreen(768);

  const [form, setForm] = useState({
    interest: "",
    /** When adding by goal: per-treatment selected detected issues (all relevant shown below treatment, selected by default) */
    selectedFindingsByTreatment: {} as Record<string, string[]>,
    /** For Skincare/Laser: multi-select product names per treatment */
    selectedProductsByTreatment: {} as Record<string, string[]>,
    selectedTreatments: [] as string[],
    otherTreatment: "",
    skincareProduct: "",
    skincareProductOther: "",
    treatmentProducts: {} as Record<string, string>,
    treatmentProductOther: {} as Record<string, string>,
    showOptional: false,
    brand: "",
    region: "",
    timeline: "",
    notes: "",
    brandOther: "",
    regionOther: "",
    timelineOther: "",
  });

  const filteredInterestOptions = useMemo(() => {
    if (!interestSearch.trim()) return topicOptions;
    const q = interestSearch.trim().toLowerCase();
    return topicOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [topicOptions, interestSearch]);

  /** Searchable full list for "Other finding" (by-finding mode) */
  const filteredOtherFindings = useMemo(() => {
    const q = otherFindingSearch.trim().toLowerCase();
    if (!q) return [...ASSESSMENT_FINDINGS];
    return ASSESSMENT_FINDINGS.filter((f) => f.toLowerCase().includes(q));
  }, [otherFindingSearch]);

  /** Searchable full list for "Other finding" (by-treatment mode) */
  const filteredOtherFindingsByTreatment = useMemo(() => {
    const q = otherFindingSearchByTreatment.trim().toLowerCase();
    if (!q) return [...ASSESSMENT_FINDINGS];
    return ASSESSMENT_FINDINGS.filter((f) => f.toLowerCase().includes(q));
  }, [otherFindingSearchByTreatment]);

  /** Chips: patient's interests + Other. Full list only shown when Other is expanded. */
  const interestChipOptions = useMemo(
    () =>
      interestOptions.length > 0
        ? [...interestOptions, OTHER_LABEL]
        : [OTHER_LABEL],
    [interestOptions]
  );

  /** Assessment findings from this patient's analysis, grouped by area (for "by assessment finding" mode). */
  const patientFindingsByArea = useMemo(() => {
    const grouped = groupIssuesByArea(client.allIssues ?? "");
    const areaOrder = [
      "Lips",
      "Eyes",
      "Forehead",
      "Cheeks",
      "Nasolabial",
      "Jawline",
      "Neck",
      "Skin",
      "Nose",
      "Body",
      "Other",
    ];
    return Object.entries(grouped)
      .map(([area, findings]) => ({
        area,
        findings: findings.filter((f) => f && String(f).trim()),
      }))
      .filter(({ findings }) => findings.length > 0)
      .sort((a, b) => {
        const ai = areaOrder.indexOf(a.area);
        const bi = areaOrder.indexOf(b.area);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.area.localeCompare(b.area);
      });
  }, [client.allIssues]);

  /** Helper: detected issues for this client that map to the given goal and treatment (for showing below each selected treatment). */
  const getDetectedIssuesForTreatment = useCallback(
    (treatment: string, interest: string): string[] => {
      if (!interest?.trim()) return [];
      const clientIssues = patientFindingsByArea.flatMap(
        ({ findings }) => findings
      );
      const lower = treatment.toLowerCase();
      return clientIssues.filter((issue) => {
        const m = getGoalRegionTreatmentsForFinding(issue);
        return (
          m?.goal === interest?.trim() &&
          m?.treatments.some((t) => t.toLowerCase() === lower)
        );
      });
    },
    [patientFindingsByArea]
  );

  /** By assessment finding: expand all area containers by default when entering finding mode. */
  useEffect(() => {
    if (addMode === "finding" && patientFindingsByArea.length > 0) {
      setExpandedFindingAreas((prev) => {
        const allAreas = new Set(patientFindingsByArea.map(({ area }) => area));
        if (prev.size === 0) return allAreas;
        return prev;
      });
    }
  }, [addMode, patientFindingsByArea]);

  /** Context string from goal/finding for intelligent product recommendations. */
  const productContextString = useMemo(() => {
    const parts = [
      form.interest,
      addMode === "finding" ? selectedFindings.join(" ") : "",
      addMode === "treatment" ? selectedFindingByTreatment.join(" ") : "",
    ].filter(Boolean);
    // In by-treatment mode, also add goal + region for each selected finding (including Other findings)
    // so suggested products show for Other findings the same as for AI-identified findings.
    if (addMode === "treatment" && selectedFindingByTreatment.length > 0) {
      const goalRegionParts: string[] = [];
      for (const f of selectedFindingByTreatment) {
        const mapped = getGoalRegionTreatmentsForFinding(f);
        if (mapped) {
          if (mapped.goal) goalRegionParts.push(mapped.goal);
          if (mapped.region) goalRegionParts.push(mapped.region);
        }
      }
      if (goalRegionParts.length > 0) parts.push(goalRegionParts.join(" "));
    }
    return parts.join(" ");
  }, [form.interest, addMode, selectedFindings, selectedFindingByTreatment]);

  const [savingAdd, setSavingAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editShowOptionalDetails, setEditShowOptionalDetails] = useState(false);
  const [editForm, setEditForm] = useState<{
    interest: string;
    treatment: string;
    product: string;
    brand: string;
    brandOther: string;
    region: string;
    regionOther: string;
    timeline: string;
    timelineOther: string;
    notes: string;
  }>({
    interest: "",
    treatment: "",
    product: "",
    brand: "",
    brandOther: "",
    region: "",
    regionOther: "",
    timeline: "",
    timelineOther: "",
    notes: "",
  });
  const addFormSectionRef = useRef<HTMLDivElement>(null);

  const treatmentsForTopic = useMemo(() => {
    if (addMode === "finding" && selectedFindings.length > 0) {
      const treatments = new Set<string>();
      for (const finding of selectedFindings) {
        const mapped = getGoalRegionTreatmentsForFinding(finding);
        if (mapped) mapped.treatments.forEach((t) => treatments.add(t));
      }
      return treatments.size > 0
        ? Array.from(treatments)
        : getTreatmentsForInterest(form.interest);
    }
    return getTreatmentsForInterest(form.interest);
  }, [addMode, selectedFindings, form.interest]);

  /** Region options filtered by selected goal (or all when no goal) */
  /** When adding by treatment first: assessment findings grouped by area (replaces goal/region) */
  const findingsByAreaForTreatment = useMemo(
    () =>
      addMode === "treatment" &&
      selectedTreatmentFirst &&
      selectedTreatmentFirst !== OTHER_TREATMENT_LABEL
        ? getFindingsByAreaForTreatment(selectedTreatmentFirst)
        : [],
    [addMode, selectedTreatmentFirst]
  );

  /** Kept for compatibility (by-treatment UI uses findingsByAreaForTreatment); referenced so bundler/cache does not throw */
  const goalsAndRegionsForTreatment = useMemo(
    () =>
      addMode === "treatment" && selectedTreatmentFirst
        ? getGoalsAndRegionsForTreatment(selectedTreatmentFirst)
        : { goals: ALL_INTEREST_OPTIONS, regions: REGION_OPTIONS },
    [addMode, selectedTreatmentFirst]
  );
  void goalsAndRegionsForTreatment;

  /** Group items by treatment name, sorted by treatment. */
  const itemsGroupedByTreatment = useMemo(() => {
    const byTreatment = new Map<string, DiscussedItem[]>();
    for (const item of items) {
      const key = (item.treatment || "").trim() || "—";
      if (!byTreatment.has(key)) byTreatment.set(key, []);
      byTreatment.get(key)!.push(item);
    }
    return Array.from(byTreatment.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([treatment, groupItems]) => ({ treatment, items: groupItems }));
  }, [items]);

  const toggleFinding = (finding: string) => {
    const next = selectedFindings.includes(finding)
      ? selectedFindings.filter((f) => f !== finding)
      : [...selectedFindings, finding];
    setSelectedFindings(next);
    const goals: string[] = [];
    const regions = new Set<string>();
    for (const f of next) {
      const mapped = getGoalRegionTreatmentsForFinding(f);
      if (mapped) {
        goals.push(mapped.goal);
        regions.add(mapped.region);
      }
    }
    setForm((f) => ({
      ...f,
      interest: goals.length > 0 ? goals.join(", ") : "",
      region:
        regions.size === 1
          ? Array.from(regions)[0]!
          : regions.size > 1
          ? "Multiple"
          : "",
      regionOther: "",
      selectedTreatments: [],
      otherTreatment: "",
    }));
  };

  const toggleFindingArea = (area: string) => {
    setExpandedFindingAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };

  const handleSelectTreatmentFirst = (treatment: string) => {
    setSelectedTreatmentFirst(treatment);
    setSelectedFindingByTreatment([]);
    setForm((f) => ({
      ...f,
      selectedTreatments: [],
      otherTreatment: "",
    }));
  };

  const handleSelectFindingByTreatment = (finding: string) => {
    const next = selectedFindingByTreatment.includes(finding)
      ? selectedFindingByTreatment.filter((f) => f !== finding)
      : [...selectedFindingByTreatment, finding];
    setSelectedFindingByTreatment(next);
    const goals: string[] = [];
    const regions = new Set<string>();
    for (const f of next) {
      const mapped = getGoalRegionTreatmentsForFinding(f);
      if (mapped) {
        goals.push(mapped.goal);
        regions.add(mapped.region);
      }
    }
    setForm((f) => ({
      ...f,
      interest: goals.join(", ") || "",
      region:
        regions.size === 1
          ? Array.from(regions)[0]!
          : regions.size > 1
          ? "Multiple"
          : "",
      regionOther: "",
    }));
  };

  const handleAddModeChange = (mode: AddByMode) => {
    // If clicking the same mode, reset selections within that mode
    if (addMode === mode) {
      setSelectedFindings([]);
      setSelectedTreatmentFirst("");
      setSelectedFindingByTreatment([]);
      setExpandedFindingAreas(new Set());
      setShowOtherFindingPicker(false);
      setShowOtherFindingPickerByTreatment(false);
      setOtherFindingSearch("");
      setOtherFindingSearchByTreatment("");
      setOpenProductSearchFor(null);
      setProductSearchQuery("");
      setForm((f) => ({
        ...f,
        interest: "",
        selectedFindingsByTreatment: {},
        selectedProductsByTreatment: {},
        selectedTreatments: [],
        otherTreatment: "",
        skincareProduct: "",
        skincareProductOther: "",
        treatmentProducts: {},
        treatmentProductOther: {},
        region: "",
        regionOther: "",
      }));
      setShowFullInterestList(false);
      setInterestSearch("");
      return;
    }
    
    // Otherwise switch to new mode and reset
    setAddMode(mode);
    setSelectedFindings([]);
    setSelectedTreatmentFirst("");
    setSelectedFindingByTreatment([]);
    setExpandedFindingAreas(new Set());
    setShowOtherFindingPicker(false);
    setShowOtherFindingPickerByTreatment(false);
    setOtherFindingSearch("");
    setOtherFindingSearchByTreatment("");
    setOpenProductSearchFor(null);
    setProductSearchQuery("");
    setForm((f) => ({
      ...f,
      interest: "",
      selectedFindingsByTreatment: {},
      selectedProductsByTreatment: {},
      selectedTreatments: [],
      otherTreatment: "",
      skincareProduct: "",
      skincareProductOther: "",
      treatmentProducts: {},
      treatmentProductOther: {},
      region: "",
      regionOther: "",
    }));
    setShowFullInterestList(false);
    setInterestSearch("");
  };

  const toggleTreatment = (name: string) => {
    setForm((f) => {
      const isAdding = !f.selectedTreatments.includes(name);
      const nextTreatments = isAdding
        ? [...f.selectedTreatments, name]
        : f.selectedTreatments.filter((t) => t !== name);
      const nextFindingsByTreatment = { ...f.selectedFindingsByTreatment };
      const nextProductsByTreatment = { ...f.selectedProductsByTreatment };
      if (isAdding) {
        const issues = getDetectedIssuesForTreatment(name, f.interest);
        nextFindingsByTreatment[name] = issues;
        if (name === "Skincare") nextProductsByTreatment[name] = [];
      } else {
        delete nextFindingsByTreatment[name];
        delete nextProductsByTreatment[name];
      }
      return {
        ...f,
        selectedTreatments: nextTreatments,
        selectedFindingsByTreatment: nextFindingsByTreatment,
        selectedProductsByTreatment: nextProductsByTreatment,
      };
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingId) setEditingId(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, editingId]);

  const persistItems = async (nextItems: DiscussedItem[]) => {
    const payload = nextItems.length > 0 ? JSON.stringify(nextItems) : "";
    await updateLeadRecord(client.id, client.tableSource, {
      [AIRTABLE_FIELD]: payload,
    });
  };

  const handleAdd = async () => {
    const treatments: string[] =
      addMode === "treatment" && selectedTreatmentFirst
        ? selectedTreatmentFirst === OTHER_TREATMENT_LABEL
          ? form.otherTreatment.trim()
            ? [form.otherTreatment.trim()]
            : []
          : [selectedTreatmentFirst]
        : [
            ...form.selectedTreatments.filter(
              (t) => t !== OTHER_TREATMENT_LABEL
            ),
            ...(form.otherTreatment.trim() ? [form.otherTreatment.trim()] : []),
          ];
    const hasGoalOrFindingOnly =
      (addMode === "goal" && !!form.interest?.trim()) ||
      (addMode === "finding" && selectedFindings.length > 0);
    const effectiveTreatments =
      treatments.length > 0
        ? treatments
        : hasGoalOrFindingOnly
        ? [TREATMENT_GOAL_ONLY]
        : [];
    if (effectiveTreatments.length === 0) return;
    const interest =
      form.interest && form.interest !== OTHER_LABEL
        ? form.interest.trim()
        : undefined;
    const brand =
      form.brand === "Other"
        ? form.brandOther.trim() || undefined
        : form.brand?.trim() || undefined;
    const region =
      form.region === "Other"
        ? form.regionOther.trim() || undefined
        : form.region?.trim() || undefined;
    const timeline = form.timeline?.trim() || undefined;
    const productFor = (t: string): string | undefined => {
      const opts = TREATMENT_PRODUCT_OPTIONS[t];
      if (!opts) return undefined;
      const sel =
        form.treatmentProducts[t] ??
        (t === "Skincare" ? form.skincareProduct : undefined);
      if (!sel?.trim()) return undefined;
      return sel === OTHER_PRODUCT_LABEL
        ? (
            form.treatmentProductOther[t] ??
            (t === "Skincare" ? form.skincareProductOther : "")
          ).trim() || undefined
        : sel.trim();
    };
    /** For Skincare only: multi-select product names. Everything else: single product from productFor. */
    const productsForTreatment = (treatment: string): string[] => {
      if (treatment === "Skincare") {
        const selected = form.selectedProductsByTreatment[treatment] ?? [];
        return selected
          .map((p) =>
            p === OTHER_PRODUCT_LABEL
              ? (form.treatmentProductOther[treatment] ?? form.skincareProductOther ?? "").trim()
              : p.trim()
          )
          .filter(Boolean);
      }
      const single = productFor(treatment);
      return single ? [single] : [];
    };
    const optional = {
      brand,
      region,
      timeline,
      notes: form.notes.trim() || undefined,
    };
    const newItems: DiscussedItem[] = [];
    for (const treatment of effectiveTreatments) {
      const products = productsForTreatment(treatment);
      const findingsForTreatment =
        addMode === "goal"
          ? form.selectedFindingsByTreatment[treatment] ??
            getDetectedIssuesForTreatment(treatment, form.interest ?? "")
          : undefined;
      if (products.length === 0) {
        newItems.push({
          id: generateId(),
          interest: interest || undefined,
          ...(findingsForTreatment?.length
            ? { findings: findingsForTreatment }
            : {}),
          treatment,
          ...optional,
        });
      } else {
        for (const product of products) {
          newItems.push({
            id: generateId(),
            interest: interest || undefined,
            ...(findingsForTreatment?.length
              ? { findings: findingsForTreatment }
              : {}),
            treatment,
            product,
            ...optional,
          });
        }
      }
    }
    const nextItems = [...items, ...newItems];
    setItems(nextItems);
    setSavingAdd(true);
    try {
      await persistItems(nextItems);
      showToast("Added to plan");
      onUpdate(); // fire-and-forget refresh so panel can show updated count
      // Reset add-form state so "add another item" starts fresh
      setForm({
        interest: "",
        selectedFindingsByTreatment: {},
        selectedProductsByTreatment: {},
        selectedTreatments: [],
        otherTreatment: "",
        skincareProduct: "",
        skincareProductOther: "",
        treatmentProducts: {},
        treatmentProductOther: {},
        showOptional: false,
        brand: "",
        region: "",
        timeline: "",
        notes: "",
        brandOther: "",
        regionOther: "",
        timelineOther: "",
      });
      setAddMode("goal");
      setSelectedFindings([]);
      setSelectedTreatmentFirst("");
      setSelectedFindingByTreatment([]);
      setExpandedFindingAreas(new Set());
      setShowOtherFindingPicker(false);
      setShowOtherFindingPickerByTreatment(false);
      setOtherFindingSearch("");
      setOtherFindingSearchByTreatment("");
      setInterestSearch("");
      setShowFullInterestList(false);
      setOpenProductSearchFor(null);
      setProductSearchQuery("");
    } catch (e: any) {
      showError(e.message || "Failed to save");
      setItems(items); // revert on error
    } finally {
      setSavingAdd(false);
    }
  };

  const hasAnyTreatmentSelected =
    (addMode === "treatment" &&
      selectedTreatmentFirst &&
      (selectedTreatmentFirst !== OTHER_TREATMENT_LABEL ||
        form.otherTreatment.trim().length > 0)) ||
    form.selectedTreatments.some((t) => t !== OTHER_TREATMENT_LABEL) ||
    form.otherTreatment.trim().length > 0;

  /** In goal/finding mode, user can add with only a goal (treatments optional). */
  const canAddWithGoalOnly =
    (addMode === "goal" && !!form.interest?.trim()) ||
    (addMode === "finding" && selectedFindings.length > 0);

  const handleRemove = async (id: string) => {
    if (editingId === id) setEditingId(null);
    const nextItems = items.filter((x) => x.id !== id);
    setItems(nextItems);
    try {
      await persistItems(nextItems);
      onUpdate();
    } catch (e: any) {
      showError(e.message || "Failed to update");
      setItems(items);
    }
  };

  const handleEditStart = (item: DiscussedItem) => {
    setEditingId(item.id);
    const timeline = item.timeline?.trim() || "";
    const hasOptional = !!(timeline || (item.notes?.trim() ?? ""));
    setEditShowOptionalDetails(hasOptional);
    setEditForm({
      interest: item.interest?.trim() || "",
      treatment: item.treatment?.trim() || "",
      product: item.product?.trim() || "",
      brand: "",
      brandOther: "",
      region: "",
      regionOther: "",
      timeline: TIMELINE_OPTIONS.includes(timeline) ? timeline : "",
      timelineOther: "",
      notes: item.notes?.trim() || "",
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const interest =
      editForm.interest && editForm.interest !== OTHER_LABEL
        ? editForm.interest.trim()
        : undefined;
    const productVal = editForm.product?.trim();
    const timelineVal = editForm.timeline?.trim() || undefined;
    const updated: DiscussedItem = {
      id: editingId,
      interest: interest || undefined,
      treatment: editForm.treatment.trim(),
      ...(productVal ? { product: productVal } : {}),
      brand: undefined,
      region: undefined,
      timeline: timelineVal || undefined,
      notes: editForm.notes.trim() || undefined,
    };
    const nextItems = items.map((x) => (x.id === editingId ? updated : x));
    setItems(nextItems);
    setEditingId(null);
    try {
      await persistItems(nextItems);
      showToast("Item updated");
      onUpdate();
    } catch (e: any) {
      showError(e.message || "Failed to update");
    }
  };

  /** Close immediately (X or overlay). Refresh in background so panel updates. */
  const handleCloseImmediate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUpdate(); // fire-and-forget refresh
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={handleCloseImmediate}>
      <div
        className="modal-content discussed-treatments-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header discussed-treatments-modal-header">
          <div className="modal-header-info">
            <span className="discussed-treatments-badge" aria-hidden>
              Share with patient
            </span>
            <h2 className="modal-title">
              Treatment plan for {client.name?.split(" ")[0] || "patient"}
            </h2>
            <p className="modal-subtitle">
              Adding to the plan saves to their record. Pick a topic, check what
              you discussed, add to plan — then share when ready.
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={handleCloseImmediate}
          >
            ×
          </button>
        </div>

        <div className="modal-body discussed-treatments-modal-body">
          {/* Edit panel – same UI as add form (goal-flow box, chips, carousel, optional details) */}
          {editingId && (
            <div className="discussed-treatments-form-section discussed-treatments-edit-panel">
              <h3 className="discussed-treatments-form-title">Edit item</h3>
              <p className="discussed-treatments-form-hint">
                Update the fields below, then save.
              </p>

              <div className="discussed-treatments-add-form-body goal-flow-active">
                <div className="discussed-treatments-add-form-single-box">
                {/* Addressing (goal) – same chip row as add form */}
                <div className="discussed-treatments-goal-flow-box">
                  <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                    Patient&apos;s Treatment Interests
                  </h3>
                  <p className="discussed-treatments-form-hint">
                    Goal or topic for this item
                  </p>
                  <div
                    className="discussed-treatments-chip-row"
                    role="group"
                    aria-label="Addressing (goal)"
                  >
                    {interestChipOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`discussed-treatments-topic-chip ${
                          editForm.interest === opt ? "selected" : ""
                        } ${opt === OTHER_LABEL ? "other-chip" : ""}`}
                        onClick={() =>
                          setEditForm((f) => ({
                            ...f,
                            interest: f.interest === opt ? "" : opt,
                          }))
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Treatment – same chip grid as add form (By Treatment) */}
                <div className="discussed-treatments-treatment-sub-box">
                  <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                    Treatment
                  </h3>
                  <div
                    className="discussed-treatments-checkbox-grid"
                    role="group"
                    aria-label="Treatments"
                  >
                    {ALL_TREATMENTS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`discussed-treatments-topic-chip ${
                          editForm.treatment === name ? "selected" : ""
                        }`}
                        onClick={() =>
                          setEditForm((f) => ({
                            ...f,
                            treatment: name,
                            product: "",
                          }))
                        }
                      >
                        {name}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`discussed-treatments-topic-chip other-chip ${
                        editForm.treatment &&
                        (editForm.treatment === OTHER_TREATMENT_LABEL ||
                          !ALL_TREATMENTS.includes(editForm.treatment))
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          treatment: f.treatment && !ALL_TREATMENTS.includes(f.treatment)
                            ? f.treatment
                            : OTHER_TREATMENT_LABEL,
                        }))
                      }
                    >
                      {OTHER_TREATMENT_LABEL}
                    </button>
                  </div>
                  {editForm.treatment &&
                    (editForm.treatment === OTHER_TREATMENT_LABEL ||
                      !ALL_TREATMENTS.includes(editForm.treatment)) && (
                      <div className="discussed-treatments-other-treatment-by-tx">
                        <div className="discussed-treatments-other-treatment-by-tx-label">
                          Treatment name
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. CoolSculpting, PRP, body contouring"
                          value={
                            editForm.treatment === OTHER_TREATMENT_LABEL
                              ? ""
                              : editForm.treatment
                          }
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              treatment:
                                e.target.value.trim() ||
                                OTHER_TREATMENT_LABEL,
                            }))
                          }
                          className="discussed-treatments-other-treatment-by-tx-input"
                          aria-label="Treatment name"
                        />
                      </div>
                    )}
                </div>

                {/* Product/Type – carousel for Skincare/Laser, chips for others (same as add form) */}
                {editForm.treatment &&
                  ALL_TREATMENTS.includes(editForm.treatment) &&
                  (TREATMENT_PRODUCT_OPTIONS[editForm.treatment]?.length ?? 0) >
                    0 &&
                  (() => {
                    const treatment = editForm.treatment;
                    const opts =
                      TREATMENT_PRODUCT_OPTIONS[treatment] ?? [];
                    const fullList = opts.filter(
                      (p) => p !== OTHER_PRODUCT_LABEL
                    );
                    const sectionTitle =
                      treatment === "Skincare" ? "Product" : "Type";
                    const isSkincareOrLaser =
                      treatment === "Skincare" || treatment === "Laser";
                    const editProductSelected = isSkincareOrLaser
                      ? fullList.includes(editForm.product)
                        ? [editForm.product]
                        : editForm.product
                          ? [OTHER_PRODUCT_LABEL]
                          : []
                      : editForm.product;

                    return (
                      <div className="discussed-treatments-treatment-sub-box">
                        <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                          {sectionTitle} (optional)
                        </h3>
                        <p className="discussed-treatments-form-hint">
                          Select a {sectionTitle.toLowerCase()} if desired.
                        </p>
                        <div className="discussed-treatments-product-inline discussed-treatments-product-inline-by-treatment">
                          {isSkincareOrLaser ? (
                            <div
                              className="discussed-treatments-product-carousel"
                              role="group"
                              aria-label={`Select ${sectionTitle.toLowerCase()}`}
                            >
                              <div className="discussed-treatments-product-carousel-track">
                                {fullList.map((p) => {
                                  const isChecked = editProductSelected.includes(p);
                                  return (
                                    <label
                                      key={p}
                                      className={`discussed-treatments-product-carousel-item ${
                                        treatment !== "Skincare" ? "discussed-treatments-product-text-only" : ""
                                      } ${isChecked ? "selected" : ""
                                      } ${p === OTHER_PRODUCT_LABEL ? "other-chip" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          setEditForm((f) => ({
                                            ...f,
                                            product: isChecked ? "" : p,
                                          }));
                                        }}
                                        className="discussed-treatments-checkbox-input"
                                      />
                                      <div
                                        className="discussed-treatments-product-carousel-image"
                                        aria-hidden
                                      />
                                      <span className="discussed-treatments-product-carousel-label">
                                        {p}
                                      </span>
                                    </label>
                                  );
                                })}
                                {opts.includes(OTHER_PRODUCT_LABEL) && (
                                  <label
                                    className={`discussed-treatments-product-carousel-item ${
                                      treatment !== "Skincare" ? "discussed-treatments-product-text-only" : ""
                                    } ${editProductSelected.includes(OTHER_PRODUCT_LABEL) ||
                                      (editForm.product &&
                                        !fullList.includes(editForm.product))
                                        ? "selected"
                                        : ""
                                    } other-chip`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        editProductSelected.includes(OTHER_PRODUCT_LABEL) ||
                                        (!!editForm.product &&
                                          !fullList.includes(editForm.product))
                                      }
                                      onChange={() => {
                                        setEditForm((f) => ({
                                          ...f,
                                          product:
                                            (editProductSelected.includes(OTHER_PRODUCT_LABEL) ||
                                              (f.product &&
                                                !fullList.includes(f.product)))
                                              ? ""
                                              : OTHER_PRODUCT_LABEL,
                                        }));
                                      }}
                                      className="discussed-treatments-checkbox-input"
                                    />
                                    <div
                                      className="discussed-treatments-product-carousel-image"
                                      aria-hidden
                                    />
                                    <span className="discussed-treatments-product-carousel-label">
                                      {OTHER_PRODUCT_LABEL}
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className="discussed-treatments-chip-row"
                              role="group"
                              aria-label={sectionTitle}
                            >
                              {fullList.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  className={`discussed-treatments-prefill-chip ${
                                    editForm.product === p ? "selected" : ""
                                  }`}
                                  onClick={() =>
                                    setEditForm((f) => ({
                                      ...f,
                                      product: f.product === p ? "" : p,
                                    }))
                                  }
                                >
                                  {p}
                                </button>
                              ))}
                              {opts.includes(OTHER_PRODUCT_LABEL) && (
                                <>
                                  <button
                                    type="button"
                                    className={`discussed-treatments-prefill-chip ${
                                      editForm.product &&
                                      !fullList.includes(editForm.product)
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      setEditForm((f) => ({
                                        ...f,
                                        product:
                                          f.product && !fullList.includes(f.product)
                                            ? f.product
                                            : OTHER_PRODUCT_LABEL,
                                      }))
                                    }
                                  >
                                    {OTHER_PRODUCT_LABEL}
                                  </button>
                                  {editForm.product &&
                                    !fullList.includes(editForm.product) && (
                                      <input
                                        type="text"
                                        placeholder="Specify product or device"
                                        value={
                                          editForm.product ===
                                          OTHER_PRODUCT_LABEL
                                            ? ""
                                            : editForm.product
                                        }
                                        onChange={(e) =>
                                          setEditForm((f) => ({
                                            ...f,
                                            product:
                                              e.target.value.trim() ||
                                              OTHER_PRODUCT_LABEL,
                                          }))
                                        }
                                        className="discussed-treatments-prefill-other-input"
                                      />
                                    )}
                                </>
                              )}
                            </div>
                          )}
                          {isSkincareOrLaser &&
                            (editProductSelected.includes(OTHER_PRODUCT_LABEL) ||
                              (editForm.product &&
                                !fullList.includes(editForm.product))) && (
                              <div
                                className="discussed-treatments-product-other-input-wrap"
                                style={{ marginTop: 8 }}
                              >
                                <input
                                  type="text"
                                  placeholder="Specify product or device"
                                  value={
                                    editForm.product &&
                                    !fullList.includes(editForm.product)
                                      ? editForm.product
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      product: e.target.value.trim(),
                                    }))
                                  }
                                  className="discussed-treatments-prefill-other-input"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })()}

                {/* Optional details – same as add form (timeline chips + notes) */}
                {!editShowOptionalDetails ? (
                  <button
                    type="button"
                    className="discussed-treatments-optional-toggle"
                    onClick={() => setEditShowOptionalDetails(true)}
                  >
                    + Add details (optional — timeline)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="discussed-treatments-optional-toggle discussed-treatments-optional-hide"
                      onClick={() => setEditShowOptionalDetails(false)}
                    >
                      − Hide optional details
                    </button>
                    <div className="discussed-treatments-prefill-rows">
                      <div className="discussed-treatments-prefill-row">
                        <span className="discussed-treatments-prefill-label">
                          Timeline
                        </span>
                        <div className="discussed-treatments-chip-row">
                          {TIMELINE_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className={`discussed-treatments-prefill-chip ${
                                editForm.timeline === opt ? "selected" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="edit-timeline"
                                checked={editForm.timeline === opt}
                                onChange={() =>
                                  setEditForm((f) => ({
                                    ...f,
                                    timeline: opt,
                                  }))
                                }
                                className="discussed-treatments-radio-input"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="form-group discussed-treatments-notes-row">
                      <label htmlFor="edit-notes" className="form-label">
                        Notes (optional)
                      </label>
                      <input
                        id="edit-notes"
                        type="text"
                        placeholder="Any other detail"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            notes: e.target.value,
                          }))
                        }
                        className="form-input-base"
                      />
                    </div>
                  </>
                )}

                </div>
                <div className="discussed-treatments-edit-actions discussed-treatments-edit-panel-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={handleEditSave}
                    disabled={
                      !editForm.treatment.trim() ||
                      editForm.treatment === OTHER_TREATMENT_LABEL
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Their plan so far – same bubble style as "Treatment plan" on client detail */}
          {items.length > 0 && (
            <div className="discussed-treatments-list-section">
              <h3 className="discussed-treatments-list-title">
                {client.name?.trim().split(/\s+/)[0] || "Patient"}&apos;s plan
                so far ({items.length} {items.length === 1 ? "item" : "items"})
              </h3>
              <p className="discussed-treatments-list-hint">
                Edit or remove any item, or add another below.
              </p>
              <div className="discussed-treatments-rows">
                {itemsGroupedByTreatment.map(
                  ({ treatment, items: groupItems }) => (
                    <div key={treatment} className="discussed-treatments-group">
                      {/* One combined row per treatment: name + all items in group */}
                      {groupItems.length > 0 && (
                        <div className="discussed-treatments-row discussed-treatments-group-row">
                          <span className="discussed-treatments-row-treatment-name">
                            {treatment}
                          </span>
                          <div className="discussed-treatments-group-items">
                            {groupItems.map((item) => (
                              <div
                                key={item.id}
                                className="discussed-treatments-group-item-line"
                              >
                                <div className="discussed-treatments-row-content">
                                  {item.interest && item.interest.trim() && (
                                    <span className="discussed-treatments-row-interest">
                                      For: {item.interest.trim()}
                                    </span>
                                  )}
                                  {item.findings &&
                                    item.findings.length > 0 && (
                                      <span className="discussed-treatments-row-findings">
                                        Issues: {item.findings.join(", ")}
                                      </span>
                                    )}
                                  {(item.product ||
                                    item.brand ||
                                    item.region ||
                                    item.timeline ||
                                    (item.notes && item.notes.trim())) && (
                                    <span className="discussed-treatments-row-meta">
                                      {[
                                        item.product &&
                                          `Product: ${item.product}`,
                                        item.brand && `Brand: ${item.brand}`,
                                        item.region && `Region: ${item.region}`,
                                        item.timeline &&
                                          `Timeline: ${item.timeline}`,
                                        item.notes?.trim() &&
                                          `Notes: ${item.notes.trim()}`,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </span>
                                  )}
                                </div>
                                <div className="discussed-treatments-row-actions">
                                  <button
                                    type="button"
                                    className="discussed-treatments-bubble-action-btn"
                                    onClick={() => handleEditStart(item)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="discussed-treatments-bubble-action-btn discussed-treatments-bubble-remove-action"
                                    onClick={() => handleRemove(item.id)}
                                    aria-label={`Remove ${item.treatment}`}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Add treatments: topic chips + filtered treatments + pre-fill chips */}
          <div
            ref={addFormSectionRef}
            id="discussed-treatments-add-section"
            className="discussed-treatments-form-section"
          >
            <h3 className="discussed-treatments-form-title">
              {items.length > 0 ? "BUILD PLAN" : "What they're interested in"}
            </h3>
            <p className="discussed-treatments-form-hint">
              Start by developing a treatment plan and wishlist so patients can
              plan and research
            </p>
            <div
              className="discussed-treatments-add-by-mode"
              role="group"
              aria-label="How to add"
            >
              <button
                type="button"
                className={`discussed-treatments-mode-chip ${
                  addMode === "goal" ? "selected" : ""
                }`}
                onClick={() => handleAddModeChange("goal")}
              >
                By Patient Interests
              </button>
              <button
                type="button"
                className={`discussed-treatments-mode-chip ${
                  addMode === "treatment" ? "selected" : ""
                }`}
                onClick={() => handleAddModeChange("treatment")}
              >
                By Treatment
              </button>
            </div>

            <div
              className={`discussed-treatments-add-form-body${addMode === "goal" ? " goal-flow-active" : ""}`}
            >
            <div className="discussed-treatments-add-form-single-box">
            {/* --- By assessment finding: this patient's analysis findings by area, then Other --- */}
            {addMode === "finding" && (
              <div className="discussed-treatments-finding-step">
                <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                  Assessment finding
                </h3>
                <p className="discussed-treatments-form-hint">
                  Findings from this patient&apos;s analysis, by area. Select
                  one or more, or use Other to add a finding not listed.
                </p>
                {patientFindingsByArea.length > 0 ? (
                  <div className="discussed-treatments-findings-by-area discussed-treatments-findings-collapsible discussed-treatments-findings-cards-grid">
                    {patientFindingsByArea.map(({ area, findings }) => {
                      const isExpanded = expandedFindingAreas.has(area);
                      const selectedInArea = findings.filter((f) =>
                        selectedFindings.includes(f)
                      ).length;
                      const focusAreas = (
                        client.areas && Array.isArray(client.areas)
                          ? client.areas
                          : []
                      ) as string[];
                      const isFocusArea = focusAreas.some(
                        (a) =>
                          String(a).trim().toLowerCase() ===
                          area.trim().toLowerCase()
                      );
                      return (
                        <div
                          key={area}
                          className="discussed-treatments-area-card discussed-treatments-area-group discussed-treatments-area-collapsible"
                        >
                          <button
                            type="button"
                            className="discussed-treatments-area-collapse-trigger"
                            onClick={() => toggleFindingArea(area)}
                            aria-expanded={isExpanded}
                            aria-controls={`findings-area-${area}`}
                          >
                            <span className="discussed-treatments-area-collapse-label">
                              {area}
                            </span>
                            {isFocusArea && (
                              <span
                                className="discussed-treatments-area-focus-badge"
                                title="Focus area for this patient"
                              >
                                Focus
                              </span>
                            )}
                            {selectedInArea > 0 && (
                              <span
                                className="discussed-treatments-area-count"
                                aria-label={`${selectedInArea} selected`}
                              >
                                {selectedInArea}
                              </span>
                            )}
                            <span
                              className="discussed-treatments-area-chevron"
                              aria-hidden
                            >
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          </button>
                          <div
                            id={`findings-area-${area}`}
                            className="discussed-treatments-area-collapse-content"
                            hidden={!isExpanded}
                          >
                            <div
                              className="discussed-treatments-chip-row"
                              role="group"
                              aria-label={`Findings – ${area}`}
                            >
                              {findings.map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  className={`discussed-treatments-topic-chip ${
                                    selectedFindings.includes(f)
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => toggleFinding(f)}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="discussed-treatments-form-hint">
                    No assessment findings for this patient yet. Use Other below
                    to add a finding.
                  </p>
                )}
                <div className="discussed-treatments-other-finding-section">
                  <h4 className="discussed-treatments-other-finding-heading">
                    {OTHER_FINDING_LABEL}
                  </h4>
                  <span className="discussed-treatments-area-label">
                    Add a finding not in this patient&apos;s analysis (search
                    all findings).
                  </span>
                  {!showOtherFindingPicker ? (
                    <button
                      type="button"
                      className="discussed-treatments-topic-chip other-chip"
                      onClick={() => {
                        setShowOtherFindingPicker(true);
                        setOtherFindingSearch("");
                      }}
                    >
                      {OTHER_FINDING_LABEL}
                    </button>
                  ) : (
                    <div className="discussed-treatments-interest-search-wrap">
                      <input
                        type="text"
                        className="discussed-treatments-interest-search-input"
                        placeholder="Search findings..."
                        value={otherFindingSearch}
                        onChange={(e) => setOtherFindingSearch(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="discussed-treatments-interest-back-btn"
                        onClick={() => {
                          setShowOtherFindingPicker(false);
                          setOtherFindingSearch("");
                        }}
                        style={{ marginTop: 6 }}
                      >
                        ← Back
                      </button>
                      <div
                        className="discussed-treatments-interest-dropdown discussed-treatments-findings-dropdown"
                        role="listbox"
                      >
                        {filteredOtherFindings.map((f) => (
                          <button
                            key={f}
                            type="button"
                            role="option"
                            className={`discussed-treatments-interest-option ${
                              selectedFindings.includes(f) ? "selected" : ""
                            }`}
                            onClick={() => {
                              toggleFinding(f);
                              setShowOtherFindingPicker(false);
                              setOtherFindingSearch("");
                            }}
                          >
                            {f}
                          </button>
                        ))}
                        {filteredOtherFindings.length === 0 && (
                          <div className="discussed-treatments-interest-empty">
                            No matches.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedFindings.length > 0 &&
                  (form.interest || form.region) && (
                    <p className="discussed-treatments-form-hint discussed-treatments-prefill-hint">
                      Goals: {form.interest} · Region: {form.region}. Select
                      treatments below, then add to plan.
                    </p>
                  )}
              </div>
            )}

            {/* --- By treatment: treatment first, then assessment finding (optional), then product (optional) --- */}
            {addMode === "treatment" && (
              <div className="discussed-treatments-treatment-first-step">
                <div className="discussed-treatments-treatment-sub-box">
                  <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                    Treatment
                  </h3>
                  <div
                    className="discussed-treatments-checkbox-grid"
                    role="group"
                    aria-label="Treatments"
                  >
                  {ALL_TREATMENTS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`discussed-treatments-topic-chip ${
                        selectedTreatmentFirst === name ? "selected" : ""
                      }`}
                      onClick={() => handleSelectTreatmentFirst(name)}
                    >
                      {name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`discussed-treatments-topic-chip other-chip ${
                      selectedTreatmentFirst === OTHER_TREATMENT_LABEL
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectTreatmentFirst(OTHER_TREATMENT_LABEL)
                    }
                  >
                    {OTHER_TREATMENT_LABEL}
                  </button>
                </div>
                {selectedTreatmentFirst === OTHER_TREATMENT_LABEL && (
                  <div className="discussed-treatments-other-treatment-by-tx">
                    <div className="discussed-treatments-other-treatment-by-tx-label">
                      Treatment name
                    </div>
                    <p className="discussed-treatments-form-hint discussed-treatments-other-treatment-by-tx-hint">
                      Type the treatment you discussed (e.g. CoolSculpting, PRP)
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. CoolSculpting, PRP, body contouring"
                      value={form.otherTreatment}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          otherTreatment: e.target.value,
                        }))
                      }
                      className="discussed-treatments-other-treatment-by-tx-input"
                      aria-label="Treatment name"
                    />
                  </div>
                )}
                </div>
                {/* To address (optional) — after treatment, before product */}
                {selectedTreatmentFirst && (
                  <div className="discussed-treatments-treatment-sub-box">
                    <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                      To address (optional)
                    </h3>
                    <p className="discussed-treatments-form-hint">
                      Select an AI or provider identified concern for the
                      selected treatment.
                    </p>
                    <div className="discussed-treatments-to-address-wrap">
                      {findingsByAreaForTreatment.length > 0 ? (
                        <div className="discussed-treatments-findings-by-area discussed-treatments-findings-cards-grid discussed-treatments-to-address-grid">
                          {findingsByAreaForTreatment.map(
                            ({ area, findings }) => (
                              <div
                                key={area}
                                className="discussed-treatments-area-card discussed-treatments-area-card-to-address"
                              >
                                <span className="discussed-treatments-area-label discussed-treatments-area-card-heading">
                                  {area}
                                </span>
                                <div
                                  className="discussed-treatments-chip-row"
                                  role="group"
                                  aria-label={`Findings – ${area}`}
                                >
                                  {findings.map((f) => (
                                    <button
                                      key={f}
                                      type="button"
                                      className={`discussed-treatments-topic-chip ${
                                        selectedFindingByTreatment.includes(f)
                                          ? "selected"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleSelectFindingByTreatment(f)
                                      }
                                    >
                                      {f}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="discussed-treatments-form-hint">
                          No assessment findings mapped for this treatment.
                          Add goal/region in optional details below.
                        </p>
                      )}
                      <div className="discussed-treatments-other-finding-section discussed-treatments-other-at-bottom">
                        <span className="discussed-treatments-finding-col-label">
                          Other
                        </span>
                        <div className="discussed-treatments-other-selected-chips">
                          {selectedFindingByTreatment
                            .filter(
                              (f) =>
                                !findingsByAreaForTreatment.some((g) =>
                                  g.findings.includes(f)
                                )
                            )
                            .map((f) => (
                              <button
                                key={f}
                                type="button"
                                className="discussed-treatments-topic-chip selected"
                                onClick={() =>
                                  handleSelectFindingByTreatment(f)
                                }
                              >
                                {f}
                              </button>
                            ))}
                        </div>
                        {!showOtherFindingPickerByTreatment ? (
                          <button
                            type="button"
                            className="discussed-treatments-topic-chip other-chip"
                            onClick={() => {
                              setShowOtherFindingPickerByTreatment(true);
                              setOtherFindingSearchByTreatment("");
                            }}
                          >
                            + {OTHER_FINDING_LABEL}
                          </button>
                        ) : (
                          <div className="discussed-treatments-interest-search-wrap discussed-treatments-search-compact">
                            <input
                              type="text"
                              className="discussed-treatments-interest-search-input"
                              placeholder="Search..."
                              value={otherFindingSearchByTreatment}
                              onChange={(e) =>
                                setOtherFindingSearchByTreatment(e.target.value)
                              }
                              autoFocus
                            />
                            <button
                              type="button"
                              className="discussed-treatments-interest-back-btn discussed-treatments-back-inline"
                              onClick={() => {
                                setShowOtherFindingPickerByTreatment(false);
                                setOtherFindingSearchByTreatment("");
                              }}
                            >
                              ← Back
                            </button>
                            <div
                              className="discussed-treatments-interest-dropdown discussed-treatments-findings-dropdown"
                              role="listbox"
                            >
                              {filteredOtherFindingsByTreatment.map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  role="option"
                                  className={`discussed-treatments-interest-option ${
                                    selectedFindingByTreatment.includes(f)
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    handleSelectFindingByTreatment(f);
                                    setShowOtherFindingPickerByTreatment(false);
                                    setOtherFindingSearchByTreatment("");
                                  }}
                                >
                                  {f}
                                </button>
                              ))}
                              {filteredOtherFindingsByTreatment.length ===
                                0 && (
                                <div className="discussed-treatments-interest-empty">
                                  No matches.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Product / type (optional) — after assessment finding */}
                {selectedTreatmentFirst &&
                  selectedTreatmentFirst !== OTHER_TREATMENT_LABEL &&
                  (TREATMENT_PRODUCT_OPTIONS[selectedTreatmentFirst]?.length ??
                    0) > 0 &&
                  (() => {
                    const treatment = selectedTreatmentFirst;
                    const opts = TREATMENT_PRODUCT_OPTIONS[treatment] ?? [];
                    const fullList = opts.filter(
                      (p) => p !== OTHER_PRODUCT_LABEL
                    );
                    const recommended = getRecommendedProducts(
                      treatment,
                      productContextString
                    );
                    const selected =
                      form.treatmentProducts[treatment] ??
                      (treatment === "Skincare" ? form.skincareProduct : "");
                    const otherVal =
                      form.treatmentProductOther[treatment] ??
                      (treatment === "Skincare"
                        ? form.skincareProductOther
                        : "");
                    const sectionTitle =
                      treatment === "Skincare" ? "Product" : "Type";
                    const showSeeAll = openProductSearchFor === treatment;
                    const q = productSearchQuery.trim().toLowerCase();
                    const searchFilteredList = q
                      ? fullList.filter((p) => p.toLowerCase().includes(q))
                      : fullList;
                    return (
                      <div className="discussed-treatments-treatment-sub-box">
                        <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                          {sectionTitle} (optional)
                        </h3>
                        <p className="discussed-treatments-form-hint">
                          Select a {sectionTitle.toLowerCase()} if desired, or
                          skip to add to plan.
                        </p>
                        <div className="discussed-treatments-product-inline discussed-treatments-product-inline-by-treatment">
                          {treatment === "Skincare" ? (
                            <div
                              className="discussed-treatments-product-carousel"
                              role="group"
                              aria-label={`Select ${sectionTitle.toLowerCase()} (multiple)`}
                            >
                              <div className="discussed-treatments-product-carousel-track">
                                {fullList.map((p) => {
                                  const selectedListTx =
                                    form.selectedProductsByTreatment[
                                      treatment
                                    ] ?? [];
                                  const isCheckedTx =
                                    selectedListTx.includes(p);
                                  return (
                                    <label
                                      key={p}
                                      className={`discussed-treatments-product-carousel-item ${
                                        isCheckedTx ? "selected" : ""
                                      } ${p === OTHER_PRODUCT_LABEL ? "other-chip" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isCheckedTx}
                                        onChange={() => {
                                          const currentTx =
                                            form.selectedProductsByTreatment[
                                              treatment
                                            ] ?? [];
                                          setForm((f) => ({
                                            ...f,
                                            selectedProductsByTreatment: {
                                              ...f.selectedProductsByTreatment,
                                              [treatment]: isCheckedTx
                                                ? currentTx.filter(
                                                    (x) => x !== p
                                                  )
                                                : [...currentTx, p],
                                            },
                                            ...(p === OTHER_PRODUCT_LABEL && !isCheckedTx
                                              ? {
                                                  treatmentProductOther: {
                                                    ...f.treatmentProductOther,
                                                    [treatment]: "",
                                                  },
                                                  skincareProductOther: "",
                                                }
                                              : {}),
                                          }));
                                        }}
                                        className="discussed-treatments-checkbox-input"
                                      />
                                      <div
                                        className="discussed-treatments-product-carousel-image"
                                        aria-hidden
                                      />
                                      <span className="discussed-treatments-product-carousel-label">
                                        {p}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ) : treatment === "Laser" ? (
                            <div
                              className="discussed-treatments-product-carousel"
                              role="group"
                              aria-label={`Select ${sectionTitle.toLowerCase()}`}
                            >
                              <div className="discussed-treatments-product-carousel-track">
                                {fullList.map((p) => {
                                  const isSelectedTx = selected === p;
                                  return (
                                    <label
                                      key={p}
                                      className={`discussed-treatments-product-carousel-item discussed-treatments-product-text-only ${
                                        isSelectedTx ? "selected" : ""
                                      } ${p === OTHER_PRODUCT_LABEL ? "other-chip" : ""}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`product-tx-${treatment}`}
                                        checked={isSelectedTx}
                                        onChange={() =>
                                          setForm((f) => ({
                                            ...f,
                                            treatmentProducts: {
                                              ...f.treatmentProducts,
                                              [treatment]: p,
                                            },
                                            treatmentProductOther: {
                                              ...f.treatmentProductOther,
                                              [treatment]:
                                                p === OTHER_PRODUCT_LABEL
                                                  ? f.treatmentProductOther[treatment] ?? ""
                                                  : "",
                                            },
                                          }))
                                        }
                                        className="discussed-treatments-checkbox-input"
                                      />
                                      <div
                                        className="discussed-treatments-product-carousel-image"
                                        aria-hidden
                                      />
                                      <span className="discussed-treatments-product-carousel-label">
                                        {p}
                                      </span>
                                    </label>
                                  );
                                })}
                                {opts.includes(OTHER_PRODUCT_LABEL) && (
                                  <label
                                    className={`discussed-treatments-product-carousel-item discussed-treatments-product-text-only ${
                                      selected === OTHER_PRODUCT_LABEL ? "selected" : ""
                                    } other-chip`}
                                  >
                                    <input
                                      type="radio"
                                      name={`product-tx-${treatment}`}
                                      checked={selected === OTHER_PRODUCT_LABEL}
                                      onChange={() =>
                                        setForm((f) => ({
                                          ...f,
                                          treatmentProducts: {
                                            ...f.treatmentProducts,
                                            [treatment]: OTHER_PRODUCT_LABEL,
                                          },
                                          treatmentProductOther: {
                                            ...f.treatmentProductOther,
                                            [treatment]: f.treatmentProductOther[treatment] ?? "",
                                          },
                                        }))
                                      }
                                      className="discussed-treatments-checkbox-input"
                                    />
                                    <div
                                      className="discussed-treatments-product-carousel-image"
                                      aria-hidden
                                    />
                                    <span className="discussed-treatments-product-carousel-label">
                                      {OTHER_PRODUCT_LABEL}
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              {recommended.length > 0 && (
                                <div
                                  className="discussed-treatments-chip-row"
                                  role="group"
                                  aria-label={`Suggested ${sectionTitle}`}
                                >
                                  {recommended.map((p) => (
                                    <label
                                      key={p}
                                      className={`discussed-treatments-prefill-chip ${
                                        selected === p ? "selected" : ""
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`product-tx-rec-${treatment}`}
                                        checked={selected === p}
                                        onChange={() =>
                                          setForm((f) => ({
                                            ...f,
                                            treatmentProducts: {
                                              ...f.treatmentProducts,
                                              [treatment]: p,
                                            },
                                            treatmentProductOther: {
                                              ...f.treatmentProductOther,
                                              [treatment]: "",
                                            },
                                            ...(treatment === "Skincare"
                                              ? {
                                                  skincareProduct: p,
                                                  skincareProductOther: "",
                                                }
                                              : {}),
                                          }))
                                        }
                                        className="discussed-treatments-radio-input"
                                      />
                                      {p}
                                    </label>
                                  ))}
                                </div>
                              )}
                              {selected &&
                                selected !== OTHER_PRODUCT_LABEL &&
                                !recommended.includes(selected) && (
                                  <div className="discussed-treatments-product-selected-other">
                                    <span className="discussed-treatments-product-selected-label">
                                      Selected: {selected}
                                    </span>
                                    <button
                                      type="button"
                                      className="discussed-treatments-product-change-btn"
                                      onClick={() => {
                                        setOpenProductSearchFor(treatment);
                                        setProductSearchQuery("");
                                      }}
                                    >
                                      Change
                                    </button>
                                  </div>
                                )}
                              {!showSeeAll ? (
                                <button
                                  type="button"
                                  className="discussed-treatments-see-all-options-btn"
                                  onClick={() => {
                                    setOpenProductSearchFor(treatment);
                                    setProductSearchQuery("");
                                  }}
                                >
                                  {SEE_ALL_OPTIONS_LABEL}
                                </button>
                              ) : null}
                            </>
                          )}
                          {(treatment === "Skincare" &&
                            (form.selectedProductsByTreatment[treatment] ?? []).includes(OTHER_PRODUCT_LABEL)) ||
                          (treatment === "Laser" && selected === OTHER_PRODUCT_LABEL) ? (
                            <div className="discussed-treatments-product-other-input-wrap">
                              <input
                                type="text"
                                placeholder="Specify product or device"
                                value={otherVal}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    treatmentProductOther: {
                                      ...f.treatmentProductOther,
                                      [treatment]: e.target.value,
                                    },
                                    ...(treatment === "Skincare"
                                      ? {
                                          skincareProductOther:
                                            e.target.value,
                                        }
                                      : {}),
                                  }))
                                }
                                className="discussed-treatments-prefill-other-input"
                              />
                            </div>
                          ) : null}
                          {treatment !== "Skincare" &&
                            treatment !== "Laser" &&
                            showSeeAll ? (
                            isNarrowScreen ? (
                            <div className="discussed-treatments-product-search-wrap">
                              <div className="discussed-treatments-mobile-select-wrap">
                                <select
                                  className="discussed-treatments-mobile-select"
                                  value={selected || ""}
                                  onChange={(e) => {
                                    const p = e.target.value;
                                    setForm((f) => ({
                                      ...f,
                                      treatmentProducts: {
                                        ...f.treatmentProducts,
                                        [treatment]: p,
                                      },
                                      treatmentProductOther: {
                                        ...f.treatmentProductOther,
                                        [treatment]: "",
                                      },
                                      ...(treatment === "Skincare"
                                        ? {
                                            skincareProduct: p,
                                            skincareProductOther: "",
                                          }
                                        : {}),
                                    }));
                                    setOpenProductSearchFor(null);
                                    setProductSearchQuery("");
                                  }}
                                  aria-label={`Select ${sectionTitle.toLowerCase()}`}
                                >
                                  <option value="">Select or skip…</option>
                                  {fullList.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                  {opts.includes(OTHER_PRODUCT_LABEL) && (
                                    <option value={OTHER_PRODUCT_LABEL}>
                                      {OTHER_PRODUCT_LABEL}
                                    </option>
                                  )}
                                </select>
                              </div>
                              <button
                                type="button"
                                className="discussed-treatments-interest-back-btn"
                                onClick={() => {
                                  setOpenProductSearchFor(null);
                                  setProductSearchQuery("");
                                }}
                              >
                                ← Back
                              </button>
                            </div>
                          ) : (
                            <div className="discussed-treatments-product-search-wrap">
                              <input
                                type="text"
                                className="discussed-treatments-interest-search-input"
                                placeholder="Search options..."
                                value={productSearchQuery}
                                onChange={(e) =>
                                  setProductSearchQuery(e.target.value)
                                }
                                autoFocus
                              />
                              <button
                                type="button"
                                className="discussed-treatments-interest-back-btn"
                                onClick={() => {
                                  setOpenProductSearchFor(null);
                                  setProductSearchQuery("");
                                }}
                              >
                                ← Back
                              </button>
                              <div
                                className="discussed-treatments-interest-dropdown discussed-treatments-findings-dropdown"
                                role="listbox"
                              >
                                {searchFilteredList.map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    role="option"
                                    className={`discussed-treatments-interest-option ${
                                      selected === p ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                      setForm((f) => ({
                                        ...f,
                                        treatmentProducts: {
                                          ...f.treatmentProducts,
                                          [treatment]: p,
                                        },
                                        treatmentProductOther: {
                                          ...f.treatmentProductOther,
                                          [treatment]: "",
                                        },
                                        ...(treatment === "Skincare"
                                          ? {
                                              skincareProduct: p,
                                              skincareProductOther: "",
                                            }
                                          : {}),
                                      }));
                                      setOpenProductSearchFor(null);
                                      setProductSearchQuery("");
                                    }}
                                  >
                                    {p}
                                  </button>
                                ))}
                                {opts.includes(OTHER_PRODUCT_LABEL) && (
                                  <button
                                    type="button"
                                    role="option"
                                    className={`discussed-treatments-interest-option ${
                                      selected === OTHER_PRODUCT_LABEL
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setForm((f) => ({
                                        ...f,
                                        treatmentProducts: {
                                          ...f.treatmentProducts,
                                          [treatment]: OTHER_PRODUCT_LABEL,
                                        },
                                        ...(treatment === "Skincare"
                                          ? {
                                              skincareProduct:
                                                OTHER_PRODUCT_LABEL,
                                            }
                                          : {}),
                                      }));
                                      setOpenProductSearchFor(null);
                                      setProductSearchQuery("");
                                    }}
                                  >
                                    {OTHER_PRODUCT_LABEL}
                                  </button>
                                )}
                                {searchFilteredList.length === 0 &&
                                  !opts.includes(OTHER_PRODUCT_LABEL) && (
                                    <div className="discussed-treatments-interest-empty">
                                      No matches.
                                    </div>
                                  )}
                              </div>
                            </div>
                          ) ) : null}
                          {selected === OTHER_PRODUCT_LABEL &&
                            treatment !== "Skincare" &&
                            treatment !== "Laser" && (
                              <div className="discussed-treatments-product-other-input-wrap">
                                <input
                                  type="text"
                                  placeholder="Specify (e.g. custom product)"
                                  value={otherVal}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      treatmentProductOther: {
                                        ...f.treatmentProductOther,
                                        [treatment]: e.target.value,
                                      },
                                      ...(treatment === "Skincare"
                                        ? {
                                            skincareProductOther:
                                              e.target.value,
                                          }
                                        : {}),
                                    }))
                                  }
                                  className="discussed-treatments-prefill-other-input"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* --- By goal: Treatment Interests heading + topic chips, or full list only when Other clicked --- */}
            {addMode === "goal" && (
              <div className="discussed-treatments-goal-flow-box">
              <div className="discussed-treatments-patient-interests-section">
                <div className="discussed-treatments-section-label discussed-treatments-form-title-step2">
                  Patient's Treatment Interests
                </div>
                {!showFullInterestList ? (
                  <>
                    <div
                      className="discussed-treatments-topic-grid"
                      role="group"
                      aria-label="Interest from analysis or Other"
                    >
                      {interestChipOptions.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          className={`discussed-treatments-topic-chip ${
                            form.interest === topic ? "selected" : ""
                          } ${topic === OTHER_LABEL ? "other-chip" : ""}`}
                          onClick={() => {
                            if (topic === OTHER_LABEL) {
                              setShowFullInterestList(true);
                              setForm((f) => ({
                                ...f,
                                interest: "",
                                selectedFindingsByTreatment: {},
                                selectedTreatments: [],
                                otherTreatment: "",
                              }));
                              setInterestSearch("");
                            } else {
                              setForm((f) => ({
                                ...f,
                                interest: form.interest === topic ? "" : topic,
                                selectedFindingsByTreatment: {},
                                selectedTreatments: [],
                                otherTreatment: "",
                              }));
                            }
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                    {form.interest &&
                      !interestChipOptions.includes(form.interest) && (
                        <div className="discussed-treatments-topic-grid discussed-treatments-selected-from-list-chips">
                          <span className="discussed-treatments-topic-chip selected">
                            {form.interest}
                          </span>
                          <button
                            type="button"
                            className="discussed-treatments-topic-chip discussed-treatments-interest-change-chip"
                            onClick={() => {
                              setShowFullInterestList(true);
                              setInterestSearch(form.interest);
                            }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                  </>
                ) : (
                  <div
                    className={
                      isNarrowScreen
                        ? "discussed-treatments-interest-search-wrap discussed-treatments-interest-mobile-picker"
                        : "discussed-treatments-interest-search-wrap"
                    }
                  >
                    {isNarrowScreen ? (
                      <>
                        <label
                          htmlFor="treatment-interest-select"
                          className="discussed-treatments-mobile-picker-label"
                        >
                          Select treatment interest
                        </label>
                        <select
                          id="treatment-interest-select"
                          className="discussed-treatments-mobile-select"
                          value={form.interest || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => ({
                              ...f,
                              interest: v,
                              selectedFindingsByTreatment: {},
                              selectedTreatments: [],
                              otherTreatment: "",
                            }));
                            setInterestSearch(v);
                            if (v) setShowFullInterestList(false);
                          }}
                          aria-label="Select treatment interest"
                        >
                          <option value="">Select an option…</option>
                          {topicOptions.map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="discussed-treatments-interest-back-btn discussed-treatments-mobile-picker-back"
                          onClick={() => {
                            setShowFullInterestList(false);
                            setInterestSearch("");
                          }}
                        >
                          ← Back to chips
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="discussed-treatments-interest-full-list-header">
                          <span className="discussed-treatments-interest-full-list-title">
                            Choose from full list
                          </span>
                          <button
                            type="button"
                            className="discussed-treatments-interest-back-btn"
                            onClick={() => {
                              setShowFullInterestList(false);
                              setInterestSearch("");
                            }}
                          >
                            ← Back to chips
                          </button>
                        </div>
                        <>
                          <input
                            type="text"
                            className="discussed-treatments-interest-search-input"
                            placeholder="Search or select interest..."
                            value={form.interest || interestSearch}
                            onChange={(e) => {
                              const v = e.target.value;
                              setInterestSearch(v);
                              if (form.interest)
                                setForm((f) => ({
                                  ...f,
                                  interest: "",
                                  selectedTreatments: [],
                                  otherTreatment: "",
                                }));
                            }}
                          />
                          <button
                            type="button"
                            className="discussed-treatments-interest-clear-btn"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                interest: "",
                                selectedTreatments: [],
                                otherTreatment: "",
                              }));
                              setInterestSearch("");
                            }}
                            aria-label="Clear interest"
                            title="Clear"
                            style={{
                              visibility:
                                form.interest || interestSearch
                                  ? "visible"
                                  : "hidden",
                            }}
                          >
                            ×
                          </button>
                          <div
                            className="discussed-treatments-interest-dropdown"
                            role="listbox"
                            aria-label="Interest options"
                          >
                            {filteredInterestOptions.map((topic) => (
                              <button
                                key={topic}
                                type="button"
                                role="option"
                                aria-selected={form.interest === topic}
                                className={`discussed-treatments-interest-option ${
                                  form.interest === topic ? "selected" : ""
                                }`}
                                onClick={() => {
                                  setForm((f) => ({
                                    ...f,
                                    interest:
                                      form.interest === topic ? "" : topic,
                                    selectedFindingsByTreatment: {},
                                    selectedTreatments: [],
                                    otherTreatment: "",
                                  }));
                                  setInterestSearch("");
                                  setShowFullInterestList(false);
                                }}
                              >
                                {topic}
                              </button>
                            ))}
                            {filteredInterestOptions.length === 0 && (
                              <div className="discussed-treatments-interest-empty">
                                No matches. Select &quot;Other&quot; for custom.
                              </div>
                            )}
                          </div>
                        </>
                      </>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}

            {/* Treatments: each treatment with product options shows product/type right below */}
            {(addMode === "goal" && form.interest) ||
            (addMode === "finding" && selectedFindings.length > 0) ? (
              <div className="discussed-treatments-treatment-options-block">
                <h3 className="discussed-treatments-form-title discussed-treatments-form-title-step2">
                  Treatment options
                </h3>
                <p className="discussed-treatments-form-hint discussed-treatments-treatments-subheading">
                  Optional — check any that apply
                </p>
                <div
                  className="discussed-treatments-treatments-with-products"
                  role="group"
                  aria-label="Treatments discussed"
                >
                  {treatmentsForTopic.map((name) => {
                    const hasProductOptions =
                      (TREATMENT_PRODUCT_OPTIONS[name]?.length ?? 0) > 0;
                    const isSelected = form.selectedTreatments.includes(name);
                    if (hasProductOptions) {
                      const treatment = name;
                      const opts = TREATMENT_PRODUCT_OPTIONS[treatment] ?? [];
                      const fullList = opts.filter(
                        (p) => p !== OTHER_PRODUCT_LABEL
                      );
                      const recommended = getRecommendedProducts(
                        treatment,
                        productContextString
                      );
                      const selected =
                        form.treatmentProducts[treatment] ??
                        (treatment === "Skincare" ? form.skincareProduct : "");
                      const otherVal =
                        form.treatmentProductOther[treatment] ??
                        (treatment === "Skincare"
                          ? form.skincareProductOther
                          : "");
                      const sectionTitle =
                        treatment === "Skincare" ? "Product" : "Type";
                      const showSeeAll = openProductSearchFor === treatment;
                      const q = productSearchQuery.trim().toLowerCase();
                      const searchFilteredList = q
                        ? fullList.filter((p) => p.toLowerCase().includes(q))
                        : fullList;
                      return (
                        <div
                          key={name}
                          className="discussed-treatments-treatment-block"
                        >
                          <label
                            className={`discussed-treatments-checkbox-chip discussed-treatments-treatment-chip ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTreatment(name)}
                              className="discussed-treatments-checkbox-input"
                            />
                            <span className="discussed-treatments-checkbox-label">
                              {name}
                            </span>
                          </label>
                          {isSelected && (
                            <div className="discussed-treatments-product-inline">
                              <span className="discussed-treatments-product-inline-label">
                                {sectionTitle}
                              </span>
                              {treatment === "Skincare" ? (
                                <div
                                  className="discussed-treatments-product-carousel"
                                  role="group"
                                  aria-label={`Select ${sectionTitle.toLowerCase()} (multiple)`}
                                >
                                  <div className="discussed-treatments-product-carousel-track">
                                    {fullList.map((p) => {
                                      const selectedList =
                                        form.selectedProductsByTreatment[
                                          treatment
                                        ] ?? [];
                                      const isChecked =
                                        selectedList.includes(p);
                                      return (
                                        <label
                                          key={p}
                                          className={`discussed-treatments-product-carousel-item ${
                                            isChecked ? "selected" : ""
                                          } ${p === OTHER_PRODUCT_LABEL ? "other-chip" : ""}`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              const current =
                                                form.selectedProductsByTreatment[
                                                  treatment
                                                ] ?? [];
                                              setForm((f) => ({
                                                ...f,
                                                selectedProductsByTreatment: {
                                                  ...f.selectedProductsByTreatment,
                                                  [treatment]: isChecked
                                                    ? current.filter(
                                                        (x) => x !== p
                                                      )
                                                    : [...current, p],
                                                },
                                                ...(p === OTHER_PRODUCT_LABEL && !isChecked
                                                  ? {
                                                      treatmentProductOther: {
                                                        ...f.treatmentProductOther,
                                                        [treatment]: "",
                                                      },
                                                      skincareProductOther: "",
                                                    }
                                                  : {}),
                                              }));
                                            }}
                                            className="discussed-treatments-checkbox-input"
                                          />
                                          <div
                                            className="discussed-treatments-product-carousel-image"
                                            aria-hidden
                                          />
                                          <span className="discussed-treatments-product-carousel-label">
                                            {p}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : treatment === "Laser" ? (
                                <div
                                  className="discussed-treatments-product-carousel"
                                  role="group"
                                  aria-label={`Select ${sectionTitle.toLowerCase()}`}
                                >
                                  <div className="discussed-treatments-product-carousel-track">
                                    {fullList.map((p) => {
                                      const isSelectedRec = selected === p;
                                      return (
                                        <label
                                          key={p}
                                          className={`discussed-treatments-product-carousel-item discussed-treatments-product-text-only ${
                                            isSelectedRec ? "selected" : ""
                                          } ${p === OTHER_PRODUCT_LABEL ? "other-chip" : ""}`}
                                        >
                                          <input
                                            type="radio"
                                            name={`product-rec-${treatment}`}
                                            checked={isSelectedRec}
                                            onChange={() =>
                                              setForm((f) => ({
                                                ...f,
                                                treatmentProducts: {
                                                  ...f.treatmentProducts,
                                                  [treatment]: p,
                                                },
                                                treatmentProductOther: {
                                                  ...f.treatmentProductOther,
                                                  [treatment]:
                                                    p === OTHER_PRODUCT_LABEL
                                                      ? f.treatmentProductOther[treatment] ?? ""
                                                      : "",
                                                },
                                              }))
                                            }
                                            className="discussed-treatments-checkbox-input"
                                          />
                                          <div
                                            className="discussed-treatments-product-carousel-image"
                                            aria-hidden
                                          />
                                          <span className="discussed-treatments-product-carousel-label">
                                            {p}
                                          </span>
                                        </label>
                                      );
                                    })}
                                    {opts.includes(OTHER_PRODUCT_LABEL) && (
                                      <label
                                        className={`discussed-treatments-product-carousel-item discussed-treatments-product-text-only ${
                                          selected === OTHER_PRODUCT_LABEL ? "selected" : ""
                                        } other-chip`}
                                      >
                                        <input
                                          type="radio"
                                          name={`product-rec-${treatment}`}
                                          checked={selected === OTHER_PRODUCT_LABEL}
                                          onChange={() =>
                                            setForm((f) => ({
                                              ...f,
                                              treatmentProducts: {
                                                ...f.treatmentProducts,
                                                [treatment]: OTHER_PRODUCT_LABEL,
                                              },
                                              treatmentProductOther: {
                                                ...f.treatmentProductOther,
                                                [treatment]: f.treatmentProductOther[treatment] ?? "",
                                              },
                                            }))
                                          }
                                          className="discussed-treatments-checkbox-input"
                                        />
                                        <div
                                          className="discussed-treatments-product-carousel-image"
                                          aria-hidden
                                        />
                                        <span className="discussed-treatments-product-carousel-label">
                                          {OTHER_PRODUCT_LABEL}
                                        </span>
                                      </label>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {recommended.length > 0 && (
                                    <div
                                      className="discussed-treatments-chip-row"
                                      role="group"
                                      aria-label={`Suggested ${sectionTitle}`}
                                    >
                                      {recommended.map((p) => (
                                        <label
                                          key={p}
                                          className={`discussed-treatments-prefill-chip ${
                                            selected === p ? "selected" : ""
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`product-rec-${treatment}`}
                                            checked={selected === p}
                                            onChange={() =>
                                              setForm((f) => ({
                                                ...f,
                                                treatmentProducts: {
                                                  ...f.treatmentProducts,
                                                  [treatment]: p,
                                                },
                                                treatmentProductOther: {
                                                  ...f.treatmentProductOther,
                                                  [treatment]: "",
                                                },
                                              }))
                                            }
                                            className="discussed-treatments-radio-input"
                                          />
                                          {p}
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {selected &&
                                    selected !== OTHER_PRODUCT_LABEL &&
                                    !recommended.includes(selected) && (
                                      <div className="discussed-treatments-product-selected-other">
                                        <span className="discussed-treatments-product-selected-label">
                                          Selected: {selected}
                                        </span>
                                        <button
                                          type="button"
                                          className="discussed-treatments-product-change-btn"
                                          onClick={() => {
                                            setOpenProductSearchFor(treatment);
                                            setProductSearchQuery("");
                                          }}
                                        >
                                          Change
                                        </button>
                                      </div>
                                    )}
                                  {!showSeeAll ? (
                                    <button
                                      type="button"
                                      className="discussed-treatments-see-all-options-btn"
                                      onClick={() => {
                                        setOpenProductSearchFor(treatment);
                                        setProductSearchQuery("");
                                      }}
                                    >
                                      {SEE_ALL_OPTIONS_LABEL}
                                    </button>
                                  ) : null}
                                </>
                              )}
                              {treatment === "Skincare" &&
                                (form.selectedProductsByTreatment[treatment]
                                  ?.length ?? 0) > 0 && (
                                  <div className="discussed-treatments-product-selected-other">
                                    <span className="discussed-treatments-product-selected-label">
                                      Selected:{" "}
                                      {(
                                        form.selectedProductsByTreatment[
                                          treatment
                                        ] ?? []
                                      )
                                        .map((p) =>
                                          p === OTHER_PRODUCT_LABEL
                                            ? (
                                                form.treatmentProductOther[
                                                  treatment
                                                ] ||
                                                form.skincareProductOther ||
                                                OTHER_PRODUCT_LABEL
                                              ).trim() || OTHER_PRODUCT_LABEL
                                            : p
                                        )
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}
                              {((treatment === "Skincare" &&
                                (form.selectedProductsByTreatment[treatment] ?? []).includes(
                                  OTHER_PRODUCT_LABEL
                                )) ||
                                (treatment === "Laser" &&
                                  selected === OTHER_PRODUCT_LABEL)) && (
                                <div className="discussed-treatments-product-other-input-wrap">
                                  <input
                                    type="text"
                                    placeholder="Specify product or device"
                                    value={otherVal}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        treatmentProductOther: {
                                          ...f.treatmentProductOther,
                                          [treatment]: e.target.value,
                                        },
                                        ...(treatment === "Skincare"
                                          ? {
                                              skincareProductOther:
                                                e.target.value,
                                            }
                                          : {}),
                                      }))
                                    }
                                    className="discussed-treatments-prefill-other-input"
                                  />
                                </div>
                              )}
                              {treatment !== "Skincare" &&
                                treatment !== "Laser" &&
                                showSeeAll ? (
                              isNarrowScreen ? (
                                <div className="discussed-treatments-product-search-wrap">
                                  <div className="discussed-treatments-mobile-select-wrap">
                                    <select
                                      className="discussed-treatments-mobile-select"
                                      value={selected || ""}
                                      onChange={(e) => {
                                        const p = e.target.value;
                                        setForm((f) => ({
                                          ...f,
                                          treatmentProducts: {
                                            ...f.treatmentProducts,
                                            [treatment]: p,
                                          },
                                          treatmentProductOther: {
                                            ...f.treatmentProductOther,
                                            [treatment]: "",
                                          },
                                          ...(treatment === "Skincare"
                                            ? {
                                                skincareProduct: p,
                                                skincareProductOther: "",
                                              }
                                            : {}),
                                        }));
                                        setOpenProductSearchFor(null);
                                        setProductSearchQuery("");
                                      }}
                                      aria-label={`Select ${sectionTitle.toLowerCase()}`}
                                    >
                                      <option value="">Select or skip…</option>
                                      {fullList.map((p) => (
                                        <option key={p} value={p}>
                                          {p}
                                        </option>
                                      ))}
                                      {opts.includes(OTHER_PRODUCT_LABEL) && (
                                        <option value={OTHER_PRODUCT_LABEL}>
                                          {OTHER_PRODUCT_LABEL}
                                        </option>
                                      )}
                                    </select>
                                  </div>
                                  <button
                                    type="button"
                                    className="discussed-treatments-interest-back-btn"
                                    onClick={() => {
                                      setOpenProductSearchFor(null);
                                      setProductSearchQuery("");
                                    }}
                                  >
                                    ← Back
                                  </button>
                                </div>
                              ) : (
                                <div className="discussed-treatments-product-search-wrap">
                                  <input
                                    type="text"
                                    className="discussed-treatments-interest-search-input"
                                    placeholder="Search options..."
                                    value={productSearchQuery}
                                    onChange={(e) =>
                                      setProductSearchQuery(e.target.value)
                                    }
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    className="discussed-treatments-interest-back-btn"
                                    onClick={() => {
                                      setOpenProductSearchFor(null);
                                      setProductSearchQuery("");
                                    }}
                                  >
                                    ← Back
                                  </button>
                                  <div
                                    className="discussed-treatments-interest-dropdown discussed-treatments-findings-dropdown"
                                    role="listbox"
                                  >
                                    {searchFilteredList.map((p) => (
                                      <button
                                        key={p}
                                        type="button"
                                        role="option"
                                        className={`discussed-treatments-interest-option ${
                                          selected === p ? "selected" : ""
                                        }`}
                                        onClick={() => {
                                          setForm((f) => ({
                                            ...f,
                                            treatmentProducts: {
                                              ...f.treatmentProducts,
                                              [treatment]: p,
                                            },
                                            treatmentProductOther: {
                                              ...f.treatmentProductOther,
                                              [treatment]: "",
                                            },
                                            ...(treatment === "Skincare"
                                              ? {
                                                  skincareProduct: p,
                                                  skincareProductOther: "",
                                                }
                                              : {}),
                                          }));
                                          setOpenProductSearchFor(null);
                                          setProductSearchQuery("");
                                        }}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                    {opts.includes(OTHER_PRODUCT_LABEL) && (
                                      <button
                                        type="button"
                                        role="option"
                                        className={`discussed-treatments-interest-option ${
                                          selected === OTHER_PRODUCT_LABEL
                                            ? "selected"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          setForm((f) => ({
                                            ...f,
                                            treatmentProducts: {
                                              ...f.treatmentProducts,
                                              [treatment]: OTHER_PRODUCT_LABEL,
                                            },
                                            ...(treatment === "Skincare"
                                              ? {
                                                  skincareProduct:
                                                    OTHER_PRODUCT_LABEL,
                                                }
                                              : {}),
                                          }));
                                          setOpenProductSearchFor(null);
                                          setProductSearchQuery("");
                                        }}
                                      >
                                        {OTHER_PRODUCT_LABEL}
                                      </button>
                                    )}
                                    {searchFilteredList.length === 0 &&
                                      !opts.includes(OTHER_PRODUCT_LABEL) && (
                                        <div className="discussed-treatments-interest-empty">
                                          No matches.
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ) ) : null}
                              {selected === OTHER_PRODUCT_LABEL &&
                                treatment !== "Skincare" &&
                                treatment !== "Laser" && (
                                <div className="discussed-treatments-product-other-input-wrap">
                                  <input
                                    type="text"
                                    placeholder="Specify (e.g. custom product)"
                                    value={otherVal}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        treatmentProductOther: {
                                          ...f.treatmentProductOther,
                                          [treatment]: e.target.value,
                                        },
                                        ...(treatment === "Skincare"
                                          ? {
                                              skincareProductOther:
                                                e.target.value,
                                            }
                                          : {}),
                                      }))
                                    }
                                    className="discussed-treatments-prefill-other-input"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {isSelected &&
                            addMode === "goal" &&
                            (() => {
                              const issues = getDetectedIssuesForTreatment(
                                name,
                                form.interest ?? ""
                              );
                              if (issues.length === 0) return null;
                              const selected =
                                form.selectedFindingsByTreatment[name] ??
                                issues;
                              return (
                                <div
                                  className="discussed-treatments-detected-issues-inline"
                                  role="group"
                                  aria-label={`Detected issues for ${name}`}
                                >
                                  <span className="discussed-treatments-detected-issues-inline-label">
                                    Select the issues detected below that relate to this treatment:
                                  </span>
                                  <div
                                    className="discussed-treatments-chip-row discussed-treatments-detected-issues-chips"
                                    role="group"
                                  >
                                    {issues.map((issue) => {
                                      const isIssueSelected =
                                        selected.includes(issue);
                                      return (
                                        <label
                                          key={issue}
                                          className={`discussed-treatments-checkbox-chip discussed-treatments-treatment-chip ${
                                            isIssueSelected ? "selected" : ""
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isIssueSelected}
                                            onChange={() => {
                                              const current =
                                                form.selectedFindingsByTreatment[
                                                  name
                                                ] ?? issues;
                                              setForm((f) => ({
                                                ...f,
                                                selectedFindingsByTreatment: {
                                                  ...f.selectedFindingsByTreatment,
                                                  [name]: isIssueSelected
                                                    ? current.filter(
                                                        (x) => x !== issue
                                                      )
                                                    : [...current, issue],
                                                },
                                              }));
                                            }}
                                            className="discussed-treatments-checkbox-input"
                                          />
                                          <span className="discussed-treatments-checkbox-label">
                                            {issue}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                        </div>
                      );
                    }
                    const issuesForTreatment =
                      addMode === "goal"
                        ? getDetectedIssuesForTreatment(
                            name,
                            form.interest ?? ""
                          )
                        : [];
                    const hasIssuesInline =
                      isSelected &&
                      addMode === "goal" &&
                      issuesForTreatment.length > 0;
                    return (
                      <div
                        key={name}
                        className="discussed-treatments-treatment-block"
                      >
                        <label
                          className={`discussed-treatments-checkbox-chip discussed-treatments-treatment-chip ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTreatment(name)}
                            className="discussed-treatments-checkbox-input"
                          />
                          <span className="discussed-treatments-checkbox-label">
                            {name}
                          </span>
                        </label>
                        {hasIssuesInline && (
                          <div
                            className="discussed-treatments-detected-issues-inline"
                            role="group"
                            aria-label={`Detected issues for ${name}`}
                          >
                            <span className="discussed-treatments-detected-issues-inline-label">
                              Select the issues detected below that relate to this treatment:
                            </span>
                            <div
                              className="discussed-treatments-chip-row discussed-treatments-detected-issues-chips"
                              role="group"
                            >
                              {issuesForTreatment.map((issue) => {
                                const selectedForTx =
                                  form.selectedFindingsByTreatment[name] ??
                                  issuesForTreatment;
                                const isIssueSelected =
                                  selectedForTx.includes(issue);
                                return (
                                  <label
                                    key={issue}
                                    className={`discussed-treatments-checkbox-chip discussed-treatments-treatment-chip ${
                                      isIssueSelected ? "selected" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isIssueSelected}
                                      onChange={() => {
                                        const current =
                                          form.selectedFindingsByTreatment[
                                            name
                                          ] ?? issuesForTreatment;
                                        setForm((f) => ({
                                          ...f,
                                          selectedFindingsByTreatment: {
                                            ...f.selectedFindingsByTreatment,
                                            [name]: isIssueSelected
                                              ? current.filter(
                                                  (x) => x !== issue
                                                )
                                              : [...current, issue],
                                          },
                                        }));
                                      }}
                                      className="discussed-treatments-checkbox-input"
                                    />
                                    <span className="discussed-treatments-checkbox-label">
                                      {issue}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="discussed-treatments-other-chip-row">
                    <label
                      className={`discussed-treatments-checkbox-chip discussed-treatments-topic-chip other-chip ${
                        form.selectedTreatments.includes(
                          OTHER_TREATMENT_LABEL
                        ) || !!form.otherTreatment.trim()
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          form.selectedTreatments.includes(
                            OTHER_TREATMENT_LABEL
                          ) || !!form.otherTreatment.trim()
                        }
                        onChange={() => {
                          if (
                            form.selectedTreatments.includes(
                              OTHER_TREATMENT_LABEL
                            ) ||
                            form.otherTreatment.trim()
                          ) {
                            setForm((f) => ({
                              ...f,
                              selectedTreatments: f.selectedTreatments.filter(
                                (t) => t !== OTHER_TREATMENT_LABEL
                              ),
                              otherTreatment: "",
                            }));
                          } else {
                            setForm((f) => ({
                              ...f,
                              selectedTreatments: [
                                ...f.selectedTreatments,
                                OTHER_TREATMENT_LABEL,
                              ],
                            }));
                          }
                        }}
                        className="discussed-treatments-checkbox-input"
                      />
                      <span className="discussed-treatments-checkbox-label">
                        {OTHER_TREATMENT_LABEL}
                      </span>
                    </label>
                    {(form.selectedTreatments.includes(OTHER_TREATMENT_LABEL) ||
                      !!form.otherTreatment.trim()) && (
                      <input
                        type="text"
                        placeholder="Type treatment name"
                        value={form.otherTreatment}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          setForm((f) => ({
                            ...f,
                            otherTreatment: e.target.value,
                            selectedTreatments: v
                              ? f.selectedTreatments.includes(
                                  OTHER_TREATMENT_LABEL
                                )
                                ? f.selectedTreatments
                                : [
                                    ...f.selectedTreatments,
                                    OTHER_TREATMENT_LABEL,
                                  ]
                              : f.selectedTreatments.filter(
                                  (t) => t !== OTHER_TREATMENT_LABEL
                                ),
                          }));
                        }}
                        className="discussed-treatments-other-treatment-inline-input"
                        aria-label="Other treatment name"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>

                {!form.showOptional ? (
                  <button
                    type="button"
                    className="discussed-treatments-optional-toggle"
                    onClick={() =>
                      setForm((f) => ({ ...f, showOptional: true }))
                    }
                  >
                    + Add details (optional — timeline)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="discussed-treatments-optional-toggle discussed-treatments-optional-hide"
                      onClick={() =>
                        setForm((f) => ({ ...f, showOptional: false }))
                      }
                    >
                      − Hide optional details
                    </button>
                    <div className="discussed-treatments-prefill-rows">
                      <div className="discussed-treatments-prefill-row">
                        <span className="discussed-treatments-prefill-label">
                          Timeline
                        </span>
                        <div className="discussed-treatments-chip-row">
                          {TIMELINE_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className={`discussed-treatments-prefill-chip ${
                                form.timeline === opt ? "selected" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="timeline"
                                checked={form.timeline === opt}
                                onChange={() =>
                                  setForm((f) => ({ ...f, timeline: opt }))
                                }
                                className="discussed-treatments-radio-input"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-group discussed-treatments-notes-row">
                      <label htmlFor="discussed-notes" className="form-label">
                        Notes (optional)
                      </label>
                      <input
                        id="discussed-notes"
                        type="text"
                        placeholder="Any other detail"
                        value={form.notes}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        className="form-input-base"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="btn-primary discussed-treatments-add-btn"
                  onClick={handleAdd}
                  disabled={
                    (!hasAnyTreatmentSelected && !canAddWithGoalOnly) ||
                    savingAdd
                  }
                >
                  {savingAdd ? "Saving..." : "Add to plan"}
                </button>
              </div>
            ) : addMode === "treatment" && selectedTreatmentFirst ? (
              <>
                {!form.showOptional ? (
                  <button
                    type="button"
                    className="discussed-treatments-optional-toggle"
                    onClick={() =>
                      setForm((f) => ({ ...f, showOptional: true }))
                    }
                  >
                    + Add details (optional — timeline)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="discussed-treatments-optional-toggle discussed-treatments-optional-hide"
                      onClick={() =>
                        setForm((f) => ({ ...f, showOptional: false }))
                      }
                    >
                      − Hide optional details
                    </button>
                    <div className="discussed-treatments-prefill-rows">
                      <div className="discussed-treatments-prefill-row">
                        <span className="discussed-treatments-prefill-label">
                          Timeline
                        </span>
                        <div className="discussed-treatments-chip-row">
                          {TIMELINE_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className={`discussed-treatments-prefill-chip ${
                                form.timeline === opt ? "selected" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="timeline-by-tx"
                                checked={form.timeline === opt}
                                onChange={() =>
                                  setForm((f) => ({ ...f, timeline: opt }))
                                }
                                className="discussed-treatments-radio-input"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="form-group discussed-treatments-notes-row">
                      <label
                        htmlFor="discussed-notes-tx"
                        className="form-label"
                      >
                        Notes (optional)
                      </label>
                      <input
                        id="discussed-notes-tx"
                        type="text"
                        placeholder="Any other detail"
                        value={form.notes}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        className="form-input-base"
                      />
                    </div>
                  </>
                )}
                <button
                  type="button"
                  className="btn-primary discussed-treatments-add-btn"
                  onClick={handleAdd}
                  disabled={!hasAnyTreatmentSelected || savingAdd}
                >
                  {savingAdd ? "Saving..." : "Add to plan"}
                </button>
              </>
            ) : null}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

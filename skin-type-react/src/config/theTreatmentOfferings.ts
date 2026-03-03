/**
 * The Treatment Skin Boutique – treatments they offer (from 2025 price list).
 * Used to filter case results for /the-treatment so only cases for offered treatments are shown.
 * Excludes e.g. Liquid Rhinoplasty, Laser Hair Removal, Ultraclear.
 */

/** Phrases that indicate a treatment The Treatment does NOT offer – case is excluded if treatment contains any of these. */
export const THE_TREATMENT_EXCLUDED_PHRASES: string[] = [
  "Liquid Rhinoplasty",
  "Laser Hair Removal",
  "Ultraclear",
];

/**
 * Keywords that indicate a treatment The Treatment DOES offer (from treatmentPricing2025 / 2025 price list).
 * A case is included only if its treatment field matches at least one of these (case-insensitive substring).
 */
export const THE_TREATMENT_OFFERED_KEYWORDS: string[] = [
  // Injectables / Neurotoxin / Filler / Biostimulants
  "Botox",
  "Dysport",
  "Filler",
  "Voluma",
  "Volux",
  "Radiesse",
  "Sculptra",
  "Skinvive",
  "Spider Vein",
  "Neurotoxin",
  "Biostimulant",
  "Dissolver",
  // Medical Spa
  "Microneedling",
  "PRFM",
  // Facials / Skincare
  "Facial",
  "Dermaplaning",
  "Dermasweep",
  "Skincare",
  // Chemical Peel
  "Chemical Peel",
  "Peel",
  "Lactic",
  "Jessner",
  "Sal-X",
  "Cosmelan",
  // Laser (BBL, Moxi – not Laser Hair Removal or Ultraclear; those are excluded above)
  "Moxi",
  "BBL",
  "Laser",
  // Energy / Device
  "Sofwave",
  "Ultherapy",
  // Consultations
  "Consultation",
];

function normalize(s: string): string {
  return (s ?? "").trim().toLowerCase();
}

/**
 * Combined search text from case (name, headline, treatment) for filtering.
 * We check all of these because "Liquid Rhinoplasty" etc. may appear in name/headline
 * when the treatment field is empty or comes from a linked Airtable field we don't map.
 */
function getCaseSearchText(caseItem: {
  treatment?: string;
  name?: string;
  headline?: string;
}): string {
  const parts = [
    caseItem.treatment ?? "",
    caseItem.name ?? "",
    caseItem.headline ?? "",
  ].filter(Boolean);
  return parts.join(" ");
}

/**
 * Returns true if the case should be shown for The Treatment (treatment is one they offer).
 * Excluded phrases are checked first in name, headline, AND treatment; then at least one
 * offered keyword must appear. Cases with no treatment/name/headline are excluded to avoid
 * showing unclassified or wrong-provider cases.
 */
export function isTreatmentOfferedByTheTreatment(
  treatmentOrCase: string | undefined | { treatment?: string; name?: string; headline?: string }
): boolean {
  const caseItem =
    treatmentOrCase != null && typeof treatmentOrCase === "object"
      ? treatmentOrCase
      : { treatment: treatmentOrCase as string, name: "", headline: "" };
  const searchText = normalize(getCaseSearchText(caseItem));
  if (!searchText) return false;

  for (const phrase of THE_TREATMENT_EXCLUDED_PHRASES) {
    if (searchText.includes(normalize(phrase))) return false;
  }

  for (const keyword of THE_TREATMENT_OFFERED_KEYWORDS) {
    if (searchText.includes(normalize(keyword))) return true;
  }

  return false;
}

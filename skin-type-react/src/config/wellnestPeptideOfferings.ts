/**
 * Wellnest (peptide version) – case filtering by indication only.
 * No compound names are used for regulatory compliance; cases are matched by
 * indication phrases (e.g. "peptides for muscle regrowth", "injury recovery").
 * Used to filter Photos so /wellnest only shows peptide-relevant cases.
 */

/** Indication/keyword phrases that indicate a case is for Wellnest peptide offerings. No compound names. */
export const WELLNEST_CASE_INCLUDED_KEYWORDS: string[] = [
  "peptide",
  "peptides",
  "muscle recovery",
  "muscle regrowth",
  "injury recovery",
  "soft tissue",
  "tendon",
  "ligament",
  "gut health",
  "gi support",
  "inflammation",
  "cognitive",
  "memory",
  "focus",
  "brain fog",
  "anxiety",
  "stress",
  "mood",
  "skin firmness",
  "skin laxity",
  "elastin",
  "anti-aging",
  "fat metabolism",
  "visceral fat",
  "weight",
  "cartilage",
  "joint",
  "bone density",
  "osteoporosis",
  "osteoarthritis",
  "growth hormone",
  "recovery",
  "metabolic",
  "longevity",
  "tanning",
  "wellness",
];

function normalize(s: string): string {
  return (s ?? "").trim().toLowerCase();
}

function getCaseSearchText(caseItem: {
  treatment?: string;
  name?: string;
  headline?: string;
  story?: string;
}): string {
  const parts = [
    caseItem.treatment ?? "",
    caseItem.name ?? "",
    caseItem.headline ?? "",
    caseItem.story ?? "",
  ].filter(Boolean);
  return parts.join(" ");
}

/**
 * Returns true if the case should be shown for Wellnest (peptide version).
 * Matches on indication/keyword phrases only; no compound names.
 */
export function isCaseForWellnest(
  caseItem:
    | string
    | undefined
    | { treatment?: string; name?: string; headline?: string; story?: string }
): boolean {
  const item =
    caseItem != null && typeof caseItem === "object"
      ? caseItem
      : {
          treatment: caseItem as string,
          name: "",
          headline: "",
          story: "",
        };
  const searchText = normalize(getCaseSearchText(item));
  if (!searchText) return false;

  for (const keyword of WELLNEST_CASE_INCLUDED_KEYWORDS) {
    if (searchText.includes(normalize(keyword))) return true;
  }

  return false;
}

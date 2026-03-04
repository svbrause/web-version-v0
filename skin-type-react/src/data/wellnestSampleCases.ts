/**
 * Sample cases for Wellnest when no peptide cases exist in Airtable yet.
 * Indication-only copy (no compound names). Used to give /wellnest something to show.
 */
import type { CaseItem } from "../types";

const SAMPLE_IMAGE = "/onboarding 1 image.png";

export const WELLNEST_SAMPLE_CASES: CaseItem[] = [
  {
    id: "wellnest-sample-1",
    name: "Peptides for injury recovery",
    headline: "Support for tendon and soft tissue recovery",
    story:
      "Focused on recovery support for soft tissue and activity-related wear. Outcomes may vary; discuss with your provider.",
    treatment: "Peptides for injury recovery and soft tissue support",
    beforeAfter: SAMPLE_IMAGE,
    thumbnail: SAMPLE_IMAGE,
    matchingCriteria: ["injury", "recovery", "tendon", "soft tissue"],
  },
  {
    id: "wellnest-sample-2",
    name: "Peptides for muscle recovery and energy",
    headline: "Energy and body composition support",
    story:
      "Goals included energy, recovery, and supporting lean mass. Individual results vary.",
    treatment: "Peptides for energy, recovery, and metabolic support",
    beforeAfter: SAMPLE_IMAGE,
    thumbnail: SAMPLE_IMAGE,
    matchingCriteria: ["muscle", "recovery", "energy", "metabolic"],
  },
  {
    id: "wellnest-sample-3",
    name: "Peptides for skin firmness and anti-aging",
    headline: "Skin health and elasticity support",
    story:
      "Interest in skin firmness and overall skin health. Discuss options with your provider.",
    treatment: "Peptides for skin firmness, elasticity, and anti-aging",
    beforeAfter: SAMPLE_IMAGE,
    thumbnail: SAMPLE_IMAGE,
    matchingCriteria: ["skin", "firmness", "elastin", "anti-aging"],
  },
  {
    id: "wellnest-sample-4",
    name: "Peptides for sleep and recovery",
    headline: "Sleep and recovery support",
    story:
      "Focused on sleep quality and recovery. Results are for discussion with your provider.",
    treatment: "Peptides for sleep and recovery support",
    beforeAfter: SAMPLE_IMAGE,
    thumbnail: SAMPLE_IMAGE,
    matchingCriteria: ["sleep", "recovery", "muscle"],
  },
  {
    id: "wellnest-sample-5",
    name: "Peptides for focus and cognitive support",
    headline: "Cognitive and mood support",
    story:
      "Goals included mental clarity and stress resilience. Outcomes vary by individual.",
    treatment: "Peptides for focus, cognitive support, and mood",
    beforeAfter: SAMPLE_IMAGE,
    thumbnail: SAMPLE_IMAGE,
    matchingCriteria: ["focus", "cognitive", "memory", "mood", "stress"],
  },
];

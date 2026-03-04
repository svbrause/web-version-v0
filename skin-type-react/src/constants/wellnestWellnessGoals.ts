/**
 * Wellnest wellness goals – used as "concerns" on the first step when practice === "wellnest".
 * Aligned with Dr Reddy Treatment Offerings CSV and wellness quiz; no compound names.
 * mapsToPhotos = keywords to match peptide cases (treatment/name/headline/story).
 */
import type { Concern } from "../types";

export const WELLNEST_WELLNESS_GOALS: Concern[] = [
  {
    id: "injury-recovery",
    name: "Injury or sports recovery",
    description: "Support for soft tissue, tendon, ligament, or muscle recovery",
    mapsToPhotos: ["injury", "recovery", "sports", "tendon", "ligament", "soft tissue", "muscle recovery"],
  },
  {
    id: "muscle-growth",
    name: "Muscle growth or toning",
    description: "Building or maintaining lean mass and body composition",
    mapsToPhotos: ["muscle", "growth", "toning", "body composition", "recovery", "lean mass"],
  },
  {
    id: "energy-recovery",
    name: "Energy and recovery",
    description: "Improved energy, fatigue, and overall recovery",
    mapsToPhotos: ["energy", "recovery", "metabolic", "growth hormone", "anti-aging"],
  },
  {
    id: "sleep-support",
    name: "Sleep support",
    description: "Better sleep quality and rest",
    mapsToPhotos: ["sleep", "muscle", "growth", "recovery"],
  },
  {
    id: "memory-focus",
    name: "Memory, focus, or brain fog",
    description: "Cognitive support, clarity, and mental focus",
    mapsToPhotos: ["memory", "focus", "cognitive", "brain fog", "brain", "synapse"],
  },
  {
    id: "anxiety-stress",
    name: "Anxiety, stress, or mood",
    description: "Mood balance and stress resilience",
    mapsToPhotos: ["anxiety", "stress", "mood", "cognition", "fatigue"],
  },
  {
    id: "skin-anti-aging",
    name: "Skin health or anti-aging",
    description: "Skin firmness, elasticity, and longevity",
    mapsToPhotos: ["skin", "firmness", "laxity", "elastin", "anti-aging", "longevity"],
  },
  {
    id: "fat-metabolism",
    name: "Fat loss or metabolism",
    description: "Weight, visceral fat, and metabolic support",
    mapsToPhotos: ["fat", "metabolism", "visceral", "obesity", "weight"],
  },
  {
    id: "bone-joint",
    name: "Bone or joint health",
    description: "Bone density, cartilage, and joint support",
    mapsToPhotos: ["bone", "joint", "cartilage", "osteoporosis", "osteoarthritis"],
  },
  {
    id: "gut-health",
    name: "Gut or digestive health",
    description: "GI lining and digestive support",
    mapsToPhotos: ["gut", "gi", "inflammation", "digestive"],
  },
  {
    id: "tanning",
    name: "Tanning or skin tone",
    description: "Natural tanning support",
    mapsToPhotos: ["tan", "tanning", "melanin"],
  },
];

export const WELLNEST_WELLNESS_GOAL_IDS = new Set(WELLNEST_WELLNESS_GOALS.map((g) => g.id));

export function isWellnestWellnessGoalId(id: string): boolean {
  return WELLNEST_WELLNESS_GOAL_IDS.has(id);
}

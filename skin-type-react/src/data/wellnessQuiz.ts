/**
 * Wellness Quiz – peptide/treatment recommendations from Dr Reddy Treatment Offerings.
 * Questions map to criteria (age, goals, conditions); scoring suggests one or more treatments.
 * Used in the patient app test version (?wellnessQuiz=1).
 */
import type { CaseItem } from "../types";

/** Single treatment offering from the spreadsheet. */
export interface WellnessTreatment {
  id: string;
  name: string;
  category: string;
  whatItAddresses: string;
  /** Short plain-language summary of what this peptide is used for (for results display). */
  summary?: string;
  idealDemographics: string;
  deliveryMethod: string;
  pricing: string;
  notes: string;
  duration: string;
  /** Keywords used to match quiz answers (goals/conditions). */
  matchKeywords: string[];
  /** Minimum age from demographics (e.g. 30, 40, 50, 60, 65). */
  minAge?: number;
}

/** One answer option: label and which treatment IDs it suggests (weight 1 = weak match, 2 = strong). */
export interface WellnessQuizAnswer {
  label: string;
  /** Treatment IDs this answer suggests; value = weight for scoring. */
  scores: Partial<Record<string, number>>;
}

export interface WellnessQuizQuestion {
  id: string;
  title: string;
  question: string;
  answers: WellnessQuizAnswer[];
}

export interface WellnessQuizData {
  questions: WellnessQuizQuestion[];
  treatments: WellnessTreatment[];
}

/** All treatments from Dr Reddy Treatment Offerings CSV (rows 2–19). */
export const WELLNESS_TREATMENTS: WellnessTreatment[] = [
  {
    id: "bpc-157",
    name: "BPC-157",
    category: "Injury recovery, inflammation, gut health",
    whatItAddresses:
      "Soft tissue repair support, tendon/ligament recovery, chronic GI issues, GI lining support, anti-inflammatory properties",
    summary:
      "A peptide that supports soft tissue and tendon/ligament repair, reduces inflammation, and helps with gut lining and chronic GI issues. Often used after injury or intense training.",
    idealDemographics:
      "Anyone aged 30+ with significant contact sports, extreme workouts, or physically active after 40 (male and female)",
    deliveryMethod: "SC injection (best), oral and nasal spray available",
    pricing: "$250",
    notes: "5 weeks supply, prepared under strict aseptic precautions",
    duration: "2 weeks – 8 weeks",
    matchKeywords: ["injury", "recovery", "gut", "gi", "inflammation", "sports", "tendon", "ligament"],
    minAge: 30,
  },
  {
    id: "tb-500",
    name: "Thymosin Beta-4 (TB-500 fragment)",
    category: "Musculoskeletal injury",
    whatItAddresses: "Accelerated muscle recovery, reduced inflammation, improved mobility",
    summary:
      "Supports faster muscle recovery, reduces inflammation, and improves mobility. Commonly used alongside BPC-157 for sports and activity-related injuries.",
    idealDemographics:
      "Anyone aged 30+ with contact sports, extreme workouts, or physically active after 40",
    deliveryMethod: "SC injection (best), nasal spray available",
    pricing: "$200",
    notes: "Ready to use, aseptic precautions",
    duration: "1 week – 8 weeks",
    matchKeywords: ["injury", "muscle", "recovery", "inflammation", "mobility", "sports"],
    minAge: 30,
  },
  {
    id: "cjc-1295",
    name: "CJC-1295",
    category: "Low energy, poor recovery, metabolic optimization",
    whatItAddresses: "Increased IGF-1, fat metabolism support, improved recovery",
    summary:
      "Promotes natural growth hormone release and IGF-1, supporting energy, recovery, fat metabolism, and muscle toning. Used for metabolic and body-composition goals.",
    idealDemographics: "Poor muscle mass gain, toning in men and women",
    deliveryMethod: "SC injection",
    pricing: "$250",
    notes: "5 weeks minimum",
    duration: "4 weeks – 10 weeks",
    matchKeywords: ["energy", "recovery", "metabolic", "muscle", "toning", "fat metabolism"],
    minAge: 30,
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    category: "Sleep and Muscle growth",
    whatItAddresses:
      "Selective ghrelin receptor agonist, natural GH release, minimal cortisol elevation, lean mass preservation",
    summary:
      "Stimulates natural growth hormone release with minimal side effects. Supports sleep quality, lean muscle preservation, and recovery—often preferred for 40+ for sleep and body composition.",
    idealDemographics: "Aged 40+ both sexes",
    deliveryMethod: "SC injection only",
    pricing: "$250",
    notes: "5 weeks",
    duration: "4 weeks – 10 weeks",
    matchKeywords: ["sleep", "muscle", "growth", "recovery"],
    minAge: 40,
  },
  {
    id: "semax",
    name: "Semax",
    category: "Memory",
    whatItAddresses: "Brain fog, focus, cognitive decline",
    summary:
      "A nootropic peptide that may support focus, clarity, and cognitive function. Used to address brain fog and mild cognitive concerns.",
    idealDemographics: "Aged 30+",
    deliveryMethod: "SC injection, nasal spray available",
    pricing: "$300",
    notes: "10 weeks supply",
    duration: "8 weeks – 16 weeks",
    matchKeywords: ["memory", "focus", "cognitive", "brain fog"],
    minAge: 30,
  },
  {
    id: "selank",
    name: "Selank",
    category: "Anxiety, Fatigue, chronic stress",
    whatItAddresses: "Anxiolytic effects, improved cognition, mood balance",
    summary:
      "Supports mood balance, reduced anxiety, and improved resilience to stress. May also support cognition and fatigue related to stress.",
    idealDemographics: "Aged 30+ both sexes",
    deliveryMethod: "SC injection ideal",
    pricing: "$300–500",
    notes: "5–10 weeks",
    duration: "6 weeks – 16 weeks",
    matchKeywords: ["anxiety", "fatigue", "stress", "mood", "cognition"],
    minAge: 30,
  },
  {
    id: "p21",
    name: "P 21",
    category: "Memory",
    whatItAddresses: "Synapse regeneration",
    summary:
      "Supports synapse regeneration and cognitive function. Typically considered for older adults (60+) with memory or cognitive decline concerns.",
    idealDemographics: "Aged 60+",
    deliveryMethod: "SC injection",
    pricing: "$500",
    notes: "10 weeks",
    duration: "3–6 months",
    matchKeywords: ["memory", "cognitive", "synapse"],
    minAge: 60,
  },
  {
    id: "pinealon",
    name: "Pinealon",
    category: "Memory",
    whatItAddresses: "Brain oxidative defense, cognitive decline",
    summary:
      "Supports brain antioxidant defenses and may help with age-related cognitive decline. Often used in the 60+ population for memory and clarity.",
    idealDemographics: "Aged 60+",
    deliveryMethod: "SC injection",
    pricing: "$500",
    notes: "10–16 weeks",
    duration: "3–6 months",
    matchKeywords: ["memory", "cognitive", "brain"],
    minAge: 60,
  },
  {
    id: "ghrp-2-6",
    name: "GHRP-2 / GHRP-6",
    category: "Muscle loss",
    whatItAddresses: "Recovery, body composition",
    summary:
      "Growth hormone–releasing peptides that support recovery and body composition. Used to help maintain or build lean mass and support energy in adults 35+.",
    idealDemographics: "Aged 35+",
    deliveryMethod: "SC injection",
    pricing: "$250",
    notes: "5 weeks",
    duration: "2–5 months",
    matchKeywords: ["muscle", "recovery", "body composition"],
    minAge: 35,
  },
  {
    id: "igf-1-lr3",
    name: "IGF-1 LR3",
    category: "Muscle bulk assistance",
    whatItAddresses: "Muscle growth",
    summary:
      "A long-acting form of IGF-1 that supports muscle growth and recovery. Often used by those 35+ seeking muscle bulk or athletic performance support.",
    idealDemographics: "Aged 35+",
    deliveryMethod: "SC injection",
    pricing: "$250",
    notes: "5 weeks",
    duration: "2–5 months",
    matchKeywords: ["muscle", "growth", "bulk"],
    minAge: 35,
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    category: "Skin health",
    whatItAddresses: "Skin firmness, skin laxity and elastin stimulation",
    summary:
      "Copper peptide that supports skin firmness, elasticity, and repair. Used for skin laxity, anti-aging, and wound healing—often in 40+ for skin and longevity goals.",
    idealDemographics: "Aged 40+",
    deliveryMethod: "SC injection or face peptide cream",
    pricing: "$250–350",
    notes: "5–8 weeks",
    duration: "2–3 months",
    matchKeywords: ["skin", "firmness", "laxity", "elastin", "anti-aging"],
    minAge: 40,
  },
  {
    id: "melanotan-2",
    name: "Melanotan 2",
    category: "Skin Tan, libido",
    whatItAddresses: "Melanin increase, libido increase",
    summary:
      "Supports natural tanning through melanin stimulation and may support libido. Used by adults 30+ for tanning and related wellness goals.",
    idealDemographics: "Natural tanning peptide",
    deliveryMethod: "SC injection",
    pricing: "$200 onwards",
    notes: "5 weeks minimum",
    duration: "3 months",
    matchKeywords: ["tan", "libido"],
    minAge: 30,
  },
  {
    id: "mk-677",
    name: "MK-677",
    category: "Osteoporosis, Osteoarthritis",
    whatItAddresses: "Bone density decline prevention",
    summary:
      "An oral growth hormone secretagogue that may support bone density and joint health. Often considered for adults 65+ with osteoporosis or osteoarthritis concerns.",
    idealDemographics: "Aged 65+",
    deliveryMethod: "SC injection",
    pricing: "$350–600",
    notes: "5–10 weeks",
    duration: "3 months",
    matchKeywords: ["bone", "osteoporosis", "osteoarthritis", "bone density"],
    minAge: 65,
  },
  {
    id: "sermorelin",
    name: "Sermorelin",
    category: "Anti Aging",
    whatItAddresses: "Physiologic GH stimulation, anti-aging interest",
    summary:
      "Stimulates the body’s own growth hormone release in a physiologic way. Used for anti-aging, recovery, and energy in adults 40+.",
    idealDemographics: "Aged 40+",
    deliveryMethod: "SC injection",
    pricing: "$300–500",
    notes: "5–10 weeks",
    duration: "8–12 weeks",
    matchKeywords: ["anti-aging", "recovery", "growth hormone"],
    minAge: 40,
  },
  {
    id: "tessamorelin",
    name: "Tessamorelin",
    category: "Fat, especially visceral fat excess",
    whatItAddresses: "Obesity adjunct therapy",
    summary:
      "Targets visceral fat and supports healthy body composition. Used as an adjunct for weight and metabolic goals in adults 40+.",
    idealDemographics: "Aged 40+",
    deliveryMethod: "SC injection",
    pricing: "$500",
    notes: "5–10 weeks",
    duration: "3 months",
    matchKeywords: ["fat", "visceral", "obesity", "weight"],
    minAge: 40,
  },
  {
    id: "epitalon",
    name: "Epitalon",
    category: "Cellular aging",
    whatItAddresses: "Metabolism reset",
    summary:
      "Supports cellular aging and metabolism. Used for longevity and general anti-aging in adults 40+.",
    idealDemographics: "Aged 40+",
    deliveryMethod: "SC injection",
    pricing: "$400–500",
    notes: "5–10 weeks",
    duration: "3 months",
    matchKeywords: ["aging", "cellular", "metabolism"],
    minAge: 40,
  },
  {
    id: "aod-9604",
    name: "AOD 9604",
    category: "Fat metabolism",
    whatItAddresses: "Obesity adjunct therapy",
    summary:
      "A fragment of growth hormone that supports fat metabolism and body composition. Used as an adjunct for weight and metabolic goals in adults 30+.",
    idealDemographics: "Aged 30+ both sexes",
    deliveryMethod: "SC injection",
    pricing: "$300–500",
    notes: "1–2 months",
    duration: "3 months",
    matchKeywords: ["fat", "metabolism", "obesity", "weight"],
    minAge: 30,
  },
  {
    id: "cartalax",
    name: "Cartalax",
    category: "Osteoarthritis",
    whatItAddresses: "Cartilage repair",
    summary:
      "Supports cartilage repair and joint health. Used for osteoarthritis and joint wear in adults 50+.",
    idealDemographics: "Aged 50+",
    deliveryMethod: "SC injection",
    pricing: "$350–500",
    notes: "5–10 weeks",
    duration: "3 months",
    matchKeywords: ["joint", "cartilage", "osteoarthritis"],
    minAge: 50,
  },
];

/**
 * For Wellnest (regulatory): display names by indication only, no compound names.
 * Same keys as WELLNESS_TREATMENTS id; used when practice === "wellnest".
 */
export const WELLNEST_DISPLAY_NAMES: Record<string, string> = {
  "bpc-157": "Injury recovery and gut health",
  "tb-500": "Muscle recovery and mobility",
  "cjc-1295": "Energy and metabolic optimization",
  "ipamorelin": "Sleep and muscle support",
  "semax": "Focus and cognitive support",
  "selank": "Stress and mood support",
  "p21": "Memory and cognitive support",
  "pinealon": "Brain health and cognitive support",
  "ghrp-2-6": "Recovery and body composition",
  "igf-1-lr3": "Muscle growth support",
  "ghk-cu": "Skin firmness and elasticity",
  "melanotan-2": "Tanning support",
  "mk-677": "Bone and joint health",
  "sermorelin": "Anti-aging and recovery",
  "tessamorelin": "Visceral fat and weight support",
  "epitalon": "Cellular aging and metabolism",
  "aod-9604": "Fat metabolism and weight support",
  "cartalax": "Cartilage and joint support",
};

/** First-person patient story (headline + story) for results UI. No peptide names; story-like and engaging. */
const WELLNESS_PATIENT_STORIES: Record<
  string,
  { headline: string; story: string }
> = {
  "bpc-157": {
    headline: "I was tired of my gut and joints holding me back",
    story:
      "I was noticing as I got older it was taking longer to recover from workouts, and my gut wasn't what it used to be. I wanted to feel strong again without the aches and the bloating—something that could support my body from the inside out.",
  },
  "tb-500": {
    headline: "I wanted to get back to moving without the nagging pain",
    story:
      "After years of being active, I started to feel like my body was working against me. Every tweak took forever to heal. I was looking for something that could help me recover faster and get back to the activities I love.",
  },
  "cjc-1295": {
    headline: "My energy and metabolism weren't what they used to be",
    story:
      "I was noticing as I got older it was taking longer to recover from workouts and my metabolism wasn't what it used to be. I wanted to feel strong again—more energy, better recovery, and a body that felt like it was on my side.",
  },
  ipamorelin: {
    headline: "I wanted better sleep and to feel like myself again",
    story:
      "Sleep had become a struggle, and I could tell it was affecting everything—my mood, my recovery, my waistline. I was looking for something that could help me sleep better and support my body without harsh side effects.",
  },
  semax: {
    headline: "I was tired of the brain fog and losing my focus",
    story:
      "I used to feel sharp and on top of things. Lately I was forgetting names, losing my train of thought, and feeling like I was running in fog. I wanted to feel clear and focused again.",
  },
  selank: {
    headline: "Stress was running my life and I wanted my calm back",
    story:
      "I was always wound up—anxiety and stress were affecting my sleep, my mood, and my ability to enjoy life. I wanted support that could help me feel more balanced and resilient without dulling me down.",
  },
  p21: {
    headline: "I wanted to protect my memory and stay sharp",
    story:
      "As I got older I started to notice little slips—forgetting where I put things, names taking longer to come back. I wanted to do something proactive for my brain and my memory while I still could.",
  },
  pinealon: {
    headline: "I wanted to support my brain health for the long run",
    story:
      "I've seen what cognitive decline can do. I wanted to take care of my brain the way I take care of the rest of my body—something that could support clarity and cognitive health as I age.",
  },
  "ghrp-2-6": {
    headline: "I wanted to recover better and feel stronger",
    story:
      "I was putting in the work but not seeing the results I used to. Recovery felt slow and my body composition was shifting in the wrong direction. I was looking for support that could help me get back to feeling strong and lean.",
  },
  "igf-1-lr3": {
    headline: "I wanted to build and maintain muscle without the struggle",
    story:
      "I'd always been active, but as I got older it felt harder to hold on to muscle and strength. I wanted support that could help me recover, build, and feel like an athlete again—not just get by.",
  },
  "ghk-cu": {
    headline: "I wanted my skin to look as healthy as I felt",
    story:
      "I was taking care of myself on the inside, but my skin was still showing the years—laxity, dullness, and a lack of that bounce it used to have. I wanted something that could support firmness and a more youthful look.",
  },
  "melanotan-2": {
    headline: "I wanted a natural glow without baking in the sun",
    story:
      "I love how I look and feel with a bit of color, but I didn't want to damage my skin or spend hours in the sun. I was looking for a way to get a natural-looking tan and feel good in my skin.",
  },
  "mk-677": {
    headline: "I was worried about my bones and joints as I aged",
    story:
      "I'd seen family members struggle with bone density and joint issues. I wanted to do something early to support my bones and joints so I could stay active and independent for years to come.",
  },
  sermorelin: {
    headline: "I wanted to age well and keep my energy and recovery",
    story:
      "I wasn't trying to turn back the clock—I just wanted to feel like myself. Better recovery, more energy, and skin that didn't look as tired as I sometimes felt. I was looking for something that worked with my body, not against it.",
  },
  tessamorelin: {
    headline: "The weight around my middle wouldn't budge",
    story:
      "I was eating well and moving more, but the stubborn fat around my belly wasn't shifting. I wanted support that could target that area and help my metabolism work with me, not against me.",
  },
  epitalon: {
    headline: "I wanted to support how I age from the inside out",
    story:
      "I was thinking long-term—cellular health, metabolism, and feeling vibrant as I get older. I wanted something that could support my body's natural processes and help me age well.",
  },
  "aod-9604": {
    headline: "I was done fighting my metabolism alone",
    story:
      "I'd tried everything for my weight and body composition. My metabolism felt like it had a mind of its own. I was looking for support that could help with fat metabolism and finally work with my body.",
  },
  cartalax: {
    headline: "I wanted to protect my joints and stay mobile",
    story:
      "My knees and joints were starting to remind me of every workout and every year. I wanted to support my cartilage and joint health so I could keep moving without the constant ache.",
  },
};

/** Display name for a treatment when practice is Wellnest (indication-only; no compound names). */
export function getWellnessTreatmentDisplayNameForWellnest(treatmentId: string): string | undefined {
  return WELLNEST_DISPLAY_NAMES[treatmentId];
}

/** Quiz questions: goals and age to suggest treatments. */
export const WELLNESS_QUIZ: WellnessQuizData = {
  treatments: WELLNESS_TREATMENTS,
  questions: [
    {
      id: "age",
      title: "Age range",
      question: "What is your age range?",
      answers: [
        { label: "Under 30", scores: {} },
        {
          label: "30–39",
          scores: {
            "bpc-157": 1,
            "tb-500": 1,
            "cjc-1295": 1,
            "semax": 1,
            "selank": 1,
            "melanotan-2": 1,
            "aod-9604": 1,
          },
        },
        {
          label: "40–49",
          scores: {
            "bpc-157": 1,
            "tb-500": 1,
            "cjc-1295": 1,
            "ipamorelin": 1,
            "semax": 1,
            "selank": 1,
            "ghk-cu": 1,
            "sermorelin": 1,
            "tessamorelin": 1,
            "epitalon": 1,
            "aod-9604": 1,
          },
        },
        {
          label: "50–59",
          scores: {
            "bpc-157": 1,
            "tb-500": 1,
            "cjc-1295": 1,
            "ipamorelin": 1,
            "semax": 1,
            "selank": 1,
            "ghrp-2-6": 1,
            "igf-1-lr3": 1,
            "ghk-cu": 1,
            "sermorelin": 1,
            "tessamorelin": 1,
            "epitalon": 1,
            "aod-9604": 1,
            "cartalax": 1,
          },
        },
        {
          label: "60+",
          scores: {
            "bpc-157": 1,
            "tb-500": 1,
            "cjc-1295": 1,
            "ipamorelin": 1,
            "semax": 1,
            "selank": 1,
            "p21": 2,
            "pinealon": 2,
            "ghrp-2-6": 1,
            "igf-1-lr3": 1,
            "ghk-cu": 1,
            "mk-677": 1,
            "sermorelin": 1,
            "tessamorelin": 1,
            "epitalon": 1,
            "cartalax": 1,
          },
        },
      ],
    },
    {
      id: "activity",
      title: "Activity level",
      question: "How would you describe your physical activity level?",
      answers: [
        { label: "Mostly sedentary or light activity", scores: {} },
        {
          label: "Moderately active (exercise a few times a week)",
          scores: { "bpc-157": 1, "tb-500": 1 },
        },
        {
          label: "Very active / athletic (frequent intense or contact sports, heavy training)",
          scores: { "bpc-157": 2, "tb-500": 2 },
        },
      ],
    },
    {
      id: "bodyComposition",
      title: "Body composition",
      question: "What best describes your body-composition goal?",
      answers: [
        { label: "No specific goal / general wellness", scores: {} },
        {
          label: "Weight or overall fat loss",
          scores: { "aod-9604": 2, tessamorelin: 1, "cjc-1295": 1 } as Record<string, number>,
        },
        {
          label: "Belly or midsection (visceral) fat",
          scores: { tessamorelin: 2, "aod-9604": 1 } as Record<string, number>,
        },
        {
          label: "Building or maintaining muscle",
          scores: {
            "cjc-1295": 2,
            ipamorelin: 2,
            "ghrp-2-6": 2,
            "igf-1-lr3": 2,
          },
        },
      ],
    },
    {
      id: "skinInterest",
      title: "Skin & appearance",
      question: "Are you interested in peptide options for skin or appearance?",
      answers: [
        { label: "No / not a priority", scores: {} },
        {
          label: "Yes – skin firmness, elasticity, or anti-aging",
          scores: { "ghk-cu": 2, sermorelin: 1 } as Record<string, number>,
        },
        {
          label: "Yes – tanning or skin tone",
          scores: { "melanotan-2": 2 },
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions",
      question: "Do any of these apply? (Select all that apply)",
      answers: [
        {
          label: "GI or gut issues",
          scores: { "bpc-157": 2 },
        },
        {
          label: "Inflammation or tendon/ligament issues",
          scores: { "bpc-157": 2, "tb-500": 2 },
        },
        {
          label: "Osteoporosis or bone density concerns",
          scores: { "mk-677": 2 },
        },
        {
          label: "Osteoarthritis or cartilage wear",
          scores: { "mk-677": 1, cartalax: 2 } as Record<string, number>,
        },
        {
          label: "None of these",
          scores: {},
        },
      ],
    },
  ],
};

/** Get treatment by id. */
export function getWellnessTreatmentById(id: string): WellnessTreatment | undefined {
  return WELLNESS_TREATMENTS.find((t) => t.id === id);
}

/**
 * Return human-readable reasons why this treatment was suggested (which quiz answers contributed).
 * Used to show "How this matches your answers" in the client detail wellness section.
 */
export function getWellnessQuizMatchReasons(
  answers: Record<string, number | number[]>,
  treatmentId: string
): string[] {
  const reasons: string[] = [];
  for (const q of WELLNESS_QUIZ.questions) {
    const raw = answers[q.id];
    const indices = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
    const labels: string[] = [];
    for (const idx of indices) {
      if (typeof idx !== "number" || idx < 0 || idx >= q.answers.length) continue;
      const answer = q.answers[idx];
      const score = answer.scores[treatmentId];
      if (score != null && score > 0) labels.push(answer.label);
    }
    if (labels.length > 0) reasons.push(`${q.title}: ${labels.join(", ")}`);
  }
  return reasons;
}

/**
 * Compute suggested treatment IDs from quiz answers.
 * Multi-select: each question can have multiple answers (stored as array of answer indices).
 * We sum scores per treatment, filter by age (minAge), and return treatments with score >= threshold.
 */
export function computeWellnessQuizResult(answersByQuestionId: Record<string, number | number[]>): string[] {
  const treatmentScores: Record<string, number> = {};
  const ageAnswer = answersByQuestionId["age"];
  const ageIndex = Array.isArray(ageAnswer) ? ageAnswer[0] : ageAnswer;
  const ageQuestion = WELLNESS_QUIZ.questions.find((q) => q.id === "age");
  const ageLabel =
    typeof ageIndex === "number" &&
    ageQuestion &&
    ageIndex >= 0 &&
    ageIndex < ageQuestion.answers.length
      ? ageQuestion.answers[ageIndex].label
      : "";
  const ageNum = ageLabel.includes("60+")
    ? 60
    : ageLabel.includes("50")
      ? 50
      : ageLabel.includes("40")
        ? 40
        : ageLabel.includes("30")
          ? 30
          : 0;

  for (const q of WELLNESS_QUIZ.questions) {
    const raw = answersByQuestionId[q.id];
    const indices = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
    for (const idx of indices) {
      if (typeof idx !== "number" || idx < 0 || idx >= q.answers.length) continue;
      const answer = q.answers[idx];
      for (const [tid, weight] of Object.entries(answer.scores)) {
        const w = weight ?? 0;
        treatmentScores[tid] = (treatmentScores[tid] ?? 0) + w;
      }
    }
  }

  const threshold = 1;
  const suggested = WELLNESS_TREATMENTS.filter((t) => {
    const score = treatmentScores[t.id] ?? 0;
    if (score < threshold) return false;
    if (t.minAge != null && ageNum > 0 && ageNum < t.minAge) return false;
    return true;
  });

  return suggested.map((t) => t.id);
}

/** Build payload to store in Airtable (e.g. "Wellness Quiz" long text). */
export function buildWellnessQuizPayload(answersByQuestionId: Record<string, number | number[]>): {
  version: 1;
  completedAt: string;
  answers: Record<string, number | number[]>;
  suggestedTreatmentIds: string[];
} {
  const suggestedTreatmentIds = computeWellnessQuizResult(answersByQuestionId);
  return {
    version: 1,
    completedAt: new Date().toISOString(),
    answers: { ...answersByQuestionId },
    suggestedTreatmentIds,
  };
}

/** Resolve full treatment objects from stored quiz payload (for display). */
export function getSuggestedWellnessTreatments(quiz: { suggestedTreatmentIds: string[] }): WellnessTreatment[] {
  return quiz.suggestedTreatmentIds
    .map((id) => getWellnessTreatmentById(id))
    .filter((t): t is WellnessTreatment => t != null);
}

/**
 * Build an SMS-friendly message with wellness quiz results and recommended peptides.
 * Used when sending results to the client via SMS from the client details page.
 * @param useWellnestDisplayNames - When true (e.g. for Wellnest practice), use indication-only names, no compound names.
 */
export function getWellnessQuizResultsSMSMessage(
  quiz: { suggestedTreatmentIds: string[] },
  options?: { useWellnestDisplayNames?: boolean }
): string {
  const treatments = getSuggestedWellnessTreatments(quiz);
  if (treatments.length === 0) {
    return "Your wellness quiz results are ready. No specific peptides were suggested this time—consider discussing your goals with your provider.";
  }
  const useWellnest = options?.useWellnestDisplayNames ?? false;
  const intro = "Your wellness quiz results. We suggest discussing these with your provider:\n\n";
  const lines = treatments.map((t) => {
    const displayName = useWellnest ? (WELLNEST_DISPLAY_NAMES[t.id] ?? t.name) : t.name;
    const summary = t.summary ?? t.whatItAddresses;
    const short = summary.length > 80 ? summary.slice(0, 77) + "..." : summary;
    return `• ${displayName}: ${short}`;
  });
  return intro + lines.join("\n\n");
}

export const WELLNESS_QUIZ_FIELD_NAME = "Wellness Quiz";

/** Wellnest case images (paths under /wellnest/). 5 photos each for muscle, weight, skincare; 7 muscle. */
export const WELLNEST_CASE_IMAGES: Record<string, string> = {
  /* Muscle and recovery (7) */
  muscle1: "/wellnest/Eric-Ouollette-1-1.webp",
  muscle2: "/wellnest/Picture1%20(1).jpg",
  muscle3: "/wellnest/fat-loss-peptide-before-after-expectations.webp",
  muscle4: "/wellnest/1d6453db5e11678e3a567a8e03151c3e.jpg",
  muscle5: "/wellnest/peptide-bna-2-edit.webp",
  muscle6: "/wellnest/Before+After+23-640w.webp",
  muscle7: "/wellnest/images.jpeg",
  /* Bone and joint (2) */
  bone1: "/wellnest/images.jpeg",
  bone2: "/wellnest/images%20(2).jpeg",
  /* Weight and metabolism (5) */
  weight1: "/wellnest/Weight-Loss-Injections-tirzepatide-peptides-scottsdale-az.webp",
  weight2: "/wellnest/images%20(2).jpeg",
  weight3: "/wellnest/peptide-bna-2-edit.webp",
  weight4: "/wellnest/Before+After+23-640w.webp",
  weight5: "/wellnest/images.jpeg",
  /* Skin / skincare (5) */
  skin1: "/wellnest/02_BA.jpg",
  skin2: "/wellnest/20240924_liquid_peptides_advanced_mp_pdp_asset4_v03.webp",
  skin3: "/wellnest/71Zck-8VLgL._AC_UF350,350_QL80_.jpg",
  skin4: "/wellnest/Col-ss1-BreeA-en.webp",
  skin5: "/wellnest/02_BA.jpg",
  /* Brain/mood reuses skin imagery (4) */
  brain1: "/wellnest/02_BA.jpg",
  brain2: "/wellnest/20240924_liquid_peptides_advanced_mp_pdp_asset4_v03.webp",
  brain3: "/wellnest/71Zck-8VLgL._AC_UF350,350_QL80_.jpg",
  brain4: "/wellnest/Col-ss1-BreeA-en.webp",
  /* Video-only cases – thumbnails pulled from YouTube */
  "video-anxiety": "https://img.youtube.com/vi/2L7X4l6a7d4/hqdefault.jpg",
  "video-muscle": "https://img.youtube.com/vi/qLTa9wy6dIM/hqdefault.jpg",
  "video-weight": "https://img.youtube.com/vi/6G7dvDkHWjE/hqdefault.jpg",
};

/** Optional video URL per image key (case detail shows video with play button). Supports /wellnest/ paths or YouTube URLs. */
export const WELLNEST_CASE_VIDEOS: Partial<Record<string, string>> = {
  "video-anxiety": "https://www.youtube.com/shorts/2L7X4l6a7d4",
  "video-muscle": "https://www.youtube.com/shorts/qLTa9wy6dIM",
  "video-weight": "https://www.youtube.com/shorts/6G7dvDkHWjE",
};

/** Extra photo-only cases: fill out to 5 cases each for weight and skincare; 7 for muscle; plus video cases. */
const WELLNEST_EXTRA_CASES: Array<{
  categoryId: string;
  imageKey: string;
  headline: string;
  story: string;
}> = [
  /* Video cases (YouTube Shorts) – clearly shown as videos in case detail */
  {
    categoryId: "brain-mood",
    imageKey: "video-anxiety",
    headline: "How I finally took control of my anxiety",
    story:
      "I wanted support that could help with stress and mood without leaving me foggy. I was looking for something that could help me feel calmer and more like myself so I could show up for the people and things I care about.",
  },
  {
    categoryId: "muscle-recovery",
    imageKey: "video-muscle",
    headline: "Understanding peptides: the key to muscle growth",
    story:
      "I was putting in the work but not seeing the results I used to. I wanted support for muscle growth and recovery so I could feel strong again and keep doing what I love.",
  },
  {
    categoryId: "weight-metabolism",
    imageKey: "video-weight",
    headline: "What is a weight loss peptide?",
    story:
      "I was done struggling with stubborn weight and a metabolism that didn't keep up. I wanted support that could help with fat loss and energy so I could feel good in my body again.",
  },
  /* Muscle and recovery: 6 treatments + 1 extra = 7 cases */
  {
    categoryId: "muscle-recovery",
    imageKey: "muscle7",
    headline: "I wanted to recover faster and get back to what I love",
    story:
      "I was tired of every tweak and strain taking forever to heal. I wanted support that could help my body recover so I could stay active and keep doing the things that matter to me.",
  },
  /* Weight: 2 treatments + 3 extra = 5 cases */
  {
    categoryId: "weight-metabolism",
    imageKey: "weight3",
    headline: "I was done fighting my metabolism alone",
    story:
      "I'd tried everything for my weight and body composition. My metabolism felt like it had a mind of its own. I was looking for support that could help with fat metabolism and finally work with my body.",
  },
  {
    categoryId: "weight-metabolism",
    imageKey: "weight4",
    headline: "I wanted to feel strong and lean again",
    story:
      "After years of ups and downs, I wanted a sustainable approach to how I looked and felt. I was ready for something that could support my body composition and energy without the roller coaster.",
  },
  {
    categoryId: "weight-metabolism",
    imageKey: "weight5",
    headline: "I wanted my body to work with me, not against me",
    story:
      "I was tired of feeling like my weight was out of my control. I wanted support that could help with stubborn fat and metabolism so I could feel like myself again.",
  },
  /* Skincare: 4 treatments + 1 extra = 5 cases */
  {
    categoryId: "skin-anti-aging",
    imageKey: "skin5",
    headline: "I wanted to take care of my skin from the inside out",
    story:
      "I was noticing more lines and uneven tone than I wanted. I was looking for something that could support my skin's natural repair and help me feel confident without the heavy routines.",
  },
];

/** Treatment id → image key. 7 muscle, 5 weight, 5 skincare. */
const WELLNESS_TREATMENT_IMAGE: Partial<Record<string, string>> = {
  /* Muscle and recovery: 6 treatments, 7 photos (1 extra case) */
  "bpc-157": "muscle1",
  "tb-500": "muscle2",
  "cjc-1295": "muscle3",
  ipamorelin: "muscle4",
  "ghrp-2-6": "muscle5",
  "igf-1-lr3": "muscle6",
  /* Bone and joint: 2 */
  "mk-677": "bone1",
  cartalax: "bone2",
  /* Weight: 2 treatments; 3 extra cases → 5 total */
  tessamorelin: "weight1",
  "aod-9604": "weight2",
  /* Skin and anti-aging: 4 treatments; 1 extra case → 5 total */
  "ghk-cu": "skin1",
  "melanotan-2": "skin2",
  sermorelin: "skin3",
  epitalon: "skin4",
  /* Brain and mood: 4 */
  semax: "brain1",
  selank: "brain2",
  p21: "brain3",
  pinealon: "brain4",
};

/** Broad category id → display name (fewer categories, 2+ cases each). Use "and" not "&" so it never renders as &amp;. */
const WELLNESS_BROAD_CATEGORIES: Record<string, string> = {
  "muscle-recovery": "Muscle and recovery",
  "skin-anti-aging": "Skin and anti-aging",
  "weight-metabolism": "Weight and metabolism",
  "brain-mood": "Brain and mood",
  "bone-joint": "Bone and joint",
};

/** Treatment id → broad category id. */
const WELLNESS_TREATMENT_TO_BROAD_CATEGORY: Partial<Record<string, string>> = {
  "bpc-157": "muscle-recovery",
  "tb-500": "muscle-recovery",
  "cjc-1295": "muscle-recovery",
  ipamorelin: "muscle-recovery",
  "ghrp-2-6": "muscle-recovery",
  "igf-1-lr3": "muscle-recovery",
  "ghk-cu": "skin-anti-aging",
  "melanotan-2": "skin-anti-aging",
  sermorelin: "skin-anti-aging",
  epitalon: "skin-anti-aging",
  tessamorelin: "weight-metabolism",
  "aod-9604": "weight-metabolism",
  semax: "brain-mood",
  selank: "brain-mood",
  p21: "brain-mood",
  pinealon: "brain-mood",
  "mk-677": "bone-joint",
  cartalax: "bone-joint",
};

/**
 * Build categories and CaseItem[] from suggested wellness treatments for results UI.
 * Groups by broad category (so 2+ cases per category); assigns provided images or icon.
 */
export function buildWellnessCategoriesAndCases(
  treatments: WellnessTreatment[],
  placeholderImage: string,
  useWellnestDisplayNames: boolean
): { categories: { id: string; name: string; cases: CaseItem[] }[]; allCases: CaseItem[] } {
  const allCases: CaseItem[] = [];
  const byCategory = new Map<string, { name: string; cases: CaseItem[] }>();

  for (const t of treatments) {
    const patientStory = useWellnestDisplayNames ? WELLNESS_PATIENT_STORIES[t.id] : null;
    const displayName = useWellnestDisplayNames
      ? (patientStory?.headline ?? WELLNEST_DISPLAY_NAMES[t.id] ?? t.name)
      : t.name;
    const story = useWellnestDisplayNames && patientStory?.story
      ? patientStory.story
      : (t.summary ?? t.whatItAddresses) + (t.idealDemographics ? `\n\nIdeal: ${t.idealDemographics}` : "");
    const treatmentDetail = [t.deliveryMethod, t.duration].filter(Boolean).join(", ");
    const imageKey = WELLNESS_TREATMENT_IMAGE[t.id];
    const imageUrl = imageKey ? WELLNEST_CASE_IMAGES[imageKey] : placeholderImage;

    const videoUrl = imageKey ? WELLNEST_CASE_VIDEOS[imageKey] : undefined;
    const caseItem: CaseItem = {
      id: `wellness-${t.id}`,
      name: displayName,
      headline: displayName,
      story,
      beforeAfter: imageUrl,
      thumbnail: imageUrl,
      treatment: treatmentDetail + (t.notes ? ` ${t.notes}` : ""),
      ...(videoUrl && { videoUrl }),
    };
    allCases.push(caseItem);

    const catId = WELLNESS_TREATMENT_TO_BROAD_CATEGORY[t.id] ?? "general-wellness";
    const catName = WELLNESS_BROAD_CATEGORIES[catId] ?? "General wellness";
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { name: catName, cases: [] });
    }
    byCategory.get(catId)!.cases.push(caseItem);
  }

  /* --- Video cases: always shown, placed FIRST in their category --- */
  const videoCases = WELLNEST_EXTRA_CASES.filter((e) => !!WELLNEST_CASE_VIDEOS[e.imageKey]);
  for (const vc of videoCases) {
    if (!byCategory.has(vc.categoryId)) {
      byCategory.set(vc.categoryId, {
        name: WELLNESS_BROAD_CATEGORIES[vc.categoryId] ?? vc.categoryId,
        cases: [],
      });
    }
    const imageUrl = WELLNEST_CASE_IMAGES[vc.imageKey];
    if (!imageUrl) continue;
    const caseItem: CaseItem = {
      id: `wellness-extra-${vc.categoryId}-${vc.imageKey}`,
      name: vc.headline,
      headline: vc.headline,
      story: vc.story,
      beforeAfter: imageUrl,
      thumbnail: imageUrl,
      treatment: "Discuss with your provider.",
      videoUrl: WELLNEST_CASE_VIDEOS[vc.imageKey],
    };
    allCases.push(caseItem);
    byCategory.get(vc.categoryId)!.cases.unshift(caseItem);
  }

  /* --- Non-video extra cases (photo-only): only when category already exists --- */
  const photoExtras = WELLNEST_EXTRA_CASES.filter((e) => !WELLNEST_CASE_VIDEOS[e.imageKey]);
  for (const extra of photoExtras) {
    if (!byCategory.has(extra.categoryId)) continue;
    const imageUrl = WELLNEST_CASE_IMAGES[extra.imageKey];
    if (!imageUrl) continue;
    const caseItem: CaseItem = {
      id: `wellness-extra-${extra.categoryId}-${extra.imageKey}`,
      name: extra.headline,
      headline: extra.headline,
      story: extra.story,
      beforeAfter: imageUrl,
      thumbnail: imageUrl,
      treatment: "Discuss with your provider.",
    };
    allCases.push(caseItem);
    byCategory.get(extra.categoryId)!.cases.push(caseItem);
  }

  /* Brain and mood: show only the video case for now (no photo/treatment cases). */
  const brainEntry = byCategory.get("brain-mood");
  if (brainEntry) {
    brainEntry.cases = brainEntry.cases.filter((c) => c.videoUrl);
  }

  const categories = Array.from(byCategory.entries()).map(([id, { name, cases }]) => ({
    id,
    name,
    cases,
  }));

  return { categories, allCases };
}

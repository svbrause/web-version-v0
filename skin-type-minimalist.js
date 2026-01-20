// Debug: Log script loading
console.log("skin-type-minimalist.js loading...");

// Case Data - will be loaded from main app or Airtable
let caseData = [];

// Try to get caseData from window (if main app already loaded it)
if (
  typeof window !== "undefined" &&
  window.caseData &&
  Array.isArray(window.caseData)
) {
  caseData = window.caseData;
  console.log(`Loaded ${caseData.length} cases from window.caseData`);
}

// Skin Type Data
const skinTypeData = {
  dry: {
    title: "Dry",
    description:
      "Skin that lacks sufficient moisture and natural oils. It may feel tight, especially after cleansing, and can appear flaky or have a rough texture. Dry skin often shows fine lines more prominently and may have a dull appearance.",
    characteristics: [
      "Requires frequent moisturizing",
      "Visible fine lines",
      "Rough, uneven texture",
      "Dull appearance",
      "Flaky and tight",
    ],
  },
  balanced: {
    title: "Balanced",
    description:
      "Skin that has a good balance of moisture and oil. It feels comfortable, not too oily or too dry, and typically has an even texture and tone. Balanced skin usually has minimal visible pores and good elasticity.",
    characteristics: [
      "Even skin texture and tone",
      "Not too oily nor too dry",
      "Blemish free",
      "Minimal visible pores",
      "Good elasticity",
    ],
  },
  oily: {
    title: "Oily",
    description:
      "Skin that produces excess sebum, giving it a shiny or greasy appearance, especially in the T-zone (forehead, nose, and chin). Oily skin often has enlarged pores and may be prone to blackheads and breakouts.",
    characteristics: [
      "Greasy appearance/texture",
      "Good tone",
      "Persistent Shine",
      "Prone to blackheads",
      "Prone to breakouts",
      "Enlarged pores",
    ],
  },
  combination: {
    title: "Combination",
    description:
      "Both oily and dry areas on the face. The T-zone, which includes the forehead, nose, and chin, tends to be oilier, while the cheeks and other areas may be drier.",
    characteristics: [
      "Oily and dry areas",
      "Dry, tight cheeks",
      "Oilier T-zone (forehead, nose, chin)",
      "Enlarged Pores and breakouts in T-zone",
    ],
  },
};

// Questions for "Not Sure" flow
const notSureQuestions = [
  {
    question: "How does your skin feel after cleansing?",
    subtitle: "Let's figure out your skin type!",
    options: [
      "It feels oily and/or shiny all over",
      "Shiny/oily in the T-zone (nose and forehead), dry/dull elsewhere",
      "Comfortable and balanced, no excessive oiliness or dryness",
      "It feels tight, dry, or flaky",
      "I'm not sure",
    ],
  },
  {
    question: "Which of these best describes your skin?",
    subtitle: "Just a few more details to find your skin type.",
    options: [
      "Enlarged pores, especially on the T-zone",
      "Dull complexion, rough texture",
      "Occasional breakouts but generally clear",
      "Oily T-zone with dry cheeks",
      "None of these describe my skin",
    ],
  },
];

// Form steps
const FORM_STEPS = [
  "concerns",
  "areas",
  "age",
  "skinType",
  "skinTone",
  "ethnicBackground",
];
const REQUIRED_STEPS = ["concerns", "areas", "age", "skinType", "skinTone"];
const OPTIONAL_STEPS = ["ethnicBackground"];

// High-level concerns data (with mapping keywords for case matching)
const HIGH_LEVEL_CONCERNS = [
  {
    id: "facial-balancing",
    name: "Facial Balancing",
    description: "Harmonize facial features and proportions",
    mapsToPhotos: [
      "facial-balancing",
      "facial-harmony",
      "proportions",
      "symmetry",
      "brow-asymmetry",
      "asymmetry",
      "balance",
    ],
    mapsToSpecificIssues: [
      "facial-asymmetry",
      "proportions",
      "harmony",
      "balance",
      "brow-asymmetry",
      "asymmetric-lips",
      "asymmetric-chin",
      "asymmetric-jawline",
    ],
  },
  {
    id: "smooth-wrinkles-lines",
    name: "Smooth Wrinkles & Lines",
    description: "Reduce fine lines and wrinkles around your face",
    mapsToPhotos: [
      "smoothen-wrinkles",
      "neurotoxin",
      "botox",
      "wrinkle-reduction",
      "wrinkles",
      "lines",
      "smooth",
    ],
    mapsToSpecificIssues: [
      "11s",
      "forehead-lines",
      "glabella",
      "crow-feet",
      "lip-lines",
      "frown-lines",
      "under-eye-wrinkles",
      "neck-lines",
    ],
  },
  {
    id: "restore-volume-definition",
    name: "Restore Volume & Definition",
    description: "Add fullness and structure to your face",
    mapsToPhotos: [
      "restore-volume",
      "fillers",
      "volume-restoration",
      "sculptra",
      "define-jawline",
      "enhance-jawline",
      "volume",
      "hollow",
    ],
    mapsToSpecificIssues: [
      "hollow-cheeks",
      "under-eye-hollows",
      "thin-lips",
      "weak-chin",
      "volume-loss",
      "ill-defined-jawline",
    ],
  },
  {
    id: "improve-skin-texture-tone",
    name: "Improve Skin Texture & Tone",
    description: "Even out skin, reduce pores, improve clarity",
    mapsToPhotos: [
      "improve-skin-texture",
      "chemical-peel",
      "microneedling",
      "skin-texture",
      "skin-laxity",
      "tighten-skin",
    ],
    mapsToSpecificIssues: [
      "large-pores",
      "uneven-texture",
      "dull-skin",
      "rough-skin",
      "skin-laxity",
      "scars",
    ],
  },
  {
    id: "reduce-dark-spots-discoloration",
    name: "Reduce Dark Spots & Discoloration",
    description: "Fade hyperpigmentation, age spots, and sun damage",
    mapsToPhotos: ["reduce-dark-spots", "ipl", "laser", "pigmentation"],
    mapsToSpecificIssues: [
      "age-spots",
      "sun-damage",
      "hyperpigmentation",
      "melasma",
      "dark-spots",
    ],
  },
  {
    id: "clear-acne-minimize-pores",
    name: "Clear Acne & Minimize Pores",
    description: "Treat active acne and reduce scarring",
    mapsToPhotos: ["acne-treatment", "clear-acne", "pore-minimizing"],
    mapsToSpecificIssues: [
      "acne",
      "acne-scarring",
      "large-pores",
      "clogged-pores",
    ],
  },
  {
    id: "eyelid-eye-area-concerns",
    name: "Eyelid & Eye Area Concerns",
    description:
      "Address drooping eyelids, excess skin, bags, and dark circles",
    mapsToPhotos: [
      "eyelid",
      "eyelids",
      "upper-eyelid",
      "lower-eyelid",
      "blepharoplasty",
      "eye-droop",
      "eye-bags",
      "under-eye",
      "dark-circles",
    ],
    mapsToSpecificIssues: [
      "upper-eyelid-droop",
      "lower-eyelid-excess-skin",
      "excess-upper-eyelid-skin",
      "lower-eyelid-bags",
      "under-eye-dark-circles",
    ],
  },
  {
    id: "body-contouring-fat-reduction",
    name: "Body Contouring & Fat Reduction",
    description: "Shape and contour your body",
    mapsToPhotos: ["body-contouring", "fat-reduction", "coolsculpting"],
    mapsToSpecificIssues: [
      "stubborn-fat",
      "love-handles",
      "double-chin",
      "excess-fat",
    ],
  },
  {
    id: "unwanted-hair-removal",
    name: "Unwanted Hair Removal",
    description: "Remove hair from face or body",
    mapsToPhotos: ["hair-removal", "laser-hair-removal", "ipl-hair"],
    mapsToSpecificIssues: ["unwanted-hair", "facial-hair", "body-hair"],
  },
  {
    id: "wellness-longevity",
    name: "Wellness & Longevity",
    description: "Hormone balance, energy, and vitality",
    mapsToPhotos: ["wellness", "longevity", "hormone-therapy"],
    mapsToSpecificIssues: [
      "hormone-imbalance",
      "energy",
      "vitality",
      "longevity",
    ],
  },
];

// Areas of concern data
const AREAS_OF_CONCERN = [
  { id: "forehead", name: "Forehead" },
  { id: "eyes", name: "Eyes" },
  { id: "cheeks", name: "Cheeks" },
  { id: "nose", name: "Nose" },
  { id: "mouth-lips", name: "Mouth & Lips" },
  { id: "jawline", name: "Jawline" },
  { id: "chin", name: "Chin" },
  { id: "neck", name: "Neck" },
  { id: "chest", name: "Chest" },
  { id: "hands", name: "Hands" },
  { id: "arms", name: "Arms" },
  { id: "body", name: "Body" },
];

// State Management
let currentState = {
  currentStep: 0, // Index in FORM_STEPS
  selectedConcerns: [], // Max 3
  selectedAreas: [], // Max 3
  ageRange: null, // Changed from age to ageRange
  skinType: null,
  skinTone: null,
  ethnicBackground: null,
  // For "not sure" flow
  inNotSureFlow: false,
  notSureQuestionIndex: 0,
  notSureAnswers: [],
};

// DOM Elements
let concernsView,
  areasView,
  ageView,
  skinTypeView,
  skinToneView,
  ethnicBackgroundView,
  questionsView;
let characteristicsContainer, nextButton, backButton, progressFill;
let concernsGrid, areasGrid, concernsCount, areasCount;

// Initialize DOM elements after page loads
function initDOMElements() {
  concernsView = document.getElementById("concernsView");
  areasView = document.getElementById("areasView");
  ageView = document.getElementById("ageView");
  skinTypeView = document.getElementById("skinTypeView");
  skinToneView = document.getElementById("skinToneView");
  ethnicBackgroundView = document.getElementById("ethnicBackgroundView");
  questionsView = document.getElementById("questionsView");
  characteristicsContainer = document.getElementById(
    "characteristicsContainer"
  );
  nextButton = document.getElementById("nextButton");
  backButton = document.getElementById("backButton");
  progressFill = document.getElementById("progressFill");
  concernsGrid = document.getElementById("concernsGrid");
  areasGrid = document.getElementById("areasGrid");
  concernsCount = document.getElementById("concernsCount");
  areasCount = document.getElementById("areasCount");
}

// Initialize
function init() {
  initDOMElements();
  setupEventListeners();
  if (characteristicsContainer) {
    characteristicsContainer.style.display = "none";
  }

  // CRITICAL: Ensure results screen is in the correct parent (main-content)
  const resultsScreen = document.getElementById("resultsScreen");
  const mainContent = document.querySelector(".main-content");
  if (
    resultsScreen &&
    mainContent &&
    resultsScreen.parentElement !== mainContent
  ) {
    console.log("Moving results screen to main-content on init");
    mainContent.appendChild(resultsScreen);
  }

  // Try to restore state from sessionStorage
  if (typeof sessionStorage !== "undefined") {
    try {
      const storedConcerns = sessionStorage.getItem("selectedConcerns");
      if (storedConcerns) {
        const parsed = JSON.parse(storedConcerns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedConcerns = parsed;
          console.log("Restored concerns from sessionStorage:", parsed);
        }
      }
      const storedAreas = sessionStorage.getItem("selectedAreas");
      if (storedAreas) {
        const parsed = JSON.parse(storedAreas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedAreas = parsed;
        }
      }
      const storedAge = sessionStorage.getItem("ageRange");
      if (storedAge) {
        currentState.ageRange = storedAge;
      }
      const storedSkinType = sessionStorage.getItem("skinType");
      if (storedSkinType) {
        currentState.skinType = storedSkinType;
      }
      const storedSkinTone = sessionStorage.getItem("skinTone");
      if (storedSkinTone) {
        currentState.skinTone = storedSkinTone;
      }
    } catch (e) {
      console.error("Error restoring state from sessionStorage:", e);
    }
  }

  // Try to load case data (will check window.caseData first, then Airtable)
  loadCasesFromAirtable();

  renderConcerns();
  renderAreas();
  showStep(0);
  updateProgress();
  updateNextButton();

  // Setup consultation modal close button
  setupConsultationModalCloseButton();
}

// Load cases from Airtable (simplified version)
async function loadCasesFromAirtable() {
  // First try to get from main app's caseData
  if (
    typeof window !== "undefined" &&
    window.caseData &&
    Array.isArray(window.caseData) &&
    window.caseData.length > 0
  ) {
    caseData = window.caseData;
    console.log(
      `Using ${caseData.length} cases from main app's window.caseData`
    );

    // Also try to get CASE_CATEGORY_MAPPING from main app if available
    if (window.CASE_CATEGORY_MAPPING) {
      CASE_CATEGORY_MAPPING = window.CASE_CATEGORY_MAPPING;
      console.log("Loaded CASE_CATEGORY_MAPPING from main app");
    }
    return;
  }

  // Otherwise, try to load from Airtable if config is available
  // Check for Airtable config in window or try to use the same config as main app
  const AIRTABLE_API_KEY =
    typeof window !== "undefined" && window.AIRTABLE_API_KEY
      ? window.AIRTABLE_API_KEY
      : "patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b";
  const AIRTABLE_BASE_ID =
    typeof window !== "undefined" && window.AIRTABLE_BASE_ID
      ? window.AIRTABLE_BASE_ID
      : "appXblSpAMBQskgzB";

  if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    try {
      const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Photos`;
      const response = await fetch(AIRTABLE_API_URL, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map Airtable records to case format (matches main app structure exactly)
        caseData = (data.records || []).map((record) => {
          const fields = record.fields || {};
          const name = fields["Name"] || `Treatment ${record.id}`;

          // Get images - try multiple field name variations (same as main app)
          let beforeAfterField = null;
          const possibleImageFields = [
            "Before After",
            "Before/After",
            "Before After Image",
            "Image",
            "Photo",
            "Photos",
            "Before After Photo",
            "Attachment",
            "Attachments",
            "Picture",
            "Pictures",
          ];

          for (const fieldName of possibleImageFields) {
            const fieldValue = fields[fieldName];
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              beforeAfterField = fieldValue;
              break;
            }
          }

          // If no image found, check all fields for arrays with URL property
          if (!beforeAfterField) {
            Object.keys(fields).forEach((fieldName) => {
              const fieldValue = fields[fieldName];
              if (
                Array.isArray(fieldValue) &&
                fieldValue.length > 0 &&
                fieldValue[0]?.url
              ) {
                beforeAfterField = fieldValue;
              }
            });
          }

          if (!Array.isArray(beforeAfterField)) {
            beforeAfterField = [];
          }

          // Filter out PDFs and get image URLs
          const imageAttachments = beforeAfterField.filter(
            (att) =>
              att.type &&
              att.type.startsWith("image/") &&
              !att.filename?.toLowerCase().endsWith(".pdf")
          );

          const beforeAfter =
            imageAttachments.length > 0 && imageAttachments[0]?.url
              ? imageAttachments[0].url
              : null;
          const thumbnail =
            imageAttachments.length > 0
              ? imageAttachments[0]?.thumbnails?.large?.url ||
                imageAttachments[0]?.thumbnails?.small?.url ||
                imageAttachments[0]?.url
              : beforeAfter;

          // Get patient age - try multiple variations
          const patientAge =
            fields["Age"] ||
            fields["Patient Age"] ||
            fields["Patient's Age"] ||
            fields["Age (years)"] ||
            (fields["Age Range"] ? parseInt(fields["Age Range"]) : null) ||
            null;

          // Get patient name - try multiple variations
          const patientName =
            fields["Patient Name"] ||
            fields["Patient"] ||
            fields["Client Name"] ||
            "Patient";

          // Format patient info
          let patient = patientName;
          if (patientAge) {
            patient = `${patientName}, ${patientAge} years old`;
          } else if (patientName !== "Patient") {
            patient = patientName;
          }

          // Get headline - PRIMARY: "Story Title" (same as main app)
          const headline =
            fields["Story Title"] ||
            fields["Headline"] ||
            fields["Title"] ||
            fields["Case Title"] ||
            fields["Story Headline"] ||
            fields["Treatment Title"] ||
            name;

          // Get story - PRIMARY: "Story Detailed" (same as main app)
          const story =
            fields["Story Detailed"] ||
            fields["Story"] ||
            fields["Description"] ||
            fields["Patient Story"] ||
            fields["Case Story"] ||
            fields["Background"] ||
            fields["Notes"] ||
            "";

          // Get treatment details - PRIMARY: "Treatment Details" (same as main app)
          const treatment =
            fields["Treatment Details"] ||
            fields["Treatment"] ||
            fields["Treatment Description"] ||
            fields["Procedure"] ||
            fields["Treatment Type"] ||
            fields["Method"] ||
            fields["Details"] ||
            fields["Notes"] ||
            "";

          // Get solved issues - try multiple variations
          const solvedField =
            fields["Solved"] ||
            fields["Issues Solved"] ||
            fields["Problems Solved"] ||
            fields["Concerns Addressed"] ||
            fields["Goals Achieved"] ||
            fields["Results"] ||
            fields["Outcomes"] ||
            "";

          let solved = [];
          if (Array.isArray(solvedField)) {
            solved = solvedField;
          } else if (typeof solvedField === "string" && solvedField.trim()) {
            solved = solvedField
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
          }
          if (solved.length === 0) {
            solved = ["Aesthetic improvement"];
          }

          // Get matching criteria - prioritize "Matching" field (same as main app)
          const matchingField = fields["Matching"] || "";
          let matchingCriteria = [];

          if (
            matchingField &&
            typeof matchingField === "string" &&
            matchingField.trim()
          ) {
            matchingCriteria = matchingField
              .split(",")
              .map((c) => c.trim().toLowerCase().replace(/\s+/g, "-"))
              .filter((c) => c.length > 0);
          }

          // Fallback to other matching criteria fields
          if (matchingCriteria.length === 0) {
            const criteriaField =
              fields["Matching Criteria"] ||
              fields["Criteria"] ||
              fields["Tags"] ||
              fields["Keywords"] ||
              fields["Categories"] ||
              fields["Treatment Areas"] ||
              fields["Concerns"] ||
              fields["Goals"] ||
              "";
            if (Array.isArray(criteriaField)) {
              matchingCriteria = criteriaField.map((c) =>
                String(c).trim().toLowerCase().replace(/\s+/g, "-")
              );
            } else if (
              typeof criteriaField === "string" &&
              criteriaField.trim()
            ) {
              matchingCriteria = criteriaField
                .split(",")
                .map((c) => c.trim().toLowerCase().replace(/\s+/g, "-"))
                .filter((c) => c.length > 0);
            }
          }

          // Get direct matching issues from "Matching" field
          const directMatchingIssues =
            matchingField &&
            typeof matchingField === "string" &&
            matchingField.trim()
              ? matchingField
                  .split(",")
                  .map((c) => c.trim().replace(/\s+/g, " "))
                  .filter((c) => c.length > 0)
              : [];

          // Get demographic fields
          const age = fields["Age"] ? parseInt(fields["Age"], 10) : patientAge;
          const skinTone = fields["Skin Tone"] || null;
          const ethnicBackground = fields["Ethnic Background"] || null;
          const skinType = fields["Skin Type"] || null;
          const sunResponse = fields["Sun Response"] || null;

          return {
            id: record.id,
            name: name,
            headline: headline,
            patient: patient,
            patientAge: age,
            story: story,
            treatment: treatment,
            beforeAfter: beforeAfter || thumbnail || null,
            thumbnail: thumbnail || beforeAfter || null,
            solved: solved,
            matchingCriteria: matchingCriteria,
            directMatchingIssues: directMatchingIssues,
            skinTone: skinTone,
            ethnicBackground: ethnicBackground,
            skinType: skinType,
            sunResponse: sunResponse,
          };
        });

        console.log(`Loaded ${caseData.length} cases from Airtable`);
      } else {
        console.warn("Airtable API returned error:", response.status);
      }
    } catch (error) {
      console.warn("Could not load cases from Airtable:", error);
    }
  }
}

// Render concerns grid
function renderConcerns() {
  // Try to get concernsGrid if not already set
  if (!concernsGrid) {
    concernsGrid = document.getElementById("concernsGrid");
  }

  if (!concernsGrid) {
    console.warn("concernsGrid not found");
    return;
  }

  concernsGrid.innerHTML = "";

  if (!HIGH_LEVEL_CONCERNS || HIGH_LEVEL_CONCERNS.length === 0) {
    console.warn("HIGH_LEVEL_CONCERNS is empty");
    concernsGrid.innerHTML = "<p>No concerns available</p>";
    return;
  }

  HIGH_LEVEL_CONCERNS.forEach((concern) => {
    const card = document.createElement("div");
    card.className = "concern-card";
    if (currentState.selectedConcerns.includes(concern.id)) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="concern-card-content">
        <h3 class="concern-card-title">${concern.name}</h3>
        <p class="concern-card-description">${concern.description}</p>
      </div>
    `;

    card.addEventListener("click", () => toggleConcern(concern.id));
    concernsGrid.appendChild(card);
  });

  updateConcernsCount();
}

// Render areas grid
function renderAreas() {
  if (!areasGrid) return;
  areasGrid.innerHTML = "";

  AREAS_OF_CONCERN.forEach((area) => {
    const card = document.createElement("div");
    card.className = "area-card";
    if (currentState.selectedAreas.includes(area.id)) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="area-card-content">
        <span class="area-card-title">${area.name}</span>
      </div>
    `;

    card.addEventListener("click", () => toggleArea(area.id));
    areasGrid.appendChild(card);
  });

  updateAreasCount();
}

// Toggle concern selection (max 3)
function toggleConcern(concernId) {
  const index = currentState.selectedConcerns.indexOf(concernId);
  if (index > -1) {
    // Deselect
    currentState.selectedConcerns.splice(index, 1);
    // Update sessionStorage
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(
        "selectedConcerns",
        JSON.stringify(currentState.selectedConcerns)
      );
    }
  } else {
    // Select (if under limit)
    if (currentState.selectedConcerns.length < 3) {
      currentState.selectedConcerns.push(concernId);
      // Save to sessionStorage for persistence
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          "selectedConcerns",
          JSON.stringify(currentState.selectedConcerns)
        );
      }
    } else {
      // Already at max - show feedback
      showToast("You can select up to 3 concerns", "info");
      return;
    }
  }
  renderConcerns();
  updateNextButton();
}

// Toggle area selection (max 3)
function toggleArea(areaId) {
  const index = currentState.selectedAreas.indexOf(areaId);
  if (index > -1) {
    // Deselect
    currentState.selectedAreas.splice(index, 1);
    // Update sessionStorage
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(
        "selectedAreas",
        JSON.stringify(currentState.selectedAreas)
      );
    }
  } else {
    // Select (if under limit)
    if (currentState.selectedAreas.length < 3) {
      currentState.selectedAreas.push(areaId);
      // Save to sessionStorage
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          "selectedAreas",
          JSON.stringify(currentState.selectedAreas)
        );
      }
    } else {
      // Already at max - show feedback
      showToast("You can select up to 3 areas", "info");
      return;
    }
  }
  renderAreas();
  updateNextButton();
}

// Update concerns count display
function updateConcernsCount() {
  if (concernsCount) {
    concernsCount.textContent = `${currentState.selectedConcerns.length} of 3 selected`;
  }
}

// Update areas count display
function updateAreasCount() {
  if (areasCount) {
    areasCount.textContent = `${currentState.selectedAreas.length} of 3 selected`;
  }
}

// Event Listeners
function setupEventListeners() {
  // Age range radio changes
  const ageRangeInputs = document.querySelectorAll('input[name="age-range"]');
  ageRangeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      currentState.ageRange = input.value;
      updateNextButton();
    });
  });

  // Skin type option clicks
  const skinTypeOptions = document.querySelectorAll(".skin-type-option");
  skinTypeOptions.forEach((option) => {
    option.addEventListener("click", () =>
      handleSkinTypeClick(option.dataset.type)
    );
  });

  // Skin tone radio changes
  const skinToneInputs = document.querySelectorAll('input[name="skin-tone"]');
  skinToneInputs.forEach((input) => {
    input.addEventListener("change", () => {
      currentState.skinTone = input.value;
      updateNextButton();
    });
  });

  // Ethnic background radio changes
  const ethnicInputs = document.querySelectorAll(
    'input[name="ethnic-background"]'
  );
  ethnicInputs.forEach((input) => {
    input.addEventListener("change", () => {
      currentState.ethnicBackground = input.value;
      updateNextButton();
    });
  });

  // Next button - handle both enabled and disabled clicks
  nextButton.addEventListener("click", function (e) {
    if (nextButton.disabled) {
      e.preventDefault();
      e.stopPropagation();
      // Don't show toast - button is hidden when disabled anyway
      return false;
    } else {
      handleNextClick(e);
    }
  });

  // Back button
  backButton.addEventListener("click", handleBackClick);
}

// Show specific step
function showStep(stepIndex) {
  // Hide all views
  concernsView?.classList.add("hidden");
  areasView?.classList.add("hidden");
  ageView?.classList.add("hidden");
  skinTypeView?.classList.add("hidden");
  skinToneView?.classList.add("hidden");
  ethnicBackgroundView?.classList.add("hidden");
  questionsView?.classList.add("hidden");

  // Hide detail view
  const detailView = document.getElementById("detailView");
  if (detailView) detailView.classList.add("hidden");

  currentState.currentStep = stepIndex;
  const step = FORM_STEPS[stepIndex];

  // Show/hide back button
  if (stepIndex === 0) {
    if (backButton) backButton.style.opacity = "0.3";
    if (backButton) backButton.style.pointerEvents = "none";
  } else {
    if (backButton) backButton.style.opacity = "1";
    if (backButton) backButton.style.pointerEvents = "auto";
  }

  // Show appropriate view
  if (step === "concerns") {
    concernsView?.classList.remove("hidden");
    // Re-render concerns when showing this step to ensure they're visible
    renderConcerns();
  } else if (step === "areas") {
    areasView?.classList.remove("hidden");
    // Re-render areas when showing this step
    renderAreas();
  } else if (step === "age") {
    ageView?.classList.remove("hidden");
  } else if (step === "skinType") {
    skinTypeView?.classList.remove("hidden");
  } else if (step === "skinTone") {
    skinToneView?.classList.remove("hidden");
  } else if (step === "ethnicBackground") {
    ethnicBackgroundView?.classList.remove("hidden");
  }

  updateProgress();
  updateNextButton();
}

// Handle skin type selection
function handleSkinTypeClick(type) {
  currentState.skinType = type;

  // Update UI
  updateSkinTypeSelection(type);

  if (type === "not-sure") {
    // Show questions flow
    showNotSureQuestions();
  } else {
    // Show characteristics below
    showCharacteristics(type);
  }

  updateNextButton();
}

// Update skin type selection visual state
function updateSkinTypeSelection(selectedType) {
  const options = document.querySelectorAll(".skin-type-option");
  options.forEach((option) => {
    if (option.dataset.type === selectedType) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });
}

// Show characteristics tags
function showCharacteristics(type) {
  if (!characteristicsContainer) return;

  const data = skinTypeData[type];
  if (!data) {
    characteristicsContainer.innerHTML = "";
    characteristicsContainer.style.display = "none";
    return;
  }

  characteristicsContainer.innerHTML = "";

  data.characteristics.forEach((char) => {
    const tag = document.createElement("div");
    tag.className = "characteristic-tag";
    tag.textContent = char;
    characteristicsContainer.appendChild(tag);
  });

  characteristicsContainer.style.display = "flex";
}

// Show "not sure" questions
function showNotSureQuestions() {
  if (skinTypeView) skinTypeView.classList.add("hidden");
  if (questionsView) questionsView.classList.remove("hidden");
  currentState.inNotSureFlow = true;
  currentState.notSureQuestionIndex = 0;
  currentState.notSureAnswers = [];
  loadNotSureQuestion(0);
  updateProgress();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Load not sure question
function loadNotSureQuestion(index) {
  if (index >= notSureQuestions.length || !questionsView) {
    return;
  }

  const question = notSureQuestions[index];
  const questionText = document.getElementById("questionText");
  const questionSubtitle = document.getElementById("questionSubtitle");
  const optionsContainer = document.getElementById("questionOptions");

  if (questionText) questionText.textContent = question.question;
  if (questionSubtitle) questionSubtitle.textContent = question.subtitle;
  if (!optionsContainer) return;

  optionsContainer.innerHTML = "";

  question.options.forEach((optionText, idx) => {
    const option = document.createElement("button");
    option.className = "question-option";
    option.textContent = optionText;
    option.dataset.optionIndex = idx;
    option.addEventListener("click", () => handleNotSureOptionClick(idx));
    optionsContainer.appendChild(option);
  });
}

// Handle not sure option click
function handleNotSureOptionClick(optionIndex) {
  const options = document.querySelectorAll(".question-option");
  options.forEach((opt, idx) => {
    if (idx === optionIndex) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });

  currentState.notSureAnswers[currentState.notSureQuestionIndex] = optionIndex;
  updateNextButton();
}

/**
 * Determine skin type from "not sure" flow answers
 * @returns {string|null} - The determined skin type or null if can't determine
 */
function determineSkinTypeFromAnswers() {
  const answers = currentState.notSureAnswers;
  if (answers.length < 2) return null;

  const answer1 = answers[0]; // First question: "How does your skin feel after cleansing?"
  const answer2 = answers[1]; // Second question: "Which of these best describes your skin?"

  // Map first question answers to skin types
  // 0: "It feels oily and/or shiny all over" → oily
  // 1: "Shiny/oily in the T-zone (nose and forehead), dry/dull elsewhere" → combination
  // 2: "Comfortable and balanced, no excessive oiliness or dryness" → balanced
  // 3: "It feels tight, dry, or flaky" → dry
  // 4: "I'm not sure" → need to check second question

  if (answer1 === 0) return "oily";
  if (answer1 === 1) return "combination";
  if (answer1 === 2) return "balanced";
  if (answer1 === 3) return "dry";

  // If first answer was "I'm not sure" (4), use second question
  // 0: "Enlarged pores, especially on the T-zone" → combination
  // 1: "Dull complexion, rough texture" → dry
  // 2: "Occasional breakouts but generally clear" → balanced
  // 3: "Oily T-zone with dry cheeks" → combination
  // 4: "None of these describe my skin" → balanced (default)

  if (answer1 === 4) {
    if (answer2 === 0) return "combination";
    if (answer2 === 1) return "dry";
    if (answer2 === 2) return "balanced";
    if (answer2 === 3) return "combination";
    if (answer2 === 4) return "balanced"; // Default
  }

  // Fallback: use second question if first was unclear
  if (answer2 === 0) return "combination";
  if (answer2 === 1) return "dry";
  if (answer2 === 2) return "balanced";
  if (answer2 === 3) return "combination";

  // Default to balanced if we can't determine
  return "balanced";
}

/**
 * Show the determined skin type screen
 * @param {string} skinType - The determined skin type
 */
function showDeterminedSkinTypeScreen(skinType) {
  // Hide questions view
  if (questionsView) questionsView.classList.add("hidden");

  // Show detail view
  const detailView = document.getElementById("detailView");
  if (!detailView) return;

  detailView.classList.remove("hidden");

  // Get skin type data
  const data = skinTypeData[skinType];
  if (!data) return;

  // Update title
  const detailTitle = document.getElementById("detailTitle");
  if (detailTitle) {
    detailTitle.textContent = data.title;
  }

  // Update description
  const detailDescription = document.getElementById("detailDescription");
  if (detailDescription) {
    detailDescription.textContent = data.description;
  }

  // Update icon - get the icon from the skin type option
  const detailIcon = document.getElementById("detailIcon");
  if (detailIcon) {
    const skinTypeOption = document.querySelector(
      `.skin-type-option[data-type="${skinType}"]`
    );
    if (skinTypeOption) {
      const iconElement = skinTypeOption.querySelector(".skin-type-icon");
      if (iconElement) {
        // Clone the SVG and ensure it uses currentColor for proper styling
        const iconClone = iconElement.cloneNode(true);
        // Make sure SVG elements use currentColor
        const svgElements = iconClone.querySelectorAll("svg");
        svgElements.forEach((svg) => {
          svg.setAttribute("color", "currentColor");
          // Update all child elements to use currentColor
          svg
            .querySelectorAll("path, rect, circle, polygon, polyline")
            .forEach((el) => {
              if (
                el.hasAttribute("fill") &&
                el.getAttribute("fill") !== "none"
              ) {
                el.setAttribute("fill", "currentColor");
              }
              if (
                el.hasAttribute("stroke") &&
                el.getAttribute("stroke") !== "none"
              ) {
                el.setAttribute("stroke", "currentColor");
              }
            });
        });
        detailIcon.innerHTML = iconClone.innerHTML;
      }
    }
  }

  // Update characteristics tags
  const detailTags = document.getElementById("detailTags");
  if (detailTags) {
    detailTags.innerHTML = data.characteristics
      .map(
        (char) => `<div class="characteristic-tag">${escapeHtml(char)}</div>`
      )
      .join("");
  }

  // Update state
  currentState.inNotSureFlow = false;
  currentState.skinType = skinType;

  // Update progress (will be handled by updateProgress() which checks for detail view)
  updateProgress();
  updateNextButton();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Handle next button click
function handleNextClick() {
  // Check if we're on review screen
  const reviewView = document.getElementById("reviewView");
  if (reviewView && !reviewView.classList.contains("hidden")) {
    // From review screen, show celebration screen
    showCelebrationScreen();
    return;
  }

  // Check if we're on celebration screen
  const celebrationScreen = document.getElementById("celebrationScreen");
  if (celebrationScreen && !celebrationScreen.classList.contains("hidden")) {
    // From celebration screen, show lead capture form
    showLeadCaptureForm();
    return;
  }

  // Check if we're on lead capture screen
  const leadCaptureScreen = document.getElementById("leadCaptureScreen");
  if (leadCaptureScreen && !leadCaptureScreen.classList.contains("hidden")) {
    // Skip lead capture and proceed to results
    skipLeadCapture();
    return;
  }

  // Check if we're on the detail view (determined skin type screen)
  const detailView = document.getElementById("detailView");
  if (detailView && !detailView.classList.contains("hidden")) {
    // From detail view, proceed to next step (skin tone)
    detailView.classList.add("hidden");
    showStep(4); // skinTone is index 4
    updateNextButton();
    return;
  }

  if (currentState.inNotSureFlow) {
    // Handle not sure flow
    if (
      currentState.notSureAnswers[currentState.notSureQuestionIndex] !==
      undefined
    ) {
      if (currentState.notSureQuestionIndex < notSureQuestions.length - 1) {
        currentState.notSureQuestionIndex++;
        loadNotSureQuestion(currentState.notSureQuestionIndex);
        updateProgress();
      } else {
        // All questions answered, determine skin type and show result screen
        const determinedSkinType = determineSkinTypeFromAnswers();
        if (determinedSkinType) {
          currentState.skinType = determinedSkinType;
          showDeterminedSkinTypeScreen(determinedSkinType);
        } else {
          // Fallback: go back to skin type selection if we can't determine
          if (questionsView) questionsView.classList.add("hidden");
          if (skinTypeView) skinTypeView.classList.remove("hidden");
          currentState.inNotSureFlow = false;
          currentState.skinType = null;
          updateSkinTypeSelection(null);
          if (characteristicsContainer) {
            characteristicsContainer.innerHTML = "";
            characteristicsContainer.style.display = "none";
          }
        }
      }
    }
    updateNextButton();
    return;
  }

  const currentStep = FORM_STEPS[currentState.currentStep];

  // Validate current step
  if (
    currentStep === "concerns" &&
    currentState.selectedConcerns.length === 0
  ) {
    return;
  }
  if (currentStep === "areas" && currentState.selectedAreas.length === 0) {
    return;
  }
  if (currentStep === "age" && !currentState.ageRange) {
    return;
  }
  if (currentStep === "skinType" && !currentState.skinType) {
    return;
  }
  if (currentStep === "skinTone" && !currentState.skinTone) {
    return;
  }

  // Move to next step
  if (currentState.currentStep < FORM_STEPS.length - 1) {
    showStep(currentState.currentStep + 1);
  } else {
    // All steps complete - show review screen
    showReviewScreen();
  }
}

// Show review screen
function showReviewScreen() {
  // Hide all views
  concernsView?.classList.add("hidden");
  areasView?.classList.add("hidden");
  ageView?.classList.add("hidden");
  skinTypeView?.classList.add("hidden");
  skinToneView?.classList.add("hidden");
  ethnicBackgroundView?.classList.add("hidden");
  questionsView?.classList.add("hidden");

  const reviewView = document.getElementById("reviewView");
  if (reviewView) {
    reviewView.classList.remove("hidden");
    populateReviewScreen();
  }

  updateProgress();
  updateNextButton();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Populate review screen
function populateReviewScreen() {
  // Review concerns
  const concernsContainer = document.getElementById("reviewConcerns");
  if (concernsContainer) {
    const concerns = currentState.selectedConcerns.map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      return concern ? concern.name : id;
    });
    concernsContainer.innerHTML = concerns
      .map((name) => `<div class="review-item">${name}</div>`)
      .join("");
  }

  // Review areas
  const areasContainer = document.getElementById("reviewAreas");
  if (areasContainer) {
    const areas = currentState.selectedAreas.map((id) => {
      const area = AREAS_OF_CONCERN.find((a) => a.id === id);
      return area ? area.name : id;
    });
    areasContainer.innerHTML = areas
      .map((name) => `<div class="review-item">${name}</div>`)
      .join("");
  }

  // Review details
  const detailsContainer = document.getElementById("reviewDetails");
  if (detailsContainer) {
    const details = [];
    if (currentState.ageRange) details.push(`Age: ${currentState.ageRange}`);
    if (currentState.skinType) {
      const skinTypeInfo = skinTypeData[currentState.skinType];
      details.push(
        `Skin Type: ${
          skinTypeInfo ? skinTypeInfo.title : currentState.skinType
        }`
      );
    }
    if (currentState.skinTone) {
      const skinToneName =
        currentState.skinTone.charAt(0).toUpperCase() +
        currentState.skinTone.slice(1);
      details.push(`Skin Tone: ${skinToneName}`);
    }
    if (currentState.ethnicBackground) {
      const ethnicName =
        currentState.ethnicBackground.charAt(0).toUpperCase() +
        currentState.ethnicBackground.slice(1);
      details.push(`Ethnic Background: ${ethnicName}`);
    }
    detailsContainer.innerHTML = details
      .map((detail) => `<div class="review-item">${detail}</div>`)
      .join("");
  }
}

// Show results screen
function showResultsScreen() {
  const reviewView = document.getElementById("reviewView");
  const resultsScreen = document.getElementById("resultsScreen");
  const appContainer = document.querySelector(".app-container");

  if (reviewView) reviewView.classList.add("hidden");

  // Hide header (including progress bar and back button) when results screen is visible
  if (appContainer) {
    appContainer.classList.add("header-hidden");
  }

  const mainContent = document.querySelector(".main-content");

  if (!resultsScreen) {
    console.error("❌ Results screen element not found!");
    return;
  }

  console.log("=== SHOWING RESULTS SCREEN (AGGRESSIVE) ===");

  // AGGRESSIVE: Ensure results screen is inside main-content (same as testResultsScreen)
  if (mainContent && resultsScreen.parentElement !== mainContent) {
    console.log("Moving results screen to main-content");
    mainContent.appendChild(resultsScreen);
  }

  {
    // AGGRESSIVE: Remove hidden class (same as testResultsScreen)
    resultsScreen.classList.remove("hidden");
    if (resultsScreen.classList.contains("hidden")) {
      resultsScreen.classList.remove("hidden");
    }

    // AGGRESSIVE: Set BOTH regular inline styles AND setProperty (same as testResultsScreen)
    resultsScreen.style.display = "block";
    resultsScreen.style.visibility = "visible";
    resultsScreen.style.opacity = "1";
    resultsScreen.style.position = "relative";
    resultsScreen.style.height = "auto";
    resultsScreen.style.minHeight = "auto";

    // Also use setProperty for extra override power
    resultsScreen.style.setProperty("display", "block", "important");
    resultsScreen.style.setProperty("visibility", "visible", "important");
    resultsScreen.style.setProperty("opacity", "1", "important");
    resultsScreen.style.setProperty("position", "relative", "important");

    // Verify it worked
    const computedDisplay = window.getComputedStyle(resultsScreen).display;
    const rect = resultsScreen.getBoundingClientRect();
    const isVisible =
      computedDisplay !== "none" &&
      rect.height > 0 &&
      rect.top < window.innerHeight + 100;

    console.log("Results screen shown:", {
      hasHiddenClass: resultsScreen.classList.contains("hidden"),
      computedDisplay: computedDisplay,
      inlineDisplay: resultsScreen.style.display,
      top: rect.top,
      height: rect.height,
      windowHeight: window.innerHeight,
      isVisible: isVisible,
    });

    // Final check - if still not visible, log detailed error
    if (!isVisible) {
      console.error("❌ Results screen NOT visible!");
      console.error("Parent:", resultsScreen.parentElement?.className);
      console.error("All classes:", resultsScreen.className);
      console.error("Computed styles:", {
        display: computedDisplay,
        visibility: window.getComputedStyle(resultsScreen).visibility,
        opacity: window.getComputedStyle(resultsScreen).opacity,
        position: window.getComputedStyle(resultsScreen).position,
      });
      console.error("Bounding rect:", rect);
    } else {
      console.log("✅ Results screen is visible and positioned correctly");
    }

    // Refresh case data before populating
    if (
      (!caseData || caseData.length === 0) &&
      typeof window !== "undefined" &&
      window.caseData
    ) {
      caseData = window.caseData;
      console.log(
        `Refreshed: Loaded ${caseData.length} cases from window.caseData`
      );
    }

    // CRITICAL: Restore state from sessionStorage BEFORE populating
    if (typeof sessionStorage !== "undefined") {
      try {
        const storedConcerns = sessionStorage.getItem("selectedConcerns");
        if (storedConcerns) {
          const parsed = JSON.parse(storedConcerns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentState.selectedConcerns = parsed;
            console.log("✓ Restored concerns in showResultsScreen:", parsed);
          }
        }
        const storedAreas = sessionStorage.getItem("selectedAreas");
        if (storedAreas) {
          const parsed = JSON.parse(storedAreas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentState.selectedAreas = parsed;
          }
        }
        if (
          currentState.ageRange === null ||
          currentState.ageRange === undefined
        ) {
          const storedAge = sessionStorage.getItem("ageRange");
          if (storedAge) currentState.ageRange = storedAge;
        }
        if (
          currentState.skinType === null ||
          currentState.skinType === undefined
        ) {
          const storedSkinType = sessionStorage.getItem("skinType");
          if (storedSkinType) currentState.skinType = storedSkinType;
        }
        if (
          currentState.skinTone === null ||
          currentState.skinTone === undefined
        ) {
          const storedSkinTone = sessionStorage.getItem("skinTone");
          if (storedSkinTone) currentState.skinTone = storedSkinTone;
        }
      } catch (e) {
        console.error("Error restoring state in showResultsScreen:", e);
      }
    }

    // AGGRESSIVE: Populate immediately (same as testResultsScreen)
    populateResultsScreen();
    console.log("✓ populateResultsScreen() called immediately");

    // Ensure content is visible - check if content container has content
    const contentContainer = document.getElementById("resultsContent");
    if (
      contentContainer &&
      (!contentContainer.innerHTML || contentContainer.innerHTML.trim() === "")
    ) {
      console.log("⚠ Content container is empty, setting default content");
      contentContainer.innerHTML = `
        <div class="results-description">
          <p>Loading your personalized results...</p>
        </div>
      `;
    }

    // Force scroll to top immediately - do this aggressively (same as testResultsScreen)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Also call populateResultsScreen again after a short delay to ensure it sticks
    setTimeout(() => {
      populateResultsScreen();
      console.log("✓ populateResultsScreen() called again after delay");

      // Double-check content is populated
      if (
        contentContainer &&
        (!contentContainer.innerHTML ||
          contentContainer.innerHTML.trim() === "")
      ) {
        console.log("⚠ Content still empty after delay, populating again");
        populateResultsScreen();
      }

      // Force scroll again after content is populated
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (mainContent) {
        mainContent.scrollTop = 0;
        mainContent.scrollTo({ top: 0, behavior: "instant" });
      }
      resultsScreen.scrollIntoView({ behavior: "instant", block: "start" });

      // Verify it worked (same as testResultsScreen)
      const rect = resultsScreen.getBoundingClientRect();
      const styles = window.getComputedStyle(resultsScreen);
      const contentRect = contentContainer
        ? contentContainer.getBoundingClientRect()
        : null;
      console.log("✓ Results screen final state:", {
        display: styles.display,
        visibility: styles.visibility,
        top: rect.top,
        height: rect.height,
        isVisible: rect.top < 100 && rect.height > 0,
        contentHeight: contentRect ? contentRect.height : 0,
        hasContent: contentContainer
          ? contentContainer.innerHTML.length > 0
          : false,
      });

      if (rect.top > 100 || rect.height === 0) {
        console.error("❌ STILL NOT VISIBLE! Check CSS for conflicting rules.");
      } else {
        console.log("✅ Results screen is visible and populated!");
      }
    }, 100);

    // Additional fallback - populate one more time after a longer delay
    setTimeout(() => {
      if (
        contentContainer &&
        (!contentContainer.innerHTML ||
          contentContainer.innerHTML.trim() === "")
      ) {
        console.log(
          "⚠ Final fallback: Content still empty, populating one more time"
        );
        populateResultsScreen();
      }
    }, 500);
  }

  // Hide back button on results screen
  if (backButton) {
    backButton.style.opacity = "0.3";
    backButton.style.pointerEvents = "none";
  }
}

// Populate results screen (simplified version)
function populateResultsScreen() {
  const tabsContainer = document.getElementById("resultsTabs");
  const contentContainer = document.getElementById("resultsContent");

  if (!tabsContainer || !contentContainer) {
    console.error("Results containers not found:", {
      tabsContainer: !!tabsContainer,
      contentContainer: !!contentContainer,
    });
    return;
  }

  // Show loading state immediately to prevent blank screen
  contentContainer.innerHTML = `
    <div class="results-description">
      <p>Loading your personalized results...</p>
    </div>
  `;

  // CRITICAL: Restore state from sessionStorage FIRST, before checking currentState
  if (typeof sessionStorage !== "undefined") {
    try {
      const storedConcerns = sessionStorage.getItem("selectedConcerns");
      if (storedConcerns) {
        const parsed = JSON.parse(storedConcerns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedConcerns = parsed;
          console.log("✓ Restored concerns from sessionStorage:", parsed);
        }
      }
      const storedAreas = sessionStorage.getItem("selectedAreas");
      if (storedAreas) {
        const parsed = JSON.parse(storedAreas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedAreas = parsed;
        }
      }
      if (
        currentState.ageRange === null ||
        currentState.ageRange === undefined
      ) {
        const storedAge = sessionStorage.getItem("ageRange");
        if (storedAge) currentState.ageRange = storedAge;
      }
      if (
        currentState.skinType === null ||
        currentState.skinType === undefined
      ) {
        const storedSkinType = sessionStorage.getItem("skinType");
        if (storedSkinType) currentState.skinType = storedSkinType;
      }
      if (
        currentState.skinTone === null ||
        currentState.skinTone === undefined
      ) {
        const storedSkinTone = sessionStorage.getItem("skinTone");
        if (storedSkinTone) currentState.skinTone = storedSkinTone;
      }
    } catch (e) {
      console.error("Error restoring state from sessionStorage:", e);
    }
  }

  // Try to get case data if not already loaded - be more aggressive
  if ((!caseData || caseData.length === 0) && typeof window !== "undefined") {
    if (
      window.caseData &&
      Array.isArray(window.caseData) &&
      window.caseData.length > 0
    ) {
      caseData = window.caseData;
      console.log(`✓ Loaded ${caseData.length} cases from window.caseData`);
    } else {
      console.warn(
        "⚠ window.caseData not available or empty, attempting to load..."
      );
      // Try to load cases if not available
      if (typeof loadCasesFromAirtable === "function") {
        loadCasesFromAirtable()
          .then(() => {
            console.log(`✓ Cases loaded, retrying populateResultsScreen`);
            // Retry populating after a short delay to let data load
            setTimeout(() => {
              populateResultsScreen();
            }, 200);
          })
          .catch((err) => {
            console.error("Error loading cases:", err);
          });
      }
    }
  }

  // If still no case data, show a message
  if (!caseData || caseData.length === 0) {
    console.warn("⚠ No case data available yet");
    contentContainer.innerHTML = `
      <div class="results-description">
        <p>Loading case data...</p>
        <p style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
          Please wait while we load your personalized results.
        </p>
      </div>
    `;
    // Try again after a delay
    setTimeout(() => {
      if (
        window.caseData &&
        Array.isArray(window.caseData) &&
        window.caseData.length > 0
      ) {
        caseData = window.caseData;
        console.log(`✓ Loaded ${caseData.length} cases on retry`);
        populateResultsScreen();
      }
    }, 500);
    return;
  }

  // Get selected concerns - try multiple sources
  let selectedConcernIds = currentState.selectedConcerns || [];

  // Fallback 1: Try to get from celebration preview items
  if (selectedConcernIds.length === 0) {
    const previewItems = document.querySelectorAll(".preview-item");
    if (previewItems.length > 0) {
      console.log(
        "Fallback: Trying to get concerns from celebration preview items"
      );
      selectedConcernIds = Array.from(previewItems)
        .map((item) => {
          const text = item.textContent.trim();
          const concern = HIGH_LEVEL_CONCERNS.find((c) => c.name === text);
          return concern ? concern.id : null;
        })
        .filter((id) => id !== null);
    }
  }

  // Fallback 2: Try to get from review screen
  if (selectedConcernIds.length === 0) {
    const reviewConcerns = document.querySelectorAll(
      "#reviewConcerns .review-item"
    );
    if (reviewConcerns.length > 0) {
      console.log("Fallback: Trying to get concerns from review screen");
      selectedConcernIds = Array.from(reviewConcerns)
        .map((item) => {
          const text = item.textContent.trim();
          const concern = HIGH_LEVEL_CONCERNS.find((c) => c.name === text);
          return concern ? concern.id : null;
        })
        .filter((id) => id !== null);
    }
  }

  console.log(
    "Populating results screen with concerns:",
    selectedConcernIds,
    "from currentState:",
    currentState.selectedConcerns
  );
  console.log("Case data available:", caseData ? caseData.length : 0, "cases");

  // Create tabs for each concern
  const concerns = selectedConcernIds
    .map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      if (!concern) {
        console.warn("Concern not found for ID:", id);
        return null;
      }

      // Get case count for this concern
      const matchingCases = getMatchingCasesForConcern(id);
      const caseCount = matchingCases.length;
      console.log(
        `Concern "${concern.name}" (${id}): ${caseCount} matching cases`
      );

      return {
        id,
        name: concern.name,
        count: caseCount,
      };
    })
    .filter((c) => c !== null);

  if (concerns.length === 0) {
    console.warn("No concerns found after processing");
    tabsContainer.innerHTML = "";
    contentContainer.innerHTML = `
      <div class="results-description">
        <p>No concerns selected.</p>
        <p style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
          Please go back and select your concerns to see results.
        </p>
      </div>
    `;
    return;
  }

  console.log(`Rendering ${concerns.length} concern tabs`);

  // Render tabs
  tabsContainer.innerHTML = concerns
    .map(
      (concern, index) =>
        `<button class="results-tab ${
          index === 0 ? "active" : ""
        }" data-concern-id="${concern.id}" onclick="switchResultsTab('${
          concern.id
        }')">
      ${concern.name}${concern.count > 0 ? ` (${concern.count})` : ""}
    </button>`
    )
    .join("");

  // Render content for first concern immediately
  console.log(
    `Rendering content for first concern: ${concerns[0].id} (${concerns[0].name})`
  );
  renderResultsContent(concerns[0].id);
  console.log("✓ renderResultsContent() called");
}

// Switch results tab
function switchResultsTab(concernId) {
  // Update active tab
  const tabs = document.querySelectorAll(".results-tab");
  tabs.forEach((tab) => {
    if (tab.dataset.concernId === concernId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Render content
  renderResultsContent(concernId);
}

// Extract concern from case name (removes treatment info)
function extractConcernFromCaseName(caseName) {
  if (!caseName) return "General Concern";

  const name = caseName.toLowerCase();

  // Remove common treatment method suffixes
  const patterns = [
    // Remove "with [treatment]" patterns
    { pattern: /\s+with\s+.*$/i, replacement: "" },
    // Remove standalone treatment terms at the end
    {
      pattern:
        /\s+(heat\/energy|heat\s*\/\s*energy|rf|radiofrequency|radio\s+frequency|thermage|ultherapy|morpheus|microneedling|hydrafacial|ipl|laser|botox|filler|threadlift)$/i,
      replacement: "",
    },
    // Remove "using X" patterns
    { pattern: /\s+using\s+.*$/i, replacement: "" },
    // Remove "via X" patterns
    { pattern: /\s+via\s+.*$/i, replacement: "" },
  ];

  let concern = caseName;
  patterns.forEach(({ pattern, replacement }) => {
    concern = concern.replace(pattern, replacement).trim();
  });

  // Capitalize first letter of each word
  concern = concern
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return concern || "General Concern";
}

// Extract treatment from case name
function extractTreatmentFromCaseName(caseName) {
  if (!caseName) return "General Treatment";

  // Extract from "with X" pattern
  let withMatch = caseName.match(/\s+with\s+([^,]+?)(?:\s+for|\s+to|$)/i);

  // Also check for treatments at the end without "with"
  if (!withMatch) {
    const endTreatmentMatch = caseName.match(
      /\s+(heat\/energy|heat\s*\/\s*energy|rf|radiofrequency|radio\s+frequency|thermage|ultherapy|morpheus|hydrafacial|ipl|laser|botox|filler|threadlift)$/i
    );
    if (endTreatmentMatch) {
      withMatch = [null, endTreatmentMatch[1]];
    }
  }

  if (withMatch && withMatch[1]) {
    let treatment = withMatch[1].trim();
    // Capitalize first letter of each word
    treatment = treatment
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    return treatment;
  }

  return "General Treatment";
}

// Group cases by treatment suggestion
function groupCasesByTreatmentSuggestion(cases) {
  const concernGroups = {};

  // Calculate matching scores for all cases before grouping
  const casesWithScores = cases.map((caseItem) => {
    if (!caseItem.matchingScore) {
      caseItem.matchingScore = calculateMatchingScore(caseItem, currentState);
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

// Calculate matching score for a case
function calculateMatchingScore(caseItem, userSelections) {
  let score = 0;
  const maxScore = 100;

  // Age match (30 points max) - convert age range to approximate age
  if (userSelections.ageRange && caseItem.patientAge) {
    const rangeMid =
      userSelections.ageRange === "60+"
        ? 65
        : parseInt(userSelections.ageRange.split("-")[0]) + 5;
    const ageDiff = Math.abs(caseItem.patientAge - rangeMid);
    if (ageDiff === 0) {
      score += 30;
    } else if (ageDiff <= 2) {
      score += 25;
    } else if (ageDiff <= 5) {
      score += 20;
    } else if (ageDiff <= 10) {
      score += 15;
    } else if (ageDiff <= 15) {
      score += 10;
    } else {
      score += 5;
    }
  } else {
    score += 15; // Partial credit if age data missing
  }

  // Category match (50 points max)
  if (
    userSelections.selectedConcerns &&
    userSelections.selectedConcerns.length > 0
  ) {
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = (caseItem.matchingCriteria || []).map((c) =>
      c.toLowerCase()
    );

    let categoryMatches = 0;
    userSelections.selectedConcerns.forEach((concernId) => {
      const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);
      if (category) {
        const nameMatch = category.mapsToPhotos?.some((keyword) =>
          caseNameLower.includes(keyword.toLowerCase())
        );
        const criteriaMatch = category.mapsToPhotos?.some((keyword) =>
          matchingCriteriaLower.some((criteria) =>
            criteria.includes(keyword.toLowerCase())
          )
        );
        if (nameMatch || criteriaMatch) {
          categoryMatches++;
        }
      }
    });

    if (categoryMatches > 0) {
      const matchRatio =
        categoryMatches / userSelections.selectedConcerns.length;
      score += Math.round(matchRatio * 50);
    }
  }

  // Skin type match (20 points max)
  if (userSelections.skinType && caseItem.skinType) {
    if (userSelections.skinType === caseItem.skinType) {
      score += 20;
    }
  }

  return Math.min(score, maxScore);
}

// Helper function to normalize keywords (handle hyphens and spaces)
function normalizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[-_\s]+/g, "[-\\s_]*");
}

// Check if a case is surgical
function isSurgicalCase(caseItem) {
  if (!caseItem) return false;

  // Check the "Surgical" field from Airtable
  if (caseItem.surgical !== undefined) {
    const surgicalValue = String(caseItem.surgical || "")
      .toLowerCase()
      .trim();
    if (surgicalValue === "surgical") {
      return true;
    }
    if (surgicalValue === "non-surgical" || surgicalValue === "nonsurgical") {
      return false;
    }
  }

  // Fallback to keyword-based detection
  const caseName = (caseItem.name || "").toLowerCase();
  const surgicalKeywords = [
    "surgical",
    "surgery",
    "rhinoplasty",
    "blepharoplasty",
    "facelift",
    "neck lift",
  ];

  for (const keyword of surgicalKeywords) {
    if (caseName.includes(keyword)) {
      return true;
    }
  }

  return false;
}

// Filter out surgical cases
function filterNonSurgicalCases(cases) {
  if (!cases || !Array.isArray(cases)) return [];
  return cases.filter((caseItem) => !isSurgicalCase(caseItem));
}

// Get CASE_CATEGORY_MAPPING from window if available, otherwise use empty object
// This will be populated if the main app.js has loaded and exposed it
let CASE_CATEGORY_MAPPING = {};
if (typeof window !== "undefined") {
  // Try to get from window (exposed by main app)
  if (window.CASE_CATEGORY_MAPPING) {
    CASE_CATEGORY_MAPPING = window.CASE_CATEGORY_MAPPING;
    console.log("Loaded CASE_CATEGORY_MAPPING from window");
  }
}

// Get matching cases for a concern
function getMatchingCasesForConcern(concernId) {
  if (!caseData || caseData.length === 0) {
    // Try to get from window again
    if (typeof window !== "undefined" && window.caseData) {
      caseData = window.caseData;
    }
    if (!caseData || caseData.length === 0) {
      return [];
    }
  }

  const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);
  if (!concern) return [];

  const userSelections = {
    ageRange: currentState.ageRange,
    selectedConcerns: currentState.selectedConcerns,
    selectedAreas: currentState.selectedAreas,
    skinType: currentState.skinType,
    skinTone: currentState.skinTone,
  };

  return caseData
    .map((caseItem) => {
      const score = calculateMatchingScore(caseItem, userSelections);
      return { ...caseItem, matchingScore: score };
    })
    .filter((caseItem) => {
      // FIRST: Check if case has explicit category mapping from CSV
      const caseCategories = CASE_CATEGORY_MAPPING[caseItem.id];
      if (caseCategories && caseCategories.includes(concernId)) {
        return true; // Direct match from CSV mapping
      }

      // SECOND: Fall back to keyword matching if no CSV mapping
      const caseNameLower = (caseItem.name || "").toLowerCase();
      const matchingCriteriaLower = (caseItem.matchingCriteria || []).map((c) =>
        typeof c === "string" ? c.toLowerCase() : String(c || "").toLowerCase()
      );

      // Check name match with normalized keywords
      const nameMatch = concern.mapsToPhotos?.some((keyword) => {
        const keywordLower = keyword.toLowerCase();
        // Direct match
        if (caseNameLower.includes(keywordLower)) return true;
        // Match with normalized keyword (handles hyphens/spaces)
        const normalized = normalizeKeyword(keyword);
        const regex = new RegExp(normalized, "i");
        return regex.test(caseNameLower);
      });

      // Check criteria match with normalized keywords
      const criteriaMatch = concern.mapsToPhotos?.some((keyword) => {
        const keywordLower = keyword.toLowerCase();
        return matchingCriteriaLower.some((criteria) => {
          if (criteria.includes(keywordLower)) return true;
          // Match with normalized keyword
          const normalized = normalizeKeyword(keyword);
          const regex = new RegExp(normalized, "i");
          return regex.test(criteria);
        });
      });

      // Check issue match (including directMatchingIssues)
      let issueMatch = false;
      if (
        concern.mapsToSpecificIssues &&
        concern.mapsToSpecificIssues.length > 0
      ) {
        const solvedIssuesLower = (caseItem.solved || []).map((issue) =>
          typeof issue === "string"
            ? issue.toLowerCase()
            : String(issue || "").toLowerCase()
        );
        const directMatchingIssuesLower = (
          caseItem.directMatchingIssues || []
        ).map((issue) =>
          typeof issue === "string"
            ? issue.toLowerCase()
            : String(issue || "").toLowerCase()
        );
        const allCaseIssuesLower = [
          ...solvedIssuesLower,
          ...directMatchingIssuesLower,
          ...matchingCriteriaLower,
        ];

        issueMatch = concern.mapsToSpecificIssues.some((issueKeyword) => {
          const issueKeywordLower = issueKeyword.toLowerCase();
          return allCaseIssuesLower.some((caseIssue) => {
            // Direct match
            if (
              caseIssue.includes(issueKeywordLower) ||
              issueKeywordLower.includes(caseIssue)
            ) {
              return true;
            }
            // Normalized match
            const normalized = normalizeKeyword(issueKeyword);
            const regex = new RegExp(normalized, "i");
            return regex.test(caseIssue);
          });
        });
      }

      // Filter by selected areas if any
      let areaMatch = true;
      if (
        userSelections.selectedAreas &&
        userSelections.selectedAreas.length > 0
      ) {
        const userSelectedAreaNames = userSelections.selectedAreas
          .map((areaId) => {
            const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
            return area ? area.name : null;
          })
          .filter((name) => name !== null);

        const solvedIssuesLower = (caseItem.solved || []).map((issue) =>
          typeof issue === "string"
            ? issue.toLowerCase()
            : String(issue || "").toLowerCase()
        );
        const allCaseText = [
          caseNameLower,
          ...matchingCriteriaLower,
          ...solvedIssuesLower,
        ].join(" ");

        // Comprehensive area keyword matching (matching original logic)
        const areaKeywords = [
          // Forehead area (brow ptosis and asymmetry map to Forehead)
          {
            keywords: [
              "brow ptosis",
              "brow asymmetry",
              "brow lift",
              "brow balance",
              "brow droop",
            ],
            area: "Forehead",
          },
          {
            keywords: [
              "forehead",
              "temple",
              "temples",
              "glabella",
              "11s",
              "temporal",
            ],
            area: "Forehead",
          },
          // Eyes area (more specific first)
          {
            keywords: [
              "under eye",
              "under-eye",
              "eyelid",
              "eyelids",
              "upper eyelid",
              "lower eyelid",
            ],
            area: "Eyes",
          },
          {
            keywords: [
              "brow",
              "brows",
              "eyebrow",
              "eyebrows",
              "eye",
              "eyes",
              "ptosis",
            ],
            area: "Eyes",
          },
          // Cheeks area
          {
            keywords: ["cheek", "cheeks", "cheekbone", "mid cheek"],
            area: "Cheeks",
          },
          // Nose area
          {
            keywords: ["nose", "nasal", "nasal tip", "dorsal hump"],
            area: "Nose",
          },
          // Mouth & Lips area
          {
            keywords: ["lip", "lips", "mouth", "philtral", "gummy smile"],
            area: "Mouth & Lips",
          },
          // Jawline area
          {
            keywords: ["jawline", "jaw", "wide jawline", "define jawline"],
            area: "Jawline",
          },
          // Chin area
          {
            keywords: ["chin", "retruded chin", "labiomental"],
            area: "Chin",
          },
          // Neck area
          {
            keywords: ["neck", "neck lines", "neck wrinkles"],
            area: "Neck",
          },
        ];

        // Check which areas this case relates to (based on keywords)
        const matchedAreas = new Set();
        const matchedKeywords = new Set();

        // Sort area keyword groups by longest keyword first (more specific first)
        const sortedAreaKeywords = areaKeywords.map(({ keywords, area }) => ({
          keywords: keywords.sort((a, b) => b.length - a.length),
          area,
        }));

        for (const { keywords, area } of sortedAreaKeywords) {
          for (const keyword of keywords) {
            // Skip if a more specific keyword that contains this keyword already matched
            const isSubstringOfMatched = Array.from(matchedKeywords).some(
              (matched) => matched.includes(keyword) && matched !== keyword
            );

            if (!isSubstringOfMatched && allCaseText.includes(keyword)) {
              matchedAreas.add(area);
              matchedKeywords.add(keyword);
              break; // Found a match for this area, move to next area
            }
          }
        }

        // Only include if the case matches at least one of the user's selected areas
        if (matchedAreas.size === 0) {
          areaMatch = false;
        } else {
          areaMatch = Array.from(matchedAreas).some((area) =>
            userSelectedAreaNames.includes(area)
          );
        }
      }

      return (nameMatch || criteriaMatch || issueMatch) && areaMatch;
    })
    .filter((caseItem) => !isSurgicalCase(caseItem)) // Filter out surgical cases
    .sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
  // Removed .slice(0, 20) limit to show all matching cases
}

// Render results content for a concern
// Store treatment groups for navigation
let treatmentGroupsByConcern = {};

function renderResultsContent(concernId) {
  const contentContainer = document.getElementById("resultsContent");
  if (!contentContainer) {
    console.error("❌ resultsContent container not found!");
    return;
  }

  console.log(`renderResultsContent called for concernId: ${concernId}`);

  const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);
  if (!concern) {
    console.error(`❌ Concern not found for ID: ${concernId}`);
    contentContainer.innerHTML =
      '<p class="no-results">No results available.</p>';
    return;
  }

  console.log(
    `Found concern: ${concern.name}, caseData length: ${
      caseData ? caseData.length : 0
    }`
  );

  // Get matching cases
  const matchingCases = getMatchingCasesForConcern(concernId);
  console.log(
    `Found ${matchingCases.length} matching cases for "${concern.name}"`
  );

  if (matchingCases.length === 0) {
    console.warn(`No matching cases found for "${concern.name}"`);
    contentContainer.innerHTML = `
      <div class="results-description">
        <p>No cases found for <strong>${concern.name}</strong>.</p>
        <p style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
          ${
            caseData.length === 0
              ? "Loading cases..."
              : "Try selecting different concerns or areas."
          }
        </p>
      </div>
    `;
    return;
  }

  // Group cases by treatment suggestion
  const treatmentGroups = groupCasesByTreatmentSuggestion(matchingCases);

  // Store groups for navigation
  treatmentGroupsByConcern[concernId] = {
    concern: concern,
    treatmentGroups: treatmentGroups,
  };

  if (treatmentGroups.length === 0) {
    contentContainer.innerHTML = `
      <div class="results-description">
        <p>No treatment suggestions found for <strong>${concern.name}</strong>.</p>
      </div>
    `;
    return;
  }

  console.log(
    `Rendering ${treatmentGroups.length} treatment groups for "${concern.name}"`
  );

  // Render treatment group cards
  contentContainer.innerHTML = `
    <div class="results-description">
      <p>Found <strong>${matchingCases.length}</strong> ${
    matchingCases.length === 1 ? "case" : "cases"
  } for <strong>${concern.name}</strong>.</p>
    </div>
    <div class="treatment-groups-container">
      ${treatmentGroups
        .map((group, groupIndex) => {
          // Get preview images (up to 4)
          const previewImages = group.cases
            .slice(0, 4)
            .map((caseItem) => caseItem.beforeAfter || caseItem.thumbnail)
            .filter((url) => url);

          return `
          <div class="treatment-group-card" onclick="showSuggestionDetail('${concernId}', ${groupIndex})">
            <div class="treatment-group-header">
              <h3 class="treatment-group-title">${escapeHtml(
                group.suggestion
              )}</h3>
              <span class="treatment-group-count">${group.cases.length} case${
            group.cases.length !== 1 ? "s" : ""
          }</span>
            </div>
            ${
              previewImages.length > 0
                ? `
              <div class="treatment-group-preview">
                ${previewImages
                  .map(
                    (imageUrl, idx) => `
                  <img src="${imageUrl}" alt="Preview ${
                      idx + 1
                    }" class="treatment-group-preview-image" 
                       onerror="this.style.display='none'">
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            <div class="treatment-group-footer">
              <span class="treatment-group-cta">Explore →</span>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;

  // Final verification that content was set
  if (
    contentContainer &&
    contentContainer.innerHTML &&
    contentContainer.innerHTML.trim().length > 0
  ) {
    console.log(`✅ Content rendered successfully for "${concern.name}"`);
  } else {
    console.error(
      `❌ Content container is empty after rendering for "${concern.name}"`
    );
    contentContainer.innerHTML = `
      <div class="results-description">
        <p>Error loading results for <strong>${concern.name}</strong>.</p>
        <p style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
          Please try refreshing the page.
        </p>
      </div>
    `;
  }
}

// Show cases for a specific suggestion
function showSuggestionDetail(concernId, groupIndex) {
  const concernData = treatmentGroupsByConcern[concernId];
  if (!concernData || !concernData.treatmentGroups[groupIndex]) {
    console.error("Treatment group not found");
    return;
  }

  const group = concernData.treatmentGroups[groupIndex];

  // Hide results content, show suggestion detail
  const resultsContent = document.getElementById("resultsContent");
  const resultsHeader = document.querySelector(".results-header");

  if (resultsContent) {
    resultsContent.innerHTML = `
      <div class="suggestion-detail-header">
        <button class="suggestion-back-button" onclick="goBackToResults('${concernId}')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div>
          <h2 class="suggestion-detail-title">${escapeHtml(
            group.suggestion
          )}</h2>
          <p class="suggestion-detail-subtitle">${
            group.cases.length
          } patient result${group.cases.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div class="case-cards-grid">
        ${group.cases
          .map((caseItem) => {
            const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
            const caseTitle = caseItem.headline || caseItem.name || "Case";
            const caseDescription = caseItem.story
              ? caseItem.story.length > 120
                ? caseItem.story.substring(0, 120) + "..."
                : caseItem.story
              : caseItem.patient
              ? `Patient: ${caseItem.patient}`
              : "Treatment results";
            const solvedIssues = caseItem.solved || [];

            return `
            <div class="case-card" onclick="showCaseDetail('${caseItem.id}')">
              ${
                imageUrl
                  ? `
                <div class="case-card-image">
                  <img src="${imageUrl}" alt="${caseTitle}" loading="lazy" 
                       onerror="this.parentElement.innerHTML='<div class=\\'case-placeholder\\'>Before/After</div>'">
                </div>
              `
                  : `
                <div class="case-card-image">
                  <div class="case-placeholder">Before/After</div>
                </div>
              `
              }
              <div class="case-card-content">
                <h3 class="case-card-title">${escapeHtml(caseTitle)}</h3>
                <p class="case-card-description">${escapeHtml(
                  caseDescription
                )}</p>
                ${
                  solvedIssues.length > 0
                    ? `
                  <div class="case-card-solved">
                    ${solvedIssues
                      .slice(0, 2)
                      .map(
                        (issue) =>
                          `<span class="case-card-tag">${escapeHtml(
                            String(issue)
                          )}</span>`
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
                <button class="case-card-button">View Details</button>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }
}

// Go back to results (suggestion groups view)
function goBackToResults(concernId) {
  renderResultsContent(concernId);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show case detail
function showCaseDetail(caseId) {
  // Refresh case data if needed
  if (!caseData || caseData.length === 0) {
    if (typeof window !== "undefined" && window.caseData) {
      caseData = window.caseData;
    }
  }

  const caseItem = caseData.find((c) => c.id === caseId);
  if (!caseItem) {
    alert("Case not found");
    return;
  }

  // Get all case information
  const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
  const caseTitle = caseItem.headline || caseItem.name || "Case Details";
  const caseName = caseItem.name || "";
  const casePatient = caseItem.patient || "";
  const caseStory = caseItem.story || "";
  const caseTreatment = caseItem.treatment || "";
  const solvedIssues = caseItem.solved || [];
  const matchingCriteria = caseItem.matchingCriteria || [];
  const directMatchingIssues = caseItem.directMatchingIssues || [];

  // Build the detail HTML
  const detailHTML = `
    <div class="case-detail-overlay" onclick="closeCaseDetail(event)">
      <div class="case-detail-modal" onclick="event.stopPropagation()">
        <button class="case-detail-close" onclick="closeCaseDetail()">×</button>
        ${
          imageUrl
            ? `
          <img src="${imageUrl}" alt="${caseTitle}" class="case-detail-image" 
               onerror="this.style.display='none'">
        `
            : `
          <div class="case-detail-image" style="background-color: var(--bg-secondary); display: flex; align-items: center; justify-content: center; min-height: 200px;">
            <div class="case-placeholder">Before/After</div>
          </div>
        `
        }
        <div class="case-detail-content">
          <h2 class="case-detail-title">${escapeHtml(caseTitle)}</h2>
          ${
            casePatient
              ? `
            <div class="case-detail-patient">
              <strong>Patient:</strong> ${escapeHtml(casePatient)}
            </div>
          `
              : ""
          }
          ${
            solvedIssues.length > 0
              ? `
            <div class="case-detail-solved">
              <strong>This solved:</strong>
              <div class="case-detail-tags">
                ${solvedIssues
                  .map(
                    (issue) =>
                      `<span class="case-detail-tag">${escapeHtml(
                        String(issue)
                      )}</span>`
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          ${
            caseStory
              ? `
            <div class="case-detail-story">
              <strong>Story:</strong>
              <p>${escapeHtml(caseStory)}</p>
            </div>
          `
              : ""
          }
          ${
            caseTreatment
              ? `
            <div class="case-detail-treatment">
              <strong>Treatment Details:</strong>
              <p>${escapeHtml(caseTreatment)}</p>
            </div>
          `
              : ""
          }
          ${
            matchingCriteria.length > 0 || directMatchingIssues.length > 0
              ? `
            <div class="case-detail-matching">
              <strong>Matching Criteria:</strong>
              <div class="case-detail-tags">
                ${
                  directMatchingIssues.length > 0
                    ? directMatchingIssues
                        .map(
                          (issue) =>
                            `<span class="case-detail-tag">${escapeHtml(
                              String(issue)
                            )}</span>`
                        )
                        .join("")
                    : matchingCriteria
                        .map(
                          (criteria) =>
                            `<span class="case-detail-tag">${escapeHtml(
                              String(criteria)
                            )}</span>`
                        )
                        .join("")
                }
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `;

  // Remove existing overlay if any
  const existing = document.querySelector(".case-detail-overlay");
  if (existing) existing.remove();

  // Add to body
  document.body.insertAdjacentHTML("beforeend", detailHTML);
}

// Close case detail
function closeCaseDetail(event) {
  if (event) event.stopPropagation();
  const overlay = document.querySelector(".case-detail-overlay");
  if (overlay) overlay.remove();
}

// Make functions available globally
window.showCaseDetail = showCaseDetail;
window.closeCaseDetail = closeCaseDetail;
window.showSuggestionDetail = showSuggestionDetail;
window.goBackToResults = goBackToResults;

// Make switchResultsTab available globally (after it's defined)
window.switchResultsTab = switchResultsTab;

// Debug function to test results screen visibility
window.testResultsScreen = function () {
  const resultsScreen = document.getElementById("resultsScreen");
  const appContainer = document.querySelector(".app-container");
  const mainContent = document.querySelector(".main-content");

  if (!resultsScreen) {
    console.error("❌ Results screen element not found!");
    return;
  }

  console.log("=== RESULTS SCREEN DEBUG ===");
  console.log("1. Element exists:", !!resultsScreen);
  console.log("2. Parent element:", resultsScreen.parentElement?.className);
  console.log(
    "3. Has .hidden class:",
    resultsScreen.classList.contains("hidden")
  );
  console.log("4. Inline display style:", resultsScreen.style.display);
  console.log(
    "5. Computed display:",
    window.getComputedStyle(resultsScreen).display
  );
  console.log(
    "6. Computed visibility:",
    window.getComputedStyle(resultsScreen).visibility
  );
  console.log(
    "7. Computed opacity:",
    window.getComputedStyle(resultsScreen).opacity
  );

  const rect = resultsScreen.getBoundingClientRect();
  console.log("8. Bounding rect:", {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    visible: rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight,
  });

  console.log(
    "9. App container has header-hidden:",
    appContainer?.classList.contains("header-hidden")
  );
  console.log("10. Main content scrollTop:", mainContent?.scrollTop);
  console.log("11. Window scrollY:", window.scrollY);

  // Try to force show it
  console.log("\n=== FORCING VISIBILITY ===");
  if (mainContent && resultsScreen.parentElement !== mainContent) {
    mainContent.appendChild(resultsScreen);
    console.log("✓ Moved to main-content");
  }

  appContainer?.classList.add("header-hidden");
  resultsScreen.classList.remove("hidden");
  resultsScreen.style.display = "block";
  resultsScreen.style.visibility = "visible";
  resultsScreen.style.opacity = "1";

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (mainContent) mainContent.scrollTop = 0;

  setTimeout(() => {
    const newRect = resultsScreen.getBoundingClientRect();
    const newStyles = window.getComputedStyle(resultsScreen);
    console.log("\n=== AFTER FORCE SHOW ===");
    console.log("Display:", newStyles.display);
    console.log("Visibility:", newStyles.visibility);
    console.log("Top position:", newRect.top);
    console.log("Height:", newRect.height);
    console.log("Is visible?", newRect.top < 100 && newRect.height > 0);

    if (newRect.top > 100 || newRect.height === 0) {
      console.error("❌ STILL NOT VISIBLE! Check CSS for conflicting rules.");
    } else {
      console.log("✓ Results screen should now be visible!");
    }

    // CRITICAL: Also populate the results screen content
    console.log("\n=== POPULATING RESULTS CONTENT ===");
    if (typeof populateResultsScreen === "function") {
      populateResultsScreen();
      console.log("✓ populateResultsScreen() called");

      // Verify content was populated after a short delay
      setTimeout(() => {
        const tabsContainer = document.getElementById("resultsTabs");
        const contentContainer = document.getElementById("resultsContent");
        console.log("Content check:", {
          tabsChildren: tabsContainer?.children.length || 0,
          contentChildren: contentContainer?.children.length || 0,
          tabsHTML: tabsContainer?.innerHTML.substring(0, 100) || "empty",
          contentHTML: contentContainer?.innerHTML.substring(0, 100) || "empty",
          currentStateConcerns:
            typeof currentState !== "undefined"
              ? currentState.selectedConcerns
              : "not defined",
        });
      }, 100);
    } else {
      console.error("✗ populateResultsScreen() function not found!");
    }
  }, 200);
};

// ============================================================================
// AIRTABLE CONFIGURATION
// ============================================================================

const AIRTABLE_API_KEY =
  typeof window !== "undefined" && window.AIRTABLE_API_KEY
    ? window.AIRTABLE_API_KEY
    : "patmjhUfBrLAveso9.22cfbb0b5d0967dbfba9d855ad11af6be983b00acb55b394ef663acf751be30b";
const AIRTABLE_BASE_ID =
  typeof window !== "undefined" && window.AIRTABLE_BASE_ID
    ? window.AIRTABLE_BASE_ID
    : "appXblSpAMBQskgzB";
const LEADS_TABLE_NAME = "Web Popup Leads";
const LEADS_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  LEADS_TABLE_NAME
)}`;

// ============================================================================
// PHONE NUMBER FORMATTING & VALIDATION
// ============================================================================

/**
 * Format phone number as user types: (XXX) XXX-XXXX
 */
function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Validate phone number (must be 10 digits)
 */
function isValidPhoneNumber(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10;
}

/**
 * Validate email address
 */
function isValidEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Setup phone formatting and validation on an input field
 */
function setupPhoneInput(inputElement) {
  if (!inputElement) return;

  inputElement.addEventListener("input", function (e) {
    const cursorPos = e.target.selectionStart;
    const oldLength = e.target.value.length;
    e.target.value = formatPhoneNumber(e.target.value);
    const newLength = e.target.value.length;
    const diff = newLength - oldLength;
    e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
  });

  inputElement.addEventListener("blur", function (e) {
    const isValid = isValidPhoneNumber(e.target.value);
    if (e.target.value && !isValid) {
      e.target.classList.add("input-error");
      showInputError(e.target, "Please enter a valid 10-digit phone number");
    } else {
      e.target.classList.remove("input-error");
      hideInputError(e.target);
    }
  });
}

/**
 * Setup email validation on an input field
 */
function setupEmailInput(inputElement) {
  if (!inputElement) return;

  inputElement.addEventListener("blur", function (e) {
    const isValid = isValidEmail(e.target.value);
    if (e.target.value && !isValid) {
      e.target.classList.add("input-error");
      showInputError(e.target, "Please enter a valid email address");
    } else {
      e.target.classList.remove("input-error");
      hideInputError(e.target);
    }
  });
}

/**
 * Show error message below input
 */
function showInputError(inputElement, message) {
  if (!inputElement) return;
  hideInputError(inputElement);
  const errorDiv = document.createElement("div");
  errorDiv.className = "input-error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = "color: #d32f2f; font-size: 12px; margin-top: 4px;";
  inputElement.parentNode.appendChild(errorDiv);
}

/**
 * Hide error message below input
 */
function hideInputError(inputElement) {
  if (!inputElement) return;
  const existingError = inputElement.parentNode?.querySelector(
    ".input-error-message"
  );
  if (existingError) {
    existingError.remove();
  }
}

// ============================================================================
// LEAD SUBMISSION TO AIRTABLE
// ============================================================================

/**
 * Submit a lead to the "Web Popup Leads" table in Airtable
 */
async function submitLeadToAirtable(leadData) {
  try {
    // Get user selections from currentState
    const age = currentState.ageRange
      ? parseInt(currentState.ageRange.split("-")[0])
      : null;
    const selectedConcerns = currentState.selectedConcerns || [];
    const selectedAreas = currentState.selectedAreas || [];

    // Build the Airtable record fields
    const fields = {
      Name: leadData.name || "",
      "Email Address": leadData.email || "",
      "Phone Number": leadData.phone || "",
    };

    // Add Age if available
    if (age) {
      fields["Age"] = age;
    }

    // Add Aesthetic Goals (the free-text message)
    if (leadData.message) {
      fields["Aesthetic Goals"] = leadData.message;
    }

    // Add Concerns (comma-separated list)
    const concernNames = selectedConcerns.map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      return concern ? concern.name : id;
    });
    if (concernNames.length > 0) {
      fields["Concerns"] = concernNames.join(", ");
    }

    console.log("📤 Submitting lead to Airtable:", fields);

    // Make the API request
    const response = await fetch(LEADS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error submitting lead:", result);

      // Try a minimal fallback with just core contact fields
      console.log("🔄 Retrying with minimal fields...");
      const minimalFields = {
        Name: leadData.name || "",
        "Email Address": leadData.email || "",
        "Phone Number": leadData.phone || "",
      };

      if (leadData.message) {
        minimalFields["Aesthetic Goals"] = leadData.message;
      }

      const retryResponse = await fetch(LEADS_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: minimalFields }),
      });

      const retryResult = await retryResponse.json();

      if (retryResponse.ok) {
        console.log("✅ Lead submitted with minimal fields:", retryResult);
        return { success: true, record: retryResult, partial: true };
      } else {
        console.error("❌ Minimal submission also failed:", retryResult);
        return { success: false, error: retryResult };
      }
    }

    console.log("✅ Lead submitted successfully:", result);
    return { success: true, record: result };
  } catch (error) {
    console.error("❌ Error submitting lead:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EARLY LEAD CAPTURE
// ============================================================================

/**
 * Show celebration screen (Great News!)
 */
function showCelebrationScreen() {
  // Hide review screen, show celebration
  const reviewView = document.getElementById("reviewView");
  const celebrationScreen = document.getElementById("celebrationScreen");
  const appContainer = document.querySelector(".app-container");

  if (reviewView) reviewView.classList.add("hidden");
  if (celebrationScreen) {
    celebrationScreen.classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    celebrationScreen.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Hide header (including progress bar) by adding class to app container
  if (appContainer) {
    appContainer.classList.add("header-hidden");
  }

  // Hide back button and next button
  if (backButton) {
    backButton.style.opacity = "0";
    backButton.style.pointerEvents = "none";
  }
  if (nextButton) {
    nextButton.style.display = "none";
  }

  // Get matching cases count
  const matchingCases = getMatchingCasesForConcern(
    currentState.selectedConcerns[0] || ""
  );
  const totalCases = matchingCases.length;

  // Update treatment count
  const treatmentCountEl = document.getElementById("treatmentCount");
  if (treatmentCountEl) {
    treatmentCountEl.textContent =
      totalCases > 0 ? `${totalCases}` : "multiple";
  }

  // CRITICAL: Save state to sessionStorage before showing celebration
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(
      "selectedConcerns",
      JSON.stringify(currentState.selectedConcerns)
    );
    sessionStorage.setItem(
      "selectedAreas",
      JSON.stringify(currentState.selectedAreas)
    );
    if (currentState.ageRange)
      sessionStorage.setItem("ageRange", currentState.ageRange);
    if (currentState.skinType)
      sessionStorage.setItem("skinType", currentState.skinType);
    if (currentState.skinTone)
      sessionStorage.setItem("skinTone", currentState.skinTone);
    console.log("Saved state to sessionStorage:", {
      concerns: currentState.selectedConcerns,
      areas: currentState.selectedAreas,
    });
  }

  // Populate preview items
  const previewItemsEl = document.getElementById("celebrationPreviewItems");
  if (previewItemsEl) {
    const concernNames = currentState.selectedConcerns.slice(0, 3).map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      return concern ? concern.name : id;
    });

    previewItemsEl.innerHTML = concernNames
      .map(
        (name) => `
      <div class="preview-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${escapeHtml(name)}
      </div>
    `
      )
      .join("");
  }

  // Populate thumbnails
  const thumbnailsEl = document.getElementById("celebrationThumbnails");
  if (thumbnailsEl && matchingCases.length > 0) {
    const thumbnails = matchingCases
      .slice(0, 4)
      .map((caseItem) => {
        const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
        return imageUrl
          ? `
        <div class="preview-thumbnail">
          <img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">
        </div>
      `
          : "";
      })
      .filter((html) => html)
      .join("");

    thumbnailsEl.innerHTML = thumbnails;
  }

  // Setup celebration CTA button
  const celebrationCtaButton = document.getElementById("celebrationCtaButton");
  if (celebrationCtaButton) {
    celebrationCtaButton.onclick = function () {
      showLeadCaptureForm();
    };
  }
}

/**
 * Show lead capture form screen
 */
function showLeadCaptureForm() {
  // Hide celebration screen, show lead capture form
  const celebrationScreen = document.getElementById("celebrationScreen");
  const leadCaptureScreen = document.getElementById("leadCaptureScreen");
  const appContainer = document.querySelector(".app-container");

  if (celebrationScreen) celebrationScreen.classList.add("hidden");
  if (leadCaptureScreen) {
    leadCaptureScreen.classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    leadCaptureScreen.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Ensure header stays hidden
  if (appContainer) {
    appContainer.classList.add("header-hidden");
  }

  // Ensure buttons stay hidden
  if (backButton) {
    backButton.style.opacity = "0";
    backButton.style.pointerEvents = "none";
  }
  if (nextButton) {
    nextButton.style.display = "none";
  }

  // Setup form
  setupEarlyLeadForm();
}

/**
 * Setup early lead capture form
 */
function setupEarlyLeadForm() {
  const form = document.getElementById("earlyLeadCaptureForm");
  if (!form) return;

  const emailInput = document.getElementById("earlyCaptureEmail");
  const phoneInput = document.getElementById("earlyCapturePhone");

  if (emailInput) setupEmailInput(emailInput);
  if (phoneInput) setupPhoneInput(phoneInput);

  // Remove existing handlers
  form.onsubmit = null;
  const submitBtn = document.getElementById("leadSubmitBtn");
  const skipBtn = document.getElementById("leadSkipBtn");

  // Set up form submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();
    handleLeadFormSubmit();
    return false;
  });

  // Set up skip button handler
  if (skipBtn) {
    skipBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      skipLeadCapture();
      return false;
    };
  }
}

/**
 * Handle lead form submission
 */
async function handleLeadFormSubmit() {
  const nameInput = document.getElementById("earlyCaptureName");
  const emailInput = document.getElementById("earlyCaptureEmail");
  const phoneInput = document.getElementById("earlyCapturePhone");

  if (!emailInput) {
    console.error("Email input not found");
    proceedToResults();
    return;
  }

  // Get form values
  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : "";

  // Validate required fields
  if (!name) {
    if (nameInput) {
      nameInput.style.borderColor = "#d32f2f";
      nameInput.focus();
      showInputError(nameInput, "Please enter your name");
    }
    return;
  }

  if (!email || !isValidEmail(email)) {
    emailInput.style.borderColor = "#d32f2f";
    emailInput.focus();
    showInputError(emailInput, "Please enter a valid email address");
    return;
  }

  // Validate phone if provided
  if (phone && !isValidPhoneNumber(phone)) {
    if (phoneInput) {
      phoneInput.style.borderColor = "#d32f2f";
      phoneInput.focus();
      showInputError(phoneInput, "Please enter a valid 10-digit phone number");
    }
    return;
  }

  // Format phone if provided
  let formattedPhone = phone;
  if (phone) {
    formattedPhone = formatPhoneNumber(phone);
  }

  // Show loading state
  const submitBtn = document.getElementById("leadSubmitBtn");
  if (submitBtn) {
    submitBtn.innerHTML = "Loading...";
    submitBtn.disabled = true;
  }

  // Build message from concerns
  const concernNames = currentState.selectedConcerns
    .map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      return concern ? concern.name : id;
    })
    .join(", ");

  // Save the lead
  const leadData = {
    name: name,
    email: email,
    phone: formattedPhone,
    source: "Early Lead Capture",
    message: `Interests: ${concernNames}`,
  };

  try {
    const result = await submitLeadToAirtable(leadData);
    console.log("Lead submitted:", result);
  } catch (err) {
    console.error("Lead submission error:", err);
  }

  // Store contact info for later use
  sessionStorage.setItem("user_email", email);
  if (name) {
    sessionStorage.setItem("user_name", name);
  }
  if (formattedPhone) {
    sessionStorage.setItem("user_phone", formattedPhone);
  }

  // Proceed to results
  proceedToResults();
}

/**
 * Skip lead capture and proceed to results
 */
function skipLeadCapture() {
  proceedToResults();
}

/**
 * Proceed to results screen
 */
function proceedToResults() {
  const leadCaptureScreen = document.getElementById("leadCaptureScreen");
  const resultsScreen = document.getElementById("resultsScreen");

  if (leadCaptureScreen) leadCaptureScreen.classList.add("hidden");

  // CRITICAL: Restore state from sessionStorage BEFORE showing results
  if (typeof sessionStorage !== "undefined") {
    try {
      const storedConcerns = sessionStorage.getItem("selectedConcerns");
      if (storedConcerns) {
        const parsed = JSON.parse(storedConcerns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedConcerns = parsed;
          console.log("✓ Restored concerns in proceedToResults:", parsed);
        }
      }
      const storedAreas = sessionStorage.getItem("selectedAreas");
      if (storedAreas) {
        const parsed = JSON.parse(storedAreas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentState.selectedAreas = parsed;
        }
      }
      if (
        currentState.ageRange === null ||
        currentState.ageRange === undefined
      ) {
        const storedAge = sessionStorage.getItem("ageRange");
        if (storedAge) currentState.ageRange = storedAge;
      }
      if (
        currentState.skinType === null ||
        currentState.skinType === undefined
      ) {
        const storedSkinType = sessionStorage.getItem("skinType");
        if (storedSkinType) currentState.skinType = storedSkinType;
      }
      if (
        currentState.skinTone === null ||
        currentState.skinTone === undefined
      ) {
        const storedSkinTone = sessionStorage.getItem("skinTone");
        if (storedSkinTone) currentState.skinTone = storedSkinTone;
      }
    } catch (e) {
      console.error("Error restoring state in proceedToResults:", e);
    }
  }

  if (resultsScreen) {
    // Ensure it's in the right place BEFORE showing
    const mainContent = document.querySelector(".main-content");
    if (mainContent && resultsScreen.parentElement !== mainContent) {
      console.log("Moving results screen to main-content in proceedToResults");
      mainContent.appendChild(resultsScreen);
    }
    // Remove hidden class and set inline styles BEFORE calling showResultsScreen
    resultsScreen.classList.remove("hidden");
    resultsScreen.style.display = "block";
    resultsScreen.style.visibility = "visible";
    resultsScreen.style.opacity = "1";
    showResultsScreen();
  }
}

// ============================================================================
// CONSULTATION REQUEST FORM
// ============================================================================

/**
 * Show consultation request modal
 */
function requestConsultation() {
  const modal = document.getElementById("consultationModal");
  if (!modal) return;

  modal.classList.remove("hidden");

  // Setup form inputs
  const phoneInput = document.getElementById("consultationPhone");
  const emailInput = document.getElementById("consultationEmail");
  const nameInput = document.getElementById("consultationName");

  if (phoneInput) setupPhoneInput(phoneInput);
  if (emailInput) setupEmailInput(emailInput);

  // Pre-populate fields from sessionStorage if available
  const storedName = sessionStorage.getItem("user_name");
  const storedEmail = sessionStorage.getItem("user_email");
  const storedPhone = sessionStorage.getItem("user_phone");

  if (storedName && nameInput) {
    nameInput.value = storedName;
  }
  if (storedEmail && emailInput) {
    emailInput.value = storedEmail;
  }
  if (storedPhone && phoneInput) {
    phoneInput.value = storedPhone;
  }

  // Setup form submission
  const form = document.getElementById("consultationForm");
  if (!form) {
    // Form might not exist yet if modal was just opened, wait a bit
    setTimeout(() => {
      const retryForm = document.getElementById("consultationForm");
      if (retryForm) setupConsultationForm(retryForm);
    }, 100);
    return;
  }

  setupConsultationForm(form);

  // Setup close button
  setupConsultationModalCloseButton();
}

/**
 * Setup consultation form submission handler
 */
function setupConsultationForm(form) {
  form.onsubmit = null;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get input elements
    const emailInput = document.getElementById("consultationEmail");
    const phoneInput = document.getElementById("consultationPhone");
    const modal = document.getElementById("consultationModal");

    // Validate before submitting
    const email = emailInput ? emailInput.value : "";
    const phone = phoneInput ? phoneInput.value : "";

    if (!isValidEmail(email)) {
      if (emailInput) {
        showInputError(emailInput, "Please enter a valid email address");
        emailInput.classList.add("input-error");
        emailInput.focus();
      }
      return;
    }

    if (phone && !isValidPhoneNumber(phone)) {
      if (phoneInput) {
        showInputError(
          phoneInput,
          "Please enter a valid 10-digit phone number"
        );
        phoneInput.classList.add("input-error");
        phoneInput.focus();
      }
      return;
    }

    // Gather form data
    const nameInput = document.getElementById("consultationName");
    const messageInput = document.getElementById("consultationMessage");
    const name = nameInput ? nameInput.value.trim() : "";
    const message = messageInput ? messageInput.value : "";

    const leadData = {
      name: name,
      email: email,
      phone: phone,
      message: message,
      source: "Consultation Form",
    };

    // Save to sessionStorage for future use
    if (name) {
      sessionStorage.setItem("user_name", name);
    }
    sessionStorage.setItem("user_email", email);
    if (phone) {
      sessionStorage.setItem("user_phone", phone);
    }

    // Show loading state
    const submitBtn = document.getElementById("consultationSubmitBtn");
    if (submitBtn) {
      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;
    }

    // Submit to Airtable
    try {
      const result = await submitLeadToAirtable(leadData);
      console.log("Consultation request submitted:", result);
    } catch (err) {
      console.error("Consultation submission error:", err);
    }

    // Show success message
    if (modal) {
      const modalContent = modal.querySelector(".consultation-modal-content");
      if (modalContent) {
        modalContent.innerHTML = `
          <div class="consultation-success">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 class="consultation-success-title">Consultation Request Received!</h2>
            <p class="consultation-success-message">We've received your consultation request and will contact you shortly to schedule your personalized facial analysis.</p>
            <button class="consultation-close-btn" onclick="closeConsultationModal()">Got it!</button>
          </div>
        `;
      }
    }
  });
}

/**
 * Close consultation modal
 */
function closeConsultationModal() {
  const modal = document.getElementById("consultationModal");
  if (modal) {
    modal.classList.add("hidden");

    // Reset form and restore original content
    const modalContent = modal.querySelector(".consultation-modal-content");
    if (modalContent) {
      // Restore original form HTML
      modalContent.innerHTML = `
        <div class="consultation-modal-header">
          <h2 class="consultation-modal-title">Book Your In-Clinic Consultation</h2>
          <p class="consultation-modal-subtitle">Get personalized treatment recommendations based on your goals</p>
        </div>

        <form id="consultationForm" class="consultation-form">
          <div class="consultation-form-field">
            <input
              type="text"
              id="consultationName"
              name="name"
              placeholder="Full Name"
              required
              class="consultation-input"
            />
          </div>
          <div class="consultation-form-field">
            <input
              type="email"
              id="consultationEmail"
              name="email"
              placeholder="Email Address"
              required
              class="consultation-input"
            />
          </div>
          <div class="consultation-form-field">
            <input
              type="tel"
              id="consultationPhone"
              name="phone"
              placeholder="Phone Number"
              class="consultation-input"
            />
          </div>
          <div class="consultation-form-field">
            <textarea
              id="consultationMessage"
              name="message"
              placeholder="Tell us about your aesthetic goals (optional)"
              rows="4"
              class="consultation-textarea"
            ></textarea>
          </div>
          <button
            type="submit"
            class="consultation-submit-button"
            id="consultationSubmitBtn"
          >
            Request Consultation
          </button>
        </form>
      `;

      // Re-setup the form
      requestConsultation();
    }
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Show a toast notification message
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'info', 'warning', 'error', 'success'
 */
function showToast(message, type = "info") {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;

  // Add to body
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Make functions available globally
window.requestConsultation = requestConsultation;
window.closeConsultationModal = closeConsultationModal;
window.skipLeadCapture = skipLeadCapture;

// Setup consultation modal close button event listener
function setupConsultationModalCloseButton() {
  const closeBtn =
    document.getElementById("consultationModalClose") ||
    document.querySelector(".consultation-modal-close");
  if (closeBtn) {
    // Remove any existing listeners by cloning
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    // Add click event listener
    newCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeConsultationModal();
    });
  }

  // Prevent clicks inside modal from closing it
  const modalContent = document.querySelector(".consultation-modal");
  if (modalContent) {
    modalContent.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // Also handle clicking on the overlay (outside the modal)
  const modalOverlay = document.getElementById("consultationModal");
  if (modalOverlay) {
    // Use event delegation - check if click is on overlay itself
    modalOverlay.addEventListener("click", function (e) {
      // Only close if clicking directly on the overlay background, not on the modal content
      if (e.target === modalOverlay) {
        closeConsultationModal();
      }
    });
  }
}

// Handle back button click
function handleBackClick() {
  // Check if we're on results screen
  const resultsScreen = document.getElementById("resultsScreen");
  const appContainer = document.querySelector(".app-container");
  if (resultsScreen && !resultsScreen.classList.contains("hidden")) {
    // Go back to lead capture form
    resultsScreen.classList.add("hidden");
    const leadCaptureScreen = document.getElementById("leadCaptureScreen");
    if (leadCaptureScreen) {
      leadCaptureScreen.classList.remove("hidden");
    }
    return;
  }

  // Check if we're on lead capture form screen
  const leadCaptureScreen = document.getElementById("leadCaptureScreen");
  if (leadCaptureScreen && !leadCaptureScreen.classList.contains("hidden")) {
    // Go back to celebration screen (header stays hidden)
    leadCaptureScreen.classList.add("hidden");
    const celebrationScreen = document.getElementById("celebrationScreen");
    if (celebrationScreen) {
      celebrationScreen.classList.remove("hidden");
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      celebrationScreen.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  // Check if we're on celebration screen
  const celebrationScreen = document.getElementById("celebrationScreen");
  if (celebrationScreen && !celebrationScreen.classList.contains("hidden")) {
    // Go back to review screen
    celebrationScreen.classList.add("hidden");
    const reviewView = document.getElementById("reviewView");
    if (reviewView) {
      reviewView.classList.remove("hidden");
      // Restore header
      if (appContainer) {
        appContainer.classList.remove("header-hidden");
      }
      if (backButton) {
        backButton.style.opacity = "1";
        backButton.style.pointerEvents = "auto";
      }
      if (nextButton) {
        nextButton.style.display = "flex";
      }
    }
    return;
  }

  // Check if we're on review screen
  const reviewView = document.getElementById("reviewView");
  if (reviewView && !reviewView.classList.contains("hidden")) {
    // Go back to last form step
    reviewView.classList.add("hidden");
    showStep(FORM_STEPS.length - 1);
    return;
  }

  // Check if we're on the detail view (determined skin type screen)
  const detailView = document.getElementById("detailView");
  if (detailView && !detailView.classList.contains("hidden")) {
    // From detail view, go back to questions
    detailView.classList.add("hidden");
    if (questionsView) {
      questionsView.classList.remove("hidden");
      currentState.inNotSureFlow = true;
      // Show last question
      currentState.notSureQuestionIndex = notSureQuestions.length - 1;
      loadNotSureQuestion(currentState.notSureQuestionIndex);
    }
    updateProgress();
    updateNextButton();
    return;
  }

  if (currentState.inNotSureFlow) {
    if (currentState.notSureQuestionIndex > 0) {
      currentState.notSureQuestionIndex--;
      loadNotSureQuestion(currentState.notSureQuestionIndex);
      updateProgress();
    } else {
      // Go back to skin type selection
      questionsView?.classList.add("hidden");
      skinTypeView?.classList.remove("hidden");
      currentState.inNotSureFlow = false;
      currentState.skinType = null;
      updateSkinTypeSelection(null);
      if (characteristicsContainer) {
        characteristicsContainer.innerHTML = "";
        characteristicsContainer.style.display = "none";
      }
    }
    updateNextButton();
    return;
  }

  // Go to previous step
  if (currentState.currentStep > 0) {
    showStep(currentState.currentStep - 1);
  }
}

// Update progress bar
function updateProgress() {
  if (!progressFill) {
    progressFill = document.getElementById("progressFill");
  }
  if (!progressFill) return;

  let progress = 0;

  // Check if we're on the detail view (determined skin type screen)
  const detailView = document.getElementById("detailView");
  const isOnDetailView = detailView && !detailView.classList.contains("hidden");

  if (currentState.inNotSureFlow) {
    // When in not sure flow, maintain the skin type step's progress
    // Skin type is step index 3, so progress should be ((3 + 1) / 6) * 100 = ~66.67%
    // Add a small increment for each question answered to show progress within the flow
    const skinTypeStepProgress = ((3 + 1) / FORM_STEPS.length) * 100; // ~66.67%
    const questionProgress =
      (currentState.notSureQuestionIndex + 1) / notSureQuestions.length; // 0.5 for first question, 1.0 for second
    // Add up to 5% progress for answering questions within the not sure flow
    progress = skinTypeStepProgress + questionProgress * 5;
  } else if (isOnDetailView) {
    // When showing the determined skin type screen, maintain at least the skin type step progress
    // Skin type is step index 3
    const skinTypeStepProgress = ((3 + 1) / FORM_STEPS.length) * 100; // ~66.67%
    // Get current progress to ensure we don't go backwards
    const currentProgress = parseFloat(progressFill.style.width) || 0;
    progress = Math.max(skinTypeStepProgress, currentProgress);
  } else {
    // Calculate progress based on current step
    // Step 0 (concerns) should be at ~14% (1/6), step 1 (areas) at ~28%, etc.
    // We have 6 steps total, so each step is ~16.67%
    const stepProgress =
      ((currentState.currentStep + 1) / FORM_STEPS.length) * 100;
    progress = Math.min(stepProgress, 100);
  }

  progressFill.style.width = `${progress}%`;
}

// Update next button state
function updateNextButton() {
  if (!nextButton) return;

  // Check if we're on detail view (determined skin type screen)
  const detailView = document.getElementById("detailView");
  if (detailView && !detailView.classList.contains("hidden")) {
    nextButton.disabled = false;
    return;
  }

  // Check if we're on review screen
  const reviewView = document.getElementById("reviewView");
  if (reviewView && !reviewView.classList.contains("hidden")) {
    nextButton.disabled = false;
    return;
  }

  if (currentState.inNotSureFlow) {
    const hasAnswer =
      currentState.notSureAnswers[currentState.notSureQuestionIndex] !==
      undefined;
    if (nextButton) {
      nextButton.disabled = !hasAnswer;
    }
    return;
  }

  const currentStep = FORM_STEPS[currentState.currentStep];
  let canProceed = false;

  if (currentStep === "concerns") {
    canProceed = currentState.selectedConcerns.length > 0;
  } else if (currentStep === "areas") {
    canProceed = currentState.selectedAreas.length > 0;
  } else if (currentStep === "age") {
    canProceed = currentState.ageRange !== null;
  } else if (currentStep === "skinType") {
    canProceed = currentState.skinType !== null;
  } else if (currentStep === "skinTone") {
    canProceed = currentState.skinTone !== null;
  } else if (currentStep === "ethnicBackground") {
    // Optional, can proceed without selection
    canProceed = true;
  }

  if (nextButton) {
    nextButton.disabled = !canProceed;
  }
}

// Set actual viewport height for iOS Safari compatibility
function setActualViewportHeight() {
  // Get the actual viewport height (accounts for iOS Safari address bar)
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--actual-vh", `${vh * 100}px`);
}

// Helper function to ensure results screen is in correct location
function ensureResultsScreenInMainContent() {
  const resultsScreen = document.getElementById("resultsScreen");
  const mainContent = document.querySelector(".main-content");
  if (
    resultsScreen &&
    mainContent &&
    resultsScreen.parentElement !== mainContent
  ) {
    console.log(
      "Fixing: Moving results screen from",
      resultsScreen.parentElement?.className,
      "to main-content"
    );
    mainContent.appendChild(resultsScreen);
    return true;
  }
  return false;
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setActualViewportHeight();
    init();
    // Double-check results screen location after init
    setTimeout(ensureResultsScreenInMainContent, 100);
  });
} else {
  // DOM already loaded
  setActualViewportHeight();
  init();
  // Double-check results screen location after init
  setTimeout(ensureResultsScreenInMainContent, 100);
}

// Update on resize and orientation change (important for iOS Safari)
window.addEventListener("resize", setActualViewportHeight);
window.addEventListener("orientationchange", function () {
  // Small delay to ensure accurate height after orientation change
  setTimeout(setActualViewportHeight, 100);
});

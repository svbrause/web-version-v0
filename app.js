// Airtable Configuration
// Read from window variables (set in HTML) or environment variables
const AIRTABLE_API_KEY = 
  typeof window !== 'undefined' && window.AIRTABLE_API_KEY
    ? window.AIRTABLE_API_KEY
    : (typeof process !== 'undefined' && process.env.AIRTABLE_API_KEY)
      ? process.env.AIRTABLE_API_KEY
      : null;
const AIRTABLE_BASE_ID = 
  typeof window !== 'undefined' && window.AIRTABLE_BASE_ID
    ? window.AIRTABLE_BASE_ID
    : (typeof process !== 'undefined' && process.env.AIRTABLE_BASE_ID)
      ? process.env.AIRTABLE_BASE_ID
      : "appXblSpAMBQskgzB";
// Validate API key is set
if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY is not set. Please configure it in your environment variables or HTML.');
  console.error('   For Vercel: Set AIRTABLE_API_KEY in Settings → Environment Variables');
  console.error('   For local: Set window.AIRTABLE_API_KEY in your HTML file');
}

const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// ============================================================================
// DISCOUNT OFFER SYSTEM
// ============================================================================

/**
 * Discount offer configuration
 */
const DISCOUNT_OFFERS = {
  // First consultation discount
  firstConsultation: {
    id: "FIRST50",
    amount: 50,
    type: "dollars",
    description: "$50 off your first consultation",
    scarcity: "Limited time offer",
    personalized: true,
    applicableTo: ["consultation"],
  },

  // Treatment-specific discounts (can be applied to certain treatments)
  injectables: {
    id: "INJECT50",
    amount: 50,
    type: "dollars",
    description: "$50 off injectable treatments",
    scarcity: "New patient special",
    personalized: true,
    applicableTo: ["BOTOX", "Dermal Fillers", "Xeomin", "Lip Fillers"],
  },

  // Comprehensive plan discount
  comprehensivePlan: {
    id: "PLAN75",
    amount: 75,
    type: "dollars",
    description: "$75 off comprehensive treatment plans",
    scarcity: "Book within 48 hours",
    personalized: true,
    applicableTo: ["consultation", "treatment-plan"],
  },
};

/**
 * Get personalized discount offer based on user selections
 */
function getPersonalizedDiscount() {
  const selectedIssues = userSelections.selectedIssues || [];
  const overallGoals = userSelections.overallGoals || [];

  // Check if user has injectable-related concerns
  const injectableKeywords = [
    "wrinkle",
    "line",
    "lip",
    "volume",
    "filler",
    "botox",
  ];
  const hasInjectableConcerns = selectedIssues.some((issue) =>
    injectableKeywords.some((keyword) => issue.toLowerCase().includes(keyword))
  );

  // Check if user has multiple concerns (comprehensive plan)
  const hasMultipleConcerns =
    selectedIssues.length >= 2 || overallGoals.length >= 2;

  // Return appropriate discount
  if (hasInjectableConcerns) {
    return DISCOUNT_OFFERS.injectables;
  } else if (hasMultipleConcerns) {
    return DISCOUNT_OFFERS.comprehensivePlan;
  } else {
    return DISCOUNT_OFFERS.firstConsultation;
  }
}

/**
 * Check if a case/treatment qualifies for discount
 */
function getCaseDiscount(caseItem) {
  const discount = getPersonalizedDiscount();
  const treatmentName = caseItem.name || "";
  const treatmentLower = treatmentName.toLowerCase();

  // Check if treatment matches discount criteria
  if (
    discount.applicableTo.some((term) =>
      treatmentLower.includes(term.toLowerCase())
    )
  ) {
    return discount;
  }

  // Default: first consultation discount applies to all
  return DISCOUNT_OFFERS.firstConsultation;
}

/**
 * Store redeemed discount in session
 */
function redeemDiscount(discountId) {
  const redeemedDiscounts = JSON.parse(
    sessionStorage.getItem("redeemedDiscounts") || "[]"
  );
  if (!redeemedDiscounts.includes(discountId)) {
    redeemedDiscounts.push(discountId);
    sessionStorage.setItem(
      "redeemedDiscounts",
      JSON.stringify(redeemedDiscounts)
    );
    trackEvent("discount_redeemed", { discountId });
    return true;
  }
  return false;
}

/**
 * Check if discount has been redeemed
 */
function isDiscountRedeemed(discountId) {
  const redeemedDiscounts = JSON.parse(
    sessionStorage.getItem("redeemedDiscounts") || "[]"
  );
  return redeemedDiscounts.includes(discountId);
}

/**
 * Get discount code for display
 */
function getDiscountCode(discountId) {
  return discountId; // Could be enhanced with code generation
}

// Leads Table Configuration
const LEADS_TABLE_NAME = "Web Popup Leads";
const LEADS_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  LEADS_TABLE_NAME
)}`;

// ============================================================================
// ANALYTICS & EVENT TRACKING
// ============================================================================

/**
 * Track a user action/event for analytics
 * Logs to console and sends to Microsoft Clarity when enabled
 *
 * @param {string} eventName - Name of the event (e.g., "form_started", "case_viewed")
 * @param {Object} eventData - Additional event data
 */
function trackEvent(eventName, eventData = {}) {
  const timestamp = new Date().toISOString();
  const sessionId = getOrCreateSessionId();

  const event = {
    event: eventName,
    timestamp,
    sessionId,
    ...eventData,
  };

  // Always log to console for debugging
  console.log(`📊 [Event] ${eventName}`, eventData);

  // Send to Microsoft Clarity if enabled
  if (window.ANALYTICS_ENABLED && typeof window.clarity === "function") {
    // Clarity custom tags for filtering sessions
    window.clarity("set", eventName, JSON.stringify(eventData));

    // For important events, also set as a custom identifier
    if (
      eventName === "form_submitted" ||
      eventName === "consultation_requested"
    ) {
      window.clarity("identify", eventData.email || sessionId);
    }
  }

  // Store events locally for session replay if needed
  storeEventLocally(event);
}

/**
 * Get or create a unique session ID
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Store events locally (useful for debugging or custom analytics)
 */
function storeEventLocally(event) {
  try {
    const events = JSON.parse(localStorage.getItem("analytics_events") || "[]");
    events.push(event);
    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
      events.shift();
    }
    localStorage.setItem("analytics_events", JSON.stringify(events));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get all stored events for the current session
 */
function getStoredEvents() {
  try {
    return JSON.parse(localStorage.getItem("analytics_events") || "[]");
  } catch (e) {
    return [];
  }
}

/**
 * Track page/screen views
 */
function trackScreenView(screenName) {
  trackEvent("screen_view", { screen: screenName });
}

// ============================================================================
// LEAD SUBMISSION TO AIRTABLE
// ============================================================================

/**
 * Submit a lead to the "Web Popup Leads" table in Airtable
 *
 * @param {Object} leadData - The lead information
 * @param {string} leadData.name - Full name
 * @param {string} leadData.email - Email address
 * @param {string} leadData.phone - Phone number
 * @param {string} leadData.message - Optional message/notes
 * @param {string} leadData.source - Source of the lead (e.g., "Consultation Form", "Info Request")
 * @returns {Promise<Object>} - The created record or error
 */
async function submitLeadToAirtable(leadData) {
  try {
    // Gather all user session data
    const age = userSelections.age || null;
    const overallGoals = userSelections.overallGoals || [];
    const selectedIssues = userSelections.selectedIssues || [];
    const goalIssues = getGoalIssues(); // Issues user added to goals
    const goalCases = getGoalCases(); // Case IDs user liked/added to goals

    // Map goal slugs to display names for Airtable
    const goalDisplayNames = {
      "facial-balancing": "Facial Balancing",
      "anti-aging": "Anti-Aging",
      "skin-rejuvenation": "Skin Rejuvenation",
      "natural-look": "Natural Look",
    };

    // Convert goal slugs to display names
    const goalsForAirtable = overallGoals.map(
      (slug) => goalDisplayNames[slug] || slug
    );

    // Build the Airtable record fields
    // ONLY include fields that definitely exist in your Airtable table
    const fields = {
      Name: leadData.name || "",
      "Email Address": leadData.email || "",
      "Phone Number": leadData.phone || "",
    };
    
    // Add Offer Claimed field if this is an offer claim
    if (leadData.offerClaimed !== undefined) {
      fields["Offer Claimed"] = leadData.offerClaimed;
    }

    // Add Age if available (as number)
    if (age) {
      fields["Age"] = parseInt(age, 10);
    }

    // Add Aesthetic Goals (the free-text message) - Long text field
    if (leadData.message) {
      fields["Aesthetic Goals"] = leadData.message;
    }

    // ============================================================================
    // OPTIONAL FIELDS - These may cause 422 errors if not configured in Airtable
    // Comment out any field that doesn't exist in your table
    // ============================================================================

    // Goals - Multiple Select field
    // Make sure options exactly match: "Facial Balancing", "Anti-Aging", "Skin Rejuvenation", "Natural Look"
    if (goalsForAirtable.length > 0) {
      // For Multiple Select, send the full array of goals
      fields["Goals"] = goalsForAirtable;
    }

    // Concerns - Long text field (comma-separated list)
    // Only include if this field exists in your table
    const allConcerns = [...new Set([...selectedIssues, ...goalIssues])];
    if (allConcerns.length > 0) {
      fields["Concerns"] = allConcerns.join(", ");
    }

    // Liked Photos - Link to Photos table
    // IMPORTANT: This requires the field to be configured as "Link to another record" pointing to Photos
    // Comment this out if not configured
    if (goalCases.length > 0) {
      fields["Liked Photos"] = goalCases;
    }

    console.log("📤 Submitting lead to Airtable:", fields);
    console.log("   Field names:", Object.keys(fields));

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
      console.error("   Fields sent:", Object.keys(fields));

      // Log specific error details from Airtable
      if (result.error) {
        console.error("   Airtable error type:", result.error.type);
        console.error("   Airtable error message:", result.error.message);
      }

      // Try a minimal fallback with just core contact fields
      console.log("🔄 Retrying with minimal fields...");
      const minimalFields = {
        Name: leadData.name || "",
        "Email Address": leadData.email || "",
        "Phone Number": leadData.phone || "",
      };

      // Add message to a Notes or Aesthetic Goals field
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
// PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format phone number as user types: (XXX) XXX-XXXX
 */
function formatPhoneNumber(value) {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Format based on length
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

    // Adjust cursor position
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
  hideInputError(inputElement); // Remove existing error first
  const errorDiv = document.createElement("div");
  errorDiv.className = "input-error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText =
    "color: #d32f2f; font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px;";

  // For age input, add to age-input-container if it exists
  if (inputElement.id === "patient-age") {
    const container =
      inputElement.closest(".age-input-container") || inputElement.parentNode;
    container.appendChild(errorDiv);
  } else {
    inputElement.parentNode.appendChild(errorDiv);
  }
}

/**
 * Hide error message below input
 */
function hideInputError(inputElement) {
  if (!inputElement) return;

  // Check in direct parent
  const existingError = inputElement.parentNode?.querySelector(
    ".input-error-message"
  );
  if (existingError) {
    existingError.remove();
  }

  // Also check in age-input-container if it exists
  const ageContainer = inputElement.closest(".age-input-container");
  if (ageContainer) {
    const errorInContainer = ageContainer.querySelector(".input-error-message");
    if (errorInContainer) {
      errorInContainer.remove();
    }
  }

  // Also check in demographic-section
  const demographicSection = inputElement.closest(".demographic-section");
  if (demographicSection) {
    const errorInSection = demographicSection.querySelector(
      ".input-error-message"
    );
    if (errorInSection) {
      errorInSection.remove();
    }
  }
}

// Use REST API with proper pagination - fetch all records
async function fetchAirtableRecords() {
  let allRecords = [];
  let offset = null;
  let pageCount = 0;
  const maxPages = 50; // Safety limit

  do {
    pageCount++;
    let url = AIRTABLE_API_URL;
    const params = new URLSearchParams();
    params.append("pageSize", "100"); // Airtable's max per page
    if (offset) {
      params.append("offset", offset);
    }
    url += "?" + params.toString();

    console.log(
      `Fetching page ${pageCount}${
        offset ? ` (with offset)` : " (first page)"
      }...`
    );

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Airtable API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const pageRecords = data.records || [];
    allRecords = allRecords.concat(pageRecords);

    // Airtable returns offset as a string if there are more records
    offset = data.offset || null;

    console.log(
      `Fetched page ${pageCount}: ${pageRecords.length} records (total so far: ${allRecords.length})`
    );

    // Check if we found the target cases on this page
    const foundPhysiq = pageRecords.some((r) =>
      r.fields?.Name?.toLowerCase().includes("physiq")
    );
    const foundEveresse = pageRecords.some((r) =>
      r.fields?.Name?.toLowerCase().includes("everesse")
    );
    if (foundPhysiq || foundEveresse) {
      console.log(`  ✓ Found target cases on page ${pageCount}!`);
      if (foundPhysiq) {
        const physiqCase = pageRecords.find((r) =>
          r.fields?.Name?.toLowerCase().includes("physiq")
        );
        console.log(`    - PHYSIQ case: "${physiqCase.fields?.Name}"`);
      }
      if (foundEveresse) {
        const everesseCase = pageRecords.find((r) =>
          r.fields?.Name?.toLowerCase().includes("everesse")
        );
        console.log(`    - Everesse case: "${everesseCase.fields?.Name}"`);
      }
    }

    // Continue only if we have an offset (Airtable says there are more records)
    // Stop if no offset (no more records) or we've hit the safety limit
  } while (offset !== null && pageCount < maxPages);

  console.log(
    `✓ Successfully fetched ${allRecords.length} total records from Airtable API (${pageCount} page(s))`
  );

  return { records: allRecords };
}

// Case data storage (will be populated from Airtable)
let caseData = [];

// Issue prevalence data (loaded from JSON)
// Embedded prevalence data (from analysis of 869 patient records)
// This ensures data is always available even when fetch fails (e.g., file:// protocol)
const EMBEDDED_PREVALENCE_DATA = {
  overall: {
    "Under Eye Hollow": {
      percentage: 90.56,
      count: 787,
      ageCorrelation: 0.8416,
    },
    "Nasolabial Folds": { percentage: 84, count: 730, ageCorrelation: 0.9639 },
    "Prejowl Sulcus": { percentage: 81.01, count: 704, ageCorrelation: 0.9298 },
    "Neck Lines": { percentage: 73.99, count: 643, ageCorrelation: -0.1272 },
    "Nasal Tip Too Wide": {
      percentage: 69.62,
      count: 605,
      ageCorrelation: 0.854,
    },
    "Under Eye Wrinkles": {
      percentage: 66.86,
      count: 581,
      ageCorrelation: 0.9817,
    },
    "Excess/Submental Fullness": {
      percentage: 66.05,
      count: 574,
      ageCorrelation: 0.6499,
    },
    "Dark Spots": { percentage: 65.71, count: 571, ageCorrelation: 0.8027 },
    "Marionette Lines": {
      percentage: 64.79,
      count: 563,
      ageCorrelation: 0.9571,
    },
    "Retruded Chin": { percentage: 64.56, count: 561, ageCorrelation: 0.4619 },
    "Mid Cheek Flattening": {
      percentage: 63.87,
      count: 555,
      ageCorrelation: 0.8656,
    },
    "Under Eye Dark Circles": {
      percentage: 61.45,
      count: 534,
      ageCorrelation: 0.4034,
    },
    "Asymmetric Lips": {
      percentage: 53.51,
      count: 465,
      ageCorrelation: -0.1802,
    },
    "Nasal Bone - Too Wide": {
      percentage: 52.13,
      count: 453,
      ageCorrelation: 0.0497,
    },
    "Thin Lips": { percentage: 51.9, count: 451, ageCorrelation: 0.8093 },
    "Forehead Wrinkles": {
      percentage: 51.67,
      count: 449,
      ageCorrelation: 0.9632,
    },
    "Brow Asymmetry": { percentage: 50.98, count: 443, ageCorrelation: 0.415 },
    "Loose Neck Skin": { percentage: 50.52, count: 439, ageCorrelation: 0.936 },
    "Dry Lips": { percentage: 50.06, count: 435, ageCorrelation: 0.7405 },
    "Temporal Hollow": {
      percentage: 49.94,
      count: 434,
      ageCorrelation: 0.8959,
    },
    "Nostril Base - Too Wide": {
      percentage: 49.14,
      count: 427,
      ageCorrelation: 0.1015,
    },
    "Red Spots": { percentage: 47.53, count: 413, ageCorrelation: 0.6851 },
    "Over-Rotated": { percentage: 46.61, count: 405, ageCorrelation: 0.2212 },
    "Dorsal Hump": { percentage: 45.8, count: 398, ageCorrelation: 0.043 },
    "Long Philtral Column": {
      percentage: 45.11,
      count: 392,
      ageCorrelation: 0.8048,
    },
    "Over-Projected": { percentage: 44.76, count: 389, ageCorrelation: 0.0706 },
    "Excess Upper Eyelid Skin": {
      percentage: 44.19,
      count: 384,
      ageCorrelation: 0.9439,
    },
    "Glabella Wrinkles": {
      percentage: 43.84,
      count: 381,
      ageCorrelation: 0.9622,
    },
    "Upper Eye Hollow": {
      percentage: 43.27,
      count: 376,
      ageCorrelation: 0.9129,
    },
    "Crow's Feet Wrinkles": {
      percentage: 42.69,
      count: 371,
      ageCorrelation: 0.9748,
    },
    "Lower Eyelid Bags": {
      percentage: 42.35,
      count: 368,
      ageCorrelation: 0.8735,
    },
    "Crooked Nose": { percentage: 40.85, count: 355, ageCorrelation: -0.3291 },
    "Perioral Wrinkles": {
      percentage: 40.85,
      count: 355,
      ageCorrelation: 0.962,
    },
    "Lacking Philtral Column": {
      percentage: 39.82,
      count: 346,
      ageCorrelation: 0.7476,
    },
    "Upper Eyelid Droop": {
      percentage: 38.44,
      count: 334,
      ageCorrelation: 0.8997,
    },
    Jowls: { percentage: 37.4, count: 325, ageCorrelation: 0.9456 },
    "Under-Rotated": { percentage: 35.56, count: 309, ageCorrelation: 0.7002 },
    "Brow Ptosis": { percentage: 34.18, count: 297, ageCorrelation: 0.901 },
    "Lower Eyelid - Excess Skin": {
      percentage: 32.22,
      count: 280,
      ageCorrelation: 0.9416,
    },
    "Ill-Defined Jawline": {
      percentage: 31.76,
      count: 276,
      ageCorrelation: 0.8667,
    },
    "Asymmetric Chin": {
      percentage: 30.96,
      count: 269,
      ageCorrelation: -0.0428,
    },
    "Platysmal Bands": {
      percentage: 30.26,
      count: 263,
      ageCorrelation: 0.9247,
    },
    Scars: { percentage: 29.34, count: 255, ageCorrelation: -0.6114 },
    "Bunny Lines": { percentage: 28.42, count: 247, ageCorrelation: 0.8816 },
    "Lower Cheeks - Volume Depletion": {
      percentage: 28.08,
      count: 244,
      ageCorrelation: 0.9028,
    },
    "Gummy Smile": { percentage: 27.85, count: 242, ageCorrelation: 0.0917 },
    "Asymmetric Jawline": {
      percentage: 27.04,
      count: 235,
      ageCorrelation: 0.1447,
    },
    "Lip Thinning When Smiling": {
      percentage: 26.35,
      count: 229,
      ageCorrelation: 0.7965,
    },
    "Lower Eyelid Sag": {
      percentage: 24.74,
      count: 215,
      ageCorrelation: 0.8953,
    },
    "Crepey Skin": { percentage: 24.17, count: 210, ageCorrelation: 0.9315 },
    "Over-Projected Chin": {
      percentage: 14.04,
      count: 122,
      ageCorrelation: -0.4098,
    },
    "Cheekbone - Not Prominent": {
      percentage: 13.69,
      count: 119,
      ageCorrelation: 0.3927,
    },
    "Under-Projected": { percentage: 12.2, count: 106, ageCorrelation: 0.6025 },
    "Flat Forehead": { percentage: 11.16, count: 97, ageCorrelation: 0.2549 },
    Whiteheads: { percentage: 6.67, count: 58, ageCorrelation: -0.5687 },
    "Dry Skin": { percentage: 5.29, count: 46, ageCorrelation: 0.3628 },
    "Droopy Tip": { percentage: 4.72, count: 41, ageCorrelation: 0.8084 },
    Blackheads: { percentage: 4.49, count: 39, ageCorrelation: -0.7276 },
  },
  byAgeRange: {
    "Under Eye Hollow": {
      "10-19": { percentage: 33.33, count: 3 },
      "20-29": { percentage: 71.43, count: 30 },
      "30-39": { percentage: 87.38, count: 180 },
      "40-49": { percentage: 93.4, count: 212 },
      "50-59": { percentage: 95.45, count: 189 },
      "60-69": { percentage: 98.73, count: 155 },
      "70-79": { percentage: 94.74, count: 18 },
    },
    "Nasolabial Folds": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 30.95, count: 13 },
      "30-39": { percentage: 72.33, count: 149 },
      "40-49": { percentage: 90.75, count: 206 },
      "50-59": { percentage: 95.45, count: 189 },
      "60-69": { percentage: 98.73, count: 155 },
      "70-79": { percentage: 94.74, count: 18 },
    },
    "Under Eye Wrinkles": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 39.81, count: 82 },
      "40-49": { percentage: 68.72, count: 156 },
      "50-59": { percentage: 90.91, count: 180 },
      "60-69": { percentage: 96.18, count: 151 },
      "70-79": { percentage: 52.63, count: 10 },
    },
    "Forehead Wrinkles": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 23.3, count: 48 },
      "40-49": { percentage: 50.66, count: 115 },
      "50-59": { percentage: 74.75, count: 148 },
      "60-69": { percentage: 80.25, count: 126 },
      "70-79": { percentage: 52.63, count: 10 },
    },
    "Crow's Feet Wrinkles": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 2.38, count: 1 },
      "30-39": { percentage: 13.59, count: 28 },
      "40-49": { percentage: 37.89, count: 86 },
      "50-59": { percentage: 63.64, count: 126 },
      "60-69": { percentage: 76.43, count: 120 },
      "70-79": { percentage: 52.63, count: 10 },
    },
    "Glabella Wrinkles": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 14.56, count: 30 },
      "40-49": { percentage: 42.29, count: 96 },
      "50-59": { percentage: 63.64, count: 126 },
      "60-69": { percentage: 75.16, count: 118 },
      "70-79": { percentage: 47.37, count: 9 },
    },
    "Marionette Lines": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 9.52, count: 4 },
      "30-39": { percentage: 41.26, count: 85 },
      "40-49": { percentage: 66.96, count: 152 },
      "50-59": { percentage: 85.86, count: 170 },
      "60-69": { percentage: 89.81, count: 141 },
      "70-79": { percentage: 57.89, count: 11 },
    },
    "Perioral Wrinkles": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 12.14, count: 25 },
      "40-49": { percentage: 33.04, count: 75 },
      "50-59": { percentage: 59.09, count: 117 },
      "60-69": { percentage: 80.89, count: 127 },
      "70-79": { percentage: 47.37, count: 9 },
    },
    "Brow Asymmetry": {
      "10-19": { percentage: 22.22, count: 2 },
      "20-29": { percentage: 40.48, count: 17 },
      "30-39": { percentage: 46.12, count: 95 },
      "40-49": { percentage: 49.34, count: 112 },
      "50-59": { percentage: 54.55, count: 108 },
      "60-69": { percentage: 63.06, count: 99 },
      "70-79": { percentage: 52.63, count: 10 },
    },
    Jowls: {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 2.38, count: 1 },
      "30-39": { percentage: 8.25, count: 17 },
      "40-49": { percentage: 27.31, count: 62 },
      "50-59": { percentage: 55.56, count: 110 },
      "60-69": { percentage: 78.98, count: 124 },
      "70-79": { percentage: 57.89, count: 11 },
    },
    "Loose Neck Skin": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 20.39, count: 42 },
      "40-49": { percentage: 45.37, count: 103 },
      "50-59": { percentage: 70.2, count: 139 },
      "60-69": { percentage: 89.17, count: 140 },
      "70-79": { percentage: 68.42, count: 13 },
    },
    "Ill-Defined Jawline": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 4.76, count: 2 },
      "30-39": { percentage: 12.14, count: 25 },
      "40-49": { percentage: 26.43, count: 60 },
      "50-59": { percentage: 42.93, count: 85 },
      "60-69": { percentage: 60.51, count: 95 },
      "70-79": { percentage: 47.37, count: 9 },
    },
    "Thin Lips": {
      "10-19": { percentage: 0, count: 0 },
      "20-29": { percentage: 16.67, count: 7 },
      "30-39": { percentage: 35.92, count: 74 },
      "40-49": { percentage: 52.42, count: 119 },
      "50-59": { percentage: 61.62, count: 122 },
      "60-69": { percentage: 75.8, count: 119 },
      "70-79": { percentage: 52.63, count: 10 },
    },
    "Excess/Submental Fullness": {
      "10-19": { percentage: 22.22, count: 2 },
      "20-29": { percentage: 40.48, count: 17 },
      "30-39": { percentage: 58.74, count: 121 },
      "40-49": { percentage: 69.16, count: 157 },
      "50-59": { percentage: 72.22, count: 143 },
      "60-69": { percentage: 79.62, count: 125 },
      "70-79": { percentage: 47.37, count: 9 },
    },
    "Dark Spots": {
      "10-19": { percentage: 11.11, count: 1 },
      "20-29": { percentage: 26.19, count: 11 },
      "30-39": { percentage: 50.97, count: 105 },
      "40-49": { percentage: 66.52, count: 151 },
      "50-59": { percentage: 78.79, count: 156 },
      "60-69": { percentage: 87.26, count: 137 },
      "70-79": { percentage: 52.63, count: 10 },
    },
  },
};

let issuePrevalenceData = EMBEDDED_PREVALENCE_DATA;

// Load prevalence data (will use embedded data as fallback)
async function loadPrevalenceData() {
  try {
    const response = await fetch("issue-prevalence-data.json");
    if (response.ok) {
      const fetchedData = await response.json();
      // Merge fetched data with embedded (fetched takes priority)
      issuePrevalenceData = fetchedData;
      console.log("✓ Loaded issue prevalence data from JSON file");
      console.log(
        `  - ${
          Object.keys(issuePrevalenceData.overall || {}).length
        } issues loaded`
      );
    } else {
      console.log(
        "Using embedded prevalence data (fetch returned " +
          response.status +
          ")"
      );
    }
  } catch (error) {
    console.log(
      "Using embedded prevalence data (fetch failed):",
      error.message
    );
  }
}

// Wait for prevalence data to load (with timeout)
function waitForPrevalenceData(maxWait = 2000) {
  return new Promise((resolve) => {
    if (issuePrevalenceData) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (issuePrevalenceData) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > maxWait) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

// Normalize issue name to match prevalence data keys
function normalizeIssueNameForPrevalence(issueName) {
  if (!issueName) return null;

  // Try exact match first if data is loaded
  if (issuePrevalenceData && issuePrevalenceData.overall) {
    if (issuePrevalenceData.overall[issueName]) {
      return issueName;
    }
  }

  // Try common variations
  const variations = {
    "Excess/Submental Fullness": "Excess/Submental Fullness",
    "Excess Submental Fullness": "Excess/Submental Fullness",
    "Submental Fullness": "Excess/Submental Fullness",
  };

  if (variations[issueName]) {
    return variations[issueName];
  }

  // Return original if no match found
  return issueName;
}

// Get prevalence for an issue
function getIssuePrevalence(issueName) {
  if (!issuePrevalenceData || !issuePrevalenceData.overall) {
    return null;
  }

  // Try exact match first
  if (issuePrevalenceData.overall[issueName]) {
    return issuePrevalenceData.overall[issueName];
  }

  // Try normalized name
  const normalizedName = normalizeIssueNameForPrevalence(issueName);
  if (normalizedName && issuePrevalenceData.overall[normalizedName]) {
    return issuePrevalenceData.overall[normalizedName];
  }

  // Try case-insensitive match
  const allKeys = Object.keys(issuePrevalenceData.overall);
  const caseInsensitiveMatch = allKeys.find(
    (key) => key.toLowerCase() === issueName.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    return issuePrevalenceData.overall[caseInsensitiveMatch];
  }

  // Try partial match (for variations like "Under Eye Wrinkles" vs "Under Eye Wrinkles")
  const partialMatch = allKeys.find((key) => {
    const keyNormalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const issueNormalized = issueName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return keyNormalized === issueNormalized;
  });
  if (partialMatch) {
    return issuePrevalenceData.overall[partialMatch];
  }

  return null;
}

// Get prevalence for an issue at a specific age
function getIssuePrevalenceForAge(issueName, age) {
  if (!issuePrevalenceData || !issuePrevalenceData.byAgeRange) return null;

  // Try exact match first
  if (issuePrevalenceData.byAgeRange[issueName]) {
    const range = getAgeRange(age);
    return issuePrevalenceData.byAgeRange[issueName][range] || null;
  }

  // Try normalized name
  const normalizedName = normalizeIssueNameForPrevalence(issueName);
  if (normalizedName && issuePrevalenceData.byAgeRange[normalizedName]) {
    const range = getAgeRange(age);
    return issuePrevalenceData.byAgeRange[normalizedName][range] || null;
  }

  // Try case-insensitive match
  const allKeys = Object.keys(issuePrevalenceData.byAgeRange);
  const caseInsensitiveMatch = allKeys.find(
    (key) => key.toLowerCase() === issueName.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    const range = getAgeRange(age);
    return issuePrevalenceData.byAgeRange[caseInsensitiveMatch][range] || null;
  }

  // Try partial match
  const partialMatch = allKeys.find((key) => {
    const keyNormalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const issueNormalized = issueName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return keyNormalized === issueNormalized;
  });
  if (partialMatch) {
    const range = getAgeRange(age);
    return issuePrevalenceData.byAgeRange[partialMatch][range] || null;
  }

  return null;
}

// Helper to get age range string
function getAgeRange(age) {
  if (age < 20) return "10-19";
  if (age < 30) return "20-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  if (age < 70) return "60-69";
  return "70-79";
}

// Get human-readable prevalence description with aging context
function getPrevalenceDescription(issueName, userAge = null) {
  const overall = getIssuePrevalence(issueName);
  if (!overall) return null;

  // Find the actual key name used in the data (for age-specific lookup)
  let actualIssueName = issueName;
  if (issuePrevalenceData && issuePrevalenceData.overall) {
    if (issuePrevalenceData.overall[issueName]) {
      actualIssueName = issueName;
    } else {
      const allKeys = Object.keys(issuePrevalenceData.overall);
      const match = allKeys.find(
        (key) =>
          key.toLowerCase() === issueName.toLowerCase() ||
          key.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            issueName.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      if (match) actualIssueName = match;
    }
  }

  const ageSpecific = userAge
    ? getIssuePrevalenceForAge(actualIssueName, userAge)
    : null;
  const percentage = ageSpecific ? ageSpecific.percentage : overall.percentage;
  const roundedPercentage = Math.round(percentage);
  const ageCorrelation = overall.ageCorrelation;

  // Determine if this is age-related
  const isAgeRelated = ageCorrelation && Math.abs(ageCorrelation) > 0.5;
  const increasesWithAge = ageCorrelation && ageCorrelation > 0.5;
  const decreasesWithAge = ageCorrelation && ageCorrelation < -0.5;

  // Create reassuring, normalized language with numbers and aging context
  let description = "";

  if (ageSpecific && userAge) {
    // Age-specific with numbers prominently displayed
    description = `Affects <strong>${roundedPercentage}%</strong> of people in your age group`;

    if (isAgeRelated) {
      if (increasesWithAge) {
        description += ` — this is a natural part of the aging process`;
      } else if (decreasesWithAge) {
        description += ` — this tends to be less common as we age`;
      }
    }
  } else {
    // Overall with numbers prominently displayed
    description = `Affects <strong>${roundedPercentage}%</strong> of people`;

    if (isAgeRelated) {
      if (increasesWithAge) {
        description += ` — becomes more common with age as a natural part of aging`;
      } else if (decreasesWithAge) {
        description += ` — tends to be less common with age`;
      }
    }
  }

  return description;
}

// Get additional aging context for issue overview
function getAgingContext(issueName) {
  const overall = getIssuePrevalence(issueName);
  if (!overall || !overall.ageCorrelation) return null;

  const ageCorrelation = overall.ageCorrelation;
  const isAgeRelated = Math.abs(ageCorrelation) > 0.5;

  if (!isAgeRelated) return null;

  if (ageCorrelation > 0.7) {
    return "This concern is strongly associated with aging—it's a natural part of how our skin and facial structure change over time. Many people experience this as they get older, and it's completely normal.";
  } else if (ageCorrelation > 0.5) {
    return "This concern tends to become more common with age, as our skin naturally loses elasticity and volume over time. This is a normal part of the aging process.";
  } else if (ageCorrelation < -0.7) {
    return "This concern is less common with age—it's more typical in younger individuals.";
  } else if (ageCorrelation < -0.5) {
    return "This concern tends to be less common as we age.";
  }

  return null;
}

// HTML escape function to safely render text in HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Escape HTML but preserve <strong> tags (for prevalence text with formatted numbers)
function escapeHtmlPreserveStrong(text) {
  if (!text) return "";
  // Split by <strong> tags, escape each part separately
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return parts
    .map((part) => {
      if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
        // Extract content, escape it, then wrap back in strong tags
        const content = part.replace(/<\/?strong>/g, "");
        return `<strong>${escapeHtml(content)}</strong>`;
      }
      return escapeHtml(part);
    })
    .join("");
}

// Icon helper function - returns SVG icons (minimalist monochrome)
function getIconSVG(iconName, size = 16) {
  const icons = {
    syringe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><path d="M5 12h14"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    lightning: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    sparkle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`,
    microscope: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M11 11a6 6 0 1 0 0-6 6 6 0 0 0 0 6z"></path></svg>`,
    thread: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    muscle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    eye: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    nose: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M8 8h8M8 16h8"></path></svg>`,
    user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    lips: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    tooth: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 6v6M12 16h.01"></path></svg>`,
    wrench: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    scissors: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`,
    bottle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    pill: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>`,
    lock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starEmpty: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    arrowRight: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    arrowDown: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    arrowRightSmall: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    chat: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    camera: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    bot: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    // Zone icons for treatment areas
    forehead: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2c0-5.52-4.48-10-10-10z"/><path d="M8 10h.01M16 10h.01M12 10h.01"/></svg>`,
    face: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    jawline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 6 4 10v4c0 4 4 8 8 8s8-4 8-8v-4c0-4-4-8-8-8z"/><path d="M8 14h8"/></svg>`,
    chin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 6 4 10v6c0 2 2 4 4 4h8c2 0 4-2 4-4v-6c0-4-4-8-8-8z"/><path d="M10 16h4"/><circle cx="12" cy="12" r="1.5"/></svg>`,
    neck: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 4 4 8v8c0 4 4 6 8 6s8-2 8-6V8c0-4-4-6-8-6z"/><path d="M8 12h8"/><path d="M8 16h8"/></svg>`,
    chest: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 4 4 8v6c0 2 1 3 2 4h12c1-1 2-2 2-4V8c0-4-4-6-8-6z"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>`,
    hands: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/><path d="M6 11h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/><path d="M10 5V3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><path d="M14 5V3a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2"/></svg>`,
    body: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 4 4 8v8c0 4 4 6 8 6s8-2 8-6V8c0-4-4-6-8-6z"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/></svg>`,
    arms: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/><path d="M4 10h16"/><path d="M4 14h16"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/></svg>`,
    skin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    target: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    calendar: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    gift: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    sun: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    droplet: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    zap: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    shield: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  };
  return icons[iconName] || icons.star;
}

// Treatment Modalities Mapping
const treatmentModalities = {
  Filler: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Neurotoxin: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Botox: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Dysport: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Xeomin: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Restylane: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Radiesse: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Sculptra: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  "PRP Filler": {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  PRP: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  "Derma PRP": {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Kybella: {
    name: "Injectables",
    icon: getIconSVG("syringe", 16),
    category: "Injectable",
  },
  Laser: {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Tetra CO2": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Tetra Pro": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "CO2 Laser": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Cool Peel": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "DEKA CO2": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Motus AZ": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Motus AZ+": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Motus Moveo": {
    name: "Laser",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Everesse RF": {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  Everesse: {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Heat/Energy": {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  Heat: {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  Energy: {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  RF: {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  Radiofrequency: {
    name: "RF Treatment",
    icon: getIconSVG("lightning", 16),
    category: "Energy-Based",
  },
  "Chemical Peel": {
    name: "Chemical Peel",
    icon: getIconSVG("sparkle", 16),
    category: "Topical",
  },
  Microneedling: {
    name: "Microneedling",
    icon: getIconSVG("microscope", 16),
    category: "Minimally Invasive",
  },
  "Agnes RF": {
    name: "RF Microneedling",
    icon: getIconSVG("microscope", 16),
    category: "Minimally Invasive",
  },
  Agnes: {
    name: "RF Microneedling",
    icon: getIconSVG("microscope", 16),
    category: "Minimally Invasive",
  },
  "Scarlet SRF": {
    name: "RF Microneedling",
    icon: getIconSVG("microscope", 16),
    category: "Minimally Invasive",
  },
  Scarlet: {
    name: "RF Microneedling",
    icon: getIconSVG("microscope", 16),
    category: "Minimally Invasive",
  },
  Threadlift: {
    name: "Threadlift",
    icon: getIconSVG("thread", 16),
    category: "Minimally Invasive",
  },
  "Fat Grafting": {
    name: "Fat Grafting",
    icon: getIconSVG("muscle", 16),
    category: "Surgical",
  },
  Blepharoplasty: {
    name: "Blepharoplasty",
    icon: getIconSVG("eye", 16),
    category: "Surgical",
  },
  Rhinoplasty: {
    name: "Rhinoplasty",
    icon: getIconSVG("nose", 16),
    category: "Surgical",
  },
  Facelift: {
    name: "Facelift",
    icon: getIconSVG("user", 16),
    category: "Surgical",
  },
  Necklift: {
    name: "Necklift",
    icon: getIconSVG("user", 16),
    category: "Surgical",
  },
  Browlift: {
    name: "Browlift",
    icon: getIconSVG("eye", 16),
    category: "Surgical",
  },
  "Lip Lift": {
    name: "Lip Procedures",
    icon: getIconSVG("lips", 16),
    category: "Surgical",
  },
  "Lip Release": {
    name: "Lip Procedures",
    icon: getIconSVG("lips", 16),
    category: "Surgical",
  },
  Canthopexy: {
    name: "Eye Procedures",
    icon: getIconSVG("eye", 16),
    category: "Surgical",
  },
  "Jaw Reduction": {
    name: "Jaw Procedures",
    icon: getIconSVG("tooth", 16),
    category: "Surgical",
  },
  "Facial Implant": {
    name: "Implants",
    icon: getIconSVG("wrench", 16),
    category: "Surgical",
  },
  "Buccal Fat Removal": {
    name: "Facial Contouring",
    icon: getIconSVG("scissors", 16),
    category: "Surgical",
  },
  Liposuction: {
    name: "Body Contouring",
    icon: getIconSVG("scissors", 16),
    category: "Surgical",
  },
  "Oral/Topical": {
    name: "Topical",
    icon: getIconSVG("bottle", 16),
    category: "Topical",
  },
  AquaFirmeXS: {
    name: "Facial Treatment",
    icon: getIconSVG("sparkle", 16),
    category: "Topical",
  },
  AquaFirme: {
    name: "Facial Treatment",
    icon: getIconSVG("sparkle", 16),
    category: "Topical",
  },
  "PHYSIQ 360": {
    name: "Body Contouring",
    icon: getIconSVG("scissors", 16),
    category: "Energy-Based",
  },
  PHYSIQ: {
    name: "Body Contouring",
    icon: getIconSVG("scissors", 16),
    category: "Energy-Based",
  },
  DeRive: {
    name: "Hair Treatment",
    icon: getIconSVG("bottle", 16),
    category: "Topical",
  },
  "Hair Wellness": {
    name: "Hair Treatment",
    icon: getIconSVG("bottle", 16),
    category: "Topical",
  },
};

// Surgical treatment keywords to filter out
const SURGICAL_KEYWORDS = [
  "jaw reduction",
  "jaw surgery",
  "rhinoplasty",
  "blepharoplasty",
  "facelift",
  "necklift",
  "browlift",
  "lip lift",
  "lip release",
  "canthopexy",
  "facial implant",
  "buccal fat removal",
  "liposuction",
  "surgery",
  "surgical",
  "implant",
  "reduction surgery",
];

/**
 * Check if a case involves surgical treatment
 * @param {Object} caseItem - The case object
 * @returns {boolean} - True if the case involves surgical treatment
 */
function isSurgicalCase(caseItem) {
  if (!caseItem) return false;

  // FIRST: Check the "Surgical (from General Treatments)" field from Airtable
  // This is the primary source of truth
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

  // Fallback to keyword-based detection if field is missing or invalid
  const caseName =
    typeof caseItem.name === "string"
      ? caseItem.name.toLowerCase()
      : String(caseItem.name || "").toLowerCase();
  const treatment =
    typeof caseItem.treatment === "string"
      ? caseItem.treatment.toLowerCase()
      : String(caseItem.treatment || "").toLowerCase();

  // Handle matchingCriteria - it might be an array, string, or other type
  let matchingCriteria = [];
  if (Array.isArray(caseItem.matchingCriteria)) {
    matchingCriteria = caseItem.matchingCriteria.map((c) => {
      if (typeof c === "string") return c.toLowerCase();
      return String(c || "").toLowerCase();
    });
  } else if (typeof caseItem.matchingCriteria === "string") {
    matchingCriteria = [caseItem.matchingCriteria.toLowerCase()];
  } else if (caseItem.matchingCriteria) {
    matchingCriteria = [String(caseItem.matchingCriteria).toLowerCase()];
  }

  // Handle solved field - it might be a string, array, or other type
  let solvedArray = [];
  if (Array.isArray(caseItem.solved)) {
    solvedArray = caseItem.solved.map((s) => {
      if (typeof s === "string") return s.toLowerCase();
      return String(s || "").toLowerCase();
    });
  } else if (typeof caseItem.solved === "string") {
    solvedArray = [caseItem.solved.toLowerCase()];
  } else if (caseItem.solved) {
    // Try to convert to string
    solvedArray = [String(caseItem.solved).toLowerCase()];
  }

  // Check case name
  for (const keyword of SURGICAL_KEYWORDS) {
    if (caseName.includes(keyword)) {
      return true;
    }
  }

  // Check treatment field
  for (const keyword of SURGICAL_KEYWORDS) {
    if (treatment.includes(keyword)) {
      return true;
    }
  }

  // Check matching criteria
  for (const criteria of matchingCriteria) {
    for (const keyword of SURGICAL_KEYWORDS) {
      if (criteria.includes(keyword)) {
        return true;
      }
    }
  }

  // Check solved field
  for (const solved of solvedArray) {
    for (const keyword of SURGICAL_KEYWORDS) {
      if (solved.includes(keyword)) {
        return true;
      }
    }
  }

  // Check if treatment modality is surgical
  const modality = getTreatmentModality(caseItem.name);
  if (modality && modality.category === "Surgical") {
    return true;
  }

  return false;
}

/**
 * Filter out surgical cases from an array of cases
 * @param {Array} cases - Array of case objects
 * @returns {Array} - Filtered array with only non-surgical cases
 */
function filterNonSurgicalCases(cases) {
  if (!cases || !Array.isArray(cases)) return [];
  return cases.filter((caseItem) => !isSurgicalCase(caseItem));
}

// Extract treatment name from case title (e.g., "Resolve X with Filler" -> "Filler")
function extractTreatmentName(caseName) {
  // Pattern: "Resolve [Issue] with [Treatment]" or similar
  const withMatch = caseName.match(/\s+with\s+(.+)$/i);
  if (withMatch) {
    return withMatch[1].trim();
  }

  // Pattern: "[Treatment] for [Issue]" or "[Treatment] to [Issue]"
  const forMatch = caseName.match(/^(.+?)\s+(?:for|to)\s+/i);
  if (forMatch) {
    return forMatch[1].trim();
  }

  // If no pattern matches, return the full name
  return caseName;
}

function getTreatmentModality(treatmentName) {
  if (!treatmentName)
    return {
      name: "Treatment",
      icon: getIconSVG("pill", 16),
      category: "General",
    };

  const nameLower = treatmentName.toLowerCase();
  for (const [key, value] of Object.entries(treatmentModalities)) {
    if (nameLower.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default fallback
  return {
    name: "Treatment",
    icon: getIconSVG("pill", 16),
    category: "General",
  };
}

// Map backend issue names to positive display names
const issueDisplayNames = {
  // Forehead
  "Forehead Wrinkles": "Smooth Forehead",
  "Glabella Wrinkles": "Smooth Glabella",
  "Brow Asymmetry": "Balance Brows",
  "Flat Forehead": "Enhance Forehead Contour",
  "Brow Ptosis": "Lift Brows",
  "Temporal Hollow": "Restore Temple Volume",
  // Eyes
  "Crow's Feet Wrinkles": "Smooth Crow's Feet",
  "Under Eye Wrinkles": "Smooth Under Eye Area",
  "Under Eye Dark Circles": "Brighten Under Eye Area",
  "Excess Upper Eyelid Skin": "Tighten Upper Eyelids",
  "Lower Eyelid - Excess Skin": "Tighten Lower Eyelids",
  "Upper Eyelid Droop": "Lift Upper Eyelids",
  "Lower Eyelid Sag": "Lift Lower Eyelids",
  "Lower Eyelid Bags": "Reduce Under Eye Bags",
  "Under Eye Hollow": "Restore Under Eye Volume",
  "Upper Eye Hollow": "Restore Upper Eye Volume",
  // Cheeks
  "Mid Cheek Flattening": "Restore Mid Cheek Volume",
  "Cheekbone - Not Prominent": "Enhance Cheekbones",
  "Heavy Lateral Cheek": "Contour Lateral Cheeks",
  "Lower Cheeks - Volume Depletion": "Restore Lower Cheek Volume",
  // Nose
  "Crooked Nose": "Straighten Nose",
  "Droopy Tip": "Lift Nasal Tip",
  "Dorsal Hump": "Smooth Nose Profile",
  "Tip Droop When Smiling": "Support Nasal Tip",
  // Lips
  "Thin Lips": "Enhance Lip Volume",
  "Lacking Philtral Column": "Define Philtral Column",
  "Long Philtral Column": "Balance Philtral Column",
  "Gummy Smile": "Balance Smile",
  "Asymmetric Lips": "Balance Lips",
  "Dry Lips": "Hydrate Lips",
  "Lip Thinning When Smiling": "Support Lip Volume",
  // Chin/Jaw
  "Retruded Chin": "Advance Chin",
  "Over-Projected Chin": "Balance Chin Projection",
  "Asymmetric Chin": "Balance Chin",
  Jowls: "Define Jawline",
  "Ill-Defined Jawline": "Define Jawline",
  "Asymmetric Jawline": "Balance Jawline",
  "Masseter Hypertrophy": "Contour Jaw",
  "Prejowl Sulcus": "Smooth Prejowl Area",
  // Neck
  "Neck Lines": "Smooth Neck",
  "Loose Neck Skin": "Tighten Neck",
  "Platysmal Bands": "Smooth Neck Bands",
  "Excess/Submental Fullness": "Contour Neck",
  // Skin
  "Dark Spots": "Even Skin Tone",
  "Red Spots": "Calm Skin",
  Scars: "Improve Skin Texture",
  "Dry Skin": "Hydrate Skin",
  Whiteheads: "Clear Skin",
  Blackheads: "Refine Pores",
  "Crepey Skin": "Smooth Skin Texture",
  "Nasolabial Folds": "Smooth Nasolabial Folds",
  "Marionette Lines": "Smooth Marionette Lines",
  "Bunny Lines": "Smooth Bunny Lines",
  "Perioral Wrinkles": "Smooth Perioral Area",
};

// Areas and Issues data structure (backend names)
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
  Body: ["Unwanted Hair", "Stubborn Fat"],
};

// Make areasAndIssues globally accessible
window.areasAndIssues = areasAndIssues;

// Function to get display name for an issue - now just returns the backend name
function getIssueDisplayName(backendName) {
  // Return positive suggestion if available, otherwise return backend name
  return issueDisplayNames[backendName] || backendName;
}

function getIssuePositiveSuggestion(backendName) {
  // Get the positive suggestion version of the issue
  return issueDisplayNames[backendName] || backendName;
}

// Group issues into categories
const issueCategories = {
  Wrinkling: [
    "Forehead Wrinkles",
    "Glabella Wrinkles",
    "Crow's Feet Wrinkles",
    "Under Eye Wrinkles",
    "Perioral Wrinkles",
    "Bunny Lines",
    "Nasolabial Folds",
    "Marionette Lines",
    "Neck Lines",
  ],
  "Volume Loss": [
    "Temporal Hollow",
    "Mid Cheek Flattening",
    "Lower Cheeks - Volume Depletion",
    "Under Eye Hollow",
    "Upper Eye Hollow",
    "Prejowl Sulcus",
  ],
  "Skin Quality": [
    "Dark Spots",
    "Red Spots",
    "Scars",
    "Dry Skin",
    "Whiteheads",
    "Blackheads",
    "Crepey Skin",
    "Under Eye Dark Circles",
  ],
  "Structure & Definition": [
    "Ill-Defined Jawline",
    "Cheekbone - Not Prominent",
    "Retruded Chin",
    "Over-Projected Chin",
    "Crooked Nose",
    "Droopy Tip",
    "Dorsal Hump",
  ],
  Asymmetry: [
    "Brow Asymmetry",
    "Asymmetric Chin",
    "Asymmetric Jawline",
    "Asymmetric Lips",
  ],
  "Skin & Eyelids": [
    "Excess Upper Eyelid Skin",
    "Lower Eyelid - Excess Skin",
    "Upper Eyelid Droop",
    "Lower Eyelid Sag",
    "Lower Eyelid Bags",
  ],
  Lips: [
    "Thin Lips",
    "Lacking Philtral Column",
    "Long Philtral Column",
    "Gummy Smile",
    "Dry Lips",
    "Lip Thinning When Smiling",
  ],
  "Aging & Sagging": [
    "Jowls",
    "Loose Neck Skin",
    "Platysmal Bands",
    "Excess/Submental Fullness",
    "Brow Ptosis",
    "Flat Forehead",
  ],
  "Body Concerns": ["Unwanted Hair", "Stubborn Fat"],
};

// Get category for an issue
function getIssueCategory(issueName) {
  for (const [category, issues] of Object.entries(issueCategories)) {
    if (issues.includes(issueName)) {
      return category;
    }
  }
  return "Other";
}

// Generate a brief, informative description for an issue
function generateBriefIssueDescription(issueName) {
  const descriptions = {
    // Brow concerns
    "Brow Asymmetry":
      "Uneven brows can affect facial harmony. Various treatments can help create a more balanced, symmetrical appearance.",
    "Brow Ptosis":
      "When brows drop below their ideal position, it can create a tired look. We have effective lifting solutions.",
    // Forehead
    "Forehead Wrinkles":
      "Horizontal forehead lines develop from repeated expressions over time. Modern treatments can smooth and refresh this area.",
    "Glabella Wrinkles":
      'The vertical lines between your brows ("11 lines") can make you look stressed. These respond well to treatment.',
    "Flat Forehead":
      "Adding subtle contour to the forehead can enhance overall facial balance and create a more youthful profile.",
    // Eye area
    "Crow's Feet Wrinkles":
      "These expression lines around the eyes are among the earliest signs of aging. Multiple treatment options available.",
    "Under Eye Hollow":
      "Hollowing under the eyes creates shadows that make you look tired. This is one of our most requested treatment areas.",
    "Under Eye Wrinkles":
      "Fine lines under the eyes can be effectively treated with various rejuvenation techniques.",
    "Under Eye Dark Circles":
      "Dark circles can be caused by genetics, aging, or lifestyle. We can help determine the best approach for you.",
    "Upper Eye Hollow":
      "Volume loss in the upper eye area can create a hollow appearance. Restoration treatments are available.",
    "Excess Upper Eyelid Skin":
      "Excess skin on the upper lids can make you look older and affect your vision. Several correction options exist.",
    "Lower Eyelid Bags":
      "Under-eye bags can be addressed with various techniques depending on the cause.",
    // Nose
    "Dorsal Hump":
      "A bump on the bridge of the nose can be refined with surgical or non-surgical approaches.",
    "Droopy Tip":
      "A drooping nasal tip can be lifted to create better facial proportion.",
    "Crooked Nose": "Asymmetry in the nose can often be corrected or improved.",
    // Cheeks
    "Mid Cheek Flattening":
      "Restoring cheek volume can dramatically rejuvenate your appearance.",
    "Cheekbone - Not Prominent":
      "Enhancing cheekbone definition can improve facial structure and balance.",
    "Lower Cheeks - Volume Depletion":
      "Volume loss in the lower cheeks contributes to aging. Treatment can restore youthful contours.",
    // Lips
    "Thin Lips":
      "Lip enhancement can add volume while maintaining natural proportions.",
    "Asymmetric Lips":
      "Creating better lip symmetry enhances overall facial harmony.",
    "Lacking Philtral Column":
      "Defining the philtral columns can add structure and character to the lip area.",
    "Perioral Wrinkles":
      "Vertical lip lines can be softened with various treatment approaches.",
    // Jawline & Chin
    "Ill-Defined Jawline":
      "A sharper, more defined jawline creates a more youthful, contoured appearance.",
    "Retruded Chin":
      "Chin projection affects overall facial balance. Enhancement options are available.",
    "Prejowl Sulcus":
      "The hollows beside the chin can be filled to create a smoother jawline.",
    Jowling:
      "Sagging along the jawline can be addressed with lifting and contouring treatments.",
    // Skin quality
    "Dark Spots":
      "Sun damage and age spots can be treated with various skin rejuvenation techniques.",
    Scars:
      "Scar appearance can often be significantly improved with targeted treatments.",
    "Crepey Skin":
      "Skin texture and firmness can be improved with collagen-stimulating treatments.",
    // Neck
    "Neck Lines":
      "Horizontal neck lines and texture can be improved with rejuvenation treatments.",
    // Body
    "Stubborn Fat":
      "Diet-resistant fat deposits can be reduced with body contouring technology.",
    "Unwanted Hair":
      "Laser hair removal provides long-lasting reduction for unwanted hair.",
  };

  return (
    descriptions[issueName] ||
    `Explore treatment options to address this concern and achieve your aesthetic goals.`
  );
}

// User selections storage
// High-level concern categories that match Photos table structure
const HIGH_LEVEL_CONCERNS = [
  // Face Group
  {
    id: "facial-balancing",
    name: "Facial Balancing",
    description: "Harmonize facial features and proportions",
    icon: "balance",
    group: "Face",
    treatmentHint: "Dermal Fillers • Botox • Sculptra",
    mapsToPhotos: [
      "facial-balancing",
      "facial-harmony",
      "proportions",
      "symmetry",
      "brow-asymmetry",
      "asymmetry",
      "resolve-brow",
      "brow-balance",
      "facial-symmetry",
      "balance-brow",
      "balance-brows",
      "balance-chin",
      "balance-jawline",
      "balance-lip",
      "balance-lips",
      "asymmetric-brow",
      "asymmetric-brows",
      "asymmetric-chin",
      "asymmetric-jawline",
      "asymmetric-lip",
      "asymmetric-lips",
      "resolve-asymmetry",
      "correct-asymmetry",
      "brow-ptosis",
      "crooked-nose",
      "straighten-nose",
      "balance",
      "balanced",
      "balancing",
      "asymmetric",
      "asymmetrical",
      "droopy-tip",
      "dorsal-hump",
      "nasal-tip",
      "rhinoplasty",
      "over-projected",
      "gummy-smile",
      "long-philtral-column",
      "philtral",
      "wide-chin",
      "under-rotated",
      "nose-rotation",
      "over-filled",
      "overfill",
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
      "crooked-nose",
      "brow-ptosis",
      "droopy-tip",
      "dorsal-hump",
      "nasal-tip-too-narrow",
      "over-projected-chin",
      "gummy-smile",
      "long-philtral-column",
      "wide-chin",
      "under-rotated",
      "lower-cheeks-over-filled",
    ],
  },
  {
    id: "smooth-wrinkles-lines",
    name: "Smooth Wrinkles & Lines",
    description: "Reduce fine lines and wrinkles around your face",
    icon: "wrinkles",
    group: "Face",
    treatmentHint: "Botox • Xeomin • Dysport",
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
      "smile-lines",
      "nasolabial-lines",
      "marionette-lines",
      "bunny-lines",
      "perioral-wrinkles",
    ],
  },
  {
    id: "restore-volume-definition",
    name: "Restore Volume & Definition",
    description: "Add fullness and structure to your face",
    icon: "volume",
    group: "Face",
    treatmentHint: "Dermal Fillers • Sculptra",
    mapsToPhotos: [
      "restore-volume",
      "fillers",
      "volume-restoration",
      "sculptra",
      "define-jawline",
      "enhance-jawline",
      "jawline-definition",
      "jawline-contour",
      "wide-jawline",
      "volume",
      "hollow",
      "flatten",
      "depletion",
      "thin",
      "narrow",
      "sulcus",
      "prejowl",
      "cheekbone",
      "cheekbone-fullness",
      "labiomental",
      "labiomental-groove",
    ],
    mapsToSpecificIssues: [
      "hollow-cheeks",
      "under-eye-hollows",
      "thin-lips",
      "weak-chin",
      "volume-loss",
      "ill-defined-jawline",
      "asymmetric-jawline",
      "mid-cheek-flattening",
      "lower-cheek-volume-depletion",
      "under-eye-hollow",
      "upper-eye-hollow",
      "temporal-hollow",
      "flat-forehead",
      "lacking-philtral-column",
      "prejowl-sulcus",
      "narrow-jawline",
      "retruded-chin",
      "cheekbone-not-prominent",
      "deep-labiomental-groove",
      "shallow-labiomental-groove",
    ],
  },
  {
    id: "improve-skin-texture-tone",
    name: "Improve Skin Texture & Tone",
    description: "Even out skin, reduce pores, improve clarity",
    icon: "texture",
    group: "Face",
    treatmentHint: "Chemical Peels • Microneedling",
    mapsToPhotos: [
      "improve-skin-texture",
      "chemical-peel",
      "microneedling",
      "skin-texture",
      "skin-laxity",
      "tighten-skin",
      "scars",
      "blackheads",
      "oily-skin",
      "dry-skin",
      "neck",
      "submental",
      "platysmal",
      "neck-lines",
      "red-spots",
      "cheilosis",
      "dry-lips",
    ],
    mapsToSpecificIssues: [
      "large-pores",
      "uneven-texture",
      "dull-skin",
      "rough-skin",
      "skin-laxity",
      "loose-skin",
      "scars",
      "blackheads",
      "oily-skin",
      "dry-skin",
      "excess-skin",
      "neck-excess-skin",
      "loose-neck-skin",
      "platysmal-bands",
      "excess-submental-fullness",
      "jowls",
      "red-spots",
      "dry-lips",
    ],
  },
  {
    id: "reduce-dark-spots-discoloration",
    name: "Reduce Dark Spots & Discoloration",
    description: "Fade hyperpigmentation, age spots, and sun damage",
    icon: "spots",
    group: "Face",
    treatmentHint: "IPL • Laser Treatments",
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
    icon: "acne",
    group: "Face",
    treatmentHint: "Acne Treatments • Facials",
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
    icon: "eyes",
    group: "Face",
    treatmentHint: "Blepharoplasty • Fillers • Energy Treatments",
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
      "canthal-tilt",
    ],
    mapsToSpecificIssues: [
      "upper-eyelid-droop",
      "lower-eyelid-excess-skin",
      "excess-upper-eyelid-skin",
      "lower-eyelid-bags",
      "under-eye-dark-circles",
      "negative-canthal-tilt",
      "upper-eyelid-droop",
      "lower-eyelid-sag",
    ],
  },
  // Body Group
  {
    id: "body-contouring-fat-reduction",
    name: "Body Contouring & Fat Reduction",
    description: "Shape and contour your body",
    icon: "body",
    group: "Body",
    treatmentHint: "CoolSculpting • Body Treatments",
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
    icon: "hair",
    group: "Body",
    treatmentHint: "Laser Hair Removal • IPL",
    mapsToPhotos: ["hair-removal", "laser-hair-removal", "ipl-hair"],
    mapsToSpecificIssues: ["unwanted-hair", "facial-hair", "body-hair"],
  },
  // Wellness Group
  {
    id: "wellness-longevity",
    name: "Wellness & Longevity",
    description: "Hormone balance, energy, and vitality",
    icon: "wellness",
    group: "Wellness",
    treatmentHint: "Hormone Therapy • IV Therapy",
    mapsToPhotos: ["wellness", "longevity", "hormone-therapy"],
    mapsToSpecificIssues: [
      "hormone-imbalance",
      "energy",
      "vitality",
      "longevity",
    ],
  },
];

// Areas of Concern for filtering cases
const AREAS_OF_CONCERN = [
  { id: "forehead", name: "Forehead", icon: "forehead" },
  { id: "eyes", name: "Eyes", icon: "eyes" },
  { id: "cheeks", name: "Cheeks", icon: "cheeks" },
  { id: "nose", name: "Nose", icon: "nose" },
  { id: "mouth-lips", name: "Mouth & Lips", icon: "lips" },
  { id: "jawline", name: "Jawline", icon: "jawline" },
  { id: "chin", name: "Chin", icon: "chin" },
  { id: "neck", name: "Neck", icon: "neck" },
  { id: "chest", name: "Chest", icon: "chest" },
  { id: "hands", name: "Hands", icon: "hands" },
  { id: "arms", name: "Arms", icon: "arms" },
  { id: "body", name: "Body", icon: "body" },
];

// Configuration: Lock concerns/areas that don't have enough content yet
// These will be hidden from the online tool but available post-conversion
const LOCKED_CONCERNS = [
  // Add concern IDs here to lock them (e.g., "clear-acne-minimize-pores")
  // Example: "clear-acne-minimize-pores", "unwanted-hair-removal"
];

const LOCKED_AREAS = [
  // Add area IDs here to lock them (e.g., "chest", "hands", "body")
  // Example: "chest", "hands", "body"
];

let userSelections = {
  age: null,
  overallGoals: [],
  selectedAreas: [],
  selectedIssues: [],
  selectedConcernCategories: [], // New: high-level categories
  skinType: null, // New: demographics
  sunResponse: null,
  skinTone: null,
  ethnicBackground: null,
  previousTreatments: [],
};

// Immediately expose userSelections to window for global access
window.userSelections = userSelections;

// Track which issues have cases with photos
let issuesWithPhotos = new Set();

// Track read cases and cases added to goals
function getReadCases() {
  try {
    const read = localStorage.getItem("readCases");
    return read ? JSON.parse(read) : [];
  } catch (e) {
    return [];
  }
}

function markCaseAsRead(caseId) {
  try {
    const read = getReadCases();
    if (!read.includes(caseId)) {
      read.push(caseId);
      localStorage.setItem("readCases", JSON.stringify(read));
    }
  } catch (e) {
    console.error("Error marking case as read:", e);
  }
}

function isCaseRead(caseId) {
  return getReadCases().includes(caseId);
}

function getGoalCases() {
  try {
    const goals = localStorage.getItem("goalCases");
    return goals ? JSON.parse(goals) : [];
  } catch (e) {
    return [];
  }
}

function addCaseToGoals(caseId) {
  try {
    const goals = getGoalCases();
    if (!goals.includes(caseId)) {
      goals.push(caseId);
      localStorage.setItem("goalCases", JSON.stringify(goals));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error adding case to goals:", e);
    return false;
  }
}

function removeCaseFromGoals(caseId) {
  try {
    const goals = getGoalCases();
    const index = goals.indexOf(caseId);
    if (index > -1) {
      goals.splice(index, 1);
      localStorage.setItem("goalCases", JSON.stringify(goals));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error removing case from goals:", e);
    return false;
  }
}

function isCaseInGoals(caseId) {
  return getGoalCases().includes(caseId);
}

// Track issues added to goals (separate from cases)
function getGoalIssues() {
  try {
    const issues = localStorage.getItem("goalIssues");
    return issues ? JSON.parse(issues) : [];
  } catch (e) {
    return [];
  }
}

function addIssueToGoals(issueName) {
  try {
    const issues = getGoalIssues();
    if (!issues.includes(issueName)) {
      issues.push(issueName);
      localStorage.setItem("goalIssues", JSON.stringify(issues));
      trackEvent("issue_added_to_goals", {
        issue: issueName,
        totalGoalIssues: issues.length,
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error adding issue to goals:", e);
    return false;
  }
}

function removeIssueFromGoals(issueName) {
  try {
    const issues = getGoalIssues();
    const index = issues.indexOf(issueName);
    if (index > -1) {
      issues.splice(index, 1);
      localStorage.setItem("goalIssues", JSON.stringify(issues));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error removing issue from goals:", e);
    return false;
  }
}

function isIssueInGoals(issueName) {
  return getGoalIssues().includes(issueName);
}

function toggleIssueGoal(issueName) {
  const inGoals = isIssueInGoals(issueName);
  if (inGoals) {
    removeIssueFromGoals(issueName);
  } else {
    addIssueToGoals(issueName);
  }
  // Refresh the issue overview
  if (currentIssueOverview === issueName) {
    showIssueOverview(issueName);
  }
  // Refresh My Goals screen if it's currently active
  const myGoalsScreen = document.getElementById("my-cases-screen");
  if (myGoalsScreen && myGoalsScreen.classList.contains("active")) {
    showMyCases();
  }
}

// Load cases from Airtable
async function loadCasesFromAirtable() {
  try {
    console.log("Fetching records from Airtable REST API...");
    console.log("Base ID:", AIRTABLE_BASE_ID);
    console.log("Table:", AIRTABLE_TABLE_NAME);
    console.log("API URL:", AIRTABLE_API_URL);

    const data = await fetchAirtableRecords();
    console.log("API Response structure:", {
      hasRecords: !!data.records,
      recordsLength: data.records?.length,
      keys: Object.keys(data),
      firstFewKeys: Object.keys(data).slice(0, 10),
    });

    // Airtable API returns { records: [...], offset: '...' }
    const records = data.records || [];
    console.log(`Extracted ${records.length} records from API response`);

    if (records.length === 0 && data.records === undefined) {
      console.error(
        "API response does not contain records array. Full response:",
        data
      );
    }

    // Debug: Log all available fields from first record
    if (records.length > 0) {
      console.log("=== AIRTABLE DEBUG INFO ===");
      console.log("Total records:", records.length);
      console.log("First record ID:", records[0].id);
      console.log("First record fields:", Object.keys(records[0].fields));
      console.log("First record full data:", records[0].fields);

      // Check for attachment fields
      const firstRecordFields = records[0].fields;
      Object.keys(firstRecordFields).forEach((fieldName) => {
        const fieldValue = firstRecordFields[fieldName];
        if (
          Array.isArray(fieldValue) &&
          fieldValue.length > 0 &&
          fieldValue[0]?.url
        ) {
          console.log(`Found attachment field: "${fieldName}"`, fieldValue);
        }
      });
      console.log("========================");
    }

    // Map records to case data with error handling
    caseData = [];
    console.log(`Starting to map ${records.length} records...`);

    records.forEach((record, index) => {
      try {
        // Airtable REST API returns records with 'fields' property
        const fields = record.fields || {};

        if (!fields || Object.keys(fields).length === 0) {
          console.warn(`Record ${index + 1} has no fields, skipping`);
          return;
        }

        // Map Airtable fields to case structure
        // Adjust field names based on your Airtable schema
        const name = fields["Name"] || `Treatment ${index + 1}`;

        // Log if this is one of our target cases
        const nameLowerCheck = name.toLowerCase();
        if (
          nameLowerCheck.includes("physiq") ||
          nameLowerCheck.includes("everesse")
        ) {
          console.log(
            `\n>>> FOUND TARGET CASE: "${name}" (Record ${index + 1})`
          );
          console.log(`    Fields:`, Object.keys(fields));
          console.log(`    Has Photo field:`, !!fields["Photo"]);
          if (fields["Photo"]) {
            console.log(
              `    Photo field type:`,
              Array.isArray(fields["Photo"])
                ? `Array(${fields["Photo"].length})`
                : typeof fields["Photo"]
            );
          }
        }

        // Get images - Airtable attachment fields return arrays of objects
        // Try multiple field name variations - check all possible field names
        let beforeAfterField = null;
        let thumbnailField = null;

        // Try to find any attachment field
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
            console.log(
              `Found image field: "${fieldName}" for record ${index + 1}`
            );
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
              console.log(
                `Found attachment in field: "${fieldName}" for record ${
                  index + 1
                }`
              );
            }
          });
        }

        // Ensure it's an array
        if (!Array.isArray(beforeAfterField)) {
          beforeAfterField = [];
        }

        // Get thumbnail field (separate or fallback to main image)
        const possibleThumbnailFields = [
          "Thumbnail",
          "Thumbnail Image",
          "Thumb",
        ];
        for (const fieldName of possibleThumbnailFields) {
          const fieldValue = fields[fieldName];
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            thumbnailField = fieldValue;
            break;
          }
        }

        if (!thumbnailField) {
          thumbnailField = beforeAfterField;
        }

        if (!Array.isArray(thumbnailField)) {
          thumbnailField = beforeAfterField;
        }

        // Extract URLs from attachment objects
        // Airtable attachment objects have structure: { id, url, filename, size, type, thumbnails: { small, large, full } }
        // Filter out PDFs and other non-image files
        const imageAttachments = beforeAfterField.filter(
          (att) =>
            att.type &&
            att.type.startsWith("image/") &&
            !att.filename?.toLowerCase().endsWith(".pdf")
        );
        const imageThumbnails = thumbnailField.filter(
          (att) =>
            att.type &&
            att.type.startsWith("image/") &&
            !att.filename?.toLowerCase().endsWith(".pdf")
        );

        // For PDFs, try to get thumbnail from the PDF attachment itself (Airtable sometimes provides thumbnails for PDFs)
        let pdfThumbnail = null;
        const pdfAttachments = beforeAfterField.filter(
          (att) =>
            att.type === "application/pdf" ||
            att.filename?.toLowerCase().endsWith(".pdf")
        );
        if (pdfAttachments.length > 0 && pdfAttachments[0]?.thumbnails) {
          pdfThumbnail =
            pdfAttachments[0].thumbnails.large?.url ||
            pdfAttachments[0].thumbnails.small?.url ||
            pdfAttachments[0].thumbnails.full?.url ||
            null;
        }

        const beforeAfter =
          imageAttachments.length > 0 && imageAttachments[0]?.url
            ? imageAttachments[0].url
            : null;
        const thumbnail =
          imageThumbnails.length > 0
            ? imageThumbnails[0]?.thumbnails?.large?.url ||
              imageThumbnails[0]?.thumbnails?.small?.url ||
              imageThumbnails[0]?.url
            : pdfThumbnail || null;

        // Log cases that might match body concerns for debugging
        const nameLower = name.toLowerCase(); // Re-declare here for this scope
        if (
          nameLower.includes("physiq") ||
          nameLower.includes("everesse") ||
          nameLower.includes("motus") ||
          nameLower.includes("hair") ||
          nameLower.includes("fat") ||
          nameLower.includes("body contour")
        ) {
          console.log(`Case ${index + 1} - Name: ${name}`);
          console.log(
            `  BeforeAfter field found: ${beforeAfterField.length > 0}`
          );
          console.log(
            `  BeforeAfter URL: ${
              beforeAfter ? beforeAfter.substring(0, 100) + "..." : "MISSING"
            }`
          );
          console.log(
            `  Thumbnail URL: ${
              thumbnail ? thumbnail.substring(0, 100) + "..." : "MISSING"
            }`
          );
          if (beforeAfterField.length > 0) {
            console.log(`  Attachment object structure:`, beforeAfterField[0]);
            // Check if it's a PDF
            if (
              beforeAfterField[0].type === "application/pdf" ||
              beforeAfterField[0].filename?.toLowerCase().endsWith(".pdf")
            ) {
              console.warn(
                `  WARNING: Case has PDF attachment instead of image - will use thumbnail if available`
              );
            }
          } else {
            // No photo found for target case
            if (
              nameLower.includes("physiq") ||
              nameLower.includes("everesse")
            ) {
              console.warn(
                `  ⚠️  WARNING: Case "${name}" has NO Photo attachment! This case will be skipped.`
              );
              console.warn(
                `     Please add a Photo attachment in Airtable for this case.`
              );
            }
          }
        }

        // Get patient age from Airtable - try multiple field name variations
        const patientAge =
          fields["Age"] ||
          fields["Patient Age"] ||
          fields["Patient's Age"] ||
          fields["Age (years)"] ||
          parseInt(fields["Age Range"]) ||
          null;

        // Get patient name - try multiple variations
        const patientName =
          fields["Patient Name"] ||
          fields["Patient"] ||
          fields["Name"] ||
          fields["Client Name"] ||
          "Patient";

        // Format patient info
        let patient = patientName;
        if (patientAge) {
          patient = `${patientName}, ${patientAge} years old`;
        } else if (patientName !== "Patient") {
          patient = patientName;
        } else {
          // Generate a realistic patient name if missing
          const names = [
            "Sarah",
            "Michael",
            "Emma",
            "David",
            "Jessica",
            "James",
            "Lisa",
            "Robert",
          ];
          const randomName = names[Math.floor(Math.random() * names.length)];
          const estimatedAge =
            patientAge || 35 + Math.floor(Math.random() * 25); // 35-60
          patient = `${randomName}, ${estimatedAge} years old`;
        }

        // Get headline - PRIMARY: "Story Title" (uploaded from generated stories)
        // Falls back to other field name variations if Story Title is not present
        const headline =
          fields["Story Title"] ||
          fields["Headline"] ||
          fields["Title"] ||
          fields["Case Title"] ||
          fields["Story Headline"] ||
          fields["Treatment Title"] ||
          generateHeadline(name, fields);

        // Get story - PRIMARY: "Story Detailed" (uploaded from generated stories)
        // Falls back to other field name variations if Story Detailed is not present
        const story =
          fields["Story Detailed"] ||
          fields["Story"] ||
          fields["Description"] ||
          fields["Patient Story"] ||
          fields["Case Story"] ||
          fields["Background"] ||
          fields["Notes"] ||
          generateStory(name, patientAge, patientName, fields);

        // Debug logging for first few records to verify Story Title/Detailed are loading
        if (index < 3) {
          console.log(`Record ${index + 1} - "${name}":`);
          console.log(`  Story Title found: ${!!fields["Story Title"]}`);
          console.log(`  Story Detailed found: ${!!fields["Story Detailed"]}`);
          if (fields["Story Title"]) {
            console.log(`  Headline: "${headline.substring(0, 50)}..."`);
          }
          if (fields["Story Detailed"]) {
            console.log(`  Story: "${story.substring(0, 50)}..."`);
          }
        }

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

        // If no solved issues, generate based on treatment name
        if (solved.length === 0) {
          solved = generateSolvedIssues(name, fields);
        }

        // Get treatment details - PRIMARY: "Treatment Details" (uploaded from generated content)
        // Falls back to other field variations if not present
        const treatment =
          fields["Treatment Details"] ||
          fields["Treatment"] ||
          fields["Treatment Description"] ||
          fields["Procedure"] ||
          fields["Treatment Type"] ||
          fields["Method"] ||
          fields["Details"] ||
          fields["Notes"] ||
          generateTreatmentDetails(name, fields);

        // Get matching criteria - prioritize "Matching" field if it exists
        // This is a single-line text field that should contain comma-separated issue names
        const matchingField = fields["Matching"] || "";
        let matchingCriteria = [];

        if (
          matchingField &&
          typeof matchingField === "string" &&
          matchingField.trim()
        ) {
          // Parse the "Matching" field - should contain comma-separated issue names
          matchingCriteria = matchingField
            .split(",")
            .map((c) => c.trim().toLowerCase().replace(/\s+/g, "-"))
            .filter((c) => c.length > 0);
        }

        // Fallback to other matching criteria fields if "Matching" is not set
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

        // If still no matching criteria, generate based on treatment name and solved issues
        if (matchingCriteria.length === 0) {
          matchingCriteria = generateMatchingCriteria(name, solved, fields);
        }

        // Store the direct matching issues separately for easier lookup
        // Normalize the values (trim, handle extra spaces)
        const directMatchingIssues =
          matchingField &&
          typeof matchingField === "string" &&
          matchingField.trim()
            ? matchingField
                .split(",")
                .map((c) => c.trim().replace(/\s+/g, " ")) // Normalize multiple spaces to single space
                .filter((c) => c.length > 0)
            : [];

        // Ensure beforeAfter is always an image (not PDF), fallback to thumbnail
        const finalBeforeAfter = beforeAfter || thumbnail || null;

        // Get demographic fields from Airtable
        const age = fields["Age"] ? parseInt(fields["Age"], 10) : patientAge;
        const skinTone = fields["Skin Tone"] || null;
        const ethnicBackground = fields["Ethnic Background"] || null;
        const skinType = fields["Skin Type"] || null;
        const sunResponse = fields["Sun Response"] || null;

        // Get surgical status from "Surgical (from General Treatments)" field
        const surgical = fields["Surgical (from General Treatments)"] || null;

        const caseItem = {
          id: record.id,
          name: name,
          thumbnail:
            thumbnail ||
            beforeAfter ||
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E`,
          beforeAfter:
            finalBeforeAfter ||
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E`,
          headline: headline,
          patient: patient,
          patientAge: age, // Use Age field if available, fallback to patientAge
          story: story,
          solved: solved.length > 0 ? solved : ["Aesthetic improvement"],
          treatment: treatment,
          matchingCriteria: matchingCriteria,
          directMatchingIssues: directMatchingIssues, // Direct issue names from "Matching" field
          // Demographic fields from photo analysis
          skinTone: skinTone,
          ethnicBackground: ethnicBackground,
          skinType: skinType,
          sunResponse: sunResponse,
          commonForAge: null, // Will be calculated based on age
          surgical: surgical, // "Surgical" or "Non-Surgical" from Airtable "Surgical (from General Treatments)" field
        };
        caseData.push(caseItem);
        if (index < 3) {
          console.log(
            `Successfully processed record ${index + 1}: ${caseItem.name}`
          );
        }
      } catch (error) {
        console.error(`Error processing record ${index + 1}:`, error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Record data:", record);

        // If this was a target case, log it specially
        const name = record.fields?.Name || "";
        if (
          name.toLowerCase().includes("physiq") ||
          name.toLowerCase().includes("everesse")
        ) {
          console.error(`\n!!! ERROR PROCESSING TARGET CASE: "${name}" !!!`);
          console.error(
            "This case exists but failed to process. Check the error above."
          );
        }
      }
    });

    console.log(`Finished mapping. Total cases created: ${caseData.length}`);

    // Count how many cases have "Matching" field populated
    const casesWithMatching = caseData.filter(
      (c) => c.directMatchingIssues && c.directMatchingIssues.length > 0
    ).length;
    console.log(
      `📊 Cases with "Matching" column: ${casesWithMatching} / ${
        caseData.length
      } (${Math.round((casesWithMatching / caseData.length) * 100)}%)`
    );

    // Deduplicate cases by record ID (in case pagination fetched duplicates)
    const seenIds = new Set();
    const uniqueCaseData = [];
    caseData.forEach((caseItem) => {
      if (caseItem.id && !seenIds.has(caseItem.id)) {
        seenIds.add(caseItem.id);
        uniqueCaseData.push(caseItem);
      } else if (!caseItem.id) {
        // If no ID, deduplicate by name
        const existing = uniqueCaseData.find((c) => c.name === caseItem.name);
        if (!existing) {
          uniqueCaseData.push(caseItem);
        }
      }
    });
    if (caseData.length !== uniqueCaseData.length) {
      console.log(
        `Deduplicated: ${caseData.length} -> ${uniqueCaseData.length} cases`
      );
    }
    caseData = uniqueCaseData;

    // Search for body contouring cases in ALL records (even if they don't have photos)
    console.log(
      `\n=== SEARCHING FOR TARGET CASES IN ALL ${records.length} RECORDS ===`
    );
    const allTargetCases = records.filter((r) => {
      const name = r.fields?.Name || "";
      const nameLower = name.toLowerCase();
      return (
        nameLower.includes("physiq") ||
        nameLower.includes("everesse") ||
        (nameLower.includes("burn") && nameLower.includes("stubborn fat"))
      );
    });

    if (allTargetCases.length > 0) {
      console.log(
        `Found ${allTargetCases.length} target case(s) in raw records:`
      );
      allTargetCases.forEach((r, idx) => {
        const name = r.fields?.Name || "Unknown";
        const hasPhoto = !!(
          r.fields?.Photo &&
          Array.isArray(r.fields.Photo) &&
          r.fields.Photo.length > 0
        );
        console.log(`  ${idx + 1}. "${name}"`);
        console.log(
          `     - Has Photo: ${hasPhoto ? "YES" : "NO (will be skipped!)"}`
        );
        if (hasPhoto) {
          console.log(
            `     - Photo type: ${r.fields.Photo[0]?.type || "unknown"}`
          );
        }
      });
    } else {
      console.log("No target cases found in raw records.");
      console.log("This means the cases either:");
      console.log("  1. Don't exist in Airtable yet");
      console.log("  2. Are in a different table");
      console.log("  3. Are filtered out by a view");
      console.log("  4. Have different names than expected");
    }

    // Search for body contouring cases in processed caseData
    const bodyContourCases = caseData.filter((c) => {
      const nameLower = c.name.toLowerCase();
      return (
        nameLower.includes("physiq") ||
        nameLower.includes("everesse") ||
        nameLower.includes("body contour")
      );
    });
    if (bodyContourCases.length > 0) {
      console.log(
        `\n=== FOUND ${bodyContourCases.length} BODY CONTOURING CASE(S) IN PROCESSED DATA ===`
      );
      bodyContourCases.forEach((c) => {
        console.log(`  - ${c.name}`);
      });
    } else {
      console.log(`\n=== NO BODY CONTOURING CASES IN PROCESSED DATA ===`);
      if (allTargetCases.length > 0) {
        console.log("⚠️  Cases exist in Airtable but were NOT processed!");
        console.log("   This likely means they're missing Photo attachments.");
      }
    }

    console.log(`\n=== LOADED ${caseData.length} CASES FROM AIRTABLE ===`);
    if (caseData.length > 0) {
      console.log("Sample case data:", {
        name: caseData[0].name,
        hasThumbnail: !!caseData[0].thumbnail,
        hasBeforeAfter: !!caseData[0].beforeAfter,
        thumbnailUrl: caseData[0].thumbnail
          ? caseData[0].thumbnail.substring(0, 80) + "..."
          : "NONE",
        beforeAfterUrl: caseData[0].beforeAfter
          ? caseData[0].beforeAfter.substring(0, 80) + "..."
          : "NONE",
      });
    } else {
      console.warn("WARNING: No cases were loaded from Airtable!");
      console.log("This might mean:");
      console.log("1. Records were fetched but mapping failed");
      console.log("2. All records were filtered out");
      console.log("3. An error occurred during processing");
      console.log("Falling back to sample data...");
      loadSampleData();
    }

    // Cases are now loaded from Airtable - no need for hardcoded cases
    // Re-update issues with photos
    updateIssuesWithPhotos();

    console.log("==========================================\n");
  } catch (error) {
    console.error("Error loading cases from Airtable:", error);
    console.error("Error details:", error.message, error.stack);
    // Fallback to sample data
    loadSampleData();
  }
}

// Content generation functions for missing fields
function generateHeadline(treatmentName, fields) {
  const headlines = [
    `How I achieved my aesthetic goals`,
    `My journey to better skin`,
    `Transforming my appearance`,
    `Achieving natural results`,
    `My success story`,
    `A personalized approach to beauty`,
    `Discovering my best self`,
    `Natural-looking results I love`,
  ];
  return headlines[Math.floor(Math.random() * headlines.length)];
}

function generateStory(treatmentName, age, patientName, fields) {
  const ageGroup = age
    ? age < 35
      ? "young"
      : age < 50
      ? "middle-aged"
      : "mature"
    : "mature";

  const nameLower = treatmentName.toLowerCase();
  const patientDisplay = patientName || `This ${ageGroup} patient`;

  // Extract key treatment type and issues from the case name
  let treatmentType = "";
  let primaryConcern = "";

  if (nameLower.includes("filler")) {
    treatmentType = "dermal fillers";
    if (nameLower.includes("jawline") || nameLower.includes("jaw")) {
      primaryConcern = "wanted to enhance their jawline definition";
    } else if (nameLower.includes("cheek") || nameLower.includes("mid cheek")) {
      primaryConcern = "noticed volume loss in their cheeks";
    } else if (
      nameLower.includes("under eye") ||
      nameLower.includes("eye hollow")
    ) {
      primaryConcern = "was concerned about under-eye hollows";
    } else if (nameLower.includes("lip")) {
      primaryConcern = "wanted fuller, more defined lips";
    } else if (nameLower.includes("chin")) {
      primaryConcern = "felt their chin needed more projection";
    } else if (
      nameLower.includes("nasolabial") ||
      nameLower.includes("marionette")
    ) {
      primaryConcern = "wanted to soften deep lines around their mouth";
    } else {
      primaryConcern = "sought to restore facial volume";
    }
  } else if (
    nameLower.includes("neurotoxin") ||
    nameLower.includes("botox") ||
    nameLower.includes("dysport") ||
    nameLower.includes("xeomin")
  ) {
    treatmentType = "neurotoxin injections";
    if (nameLower.includes("forehead") || nameLower.includes("glabella")) {
      primaryConcern = "wanted to smooth forehead wrinkles and frown lines";
    } else if (nameLower.includes("crow") || nameLower.includes("eye")) {
      primaryConcern = "noticed fine lines forming around their eyes";
    } else {
      primaryConcern = "sought to reduce dynamic wrinkles";
    }
  } else if (
    nameLower.includes("restylane") ||
    nameLower.includes("radiesse") ||
    nameLower.includes("sculptra") ||
    nameLower.includes("prp filler") ||
    nameLower.includes("derma prp")
  ) {
    treatmentType = "dermal fillers";
    if (nameLower.includes("lip")) {
      primaryConcern = "wanted fuller, more defined lips";
    } else {
      primaryConcern = "sought to restore facial volume and enhance contours";
    }
  } else if (
    nameLower.includes("laser") ||
    nameLower.includes("tetra") ||
    nameLower.includes("motus") ||
    nameLower.includes("everesse")
  ) {
    treatmentType = "laser treatment";
    if (nameLower.includes("spot") || nameLower.includes("pigment")) {
      primaryConcern = "wanted to fade dark spots and even out their skin tone";
    } else if (nameLower.includes("wrinkle") || nameLower.includes("texture")) {
      primaryConcern = "sought to improve skin texture and reduce fine lines";
    } else {
      primaryConcern = "wanted to rejuvenate their skin";
    }
  } else if (nameLower.includes("peel") || nameLower.includes("chemical")) {
    treatmentType = "chemical peel";
    primaryConcern = "wanted to improve skin clarity and texture";
  } else if (
    nameLower.includes("microneedling") ||
    nameLower.includes("agnes") ||
    nameLower.includes("scarlet")
  ) {
    treatmentType = "RF microneedling";
    if (nameLower.includes("acne")) {
      primaryConcern = "wanted to address acne and improve skin texture";
    } else {
      primaryConcern = "sought to improve skin texture and stimulate collagen";
    }
  } else if (
    nameLower.includes("aquafirme") ||
    nameLower.includes("aquafirmexs")
  ) {
    treatmentType = "facial treatment";
    primaryConcern = "wanted to cleanse, exfoliate, and nourish their skin";
  } else if (
    nameLower.includes("physiq") ||
    nameLower.includes("body contour")
  ) {
    treatmentType = "body contouring";
    primaryConcern = "sought to tone muscles and reduce fat in targeted areas";
  } else if (
    nameLower.includes("derive") ||
    nameLower.includes("hair wellness")
  ) {
    treatmentType = "hair wellness treatment";
    primaryConcern = "wanted to stimulate hair growth and improve scalp health";
  } else if (nameLower.includes("kybella")) {
    treatmentType = "Kybella injections";
    primaryConcern = "wanted to reduce submental fullness";
  } else if (nameLower.includes("threadlift") || nameLower.includes("thread")) {
    treatmentType = "thread lift";
    primaryConcern = "sought a non-surgical lifting solution";
  } else if (
    nameLower.includes("blepharoplasty") ||
    nameLower.includes("eyelid")
  ) {
    treatmentType = "eyelid surgery";
    primaryConcern = "wanted to address excess eyelid skin";
  } else {
    treatmentType = "aesthetic treatment";
    primaryConcern = "sought to enhance their appearance";
  }

  // Generate age-appropriate story
  const ageContext = age
    ? age < 35
      ? "Starting to notice early signs of aging,"
      : age < 50
      ? "Beginning to see more noticeable changes,"
      : "Experiencing significant signs of aging,"
    : "";

  const stories = [
    `${patientDisplay} ${primaryConcern}. ${ageContext} After discussing their goals during consultation, we recommended ${treatmentType} tailored to their specific needs. The results were natural and subtle, giving them a refreshed appearance without looking overdone.`,
    `${patientDisplay} had been considering aesthetic treatments for a while and ${primaryConcern}. They chose ${treatmentType} because it addressed their concerns with minimal downtime. The treatment was quick and comfortable, and they were pleased with how natural the results looked.`,
    `${patientDisplay} ${primaryConcern} that had been bothering them. We customized a ${treatmentType} plan that targeted their specific areas of concern. The improvement was noticeable yet natural, helping them feel more confident.`,
    `After noticing changes in their appearance, ${patientDisplay} ${primaryConcern}. Our team recommended ${treatmentType}, which we performed with precision to achieve their desired look. They were thrilled with the subtle yet effective results.`,
  ];

  return stories[Math.floor(Math.random() * stories.length)];
}

function generateSolvedIssues(treatmentName, fields) {
  const nameLower = treatmentName.toLowerCase();
  const issues = [];

  if (
    nameLower.includes("skin") ||
    nameLower.includes("laser") ||
    nameLower.includes("rejuvenation") ||
    nameLower.includes("tetra") ||
    nameLower.includes("motus") ||
    nameLower.includes("aquafirme") ||
    nameLower.includes("everesse")
  ) {
    issues.push("even skin tone", "reduce spots", "smooth texture");
  }
  if (nameLower.includes("eye") || nameLower.includes("under-eye")) {
    issues.push("under eye rejuvenation", "dark circles", "eye bags");
  }
  if (nameLower.includes("jawline") || nameLower.includes("jaw")) {
    issues.push("improve definition", "facial balancing");
  }
  if (nameLower.includes("forehead") || nameLower.includes("brow")) {
    issues.push("forehead wrinkles", "brow lift");
  }
  if (nameLower.includes("aging") || nameLower.includes("anti-aging")) {
    issues.push("anti-aging", "wrinkles", "fine lines");
  }
  if (nameLower.includes("facial") || nameLower.includes("contour")) {
    issues.push("facial balancing", "volume restoration");
  }
  if (
    nameLower.includes("botox") ||
    nameLower.includes("dysport") ||
    nameLower.includes("xeomin") ||
    nameLower.includes("neurotoxin")
  ) {
    issues.push("reduce wrinkles", "smooth lines", "prevent aging");
  }
  if (
    nameLower.includes("filler") ||
    nameLower.includes("restylane") ||
    nameLower.includes("radiesse") ||
    nameLower.includes("sculptra") ||
    nameLower.includes("prp")
  ) {
    issues.push(
      "volume restoration",
      "facial enhancement",
      "natural contouring"
    );
  }
  if (
    nameLower.includes("microneedling") ||
    nameLower.includes("agnes") ||
    nameLower.includes("scarlet")
  ) {
    issues.push("improve texture", "stimulate collagen", "skin tightening");
  }
  if (
    nameLower.includes("acne") ||
    (nameLower.includes("agnes") && nameLower.includes("acne"))
  ) {
    issues.push("treat acne", "reduce breakouts", "improve skin clarity");
  }
  if (nameLower.includes("physiq") || nameLower.includes("body contour")) {
    issues.push("body contouring", "muscle toning", "fat reduction");
  }
  if (nameLower.includes("hair") || nameLower.includes("derive")) {
    issues.push("hair growth", "scalp health", "thicker hair");
  }
  if (
    nameLower.includes("hair removal") ||
    (nameLower.includes("motus") && nameLower.includes("hair"))
  ) {
    issues.push("smooth skin", "permanent hair reduction", "hair-free skin");
  }
  if (
    nameLower.includes("pigment") ||
    (nameLower.includes("motus") && nameLower.includes("pigment"))
  ) {
    issues.push("reduce pigmentation", "even skin tone", "fade dark spots");
  }
  if (
    nameLower.includes("vascular") ||
    (nameLower.includes("motus") && nameLower.includes("vascular"))
  ) {
    issues.push("reduce redness", "minimize visible vessels", "even skin tone");
  }

  return issues.length > 0
    ? issues
    : ["aesthetic improvement", "natural enhancement"];
}

function generateTreatmentDetails(treatmentName, fields) {
  const nameLower = treatmentName.toLowerCase();
  const treatmentModality = getTreatmentModality(treatmentName);

  // Helper to pick random item from array
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Exciting opening phrases
  const openings = [
    "Here's what made this transformation possible:",
    "The secret behind this stunning result?",
    "This is the approach that delivered these results:",
    "What went into achieving this outcome:",
    "The technique that made the difference:",
  ];

  // Result timeframes
  const immediateResults = [
    "visible right away",
    "apparent immediately",
    "noticeable from day one",
    "evident as soon as the treatment finished",
  ];
  const gradualResults = [
    "continue to improve over the following weeks",
    "develop beautifully over time",
    "reveal themselves gradually as healing progresses",
    "unfold naturally over the coming months",
  ];

  // Comfort descriptors
  const comfortPhrases = [
    "The entire experience was comfortable and relaxed",
    "Patients typically describe this as surprisingly comfortable",
    "Most patients find this treatment quite tolerable",
    "The procedure was gentle and well-tolerated",
  ];

  // FILLER treatments
  if (nameLower.includes("filler")) {
    const fillerTechniques = {
      jawline: [
        `${pick(
          openings
        )} A precisely mapped injection strategy along the jawline using premium hyaluronic acid filler. Each injection point was chosen to maximize definition while maintaining natural movement. The filler was placed at the bone level for structural support, then layered superficially for smooth contours. ${
          pick(immediateResults).charAt(0).toUpperCase() +
          pick(immediateResults).slice(1)
        }, with final results settling beautifully over two weeks.`,
        `${pick(
          openings
        )} Strategic placement of dermal filler at key anatomical points along the jaw. We used a combination of needle and cannula techniques—needles for precise definition at the chin and angle of the jaw, cannula for smooth, even distribution along the body of the jawline. The result? A sharper, more sculpted profile that still looks completely natural.`,
        `${pick(
          openings
        )} A customized jawline sculpting session using advanced filler placement techniques. We focused on three key areas: the chin point for forward projection, the jaw angle for width and strength, and the prejowl area to eliminate shadows. ${pick(
          comfortPhrases
        )}, and results were ${pick(immediateResults)}.`,
      ],
      cheek: [
        `${pick(
          openings
        )} Expertly placed cheek filler using the "liquid lift" technique. We injected at the apex of the cheekbone and along the zygomatic arch to create lift that radiates through the entire mid-face. This strategic approach not only adds volume but also softens nasolabial folds and brightens the under-eye area. Results ${pick(
          gradualResults
        )}.`,
        `${pick(
          openings
        )} A volumizing treatment focused on restoring youthful cheek contours. We used a layered approach—deep injections for structural support, mid-level for volume, and superficial touches for smooth transitions. The lifting effect was ${pick(
          immediateResults
        )}, and patients typically see continued improvement for up to a month.`,
        `${pick(
          openings
        )} Precision cheek augmentation using premium hyaluronic acid filler. We mapped out the ideal apex point for this patient's unique bone structure, then built volume in layers to create that coveted "apple cheek" effect without looking overdone. ${pick(
          comfortPhrases
        )}.`,
      ],
      underEye: [
        `${pick(
          openings
        )} Delicate tear trough correction using an ultra-fine cannula technique. This approach minimizes bruising and allows for incredibly precise placement. We used a thin, hydrating filler specifically designed for this sensitive area, placed just above the orbital bone to fill hollows and reduce dark shadows. The transformation was subtle but striking.`,
        `${pick(
          openings
        )} A careful under-eye rejuvenation using specialized tear trough filler. We assessed the exact depth of the hollow and placed small amounts of filler with precision, building gradually to avoid any puffiness. The goal was to eliminate the "tired" look while keeping everything looking completely natural. Mission accomplished.`,
        `${pick(
          openings
        )} Expert treatment of under-eye hollows using the safest, most advanced technique available. A blunt-tip cannula was used for maximum safety in this delicate area. Results include reduced dark circles, softer shadows, and a more refreshed, well-rested appearance that patients absolutely love.`,
      ],
      lip: [
        `${pick(
          openings
        )} Artful lip enhancement tailored to this patient's natural lip shape and facial proportions. We focused on enhancing the vermillion border for definition, adding subtle volume to the body of the lips, and perfecting the cupid's bow. The result is fuller, more balanced lips that still look like "you"—just enhanced.`,
        `${pick(
          openings
        )} A customized lip augmentation using premium hyaluronic acid filler. We took a conservative, build-as-you-go approach, adding volume incrementally and checking symmetry at each step. Special attention was paid to the philtral columns and oral commissures for a complete, harmonious result.`,
        `${pick(
          openings
        )} Beautiful lip enhancement achieved through careful technique and artistic vision. We enhanced both volume and shape—defining the border, smoothing vertical lines, and creating that subtle pout. ${pick(
          comfortPhrases
        )} thanks to numbing cream and the lidocaine in the filler itself.`,
      ],
      chin: [
        `${pick(
          openings
        )} Strategic chin augmentation using dermal filler to improve profile balance. We injected along the mentum to create forward projection and refined the chin point for a more defined look. The result brings the entire face into better proportion—a small change with a big impact.`,
        `${pick(
          openings
        )} Non-surgical chin enhancement that transformed this patient's profile. We used filler to add projection and length to the chin, creating better balance with the nose and forehead. The treatment took just 15 minutes, but the confidence boost lasts for over a year.`,
        `${pick(
          openings
        )} Precision chin sculpting using hyaluronic acid filler. We addressed both the front projection and the lateral contours, creating a chin that complements the entire facial structure. ${
          pick(immediateResults).charAt(0).toUpperCase() +
          pick(immediateResults).slice(1)
        }, with no downtime required.`,
      ],
      lines: [
        `${pick(
          openings
        )} Targeted treatment of facial creases using soft, flexible filler. We placed the product deep to lift and superficially to smooth, working layer by layer until those stubborn lines became virtually invisible. The key is knowing exactly how much to use—enough to see results, not so much that it looks "done."`,
        `${pick(
          openings
        )} Expert softening of facial lines through strategic filler placement. Rather than just filling the lines directly, we addressed the underlying volume loss that was causing them. This approach gives longer-lasting, more natural results that improve how the whole face looks.`,
        `${pick(
          openings
        )} A refreshing treatment targeting those telltale signs of aging. We used a combination of techniques—some direct filling, some support from beneath—to smooth lines while maintaining natural facial movement. The result is softer, more youthful-looking skin.`,
      ],
    };

    if (nameLower.includes("jawline") || nameLower.includes("jaw")) {
      return pick(fillerTechniques.jawline);
    } else if (nameLower.includes("cheek") || nameLower.includes("mid cheek")) {
      return pick(fillerTechniques.cheek);
    } else if (
      nameLower.includes("under eye") ||
      nameLower.includes("eye hollow") ||
      nameLower.includes("tear")
    ) {
      return pick(fillerTechniques.underEye);
    } else if (nameLower.includes("lip")) {
      return pick(fillerTechniques.lip);
    } else if (nameLower.includes("chin")) {
      return pick(fillerTechniques.chin);
    } else if (
      nameLower.includes("nasolabial") ||
      nameLower.includes("marionette") ||
      nameLower.includes("fold") ||
      nameLower.includes("line")
    ) {
      return pick(fillerTechniques.lines);
    } else {
      return `${pick(
        openings
      )} A personalized dermal filler treatment designed around this patient's unique facial anatomy. We assessed bone structure, existing volume, and aesthetic goals, then crafted a treatment plan that enhances natural beauty rather than changing it. Premium hyaluronic acid filler was placed with precision at multiple depths for the most natural-looking result possible. ${pick(
        comfortPhrases
      )}, and results were ${pick(immediateResults)}.`;
    }
  }

  // NEUROTOXIN treatments
  if (
    nameLower.includes("neurotoxin") ||
    nameLower.includes("botox") ||
    nameLower.includes("dysport") ||
    nameLower.includes("xeomin")
  ) {
    const neurotoxinName = nameLower.includes("dysport")
      ? "Dysport"
      : nameLower.includes("xeomin")
      ? "Xeomin"
      : "Botox";
    const neurotoxinDetails = [
      `${pick(
        openings
      )} Precision ${neurotoxinName} injections placed at exactly the right points to relax overactive muscles while preserving natural expression. We mapped the muscle anatomy carefully and used just enough product to smooth lines without creating that "frozen" look. Results begin appearing within days and reach their peak at two weeks.`,
      `${pick(
        openings
      )} A customized ${neurotoxinName} treatment that targets dynamic wrinkles at their source. We analyzed facial movement patterns to identify which muscles needed treatment, then placed micro-doses at strategic points. The goal: smoother skin that still moves naturally when you smile, laugh, or show surprise.`,
      `${pick(
        openings
      )} Expert ${neurotoxinName} injection using advanced techniques refined over thousands of treatments. We balanced treatment across facial zones to ensure symmetry and natural movement. ${pick(
        comfortPhrases
      )}—most patients describe it as less uncomfortable than tweezing eyebrows. Results ${pick(
        gradualResults
      )}.`,
    ];
    return pick(neurotoxinDetails);
  }

  // LASER treatments
  if (
    nameLower.includes("laser") ||
    nameLower.includes("tetra") ||
    nameLower.includes("motus")
  ) {
    if (nameLower.includes("hair removal") || nameLower.includes("hair")) {
      const hairRemovalDetails = [
        `${pick(
          openings
        )} State-of-the-art laser hair removal using the Motus AZ+ with Moveo technology—the gold standard for comfortable, effective hair reduction. This innovative system delivers laser energy gradually while the handpiece moves continuously over the skin, making treatments virtually painless. Effective on all skin types and most hair colors.`,
        `${pick(
          openings
        )} Advanced laser hair removal that actually works on more skin and hair types than older technologies. The treatment systematically targets hair follicles while protecting surrounding skin. Most patients describe the sensation as a warm massage. A series of treatments ensures we catch every hair in its growth phase.`,
        `${pick(
          openings
        )} Premium laser hair removal using cutting-edge technology that makes treatments fast, effective, and surprisingly comfortable. Each session takes just minutes, with patients returning to normal activities immediately. Results become more dramatic with each treatment as fewer and fewer hairs return.`,
      ];
      return pick(hairRemovalDetails);
    } else if (nameLower.includes("co2") || nameLower.includes("tetra")) {
      const co2Details = [
        `${pick(
          openings
        )} Advanced CO2 laser resurfacing that triggers the skin's natural renewal process. Microscopic columns of laser energy penetrate the skin, stimulating collagen production from deep within while leaving surrounding tissue intact for faster healing. The result is dramatically smoother, firmer, more youthful-looking skin.`,
        `${pick(
          openings
        )} Precision CO2 laser treatment that resurfaces the skin with remarkable control. We customized the settings for this patient's specific skin type and concerns, balancing effectiveness with recovery time. The laser removes damaged surface cells while triggering deep collagen remodeling that continues for months.`,
        `${pick(
          openings
        )} Transformative laser resurfacing using the latest fractional CO2 technology. This treatment addresses texture, tone, fine lines, and laxity all at once. Yes, there's some recovery time—but patients consistently say the dramatic results are worth it.`,
      ];
      return pick(co2Details);
    } else {
      const laserDetails = [
        `${pick(
          openings
        )} Targeted laser therapy calibrated precisely for this patient's skin type and concerns. The laser energy stimulates natural healing processes, encouraging the skin to renew itself from within. Results ${pick(
          gradualResults
        )}, with optimal outcomes visible after a series of treatments.`,
        `${pick(
          openings
        )} Advanced laser treatment using technology that targets specific concerns while protecting surrounding tissue. The procedure was comfortable and quick, with most patients returning to their normal routine immediately. The real magic happens over the following weeks as the skin responds and renews.`,
        `${pick(
          openings
        )} State-of-the-art laser therapy that harnesses light energy to transform the skin. We selected the optimal wavelength and parameters for this patient's unique situation, ensuring both safety and maximum effectiveness. ${pick(
          comfortPhrases
        )}.`,
      ];
      return pick(laserDetails);
    }
  }

  // RF/ENERGY treatments (Everesse, Agnes, Scarlet)
  if (
    nameLower.includes("everesse") ||
    nameLower.includes("rf") ||
    nameLower.includes("radiofrequency")
  ) {
    const rfDetails = [
      `${pick(
        openings
      )} Advanced radiofrequency treatment that delivers controlled thermal energy deep into the skin. This triggers a natural tightening response and stimulates long-term collagen production. The device's sophisticated temperature monitoring ensures optimal results with complete safety. ${pick(
        comfortPhrases
      )}, and results ${pick(gradualResults)}.`,
      `${pick(
        openings
      )} Cutting-edge RF technology that firms and lifts without surgery. The treatment heats the deeper layers of skin to trigger collagen contraction and new collagen formation. Patients typically see immediate tightening that continues to improve for months as new collagen matures.`,
      `${pick(
        openings
      )} Non-invasive skin tightening using medical-grade radiofrequency energy. We targeted areas of laxity with precise, controlled heating that stimulates the body's natural firming mechanisms. No incisions, no downtime—just gradually tightening, rejuvenating skin.`,
    ];
    return pick(rfDetails);
  }

  if (
    nameLower.includes("agnes") ||
    nameLower.includes("scarlet") ||
    nameLower.includes("microneedling")
  ) {
    const microneedlingDetails = [
      `${pick(
        openings
      )} Precision microneedling with radiofrequency—a powerful combination that remodels skin from the inside out. Tiny needles create micro-channels while delivering RF energy directly where it's needed most. The result is dramatically improved texture, firmness, and overall skin quality.`,
      `${pick(
        openings
      )} Advanced microneedling therapy that goes beyond surface treatment. The controlled micro-injuries trigger a cascade of healing responses—collagen production, elastin formation, and cellular renewal. Combined with customized serums, this treatment transforms skin quality over a series of sessions.`,
      `${pick(
        openings
      )} Next-generation microneedling that combines mechanical and thermal stimulation for enhanced results. The treatment creates thousands of tiny channels that heal quickly while signaling the body to produce fresh, healthy collagen. Results ${pick(
        gradualResults
      )}.`,
    ];
    return pick(microneedlingDetails);
  }

  // KYBELLA
  if (nameLower.includes("kybella")) {
    const kybellaDetails = [
      `${pick(
        openings
      )} Kybella treatment—the only FDA-approved injectable that actually destroys fat cells. A series of small injections delivers deoxycholic acid, the same molecule your body uses to break down dietary fat, directly into the submental area. The treated fat cells are gone for good, revealing a sleeker, more defined profile.`,
      `${pick(
        openings
      )} Targeted fat reduction using Kybella injections. We carefully mapped the treatment area and placed injections in a precise grid pattern to ensure even fat reduction. Yes, there's swelling for a few days—that's the treatment working. But the result is a permanently reduced double chin.`,
      `${pick(
        openings
      )} Non-surgical chin contouring with Kybella. This treatment specifically targets and destroys fat cells under the chin, cells that diet and exercise often can't touch. Over a series of treatments, the profile becomes noticeably more defined and sculpted.`,
    ];
    return pick(kybellaDetails);
  }

  // BODY CONTOURING (PHYSIQ)
  if (
    nameLower.includes("physiq") ||
    nameLower.includes("body contour") ||
    nameLower.includes("fat")
  ) {
    const bodyDetails = [
      `${pick(
        openings
      )} PHYSIQ body sculpting—a revolutionary treatment that simultaneously builds muscle and reduces fat. Four applicators work in concert, delivering electrical muscle stimulation and thermal energy to trouble spots. Patients relax while the technology does the work of thousands of exercises. Zero downtime, real results.`,
      `${pick(
        openings
      )} Advanced body contouring using PHYSIQ's dual-action technology. The treatment alternates between heating fat cells and stimulating muscle contractions, essentially reshaping the treatment area from both angles. Most patients complete their session feeling like they've had an incredible workout—because in a way, they have.`,
      `${pick(
        openings
      )} Non-invasive body sculpting that goes beyond what diet and exercise can achieve alone. The PHYSIQ system targets stubborn fat deposits while simultaneously toning underlying muscle. Results become visible over weeks as the body processes treated fat cells and muscles become more defined.`,
    ];
    return pick(bodyDetails);
  }

  // THREAD LIFT
  if (nameLower.includes("thread")) {
    const threadDetails = [
      `${pick(
        openings
      )} PDO thread lift—a non-surgical facelift alternative that provides immediate lifting with long-lasting results. Dissolvable threads are placed beneath the skin to physically lift sagging tissue while stimulating collagen production along their length. The threads dissolve over months, but the collagen scaffolding they create remains.`,
      `${pick(
        openings
      )} Strategic thread placement that repositions tissue and stimulates natural rejuvenation. We mapped the optimal insertion points for this patient's unique anatomy, then placed threads at varying depths to create a natural-looking lift. Results are ${pick(
        immediateResults
      )} and continue improving for months.`,
      `${pick(
        openings
      )} Minimally invasive thread lift that achieves surgical-like results without surgery. The specialized threads act as a supportive lattice, lifting skin while triggering the body to produce fresh collagen. ${pick(
        comfortPhrases
      )}, with minimal recovery time.`,
    ];
    return pick(threadDetails);
  }

  // AQUAFIRME/HYDRAFACIAL type
  if (
    nameLower.includes("aquafirme") ||
    nameLower.includes("hydra") ||
    nameLower.includes("facial")
  ) {
    const facialDetails = [
      `${pick(
        openings
      )} A comprehensive skin treatment that cleanses, exfoliates, extracts, and hydrates in one luxurious session. Advanced vacuum technology removes impurities while simultaneously infusing skin with potent antioxidants, peptides, and hyaluronic acid. Patients leave with immediately visible radiance and deeply hydrated skin.`,
      `${pick(
        openings
      )} Multi-step facial treatment using cutting-edge technology for maximum results. We combined deep cleansing, gentle resurfacing, extractions, and customized serum infusion to address this patient's specific skin needs. The treatment is relaxing, with zero downtime and instant glow.`,
      `${pick(
        openings
      )} Advanced facial therapy that delivers visible results in a single session. Using proprietary serums and state-of-the-art delivery systems, we cleansed, treated, and nourished the skin at every level. ${pick(
        comfortPhrases
      )}—many patients describe it as one of the most relaxing treatments they've ever experienced.`,
    ];
    return pick(facialDetails);
  }

  // SURGICAL (Rhinoplasty, Blepharoplasty)
  if (nameLower.includes("rhinoplasty") || nameLower.includes("nose")) {
    if (
      nameLower.includes("liquid") ||
      nameLower.includes("non-surgical") ||
      nameLower.includes("filler")
    ) {
      const liquidRhinoDetails = [
        `${pick(
          openings
        )} Non-surgical nose reshaping using precisely placed dermal filler. This technique allows us to smooth bumps, lift drooping tips, and improve symmetry—all without surgery. Strategic filler placement can actually make the nose appear smaller by creating better proportions. Results are ${pick(
          immediateResults
        )}, with no downtime.`,
        `${pick(
          openings
        )} Liquid rhinoplasty—the art of reshaping the nose with injectable filler. We placed small amounts of product at key points to straighten the profile, refine the tip, and create better balance. The treatment takes about 15 minutes and the results speak for themselves.`,
        `${pick(
          openings
        )} Expert non-surgical nose refinement using hyaluronic acid filler. By building up specific areas, we can camouflage bumps, improve tip projection, and create better overall nasal aesthetics. ${pick(
          comfortPhrases
        )}, and there's no recovery period.`,
      ];
      return pick(liquidRhinoDetails);
    }
  }

  if (nameLower.includes("blepharoplasty") || nameLower.includes("eyelid")) {
    const blepDetails = [
      `${pick(
        openings
      )} Precision eyelid surgery that removes excess skin and repositions fat pads for a refreshed, natural appearance. Incisions were placed in natural creases, becoming virtually invisible once healed. The transformation from tired-looking eyes to bright, youthful eyes is remarkable—and permanent.`,
      `${pick(
        openings
      )} Expert blepharoplasty tailored to this patient's unique anatomy and aesthetic goals. We removed just enough tissue to open up the eyes without changing their essential character. The result is looking rested and refreshed, not "worked on."`,
      `${pick(
        openings
      )} Surgical rejuvenation of the eye area with meticulous attention to natural aesthetics. Excess skin was removed, fat was repositioned (not removed) to maintain volume, and incisions were closed with precision suturing for minimal scarring. Recovery takes about two weeks, but the results last for years.`,
    ];
    return pick(blepDetails);
  }

  // Generic fallback with personality
  const genericDetails = [
    `${pick(openings)} A customized ${
      treatmentModality.name
    } treatment designed specifically for this patient's unique needs. We combined clinical expertise with artistic vision to create a treatment plan that enhances natural features rather than changing them. ${pick(
      comfortPhrases
    )}, and results were ${pick(immediateResults)}.`,
    `${pick(openings)} Expert ${
      treatmentModality.name
    } therapy using premium products and refined technique. Every aspect of the treatment was personalized—from product selection to application method—ensuring optimal results. The transformation reflects our commitment to natural-looking enhancement.`,
    `${pick(
      openings
    )} A thoughtfully crafted treatment session using advanced ${
      treatmentModality.name
    } techniques. We focused on achieving meaningful improvement while maintaining the natural harmony of the face. ${pick(
      comfortPhrases
    )}, with results that ${pick(gradualResults)}.`,
  ];
  return pick(genericDetails);
}

function generateMatchingCriteria(treatmentName, solvedIssues, fields) {
  const criteria = [];
  const nameLower = treatmentName.toLowerCase();

  // Add criteria based on solved issues
  solvedIssues.forEach((issue) => {
    const issueLower = issue.toLowerCase();
    if (
      issueLower.includes("skin") ||
      issueLower.includes("tone") ||
      issueLower.includes("spot")
    ) {
      criteria.push("skin-rejuvenation", "even-skin-tone", "reduce-spots");
    }
    if (issueLower.includes("eye") || issueLower.includes("under-eye")) {
      criteria.push("under-eye-rejuvenation");
    }
    if (issueLower.includes("jawline") || issueLower.includes("definition")) {
      criteria.push("improve-definition", "facial-balancing");
    }
    if (issueLower.includes("forehead") || issueLower.includes("wrinkle")) {
      criteria.push("forehead-wrinkles");
    }
    if (issueLower.includes("aging") || issueLower.includes("anti-aging")) {
      criteria.push("anti-aging");
    }
    // Body concerns
    if (
      issueLower.includes("hair") ||
      issueLower.includes("unwanted hair") ||
      issueLower.includes("hair removal")
    ) {
      criteria.push(
        "unwanted-hair",
        "hair-removal",
        "laser-hair-removal",
        "body-hair",
        "facial-hair"
      );
    }
    if (
      issueLower.includes("fat") ||
      issueLower.includes("stubborn fat") ||
      issueLower.includes("body contour")
    ) {
      criteria.push(
        "stubborn-fat",
        "body-contouring",
        "fat-reduction",
        "body-sculpting",
        "trouble-spots"
      );
    }
  });

  // Add criteria based on treatment name
  if (nameLower.includes("facial") || nameLower.includes("balance")) {
    criteria.push("facial-balancing");
  }
  if (nameLower.includes("natural")) {
    criteria.push("natural-look");
  }
  // Body treatment matching
  if (
    nameLower.includes("hair removal") ||
    nameLower.includes("laser hair") ||
    nameLower.includes("motus")
  ) {
    criteria.push(
      "unwanted-hair",
      "hair-removal",
      "laser-hair-removal",
      "body-hair",
      "facial-hair"
    );
  }
  if (
    nameLower.includes("body contour") ||
    nameLower.includes("physiq") ||
    nameLower.includes("everesse") ||
    nameLower.includes("fat reduction")
  ) {
    criteria.push(
      "stubborn-fat",
      "body-contouring",
      "fat-reduction",
      "body-sculpting",
      "trouble-spots"
    );
  }

  // Remove duplicates
  return [...new Set(criteria)];
}

// Lenient matching function for checking if issues have photos
// This is less strict than getStrictMatchingCasesForIssue to catch more cases
function getLenientMatchingCasesForIssue(issueName) {
  const issueNameLower = issueName.toLowerCase();

  // Get mapped variations
  const mappedVariations = issueNameMappings[issueNameLower] || [];

  // Create search terms - more lenient
  const searchTerms = [
    issueNameLower,
    issueNameLower.replace(/\s+/g, "-"),
    issueNameLower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    ...mappedVariations.map((v) => v.toLowerCase()),
    ...mappedVariations.map((v) => v.toLowerCase().replace(/\s+/g, "-")),
  ];

  // Also extract key words from issue name (include words 3+ chars, but also important short words)
  const importantShortWords = [
    "mid",
    "eye",
    "lip",
    "jaw",
    "chin",
    "nose",
    "neck",
  ];
  const issueWords = issueNameLower
    .split(/\s+/)
    .filter(
      (w) => w.length > 3 || (w.length >= 3 && importantShortWords.includes(w))
    );

  // Remove duplicates
  const uniqueSearchTerms = [...new Set(searchTerms)].filter(
    (term) => term.length > 2
  );

  return caseData.filter((caseItem) => {
    const caseNameLower = caseItem.name.toLowerCase();
    const solvedIssues = caseItem.solved.map((s) => s.toLowerCase());
    const matchingCriteria = caseItem.matchingCriteria.map((c) =>
      c.toLowerCase()
    );

    // Combine all text to search
    const allText = [caseNameLower, ...solvedIssues, ...matchingCriteria].join(
      " "
    );

    // Check if any search term appears
    const hasExactMatch = uniqueSearchTerms.some((term) => {
      return (
        caseNameLower.includes(term) ||
        solvedIssues.some((s) => s.includes(term)) ||
        matchingCriteria.some((c) => c.includes(term)) ||
        allText.includes(term)
      );
    });

    // Also check if key words appear (at least 2 key words for multi-word issues)
    if (issueWords.length > 1) {
      const keyWordMatches = issueWords.filter((word) =>
        allText.includes(word)
      );
      // Special handling for "mid cheek flattening" - need "mid" and "cheek" or "cheek" and related terms
      if (issueNameLower.includes("mid cheek")) {
        const hasMid = allText.includes("mid");
        const hasCheek = allText.includes("cheek");
        const hasFlattening =
          allText.includes("flatten") ||
          allText.includes("volume") ||
          allText.includes("depletion") ||
          allText.includes("hollow");
        if ((hasMid && hasCheek) || (hasCheek && hasFlattening)) {
          return true;
        }
      }
      if (keyWordMatches.length >= Math.min(2, issueWords.length)) {
        return true;
      }
    }

    // Special handling for body concerns
    if (
      issueNameLower === "unwanted hair" ||
      issueNameLower === "stubborn fat"
    ) {
      // For body concerns, be more lenient - check if key terms appear in case name
      if (issueNameLower === "unwanted hair") {
        const hasHairTerm =
          caseNameLower.includes("hair") &&
          (caseNameLower.includes("removal") ||
            caseNameLower.includes("laser") ||
            caseNameLower.includes("motus"));
        if (hasHairTerm) return true;
      }
      if (issueNameLower === "stubborn fat") {
        const hasFatTerm =
          (caseNameLower.includes("body") &&
            caseNameLower.includes("contour")) ||
          caseNameLower.includes("fat") ||
          caseNameLower.includes("physiq") ||
          caseNameLower.includes("everesse");
        if (hasFatTerm) return true;
      }
    }

    return hasExactMatch;
  });
}

// Update which issues have cases with photos
function updateIssuesWithPhotos() {
  issuesWithPhotos.clear();

  // Check all issues using lenient matching
  Object.values(areasAndIssues)
    .flat()
    .forEach((issueName) => {
      const matchingCases = getLenientMatchingCasesForIssue(issueName);
      // Check if any matching case has actual photos (not placeholder SVGs)
      const hasPhotos = matchingCases.some((caseItem) => {
        const hasThumbnail =
          caseItem.thumbnail && !caseItem.thumbnail.includes("data:image/svg");
        const hasBeforeAfter =
          caseItem.beforeAfter &&
          !caseItem.beforeAfter.includes("data:image/svg");
        return hasThumbnail || hasBeforeAfter;
      });
      if (hasPhotos) {
        issuesWithPhotos.add(issueName);
      }
    });

  // Manually ensure new body concerns are accessible (they have cases, even if some use placeholders)
  // These will be updated with real images from Airtable
  const bodyConcernsWithCases = ["Unwanted Hair", "Stubborn Fat"];
  bodyConcernsWithCases.forEach((issue) => {
    // Force add these concerns as accessible - they have cases in the sample data
    // and will have real images from Airtable
    issuesWithPhotos.add(issue);
    console.log(`Force-added ${issue} to accessible issues`);
  });

  console.log(`Issues with photos: ${issuesWithPhotos.size}`);
  console.log("Issues with photos:", Array.from(issuesWithPhotos));
  console.log("Checking if body concerns are accessible:", {
    "Unwanted Hair": issuesWithPhotos.has("Unwanted Hair"),
    "Stubborn Fat": issuesWithPhotos.has("Stubborn Fat"),
    "Weight Loss": issuesWithPhotos.has("Weight Loss"),
  });

  // No custom dropdown initialization needed
}

// Check if an issue has photos available
function issueHasPhotos(issueName) {
  // Always allow these body concerns - they have cases (even if some use placeholders)
  const alwaysAccessible = ["Unwanted Hair", "Stubborn Fat"];
  if (alwaysAccessible.includes(issueName)) {
    return true;
  }
  return issuesWithPhotos.has(issueName);
}

// Fallback sample data
function loadSampleData() {
  caseData = [
    {
      id: 1,
      name: "Laser Skin Rejuvenation",
      thumbnail:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
      beforeAfter:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
      headline: "How I used laser to freshen and protect my skin",
      patient: "Julie, 53 years old",
      patientAge: 53,
      story:
        "This patient's life is full of outdoor activities and adventures, but she has noticed stubborn spots on her face that get more noticeable after long days in the sun. She was aiming to fade these spots and reduce skin cancer risks.",
      solved: ["even skin tone", "reduce spots"],
      treatment:
        "Fractional laser treatment targeting sun damage and age spots. The procedure uses advanced laser technology to break down pigmentation while stimulating collagen production for smoother, more even-toned skin.",
      matchingCriteria: ["skin-rejuvenation", "even-skin-tone", "reduce-spots"],
      commonForAge: null,
    },
    {
      id: 2,
      name: "Anti-Aging Facial Treatment",
      thumbnail:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23E5F6FE'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
      beforeAfter:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23E5F6FE'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
      headline:
        "Achieving a youthful appearance while maintaining a natural look",
      patient: "Sarah, 48 years old",
      patientAge: 48,
      story:
        "Looking into the mirror each morning, this patient started noticing signs of aging and grew frustrated by minimal results from skincare options. Her goal was achieving a youthful appearance while maintaining a natural look.",
      solved: ["forehead wrinkles", "anti-aging", "natural-look"],
      treatment:
        "Combination treatment including Botox for forehead lines and dermal fillers for volume restoration. The approach focuses on natural-looking results that enhance rather than alter facial features.",
      matchingCriteria: ["anti-aging", "forehead-wrinkles", "natural-look"],
      commonForAge: null,
    },
    {
      id: 3,
      name: "Jawline Definition",
      thumbnail:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FAD7A2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
      beforeAfter:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FAD7A2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
      headline: "Restoring jawline definition for a more sculpted look",
      patient: "Michael, 45 years old",
      patientAge: 45,
      story:
        "This patient noticed his jawline becoming less defined over time, affecting his profile and overall facial structure. He wanted to restore definition without looking overdone.",
      solved: ["improve-definition", "facial-balancing"],
      treatment:
        "Jawline contouring using dermal fillers strategically placed along the jawline and chin. This creates a more defined, sculpted appearance that enhances the natural bone structure.",
      matchingCriteria: ["improve-definition", "facial-balancing"],
      commonForAge: null,
    },
    {
      id: 4,
      name: "Under Eye Rejuvenation",
      thumbnail:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23E8F5E9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%23212121'%3EBefore/After%3C/text%3E%3C/svg%3E",
      beforeAfter:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23E8F5E9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E",
      headline: "Brightening tired eyes for a refreshed appearance",
      patient: "Emma, 42 years old",
      patientAge: 42,
      story:
        "This patient was concerned about dark circles and under-eye bags that made her look tired even after a good night's sleep. She wanted a refreshed, well-rested appearance.",
      solved: ["under-eye-rejuvenation", "anti-aging"],
      treatment:
        "Under-eye filler treatment using hyaluronic acid fillers to smooth hollows and reduce the appearance of dark circles. The treatment provides immediate results with minimal downtime.",
      matchingCriteria: ["under-eye-rejuvenation", "anti-aging"],
      commonForAge: null,
    },
  ];
}

// Calculate common percentage for age
function calculateCommonForAge(caseItem, userAge) {
  if (!userAge || !caseItem.patientAge) {
    return Math.floor(Math.random() * 20 + 65) + "%"; // Random 65-85% if no age data
  }

  const ageDiff = Math.abs(caseItem.patientAge - userAge);

  // Calculate percentage based on age difference
  // Same age = 85%, within 5 years = 80%, within 10 years = 75%, etc.
  if (ageDiff === 0) {
    return "85%";
  } else if (ageDiff <= 2) {
    return "82%";
  } else if (ageDiff <= 5) {
    return "78%";
  } else if (ageDiff <= 10) {
    return "72%";
  } else if (ageDiff <= 15) {
    return "68%";
  } else {
    return "65%";
  }
}

// Vector-based demographic matching system
// Converts demographics to vectors and calculates similarity scores

// Demographic value mappings for vector conversion
const DEMOGRAPHIC_VECTORS = {
  skinTone: {
    light: 0.0,
    fair: 0.2,
    medium: 0.4,
    tan: 0.6,
    brown: 0.8,
    deep: 1.0,
  },
  skinType: {
    dry: 0.0,
    balanced: 0.33,
    combination: 0.67,
    oily: 1.0,
  },
  sunResponse: {
    "always burns": 0.0,
    "usually burns": 0.2,
    "sometimes tans": 0.4,
    "usually tans": 0.6,
    "always tans": 0.8,
    "rarely burns": 1.0,
  },
  ethnicBackground: {
    white: 0.0,
    asian: 0.2,
    "hispanic/latino": 0.4,
    "middle eastern": 0.6,
    mixed: 0.7,
    other: 0.8,
    black: 1.0,
  },
};

// Weights for each demographic dimension (sum should be ~1.0)
const DEMOGRAPHIC_WEIGHTS = {
  age: 0.25, // 25% weight
  skinTone: 0.25, // 25% weight
  ethnicBackground: 0.2, // 20% weight
  skinType: 0.15, // 15% weight
  sunResponse: 0.15, // 15% weight
};

/**
 * Convert user demographics to a vector representation
 * @param {Object} userSelections - User's demographic selections
 * @returns {Object} Vector representation with normalized values
 */
function userDemographicsToVector(userSelections) {
  const vector = {
    age: null,
    skinTone: null,
    ethnicBackground: null,
    skinType: null,
    sunResponse: null,
  };

  // Normalize age to 0-1 scale (assuming age range 18-80)
  if (userSelections.age) {
    vector.age = Math.max(
      0,
      Math.min(1, (userSelections.age - 18) / (80 - 18))
    );
  }

  // Map categorical values to numerical vectors
  if (
    userSelections.skinTone &&
    DEMOGRAPHIC_VECTORS.skinTone[userSelections.skinTone] !== undefined
  ) {
    vector.skinTone = DEMOGRAPHIC_VECTORS.skinTone[userSelections.skinTone];
  }

  if (
    userSelections.ethnicBackground &&
    DEMOGRAPHIC_VECTORS.ethnicBackground[userSelections.ethnicBackground] !==
      undefined
  ) {
    vector.ethnicBackground =
      DEMOGRAPHIC_VECTORS.ethnicBackground[userSelections.ethnicBackground];
  }

  if (
    userSelections.skinType &&
    DEMOGRAPHIC_VECTORS.skinType[userSelections.skinType] !== undefined
  ) {
    vector.skinType = DEMOGRAPHIC_VECTORS.skinType[userSelections.skinType];
  }

  if (
    userSelections.sunResponse &&
    DEMOGRAPHIC_VECTORS.sunResponse[userSelections.sunResponse] !== undefined
  ) {
    vector.sunResponse =
      DEMOGRAPHIC_VECTORS.sunResponse[userSelections.sunResponse];
  }

  return vector;
}

/**
 * Convert case demographics to a vector representation
 * @param {Object} caseItem - Case item with demographic fields
 * @returns {Object} Vector representation with normalized values
 */
function caseDemographicsToVector(caseItem) {
  const vector = {
    age: null,
    skinTone: null,
    ethnicBackground: null,
    skinType: null,
    sunResponse: null,
  };

  // Normalize age to 0-1 scale (assuming age range 18-80)
  if (caseItem.patientAge) {
    vector.age = Math.max(
      0,
      Math.min(1, (caseItem.patientAge - 18) / (80 - 18))
    );
  }

  // Map categorical values to numerical vectors
  if (
    caseItem.skinTone &&
    DEMOGRAPHIC_VECTORS.skinTone[caseItem.skinTone] !== undefined
  ) {
    vector.skinTone = DEMOGRAPHIC_VECTORS.skinTone[caseItem.skinTone];
  }

  if (
    caseItem.ethnicBackground &&
    DEMOGRAPHIC_VECTORS.ethnicBackground[caseItem.ethnicBackground] !==
      undefined
  ) {
    vector.ethnicBackground =
      DEMOGRAPHIC_VECTORS.ethnicBackground[caseItem.ethnicBackground];
  }

  if (
    caseItem.skinType &&
    DEMOGRAPHIC_VECTORS.skinType[caseItem.skinType] !== undefined
  ) {
    vector.skinType = DEMOGRAPHIC_VECTORS.skinType[caseItem.skinType];
  }

  if (
    caseItem.sunResponse &&
    DEMOGRAPHIC_VECTORS.sunResponse[caseItem.sunResponse] !== undefined
  ) {
    vector.sunResponse = DEMOGRAPHIC_VECTORS.sunResponse[caseItem.sunResponse];
  }

  return vector;
}

/**
 * Calculate weighted cosine similarity between two demographic vectors
 * @param {Object} userVector - User's demographic vector
 * @param {Object} caseVector - Case's demographic vector
 * @returns {number} Similarity score from 0 to 1
 */
function calculateDemographicSimilarity(userVector, caseVector) {
  let weightedSum = 0;
  let totalWeight = 0;

  // Calculate similarity for each dimension
  Object.keys(DEMOGRAPHIC_WEIGHTS).forEach((dimension) => {
    const weight = DEMOGRAPHIC_WEIGHTS[dimension];
    const userValue = userVector[dimension];
    const caseValue = caseVector[dimension];

    // Only calculate if both values exist
    if (
      userValue !== null &&
      userValue !== undefined &&
      caseValue !== null &&
      caseValue !== undefined
    ) {
      // Calculate similarity: 1 - absolute difference (closer = more similar)
      const similarity = 1 - Math.abs(userValue - caseValue);
      weightedSum += similarity * weight;
      totalWeight += weight;
    }
  });

  // If no dimensions matched, return 0
  if (totalWeight === 0) {
    return 0;
  }

  // Normalize by total weight to get 0-1 score
  return weightedSum / totalWeight;
}

/**
 * Calculate demographic match percentage for a case
 * @param {Object} caseItem - Case item with demographic fields
 * @param {Object} userSelections - User's demographic selections
 * @returns {number} Match percentage (0-100)
 */
function calculateDemographicMatchPercentage(caseItem, userSelections) {
  const userVector = userDemographicsToVector(userSelections);
  const caseVector = caseDemographicsToVector(caseItem);

  const similarity = calculateDemographicSimilarity(userVector, caseVector);

  // Convert to percentage and round
  return Math.round(similarity * 100);
}

// Filter cases by age (within ±15 years by default)
function filterCasesByAge(cases, userAge, ageRange = 15) {
  if (!userAge) return cases;

  return cases.filter((caseItem) => {
    if (!caseItem.patientAge) return true; // Include if no age data
    const ageDiff = Math.abs(caseItem.patientAge - userAge);
    return ageDiff <= ageRange;
  });
}

// Calculate matching score (0-100) based on demographics and interests
function calculateMatchingScore(caseItem, userSelections) {
  let score = 0;
  const maxScore = 100;

  // Age match (30 points max)
  if (userSelections.age && caseItem.patientAge) {
    const ageDiff = Math.abs(caseItem.patientAge - userSelections.age);
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
  } else if (!userSelections.age || !caseItem.patientAge) {
    score += 15; // Partial credit if age data missing
  }

  // High-level category match (50 points max)
  if (
    userSelections.selectedConcernCategories &&
    userSelections.selectedConcernCategories.length > 0
  ) {
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = (caseItem.matchingCriteria || []).map((c) =>
      c.toLowerCase()
    );

    let categoryMatches = 0;
    userSelections.selectedConcernCategories.forEach((categoryId) => {
      const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
      if (category) {
        // Check if case name matches category keywords
        const nameMatch = category.mapsToPhotos.some((keyword) =>
          caseNameLower.includes(keyword.toLowerCase())
        );
        // Check if matching criteria matches
        const criteriaMatch = category.mapsToPhotos.some((keyword) =>
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
        categoryMatches / userSelections.selectedConcernCategories.length;
      score += Math.round(matchRatio * 50);
    }
  }

  // Demographic match using vector-based similarity (30 points max)
  const demographicMatchPercentage = calculateDemographicMatchPercentage(
    caseItem,
    userSelections
  );
  const demographicScore = (demographicMatchPercentage / 100) * 30; // Convert percentage to 30-point scale
  score += demographicScore;

  // Store the match percentage on the case item for display
  caseItem.demographicMatchPercentage = demographicMatchPercentage;

  // Legacy: Interest match for backward compatibility (if no categories selected)
  if (
    !userSelections.selectedConcernCategories ||
    userSelections.selectedConcernCategories.length === 0
  ) {
    const allSelections = [
      ...userSelections.overallGoals,
      ...(userSelections.selectedIssues || []).map((issue) =>
        issue
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      ),
    ];

    if (allSelections.length > 0 && caseItem.matchingCriteria.length > 0) {
      const matchingCount = caseItem.matchingCriteria.filter((criteria) =>
        allSelections.includes(criteria)
      ).length;

      const totalCriteria = caseItem.matchingCriteria.length;
      const matchRatio =
        matchingCount / Math.max(totalCriteria, allSelections.length);
      score += Math.round(matchRatio * 50);
    } else if (allSelections.length === 0) {
      score += 25; // Partial credit if no selections
    }
  }

  return Math.min(score, maxScore);
}

/**
 * Get area tags for a treatment group (which facial/body areas it relates to)
 * Returns an array of area names like ["Eyes", "Forehead"]
 * This is shown to help users understand which area each suggestion addresses
 */
function getTreatmentGroupRelevance(group, userSelections) {
  const areas = [];
  const caseNameLower = (group.suggestion || "").toLowerCase();

  // Map keywords to areas - order matters (more specific first)
  // This helps identify which facial/body area each suggestion addresses
  // Updated to match Airtable "Area Names" field mapping
  const areaKeywords = [
    // Forehead area (brow ptosis and asymmetry map to Forehead in Airtable)
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
    { keywords: ["cheek", "cheeks", "cheekbone", "mid cheek"], area: "Cheeks" },
    // Nose area
    { keywords: ["nose", "nasal", "nasal tip", "dorsal hump"], area: "Nose" },
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
    { keywords: ["chin", "retruded chin", "labiomental"], area: "Chin" },
    // Neck area
    { keywords: ["neck", "neck lines", "neck wrinkles"], area: "Neck" },
  ];

  // Check which areas this suggestion relates to (based on keywords in the name)
  // Check more specific keywords first to avoid double-matching (e.g., "brow ptosis" before "brow")
  const matchedAreas = new Set();
  const matchedKeywords = new Set(); // Track matched keywords to avoid substring matches

  // Sort area keyword groups by longest keyword first (more specific first)
  const sortedAreaKeywords = areaKeywords.map(({ keywords, area }) => ({
    keywords: keywords.sort((a, b) => b.length - a.length), // Sort keywords within group by length
    area,
  }));

  for (const { keywords, area } of sortedAreaKeywords) {
    for (const keyword of keywords) {
      // Skip if a more specific keyword that contains this keyword already matched
      const isSubstringOfMatched = Array.from(matchedKeywords).some(
        (matched) => matched.includes(keyword) && matched !== keyword
      );

      if (!isSubstringOfMatched && caseNameLower.includes(keyword)) {
        matchedAreas.add(area);
        matchedKeywords.add(keyword);
        break; // Found a match for this area, move to next area
      }
    }
  }

  // Filter to only include areas that the user actually selected
  const userSelectedAreas = userSelections.selectedAreas || [];
  if (userSelectedAreas.length === 0) {
    return []; // No areas selected, return empty
  }

  // Map user's selected area IDs to area names
  const userSelectedAreaNames = userSelectedAreas
    .map((areaId) => {
      const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
      return area ? area.name : null;
    })
    .filter((name) => name !== null);

  // Only return areas that match both the suggestion keywords AND user's selections
  return Array.from(matchedAreas).filter((area) =>
    userSelectedAreaNames.includes(area)
  );
}

/**
 * Get detailed breakdown of similarity score for a case
 * Returns an object with score breakdown and explanations
 */
function getSimilarityScoreBreakdown(caseItem, userSelections) {
  const breakdown = {
    totalScore: caseItem.demographicMatchPercentage || 0,
    components: [],
    totalWeight: 0,
  };

  const userVector = userDemographicsToVector(userSelections);
  const caseVector = caseDemographicsToVector(caseItem);

  // First pass: calculate all similarities and contributions
  const componentData = [];
  let totalWeight = 0;

  // Age component
  if (userVector.age !== null && caseVector.age !== null) {
    const ageDiff = Math.abs(userSelections.age - caseItem.patientAge);
    const vectorDiff = Math.abs(userVector.age - caseVector.age);
    const similarity = 1 - vectorDiff; // 0-1 scale
    const similarityPercent = Math.round(similarity * 100);
    const weight = DEMOGRAPHIC_WEIGHTS.age;
    const rawContribution = similarity * weight;
    totalWeight += weight;

    componentData.push({
      field: "Age",
      userValue: `${userSelections.age} years`,
      caseValue: `${caseItem.patientAge} years`,
      difference:
        ageDiff === 0
          ? "Exact match"
          : `${ageDiff} year${ageDiff !== 1 ? "s" : ""} difference`,
      similarity: similarityPercent,
      weight: Math.round(weight * 100),
      rawContribution: rawContribution,
    });
  }

  // Skin tone component
  if (userVector.skinTone !== null && caseVector.skinTone !== null) {
    const vectorDiff = Math.abs(userVector.skinTone - caseVector.skinTone);
    const similarity = 1 - vectorDiff;
    const similarityPercent = Math.round(similarity * 100);
    const weight = DEMOGRAPHIC_WEIGHTS.skinTone;
    const rawContribution = similarity * weight;
    totalWeight += weight;

    componentData.push({
      field: "Complexion",
      userValue: userSelections.skinTone,
      caseValue: caseItem.skinTone,
      difference:
        userSelections.skinTone === caseItem.skinTone
          ? "Exact match"
          : "Similar",
      similarity: similarityPercent,
      weight: Math.round(weight * 100),
      rawContribution: rawContribution,
    });
  }

  // Ethnic background component
  if (
    userVector.ethnicBackground !== null &&
    caseVector.ethnicBackground !== null
  ) {
    const vectorDiff = Math.abs(
      userVector.ethnicBackground - caseVector.ethnicBackground
    );
    const similarity = 1 - vectorDiff;
    const similarityPercent = Math.round(similarity * 100);
    const weight = DEMOGRAPHIC_WEIGHTS.ethnicBackground;
    const rawContribution = similarity * weight;
    totalWeight += weight;

    componentData.push({
      field: "Background",
      userValue: userSelections.ethnicBackground,
      caseValue: caseItem.ethnicBackground,
      difference:
        userSelections.ethnicBackground === caseItem.ethnicBackground
          ? "Exact match"
          : "Similar",
      similarity: similarityPercent,
      weight: Math.round(weight * 100),
      rawContribution: rawContribution,
    });
  }

  // Skin type component
  if (userVector.skinType !== null && caseVector.skinType !== null) {
    const vectorDiff = Math.abs(userVector.skinType - caseVector.skinType);
    const similarity = 1 - vectorDiff;
    const similarityPercent = Math.round(similarity * 100);
    const weight = DEMOGRAPHIC_WEIGHTS.skinType;
    const rawContribution = similarity * weight;
    totalWeight += weight;

    componentData.push({
      field: "Skin Type",
      userValue: userSelections.skinType,
      caseValue: caseItem.skinType,
      difference:
        userSelections.skinType === caseItem.skinType
          ? "Exact match"
          : "Similar",
      similarity: similarityPercent,
      weight: Math.round(weight * 100),
      rawContribution: rawContribution,
    });
  }

  // Sun response component
  if (userVector.sunResponse !== null && caseVector.sunResponse !== null) {
    const vectorDiff = Math.abs(
      userVector.sunResponse - caseVector.sunResponse
    );
    const similarity = 1 - vectorDiff;
    const similarityPercent = Math.round(similarity * 100);
    const weight = DEMOGRAPHIC_WEIGHTS.sunResponse;
    const rawContribution = similarity * weight;
    totalWeight += weight;

    componentData.push({
      field: "Sun Response",
      userValue: userSelections.sunResponse,
      caseValue: caseItem.sunResponse,
      difference:
        userSelections.sunResponse === caseItem.sunResponse
          ? "Exact match"
          : "Similar",
      similarity: similarityPercent,
      weight: Math.round(weight * 100),
      rawContribution: rawContribution,
    });
  }

  // Second pass: calculate final contributions (normalized by total weight)
  breakdown.totalWeight = totalWeight;
  componentData.forEach((comp) => {
    // Contribution to final score = (rawContribution / totalWeight) * 100
    const finalContribution =
      totalWeight > 0 ? (comp.rawContribution / totalWeight) * 100 : 0;

    breakdown.components.push({
      field: comp.field,
      userValue: comp.userValue,
      caseValue: comp.caseValue,
      difference: comp.difference,
      similarity: comp.similarity,
      weight: comp.weight,
      contribution: Math.round(finalContribution),
    });
  });

  return breakdown;
}

// Get match indicators for a case
// excludeAreasAndConcerns: if true, only return demographic matches (for case cards)
function getMatchIndicators(
  caseItem,
  userSelections,
  excludeAreasAndConcerns = false
) {
  const indicators = [];

  // Age match
  if (userSelections.age && caseItem.patientAge) {
    const ageDiff = Math.abs(caseItem.patientAge - userSelections.age);
    if (ageDiff <= 5) {
      indicators.push({
        type: "age",
        text: `Similar age (${caseItem.patientAge})`,
      });
    }
  }

  // Skin tone/complexion match
  if (userSelections.skinTone && caseItem.skinTone) {
    if (userSelections.skinTone === caseItem.skinTone) {
      indicators.push({ type: "skin-tone", text: "Similar complexion" });
    }
  }

  // Ethnic background match
  if (userSelections.ethnicBackground && caseItem.ethnicBackground) {
    if (userSelections.ethnicBackground === caseItem.ethnicBackground) {
      indicators.push({
        type: "ethnic-background",
        text: "Similar background",
      });
    }
  }

  // Skin type match
  if (userSelections.skinType && caseItem.skinType) {
    if (userSelections.skinType === caseItem.skinType) {
      indicators.push({ type: "skin-type", text: "Similar skin type" });
    }
  }

  // Sun response match
  if (userSelections.sunResponse && caseItem.sunResponse) {
    if (userSelections.sunResponse === caseItem.sunResponse) {
      indicators.push({ type: "sun-response", text: "Similar sun response" });
    }
  }

  // Only include area/concern matches if not excluded (for treatment group cards)
  if (!excludeAreasAndConcerns) {
    // Category match
    if (
      userSelections.selectedConcernCategories &&
      userSelections.selectedConcernCategories.length > 0
    ) {
      const caseNameLower = (caseItem.name || "").toLowerCase();
      userSelections.selectedConcernCategories.forEach((categoryId) => {
        const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
        if (
          category &&
          category.mapsToPhotos.some((keyword) =>
            caseNameLower.includes(keyword.toLowerCase())
          )
        ) {
          indicators.push({
            type: "concern",
            text: `Matches: ${category.name}`,
          });
        }
      });
    }

    // Area match - show which specific areas this case relates to
    const caseNameLower = (caseItem.name || "").toLowerCase();
    const matchingCriteriaLower = (caseItem.matchingCriteria || []).map((c) =>
      typeof c === "string" ? c.toLowerCase() : String(c || "").toLowerCase()
    );

    // Map of keywords to area names for inference (matching AREAS_OF_CONCERN)
    // Order matters: more specific keywords should come first
    const areaKeywords = {
      // Forehead area (more specific brow terms first)
      "brow ptosis": "Forehead", // Brow ptosis maps to Forehead in Airtable
      "brow asymmetry": "Forehead", // Brow asymmetry maps to Forehead in Airtable
      "brow lift": "Forehead",
      "brow balance": "Forehead",
      forehead: "Forehead",
      temple: "Forehead",
      temples: "Forehead",
      glabella: "Forehead",
      temporal: "Forehead",
      // Eyes area
      "under eye": "Eyes",
      "under-eye": "Eyes",
      eyelid: "Eyes",
      eyelids: "Eyes",
      "upper eyelid": "Eyes",
      "lower eyelid": "Eyes",
      eye: "Eyes",
      eyes: "Eyes",
      brow: "Eyes", // General brow (not ptosis/asymmetry) relates to Eyes
      brows: "Eyes",
      eyebrow: "Eyes",
      eyebrows: "Eyes",
      ptosis: "Eyes", // General ptosis (not brow ptosis) relates to Eyes
      // Cheeks area
      cheek: "Cheeks",
      cheeks: "Cheeks",
      cheekbone: "Cheeks",
      "mid cheek": "Cheeks",
      // Nose area
      nose: "Nose",
      nasal: "Nose",
      "nasal tip": "Nose",
      "dorsal hump": "Nose",
      rhino: "Nose",
      // Mouth & Lips area
      lip: "Mouth & Lips",
      lips: "Mouth & Lips",
      mouth: "Mouth & Lips",
      philtral: "Mouth & Lips",
      "gummy smile": "Mouth & Lips",
      // Jawline area (consolidate chin/jaw to jawline to match Airtable)
      jawline: "Jawline",
      jaw: "Jawline",
      chin: "Jawline", // Chin maps to Jawline in Airtable
      jowl: "Jawline",
      jowls: "Jawline",
      prejowl: "Jawline",
      submentum: "Jawline",
      // Neck area
      neck: "Neck",
      "neck lines": "Neck",
      "neck wrinkles": "Neck",
      platysmal: "Neck",
      submental: "Neck",
    };

    // Find matching areas from user selections
    const matchedAreas = new Set();
    if (
      userSelections.selectedAreas &&
      userSelections.selectedAreas.length > 0
    ) {
      userSelections.selectedAreas.forEach((areaId) => {
        const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
        if (area) {
          const areaNameLower = area.name.toLowerCase();
          if (
            caseNameLower.includes(areaNameLower) ||
            matchingCriteriaLower.some(
              (c) => c.includes(areaNameLower) || c.includes(areaId)
            )
          ) {
            matchedAreas.add(area.name);
          }
        }
      });
    }

    // Also infer areas from case name keywords
    // This helps show which area the case relates to based on keywords in the name
    // Always show inferred area to help user understand which area the case addresses
    // Check more specific keywords first to avoid double-matching (e.g., "brow ptosis" before "brow")
    const allText = [caseNameLower, ...matchingCriteriaLower].join(" ");
    const matchedKeywords = new Set(); // Track which keywords matched to avoid substring matches

    // Sort keywords by length (longest first) to check more specific ones first
    const sortedKeywords = Object.entries(areaKeywords).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [keyword, areaName] of sortedKeywords) {
      // Skip if a more specific keyword that contains this keyword already matched
      const isSubstringOfMatched = Array.from(matchedKeywords).some(
        (matched) => matched.includes(keyword) && matched !== keyword
      );

      if (!isSubstringOfMatched && allText.includes(keyword)) {
        // Find the area ID for this area name
        const area = AREAS_OF_CONCERN.find((a) => a.name === areaName);
        if (area) {
          // Always add inferred area to show which area this case relates to
          matchedAreas.add(areaName);
          matchedKeywords.add(keyword);
        }
      }
    }

    // Add area indicators
    Array.from(matchedAreas).forEach((areaName) => {
      indicators.push({ type: "area", text: areaName });
    });
  }

  return indicators;
}

/**
 * Get match indicators for a group of cases (aggregated from all cases in the group)
 * @param {Array} cases - Array of case objects
 * @param {Object} userSelections - User's selections
 * @returns {Array} - Array of match indicator objects
 */
function getGroupMatchIndicators(cases, userSelections) {
  if (!cases || cases.length === 0) return [];

  const indicators = new Map(); // Use Map to avoid duplicates

  // Check each case and collect unique indicators
  cases.forEach((caseItem) => {
    const caseIndicators = getMatchIndicators(caseItem, userSelections);
    caseIndicators.forEach((ind) => {
      // Use type+text as key to avoid duplicates
      const key = `${ind.type}-${ind.text}`;
      if (!indicators.has(key)) {
        indicators.set(key, ind);
      }
    });
  });

  // Convert to array and limit to most relevant ones
  return Array.from(indicators.values()).slice(0, 3);
}

// Onboarding navigation
let currentOnboardingSlide = 0;

function nextOnboardingSlide() {
  const slides = document.querySelectorAll(".onboarding-slide");
  if (currentOnboardingSlide < slides.length - 1) {
    slides[currentOnboardingSlide].classList.remove("active");
    currentOnboardingSlide++;
    slides[currentOnboardingSlide].classList.add("active");
  }
}

// Helper function to scroll to top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Define showOnboarding and make it available globally immediately
window.showOnboarding = function showOnboarding() {
  console.log("showOnboarding called");
  try {
    if (typeof trackEvent === "function") {
      trackEvent("onboarding_started");
    }

    const homeTeaser = document.getElementById("home-teaser");
    if (homeTeaser) {
      homeTeaser.classList.remove("active");
      console.log("Removed active from home-teaser");
    } else {
      console.warn("home-teaser element not found");
    }

    // Skip onboarding screens and go directly to form
    if (typeof startForm === "function") {
      startForm();
    } else {
      // Fallback: try to show onboarding if form function doesn't exist
      const onboarding = document.getElementById("onboarding");
      if (onboarding) {
        onboarding.classList.add("active");
        console.log("Added active to onboarding");
        // Reset to first slide
        if (typeof currentOnboardingSlide !== "undefined") {
          currentOnboardingSlide = 0;
        }
        if (typeof scrollToTop === "function") {
          scrollToTop();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        const slides = document.querySelectorAll(".onboarding-slide");
        console.log("Found", slides.length, "onboarding slides");
        slides.forEach((slide, index) => {
          slide.classList.toggle("active", index === 0);
        });
      } else {
        console.warn("Neither form nor onboarding found");
      }
    }
  } catch (error) {
    console.error("Error in showOnboarding:", error);
    // Fallback: try to show form directly
    if (typeof startForm === "function") {
      startForm();
    }
  }
};

// Keep showHomeTeaser for backward compatibility but it's not used in new flow
function showHomeTeaser() {
  showOnboarding();
}

// Initialize high-level concern category cards
function initializeConcernCategories() {
  // Try to find grid in form-step-1 first, then fall back to old location
  const formStep1 = document.getElementById("form-step-1");
  let grid = formStep1
    ? formStep1.querySelector("#concern-categories-grid")
    : null;
  if (!grid) {
    grid = document.getElementById("concern-categories-grid");
  }
  if (!grid) {
    console.warn("concern-categories-grid not found");
    return;
  }

  grid.innerHTML = "";

  // Filter out locked concerns (these will be available post-conversion)
  const availableConcerns = HIGH_LEVEL_CONCERNS.filter(
    (category) => !LOCKED_CONCERNS.includes(category.id)
  );

  // Group concerns by their group field
  const groupedConcerns = {};
  availableConcerns.forEach((category) => {
    const group = category.group || "Other";
    if (!groupedConcerns[group]) {
      groupedConcerns[group] = [];
    }
    groupedConcerns[group].push(category);
  });

  // Render each group with a header - only show Face and Body
  const groupsToShow = ["Face", "Body"];
  groupsToShow.forEach((groupName) => {
    if (
      !groupedConcerns[groupName] ||
      groupedConcerns[groupName].length === 0
    ) {
      return;
    }

    // Create group header
    const groupHeader = document.createElement("div");
    groupHeader.className = "concern-group-header";
    groupHeader.textContent = groupName;
    grid.appendChild(groupHeader);

    // Create group container
    const groupContainer = document.createElement("div");
    groupContainer.className = "concern-group-container";

    // Render cards for this group
    groupedConcerns[groupName].forEach((category) => {
      const card = document.createElement("div");
      card.className = "concern-category-card";
      card.dataset.categoryId = category.id;

      const isSelected = userSelections.selectedConcernCategories.includes(
        category.id
      );
      if (isSelected) {
        card.classList.add("selected");
      }

      // Icon SVG based on category
      const iconSvg = getCategoryIcon(category.icon);

      card.innerHTML = `
        <div class="category-card-icon">${iconSvg}</div>
        <div class="category-card-content">
          <h3 class="category-card-title">${category.name}</h3>
          <p class="category-card-description">${category.description}</p>
        </div>
        <div class="category-card-check">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      `;

      card.addEventListener("click", () => toggleConcernCategory(category.id));
      groupContainer.appendChild(card);
    });

    grid.appendChild(groupContainer);
  });

  updateConcernSelectionCount();
  updateProceedToGoalsButton();
}

// Initialize areas of concern selection
// Map area IDs to icon filenames in the area icons folder (PNG) or SVG icon names
const AREA_ICON_MAP = {
  forehead: "eyebrows.png", // Use eyebrows icon for forehead
  eyes: "eyes.png",
  cheeks: "cheeks.png",
  nose: "nose.png",
  "mouth-lips": "lips.png",
  jawline: "jawline.png",
  chin: "chin", // Use SVG icon
  neck: "neck", // Use SVG icon
  chest: "chest", // Use SVG icon
  hands: "hands", // Use SVG icon
  arms: "arms", // Use SVG icon
  body: "body", // Use SVG icon
};

function initializeAreasOfConcern() {
  const grid = document.getElementById("areas-of-concern-grid");
  if (!grid) {
    console.warn("areas-of-concern-grid not found");
    return;
  }

  grid.innerHTML = "";

  // Filter out locked areas (these will be available post-conversion)
  const availableAreas = AREAS_OF_CONCERN.filter(
    (area) => !LOCKED_AREAS.includes(area.id)
  );

  // Define which areas belong to Face vs Body
  const faceAreaIds = [
    "forehead",
    "eyes",
    "cheeks",
    "nose",
    "mouth-lips",
    "jawline",
    "chin",
    "neck",
  ];
  const bodyAreaIds = ["chest", "hands", "arms", "body"];

  // Group areas by Face and Body
  const faceAreas = availableAreas.filter((area) =>
    faceAreaIds.includes(area.id)
  );
  const bodyAreas = availableAreas.filter((area) =>
    bodyAreaIds.includes(area.id)
  );

  // Helper function to create area card
  const createAreaCard = (area) => {
    const card = document.createElement("div");
    card.className = "area-of-concern-card";
    card.dataset.areaId = area.id;

    const isSelected =
      userSelections.selectedAreas &&
      userSelections.selectedAreas.includes(area.id);
    if (isSelected) {
      card.classList.add("selected");
    }

    // Get icon filename or SVG icon name for this area
    const iconFilename = AREA_ICON_MAP[area.id];

    // Use PNG icon if filename ends with .png, otherwise use SVG icon
    let iconHtml = "";
    if (iconFilename && iconFilename.endsWith(".png")) {
      // Use selected icon folder if selected, otherwise use regular icon folder
      const iconFolder = isSelected ? "area icons - selected" : "area icons";
      iconHtml = `<img src="${iconFolder}/${iconFilename}" alt="${area.name}" class="area-icon-image" data-icon-filename="${iconFilename}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display: none;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v8M8 12h8"></path>
        </svg>`;
    } else if (iconFilename) {
      // Use SVG icon from getIconSVG function
      iconHtml = getIconSVG(iconFilename, 32);
    } else {
      // Fallback SVG for areas without icons
      iconHtml = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v8M8 12h8"></path>
      </svg>`;
    }

    card.innerHTML = `
      <div class="area-card-icon">${iconHtml}</div>
      <div class="area-card-content">
        <h3 class="area-card-title">${area.name}</h3>
      </div>
      <div class="area-card-check">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    card.addEventListener("click", () => toggleAreaOfConcern(area.id));
    return card;
  };

  // Render Face section
  if (faceAreas.length > 0) {
    const faceHeader = document.createElement("div");
    faceHeader.className = "concern-group-header";
    faceHeader.textContent = "Face";
    grid.appendChild(faceHeader);

    const faceContainer = document.createElement("div");
    faceContainer.className = "concern-group-container";
    faceAreas.forEach((area) => {
      faceContainer.appendChild(createAreaCard(area));
    });
    grid.appendChild(faceContainer);
  }

  // Render Body section
  if (bodyAreas.length > 0) {
    const bodyHeader = document.createElement("div");
    bodyHeader.className = "concern-group-header";
    bodyHeader.textContent = "Body";
    grid.appendChild(bodyHeader);

    const bodyContainer = document.createElement("div");
    bodyContainer.className = "concern-group-container";
    bodyAreas.forEach((area) => {
      bodyContainer.appendChild(createAreaCard(area));
    });
    grid.appendChild(bodyContainer);
  }
}

// Toggle area of concern selection
function toggleAreaOfConcern(areaId) {
  if (!userSelections.selectedAreas) {
    userSelections.selectedAreas = [];
  }

  const maxSelections = 3;
  const index = userSelections.selectedAreas.indexOf(areaId);

  if (index > -1) {
    // Deselect
    userSelections.selectedAreas.splice(index, 1);
    // Hide warning when deselecting
    hideAreaWarning();
  } else {
    // Select (if under limit)
    if (userSelections.selectedAreas.length < maxSelections) {
      userSelections.selectedAreas.push(areaId);
      // Hide warning when successfully selecting
      hideAreaWarning();
      // Clear validation error if one was shown
      hideValidationError();
    } else {
      showAreaWarning(`Please select up to ${maxSelections} areas.`);
      return;
    }
  }

  // Update window.userSelections
  if (window.userSelections) {
    window.userSelections.selectedAreas = userSelections.selectedAreas;
  }

  // Update UI
  const card = document.querySelector(`[data-area-id="${areaId}"]`);
  if (card) {
    const isSelected = userSelections.selectedAreas.includes(areaId);
    card.classList.toggle("selected", isSelected);

    // Update icon image source based on selection state (for PNG icons)
    const iconImage = card.querySelector(".area-icon-image");
    if (iconImage && iconImage.dataset.iconFilename) {
      const iconFilename = iconImage.dataset.iconFilename;
      const iconFolder = isSelected ? "area icons - selected" : "area icons";
      iconImage.src = `${iconFolder}/${iconFilename}`;
    }

    // For SVG icons, the color will change via CSS based on .selected class
    // No additional update needed as SVG icons use currentColor
  }

  // Collect form data to keep in sync
  if (typeof collectFormData === "function") {
    collectFormData();
  }

  // Clear validation error when an area is selected
  if (userSelections.selectedAreas && userSelections.selectedAreas.length > 0) {
    hideValidationError();
  }
}

// Get icon SVG for category
function getCategoryIcon(iconType) {
  const icons = {
    wrinkles: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
    </svg>`,
    volume: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>`,
    texture: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 12h8M12 8v8"></path>
    </svg>`,
    spots: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="8" cy="8" r="2"></circle>
      <circle cx="16" cy="16" r="2"></circle>
    </svg>`,
    acne: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="8" cy="8" r="1.5"></circle>
      <circle cx="16" cy="8" r="1.5"></circle>
      <circle cx="12" cy="16" r="1.5"></circle>
    </svg>`,
    body: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
    </svg>`,
    hair: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2v20M2 12h20"></path>
    </svg>`,
    balance: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2v20M2 12h20"></path>
      <circle cx="8" cy="8" r="2"></circle>
      <circle cx="16" cy="8" r="2"></circle>
      <circle cx="8" cy="16" r="2"></circle>
      <circle cx="16" cy="16" r="2"></circle>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,
    wellness: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>`,
    eyes: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,
  };
  return icons[iconType] || icons.wrinkles;
}

// Toggle concern category selection
function toggleConcernCategory(categoryId) {
  // Ensure selectedConcernCategories is initialized
  if (!userSelections.selectedConcernCategories) {
    userSelections.selectedConcernCategories = [];
  }

  const index = userSelections.selectedConcernCategories.indexOf(categoryId);
  const maxSelections = 3;

  console.log(
    "toggleConcernCategory called for:",
    categoryId,
    "current selections:",
    userSelections.selectedConcernCategories
  );

  if (index > -1) {
    // Deselect
    userSelections.selectedConcernCategories.splice(index, 1);
    // Hide warning when deselecting
    hideConcernWarning();
  } else {
    // Select (if under limit)
    if (userSelections.selectedConcernCategories.length < maxSelections) {
      userSelections.selectedConcernCategories.push(categoryId);
      // Hide warning when successfully selecting
      hideConcernWarning();
      // Clear validation error if one was shown
      hideValidationError();
    } else {
      showConcernWarning(`Please select up to ${maxSelections} concerns.`);
      return;
    }
  }

  // Update UI
  const card = document.querySelector(`[data-category-id="${categoryId}"]`);
  if (card) {
    card.classList.toggle("selected", index === -1);
  }

  updateConcernSelectionCount();

  // Directly update button disabled state
  const btn = document.getElementById("proceed-to-goals-btn");
  if (btn) {
    const count = userSelections.selectedConcernCategories.length;
    btn.disabled = count === 0;
    console.log("Button disabled:", btn.disabled, "count:", count);
  }

  console.log(
    "After toggle - selectedConcernCategories:",
    userSelections.selectedConcernCategories,
    "length:",
    userSelections.selectedConcernCategories.length
  );
}

// Update concern selection count display
function updateConcernSelectionCount() {
  const countEl = document.getElementById("concerns-count");
  if (countEl) {
    const count = userSelections.selectedConcernCategories.length;
    countEl.textContent = count;
  }
}

// Show concern warning message
function showConcernWarning(message) {
  const warningEl = document.getElementById("concern-warning-message");
  const warningText = document.getElementById("concern-warning-text");
  if (warningEl && warningText) {
    warningText.innerHTML = `${message}<br><span style="font-size: 13px; margin-top: 4px; display: block;">In-clinic consultations unlock access to all concerns and areas</span>`;
    warningEl.style.display = "flex";

    // Add booking button if it doesn't exist
    let bookingBtn = warningEl.querySelector(".warning-booking-btn");
    if (!bookingBtn) {
      bookingBtn = document.createElement("button");
      bookingBtn.className = "warning-booking-btn";
      bookingBtn.innerHTML = "Book In-Clinic Consultation";
      bookingBtn.onclick = (e) => {
        e.stopPropagation();
        requestConsultation();
      };
      warningEl.appendChild(bookingBtn);
    }

    // Auto-hide after 8 seconds (increased to give time to click)
    setTimeout(() => {
      hideConcernWarning();
    }, 8000);
  }
}

// Hide concern warning message
function hideConcernWarning() {
  const warningEl = document.getElementById("concern-warning-message");
  if (warningEl) {
    warningEl.style.display = "none";
  }
}

// Show area warning message
function showAreaWarning(message) {
  const warningEl = document.getElementById("area-warning-message");
  const warningText = document.getElementById("area-warning-text");
  if (warningEl && warningText) {
    warningText.innerHTML = `${message}<br><span style="font-size: 13px; margin-top: 4px; display: block;">In-clinic consultations unlock access to all concerns and areas</span>`;
    warningEl.style.display = "flex";

    // Add booking button if it doesn't exist
    let bookingBtn = warningEl.querySelector(".warning-booking-btn");
    if (!bookingBtn) {
      bookingBtn = document.createElement("button");
      bookingBtn.className = "warning-booking-btn";
      bookingBtn.innerHTML = "Book In-Clinic Consultation";
      bookingBtn.onclick = (e) => {
        e.stopPropagation();
        requestConsultation();
      };
      warningEl.appendChild(bookingBtn);
    }

    // Auto-hide after 8 seconds (increased to give time to click)
    setTimeout(() => {
      hideAreaWarning();
    }, 8000);
  }
}

// Hide area warning message
function hideAreaWarning() {
  const warningEl = document.getElementById("area-warning-message");
  if (warningEl) {
    warningEl.style.display = "none";
  }
}

// Handle start button click with error handling
function handleStartButtonClick() {
  try {
    if (typeof startForm === "function") {
      startForm();
    } else if (typeof showOnboarding === "function") {
      showOnboarding();
    } else {
      console.error(
        "Neither startForm nor showOnboarding functions are available"
      );
      alert("Please refresh the page and try again.");
    }
  } catch (error) {
    console.error("Error in handleStartButtonClick:", error);
    alert("An error occurred. Please refresh the page and try again.");
  }
}

function startForm() {
  console.log("startForm called");
  try {
    if (typeof trackEvent === "function") {
      trackEvent("form_started", { step: "concerns_selection" });
    }
  } catch (e) {
    console.warn("Error tracking event:", e);
  }

  // Hide onboarding and home teaser, show concerns selection screen
  const onboarding = document.getElementById("onboarding");
  const homeTeaser = document.getElementById("home-teaser");
  const concernsScreen = document.getElementById("concerns-selection-screen");
  const formScreen = document.getElementById("form-screen");

  console.log("Elements found:", {
    onboarding: !!onboarding,
    homeTeaser: !!homeTeaser,
    concernsScreen: !!concernsScreen,
    formScreen: !!formScreen,
  });

  if (onboarding) {
    onboarding.classList.remove("active");
    console.log("Removed active from onboarding");
  }

  if (homeTeaser) {
    homeTeaser.classList.remove("active");
    console.log("Removed active from homeTeaser");
  }

  // Show form screen and go to step 1 (concerns selection)
  if (formScreen) {
    formScreen.classList.add("active");
    console.log("Added active to form-screen");

    if (typeof scrollToTop === "function") {
      scrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Navigate to step 1 (concerns selection) first, then initialize
    setTimeout(() => {
      goToFormStep(1, true); // Skip validation when starting the form
      updateFormNavigation(1);

      // Initialize high-level concern categories after step is visible
      setTimeout(() => {
        try {
          if (typeof initializeConcernCategories === "function") {
            initializeConcernCategories();
            console.log("initializeConcernCategories completed");
            // Update button state after initialization
            if (typeof updateProceedToGoalsButton === "function") {
              updateProceedToGoalsButton();
            }
          } else {
            console.error("initializeConcernCategories function not found");
          }
        } catch (e) {
          console.error("Error in initializeConcernCategories:", e);
        }
      }, 50);
    }, 100);
  } else {
    console.error("Form screen not found");
  }
}

// Update proceed button state based on category selections
function updateProceedToGoalsButton() {
  // Update the old button if it exists (for backward compatibility)
  const oldBtn = document.getElementById("proceed-to-goals-btn");
  if (oldBtn) {
    const selections =
      (window.userSelections &&
        window.userSelections.selectedConcernCategories) ||
      userSelections.selectedConcernCategories ||
      [];
    oldBtn.disabled = selections.length === 0;
  }

  // Update the shared navigation button when on step 1
  const navContinueBtn = document.getElementById("nav-continue-btn");
  if (navContinueBtn) {
    const selections =
      (window.userSelections &&
        window.userSelections.selectedConcernCategories) ||
      userSelections.selectedConcernCategories ||
      [];
    navContinueBtn.disabled = selections.length === 0;
    console.log(
      "Updated nav continue button - selections:",
      selections.length,
      "disabled:",
      navContinueBtn.disabled
    );
  }
}

// Multi-step form navigation
function goToFormStep(stepNumber, skipValidation = false) {
  console.log("goToFormStep called:", stepNumber);

  // Validate before navigating to certain steps (unless validation is explicitly skipped)
  if (!skipValidation) {
    // Validate step 1 requirements before going to step 2
    if (stepNumber === 2) {
      const validation = validateStep1();
      if (!validation.isValid) {
        showValidationError(validation.message, validation.step);
        return; // Prevent navigation
      }
    }

    // Validate step 2 requirements before going to step 3
    if (stepNumber === 3) {
      const validation = validateStep2();
      if (!validation.isValid) {
        showValidationError(validation.message, validation.step);
        return; // Prevent navigation
      }
    }

    // Validate step 3 requirements before going to step 4 or 6
    if (stepNumber === 4 || stepNumber === 6) {
      const validation = validateStep3();
      if (!validation.isValid) {
        showValidationError(
          validation.message,
          validation.step,
          validation.field
        );
        return; // Prevent navigation
      }
    }
  }

  // Hide all steps and screens
  document.querySelectorAll(".form-step").forEach((step) => {
    step.classList.remove("active");
  });

  // Hide concerns selection screen if it exists separately
  const concernsScreen = document.getElementById("concerns-selection-screen");
  if (concernsScreen) {
    concernsScreen.classList.remove("active");
  }

  // Show form screen
  const formScreen = document.getElementById("form-screen");
  if (formScreen) {
    formScreen.classList.add("active");
  }

  // Show target step
  const targetStep = document.getElementById(`form-step-${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add("active");

    // Set up age input event listener when step 3 is shown
    if (stepNumber === 3) {
      setTimeout(() => {
        const ageInput = document.getElementById("patient-age");
        if (ageInput) {
          // Use a named function to avoid duplicate listeners
          function clearAgeError() {
            const ageValue = parseInt(ageInput.value);
            if (ageValue && ageValue >= 18) {
              hideInputError(ageInput);
              ageInput.classList.remove("input-error");
            }
          }

          // Remove old listeners by cloning (if needed)
          const hasListener = ageInput.getAttribute(
            "data-age-listener-attached"
          );
          if (!hasListener) {
            ageInput.addEventListener("input", clearAgeError, { once: false });
            ageInput.addEventListener("change", clearAgeError, { once: false });
            ageInput.setAttribute("data-age-listener-attached", "true");
          }
        }
      }, 100);
    }
  }

  // Update step indicators
  // Update Instagram Stories-style progress segments
  document.querySelectorAll(".form-step-segment").forEach((segment) => {
    const segmentStep = parseInt(segment.dataset.step) || 0;
    segment.classList.remove("active", "completed");

    // Skip step 5 (hidden)
    if (segmentStep === 5) {
      return;
    }

    if (segmentStep === stepNumber) {
      segment.classList.add("active");
    } else if (segmentStep < stepNumber) {
      segment.classList.add("completed");
    }
  });

  // Update title and subtitle based on step
  const titles = {
    1: {
      title: "Start Your Virtual Consultation",
      subtitle: "Select up to 3 main concerns that matter most to you",
    },
    2: {
      title: "Which Areas Are You Most Concerned About?",
      subtitle:
        "Select up to 3 areas that apply to help us show you the most relevant results",
    },
    3: {
      title: "Your Details",
      subtitle: "Help us personalize your treatment recommendations",
    },
    4: {
      title: "Optional Information",
      subtitle:
        "The more you share, the better we can match you with similar results",
    },
    5: {
      title: "Your Goals",
      subtitle: "Select all that apply to help us understand your priorities",
    },
    6: {
      title: "Review & Confirm",
      subtitle: "Please review your information before submitting",
    },
  };

  const stepInfo = titles[stepNumber] || titles[1];
  const titleEl = document.getElementById("form-step-title");
  const subtitleEl = document.getElementById("form-step-subtitle");
  const subtitleNoteEl = document.querySelector(".form-subtitle-note");

  if (titleEl) titleEl.textContent = stepInfo.title;
  if (subtitleEl) subtitleEl.textContent = stepInfo.subtitle;

  // Show/hide the consultation note for steps 1 and 2
  if (subtitleNoteEl) {
    if (stepNumber === 1 || stepNumber === 2) {
      subtitleNoteEl.style.display = "block";
    } else {
      subtitleNoteEl.style.display = "none";
    }
  }

  // Update shared navigation bar
  updateFormNavigation(stepNumber);

  // Hide concern warning when navigating away from step 1
  if (stepNumber !== 1 && typeof hideConcernWarning === "function") {
    hideConcernWarning();
  }

  // Scroll to top of page
  if (typeof scrollToTop === "function") {
    scrollToTop();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Collect form data when navigating between steps to keep data in sync
  collectFormData();

  // Populate review step when navigating to it
  if (stepNumber === 6) {
    // Additional validation check (already validated above, but double-check)
    const validation = validateRequiredFields();
    if (!validation.isValid) {
      // Revert navigation - go back to the step with the error
      const currentStep = validation.targetStep || 3;
      goToFormStep(currentStep, true); // Skip validation to prevent infinite loop
      showValidationError(validation.errors[0].message, validation.targetStep);
      return; // Stop navigation
    }
    hideValidationError();
    setTimeout(() => {
      populateReviewStep();
    }, 100);
  }

  // Initialize areas of concern when navigating to step 2
  if (stepNumber === 2) {
    setTimeout(() => {
      initializeAreasOfConcern();
    }, 100);
  }
}

// Collect form data in real-time and update userSelections
function collectFormData() {
  // Collect age
  const ageInput = document.getElementById("patient-age");
  if (ageInput && ageInput.value) {
    const ageValue = parseInt(ageInput.value);
    if (!isNaN(ageValue)) {
      userSelections.age = ageValue;
      if (window.userSelections) {
        window.userSelections.age = ageValue;
      }
    }
  }

  // Collect skin type
  const skinTypeInput = document.querySelector(
    'input[name="skin-type"]:checked'
  );
  if (skinTypeInput) {
    userSelections.skinType = skinTypeInput.value;
    if (window.userSelections) {
      window.userSelections.skinType = skinTypeInput.value;
    }
  }

  // Collect sun response
  const sunResponseInput = document.querySelector(
    'input[name="sun-response"]:checked'
  );
  if (sunResponseInput) {
    userSelections.sunResponse = sunResponseInput.value;
    if (window.userSelections) {
      window.userSelections.sunResponse = sunResponseInput.value;
    }
  }

  // Collect skin tone (optional)
  const skinToneInput = document.querySelector(
    'input[name="skin-tone"]:checked'
  );
  if (skinToneInput) {
    userSelections.skinTone = skinToneInput.value;
    if (window.userSelections) {
      window.userSelections.skinTone = skinToneInput.value;
    }
  }

  // Collect ethnic background (optional) - check for radio buttons first
  const ethnicBackgroundRadio = document.querySelector(
    'input[name="ethnic-background"]:checked'
  );
  if (ethnicBackgroundRadio) {
    userSelections.ethnicBackground = ethnicBackgroundRadio.value;
    if (window.userSelections) {
      window.userSelections.ethnicBackground = ethnicBackgroundRadio.value;
    }
  } else {
    // Fall back to select dropdown
    const ethnicBackgroundSelect = document.getElementById("ethnic-background");
    if (ethnicBackgroundSelect && ethnicBackgroundSelect.value) {
      userSelections.ethnicBackground = ethnicBackgroundSelect.value;
      if (window.userSelections) {
        window.userSelections.ethnicBackground = ethnicBackgroundSelect.value;
      }
    }
  }

  // Collect previous treatments (optional)
  const previousTreatmentsInputs = document.querySelectorAll(
    'input[name="previous-treatments"]:checked'
  );
  if (previousTreatmentsInputs.length > 0) {
    userSelections.previousTreatments = Array.from(
      previousTreatmentsInputs
    ).map((cb) => cb.value);
    if (window.userSelections) {
      window.userSelections.previousTreatments =
        userSelections.previousTreatments;
    }
  }

  // Collect goals
  const goalsInputs = document.querySelectorAll(
    'input[name="overall-goals"]:checked'
  );
  if (goalsInputs.length > 0) {
    userSelections.overallGoals = Array.from(goalsInputs).map((cb) => cb.value);
    if (window.userSelections) {
      window.userSelections.overallGoals = userSelections.overallGoals;
    }
  } else {
    // Clear goals if none selected
    userSelections.overallGoals = [];
    if (window.userSelections) {
      window.userSelections.overallGoals = [];
    }
  }

  console.log("Form data collected:", {
    age: userSelections.age,
    skinType: userSelections.skinType,
    sunResponse: userSelections.sunResponse,
    goals: userSelections.overallGoals,
    skinTone: userSelections.skinTone,
    ethnicBackground: userSelections.ethnicBackground,
  });
}

// Validate step 1: At least one concern must be selected
function validateStep1() {
  collectFormData();
  const hasCategorySelections =
    userSelections.selectedConcernCategories &&
    userSelections.selectedConcernCategories.length > 0;
  const actualIssueCount =
    window.userSelections &&
    window.userSelections.selectedIssues &&
    window.userSelections.selectedIssues.length > 0
      ? window.userSelections.selectedIssues.length
      : 0;

  if (!hasCategorySelections && actualIssueCount === 0) {
    return {
      isValid: false,
      message: "Please select at least one concern to continue.",
      step: 1,
    };
  }
  return { isValid: true };
}

// Validate step 2: At least one area must be selected
function validateStep2() {
  collectFormData();
  const hasAreaSelections =
    userSelections.selectedAreas && userSelections.selectedAreas.length > 0;

  if (!hasAreaSelections) {
    return {
      isValid: false,
      message: "Please select at least one area to continue.",
      step: 2,
    };
  }
  return { isValid: true };
}

// Validate step 3: Age, Skin Type, and Sun Response are required
function validateStep3() {
  collectFormData();
  const errors = [];

  // Check age
  const ageValue = userSelections.age;
  if (!ageValue || ageValue < 18) {
    errors.push({
      message: !ageValue
        ? "Please enter your age to continue."
        : "Please enter a valid age (must be 18 or older) to continue.",
      field: "patient-age",
    });
  }

  // Check skin type
  if (!userSelections.skinType) {
    errors.push({
      message: "Please select your skin type to continue.",
      field: "skin-type",
    });
  }

  // Check skin tone (now required)
  if (!userSelections.skinTone) {
    errors.push({
      message: "Please select your skin tone to continue.",
      field: "skin-tone",
    });
  }

  // Sun response is now optional - no validation needed

  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors[0].message, // Show first error
      step: 3,
      field: errors[0].field,
    };
  }

  return { isValid: true };
}

// Validate required fields before proceeding to review
function validateRequiredFields() {
  collectFormData();

  const errors = [];
  let targetStep = null;

  // Check age
  const ageValue = userSelections.age;
  if (!ageValue || ageValue < 18) {
    errors.push({
      message: !ageValue
        ? "Please enter your age to continue."
        : "Please enter a valid age (must be 18 or older) to continue.",
      step: 3,
      field: "patient-age",
    });
    targetStep = 3;
  }

  // Check concerns
  const hasCategorySelections =
    userSelections.selectedConcernCategories &&
    userSelections.selectedConcernCategories.length > 0;
  const actualIssueCount =
    window.userSelections &&
    window.userSelections.selectedIssues &&
    window.userSelections.selectedIssues.length > 0
      ? window.userSelections.selectedIssues.length
      : 0;
  if (!hasCategorySelections && actualIssueCount === 0) {
    errors.push({
      message: "Please select at least one concern to continue.",
      step: 1,
      field: null,
    });
    if (!targetStep) targetStep = 1;
  }

  // Check areas
  const hasAreaSelections =
    userSelections.selectedAreas && userSelections.selectedAreas.length > 0;
  if (!hasAreaSelections) {
    errors.push({
      message: "Please select at least one area to continue.",
      step: 2,
      field: null,
    });
    if (!targetStep) targetStep = 2;
  }

  // Check skin type
  if (!userSelections.skinType) {
    errors.push({
      message: "Please select your skin type to continue.",
      step: 3,
      field: "skin-type",
    });
    if (!targetStep) targetStep = 3;
  }

  // Check skin tone (now required)
  if (!userSelections.skinTone) {
    errors.push({
      message: "Please select your skin tone to continue.",
      step: 3,
      field: "skin-tone",
    });
    if (!targetStep) targetStep = 3;
  }

  // Sun response is now optional - no validation needed

  return {
    isValid: errors.length === 0,
    errors: errors,
    targetStep: targetStep,
  };
}

// Show validation error message in UI
function showValidationError(message, targetStep, field = null) {
  // For step 1, use the concern warning message location (at the top)
  if (targetStep === 1) {
    const concernWarningEl = document.getElementById("concern-warning-message");
    const concernWarningText = document.getElementById("concern-warning-text");
    if (concernWarningEl && concernWarningText) {
      concernWarningText.textContent = message;
      concernWarningEl.style.display = "flex";
      concernWarningEl.className = "concern-warning-message error";
      // Don't auto-hide validation errors

      // Scroll to top of concerns section (not the bottom)
      setTimeout(() => {
        const concernsContainer = document.querySelector(
          ".concerns-screen-container"
        );
        if (concernsContainer) {
          concernsContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }

    // Highlight concern category cards if no concerns selected
    setTimeout(() => {
      const hasCategorySelections =
        userSelections.selectedConcernCategories &&
        userSelections.selectedConcernCategories.length > 0;
      const actualIssueCount =
        window.userSelections &&
        window.userSelections.selectedIssues &&
        window.userSelections.selectedIssues.length > 0
          ? window.userSelections.selectedIssues.length
          : 0;

      if (!hasCategorySelections && actualIssueCount === 0) {
        // Add visual indicator to concern selection area
        const concernsContainer = document.querySelector(
          ".concern-categories-grid"
        );
        if (concernsContainer) {
          concernsContainer.style.border = "2px solid #ef5350";
          concernsContainer.style.borderRadius = "12px";
          concernsContainer.style.padding = "12px";
        }
      }
    }, 200);
    return; // Early return for step 1
  }

  // For step 2, show error at the top of the areas section
  if (targetStep === 2) {
    // Create or use a validation message element at the top of step 2
    const formSection = document.querySelector("#form-step-2 .form-section");
    let step2ErrorEl = document.getElementById("step-2-validation-error");

    if (!step2ErrorEl && formSection) {
      step2ErrorEl = document.createElement("div");
      step2ErrorEl.id = "step-2-validation-error";
      step2ErrorEl.className = "validation-message error";
      formSection.insertBefore(step2ErrorEl, formSection.firstChild);
    }

    if (step2ErrorEl) {
      step2ErrorEl.textContent = message;
      step2ErrorEl.style.display = "block";
      // No scrolling - error is already visible at the top
    }

    // Don't add red outline - just show the error message
    return; // Early return for step 2
  }

  // For step 3, show inline errors next to specific fields (like email validation)
  if (targetStep === 3) {
    // Show error inline next to the specific field
    if (field === "patient-age") {
      const ageInput = document.getElementById("patient-age");
    } else if (field === "skin-tone") {
      // Show error for skin tone selection
      const skinToneSection = document.querySelector(
        ".demographic-section:has(.skin-tone-scale)"
      );
      if (skinToneSection) {
        let errorEl = skinToneSection.querySelector(".input-error-message");
        if (!errorEl) {
          errorEl = document.createElement("div");
          errorEl.className = "input-error-message";
          errorEl.style.color = "#d32f2f";
          errorEl.style.fontSize = "13px";
          errorEl.style.marginTop = "8px";
          const label = skinToneSection.querySelector(".demographic-label");
          if (label) {
            label.insertAdjacentElement("afterend", errorEl);
          }
        }
        errorEl.textContent = message;
        errorEl.style.display = "block";
      }
    }
    if (field === "patient-age") {
      const ageInput = document.getElementById("patient-age");
      if (ageInput) {
        showInputError(ageInput, message);
        ageInput.classList.add("input-error");
      }
    } else if (field === "skin-type") {
      const skinTypeSection = document.querySelector(
        "#form-step-3 .demographic-section:nth-of-type(2)"
      );
      if (skinTypeSection) {
        // Remove existing error if any
        const existingError = skinTypeSection.querySelector(
          ".input-error-message"
        );
        if (existingError) existingError.remove();

        // Add error message below the label
        const errorDiv = document.createElement("div");
        errorDiv.className = "input-error-message";
        errorDiv.textContent = message;
        errorDiv.style.cssText =
          "color: #d32f2f; font-size: 12px; margin-top: 4px; margin-bottom: 8px;";
        const label = skinTypeSection.querySelector(".demographic-label");
        if (label && label.nextSibling) {
          skinTypeSection.insertBefore(errorDiv, label.nextSibling);
        } else if (label) {
          label.insertAdjacentElement("afterend", errorDiv);
        }
      }
    } else if (field === "skin-tone") {
      const skinToneSection = document.querySelector(
        "#form-step-3 .demographic-section:has(.skin-tone-scale)"
      );
      if (skinToneSection) {
        // Remove existing error if any
        const existingError = skinToneSection.querySelector(
          ".input-error-message"
        );
        if (existingError) existingError.remove();

        // Add error message below the label
        const errorDiv = document.createElement("div");
        errorDiv.className = "input-error-message";
        errorDiv.textContent = message;
        errorDiv.style.cssText =
          "color: #d32f2f; font-size: 12px; margin-top: 4px; margin-bottom: 8px;";
        const label = skinToneSection.querySelector(".demographic-label");
        if (label && label.nextSibling) {
          skinToneSection.insertBefore(errorDiv, label.nextSibling);
        } else if (label) {
          label.insertAdjacentElement("afterend", errorDiv);
        }
      }
    } else {
      // If no specific field, show error for the first missing field
      collectFormData();
      if (!userSelections.age || userSelections.age < 18) {
        const ageInput = document.getElementById("patient-age");
        if (ageInput) {
          const errorMsg = !userSelections.age
            ? "Please enter your age to continue."
            : "Please enter a valid age (must be 18 or older) to continue.";
          showInputError(ageInput, errorMsg);
          ageInput.classList.add("input-error");
        }
      } else if (!userSelections.skinType) {
        const skinTypeSection = document.querySelector(
          "#form-step-3 .demographic-section:nth-of-type(2)"
        );
        if (skinTypeSection) {
          const existingError = skinTypeSection.querySelector(
            ".input-error-message"
          );
          if (existingError) existingError.remove();
          const errorDiv = document.createElement("div");
          errorDiv.className = "input-error-message";
          errorDiv.textContent = "Please select your skin type to continue.";
          errorDiv.style.cssText =
            "color: #d32f2f; font-size: 12px; margin-top: 4px; margin-bottom: 8px;";
          const label = skinTypeSection.querySelector(".demographic-label");
          if (label) {
            label.insertAdjacentElement("afterend", errorDiv);
          }
        }
      } else if (!userSelections.sunResponse) {
        const sunResponseSection = document.querySelector(
          "#form-step-3 .demographic-section:nth-of-type(3)"
        );
        if (sunResponseSection) {
          const existingError = sunResponseSection.querySelector(
            ".input-error-message"
          );
          if (existingError) existingError.remove();
          const errorDiv = document.createElement("div");
          errorDiv.className = "input-error-message";
          errorDiv.textContent =
            "Please select how your skin responds to sun to continue.";
          errorDiv.style.cssText =
            "color: #d32f2f; font-size: 12px; margin-top: 4px; margin-bottom: 8px;";
          const label = sunResponseSection.querySelector(".demographic-label");
          if (label) {
            label.insertAdjacentElement("afterend", errorDiv);
          }
        }
      }
    }
    return; // Early return for step 3
  }

  // For other steps, use the regular validation message
  const validationMessage = document.getElementById("validation-message");
  if (validationMessage) {
    validationMessage.textContent = message;
    validationMessage.className = "validation-message error";
    validationMessage.style.display = "block";

    // Scroll to validation message
    setTimeout(() => {
      validationMessage.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  // Navigate to the step with the error if not already on that step
  const currentStep = document.querySelector(".form-step.active")?.dataset.step;
  if (targetStep && parseInt(currentStep) !== targetStep) {
    goToFormStep(targetStep);
  }
}

// Hide validation error message
function hideValidationError() {
  // Hide concern warning message if it's showing an error
  const concernWarningEl = document.getElementById("concern-warning-message");
  if (concernWarningEl && concernWarningEl.classList.contains("error")) {
    concernWarningEl.style.display = "none";
    concernWarningEl.classList.remove("error");
  }

  const validationMessage = document.getElementById("validation-message");
  if (validationMessage) {
    validationMessage.style.display = "none";
    validationMessage.textContent = "";
  }

  // Remove step 2 validation error
  const step2ErrorEl = document.getElementById("step-2-validation-error");
  if (step2ErrorEl) {
    step2ErrorEl.style.display = "none";
    step2ErrorEl.textContent = "";
  }

  // Remove step 3 inline validation errors
  const ageInput = document.getElementById("patient-age");
  if (ageInput) {
    hideInputError(ageInput);
    ageInput.classList.remove("input-error");
  }

  // Remove errors from skin type and sun response sections
  document
    .querySelectorAll("#form-step-3 .input-error-message")
    .forEach((error) => {
      error.remove();
    });

  // Remove highlighting from concerns container
  const concernsContainer = document.querySelector(".concern-categories-grid");
  if (concernsContainer) {
    concernsContainer.style.border = "";
    concernsContainer.style.padding = "";
  }

  // Remove highlighting from areas grid
  const areasGrid = document.getElementById("areas-of-concern-grid");
  if (areasGrid) {
    areasGrid.style.border = "";
    areasGrid.style.padding = "";
  }
}

// Update the shared navigation bar based on current step
function updateFormNavigation(stepNumber) {
  const navBackBtn = document.getElementById("nav-back-btn");
  const navSkipBtn = document.getElementById("nav-skip-btn");
  const navContinueBtn = document.getElementById("nav-continue-btn");

  if (!navBackBtn || !navSkipBtn || !navContinueBtn) return;

  // Hide validation error when navigating
  hideValidationError();

  // Reset all buttons
  navBackBtn.style.display = "none";
  navSkipBtn.style.display = "none";
  navContinueBtn.style.display = "none";
  navContinueBtn.textContent = "Continue →";
  navContinueBtn.type = "button";
  navContinueBtn.onclick = null;
  // Remove any HTML onclick attributes to prevent conflicts
  navBackBtn.removeAttribute("onclick");
  navSkipBtn.removeAttribute("onclick");
  navContinueBtn.removeAttribute("onclick");

  switch (stepNumber) {
    case 1:
      // Step 1: Only Continue button (concerns selection)
      navContinueBtn.style.display = "block";
      navContinueBtn.onclick = () => {
        // Validate that at least one concern is selected
        const validation = validateStep1();
        if (!validation.isValid) {
          showValidationError(validation.message, validation.step);
          return;
        }
        hideValidationError();
        goToFormStep(2);
      };
      break;

    case 2:
      // Step 2: Areas of Concern - Back and Continue buttons (required step)
      navBackBtn.style.display = "block";
      navBackBtn.onclick = () => {
        hideValidationError();
        goToFormStep(1);
      };
      navSkipBtn.style.display = "none"; // Hide skip button - step is required
      navContinueBtn.style.display = "block";
      navContinueBtn.onclick = () => {
        // Validate that at least one area is selected
        const validation = validateStep2();
        if (!validation.isValid) {
          showValidationError(validation.message, validation.step);
          return;
        }
        hideValidationError();
        goToFormStep(3);
      };
      break;

    case 3:
      // Step 3: Your Details - Back and Continue buttons (required step)
      navBackBtn.style.display = "block";
      navBackBtn.onclick = () => {
        hideValidationError();
        goToFormStep(2);
      };
      navSkipBtn.style.display = "none"; // Hide skip button - step is required
      navContinueBtn.style.display = "block";
      navContinueBtn.onclick = () => {
        // Validate required fields before continuing
        const validation = validateStep3();
        if (!validation.isValid) {
          showValidationError(
            validation.message,
            validation.step,
            validation.field
          );
          return;
        }
        hideValidationError();
        goToFormStep(4);
      };
      break;

    case 4:
      // Step 4: Optional Information - Back and Continue buttons
      navBackBtn.style.display = "block";
      navBackBtn.onclick = () => {
        hideValidationError();
        goToFormStep(3);
      };
      navContinueBtn.style.display = "block";
      navContinueBtn.onclick = () => {
        // Validate all required fields before proceeding to review
        const validation = validateRequiredFields();
        if (!validation.isValid) {
          showValidationError(
            validation.errors[0].message,
            validation.targetStep
          );
          return;
        }
        hideValidationError();
        goToFormStep(6); // Skip step 5 (goals hidden)
      };
      break;

    case 5:
      // Step 5: Your Goals - HIDDEN (Back and Continue buttons - should not be reached)
      navBackBtn.style.display = "block";
      navBackBtn.onclick = () => goToFormStep(4);
      navContinueBtn.style.display = "block";
      navContinueBtn.textContent = "Review & Submit →";
      navContinueBtn.onclick = () => goToFormStep(6);
      break;

    case 6:
      // Step 6: Review - Back and Submit buttons
      navBackBtn.style.display = "block";
      navBackBtn.onclick = () => {
        hideValidationError();
        goToFormStep(4); // Go back to step 4 (step 5 hidden)
      };
      navContinueBtn.style.display = "block";
      navContinueBtn.textContent = "Get My Results";
      navContinueBtn.type = "button";
      navContinueBtn.onclick = () => {
        // Validate required fields
        const validation = validateRequiredFields();
        if (!validation.isValid) {
          showValidationError(
            validation.errors[0].message,
            validation.targetStep
          );
          return;
        }

        // All validation passed - proceed to lead capture
        hideValidationError();
        showEarlyLeadCapture();
      };
      break;
  }
}

// Proceed from concerns selection to goals/age screen
function proceedToGoalsAndAge() {
  console.log("proceedToGoalsAndAge called");
  try {
    // Validate that at least one concern category is selected
    if (
      !userSelections.selectedConcernCategories ||
      userSelections.selectedConcernCategories.length === 0
    ) {
      alert("Please select at least one concern to continue.");
      return;
    }

    // Map selected categories to issues for backward compatibility
    userSelections.selectedIssues = [];
    userSelections.selectedConcernCategories.forEach((categoryId) => {
      const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
      if (category) {
        // Add category name as issue for matching
        userSelections.selectedIssues.push(category.name);
        // Also add mapped specific issues for compatibility
        category.mapsToSpecificIssues.forEach((issue) => {
          if (!userSelections.selectedIssues.includes(issue)) {
            userSelections.selectedIssues.push(issue);
          }
        });
      }
    });

    // Update window.userSelections for consistency
    if (window.userSelections) {
      window.userSelections.selectedIssues = userSelections.selectedIssues;
      window.userSelections.selectedConcernCategories =
        userSelections.selectedConcernCategories;
    }

    // Track event with error handling
    try {
      if (typeof trackEvent === "function") {
        trackEvent("concerns_selected", {
          categoryCount: userSelections.selectedConcernCategories.length,
          categories: userSelections.selectedConcernCategories,
          issues: userSelections.selectedIssues,
        });
      }
    } catch (e) {
      console.warn("Error tracking event:", e);
    }

    // Show form screen if not already visible
    const formScreen = document.getElementById("form-screen");
    if (formScreen) {
      formScreen.classList.add("active");
    }

    // Update selected concerns summary
    if (typeof updateSelectedConcernsSummary === "function") {
      updateSelectedConcernsSummary();
    } else {
      console.warn("updateSelectedConcernsSummary function not found");
    }

    // Navigate to step 2 (Areas of Concern)
    setTimeout(() => {
      goToFormStep(2);
      // Ensure navigation is updated
      updateFormNavigation(2);

      // Set up form validation
      try {
        if (typeof setupFormValidation === "function") {
          setupFormValidation();
          console.log("setupFormValidation completed");
        } else {
          console.warn("setupFormValidation function not found");
        }
      } catch (e) {
        console.error("Error in setupFormValidation:", e);
      }
    }, 100);
  } catch (error) {
    console.error("Error in proceedToGoalsAndAge:", error);
    alert("An error occurred. Please try again.");
  }
}

// Go back to concerns selection screen
function goBackToConcernsSelection() {
  const concernsScreen = document.getElementById("concerns-selection-screen");
  const formScreen = document.getElementById("form-screen");

  if (formScreen) {
    formScreen.classList.remove("active");
  }

  if (concernsScreen) {
    concernsScreen.classList.add("active");
    scrollToTop();
    updateProceedToGoalsButton();
  }
}

// Update the proceed to goals button state
function updateProceedToGoalsButton() {
  const proceedBtn = document.getElementById("proceed-to-goals-btn");
  if (!proceedBtn) return;

  const actualIssueCount =
    window.userSelections &&
    window.userSelections.selectedIssues &&
    window.userSelections.selectedIssues.length > 0
      ? window.userSelections.selectedIssues.length
      : totalIssueSelections;

  if (actualIssueCount > 0) {
    proceedBtn.disabled = false;
    proceedBtn.textContent = `Continue to Goals (${actualIssueCount} selected)`;
  } else {
    proceedBtn.disabled = true;
    proceedBtn.textContent = "Continue to Goals";
  }
}

// Populate review step with all user selections
function populateReviewStep() {
  // First, collect form data to ensure we have the latest values
  collectFormData();

  // Debug: Log current userSelections state
  console.log("populateReviewStep - Current userSelections:", {
    age: userSelections.age,
    skinType: userSelections.skinType,
    sunResponse: userSelections.sunResponse,
    overallGoals: userSelections.overallGoals,
    selectedConcernCategories: userSelections.selectedConcernCategories,
  });
  console.log(
    "populateReviewStep - window.userSelections:",
    window.userSelections
  );

  // Review Concerns
  const concernsContainer = document.getElementById("review-concerns-summary");
  if (concernsContainer) {
    const categories =
      (window.userSelections &&
        window.userSelections.selectedConcernCategories) ||
      userSelections.selectedConcernCategories ||
      [];
    if (categories.length > 0) {
      const categoryNames = categories.map((categoryId) => {
        const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
        return category ? category.name : categoryId;
      });
      concernsContainer.innerHTML = categoryNames
        .map(
          (name) => `
        <div class="review-item">
          <span class="review-item-icon">${getIconSVG("check", 14)}</span>
          <span class="review-item-text">${escapeHtml(name)}</span>
        </div>
      `
        )
        .join("");
    } else {
      concernsContainer.innerHTML =
        '<p class="review-empty">No concerns selected</p>';
    }
  }

  // Review Areas of Concern
  const areasContainer = document.getElementById("review-areas-summary");
  if (areasContainer) {
    const areas =
      (window.userSelections && window.userSelections.selectedAreas) ||
      userSelections.selectedAreas ||
      [];
    if (areas.length > 0) {
      const areaNames = areas.map((areaId) => {
        const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
        return area ? area.name : areaId;
      });
      areasContainer.innerHTML = areaNames
        .map(
          (name) => `
        <div class="review-item">
          <span class="review-item-icon">${getIconSVG("check", 14)}</span>
          <span class="review-item-text">${escapeHtml(name)}</span>
        </div>
      `
        )
        .join("");
    } else {
      areasContainer.innerHTML =
        '<p class="review-empty">No areas selected</p>';
    }
  }

  // Review Details (Age, Skin Type, Skin Tone)
  const detailsContainer = document.getElementById("review-details-summary");
  if (detailsContainer) {
    // Get values from both sources, prioritizing window.userSelections
    const age =
      (window.userSelections && window.userSelections.age) ||
      userSelections.age ||
      null;
    const skinType =
      (window.userSelections && window.userSelections.skinType) ||
      userSelections.skinType ||
      null;
    const skinTone =
      (window.userSelections && window.userSelections.skinTone) ||
      userSelections.skinTone ||
      null;
    const sunResponse =
      (window.userSelections && window.userSelections.sunResponse) ||
      userSelections.sunResponse ||
      null;

    // Format labels
    const ageLabel = age ? age.toString() : "Not provided";
    const skinTypeLabel = skinType
      ? skinType.charAt(0).toUpperCase() + skinType.slice(1).replace(/-/g, " ")
      : "Not provided";
    const skinToneLabel = skinTone
      ? skinTone
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Not provided";
    const sunResponseLabel = sunResponse
      ? sunResponse
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null;

    detailsContainer.innerHTML = `
      <div class="review-item">
        <span class="review-item-label">Age:</span>
        <span class="review-item-value">${ageLabel}</span>
      </div>
      <div class="review-item">
        <span class="review-item-label">Skin Type:</span>
        <span class="review-item-value">${skinTypeLabel}</span>
      </div>
      <div class="review-item">
        <span class="review-item-label">Skin Tone:</span>
        <span class="review-item-value">${skinToneLabel}</span>
      </div>
      ${
        sunResponseLabel
          ? `
      <div class="review-item">
        <span class="review-item-label">Sun Response:</span>
        <span class="review-item-value">${sunResponseLabel}</span>
      </div>
      `
          : ""
      }
    `;
  }

  // Review Optional Information (Ethnic Background, Previous Treatments)
  const optionalContainer = document.getElementById("review-optional-summary");
  if (optionalContainer) {
    const ethnicBackground =
      (window.userSelections && window.userSelections.ethnicBackground) ||
      userSelections.ethnicBackground ||
      null;
    const previousTreatments =
      (window.userSelections && window.userSelections.previousTreatments) ||
      userSelections.previousTreatments ||
      [];

    // Format labels
    const ethnicBackgroundLabel = ethnicBackground
      ? ethnicBackground
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null;

    const optionalItems = [];

    if (ethnicBackgroundLabel) {
      optionalItems.push(`
        <div class="review-item">
          <span class="review-item-label">Ethnic Background:</span>
          <span class="review-item-value">${escapeHtml(
            ethnicBackgroundLabel
          )}</span>
        </div>
      `);
    }

    if (previousTreatments.length > 0) {
      const treatmentsLabel = previousTreatments
        .map((t) => {
          return t
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        })
        .join(", ");
      optionalItems.push(`
        <div class="review-item">
          <span class="review-item-label">Previous Treatments:</span>
          <span class="review-item-value">${escapeHtml(treatmentsLabel)}</span>
        </div>
      `);
    }

    if (optionalItems.length > 0) {
      optionalContainer.innerHTML = optionalItems.join("");
    } else {
      optionalContainer.innerHTML =
        '<p class="review-empty">No optional information provided</p>';
    }
  }

  // Review Goals
  const goalsContainer = document.getElementById("review-goals-summary");
  if (goalsContainer) {
    const goals =
      (window.userSelections && window.userSelections.overallGoals) ||
      userSelections.overallGoals ||
      [];
    if (goals && goals.length > 0) {
      const goalLabels = {
        "facial-balancing": "Facial Balancing",
        "anti-aging": "Anti-Aging",
        "skin-rejuvenation": "Skin Rejuvenation",
        "natural-look": "Natural Look",
      };
      const goalNames = goals.map((g) => goalLabels[g] || g);
      goalsContainer.innerHTML = goalNames
        .map(
          (name) => `
        <div class="review-item">
          <span class="review-item-icon">${getIconSVG("check", 14)}</span>
          <span class="review-item-text">${escapeHtml(name)}</span>
        </div>
      `
        )
        .join("");
    } else {
      goalsContainer.innerHTML =
        '<p class="review-empty">No goals selected</p>';
    }
  }
}

// Update selected concerns summary on goals/age screen
function updateSelectedConcernsSummary() {
  const summary = document.getElementById("selected-concerns-summary");
  if (!summary) return;

  // Prioritize high-level categories over mapped sub-issues
  const selectedCategories =
    window.userSelections && window.userSelections.selectedConcernCategories
      ? window.userSelections.selectedConcernCategories
      : [];

  const selectedIssues =
    window.userSelections && window.userSelections.selectedIssues
      ? window.userSelections.selectedIssues
      : [];

  // If we have categories, show those; otherwise fall back to issues for backward compatibility
  const itemsToShow =
    selectedCategories.length > 0
      ? selectedCategories.map((categoryId) => {
          const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
          return category ? category.name : categoryId;
        })
      : selectedIssues;

  if (itemsToShow.length === 0) {
    summary.innerHTML =
      '<p style="color: #999; font-style: italic;">No concerns selected</p>';
    return;
  }

  summary.innerHTML = `
    <div class="selected-concerns-list-summary">
      <div class="concerns-summary-header">
        <h3 class="summary-title">Your Selected Concerns</h3>
        <button type="button" class="edit-concerns-link" onclick="goBackToConcernsSelection()">
          Edit
        </button>
      </div>
      ${itemsToShow
        .map(
          (item) => `
        <div class="concern-summary-item">
          <span class="concern-summary-icon">${getIconSVG("check", 14)}</span>
          <span class="concern-summary-name">${escapeHtml(item)}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// Make functions globally accessible
window.startForm = startForm;
window.showHomeTeaser = showHomeTeaser;
// showOnboarding is already assigned to window above for immediate availability
window.handleStartButtonClick = handleStartButtonClick;
window.nextOnboardingSlide = nextOnboardingSlide;
window.proceedToGoalsAndAge = proceedToGoalsAndAge;
window.goBackToConcernsSelection = goBackToConcernsSelection;
window.goToFormStep = goToFormStep;
window.updateProceedToGoalsButton = updateProceedToGoalsButton;
window.updateSelectedConcernsSummary = updateSelectedConcernsSummary;
window.scrollToTop = scrollToTop;
window.toggleSection = toggleSection;
window.expandAllSections = expandAllSections;
window.collapseAllSections = collapseAllSections;
window.filterCases = filterCases;
window.scrollCarousel = scrollCarousel;
window.openChatAI = openChatAI;
window.bookConsult = bookConsult;
window.requestMoreInfo = requestMoreInfo;
window.closeRequestModal = closeRequestModal;
window.toggleCaseGoal = toggleCaseGoal;
window.goBackToGallery = goBackToGallery;
window.goBackToForm = goBackToForm;
window.goBackToResults = goBackToResults;
window.showTreatmentDetail = showTreatmentDetail;
window.showTreatmentCases = showTreatmentCases;
window.addRegionIssueRow = addRegionIssueRow;
window.removeRegionIssueRow = removeRegionIssueRow;
window.updateIssueDropdown = updateIssueDropdown;
window.showCaseDetailFromPreview = showCaseDetailFromPreview;
window.showIssueDetailScreen = showIssueDetailScreen;
window.showIssueOverview = showIssueOverview;
window.showIssueOverviewFromSummary = function (issueName) {
  issueOverviewReturnScreen = "summary";
  showIssueOverview(issueName);
};
window.showIssueOverviewFromDetail = function (issueName) {
  issueOverviewReturnScreen = "issue-detail";
  showIssueOverview(issueName);
};
window.showCaseDetailFromOverview = showCaseDetailFromOverview;
window.showLockedIssueMessage = showLockedIssueMessage;
window.requestConsultation = requestConsultation;
window.issueHasPhotos = issueHasPhotos;
// initializeCustomDropdowns is defined in custom-dropdown.js, only assign if it exists
if (typeof initializeCustomDropdowns !== "undefined") {
  window.initializeCustomDropdowns = initializeCustomDropdowns;
}
window.goBackToIssueOverview = goBackToIssueOverview;
window.showMyCases = showMyCases;
window.closeMyCases = closeMyCases;
window.showCaseDetailFromMyCases = showCaseDetailFromMyCases;
window.toggleIssueGoal = toggleIssueGoal;
window.removeGoalFromList = removeGoalFromList;
window.confirmRemoveGoal = confirmRemoveGoal;
window.closeRemoveGoalModal = closeRemoveGoalModal;

// Track issue selections - limit to 3
const MAX_ISSUES = 3;
let totalIssueSelections = 0;

function updateIssueSelectionCount() {
  // Get selected issues from dropdown rows
  const selectedIssues = getSelectedIssuesFromRows();
  totalIssueSelections = selectedIssues.length;

  const counter = document.getElementById("selection-counter");
  if (counter) {
    const remaining = MAX_ISSUES - totalIssueSelections;
    if (remaining > 0) {
      counter.textContent = `${totalIssueSelections} of ${MAX_ISSUES} selected`;
      counter.className = "selection-counter";
    } else {
      counter.textContent = `${MAX_ISSUES} of ${MAX_ISSUES} selected`;
      counter.className = "selection-counter limit-reached";
    }
  }

  // Update proceed to goals button if on concerns selection screen
  if (typeof updateProceedToGoalsButton === "function") {
    updateProceedToGoalsButton();
  }

  // Disable issue dropdowns in empty rows if limit reached
  if (totalIssueSelections >= MAX_ISSUES) {
    document.querySelectorAll(".region-issue-row").forEach((row) => {
      const issueSelect = row.querySelector(".issue-select");
      if (!issueSelect.value) {
        issueSelect.disabled = true;
      }
    });
  } else {
    document.querySelectorAll(".issue-select").forEach((select) => {
      const row = select.closest(".region-issue-row");
      const regionSelect = row.querySelector(".region-select");
      select.disabled = !regionSelect.value;
    });
  }

  // Enable/disable submit button - require age and at least one concern (goals removed for now)
  // Don't show validation messages here - only show on submit attempt
  const submitButton = document.getElementById("submit-button");

  if (submitButton) {
    const ageInput = document.getElementById("patient-age");
    const hasAge = ageInput && ageInput.value && parseInt(ageInput.value) >= 18;
    // Goals requirement removed - goals section is hidden
    const hasConcerns = totalIssueSelections > 0;

    // Require age and a concern (goals not required)
    const isValid = hasAge && hasConcerns;
    submitButton.disabled = !isValid;
  }

  // Update add row button
  updateAddRowButton();
}

// Old form functions removed - now using dropdown interface

// Region/Issue Dropdown Interface
function initializeRegionIssueRows() {
  console.log("initializeRegionIssueRows called");
  const container = document.getElementById("region-issue-rows");
  if (!container) {
    console.error("region-issue-rows container not found");
    return;
  }

  container.innerHTML = "";

  // Add first row
  try {
    addRegionIssueRow();
    console.log("First row added");
  } catch (e) {
    console.error("Error adding first row:", e);
  }

  // Update add button visibility
  try {
    updateAddRowButton();
    console.log("Add button updated");
  } catch (e) {
    console.error("Error updating add button:", e);
  }

  // Initialize validation state
  try {
    updateIssueSelectionCount();
    console.log("Initial validation state updated");
  } catch (e) {
    console.error("Error updating initial validation state:", e);
  }
}

function addRegionIssueRow() {
  const container = document.getElementById("region-issue-rows");
  if (!container) return;

  const currentRows = container.querySelectorAll(".region-issue-row").length;
  if (currentRows >= MAX_ISSUES) {
    return; // Can't add more than max issues
  }

  const row = document.createElement("div");
  row.className = "region-issue-row";
  row.dataset.rowIndex = currentRows;

  row.innerHTML = `
        <select class="region-select" onchange="updateIssueDropdown(this)">
            <option value="">Select Region...</option>
            ${Object.keys(areasAndIssues)
              .map((area) => `<option value="${area}">${area}</option>`)
              .join("")}
        </select>
        <select class="issue-select" disabled>
            <option value="">Select Concern...</option>
        </select>
        <button type="button" class="remove-row-button" onclick="removeRegionIssueRow(this)" ${
          currentRows === 0 ? 'style="display:none"' : ""
        }>×</button>
    `;

  container.appendChild(row);

  // Remove any custom dropdown wrappers that might exist
  const issueSelect = row.querySelector(".issue-select");
  if (issueSelect) {
    const customWrapper = issueSelect.parentElement?.querySelector(
      ".custom-dropdown-wrapper"
    );
    if (customWrapper) {
      customWrapper.remove();
    }
    const modernWrapper = issueSelect.parentElement?.querySelector(
      ".modern-dropdown-wrapper"
    );
    if (modernWrapper) {
      modernWrapper.remove();
    }
    // Ensure select is visible
    issueSelect.style.display = "";
  }

  updateAddRowButton();
  updateIssueSelectionCount();
}

function removeRegionIssueRow(button) {
  const row = button.closest(".region-issue-row");
  row.remove();
  updateAddRowButton();
  updateIssueSelectionCount();
  // Update all dropdowns when a row is removed, so previously selected issues become available again
  updateAllIssueDropdowns();
}

function updateIssueDropdown(regionSelect, skipUpdateAll = false) {
  const row = regionSelect.closest(".region-issue-row");
  const issueSelect = row.querySelector(".issue-select");
  const region = regionSelect.value;

  // Get currently selected issue in this row (if any)
  const currentSelection = issueSelect.value;

  issueSelect.innerHTML = '<option value="">Select Concern...</option>';
  issueSelect.disabled = !region;

  if (region && areasAndIssues[region]) {
    // Get all already-selected issues from other rows
    const selectedIssues = getSelectedIssuesFromRows();

    areasAndIssues[region].forEach((issue) => {
      // Skip if this issue is already selected in another row
      // But allow it if it's the current selection in this row
      if (selectedIssues.includes(issue) && issue !== currentSelection) {
        return; // Skip this issue
      }

      const option = document.createElement("option");
      option.value = issue; // Backend name for matching
      option.textContent = issue; // Use actual issue name
      issueSelect.appendChild(option);
    });

    // Restore current selection if it exists
    if (currentSelection) {
      issueSelect.value = currentSelection;
    }
  }

  // Remove any custom dropdown wrappers that might exist
  const customWrapper = issueSelect.parentElement?.querySelector(
    ".custom-dropdown-wrapper"
  );
  if (customWrapper) {
    customWrapper.remove();
  }
  const modernWrapper = issueSelect.parentElement?.querySelector(
    ".modern-dropdown-wrapper"
  );
  if (modernWrapper) {
    modernWrapper.remove();
  }
  // Ensure select is visible
  issueSelect.style.display = "";

  // Disable options that don't have photos
  if (typeof window.issueHasPhotos === "function") {
    Array.from(issueSelect.options).forEach((option, index) => {
      if (index === 0) return; // Skip placeholder
      if (!window.issueHasPhotos(option.value)) {
        option.disabled = true;
        option.textContent = option.textContent + " (Consultation Required)";
      }
    });
  }

  updateIssueSelectionCount();

  // Only update all dropdowns if not called from updateAllIssueDropdowns itself
  if (!skipUpdateAll) {
    // Update all other dropdowns to reflect the new selection state
    updateAllIssueDropdowns();
  }
}

function updateAllIssueDropdowns() {
  // Update all issue dropdowns to filter out already-selected issues
  const container = document.getElementById("region-issue-rows");
  if (!container) return;

  const rows = container.querySelectorAll(".region-issue-row");
  rows.forEach((row) => {
    const regionSelect = row.querySelector(".region-select");
    if (regionSelect && regionSelect.value) {
      // Get current selection before updating
      const issueSelect = row.querySelector(".issue-select");
      const currentSelection = issueSelect ? issueSelect.value : "";

      // Temporarily store the current selection
      const tempSelection = currentSelection;

      // Update the dropdown (this will filter out selected issues)
      // Pass skipUpdateAll=true to prevent infinite recursion
      updateIssueDropdown(regionSelect, true);

      // Restore selection if it's still valid
      if (tempSelection && issueSelect) {
        const optionExists = Array.from(issueSelect.options).some(
          (opt) => opt.value === tempSelection
        );
        if (optionExists) {
          issueSelect.value = tempSelection;
        } else {
          // If current selection is no longer available, clear it
          issueSelect.value = "";
        }
      }
    }
  });
}

function updateAddRowButton() {
  const container = document.getElementById("region-issue-rows");
  const addButton = document.getElementById("add-row-button");
  if (!container || !addButton) return;

  const currentRows = container.querySelectorAll(".region-issue-row").length;
  const selectedIssues = getSelectedIssuesFromRows();

  if (currentRows >= MAX_ISSUES || selectedIssues.length >= MAX_ISSUES) {
    addButton.style.display = "none";
  } else {
    addButton.style.display = "block";
  }
}

function getSelectedIssuesFromRows() {
  // First check if we have selections from body selector
  if (
    window.userSelections &&
    window.userSelections.selectedIssues &&
    window.userSelections.selectedIssues.length > 0
  ) {
    return window.userSelections.selectedIssues;
  }

  // Otherwise, check dropdown rows
  const rows = document.querySelectorAll(".region-issue-row");
  const issues = [];
  rows.forEach((row) => {
    const issueSelect = row.querySelector(".issue-select");
    if (issueSelect && issueSelect.value) {
      issues.push(issueSelect.value);
    }
  });
  return issues;
}

// Set up form validation
function setupFormValidation() {
  console.log("setupFormValidation called");
  // Set up listeners for region/issue dropdowns and age input
  // Use event delegation since elements are created dynamically
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("issue-select")) {
      updateIssueSelectionCount();
      // When an issue is selected, update all other dropdowns to remove it
      updateAllIssueDropdowns();
    } else if (e.target.name === "overall-goals") {
      // Collect goals data in real-time
      collectFormData();
      updateIssueSelectionCount(); // This will also check goals and update submit button
    } else if (e.target.id === "patient-age") {
      // Collect age data in real-time
      collectFormData();
      updateIssueSelectionCount(); // This will also check age and update submit button
      // Clear validation error if age is now valid
      const ageValue = parseInt(e.target.value);
      if (ageValue && ageValue >= 18) {
        // Hide inline error when age is filled - hideInputError now checks all locations
        hideInputError(e.target);
        e.target.classList.remove("input-error");
      }
    } else if (e.target.name === "skin-type" || e.target.name === "skin-tone") {
      // Collect demographic data in real-time
      collectFormData();
      // Clear inline validation error when field is selected
      if (e.target.name === "skin-type" && e.target.checked) {
        // Find the section containing this input
        const skinTypeSection = e.target.closest(".demographic-section");
        if (skinTypeSection) {
          const errorMsg = skinTypeSection.querySelector(
            ".input-error-message"
          );
          if (errorMsg) errorMsg.remove();
        }
      }
      if (e.target.name === "skin-tone" && e.target.checked) {
        // Find the section containing this input
        const skinToneSection = e.target.closest(".demographic-section");
        if (skinToneSection) {
          const errorMsg = skinToneSection.querySelector(
            ".input-error-message"
          );
          if (errorMsg) errorMsg.remove();
        }
      }
    } else if (
      e.target.name === "sun-response" ||
      e.target.name === "ethnic-background" ||
      e.target.name === "previous-treatments"
    ) {
      // Collect optional demographic data in real-time
      collectFormData();
    }
  });

  // Also listen for input events on age field for real-time validation and data collection
  const ageInput = document.getElementById("patient-age");
  if (ageInput) {
    ageInput.addEventListener("input", function () {
      collectFormData(); // Collect data in real-time
      updateIssueSelectionCount();
      // Clear inline validation error if age is now valid
      const ageValue = parseInt(this.value);
      if (ageValue && ageValue >= 18) {
        // Clear the error message - hideInputError now checks all locations
        hideInputError(this);
        this.classList.remove("input-error");
      }
    });

    // Also listen for blur to validate on focus loss
    ageInput.addEventListener("blur", function () {
      const ageValue = parseInt(this.value);
      if (ageValue && ageValue >= 18) {
        hideInputError(this);
        this.classList.remove("input-error");
      }
    });
  }
  console.log("setupFormValidation completed");
}

// Form handling
document
  .getElementById("aesthetic-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Collect age
    const ageInput = document.getElementById("patient-age");
    const ageValue = ageInput.value ? parseInt(ageInput.value) : null;
    userSelections.age = ageValue;
    // Also update window.userSelections if it exists
    if (window.userSelections) {
      window.userSelections.age = ageValue;
    }

    // Collect all selections
    userSelections.overallGoals = Array.from(
      document.querySelectorAll('input[name="overall-goals"]:checked')
    ).map((cb) => cb.value);
    // Also update window.userSelections if it exists
    if (window.userSelections) {
      window.userSelections.overallGoals = userSelections.overallGoals;
    }

    // Collect demographic data
    const skinTypeInput = document.querySelector(
      'input[name="skin-type"]:checked'
    );
    userSelections.skinType = skinTypeInput ? skinTypeInput.value : null;

    const sunResponseInput = document.querySelector(
      'input[name="sun-response"]:checked'
    );
    userSelections.sunResponse = sunResponseInput
      ? sunResponseInput.value
      : null;

    const skinToneInput = document.querySelector(
      'input[name="skin-tone"]:checked'
    );
    userSelections.skinTone = skinToneInput ? skinToneInput.value : null;

    const ethnicBackgroundSelect = document.getElementById("ethnic-background");
    userSelections.ethnicBackground = ethnicBackgroundSelect
      ? ethnicBackgroundSelect.value
      : null;

    const previousTreatmentsInputs = document.querySelectorAll(
      'input[name="previous-treatments"]:checked'
    );
    userSelections.previousTreatments = Array.from(
      previousTreatmentsInputs
    ).map((cb) => cb.value);

    // Update window.userSelections
    if (window.userSelections) {
      window.userSelections.skinType = userSelections.skinType;
      window.userSelections.sunResponse = userSelections.sunResponse;
      window.userSelections.skinTone = userSelections.skinTone;
      window.userSelections.ethnicBackground = userSelections.ethnicBackground;
      window.userSelections.previousTreatments =
        userSelections.previousTreatments;
    }

    // Validate all fields - show message only on submit attempt
    const validationMessage = document.getElementById("validation-message");
    let hasError = false;
    let errorMessage = "";

    // Check age first
    if (!ageValue || ageValue < 18) {
      hasError = true;
      if (!ageValue) {
        errorMessage = "Please enter your age to continue.";
      } else {
        errorMessage =
          "Please enter a valid age (must be 18 or older) to continue.";
      }
    }
    // Goals check removed - goals section is hidden for now
    // Check concerns - use category selections or actual selected issues count
    const hasCategorySelections =
      userSelections.selectedConcernCategories &&
      userSelections.selectedConcernCategories.length > 0;
    const actualIssueCount =
      window.userSelections &&
      window.userSelections.selectedIssues &&
      window.userSelections.selectedIssues.length > 0
        ? window.userSelections.selectedIssues.length
        : totalIssueSelections;
    if (!hasCategorySelections && actualIssueCount === 0) {
      hasError = true;
      errorMessage = "Please select at least one concern to continue.";
    }

    // Check required demographics
    if (!userSelections.skinType) {
      hasError = true;
      errorMessage = "Please select your skin type to continue.";
    }
    if (!userSelections.sunResponse) {
      hasError = true;
      errorMessage = "Please select how your skin responds to sun to continue.";
    }

    // Show validation message if there's an error
    if (hasError && validationMessage) {
      validationMessage.textContent = errorMessage;
      validationMessage.className = "validation-message error";
      validationMessage.style.display = "block";
      // Scroll to validation message
      validationMessage.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    } else if (hasError) {
      // Fallback to alert if validation message element not found
      alert(errorMessage);
      return;
    }

    // Hide validation message if all validations pass
    if (validationMessage) {
      validationMessage.style.display = "none";
    }

    // Collect all selections - prioritize body selector selections if they exist
    if (
      window.userSelections &&
      window.userSelections.selectedIssues &&
      window.userSelections.selectedIssues.length > 0
    ) {
      // Use selections from body selector
      userSelections.selectedAreas = [
        ...(window.userSelections.selectedAreas || []),
      ];
      userSelections.selectedIssues = [
        ...(window.userSelections.selectedIssues || []),
      ];
    } else {
      // Fall back to collecting from dropdown rows
      const rows = document.querySelectorAll(".region-issue-row");
      userSelections.selectedAreas = [];
      userSelections.selectedIssues = [];

      rows.forEach((row) => {
        const regionSelect = row.querySelector(".region-select");
        const issueSelect = row.querySelector(".issue-select");
        if (regionSelect.value) {
          userSelections.selectedAreas.push(regionSelect.value);
        }
        if (issueSelect.value) {
          userSelections.selectedIssues.push(issueSelect.value);
        }
      });

      // Remove duplicates
      userSelections.selectedAreas = [...new Set(userSelections.selectedAreas)];
    }

    // Also update window.userSelections if it exists (for consistency)
    if (window.userSelections) {
      window.userSelections.selectedAreas = userSelections.selectedAreas;
      window.userSelections.selectedIssues = userSelections.selectedIssues;
    }

    // Track form completion
    trackEvent("concerns_form_submitted", {
      age: userSelections.age,
      goals: userSelections.overallGoals,
      issues: userSelections.selectedIssues,
      areas: userSelections.selectedAreas,
    });

    // Show early lead capture screen first
    showEarlyLeadCapture();
  });

// ============================================================================
// EARLY LEAD CAPTURE SCREEN
// ============================================================================

function showEarlyLeadCapture() {
  // Hide all screens first
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Show lead capture screen
  const leadCaptureScreen = document.getElementById("lead-capture-screen");
  if (leadCaptureScreen) {
    leadCaptureScreen.classList.add("active");
    console.log("Lead capture screen shown");
  } else {
    console.error("Lead capture screen not found");
    // Fallback: proceed directly to results
    proceedToResults();
    return;
  }

  // Scroll to top
  scrollToTop();

  // Get selected categories or fall back to issues
  const categories = userSelections.selectedConcernCategories || [];
  const selectedIssues = userSelections.selectedIssues || [];

  // Count available treatments and collect matching cases for previews
  let totalCases = 0;
  let allMatchingCases = [];

  // Use categories if available
  if (categories.length > 0) {
    categories.forEach((categoryId) => {
      const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
      if (category) {
        const matchingCases = getMatchingCasesForItem({
          type: "category",
          name: category.name,
          id: categoryId,
          mapsToSpecificIssues: category.mapsToSpecificIssues,
        });
        console.log(
          `Found ${matchingCases.length} cases for category: ${category.name}`
        );
        totalCases += matchingCases.length;
        allMatchingCases = allMatchingCases.concat(matchingCases);
      }
    });
  } else {
    selectedIssues.forEach((issue) => {
      const matchingCases = getMatchingCasesForItem({
        type: "issue",
        name: issue,
      });
      console.log(`Found ${matchingCases.length} cases for issue: ${issue}`);
      totalCases += matchingCases.length;
      allMatchingCases = allMatchingCases.concat(matchingCases);
    });
  }

  console.log(
    `Total matching cases found: ${totalCases}, Unique cases: ${allMatchingCases.length}`
  );

  // Update the treatment count message
  const countEl = document.getElementById("treatment-count");
  if (countEl) {
    if (totalCases > 0) {
      countEl.textContent = `${totalCases}`;
    } else {
      countEl.textContent = "personalized";
    }
  }

  // Update the title to be personalized based on first concern
  const titleEl = document.getElementById("lead-capture-title");
  if (titleEl && categories.length > 0) {
    const firstCategory = HIGH_LEVEL_CONCERNS.find(
      (c) => c.id === categories[0]
    );
    if (firstCategory) {
      titleEl.textContent = `Perfect Results for ${firstCategory.name}!`;
    }
  }

  // Populate preview thumbnails with real case images
  const thumbnailsContainer = document.getElementById(
    "lead-capture-thumbnails"
  );
  if (thumbnailsContainer) {
    if (allMatchingCases.length > 0) {
      // Get unique cases (avoid duplicates)
      const uniqueCases = allMatchingCases
        .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
        .slice(0, 3);

      console.log(`Displaying ${uniqueCases.length} preview thumbnails`);

      thumbnailsContainer.innerHTML = uniqueCases
        .map((caseItem) => {
          // Use beforeAfter as fallback if thumbnail doesn't exist
          const imageUrl = caseItem.thumbnail || caseItem.beforeAfter || "";
          console.log(
            `Case: ${caseItem.name}, Image: ${imageUrl ? "found" : "missing"}`
          );
          return `
          <div class="preview-thumbnail">
            <img src="${imageUrl}" alt="${caseItem.name || "Case preview"}" 
                 onerror="console.error('Image failed to load:', '${imageUrl}'); this.parentElement.style.display='none';" />
          </div>
        `;
        })
        .join("");
    } else {
      // Show placeholder if no cases
      console.warn("No matching cases found for preview");
      thumbnailsContainer.innerHTML =
        '<div class="preview-thumbnail"><div style="background: #f0f0f0; width: 100%; height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">Preview</div></div>';
    }
  }

  // Populate preview items with their selected concerns
  const previewContainer = document.getElementById(
    "lead-capture-preview-items"
  );
  if (previewContainer) {
    // Use categories if available
    const itemsToShow =
      categories.length > 0
        ? categories.map((id) => {
            const cat = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
            return cat ? cat.name : id;
          })
        : selectedIssues;

    previewContainer.innerHTML = itemsToShow
      .slice(0, 3)
      .map(
        (item) => `
        <div class="preview-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ${categories.length > 0 ? item : getIssuePositiveSuggestion(item)}
        </div>
      `
      )
      .join("");

    // Add "and more" if there are additional items
    if (userSelections.overallGoals && userSelections.overallGoals.length > 0) {
      const goalLabels = {
        "facial-balancing": "Facial Balancing",
        "anti-aging": "Anti-Aging",
        "skin-rejuvenation": "Skin Rejuvenation",
        "natural-look": "Natural Look",
      };
      const goalNames = userSelections.overallGoals.map(
        (g) => goalLabels[g] || g
      );
      previewContainer.innerHTML += `
        <div class="preview-item" style="background: #fff9f0; border-color: #ffd291;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          + ${goalNames[0]} tips
        </div>
      `;
    }
  }

  // Setup form submission
  setupEarlyLeadForm();

  trackEvent("lead_capture_shown", {
    categoryCount: categories.length,
    issueCount: selectedIssues.length,
    treatmentCount: totalCases,
  });
}

async function handleLeadFormSubmit() {
  console.log("Lead form submitted");

  const nameInput = document.getElementById("early-capture-name");
  const emailInput = document.getElementById("early-capture-email");
  const phoneInput = document.getElementById("early-capture-phone");

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
    }
    return;
  }

  if (!email || !isValidEmail(email)) {
    emailInput.style.borderColor = "#d32f2f";
    emailInput.focus();
    return;
  }

  // Validate phone if provided
  if (
    phone &&
    typeof isValidPhoneNumber === "function" &&
    !isValidPhoneNumber(phone)
  ) {
    if (phoneInput) {
      phoneInput.style.borderColor = "#d32f2f";
      phoneInput.focus();
    }
    return;
  }

  // Format phone if provided
  let formattedPhone = phone;
  if (phone && typeof formatPhoneNumber === "function") {
    formattedPhone = formatPhoneNumber(phone);
  }

  // Show loading state
  const submitBtn = document.getElementById("lead-submit-btn");
  if (submitBtn) {
    submitBtn.innerHTML = "Loading...";
    submitBtn.disabled = true;
  }

  // Save the lead with complete information
  const leadData = {
    name: name,
    email: email,
    phone: formattedPhone,
    source: "Early Lead Capture",
    message: `Interests: ${userSelections.selectedIssues.join(", ")}`,
  };

  try {
    const result = await submitLeadToAirtable(leadData);
    console.log("Lead submitted:", result);

    trackEvent("early_lead_captured", {
      name: name,
      email: email,
      phone: formattedPhone,
      success: result.success,
    });
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

function setupEarlyLeadForm() {
  const form = document.getElementById("early-lead-capture-form");
  if (!form) {
    console.error("Early lead capture form not found");
    return;
  }

  // Set up phone and email formatting/validation
  const emailInput = document.getElementById("early-capture-email");
  const phoneInput = document.getElementById("early-capture-phone");

  if (emailInput) {
    setupEmailInput(emailInput);
  }

  if (phoneInput) {
    setupPhoneInput(phoneInput);
  }

  // Remove any existing handlers to avoid duplicates
  form.onsubmit = null;
  const submitBtn = document.getElementById("lead-submit-btn");
  const skipBtn = document.getElementById("lead-skip-btn");

  // Set up form submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submitted via form.onsubmit");
    handleLeadFormSubmit();
    return false;
  });

  // Also set up direct click handler on submit button as backup
  if (submitBtn) {
    submitBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Form submitted via button click");
      handleLeadFormSubmit();
      return false;
    };
  }

  // Set up skip button handler
  if (skipBtn) {
    skipBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Skip button clicked");
      skipLeadCapture();
      return false;
    };
  }

  console.log("Early lead form setup complete", {
    form: !!form,
    submitBtn: !!submitBtn,
    skipBtn: !!skipBtn,
  });
}

function skipLeadCapture() {
  console.log("Skipping lead capture");
  trackEvent("lead_capture_skipped");
  proceedToResults();
}

async function proceedToResults() {
  console.log("Proceeding to results");

  // Hide all screens first
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Show the new consolidated results screen
  const resultsScreen = document.getElementById("results-screen");
  if (resultsScreen) {
    resultsScreen.classList.add("active");
    console.log("Results screen shown");
  } else {
    console.error("Results screen not found");
    return;
  }

  // Scroll to top
  scrollToTop();

  // Show top-right buttons
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.add("visible");
  }

  // Wait for prevalence data
  await waitForPrevalenceData(1000);

  // Populate the results screen
  populateResultsScreen();
}

// Track active results tab
let activeResultsTab = 0;

// Store treatment groups for each concern (for detail page navigation)
let treatmentGroupsByConcern = {};

// Extract concern/issue from case name (removes treatment)
// Examples: "Resolve Brow Asymmetry With Threadlift" -> "Resolve Brow Asymmetry"
// "Resolve Wide Jawline With Jawline" -> "Resolve Wide Jawline"
function extractConcernFromCaseName(caseName) {
  if (!caseName) return "General Concern";

  const name = caseName.toLowerCase();

  // Remove common treatment method suffixes
  const patterns = [
    // Remove "with [treatment]" patterns - comprehensive list of all treatments
    // This pattern matches "with [any treatment]" and removes everything after "with"
    {
      pattern: /\s+with\s+.*$/i,
      replacement: "",
    },
    // Remove standalone treatment terms at the end (e.g., "Heat/energy", "RF", "Laser")
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

// Body parts that should not be extracted as treatments
const BODY_PARTS = new Set([
  "jawline",
  "brow",
  "brows",
  "cheek",
  "cheeks",
  "forehead",
  "neck",
  "chin",
  "lips",
  "lip",
  "eyes",
  "eye",
  "nose",
  "temple",
  "temples",
  "under eye",
  "under-eye",
  "upper eyelid",
  "lower eyelid",
  "mid cheek",
  "lateral cheek",
]);

// Map body part + treatment combinations to actual treatments
const BODY_PART_TREATMENT_MAP = {
  "jawline filler": "Dermal Fillers",
  "jawline fillers": "Dermal Fillers",
  "brow lift": "Threadlift",
  "brow thread": "Threadlift",
  "cheek filler": "Dermal Fillers",
  "cheek fillers": "Dermal Fillers",
  "lip filler": "Dermal Fillers",
  "lip fillers": "Dermal Fillers",
  "neck filler": "Dermal Fillers",
  "neck fillers": "Dermal Fillers",
};

// Extract treatment from case name
// Examples: "Resolve Brow Asymmetry With Threadlift" -> "Threadlift"
// "Resolve Wide Jawline With Jawline" -> should extract actual treatment, not "Jawline"
// "Resolve Wide Jawline With Dermal Fillers" -> "Dermal Fillers"
function extractTreatmentFromCaseName(caseName) {
  if (!caseName) return "General Treatment";

  // Try to extract treatment using getTreatmentModality first
  // This searches for treatment names in the case name
  const modality = getTreatmentModality(caseName);
  if (modality && modality.name && modality.name !== "Treatment") {
    return modality.name;
  }

  // Fallback: extract from "with X" pattern
  let withMatch = caseName.match(/\s+with\s+([^,]+?)(?:\s+for|\s+to|$)/i);

  // Also check for treatments at the end without "with" (e.g., "Resolve X Heat/energy")
  if (!withMatch) {
    const endTreatmentMatch = caseName.match(
      /\s+(heat\/energy|heat\s*\/\s*energy|rf|radiofrequency|radio\s+frequency|thermage|ultherapy|morpheus|hydrafacial|ipl|laser|botox|filler|threadlift)$/i
    );
    if (endTreatmentMatch) {
      withMatch = [null, endTreatmentMatch[1]];
    }
  }

  if (withMatch) {
    let treatment = withMatch[1].trim().toLowerCase();

    // Check if it's a body part + treatment combination (e.g., "jawline filler")
    if (BODY_PART_TREATMENT_MAP[treatment]) {
      return BODY_PART_TREATMENT_MAP[treatment];
    }

    // Check if it's just a body part (should not be a treatment)
    const words = treatment.split(/\s+/);
    if (words.length === 1 && BODY_PARTS.has(treatment)) {
      // It's just a body part, try to find treatment elsewhere in the name
      // or return a generic treatment
      const fullModality = getTreatmentModality(caseName);
      if (
        fullModality &&
        fullModality.name &&
        fullModality.name !== "Treatment"
      ) {
        return fullModality.name;
      }
      return "General Treatment";
    }

    // Check if it contains a body part but also a treatment word
    // e.g., "jawline filler" -> extract "filler"
    const treatmentWords = [
      "filler",
      "fillers",
      "thread",
      "threadlift",
      "botox",
      "neurotoxin",
      "sculptra",
      "coolsculpting",
      "ipl",
      "laser",
      "microneedling",
      "peel",
      "heat",
      "energy",
      "heat/energy",
      "heat/ energy",
      "rf",
      "radiofrequency",
      "radio frequency",
      "thermage",
      "ultherapy",
      "morpheus",
      "hydrafacial",
    ];
    for (const treatmentWord of treatmentWords) {
      if (treatment.includes(treatmentWord)) {
        const extractedModality = getTreatmentModality(treatmentWord);
        if (
          extractedModality &&
          extractedModality.name &&
          extractedModality.name !== "Treatment"
        ) {
          return extractedModality.name;
        }
      }
    }

    // Normalize "heat/energy" variations
    const normalizedTreatment = treatment
      .replace(/\s*\/\s*/g, "/")
      .toLowerCase();
    if (
      normalizedTreatment === "heat/energy" ||
      normalizedTreatment === "heat/ energy"
    ) {
      const heatEnergyModality = getTreatmentModality("Heat/Energy");
      if (
        heatEnergyModality &&
        heatEnergyModality.name &&
        heatEnergyModality.name !== "Treatment"
      ) {
        return heatEnergyModality.name;
      }
    }

    // Try to match with treatmentModalities using the extracted text
    const extractedModality = getTreatmentModality(treatment);
    if (
      extractedModality &&
      extractedModality.name &&
      extractedModality.name !== "Treatment"
    ) {
      return extractedModality.name;
    }

    // If it's not a body part and not a known treatment, return as-is (capitalized)
    if (!BODY_PARTS.has(treatment) && !words.some((w) => BODY_PARTS.has(w))) {
      treatment = treatment
        .split(/\s+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      return treatment;
    }
  }

  return "General Treatment";
}

// Group cases by concern first, then by treatment within each concern
function groupCasesByTreatmentSuggestion(cases) {
  // Filter out surgical cases first
  const nonSurgicalCases = filterNonSurgicalCases(cases);

  // Filter by user's selected areas if any are selected
  let areaFilteredCases = nonSurgicalCases;
  if (userSelections.selectedAreas && userSelections.selectedAreas.length > 0) {
    const userSelectedAreaNames = userSelections.selectedAreas
      .map((areaId) => {
        const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
        return area ? area.name : null;
      })
      .filter((name) => name !== null);

    // Use the same area keyword mapping for consistency
    const areaKeywords = [
      // Forehead area
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
      // Eyes area
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
      { keywords: ["nose", "nasal", "nasal tip", "dorsal hump"], area: "Nose" },
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
      { keywords: ["chin", "retruded chin", "labiomental"], area: "Chin" },
      // Neck area
      { keywords: ["neck", "neck lines", "neck wrinkles"], area: "Neck" },
    ];

    areaFilteredCases = nonSurgicalCases.filter((caseItem) => {
      const caseName = caseItem.name || "";
      const caseNameLower = caseName.toLowerCase();
      const matchingCriteria = (caseItem.matchingCriteria || []).map((c) =>
        c.toLowerCase()
      );
      const solvedIssuesLower = (caseItem.solved || []).map((issue) =>
        typeof issue === "string"
          ? issue.toLowerCase()
          : String(issue || "").toLowerCase()
      );
      const allCaseText = [
        caseNameLower,
        ...matchingCriteria,
        ...solvedIssuesLower,
      ].join(" ");

      // Check which areas this case relates to
      const matchedAreas = new Set();
      const matchedKeywords = new Set();

      const sortedAreaKeywords = areaKeywords.map(({ keywords, area }) => ({
        keywords: keywords.sort((a, b) => b.length - a.length),
        area,
      }));

      for (const { keywords, area } of sortedAreaKeywords) {
        for (const keyword of keywords) {
          const isSubstringOfMatched = Array.from(matchedKeywords).some(
            (matched) => matched.includes(keyword) && matched !== keyword
          );

          if (!isSubstringOfMatched && allCaseText.includes(keyword)) {
            matchedAreas.add(area);
            matchedKeywords.add(keyword);
            break;
          }
        }
      }

      // Only include if the case matches at least one of the user's selected areas
      return Array.from(matchedAreas).some((area) =>
        userSelectedAreaNames.includes(area)
      );
    });
  }

  // First level: group by concern
  const concernGroups = {};

  // Calculate matching scores for all cases before grouping
  const casesWithScores = areaFilteredCases.map((caseItem) => {
    if (!caseItem.matchingScore) {
      caseItem.matchingScore = calculateMatchingScore(caseItem, userSelections);
    }
    return caseItem;
  });

  casesWithScores.forEach((caseItem) => {
    const concern = extractConcernFromCaseName(caseItem.name);
    const treatment = extractTreatmentFromCaseName(caseItem.name);

    if (!concernGroups[concern]) {
      concernGroups[concern] = {
        concern: concern,
        treatments: {}, // Second level: group by treatment
      };
    }

    if (!concernGroups[concern].treatments[treatment]) {
      concernGroups[concern].treatments[treatment] = [];
    }

    concernGroups[concern].treatments[treatment].push(caseItem);
  });

  // Convert to array format for rendering
  // Each concern becomes a group with its treatments
  const groups = Object.values(concernGroups).map((concernGroup) => {
    const treatments = Object.keys(concernGroup.treatments);
    const allCases = Object.values(concernGroup.treatments).flat();

    // Sort cases by matching score (most similar first)
    const sortedCases = allCases.sort((a, b) => {
      const scoreA = a.matchingScore || 0;
      const scoreB = b.matchingScore || 0;
      return scoreB - scoreA; // Descending order (highest first)
    });

    return {
      suggestion: concernGroup.concern, // This is the concern name
      cases: sortedCases,
      treatments: treatments.sort(), // List of treatments for this concern
      treatmentsByCase: concernGroup.treatments, // Detailed treatment grouping
    };
  });

  return groups.sort((a, b) => b.cases.length - a.cases.length);
}

function populateResultsScreen() {
  // Use high-level categories if available, otherwise fall back to selected issues
  const categories = userSelections.selectedConcernCategories || [];
  const selectedIssues = userSelections.selectedIssues || [];

  // Filter out locked concerns (these will be available post-conversion)
  const availableCategories = categories.filter(
    (id) => !LOCKED_CONCERNS.includes(id)
  );

  // If we have categories, use those; otherwise use issues
  const itemsToShow =
    availableCategories.length > 0
      ? availableCategories
          .map((id) => {
            const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
            return category
              ? { type: "category", name: category.name, id: id }
              : null;
          })
          .filter(Boolean)
      : selectedIssues.map((issue) => ({ type: "issue", name: issue }));

  if (itemsToShow.length === 0) {
    console.warn("No selected concerns for results screen");
    return;
  }

  // Populate tabs
  const tabsContainer = document.getElementById("results-tabs");
  if (tabsContainer) {
    tabsContainer.innerHTML = itemsToShow
      .map((item, index) => {
        // Get case count for this category/issue
        const matchingCases = getMatchingCasesForItem(item);
        const caseCount = matchingCases.length;
        return `
        <button class="results-tab ${index === 0 ? "active" : ""}" 
                onclick="switchResultsTab(${index})" 
                data-index="${index}">
          ${item.name}${caseCount > 0 ? ` (${caseCount})` : ""}
        </button>
      `;
      })
      .join("");
  }

  // Populate content sections for each concern
  const contentContainer = document.getElementById("results-content");
  if (contentContainer) {
    contentContainer.innerHTML = itemsToShow
      .map((item, index) => {
        const description =
          item.type === "category"
            ? HIGH_LEVEL_CONCERNS.find((c) => c.id === item.id)?.description ||
              ""
            : generateIssueGoalDescription(item);
        const matchingCases = getMatchingCasesForItem(item);

        // Group cases by treatment suggestion
        const treatmentGroups = groupCasesByTreatmentSuggestion(matchingCases);

        // Store treatment groups for this concern (for detail page)
        const concernKey = item.type === "category" ? item.id : item.name;
        treatmentGroupsByConcern[concernKey] = {
          item: item,
          treatmentGroups: treatmentGroups,
        };

        // Get prevalence info
        const userAge = userSelections.age || 35;
        const prevalenceInfo =
          item.type === "issue"
            ? getPrevalenceDescription(item.name, userAge)
            : null;

        return `
        <div class="results-concern-section ${
          index === 0 ? "active" : ""
        }" data-index="${index}">
          <div class="concern-overview">
            <h2 class="concern-name">${item.name}</h2>
            <p class="concern-description">${description}</p>
            ${
              prevalenceInfo
                ? `
              <div class="concern-prevalence">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                ${prevalenceInfo}
              </div>
            `
                : ""
            }
          </div>

          <div class="treatment-groups-section">
            ${
              treatmentGroups.length > 0
                ? `
              <div class="treatment-groups-grid">
                ${treatmentGroups
                  .map((group, groupIndex) => {
                    // Lock suggestions with only 1 case
                    const isLocked = group.cases.length === 1;

                    // Get area tags for this treatment group (which areas it relates to)
                    const areaTags = getTreatmentGroupRelevance(
                      group,
                      userSelections
                    );
                    const areaHtml =
                      areaTags.length > 0
                        ? `
                    <div class="treatment-group-relevance">
                      <span class="relevance-label">Relevant to your interests:</span>
                      ${areaTags
                        .map(
                          (area) =>
                            `<span class="relevance-tag">${escapeHtml(
                              area
                            )}</span>`
                        )
                        .join("")}
                    </div>
                  `
                        : "";

                    // If locked, show locked version
                    if (isLocked) {
                      const previewCase = group.cases[0];
                      const imageUrl =
                        previewCase.beforeAfter || previewCase.thumbnail;
                      return `
                  <div class="treatment-group-card treatment-group-card-locked" onclick="requestConsultation()">
                    <div class="treatment-group-header">
                      <h3 class="treatment-group-title">${escapeHtml(
                        group.suggestion
                      )}</h3>
                      <span class="treatment-group-count locked-count">1 case</span>
                    </div>
                    ${areaHtml}
                    <div class="treatment-group-preview-wrapper locked-preview">
                      <div class="treatment-group-preview" data-group-index="${groupIndex}">
                        ${
                          imageUrl
                            ? `<img src="${imageUrl}" alt="${escapeHtml(
                                previewCase.name
                              )}" class="treatment-group-preview-image" onerror="this.style.display='none'">`
                            : '<div class="treatment-group-placeholder">Preview</div>'
                        }
                        <div class="treatment-group-lock-overlay">
                          ${getIconSVG("lock", 24)}
                        </div>
                      </div>
                    </div>
                    <div class="treatment-group-footer locked-footer">
                      <div class="treatment-group-locked-message">
                        <strong>See more cases</strong> by booking an in-clinic consultation
                      </div>
                      <span class="treatment-group-cta locked-cta">Request Consultation →</span>
                    </div>
                  </div>
                  `;
                    }

                    return `
                  <div class="treatment-group-card" onclick="showTreatmentDetail('${escapeHtml(
                    item.type
                  )}', '${escapeHtml(item.id || item.name)}', ${groupIndex})">
                    <div class="treatment-group-header">
                      <h3 class="treatment-group-title">${escapeHtml(
                        group.suggestion
                      )}</h3>
                      <span class="treatment-group-count">${
                        group.cases.length
                      } case${group.cases.length !== 1 ? "s" : ""}</span>
                    </div>
                    ${areaHtml}
                    <div class="treatment-group-preview-wrapper">
                      <div class="treatment-group-preview" data-group-index="${groupIndex}">
                        ${group.cases
                          .map((caseItem) => {
                            const imageUrl =
                              caseItem.beforeAfter || caseItem.thumbnail;
                            return `<img src="${imageUrl}" alt="${escapeHtml(
                              caseItem.name
                            )}" class="treatment-group-preview-image" onerror="this.style.display='none'">`;
                          })
                          .join("")}
                      </div>
                      <button class="treatment-group-scroll-arrow left" onclick="scrollPreviewLeft(this, event)" aria-label="Scroll left" type="button">
                        <svg viewBox="0 0 24 24">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </button>
                      <button class="treatment-group-scroll-arrow right" onclick="scrollPreviewRight(this, event)" aria-label="Scroll right" type="button">
                        <svg viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </button>
                    </div>
                    <div class="treatment-group-footer">
                      <span class="treatment-group-cta">Explore →</span>
                    </div>
                  </div>
                  `;
                  })
                  .join("")}
              </div>
            `
                : `
              <div class="no-cases-message">
                <h3>No cases available yet</h3>
                <p>Our providers can discuss treatment options during your consultation.</p>
              </div>
            `
            }
          </div>
        </div>
      `;
      })
      .join("");
  }

  activeResultsTab = 0;

  // Initialize scroll arrows after content is loaded
  setTimeout(initializeScrollArrows, 100);
}

// Scroll preview carousel functions
window.scrollPreviewLeft = function (button, event) {
  if (event) {
    event.stopPropagation(); // Prevent card click
    event.preventDefault();
  }
  const wrapper = button.closest(".treatment-group-preview-wrapper");
  const preview = wrapper.querySelector(".treatment-group-preview");
  if (preview) {
    preview.scrollBy({ left: -200, behavior: "smooth" });
  }
};

window.scrollPreviewRight = function (button, event) {
  if (event) {
    event.stopPropagation(); // Prevent card click
    event.preventDefault();
  }
  const wrapper = button.closest(".treatment-group-preview-wrapper");
  const preview = wrapper.querySelector(".treatment-group-preview");
  if (preview) {
    preview.scrollBy({ left: 200, behavior: "smooth" });
  }
};

// Update scroll arrow visibility and gradient shadows based on scroll position
function initializeScrollArrows() {
  const updateScrollState = (preview) => {
    const wrapper = preview.closest(".treatment-group-preview-wrapper");
    if (!wrapper) return;

    // Only update if the preview is in a visible section
    const section = wrapper.closest(".results-concern-section");
    if (section && !section.classList.contains("active")) {
      return; // Skip hidden sections
    }

    const leftArrow = wrapper.querySelector(
      ".treatment-group-scroll-arrow.left"
    );
    const rightArrow = wrapper.querySelector(
      ".treatment-group-scroll-arrow.right"
    );

    // Check if there's content to scroll (content width > container width)
    const hasScrollableContent = preview.scrollWidth > preview.clientWidth;
    const isAtStart = preview.scrollLeft <= 1; // Use 1px threshold for rounding
    const isAtEnd =
      preview.scrollLeft >= preview.scrollWidth - preview.clientWidth - 1;

    // Update arrows - show right arrow initially if there's scrollable content
    if (leftArrow) {
      if (isAtStart || !hasScrollableContent) {
        leftArrow.classList.add("hidden");
      } else {
        leftArrow.classList.remove("hidden");
      }
    }

    if (rightArrow) {
      if (isAtEnd || !hasScrollableContent) {
        rightArrow.classList.add("hidden");
      } else {
        rightArrow.classList.remove("hidden");
      }
    }

    // Update gradient shadows - show when there's room to scroll
    if (isAtStart || !hasScrollableContent) {
      wrapper.classList.remove("has-scroll-left");
    } else {
      wrapper.classList.add("has-scroll-left");
    }

    if (isAtEnd || !hasScrollableContent) {
      wrapper.classList.remove("has-scroll-right");
    } else {
      wrapper.classList.add("has-scroll-right");
    }
  };

  // Only process previews in active/visible sections
  document
    .querySelectorAll(
      ".results-concern-section.active .treatment-group-preview"
    )
    .forEach((preview) => {
      // Small delay to ensure DOM is fully rendered and dimensions are calculated
      setTimeout(() => {
        updateScrollState(preview);
      }, 100);

      // Update on scroll - use a flag to prevent duplicate listeners
      if (!preview.dataset.scrollListenerAttached) {
        preview.addEventListener(
          "scroll",
          () => {
            updateScrollState(preview);
          },
          { passive: true }
        );
        preview.dataset.scrollListenerAttached = "true";
      }
    });

  // Update on resize
  const handleResize = () => {
    document
      .querySelectorAll(
        ".results-concern-section.active .treatment-group-preview"
      )
      .forEach((preview) => {
        updateScrollState(preview);
      });
  };

  // Remove existing resize listener if any, then add new one
  if (window._scrollArrowsResizeHandler) {
    window.removeEventListener("resize", window._scrollArrowsResizeHandler);
  }
  window._scrollArrowsResizeHandler = handleResize;
  window.addEventListener("resize", handleResize);
}

function switchResultsTab(index) {
  activeResultsTab = index;

  // Update tab active states
  const tabs = document.querySelectorAll(".results-tab");
  tabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });

  // Update content section visibility
  const sections = document.querySelectorAll(".results-concern-section");
  sections.forEach((section, i) => {
    section.classList.toggle("active", i === index);
  });

  // Scroll content to top
  const contentContainer = document.getElementById("results-content");
  if (contentContainer) {
    contentContainer.scrollTop = 0;
  }

  // Re-initialize scroll arrows and shadows for the newly visible section
  // Use a delay to ensure DOM is fully updated
  setTimeout(() => {
    initializeScrollArrows();
  }, 150);
}

// Show treatment detail page with treatment selection
function showTreatmentDetail(itemType, itemId, groupIndex) {
  const concernKey = itemId;
  const concernData = treatmentGroupsByConcern[concernKey];

  if (!concernData || !concernData.treatmentGroups[groupIndex]) {
    console.error("Treatment group not found");
    return;
  }

  const group = concernData.treatmentGroups[groupIndex];
  const item = concernData.item;

  // Hide results screen, show treatment detail screen
  document.getElementById("results-screen")?.classList.remove("active");
  document.getElementById("treatment-detail-screen")?.classList.add("active");

  // Update title
  const titleEl = document.getElementById("treatment-detail-title");
  const subtitleEl = document.getElementById("treatment-detail-subtitle");
  if (titleEl) titleEl.textContent = group.suggestion;
  if (subtitleEl)
    subtitleEl.textContent = `${group.cases.length} patient result${
      group.cases.length !== 1 ? "s" : ""
    }`;

  // Directly show all cases - skip treatment selection step
  const contentEl = document.getElementById("treatment-detail-content");
  if (contentEl) {
    // Pass the group suggestion as page context to simplify case titles
    contentEl.innerHTML = `
      <div class="treatment-cases-grid">
        ${group.cases
          .map((caseItem) => renderCasePreviewCard(caseItem, group.suggestion))
          .join("")}
      </div>
    `;
  }

  // Update CTA footer visibility
  updateFloatingCTA();

  scrollToTop();
}

// Show cases for a specific treatment
function showTreatmentCases(concernKey, groupIndex, treatmentName) {
  const concernData = treatmentGroupsByConcern[concernKey];

  if (!concernData || !concernData.treatmentGroups[groupIndex]) {
    console.error("Treatment group not found");
    return;
  }

  const group = concernData.treatmentGroups[groupIndex];

  // Filter cases by treatment - use treatmentsByCase if available
  let filteredCases = [];
  if (group.treatmentsByCase && group.treatmentsByCase[treatmentName]) {
    filteredCases = group.treatmentsByCase[treatmentName];
  } else {
    // Fallback: filter by extracting treatment from case name
    filteredCases = group.cases.filter((caseItem) => {
      const caseTreatment = extractTreatmentFromCaseName(caseItem.name);
      return caseTreatment === treatmentName;
    });
  }

  // Update title
  const titleEl = document.getElementById("treatment-detail-title");
  const subtitleEl = document.getElementById("treatment-detail-subtitle");
  if (titleEl) titleEl.textContent = `${group.suggestion} - ${treatmentName}`;
  if (subtitleEl)
    subtitleEl.textContent = `${filteredCases.length} patient result${
      filteredCases.length !== 1 ? "s" : ""
    }`;

  // Populate with cases
  const contentEl = document.getElementById("treatment-detail-content");
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="treatment-cases-grid">
        ${filteredCases
          .map((caseItem) => renderCasePreviewCard(caseItem))
          .join("")}
      </div>
    `;
  }

  scrollToTop();
}

// Go back to results screen
function goBackToResults() {
  document
    .getElementById("treatment-detail-screen")
    ?.classList.remove("active");
  document.getElementById("results-screen")?.classList.add("active");
  scrollToTop();
}

// Helper function to extract just the treatment name from a case name
// e.g., "Resolve Brow Ptosis with Microneedling" -> "Microneedling"
function extractTreatmentFromCaseNameForDisplay(caseName) {
  if (!caseName) return caseName;

  // Look for "with [Treatment]" pattern
  const withMatch = caseName.match(/\s+with\s+(.+)$/i);
  if (withMatch && withMatch[1]) {
    return withMatch[1].trim();
  }

  // Look for " - [Treatment]" pattern
  const dashMatch = caseName.match(/\s+-\s+(.+)$/);
  if (dashMatch && dashMatch[1]) {
    return dashMatch[1].trim();
  }

  // Fallback: return original name
  return caseName;
}

function renderCasePreviewCard(caseItem, pageContext = null) {
  const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
  // Only show demographic matches on case cards (exclude areas and concerns)
  const matchIndicators = getMatchIndicators(caseItem, userSelections, true);
  const matchIndicatorsHtml =
    matchIndicators.length > 0
      ? `
    <div class="case-match-indicators">
      ${matchIndicators
        .map(
          (ind) =>
            `<span class="match-indicator match-${ind.type}">✓ ${ind.text}</span>`
        )
        .join("")}
    </div>
  `
      : "";
  const treatments = (caseItem.treatments || []).slice(0, 2);

  // If pageContext is provided (e.g., "Resolve Brow Ptosis"), simplify the case name to just show treatment
  let displayTitle = caseItem.name;
  if (pageContext) {
    const extractedTreatment = extractTreatmentFromCaseNameForDisplay(
      caseItem.name
    );
    displayTitle = extractedTreatment;
  }

  // Get matching goals to display as tags
  const goalLabels = {
    "facial-balancing": "Facial Balancing",
    "anti-aging": "Anti-Aging",
    "skin-rejuvenation": "Skin Rejuvenation",
    "natural-look": "Natural Look",
  };

  // Find goals that match this case
  const userGoals = userSelections.overallGoals || [];
  const caseCriteria = caseItem.matchingCriteria || [];

  // Get matching goals (user's goals that this case addresses)
  const matchingGoals = userGoals.filter((goal) => caseCriteria.includes(goal));

  // Also check for issue matches from the current concern being displayed
  const userIssues = userSelections.selectedIssues || [];
  const caseIssues = caseItem.directMatchingIssues || [];
  const matchingIssues = userIssues.filter((issue) =>
    caseIssues.some(
      (caseIssue) => caseIssue.toLowerCase() === issue.toLowerCase()
    )
  );

  // Build goal tags HTML
  let goalTagsHtml = "";
  if (matchingGoals.length > 0) {
    const goalTags = matchingGoals
      .slice(0, 2)
      .map(
        (goal) =>
          `<span class="case-goal-tag">${goalLabels[goal] || goal}</span>`
      )
      .join("");
    goalTagsHtml = `<div class="case-goal-tags">${goalTags}</div>`;
  } else if (matchingIssues.length > 0) {
    // Show matching issue as a tag if no goal matches
    const issueTag = `<span class="case-goal-tag">${matchingIssues[0]}</span>`;
    goalTagsHtml = `<div class="case-goal-tags">${issueTag}</div>`;
  }

  return `
    <div class="case-preview-card" onclick="showCaseFromResults('${
      caseItem.id
    }')">
      ${
        imageUrl
          ? `
        <img class="case-preview-image" src="${imageUrl}" alt="Before and after" loading="lazy" 
             onerror="this.classList.add('placeholder'); this.outerHTML='<div class=\\'case-preview-image placeholder\\'>Before/After</div>';">
      `
          : `
        <div class="case-preview-image placeholder">Before/After</div>
      `
      }
      <div class="case-preview-content">
        <div class="case-preview-header">
          <h4 class="case-preview-title">${escapeHtml(displayTitle)}</h4>
          ${
            caseItem.demographicMatchPercentage !== undefined &&
            caseItem.demographicMatchPercentage !== null
              ? `
            <div class="case-match-percentage">${caseItem.demographicMatchPercentage}% match</div>
          `
              : ""
          }
        </div>
        ${matchIndicatorsHtml}
        ${goalTagsHtml}
        ${
          treatments.length > 0
            ? `
          <div class="case-preview-treatments">
            ${treatments
              .map((t) => `<span class="case-treatment-badge">${t}</span>`)
              .join("")}
          </div>
        `
            : ""
        }
        <button class="case-preview-cta" onclick="showCaseFromResults('${
          caseItem.id
        }'); event.stopPropagation();">
          <span>View Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function showCaseFromResults(caseId) {
  const caseItem = caseData.find((c) => c.id === caseId);
  if (caseItem) {
    // Check if we're coming from treatment detail screen or results screen
    const treatmentDetailActive = document
      .getElementById("treatment-detail-screen")
      ?.classList.contains("active");
    if (treatmentDetailActive) {
      caseDetailReturnScreen = "treatment-detail";
    } else {
      caseDetailReturnScreen = "results";
    }
    showCaseDetail(caseItem);
  }
}

function getTreatmentsForIssue(issueName) {
  // Map issues to common treatments
  const treatmentMap = {
    "Forehead Wrinkles": ["Botox", "Dysport", "Xeomin"],
    "Glabella Wrinkles": ["Botox", "Dysport", "Dermal Fillers"],
    "Crow's Feet Wrinkles": ["Botox", "Dysport"],
    "Nasolabial Folds": ["Dermal Fillers", "Juvederm", "Restylane"],
    "Marionette Lines": ["Dermal Fillers", "Juvederm"],
    "Under Eye Dark Circles": ["Under Eye Filler", "PRP Therapy"],
    "Under Eye Wrinkles": ["Botox", "Under Eye Filler"],
    "Thin Lips": ["Lip Filler", "Juvederm Volbella"],
    "Lip Lines": ["Botox", "Lip Filler"],
    Jowls: ["Kybella", "Thread Lift", "Morpheus8"],
    "Double Chin": ["Kybella", "CoolSculpting"],
    "Acne Scars": ["Microneedling", "Chemical Peel", "Laser"],
    "Skin Texture": ["Microneedling", "Chemical Peel", "HydraFacial"],
    "Sun Damage": ["IPL", "Chemical Peel", "Laser"],
    "Stubborn Fat": ["CoolSculpting", "Kybella", "Liposuction"],
    Cellulite: ["Morpheus8", "QWO", "Emtone"],
  };

  // Check for exact match
  if (treatmentMap[issueName]) {
    return treatmentMap[issueName];
  }

  // Check for partial matches
  const issueNameLower = issueName.toLowerCase();
  for (const [key, treatments] of Object.entries(treatmentMap)) {
    if (
      key.toLowerCase().includes(issueNameLower) ||
      issueNameLower.includes(key.toLowerCase())
    ) {
      return treatments;
    }
  }

  // Default treatments
  return ["Consultation Required", "Multiple Options Available"];
}

function getPrevalenceDescription(issueName, age) {
  // Use the embedded prevalence data if available
  if (
    typeof issuePrevalenceData !== "undefined" &&
    issuePrevalenceData[issueName]
  ) {
    const data = issuePrevalenceData[issueName];
    const ageGroup = getAgeGroup(age);
    if (data.byAge && data.byAge[ageGroup]) {
      const percentage = data.byAge[ageGroup].percentage;
      if (percentage) {
        return `Common in ${percentage}% of patients in your age group`;
      }
    }
  }
  return null;
}

function getAgeGroup(age) {
  if (age < 30) return "18-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

// Expose new functions globally
window.switchResultsTab = switchResultsTab;
window.showCaseFromResults = showCaseFromResults;
window.populateResultsScreen = populateResultsScreen;

// Expose functions globally for onclick handlers
window.skipLeadCapture = skipLeadCapture;
window.proceedToResults = proceedToResults;

// Expose concern category functions globally
window.toggleConcernCategory = toggleConcernCategory;
window.initializeConcernCategories = initializeConcernCategories;
window.initializeAreasOfConcern = initializeAreasOfConcern;
window.toggleAreaOfConcern = toggleAreaOfConcern;
window.proceedToGoalsAndAge = proceedToGoalsAndAge;
window.startForm = startForm;
window.handleStartButtonClick = handleStartButtonClick;
window.filterGalleryByConcern = filterGalleryByConcern;

// Initialize userSelections on window for global access
window.userSelections = userSelections;

// Map goals to related issues
const goalToIssuesMap = {
  "facial-balancing": [
    "Brow Asymmetry",
    "Asymmetric Chin",
    "Asymmetric Jawline",
    "Asymmetric Lips",
    "Crooked Nose",
    "Ill-Defined Jawline",
    "Cheekbone - Not Prominent",
    "Retruded Chin",
    "Over-Projected Chin",
    "Temporal Hollow",
    "Mid Cheek Flattening",
  ],
  "anti-aging": [
    "Forehead Wrinkles",
    "Crow's Feet Wrinkles",
    "Glabella Wrinkles",
    "Under Eye Wrinkles",
    "Perioral Wrinkles",
    "Bunny Lines",
    "Nasolabial Folds",
    "Marionette Lines",
    "Neck Lines",
    "Jowls",
    "Loose Neck Skin",
    "Platysmal Bands",
    "Lower Cheeks - Volume Depletion",
    "Under Eye Hollow",
    "Upper Eye Hollow",
    "Crepey Skin",
  ],
  "skin-rejuvenation": [
    "Dark Spots",
    "Red Spots",
    "Scars",
    "Dry Skin",
    "Whiteheads",
    "Blackheads",
    "Crepey Skin",
    "Under Eye Dark Circles",
    "Rosacea",
  ],
  "natural-look": [
    "Forehead Wrinkles",
    "Under Eye Wrinkles",
    "Nasolabial Folds",
    "Marionette Lines",
    "Under Eye Dark Circles",
    "Dark Spots",
    "Jowls",
    "Ill-Defined Jawline",
    "Mid Cheek Flattening",
    "Lower Cheeks - Volume Depletion",
  ],
};

// ============================================================================
// ISSUE RELATIONSHIP ZONES
// Groups semantically related issues into treatment zones for better UX
// ============================================================================

const issueRelationshipZones = {
  "under-eye": {
    name: "Complete Under Eye Rejuvenation",
    icon: "eye",
    issues: [
      "Under Eye Hollow",
      "Under Eye Wrinkles",
      "Under Eye Dark Circles",
      "Lower Eyelid Bags",
      "Lower Eyelid - Excess Skin",
      "Lower Eyelid Sag",
    ],
    description:
      "These concerns often appear together and can be addressed comprehensively for complete under-eye renewal.",
    benefit:
      "Treating related under-eye concerns together often yields more natural, harmonious results.",
  },
  "upper-eye": {
    name: "Upper Eye Area Enhancement",
    icon: "eye",
    issues: [
      "Upper Eye Hollow",
      "Excess Upper Eyelid Skin",
      "Upper Eyelid Droop",
      "Brow Ptosis",
      "Crow's Feet Wrinkles",
    ],
    description:
      "The upper eye area works as a unit—addressing related concerns creates a more refreshed, awake appearance.",
    benefit:
      "A comprehensive approach to the upper eye area can take years off your appearance.",
  },
  "forehead-brow": {
    name: "Forehead & Brow Harmony",
    icon: "forehead",
    issues: [
      "Forehead Wrinkles",
      "Glabella Wrinkles",
      "Brow Asymmetry",
      "Brow Ptosis",
      "Flat Forehead",
      "Bunny Lines",
    ],
    description:
      "The forehead and brow work together to frame your face and express emotions.",
    benefit: "Balancing this area creates a more youthful, relaxed expression.",
  },
  "mid-face": {
    name: "Mid-Face Volume & Contour",
    icon: "face",
    issues: [
      "Mid Cheek Flattening",
      "Cheekbone - Not Prominent",
      "Nasolabial Folds",
      "Lower Cheeks - Volume Depletion",
      "Temporal Hollow",
    ],
    description:
      "Volume loss in the mid-face affects overall facial structure and can contribute to other concerns.",
    benefit:
      "Restoring mid-face volume often improves the appearance of lines and adds youthful contour.",
  },
  "lower-face": {
    name: "Lower Face Definition",
    icon: "jawline",
    issues: [
      "Jowls",
      "Ill-Defined Jawline",
      "Marionette Lines",
      "Prejowl Sulcus",
      "Asymmetric Jawline",
      "Retruded Chin",
      "Over-Projected Chin",
      "Asymmetric Chin",
    ],
    description:
      "The jawline and lower face define your profile and are key to facial balance.",
    benefit:
      "Addressing lower face concerns together creates a more defined, sculpted appearance.",
  },
  neck: {
    name: "Neck Rejuvenation",
    icon: "neck",
    issues: [
      "Neck Lines",
      "Loose Neck Skin",
      "Platysmal Bands",
      "Excess/Submental Fullness",
    ],
    description:
      "The neck often shows signs of aging first and is closely connected to jawline concerns.",
    benefit:
      "Neck treatments complement facial rejuvenation for a cohesive, youthful result.",
  },
  "lips-mouth": {
    name: "Lip & Perioral Enhancement",
    icon: "lips",
    issues: [
      "Thin Lips",
      "Perioral Wrinkles",
      "Lacking Philtral Column",
      "Long Philtral Column",
      "Gummy Smile",
      "Dry Lips",
      "Lip Thinning When Smiling",
      "Asymmetric Lips",
    ],
    description:
      "The lips and surrounding area are central to facial expression and attractiveness.",
    benefit:
      "Comprehensive lip area treatment creates natural, balanced enhancement.",
  },
  nose: {
    name: "Nose Refinement",
    icon: "nose",
    issues: ["Crooked Nose", "Droopy Tip", "Dorsal Hump"],
    description:
      "The nose is central to facial harmony—small adjustments can have a big impact.",
    benefit:
      "Non-surgical nose refinements can balance your profile without downtime.",
  },
  "skin-texture": {
    name: "Skin Clarity & Texture",
    icon: "skin",
    issues: [
      "Dark Spots",
      "Red Spots",
      "Scars",
      "Whiteheads",
      "Blackheads",
      "Crepey Skin",
      "Rosacea",
      "Dry Skin",
    ],
    description:
      "Skin quality issues often benefit from multi-modal treatment approaches.",
    benefit:
      "Clear, smooth skin enhances all other facial features and treatments.",
  },
};

// Find which zones a given issue belongs to
function getIssueZones(issueName) {
  const zones = [];
  for (const [zoneId, zone] of Object.entries(issueRelationshipZones)) {
    if (zone.issues.includes(issueName)) {
      zones.push({ id: zoneId, ...zone });
    }
  }
  return zones;
}

// Get related issues from the same zones as the user's selected issues
function getRelatedIssuesFromZones(selectedIssues) {
  const relatedMap = new Map(); // issue -> { zones: [], relevanceScore: number }

  selectedIssues.forEach((selectedIssue) => {
    const zones = getIssueZones(selectedIssue);
    zones.forEach((zone) => {
      zone.issues.forEach((relatedIssue) => {
        if (!selectedIssues.includes(relatedIssue)) {
          if (!relatedMap.has(relatedIssue)) {
            relatedMap.set(relatedIssue, {
              zones: [],
              connectedTo: [],
              relevanceScore: 0,
            });
          }
          const entry = relatedMap.get(relatedIssue);
          if (!entry.zones.find((z) => z.id === zone.id)) {
            entry.zones.push(zone);
          }
          if (!entry.connectedTo.includes(selectedIssue)) {
            entry.connectedTo.push(selectedIssue);
          }
          entry.relevanceScore++;
        }
      });
    });
  });

  return relatedMap;
}

// Generate a personalized explanation for why a related issue matters
function generateRelationshipExplanation(relatedIssue, connectedIssues, zones) {
  const positiveName = getIssuePositiveSuggestion(relatedIssue);
  const connectedNames = connectedIssues.map((i) =>
    getIssuePositiveSuggestion(i)
  );

  if (zones.length > 0) {
    const zone = zones[0];
    if (connectedIssues.length === 1) {
      return `Often addressed alongside ${
        connectedNames[0]
      } for ${zone.name.toLowerCase()}.`;
    } else {
      return `Connected to your selected concerns as part of ${zone.name.toLowerCase()}.`;
    }
  }

  return `Related to your aesthetic goals.`;
}

async function showIssueDetailScreen() {
  document.getElementById("form-screen").classList.remove("active");
  document.getElementById("issue-detail-screen").classList.add("active");

  // Clear any issue overview state to ensure we show the list, not an individual issue
  currentIssueOverview = null;
  issueOverviewReturnScreen = null;

  // Scroll to top of the page
  scrollToTop();

  // Show top-right buttons only on this screen
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.add("visible");
  }

  // Update floating CTA
  updateFloatingCTA();

  const content = document.getElementById("issue-detail-content");
  content.innerHTML =
    '<div style="padding: 40px; text-align: center; color: #666;">Loading concerns...</div>';

  // Wait for prevalence data to load (non-blocking, with timeout)
  await waitForPrevalenceData(1000);

  // Render the content
  await renderIssueDetailContent();
}

// Separate function for rendering content so it can be reused
async function renderIssueDetailContent() {
  const content = document.getElementById("issue-detail-content");
  if (!content) {
    console.error("Issue detail content container not found");
    return;
  }

  content.innerHTML = "";

  // Get explicitly selected issues - check window.userSelections first (from body selector), then fall back to local userSelections
  const selectedIssues = getSelectedIssuesFromRows();
  const explicitIssues = [...selectedIssues];

  // Get issues related to goals - use window.userSelections if available, otherwise local userSelections
  const currentUserSelections = window.userSelections || userSelections;
  const goalRelatedIssues = new Set();
  (currentUserSelections.overallGoals || []).forEach((goal) => {
    const relatedIssues = goalToIssuesMap[goal] || [];
    relatedIssues.forEach((issue) => goalRelatedIssues.add(issue));
  });

  // Remove issues that are already in explicit list
  explicitIssues.forEach((issue) => goalRelatedIssues.delete(issue));
  const relatedIssues = Array.from(goalRelatedIssues);

  if (explicitIssues.length === 0 && relatedIssues.length === 0) {
    // If no items, go straight to gallery
    proceedToGallery();
    return;
  }

  // Create header with back button
  const header = document.createElement("div");
  header.className = "issues-list-header";
  header.innerHTML = `
        <button class="back-button" onclick="goBackToForm()" style="margin-bottom: 20px;">← Back</button>
        <h1 class="issues-list-title">Your Aesthetic Concerns</h1>
        <p class="issues-list-subtitle">
          Select a concern to explore treatment options
          <button type="button" class="goals-help-link" onclick="showGoalsExplainer()">What do the goals mean?</button>
        </p>
    `;
  content.appendChild(header);

  // Discount banner removed - now shown as tags on individual cards

  // Track used case IDs to ensure unique photos across ALL concerns (both sections)
  const usedCaseIds = new Set();

  // Section 1: Explicitly selected issues
  if (explicitIssues.length > 0) {
    // Separate starred (goal-added) issues from regular issues
    const starredIssues = explicitIssues.filter((issue) =>
      isIssueInGoals(issue)
    );
    const regularIssues = explicitIssues.filter(
      (issue) => !isIssueInGoals(issue)
    );

    // Pre-process to assign unique cases to each issue
    const issueCaseMap = new Map();
    explicitIssues.forEach((issue) => {
      const matchingCases = getMatchingCasesForItem({
        type: "issue",
        name: issue,
      });
      if (matchingCases.length > 0) {
        // Find first unused case
        const unusedCase = matchingCases.find((c) => !usedCaseIds.has(c.id));
        if (unusedCase) {
          issueCaseMap.set(issue, unusedCase);
          usedCaseIds.add(unusedCase.id);
        } else {
          // If all cases are used, use the first one anyway
          issueCaseMap.set(issue, matchingCases[0]);
        }
      }
    });

    // Regular (non-starred) issues section
    if (regularIssues.length > 0) {
      const section1 = document.createElement("div");
      section1.className = "issues-section";
      section1.innerHTML = `
            <h2 class="issues-section-title">Your Selected Concerns</h2>
            <div class="concerns-grid">
                ${regularIssues
                  .map((issue) =>
                    createIssueCard(
                      issue,
                      "explicit",
                      usedCaseIds,
                      issueCaseMap.get(issue)
                    )
                  )
                  .join("")}
            </div>
        `;
      content.appendChild(section1);
    }

    // Starred (goal-added) issues section - collapsible
    if (starredIssues.length > 0) {
      const starredSection = document.createElement("div");
      starredSection.className = "issues-section expert-perspective-section";
      starredSection.innerHTML = `
            <div class="expert-perspective-accordion collapsed" data-expert="perspective">
                <button class="expert-perspective-header" onclick="toggleExpertPerspective()">
                    <div class="expert-perspective-title">
                        <div class="expert-icon">${getIconSVG("star", 20)}</div>
                        <div class="expert-info">
                            <span class="expert-name">Get an Expert's Perspective</span>
                            <span class="expert-subtitle">Concerns you've marked as priorities</span>
                        </div>
                    </div>
                    <div class="expert-meta">
                        <span class="expert-count">${
                          starredIssues.length
                        } concern${starredIssues.length !== 1 ? "s" : ""}</span>
                        <div class="expert-accordion-toggle">
                            ${getIconSVG("arrowRight", 16)}
                        </div>
                    </div>
                </button>
                <div class="expert-perspective-content" style="display: none;">
                    <div class="concerns-grid">
                        ${starredIssues
                          .map((issue) =>
                            createIssueCard(
                              issue,
                              "explicit",
                              usedCaseIds,
                              issueCaseMap.get(issue)
                            )
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `;
      content.appendChild(starredSection);
    }
  }

  // Section 2: Related issues organized by treatment zones (more engaging!)
  // This section shows issues that are related to the user's selected concerns
  // and explains WHY they're relevant for comprehensive treatment

  const relatedIssuesMap = getRelatedIssuesFromZones(explicitIssues);
  const userGoals = userSelections.overallGoals;

  // Also get goal-related issues that aren't covered by zones
  const goalRelatedSet = new Set();
  userGoals.forEach((goal) => {
    const goalIssues = goalToIssuesMap[goal] || [];
    goalIssues.forEach((issue) => {
      if (!explicitIssues.includes(issue)) {
        goalRelatedSet.add(issue);
      }
    });
  });

  // Merge zone-related and goal-related issues
  goalRelatedSet.forEach((issue) => {
    if (!relatedIssuesMap.has(issue)) {
      relatedIssuesMap.set(issue, {
        zones: [],
        connectedTo: [],
        relevanceScore: 0,
        fromGoal: true,
      });
    }
  });

  if (relatedIssuesMap.size > 0 || userGoals.length > 0) {
    const section2 = document.createElement("div");
    section2.className = "issues-section related-section";

    // Group related issues by their primary zone
    const zoneGroups = new Map();
    const noZoneIssues = [];

    relatedIssuesMap.forEach((data, issue) => {
      if (data.zones.length > 0) {
        const primaryZone = data.zones[0];
        if (!zoneGroups.has(primaryZone.id)) {
          zoneGroups.set(primaryZone.id, { zone: primaryZone, issues: [] });
        }
        zoneGroups.get(primaryZone.id).issues.push({ name: issue, ...data });
      } else {
        noZoneIssues.push({ name: issue, ...data });
      }
    });

    // Sort zone groups by relevance (number of connections to user's selections)
    const sortedZones = Array.from(zoneGroups.values()).sort((a, b) => {
      const aScore = a.issues.reduce((sum, i) => sum + i.relevanceScore, 0);
      const bScore = b.issues.reduce((sum, i) => sum + i.relevanceScore, 0);
      return bScore - aScore;
    });

    // Build the zone-based accordion sections
    let zoneSectionsHtml = "";

    sortedZones.forEach((zoneData, index) => {
      const zone = zoneData.zone;
      const issues = zoneData.issues;

      // Sort issues by relevance within the zone
      issues.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Find which of the user's selected issues connect to this zone
      const connectedUserIssues = new Set();
      issues.forEach((issueData) => {
        issueData.connectedTo.forEach((connected) =>
          connectedUserIssues.add(connected)
        );
      });
      const connectedNames = Array.from(connectedUserIssues).map((i) =>
        getIssuePositiveSuggestion(i)
      );

      // Create a compelling connection message
      let connectionMessage = "";
      if (connectedNames.length === 1) {
        connectionMessage = `Because you're interested in <strong>${connectedNames[0]}</strong>, you might also benefit from addressing these related concerns in the same treatment area.`;
      } else if (connectedNames.length > 1) {
        connectionMessage = `These complement your interest in <strong>${connectedNames
          .slice(0, 2)
          .join("</strong> and <strong>")}</strong>${
          connectedNames.length > 2 ? " and more" : ""
        } for comprehensive results.`;
      }

      // Pre-assign cases for preview (max 2 visible)
      const maxPreview = 2;
      const previewIssues = issues.slice(0, maxPreview);
      const remainingCount = issues.length - maxPreview;

      const issueCaseMap = new Map();
      previewIssues.forEach((issueData) => {
        const matchingCases = getMatchingCasesForItem({
          type: "issue",
          name: issueData.name,
        });
        if (matchingCases.length > 0) {
          const unusedCase = matchingCases.find((c) => !usedCaseIds.has(c.id));
          if (unusedCase) {
            issueCaseMap.set(issueData.name, unusedCase);
            usedCaseIds.add(unusedCase.id);
          } else {
            issueCaseMap.set(issueData.name, matchingCases[0]);
          }
        }
      });

      // First zone is expanded by default
      const isExpanded = index === 0;

      zoneSectionsHtml += `
        <div class="zone-accordion ${
          isExpanded ? "expanded" : ""
        }" data-zone="${zone.id}">
          <button class="zone-accordion-header" onclick="toggleZoneAccordion('${
            zone.id
          }')">
            <div class="zone-accordion-title">
              <div class="zone-icon">${getIconSVG(
                zone.icon || "star",
                20
              )}</div>
              <div class="zone-info">
                <span class="zone-name">${zone.name}</span>
                <span class="zone-benefit">${zone.benefit}</span>
              </div>
            </div>
            <div class="zone-meta">
              <span class="zone-count">${issues.length} option${
        issues.length !== 1 ? "s" : ""
      }</span>
              <div class="zone-accordion-toggle">
                ${getIconSVG("arrowRight", 16)}
              </div>
            </div>
          </button>
          <div class="zone-accordion-content">
            <p class="zone-connection-message">${connectionMessage}</p>
            <div class="concerns-grid locked-list">
              ${previewIssues
                .map((issueData) =>
                  createIssueCard(
                    issueData.name,
                    "related",
                    usedCaseIds,
                    issueCaseMap.get(issueData.name),
                    zone.id
                  )
                )
                .join("")}
            </div>
            ${
              remainingCount > 0
                ? `<div class="zone-more-count">
                    ${getIconSVG("sparkle", 14)}
                    <span>+${remainingCount} more options to explore in-clinic</span>
                  </div>`
                : ""
            }
          </div>
        </div>
      `;
    });

    // If there are goal-related issues without zones, add them in a general section
    if (noZoneIssues.length > 0) {
      const goalLabels = {
        "facial-balancing": "Facial Balancing",
        "anti-aging": "Anti-Aging",
        "skin-rejuvenation": "Skin Rejuvenation",
        "natural-look": "Natural Look",
      };
      const goalsText = userGoals.map((g) => goalLabels[g] || g).join(" & ");

      const maxPreview = 2;
      const previewIssues = noZoneIssues.slice(0, maxPreview);
      const remainingCount = noZoneIssues.length - maxPreview;

      const issueCaseMap = new Map();
      previewIssues.forEach((issueData) => {
        const matchingCases = getMatchingCasesForItem({
          type: "issue",
          name: issueData.name,
        });
        if (matchingCases.length > 0) {
          const unusedCase = matchingCases.find((c) => !usedCaseIds.has(c.id));
          if (unusedCase) {
            issueCaseMap.set(issueData.name, unusedCase);
            usedCaseIds.add(unusedCase.id);
          } else {
            issueCaseMap.set(issueData.name, matchingCases[0]);
          }
        }
      });

      zoneSectionsHtml += `
        <div class="zone-accordion" data-zone="other-goals">
          <button class="zone-accordion-header" onclick="toggleZoneAccordion('other-goals')">
            <div class="zone-accordion-title">
              <div class="zone-icon">${getIconSVG("target", 20)}</div>
              <div class="zone-info">
                <span class="zone-name">More ${goalsText} Options</span>
                <span class="zone-benefit">Additional treatments aligned with your goals</span>
              </div>
            </div>
            <div class="zone-meta">
              <span class="zone-count">${noZoneIssues.length} option${
        noZoneIssues.length !== 1 ? "s" : ""
      }</span>
              <div class="zone-accordion-toggle">
                ${getIconSVG("arrowRight", 16)}
              </div>
            </div>
          </button>
          <div class="zone-accordion-content">
            <p class="zone-connection-message">Based on your <strong>${goalsText}</strong> goals, these additional options may interest you.</p>
            <div class="concerns-grid locked-list">
              ${previewIssues
                .map((issueData) =>
                  createIssueCard(
                    issueData.name,
                    "related",
                    usedCaseIds,
                    issueCaseMap.get(issueData.name),
                    null
                  )
                )
                .join("")}
            </div>
            ${
              remainingCount > 0
                ? `<div class="zone-more-count">
                    ${getIconSVG("sparkle", 14)}
                    <span>+${remainingCount} more options to explore in-clinic</span>
                  </div>`
                : ""
            }
          </div>
        </div>
      `;
    }

    section2.innerHTML = `
            <div class="related-section-header">
                <div class="related-header-content">
                    <h2 class="issues-section-title">Complete Your Treatment Plan</h2>
                    <p class="related-section-intro">
                        <strong>Did you know?</strong> Addressing related concerns together often yields better, more natural-looking results. 
                        Here's what complements your selected treatments:
                    </p>
                </div>
                <div class="locked-badge">${getIconSVG(
                  "lock",
                  12
                )} In-Clinic Only</div>
            </div>
            <div class="zone-accordions">
                ${zoneSectionsHtml}
            </div>
            <div class="consultation-pitch compact">
                <div class="pitch-content">
                    <div class="pitch-icon">${getIconSVG("calendar", 24)}</div>
                    <h3 class="pitch-title">Ready for a Complete Consultation?</h3>
                    <p class="pitch-description">Our experts can create a personalized treatment plan addressing all your concerns for optimal, harmonious results.</p>
                    <button class="pitch-cta-button" onclick="requestConsultation()">Book Your Consultation</button>
                </div>
            </div>
        `;
    content.appendChild(section2);
  }
}

// Toggle accordion for zone sections
function toggleZoneAccordion(zoneId) {
  const accordion = document.querySelector(
    `.zone-accordion[data-zone="${zoneId}"]`
  );
  if (accordion) {
    accordion.classList.toggle("expanded");
  }
}
window.toggleZoneAccordion = toggleZoneAccordion;

// Toggle expert perspective section
function toggleExpertPerspective() {
  const accordion = document.querySelector(".expert-perspective-accordion");
  const content = accordion?.querySelector(".expert-perspective-content");
  const toggle = accordion?.querySelector(".expert-accordion-toggle");

  if (accordion && content && toggle) {
    const isExpanded = !accordion.classList.contains("collapsed");

    if (isExpanded) {
      content.style.display = "none";
      toggle.innerHTML = getIconSVG("arrowRight", 16);
      accordion.classList.add("collapsed");
    } else {
      content.style.display = "block";
      toggle.innerHTML = getIconSVG("arrowDown", 16);
      accordion.classList.remove("collapsed");
    }
  }
}
window.toggleExpertPerspective = toggleExpertPerspective;

// Toggle accordion for goal sections
function toggleGoalAccordion(goalSlug) {
  const accordion = document.querySelector(
    `.goal-accordion[data-goal="${goalSlug}"]`
  );
  if (accordion) {
    accordion.classList.toggle("expanded");
  }
}
window.toggleGoalAccordion = toggleGoalAccordion;

// Map categories to goal-friendly labels that connect to user's selected goals
function getCategoryDisplayLabel(category, goalContext = null) {
  const categoryMapping = {
    // Anti-Aging related
    Wrinkling: "Anti-Aging",
    "Volume Loss": "Anti-Aging",
    Sagging: "Anti-Aging",
    // Facial Balancing related
    Asymmetry: "Facial Balancing",
    "Structure & Definition": "Facial Balancing",
    // Skin Rejuvenation related
    "Skin Quality": "Skin Rejuvenation",
    Texture: "Skin Rejuvenation",
    Pigmentation: "Skin Rejuvenation",
    // Other areas
    "Skin & Eyelids": "Anti-Aging",
    "Lip Concerns": "Facial Balancing",
    "Brow Concerns": "Facial Balancing",
    "Body Concerns": "Body Contouring",
  };
  return categoryMapping[category] || category;
}

// Get discount tag text for an issue based on its characteristics
function getIssueDiscountTag(issueName) {
  const discount = getPersonalizedDiscount();
  if (!discount) return null;

  const issueLower = issueName.toLowerCase();

  // Check if issue is injectable-related
  const injectableKeywords = [
    "wrinkle",
    "line",
    "lip",
    "volume",
    "filler",
    "botox",
    "crow's feet",
    "glabella",
    "forehead",
  ];
  const isInjectable = injectableKeywords.some((keyword) =>
    issueLower.includes(keyword)
  );

  // Determine tag text based on discount type and issue
  if (discount.id === "INJECT50" && isInjectable) {
    return `$${discount.amount} OFF`;
  } else if (discount.id === "PLAN75") {
    return `$${discount.amount} OFF`;
  } else {
    return `$${discount.amount} OFF`;
  }
}

function createIssueCard(
  issueName,
  type,
  usedCaseIds = new Set(),
  assignedCase = null,
  goalContext = null
) {
  const matchingCases = getMatchingCasesForItem({
    type: "issue",
    name: issueName,
  });
  const isLocked = type === "related";
  const category = getIssueCategory(issueName);
  const categoryLabel = getCategoryDisplayLabel(category, goalContext);
  const isInGoals = isIssueInGoals(issueName);

  // Get prevalence information to soften language
  const userAge = userSelections.age;
  const prevalenceDesc = getPrevalenceDescription(issueName, userAge);

  // Create a direct, action-oriented title that connects to the user's concern
  const actionTitle = `How to Address ${issueName}`;

  // Use assigned case if provided, otherwise find first unused case
  let previewCase = assignedCase;
  if (!previewCase && matchingCases.length > 0) {
    // Try to find a case that hasn't been used yet
    previewCase = matchingCases.find((c) => !usedCaseIds.has(c.id));
    // If all cases are used, just use the first one
    if (!previewCase) {
      previewCase = matchingCases[0];
    } else {
      // Mark this case as used
      usedCaseIds.add(previewCase.id);
    }
  }

  if (isLocked) {
    return `
            <div class="concern-card locked-card" onclick="showLockedIssueMessage()">
                <div class="concern-card-image-wrapper">
                    ${
                      previewCase
                        ? `<img src="${previewCase.thumbnail}" alt="${actionTitle}" class="concern-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">`
                        : '<div class="concern-card-placeholder">No preview available</div>'
                    }
                    <div class="card-lock-overlay">${getIconSVG(
                      "lock",
                      16
                    )}</div>
                </div>
                <div class="concern-card-body">
                    <div class="concern-card-labels">
                        <span class="concern-category-label">${categoryLabel}</span>
                        ${(() => {
                          const discountTag = getIssueDiscountTag(issueName);
                          return discountTag
                            ? `<span class="concern-discount-tag" onclick="event.stopPropagation(); showDiscountDetails()">${discountTag}</span>`
                            : "";
                        })()}
                    </div>
                    <h3 class="concern-card-title">${actionTitle}</h3>
                    ${
                      prevalenceDesc
                        ? `<p class="concern-card-prevalence">${escapeHtmlPreserveStrong(
                            prevalenceDesc
                          )}</p>`
                        : ""
                    }
                </div>
            </div>
        `;
  }

  return `
        <div class="concern-card ${
          isInGoals ? "goal-added" : ""
        }" onclick="showIssueOverviewFromDetail('${issueName.replace(
    /'/g,
    "\\'"
  )}')">
            <div class="concern-card-image-wrapper">
                ${
                  previewCase
                    ? `<img src="${previewCase.thumbnail}" alt="${actionTitle}" class="concern-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">`
                    : '<div class="concern-card-placeholder">No preview available</div>'
                }
                ${
                  isInGoals
                    ? `<div class="card-goal-badge">${getIconSVG(
                        "star",
                        12
                      )}</div>`
                    : ""
                }
            </div>
            <div class="concern-card-body">
                <div class="concern-card-labels">
                    <span class="concern-category-label">${categoryLabel}</span>
                    ${(() => {
                      const discountTag = getIssueDiscountTag(issueName);
                      return discountTag
                        ? `<span class="concern-discount-tag" onclick="event.stopPropagation(); showDiscountDetails()">${discountTag}</span>`
                        : "";
                    })()}
                </div>
                <h3 class="concern-card-title">${actionTitle}</h3>
                ${
                  prevalenceDesc
                    ? `<p class="concern-card-prevalence">${escapeHtmlPreserveStrong(
                        prevalenceDesc
                      )}</p>`
                    : ""
                }
            </div>
            <div class="concern-card-footer">
                <span class="cases-count">${matchingCases.length} case${
    matchingCases.length !== 1 ? "s" : ""
  }</span>
                <span class="view-cases-cta">See Results ${getIconSVG(
                  "arrowRight",
                  16
                )}</span>
            </div>
        </div>
    `;
}

function showLockedIssueMessage() {
  // Scroll to the consultation pitch
  const pitch = document.querySelector(".consultation-pitch");
  if (pitch) {
    pitch.scrollIntoView({ behavior: "smooth", block: "center" });
    // Add a highlight animation
    pitch.classList.add("pitch-highlight");
    setTimeout(() => pitch.classList.remove("pitch-highlight"), 2000);
  }
}

function requestConsultation() {
  trackEvent("consultation_modal_opened", {
    goals: userSelections.overallGoals,
    issuesCount: userSelections.selectedIssues?.length || 0,
  });

  // Open the request more information modal, but with consultation-specific content
  const modal = document.getElementById("request-info-modal");
  if (modal) {
    modal.classList.add("active");
    const formContainer = modal.querySelector(".modal-container");
    const discount = getPersonalizedDiscount();
    const isRedeemed = discount ? isDiscountRedeemed(discount.id) : false;

    formContainer.innerHTML = `
            <div class="modal-header consultation-header">
                <div class="modal-header-content">
                    <div class="consultation-header-top">
                        <div class="consultation-header-title-section">
                            <div class="modal-icon-wrapper-compact">${getIconSVG(
                              "sparkle",
                              24
                            )}</div>
                            <div>
                                <h2 class="modal-title">Claim Your $50 Off Offer</h2>
                                <p class="modal-subtitle-compact">Enter your email to claim your exclusive offer</p>
                            </div>
                        </div>
                        <button class="modal-close" onclick="closeRequestModal()">×</button>
                    </div>
                </div>
            </div>
            <div class="consultation-benefits-compact-inline" style="background: #E8F5E9; border: 2px solid #4CAF50; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: bold; color: #2E7D32; display: block; margin-bottom: 4px;">$50 Off</span>
                <span style="font-size: 14px; color: #666;">Your offer will be sent to your email</span>
            </div>
            <form id="consultation-form" class="modal-form consultation-form">
                <div class="modal-form-group">
                    <label for="consultation-email">
                        <span class="label-icon">${getIconSVG(
                          "chat",
                          16
                        )}</span>
                        Email Address
                    </label>
                    <input type="email" id="consultation-email" class="modal-input" required placeholder="Enter your email address">
                </div>
                <div class="modal-form-actions">
                    <button type="submit" class="modal-submit-button consultation-submit">
                        ${getIconSVG("check", 18)}
                        <span>Claim $50 Off</span>
                    </button>
                    <button type="button" class="modal-cancel-button" onclick="closeRequestModal()">Cancel</button>
                </div>
            </form>
        `;

    // Handle form submission
    const form = document.getElementById("consultation-form");

    // Setup email formatting/validation
    const emailInput = document.getElementById("consultation-email");
    setupEmailInput(emailInput);

    // Pre-populate email from sessionStorage if available
    const storedEmail = sessionStorage.getItem("user_email");
    if (storedEmail && emailInput) {
      emailInput.value = storedEmail;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validate before submitting
      const email = document.getElementById("consultation-email").value;

      if (!isValidEmail(email)) {
        showInputError(emailInput, "Please enter a valid email address");
        emailInput.classList.add("input-error");
        emailInput.focus();
        return;
      }

      // Gather form data
      const leadData = {
        email: email,
        source: "Offer Claim",
        offerClaimed: true,
      };

      // Save to sessionStorage for future use
      sessionStorage.setItem("user_email", email);

      console.log("Offer claim submitted:", leadData);
      trackEvent("offer_claimed", {
        has_email: !!email,
        goals: userSelections.overallGoals,
        issuesCount: userSelections.selectedIssues?.length || 0,
      });

      // Show loading state
      const submitButton = form.querySelector(".consultation-submit");
      const originalButtonText = submitButton.innerHTML;
      submitButton.innerHTML = `${getIconSVG(
        "check",
        18
      )} <span>Claiming Offer...</span>`;
      submitButton.disabled = true;

      // Submit to Airtable
      const result = await submitLeadToAirtable(leadData);

      if (result.success) {
        console.log("✅ Offer claim saved to Airtable");
        // TODO: Send email with offer details (set up Airtable automation or email service)
        console.log("📧 Would send offer email to:", email);
      } else {
        console.warn(
          "⚠️ Offer claim submission to Airtable failed, but showing success to user"
        );
      }

      // Show success message regardless (we don't want to block user)
      formContainer.innerHTML = `
                <div class="modal-success consultation-success">
                    <div class="success-icon-wrapper">
                        <div class="success-icon">${getIconSVG(
                          "check",
                          48
                        )}</div>
                    </div>
                    <h2 class="modal-title">Offer Claimed!</h2>
                    <p class="success-message">Your $50 off offer has been claimed! Check your email for your offer details and redemption terms.</p>
                    <div class="success-details-box" style="text-align: left; background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <strong style="display: block; margin-bottom: 8px;">Redemption Terms:</strong>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                            <li>Offer valid for new patients only</li>
                            <li>Must be redeemed within 90 days of claim date</li>
                            <li>Cannot be combined with other offers or promotions</li>
                            <li>Valid for services over $200</li>
                            <li>One offer per person</li>
                            <li>Subject to provider availability</li>
                        </ul>
                    </div>
                    <button class="modal-submit-button consultation-close-btn" onclick="closeRequestModal()">Got it!</button>
                </div>
            `;
    });
  }
}

async function showIssueOverview(issueName) {
  trackEvent("issue_viewed", {
    issue: issueName,
    category: getIssueCategory(issueName),
  });

  // Hide all screens first
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Show the issue detail screen
  const issueDetailScreen = document.getElementById("issue-detail-screen");
  if (issueDetailScreen) {
    issueDetailScreen.classList.add("active");
  }

  // Track current issue
  currentIssueOverview = issueName;

  // Scroll to top
  scrollToTop();

  // Hide top-right buttons when leaving issue detail screen
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.remove("visible");
  }

  // Wait for prevalence data to load (non-blocking, with timeout)
  await waitForPrevalenceData(1000);

  // Hide the issues list, show issue overview
  const content = document.getElementById("issue-detail-content");
  content.innerHTML = "";

  // Use consistent "How to Address..." format matching the card titles
  const displayName = `How to Address ${issueName}`;
  const description = generateIssueGoalDescription({
    type: "issue",
    name: issueName,
  });
  // Get strictly matching cases for this specific issue
  const matchingCases = getStrictMatchingCasesForIssue(issueName);

  // Debug logging for body concerns
  if (
    issueName.toLowerCase() === "stubborn fat" ||
    issueName.toLowerCase() === "unwanted hair" ||
    issueName.toLowerCase() === "weight loss"
  ) {
    console.log(`\n🔍 Finding cases for "${issueName}":`);
    console.log(`  Total cases in database: ${caseData.length}`);
    console.log(`  Matching cases found: ${matchingCases.length}`);
    if (matchingCases.length > 0) {
      console.log(
        `  ✓ Matched cases:`,
        matchingCases.map((c) => c.name)
      );
      // Show which cases have "Matching" field
      const withMatching = matchingCases.filter(
        (c) => c.directMatchingIssues && c.directMatchingIssues.length > 0
      );
      if (withMatching.length > 0) {
        console.log(
          `  📌 ${withMatching.length} case(s) using "Matching" column:`,
          withMatching.map(
            (c) => `${c.name} [${c.directMatchingIssues.join(", ")}]`
          )
        );
      }
    } else {
      // Log potential matches for debugging
      const potentialMatches = caseData.filter((c) => {
        const nameLower = c.name.toLowerCase();
        if (issueName.toLowerCase() === "stubborn fat") {
          return (
            nameLower.includes("physiq") ||
            nameLower.includes("everesse") ||
            nameLower.includes("body contour") ||
            nameLower.includes("fat")
          );
        } else if (issueName.toLowerCase() === "unwanted hair") {
          return (
            nameLower.includes("hair") &&
            (nameLower.includes("removal") ||
              nameLower.includes("laser") ||
              nameLower.includes("motus"))
          );
        }
        return false;
      });
      console.log(
        `  Potential matches (not matched by strict logic):`,
        potentialMatches.map((c) => c.name)
      );
    }
  }

  // Check if this issue is in goals
  const issueInGoals = isIssueInGoals(issueName);

  // Get which goals this issue relates to
  const relatedGoalSlugs = [];
  userSelections.overallGoals.forEach((goal) => {
    const goalIssues = goalToIssuesMap[goal] || [];
    if (goalIssues.includes(issueName)) {
      relatedGoalSlugs.push(goal);
    }
  });

  const relevanceText = generateGoalRelevanceExplanation(
    issueName,
    relatedGoalSlugs
  );

  // Get prevalence information to soften language
  const userAge = userSelections.age;
  console.log(
    `📊 Getting prevalence for "${issueName}" (user age: ${userAge})`
  );
  console.log(
    `   Data available:`,
    !!issuePrevalenceData,
    issuePrevalenceData
      ? Object.keys(issuePrevalenceData.overall || {}).length + " issues"
      : "none"
  );

  const overallPrevalence = getIssuePrevalence(issueName);
  console.log(`   Found prevalence:`, overallPrevalence);

  let prevalenceDesc = null;
  let agingContext = null;

  if (overallPrevalence) {
    prevalenceDesc = getPrevalenceDescription(issueName, userAge);
    agingContext = getAgingContext(issueName);
    console.log(`   ✓ Generated description:`, prevalenceDesc);
  } else {
    console.log(`   ✗ No exact match, trying fuzzy match...`);

    // Try to find it with different variations
    if (issuePrevalenceData && issuePrevalenceData.overall) {
      const allKeys = Object.keys(issuePrevalenceData.overall);
      const matches = allKeys.filter(
        (key) =>
          key.toLowerCase().replace(/[^a-z0-9]/g, "") ===
          issueName.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      console.log(`   Fuzzy matches found:`, matches);

      if (matches.length > 0) {
        // Try with the matched name
        const matchedPrevalence = issuePrevalenceData.overall[matches[0]];
        if (matchedPrevalence) {
          const ageSpecific = userAge
            ? getIssuePrevalenceForAge(matches[0], userAge)
            : null;
          const percentage = ageSpecific
            ? ageSpecific.percentage
            : matchedPrevalence.percentage;
          const roundedPercentage = Math.round(percentage);
          const ageCorrelation = matchedPrevalence.ageCorrelation;
          const isAgeRelated = ageCorrelation && Math.abs(ageCorrelation) > 0.5;
          const increasesWithAge = ageCorrelation && ageCorrelation > 0.5;

          prevalenceDesc =
            ageSpecific && userAge
              ? `Affects <strong>${roundedPercentage}%</strong> of people in your age group${
                  isAgeRelated && increasesWithAge
                    ? " — this is a natural part of the aging process"
                    : ""
                }`
              : `Affects <strong>${roundedPercentage}%</strong> of people${
                  isAgeRelated && increasesWithAge
                    ? " — becomes more common with age as a natural part of aging"
                    : ""
                }`;
          agingContext = getAgingContext(matches[0]);
          console.log(`   ✓ Generated from fuzzy match:`, prevalenceDesc);
        }
      }
    }
  }

  console.log(`   Final prevalenceDesc:`, prevalenceDesc ? "YES" : "NO");
  console.log(`   Final agingContext:`, agingContext ? "YES" : "NO");

  // Determine back button action based on where we came from
  let backButtonAction = "showIssueDetailScreen()";
  let backButtonText = "← Back to Concerns";
  if (issueOverviewReturnScreen === "summary") {
    backButtonAction = "showMyCases()";
    backButtonText = "← Back to Summary";
  }

  // Create compact prevalence text inline
  const prevalenceInline = prevalenceDesc
    ? `<span class="prevalence-inline">${escapeHtmlPreserveStrong(
        prevalenceDesc
      )}</span>`
    : "";

  // Get a brief description for context
  const briefDescription = generateBriefIssueDescription(issueName);

  content.innerHTML = `
        <button class="back-button" onclick="${backButtonAction}">${backButtonText}</button>
        <div class="issue-overview" style="margin-top: 0;">
            <div class="issue-overview-header-compact">
                <div class="issue-header-row">
                    <h1 class="issue-overview-title">${displayName}</h1>
                    <button class="goal-button-compact ${
                      issueInGoals ? "in-goals" : ""
                    }" onclick="event.stopPropagation(); toggleIssueGoal('${issueName.replace(
    /'/g,
    "\\'"
  )}')">
                        ${
                          issueInGoals
                            ? getIconSVG("star", 14)
                            : getIconSVG("starEmpty", 14)
                        }
                    </button>
                </div>
                <p class="issue-brief-description">${briefDescription}</p>
                ${
                  prevalenceInline
                    ? `<p class="issue-subtitle">${prevalenceInline}</p>`
                    : ""
                }
                ${
                  relevanceText
                    ? `<div class="issue-goal-relation">
                        <span class="goal-relation-icon">${getIconSVG(
                          "star",
                          14
                        )}</span>
                        <span class="goal-relation-text">${relevanceText}</span>
                      </div>`
                    : ""
                }
            </div>
            <div class="issue-overview-cases" style="margin-top: 20px;">
                <div class="cases-header">
                    <h2 class="issue-overview-cases-title">${
                      matchingCases.length
                    } Before & After Case${
    matchingCases.length !== 1 ? "s" : ""
  }</h2>
                </div>
                ${
                  matchingCases.length === 0
                    ? '<p class="no-cases-message">No cases available for this concern yet. Book a consultation to discuss treatment options.</p>'
                    : `
                    <div class="cases-list">
                        ${matchingCases
                          .map((caseItem, index) =>
                            createCaseListItem(caseItem, index)
                          )
                          .join("")}
                    </div>
                `
                }
            </div>
        </div>
    `;
}

// Generate a case number for display
function getCaseNumber(caseItem, index) {
  // Use a simple number based on index, or generate from case ID
  return `Case ${String(index + 1).padStart(3, "0")}`;
}

function createCaseListItem(caseItem, index) {
  // Generate case number instead of treatment name
  const caseNumber = getCaseNumber(caseItem, index);

  return `
        <div class="case-list-item" onclick="showCaseDetailFromOverview('${
          caseItem.id
        }')">
            <img src="${caseItem.thumbnail}" alt="${
    caseItem.name
  }" class="case-list-item-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'%3E%3Crect width=\\'100\\' height=\\'100\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
            <div class="case-list-item-content">
                <h3 class="case-list-item-title">${caseNumber}</h3>
                ${
                  caseItem.headline
                    ? `<p class="case-list-item-headline">${escapeHtml(
                        caseItem.headline
                      )}</p>`
                    : ""
                }
            </div>
            <div class="case-list-item-arrow">${getIconSVG(
              "arrowRight",
              16
            )}</div>
        </div>
    `;
}

// Strict matching function that only returns cases that actually match the specific issue
function getStrictMatchingCasesForIssue(issueName) {
  const issueNameLower = issueName.toLowerCase().trim();

  // FIRST: Check if any cases have this issue in their "Matching" field (direct match)
  // This is the most reliable way to match cases to issues
  const directMatches = caseData.filter((caseItem) => {
    if (
      caseItem.directMatchingIssues &&
      caseItem.directMatchingIssues.length > 0
    ) {
      return caseItem.directMatchingIssues.some((matchedIssue) => {
        // Normalize both strings for comparison (trim, lowercase, handle variations)
        const normalizedMatched = matchedIssue.toLowerCase().trim();
        const normalizedIssue = issueNameLower;

        // Exact match
        if (normalizedMatched === normalizedIssue) {
          return true;
        }

        // Also check if the matched issue contains the issue name or vice versa
        // This handles cases like "Under Eye Dark Circles" matching "Under Eye Dark Circles"
        return (
          normalizedMatched.includes(normalizedIssue) ||
          normalizedIssue.includes(normalizedMatched)
        );
      });
    }
    return false;
  });

  // Debug: For "Stubborn Fat", show all cases with "Matching" field that might be relevant
  if (issueNameLower === "stubborn fat") {
    const casesWithMatching = caseData.filter(
      (c) => c.directMatchingIssues && c.directMatchingIssues.length > 0
    );
    const relevantCases = casesWithMatching.filter((c) => {
      const matchingLower = c.directMatchingIssues.join(", ").toLowerCase();
      return (
        matchingLower.includes("fat") ||
        matchingLower.includes("stubborn") ||
        matchingLower.includes("body") ||
        matchingLower.includes("contour")
      );
    });
    console.log(`\n🔍 Debug for "Stubborn Fat":`);
    console.log(
      `  Total cases with "Matching" field: ${casesWithMatching.length}`
    );
    console.log(
      `  Cases with fat/stubborn/body/contour in Matching: ${relevantCases.length}`
    );
    if (relevantCases.length > 0) {
      console.log(`  Relevant cases and their Matching values:`);
      relevantCases.forEach((c) => {
        console.log(
          `    - "${c.name}": [${c.directMatchingIssues.join(", ")}]`
        );
      });
    }
  }

  // Debug logging for direct matches
  if (directMatches.length > 0) {
    console.log(
      `✓ Found ${directMatches.length} direct match(es) from "Matching" column for "${issueName}"`
    );
    if (directMatches.length <= 5) {
      console.log(
        `  Matched cases:`,
        directMatches.map((c) => c.name)
      );
    }
  }

  // If we found direct matches, return them (no need for fuzzy matching)
  if (directMatches.length > 0) {
    return directMatches.sort(
      (a, b) =>
        calculateMatchingScore(b, userSelections) -
        calculateMatchingScore(a, userSelections)
    );
  }

  // Log when falling back to fuzzy matching
  console.log(
    `⚠ No direct matches found in "Matching" column for "${issueName}", using fuzzy matching...`
  );

  // FALLBACK: Use the old fuzzy matching logic if no direct matches found
  // Get mapped variations for this specific issue
  const mappedVariations = issueNameMappings[issueNameLower] || [];

  // Create specific search terms for this EXACT issue only
  const searchTerms = [
    issueNameLower,
    issueNameLower.replace(/\s+/g, "-"),
    issueNameLower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    ...mappedVariations.map((v) => v.toLowerCase()),
    ...mappedVariations.map((v) => v.toLowerCase().replace(/\s+/g, "-")),
  ];

  // Remove duplicates and filter out very short terms
  const uniqueSearchTerms = [...new Set(searchTerms)].filter(
    (term) => term.length > 4
  );

  // Define issue-specific keywords that MUST appear for a match
  const issueKeywords = {
    "under eye dark circles": ["dark", "circles", "under", "eye"],
    "excess upper eyelid skin": ["excess", "upper", "eyelid", "skin"],
    "lower eyelid - excess skin": ["excess", "lower", "eyelid", "skin"],
    "ill-defined jawline": ["jawline", "jaw", "definition", "defined"],
    "retruded chin": ["chin", "retruded", "advance"],
    "forehead wrinkles": ["forehead", "wrinkles", "lines"],
    "crow's feet wrinkles": ["crow's", "feet", "wrinkles"],
    "glabella wrinkles": ["glabella", "wrinkles", "frown"],
    "under eye wrinkles": ["under", "eye", "wrinkles"],
    "under eye hollow": ["under", "eye", "hollow", "volume"],
    "upper eye hollow": ["upper", "eye", "hollow", "volume"],
    "lower eyelid bags": ["lower", "eyelid", "bags"],
    "nasolabial folds": ["nasolabial", "folds", "lines"],
    "marionette lines": ["marionette", "lines"],
    jowls: ["jowls", "jawline"],
    "neck lines": ["neck", "lines", "wrinkles"],
    "dark spots": ["dark", "spots", "pigmentation"],
    "thin lips": ["lips", "thin", "volume"],
    "crooked nose": ["nose", "crooked", "straighten"],
    "droopy tip": ["nose", "tip", "droopy", "lift"],
  };

  // Get required keywords for this issue
  const requiredKeywords = issueKeywords[issueNameLower] || [];

  return caseData
    .filter((caseItem) => {
      const caseNameLower = caseItem.name.toLowerCase();
      const solvedIssues = caseItem.solved.map((s) => s.toLowerCase());
      const matchingCriteria = caseItem.matchingCriteria.map((c) =>
        c.toLowerCase()
      );

      // Combine all text to search
      const allText = [
        caseNameLower,
        ...solvedIssues,
        ...matchingCriteria,
      ].join(" ");

      // FIRST: Check if any of the exact search terms appear
      const hasExactMatch = uniqueSearchTerms.some((term) => {
        return (
          caseNameLower.includes(term) ||
          solvedIssues.some((s) => s.includes(term)) ||
          matchingCriteria.some((c) => c.includes(term))
        );
      });

      if (!hasExactMatch) {
        // If no exact match, check if required keywords all appear
        if (requiredKeywords.length > 0) {
          const hasAllKeywords = requiredKeywords.every((keyword) =>
            allText.includes(keyword)
          );
          if (!hasAllKeywords) {
            return false;
          }
        } else {
          // No exact match and no required keywords defined - skip this case
          return false;
        }
      }

      // SECOND: Exclude cases that mention OTHER specific issues
      // Define exclusion patterns for each issue
      const exclusionPatterns = {
        "under eye dark circles": [
          "jawline",
          "jaw",
          "chin",
          "excess skin",
          "eyelid",
          "upper eyelid",
          "lower eyelid",
          "hollow",
          "bags",
          "wrinkles",
          "droop",
          "sag",
          "forehead",
          "nose",
          "lips",
          "cheeks",
          "neck",
        ],
        "excess upper eyelid skin": [
          "dark circles",
          "under eye",
          "lower eyelid",
          "hollow",
          "bags",
          "jawline",
          "chin",
          "forehead",
          "nose",
          "lips",
        ],
        "lower eyelid - excess skin": [
          "dark circles",
          "upper eyelid",
          "hollow",
          "bags",
          "jawline",
          "chin",
          "forehead",
          "nose",
          "lips",
        ],
        "ill-defined jawline": [
          "eye",
          "eyelid",
          "dark circles",
          "forehead",
          "nose",
          "lips",
          "cheeks",
          "neck",
          "chin", // unless it's about chin affecting jawline
        ],
        "retruded chin": [
          "eye",
          "eyelid",
          "dark circles",
          "forehead",
          "nose",
          "lips",
          "cheeks",
          "neck",
          "jawline", // unless it's about jawline affecting chin
        ],
      };

      const exclusions = exclusionPatterns[issueNameLower] || [];
      if (exclusions.length > 0) {
        // Check if case mentions excluded terms WITHOUT also mentioning the issue
        const hasExcludedTerms = exclusions.some((excluded) => {
          const hasExcluded = allText.includes(excluded);
          if (!hasExcluded) return false;

          // If it has excluded terms, check if it ALSO has the issue terms
          const hasIssueTerms = uniqueSearchTerms.some((term) =>
            allText.includes(term)
          );
          return !hasIssueTerms; // Exclude if it has excluded terms but not issue terms
        });

        if (hasExcludedTerms) {
          return false;
        }
      }

      // THIRD: For "Under Eye Dark Circles" specifically, be very strict
      if (
        issueNameLower.includes("dark circles") ||
        issueNameLower === "under eye dark circles"
      ) {
        // Must have "dark" AND ("circles" OR "under eye")
        const hasDark = allText.includes("dark");
        const hasCircles =
          allText.includes("circles") || allText.includes("under eye");

        if (!hasDark || !hasCircles) {
          return false;
        }

        // Must NOT have other eye issues unless they're secondary
        const hasOtherEyeIssues =
          allText.includes("excess skin") ||
          allText.includes("eyelid") ||
          allText.includes("hollow") ||
          allText.includes("bags") ||
          allText.includes("droop") ||
          allText.includes("sag");

        if (hasOtherEyeIssues && !hasDark) {
          return false;
        }
      }

      // FOURTH: For jawline issues, be very strict
      if (
        issueNameLower.includes("jawline") ||
        issueNameLower.includes("jaw")
      ) {
        // Must have "jaw" or "jawline"
        if (!allText.includes("jaw") && !allText.includes("jawline")) {
          return false;
        }

        // Must NOT have eye, forehead, nose, lips issues
        const hasOtherIssues =
          allText.includes("eye") ||
          allText.includes("eyelid") ||
          allText.includes("forehead") ||
          allText.includes("nose") ||
          allText.includes("lips");

        if (hasOtherIssues && !allText.includes("jaw")) {
          return false;
        }
      }

      // FIFTH: Special handling for body concerns
      if (
        issueNameLower === "unwanted hair" ||
        issueNameLower === "stubborn fat"
      ) {
        // For body concerns, be more lenient - check if key terms appear in case name
        if (issueNameLower === "unwanted hair") {
          const hasHairTerm =
            caseNameLower.includes("hair") &&
            (caseNameLower.includes("removal") ||
              caseNameLower.includes("laser") ||
              caseNameLower.includes("motus"));
          if (hasHairTerm) return true;
        }
        if (issueNameLower === "stubborn fat") {
          const hasFatTerm =
            (caseNameLower.includes("body") &&
              caseNameLower.includes("contour")) ||
            caseNameLower.includes("fat") ||
            caseNameLower.includes("physiq") ||
            caseNameLower.includes("everesse");
          if (hasFatTerm) {
            console.log(`Matched case "${caseItem.name}" for "Stubborn Fat"`);
            return true;
          }
        }
        // If we get here and it's a body concern but didn't match, return false
        return false;
      }

      return true;
    })
    .map((caseItem) => ({
      ...caseItem,
      matchingScore: calculateMatchingScore(caseItem, userSelections),
    }))
    .sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
}

// Removed selectCaseFromOverview - now using direct list items

// Track where we came from to handle back button correctly
let caseDetailReturnScreen = null;
let currentIssueOverview = null; // Track which issue overview we're viewing
let issueOverviewReturnScreen = null; // Track where we came from (null, "summary", or "issue-detail")

function showCaseDetailFromOverview(caseId) {
  const caseItem = caseData.find((c) => c.id === caseId);
  if (caseItem) {
    caseDetailReturnScreen = "issue-overview";
    showCaseDetail(caseItem);
  }
}

function createIssueGoalCard(item, index) {
  const card = document.createElement("div");
  card.className = "issue-goal-card";

  const title = item.type === "issue" ? item.name : formatGoalName(item.name);
  const description = generateIssueGoalDescription(item);
  const relevance = generateRelevanceText(item);

  // Find matching cases for this item
  const matchingCases = getMatchingCasesForItem(item);

  card.innerHTML = `
        <div class="issue-goal-header">
            <h2 class="issue-goal-title">${title}</h2>
            ${
              item.type === "issue"
                ? `<div class="issue-goal-type">Concern</div>`
                : `<div class="issue-goal-type goal-type">Goal</div>`
            }
        </div>
        <div class="issue-goal-description">
            <p>${description}</p>
        </div>
        <div class="issue-goal-cases">
            <h3 class="cases-header">Related Cases (${
              matchingCases.length
            })</h3>
            <div class="cases-scroll-container">
                ${matchingCases
                  .map((caseItem) => createCasePreviewCard(caseItem))
                  .join("")}
            </div>
        </div>
    `;

  return card;
}

function createCasePreviewCard(caseItem) {
  const isRead = isCaseRead(caseItem.id);
  const inGoals = isCaseInGoals(caseItem.id);
  const modality = getTreatmentModality(caseItem.name);

  return `
        <div class="case-preview-card" onclick="showCaseDetailFromPreview('${
          caseItem.id
        }')">
            <img src="${caseItem.thumbnail}" alt="${
    caseItem.name
  }" class="case-preview-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'150\\' height=\\'150\\'%3E%3Crect width=\\'150\\' height=\\'150\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
            <div class="case-preview-info">
                <div class="case-preview-name">${caseItem.name}</div>
                <div class="case-preview-modality">
                    <span class="modality-icon">${modality.icon}</span>
                    <span>${modality.name}</span>
                </div>
                <div class="case-preview-indicators">
                    ${
                      isRead
                        ? '<span class="case-indicator read-indicator" title="Read">✓</span>'
                        : ""
                    }
                    ${
                      inGoals
                        ? '<span class="case-indicator goal-indicator" title="Added to goals">★</span>'
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

// Map form issue names to common Airtable variations
const issueNameMappings = {
  "excess upper eyelid skin": [
    "excess skin - upper eyelid",
    "excess skin upper eyelid",
    "upper eyelid excess skin",
    "excess upper eyelid",
    "eyelid excess skin",
    "excess-skin-upper-eyelid",
    "upper-eyelid-excess-skin",
  ],
  "lower eyelid - excess skin": [
    "excess skin - lower eyelid",
    "excess skin lower eyelid",
    "lower eyelid excess skin",
    "excess lower eyelid",
    "excess-skin-lower-eyelid",
  ],
  "under eye dark circles": [
    "dark circles under eye",
    "under eye circles",
    "dark circles",
  ],
  "under eye wrinkles": ["under eye lines", "under eye fine lines"],
  "crow's feet wrinkles": ["crow's feet", "crows feet", "crow feet"],
  "forehead wrinkles": ["forehead lines", "forehead fine lines"],
  "glabella wrinkles": ["glabella lines", "frown lines", "11 lines"],
  "nasolabial folds": ["nasolabial lines", "smile lines"],
  "marionette lines": ["marionette folds", "mouth lines"],
  "ill-defined jawline": [
    "jawline definition",
    "jaw definition",
    "undefined jawline",
  ],
  "masseter hypertrophy": [
    "masseter enlargement",
    "jaw muscle enlargement",
    "square jaw",
  ],
  "mid cheek flattening": [
    "mid cheek",
    "mid-cheek",
    "midcheek",
    "cheek flattening",
    "cheek volume",
    "mid cheek volume",
    "mid-cheek volume",
    "cheek hollow",
    "mid cheek hollow",
    "cheek depletion",
    "mid cheek depletion",
  ],
  "lower cheeks - volume depletion": [
    "lower cheek",
    "lower-cheek",
    "lower cheek volume",
    "lower-cheek volume",
    "lower cheek depletion",
  ],
  "weight loss": [
    "weight management",
    "weight reduction",
    "body weight",
    "lose weight",
    "weight loss program",
    "weight-loss",
    "weight-management",
  ],
  "unwanted hair": [
    "hair removal",
    "laser hair removal",
    "unwanted body hair",
    "facial hair",
    "body hair",
    "hair reduction",
    "permanent hair removal",
    "laser-hair-removal",
    "unwanted-hair",
  ],
  "stubborn fat": [
    "body contouring",
    "fat reduction",
    "stubborn body fat",
    "non-surgical fat removal",
    "body sculpting",
    "fat cells",
    "trouble spots",
    "stubborn-fat",
    "body-contouring",
    "fat-reduction",
  ],
};

// Mapping from CSV category names to category IDs
const CATEGORY_NAME_TO_ID = {
  "Facial Balancing": "facial-balancing",
  "Smooth Wrinkles & Lines": "smooth-wrinkles-lines",
  "Restore Volume & Definition": "restore-volume-definition",
  "Improve Skin Texture & Tone": "improve-skin-texture-tone",
  "Reduce Dark Spots & Discoloration": "reduce-dark-spots-discoloration",
  "Clear Acne & Minimize Pores": "clear-acne-minimize-pores",
  "Eyelid & Eye Area Concerns": "eyelid-eye-area-concerns",
  "Body Contouring & Fat Reduction": "body-contouring-fat-reduction",
  "Unwanted Hair Removal": "unwanted-hair-removal",
  "Wellness & Longevity": "wellness-longevity",
};

// Case-to-category mapping from CSV (populated from case-category-analysis.csv)
// Format: caseId -> [categoryId1, categoryId2, ...]
const CASE_CATEGORY_MAPPING = {
  // This will be populated from the CSV data
  // Example entries based on CSV:
  rec08elFBXXtIfXZi: ["restore-volume-definition"],
  rec0TpqaffljCfzOt: ["facial-balancing"],
  rec0lge1CHglEWB82: ["eyelid-eye-area-concerns"],
  rec0vtYW6DbL0Nz25: ["restore-volume-definition"],
  rec1atkwdW9rEqA33: ["smooth-wrinkles-lines", "eyelid-eye-area-concerns"],
  rec2734jRXc52jRHd: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  rec2CqT3cRL4p13J2: ["improve-skin-texture-tone"],
  rec2GQ9BFULvmPHKl: ["eyelid-eye-area-concerns"],
  rec2ZBN2Uealy89aw: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  rec2ifF0nw6oQMU9G: ["improve-skin-texture-tone"],
  rec2vsw2A0s4velkc: ["improve-skin-texture-tone"],
  rec3nlXo8g3pnssf2: ["facial-balancing"],
  rec46iZ4beP8MW7jJ: ["restore-volume-definition"],
  rec4ErbyocyeYfmHy: ["facial-balancing", "restore-volume-definition"],
  rec4fpYFlvr49A9DQ: ["improve-skin-texture-tone"],
  rec4l7yDxjWjTkisH: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  rec4yP12V0I7GkNk0: ["restore-volume-definition"],
  rec5F1HsxdGipHKE3: ["improve-skin-texture-tone"],
  rec5hc3kQeX9L0870: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  rec5s1iIct9IMSBAA: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  rec6GP10sGtIeXI3L: ["restore-volume-definition"],
  rec6mpM562H6S3z1k: ["facial-balancing"],
  rec7B93y3h7k00gCg: [
    "reduce-dark-spots-discoloration",
    "unwanted-hair-removal",
  ],
  rec7DQBFkPkqPx7QU: ["smooth-wrinkles-lines", "eyelid-eye-area-concerns"],
  rec7Ps49y18PkHR2B: ["restore-volume-definition"],
  rec7XvQ4PypuwELEE: ["restore-volume-definition"],
  rec8HOCYK6kGOw9Rg: ["improve-skin-texture-tone"],
  rec8Pp2wACf60MRDG: ["eyelid-eye-area-concerns"],
  rec8Xy1Z2ni0PX1Pm: ["restore-volume-definition", "improve-skin-texture-tone"],
  rec8oAUgDoE5dOW2z: ["restore-volume-definition"],
  rec90gBqPjUjBzuNE: ["facial-balancing"],
  rec9uePVK7wQZBjey: ["improve-skin-texture-tone"],
  recARtfgj2ySzuC5S: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recAexYUr4jXiGmTC: ["facial-balancing", "restore-volume-definition"],
  recAjJLwfkIaiTNp2: ["facial-balancing", "restore-volume-definition"],
  recBQUDh0L61EBq02: ["restore-volume-definition"],
  recBsG9wJH2qKf451: ["improve-skin-texture-tone"],
  recCkYKBe6zzlKqa5: ["facial-balancing"],
  recDAOWBhchSdBuNe: ["eyelid-eye-area-concerns"],
  recDI1rQMOmgftRzP: ["improve-skin-texture-tone"],
  recDazoE3e3MXDtVg: ["facial-balancing"],
  recDy7C8dUf4kBz5d: ["restore-volume-definition"],
  recEEd9bNK0HFEx7q: [
    "improve-skin-texture-tone",
    "reduce-dark-spots-discoloration",
  ],
  recEsdzQYjCmEy2KZ: ["restore-volume-definition"],
  recEwPIQH7y50WaHW: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recEySwzh8YSQfSJh: ["improve-skin-texture-tone"],
  recFBxQziSNGXfSJe: ["eyelid-eye-area-concerns"],
  recFYm60eVxovSsxJ: ["improve-skin-texture-tone"],
  recFwufUHnC60oZ7t: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recFyiZqHM0D3SdUH: ["improve-skin-texture-tone"],
  recFzqrRez2uhMK7p: ["restore-volume-definition"],
  recG8ZoEk1MDp6CaG: ["improve-skin-texture-tone"],
  recGAKWoTCtk9nifB: ["restore-volume-definition"],
  recGKmLqj2i74jqXO: ["restore-volume-definition"],
  recGLGC0RNiVMZwje: ["improve-skin-texture-tone"],
  recGS91fpf9suCUhI: ["improve-skin-texture-tone"],
  recH85gKwK0jkwW56: ["facial-balancing"],
  recHE5gtVtGQe5FP0: ["smooth-wrinkles-lines", "restore-volume-definition"],
  recHUxAPzgduPhz52: ["eyelid-eye-area-concerns"],
  recHgyAffHULS8Pzf: ["eyelid-eye-area-concerns"],
  recHkYXJuU13Zd8PK: ["improve-skin-texture-tone"],
  recI6fnyfUcPBULuv: ["facial-balancing"],
  recITWpEtALmDztqr: ["smooth-wrinkles-lines"],
  recIfsf45CHSrZjjr: ["facial-balancing"],
  recJYK1Mr6LXxrlt1: ["facial-balancing"],
  recJpAlijbaiCnabw: ["smooth-wrinkles-lines", "eyelid-eye-area-concerns"],
  recJqv5n5I5Sc3vep: ["improve-skin-texture-tone"],
  recL4OUGPvZj8ztOc: ["reduce-dark-spots-discoloration"],
  recLM7Hv6ip1g5JkC: ["improve-skin-texture-tone"],
  recLVToCtcqE8PtqE: ["restore-volume-definition", "improve-skin-texture-tone"],
  recLd6TIaKDSjyfnF: ["facial-balancing"],
  recLiEXtGdqbwGClp: ["restore-volume-definition"],
  recN1Hbs50QgZgxQK: ["restore-volume-definition"],
  recN7epp9z7dCvNo7: ["improve-skin-texture-tone"],
  recNoy8fYNHPrMJnO: ["improve-skin-texture-tone"],
  recNxtvVkfM6wIbn5: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recObiye7WXlfV5AB: ["improve-skin-texture-tone"],
  recOpojB5zUyWRFYq: ["facial-balancing"],
  recOyBrkyZwwJ1S0w: ["eyelid-eye-area-concerns"],
  recOzMAfbQLdyj0pk: ["facial-balancing"],
  recPL3MPe8g400jV6: ["restore-volume-definition"],
  recPLgIfyPHMoOBFs: ["restore-volume-definition"],
  recPNLhyWgsNfUeQU: ["improve-skin-texture-tone"],
  recPeVAFCYuHEcrs1: ["eyelid-eye-area-concerns"],
  recPeXtFJinA94env: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recQAAfXQpTQLuJdL: ["improve-skin-texture-tone"],
  recQOYS1r8g2QsELA: ["restore-volume-definition"],
  recQaJw1OpbhMrgfU: ["improve-skin-texture-tone"],
  recRVKr2A5BUZM2jt: ["restore-volume-definition"],
  recRWhIKJdSGH5iNi: ["facial-balancing"],
  recSEntcPxuGiYAm6: ["facial-balancing"],
  recSNi15VWPB3PDwU: ["facial-balancing"],
  recSvpoCu6sSjzv3F: ["smooth-wrinkles-lines", "eyelid-eye-area-concerns"],
  recTzzrGAOpXr21EV: ["restore-volume-definition"],
  recUOVZa6W2KZ0gm4: ["restore-volume-definition"],
  recURzdg3sM9tJZbi: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recUXUBEPg7z0Ta6B: ["improve-skin-texture-tone"],
  recUZXcmjuHGb7hDZ: ["eyelid-eye-area-concerns"],
  recUqgRGXd1F9rYFR: ["restore-volume-definition"],
  recUrFMXVLkxiTIK6: ["facial-balancing"],
  recV37RRK7kSKjVug: ["facial-balancing", "improve-skin-texture-tone"],
  recVAEz7Cvx50m0no: ["facial-balancing", "restore-volume-definition"],
  recVlEc05yi7BzPCA: ["improve-skin-texture-tone"],
  recVr90ML5qDGpqr1: ["facial-balancing"],
  recVyBWsS4pPmbjqa: ["facial-balancing"],
  recW30FSgmeCmNTHh: ["facial-balancing", "smooth-wrinkles-lines"],
  recW9Wu74qZWF56wi: ["smooth-wrinkles-lines"],
  recWBFCWAZmstER0s: ["improve-skin-texture-tone"],
  recWqhtAhG8UK6qlt: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recWwH2qqcMeoumQi: ["restore-volume-definition"],
  recX5Ugv9bYGafcLz: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recX6nIQTSQzpbRf2: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recX8fpi4sKiMbVjE: ["facial-balancing", "improve-skin-texture-tone"],
  recXUq7HQP9OJIawU: ["improve-skin-texture-tone", "clear-acne-minimize-pores"],
  recXWbmo42zOd9Mch: ["facial-balancing"],
  recXliMUxm8xUqUTS: ["restore-volume-definition"],
  recY4UBtk4mI7OtuG: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recYHGC8Zuf3RQOjq: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recYNu8T6nwDRGl7P: ["restore-volume-definition"],
  recYfha7wV8CDu2QI: ["restore-volume-definition"],
  recYjY7WKsBNNEzJ4: ["improve-skin-texture-tone"],
  recZYsKwCgdoClypF: ["restore-volume-definition"],
  reca2WnfVwkffvwQ8: ["restore-volume-definition"],
  recb6AfUJDmUicgMf: ["facial-balancing"],
  recb6VX1xzMkEWNDb: ["restore-volume-definition"],
  recbDNhFYwuvbmwkF: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recbLeA234skLNQcV: ["restore-volume-definition"],
  recbWwMQqc7nTF8ED: ["facial-balancing"],
  recbbZa92ig9DBLRJ: ["restore-volume-definition"],
  recclSfDQJRzA5ztq: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recddW1VaQw9NOLXG: [
    "restore-volume-definition",
    "improve-skin-texture-tone",
    "eyelid-eye-area-concerns",
  ],
  recdnVbtjlNcf5gbs: ["smooth-wrinkles-lines"],
  recdqGEUH108CeYlz: ["facial-balancing"],
  receXGWIUcKPr7idv: ["improve-skin-texture-tone"],
  receceTP4EZjHhrYp: ["body-contouring-fat-reduction"],
  recf8Ho2s14QhuUSa: ["improve-skin-texture-tone"],
  recfAou41aYczf0FP: ["facial-balancing"],
  recfCBcAN1ciyBTbU: ["facial-balancing"],
  recfPeRPnp50IDW1Z: ["smooth-wrinkles-lines"],
  recfb0tbad1JsrGLH: ["facial-balancing"],
  recfbUndrNj2Oe6gD: ["facial-balancing", "smooth-wrinkles-lines"],
  recgCbAoLI777gpwb: ["restore-volume-definition"],
  recgdd5uyqS5vgW0x: ["improve-skin-texture-tone"],
  recgyEK5LD6suWzbh: ["improve-skin-texture-tone"],
  rechhaGf1RMFChTnq: ["improve-skin-texture-tone"],
  rechlMc5hzxYBrPE3: ["facial-balancing"],
  rechqJh7tFVTGxorY: ["restore-volume-definition"],
  reciE0fcDkrPx8PCz: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  reciIqHry3RtoflYv: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  reciN6ujbd4RbiecQ: ["restore-volume-definition"],
  reciZ29TeybjNbDAq: ["smooth-wrinkles-lines"],
  reciuSusMZxBcPQIF: ["facial-balancing"],
  recj1KjwPmirgcSXt: ["facial-balancing"],
  recjiUWKVycta7zkh: ["restore-volume-definition"],
  reck64zaDMfgO5DNT: ["facial-balancing"],
  reckQn2J5UPi2X5Fg: ["improve-skin-texture-tone"],
  recl6i681c0Ppck5T: ["eyelid-eye-area-concerns"],
  reclJntsa0gSM2o8S: ["restore-volume-definition"],
  reclaWwuMgkAPwOe4: ["restore-volume-definition"],
  recm4aK5sIImkvDIc: ["facial-balancing", "smooth-wrinkles-lines"],
  recmn9C12s00Fnjjp: ["facial-balancing"],
  recnGnZfFVtNSi4vH: ["reduce-dark-spots-discoloration"],
  recnJCFafLDdTWHqX: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recnoyDWJsacV0CXO: ["smooth-wrinkles-lines"],
  recnp712Kc8Hx95SP: ["smooth-wrinkles-lines"],
  reco0fP0fWlHHuoUE: ["restore-volume-definition"],
  recoCTikbsHYm5zyE: ["facial-balancing"],
  recoH8bByi19k5orU: ["improve-skin-texture-tone"],
  recoUs9XIZWStoI6X: ["facial-balancing"],
  recoV8QYMHSCOMDS5: ["facial-balancing"],
  recoh2n38zA7uycSH: ["smooth-wrinkles-lines", "eyelid-eye-area-concerns"],
  recpQFltIq03zT6P0: ["facial-balancing"],
  recplDjkqUMGOppYZ: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  recqs5nTkSXOZ7YYV: ["facial-balancing"],
  recrEuVSGTZzIUsZ2: ["restore-volume-definition"],
  recrTqUFzfLHx0usK: ["facial-balancing", "smooth-wrinkles-lines"],
  recryEg4u5PkBXAjb: ["restore-volume-definition", "improve-skin-texture-tone"],
  recs3VC9NonG9FWUa: ["facial-balancing"],
  recsJxremsml0rwXv: ["improve-skin-texture-tone"],
  recsQULXGvLt4LQUm: ["facial-balancing"],
  recsYeygjt7Qe4IDM: ["facial-balancing"],
  recsbQfx2x4NZlxOJ: ["facial-balancing"],
  recsnCp7YtUXYGbQa: ["improve-skin-texture-tone"],
  rectFfW51bgYEWO6W: ["restore-volume-definition"],
  rectMqeTvWRkcQsK4: ["restore-volume-definition"],
  recu7NpLpUUT5ntiy: ["facial-balancing", "restore-volume-definition"],
  recuYpylvaPcqDoNP: ["eyelid-eye-area-concerns"],
  recuukhGcqUjfCL9Q: [
    "restore-volume-definition",
    "improve-skin-texture-tone",
    "eyelid-eye-area-concerns",
  ],
  recvCndjzK1OZD8kz: ["facial-balancing", "restore-volume-definition"],
  recvSz776om40f1m8: ["body-contouring-fat-reduction"],
  recvWshJ89JSrz7XC: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recvYIypJRmGysJRW: ["restore-volume-definition"],
  recvp7xuZA6Fz313a: ["restore-volume-definition"],
  recw0hTcHU5ZRWB9a: ["smooth-wrinkles-lines"],
  recwbhunGR3nICNh4: ["improve-skin-texture-tone"],
  recwd1qV71M4rnSEV: ["improve-skin-texture-tone"],
  recx8X4omgnYMXpKJ: ["smooth-wrinkles-lines", "improve-skin-texture-tone"],
  recxBxN7w3ISMZ83H: ["restore-volume-definition"],
  recxDCtziA9a0yKDw: [
    "smooth-wrinkles-lines",
    "improve-skin-texture-tone",
    "eyelid-eye-area-concerns",
  ],
  recxU0FpEDYRVz06l: ["facial-balancing"],
  recxycQc4hulKpsmn: ["body-contouring-fat-reduction"],
  recyHYbBp8xUetx7f: ["restore-volume-definition", "eyelid-eye-area-concerns"],
  recyd3FegGye3aaCh: ["restore-volume-definition"],
  recz4feOXQ4x4puBJ: ["restore-volume-definition"],
  recz9RI2wXb4qCNEV: ["eyelid-eye-area-concerns"],
  reczAhYBCgBNiHoeb: ["improve-skin-texture-tone"],
  reczG29LktxBlh6eV: ["smooth-wrinkles-lines"],
  reczHnOWx2sCiv2QK: ["smooth-wrinkles-lines"],
  reczgDgGmKO6Vslap: ["facial-balancing"],
  reczqLstrRQPrKwgf: ["eyelid-eye-area-concerns"],
  reczwBf9Db8VH7NJE: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
  reczxqJp3zNylgxaR: ["improve-skin-texture-tone", "eyelid-eye-area-concerns"],
};

function getMatchingCasesForItem(item) {
  // If item is a category, match by category keywords
  if (item.type === "category") {
    const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === item.id);
    if (!category) return [];

    return caseData
      .map((caseItem) => {
        const score = calculateMatchingScore(caseItem, userSelections);
        caseItem.matchingScore = score;
        return caseItem;
      })
      .filter((caseItem) => {
        // FIRST: Check if case has explicit category mapping from CSV
        const caseCategories = CASE_CATEGORY_MAPPING[caseItem.id];
        if (caseCategories && caseCategories.includes(item.id)) {
          return true; // Direct match from CSV mapping
        }

        // SECOND: Fall back to keyword matching if no CSV mapping
        // Check if case matches this category
        const caseNameLower = (caseItem.name || "").toLowerCase();
        const matchingCriteriaLower = (caseItem.matchingCriteria || []).map(
          (c) => c.toLowerCase()
        );

        // Helper function to normalize keywords (handle hyphens and spaces)
        const normalizeKeyword = (keyword) =>
          keyword.toLowerCase().replace(/[-_\s]+/g, "[-\\s_]*");

        const nameMatch = category.mapsToPhotos.some((keyword) => {
          const keywordLower = keyword.toLowerCase();
          // Direct match
          if (caseNameLower.includes(keywordLower)) return true;
          // Match with normalized keyword (handles hyphens/spaces)
          const normalized = normalizeKeyword(keyword);
          const regex = new RegExp(normalized, "i");
          return regex.test(caseNameLower);
        });

        const criteriaMatch = category.mapsToPhotos.some((keyword) => {
          const keywordLower = keyword.toLowerCase();
          return matchingCriteriaLower.some((criteria) => {
            if (criteria.includes(keywordLower)) return true;
            // Match with normalized keyword
            const normalized = normalizeKeyword(keyword);
            const regex = new RegExp(normalized, "i");
            return regex.test(criteria);
          });
        });

        // Also check mapsToSpecificIssues against case's solved issues and matching criteria
        let issueMatch = false;
        if (
          category.mapsToSpecificIssues &&
          category.mapsToSpecificIssues.length > 0
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

          issueMatch = category.mapsToSpecificIssues.some((issueKeyword) => {
            const issueKeywordLower = issueKeyword.toLowerCase();
            return allCaseIssuesLower.some((caseIssue) => {
              // Direct match
              if (
                caseIssue.includes(issueKeywordLower) ||
                issueKeywordLower.includes(caseIssue)
              )
                return true;
              // Normalized match
              const normalized = normalizeKeyword(issueKeyword);
              const regex = new RegExp(normalized, "i");
              return regex.test(caseIssue);
            });
          });
        }

        // Filter by selected areas if any are selected
        let areaMatch = true;
        if (
          userSelections.selectedAreas &&
          userSelections.selectedAreas.length > 0
        ) {
          const caseName = caseItem.name || "";
          const caseNameLower = caseName.toLowerCase();
          const matchingCriteria = (caseItem.matchingCriteria || []).map((c) =>
            c.toLowerCase()
          );
          const solvedIssuesLower = (caseItem.solved || []).map((issue) =>
            typeof issue === "string"
              ? issue.toLowerCase()
              : String(issue || "").toLowerCase()
          );
          const allCaseText = [
            caseNameLower,
            ...matchingCriteria,
            ...solvedIssuesLower,
          ].join(" ");

          // Use the same area keyword mapping as getTreatmentGroupRelevance for consistency
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
            { keywords: ["neck", "neck lines", "neck wrinkles"], area: "Neck" },
          ];

          // Get user's selected area names
          const userSelectedAreaNames = userSelections.selectedAreas
            .map((areaId) => {
              const area = AREAS_OF_CONCERN.find((a) => a.id === areaId);
              return area ? area.name : null;
            })
            .filter((name) => name !== null);

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
          // If no areas matched from keywords, filter it out (areaMatch = false)
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
  }

  // Otherwise, use existing logic for issues
  let matchingCases = [];

  if (item.type === "issue") {
    // Create multiple variations of the issue name for better matching
    const issueName = item.name.toLowerCase();
    const issueSlug = issueName.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    // Also create variations with different word orders and formats
    const issueWords = issueName.split(/\s+/).filter((w) => w.length > 0);

    // Get mapped variations if they exist
    const mappedVariations = issueNameMappings[issueName] || [];

    const issueVariations = [
      issueSlug,
      issueName.replace(/\s+/g, "-"),
      issueWords.join("-"),
      issueWords.slice().reverse().join("-"), // Reverse word order
      ...mappedVariations.map((v) =>
        v
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      ),
      ...mappedVariations.map((v) => v.toLowerCase()),
      ...issueWords.map((w) => w.replace(/[^a-z0-9]/g, "")), // Individual words
    ];

    // Remove duplicates
    const uniqueVariations = [...new Set(issueVariations)];

    matchingCases = caseData.filter((caseItem) => {
      // Check matching criteria
      const criteriaMatch = caseItem.matchingCriteria.some((criteria) => {
        const criteriaLower = criteria.toLowerCase();
        return uniqueVariations.some((variation) => {
          const variationClean = variation.replace(/[^a-z0-9-]/g, "");
          const criteriaClean = criteriaLower.replace(/[^a-z0-9-]/g, "");
          return (
            criteriaClean.includes(variationClean) ||
            variationClean.includes(criteriaClean) ||
            // Check if key words match
            issueWords.some((word) => {
              const wordClean = word.replace(/[^a-z0-9]/g, "");
              return wordClean.length > 2 && criteriaClean.includes(wordClean);
            })
          );
        });
      });

      // Also check the case name
      const caseNameLower = caseItem.name.toLowerCase();
      const nameMatch = uniqueVariations.some((variation) => {
        const variationClean = variation.replace(/[^a-z0-9-]/g, "");
        const nameClean = caseNameLower.replace(/[^a-z0-9-]/g, "");
        return (
          nameClean.includes(variationClean) ||
          variationClean.includes(nameClean) ||
          issueWords.some((word) => {
            const wordClean = word.replace(/[^a-z0-9]/g, "");
            return wordClean.length > 2 && nameClean.includes(wordClean);
          })
        );
      });

      // Check solved issues
      const solvedMatch = caseItem.solved.some((solved) => {
        const solvedLower = solved.toLowerCase();
        return uniqueVariations.some((variation) => {
          const variationClean = variation.replace(/[^a-z0-9-]/g, "");
          const solvedClean = solvedLower.replace(/[^a-z0-9-]/g, "");
          return (
            solvedClean.includes(variationClean) ||
            variationClean.includes(solvedClean) ||
            issueWords.some((word) => {
              const wordClean = word.replace(/[^a-z0-9]/g, "");
              return wordClean.length > 2 && solvedClean.includes(wordClean);
            })
          );
        });
      });

      // Special handling for body concerns - be more lenient with case name matching
      let bodyConcernMatch = false;
      if (issueName === "unwanted hair") {
        // Match if case name contains "hair" and ("removal" or "laser" or "motus")
        const hasHair = caseNameLower.includes("hair");
        const hasRemoval =
          caseNameLower.includes("removal") ||
          caseNameLower.includes("laser") ||
          caseNameLower.includes("motus");
        bodyConcernMatch = hasHair && hasRemoval;
      } else if (issueName === "stubborn fat") {
        // Match if case name contains "body contour" or "fat" or treatment names
        bodyConcernMatch =
          (caseNameLower.includes("body") &&
            caseNameLower.includes("contour")) ||
          caseNameLower.includes("fat") ||
          caseNameLower.includes("physiq") ||
          caseNameLower.includes("everesse");
      }

      return criteriaMatch || nameMatch || solvedMatch || bodyConcernMatch;
    });
  } else {
    // For goals
    const goalSlug = item.name.toLowerCase().replace(/\s+/g, "-");
    matchingCases = caseData.filter((caseItem) => {
      return caseItem.matchingCriteria.some(
        (criteria) =>
          criteria.toLowerCase().includes(goalSlug) ||
          goalSlug.includes(criteria.toLowerCase())
      );
    });
  }

  // Filter by age
  if (userSelections.age) {
    matchingCases = filterCasesByAge(matchingCases, userSelections.age);
  }

  // Calculate scores and sort
  matchingCases = matchingCases.map((caseItem) => ({
    ...caseItem,
    matchingScore: calculateMatchingScore(caseItem, userSelections),
  }));

  matchingCases.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));

  // Filter out surgical cases before returning
  const nonSurgicalCases = filterNonSurgicalCases(matchingCases);

  return nonSurgicalCases.slice(0, 10); // Limit to 10 for preview
}

function generateIssueGoalDescription(item) {
  if (item.type === "goal") {
    const goalDescriptions = {
      "facial-balancing":
        "Facial balancing focuses on creating harmony and proportion across your facial features. This approach considers your unique bone structure, skin quality, and natural features to enhance your appearance while maintaining your authentic look.",
      "anti-aging":
        "Anti-aging treatments address visible signs of aging including fine lines, wrinkles, volume loss, and skin texture changes. These treatments help restore a more youthful appearance while maintaining natural-looking results.",
      "skin-rejuvenation":
        "Skin rejuvenation targets overall skin health, addressing concerns like pigmentation, texture, tone, and elasticity. This comprehensive approach improves your skin's appearance and helps prevent future damage.",
      "natural-look":
        "A natural look approach emphasizes subtle enhancements that enhance your existing features rather than dramatically changing your appearance. Results look authentic and complement your unique facial structure.",
    };
    return (
      goalDescriptions[item.name] ||
      "This goal focuses on enhancing your natural beauty and addressing your specific aesthetic concerns."
    );
  } else {
    // For issues, generate description based on the issue name
    const issueDescriptions = {
      // Forehead
      "Forehead Wrinkles":
        "Forehead wrinkles are horizontal lines that form across the forehead due to repetitive facial expressions and natural aging. These can be addressed through various treatment options.",
      "Glabella Wrinkles":
        'Glabella wrinkles, also known as frown lines or "11 lines," form between the eyebrows. These vertical lines can create a stern or tired appearance.',
      "Brow Asymmetry":
        "Brow asymmetry occurs when one eyebrow sits higher or lower than the other, creating an unbalanced appearance.",
      "Flat Forehead":
        "A flat forehead lacks natural curvature and definition, which can affect overall facial harmony.",
      "Brow Ptosis":
        "Brow ptosis refers to drooping eyebrows that can make the eyes appear smaller and create a tired look.",
      "Temporal Hollow":
        "Temporal hollowing is the loss of volume in the temple area, which can create a gaunt or aged appearance.",
      // Eyes
      "Crow's Feet Wrinkles":
        "Crow's feet are fine lines that radiate from the outer corners of the eyes, often caused by smiling and squinting.",
      "Under Eye Wrinkles":
        "Under eye wrinkles are fine lines that form beneath the eyes, contributing to an aged or tired appearance.",
      "Under Eye Dark Circles":
        "Under eye dark circles can make you look tired and older than you feel. Multiple factors contribute including genetics, thin skin, and volume loss.",
      "Excess Upper Eyelid Skin":
        "Excess upper eyelid skin can create a heavy, tired appearance and may even impair vision. This concern can be addressed through surgical or non-surgical approaches.",
      "Lower Eyelid - Excess Skin":
        "Excess lower eyelid skin can create bags and contribute to an aged appearance.",
      "Upper Eyelid Droop":
        "Upper eyelid droop can make the eyes appear smaller and create a tired or aged look.",
      "Lower Eyelid Sag":
        "Lower eyelid sagging can expose more of the white of the eye and create an aged appearance.",
      "Lower Eyelid Bags":
        "Lower eyelid bags are caused by fat herniation and can create a puffy, tired appearance.",
      "Under Eye Hollow":
        "Under eye hollowing creates a sunken appearance that can make you look tired or aged.",
      "Upper Eye Hollow":
        "Upper eye hollowing refers to volume loss in the upper eyelid area, creating a sunken appearance.",
      // Cheeks
      "Mid Cheek Flattening":
        "Mid cheek flattening is the loss of volume in the central cheek area, which can create an aged or gaunt appearance.",
      "Cheekbone - Not Prominent":
        "Lack of prominent cheekbones can affect facial definition and overall facial harmony.",
      "Heavy Lateral Cheek":
        "Heavy lateral cheeks refer to excess fullness in the outer cheek area, which can affect facial contour.",
      "Lower Cheeks - Volume Depletion":
        "Volume depletion in the lower cheeks can create jowls and contribute to an aged appearance.",
      // Nose
      "Crooked Nose": "A crooked nose can affect facial symmetry and balance.",
      "Droopy Tip":
        "A droopy nasal tip can make the nose appear longer and affect overall facial harmony.",
      "Dorsal Hump":
        "A dorsal hump is a bump on the bridge of the nose that can affect the nose's profile.",
      "Tip Droop When Smiling":
        "Nasal tip drooping when smiling can affect facial expression and appearance.",
      // Lips
      "Thin Lips":
        "Thin lips can affect facial balance and may make you appear older than you feel.",
      "Lacking Philtral Column":
        "A lacking philtral column (the vertical groove above the upper lip) can affect lip definition.",
      "Long Philtral Column":
        "An elongated philtral column can make the upper lip appear longer than desired.",
      "Gummy Smile":
        "A gummy smile occurs when excessive gum tissue is visible when smiling.",
      "Asymmetric Lips": "Lip asymmetry can affect facial balance and harmony.",
      "Dry Lips": "Dry, chapped lips can affect comfort and appearance.",
      "Lip Thinning When Smiling":
        "Lip thinning when smiling can affect facial expression and appearance.",
      // Chin/Jaw
      "Retruded Chin":
        "A retruded chin sits too far back, which can affect facial profile and balance.",
      "Over-Projected Chin":
        "An over-projected chin extends too far forward, affecting facial harmony.",
      "Asymmetric Chin": "Chin asymmetry can affect overall facial balance.",
      Jowls:
        "Jowls are sagging skin along the jawline that can create an aged appearance.",
      "Ill-Defined Jawline":
        "An ill-defined jawline can affect facial contour and profile. This can be improved through various contouring and definition techniques.",
      "Asymmetric Jawline":
        "Jawline asymmetry can affect overall facial balance and harmony.",
      "Masseter Hypertrophy":
        "Masseter hypertrophy refers to enlarged jaw muscles that can create a square or overly wide jaw appearance.",
      "Prejowl Sulcus":
        "The prejowl sulcus is a depression that forms just before the chin, which can affect jawline definition.",
      // Neck
      "Neck Lines":
        "Neck lines are horizontal wrinkles that form across the neck, contributing to an aged appearance.",
      "Loose Neck Skin":
        "Loose neck skin can create a sagging appearance and contribute to an aged look.",
      "Platysmal Bands":
        "Platysmal bands are vertical cords that form in the neck, creating an aged appearance.",
      "Excess/Submental Fullness":
        'Excess submental fullness, or a "double chin," can affect facial profile and contour.',
      // Skin
      "Dark Spots":
        "Dark spots, or hyperpigmentation, can create an uneven skin tone and aged appearance.",
      "Red Spots":
        "Red spots can indicate inflammation, rosacea, or other skin conditions.",
      Scars: "Facial scars can affect skin texture and appearance.",
      "Dry Skin":
        "Dry skin can affect comfort, appearance, and contribute to premature aging.",
      Whiteheads:
        "Whiteheads are a type of acne that can affect skin appearance.",
      Blackheads:
        "Blackheads are a type of acne that can affect skin appearance and texture.",
      "Crepey Skin":
        "Crepey skin has a wrinkled, crinkled texture that can create an aged appearance.",
      "Nasolabial Folds":
        "Nasolabial folds are lines that extend from the nose to the corners of the mouth, contributing to an aged appearance.",
      "Marionette Lines":
        "Marionette lines extend downward from the corners of the mouth, creating a sad or aged appearance.",
      "Bunny Lines":
        "Bunny lines are horizontal wrinkles that form across the bridge of the nose when smiling or squinting.",
      "Perioral Wrinkles":
        'Perioral wrinkles are fine lines that form around the mouth, often called "smoker\'s lines."',
    };
    return (
      issueDescriptions[item.name] ||
      `This concern affects your appearance and can be addressed through personalized treatment options. Our providers will discuss the best approach for your unique situation.`
    );
  }
}

function generateRelevanceText(item) {
  if (item.type === "goal") {
    return `Addressing ${formatGoalName(
      item.name
    )} aligns with your aesthetic goals and will help you achieve the look you're seeking. Our team will work with you to develop a personalized treatment plan.`;
  } else {
    return `Addressing ${item.name} will help you achieve your aesthetic goals. This concern is common and can be effectively treated with the right approach tailored to your needs.`;
  }
}

// Generate explanation of why an issue relates to specific goals
function generateGoalRelevanceExplanation(issueName, goalSlugs) {
  if (!goalSlugs || goalSlugs.length === 0) {
    // If no goals selected, explain how this issue could relate to common aesthetic goals
    const displayName = getIssueDisplayName(issueName);
    return `${displayName} is a common aesthetic concern that can be addressed through personalized treatment options. Our providers will work with you to develop a treatment plan that aligns with your unique goals and preferences.`;
  }

  const explanations = [];

  goalSlugs.forEach((goalSlug) => {
    const goalName = formatGoalName(goalSlug);
    let explanation = "";

    // Map specific issues to goal explanations
    const issueGoalExplanations = {
      "facial-balancing": {
        "Brow Asymmetry":
          "Brow asymmetry affects facial symmetry and balance. Addressing this helps create harmony between your facial features.",
        "Asymmetric Chin":
          "Chin asymmetry disrupts facial balance. Correcting this improves overall facial proportion and symmetry.",
        "Asymmetric Jawline":
          "Jawline asymmetry affects your profile and facial harmony. Balancing this creates a more symmetrical appearance.",
        "Asymmetric Lips":
          "Lip asymmetry affects facial balance. Addressing this helps create symmetry and proportion.",
        "Crooked Nose":
          "A crooked nose affects facial symmetry. Straightening it improves overall facial balance and harmony.",
        "Ill-Defined Jawline":
          "A well-defined jawline creates facial structure and balance. Enhancing definition improves your profile and overall facial harmony.",
        "Cheekbone - Not Prominent":
          "Prominent cheekbones create facial structure and definition. Enhancing them improves facial balance and contour.",
        "Retruded Chin":
          "A retruded chin affects facial profile and balance. Advancing it improves overall facial proportion and harmony.",
        "Over-Projected Chin":
          "An over-projected chin disrupts facial balance. Adjusting it creates better proportion and harmony.",
        "Temporal Hollow":
          "Temporal hollowing affects facial contour and balance. Restoring volume improves overall facial harmony.",
        "Mid Cheek Flattening":
          "Mid cheek flattening affects facial volume and contour. Restoring volume improves facial balance and creates a more youthful, harmonious appearance.",
      },
      "anti-aging": {
        "Forehead Wrinkles":
          "Forehead wrinkles are a visible sign of aging. Smoothing them helps restore a more youthful appearance.",
        "Crow's Feet Wrinkles":
          "Crow's feet are fine lines that form around the eyes with age. Addressing them helps reduce visible signs of aging.",
        "Glabella Wrinkles":
          "Glabella wrinkles (frown lines) are common signs of aging. Softening them helps create a more youthful, relaxed appearance.",
        "Under Eye Wrinkles":
          "Under eye wrinkles contribute to an aged appearance. Smoothing them helps restore a more youthful look.",
        "Perioral Wrinkles":
          "Perioral wrinkles around the mouth are signs of aging. Addressing them helps create a more youthful appearance.",
        "Bunny Lines":
          "Bunny lines are wrinkles that form with facial expressions and age. Smoothing them reduces visible signs of aging.",
        "Nasolabial Folds":
          "Nasolabial folds deepen with age and volume loss. Addressing them helps restore a more youthful appearance.",
        "Marionette Lines":
          "Marionette lines are signs of aging that can create a sad appearance. Addressing them helps restore a more youthful look.",
        "Neck Lines":
          "Neck lines are common signs of aging. Smoothing them helps create a more youthful, rejuvenated appearance.",
        Jowls:
          "Jowls form with age and volume loss. Addressing them helps restore a more defined, youthful jawline.",
        "Loose Neck Skin":
          "Loose neck skin is a sign of aging. Tightening it helps restore a more youthful, defined neck contour.",
        "Platysmal Bands":
          "Platysmal bands become more visible with age. Addressing them helps create a smoother, more youthful neck appearance.",
        "Lower Cheeks - Volume Depletion":
          "Volume depletion in the lower cheeks is a sign of aging. Restoring volume helps create a more youthful, full appearance.",
        "Under Eye Hollow":
          "Under eye hollowing occurs with age and volume loss. Restoring volume helps create a more youthful, refreshed appearance.",
        "Upper Eye Hollow":
          "Upper eye hollowing is a sign of aging. Restoring volume helps create a more youthful, full appearance.",
        "Crepey Skin":
          "Crepey skin texture is a visible sign of aging. Improving texture helps restore a more youthful, smooth appearance.",
      },
      "skin-rejuvenation": {
        "Dark Spots":
          "Dark spots affect skin tone and clarity. Addressing them helps create a more even, radiant complexion.",
        "Red Spots":
          "Red spots indicate skin inflammation or conditions. Addressing them helps create a calmer, more even skin tone.",
        Scars:
          "Scars affect skin texture and appearance. Improving them helps create smoother, more uniform skin.",
        "Dry Skin":
          "Dry skin affects comfort and can contribute to premature aging. Improving hydration helps restore healthy, radiant skin.",
        Whiteheads:
          "Whiteheads affect skin clarity. Addressing them helps create clearer, smoother skin.",
        Blackheads:
          "Blackheads affect skin texture and appearance. Clearing them helps create smoother, more refined skin.",
        "Crepey Skin":
          "Crepey skin texture affects skin quality. Improving texture helps restore smoother, more youthful-looking skin.",
        "Under Eye Dark Circles":
          "Dark circles affect skin tone and appearance. Brightening them helps create a more even, refreshed look.",
      },
      "natural-look": {
        "Forehead Wrinkles":
          "Forehead wrinkles can be addressed subtly to maintain a natural appearance while reducing visible signs of aging.",
        "Under Eye Wrinkles":
          "Under eye wrinkles can be smoothed naturally to create a refreshed look without appearing overdone.",
        "Nasolabial Folds":
          "Nasolabial folds can be softened naturally to create a more youthful appearance while maintaining your authentic look.",
        "Marionette Lines":
          "Marionette lines can be addressed subtly to create a more positive appearance while maintaining natural facial expressions.",
        "Under Eye Dark Circles":
          "Dark circles can be brightened naturally to create a refreshed, well-rested appearance.",
        "Dark Spots":
          "Dark spots can be faded naturally to create a more even skin tone while maintaining your natural complexion.",
        Jowls:
          "Jowls can be addressed naturally to restore definition while maintaining your authentic facial structure.",
        "Ill-Defined Jawline":
          "Jawline definition can be enhanced naturally to improve your profile while maintaining your unique features.",
        "Mid Cheek Flattening":
          "Mid cheek volume can be restored naturally to create a more youthful appearance while maintaining your authentic look.",
        "Lower Cheeks - Volume Depletion":
          "Lower cheek volume can be restored naturally to create a more full, youthful appearance while maintaining your natural features.",
      },
    };

    const issueExplanations = issueGoalExplanations[goalSlug];
    if (issueExplanations && issueExplanations[issueName]) {
      explanation = issueExplanations[issueName];
    } else {
      // Fallback explanation
      explanation = `Addressing ${getIssueDisplayName(
        issueName
      )} supports your ${goalName} goal by helping you achieve the look you're seeking.`;
    }

    explanations.push(explanation);
  });

  if (explanations.length === 1) {
    return explanations[0];
  } else {
    // Multiple goals - combine explanations
    return (
      explanations.join(" ") +
      " Together, these improvements help you achieve your aesthetic goals."
    );
  }
}

function formatGoalName(goalSlug) {
  const goalNames = {
    "facial-balancing": "Facial Balancing",
    "anti-aging": "Anti-Aging",
    "skin-rejuvenation": "Skin Rejuvenation",
    "natural-look": "Natural Look",
  };
  return goalNames[goalSlug] || goalSlug;
}

function showCaseDetailFromPreview(caseId) {
  const caseItem = caseData.find((c) => c.id === caseId);
  if (caseItem) {
    caseDetailReturnScreen = "gallery";
    showCaseDetail(caseItem, "gallery");
  }
}

function proceedToGallery() {
  // Scroll to top
  scrollToTop();

  // Convert issues to matching criteria format
  const allSelections = [
    ...userSelections.overallGoals,
    ...userSelections.selectedIssues.map((issue) =>
      issue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    ),
  ];

  // Filter cases that match user selections
  let matchingCases = caseData.filter((caseItem) => {
    return caseItem.matchingCriteria.some((criteria) =>
      allSelections.includes(criteria)
    );
  });

  // Filter by age if age is provided
  if (userSelections.age) {
    matchingCases = filterCasesByAge(matchingCases, userSelections.age);
  }

  // If no matches, show all cases filtered by age
  if (matchingCases.length === 0) {
    matchingCases = userSelections.age
      ? filterCasesByAge(caseData, userSelections.age)
      : caseData;
  }

  // Calculate and add matching scores
  matchingCases = matchingCases.map((caseItem) => {
    return {
      ...caseItem,
      matchingScore: calculateMatchingScore(caseItem, userSelections),
    };
  });

  // Sort by matching score (highest first)
  matchingCases.sort((a, b) => b.matchingScore - a.matchingScore);

  // Hide issue detail screen and show gallery
  document.getElementById("issue-detail-screen").classList.remove("active");

  // Hide top-right buttons when leaving issue detail screen
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.remove("visible");
  }

  displayGallery(matchingCases);
}

function goBackToForm() {
  document.getElementById("issue-detail-screen").classList.remove("active");
  document.getElementById("form-screen").classList.add("active");

  // Hide top-right buttons when leaving issue detail screen
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.remove("visible");
  }

  scrollToTop();
}

// Store all cases for filtering
let allCasesForFiltering = [];

function displayGallery(cases) {
  // Scroll to top
  scrollToTop();

  document.getElementById("form-screen").classList.remove("active");
  document.getElementById("gallery-toc").classList.add("active");

  // Store cases for filtering (filter out surgical cases)
  allCasesForFiltering = filterNonSurgicalCases(cases);

  // Reset concern filter
  activeGalleryConcern = "all";

  // Populate concern filter chips
  populateGalleryConcernFilters();

  // Display with current filter
  const currentFilter =
    document.querySelector(".filter-button.active")?.dataset.filter || "all";
  filterCases(currentFilter);

  // Start typewriter effect for Chat with AI
  startChatTypewriter();

  // Update floating CTA
  updateFloatingCTA();

  // Update discount displays
  updateDiscountDisplays();
}

// Gallery concern filter
let activeGalleryConcern = "all";

function filterGalleryByConcern(concernId) {
  activeGalleryConcern = concernId;

  // Update active chip
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.remove("active");
    if (chip.dataset.filter === concernId) {
      chip.classList.add("active");
    }
  });

  // Re-filter cases with current view filter (all/read/favorited)
  const activeViewFilter = document.querySelector(
    ".gallery-filters .filter-button.active"
  );
  const viewFilter = activeViewFilter ? activeViewFilter.dataset.filter : "all";
  filterCases(viewFilter);
}

function populateGalleryConcernFilters() {
  const filtersContainer = document.getElementById("gallery-concern-filters");
  if (!filtersContainer) return;

  const categories = userSelections.selectedConcernCategories || [];

  // Count all cases first
  let totalCases = 0;
  const categoryCounts = {};

  categories.forEach((categoryId) => {
    const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
    if (category) {
      const matchingCases = getMatchingCasesForItem({
        type: "category",
        name: category.name,
        id: categoryId,
        mapsToSpecificIssues: category.mapsToSpecificIssues,
      });
      categoryCounts[categoryId] = matchingCases.length;
      totalCases += matchingCases.length;
    }
  });

  // Update "All" count
  const allCount = document.getElementById("all-count");
  if (allCount) {
    allCount.textContent = totalCases > 0 ? `(${totalCases})` : "";
  }

  // Add category chips
  categories.forEach((categoryId) => {
    const category = HIGH_LEVEL_CONCERNS.find((c) => c.id === categoryId);
    if (category) {
      const count = categoryCounts[categoryId] || 0;
      const chip = document.createElement("button");
      chip.className = "filter-chip";
      chip.dataset.filter = categoryId;
      chip.onclick = () => filterGalleryByConcern(categoryId);
      chip.innerHTML = `${category.name} <span class="chip-count">${count}</span>`;
      filtersContainer.appendChild(chip);
    }
  });
}

function filterCases(filterType) {
  // Update active filter button
  document.querySelectorAll(".filter-button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filterType) {
      btn.classList.add("active");
    }
  });

  let filteredCases = allCasesForFiltering;

  // First filter by concern if not "all"
  if (activeGalleryConcern !== "all") {
    const category = HIGH_LEVEL_CONCERNS.find(
      (c) => c.id === activeGalleryConcern
    );
    if (category) {
      const concernCases = getMatchingCasesForItem({
        type: "category",
        name: category.name,
        id: activeGalleryConcern,
        mapsToSpecificIssues: category.mapsToSpecificIssues,
      });
      const concernCaseIds = new Set(concernCases.map((c) => c.id));
      filteredCases = filteredCases.filter((c) => concernCaseIds.has(c.id));
    }
  }

  if (filterType === "read") {
    filteredCases = allCasesForFiltering.filter((c) => isCaseRead(c.id));
  } else if (filterType === "favorited") {
    filteredCases = allCasesForFiltering.filter((c) => isCaseInGoals(c.id));
  }

  const carouselTrack = document.getElementById("case-carousel-track");
  if (!carouselTrack) return;

  carouselTrack.innerHTML = "";

  if (filteredCases.length === 0) {
    const emptyMessage =
      filterType === "read"
        ? "You haven't viewed any cases yet."
        : filterType === "favorited"
        ? "You haven't favorited any cases yet."
        : "No cases found matching your criteria.";
    carouselTrack.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  // Sort by match score
  filteredCases.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));

  // Create horizontal carousel cards
  filteredCases.forEach((caseItem) => {
    const card = document.createElement("div");
    card.className = "carousel-case-card";
    card.dataset.caseId = caseItem.id;

    const isRead = isCaseRead(caseItem.id);
    const inGoals = isCaseInGoals(caseItem.id);
    const commonForAge = calculateCommonForAge(caseItem, userSelections.age);
    const modality = getTreatmentModality(caseItem.name);

    const discountBadge = getDiscountBadgeHTML(caseItem);

    card.innerHTML = `
            <div class="carousel-case-image-wrapper">
              <img src="${caseItem.thumbnail}" alt="${
      caseItem.name
    }" class="carousel-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\'%3E%3Crect width=\\'300\\' height=\\'300\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
              ${discountBadge}
            </div>
            <div class="carousel-case-info">
                <div class="carousel-case-header">
                    <div class="carousel-case-name">${caseItem.name}</div>
                    <div class="carousel-indicators">
                        ${
                          isRead
                            ? '<span class="case-indicator read-indicator" title="Read">' +
                              getIconSVG("check", 14) +
                              "</span>"
                            : ""
                        }
                        ${
                          inGoals
                            ? '<span class="case-indicator goal-indicator" title="Added to goals">' +
                              getIconSVG("star", 14) +
                              "</span>"
                            : ""
                        }
                    </div>
                </div>
                <div class="carousel-modality">
                    <span class="modality-icon">${modality.icon}</span>
                    <span class="modality-name">${modality.name}</span>
                </div>
                <div class="carousel-meta">
                    <div class="carousel-common">Common for your age: ${commonForAge}</div>
                </div>
            </div>
        `;

    card.onclick = (e) => {
      if (!e.target.classList.contains("case-indicator")) {
        caseDetailReturnScreen = "gallery";
        showCaseDetail(caseItem, "gallery");
      }
    };

    carouselTrack.appendChild(card);
  });
}

function scrollCarousel(direction) {
  const track = document.getElementById("case-carousel-track");
  if (!track) return;

  const cardWidth =
    track.querySelector(".carousel-case-card")?.offsetWidth || 320;
  const scrollAmount = cardWidth + 16; // card width + gap
  const currentScroll = track.scrollLeft;

  track.scrollTo({
    left: currentScroll + scrollAmount * direction,
    behavior: "smooth",
  });
}

function startChatTypewriter() {
  const chatText = document.getElementById("chat-text");
  if (!chatText) return;

  const text = "Chat with AI";
  chatText.textContent = "";
  let index = 0;

  const typeInterval = setInterval(() => {
    if (index < text.length) {
      chatText.textContent += text[index];
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 100);
}

function openChatAI() {
  // Placeholder for ChatGPT integration
  alert(
    "Chat with AI feature coming soon! This will allow you to discuss your aesthetic goals and get personalized recommendations."
  );
  // TODO: Implement ChatGPT integration
}

function bookConsult() {
  // Open booking modal or redirect
  requestMoreInfo(); // For now, use same modal but could be separate booking flow
}

function requestMoreInfo() {
  const modal = document.getElementById("request-info-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }
}

function closeRequestModal() {
  const modal = document.getElementById("request-info-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
    // Reset form if it exists (it may have been replaced with success content)
    const form = document.getElementById("request-info-form");
    if (form) {
      form.reset();
    }
  }
}

// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
  const requestForm = document.getElementById("request-info-form");
  if (requestForm) {
    requestForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data for Airtable
      const leadData = {
        name: document.getElementById("request-name").value,
        email: document.getElementById("request-email").value,
        phone: document.getElementById("request-phone").value,
        message: document.getElementById("request-message").value,
        source: "Info Request Form",
      };

      console.log("Form submitted:", leadData);

      // Show loading state
      const submitButton = requestForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = "Submitting...";
        submitButton.disabled = true;
      }

      // Submit to Airtable
      const result = await submitLeadToAirtable(leadData);

      if (result.success) {
        console.log("✅ Lead saved to Airtable");
      } else {
        console.warn(
          "⚠️ Lead submission to Airtable failed, but showing success to user"
        );
      }

      // Show success message
      const modal = document.getElementById("request-info-modal");
      const formContainer = modal.querySelector(".modal-container");
      formContainer.innerHTML = `
                <div class="modal-success">
                    <div class="success-icon">${getIconSVG("check", 24)}</div>
                    <h2 class="modal-title">Thank You!</h2>
                    <p class="success-message">We've received your request and will contact you shortly.</p>
                    <p class="success-details">Our team will reach out to discuss your aesthetic goals and answer any questions you may have.</p>
                    <button class="modal-submit-button" onclick="closeRequestModal()">Close</button>
                </div>
            `;
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById("request-info-modal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeRequestModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("request-info-modal");
      if (modal && modal.classList.contains("active")) {
        closeRequestModal();
      }
    }
  });
});

function expandAllSections() {
  document.querySelectorAll(".case-section").forEach((section) => {
    const content = section.querySelector(".case-section-content");
    const icon = section.querySelector(".section-icon");
    content.style.display = "block";
    icon.innerHTML = getIconSVG("arrowDown", 12);
    section.classList.remove("collapsed");
  });
}

function collapseAllSections() {
  document.querySelectorAll(".case-section").forEach((section) => {
    const content = section.querySelector(".case-section-content");
    const icon = section.querySelector(".section-icon");
    content.style.display = "none";
    icon.innerHTML = getIconSVG("arrowRightSmall", 12);
    section.classList.add("collapsed");
  });
}

function organizeCasesByArea(cases) {
  const organized = {};
  const caseAssignments = new Map(); // Track which cases are assigned to which areas

  // Initialize sections for each selected area
  userSelections.selectedAreas.forEach((area) => {
    organized[area] = [];
  });

  // Add "Other Recommendations" for cases that don't match selected areas
  organized["Other Recommendations"] = [];

  // First pass: Match cases to areas based on selected issues
  cases.forEach((caseItem) => {
    const caseAreas = new Set();

    // Check each selected issue
    userSelections.selectedIssues.forEach((issue) => {
      const issueSlug = issue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Check if case matches this issue
      const matchesIssue = caseItem.matchingCriteria.some((c) => {
        const cLower = c.toLowerCase();
        return (
          cLower.includes(issueSlug) ||
          issueSlug.includes(cLower) ||
          cLower === issueSlug ||
          issue.toLowerCase().includes(cLower)
        );
      });

      if (matchesIssue) {
        // Find which area this issue belongs to
        userSelections.selectedAreas.forEach((area) => {
          if (areasAndIssues[area] && areasAndIssues[area].includes(issue)) {
            caseAreas.add(area);
          }
        });
      }
    });

    // Also check case name and solved issues for area keywords
    const caseNameLower = caseItem.name.toLowerCase();
    const solvedLower = caseItem.solved.map((s) => s.toLowerCase()).join(" ");

    userSelections.selectedAreas.forEach((area) => {
      const areaLower = area.toLowerCase();
      const areaKeywords = {
        Forehead: [
          "forehead",
          "brow ptosis",
          "brow asymmetry",
          "brow lift",
          "glabella",
          "temporal",
          "temple",
        ],
        Eyes: ["eye", "eyelid", "under-eye", "crow", "brow", "ptosis"],
        Cheeks: ["cheek", "cheekbone", "mid cheek"],
        Nose: ["nose", "nasal", "rhino", "nasal tip", "dorsal hump"],
        "Mouth & Lips": ["lip", "lips", "mouth", "philtral", "gummy"],
        Jawline: [
          "chin",
          "jaw",
          "jawline",
          "jowl",
          "jowls",
          "masseter",
          "prejowl",
          "submentum",
        ],
        Neck: ["neck", "platysmal", "submental", "neck lines", "neck wrinkles"],
        Skin: ["skin", "spot", "scar", "wrinkle", "peel", "laser"],
      };

      const keywords = areaKeywords[area] || [areaLower];
      const matchesArea = keywords.some(
        (keyword) =>
          caseNameLower.includes(keyword) || solvedLower.includes(keyword)
      );

      if (matchesArea) {
        caseAreas.add(area);
      }
    });

    // Assign case to all matching areas (or Other if none)
    if (caseAreas.size > 0) {
      caseAreas.forEach((area) => {
        if (!organized[area].find((c) => c.id === caseItem.id)) {
          organized[area].push(caseItem);
        }
      });
    } else {
      // Only add to Other if not already in any area
      if (!caseAssignments.has(caseItem.id)) {
        organized["Other Recommendations"].push(caseItem);
        caseAssignments.set(caseItem.id, "Other");
      }
    }
  });

  // Sort cases within each section by match score (highest first)
  Object.keys(organized).forEach((area) => {
    organized[area].sort(
      (a, b) => (b.matchingScore || 0) - (a.matchingScore || 0)
    );
  });

  return organized;
}

function createCaseCard(caseItem) {
  const isRead = isCaseRead(caseItem.id);
  const inGoals = isCaseInGoals(caseItem.id);
  const commonForAge = calculateCommonForAge(caseItem, userSelections.age);
  const modality = getTreatmentModality(caseItem.name);

  return `
        <div class="case-card" data-case-id="${caseItem.id}">
            <img src="${caseItem.thumbnail}" alt="${
    caseItem.name
  }" class="case-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
            <div class="case-info">
                <div class="case-name-row">
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-indicators">
                        ${
                          isRead
                            ? '<span class="case-indicator read-indicator" title="Read">' +
                              getIconSVG("check", 14) +
                              "</span>"
                            : ""
                        }
                        ${
                          inGoals
                            ? '<span class="case-indicator goal-indicator" title="Added to goals">' +
                              getIconSVG("star", 14) +
                              "</span>"
                            : ""
                        }
                    </div>
                </div>
                <div class="case-meta">
                    <div class="case-modality">
                        <span class="modality-icon">${modality.icon}</span>
                        <span class="modality-name">${modality.name}</span>
                    </div>
                    <div class="case-common">Common for your age: ${commonForAge}</div>
                </div>
            </div>
            <div class="case-arrow">${getIconSVG("arrowRight", 16)}</div>
        </div>
    `;
}

function toggleSection(header) {
  const section = header.closest(".case-section");
  const content = section.querySelector(".case-section-content");
  const icon = header.querySelector(".section-icon");

  if (content.style.display === "none") {
    content.style.display = "block";
    icon.innerHTML = getIconSVG("arrowDown", 12);
    section.classList.remove("collapsed");
  } else {
    content.style.display = "none";
    icon.innerHTML = getIconSVG("arrowRightSmall", 12);
    section.classList.add("collapsed");
  }
}

async function showCaseDetail(caseItem, returnScreen = null) {
  trackEvent("case_viewed", {
    caseId: caseItem.id,
    caseName: caseItem.name,
    treatment: caseItem.generalTreatment,
    issue: caseItem.issueName,
  });

  // Mark case as read when viewing
  markCaseAsRead(caseItem.id);

  // Track return screen if provided
  if (returnScreen) {
    caseDetailReturnScreen = returnScreen;
  }

  // Ensure matching score and demographic percentage are calculated
  if (
    caseItem.demographicMatchPercentage === undefined ||
    caseItem.demographicMatchPercentage === null
  ) {
    calculateMatchingScore(caseItem, userSelections);
  }

  // Scroll to top
  scrollToTop();

  // Hide all screens
  document.getElementById("gallery-toc")?.classList.remove("active");
  document.getElementById("issue-detail-screen")?.classList.remove("active");
  document.getElementById("results-screen")?.classList.remove("active");
  document
    .getElementById("treatment-detail-screen")
    ?.classList.remove("active");
  document.getElementById("case-detail").classList.add("active");

  // Update floating CTA
  updateFloatingCTA();

  const content = document.getElementById("case-detail-content");

  // Show loading state while prevalence loads
  content.innerHTML =
    '<div style="padding: 40px; text-align: center; color: #666;">Loading case details...</div>';

  // Wait for prevalence data to load (non-blocking, with timeout)
  await waitForPrevalenceData(1000);

  // Get matching criteria from user selections
  const allSelections = [
    ...userSelections.overallGoals,
    ...userSelections.selectedIssues.map((issue) =>
      issue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    ),
  ];

  const matchedCriteria = caseItem.matchingCriteria.filter((criteria) =>
    allSelections.includes(criteria)
  );

  // Format matching criteria for display - convert back from slug format
  function formatCriteriaLabel(criteria) {
    // First check if it's a goal
    const goalLabels = {
      "facial-balancing": "Facial Balancing",
      "anti-aging": "Anti-Aging",
      "skin-rejuvenation": "Skin Rejuvenation",
      "natural-look": "Natural Look",
    };

    if (goalLabels[criteria]) {
      return goalLabels[criteria];
    }

    // Otherwise, convert from slug back to readable format
    return criteria
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(/\b(\w)/g, (char) => char.toUpperCase());
  }

  // Check if case is in goals
  const inGoals = isCaseInGoals(caseItem.id);

  // Get treatment modality
  const modality = getTreatmentModality(caseItem.name);

  // Update back button based on return screen
  const backButton = document.querySelector("#case-detail .back-button");
  if (backButton) {
    if (caseDetailReturnScreen === "issue-overview") {
      backButton.onclick = goBackToIssueOverview;
      backButton.textContent = "← Back";
    } else if (caseDetailReturnScreen === "my-cases") {
      backButton.onclick = function () {
        document.getElementById("case-detail").classList.remove("active");
        document.getElementById("my-cases-screen").classList.add("active");
        showMyCases(); // Refresh
      };
      backButton.textContent = "← Back";
    } else {
      backButton.onclick = goBackToGallery;
      backButton.textContent = "← Back";
    }
  }

  // Use beforeAfter if available, otherwise fall back to thumbnail
  const displayImage = caseItem.beforeAfter || caseItem.thumbnail || null;

  // Get prevalence info for solved issues
  const userAge = userSelections.age;
  const issuesToCheck =
    caseItem.directMatchingIssues && caseItem.directMatchingIssues.length > 0
      ? caseItem.directMatchingIssues
      : caseItem.solved;

  // Filter for unique issues and get prevalence for each
  const uniqueIssues = [...new Set(issuesToCheck)];
  const prevalenceInfos = uniqueIssues
    .map((issue) => {
      // Clean up issue name for better matching if needed
      // e.g. "Jawline Definition" -> "Ill-Defined Jawline" might be tricky
      // But getPrevalenceDescription has fuzzy matching now
      const desc = getPrevalenceDescription(issue, userAge);
      if (!desc) return null;
      return { issue, desc };
    })
    .filter((info) => info !== null);

  const prevalenceHtml =
    prevalenceInfos.length > 0
      ? `
        <div class="case-prevalence" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <div class="prevalence-label" style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Concern Prevalence:</div>
            ${prevalenceInfos
              .map(
                (info) => `
                <div class="prevalence-item" style="margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #424242; font-size: 14px;">${escapeHtml(
                      info.issue
                    )}:</span>
                    <span style="color: #666; font-size: 14px;">${escapeHtmlPreserveStrong(
                      info.desc
                    )}</span>
                </div>
            `
              )
              .join("")}
        </div>
    `
      : "";

  content.innerHTML = `
        <div class="case-detail-card">
            <img src="${
              displayImage ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FFD291'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23212121'%3EBefore/After Image%3C/text%3E%3C/svg%3E"
            }" alt="Before and After" class="case-before-after" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\'%3E%3Crect width=\\'400\\' height=\\'300\\' fill=\\'%23FFD291\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-family=\\'Arial\\' font-size=\\'20\\' fill=\\'%23212121\\'%3EBefore/After Image%3C/text%3E%3C/svg%3E'">
            <h2 class="case-headline">${escapeHtml(caseItem.headline)}</h2>
            <div class="case-modality-badge">
                <span class="modality-icon">${modality.icon}</span>
                <span class="modality-name">${modality.name}</span>
                <span class="modality-separator">•</span>
                <span class="modality-category">${modality.category}</span>
            </div>
            <div class="case-patient">${escapeHtml(caseItem.patient)}</div>
            <p class="case-story">${escapeHtml(caseItem.story)}</p>
            
            <div class="case-solved">
                <div class="solved-label">This solved:</div>
                <div class="solved-tags">
                    ${caseItem.solved
                      .map((item) => `<span class="solved-tag">${item}</span>`)
                      .join("")}
                </div>
            </div>

            ${prevalenceHtml}
            
            <div class="case-treatment">
                <div class="treatment-label">Treatment Details:</div>
                <div class="treatment-details">${caseItem.treatment}</div>
            </div>
            
            <div class="case-matching">
                <div class="matching-label">Why this matches you:</div>
                <div class="matching-criteria">
                    ${
                      matchedCriteria.length > 0
                        ? matchedCriteria
                            .map(
                              (criteria) =>
                                `<span class="matching-tag">${formatCriteriaLabel(
                                  criteria
                                )}</span>`
                            )
                            .join("")
                        : `<span class="matching-tag">Based on your age and aesthetic goals</span>`
                    }
                </div>
            </div>
            
            ${(() => {
              // Add similarity score explanation if demographic match percentage exists
              if (
                caseItem.demographicMatchPercentage !== undefined &&
                caseItem.demographicMatchPercentage !== null
              ) {
                const breakdown = getSimilarityScoreBreakdown(
                  caseItem,
                  userSelections
                );
                if (breakdown.components.length > 0) {
                  // Calculate sum of contributions to verify
                  const totalContribution = breakdown.components.reduce(
                    (sum, comp) => sum + comp.contribution,
                    0
                  );

                  return `
                    <div class="case-similarity-breakdown">
                      <div class="similarity-header">
                        <h3 class="similarity-title">Similarity Score: ${
                          breakdown.totalScore
                        }%</h3>
                        <p class="similarity-description">This score shows how closely this patient's profile matches yours. Each demographic factor is compared and weighted by importance, then combined to create the final score.</p>
                      </div>
                      <div class="similarity-calculation-explanation">
                        <p class="calculation-intro"><strong>How it's calculated:</strong> For each factor, we calculate how similar you are (0-100%), multiply by that factor's weight, then divide by the total weight of all available factors.</p>
                      </div>
                      <div class="similarity-components">
                        ${breakdown.components
                          .map(
                            (component) => `
                          <div class="similarity-component">
                            <div class="component-header">
                              <span class="component-field">${component.field}</span>
                            </div>
                            <div class="component-details">
                              <div class="component-comparison">
                                <span class="component-value">You: ${component.userValue}</span>
                                <span class="component-separator">→</span>
                                <span class="component-value">Patient: ${component.caseValue}</span>
                              </div>
                              <div class="component-difference">${component.difference}</div>
                              <div class="component-calculation">
                                <div class="calculation-step">
                                  <span class="calc-label">Similarity:</span>
                                  <span class="calc-value">${component.similarity}%</span>
                                </div>
                                <div class="calculation-step">
                                  <span class="calc-label">Weight:</span>
                                  <span class="calc-value">${component.weight}%</span>
                                </div>
                                <div class="calculation-step calculation-result">
                                  <span class="calc-label">Contributes:</span>
                                  <span class="calc-value">${component.contribution}% to total</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        `
                          )
                          .join("")}
                      </div>
                      <div class="similarity-summary">
                        <p><strong>Total:</strong> ${breakdown.components
                          .map((c) => `${c.contribution}%`)
                          .join(" + ")} = <strong>${
                    breakdown.totalScore
                  }%</strong></p>
                        <p class="similarity-note-text">Only factors where both you and the patient have data are included. Missing data doesn't lower your score—we only compare what's available.</p>
                      </div>
                    </div>
                  `;
                }
              }
              return "";
            })()}
            
            <div class="case-detail-cta">
                ${(() => {
                  const discount = getCaseDiscount(caseItem);
                  return discount
                    ? `
                    <div class="case-detail-discount-offer">
                      <div class="case-detail-discount-badge">
                        <span class="case-detail-discount-icon">${getIconSVG(
                          "gift",
                          16
                        )}</span>
                        <div class="case-detail-discount-info">
                          <span class="case-detail-discount-amount">$${
                            discount.amount
                          } OFF</span>
                          <span class="case-detail-discount-desc">${
                            discount.description
                          }</span>
                        </div>
                      </div>
                      <p class="case-detail-discount-scarcity">${
                        discount.scarcity
                      } • <button class="discount-link-btn" onclick="showDiscountDetails()">Redeem Now</button></p>
                    </div>
                  `
                    : "";
                })()}
                <h3 class="case-detail-cta-title">Ready to See Your Personalized Plan?</h3>
                <p class="case-detail-cta-description">
                    Get a comprehensive facial analysis and treatment recommendations tailored specifically to your concerns and goals.
                </p>
                <button class="case-detail-cta-button" onclick="requestConsultation()">
                    ${getIconSVG("sparkle", 16)}
                    Get My Personalized Treatment Plan
                </button>
            </div>
        </div>
    `;
}

function toggleCaseGoal(caseId) {
  const inGoals = isCaseInGoals(caseId);

  if (inGoals) {
    removeCaseFromGoals(caseId);
  } else {
    addCaseToGoals(caseId);
  }

  // Refresh the current view
  const currentCase = caseData.find((c) => c.id === caseId);
  if (currentCase) {
    // Preserve the return screen when refreshing
    showCaseDetail(currentCase, caseDetailReturnScreen);
  }

  // Refresh gallery if we're going back
  // This will be handled when user goes back to gallery
}

function goBackToIssueOverview() {
  document.getElementById("case-detail").classList.remove("active");
  document.getElementById("issue-detail-screen").classList.add("active");
  caseDetailReturnScreen = null;

  // Restore the issue overview if we have one
  if (currentIssueOverview) {
    showIssueOverview(currentIssueOverview);
  }
}

function goBackToGallery() {
  document.getElementById("case-detail").classList.remove("active");

  // Scroll to top
  scrollToTop();

  // Check if we should return to my cases, results, or gallery
  const returnScreen = caseDetailReturnScreen;
  caseDetailReturnScreen = null;

  if (returnScreen === "my-cases") {
    document.getElementById("my-cases-screen").classList.add("active");
    showMyCases(); // Refresh the list
  } else if (returnScreen === "results") {
    document.getElementById("results-screen").classList.add("active");
  } else if (returnScreen === "treatment-detail") {
    document.getElementById("treatment-detail-screen").classList.add("active");
  } else {
    document.getElementById("gallery-toc").classList.add("active");
    // Refresh gallery to show updated indicators - use existing filtered cases
    const currentFilter =
      document.querySelector(".filter-button.active")?.dataset.filter || "all";
    filterCases(currentFilter);
  }
}

// Show My Goals screen (formerly My Cases)
async function showMyCases() {
  // Hide all screens
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Scroll to top
  scrollToTop();

  // Show my goals screen
  document.getElementById("my-cases-screen").classList.add("active");

  // Update floating CTA
  updateFloatingCTA();

  // Wait for prevalence data to load (non-blocking, with timeout)
  await waitForPrevalenceData(1000);

  // Get issues that are in goals
  const goalIssues = getGoalIssues();

  // Get user's overall goals for messaging
  const userGoals = userSelections.overallGoals || [];
  const goalsText =
    userGoals.length > 0
      ? userGoals
          .map((g) => {
            const goalLabels = {
              "facial-balancing": "Facial Balancing",
              "anti-aging": "Anti-Aging",
              "skin-rejuvenation": "Skin Rejuvenation",
              "natural-look": "Natural Look",
            };
            return goalLabels[g] || g;
          })
          .join(", ")
      : "your aesthetic goals";

  const content = document.getElementById("my-cases-content");
  content.innerHTML = `
        <div class="my-cases-sections">
            <div class="my-cases-section">
                <div class="my-cases-section-header">
                    <h2 class="my-cases-section-title">
                        ${getIconSVG("star", 20)}
                        <span>My Goals</span>
                        <span class="case-count">${goalIssues.length}</span>
                    </h2>
                </div>
                ${
                  goalIssues.length === 0
                    ? '<p class="empty-state">You haven\'t added any goals yet. Click "Add to Goals" on any concern to add it here.</p>'
                    : `
                    <div class="my-cases-list">
                        ${goalIssues
                          .map((issueName) => createMyGoalCard(issueName))
                          .join("")}
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="summary-consultation-section" style="margin-top: 32px; padding: 24px; background: linear-gradient(135deg, #ffd291 0%, #fff3e0 100%); border-radius: 12px;">
            <h3 class="summary-section-title" style="margin: 0 0 8px 0; font-size: 18px;">Ready for Your In-Clinic Consultation?</h3>
            <p class="summary-section-description" style="margin: 0 0 16px 0; color: #424242;">Get personalized treatment recommendations based on your goals.</p>
            <button class="pitch-cta-button" onclick="requestConsultation()">Book Consultation</button>
        </div>
    `;
}

function createMyGoalCard(issueName) {
  const displayName = issueName; // Use actual issue name
  const category = getIssueCategory(issueName);

  // Get prevalence information
  const userAge = userSelections.age;
  const prevalenceDesc = getPrevalenceDescription(issueName, userAge);

  // Get a preview case for this issue
  const matchingCases = getMatchingCasesForItem({
    type: "issue",
    name: issueName,
  });
  const previewCase = matchingCases.length > 0 ? matchingCases[0] : null;
  const thumbnailUrl =
    previewCase?.thumbnail ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23FFD291'/%3E%3C/svg%3E";

  return `
        <div class="my-case-card">
            <img src="${thumbnailUrl}" alt="${displayName}" class="my-case-thumbnail" onclick="showIssueOverviewFromSummary('${issueName.replace(
    /'/g,
    "\\'"
  )}')" style="cursor: pointer;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'%3E%3Crect width=\\'100\\' height=\\'100\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
            <div class="my-case-content" onclick="showIssueOverviewFromSummary('${issueName.replace(
              /'/g,
              "\\'"
            )}')" style="cursor: pointer; flex: 1;">
                <div class="my-case-modality" style="margin-bottom: 4px;">
                    <span style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
                </div>
                <h3 class="my-case-title">${displayName}</h3>
                ${
                  prevalenceDesc
                    ? `<p class="my-case-prevalence" style="font-size: 13px; color: #424242; margin-top: 4px; line-height: 1.4;">${escapeHtmlPreserveStrong(
                        prevalenceDesc
                      )}</p>`
                    : ""
                }
            </div>
            <button class="delete-goal-button" onclick="event.stopPropagation(); removeGoalFromList('${issueName.replace(
              /'/g,
              "\\'"
            )}')" title="Remove from Goals">
                ${getIconSVG("x", 16)}
            </button>
            <div class="my-case-arrow" onclick="showIssueOverviewFromSummary('${issueName.replace(
              /'/g,
              "\\'"
            )}')" style="cursor: pointer;">${getIconSVG("arrowRight", 16)}</div>
        </div>
    `;
}

let pendingRemoveGoal = null;

function removeGoalFromList(issueName) {
  pendingRemoveGoal = issueName;
  const modal = document.getElementById("remove-goal-modal");
  const goalNameElement = document.getElementById("remove-goal-name");

  if (modal && goalNameElement) {
    goalNameElement.textContent = issueName;
    modal.classList.add("active");
  }
}

function confirmRemoveGoal() {
  if (pendingRemoveGoal) {
    const issueName = pendingRemoveGoal;
    const wasOnIssueOverview = currentIssueOverview === issueName;

    removeIssueFromGoals(issueName);
    closeRemoveGoalModal();

    // If we were viewing the issue overview for the removed goal, navigate back
    if (wasOnIssueOverview) {
      // Clear the current issue overview tracking
      currentIssueOverview = null;
      issueOverviewReturnScreen = null;
      // Navigate back to My Goals screen
      showMyCases();
    } else {
      // Otherwise, just refresh the My Goals screen if it's active
      const myGoalsScreen = document.getElementById("my-cases-screen");
      if (myGoalsScreen && myGoalsScreen.classList.contains("active")) {
        showMyCases();
      }
    }
  }
}

function closeRemoveGoalModal() {
  const modal = document.getElementById("remove-goal-modal");
  if (modal) {
    modal.classList.remove("active");
    pendingRemoveGoal = null;
  }
}

function createMyCaseCard(caseItem, type) {
  const modality = getTreatmentModality(caseItem.name);
  const treatmentName = extractTreatmentName(caseItem.name);
  const isRead = isCaseRead(caseItem.id);
  const inGoals = isCaseInGoals(caseItem.id);

  return `
        <div class="my-case-card" onclick="showCaseDetailFromMyCases('${
          caseItem.id
        }')">
            <img src="${caseItem.thumbnail}" alt="${
    caseItem.name
  }" class="my-case-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'%3E%3Crect width=\\'100\\' height=\\'100\\' fill=\\'%23FFD291\\'/%3E%3C/svg%3E'">
            <div class="my-case-content">
                <h3 class="my-case-title">${treatmentName}</h3>
                <div class="my-case-modality">
                    <span class="modality-icon">${modality.icon}</span>
                    <span>${modality.name}</span>
                </div>
                ${
                  caseItem.headline
                    ? `<p class="my-case-headline">${escapeHtml(
                        caseItem.headline
                      )}</p>`
                    : ""
                }
            </div>
            <div class="my-case-indicators">
                ${
                  isRead
                    ? `<span class="case-indicator read-indicator" title="Viewed">${getIconSVG(
                        "check",
                        14
                      )}</span>`
                    : ""
                }
                ${
                  inGoals
                    ? `<span class="case-indicator goal-indicator" title="Liked">${getIconSVG(
                        "star",
                        14
                      )}</span>`
                    : ""
                }
            </div>
            <div class="my-case-arrow">${getIconSVG("arrowRight", 16)}</div>
        </div>
    `;
}

function showCaseDetailFromMyCases(caseId) {
  const caseItem = caseData.find((c) => c.id === caseId);
  if (caseItem) {
    caseDetailReturnScreen = "my-cases";
    showCaseDetail(caseItem, "my-cases");
  }
}

function closeMyCases() {
  document.getElementById("my-cases-screen").classList.remove("active");

  // Always return to the "Your Aesthetic Concerns" page (issue detail screen showing the list)
  // Clear any issue overview state to ensure we show the list, not an individual issue
  currentIssueOverview = null;
  issueOverviewReturnScreen = null;

  // Show the issue detail screen (which will show the concerns list)
  showIssueDetailScreen();
}

// Goal details for explainer modal
const goalDetails = {
  "facial-balancing": {
    title: "Facial Balancing",
    subtitle: "Harmony through proportion",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    description:
      "Facial balancing focuses on creating symmetry and harmonious proportions between your facial features. This might include enhancing cheekbones that appear flat, defining a soft jawline, or correcting asymmetry in the chin or brows. The goal is a naturally balanced appearance where all features work together beautifully.",
    concerns: [
      "Ill-Defined Jawline",
      "Cheekbone - Not Prominent",
      "Asymmetric Chin",
      "Retruded Chin",
      "Brow Asymmetry",
    ],
    treatments: [
      "Dermal Fillers",
      "Jawline Contouring",
      "Chin Augmentation",
      "Cheek Enhancement",
    ],
  },
  "anti-aging": {
    title: "Anti-Aging",
    subtitle: "Turn back the clock",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`,
    description:
      "Anti-aging treatments address the visible signs of aging like wrinkles, fine lines, volume loss, and skin laxity. From smoothing forehead lines and crow's feet to restoring lost cheek volume and tightening the neck, these treatments help you look as youthful as you feel.",
    concerns: [
      "Forehead Wrinkles",
      "Crow's Feet Wrinkles",
      "Nasolabial Folds",
      "Under Eye Hollow",
      "Jowls",
      "Neck Lines",
    ],
    treatments: [
      "BOTOX/Dysport",
      "Dermal Fillers",
      "Skin Tightening",
      "Microneedling",
      "Chemical Peels",
    ],
  },
  "skin-rejuvenation": {
    title: "Skin Rejuvenation",
    subtitle: "Reveal your best skin",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    description:
      "Skin rejuvenation improves the overall quality, texture, and appearance of your skin. This includes addressing uneven tone, dark spots, acne scars, redness, and dullness. The result is clearer, smoother, more radiant skin that glows from within.",
    concerns: [
      "Dark Spots",
      "Red Spots",
      "Scars",
      "Crepey Skin",
      "Rosacea",
      "Dry Skin",
      "Blackheads",
    ],
    treatments: [
      "Laser Treatments",
      "Chemical Peels",
      "Microneedling",
      "HydraFacial",
      "IPL Therapy",
    ],
  },
  "natural-look": {
    title: "Natural Look",
    subtitle: "Enhance, don't change",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    description:
      'The natural look philosophy is about subtle enhancement—looking refreshed and like the best version of yourself, not like you\'ve had "work done." These treatments restore what time has taken away without overcorrecting, maintaining your unique features while enhancing your natural beauty.',
    concerns: [
      "Mid Cheek Flattening",
      "Thin Lips",
      "Under Eye Hollow",
      "Lower Cheeks - Volume Depletion",
    ],
    treatments: [
      "Conservative Fillers",
      "Preventative BOTOX",
      "Skin Boosters",
      "PRP Therapy",
    ],
  },
};

// Show goals explainer modal
function showGoalsExplainer() {
  const modal = document.getElementById("goals-explainer-modal");
  const cardsContainer = document.getElementById("goal-explainer-cards");

  if (!modal || !cardsContainer) return;

  // Generate cards for each goal
  let cardsHtml = "";

  Object.entries(goalDetails).forEach(([goalId, goal]) => {
    // Find example cases for this goal - search more broadly
    const exampleImages = [];

    if (caseData && caseData.length > 0) {
      // First try exact matches
      for (const issue of goal.concerns) {
        if (exampleImages.length >= 3) break;

        const matchingCase = caseData.find(
          (c) =>
            c.solvedIssues &&
            c.solvedIssues.some(
              (solved) =>
                solved.toLowerCase().includes(issue.toLowerCase()) ||
                issue.toLowerCase().includes(solved.toLowerCase())
            ) &&
            c.thumbnail &&
            !exampleImages.find((e) => e.id === c.id)
        );

        if (matchingCase) {
          exampleImages.push(matchingCase);
        }
      }

      // If still need more, search by partial match on case name
      if (exampleImages.length < 3) {
        const keywords = {
          "facial-balancing": [
            "jawline",
            "chin",
            "cheek",
            "contour",
            "asymmetr",
          ],
          "anti-aging": [
            "wrinkle",
            "line",
            "hollow",
            "volume",
            "lift",
            "tighten",
          ],
          "skin-rejuvenation": [
            "spot",
            "scar",
            "texture",
            "skin",
            "tone",
            "laser",
          ],
          "natural-look": ["subtle", "refresh", "natural", "lip", "filler"],
        };

        const searchTerms = keywords[goalId] || [];
        for (const c of caseData) {
          if (exampleImages.length >= 3) break;
          if (!c.thumbnail || exampleImages.find((e) => e.id === c.id))
            continue;

          const nameLower = (c.name || "").toLowerCase();
          if (searchTerms.some((term) => nameLower.includes(term))) {
            exampleImages.push(c);
          }
        }
      }
    }

    cardsHtml += `
      <div class="goal-explainer-card">
        <div class="goal-explainer-header">
          <div class="goal-explainer-icon">${goal.icon}</div>
          <div class="goal-explainer-title-area">
            <h3 class="goal-explainer-title">${goal.title}</h3>
            <p class="goal-explainer-subtitle">${goal.subtitle}</p>
          </div>
        </div>
        <div class="goal-explainer-body">
          <p class="goal-explainer-description">${goal.description}</p>
          ${
            exampleImages.length > 0
              ? `
            <div class="goal-explainer-examples">
              <div class="goal-explainer-examples-label">Real Patient Results</div>
              <div class="goal-explainer-example-images">
                ${exampleImages
                  .map(
                    (c) =>
                      `<img src="${c.thumbnail}" alt="${c.name}" class="goal-explainer-example-image" onerror="this.parentElement.style.display='none'">`
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          <div class="goal-explainer-examples" style="margin-top: 12px;">
            <div class="goal-explainer-examples-label">Common Treatments</div>
            <div class="goal-explainer-treatments">
              ${goal.treatments
                .map(
                  (t) =>
                    `<span class="goal-explainer-treatment-tag">${t}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  cardsContainer.innerHTML = cardsHtml;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close goals explainer modal
function closeGoalsExplainer() {
  const modal = document.getElementById("goals-explainer-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Expose to window
window.showGoalsExplainer = showGoalsExplainer;
window.closeGoalsExplainer = closeGoalsExplainer;

// Populate goal cards with example case photos
function populateGoalCardImages() {
  if (!caseData || caseData.length === 0) {
    console.log("No case data available for goal images");
    return;
  }

  // Map goals to issues that represent them well
  const goalExampleIssues = {
    "facial-balancing": [
      "Ill-Defined Jawline",
      "Cheekbone - Not Prominent",
      "Asymmetric Chin",
      "Retruded Chin",
    ],
    "anti-aging": [
      "Forehead Wrinkles",
      "Nasolabial Folds",
      "Under Eye Hollow",
      "Crow's Feet Wrinkles",
    ],
    "skin-rejuvenation": [
      "Dark Spots",
      "Crepey Skin",
      "Scars",
      "Under Eye Dark Circles",
    ],
    "natural-look": [
      "Mid Cheek Flattening",
      "Lower Cheeks - Volume Depletion",
      "Thin Lips",
      "Under Eye Hollow",
    ],
  };

  Object.entries(goalExampleIssues).forEach(([goalId, issues]) => {
    const imageContainer = document.getElementById(`goal-image-${goalId}`);
    if (!imageContainer) return;

    // Find a case that matches one of the example issues
    for (const issue of issues) {
      const matchingCase = caseData.find(
        (c) => c.solvedIssues && c.solvedIssues.includes(issue) && c.thumbnail
      );

      if (matchingCase) {
        imageContainer.classList.add("has-image");
        const img = document.createElement("img");
        img.src = matchingCase.thumbnail;
        img.alt = `Example: ${issue}`;
        img.onerror = function () {
          imageContainer.classList.remove("has-image");
          this.remove();
        };
        imageContainer.appendChild(img);
        break;
      }
    }
  });

  console.log("📷 Goal card images populated");
}

// Initialize app on load
document.addEventListener("DOMContentLoaded", async function () {
  console.log("App initializing...");
  console.log("Using Airtable REST API (no library required)");

  // Load prevalence data (non-blocking)
  loadPrevalenceData();

  // Load cases directly using REST API
  await loadCasesFromAirtable();

  // Populate goal cards with example images
  populateGoalCardImages();

  // Initialize top right buttons icon
  const myCasesButton = document.querySelector(".my-cases-button .button-icon");
  if (myCasesButton) {
    myCasesButton.innerHTML = getIconSVG("star", 18);
  }

  // Hide top-right buttons initially (they'll show after form submission)
  const topRightButtons = document.getElementById("top-right-buttons");
  if (topRightButtons) {
    topRightButtons.classList.remove("visible");
  }

  // Set up global event delegation for age input error clearing
  // This ensures it works regardless of when the element is created
  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "patient-age") {
      const ageValue = parseInt(e.target.value);
      if (ageValue && ageValue >= 18) {
        hideInputError(e.target);
        e.target.classList.remove("input-error");
      }
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "patient-age") {
      const ageValue = parseInt(e.target.value);
      if (ageValue && ageValue >= 18) {
        hideInputError(e.target);
        e.target.classList.remove("input-error");
      }
    }

    // Clear skin type error when selected
    if (e.target && e.target.name === "skin-type" && e.target.checked) {
      // Find the section containing this input
      const skinTypeSection = e.target.closest(".demographic-section");
      if (skinTypeSection) {
        const errorMsg = skinTypeSection.querySelector(".input-error-message");
        if (errorMsg) errorMsg.remove();
      }
    }

    // Clear skin tone error when selected
    if (e.target && e.target.name === "skin-tone" && e.target.checked) {
      // Find the section containing this input
      const skinToneSection = e.target.closest(".demographic-section");
      if (skinToneSection) {
        const errorMsg = skinToneSection.querySelector(".input-error-message");
        if (errorMsg) errorMsg.remove();
      }
    }

    // Sun response is now optional - no need to clear errors
  });

  // ========================================================================
  // SET UP NAVIGATION EVENT LISTENERS (after DOM is ready)
  // ========================================================================

  // Start button on home screen
  const startButton = document.getElementById("start-button");
  if (startButton) {
    startButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Start button clicked");
      startForm();
    });
    console.log("✓ Start button listener attached");
  } else {
    console.warn("Start button not found");
  }

  // Proceed to goals button on concerns screen
  const proceedBtn = document.getElementById("proceed-to-goals-btn");
  if (proceedBtn) {
    proceedBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Proceed to goals button clicked");
      proceedToGoalsAndAge();
    });
    console.log("✓ Proceed button listener attached");
  } else {
    console.warn("Proceed button not found");
  }
});

// Export all cases to markdown format for Notion
function exportCasesToMarkdown() {
  if (!caseData || caseData.length === 0) {
    console.warn("No case data available. Make sure cases are loaded first.");
    return "No cases available to export.";
  }

  let markdown = "# Aesthetic Cases Catalog\n\n";
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += `Total Cases: ${caseData.length}\n\n`;
  markdown += "---\n\n";

  // Track which cases have been included to avoid duplicates
  const includedCaseIds = new Set();

  // Organize by Area > Issue > Cases
  for (const [area, issues] of Object.entries(areasAndIssues)) {
    markdown += `## ${area}\n\n`;

    for (const issue of issues) {
      const matchingCases = getLenientMatchingCasesForIssue(issue);

      if (matchingCases.length > 0) {
        markdown += `### ${issue}\n\n`;

        for (const caseItem of matchingCases) {
          // Skip if already included (cases can match multiple issues)
          if (includedCaseIds.has(caseItem.id)) {
            continue;
          }
          includedCaseIds.add(caseItem.id);

          markdown += `#### ${caseItem.headline || caseItem.name}\n\n`;

          // Patient info
          if (caseItem.patient) {
            markdown += `**Patient:** ${caseItem.patient}\n\n`;
          }

          // Images
          if (
            caseItem.beforeAfter &&
            !caseItem.beforeAfter.includes("data:image/svg")
          ) {
            markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
          } else if (
            caseItem.thumbnail &&
            !caseItem.thumbnail.includes("data:image/svg")
          ) {
            markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
          }

          // Story
          if (caseItem.story) {
            markdown += `**Story:**\n\n${caseItem.story}\n\n`;
          }

          // Solved issues
          if (caseItem.solved && caseItem.solved.length > 0) {
            markdown += `**This Solved:**\n\n`;
            caseItem.solved.forEach((issue) => {
              markdown += `- ${issue}\n`;
            });
            markdown += `\n`;
          }

          // Treatment details
          if (caseItem.treatment) {
            markdown += `**Treatment Details:**\n\n${caseItem.treatment}\n\n`;
          }

          // Treatment name
          if (caseItem.name) {
            markdown += `**Treatment:** ${caseItem.name}\n\n`;
          }

          // Matching criteria
          if (
            caseItem.matchingCriteria &&
            caseItem.matchingCriteria.length > 0
          ) {
            markdown += `**Matching Criteria:** ${caseItem.matchingCriteria.join(
              ", "
            )}\n\n`;
          }

          markdown += "---\n\n";
        }
      }
    }
  }

  // Add cases that didn't match any specific issue
  const unmatchedCases = caseData.filter((c) => !includedCaseIds.has(c.id));
  if (unmatchedCases.length > 0) {
    markdown += `## Other Cases\n\n`;
    markdown += `*Cases that don't match specific issues*\n\n`;

    for (const caseItem of unmatchedCases) {
      markdown += `### ${caseItem.headline || caseItem.name}\n\n`;

      if (caseItem.patient) {
        markdown += `**Patient:** ${caseItem.patient}\n\n`;
      }

      if (
        caseItem.beforeAfter &&
        !caseItem.beforeAfter.includes("data:image/svg")
      ) {
        markdown += `![Before and After](${caseItem.beforeAfter})\n\n`;
      } else if (
        caseItem.thumbnail &&
        !caseItem.thumbnail.includes("data:image/svg")
      ) {
        markdown += `![Case Image](${caseItem.thumbnail})\n\n`;
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

      markdown += "---\n\n";
    }
  }

  return markdown;
}

// Make it accessible globally
window.exportCasesToMarkdown = exportCasesToMarkdown;

// Helper function to download markdown as file
function downloadMarkdown() {
  const markdown = exportCasesToMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aesthetic-cases-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("Markdown file downloaded!");
}

window.downloadMarkdown = downloadMarkdown;

// Helper function to copy markdown to clipboard
async function copyMarkdownToClipboard() {
  try {
    const markdown = exportCasesToMarkdown();
    await navigator.clipboard.writeText(markdown);
    console.log(
      "Markdown copied to clipboard! You can now paste it into Notion."
    );
    alert("Markdown copied to clipboard! You can now paste it into Notion.");
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    alert("Failed to copy to clipboard. Use downloadMarkdown() instead.");
  }
}

window.copyMarkdownToClipboard = copyMarkdownToClipboard;

// ============================================================================
// DISCOUNT DISPLAY & REDEMPTION FUNCTIONS
// ============================================================================

/**
 * Update discount displays throughout the app
 */
function updateDiscountDisplays() {
  const discount = getPersonalizedDiscount();

  // Update teaser discount badge
  const teaserBadge = document.getElementById("teaser-discount-badge");
  if (teaserBadge) {
    const amountEl = teaserBadge.querySelector(".discount-amount");
    if (amountEl) {
      amountEl.textContent = `$${discount.amount} OFF`;
    }
  }

  // Update onboarding discount
  const onboardingAmount = document.getElementById(
    "onboarding-discount-amount"
  );
  const onboardingDesc = document.getElementById("onboarding-discount-desc");
  const onboardingScarcity = document.getElementById(
    "onboarding-discount-scarcity"
  );

  if (onboardingAmount)
    onboardingAmount.textContent = `$${discount.amount} OFF`;
  if (onboardingDesc) onboardingDesc.textContent = discount.description;
  if (onboardingScarcity) onboardingScarcity.textContent = discount.scarcity;

  // Update gallery discount
  const galleryAmount = document.getElementById("gallery-discount-amount");
  const galleryText = document.getElementById("gallery-discount-text");

  if (galleryAmount) galleryAmount.textContent = `$${discount.amount} OFF`;
  if (galleryText) galleryText.textContent = discount.description.toLowerCase();
}

/**
 * Show discount details modal
 */
function showDiscountDetails() {
  const discount = getPersonalizedDiscount();
  const modal = document.getElementById("discount-details-modal");
  const content = document.getElementById("discount-modal-content");

  if (!modal || !content) return;

  const isRedeemed = isDiscountRedeemed(discount.id);
  const discountCode = getDiscountCode(discount.id);

  content.innerHTML = `
    <div class="discount-modal-display">
      <div class="discount-modal-badge">
        <span class="discount-modal-icon">${getIconSVG("gift", 16)}</span>
        <div class="discount-modal-amount">$${discount.amount} OFF</div>
        <div class="discount-modal-label">${discount.description}</div>
      </div>
      
      <div class="discount-modal-details">
        <p class="discount-modal-scarcity">
          <strong>${discount.scarcity}</strong>
        </p>
        <p class="discount-modal-info">
          This personalized offer is available for your consultation. 
          ${
            discount.applicableTo.includes("consultation")
              ? "Apply this discount when you book your appointment."
              : "This discount applies to qualifying treatments."
          }
        </p>
        
        ${
          isRedeemed
            ? `
          <div class="discount-redeemed-badge">
            <span>✓</span> Discount Redeemed
          </div>
          <div class="discount-code-display">
            <label>Your Discount Code:</label>
            <div class="discount-code-value">${discountCode}</div>
            <p class="discount-code-note">Use this code when booking your consultation</p>
          </div>
        `
            : `
          <div class="discount-code-display">
            <label>Your Discount Code:</label>
            <div class="discount-code-value">${discountCode}</div>
            <p class="discount-code-note">Save this code to use when booking</p>
          </div>
        `
        }
      </div>
      
      <div class="discount-modal-actions">
        ${
          !isRedeemed
            ? `
          <button class="modal-submit-button" onclick="redeemDiscountNow('${discount.id}')">
            Redeem & Book Consultation
          </button>
        `
            : `
          <button class="modal-submit-button" onclick="closeDiscountModal(); requestConsultation();">
            Book Consultation
          </button>
        `
        }
        <button class="modal-cancel-button" onclick="closeDiscountModal()">
          Close
        </button>
      </div>
    </div>
  `;

  modal.classList.add("active");
  trackEvent("discount_viewed", {
    discountId: discount.id,
    amount: discount.amount,
  });
}

/**
 * Redeem discount and proceed to booking
 */
function redeemDiscountNow(discountId) {
  const redeemed = redeemDiscount(discountId);
  if (redeemed) {
    closeDiscountModal();
    requestConsultation();
    trackEvent("discount_redeemed_and_booking_started", { discountId });
  } else {
    // Already redeemed, just proceed
    closeDiscountModal();
    requestConsultation();
  }
}

function redeemDiscountInline(discountId, buttonElement) {
  const redeemed = redeemDiscount(discountId);
  if (redeemed) {
    // Get the discount info
    const discount = getPersonalizedDiscount();
    if (discount && discount.id === discountId) {
      const discountCode = getDiscountCode(discountId);
      const discountSection = buttonElement.closest(
        ".consultation-discount-inline-compact"
      );
      const discountText = discountSection.querySelector(
        ".consultation-discount-text-inline"
      );

      // Update the text to include the code
      discountText.innerHTML = `<strong>$${discount.amount} OFF</strong> ${discount.description} • Code: <code>${discountCode}</code>`;

      // Hide the button
      buttonElement.style.display = "none";

      // Add a subtle animation
      discountSection.style.transition = "all 0.3s ease";
      discountSection.style.background =
        "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)";
      discountSection.style.borderColor = "#4caf50";

      trackEvent("discount_redeemed_inline", { discountId });
    }
  }
}

/**
 * Close discount modal
 */
function closeDiscountModal() {
  const modal = document.getElementById("discount-details-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

/**
 * Get discount badge HTML for case cards
 */
function getDiscountBadgeHTML(caseItem) {
  const discount = getCaseDiscount(caseItem);
  if (!discount) return "";

  // Only show discount if treatment qualifies
  const treatmentName = (caseItem.name || "").toLowerCase();
  const qualifies =
    discount.applicableTo.some((term) =>
      treatmentName.includes(term.toLowerCase())
    ) || discount.applicableTo.includes("consultation");

  if (!qualifies) return "";

  return `
    <div class="case-discount-badge" onclick="event.stopPropagation(); showDiscountDetails()">
      <span class="case-discount-icon">${getIconSVG("gift", 16)}</span>
      <span class="case-discount-amount">$${discount.amount} OFF</span>
    </div>
  `;
}

// Make functions globally accessible
window.showDiscountDetails = showDiscountDetails;
window.redeemDiscountNow = redeemDiscountNow;
window.redeemDiscountInline = redeemDiscountInline;
window.closeDiscountModal = closeDiscountModal;

// ============================================================================
// FLOATING CONSULTATION CTA MANAGEMENT
// ============================================================================

/**
 * Update floating CTA visibility based on current screen
 */
function updateFloatingCTA() {
  const floatingCTA = document.getElementById("floating-consultation-cta");
  const resultsCTAFooter = document.getElementById("results-cta-footer");

  // Show on gallery, my cases, and issue detail screens
  // Hide on case detail - we want to show the results-cta-footer instead
  const galleryActive = document
    .getElementById("gallery-toc")
    ?.classList.contains("active");
  const caseDetailActive = document
    .getElementById("case-detail")
    ?.classList.contains("active");
  const myCasesActive = document
    .getElementById("my-cases-screen")
    ?.classList.contains("active");
  const issueDetailActive = document
    .getElementById("issue-detail-screen")
    ?.classList.contains("active");
  const resultsScreenActive = document
    .getElementById("results-screen")
    ?.classList.contains("active");
  const treatmentDetailActive = document
    .getElementById("treatment-detail-screen")
    ?.classList.contains("active");
  const formScreenActive = document
    .getElementById("form-screen")
    ?.classList.contains("active");
  const leadCaptureActive = document
    .getElementById("lead-capture-screen")
    ?.classList.contains("active");
  const homeTeaserActive = document
    .getElementById("home-teaser")
    ?.classList.contains("active");
  const onboardingActive = document
    .getElementById("onboarding")
    ?.classList.contains("active");

  // Show floating CTA on gallery, my cases, and issue detail (but NOT case detail, results screen, or treatment detail)
  if (
    (galleryActive || myCasesActive || issueDetailActive) &&
    !resultsScreenActive &&
    !caseDetailActive &&
    !treatmentDetailActive
  ) {
    if (floatingCTA) floatingCTA.classList.add("visible");
  } else {
    if (floatingCTA) floatingCTA.classList.remove("visible");
  }

  // Show results-cta-footer on case detail screen, treatment detail screen, AND results screen
  // Hide it on all early screens: home teaser, onboarding, form, lead capture
  if (resultsCTAFooter) {
    if (
      (caseDetailActive || treatmentDetailActive || resultsScreenActive) &&
      !formScreenActive &&
      !leadCaptureActive &&
      !homeTeaserActive &&
      !onboardingActive
    ) {
      resultsCTAFooter.style.display = "block";
    } else {
      resultsCTAFooter.style.display = "none";
    }
  }
}

// Monitor screen changes using MutationObserver
let floatingCTASetup = false;
function setupFloatingCTA() {
  if (floatingCTASetup) return;
  floatingCTASetup = true;

  // Observe all screen elements for class changes
  const observer = new MutationObserver(() => {
    updateFloatingCTA();
  });

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const screens = document.querySelectorAll(".screen");
      screens.forEach((screen) => {
        observer.observe(screen, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
      updateFloatingCTA();
    });
  } else {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      observer.observe(screen, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });
    updateFloatingCTA();
  }
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupFloatingCTA();
    updateDiscountDisplays();
  });
} else {
  setupFloatingCTA();
  updateDiscountDisplays();
}

// ============================================================================
// CONCERN MAPPING ANALYSIS
// ============================================================================

/**
 * Analyze concern mapping and generate nested list
 * Run this in browser console: analyzeConcernMapping()
 */
function analyzeConcernMapping() {
  console.log("=== CONCERN MAPPING ANALYSIS ===\n");

  if (!caseData || caseData.length === 0) {
    console.warn(
      "No case data available. Make sure cases are loaded from Airtable."
    );
    return;
  }

  // Extract all unique concerns from case names
  const concernMap = new Map(); // concern -> { cases: [], treatments: Set, categories: Set }

  caseData.forEach((caseItem) => {
    const concern = extractConcernFromCaseName(caseItem.name);
    const treatment = extractTreatmentFromCaseName(caseItem.name);

    if (!concernMap.has(concern)) {
      concernMap.set(concern, {
        cases: [],
        treatments: new Set(),
        categories: new Set(),
      });
    }

    const concernData = concernMap.get(concern);
    concernData.cases.push(caseItem);
    concernData.treatments.add(treatment);

    // Find which high-level categories this concern maps to
    HIGH_LEVEL_CONCERNS.forEach((category) => {
      const caseNameLower = (caseItem.name || "").toLowerCase();
      const matchingCriteriaLower = (caseItem.matchingCriteria || []).map((c) =>
        c.toLowerCase()
      );

      const nameMatch = category.mapsToPhotos.some((keyword) =>
        caseNameLower.includes(keyword.toLowerCase())
      );
      const criteriaMatch = category.mapsToPhotos.some((keyword) =>
        matchingCriteriaLower.some((criteria) =>
          criteria.includes(keyword.toLowerCase())
        )
      );

      if (nameMatch || criteriaMatch) {
        concernData.categories.add(category.name);
      }
    });
  });

  // Group concerns by high-level category
  const categoryMap = new Map();

  HIGH_LEVEL_CONCERNS.forEach((category) => {
    categoryMap.set(category.name, {
      category: category,
      concerns: [],
    });
  });

  concernMap.forEach((data, concern) => {
    // If concern maps to multiple categories, add to all of them
    if (data.categories.size === 0) {
      // Unmapped concern - add to "Uncategorized"
      if (!categoryMap.has("Uncategorized")) {
        categoryMap.set("Uncategorized", {
          category: { name: "Uncategorized", id: "uncategorized" },
          concerns: [],
        });
      }
      categoryMap.get("Uncategorized").concerns.push({
        concern: concern,
        caseCount: data.cases.length,
        treatments: Array.from(data.treatments).sort(),
      });
    } else {
      data.categories.forEach((categoryName) => {
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).concerns.push({
            concern: concern,
            caseCount: data.cases.length,
            treatments: Array.from(data.treatments).sort(),
          });
        }
      });
    }
  });

  // Generate nested list output
  console.log("NESTED CONCERN MAPPING:\n");
  console.log("=".repeat(60));

  categoryMap.forEach((categoryData, categoryName) => {
    if (categoryData.concerns.length === 0) return;

    console.log(`\n📁 ${categoryName}`);
    console.log(
      `   Description: ${categoryData.category.description || "N/A"}`
    );
    console.log(
      `   Maps to Photos: ${
        categoryData.category.mapsToPhotos?.join(", ") || "N/A"
      }`
    );
    console.log(`   Total Concerns: ${categoryData.concerns.length}`);
    console.log("");

    // Sort concerns by case count (descending)
    const sortedConcerns = categoryData.concerns.sort(
      (a, b) => b.caseCount - a.caseCount
    );

    sortedConcerns.forEach(({ concern, caseCount, treatments }) => {
      console.log(`   ├─ ${concern}`);
      console.log(`   │  Cases: ${caseCount}`);
      console.log(`   │  Treatments: ${treatments.join(", ") || "None"}`);

      // Show sample case names
      const sampleCases = concernMap
        .get(concern)
        .cases.slice(0, 3)
        .map((c) => c.name);
      if (sampleCases.length > 0) {
        console.log(`   │  Sample cases:`);
        sampleCases.forEach((caseName) => {
          console.log(`   │    • ${caseName}`);
        });
      }
      console.log("");
    });
  });

  // Summary statistics
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY STATISTICS:\n");
  console.log(`Total Cases Analyzed: ${caseData.length}`);
  console.log(`Unique Concerns Found: ${concernMap.size}`);
  console.log(`High-Level Categories: ${HIGH_LEVEL_CONCERNS.length}`);

  // Find concerns that map to multiple categories
  const multiMapped = Array.from(concernMap.entries())
    .filter(([_, data]) => data.categories.size > 1)
    .map(([concern, data]) => ({
      concern,
      categories: Array.from(data.categories),
      caseCount: data.cases.length,
    }));

  if (multiMapped.length > 0) {
    console.log(
      `\n⚠️  Concerns Mapping to Multiple Categories (${multiMapped.length}):`
    );
    multiMapped.forEach(({ concern, categories, caseCount }) => {
      console.log(
        `   • ${concern} (${caseCount} cases) → ${categories.join(", ")}`
      );
    });
  }

  // Find unmapped concerns
  const unmapped = Array.from(concernMap.entries())
    .filter(([_, data]) => data.categories.size === 0)
    .map(([concern, data]) => ({
      concern,
      caseCount: data.cases.length,
    }));

  if (unmapped.length > 0) {
    console.log(`\n⚠️  Unmapped Concerns (${unmapped.length}):`);
    unmapped.forEach(({ concern, caseCount }) => {
      console.log(`   • ${concern} (${caseCount} cases)`);
    });
  }

  // Find concerns with body parts as treatments
  const bodyPartIssues = Array.from(concernMap.entries())
    .filter(([_, data]) => {
      return Array.from(data.treatments).some(
        (t) => BODY_PARTS.has(t.toLowerCase()) || t === "General Treatment"
      );
    })
    .map(([concern, data]) => ({
      concern,
      problematicTreatments: Array.from(data.treatments).filter(
        (t) => BODY_PARTS.has(t.toLowerCase()) || t === "General Treatment"
      ),
      caseCount: data.cases.length,
    }));

  if (bodyPartIssues.length > 0) {
    console.log(
      `\n⚠️  Concerns with Problematic Treatments (${bodyPartIssues.length}):`
    );
    bodyPartIssues.forEach(({ concern, problematicTreatments, caseCount }) => {
      console.log(`   • ${concern} (${caseCount} cases)`);
      console.log(`     Problematic: ${problematicTreatments.join(", ")}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("\nTo run this analysis again, call: analyzeConcernMapping()");
}

// Make analysis function globally accessible
window.analyzeConcernMapping = analyzeConcernMapping;

// Expose CASE_CATEGORY_MAPPING for use by minimalist version
window.CASE_CATEGORY_MAPPING = CASE_CATEGORY_MAPPING;

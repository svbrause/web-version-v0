// Dashboard JavaScript - Connected to Airtable
// Fetches real leads from Airtable, with mock data fallback for demos
// LAKESHORE VERSION - Filters by Lakeshore provider

// Airtable Configuration (same as app.js)
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
} else {
  // Log key info for debugging (first 10 chars only for security)
  console.log('✅ AIRTABLE_API_KEY loaded:', AIRTABLE_API_KEY.substring(0, 10) + '...' + AIRTABLE_API_KEY.substring(AIRTABLE_API_KEY.length - 5));
  console.log('✅ AIRTABLE_BASE_ID:', AIRTABLE_BASE_ID);
}

const LEADS_TABLE_NAME = "Web Popup Leads";
const LEADS_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  LEADS_TABLE_NAME
)}`;

// Provider filter - Lakeshore provider ID
const PROVIDER_ID = 'rec3oXyrb1t6YUvoe'; // Lakeshore

// Areas and Issues mapping for grouping issues by area
const areasAndIssues = {
  Forehead: [
    "Forehead Wrinkles", "Glabella Wrinkles", "Brow Asymmetry", "Flat Forehead",
    "Brow Ptosis", "Temporal Hollow"
  ],
  Eyes: [
    "Crow's Feet Wrinkles", "Under Eye Wrinkles", "Under Eye Dark Circles",
    "Excess Upper Eyelid Skin", "Lower Eyelid - Excess Skin", "Upper Eyelid Droop",
    "Lower Eyelid Sag", "Lower Eyelid Bags", "Under Eye Hollow", "Upper Eye Hollow"
  ],
  Cheeks: [
    "Mid Cheek Flattening", "Cheekbone - Not Prominent", "Heavy Lateral Cheek",
    "Lower Cheeks - Volume Depletion"
  ],
  Nose: ["Crooked Nose", "Droopy Tip", "Dorsal Hump", "Tip Droop When Smiling"],
  Lips: [
    "Thin Lips", "Lacking Philtral Column", "Long Philtral Column", "Gummy Smile",
    "Asymmetric Lips", "Dry Lips", "Lip Thinning When Smiling"
  ],
  "Chin/Jaw": [
    "Retruded Chin", "Over-Projected Chin", "Asymmetric Chin", "Jowls",
    "Ill-Defined Jawline", "Asymmetric Jawline", "Masseter Hypertrophy", "Prejowl Sulcus"
  ],
  Neck: [
    "Neck Lines", "Loose Neck Skin", "Platysmal Bands", "Excess/Submental Fullness"
  ],
  Skin: [
    "Dark Spots", "Red Spots", "Scars", "Dry Skin", "Whiteheads", "Blackheads",
    "Crepey Skin", "Nasolabial Folds", "Marionette Lines", "Bunny Lines", "Perioral Wrinkles"
  ],
  Body: ["Unwanted Hair", "Stubborn Fat"]
};

// Facial Analysis Configuration
const JOTFORM_URL = 'https://app.ponce.ai/face/lakeshore-clinic'; // Update with your actual Jotform URL
const TELEHEALTH_LINK = 'https://your-telehealth-link.com'; // Update with your telehealth link

// Demo mode flag - set to true to use mock data instead of Airtable
const USE_MOCK_DATA = false; // Change to true for demo-only mode

// Mock data - realistic patient leads that tell a story (used when USE_MOCK_DATA = true or Airtable fails)
const MOCK_LEADS = [
  // NEW LEADS - Hot prospects just came in
  {
    id: "lead_001",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@gmail.com",
    phone: "(512) 555-0142",
    age: 42,
    goals: ["Anti-Aging", "Skin Rejuvenation"],
    concerns: ["Under Eye Wrinkles", "Forehead Lines", "Loss of Volume"],
    aestheticGoals: "I want to look refreshed and well-rested without looking 'done'. Would love to reduce these forehead lines.",
    photosLiked: 5,
    photosViewed: 12,
    treatmentsViewed: ["Botox", "Dermal Fillers", "Chemical Peel"],
    source: "AI Consult",
    status: "new",
    priority: "hot",
    createdAt: getRelativeDate(0, 2), // 2 hours ago
    notes: ""
  },
  {
    id: "lead_002",
    name: "Jennifer Park",
    email: "jen.park@outlook.com",
    phone: "(512) 555-0198",
    age: 35,
    goals: ["Facial Balancing", "Natural Look"],
    concerns: ["Thin Lips", "Weak Chin"],
    aestheticGoals: "Interested in subtle lip enhancement and maybe chin filler. Want to keep it very natural.",
    photosLiked: 8,
    photosViewed: 15,
    treatmentsViewed: ["Lip Fillers", "Chin Filler", "Jawline Contouring"],
    source: "AI Consult",
    status: "new",
    priority: "hot",
    createdAt: getRelativeDate(0, 5), // 5 hours ago
    notes: ""
  },
  {
    id: "lead_003",
    name: "Amanda Torres",
    email: "amanda.t@yahoo.com",
    phone: "(512) 555-0234",
    age: 28,
    goals: ["Skin Rejuvenation"],
    concerns: ["Acne Scars", "Uneven Skin Tone"],
    aestheticGoals: "I've struggled with acne scars for years. Looking for something that actually works.",
    photosLiked: 3,
    photosViewed: 8,
    treatmentsViewed: ["Microneedling", "Chemical Peel", "Laser Resurfacing"],
    source: "AI Consult",
    status: "new",
    priority: "medium",
    createdAt: getRelativeDate(1, 0), // Yesterday
    notes: ""
  },
  {
    id: "lead_004",
    name: "Michelle Wong",
    email: "m.wong@gmail.com",
    phone: "(512) 555-0167",
    age: 51,
    goals: ["Anti-Aging", "Facial Balancing"],
    concerns: ["Jowls", "Neck Laxity", "Nasolabial Folds"],
    aestheticGoals: "Everything is starting to sag. I want to look like myself 10 years ago.",
    photosLiked: 6,
    photosViewed: 20,
    treatmentsViewed: ["Thread Lift", "Dermal Fillers", "Morpheus8", "Ultherapy"],
    source: "AI Consult",
    status: "new",
    priority: "hot",
    createdAt: getRelativeDate(1, 3), // Yesterday
    notes: ""
  },

  // CONTACTED - In active conversation
  {
    id: "lead_005",
    name: "Rachel Green",
    email: "rachel.green@email.com",
    phone: "(512) 555-0189",
    age: 38,
    goals: ["Anti-Aging", "Natural Look"],
    concerns: ["Crow's Feet", "Forehead Lines", "Frown Lines"],
    aestheticGoals: "First time considering injectables. Very nervous but want to try Botox.",
    photosLiked: 4,
    photosViewed: 18,
    treatmentsViewed: ["Botox", "Xeomin", "Dysport"],
    source: "AI Consult",
    status: "contacted",
    priority: "medium",
    createdAt: getRelativeDate(2, 0),
    lastContact: getRelativeDate(0, 4),
    notes: "Called today - she's interested but had questions about downtime. Sending her some before/after photos."
  },
  {
    id: "lead_006",
    name: "Lisa Chen",
    email: "lisa.chen@company.com",
    phone: "(512) 555-0223",
    age: 45,
    goals: ["Facial Balancing", "Anti-Aging"],
    concerns: ["Hollow Cheeks", "Under Eye Bags", "Marionette Lines"],
    aestheticGoals: "Looking tired all the time even when I sleep well. Need volume restoration.",
    photosLiked: 7,
    photosViewed: 14,
    treatmentsViewed: ["Cheek Fillers", "Under Eye Filler", "Sculptra"],
    source: "AI Consult",
    status: "contacted",
    priority: "hot",
    createdAt: getRelativeDate(3, 0),
    lastContact: getRelativeDate(0, 8),
    notes: "Very engaged - asked detailed questions about Sculptra vs traditional fillers. Considering a comprehensive treatment plan."
  },
  {
    id: "lead_007",
    name: "Nicole Roberts",
    email: "nicole.r@gmail.com",
    phone: "(512) 555-0156",
    age: 33,
    goals: ["Skin Rejuvenation", "Natural Look"],
    concerns: ["Large Pores", "Sun Damage", "Dull Skin"],
    aestheticGoals: "My skin looks tired and dull. Want that 'glow' everyone talks about.",
    photosLiked: 2,
    photosViewed: 6,
    treatmentsViewed: ["HydraFacial", "Chemical Peel", "IPL"],
    source: "AI Consult",
    status: "contacted",
    priority: "medium",
    createdAt: getRelativeDate(4, 0),
    lastContact: getRelativeDate(1, 0),
    notes: "Interested in a HydraFacial to start. Mentioned she might want to do a series."
  },

  // SCHEDULED - Consultation booked
  {
    id: "lead_008",
    name: "Katherine Moore",
    email: "kate.moore@email.com",
    phone: "(512) 555-0178",
    age: 47,
    goals: ["Anti-Aging", "Facial Balancing"],
    concerns: ["Deep Wrinkles", "Volume Loss", "Skin Laxity"],
    aestheticGoals: "Ready for a full facial rejuvenation. Budget isn't a concern, I want the best results.",
    photosLiked: 12,
    photosViewed: 25,
    treatmentsViewed: ["Botox", "Dermal Fillers", "PDO Threads", "Morpheus8"],
    source: "AI Consult",
    status: "scheduled",
    priority: "hot",
    createdAt: getRelativeDate(5, 0),
    appointmentDate: getRelativeDate(-2, 10), // 2 days from now at 10am
    notes: "VIP lead! Scheduled for comprehensive consultation on Thursday at 10am. Interested in full-face rejuvenation package."
  },
  {
    id: "lead_009",
    name: "Emily Davis",
    email: "emily.d@outlook.com",
    phone: "(512) 555-0145",
    age: 29,
    goals: ["Facial Balancing"],
    concerns: ["Lip Shape", "Facial Asymmetry"],
    aestheticGoals: "Want fuller lips but still natural-looking. Saw some amazing results in the app!",
    photosLiked: 9,
    photosViewed: 11,
    treatmentsViewed: ["Lip Fillers", "Dermal Fillers"],
    source: "AI Consult",
    status: "scheduled",
    priority: "medium",
    createdAt: getRelativeDate(4, 0),
    appointmentDate: getRelativeDate(-3, 14), // 3 days from now at 2pm
    notes: "Consultation Friday at 2pm for lip fillers. Very excited - been researching for months."
  },
  {
    id: "lead_010",
    name: "Jessica Taylor",
    email: "jess.taylor@gmail.com",
    phone: "(512) 555-0212",
    age: 55,
    goals: ["Anti-Aging", "Skin Rejuvenation"],
    concerns: ["Neck Lines", "Chest Wrinkles", "Age Spots"],
    aestheticGoals: "My face looks okay but my neck and chest give away my age. Need help with these areas.",
    photosLiked: 4,
    photosViewed: 9,
    treatmentsViewed: ["Neck Treatment", "IPL", "Laser Resurfacing"],
    source: "AI Consult",
    status: "scheduled",
    priority: "medium",
    createdAt: getRelativeDate(6, 0),
    appointmentDate: getRelativeDate(-5, 11), // 5 days from now
    notes: "Monday consultation at 11am. Focused on neck and décolletage treatment."
  },

  // CONVERTED - Became patients
  {
    id: "lead_011",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(512) 555-0134",
    age: 40,
    goals: ["Anti-Aging", "Natural Look"],
    concerns: ["Forehead Lines", "Frown Lines"],
    aestheticGoals: "Started with the AI consult, loved the recommendations, now I'm hooked!",
    photosLiked: 6,
    photosViewed: 16,
    treatmentsViewed: ["Botox", "Dysport"],
    source: "AI Consult",
    status: "converted",
    priority: "completed",
    createdAt: getRelativeDate(14, 0),
    convertedDate: getRelativeDate(7, 0),
    treatmentReceived: "Botox - Full Face (50 units)",
    revenue: 550,
    notes: "Amazing first visit! Already asking about next treatment. Referred her sister."
  },
  {
    id: "lead_012",
    name: "Christine Adams",
    email: "c.adams@company.com",
    phone: "(512) 555-0167",
    age: 36,
    goals: ["Facial Balancing", "Skin Rejuvenation"],
    concerns: ["Lip Enhancement", "Uneven Skin"],
    aestheticGoals: "Wanted subtle enhancement - got exactly what I was looking for!",
    photosLiked: 5,
    photosViewed: 10,
    treatmentsViewed: ["Lip Fillers", "Chemical Peel"],
    source: "AI Consult",
    status: "converted",
    priority: "completed",
    createdAt: getRelativeDate(10, 0),
    convertedDate: getRelativeDate(5, 0),
    treatmentReceived: "Lip Filler (1 syringe Juvederm)",
    revenue: 650,
    notes: "Thrilled with results. Coming back for skincare treatment next month."
  },
  {
    id: "lead_013",
    name: "Patricia Johnson",
    email: "pjohnson@gmail.com",
    phone: "(512) 555-0189",
    age: 52,
    goals: ["Anti-Aging"],
    concerns: ["Full Face Aging", "Volume Loss"],
    aestheticGoals: "Comprehensive treatment plan - this app helped me understand my options.",
    photosLiked: 15,
    photosViewed: 30,
    treatmentsViewed: ["Botox", "Fillers", "PDO Threads", "Morpheus8"],
    source: "AI Consult",
    status: "converted",
    priority: "completed",
    createdAt: getRelativeDate(21, 0),
    convertedDate: getRelativeDate(14, 0),
    treatmentReceived: "Liquid Facelift Package",
    revenue: 4500,
    notes: "VIP patient now! Started with AI consult, now committed to quarterly treatments. $4,500 initial package."
  }
];

// Global state
let leads = [];
let filteredLeads = [];
let currentView = 'list';
let currentFilter = 'all';
let currentSortField = 'lastContact';
let currentSortOrder = 'desc';
let archivedSortField = 'createdAt';
let archivedSortOrder = 'desc';
let currentLeadId = null;
let isLoading = false;
let facialAnalysisSearchTerm = ''; // Search term for facial analysis view

// Helper to create relative dates
function getRelativeDate(daysAgo, hoursAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI immediately (don't wait for data)
  initNavigation();
  
  // Set initial view to list (All Leads)
  switchView('list');
  
  // Render empty dashboard immediately so page appears instantly
  renderDashboard();
  
  // Load data in the background and update when ready
  loadLeadsFromAirtable().then(() => {
    renderDashboard(); // Re-render with real data
  if (currentView === 'archived') {
    renderArchivedLeads();
  }
  }).catch((error) => {
    console.error("Failed to load from Airtable:", error);
    // Don't use mock data - show empty state instead
    if (!USE_MOCK_DATA) {
      console.log("No leads available - Airtable connection failed");
      leads = [];
      filteredLeads = [];
      renderDashboard();
    }
  });
});

// Theme Management - Lakeshore uses warm theme by default (no toggle needed)
function initTheme() {
  // Lakeshore always uses warm theme, no toggle needed
  // Theme is handled by CSS file
}

function toggleTheme() {
  // No theme toggle for Lakeshore
}

function updateThemeButton(theme) {
  // No theme button for Lakeshore
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      switchView(view);
    });
  });
  
  // Initialize search input handler
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    // Remove old listener if exists
    searchInput.removeEventListener('input', handleSearchInput);
    // Add new listener
    searchInput.addEventListener('input', handleSearchInput);
  }
}

// Handle search input
function handleSearchInput(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  if (currentView === 'facial-analysis') {
    facialAnalysisSearchTerm = searchTerm;
    renderFacialAnalysis();
  } else {
    // Handle search for other views (list, etc.)
    // This would need to be implemented for other views if needed
  }
}

function switchView(view) {
  currentView = view;
  
  // Update nav
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  
  // Update views
  document.querySelectorAll('.kanban-view, .list-view, .analytics-view, .facial-analysis-view, .archived-view').forEach(v => {
    v.classList.remove('active');
  });
  
  // Hide kanban view - redirect to list view instead
  if (view === 'kanban') {
    view = 'list';
    currentView = 'list';
    // Update nav to show list as active
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.view === 'list');
    });
  }
  
  document.getElementById(`${view}-view`).classList.add('active');
  
  // Update title
  const titles = {
    kanban: 'All Leads',
    list: 'All Leads',
    'facial-analysis': 'Facial Analysis',
    analytics: 'Analytics',
    archived: 'Archived Leads'
  };
  document.getElementById('page-title').textContent = titles[view] || view;
  
  // Clear search when switching views
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (view === 'facial-analysis') {
      // Keep search term for facial analysis
    } else {
      searchInput.value = '';
      facialAnalysisSearchTerm = '';
    }
  }
  
  // Render view
  if (view === 'analytics') {
    renderAnalytics();
  } else if (view === 'facial-analysis') {
    renderFacialAnalysis();
  } else if (view === 'archived') {
    renderArchivedLeads();
  } else if (view === 'list') {
    renderList();
  }
}

// Get list of fields to fetch for each table (reduces payload size significantly)
// Only requesting fields that actually exist in the tables
function getFieldsForTable(tableName) {
  if (tableName === "Web Popup Leads") {
    // Fetch all fields from the lead capture form
    return [
      "Name", "Email Address", "Phone Number", "Status", "Contacted", "Archived",
      "Goals", "Concerns", "Aesthetic Goals", "Age Range", "Age", "Source", "Offer Claimed",
      "Skin Type", "Skin Tone", "Ethnic Background", "Areas", 
      "Engagement Level", "Cases Viewed Count", "Total Cases Available", "Concerns Explored"
    ];
  } else if (tableName === "Patients") {
    // Based on actual fields found: Name, Email, Patient Phone Number, Age (from Form Submissions), Status, Contacted
    // Also including interest/concern fields that map to Goals and Concerns
    return [
      "Name", "Email", "Patient Phone Number", "Age (from Form Submissions)",
      "Status", "Contacted", "Photos Viewed", "Interested Photos Viewed",
      "Name (from Interest Items)", "Areas of Interest (from Form Submissions)",
      "Which regions of your face do you want to improve? (from Form Submissions)",
      "What would you like to improve? (from Form Submissions)",
      "Do you have any skin complaints? (from Form Submissions)",
      "Processed Areas of Interest (from Form Submissions)",
      "Name (from All Issues) (from Analyses)",
      "Issues String (from Patient-Issue/Suggestion Mapping) (from Interest Items)",
      "Pending/Opened", "Front Photo", "Archived"
    ];
  }
  return null; // Fetch all fields if table not recognized
}

// Helper function to fetch records from an Airtable table with optional filtering
async function fetchTableRecords(tableName, filterFormula = null) {
  let allRecords = [];
  let offset = null;
  let pageCount = 0;
  const maxPages = 50;
  const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
  const fieldsToFetch = getFieldsForTable(tableName);

  do {
    pageCount++;
    let url = tableUrl;
    const params = new URLSearchParams();
    params.append("pageSize", "100");
    
    // Add server-side filtering if provided (much faster than client-side filtering)
    if (filterFormula) {
      params.append("filterByFormula", filterFormula);
    }
    
    // Only fetch fields we actually use (significantly reduces payload size)
    if (fieldsToFetch) {
      fieldsToFetch.forEach(field => {
        params.append("fields[]", field);
      });
    }
    
    if (offset) {
      params.append("offset", offset);
    }
    url += "?" + params.toString();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      console.error(`❌ Airtable API error for ${tableName}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        url: url.substring(0, 100) + '...'
      });
      throw new Error(
        `Airtable API error for ${tableName}: ${response.status} ${errorMsg}`
      );
    }

    const data = await response.json();
    const pageRecords = data.records || [];
    allRecords = allRecords.concat(pageRecords);

    offset = data.offset || null;

    if (pageCount >= maxPages) {
      console.warn(`Reached max pages limit for ${tableName}`);
      break;
    }
  } while (offset);

  return allRecords;
}

// Helper function to map Airtable record to lead format
function mapRecordToLead(record, tableName) {
  const fields = record.fields || {};
  
  // Map Airtable fields to dashboard format
  // Handle different field names between "Web Popup Leads" and "Patients" tables
  // Gracefully handle missing fields - only use what exists
  const lead = {
    id: record.id,
    name: fields["Name"] || "",
    email: tableName === "Patients" ? (fields["Email"] || "") : (fields["Email Address"] || ""),
    phone: tableName === "Patients" ? (fields["Patient Phone Number"] || "") : (fields["Phone Number"] || ""),
    // For Web Popup Leads: prefer Age Range (from form) over Age (number), for Patients: use Age from Form Submissions
    age: tableName === "Patients" 
      ? (fields["Age (from Form Submissions)"] || null) 
      : (fields["Age Range"] || fields["Age"] || null),
    ageRange: tableName === "Patients" ? null : (fields["Age Range"] || null), // Age Range for Web Popup Leads
    // Map Goals: For Patients, use "Name (from Interest Items)" (treatment names), for Web Popup Leads use "Goals"
    goals: tableName === "Patients" 
      ? (Array.isArray(fields["Name (from Interest Items)"]) ? fields["Name (from Interest Items)"] : [])
      : (Array.isArray(fields["Goals"]) ? fields["Goals"] : []),
    // Map Concerns: For Patients, use "Areas of Interest" or "Which regions...", for Web Popup Leads use "Concerns"
    concerns: tableName === "Patients"
      ? (fields["Areas of Interest (from Form Submissions)"] 
          || (Array.isArray(fields["Which regions of your face do you want to improve? (from Form Submissions)"]) 
              ? fields["Which regions of your face do you want to improve? (from Form Submissions)"].join(", ")
              : "")
          || (Array.isArray(fields["What would you like to improve? (from Form Submissions)"])
              ? fields["What would you like to improve? (from Form Submissions)"].join(", ")
              : "")
          || "")
      : (Array.isArray(fields["Concerns"]) ? fields["Concerns"] : (fields["Concerns"] || "")),
    // Areas field (separate from Concerns for Web Popup Leads)
    areas: tableName === "Patients" ? null : (Array.isArray(fields["Areas"]) ? fields["Areas"] : (fields["Areas"] || null)),
    // Aesthetic Goals: For Web Popup Leads use "Aesthetic Goals", for Patients use "What would you like to improve? (from Form Submissions)"
    // Handle both string and array formats from Airtable
    aestheticGoals: (() => {
      let value = tableName === "Patients" 
        ? (fields["What would you like to improve? (from Form Submissions)"] || fields["Notes"] || "")
        : (fields["Aesthetic Goals"] || fields["Notes"] || "");
      // Convert array to string if needed
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return value || "";
    })(),
    // Demographics for Web Popup Leads
    skinType: tableName === "Patients" ? null : (fields["Skin Type"] || null),
    skinTone: tableName === "Patients" ? null : (fields["Skin Tone"] || null),
    ethnicBackground: tableName === "Patients" ? null : (fields["Ethnic Background"] || null),
    engagementLevel: tableName === "Patients" ? null : (fields["Engagement Level"] || null),
    casesViewedCount: tableName === "Patients" ? null : (fields["Cases Viewed Count"] || null),
    totalCasesAvailable: tableName === "Patients" ? null : (fields["Total Cases Available"] || null),
    concernsExplored: tableName === "Patients" ? null : (Array.isArray(fields["Concerns Explored"]) ? fields["Concerns Explored"] : (fields["Concerns Explored"] || null)),
    // For Patients table, Photos Viewed might be a string, so parse it
    photosLiked: Array.isArray(fields["Liked Photos"]) ? fields["Liked Photos"].length : 0,
    photosViewed: tableName === "Patients" 
      ? (parseInt(fields["Photos Viewed"]) || parseInt(fields["Interested Photos Viewed"]) || 0)
      : (Array.isArray(fields["Viewed Photos"]) ? fields["Viewed Photos"].length : 0),
    treatmentsViewed: [], // Can be populated if you track this in Airtable
    source: fields["Source"] || (tableName === "Patients" ? "Patient" : "AI Consult"),
    status: mapAirtableStatus(fields),
    priority: determinePriority(fields),
    createdAt: record.createdTime || new Date().toISOString(),
    notes: fields["Notes"] || "", // General notes (not contact history - that comes from Contact History table)
    appointmentDate: fields["Appointment Date"] || null,
    treatmentReceived: fields["Treatment Received"] || null,
    revenue: fields["Revenue"] || null,
    lastContact: null, // Will be set from Contact History table
    isReal: true, // Mark as real lead
    tableSource: tableName, // Track which table it came from
    facialAnalysisStatus: fields["Pending/Opened"] || null, // Facial analysis status
    frontPhoto: tableName === "Patients" ? (fields["Front Photo"] || null) : null, // Front photo attachment
    allIssues: tableName === "Patients" ? (fields["Name (from All Issues) (from Analyses)"] || "") : "", // All issues found by analysis
    // Use "Name (from Interest Items)" for suggestion names (e.g., "Hydrate Lips", "Balance Lips")
    // This contains the actual suggestion/treatment names the patient is interested in
    interestedIssues: tableName === "Patients" 
      ? (Array.isArray(fields["Name (from Interest Items)"]) 
          ? fields["Name (from Interest Items)"].join(', ') 
          : (fields["Name (from Interest Items)"] || ""))
      : "",
    // Additional Facial Analysis Form fields
    whichRegions: tableName === "Patients" 
      ? (Array.isArray(fields["Which regions of your face do you want to improve? (from Form Submissions)"])
          ? fields["Which regions of your face do you want to improve? (from Form Submissions)"].join(", ")
          : (fields["Which regions of your face do you want to improve? (from Form Submissions)"] || ""))
      : "",
    skinComplaints: tableName === "Patients"
      ? (Array.isArray(fields["Do you have any skin complaints? (from Form Submissions)"])
          ? fields["Do you have any skin complaints? (from Form Submissions)"].join(", ")
          : (fields["Do you have any skin complaints? (from Form Submissions)"] || ""))
      : "",
    processedAreasOfInterest: tableName === "Patients"
      ? (Array.isArray(fields["Processed Areas of Interest (from Form Submissions)"])
          ? fields["Processed Areas of Interest (from Form Submissions)"].join(", ")
          : (fields["Processed Areas of Interest (from Form Submissions)"] || ""))
      : "",
    areasOfInterestFromForm: tableName === "Patients"
      ? (Array.isArray(fields["Areas of Interest (from Form Submissions)"])
          ? fields["Areas of Interest (from Form Submissions)"].join(", ")
          : (fields["Areas of Interest (from Form Submissions)"] || ""))
      : "", // Suggestion names patient is interested in
    archived: fields["Archived"] || false, // Archived status
    offerClaimed: fields["Offer Claimed"] || false, // Offer claimed status
    // Contact history will be loaded separately from Contact History table
    contactHistory: [],
  };

  return lead;
}

// Fetch all contact history for leads from a specific table using lookup fields
async function fetchContactHistoryForTable(tableSource, leadIds) {
  if (USE_MOCK_DATA || leadIds.length === 0) return [];
  
  try {
    const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contact History`;
    const params = new URLSearchParams();
    
    // Use lookup field to filter by Record IDs from the source table
    const lookupField = tableSource === "Patients" 
      ? "Record ID (from Patients)" 
      : "Record ID (from Web Popup Leads)";
    
    // Build OR formula to match any of the lead IDs
    // Format: OR({Record ID (from Web Popup Leads)} = "recXXX", {Record ID (from Web Popup Leads)} = "recYYY", ...)
    const orConditions = leadIds.map(id => `{${lookupField}} = "${id}"`).join(', ');
    const formula = leadIds.length > 0 ? `OR(${orConditions})` : 'FALSE()';
    
    params.append("filterByFormula", formula);
    params.append("pageSize", "100");
    params.append("sort[0][field]", "Date");
    params.append("sort[0][direction]", "desc"); // Most recent first
    
    // Fetch all pages
    let allRecords = [];
    let offset = null;
    let pageCount = 0;
    const maxPages = 50;
    
    do {
      pageCount++;
      let url = tableUrl;
      const pageParams = new URLSearchParams(params);
      if (offset) {
        pageParams.append("offset", offset);
      }
      url += "?" + pageParams.toString();
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch contact history for ${tableSource}:`, response.statusText);
        break;
      }

      const data = await response.json();
      const pageRecords = data.records || [];
      allRecords = allRecords.concat(pageRecords);
      offset = data.offset || null;

      if (pageCount >= maxPages) {
        console.warn(`Reached max pages limit for Contact History (${tableSource})`);
        break;
      }
    } while (offset);
    
    // Map records to normalized format
    return allRecords.map(record => {
      const fields = record.fields || {};
      
      // Get the lead ID from the appropriate lookup field
      const leadId = fields[lookupField] || null;
      
      // Normalize contact type: "Phone Call" -> "call", "Text Message" -> "text", etc.
      const contactType = (fields["Contact Type"] || "").toLowerCase();
      let normalizedType = 'call';
      if (contactType.includes('email')) normalizedType = 'email';
      else if (contactType.includes('text')) normalizedType = 'text';
      else if (contactType.includes('person') || contactType.includes('meeting')) normalizedType = 'meeting';
      
      // Normalize outcome: "Left Voicemail" -> "voicemail", "No Answer" -> "no-answer", etc.
      const outcome = (fields["Outcome"] || "").toLowerCase();
      let normalizedOutcome = 'reached';
      if (outcome.includes('voicemail')) normalizedOutcome = 'voicemail';
      else if (outcome.includes('no answer') || outcome.includes('no-answer')) normalizedOutcome = 'no-answer';
      else if (outcome.includes('scheduled')) normalizedOutcome = 'scheduled';
      
      return {
        id: record.id,
        leadId: leadId, // Store the lead ID for grouping
        type: normalizedType,
        outcome: normalizedOutcome,
        notes: fields["Notes"] || "",
        date: fields["Date"] || record.createdTime || new Date().toISOString()
      };
    });
  } catch (error) {
    console.warn(`Error fetching contact history for ${tableSource}:`, error);
    return [];
  }
}

// Load contact history for all leads efficiently (batch fetch)
async function loadContactHistoryForLeads(leads) {
  if (USE_MOCK_DATA || leads.length === 0) return;
  
  try {
    // Separate leads by table source
    const webPopupLeads = leads.filter(l => l.tableSource === "Web Popup Leads");
    const patients = leads.filter(l => l.tableSource === "Patients");
    
    // Fetch contact history for both tables in parallel (just 2 API calls total!)
    const [webPopupHistory, patientsHistory] = await Promise.all([
      fetchContactHistoryForTable("Web Popup Leads", webPopupLeads.map(l => l.id)),
      fetchContactHistoryForTable("Patients", patients.map(l => l.id))
    ]);
    
    // Combine all history entries
    const allHistory = [...webPopupHistory, ...patientsHistory];
    
    // Group history by lead ID
    const historyMap = new Map();
    allHistory.forEach(entry => {
      if (entry.leadId) {
        if (!historyMap.has(entry.leadId)) {
          historyMap.set(entry.leadId, []);
        }
        historyMap.get(entry.leadId).push(entry);
      }
    });
    
    // Sort each lead's history by date (most recent first) and attach to leads
    leads.forEach(lead => {
      const history = historyMap.get(lead.id) || [];
      // Sort by date descending (most recent first)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      lead.contactHistory = history;
      
      // Update lastContact from most recent history entry
      if (lead.contactHistory.length > 0) {
        lead.lastContact = lead.contactHistory[0].date;
      }
    });
    
    const totalHistoryEntries = allHistory.length;
    console.log(`Loaded ${totalHistoryEntries} contact history entries for ${leads.length} leads (2 API calls)`);
  } catch (error) {
    console.error("Error loading contact history:", error);
  }
}

// Load leads from Airtable (both "Web Popup Leads" and "Patients" tables)
async function loadLeadsFromAirtable() {
  if (USE_MOCK_DATA) {
    leads = [...MOCK_LEADS];
    filteredLeads = [...leads];
    return;
  }

  isLoading = true;
  showLoadingState();
  const startTime = performance.now();

  try {
    // Use server-side filtering with filterByFormula to reduce API calls
    // For "Web Popup Leads": filter by Providers linked record field
    // For "Patients": filter by "Record ID (from Providers)" lookup field
    // Note: If filterByFormula fails, we'll fetch all records and filter client-side
    let webPopupLeadsRecords = [];
    let patientsRecords = [];
    
    try {
      const webPopupLeadsFormula = `FIND("${PROVIDER_ID}", {Record ID (from Providers)})`;
      const patientsFormula = `FIND("${PROVIDER_ID}", {Record ID (from Providers)})`;
      
      [webPopupLeadsRecords, patientsRecords] = await Promise.all([
        fetchTableRecords("Web Popup Leads", webPopupLeadsFormula),
        fetchTableRecords("Patients", patientsFormula)
      ]);
      
      console.log(`Fetched ${webPopupLeadsRecords.length} records from "Web Popup Leads" (filtered by provider)`);
      console.log(`Fetched ${patientsRecords.length} records from "Patients" (filtered by provider)`);
    } catch (filterError) {
      console.warn("FilterByFormula failed, fetching all records and filtering client-side:", filterError);
      // Fallback: fetch all records and filter client-side
      const [allWebPopupLeads, allPatients] = await Promise.all([
        fetchTableRecords("Web Popup Leads"),
        fetchTableRecords("Patients")
      ]);
      
      // Filter by provider client-side
      const webPopupIds = new Set(allWebPopupLeads.map(r => r.id));
      const allRecords = [...allWebPopupLeads, ...allPatients];
      
      const filtered = allRecords.filter((record) => {
        const fields = record.fields || {};
        const recordIdFromProviders = fields["Record ID (from Providers)"] || "";
        
        // Check Record ID (from Providers) field (for both Web Popup Leads and Patients)
        if (recordIdFromProviders && typeof recordIdFromProviders === 'string') {
          return recordIdFromProviders.includes(PROVIDER_ID);
        }
        
        // Fallback: Check Providers field if Record ID (from Providers) doesn't exist
        const providers = fields["Providers"] || [];
        if (Array.isArray(providers) && providers.length > 0) {
          return providers.includes(PROVIDER_ID);
        }
        
        // Include records with no provider filter (backward compatibility)
        return true;
      });
      
      webPopupLeadsRecords = filtered.filter(r => webPopupIds.has(r.id));
      patientsRecords = filtered.filter(r => !webPopupIds.has(r.id));
      
      console.log(`Fetched ${webPopupLeadsRecords.length} records from "Web Popup Leads" (client-side filtered)`);
      console.log(`Fetched ${patientsRecords.length} records from "Patients" (client-side filtered)`);
    }

    // Combine filtered records for processing
    const allRecords = [...webPopupLeadsRecords, ...patientsRecords];
    const webPopupIds = new Set(webPopupLeadsRecords.map(r => r.id));

    // Process and map Airtable records to lead format
    const airtableLeads = allRecords.map((record) => {
      // Determine which table this record came from
      const tableName = webPopupIds.has(record.id) 
        ? "Web Popup Leads" 
        : "Patients";
      return mapRecordToLead(record, tableName);
    });

    // Filter out incomplete leads (must have name and either email or phone)
    const validAirtableLeads = airtableLeads.filter(lead => {
      const hasName = lead.name && lead.name.trim().length > 0;
      const hasContact = (lead.email && lead.email.trim().length > 0) || 
                         (lead.phone && lead.phone.trim().length > 0);
      return hasName && hasContact;
    });

    // Use only real leads (mock leads hidden for now)
    leads = [...validAirtableLeads];

    // Sort by most recent first
    leads.sort((a, b) => {
      const aDate = new Date(a.lastContact || a.createdAt);
      const bDate = new Date(b.lastContact || b.createdAt);
      return bDate - aDate;
    });
    filteredLeads = [...leads];

    // Load contact history for all real leads
    await loadContactHistoryForLeads(validAirtableLeads);

    const webPopupCount = validAirtableLeads.filter(l => l.tableSource === "Web Popup Leads").length;
    const patientsCount = validAirtableLeads.filter(l => l.tableSource === "Patients").length;
    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Loaded ${validAirtableLeads.length} real leads (${webPopupCount} from Web Popup Leads, ${patientsCount} from Patients) in ${loadTime}s`);
  } catch (error) {
    console.error("Error loading leads from Airtable:", error);
    // Don't use mock data - show empty state instead
    leads = [];
    filteredLeads = [];
    console.log("⚠️ No leads loaded due to Airtable error");
  } finally {
    isLoading = false;
    hideLoadingState();
  }
}

// Map Airtable status field to dashboard status
function mapAirtableStatus(fields) {
  // Check for Status field first
  if (fields["Status"]) {
    const status = fields["Status"].toLowerCase();
    if (["new", "contacted", "scheduled", "converted"].includes(status)) {
      return status;
    }
  }
  
  // Fallback: use Contacted checkbox
  if (fields["Contacted"] === true) {
    return "contacted";
  }
  
  // Default to new
  return "new";
}

// Determine priority based on engagement
function determinePriority(fields) {
  const photosLiked = Array.isArray(fields["Liked Photos"]) ? fields["Liked Photos"].length : 0;
  const photosViewed = Array.isArray(fields["Viewed Photos"]) ? fields["Viewed Photos"].length : 0;
  
  if (photosLiked >= 5 || photosViewed >= 10) {
    return "hot";
  } else if (photosLiked >= 2 || photosViewed >= 5) {
    return "medium";
  }
  return "low";
}

// Show loading state
function showLoadingState() {
  const columns = ['new', 'contacted', 'scheduled', 'converted'];
  columns.forEach(status => {
    const column = document.getElementById(`column-${status}`);
    if (column) {
      column.innerHTML = `
        <div class="empty-state">
          <div class="loading-spinner"></div>
          <p class="empty-state-text">Loading leads...</p>
        </div>
      `;
    }
  });
}

// Hide loading state
function hideLoadingState() {
  // Will be replaced by renderKanban
}

// Render dashboard
function renderDashboard() {
  renderKanban();
  renderList();
  updateSidebarStats();
  updateSortIndicators();
  if (currentView === 'analytics') {
    renderAnalytics();
  } else if (currentView === 'facial-analysis') {
    renderFacialAnalysis();
  } else if (currentView === 'archived') {
    renderArchivedLeads();
  }
}

// Update sidebar stats
function updateSidebarStats() {
  const activeLeads = leads.filter(l => !l.archived).length;
  const archivedLeads = leads.filter(l => l.archived).length;
  
  document.getElementById('sidebar-total').textContent = activeLeads;
}

// Kanban Board
function renderKanban() {
  const statuses = ['new', 'contacted', 'scheduled', 'converted'];

  statuses.forEach(status => {
    const column = document.getElementById(`column-${status}`);
    const count = document.getElementById(`count-${status}`);
    // Only show active (non-archived) leads in kanban
    const statusLeads = leads.filter(l => l.status === status && !l.archived);
    
    count.textContent = statusLeads.length;
    
    if (statusLeads.length === 0) {
      column.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">No leads yet</p>
        </div>
      `;
      return;
    }
    
    column.innerHTML = statusLeads.map(lead => createLeadCard(lead)).join('');
  });
  
  // Add drag listeners
  document.querySelectorAll('.lead-card').forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => viewLeadDetails(card.dataset.id));
  });
}

// Facial Analysis Card Grid View
let expandedFacialCardId = null;

function renderFacialAnalysis() {
  // Only show active (non-archived) leads
  const allLeads = leads.filter(l => !l.archived);
  
  // Filter to only show Patients (those who have done facial analysis)
  let facialAnalysisLeads = allLeads.filter(lead => {
    // Include Patients table records
    if (lead.tableSource === "Patients") {
      return true;
    }
    return false;
  });
  
  // Apply search filter if search term exists
  if (facialAnalysisSearchTerm) {
    facialAnalysisLeads = facialAnalysisLeads.filter(lead => {
      const searchLower = facialAnalysisSearchTerm.toLowerCase();
      const nameMatch = (lead.name || '').toLowerCase().includes(searchLower);
      const emailMatch = (lead.email || '').toLowerCase().includes(searchLower);
      const phoneMatch = (lead.phone || '').toLowerCase().includes(searchLower);
      return nameMatch || emailMatch || phoneMatch;
    });
  }
  
  const container = document.getElementById('facial-analysis-view');
  if (!container) return;
  
  if (facialAnalysisLeads.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #666;">
        <p style="font-size: 16px;">${facialAnalysisSearchTerm ? 'No patients found matching your search.' : 'No facial analysis patients yet.'}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="facial-analysis-cards-grid" id="facial-analysis-cards-grid" style="display: grid !important; grid-template-columns: repeat(auto-fill, minmax(280px, 320px)) !important; gap: 16px !important; padding: 20px !important; justify-content: start !important; width: 100% !important; box-sizing: border-box !important;">
      ${facialAnalysisLeads.map(lead => createFacialAnalysisCard(lead)).join('')}
    </div>
  `;
  
  // Add click listeners for card - show issues modal using event delegation
  const grid = document.getElementById('facial-analysis-cards-grid');
  if (grid) {
    // Remove old listener if exists
    grid.removeEventListener('click', handleFacialCardClick);
    // Add new listener
    grid.addEventListener('click', handleFacialCardClick);
  }
}

// Handle facial analysis card clicks
function handleFacialCardClick(e) {
  const card = e.target.closest('.facial-analysis-card');
  if (!card) return;
  
  // Don't trigger if clicking on the expand button
  if (e.target.closest('.expand-card-btn')) return;
  
  const leadId = card.dataset.id;
  if (leadId) {
    showPatientIssuesModal(leadId);
  }
}

function createFacialAnalysisCard(lead) {
  const isExpanded = expandedFacialCardId === lead.id;
  
  // Get front photo URL if available
  let frontPhotoUrl = null;
  if (lead.frontPhoto && Array.isArray(lead.frontPhoto) && lead.frontPhoto.length > 0) {
    const attachment = lead.frontPhoto[0];
    frontPhotoUrl = attachment.thumbnails?.large?.url || 
                    attachment.thumbnails?.full?.url ||
                    attachment.url;
  }
  
  // Get findings (concerns) and interests (goals)
  const findings = typeof lead.concerns === 'string' 
    ? lead.concerns.split(',').map(c => c.trim()).filter(c => c)
    : (Array.isArray(lead.concerns) ? lead.concerns : []);
  
  const interests = lead.goals || [];
  
  // Format date - use createdAt or lastContact, whichever is available
  const cardDate = lead.createdAt || lead.lastContact || new Date().toISOString();
  const formattedDate = formatRelativeDate(cardDate);
  
  return `
    <div class="facial-analysis-card ${isExpanded ? 'expanded' : ''}" data-id="${lead.id}">
      <div class="facial-card-content">
        <div class="facial-card-photo">
          ${frontPhotoUrl ? `
            <img src="${frontPhotoUrl}" alt="${lead.name}" />
          ` : `
            <div class="facial-card-photo-placeholder">${lead.name.charAt(0).toUpperCase()}</div>
          `}
        </div>
        <div class="facial-card-details">
          <div class="facial-card-name">${lead.name}</div>
          <div class="facial-card-info">
            <div class="facial-card-email">${lead.email || 'No email'}</div>
            ${lead.phone ? `<div class="facial-card-phone">${lead.phone}</div>` : ''}
            <div class="facial-card-date">${formattedDate}</div>
            <div class="facial-card-status">
              <span class="status-badge" style="
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                display: inline-block;
                background: ${getFacialStatusColor(lead.facialAnalysisStatus)};
                color: white;
              ">${formatFacialStatus(lead.facialAnalysisStatus)}</span>
            </div>
          </div>
        </div>
        <button class="expand-card-btn" onclick="event.stopPropagation(); toggleFacialCardExpansion('${lead.id}')">
          ${isExpanded ? '▼' : '▶'}
        </button>
      </div>
      ${isExpanded ? `
        <div class="facial-card-expanded">
          <div class="facial-card-section">
            <div class="facial-card-section-title">FOCUS AREAS</div>
            <div class="facial-card-tags">
              ${findings.length > 0 
                ? findings.map(f => `<span class="facial-tag">${f}</span>`).join('')
                : '<span class="no-data">No findings recorded</span>'
              }
            </div>
          </div>
          <div class="facial-card-section">
            <div class="facial-card-section-title">Interests</div>
            <div class="facial-card-tags">
              ${interests.length > 0 
                ? interests.map(i => `<span class="facial-tag interest">${i}</span>`).join('')
                : '<span class="no-data">No interests recorded</span>'
              }
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function toggleFacialCardExpansion(leadId) {
  if (expandedFacialCardId === leadId) {
    expandedFacialCardId = null;
  } else {
    expandedFacialCardId = leadId;
  }
  renderFacialAnalysis();
}

// Function to map an issue name to its area
function getIssueArea(issueName) {
  // Normalize issue name for matching (case-insensitive, trim whitespace)
  const normalizedIssue = issueName.trim();
  
  // Check each area's issues
  for (const [area, issues] of Object.entries(areasAndIssues)) {
    if (issues.some(issue => issue.toLowerCase() === normalizedIssue.toLowerCase())) {
      return area;
    }
  }
  
  // If not found in mapping, try to infer from name
  const issueLower = normalizedIssue.toLowerCase();
  if (issueLower.includes('forehead') || issueLower.includes('brow') || issueLower.includes('glabella') || issueLower.includes('temporal')) {
    return 'Forehead';
  } else if (issueLower.includes('eye') || issueLower.includes('eyelid') || issueLower.includes('crow')) {
    return 'Eyes';
  } else if (issueLower.includes('cheek')) {
    return 'Cheeks';
  } else if (issueLower.includes('nose') || issueLower.includes('nasal')) {
    return 'Nose';
  } else if (issueLower.includes('lip') || issueLower.includes('mouth') || issueLower.includes('philtral') || issueLower.includes('gummy')) {
    return 'Lips';
  } else if (issueLower.includes('chin') || issueLower.includes('jaw') || issueLower.includes('jowl') || issueLower.includes('masseter')) {
    return 'Chin/Jaw';
  } else if (issueLower.includes('neck') || issueLower.includes('platysmal') || issueLower.includes('submental')) {
    return 'Neck';
  } else if (issueLower.includes('spot') || issueLower.includes('scar') || issueLower.includes('skin') || issueLower.includes('wrinkle') || issueLower.includes('line') || issueLower.includes('fold')) {
    return 'Skin';
  } else if (issueLower.includes('hair') || issueLower.includes('fat') || issueLower.includes('body')) {
    return 'Body';
  }
  
  return 'Other'; // Default category for unmapped issues
}

// Function to group issues by area
function groupIssuesByArea(issuesString) {
  if (!issuesString || typeof issuesString !== 'string') return {};
  
  // Split by comma and clean up
  const issues = issuesString.split(',').map(issue => issue.trim()).filter(issue => issue);
  
  // Group by area
  const grouped = {};
  issues.forEach(issue => {
    const area = getIssueArea(issue);
    if (!grouped[area]) {
      grouped[area] = [];
    }
    grouped[area].push(issue);
  });
  
  return grouped;
}

// Show modal with patient issues grouped by area
// Generate Analysis Results HTML (for collapsible section)
function generateAnalysisResultsHTML(lead) {
  // Get all issues and interested issues
  // Handle both array and string formats from Airtable
  let allIssues = [];
  if (Array.isArray(lead.allIssues)) {
    allIssues = lead.allIssues.filter(i => i && i.trim());
  } else if (typeof lead.allIssues === 'string') {
    allIssues = lead.allIssues.split(',').map(i => i.trim()).filter(i => i);
  }
  
  // Handle interested issues (suggestion names like "Hydrate Lips", "Balance Lips")
  // This comes from "Name (from Interest Items)" field which contains suggestion/treatment names
  let interestedIssues = [];
  if (Array.isArray(lead.interestedIssues)) {
    interestedIssues = lead.interestedIssues.filter(i => i && i.trim());
  } else if (typeof lead.interestedIssues === 'string') {
    interestedIssues = lead.interestedIssues.split(',').map(i => i.trim()).filter(i => i);
  }
  
  // Get patient goals (focus areas)
  const patientGoals = Array.isArray(lead.goals) ? lead.goals : (typeof lead.goals === 'string' ? lead.goals.split(',').map(g => g.trim()) : []);
  
  // Issue to Suggestion mapping from CSV
  const issueToSuggestionMap = {
    "Forehead Wrinkles": "Smoothen Fine Lines",
    "Crow's Feet Wrinkles": "Smoothen Fine Lines",
    "Glabella Wrinkles": "Smoothen Fine Lines",
    "Under Eye Wrinkles": "Smoothen Fine Lines",
    "Perioral Wrinkles": "Smoothen Fine Lines",
    "Bunny Lines": "Smoothen Fine Lines",
    "Neck Lines": "Smoothen Fine Lines",
    "Dark Spots": "Even Skin Tone",
    "Red Spots": "Even Skin Tone",
    "Scars": "Fade Scars",
    "Dry Skin": "Hydrate Skin",
    "Whiteheads": "Exfoliate Skin",
    "Blackheads": "Exfoliate Skin",
    "Under Eye Dark Circles": "Rejuvenate Lower Eyelids",
    "Crepey Skin": "Tighten Skin Laxity",
    "Rosacea [DEPRECATED]": "Even Skin Tone",
    "Nasolabial Folds": "Shadow Correction",
    "Marionette Lines": "Shadow Correction",
    "Temporal Hollow": "Balance Forehead",
    "Brow Asymmetry": "Balance Brows",
    "Flat Forehead": "Balance Forehead",
    "Brow Ptosis": "Balance Brows",
    "Excess Upper Eyelid Skin": "Rejuvenate Upper Eyelids",
    "Lower Eyelid - Excess Skin": "Rejuvenate Lower Eyelids",
    "Upper Eyelid Droop": "Rejuvenate Upper Eyelids",
    "Lower Eyelid Sag": "Rejuvenate Lower Eyelids",
    "Lower Eyelid Bags": "Rejuvenate Lower Eyelids",
    "Under Eye Hollow": "Rejuvenate Lower Eyelids",
    "Upper Eye Hollow": "Rejuvenate Upper Eyelids",
    "Mid Cheek Flattening": "Improve Cheek Definition",
    "Cheekbone - Not Prominent": "Improve Cheek Definition",
    "Heavy Lateral Cheek": "Contour Cheeks",
    "Crooked Nose": "Balance Nose",
    "Droopy Tip": "Balance Nose",
    "Dorsal Hump": "Balance Nose",
    "Tip Droop When Smiling": "Balance Nose",
    "Thin Lips": "Balance Lips",
    "Lacking Philtral Column": "Balance Lips",
    "Long Philtral Column": "Balance Lips",
    "Gummy Smile": "Balance Lips",
    "Asymmetric Lips": "Balance Lips",
    "Dry Lips": "Hydrate Lips",
    "Lip Thinning When Smiling": "Balance Lips",
    "Retruded Chin": "Balance Jawline",
    "Over-Projected Chin": "Contour Jawline",
    "Asymmetric Chin": "Balance Jawline",
    "Jowls": "Contour Jawline",
    "Lower Cheeks - Volume Depletion": "Improve Cheek Definition",
    "Ill-Defined Jawline": "Contour Jawline",
    "Asymmetric Jawline": "Balance Jawline",
    "Masseter Hypertrophy": "Contour Jawline",
    "Prejowl Sulcus": "Balance Jawline",
    "Loose Neck Skin": "Contour Neck",
    "Platysmal Bands": "Contour Neck",
    "Excess/Submental Fullness": "Contour Jawline"
  };
  
  // Create a function to match suggestion names (from interestedIssues) to issues
  function findMatchingInterests(issue, issueArea) {
    const matchingInterests = [];
    const issueLower = issue.toLowerCase().trim();
    
    const mappedSuggestion = issueToSuggestionMap[issue];
    if (mappedSuggestion) {
      const mappedSuggestionLower = mappedSuggestion.toLowerCase();
      if (interestedIssues.some(interest => interest.toLowerCase().trim() === mappedSuggestionLower)) {
        matchingInterests.push(mappedSuggestion);
      }
    }
    
    interestedIssues.forEach(interest => {
      const interestLower = interest.toLowerCase().trim();
      if (interestLower === issueLower && !matchingInterests.includes(interest)) {
        matchingInterests.push(interest);
      }
    });
    
    return [...new Set(matchingInterests)];
  }
  
  const interestedSet = new Set(interestedIssues.map(i => i.toLowerCase().trim()));
  
  // Determine which areas are focus areas based on goals
  const focusAreas = new Set();
  patientGoals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('lip') || goalLower.includes('lips')) focusAreas.add('Lips');
    if (goalLower.includes('eye') || goalLower.includes('eyes')) focusAreas.add('Eyes');
    if (goalLower.includes('cheek') || goalLower.includes('cheeks')) focusAreas.add('Cheeks');
    if (goalLower.includes('forehead') || goalLower.includes('brow')) focusAreas.add('Forehead');
    if (goalLower.includes('chin') || goalLower.includes('jaw')) focusAreas.add('Chin/Jaw');
    if (goalLower.includes('neck')) focusAreas.add('Neck');
    if (goalLower.includes('skin')) focusAreas.add('Skin');
    if (goalLower.includes('nose')) focusAreas.add('Nose');
  });
  
  // Group all issues by area
  const groupedIssues = {};
  allIssues.forEach(issue => {
    const area = getIssueArea(issue);
    if (!groupedIssues[area]) {
      groupedIssues[area] = [];
    }
    groupedIssues[area].push(issue);
  });
  
  // Sort areas in a logical order
  const areaOrder = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Chin/Jaw', 'Neck', 'Skin', 'Body', 'Other'];
  const sortedAreas = Object.keys(groupedIssues).sort((a, b) => {
    const aIndex = areaOrder.indexOf(a);
    const bIndex = areaOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  if (sortedAreas.length === 0) {
    return `
      <div class="no-issues-message" style="padding: 40px 20px; text-align: center; color: #666;">
        <p>No issues found for this patient.</p>
      </div>
    `;
  }
  
  let html = '';
  sortedAreas.forEach(area => {
    const issues = groupedIssues[area];
    const isFocusArea = focusAreas.has(area);
    html += `
      <div class="issues-area-group" style="margin-bottom: 24px;">
        <h3 class="issues-area-title" style="font-size: 16px; font-weight: 600; color: #212121; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          ${area}
          ${isFocusArea ? '<span class="focus-area-pill" style="padding: 2px 8px; background: #E1BEE7; color: #6A1B9A; border-radius: 12px; font-size: 11px; font-weight: 500;">Focus Area</span>' : ''}
        </h3>
        <div class="issues-chips-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
    `;
    
    issues.forEach(issue => {
      const isInterested = interestedSet.has(issue.toLowerCase());
      const matchingInterests = findMatchingInterests(issue, area);
      html += `
        <div class="issue-chip" style="padding: 12px; background: ${isInterested ? '#F3E5F5' : '#f5f5f5'}; border-radius: 8px; border: 1px solid ${isInterested ? '#E1BEE7' : '#e0e0e0'};">
          <div class="issue-chip-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${matchingInterests.length > 0 ? '8px' : '0'};">
            <span class="issue-chip-name" style="font-size: 13px; font-weight: 500; color: #212121;">${issue}</span>
            ${isInterested ? '<span class="issue-interest-badge" style="padding: 2px 6px; background: #9C27B0; color: white; border-radius: 4px; font-size: 10px; font-weight: 500;">Interested</span>' : ''}
          </div>
          ${matchingInterests.length > 0 ? `
            <div class="issue-chip-interests" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${isInterested ? '#E1BEE7' : '#e0e0e0'};">
              <span class="issue-chip-interests-label" style="font-size: 11px; color: #666; display: block; margin-bottom: 4px;">Client interested in:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${matchingInterests.map(interest => `<span class="issue-chip-interest-item" style="padding: 4px 8px; background: #C5E1A5; color: #33691E; border-radius: 4px; font-size: 11px;">${interest}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  return html;
}

function showPatientIssuesModal(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  // Get all issues and interested issues
  // Handle both array and string formats from Airtable
  let allIssues = [];
  if (Array.isArray(lead.allIssues)) {
    allIssues = lead.allIssues.filter(i => i && i.trim());
  } else if (typeof lead.allIssues === 'string') {
    allIssues = lead.allIssues.split(',').map(i => i.trim()).filter(i => i);
  }
  
  // Handle interested issues (suggestion names like "Hydrate Lips", "Balance Lips")
  // This comes from "Name (from Interest Items)" field which contains suggestion/treatment names
  let interestedIssues = [];
  if (Array.isArray(lead.interestedIssues)) {
    interestedIssues = lead.interestedIssues.filter(i => i && i.trim());
  } else if (typeof lead.interestedIssues === 'string') {
    interestedIssues = lead.interestedIssues.split(',').map(i => i.trim()).filter(i => i);
  }
  
  // Get patient goals (focus areas)
  const patientGoals = Array.isArray(lead.goals) ? lead.goals : (typeof lead.goals === 'string' ? lead.goals.split(',').map(g => g.trim()) : []);
  
  // Issue to Suggestion mapping from CSV
  const issueToSuggestionMap = {
    "Forehead Wrinkles": "Smoothen Fine Lines",
    "Crow's Feet Wrinkles": "Smoothen Fine Lines",
    "Glabella Wrinkles": "Smoothen Fine Lines",
    "Under Eye Wrinkles": "Smoothen Fine Lines",
    "Perioral Wrinkles": "Smoothen Fine Lines",
    "Bunny Lines": "Smoothen Fine Lines",
    "Neck Lines": "Smoothen Fine Lines",
    "Dark Spots": "Even Skin Tone",
    "Red Spots": "Even Skin Tone",
    "Scars": "Fade Scars",
    "Dry Skin": "Hydrate Skin",
    "Whiteheads": "Exfoliate Skin",
    "Blackheads": "Exfoliate Skin",
    "Under Eye Dark Circles": "Rejuvenate Lower Eyelids",
    "Crepey Skin": "Tighten Skin Laxity",
    "Rosacea [DEPRECATED]": "Even Skin Tone",
    "Nasolabial Folds": "Shadow Correction",
    "Marionette Lines": "Shadow Correction",
    "Temporal Hollow": "Balance Forehead",
    "Brow Asymmetry": "Balance Brows",
    "Flat Forehead": "Balance Forehead",
    "Brow Ptosis": "Balance Brows",
    "Excess Upper Eyelid Skin": "Rejuvenate Upper Eyelids",
    "Lower Eyelid - Excess Skin": "Rejuvenate Lower Eyelids",
    "Upper Eyelid Droop": "Rejuvenate Upper Eyelids",
    "Lower Eyelid Sag": "Rejuvenate Lower Eyelids",
    "Lower Eyelid Bags": "Rejuvenate Lower Eyelids",
    "Under Eye Hollow": "Rejuvenate Lower Eyelids",
    "Upper Eye Hollow": "Rejuvenate Upper Eyelids",
    "Mid Cheek Flattening": "Improve Cheek Definition",
    "Cheekbone - Not Prominent": "Improve Cheek Definition",
    "Heavy Lateral Cheek": "Contour Cheeks",
    "Crooked Nose": "Balance Nose",
    "Droopy Tip": "Balance Nose",
    "Dorsal Hump": "Balance Nose",
    "Tip Droop When Smiling": "Balance Nose",
    "Thin Lips": "Balance Lips",
    "Lacking Philtral Column": "Balance Lips",
    "Long Philtral Column": "Balance Lips",
    "Gummy Smile": "Balance Lips",
    "Asymmetric Lips": "Balance Lips",
    "Dry Lips": "Hydrate Lips",
    "Lip Thinning When Smiling": "Balance Lips",
    "Retruded Chin": "Balance Jawline",
    "Over-Projected Chin": "Contour Jawline",
    "Asymmetric Chin": "Balance Jawline",
    "Jowls": "Contour Jawline",
    "Lower Cheeks - Volume Depletion": "Improve Cheek Definition",
    "Ill-Defined Jawline": "Contour Jawline",
    "Asymmetric Jawline": "Balance Jawline",
    "Masseter Hypertrophy": "Contour Jawline",
    "Prejowl Sulcus": "Balance Jawline",
    "Loose Neck Skin": "Contour Neck",
    "Platysmal Bands": "Contour Neck",
    "Excess/Submental Fullness": "Contour Jawline"
  };
  
  // Create a function to match suggestion names (from interestedIssues) to issues
  // Uses the exact mapping from CSV to find which suggestions match each issue
  function findMatchingInterests(issue, issueArea) {
    const matchingInterests = [];
    const issueLower = issue.toLowerCase().trim();
    
    // First, check if this issue has a mapped suggestion
    const mappedSuggestion = issueToSuggestionMap[issue];
    
    // Check if the patient is interested in the mapped suggestion
    if (mappedSuggestion) {
      const mappedSuggestionLower = mappedSuggestion.toLowerCase();
      // Check if patient is interested in this exact suggestion
      if (interestedIssues.some(interest => interest.toLowerCase().trim() === mappedSuggestionLower)) {
        matchingInterests.push(mappedSuggestion);
      }
    }
    
    // Also check for direct matches (if suggestion name exactly matches issue name)
    // This handles edge cases where the suggestion name might be the same as the issue name
    interestedIssues.forEach(interest => {
      const interestLower = interest.toLowerCase().trim();
      if (interestLower === issueLower && !matchingInterests.includes(interest)) {
        matchingInterests.push(interest);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(matchingInterests)];
  }
  
  // Create a set for quick lookup (normalize for comparison)
  const interestedSet = new Set(interestedIssues.map(i => i.toLowerCase().trim()));
  
  // Determine which areas are focus areas based on goals
  const focusAreas = new Set();
  patientGoals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    // Map goals to areas
    if (goalLower.includes('lip') || goalLower.includes('lips')) focusAreas.add('Lips');
    if (goalLower.includes('eye') || goalLower.includes('eyes')) focusAreas.add('Eyes');
    if (goalLower.includes('cheek') || goalLower.includes('cheeks')) focusAreas.add('Cheeks');
    if (goalLower.includes('forehead') || goalLower.includes('brow')) focusAreas.add('Forehead');
    if (goalLower.includes('chin') || goalLower.includes('jaw')) focusAreas.add('Chin/Jaw');
    if (goalLower.includes('neck')) focusAreas.add('Neck');
    if (goalLower.includes('skin')) focusAreas.add('Skin');
    if (goalLower.includes('nose')) focusAreas.add('Nose');
  });
  
  // Group all issues by area
  const groupedIssues = {};
  allIssues.forEach(issue => {
    const area = getIssueArea(issue);
    if (!groupedIssues[area]) {
      groupedIssues[area] = [];
    }
    groupedIssues[area].push(issue);
  });
  
  // Get front photo URL if available
  let frontPhotoUrl = null;
  if (lead.frontPhoto && Array.isArray(lead.frontPhoto) && lead.frontPhoto.length > 0) {
    const attachment = lead.frontPhoto[0];
    frontPhotoUrl = attachment.thumbnails?.large?.url || 
                    attachment.thumbnails?.full?.url ||
                    attachment.url;
  }
  
  // Calculate last activity (most recent contact or facial analysis)
  // lastContact is already calculated from Contact History table
  const lastActivityDate = lead.lastContact ? formatDate(lead.lastContact) : (lead.createdAt ? formatDate(lead.createdAt) : 'No activity yet');
  const lastActivityRelative = lead.lastContact ? formatRelativeDate(lead.lastContact) : (lead.createdAt ? formatRelativeDate(lead.createdAt) : 'No activity yet');
  
  // Sort areas in a logical order
  const areaOrder = ['Forehead', 'Eyes', 'Cheeks', 'Nose', 'Lips', 'Chin/Jaw', 'Neck', 'Skin', 'Body', 'Other'];
  const sortedAreas = Object.keys(groupedIssues).sort((a, b) => {
    const aIndex = areaOrder.indexOf(a);
    const bIndex = areaOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  // Build modal HTML
  let modalHTML = `
    <div class="patient-issues-modal-overlay" onclick="closePatientIssuesModal()">
      <div class="patient-issues-modal" onclick="event.stopPropagation()">
        <div class="patient-issues-modal-header">
          <div style="flex: 1;">
            <h2>Analysis Results for ${lead.name}</h2>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f5f5f5; border-radius: 6px;">
                <span style="font-size: 12px; color: #666; font-weight: 500;">Last Activity:</span>
                <span style="font-size: 14px; color: #212121; font-weight: 600;">${lastActivityRelative}</span>
              </div>
            </div>
          </div>
          <button class="patient-issues-modal-close" onclick="closePatientIssuesModal()">×</button>
        </div>
        <div class="patient-issues-modal-body">
          
          <div class="detail-section ${frontPhotoUrl ? 'modal-header-with-photo' : ''}" style="margin-bottom: 24px;">
            ${frontPhotoUrl ? `
              <div class="modal-photo-container">
                <img src="${frontPhotoUrl}" alt="${lead.name}" class="modal-photo" />
              </div>
            ` : ''}
            ${generateContactInformationSection(lead, lastActivityRelative, false)}
          </div>
          
          <div class="detail-section" style="margin-bottom: 24px;">
            <div class="detail-section-title">Analysis Results</div>
          </div>
  `;
  
  if (sortedAreas.length === 0) {
    modalHTML += `
      <div class="no-issues-message" style="padding: 40px 20px; text-align: center; color: #666;">
        <p>No issues found for this patient.</p>
      </div>
    `;
  } else {
    sortedAreas.forEach(area => {
      const issues = groupedIssues[area];
      const isFocusArea = focusAreas.has(area);
      modalHTML += `
        <div class="issues-area-group">
          <h3 class="issues-area-title">
            ${area}
            ${isFocusArea ? '<span class="focus-area-pill">Focus Area</span>' : ''}
          </h3>
          <div class="issues-chips-grid">
      `;
      
      issues.forEach(issue => {
        const isInterested = interestedSet.has(issue.toLowerCase());
        const matchingInterests = findMatchingInterests(issue, area);
        modalHTML += `
          <div class="issue-chip ${isInterested ? 'issue-interested' : ''}">
            <div class="issue-chip-header">
              <span class="issue-chip-name">${issue}</span>
              ${isInterested ? '<span class="issue-interest-badge">Interested</span>' : ''}
            </div>
            ${matchingInterests.length > 0 ? `
              <div class="issue-chip-interests">
                <span class="issue-chip-interests-label">Client interested in:</span>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                  ${matchingInterests.map(interest => `<span class="issue-chip-interest-item">${interest}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      modalHTML += `
          </div>
        </div>
      `;
    });
  }
  
  modalHTML += `
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.querySelector('.patient-issues-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Toggle Analysis Results section
function toggleAnalysisResults(leadId) {
  const section = document.getElementById(`analysis-results-section-${leadId}`);
  const button = document.getElementById(`toggle-analysis-btn-${leadId}`);
  const text = document.getElementById(`toggle-analysis-text-${leadId}`);
  const icon = document.getElementById(`toggle-analysis-icon-${leadId}`);
  
  if (section && button && text && icon) {
    if (section.style.display === 'none') {
      section.style.display = 'block';
      text.textContent = 'Hide Analysis Results & Interests';
      icon.style.transform = 'rotate(180deg)';
    } else {
      section.style.display = 'none';
      text.textContent = 'View Analysis Results & Interests';
      icon.style.transform = 'rotate(0deg)';
    }
  }
}

// Close patient issues modal (kept for backward compatibility)
function closePatientIssuesModal() {
  const modal = document.querySelector('.patient-issues-modal-overlay');
  if (modal) {
    modal.remove();
  }
}

function createLeadCard(lead) {
  const date = formatRelativeDate(lead.createdAt);
  
  // Show both phone and email for completeness
  let phoneInfo = lead.phone ? `Phone: ${lead.phone}` : '';
  let emailInfo = '';
  if (lead.email) {
    // Truncate long emails
    const email = lead.email.length > 22 ? lead.email.substring(0, 20) + '...' : lead.email;
    emailInfo = `Email: ${email}`;
  }
  
  // Get front photo URL if available (Airtable attachment format)
  // Prioritize larger thumbnails for better quality
  let frontPhotoUrl = null;
  if (lead.frontPhoto && Array.isArray(lead.frontPhoto) && lead.frontPhoto.length > 0) {
    const attachment = lead.frontPhoto[0];
    // Airtable provides: small (36x36), large (512x512), full (original size)
    // Use large thumbnail for good balance of quality and performance, fallback to full if needed
    frontPhotoUrl = attachment.thumbnails?.large?.url || 
                    attachment.thumbnails?.full?.url ||
                    attachment.url;
  }
  
  return `
    <div class="lead-card" draggable="true" data-id="${lead.id}">
      ${frontPhotoUrl ? `
        <div class="lead-photo">
          <img src="${frontPhotoUrl}" alt="${lead.name}" class="lead-photo-img" draggable="false" />
        </div>
      ` : ''}
      <div class="lead-card-header">
        <div>
          <div class="lead-name">${lead.name}</div>
          <div class="lead-contact-info">
            ${phoneInfo ? `<div class="lead-contact">${phoneInfo}</div>` : ''}
            ${emailInfo ? `<div class="lead-contact">${emailInfo}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="lead-card-footer">
        <span class="lead-date">${date}</span>
      </div>
    </div>
  `;
}

// Drag and Drop
function handleDragStart(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.kanban-cards').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

// Handle drop for facial analysis board
function handleFacialDrop(e, newFacialStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const leadId = e.dataTransfer.getData('text/plain');
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) return;
  
  // If dragging from "Not Started" (Web Popup Leads) to another status, 
  // we can't update them since they're not in Patients table
  if (lead.tableSource === "Web Popup Leads" && newFacialStatus !== 'not-started') {
    showError('Web Popup Leads cannot be moved to other statuses. They must be in the Patients table first.');
    renderFacialAnalysis(); // Re-render to put them back
    return;
  }
  
  // Only Patients table can have status updates
  if (lead.tableSource !== "Patients") return;
  
  // Handle "not-started" - set to empty string for Airtable
  const airtableStatus = newFacialStatus === 'not-started' ? '' : newFacialStatus;
  
  // Update local state
  lead.facialAnalysisStatus = airtableStatus;
  
  // Re-render facial analysis board
  renderFacialAnalysis();
  
  // Update in Airtable
  updateFacialAnalysisStatus(leadId, airtableStatus);
  
  showToast(`Moved ${lead.name} to ${formatFacialStatus(airtableStatus)}`);
}

// Update facial analysis status in Airtable
async function updateFacialAnalysisStatus(leadId, newFacialStatus) {
  if (USE_MOCK_DATA) {
    return;
  }
  
  try {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.tableSource !== "Patients") {
      throw new Error("Lead not found or not from Patients table");
    }
    
    // Handle "not-started" - send empty string to Airtable
    const airtableStatus = newFacialStatus === 'not-started' || !newFacialStatus ? '' : newFacialStatus;
    
    const fields = {};
    fields["Pending/Opened"] = airtableStatus;
    
    const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Patients`;
    const response = await fetch(`${tableUrl}/${leadId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to update facial analysis status");
    }

    console.log(`Updated facial analysis status to ${newFacialStatus} for patient ${leadId}`);
  } catch (error) {
    console.error("Error updating facial analysis status:", error);
    showError("Failed to update facial analysis status. Please try again.");
  }
}

function handleDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const leadId = e.dataTransfer.getData('text/plain');
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) return;
  
  if (lead && lead.status !== newStatus) {
    // Update in Airtable (or local state for mock data)
    updateLeadStatusInAirtable(leadId, newStatus);
    showToast(`Moved ${lead.name} to ${formatStatus(newStatus)}`);
  }
}

// List View
function renderList() {
  const tbody = document.getElementById('leads-tbody');
  if (!tbody) {
    console.warn('leads-tbody not found, cannot render list');
    return;
  }
  // Only show active (non-archived) leads in list view
  let filteredLeads = leads.filter(l => !l.archived);
  
  // Apply status filter
  if (currentFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.status === currentFilter);
  }
  
  // Apply search filter
  const searchTerm = (document.getElementById('filter-search')?.value?.toLowerCase() || '').trim();
  if (searchTerm) {
    filteredLeads = filteredLeads.filter(l => 
      (l.name || '').toLowerCase().includes(searchTerm) ||
      (l.email || '').toLowerCase().includes(searchTerm) ||
      (l.phone || '').includes(searchTerm)
    );
  }
  
  // Apply source filter
  const sourceFilter = document.getElementById('filter-source')?.value || '';
  if (sourceFilter) {
    filteredLeads = filteredLeads.filter(l => l.source === sourceFilter || l.tableSource === sourceFilter);
  }
  
  // Apply age range filter
  const ageMin = document.getElementById('filter-age-min')?.value;
  const ageMax = document.getElementById('filter-age-max')?.value;
  if (ageMin || ageMax) {
    filteredLeads = filteredLeads.filter(l => {
      if (l.age === null || l.age === undefined) return false;
      const age = typeof l.age === 'string' ? parseFloat(l.age) : Number(l.age);
      if (isNaN(age)) return false;
      if (ageMin && age < parseFloat(ageMin)) return false;
      if (ageMax && age > parseFloat(ageMax)) return false;
      return true;
    });
  }
  
  // Apply sorting
  filteredLeads.sort((a, b) => {
    let aVal = a[currentSortField];
    let bVal = b[currentSortField];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    
    // Handle different data types
    if (currentSortField === 'name' || currentSortField === 'phone' || currentSortField === 'status' || currentSortField === 'facialAnalysisStatus') {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    } else if (currentSortField === 'age' || currentSortField === 'photosLiked' || currentSortField === 'photosViewed') {
      aVal = typeof aVal === 'string' ? parseFloat(aVal) : Number(aVal) || 0;
      bVal = typeof bVal === 'string' ? parseFloat(bVal) : Number(bVal) || 0;
    } else if (currentSortField === 'createdAt' || currentSortField === 'lastContact') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    
    // Compare values
    if (aVal < bVal) return currentSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentSortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  if (filteredLeads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px; color: #666;">
          No leads found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredLeads.map(lead => `
    <tr onclick="viewLeadDetails('${lead.id}')" style="cursor: pointer;">
      <td>
        <div class="table-lead-name">${lead.name}</div>
        <div class="table-lead-email">${lead.email}</div>
      </td>
      <td>${lead.phone}</td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${lead.goals.slice(0, 2).map(g => `<span class="interest-tag" style="font-size: 11px;">${g}</span>`).join('')}
        </div>
      </td>
      <td>
        <span class="status-badge" style="
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
          background: ${getFacialStatusColor(lead.facialAnalysisStatus)};
          color: white;
        ">${formatFacialStatus(lead.facialAnalysisStatus)}</span>
        ${lead.offerClaimed ? `
          <div style="margin-top: 4px;">
            <span class="status-badge" style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              display: inline-block;
              background: #4CAF50;
              color: white;
            ">✓ Offer Claimed</span>
          </div>
        ` : ''}
      </td>
      <td onclick="event.stopPropagation();">
        <select 
          class="status-select-inline" 
          value="${lead.status}" 
          onchange="updateLeadStatusFromTable('${lead.id}', this.value)"
          onclick="event.stopPropagation();"
          style="
            padding: 6px 10px;
            border-radius: 8px;
            border: 1px solid var(--theme-border);
            background: var(--theme-bg-card);
            color: var(--theme-text-primary);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            min-width: 120px;
            font-family: inherit;
          "
        >
          <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New Lead</option>
          <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="scheduled" ${lead.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
          <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
        </select>
      </td>
      <td style="font-size: 13px; color: #666;">${formatRelativeDate(lead.lastContact || lead.createdAt)}</td>
      <td>
        <button class="btn-secondary" style="padding: 8px 12px; font-size: 12px;" onclick="event.stopPropagation(); viewLeadDetails('${lead.id}')">
          View
        </button>
      </td>
    </tr>
  `).join('');
}

function setListFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });
  renderList();
}

function toggleFilters() {
  const filters = document.getElementById('list-advanced-filters');
  const icon = document.getElementById('filters-toggle-icon');
  if (filters.style.display === 'none') {
    filters.style.display = 'grid';
    icon.textContent = '▲';
  } else {
    filters.style.display = 'none';
    icon.textContent = '▼';
  }
}

function filterLeads() {
  renderList();
}

// Apply filters (called when filter inputs change)
function applyFilters() {
  renderList();
}

// Apply sorting (called when sort dropdowns change)
function applySorting() {
  currentSortField = document.getElementById('sort-field')?.value || 'createdAt';
  currentSortOrder = document.getElementById('sort-order')?.value || 'desc';
  updateSortIndicators();
  renderList();
}

// Sort by clicking column header
function sortByColumn(field) {
  if (currentSortField === field) {
    // Toggle sort order if clicking same column
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to descending
    currentSortField = field;
    currentSortOrder = 'desc';
  }
  
  // Update dropdowns
  if (document.getElementById('sort-field')) {
    document.getElementById('sort-field').value = currentSortField;
  }
  if (document.getElementById('sort-order')) {
    document.getElementById('sort-order').value = currentSortOrder;
  }
  
  updateSortIndicators();
  renderList();
}

// Update sort indicators in column headers
function updateSortIndicators() {
  // Clear all indicators
  document.querySelectorAll('.sort-indicator').forEach(ind => {
    ind.textContent = '';
  });
  
  // Set indicator for current sort field
  const indicator = document.getElementById(`sort-${currentSortField}`);
  if (indicator) {
    indicator.textContent = currentSortOrder === 'asc' ? ' ↑' : ' ↓';
  }
}

// Clear all filters
function clearFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-source').value = '';
  document.getElementById('filter-age-min').value = '';
  document.getElementById('filter-age-max').value = '';
  document.getElementById('sort-field').value = 'createdAt';
  document.getElementById('sort-order').value = 'desc';
  currentSortField = 'createdAt';
  currentSortOrder = 'desc';
  updateSortIndicators();
  renderList();
}

// Render archived leads (simple list view)
function renderArchivedLeads() {
  const tbody = document.getElementById('archived-leads-tbody');
  if (!tbody) return;
  
  // Get all archived leads
  let archivedLeads = leads.filter(l => l.archived === true);
  
  // Apply search filter
  const searchTerm = (document.getElementById('archived-filter-search')?.value?.toLowerCase() || '').trim();
  if (searchTerm) {
    archivedLeads = archivedLeads.filter(l => 
      (l.name || '').toLowerCase().includes(searchTerm) ||
      (l.email || '').toLowerCase().includes(searchTerm) ||
      (l.phone || '').includes(searchTerm)
    );
  }
  
  // Sort leads
  archivedLeads.sort((a, b) => {
    let aVal = a[archivedSortField];
    let bVal = b[archivedSortField];
    
    // Handle null/undefined
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Handle dates
    if (archivedSortField === 'createdAt' || archivedSortField === 'lastContact') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (archivedSortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  
  // Render table rows
  if (archivedLeads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
          ${searchTerm ? 'No archived leads found matching your search.' : 'No archived leads yet.'}
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = archivedLeads.map(lead => {
    const statusColor = {
      'new': '#6B8A9A',
      'contacted': '#D4A574',
      'scheduled': '#8B7FA8',
      'converted': '#7FA882'
    }[lead.status] || '#999';
    
    const formattedDate = lead.createdAt 
      ? new Date(lead.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : '-';
    
    return `
      <tr onclick="viewLeadDetails('${lead.id}')" style="cursor: pointer;">
        <td><strong>${lead.name || 'N/A'}</strong></td>
        <td>${lead.email || '-'}</td>
        <td>${lead.phone || '-'}</td>
        <td>
          <span class="status-badge" style="
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
            background: ${statusColor};
            color: white;
          ">${formatStatus(lead.status)}</span>
        </td>
        <td>${formattedDate}</td>
        <td onclick="event.stopPropagation();">
          <button 
            onclick="toggleArchiveLead('${lead.id}')" 
            class="btn-small"
            style="padding: 6px 12px; font-size: 12px;"
          >
            Unarchive
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Sort archived leads
function sortArchivedBy(field) {
  if (archivedSortField === field) {
    archivedSortOrder = archivedSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    archivedSortField = field;
    archivedSortOrder = 'desc';
  }
  renderArchivedLeads();
  updateArchivedSortIndicators();
}

// Update sort indicators for archived view
function updateArchivedSortIndicators() {
  document.querySelectorAll('#archived-view .sort-indicator').forEach(indicator => {
    indicator.textContent = '';
  });
  
  const header = document.querySelector(`#archived-view th[onclick*="sortArchivedBy('${archivedSortField}')"]`);
  if (header) {
    const indicator = header.querySelector('.sort-indicator');
    if (indicator) {
      indicator.textContent = archivedSortOrder === 'asc' ? ' ↑' : ' ↓';
    }
  }
}

// Archive or unarchive a lead
async function toggleArchiveLead(leadId) {
  if (!leadId && currentLeadId) {
    leadId = currentLeadId;
  }
  if (!leadId) return;
  
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  const newArchivedStatus = !lead.archived;
  const action = newArchivedStatus ? 'archive' : 'unarchive';
  
  if (!confirm(`Are you sure you want to ${action} ${lead.name}?`)) {
    return;
  }
  
  try {
    // Update local state
    lead.archived = newArchivedStatus;
    
    // Update in Airtable
    if (!USE_MOCK_DATA && lead.isReal) {
      const tableName = lead.tableSource || "Web Popup Leads";
      const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
      
      const response = await fetch(`${tableUrl}/${lead.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Archived": newArchivedStatus
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Failed to ${action} lead`);
      }
      
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}d lead: ${lead.name}`);
    }
    
    // Update UI
    closeLeadModal();
    
    // Re-render views
    if (currentView === 'kanban') {
      renderKanban();
    } else if (currentView === 'list') {
      renderList();
    } else if (currentView === 'facial-analysis') {
      renderFacialAnalysis();
    } else if (currentView === 'archived') {
      renderArchivedLeads();
    }
    
    updateSidebarStats();
    
    showToast(`${lead.name} has been ${action}d`);
  } catch (error) {
    console.error(`Error ${action}ing lead:`, error);
    showError(`Failed to ${action} lead. Please try again.`);
    // Revert local state on error
    lead.archived = !newArchivedStatus;
  }
}

// Request telehealth facial analysis - sends text to patient
async function requestTelehealthFacialAnalysis(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead || !lead.phone) {
    showError('Patient phone number is required to send telehealth request.');
    return;
  }
  
  if (!confirm(`Send telehealth facial analysis link to ${lead.name} at ${lead.phone}?`)) {
    return;
  }
  
  try {
    // TODO: Integrate with your text messaging service (Twilio, Airtable automation, etc.)
    // For now, we'll log the action and you can set up the integration
    
    // Example: You could update Airtable with a field that triggers an automation
    // Or call a webhook/API endpoint that sends the text
    
    const message = `Hi ${lead.name.split(' ')[0]}, ${PROVIDER_ID === 'rec3oXyrb1t6YUvoe' ? 'Lakeshore Skin + Body' : 'Unique Aesthetics & Wellness'} would like you to complete a facial analysis scan. Please use this link: ${TELEHEALTH_LINK}`;
    
    console.log('Would send text to:', lead.phone);
    console.log('Message:', message);
    
    // If you have Airtable automation set up, you could update a field here:
    // await updateAirtableField(leadId, 'Telehealth Request Sent', true);
    
    // Add a contact log entry
    if (!lead.contactHistory) lead.contactHistory = [];
    const newEntry = {
      id: Date.now(),
      type: 'text',
      outcome: 'scheduled',
      notes: `Telehealth facial analysis link sent to ${lead.phone}`,
      date: new Date().toISOString()
    };
    lead.contactHistory.unshift(newEntry);
    
    // Save contact history to Airtable
    if (!USE_MOCK_DATA && lead.isReal) {
      try {
        const contactHistoryTableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contact History`;
        const linkField = lead.tableSource === "Patients" ? "Patient" : "Web Popup Lead";
        
        const contactHistoryFields = {
          [linkField]: [lead.id],
          "Contact Type": "Text Message",
          "Outcome": "Scheduled Appointment",
          "Notes": `Telehealth facial analysis link sent to ${lead.phone}`,
          "Date": new Date().toISOString()
        };
        
        await fetch(contactHistoryTableUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: contactHistoryFields }),
        });
        
        // Refresh contact history display
        document.getElementById('contact-history').innerHTML = renderContactHistory(lead);
      } catch (error) {
        console.error("Error saving contact history:", error);
      }
    }
    
    showToast(`Telehealth request sent to ${lead.name}`);
    
    // Refresh modal
    viewLeadDetails(leadId);
  } catch (error) {
    console.error('Error sending telehealth request:', error);
    showError('Failed to send telehealth request. Please try again.');
  }
}

// Scan patient now - opens Jotform
function scanPatientNow(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  // Open Jotform in new tab with patient info pre-filled if possible
  // You can add URL parameters to pre-fill the form
  const formUrl = `${JOTFORM_URL}?name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}&phone=${encodeURIComponent(lead.phone || '')}`;
  window.open(formUrl, '_blank');
  
  // Log the action
  console.log(`Opening Jotform for patient: ${lead.name}`);
  
  showToast(`Opening scan form for ${lead.name}`);
}

// Update lead status from table dropdown
function updateLeadStatusFromTable(leadId, newStatus) {
  const lead = leads.find(l => l.id === leadId);
  
  if (lead && lead.status !== newStatus) {
    // Update in Airtable (or local state for mock data)
    updateLeadStatusInAirtable(leadId, newStatus);
    showToast(`Updated ${lead.name} to ${formatStatus(newStatus)}`);
    
    // Update the lead's status in local state immediately for UI responsiveness
    lead.status = newStatus;
    
    // Re-render the list to reflect the change
    renderList();
    
    // Also update kanban if we're viewing it
    renderKanban();
  }
}

// Lead Details Modal
// Generate Contact Information section HTML (shared between popups)
function generateContactInformationSection(lead, lastActivityRelative, enableEdit = true) {
  return `
    <div class="modal-contact-section" style="position: relative;">
      ${enableEdit ? `
      <button class="edit-toggle-btn" onclick="toggleEditMode()" style="position: absolute; top: 0; right: 0; background: transparent; border: none; padding: 8px; cursor: pointer; color: #666; transition: color 0.2s ease;" onmouseover="this.style.color='#212121'" onmouseout="this.style.color='#666'">
        <svg id="edit-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      ` : ''}
      <div class="detail-grid" id="contact-fields" style="grid-template-columns: repeat(2, 1fr); gap: 12px;">
      <div class="detail-field">
        <div class="detail-label">Name</div>
        <div class="detail-value" id="display-name">${lead.name}</div>
        ${enableEdit ? `<input type="text" class="edit-input hidden" id="edit-name" value="${lead.name}" />` : ''}
      </div>
      <div class="detail-field">
        <div class="detail-label">Email</div>
        <div class="detail-value" id="display-email">${lead.email}</div>
        ${enableEdit ? `<input type="email" class="edit-input hidden" id="edit-email" value="${lead.email}" />` : ''}
      </div>
      ${lead.phone ? `
      <div class="detail-field">
        <div class="detail-label">Phone</div>
        <div class="detail-value" id="display-phone">${lead.phone}</div>
        ${enableEdit ? `<input type="tel" class="edit-input hidden" id="edit-phone" value="${lead.phone}" oninput="formatPhoneInput(this)" />` : ''}
      </div>
      ` : '<div class="detail-field"></div>'}
      ${(lead.ageRange || lead.age) ? `
      <div class="detail-field">
        <div class="detail-label">${lead.ageRange ? 'Age Range' : 'Age'}</div>
        <div class="detail-value" id="display-age">${lead.ageRange || lead.age}</div>
        ${enableEdit ? `<input type="text" class="edit-input hidden" id="edit-age" value="${lead.ageRange || lead.age}" />` : ''}
      </div>
      ` : (!lead.phone ? '<div class="detail-field"></div>' : '')}
      ${lead.source ? `
      <div class="detail-field">
        <div class="detail-label">Source</div>
        <div class="detail-value" id="display-source">${lead.source}</div>
        ${enableEdit ? `
        <select class="edit-input hidden" id="edit-source">
          <option value="Walk-in" ${lead.source === 'Walk-in' ? 'selected' : ''}>Walk-in</option>
          <option value="Phone Call" ${lead.source === 'Phone Call' ? 'selected' : ''}>Phone Call</option>
          <option value="Referral" ${lead.source === 'Referral' ? 'selected' : ''}>Referral</option>
          <option value="Social Media" ${lead.source === 'Social Media' ? 'selected' : ''}>Social Media</option>
          <option value="Website" ${lead.source === 'Website' ? 'selected' : ''}>Website</option>
          <option value="AI Consult" ${lead.source === 'AI Consult' ? 'selected' : ''}>AI Consult Tool</option>
          <option value="Early Lead Capture" ${lead.source === 'Early Lead Capture' ? 'selected' : ''}>Early Lead Capture</option>
          <option value="Consultation Form" ${lead.source === 'Consultation Form' ? 'selected' : ''}>Consultation Form</option>
          <option value="Other" ${lead.source === 'Other' ? 'selected' : ''}>Other</option>
        </select>
        ` : ''}
      </div>
      ` : '<div class="detail-field"></div>'}
      <div class="detail-field">
        <div class="detail-label">Last Activity</div>
        <div class="detail-value" id="modal-last-activity">${lastActivityRelative}</div>
      </div>
      </div>
      ${enableEdit ? `
      <div class="edit-actions hidden" id="edit-actions">
        <button class="btn-secondary btn-sm" onclick="cancelEdit()">Cancel</button>
        <button class="btn-primary btn-sm" onclick="saveLeadEdits()">Save Changes</button>
      </div>
      ` : ''}
    </div>
  `;
}

function viewLeadDetails(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  currentLeadId = leadId;
  
  // Calculate last activity (most recent contact or creation date)
  const lastActivityDate = lead.lastContact ? formatDate(lead.lastContact) : (lead.createdAt ? formatDate(lead.createdAt) : 'No activity yet');
  const lastActivityRelative = lead.lastContact ? formatRelativeDate(lead.lastContact) : (lead.createdAt ? formatRelativeDate(lead.createdAt) : 'No activity yet');
  
  document.getElementById('modal-lead-name').textContent = lead.name;
  document.getElementById('modal-status').className = `status-badge ${lead.status}`;
  document.getElementById('modal-status').textContent = formatStatus(lead.status);
  
  // Note: status-select and modal-email-btn are now in the modal body, so they'll be set after the body is rendered
  
  const appointmentInfo = lead.appointmentDate ? `
      <div class="detail-section-title">Appointment</div>
      <div class="detail-value">${formatDate(lead.appointmentDate)}</div>
  ` : '';
  
  const conversionInfo = (lead.status === 'converted' && (lead.treatmentReceived || lead.revenue)) ? `
      <div class="detail-section-title">Conversion Details</div>
      <div class="detail-grid" style="grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${lead.treatmentReceived ? `
        <div class="detail-field">
          <div class="detail-label">Treatment</div>
          <div class="detail-value">${lead.treatmentReceived}</div>
        </div>
        ` : ''}
        ${lead.revenue ? `
        <div class="detail-field">
          <div class="detail-label">Revenue</div>
          <div class="detail-value" style="color: #2e7d32; font-weight: 700;">$${lead.revenue.toLocaleString()}</div>
        </div>
        ` : ''}
      </div>
  ` : '';
  
  // Get front photo URL if available
  let frontPhotoUrl = null;
  if (lead.frontPhoto && Array.isArray(lead.frontPhoto) && lead.frontPhoto.length > 0) {
    const attachment = lead.frontPhoto[0];
    frontPhotoUrl = attachment.thumbnails?.large?.url || 
                    attachment.thumbnails?.full?.url ||
                    attachment.url;
  }
  
  // Determine which forms have been completed
  const hasWebPopupForm = lead.tableSource === "Web Popup Leads";
  const hasFacialAnalysisForm = lead.tableSource === "Patients";
  
  // Check if Web Popup Leads form has meaningful data (beyond just name/email)
  const webPopupFormHasData = hasWebPopupForm && (
    lead.ageRange || 
    lead.skinType || 
    lead.skinTone || 
    lead.ethnicBackground ||
    ((typeof lead.concerns === 'string' && lead.concerns.trim()) || (Array.isArray(lead.concerns) && lead.concerns.length > 0)) ||
    (lead.areas && lead.areas.length > 0) ||
    (lead.aestheticGoals && (typeof lead.aestheticGoals === 'string' ? lead.aestheticGoals.trim() : String(lead.aestheticGoals).trim())) ||
    (lead.concernsExplored && (Array.isArray(lead.concernsExplored) ? lead.concernsExplored.length > 0 : lead.concernsExplored)) ||
    lead.offerClaimed
  );
  
  // Check if Facial Analysis form has meaningful data
  const facialAnalysisFormHasData = hasFacialAnalysisForm && (
    lead.age ||
    (lead.aestheticGoals && (typeof lead.aestheticGoals === 'string' ? lead.aestheticGoals.trim() : String(lead.aestheticGoals).trim())) ||
    lead.whichRegions ||
    lead.skinComplaints ||
    lead.areasOfInterestFromForm ||
    lead.processedAreasOfInterest ||
    (lead.goals && Array.isArray(lead.goals) && lead.goals.length > 0) ||
    lead.facialAnalysisStatus ||
    frontPhotoUrl ||
    lead.allIssues ||
    lead.interestItems
  );

  // Set modal body content
  document.getElementById('modal-body').innerHTML = `
    
    <div class="detail-section ${frontPhotoUrl ? 'modal-header-with-photo' : ''}" style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      ${frontPhotoUrl ? `
        <div class="modal-photo-container">
          <img src="${frontPhotoUrl}" alt="${lead.name}" class="modal-photo" />
        </div>
      ` : ''}
      ${generateContactInformationSection(lead, lastActivityRelative, true)}
    </div>
    
    <!-- Web Popup Leads Form Section -->
    <div class="detail-section" style="border-top: 2px solid #4A90E2; padding-top: 20px; margin-top: 20px; background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #4A90E2;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div class="detail-section-title" style="margin: 0; display: flex; align-items: center; gap: 10px;">
          <span>AI Consults</span>
        </div>
        <span class="status-badge" style="
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: ${webPopupFormHasData ? '#4CAF50' : '#ff9800'};
          color: white;
        ">
          ${webPopupFormHasData ? '✓ Completed' : '⚠ Not Completed'}
        </span>
      </div>
      ${webPopupFormHasData ? `
        ${(((typeof lead.concerns === 'string' && lead.concerns.trim()) || (Array.isArray(lead.concerns) && lead.concerns.length > 0)) || (lead.areas && lead.areas.length > 0)) ? `
        <div style="margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${((typeof lead.concerns === 'string' && lead.concerns.trim()) || (Array.isArray(lead.concerns) && lead.concerns.length > 0)) ? `
          <div>
            <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Concerns</div>
            <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(typeof lead.concerns === 'string' 
                ? lead.concerns.split(',').map(c => c.trim()).filter(c => c)
                : (Array.isArray(lead.concerns) ? lead.concerns : [])
              ).map(c => `<span class="detail-tag secondary" style="font-size: 11px; padding: 4px 8px;">${c}</span>`).join('')}
            </div>
          </div>
          ` : '<div></div>'}
          ${lead.areas && lead.areas.length > 0 ? `
          <div>
            <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Areas of Interest</div>
            <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(Array.isArray(lead.areas) ? lead.areas : [lead.areas]).map(a => `<span class="detail-tag" style="font-size: 11px; padding: 4px 8px;">${a}</span>`).join('')}
            </div>
          </div>
          ` : '<div></div>'}
        </div>
        ` : ''}
        ${(lead.skinType || lead.skinTone || lead.ethnicBackground) ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Demographics</div>
          <div class="detail-grid" style="grid-template-columns: repeat(3, 1fr); gap: 12px;">
            ${lead.skinType ? `
            <div class="detail-field">
              <div class="detail-label" style="font-size: 11px; margin-bottom: 4px;">Skin Type</div>
              <div class="detail-value" style="font-size: 13px;">${lead.skinType && lead.skinType.length > 0 ? lead.skinType.charAt(0).toUpperCase() + lead.skinType.slice(1) : lead.skinType}</div>
            </div>
            ` : ''}
            ${lead.skinTone ? `
            <div class="detail-field">
              <div class="detail-label" style="font-size: 11px; margin-bottom: 4px;">Skin Tone</div>
              <div class="detail-value" style="font-size: 13px;">${lead.skinTone && lead.skinTone.length > 0 ? lead.skinTone.charAt(0).toUpperCase() + lead.skinTone.slice(1) : lead.skinTone}</div>
            </div>
            ` : ''}
            ${lead.ethnicBackground ? `
            <div class="detail-field">
              <div class="detail-label" style="font-size: 11px; margin-bottom: 4px;">Ethnic Background</div>
              <div class="detail-value" style="font-size: 13px;">${lead.ethnicBackground && lead.ethnicBackground.length > 0 ? lead.ethnicBackground.charAt(0).toUpperCase() + lead.ethnicBackground.slice(1) : lead.ethnicBackground}</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        ${lead.aestheticGoals && (typeof lead.aestheticGoals === 'string' ? lead.aestheticGoals.trim() : String(lead.aestheticGoals).trim()) && lead.tableSource === "Web Popup Leads" ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Patient Goals</div>
          <div style="padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #4A90E2; font-size: 14px; line-height: 1.5; color: #333;">
            "${lead.aestheticGoals}"
          </div>
        </div>
        ` : ''}
        ${lead.concernsExplored && (Array.isArray(lead.concernsExplored) ? lead.concernsExplored.length > 0 : lead.concernsExplored) ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Concerns Explored</div>
          <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(Array.isArray(lead.concernsExplored) ? lead.concernsExplored : [lead.concernsExplored]).map(c => `<span class="detail-tag secondary" style="font-size: 11px; padding: 4px 8px;">${c}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        ${lead.offerClaimed ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Offer Status</div>
          <div style="padding: 12px; background: #E8F5E9; border-radius: 8px; border-left: 4px solid #4CAF50;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">✓</span>
              <strong style="color: #2E7D32; font-size: 13px;">$50 Off Offer Claimed</strong>
            </div>
          </div>
        </div>
        ` : ''}
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0e7ff;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 10px; font-weight: 600;">Actions</div>
          <div>
            <a href="mailto:${lead.email}" class="btn-secondary btn-sm" id="modal-email-btn" style="width: 100%; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Lead
            </a>
          </div>
        </div>
      ` : `
      `}
    </div>
    
    <!-- Facial Analysis Section -->
    <div class="detail-section" style="border-top: 2px solid #9C27B0; padding-top: 20px; margin-top: 20px; background: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #9C27B0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div class="detail-section-title" style="margin: 0; display: flex; align-items: center; gap: 10px;">
          <span>Facial Analysis</span>
        </div>
        ${facialAnalysisFormHasData && lead.facialAnalysisStatus ? `
        <span class="status-badge" style="
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: ${getFacialStatusColor(lead.facialAnalysisStatus)};
          color: white;
        ">
          ${formatFacialStatus(lead.facialAnalysisStatus)}
        </span>
        ` : `
        <span class="status-badge" style="
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: #ff9800;
          color: white;
        ">
          Not Completed
        </span>
        `}
      </div>
      ${facialAnalysisFormHasData ? `
        ${lead.aestheticGoals && (typeof lead.aestheticGoals === 'string' ? lead.aestheticGoals.trim() : String(lead.aestheticGoals).trim()) && lead.tableSource === "Patients" ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">What would you like to improve?</div>
          <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(typeof lead.aestheticGoals === 'string' 
              ? lead.aestheticGoals.split(',').map(g => g.trim()).filter(g => g)
              : [lead.aestheticGoals]
            ).map(g => `<span class="detail-tag" style="font-size: 11px; padding: 4px 8px; background: #E1BEE7; color: #4A148C;">${g}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        ${(() => {
          // Consolidate: prefer processedAreasOfInterest, then areasOfInterestFromForm, then whichRegions (they're all the same)
          const areasToShow = lead.processedAreasOfInterest || lead.areasOfInterestFromForm || lead.whichRegions;
          return areasToShow && lead.tableSource === "Patients" ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Areas of Interest</div>
          <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(typeof areasToShow === 'string' 
              ? areasToShow.split(',').map(a => a.trim()).filter(a => a)
              : [areasToShow]
            ).map(a => `<span class="detail-tag" style="font-size: 11px; padding: 4px 8px; background: #F3E5F5; color: #6A1B9A;">${a}</span>`).join('')}
          </div>
        </div>
        ` : '';
        })()}
        ${lead.skinComplaints && lead.tableSource === "Patients" ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Do you have any skin complaints?</div>
          <div style="padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #9C27B0; font-size: 14px; line-height: 1.5; color: #333;">
            ${lead.skinComplaints}
          </div>
        </div>
        ` : ''}
        ${lead.goals && Array.isArray(lead.goals) && lead.goals.length > 0 && lead.tableSource === "Patients" ? `
        <div style="margin-bottom: 12px;">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Treatment Interests</div>
          <div class="detail-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${lead.goals.map(g => `<span class="detail-tag" style="font-size: 11px; padding: 4px 8px; background: #C5E1A5; color: #33691E;">${g}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        ${(lead.allIssues || lead.interestItems) ? `
          <button 
            class="btn-secondary btn-sm" 
            onclick="toggleAnalysisResults('${lead.id}')"
            style="width: 100%; padding: 10px 16px; font-size: 13px; font-weight: 500; margin-bottom: 20px;"
            id="toggle-analysis-btn-${lead.id}"
          >
            <span id="toggle-analysis-text-${lead.id}">View Analysis Results & Interests</span>
            <svg id="toggle-analysis-icon-${lead.id}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px; display: inline-block; vertical-align: middle; transition: transform 0.3s ease;">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div id="analysis-results-section-${lead.id}" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1BEE7;">
            <div class="detail-label" style="font-size: 14px; color: #666; margin-bottom: 16px; font-weight: 600;">Analysis Results</div>
            ${generateAnalysisResultsHTML(lead)}
          </div>
          ` : ''}
        </div>
      ` : ''}
      ${(() => {
        // Show scan buttons only if scan is not completed
        // Consider completed if status includes "reviewed" or is a final state
        const status = lead.facialAnalysisStatus ? String(lead.facialAnalysisStatus).toLowerCase().trim() : '';
        const isCompleted = status && (status.includes('reviewed') || status.includes('completed') || status.includes('done'));
        // Show buttons if no status (not started) or if status exists but is not completed
        return !isCompleted ? `
        <div style="margin-top: ${facialAnalysisFormHasData ? '20px' : '0'}; padding-top: 16px; border-top: ${facialAnalysisFormHasData ? '1px solid #E1BEE7' : 'none'};">
          <div class="detail-label" style="font-size: 12px; color: #666; margin-bottom: 12px; font-weight: 600;">Actions</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button 
              class="btn-primary btn-sm" 
              onclick="requestTelehealthFacialAnalysis('${lead.id}')"
              style="padding: 10px 16px; font-size: 13px; font-weight: 500;"
              ${!lead.phone ? 'disabled title="Phone number required"' : ''}
            >
              Request Telehealth Scan
            </button>
            <button 
              class="btn-secondary btn-sm" 
              onclick="scanPatientNow('${lead.id}')"
              style="padding: 10px 16px; font-size: 13px; font-weight: 500;"
            >
              Scan Patient Now
            </button>
          </div>
        </div>
        ` : '';
      })()}
      ${!facialAnalysisFormHasData ? `
        <div style="padding: 16px; background: white; border-radius: 6px; text-align: center; color: #999; font-size: 13px; margin-top: 20px;">
          This patient has not completed the Facial Analysis form.
        </div>
      ` : ''}
    </div>
    </div>
    
    ${appointmentInfo ? `
    <div class="detail-section" style="border-top: 1px solid #e8e8e8; padding-top: 20px; margin-top: 20px; background: #fafafa; padding: 20px; border-radius: 8px;">
      ${appointmentInfo}
    </div>
    ` : ''}
    
    ${conversionInfo ? `
    <div class="detail-section" style="border-top: 1px solid #e8e8e8; padding-top: 20px; margin-top: 20px; background: #fafafa; padding: 20px; border-radius: 8px;">
      ${conversionInfo}
    </div>
    ` : ''}
    
    <div class="detail-section" style="border-top: 1px solid #e8e8e8; padding-top: 20px; margin-top: 20px; background: #fafafa; padding: 20px; border-radius: 8px;">
      <div class="detail-section-title" style="display: flex; align-items: center; justify-content: space-between;">
        <span>Contact History</span>
        <button class="edit-toggle-btn" onclick="showAddContactLog()">+ Add Entry</button>
      </div>
      <div class="contact-history" id="contact-history">
        ${renderContactHistory(lead)}
      </div>
      <div class="add-contact-log hidden" id="add-contact-log">
        <div class="form-row">
          <div class="form-group">
            <label>Contact Type</label>
            <select id="contact-log-type">
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="text">Text Message</option>
              <option value="meeting">In-Person</option>
            </select>
          </div>
          <div class="form-group">
            <label>Outcome</label>
            <select id="contact-log-outcome">
              <option value="reached">Reached</option>
              <option value="voicemail">Left Voicemail</option>
              <option value="no-answer">No Answer</option>
              <option value="scheduled">Scheduled Appointment</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea id="contact-log-notes" rows="2" placeholder="What was discussed..."></textarea>
        </div>
        <div class="edit-actions">
          <button class="btn-secondary btn-sm" onclick="hideAddContactLog()">Cancel</button>
          <button class="btn-primary btn-sm" onclick="saveContactLog()">Save Entry</button>
        </div>
      </div>
    </div>
    
    <!-- Archive Action -->
    <div class="detail-section" style="border-top: 1px solid #e8e8e8; padding-top: 20px; margin-top: 20px; background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div class="detail-label" style="font-size: 13px; color: #666; margin-bottom: 4px; font-weight: 600;">Archive Lead</div>
          <div style="font-size: 12px; color: #999;">Archive this lead to remove it from active lists</div>
        </div>
        <button class="btn-secondary btn-sm" id="archive-btn" onclick="toggleArchiveLead()">
          <span id="archive-btn-text">Archive</span>
        </button>
      </div>
    </div>
  `;
  
  // Update elements that are now in the modal body after it's rendered
  setTimeout(() => {
    // Update status select
    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
      statusSelect.value = lead.status;
    }
    
    // Update email button href
    const emailBtn = document.getElementById('modal-email-btn');
    if (emailBtn) {
      emailBtn.href = `mailto:${lead.email}`;
    }
    
    // Update archive button state
    const archiveBtn = document.getElementById('archive-btn');
    const archiveBtnText = document.getElementById('archive-btn-text');
    if (archiveBtn && archiveBtnText) {
      if (lead.archived) {
        archiveBtnText.textContent = 'Unarchive';
        archiveBtn.className = 'btn-primary btn-sm';
      } else {
        archiveBtnText.textContent = 'Archive';
        archiveBtn.className = 'btn-secondary btn-sm';
      }
    }
  }, 0);
  
  document.getElementById('lead-modal').classList.add('active');
}

// Contact History Functions
function renderContactHistory(lead) {
  const history = lead.contactHistory || [];
  const entries = [];
  
  // Add facial analysis entries if available
  if (lead.facialAnalysisStatus && lead.facialAnalysisStatus !== '' && lead.facialAnalysisStatus !== 'not-started') {
    // Try to find when facial analysis was completed (could be from createdAt or a separate field)
    const facialAnalysisDate = lead.createdAt || new Date().toISOString();
    entries.push({
      type: 'facial-analysis',
      date: facialAnalysisDate,
      status: lead.facialAnalysisStatus,
      notes: `Facial analysis status: ${formatFacialStatus(lead.facialAnalysisStatus)}`
    });
  }
  
  // Add regular contact history entries
  entries.push(...history);
  
  // Sort by date (most recent first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (entries.length === 0) {
    return '<div class="no-data">No contact history yet. Add your first interaction!</div>';
  }
  
  return entries.map(entry => {
    if (entry.type === 'facial-analysis') {
      return `
        <div class="contact-entry">
          <div class="contact-entry-header">
            <span class="contact-type facial-analysis">Facial Analysis</span>
            <span class="contact-date">${formatRelativeDate(entry.date)}</span>
          </div>
          <div class="contact-outcome">Status: ${formatFacialStatus(entry.status)}</div>
          ${entry.notes ? `<div class="contact-notes">${entry.notes}</div>` : ''}
        </div>
      `;
    }
    
    return `
      <div class="contact-entry">
        <div class="contact-entry-header">
          <span class="contact-type ${entry.type}">${formatContactType(entry.type)}</span>
          <span class="contact-date">${formatRelativeDate(entry.date)}</span>
        </div>
        <div class="contact-outcome ${entry.outcome}">${formatOutcome(entry.outcome)}</div>
        ${entry.notes ? `<div class="contact-notes">${entry.notes}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Removed getContactTypeIcon - using formatContactType instead

function formatContactType(type) {
  const labels = { call: 'Phone Call', email: 'Email', text: 'Text', meeting: 'In-Person' };
  return labels[type] || type;
}

function formatOutcome(outcome) {
  const labels = { 
    reached: 'Reached', 
    voicemail: 'Left Voicemail', 
    'no-answer': 'No Answer',
    scheduled: 'Appointment Scheduled'
  };
  return labels[outcome] || outcome;
}

function showAddContactLog() {
  document.getElementById('add-contact-log').classList.remove('hidden');
}

function hideAddContactLog() {
  document.getElementById('add-contact-log').classList.add('hidden');
  document.getElementById('contact-log-notes').value = '';
}

async function saveContactLog() {
  if (!currentLeadId) return;
  
  const lead = leads.find(l => l.id === currentLeadId);
  if (!lead) return;
  
  const type = document.getElementById('contact-log-type').value;
  const outcome = document.getElementById('contact-log-outcome').value;
  const notes = document.getElementById('contact-log-notes').value.trim();
  
  // Initialize contact history if doesn't exist
  if (!lead.contactHistory) {
    lead.contactHistory = [];
  }
  
  // Add new entry at the beginning
  const newEntry = {
    id: Date.now(),
    type: type,
    outcome: outcome,
    notes: notes,
    date: new Date().toISOString()
  };
  lead.contactHistory.unshift(newEntry);
  
  // Update last contact
  lead.lastContact = new Date().toISOString();
  
  // If they scheduled, update status
  if (outcome === 'scheduled' && lead.status !== 'converted') {
    lead.status = 'scheduled';
  } else if (lead.status === 'new') {
    lead.status = 'contacted';
  }
  
  // Save to Airtable Contact History table
  if (!USE_MOCK_DATA && lead.isReal) {
    try {
      // Map contact type and outcome to Airtable format
      const contactTypeMap = {
        'call': 'Phone Call',
        'email': 'Email',
        'text': 'Text Message',
        'meeting': 'In-Person'
      };
      const outcomeMap = {
        'reached': 'Reached',
        'voicemail': 'Left Voicemail',
        'no-answer': 'No Answer',
        'scheduled': 'Scheduled Appointment'
      };
      
      // Create new contact history record
      const contactHistoryTableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contact History`;
      const linkField = lead.tableSource === "Patients" ? "Patient" : "Web Popup Lead";
      
      const contactHistoryFields = {
        [linkField]: [lead.id], // Link to the lead/patient
        "Contact Type": contactTypeMap[type] || "Phone Call",
        "Outcome": outcomeMap[outcome] || "Reached",
        "Notes": notes,
        "Date": new Date().toISOString()
      };
      
      const createResponse = await fetch(contactHistoryTableUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: contactHistoryFields }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error?.message || "Failed to create contact history record");
      }
      
      const createdRecord = await createResponse.json();
      // Update the entry with the actual record ID
      newEntry.id = createdRecord.id;
      
      // Update the lead's Status in the main table (Last Contact is now derived from Contact History table)
      const tableName = lead.tableSource || "Web Popup Leads";
      const updateFields = {};
      
      // Update status if it changed
      if (outcome === 'scheduled' && lead.status !== 'converted') {
        updateFields["Status"] = "Scheduled";
        updateFields["Contacted"] = true;
      } else if (lead.status === 'contacted') {
        updateFields["Status"] = "Contacted";
        updateFields["Contacted"] = true;
      }
      
      // Only update if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
        await fetch(`${tableUrl}/${lead.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: updateFields }),
        });
      }
      
      console.log(`Saved contact history entry to Airtable for ${lead.name}`);
    } catch (error) {
      console.error("Error saving contact history to Airtable:", error);
      showError("Failed to save contact history. Please try again.");
      // Revert the change on error
      lead.contactHistory.shift();
      return;
    }
  }
  
  // Re-render history
  document.getElementById('contact-history').innerHTML = renderContactHistory(lead);
  hideAddContactLog();
  
  // Update views
  renderKanban();
  renderList();
  
  showToast('Contact log added!');
}

function closeLeadModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('lead-modal').classList.remove('active');
  currentLeadId = null;
  isEditMode = false;
}

// Edit Lead Functions
let isEditMode = false;

function toggleEditMode() {
  isEditMode = !isEditMode;
  
  const displayFields = document.querySelectorAll('.detail-value');
  const editFields = document.querySelectorAll('.edit-input');
  const editActions = document.getElementById('edit-actions');
  const editBtnText = document.getElementById('edit-btn-text');
  
  if (isEditMode) {
    displayFields.forEach(f => f.classList.add('hidden'));
    editFields.forEach(f => f.classList.remove('hidden'));
    editActions.classList.remove('hidden');
    editBtnText.textContent = 'Cancel';
  } else {
    displayFields.forEach(f => f.classList.remove('hidden'));
    editFields.forEach(f => f.classList.add('hidden'));
    editActions.classList.add('hidden');
    editBtnText.textContent = '✏️ Edit';
  }
}

function cancelEdit() {
  isEditMode = true; // Set to true so toggle sets it to false
  toggleEditMode();
  // Re-open the modal to reset values
  viewLeadDetails(currentLeadId);
}

function saveLeadEdits() {
  if (!currentLeadId) return;
  
  const lead = leads.find(l => l.id === currentLeadId);
  if (!lead) return;
  
  const newName = document.getElementById('edit-name').value.trim();
  const newEmail = document.getElementById('edit-email').value.trim();
  const newPhone = document.getElementById('edit-phone').value.trim();
  const newAge = document.getElementById('edit-age').value;
  const newSource = document.getElementById('edit-source').value;
  
  // Validate
  if (!newName) {
    showToast('Name is required');
    return;
  }
  if (!isValidEmail(newEmail)) {
    showToast('Please enter a valid email');
    return;
  }
  if (newPhone && !isValidPhone(newPhone)) {
    showToast('Please enter a valid phone number');
    return;
  }
  
  // Update the lead
  lead.name = newName;
  lead.email = newEmail;
  lead.phone = newPhone;
  lead.age = newAge ? parseInt(newAge, 10) : null;
  lead.source = newSource;
  
  // Update displays
  document.getElementById('display-name').textContent = newName;
  document.getElementById('display-email').textContent = newEmail;
  document.getElementById('display-phone').textContent = newPhone || 'Not provided';
  document.getElementById('display-age').textContent = newAge || 'Not provided';
  document.getElementById('display-source').textContent = newSource;
  document.getElementById('modal-lead-name').textContent = newName;
  document.getElementById('modal-email-btn').href = `mailto:${newEmail}`;
  
  // Exit edit mode
  isEditMode = true;
  toggleEditMode();
  
  // Re-render views
  renderKanban();
  renderList();
  
  showToast(`Updated ${newName}'s information`);
}

// Add Lead Modal Functions
function showAddLeadModal() {
  document.getElementById('add-lead-modal').classList.add('active');
  document.getElementById('new-lead-name').focus();
}

function closeAddLeadModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('add-lead-modal').classList.remove('active');
  document.getElementById('add-lead-form').reset();
}

function handleAddLead(event) {
  event.preventDefault();
  
  const name = document.getElementById('new-lead-name').value.trim();
  const email = document.getElementById('new-lead-email').value.trim();
  const phone = document.getElementById('new-lead-phone').value.trim();
  const ageInput = document.getElementById('new-lead-age').value;
  const age = ageInput ? parseInt(ageInput, 10) : null;
  const source = document.getElementById('new-lead-source').value;
  const notes = document.getElementById('new-lead-notes').value.trim();
  
  // Validate email
  if (!isValidEmail(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    document.getElementById('new-lead-email').focus();
    return;
  }
  document.getElementById('email-error').textContent = '';
  
  // Validate phone if provided
  if (phone && !isValidPhone(phone)) {
    document.getElementById('phone-error').textContent = 'Please enter a valid phone number';
    document.getElementById('new-lead-phone').focus();
    return;
  }
  document.getElementById('phone-error').textContent = '';
  
  // Create new lead object
  const newLead = {
    id: 'manual_' + Date.now(),
    name: name,
    email: email,
    phone: phone,
    age: age,
    goals: [],
    concerns: "",
    aestheticGoals: notes,
    photosLiked: 0,
    photosViewed: 0,
    treatmentsViewed: [],
    source: source,
    status: "new",
    priority: "medium",
    createdAt: new Date().toISOString(),
    notes: notes,
    isManual: true
  };
  
  // Add to leads array at the beginning
  leads.unshift(newLead);
  filteredLeads = [...leads];
  
  // Re-render the views
  renderKanban();
  renderListView();
  renderAnalytics();
  
  // Close modal and show success
  closeAddLeadModal();
  showToast(`Added ${name} as a new lead!`);
}

// Phone formatting
function formatPhoneInput(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 10) value = value.substring(0, 10);
  
  if (value.length >= 6) {
    input.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
  } else if (value.length >= 3) {
    input.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
  } else if (value.length > 0) {
    input.value = `(${value}`;
  }
}

// Validation helpers
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function updateLeadStatus() {
  if (!currentLeadId) return;
  
  const newStatus = document.getElementById('status-select').value;
  const lead = leads.find(l => l.id === currentLeadId);
  
  if (lead) {
    // Update in Airtable (or local state for mock data)
    updateLeadStatusInAirtable(currentLeadId, newStatus);
    
    // Update modal badge
    document.getElementById('modal-status').className = `status-badge ${newStatus}`;
    document.getElementById('modal-status').textContent = formatStatus(newStatus);
    
    showToast(`Updated ${lead.name} to ${formatStatus(newStatus)}`);
  }
}

/**
 * Update lead status in Airtable
 * Handles both "Web Popup Leads" and "Patients" tables
 */
async function updateLeadStatusInAirtable(leadId, newStatus) {
  if (USE_MOCK_DATA) {
    // Just update local state for mock data
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = newStatus;
      renderKanban();
      renderList();
    }
    return;
  }

  try {
    // Find the lead to determine which table it's in
    const lead = leads.find(l => l.id === leadId);
    const tableName = lead?.tableSource || "Web Popup Leads"; // Default to Web Popup Leads for backward compatibility
    
    // Map dashboard status to Airtable fields
    const fields = {};
    
    // Update Status field if it exists
    fields["Status"] = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    
    // Also update Contacted checkbox for backward compatibility
    if (newStatus === "contacted" || newStatus === "scheduled" || newStatus === "converted") {
      fields["Contacted"] = true;
    } else {
      fields["Contacted"] = false;
    }

    const tableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
    const response = await fetch(
      `${tableUrl}/${leadId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to update lead");
    }

    // Update local state
    if (lead) {
      lead.status = newStatus;
    }

    // Update UI
    renderKanban();
    renderList();
    updateSidebarStats();
    if (currentLeadId === leadId) {
      viewLeadDetails(leadId); // Refresh modal
    }

    console.log(`Updated lead status to ${newStatus} in ${tableName}`);
  } catch (error) {
    console.error("Error updating lead:", error);
    showError("Failed to update lead status. Please try again.");
  }
}

function showError(message) {
  showToast(`Error: ${message}`);
}

// Analytics
function renderAnalytics() {
  // Filter by archived status for analytics
  const activeLeads = leads.filter(l => !l.archived);
  
  // Summary stats
  const totalLeads = activeLeads.length;
  const convertedLeads = activeLeads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  // Calculate average age - parse and validate age values
  const ages = activeLeads
    .map(l => {
      const age = l.age;
      if (age === null || age === undefined) return null;
      // Parse to number if it's a string
      const numAge = typeof age === 'string' ? parseFloat(age) : Number(age);
      // Validate: must be a number, between 0 and 150 (reasonable age range)
      if (isNaN(numAge) || numAge < 0 || numAge > 150) return null;
      return numAge;
    })
    .filter(age => age !== null);
  
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  
  // This week's new leads
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = activeLeads.filter(l => {
    const leadDate = new Date(l.createdAt);
    return leadDate >= oneWeekAgo;
  }).length;
  
  const scheduled = activeLeads.filter(l => l.status === 'scheduled').length;
  
  // Update summary stats
  document.getElementById('summary-total').textContent = totalLeads;
  document.getElementById('summary-conversion-rate').textContent = conversionRate + '%';
  document.getElementById('summary-avg-age').textContent = avgAge !== null ? avgAge : '-';
  document.getElementById('summary-new-this-week').textContent = newThisWeek;
  document.getElementById('summary-scheduled').textContent = scheduled;
  document.getElementById('summary-converted').textContent = convertedLeads;

  // Funnel numbers
  const funnelData = {
    started: 156,
    completed: 132,
    captured: activeLeads.length,
    contacted: activeLeads.filter(l => ['contacted', 'scheduled', 'converted'].includes(l.status)).length,
    booked: activeLeads.filter(l => ['scheduled', 'converted'].includes(l.status)).length
  };

  document.getElementById('funnel-started').textContent = funnelData.started;
  document.getElementById('funnel-completed').textContent = funnelData.completed;
  document.getElementById('funnel-captured').textContent = funnelData.captured;
  document.getElementById('funnel-contacted').textContent = funnelData.contacted;
  document.getElementById('funnel-booked').textContent = funnelData.booked;
  
  // Top treatments
  const treatments = {};
  activeLeads.forEach(lead => {
    lead.treatmentsViewed?.forEach(t => {
      treatments[t] = (treatments[t] || 0) + 1;
    });
  });
  
  const topTreatments = Object.entries(treatments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  document.getElementById('top-treatments').innerHTML = topTreatments.map(([name, count]) => `
    <div class="analytics-item">
      <span class="analytics-item-label">${name}</span>
      <span class="analytics-item-value">${count} views</span>
    </div>
  `).join('');
  
  // Lead sources
  document.getElementById('lead-sources').innerHTML = `
    <div class="analytics-item">
      <span class="analytics-item-label">AI Consultation</span>
      <span class="analytics-item-value">${leads.length}</span>
    </div>
    <div class="analytics-item">
      <span class="analytics-item-label">Website Form</span>
      <span class="analytics-item-value">0</span>
    </div>
    <div class="analytics-item">
      <span class="analytics-item-label">Phone Inquiry</span>
      <span class="analytics-item-value">0</span>
    </div>
  `;
  
  // Age demographics
  const ageGroups = {
    '25-34': leads.filter(l => l.age >= 25 && l.age < 35).length,
    '35-44': leads.filter(l => l.age >= 35 && l.age < 45).length,
    '45-54': leads.filter(l => l.age >= 45 && l.age < 55).length,
    '55+': leads.filter(l => l.age >= 55).length
  };
  
  document.getElementById('age-demographics').innerHTML = Object.entries(ageGroups).map(([range, count]) => `
    <div class="analytics-item">
      <span class="analytics-item-label">${range}</span>
      <span class="analytics-item-value">${count}</span>
    </div>
  `).join('');
  
  // This week's activity (reuse oneWeekAgo from above)
  const weekLeads = leads.filter(l => {
    const leadDate = new Date(l.createdAt);
    return leadDate >= oneWeekAgo;
  });
  document.getElementById('week-new').textContent = weekLeads.filter(l => l.status === 'new').length + 
    weekLeads.filter(l => l.status === 'contacted').length;
  document.getElementById('week-contacted').textContent = weekLeads.filter(l => 
    ['contacted', 'scheduled', 'converted'].includes(l.status)).length;
  document.getElementById('week-booked').textContent = weekLeads.filter(l => 
    ['scheduled', 'converted'].includes(l.status)).length;
}

// Utilities
function formatStatus(status) {
  const labels = {
    new: 'New Lead',
    contacted: 'Contacted',
    scheduled: 'Scheduled',
    converted: 'Converted'
  };
  return labels[status] || status;
}

function formatFacialStatus(status) {
  // Handle null, undefined, or empty strings
  if (!status || (typeof status === 'string' && status.trim() === '')) {
    return 'Not Started';
  }
  const normalized = String(status).trim();
  // Handle common variations
  if (normalized.toLowerCase() === 'pending') return 'Pending';
  if (normalized.toLowerCase() === 'ready') return 'Ready';
  if (normalized.toLowerCase().includes('patient reviewed') || normalized.toLowerCase().includes('reviewed')) {
    return 'Patient Reviewed';
  }
  return normalized;
}

function getFacialStatusColor(status) {
  // Handle null, undefined, or empty strings - show "Not Started" in gray
  if (!status || (typeof status === 'string' && status.trim() === '')) {
    return '#9E9E9E'; // Gray for "Not Started"
  }
  const normalized = String(status).toLowerCase().trim();
  if (normalized === 'pending') return '#FFA726'; // Orange
  if (normalized === 'ready') return '#42A5F5'; // Blue
  if (normalized.includes('patient reviewed') || normalized.includes('reviewed')) {
    return '#66BB6A'; // Green
  }
  return '#999'; // Default gray
}

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function showToast(message) {
  // Simple toast notification
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #212121;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

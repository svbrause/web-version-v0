// Dashboard JavaScript - Connected to Airtable
// Fetches real leads from Airtable, with mock data fallback for demos
// UNIQUE AESTHETICS VERSION - Filters by Unique Aesthetics provider

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
}

const LEADS_TABLE_NAME = "Web Popup Leads";
const LEADS_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  LEADS_TABLE_NAME
)}`;

// Provider filter - Unique Aesthetics provider ID
const PROVIDER_ID = 'recN9Q4W02xtroD6g'; // Unique Aesthetics

// Facial Analysis Configuration
const JOTFORM_URL = 'https://form.jotform.com/YOUR_FORM_ID'; // Update with your actual Jotform URL
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
let currentView = 'kanban';
let currentFilter = 'all';
let currentSortField = 'createdAt';
let currentSortOrder = 'desc';
let archivedSortField = 'createdAt';
let archivedSortOrder = 'desc';
let currentLeadId = null;
let isLoading = false;

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
  initTheme();
  initNavigation();
  
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
    // Fallback to mock data if Airtable fails
    if (!USE_MOCK_DATA) {
      console.log("Falling back to mock data for demo...");
      leads = [...MOCK_LEADS];
      filteredLeads = [...leads];
      renderDashboard();
    }
  });
});

// Theme Management - Default to Pink theme (Unique Aesthetics)
function initTheme() {
  const savedTheme = localStorage.getItem('dashboard-theme');
  // Default to pink if no saved preference
  if (!savedTheme || savedTheme === 'pink') {
    // Pink is now the default, no class needed
    document.body.classList.remove('theme-warm');
    updateThemeButton('pink');
    // Save default preference
    if (!savedTheme) {
      localStorage.setItem('dashboard-theme', 'pink');
    }
  } else if (savedTheme === 'warm') {
    // Apply warm theme
    document.body.classList.add('theme-warm');
    updateThemeButton('warm');
  }
}

function toggleTheme() {
  const isWarm = document.body.classList.contains('theme-warm');
  if (isWarm) {
    // Switch to pink (default)
    document.body.classList.remove('theme-warm');
    localStorage.setItem('dashboard-theme', 'pink');
    updateThemeButton('pink');
  } else {
    // Switch to warm
    document.body.classList.add('theme-warm');
    localStorage.setItem('dashboard-theme', 'warm');
    updateThemeButton('warm');
  }
}

function updateThemeButton(theme) {
  const label = document.getElementById('theme-label');
  if (label) {
    label.textContent = theme === 'pink' ? 'Warm Theme' : 'Pink Theme';
  }
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
  
  document.getElementById(`${view}-view`).classList.add('active');
  
  // Update title
  const titles = {
    kanban: 'Lead Board',
    list: 'All Leads',
    'facial-analysis': 'Facial Analysis',
    analytics: 'Analytics',
    archived: 'Archived Leads'
  };
  document.getElementById('page-title').textContent = titles[view] || view;
  
  // Render view
  if (view === 'analytics') {
    renderAnalytics();
  } else if (view === 'facial-analysis') {
    renderFacialAnalysis();
  } else if (view === 'archived') {
    renderArchivedLeads();
  }
}

// Get list of fields to fetch for each table (reduces payload size significantly)
// Only requesting fields that actually exist in the tables
function getFieldsForTable(tableName) {
  if (tableName === "Web Popup Leads") {
    // Based on actual fields found: Name, Email Address, Phone Number, Status, Contacted, Created
    return [
      "Name", "Email Address", "Phone Number", "Status", "Contacted", "Archived", "Offer Claimed"
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
      throw new Error(
        `Airtable API error for ${tableName}: ${response.status} ${response.statusText}`
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
    age: tableName === "Patients" ? (fields["Age (from Form Submissions)"] || null) : (fields["Age"] || null),
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
      : (fields["Concerns"] || ""),
    aestheticGoals: fields["Aesthetic Goals"] || fields["Notes"] || "",
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

    // Merge real leads with mock leads (real leads first, then mock)
    leads = [...validAirtableLeads, ...MOCK_LEADS];

    // Sort by most recent first
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filteredLeads = [...leads];

    // Load contact history for all real leads
    await loadContactHistoryForLeads(validAirtableLeads);

    const webPopupCount = validAirtableLeads.filter(l => l.tableSource === "Web Popup Leads").length;
    const patientsCount = validAirtableLeads.filter(l => l.tableSource === "Patients").length;
    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Loaded ${validAirtableLeads.length} real leads (${webPopupCount} from Web Popup Leads, ${patientsCount} from Patients) + ${MOCK_LEADS.length} demo leads in ${loadTime}s`);
  } catch (error) {
    console.error("Error loading leads from Airtable:", error);
    // Fallback to mock data on error
    leads = [...MOCK_LEADS];
    filteredLeads = [...leads];
    console.log("⚠️ Using mock data due to Airtable error");
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

// Facial Analysis Kanban Board
function renderFacialAnalysis() {
  // Include both Web Popup Leads (not started) and Patients (with status)
  // Only show active (non-archived) leads
  const allLeads = leads.filter(l => !l.archived);
  
  // Separate into Web Popup Leads (not started) and Patients (with status)
  const webPopupLeads = leads.filter(l => l.tableSource === "Web Popup Leads");
  const patients = leads.filter(l => l.tableSource === "Patients");
  
  console.log('Facial Analysis - Web Popup Leads:', webPopupLeads.length, 'Patients:', patients.length);
  
  // Map facial analysis statuses (order matters - first is leftmost)
  const facialStatusMap = {
    'not-started': { id: 'not-started', countId: 'count-facial-not-started' },
    'pending': { id: 'pending', countId: 'count-facial-pending' },
    'ready': { id: 'ready', countId: 'count-facial-ready' },
    'Patient Reviewed': { id: 'patient-reviewed', countId: 'count-facial-patient-reviewed' }
  };
  
  // Track which leads have been assigned to avoid duplicates
  const assignedLeadIds = new Set();
  
  // First pass: count pending patients to decide if we should show the column
  let pendingCount = 0;
  allLeads.forEach(lead => {
    if (lead.tableSource === "Patients") {
      const facialStatus = String(lead.facialAnalysisStatus || '').trim().toLowerCase();
      if (facialStatus === 'pending') {
        pendingCount++;
      }
    }
  });
  
  Object.entries(facialStatusMap).forEach(([status, config]) => {
    const column = document.getElementById(`column-facial-${config.id}`);
    const count = document.getElementById(config.countId);
    
    if (!column || !count) return;
    
    // Hide "Pending" column if there are no pending patients
    if (status === 'pending' && pendingCount === 0) {
      column.style.display = 'none';
      return;
    } else {
      column.style.display = ''; // Show column
    }
    
    // Filter leads by facial analysis status
    const statusLeads = allLeads.filter(lead => {
      // Skip if already assigned to another column
      if (assignedLeadIds.has(lead.id)) return false;
      
      // Handle "not-started" - includes Web Popup Leads and Patients with no status
      if (status === 'not-started') {
        // All Web Popup Leads go to "Not Started" (they haven't done facial analysis)
        if (lead.tableSource === "Web Popup Leads") {
          assignedLeadIds.add(lead.id);
          return true;
        }
        
        // Patients with no status also go to "Not Started"
        const facialStatus = lead.facialAnalysisStatus;
        if (facialStatus === null || facialStatus === undefined || facialStatus === '') {
          assignedLeadIds.add(lead.id);
          return true;
        }
        // Also check if it's a string with only whitespace or "null"/"undefined" strings
        const trimmed = String(facialStatus).trim();
        if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
          assignedLeadIds.add(lead.id);
          return true;
        }
        return false;
      }
      
      // For other statuses, only check Patients table (Web Popup Leads don't have these statuses)
      if (lead.tableSource !== "Patients") return false;
      
      const facialStatus = lead.facialAnalysisStatus;
      const normalizedStatus = String(facialStatus || '').trim().toLowerCase();
      const normalizedTarget = status.toLowerCase();
      
      if (normalizedStatus === normalizedTarget) {
        assignedLeadIds.add(lead.id);
        return true;
      }
      
      return false;
    });
    
    count.textContent = statusLeads.length;
    
    if (statusLeads.length === 0) {
      column.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">No patients</p>
        </div>
      `;
      return;
    }
    
    column.innerHTML = statusLeads.map(lead => createLeadCard(lead)).join('');
  });
  
  // Log any unassigned leads (shouldn't happen, but good for debugging)
  const unassigned = allLeads.filter(l => !assignedLeadIds.has(l.id));
  if (unassigned.length > 0) {
    console.warn('Unassigned leads in facial analysis:', unassigned.map(l => ({
      name: l.name,
      table: l.tableSource,
      status: l.facialAnalysisStatus
    })));
  }
  
  // Add drag listeners
  document.querySelectorAll('#facial-analysis-board .lead-card').forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => viewLeadDetails(card.dataset.id));
  });
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
  
  if (lead && lead.status !== newStatus) {
    // Update in Airtable (or local state for mock data)
    updateLeadStatusInAirtable(leadId, newStatus);
    showToast(`Moved ${lead.name} to ${formatStatus(newStatus)}`);
  }
}

// List View
function renderList() {
  const tbody = document.getElementById('leads-tbody');
  let filteredLeads = [...leads];
  
  // Only show active (non-archived) leads in list view
  filteredLeads = filteredLeads.filter(l => !l.archived);
  
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
      <td style="font-size: 13px; color: #666;">${formatRelativeDate(lead.createdAt)}</td>
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
function viewLeadDetails(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  currentLeadId = leadId;
  
  document.getElementById('modal-lead-name').textContent = lead.name;
  document.getElementById('modal-status').className = `status-badge ${lead.status}`;
  document.getElementById('modal-status').textContent = formatStatus(lead.status);
  document.getElementById('status-select').value = lead.status;
  document.getElementById('modal-email-btn').href = `mailto:${lead.email}`;
  
  // Update archive button
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
  
  const appointmentInfo = lead.appointmentDate ? `
    <div class="detail-section">
      <div class="detail-section-title">Appointment</div>
      <div class="detail-value">${formatDate(lead.appointmentDate)}</div>
    </div>
  ` : '';
  
  const conversionInfo = lead.status === 'converted' ? `
    <div class="detail-section">
      <div class="detail-section-title">Conversion Details</div>
      <div class="detail-grid">
        <div class="detail-field">
          <div class="detail-label">Treatment</div>
          <div class="detail-value">${lead.treatmentReceived || 'N/A'}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Revenue</div>
          <div class="detail-value" style="color: #2e7d32; font-weight: 700;">$${lead.revenue?.toLocaleString() || 'N/A'}</div>
        </div>
      </div>
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
  
  document.getElementById('modal-body').innerHTML = `
    <div class="detail-section ${frontPhotoUrl ? 'modal-header-with-photo' : ''}">
      ${frontPhotoUrl ? `
        <div class="modal-photo-container">
          <img src="${frontPhotoUrl}" alt="${lead.name}" class="modal-photo" />
        </div>
      ` : ''}
      <div class="modal-contact-section">
        <div class="detail-section-title">
          Contact Information
          <button class="edit-toggle-btn" onclick="toggleEditMode()">
            <span id="edit-btn-text">✏️ Edit</span>
          </button>
        </div>
        <div class="detail-grid" id="contact-fields">
        <div class="detail-field">
          <div class="detail-label">Name</div>
          <div class="detail-value" id="display-name">${lead.name}</div>
          <input type="text" class="edit-input hidden" id="edit-name" value="${lead.name}" />
        </div>
        <div class="detail-field">
          <div class="detail-label">Email</div>
          <div class="detail-value" id="display-email">${lead.email}</div>
          <input type="email" class="edit-input hidden" id="edit-email" value="${lead.email}" />
        </div>
        <div class="detail-field">
          <div class="detail-label">Phone</div>
          <div class="detail-value" id="display-phone">${lead.phone || 'Not provided'}</div>
          <input type="tel" class="edit-input hidden" id="edit-phone" value="${lead.phone || ''}" oninput="formatPhoneInput(this)" />
        </div>
        <div class="detail-field">
          <div class="detail-label">Age</div>
          <div class="detail-value" id="display-age">${lead.age || 'Not provided'}</div>
          <input type="number" class="edit-input hidden" id="edit-age" value="${lead.age || ''}" min="18" max="100" />
        </div>
        <div class="detail-field">
          <div class="detail-label">Source</div>
          <div class="detail-value" id="display-source">${lead.source}</div>
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
        </div>
        </div>
        <div class="edit-actions hidden" id="edit-actions">
          <button class="btn-secondary btn-sm" onclick="cancelEdit()">Cancel</button>
          <button class="btn-primary btn-sm" onclick="saveLeadEdits()">Save Changes</button>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">Goals & Interests</div>
      <div class="detail-tags">
        ${lead.goals.length > 0 ? lead.goals.map(g => `<span class="detail-tag">${g}</span>`).join('') : '<span class="no-data">No goals recorded</span>'}
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">Concerns</div>
      <div class="detail-tags">
        ${(typeof lead.concerns === 'string' 
          ? lead.concerns.split(',').map(c => c.trim()).filter(c => c)
          : (Array.isArray(lead.concerns) ? lead.concerns : [])
        ).length > 0 ? (typeof lead.concerns === 'string' 
          ? lead.concerns.split(',').map(c => c.trim()).filter(c => c)
          : (Array.isArray(lead.concerns) ? lead.concerns : [])
        ).map(c => `<span class="detail-tag secondary">${c}</span>`).join('') : '<span class="no-data">No concerns recorded</span>'}
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">What They Said</div>
      <div class="notes-box">${lead.aestheticGoals ? `"${lead.aestheticGoals}"` : '<span class="no-data">No notes</span>'}</div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">Engagement</div>
      <div class="engagement-grid">
        <div class="engagement-item">
          <span class="engagement-item-value">${lead.photosLiked}</span>
          <span class="engagement-item-label">Photos Liked</span>
        </div>
        <div class="engagement-item">
          <span class="engagement-item-value">${lead.photosViewed}</span>
          <span class="engagement-item-label">Photos Viewed</span>
        </div>
        <div class="engagement-item">
          <span class="engagement-item-value">${lead.treatmentsViewed?.length || 0}</span>
          <span class="engagement-item-label">Treatments Explored</span>
        </div>
      </div>
    </div>
    
    ${lead.offerClaimed ? `
    <div class="detail-section">
      <div class="detail-section-title">Offer Status</div>
      <div style="padding: 12px; background: #E8F5E9; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">✓</span>
          <strong style="color: #2E7D32;">$50 Off Offer Claimed</strong>
        </div>
        <p style="margin: 0; font-size: 13px; color: #666;">
          Offer details and redemption terms were sent to ${lead.email}
        </p>
      </div>
    </div>
    ` : ''}
    
    <div class="detail-section">
      <div class="detail-section-title">Facial Analysis</div>
      <div style="margin-bottom: 12px;">
        <div class="detail-label" style="margin-bottom: 8px;">Status</div>
        <span class="status-badge" style="
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
          background: ${getFacialStatusColor(lead.facialAnalysisStatus)};
          color: white;
        ">${formatFacialStatus(lead.facialAnalysisStatus)}</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button 
          class="btn-primary btn-sm" 
          onclick="requestTelehealthFacialAnalysis('${lead.id}')"
          style="flex: 1; min-width: 150px;"
          ${!lead.phone ? 'disabled title="Phone number required"' : ''}
        >
          📱 Request Telehealth Scan
        </button>
        <button 
          class="btn-secondary btn-sm" 
          onclick="scanPatientNow('${lead.id}')"
          style="flex: 1; min-width: 150px;"
        >
          📸 Scan Patient Now
        </button>
      </div>
    </div>
    
    ${appointmentInfo}
    ${conversionInfo}
    
    <div class="detail-section">
      <div class="detail-section-title">
        Contact History
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
    
    ${lead.notes ? `
    <div class="detail-section">
      <div class="detail-section-title">Internal Notes</div>
      <div class="notes-box">${lead.notes}</div>
    </div>
    ` : ''}
  `;
  
  document.getElementById('lead-modal').classList.add('active');
}

// Contact History Functions
function renderContactHistory(lead) {
  const history = lead.contactHistory || [];
  
  if (history.length === 0) {
    return '<div class="no-data">No contact history yet. Add your first interaction!</div>';
  }
  
  return history.map(entry => `
    <div class="contact-entry">
      <div class="contact-entry-header">
        <span class="contact-type ${entry.type}">${formatContactType(entry.type)}</span>
        <span class="contact-date">${formatRelativeDate(entry.date)}</span>
      </div>
      <div class="contact-outcome ${entry.outcome}">${formatOutcome(entry.outcome)}</div>
      ${entry.notes ? `<div class="contact-notes">${entry.notes}</div>` : ''}
    </div>
  `).join('');
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
  renderList();
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

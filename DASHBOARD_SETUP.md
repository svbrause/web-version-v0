# Lead Hub - Marketing Dashboard for Med Spas

A beautiful, demo-ready CRM dashboard for managing prospective patients from the AI Aesthetic Consultation app. Designed to showcase the value of the lead generation system to med spa owners.

## 🎯 Demo Overview

This dashboard demonstrates how the AI consultation tool generates and tracks qualified leads for med spas. It includes realistic mock data that tells a compelling story of patient acquisition.

### Demo Storyline

The mock data shows:
- **4 New Leads** - Hot prospects who just completed the AI consultation (some within hours)
- **3 In Contact** - Leads your team is actively nurturing
- **3 Scheduled** - Patients with upcoming consultations
- **3 Converted** - Success stories with revenue ($5,700+ in tracked treatments)

Each lead has:
- Realistic contact information
- Specific aesthetic concerns and goals
- Engagement metrics (photos liked, treatments viewed)
- Notes showing the patient journey
- Revenue tracking for converted patients

## ✨ Key Features

### Lead Board (Kanban)
The main view - drag and drop leads through your pipeline:
- **New Leads** → **Contacted** → **Consultation Scheduled** → **Converted**
- Visual priority indicators (🔥 hot leads, ⭐ medium priority)
- Quick view of interests and engagement
- Click any card for full details

### All Leads (List View)
Searchable, filterable table of all leads:
- Filter by status (New, Contacted, Scheduled, Converted)
- Search by name, email, or phone
- Sort and manage at scale

### Analytics
Conversion funnel and insights:
- Lead journey visualization
- Top treatment interests
- Age demographics
- Weekly activity tracking

## 🎨 Design

The dashboard follows the app's style guide:
- Warm gradient background (#FFD291 → #E5F6FE)
- Montserrat typography
- Rounded corners (12-20px radius)
- Subtle shadows and hover effects
- Mobile-responsive layout

## 🚀 Running the Demo

1. Open `dashboard.html` in any web browser
2. No setup required - uses realistic mock data
3. Interact with the Kanban board, search leads, view details

### Demo Tips

When presenting to a med spa owner:

1. **Start with the Lead Board** - Show how leads flow through the pipeline
2. **Click a hot lead** (Sarah Mitchell or Jennifer Park) - Show the rich detail captured
3. **Drag a lead** from "New" to "Contacted" - Demonstrate the workflow
4. **Show the Analytics** - Highlight the conversion funnel
5. **Point out engagement metrics** - "These patients already viewed 12 photos and liked 5 before you even called them"

### Key Talking Points

- "Every lead here came through your AI consultation - they've already told you their concerns"
- "See the 🔥? That means high engagement - these are ready-to-book patients"
- "Patricia Johnson started with the AI consult and became a $4,500 package patient"
- "Your front desk can see exactly what each patient is interested in before calling"

## 📊 Mock Data Highlights

| Lead | Status | Interests | Engagement | Revenue |
|------|--------|-----------|------------|---------|
| Sarah Mitchell | New (🔥) | Anti-Aging, Wrinkles | 5 liked, 12 viewed | - |
| Katherine Moore | Scheduled (🔥) | Full Rejuvenation | 12 liked, 25 viewed | - |
| Patricia Johnson | Converted | Liquid Facelift | 15 liked, 30 viewed | $4,500 |
| Maria Santos | Converted | Botox | 6 liked, 16 viewed | $550 |

## 🔧 Connecting to Real Data (Future)

When ready to connect to Airtable:

1. Update `dashboard.js` to fetch from Airtable API
2. Map Airtable fields to the lead object structure
3. Implement status updates to sync back to Airtable

The current mock data structure matches the Airtable schema, making integration straightforward.

## 📁 Files

- `dashboard.html` - Main dashboard page
- `dashboard.css` - Styling (matches style guide)
- `dashboard.js` - Logic and mock data
- `DASHBOARD_SETUP.md` - This file

## 💡 Future Enhancements

- Email/SMS integration
- Calendar booking widget
- Team member assignment
- Notes and activity timeline
- Revenue/ROI tracking
- Export to CSV
- Airtable sync


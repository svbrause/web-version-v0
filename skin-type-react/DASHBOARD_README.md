# User Leads Dashboard

A comprehensive dashboard for viewing and managing user data collected from the consultation app.

## Features

- **Filterable Table**: Filter users by stage (concerns, areas, age, etc.)
- **Search**: Search by name, email, phone, or message
- **Sortable Columns**: Click column headers to sort by date, name, email, or stage
- **Expandable Rows**: Click any row to see full user details including:
  - Contact information
  - Selected concerns and areas
  - Demographics (age, skin type, skin tone, ethnic background)
  - Completion status
- **Real-time Updates**: Refresh button to reload latest data
- **Data Management**: Clear all data option (with confirmation)

## Accessing the Dashboard

### Development

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   ```
   http://localhost:3000/dashboard.html
   ```

### Production

After building, the dashboard will be available at:
```
https://your-domain.com/dashboard.html
```

## Data Collection

User data is automatically collected as users progress through the app:

- **Form Steps**: Data saved at each step (concerns, areas, age, skin type, etc.)
- **Lead Capture**: Name, email, phone saved when user submits lead form
- **Consultation**: Full details saved when consultation form is submitted
- **Results**: Stage updated when user reaches results screen

All data is stored in browser `localStorage` under the key `userLeadsData`.

## Data Structure

Each user entry includes:

```typescript
{
  id: string;                    // Unique user ID
  timestamp: string;              // When user started
  stage: string;                  // Current stage reached
  name?: string;                  // User's name
  email?: string;                 // User's email
  phone?: string;                 // User's phone
  message?: string;               // Optional message
  selectedConcerns: string[];     // Array of concern IDs
  selectedAreas: string[];        // Array of area IDs
  ageRange?: string;              // Selected age range
  skinType?: string;              // Selected skin type
  skinTone?: string;               // Selected skin tone
  ethnicBackground?: string;      // Selected ethnic background
  sessionId?: string;             // Session identifier
  completedAt?: string;          // When user completed (if applicable)
}
```

## Stages

The dashboard tracks these stages:

- `started` - User started the app
- `concerns` - Selected concerns
- `areas` - Selected areas
- `age` - Entered age
- `skinType` - Selected skin type
- `skinTone` - Selected skin tone
- `ethnicBackground` - Entered ethnic background
- `celebration` - Reached results
- `leadCapture` - Submitted lead form
- `results` - Viewed results
- `consultationSubmitted` - Submitted consultation request

## Styling

The dashboard uses the same design system as the main app:
- Same color palette (`--bg-primary`, `--text-primary`, etc.)
- Consistent typography and spacing
- Responsive design for mobile and desktop

## Future Enhancements

Potential additions:
- Export to CSV/Excel
- Integration with backend API
- User notes/comments
- Email/SMS integration
- Analytics and reporting
- Bulk actions

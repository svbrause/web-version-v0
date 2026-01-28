# Analytics & Session Recording Setup

This app includes built-in support for **Microsoft Clarity** - a free session recording and heatmap tool.

## Features

When enabled, you'll get:

- **Session Recordings** - Watch exactly what users do on your app
- **Heatmaps** - See where users click, scroll, and spend time
- **Rage Clicks** - Identify frustrating UI elements
- **Dead Clicks** - Find elements users expect to be clickable
- **User Journey Insights** - Track how users flow through the app
- **Custom Events** - Filter sessions by specific user actions

## Setup Instructions

### 1. Create a Microsoft Clarity Account

1. Go to [https://clarity.microsoft.com](https://clarity.microsoft.com)
2. Sign in with your Microsoft account (or create one)
3. Click "Add new project"
4. Enter your website URL (e.g., `your-app.vercel.app`)
5. Copy your **Project ID** (a string like `abcdefgh12`)

### 2. Enable Analytics in the App

Open `index.html` and update these lines in the `<head>` section:

```html
<script>
  // Change this to true to enable analytics
  window.ANALYTICS_ENABLED = true;

  // Replace with your actual Clarity Project ID
  window.CLARITY_PROJECT_ID = "your-project-id-here";
</script>
```

### 3. Deploy the Changes

Deploy the updated app to Vercel:

```bash
vercel --prod
```

### 4. Verify It's Working

1. Visit your deployed app
2. Open browser developer tools (F12)
3. Check the console - you should see: `📊 Microsoft Clarity enabled for session recording`
4. Perform some actions in the app
5. Wait 5-10 minutes, then check your Clarity dashboard

## Tracked Events

The app automatically tracks these user actions:

| Event Name                  | Description                         | Data Captured                   |
| --------------------------- | ----------------------------------- | ------------------------------- |
| `onboarding_started`        | User clicked "Start" on home screen | -                               |
| `form_started`              | User began the concerns form        | step                            |
| `concerns_form_submitted`   | User submitted concerns             | age, goals, issues, areas       |
| `issue_viewed`              | User viewed an issue detail page    | issue name, category            |
| `case_viewed`               | User viewed a case detail           | case ID, name, treatment, issue |
| `issue_added_to_goals`      | User added issue to their goals     | issue name, total goal count    |
| `consultation_modal_opened` | User opened consultation form       | goals, issues count             |
| `consultation_submitted`    | User submitted consultation request | goals, issues count             |

## Filtering Sessions in Clarity

Use these custom tags to filter session recordings:

1. In Clarity dashboard, go to **Recordings**
2. Click **Filters**
3. Under **Custom Tags**, select an event name
4. View only sessions where that event occurred

### Example Filters

- **High-intent users**: Filter by `consultation_submitted`
- **Users who explored cases**: Filter by `case_viewed`
- **Users who dropped off**: Filter by `form_started` but NOT `concerns_form_submitted`

## Privacy & GDPR Considerations

Microsoft Clarity automatically:

- Masks sensitive input fields (passwords, credit cards)
- Anonymizes IP addresses
- Provides data residency options

For GDPR compliance, you should:

1. Add a cookie consent banner
2. Only enable Clarity after user consent
3. Add Clarity to your privacy policy

### Adding Consent Check

```javascript
// In index.html, modify the analytics config:
window.ANALYTICS_ENABLED = localStorage.getItem("cookie_consent") === "true";
```

## Alternative Analytics Tools

If you prefer other tools, here are alternatives:

| Tool                  | Free Tier         | Session Recording | Heatmaps |
| --------------------- | ----------------- | ----------------- | -------- |
| **Microsoft Clarity** | Unlimited         | ✅                | ✅       |
| Hotjar                | 35 sessions/day   | ✅                | ✅       |
| FullStory             | 1,000 sessions/mo | ✅                | ✅       |
| PostHog               | 1M events/mo      | ✅                | ✅       |
| LogRocket             | 1,000 sessions/mo | ✅                | ❌       |

## Disabling Analytics

To disable analytics (e.g., during development):

```javascript
window.ANALYTICS_ENABLED = false;
```

Events will still be logged to the browser console for debugging.

## Viewing Local Event Log

For debugging, you can view all tracked events in the browser console:

```javascript
// In browser console:
JSON.parse(localStorage.getItem("analytics_events"));
```

This shows the last 100 events with timestamps and session IDs.










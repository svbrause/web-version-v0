# PostHog Analytics & Session Recording Setup

This React app includes PostHog via the **npm package** (`posthog-js`), so there is no CDN script — the library is bundled at build time. Session recordings and events are sent to your PostHog project when `VITE_POSTHOG_KEY` is set.

## Features

When enabled, you'll get:

- **Session Recordings** - Watch exactly what users do on your app
- **Product Analytics** - Track user behavior, conversions, and funnels
- **Feature Flags** - A/B testing and feature rollouts
- **Heatmaps** - See where users click and scroll
- **Custom Events** - Track specific user actions

## Setup Instructions

### 1. Create a PostHog Account

1. Go to [https://posthog.com](https://posthog.com)
2. Sign up for a free account (1M events/month free tier)
3. Create a new project
4. Copy your **Project API Key** from Settings → Project → API Key

### 2. Configure PostHog

You have two options:

#### Option A: Environment Variables (Recommended for Production)

Create a `.env` file in the `skin-type-react` directory:

```env
VITE_POSTHOG_KEY=your-api-key-here
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

#### Option B: Window Configuration (Quick Setup)

Edit `index.html` and uncomment/set:

```html
<script>
  window.POSTHOG_KEY = "your-api-key-here";
  window.POSTHOG_HOST = "https://us.i.posthog.com"; // Optional
</script>
```

### 3. Enable Session Recordings in PostHog (required for recordings to be stored)

Session recordings are **not** stored until you turn them on in the PostHog project:

1. In PostHog, go to **Project Settings** (gear icon or [app.posthog.com/settings](https://app.posthog.com/settings)).
2. Open the **Session recordings** (or **Replay**) section.
3. **Turn on "Enable session recordings"** (or equivalent) for this project.
4. (Optional) Under **Replay → Replay triggers**, you can set "Record when URL matches" (e.g. your production domain) or leave default to record all sessions.
5. If your project has **Authorized domains for replay**, ensure your app’s domain (e.g. `cases.ponce.ai`) is allowed, or leave the list empty to allow all domains.

Once this is enabled, the app’s existing PostHog init will start sending session data and recordings will appear under **Recordings** in PostHog.

### 4. Deploy

Deploy your app. PostHog will automatically initialize when the app loads (and recordings will be stored if step 3 is done and `VITE_POSTHOG_KEY` is set in Vercel).

### 5. Verify It's Working

1. Visit your deployed app
2. Open browser developer tools (F12)
3. Check the console - you should see: `📊 PostHog initialized for analytics and session recording`
4. Perform some actions in the app
5. Check your PostHog dashboard (sessions appear within minutes)

## Tracked Events

The app automatically tracks these user actions:

| Event Name                  | Description                      | Properties                                              |
| --------------------------- | -------------------------------- | ------------------------------------------------------- |
| `screen_viewed`             | User navigated to a screen       | screen_name, step_number, selected_concerns_count, etc. |
| `concern_selected`          | User selected a concern          | concern_id, concern_name, total_selected                |
| `concern_deselected`        | User deselected a concern        | concern_id, concern_name, total_selected                |
| `area_selected`             | User selected an area            | area_id, area_name, total_selected                      |
| `area_deselected`           | User deselected an area          | area_id, area_name, total_selected                      |
| `form_step_completed`       | User completed a form step       | step_name, step_number, next_step, demographics         |
| `concern_cases_viewed`      | User viewed cases for a concern  | concern_id, concern_name, case_count                    |
| `case_viewed`               | User viewed a case detail        | case_id, case_name, concern_id, relevance_score         |
| `consultation_modal_opened` | User opened consultation modal   | selected_concerns, demographics                         |
| `consultation_submitted`    | User submitted consultation form | form completion data                                    |
| `lead_capture_submitted`    | User submitted lead form         | has_name, has_email, has_phone                          |
| `lead_capture_skipped`      | User skipped lead capture        | -                                                       |

## Viewing Analytics

1. Go to your PostHog dashboard
2. Navigate to **Recordings** to watch session replays
3. Navigate to **Events** to see all tracked events
4. Navigate to **Insights** to create funnels and analyze user behavior

## Privacy & GDPR

PostHog automatically:

- Masks all input fields in session recordings
- Anonymizes IP addresses
- Provides data residency options

For GDPR compliance, you should:

1. Add a cookie consent banner
2. Only initialize PostHog after user consent
3. Add PostHog to your privacy policy

### Adding Consent Check

Modify `src/utils/analytics.ts`:

```typescript
export function initAnalytics() {
  // Only initialize if user consented
  const hasConsent = localStorage.getItem("cookie_consent") === "true";
  if (!hasConsent) {
    return;
  }
  // ... rest of initialization
}
```

## Disabling Analytics

To disable analytics (e.g., during development):

1. Don't set `VITE_POSTHOG_KEY` or `window.POSTHOG_KEY`
2. Events will still log to console in development mode

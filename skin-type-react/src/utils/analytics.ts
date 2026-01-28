// Analytics utility for PostHog (uses npm package — no CDN script tag)
// To get your PostHog API key: https://app.posthog.com/settings/project

import posthog from "posthog-js";

declare global {
  interface Window {
    posthog?: unknown;
  }
}

let posthogInitialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || posthogInitialized) {
    return;
  }

  const apiKey =
    import.meta.env.VITE_POSTHOG_KEY || (window as any).POSTHOG_KEY;
  const apiHost =
    import.meta.env.VITE_POSTHOG_HOST ||
    (window as any).POSTHOG_HOST ||
    "https://us.i.posthog.com";

  console.log("📊 PostHog initialization check:", {
    hasEnvKey: !!import.meta.env.VITE_POSTHOG_KEY,
    hasWindowKey: !!(window as any).POSTHOG_KEY,
    hasApiKey: !!apiKey,
    apiHost,
    mode: import.meta.env.MODE,
  });

  if (!apiKey) {
    console.warn("⚠️ PostHog API key not found. Analytics disabled.");
    console.log(
      "💡 To enable PostHog in production: Set VITE_POSTHOG_KEY in Vercel environment variables",
    );
    console.log(
      "💡 To enable PostHog locally: Set VITE_POSTHOG_KEY in .env file",
    );
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: false,
    session_recording: {
      recordCrossOriginIframes: false,
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },
    loaded: (ph: unknown) => {
      posthogInitialized = true;
      if (typeof window !== "undefined") {
        window.posthog = ph;
      }
      console.log(
        "✅ PostHog initialized successfully (npm package; session recording enabled)",
      );
      console.log("📊 PostHog config:", {
        apiHost,
        autocapture: true,
        sessionRecording: true,
        mode: import.meta.env.MODE,
      });
    },
  });
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && posthogInitialized) {
    posthog.capture(eventName, properties);
  } else {
    if (import.meta.env.DEV || !posthogInitialized) {
      console.log("📊 Event (PostHog not initialized):", eventName, properties);
    }
  }
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && posthogInitialized) {
    posthog.identify(userId, properties);
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && posthogInitialized) {
    posthog.reset();
  }
}

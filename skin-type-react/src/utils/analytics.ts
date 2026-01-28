// Analytics utility for PostHog
// To get your PostHog API key: https://app.posthog.com/settings/project

declare global {
  interface Window {
    posthog?: any;
  }
}

let posthogInitialized = false;

export function initAnalytics() {
  // Check if PostHog is already loaded or if analytics should be disabled
  if (typeof window === "undefined" || posthogInitialized) {
    return;
  }

  // Get API key from environment variable or window config
  const apiKey =
    import.meta.env.VITE_POSTHOG_KEY || (window as any).POSTHOG_KEY;
  const apiHost =
    import.meta.env.VITE_POSTHOG_HOST ||
    (window as any).POSTHOG_HOST ||
    "https://us.i.posthog.com";

  // Debug logging
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

  // Load PostHog script
  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/posthog-js@latest/dist/posthog.min.js";
  script.async = true;
  script.onload = () => {
    if (window.posthog) {
      window.posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: true, // Automatically capture clicks, form submissions, etc.
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: false, // Explicitly enable session recordings for behavior evaluation
        session_recording: {
          recordCrossOriginIframes: false,
          maskAllInputs: true, // Privacy: mask all input fields
          maskTextSelector: "[data-ph-mask]", // Mask elements with this attribute
        },
        loaded: (_posthog: any) => {
          posthogInitialized = true;
          console.log(
            "✅ PostHog initialized successfully for analytics and session recording",
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
  };
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  if (typeof window !== "undefined" && window.posthog && posthogInitialized) {
    window.posthog.capture(eventName, properties);
  } else {
    // Log to console if PostHog is not initialized (helpful for debugging)
    if (import.meta.env.DEV || !posthogInitialized) {
      console.log("📊 Event (PostHog not initialized):", eventName, properties);
    }
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && window.posthog && posthogInitialized) {
    window.posthog.identify(userId, properties);
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && window.posthog && posthogInitialized) {
    window.posthog.reset();
  }
}

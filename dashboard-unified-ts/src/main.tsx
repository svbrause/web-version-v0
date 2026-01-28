// Main entry point

import React from "react";
import ReactDOM from "react-dom/client";
import posthog from "posthog-js";
import App from "./App";

// All API calls go through the secure backend proxy
// Frontend doesn't need any Airtable configuration - backend handles everything
declare global {
  interface Window {
    USE_BACKEND_API?: boolean;
    posthog?: typeof posthog;
  }
}

window.USE_BACKEND_API = true; // Always use backend API proxy

// Initialize PostHog if API key is provided
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log("PostHog initialized");
      }
    },
    capture_pageview: true, // Automatically capture page views
    capture_pageleave: true, // Automatically capture page leave events
  });
  // Make PostHog available globally for debugging
  window.posthog = posthog;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

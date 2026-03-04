const LEAD_SOURCE_STORAGE_KEY = "leadSource";

/**
 * Lead/traffic source for analytics and Airtable "Source" field.
 * Supports:
 * - Query: /unique?source=website+header or /unique?source=website%2Bheader
 * - Path:  /unique/website-header (second segment = source)
 * Reads from URL on first use and persists in sessionStorage so the value
 * is still available at submit time even if the URL changes during the flow.
 * Returns the source string or null if not set.
 */
export function getLeadSourceFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(LEAD_SOURCE_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get("source")?.trim();
  if (fromQuery) {
    try {
      sessionStorage.setItem(LEAD_SOURCE_STORAGE_KEY, fromQuery);
    } catch {
      /* ignore */
    }
    return fromQuery;
  }
  const segments = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  if (segments.length >= 2) {
    const fromPath = segments[1];
    try {
      sessionStorage.setItem(LEAD_SOURCE_STORAGE_KEY, fromPath);
    } catch {
      /* ignore */
    }
    return fromPath;
  }
  return null;
}

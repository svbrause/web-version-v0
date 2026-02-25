/**
 * Lead/traffic source for analytics and Airtable "Source" field.
 * Supports:
 * - Query: /lakeshore?source=web or ?source=linktree
 * - Path:  /lakeshore/web or /lakeshore/linktree (second segment = source)
 * Returns the source string (e.g. "web", "linktree") or null if not set.
 */
export function getLeadSourceFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get("source")?.trim();
  if (fromQuery) return fromQuery;
  const segments = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  if (segments.length >= 2) return segments[1];
  return null;
}

/**
 * Backend API base URL — Express app (e.g. test-replace-adalo-patient-app backend).
 * Uses dashboard API (Airtable base ID and API key are server-side only):
 *   GET  /api/dashboard/leads?tableName=Photos&providerId=... (cases, filtered by Provider-Treatment Mapping)
 *   POST /api/dashboard/leads (create lead)
 *   PATCH /api/dashboard/leads/:recordId (update lead)
 *   PATCH /api/dashboard/records/Web Popup Leads/:id (behavioral sync)
 * Set VITE_BACKEND_URL to your backend URL. Ensure FRONTEND_URL on the backend allows this app for CORS.
 */
const DEFAULT_BACKEND_URL = "https://ponce-patient-backend.vercel.app";

export function getBackendBaseUrl(): string {
  const url =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_BACKEND_URL;
  return url.replace(/\/$/, ""); // no trailing slash
}

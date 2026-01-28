/**
 * Backend API base URL — Express app at ponce-patient-backend.vercel.app.
 * Uses existing dashboard API:
 *   GET  /api/dashboard/leads?tableName=Photos (cases)
 *   POST /api/dashboard/leads (create lead)
 *   PATCH /api/dashboard/leads/:recordId (update lead)
 *   PATCH /api/dashboard/records/Web Popup Leads/:id (behavioral sync)
 * Ensure FRONTEND_URL on the backend includes https://cases.ponce.ai for CORS.
 */
const DEFAULT_BACKEND_URL = "https://ponce-patient-backend.vercel.app";

export function getBackendBaseUrl(): string {
  const url =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_BACKEND_URL;
  return url.replace(/\/$/, ""); // no trailing slash
}

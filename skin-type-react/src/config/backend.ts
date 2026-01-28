/**
 * Backend API base URL for Airtable proxy (cases, leads, sync).
 * Use the deployed backend at ponce-patient-backend.vercel.app so we don't
 * need AIRTABLE_API_KEY on the frontend's Vercel project (cases.ponce.ai).
 */
const DEFAULT_BACKEND_URL = "https://ponce-patient-backend.vercel.app";

export function getBackendBaseUrl(): string {
  const url =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_BACKEND_URL;
  return url.replace(/\/$/, ""); // no trailing slash
}

/**
 * Provider record IDs for case filtering (Provider-Treatment Mapping).
 * Used when fetching cases so the backend can return only treatments this provider offers.
 */
import type { PracticeName } from "../components/Logo";

const UNIQUE_PROVIDER_ID = "recN9Q4W02xtroD6g";
const LAKESHORE_PROVIDER_ID = "rec3oXyrb1t6YUvoe";

/**
 * Returns the Airtable Providers record ID for the given practice, or null.
 * Admin uses VITE_ADMIN_PROVIDER_RECORD_ID; can override with VITE_PROVIDER_ID.
 */
export function getProviderIdForPractice(
  practice: PracticeName | null
): string | null {
  if (!practice) return null;
  const override = import.meta.env.VITE_PROVIDER_ID;
  if (override && typeof override === "string" && override.startsWith("rec")) {
    return override;
  }
  if (practice === "unique") return UNIQUE_PROVIDER_ID;
  if (practice === "lakeshore") return LAKESHORE_PROVIDER_ID;
  if (practice === "admin") {
    const adminId = import.meta.env.VITE_ADMIN_PROVIDER_RECORD_ID;
    return adminId && typeof adminId === "string" && adminId.startsWith("rec")
      ? adminId
      : null;
  }
  return null;
}

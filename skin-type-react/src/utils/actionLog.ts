/**
 * Log user actions to the backend, which writes to the Airtable "Logs" table.
 * Backend expects: POST /api/logs with { patientEmail, actionType } and optional practice.
 * Action Type is stored as "VIBE: {actionType}" in Airtable.
 * Fire-and-forget: does not block UI; errors are logged to console.
 */

import { getBackendBaseUrl } from "../config/backend";

export async function logActionToAirtable(
  patientEmail: string,
  actionType: string,
  options?: { practice?: string | null }
): Promise<void> {
  if (!patientEmail?.trim()) return;

  const url = `${getBackendBaseUrl()}/api/logs`;
  const body: Record<string, string> = {
    patientEmail: patientEmail.trim(),
    actionType,
  };
  if (options?.practice) {
    body.practice = options.practice;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[actionLog] Log failed:", res.status, err);
    }
  } catch (e) {
    console.warn("[actionLog] Log request failed:", e);
  }
}

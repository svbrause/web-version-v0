// Utility for syncing behavioral data (viewed photos, concerns explored) to Airtable
// Uses debouncing and final sync on exit to balance efficiency and data integrity

import type { CaseItem } from "../types";
import { HIGH_LEVEL_CONCERNS } from "../constants/data";
import { getBackendBaseUrl } from "../config/backend";

interface SyncData {
  recordId: string;
  viewedPhotoIds: string[];
  concernsExploredIds: string[];
  caseData: CaseItem[];
}

// Store pending sync data
let pendingSync: SyncData | null = null;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;

// Debounce delay (5 seconds)
const SYNC_DEBOUNCE_MS = 5000;
// Minimum photos viewed before syncing (to avoid too many small updates)
const MIN_PHOTOS_FOR_SYNC = 3;

/**
 * Get Airtable credentials
 * NOTE: No longer needed - API key is handled server-side via API routes
 * This function is kept for backwards compatibility but returns null
 */
function getAirtableConfig(): { apiKey: string | null; baseId: string | null } {
  // API key is now handled server-side - no need to expose it to client
  return { apiKey: null, baseId: null };
}

/**
 * Get read cases from localStorage
 */
function getReadCases(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const stored = localStorage.getItem("readCases");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get concerns explored from localStorage
 */
function getConcernsExplored(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const stored = localStorage.getItem("concernsExplored");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get the Airtable record ID for the current lead
 */
export function getLeadRecordId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return localStorage.getItem("airtableLeadRecordId");
  } catch (e) {
    return null;
  }
}

/**
 * Store the Airtable record ID after initial lead submission
 */
export function storeLeadRecordId(recordId: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem("airtableLeadRecordId", recordId);
    } catch (e) {
      console.error("Error storing lead record ID:", e);
    }
  }
}

/**
 * Sync behavioral data to Airtable (debounced)
 */
export function scheduleBehavioralSync(caseData: CaseItem[]): void {
  const recordId = getLeadRecordId();
  if (!recordId) {
    // No record ID means lead hasn't been submitted yet, or it failed
    return;
  }

  const readCaseIds = getReadCases();
  const concernsExploredIds = getConcernsExplored();

  // Only sync if we have meaningful data
  if (readCaseIds.length === 0 && concernsExploredIds.length === 0) {
    return;
  }

  // Store pending sync data
  pendingSync = {
    recordId,
    viewedPhotoIds: readCaseIds,
    concernsExploredIds,
    caseData,
  };

  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // Schedule sync with debouncing
  // Sync immediately if we've viewed enough photos, otherwise debounce
  const shouldSyncNow = readCaseIds.length >= MIN_PHOTOS_FOR_SYNC;

  if (shouldSyncNow) {
    // Sync immediately if we've hit the threshold
    syncTimeout = setTimeout(() => {
      performSync();
    }, 1000); // Small delay to batch rapid views
  } else {
    // Debounce for smaller updates
    syncTimeout = setTimeout(() => {
      performSync();
    }, SYNC_DEBOUNCE_MS);
  }
}

/**
 * Perform the actual sync to Airtable
 */
async function performSync(): Promise<void> {
  if (!pendingSync || isSyncing) {
    return;
  }

  isSyncing = true;
  const sync = { ...pendingSync };
  pendingSync = null;

  // No longer need API key check - handled server-side
  if (!sync.recordId) {
    console.warn("⚠️ No record ID for behavioral sync");
    isSyncing = false;
    return;
  }

  try {
    // Build update fields
    const fields: Record<string, any> = {};

    // Viewed Photos (linked records)
    if (sync.viewedPhotoIds.length > 0 && sync.caseData.length > 0) {
      const viewedPhotoRecordIds = sync.viewedPhotoIds
        .map((caseId) => {
          const caseItem = sync.caseData.find((c) => c.id === caseId);
          return caseItem?.id;
        })
        .filter((id): id is string => !!id);

      if (viewedPhotoRecordIds.length > 0) {
        fields["Viewed Photos"] = viewedPhotoRecordIds;
        fields["Cases Viewed Count"] = viewedPhotoRecordIds.length;
      }
    }

    // Concerns Explored (multiselect)
    if (sync.concernsExploredIds.length > 0) {
      const concernNames = sync.concernsExploredIds
        .map((id) => {
          const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
          return concern ? concern.name : id;
        })
        .filter(Boolean);

      if (concernNames.length > 0) {
        fields["Concerns Explored"] = concernNames;
      }
    }

    // Engagement Level
    if (sync.viewedPhotoIds.length > 0) {
      const count = sync.viewedPhotoIds.length;
      if (count >= 10) {
        fields["Engagement Level"] = "High";
      } else if (count >= 5) {
        fields["Engagement Level"] = "Medium";
      } else {
        fields["Engagement Level"] = "Low";
      }
    }

    // Only update if we have fields to update
    if (Object.keys(fields).length === 0) {
      isSyncing = false;
      return;
    }

    // Backend Express: PATCH /api/dashboard/records/:tableName/:recordId with body { fields }
    const API_URL = `${getBackendBaseUrl()}/api/dashboard/records/Web Popup Leads/${encodeURIComponent(sync.recordId)}`;

    console.log("🔄 Syncing behavioral data via backend API:", {
      recordId: sync.recordId,
      fields,
    });

    const response = await fetch(API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error syncing behavioral data:", error);
    } else {
      const result = await response.json();
      console.log("✅ Behavioral data synced successfully:", result);
    }
  } catch (error) {
    console.error("❌ Error syncing behavioral data:", error);
  } finally {
    isSyncing = false;
  }
}

/**
 * Force immediate sync (for final sync on exit)
 */
export function forceSyncNow(caseData: CaseItem[]): void {
  // Clear any pending debounced sync
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }

  // Perform sync immediately
  const recordId = getLeadRecordId();
  if (!recordId) {
    return;
  }

  pendingSync = {
    recordId,
    viewedPhotoIds: getReadCases(),
    concernsExploredIds: getConcernsExplored(),
    caseData,
  };

  // Use sendBeacon for final sync to ensure it goes through even if page is closing
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const { apiKey, baseId } = getAirtableConfig();
    if (apiKey && baseId && pendingSync) {
      const fields: Record<string, any> = {};

      // Build fields (same logic as performSync)
      if (
        pendingSync.viewedPhotoIds.length > 0 &&
        pendingSync.caseData.length > 0
      ) {
        const viewedPhotoRecordIds = pendingSync.viewedPhotoIds
          .map((caseId) => {
            const caseItem = pendingSync!.caseData.find((c) => c.id === caseId);
            return caseItem?.id;
          })
          .filter((id): id is string => !!id);

        if (viewedPhotoRecordIds.length > 0) {
          fields["Viewed Photos"] = viewedPhotoRecordIds;
          fields["Cases Viewed Count"] = viewedPhotoRecordIds.length;
        }
      }

      if (pendingSync.concernsExploredIds.length > 0) {
        const concernNames = pendingSync.concernsExploredIds
          .map((id) => {
            const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
            return concern ? concern.name : id;
          })
          .filter(Boolean);

        if (concernNames.length > 0) {
          fields["Concerns Explored"] = concernNames;
        }
      }

      if (pendingSync.viewedPhotoIds.length > 0) {
        const count = pendingSync.viewedPhotoIds.length;
        if (count >= 10) {
          fields["Engagement Level"] = "High";
        } else if (count >= 5) {
          fields["Engagement Level"] = "Medium";
        } else {
          fields["Engagement Level"] = "Low";
        }
      }

      if (Object.keys(fields).length > 0) {
        const updateUrl = `https://api.airtable.com/v0/${baseId}/Web Popup Leads/${pendingSync.recordId}`;

        // sendBeacon doesn't support custom headers, so we'll use fetch with keepalive instead
        // But sendBeacon is more reliable for page unload, so we'll try both approaches
        fetch(updateUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
          keepalive: true, // Ensures request completes even if page is unloading
        }).catch((err) => {
          console.error("Final sync failed:", err);
        });
      }
    }
  } else {
    // Fallback to regular sync if sendBeacon not available
    performSync();
  }
}

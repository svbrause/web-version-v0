// Utility to submit leads to Airtable "Web Popup Leads" table

import { HIGH_LEVEL_CONCERNS, AREAS_OF_CONCERN } from "../constants/data";
import type { AppState, CaseItem } from "../types";
import { getMatchingCasesForConcern } from "./caseMatching";
import { getPracticeFromConfig } from "../components/Logo";
import { getBackendBaseUrl } from "../config/backend";

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  message?: string;
  source?: string;
  offerClaimed?: boolean;
}

interface BehavioralData {
  readCases?: string[];
  concernsExplored?: string[];
  caseData?: CaseItem[];
}

interface AirtableResponse {
  success: boolean;
  record?: any;
  error?: any;
  partial?: boolean;
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
 * Get concerns explored from localStorage (concerns they clicked into)
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
 * Calculate engagement level based on cases viewed count
 */
function getEngagementLevel(count: number): string {
  if (count >= 10) return "High";
  if (count >= 5) return "Medium";
  return "Low";
}

/**
 * Submit a lead to the "Web Popup Leads" table in Airtable
 */
export async function submitLeadToAirtable(
  leadData: LeadData,
  userState: Partial<AppState>,
  behavioralData?: BehavioralData,
): Promise<AirtableResponse> {
  try {
    // In development, use direct Airtable API if keys are available
    // In production, use secure API route
    const isDev = import.meta.env.DEV;
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const useDirectAirtable = isDev && airtableApiKey && airtableBaseId;

    const API_URL = useDirectAirtable
      ? `https://api.airtable.com/v0/${airtableBaseId}/Web Popup Leads`
      : `${getBackendBaseUrl()}/api/dashboard/leads`;

    if (useDirectAirtable) {
      console.log("🔗 Using direct Airtable API (development mode)");
    } else {
      console.log("🔗 Using secure API route:", API_URL);
    }

    // Get user selections from state
    const selectedConcerns = userState.selectedConcerns || [];
    const selectedAreas = userState.selectedAreas || [];

    // Build the Airtable record fields
    const fields: Record<string, any> = {
      Name: leadData.name || "",
      "Email Address": leadData.email || "",
      "Phone Number": leadData.phone || "",
    };

    // Add Zip Code if available
    if (leadData.zipCode) {
      fields["Zip Code"] = leadData.zipCode;
    }

    // Add Offer Claimed field if this is an offer claim
    if (leadData.offerClaimed !== undefined) {
      fields["Offer Claimed"] = leadData.offerClaimed;
    }

    // Add Age Range if available (send the full range string like "30-39" or "60+")
    if (userState.ageRange) {
      fields["Age Range"] = userState.ageRange;
    }

    // Add Aesthetic Goals (the free-text message)
    if (leadData.message) {
      fields["Aesthetic Goals"] = leadData.message;
    }

    // Add Concerns (multiselect - send as array)
    const concernNames = selectedConcerns.map((id) => {
      const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
      return concern ? concern.name : id;
    });
    if (concernNames.length > 0) {
      fields["Concerns"] = concernNames; // Send as array for multiselect
    }

    // Add Areas if available (multiselect - send as array)
    const areaNames = selectedAreas.map((id) => {
      const area = AREAS_OF_CONCERN.find((a) => a.id === id);
      return area ? area.name : id;
    });
    if (areaNames.length > 0) {
      fields["Areas"] = areaNames; // Send as array for multiselect
    }

    // Add Skin Type if available
    if (userState.skinType) {
      fields["Skin Type"] = userState.skinType;
    }

    // Add Skin Tone if available
    if (userState.skinTone) {
      fields["Skin Tone"] = userState.skinTone;
    }

    // Add Ethnic Background if available
    if (userState.ethnicBackground) {
      fields["Ethnic Background"] = userState.ethnicBackground;
    }

    // Add Source if provided
    if (leadData.source) {
      fields["Source"] = leadData.source;
    }

    // Add Providers field (linked record)
    const practice = getPracticeFromConfig();
    if (practice === "lakeshore") {
      fields["Providers"] = ["rec3oXyrb1t6YUvoe"];
    } else {
      // Default to Unique Aesthetics
      fields["Providers"] = ["recN9Q4W02xtroD6g"];
    }

    // Add behavioral data if available
    const readCaseIds = behavioralData?.readCases || getReadCases();
    const caseData = behavioralData?.caseData || [];
    const concernsExploredIds =
      behavioralData?.concernsExplored || getConcernsExplored();

    // Viewed Photos (linked records - send as array of record IDs)
    if (readCaseIds.length > 0 && caseData.length > 0) {
      // Get the Airtable record IDs for the viewed cases
      const viewedPhotoRecordIds = readCaseIds
        .map((caseId) => {
          const caseItem = caseData.find((c) => c.id === caseId);
          // The caseItem.id is the Airtable record ID
          return caseItem?.id;
        })
        .filter((id): id is string => !!id); // Filter out undefined values

      if (viewedPhotoRecordIds.length > 0) {
        fields["Viewed Photos"] = viewedPhotoRecordIds; // Send as array for linked records
      }
    }

    // Cases Viewed Count
    if (readCaseIds.length > 0) {
      fields["Cases Viewed Count"] = readCaseIds.length;
    }

    // Concerns Explored (multiselect - send as array)
    if (concernsExploredIds.length > 0) {
      const concernNames = concernsExploredIds
        .map((id) => {
          const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === id);
          return concern ? concern.name : id;
        })
        .filter(Boolean);
      if (concernNames.length > 0) {
        fields["Concerns Explored"] = concernNames; // Send as array for multiselect
      }
    }

    // Engagement Level
    if (readCaseIds.length > 0) {
      fields["Engagement Level"] = getEngagementLevel(readCaseIds.length);
    }

    // Total Cases Available (count of matching cases)
    // This calculation can be expensive, so we do it carefully
    try {
      if (
        caseData.length > 0 &&
        userState.selectedConcerns &&
        userState.selectedConcerns.length > 0
      ) {
        // Count total unique cases matching their selections
        const allMatchingCaseIds = new Set<string>();
        userState.selectedConcerns.forEach((concernId) => {
          try {
            const matchingCases = getMatchingCasesForConcern(
              concernId,
              caseData,
              userState as AppState,
            );
            matchingCases.forEach((c) => allMatchingCaseIds.add(c.id));
          } catch (e) {
            console.warn(
              `Error calculating cases for concern ${concernId}:`,
              e,
            );
          }
        });
        if (allMatchingCaseIds.size > 0) {
          fields["Total Cases Available"] = allMatchingCaseIds.size;
        }
      }
    } catch (e) {
      console.warn("Error calculating total cases available:", e);
      // Continue without this field - don't block submission
    }

    console.log("📤 Submitting lead via secure API:");
    console.log("   URL:", API_URL);
    console.log("   Field count:", Object.keys(fields).length);

    // Log fields with their types for easy Airtable configuration
    console.log("📋 Fields being sent with types:");
    Object.entries(fields).forEach(([fieldName, value]) => {
      const valueType = Array.isArray(value) ? "Array" : typeof value;
      const displayValue = Array.isArray(value)
        ? `[${value.join(", ")}]`
        : typeof value === "string" && value.length > 50
          ? `${value.substring(0, 50)}...`
          : value;
      console.log(`   - "${fieldName}": ${valueType} = ${displayValue}`);
    });

    console.log("   Full fields object:", JSON.stringify(fields, null, 2));
    console.log("   User state data:", {
      selectedConcerns: userState.selectedConcerns,
      selectedAreas: userState.selectedAreas,
      ageRange: userState.ageRange,
      skinType: userState.skinType,
      skinTone: userState.skinTone,
      ethnicBackground: userState.ethnicBackground,
    });

    // Make the API request
    // Ensure arrays are sent as arrays, not strings
    const payload = useDirectAirtable ? { fields } : { fields };
    console.log("📦 Payload being sent:", JSON.stringify(payload, null, 2));
    console.log(
      "🔍 Concerns field type check:",
      Array.isArray(fields["Concerns"])
        ? "Array ✓"
        : `Not array: ${typeof fields["Concerns"]}`,
    );
    console.log(
      "🔍 Areas field type check:",
      Array.isArray(fields["Areas"])
        ? "Array ✓"
        : `Not array: ${typeof fields["Areas"]}`,
    );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (useDirectAirtable) {
      headers["Authorization"] = `Bearer ${airtableApiKey}`;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    // Check if we got HTML instead of JSON (API route doesn't exist)
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      await response.text(); // Read the response to clear it
      throw new Error(
        `API route returned HTML instead of JSON. In development, set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID in .env file to use direct Airtable API.`,
      );
    }

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ API Error Response:");
      console.error("   Status:", response.status, response.statusText);
      console.error("   Error details:", result);

      // Check for common errors
      if (result.details?.error) {
        const error = result.details.error;
        if (error.type === "INVALID_VALUE_FOR_COLUMN") {
          console.error(
            "   ⚠️ Field name mismatch! Check that field names in Airtable match exactly:",
          );
          console.error("   Expected fields:", Object.keys(fields));
        } else if (error.type === "TABLE_NOT_FOUND") {
          console.error(
            '   ⚠️ Table not found! Check that table name is exactly: "Web Popup Leads"',
          );
        } else if (error.type === "AUTHENTICATION_REQUIRED") {
          console.error(
            "   ⚠️ Authentication failed! Check your server-side API key configuration.",
          );
        }
      }

      // Try a minimal fallback with just core contact fields (only if using API route)
      if (!useDirectAirtable) {
        console.log("🔄 Retrying with minimal fields...");
        const minimalFields: Record<string, any> = {
          Name: leadData.name || "",
          "Email Address": leadData.email || "",
          "Phone Number": leadData.phone || "",
        };

        if (leadData.message) {
          minimalFields["Aesthetic Goals"] = leadData.message;
        }

        const retryHeaders: HeadersInit = {
          "Content-Type": "application/json",
        };

        const retryResponse = await fetch(API_URL, {
          method: "POST",
          headers: retryHeaders,
          body: JSON.stringify({ fields: minimalFields }),
        });

        const retryResult = await retryResponse.json();

        if (retryResponse.ok && retryResult.success && retryResult.record) {
          console.log(
            "✅ Lead submitted with minimal fields:",
            retryResult.record,
          );
          return { success: true, record: retryResult.record, partial: true };
        } else {
          console.error("❌ Minimal submission also failed:", retryResult);
          return { success: false, error: retryResult };
        }
      }
    }

    // Handle different response formats
    // Direct Airtable API returns the record directly
    // API route wraps it in {success: true, record: ...}
    let record;
    if (useDirectAirtable) {
      // Direct API returns the record directly
      record = result;
    } else {
      // API route wraps it
      if (result.success && result.record) {
        record = result.record;
      } else {
        console.error("❌ Unexpected response format:", result);
        return { success: false, error: "Unexpected response format" };
      }
    }

    if (record) {
      console.log("✅ Lead submitted successfully:", record);
      console.log(
        "📊 Record created with fields:",
        record.fields || "No fields in response",
      );
      console.log("📊 Record ID:", record.id || "No ID in response");
      return { success: true, record };
    } else {
      console.error("❌ Unexpected response format:", result);
      return { success: false, error: "Unexpected response format" };
    }
  } catch (error: any) {
    console.error("❌ Error submitting lead:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing lead record in Airtable (for consultation requests after lead capture)
 */
export async function updateLeadInAirtable(
  recordId: string,
  leadData: LeadData,
  _userState: Partial<AppState>,
  behavioralData?: BehavioralData,
): Promise<AirtableResponse> {
  try {
    // In development, use direct Airtable API if keys are available
    // In production, use secure API route
    const isDev = import.meta.env.DEV;
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const useDirectAirtable = isDev && airtableApiKey && airtableBaseId;

    const API_URL = useDirectAirtable
      ? `https://api.airtable.com/v0/${airtableBaseId}/Web Popup Leads/${recordId}`
      : `${getBackendBaseUrl()}/api/dashboard/leads/${recordId}`;

    if (useDirectAirtable) {
      console.log("🔗 Using direct Airtable API (development mode)");
    } else {
      console.log("🔗 Using secure API route:", API_URL);
    }

    // Build fields to update (only include fields that are provided)
    const fields: Record<string, any> = {};

    // Update contact info if provided
    if (leadData.name !== undefined) {
      fields["Name"] = leadData.name || "";
    }
    if (leadData.email !== undefined) {
      fields["Email Address"] = leadData.email || "";
    }
    if (leadData.phone !== undefined) {
      fields["Phone Number"] = leadData.phone || "";
    }
    if (leadData.zipCode !== undefined) {
      fields["Zip Code"] = leadData.zipCode || "";
    }

    // Add Offer Claimed field if this is a consultation request
    if (leadData.offerClaimed !== undefined) {
      fields["Offer Claimed"] = leadData.offerClaimed;
    }

    // Update behavioral data if provided
    const readCaseIds = behavioralData?.readCases || getReadCases();
    const caseData = behavioralData?.caseData || [];
    const concernsExploredIds =
      behavioralData?.concernsExplored || getConcernsExplored();

    // Viewed Photos (linked records)
    if (readCaseIds.length > 0 && caseData.length > 0) {
      const viewedPhotoRecordIds = readCaseIds
        .map((caseId) => {
          const caseItem = caseData.find((c) => c.id === caseId);
          return caseItem?.id;
        })
        .filter((id): id is string => !!id);

      if (viewedPhotoRecordIds.length > 0) {
        fields["Viewed Photos"] = viewedPhotoRecordIds;
        fields["Cases Viewed Count"] = viewedPhotoRecordIds.length;
      }
    }

    // Concerns Explored
    if (concernsExploredIds.length > 0) {
      const concernNames = concernsExploredIds
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
    if (readCaseIds.length > 0) {
      fields["Engagement Level"] = getEngagementLevel(readCaseIds.length);
    }

    console.log("🔄 Updating lead in Airtable:", {
      recordId,
      fields,
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (useDirectAirtable) {
      headers["Authorization"] = `Bearer ${airtableApiKey}`;
    }

    // Backend PATCH /api/dashboard/leads/:recordId expects body { fields } only
    const body = JSON.stringify({ fields });

    const response = await fetch(API_URL, {
      method: "PATCH",
      headers,
      body,
    });

    // Check if we got HTML instead of JSON (API route doesn't exist)
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      await response.text(); // Read the response to clear it
      throw new Error(
        `API route returned HTML instead of JSON. In development, set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID in .env file to use direct Airtable API.`,
      );
    }

    const result = await response.json();

    // Handle different response formats
    let record;
    if (useDirectAirtable) {
      // Direct API returns the record directly
      record = result;
    } else {
      // API route wraps it
      if (result.success && result.record) {
        record = result.record;
      } else {
        console.error("❌ API Error Response:", result);
        return { success: false, error: result };
      }
    }

    if (!response.ok) {
      console.error("❌ API Error Response:", result);
      return { success: false, error: result };
    }

    console.log("✅ Lead updated successfully:", record);
    return { success: true, record };
  } catch (error: any) {
    console.error("❌ Error updating lead:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Provider-treatment filtering for direct Airtable (dev) path.
 * Fetches Provider-Treatment Mapping for a provider and filters Photos
 * to only those whose RECORD ID (from General Treatments) is in the allowlist.
 * If no mapping row or empty treatments, returns null (no filter = show all).
 */

const PROVIDER_TREATMENT_MAPPING_TABLE = "Provider-Treatment Mapping";
const AIRTABLE_API = "https://api.airtable.com/v0";

/**
 * Fetch all records from Provider-Treatment Mapping and return allowed
 * General Treatment record IDs for the given providerId, or null if no filter.
 */
export async function fetchProviderAllowedTreatmentIds(
  apiKey: string,
  baseId: string,
  providerId: string
): Promise<string[] | null> {
  const tableEncoded = encodeURIComponent(PROVIDER_TREATMENT_MAPPING_TABLE);
  let allRecords: any[] = [];
  let offset: string | null = null;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.append("offset", offset);
    const url = `${AIRTABLE_API}/${baseId}/${tableEncoded}?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const records = data.records || [];
    allRecords = allRecords.concat(records);
    offset = data.offset || null;
  } while (offset);

  const row = allRecords.find((rec: any) => {
    const fromProviders = rec.fields?.["Record ID (from Providers)"];
    if (Array.isArray(fromProviders)) return fromProviders.includes(providerId);
    return fromProviders === providerId;
  });

  if (!row?.fields) return null;

  const fromTreatments = row.fields["RECORD ID (from General Treatments)"];
  if (!fromTreatments) return null;
  const ids = Array.isArray(fromTreatments) ? fromTreatments : [fromTreatments];
  if (ids.length === 0) return null;

  return ids;
}

/**
 * Filter Airtable Photo records to those whose RECORD ID (from General Treatments)
 * intersects the allowed treatment IDs.
 */
export function filterPhotoRecordsByTreatmentIds(
  records: any[],
  allowedIds: string[]
): any[] {
  const set = new Set(allowedIds);
  return records.filter((rec: any) => {
    const ids = rec.fields?.["RECORD ID (from General Treatments)"];
    if (!ids) return false;
    const arr = Array.isArray(ids) ? ids : [ids];
    return arr.some((id: string) => set.has(id));
  });
}

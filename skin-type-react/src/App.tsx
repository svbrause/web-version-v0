import { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import ClinicHeader from "./components/ClinicHeader";
import ConcernsScreen from "./components/screens/ConcernsScreen";
import AreasScreen from "./components/screens/AreasScreen";
import AgeScreen from "./components/screens/AgeScreen";
import SkinTypeScreen from "./components/screens/SkinTypeScreen";
import SkinToneScreen from "./components/screens/SkinToneScreen";
import EthnicBackgroundScreen from "./components/screens/EthnicBackgroundScreen";
import WellnessStepScreen from "./components/screens/WellnessStepScreen";
import CelebrationScreen from "./components/screens/CelebrationScreen";
import LeadCaptureScreen from "./components/screens/LeadCaptureScreen";
import ResultsScreen from "./components/screens/ResultsScreen";
import SuggestionDetailScreen from "./components/screens/SuggestionDetailScreen";
import LandingScreen from "./components/screens/LandingScreen";
import OnboardingScreen from "./components/screens/OnboardingScreen";
import NextButton from "./components/NextButton";
import ConsultationModal from "./components/ConsultationModal";
import WellnessQuizModal from "./components/WellnessQuizModal";
import {
  getFormStepsForPractice,
  getConcernById,
  getConcernByName,
} from "./constants/data";
import { getPracticeFromConfig, getPracticeDisplayName } from "./components/Logo";
import { trackEvent } from "./utils/analytics";
import { isSurgicalCase, isGloballyExcludedCase } from "./utils/caseMatching";
import { getBackendBaseUrl } from "./config/backend";
import { getProviderIdForPractice } from "./config/providerId";
import {
  fetchProviderAllowedTreatmentIds,
  filterPhotoRecordsByTreatmentIds,
} from "./utils/providerTreatmentFilter";
import { isTreatmentOfferedByTheTreatment } from "./config/theTreatmentOfferings";
import { isCaseForWellnest } from "./config/wellnestPeptideOfferings";
import { WELLNEST_SAMPLE_CASES } from "./data/wellnestSampleCases";
import type { CaseItem } from "./types";
import "./App.css";

function AppContent() {
  const { state, caseData, setCaseData, isLoading, setIsLoading, showWellnessQuizModal, setShowWellnessQuizModal } = useApp();

  // Set practice-specific data attribute on body for CSS targeting
  useEffect(() => {
    const practice = getPracticeFromConfig();
    if (typeof document !== "undefined" && practice !== null) {
      document.body.setAttribute("data-practice", practice);
      document.title = `Discover Your Perfect Treatment | ${getPracticeDisplayName(
        practice
      )}`;
      console.log(
        `🎨 Set practice to: ${practice} (from URL: ${window.location.pathname}${window.location.search})`
      );
    }
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const practice = getPracticeFromConfig();
      if (typeof document !== "undefined" && practice !== null) {
        document.body.setAttribute("data-practice", practice);
        document.title = `Discover Your Perfect Treatment | ${getPracticeDisplayName(
          practice
        )}`;
        console.log(
          `🎨 Updated practice to: ${practice} (from URL: ${window.location.pathname}${window.location.search})`
        );
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    const interval = setInterval(() => {
      const currentPractice = document.body.getAttribute("data-practice");
      const expectedPractice = getPracticeFromConfig();
      if (expectedPractice !== null && currentPractice !== expectedPractice) {
        handleLocationChange();
      }
    }, 100);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  // Load case data on mount - with retry logic similar to original
  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true);

      // First try to get from window (if main app loaded it)
      if (typeof window !== "undefined" && (window as any).caseData) {
        const data = (window as any).caseData;
        if (Array.isArray(data) && data.length > 0) {
          const practice = getPracticeFromConfig();
          // Filter out surgical cases and globally excluded treatments (e.g. Upneeq)
          let nonSurgicalData = data.filter(
            (caseItem: any) =>
              !isSurgicalCase(caseItem) && !isGloballyExcludedCase(caseItem)
          );
          // The Treatment: only show cases for treatments they offer
          if (practice === "the-treatment") {
            const before = nonSurgicalData.length;
            nonSurgicalData = nonSurgicalData.filter((caseItem: any) =>
              isTreatmentOfferedByTheTreatment(caseItem)
            );
            console.log(
              `✓ The Treatment: filtered to offered treatments: ${before} → ${nonSurgicalData.length} cases`
            );
          }
          // Wellnest (peptide version): only show cases matching indication keywords (no compound names)
          if (practice === "wellnest") {
            const before = nonSurgicalData.length;
            nonSurgicalData = nonSurgicalData.filter((caseItem: any) =>
              isCaseForWellnest(caseItem)
            );
            console.log(
              `✓ Wellnest: filtered to peptide/indication cases: ${before} → ${nonSurgicalData.length} cases`
            );
            nonSurgicalData = [...nonSurgicalData, ...WELLNEST_SAMPLE_CASES];
          }
          setCaseData(nonSurgicalData);
          setIsLoading(false);
          console.log(
            `✓ Loaded ${data.length} cases from window.caseData, filtered to ${nonSurgicalData.length} non-surgical cases`
          );

          // Also try to get CASE_CATEGORY_MAPPING from main app if available
          if ((window as any).CASE_CATEGORY_MAPPING) {
            // Store in window for caseMatching utils to access
            (window as any).CASE_CATEGORY_MAPPING = (
              window as any
            ).CASE_CATEGORY_MAPPING;
            console.log("✓ Loaded CASE_CATEGORY_MAPPING from main app");
          }
          return;
        }
      }

      // Fallback: Try to load from Airtable if config is available
      try {
        // In development, try direct Airtable call if API route fails
        // In production, use secure API route
        const isDev = import.meta.env.DEV;
        const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
        const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;

        let allRecords: any[] = [];
        let offset: string | null = null;
        let pageCount = 0;
        const maxPages = 50; // Safety limit

        // In development with API keys, use direct Airtable calls
        // Otherwise use existing backend: GET /api/dashboard/leads?tableName=Photos (returns { success, records, count })
        const useDirectAirtable = isDev && airtableApiKey && airtableBaseId;

        if (useDirectAirtable) {
          console.log("📡 Using direct Airtable API (development mode)");
          if (!airtableApiKey || !airtableBaseId) {
            throw new Error(
              "Airtable API key or Base ID not configured. Set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID in .env file"
            );
          }
        } else {
          console.log(
            "📡 Using backend GET /api/dashboard/leads?tableName=Photos"
          );
        }

        const practice = getPracticeFromConfig();
        const providerId = practice ? getProviderIdForPractice(practice) : null;

        if (useDirectAirtable) {
          // Paginate with Airtable offset
          do {
            pageCount++;
            const params = new URLSearchParams();
            params.append("pageSize", "100");
            if (offset) params.append("offset", offset);
            const url = `https://api.airtable.com/v0/${airtableBaseId}/Photos?${params.toString()}`;
            const response = await fetch(url, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${airtableApiKey}`,
                "Content-Type": "application/json",
              },
            });
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
              await response.text();
              throw new Error(
                `API route returned HTML instead of JSON. In development, set VITE_AIRTABLE_API_KEY and VITE_AIRTABLE_BASE_ID in .env file.`
              );
            }
            if (!response.ok) {
              const error = await response
                .json()
                .catch(() => ({ message: "Unknown error" }));
              throw new Error(
                `API error: ${response.status} ${response.statusText} - ${
                  error.message || "Unknown error"
                }`
              );
            }
            const data = await response.json();
            const pageRecords = data.records || [];
            allRecords = allRecords.concat(pageRecords);
            offset = data.offset || null;
            console.log(
              `Fetched page ${pageCount}: ${pageRecords.length} records (total so far: ${allRecords.length})`
            );
          } while (offset !== null && pageCount < maxPages);

          // Provider-treatment filter (direct Airtable): only show cases for treatments this provider offers
          if (providerId && airtableApiKey && airtableBaseId) {
            const allowedIds = await fetchProviderAllowedTreatmentIds(
              airtableApiKey,
              airtableBaseId,
              providerId
            );
            if (allowedIds && allowedIds.length > 0) {
              const before = allRecords.length;
              allRecords = filterPhotoRecordsByTreatmentIds(
                allRecords,
                allowedIds
              );
              console.log(
                `✓ Provider filter: ${before} Photos → ${allRecords.length} (allowed treatments)`
              );
            }
          }
        } else {
          // Backend: GET /api/dashboard/leads?tableName=Photos&providerId=... (backend filters by Provider-Treatment Mapping)
          const urlParams = new URLSearchParams({ tableName: "Photos" });
          if (providerId) urlParams.append("providerId", providerId);
          const url = `${getBackendBaseUrl()}/api/dashboard/leads?${urlParams.toString()}`;
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            await response.text();
            throw new Error(
              `Backend returned HTML instead of JSON. Check that ponce-patient-backend.vercel.app is deployed and FRONTEND_URL includes https://cases.ponce.ai.`
            );
          }
          if (!response.ok) {
            const error = await response
              .json()
              .catch(() => ({ message: "Unknown error" }));
            throw new Error(
              `API error: ${response.status} ${response.statusText} - ${
                error.message || "Unknown error"
              }`
            );
          }
          const data = await response.json();
          allRecords = data.records || [];
          pageCount = 1;
          console.log(
            `✓ Fetched ${allRecords.length} records from backend (Photos table)`
          );
        }

        console.log(
          `✓ Successfully fetched ${allRecords.length} total records (${pageCount} page(s))`
        );

        const records = allRecords;

        // Transform records to match CaseItem format
        const transformedData = records.map((record: any) => {
          const fields = record.fields || {};
          const name = fields["Name"] || `Treatment ${record.id}`;

          // Get images - try multiple field name variations
          let beforeAfterField = null;
          if (fields["Before/After Photo"]) {
            beforeAfterField = Array.isArray(fields["Before/After Photo"])
              ? fields["Before/After Photo"][0]?.url
              : fields["Before/After Photo"];
          } else if (fields["Before/After"]) {
            beforeAfterField = Array.isArray(fields["Before/After"])
              ? fields["Before/After"][0]?.url
              : fields["Before/After"];
          } else if (fields["Photo"]) {
            beforeAfterField = Array.isArray(fields["Photo"])
              ? fields["Photo"][0]?.url
              : fields["Photo"];
          }

          let thumbnailField = null;
          if (fields["Thumbnail"]) {
            thumbnailField = Array.isArray(fields["Thumbnail"])
              ? fields["Thumbnail"][0]?.url
              : fields["Thumbnail"];
          }

          // Get headline - PRIMARY: "Story Title" (from generated stories)
          // Falls back to other field name variations
          const headline =
            fields["Story Title"] ||
            fields["Headline"] ||
            fields["Title"] ||
            fields["Case Title"] ||
            fields["Story Headline"] ||
            fields["Treatment Title"] ||
            name;

          // Get story - PRIMARY: "Story Detailed" (from generated stories)
          // Falls back to other field name variations
          const story =
            fields["Story Detailed"] ||
            fields["Story"] ||
            fields["Description"] ||
            fields["Patient Story"] ||
            fields["Case Story"] ||
            fields["Background"] ||
            fields["Notes"] ||
            "";

          // Get treatment details - try multiple variations (including linked record display names)
          const treatmentFromLinked =
            fields["Treatment (from General Treatments)"] ??
            fields["General Treatments"] ??
            fields["Treatment Name"];
          const treatmentRaw =
            fields["Treatment Details"] ||
            fields["Treatment"] ||
            fields["Treatment Description"] ||
            (Array.isArray(treatmentFromLinked)
              ? treatmentFromLinked.filter((x: any) => typeof x === "string").join(" ")
              : typeof treatmentFromLinked === "string"
                ? treatmentFromLinked
                : "") ||
            "";
          const treatment = typeof treatmentRaw === "string" ? treatmentRaw : "";

          return {
            id: record.id,
            name: name,
            headline: headline,
            patient: fields["Patient Name"] || fields["Patient"] || "",
            story: story,
            solved: fields["Solved"] || [],
            matchingCriteria: (() => {
              // Check for "Matching Criteria" first, then "Matching"
              const matchingValue =
                fields["Matching Criteria"] || fields["Matching"];
              if (!matchingValue) return [];
              // If it's already an array, return it
              if (Array.isArray(matchingValue)) return matchingValue;
              // If it's a string, split by comma and trim
              if (typeof matchingValue === "string") {
                return matchingValue
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s);
              }
              return [];
            })(),
            beforeAfter: beforeAfterField,
            thumbnail: thumbnailField,
            treatment: treatment,
            directMatchingIssues: fields["Direct Matching Issues"] || [],
            surgical: fields["Surgical (from General Treatments)"] ?? fields["Surgical"] ?? "",
            patientAge: fields["Age"] || fields["Patient Age"] || null,
            skinType: fields["Skin Type"] || null,
            skinTone: fields["Skin Tone"] || null,
            areaNames: fields["Area Names"] || fields["Areas"] || null,
            concernIds: (() => {
              const raw = fields["Case Concerns"] || fields["App Concerns"] || null;
              if (!raw) return undefined;
              const strings = Array.isArray(raw)
                ? raw.filter((v): v is string => typeof v === "string")
                : typeof raw === "string"
                  ? [raw.trim()].filter(Boolean)
                  : [];
              if (strings.length === 0) return undefined;
              // Map Airtable values (display names like "Volume Loss" or IDs like "volume-loss") to app concern IDs
              const ids = strings
                .map((v) => {
                  const trimmed = (v || "").trim();
                  const byName = getConcernByName(trimmed);
                  if (byName) return byName.id;
                  const byId = getConcernById(trimmed);
                  if (byId) return byId.id;
                  return null;
                })
                .filter((id): id is string => id != null);
              return ids.length > 0 ? ids : undefined;
            })(),
          };
        });

        // Filter out surgical cases and globally excluded treatments (e.g. Upneeq)
        let nonSurgicalData: CaseItem[] = transformedData.filter(
          (caseItem: any) =>
            !isSurgicalCase(caseItem) && !isGloballyExcludedCase(caseItem)
        ) as CaseItem[];

        // The Treatment: only show cases for treatments they offer (exclude e.g. Liquid Rhinoplasty, Laser Hair Removal, Ultraclear)
        if (practice === "the-treatment") {
          const before = nonSurgicalData.length;
          nonSurgicalData = nonSurgicalData.filter((caseItem: any) =>
            isTreatmentOfferedByTheTreatment(caseItem)
          );
          console.log(
            `✓ The Treatment: filtered to offered treatments: ${before} → ${nonSurgicalData.length} cases`
          );
        }
        // Wellnest (peptide version): only show cases matching indication keywords
        if (practice === "wellnest") {
          const before = nonSurgicalData.length;
          nonSurgicalData = nonSurgicalData.filter((caseItem: any) =>
            isCaseForWellnest(caseItem)
          );
          console.log(
            `✓ Wellnest: filtered to peptide/indication cases: ${before} → ${nonSurgicalData.length} cases`
          );
          // Ensure wellnest always has sample cases to show when Airtable has none
          nonSurgicalData = [...nonSurgicalData, ...WELLNEST_SAMPLE_CASES];
        }

        setCaseData(nonSurgicalData);
        setIsLoading(false);
        console.log(
          `✓ Loaded ${transformedData.length} cases from Airtable, filtered to ${nonSurgicalData.length} non-surgical cases`
        );
      } catch (error) {
        setIsLoading(false);
        console.warn("Could not load cases from Airtable:", error);
      }
    };

    // Try immediately
    if (caseData.length === 0) {
      loadCaseData();
    }

    // Also set up a retry mechanism in case window.caseData becomes available later
    const retryInterval = setInterval(() => {
      if (
        caseData.length === 0 &&
        typeof window !== "undefined" &&
        (window as any).caseData
      ) {
        const data = (window as any).caseData;
        if (Array.isArray(data) && data.length > 0) {
          let final = data.filter(
            (c: any) => !isSurgicalCase(c) && !isGloballyExcludedCase(c)
          );
          if (getPracticeFromConfig() === "the-treatment") {
            final = final.filter((c: any) =>
              isTreatmentOfferedByTheTreatment(c)
            );
          }
          if (getPracticeFromConfig() === "wellnest") {
            final = final.filter((c: any) => isCaseForWellnest(c));
            final = [...final, ...WELLNEST_SAMPLE_CASES];
          }
          setCaseData(final);
          setIsLoading(false);
          console.log(
            `✓ Loaded ${data.length} cases from window.caseData (retry), ${final.length} after filters`
          );
          clearInterval(retryInterval);
        }
      }
    }, 500);

    // Clear interval after 10 seconds (20 retries)
    const timeout = setTimeout(() => {
      clearInterval(retryInterval);
      if (caseData.length === 0) {
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      clearInterval(retryInterval);
      clearTimeout(timeout);
    };
  }, [caseData.length, setCaseData, setIsLoading]);

  const formSteps = getFormStepsForPractice(getPracticeFromConfig());

  // Calculate which screen to show based on current step
  const getCurrentScreen = () => {
    // Show landing screen first (currentStep === -1)
    if (state.currentStep === -1) {
      return <LandingScreen />;
    }
    // Show onboarding screens (between -1 and 0)
    if (
      state.currentStep === -0.7 ||
      state.currentStep === -0.5 ||
      state.currentStep === -0.3
    ) {
      return <OnboardingScreen />;
    }
    // Show suggestion detail screen if viewing one
    if (state.viewingSuggestionDetail) {
      return <SuggestionDetailScreen />;
    }
    // After all form steps (including review), show celebration
    if (state.currentStep === formSteps.length) {
      return <CelebrationScreen />;
    }
    // After celebration, show lead capture
    if (state.currentStep === formSteps.length + 1) {
      return <LeadCaptureScreen />;
    }
    // After lead capture, show results
    if (state.currentStep >= formSteps.length + 2) {
      return <ResultsScreen />;
    }

    // Show form steps (including review)
    if (state.currentStep >= 0 && state.currentStep < formSteps.length) {
      const currentStepName = formSteps[state.currentStep];
      switch (currentStepName) {
        case "concerns":
          return <ConcernsScreen />;
        case "areas":
          return <AreasScreen />;
        case "age":
          return <AgeScreen />;
        case "wellness":
          return <WellnessStepScreen />;
        case "skinType":
          return <SkinTypeScreen />;
        case "skinTone":
          return <SkinToneScreen />;
        case "ethnicBackground":
          return <EthnicBackgroundScreen />;
        default:
          return <ConcernsScreen />;
      }
    }

    // Fallback (should never reach here, but prevents blank screen)
    return <ConcernsScreen />;
  };

  const currentStepName =
    state.currentStep === -1
      ? "landing"
      : state.currentStep === -0.7 ||
        state.currentStep === -0.5 ||
        state.currentStep === -0.3
      ? "onboarding"
      : state.viewingSuggestionDetail
      ? "suggestionDetail"
      : state.currentStep < formSteps.length
      ? formSteps[state.currentStep]
      : state.currentStep === formSteps.length
      ? "celebration"
      : state.currentStep === formSteps.length + 1
      ? "leadCapture"
      : "results";
  const showHeader =
    !["landing", "onboarding", "results", "suggestionDetail"].includes(
      currentStepName
    ) &&
    state.currentStep >= 0 &&
    state.currentStep < formSteps.length + 3;

  // Reset focus when step/screen changes so buttons don't stay in hover/selected (gray) state
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el?.blur) {
      el.blur();
    }
  }, [state.currentStep]);

  // Track screen views
  useEffect(() => {
    trackEvent("screen_viewed", {
      screen_name: currentStepName,
      step_number: state.currentStep,
      selected_concerns_count: state.selectedConcerns.length,
      selected_areas_count: state.selectedAreas.length,
    });
  }, [
    currentStepName,
    state.currentStep,
    state.selectedConcerns.length,
    state.selectedAreas.length,
  ]);

  const appContainerClass = showHeader
    ? "app-container"
    : "app-container header-hidden";

  return (
    <div className={appContainerClass}>
      <ClinicHeader />
      {showHeader && <Header />}
      {isLoading && caseData.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading cases...</p>
        </div>
      ) : (
        <div className="main-content">{getCurrentScreen()}</div>
      )}
      {!isLoading && state.currentStep !== -1 && state.currentStep >= 0 && (
        <NextButton />
      )}
      <ConsultationModal />
      {showWellnessQuizModal && (
        <WellnessQuizModal onClose={() => setShowWellnessQuizModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

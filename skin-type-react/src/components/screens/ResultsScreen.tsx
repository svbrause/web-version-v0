import { useEffect, useState, useMemo, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { HIGH_LEVEL_CONCERNS, FORM_STEPS } from "../../constants/data";
import {
  getDeduplicatedCasesPerConcern,
  getRelevantAreasForCase,
} from "../../utils/caseMatching";
import { trackEvent } from "../../utils/analytics";
import { saveUserData } from "../../utils/userDataCollection";
import { scheduleBehavioralSync, forceSyncNow } from "../../utils/airtableSync";
import ConsultationModal from "../ConsultationModal";
import OfferCard from "../OfferCard";
import Logo, { getPracticeHomeUrl } from "../Logo";
import type { CaseItem, AppState } from "../../types";
import "../../App.css";

export default function ResultsScreen() {
  const { state, caseData, setCaseData, updateState } = useApp();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const scrollStatesRef = useRef<
    Record<string, { showLeft: boolean; showRight: boolean }>
  >({});
  const [readCases, setReadCases] = useState<Set<string>>(new Set());

  // Scroll to top when ResultsScreen mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Set up final sync on page unload/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is being hidden (user switching tabs or closing)
        forceSyncNow(caseData);
      }
    };

    const handleBeforeUnload = () => {
      // Final sync before page unloads
      forceSyncNow(caseData);
    };

    // Sync when page becomes hidden
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Sync before page unloads (less reliable but good backup)
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Final sync on component unmount
      forceSyncNow(caseData);
    };
  }, [caseData]);

  // Load read cases from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem("readCases");
        if (stored) {
          const readArray = JSON.parse(stored);
          setReadCases(new Set(readArray));
        }
      } catch (e) {
        console.error("Error loading read cases:", e);
      }
    }
  }, []);

  // Save read cases to localStorage and schedule sync
  const markCaseAsRead = (caseId: string) => {
    setReadCases((prev) => {
      const newSet = new Set(prev);
      newSet.add(caseId);
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem("readCases", JSON.stringify(Array.from(newSet)));
          // Schedule debounced sync to Airtable
          scheduleBehavioralSync(caseData);
        } catch (e) {
          console.error("Error saving read cases:", e);
        }
      }
      return newSet;
    });
  };

  // Try to refresh case data if not loaded yet
  useEffect(() => {
    if (
      caseData.length === 0 &&
      typeof window !== "undefined" &&
      (window as any).caseData
    ) {
      const data = (window as any).caseData;
      if (Array.isArray(data) && data.length > 0) {
        setCaseData(data);
        console.log(
          `ResultsScreen: Loaded ${data.length} cases from window.caseData`,
        );
      }
    }
  }, [caseData.length, setCaseData]);

  // Save user data when reaching results screen
  useEffect(() => {
    if (state.currentStep >= FORM_STEPS.length + 2) {
      saveUserData({
        stage: "results",
        selectedConcerns: state.selectedConcerns,
        selectedAreas: state.selectedAreas,
        ageRange: state.ageRange,
        skinType: state.skinType,
        skinTone: state.skinTone,
        ethnicBackground: state.ethnicBackground,
      });
    }
  }, [
    state.currentStep,
    state.selectedConcerns,
    state.selectedAreas,
    state.ageRange,
    state.skinType,
    state.skinTone,
    state.ethnicBackground,
  ]);

  const requestConsultation = () => {
    setShowConsultationModal(true);
  };

  const handleConcernClick = (concernId: string) => {
    const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);
    const matchingCases = deduplicatedCasesByConcern[concernId] ?? [];

    // Track concern as explored in localStorage and schedule sync
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem("concernsExplored");
        const explored = stored ? JSON.parse(stored) : [];
        if (!explored.includes(concernId)) {
          explored.push(concernId);
          localStorage.setItem("concernsExplored", JSON.stringify(explored));
          // Schedule debounced sync to Airtable
          scheduleBehavioralSync(caseData);
        }
      } catch (e) {
        console.error("Error saving concerns explored:", e);
      }
    }

    trackEvent("concern_cases_viewed", {
      concern_id: concernId,
      concern_name: concern?.name,
      case_count: matchingCases.length,
    });

    updateState({
      viewingConcernCases: true,
      viewingConcernCasesId: concernId,
    });

    // Scroll to top when navigating to concern details
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToConcerns = () => {
    updateState({
      viewingConcernCases: false,
      viewingConcernCasesId: null,
    });
    setSelectedCaseId(null);
  };

  const handleCaseClick = (caseId: string) => {
    markCaseAsRead(caseId);
    setSelectedCaseId(caseId);

    // Scroll to top when case detail page is shown
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Find the case to track details
    const caseItem = caseData.find((c) => c.id === caseId);
    if (caseItem) {
      trackEvent("case_viewed", {
        case_id: caseId,
        case_name: caseItem.name || caseItem.headline,
        concern_id: state.viewingConcernCasesId,
        concern_name: HIGH_LEVEL_CONCERNS.find(
          (c) => c.id === state.viewingConcernCasesId,
        )?.name,
        relevance_score: caseItem.matchingScore,
      });
    }
  };

  const handleCloseCaseDetail = () => {
    setSelectedCaseId(null);
  };

  const escapeHtml = (text: string | undefined): string => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // Deduplicated cases per concern (each case in exactly one concern's list) for browse cards and Explore view
  const deduplicatedCasesByConcern = useMemo(
    () => getDeduplicatedCasesPerConcern(state.selectedConcerns, caseData, state),
    [state.selectedConcerns, caseData, state],
  );

  // Get the selected case item for the detail view (look up in full caseData so it works with deduplicated lists)
  const selectedCaseItem: CaseItem | null = useMemo(() => {
    if (!selectedCaseId) return null;
    return caseData.find((c) => c.id === selectedCaseId) || null;
  }, [selectedCaseId, caseData]);

  // Show case detail page
  if (selectedCaseId && selectedCaseItem) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-page-content">
          {renderCaseDetailPage(selectedCaseItem, handleCloseCaseDetail, state)}
        </div>
        <div className="results-cta-container case-detail-page-footer">
          <OfferCard showPresentIcon={false} />
          <button className="results-cta-button" onClick={requestConsultation}>
            Request Consult
          </button>
        </div>
        <ConsultationModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
        />
      </div>
    );
  }

  // Show cases for a concern (use deduplicated list so no repetition across concerns)
  if (state.viewingConcernCases && state.viewingConcernCasesId) {
    const concern = HIGH_LEVEL_CONCERNS.find(
      (c) => c.id === state.viewingConcernCasesId,
    );
    const matchingCases = deduplicatedCasesByConcern[state.viewingConcernCasesId] ?? [];
    const readCount = matchingCases.filter((c) => readCases.has(c.id)).length;
    const totalCount = matchingCases.length;

    return (
      <div className="results-screen">
        <div className="results-header-bar">
          <Logo className="results-header-logo" />
          <button
            className="results-header-close"
            onClick={() => (window.location.href = getPracticeHomeUrl())}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="concern-cases-section">
          <div className="concern-cases-header">
            <button
              className="concern-cases-back-button"
              onClick={handleBackToConcerns}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h2 className="concern-cases-title">
                {concern?.name || "Cases"}
              </h2>
              <p className="concern-cases-subtitle">
                {readCount} of {totalCount} cases read
              </p>
            </div>
          </div>

          <div className="concern-cases-grid">
            {matchingCases.map((caseItem) => {
              const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
              const caseTitle = caseItem.headline || caseItem.name || "Case";
              const relevantAreas = getRelevantAreasForCase(caseItem);
              const isRead = readCases.has(caseItem.id);

              return (
                <div
                  key={caseItem.id}
                  className={`concern-case-card ${
                    isRead ? "concern-case-card-read" : ""
                  }`}
                  onClick={() => handleCaseClick(caseItem.id)}
                >
                  <div className="concern-case-card-image-wrapper">
                    {imageUrl ? (
                      <div className="concern-case-card-image">
                        <img
                          src={imageUrl}
                          alt={caseTitle}
                          loading="lazy"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.innerHTML =
                              '<div class="case-placeholder">Before/After</div>';
                          }}
                        />
                        {relevantAreas.length > 0 && (
                          <div className="concern-case-card-areas-overlay">
                            {relevantAreas.length <= 2 ? (
                              // If 2 or fewer areas, show all
                              relevantAreas.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="concern-case-card-area-overlay"
                                >
                                  {escapeHtml(area)}
                                </span>
                              ))
                            ) : (
                              // If more than 2, show first one + count
                              <>
                                {relevantAreas.slice(0, 1).map((area, idx) => (
                                  <span
                                    key={idx}
                                    className="concern-case-card-area-overlay"
                                  >
                                    {escapeHtml(area)}
                                  </span>
                                ))}
                                <span className="concern-case-card-area-overlay">
                                  +{relevantAreas.length - 1}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {isRead ? (
                          <div className="concern-case-card-read-indicator">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>seen</span>
                          </div>
                        ) : (
                          <div className="concern-case-card-unread-indicator">
                            <span>New</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="concern-case-card-image">
                        <div className="case-placeholder">Before/After</div>
                        {relevantAreas.length > 0 && (
                          <div className="concern-case-card-areas-overlay">
                            {relevantAreas.length <= 2 ? (
                              // If 2 or fewer areas, show all
                              relevantAreas.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="concern-case-card-area-overlay"
                                >
                                  {escapeHtml(area)}
                                </span>
                              ))
                            ) : (
                              // If more than 2, show first one + count
                              <>
                                {relevantAreas.slice(0, 1).map((area, idx) => (
                                  <span
                                    key={idx}
                                    className="concern-case-card-area-overlay"
                                  >
                                    {escapeHtml(area)}
                                  </span>
                                ))}
                                <span className="concern-case-card-area-overlay">
                                  +{relevantAreas.length - 1}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {isRead ? (
                          <div className="concern-case-card-read-indicator">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>seen</span>
                          </div>
                        ) : (
                          <div className="concern-case-card-unread-indicator">
                            <span>New</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="concern-case-card-content">
                    <h3 className="concern-case-card-title">
                      {escapeHtml(caseTitle)}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="results-cta-container">
          <OfferCard showPresentIcon={false} />
          <button className="results-cta-button" onClick={requestConsultation}>
            Request Consult
          </button>
        </div>

        <ConsultationModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
        />
      </div>
    );
  }

  // Show concern cards (main view)
  return (
    <div className="results-screen">
      <div className="results-header-bar">
        <Logo className="results-header-logo" />
        <button
          className="results-header-close"
          onClick={() => (window.location.href = getPracticeHomeUrl())}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {state.selectedConcerns.length > 0 && (
        <>
          <div className="browse-by-concern-header">
            <h2 className="browse-by-concern-heading">Browse by Concern</h2>
            <p className="browse-by-concern-subheading">
              Explore cases organized by your selected concerns
            </p>
          </div>
          <div className="concern-cards-container">
            {state.selectedConcerns.map((concernId) => {
              const concern = HIGH_LEVEL_CONCERNS.find(
                (c) => c.id === concernId,
              );
              if (!concern) return null;

              const matchingCases = deduplicatedCasesByConcern[concernId] ?? [];
              const caseImagesWithData = matchingCases
                .map((c) => ({
                  imageUrl: c.beforeAfter || c.thumbnail,
                  caseItem: c,
                }))
                .filter(
                  (item): item is { imageUrl: string; caseItem: CaseItem } =>
                    !!item.imageUrl,
                )
                .slice(0, 10);

              const caseImages = caseImagesWithData.map(
                (item) => item.imageUrl,
              );
              const caseItems = caseImagesWithData.map(
                (item) => item.caseItem,
              );

              const reviewedCount = matchingCases.filter((c) =>
                readCases.has(c.id),
              ).length;
              const totalCases = matchingCases.length;

              return (
                <div key={concernId} className="concern-card-new">
                  <h3 className="concern-card-new-title">{concern.name}</h3>

                  {caseImages.length > 0 && (
                    <PhotoScroll
                      concernId={concernId}
                      caseImages={caseImages}
                      caseItems={caseItems}
                      scrollStatesRef={scrollStatesRef}
                    />
                  )}

                  <div className="concern-card-new-footer">
                    <p className="concern-card-new-count">
                      {reviewedCount} of {totalCases} cases read
                    </p>
                    <button
                      className="concern-card-new-button"
                      onClick={() => handleConcernClick(concernId)}
                    >
                      {totalCases > 0 ? "Explore Cases" : "Review Cases"}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="results-cta-container">
        <OfferCard showPresentIcon={false} />
        <button className="results-cta-button" onClick={requestConsultation}>
          Request Consult
        </button>
      </div>

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />
    </div>
  );
}

function PhotoScroll({
  concernId,
  caseImages,
  caseItems,
  scrollStatesRef,
}: {
  concernId: string;
  caseImages: string[];
  caseItems?: CaseItem[];
  scrollStatesRef: React.MutableRefObject<
    Record<string, { showLeft: boolean; showRight: boolean }>
  >;
}) {
  const [scrollState, setScrollState] = useState({
    showLeft: false,
    showRight: true,
    isScrollable: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      const isScrollable = scrollWidth > clientWidth;
      const showLeft = isScrollable && scrollLeft > 10;
      const showRight =
        isScrollable && scrollLeft < scrollWidth - clientWidth - 10;

      const newState = { showLeft, showRight, isScrollable };
      setScrollState(newState);
      scrollStatesRef.current[concernId] = { showLeft, showRight };
    };

    // Initial check with a small delay to ensure layout is complete
    setTimeout(updateScrollState, 100);
    updateScrollState();

    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [concernId, caseImages.length, scrollStatesRef]);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);
  const concernName = concern?.name || "Concern";

  return (
    <div className="concern-card-photos-scroll">
      {scrollState.isScrollable && scrollState.showLeft && (
        <div className="concern-card-photos-fade-left"></div>
      )}
      {scrollState.isScrollable && scrollState.showRight && (
        <div className="concern-card-photos-fade-right"></div>
      )}
      <div ref={containerRef} className="concern-card-photos-container">
        {caseImages.map((imageUrl, imgIdx) => {
          const caseItem = caseItems?.[imgIdx];
          const relevantAreas = caseItem
            ? getRelevantAreasForCase(caseItem)
            : [];
          const displayArea =
            relevantAreas.length > 0 ? relevantAreas[0] : null;

          return (
            <div key={imgIdx} className="concern-card-photo-wrapper">
              <div className="concern-card-photo-item">
                <img
                  src={imageUrl}
                  alt={`${concernName} case ${imgIdx + 1}`}
                  className="concern-card-photo-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {displayArea && (
                  <div className="concern-case-card-areas-overlay">
                    <span className="concern-case-card-area-overlay">
                      {displayArea}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {scrollState.isScrollable && (
        <>
          {scrollState.showLeft && (
            <button
              className="concern-card-scroll-arrow concern-card-scroll-arrow-left"
              onClick={(e) => {
                e.stopPropagation();
                scrollLeft();
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
          {scrollState.showRight && (
            <button
              className="concern-card-scroll-arrow concern-card-scroll-arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                scrollRight();
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}

function renderCaseDetailPage(
  caseItem: CaseItem,
  onBack: () => void,
  _userState: AppState,
): JSX.Element {
  const escapeHtml = (text: string | undefined): string => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
  const storyTitle = caseItem.headline || caseItem.name || "Case";
  const casePatient = caseItem.patient;
  const caseStory = caseItem.story;
  const solvedIssues = caseItem.solved || [];
  const caseTreatment = (caseItem as any).treatment;
  const patientAge = (caseItem as any).patientAge;

  let patientInfo = "";
  if (casePatient) {
    patientInfo = casePatient;
    if (patientAge) {
      patientInfo += `, ${patientAge} years old`;
    }
  } else if (patientAge) {
    patientInfo = `${patientAge} years old`;
  }

  return (
    <>
      <div className="results-header-bar">
        <Logo className="results-header-logo" />
        <button
          className="results-header-close"
          onClick={() => (window.location.href = getPracticeHomeUrl())}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {imageUrl ? (
        <div className="case-detail-page-image">
          <button className="case-detail-back-button" onClick={onBack}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <img
            src={imageUrl}
            alt={storyTitle}
            className="case-detail-page-image-element"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="case-detail-page-image">
          <button className="case-detail-back-button" onClick={onBack}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="case-detail-page-placeholder">Before/After</div>
        </div>
      )}

      <div className="case-detail-page-body">
        <h1 className="case-detail-page-title">{escapeHtml(storyTitle)}</h1>

        {(() => {
          const patientAge = (caseItem as any).patientAge;
          const caseSkinType = (caseItem as any).skinType;
          const caseSkinTone = (caseItem as any).skinTone;

          if (patientAge || caseSkinType || caseSkinTone) {
            return (
              <div className="case-detail-page-meta">
                <div className="case-detail-page-meta-line">
                  {patientAge && (
                    <span className="case-detail-page-meta-item">
                      {escapeHtml(`${patientAge} years old`)}
                    </span>
                  )}
                  {caseSkinType && (
                    <span className="case-detail-page-meta-item">
                      Skin Type: {escapeHtml(caseSkinType)}
                    </span>
                  )}
                  {caseSkinTone && (
                    <span className="case-detail-page-meta-item">
                      Skin Tone: {escapeHtml(caseSkinTone)}
                    </span>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {caseStory && (
          <div className="case-detail-page-section case-detail-page-story">
            <h3 className="case-detail-page-section-title">Patient Story</h3>
            <p className="case-detail-page-story-content">
              {escapeHtml(caseStory)}
            </p>
          </div>
        )}

        {solvedIssues.length > 0 && (
          <div className="case-detail-page-section">
            <h3 className="case-detail-page-section-title">What This Solved</h3>
            <div className="case-detail-page-tags">
              {solvedIssues.map((issue, idx) => (
                <span key={idx} className="case-detail-page-tag">
                  {escapeHtml(String(issue))}
                </span>
              ))}
            </div>
          </div>
        )}

        {caseTreatment && (
          <div className="case-detail-page-section">
            <h3 className="case-detail-page-section-title">
              Treatment Details
            </h3>
            <p className="case-detail-page-story-content">
              {escapeHtml(caseTreatment)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

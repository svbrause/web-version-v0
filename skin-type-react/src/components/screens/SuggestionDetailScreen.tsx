import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  getMatchingCasesForConcern,
  groupCasesByTreatmentSuggestion,
  extractTreatmentFromCaseName,
} from "../../utils/caseMatching";
import ConsultationModal from "../ConsultationModal";
import Logo, { getPracticeHomeUrl, getPracticeFromConfig } from "../Logo";
import type { CaseItem } from "../../types";
import "../../App.css";

export default function SuggestionDetailScreen() {
  const { state, caseData, updateState } = useApp();
  const practice = getPracticeFromConfig();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const concernId = state.suggestionDetailConcernId;
  const groupIndex = state.suggestionDetailGroupIndex;

  // Get matching cases and treatment groups
  const treatmentGroups = useMemo(() => {
    if (!concernId || caseData.length === 0) return [];

    const matchingCases = getMatchingCasesForConcern(
      concernId,
      caseData,
      state
    );
    if (matchingCases.length === 0) return [];

    return groupCasesByTreatmentSuggestion(matchingCases, state);
  }, [concernId, caseData, state]);

  const selectedGroup = useMemo(() => {
    if (groupIndex === null || !treatmentGroups[groupIndex]) return null;
    return treatmentGroups[groupIndex];
  }, [groupIndex, treatmentGroups]);

  const handleBack = () => {
    updateState({
      viewingSuggestionDetail: false,
      suggestionDetailConcernId: null,
      suggestionDetailGroupIndex: null,
    });
  };

  const handleCaseClick = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleCloseCaseDetail = () => {
    setSelectedCaseId(null);
  };

  const selectedCaseItem: CaseItem | null = useMemo(() => {
    if (!selectedCaseId || !selectedGroup) return null;
    return selectedGroup.cases.find((c) => c.id === selectedCaseId) || null;
  }, [selectedCaseId, selectedGroup]);

  const requestConsultation = () => {
    setShowConsultationModal(true);
  };

  const escapeHtml = (text: string | undefined): string => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  if (!selectedGroup) {
    handleBack();
    return null;
  }

  // Show case detail page instead of modal
  if (selectedCaseId && selectedCaseItem) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-page-content">
          {renderCaseDetailPage(selectedCaseItem, handleCloseCaseDetail, state)}
        </div>
        <div className="case-detail-page-footer">
          <button className="results-cta-button" onClick={requestConsultation}>
            Request Consultation
          </button>
          {practice === "lakeshore" && (
            <p className="results-cta-incentive">
              Receive $50 credit when you book a consult
            </p>
          )}
        </div>
        <ConsultationModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
        />
      </div>
    );
  }

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

      <div className="suggestion-detail-section">
        <div className="suggestion-detail-content">
          <button className="suggestion-back-button" onClick={handleBack}>
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
            <h2 className="suggestion-detail-title">
              {escapeHtml(selectedGroup.suggestion)}
            </h2>
            <p className="suggestion-detail-subtitle">
              {selectedGroup.cases.length} patient result
              {selectedGroup.cases.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="case-cards-grid">
          {selectedGroup.cases
            .sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0))
            .map((caseItem) => {
              const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
              const treatmentName = extractTreatmentFromCaseName(
                caseItem.name || caseItem.headline
              );
              const storyTitle = caseItem.headline || null;

              return (
                <div
                  key={caseItem.id}
                  className="case-card"
                  onClick={() => handleCaseClick(caseItem.id)}
                >
                  {imageUrl ? (
                    <div className="case-card-image">
                      <img
                        src={imageUrl}
                        alt={treatmentName}
                        loading="lazy"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.innerHTML =
                            '<div class="case-placeholder">Before/After</div>';
                        }}
                      />
                      <div className="case-card-chips-overlay">
                        <span className="case-card-chip case-card-chip-treatment">
                          {escapeHtml(treatmentName)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="case-card-image">
                      <div className="case-placeholder">Before/After</div>
                      <div className="case-card-chips-overlay">
                        <span className="case-card-chip case-card-chip-treatment">
                          {escapeHtml(treatmentName)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="case-card-content">
                    {storyTitle && (
                      <h3 className="case-card-story-title">
                        {escapeHtml(storyTitle)}
                      </h3>
                    )}
                    <div className="case-card-content-row">
                      <button className="case-card-button">
                        View Details
                        <svg
                          width="14"
                          height="14"
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
                </div>
              );
            })}
        </div>
      </div>

      <div className="results-cta-container">
        <button className="results-cta-button" onClick={requestConsultation}>
          {practice === "lakeshore" ? "Proceed" : "Request Consultation"}
        </button>
        {practice === "lakeshore" && (
          <p className="results-cta-incentive">
            Receive $50 credit when you book
          </p>
        )}
      </div>

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />
    </div>
  );
}

function renderCaseDetailPage(
  caseItem: CaseItem,
  onBack: () => void,
  _userState: any
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
  const relevanceScore = caseItem.matchingScore || 0;
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

          if (
            patientAge ||
            caseSkinType ||
            caseSkinTone
          ) {
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

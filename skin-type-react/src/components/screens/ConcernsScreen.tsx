// import React from 'react';
import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { HIGH_LEVEL_CONCERNS } from "../../constants/data";
import { getMatchingCasesForConcern } from "../../utils/caseMatching";
import { trackEvent } from "../../utils/analytics";
import ConsultationModal from "../ConsultationModal";
import "../../App.css";

export default function ConcernsScreen() {
  const { state, updateState, caseData } = useApp();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Sort concerns by number of matching cases (most to least)
  // Only recalculate when caseData or demographic fields change, NOT when selectedConcerns changes
  // This prevents expensive recalculation on every click
  const sortedConcerns = useMemo(() => {
    if (caseData.length === 0) return HIGH_LEVEL_CONCERNS;

    // Use a minimal state object for matching - only include fields that affect case matching
    const minimalState = {
      ageRange: state.ageRange,
      skinType: state.skinType,
      skinTone: state.skinTone,
      ethnicBackground: state.ethnicBackground,
      selectedConcerns: [], // Don't use selected concerns for sorting
      selectedAreas: [],
    };

    return [...HIGH_LEVEL_CONCERNS].sort((a, b) => {
      const aCount = getMatchingCasesForConcern(
        a.id,
        caseData,
        minimalState as any,
      ).length;
      const bCount = getMatchingCasesForConcern(
        b.id,
        caseData,
        minimalState as any,
      ).length;
      return bCount - aCount; // Descending order (most cases first)
    });
  }, [
    caseData,
    state.ageRange,
    state.skinType,
    state.skinTone,
    state.ethnicBackground,
  ]);

  const toggleConcern = (concernId: string) => {
    const current = state.selectedConcerns;
    const concern = HIGH_LEVEL_CONCERNS.find((c) => c.id === concernId);

    // Update state immediately for instant UI feedback
    if (current.includes(concernId)) {
      // Deselection
      const newSelected = current.filter((id) => id !== concernId);
      updateState({
        selectedConcerns: newSelected,
      });
      setShowLimitWarning(false);
      // Track analytics asynchronously (don't block UI)
      setTimeout(() => {
        trackEvent("concern_deselected", {
          concern_id: concernId,
          concern_name: concern?.name,
          total_selected: newSelected.length,
        });
      }, 0);
      return;
    }

    // Prevent selection if limit is already reached
    if (current.length >= 3) {
      setShowLimitWarning(true);
      // Track analytics asynchronously
      setTimeout(() => {
        trackEvent("concern_limit_reached", {
          concern_id: concernId,
          concern_name: concern?.name,
        });
      }, 0);
      return;
    }

    // Allow selection if under limit
    const newSelected = [...current, concernId];
    updateState({
      selectedConcerns: newSelected,
    });
    setShowLimitWarning(false);
    // Track analytics asynchronously (don't block UI)
    setTimeout(() => {
      trackEvent("concern_selected", {
        concern_id: concernId,
        concern_name: concern?.name,
        total_selected: newSelected.length,
      });
    }, 0);
  };

  return (
    <div className="question-view">
      <h1 className="main-question">First, what would you like to improve?</h1>
      <p className="subtitle">
        Select up to 3 concerns that matter most to you.
      </p>

      {showLimitWarning && (
        <div className="selection-warning">
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div className="selection-warning-content">
            <p className="selection-warning-text">
              You can only select up to 3 concerns in this virtual consultation.
              For personalized recommendations tailored to your specific needs,{" "}
              <button
                className="selection-warning-link"
                onClick={() => setShowConsultationModal(true)}
              >
                book an in-clinic consultation
              </button>
              .
            </p>
          </div>
        </div>
      )}

      <div className="concerns-grid">
        {sortedConcerns.map((concern) => {
          const isSelected = state.selectedConcerns.includes(concern.id);
          return (
            <button
              key={concern.id}
              className={`concern-card ${isSelected ? "selected" : ""}`}
              onClick={() => toggleConcern(concern.id)}
              onMouseLeave={(e) => {
                // Reset visual state when mouse leaves during drag
                if (!isSelected) {
                  e.currentTarget.blur();
                }
              }}
            >
              <div className="concern-card-content">
                <h3 className="concern-card-title">{concern.name}</h3>
                <p className="concern-card-description">
                  {concern.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="selection-count">
        {state.selectedConcerns.length} of 3 selected
      </div>

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />
    </div>
  );
}

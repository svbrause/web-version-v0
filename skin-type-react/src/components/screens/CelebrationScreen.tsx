// import React from 'react';
import { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { getMatchingCasesForConcern, getRelevantAreasForCase } from "../../utils/caseMatching";
import { AREAS_OF_CONCERN } from "../../constants/data";
import type { CaseItem } from "../../types";
import "../../App.css";

export default function CelebrationScreen() {
  const { state, goToNextStep, caseData } = useApp();

  // Get total unique cases and preview cases
  const { totalCases, previewCases } = useMemo(() => {
    const allCasesMap = new Map<string, CaseItem>();

    // Get ALL matching cases for each selected concern
    state.selectedConcerns.forEach((concernId) => {
      const matchingCases = getMatchingCasesForConcern(
        concernId,
        caseData,
        state,
      );
      matchingCases.forEach((caseItem) => {
        // Store unique cases (a case might match multiple concerns)
        if (!allCasesMap.has(caseItem.id)) {
          allCasesMap.set(caseItem.id, caseItem);
        }
      });
    });

    const allUniqueCases = Array.from(allCasesMap.values());

    // Sort by relevance score and get top 3 for preview
    const sortedCases = allUniqueCases.sort(
      (a, b) => (b.matchingScore || 0) - (a.matchingScore || 0),
    );
    const preview = sortedCases.slice(0, 3);

    return {
      totalCases: allUniqueCases.length,
      previewCases: preview,
    };
  }, [state.selectedConcerns, caseData, state]);

  return (
    <div className="celebration-screen">
      <div className="celebration-container">
        <div className="celebration-header">
          <h1 className="celebration-title">We Found Your Perfect Matches!</h1>
          <p className="celebration-subtitle">
            Discover real patient results tailored specifically to your aesthetic goals
          </p>
        </div>

        {previewCases.length > 0 && (
          <div className="celebration-preview">
            <div className="preview-label">Preview of case results:</div>
            <div className="celebration-cases-preview">
              {previewCases.map((caseItem) => {
                const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
                
                // Get relevant areas for this case
                const caseAreas = getRelevantAreasForCase(caseItem);
                
                // Find matching areas from user's selected areas
                const matchingAreas = caseAreas
                  .map(areaName => {
                    // Find the area in AREAS_OF_CONCERN that matches
                    const area = AREAS_OF_CONCERN.find(a => a.name === areaName);
                    if (area && state.selectedAreas.includes(area.id)) {
                      return area.name;
                    }
                    return null;
                  })
                  .filter(name => name !== null) as string[];
                
                // Display the first matching area, or first case area if no match found
                const displayArea = matchingAreas.length > 0 
                  ? matchingAreas[0] 
                  : (caseAreas.length > 0 ? caseAreas[0] : null);
                
                return (
                  <div key={caseItem.id} className="celebration-case-wrapper">
                    <div className="celebration-case-preview">
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={caseItem.headline || caseItem.name}
                            className="celebration-case-image"
                            loading="lazy"
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
                        </>
                      ) : (
                        <div className="celebration-case-placeholder">
                          Before/After
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalCases > 3 && (
              <div className="celebration-more-text">
                +{totalCases - 3} more case studies waiting for you
              </div>
            )}
          </div>
        )}

        <div className="celebration-cta">
          <button
            type="button"
            className="celebration-cta-button"
            onClick={goToNextStep}
          >
            View Cases
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
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
}

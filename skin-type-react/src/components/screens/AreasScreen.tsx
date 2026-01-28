// import React from 'react';
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AREAS_OF_CONCERN } from '../../constants/data';
import { getAvailableAreasForConcerns } from '../../utils/caseMatching';
import { trackEvent } from '../../utils/analytics';
import ConsultationModal from '../ConsultationModal';
import "../../App.css";

export default function AreasScreen() {
  const { state, updateState, caseData, isLoading } = useApp();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Filter areas to only show those that have cases matching selected concerns
  // Only recalculate when concerns change, not when areas are selected
  const availableAreas = useMemo(() => {
    // If caseData is not loaded yet, show all areas (will update when data loads)
    if (isLoading || caseData.length === 0) {
      console.log('⚠️ AreasScreen: caseData not loaded yet, showing all areas temporarily', {
        isLoading,
        caseDataLength: caseData.length,
        selectedConcerns: state.selectedConcerns
      });
      return AREAS_OF_CONCERN;
    }

    // Create a test state without selectedAreas to avoid filtering based on area selection
    const testState = {
      ...state,
      selectedAreas: [] // Don't use selected areas for filtering
    };
    const availableAreaIds = getAvailableAreasForConcerns(state.selectedConcerns, caseData, testState);
    const filtered = AREAS_OF_CONCERN.filter(area => availableAreaIds.includes(area.id));
    
    console.log('📊 AreasScreen: Filtered areas based on concerns', {
      selectedConcerns: state.selectedConcerns,
      caseDataLength: caseData.length,
      availableAreaIds: availableAreaIds.length,
      filteredAreas: filtered.length,
      totalAreas: AREAS_OF_CONCERN.length
    });
    
    return filtered;
  }, [state.selectedConcerns, caseData, state.ageRange, state.skinType, state.skinTone, state.ethnicBackground, isLoading]);

  const toggleArea = (areaId: string) => {
    const current = state.selectedAreas;
    const area = AREAS_OF_CONCERN.find(a => a.id === areaId);
    
    // If already selected, allow deselection
    if (current.includes(areaId)) {
      updateState({
        selectedAreas: current.filter(id => id !== areaId)
      });
      setShowLimitWarning(false);
      trackEvent('area_deselected', {
        area_id: areaId,
        area_name: area?.name,
        total_selected: current.length - 1,
      });
      return;
    }
    
    // Prevent selection if limit is already reached
    if (current.length >= 3) {
      // They tried to select a 4th item - show warning
      setShowLimitWarning(true);
      trackEvent('area_limit_reached', {
        area_id: areaId,
        area_name: area?.name,
      });
      return;
    }
    
    // Allow selection if under limit
    updateState({
      selectedAreas: [...current, areaId]
    });
    setShowLimitWarning(false);
    trackEvent('area_selected', {
      area_id: areaId,
      area_name: area?.name,
      total_selected: current.length + 1,
    });
  };

  const allAreasShown = availableAreas.length === AREAS_OF_CONCERN.length;

  return (
    <div className="question-view">
      <h1 className="main-question">Which areas are you most concerned about?</h1>
      <p className="subtitle">
        {allAreasShown 
          ? "Select up to 3 areas to focus on."
          : `Select up to 3 areas to focus on. Showing only areas with cases matching your selected concerns.`
        }
      </p>
      
      {showLimitWarning && (
        <div className="selection-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div className="selection-warning-content">
            <p className="selection-warning-text">
              You can only select up to 3 areas in this virtual consultation. For personalized recommendations tailored to your specific needs,{" "}
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
      
      <div className="areas-grid">
        {availableAreas.map(area => {
          const isSelected = state.selectedAreas.includes(area.id);
          return (
            <button
              key={area.id}
              className={`area-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleArea(area.id)}
              onMouseLeave={(e) => {
                // Reset visual state when mouse leaves during drag
                if (!isSelected) {
                  e.currentTarget.blur();
                }
              }}
            >
              <span className="area-card-title">{area.name}</span>
            </button>
          );
        })}
      </div>
      <div className="selection-count">
        {state.selectedAreas.length} of 3 selected
      </div>
      
      <ConsultationModal isOpen={showConsultationModal} onClose={() => setShowConsultationModal(false)} />
    </div>
  );
}

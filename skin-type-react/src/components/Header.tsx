// import React from 'react';
import { useApp } from '../context/AppContext';
import { FORM_STEPS, NOT_SURE_QUESTIONS } from '../constants/data';
import "../App.css";

export default function Header() {
  const { state, goToPreviousStep, updateState } = useApp();
  
  // Calculate progress - account for celebration and lead capture screens
  // Total steps: form steps (6) + celebration (1) + lead capture (1) = 8
  const totalSteps = FORM_STEPS.length + 2;
  let progress = ((state.currentStep + 1) / totalSteps) * 100;
  
  // Skin type is step index 3
  const skinTypeStepProgress = ((3 + 1) / totalSteps) * 100;
  
  if (state.showingSkinTypeDetail) {
    // When showing determined skin type screen, check if we came from not sure flow
    if (state.cameFromNotSureFlow) {
      // Use the maximum progress from not sure flow (both questions answered)
      const maxNotSureProgress = skinTypeStepProgress + ((NOT_SURE_QUESTIONS.length / NOT_SURE_QUESTIONS.length) * 5); // ~71.67%
      progress = Math.max(skinTypeStepProgress, maxNotSureProgress);
    } else {
      // Direct selection - use base skin type step progress
      progress = skinTypeStepProgress;
    }
  } else if (state.inNotSureFlow) {
    // When in not sure flow, maintain the skin type step's progress
    // Add a small increment for each question answered to show progress within the flow
    const questionProgress = (state.notSureQuestionIndex + 1) / NOT_SURE_QUESTIONS.length; // 0.5 for first question, 1.0 for second
    // Add up to 5% progress for answering questions within the not sure flow
    progress = skinTypeStepProgress + (questionProgress * 5);
  }

  const handleBack = () => {
    if (state.showingSkinTypeDetail) {
      // From detail view, go back to questions or skin type selection
      if (state.inNotSureFlow) {
        // Go back to last question in not sure flow
        updateState({
          showingSkinTypeDetail: false,
          notSureQuestionIndex: NOT_SURE_QUESTIONS.length - 1
        });
      } else {
        // Go back to skin type selection
        updateState({
          showingSkinTypeDetail: false,
          skinType: null,
          cameFromNotSureFlow: false
        });
      }
    } else if (state.inNotSureFlow) {
      // Handle back navigation within not sure flow
      if (state.notSureQuestionIndex > 0) {
        // Go back to previous question
        updateState({
          notSureQuestionIndex: state.notSureQuestionIndex - 1
        });
      } else {
        // Go back to skin type selection
        updateState({
          inNotSureFlow: false,
          notSureQuestionIndex: 0,
          notSureAnswers: [],
          skinType: null
        });
      }
    } else if (state.currentStep === 0) {
      // On the first form step (ConcernsScreen), go back to landing page
      updateState({ currentStep: -1 });
    } else if (state.currentStep === FORM_STEPS.length) {
      // On celebration screen, go back to last form step
      goToPreviousStep();
    } else if (state.currentStep === FORM_STEPS.length + 1) {
      // On lead capture screen, go back to celebration
      goToPreviousStep();
    } else {
      // Normal back navigation
      goToPreviousStep();
    }
  };

  return (
    <div className="header">
      <button className="back-button" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

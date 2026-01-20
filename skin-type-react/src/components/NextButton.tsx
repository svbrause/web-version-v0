// import React from 'react';
import { useApp } from "../context/AppContext";
import { FORM_STEPS, NOT_SURE_QUESTIONS } from "../constants/data";
import { trackEvent } from "../utils/analytics";
import { saveUserData } from "../utils/userDataCollection";
import "../App.css";

export default function NextButton() {
  const { state, goToNextStep, updateState } = useApp();

  const canProceed = () => {
    const step = FORM_STEPS[state.currentStep];

    switch (step) {
      case "concerns":
        return (
          state.selectedConcerns.length > 0 &&
          state.selectedConcerns.length <= 3
        );
      case "areas":
        return (
          state.selectedAreas.length > 0 && state.selectedAreas.length <= 3
        );
      case "age":
        return state.ageRange !== null;
      case "skinType":
        // If showing detail screen, allow proceeding
        if (state.showingSkinTypeDetail) return true;
        // If in not sure flow, check if current question has answer
        if (state.inNotSureFlow) {
          return state.notSureAnswers[state.notSureQuestionIndex] !== undefined;
        }
        return state.skinType !== null;
      case "skinTone":
        return state.skinTone !== null;
      case "ethnicBackground":
        return state.ethnicBackground !== null; // Required step
      default:
        return false;
    }
  };

  const handleNext = () => {
    const step = FORM_STEPS[state.currentStep];
    
    // If in not sure flow on skin type step, advance within the flow
    if (state.inNotSureFlow && step === 'skinType') {
      const hasAnswer = state.notSureAnswers[state.notSureQuestionIndex] !== undefined;
      
      if (!hasAnswer) return; // Can't proceed without answer
      
      const nextQuestionIndex = state.notSureQuestionIndex + 1;
      
      if (nextQuestionIndex < NOT_SURE_QUESTIONS.length) {
        // Move to next question
        updateState({
          notSureQuestionIndex: nextQuestionIndex
        });
      } else {
        // All questions answered, determine skin type and show detail
        const determineSkinType = (answers: number[]) => {
          if (answers.length < 2) return 'balanced';
          const answer1 = answers[0];
          const answer2 = answers[1];
          
          if (answer1 === 0) return 'oily';
          if (answer1 === 1) return 'combination';
          if (answer1 === 2) return 'balanced';
          if (answer1 === 3) return 'dry';
          if (answer1 === 4) {
            if (answer2 === 0) return 'combination';
            if (answer2 === 1) return 'dry';
            if (answer2 === 2) return 'balanced';
            if (answer2 === 3) return 'combination';
            return 'balanced';
          }
          return 'balanced';
        };
        
        const determinedSkinType = determineSkinType(state.notSureAnswers);
        updateState({
          skinType: determinedSkinType,
          inNotSureFlow: false,
          showingSkinTypeDetail: true,
          cameFromNotSureFlow: true,
          notSureAnswers: [],
          notSureQuestionIndex: 0
        });
      }
      return;
    }
    
    // If showing skin type detail (from not sure flow), hide it and proceed to next step
    if (state.showingSkinTypeDetail && step === 'skinType') {
      updateState({
        showingSkinTypeDetail: false,
        cameFromNotSureFlow: false // Reset flag when leaving detail screen
      });
      goToNextStep();
      return;
    }
    
    // Normal next step (including direct skin type selection)
    trackEvent('form_step_completed', {
      step_name: step,
      step_number: state.currentStep,
      next_step: FORM_STEPS[state.currentStep + 1] || 'completed',
      selected_concerns: state.selectedConcerns.length,
      selected_areas: state.selectedAreas.length,
      age_range: state.ageRange,
      skin_type: state.skinType,
      skin_tone: state.skinTone,
    });
    
    // Save user data at each step
    const nextStep = FORM_STEPS[state.currentStep + 1];
    if (nextStep) {
      saveUserData({
        stage: nextStep,
        selectedConcerns: state.selectedConcerns,
        selectedAreas: state.selectedAreas,
        ageRange: state.ageRange,
        skinType: state.skinType,
        skinTone: state.skinTone,
        ethnicBackground: state.ethnicBackground,
      });
    }
    
    goToNextStep();
  };

  const isVisible =
    state.currentStep < FORM_STEPS.length &&
    canProceed();

  if (!isVisible) {
    return null;
  }

  return (
    <button className="next-button" onClick={handleNext}>
      <svg
        width="24"
        height="24"
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
  );
}

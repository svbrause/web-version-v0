// import React from 'react';
import { useApp } from "../context/AppContext";
import {
  getFormStepsForPractice,
  NOT_SURE_QUESTIONS,
  MAX_SELECTED_CONCERNS,
  MAX_SELECTED_CONCERNS_WELLNEST,
} from "../constants/data";
import { getPracticeFromConfig } from "./Logo";
import { trackEvent } from "../utils/analytics";
import { saveUserData } from "../utils/userDataCollection";
import "../App.css";

export default function NextButton() {
  const { state, goToNextStep, updateState } = useApp();
  const practice = getPracticeFromConfig();
  const formSteps = getFormStepsForPractice(practice);
  const maxConcerns =
    practice === "wellnest" ? MAX_SELECTED_CONCERNS_WELLNEST : MAX_SELECTED_CONCERNS;

  const canProceed = () => {
    const step = formSteps[state.currentStep];

    switch (step) {
      case "concerns":
        return (
          state.selectedConcerns.length > 0 &&
          state.selectedConcerns.length <= maxConcerns
        );
      case "areas":
        return (
          state.selectedAreas.length > 0 && state.selectedAreas.length <= 3
        );
      case "age":
        return state.ageRange !== null;
      case "wellness": {
        const wIdx = state.wellnessStepIndex ?? 0;
        if (wIdx === 0) return state.wellnessQuizAnswers?.activity !== undefined;
        if (wIdx === 1) return state.wellnessQuizAnswers?.bodyComposition !== undefined;
        if (wIdx === 2) return state.wellnessQuizAnswers?.skinInterest !== undefined;
        return true; // goals (3) and conditions (4) optional
      }
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
    const step = formSteps[state.currentStep];
    
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

    // Wellness step: advance through sub-screens (0–4) then leave step
    if (step === 'wellness') {
      const wIdx = state.wellnessStepIndex ?? 0;
      if (wIdx < 3) {
        updateState({ wellnessStepIndex: wIdx + 1 });
        return;
      }
      // Leaving wellness step
      goToNextStep();
      return;
    }
    
    // Normal next step (including direct skin type selection)
    trackEvent('form_step_completed', {
      step_name: step,
      step_number: state.currentStep,
      next_step: formSteps[state.currentStep + 1] || 'completed',
      selected_concerns: state.selectedConcerns.length,
      selected_areas: state.selectedAreas.length,
      age_range: state.ageRange,
      skin_type: state.skinType,
      skin_tone: state.skinTone,
    });
    
    // Save user data at each step
    const nextStep = formSteps[state.currentStep + 1];
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
    state.currentStep < formSteps.length &&
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

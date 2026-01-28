import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppState, CaseItem } from '../types';
import { FORM_STEPS } from '../constants/data';

interface AppContextType {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  caseData: CaseItem[];
  setCaseData: (data: CaseItem[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  getCurrentStepName: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentStep: -1, // Start at -1 to show landing page first
  selectedConcerns: [],
  selectedAreas: [],
  ageRange: null,
  skinType: null,
  skinTone: null,
  ethnicBackground: null,
  inNotSureFlow: false,
  notSureQuestionIndex: 0,
  notSureAnswers: [],
  showingSkinTypeDetail: false,
  cameFromNotSureFlow: false,
  viewingSuggestionDetail: false,
  suggestionDetailConcernId: null,
  suggestionDetailGroupIndex: null,
  viewingConcernCases: false,
  viewingConcernCasesId: null
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Try to restore from sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem('appState');
        if (stored) {
          const parsed = JSON.parse(stored);
          // If user has already started the form (currentStep >= 0), restore their progress
          // Otherwise, show landing page (currentStep === -1)
          if (parsed.currentStep !== undefined && parsed.currentStep >= 0) {
            return { ...initialState, ...parsed };
          }
        }
      } catch (e) {
        console.error('Error restoring state:', e);
      }
    }
    return initialState;
  });

  const [caseData, setCaseData] = useState<CaseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Save to sessionStorage whenever state changes (async, don't block UI)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Use requestIdleCallback or setTimeout to avoid blocking UI updates
      const saveState = () => {
        try {
          sessionStorage.setItem('appState', JSON.stringify(state));
        } catch (e) {
          console.error('Error saving state:', e);
        }
      };
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(saveState);
      } else {
        setTimeout(saveState, 0);
      }
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState(prev => {
      // Handle not sure flow navigation
      if (prev.inNotSureFlow) {
        if (prev.notSureQuestionIndex > 0) {
          // Go back to previous question
          return { ...prev, notSureQuestionIndex: prev.notSureQuestionIndex - 1 };
        } else {
          // Go back to skin type selection
          return {
            ...prev,
            inNotSureFlow: false,
            notSureQuestionIndex: 0,
            notSureAnswers: [],
            skinType: null
          };
        }
      }
      // Handle onboarding navigation
      if (prev.currentStep === -0.3) {
        // From onboarding screen 3, go to screen 2
        return { ...prev, currentStep: -0.5 };
      }
      if (prev.currentStep === -0.5) {
        // From onboarding screen 2, go to screen 1
        return { ...prev, currentStep: -0.7 };
      }
      if (prev.currentStep === -0.7) {
        // From onboarding screen 1, go to landing
        return { ...prev, currentStep: -1 };
      }
      // Normal step navigation
      return { ...prev, currentStep: Math.max(-1, prev.currentStep - 1) };
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const getCurrentStepName = useCallback(() => {
    return FORM_STEPS[state.currentStep] || 'concerns';
  }, [state.currentStep]);

  return (
    <AppContext.Provider
      value={{
        state,
        updateState,
        caseData,
        setCaseData,
        isLoading,
        setIsLoading,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        getCurrentStepName
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

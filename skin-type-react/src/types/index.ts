// Type definitions for the skin type minimalist app

export interface Concern {
  id: string;
  name: string;
  description: string;
  mapsToPhotos?: string[];
  mapsToSpecificIssues?: string[];
}

export interface Area {
  id: string;
  name: string;
}

export interface SkinTypeData {
  title: string;
  description: string;
  characteristics: string[];
}

export interface CaseItem {
  id: string;
  name: string;
  beforeAfter?: string;
  thumbnail?: string;
  headline?: string;
  story?: string;
  patient?: string;
  solved?: string[];
  matchingCriteria?: string[];
  suggestion?: string;
  matchingScore?: number;
  treatment?: string;
  surgical?: string | boolean;
}

export interface TreatmentGroup {
  suggestion: string;
  cases: CaseItem[];
}

export interface AppState {
  currentStep: number;
  selectedConcerns: string[];
  selectedAreas: string[];
  ageRange: string | null;
  skinType: string | null;
  skinTone: string | null;
  ethnicBackground: string | null;
  inNotSureFlow: boolean;
  notSureQuestionIndex: number;
  notSureAnswers: number[];
  showingSkinTypeDetail: boolean;
  cameFromNotSureFlow: boolean;
  viewingSuggestionDetail: boolean;
  suggestionDetailConcernId: string | null;
  suggestionDetailGroupIndex: number | null;
  viewingConcernCases: boolean;
  viewingConcernCasesId: string | null;
}

export type FormStep = 'concerns' | 'areas' | 'age' | 'skinType' | 'skinTone' | 'ethnicBackground' | 'review';

export interface NotSureQuestion {
  question: string;
  subtitle: string;
  options: string[];
}

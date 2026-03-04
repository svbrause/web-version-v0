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
  /** Optional video URL for case detail (e.g. wellnest); when set, detail page shows video with play button. */
  videoUrl?: string;
  headline?: string;
  story?: string;
  patient?: string;
  solved?: string[];
  matchingCriteria?: string[];
  suggestion?: string;
  matchingScore?: number;
  treatment?: string;
  surgical?: string | boolean;
  /** App concern IDs from DB (e.g. Airtable "Case Concerns") — used first for matching; keyword fallback when missing. */
  concernIds?: string[];
  /** Wellnest wellness case: when set, show icon instead of photo (energy, sleep, gut, brain, joint). */
  wellnessIcon?: "energy" | "sleep" | "gut" | "brain" | "joint";
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
  /** Wellness quiz answers (wellnest): used for peptide suggestions on results. */
  wellnessQuizAnswers?: Record<string, number | number[]>;
  /** Sub-step within wellness flow (0–3: activity, bodyComposition, skinInterest, conditions). */
  wellnessStepIndex?: number;
  /** When set, results screen shows this wellness category's cases (wellnest). */
  viewingWellnessCategoryId?: string | null;
}

export type FormStep = 'concerns' | 'areas' | 'age' | 'wellness' | 'skinType' | 'skinTone' | 'ethnicBackground' | 'review';

export interface NotSureQuestion {
  question: string;
  subtitle: string;
  options: string[];
}

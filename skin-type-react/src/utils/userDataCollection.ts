// Utility to collect and store user data from the app

export interface UserData {
  id: string;
  timestamp: string;
  stage: string; // Stage reached: 'concerns', 'areas', 'age', 'skinType', 'skinTone', 'ethnicBackground', 'celebration', 'leadCapture', 'results', 'consultationSubmitted'
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  selectedConcerns: string[];
  selectedAreas: string[];
  ageRange?: string | null;
  skinType?: string | null;
  skinTone?: string | null;
  ethnicBackground?: string | null;
  sessionId?: string;
  completedAt?: string;
}

const STORAGE_KEY = 'userLeadsData';

// Generate a unique ID for each user session
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('userSessionId');
  if (!sessionId) {
    sessionId = generateUserId();
    sessionStorage.setItem('userSessionId', sessionId);
  }
  return sessionId;
}

// Save user data
export function saveUserData(data: Partial<UserData>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const sessionId = getSessionId();
    const existingData = getUserData();
    
    // Find existing entry for this session or create new
    let userEntry = existingData.find(u => u.sessionId === sessionId);
    
    if (!userEntry) {
      userEntry = {
        id: generateUserId(),
        timestamp: new Date().toISOString(),
        stage: 'started',
        selectedConcerns: [],
        selectedAreas: [],
        sessionId,
      };
      existingData.push(userEntry);
    }
    
    // Update with new data
    Object.assign(userEntry, {
      ...data,
      sessionId,
      timestamp: userEntry.timestamp || new Date().toISOString(),
    });
    
    // If stage indicates completion, set completedAt
    if (data.stage === 'consultationSubmitted' || data.stage === 'results') {
      userEntry.completedAt = new Date().toISOString();
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
  } catch (e) {
    console.error('Error saving user data:', e);
  }
}

// Get all user data
export function getUserData(): UserData[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading user data:', e);
    return [];
  }
}

// Clear all user data (for testing/admin)
export function clearUserData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get stage name for display
export function getStageDisplayName(stage: string): string {
  const stageNames: Record<string, string> = {
    'started': 'Started',
    'concerns': 'Selected Concerns',
    'areas': 'Selected Areas',
    'age': 'Entered Age',
    'skinType': 'Selected Skin Type',
    'skinTone': 'Selected Skin Tone',
    'ethnicBackground': 'Entered Ethnic Background',
    'celebration': 'Reached Results',
    'leadCapture': 'Lead Capture',
    'results': 'Viewed Results',
    'consultationSubmitted': 'Consultation Submitted',
  };
  return stageNames[stage] || stage;
}

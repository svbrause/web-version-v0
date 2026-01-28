import '../App.css';

export type PracticeName = 'lakeshore' | 'unique';

interface LogoProps {
  practice?: PracticeName;
  className?: string;
}

// Get practice from URL parameter, environment variable, or window variable, default to 'unique'
// Priority: 1. URL param (for testing/dev) > 2. VITE_PRACTICE_NAME (env var for production) > 3. window.PRACTICE_NAME > 4. default
export function getPracticeFromConfig(): PracticeName {
  if (typeof window !== 'undefined') {
    // 1. Check URL parameter first (for testing/flexibility - allows override in dev)
    const urlParams = new URLSearchParams(window.location.search);
    const practiceParam = urlParams.get('practice')?.toLowerCase();
    if (practiceParam === 'lakeshore' || practiceParam === 'unique') {
      return practiceParam as PracticeName;
    }
    
    // 2. Check Vite environment variable (for production)
    const vitePractice = import.meta.env.VITE_PRACTICE_NAME?.toLowerCase();
    if (vitePractice === 'lakeshore' || vitePractice === 'unique') {
      return vitePractice as PracticeName;
    }
    
    // 3. Check window variable (legacy support)
    const windowPractice = (window as any).PRACTICE_NAME?.toLowerCase();
    if (windowPractice === 'lakeshore' || windowPractice === 'unique') {
      return windowPractice as PracticeName;
    }
  }
  
  // 4. Default to 'unique' for backwards compatibility
  return 'unique';
}

// Get home URL for the practice
export function getPracticeHomeUrl(): string {
  const practice = getPracticeFromConfig();
  if (practice === 'lakeshore') {
    return 'https://www.lakeshoreshinandbody.com/'; // Update with actual URL
  }
  return 'https://www.myuniqueaesthetics.com/';
}

export default function Logo({ practice, className = '' }: LogoProps) {
  const practiceName = practice || getPracticeFromConfig();
  
  if (practiceName === 'lakeshore') {
    return (
      <img 
        src="/lakeshore-logo.png" 
        alt="Lakeshore Skin + Body" 
        className={`practice-logo lakeshore-logo ${className}`}
      />
    );
  }
  
  // Default to Unique Aesthetics
  return (
    <img 
      src="https://www.datocms-assets.com/163832/1753199215-unique_physique.svg" 
      alt="Unique Aesthetics & Wellness" 
      className={`practice-logo unique-logo ${className}`}
    />
  );
}

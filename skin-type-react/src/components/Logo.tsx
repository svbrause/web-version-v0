import "../App.css";

export type PracticeName = "lakeshore" | "unique" | "admin";

interface LogoProps {
  practice?: PracticeName;
  className?: string;
}

// Get practice from pathname first, then query, then env. Returns null for "/" with no ?practice= (show 404).
// Path: /demo → admin, /lakeshore → lakeshore, /unique → unique. "/" + ?practice=unique|lakeshore → that practice.
export function getPracticeFromConfig(): PracticeName | null {
  if (typeof window === "undefined") return "unique";

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const urlParams = new URLSearchParams(window.location.search);
  const practiceParam = urlParams.get("practice")?.toLowerCase();

  // 1. Path-based: /demo, /lakeshore, /unique
  if (pathname === "/demo") return "admin";
  if (pathname === "/lakeshore") return "lakeshore";
  if (pathname === "/unique") return "unique";

  // 2. "/" with query: ?practice=unique or ?practice=lakeshore (same result as /unique or /lakeshore)
  if (pathname === "/") {
    if (practiceParam === "lakeshore" || practiceParam === "unique")
      return practiceParam as PracticeName;
    return null; // bare "/" → 404
  }

  // 3. Other paths: fall back to env/window for backwards compatibility
  const vitePractice = import.meta.env.VITE_PRACTICE_NAME?.toLowerCase();
  if (
    vitePractice === "lakeshore" ||
    vitePractice === "unique" ||
    vitePractice === "admin"
  ) {
    return vitePractice as PracticeName;
  }
  const windowPractice = (window as any).PRACTICE_NAME?.toLowerCase();
  if (
    windowPractice === "lakeshore" ||
    windowPractice === "unique" ||
    windowPractice === "admin"
  ) {
    return windowPractice as PracticeName;
  }

  return null;
}

/** Display name for titles and UI. Use when practice is non-null. */
export function getPracticeDisplayName(practice: PracticeName): string {
  if (practice === "lakeshore") return "Lakeshore Skin + Body";
  if (practice === "admin") return "Ponce";
  return "Unique Aesthetics & Wellness";
}

// Get home URL for the practice
export function getPracticeHomeUrl(): string {
  const practice = getPracticeFromConfig();
  if (practice === null) return "/";
  if (practice === "lakeshore") return "https://www.lakeshoreshinandbody.com/";
  if (practice === "admin") return "https://www.ponce.ai/";
  return "https://www.myuniqueaesthetics.com/";
}

export default function Logo({ practice, className = "" }: LogoProps) {
  const practiceName = practice || getPracticeFromConfig();
  if (practiceName === null) return null;

  if (practiceName === "lakeshore") {
    return (
      <img
        src="/lakeshore-logo.png"
        alt="Lakeshore Skin + Body"
        className={`practice-logo lakeshore-logo ${className}`}
      />
    );
  }
  if (practiceName === "admin") {
    return (
      <img
        src="/ponce-logo.png"
        alt="Ponce"
        className={`practice-logo admin-logo ${className}`}
      />
    );
  }
  return (
    <img
      src="https://www.datocms-assets.com/163832/1753199215-unique_physique.svg"
      alt="Unique Aesthetics & Wellness"
      className={`practice-logo unique-logo ${className}`}
    />
  );
}

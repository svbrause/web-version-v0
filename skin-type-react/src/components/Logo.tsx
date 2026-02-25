import "../App.css";

export type PracticeName = "lakeshore" | "unique" | "admin" | "the-treatment" | "buford";

interface LogoProps {
  practice?: PracticeName;
  className?: string;
}

// Get practice from pathname first, then query, then env. Returns null for "/" with no ?practice= (show 404).
// Path: /demo → admin, /lakeshore → lakeshore, /the-treatment → the-treatment, /unique → unique. "/" + ?practice=... → that practice.
export function getPracticeFromConfig(): PracticeName | null {
  if (typeof window === "undefined") return "unique";

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const segments = pathname.split("/").filter(Boolean);
  const basePath = segments[0] ?? "";
  const urlParams = new URLSearchParams(window.location.search);
  const practiceParam = urlParams.get("practice")?.toLowerCase();

  // 1. Path-based: /demo, /lakeshore, /the-treatment, /unique (and /lakeshore/web, /unique/linktree, etc.)
  if (basePath === "demo") return "admin";
  if (basePath === "lakeshore") return "lakeshore";
  if (basePath === "the-treatment") return "the-treatment";
  if (basePath === "unique") return "unique";
  if (basePath === "buford") return "buford";

  // 2. "/" with query: ?practice=unique|lakeshore|the-treatment|buford (same result as path)
  if (pathname === "/") {
    if (
      practiceParam === "lakeshore" ||
      practiceParam === "unique" ||
      practiceParam === "the-treatment" ||
      practiceParam === "buford"
    )
      return practiceParam as PracticeName;
    return null; // bare "/" → 404
  }

  // 3. Other paths: fall back to env/window for backwards compatibility
  const vitePractice = import.meta.env.VITE_PRACTICE_NAME?.toLowerCase();
  if (
    vitePractice === "lakeshore" ||
    vitePractice === "unique" ||
    vitePractice === "admin" ||
    vitePractice === "the-treatment" ||
    vitePractice === "buford"
  ) {
    return vitePractice as PracticeName;
  }
  const windowPractice = (window as any).PRACTICE_NAME?.toLowerCase();
  if (
    windowPractice === "lakeshore" ||
    windowPractice === "unique" ||
    windowPractice === "admin" ||
    windowPractice === "the-treatment" ||
    windowPractice === "buford"
  ) {
    return windowPractice as PracticeName;
  }

  return null;
}

/** Display name for titles and UI. Use when practice is non-null. */
export function getPracticeDisplayName(practice: PracticeName): string {
  if (practice === "lakeshore") return "Lakeshore Skin + Body";
  if (practice === "admin") return "Ponce";
  if (practice === "the-treatment") return "The Treatment Skin Boutique";
  if (practice === "buford") return "Beauty by Buford";
  return "Unique Aesthetics & Wellness";
}

// Get home URL for the practice
export function getPracticeHomeUrl(): string {
  const practice = getPracticeFromConfig();
  if (practice === null) return "/";
  if (practice === "lakeshore") return "https://www.lakeshoreskinandbody.com/";
  if (practice === "admin") return "https://www.ponce.ai/";
  if (practice === "the-treatment") return "https://www.getthetreatment.com/";
  if (practice === "buford") return "https://www.beautybybuford.com/";
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
  if (practiceName === "the-treatment") {
    return (
      <img
        src="/the_treatment/treatment-skin-boutique_logo_4x.png"
        alt="The Treatment Skin Boutique"
        className={`practice-logo the-treatment-logo ${className}`}
      />
    );
  }
  if (practiceName === "buford") {
    return (
      <img
        src="/Beauty-by-Buford_Logo_Header.png"
        alt="Beauty by Buford"
        className={`practice-logo buford-logo ${className}`}
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

import { LogOut } from "lucide-react";
import { getPracticeFromConfig, getPracticeHomeUrl } from "./Logo";
import Logo from "./Logo";
import "../App.css";

/**
 * Persistent header: clinic logo + icon link to practice homepage.
 */
export default function ClinicHeader() {
  const practice = getPracticeFromConfig();
  if (practice === null) return null;

  const homeUrl = getPracticeHomeUrl();

  return (
    <header className="clinic-header" role="banner">
      <div className="clinic-header-inner">
        <Logo className="clinic-header-logo" />
        <a
          href={homeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="clinic-header-home-link"
          aria-label="Back to homepage"
        >
          <LogOut size={22} strokeWidth={2} aria-hidden />
        </a>
      </div>
    </header>
  );
}

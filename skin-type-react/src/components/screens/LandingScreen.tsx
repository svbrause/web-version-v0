import { useApp } from "../../context/AppContext";
import { getPracticeFromConfig } from "../Logo";
import Logo from "../Logo";
import { trackEvent } from "../../utils/analytics";
import "../../App.css";

export default function LandingScreen() {
  const { updateState } = useApp();
  const practice = getPracticeFromConfig();

  if (practice === null) return null;

  const handleGetStarted = () => {
    trackEvent("landing_get_started", {
      practice: practice,
    });
    updateState({ currentStep: -0.7 });
  };

  const heroImageSrc = "/1752520815-uneven-skin-tone-banner 1 (1).png";

  return (
    <div className="landing-screen">
      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-centered">
            <Logo className="landing-logo-centered" />
            <h1 className="landing-title-serif">
              Discover Your Perfect Treatment
            </h1>
            <div className="landing-features-row">
              <div className="landing-feature-card">
                <div className="landing-feature-icon-black">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span>Share Your Aesthetic Goals</span>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-icon-black">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <span>See Real Patient Results</span>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-icon-black">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <span>Unlock Exclusive Offers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-hero">
          <img
            src={encodeURI(heroImageSrc)}
            alt=""
            className="landing-hero-image"
          />
          <div className="landing-cta">
            <button
              type="button"
              className="landing-cta-button"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { trackEvent } from "../../utils/analytics";
import { getPracticeFromConfig } from "../Logo";
import OfferCard from "../OfferCard";
import "../../App.css";

// Onboarding step constants
const ONBOARDING_STEPS = {
  SCREEN_1: -0.7,
  SCREEN_2: -0.5,
  SCREEN_3: -0.3,
};

export default function OnboardingScreen() {
  const { state, updateState } = useApp();
  const practice = getPracticeFromConfig();

  // Determine current slide based on step value
  const getCurrentSlide = (step: number) => {
    if (step === ONBOARDING_STEPS.SCREEN_1) return 0;
    if (step === ONBOARDING_STEPS.SCREEN_2) return 1;
    if (step === ONBOARDING_STEPS.SCREEN_3) return 2;
    return 0; // Default to first slide
  };

  const [currentSlide, setCurrentSlide] = useState(() =>
    getCurrentSlide(state.currentStep),
  );

  // Update slide when step changes (e.g., from back button)
  useEffect(() => {
    setCurrentSlide(getCurrentSlide(state.currentStep));
  }, [state.currentStep]);

  const handleNext = () => {
    trackEvent("onboarding_next", {
      practice: practice,
      slide: currentSlide + 1,
    });

    if (currentSlide === 0) {
      // Move to screen 2
      updateState({ currentStep: ONBOARDING_STEPS.SCREEN_2 });
      setCurrentSlide(1);
    } else if (currentSlide === 1) {
      // Move to screen 3
      updateState({ currentStep: ONBOARDING_STEPS.SCREEN_3 });
      setCurrentSlide(2);
    } else if (currentSlide === 2) {
      // Move to first form step
      trackEvent("onboarding_completed", {
        practice: practice,
      });
      updateState({ currentStep: 0 });
    }
  };

  const slides = [
    {
      title: "Share Your Aesthetic Goals",
      description: "Quick questions to understand what matters most to you",
      icon: (
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      buttonText: "Next",
    },
    {
      title: "See Real Patient Results",
      description: "Review real medical aesthetic cases tailored to your needs",
      icon: (
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
          <circle cx="17" cy="7" r="1" />
        </svg>
      ),
      buttonText: "Next",
    },
    {
      title: "Unlock Exclusive Offers",
      description:
        "Discover special discounts and offers tailored to your needs",
      showOfferCard: true,
      icon: (
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 7h-4M4 7h4m0 0a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2m-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M12 12v.01" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      ),
      buttonText: "Get Started",
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-container">
        {/* Dot indicators */}
        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`onboarding-dot ${index === currentSlide ? "active" : ""}`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="onboarding-slide">
          <div className="onboarding-slide-content">
            <div className="onboarding-icon-wrapper">{slide.icon}</div>
            <h1 className="onboarding-slide-title">{slide.title}</h1>
            <p className="onboarding-slide-description">{slide.description}</p>

            {/* Offer card for slide 3 */}
            {slide.showOfferCard && (
              <div style={{ marginTop: "24px", width: "100%", maxWidth: "400px" }}>
                <OfferCard />
              </div>
            )}
          </div>

          {/* Navigation button */}
          <div className="onboarding-navigation">
            <button
              type="button"
              className="onboarding-button"
              onClick={handleNext}
            >
              {slide.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

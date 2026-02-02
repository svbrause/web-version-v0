import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { trackEvent } from "../../utils/analytics";
import { getPracticeFromConfig } from "../Logo";
import OfferCard from "../OfferCard";
import "../../App.css";

const ONBOARDING_CASE_IMAGES = [
  "/onboarding case 1.webp",
  "/onboarding case 2.jpg",
  "/onboarding case 3.jpg",
] as const;

// Onboarding step constants
const ONBOARDING_STEPS = {
  SCREEN_1: -0.7,
  SCREEN_2: -0.5,
  SCREEN_3: -0.3,
};

export default function OnboardingScreen() {
  const { state, updateState, goToPreviousStep, caseData } = useApp();
  const practice = getPracticeFromConfig();
  const otherCasesCount = Math.max(0, caseData.length - 3);

  // Determine current slide based on step value
  const getCurrentSlide = (step: number) => {
    if (step === ONBOARDING_STEPS.SCREEN_1) return 0;
    if (step === ONBOARDING_STEPS.SCREEN_2) return 1;
    if (step === ONBOARDING_STEPS.SCREEN_3) return 2;
    return 0; // Default to first slide
  };

  const [currentSlide, setCurrentSlide] = useState(() =>
    getCurrentSlide(state.currentStep)
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
      imageSrc: "/onboarding 1 image.png",
      buttonText: "Next",
    },
    {
      title: "See Real Patient Results",
      description: "Review real medical aesthetic cases tailored to your needs",
      showCasePreviews: true,
      buttonText: "Next",
    },
    {
      title: "Unlock Exclusive Offers",
      description:
        "Discover special discounts and offers tailored to your needs",
      showOfferAtTop: true,
      buttonText: "Get Started",
    },
  ];

  const slide = slides[currentSlide];

  const handleBack = () => {
    trackEvent("onboarding_back", { practice, fromSlide: currentSlide + 1 });
    goToPreviousStep();
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-container">
        {/* Top bar: back button + dot indicators */}
        <div className="onboarding-top-bar">
          <button
            type="button"
            className="back-button onboarding-back-button"
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="onboarding-dots">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`onboarding-dot ${
                  index === currentSlide ? "active" : ""
                }`}
              />
            ))}
          </div>
          <div className="onboarding-back-spacer" aria-hidden />
        </div>

        {/* Slide content */}
        <div className="onboarding-slide">
          <div className="onboarding-slide-content">
            {/* Top area: image (slide 1), case previews (slide 2), or offer card (slide 3) */}
            {"imageSrc" in slide && slide.imageSrc ? (
              <div
                className={`onboarding-icon-wrapper onboarding-image-wrapper${
                  currentSlide === 0
                    ? " onboarding-image-wrapper--screen-1"
                    : ""
                }`}
              >
                <img
                  src={slide.imageSrc}
                  alt=""
                  className="onboarding-top-image"
                />
              </div>
            ) : "showCasePreviews" in slide && slide.showCasePreviews ? (
              <div className="onboarding-cases-preview">
                <div className="onboarding-cases-preview-layout">
                  {ONBOARDING_CASE_IMAGES.map((src, i) => (
                    <div key={i} className="onboarding-case-preview-card">
                      <img
                        src={src}
                        alt="Real patient result"
                        className="onboarding-case-preview-image"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <div className="onboarding-cases-more">
                  +{otherCasesCount} other cases
                </div>
              </div>
            ) : "showOfferAtTop" in slide && slide.showOfferAtTop ? (
              <div className="onboarding-offer-hero">
                <OfferCard
                  showPresentIcon={true}
                  variant="expanded"
                  giftImageSrc="/gift-offer.png"
                />
              </div>
            ) : null}
            <h1 className="onboarding-slide-title">{slide.title}</h1>
            <p className="onboarding-slide-description">{slide.description}</p>
          </div>

          {/* Navigation button — matches Next style on all slides (dark accent) */}
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

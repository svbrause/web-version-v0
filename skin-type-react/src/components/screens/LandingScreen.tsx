import { useApp } from '../../context/AppContext';
import { getPracticeFromConfig } from '../Logo';
import Logo from '../Logo';
import { trackEvent } from '../../utils/analytics';
import "../../App.css";

export default function LandingScreen() {
  const { updateState } = useApp();
  const practice = getPracticeFromConfig();

  const handleGetStarted = () => {
    trackEvent('landing_get_started', {
      practice: practice,
    });
    // Navigate to first form step (concerns)
    updateState({ currentStep: 0 });
  };

  // Provider information based on practice
  const providerInfo = practice === 'lakeshore' 
    ? {
        name: 'Lakeshore Skin + Body',
        description: 'Expert aesthetic providers dedicated to helping you achieve your skincare goals with personalized treatment recommendations.',
        highlight: 'Professional care tailored to your unique needs',
        showProviderPhoto: true,
        providerName: 'Jess',
        providerTitle: 'Lead Aesthetic Specialist',
        providerImage: '/jess-lakeshore.jpg',
        providerBio: 'Expert in injectables and facial aesthetics with a passion for natural-looking results.',
        tagline: 'Professional aesthetic care'
      }
    : {
        name: 'Unique Aesthetics & Wellness',
        description: 'Expert providers specializing in personalized aesthetic treatments to help you look and feel your best.',
        highlight: 'Personalized aesthetic solutions for your unique goals',
        showProviderPhoto: true,
        providerName: 'Amber',
        providerTitle: 'Lead Aesthetic Specialist',
        providerImage: '/amber-provider.jpg',
        providerBio: 'Expert in injectables and facial aesthetics with a passion for natural-looking results.',
        tagline: 'Where Luxury Aesthetic Treatment Feels Like Home'
      };

  return (
    <div className="landing-screen">
      <div className="landing-container">
        <div className="landing-header-top">
          <Logo className="landing-logo-header" />
          <button 
            className="landing-close-button"
            onClick={() => window.location.href = practice === 'lakeshore' ? 'https://www.lakeshoreshinandbody.com/' : 'https://www.myuniqueaesthetics.com/'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="landing-content">
          <div className="landing-section" style={{ padding: '32px 20px 12px' }}>
            <h1 className="landing-title-serif">Discover Your Perfect Treatment</h1>
            <p className="landing-tagline">{providerInfo.tagline}</p>
          </div>

          <div className="landing-section" style={{ padding: '0 20px 0' }}>
            {providerInfo.showProviderPhoto && providerInfo.providerImage ? (
              <div className="landing-provider-featured">
                <div className="landing-provider-photo-wrapper">
                  <img 
                    src={providerInfo.providerImage} 
                    alt={providerInfo.providerName}
                    className="landing-provider-featured-photo"
                    onError={(e) => {
                      console.error('Failed to load image:', providerInfo.providerImage, 'for practice:', practice);
                      // Don't hide the image, show a placeholder instead
                      (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                    }}
                  />
                </div>
                <div className="landing-provider-details">
                  <h2 className="landing-provider-name-large">{providerInfo.providerName}</h2>
                  <p className="landing-provider-title-pink">{providerInfo.providerTitle}</p>
                  <p className="landing-provider-bio">{providerInfo.providerBio}</p>
                </div>
              </div>
            ) : (
              <div className="landing-provider-text">
                <h3 className="landing-provider-title">with {providerInfo.name}</h3>
                <p className="landing-provider-highlight">{providerInfo.highlight}</p>
              </div>
            )}

            <div className="landing-features-list">
              <div className="landing-feature-item">
                <div className="landing-feature-icon-pink">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span>Personalized Recommendations</span>
              </div>
              <div className="landing-feature-item">
                <div className="landing-feature-icon-pink">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <span>Real Patient Results</span>
              </div>
              <div className="landing-feature-item">
                <div className="landing-feature-icon-pink">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <span>Exclusive Offers</span>
              </div>
            </div>
          </div>

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

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { trackEvent } from "../../utils/analytics";
import { saveUserData } from "../../utils/userDataCollection";
import { submitLeadToAirtable } from "../../utils/airtableLeads";
import { storeLeadRecordId } from "../../utils/airtableSync";
import "../../App.css";

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number formatting (US format: (XXX) XXX-XXXX)
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Limit to 10 digits
  const phoneNumberDigits = phoneNumber.slice(0, 10);

  // Format based on length
  if (phoneNumberDigits.length === 0) {
    return "";
  } else if (phoneNumberDigits.length <= 3) {
    return `(${phoneNumberDigits}`;
  } else if (phoneNumberDigits.length <= 6) {
    return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
  } else {
    return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(
      3,
      6
    )}-${phoneNumberDigits.slice(6)}`;
  }
}

// Phone validation (US format)
function isValidPhone(phone: string): boolean {
  // Remove formatting characters
  const digits = phone.replace(/\D/g, "");
  // Must be exactly 10 digits
  return digits.length === 10;
}

// Helper to get read cases from localStorage
function getReadCases(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const stored = localStorage.getItem("readCases");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Helper to get concerns explored from localStorage
function getConcernsExplored(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const stored = localStorage.getItem("concernsExplored");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export default function LeadCaptureScreen() {
  const { state, caseData, goToNextStep } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Only clear error if they fix it while typing, don't show new errors
    if (emailError && isValidEmail(value)) {
      setEmailError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    // Only clear error if they fix it while typing, don't show new errors
    if (phoneError && formatted && isValidPhone(formatted)) {
      setPhoneError("");
    }
  };

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePhoneBlur = () => {
    if (!phone) {
      setPhoneError("Phone number is required");
    } else if (!isValidPhone(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate phone (now required)
    if (!phone || !isValidPhone(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }

    trackEvent("lead_capture_submitted", {
      has_name: !!name,
      has_email: !!email,
      has_phone: !!phone,
    });

    // Save user data
    saveUserData({
      stage: "leadCapture",
      name,
      email,
      phone,
      selectedConcerns: state.selectedConcerns,
      selectedAreas: state.selectedAreas,
      ageRange: state.ageRange,
      skinType: state.skinType,
      skinTone: state.skinTone,
      ethnicBackground: state.ethnicBackground,
    });

    // Capture a snapshot of the current state before navigation
    // This ensures we have all the data even if state changes during navigation
    const stateSnapshot = {
      selectedConcerns: [...state.selectedConcerns],
      selectedAreas: [...state.selectedAreas],
      ageRange: state.ageRange,
      skinType: state.skinType,
      skinTone: state.skinTone,
      ethnicBackground: state.ethnicBackground,
    };

    const behavioralDataSnapshot = {
      readCases: getReadCases(),
      concernsExplored: getConcernsExplored(),
      caseData: caseData,
    };

    console.log("📋 Submitting lead with data:", {
      name,
      email,
      phone,
      stateSnapshot,
      behavioralDataSnapshot,
    });

    // Navigate immediately for responsive UI
    goToNextStep();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Submit to Airtable in the background (don't block navigation)
    submitLeadToAirtable(
      {
        name,
        email,
        phone,
        source: "Lead Capture Form",
      },
      stateSnapshot,
      behavioralDataSnapshot
    )
      .then((result) => {
        if (result.success && result.record?.id) {
          console.log(
            "✅ Lead submitted to Airtable successfully:",
            result.record
          );
          console.log(
            "📊 Submitted fields:",
            result.record?.fields || "No fields in response"
          );
          // Store the record ID for future behavioral data syncs
          storeLeadRecordId(result.record.id);
        } else {
          console.error("❌ Lead submission to Airtable failed:", result.error);
          // Don't show alert to user since they've already moved on
        }
      })
      .catch((error) => {
        console.error("❌ Error submitting lead to Airtable:", error);
        // Continue silently - user has already moved on
      });
  };

  return (
    <div className="lead-capture-screen">
      <div className="lead-capture-container">
        <div className="lead-capture-header">
          <h2 className="lead-form-title">View your personalized cases</h2>
          <p className="lead-form-subtitle">
            Enter your details to unlock matching case studies
          </p>
        </div>

        <form
          id="earlyLeadCaptureForm"
          className="early-lead-form"
          onSubmit={handleSubmit}
        >
          <div className="lead-form-field">
            <input
              type="text"
              id="earlyCaptureName"
              name="name"
              placeholder="Full Name"
              required
              className="lead-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="lead-form-field">
            <input
              type="email"
              id="earlyCaptureEmail"
              name="email"
              placeholder="Email Address"
              required
              className={`lead-input ${emailError ? "lead-input-error" : ""}`}
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
            />
            {emailError && (
              <span className="lead-input-error-message">{emailError}</span>
            )}
          </div>
          <div className="lead-form-field">
            <input
              type="tel"
              id="earlyCapturePhone"
              name="phone"
              placeholder="Phone Number"
              className={`lead-input ${phoneError ? "lead-input-error" : ""}`}
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
            />
            {phoneError && (
              <span className="lead-input-error-message">{phoneError}</span>
            )}
          </div>
          <button type="submit" className="lead-submit-button">
            View Cases
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </form>

        <p className="lead-privacy-note">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Your information is private and secure
        </p>
      </div>
    </div>
  );
}

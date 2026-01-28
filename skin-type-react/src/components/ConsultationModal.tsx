import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { trackEvent } from "../utils/analytics";
import {
  saveUserData,
  getUserData,
  getSessionId,
} from "../utils/userDataCollection";
import {
  submitLeadToAirtable,
  updateLeadInAirtable,
} from "../utils/airtableLeads";
import { storeLeadRecordId, getLeadRecordId } from "../utils/airtableSync";
import { getPracticeFromConfig } from "./Logo";
import OfferCard from "./OfferCard";
import "../App.css";

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number formatting (US format: (XXX) XXX-XXXX)
function formatPhoneNumber(value: string): string {
  const phoneNumber = value.replace(/\D/g, "");
  const phoneNumberDigits = phoneNumber.slice(0, 10);
  if (phoneNumberDigits.length === 0) {
    return "";
  } else if (phoneNumberDigits.length <= 3) {
    return `(${phoneNumberDigits}`;
  } else if (phoneNumberDigits.length <= 6) {
    return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
  } else {
    return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6)}`;
  }
}

// Phone validation (US format)
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
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

interface ConsultationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ConsultationModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
}: ConsultationModalProps = {}) {
  const { state, caseData } = useApp();
  const practice = getPracticeFromConfig();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasExistingLead, setHasExistingLead] = useState(false);

  // Use prop if provided, otherwise use internal state
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propOnClose
    ? (val: boolean) => {
        if (!val) propOnClose();
      }
    : setInternalIsOpen;

  // Check if lead data exists and pre-fill form
  useEffect(() => {
    if (isOpen) {
      // Reset confirmation screen when modal opens
      setShowConfirmation(false);
      setIsSubmitting(false);

      // Try to get user data from localStorage
      const userData = getUserData();
      const sessionId = getSessionId();
      const currentUserData = userData.find((u) => u.sessionId === sessionId);

      // Check if lead record ID exists (means lead was already submitted)
      const existingRecordId = getLeadRecordId();
      const hasLeadData =
        currentUserData &&
        (currentUserData.name ||
          currentUserData.email ||
          currentUserData.phone);

      setHasExistingLead(!!(existingRecordId && hasLeadData));

      // Pre-fill form fields if lead data exists
      if (currentUserData) {
        if (currentUserData.name) setName(currentUserData.name);
        if (currentUserData.email) setEmail(currentUserData.email);
        if (currentUserData.phone) setPhone(currentUserData.phone);
      }

      trackEvent("offer_modal_opened", {
        selected_concerns: state.selectedConcerns.length,
        selected_areas: state.selectedAreas.length,
        age_range: state.ageRange,
        skin_type: state.skinType,
        has_existing_lead: hasExistingLead,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only run when modal opens, not on every state change

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && isValidEmail(value)) {
      setEmailError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
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
    if (!hasExistingLead && phone && !isValidPhone(phone)) {
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

    // Validate phone if no existing lead (required for new leads)
    if (!hasExistingLead && (!phone || !isValidPhone(phone))) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);

    trackEvent("offer_claimed", {
      has_email: !!email,
      has_name: !!name,
      has_phone: !!phone,
      has_existing_lead: hasExistingLead,
      selected_concerns: state.selectedConcerns.length,
      selected_areas: state.selectedAreas.length,
    });

    // Save user data
    saveUserData({
      stage: "offerClaimed",
      name: name || undefined,
      email,
      phone: phone || undefined,
      selectedConcerns: state.selectedConcerns,
      selectedAreas: state.selectedAreas,
      ageRange: state.ageRange,
      skinType: state.skinType,
      skinTone: state.skinTone,
      ethnicBackground: state.ethnicBackground,
    });

    const existingRecordId = getLeadRecordId();
    const behavioralData = {
      readCases: getReadCases(),
      concernsExplored: getConcernsExplored(),
      caseData: caseData,
    };

    try {
      if (hasExistingLead && existingRecordId) {
        // Update existing record
        console.log("🔄 Updating existing lead record:", existingRecordId);
        const result = await updateLeadInAirtable(
          existingRecordId,
          {
            name: name || undefined,
            email,
            phone: phone || undefined,
            source: "Consultation Request",
            offerClaimed: true,
          },
          state,
          behavioralData,
        );

        if (result.success) {
          console.log(
            "✅ Consultation request updated in Airtable successfully",
          );
          await sendOfferEmail(email);
        } else {
          console.warn(
            "⚠️ Consultation request update to Airtable failed, but continuing:",
            result.error,
          );
        }
      } else {
        // Create new record
        console.log("📝 Creating new lead record");
        const result = await submitLeadToAirtable(
          {
            name: name || undefined,
            email,
            phone: phone || undefined,
            source: "Consultation Request",
            offerClaimed: true,
          },
          state,
          behavioralData,
        );

        if (result.success && result.record?.id) {
          console.log(
            "✅ Consultation request submitted to Airtable successfully",
          );
          storeLeadRecordId(result.record.id);
          await sendOfferEmail(email);
        } else {
          console.warn(
            "⚠️ Consultation request submission to Airtable failed, but continuing:",
            result.error,
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error submitting consultation request to Airtable:",
        error,
      );
      // Continue even if Airtable submission fails
    }

    // Show confirmation screen
    setIsSubmitting(false);
    setShowConfirmation(true);
  };

  // Send email with offer details
  const sendOfferEmail = async (emailAddress: string) => {
    try {
      // TODO: Integrate with your email service (SendGrid, Mailgun, Airtable automation, etc.)
      // For now, we'll log the action - you can set up Airtable automation to send emails
      // when "Offer Claimed" field is set to true

      const practiceName =
        practice === "lakeshore"
          ? "Lakeshore Skin + Body"
          : "Unique Aesthetics & Wellness";

      console.log("📧 Would send offer email to:", emailAddress);
      console.log("Offer: $50 off any new treatments");
      console.log("Practice:", practiceName);

      // If you have an email API endpoint, call it here:
      // await fetch('YOUR_EMAIL_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: emailAddress,
      //     subject: `Your $50 Off Offer from ${practiceName}`,
      //     template: 'offer-claimed',
      //     data: { practiceName, offerAmount: 50 }
      //   })
      // });
    } catch (error) {
      console.error("Error sending offer email:", error);
      // Don't block the flow if email fails
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowConfirmation(false);
    // Reset form (but keep pre-filled data if it exists)
    if (!hasExistingLead) {
      setName("");
      setEmail("");
      setPhone("");
    }
    setEmailError("");
    setPhoneError("");
    trackEvent("offer_modal_closed");
  };

  const handleConfirmationClose = () => {
    handleClose();
    if (propOnClose) {
      propOnClose();
    }
  };

  if (!isOpen) return null;

  const practiceName =
    practice === "lakeshore"
      ? "Lakeshore Skin + Body"
      : "Unique Aesthetics & Wellness";

  return (
    <div className="consultation-modal-overlay" onClick={handleClose}>
      <div className="consultation-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="consultation-modal-close"
          onClick={showConfirmation ? handleConfirmationClose : handleClose}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="consultation-modal-content">
          {showConfirmation ? (
            <div className="consultation-confirmation">
              <div
                className="consultation-confirmation-icon"
                style={{
                  background:
                    practice === "lakeshore"
                      ? "rgba(107, 138, 154, 0.1)"
                      : "rgba(255, 162, 199, 0.15)",
                  color: practice === "lakeshore" ? "#6b8a9a" : "#ffa2c7",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className="consultation-confirmation-title">
                Request Submitted!
              </h2>
              <p className="consultation-confirmation-message">
                Your request has been sent to {practiceName}. We'll be in touch
                soon to schedule your consultation.
              </p>
              <button
                type="button"
                className="consultation-confirmation-button"
                onClick={handleConfirmationClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="consultation-modal-header">
                <h2 className="consultation-modal-title">Request Consult</h2>
                <p className="consultation-modal-subtitle">
                  In-clinic consultations provide tailored treatment
                  recommendations for your specific needs
                </p>
              </div>
              {practice === "lakeshore" && (
                <div style={{ marginBottom: "20px" }}>
                  <OfferCard />
                </div>
              )}
              <div
                className="consultation-modal-benefits"
                style={{
                  backgroundColor: "#f9f9f9",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <ul
                  className="consultation-modal-benefits-list"
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: practice === "lakeshore" ? "#D4A574" : "#ffa2c7",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      Professional facial analysis to identify your specific
                      concerns
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: practice === "lakeshore" ? "#D4A574" : "#ffa2c7",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>One-on-one conversation with an expert provider</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: practice === "lakeshore" ? "#D4A574" : "#ffa2c7",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      Personalized treatment plan based on your unique goals
                    </span>
                  </li>
                </ul>
              </div>

              <form
                id="consultationForm"
                className="consultation-form"
                onSubmit={handleSubmit}
              >
                {!hasExistingLead && (
                  <div className="consultation-form-field">
                    <input
                      type="text"
                      id="consultationName"
                      name="name"
                      placeholder="Full Name"
                      className="consultation-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="consultation-form-field">
                  <input
                    type="email"
                    id="consultationEmail"
                    name="email"
                    placeholder="Email Address"
                    required
                    className={`consultation-input ${emailError ? "consultation-input-error" : ""}`}
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                  />
                  {emailError && (
                    <span className="consultation-input-error-message">
                      {emailError}
                    </span>
                  )}
                </div>
                {!hasExistingLead && (
                  <div className="consultation-form-field">
                    <input
                      type="tel"
                      id="consultationPhone"
                      name="phone"
                      placeholder="Phone Number"
                      required
                      className={`consultation-input ${phoneError ? "consultation-input-error" : ""}`}
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                    />
                    {phoneError && (
                      <span className="consultation-input-error-message">
                        {phoneError}
                      </span>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  className="consultation-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

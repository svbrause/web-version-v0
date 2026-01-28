import { getPracticeFromConfig } from "./Logo";

interface OfferCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function OfferCard({ className = "", style }: OfferCardProps) {
  const practice = getPracticeFromConfig();

  return (
    <div
      className={`offer-card ${className}`}
      style={{
        background:
          practice === "lakeshore"
            ? "linear-gradient(135deg, rgba(107, 138, 154, 0.1) 0%, rgba(168, 196, 204, 0.15) 100%)"
            : "linear-gradient(135deg, rgba(255, 162, 199, 0.15) 0%, rgba(255, 200, 220, 0.2) 100%)",
        border: `2px solid ${practice === "lakeshore" ? "#6b8a9a" : "#ffa2c7"}`,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        ...style,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          color: practice === "lakeshore" ? "#6b8a9a" : "#ffa2c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "#222222",
            lineHeight: "1.2",
            marginBottom: "2px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          $50 OFF Any New Treatments
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "400",
            color: "#666666",
            lineHeight: "1.4",
          }}
        >
          Limited time offer
        </div>
      </div>
    </div>
  );
}

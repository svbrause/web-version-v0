interface OfferCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function OfferCard({ className = "", style }: OfferCardProps) {
  return (
    <div
      className={`offer-card ${className}`}
      style={{
        background: "#222222",
        borderRadius: "24px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        ...style,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "#ffffff",
            lineHeight: "1.3",
            marginBottom: "4px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          $50 OFF Any New Treatments
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: "1.4",
          }}
        >
          Limited time offer
        </div>
      </div>
      <button
        style={{
          width: "100%",
          padding: "14px 24px",
          background: "var(--bg-secondary)",
          color: "#222222",
          border: "none",
          borderRadius: "16px",
          fontSize: "16px",
          fontWeight: "600",
          fontFamily: "Montserrat, sans-serif",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        type="button"
      >
        Request Consult
      </button>
    </div>
  );
}

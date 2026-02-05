import { getPracticeFromConfig } from "./Logo";

interface OfferCardProps {
  className?: string;
  style?: React.CSSProperties;
  /** If true, show a small present/gift icon next to the offer text (for modal and onboarding) */
  showPresentIcon?: boolean;
  /** "compact" = bottom CTA bar; "expanded" = larger, detailed card for modal/onboarding (blueish accent, more bulk) */
  variant?: "compact" | "expanded";
  /** "icon" = flat SVG icon; "3d" = 3D animated gift (for onboarding slide 3) */
  giftVariant?: "icon" | "3d";
  /** When set, show this image as the gift (e.g. onboarding slide 3). Takes precedence over giftVariant. */
  giftImageSrc?: string;
}

// 3D animated gift box for onboarding "Unlock Exclusive Offers" — box + ribbon + bow, gentle float
function Gift3D({ size = 56 }: { size?: number }) {
  return (
    <div className="gift-3d" style={{ width: size, height: size }} aria-hidden>
      <div className="gift-3d-box">
        <div className="gift-3d-ribbon gift-3d-ribbon-h" />
        <div className="gift-3d-ribbon gift-3d-ribbon-v" />
        <div className="gift-3d-bow">
          <span className="gift-3d-bow-loop gift-3d-bow-loop-l" />
          <span className="gift-3d-bow-loop gift-3d-bow-loop-r" />
          <span className="gift-3d-bow-knot" />
        </div>
      </div>
    </div>
  );
}

// Small present/gift icon for $50 off sections
function PresentIcon({ size = 20, color }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        color: color ?? "rgba(255,255,255,0.95)",
      }}
      aria-hidden
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function OfferCard({
  className = "",
  style,
  showPresentIcon = true,
  variant = "compact",
  giftVariant = "icon",
  giftImageSrc,
}: OfferCardProps) {
  const practice = getPracticeFromConfig();
  const isUnique = practice === "unique";

  const isExpanded = variant === "expanded";
  const useGiftImage = isExpanded && showPresentIcon && giftImageSrc;
  const use3DGift =
    isExpanded && showPresentIcon && !giftImageSrc && giftVariant === "3d";

  const expandedSubtext = isUnique
    ? "Excludes tox & filler. Limited time — apply at your consultation."
    : "Limited time offer — apply at your consultation";

  if (isExpanded) {
    return (
      <div
        className={`offer-card offer-card-expanded ${className}`}
        style={{
          border: "2px solid var(--pink-baby)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          borderRadius: "16px",
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {showPresentIcon &&
            (useGiftImage ? (
              <img
                src={giftImageSrc}
                alt=""
                className="offer-card-gift-image"
                aria-hidden
              />
            ) : use3DGift ? (
              <Gift3D size={56} />
            ) : (
              <PresentIcon size={20} color="var(--pink-baby)" />
            ))}
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--text-primary)",
              lineHeight: "1.3",
              fontFamily: "Montserrat, sans-serif",
              textAlign: "center",
            }}
          >
            $50 off any new treatments
          </span>
        </div>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--text-muted)",
            lineHeight: "1.4",
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {expandedSubtext}
        </p>
      </div>
    );
  }

  const compactText = isUnique
    ? "$50 off new treatments"
    : "$50 off any new treatments";

  return (
    <div
      className={`offer-card ${className}`}
      style={{
        background: "#222222",
        borderRadius: "16px",
        padding: "6px 14px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        minWidth: 0,
        ...style,
      }}
    >
      {showPresentIcon && <PresentIcon />}
      <div
        style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#ffffff",
          lineHeight: "1.3",
          fontFamily: "Montserrat, sans-serif",
          textAlign: "center",
        }}
      >
        {compactText}
      </div>
      {/* No button inside — parent places "Request Consult" below */}
    </div>
  );
}

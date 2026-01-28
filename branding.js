// ============================================================================
// BRANDING CONFIGURATION SYSTEM
// Toggle between default branding and practice-specific branding
// ============================================================================

// Brand configurations
const BRANDS = {
  default: {
    id: "default",
    name: "AI Aesthetic Consult",
    logo: "image.png",
    logoAlt: "AI Aesthetic Consult Logo",
    colors: {
      primary: "#212121",
      primaryHover: "#000000",
      accent: "#ffd291",
      accentLight: "#fff3e0",
      accentDark: "#c97c2b",
      background: "linear-gradient(180deg, #ffd291 0%, #e5f6fe 100%)",
      cardBackground: "#ffffff",
      textPrimary: "#212121",
      textSecondary: "#424242",
      textMuted: "#666666",
      border: "#e8e8e8",
      success: "#2e7d32",
      successLight: "#e8f5e9",
    },
    fonts: {
      heading: "'Montserrat', sans-serif",
      body: "'Montserrat', sans-serif",
    },
    providers: [],
    showProviders: false,
    tagline: "AI-powered aesthetic consultation tailored to your unique needs",
    ctaText: "Book Your Consult",
  },

  uniqueAestheticsPink: {
    id: "uniqueAestheticsPink",
    name: "Unique Aesthetics (Pink)",
    logo: "https://www.datocms-assets.com/163832/1753199215-unique_physique.svg",
    logoAlt: "Unique Aesthetics & Wellness Logo",
    colors: {
      primary: "#000000", // Black
      primaryHover: "#333333",
      accent: "#FFA2C7", // Baby Pink
      accentLight: "#FFD4E5", // Lighter pink
      accentDark: "#E8759E", // Darker pink
      background: "linear-gradient(180deg, #FAF6F0 0%, #F1ECE2 100%)", // Parchment to Soft Linen
      cardBackground: "#FFFFFF",
      textPrimary: "#000000", // Black
      textSecondary: "#333333",
      textMuted: "#666666",
      border: "#E8E4DC", // Soft border matching linen
      success: "#2e7d32",
      successLight: "#e8f5e9",
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Montserrat', sans-serif",
    },
    providers: [
      {
        name: "Amber",
        title: "Lead Aesthetic Specialist",
        image: "487973728_496812450036029_3275739576959902436_n.jpg",
        bio: "Expert in injectables and facial aesthetics with a passion for natural-looking results.",
        specialties: ["BOTOX", "Dermal Fillers", "Xeomin", "Lip Fillers"],
      },
    ],
    showProviders: true,
    tagline: "Where Luxury Aesthetic Treatment Feels Like Home",
    ctaText: "Book at Unique Aesthetics",
    location: "2321 Drusilla Lane, Suite D, Baton Rouge, LA 70809",
    phone: "(225) 465-0197",
    website: "https://www.myuniqueaesthetics.com/",
  },

  uniqueAestheticsTeal: {
    id: "uniqueAestheticsTeal",
    name: "Unique Aesthetics (Teal)",
    logo: "https://www.datocms-assets.com/163832/1753199215-unique_physique.svg",
    logoAlt: "Unique Aesthetics & Wellness Logo",
    colors: {
      primary: "#1a3a3a", // Deep teal
      primaryHover: "#0f2828",
      accent: "#c9a86c", // Champagne gold
      accentLight: "#f7f3eb",
      accentDark: "#9a7d4a",
      background: "linear-gradient(180deg, #f7f3eb 0%, #e8ebe8 100%)",
      cardBackground: "#ffffff",
      textPrimary: "#1a3a3a",
      textSecondary: "#3d5c5c",
      textMuted: "#6b8585",
      border: "#d4dcd4",
      success: "#2e7d32",
      successLight: "#e8f5e9",
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Montserrat', sans-serif",
    },
    providers: [
      {
        name: "Amber",
        title: "Lead Aesthetic Specialist",
        image: "487973728_496812450036029_3275739576959902436_n.jpg",
        bio: "Expert in injectables and facial aesthetics with a passion for natural-looking results.",
        specialties: ["BOTOX", "Dermal Fillers", "Xeomin", "Lip Fillers"],
      },
    ],
    showProviders: true,
    tagline: "Where Luxury Aesthetic Treatment Feels Like Home",
    ctaText: "Book at Unique Aesthetics",
    location: "2321 Drusilla Lane, Suite D, Baton Rouge, LA 70809",
    phone: "(225) 465-0197",
    website: "https://www.myuniqueaesthetics.com/",
  },
};

// Current active brand - Default to Unique Aesthetics Pink
let currentBrand = "uniqueAestheticsPink";

// ============================================================================
// BRANDING FUNCTIONS
// ============================================================================

/**
 * Initialize the branding system
 */
function initBranding() {
  // Check localStorage for saved brand preference
  // Default to Unique Aesthetics Pink unless another brand is specifically saved
  const savedBrand = localStorage.getItem("selectedBrand");

  // If saved brand is "default" or not set, use uniqueAestheticsPink as the default
  if (!savedBrand || savedBrand === "default" || !BRANDS[savedBrand]) {
    currentBrand = "uniqueAestheticsPink";
    localStorage.setItem("selectedBrand", "uniqueAestheticsPink");
  } else {
    currentBrand = savedBrand;
  }

  // Apply the current brand
  applyBrand(currentBrand);

  // Create the branding toggle UI
  createBrandingToggle();

  console.log(`🎨 Branding initialized: ${currentBrand}`);
}

/**
 * Apply a brand's styling to the page
 */
function applyBrand(brandId) {
  const brand = BRANDS[brandId];
  if (!brand) {
    console.error(`Brand "${brandId}" not found`);
    return;
  }

  // Prevent unnecessary brand changes
  if (currentBrand === brandId) {
    console.log(
      `Brand "${brandId}" is already active, skipping re-application`
    );
    return;
  }

  console.log(`Applying brand: ${brandId} (was: ${currentBrand})`);
  currentBrand = brandId;
  localStorage.setItem("selectedBrand", brandId);

  // Apply CSS variables
  const root = document.documentElement;

  // Colors
  root.style.setProperty("--color-primary", brand.colors.primary);
  root.style.setProperty("--color-primary-hover", brand.colors.primaryHover);
  root.style.setProperty("--color-accent", brand.colors.accent);
  root.style.setProperty("--color-accent-light", brand.colors.accentLight);
  root.style.setProperty("--color-accent-dark", brand.colors.accentDark);
  root.style.setProperty("--color-background", brand.colors.background);
  root.style.setProperty("--color-card-bg", brand.colors.cardBackground);
  root.style.setProperty("--color-text-primary", brand.colors.textPrimary);
  root.style.setProperty("--color-text-secondary", brand.colors.textSecondary);
  root.style.setProperty("--color-text-muted", brand.colors.textMuted);
  root.style.setProperty("--color-border", brand.colors.border);
  root.style.setProperty("--color-success", brand.colors.success);
  root.style.setProperty("--color-success-light", brand.colors.successLight);

  // Fonts
  root.style.setProperty("--font-heading", brand.fonts.heading);
  root.style.setProperty("--font-body", brand.fonts.body);

  // Update logo
  const logoElements = document.querySelectorAll(".logo-image");
  logoElements.forEach((logo) => {
    logo.src = brand.logo;
    logo.alt = brand.logoAlt;
  });

  // Update page title
  document.title = `${brand.name} - AI Aesthetic Consult`;

  // Update tagline
  const taglineElements = document.querySelectorAll(
    ".teaser-subtitle, .onboarding-subheading"
  );
  if (taglineElements.length > 0) {
    taglineElements[0].textContent = brand.tagline;
  }

  // Update CTA buttons
  const ctaButtons = document.querySelectorAll(".cta-button.secondary");
  ctaButtons.forEach((btn) => {
    if (btn.textContent.includes("Book")) {
      btn.textContent = brand.ctaText;
    }
  });

  // Handle provider section
  updateProviderSection(brand);

  // Update teaser image with provider image for Unique Aesthetics brands
  updateTeaserImage(brand);

  // Update body class for brand-specific styles
  document.body.className = document.body.className.replace(/brand-\w+/g, "");
  document.body.classList.add(`brand-${brandId}`);

  // Handle header bar for Unique Aesthetics brands
  updateHeaderBar(brand);

  // Update toggle UI
  updateToggleUI();

  console.log(`🎨 Brand applied: ${brand.name}`);
}

/**
 * Toggle between default and branded mode
 */
function toggleBrand() {
  const newBrand = currentBrand === "default" ? "uniqueAesthetics" : "default";
  applyBrand(newBrand);
}

/**
 * Create the branding toggle UI
 */
function createBrandingToggle() {
  // Check if toggle already exists
  if (document.getElementById("branding-toggle")) {
    return;
  }

  const toggleContainer = document.createElement("div");
  toggleContainer.id = "branding-toggle";
  toggleContainer.className = "branding-toggle-container";
  toggleContainer.innerHTML = `
    <div class="branding-toggle-panel">
      <div class="branding-toggle-header">
        <span class="branding-toggle-icon">🎨</span>
        <span class="branding-toggle-title">Branding</span>
        <button class="branding-toggle-collapse" onclick="toggleBrandingPanel()" title="Collapse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
      <div class="branding-toggle-content">
        <div class="branding-toggle-label">Practice Branding</div>
        <div class="branding-toggle-switch">
          <button class="brand-option ${
            currentBrand === "default" ? "active" : ""
          }" data-brand="default" onclick="applyBrand('default')">
            Default
          </button>
          <button class="brand-option ${
            currentBrand === "uniqueAestheticsPink" ? "active" : ""
          }" data-brand="uniqueAestheticsPink" onclick="applyBrand('uniqueAestheticsPink')">
            UA Pink
          </button>
          <button class="brand-option ${
            currentBrand === "uniqueAestheticsTeal" ? "active" : ""
          }" data-brand="uniqueAestheticsTeal" onclick="applyBrand('uniqueAestheticsTeal')">
            UA Teal
          </button>
        </div>
        <div class="branding-current">
          <span class="branding-current-label">Current:</span>
          <span class="branding-current-name" id="current-brand-name">${
            BRANDS[currentBrand].name
          }</span>
        </div>
      </div>
    </div>
    <button class="branding-toggle-trigger" onclick="toggleBrandingPanel()" title="Branding Options">
      🎨
    </button>
  `;

  document.body.appendChild(toggleContainer);
}

/**
 * Toggle the branding panel visibility
 */
function toggleBrandingPanel() {
  const container = document.getElementById("branding-toggle");
  if (container) {
    const isExpanding = !container.classList.contains("expanded");
    container.classList.toggle("expanded");

    // When expanding, ensure we're using the correct current brand from localStorage
    if (isExpanding) {
      // Re-read from localStorage to ensure we have the correct brand
      const savedBrand = localStorage.getItem("selectedBrand");
      if (savedBrand && BRANDS[savedBrand] && savedBrand !== currentBrand) {
        // If there's a mismatch, sync it (but don't re-apply, just update UI)
        currentBrand = savedBrand;
      }
      updateToggleUI();
    }
  }
}

/**
 * Update the toggle UI to reflect current brand
 */
function updateToggleUI() {
  const brandOptions = document.querySelectorAll(".brand-option");
  brandOptions.forEach((option) => {
    const brandId = option.getAttribute("data-brand");
    option.classList.toggle("active", brandId === currentBrand);
  });

  const currentNameEl = document.getElementById("current-brand-name");
  if (currentNameEl) {
    currentNameEl.textContent = BRANDS[currentBrand].name;
  }
}

/**
 * Update or create the provider section
 */
function updateProviderSection(brand) {
  let providerSection = document.getElementById("provider-section");

  if (!brand.showProviders || brand.providers.length === 0) {
    // Hide provider section if not needed
    if (providerSection) {
      providerSection.style.display = "none";
    }
    return;
  }

  // Create provider section if it doesn't exist
  if (!providerSection) {
    providerSection = document.createElement("div");
    providerSection.id = "provider-section";
    providerSection.className = "provider-section";

    // For Unique Aesthetics brands, insert right after subtitle (before image)
    // For other brands, insert after features, before CTA
    const teaserContainer = document.querySelector(".teaser-container");
    const isUniqueAesthetics =
      brand.id === "uniqueAestheticsPink" ||
      brand.id === "uniqueAestheticsTeal";

    if (isUniqueAesthetics) {
      const teaserSubtitle = document.querySelector(".teaser-subtitle");
      const teaserImage = document.querySelector(".teaser-image");
      if (teaserContainer && teaserSubtitle && teaserImage) {
        teaserContainer.insertBefore(providerSection, teaserImage);
      }
    } else {
      const teaserCta = document.querySelector(".teaser-cta");
      if (teaserContainer && teaserCta) {
        teaserContainer.insertBefore(providerSection, teaserCta);
      }
    }
  }

  // Always ensure the provider section is visible and populated
  providerSection.style.display = "block";
  providerSection.style.visibility = "visible";

  // Check if this is Unique Aesthetics for compact layout
  const isUniqueAesthetics =
    brand.id === "uniqueAestheticsPink" || brand.id === "uniqueAestheticsTeal";

  if (isUniqueAesthetics) {
    // Compact provider section for landing page
    const provider = brand.providers[0];
    console.log("🎨 Populating provider section with:", provider);
    providerSection.innerHTML = `
      <div class="provider-compact">
        <div class="provider-compact-image">
          <img src="${provider.image}" alt="${provider.name}" class="provider-compact-img" onerror="console.error('Failed to load provider image:', '${provider.image}'); this.style.display='none';">
        </div>
        <div class="provider-compact-info">
          <h3 class="provider-compact-name">${provider.name}</h3>
          <p class="provider-compact-title">${provider.title}</p>
          <p class="provider-compact-bio">${provider.bio}</p>
        </div>
      </div>
    `;
    console.log(
      "✅ Provider section populated:",
      providerSection.innerHTML.substring(0, 100)
    );
  } else {
    // Full provider section for other brands
    const providersHTML = brand.providers
      .map(
        (provider) => `
      <div class="provider-card">
        <div class="provider-image-wrapper">
          <img src="${provider.image}" alt="${
          provider.name
        }" class="provider-image" onerror="this.style.display='none'">
        </div>
        <div class="provider-info">
          <h3 class="provider-name">${provider.name}</h3>
          <p class="provider-title">${provider.title}</p>
          <p class="provider-bio">${provider.bio}</p>
          <div class="provider-specialties">
            ${provider.specialties
              .map((s) => `<span class="specialty-tag">${s}</span>`)
              .join("")}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    providerSection.innerHTML = `
      <div class="provider-section-header">
        <h2 class="provider-section-title">Meet Your Providers</h2>
        <p class="provider-section-subtitle">Expert care from our skilled team</p>
      </div>
      <div class="provider-cards">
        ${providersHTML}
      </div>
      ${
        brand.location
          ? `
      <div class="practice-info">
        <div class="practice-info-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${brand.location}</span>
        </div>
        ${
          brand.phone
            ? `
        <div class="practice-info-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <a href="tel:${brand.phone.replace(/[^0-9]/g, "")}">${brand.phone}</a>
        </div>
        `
            : ""
        }
      </div>
    `
          : ""
      }
    `;
  }
}

/**
 * Update the teaser image with provider image for Unique Aesthetics brands
 */
function updateTeaserImage(brand) {
  // Check if this brand should use provider image
  const shouldUseProviderImage =
    brand.id === "uniqueAestheticsPink" || brand.id === "uniqueAestheticsTeal";

  const teaserImage = document.querySelector(".teaser-photo");
  const teaserImageContainer = document.querySelector(".teaser-image");

  if (!teaserImage || !teaserImageContainer) {
    return;
  }

  if (shouldUseProviderImage && brand.providers && brand.providers.length > 0) {
    // Hide the large teaser image since we're showing provider in compact section
    teaserImageContainer.style.display = "none";
  } else {
    // Reset to default image and show it
    teaserImage.src = "Onboarding-concept.jpg";
    teaserImage.alt = "Aesthetic consultation";
    teaserImageContainer.style.display = "flex";

    // Remove provider image styling
    teaserImageContainer.classList.remove("provider-image-container");
  }
}

/**
 * Update or create the header bar for Unique Aesthetics brands
 */
function updateHeaderBar(brand) {
  // Check if this brand should have a header bar
  const shouldShowHeader =
    brand.id === "uniqueAestheticsPink" || brand.id === "uniqueAestheticsTeal";

  let headerBar = document.getElementById("brand-header-bar");

  if (shouldShowHeader) {
    // Update existing header bar if it exists (from HTML)
    if (headerBar) {
      // Try both .logo-image and .brand-header-logo img selectors
      const logoImg =
        headerBar.querySelector(".logo-image") ||
        headerBar.querySelector(".brand-header-logo img");
      if (logoImg) {
        logoImg.src = brand.logo;
        logoImg.alt = brand.logoAlt;
      }
      const exitButton = headerBar.querySelector(".exit-button");
      if (exitButton) {
        // Update onclick if it's a button, or href if it's a link
        if (exitButton.onclick) {
          // Keep the onclick handler
        } else if (exitButton.href !== undefined) {
          exitButton.href =
            brand.website || "https://www.myuniqueaesthetics.com/";
        }
      }
    } else {
      // Create header bar if it doesn't exist
      headerBar = document.createElement("div");
      headerBar.id = "brand-header-bar";
      headerBar.className = "brand-header-bar";

      // Create logo container
      const logoContainer = document.createElement("div");
      logoContainer.className = "brand-header-logo";
      const logoImg = document.createElement("img");
      logoImg.className = "logo-image";
      logoImg.src = brand.logo;
      logoImg.alt = brand.logoAlt;
      logoContainer.appendChild(logoImg);

      // Create exit button
      const exitButton = document.createElement("a");
      exitButton.id = "exit-button";
      exitButton.className = "exit-button";
      exitButton.href = brand.website || "https://www.myuniqueaesthetics.com/";
      exitButton.target = "_blank";
      exitButton.rel = "noopener noreferrer";
      exitButton.innerHTML = "×";
      exitButton.title = "Exit to Unique Aesthetics & Wellness";

      // Append elements to header bar
      headerBar.appendChild(logoContainer);
      headerBar.appendChild(exitButton);

      // Insert header bar at the beginning of body
      document.body.insertBefore(headerBar, document.body.firstChild);
    }

    // Show the header bar
    headerBar.style.display = "flex";

    // Hide the logo in teaser screen since it's now in the header
    const teaserLogo = document.querySelector(".teaser-logo");
    if (teaserLogo) {
      teaserLogo.style.display = "none";
    }
  } else {
    // Hide header bar for other brands
    if (headerBar) {
      headerBar.style.display = "none";
    }

    // Show the logo in teaser screen again
    const teaserLogo = document.querySelector(".teaser-logo");
    if (teaserLogo) {
      teaserLogo.style.display = "flex";
    }
  }
}

/**
 * Get the current brand configuration
 */
function getCurrentBrand() {
  return BRANDS[currentBrand];
}

/**
 * Get a specific brand configuration
 */
function getBrand(brandId) {
  return BRANDS[brandId];
}

// ============================================================================
// INITIALIZE ON DOM READY
// ============================================================================

// Expose functions to global scope for onclick handlers
window.toggleBrandingPanel = toggleBrandingPanel;
window.applyBrand = applyBrand;

// Wait for DOM to be ready, then initialize branding
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBranding);
} else {
  // DOM is already ready
  // Use a small delay to ensure all elements are fully rendered
  setTimeout(initBranding, 100);
}

// Also ensure provider section is populated after a short delay as a fallback
// This handles cases where the initial call might have timing issues
setTimeout(() => {
  const savedBrand =
    localStorage.getItem("selectedBrand") || "uniqueAestheticsPink";
  const brand = BRANDS[savedBrand];
  if (brand && brand.showProviders && brand.providers.length > 0) {
    const providerSection = document.getElementById("provider-section");
    // Check if section exists but is empty or only contains comments/whitespace
    const hasContent =
      providerSection &&
      providerSection.innerHTML &&
      providerSection.innerHTML.trim() !== "" &&
      !providerSection.innerHTML.trim().startsWith("<!--") &&
      providerSection.querySelector(".provider-compact, .provider-card");

    if (providerSection && !hasContent) {
      console.log("🔄 Re-populating provider section as fallback");
      updateProviderSection(brand);
    }
  }
}, 300);

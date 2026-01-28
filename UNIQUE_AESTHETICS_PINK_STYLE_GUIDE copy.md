# Unique Aesthetics & Wellness - Pink Brand Style Guide

**Brand Identity:** Where Luxury Aesthetic Treatment Feels Like Home

---

## 🎨 Color Palette

### Primary Colors
- **Primary Black**: `#000000` (Main text, buttons, borders, accents)
- **Primary Hover**: `#333333` (Hover states)
- **Text Primary**: `#000000` (Headings, primary text)
- **Text Secondary**: `#333333` (Secondary text, labels)
- **Text Muted**: `#666666` (Tertiary text, descriptions)

### Accent Colors (Pink Theme)
- **Baby Pink**: `#FFA2C7` (Primary accent, CTAs, highlights)
- **Light Pink**: `#FFD4E5` (Light accents, backgrounds)
- **Dark Pink**: `#E8759E` (Darker accents, hover states)

### Background Colors
- **Background Gradient**: 
  - Start: `#FAF6F0` (Parchment)
  - End: `#F1ECE2` (Soft Linen)
  - Usage: `linear-gradient(180deg, #FAF6F0 0%, #F1ECE2 100%)`
  - Creates a warm, luxurious, home-like atmosphere

- **Card Background**: `#FFFFFF` (White cards for content)

### Border & Divider Colors
- **Border**: `#E8E4DC` (Soft border matching linen aesthetic)

### Status Colors
- **Success Green**: 
  - Background: `#e8f5e9`
  - Text: `#2e7d32`

---

## 📝 Typography

### Font Families
- **Headings**: `'Playfair Display', serif` (Elegant, luxury feel)
- **Body Text**: `'Montserrat', sans-serif` (Modern, clean, readable)

### Font Usage
- **Headings**: Use Playfair Display for titles, hero text, and prominent headings
- **Body**: Use Montserrat for all body text, buttons, labels, and UI elements

### Font Sizes
- **H1 (Hero)**: `32px-36px` - Weight: `700` (Playfair Display)
- **H1 (Large)**: `28px` - Weight: `700` (Playfair Display)
- **H2**: `24px` - Weight: `600-700` (Playfair Display)
- **H3**: `20px` - Weight: `600` (Playfair Display)
- **Body Large**: `18px` - Weight: `400-500` (Montserrat)
- **Body**: `16px` - Weight: `400` (Montserrat)
- **Body Small**: `14px` - Weight: `400` (Montserrat)
- **Caption**: `12px-13px` - Weight: `500` (Montserrat)

---

## 👤 Provider Information

### Lead Aesthetic Specialist: Amber

**Title:** Lead Aesthetic Specialist

**Bio:** Expert in injectables and facial aesthetics with a passion for natural-looking results.

**Specialties:**
- BOTOX
- Dermal Fillers
- Xeomin
- Lip Fillers

**Image:** `487973728_496812450036029_3275739576959902436_n.jpg`

**Provider Display Guidelines:**
- Show provider information prominently on the home/teaser screen
- Use compact layout for landing page (image + info side-by-side)
- Emphasize expertise and specialties
- Create personal connection with potential patients

---

## 🏢 Practice Information

**Name:** Unique Aesthetics & Wellness

**Tagline:** "Where Luxury Aesthetic Treatment Feels Like Home"

**Location:** 2321 Drusilla Lane, Suite D, Baton Rouge, LA 70809

**Phone:** (225) 465-0197

**Website:** https://www.myuniqueaesthetics.com/

**CTA Text:** "Book at Unique Aesthetics"

---

## 🎯 Brand Voice & Messaging

### Key Messaging Themes
1. **Luxury & Comfort**: "Where Luxury Aesthetic Treatment Feels Like Home"
2. **Personalized Care**: Emphasize one-on-one consultation and personalized treatment plans
3. **Expertise**: Highlight Amber's expertise and specialties
4. **Natural Results**: Focus on natural-looking aesthetic outcomes
5. **Accessibility**: Make luxury feel approachable and welcoming

### Tone
- **Warm & Inviting**: Like being welcomed into a beautiful home
- **Professional & Trustworthy**: Expert care with personal touch
- **Luxurious but Approachable**: High-end without being intimidating
- **Personal**: Emphasize the individual relationship with Amber

---

## 📦 Component Styles

### Buttons

#### Primary Button (Pink Accent)
```css
background: #000000; /* Black for elegance */
color: white;
border: none;
border-radius: 12px;
padding: 16px 24px;
font-size: 16px;
font-weight: 600;
font-family: 'Montserrat', sans-serif;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
transition: all 0.2s ease;
```

**Hover State:**
```css
background: #333333;
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
```

#### Accent Button (Pink)
```css
background: #FFA2C7; /* Baby Pink */
color: #000000;
border: none;
border-radius: 12px;
padding: 16px 24px;
font-size: 16px;
font-weight: 600;
font-family: 'Montserrat', sans-serif;
```

**Hover State:**
```css
background: #E8759E; /* Dark Pink */
transform: translateY(-2px);
```

### Cards

#### Standard Card
```css
background: #FFFFFF;
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
border: 1px solid #E8E4DC;
```

**Hover State:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
border-color: #FFA2C7;
```

### Provider Card (Compact - Landing Page)
```css
display: flex;
align-items: center;
gap: 16px;
padding: 20px;
background: #FFFFFF;
border-radius: 16px;
border: 1px solid #E8E4DC;
```

**Provider Image:**
```css
width: 80px;
height: 80px;
border-radius: 12px;
object-fit: cover;
```

**Provider Info:**
- Name: `font-size: 18px`, `font-weight: 600`, `color: #000000` (Playfair Display)
- Title: `font-size: 14px`, `color: #666666` (Montserrat)
- Bio: `font-size: 14px`, `color: #333333`, `line-height: 1.6` (Montserrat)

### Header Bar (Unique Aesthetics Brands)
```css
background: #FFFFFF;
padding: 16px 24px;
border-bottom: 1px solid #E8E4DC;
display: flex;
justify-content: space-between;
align-items: center;
position: sticky;
top: 0;
z-index: 100;
```

**Logo:**
- Max width: `120px`
- Max height: `60px`
- Object-fit: `contain`

---

## 🎨 Visual Elements

### Gradients
- **Background**: `linear-gradient(180deg, #FAF6F0 0%, #F1ECE2 100%)`
- **Accent Highlights**: `linear-gradient(135deg, #FFA2C7 0%, #FFD4E5 100%)`

### Shadows
- **Card Shadow**: `0 2px 8px rgba(0, 0, 0, 0.05)`
- **Card Hover**: `0 4px 12px rgba(0, 0, 0, 0.1)`
- **Button Shadow**: `0 4px 12px rgba(0, 0, 0, 0.3)`

### Border Radius
- **Small**: `8px` (Small buttons, inputs)
- **Medium**: `12px` (Buttons, cards, badges)
- **Large**: `16px` (Cards, containers)
- **Extra Large**: `20px` (Main cards, app container)

---

## 📐 Spacing System

### Padding
- **Extra Small**: `8px`
- **Small**: `12px`
- **Medium**: `16px`
- **Large**: `20px-24px`
- **Extra Large**: `32px-40px`

### Margins
- **Tight**: `4px-8px`
- **Standard**: `12px-16px`
- **Large**: `24px-32px`
- **Extra Large**: `48px`

---

## 🎯 Provider-Focused Content Guidelines

### Home/Teaser Screen
1. **Show Provider Prominently**
   - Display Amber's image and information early in the experience
   - Use compact layout: image + name/title/bio side-by-side
   - Position after tagline, before main image

2. **Emphasize Expertise**
   - Highlight specialties: BOTOX, Dermal Fillers, Xeomin, Lip Fillers
   - Use bio: "Expert in injectables and facial aesthetics with a passion for natural-looking results"

3. **Create Personal Connection**
   - Use first name "Amber" to create familiarity
   - Emphasize "Lead Aesthetic Specialist" title for authority
   - Show photo to build trust and connection

### Consultation CTAs
- Emphasize "one-on-one consultation with Amber"
- Highlight "personalized treatment plan"
- Use warm, inviting language: "Meet with Amber to discuss your goals"

### Practice Information Display
- Show location: "2321 Drusilla Lane, Suite D, Baton Rouge, LA 70809"
- Display phone: "(225) 465-0197"
- Link to website: https://www.myuniqueaesthetics.com/

---

## 💡 Design Principles

1. **Luxury Meets Comfort**: Elegant typography (Playfair Display) with warm, home-like colors
2. **Provider-Centric**: Always highlight Amber's expertise and personal touch
3. **Pink Accents**: Use baby pink (#FFA2C7) strategically for CTAs and highlights
4. **Warm Background**: Parchment-to-linen gradient creates inviting, luxurious atmosphere
5. **Black & White Elegance**: Primary black on white for sophistication
6. **Personal Touch**: Emphasize the individual relationship with Amber
7. **Natural Aesthetics**: Focus messaging on natural-looking results

---

## 🎨 Logo & Branding Assets

**Logo URL:** https://www.datocms-assets.com/163832/1753199215-unique_physique.svg

**Logo Usage:**
- Display in header bar (top of page)
- Max dimensions: 120px × 60px
- Maintain aspect ratio
- Use on white background

---

## 📱 Responsive Considerations

### Mobile (≤428px)
- Provider card stacks vertically if needed
- Maintain readable font sizes
- Ensure touch targets are at least 44px

### Desktop (>428px)
- App container has rounded corners (20px)
- Maintains mobile-first layout
- Provider information can use more horizontal space

---

## ✨ Special Features

### Header Bar
- Shows logo on left
- Exit button (×) on right linking to main website
- Sticky positioning for always-visible branding

### Provider Section
- Compact layout for landing page
- Full layout available for other screens
- Image + info creates personal connection

### CTA Emphasis
- All CTAs use brand text: "Book at Unique Aesthetics"
- Emphasize consultation with Amber
- Highlight personalized treatment plans

---

*This style guide ensures consistent brand representation for Unique Aesthetics & Wellness (Pink theme) with emphasis on provider expertise and the luxury-home aesthetic.*


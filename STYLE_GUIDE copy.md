# Design System Style Guide

This document outlines the complete design system used in this progress tracking web application. Use this guide to align the design of other applications with the established visual language.

---

## 🎨 Color Palette

### Primary Colors
- **Primary Dark**: `#212121` (Main text, buttons, borders, accents)
- **Primary Text**: `#424242` (Secondary text, labels)
- **Primary Light Text**: `#666` (Tertiary text, descriptions)

### Background Colors
- **White**: `#ffffff` (Cards, containers, headers)
- **Background Gradient**: 
  - Start: `#FFD291` (Warm peach)
  - End: `#E5F6FE` (Light blue)
  - Usage: `linear-gradient(180deg, #FFD291 0%, #E5F6FE 100%)`
  - Applied to: `body` background with `background-attachment: fixed`

### Accent Colors
- **Accent Yellow**: `#FAD7A2` (Selected states, highlights, badges)
- **Accent Light Gray**: `#F3F3F3` (Icon backgrounds, inactive states)
- **Border Gray**: `#e8e8e8` (Card borders, dividers)
- **Border Light Gray**: `#E0E0E0` (Subtle dividers)
- **Background Gray**: `#EDE3E1` (Camera preview background)

### Status Colors
- **Success Green**: 
  - Background: `#e8f5e9`
  - Text: `#2e7d32`
- **Warning Orange**:
  - Background: `#fff3e0`
  - Text: `#e65100`
  - Border: `#ffb74d`
- **Info Blue**:
  - Background: `#e3f2fd`
  - Text: `#1976d2`
- **Warning Button**: `#ff9800` (hover: `#f57c00`)

### Dark Mode (Photo Capture)
- **Black Background**: `#000000`
- **Dark Gray**: `#1a1a1a` (Instructions panel)
- **Dark Border**: `#333` (Dividers in dark mode)
- **White Text**: `#ffffff` (Text on dark backgrounds)

---

## 📝 Typography

### Font Family
```css
font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
  'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Smoothing
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Font Sizes
- **H1 (Large)**: `36px` / `28px` - Weight: `700`
- **H1 (Medium)**: `28px` / `24px` - Weight: `700`
- **H1 (Small)**: `22px` / `20px` - Weight: `700`
- **H2**: `24px` / `20px` / `18px` - Weight: `600-700`
- **H3**: `20px` / `18px` - Weight: `600`
- **Body Large**: `18px` / `16px` - Weight: `500-600`
- **Body**: `16px` / `15px` / `14px` - Weight: `400-500`
- **Body Small**: `14px` / `13px` / `12px` - Weight: `400-500`
- **Caption**: `12px` - Weight: `500-600`

### Font Weights
- **Bold**: `700` (Headings, emphasis)
- **Semi-Bold**: `600` (Subheadings, buttons, labels)
- **Medium**: `500` (Body text, secondary labels)
- **Regular**: `400` (Default body text)
- **Light**: `300` (Decorative elements, arrows)

### Line Heights
- **Tight**: `1.5` (Body text)
- **Normal**: `1.6` (Paragraphs, descriptions)

---

## 📐 Spacing System

### Padding
- **Extra Small**: `8px` (Tight spacing, icon padding)
- **Small**: `12px` (Gap between small elements)
- **Medium**: `16px` (Standard element spacing)
- **Large**: `20px` / `24px` (Card padding, section spacing)
- **Extra Large**: `32px` / `40px` / `48px` (Section margins, large gaps)
- **Screen Padding**: `20px` (Standard horizontal padding)

### Margins
- **Tight**: `4px` / `8px`
- **Standard**: `12px` / `16px`
- **Large**: `24px` / `32px`
- **Extra Large**: `48px` / `60px`

### Gaps (Flexbox/Grid)
- **Small**: `8px` / `12px`
- **Medium**: `16px` / `20px`
- **Large**: `24px` / `32px`

---

## 🎯 Border Radius

- **Small**: `8px` (Small buttons, inputs)
- **Medium**: `12px` (Buttons, cards, badges)
- **Large**: `16px` (Cards, containers)
- **Extra Large**: `20px` (Main cards, app container on desktop)
- **Circle**: `50%` (Avatars, circular buttons, icons)

---

## 📦 Component Styles

### Buttons

#### Primary Button
```css
background: #212121;
color: white;
border: none;
border-radius: 12px;
padding: 16px;
font-size: 16px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
transition: all 0.2s ease;
```

**Hover State:**
```css
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(33, 33, 33, 0.4);
```

**Active State:**
```css
transform: translateY(0);
```

#### Secondary Button Variants
- **Success**: Background `#e8f5e9`, Text `#2e7d32`
- **Warning**: Background `#fff3e0`, Text `#e65100`
- **Info**: Background `#e3f2fd`, Text `#1976d2`

#### Button Sizes
- **Standard**: `padding: 16px`, `font-size: 16px`
- **Small**: `padding: 12px 16px`, `font-size: 14px`
- **Icon Button**: `padding: 8px`

### Cards

#### Standard Card
```css
background: white;
border-radius: 16px;
padding: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
border: 1px solid #e8e8e8;
```

**Hover State:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
border-color: #212121;
```

#### Mode Card (Home Screen)
```css
background: white;
border: 2px solid #e8e8e8;
border-radius: 20px;
padding: 32px 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

**Hover State:**
```css
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(33, 33, 33, 0.15);
border-color: #212121;
```

### Headers

#### Sticky Header
```css
background: white;
padding: 20px / 24px;
border-bottom: 1px solid #e8e8e8;
position: sticky;
top: 0;
z-index: 10;
```

#### Header Typography
- **Title**: `font-size: 20px-28px`, `font-weight: 700`, `color: #212121`
- **Subtitle**: `font-size: 14px-16px`, `color: #424242`

### Badges

#### Standard Badge
```css
padding: 6px 12px;
border-radius: 20px;
font-size: 12px;
font-weight: 600;
```

#### Status Badges
- **Approved**: Background `#e8f5e9`, Text `#2e7d32`
- **Pending**: Background `#fff3e0`, Text `#e65100`
- **Days Badge**: Background `#FAD7A2`, Text `#212121`

#### Photo Badge (Overlay)
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
padding: 6px 12px;
border-radius: 20px;
font-size: 12px;
font-weight: 500;
color: #212121;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Inputs & Forms

#### Form Container
```css
background: white;
border-radius: 16px;
padding: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

#### Option Button (Radio/Checkbox Style)
```css
display: flex;
align-items: center;
gap: 16px;
padding: 20px;
border: 2px solid #e8e8e8;
border-radius: 12px;
background: white;
cursor: pointer;
transition: all 0.2s ease;
```

**Selected State:**
```css
border-color: #212121;
background: #FAD7A2; /* or #F3F3F3 */
```

**Hover State:**
```css
border-color: #212121;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(33, 33, 33, 0.15);
```

### Stats & Metrics

#### Stat Card
```css
background: white;
padding: 16px;
border-radius: 12px;
text-align: center;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

#### Stat Typography
- **Value**: `font-size: 24px`, `font-weight: 700`, `color: #212121`
- **Label**: `font-size: 12px`, `color: #424242`, `font-weight: 500`

### Timeline

#### Timeline Marker
```css
width: 16px;
height: 16px;
background: #212121;
border: 3px solid white;
border-radius: 50%;
box-shadow: 0 2px 8px rgba(33, 33, 33, 0.3);
```

#### Timeline Line
```css
width: 2px;
background: linear-gradient(180deg, #212121 0%, rgba(33, 33, 33, 0.2) 100%);
```

### Photo Containers

#### Photo Card
```css
border-radius: 16px;
overflow: hidden;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
background: white;
```

#### Photo Image
```css
width: 100%;
height: auto;
display: block;
object-fit: cover;
```

---

## 🎭 Animations & Transitions

### Transitions
- **Standard**: `transition: all 0.2s ease` (Buttons, cards)
- **Smooth**: `transition: all 0.3s ease` (Mode cards, hover effects)

### Keyframe Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Screen Transition
```css
animation: fadeIn 0.3s ease-in-out;
```

---

## 📱 Layout & Responsive Design

### Container System

#### App Container
```css
max-width: 428px;
margin: 0 auto;
width: 100%;
min-height: 100vh;
background: transparent;
position: relative;
box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
```

**Desktop (≥429px):**
```css
border-radius: 20px;
margin: 20px auto;
min-height: calc(100vh - 40px);
```

### Content Widths
- **Max Content**: `600px` (Forms, centered content)
- **Standard Content**: `400px` (Home screen content)
- **Full Width**: `100%` (Mobile-first)

### Sticky Elements
- **Headers**: `position: sticky; top: 0; z-index: 10;`
- **Footers**: `position: sticky; bottom: 0;`

---

## 🎨 Visual Effects

### Shadows

#### Card Shadow (Subtle)
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

#### Card Shadow (Hover)
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

#### Button Shadow
```css
box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
```

#### Photo Shadow
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
```

#### App Container Shadow
```css
box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
```

### Backdrop Filter
```css
backdrop-filter: blur(10px);
```
Used for: Photo overlay badges, semi-transparent elements

### Gradients

#### Background Gradient
```css
background: linear-gradient(180deg, #FFD291 0%, #E5F6FE 100%);
background-attachment: fixed;
```

#### Hover Gradient (Mode Cards)
```css
background: linear-gradient(135deg, rgba(255, 210, 145, 0.1) 0%, rgba(229, 246, 254, 0.1) 100%);
```

---

## 🎯 Interactive States

### Hover States
- **Cards**: `transform: translateY(-2px to -4px)`, enhanced shadow, border color change
- **Buttons**: `transform: translateY(-2px)`, enhanced shadow
- **Links**: Color change to accent or darker shade

### Active States
- **Buttons**: `transform: translateY(0)` (return to original position)
- **Cards**: `transform: translateY(-2px)` (slightly less than hover)

### Focus States
- **Checkboxes/Inputs**: `outline: 2px solid #212121; outline-offset: 2px;`

### Disabled States
```css
opacity: 0.5;
cursor: not-allowed;
```

---

## 📋 Common Patterns

### Section Title
```css
font-size: 20px;
font-weight: 600;
color: #212121;
margin-bottom: 16px;
```

### Back Button
```css
background: none;
border: none;
color: #212121;
font-size: 16px;
cursor: pointer;
padding: 8px;
font-weight: 500;
```

### Empty State
```css
text-align: center;
padding: 60px 20px;
```

**Empty State Icon:**
```css
font-size: 64px;
margin-bottom: 16px;
```

**Empty State Text:**
- **Title**: `font-size: 18px-20px`, `color: #212121`
- **Description**: `font-size: 14px`, `color: #424242`

### Divider
```css
border-bottom: 1px solid #e8e8e8;
```

### Spacer (for header alignment)
```css
width: 60px;
```

---

## 🎨 Special Components

### Photo Capture Screen
- **Background**: `#000000`
- **Text**: `#ffffff`
- **Instructions Panel**: `#1a1a1a`
- **Capture Button**: White circle with black border, `72px × 72px`

### Processing Screen
- **Background**: Same gradient as main app
- **Spinner**: `64px`, border with `#212121` accent
- **Progress Bar**: `8px` height, `#212121` fill

### Comparison View
- **Split Divider**: `2px` solid `#212121`
- **Slider Handle**: White circle with `#212121` border, `40px × 40px`

---

## 📐 Icon Sizes

- **Large Icons**: `48px` / `64px` (Feature icons, empty states)
- **Medium Icons**: `24px` (Standard icons, avatars)
- **Small Icons**: `18px` / `20px` (Button icons, inline icons)
- **Tiny Icons**: `12px` (Badge icons)

---

## 🎯 Z-Index Scale

- **Base**: `0` (Default)
- **Sticky Headers**: `10`
- **Overlays**: `2-5`
- **Modals/Dialogs**: `100+` (if used)

---

## 💡 Design Principles

1. **Mobile-First**: Design for 428px width, scale up for desktop
2. **Consistent Spacing**: Use the spacing system consistently
3. **Smooth Interactions**: All interactive elements have transitions
4. **Clear Hierarchy**: Use font sizes and weights to establish visual hierarchy
5. **Subtle Shadows**: Use shadows sparingly and consistently
6. **Rounded Corners**: Consistent border radius creates a friendly, modern feel
7. **Color Consistency**: Use the defined color palette throughout
8. **Accessibility**: Maintain sufficient contrast ratios (dark text on light backgrounds)

---

## 🔧 CSS Reset

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

---

## 📝 Notes

- The app uses a warm, friendly color palette with peach and light blue gradients
- All interactive elements provide visual feedback through hover and active states
- The design emphasizes clarity and ease of use with generous spacing and clear typography
- Cards and containers use subtle shadows to create depth without being overwhelming
- The design is optimized for mobile but scales gracefully to desktop with rounded corners on the container

---

*This style guide was generated from the progress tracking application codebase. Use these values and patterns to maintain design consistency across applications.*


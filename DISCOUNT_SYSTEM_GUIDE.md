# Discount Offer System Guide

## Overview

A comprehensive discount offer system that creates urgency and incentivizes booking consultations. Discounts are personalized based on user selections and displayed throughout the user journey.

---

## 🎁 Discount Offer Types

### 1. First Consultation Discount
- **Code**: `FIRST50`
- **Amount**: $50 OFF
- **Description**: "$50 off your first consultation"
- **Scarcity**: "Limited time offer"
- **Applies to**: All consultations

### 2. Injectable Treatments Discount
- **Code**: `INJECT50`
- **Amount**: $50 OFF
- **Description**: "$50 off injectable treatments"
- **Scarcity**: "New patient special"
- **Applies to**: BOTOX, Dermal Fillers, Xeomin, Lip Fillers
- **Triggered when**: User selects concerns related to wrinkles, lines, lips, volume, fillers, or botox

### 3. Comprehensive Plan Discount
- **Code**: `PLAN75`
- **Amount**: $75 OFF
- **Description**: "$75 off comprehensive treatment plans"
- **Scarcity**: "Book within 48 hours"
- **Applies to**: Consultation and treatment plans
- **Triggered when**: User has 2+ concerns or 2+ goals selected

---

## 📍 Where Discounts Appear

### 1. Home/Teaser Screen
- **Location**: Above main CTA button
- **Display**: Animated badge showing "$50 OFF Your First Consultation"
- **Scarcity**: "Limited Time" badge
- **Note**: "Special Offer: Redeem your discount when you book"

### 2. Onboarding Screen (Final Slide)
- **Location**: Above "Start My Transformation" button
- **Display**: Personalized discount offer card
- **Shows**: Discount amount, description, and scarcity message
- **Updates**: Based on user's form selections (if available)

### 3. Gallery Screen
- **Location**: Above CTA buttons
- **Display**: Active discount banner
- **Shows**: Discount amount, description, and "Redeem" button
- **Action**: Click "Redeem" to see discount details

### 4. Case Cards (Carousel)
- **Location**: Top-right corner of case card images
- **Display**: Discount badge (🎁 $XX OFF)
- **Shows**: Only on qualifying treatments
- **Action**: Click badge to see discount details

### 5. Case Detail Screen
- **Location**: Above main CTA section
- **Display**: Discount offer card with amount and description
- **Shows**: Scarcity message and "Redeem Now" link
- **Action**: Click "Redeem Now" to view discount code

### 6. Consultation Modal
- **Location**: After benefits list, before form
- **Display**: Discount section with badge and code
- **Shows**: Discount code that can be redeemed
- **Action**: "Redeem Discount" button to claim code

---

## 🎯 Personalization Logic

The system automatically selects the most relevant discount based on:

1. **User's Selected Concerns**
   - Injectable-related concerns → Injectable discount
   - Multiple concerns → Comprehensive plan discount
   - Single concern → First consultation discount

2. **User's Goals**
   - Multiple goals → Comprehensive plan discount
   - Single goal → First consultation discount

3. **Treatment Type**
   - Discounts only show on qualifying treatments
   - Injectable discount shows on BOTOX, Fillers, etc.
   - Consultation discount applies to all

---

## 💰 Discount Redemption Flow

### Step 1: View Discount
- User sees discount offer throughout journey
- Discount badge appears on relevant case cards
- Scarcity messaging creates urgency

### Step 2: Click Redeem
- User clicks "Redeem" button or discount badge
- Discount details modal opens
- Shows discount code and terms

### Step 3: Claim Discount
- User clicks "Redeem & Book Consultation"
- Discount is stored in session
- User proceeds to consultation booking

### Step 4: Use Discount Code
- Discount code displayed in consultation modal
- Code is automatically included in booking
- User can copy code for reference

---

## 🎨 Visual Design

### Discount Badges
- **Color**: Warm gradient (peach/cream)
- **Border**: Gold/amber accent
- **Animation**: Subtle pulse effect
- **Icon**: 🎁 gift icon

### Scarcity Indicators
- **Text**: "Limited Time", "New Patient Special", "Book within 48 hours"
- **Style**: Uppercase, colored text
- **Background**: Light accent color

### Discount Codes
- **Font**: Monospace (Courier New)
- **Size**: Large, prominent
- **Style**: Dashed border, highlighted background
- **Format**: Uppercase letters/numbers (e.g., "FIRST50")

---

## 🔧 Configuration Options

### To Modify Discount Amounts
Edit `DISCOUNT_OFFERS` object in `app.js`:
```javascript
const DISCOUNT_OFFERS = {
  firstConsultation: {
    amount: 50,  // Change this value
    // ...
  }
}
```

### To Add New Discount Types
Add new object to `DISCOUNT_OFFERS`:
```javascript
newDiscount: {
  id: "NEWCODE",
  amount: 100,
  type: "dollars",
  description: "$100 off special treatment",
  scarcity: "Limited time only",
  personalized: true,
  applicableTo: ["treatment-type"],
}
```

### To Change Scarcity Messages
Update `scarcity` field in discount objects:
- "Limited time offer"
- "New patient special"
- "Book within 48 hours"
- "First 10 patients only"
- "This week only"

---

## 📊 Analytics Tracking

The system tracks:
- `discount_viewed` - When user views discount details
- `discount_redeemed` - When user redeems discount
- `discount_redeemed_and_booking_started` - When user redeems and starts booking

---

## 🎯 Best Practices

1. **Scarcity**: Use time-limited or quantity-limited messaging
2. **Personalization**: Show relevant discounts based on user selections
3. **Visibility**: Display discounts at key decision points
4. **Clarity**: Make discount terms clear and easy to understand
5. **Urgency**: Use action-oriented language ("Redeem Now", "Limited Time")

---

## 🧪 Testing Different Discount Strategies

### Experiment 1: Higher Value Discount
- Change `firstConsultation.amount` to `75` or `100`
- Update scarcity to "First consultation special"

### Experiment 2: Percentage-Based
- Change `type: "dollars"` to `type: "percent"`
- Update `amount` to percentage (e.g., `15` for 15% off)

### Experiment 3: Multiple Discounts
- Show different discounts for different treatment categories
- Create tiered discounts (e.g., $50 for single, $100 for multiple)

### Experiment 4: Time-Sensitive
- Add countdown timer to discount offers
- Show "Expires in X hours" messaging

---

## 💡 Future Enhancements

1. **Email Capture**: Require email to unlock discount
2. **Social Sharing**: "Share to unlock additional discount"
3. **Referral Discounts**: "Refer a friend, both get $50 off"
4. **Seasonal Offers**: Holiday-specific discounts
5. **Loyalty Discounts**: Returning patient discounts

---

*This discount system is designed to convert medium-intent users by providing clear value and creating urgency through scarcity messaging.*








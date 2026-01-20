# Offer Claim Setup Guide

## Overview

The consultation form has been converted to an "Offer Claim" form that allows users to claim a $50 off offer by entering their email address.

## Changes Made

### 1. Form Simplification
- **Removed fields**: Name, Phone, Message
- **Kept field**: Email only
- **New title**: "Claim Your $50 Off Offer"
- **New button**: "Claim $50 Off"

### 2. Airtable Integration
- Added "Offer Claimed" field to both "Web Popup Leads" and "Patients" tables
- When offer is claimed, sets `Offer Claimed = true` in Airtable
- Source is set to "Offer Claim"

### 3. Dashboard Display
- Shows "✓ Offer Claimed" badge in the leads table (green badge)
- Shows offer status section in lead detail modal
- Displays redemption terms in confirmation screen

### 4. Email Sending
- Currently logs the email action (check browser console)
- Email sending needs to be integrated with your email service

## Airtable Setup Required

### Add "Offer Claimed" Field

**For both "Web Popup Leads" and "Patients" tables:**

- **Field Name**: `Offer Claimed`
- **Field Type**: Checkbox
- **Default**: Unchecked (false)
- **Description**: Tracks whether the user has claimed the $50 off offer

## Email Integration

### Current Status
The code currently logs the email action but doesn't actually send emails. You have several options:

### Option 1: Airtable Automation (Recommended)
1. Create an Airtable automation that triggers when "Offer Claimed" = true
2. Use Airtable's email action to send the offer email
3. Include the redemption terms in the email template

### Option 2: Email Service API
Integrate with an email service (SendGrid, Mailgun, etc.):

1. Update the `sendOfferEmail` function in `ConsultationModal.tsx`
2. Add your email API endpoint
3. Send email with offer details and redemption terms

### Option 3: Webhook
1. Set up a webhook endpoint
2. Call it from the `sendOfferEmail` function
3. Webhook sends the email via your email service

## Email Content Template

The email should include:

**Subject**: Your $50 Off Offer from [Practice Name]

**Body**:
- Congratulations! You've claimed your $50 off offer
- Offer code (if applicable)
- Redemption terms (bullet points):
  - Offer valid for new patients only
  - Must be redeemed within 90 days of claim date
  - Cannot be combined with other offers or promotions
  - Valid for services over $200
  - One offer per person
  - Subject to provider availability

## Redemption Terms Displayed

The confirmation screen shows these terms:
- Offer valid for new patients only
- Must be redeemed within 90 days of claim date
- Cannot be combined with other offers or promotions
- Valid for services over $200
- One offer per person
- Subject to provider availability

## Dashboard Features

### Lead Table
- Shows "✓ Offer Claimed" badge (green) in the Facial Analysis Status column
- Badge appears below the facial analysis status if present

### Lead Detail Modal
- Shows "Offer Status" section when offer is claimed
- Displays green success box with offer confirmation
- Shows email address where offer was sent

## Testing

1. Open the consultation/offer modal
2. Enter an email address
3. Click "Claim $50 Off"
4. Verify:
   - Confirmation screen shows with redemption terms
   - Check browser console for email log
   - Check Airtable - "Offer Claimed" should be true
   - Check dashboard - should show "✓ Offer Claimed" badge

## Next Steps

1. Add "Offer Claimed" checkbox field to Airtable tables
2. Set up email sending (choose one of the options above)
3. Test the full flow end-to-end
4. Customize email template with your branding

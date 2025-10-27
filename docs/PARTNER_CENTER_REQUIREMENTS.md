# Partner Center Requirements for Azure Managed Application

**Source:** partner-center.pdf (6,684 pages, Microsoft Learn documentation)  
**Date Reviewed:** October 26, 2025

## Overview

To publish an Azure Managed Application offer to Microsoft Marketplace, you must configure it through Partner Center. This document summarizes the key requirements and what we currently have vs. what we need.

## Current Status ✅

### Files We Have
1. ✅ **mainTemplate.json** - ARM template defining resources
2. ✅ **createUiDefinition.json** - Portal UI wizard (fixed, ready for testing)
3. ✅ **viewDefinition.json** - Managed app custom views
4. ✅ **parameters.json** - Template parameters
5. ✅ **Nested templates** - storageAccount.json in nestedtemplates/

### What We've Fixed
- ✅ **createUiDefinition.json** restructured (no nested sections per Microsoft docs)
- ✅ Authentication fields split (password vs SSH)
- ✅ All 5 wizard steps designed (Basics, Networking, Extensions, Scaling, HA/DR)
- ✅ 46 outputs properly mapped
- ✅ Documentation strategy implemented

## Partner Center Publication Requirements

### 1. Program Enrollment (PREREQUISITE)

**Required Programs:**
- ✅ Microsoft AI Cloud Partner Program account
- ✅ Commercial Marketplace Program enrollment

**Reference:** Section 98150-98300 in PDF

### 2. Offer Setup

#### Offer Identity
- **Offer ID:** Unique identifier (50 chars max, lowercase alphanumeric + hyphens)
- **Offer Alias:** Internal name for your reference
- **Offer Type:** Azure Application (Managed App)

#### Properties & Categories
- **Categories:** Choose relevant marketplace categories (e.g., Compute, Networking, IT & Management Tools)
- **Industries:** Optional industry verticals (e.g., Healthcare, Financial Services)
- **Legal Terms:** Standard Contract or custom terms
- **Privacy Policy URL:** Required
- **Support URL:** Required

### 3. Offer Listing

#### Required Information
- **Name:** Display name in marketplace (50 chars max)
- **Search Results Summary:** 100 chars max
- **Short Description:** 256 chars max
- **Description:** Detailed HTML description (3,000 chars max)
- **Getting Started Instructions:** Help customers deploy and use
- **Search Keywords:** Up to 3 keywords for SEO

#### Required Media Assets
- **Logo (216x216 px):** PNG format, required
- **Logo (48x48 px):** PNG format, required  
- **Screenshots:** 1-5 images (1280x720 px)
- **Videos:** Optional (YouTube/Vimeo links)
- **Documents:** User guides, datasheets (PDF format)

#### Support Contacts
- **Engineering Contact:** Name, email, phone
- **Support Contact:** Name, email, phone
- **CSP Program Contact:** If reselling through CSP

### 4. Preview Audience

Configure Azure Subscription IDs for users who can preview before going live:
- Manually add subscription IDs
- Or upload CSV file
- Can add descriptions for each subscription
- Maximum 10 preview subscriptions

**Format:**
```csv
Type,ID,Description
SubscriptionID,aaaabbbb-0000-cccc-1111-dddd2222eeee,Internal Testing Team
SubscriptionID,11112222-aaaa-bbbb-cccc-333344445555,Beta Customer 1
```

### 5. Technical Configuration (Offer-Level)

#### For Metered Billing (If Using Custom Meters)
- **Microsoft Entra Tenant ID:** Directory ID for authentication
- **Microsoft Entra Application ID:** App registration ID
- **Authentication Key:** App secret for API calls

**Purpose:** Validates connection for Marketplace metering service APIs

**Required only if:** Managed app emits metering events for usage-based billing

#### Customer Usage Attribution (Recommended)
- **Tracking GUID:** Register in Partner Center
- Must be added to mainTemplate.json as Microsoft.Resources/deployments resource
- Tracks Azure consumption from your solution

**Example:**
```json
{
  "apiVersion": "2020-06-01",
  "name": "pid-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "type": "Microsoft.Resources/deployments",
  "properties": {
    "mode": "Incremental",
    "template": {
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "resources": []
    }
  }
}
```

### 6. Plans (At Least One Required)

#### Plan Identity
- **Plan ID:** Unique within offer (50 chars max, lowercase alphanumeric + hyphens + underscores)
- **Plan Name:** Display name (200 chars max)
- **Plan Type:** 
  - **Solution Template** (not transactable, customer-managed)
  - **Managed Application** (transactable, publisher or customer-managed) ✅ OUR CHOICE

#### Plan Setup
- **Azure Regions:** 
  - ✅ Azure Global (public cloud)
  - Azure Government (optional)
- **Reuse Technical Configuration:** If multiple plans share same templates

#### Plan Listing
- **Plan Name:** 200 chars max
- **Plan Summary:** 100 chars max  
- **Plan Description:** 3,000 chars max (explain what makes this plan unique)

#### Pricing and Availability

**For Managed Applications:**
- **Markets:** Select countries/regions (minimum 1, recommend all "Tax Remitted" markets)
- **Plan Visibility:**
  - **Public:** Anyone can see and purchase
  - **Private:** Only specific Azure subscriptions can see (up to 45 private plans per offer)

**Pricing Models:**
- **Free:** No charge
- **BYOL (Bring Your Own License):** Customer has existing license
- **Flat Rate:** Monthly subscription fee
- **Per User:** Monthly fee per user (requires custom meters)
- **Custom Meters:** Usage-based billing via Marketplace metering service APIs

**Our Recommendation:** Start with **Flat Rate** monthly pricing for simplicity

#### Deployment Package (CRITICAL!)

**Package Requirements:**
1. **File Format:** .zip archive
2. **Maximum Size:** 100 MB
3. **Required Files in Root:**
   - ✅ `mainTemplate.json` (ARM template)
   - ✅ `createUiDefinition.json` (Portal UI definition)
4. **Optional Files:**
   - `viewDefinition.json` (Custom managed app views) ✅ WE HAVE THIS
   - Nested templates in subfolder ✅ WE HAVE THIS
5. **Forbidden Content:**
   - ❌ No binaries (VM images, executables)
   - ❌ No secrets/passwords
   - All VM images must reference Marketplace images

**Package Structure:**
```
app.zip
├── mainTemplate.json           ✅ HAVE
├── createUiDefinition.json     ✅ HAVE (ready for testing)
├── viewDefinition.json         ✅ HAVE
└── nestedtemplates/
    └── storageAccount.json     ✅ HAVE
```

**Validation:**
- Use ARM Template Test Toolkit before upload
- Portal Sandbox test before packaging
- Verify all element names unique
- Check all outputs reference valid elements

#### Azure Policy (Optional but Recommended)
- Assign Azure Policies to resources deployed in customer subscription
- **Use Cases:** 
  - Enforce tagging standards
  - Require diagnostic settings
  - Audit compliance
- **Policy SKU:** Standard required for audit policies
- Can add multiple policies per plan

### 7. Co-Sell with Microsoft (Optional, Highly Recommended)

**Benefits:**
- **Co-sell Ready Status:** Access to Microsoft sales teams
- **Azure IP Co-sell Eligible Status:** Required for MACC eligibility
- **Microsoft Preferred Solutions Badge:** Displayed on listing page

**Requirements:**
- Offer published live to Marketplace
- Detailed solution information
- Customer success stories
- Reference architecture diagrams
- **One-pager** (solution summary)
- **Pitch deck** (sales presentation)

**IP Co-sell Eligible Requirements:**
- Solution built on Azure
- Published to Marketplace
- Customer references
- Co-sell materials complete

### 8. MACC Eligibility (Azure Consumption Commitment)

**What is MACC:**
- Customers with Azure consumption commitments can use their commitment to purchase your offer
- Offers marked as "Azure benefit eligible" in portal
- Decrement customer's MACC for amounts invoiced

**Requirements:**
- Transactable offer (not solution template)
- Azure IP Co-sell Eligible status
- Published to Marketplace

**Our Status:** ⚠️ Need to achieve after going live

### 9. Certification & Publishing

#### Certification Process
Microsoft validates:
- ARM templates for errors
- createUiDefinition.json syntax
- No security vulnerabilities
- Proper resource naming
- Compliance with policies
- **Duration:** Typically 3-5 business days

#### Publishing Workflow
1. **Save Draft:** Save progress without submitting
2. **Preview:** Test with preview audience (configured subscription IDs)
3. **Publish:** Submit for certification
4. **Certification:** Microsoft review (3-5 days)
5. **Publisher Sign-off:** Approve after preview testing
6. **Go Live:** Available in Marketplace

#### Post-Publication
- Monitor adoption metrics in Partner Center Insights
- Respond to customer reviews
- Update offer as needed (re-certification required)
- Track earnings and payments

## What We're Missing for Publication

### Critical (Must Have)
1. ⚠️ **Partner Center Account:** Create and enroll in programs
2. ⚠️ **Offer Metadata:** Name, description, search keywords, categories
3. ⚠️ **Media Assets:** Logos (216x216, 48x48), screenshots, videos
4. ⚠️ **Support Contacts:** Engineering and support contact info
5. ⚠️ **Legal Documents:** Privacy policy URL, support URL
6. ⚠️ **Plan Details:** Pricing model, markets, visibility
7. ⚠️ **Package Upload:** Create .zip with validated files
8. ⚠️ **Preview Audience:** Azure subscription IDs for testing

### Recommended (Should Have)
1. 📋 **Customer Usage Attribution GUID:** Track consumption
2. 📋 **Co-sell Materials:** One-pager, pitch deck for Microsoft sales
3. 📋 **Azure Policy Assignments:** Enforce governance
4. 📋 **Multiple Plans:** Starter, Professional, Enterprise tiers
5. 📋 **Private Plans:** For specific customers with custom pricing

### Optional (Nice to Have)
1. ✨ **Metered Billing:** Usage-based pricing with custom meters
2. ✨ **Azure Government Support:** Deploy to government cloud
3. ✨ **CSP Program:** Resell through Cloud Solution Providers
4. ✨ **Multiple Language Support:** Localized descriptions

## Recommended Next Steps

### Phase 1: Portal Testing (Current)
1. ✅ Test createUiDefinition-production.json in Portal Sandbox
2. ✅ Verify all steps work correctly
3. ✅ Validate outputs
4. ✅ Fix any remaining issues

### Phase 2: Package Preparation
1. 📋 Validate mainTemplate.json with ARM Template Test Toolkit
2. 📋 Add customer usage attribution GUID to mainTemplate.json
3. 📋 Test viewDefinition.json in deployed managed app
4. 📋 Create .zip package with all files
5. 📋 Verify package < 100 MB

### Phase 3: Partner Center Setup
1. 📋 Create Partner Center account (if not exists)
2. 📋 Enroll in Commercial Marketplace Program
3. 📋 Create new Azure Application offer
4. 📋 Configure offer metadata (name, description, categories)
5. 📋 Upload media assets (logos, screenshots)
6. 📋 Add support contacts and legal URLs

### Phase 4: Plan Configuration
1. 📋 Create at least one managed application plan
2. 📋 Configure pricing (recommend flat rate monthly to start)
3. 📋 Select markets (all tax-remitted countries)
4. 📋 Upload deployment package (.zip)
5. 📋 Configure preview audience (test subscription IDs)

### Phase 5: Testing & Certification
1. 📋 Save draft and preview
2. 📋 Deploy from preview in test subscription
3. 📋 Verify all resources created correctly
4. 📋 Test managed app views
5. 📋 Submit for certification

### Phase 6: Go Live
1. 📋 Microsoft certification review (3-5 days)
2. 📋 Publisher sign-off after preview testing
3. 📋 Publish to live marketplace
4. 📋 Monitor adoption and customer feedback

### Phase 7: Post-Launch Optimization
1. 📋 Apply for Co-sell Ready status
2. 📋 Apply for Azure IP Co-sell Eligible status (for MACC)
3. 📋 Create additional plans (tiered pricing)
4. 📋 Add metered billing for usage-based scenarios
5. 📋 Respond to customer reviews and iterate

## Key Partner Center Documentation Sections

From the PDF (partner-center.pdf, 6,684 pages):

- **Page 98150-98300:** Plan an Azure Application offer
- **Page 98162-98169:** Create an Azure Application offer process
- **Page 98216:** Mastering Managed application offers
- **Page 98229:** Test and publish workflow
- **Deployment Package:** Sections on mainTemplate.json, createUiDefinition.json requirements
- **Technical Configuration:** Metered billing setup, Azure AD authentication
- **Customer Usage Attribution:** GUID tracking for consumption

## Pricing Considerations

### Flat Rate (Recommended for Launch)
- Simple monthly subscription
- Example: $99/month, $499/month, $999/month
- Easy for customers to understand
- No complex metering infrastructure needed

### Per User Pricing
- Monthly fee per active user
- Requires custom meter implementation
- Marketplace metering service API integration
- More complex but scales with customer usage

### BYOL (Bring Your Own License)
- Customer purchases license directly from you
- Deploys through Marketplace but billing outside
- Good for on-premises to cloud migration
- Not transactable through Microsoft

### Free + Optional Paid Features
- Core functionality free
- Premium features require payment
- Can use custom meters for premium features
- Good for initial adoption

## Important Notes

1. **No Dynamic Element Types:** createUiDefinition.json cannot use `[if(...)]` in element type - we fixed this ✅
2. **No Nested Sections:** Microsoft.Common.Section cannot contain other Sections - we fixed this ✅
3. **Package Size Limit:** 100 MB maximum for .zip file
4. **Certification Time:** Plan for 3-5 business days review
5. **Preview Testing:** Use preview audience to validate before going live
6. **Updates Require Re-certification:** Any changes trigger new certification review
7. **Private Plans Limit:** Maximum 45 private plans per offer
8. **MACC Eligibility:** Requires Azure IP Co-sell Eligible status first

## Resources

- **Partner Center Portal:** https://partner.microsoft.com/dashboard/commercial-marketplace/overview
- **Documentation:** https://learn.microsoft.com/en-us/partner-center/
- **ARM Template Test Toolkit:** https://github.com/Azure/arm-ttk
- **Marketplace Support:** Create support ticket in Partner Center
- **Community Forum:** https://partner.microsoft.com/community

---

**Status:** Ready for technical package validation and Partner Center setup  
**Next Action:** Test createUiDefinition-production.json in Portal Sandbox, then proceed to package creation  
**Blockers:** None technical - need Partner Center account and offer metadata

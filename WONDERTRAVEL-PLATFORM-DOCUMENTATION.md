# WONDERTRAVEL — India Intercity Cab Platform
## Complete Platform Documentation & Code Guide

**Platform Name**: WonderTravel  
**Operating routes**: Pan-India pickups and destinations, with enhanced Uttarakhand coverage
**Operations started**: 2026  
**Service**: Driver-operated intercity cab bookings  
**Tech Stack**: React, Redux Toolkit, Node.js, Express and MongoDB  
**Status**: Active development and deployment  

---

## 📑 TABLE OF CONTENTS

1. [Platform Overview](#platform-overview)
2. [Pages Included](#pages-included)
3. [Design System](#design-system)
4. [Feature Breakdown](#feature-breakdown)
5. [User Flows](#user-flows)
6. [Implementation Guide](#implementation-guide)
7. [File Structure](#file-structure)
8. [Customization Guide](#customization-guide)
9. [Deployment](#deployment)

---

## 🎯 PLATFORM OVERVIEW

### Mission
Provide clear route, vehicle and fare information for intercity cab bookings across India.

### Key Features
- ✅ Search and book listed routes
- ✅ Itemized fare estimate
- ✅ Multiple vehicle options
- ✅ Driver details confirmed before pickup
- ✅ WhatsApp and phone contact options
- ✅ Responsive design (mobile-first)

---

## 📄 PAGES INCLUDED

### Page 1: Landing Page (`luxe-cabs.html`)
**Purpose**: Attract users, explain value, enable first booking  
**Sections**:
1. **Navigation Bar** - Fixed, blur effect, sticky on scroll
2. **Hero Section** - Hero image (car emoji), booking widget with full form
3. **Why Us** - Verifiable service, support, fare and route information
4. **Fleet** - 4 car types with specs and pricing
5. **Guest Feedback** - Moderated reviews submitted through the live feedback workflow
6. **Partner Section** - Fleet owners & drivers recruitment
7. **Footer** - Links, social, contact info
8. **Floating CTAs** - WhatsApp & phone buttons

**Key Interactions**:
- Smooth scroll navigation
- Booking widget with mode toggle (With driver active / Group travel locked as "Coming soon")
- Trip type tabs (One way/Round trip/Outstation)
- Working date/time pickers
- Scroll-reveal animations

**Target Users**: First-time visitors, people researching luxury cabs

---

### Page 2: Cab Search Results (`luxe-cabs-results.html`)
**Purpose**: Show available cabs, prices, and allow detailed comparison  
**Sections**:
1. **Navigation** - Same as landing
2. **Page Header** - "Choose your ride" with descriptor
3. **Trip Bar** - Pickup (Dehradun Airport) → Destination (Mussoorie), date, time, distance, edit button
4. **Fare Notice** - "Estimated fare — exact price after team confirms"
5. **Sort Filters** - Recommended / Price low-to-high / Seats
6. **Cab Cards** - 4 tiers with:
   - Vehicle SVG image
   - Tier name ("Comfort Sedan", "SUV · Hill Ready", "Innova", "Innova Crysta")
   - Rate note: "Outstation flat rate · incl. 5% GST"
   - Spec chips: Seats, Music, AC, Driver
   - Price display (₹5,009 - ₹7,140)
   - "View fare breakup" toggle (slides open detailed breakdown)
   - "Check availability" button
7. **Help Strip** - "Not sure which cab? Talk to our team"
8. **Floating CTAs** - WhatsApp & phone

**Key Interactions**:
- Fare breakup toggle (click to expand/collapse)
- Live sorting (click chip to reorder cards)
- Responsive grid (desktop 3-column → mobile 1-column)
- "Top Rated" badge on first card
- Hover lift animations

**Target Users**: Users who've filled booking form, comparing options

---

### Page 3: Booking Confirmation (BUILD FROM HERE)
**Purpose**: Finalize booking, show driver details, enable payment  
**Will Include**:
- Trip summary (pickup, drop, distance, time)
- Final fare with itemized breakdown
- Driver profile (photo, name, rating, vehicle details)
- Payment options (Credit/Debit, UPI, Wallet)
- Receipt/booking reference
- Support chat widget

---

### Page 4: Account Dashboard (BUILD FROM HERE)
**Purpose**: Manage bookings, view history, profile settings  
**Will Include**:
- Active booking card
- Booking history (past trips)
- Saved addresses
- Payment methods
- Profile settings
- Support tickets

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary Background:     #0B0F14  (Deep slate)
Secondary BG:           #10161D  (Lighter slate)
Panel BG:               #141B24  (Card background)
Panel 2:                #1A2530  (Hover panel)

Text Primary:           #F3F1EC  (Off-white)
Text Mute:              #9BA6B2  (Gray-blue)
Text Dim:               #6B7683  (Darker gray)

Accent (Primary):       #F26B1D  (Warm ember/orange)
Accent 2:               #FF8A3D  (Lighter ember)
Secondary Accent:       #D8B678  (Champagne gold)
Secondary Dark:         #A8895A  (Gold-dim)

Success:                #2FBF71  (Green)

Border (Hairline):      rgba(255,255,255,.08)
Border (Strong):        rgba(255,255,255,.14)

Shadows:                0 30px 80px -20px rgba(0,0,0,.7)
```

### Typography
```
Display Font:           Cormorant Garamond (serif)
                        - Headlines (H1, H2, H3)
                        - Italic for emphasis
                        - Weight: 500, 600, 700

Body Font:              Inter (sans-serif)
                        - All body copy, labels, buttons
                        - Weight: 400, 500, 600, 700

Eyebrow:                Inter 12px, 600, letter-spacing .22em, uppercase, color: gold
```

### Spacing Scale
```
Padding/Margin:         8px, 12px, 14px, 16px, 18px, 20px, 22px, 26px, 30px, 36px, 40px
                        Plus: 80px, 118px, 130px for section padding

Grid Gaps:              8px, 12px, 14px, 16px, 18px, 20px, 24px, 26px, 34px
```

### Border Radius
```
Hairline:               4px (tiny elements)
Buttons/inputs:         999px (pill-shaped)
Cards:                  14px, 16px, 18px, 20px, 22px, 24px
Default (var):          18px
```

### Shadows
```
Card Hover:             0 12px 30px -6px rgba(0,0,0,.6)
Box Shadow:             0 10px 30px -8px rgba(242,107,29,.5) [ember]
Major:                  var(--shadow) = 0 30px 80px -20px rgba(0,0,0,.7)
```

---

## 🎯 FEATURE BREAKDOWN

### 1. Booking Widget (Landing Page)

**Elements**:
- Mode toggle: With driver active / Group travel disabled with lock and "Coming soon" badge
- Trip type tabs: One way / Round trip / Outstation
- Fields:
  - Pickup location (icon + searchable input) — default: "Dehradun Airport · Jolly Grant (DED)"
  - Date picker (calendar icon)
  - Time picker (clock icon)
  - Destination (pin icon) — hint: "Mussoorie, Nainital, Rishikesh…"
- CTA: "Find my driver" (ember gradient button)

**Behavior**:
- Mode toggle visually switches selected mode
- Trip tabs underline active choice
- Date/time inputs focus to native pickers
- All fields have placeholder hints
- Button on hover: translateY(-2px), enhanced shadow

---

### 2. Trip Bar (Results Page)

**Elements**:
- From: Green pin + "Dehradun · Jolly Grant Airport (DED)"
- To: Ember pin + "Mussoorie, Uttarakhand, India"
- Date/Time: "Jul 23, 2026 · 12:00 PM"
- Trip Type: "One Way · 35 km"
- Edit button: Pencil icon in circle

**Styling**:
- Background: Gradient panel with slight transparency
- Bottom border: 2px green line
- Responsive: Wraps on mobile, stacks vertically

---

### 3. Cab Card with Fare Breakup

**Static Elements**:
- Car SVG image (160-210px width)
- Tier name (e.g., "Innova Crysta")
- "Outstation flat rate · incl. 5% GST" (small note)
- Specs (4 chips): Seats, Music, AC, Driver
- Price: Large ₹ amount + "inc. GST & bata" subtitle
- Button: "Check availability"

**Interactive Fare Breakup**:
- Default: Hidden (max-height: 0)
- Click "View fare breakup" → Slide down
- Shows:
  - Base fare: ₹X
  - Driver bata: ₹X
  - Toll & state permit: ₹X
  - GST (5%): ₹X
  - **Total payable: ₹X** (bold, slightly larger)
- Icon rotates 180° when open

**Breakup Data** (Examples):

| Tier | Base Fare | Bata | Toll | GST | Total |
|------|-----------|------|------|-----|-------|
| Comfort Sedan | ₹4,300 | ₹300 | ₹150 | ₹239 | ₹5,009 |
| SUV | ₹4,900 | ₹350 | ₹150 | ₹270 | ₹5,670 |
| Innova | ₹5,600 | ₹400 | ₹150 | ₹308 | ₹6,458 |
| Innova Crysta | ₹6,200 | ₹450 | ₹150 | ₹340 | ₹7,140 |

---

### 4. Fleet Tiers

**Landing Page Tiers** (Why Us section):
1. **Luxury** — 4-seater, ₹45/km, special occasions
2. **Traveller** — 10-26 seaters, ₹22/km, group tours
3. **Sedan** — 4-seater, ₹15/km, city/airport
4. **SUV** — 6-seater, ₹19/km, family journeys

**Results Page Tiers** (Flat Rates):
1. **Comfort Sedan** — ₹5,009 (Dehradun → Mussoorie, 35km)
2. **SUV · Hill Ready** — ₹5,670
3. **Innova** — ₹6,458
4. **Innova Crysta** — ₹7,140

*Note*: Flat rates are outstation (fixed per route). City rates (landing) use per-km pricing.

---

### 5. Navigation

**Fixed Top Bar**:
- Logo: "WonderTravel" with glowing dot (Cormorant, serif)
- Links: Home, About, Fleet, Tours, Support
- CTA: "Sign in" (ghost button) + "Book a ride" (gold gradient)
- Scroll effect: Nav background + shadow on scroll > 30px

---

### 6. Testimonials (Landing)

**Published feedback**:
- Submitted by a guest through the app
- Requires consent to publish
- Appears only after moderation
- Shows no placeholder reviews when the approved list is empty

---

## 🔄 USER FLOWS

### Flow 1: First-Time Booking (Landing → Results → Booking → Confirmation)

```
1. User lands on homepage
2. Sees hero, scrolls through Why Us / Fleet / Testimonials
3. Fills booking widget:
   - Mode: "With driver"
   - Trip: "One way"
   - Pickup: "Dehradun Airport"
   - Date: "Jul 23, 2026"
   - Time: "12:00 PM"
   - Destination: "Mussoorie"
4. Clicks "Find my driver"
   → Navigates to results page
5. Views 4 cab options with prices
6. Reads fare breakup on one card
7. Clicks "Check availability"
   → Goes to booking confirmation page
8. Enters passenger details, selects payment
9. Confirms booking
   → Receives booking reference + driver details
```

---

### Flow 2: Repeat User (Dashboard)

```
1. Logs in to dashboard
2. Sees "Active Booking" card
3. Can cancel or edit booking
4. Views past trips in "Booking History"
5. Quick-rebook from history
6. Manages saved addresses
```

---

### Flow 3: Support Path

```
User clicks WhatsApp floating button
  → Opens chat with support team
  
OR
  
User calls phone button
  → Dials pre-set support number
  
OR
  
User clicks "Help" section on results page
  → "Talk to our team" button → Contact form or chat widget
```

---

## 🛠️ IMPLEMENTATION GUIDE

### Setup

1. **Create folder structure**:
```
meridian-cabs/
├── index.html              (Landing page)
├── search-results.html     (Cab listing)
├── booking.html            (Confirmation)
├── account.html            (Dashboard)
├── css/
│   └── shared-styles.css   (Optional: if extracting CSS)
├── js/
│   └── shared-script.js    (Optional: if extracting JS)
└── assets/
    └── (SVG icons, images)
```

2. **Shared CSS Variables** (already in each file):
All color, spacing, typography variables are defined in `:root` so you can change them site-wide.

3. **Navigation** (same on all pages):
Update `.nav-links a.on` to mark the current page.

---

### Page Integration

#### Landing → Results
```javascript
// In booking widget form:
document.querySelector('.book-cta').addEventListener('click', () => {
  const pickup = document.querySelector('[placeholder*="Dehradun"]').value;
  const destination = document.querySelector('[placeholder*="Mussoorie"]').value;
  const date = document.querySelector('input[type="date"]').value;
  const time = document.querySelector('input[type="time"]').value;
  
  // Build query params
  const params = new URLSearchParams({pickup, destination, date, time});
  window.location.href = `/search-results.html?${params}`;
});
```

#### Results → Booking
```javascript
// On "Check availability" button click:
document.querySelectorAll('.cab-price .btn-ember').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const cabTier = e.target.closest('.cab').querySelector('h3').textContent;
    const price = e.target.closest('.cab').querySelector('.price').textContent;
    
    window.location.href = `/booking.html?cab=${cabTier}&price=${price}`;
  });
});
```

---

### Customization Guide

#### Change Brand Name
Find & replace: `WonderTravel` → Your brand name  
Update logo text in all HTML files.

#### Change Location
- Hero eyebrow: "Driver-assisted intercity travel · Across India"
- Hero heading: "Into the hills, in comfort"
- Hero lede: Update city/mountain names
- Booking pickup: Update airport + distance
- Trip bar: Update route
- Testimonials: Update names, trip descriptions
- Footer: Update copyright location

#### Change Prices
Update in Results page cab cards:
```html
<div class="price"><span class="r">₹</span>5,009</div>
```

Update fare breakdown in each `.breakup-in`:
```html
<div class="brow"><span>Base fare · 35 km flat</span><span>₹4,300</span></div>
```

#### Change Colors
Edit `:root` CSS variables:
```css
--ember: #F26B1D;      /* Primary orange */
--gold: #D8B678;       /* Secondary accent */
--green: #2FBF71;      /* Success/trip start */
```

#### Add More Car Types
In Results page, copy a `.cab` div and update:
- SVG image (replace car drawing)
- h3 tier name
- specs (seats, music, AC, driver)
- prices & breakdown
- "Top Rated" badge (only on first)

---

## 📁 FILE STRUCTURE

### luxe-cabs.html (Landing Page)

**Sections**:
```
<nav>                          — Navigation bar
<section class="hero">         — Hero + booking widget
<section class="why">          — Why Us (4 features)
<section id="fleet">           — Fleet (4 car types)
<section id="testi">           — Testimonials (6 cards)
<section id="partner">         — Partner recruitment (2 cards)
<footer>                       — Footer + links
<div class="floats">           — WhatsApp + phone buttons
```

**Inline Styles**: All CSS is in `<style>` tag  
**Inline JS**: All JS is in `<script>` tag  

---

### luxe-cabs-results.html (Results Page)

**Sections**:
```
<nav>                          — Navigation bar
<div class="wrap">
  <div class="page-head">      — "Choose your ride" heading
  <div class="tripbar">        — Trip summary (route, date, distance)
  <div class="notice">         — "Estimated fare" info
  <div class="sortbar">        — "4 cabs available" + filter chips
  <div class="cablist">        — 4 .cab cards with fare breakup
  <div class="help">           — "Not sure?" help strip
</div>
<div class="floats">           — WhatsApp + phone buttons
```

---

## 🚀 DEPLOYMENT

### Option 1: Static Hosting (Recommended)

**Netlify** (Easiest):
1. Create account on netlify.com
2. Drag & drop HTML files
3. Auto-deploys and gives you a URL

**Vercel**:
1. Push files to GitHub
2. Connect GitHub repo on vercel.com
3. Auto-deploys on push

**GitHub Pages**:
1. Create repo on github.com
2. Push HTML files
3. Enable Pages in repo settings
4. Live at `yourusername.github.io/repo-name`

### Option 2: Traditional Server

**Using PHP/Node**:
```bash
# Node (http-server)
npm install -g http-server
http-server .

# Python
python -m http.server 8000

# Then visit localhost:8000
```

### Option 3: Domain Setup

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Point DNS to hosting provider
3. Enable SSL/HTTPS
4. Configure custom domain

---

## 🔗 EXTERNAL INTEGRATIONS (Ready to Add)

### 1. Payment Gateway
Add after booking confirmation:
- Stripe
- Razorpay (India-specific)
- PhonePe
- Google Pay

### 2. WhatsApp/Phone Floating Buttons
Already built in (`.floats` div). Add your actual numbers:
```html
<div class="float wa" onclick="window.open('https://wa.me/919675286699')">
<div class="float ph" onclick="window.location.href='tel:+919675286699'">
```

### 3. Chat Widget
Add Intercom, Drift, or Zendesk to support tickets.

### 4. Maps
Integrate Google Maps for:
- Pickup location search
- Route display

### 5. Database & Backend
The current Node.js, Express and MongoDB backend handles authentication, catalogue data, bookings and feedback. Payment processing, driver assignment and SMS notifications are not currently represented as completed features.

---

## ⚙️ TECHNICAL STACK SUMMARY

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Redux Toolkit + Next.js (App Router) | Component-based application, server-rendered metadata |
| Backend | Node.js + Express | REST API |
| Data | MongoDB | Application records |
| Fonts | Google Fonts (Cormorant + Inter) | Preloaded, self-hosted |
| Icons | Inline SVG | No icon fonts, crisp at all sizes |
| Images | SVG (cars) + emoji | Scalable, no asset load |
| Animations | CSS transitions + Motion | Interface transitions |
| Responsive | CSS Grid + Flexbox | Mobile-first layout |
| Accessibility | Semantic HTML, ARIA labels | Ongoing review |

---

## 📊 PERFORMANCE METRICS

Performance targets must be measured against each deployed version; this document does not claim unverified Lighthouse scores or bundle sizes.

---

## 🔒 SECURITY NOTES

Security controls must be checked against the deployed frontend, API configuration and hosting environment before each release.

---

## 📞 SUPPORT & MAINTENANCE

### Support Channels (Already Built In):
1. **WhatsApp button** — Direct message
2. **Phone button** — Call support
3. **Help section** (Results page) — "Talk to our team"
4. **Email** (in footer) — General inquiries

### Maintenance Checklist:
- [ ] Update testimonials monthly
- [ ] Review & adjust pricing quarterly
- [ ] Monitor Lighthouse scores
- [ ] Test on new devices/browsers
- [ ] Backup all files
- [ ] Check Google Analytics
- [ ] Respond to support tickets <4hrs

---

## 🎓 LEARNING RESOURCES

If you want to extend this platform:

1. **Add a Backend**: Use Node.js/Express, Python/Flask, or PHP
2. **Database**: PostgreSQL, MongoDB, or Firebase
3. **Authentication**: Firebase Auth or Auth0
4. **Payments**: Stripe, Razorpay, or Instamojo (India)
5. **Hosting**: Heroku, DigitalOcean, AWS, or Google Cloud
6. **Real-time**: Socket.io for live driver tracking

---

## 📝 CHANGE LOG

**v1.0** (July 2026)
- Landing page (booking widget + trust signals)
- Cab search results page (4 tiers + fare breakup)
- Responsive design (mobile-first)
- Uttarakhand-specific copy & routes
- Floating support buttons
- All inline CSS & JS (no dependencies)

---

## 💡 NEXT FEATURES (Roadmap)

- [ ] Booking confirmation & payment
- [ ] User dashboard & booking history
- [ ] Driver app with real-time tracking
- [ ] Admin panel (bookings, drivers, analytics)
- [ ] Push notifications
- [ ] Multiple languages (Hindi, Garhwali)
- [ ] Subscription plans (monthly passes)
- [ ] Referral program
- [ ] In-app chat with driver
- [ ] Scheduled bookings (future dates)

---

## 👨‍💻 DEVELOPER NOTES

### If Starting from Scratch:
1. Download all three HTML files
2. Open index.html in browser
3. Test on mobile (DevTools → Ctrl+Shift+M)
4. Customize colors in `:root`
5. Update copy for your location
6. Deploy to Netlify/Vercel

### Common Tweaks:
```css
/* Change primary color (ember) */
--ember: #FF6B35;

/* Change text color */
--ink: #FFFFFF;

/* Faster animations */
transition: all .15s;  /* instead of .28s */

/* Darker theme */
--bg: #000000;
--panel: #0A0A0A;
```

### Testing Checklist:
- [ ] Booking form submits
- [ ] Date/time pickers work
- [ ] Fare breakup toggles
- [ ] Cards sort by price
- [ ] Responsive at 375px, 768px, 1200px+
- [ ] Nav sticky on scroll
- [ ] Hover effects smooth
- [ ] Links navigate correctly
- [ ] Floating buttons clickable
- [ ] No console errors

---

## 📄 LICENSE & USAGE

This platform code is provided as-is for your WonderTravel cab business.
- ✅ Use commercially
- ✅ Customize freely
- ✅ Deploy anywhere
- ⚠️ Keep branding/copy accurate
- ⚠️ Test thoroughly before launch
- ⚠️ Add backend security before handling payments

---

## 📧 SUPPORT

For questions on:
- **Customization**: Edit the HTML directly, all CSS vars are at top
- **Deployment**: Use Netlify (easiest), Vercel (GitHub), or your server
- **Payments**: Research Razorpay (best for India), Stripe (international)
- **Scaling**: You'll need a backend (Node/Python/PHP) + database (PostgreSQL/MongoDB)

---

**Built with ❤️ for premium driver services across the Himalayas.**

*Last updated: July 2026*
# Email OTP and guest accounts

Bookings do not require login. When a guest supplies a valid email address, the API
creates or reuses a provisional customer profile and links the booking to it. The
guest can request a six-digit email code from the confirmation or login page. After
verification, the profile becomes active and all bookings for that customer are
available in **My trips**.

Email remains optional. A booking made without an email is confirmed normally, but
cannot be claimed through email OTP until an email is added.

Configure `RESEND_API_KEY`, `RESEND_FROM`, and `OTP_SECRET` in `server/.env`. Without
a Resend key, development mode prints the code in the server terminal and returns it
to the local interface. Production mode never exposes the code.

OTP protections:

- SHA-256 storage using a server secret; the plain code is not stored.
- Ten-minute expiry and single use.
- Maximum five verification attempts.
- One-minute resend cooldown and IP request limiting.

## Forgot-password flow

The `/forgot-password` screen uses a separate password-reset OTP purpose so a login
code can never be reused to change a password. The flow is:

1. Submit the account email.
2. Receive a six-digit reset code.
3. Enter the code and matching new password fields.
4. Invalidate all previous refresh sessions.
5. Issue a new session and open the customer account.

Responses do not reveal whether an email exists. Reset codes expire after ten
minutes, allow five attempts, and are stored only as salted server-side hashes.

Resend does not allow a Gmail address in `RESEND_FROM`. Verify a domain in the
Resend dashboard and use an address on that domain, such as
`WonderTravel <bookings@wondertravel.in>`. Development falls back to a visible test
code if delivery is not configured; production never exposes the code.

## Toast notifications

The React application has one global animated toaster for success, error and
informational feedback. API and network failures are converted to user-friendly
messages automatically. Original HTML pages send notification events to the parent
React application, giving booking validation and partner forms the same feedback
design.

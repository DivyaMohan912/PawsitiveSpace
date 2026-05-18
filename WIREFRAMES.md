# PawsitiveSpace - Screen Wireframes & UI Descriptions

## Design System

### Color Palette (Animal Welfare Theme)
- **Primary**: #4CAF50 (Calming Green - nature, trust, growth)
- **Secondary**: #2196F3 (Sky Blue - peace, compassion)
- **Accent**: #FF9800 (Warm Orange - urgency, action)
- **Success**: #8BC34A (Light Green)
- **Warning**: #FFC107 (Amber)
- **Error**: #F44336 (Red)
- **Background**: #FAFAFA (Off-white)
- **Surface**: #FFFFFF
- **Text Primary**: #212121
- **Text Secondary**: #757575

### Typography
- **Headers**: Poppins (Bold, friendly)
- **Body**: Roboto (Clean, readable)
- **Sizes**: 
  - H1: 28sp
  - H2: 24sp
  - H3: 20sp
  - Body: 16sp
  - Caption: 14sp

### Spacing
- Unit: 8dp
- Padding: 16dp (standard), 24dp (large)
- Margin: 8dp, 16dp, 24dp

### Icons
- Material Icons with custom animal-themed icons
- Paw print logo
- Outlined style for consistency

---

## Screen 1: Splash Screen

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│          🐾 PawsitiveSpace     │
│                                 │
│        [Animated paw logo]      │
│                                 │
│     Making a difference,        │
│     one paw at a time           │
│                                 │
│                                 │
│         Loading...              │
│          ▬▬▬▬▬                 │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- Animated paw print logo (fade in)
- App name with tagline
- Loading indicator
- Gradient background (green to blue)

---

## Screen 2: Onboarding Carousel (3 slides)

### Slide 1: Welcome
```
┌─────────────────────────────────┐
│                [Skip]           │
│                                 │
│        [Illustration:           │
│     People caring for animals]  │
│                                 │
│      Welcome to                 │
│      PawsitiveSpace!            │
│                                 │
│   Connect with a community      │
│   dedicated to animal welfare   │
│                                 │
│         ● ○ ○                   │
│                                 │
│         [Next →]                │
└─────────────────────────────────┘
```

### Slide 2: Features
```
┌─────────────────────────────────┐
│                [Skip]           │
│                                 │
│        [Illustration:           │
│      Map with rescue markers]   │
│                                 │
│      Rescue, Foster, Adopt      │
│                                 │
│   Report rescues, find foster   │
│   homes, and help animals       │
│   find forever families         │
│                                 │
│         ○ ● ○                   │
│                                 │
│         [Next →]                │
└─────────────────────────────────┘
```

### Slide 3: Community
```
┌─────────────────────────────────┐
│                                 │
│        [Illustration:           │
│     Heart with volunteers]      │
│                                 │
│      100% Volunteer-Driven      │
│                                 │
│   No fees, no ads, no profit.   │
│   Just people helping animals   │
│   with love and care.           │
│                                 │
│         ○ ○ ●                   │
│                                 │
│      [Get Started]              │
└─────────────────────────────────┘
```

---

## Screen 3: Registration/Login

```
┌─────────────────────────────────┐
│        [← Back]                 │
│                                 │
│         🐾                      │
│      Join PawsitiveSpace        │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📧 Email               │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📱 Phone (optional)    │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🔒 Password            │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │      Sign Up            │   │
│   └─────────────────────────┘   │
│                                 │
│        ─── OR ───               │
│                                 │
│   [🔵 Continue with Google]    │
│                                 │
│   Already have an account?      │
│          [Log In]               │
│                                 │
└─────────────────────────────────┘
```

**Features**:
- Email + password (primary)
- Phone optional (for SMS alerts)
- Google OAuth
- Simple validation
- Terms & privacy checkbox (not shown)

---

## Screen 4: Profile Setup

```
┌─────────────────────────────────┐
│  [← Back]    Setup Profile      │
├─────────────────────────────────┤
│                                 │
│        [📷 Add Photo]           │
│         (Circular)              │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Full Name              │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📍 City                │   │
│   └─────────────────────────┘   │
│                                 │
│   My Interests:                 │
│   ☑ Rescue   ☑ Fostering       │
│   ☑ Adoption ☐ Donations        │
│   ☐ Legal Help ☐ Volunteering  │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Short Bio              │   │
│   │ (Optional)             │   │
│   │                        │   │
│   └─────────────────────────┘   │
│                                 │
│   ☐ I'm a lawyer (optional)    │
│                                 │
│        [Complete Setup]         │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 5: Home Dashboard

```
┌─────────────────────────────────┐
│  [☰]  PawsitiveSpace    [🔔3]  │
├─────────────────────────────────┤
│  Hi, Sarah! 👋                  │
│  You've helped 12 animals 🐾    │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🚨 URGENT RESCUE         │  │
│  │  2 rescues near you need  │  │
│  │  immediate help!          │  │
│  │         [View Now →]      │  │
│  └───────────────────────────┘  │
│                                 │
│  Quick Actions                  │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🚑   │ │ 🏠   │ │ ❤️   │   │
│  │Report│ │Foster│ │Adopt │   │
│  │Rescue│ │      │ │      │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 💰   │ │ 📢   │ │ 👥   │   │
│  │Donate│ │Report│ │Events│   │
│  │      │ │Issue │ │      │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  Recent Activity  [See All →]  │
│  ┌───────────────────────────┐  │
│  │ 🐕 Max needs foster       │  │
│  │    Golden Retriever • 2y  │  │
│  │    📍 2.3 km away         │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💙 Bella was adopted!     │  │
│  │    Success story →        │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
   [🏠] [🗺️] [➕] [💬] [👤]
```

**Bottom Navigation**:
- Home (current)
- Map (rescues/animals)
- Quick Add (center, elevated)
- Community
- Profile

---

## Screen 6: Report Rescue

```
┌─────────────────────────────────┐
│  [✕]        Report Rescue       │
├─────────────────────────────────┤
│  🚨 Step 1 of 3                 │
│                                 │
│  [📷 Add Photos/Videos]         │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ [+] │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
│  Location                       │
│  ┌─────────────────────────┐   │
│  │ 📍 Use Current Location │   │
│  └─────────────────────────┘   │
│  [🗺️ Or select on map]        │
│                                 │
│  Description *                  │
│  ┌─────────────────────────┐   │
│  │ Injured dog on Main St  │   │
│  │ near the park...        │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Urgency Level *                │
│  ○ Low  ○ Medium                │
│  ● High  ○ Critical             │
│                                 │
│  Animal Type                    │
│  [Dropdown: Dog ▼]              │
│                                 │
│       [Cancel]  [Next →]        │
│                                 │
└─────────────────────────────────┘
```

### Step 2: Confirmation
```
┌─────────────────────────────────┐
│  [✕]        Report Rescue       │
├─────────────────────────────────┤
│  ✓ Step 2 of 3                  │
│                                 │
│  Review Your Report             │
│                                 │
│  [Photo preview]                │
│                                 │
│  📍 Location                    │
│  Main St & Park Ave, Brooklyn   │
│                                 │
│  🚨 Urgency: High               │
│  🐕 Animal: Dog                 │
│                                 │
│  📝 Description                 │
│  Injured dog on Main St near... │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ⚡ What happens next?          │
│                                 │
│  • Nearby verified rescuers     │
│    will be notified instantly   │
│                                 │
│  • You'll get updates when      │
│    someone responds             │
│                                 │
│  • The case appears on the      │
│    rescue map for visibility    │
│                                 │
│    [← Back]  [Submit Report]    │
│                                 │
└─────────────────────────────────┘
```

### Step 3: Success
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          ✓                      │
│      (Green checkmark)          │
│                                 │
│    Report Submitted!            │
│                                 │
│  We've notified 5 rescuers      │
│  within 5 km of the location.   │
│                                 │
│  You'll receive updates as      │
│  volunteers respond.            │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Track This Rescue     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Share on Community    │   │
│  └─────────────────────────┘   │
│                                 │
│        [Back to Home]           │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 7: Rescue Map View

```
┌─────────────────────────────────┐
│  [☰]   Active Rescues    [⚙️]  │
├─────────────────────────────────┤
│  [Search location...]           │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    📍 (You)               │  │
│  │                           │  │
│  │  🚨 🚨                    │  │
│  │        🚨                 │  │
│  │                 🚨        │  │
│  │                           │  │
│  │ [Google Maps View]        │  │
│  │                           │  │
│  │ Red: Critical             │  │
│  │ Orange: High              │  │
│  │ Yellow: Medium            │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [🎯 Center on Me]              │
│                                 │
│  ┌ Selected Rescue ──────────┐  │
│  │ 🐕 Injured Dog            │  │
│  │ 📍 0.8 km away            │  │
│  │ 🚨 Urgency: High          │  │
│  │                           │  │
│  │ "Small dog limping..."    │  │
│  │                           │  │
│  │ [View Details] [I Can Help]│ │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
   [🏠] [🗺️] [➕] [💬] [👤]
```

**Features**:
- Real-time markers for open rescues
- Color-coded by urgency
- Tap marker to see details
- Filter by urgency, animal type
- "I Can Help" quick action

---

## Screen 8: Rescue Details & Updates

```
┌─────────────────────────────────┐
│  [← Back]     Rescue #1234      │
├─────────────────────────────────┤
│  [Photo Gallery - swipeable]    │
│  [🖼️     🖼️     🖼️]           │
│                                 │
│  🚨 Status: EN ROUTE            │
│  Claimed by: Mike R. ⭐⭐⭐⭐⭐│
│                                 │
│  📍 Location                    │
│  Main St & Park Ave, Brooklyn   │
│  [📍 Get Directions]            │
│                                 │
│  🐕 Injured Dog (Estimated)     │
│  🚨 Urgency: High               │
│  📅 Reported: 25 mins ago       │
│  👤 By: Sarah K.                │
│                                 │
│  📝 Description                 │
│  Small brown dog, limping on    │
│  right front leg. Appears       │
│  friendly but scared. Near...   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  💬 Updates (Live)              │
│                                 │
│  [Mike R.] • 2 mins ago         │
│  "On my way, ETA 10 minutes"    │
│  👍 3                           │
│                                 │
│  [Sarah K.] • 15 mins ago       │
│  "Dog is still here, scared"    │
│                                 │
│  [System] • 25 mins ago         │
│  "Rescue reported"              │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✉️ Post Update          │   │
│  └─────────────────────────┘   │
│                                 │
│  Available Actions:             │
│  [🚗 I Can Help]  [📢 Share]   │
│                                 │
└─────────────────────────────────┘
```

**Features**:
- Live status updates
- Timeline of activities
- Volunteer who claimed it
- Location with directions
- Community can post updates
- Reactions (thumbs up)

---

## Screen 9: Foster/Adoption Listings

```
┌─────────────────────────────────┐
│  [← Back]   Animals Seeking     │
│             Foster Homes         │
├─────────────────────────────────┤
│  [Search: breed, age...]  [🔍]  │
│                                 │
│  Filters: [🎚️]                 │
│  ☐ Dogs  ☐ Cats  ☐ Other       │
│  Distance: [▬▬●▬▬] 10 km       │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Photo] 🐕                │  │
│  │ Max                       │  │
│  │ Golden Retriever • 2 yrs  │  │
│  │ Male • Medium             │  │
│  │ 📍 2.3 km away            │  │
│  │ ⏰ Needs: 2-4 weeks       │  │
│  │ [❤️ Foster]               │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Photo] 🐈                │  │
│  │ Luna                      │  │
│  │ Persian Cat • 1 yr        │  │
│  │ Female • Small            │  │
│  │ 📍 5.1 km away            │  │
│  │ ⏰ Long-term foster       │  │
│  │ [❤️ Foster]               │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Photo] 🐕                │  │
│  │ Buddy                     │  │
│  │ Labrador Mix • 5 yrs      │  │
│  │ Male • Large              │  │
│  │ 📍 3.7 km away            │  │
│  │ ⚕️ Special medical needs  │  │
│  │ [❤️ Foster]               │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
   [🏠] [🗺️] [➕] [💬] [👤]
```

---

## Screen 10: Animal Profile (Foster/Adoption)

```
┌─────────────────────────────────┐
│  [← Back]        [❤️ Save]      │
├─────────────────────────────────┤
│  [Photo Gallery - full width]   │
│  [Swipeable: 5 photos]          │
│  < ●●○○○ >                      │
│                                 │
│  Max 🐕                         │
│  Golden Retriever                │
│  ⭐⭐⭐⭐⭐ Perfect Match!      │
│                                 │
│  Quick Info                     │
│  🎂 Age: 2 years                │
│  ⚧ Gender: Male (neutered)     │
│  📏 Size: Medium (25 kg)        │
│  📍 Location: Brooklyn, NY      │
│                                 │
│  About Max                      │
│  Max is a friendly, energetic   │
│  golden retriever who loves     │
│  playing fetch and swimming.    │
│  He's great with kids and...    │
│  [Read more ▼]                  │
│                                 │
│  Temperament                    │
│  ✓ Friendly  ✓ Energetic        │
│  ✓ Good with kids               │
│  ✓ House-trained                │
│  ⚠️ Needs daily exercise        │
│                                 │
│  Medical Info                   │
│  • Vaccinated ✓                 │
│  • Microchipped ✓               │
│  • No ongoing conditions        │
│                                 │
│  Foster Needs                   │
│  Duration: 2-4 weeks            │
│  Requirements:                  │
│  • Medium-large yard            │
│  • Active household             │
│  • Experience preferred         │
│                                 │
│  Current Foster: John D. ⭐⭐⭐ │
│  [📱 Contact]                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Apply to Foster       │   │
│  └─────────────────────────┘   │
│                                 │
│  [📤 Share Max]                 │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 11: Donation Campaigns

```
┌─────────────────────────────────┐
│  [← Back]    Help Animals       │
├─────────────────────────────────┤
│  Active Campaigns               │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Image: Injured cat]      │  │
│  │                           │  │
│  │ 🏥 Emergency Surgery      │  │
│  │    for Whiskers           │  │
│  │                           │  │
│  │ $1,250 raised             │  │
│  │ ▓▓▓▓▓▓▓▓▓░░░ 62% of $2,000│  │
│  │                           │  │
│  │ 45 donors • 3 days left   │  │
│  │                           │  │
│  │ "Whiskers was hit by..."  │  │
│  │                           │  │
│  │ [💰 Donate] [📖 Details]  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Image: Dog shelter]      │  │
│  │                           │  │
│  │ 🏠 Winter Shelter Supplies│  │
│  │                           │  │
│  │ $780 raised               │  │
│  │ ▓▓▓▓▓░░░░░░░ 39% of $2,000│  │
│  │                           │  │
│  │ 23 donors • 12 days left  │  │
│  │                           │  │
│  │ "Help us prepare for..."  │  │
│  │                           │  │
│  │ [💰 Donate] [📖 Details]  │  │
│  └───────────────────────────┘  │
│                                 │
│  [+ Create Campaign]            │
│                                 │
│  ────────────────────────       │
│                                 │
│  In-Kind Donations              │
│  [🍖 Food] [🧸 Toys] [🛏️ Beds] │
│                                 │
└─────────────────────────────────┘
```

### Donation Detail Screen
```
┌─────────────────────────────────┐
│  [← Back]        [❤️ Save]      │
├─────────────────────────────────┤
│  [Hero Image]                   │
│                                 │
│  Emergency Surgery for Whiskers │
│                                 │
│  By Sarah K. ⭐⭐⭐⭐⭐        │
│  Verified volunteer             │
│                                 │
│  $1,250 raised of $2,000 goal   │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░ 62%        │
│                                 │
│  45 donors • 3 days left        │
│                                 │
│  ─────────────────────────      │
│                                 │
│  The Story                      │
│  Whiskers is a 3-year-old cat   │
│  who was hit by a car. She      │
│  needs emergency surgery...     │
│                                 │
│  Budget Breakdown               │
│  • Surgery: $1,200              │
│  • Medications: $400            │
│  • Post-op care: $400           │
│                                 │
│  Updates (3)                    │
│  [Sarah K.] • 1 day ago         │
│  "Surgery scheduled for..."     │
│  [View all updates →]           │
│                                 │
│  Recent Donors                  │
│  💙 Mike R. donated $50         │
│  💙 Anonymous donated $100      │
│  💙 Lisa M. donated $25         │
│  [See all 45 →]                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │      💰 Donate Now      │   │
│  └─────────────────────────┘   │
│                                 │
│  [📤 Share Campaign]            │
│                                 │
└─────────────────────────────────┘
```

### Donation Amount Screen
```
┌─────────────────────────────────┐
│  [✕]      Donate to Campaign    │
├─────────────────────────────────┤
│  Emergency Surgery for Whiskers │
│                                 │
│  Select Amount                  │
│                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │$10 │ │$25 │ │$50 │ │$100│   │
│  └────┘ └────┘ └────┘ └────┘   │
│                                 │
│  Custom Amount                  │
│  ┌─────────────────────────┐   │
│  │ $___                    │   │
│  └─────────────────────────┘   │
│                                 │
│  ☐ Make my donation anonymous  │
│                                 │
│  ☐ Add message for recipient   │
│                                 │
│  Payment Method                 │
│  ┌─────────────────────────┐   │
│  │ 💳 Credit/Debit Card    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🅿️ PayPal               │   │
│  └─────────────────────────┘   │
│                                 │
│  💡 100% goes to the cause      │
│  No fees charged by app         │
│                                 │
│  ┌─────────────────────────┐   │
│  │      Proceed to Pay     │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 12: Report Harassment

```
┌─────────────────────────────────┐
│  [✕]    Report Incident          │
├─────────────────────────────────┤
│  🛡️ Your safety and privacy are │
│     our priority                 │
│                                 │
│  ☑ Report anonymously           │
│                                 │
│  Incident Type *                │
│  ○ Verbal threat                │
│  ○ Physical harassment          │
│  ● Interference with feeding    │
│  ○ Legal threat                 │
│  ○ Other                        │
│                                 │
│  What happened? *               │
│  ┌─────────────────────────┐   │
│  │ A neighbor threatened   │   │
│  │ to call police on me    │   │
│  │ for feeding community   │   │
│  │ dogs...                 │   │
│  └─────────────────────────┘   │
│                                 │
│  When did this occur? *         │
│  [Date Picker: Dec 15, 2025]    │
│  [Time: 08:30 AM]               │
│                                 │
│  Location                       │
│  ┌─────────────────────────┐   │
│  │ 📍 Use Current Location │   │
│  └─────────────────────────┘   │
│                                 │
│  Evidence (optional)            │
│  [📷 Add Photos/Videos/Audio]   │
│                                 │
│  Severity                       │
│  ○ Minor  ● Moderate  ○ Severe  │
│                                 │
│  ⚠️ For emergencies, call 911   │
│                                 │
│      [Cancel]  [Submit Report]  │
│                                 │
└─────────────────────────────────┘
```

### After Submission
```
┌─────────────────────────────────┐
│                                 │
│          🛡️                     │
│                                 │
│    Report Received              │
│                                 │
│  Case #HAR-5678                 │
│                                 │
│  Your report has been sent to   │
│  our volunteer network. Here's  │
│  what happens next:             │
│                                 │
│  1. ✉️ Local volunteers will    │
│     review within 24 hours      │
│                                 │
│  2. 🤝 You may be contacted     │
│     for support/clarification   │
│                                 │
│  3. 📋 We'll suggest safe       │
│     actions and resources       │
│                                 │
│  4. ⚖️ If severe, we can help   │
│     connect with legal aid      │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Immediate Resources:           │
│                                 │
│  [📞 Local Helpline]            │
│  [⚖️ Legal Support]             │
│  [💬 Community Forum]           │
│                                 │
│  [Track My Report]              │
│  [Back to Home]                 │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 13: Legal Support Directory

```
┌─────────────────────────────────┐
│  [← Back]  Legal Support         │
├─────────────────────────────────┤
│  [Search expertise, language...] │
│                                 │
│  Volunteer Lawyers              │
│  All pro-bono services          │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 👨‍⚖️ David Chen, Esq.        │  │
│  │ ⭐⭐⭐⭐⭐ (12 cases)       │  │
│  │                           │  │
│  │ Specialties:              │  │
│  │ • Animal rights law       │  │
│  │ • Harassment cases        │  │
│  │                           │  │
│  │ 📍 Brooklyn, NY           │  │
│  │ 🗣️ English, Mandarin      │  │
│  │                           │  │
│  │ Available: Consultation   │  │
│  │                           │  │
│  │ [📞 Request Consultation] │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 👩‍⚖️ Maria Rodriguez, Esq. │  │
│  │ ⭐⭐⭐⭐⭐ (8 cases)        │  │
│  │                           │  │
│  │ Specialties:              │  │
│  │ • Pet custody disputes    │  │
│  │ • Anti-cruelty laws       │  │
│  │                           │  │
│  │ 📍 Queens, NY             │  │
│  │ 🗣️ English, Spanish       │  │
│  │                           │  │
│  │ Available: Pro-bono cases │  │
│  │                           │  │
│  │ [📞 Request Consultation] │  │
│  └───────────────────────────┘  │
│                                 │
│  ────────────────────────       │
│                                 │
│  Legal Resources                │
│  [📚 Animal Rights Laws]        │
│  [📝 Complaint Templates]       │
│  [🏛️ Government Contacts]      │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 14: Community Hub

```
┌─────────────────────────────────┐
│  [← Back]   Community            │
├─────────────────────────────────┤
│  [Tabs]                         │
│  [Forum] [Events] [Resources]   │
│  ▔▔▔▔▔▔                        │
│                                 │
│  [Search discussions...]        │
│                                 │
│  Popular Topics                 │
│  [# Tips] [# Success] [# Help]  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📌 Pinned                 │  │
│  │ Winter Care Tips for      │  │
│  │ Community Animals         │  │
│  │ By Admin • 156 💬 • 2.3k👁│  │
│  └───────────────────────────┘  │
│                                 │
│  Recent Discussions             │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Avatar] Sarah K.         │  │
│  │ ⭐⭐⭐⭐⭐              │  │
│  │                           │  │
│  │ 🎉 Success Story: Max     │  │
│  │    found his forever home!│  │
│  │                           │  │
│  │ [Photo of Max]            │  │
│  │                           │  │
│  │ "After 3 weeks of..."     │  │
│  │                           │  │
│  │ ❤️ 45  💬 12  🔗 Share    │  │
│  │ 2 hours ago               │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Avatar] Mike R.          │  │
│  │ ⭐⭐⭐⭐                 │  │
│  │                           │  │
│  │ 💡 Tip: Best way to       │  │
│  │    approach scared strays │  │
│  │                           │  │
│  │ "I've found that moving..."│  │
│  │                           │  │
│  │ 👍 23  💬 8  🔗 Share     │  │
│  │ 5 hours ago               │  │
│  └───────────────────────────┘  │
│                                 │
│  [+ New Post]                   │
│                                 │
└─────────────────────────────────┘
   [🏠] [🗺️] [➕] [💬] [👤]
```

### Events Tab
```
┌─────────────────────────────────┐
│  [← Back]   Community            │
├─────────────────────────────────┤
│  [Tabs]                         │
│  [Forum] [Events] [Resources]   │
│          ▔▔▔▔▔▔                │
│                                 │
│  [📅 Calendar View] [📋 List]   │
│                                 │
│  Upcoming Events                │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🏥 Free Spay/Neuter Drive │  │
│  │                           │  │
│  │ 📅 Saturday, Dec 28       │  │
│  │ ⏰ 9:00 AM - 4:00 PM      │  │
│  │ 📍 Brooklyn Community Ctr │  │
│  │                           │  │
│  │ 25 registered / 50 spots  │  │
│  │ ▓▓▓▓▓░░░░░ 50%           │  │
│  │                           │  │
│  │ Organizer: Sarah K. ⭐⭐⭐ │  │
│  │                           │  │
│  │ Volunteers needed:        │  │
│  │ • 2 Drivers               │  │
│  │ • 3 Admin helpers         │  │
│  │                           │  │
│  │ [✓ RSVP] [Volunteer]      │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🐕 Adoption Fair          │  │
│  │                           │  │
│  │ 📅 Sunday, Jan 5          │  │
│  │ ⏰ 11:00 AM - 5:00 PM     │  │
│  │ 📍 Central Park           │  │
│  │                           │  │
│  │ 15 animals • 40 volunteers│  │
│  │                           │  │
│  │ [View Details] [RSVP]     │  │
│  └───────────────────────────┘  │
│                                 │
│  [+ Create Event]               │
│                                 │
└─────────────────────────────────┘
```

---

## Screen 15: User Profile

```
┌─────────────────────────────────┐
│  [← Back]         [⚙️ Settings] │
├─────────────────────────────────┤
│       [Profile Photo]           │
│                                 │
│        Sarah K.                 │
│     ⭐⭐⭐⭐⭐ 4.9/5.0         │
│     Trust Score: 950            │
│                                 │
│     📍 Brooklyn, NY             │
│     🗓️ Volunteer since Jan 2024│
│                                 │
│  ┌─────────────────────────┐   │
│  │     [Edit Profile]      │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Impact This Month              │
│  ┌────────┐ ┌────────┐         │
│  │   8    │ │   12   │         │
│  │ Rescues│ │ Animals│         │
│  │ Helped │ │  Fed   │         │
│  └────────┘ └────────┘         │
│                                 │
│  Badges Earned (7)              │
│  🏆 🌟 ❤️ 🦸 🐾 🎖️ ⭐        │
│  [View All →]                   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  My Activity                    │
│                                 │
│  [Active Rescues (2)]           │
│  [Foster Applications (1)]      │
│  [Following (5 cases)]          │
│  [Donations ($250 total)]       │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Community Reviews (15)         │
│                                 │
│  ⭐⭐⭐⭐⭐ Mike R.             │
│  "Very reliable and caring..."  │
│                                 │
│  ⭐⭐⭐⭐⭐ Lisa M.             │
│  "Helped rescue 3 dogs..."      │
│                                 │
│  [See All Reviews →]            │
│                                 │
└─────────────────────────────────┘
   [🏠] [🗺️] [➕] [💬] [👤]
```

### Settings Screen
```
┌─────────────────────────────────┐
│  [← Back]      Settings          │
├─────────────────────────────────┤
│  Account                        │
│  ┌─────────────────────────┐   │
│  │ Edit Profile           >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Privacy Settings       >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Change Password        >│   │
│  └─────────────────────────┘   │
│                                 │
│  Notifications                  │
│  ┌─────────────────────────┐   │
│  │ Nearby Rescues     [ON]│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Donation Updates   [ON]│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Community Posts   [OFF]│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Event Reminders    [ON]│   │
│  └─────────────────────────┘   │
│                                 │
│  Preferences                    │
│  ┌─────────────────────────┐   │
│  │ Location Radius: 10 km >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Dark Mode         [OFF]│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Language: English      >│   │
│  └─────────────────────────┘   │
│                                 │
│  About                          │
│  ┌─────────────────────────┐   │
│  │ Help & Support         >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Privacy Policy         >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Terms of Service       >│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Version 1.0.0            │   │
│  └─────────────────────────┘   │
│                                 │
│  [🚪 Log Out]                   │
│                                 │
└─────────────────────────────────┘
```

---

## Accessibility Features

### Throughout All Screens:
1. **Voice Search**: Microphone icon in search bars
2. **Text-to-Speech**: For reading descriptions, updates
3. **Large Touch Targets**: Minimum 44x44dp for all buttons
4. **High Contrast Mode**: Available in settings
5. **Screen Reader Support**: All images have alt text
6. **Keyboard Navigation**: For web version

### Emergency Quick Access:
- Long-press app icon → Quick actions:
  - Report Rescue
  - Call Emergency Hotline
  - View Nearby Shelters

### Offline Indicators:
- Gray banner at top when offline: "📵 Offline - Data will sync when connected"

### Loading States:
- Skeleton screens for lists
- Shimmer effect while loading images
- Clear loading indicators

---

## UI Components Library

### Buttons
- **Primary**: Solid color, used for main actions
- **Secondary**: Outlined, used for secondary actions
- **Text Button**: For tertiary actions
- **FAB**: Floating action button (center of bottom nav)

### Cards
- **Elevated**: Shadow, for important content
- **Filled**: Subtle background, for lists
- **Outlined**: Border, for selections

### Inputs
- **Text Field**: Outlined with label
- **Dropdown**: Material dropdown with search
- **Chip**: For filters and tags
- **Slider**: For range selections (distance)

### Feedback
- **Snackbar**: Brief messages at bottom
- **Dialog**: Important confirmations
- **Bottom Sheet**: Additional options
- **Toast**: Success/error messages

### Navigation
- **Bottom Navigation**: 5 items max
- **Top App Bar**: With title and actions
- **Drawer**: Side menu for additional options
- **Tabs**: For categorized content

---

This completes the wireframe section with 15+ detailed screens covering all major features of PawsitiveSpace!

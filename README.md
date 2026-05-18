# PawsitiveSpace - Animal Welfare Platform

A non-profit, volunteer-driven mobile and web application connecting animal lovers to contribute to rescue operations, fostering, adoptions, donations, and community support.

## Project Overview

**Mission**: Create a trusted community platform for animal welfare that operates entirely on volunteer contributions with no fees, ads, or monetization.

**Core Principles**:
- 100% Non-profit and volunteer-driven
- Trust-based community with lightweight verification
- User-friendly and accessible design
- One-stop integrated platform

## Technology Stack

### Frontend
- **Mobile**: Flutter (iOS & Android from single codebase)
- **Web**: Flutter Web for admin dashboard
- **UI Framework**: Material Design 3 with custom animal welfare theme
- **State Management**: Riverpod
- **Local Storage**: Hive/SharedPreferences

### Backend
- **BaaS**: Supabase (PostgreSQL database, Authentication, Storage, Real-time subscriptions)
- **Advantages**: 
  - Free tier is generous for non-profits
  - Open-source (can self-host if needed)
  - Real-time capabilities for rescue updates
  - Built-in authentication and row-level security
  - No custom server needed (non-profit friendly)

### Integrations
- **Maps**: Google Maps API / OpenStreetMap (free alternative)
- **Video Calls**: Agora.io (10,000 free minutes/month) or Jitsi (open-source)
- **Payments**: Stripe Connect (non-profit rates) / PayPal Giving Fund (no fees)
- **Push Notifications**: Firebase Cloud Messaging (free)
- **Storage**: Supabase Storage for photos/videos

### Security & Compliance
- End-to-end encryption for sensitive reports
- GDPR-compliant data handling
- Row-level security policies in Supabase
- Anonymous reporting options

## Project Structure

```
PawsitiveSpace/
├── mobile_app/               # Flutter mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/          # Data models
│   │   ├── screens/         # UI screens
│   │   ├── widgets/         # Reusable components
│   │   ├── services/        # Backend services
│   │   ├── providers/       # State management
│   │   └── utils/           # Helpers and constants
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   └── pubspec.yaml
├── web_admin/               # Admin dashboard (Flutter Web)
├── backend/                 # Supabase configuration
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge functions
│   └── storage/             # Storage bucket policies
├── docs/                    # Documentation
│   ├── architecture.md
│   ├── wireframes/
│   └── user_guide.md
└── README.md
```

## Getting Started

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed development timeline and steps.

## License

Open-source for non-profit animal welfare use.

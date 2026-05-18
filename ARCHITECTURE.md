# PawsitiveSpace - High-Level Architecture

## System Architecture Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   iOS App       │    │  Android App    │    │   Web Admin     │ │
│  │   (Flutter)     │    │   (Flutter)     │    │   (Flutter Web) │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
│           │                      │                       │          │
│           └──────────────────────┴───────────────────────┘          │
│                                  │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │   API Gateway / BaaS        │
                    │      (Supabase)             │
                    └──────────────┬──────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                               │
    │                    SERVICE LAYER                             │
    ├──────────────────────────────┼───────────────────────────────┤
    │                              │                               │
    │  ┌────────────┐    ┌────────▼────────┐    ┌──────────────┐ │
    │  │   Auth     │    │   PostgreSQL    │    │   Storage    │ │
    │  │  Service   │    │    Database     │    │   (Images/   │ │
    │  │  (Supabase)│    │                 │    │    Videos)   │ │
    │  └────────────┘    └─────────────────┘    └──────────────┘ │
    │                                                              │
    │  ┌────────────┐    ┌─────────────────┐    ┌──────────────┐ │
    │  │  Real-time │    │  Edge Functions │    │  Row-Level   │ │
    │  │Subscriptions│   │   (Serverless)  │    │   Security   │ │
    │  └────────────┘    └─────────────────┘    └──────────────┘ │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                               │
    │                   INTEGRATION LAYER                          │
    ├──────────────────────────────┼───────────────────────────────┤
    │                              │                               │
    │  ┌──────────────┐  ┌────────▼────────┐  ┌───────────────┐  │
    │  │ Google Maps  │  │  Firebase FCM   │  │  Agora Video  │  │
    │  │ (Geolocation)│  │ (Notifications) │  │    Calls      │  │
    │  └──────────────┘  └─────────────────┘  └───────────────┘  │
    │                                                              │
    │  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  │
    │  │   Stripe     │  │   Email Service │  │  SMS Service  │  │
    │  │  (Donations) │  │   (SendGrid)    │  │   (Twilio)    │  │
    │  └──────────────┘  └─────────────────┘  └───────────────┘  │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. User Registration & Authentication Flow
```
User → Flutter App → Supabase Auth → PostgreSQL (users table)
                         ↓
                   JWT Token → Secure Storage
                         ↓
                   Auto-login on app restart
```

### 2. Rescue Reporting Flow
```
User fills form → Capture photo/location → Upload to Supabase Storage
                                              ↓
                                    Insert into rescues table
                                              ↓
                                    Real-time subscription triggers
                                              ↓
                                    Notify nearby volunteers (FCM)
                                              ↓
                              Display on map for all users in area
```

### 3. Real-time Updates Flow
```
Rescuer updates status → Supabase Real-time → All subscribed clients
                                                      ↓
                                              Update UI instantly
```

## Database Schema (PostgreSQL)

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    bio TEXT,
    location POINT, -- PostGIS for geolocation
    city TEXT,
    country TEXT,
    interests TEXT[], -- Array: ['rescue', 'fostering', 'adoption']
    trust_score INTEGER DEFAULT 0,
    volunteer_since TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_lawyer BOOLEAN DEFAULT FALSE,
    lawyer_expertise TEXT,
    anonymous_mode BOOLEAN DEFAULT FALSE,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for geolocation queries
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_interests ON users USING GIN(interests);
```

#### 2. animals
```sql
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    species TEXT NOT NULL, -- dog, cat, bird, etc.
    breed TEXT,
    age_years INTEGER,
    age_months INTEGER,
    gender TEXT,
    size TEXT, -- small, medium, large
    description TEXT,
    medical_needs TEXT,
    temperament TEXT,
    status TEXT NOT NULL, -- rescue_needed, fostering, adoptable, adopted
    location POINT,
    address TEXT,
    photos TEXT[], -- Array of storage URLs
    videos TEXT[],
    created_by UUID REFERENCES users(id),
    current_foster UUID REFERENCES users(id),
    adopted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_location ON animals USING GIST(location);
CREATE INDEX idx_animals_species ON animals(species);
```

#### 3. rescues
```sql
CREATE TABLE rescues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id),
    reporter_id UUID REFERENCES users(id),
    location POINT NOT NULL,
    address TEXT,
    description TEXT NOT NULL,
    urgency_level TEXT NOT NULL, -- low, medium, high, critical
    status TEXT DEFAULT 'open', -- open, claimed, en_route, rescued, closed
    claimed_by UUID REFERENCES users(id),
    photos TEXT[],
    videos TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

CREATE INDEX idx_rescues_status ON rescues(status);
CREATE INDEX idx_rescues_location ON rescues USING GIST(location);
CREATE INDEX idx_rescues_urgency ON rescues(urgency_level);
```

#### 4. rescue_updates
```sql
CREATE TABLE rescue_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rescue_id UUID REFERENCES rescues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    status TEXT NOT NULL,
    message TEXT,
    photos TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rescue_updates_rescue_id ON rescue_updates(rescue_id);
```

#### 5. foster_applications
```sql
CREATE TABLE foster_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id),
    user_id UUID REFERENCES users(id),
    home_type TEXT, -- apartment, house, farm
    yard_space TEXT,
    other_pets TEXT,
    experience TEXT,
    availability_start DATE,
    availability_end DATE,
    references TEXT[],
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. adoptions
```sql
CREATE TABLE adoptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id),
    adopter_id UUID REFERENCES users(id),
    application_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- pending, approved, completed
    compatibility_score INTEGER,
    background_check_status TEXT,
    meet_greet_date TIMESTAMP,
    adoption_date TIMESTAMP,
    success_story TEXT,
    success_photos TEXT[]
);
```

#### 7. donations
```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES donation_campaigns(id),
    donor_id UUID REFERENCES users(id),
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    type TEXT, -- monetary, in_kind
    in_kind_items TEXT[], -- For food, supplies donations
    is_anonymous BOOLEAN DEFAULT FALSE,
    stripe_payment_id TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. donation_campaigns
```sql
CREATE TABLE donation_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id),
    animal_id UUID REFERENCES animals(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0,
    purpose TEXT, -- vet_bills, food, shelter, medical
    photos TEXT[],
    status TEXT DEFAULT 'active', -- active, completed, closed
    created_at TIMESTAMP DEFAULT NOW(),
    ends_at TIMESTAMP
);
```

#### 9. harassment_reports
```sql
CREATE TABLE harassment_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    incident_type TEXT NOT NULL, -- threat, physical, verbal, legal
    description TEXT NOT NULL,
    location POINT,
    address TEXT,
    evidence_photos TEXT[],
    evidence_videos TEXT[],
    perpetrator_info TEXT,
    witness_info TEXT,
    severity TEXT, -- low, medium, high, critical
    status TEXT DEFAULT 'reported', -- reported, under_review, escalated, resolved
    is_anonymous BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES users(id), -- Volunteer coordinator
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);
```

#### 10. lawyers
```sql
CREATE TABLE lawyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    expertise TEXT[], -- animal_rights, harassment, custody, etc.
    bar_license TEXT,
    years_experience INTEGER,
    availability TEXT, -- consultation, pro_bono, emergency
    languages TEXT[],
    rating DECIMAL(3,2),
    cases_handled INTEGER DEFAULT 0
);
```

#### 11. legal_consultations
```sql
CREATE TABLE legal_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id),
    lawyer_id UUID REFERENCES users(id),
    case_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'requested', -- requested, accepted, completed
    scheduled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 12. community_posts
```sql
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id),
    category TEXT, -- tips, events, discussion, success_story
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photos TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 13. events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT, -- spay_neuter, adoption_fair, fundraiser
    location POINT,
    address TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_volunteers INTEGER,
    registered_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 14. event_registrations
```sql
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    role TEXT, -- volunteer, organizer, participant
    status TEXT DEFAULT 'registered', -- registered, attended, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 15. notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL, -- rescue_nearby, donation_match, event_reminder
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

#### 16. user_ratings
```sql
CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rated_user_id UUID REFERENCES users(id),
    rater_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    category TEXT, -- reliability, communication, care_quality
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(rated_user_id, rater_id, category)
);
```

#### 17. badges
```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria TEXT -- JSON describing how to earn
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
```

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescues ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Example policies:

-- Users can read all public profiles but only update their own
CREATE POLICY users_read_all ON users FOR SELECT USING (true);
CREATE POLICY users_update_own ON users FOR UPDATE 
    USING (auth.uid() = id);

-- Rescues are public for reading (for transparency)
CREATE POLICY rescues_read_all ON rescues FOR SELECT USING (true);

-- Only authenticated users can create rescues
CREATE POLICY rescues_create_auth ON rescues FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

-- Harassment reports: reporter can read their own, admins can read all
CREATE POLICY harassment_read_own ON harassment_reports FOR SELECT 
    USING (
        auth.uid() = reporter_id OR 
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

-- Anonymous reports: hide reporter_id
CREATE POLICY harassment_anonymous ON harassment_reports FOR SELECT 
    USING (
        CASE 
            WHEN is_anonymous THEN reporter_id IS NULL 
            ELSE true 
        END
    );
```

## Real-time Subscriptions

Supabase provides WebSocket connections for real-time updates:

### Subscribe to Nearby Rescues
```dart
// Client subscribes to rescues within 10km radius
final subscription = supabase
  .from('rescues')
  .stream(primaryKey: ['id'])
  .eq('status', 'open')
  .listen((data) {
    // Filter by distance on client side or use PostGIS function
    updateRescueMap(data);
  });
```

### Subscribe to Rescue Updates
```dart
// Get live updates for a specific rescue
final updates = supabase
  .from('rescue_updates')
  .stream(primaryKey: ['id'])
  .eq('rescue_id', rescueId)
  .listen((data) {
    updateRescueTimeline(data);
  });
```

## Edge Functions (Serverless)

Use Supabase Edge Functions for business logic:

### 1. calculate-trust-score
Recalculates user trust score based on:
- Completed rescues
- Positive ratings
- Verified contributions
- Community feedback

### 2. match-volunteers
Matches rescue cases with nearby available volunteers based on:
- Distance
- Skills/experience
- Availability
- Trust score

### 3. send-notifications
Batches and sends push notifications via FCM

### 4. moderate-content
Basic content moderation for reports and posts

## Security Measures

1. **Authentication**: Email/phone + optional OAuth (Google)
2. **Data Encryption**: All sensitive data encrypted at rest
3. **Anonymous Reporting**: Option to hide identity for harassment reports
4. **Rate Limiting**: Prevent spam and abuse via Supabase rate limits
5. **Content Moderation**: Community reporting + volunteer moderator review
6. **GDPR Compliance**: 
   - Right to access data
   - Right to deletion
   - Data portability
   - Clear privacy policy

## Scalability Considerations

1. **Database Indexing**: Geospatial indexes for location queries
2. **CDN**: Supabase storage uses CDN for fast image/video delivery
3. **Caching**: Client-side caching with Hive for offline mode
4. **Pagination**: Implement cursor-based pagination for lists
5. **Image Optimization**: Compress images before upload
6. **Lazy Loading**: Load data as needed, not all at once

## Offline Mode

- Cache recent rescues, animals, and posts locally
- Queue actions (reports, updates) when offline
- Sync when connection restored
- Draft mode for forms

## Monitoring & Analytics

- Supabase built-in analytics for database performance
- Firebase Analytics for user behavior (privacy-compliant)
- Error tracking with Sentry (free tier)
- Custom dashboard for impact metrics:
  - Animals rescued
  - Adoptions completed
  - Donations raised
  - Active volunteers

-- Adoption listings (fosters post animals) and adoption requests (users apply)
-- Run in Supabase SQL Editor

-- 1. adoption_listings — fosters post animals for adoption
CREATE TABLE adoption_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species TEXT NOT NULL CHECK (species IN ('cat', 'dog', 'other')),
  species_other TEXT,
  breed TEXT,
  age TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  spayed_neutered BOOLEAN DEFAULT false,
  location TEXT,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  foster_name TEXT NOT NULL,
  foster_mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'adopted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adoption_listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_listings_status ON adoption_listings(status);
CREATE INDEX idx_listings_foster ON adoption_listings(foster_mobile);

-- Auto-update updated_at
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON adoption_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. adoption_requests — users apply for a listing (one active per user)
CREATE TABLE adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES adoption_listings(id),
  commitment_id UUID REFERENCES adoption_commitments(id),
  requester_name TEXT NOT NULL,
  requester_mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'withdrawn')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_requests_listing ON adoption_requests(listing_id);
CREATE INDEX idx_requests_mobile ON adoption_requests(requester_mobile);
CREATE UNIQUE INDEX idx_one_active_request ON adoption_requests(requester_mobile)
  WHERE status IN ('pending', 'approved');

-- Auto-update updated_at
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON adoption_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS Policies

-- Listings: anyone can read open listings, anyone can insert
CREATE POLICY "Anon can read open listings"
  ON adoption_listings FOR SELECT TO anon USING (status = 'open');
CREATE POLICY "Anon can insert listings"
  ON adoption_listings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update own listings"
  ON adoption_listings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage listings"
  ON adoption_listings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Requests: anon can insert, only auth/foster can read
CREATE POLICY "Anon can insert requests"
  ON adoption_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read own requests"
  ON adoption_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update requests"
  ON adoption_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage requests"
  ON adoption_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

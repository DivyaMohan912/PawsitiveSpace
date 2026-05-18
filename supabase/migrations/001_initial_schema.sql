-- PawsitiveSpace Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE animal_status AS ENUM ('stray', 'rescued', 'fostered', 'adopted', 'deceased');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE volunteer_role AS ENUM ('rescuer', 'foster', 'transporter', 'admin');
CREATE TYPE adoption_status AS ENUM ('enquiry', 'application', 'approved', 'completed', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. reporters
CREATE TABLE reporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT UNIQUE NOT NULL,
  name TEXT,
  is_volunteer BOOLEAN DEFAULT FALSE,
  total_reports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp_number TEXT UNIQUE NOT NULL,
  email TEXT,
  role volunteer_role NOT NULL DEFAULT 'rescuer',
  is_active BOOLEAN DEFAULT TRUE,
  area_coverage TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. animals
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  species TEXT NOT NULL CHECK (species IN ('cat', 'dog', 'other')),
  breed TEXT,
  age_estimate TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  sterilized BOOLEAN DEFAULT FALSE,
  ear_tipped BOOLEAN DEFAULT FALSE,
  status animal_status NOT NULL DEFAULT 'stray',
  health_notes TEXT,
  temperament_notes TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_description TEXT,
  photos TEXT[] DEFAULT '{}',
  microchip_id TEXT,
  reported_by UUID REFERENCES reporters(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. rescue_cases
CREATE TABLE rescue_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  reported_by UUID NOT NULL REFERENCES reporters(id),
  status case_status NOT NULL DEFAULT 'open',
  case_notes TEXT,
  assigned_to UUID REFERENCES volunteers(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. adoptions
CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  adopter_name TEXT NOT NULL,
  adopter_whatsapp TEXT NOT NULL,
  adopter_email TEXT,
  status adoption_status NOT NULL DEFAULT 'enquiry',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. tnr_records
CREATE TABLE tnr_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  trap_date DATE,
  neuter_date DATE,
  return_date DATE,
  ear_tipped BOOLEAN DEFAULT FALSE,
  vet_name TEXT,
  vet_clinic TEXT,
  colony_location TEXT,
  managed_by UUID REFERENCES volunteers(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_reported_by ON animals(reported_by);
CREATE INDEX idx_rescue_cases_status ON rescue_cases(status);
CREATE INDEX idx_rescue_cases_reported_by ON rescue_cases(reported_by);
CREATE INDEX idx_reporters_whatsapp ON reporters(whatsapp_number);
CREATE INDEX idx_adoptions_animal ON adoptions(animal_id);
CREATE INDEX idx_tnr_animal ON tnr_records(animal_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_animals_updated_at
  BEFORE UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rescue_cases_updated_at
  BEFORE UPDATE ON rescue_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_adoptions_updated_at
  BEFORE UPDATE ON adoptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE reporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tnr_records ENABLE ROW LEVEL SECURITY;

-- Public read on animals that are adopted or rescued (for public-facing pages)
CREATE POLICY "Public read adopted/rescued animals"
  ON animals FOR SELECT
  USING (status IN ('adopted', 'rescued'));

-- Service role key bypasses RLS automatically.
-- These permissive policies allow the webhook (using service_role) to do everything,
-- while anon users can only read public animal data above.

-- Allow service_role full access (it bypasses RLS by default, but explicit for clarity)
-- No additional policies needed — service_role ignores RLS.

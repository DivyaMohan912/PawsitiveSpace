-- Adoption wishes — people request a *type* of animal that isn't listed yet
-- (e.g. "Lab pup", "Guinea pig"). Fosters see these for awareness.
-- Run in Supabase SQL Editor

CREATE TABLE adoption_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species TEXT NOT NULL CHECK (species IN ('cat', 'dog', 'other')),
  species_other TEXT,
  breed TEXT,
  age_preference TEXT,
  location TEXT,
  notes TEXT,
  requester_name TEXT NOT NULL,
  requester_mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adoption_wishes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_wishes_status ON adoption_wishes(status);
CREATE INDEX idx_wishes_species ON adoption_wishes(species);
CREATE INDEX idx_wishes_mobile ON adoption_wishes(requester_mobile);

-- Auto-update updated_at (function defined in 001_initial_schema.sql)
CREATE TRIGGER trg_wishes_updated_at
  BEFORE UPDATE ON adoption_wishes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: anyone can post a wish and read open wishes; auth can manage.
CREATE POLICY "Anon can insert wishes"
  ON adoption_wishes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read open wishes"
  ON adoption_wishes FOR SELECT TO anon USING (status = 'open');
CREATE POLICY "Auth can manage wishes"
  ON adoption_wishes FOR ALL TO authenticated USING (true) WITH CHECK (true);

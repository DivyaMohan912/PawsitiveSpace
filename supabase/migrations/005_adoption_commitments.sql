-- Adoption commitments, followups, flags, and status enum update
-- Run in Supabase SQL Editor

-- 1. Add 'flagged' to adoption_status enum
ALTER TYPE adoption_status ADD VALUE IF NOT EXISTS 'flagged';

-- 2. Add adopter_address to adoptions (needed for commitment form)
ALTER TABLE adoptions ADD COLUMN IF NOT EXISTS adopter_address TEXT;

-- 3. adoption_commitments table
CREATE TABLE adoption_commitments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adoption_id               UUID NOT NULL REFERENCES adoptions(id),
  adopter_name              TEXT NOT NULL,
  adopter_mobile            TEXT NOT NULL,
  id_type                   TEXT NOT NULL,
  id_last4                  TEXT NOT NULL CHECK (length(id_last4) = 4),
  signature_name            TEXT NOT NULL,
  signed_at                 TIMESTAMPTZ DEFAULT now(),
  ip_address                TEXT,
  user_agent                TEXT,
  form_version              TEXT DEFAULT '1.0',
  all_checkboxes_confirmed  BOOLEAN DEFAULT true,
  reference_id              TEXT UNIQUE NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adoption_commitments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_commitment_adoption ON adoption_commitments(adoption_id);
CREATE INDEX idx_commitment_mobile ON adoption_commitments(adopter_mobile);
CREATE INDEX idx_commitment_ref ON adoption_commitments(reference_id);

-- Append-only: allow insert, deny update/delete
CREATE POLICY "Anon can insert commitments"
  ON adoption_commitments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can insert commitments"
  ON adoption_commitments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can read commitments"
  ON adoption_commitments FOR SELECT TO authenticated USING (true);

-- 4. adoption_followups table
CREATE TABLE adoption_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adoption_id UUID NOT NULL REFERENCES adoptions(id),
  commitment_id UUID NOT NULL REFERENCES adoption_commitments(id),
  followup_type TEXT NOT NULL CHECK (followup_type IN ('1_week', '1_month', '3_month')),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'rescheduled')),
  notes TEXT,
  completed_by UUID REFERENCES volunteers(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adoption_followups ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_followup_adoption ON adoption_followups(adoption_id);
CREATE INDEX idx_followup_due ON adoption_followups(due_date);

CREATE POLICY "Anon can insert followups"
  ON adoption_followups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can manage followups"
  ON adoption_followups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. flags table
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  raised_by_type TEXT NOT NULL DEFAULT 'system',
  raised_by_id UUID,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES volunteers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_flags_entity ON flags(entity_type, entity_id);

CREATE POLICY "Auth can manage flags"
  ON flags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can insert flags"
  ON flags FOR INSERT TO anon WITH CHECK (true);

-- 6. Fix: ensure anon can fully use report + adopt forms
-- (These may already exist from 004, safe to run with IF NOT EXISTS pattern)
DO $$ BEGIN
  -- reporters
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert reporters') THEN
    CREATE POLICY "Anon can insert reporters" ON reporters FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can update reporters') THEN
    CREATE POLICY "Anon can update reporters" ON reporters FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read reporters') THEN
    CREATE POLICY "Anon can read reporters" ON reporters FOR SELECT TO anon USING (true);
  END IF;
  -- animals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert animals') THEN
    CREATE POLICY "Anon can insert animals" ON animals FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read adoptable animals') THEN
    CREATE POLICY "Anon can read adoptable animals" ON animals FOR SELECT TO anon USING (status IN ('rescued', 'fostered', 'adopted'));
  END IF;
  -- rescue_cases
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert rescue_cases') THEN
    CREATE POLICY "Anon can insert rescue_cases" ON rescue_cases FOR INSERT TO anon WITH CHECK (true);
  END IF;
  -- adoptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert adoptions') THEN
    CREATE POLICY "Anon can insert adoptions" ON adoptions FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read adoptions') THEN
    CREATE POLICY "Anon can read adoptions" ON adoptions FOR SELECT TO anon USING (true);
  END IF;
END $$;

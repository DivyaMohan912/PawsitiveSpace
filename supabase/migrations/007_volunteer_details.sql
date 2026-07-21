-- 007_volunteer_details.sql
-- Capture volunteer availability and motivation from the public registration form
-- so admins can review them in the dashboard.

ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS motivation TEXT;

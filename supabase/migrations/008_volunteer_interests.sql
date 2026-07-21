-- 008_volunteer_interests.sql
-- Allow volunteers to sign up for multiple roles. `role` stays as the primary
-- role (used for badges/assignment); `interests` stores every selected option.

ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS interests TEXT[];

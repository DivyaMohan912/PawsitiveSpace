-- Foster email login: let fosters receive their one-time login code by email
-- (Resend) instead of WhatsApp. The email is linked to their mobile number so
-- the board they see is still keyed on foster_mobile.
-- Run in Supabase SQL Editor.

ALTER TABLE adoption_listings ADD COLUMN IF NOT EXISTS foster_email TEXT;

CREATE INDEX IF NOT EXISTS idx_listings_foster_email ON adoption_listings(foster_email);

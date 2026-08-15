-- Give adoptable animals a name so listings are humanized (shown by name
-- instead of just "Dog"/"Cat"). Run in Supabase SQL Editor.

ALTER TABLE adoption_listings ADD COLUMN IF NOT EXISTS name TEXT;

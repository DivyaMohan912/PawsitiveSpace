-- Add can_rescue_animals to volunteers so rescuers can specify which animals
-- they are able to help with (e.g. snakes, birds). Stored as a text array for
-- clean querying/matching, e.g.  ... WHERE can_rescue_animals @> ARRAY['snakes'].

ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS can_rescue_animals TEXT[];

-- Optional GIN index for fast "who can rescue X?" lookups as the list grows.
CREATE INDEX IF NOT EXISTS idx_volunteers_can_rescue_animals
  ON volunteers USING GIN (can_rescue_animals);

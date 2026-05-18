-- RLS policies for anonymous (public) users
-- Allows the public /adopt page to read adoptable animals
-- Allows the public /report form to insert reports

-- Public can read animals that are rescued or fostered (adoptable)
CREATE POLICY "Public read adoptable animals"
  ON animals FOR SELECT
  TO anon
  USING (status IN ('rescued', 'fostered'));

-- Public can insert animals (report form)
CREATE POLICY "Public insert animals"
  ON animals FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can read and insert reporters (report form upserts reporter)
CREATE POLICY "Public read reporters"
  ON reporters FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert reporters"
  ON reporters FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update reporters"
  ON reporters FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Public can insert rescue cases (report form)
CREATE POLICY "Public insert rescue_cases"
  ON rescue_cases FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can insert adoptions (adoption enquiry form)
CREATE POLICY "Public insert adoptions"
  ON adoptions FOR INSERT
  TO anon
  WITH CHECK (true);

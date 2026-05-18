-- RLS policies for anonymous/public access (report form + adopt page)

-- Allow anyone to insert reporters (for report form)
CREATE POLICY "Anon can insert reporters"
  ON reporters FOR INSERT TO anon WITH CHECK (true);

-- Allow anyone to insert animals (for report form)
CREATE POLICY "Anon can insert animals"
  ON animals FOR INSERT TO anon WITH CHECK (true);

-- Allow anyone to insert rescue_cases (for report form)
CREATE POLICY "Anon can insert rescue_cases"
  ON rescue_cases FOR INSERT TO anon WITH CHECK (true);

-- Allow anyone to read adoptable animals (for adopt page)
CREATE POLICY "Anon can read adoptable animals"
  ON animals FOR SELECT TO anon USING (status IN ('rescued', 'fostered', 'adopted'));

-- Allow anyone to insert adoption enquiries
CREATE POLICY "Anon can insert adoptions"
  ON adoptions FOR INSERT TO anon WITH CHECK (true);

-- Allow anyone to upsert reporters (for report form whatsapp number conflict)
CREATE POLICY "Anon can update reporters"
  ON reporters FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to read reporters (needed for upsert returning)
CREATE POLICY "Anon can read reporters"
  ON reporters FOR SELECT TO anon USING (true);

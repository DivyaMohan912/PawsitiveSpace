-- RLS policies for authenticated admin users
-- Run this in Supabase SQL Editor

-- READ policies for all tables
CREATE POLICY "Authenticated users can read volunteers"
  ON volunteers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read reporters"
  ON reporters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read rescue_cases"
  ON rescue_cases FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read animals"
  ON animals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read adoptions"
  ON adoptions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read tnr_records"
  ON tnr_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read whatsapp_logs"
  ON whatsapp_logs FOR SELECT TO authenticated USING (true);

-- WRITE policies for all tables (admin dashboard CRUD)
CREATE POLICY "Authenticated write animals"
  ON animals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write rescue_cases"
  ON rescue_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write adoptions"
  ON adoptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write tnr_records"
  ON tnr_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write volunteers"
  ON volunteers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write reporters"
  ON reporters FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated write whatsapp_logs"
  ON whatsapp_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

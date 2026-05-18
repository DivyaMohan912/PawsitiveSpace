-- WhatsApp message logging table for admin reports view
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  parsed_intent TEXT,
  parsed_data JSONB,
  linked_case_id UUID REFERENCES rescue_cases(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_whatsapp_logs_intent ON whatsapp_logs(parsed_intent);
CREATE INDEX idx_whatsapp_logs_from ON whatsapp_logs(from_number);
CREATE INDEX idx_whatsapp_logs_linked ON whatsapp_logs(linked_case_id);

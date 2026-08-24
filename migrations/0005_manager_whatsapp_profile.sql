ALTER TABLE users ADD COLUMN agency_name TEXT;
ALTER TABLE users ADD COLUMN whatsapp_country_code TEXT;
ALTER TABLE users ADD COLUMN whatsapp_national_number TEXT;
ALTER TABLE users ADD COLUMN whatsapp_e164 TEXT;
ALTER TABLE users ADD COLUMN whatsapp_verified_at INTEGER;
ALTER TABLE users ADD COLUMN whatsapp_verification_code TEXT;
ALTER TABLE users ADD COLUMN whatsapp_verification_requested_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_whatsapp_e164
  ON users(whatsapp_e164)
  WHERE whatsapp_e164 IS NOT NULL;

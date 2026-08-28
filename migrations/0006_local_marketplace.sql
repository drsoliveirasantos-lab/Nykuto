PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS local_publishers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  whatsapp_e164 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deleted')),
  contact_consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_publishers_status
  ON local_publishers(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS local_sessions (
  token_hash TEXT PRIMARY KEY,
  publisher_id TEXT NOT NULL REFERENCES local_publishers(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_local_sessions_publisher_expiry
  ON local_sessions(publisher_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS local_listings (
  id TEXT PRIMARY KEY,
  owner_publisher_id TEXT NOT NULL REFERENCES local_publishers(id) ON DELETE CASCADE,
  listing_kind TEXT NOT NULL DEFAULT 'offer'
    CHECK (listing_kind IN ('offer', 'request')),
  category TEXT NOT NULL,
  market_section TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  search_text TEXT NOT NULL,
  price_amount INTEGER,
  currency TEXT CHECK (currency IN ('BRL', 'PYG', 'USD')),
  price_mode TEXT NOT NULL
    CHECK (price_mode IN ('fixed', 'negotiable', 'quote', 'free')),
  condition_label TEXT NOT NULL,
  availability_label TEXT NOT NULL,
  logistics_json TEXT NOT NULL DEFAULT '[]',
  fees_json TEXT NOT NULL DEFAULT '[]',
  zone_label TEXT NOT NULL,
  zone_lat REAL NOT NULL,
  zone_lng REAL NOT NULL,
  zone_radius_m INTEGER NOT NULL DEFAULT 5000 CHECK (zone_radius_m = 5000),
  source_url TEXT,
  source_owner_consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'paused', 'sold', 'hidden', 'deleted', 'expired')),
  report_count INTEGER NOT NULL DEFAULT 0,
  published_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_listings_public
  ON local_listings(status, expires_at, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_local_listings_category
  ON local_listings(category, market_section, subcategory, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_local_listings_owner
  ON local_listings(owner_publisher_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS local_listing_media (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES local_listings(id) ON DELETE CASCADE,
  storage_type TEXT NOT NULL CHECK (storage_type IN ('d1', 'r2')),
  object_key TEXT,
  data_base64 TEXT,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 300000),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  CHECK (
    (storage_type = 'r2' AND object_key IS NOT NULL AND data_base64 IS NULL)
    OR (storage_type = 'd1' AND object_key IS NULL AND data_base64 IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_local_listing_media_order
  ON local_listing_media(listing_id, sort_order, id);

CREATE TABLE IF NOT EXISTS local_reports (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES local_listings(id) ON DELETE CASCADE,
  reporter_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(listing_id, reporter_hash)
);

CREATE TABLE IF NOT EXISTS local_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS local_schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO local_schema_migrations (version, name, applied_at)
VALUES (6, 'local_marketplace', unixepoch());

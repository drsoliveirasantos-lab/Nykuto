ALTER TABLE listings ADD COLUMN property_type TEXT NOT NULL DEFAULT 'apartment';
ALTER TABLE listings ADD COLUMN bedrooms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN bathrooms INTEGER NOT NULL DEFAULT 1;
ALTER TABLE listings ADD COLUMN floor_label TEXT;
ALTER TABLE listings ADD COLUMN furnished INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN pets_policy TEXT NOT NULL DEFAULT 'consult' CHECK (pets_policy IN ('yes', 'no', 'consult'));
ALTER TABLE listings ADD COLUMN children_policy TEXT NOT NULL DEFAULT 'consult' CHECK (children_policy IN ('yes', 'no', 'consult'));
ALTER TABLE listings ADD COLUMN parking_type TEXT NOT NULL DEFAULT 'none' CHECK (parking_type IN ('none', 'moto', 'car', 'both'));
ALTER TABLE listings ADD COLUMN availability_date TEXT;
ALTER TABLE listings ADD COLUMN guarantee_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN agency_fee_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN water_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN electricity_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN internet_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN trash_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN condominium_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN location_notes TEXT;
ALTER TABLE listings ADD COLUMN utility_notes TEXT;
ALTER TABLE listings ADD COLUMN description TEXT;

CREATE TABLE IF NOT EXISTS listing_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  mime_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listing_media_listing_order
  ON listing_media(listing_id, sort_order, id);

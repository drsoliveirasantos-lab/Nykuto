CREATE TABLE listings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  zone_label TEXT NOT NULL,
  price_amount INTEGER NOT NULL CHECK (price_amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('PYG', 'BRL', 'USD')),
  publication_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published', 'reserved', 'rented', 'archived')),
  availability_label TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  floor_label TEXT,
  furnished INTEGER NOT NULL DEFAULT 0,
  pets_policy TEXT NOT NULL DEFAULT 'consult' CHECK (pets_policy IN ('yes', 'no', 'consult')),
  children_policy TEXT NOT NULL DEFAULT 'consult' CHECK (children_policy IN ('yes', 'no', 'consult')),
  parking_type TEXT NOT NULL DEFAULT 'none' CHECK (parking_type IN ('none', 'moto', 'car', 'both')),
  availability_date TEXT,
  guarantee_amount INTEGER NOT NULL DEFAULT 0,
  agency_fee_amount INTEGER NOT NULL DEFAULT 0,
  water_included INTEGER NOT NULL DEFAULT 0,
  electricity_included INTEGER NOT NULL DEFAULT 0,
  internet_included INTEGER NOT NULL DEFAULT 0,
  trash_included INTEGER NOT NULL DEFAULT 0,
  condominium_included INTEGER NOT NULL DEFAULT 0,
  location_notes TEXT,
  utility_notes TEXT,
  description TEXT
);

INSERT INTO listings_new SELECT * FROM listings;
DROP TABLE listing_media;
DROP TABLE listings;
ALTER TABLE listings_new RENAME TO listings;

CREATE INDEX idx_listings_owner_status
  ON listings(owner_user_id, publication_status, sort_order);

CREATE TABLE listing_media (
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

CREATE INDEX idx_listing_media_listing_order
  ON listing_media(listing_id, sort_order, id);

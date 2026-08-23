ALTER TABLE listings ADD COLUMN published_at INTEGER;
ALTER TABLE listings ADD COLUMN verified_at INTEGER;

UPDATE listings
SET published_at = created_at
WHERE publication_status IN ('published', 'reserved', 'rented');

UPDATE listings
SET verified_at = updated_at
WHERE publication_status IN ('published', 'reserved');

CREATE INDEX IF NOT EXISTS idx_listings_public_freshness
  ON listings(publication_status, verified_at, sort_order);

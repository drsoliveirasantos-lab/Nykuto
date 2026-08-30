#!/usr/bin/env node
import assert from 'node:assert/strict';
import { deriveCdeLocalReference } from '../cde-local-reference.js';
import { serializeLocalListing } from '../functions/_lib/local-marketplace.js';

const hospitalReference = 'Km 8 · lado Monday (aprox.)';
const plazaReference = 'Km 8 · lado Acaray (aprox.)';

assert.equal(
  deriveCdeLocalReference(-25.505413, -54.678766),
  hospitalReference,
  'UCP Hospital Universitário must resolve to the Monday side of Km 8'
);
assert.equal(
  deriveCdeLocalReference(-25.497347, -54.678903),
  plazaReference,
  'UCP Plaza City must resolve to the Acaray side of Km 8'
);
assert.equal(
  deriveCdeLocalReference(-25.54, -54.58),
  null,
  'A point in Foz must not receive a CDE kilometre reference'
);
assert.equal(
  deriveCdeLocalReference(-25.5096, -54.602),
  null,
  'The bridge and microcentre must not receive an invented low-kilometre reference'
);
assert.equal(
  deriveCdeLocalReference(-25.5013, -54.6788),
  'Km 8 (aprox.)',
  'A point directly on PY02 must not be assigned to either side'
);
assert.equal(
  deriveCdeLocalReference(-25.42, -54.68),
  null,
  'A point too far from the PY02 corridor must not receive a reference'
);
assert.equal(
  deriveCdeLocalReference(-25.5054, -54.6788),
  hospitalReference,
  'Rounding the public coordinates to four decimals must keep the same reference'
);

const serialized = serializeLocalListing({
  id: 'loc_reference_test',
  listing_kind: 'offer',
  category: 'Produto',
  market_section: 'home',
  subcategory: 'Móveis e decoração',
  title: 'Anúncio de teste',
  description: '',
  price_amount: 100,
  currency: 'BRL',
  price_mode: 'fixed',
  condition_label: 'A combinar',
  availability_label: 'Sob consulta',
  logistics_json: '[]',
  fees_json: '[]',
  zone_label: 'Ciudad del Este',
  zone_lat: -25.5054,
  zone_lng: -54.6788,
  zone_radius_m: 5000,
  source_url: '',
  status: 'published',
  published_at: 1,
  expires_at: 2,
  updated_at: 1,
  first_name: 'Diego',
  last_name: 'Oliveira',
  whatsapp_e164: '+595971000000'
});

assert.equal(serialized.zone.localReference, hospitalReference);
assert.equal(serialized.zone.latitude, -25.5054);
assert.equal(serialized.zone.longitude, -54.6788);

console.log('CDE local-reference tests passed.');

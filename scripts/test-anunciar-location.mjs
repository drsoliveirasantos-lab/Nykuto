#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  deviceAccuracyLabel,
  geolocationErrorMessage,
  isPilotCoordinate,
  roundPublicCoordinate
} from '../anunciar/location-utils.js';

assert.equal(roundPublicCoordinate(-25.505413), -25.5054);
assert.equal(roundPublicCoordinate(-54.678766), -54.6788);
assert.equal(roundPublicCoordinate('not-a-coordinate'), null);
assert.equal(roundPublicCoordinate(''), null);

assert.equal(isPilotCoordinate(-25.5054, -54.6788), true);
assert.equal(isPilotCoordinate(-25.54, -54.58), true);
assert.equal(isPilotCoordinate(-23.55, -46.63), false);
assert.equal(isPilotCoordinate(null, null), false);

assert.match(geolocationErrorMessage({ code: 1 }), /recusada/i);
assert.match(geolocationErrorMessage({ code: 2 }), /aparelho/i);
assert.match(geolocationErrorMessage({ code: 3 }), /demorou/i);
assert.match(geolocationErrorMessage({}), /navegador/i);

assert.equal(deviceAccuracyLabel(37), 'precisão do aparelho ~40 m');
assert.equal(deviceAccuracyLabel(1450), 'precisão do aparelho ~1,4 km');
assert.equal(deviceAccuracyLabel(undefined), '');

console.log('Publisher location utility tests passed.');

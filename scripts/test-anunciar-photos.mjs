#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  MAX_PHOTO_COUNT,
  MAX_SOURCE_PHOTO_BYTES,
  isDngPhoto,
  isLikelyImageFile,
  selectSourcePhotos
} from '../anunciar/photo-utils.js';

const mib = 1024 * 1024;
const jpeg = (name = 'photo.jpg', type = 'image/jpeg', size = 4 * mib) => ({ name, type, size });

assert.equal(MAX_PHOTO_COUNT, 2);
assert.equal(MAX_SOURCE_PHOTO_BYTES, 100 * mib);
assert.equal(isLikelyImageFile(jpeg('IMG_0001', 'image/jpg')), true);
assert.equal(isLikelyImageFile(jpeg('IMG_0002', 'application/octet-stream')), true);
assert.equal(isLikelyImageFile(jpeg('IMG_0003', '')), true);
assert.equal(isLikelyImageFile(jpeg('photo.HEIC', 'application/octet-stream')), true);
assert.equal(isLikelyImageFile(jpeg('IMG_0004.DNG', 'application/x-adobe-dng')), true);
assert.equal(isDngPhoto(jpeg('IMG_0004.DNG', 'application/x-adobe-dng')), true);
assert.equal(isDngPhoto(jpeg('IMG_0005', 'image/dng')), true);
assert.equal(isLikelyImageFile(jpeg('document.pdf', '')), false);
assert.equal(isLikelyImageFile(jpeg('document.pdf', 'application/octet-stream')), false);
assert.equal(isLikelyImageFile({ name: 'document.pdf', type: 'application/pdf', size: mib }), false);

assert.equal(selectSourcePhotos([jpeg('IMG_0001', 'image/jpg')]).files.length, 1);
assert.equal(selectSourcePhotos([jpeg('IMG_0002', 'application/octet-stream')]).files.length, 1);
assert.equal(selectSourcePhotos([jpeg('large.jpg', 'image/jpeg', MAX_SOURCE_PHOTO_BYTES)]).files.length, 1);
assert.equal(selectSourcePhotos([jpeg('too-large.jpg', 'image/jpeg', MAX_SOURCE_PHOTO_BYTES + 1)]).error, 'PHOTO_TOO_LARGE');
assert.equal(selectSourcePhotos([{ name: 'document.pdf', type: 'application/pdf', size: mib }]).error, 'INVALID_PHOTO');

const first = jpeg('first.jpg');
const second = jpeg('second.jpg');
const ignoredThird = { name: 'document.pdf', type: 'application/pdf', size: mib };
const limited = selectSourcePhotos([first, second, ignoredThird]);
assert.deepEqual(limited.files, [first, second]);
assert.equal(limited.truncated, true);
assert.equal(limited.error, null);

console.log('Publisher photo source tests passed.');

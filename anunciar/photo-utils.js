export const MAX_PHOTO_COUNT = 2;
export const MAX_SOURCE_PHOTO_BYTES = 100 * 1024 * 1024;

const KNOWN_IMAGE_EXTENSION = /\.(?:avif|bmp|dng|gif|heic|heif|jfif|jpe?g|png|tiff?|webp)$/i;
const DNG_TYPES = new Set([
  'application/dng',
  'application/x-adobe-dng',
  'image/dng',
  'image/x-adobe-dng'
]);

export function isDngPhoto(file) {
  const type = String(file?.type || '').toLocaleLowerCase('en-US');
  const name = String(file?.name || '');
  return DNG_TYPES.has(type) || /\.dng$/i.test(name);
}

export function isLikelyImageFile(file) {
  const type = String(file?.type || '').toLocaleLowerCase('en-US');
  const name = String(file?.name || '');
  const hasExplicitExtension = /\.[a-z0-9]{1,12}$/i.test(name);
  if (!type || type === 'application/octet-stream') {
    return !hasExplicitExtension || KNOWN_IMAGE_EXTENSION.test(name);
  }
  return type.startsWith('image/') || isDngPhoto(file) || KNOWN_IMAGE_EXTENSION.test(name);
}

export function selectSourcePhotos(fileList) {
  const incoming = [...(fileList || [])];
  const files = incoming.slice(0, MAX_PHOTO_COUNT);
  const oversized = files.find((file) => Number(file?.size || 0) > MAX_SOURCE_PHOTO_BYTES);
  if (oversized) return { files: [], error: 'PHOTO_TOO_LARGE', rejectedFile: oversized, truncated: incoming.length > MAX_PHOTO_COUNT };
  const unsupported = files.find((file) => !isLikelyImageFile(file));
  if (unsupported) return { files: [], error: 'INVALID_PHOTO', rejectedFile: unsupported, truncated: incoming.length > MAX_PHOTO_COUNT };
  return { files, error: null, rejectedFile: null, truncated: incoming.length > MAX_PHOTO_COUNT };
}

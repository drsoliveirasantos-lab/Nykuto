const encoder = new TextEncoder();

export const SESSION_COOKIE = '__Host-nykuto_manager';

export function isDemoHost(request) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === 'cde.nykuto.com'
    || hostname === 'demo.nykuto.com'
    || hostname === 'nykuto-demo.pages.dev'
    || hostname.endsWith('.nykuto-demo.pages.dev')
    || hostname === 'localhost'
    || hostname === '127.0.0.1';
}

export function isSameOrigin(request) {
  const origin = request.headers.get('Origin');
  return Boolean(origin && origin === new URL(request.url).origin);
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}

export function parseCookies(request) {
  const values = {};
  const header = request.headers.get('Cookie') || '';
  header.split(';').forEach((part) => {
    const separator = part.indexOf('=');
    if (separator < 1) return;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) values[name] = value;
  });
  return values;
}

export function sessionCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function sha256(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function credentialDigest(username, accessCode, pepper, salt) {
  if (!salt) throw new Error('INVALID_CREDENTIAL_CONFIGURATION');
  return hmac(`credential:v3:${username.trim().toLowerCase()}:${salt}:${accessCode}`, pepper);
}

export async function csrfForSession(rawSessionToken, pepper) {
  return hmac(`csrf:v1:${rawSessionToken}`, pepper);
}

export function constantTimeEqual(left, right) {
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index % Math.max(a.length, 1)] || 0) ^ (b[index % Math.max(b.length, 1)] || 0);
  }
  return difference === 0;
}

export async function readJson(request, maxBytes = 8192) {
  const contentType = request.headers.get('Content-Type') || '';
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (!contentType.toLowerCase().startsWith('application/json')) throw new Error('UNSUPPORTED_MEDIA_TYPE');
  if (contentLength > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  const text = await request.text();
  if (encoder.encode(text).byteLength > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  try {
    return JSON.parse(text || '{}');
  } catch (_) {
    throw new Error('INVALID_JSON');
  }
}

export function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

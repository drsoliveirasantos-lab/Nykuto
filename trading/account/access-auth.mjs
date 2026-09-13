const ISSUER = 'https://nykuto.cloudflareaccess.com';
const AUDIENCE = 'c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190';
let cachedKeys = null;
let keysUntil = 0;

const bytes = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0));
const decode = value => JSON.parse(new TextDecoder().decode(bytes(value)));

/** Verify the Cloudflare Access assertion before any account or research lookup. */
export async function authenticate(request) {
  try {
    const token = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!token || token.length > 16384) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, claims] = parts.slice(0, 2).map(decode);
    const now = Date.now() / 1000;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || claims.iss !== ISSUER ||
        !Array.isArray(claims.aud) || !claims.aud.includes(AUDIENCE) ||
        !Number.isFinite(claims.exp) || claims.exp <= now ||
        !Number.isFinite(claims.iat) || claims.iat > now + 30 ||
        (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now + 30))) return false;
    if (!cachedKeys || Date.now() >= keysUntil) {
      const response = await fetch(`${ISSUER}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return false;
      const payload = await response.json();
      if (!Array.isArray(payload.keys)) return false;
      cachedKeys = payload.keys;
      keysUntil = Date.now() + 60000;
    }
    const jwk = cachedKeys.find(key => key.kid === header.kid && key.kty === 'RSA' && (!key.alg || key.alg === 'RS256'));
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid ? claims : false;
  } catch {
    return false;
  }
}

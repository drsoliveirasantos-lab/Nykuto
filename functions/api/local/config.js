import { json } from '../../_lib/security.js';

export function onRequestGet({ env }) {
  return json({
    ok: true,
    ready: Boolean(env.LOCAL_DB && env.AUTH_PEPPER && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || ''
  });
}


export async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: false, code: 'TURNSTILE_UNAVAILABLE' };
  if (!token || typeof token !== 'string' || token.length > 4096) return { ok: false, code: 'TURNSTILE_REQUIRED' };

  try {
    const form = new FormData();
    form.set('secret', env.TURNSTILE_SECRET_KEY);
    form.set('response', token);
    const remoteIp = request.headers.get('CF-Connecting-IP');
    if (remoteIp) form.set('remoteip', remoteIp);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });
    if (!response.ok) return { ok: false, code: 'TURNSTILE_UNAVAILABLE' };
    const result = await response.json();
    return result.success ? { ok: true } : { ok: false, code: 'TURNSTILE_REJECTED', errors: result['error-codes'] || [] };
  } catch (_) {
    return { ok: false, code: 'TURNSTILE_UNAVAILABLE' };
  }
}


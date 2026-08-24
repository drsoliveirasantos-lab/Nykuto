import { requireMutationAccess } from '../../../_lib/auth.js';
import { json, nowSeconds } from '../../../_lib/security.js';

const NYKUTO_SUPPORT_WHATSAPP = '33768345608';

export async function onRequestPost({ request, env }) {
  const resolved = await requireMutationAccess(request, env);
  if (resolved.response) return resolved.response;
  const profile = await env.DB.prepare(`
    SELECT username, display_name, agency_name, whatsapp_e164, whatsapp_verified_at, whatsapp_verification_code
    FROM users WHERE id = ? LIMIT 1
  `).bind(resolved.access.user.id).first();
  if (!profile?.whatsapp_e164 || !profile.whatsapp_verification_code) {
    return json({ ok: false, code: 'PROFILE_INCOMPLETE', message: 'Salve seu número antes de solicitar a confirmação.' }, 422);
  }
  if (profile.whatsapp_verified_at) {
    return json({ ok: true, alreadyVerified: true, verifiedAt: Number(profile.whatsapp_verified_at) });
  }

  const now = nowSeconds();
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET whatsapp_verification_requested_at = ?, updated_at = ? WHERE id = ?').bind(now, now, resolved.access.user.id),
    env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'whatsapp_verification_request', 'user', ?, ?)")
      .bind(resolved.access.user.id, resolved.access.user.id, now)
  ]);
  const message = [
    'Olá! Quero confirmar o WhatsApp do meu perfil Nykuto.',
    '',
    `Assessoria: ${profile.agency_name || profile.display_name}`,
    `Usuário: ${profile.username}`,
    `Número cadastrado: +${profile.whatsapp_e164}`,
    `Código: ${profile.whatsapp_verification_code}`,
    '',
    'Estou enviando esta mensagem pelo mesmo número cadastrado.'
  ].join('\n');
  return json({ ok: true, supportPhone: NYKUTO_SUPPORT_WHATSAPP, message, requestedAt: now });
}

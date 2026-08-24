import { requireMutationAccess } from '../../_lib/auth.js';
import { cleanText } from '../../_lib/listings.js';
import { json, nowSeconds, readJson } from '../../_lib/security.js';

function normalizeWhatsapp(countryCodeValue, nationalNumberValue) {
  const countryCode = String(countryCodeValue || '').replace(/\D/g, '');
  let nationalNumber = String(nationalNumberValue || '').replace(/\D/g, '');
  nationalNumber = nationalNumber.replace(/^0+/, '');
  const e164 = `${countryCode}${nationalNumber}`;
  if (!/^[1-9]\d{0,2}$/.test(countryCode) || !/^\d{6,12}$/.test(nationalNumber) || !/^[1-9]\d{7,14}$/.test(e164)) return null;
  return { countryCode, nationalNumber, e164 };
}

function verificationCode() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `NYK-${[...bytes].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export async function onRequestPatch({ request, env }) {
  const resolved = await requireMutationAccess(request, env);
  if (resolved.response) return resolved.response;

  let body;
  try { body = await readJson(request, 4096); } catch (error) { return json({ ok: false, code: error.message, message: 'Dados de perfil inválidos.' }, 400); }

  const agencyName = cleanText(body.agencyName, 2, 80);
  const whatsapp = normalizeWhatsapp(body.whatsappCountryCode, body.whatsappNationalNumber);
  if (!agencyName || !whatsapp) {
    return json({ ok: false, code: 'VALIDATION_ERROR', message: 'Informe o nome profissional e um WhatsApp internacional válido.' }, 422);
  }

  const current = await env.DB.prepare(`
    SELECT agency_name, whatsapp_e164, whatsapp_verified_at, whatsapp_verification_code
    FROM users WHERE id = ? LIMIT 1
  `).bind(resolved.access.user.id).first();
  if (!current) return json({ ok: false, code: 'NOT_FOUND', message: 'Perfil não encontrado.' }, 404);

  const phoneChanged = current.whatsapp_e164 !== whatsapp.e164;
  const code = phoneChanged || !current.whatsapp_verification_code ? verificationCode() : current.whatsapp_verification_code;
  const now = nowSeconds();
  const updated = await env.DB.prepare(`
    UPDATE users SET
      agency_name = ?, whatsapp_country_code = ?, whatsapp_national_number = ?, whatsapp_e164 = ?,
      whatsapp_verified_at = CASE WHEN whatsapp_e164 = ? THEN whatsapp_verified_at ELSE NULL END,
      whatsapp_verification_code = ?,
      whatsapp_verification_requested_at = CASE WHEN whatsapp_e164 = ? THEN whatsapp_verification_requested_at ELSE NULL END,
      updated_at = ?
    WHERE id = ?
    RETURNING agency_name, whatsapp_country_code, whatsapp_national_number, whatsapp_e164,
              whatsapp_verified_at, whatsapp_verification_code, whatsapp_verification_requested_at, updated_at
  `).bind(
    agencyName, whatsapp.countryCode, whatsapp.nationalNumber, whatsapp.e164,
    whatsapp.e164, code, whatsapp.e164, now, resolved.access.user.id
  ).first();
  try {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, entity_type, entity_id, created_at) VALUES (?, 'profile_update', 'user', ?, ?)")
      .bind(resolved.access.user.id, resolved.access.user.id, now).run();
  } catch (_) { /* The profile remains usable if non-critical audit logging is unavailable. */ }
  return json({
    ok: true,
    profile: {
      agencyName: updated.agency_name,
      whatsappCountryCode: updated.whatsapp_country_code,
      whatsappNationalNumber: updated.whatsapp_national_number,
      whatsappE164: updated.whatsapp_e164,
      whatsappVerifiedAt: updated.whatsapp_verified_at ? Number(updated.whatsapp_verified_at) : null,
      whatsappVerificationCode: updated.whatsapp_verification_code,
      whatsappVerificationRequestedAt: updated.whatsapp_verification_requested_at ? Number(updated.whatsapp_verification_requested_at) : null,
      updatedAt: Number(updated.updated_at)
    }
  });
}

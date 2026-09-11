export const REPORT33_SHA256='6650ae7ea8061e94d1c24142d516cd29aabd8d03cfb91a71da08c05092392a57';
export async function verifyAccountReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT33_SHA256)throw Error('Rapport de compte non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu33-account-report-v1'||r.views.length!==16||!r.audit.passed||r.confirmed!==false||r.executionAllowed!==false)throw Error('Rapport de compte invalide');
 return r;
}

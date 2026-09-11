export const REPORT37_SHA256='7b6aab05fccfcd86d397d03c8295fc8643e3ac22bfa2bd8d5dbfad0f1c07713f';
export async function verifyConfidenceReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT37_SHA256)throw Error('Rapport de risque non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu37-confidence-report-v1'||r.views.length!==18||r.executionCount!==36||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false)throw Error('Rapport de risque invalide');
 return r;
}

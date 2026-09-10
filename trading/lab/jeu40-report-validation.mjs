export const REPORT40_SHA256='fd57be160b7fd20f60449f13f379da138687acc1174f2c01d25889c7475fa6b0';
export async function verifyEightMonthReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT40_SHA256)throw Error('Rapport huit mois non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu40-eight-month-report-v1'||r.views.length!==8||r.executionCount!==16||r.audit.controls!==6||r.audit.prefixes!==328||r.audit.filterPrefixes!==328||r.audit.contextPrefixes!==328||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false||r.independent!==false||r.selection!==null)throw Error('Rapport huit mois invalide');
 return r;
}

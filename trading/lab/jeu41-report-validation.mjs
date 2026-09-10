export const REPORT41_SHA256='57126d9f313c03b63e73be2e531a07670e2cd62d1b04fe49467e45f297f6b559';
export async function verifyNetRewardReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT41_SHA256)throw Error('Rapport MES non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu41-net-reward-report-v1'||r.views.length!==16||r.executionCount!==32||r.audit.controls!==16||r.audit.prefixes!==656||r.audit.filterPrefixes!==656||r.audit.contextPrefixes!==656||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false||r.independent!==false||r.selection!==null||r.review.decision!=='not-retained')throw Error('Rapport MES invalide');
 return r;
}

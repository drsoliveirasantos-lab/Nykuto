export const REPORT39_SHA256='c1520169a547acf65805f9f1197d1bf137181292f72e747207c52bac4c4b8326';
export async function verifyStudyReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT39_SHA256)throw Error('Rapport horaires/modèle non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu39-study-report-v1'||r.views.length!==9||r.executionCount!==18||r.audit.controls!==6||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false||r.independent!==false||r.selection!==null||r.reviews.length!==2)throw Error('Rapport horaires/modèle invalide');
 return r;
}

export const REPORT34_SHA256='ec751379ed0416e2895ca989e3f449d0144727f57582da51c08ee1920cdec349';
export async function verifyMonthlyReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT34_SHA256)throw Error('Rapport mensuel non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu34-monthly-report-v1'||r.views.length!==12||r.executionCount!==24||!r.audit.passed||r.executionAllowed!==false)throw Error('Rapport mensuel invalide');
 return r;
}

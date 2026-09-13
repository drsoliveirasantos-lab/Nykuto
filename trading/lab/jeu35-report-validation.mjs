export const REPORT35_SHA256='ff5f836855229d88fba31d22fd3d2717d67a19dfa0c7dc0659724f59f0044311';
export async function verifyExitReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT35_SHA256)throw Error('Rapport de sorties non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu35-exit-report-v1'||r.views.length!==18||r.executionCount!==36||!r.audit.passed||r.executionAllowed!==false)throw Error('Rapport de sorties invalide');
 return r;
}

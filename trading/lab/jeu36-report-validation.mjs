export const REPORT36_SHA256='d8c1f793f00d23989838d83d62abbb130195a75eb957db342ac18e8cf7612537';
export async function verifyEntryReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT36_SHA256)throw Error('Rapport des entrées non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu36-entry-report-v1'||r.views.length!==18||r.executionCount!==36||!r.audit.passed||r.executionAllowed!==false)throw Error('Rapport des entrées invalide');
 return r;
}

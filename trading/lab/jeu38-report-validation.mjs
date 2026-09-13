export const REPORT38_SHA256='dc6ea2f52b3f69f0f5dd9e8cd6534ba6498c10b21e96d6fa001244affb4f221f';
export async function verifyObstacleReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT38_SHA256)throw Error('Rapport du filtre non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu38-obstacle-report-v1'||r.views.length!==6||r.executionCount!==12||r.audit.controls!==6||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false||r.independent!==false||r.selection!==null)throw Error('Rapport du filtre invalide');
 return r;
}

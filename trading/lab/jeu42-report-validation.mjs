export const REPORT42_SHA256='efc3a4338458ccac4d7a1a32e3b317fa8646bea1b6e4b49515eb581599344bdc';
export async function verifyPullbackVolumeReport(buffer){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==REPORT42_SHA256)throw Error('Rapport MES non vérifié');
 const r=JSON.parse(new TextDecoder().decode(buffer));
 if(r.schema!=='jeu42-pullback-volume-report-v1'||r.views.length!==16||r.executionCount!==32||r.audit.controls!==16||r.audit.prefixes!==656||r.audit.filterPrefixes!==656||r.audit.contextPrefixes!==656||!r.audit.passed||r.executionAllowed!==false||r.confirmed!==false||r.independent!==false||r.selection!==null||r.review.decision!=='not-retained')throw Error('Rapport MES invalide');
 return r;
}

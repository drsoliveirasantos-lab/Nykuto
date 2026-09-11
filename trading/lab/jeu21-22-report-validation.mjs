import {RESEARCH_REPORTS} from './jeu21-22-public.mjs';
export async function verifyContinuationReport(buffer,game){
  const p=RESEARCH_REPORTS[game];if(!p||buffer.byteLength!==p.bytes||!globalThis.crypto?.subtle)throw new Error('Unverifiable report');
  const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==p.sha256)throw new Error('Report fingerprint mismatch');
  const r=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
  if(r.schema!==p.schema||r.freezeSha256!==p.freezeSha256||r.protocolSha256!==p.protocolSha256||r.confirmed!==false||r.policy.independent!==false||['brokerEnabled','paperEnabled','shadowEnabled','liveFeed'].some(k=>r.policy[k]!==false)||r.audit.passed!==true||r.results.length!==4||r.selection.id!==null||r.holdout.status!=='not-opened')throw new Error('Invalid research state');
  for(const x of r.results){
    if(x.confirmed!==false||x.windows.length!==2||x.checks.length!==8||x.researchPassed!==x.checks.every(c=>c.pass)||x.researchPassed!==false)throw new Error('Invalid candidate state');
    for(const cost of ['normal','stress']){const d=x.diagnostic[cost];if(!Number.isFinite(d.net)||!Number.isInteger(d.trades)||d.trades<0||d.daily.observed!==d.daily.positive+d.daily.negative+d.daily.flatActive+d.daily.noTrade)throw new Error('Invalid totals');}
  }
  return r;
}

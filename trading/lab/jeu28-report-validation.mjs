import {PROTECTION_REPORT as p} from './jeu28-public.mjs';
export async function verifyProtectionReport(buffer){
  if(buffer.byteLength!==p.bytes||!globalThis.crypto?.subtle)throw new Error('Unverifiable report');
  const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==p.sha256)throw new Error('Report fingerprint mismatch');
  const r=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
  if(r.schema!==p.schema||r.freezeSha256!==p.freezeSha256||r.protocolSha256!==p.protocolSha256||r.selectionSha256!==p.selectionSha256||r.confirmed!==false||r.policy.independent!==false||['brokerEnabled','paperEnabled','shadowEnabled','liveFeed'].some(k=>r.policy[k]!==false)||r.audit.passed!==true||r.results.length!==4||r.selection.id!==null||r.selection.attempted!==4||r.selection.cumulativeAttempts!==65||r.holdout.status!=='not-opened'||r.policy.dailyLoss!==300||r.policy.riskMode!=='fixed-admission-cap')throw new Error('Invalid research state');
  const ids=new Set();
  for(const x of r.results){
    if(ids.has(x.id)||!['MNQ','MES','MYM','MGC'].includes(x.symbol)||x.id!==x.symbol+'/closed-breakeven150'||x.riskPerTrade!==150||x.dailyLoss!==300||x.confirmed!==false||x.windows.length!==2||x.checks.length!==8||x.researchPassed!==x.checks.every(c=>c.pass)||x.researchPassed!==false)throw new Error('Invalid candidate state');ids.add(x.id);
    for(const cost of ['normal','stress']){
      const d=x.diagnostic[cost];
      if(!Number.isInteger(d.breakEvenArmed)||!Number.isInteger(d.breakEvenExits)||d.breakEvenExits<0||d.breakEvenExits>d.breakEvenArmed||d.breakEvenArmed>d.trades||!Number.isFinite(d.breakEvenExitNet)||Math.abs(d.dailyMean-Math.round(d.net/d.daily.observed*100)/100)>1e-7)throw new Error('Invalid daily or protection totals');
      const c=d.protectionComparison;
      if(!c||c.sharedEntries+c.addedEntries!==d.trades||c.improved+c.worsened+c.sameNet!==c.sharedEntries||c.newNet!==d.net||Math.abs(c.improvedDollars+c.worsenedDollars-c.sharedDelta)>1e-7||Math.abs(c.sharedDelta+c.addedNet-c.removedNet-c.deltaNet)>1e-7||Math.abs(c.newNet-c.oldNet-c.deltaNet)>1e-7)throw new Error('Invalid matched-entry comparison');
      if(!Number.isFinite(d.net)||!Number.isInteger(d.trades)||d.trades<0||d.daily.observed!==d.daily.positive+d.daily.negative+d.daily.flatActive+d.daily.noTrade)throw new Error('Invalid totals');
      for(const c of [d.referenceComparison])if(!c||c.newNet!==d.net||Math.abs(c.addedNet-c.removedNet-c.deltaNet)>1e-7||Math.abs(c.newNet-c.oldNet-c.deltaNet)>1e-7||c.unchangedCount+c.addedCount!==d.trades)throw new Error('Invalid comparison');
    }
  }
  return r;
}

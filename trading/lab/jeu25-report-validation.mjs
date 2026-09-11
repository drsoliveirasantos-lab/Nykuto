import {GRADED_REPORT as p} from './jeu25-public.mjs';
export async function verifyGradedReport(buffer){
  if(buffer.byteLength!==p.bytes||!globalThis.crypto?.subtle)throw new Error('Unverifiable report');
  const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==p.sha256)throw new Error('Report fingerprint mismatch');
  const r=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
  if(r.schema!==p.schema||r.freezeSha256!==p.freezeSha256||r.protocolSha256!==p.protocolSha256||r.selectionSha256!==p.selectionSha256||r.confirmed!==false||r.policy.independent!==false||['brokerEnabled','paperEnabled','shadowEnabled','liveFeed'].some(k=>r.policy[k]!==false)||r.audit.passed!==true||r.results.length!==4||r.selection.id!==null||r.selection.attempted!==4||r.selection.cumulativeAttempts!==53||r.holdout.status!=='not-opened'||r.policy.dailyLoss!==300||r.policy.riskMode!=='context-admission-cap')throw new Error('Invalid research state');
  const ids=new Set(),caps=[50,75,150];
  for(const x of r.results){
    if(ids.has(x.id)||!['MNQ','MES','MYM','MGC'].includes(x.symbol)||x.id!==x.symbol+'/graded-50-75-150'||x.riskPerTrade!==150||x.dailyLoss!==300||x.confirmed!==false||x.windows.length!==2||x.checks.length!==8||x.researchPassed!==x.checks.every(c=>c.pass)||x.researchPassed!==false)throw new Error('Invalid candidate state');ids.add(x.id);
    for(const cost of ['normal','stress']){
      const d=x.diagnostic[cost];
      if(!Number.isFinite(d.net)||!Number.isInteger(d.trades)||d.trades<0||d.daily.observed!==d.daily.positive+d.daily.negative+d.daily.flatActive+d.daily.noTrade)throw new Error('Invalid totals');
      for(const c of [d.referenceComparison,d.strictComparison])if(!c||c.newNet!==d.net||Math.abs(c.addedNet-c.removedNet-c.deltaNet)>1e-7||Math.abs(c.newNet-c.oldNet-c.deltaNet)>1e-7||c.unchangedCount+c.addedCount!==d.trades)throw new Error('Invalid comparison');
      if(d.tiers.length!==3||d.tiers.some((t,i)=>t.cap!==caps[i]||!Number.isInteger(t.trades)||t.trades<0||!Number.isFinite(t.net)||(!t.trades?t.averagePlannedRisk!==null:!Number.isFinite(t.averagePlannedRisk)||t.averagePlannedRisk>t.cap))||d.tiers.reduce((s,t)=>s+t.trades,0)!==d.trades||Math.abs(d.tiers.reduce((s,t)=>s+t.net,0)-d.net)>1e-7)throw new Error('Invalid risk tiers');
    }
  }
  if(r.grading.length!==4||new Set(r.grading.map(g=>g.symbol)).size!==4)throw new Error('Invalid grading totals');
  for(const g of r.grading){
    if(!r.results.some(x=>x.symbol===g.symbol)||!Number.isInteger(g.signals)||g.signals<0||g.missingContext>g.signals||g.missingContext<0||g.tiers.length!==3||g.scores.length!==6||g.tiers.some((t,i)=>t.cap!==caps[i]||!Number.isInteger(t.signals)||t.signals<0)||g.scores.some((s,i)=>s.score!==i||!Number.isInteger(s.signals)||s.signals<0)||g.tiers.reduce((s,t)=>s+t.signals,0)!==g.signals||g.scores.reduce((s,t)=>s+t.signals,0)!==g.signals||g.tiers[2].signals!==g.scores[5].signals)throw new Error('Invalid grading distribution');
    const x=r.results.find(x=>x.symbol===g.symbol);for(const cost of ['normal','stress'])if(x.diagnostic[cost].tiers.some((t,i)=>t.trades>g.tiers[i].signals))throw new Error('Excess risk-tier executions');
  }
  return r;
}

import {COMBINED_REPORT as p} from './jeu24-public.mjs';
export async function verifyCombinedReport(buffer){
  if(buffer.byteLength!==p.bytes||!globalThis.crypto?.subtle)throw new Error('Unverifiable report');
  const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==p.sha256)throw new Error('Report fingerprint mismatch');
  const r=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
  if(r.schema!==p.schema||r.freezeSha256!==p.freezeSha256||r.protocolSha256!==p.protocolSha256||r.selectionSha256!==p.selectionSha256||r.confirmed!==false||r.policy.independent!==false||['brokerEnabled','paperEnabled','shadowEnabled','liveFeed'].some(k=>r.policy[k]!==false)||r.audit.passed!==true||r.results.length!==16||r.selection.id!==null||r.selection.attempted!==16||r.selection.cumulativeAttempts!==49||r.holdout.status!=='not-opened')throw new Error('Invalid research state');
  const ids=new Set();
  for(const x of r.results){
    if(ids.has(x.id)||!['MNQ','MES','MYM','MGC'].includes(x.symbol)||![50,75,100,150].includes(x.riskPerTrade)||x.id!==x.symbol+'/confluence-risk'+x.riskPerTrade||x.dailyLoss!==2*x.riskPerTrade||x.confirmed!==false||x.windows.length!==2||x.checks.length!==8||x.researchPassed!==x.checks.every(c=>c.pass)||x.researchPassed!==false)throw new Error('Invalid candidate state');ids.add(x.id);
    for(const cost of ['normal','stress']){
      const d=x.diagnostic[cost];
      if(!Number.isFinite(d.net)||!Number.isInteger(d.trades)||d.trades<0||d.recoveredAfterRefusal>d.trades||d.daily.observed!==d.daily.positive+d.daily.negative+d.daily.flatActive+d.daily.noTrade)throw new Error('Invalid totals');
      for(const c of [d.referenceComparison,...(x.riskPerTrade===50?[]:[d.riskComparison])]){
        if(!c||c.newNet!==d.net||Math.abs(c.addedNet-c.removedNet-c.deltaNet)>1e-7||Math.abs(c.newNet-c.oldNet-c.deltaNet)>1e-7||c.unchangedCount+c.addedCount!==d.trades)throw new Error('Invalid comparison');
      }
    }
  }
  if(r.confluence.length!==4||new Set(r.confluence.map(x=>x.symbol)).size!==4)throw new Error('Invalid context totals');
  for(const c of r.confluence){
    let last=c.signals;
    if(!['MNQ','MES','MYM','MGC'].includes(c.symbol)||!Number.isInteger(last)||c.funnel.length!==5||c.missingContext>last||c.missingContext<0)throw new Error('Invalid context market');
    for(const [i,id]of ['trend','structure','momentum','volume','pattern'].entries()){
      const step=c.funnel[i];
      if(step.id!==id||!Number.isInteger(step.remaining)||step.remaining<0||step.remaining>last||!Number.isInteger(c.passes[id])||c.passes[id]<step.remaining||c.passes[id]>c.signals)throw new Error('Invalid context funnel');last=step.remaining;
    }
    if(last!==c.accepted||r.results.filter(x=>x.symbol===c.symbol).some(x=>['normal','stress'].some(cost=>x.diagnostic[cost].trades>c.accepted)))throw new Error('Invalid context admission');
  }
  return r;
}

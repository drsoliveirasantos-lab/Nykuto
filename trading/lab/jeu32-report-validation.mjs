import {JEU32_REPORT as pin} from './jeu32-public.mjs';
const cents=n=>Math.round(n*100)/100;
const sum=(rows,k)=>cents(rows.reduce((n,r)=>n+(r[k]??0),0));
export async function verifySummerTrend(buffer){
 if(buffer.byteLength!==pin.bytes||!globalThis.crypto?.subtle)throw Error('Unverifiable summer report');
 const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
 if(sha!==pin.sha256)throw Error('Summer fingerprint mismatch');
 const r=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
 if(r.schema!==pin.schema||r.freezeSha256!==pin.freezeSha256||r.prePerformanceCommit!==pin.prePerformanceCommit||r.confirmed!==false||r.independent!==false||r.executionAllowed!==false||r.selection.id!==null||r.configurationCount!==74||r.newConfigurations!==4||r.audit.passed!==true||r.audit.oldAugustReplays!==16)throw Error('Invalid research state');
 const expected=['june','july','august','summer'].flatMap(id=>['diagnostic','account'].map(mode=>id+'/'+mode));
 if(JSON.stringify(r.views.map(v=>v.id+'/'+v.mode))!==JSON.stringify(expected))throw Error('Missing replay view');
 let total=0,n=0;
 for(const v of r.views){
  if(v.coverage.expected!==v.coverage.scored||v.coverage.missing.length||v.coverage.expected!==({june:21,july:22,august:21,summer:64}[v.id]))throw Error('Coverage mismatch');
  if(JSON.stringify(v.variants.map(x=>x.id))!==JSON.stringify(['reference31','rr2-150','aligned-150','rr2-500','aligned-500']))throw Error('Missing variant');
  for(const a of v.variants)for(const cost of ['normal','stress']){
   const x=a.costs[cost],baseline=v.variants[0].costs[cost];n++;total+=x.count;
   if(x.executionAllowed!==false||x.wins+x.losses+x.flat!==x.count||cents(x.gross-x.fees)!==x.net||cents(x.balance-25000)!==x.net||!Number.isFinite(x.drawdown)||x.drawdown<0)throw Error('Invalid totals');
   if(x.contributions.length!==4||new Set(x.contributions.map(m=>m.symbol)).size!==4||sum(x.contributions,'net')!==x.net||sum(x.contributions,'count')!==x.count)throw Error('Market mismatch');
   if(x.calendar.daily.length!==v.coverage.expected)throw Error('Missing days');
   for(const k of ['daily','weeks'])if(sum(x.calendar[k],'net')!==x.net||sum(x.calendar[k],'trades')!==x.count)throw Error('Calendar mismatch');
   for(const [c,b]of [[x.comparison,baseline],[x.alignmentComparison,a.aligned?v.variants.find(t=>t.id==='rr2-'+a.riskPerTrade).costs[cost]:null]])if(c){
    if(!b||c.common+c.removed.count!==b.count||c.common+c.added.count!==x.count||cents(c.added.net-c.removed.net+c.commonNetChange)!==c.delta||cents(x.net-b.net)!==c.delta)throw Error('Attribution mismatch');
   }
   const w=x.weeklyObjective,eligible=w.weeks.filter(t=>!t.partialBoundary&&t.complete);
   if(w.targetUSD!==1000||eligible.length!==w.evaluableFullWeeks||w.targetWeeks!==eligible.filter(t=>t.net>=1000).length||sum(w.weeks,'net')!==x.net)throw Error('Weekly goal mismatch');
   for(const t of w.weeks)if(t.complete!==(t.simulatedSessions===t.expectedSessions&&!t.missingSessions&&!t.stoppedSessions)||t.targetMet!==(t.complete?t.net>=1000:null))throw Error('Censored week mismatch');
   if(a.custom&&(x.plannedRisk.max>a.riskPerTrade||x.plannedRisk.maxQuantity>20||x.plannedRisk.minQuantity<1))throw Error('Planned risk mismatch');
  }
 }
 if(n!==80||total!==r.audit.executedRecords||r.study.length!==3)throw Error('Incomplete audit');
 for(const m of r.study){const v=r.views.find(v=>v.id===m.id&&v.mode==='diagnostic');if(m.markets.length!==4||sum(m.markets.map(x=>x.reference),'net')!==v.variants[0].costs.normal.net)throw Error('Study mismatch');}
 return r;
}

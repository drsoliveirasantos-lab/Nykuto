import {readFile, writeFile, mkdir, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';
import assert from 'node:assert/strict';

const [dataDirArg, outDirArg, sourceManifestArg] = process.argv.slice(2);
assert.ok(dataDirArg && outDirArg, 'Usage: node scripts/run-trading-footprint-pro-v1.mjs <private-data-dir> <private-output-dir> [source-manifest]');
const dataDir = resolve(dataDirArg);
const outDir = resolve(outDirArg);
const sourcePath = resolve(sourceManifestArg || 'trading/lab/footprint-pro-v1-source.json');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));

function sha256(buf){return createHash('sha256').update(buf).digest('hex');}
function parseLine(line){
  const out=[]; let cur=''; let q=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(q && line[i+1]==='"'){cur+='"';i++;}
      else q=!q;
    } else if(ch===',' && !q){out.push(cur);cur='';}
    else cur+=ch;
  }
  out.push(cur); return out;
}
function num(v){return v===''||v==null?NaN:Number(v);}
function mean(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN;}
function profitFactor(a){const p=a.filter(v=>v>0).reduce((s,v)=>s+v,0), n=-a.filter(v=>v<0).reduce((s,v)=>s+v,0); return n>0?p/n:(p>0?Infinity:NaN);}
function rma(values,n){
  const out=Array(values.length).fill(NaN);
  if(values.length<n)return out;
  let seed=0; for(let i=0;i<n;i++)seed+=values[i]; seed/=n; out[n-1]=seed;
  let prev=seed; for(let i=n;i<values.length;i++){prev=(prev*(n-1)+values[i])/n;out[i]=prev;}
  return out;
}
const nyFmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function nyParts(ms){const p=Object.fromEntries(nyFmt.formatToParts(new Date(ms)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return {year:+p.year,month:+p.month,day:+p.day,hour:+p.hour,minute:+p.minute};}

async function loadTf(tf,pin){
  const path=join(dataDir,pin.basename), bytes=await readFile(path), st=await stat(path);
  assert.equal(st.size,pin.bytes,`byte size mismatch M${tf}`); assert.equal(sha256(bytes),pin.sha256,`sha256 mismatch M${tf}`);
  const lines=bytes.toString('utf8').trimEnd().split(/\r?\n/), headers=parseLine(lines[0]), ix=Object.fromEntries(headers.map((h,i)=>[h,i]));
  const need=['time','open','high','low','close','FP_AVAILABLE','FP_BUY','FP_SELL','FP_DELTA_PCT_1','FP_DELTA_PCT_3','FP_DELTA_PCT_6','FP_POC_MOVE','FP_SIGNAL_SIDE','NYKUTO ENTRY','NYKUTO SL','NYKUTO TP1'];
  for(const h of need)assert.ok(h in ix,`missing ${h} in M${tf}`);
  const rows=[];
  for(let i=1;i<lines.length;i++){
    if(!lines[i])continue; const c=parseLine(lines[i]); const time=num(c[ix.time]);
    rows.push({
      time, open:num(c[ix.open]), high:num(c[ix.high]), low:num(c[ix.low]), close:num(c[ix.close]),
      fpAvailable:num(c[ix.FP_AVAILABLE]), buy:num(c[ix.FP_BUY]), sell:num(c[ix.FP_SELL]),
      d1:num(c[ix.FP_DELTA_PCT_1]), d3:num(c[ix.FP_DELTA_PCT_3]), d6:num(c[ix.FP_DELTA_PCT_6]), pocMove:num(c[ix.FP_POC_MOVE]),
      signalSide:num(c[ix.FP_SIGNAL_SIDE]), entry:num(c[ix['NYKUTO ENTRY']]), sl:num(c[ix['NYKUTO SL']]), tp1:num(c[ix['NYKUTO TP1']]),
      openMs:time*1000, closeMs:time*1000+tf*60000
    });
  }
  const tr=rows.map((r,i)=>i===0?r.high-r.low:Math.max(r.high-r.low,Math.abs(r.high-rows[i-1].close),Math.abs(r.low-rows[i-1].close)));
  const atr=rma(tr,14); rows.forEach((r,i)=>r.atr14=atr[i]);
  return rows;
}

const tfs={}; for(const [tf,pin] of Object.entries(source.files))tfs[tf]=await loadTf(+tf,pin);
const m5=tfs[5], m5Index=new Map(m5.map((r,i)=>[r.time,i]));
function latestClosed(rows,ms){let lo=0,hi=rows.length-1,ans=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(rows[mid].closeMs<=ms){ans=mid;lo=mid+1;}else hi=mid-1;}return ans>=0?rows[ans]:null;}
function simulate(signal,horizonMin=30,policy='hold',feeRT=3.25){
  const i=m5Index.get(signal.time), side=signal.signalSide, entry=signal.entry, stop=signal.sl, target=signal.tp1, risk=Math.abs(entry-stop);
  if(i==null||!Number.isFinite(risk)||risk<=0)return null; const end=signal.closeMs+horizonMin*60000;
  for(let k=i+1;k<m5.length;k++){
    const b=m5[k]; if(b.closeMs>end)break;
    if(side===1){
      if(b.open<=stop)return finish(b.open,b.closeMs,'gap_sl');
      const stopHit=b.low<=stop, tpHit=policy==='tp1'&&b.high>=target;
      if(stopHit)return finish(stop,b.closeMs,'sl');
      if(tpHit)return finish(target,b.closeMs,'tp1');
    }else{
      if(b.open>=stop)return finish(b.open,b.closeMs,'gap_sl');
      const stopHit=b.high>=stop, tpHit=policy==='tp1'&&b.low<=target;
      if(stopHit)return finish(stop,b.closeMs,'sl');
      if(tpHit)return finish(target,b.closeMs,'tp1');
    }
    if(b.closeMs===end)return finish(b.close,b.closeMs,'time');
  }
  return null;
  function finish(px,exitMs,reason){const grossR=side*(px-entry)/risk, R=grossR-feeRT/(risk*2);return {R,grossR,exitMs,reason};}
}
function sequential(rows,pred,policy){const selected=[];let busyUntil=-Infinity;for(const r of rows){const o=r.outcomes[policy];if(!o||!pred(r))continue;if(r.signal.closeMs>=busyUntil){selected.push({...r,outcome:o});busyUntil=o.exitMs;}}return selected;}
function metrics(selected){
  const rs=selected.map(x=>x.outcome.R), byPhase={}, bySide={};
  for(const x of selected){const m=new Date(x.signal.closeMs).getUTCMonth()+1, phase=m===6?'JUNE':m===7?'JULY':(m===8||m===9)?'AUG_SEP':'OTHER', side=x.signal.signalSide===1?'BUY':'SELL';(byPhase[phase]??=[]).push(x.outcome.R);(bySide[side]??=[]).push(x.outcome.R);}
  const sorted=[...rs].sort((a,b)=>b-a), wo=sorted.length>5?sorted.slice(5):[];
  return {n:rs.length,meanR:mean(rs),pf:profitFactor(rs),winRate:rs.length?rs.filter(v=>v>0).length/rs.length:NaN,sumR:rs.reduce((s,v)=>s+v,0),withoutTop5MeanR:mean(wo),phases:Object.fromEntries(Object.entries(byPhase).map(([k,v])=>[k,{n:v.length,meanR:mean(v)}])),sides:Object.fromEntries(Object.entries(bySide).map(([k,v])=>[k,{n:v.length,meanR:mean(v)}]))};
}

const signals=[];
for(const s of m5){
  if(s.fpAvailable!==1||Math.abs(s.signalSide)!==1)continue;
  const ctx={}; for(const tf of [1,2,3,4,10,15,30,45])ctx[tf]=latestClosed(tfs[tf],s.closeMs);
  const p=nyParts(s.closeMs), min=p.hour*60+p.minute, pre=min>=480&&min<570, side=s.signalSide;
  const m15=ctx[15], m10=ctx[10], m30=ctx[30], m45=ctx[45];
  const d15=m15?.fpAvailable===1?side*m15.d1:NaN, body15=m15?.fpAvailable===1&&Number.isFinite(m15.atr14)?side*(m15.close-m15.open)/m15.atr14:NaN, poc15=m15?.fpAvailable===1&&Number.isFinite(m15.atr14)?side*m15.pocMove/m15.atr14:NaN;
  const micro=[2,3,4].map(tf=>ctx[tf]); const microAvailable=micro.every(r=>r?.fpAvailable===1), microAlignCount=microAvailable?micro.filter(r=>side*r.d1>0).length:NaN;
  const features={
    pre,
    m15Bar:m15?.fpAvailable===1&&d15>0,
    m15Poc:m15?.fpAvailable===1&&side*m15.pocMove>0,
    flowResponse:pre&&m15?.fpAvailable===1&&d15>=10&&body15>=0.20,
    flowAcceptance:pre&&m15?.fpAvailable===1&&d15>=5&&body15>=0.20&&poc15>=0.02,
    m5Zone:pre&&side*s.d6>=30&&side*s.d6<=50,
    m10Press20:pre&&m10?.fpAvailable===1&&side*m10.d3>=20,
    m30Align:m30?.fpAvailable===1&&side*m30.d1>0,
    m45Align:m45?.fpAvailable===1&&side*m45.d1>0,
    stale:m15?.fpAvailable===1&&m45?.fpAvailable===1&&side*m45.d1>0&&side*m15.d1<0,
    fresh:m15?.fpAvailable===1&&m45?.fpAvailable===1&&side*m45.d1<0&&side*m15.d1>0,
    micro234Available:microAvailable,
    micro234Majority:microAvailable&&microAlignCount>=2,
    micro234All:microAvailable&&microAlignCount===3,
    m1Align:ctx[1]?.fpAvailable===1&&side*ctx[1].d1>0
  };
  features.m15BarPoc=pre&&features.m15Bar&&features.m15Poc;
  const outcomes={hold:simulate(s,30,'hold'),tp1:simulate(s,30,'tp1')};
  signals.push({signal:s,ctx,features,outcomes,d15,body15,poc15});
}
signals.sort((a,b)=>a.signal.closeMs-b.signal.closeMs);

const candidates={
  PRE_BASE:r=>r.features.pre,
  M15_BAR_POC:r=>r.features.m15BarPoc,
  FLOW_RESPONSE:r=>r.features.flowResponse,
  FLOW_ACCEPTANCE:r=>r.features.flowAcceptance,
  M5_ZONE:r=>r.features.m5Zone,
  M10_PRESS20:r=>r.features.m10Press20,
  M30_ALIGN_PRE:r=>r.features.pre&&r.features.m30Align,
  M45_ALIGN_PRE:r=>r.features.pre&&r.features.m45Align,
  STALE_ALL:r=>r.features.stale,
  FRESH_PRE:r=>r.features.pre&&r.features.fresh,
  M15_POC_M10:r=>r.features.m15BarPoc&&r.features.m10Press20,
  M15_POC_M30:r=>r.features.m15BarPoc&&r.features.m30Align,
  M15_POC_M10_M30:r=>r.features.m15BarPoc&&r.features.m10Press20&&r.features.m30Align,
  FLOW_M10:r=>r.features.flowResponse&&r.features.m10Press20,
  FLOW_M30:r=>r.features.flowResponse&&r.features.m30Align,
  FLOW_M10_M30:r=>r.features.flowResponse&&r.features.m10Press20&&r.features.m30Align,
  M15_POC_MICRO234:r=>r.features.m15BarPoc&&r.features.micro234Majority,
  FLOW_MICRO234:r=>r.features.flowResponse&&r.features.micro234Majority
};
const results={}; for(const [name,pred] of Object.entries(candidates)){results[name]={};for(const policy of ['hold','tp1']){const seq=metrics(sequential(signals,pred,policy));seq.opportunityCount=signals.filter(r=>pred(r)&&r.outcomes[policy]).length;results[name][policy]=seq;}}

const expected={
  PRE_BASE:{n:96,meanR:0.19122518206351125,pf:1.5857900332084554},
  M15_BAR_POC:{n:45,meanR:0.5552258408807497,pf:3.6951758703197686},
  FLOW_RESPONSE:{n:49,meanR:0.5190717292132881,pf:3.570630005922166},
  FLOW_ACCEPTANCE:{n:37,meanR:0.6479083486825868,pf:4.379918208494912},
  STALE_ALL:{n:347,meanR:-0.16037231652136133,pf:0.6304116713912827}
};
const reproduction=[]; for(const [name,e] of Object.entries(expected)){const a=results[name].hold, pass=a.n===e.n&&Math.abs(a.meanR-e.meanR)<1e-12&&Math.abs(a.pf-e.pf)<1e-12;reproduction.push({candidate:name,expected:e,actual:{n:a.n,meanR:a.meanR,pf:a.pf},pass});}
assert.ok(reproduction.every(x=>x.pass),'Known-candidate reproduction failed');
assert.equal(signals.length,1712,'Expected 1712 M5 signals with Footprint');

const quality={};for(const [tf,rows] of Object.entries(tfs)){const a=rows.filter(r=>r.fpAvailable===1), one=a.filter(r=>r.buy===0||r.sell===0).length;quality[`M${tf}`]={rows:rows.length,fpRows:a.length,oneSidedPct:a.length?100*one/a.length:NaN,startUtc:new Date(rows[0].openMs).toISOString(),endUtc:new Date(rows.at(-1).openMs).toISOString(),fpStartUtc:a.length?new Date(a[0].openMs).toISOString():null,fpEndUtc:a.length?new Date(a.at(-1).openMs).toISOString():null};}
const report={schema:'nykuto-footprint-pro-v1-report-v1',generatedAt:new Date().toISOString(),researchStatus:'RETROSPECTIVE_ARCHITECTURE_SCREENING_NOT_INDEPENDENT_VALIDATION',signalCountWithM5Footprint:signals.length,policies:{hold:'Structural SL -1R, otherwise mark-to-close at 30 minutes, $3.25 RT fee per MNQ contract.',tp1:'Conservative 1R-cap benchmark: first SL or TP1 (SL first on same M5 bar), otherwise mark-to-close at 30 minutes, same fee.'},quality,reproduction,results,decisionBoundary:'No commercial Pine change, no risk increase, no hard gate promotion from this run.'};
await mkdir(outDir,{recursive:true});await writeFile(join(outDir,'footprint-pro-v1-report.json'),JSON.stringify(report,null,2)+'\n');
const csv=['candidate,policy,opportunityCount,sequentialN,meanR,pf,winRate,sumR,withoutTop5MeanR'];for(const [name,ps] of Object.entries(results))for(const [policy,m] of Object.entries(ps))csv.push([name,policy,m.opportunityCount,m.n,m.meanR,m.pf,m.winRate,m.sumR,m.withoutTop5MeanR].join(','));await writeFile(join(outDir,'footprint-pro-v1-summary.csv'),csv.join('\n')+'\n');
console.log(JSON.stringify({status:'completed',signals:signals.length,reproductionPassed:reproduction.length,output:outDir,headline:{PRE_BASE:results.PRE_BASE,M15_BAR_POC:results.M15_BAR_POC,FLOW_RESPONSE:results.FLOW_RESPONSE,STALE_ALL:results.STALE_ALL,M30_ALIGN_PRE:results.M30_ALIGN_PRE}},null,2));

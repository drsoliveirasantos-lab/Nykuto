#!/usr/bin/env node
// Stage A: real-history integrity/feature diagnostics, never strategy PnL.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { sizePosition, effectiveMinutes } from '../trading/historique/pine-fidelity-core.mjs';
const [inputDir, outputFile] = process.argv.slice(2);
if (!inputDir || !outputFile) throw new Error('Usage: run-pine-fidelity-audit.mjs <audited-input-dir> <aggregate-output-file>');
const read=f=>JSON.parse(fs.readFileSync(path.join(inputDir,f)));
const m5=read('5m_corrected_intermediate.json').rows,m1=read('1m.json').rows,m15=read('15m_extended_intermediate.json').rows,h1=read('60m.json').rows;
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(inputDir,f))).digest('hex');
function features(rows){
  let fast=null,slow=null,trSum=0,atr=null,gain=0,loss=0,ag=null,al=null;
  return rows.map((r,i)=>{
    const c=r[4],prev=i?rows[i-1][4]:c,tr=Math.max(r[2]-r[3],Math.abs(r[2]-prev),Math.abs(r[3]-prev));
    fast=fast===null?c:fast+2/10*(c-fast);slow=slow===null?c:slow+2/22*(c-slow);
    if(i<14){trSum+=tr;if(i===13)atr=trSum/14;}else atr=(atr*13+tr)/14;
    if(i){gain+=Math.max(0,c-prev);loss+=Math.max(0,prev-c);if(i===14){ag=gain/14;al=loss/14;}else if(i>14){ag=(ag*13+Math.max(0,c-prev))/14;al=(al*13+Math.max(0,prev-c))/14;}}
    const rsi=ag===null?null:al===0?(ag===0?null:100):100-100/(1+ag/al);
    return {ema9:fast,ema21:slow,atr,rsi};
  });
}
const f=features(m5),prefixes=[1000,10000,40000,80000,120000,m5.length];
for(const end of prefixes)assert.deepEqual(features(m5.slice(0,end)),f.slice(0,end));
let h=0,q=0,htfChecks=0,m15Checks=0,overnightExcluded=0,geometry=0,admissibleGeometry=0,timeGateChanges=0;
const qtyHistogram={normal:{},doubleCosts:{}};
const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'});
for(let i=0;i<m5.length;i++){
  const r=m5[i],start=r[0],end=start+300;
  while(h+1<h1.length&&h1[h+1][0]+3600<=start)h++;
  while(q+1<m15.length&&m15[q+1][0]+900<=start)q++;
  if(h1[h][0]+3600<=start){assert.ok(h1[h][0]+3600<=end);htfChecks++;}
  if(m15[q][0]+900<=start){assert.ok(m15[q][0]+900<=end);m15Checks++;}
  const parts=Object.fromEntries(clock.formatToParts(new Date(end*1000)).map(p=>[p.type,p.value]));
  const minute=Number(parts.hour)*60+Number(parts.minute),dow=parts.weekday;
  if(minute===570)overnightExcluded++;
  if(i<14)continue;
  const atr=f[i-1].atr;if(!atr)continue;
  const isWeekday=['Mon','Tue','Wed','Thu','Fri'].includes(dow),monThu=['Mon','Tue','Wed','Thu'].includes(dow);
  const open=(dow==='Sun'&&minute>=1080)||(monThu&&(minute<1005||minute>=1080))||(dow==='Fri'&&minute<1005);
  const left=!open?0:isWeekday&&minute<1005?1005-minute:1440-minute+1005;
  const timeOk=open&&left>=45&&!(isWeekday&&minute>=975&&minute<990);
  const window=m5.slice(Math.max(0,i-7),i+1),buffer=Math.max(.5,atr*.1);
  const low=Math.min(...window.map(b=>b[3])),high=Math.max(...window.map(b=>b[2]));
  for(const side of [1,-1]){
    const stop=side===1?Math.floor((low-buffer)/.25)*.25:Math.ceil((high+buffer)/.25)*.25;
    const riskPoints=Math.abs(r[4]-stop);geometry++;
    if(riskPoints<=.25||riskPoints>4*atr)continue;
    for(const [name,multiplier]of [['normal',1],['doubleCosts',2]]){
      const sizing=sizePosition({riskPoints,fee:2.5*multiplier,slipTicks:2*multiplier});
      assert.ok(sizing.risk<=500+1e-9&&sizing.quantity<=5);
      qtyHistogram[name][sizing.quantity]=(qtyHistogram[name][sizing.quantity]??0)+1;
    }
    if(!timeOk||sizePosition({riskPoints}).quantity===0)continue;
    admissibleGeometry++;
    const oldOk=riskPoints/atr<=Math.sqrt(Math.max(1,Math.floor(left/5)));
    const newOk=riskPoints/atr<=Math.sqrt(Math.max(1,Math.floor(effectiveMinutes(left)/5)));
    if(oldOk!==newOk)timeGateChanges++;
  }
}
let microComparable=0,participationChanges=0;
for(let i=20;i<m1.length;i++){
  const rows=m1.slice(i-20,i+1);
  if(rows.some(r=>r[5]===null)||rows.at(-1)[0]-rows[0][0]!==1200)continue;
  const prior=rows.slice(0,20).reduce((s,r)=>s+r[5],0)/20,current=rows.slice(1).reduce((s,r)=>s+r[5],0)/20;
  if(prior<=0||current<=0)continue;
  microComparable++;
  if((rows.at(-1)[5]/prior>=1.10)!==(rows.at(-1)[5]/current>=1.10))participationChanges++;
}
const report={schema:'nykuto-pine-fidelity-stage-a-v1',status:'completed',scope:'Data and isolated mechanisms only. No full Pine compilation, scanner census, strategy PnL or automatic promotion.',inputHashes:Object.fromEntries(['5m_corrected_intermediate.json','1m.json','15m_extended_intermediate.json','60m.json'].map(file=>[file,hash(file)])),bars:{m5:m5.length,m1:m1.length,m15:m15.length,h1:h1.length},causality:{emaRsiAtrPrefixChecks:prefixes.length,h1ClosedChecks:htfChecks,m15ClosedChecks:m15Checks,parityWithTradingView:'not yet measured'},overnight:{barsEndingAt0930ExcludedByCloseClock:overnightExcluded},geometry:{bothSidesExamined:geometry,sessionRiskStopEligible:admissibleGeometry,timeFeasibilityAdmissionChangesAtDefault180Minutes:timeGateChanges,quantityHistogram:qtyHistogram,note:'All-bar stop geometries, NOT detected signals or trades. Default maxStop=4ATR and >=45min already imply sqrt(9)=3 to sqrt(36)=6; horizon clamp can be neutral for admission at defaults. TP2/TP3 require separate checks.'},micro:{comparableM1With21ConsecutiveVolumes:microComparable,participationBooleanChangesUsingPastOnlyMean:participationChanges,note:'A feature-definition comparison only. No evidence that one version wins more trades.'},performance:{executed:false,opportunities:null,tp1:null,netPnl:null},next:'Pin the full source/configuration and match TradingView bar-level signals before exact census and paired historical outcome runs.'};
fs.writeFileSync(outputFile,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

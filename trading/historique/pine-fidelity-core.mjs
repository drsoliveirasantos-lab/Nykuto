// Isolated executable specification of proposed fixes, NOT a Pine transpiler.
// It is never imported by a trading or broker execution path.
export const operationalM5 = seconds => seconds === 300;
export function sizePosition({riskPoints,budget=500,units=5,requested=5,tick=.25,pointValue=2,fee=2.5,slipTicks=2}) {
  if (![riskPoints,budget,units,requested,tick,pointValue,fee,slipTicks].every(Number.isFinite) || riskPoints<=tick || budget<=0 || tick<=0 || pointValue<=0 || fee<0 || slipTicks<0) return {quantity:0,risk:0};
  const oneRisk=riskPoints*pointValue+fee+slipTicks*tick*pointValue;
  const quantity=Math.max(0,Math.floor(Math.min(5,units,requested,Math.floor(Math.min(500,budget)/oneRisk))));
  return {quantity,risk:quantity*oneRisk,oneRisk};
}
export function effectiveMinutes(minutesToFlat,horizon=180){return Math.max(0,Math.min(minutesToFlat,horizon));}
export function evaluatePlan(plan,bar){
  const next={...plan,hit:[...(plan.hit??[false,false,false])]},events=[];
  if(!next.active||bar.time<=next.entryTime)return {plan:next,events};
  const event=type=>events.push({planId:next.id,type,time:bar.time});
  if(bar.gap){next.active=false;next.state='GAP_UNRESOLVED';event('GAP_UNRESOLVED');return {plan:next,events};}
  const sl=next.side===1?bar.low<=next.stop:bar.high>=next.stop;
  const touched=next.targets.map(p=>next.side===1?bar.high>=p:bar.low<=p);
  if(sl&&touched.some((v,i)=>v&&!next.hit[i])){next.active=false;next.state='AMBIGUOUS';event('AMBIGUOUS');return {plan:next,events};}
  if(sl){next.active=false;next.state='SL';event('SL');return {plan:next,events};}
  for(let i=0;i<3;i++)if(touched[i]&&!next.hit[i]){next.hit[i]=true;event(`TP${i+1}`);if(next.allocation)next.remaining-=next.allocation[i];}
  if(next.allocation&&next.remaining===0){next.active=false;next.state='CLOSED';event('CLOSED');}
  else if(next.hit[2]){next.active=false;next.state='TP3';}
  if(next.active&&bar.flat){next.active=false;next.state='FLAT';event('FLAT');}
  if(next.active&&bar.expired){next.active=false;next.state='EXPIRED';event('EXPIRED');}
  return {plan:next,events};
}
export function processClosedBar(oldPlan,bar,newCandidate){
  const evaluated=oldPlan?evaluatePlan(oldPlan,bar):{plan:null,events:[]};
  if(newCandidate?.admitted){return {oldPlan:evaluated.plan,plan:{...newCandidate.plan},events:[...evaluated.events,{planId:newCandidate.plan.id,type:'NEW_PLAN',time:bar.time}]};}
  return {oldPlan:evaluated.plan,...evaluated};
}
export function zoneFresh(touches,id,bar,maxAge){const last=touches.get(id);return last!==undefined&&bar>=last&&bar-last<=maxAge;}
export function overnightBar(openMinute,closeMinute){return openMinute>=1080||closeMinute<=570;}
export function uniqueParents(events){const seen=new Set();return events.filter(e=>{if(!e.parentId)throw new Error('Causal parent required');const k=`${e.side}:${e.parentId}`;if(seen.has(k))return false;seen.add(k);return true;});}

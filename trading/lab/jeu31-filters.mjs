import {sessionFor} from './session-comparison.mjs';
import {JEU31_POLICY as P,JEU31_VARIANTS} from './jeu31-policy.mjs';
const cents=n=>Math.round(n*100)/100;

export function assessMarketFilter(symbol,time,signal,context,variantId){
  const variant=JEU31_VARIANTS.find(v=>v.id===variantId);
  if(!variant||!['MES','MGC','MNQ','MYM'].includes(symbol)||!Number.isSafeInteger(time)||time%300
    ||!signal||signal.signalClose!==time||signal.signalOpen!==time-300||!['Long','Short'].includes(signal.side)
    ||sessionFor(time).day!==signal.day)throw Error('Invalid or noncausal filter request');
  if(variant.mgcMorning&&symbol==='MGC'&&sessionFor(time).minute>=P.mgcLastEntryMinuteExclusive)
    return {allowed:false,reason:'mgc-after-11'};
  if(variant.mesRsi&&symbol==='MES'){
    if(context&&(context.closedAt!==time||context.sourceTime!==time-300||context.day!==signal.day||!context.ticker?.startsWith('MES')))
      throw Error('Noncausal RSI context');
    const rsi=context?.rsi;
    if(rsi===null||rsi===undefined)return {allowed:false,reason:'mes-rsi-unknown'};
    if(typeof rsi!=='number'||!Number.isFinite(rsi)||rsi<0||rsi>100)throw Error('Invalid RSI value');
    if(signal.side==='Long'&&rsi>P.overbought)return {allowed:false,reason:'mes-overbought-long'};
    if(signal.side==='Short'&&rsi<P.oversold)return {allowed:false,reason:'mes-oversold-short'};
  }
  return {allowed:true,reason:'filter-passed'};
}

// Rebuild the signal streams BEFORE the unchanged account simulator. A blocked
// signal consumes no position, side, daily slot or loss budget.
export function filterMarketStreams(streams,contexts,variantId){
  const decisions=[];
  const filtered=streams.map(stream=>{
    const signals=new Map();
    for(const [time,signal]of stream.signals){
      const decision=assessMarketFilter(stream.symbol,time,signal,contexts.get(stream.symbol)?.get(time),variantId);
      decisions.push({symbol:stream.symbol,time,day:signal.day,side:signal.side,...decision});
      if(decision.allowed)signals.set(time,signal);
    }
    return {...stream,signals};
  });
  return {streams:filtered,decisions};
}

export function compareFilteredRuns(baseline,candidate){
  const key=t=>`${t.symbol}/${t.side}/${t.entryTime}`;
  const before=new Map(baseline.trades.map(t=>[key(t),t])),after=new Map(candidate.trades.map(t=>[key(t),t]));
  if(before.size!==baseline.trades.length||after.size!==candidate.trades.length)throw Error('Duplicate trade identity');
  const removed=baseline.trades.filter(t=>!after.has(key(t))),added=candidate.trades.filter(t=>!before.has(key(t)));
  const common=candidate.trades.filter(t=>before.has(key(t)));
  const summary=rows=>({count:rows.length,wins:rows.filter(t=>t.netDollars>0).length,losses:rows.filter(t=>t.netDollars<0).length,
    flat:rows.filter(t=>t.netDollars===0).length,net:cents(rows.reduce((n,t)=>n+t.netDollars,0))});
  const output={removed:summary(removed),added:summary(added),common:common.length,
    changedCommonExits:common.filter(t=>t.exitTime!==before.get(key(t)).exitTime||t.netDollars!==before.get(key(t)).netDollars).length,
    commonNetChange:cents(common.reduce((n,t)=>n+t.netDollars-before.get(key(t)).netDollars,0)),
    delta:cents(candidate.net-baseline.net)};
  if(cents(output.added.net-output.removed.net+output.commonNetChange)!==output.delta)throw Error('Trade attribution does not reconcile');
  return output;
}

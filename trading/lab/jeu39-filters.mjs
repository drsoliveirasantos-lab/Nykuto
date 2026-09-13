import {sessionFor} from './session-comparison.mjs';
import {JEU39_POLICY as P,JEU39_VARIANTS} from './jeu39-policy.mjs';

export function studyDecision39(signal,entry,variant,opinion=null){
 const t=signal?.signalClose;
 if(!JEU39_VARIANTS.some(v=>v.id===variant)||!Number.isSafeInteger(t)||t%300||signal.signalOpen!==t-300||sessionFor(t).day!==signal.day||!['Long','Short'].includes(signal.side))throw Error('Invalid study signal');
 if(variant==='baseline')return {accepted:true,reason:'baseline'};
 if(variant==='mnq-before-11')return {accepted:sessionFor(t).minute<P.lastEntryMinuteExclusive,reason:sessionFor(t).minute<P.lastEntryMinuteExclusive?'before-11':'at-or-after-11'};
 if(!Number.isFinite(entry)||entry<=0)throw Error('Invalid entry open');
 if(!opinion)throw Error('Missing forecast decision link');
 if(opinion.signalClose!==t)throw Error('Misaligned model opinion');
 if(opinion.status!=='valid'){
  if(!['insufficient-context','invalid-output','inference-error'].includes(opinion.status))throw Error('Unknown model abstention');
  return {accepted:true,reason:opinion.status};
 }
 if(!Number.isSafeInteger(opinion.knownAt)||opinion.knownAt>t||t-opinion.knownAt>=900||!Number.isFinite(opinion.lastClose)||opinion.lastClose<=0)throw Error('Future or invalid model opinion');
 const opposed=(signal.side==='Long'?1:-1)*(opinion.lastClose-entry)<0;
 return {accepted:!opposed,reason:opposed?'model-opposed':'model-not-opposed'};
}

export function filterStudyStreams39(streams,variant,opinions=new Map()){
 const decisions=[];
 const filtered=streams.map(stream=>{
  if(stream.symbol!=='MNQ')return stream;
  const signals=new Map(),entries=new Map(stream.candles.map(b=>[b.time,b]));
  for(const [t,signal]of stream.signals){
   if(t!==signal.signalClose)throw Error('Signal key mismatch');
   const entry=entries.get(t);if(!entry||entry.day!==signal.day)throw Error('Entry bar unavailable');
   const d=studyDecision39(signal,entry.open,variant,opinions.get(t));
   decisions.push({symbol:'MNQ',day:signal.day,signalClose:t,side:signal.side,...d});
   if(d.accepted)signals.set(t,signal);
  }
  return {...stream,signals};
 });
 return {streams:filtered,decisions};
}

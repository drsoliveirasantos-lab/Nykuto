import {JEU39_MODEL} from './jeu39-policy.mjs';
const ensure=(condition,message)=>{if(!condition)throw Error(message);};
const validRow=r=>['open','high','low','close','volume'].every(k=>Number.isFinite(r[k]))&&Math.min(r.open,r.high,r.low,r.close)>0&&r.volume>=0&&r.low<=Math.min(r.open,r.close)&&r.high>=Math.max(r.open,r.close);

export function modelOpinions39(pack,predictions){
 ensure(pack.schema==='jeu39-requests-v1'&&predictions.schema==='jeu39-forecasts-v1','Unsupported model experiment');
 const requests=new Map(pack.requests.map(r=>[r.id,r.request])),records=new Map(predictions.records.map(r=>[r.id,r]));
 ensure(requests.size===pack.requests.length&&records.size===predictions.records.length&&requests.size===records.size,'Missing or duplicate forecasts');
 const statuses=new Map();let invalid=0,errors=0;
 for(const [id,request]of requests){
  const record=records.get(id);ensure(record,'Forecast identity differs');
  ensure(request.candles.length===64&&request.futureTimes.length===4&&request.intervalSeconds===900&&request.symbol==='MNQ','Unexpected model context');
  if(record.result===null){ensure(typeof record.error==='string'&&record.error.length>0,'Unexplained inference failure');statuses.set(id,{status:'inference-error'});errors++;continue;}
  const r=record.result;ensure(record.error===null,'Ambiguous forecast result');
  for(const [key,value]of Object.entries(JEU39_MODEL))ensure(r[key]===value,'Model configuration changed: '+key);
  ensure(r.schema==='nykuto-kronos-result-v1'&&r.inputSha256===request.inputSha256&&r.contract===request.contract&&r.symbol==='MNQ'&&r.executionEnabled===false&&r.experimentOnly===true,'Unbound forecast');
  ensure(Array.isArray(r.forecast)&&r.forecast.length===4&&r.forecast.every((x,i)=>x.time===request.futureTimes[i]),'Forecast horizon mismatch');
  const invalidRows=r.forecast.flatMap((x,i)=>validRow(x)?[]:[i]);
  ensure(r.forecastValidation?.validOhlcv===(invalidRows.length===0)&&JSON.stringify(r.forecastValidation.invalidOhlcvRows)===JSON.stringify(invalidRows),'Forecast validity mismatch');
  if(invalidRows.length){invalid++;statuses.set(id,{status:'invalid-output'});}
  else statuses.set(id,{status:'valid',knownAt:request.candles.at(-1).time+900,lastClose:r.forecast.at(-1).close});
 }
 const opinions=new Map(),reasons={};
 for(const link of pack.links){
  ensure(Number.isSafeInteger(link.signalClose)&&!opinions.has(link.signalClose),'Duplicate or invalid signal link');
  const status=link.requestId===null?{status:'insufficient-context'}:statuses.get(link.requestId);ensure(status,'Missing request link');
  if(status.status==='valid')ensure(status.knownAt<=link.signalClose&&link.signalClose-status.knownAt<900,'Forecast not available at signal');
  opinions.set(link.signalClose,{signalClose:link.signalClose,...status});reasons[status.status]=(reasons[status.status]??0)+1;
 }
 return {opinions,summary:{signals:pack.links.length,uniqueRequests:requests.size,invalidForecasts:invalid,inferenceErrors:errors,signalStatuses:reasons,weightsFitted:false}};
}

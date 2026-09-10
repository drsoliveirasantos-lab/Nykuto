// Pure import/export boundary: no order, network inference or strategy mutation.
const roots = {MNQ:.25,MES:.25,MYM:1,MGC:.1};
const hashPattern=/^[a-f0-9]{64}$/;
const revisionPattern=/^[a-f0-9]{40}$/;
const fail=message=>{throw new Error(message);};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function clock(t){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t*1000)).map(x=>[x.type,x.value]));
  return {day:`${p.year}-${p.month}-${p.day}`,minute:Number(p.hour)*60+Number(p.minute)};
}
function bar(c,tick=null){
  if(!c||!Number.isSafeInteger(c.time)||c.time<946684800||!['open','high','low','close','volume'].every(k=>finite(c[k]))||c.volume<0||Math.min(c.open,c.high,c.low,c.close)<=0||c.high<Math.max(c.open,c.close,c.low)||c.low>Math.min(c.open,c.close,c.high))fail('Bougie OHLCV invalide.');
  if(tick&&['open','high','low','close'].some(k=>Math.abs(c[k]/tick-Math.round(c[k]/tick))>1e-5))fail('Prix incompatibles avec le tick du contrat.');
}
export async function requestHash(r){
  const bytes=new TextEncoder().encode(JSON.stringify([r.contract,r.intervalSeconds,r.candles.map(c=>[c.time,c.open,c.high,c.low,c.close,c.volume]),r.futureTimes]));
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function validateRequest(r,now=Date.now()){
  if(!r||r.schema!=='nykuto-kronos-request-v1'||!Object.hasOwn(roots,r.symbol)||typeof r.contract!=='string'||!new RegExp(`^${r.symbol}(?:[FGHJKMNQUVXZ]\\d{1,2}|-20\\d{2}(?:0[1-9]|1[0-2]))$`).test(r.contract))fail('Modèle de requête ou contrat natif invalide.');
  if(![60,300,900,3600].includes(r.intervalSeconds)||r.timezone!=='America/New_York'||r.timestampConvention!=='bar-open-utc-seconds'||r.amountPolicy!=='zero-unavailable')fail('Convention de temps ou de volume invalide.');
  if(!Array.isArray(r.candles)||r.candles.length<32||r.candles.length>512||!Array.isArray(r.futureTimes)||r.futureTimes.length<1||r.futureTimes.length>4)fail('Il faut 32 à 512 bougies et 1 à 4 heures de début futures.');
  for(let i=0;i<r.candles.length;i++){
    const c=r.candles[i];bar(c,roots[r.symbol]);
    if((c.time+r.intervalSeconds)*1000>now)fail('Une bougie d’entrée n’est pas encore clôturée.');
    const s=clock(c.time),e=clock(c.time+r.intervalSeconds),prev=r.candles[i-1];
    if(c.time%60||s.day!==e.day||s.minute<570||e.minute>960)fail('Ce module accepte seulement la séance cash 9h30–16h New York.');
    if(prev&&(c.time<=prev.time||(clock(prev.time).day===s.day&&c.time-prev.time!==r.intervalSeconds)))fail('Doublon, ordre temporel ou trou intrajournalier.');
  }
  const last=r.candles.at(-1),day=clock(last.time).day;
  r.futureTimes.forEach((t,i)=>{
    if(!Number.isSafeInteger(t)||t!==last.time+(i+1)*r.intervalSeconds||clock(t).day!==day||clock(t+r.intervalSeconds).minute>960)fail('Horizon non contigu ou hors séance : choisis une fin de sélection plus tôt.');
  });
  if(!hashPattern.test(r.inputSha256)||r.inputSha256!==await requestHash(r))fail('L’empreinte ne correspond pas aux données.');
  return r;
}
export async function createRequest({symbol,contract,intervalSeconds,candles,horizon=4}){
  const r={schema:'nykuto-kronos-request-v1',symbol,contract,intervalSeconds,timezone:'America/New_York',timestampConvention:'bar-open-utc-seconds',amountPolicy:'zero-unavailable',candles:candles.map(({time,open,high,low,close,volume})=>({time,open,high,low,close,volume})),futureTimes:Array.from({length:horizon},(_,i)=>candles.at(-1).time+(i+1)*intervalSeconds)};
  r.inputSha256=await requestHash(r);return validateRequest(r);
}
export async function validateForecast(result,request,registry){
  await validateRequest(request);
  if(!result||result.schema!=='nykuto-kronos-result-v1'||result.inputSha256!==request.inputSha256||result.model!=='NeoQuasar/Kronos-mini'||result.executionEnabled!==false)fail('Résultat incompatible avec la sélection ou usage non autorisé.');
  for(const k of ['modelRevision','tokenizerRevision','codeRevision'])if(!revisionPattern.test(result[k])||result[k]!==registry[k])fail('Révision différente du modèle audité.');
  if(!Number.isSafeInteger(result.seed)||!finite(result.elapsedSeconds)||result.elapsedSeconds<0||!Number.isFinite(Date.parse(result.generatedAt)))fail('Métadonnées de calcul incomplètes.');
  if(!Array.isArray(result.forecast)||result.forecast.length!==request.futureTimes.length)fail('Horizon incomplet.');
  result.forecast.forEach((c,i)=>{bar(c);if(c.time!==request.futureTimes[i])fail('Horaires de prévision incompatibles.');});
  return result;
}
export function downloadJson(value,name){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

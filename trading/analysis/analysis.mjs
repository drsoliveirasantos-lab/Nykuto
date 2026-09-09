import { loadAnalysisHistory } from './analysis-source.mjs';
import { selectAnalysisWindow, aggregateCashHours, analyzeCandles } from './structure-core.mjs';
import { calculateIndicators, DEFAULT_LAYERS } from './chart-indicators.mjs';
import { createAnalysisChart } from './chart-view.mjs';

const el = id => document.getElementById(`analysis${id}`);
const price = n => new Intl.NumberFormat('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
const stamp = t => new Intl.DateTimeFormat('fr-FR', { timeZone:'America/New_York', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(t * 1000));
const tickStamp = (t, type) => new Intl.DateTimeFormat('fr-FR', { timeZone:'America/New_York', ...(type===0?{year:'numeric'}:type===1?{month:'short'}:type===2?{day:'2-digit',month:'2-digit'}:{hour:'2-digit',minute:'2-digit'}) }).format(new Date(t * 1000));
let groups = [], bars = [], endIndex = 0, chart = null, observer = null, current = null;
const layers={...DEFAULT_LAYERS};
const layerLabels={ema:'EMA 9 jaune / 21 bleue',pivots:'HH / LH / HL / LL',bos:'BOS',mss:'MSS ?',breaks:'Autres ruptures',engulfing:'Englobantes',patterns:'Doji / mèches',levels:'Niveaux',rsi:'RSI 14',volume:'Volume',bands:'Bollinger 20'};

function clearResults(message) {
  el('Status').textContent = message;
  el('Results').hidden = true;
  el('EventsPanel').hidden = true;
  current=null;
}
function list(id, texts) {
  el(id).replaceChildren(...texts.map(text => { const li=document.createElement('li');li.textContent=text;return li; }));
}
function draw() {
  if(!current)return;
  const {candles,result,indicators,interval,key}=current;
  const visible=Object.keys(layers).filter(k=>layers[k]);
  el('LayerCount').textContent=`${visible.length} affichés`;
  el('VisibleLayers').textContent=visible.length?visible.map(k=>layerLabels[k]).join(' · '):'Bougies seules · tous les indicateurs sont masqués.';
  const lastRsi=indicators.rsi.at(-1)?.value;
  el('RsiValue').textContent=lastRsi===undefined?'RSI indisponible : au moins 15 bougies sont nécessaires.':`Dernière bougie : ${price(lastRsi)} · repères 30 / 70, sans signal d’ordre.`;
  try {
    if (!chart) {
      if (!window.LightweightCharts) throw new Error('Chart unavailable');
      chart=createAnalysisChart(window.LightweightCharts,{price:el('Chart'),rsi:el('RsiChart'),rsiPanel:el('RsiPanel')},{tick:tickStamp,stamp});
      observer=new ResizeObserver(()=>{if(chart&&!el('Results').hidden)chart.resize();});
      observer.observe(el('Chart'));
    }
    chart.draw(candles,result,indicators,interval,layers,key);
    el('ChartError').hidden=true;el('Fit').disabled=false;
  } catch {
    // Text remains usable if the external chart library is blocked.
    if (chart) { observer?.disconnect();chart.destroy();chart=null; }
    el('RsiPanel').hidden=true;
    el('ChartError').hidden=false;el('Fit').disabled=true;
  }
}
function render() {
  try {
    const requested=Number(el('Count').value),interval=Number(el('Interval').value);
    const candles=selectAnalysisWindow(bars,requested,endIndex);
    const r=analyzeCandles(candles,interval), last=r.events.at(-1);
    el('Results').hidden=false;el('EventsPanel').hidden=false;
    el('ChartTitle').textContent=`${el('Contract').value} · ${interval===900?'15 minutes':'1 heure'} · ${r.count} bougies`;
    el('Scope').textContent=`Du ${stamp(r.first)} au ${stamp(r.closedAt)} (clôture) · New York`;
    el('Status').textContent=`Historique vérifié · ${r.count} bougies analysées${r.count<requested?` sur ${requested} demandées : début de l’historique atteint`:''}. Fin réelle : ${stamp(r.closedAt)} à New York.`;
    el('Summary').textContent=r.insufficient?'La sélection ne contient pas encore assez de pivots confirmés pour décrire une structure haussière ou baissière. Les observations disponibles restent détaillées ci-dessous.':`Structure ${r.structure.toLowerCase()} sur les derniers sommets et creux confirmés. Les moyennes mobiles et la dernière rupture complètent cette lecture ; elles peuvent diverger.`;
    el('Trend').textContent=r.structure;
    el('Momentum').textContent=r.momentum==='Insuffisant'?'Au moins 21 bougies nécessaires':`${r.momentum} · EMA 9 : ${price(r.fast)} · EMA 21 : ${price(r.slow)}`;
    el('Pattern').textContent=r.patterns.join(' · ');
    el('Break').textContent=last?`${last.kind} ${last.direction==='up'?'vers le haut':'vers le bas'} · clôture du ${stamp(last.closedAt)}`:'Aucune clôture de rupture détectée dans cette sélection.';
    list('Levels',[r.activeHigh,r.activeLow].filter(Boolean).map(p=>`${p.type==='high'?'Sommet':'Creux'} à ${price(p.price)} · confirmé le ${stamp(p.confirmedAt)}${p.broken?' · déjà franchi en clôture':''}.`));
    if (!r.activeHigh&&!r.activeLow) list('Levels',['Aucun pivot confirmé dans cette sélection.']);
    const reasons=[`${r.highs.length} sommets et ${r.lows.length} creux confirmés. Deux bougies de chaque côté sont nécessaires.`];
    if(r.highs.length>=2)reasons.push(`Deux derniers sommets : ${price(r.highs.at(-2).price)} → ${price(r.highs.at(-1).price)}.`);
    if(r.lows.length>=2)reasons.push(`Deux derniers creux : ${price(r.lows.at(-2).price)} → ${price(r.lows.at(-1).price)}.`);
    if(last)reasons.push(`Dernière rupture : clôture à ${price(last.close)}, au-delà du pivot à ${price(last.level)}. ${last.impulse?'Impulsion dans le sens de la rupture selon la règle définie.':'Critère d’impulsion non satisfait ou historique trop court.'}`);
    reasons.push(`Variation entre la première ouverture et la dernière clôture : ${price(r.variationPct)} %. Ce n’est pas un résultat de trading.`);
    reasons.push(r.volumeRatio===null?'Volume relatif indisponible : 20 bougies précédentes avec volume moyen positif sont nécessaires.':`Volume de la dernière bougie : ${price(r.volumeRatio)} fois la moyenne des 20 précédentes de la sélection. Cette comparaison ne corrige pas l’effet de l’heure de séance.`);
    if(r.atr!==null)reasons.push(`ATR 14 : ${price(r.atr)} points, initialisé au début de la sélection.`);
    list('Reasons',reasons);
    const rows=r.events.map(e=>{const tr=document.createElement('tr');[stamp(e.closedAt),e.kind,e.direction==='up'?'Hausse':'Baisse',price(e.level),stamp(e.pivotConfirmedAt)].forEach(text=>{const td=document.createElement('td');td.textContent=text;tr.appendChild(td);});return tr;});
    if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='Aucune rupture détectée dans cette sélection.';tr.appendChild(td);rows.push(tr);}
    el('Events').replaceChildren(...rows);
    el('EndIndex').max=String(bars.length-1);el('EndIndex').value=String(endIndex);
    el('EndIndex').setAttribute('aria-valuetext',`Fin le ${stamp(r.closedAt)} à New York`);
    el('Previous').disabled=endIndex===0;el('Next').disabled=endIndex===bars.length-1;
    el('EndDate').value=bars[endIndex].day;
    current={candles,result:r,indicators:calculateIndicators(candles),interval,key:`${el('Contract').value}:${interval}:${r.first}:${r.last}:${r.count}`};
    draw();
  } catch(error) { clearResults(error.message); }
}
function rebuild(resetDate=false) {
  const group=groups.find(g=>g.ticker===el('Contract').value);
  if(!group)throw new Error('Ce contrat ne contient pas de données vérifiées.');
  bars=Number(el('Interval').value)===3600?aggregateCashHours(group.candles):group.candles;
  if(!bars.length)throw new Error('Aucune bougie complète disponible.');
  const date=el('EndDate');date.min=bars[0].day;date.max=bars.at(-1).day;
  el('DateRange').textContent=`Ce contrat : du ${date.min.split('-').reverse().join('/')} au ${date.max.split('-').reverse().join('/')}. La fin retenue est la dernière bougie disponible au plus tard ce jour-là.`;
  if(resetDate||!date.value||date.value<date.min||date.value>date.max)date.value=date.max;
  setDateEndpoint();
}
function setDateEndpoint() {
  const date=el('EndDate').value;
  if(!date||date<bars[0]?.day||date>bars.at(-1)?.day)throw new Error('Choisis une date dans l’historique disponible.');
  endIndex=bars.findLastIndex(c=>c.day<=date);
  if(endIndex<0)throw new Error('Aucune bougie avant cette date.');
  render();
}
function safely(action) { try {action();} catch(error) {clearResults(error.message);} }
async function reload() {
  el('Reload').disabled=true;el('Inputs').disabled=true;
  clearResults('Chargement et vérification de l’historique…');
  el('Availability').textContent='Vérification de la dernière séance disponible…';
  try {
    await window.Nykuto?.ready;groups=await loadAnalysisHistory();rebuild();el('Inputs').disabled=false;
    const latest=latestGroup().candles.at(-1);
    el('Availability').textContent=`Historique disponible jusqu’au ${latest.day.split('-').reverse().join('/')} · séance américaine. Il n’y a pas de flux MNQ en direct : une journée plus récente ne peut pas encore être analysée ici. Recharger relit ce même historique vérifié.`;
  }
  catch(error) { groups=[];bars=[];clearResults(error.message);el('Availability').textContent='Historique indisponible : impossible de vérifier la dernière séance pour le moment.'; }
  finally {el('Reload').disabled=false;}
}
el('Form').addEventListener('submit',e=>{e.preventDefault();safely(()=>el('EndDate').value===bars[endIndex]?.day?render():setDateEndpoint());});
el('Contract').addEventListener('change',()=>safely(()=>rebuild(true)));
el('Interval').addEventListener('change',()=>safely(()=>rebuild()));
el('EndDate').addEventListener('change',()=>safely(setDateEndpoint));
el('Count').addEventListener('input',()=>{
  const valid=el('Count').checkValidity();el('Count').setAttribute('aria-invalid',String(!valid));
  if(valid)safely(render);
  else el('Status').textContent='Saisis un nombre entier entre 20 et 500. Le graphique et la lecture restent ceux de la dernière sélection valide.';
});
el('EndIndex').addEventListener('input',()=>{endIndex=Number(el('EndIndex').value);render();});
el('Previous').addEventListener('click',()=>{endIndex=Math.max(0,endIndex-1);render();});
el('Next').addEventListener('click',()=>{endIndex=Math.min(bars.length-1,endIndex+1);render();});
function latestGroup(){return groups.reduce((latest,g)=>!latest||g.candles.at(-1).time>latest.candles.at(-1).time?g:latest,null);}
el('Latest').addEventListener('click',()=>safely(()=>{el('Contract').value=latestGroup().ticker;rebuild(true);}));
el('LayerInputs').addEventListener('change',event=>{
  const input=event.target;
  if(input.type==='checkbox'&&Object.hasOwn(layers,input.name)){layers[input.name]=input.checked;draw();}
});
function setLayers(values){
  for(const key of Object.keys(layers)){layers[key]=!!values[key];el('LayerInputs').querySelector(`[name="${key}"]`).checked=layers[key];}
  draw();
}
el('LayerReset').addEventListener('click',()=>setLayers(DEFAULT_LAYERS));
el('LayerClear').addEventListener('click',()=>setLayers({}));
el('Fit').addEventListener('click',()=>chart?.fit());
el('Reload').addEventListener('click',reload);
reload();

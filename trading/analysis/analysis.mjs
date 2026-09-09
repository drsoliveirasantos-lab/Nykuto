import { loadAnalysisHistory } from './analysis-source.mjs';
import { selectAnalysisWindow, aggregateCashHours, analyzeCandles } from './structure-core.mjs';

const el = id => document.getElementById(`analysis${id}`);
const price = n => new Intl.NumberFormat('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
const stamp = t => new Intl.DateTimeFormat('fr-FR', { timeZone:'America/New_York', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(t * 1000));
const tickStamp = (t, type) => new Intl.DateTimeFormat('fr-FR', { timeZone:'America/New_York', ...(type===0?{year:'numeric'}:type===1?{month:'short'}:type===2?{day:'2-digit',month:'2-digit'}:{hour:'2-digit',minute:'2-digit'}) }).format(new Date(t * 1000));
let groups = [], bars = [], endIndex = 0, chart = null, series = null, lines = [], observer = null;

function clearResults(message) {
  el('Status').textContent = message;
  el('Results').hidden = true;
  el('EventsPanel').hidden = true;
  if (series) { series.setData([]); series.setMarkers([]); }
}
function list(id, texts) {
  el(id).replaceChildren(...texts.map(text => { const li=document.createElement('li');li.textContent=text;return li; }));
}
function draw(candles, result) {
  try {
    if (!chart) {
      if (!window.LightweightCharts) throw new Error('Chart unavailable');
      const host=el('Chart');
      chart=window.LightweightCharts.createChart(host, {
        width:host.clientWidth, height:host.clientHeight,
        layout:{background:{type:'solid',color:'#07111f'},textColor:'#c7d9e8',fontSize:11},
        grid:{vertLines:{color:'#17283c'},horzLines:{color:'#17283c'}},
        rightPriceScale:{borderColor:'#263d56'},timeScale:{timeVisible:true,secondsVisible:false,borderColor:'#263d56',tickMarkFormatter:tickStamp},
        localization:{locale:'fr-FR',timeFormatter:stamp}
      });
      series=chart.addCandlestickSeries({upColor:'#34dfbc',downColor:'#fb8b9e',borderVisible:false,wickUpColor:'#34dfbc',wickDownColor:'#fb8b9e',priceFormat:{type:'price',precision:2,minMove:0.25}});
      observer=new ResizeObserver(()=>{if(!el('Results').hidden)chart.resize(host.clientWidth,host.clientHeight);});
      observer.observe(host);
    }
    series.setData(candles.map(({time,open,high,low,close})=>({time,open,high,low,close})));
    // Mark the breaking candle, never a pivot before its confirmation time.
    series.setMarkers(result.events.map(e=>({time:e.time,position:e.direction==='up'?'belowBar':'aboveBar',color:e.direction==='up'?'#34dfbc':'#fb8b9e',shape:'circle',text:e.kind==='MSS potentiel'?'MSS ?':e.kind==='BOS'?'BOS':'Rupture'})));
    lines.forEach(line=>series.removePriceLine(line));lines=[];
    [result.activeHigh,result.activeLow].filter(Boolean).forEach(p=>lines.push(series.createPriceLine({price:p.price,color:p.type==='high'?'#81bfff':'#f0c078',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:p.type==='high'?'Sommet':'Creux'})));
    chart.timeScale().fitContent();
    el('ChartError').hidden=true;el('Fit').disabled=false;
  } catch {
    // Text remains usable if the external chart library is blocked.
    if (chart) { observer?.disconnect();chart.remove();chart=null;series=null;lines=[]; }
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
    draw(candles,r);
  } catch(error) { clearResults(error.message); }
}
function rebuild(resetDate=false) {
  const group=groups.find(g=>g.ticker===el('Contract').value);
  if(!group)throw new Error('Ce contrat ne contient pas de données vérifiées.');
  bars=Number(el('Interval').value)===3600?aggregateCashHours(group.candles):group.candles;
  if(!bars.length)throw new Error('Aucune bougie complète disponible.');
  const date=el('EndDate');date.min=bars[0].day;date.max=bars.at(-1).day;
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
  try { await window.Nykuto?.ready;groups=await loadAnalysisHistory();rebuild();el('Inputs').disabled=false; }
  catch(error) { groups=[];bars=[];clearResults(error.message); }
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
el('Fit').addEventListener('click',()=>chart?.timeScale().fitContent());
el('Reload').addEventListener('click',reload);
reload();

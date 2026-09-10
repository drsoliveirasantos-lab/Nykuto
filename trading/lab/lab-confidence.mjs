import {verifyConfidenceReport} from './jeu37-report-validation.mjs';
import {MONTHS37, GRADE_LABELS37, calendarCells37, gradeEvidence37} from './jeu37-calendar-view.mjs';
const el=id=>document.getElementById(id);
const money=(n,currency='USD')=>n===null?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(n);
const shortDate=d=>d.slice(8,10)+'/'+d.slice(5,7);
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e;};
function tableRows(id,values){el(id).replaceChildren();for(const valuesRow of values){const tr=node('tr');for(const value of valuesRow)tr.append(node('td',value));el(id).append(tr);}}
function dayState(d){if(d.state==='weekend')return 'Week-end';if(d.state==='not-studied')return 'Non étudié';if(d.state.startsWith('stopped-'))return 'Arrêt';return d.trades===0?'Sans trade':`${d.trades} trade(s)`;}
async function init(){
 const response=await fetch(new URL('./jeu37-report.json',import.meta.url),{cache:'no-store'});
 if(!response.ok)throw Error('Unavailable');
 const r=await verifyConfidenceReport(await response.arrayBuffer());let selectedDay='2026-06-01';
 function render(){
  const variant=el('risk37Variant').value,cost=el('risk37Cost').value,profile=r.variants.find(v=>v.id===variant);
  const views=MONTHS37.map(month=>r.views.find(v=>v.month===month&&v.variant===variant));
  tableRows('risk37Comparison',r.variants.filter(v=>!v.control).map(v=>{
   const cells=MONTHS37.map(m=>r.views.find(x=>x.month===m&&x.variant===v.id).costs[cost]);
   return [v.label,...cells.map(c=>money(c.net)),`${cells.filter(c=>c.profitGoalAchieved).length}/3`,money(Math.max(...cells.map(c=>c.drawdown)))];
  }));
  tableRows('risk37Grades',gradeEvidence37(r.views,cost).map(q=>[q.symbol,GRADE_LABELS37[q.grade],q.trades,`${q.wins}/${q.trades}`,money(q.net),q.meanNetR===null?'—':`${q.meanNetR.toFixed(3)} R`]));
  tableRows('risk37MarketTotals',['MNQ','MES','MGC','MYM'].map(symbol=>[symbol,...views.map(v=>money(v.costs[cost].contributions.find(m=>m.symbol===symbol).net))]));
  tableRows('risk37Stats',views.map(v=>{const c=v.costs[cost];return [v.label,c.trades,money(c.mean),money(c.averageWin),money(c.averageLoss),money(c.best),money(c.averageRiskUSD)];}));
  el('risk37Policy').textContent=profile.graded?`MNQ et MES : ${profile.caps.join(' / ')} $ de perte planifiée maximale selon les trois niveaux de confirmation. MGC : plafond nominal de 100 $. Limite quotidienne interne : ${money(profile.dailyLoss)}.`:`MNQ et MES : plafond nominal de ${money(profile.maxRisk)} par trade ; MGC : 100 $. Limite quotidienne interne : ${money(profile.dailyLoss)}.`;
  el('risk37Calendars').replaceChildren();
  for(const v of views){
   const c=v.costs[cost],card=node('article',undefined,'risk-month'),heading=node('h4',v.label+' 2026');card.append(heading);
   card.append(node('p',money(c.net),`risk-month-total ${c.net<0?'is-loss':'is-gain'}`));
   card.append(node('p',`4 000 $ : ${c.profitGoalAchieved?'atteints le '+shortDate(c.profitGoalDay):'non atteints'} · retrait personnel simulé : ${money(c.receiptEUR,'EUR')}.`,'risk-month-note'));
   const weekdays=node('div',undefined,'risk-calendar-weekdays');for(const name of ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'])weekdays.append(node('span',name));card.append(weekdays);
   const grid=node('div',undefined,'risk-calendar-grid');grid.setAttribute('aria-label','Résultats de '+v.label+' 2026');
   for(const d of calendarCells37(v.period,c.calendar.daily)){
    if(d.state==='padding'){grid.append(node('span',undefined,'risk-day-padding'));continue;}
    const active=typeof d.net==='number',tile=node('button',undefined,'risk-day '+(active?(d.net>0?'is-gain':d.net<0?'is-loss':'is-flat'):'is-inactive'));
    tile.type='button';tile.setAttribute('aria-pressed',String(d.day===selectedDay));tile.setAttribute('aria-label',`${shortDate(d.day)} : ${dayState(d)}${active?', '+money(d.net):''}`);
    tile.append(node('span',Number(d.day.slice(8)), 'risk-day-number'));
    tile.append(node('span',active?(d.net>0?'+':'')+Math.round(d.net):dayState(d),'risk-day-value'));
    if(d.receiptEUR>0)tile.append(node('span','Retrait','risk-day-payout'));
    tile.addEventListener('click',()=>{selectedDay=d.day;render();});grid.append(tile);
   }
   card.append(grid);el('risk37Calendars').append(card);
  }
  const days=views.flatMap(v=>calendarCells37(v.period,v.costs[cost].calendar.daily)),d=days.find(d=>d.day===selectedDay),active=typeof d?.net==='number';
  el('risk37DayTitle').textContent=shortDate(selectedDay)+'/2026 · '+dayState(d);
  el('risk37DaySummary').textContent=active?`Résultat : ${money(d.net)} · cumul du mois : ${money(d.cumulative)} · ${d.trades} trade(s) · risque planifié moyen : ${money(d.averageRiskUSD)}. Versement simulé ce jour : ${money(d.receiptEUR,'EUR')}.`:'Aucun résultat calculé pour cette date. Cette case ne représente pas un gain nul.';
  tableRows('risk37DayMarkets',active?d.markets.map(m=>[m.symbol,m.trades,money(m.net)]):[]);
  el('risk37DayTable').hidden=!active;
  tableRows('risk37Weeks',views.flatMap(v=>v.costs[cost].calendar.weeks.map(w=>[v.label,`${shortDate(w.start)}–${shortDate(w.end)}${w.partialMonth?' *':''}`,money(w.net),money(w.cumulative),money(w.receiptEUR,'EUR')])));
 }
 for(const id of ['risk37Variant','risk37Cost'])el(id).addEventListener('change',render);
 render();el('risk37Results').hidden=false;el('risk37Message').textContent='36 simulations terminées. Aucun barème ne satisfait l’objectif sur les trois mois et les deux niveaux de coûts.';
}
init().catch(()=>{el('risk37Results').hidden=true;el('risk37Message').textContent='Le bilan vérifié est indisponible. Recharge la page ou consulte le rapport.';});

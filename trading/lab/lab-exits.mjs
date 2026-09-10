import {verifyExitReport} from './jeu35-report-validation.mjs';
const el=id=>document.getElementById(id),usd=n=>n===null?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n),eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n),date=d=>d.slice(8,10)+'/'+d.slice(5,7);
function rows(id,values){const body=el(id);body.replaceChildren();for(const vals of values){const tr=document.createElement('tr');for(const v of vals){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}body.append(tr);}}
async function init(){
 const response=await fetch(new URL('./jeu35-report.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Unavailable');const r=await verifyExitReport(await response.arrayBuffer());
 function render(){
  const month=el('exit35Month').value,variant=el('exit35Variant').value,mode=el('exit35Mode').value,cost=el('exit35Cost').value;
  const find=(m,v)=>r.views.find(x=>x.month===m&&x.variant===v&&x.mode===mode).costs[cost],c=find(month,variant),b=find(month,'baseline'),d=c.comparison;
  rows('exit35Months',['june','july','august'].map(m=>[r.views.find(v=>v.month===m).label,...r.variants.map(v=>usd(find(m,v.id).net))]));
  rows('exit35Markets',c.contributions.map(m=>[m.symbol,m.trades,usd(b.contributions.find(x=>x.symbol===m.symbol).net),usd(m.net),usd(m.mean)]));
  rows('exit35Stats',[
   ['Trades',b.trades,c.trades],['Gagnants / perdants',`${b.wins} / ${b.losses}`,`${c.wins} / ${c.losses}`],['Gagnant moyen',usd(b.averageWin),usd(c.averageWin)],['Perdant moyen',usd(b.averageLoss),usd(c.averageLoss)],['Moyenne de tous les trades',usd(b.mean),usd(c.mean)],['Baisse maximale réalisée',usd(b.drawdown),usd(c.drawdown)],['Durée moyenne minimale (minutes)',b.meanDurationLowerMinutes,c.meanDurationLowerMinutes],['Versement personnel simulé',eur(b.receiptEUR),eur(c.receiptEUR)]
  ]);
  rows('exit35Weeks',c.calendar.weeks.map((w,i)=>[`${date(w.start)}–${date(w.end)}${w.partialMonth?' *':''}`,usd(b.calendar.weeks[i].net),usd(w.net),usd(w.cumulative),eur(w.receiptEUR)]));
  el('exit35Result').textContent=variant==='baseline'?'Référence 2R conservée. Les deux extensions 3R échouent au critère fixé avant le test.':`${usd(d.delta)} par rapport à 2R dans ce mois. ${d.winnersToLosers} trade(s) gagnant(s) à 2R devenu(s) perdant(s) sur le marché modifié. Écart des entrées communes : ${usd(d.commonDelta)} ; résultat des entrées retirées : ${usd(d.removedNet)} ; nouvelles entrées : ${usd(d.addedNet)}.`;
  el('exit35Note').textContent=mode==='funded'?`Funded supposé déjà obtenu, neuf chaque mois. Objectif de retrait : ${c.personalGoalAchieved?'atteint en simulation':'non atteint'}. ${c.payout.qualifyingDays}/5 jours à au moins 150 $.`:'Évaluation neuve chaque mois : aucun bénéfice retirable à cette étape. Les gains ne sont pas transférés au scénario funded.';
 }
 for(const id of ['exit35Month','exit35Variant','exit35Mode','exit35Cost'])el(id).addEventListener('change',render);
 render();el('exit35Results').hidden=false;el('exit35Message').textContent='36 simulations terminées · 2R conservé · aucun objectif mensuel de retrait atteint.';
}
init().catch(()=>{el('exit35Results').hidden=true;el('exit35Message').textContent='Le bilan vérifié est indisponible. Recharge la page ou consulte le rapport.';});

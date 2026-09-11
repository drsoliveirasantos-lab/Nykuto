import {verifyMonthlyReport} from './jeu34-report-validation.mjs';
const el=id=>document.getElementById(id),usd=n=>n===null?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n),eur=n=>n===null?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n),date=d=>d.slice(8,10)+'/'+d.slice(5,7);
function rows(id,values){const body=el(id);body.replaceChildren();for(const vals of values){const tr=document.createElement('tr');for(const v of vals){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}body.append(tr);}}
async function init(){
 const response=await fetch(new URL('./jeu34-report.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Unavailable');const report=await verifyMonthlyReport(await response.arrayBuffer());
 function render(){
  const month=el('monthlyGoalMonth').value,variant=el('monthlyGoalVariant').value,mode=el('monthlyGoalMode').value,cost=el('monthlyGoalCost').value;
  const view=report.views.find(v=>v.month===month&&v.variant===variant&&v.mode===mode);if(!view)throw Error('Unknown view');const c=view.costs[cost];
  rows('monthlyGoalWeeks',c.calendar.weeks.map(w=>[`${date(w.start)}–${date(w.end)}${w.partialMonth?' *':''}`,w.trades,usd(w.net),usd(w.cumulative),eur(w.receiptEUR),eur(w.maxReceiptEUR)]));
  rows('monthlyGoalTrades',[
   ['Trades',c.trades],['Gagnants / perdants',`${c.wins} / ${c.losses}`],['Gain moyen des gagnants',usd(c.averageWin)],['Perte moyenne des perdants',usd(c.averageLoss)],['Moyenne de tous les trades',usd(c.mean)],['Meilleur trade',usd(c.best)],['Pire trade',usd(c.worst)]
  ]);
  rows('monthlyGoalComparison',['june','july','august'].map(m=>{const a=report.views.find(v=>v.month===m&&v.variant==='four-markets'&&v.mode===mode),b=report.views.find(v=>v.month===m&&v.variant==='without-mym'&&v.mode===mode);return [a.label,usd(a.costs[cost].net),usd(b.costs[cost].net),eur(b.costs[cost].receiptEUR)];}));
  const p=c.payout;
  el('monthlyGoalResult').textContent=c.personalGoalAchieved?`Objectif personnel simulé atteint le ${date(c.goalDay)} : ${eur(c.receiptEUR)} après partage. Arrêt du mois.`:
   mode==='evaluation'?`Évaluation : ${usd(c.net)} de résultat. Aucun retrait possible à cette étape ; ces gains ne sont pas transférés au scénario funded.`:
   `Objectif personnel non atteint. Résultat du mois : ${usd(c.net)} ; versement simulé : ${eur(c.receiptEUR)}. ${p.qualifyingDays}/5 journées à au moins 150 $. Bénéfice encore nécessaire pour la demande de 1 000 € : ${usd(p.remainingProfitUSD)}.`;
  el('monthlyGoalNote').textContent=mode==='funded'?'Hypothèse : évaluation déjà réussie avant le mois. Solde 50 000 $, bénéfice et compteurs remis à zéro à chaque début de mois. Aucun retrait intermédiaire plus petit.':'Compte d’évaluation neuf chaque mois. Le passage au funded dans le même mois n’est pas simulé.';
 }
 for(const id of ['monthlyGoalMonth','monthlyGoalVariant','monthlyGoalMode','monthlyGoalCost'])el(id).addEventListener('change',render);
 render();el('monthlyGoalResults').hidden=false;el('monthlyGoalMessage').textContent='24 simulations terminées · chaque mois repart de zéro · aucun objectif de retrait atteint.';
}
init().catch(()=>{el('monthlyGoalResults').hidden=true;el('monthlyGoalMessage').textContent='Le bilan vérifié est indisponible. Recharge la page ou consulte le rapport détaillé.';});

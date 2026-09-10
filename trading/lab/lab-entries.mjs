import {verifyEntryReport} from './jeu36-report-validation.mjs';
const el=id=>document.getElementById(id),usd=n=>n===null?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n),eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n),date=d=>d.slice(8,10)+'/'+d.slice(5,7);
function rows(id,values){const body=el(id);body.replaceChildren();for(const vals of values){const tr=document.createElement('tr');for(const v of vals){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}body.append(tr);}}
async function init(){
 const response=await fetch(new URL('./jeu36-report.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Unavailable');const r=await verifyEntryReport(await response.arrayBuffer());
 function render(){
  const month=el('entry36Month').value,variant=el('entry36Variant').value,mode=el('entry36Mode').value,cost=el('entry36Cost').value;
  const find=(m,v)=>r.views.find(x=>x.month===m&&x.variant===v&&x.mode===mode).costs[cost],c=find(month,variant),b=find(month,'baseline'),d=c.comparison;
  rows('entry36Months',['june','july','august'].map(m=>[r.views.find(v=>v.month===m).label,...r.variants.map(v=>usd(find(m,v.id).net))]));
  rows('entry36Markets',c.contributions.map(m=>[m.symbol,m.trades,usd(b.contributions.find(x=>x.symbol===m.symbol).net),usd(m.net),usd(m.mean)]));
  rows('entry36Stats',[
   ['Trades',b.trades,c.trades],['Gagnants / perdants',`${b.wins} / ${b.losses}`,`${c.wins} / ${c.losses}`],['Gagnant moyen',usd(b.averageWin),usd(c.averageWin)],['Perdant moyen',usd(b.averageLoss),usd(c.averageLoss)],['Moyenne de tous les trades',usd(b.mean),usd(c.mean)],['Pertes dès la bougie d’entrée',b.lossOnEntryBar,c.lossOnEntryBar],['Baisse maximale réalisée',usd(b.drawdown),usd(c.drawdown)],['Versement personnel simulé',eur(b.receiptEUR),eur(c.receiptEUR)]
  ]);
  rows('entry36Weeks',c.calendar.weeks.map((w,i)=>[`${date(w.start)}–${date(w.end)}${w.partialMonth?' *':''}`,usd(b.calendar.weeks[i].net),usd(w.net),usd(w.cumulative),eur(w.receiptEUR)]));
  el('entry36Result').textContent=variant==='baseline'?'Entrées actuelles conservées. Les deux attentes supplémentaires échouent au critère fixé avant calcul.':`${usd(d.delta)} par rapport à la référence ce mois. ${d.delayedCommon} retest(s) commun(s) avec entrée retardée. Écart des retests communs : ${usd(d.commonDelta)} ; résultat des entrées retirées : ${usd(d.removed.net)} (${d.removed.wins} gagnantes, ${d.removed.losses} perdantes) ; nouvelles entrées : ${usd(d.added.net)}. Ces montants incluent les autres marchés du portefeuille.`;
  const profile=r.variants.find(v=>v.id===variant),executed=profile.symbol?c.contributions.find(m=>m.symbol===profile.symbol).trades:0;
  el('entry36Filter').textContent=profile.symbol?`${profile.symbol} : ${c.confirmation.accepted}/${c.confirmation.candidates} signaux initiaux passent la confirmation ; ${executed} entrée(s) finalement exécutée(s). Le risque, la place disponible et les limites quotidiennes peuvent encore refuser un signal confirmé.`:'Le témoin conserve les règles du Jeu 34 sans MYM, reproduites exactement dans le Jeu 35.';
  el('entry36Note').textContent=mode==='funded'?`Funded supposé déjà obtenu, neuf chaque mois. Objectif de retrait : ${c.personalGoalAchieved?'atteint en simulation':'non atteint'}. ${c.payout.qualifyingDays}/5 jours à au moins 150 $.`:'Évaluation neuve chaque mois : aucun bénéfice retirable. Aucun gain transféré au scénario funded.';
 }
 for(const id of ['entry36Month','entry36Variant','entry36Mode','entry36Cost'])el(id).addEventListener('change',render);
 render();el('entry36Results').hidden=false;el('entry36Message').textContent='36 simulations terminées · entrées actuelles conservées · aucun objectif mensuel de retrait atteint.';
}
init().catch(()=>{el('entry36Results').hidden=true;el('entry36Message').textContent='Le bilan vérifié est indisponible. Recharge la page ou consulte le rapport.';});

import {accountProfile,consistencyStatus} from './jeu33-policy.mjs';
import {verifyAccountReport} from './jeu33-report-validation.mjs';
const el=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n);
function rows(target,values){
 const body=el(target);body.replaceChildren();
 for(const row of values){const tr=document.createElement('tr');for(const value of row){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}body.append(tr);}
}
function consistency(){
 const output=el('consistency50Result');
 if(el('consistency50Stage').value==='funded'){output.textContent='LucidFlex funded : aucune règle de consistency 50 %. Les règles de perte maximale, de taille et de retrait continuent de s’appliquer.';return;}
 const inputs=[el('consistency50Best'),el('consistency50Profit')];
 if(inputs.some(i=>!i.value.trim()||!i.checkValidity())){output.textContent='Renseigne une meilleure journée positive ou nulle et un bénéfice total valide.';return;}
 const [best,profit]=inputs.map(i=>Number(i.value)),c=consistencyStatus(best,profit,accountProfile('50k-fixed100'));
 output.textContent=(c.ratio===null?'Bénéfice total nul ou négatif : ratio non calculable. ':`Ta meilleure journée représente ${(100*c.ratio).toLocaleString('fr-FR',{maximumFractionDigits:2})} % du bénéfice total. `)+
  (c.passed?'Objectif et cohérence à 50 % stricts remplis dans ce calcul. ':`Bénéfice total requis : ${money(c.requiredProfit)} ; il manque ${money(c.remaining)}. `)+
  'La tolérance Lucid n’est pas calculée ici. Ce résultat ne vaut pas validation du compte.';
}
for(const id of ['consistency50Best','consistency50Profit','consistency50Stage'])el(id)?.addEventListener('input',consistency);
consistency();
async function init(){
 const response=await fetch(new URL('./jeu33-report.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Rapport indisponible');
 const report=await verifyAccountReport(await response.arrayBuffer());
 function render(){
  const view=report.views.find(v=>v.id===el('account50Period').value&&v.profileId===el('account50Profile').value);
  if(!view)throw Error('Profil indisponible');const a=view.costs.normal,b=view.costs.stress;
  rows('account50Summary',[
   ['Bénéfice net',money(a.net),money(b.net)],['Trades',a.trades,b.trades],
   ['Baisse maximale du solde',money(a.drawdown),money(b.drawdown)],
   ['Marge restante avant le seuil',money(a.headroom),money(b.headroom)],
   ['Objectif d’évaluation atteint',a.status==='targetMet'?'Oui, arrêt du test':'Non',b.status==='targetMet'?'Oui, arrêt du test':'Non'],
   ['Semaines complètes à ≥1 000 $',`${a.weekly.atLeast1000}/${a.weekly.complete}`,`${b.weekly.atLeast1000}/${b.weekly.complete}`]
  ]);
  rows('account50Markets',a.contributions.map((p,i)=>[p.symbol,`${p.trades} / ${b.contributions[i].trades}`,money(p.net),money(b.contributions[i].net)]));
  el('account50PeriodNote').textContent=view.id==='summer'?'Un seul compte suivi de juin à août, sans remise à zéro. Un arrêt après objectif raccourcit l’observation.':'Compte neuf au début de ce mois. Les résultats de comptes réinitialisés ne s’additionnent pas pour reproduire un compte continu.';
  const reduced=Object.entries(a.capCounts).filter(([cap])=>Number(cap)<100).reduce((n,[,count])=>n+count,0);
  el('account50RiskNote').textContent=view.profileId.includes('reduced')?`Aux coûts normaux, ${reduced} trade(s) ont utilisé un plafond réduit. ${reduced===0?'La réduction n’a pas été mise à l’épreuve par cette trajectoire.':''}`:'Plafond fixe 100 $ par trade, frais compris. Le nombre de contrats reste entier et dépend du stop.';
 }
 for(const id of ['account50Period','account50Profile'])el(id).addEventListener('change',render);
 render();el('account50Results').hidden=false;el('account50Message').textContent='32 simulations terminées · historique déjà observé · aucun profil validé pour le réel.';
}
init().catch(()=>{el('account50Results').hidden=true;el('account50Message').textContent='Les résultats vérifiés ne sont pas disponibles. Recharge la page ou consulte le bilan détaillé.';});

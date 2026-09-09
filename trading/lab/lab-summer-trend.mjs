import {verifySummerTrend} from './jeu32-report-validation.mjs';
const $=id=>document.getElementById('trend32'+id);
const num=(n,d=2)=>n===null?'—':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>n===null?'—':`${n>0?'+':''}${num(n)} $`;
const row=(id,values)=>{const tr=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}$(id).append(tr);};
const tables=['Overview','Markets','Changes','Weeks','Days','Study','Refusals'];
const states={positive:'Positive',negative:'Négative','flat-active':'À zéro','no-trade':'Sans trade','missing-data':'Données absentes','stopped-target':'Après objectif','stopped-breach':'Après arrêt'};
let report=null,loading=false;
const clear=()=>{tables.forEach(id=>$(id).replaceChildren());['Summary','Sample','Attribution','Risk'].forEach(id=>{$(id).textContent='';});};
function show(){
 if(!report)return;const view=report.views.find(v=>v.id+'/'+v.mode===$('View').value),a=view?.variants.find(v=>v.id===$('Variant').value),cost=$('Costs').value;
 if(!a||!['normal','stress'].includes(cost))return;clear();const x=a.costs[cost],w=x.weeklyObjective;
 for(const v of view.variants){const s=v.costs[cost],g=s.weeklyObjective;row('Overview',[v.label,s.count,money(s.net),money(s.drawdown),`${g.targetWeeks}/${g.evaluableFullWeeks}`]);}
 $('Summary').textContent=`${a.label} : ${money(x.net)}, ${x.wins} trades gagnants et ${x.losses} perdants. Objectif +1 000 $ atteint ${w.targetWeeks} fois sur ${w.evaluableFullWeeks} semaines entières évaluables (${w.fullCalendarWeeks} prévues). Aucune variante confirmée.`;
 $('Sample').textContent=`${view.coverage.scored}/${view.coverage.expected} séances disponibles. Coûts ${cost==='normal'?'initiaux':'doublés'}. ${view.mode==='account'?'Compte 25K : '+({incomplete:'évaluation incomplète',targetMet:'objectif d’évaluation atteint le '+x.terminalDay,breached:'seuil franchi'}[x.status]):'Diagnostic sans plancher ni arrêt à l’objectif du compte'}. Chaque mois repart de 25 000 $ ; la vue été conserve le même compte.`;
 const p=x.plannedRisk;$('Risk').textContent=`Risque planifié par trade : ${money(p.min)} à ${money(p.max)}, moyenne ${money(p.mean)} ; ${p.minQuantity} à ${p.maxQuantity} micros. Pertes dépassant le risque planifié : ${p.lossBeyondPlanned}. Une réserve de 100 $ au-dessus du plancher peut bloquer les entrées ; le plafond de risque ne garantit pas la perte réelle.`;
 for(const m of x.contributions)row('Markets',[m.symbol,m.count,m.wins,m.losses,money(m.net),money(m.fees)]);
 const c=x.alignmentComparison??x.comparison;
 for(const[label,g]of [['Trades retirés',c.removed],['Nouveaux trades',c.added]])row('Changes',[label,g.count,g.wins,g.losses,money(g.net)]);
 $('Attribution').textContent=`Comparaison ${x.alignmentComparison?'au même risque et à 2R sans filtre M5/H1':'à la référence Jeu 31'}. Écart ${money(c.delta)} = nouveaux (${money(c.added.net)}) − retirés (${money(c.removed.net)}) + variation des entrées communes (${money(c.commonNetChange)}, quantité et sortie comprises).`;
 for(const t of w.weeks)row('Weeks',[`${t.first} → ${t.last}`,`${t.simulatedSessions}/${t.expectedSessions}`,t.trades??'—',money(t.net),money(t.cumulative),!t.complete?'Non évaluable':t.partialBoundary?'Semaine partielle':t.targetMet?'Atteint':'Non atteint']);
 for(const d of x.calendar.daily)row('Days',[d.day,d.trades??'—',money(d.net),money(d.cumulative),states[d.state]||d.state]);
 for(const m of report.study)for(const q of m.markets)row('Study',[{june:'Juin',july:'Juillet',august:'Août'}[m.id],q.symbol,num(q.medianRangeBps),num(q.meanEfficiency,3),`${q.failedBreakouts}/${q.breakouts}`,money(q.reference.net)]);
 for(const[reason,n]of Object.entries({...x.denied,...a.baseRefusals,...a.alignmentRefusals}))row('Refusals',[({'floorReserve':'Marge insuffisante avant le plancher','alignment-mismatch':'M5 et H1 non alignés','alignment-unknown':'Alignement indisponible','mgc-after-11':'Or : entrée après 11 h NY'}[reason]||reason),n]);
 $('Results').hidden=false;
}
async function load(){
 if(loading)return;loading=true;report=null;clear();$('Results').hidden=true;['Retry','View','Variant','Costs'].forEach(id=>{$(id).disabled=true;});$('Status').textContent='Vérification des tests…';
 try{const res=await fetch('./jeu32-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw Error('Unavailable');report=await verifySummerTrend(await res.arrayBuffer());show();$('Status').textContent='80 scénarios · bot non qualifié';['View','Variant','Costs'].forEach(id=>{$(id).disabled=false;});}
 catch{report=null;clear();$('Results').hidden=true;$('Status').textContent='Tests indisponibles. Revérifie pour réessayer.';}
 finally{loading=false;$('Retry').disabled=false;}
}
['View','Variant','Costs'].forEach(id=>$(id).addEventListener('change',show));$('Retry').addEventListener('click',load);load();

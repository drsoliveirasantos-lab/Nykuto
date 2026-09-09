import { JEU15_POLICY as policy, JEU15_SCENARIOS as scenarios } from './jeu15-policy.mjs';
import { JEU14_SOURCE as source } from './jeu14-source.mjs';
const $=id=>document.getElementById(id);
const number=(n,d=2)=>n===null?'—':n==='Infinity'?'∞':new Intl.NumberFormat('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
const cash=n=>`${n>0?'+':''}${number(n)} $`;
const R=n=>`${n>0?'+':''}${number(n)} R`;
function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n;}
function row(parent,cells){const tr=node('tr','');for(const text of cells)tr.append(node('td',text));parent.append(tr);}
const state={breached:'Compte perdu dans la simulation',targetMet:'Objectif atteint · indicatif',incomplete:'Objectif non atteint sur la période'};
let report;
function show(){
 if(!report)return;
 const factor=$('lucidCosts').value,s=report.results.find(r=>r.id===$('lucidScenario').value),d=s.diagnostic[factor];
 $('lucidTrades').textContent=`${d.trades} trades`;
 $('lucidDaily').textContent=`${d.daily.positive} jours positifs · ${d.daily.negative} négatifs · ${d.daily.noTrade} sans trade${d.daily.flatActive?` · ${d.daily.flatActive} nuls avec trades`:''}`;
 $('lucidNet').textContent=cash(d.net);$('lucidR').textContent=`${R(d.metrics.total)} · Profit factor ${number(d.metrics.pf,3)}`;
 $('lucidWorst').textContent=cash(d.daily.worst);$('lucidDrawdown').textContent=`Drawdown réalisé : ${number(d.drawdown)} $ · ${number(d.metrics.dd)} R`;
 $('lucidMessage').textContent=s.id==='reference30'?'La référence positive sur l’ensemble perd trois des cinq comptes simulés. Elle n’est pas adaptée telle quelle au LucidFlex 25K.':s.id==='guard30'?'Les stops dépassent le budget prévu : tous les signaux examinés sont refusés. Zéro perte ne valide pas une stratégie qui ne prend aucun trade.':'Cette nouvelle piste réduit les montants risqués, mais ne démontre pas de rentabilité : total proche de zéro et négatif avec coûts doublés.';
 $('lucidRejected').textContent=`Signaux examinés à plat : ${d.signalCount} ; refusés pour risque par trade : ${d.denied.tradeRisk}, budget journalier : ${d.denied.dailyBudget}, réserve du compte : ${d.denied.floorReserve}. Les signaux refusés ne sont pas des trades. ${d.ambiguous} bougie(s) avec sortie ambiguë dans le diagnostic.`;
 $('lucidAccounts').replaceChildren();
 for(const w of s.windows){
  const label=`${w.start} → ${w.end} exclu`;
  if(!w.complete){row($('lucidAccounts'),[label,`${w.scored}/${w.expected}`,'Données incomplètes','—','—','—']);continue;}
  const a=w[factor];row($('lucidAccounts'),[label,`${w.scored}/${w.expected}`,state[a.status],String(a.trades),cash(a.net),a.terminalDay||'Fin de la fenêtre']);
 }
 $('lucidWindows').replaceChildren();for(const w of s.windows.filter(w=>w.complete)){const a=w.diagnostic[factor];row($('lucidWindows'),[`${w.start} → ${w.end} exclu`,String(a.metrics.count),cash(a.netDollars),R(a.metrics.total)]);}
 $('lucidChecks').replaceChildren(...s.checks.map(c=>node('li',`${c.pass?'Satisfait':'Non satisfait'} — ${c.label}`)));
 $('lucidNext').textContent='Le bot reste non confirmé. Les limites de risque sont désormais testées, mais aucune des trois configurations ne passe tous les critères. La prochaine recherche doit trouver un avantage après coûts avec un risque compatible ; le Paper Trading sur données actuelles reste une étape séparée.';
}
async function load(){
 try{
  const res=await fetch('./jeu15-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
  const v=await res.json();
  if(v.schema!=='jeu15-report-v1'||v.protocol!==policy.version||v.source?.sha256!==source.sha256||v.confirmed!==false||v.policy?.paperEnabled!==false||v.policy?.brokerEnabled!==false||v.audit?.passed!==true||v.results?.length!==3||v.coverage?.scoredSessions!==330||v.readiness?.length!==4||v.readiness.some(r=>r.ready!==false))throw new Error('Invalid report');
  for(const s of scenarios){const r=v.results.find(r=>r.id===s.id);if(!r||r.confirmed!==false||r.checks?.length!==7||r.windows?.length!==8||!Number.isFinite(r.diagnostic?.normal?.net)||!Number.isFinite(r.diagnostic?.stress?.net))throw new Error('Invalid scenario');}
  report=v;
  $('lucidFreshness').textContent=`Historique utilisé : ${v.coverage.first} → ${v.coverage.last} · ${v.coverage.scoredSessions} séances évaluables. Ce sont des prix historiques ; aucune analyse du cours actuel n’est active.`;
  $('lucidReadiness').replaceChildren(...v.readiness.map(r=>node('li',`À réaliser — ${r.label}`)));
  $('lucidAudit').textContent=`${v.audit.signalPrefixes} contrôles des signaux par préfixes ; ${v.audit.accountPrefixes} comparaisons de comptes sur préfixes de séances ; ${v.audit.trades} trades audités, en comptant les diagnostics, fenêtres et deux coûts. Ces contrôles ne sont pas de nouvelles observations de marché.`;
  $('lucidStatus').textContent='Non confirmé';$('lucidResults').hidden=false;show();
 }catch{report=null;$('lucidStatus').textContent='Bilan indisponible';$('lucidResults').hidden=true;$('lucidMessage').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';}
}
$('lucidScenario').addEventListener('change',show);$('lucidCosts').addEventListener('change',show);load();

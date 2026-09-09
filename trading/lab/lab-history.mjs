import { JEU14_SOURCE } from './jeu14-source.mjs';
const $=id=>document.getElementById(id);
const number=(v,digits=2)=>v===null?'—':v==='Infinity'?'∞':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(v);
const R=v=>`${v>0?'+':''}${number(v)} R`;
function node(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function row(target,cells){const tr=document.createElement('tr');for(const c of cells)tr.append(node('td',c));target.append(tr);}
let report;
function showMonths(){
 if(!report)return;
 const year=$('historyYear').value;$('historyMonths').replaceChildren();
 for(const m of report.months.filter(m=>year==='all'||m.start.startsWith(year))){
  const label=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(m.start+'T00:00:00Z'));
  row($('historyMonths'),[label,`${m.scoredSessions}/${m.expectedSessions}`,String(m.normal.count),m.scoredSessions?R(m.normal.total):'—',m.scoredSessions?R(m.stress.total):'—',m.complete?'Complet':'Partiel']);
 }
}
async function load(){
 try{
  const response=await fetch('./jeu14-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok||!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable report');
  const value=await response.json();
  if(value.schema!=='jeu14-report-v1'||value.source?.sha256!==JEU14_SOURCE.sha256||value.candidateId!=='30-full-both'||value.paperEnabled!==false||value.audit?.passed!==true||value.months?.length!==19||value.primary?.checks?.length!==7||!Number.isInteger(value.overall?.normal?.count)||!Number.isFinite(value.overall.normal.total)||!Number.isFinite(value.overall.stress.total))throw new Error('Invalid report');
  report=value;const o=report.overall,p=report.primary,c=report.coverage;
  $('historyCount').textContent=`${o.normal.count} trades`;
  $('historySessions').textContent=`${c.scoredSessions} séances évaluées · ${c.firstScored} → ${c.lastScored}`;
  $('historyNet').textContent=R(o.normal.total);$('historyStress').textContent=`Coûts doublés : ${R(o.stress.total)}`;
  $('historyDrawdown').textContent=`${number(o.normal.dd)} R`;
  $('historyWin').textContent=`Win rate ${number(o.normal.win*100,1)} % · Profit factor ${number(o.normal.pf,3)}`;
  $('historyStatus').textContent=p.passed?'Critères historiques satisfaits':'Non confirmé';
  $('historyMessage').textContent=`Le Pullback 30 min Long + Short a été confronté à tout l’historique actuellement vérifiable. Le total positif ne suffit pas à confirmer la stratégie : ${p.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}${p.passed?'aucun échec parmi les critères historiques.':' — critères non satisfaits.'}`;
  $('historyVerdict').textContent=`Le contrôle sur juillet–décembre 2025 compte ${p.normal.count} trades et donne ${R(p.normal.total)}, ou ${R(p.stress.total)} avec coûts doublés. Chaque fenêtre dépasse 12 trades, mais juillet–août est négatif et septembre–octobre reste partiel. Sur l’ensemble des dates, le drawdown de ${number(o.normal.dd)} R dépasse aussi la limite de 8 R. Le bot reste désactivé.`;
  $('historyPeriods').replaceChildren();for(const w of p.windows)row($('historyPeriods'),[`${w.start} → ${w.end} exclu`,`${w.scoredSessions}/${w.expectedSessions}`,String(w.normal.count),R(w.normal.total),R(w.stress.total),w.complete?'Complet':'Partiel']);
  $('historyChecks').replaceChildren(...p.checks.map(c=>node('li',`${c.pass?'Satisfait':'Non satisfait'} — ${c.label}`)));
  const robust=report.robustness.primary;
  $('historyRobustness').textContent=`Sur le contrôle 2025, retirer les cinq meilleurs trades laisse ${R(robust.withoutFiveBestR)}. Les ${robust.draws.toLocaleString('fr-FR')} rééchantillonnages de semaines donnent un intervalle indicatif à 95 % de ${number(robust.bootstrap95DailyR[0],3)} à ${number(robust.bootstrap95DailyR[1],3)} R par jour. Il traverse zéro : l’avantage reste incertain. Ce ne sont pas de nouveaux trades.`;
  $('historyDirections').replaceChildren();for(const s of report.robustness.overall.directions)row($('historyDirections'),[s.side,String(s.count),R(s.total),`${number(s.win*100,1)} %`]);
  const bad=c.unavailable.filter(d=>d.reason==='missing-data');
  $('historyCoverage').textContent=`${c.expectedSessions} séances prévues dans la période accessible ; ${c.scoredSessions} évaluées, ${c.unavailable.filter(d=>d.reason==='warmup').length} réservées à la préparation, ${bad.length} avec prix incomplets. ${c.quality.reduce((n,g)=>n+g.bars,0).toLocaleString('fr-FR')} bougies 5 min contrôlées, préparation des différents contrats comprise. Les horaires complets fournis commencent le 17 mars 2025. Aucun prix inventé.`;
  $('historyMissing').replaceChildren(...c.unavailable.map(d=>node('li',`${d.date} · ${d.ticker} · ${d.reason==='warmup'?'préparation des indicateurs':`données incomplètes (${d.missingMinutes.length} bougies 5 min manquantes)`}`)));
  $('historyAudit').textContent=`${report.audit.signalPrefixes} contrôles de causalité par préfixe, ${report.audit.sessionComparisons} comparaisons de simulations arrêtées et ${report.audit.auditedTrades} trades audités, en comptant les deux scénarios de frais.`;
  $('historyResults').hidden=false;showMonths();
 }catch{report=null;$('historyResults').hidden=true;$('historyStatus').textContent='Bilan indisponible';$('historyMessage').textContent='Le bilan complet n’a pas pu être chargé. Recharge la page pour réessayer.';}
}
$('historyYear').addEventListener('change',showMonths);load();

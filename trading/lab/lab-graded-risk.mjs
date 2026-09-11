import {verifyGradedReport} from './jeu25-report-validation.mjs';
const $=id=>document.getElementById('graded'+id);
const num=(n,d=2)=>n===null?'—':n==='Infinity'?'∞':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x;};
function row(parent,values){const tr=node('tr','');for(const v of values)tr.append(node('td',String(v)));parent.append(tr);}
let report;
function show(){
  if(!report)return;const cost=$('Costs').value;if(!['normal','stress'].includes(cost))return;
  for(const id of ['Comparison','Changes','Checks','Activity','Windows','Tiers'])$(id).replaceChildren();
  for(const x of report.results){
    const d=x.diagnostic[cost],c=d.referenceComparison,s=d.strictComparison,g=report.grading.find(g=>g.symbol===x.symbol);
    row($('Comparison'),[x.symbol,d.trades,money(d.net),money(c.oldNet),money(s.oldNet),`${money(d.referenceDrawdown)} → ${money(d.drawdown)}`,`${x.checks.filter(c=>c.pass).length}/8`]);
    row($('Changes'),[x.symbol,c.unchangedCount,c.addedCount,c.removedCount,money(c.deltaNet)]);
    $('Checks').append(node('li',`${x.symbol} : ${x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}.`));
    $('Activity').append(node('li',`${x.symbol} : ${d.daily.positive} jours positifs, ${d.daily.negative} négatifs, ${d.daily.flatActive} actifs à zéro et ${d.daily.noTrade} sans trade ; pire jour ${money(d.daily.worst)}.`));
    for(const t of d.tiers)row($('Tiers'),[x.symbol,`${t.cap} $`,g.tiers.find(g=>g.cap===t.cap).signals,t.trades,money(t.net),t.averagePlannedRisk===null?'—':money(t.averagePlannedRisk)]);
    for(const w of x.windows){const a=w.diagnostic[cost];row($('Windows'),[x.symbol,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),num(a.metrics.total,3),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(){
  try{
    const res=await fetch('./jeu25-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    report=await verifyGradedReport(await res.arrayBuffer());
    $('Status').textContent='Aucune candidate validée';
    $('Message').textContent='Le risque gradué autorise de nouveau des entrées, mais aucun marché ne remplit tous les critères de qualification. Les deux témoins sont les résultats historiques déjà archivés.';
    show();$('Results').hidden=false;
  }catch{report=null;$('Status').textContent='Bilan indisponible';$('Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$('Results').hidden=true;}
}
$('Costs').addEventListener('change',show);load();

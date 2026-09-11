import {verifyCombinedReport} from './jeu24-report-validation.mjs';
const $=id=>document.getElementById('combined'+id);
const num=(n,d=2)=>n===null?'—':n==='Infinity'?'∞':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x;};
function row(parent,values){const tr=node('tr','');for(const v of values)tr.append(node('td',String(v)));parent.append(tr);}
let report;
function show(){
  if(!report)return;
  const cost=$('Costs').value,risk=Number($('Risk').value);if(!['normal','stress'].includes(cost)||![50,75,100,150].includes(risk))return;
  for(const id of ['Matrix','Comparison','Changes','Checks','Activity','Windows','Funnel','Context'])$(id).replaceChildren();
  for(const symbol of ['MNQ','MES','MYM','MGC'])row($('Matrix'),[symbol,...[50,75,100,150].map(cap=>money(report.results.find(x=>x.symbol===symbol&&x.riskPerTrade===cap).diagnostic[cost].net))]);
  for(const c of report.confluence){
    row($('Funnel'),[c.symbol,c.signals,...c.funnel.map(s=>s.remaining)]);
    $('Context').append(node('li',`${c.symbol} : ${c.missingContext} signaux avec préparation insuffisante. Accords par famille, comptés séparément : tendance ${c.passes.trend}, structure ${c.passes.structure}, dynamique ${c.passes.momentum}, volume ${c.passes.volume}, figure ${c.passes.pattern}.`));
  }
  for(const x of report.results.filter(x=>x.riskPerTrade===risk)){
    const d=x.diagnostic[cost],c=d.referenceComparison;
    row($('Comparison'),[x.symbol,d.trades,money(c.oldNet),money(d.net),money(d.drawdown),num(d.metrics.pf,3),`${x.checks.filter(c=>c.pass).length}/8`]);
    row($('Changes'),[x.symbol,c.unchangedCount,c.addedCount,c.removedCount,money(c.deltaNet)]);
    $('Checks').append(node('li',`${x.symbol} · ${risk} $ : ${x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}.`));
    $('Activity').append(node('li',`${x.symbol} : ${d.daily.positive} jours positifs, ${d.daily.negative} négatifs, ${d.daily.flatActive} actifs à zéro et ${d.daily.noTrade} sans trade ; pire jour ${money(d.daily.worst)}.`));
    for(const w of x.windows){const a=w.diagnostic[cost];row($('Windows'),[x.symbol,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(){
  try{
    const res=await fetch('./jeu24-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    report=await verifyCombinedReport(await res.arrayBuffer());
    const total=report.confluence.reduce((s,c)=>s+c.signals,0),accepted=report.confluence.reduce((s,c)=>s+c.accepted,0);
    $('Status').textContent='Aucune candidate validée';
    $('Message').textContent=`La combinaison ne conserve que ${accepted} des ${total} signaux de retour. Chaque configuration exécute 0 à 2 trades : trop peu pour établir une amélioration ou une rentabilité.`;
    show();$('Results').hidden=false;
  }catch{report=null;$('Status').textContent='Bilan indisponible';$('Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$('Results').hidden=true;}
}
$('Costs').addEventListener('change',show);$('Risk').addEventListener('change',show);load();

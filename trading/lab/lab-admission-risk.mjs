import {verifyAdmissionReport} from './jeu23-report-validation.mjs';
const $=id=>document.getElementById('admission'+id);
const num=(n,d=2)=>n===null?'—':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x;};
function row(parent,values){const tr=node('tr','');for(const v of values)tr.append(node('td',String(v)));parent.append(tr);}
let report;
function show(){
  if(!report)return;
  const cost=$('Costs').value,risk=Number($('Risk').value);if(!['normal','stress'].includes(cost)||![50,75,100,150].includes(risk))return;
  for(const id of ['Matrix','Comparison','Changes','Checks','Activity','Windows'])$(id).replaceChildren();
  for(const symbol of ['MNQ','MES','MYM','MGC'])row($('Matrix'),[symbol,...[50,75,100,150].map(cap=>money(report.results.find(x=>x.symbol===symbol&&x.riskPerTrade===cap).diagnostic[cost].net))]);
  for(const x of report.results.filter(x=>x.riskPerTrade===risk)){
    const d=x.diagnostic[cost],c=d.referenceComparison;
    row($('Comparison'),[x.symbol,d.trades,money(d.net),money(d.drawdown),num(d.metrics.pf,3),`${x.checks.filter(c=>c.pass).length}/8`]);
    row($('Changes'),[x.symbol,money(c.oldNet),c.addedCount,c.removedCount,money(c.deltaNet),d.riskComparison?money(d.riskComparison.deltaNet):'Référence 50 $']);
    $('Checks').append(node('li',`${x.symbol} · ${risk} $ : ${x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}.`));
    $('Activity').append(node('li',`${x.symbol} : ${d.daily.positive} jours positifs, ${d.daily.negative} négatifs, ${d.daily.noTrade} sans trade ; pire jour ${money(d.daily.worst)}. ${d.recoveredAfterRefusal} entrées après un refus antérieur du même sens.`));
    for(const w of x.windows){const a=w.diagnostic[cost];row($('Windows'),[x.symbol,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(){
  try{
    const res=await fetch('./jeu23-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    report=await verifyAdmissionReport(await res.arrayBuffer());
    $('Status').textContent='Aucune candidate validée';
    $('Message').textContent='Le Nasdaq progresse avec des plafonds plus élevés, mais reste sous les 40 trades requis avec une séance incomplète. Relever le risque dégrade plusieurs autres marchés.';
    show();$('Results').hidden=false;
  }catch{report=null;$('Status').textContent='Bilan indisponible';$('Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$('Results').hidden=true;}
}
$('Costs').addEventListener('change',show);$('Risk').addEventListener('change',show);load();

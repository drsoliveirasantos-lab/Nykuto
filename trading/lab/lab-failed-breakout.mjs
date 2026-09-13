import {verifyFailureReport} from './jeu26-report-validation.mjs';
const $=id=>document.getElementById('failure'+id);
const num=(n,d=2)=>n===null?'—':n==='Infinity'?'∞':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x;};
function row(parent,values){const tr=node('tr','');for(const v of values)tr.append(node('td',String(v)));parent.append(tr);}
let report;
function show(){
  if(!report)return;const cost=$('Costs').value;if(!['normal','stress'].includes(cost))return;
  for(const id of ['Comparison','Changes','Checks','Activity','Windows'])$(id).replaceChildren();
  for(const x of report.results){
    const d=x.diagnostic[cost],c=d.referenceComparison;
    row($('Comparison'),[x.symbol,d.trades,money(d.net),num(d.metrics.total,3),money(c.oldNet),money(d.drawdown),`${x.checks.filter(c=>c.pass).length}/8`]);
    row($('Changes'),[x.symbol,c.unchangedCount,c.addedCount,c.removedCount,money(c.deltaNet)]);
    $('Checks').append(node('li',`${x.symbol} : ${x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}.`));
    $('Activity').append(node('li',`${x.symbol} : ${d.daily.positive} jours positifs, ${d.daily.negative} négatifs, ${d.daily.flatActive} actifs à zéro, ${d.daily.noTrade} sans trade ; pire jour ${money(d.daily.worst)}. Refus : risque ${d.denied.tradeRisk}, potentiel net ${d.denied.netReward}, open hors zone ${d.denied.outsideRange}.`));
    for(const w of x.windows){const a=w.diagnostic[cost];row($('Windows'),[x.symbol,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),num(a.metrics.total,3),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(){
  try{
    const res=await fetch('./jeu26-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    report=await verifyFailureReport(await res.arrayBuffer());
    $('Status').textContent='Aucune candidate validée';
    $('Message').textContent='Les quatre configurations échouent. MGC gagne sur le total, mais perd sur mars–avril, compte moins de 40 trades et comporte des séances incomplètes. La réserve reste fermée.';
    show();$('Results').hidden=false;
  }catch{report=null;$('Status').textContent='Bilan indisponible';$('Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$('Results').hidden=true;}
}
$('Costs').addEventListener('change',show);load();

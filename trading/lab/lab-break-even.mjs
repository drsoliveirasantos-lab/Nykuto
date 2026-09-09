import {verifyProtectionReport} from './jeu28-report-validation.mjs';
const $=id=>document.getElementById('protection'+id);
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
    row($('Comparison'),[x.symbol,d.trades,money(d.net),`${num(d.metrics.win*100,1)} %`,money(c.oldNet),money(d.drawdown),`${x.checks.filter(c=>c.pass).length}/8`]);
    const p=d.protectionComparison;
    row($('Changes'),[x.symbol,d.breakEvenArmed,d.breakEvenExits,p.improved,p.worsened,money(p.improvedDollars),money(p.worsenedDollars),money(p.deltaNet)]);
    $('Checks').append(node('li',`${x.symbol} : ${x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase()).join(' ; ')}.`));
    row($('Activity'),[x.symbol,d.daily.observed,d.daily.positive,d.daily.negative,d.daily.flatActive,d.daily.noTrade,money(d.dailyMean),money(d.daily.worst)]);
    for(const w of x.windows){const a=w.diagnostic[cost];row($('Windows'),[x.symbol,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),num(a.metrics.total,3),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(){
  try{
    const res=await fetch('./jeu28-report.json',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    report=await verifyProtectionReport(await res.arrayBuffer());
    $('Status').textContent='Aucune candidate validée';
    $('Message').textContent='Les quatre configurations échouent. MNQ gagne 44 $ par rapport au témoin grâce à une seule perte évitée. Cette observation ne suffit pas à valider la protection ; réserve fermée.';
    show();$('Results').hidden=false;
  }catch{report=null;$('Status').textContent='Bilan indisponible';$('Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$('Results').hidden=true;}
}
$('Costs').addEventListener('change',show);load();

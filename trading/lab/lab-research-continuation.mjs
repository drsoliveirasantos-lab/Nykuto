import {verifyContinuationReport} from './jeu21-22-report-validation.mjs';
const $=id=>document.getElementById(id),reports=new Map();
const num=(n,d=2)=>n===null?'—':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x;};
function row(parent,values){const tr=node('tr','');for(const v of values)tr.append(node('td',String(v)));parent.append(tr);}
function show(game){
  const r=reports.get(game),prefix=game===21?'expanded':'opening';if(!r)return;
  const cost=$(prefix+'Costs').value;if(!['normal','stress'].includes(cost))return;
  $(prefix+'Comparison').replaceChildren();$(prefix+'Windows').replaceChildren();$(prefix+'Checks').replaceChildren();$(prefix+'Activity').replaceChildren();
  for(const x of r.results){
    const d=x.diagnostic[cost];row($(prefix+'Comparison'),[x.symbol,game===21?x.label.split(' 5 min')[0]:'Cassure + retour',d.trades,money(d.net),num(d.metrics.pf,3),num(d.metrics.dd),`${x.checks.filter(c=>c.pass).length}/8`]);
    const failed=x.checks.filter(c=>!c.pass).map(c=>c.label.toLowerCase());$(prefix+'Checks').append(node('li',`${x.id} : ${failed.join(' ; ')}.`));
    $(prefix+'Activity').append(node('li',`${x.id} : ${d.daily.positive} jours positifs, ${d.daily.negative} négatifs, ${d.daily.noTrade} sans trade ; pire jour ${money(d.daily.worst)}. ${d.denied.tradeRisk} refus pour risque, ${d.denied.netReward} pour marge nette.`));
    for(const w of x.windows){const a=w.diagnostic[cost];row($(prefix+'Windows'),[x.id,`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),w.account?w.account[cost].status==='breached'?'Seuil franchi':w.account[cost].status==='targetMet'?'Objectif atteint':'Objectif non atteint':'Compte non évaluable']);}
  }
}
async function load(game){
  const prefix=game===21?'expanded':'opening';
  try{
    const res=await fetch(`./jeu${game}-report.json`,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!res.ok||!res.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    reports.set(game,await verifyContinuationReport(await res.arrayBuffer(),game));
    $(prefix+'Status').textContent='Aucune candidate validée';
    $(prefix+'Message').textContent=game===21?'La préparation récupère des séances, mais aucune des quatre configurations ne satisfait les critères.':'Les petits totaux positifs Nasdaq et S&P 500 reposent sur trop peu de trades. La nouvelle méthode reste non validée.';
    show(game);$(prefix+'Results').hidden=false;
  }catch{reports.delete(game);$(prefix+'Status').textContent='Bilan indisponible';$(prefix+'Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$(prefix+'Results').hidden=true;}
}
for(const game of [21,22]){const prefix=game===21?'expanded':'opening';$(prefix+'Costs').addEventListener('change',()=>show(game));load(game);}

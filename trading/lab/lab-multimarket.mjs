import { verifyMultimarketReport } from './jeu19-report-validation.mjs';
const $=id=>document.getElementById(id);
const num=(n,d=2)=>n===null?'—':new Intl.NumberFormat('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const money=n=>`${n>0?'+':''}${num(n)} $`;
const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
function row(parent,cells){const tr=node('tr','');for(const value of cells)tr.append(node('td',String(value)));parent.append(tr);}
const reports=new Map();
function show(game){
  const r=reports.get(game);if(!r)return;
  const prefix=game===19?'multi':'native',cost=$(prefix+'Costs').value;
  if(!['normal','stress'].includes(cost))return;
  $(prefix+'Comparison').replaceChildren();
  if(game===19){
    for(const item of r.results){const d=item.diagnostic[cost];row($('multiComparison'),[item.symbol,item.label.split(' 5 min')[0],d.daily.observed,d.trades,money(d.net),num(d.metrics.pf,3),`${item.checks.filter(c=>c.pass).length}/8 · incomplet`]);}
  }else{
    const train=r.results[0],held=r.holdout.result;
    for(const [label,item] of [['Développement · janvier–avril',train],['Réserve · mai–août',held]]){
      const d=item.diagnostic[cost];row($('nativeComparison'),[label,d.daily.observed,d.trades,money(d.net),num(d.metrics.pf,3),num(d.metrics.dd),item.researchPassed?'Critères historiques satisfaits':'Critères non satisfaits']);
    }
    const d=held.diagnostic[cost];$('nativeNet').textContent=money(d.net);$('nativeTrades').textContent=`${d.trades} trades`;
    $('nativeDaily').textContent=`${d.daily.positive} jours positifs · ${d.daily.negative} négatifs · ${d.daily.noTrade} sans trade`;
    $('nativeWorst').textContent=money(d.daily.worst);$('nativeDrawdown').textContent=`Drawdown réalisé : ${num(d.drawdown)} $ · ${num(d.metrics.dd)} R`;
    $('nativeWindows').replaceChildren();
    for(const w of [...train.windows,...held.windows]){const a=w.diagnostic[cost];row($('nativeWindows'),[`${w.start} → ${w.end} exclu`,`${w.scored}/${w.expected}`,a.trades,money(a.net),w.account[cost].status==='targetMet'?'Objectif atteint':w.account[cost].status==='breached'?'Seuil franchi':'Objectif non atteint']);}
    $('nativeChecks').replaceChildren(...held.checks.map(c=>node('li',`${c.pass?'Satisfait':'Non satisfait'} — ${c.label}`)));
  }
}
async function load(game){
  const prefix=game===19?'multi':'native';
  try{
    const response=await fetch(`./jeu${game}-report.json`,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok||!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('Unavailable');
    reports.set(game,await verifyMultimarketReport(await response.arrayBuffer(),game));
    $(prefix+'Status').textContent=game===19?'Aucun candidat sélectionné':'Échec sur la réserve';
    $(prefix+'Message').textContent=game===19?'Huit comparaisons conservées. La couverture incomplète empêche la sélection, même lorsque certains totaux sont positifs.':'Le résultat positif de développement ne se maintient pas sur les quatre mois réservés. La candidate MYM est écartée.';
    show(game);$(prefix+'Results').hidden=false;
  }catch{
    reports.delete(game);$(prefix+'Status').textContent='Bilan indisponible';$(prefix+'Message').textContent='Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';$(prefix+'Results').hidden=true;
  }
}
for(const game of [19,20]){const prefix=game===19?'multi':'native';$(prefix+'Costs').addEventListener('change',()=>show(game));load(game);}

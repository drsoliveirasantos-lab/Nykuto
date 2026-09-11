import {verifyAccountReport} from './jeu33-report-validation.mjs';
import {verifyMonthlyReport} from './jeu34-report-validation.mjs';
import {verifyExitReport} from './jeu35-report-validation.mjs';
import {verifyEntryReport} from './jeu36-report-validation.mjs';
import {verifyConfidenceReport} from './jeu37-report-validation.mjs';
import {verifyObstacleReport} from './jeu38-report-validation.mjs';
import {verifyStudyReport} from './jeu39-report-validation.mjs';
import {verifyPullbackVolumeReport} from './jeu42-report-validation.mjs';
import {verifyNetRewardReport} from './jeu41-report-validation.mjs';
import {verifyEightMonthReport} from './jeu40-report-validation.mjs';
import {adaptHistoryReport,selectHistory,historyCells,historyDay,historyDayState,readHistoryPreferences,saveHistoryPreferences} from './history-calendar-view.mjs';

const verifiers={'33':verifyAccountReport,'34':verifyMonthlyReport,'35':verifyExitReport,'36':verifyEntryReport,'37':verifyConfidenceReport,'38':verifyObstacleReport,'39':verifyStudyReport,'40':verifyEightMonthReport,'41':verifyNetRewardReport,'42':verifyPullbackVolumeReport};
const money=(n,currency='USD')=>typeof n!=='number'?'—':new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(n);
const date=d=>d.slice(8,10)+'/'+d.slice(5,7),modeLabel=m=>m==='funded'?'Funded simulé':'Évaluation simulée';
const statusLabel=s=>({incomplete:'Fin de la période',profitTargetMet:'Arrêt : objectif 4 000 $ atteint',personalGoalMet:'Arrêt : objectif personnel atteint',targetMet:'Arrêt : évaluation réussie',breached:'Arrêt : limite du compte atteinte'})[s]??s;

export function createHistoryLoader(fetcher=globalThis.fetch){
 const cache=new Map();
 return async game=>{
  if(!verifiers[game.id]||game.report!==`jeu${game.id}-report.json`)throw Error('Unknown archived game');
  if(!cache.has(game.id)){
   const pending=(async()=>{const response=await fetcher(new URL('./'+game.report,import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Report unavailable');return adaptHistoryReport(await verifiers[game.id](await response.arrayBuffer()),game);})();
   cache.set(game.id,pending);pending.catch(()=>{if(cache.get(game.id)===pending)cache.delete(game.id);});
  }
  return cache.get(game.id);
 };
}

export async function initHistoryCalendar(options={}){
 const doc=options.document??globalThis.document,fetcher=options.fetch??globalThis.fetch;
 let storage=options.storage;if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 const el=id=>doc.getElementById(id),node=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
 const rows=(id,values)=>{el(id).replaceChildren();for(const valuesRow of values){const tr=node('tr');for(const value of valuesRow)tr.append(node('td',value));el(id).append(tr);}};
 const selectOptions=(id,values,value)=>{const e=el(id);e.replaceChildren();for(const v of values){const option=node('option',v.label);option.value=v.id;e.append(option);}e.value=value;};
 const setLoading=loading=>{for(const id of ['historyCalendarVariant','historyCalendarMode','historyCalendarCost'])el(id).disabled=loading;};
 const hideResults=()=>{el('historyCalendarResults').hidden=true;el('historyCalendarCalendars').replaceChildren();for(const id of ['historyCalendarWeeks','historyCalendarDayMarkets','historyCalendarTotals'])el(id).replaceChildren();};
 const load=options.loadReport??createHistoryLoader(fetcher);let manifest,model,state,sequence=0;
 const saved=readHistoryPreferences(storage);
 function render(focusDay=false){
  state=selectHistory(model,state);const profile=model.variants.find(v=>v.id===state.variant);
  el('historyCalendarSelection').textContent=`${model.game.label} · ${profile.label} · ${modeLabel(state.mode)} · ${state.cost==='stress'?'coûts doublés':'coûts normaux'}.`;
  el('historyCalendarPolicy').textContent=`Chaque mois repart avec un compte de ${money(profile.initial)}, un bénéfice nul et des compteurs neufs. `+(state.goalMode==='evaluation'?'Arrêt à la validation de l’évaluation ou à la limite de perte. Aucun passage au funded ni retrait simulé.':state.goalMode==='personal'?'Objectif de ce jeu : un premier retrait personnel équivalent à 1 000 €, puis arrêt du mois. L’objectif de 4 000 $ n’était pas testé.':'Objectif de ce jeu : 4 000 $ de bénéfice de trading, avec poursuite après un premier retrait personnel éventuel de 1 000 €.');
  el('historyCalendarCalendars').replaceChildren();let selectedButton;
  for(const month of state.months){
   const c=month.result,card=node('article',undefined,'history-month');card.append(node('h4',month.label+' 2026'));
   card.append(node('p',money(c.net),'history-month-total '+(c.net<0?'is-loss':c.net>0?'is-gain':'')));
   const goal=state.goalMode==='profit'?`4 000 $ : ${c.profitGoalAchieved?'atteints':'non atteints'}. `:'';
   const missing=c.calendar.daily.filter(d=>d.state==='missing-data'),coverage=missing.length?` Somme des séances disponibles ; ${missing.length} séance(s) exclue(s) pour données non correspondantes.`:'';
   card.append(node('p',`${goal}${statusLabel(c.status)}. ${state.mode==='evaluation'?'Retrait non applicable.':`Versement personnel simulé : ${money(c.receiptEUR,'EUR')}.`}${coverage}`,'history-month-note'));
   const scroll=node('div',undefined,'history-calendar-scroll');scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Calendrier de '+month.label+' 2026');scroll.tabIndex=0;
   const weekdays=node('div',undefined,'history-calendar-weekdays');for(const name of ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'])weekdays.append(node('span',name));scroll.append(weekdays);
   const grid=node('div',undefined,'history-calendar-grid');
   for(const d of historyCells(month)){
    if(d.state==='padding'){grid.append(node('span',undefined,'history-day-padding'));continue;}
    const active=typeof d.net==='number',tile=node('button',undefined,'history-day '+(active?(d.net>0?'is-gain':d.net<0?'is-loss':'is-flat'):'is-inactive')+(d.state==='missing-data'?' is-missing-data':''));
    tile.type='button';tile.setAttribute('aria-pressed',String(d.day===state.day));tile.setAttribute('aria-label',`${date(d.day)} : ${historyDayState(d)}${active?', '+money(d.net):''}`);tile.setAttribute('data-day',d.day);
    tile.append(node('span',Number(d.day.slice(8)),'history-day-number'));
    tile.append(node('span',active?(d.net>0?'+':'')+Math.round(d.net):historyDayState(d),'history-day-value'));
    if(d.receiptEUR>0)tile.append(node('span','Retrait','history-day-payout'));
    tile.addEventListener('click',()=>{state={...state,day:d.day};render(true);});if(d.day===state.day)selectedButton=tile;grid.append(tile);
   }
   scroll.append(grid);card.append(scroll);el('historyCalendarCalendars').append(card);
  }
  const d=historyDay(state),active=typeof d?.net==='number';
  el('historyCalendarDayTitle').textContent=date(state.day)+'/2026 · '+historyDayState(d);
  el('historyCalendarDaySummary').textContent=active?`Résultat : ${money(d.net)} · cumul du mois : ${money(d.cumulative)} · ${d.trades} trade(s) · solde après les mouvements du jour : ${money(d.balance)}.`:d.state==='missing-data'?'Données non correspondantes : cette séance est exclue du total observé. Aucun résultat n’est calculé pour cette date ; ce n’est pas un gain nul.':'Aucun résultat calculé pour cette date. Cette case ne représente pas un gain nul.';
  el('historyCalendarDayExtra').textContent=active?`${state.mode==='evaluation'?'Retrait non applicable.':`Versement simulé ce jour : ${money(d.receiptEUR,'EUR')}.`} ${d.averageRiskUSD===null?'Risque moyen de la journée non enregistré dans ce rapport.':`Risque planifié moyen : ${money(d.averageRiskUSD)}.`}`:'';
  const marketRows=active&&Array.isArray(d.markets)?d.markets:null;
  el('historyCalendarDayTable').hidden=marketRows===null;rows('historyCalendarDayMarkets',marketRows?.map(m=>[m.symbol,m.trades,money(m.net)])??[]);
  el('historyCalendarDayMissing').textContent=active&&!marketRows?'La répartition par marché n’a pas été enregistrée pour cette journée. Les totaux mensuels restent disponibles ci-dessous.':'';
  el('historyCalendarTotalsHead').replaceChildren();for(const label of ['Marché',...state.months.map(m=>m.label)]){const th=node('th',label);th.setAttribute('scope','col');el('historyCalendarTotalsHead').append(th);}
  rows('historyCalendarTotals',['MNQ','MES','MGC','MYM'].map(symbol=>[symbol,...state.months.map(m=>money(m.result.contributions.find(c=>c.symbol===symbol)?.net))]));
  rows('historyCalendarWeeks',state.months.flatMap(m=>m.result.calendar.weeks.map(w=>[m.label,`${date(w.start)}–${date(w.end)}${w.partialMonth?' *':''}${w.missing?' · données partielles':''}`,w.trades??'—',money(w.net),money(w.cumulative),state.mode==='evaluation'?'Non applicable':money(w.receiptEUR,'EUR')])));
  el('historyCalendarResults').hidden=false;el('historyCalendarMessage').textContent=`Historique conservé : ${model.game.label}. La sélection change l’affichage, sans modifier les résultats enregistrés.`;
  saveHistoryPreferences(storage,state);if(focusDay)selectedButton?.focus?.({preventScroll:true});
 }
 async function chooseGame(gameId,preference={}){
  const ticket=++sequence,game=manifest.games.find(g=>g.id===gameId);if(!game)throw Error('Unknown calendar game');el('historyCalendarGameSelect').value=gameId;hideResults();setLoading(true);el('historyCalendarMessage').textContent='Chargement du calendrier enregistré…';
  el('historyCalendarReport').href='./'+game.report;
  try{const loaded=await load(game);if(ticket!==sequence)return;model=loaded;state=selectHistory(model,{...preference,game:game.id});
   selectOptions('historyCalendarVariant',model.variants,state.variant);selectOptions('historyCalendarMode',model.modes.map(id=>({id,label:modeLabel(id)})),state.mode);
   el('historyCalendarCost').value=state.cost;setLoading(false);render();
  }catch{if(ticket!==sequence)return;hideResults();el('historyCalendarMessage').textContent='Le calendrier vérifié de ce jeu est indisponible. Réessaie ou choisis un autre jeu ; aucun ancien résultat ne le remplace.';}
 }
 try{
  if(options.manifest)manifest=options.manifest;else{const response=await fetcher(new URL('./history-calendar-manifest.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Manifest unavailable');manifest=await response.json();}
  if(manifest.schema!=='history-calendar-manifest-v1'||manifest.games.length!==Object.keys(verifiers).length||new Set(manifest.games.map(g=>g.id)).size!==manifest.games.length||manifest.games.some(g=>!verifiers[g.id]||g.report!==`jeu${g.id}-report.json`)||!manifest.games.some(g=>g.id===manifest.defaultGame))throw Error('Invalid manifest');
  const game=manifest.games.some(g=>g.id===saved.game)?saved.game:manifest.defaultGame;selectOptions('historyCalendarGameSelect',manifest.games,game);
  el('historyCalendarGameSelect').addEventListener('change',()=>chooseGame(el('historyCalendarGameSelect').value,{mode:state?.mode,cost:state?.cost,day:state?.day??saved.day}));
  for(const id of ['historyCalendarVariant','historyCalendarMode','historyCalendarCost'])el(id).addEventListener('change',()=>{if(!model||el(id).disabled)return;state={...state,variant:el('historyCalendarVariant').value,mode:el('historyCalendarMode').value,cost:el('historyCalendarCost').value};render();});
  el('historyCalendarRetry').addEventListener('click',()=>chooseGame(el('historyCalendarGameSelect').value,state??saved));
  await chooseGame(game,saved);
 }catch{hideResults();setLoading(true);el('historyCalendarMessage').textContent='L’historique est indisponible. Recharge la page pour réessayer.';}
 return {getSelection:()=>state,chooseGame};
}
if(globalThis.document?.getElementById('historyCalendarGame'))void initHistoryCalendar();

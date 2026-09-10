import {calendarCells37} from './jeu37-calendar-view.mjs';

export const HISTORY_MONTHS=Object.freeze([
 {id:'june',label:'Juin',start:'2026-06-01',end:'2026-07-01'},
 {id:'july',label:'Juillet',start:'2026-07-01',end:'2026-08-01'},
 {id:'august',label:'Août',start:'2026-08-01',end:'2026-09-01'}
]);
export const HISTORY_EIGHT_MONTHS=Object.freeze([
 {id:'january',label:'Janvier',start:'2026-01-01',end:'2026-02-01'},
 {id:'february',label:'Février',start:'2026-02-01',end:'2026-03-01'},
 {id:'march',label:'Mars',start:'2026-03-01',end:'2026-04-01'},
 {id:'april',label:'Avril',start:'2026-04-01',end:'2026-05-01'},
 {id:'may',label:'Mai',start:'2026-05-01',end:'2026-06-01'},
 ...HISTORY_MONTHS
]);
export const HISTORY_STORAGE_KEY='nykuto.lab.calendar.selection.v1';
const cents=n=>Math.round(n*100)/100;
const validDay=day=>typeof day==='string'&&/^2026-0[1-8]-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T00:00:00Z'))&&new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day;

export function readHistoryPreferences(storage){
 try{const p=JSON.parse(storage?.getItem(HISTORY_STORAGE_KEY)??'null');if(p?.version!==1)return {};
  return Object.fromEntries(['game','variant','mode','cost','day'].filter(k=>typeof p[k]==='string'&&p[k].length<=80).map(k=>[k,p[k]]));
 }catch{return {};}
}
export function saveHistoryPreferences(storage,state){
 try{storage?.setItem(HISTORY_STORAGE_KEY,JSON.stringify({version:1,...Object.fromEntries(['game','variant','mode','cost','day'].map(k=>[k,state[k]]))}));}catch{/* Storage is optional. */}
}

// Display adapter only. Archived results, dates and amounts remain untouched.
export function adaptHistoryReport(report,game){
 if(!report.audit?.passed||report.executionAllowed!==false||report.confirmed!==false)throw Error('Unverified history');
 const is33=game.id==='33',is38=game.id==='38',months=['40','41','42'].includes(game.id)?HISTORY_EIGHT_MONTHS:HISTORY_MONTHS;
 const variants=is33?report.accountProfiles.map(p=>({id:p.id,label:`${p.initial===25000?'25K':'50K'} · ${p.dynamic?'risque réduit après pertes':'risque fixe 100 $'}`,initial:p.initial})):(report.variants??game.variants).map(v=>({id:v.id,label:v.label,initial:50000}));
 const source=report.views.filter(v=>months.some(m=>m.id===(v.month??v.id)));
 const views=source.map(v=>{
  const month=v.month??v.id,m=months.find(m=>m.id===month),variant=v.variant??v.profileId,mode=v.mode??(is33?'evaluation':is38?'funded':null);
  if(!mode||(!is38&&v.resetAtStart!==true)||v.period.start!==m.start||v.period.end!==m.end||!variants.some(x=>x.id===variant))throw Error('Unsupported calendar view');
  const costs=Object.fromEntries(['normal','stress'].map(cost=>{
   const c=v.costs[cost];if(!c||!Number.isFinite(c.net)||!Array.isArray(c.calendar?.daily)||!Array.isArray(c.calendar?.weeks))throw Error('Missing archived calendar');
   const daily=c.calendar.daily.map(d=>({...d,state:['positive','negative','flat-active'].includes(d.state)?'traded':d.state,receiptEUR:is33?null:d.receiptEUR,markets:d.markets??d.contributions??null,averageRiskUSD:d.averageRiskUSD??null}));
   const weeks=c.calendar.weeks.map((w,i)=>is33?{...w,number:i+1,start:w.first,end:w.last,observed:w.simulatedSessions,expected:w.expectedSessions,receiptEUR:null,partialMonth:w.week<m.start||new Date(Date.parse(w.week+'T00:00:00Z')+4*86400000).toISOString().slice(0,10)>=m.end}:w);
   if(cents(daily.reduce((n,d)=>n+(d.net??0),0))!==c.net||cents(weeks.reduce((n,w)=>n+(w.net??0),0))!==c.net||new Set(daily.map(d=>d.day)).size!==daily.length)throw Error('Calendar totals differ');
   return [cost,{...c,receiptEUR:is33?null:c.receiptEUR,calendar:{daily,weeks}}];
  }));
  return {month,label:m.label,variant,mode,period:v.period,costs,initial:variants.find(x=>x.id===variant).initial};
 });
 const modes=[...new Set(views.map(v=>v.mode))];
 if(new Set(views.map(v=>`${v.month}/${v.variant}/${v.mode}`)).size!==views.length)throw Error('Duplicate history view');
 for(const variant of variants)for(const mode of modes)for(const m of months)if(!views.some(v=>v.variant===variant.id&&v.mode===mode&&v.month===m.id))throw Error('Incomplete history view');
 return {game,variants,modes,views,months};
}

export function selectHistory(model,preference={}){
 const variant=model.variants.some(v=>v.id===preference.variant)?preference.variant:model.game.defaultVariant;
 const mode=model.modes.includes(preference.mode)?preference.mode:model.modes.includes('funded')?'funded':model.modes[0];
 const cost=preference.cost==='stress'?'stress':'normal',day=validDay(preference.day)&&model.months.some(m=>preference.day>=m.start&&preference.day<m.end)?preference.day:model.months[0].start;
 const months=model.months.map(m=>{const v=model.views.find(v=>v.month===m.id&&v.variant===variant&&v.mode===mode);if(!v)throw Error('Unknown archived selection');return {...v,result:v.costs[cost]};});
 const goalMode=mode==='evaluation'?'evaluation':model.game.id==='37'&&variant==='control'?'personal':model.game.goalMode;
 return {game:model.game.id,variant,mode,cost,day,months,goalMode};
}

export function historyCells(month){return calendarCells37(month.period,month.result.calendar.daily);}
export function historyDay(selection){return selection.months.flatMap(historyCells).find(d=>d.day===selection.day);}
export function historyDayState(d){
 if(d.state==='weekend')return 'Week-end';if(d.state==='not-studied')return 'Non étudié';if(d.state==='missing-data')return 'Données non correspondantes';
 if(d.state.startsWith('stopped-'))return 'Arrêt';return d.trades===0?'Sans trade':`${d.trades} trade(s)`;
}

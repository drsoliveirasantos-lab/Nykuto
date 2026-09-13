export const MONTHS37=['june','july','august'];
export const GRADE_LABELS37={low:'0–2 ou contexte incomplet',medium:'3–4 confirmations',full:'5 confirmations'};
export function calendarCells37(period,daily){
 const start=new Date(period.start+'T00:00:00Z'),end=new Date(period.end+'T00:00:00Z');
 const lookup=new Map(daily.map(d=>[d.day,d])),cells=[];
 for(let i=0;i<(start.getUTCDay()+6)%7;i++)cells.push({state:'padding'});
 for(let time=+start;time<+end;time+=86400000){
  const date=new Date(time),day=date.toISOString().slice(0,10),record=lookup.get(day);
  cells.push(record?{...record}:{day,state:[0,6].includes(date.getUTCDay())?'weekend':'not-studied',net:null,trades:null});
 }
 while(cells.length%7)cells.push({state:'padding'});
 return cells;
}
export function gradeEvidence37(views,cost){
 return ['MNQ','MES'].flatMap(symbol=>['low','medium','full'].map(grade=>{
  const rows=views.filter(v=>v.variant==='fixed100').map(v=>v.costs[cost].quality.find(q=>q.symbol===symbol&&q.grade===grade));
  const trades=rows.reduce((n,q)=>n+q.trades,0);
  return {symbol,grade,trades,wins:rows.reduce((n,q)=>n+q.wins,0),net:Math.round(rows.reduce((n,q)=>n+q.net,0)*100)/100,
   meanNetR:trades?rows.reduce((n,q)=>n+(q.meanNetR??0)*q.trades,0)/trades:null};
 }));
}

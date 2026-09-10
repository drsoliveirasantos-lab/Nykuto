import {mondayOf} from './jeu30-calendar.mjs';
const cents=n=>Math.round(n*100)/100;
export function monthlyCalendar(run,expected){
 const days=expected.map(d=>typeof d==='string'?d:d.date),lookup=new Map(run.days.map(d=>[d.day,d]));
 if(new Set(days).size!==days.length||lookup.size!==run.days.length)throw Error('Duplicate calendar day');
 let previous=run.initial,cumulative=0;
 const daily=days.map(day=>{
  const d=lookup.get(day);if(!d){if(!run.terminalDay||day<=run.terminalDay)throw Error('Unexplained missing day');return {day,week:mondayOf(day),state:'stopped-'+run.status,net:null,trades:null,cumulative:null,balance:null,receiptEUR:0,maxReceiptEUR:null};}
  const trades=run.trades.filter(t=>t.day===day),net=cents(trades.reduce((n,t)=>n+t.netDollars,0));
  if(net!==d.net||trades.length!==d.trades||cents(previous+net-d.payoutGrossUSD)!==d.balance)throw Error('Daily cashflow mismatch');
  previous=d.balance;cumulative=cents(cumulative+net);
  return {day,week:mondayOf(day),state:d.trades?'traded':'no-trade',net,trades:d.trades,cumulative,balance:d.balance,floor:d.floor,receiptEUR:d.payoutReceiptEUR,payoutGrossUSD:d.payoutGrossUSD,maxReceiptEUR:d.payout.maxReceiptEUR,qualifyingDays:d.qualifyingDays,remainingProfitUSD:d.payout.remainingProfitUSD,goalAchieved:d.payoutReceiptEUR>=1000};
 });
 const weeks=[...new Set(daily.map(d=>d.week))].map((week,i)=>{
  const all=daily.filter(d=>d.week===week),rows=all.filter(d=>d.net!==null),last=rows.at(-1),friday=new Date(Date.parse(week+'T00:00Z')+4*86400000).toISOString().slice(0,10);
  return {number:i+1,week,start:all[0].day,end:all.at(-1).day,partialMonth:week<days[0]||friday>days.at(-1),observed:rows.length,expected:all.length,trades:rows.reduce((n,d)=>n+d.trades,0),net:rows.length?cents(rows.reduce((n,d)=>n+d.net,0)):null,cumulative:last?.cumulative??null,receiptEUR:cents(rows.reduce((n,d)=>n+d.receiptEUR,0)),maxReceiptEUR:last?.maxReceiptEUR??null,qualifyingDays:last?.qualifyingDays??null};
 });
 if(cents(daily.reduce((n,d)=>n+(d.net??0),0))!==run.net||cents(daily.reduce((n,d)=>n+d.receiptEUR,0))!==run.receiptEUR)throw Error('Monthly total mismatch');
 return {daily,weeks};
}

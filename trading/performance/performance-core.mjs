export const MODES = Object.freeze({all:'Tous les modes',manual:'Manuel',paper:'Simulation',replay:'Replay',unknown:'Non renseigné'});
const dayFormatters = new Map();
export function journalMode(t) {
  if (Object.hasOwn(t,'mode')) return ['manual','paper','replay'].includes(t.mode)?t.mode:'unknown';
  return ['manual','paper'].includes(t.discipline?.mode)?t.discipline.mode:'unknown';
}
export function validTimestamp(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))return false;
  const [y,m,d]=value.slice(0,10).split('-').map(Number),check=new Date(Date.UTC(y,m-1,d));
  return check.getUTCFullYear()===y&&check.getUTCMonth()===m-1&&check.getUTCDate()===d&&Number.isFinite(Date.parse(value));
}
export function dateKey(value,zone) {
  if(!dayFormatters.has(zone))dayFormatters.set(zone,new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}));
  const parts=dayFormatters.get(zone).formatToParts(new Date(value));
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
}
export function monthInfo(month) {
  if(typeof month!=='string'||! /^(?:19\d{2}|20\d{2}|2100)-(?:0[1-9]|1[0-2])$/.test(month))throw new Error('Choisis un mois entre 1900 et 2100.');
  const [year,m]=month.split('-').map(Number);
  return {year,month:m,days:new Date(Date.UTC(year,m,0)).getUTCDate(),offset:(new Date(Date.UTC(year,m-1,1)).getUTCDay()+6)%7};
}
export function shiftMonth(month,delta) {
  const m=monthInfo(month),date=new Date(Date.UTC(m.year,m.month-1+delta,1));
  const result=`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
  monthInfo(result);return result;
}
export function prepareJournal(trades,zone) {
  // Validate the timezone even for an empty account. Input is account-scoped.
  dateKey(Date.now(),zone);
  if(!Array.isArray(trades))throw new Error('Journal indisponible. Recharge la page.');
  const rows=[],seen=new Set();let excluded=0;
  trades.forEach((t,index)=>{
    const explicit=t&&Object.hasOwn(t,'closedAt'),stamp=explicit?t.closedAt:t?.createdAt;
    if(!t||typeof t.id!=='string'||!t.id||seen.has(t.id)||typeof t.r!=='number'||!Number.isFinite(t.r)||!validTimestamp(stamp)) {excluded++;return;}
    seen.add(t.id);
    rows.push({...t,time:Date.parse(stamp),day:dateKey(stamp,zone),mode:journalMode(t),legacyDate:!explicit,index});
  });
  rows.sort((a,b)=>a.time-b.time||a.index-b.index);
  return {rows,excluded};
}
function stats(rows) {
  let total=0,gains=0,losses=0,peak=0,drawdown=0,wins=0,losing=0,streak=0,maxLosingStreak=0;
  for(const t of rows){total+=t.r;peak=Math.max(peak,total);drawdown=Math.max(drawdown,peak-total);
    if(t.r>0){gains+=t.r;wins++;streak=0;}else if(t.r<0){losses-=t.r;losing++;streak++;maxLosingStreak=Math.max(maxLosingStreak,streak);}else streak=0;
  }
  if(![total,gains,losses,drawdown].every(Number.isFinite))throw new Error('Montants du journal trop élevés pour être calculés.');
  return {count:rows.length,total,wins,losing,flat:rows.length-wins-losing,winRate:rows.length?wins/rows.length*100:null,average:rows.length?total/rows.length:null,ratio:losses>0?gains/losses:null,gains,losses,drawdown,maxLosingStreak};
}
export function monthlyPerformance(prepared,month,mode='all') {
  const info=monthInfo(month);if(!Object.hasOwn(MODES,mode))throw new Error('Mode de trading invalide.');
  const rows=prepared.rows.filter(t=>t.day.startsWith(`${month}-`)&&(mode==='all'||t.mode===mode));
  const days=Array.from({length:info.days},(_,i)=>({day:`${month}-${String(i+1).padStart(2,'0')}`,rows:[],total:0,cumulative:0}));
  rows.forEach(t=>{const d=days[Number(t.day.slice(-2))-1];d.rows.push(t);d.total+=t.r;});
  let cumulative=0;days.forEach(d=>{cumulative+=d.total;d.cumulative=cumulative;});
  return {...stats(rows),...info,rows,days,legacyDates:rows.filter(t=>t.legacyDate).length,unknownModes:rows.filter(t=>t.mode==='unknown').length,excluded:prepared.excluded};
}

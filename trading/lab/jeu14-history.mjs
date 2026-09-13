import { sessionFor } from './session-comparison.mjs';
import { inspectConfirmation } from './mnq-confirmation.mjs';
import { aggregateFive, inspectFiveGroup } from './jeu12-engine.mjs';
import { JEU14_POLICY, JEU14_SEGMENTS, historyCalendar } from './jeu14-policy.mjs';

export function inspectHistory(bundle) {
  if (bundle?.schema !== 'jeu14-data-v1' || bundle.protocol !== JEU14_POLICY.version || bundle.segments?.length !== JEU14_SEGMENTS.length || !Array.isArray(bundle.scheduleEvents)) throw new Error('Invalid history bundle.');
  const groups = [], quality = [], eligible = [], unavailable = [];
  for (const [index, d] of JEU14_SEGMENTS.entries()) {
    const raw = bundle.segments[index];
    if (raw.ticker !== d.ticker || raw.expiry !== d.expiry || raw.paginationComplete !== true || !Array.isArray(raw.bars) || raw.bars.length > 20000) throw new Error('Invalid history contract or pagination.');
    const calendar = historyCalendar(d.prep,d.end), daily = new Map(calendar.map(s=>[s.date,[]])), seen = new Set();
    for (const values of raw.bars) {
      if (!Array.isArray(values) || values.length!==6 || !values.every(Number.isFinite)) throw new Error('Invalid history OHLCV.');
      const [time,open,high,low,close,volume] = values, local=sessionFor(time), session=calendar.find(s=>s.date===local.day);
      if (!Number.isInteger(time)||time%300||seen.has(time)||!session||low<=0||high<Math.max(open,close,low)||low>Math.min(open,close)||volume<0||[open,high,low,close].some(p=>Math.abs(p/.25-Math.round(p/.25))>1e-7)) throw new Error('Invalid history price, tick, day or timestamp.');
      seen.add(time); const closeMinute=Number(session.close.slice(11,13))*60+Number(session.close.slice(14,16));
      if (local.minute<570||local.minute>=closeMinute) throw new Error('History price outside cash session.');
      daily.get(local.day).push({time,open,high,low,close,volume,...local,closeMinute});
    }
    const runs = []; let current=[]; const issues=[];
    for (const s of calendar) {
      const bars=daily.get(s.date).sort((a,b)=>a.time-b.time),closeMinute=Number(s.close.slice(11,13))*60+Number(s.close.slice(14,16));
      const missingMinutes=[];for(let m=570;m<closeMinute;m+=5) if(!bars.some(b=>b.minute===m))missingMinutes.push(m);
      const fullPrices=!missingMinutes.length&&bars.length===(closeMinute-570)/5;
      const fifteen=fullPrices?aggregateFive(bars,15).map(b=>[b.time,b.open,b.high,b.low,b.close,b.volume]):[];
      const next=new Date(Date.parse(s.date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
      const events=bundle.scheduleEvents.filter(e=>e.session_end_date===s.date);
      const check=inspectConfirmation({schema:'jeu07-data-v1',ticker:d.ticker,calendar:[s],bars:fifteen,scheduleEvents:events},{...d,prep:s.date,start:next,end:next,calendarDays:[s.date],earlyCloses:{[s.date]:closeMinute}});
      const fullSchedule=!check.quality.missingScheduleDays.length;
      if(fullPrices&&fullSchedule) current.push(s);
      else {
        if(current.length)runs.push(current);current=[];
        const issue={ticker:d.ticker,date:s.date,missingMinutes,missingSchedule:!fullSchedule,scoredRange:s.date>=d.start};issues.push(issue);
        if(issue.scoredRange)unavailable.push({...issue,reason:'missing-data'});
      }
    }
    if(current.length)runs.push(current);
    const blocks=[];
    for(const sessions of runs){
      let count=0,firstScore=null;
      for(const s of sessions){
        if(count>=JEU14_POLICY.warmup&&s.date>=d.start&&firstScore===null)firstScore=s.date;
        if(s.date>=d.start&&firstScore===null)unavailable.push({ticker:d.ticker,date:s.date,reason:'warmup'});
        count+=daily.get(s.date).length/6;
      }
      const block={ticker:d.ticker,prep:sessions[0].date,last:sessions.at(-1).date,start:firstScore,sessions:sessions.length,scoredSessions:firstScore?sessions.filter(s=>s.date>=firstScore).length:0};blocks.push(block);
      if(!firstScore)continue;
      const end=new Date(Date.parse(sessions.at(-1).date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
      const def={...d,prep:sessions[0].date,start:firstScore,end};
      const bars=sessions.flatMap(s=>daily.get(s.date).map(b=>[b.time,b.open,b.high,b.low,b.close,b.volume]));
      const days=new Set(sessions.map(s=>s.date));
      const g=inspectFiveGroup({...raw,bars},def,sessions,bundle.scheduleEvents.filter(e=>days.has(e.session_end_date)));
      groups.push(g);eligible.push(...sessions.filter(s=>s.date>=firstScore).map(s=>({ticker:d.ticker,date:s.date})));
    }
    quality.push({ticker:d.ticker,prep:d.prep,start:d.start,end:d.end,bars:raw.bars.length,expectedSessions:calendar.length,issues,blocks});
  }
  eligible.sort((a,b)=>a.date.localeCompare(b.date));unavailable.sort((a,b)=>a.date.localeCompare(b.date));
  const expected=historyCalendar().map(s=>s.date),all=[...eligible,...unavailable];
  if(all.length!==expected.length||new Set(all.map(s=>s.date)).size!==expected.length||expected.some(d=>!all.some(s=>s.date===d)))throw new Error('History coverage duplicates or omissions.');
  return {groups,quality,eligible,unavailable,expectedSessions:expected.length};
}

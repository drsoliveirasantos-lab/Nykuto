import { sessionFor } from './session-comparison.mjs';
import { historyCalendar } from './jeu14-policy.mjs';
import { aggregateFive } from './jeu12-engine.mjs';
import { JEU19_POLICY as P, JEU19_SEGMENTS } from './jeu19-policy.mjs';

export function scheduleCovers(events, product, session, closeMinute) {
  const unique = new Map();
  for (const e of events.filter(e => e.session_end_date === session)) {
    if (e.product_code !== product.symbol || e.trading_venue !== product.venue || !['open','close','pre_open','paused','halt','pcp'].includes(e.event) || typeof e.timestamp !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/.test(e.timestamp) || !Number.isFinite(Date.parse(e.timestamp))) throw new Error('Invalid futures schedule');
    unique.set(e.event + '/' + e.timestamp, e);
  }
  let opened = null;
  for (const e of [...unique.values()].sort((a,b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
    const t = Date.parse(e.timestamp) / 1000;
    if (e.event === 'open') opened = t;
    else if (opened !== null) {
      const left = sessionFor(opened), right = sessionFor(t);
      if (e.event === 'close' && t > opened && (left.day < session || left.day === session && left.minute + opened % 60 / 60 <= 570) && (right.day > session || right.day === session && right.minute + t % 60 / 60 >= closeMinute)) return true;
      opened = null;
    }
  }
  return false;
}

export function inspectMultimarket(bundle, product) {
  const defs = JEU19_SEGMENTS.filter(d => d.symbol === product.symbol);
  if (!defs.length || bundle?.symbol !== product.symbol || bundle.segments?.length !== defs.length || !Array.isArray(bundle.scheduleEvents)) throw new Error('Invalid market bundle');
  const groups = [], eligible = [], unavailable = [], quality = [];
  for (const [index, d] of defs.entries()) {
    const raw = bundle.segments[index], meta = raw?.metadata;
    if (raw?.ticker !== d.ticker || raw.paginationComplete !== true || !Array.isArray(raw.bars) || raw.bars.length > 50000 || meta?.ticker !== d.ticker || meta.product_code !== product.symbol || meta.trading_venue !== product.venue || Number(meta.trade_tick_size) !== product.tick || meta.first_trade_date > d.prep || meta.last_trade_date < d.end) throw new Error('Invalid contract metadata or pagination');
    const calendar = historyCalendar(d.prep, d.end), sessions = new Map(calendar.map(s => [s.date, s]));
    const daily = new Map(calendar.map(s => [s.date, []])), seen = new Set();
    for (const row of raw.bars) {
      if (!Array.isArray(row) || row.length !== 6 || !row.every(Number.isFinite)) throw new Error('Invalid OHLCV row');
      const [time,open,high,low,close,volume] = row, local = sessionFor(time), s = sessions.get(local.day);
      if (!Number.isInteger(time) || time % 300 || seen.has(time) || low <= 0 || high < Math.max(open,close,low) || low > Math.min(open,close) || volume < 0 || [open,high,low,close].some(v => Math.abs(v / product.tick - Math.round(v / product.tick)) > 1e-7)) throw new Error('Invalid price, tick or timestamp');
      seen.add(time);
      if (!s) continue;
      const closeMinute = Number(s.close.slice(11,13))*60 + Number(s.close.slice(14,16));
      if (local.minute < 570 || local.minute >= closeMinute) continue;
      daily.get(local.day).push({ time,open,high,low,close,volume,...local,closeMinute,ticker:d.ticker });
    }
    const runs = [], issues = []; let current = [];
    for (const s of calendar) {
      const closeMinute = Number(s.close.slice(11,13))*60 + Number(s.close.slice(14,16)), bars = daily.get(s.date).sort((a,b)=>a.time-b.time);
      const complete = bars.length === (closeMinute-570)/5 && bars.every((b,i)=>b.minute===570+i*5);
      const scheduled = scheduleCovers(bundle.scheduleEvents, product, s.date, closeMinute);
      if (complete && scheduled) current.push(s);
      else {
        if (current.length) runs.push(current); current = [];
        const issue = { ticker:d.ticker,date:s.date,reason:'missing-data',missingBars:(closeMinute-570)/5-bars.length,missingSchedule:!scheduled };
        issues.push(issue); if (s.date>=d.start) unavailable.push(issue);
      }
    }
    if (current.length) runs.push(current);
    for (const run of runs) {
      let warmup = 0, start = null;
      for (const s of run) {
        if (s.date>=d.start && warmup>=P.warmup30 && start===null) start=s.date;
        if (s.date>=d.start && start===null) unavailable.push({ticker:d.ticker,date:s.date,reason:'warmup'});
        warmup += daily.get(s.date).length/6;
      }
      if (!start) continue;
      const candles = run.flatMap(s=>daily.get(s.date)); aggregateFive(candles,30);
      const end = new Date(Date.parse(run.at(-1).date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
      groups.push({ticker:d.ticker,prep:run[0].date,start,end,candles});
      eligible.push(...run.filter(s=>s.date>=start).map(s=>({ticker:d.ticker,date:s.date})));
    }
    quality.push({ticker:d.ticker,rows:raw.bars.length,expectedPrepSessions:calendar.length,issues});
  }
  const expected = historyCalendar(P.from,P.end).map(s=>s.date), all=[...eligible,...unavailable];
  if(all.length!==expected.length || new Set(all.map(s=>s.date)).size!==expected.length || expected.some(d=>!all.some(s=>s.date===d))) throw new Error('Coverage omission or duplication');
  return {groups,eligible,unavailable,quality,expectedSessions:expected.length};
}

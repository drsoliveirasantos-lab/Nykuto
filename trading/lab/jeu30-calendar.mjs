const cents = n => Math.round(n * 100) / 100;
const dateOK = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
  && Number.isFinite(Date.parse(d + 'T00:00:00Z')) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
export function mondayOf(day) {
  if (!dateOK(day)) throw new Error('Invalid calendar day');
  const date = new Date(day + 'T00:00:00Z'); date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

// Summarize one CONTINUOUS replay. Never restart equity at week boundaries.
export function calendarBreakdown(run, expectedDays, unavailable = []) {
  const expected = expectedDays.map(d => typeof d === 'string' ? d : d.date), missing = new Set(unavailable);
  if (!expected.every(dateOK) || new Set(expected).size !== expected.length || expected.some((d, i) => i && d <= expected[i - 1])
    || [...missing].some(d => !expected.includes(d))) throw new Error('Invalid expected calendar');
  const lookup = new Map(run.days.map(d => [d.day, d]));
  if (lookup.size !== run.days.length || run.days.some((d, i) => !expected.includes(d.day) || missing.has(d.day)
    || !Number.isFinite(d.net) || !Number.isFinite(d.balance) || !Number.isSafeInteger(d.trades) || d.trades < 0
    || (i && d.day <= run.days[i - 1].day))) throw new Error('Invalid replay days');
  for (const t of run.trades) if (!lookup.has(t.day) || !Number.isFinite(t.netDollars)) throw new Error('Detached replay trade');
  let cumulative = 0, peak = 0, lastBalance = 25000;
  const daily = expected.map(day => {
    const d = lookup.get(day), week = mondayOf(day), trades = run.trades.filter(t => t.day === day);
    if (!d) {
      const state = missing.has(day) ? 'missing-data' : ['targetMet', 'breached'].includes(run.status) && day > run.terminalDay
        ? run.status === 'targetMet' ? 'stopped-target' : 'stopped-breach' : null;
      if (!state) throw new Error('Unexplained missing replay day');
      return { day, week, state, trades: null, net: null, cumulative: null, balance: null, floor: null, contributions: [] };
    }
    if (trades.length !== d.trades || cents(trades.reduce((n, t) => n + t.netDollars, 0)) !== d.net
      || cents(lastBalance + d.net) !== d.balance) throw new Error('Daily reconciliation failed');
    cumulative = cents(cumulative + d.net); peak = Math.max(peak, cumulative); lastBalance = d.balance;
    const contributions = ['MES', 'MGC', 'MNQ', 'MYM'].map(symbol => {
      const same = trades.filter(t => t.symbol === symbol);
      return { symbol, trades: same.length, net: cents(same.reduce((n, t) => n + t.netDollars, 0)) };
    });
    if (cents(contributions.reduce((n, c) => n + c.net, 0)) !== d.net) throw new Error('Unknown market in day');
    return { day, week, state: d.trades ? d.net > 0 ? 'positive' : d.net < 0 ? 'negative' : 'flat-active' : 'no-trade',
      trades: d.trades, net: d.net, cumulative, balance: d.balance, floor: d.floor,
      eodDrawdown: cents(peak - cumulative), contributions };
  });
  const weeks = [...new Set(daily.map(d => d.week))].map(week => {
    const rows = daily.filter(d => d.week === week), scored = rows.filter(d => d.net !== null);
    return { week, first: rows[0].day, last: rows.at(-1).day, expectedSessions: rows.length,
      simulatedSessions: scored.length, missingSessions: rows.filter(d => d.state === 'missing-data').length,
      stoppedSessions: rows.filter(d => d.state.startsWith('stopped-')).length,
      trades: scored.length ? scored.reduce((n, d) => n + d.trades, 0) : null,
      net: scored.length ? cents(scored.reduce((n, d) => n + d.net, 0)) : null,
      cumulative: scored.at(-1)?.cumulative ?? null, balance: scored.at(-1)?.balance ?? null,
      positive: scored.filter(d => d.state === 'positive').length, negative: scored.filter(d => d.state === 'negative').length };
  });
  if (cents(daily.reduce((n, d) => n + (d.net ?? 0), 0)) !== run.net || cents(weeks.reduce((n, w) => n + (w.net ?? 0), 0)) !== run.net)
    throw new Error('Calendar totals mismatch');
  return { daily, weeks };
}

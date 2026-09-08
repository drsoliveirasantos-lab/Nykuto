// Descriptive rules, not an order generator. Input must contain only the chosen
// closed candles; no state is learned from anything after the selected endpoint.
export const STRUCTURE_RULES = Object.freeze({ pivotLeft: 2, pivotRight: 2, impulseBody: 0.6, dojiBody: 0.1, minCount: 20, maxCount: 500 });
export function selectAnalysisWindow(candles, count, endIndex) {
  if (!Array.isArray(candles) || !Number.isInteger(count) || count < 20 || count > 500 || !Number.isInteger(endIndex) || endIndex < 0 || endIndex >= candles.length) throw new Error('Choisis entre 20 et 500 bougies et une fin disponible.');
  return candles.slice(Math.max(0, endIndex - count + 1), endIndex + 1);
}
export function aggregateCashHours(candles) {
  const hours = [];
  for (let i = 0; i < candles.length; i += 1) {
    const first = candles[i];
    if ((first.minute - 570) % 60 !== 0) continue;
    const block = candles.slice(i, i + 4);
    if (block.length !== 4 || !block.every((c, j) => c.day === first.day && c.time === first.time + j * 900)) continue;
    hours.push({ time: first.time, day: first.day, minute: first.minute, closedAt: first.time + 3600, open: first.open, high: Math.max(...block.map(c => c.high)), low: Math.min(...block.map(c => c.low)), close: block[3].close, volume: block.reduce((v, c) => v + c.volume, 0) });
  }
  return hours;
}
export function candlePatterns(previous, current, interval) {
  const range = current.high - current.low, body = Math.abs(current.close - current.open);
  if (!(range > 0)) return ['Sans amplitude'];
  const upper = current.high - Math.max(current.open, current.close), lower = Math.min(current.open, current.close) - current.low;
  const patterns = [];
  if (body / range <= STRUCTURE_RULES.dojiBody) patterns.push('Doji');
  if (body / range > STRUCTURE_RULES.dojiBody && lower >= 2 * body && upper <= body) patterns.push('Forme de marteau');
  if (body / range > STRUCTURE_RULES.dojiBody && upper >= 2 * body && lower <= body) patterns.push('Longue mèche haute');
  if (body / range >= 0.8) patterns.push(current.close > current.open ? 'Corps haussier dominant' : 'Corps baissier dominant');
  if (previous && current.day === previous.day && current.time - previous.time === interval) {
    if (previous.close < previous.open && current.close > current.open && current.open <= previous.close && current.close >= previous.open && (current.open < previous.close || current.close > previous.open)) patterns.push('Englobante haussière');
    if (previous.close > previous.open && current.close < current.open && current.open >= previous.close && current.close <= previous.open && (current.open > previous.close || current.close < previous.open)) patterns.push('Englobante baissière');
  }
  return patterns.length ? patterns : ['Aucun motif retenu'];
}
function swingTrend(highs, lows) {
  if (highs.length < 2 || lows.length < 2) return 'Insuffisante';
  const upHigh = highs.at(-1).price > highs.at(-2).price, downHigh = highs.at(-1).price < highs.at(-2).price;
  const upLow = lows.at(-1).price > lows.at(-2).price, downLow = lows.at(-1).price < lows.at(-2).price;
  return upHigh && upLow ? 'Haussière' : downHigh && downLow ? 'Baissière' : 'Mixte';
}
export function analyzeCandles(candles, interval = 900) {
  if (!Array.isArray(candles) || !candles.length || candles.length > 500 || ![900, 3600].includes(interval)) throw new Error('Sélection de bougies invalide.');
  for (const [i, c] of candles.entries()) {
    if (!['time','open','high','low','close','volume'].every(k => typeof c[k] === 'number' && Number.isFinite(c[k])) || !Number.isInteger(c.time) || c.low <= 0 || c.high < Math.max(c.open, c.close, c.low) || c.low > Math.min(c.open, c.close) || c.volume < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(c.day || '') || (i && c.time <= candles[i-1].time) || (c.closedAt !== undefined && c.closedAt !== c.time + interval)) throw new Error('Prix, horaire ou ordre des bougies invalide.');
  }
  const highs = [], lows = [], events = [];
  let activeHigh = null, activeLow = null, bias = null, fast = null, slow = null, atr = null;
  for (let i = 0; i < candles.length; i += 1) {
    const c = candles[i], previousAtr = atr;
    const previousClose = i ? candles[i-1].close : c.close;
    const trueRange = Math.max(c.high-c.low, Math.abs(c.high-previousClose), Math.abs(c.low-previousClose));
    atr = atr === null ? trueRange : (atr * 13 + trueRange) / 14;
    fast = fast === null ? c.close : fast + 2/10 * (c.close-fast);
    slow = slow === null ? c.close : slow + 2/22 * (c.close-slow);
    if (i >= 4) {
      const j = i - 2, pivot = candles[j], neighbours = [candles[j-2],candles[j-1],candles[j+1],candles[j+2]];
      // Pivots may span an overnight gap between genuine cash bars. They still
      // become known only after the two following selected candles have closed.
      if (neighbours.every(b => pivot.high > b.high)) {
        activeHigh = { type:'high',price:pivot.high,time:pivot.time,confirmedAt:c.time+interval,broken:false };highs.push(activeHigh);
      }
      if (neighbours.every(b => pivot.low < b.low)) {
        activeLow = { type:'low',price:pivot.low,time:pivot.time,confirmedAt:c.time+interval,broken:false };lows.push(activeLow);
      }
      if (bias === null) { const trend=swingTrend(highs,lows);if(trend==='Haussière')bias='up';if(trend==='Baissière')bias='down'; }
    }
    const broken = activeHigh && !activeHigh.broken && c.close > activeHigh.price && previousClose <= activeHigh.price ? { pivot:activeHigh,direction:'up' }
      : activeLow && !activeLow.broken && c.close < activeLow.price && previousClose >= activeLow.price ? { pivot:activeLow,direction:'down' } : null;
    if (broken) {
      const range=c.high-c.low,body=Math.abs(c.close-c.open),bodyAligned=broken.direction==='up'?c.close>c.open:c.close<c.open;
      const impulse=i>=14&&previousAtr>0&&range>=previousAtr&&range>0&&body/range>=STRUCTURE_RULES.impulseBody&&bodyAligned;
      const reversal=bias!==null&&bias!==broken.direction;
      const kind = bias === null ? 'Rupture initiale' : reversal ? impulse ? 'MSS potentiel' : 'Rupture opposée' : 'BOS';
      events.push({time:c.time,closedAt:c.time+interval,direction:broken.direction,kind,level:broken.pivot.price,pivotTime:broken.pivot.time,pivotConfirmedAt:broken.pivot.confirmedAt,close:c.close,impulse,previousBias:bias});
      broken.pivot.broken=true;bias=broken.direction;
    }
  }
  const last=candles.at(-1), reference=candles.slice(-21,-1), volumeMean=reference.length===20?reference.reduce((n,c)=>n+c.volume,0)/20:null;
  const structure=swingTrend(highs,lows), momentum=candles.length<21?'Insuffisant':fast>slow?'Haussier':fast<slow?'Baissier':'Neutre';
  return { count:candles.length,first:candles[0].time,last:last.time,closedAt:last.time+interval,structure,momentum,bias,fast,slow,atr:candles.length>=14?atr:null,
    variationPct:(last.close/candles[0].open-1)*100,highs,lows,activeHigh,activeLow,events,
    patterns:candlePatterns(candles.at(-2),last,interval),volumeRatio:volumeMean>0?last.volume/volumeMean:null,
    insufficient:candles.length<20||highs.length<2||lows.length<2,ordersEnabled:false };
}

import { candlePatterns } from './structure-core.mjs';

export const DEFAULT_LAYERS = Object.freeze({ ema:true, pivots:false, bos:true, mss:true, breaks:false, engulfing:false, patterns:false, levels:true, rsi:false, volume:false, bands:false });

// Call only after analyzeCandles has validated this exact selected window.
// All rolling values start here; no earlier candles or future bars are read.
export function calculateIndicators(candles) {
  const output = { ema9:[], ema21:[], rsi:[], volume:[], middle:[], upper:[], lower:[] };
  let fast, slow, gain = 0, loss = 0;
  for (const [i,c] of candles.entries()) {
    fast = i ? fast + 2/10 * (c.close-fast) : c.close;
    slow = i ? slow + 2/22 * (c.close-slow) : c.close;
    output.ema9.push({time:c.time,value:fast});
    output.ema21.push({time:c.time,value:slow});
    output.volume.push({time:c.time,value:c.volume,color:c.close>=c.open?'#338a79':'#a45566'});
    if (i) {
      const change = c.close-candles[i-1].close, up = Math.max(0,change), down = Math.max(0,-change);
      if (i<=14) { gain+=up/14; loss+=down/14; }
      else { gain=(gain*13+up)/14; loss=(loss*13+down)/14; }
    }
    // Flat prices use an explicit neutral convention, 50; gains only = 100.
    output.rsi.push(i<14?{time:c.time}:{time:c.time,value:gain+loss===0?50:100*gain/(gain+loss)});
    if (i<19) {
      for (const key of ['middle','upper','lower']) output[key].push({time:c.time});
    } else {
      const closes=candles.slice(i-19,i+1).map(b=>b.close);
      const mean=closes.reduce((n,p)=>n+p,0)/20;
      const deviation=Math.sqrt(closes.reduce((n,p)=>n+(p-mean)**2,0)/20);
      output.middle.push({time:c.time,value:mean});
      output.upper.push({time:c.time,value:mean+2*deviation});
      output.lower.push({time:c.time,value:mean-2*deviation});
    }
  }
  return output;
}

export function chartMarkers(candles, result, interval, layers) {
  const markers=[];
  const add=(time,above,text,color)=>markers.push({time,position:above?'aboveBar':'belowBar',shape:'circle',color,text});
  for (const e of result.events) {
    const visible=e.kind==='MSS potentiel'?layers.mss:e.kind==='BOS'?layers.bos:layers.breaks;
    if(visible) add(e.time,e.direction==='down',e.kind==='MSS potentiel'?'MSS ?':e.kind==='BOS'?'BOS':e.kind==='Rupture initiale'?'Rupt. initiale':'Rupt. opposée',e.direction==='up'?'#34dfbc':'#fb8b9e');
  }
  if(layers.pivots) for(const [key,high] of [['highs',true],['lows',false]]) {
    result[key].forEach((p,i,all)=>{
      const delta=i?p.price-all[i-1].price:null;
      const label=delta===null?(high?'H':'L'):delta===0?(high?'H=':'L='):high?(delta>0?'HH':'LH'):(delta>0?'HL':'LL');
      // Place the label on the confirming bar, not retroactively on the pivot.
      add(p.confirmedAt-interval,high,label,high?'#81bfff':'#f0c078');
    });
  }
  if(layers.engulfing||layers.patterns) candles.forEach((c,i)=>{
    for(const pattern of candlePatterns(candles[i-1],c,interval)) {
      if(pattern.startsWith('Englobante')) {
        if(layers.engulfing) add(c.time,pattern.endsWith('baissière'),pattern.endsWith('haussière')?'Englob. ↑':'Englob. ↓','#e5c3ff');
      } else if(layers.patterns&&['Doji','Forme de marteau','Longue mèche haute'].includes(pattern)) {
        add(c.time,pattern!=='Forme de marteau',pattern==='Forme de marteau'?'Marteau':pattern==='Longue mèche haute'?'Mèche haute':'Doji','#eed599');
      }
    }
  });
  // One label per side per bar avoids overlapping markers when filters combine.
  const merged=new Map();
  for(const marker of markers.sort((a,b)=>a.time-b.time)) {
    const key=`${marker.time}:${marker.position}`, existing=merged.get(key);
    if(existing) {existing.text+=` · ${marker.text}`;existing.color='#e2e8f0';}
    else merged.set(key,{...marker});
  }
  return [...merged.values()];
}

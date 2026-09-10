import {sessionFor} from './session-comparison.mjs';
import {JEU44_POLICY as P} from './jeu44-policy.mjs';
const ensure=(ok,m)=>{if(!ok)throw Error(m);};

// All new features use this cash session only. No future bar prices, old
// contracts, full-session aggregates, daily close or post-trade statistics.
function closedSession(stream,day,time){
 if(!stream)return {status:'missing-session'};
 const bars=stream.candles.filter(b=>b.day===day&&b.time+P.candleSeconds<=time);
 if(!bars.length)return {status:'missing-session'};
 const local=sessionFor(time),start=time-(local.minute-P.cashOpenMinute)*60;
 if(bars.length!==(time-start)/P.candleSeconds)return {status:'incomplete-session'};
 const contract=bars[0].ticker;
 for(let i=0;i<bars.length;i++){
  const b=bars[i];
  ensure(b.time===start+i*P.candleSeconds&&b.minute===P.cashOpenMinute+i*5&&sessionFor(b.time).day===day,'Invalid chronological cash context');
  ensure(typeof contract==='string'&&contract.startsWith(stream.symbol)&&b.ticker===contract,'Mixed cash contracts');
  ensure([b.open,b.high,b.low,b.close].every(n=>Number.isFinite(n)&&n>0)&&b.high>=Math.max(b.open,b.close)&&b.low<=Math.min(b.open,b.close),'Invalid cash OHLC');
 }
 const last=bars.at(-1),open=bars[0].open;
 return {status:'ready',bars,contract,open,close:last.close,closedAt:last.time+300,return:last.close/open-1};
}

export function allVideoContexts44(streams){
 ensure(Array.isArray(streams)&&new Set(streams.map(s=>s.symbol)).size===streams.length,'Duplicate video streams');
 const bySymbol=new Map(streams.map(s=>[s.symbol,s])),out=new Map();
 for(const stream of streams){
  const values=new Map(),peerSymbol=P.peerSymbols[stream.symbol];
  ensure(Array.isArray(stream.candles)&&stream.signals instanceof Map,'Invalid video stream');
  for(const [time,signal]of stream.signals){
   ensure(Number.isSafeInteger(time)&&time%300===0&&signal.signalClose===time&&signal.signalOpen===time-300&&sessionFor(time).day===signal.day,'Invalid video signal clock');
   if(!peerSymbol){values.set(time,{symbol:stream.symbol,time,day:signal.day,status:'not-applicable'});continue;}
   ensure(signal.pattern==='orb-retest'&&Number.isSafeInteger(signal.breakoutAt)&&signal.rangeClosedAt<=signal.breakoutAt&&signal.breakoutAt<=signal.signalOpen,'Invalid video breakout anchor');
   const own=closedSession(stream,signal.day,time),peer=closedSession(bySymbol.get(peerSymbol),signal.day,time);
   const detail={symbol:stream.symbol,time,day:signal.day,status:own.status,contract:own.contract??null,closedAt:own.closedAt??null,
    ownReturn:own.return??null,signalClose:own.close??null,peerSymbol,peerStatus:peer.status,peerContract:peer.contract??null,
    peerClosedAt:peer.closedAt??null,peerReturn:peer.return??null,relativeReturn:null,
    avwapStatus:own.status,avwap:null,anchorOpen:signal.breakoutAt-300,anchorBars:0,anchorVolume:null};
   if(own.status==='ready'&&peer.status==='ready'){
    ensure(own.closedAt===time&&peer.closedAt===time,'Asynchronous peer context');detail.relativeReturn=own.return-peer.return;
   }
   if(own.status==='ready'){
    const anchored=own.bars.filter(b=>b.time>=detail.anchorOpen);detail.anchorBars=anchored.length;
    if(anchored.length<P.minimumAnchorBars||anchored[0].time!==detail.anchorOpen)detail.avwapStatus='missing-anchor-bars';
    else if(anchored.some(b=>!Number.isFinite(b.volume)||b.volume<0))detail.avwapStatus='missing-anchor-volume';
    else{
     const volume=anchored.reduce((s,b)=>s+b.volume,0);detail.anchorVolume=volume;
     if(volume===0)detail.avwapStatus='zero-anchor-volume';
     else{detail.avwap=anchored.reduce((s,b)=>s+((b.high+b.low+b.close)/3)*b.volume,0)/volume;detail.avwapStatus='ready';}
    }
   }
   values.set(time,detail);
  }
  out.set(stream.symbol,values);
 }
 return out;
}

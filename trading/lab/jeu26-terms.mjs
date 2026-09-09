import {JEU26_POLICY as P,JEU26_PRODUCTS,JEU26_SCENARIOS} from './jeu26-policy.mjs';
import {JEU23_SCENARIOS} from './jeu23-policy.mjs';
import {RULES} from './validation-engine.mjs';
const cents=n=>Math.round(n*100)/100;
export function failedRiskProfile(scenario){
  const s=JEU26_SCENARIOS.find(s=>s.id===scenario.id);
  if(!s||scenario.guarded!==true||scenario.riskPerTrade!==s.riskPerTrade||scenario.dailyLoss!==s.dailyLoss)throw new Error('Invalid risk profile');
  return JEU23_SCENARIOS.find(s=>s.riskPerTrade===150);
}
export function failedBreakoutTerms(signal,entry,entryTime,product,costFactor=1){
  const validProduct=JEU26_PRODUCTS.some(p=>p.symbol===product.symbol&&p.tick===product.tick&&p.multiplier===product.multiplier&&p.fees===product.fees);
  const price=n=>Number.isFinite(n)&&n>0&&Math.abs(n/product.tick-Math.round(n/product.tick))<1e-7;
  if(!validProduct||![1,2].includes(costFactor)||![entry,signal.stopPrice,signal.excursionExtreme,signal.rangeHigh,signal.rangeLow].every(price)||!['Long','Short'].includes(signal.side)||signal.pattern!=='orb-failure'||signal.signalClose!==entryTime||![signal.rangeClosedAt,signal.breakoutAt,signal.signalOpen,signal.signalClose].every(Number.isFinite)||signal.rangeClosedAt>signal.breakoutAt||signal.breakoutAt>signal.signalOpen||signal.signalClose!==signal.signalOpen+300||signal.rangeHigh<=signal.rangeLow)throw new Error('Invalid failure entry');
  const sign=signal.side==='Long'?1:-1;
  if(Math.abs(signal.stopPrice-(signal.excursionExtreme-sign*product.tick))>1e-7||(sign===1?signal.excursionExtreme>=signal.rangeLow:signal.excursionExtreme<=signal.rangeHigh))throw new Error('Invalid excursion stop');
  if(entry<=signal.rangeLow||entry>=signal.rangeHigh)return {blocked:'outsideRange'};
  const ticks=Math.round(sign*(entry-signal.stopPrice)/product.tick);
  if(ticks<1)return {blocked:'invalidStop'};
  const opposite=sign===1?signal.rangeHigh:signal.rangeLow;
  const roomTicks=Math.round(sign*(opposite-entry)/product.tick);
  const targetTicks=Math.min(Math.floor(ticks*RULES.rr+1e-9),roomTicks);
  const risk=ticks*product.tick,targetDistance=targetTicks*product.tick,riskDollars=cents(risk*product.multiplier),costDollars=cents((product.fees+2*product.tick*product.multiplier)*costFactor);
  if(targetTicks<1||(targetDistance*product.multiplier-costDollars)/(riskDollars+costDollars)<P.minNetRewardRisk)return {blocked:'netReward'};
  return {terms:{risk,targetDistance,riskDollars,costDollars,costR:costDollars/riskDollars}};
}

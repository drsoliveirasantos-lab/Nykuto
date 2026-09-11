import {openingTerms} from './jeu22-engine.mjs';
import {failedBreakoutTerms} from './jeu26-terms.mjs';
import {JEU33_POLICY as P} from './jeu33-policy.mjs';
const cents=n=>Math.round(n*100)/100;
export function accountSizedTerms(signal,entry,time,product,factor,cap){
 if(![25,50,100,150].includes(cap)||![1,2].includes(factor))throw Error('Invalid research sizing');
 const original=(signal.pattern==='orb-failure'?failedBreakoutTerms:openingTerms)(signal,entry,time,product,factor);
 if(original.blocked&&original.blocked!=='netReward')return original;
 const sign=signal.side==='Long'?1:-1,ticks=Math.round(sign*(entry-signal.stopPrice)/product.tick);
 if(ticks<1)return {blocked:'invalidStop'};
 const risk=ticks*product.tick,unitRisk=cents(risk*product.multiplier),unitCost=cents((product.fees+2*product.tick*product.multiplier)*factor);
 const quantity=Math.min(P.maxMicroContracts,Math.floor((cap+1e-9)/(unitRisk+unitCost)));
 if(quantity<1)return {blocked:'tradeRisk'};
 const riskDollars=cents(unitRisk*quantity),costDollars=cents(unitCost*quantity);
 if((P.rr*riskDollars-costDollars)/(riskDollars+costDollars)<1)return {blocked:'netReward'};
 return {terms:{risk,targetDistance:P.rr*risk,riskDollars,costDollars,costR:costDollars/riskDollars,quantity,plannedRiskUSD:cents(riskDollars+costDollars)}};
}
export function accountRiskGate({balance,floor,dayStart,riskDollars,costDollars},p,cap){
 if(![balance,floor,dayStart,riskDollars,costDollars,cap].every(Number.isFinite)||riskDollars<=0||costDollars<0)throw Error('Invalid account risk');
 const loss=cents(riskDollars+costDollars);
 if(balance<=floor)return 'accountFloor';
 if(loss>cap)return 'tradeRisk';
 if(balance-loss<dayStart-p.dailyLoss)return 'dailyBudget';
 if(balance-loss<floor+P.floorReserve)return 'floorReserve';
 return null;
}

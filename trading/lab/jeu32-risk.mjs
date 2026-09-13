import {openingTerms} from './jeu22-engine.mjs';
import {failedBreakoutTerms} from './jeu26-terms.mjs';
import {JEU32_POLICY as P,variantFor} from './jeu32-policy.mjs';
const cents=n=>Math.round(n*100)/100;
export function sizedTerms(signal,entry,time,product,factor,variantId){
 const v=variantFor(variantId);if(!v.custom)throw Error('Custom sizing requires custom variant');
 // Reuse the frozen entry/stop validation. Only its old net-reward rejection
 // is recomputed because the candidate now has a fixed 2R target.
 const original=(signal.pattern==='orb-failure'?failedBreakoutTerms:openingTerms)(signal,entry,time,product,factor);
 if(original.blocked&&original.blocked!=='netReward')return original;
 const sign=signal.side==='Long'?1:-1,ticks=Math.round(sign*(entry-signal.stopPrice)/product.tick);
 if(ticks<1)return {blocked:'invalidStop'};
 const risk=ticks*product.tick,unitRisk=cents(risk*product.multiplier),unitCost=cents((product.fees+2*product.tick*product.multiplier)*factor);
 const quantity=Math.min(P.maxMicroContracts,Math.floor((v.riskPerTrade+1e-9)/(unitRisk+unitCost)));
 if(quantity<1)return {blocked:'tradeRisk'};
 const riskDollars=cents(unitRisk*quantity),costDollars=cents(unitCost*quantity),targetDistance=P.rr*risk;
 if((P.rr*riskDollars-costDollars)/(riskDollars+costDollars)<1)return {blocked:'netReward'};
 return {terms:{risk,targetDistance,riskDollars,costDollars,costR:costDollars/riskDollars,quantity,plannedRiskUSD:cents(riskDollars+costDollars)}};
}
export function sizedRiskGate({balance,floor,dayStart,riskDollars,costDollars,account},variantId){
 const p=variantFor(variantId);
 if(![balance,floor,dayStart,riskDollars,costDollars].every(Number.isFinite)||riskDollars<=0||costDollars<0||typeof account!=='boolean')throw Error('Invalid sized budget');
 const loss=cents(riskDollars+costDollars);
 if(loss>p.riskPerTrade)return 'tradeRisk';
 if(balance-loss<dayStart-p.dailyLoss)return 'dailyBudget';
 if(account&&balance-loss<floor+P.floorReserve)return 'floorReserve';
 return null;
}

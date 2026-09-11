import {contextDecision} from './jeu24-context.mjs';
import {openingTerms} from './jeu22-engine.mjs';
import {failedBreakoutTerms} from './jeu26-terms.mjs';
import {JEU37_POLICY as P,confidenceProfile} from './jeu37-policy.mjs';
const cents=n=>Math.round(n*100)/100;
export function confidenceGrade(signal,context){
 const {checks,missingContext}=contextDecision(signal,context),score=Object.values(checks).filter(Boolean).length;
 return {score,checks,missingContext,grade:missingContext||score<3?'low':score<5?'medium':'full'};
}
export function desiredRisk(symbol,grade,id){
 const p=confidenceProfile(id);
 if(!['MNQ','MES','MGC'].includes(symbol)||!['low','medium','full'].includes(grade.grade))throw Error('Invalid graded market');
 if(symbol==='MGC')return 100;
 return p.graded?p.caps[['low','medium','full'].indexOf(grade.grade)]:p.maxRisk;
}
// Account recovery is independent of the current signal's score. A low score
// never reduces the tier inherited by subsequent, stronger valid signals.
export function accountRiskTier(balance,floor,previous=1){
 if(![balance,floor].every(Number.isFinite)||![1,.5,.25].includes(previous))throw Error('Invalid risk tier');
 const room=cents(balance-floor),desired=room<500?.25:room<1000?.5:1;
 return desired<=previous||balance>=50000?desired:previous;
}
export function confidenceSizedTerms(signal,entry,time,product,factor,cap){
 if(!Number.isFinite(cap)||cap<=0||cap>500||![1,2].includes(factor))throw Error('Invalid confidence cap');
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
export function confidenceRiskGate({balance,floor,dayStart,riskDollars,costDollars},policy,cap){
 if(![balance,floor,dayStart,riskDollars,costDollars,cap].every(Number.isFinite)||riskDollars<=0||costDollars<0||cap<=0||cap>500||![200,500,1000].includes(policy.dailyLoss))throw Error('Invalid confidence account budget');
 const loss=cents(riskDollars+costDollars);
 if(balance<=floor)return 'accountFloor';
 if(loss>cap)return 'tradeRisk';
 if(balance-loss<dayStart-policy.dailyLoss)return 'dailyBudget';
 if(balance-loss<floor+P.floorReserve)return 'floorReserve';
 return null;
}

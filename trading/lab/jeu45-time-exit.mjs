import {JEU45_POLICY as P} from './jeu45-policy.mjs';
const cents=n=>Math.round(n*100)/100;
// Called only after the completed bar survived the original stop/target checks.
export function timeExitDecision45(position,bar,product,targetSymbol){
 if(position.symbol!==targetSymbol)return null;
 if(bar.time+300!==position.entryTime+P.timeExitMinutes*60)return null;
 if(!Number.isFinite(bar.close)||bar.close<=0||bar.day!==position.day)throw Error('Invalid closed time-exit bar');
 const sign=position.side==='Long'?1:-1;
 const estimatedNet=cents(sign*(bar.close-position.entry)*product.multiplier*position.quantity-position.costDollars);
 return estimatedNet<=0?{timeExitDecisionAt:bar.time+300,timeExitAt:bar.time+300,timeExitEstimatedNet:estimatedNet}:null;
}

import {JEU34_POLICY as P} from './jeu34-policy.mjs';
const cents=n=>Math.round(n*100)/100,down=n=>Math.floor(n*100+1e-8)/100;
export function personalTarget(usdPerEUR=P.usdPerEUR,feeEUR=P.transferAndFxFeesEUR){
 if(!Number.isFinite(usdPerEUR)||usdPerEUR<=0||!Number.isFinite(feeEUR)||feeEUR<0)throw Error('Invalid conversion');
 const requestUSD=Math.ceil((P.personalGoalEUR+feeEUR)*usdPerEUR/P.traderShare*100-1e-8)/100;
 return {goalEUR:P.personalGoalEUR,usdPerEUR,feeEUR,requestUSD,requiredProfitUSD:cents(requestUSD/P.profitFraction),withinRequestCap:requestUSD<=P.maximumRequestUSD};
}
export function payoutEligibility({balance,initial=50000,qualifyingDays,mode='funded',breached=false},usdPerEUR=P.usdPerEUR,feeEUR=P.transferAndFxFeesEUR){
 if(!Number.isFinite(balance)||!Number.isFinite(initial)||initial!==50000||!Number.isInteger(qualifyingDays)||qualifyingDays<0||!['evaluation','funded'].includes(mode))throw Error('Invalid payout state');
 const target=personalTarget(usdPerEUR,feeEUR),profit=cents(balance-initial),lockedFloor=initial+100;
 // The reserve is an internal test constraint, not a mandatory Lucid buffer.
 const available=down(Math.max(0,Math.min(P.maximumRequestUSD,profit*P.profitFraction,balance-lockedFloor-P.floorReserve)));
 let reason=null;
 if(mode==='evaluation')reason='evaluation-not-withdrawable';
 else if(breached)reason='account-breached';
 else if(qualifyingDays<P.qualifyingDays)reason='qualifying-days';
 else if(profit<=0)reason='nonpositive-cycle';
 else if(available<P.minimumRequestUSD)reason='minimum-request';
 const maxRequestUSD=reason?0:available,maxReceiptEUR=Math.max(0,down(maxRequestUSD*P.traderShare/usdPerEUR-feeEUR));
 const goalEligible=!reason&&target.withinRequestCap&&maxRequestUSD>=target.requestUSD;
 return {...target,profit,qualifyingDays,remainingQualifyingDays:Math.max(0,P.qualifyingDays-qualifyingDays),remainingProfitUSD:Math.max(0,cents(target.requiredProfitUSD-profit)),reason,maxRequestUSD,maxReceiptEUR,goalEligible,lockedFloor,
  goalReceiptEUR:goalEligible?down(target.requestUSD*P.traderShare/usdPerEUR-feeEUR):0,
  goalBalanceAfter:goalEligible?cents(balance-target.requestUSD):null,
  goalHeadroomAfter:goalEligible?cents(balance-target.requestUSD-lockedFloor):null};
}

import {combinedContexts,contextDecision} from './jeu24-context.mjs';
import {JEU25_POLICY as P,JEU25_SCENARIOS} from './jeu25-policy.mjs';
const cents=n=>Math.round(n*100)/100;
export function gradedProfile(scenario){
  const p=JEU25_SCENARIOS.find(p=>p.id===scenario.id);
  if(!p||scenario.guarded!==true||scenario.riskPerTrade!==p.riskPerTrade||scenario.dailyLoss!==p.dailyLoss)throw new Error('Invalid graded profile');
  return p;
}
export function gradeContext(signal,context){
  const decision=contextDecision(signal,context),score=Object.values(decision.checks).filter(Boolean).length;
  const cap=decision.missingContext?P.missingContextRisk:score===P.fullScore?150:score>=P.minimumMediumScore?75:50;
  return {score,cap,missingContext:decision.missingContext,checks:decision.checks};
}
export function gradeSignals(candles,signals,product){
  const contexts=combinedContexts(candles,product),grades=new Map();
  for(const [time,s]of signals){
    if(time!==s.signalClose)throw new Error('Invalid grade signal key');
    grades.set(time,{day:s.day,side:s.side,...gradeContext(s,contexts.get(time))});
  }
  return {contexts,grades};
}
export function gradedRiskGate({balance,floor,dayStart,riskDollars,costDollars,account},cap,scenario){
  const p=gradedProfile(scenario);
  if(!P.riskCaps.includes(cap)||![balance,floor,dayStart,riskDollars,costDollars].every(Number.isFinite)||riskDollars<=0||costDollars<0)throw new Error('Invalid graded risk budget');
  const loss=cents(riskDollars+costDollars);
  if(loss>cap)return 'tradeRisk';
  if(balance-loss<dayStart-p.dailyLoss)return 'dailyBudget';
  if(account&&balance-loss<floor+P.floorReserve)return 'floorReserve';
  return null;
}

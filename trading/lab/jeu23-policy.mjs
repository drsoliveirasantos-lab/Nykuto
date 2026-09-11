import { JEU22_POLICY, JEU22_PRODUCTS } from './jeu22-policy.mjs';
export const JEU23_POLICY = Object.freeze({...JEU22_POLICY,version:'jeu23-admission-risk-v1',priorAttempts:17,maxSignalsPerSide:null,maxTradesPerSide:1,consumeOn:'executed-entry',riskCaps:Object.freeze([50,75,100,150]),dailyRiskMultiple:2,floorReserve:100,riskAuthorized:true});
export const JEU23_PRODUCTS = JEU22_PRODUCTS;
export const JEU23_SCENARIOS = Object.freeze(JEU23_POLICY.riskCaps.map(riskPerTrade=>Object.freeze({id:'admission-risk'+riskPerTrade,label:'Retour admissible · risque '+riskPerTrade+' $',guarded:true,riskPerTrade,dailyLoss:riskPerTrade*2})));

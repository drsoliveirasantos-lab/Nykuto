import {JEU24_POLICY,JEU24_PRODUCTS} from './jeu24-policy.mjs';
export const JEU25_POLICY=Object.freeze({...JEU24_POLICY,version:'jeu25-graded-risk-v1',priorAttempts:49,riskCaps:Object.freeze([50,75,150]),dailyLoss:300,dailyRiskMultiple:null,minimumMediumScore:3,fullScore:5,riskMode:'context-admission-cap',missingContextRisk:50});
export const JEU25_PRODUCTS=JEU24_PRODUCTS;
export const JEU25_SCENARIOS=Object.freeze([Object.freeze({id:'graded-50-75-150',label:'Risque gradué · 50 / 75 / 150 $',guarded:true,riskPerTrade:150,dailyLoss:300})]);

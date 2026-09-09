import {JEU23_POLICY,JEU23_PRODUCTS} from './jeu23-policy.mjs';
export const JEU26_POLICY=Object.freeze({...JEU23_POLICY,version:'jeu26-failed-breakout-v1',priorAttempts:53,riskPerTrade:150,riskCaps:Object.freeze([150]),dailyLoss:300,riskMode:'fixed-admission-cap',failureBars:6,targetMode:'nearer-1.5R-or-opposite-range',quantity:1});
export const JEU26_PRODUCTS=JEU23_PRODUCTS;
export const JEU26_SCENARIOS=Object.freeze([Object.freeze({id:'failed-breakout150',label:'Cassure échouée · plafond 150 $',guarded:true,riskPerTrade:150,dailyLoss:300})]);

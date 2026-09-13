import {JEU29_POLICY,JEU29_PRODUCTS,JEU29_PROFILES,JEU29_RISK} from './jeu29-policy.mjs';
export {JEU29_PRODUCTS,JEU29_PROFILES,JEU29_RISK};
export const JEU32_POLICY=Object.freeze({...JEU29_POLICY,version:'jeu32-trend-sizing-v1',from:'2026-06-01',end:'2026-09-01',warmupFrom:'2026-05-01',priorAttempts:70,newConfigurations:4,emaFast:9,emaSlow:21,hourAnchorMinute:570,weeklyTarget:1000,maxMicroContracts:20,rr:2,researchOnly:true,independent:false,confirmed:false,executionAllowed:false});
export const JEU32_VARIANTS=Object.freeze([
 {id:'reference31',label:'Référence Jeu 31',aligned:false,riskPerTrade:150,dailyLoss:300,custom:false},
 {id:'rr2-150',label:'1:2 · risque 150 $',aligned:false,riskPerTrade:150,dailyLoss:300,custom:true},
 {id:'aligned-150',label:'M5/H1 · 1:2 · risque 150 $',aligned:true,riskPerTrade:150,dailyLoss:300,custom:true},
 {id:'rr2-500',label:'1:2 · risque 500 $',aligned:false,riskPerTrade:500,dailyLoss:1000,custom:true},
 {id:'aligned-500',label:'M5/H1 · 1:2 · risque 500 $',aligned:true,riskPerTrade:500,dailyLoss:1000,custom:true}
].map(Object.freeze));
export function variantFor(id){const v=JEU32_VARIANTS.find(x=>x.id===id);if(!v)throw Error('Unknown Game32 variant');return v;}

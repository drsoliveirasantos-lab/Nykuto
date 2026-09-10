import {JEU34_POLICY} from './jeu34-policy.mjs';
export const JEU37_POLICY=Object.freeze({...JEU34_POLICY,version:'jeu37-confidence-risk-v1',excluded:'MYM',monthlyProfitTargetUSD:4000,mode:'funded',maxPersonalPayouts:1,continueAfterPersonalGoal:true,brokerDailyLimitMode:'not-modeled-account-option-unknown',maxMicroContracts:20,independent:false,confirmed:false,executionAllowed:false});
export const JEU37_VARIANTS=Object.freeze([
 {id:'control',label:'Ancien témoin 100 $',control:true,maxRisk:100,dailyLoss:200,graded:false},
 {id:'fixed100',label:'Référence 100 $',maxRisk:100,dailyLoss:200,graded:false},
 {id:'fixed250',label:'Indices : fixe 250 $',maxRisk:250,dailyLoss:500,graded:false},
 {id:'graded250',label:'Indices : 50 / 150 / 250 $',maxRisk:250,dailyLoss:500,graded:true,caps:Object.freeze([50,150,250]),comparator:'fixed250'},
 {id:'fixed500',label:'Indices : fixe 500 $',maxRisk:500,dailyLoss:1000,graded:false},
 {id:'graded500',label:'Indices : 100 / 250 / 500 $',maxRisk:500,dailyLoss:1000,graded:true,caps:Object.freeze([100,250,500]),comparator:'fixed500'}
].map(Object.freeze));
export function confidenceProfile(id){const p=JEU37_VARIANTS.find(v=>v.id===id);if(!p)throw Error('Unknown confidence risk profile');return p;}

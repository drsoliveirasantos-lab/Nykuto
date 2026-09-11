// Evaluation research only; no account purchase, broker transport or activation.
export const ACCOUNT_PROFILES = Object.freeze([
  {id:'25k-fixed100',initial:25000,maxLoss:1000,profitTarget:1250,dynamic:false,riskPerTrade:100,dailyLoss:200},
  {id:'25k-reduced100',initial:25000,maxLoss:1000,profitTarget:1250,dynamic:true,riskPerTrade:100,dailyLoss:200},
  {id:'50k-fixed100',initial:50000,maxLoss:2000,profitTarget:3000,dynamic:false,riskPerTrade:100,dailyLoss:200},
  {id:'50k-reduced100',initial:50000,maxLoss:2000,profitTarget:3000,dynamic:true,riskPerTrade:100,dailyLoss:200},
  {id:'control25-150',initial:25000,maxLoss:1000,profitTarget:1250,dynamic:false,riskPerTrade:150,dailyLoss:300,control:true}
].map(p=>Object.freeze({...p,lockedFloor:p.initial+100,consistency:.5})));
export const JEU33_POLICY=Object.freeze({version:'jeu33-account-sizing-v1',from:'2026-06-01',end:'2026-09-01',warmupFrom:'2026-05-01',floorReserve:100,maxMicroContracts:20,maxTradesPerDay:2,maxPositions:1,rr:2,exitBeforeClose:15,consistencyMode:'strict-50-conservative-no-unspecified-cushion',researchOnly:true,executionAllowed:false});
export const MARKET_PROFILES=Object.freeze([
 {symbol:'MES',name:'Micro S&P 500',entry:'opening-retest',filter:'RSI Wilder 14 : refuser achat >70, vente <30'},
 {symbol:'MGC',name:'Micro or',entry:'failed-opening-breakout',filter:'Nouvelle entrée strictement avant 11 h New York'},
 {symbol:'MNQ',name:'Micro Nasdaq',entry:'opening-retest',filter:'Conserver la tendance causale du signal ; aucun nouvel alignement H1'},
 {symbol:'MYM',name:'Micro Dow Jones',entry:'opening-retest',filter:'Conserver la tendance causale du signal ; aucun nouveau filtre'}
].map(p=>Object.freeze({...p,stop:'structural-fixed',targetR:2,executionAllowed:false,qualified:false})));
export function accountProfile(id){const p=ACCOUNT_PROFILES.find(p=>p.id===id);if(!p)throw Error('Unknown account profile');return p;}
export function accountFloor(previous,balance,p){
 if(![previous,balance].every(Number.isFinite))throw Error('Invalid balance');
 return Math.round(Math.max(previous,Math.min(p.lockedFloor,balance-p.maxLoss))*100)/100;
}
export function riskCap(balance,floor,previous,p){
 if(![balance,floor,previous].every(Number.isFinite)||previous<=0)throw Error('Invalid risk state');
 if(!p.dynamic)return p.riskPerTrade;
 const headroom=Math.round((balance-floor)*100)/100;
 const desired=headroom<500?25:headroom<1000?50:100;
 // Reductions are immediate. A recovery requires both capital recovery and headroom.
 return desired<=previous||balance>=p.initial?desired:previous;
}
export function consistencyStatus(bestDay,profit,p){
 if(![bestDay,profit].every(Number.isFinite)||bestDay<0)throw Error('Invalid consistency inputs');
 const requiredProfit=Math.max(p.profitTarget,Math.round(bestDay/p.consistency*100)/100);
 return {ratio:profit>0?bestDay/profit:null,requiredProfit,remaining:Math.max(0,Math.round((requiredProfit-profit)*100)/100),
   passed:profit>=p.profitTarget&&bestDay<=profit*p.consistency+1e-9,model:'strict-50-conservative',cushionModeled:false};
}

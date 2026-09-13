import {JEU33_POLICY} from './jeu33-policy.mjs';
export const JEU34_POLICY=Object.freeze({...JEU33_POLICY,version:'jeu34-monthly-withdrawal-v1',reset:'new-account-each-month',account:'50k-reduced100',personalGoalEUR:1000,usdPerEUR:1.1652,fxDate:'2026-09-09',fxMode:'fixed-reference-for-comparison-not-historical-conversion',traderShare:.9,minimumRequestUSD:500,maximumRequestUSD:2000,profitFraction:.5,qualifyingDays:5,qualifyingDayUSD:150,transferAndFxFeesEUR:0,taxesModeled:false,maxMicroContracts:20});
export const JEU34_VARIANTS=Object.freeze([
 {id:'four-markets',label:'Quatre marchés · référence',excluded:null},
 {id:'without-mym',label:'MNQ, MES et MGC · sans MYM',excluded:'MYM'}
].map(Object.freeze));
export const JEU34_MONTHS=Object.freeze([
 {id:'june',label:'Juin',start:'2026-06-01',end:'2026-07-01'},
 {id:'july',label:'Juillet',start:'2026-07-01',end:'2026-08-01'},
 {id:'august',label:'Août',start:'2026-08-01',end:'2026-09-01'}
].map(Object.freeze));

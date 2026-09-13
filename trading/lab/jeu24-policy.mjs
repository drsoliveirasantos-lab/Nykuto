import {JEU23_POLICY,JEU23_PRODUCTS,JEU23_SCENARIOS} from './jeu23-policy.mjs';
export const JEU24_POLICY=Object.freeze({...JEU23_POLICY,version:'jeu24-combined-context-v1',priorAttempts:33,emaFast:9,emaSlow:21,rsiPeriod:14,pivotLeft:2,pivotRight:2,volumeSessions:5,volumeRatio:1,confirmationWindows:Object.freeze(['2026-10/2026-11','2026-12/2027-01','2027-02/2027-03'])});
export const JEU24_PRODUCTS=JEU23_PRODUCTS;
export const JEU24_SCENARIOS=Object.freeze(JEU23_SCENARIOS.map(s=>Object.freeze({...s,id:s.id.replace('admission-','confluence-'),label:'Contexte + bougie + volume · '+s.riskPerTrade+' $'})));
export const CONFLUENCE_CHECKS=Object.freeze(['trend','structure','momentum','volume','pattern']);

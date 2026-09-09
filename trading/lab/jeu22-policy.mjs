import { JEU19_POLICY, JEU19_PRODUCTS } from './jeu19-policy.mjs';
export const JEU22_POLICY = Object.freeze({...JEU19_POLICY,version:'jeu22-opening-retest-v1',priorAttempts:13,openingMinutes:30,latestEntryMinute:720,retestBars:6,maxSignalsPerSide:1,structuralStop:true});
export const JEU22_PRODUCTS = JEU19_PRODUCTS;
export const JEU22_SCENARIOS = Object.freeze([Object.freeze({id:'orb-retest',label:'Cassure et retour sur la zone d’ouverture',guarded:true})]);

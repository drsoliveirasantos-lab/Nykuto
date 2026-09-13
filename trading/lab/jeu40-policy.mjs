export const JEU40_POLICY=Object.freeze({
 version:'jeu40-eight-month-v1',from:'2026-01-01',end:'2026-09-01',
 variant:'fixed100',mode:'funded',accountInitialUSD:50000,riskMaximumUSD:100,
 dailyLossUSD:200,targetR:2,reset:'new-account-each-month',
 expectedSessions:166,availableCommonSessions:164,executionCount:16,
 missingSessionPolicy:'exclude-entire-common-session-carry-account-no-assumed-pnl',
 winterPreparation:'available-complete-sessions-from-2026-01-01-no-december',
 summerPreparation:'exact-game37-may-warmup-june-july-historical-august',
 independent:false,confirmed:false,selection:null,executionAllowed:false
});
const names=[['january','Janvier',20,20],['february','Février',19,18],['march','Mars',22,21],['april','Avril',21,21],['may','Mai',20,20],['june','Juin',21,21],['july','Juillet',22,22],['august','Août',21,21]];
export const JEU40_MONTHS=Object.freeze(names.map(([id,label,expected,available],i)=>Object.freeze({id,label,start:`2026-${String(i+1).padStart(2,'0')}-01`,end:`2026-${String(i+2).padStart(2,'0')}-01`,expected,available})));
export const JEU40_VARIANTS=Object.freeze([Object.freeze({id:'fixed100',label:'Référence 100 $ · janvier–août'})]);
export const JEU40_MISSING=Object.freeze([
 Object.freeze({day:'2026-02-25',symbols:Object.freeze(['MGC'])}),
 Object.freeze({day:'2026-03-06',symbols:Object.freeze(['MES','MGC','MNQ'])})
]);

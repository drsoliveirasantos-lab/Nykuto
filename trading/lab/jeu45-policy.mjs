import {JEU40_POLICY} from './jeu40-policy.mjs';
export const JEU45_POLICY=Object.freeze({
 ...JEU40_POLICY,version:'jeu45-sessions-time-exit-v1',variant:null,reference:'jeu40-fixed100',
 londonTimeZone:'Europe/London',newYorkTimeZone:'America/New_York',
 londonOpenMinute:480,londonCloseMinuteExclusive:990,
 londonCalendar:'conventional-cash-session-with-england-wales-bank-holidays',
 londonClosedDates:Object.freeze(['2026-01-01','2026-04-03','2026-04-06','2026-05-04','2026-05-25','2026-08-31']),
 entryWindow:'unchanged-10:10-to-12:00-New-York-MGC-before-11:00',
 sessionScope:'existing-US-morning-signals-only-no-Asian-or-European-opening-prices',
 outsideLondonIncludes:'post-16:30-London-and-London-bank-holidays-labelled-separately',
 timeExitMinutes:30,timeExitCheck:'exactly-six-closed-M5-bars-after-entry-once',
 timeExitCondition:'estimated-net-at-closed-price-less-than-or-equal-to-zero',
 timeExitFill:'next-open-after-decision-existing-gap-risk-and-target-priority',
 timeExitCosts:'same-round-trip-costs-including-existing-slippage-factor',
 intrabarPolicy:'existing-stop-first-no-same-slot-readmission',
 newConfigurations:6,executionCount:112,exactControls:16,
 accountPrefixes:2296,filterPrefixes:2296,contextPrefixes:2296,
 parameterSearch:false,combinedVariants:false,modelInferences:0,
 criterion:'all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement-and-higher-aggregate-mean-trade-at-both-costs',
 selection:null,independent:false,confirmed:false,executionAllowed:false
});
export const JEU45_VARIANTS=Object.freeze([
 Object.freeze({id:'baseline',targetSymbol:null,mechanism:null,label:'Référence Jeu40'}),
 ...['london-overlap','outside-london','time-exit30'].flatMap(mechanism=>['MNQ','MES'].map(targetSymbol=>Object.freeze({id:targetSymbol.toLowerCase()+'-'+mechanism,targetSymbol,mechanism,label:targetSymbol+' · '+mechanism})))
]);
export function variant45(id){const v=JEU45_VARIANTS.find(v=>v.id===id);if(!v)throw Error('Unknown Game45 variant');return v;}

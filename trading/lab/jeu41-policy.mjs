import {JEU40_POLICY} from './jeu40-policy.mjs';
import {JEU37_POLICY,confidenceProfile} from './jeu37-policy.mjs';
const reference=confidenceProfile('fixed100');

export const JEU41_POLICY=Object.freeze({
 ...JEU40_POLICY,version:'jeu41-mes-net-reward-v1',variant:null,
 reference:'jeu40-fixed100',market:'MES',targetSymbol:'MES',minimumNetRewardRisk:1.5,
 minimumUnitRiskCostMultiple:5,targetR:JEU37_POLICY.rr,
 riskMaximumUSD:reference.maxRisk,dailyLossUSD:reference.dailyLoss,
 entryData:'next-open-and-closed-signal-only',
 executionCount:32,exactControls:16,newConfigurations:1,
 accountPrefixes:656,filterPrefixes:656,contextPrefixes:656,
 criterion:'net-and-realized-drawdown-nondegradation-in-all-16-cells-plus-strict-net-improvement-in-at-least-one',
 independent:false,confirmed:false,selection:null,executionAllowed:false
});
export const JEU41_VARIANTS=Object.freeze([
 Object.freeze({id:'baseline',label:'Référence Jeu 40 · 100 $',minimumNetRewardRisk:1}),
 Object.freeze({id:'mes-net15',label:'MES · ratio net au moins 1,5',minimumNetRewardRisk:JEU41_POLICY.minimumNetRewardRisk})
]);

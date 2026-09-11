import {JEU40_POLICY} from './jeu40-policy.mjs';
import {JEU37_POLICY,confidenceProfile} from './jeu37-policy.mjs';
import {JEU24_POLICY} from './jeu24-policy.mjs';
const reference=confidenceProfile('fixed100');
export const JEU42_POLICY=Object.freeze({
 ...JEU40_POLICY,version:'jeu42-mes-pullback-volume-v1',variant:null,
 reference:'jeu40-fixed100',market:'MES',targetSymbol:'MES',
 referenceVolumeSessions:JEU24_POLICY.volumeSessions,relativeVolumeScale:1000000,
 pullbackSelection:'strictly-counterdirectional-bars-after-breakout-before-confirmation',
 veto:'mean-rounded-pullback-relative-volume-greater-than-or-equal-to-rounded-breakout-relative-volume',
 missingVolumeAction:'keep-reference-and-label-unobservable',confirmationVolume:'diagnostic-only',
 targetR:JEU37_POLICY.rr,riskMaximumUSD:reference.maxRisk,dailyLossUSD:reference.dailyLoss,
 entryData:'next-open-and-closed-bars-only',executionCount:32,exactControls:16,newConfigurations:1,
 accountPrefixes:656,filterPrefixes:656,contextPrefixes:656,
 criterion:'net-and-realized-drawdown-nondegradation-in-all-16-cells-plus-strict-net-improvement-in-at-least-one',
 independent:false,confirmed:false,selection:null,executionAllowed:false
});
export const JEU42_VARIANTS=Object.freeze([
 Object.freeze({id:'baseline',label:'Référence Jeu 40 · 100 $'}),
 Object.freeze({id:'mes-pullback-volume',label:'MES · activité du retour inférieure à la cassure'})
]);

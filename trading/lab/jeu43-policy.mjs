import {JEU40_POLICY} from './jeu40-policy.mjs';
export const JEU43_POLICY=Object.freeze({
 ...JEU40_POLICY,version:'jeu43-normalized-entry-v1',variant:null,reference:'jeu40-fixed100',
 contextBars:64,intervalSeconds:900,epsilon:1e-5,standardDeviation:'population',maximumExtensionZ:1,
 normalization:'closed-window-column-mean-and-standard-deviation',
 entryDistance:'side-signed-entry-open-minus-original-range-boundary',
 equality:'allowed',missingContext:'keep-reference-and-label-unobservable',
 warmup:'cash-bars-from-january-reset-at-native-roll-or-missing-session',
 executionCount:48,exactControls:16,newConfigurations:2,
 accountPrefixes:984,filterPrefixes:984,contextPrefixes:984,normalizationPrefixes:984,
 criterion:'each-candidate-all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement',
 inferredProbabilities:false,modelInferences:0,newsBacktest:false,
 independent:false,confirmed:false,selection:null,executionAllowed:false
});
export const JEU43_VARIANTS=Object.freeze([
 Object.freeze({id:'baseline',targetSymbol:null,label:'Référence Jeu40'}),
 Object.freeze({id:'mnq-normalized-entry',targetSymbol:'MNQ',label:'MNQ · extension normalisée'}),
 Object.freeze({id:'mes-normalized-entry',targetSymbol:'MES',label:'MES · extension normalisée'})
]);

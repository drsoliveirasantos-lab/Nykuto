import {JEU40_POLICY} from './jeu40-policy.mjs';
export const JEU44_POLICY=Object.freeze({
 ...JEU40_POLICY,version:'jeu44-video-context-v1',variant:null,reference:'jeu40-fixed100',
 cashOpenMinute:570,candleSeconds:300,decisionClock:'closed-signal-at-next-open',
 peerSymbols:Object.freeze({MNQ:'MES',MES:'MNQ'}),
 returnDefinition:'last-closed-price-divided-by-own-cash-open-minus-one',
 peerDirectionVeto:'side-signed-peer-return-below-zero',
 relativeStrengthVeto:'side-signed-own-return-minus-peer-return-below-zero',
 avwapAnchor:'original-breakout-bar-open',avwapPrice:'hlc3',
 avwapVeto:'side-signed-signal-close-minus-anchored-vwap-below-zero',
 equality:'allowed',missingContext:'keep-reference-and-label-unobservable',
 minimumAnchorBars:2,parameterSearch:false,combinedVariants:false,
 executionCount:112,exactControls:16,newConfigurations:6,
 accountPrefixes:2296,filterPrefixes:2296,contextPrefixes:2296,videoContextPrefixes:2296,
 criterion:'each-candidate-all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement',
 videoSources:20,sourcePerformanceVerified:false,modelInferences:0,
 independent:false,confirmed:false,selection:null,executionAllowed:false
});
export const JEU44_VARIANTS=Object.freeze([
 Object.freeze({id:'baseline',targetSymbol:null,mechanism:null,label:'Référence Jeu40'}),
 ...['peer-direction','relative-strength','breakout-avwap'].flatMap(mechanism=>['MNQ','MES'].map(targetSymbol=>Object.freeze({
  id:targetSymbol.toLowerCase()+'-'+mechanism,targetSymbol,mechanism,label:targetSymbol+' · '+mechanism
 })))
]);

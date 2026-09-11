import {JEU41_POLICY as P} from './jeu41-policy.mjs';
import {JEU37_POLICY,confidenceProfile} from './jeu37-policy.mjs';
export function policy41Table(){
 const v=confidenceProfile('fixed100');
 if(P.targetR!==JEU37_POLICY.rr||P.riskMaximumUSD!==v.maxRisk||P.dailyLossUSD!==v.dailyLoss)throw Error('Game41 declared policy differs from execution');
 return ['| Paramètre | Valeur figée |','| --- | --- |',
 ['Début inclus',P.from],['Fin exclue',P.end],['Marché du nouveau veto',P.market],['Minimum gain net / perte prévue',P.minimumNetRewardRisk],['Risque de prix minimal / coûts',P.minimumUnitRiskCostMultiple],['Cible brute R',P.targetR],['Risque maximal USD',P.riskMaximumUSD],['Limite journalière USD',P.dailyLossUSD],['Compte initial USD',P.accountInitialUSD],['Réinitialisation',P.reset],['Séances attendues',P.expectedSessions],['Séances disponibles',P.availableCommonSessions],['Relectures',P.executionCount],['Témoins exacts',P.exactControls],['Préfixes compte / filtre / contexte',`${P.accountPrefixes} / ${P.filterPrefixes} / ${P.contextPrefixes}`],['Nouvelle configuration',P.newConfigurations],['Activation autorisée',P.executionAllowed]
 ].map(row=>Array.isArray(row)?`| ${row[0]} | ${row[1]} |`:row).join('\n');
}
export function verifyPolicy41Protocol(protocol){
 const match=protocol.match(/<!-- POLICY41:START -->\n([\s\S]*?)\n<!-- POLICY41:END -->/);
 if(!match||match[1]!==policy41Table())throw Error('Game41 protocol parameter table differs from execution policy');return true;
}

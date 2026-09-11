import {JEU42_POLICY as P} from './jeu42-policy.mjs';
import {JEU37_POLICY,confidenceProfile} from './jeu37-policy.mjs';
export function policy42Table(){
 const v=confidenceProfile('fixed100');
 if(P.targetR!==JEU37_POLICY.rr||P.riskMaximumUSD!==v.maxRisk||P.dailyLossUSD!==v.dailyLoss)throw Error('Game42 declared policy differs from execution');
 return ['| Paramètre | Valeur figée |','| --- | --- |',
 ['Début inclus',P.from],['Fin exclue',P.end],['Marché du nouveau veto',P.market],['Séances de volume de référence',P.referenceVolumeSessions],['Précision du volume relatif',P.relativeVolumeScale],['Sélection des bougies de retour',P.pullbackSelection],['Veto',P.veto],['Volume manquant',P.missingVolumeAction],['Volume de confirmation',P.confirmationVolume],['Cible brute R',P.targetR],['Risque maximal USD',P.riskMaximumUSD],['Limite journalière USD',P.dailyLossUSD],['Compte initial USD',P.accountInitialUSD],['Réinitialisation',P.reset],['Séances attendues',P.expectedSessions],['Séances disponibles',P.availableCommonSessions],['Relectures',P.executionCount],['Témoins exacts',P.exactControls],['Préfixes compte / filtre / contexte',`${P.accountPrefixes} / ${P.filterPrefixes} / ${P.contextPrefixes}`],['Nouvelle configuration',P.newConfigurations],['Activation autorisée',P.executionAllowed]
 ].map(row=>Array.isArray(row)?`| ${row[0]} | ${row[1]} |`:row).join('\n');
}
export function verifyPolicy42Protocol(protocol){
 const match=protocol.match(/<!-- POLICY42:START -->\n([\s\S]*?)\n<!-- POLICY42:END -->/);
 if(!match||match[1]!==policy42Table())throw Error('Game42 protocol parameter table differs from execution policy');return true;
}

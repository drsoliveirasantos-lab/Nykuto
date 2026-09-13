import {JEU37_POLICY,confidenceProfile} from './jeu37-policy.mjs';
import {accountProfile} from './jeu33-policy.mjs';
import {JEU40_POLICY as extension} from './jeu40-policy.mjs';

// Read the inherited execution parameters, not a second handwritten set.
export function policy40Table(){
 const p=JEU37_POLICY,v=confidenceProfile('fixed100'),a=accountProfile(p.account);
 if(extension.accountInitialUSD!==a.initial||extension.riskMaximumUSD!==v.maxRisk||extension.dailyLossUSD!==v.dailyLoss||extension.targetR!==p.rr||extension.variant!==v.id)throw Error('Jeu40 declared policy differs from inherited execution');
 return ['| Paramètre | Valeur figée |','| --- | --- |',
  ['Début inclus',extension.from],['Fin exclue',extension.end],['Séances attendues',extension.expectedSessions],['Séances communes disponibles',extension.availableCommonSessions],['Relectures',extension.executionCount],
  ['Compte initial USD',a.initial],['Profil',v.id],['Risque maximal par trade USD',v.maxRisk],
  ['Limite de perte journalière USD',v.dailyLoss],['Trades maximum par jour',p.maxTradesPerDay],
  ['Positions simultanées maximum',p.maxPositions],['Cible R',p.rr],['Micros maximum',p.maxMicroContracts],
  ['Réinitialisation',p.reset],['Marché exclu',p.excluded],['Objectif mensuel USD',p.monthlyProfitTargetUSD],
  ['Objectif personnel EUR',p.personalGoalEUR],['Change USD par EUR',p.usdPerEUR],['Part du trader',p.traderShare],
  ['Continuer après objectif personnel',p.continueAfterPersonalGoal],['Activation autorisée',p.executionAllowed]
 ].map(row=>Array.isArray(row)?`| ${row[0]} | ${row[1]} |`:row).join('\n');
}
export function verifyPolicy40Protocol(protocol){
 const match=protocol.match(/<!-- POLICY40:START -->\n([\s\S]*?)\n<!-- POLICY40:END -->/);
 if(!match||match[1]!==policy40Table())throw Error('Jeu40 protocol parameter table differs from execution policy');
 return true;
}

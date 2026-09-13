import {JEU24_SCENARIOS} from './jeu24-policy.mjs';
import {JEU23_SCENARIOS} from './jeu23-policy.mjs';
import {simulateAdmission} from './jeu23-engine.mjs';
import {filterCombinedSignals} from './jeu24-context.mjs';
export function simulateConfluence(candles,signals,scenario,product,bounds,costFactor=1,account=true){
  const p=JEU24_SCENARIOS.find(s=>s.id===scenario.id);
  if(!p||p.riskPerTrade!==scenario.riskPerTrade||p.dailyLoss!==scenario.dailyLoss||scenario.guarded!==true)throw new Error('Invalid confluence profile');
  const admitted=filterCombinedSignals(candles,signals,product).signals;
  return simulateAdmission(candles,admitted,JEU23_SCENARIOS.find(s=>s.riskPerTrade===p.riskPerTrade),product,bounds,costFactor,account);
}

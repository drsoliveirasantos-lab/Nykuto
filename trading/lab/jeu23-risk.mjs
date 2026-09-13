import { JEU23_POLICY, JEU23_SCENARIOS } from './jeu23-policy.mjs';
const cents=n=>Math.round(n*100)/100;
export function riskProfile(scenario){
  const profile=JEU23_SCENARIOS.find(p=>p.id===scenario.id);
  if(!profile||scenario.guarded!==true||profile.riskPerTrade!==scenario.riskPerTrade||profile.dailyLoss!==scenario.dailyLoss)throw new Error('Invalid risk profile');
  return profile;
}
export function riskGate({balance,floor,dayStart,riskDollars,costDollars,account},scenario){
  const p=riskProfile(scenario);
  if(![balance,floor,dayStart,riskDollars,costDollars].every(Number.isFinite)||riskDollars<=0||costDollars<0)throw new Error('Invalid risk budget');
  const loss=cents(riskDollars+costDollars);
  if(loss>p.riskPerTrade)return 'tradeRisk';
  if(balance-loss<dayStart-p.dailyLoss)return 'dailyBudget';
  if(account&&balance-loss<floor+JEU23_POLICY.floorReserve)return 'floorReserve';
  return null;
}
export function riskFill(product, position, bar, balance, floor, dayStart, guarded, account, policy) {
  const sign = position.side === 'Long' ? 1 : -1;
  const equity = price => cents(balance + sign * (price - position.entry) * product.multiplier - position.costDollars);
  const adverseTick = price => sign === 1 ? Math.floor(price / product.tick + 1e-9) * product.tick : Math.ceil(price / product.tick - 1e-9) * product.tick;
  const levelPrice = level => adverseTick(position.entry + sign * (level - balance + position.costDollars) / product.multiplier);
  const levels = [{ price: position.stop, reason: 'Stop', priority: 2 }];
  if (account) levels.push({ price: levelPrice(floor), reason: 'MLL', priority: 0 });
  if (guarded) levels.push({ price: levelPrice(dayStart - policy.dailyLoss), reason: 'Daily limit', priority: 1 });
  levels.sort((a, b) => sign * (b.price - a.price) || a.priority - b.priority);
  const adverse = levels[0], targetTouched = sign === 1 ? bar.high >= position.target : bar.low <= position.target;
  if (account && equity(bar.open) <= floor) return { price: bar.open, reason: 'MLL gap', ambiguous: false };
  if (guarded && equity(bar.open) <= dayStart - policy.dailyLoss) return { price: bar.open, reason: 'Daily gap', ambiguous: false };
  if (sign === 1 ? bar.open <= adverse.price : bar.open >= adverse.price) return { price: bar.open, reason: 'Stop gap', ambiguous: false };
  if (sign === 1 ? bar.open >= position.target : bar.open <= position.target) return { price: position.target, reason: 'Target open', ambiguous: false };
  if (sign === 1 ? bar.low <= adverse.price : bar.high >= adverse.price) return { price: adverse.price, reason: adverse.reason, ambiguous: targetTouched };
  if (targetTouched) return { price: position.target, reason: 'Target', ambiguous: false };
  return null;
}

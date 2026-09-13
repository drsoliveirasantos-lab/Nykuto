import { JEU28_POLICY } from './jeu28-policy.mjs';
const cents = n => Math.round(n * 100) / 100;
// Call only after processing the existing stop/target on this completed bar.
// The returned stop applies to the NEXT bar; the initial risk is never reduced.
export function closedBreakEven(position, bar, product) {
  if (position.breakEvenAt !== null) return null;
  const sign = position.side === 'Long' ? 1 : -1;
  if (sign * (bar.close - position.entry) + 1e-9 < position.risk * JEU28_POLICY.breakEvenTriggerR) return null;
  const ticks = Math.ceil(position.costDollars / (product.tick * product.multiplier) - 1e-9);
  const stop = cents(position.entry + sign * ticks * product.tick);
  // Never loosen a stop or cross the fixed target/current close.
  if (sign * (stop - position.stop) <= 0 || sign * (position.target - stop) <= 0 || sign * (bar.close - stop) <= 0) return null;
  return { stop, breakEvenAt: bar.time + 300 };
}

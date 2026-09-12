// Nykuto V14.6 fidelity layer.
// This module turns already-measured research findings into deterministic annotations.
// It does NOT fit model weights, change entry eligibility, size risk, or authorize execution.

export const V14_6_FIDELITY_POLICY = Object.freeze({
  version: 'v14.6-fidelity-priority-v1',
  swingClearAtr: 0.20,
  strongBreakAtr: 0.30,
  reversalWatchBars: 8,
  priorityThreshold: 5.0,
  weights: Object.freeze({
    reaction: 2.0,
    participation: 1.5,
    htf: 1.0,
    momentum: 0.5,
    impulse: 0.5,
    genericStructure: 0.0
  }),
  researchOnly: true,
  probability: false,
  hardGate: false,
  autoTune: false,
  executionAllowed: false
});

const finiteOrNull = value => Number.isFinite(value) ? value : null;
const flag = value => value === true;

export function fidelityPriorityScore(families = {}) {
  const w = V14_6_FIDELITY_POLICY.weights;
  const score =
    (flag(families.reaction) ? w.reaction : 0) +
    (flag(families.participation) ? w.participation : 0) +
    (flag(families.htf) ? w.htf : 0) +
    (flag(families.momentum) ? w.momentum : 0) +
    (flag(families.impulse) ? w.impulse : 0);
  return {
    score,
    maximum: w.reaction + w.participation + w.htf + w.momentum + w.impulse,
    priority: score >= V14_6_FIDELITY_POLICY.priorityThreshold,
    probability: null,
    changesAdmission: false
  };
}

export function structureTier({mss=false, bos=false, basicSwing=false} = {}) {
  if (flag(mss) || flag(bos)) return 'CONFIRMED';
  if (flag(basicSwing)) return 'BASIC';
  return 'NONE';
}

export function breakStrength(breakAtr) {
  const value = finiteOrNull(breakAtr);
  return {
    breakAtr: value,
    tag: value !== null && value >= V14_6_FIDELITY_POLICY.strongBreakAtr ? 'STRONG' : 'NORMAL',
    changesAdmission: false
  };
}

export function swingScale(deltaAtr) {
  const value = finiteOrNull(deltaAtr);
  return {
    deltaAtr: value,
    tag: value !== null && value >= V14_6_FIDELITY_POLICY.swingClearAtr ? 'CLEAR' : 'MICRO',
    changesAdmission: false
  };
}

export function reversalWatch({side, barsSinceConfirmedLL=null, barsSinceConfirmedHH=null} = {}) {
  if (!['BUY','SELL'].includes(side)) throw new Error('side must be BUY or SELL');
  const age = side === 'BUY' ? finiteOrNull(barsSinceConfirmedLL) : finiteOrNull(barsSinceConfirmedHH);
  return {
    active: age !== null && age >= 0 && age < V14_6_FIDELITY_POLICY.reversalWatchBars,
    age,
    source: side === 'BUY' ? 'confirmed-LL' : 'confirmed-HH',
    causal: true,
    changesAdmission: false
  };
}

export function annotateFidelity({
  side,
  families,
  mss=false,
  bos=false,
  basicSwing=false,
  breakAtr=null,
  swingDeltaAtr=null,
  barsSinceConfirmedLL=null,
  barsSinceConfirmedHH=null
} = {}) {
  const priority = fidelityPriorityScore(families);
  const watch = reversalWatch({side, barsSinceConfirmedLL, barsSinceConfirmedHH});
  return Object.freeze({
    policyVersion: V14_6_FIDELITY_POLICY.version,
    side,
    priority,
    structureTier: structureTier({mss,bos,basicSwing}),
    break: breakStrength(breakAtr),
    swing: swingScale(swingDeltaAtr),
    reversalWatch: watch,
    researchOnly: true,
    probability: null,
    hardGate: false,
    executionAllowed: false
  });
}

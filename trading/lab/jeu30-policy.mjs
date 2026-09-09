import { JEU29_POLICY } from './jeu29-policy.mjs';
export { JEU29_PROFILES, JEU29_PRODUCTS, JEU29_RISK } from './jeu29-policy.mjs';
// Explicit user-authorized August diagnostic, not automatic opening of reserve.
export const JEU30_POLICY = Object.freeze({ ...JEU29_POLICY,
  version: 'jeu30-august-review-v1', id: 'PORTFOLIO/august-shared150',
  from: '2026-08-01', end: '2026-09-01', trainEnd: '2026-05-01', priorAttempts: 66,
  authorization: 'User requested August daily and weekly replay on 2026-09-09',
  economicRulesChanged: false, reserveStatus: 'august-consumed-by-request',
  independent: false, confirmed: false, executionAllowed: false
});

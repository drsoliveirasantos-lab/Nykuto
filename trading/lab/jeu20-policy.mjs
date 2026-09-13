import { JEU19_POLICY, JEU19_PRODUCTS, JEU19_SCENARIOS } from './jeu19-policy.mjs';
export const JEU20_POLICY = Object.freeze({...JEU19_POLICY,version:'jeu20-nativeprep-v1',warmup5:220,warmup30:220,priorAttempts:8});
export const JEU20_PRODUCTS = Object.freeze(JEU19_PRODUCTS.filter(p=>p.symbol==='MYM'));
export const JEU20_SCENARIOS = Object.freeze(JEU19_SCENARIOS.filter(s=>s.id==='pullback'));

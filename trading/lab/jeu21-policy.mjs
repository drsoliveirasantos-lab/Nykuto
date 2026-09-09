import { JEU20_POLICY } from './jeu20-policy.mjs';
import { JEU19_PRODUCTS, JEU19_SCENARIOS } from './jeu19-policy.mjs';
export const JEU21_POLICY = Object.freeze({...JEU20_POLICY,version:'jeu21-native-markets-v1',priorAttempts:9});
export const JEU21_PRODUCTS = Object.freeze(JEU19_PRODUCTS.filter(p=>['MES','MGC'].includes(p.symbol)));
export const JEU21_SCENARIOS = JEU19_SCENARIOS;

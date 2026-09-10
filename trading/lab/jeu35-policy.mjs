import {JEU34_POLICY} from './jeu34-policy.mjs';
export const JEU35_POLICY=Object.freeze({...JEU34_POLICY,version:'jeu35-market-exits-v1',excluded:'MYM',entryPolicy:'unchanged-game34-without-mym',selectionMode:'exploratory-no-automatic-promotion'});
export const JEU35_VARIANTS=Object.freeze([
 {id:'baseline',label:'Référence · 2R partout',symbol:null,targetR:2,control:true},
 {id:'mnq-3r',label:'Nasdaq · cible 3R',symbol:'MNQ',targetR:3},
 {id:'mgc-3r',label:'Or · cible 3R',symbol:'MGC',targetR:3}
].map(Object.freeze));
export function exitProfile(id){const v=JEU35_VARIANTS.find(v=>v.id===id);if(!v)throw Error('Unknown exit variant');return v;}
export function exitTerms(terms,symbol,id){const p=exitProfile(id);return p.symbol===symbol?{...terms,targetDistance:p.targetR*terms.risk}:terms;}

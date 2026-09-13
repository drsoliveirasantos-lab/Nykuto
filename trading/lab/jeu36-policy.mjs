import {JEU34_POLICY} from './jeu34-policy.mjs';
export const JEU36_POLICY=Object.freeze({...JEU34_POLICY,version:'jeu36-entry-confirmation-v1',excluded:'MYM',confirmationBars:1,latestEntryMinute:720,selectionMode:'exploratory-no-automatic-promotion'});
export const JEU36_VARIANTS=Object.freeze([
 {id:'baseline',label:'Référence · entrée actuelle',symbol:null,control:true},
 {id:'mnq-confirm',label:'Nasdaq · confirmation M5',symbol:'MNQ'},
 {id:'mes-confirm',label:'S&P · confirmation M5',symbol:'MES'}
].map(Object.freeze));
export function entryProfile(id){const v=JEU36_VARIANTS.find(v=>v.id===id);if(!v)throw Error('Unknown entry variant');return v;}

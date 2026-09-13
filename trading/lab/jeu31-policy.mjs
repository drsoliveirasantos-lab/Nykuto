export const JEU31_POLICY = Object.freeze({
  version:'jeu31-market-filters-v1', priorAttempts:67, newConfigurations:3,
  development:{start:'2026-01-01',end:'2026-05-01'}, august:{start:'2026-08-01',end:'2026-09-01'},
  rsiPeriod:14, oversold:30, overbought:70, mgcLastEntryMinuteExclusive:660,
  researchOnly:true, independent:false, confirmed:false, executionAllowed:false
});
export const JEU31_VARIANTS = Object.freeze([
  {id:'baseline',label:'Référence actuelle',mesRsi:false,mgcMorning:false},
  {id:'mes-rsi',label:'MES : éviter le RSI extrême',mesRsi:true,mgcMorning:false},
  {id:'mgc-morning',label:'MGC : entrées avant 11 h',mesRsi:false,mgcMorning:true},
  {id:'combined',label:'MES RSI + MGC avant 11 h',mesRsi:true,mgcMorning:true}
].map(Object.freeze));

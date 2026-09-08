(() => {
  'use strict';
  const KEY='nykuto-trading-strategy-lab-v1';
  const SETTINGS='nykuto-trading-settings-v1';
  const byId=id=>document.getElementById(id);
  const safe=(v,f)=>{try{return JSON.parse(v)??f}catch{return f}};
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;
  const money=new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:2});
  const fields=['strategyName','strategyAsset','strategyTimeframe','strategyRisk','strategyRR','maxTrades','maxDailyLoss','lossStreak','entryRule','exitRule'];
  const defaults={strategyName:'Stratégie test 01',strategyAsset:'SPY',strategyTimeframe:'15m',strategyRisk:'1',strategyRR:'2',maxTrades:'5',maxDailyLoss:'3',lossStreak:'3',entryRule:'',exitRule:''};

  function load(){const saved=safe(localStorage.getItem(KEY),{});fields.forEach(id=>{const el=byId(id);if(el)el.value=saved[id]??defaults[id]??''});renderRisk()}
  function snapshot(){const data={};fields.forEach(id=>{const el=byId(id);if(el)data[id]=el.value});return data}
  function renderRisk(){const settings=safe(localStorage.getItem(SETTINGS),{});const capital=finite(settings.capital)??1000;const risk=finite(byId('strategyRisk')?.value)??1;const maxDaily=finite(byId('maxDailyLoss')?.value)??3;byId('labCapital').textContent=money.format(capital);byId('labRiskAmount').textContent=money.format(capital*(risk/100));byId('labDailyLoss').textContent=money.format(capital*(risk/100)*maxDaily)}
  byId('strategyForm')?.addEventListener('input',renderRisk);
  byId('strategyForm')?.addEventListener('submit',event=>{event.preventDefault();localStorage.setItem(KEY,JSON.stringify(snapshot()));const state=byId('saveState');state.textContent='Enregistré';setTimeout(()=>{state.textContent='Local'},1400)});
  byId('resetStrategy')?.addEventListener('click',()=>{localStorage.removeItem(KEY);Object.entries(defaults).forEach(([id,value])=>{const el=byId(id);if(el)el.value=value});renderRisk()});
  load();
})();

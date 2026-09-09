import { loadKnowledge } from './knowledge-loader.mjs';
import { explainAnalysis } from './knowledge-core.mjs';
import { recordElement } from './knowledge-view.mjs';

export function createAnalysisKnowledge({panel,status,records,retry}, loader=loadKnowledge) {
  let generation=0,pending=null,latest=null;
  async function show(result,indicators){
    latest={result,indicators};const ticket=++generation;
    panel.hidden=false;records.replaceChildren();status.textContent='Recherche des fiches liées à cette lecture…';
    retry.hidden=true;
    try{
      if(!pending)pending=loader().catch(error=>{pending=null;throw error;});
      const catalogue=await pending;if(ticket!==generation)return;
      const context=explainAnalysis(catalogue,result,indicators);
      const value=context.observations.rsi;
      status.textContent=`RSI : ${value===null?'indisponible':value.toLocaleString('fr-FR',{maximumFractionDigits:2})} · ${context.observations.zone}. Fiches explicatives, sans nouveau signal. Actualités : aucun flux connecté.`;
      records.replaceChildren(...context.records.map(r=>recordElement(r,context.sources)));
    }catch(error){if(ticket!==generation)return;records.replaceChildren();status.textContent=error.message;retry.hidden=false;}
  }
  function clear(){generation++;latest=null;panel.hidden=true;records.replaceChildren();status.textContent='';retry.hidden=true;}
  retry.addEventListener('click',()=>{if(latest)show(latest.result,latest.indicators);});
  return {show,clear};
}

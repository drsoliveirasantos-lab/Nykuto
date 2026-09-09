import { loadKnowledge } from './knowledge-loader.mjs';
import { retrieveKnowledge } from './knowledge-core.mjs';
import { recordElement } from './knowledge-view.mjs';

const el=id=>document.getElementById(id);
let catalogue=null;
function render(){
  if(!catalogue)return;
  const records=retrieveKnowledge(catalogue,{query:el('knowledgeQuery').value,pack:el('knowledgePack').value,limit:250});
  el('knowledgeResults').replaceChildren(...records.map(r=>recordElement(r,catalogue.sources)));
  el('knowledgeStatus').textContent=`${records.length} fiche${records.length===1?'':'s'} trouvée${records.length===1?'':'s'}. ${records.length?'Ouvre une fiche pour lire sa définition, ses limites et ses sources.':'Essaie un autre terme.'}`;
}
async function reload(){
  catalogue=null;el('knowledgeResults').replaceChildren();el('knowledgeSummary').textContent='';
  el('knowledgeRetry').disabled=true;el('knowledgeStatus').textContent='Chargement des connaissances…';
  try{
    catalogue=await loadKnowledge();const c=catalogue.counts;
    el('knowledgeSummary').textContent=`${c.rsiConcepts} fiches RSI et tendances · ${c.priceActionConcepts} concepts de bougies et structure · ${c.newsResources} ressources de veille · cours et méthodes inclus.`;
    render();
  }catch(error){el('knowledgeStatus').textContent=error.message;}
  finally{el('knowledgeRetry').disabled=false;}
}
el('knowledgeForm').addEventListener('submit',event=>{event.preventDefault();render();});
el('knowledgeQuery').addEventListener('input',render);
el('knowledgePack').addEventListener('change',render);
el('knowledgeRetry').addEventListener('click',reload);
reload();
